import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CategoryI18nRow {
  id: string  // Это category_id в CSV
  lang: string
  name: string
  slug: string
  meta_title?: string
  meta_description?: string
  short_description?: string
  og_title?: string
  og_description?: string
  intro_text?: string
  og_image_alt?: string
  og_image_url?: string
}

async function importCategoryI18n() {
  const csvPath = path.join(process.cwd(), 'scripts', 'category_i18n.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Файл не найден: ${csvPath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  // Парсим CSV с разделителем точка с запятой
  const records: CategoryI18nRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ';',
  })

  console.log(`📊 Найдено ${records.length} записей для импорта`)

  // Шаг 1: Собираем уникальные ID категорий и создаем их, если не существуют
  const uniqueCategoryIds = [...new Set(records.map(r => r.id))]
  console.log(`\n🔍 Найдено ${uniqueCategoryIds.length} уникальных категорий`)

  let categoriesCreated = 0
  for (const categoryId of uniqueCategoryIds) {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existing) {
      // Создаем категорию с указанным ID
      await prisma.category.create({
        data: {
          id: categoryId,
          sort_order: 0, // Можно будет обновить позже
        }
      })
      categoriesCreated++
      console.log(`✅ Создана категория с ID: ${categoryId}`)
    }
  }

  console.log(`\n📦 Создано категорий: ${categoriesCreated}, уже существовало: ${uniqueCategoryIds.length - categoriesCreated}`)

  // Шаг 2: Импортируем i18n данные
  let created = 0
  let updated = 0
  let errors = 0

  for (const row of records) {
    try {
      const categoryId = row.id
      
      // Проверяем, существует ли категория (должна существовать после шага 1)
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        console.warn(`⚠️  Категория с ID ${categoryId} не найдена, пропускаем`)
        errors++
        continue
      }

      // Проверяем, существует ли уже запись
      const existing = await prisma.categoryI18n.findUnique({
        where: {
          category_id_lang: {
            category_id: categoryId,
            lang: row.lang
          }
        }
      })

      // Подготавливаем данные для создания/обновления
      const data = {
        slug: row.slug || '',
        name: row.name || '',
        meta_title: row.meta_title || null,
        meta_description: row.meta_description || null,
        short_description: row.short_description || null,
        intro_text: row.intro_text || null,
        og_title: row.og_title || null,
        og_description: row.og_description || null,
        og_image_url: row.og_image_url || null,
        og_image_alt: row.og_image_alt || null,
      }

      // Используем upsert для создания или обновления
      await prisma.categoryI18n.upsert({
        where: {
          category_id_lang: {
            category_id: categoryId,
            lang: row.lang
          }
        },
        create: {
          category_id: categoryId,
          lang: row.lang,
          ...data,
        },
        update: data
      })

      if (existing) {
        updated++
      } else {
        created++
      }

      console.log(`✅ ${categoryId}/${row.lang}: ${row.name}`)
    } catch (error: any) {
      console.error(`❌ Ошибка при импорте ${row.id}/${row.lang}:`, error.message)
      errors++
    }
  }

  console.log('\n📈 Итоги импорта:')
  console.log(`   📦 Создано категорий: ${categoriesCreated}`)
  console.log(`   ✅ Создано i18n записей: ${created}`)
  console.log(`   🔄 Обновлено i18n записей: ${updated}`)
  console.log(`   ❌ Ошибок: ${errors}`)
}

importCategoryI18n()
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })