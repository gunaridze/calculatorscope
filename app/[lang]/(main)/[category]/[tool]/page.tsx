import { notFound } from 'next/navigation'
import { getToolData } from '@/lib/db'
import JsonCalculator from '@/components/JsonCalculator'

// Типы для параметров URL
type Props = {
    params: {
        lang: string
        category: string
        tool: string
    }
}

// Next.js Server Component (Async)
export default async function ToolPage({ params }: Props) {
    // Получаем параметры (в Next 15 params могут быть Promise, но пока пишем так)
    const { lang, tool: slug } = params

    // 1. Запрашиваем данные из БД
    const data = await getToolData(slug, lang)

    // 2. Если такого инструмента нет — отдаем 404
    if (!data) {
        return notFound()
    }

    // 3. Достаем конфиги
    // @ts-ignore (TypeScript может ругаться на JSON типы, пока игнорируем)
    const config = data.tool.config?.config_json
    // @ts-ignore
    const interfaceData = data.interface_json

    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            {/* SEO BLOCK (Server Side Rendered) */}
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{data.h1}</h1>
                <p className="text-lg text-gray-600">{data.intro_text}</p>
            </header>

            {/* CALCULATOR APP (Client Side) */}
            <div className="flex justify-center mb-12">
                <JsonCalculator config={config} interface={interfaceData} />
            </div>

            {/* SEO TEXT CONTENT (Из БД) */}
            {data.body_blocks_json && (
                <article className="prose lg:prose-xl mx-auto text-gray-700">
                    {/* @ts-ignore - тут нужно будет парсить блоки, пока просто выведем контент */}
                    <p>{(data.body_blocks_json as any).content}</p>
                </article>
            )}
        </main>
    )
}