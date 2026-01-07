import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiate from 'negotiator'
import { PrismaClient } from '@prisma/client'

// Поддерживаемые языки
const locales = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
const defaultLocale = 'en'

// Зарезервированные пути, которые НЕ нужно обрабатывать
const reservedPaths = [
    '/api', '/_next', '/static', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/widget.js', '/widget'
]

// Singleton для Prisma в middleware
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

function getLocale(request: NextRequest): string {
    // 1. Проверяем куки (если будем сохранять выбор пользователя)
    // const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
    // if (localeCookie && locales.includes(localeCookie)) return localeCookie

    // 2. Смотрим заголовки браузера
    const headers = { 'accept-language': request.headers.get('accept-language') || '' }
    const languages = new Negotiate({ headers }).languages()

    try {
        return match(languages, locales, defaultLocale)
    } catch (e) {
        return defaultLocale
    }
}

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // 1. Игнорируем служебные файлы и API
    if (reservedPaths.some((path) => pathname.startsWith(path)) || pathname.includes('.')) {
        return
    }

    // 2. Проверяем, есть ли уже локаль в URL
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // 3. Если локали нет -> Редирект
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // Сохраняем "хвост" URL (например, если зашли на /some-old-link)
        // Но так как у нас localized slugs, то чаще всего редирект будет просто на корень языка
        return NextResponse.redirect(
            new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
        )
    }

    // 4. Обработка попапа: /{lang}/{tool-slug}?do=pop -> /{lang}/{category}/{tool-slug}?do=pop
    const pathParts = pathname.split('/').filter(Boolean)
    if (pathParts.length === 2 && searchParams.get('do') === 'pop') {
        const [lang, toolSlug] = pathParts
        
        if (locales.includes(lang)) {
            try {
                // Ищем инструмент и его категорию
                const toolI18n = await prisma.toolI18n.findUnique({
                    where: {
                        lang_slug: {
                            lang,
                            slug: toolSlug,
                        },
                    },
                    include: {
                        tool: {
                            include: {
                                categories: {
                                    include: {
                                        category: {
                                            include: {
                                                i18n: {
                                                    where: { lang },
                                                    select: { slug: true },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })

                if (toolI18n && toolI18n.tool.categories.length > 0) {
                    const categorySlug = toolI18n.tool.categories[0].category.i18n[0]?.slug
                    if (categorySlug) {
                        // Перенаправляем на правильный URL с category
                        return NextResponse.redirect(
                            new URL(`/${lang}/${categorySlug}/${toolSlug}?do=pop`, request.url)
                        )
                    }
                }
            } catch (error) {
                // В случае ошибки просто продолжаем обычную обработку
                console.error('Error in middleware popup redirect:', error)
            }
        }
    }
}

export const config = {
    // Matcher: все пути, кроме api, static файлов и т.д.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}