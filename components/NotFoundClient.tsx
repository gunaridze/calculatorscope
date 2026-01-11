'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Интерфейс для данных страницы 404
interface NotFoundData {
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
        const response = await fetch(`/api/404?lang=${lang}`)
        if (response.ok) {
            return await response.json()
        }
    } catch (error) {
        console.error('Error fetching 404 data:', error)
    }
    return null
}

export default function NotFoundClient() {
    const pathname = usePathname()
    const [lang, setLang] = useState('en')
    const [pageData, setPageData] = useState<NotFoundData | null>(null)
    const [loading, setLoading] = useState(true)

    // Определяем язык из URL
    useEffect(() => {
        const supportedLangs = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
        
        // Пытаемся извлечь язык из текущего URL
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname || ''
        const langMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/)
        
        if (langMatch) {
            const detectedLang = langMatch[1]
            if (supportedLangs.includes(detectedLang)) {
                setLang(detectedLang)
                return
            }
        }

        // Fallback на язык браузера
        if (typeof window !== 'undefined') {
            const browserLang = navigator.language.split('-')[0].toLowerCase()
            if (supportedLangs.includes(browserLang)) {
                setLang(browserLang)
            }
        }
    }, [pathname])

    // Загружаем данные страницы 404
    useEffect(() => {
        if (lang) {
            setLoading(true)
            get404Data(lang).then((data) => {
                if (data) {
                    setPageData(data)
                } else {
                    // Fallback данные
                    setPageData({
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
                h1={pageData.headline}
                metaDescription={pageData.subtitle}
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
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                    {pageData.headline}
                                </h1>
                                {pageData.subtitle && (
                                    <p className="subtitle text-lg md:text-xl text-gray-700 mb-6">
                                        {pageData.subtitle}
                                    </p>
                                )}
                                <Link 
                                    href={homeUrl}
                                    className="home-link inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                                >
                                    {pageData.buttonText}
                                </Link>
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
