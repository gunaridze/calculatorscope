import { notFound } from 'next/navigation'
import { getToolData, getPageByCode } from '@/lib/db'
import CalculatorWidget from '@/components/CalculatorWidget'
import { calculate, type JsonEngineConfig, type JsonEngineOutput } from '@/core/engines/json'
import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import { getTranslations } from '@/lib/translations'
import Breadcrumbs from '@/components/Breadcrumbs'
import AdBanner from '@/components/AdBanner'
import Header from '@/components/Header'
import React from 'react'

// Интерфейс для content_blocks_json
interface ContentBlock {
    type: 'h2' | 'paragraph' | 'html' | 'section'
    content: string
    id?: string  // Опциональный id для секции
}

// Типы для параметров URL (в Next.js 15+ это Promise)
type Props = {
    params: Promise<{
        lang: string
        category: string
        tool: string
    }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Генерация метаданных для SEO
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { lang, tool: slug } = await params
    const data = await getToolData(slug, lang)

    if (!data) {
        return {
            title: 'Tool Not Found',
        }
    }

    const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
    const canonicalUrl = `${url}/${lang}/${slug}`

    return {
        title: data.meta_title || data.title,
        description: data.meta_description || data.intro_text || undefined,
        robots: data.meta_robots || 'index,follow,max-snippet:300',
        alternates: {
            canonical: data.canonical_path || canonicalUrl,
        },
        openGraph: {
            title: data.og_title || data.meta_title || data.title,
            description: data.og_description || data.meta_description || data.intro_text || undefined,
            images: data.og_image_url ? [{ url: data.og_image_url }] : undefined,
            locale: lang,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: data.twitter_title || data.og_title || data.title,
            description: data.twitter_description || data.og_description || data.meta_description || undefined,
            images: data.twitter_image_url || data.og_image_url ? [data.twitter_image_url || data.og_image_url!] : undefined,
        },
    }
}

// Компонент для инъекции баннеров в мобильной версии
function ContentWithAds({ 
    content, 
    lang 
}: { 
    content: Array<{ node: React.ReactNode, sectionType?: string }>, 
    lang: string 
}) {
    const result: React.ReactNode[] = []

    content.forEach((item, idx) => {
        // Добавляем баннер перед конкретными секциями
        if (item.sectionType === 'short_answer') {
            result.push(
                <div key={`ad-before-short-answer`} className="my-5">
                    <AdBanner lang={lang} adNumber={2} />
                </div>
            )
        } else if (item.sectionType === 'key_points') {
            result.push(
                <div key={`ad-before-key-points`} className="my-5">
                    <AdBanner lang={lang} adNumber={3} />
                </div>
            )
        } else if (item.sectionType === 'examples') {
            result.push(
                <div key={`ad-before-examples`} className="my-5">
                    <AdBanner lang={lang} adNumber={4} />
                </div>
            )
        }
        
        result.push(<React.Fragment key={idx}>{item.node}</React.Fragment>)
    })

    return <>{result}</>
}

