import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import { getTranslations } from '@/lib/translations'
import type { Metadata } from 'next'
import React from 'react'
import WidgetCodeBlock from '@/components/WidgetCodeBlock'
import CopyableCodeBlock from '@/components/CopyableCodeBlock'
import { processLatex } from '@/lib/latex-server'

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
                h1: true,
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

        const toolName = toolI18n.h1 || toolI18n.title
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
            h1: true,
            slug: true,
        },
    })

    if (!toolI18n) {
        notFound()
    }

    // Используем h1, если есть, иначе title
    const toolName = toolI18n.h1 || toolI18n.title
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
                                    {/* Показываем общий заголовок только для секций без специального типа */}
                                    {section.heading && !section.type && (
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                        </h2>
                                    )}
                                    {section.type === 'widget_code' && (
                                        <div>
                                            {section.heading && (
                                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                    {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                                </h2>
                                            )}
                                            {(() => {
                                                // Обрабатываем HTML: заменяем ссылку на preview кнопкой и удаляем старую ссылку виджета
                                                let processedHtml = section.html ? replacePlaceholders(section.html, toolName, toolSlug, lang) : ''
                                                
                                                // Удаляем старую ссылку виджета (если она есть в HTML)
                                                processedHtml = processedHtml.replace(/<a\s+href="[^"]*"[^>]*onclick="[^"]*"[^>]*>[\s\S]*?<\/a>/gi, (match) => {
                                                    // Если это не preview ссылка, удаляем её
                                                    if (!match.includes('widget-preview-link')) {
                                                        return ''
                                                    }
                                                    return match
                                                })
                                                
                                                // Заменяем preview ссылку на placeholder, который будет заменен на кнопку в компоненте
                                                // (компонент сам заменит ссылку через useEffect)
                                                
                                                return (
                                                    <WidgetCodeBlock
                                                        code={processedHtml}
                                                        widgetCode={widgetCode}
                                                    />
                                                )
                                            })()}
                                        </div>
                                    )}
                                    {section.type === 'links' && (
                                        <div>
                                            {section.heading && (
                                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                    {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                                </h2>
                                            )}
                                            <div className="prose">
                                                {/* Парсим HTML и заменяем блоки с кодом на компоненты с кнопкой Copy */}
                                                {(() => {
                                                    const html = replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                        .replace(/{direct_url}/g, directUrl)
                                                        .replace(/{html_link_code}/g, htmlLinkCode)
                                                        .replace(/{copy_link_url}/g, copyLinkUrl)
                                                    
                                                    // Извлекаем Direct URL из <code> (более надежный regex)
                                                    const directUrlMatch = html.match(/<h3>Direct URL<\/h3>[\s\S]*?<p><code>([\s\S]*?)<\/code><\/p>/)
                                                    const htmlLinkMatch = html.match(/<h3>HTML Link Code<\/h3>[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/)
                                                    
                                                    // Удаляем все дублирующиеся заголовки и блоки с кодом из HTML
                                                    let processedHtml = html
                                                    
                                                    // Удаляем заголовки h3 и связанные блоки
                                                    processedHtml = processedHtml.replace(/<h3>Direct URL<\/h3>[\s\S]*?<p><code>[\s\S]*?<\/code><\/p>/gi, '')
                                                    processedHtml = processedHtml.replace(/<h3>HTML Link Code<\/h3>[\s\S]*?<pre><code>[\s\S]*?<\/code><\/pre>/gi, '')
                                                    processedHtml = processedHtml.replace(/<h3>Right-Click Copy Link<\/h3>[\s\S]*?<p><a[^>]*>[\s\S]*?<\/a><\/p>/gi, '')
                                                    
                                                    // Удаляем дублирующиеся блоки с кнопками Copy (если они есть в HTML)
                                                    processedHtml = processedHtml.replace(/<div class="bg-gray-50[^"]*">[\s\S]*?Direct URL[\s\S]*?<\/div>/gi, '')
                                                    processedHtml = processedHtml.replace(/<div class="bg-gray-50[^"]*">[\s\S]*?HTML Link Code[\s\S]*?<\/div>/gi, '')
                                                    
                                                    // Декодируем HTML entities
                                                    const decodeHtml = (str: string) => {
                                                        return str
                                                            .replace(/&lt;/g, '<')
                                                            .replace(/&gt;/g, '>')
                                                            .replace(/&amp;/g, '&')
                                                            .replace(/&quot;/g, '"')
                                                            .replace(/&#39;/g, "'")
                                                    }
                                                    
                                                    return (
                                                        <>
                                                            <div dangerouslySetInnerHTML={{ __html: processLatex(processedHtml) }} />
                                                            {directUrlMatch && (
                                                                <CopyableCodeBlock
                                                                    label="Direct URL"
                                                                    code={decodeHtml(directUrlMatch[1].trim())}
                                                                />
                                                            )}
                                                            {htmlLinkMatch && (
                                                                <CopyableCodeBlock
                                                                    label="HTML Link Code"
                                                                    code={decodeHtml(htmlLinkMatch[1].trim())}
                                                                />
                                                            )}
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                    {/* Секции типа intro - отображаем HTML */}
                                    {section.type === 'intro' && section.html && (
                                        <div
                                            className="prose"
                                            dangerouslySetInnerHTML={{
                                                __html: processLatex(replacePlaceholders(section.html, toolName, toolSlug, lang))
                                            }}
                                        />
                                    )}
                                    {/* Секции типа widget_preview - отображаем с заголовком и HTML */}
                                    {section.type === 'widget_preview' && section.html && (
                                        <div>
                                            {section.heading && (
                                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                    {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                                </h2>
                                            )}
                                            <div
                                                className="prose"
                                                dangerouslySetInnerHTML={{
                                                    __html: processLatex((() => {
                                                        let html = replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                        
                                                        // Преобразуем ссылку widget-preview-link в кнопку
                                                        html = html.replace(
                                                            /<p><a\s+[^>]*class="widget-preview-link"[^>]*onclick="([^"]*)"[^>]*>([\s\S]*?)<\/a><\/p>/gi,
                                                            (match, onclickAttr, linkText) => {
                                                                // Извлекаем текст, удаляя все HTML теги, но сохраняя структуру для отображения
                                                                // Если есть <strong>, извлекаем его содержимое, иначе берем весь текст
                                                                let buttonText = linkText
                                                                const strongMatch = buttonText.match(/<strong>(.*?)<\/strong>/i)
                                                                if (strongMatch) {
                                                                    buttonText = strongMatch[1]
                                                                } else {
                                                                    // Удаляем все HTML теги, оставляем только текст
                                                                    buttonText = buttonText.replace(/<[^>]+>/g, '').trim()
                                                                }
                                                                
                                                                // Экранируем двойные кавычки в onclick для безопасной вставки в HTML
                                                                // (хотя в данном случае их там нет, но для безопасности)
                                                                const escapedOnclick = onclickAttr.replace(/"/g, '&quot;')
                                                                
                                                                // Создаем кнопку с теми же стилями
                                                                return `<p><button onclick="${escapedOnclick}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">${buttonText}</button></p>`
                                                            }
                                                        )
                                                        
                                                        return html
                                                    })())
                                                }}
                                            />
                                        </div>
                                    )}
                                    {/* Остальные секции без типа или с другими типами */}
                                    {section.html && !section.type && section.type !== 'widget_preview' && section.type !== 'intro' && (
                                        <div
                                            className="prose"
                                            dangerouslySetInnerHTML={{
                                                __html: processLatex((() => {
                                                    let html = replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                    
                                                    // Удаляем дублирующиеся блоки preview из HTML
                                                    // Ищем все блоки с заголовком "Preview the ... Widget"
                                                    const previewPattern = /<div>[\s\S]*?<h2[^>]*>Preview[^<]*Widget[^<]*<\/h2>[\s\S]*?<\/div>/gi
                                                    const matches = [...html.matchAll(previewPattern)]
                                                    
                                                    if (matches.length > 1) {
                                                        // Оставляем только первый блок, удаляем остальные
                                                        for (let i = matches.length - 1; i > 0; i--) {
                                                            const match = matches[i]
                                                            if (match[0]) {
                                                                html = html.replace(match[0], '')
                                                            }
                                                        }
                                                    }
                                                    
                                                    return html
                                                })())
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
                                {/* Показываем общий заголовок только для секций без специального типа */}
                                {section.heading && !section.type && (
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                        {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                    </h2>
                                )}
                                {section.type === 'widget_code' && (
                                    <div>
                                        {section.heading && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                            </h2>
                                        )}
                                        {(() => {
                                            // Обрабатываем HTML: заменяем ссылку на preview кнопкой и удаляем старую ссылку виджета
                                            let processedHtml = section.html ? replacePlaceholders(section.html, toolName, toolSlug, lang) : ''
                                            
                                            // Удаляем старую ссылку виджета (если она есть в HTML)
                                            processedHtml = processedHtml.replace(/<a\s+href="[^"]*"[^>]*onclick="[^"]*"[^>]*>[\s\S]*?<\/a>/gi, (match) => {
                                                // Если это не preview ссылка, удаляем её
                                                if (!match.includes('widget-preview-link')) {
                                                    return ''
                                                }
                                                return match
                                            })
                                            
                                            return (
                                                <WidgetCodeBlock
                                                    code={processedHtml}
                                                    widgetCode={widgetCode}
                                                />
                                            )
                                        })()}
                                    </div>
                                )}
                                {section.type === 'links' && (
                                    <div>
                                        {section.heading && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                            </h2>
                                        )}
                                        <div className="prose">
                                            {/* Парсим HTML и заменяем блоки с кодом на компоненты с кнопкой Copy */}
                                            {(() => {
                                                const html = replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                    .replace(/{direct_url}/g, directUrl)
                                                    .replace(/{html_link_code}/g, htmlLinkCode)
                                                    .replace(/{copy_link_url}/g, copyLinkUrl)
                                                
                                                // Извлекаем Direct URL из <code> (более надежный regex)
                                                const directUrlMatch = html.match(/<h3>Direct URL<\/h3>[\s\S]*?<p><code>([\s\S]*?)<\/code><\/p>/)
                                                const htmlLinkMatch = html.match(/<h3>HTML Link Code<\/h3>[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/)
                                                
                                                // Удаляем все дублирующиеся заголовки и блоки с кодом из HTML
                                                let processedHtml = html
                                                
                                                // Удаляем заголовки h3 и связанные блоки
                                                processedHtml = processedHtml.replace(/<h3>Direct URL<\/h3>[\s\S]*?<p><code>[\s\S]*?<\/code><\/p>/gi, '')
                                                processedHtml = processedHtml.replace(/<h3>HTML Link Code<\/h3>[\s\S]*?<pre><code>[\s\S]*?<\/code><\/pre>/gi, '')
                                                processedHtml = processedHtml.replace(/<h3>Right-Click Copy Link<\/h3>[\s\S]*?<p><a[^>]*>[\s\S]*?<\/a><\/p>/gi, '')
                                                
                                                // Удаляем дублирующиеся блоки с кнопками Copy (если они есть в HTML)
                                                processedHtml = processedHtml.replace(/<div class="bg-gray-50[^"]*">[\s\S]*?Direct URL[\s\S]*?<\/div>/gi, '')
                                                processedHtml = processedHtml.replace(/<div class="bg-gray-50[^"]*">[\s\S]*?HTML Link Code[\s\S]*?<\/div>/gi, '')
                                                
                                                // Декодируем HTML entities
                                                const decodeHtml = (str: string) => {
                                                    return str
                                                        .replace(/&lt;/g, '<')
                                                        .replace(/&gt;/g, '>')
                                                        .replace(/&amp;/g, '&')
                                                        .replace(/&quot;/g, '"')
                                                        .replace(/&#39;/g, "'")
                                                }
                                                
                                                return (
                                                    <>
                                                        <div dangerouslySetInnerHTML={{ __html: processLatex(processedHtml) }} />
                                                        {directUrlMatch && (
                                                            <CopyableCodeBlock
                                                                label="Direct URL"
                                                                code={decodeHtml(directUrlMatch[1].trim())}
                                                            />
                                                        )}
                                                        {htmlLinkMatch && (
                                                            <CopyableCodeBlock
                                                                label="HTML Link Code"
                                                                code={decodeHtml(htmlLinkMatch[1].trim())}
                                                            />
                                                        )}
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                )}
                                {/* Секции типа intro - отображаем HTML */}
                                {section.type === 'intro' && section.html && (
                                    <div
                                        className="prose"
                                        dangerouslySetInnerHTML={{
                                            __html: processLatex(replacePlaceholders(section.html, toolName, toolSlug, lang))
                                        }}
                                    />
                                )}
                                {/* Секции типа widget_preview - отображаем с заголовком и HTML */}
                                {section.type === 'widget_preview' && section.html && (
                                    <div>
                                        {section.heading && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {replacePlaceholders(section.heading, toolName, toolSlug, lang)}
                                            </h2>
                                        )}
                                        <div
                                            className="prose"
                                            dangerouslySetInnerHTML={{
                                                __html: processLatex((() => {
                                                    let html = replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                    
                                                    // Преобразуем ссылку widget-preview-link в кнопку
                                                    html = html.replace(
                                                        /<p><a\s+[^>]*class="widget-preview-link"[^>]*onclick="([^"]*)"[^>]*>([\s\S]*?)<\/a><\/p>/gi,
                                                        (match, onclickAttr, linkText) => {
                                                            // Извлекаем текст, удаляя все HTML теги, но сохраняя структуру для отображения
                                                            // Если есть <strong>, извлекаем его содержимое, иначе берем весь текст
                                                            let buttonText = linkText
                                                            const strongMatch = buttonText.match(/<strong>(.*?)<\/strong>/i)
                                                            if (strongMatch) {
                                                                buttonText = strongMatch[1]
                                                            } else {
                                                                // Удаляем все HTML теги, оставляем только текст
                                                                buttonText = buttonText.replace(/<[^>]+>/g, '').trim()
                                                            }
                                                            
                                                            // Экранируем двойные кавычки в onclick для безопасной вставки в HTML
                                                            // (хотя в данном случае их там нет, но для безопасности)
                                                            const escapedOnclick = onclickAttr.replace(/"/g, '&quot;')
                                                            
                                                            // Создаем кнопку с теми же стилями
                                                            return `<p><button onclick="${escapedOnclick}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">${buttonText}</button></p>`
                                                        }
                                                    )
                                                    
                                                    return html
                                                })())
                                            }}
                                        />
                                    </div>
                                )}
                                {/* Остальные секции без типа или с другими типами */}
                                {section.html && !section.type && section.type !== 'widget_preview' && section.type !== 'intro' && (
                                    <div
                                        className="prose"
                                        dangerouslySetInnerHTML={{
                                            __html: processLatex((() => {
                                                let html = replacePlaceholders(section.html, toolName, toolSlug, lang)
                                                
                                                // Удаляем дублирующиеся блоки preview из HTML
                                                // Ищем все блоки с заголовком "Preview the ... Widget"
                                                const previewPattern = /<div>[\s\S]*?<h2[^>]*>Preview[^<]*Widget[^<]*<\/h2>[\s\S]*?<\/div>/gi
                                                const matches = [...html.matchAll(previewPattern)]
                                                
                                                if (matches.length > 1) {
                                                    // Оставляем только первый блок, удаляем остальные
                                                    for (let i = matches.length - 1; i > 0; i--) {
                                                        const match = matches[i]
                                                        if (match[0]) {
                                                            html = html.replace(match[0], '')
                                                        }
                                                    }
                                                }
                                                
                                                return html
                                            })())
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
