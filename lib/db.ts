import { PrismaClient } from '@prisma/client'

// Паттерн Singleton для Prisma (чтобы не плодить подключения при пересборке)
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Функция получения инструмента по слагу и языку
export async function getToolData(slug: string, lang: string) {
    const toolI18n = await prisma.toolI18n.findUnique({
        where: {
            lang_slug: { // Используем составной ключ (lang + slug)
                lang: lang,
                slug: slug,
            },
        },
        include: {
            tool: {
                include: {
                    config: true, // Забираем формулы
                    categories: { // Забираем категории для хлебных крошек
                        include: {
                            category: {
                                include: {
                                    i18n: {
                                        where: { lang: lang }
                                    }
                                }
                            }
                        }
                    }
                },
            },
        },
    })

    return toolI18n
}