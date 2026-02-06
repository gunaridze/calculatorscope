import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function updateBMICalculatorConfig() {
    try {
        // Читаем JSON конфиг
        const configPath = path.join(__dirname, 'bmi-calculator-config.json')
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

        const toolId = '1003'

        // 1. Обновляем tool_config
        console.log('Updating tool_config...')
        await prisma.toolConfig.upsert({
            where: { tool_id: toolId },
            update: {
                // @ts-ignore - TypeScript не всегда правильно типизирует JSON из Prisma
                config_json: configData.config_json
            },
            create: {
                tool_id: toolId,
                // @ts-ignore
                config_json: configData.config_json
            }
        })

        // 2. Обновляем tool_i18n для всех языков
        console.log('Updating tool_i18n...')
        const languages = ['en', 'ru', 'de', 'es', 'fr', 'it', 'pl', 'lv']
        
        for (const lang of languages) {
            const inputsJson = configData.inputs_json[lang] || configData.inputs_json['en'] // Fallback на en
            
            await prisma.toolI18n.updateMany({
                where: {
                    tool_id: toolId,
                    lang: lang
                },
                data: {
                    // @ts-ignore - Prisma не всегда правильно типизирует JSON поля
                    inputs_json: inputsJson
                }
            })
            
            console.log(`Updated tool_i18n for ${lang}`)
        }

        console.log('✅ BMI Calculator config updated successfully!')
    } catch (error) {
        console.error('❌ Error updating BMI Calculator config:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

updateBMICalculatorConfig()