export default async function ToolPage({ params, searchParams }: Props) {
    // 1. ВАЖНО: Ждем разрешения параметров
    const { lang, tool: slug, category } = await params
    const search = await searchParams

    // 2. Запрашиваем данные из БД
    const data = await getToolData(slug, lang)

    // 3. Если такого инструмента нет — отдаем 404
    if (!data) {
        return notFound()
    }

    // Получаем переводы для текущего языка
    const translations = getTranslations(lang)

    // Получаем страницу виджета (id105)
    const widgetPage = await getPageByCode('id105', lang)

    // Строим breadcrumbs
    const breadcrumbs = [
        { name: 'Calculator Scope', href: `/${lang}` },
    ]

    // Добавляем категории
    if (data.tool.categories && data.tool.categories.length > 0) {
        const categoryData = data.tool.categories[0].category
        if (categoryData.i18n && categoryData.i18n.length > 0) {
            const catI18n = categoryData.i18n[0]
            breadcrumbs.push({
                name: catI18n.name || category,
                href: `/${lang}/${catI18n.slug || category}`
            })
        }
    }

    // Добавляем текущий инструмент
    breadcrumbs.push({
        name: data.h1 || data.title,
        href: `/${lang}/${category}/${slug}`
    })

    // 4. Достаем конфиги из JSON полей
    // @ts-ignore (TypeScript не всегда корректно типизирует JSON из Prisma)
    const config: JsonEngineConfig = data.tool.config?.config_json
    // Добавляем язык в конфиг для локализации
    if (config) {
        config.language = lang
    }
    // @ts-ignore
    const interfaceData = data.inputs_json || {} // Используем inputs_json вместо interface_json

    // 5. Обработка share links (server-side calculation только для ?share=1)
    let initialValues: Record<string, number> | undefined = undefined
    const isShareLink = search.share === '1' || search.share === 'true'

    if (isShareLink && config) {
        // Извлекаем значения из query params для share link
        const shareValues: Record<string, number> = {}
        config.inputs.forEach((inp: any) => {
            const paramValue = search[inp.key]
            if (paramValue) {
                const numValue = typeof paramValue === 'string' 
                    ? parseFloat(paramValue) 
                    : parseFloat(String(paramValue[0]))
                if (!isNaN(numValue)) {
                    shareValues[inp.key] = numValue
                }
            }
        })
        if (Object.keys(shareValues).length > 0) {
            initialValues = shareValues
        }
    }

    // 6. Генерация примеров через единый движок (для SEO/AI)
    let examples: Array<{ inputs: Record<string, number>, outputs: JsonEngineOutput }> = []
    if (config && data.examples_json) {
        try {
            // @ts-ignore
            const examplesData = typeof data.examples_json === 'string' 
                ? JSON.parse(data.examples_json) 
                : data.examples_json
            
            if (Array.isArray(examplesData)) {
                examples = examplesData.map((ex: any) => ({
                    inputs: ex.inputs || {},
                    outputs: calculate(config, ex.inputs || {})
                }))
            }
        } catch (e) {
            console.error('Error parsing examples_json:', e)
        }
    }

    // Парсим content_blocks_json
    let contentBlocks: ContentBlock[] = []
    if (data.content_blocks_json) {
        try {
            // @ts-ignore
            const parsed = typeof data.content_blocks_json === 'string'
                ? JSON.parse(data.content_blocks_json)
                : data.content_blocks_json
            
            if (Array.isArray(parsed)) {
                contentBlocks = parsed as ContentBlock[]
            }
        } catch (e) {
            console.error('Error parsing content_blocks_json:', e)
        }
    }

    // Подготавливаем контент для мобильной версии (с маркерами секций для баннеров)
    const contentSections: Array<{ node: React.ReactNode, sectionType?: string }> = []

    // Intro text
    if (data.intro_text) {
        contentSections.push({
            node: (
                <div 
                    key="intro" 
                    className="mb-4 prose lg:prose-xl text-gray-700"
                    dangerouslySetInnerHTML={{ __html: data.intro_text }}
                />
            )
        })
    }

    // Рендерим content_blocks_json (если есть)
    if (contentBlocks.length > 0) {
        contentBlocks.forEach((block, idx) => {
            switch (block.type) {
                case 'h2':
                    contentSections.push({
                        node: (
                            <h2 
                                key={`content-block-h2-${idx}`} 
                                className="text-3xl font-bold mb-6 mt-8"
                                id={block.id}
                            >
                                {block.content}
                            </h2>
                        )
                    })
                    break
                case 'paragraph':
                    contentSections.push({
                        node: (
                            <p key={`content-block-p-${idx}`} className="mb-4 text-gray-700">
                                {block.content}
                            </p>
                        )
                    })
                    break
                case 'html':
                    contentSections.push({
                        node: (
                            <div 
                                key={`content-block-html-${idx}`} 
                                className="mb-4 prose lg:prose-xl"
                                dangerouslySetInnerHTML={{ __html: block.content }}
                            />
                        )
                    })
                    break
                case 'section':
                    contentSections.push({
                        node: (
                            <section 
                                key={`content-block-section-${idx}`} 
                                className="mb-12 prose lg:prose-xl"
                                id={block.id}
                            >
                                <div dangerouslySetInnerHTML={{ __html: block.content }} />
                            </section>
                        )
                    })
                    break
            }
        })
    }

    // Short Answer Section
    if (data.short_answer) {
        contentSections.push({
            node: (
                <div 
                    key="short-answer" 
                    className="mb-4 prose lg:prose-xl"
                    dangerouslySetInnerHTML={{ __html: data.short_answer }}
                />
            ),
            sectionType: 'short_answer'
        })
    }

    // Key Points Section
    if (data.key_points_json) {
        try {
            // @ts-ignore
            const keyPoints = typeof data.key_points_json === 'string'
                ? JSON.parse(data.key_points_json)
                : data.key_points_json
            
            if (Array.isArray(keyPoints) && keyPoints.length > 0) {
                contentSections.push({
                    node: (
                        <section key="key-points" id="key-points" className="mb-12 prose lg:prose-xl">
                            <ul className="list-disc list-inside space-y-2">
                                {keyPoints.map((point: string, idx: number) => (
                                    <li 
                                        key={idx} 
                                        className="text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: point }}
                                    />
                                ))}
                            </ul>
                        </section>
                    ),
                    sectionType: 'key_points'
                })
            }
        } catch (e) {
            console.error('Error parsing key_points_json:', e)
        }
    }

    // Examples Section
    if (examples.length > 0) {
        contentSections.push({
            node: (
                <>
                    <h2 key="examples-h2" className="text-3xl font-bold mb-6 mt-8">Examples</h2>
                    <section key="examples-section" id="examples" className="mb-12 prose lg:prose-xl">
                        <div className="space-y-6">
                            {examples.map((ex, idx) => (
                                <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-xl font-semibold mb-3">Example {idx + 1}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Inputs:</h4>
                                            <ul className="list-disc list-inside">
                                                {Object.entries(ex.inputs).map(([key, value]) => (
                                                    <li key={key}>{key}: {value}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Outputs:</h4>
                                            <ul className="list-disc list-inside">
                                                {Object.entries(ex.outputs).map(([key, value]) => (
                                                    <li key={key}>
                                                        {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ),
            sectionType: 'examples'
        })
    }

    // Formula Section
    if (data.formula_md) {
        contentSections.push({
            node: (
                <>
                    <h2 key="formula-h2" className="text-3xl font-bold mb-6 mt-8">Formula</h2>
                    <section key="formula-section" id="formula" className="mb-12 prose lg:prose-xl">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div dangerouslySetInnerHTML={{ __html: data.formula_md }} />
                        </div>
                    </section>
                </>
            )
        })
    }

    // Assumptions Section
    if (data.assumptions_md) {
        contentSections.push({
            node: (
                <>
                    <h2 key="assumptions-h2" className="text-3xl font-bold mb-6 mt-8">Assumptions</h2>
                    <section key="assumptions-section" id="assumptions" className="mb-12 prose lg:prose-xl">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div dangerouslySetInnerHTML={{ __html: data.assumptions_md }} />
                        </div>
                    </section>
                </>
            )
        })
    }

    // FAQ Section
    if (data.faq_json) {
        contentSections.push({
            node: (
                <>
                    <h2 key="faq-h2" className="text-3xl font-bold mb-6 mt-8">Frequently Asked Questions</h2>
                    <section key="faq-section" id="faq" className="mb-12 prose lg:prose-xl">
                        <div className="space-y-4">
                            {(() => {
                                try {
                                    // @ts-ignore
                                    const faqs = typeof data.faq_json === 'string' 
                                        ? JSON.parse(data.faq_json) 
                                        : data.faq_json
                                    if (Array.isArray(faqs)) {
                                        return faqs.map((faq: any, idx: number) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                                                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                                                <div 
                                                    className="prose lg:prose-xl"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                            </div>
                                        ))
                                    }
                                } catch (e) {
                                    console.error('Error parsing FAQ:', e)
                                }
                                return null
                            })()}
                        </div>
                    </section>
                </>
            )
        })
    }

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
                {/* Breadcrumbs */}
                <Breadcrumbs items={breadcrumbs} />

                {/* Page Title (H1) */}
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">{data.h1 || data.title}</h1>

                {/* Desktop Layout: Float Layout */}
                <div className="hidden lg:block">
                    {/* Clear float */}
                    <div className="overflow-hidden">
                        {/* Виджет Калькулятора (Left Float) */}
                        {config && (
                            <CalculatorWidget
                                config={config}
                                interface={interfaceData}
                                initialValues={initialValues}
                                h1={data.h1 || data.title}
                                lang={lang}
                                translations={{
                                    clear: translations.widget_clear,
                                    calculate: translations.widget_calculate,
                                    result: translations.widget_result,
                                    copy: translations.widget_copy,
                                    suggest: translations.widget_suggest,
                                    getWidget: translations.widget_get_widget,
                                    inputLabel: translations.widget_input_label,
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
                                }}
                                widgetPageSlug={widgetPage?.slug}
                            />
                        )}

                        {/* Сайдбар с рекламой (Right Float) */}
                        <div className="float-right w-[300px] space-y-5 ml-5">
                            <AdBanner lang={lang} adNumber={1} />
                            <AdBanner lang={lang} adNumber={2} />
                            <AdBanner lang={lang} adNumber={3} />
                            <AdBanner lang={lang} adNumber={4} />
                        </div>

                        {/* Текстовый контент (обтекает виджет и сайдбар) */}
                        <div className="prose lg:prose-xl max-w-none">
                            {contentSections.map((item, idx) => (
                                <React.Fragment key={idx}>{item.node}</React.Fragment>
                            ))}
                        </div>

                        {/* Clear float в конце */}
                        <div className="clear-both"></div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden">
                    {/* Виджет Калькулятора */}
                    {config && (
                        <div className="mb-8">
                            <CalculatorWidget
                                config={config}
                                interface={interfaceData}
                                initialValues={initialValues}
                                h1={data.h1 || data.title}
                                lang={lang}
                                translations={{
                                    clear: translations.widget_clear,
                                    calculate: translations.widget_calculate,
                                    result: translations.widget_result,
                                    copy: translations.widget_copy,
                                    suggest: translations.widget_suggest,
                                    getWidget: translations.widget_get_widget,
                                    inputLabel: translations.widget_input_label,
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
                                }}
                                widgetPageSlug={widgetPage?.slug}
                            />
                        </div>
                    )}

                    {/* Баннер 1: Сразу после калькулятора, перед началом текста */}
                    <div className="mb-5">
                        <AdBanner lang={lang} adNumber={1} />
                    </div>

                    {/* Контент с инъекцией баннеров */}
                    <div className="prose lg:prose-xl max-w-none">
                        <ContentWithAds content={contentSections} lang={lang} />
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
