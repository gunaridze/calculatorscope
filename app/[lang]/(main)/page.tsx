import Link from 'next/link'
import { prisma } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getTranslations } from '@/lib/translations'
import type { Metadata } from 'next'
import CategoryCard from '@/components/CategoryCard'
import AdBanner from '@/components/AdBanner'
import type { HomePageContent } from '@/lib/types'

// Типы для параметров (params - это Promise)
type Props = {
    params: Promise<{ lang: string }>
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params
    
    try {
        // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
        const pageData = await prisma.pageI18n.findFirst({
            where: {
                lang,
                slug: '/',
                page: { code: 'home' }
            },
            select: {
                meta_title: true,
                meta_description: true,
                meta_robots: true,
            }
        })

        const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
        const canonicalUrl = `${url}/${lang}`

        return {
            title: pageData?.meta_title || 'Calculator Scope - Smart Online Calculators',
            description: pageData?.meta_description || undefined,
            robots: pageData?.meta_robots || 'index,follow',
            alternates: { canonical: canonicalUrl },
            openGraph: {
                title: pageData?.meta_title || 'Calculator Scope',
                description: pageData?.meta_description || undefined,
                locale: lang,
                type: 'website',
            },
        }
    } catch (error) {
        console.error('Error in generateMetadata:', error)
        return {
            title: 'Calculator Scope - Smart Online Calculators',
            description: undefined,
        }
    }
}

