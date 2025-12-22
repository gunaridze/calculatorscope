import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiate from 'negotiator'

// Твои поддерживаемые языки
const locales = ['en', 'ru', 'lv', 'lt', 'ee', 'de']
const defaultLocale = 'en'

// Зарезервированные пути, которые НЕ нужно обрабатывать
const reservedPaths = [
    '/api', '/_next', '/static', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/widget.js'
]

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

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

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
}

export const config = {
    // Matcher: все пути, кроме api, static файлов и т.д.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}