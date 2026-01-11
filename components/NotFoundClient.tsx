'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Интерфейс для данных страницы 404
interface NotFoundData {
    headerTitle: string
    headerDescription: string
    headline: string
    subtitle: string
    buttonText: string
    imageUrl: string
    translations: {
        burger_button: string
        header_search_placeholder: string
        footer_link_1: string
        footer_link_2: string
        footer_link_3: string
        footer_copyright: string
    }
}

// Функция для получения данных страницы 404
async function get404Data(lang: string): Promise<NotFoundData | null> {
    try {
        // Отключаем кеширование
        const response = await fetch(`/api/404?lang=${lang}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
            },
        })
        if (response.ok) {
            return await response.json()
        }
    } catch (error) {
        console.error('Error fetching 404 data:', error)
    }
    return null
}

// Функция для определения языка из URL
function detectLangFromUrl(): string {
    const supportedLangs = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
    
    if (typeof window === 'undefined') {
        return 'en'
    }

    // Пытаемся извлечь язык из текущего URL
    const currentPath = window.location.pathname
    
    // Более точный паттерн для извлечения языка
    const langMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/)
    
    if (langMatch && langMatch[1]) {
        const detectedLang = langMatch[1]
        if (supportedLangs.includes(detectedLang)) {
            return detectedLang
        }
    }

    // Fallback на язык браузера
    if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.split('-')[0].toLowerCase()
        if (supportedLangs.includes(browserLang)) {
            return browserLang
        }
    }

    return 'en' // Дефолтный язык
}

export default function NotFoundClient() {
    const pathname = usePathname()
    // Определяем язык сразу при инициализации
    const [lang, setLang] = useState(() => detectLangFromUrl())
    const [pageData, setPageData] = useState<NotFoundData | null>(null)
    const [loading, setLoading] = useState(true)

    // Обновляем язык при изменении pathname (на случай если URL изменился)
    useEffect(() => {
        const detectedLang = detectLangFromUrl()
        if (detectedLang !== lang) {
            setLang(detectedLang)
        }
    }, [pathname, lang])

    // Загружаем данные страницы 404
    useEffect(() => {
        if (!lang) return

        let cancelled = false
        setLoading(true)

        get404Data(lang)
            .then((data) => {
                if (cancelled) return

                if (data) {
                    setPageData(data)
                } else {
                    // Fallback данные
                    setPageData({
                        headerTitle: 'Page Not Found',
                        headerDescription: '',
                        headline: 'Page Not Found',
                        subtitle: '',
                        buttonText: 'Go to Home page',
                        imageUrl: '/404-calculatorscope.png',
                        translations: {
                            burger_button: 'Calculators',
                            header_search_placeholder: 'Search calculator',
                            footer_link_1: 'Privacy Policy',
                            footer_link_2: 'Legal Information & Terms of Use',
                            footer_link_3: 'Contact Us',
                            footer_copyright: 'CalculatorScope. All Rights Reserved.',
                        },
                    })
                }
                setLoading(false)
            })
            .catch((error) => {
                if (cancelled) return
                console.error('Error loading 404 data:', error)
                setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [lang])

    if (loading || !pageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    const homeUrl = `/${lang}`

    return (
        <>
            <Header 
                lang={lang}
                h1={pageData.headerTitle}
                metaDescription={pageData.headerDescription}
                translations={{
                    burger_button: pageData.translations.burger_button,
                    header_search_placeholder: pageData.translations.header_search_placeholder,
                }}
            />
            <main>
                <section className="page-404">
                    <div className="container mx-auto px-4 py-12 md:py-20">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 min-h-[60vh]">
                            {/* Изображение - левая колонка на десктопе, первое на мобильных */}
                            <div className="image-column flex-shrink-0 w-full md:w-auto order-1">
                                <Image
                                    src={pageData.imageUrl}
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
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                    {pageData.headline}
                                </h2>
                                {(pageData.subtitle || pageData.buttonText) && (
                                    <div className="mb-6">
                                        <Link 
                                            href={homeUrl}
                                            className="home-link inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                                        >
                                            {pageData.subtitle && <span>{pageData.subtitle} </span>}
                                            {pageData.buttonText}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer 
                lang={lang}
                translations={{
                    footer_link_1: pageData.translations.footer_link_1,
                    footer_link_2: pageData.translations.footer_link_2,
                    footer_link_3: pageData.translations.footer_link_3,
                    footer_copyright: pageData.translations.footer_copyright,
                }}
            />
        </>
    )
}