export default async function HomePage({ params }: Props) {
    try {
        const { lang } = await params
        const translations = getTranslations(lang)

        // Получаем данные страницы из page_i18n
        // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
        const pageData = await prisma.pageI18n.findFirst({
            where: {
                lang,
                slug: '/',
                page: { code: 'home' }
            },
            select: {
                h1: true,
                short_answer: true,
                body_blocks_json: true,
            }
        })

        // Парсим body_blocks_json с типизацией
        let content: Partial<HomePageContent> = {}
        if (pageData?.body_blocks_json) {
            try {
                const parsed = typeof pageData.body_blocks_json === 'string'
                    ? JSON.parse(pageData.body_blocks_json)
                    : pageData.body_blocks_json
                content = parsed as HomePageContent
            } catch (e) {
                console.error('Error parsing body_blocks_json:', e)
            }
        }

        // Получаем slug для страницы с ID=105 (для кнопки промо)
        // Используем try-catch на случай если страница не найдена
        let promoPage: { slug: string } | null = null
        try {
            // Сначала пытаемся найти по page_id: '105'
            // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
            promoPage = await prisma.pageI18n.findFirst({
                where: {
                    page_id: '105',
                    lang,
                },
                select: {
                    slug: true,
                }
            })
            
            // Если не найдено, пытаемся найти через Page с code или id
            if (!promoPage) {
                // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
                const page = await prisma.page.findFirst({
                    where: {
                        OR: [
                            { id: '105' },
                            { code: 'promo' }
                        ]
                    },
                    include: {
                        i18n: {
                            where: { lang },
                            select: { slug: true }
                        }
                    }
                })
                if (page?.i18n[0]) {
                    promoPage = { slug: page.i18n[0].slug }
                }
            }
        } catch (error) {
            console.error('Error fetching promo page:', error)
        }

        // Получаем все категории с иконками
        const allCategories = await prisma.category.findMany({
            select: {
                id: true,
                sort_order: true,
                i18n: {
                    where: { lang },
                },
            },
            orderBy: { sort_order: 'asc' }
        })

        // Получаем популярные категории с инструментами (для секции "Popular Calculators")
        const popularCategories = await prisma.category.findMany({
            where: {
                i18n: {
                    some: {
                        lang,
                        // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
                        is_popular: 1
                    }
                }
            },
            select: {
                id: true,
                sort_order: true,
                i18n: {
                    // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
                    where: { lang, is_popular: 1 },
                    select: {
                        slug: true,
                        name: true,
                    }
                },
                tools: {
                    select: {
                        tool: {
                            select: {
                                id: true,
                                i18n: {
                                    where: { 
                                        lang,
                                        is_popular: 1
                                    } as any
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { sort_order: 'asc' }
        })

        // Получаем все инструменты для секции "All Calculators"
        const allTools = await prisma.tool.findMany({
            where: {
                status: 'published'
            },
            select: {
                id: true,
                i18n: {
                    where: { lang },
                    select: {
                        slug: true,
                        h1: true,
                        title: true,
                    }
                },
                categories: {
                    select: {
                        category: {
                            select: {
                                i18n: {
                                    where: { lang },
                                    select: {
                                        slug: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Фильтруем категории для сетки (исключаем популярные, они в отдельной секции)
        const categoriesForGrid = allCategories
            .filter(cat => {
                const catData = cat.i18n[0]
                return catData && (catData as any).is_popular !== 1
            })
            .slice(0, 21) // Максимум 21 категория для сетки

        return (
            <>
                <Header 
                    lang={lang} 
                    h1={pageData?.h1 || translations.header_h1}
                    metaDescription={pageData?.short_answer || translations.header_text}
                    translations={{
                        burger_button: translations.burger_button,
                        header_search_placeholder: translations.header_search_placeholder,
                    }}
                />
                <main className="container mx-auto px-4 py-12">
                    {/* Секция 1: Сетка категорий, популярные категории и баннеры */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            {content.body_h2_1 || 'Calculators by category'}
                        </h2>
                        
                        {/* Desktop: Две независимые колонки (категории + популярные и баннеры) */}
                        <div className="hidden lg:flex lg:gap-[20px] lg:items-start">
                            {/* Левая колонка: Сетка категорий + Популярные категории */}
                            <div className="flex-1">
                                {/* Сетка категорий */}
                                <div className="grid grid-cols-3 gap-[20px] items-start">
                                    {categoriesForGrid.map((cat) => {
                                        const catData = cat.i18n[0]
                                        if (!catData) return null
                                        return (
                                            <CategoryCard
                                                key={cat.id}
                                                lang={lang}
                                                categoryId={cat.id}
                                                slug={catData.slug}
                                                name={catData.name}
                                                shortDescription={(catData as any).short_description}
                                                iconUrl={(catData as any).og_image_url}
                                            />
                                        )
                                    })}
                                </div>
                                
                                {/* Популярные категории - начинаются через 20px после последнего ряда */}
                                {popularCategories.length > 0 && (
                                    <div className="mt-[20px]">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                            {content.body_h2_2 || 'Popular Calculators'}
                                        </h2>
                                        <div className="grid grid-cols-3 gap-6">
                                            {popularCategories.slice(0, 6).map((cat) => {
                                                const catData = (cat as any).i18n[0]
                                                if (!catData) return null

                                                const popularTools = (cat as any).tools
                                                    .filter(({ tool }: any) => tool.i18n.length > 0 && (tool.i18n[0] as any)?.is_popular === 1)
                                                    .slice(0, 3)

                                                if (popularTools.length === 0) return null

                                                return (
                                                    <div key={cat.id} className="bg-white border border-gray-200 rounded-lg">
                                                        {/* Название категории: по центру сверху, отступ 10px, жирный, отступы минимум 50px */}
                                                        <h3 className="font-bold text-center pt-[10px] text-lg px-[50px]">
                                                            {catData.name}
                                                        </h3>
                                                        
                                                        {/* Три ряда со ссылками на инструменты */}
                                                        <div className="px-[50px] pb-4 space-y-2">
                                                            {popularTools.map(({ tool }: any) => {
                                                                const toolData = tool.i18n[0]
                                                                const categorySlug = catData.slug
                                                                if (!toolData) return null
                                                                
                                                                return (
                                                                    <div key={tool.id}>
                                                                        <Link
                                                                            href={`/${lang}/${categorySlug}/${toolData.slug}`}
                                                                            className="block text-blue-600 hover:text-blue-800 hover:underline"
                                                                        >
                                                                            {/* h1 из tool_i18n размечается как h3 */}
                                                                            <h3 className="font-medium">
                                                                                {toolData.h1 || toolData.title}
                                                                            </h3>
                                                                        </Link>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Правая колонка: Баннеры (независимая высота) */}
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

                        {/* Mobile: 1 колонка с interleaved баннерами */}
                        <div className="lg:hidden space-y-[20px]">
                            {categoriesForGrid.map((cat, index) => {
                                const catData = cat.i18n[0]
                                if (!catData) return null

                                const showAdAfter = [2, 4, 8, 10].includes(index + 1)
                                const adNumber = index + 1 === 2 ? 1 : index + 1 === 4 ? 2 : index + 1 === 8 ? 3 : 4
                                const adLink = index + 1 === 2 ? content.ad_link_1 
                                    : index + 1 === 4 ? content.ad_link_2 
                                    : index + 1 === 8 ? content.ad_link_3 
                                    : content.ad_link_4

                                return (
                                    <div key={cat.id}>
                                        <CategoryCard
                                            lang={lang}
                                            categoryId={cat.id}
                                            slug={catData.slug}
                                            name={catData.name}
                                            shortDescription={(catData as any).short_description}
                                            iconUrl={(catData as any).og_image_url}
                                        />
                                        {showAdAfter && (
                                            <div className="mt-5">
                                                <AdBanner 
                                                    lang={lang} 
                                                    adNumber={adNumber as 1 | 2 | 3 | 4} 
                                                    href={adLink}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            
                            {/* Мобильная версия: Популярные калькуляторы */}
                            {popularCategories.length > 0 && (
                                <div className="mt-5">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                        {content.body_h2_2 || 'Popular Calculators'}
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6">
                                        {popularCategories.slice(0, 6).map((cat) => {
                                            const catData = (cat as any).i18n[0]
                                            if (!catData) return null

                                            const popularTools = (cat as any).tools
                                                .filter(({ tool }: any) => tool.i18n.length > 0 && (tool.i18n[0] as any)?.is_popular === 1)
                                                .slice(0, 3)

                                            if (popularTools.length === 0) return null

                                            return (
                                                <div key={cat.id} className="bg-white border border-gray-200 rounded-lg">
                                                    {/* Название категории: по центру сверху, отступ 10px, жирный, отступы минимум 50px */}
                                                    <h3 className="font-bold text-center pt-[10px] text-lg px-[50px]">
                                                        {catData.name}
                                                    </h3>
                                                    
                                                    {/* Три ряда со ссылками на инструменты */}
                                                    <div className="px-[50px] pb-4 space-y-2">
                                                        {popularTools.map(({ tool }: any) => {
                                                            const toolData = tool.i18n[0]
                                                            const categorySlug = catData.slug
                                                            if (!toolData) return null
                                                            
                                                            return (
                                                                <div key={tool.id}>
                                                                    <Link
                                                                        href={`/${lang}/${categorySlug}/${toolData.slug}`}
                                                                        className="block text-blue-600 hover:text-blue-800 hover:underline"
                                                                    >
                                                                        {/* h1 из tool_i18n размечается как h3 */}
                                                                        <h3 className="font-medium">
                                                                            {toolData.h1 || toolData.title}
                                                                        </h3>
                                                                    </Link>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Секция 3: Промо (Pop-Up Widgets) */}
                    {content.body_h2_4 && (
                        <section className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {content.body_h2_4}
                            </h2>
                            {content.body_pop_up_text && (
                                <div className="text-lg text-gray-700 mb-6 space-y-4">
                                    {content.body_pop_up_text.split('\n').map((paragraph, index) => (
                                        paragraph.trim() && (
                                            <p key={index}>{paragraph.trim()}</p>
                                        )
                                    ))}
                                </div>
                            )}
                            {content.body_get_pop_up_button && (
                                <div className="flex justify-center">
                                    {promoPage?.slug ? (
                                        <Link
                                            href={`/${lang}/${promoPage.slug}`}
                                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                        >
                                            {content.body_get_pop_up_button}
                                        </Link>
                                    ) : (
                                        <button
                                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-not-allowed opacity-75"
                                            disabled
                                            title="Promo page not found"
                                        >
                                            {content.body_get_pop_up_button}
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Секция 4: О нас (About) */}
                    {content.body_h2_5 && (
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {content.body_h2_5}
                            </h2>
                            {content.body_about_us_text && (
                                <div className="text-lg text-gray-700 space-y-4">
                                    {content.body_about_us_text.split('\n').map((paragraph, index) => (
                                        paragraph.trim() && (
                                            <p key={index}>{paragraph.trim()}</p>
                                        )
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Секция 5: Все калькуляторы */}
                    {content.body_h2_3 && (
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                {content.body_h2_3}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allTools
                                    .filter(tool => tool.i18n.length > 0)
                                    .map((tool) => {
                                        const toolData = tool.i18n[0]
                                        const categorySlug = tool.categories[0]?.category?.i18n[0]?.slug
                                        if (!toolData || !categorySlug) return null

                                        return (
                                            <Link
                                                key={tool.id}
                                                href={`/${lang}/${categorySlug}/${toolData.slug}`}
                                                className="block text-blue-600 hover:text-blue-800 hover:underline p-2"
                                            >
                                                <h4 className="font-medium">
                                                    {toolData.h1 || toolData.title}
                                                </h4>
                                            </Link>
                                        )
                                    })}
                            </div>
                        </section>
                    )}
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
    } catch (error) {
        console.error('Error in HomePage:', error)
        // Fallback на минимальную версию страницы
        const { lang } = await params
        const translations = getTranslations(lang)
        
        return (
            <>
                <Header 
                    lang={lang} 
                    h1={translations.header_h1}
                    metaDescription={translations.header_text}
                    translations={{
                        burger_button: translations.burger_button,
                        header_search_placeholder: translations.header_search_placeholder,
                    }}
                />
                <main className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Error loading page</h1>
                        <p className="text-gray-600">Please try again later.</p>
                    </div>
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
}