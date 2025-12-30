import Link from 'next/link'
import { prisma } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getTranslations } from '@/lib/translations'

// Типы для параметров (params - это Promise)
type Props = {
    params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: Props) {
    // 1. ВАЖНО: Ждем разрешения параметров, чтобы получить язык
    const { lang } = await params

    // 2. Получаем переводы для текущего языка
    const translations = getTranslations(lang)

    // 3. Получаем категории и инструменты для текущего языка
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            sort_order: true,
            i18n: {
                where: { lang },
                select: {
                    slug: true,
                    name: true,
                    meta_title: true,
                    meta_description: true,
                }
            },
            tools: {
                select: {
                    tool: {
                        select: {
                            id: true,
                            i18n: {
                                where: { lang },
                                select: {
                                    slug: true,
                                    title: true,
                                    meta_description: true,
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { sort_order: 'asc' }
    })

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