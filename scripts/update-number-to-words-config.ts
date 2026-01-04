/**
 * Скрипт для обновления конфигурации инструмента "Numbers to Words Converter"
 * Обновляет config_json в tool_config и inputs_json в tool_i18n для tool_id = '1001'
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ConfigData {
  config_json: any
  inputs_json: any[]
}

async function main() {
  console.log('🚀 Начинаем обновление конфигурации для Numbers to Words Converter...\n')

  // Читаем JSON файл
  const configPath = path.join(__dirname, 'number-to-words-config.json')
  const configData: ConfigData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  const toolId = '1001'

  try {
    // 1. Обновляем или создаем запись в tool_config
    console.log('📝 Обновляем tool_config...')
    const toolConfig = await prisma.toolConfig.upsert({
      where: {
        tool_id: toolId
      },
      update: {
        config_json: configData.config_json
      },
      create: {
        tool_id: toolId,
        config_json: configData.config_json
      }
    })
    console.log(`✅ tool_config обновлен для tool_id = ${toolId}\n`)

    // 2. Обновляем inputs_json для всех языков в tool_i18n
    console.log('📝 Обновляем inputs_json для всех языков...')
    const updated = await prisma.toolI18n.updateMany({
      where: {
        tool_id: toolId
      },
      data: {
        inputs_json: configData.inputs_json
      }
    })
    console.log(`✅ Обновлено ${updated.count} записей в tool_i18n для tool_id = ${toolId}\n`)

    // 3. Показываем список обновленных языков
    const toolI18nRecords = await prisma.toolI18n.findMany({
      where: {
        tool_id: toolId
      },
      select: {
        lang: true,
        slug: true
      }
    })

    console.log('📋 Обновленные языки:')
    toolI18nRecords.forEach(record => {
      console.log(`   - ${record.lang}: ${record.slug}`)
    })

    console.log('\n✨ Обновление завершено успешно!')
  } catch (error: any) {
    console.error('❌ Ошибка при обновлении:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

