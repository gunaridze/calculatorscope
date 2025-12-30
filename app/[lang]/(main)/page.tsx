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

    // 3. Получаем популярные категории
    const popularCategories = await prisma.category.findMany({
        where: {
            i18n: {
                some: {
                    lang,
                    is_popular: 1
                }
            }
        },
        select: {
            id: true,
            sort_order: true,
            i18n: {
                where: { 
                    lang,
                    is_popular: 1
                },
                select: {
                    slug: true,
                    name: true,
                    short_description: true,
                    meta_description: true,
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
                                    is_popular: 1  // Показываем только популярные инструменты
                                },
                                select: {
                                    slug: true,
                                    title: true,
                                    is_popular: true,
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { sort_order: 'asc' }
    })

    // 4. Получаем все категории и инструменты для текущего языка
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
                    is_popular: true,
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
                                    is_popular: true,
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
                {/* Блок популярных категорий */}
                {popularCategories.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Categories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularCategories.map((cat) => {
                                const catData = cat.i18n[0]
                                if (!catData) return null
                                
                                const catSlug = catData.slug
                                // Фильтруем только популярные инструменты
                                const popularTools = cat.tools.filter(({ tool }) => 
                                    tool.i18n.length > 0 && tool.i18n[0].is_popular === 1
                                )

                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/${lang}/${catSlug}`}
                                        className="group block bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-blue-100 hover:border-blue-300"
                                    >
                                        <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700">
                                            {catData.name}
                                        </h3>
                                        {catData.short_description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {catData.short_description}
                                            </p>
                                        )}
                                        {popularTools.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-blue-200">
                                                <p className="text-xs font-semibold text-blue-700 mb-2">Popular Tools:</p>
                                                <ul className="space-y-1">
                                                    {popularTools.map(({ tool }) => {
                                                        const toolData = tool.i18n[0]
                                                        if (!toolData) return null
                                                        return (
                                                            <li key={tool.id} className="text-sm text-gray-700 hover:text-blue-600">
                                                                → {toolData.title}
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Все категории */}
                <div className="grid gap-8">
                    {categories.map((cat) => {
                        const catName = cat.i18n[0]?.name || 'Unnamed Category'
                        const catSlug = cat.i18n[0]?.slug || 'cat'
                        const isPopular = cat.i18n[0]?.is_popular === 1

                        if (cat.tools.length === 0) return null
                        if (isPopular) return null

                        return (
                            <section key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                                    {catName}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cat.tools.map(({ tool }) => {
                                        const toolData = tool.i18n[0]
                                        if (!toolData) return null

                                        const isToolPopular = toolData.is_popular === 1

                                        return (
                                            <Link
                                                key={tool.id}
                                                href={`/${lang}/${catSlug}/${toolData.slug}`}
                                                className={`group block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 ${
                                                    isToolPopular 
                                                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                                        : 'bg-gray-50 hover:bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg text-blue-600 mb-1 group-hover:text-blue-700">
                                                            {toolData.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 line-clamp-2">
                                                            {toolData.meta_description}
                                                        </p>
                                                    </div>
                                                    {isToolPopular && (
                                                        <span className="ml-2 text-yellow-500 text-lg" title="Popular tool">
                                                            ⭐
                                                        </span>
                                                    )}
                                                </div>
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