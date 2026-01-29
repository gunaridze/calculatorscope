/**
 * Скрипт для обновления конфигурации Text Case Converter (tool_id = '1002')
 * Обновляет config_json в tool_config и inputs_json в tool_i18n
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function updateTextCaseConverterConfig() {
    try {
        // 1. Читаем конфигурацию из JSON файла
        const configPath = path.join(__dirname, 'text-case-converter-config.json')
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

        console.log('📝 Обновляем конфигурацию для Text Case Converter (tool_id: 1002)...')

        // 2. Обновляем config_json в tool_config
        console.log('📝 Обновляем config_json в tool_config...')
        await prisma.toolConfig.upsert({
            where: { tool_id: '1002' },
            update: {
                config_json: configData.config_json
            },
            create: {
                tool_id: '1002',
                config_json: configData.config_json
            }
        })
        console.log('✅ config_json обновлен')

        // 3. Обновляем inputs_json для всех языков в tool_i18n
        console.log('📝 Обновляем inputs_json для всех языков...')
        const languages = ['en', 'ru', 'de', 'es', 'fr', 'it', 'pl', 'lv']
        
        for (const lang of languages) {
            const inputsJson = configData.inputs_json[lang]
            if (inputsJson) {
                await prisma.toolI18n.updateMany({
                    where: {
                        tool_id: '1002',
                        lang: lang
                    },
                    data: {
                        // @ts-ignore - Prisma не всегда правильно типизирует JSON поля
                        inputs_json: inputsJson
                    }
                })
                console.log(`✅ inputs_json обновлен для языка: ${lang}`)
            }
        }

        console.log('✅ Конфигурация успешно обновлена!')
    } catch (error) {
        console.error('❌ Ошибка при обновлении конфигурации:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

updateTextCaseConverterConfig()
    .then(() => {
        console.log('✅ Скрипт завершен успешно')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Ошибка выполнения скрипта:', error)
        process.exit(1)
    })
