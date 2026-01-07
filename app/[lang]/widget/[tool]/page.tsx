import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import { getTranslations } from '@/lib/translations'
import type { Metadata } from 'next'
import React from 'react'
import WidgetCodeBlock from '@/components/WidgetCodeBlock'

type Props = {
    params: Promise<{ lang: string; tool: string }>
}

// Интерфейс для секций body_blocks_json
interface WidgetSection {
    type?: string
    heading?: string
    html: string
}

interface WidgetPageContent {
    title?: string
    sections: WidgetSection[]
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, tool: slug } = await params

    try {
        // Получаем данные инструмента
        const toolI18n = await prisma.toolI18n.findUnique({
            where: {
                lang_slug: {
                    lang,
                    slug,
                },
            },
            select: {
                title: true,
            },
        })

        if (!toolI18n) {
            return {
                title: 'Widget Not Found',
            }
        }

        // Получаем шаблон страницы виджета
        // Пробуем разные варианты code: 'widget', 'id104', '104'
        // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
        let widgetPage = await prisma.pageI18n.findFirst({
            where: {
                page: {
                    code: 'widget'
                },
                lang,
            },
            select: {
                meta_title: true,
                meta_description: true,
            },
        })

        // Если не нашли, пробуем другие варианты
        if (!widgetPage) {
            // @ts-ignore
            widgetPage = await prisma.pageI18n.findFirst({
                where: {
                    page: {
                        code: 'id104'
                    },
                    lang,
                },
                select: {
                    meta_title: true,
                    meta_description: true,
                },
            })
        }

        if (!widgetPage) {
            // @ts-ignore
            widgetPage = await prisma.pageI18n.findFirst({
                where: {
                    page: {
                        code: '104'
                    },
                    lang,
                },
                select: {
                    meta_title: true,
                    meta_description: true,
                },
            })
        }

        const toolName = toolI18n.title
        const metaTitle = widgetPage?.meta_title?.replace('{Tool Name}', toolName) || `${toolName} Widget – Free Calculator Widget | CalculatorScope`
        const metaDescription = widgetPage?.meta_description?.replace('{Tool Name}', toolName) || `Add the free ${toolName} widget to your website or blog. Copy the HTML code, preview the calculator popup, and improve user engagement easily.`

        const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
        const canonicalUrl = `${url}/${lang}/widget/${slug}`

        return {
            title: metaTitle,
            description: metaDescription,
            robots: 'index,follow',
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title: metaTitle,
                description: metaDescription,
                locale: lang,
                type: 'website',
            },
        }
    } catch (error) {
        console.error('Error in generateMetadata:', error)
        return {
            title: 'Calculator Scope Widget',
        }
    }
}

// Функция замены плейсхолдеров
function replacePlaceholders(text: string, toolName: string, toolSlug: string, lang: string): string {
    return text
        .replace(/{tool_name}/g, toolName)
        .replace(/{Tool Name}/g, toolName)
        .replace(/{tool_slug}/g, toolSlug)
        .replace(/{lang}/g, lang)
}

