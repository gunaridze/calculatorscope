/**
 * Скрипт для импорта/обновления записей tool_i18n из JSON файла
 * 
 * Использование:
 *   npx tsx scripts/import-tool-i18n.ts
 * 
 * Файл: scripts/tool_i18n (JSON массив)
 * 
 * Логика:
 * 1. Группирует записи по полю `id` (внешний идентификатор инструмента)
 * 2. Для каждого уникального `id` создает или находит существующий `tool`
 * 3. Для каждой записи проверяет существование по комбинации `lang + slug`
 * 4. Если запись существует - обновляет её
 * 5. Если запись не существует - создает новую
 * 
 * Поля в JSON:
 * - id: число (внешний идентификатор инструмента, используется для группировки)
 * - type: строка (тип инструмента: converter, calculator и т.д.)
 * - lang: строка (язык: en, ru, de и т.д.)
 * - slug: строка (уникальный slug для языка)
 * - остальные поля соответствуют полям таблицы tool_i18n
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ToolI18nRow {
  id: number  // Внешний ID инструмента (может быть tool_id или внешний идентификатор)
  type?: string  // Тип инструмента (converter, calculator и т.д.)
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

  // Группируем записи по id (внешний идентификатор) для создания инструментов
  const toolIds = Array.from(new Set(records.map(r => r.id.toString())))
  console.log(`🔍 Найдено ${toolIds.length} уникальных инструментов\n`)

  // Создаем или находим инструменты
  // Map: внешний ID -> UUID tool_id
  const toolIdMap = new Map<string, string>()

  for (const externalId of toolIds) {
    try {
      // Ищем любую существующую запись tool_i18n с таким slug (в любом языке)
      // чтобы найти tool_id, если инструмент уже существует
      const recordsWithThisId = records.filter(r => r.id.toString() === externalId)
      if (recordsWithThisId.length === 0) continue

      const firstRecord = recordsWithThisId[0]
      
      // Пытаемся найти tool через существующий tool_i18n с таким slug
      const existingToolI18n = await prisma.toolI18n.findFirst({
        where: {
          slug: firstRecord.slug
        },
        include: {
          tool: true
        }
      })

      if (existingToolI18n) {
        // Используем существующий tool
        toolIdMap.set(externalId, existingToolI18n.tool_id)
        console.log(`✅ Найден существующий tool для ID ${externalId}: ${existingToolI18n.tool_id}`)
      } else {
        // Создаем новый tool
        const toolType = firstRecord.type || 'calculator'
        const newTool = await prisma.tool.create({
          data: {
            type: toolType,
            status: 'published',
            engine: 'json'
          }
        })
        toolIdMap.set(externalId, newTool.id)
        toolsCreated++
        console.log(`✅ Создан новый tool для ID ${externalId}: ${newTool.id}`)
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при обработке tool ID ${externalId}:`, error.message)
      errors++
    }
  }

  console.log(`\n📦 Создано инструментов: ${toolsCreated}, найдено существующих: ${toolIds.length - toolsCreated}\n`)

  // Импортируем tool_i18n записи
  for (const row of records) {
    try {
      const externalId = row.id.toString()
      const toolId = toolIdMap.get(externalId)

      if (!toolId) {
        console.warn(`⚠️  Tool ID ${externalId} не найден, пропускаем запись ${row.lang}/${row.slug}`)
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
        key_points_json: row.key_points_json || null,
        inputs_json: row.inputs_json || null,
        outputs_json: row.outputs_json || null,
        examples_json: row.examples_json || null,
        formula_md: row.formula_md || null,
        assumptions_md: row.assumptions_md || null,
        faq_json: row.faq_json || null,
        howto_json: row.howto_json || null,
        content_blocks_json: row.content_blocks_json || null,
        schema_json: row.schema_json || null,
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

