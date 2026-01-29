import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiate from 'negotiator'

// Поддерживаемые языки
const locales = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
const defaultLocale = 'en'

// Зарезервированные пути, которые НЕ нужно обрабатывать
const reservedPaths = [
    '/api', '/_next', '/static', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/widget.js', '/widget',
    '/apple-touch-icon', '/android-chrome', '/favicon'
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
        const response = NextResponse.next()
        // Для служебных путей используем default locale
        response.headers.set('x-lang', defaultLocale)
        return response
    }

    // 2. Явная обработка корневого пути
    if (pathname === '/') {
        const locale = getLocale(request)
        const redirectUrl = new URL(`/${locale}`, request.url)
        // Сохраняем query параметры, если есть
        if (searchParams.toString()) {
            redirectUrl.search = searchParams.toString()
        }
        return NextResponse.redirect(redirectUrl, 307) // 307 Temporary Redirect для SEO
    }

    // 3. Проверяем, есть ли уже локаль в URL
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // 4. Если локали нет -> Редирект
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)
        const redirectUrl = new URL(`/${locale}${pathname}`, request.url)
        // Сохраняем query параметры, если есть
        if (searchParams.toString()) {
            redirectUrl.search = searchParams.toString()
        }
        return NextResponse.redirect(redirectUrl, 307) // 307 Temporary Redirect для SEO
    }

    // 5. Извлекаем язык из пути и добавляем в cookies для использования в layout
    const pathParts = pathname.split('/').filter(Boolean)
    const lang = pathParts[0] && locales.includes(pathParts[0]) ? pathParts[0] : defaultLocale
    
    // Создаем response и добавляем cookie с языком для использования в layout
    const response = NextResponse.next()
    response.cookies.set('x-lang', lang, {
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 // 1 год
    })
    
    return response

    // 6. Обработка попапа: /{lang}/{tool-slug}?do=pop
    // Попап обрабатывается на уровне страницы [category]/[tool], где category может быть любым
    // Если это попап, страница сама определит правильный category или покажет попап без category
}

export const config = {
    // Matcher: все пути, кроме api, static файлов, иконок и т.д.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon|android-chrome|favicon|widget-|sw.js|offline.html).*)'],
}