export default async function WidgetPage({ params }: Props) {
    const { lang, tool: slug } = await params
    const translations = getTranslations(lang)

    // Получаем данные инструмента
    const toolI18n = await prisma.toolI18n.findUnique({
        where: {
            lang_slug: {
                lang,
                slug,
            },
        },
        select: {
            tool_id: true,
            title: true,
            slug: true,
        },
    })

    if (!toolI18n) {
        notFound()
    }

    const toolName = toolI18n.title
    const toolSlug = toolI18n.slug

    // Получаем шаблон страницы виджета
    // Пробуем разные варианты code: 'widget', 'id104', '104'
    // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
    let widgetPage = await prisma.pageI18n.findFirst({
        where: {
            page: {
                code: 'widget'
            },
            lang,
        },
        select: {
            h1: true,
            body_blocks_json: true,
        },
    })

    // Если не нашли, пробуем другие варианты
    if (!widgetPage) {
        // @ts-ignore
        widgetPage = await prisma.pageI18n.findFirst({
            where: {
                page: {
                    code: 'id104'
                },
                lang,
            },
            select: {
                h1: true,
                body_blocks_json: true,
            },
        })
    }

    if (!widgetPage) {
        // @ts-ignore
        widgetPage = await prisma.pageI18n.findFirst({
            where: {
                page: {
                    code: '104'
                },
                lang,
            },
            select: {
                h1: true,
                body_blocks_json: true,
            },
        })
    }

    if (!widgetPage || !widgetPage.body_blocks_json) {
        console.error(`Widget page template not found for lang: ${lang}, tool: ${slug}`)
        notFound()
    }

    // Парсим body_blocks_json
    let pageContent: WidgetPageContent = { sections: [] }
    try {
        const parsed = typeof widgetPage.body_blocks_json === 'string'
            ? JSON.parse(widgetPage.body_blocks_json)
            : widgetPage.body_blocks_json
        pageContent = parsed as WidgetPageContent
    } catch (e) {
        console.error('Error parsing body_blocks_json:', e)
        notFound()
    }

    // Заменяем плейсхолдеры в H1
    const h1 = widgetPage.h1?.replace('{Tool Name}', toolName) || `${toolName} Widget`

    // Генерируем код виджета
    const widgetCode = `<!-- Calculator Widget Copyright CalculatorScope -->
<a href="https://www.calculatorscope.com/${lang}/${toolSlug}"
onclick="window.open(
'https://www.calculatorscope.com/${lang}/${toolSlug}?do=pop',
'${toolName}',
'width=400,height=600,toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
); return false;">
${toolName}
</a>`

    // Генерируем ссылки
    const directUrl = `https://www.calculatorscope.com/${lang}/${toolSlug}?src=link_direct`
    const htmlLinkCode = `<a href="https://www.calculatorscope.com/${lang}/${toolSlug}?src=link_hyper" title="Calculator" target="_blank">${toolName}</a>`
    const copyLinkUrl = `https://www.calculatorscope.com/${lang}/${toolSlug}?src=link_copied`

    // Получаем данные для рекламных баннеров (используем те же ссылки что и на главной)
    let adContent: {
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
            adContent = parsed as typeof adContent
        }
    } catch (e) {
        console.error('Error parsing home page body_blocks_json:', e)
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
                            {h1}
                        </h1>

                        {/* Body content */}
                        <div className="prose lg:prose-xl max-w-none">
                            {pageContent.sections.map((section, index) => (
                                <section key={index} className={index > 0 ? 'mt-8' : ''}>
                                    {section.heading && (
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                        </h2>
                                    )}
                                    {section.type === 'widget_code' && (
                                        <div>
                                            {section.heading && (
                                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                    {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                                </h3>
                                            )}
                                            <WidgetCodeBlock
                                                code={section.html ? replacePlaceholders(section.html, toolName, toolSlug, lang) : ''}
                                                widgetCode={widgetCode}
                                            />
                                        </div>
                                    )}
                                    {section.type === 'links' && (
                                        <div>
                                            {section.heading && (
                                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                    {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                                </h3>
                                            )}
                                            <div
                                                className="prose"
                                                dangerouslySetInnerHTML={{
                                                    __html: replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                        .replace(/{direct_url}/g, directUrl)
                                                        .replace(/{html_link_code}/g, htmlLinkCode)
                                                        .replace(/{copy_link_url}/g, copyLinkUrl)
                                                }}
                                            />
                                        </div>
                                    )}
                                    {section.html && section.type !== 'widget_code' && section.type !== 'links' && (
                                        <div
                                            className="prose"
                                            dangerouslySetInnerHTML={{
                                                __html: replacePlaceholders(section.html, toolName, toolSlug, lang)
                                            }}
                                        />
                                    )}
                                </section>
                            ))}
                        </div>
                    </div>

                    {/* Правая колонка: Баннеры (не отображается на мобильных) */}
                    <div className="w-[300px] space-y-5" style={{ marginTop: '21px' }}>
                        <AdBanner
                            lang={lang}
                            adNumber={1}
                            href={adContent.ad_link_1}
                        />
                        <AdBanner
                            lang={lang}
                            adNumber={2}
                            href={adContent.ad_link_2}
                        />
                        <AdBanner
                            lang={lang}
                            adNumber={3}
                            href={adContent.ad_link_3}
                        />
                        <AdBanner
                            lang={lang}
                            adNumber={4}
                            href={adContent.ad_link_4}
                        />
                    </div>
                </div>

                {/* Mobile: Только контент, без рекламной колонки */}
                <div className="lg:hidden">
                    {/* H1 */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        {h1}
                    </h1>

                    {/* Body content */}
                    <div className="prose lg:prose-xl max-w-none">
                        {pageContent.sections.map((section, index) => (
                            <section key={index} className={index > 0 ? 'mt-8' : ''}>
                                {section.heading && (
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                        {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                    </h2>
                                )}
                                {section.type === 'widget_code' && (
                                    <div>
                                        {section.heading && (
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                            </h3>
                                        )}
                                        <WidgetCodeBlock
                                            code={section.html ? replacePlaceholders(section.html, toolName, toolSlug, lang) : ''}
                                            widgetCode={widgetCode}
                                        />
                                    </div>
                                )}
                                {section.type === 'links' && (
                                    <div>
                                        {section.heading && (
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                            </h3>
                                        )}
                                        <div
                                            className="prose"
                                            dangerouslySetInnerHTML={{
                                                __html: replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                    .replace(/{direct_url}/g, directUrl)
                                                    .replace(/{html_link_code}/g, htmlLinkCode)
                                                    .replace(/{copy_link_url}/g, copyLinkUrl)
                                            }}
                                        />
                                    </div>
                                )}
                                {section.html && section.type !== 'widget_code' && section.type !== 'links' && (
                                    <div
                                        className="prose"
                                        dangerouslySetInnerHTML={{
                                            __html: replacePlaceholders(section.html, toolName, toolSlug, lang)
                                        }}
                                    />
                                )}
                            </section>
                        ))}
                    </div>
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
