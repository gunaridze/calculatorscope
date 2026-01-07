import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import { getTranslations } from '@/lib/translations'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

type Props = {
    params: Promise<{ lang: string; slug: string }>
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, slug } = await params
    
    try {
        const pageData = await getPageBySlug(slug, lang)

        if (!pageData) {
            return {
                title: 'Page Not Found',
            }
        }

        const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
        const canonicalUrl = `${url}/${lang}/${slug}`

        return {
            title: pageData.meta_title || pageData.h1 || 'Calculator Scope',
            description: pageData.meta_description || undefined,
            robots: pageData.meta_robots || 'index,follow',
            alternates: { canonical: canonicalUrl },
            openGraph: {
                title: pageData.meta_title || pageData.h1 || 'Calculator Scope',
                description: pageData.meta_description || undefined,
                locale: lang,
                type: 'website',
            },
        }
    } catch (error) {
        console.error('Error in generateMetadata:', error)
        return {
            title: 'Calculator Scope',
        }
    }
}

export default async function StaticPage({ params }: Props) {
    const { lang, slug } = await params
    const translations = getTranslations(lang)

    // Получаем данные страницы
    const pageData = await getPageBySlug(slug, lang)

    if (!pageData || pageData.page.status !== 'published') {
        notFound()
    }

    // Проверяем, что это не категория (должно быть обработано в [category]/page.tsx)
    const categoryCheck = await prisma.categoryI18n.findUnique({
        where: {
            lang_slug: {
                lang,
                slug,
            },
        },
    })

    if (categoryCheck) {
        notFound()
    }

    // Получаем данные для рекламных баннеров (используем те же ссылки что и на главной)
    let content: {
        ad_link_1?: string
        ad_link_2?: string
        ad_link_3?: string
        ad_link_4?: string
    } = {}

    try {
        const homePageData = await prisma.pageI18n.findFirst({
            where: {
                lang,
                slug: '/',
                page: { code: 'home' }
            },
            select: {
                body_blocks_json: true,
            }
        })

        if (homePageData?.body_blocks_json) {
            const parsed = typeof homePageData.body_blocks_json === 'string'
                ? JSON.parse(homePageData.body_blocks_json)
                : homePageData.body_blocks_json
            content = parsed as typeof content
        }
    } catch (e) {
        console.error('Error parsing home page body_blocks_json:', e)
    }

    // Парсим body_blocks_json (HTML контент)
    let bodyContent = ''
    if (pageData.body_blocks_json) {
        try {
            const parsed = typeof pageData.body_blocks_json === 'string'
                ? JSON.parse(pageData.body_blocks_json)
                : pageData.body_blocks_json
            
            // Если это строка (HTML), используем её напрямую
            if (typeof parsed === 'string') {
                bodyContent = parsed
            } else if (parsed && typeof parsed === 'object') {
                // Если это объект с полем content или html
                bodyContent = (parsed as any).content || (parsed as any).html || ''
            }
        } catch (e) {
            console.error('Error parsing body_blocks_json:', e)
        }
    }

    return (
        <>
            <Header
                lang={lang}
                translations={{
                    header_search_placeholder: translations.header_search_placeholder,
                    burger_button: translations.burger_button,
                }}
            />
            <main className="container mx-auto px-4 py-12">
                {/* Desktop: Двухколоночная сетка */}
                <div className="hidden lg:flex lg:gap-[20px] lg:items-start">
                    {/* Левая колонка: Контент */}
                    <div className="flex-1">
                        {/* H1 */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            {pageData.h1}
                        </h1>
                        
                        {/* Body content */}
                        {bodyContent && (
                            <div 
                                className="prose lg:prose-xl max-w-none"
                                dangerouslySetInnerHTML={{ __html: bodyContent }}
                            />
                        )}
                    </div>
                    
                    {/* Правая колонка: Баннеры (не отображается на мобильных) */}
                    <div className="w-[300px] space-y-5" style={{ marginTop: '21px' }}>
                        <AdBanner 
                            lang={lang} 
                            adNumber={1} 
                            href={content.ad_link_1}
                        />
                        <AdBanner 
                            lang={lang} 
                            adNumber={2} 
                            href={content.ad_link_2}
                        />
                        <AdBanner 
                            lang={lang} 
                            adNumber={3} 
                            href={content.ad_link_3}
                        />
                        <AdBanner 
                            lang={lang} 
                            adNumber={4} 
                            href={content.ad_link_4}
                        />
                    </div>
                </div>

                {/* Mobile: Только контент, без рекламной колонки */}
                <div className="lg:hidden">
                    {/* H1 */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        {pageData.h1}
                    </h1>
                    
                    {/* Body content */}
                    {bodyContent && (
                        <div 
                            className="prose lg:prose-xl max-w-none"
                            dangerouslySetInnerHTML={{ __html: bodyContent }}
                        />
                    )}
                </div>
            </main>
            <Footer lang={lang} />
        </>
    )
}
