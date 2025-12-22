import Link from 'next/link'
import { prisma } from '@/lib/db'

// Типы для параметров (params - это Promise)
type Props = {
    params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: Props) {
    // 1. ВАЖНО: Ждем разрешения параметров, чтобы получить язык
    const { lang } = await params

    // 2. Получаем категории и инструменты для текущего языка
    const categories = await prisma.category.findMany({
        include: {
            i18n: { where: { lang } }, // Берем перевод категории
            tools: {
                include: {
                    tool: {
                        include: {
                            i18n: { where: { lang } } // Берем перевод инструмента
                        }
                    }
                }
            }
        },
        orderBy: { sort_order: 'asc' } // Сортируем по порядку
    })

    return (
        <main className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">
                {lang === 'ru' ? 'Все инструменты' : 'All Tools'}
            </h1>

            <div className="grid gap-8">
                {categories.map((cat) => {
                    // Безопасно достаем название категории
                    const catName = cat.i18n[0]?.name || 'Unnamed Category'
                    // Slug категории нужен для формирования ссылки
                    const catSlug = cat.i18n[0]?.slug || 'cat'

                    // Если в категории нет инструментов, можно не показывать её (опционально)
                    if (cat.tools.length === 0) return null

                    return (
                        <section key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                                {catName}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cat.tools.map(({ tool }) => {
                                    const toolData = tool.i18n[0]
                                    // Если у инструмента нет перевода на текущий язык — пропускаем
                                    if (!toolData) return null

                                    return (
                                        <Link
                                            key={tool.id}
                                            // Формируем ссылку: /ru/category-slug/tool-slug
                                            href={`/${lang}/${catSlug}/${toolData.slug}`}
                                            className="group block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
                                        >
                                            <h3 className="font-bold text-lg text-blue-600 mb-1 group-hover:text-blue-700">
                                                {toolData.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {toolData.meta_description}
                                            </p>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}
            </div>
        </main>
    )
}