import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CategoryRow {
  id: string
  parent_id: string
  sort_order: string
}

async function importCategories() {
  const csvPath = path.join(process.cwd(), 'scripts', 'categories.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Файл не найден: ${csvPath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  // Парсим CSV с разделителем точка с запятой
  const records: CategoryRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ';',
    relax_column_count: true,
  })

  console.log(`📊 Найдено ${records.length} записей в CSV`)
  
  // Проверяем первую запись для отладки
  if (records.length > 0) {
    console.log('🔍 Пример первой записи:', records[0])
    console.log('🔍 Ключи первой записи:', Object.keys(records[0]))
  }

  // Собираем уникальные категории (убираем дубликаты)
  const categoryMap = new Map<string, { parent_id: string | null, sort_order: number }>()
  
  for (const row of records) {
    if (!row.id || !row.id.trim()) {
      continue
    }
    
    const categoryId = row.id.trim()
    const parentId = (row.parent_id && row.parent_id.trim()) ? row.parent_id.trim() : null
    const sortOrder = parseInt(row.sort_order?.trim() || '0') || 0

    const existing = categoryMap.get(categoryId)
    if (!existing) {
      categoryMap.set(categoryId, { parent_id: parentId, sort_order: sortOrder })
    } else {
      // Если есть дубликат, обновляем sort_order если он больше
      if (sortOrder > existing.sort_order) {
        existing.sort_order = sortOrder
      }
      // Обновляем parent_id если он был пустой, а теперь есть значение
      if (!existing.parent_id && parentId) {
        existing.parent_id = parentId
      }
    }
  }

  const uniqueCategories = Array.from(categoryMap.entries())
  console.log(`🔍 Найдено ${uniqueCategories.length} уникальных категорий после дедупликации`)

  let created = 0
  let updated = 0
  let errors = 0

  // Сортируем по ID для последовательной обработки
  uniqueCategories.sort((a, b) => {
    const idA = parseInt(a[0]) || 0
    const idB = parseInt(b[0]) || 0
    return idA - idB
  })

  for (const [categoryId, data] of uniqueCategories) {
    try {
      const { parent_id, sort_order } = data

      // Проверяем, существует ли категория
      const existing = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      // Если есть parent_id, проверяем, что родительская категория существует
      if (parent_id) {
        const parent = await prisma.category.findUnique({
          where: { id: parent_id }
        })
        
        if (!parent) {
          console.warn(`⚠️  Родительская категория с ID ${parent_id} не найдена для категории ${categoryId}, создаем без parent_id`)
        }
      }

      if (existing) {
        // Обновляем существующую категорию
        await prisma.category.update({
          where: { id: categoryId },
          data: {
            parent_id: parent_id || null,
            sort_order: sort_order,
          }
        })
        updated++
        console.log(`🔄 Обновлена: ID=${categoryId}, parent=${parent_id || 'null'}, sort_order=${sort_order}`)
      } else {
        // Создаем новую категорию
        await prisma.category.create({
          data: {
            id: categoryId,
            parent_id: parent_id || null,
            sort_order: sort_order,
          }
        })
        created++
        console.log(`✅ Создана: ID=${categoryId}, parent=${parent_id || 'null'}, sort_order=${sort_order}`)
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при импорте категории ${categoryId}:`, error.message)
      console.error('   Детали ошибки:', error)
      errors++
    }
  }

  console.log('\n📈 Итоги импорта:')
  console.log(`   ✅ Создано: ${created}`)
  console.log(`   🔄 Обновлено: ${updated}`)
  console.log(`   ❌ Ошибок: ${errors}`)
}

importCategories()
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })