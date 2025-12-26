import { notFound } from 'next/navigation'
import { getToolData } from '@/lib/db'
import JsonCalculator from '@/components/JsonCalculator'
import { calculate, type JsonEngineConfig, type JsonEngineOutput } from '@/core/engines/json'
import type { Metadata } from 'next'

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

export default async function ToolPage({ params, searchParams }: Props) {
    // 1. ВАЖНО: Ждем разрешения параметров
    const { lang, tool: slug } = await params
    const search = await searchParams

    // 2. Запрашиваем данные из БД
    const data = await getToolData(slug, lang)

    // 3. Если такого инструмента нет — отдаем 404
    if (!data) {
        return notFound()
    }

    // 4. Достаем конфиги из JSON полей
    // @ts-ignore (TypeScript не всегда корректно типизирует JSON из Prisma)
    const config: JsonEngineConfig = data.tool.config?.config_json
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

    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Заголовок и описание (SEO) */}
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{data.h1 || data.title}</h1>
                {data.intro_text && (
                    <p className="text-lg text-gray-600">{data.intro_text}</p>
                )}
                {data.short_answer && (
                    <p className="text-xl text-gray-700 mt-4 font-medium">{data.short_answer}</p>
                )}
            </header>

            {/* Сам калькулятор (Клиентский компонент) */}
            <div className="flex justify-center mb-12">
                {config && (
                    <JsonCalculator 
                        config={config} 
                        interface={interfaceData}
                        initialValues={initialValues}
                    />
                )}
            </div>

            {/* AI-friendly секции для парсинга LLM */}
            
            {/* Examples Section */}
            {examples.length > 0 && (
                <section id="examples" className="mb-12 prose lg:prose-xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Examples</h2>
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
            )}

            {/* Formula Section */}
            {data.formula_md && (
                <section id="formula" className="mb-12 prose lg:prose-xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Formula</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: data.formula_md }} />
                    </div>
                </section>
            )}

            {/* Assumptions Section */}
            {data.assumptions_md && (
                <section id="assumptions" className="mb-12 prose lg:prose-xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Assumptions</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: data.assumptions_md }} />
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {data.faq_json && (
                <section id="faq" className="mb-12 prose lg:prose-xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
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
                                            <p>{faq.answer}</p>
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
            )}
        </main>
    )
}