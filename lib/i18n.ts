import { prisma } from './db'

/**
 * Получает URL для переключения языка на текущей странице
 */
export async function getLanguageSwitchUrl(
    currentLang: string,
    targetLang: string,
    pathname: string
): Promise<string> {
    // Если переключаемся на тот же язык - возвращаем текущий URL
    if (currentLang === targetLang) {
        return pathname
    }

    // Главная страница
    if (pathname === `/${currentLang}` || pathname === `/${currentLang}/`) {
        return `/${targetLang}`
    }

    // Парсим путь: /{lang}/{category?}/{tool?}
    const pathParts = pathname.replace(`/${currentLang}`, '').split('/').filter(Boolean)

    // Страница с одним сегментом: может быть статическая страница или категория
    if (pathParts.length === 1) {
        const slug = pathParts[0]

        // Сначала проверяем, является ли это статической страницей
        // Ищем по текущему slug и языку в PageI18n
        const pageI18n = await prisma.pageI18n.findUnique({
            where: {
                lang_slug: {
                    lang: currentLang,
                    slug: slug
                }
            },
            include: {
                page: {
                    include: {
                        i18n: {
                            where: { lang: targetLang },
                            select: { slug: true }
                        }
                    }
                }
            }
        })

        // Если это статическая страница
        if (pageI18n) {
            if (pageI18n.page.i18n[0]?.slug) {
                return `/${targetLang}/${pageI18n.page.i18n[0].slug}`
            }
            // Если нет перевода, возвращаем на главную
            return `/${targetLang}`
        }

        // Если не статическая страница, проверяем категорию
        const categoryI18n = await prisma.categoryI18n.findUnique({
            where: {
                lang_slug: {
                    lang: currentLang,
                    slug: slug
                }
            },
            include: {
                category: {
                    include: {
                        i18n: {
                            where: { lang: targetLang },
                            select: { slug: true }
                        }
                    }
                }
            }
        })

        if (categoryI18n?.category.i18n[0]?.slug) {
            return `/${targetLang}/${categoryI18n.category.i18n[0].slug}`
        }
        // Если не найдено, возвращаем на главную
        return `/${targetLang}`
    }

    // Страница инструмента: /{lang}/{category}/{tool}
    if (pathParts.length === 2) {
        const [categorySlug, toolSlug] = pathParts

        // Находим инструмент по текущему slug
        const toolI18n = await prisma.toolI18n.findUnique({
            where: {
                lang_slug: {
                    lang: currentLang,
                    slug: toolSlug
                }
            },
            include: {
                tool: {
                    include: {
                        i18n: {
                            where: { lang: targetLang },
                            select: { slug: true }
                        },
                        categories: {
                            include: {
                                category: {
                                    include: {
                                        i18n: {
                                            where: { lang: targetLang },
                                            select: { slug: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (toolI18n?.tool.i18n[0]?.slug) {
            // Пытаемся найти категорию для нового языка
            const targetCategory = toolI18n.tool.categories[0]?.category.i18n[0]?.slug
            if (targetCategory) {
                return `/${targetLang}/${targetCategory}/${toolI18n.tool.i18n[0].slug}`
            }
            // Если категории нет, используем плоский URL (если это поддерживается)
            return `/${targetLang}/${toolI18n.tool.i18n[0].slug}`
        }
        // Если нет перевода, возвращаем на главную
        return `/${targetLang}`
    }

    // Неизвестный путь - возвращаем на главную
    return `/${targetLang}`
}
