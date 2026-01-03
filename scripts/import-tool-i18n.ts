/**
 * Скрипт для импорта/обновления записей tool_i18n из JSON файла
 * 
 * ВАЖНО: Перед запуском убедитесь, что миграция применена:
 *   npx prisma migrate deploy
 * 
 * Использование:
 *   npx tsx scripts/import-tool-i18n.ts
 * 
 * Файл: scripts/tool_i18n (JSON массив)
 * 
 * Логика:
 * 1. Группирует записи по полю `id` (ID инструмента в таблице tools)
 * 2. Для каждого уникального `id` создает или находит существующий `tool` с таким ID
 * 3. Для каждой записи проверяет существование по комбинации `lang + slug`
 * 4. Если запись существует - обновляет её
 * 5. Если запись не существует - создает новую (id будет автоинкремент, начиная с 1000)
 * 
 * Поля в JSON:
 * - id: string | number (ID инструмента в таблице tools - используется как кастомный ID)
 * - type: string (тип инструмента в таблице tools: converter, calculator и т.д.)
 * - lang: string (язык: en, ru, de и т.д.)
 * - slug: string (уникальный slug для языка)
 * - остальные поля соответствуют полям таблицы tool_i18n
 * 
 * Структура БД:
 * - tools.id: String (кастомный ID из JSON)
 * - tool_i18n.id: Int (автоинкремент, начинается с 1000)
 * - tool_i18n.tool_id: String (ссылка на tools.id)
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ToolI18nRow {
  id: string | number  // ID инструмента в таблице tools (из JSON)
  type?: string  // Тип инструмента в таблице tools (converter, calculator и т.д.)
  lang: string
  slug: string
  title: string
  h1?: string
  meta_title?: string
  meta_description?: string
  meta_robots?: string
  canonical_path?: string | null
  short_answer?: string
  intro_text?: string
  key_points_json?: any
  inputs_json?: any
  outputs_json?: any
  examples_json?: any
  formula_md?: string
  assumptions_md?: string
  faq_json?: any
  howto_json?: any
  content_blocks_json?: any
  schema_json?: any
  og_title?: string
  og_description?: string
  og_image_url?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image_url?: string
  is_popular?: number
}

async function importToolI18n() {
  const jsonPath = path.join(process.cwd(), 'scripts', 'tool_i18n')
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Файл не найден: ${jsonPath}`)
    process.exit(1)
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  
  let records: ToolI18nRow[]
  try {
    records = JSON.parse(jsonContent)
  } catch (error) {
    console.error(`❌ Ошибка парсинга JSON:`, error)
    process.exit(1)
  }

  if (!Array.isArray(records)) {
    console.error(`❌ Файл должен содержать массив объектов`)
    process.exit(1)
  }

  console.log(`📊 Найдено ${records.length} записей для импорта\n`)

  let created = 0
  let updated = 0
  let errors = 0
  let toolsCreated = 0

  // Группируем записи по id (ID инструмента в таблице tools)
  const toolIds = Array.from(new Set(records.map(r => r.id.toString())))
  console.log(`🔍 Найдено ${toolIds.length} уникальных инструментов\n`)

  // Создаем или находим инструменты
  // Map: ID из JSON -> ID в таблице tools (String)
  const toolIdMap = new Map<string, string>()

  for (const toolIdFromJson of toolIds) {
    try {
      const recordsWithThisId = records.filter(r => r.id.toString() === toolIdFromJson)
      if (recordsWithThisId.length === 0) continue

      const firstRecord = recordsWithThisId[0]
      const toolType = firstRecord.type || 'calculator'
      
      // Проверяем, существует ли tool с таким ID
      const existingTool = await prisma.tool.findUnique({
        where: {
          id: toolIdFromJson
        }
      })

      if (existingTool) {
        // Используем существующий tool
        toolIdMap.set(toolIdFromJson, existingTool.id)
        console.log(`✅ Найден существующий tool с ID ${toolIdFromJson}`)
      } else {
        // Создаем новый tool с кастомным ID из JSON
        const newTool = await prisma.tool.create({
          data: {
            id: toolIdFromJson,  // Используем ID из JSON
            type: toolType,
            status: 'published',
            engine: 'json'
          }
        })
        toolIdMap.set(toolIdFromJson, newTool.id)
        toolsCreated++
        console.log(`✅ Создан новый tool с ID ${toolIdFromJson} (type: ${toolType})`)
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при обработке tool ID ${toolIdFromJson}:`, error.message)
      errors++
    }
  }

  console.log(`\n📦 Создано инструментов: ${toolsCreated}, найдено существующих: ${toolIds.length - toolsCreated}\n`)

  // Импортируем tool_i18n записи
  for (const row of records) {
    try {
      const toolIdFromJson = row.id.toString()
      const toolId = toolIdMap.get(toolIdFromJson)

      if (!toolId) {
        console.warn(`⚠️  Tool ID ${toolIdFromJson} не найден, пропускаем запись ${row.lang}/${row.slug}`)
        errors++
        continue
      }

      // Проверяем, существует ли уже запись с такой комбинацией lang + slug
      const existing = await prisma.toolI18n.findUnique({
        where: {
          lang_slug: {
            lang: row.lang,
            slug: row.slug
          }
        }
      })

      // Функция для валидации и нормализации JSON полей
      const normalizeJsonField = (value: any): any => {
        if (value === null || value === undefined) return null
        if (typeof value === 'string') {
          // Если это строка "..." или пустая строка, возвращаем null
          if (value === '...' || value.trim() === '') return null
          // Пытаемся распарсить как JSON
          try {
            return JSON.parse(value)
          } catch {
            // Если не JSON, возвращаем null
            return null
          }
        }
        // Если это уже объект/массив, возвращаем как есть
        if (typeof value === 'object') {
          return value
        }
        return null
      }

      // Подготавливаем данные для создания/обновления
      const data: any = {
        tool_id: toolId,
        lang: row.lang,
        slug: row.slug,
        title: row.title,
        h1: row.h1 || null,
        meta_title: row.meta_title || null,
        meta_description: row.meta_description || null,
        meta_robots: row.meta_robots || 'index,follow',
        canonical_path: row.canonical_path || null,
        short_answer: row.short_answer || null,
        intro_text: row.intro_text || null,
        key_points_json: normalizeJsonField(row.key_points_json),
        inputs_json: normalizeJsonField(row.inputs_json),
        outputs_json: normalizeJsonField(row.outputs_json),
        examples_json: normalizeJsonField(row.examples_json),
        formula_md: row.formula_md || null,
        assumptions_md: row.assumptions_md || null,
        faq_json: normalizeJsonField(row.faq_json),
        howto_json: normalizeJsonField(row.howto_json),
        content_blocks_json: normalizeJsonField(row.content_blocks_json),
        schema_json: normalizeJsonField(row.schema_json),
        og_title: row.og_title || null,
        og_description: row.og_description || null,
        og_image_url: row.og_image_url || null,
        twitter_title: row.twitter_title || null,
        twitter_description: row.twitter_description || null,
        twitter_image_url: row.twitter_image_url || null,
        is_popular: row.is_popular || 0,
      }

      // Используем upsert для создания или обновления
      if (existing) {
        // Обновляем существующую запись (без tool_id, так как он не должен меняться)
        const { tool_id, ...updateData } = data
        await prisma.toolI18n.update({
          where: {
            lang_slug: {
              lang: row.lang,
              slug: row.slug
            }
          },
          data: updateData
        })
        updated++
        console.log(`🔄 Обновлено: ${row.lang}/${row.slug} - ${row.title}`)
      } else {
        // Создаем новую запись
        await prisma.toolI18n.create({
          data
        })
        created++
        console.log(`✅ Создано: ${row.lang}/${row.slug} - ${row.title}`)
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при импорте ${row.lang}/${row.slug}:`, error.message)
      if (error.meta) {
        console.error(`   Детали:`, JSON.stringify(error.meta, null, 2))
      }
      errors++
    }
  }

  console.log('\n📈 Итоги импорта:')
  console.log(`   📦 Создано инструментов: ${toolsCreated}`)
  console.log(`   ✅ Создано i18n записей: ${created}`)
  console.log(`   🔄 Обновлено i18n записей: ${updated}`)
  console.log(`   ❌ Ошибок: ${errors}`)
}

importToolI18n()
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

