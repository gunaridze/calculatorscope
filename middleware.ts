import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiate from 'negotiator'

// Поддерживаемые языки
const locales = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
const defaultLocale = 'en'

// Зарезервированные пути, которые НЕ нужно обрабатывать
const reservedPaths = [
    '/api', '/_next', '/static', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/widget.js', '/widget'
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

    // 4. Обработка попапа: /{lang}/{tool-slug}?do=pop
    // Попап обрабатывается на уровне страницы [category]/[tool], где category может быть любым
    // Если это попап, страница сама определит правильный category или покажет попап без category
}

export const config = {
    // Matcher: все пути, кроме api, static файлов и т.д.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}