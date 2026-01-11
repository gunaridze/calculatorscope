import { notFound } from 'next/navigation'
import { prisma, getPageBySlug } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import { getTranslations } from '@/lib/translations'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import CalculatorWidget from '@/components/CalculatorWidget'
import PWASetup from '@/components/PWASetup'

type Props = {
    params: Promise<{ lang: string; category: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Интерфейс для content_blocks_json
interface CategoryContent {
    body_h2_3?: string
    ad_link_1?: string
    ad_link_2?: string
    ad_link_3?: string
    ad_link_4?: string
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, category: slug } = await params

    try {
        // Проверяем, является ли это статической страницей
        const staticPage = await getPageBySlug(slug, lang)
        if (staticPage && staticPage.page.status === 'published') {
            const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
            const canonicalUrl = `${url}/${lang}/${slug}`

            return {
                title: staticPage.meta_title || staticPage.h1 || 'Calculator Scope',
                description: staticPage.meta_description || undefined,
                robots: staticPage.meta_robots || 'index,follow',
                alternates: { canonical: canonicalUrl },
                openGraph: {
                    title: staticPage.meta_title || staticPage.h1 || 'Calculator Scope',
                    description: staticPage.meta_description || undefined,
                    locale: lang,
                    type: 'website',
                },
            }
        }

        // Это категория
        const categoryI18nRaw = await prisma.categoryI18n.findUnique({
            where: {
                lang_slug: {
                    lang,
                    slug,
                },
            },
        })
        // TypeScript не всегда правильно выводит типы из Prisma
        const categoryI18n = categoryI18nRaw ? {
            meta_title: (categoryI18nRaw as any).meta_title,
            meta_description: (categoryI18nRaw as any).meta_description,
            og_title: (categoryI18nRaw as any).og_title,
            og_description: (categoryI18nRaw as any).og_description,
            og_image_url: (categoryI18nRaw as any).og_image_url,
        } : null

        if (!categoryI18n) {
            return {
                title: 'Category Not Found',
            }
        }

        const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
        const canonicalUrl = `${url}/${lang}/${slug}`

        const ogTitle = categoryI18n.og_title
        const ogDescription = categoryI18n.og_description

        return {
            title: categoryI18n.meta_title || ogTitle || 'Category',
            description: categoryI18n.meta_description || ogDescription || undefined,
            robots: 'index,follow',
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title: categoryI18n.og_title || categoryI18n.meta_title || 'Category',
                description: categoryI18n.og_description || categoryI18n.meta_description || undefined,
                images: categoryI18n.og_image_url ? [{ url: categoryI18n.og_image_url }] : undefined,
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

export default async function CategoryPage({ params, searchParams }: Props) {
    const { lang, category: slug } = await params
    const search = await searchParams
    const translations = getTranslations(lang)

    // Проверяем, не является ли это попапом инструмента: /{lang}/{tool-slug}?do=pop
    const isPopup = search?.do === 'pop'
    if (isPopup) {
        // Пытаемся найти инструмент по slug
        const toolData = await prisma.toolI18n.findUnique({
            where: {
                lang_slug: {
                    lang,
                    slug,
                },
            },
            include: {
                tool: {
                    include: {
                        config: true,
                    },
                },
            },
        })

        if (toolData) {
            // Это инструмент в режиме попапа - показываем только калькулятор
            const dataAny = toolData as any
            const inputsJson = dataAny.inputs_json
            const interfaceData = inputsJson || {}

            // @ts-ignore
            const config: any = toolData.tool.config?.config_json
            if (config) {
                config.language = lang
            }

            if (config) {
                // Получаем tool_id и h1 для lang='en' для аналитики
                const toolId = (toolData as any).tool?.id || null
                let h1En: string | undefined = undefined
                
                if (toolId) {
                    try {
                        // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
                        const toolI18nEn = await prisma.toolI18n.findFirst({
                            where: {
                                tool_id: toolId,
                                lang: 'en'
                            },
                            select: {
                                h1: true,
                                title: true
                            }
                        })
                        h1En = toolI18nEn?.h1 || toolI18nEn?.title || undefined
                    } catch (e) {
                        console.error('Error fetching h1_en for analytics:', e)
                    }
                }

                return (
                    <>
                        {/* PWA Setup для popup */}
                        <PWASetup 
                            lang={lang} 
                            toolSlug={slug}
                            toolName={toolData.h1 || toolData.title}
                        />
                        <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
                            <CalculatorWidget
                                config={config}
                                interface={interfaceData}
                                h1={toolData.h1 || toolData.title}
                                lang={lang}
                                toolId={toolId || undefined}
                                h1En={h1En}
                                translations={{
                                    clear: translations.widget_clear,
                                    calculate: translations.widget_calculate,
                                    result: translations.widget_result,
                                    copy: translations.widget_copy,
                                    suggest: translations.widget_suggest,
                                    getWidget: translations.widget_get_widget,
                                    inputLabel: translations.widget_input_label,
                                    inputPlaceholder: translations.widget_input_placeholder,
                                    formatLabel: translations.widget_format_label,
                                    wordsOption: translations.widget_words_option,
                                    checkWritingOption: translations.widget_check_writing_option,
                                    currencyOption: translations.widget_currency_option,
                                    currencyVatOption: translations.widget_currency_vat_option,
                                    letterCaseLabel: translations.widget_letter_case_label,
                                    lowercaseOption: translations.widget_lowercase_option,
                                    uppercaseOption: translations.widget_uppercase_option,
                                    titleCaseOption: translations.widget_title_case_option,
                                    sentenceCaseOption: translations.widget_sentence_case_option,
                                    plusVat: translations.widget_plus_vat,
                                    downloadWidget: translations.widget_download_widget,
                                    installPrompt: translations.widget_install_prompt,
                                }}
                                toolSlug={slug}
                            />
                        </div>
                    </>
                )
            }
        }
    }

    // Проверяем, не является ли это статической страницей
    const staticPage = await getPageBySlug(slug, lang)
    if (staticPage && staticPage.page.status === 'published') {
        // Это статическая страница - рендерим её
        // Получаем данные для рекламных баннеров (используем те же ссылки что и на главной)
        let content: {
            ad_link_1?: string
            ad_link_2?: string
            ad_link_3?: string
            ad_link_4?: string
        } = {}

        try {
            // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
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
        let bodyContent: React.ReactNode = null
        let bodyContentSections: Array<{ heading?: string; html: string; type?: string }> = []
        
        if (staticPage.body_blocks_json) {
            try {
                const parsed = typeof staticPage.body_blocks_json === 'string'
                    ? JSON.parse(staticPage.body_blocks_json)
                    : staticPage.body_blocks_json
                
                // Если это строка (HTML), используем её напрямую
                if (typeof parsed === 'string') {
                    bodyContent = (
                        <div 
                            className="prose lg:prose-xl max-w-none"
                            dangerouslySetInnerHTML={{ __html: parsed }}
                        />
                    )
                } else if (parsed && typeof parsed === 'object') {
                    // Проверяем структуру с sections (новый формат)
                    if (Array.isArray((parsed as any).sections)) {
                        bodyContentSections = (parsed as any).sections.map((section: any) => ({
                            heading: section.heading,
                            html: section.html || '',
                            type: section.type
                        }))
                    } else if ((parsed as any).content || (parsed as any).html) {
                        // Старый формат с полем content или html
                        const htmlContent = (parsed as any).content || (parsed as any).html || ''
                        bodyContent = (
                            <div 
                                className="prose lg:prose-xl max-w-none"
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                        )
                    }
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
                                {staticPage.h1}
                            </h1>
                            
                            {/* Body content */}
                            {bodyContent && bodyContent}
                            {bodyContentSections.length > 0 && (
                                <div className="prose lg:prose-xl max-w-none">
                                    {bodyContentSections.map((section, index) => (
                                        <section key={index} className={index > 0 ? 'mt-8' : ''}>
                                            {section.heading && (
                                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                    {section.heading}
                                                </h2>
                                            )}
                                            {section.html && (
                                                <div 
                                                    className="prose"
                                                    dangerouslySetInnerHTML={{ __html: section.html }}
                                                />
                                            )}
                                        </section>
                                    ))}
                                </div>
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
                            {staticPage.h1}
                        </h1>
                        
                        {/* Body content */}
                        {bodyContent && bodyContent}
                        {bodyContentSections.length > 0 && (
                            <div className="prose lg:prose-xl max-w-none">
                                {bodyContentSections.map((section, index) => (
                                    <section key={index} className={index > 0 ? 'mt-8' : ''}>
                                        {section.heading && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {section.heading}
                                            </h2>
                                        )}
                                        {section.html && (
                                            <div 
                                                className="prose"
                                                dangerouslySetInnerHTML={{ __html: section.html }}
                                            />
                                        )}
                                    </section>
                                ))}
                            </div>
                        )}
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

    // Получаем данные категории
    const categoryI18n = await prisma.categoryI18n.findUnique({
        where: {
            lang_slug: {
                lang,
                slug,
            },
        },
        include: {
            category: {
                include: {
                    parent: {
                        include: {
                            i18n: {
                                where: { lang },
                            },
                        },
                    },
                    children: {
                        include: {
                            i18n: {
                                where: { lang },
                            },
                        },
                        orderBy: { sort_order: 'asc' },
                    },
                    tools: {
                        include: {
                            tool: {
                                include: {
                                    i18n: {
                                        where: { lang },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!categoryI18n) {
        notFound()
    }

    // Извлекаем поля из categoryI18n (TypeScript не всегда правильно выводит типы из Prisma с include)
    const categoryI18nAny = categoryI18n as any
    const ogTitle = categoryI18nAny.og_title
    const ogDescription = categoryI18nAny.og_description

    const category = categoryI18n.category
    const hasChildren = category.children.length > 0

    // Получаем популярные инструменты
    const popularTools = category.tools
        .filter(({ tool }) => {
            const toolI18n = tool.i18n[0]
            return toolI18n && (toolI18n as any).is_popular === 1
        })
        .map(({ tool }) => ({
            id: tool.id,
            slug: tool.i18n[0]!.slug,
            h1: tool.i18n[0]!.h1,
            title: tool.i18n[0]!.title,
            meta_description: (tool.i18n[0] as any).meta_description,
        }))

    // Получаем все инструменты категории
    const allTools = category.tools
        .map(({ tool }) => {
            const toolI18n = tool.i18n[0]
            if (!toolI18n) return null
            return {
                id: tool.id,
                slug: toolI18n.slug,
                h1: toolI18n.h1,
                title: toolI18n.title,
                meta_description: (toolI18n as any).meta_description,
            }
        })
        .filter((tool): tool is NonNullable<typeof tool> => tool !== null)

    // Получаем дочерние категории
    const childCategories = category.children
        .map((child) => {
            const childI18n = child.i18n[0]
            if (!childI18n) return null
            return {
                id: child.id,
                slug: childI18n.slug,
                name: childI18n.name,
                og_description: (childI18n as any).og_description,
            }
        })
        .filter((cat): cat is NonNullable<typeof cat> => cat !== null)

    // Парсим content_blocks_json
    let content: CategoryContent = {}
    const contentBlocksJson = (categoryI18n as any).content_blocks_json
    if (contentBlocksJson) {
        try {
            const parsed = typeof contentBlocksJson === 'string'
                ? JSON.parse(contentBlocksJson)
                : contentBlocksJson
            content = parsed as CategoryContent
        } catch (e) {
            console.error('Error parsing content_blocks_json:', e)
        }
    }

    // Хлебные крошки - строим иерархию с учетом родительской категории
    const breadcrumbs = [
        { name: 'Calculator Scope', href: `/${lang}` },
    ]
    
    // Если есть родительская категория, добавляем её в breadcrumbs
    const categoryAny = category as any
    if (categoryAny.parent && categoryAny.parent.i18n && Array.isArray(categoryAny.parent.i18n) && categoryAny.parent.i18n.length > 0) {
        const parentI18n = categoryAny.parent.i18n[0]
        if (parentI18n && parentI18n.name && parentI18n.slug) {
            breadcrumbs.push({
                name: parentI18n.name,
                href: `/${lang}/${parentI18n.slug}`,
            })
        }
    }
    
    // Добавляем текущую категорию
    breadcrumbs.push({
        name: categoryI18n.name,
        href: `/${lang}/${slug}`,
    })

    return (
        <>
            <Header
                lang={lang}
                h1={categoryI18n.name}
                metaDescription={(categoryI18n as any).short_description || undefined}
                translations={{
                    burger_button: translations.burger_button,
                    header_search_placeholder: translations.header_search_placeholder,
                }}
            />
            <main className="container mx-auto px-4 py-12">
                {/* Desktop: Две колонки */}
                <div className="hidden lg:flex lg:gap-[20px] lg:items-start">
                    {/* Левая колонка: Основной контент */}
                    <div className="flex-1">
                        {/* Хлебные крошки */}
                        <nav className="mb-4 text-sm text-gray-600">
                            {breadcrumbs.map((crumb, index) => (
                                <span key={crumb.href}>
                                    {index > 0 && <span className="mx-2">/</span>}
                                    {index === breadcrumbs.length - 1 ? (
                                        <span className="text-gray-900">{crumb.name}</span>
                                    ) : (
                                        <Link href={crumb.href} className="hover:text-blue-600">
                                            {crumb.name}
                                        </Link>
                                    )}
                                </span>
                            ))}
                        </nav>

                        {hasChildren ? (
                            // Вариант А: Категория с дочерними категориями
                            <>
                                {/* Заголовок страницы */}
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    {categoryI18n.name}
                                </h2>

                                {/* Список дочерних категорий */}
                                <div className="space-y-4 mb-12">
                                    {childCategories.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/${lang}/${child.slug}`}
                                            className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                        >
                                            <h3 className="font-bold text-center mb-2 text-lg">
                                                {child.name}
                                            </h3>
                                            {child.og_description && (
                                                <p className="text-center text-gray-600 text-sm">
                                                    {child.og_description}
                                                </p>
                                            )}
                                        </Link>
                                    ))}
                                </div>

                                {/* SEO-описание */}
                                {(ogTitle || ogDescription) && (
                                    <div className="mb-12">
                                        {ogTitle && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {ogTitle}
                                            </h2>
                                        )}
                                        {ogDescription && (
                                            <p className="text-lg text-gray-700">
                                                {ogDescription}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Секция "Популярные калькуляторы" - после SEO-описания */}
                                {popularTools.length > 0 && (
                                    <div className="mb-12">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                            Popular {categoryI18n.name}
                                        </h2>
                                        <div className="space-y-4">
                                            {popularTools.map((tool) => (
                                                <Link
                                                    key={tool.id}
                                                    href={`/${lang}/${slug}/${tool.slug}`}
                                                    className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                >
                                                    <h3 className="font-bold text-center mb-2 text-lg">
                                                        {tool.h1 || tool.title}
                                                    </h3>
                                                    {tool.meta_description && (
                                                        <p className="text-center text-sm text-gray-600">
                                                            {tool.meta_description}
                                                        </p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Вариант Б: Конечная категория
                            <>
                                {/* Хлебные крошки уже выше */}

                                {/* Секция "Популярные калькуляторы" */}
                                {popularTools.length > 0 && (
                                    <div className="mb-12">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                            Popular {categoryI18n.name}
                                        </h2>
                                        <div className="space-y-4">
                                            {popularTools.map((tool) => (
                                                <Link
                                                    key={tool.id}
                                                    href={`/${lang}/${slug}/${tool.slug}`}
                                                    className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                >
                                                    <h3 className="font-bold text-center mb-2 text-lg">
                                                        {tool.h1 || tool.title}
                                                    </h3>
                                                    {tool.meta_description && (
                                                        <p className="text-center text-sm text-gray-600">
                                                            {tool.meta_description}
                                                        </p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Секция "Все калькуляторы" */}
                                {content.body_h2_3 && (
                                    <section className="mb-12">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                            {content.body_h2_3}
                                        </h2>
                                        <div className="space-y-4">
                                            {allTools.map((tool) => (
                                                <Link
                                                    key={tool.id}
                                                    href={`/${lang}/${slug}/${tool.slug}`}
                                                    className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                >
                                                    <h3 className="font-bold text-center mb-2 text-lg">
                                                        {tool.h1 || tool.title}
                                                    </h3>
                                                    {tool.meta_description && (
                                                        <p className="text-center text-sm text-gray-600">
                                                            {tool.meta_description}
                                                        </p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* SEO-описание */}
                                {(ogTitle || ogDescription) && (
                                    <div className="mb-12">
                                        {ogTitle && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {ogTitle}
                                            </h2>
                                        )}
                                        {ogDescription && (
                                            <p className="text-lg text-gray-700">
                                                {ogDescription}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Правая колонка: Баннеры (Desktop) */}
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
                <div className="lg:hidden">
                    {/* Хлебные крошки */}
                    <nav className="mb-4 text-sm text-gray-600">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.href}>
                                {index > 0 && <span className="mx-2">/</span>}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-gray-900">{crumb.name}</span>
                                ) : (
                                    <Link href={crumb.href} className="hover:text-blue-600">
                                        {crumb.name}
                                    </Link>
                                )}
                            </span>
                        ))}
                    </nav>

                    {hasChildren ? (
                        // Вариант А: Мобильная версия с дочерними категориями
                        <>
                            {/* Заголовок страницы */}
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                {categoryI18n.name}
                            </h2>

                            {/* Список дочерних категорий */}
                            <div className="space-y-4 mb-12">
                                {childCategories.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/${lang}/${child.slug}`}
                                        className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                    >
                                        <h3 className="font-bold text-center mb-2 text-lg">
                                            {child.name}
                                        </h3>
                                        {child.og_description && (
                                            <p className="text-center text-gray-600 text-sm">
                                                {child.og_description}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* SEO-описание */}
                            {(ogTitle || ogDescription) && (
                                <div className="mb-12">
                                    {ogTitle && (
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            {ogTitle}
                                        </h2>
                                    )}
                                    {ogDescription && (
                                        <p className="text-lg text-gray-700">
                                            {ogDescription}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Секция "Популярные калькуляторы" - после SEO-описания */}
                            {popularTools.length > 0 && (
                                <div className="mb-12">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                        Popular {categoryI18n.name}
                                    </h2>
                                    <div className="space-y-[20px]">
                                        {popularTools.map((tool, index) => {
                                            const showAdAfter1 = index === 1 // После 2-го баннера
                                            const showAdAfter2 = index === 3 // После 4-го баннера
                                            const showAdAfter3 = index === 6 // После 7-го баннера
                                            const showAdAfter4 = index === 8 // После 9-го баннера

                                            return (
                                                <div key={tool.id}>
                                                    <Link
                                                        href={`/${lang}/${slug}/${tool.slug}`}
                                                        className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                    >
                                                        <h3 className="font-bold text-center mb-2 text-lg">
                                                            {tool.h1 || tool.title}
                                                        </h3>
                                                        {tool.meta_description && (
                                                            <p className="text-center text-sm text-gray-600">
                                                                {tool.meta_description}
                                                            </p>
                                                        )}
                                                    </Link>
                                                    {showAdAfter1 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={1}
                                                                href={content.ad_link_1}
                                                            />
                                                        </div>
                                                    )}
                                                    {showAdAfter2 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={2}
                                                                href={content.ad_link_2}
                                                            />
                                                        </div>
                                                    )}
                                                    {showAdAfter3 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={3}
                                                                href={content.ad_link_3}
                                                            />
                                                        </div>
                                                    )}
                                                    {showAdAfter4 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={4}
                                                                href={content.ad_link_4}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Вариант Б: Мобильная версия конечной категории
                        <>
                            {/* Секция "Популярные калькуляторы" */}
                            {popularTools.length > 0 && (
                                <div className="mb-12">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                        Popular {categoryI18n.name}
                                    </h2>
                                    <div className="space-y-[20px]">
                                        {popularTools.map((tool, index) => {
                                            const toolIndex = index
                                            const showAdAfter1 = toolIndex === 1 // После 2-го баннера
                                            const showAdAfter2 = toolIndex === 3 // После 4-го баннера
                                            const showAdAfter3 = toolIndex === 6 // После 7-го баннера
                                            const showAdAfter4 = toolIndex === 8 // После 9-го баннера

                                            return (
                                                <div key={tool.id}>
                                                    <Link
                                                        href={`/${lang}/${slug}/${tool.slug}`}
                                                        className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                    >
                                                        <h3 className="font-bold text-center mb-2 text-lg">
                                                            {tool.h1 || tool.title}
                                                        </h3>
                                                        {tool.meta_description && (
                                                            <p className="text-center text-sm text-gray-600">
                                                                {tool.meta_description}
                                                            </p>
                                                        )}
                                                    </Link>
                                                    {showAdAfter1 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={1}
                                                                href={content.ad_link_1}
                                                            />
                                                        </div>
                                                    )}
                                                    {showAdAfter2 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={2}
                                                                href={content.ad_link_2}
                                                            />
                                                        </div>
                                                    )}
                                                    {showAdAfter3 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={3}
                                                                href={content.ad_link_3}
                                                            />
                                                        </div>
                                                    )}
                                                    {showAdAfter4 && (
                                                        <div className="mt-5">
                                                            <AdBanner
                                                                lang={lang}
                                                                adNumber={4}
                                                                href={content.ad_link_4}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Секция "Все калькуляторы" */}
                            {content.body_h2_3 && (
                                <section className="mb-12">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                        {content.body_h2_3}
                                    </h2>
                                    <div className="space-y-4">
                                        {allTools.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={`/${lang}/${slug}/${tool.slug}`}
                                                className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                            >
                                                <h3 className="font-bold text-center mb-2 text-lg">
                                                    {tool.h1 || tool.title}
                                                </h3>
                                                {tool.meta_description && (
                                                    <p className="text-center text-sm text-gray-600">
                                                        {tool.meta_description}
                                                    </p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* SEO-описание */}
                            {(ogTitle || ogDescription) && (
                                <div className="mb-12">
                                    {ogTitle && (
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            {ogTitle}
                                        </h2>
                                    )}
                                    {ogDescription && (
                                        <p className="text-lg text-gray-700">
                                            {ogDescription}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
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

