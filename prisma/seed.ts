import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Начинаем посев данных...')

    // 1. Создаем категории
    const catConverters = await prisma.category.create({
        data: {
            sort_order: 10,
            i18n: {
                create: [
                    { lang: 'en', slug: 'converters', name: 'Converters' },
                    { lang: 'ru', slug: 'konvertery', name: 'Конвертеры' },
                    { lang: 'lv', slug: 'parveidotaji', name: 'Pārveidotāji' },
                ],
            },
        },
    })

    // 2. Создаем инструмент "CM to Inches"
    const toolCmToInch = await prisma.tool.create({
        data: {
            type: 'converter',
            status: 'published',
            engine: 'json',

            // Логика формулы (одинаковая для всех)
            config: {
                create: {
                    config_json: {
                        engine: "simple_formula",
                        inputs: [{ key: "val_cm", type: "number", default: 10 }],
                        outputs: [{ key: "val_inch", type: "number", precision: 4 }],
                        formulas: { "val_inch": "val_cm / 2.54" }
                    }
                }
            },

            // Тексты для разных языков
            i18n: {
                create: [
                    {
                        lang: 'en',
                        slug: 'cm-to-inches',
                        title: 'Centimeters to Inches Converter',
                        meta_description: 'Convert cm to inches easily.',
                        h1: 'Centimeters to Inches',
                        body_blocks_json: { "content": "Best tool to convert centimeters to inches." },
                        interface_json: {
                            "inputs": { "val_cm": { "label": "Centimeters (cm)" } },
                            "outputs": { "val_inch": { "label": "Inches (in)" } },
                            "cta": "Calculate"
                        }
                    },
                    {
                        lang: 'ru',
                        slug: 'santimetry-v-dyujmy',
                        title: 'Конвертер сантиметров в дюймы',
                        meta_description: 'Быстрый перевод см в дюймы онлайн.',
                        h1: 'Сантиметры в дюймы',
                        body_blocks_json: { "content": "Лучший инструмент для перевода см в дюймы." },
                        interface_json: {
                            "inputs": { "val_cm": { "label": "Сантиметры (см)" } },
                            "outputs": { "val_inch": { "label": "Дюймы (in)" } },
                            "cta": "Рассчитать"
                        }
                    },
                    {
                        lang: 'lv',
                        slug: 'centimetri-uz-collam',
                        title: 'Centimetri uz collām',
                        meta_description: 'Ātri pārvērst cm uz collām.',
                        h1: 'Centimetri uz collām',
                        body_blocks_json: { "content": "Labākais rīks..." },
                        interface_json: {
                            "inputs": { "val_cm": { "label": "Centimetri (cm)" } },
                            "outputs": { "val_inch": { "label": "Collas (in)" } },
                            "cta": "Aprēķināt"
                        }
                    }
                ],
            },

            categories: {
                create: {
                    category_id: catConverters.id
                }
            }
        },
    })

    console.log(`✅ Создан инструмент с ID: ${toolCmToInch.id}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })