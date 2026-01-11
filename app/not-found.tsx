import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getTranslations } from '@/lib/translations'

// Интерфейс для body_blocks_json страницы 404
interface NotFoundContent {
    headline?: string
    subtitle?: string
    button?: string
    image?: string
}

// Функция для определения языка из заголовков
async function getLang(): Promise<string> {
    try {
        const headersList = await headers()
        const referer = headersList.get('referer') || ''
        
        // Пытаемся извлечь язык из referer
        const langMatch = referer.match(/\/\/([^\/]+)\/([a-z]{2})(?:\/|$)/)
        if (langMatch) {
            const lang = langMatch[2]
            const supportedLangs = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
            if (supportedLangs.includes(lang)) {
                return lang
            }
        }

        // Пытаемся получить из заголовков Accept-Language
        const acceptLanguage = headersList.get('accept-language') || ''
        const preferredLang = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase()
        
        if (preferredLang && ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv'].includes(preferredLang)) {
            return preferredLang
        }
    } catch (error) {
        // Если не удалось получить заголовки, используем дефолтный язык
    }

    return 'en' // Дефолтный язык
}

export default async function NotFound() {
    const lang = await getLang()
    const translations = getTranslations(lang)

    // Получаем данные страницы 404 из базы данных
    // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
    const pageData = await prisma.pageI18n.findFirst({
        where: {
            lang,
            page: { code: '404' }
        },
        select: {
            h1: true,
            short_answer: true,
            body_blocks_json: true,
        }
    })

    // Парсим body_blocks_json
    let content: NotFoundContent = {}
    if (pageData?.body_blocks_json) {
        try {
            const parsed = typeof pageData.body_blocks_json === 'string'
                ? JSON.parse(pageData.body_blocks_json)
                : pageData.body_blocks_json
            content = parsed as NotFoundContent
        } catch (e) {
            console.error('Error parsing body_blocks_json:', e)
        }
    }

    // Используем данные из body_blocks_json или fallback на h1/short_answer
    const headline = content.headline || pageData?.h1 || 'Page Not Found'
    const subtitle = content.subtitle || pageData?.short_answer || ''
    const buttonText = content.button || 'Go to Home page'
    const imageUrl = content.image || '/404-calculatorscope.png'
    const homeUrl = `/${lang}`

    return (
        <>
            <Header 
                lang={lang}
                h1={headline}
                metaDescription={subtitle}
                translations={{
                    burger_button: translations.burger_button,
                    header_search_placeholder: translations.header_search_placeholder,
                }}
            />
            <main>
                <section className="page-404">
                    <div className="container mx-auto px-4 py-12 md:py-20">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 min-h-[60vh]">
                            {/* Изображение - левая колонка на десктопе, первое на мобильных */}
                            <div className="image-column flex-shrink-0 w-full md:w-auto order-1">
                                <Image
                                    src={imageUrl}
                                    alt="404 illustration"
                                    width={600}
                                    height={400}
                                    style={{ maxHeight: '800px', maxWidth: '100%', height: 'auto', width: 'auto' }}
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {/* Контент - правая колонка на десктопе, второе на мобильных */}
                            <div className="content-column flex-1 w-full md:w-auto order-2 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                    {headline}
                                </h1>
                                {subtitle && (
                                    <p className="subtitle text-lg md:text-xl text-gray-700 mb-6">
                                        {subtitle}
                                    </p>
                                )}
                                <Link 
                                    href={homeUrl}
                                    className="home-link inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                                >
                                    {buttonText}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer 
                lang={lang}
                translations={{
                    footer_link_1: translations.footer_link_1,
                    footer_link_2: translations.footer_link_2,
                    footer_link_3: translations.footer_link_3,
                    footer_copyright: translations.footer_copyright,
                }}
            />
        </>
    )
}
