import { notFound } from 'next/navigation'
import { getToolData } from '@/lib/db'
import JsonCalculator from '@/components/JsonCalculator'

// Типы для параметров URL (в Next.js 15+ это Promise)
type Props = {
    params: Promise<{
        lang: string
        category: string
        tool: string
    }>
}

export default async function ToolPage({ params }: Props) {
    // 1. ВАЖНО: Ждем разрешения параметров
    const { lang, tool: slug } = await params

    // 2. Запрашиваем данные из БД
    const data = await getToolData(slug, lang)

    // 3. Если такого инструмента нет — отдаем 404
    if (!data) {
        return notFound()
    }

    // 4. Достаем конфиги из JSON полей
    // @ts-ignore (TypeScript не всегда корректно типизирует JSON из Prisma, игнорируем для скорости)
    const config = data.tool.config?.config_json
    // @ts-ignore
    const interfaceData = data.interface_json

    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Заголовок и описание (SEO) */}
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{data.h1}</h1>
                <p className="text-lg text-gray-600">{data.intro_text}</p>
            </header>

            {/* Сам калькулятор (Клиентский компонент) */}
            <div className="flex justify-center mb-12">
                <JsonCalculator config={config} interface={interfaceData} />
            </div>

            {/* Текстовый контент под калькулятором */}
            {/* Временно закомментировано - поле body_blocks_json отсутствует в ToolI18n */}
            {/* {data.body_blocks_json && (
                <article className="prose lg:prose-xl mx-auto text-gray-700">
                    <p>{(data.body_blocks_json as any).content}</p>
                </article>
            )} */}
        </main>
    )
}