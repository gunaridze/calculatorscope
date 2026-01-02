import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import { getTranslations } from '@/lib/translations'
import type { Metadata } from 'next'
import Link from 'next/link'

type Props = {
    params: Promise<{ lang: string; category: string }>
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
        const categoryI18n = await prisma.categoryI18n.findUnique({
            where: {
                lang_slug: {
                    lang,
                    slug,
                },
            },
            select: {
                meta_title: true,
                meta_description: true,
                og_title: true,
                og_description: true,
                og_image_url: true,
            },
        })

        if (!categoryI18n) {
            return {
                title: 'Category Not Found',
            }
        }

        const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://calculatorscope.com'
        const canonicalUrl = `${url}/${lang}/${slug}`

        return {
            title: categoryI18n.meta_title || categoryI18n.og_title || 'Category',
            description: categoryI18n.meta_description || categoryI18n.og_description || undefined,
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
            title: 'Category',
        }
    }
}

export default async function CategoryPage({ params }: Props) {
    const { lang, category: slug } = await params
    const translations = getTranslations(lang)

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
                    children: {
                        include: {
                            i18n: {
                                where: { lang },
                                select: {
                                    slug: true,
                                    name: true,
                                    og_description: true,
                                },
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
                                        select: {
                                            slug: true,
                                            h1: true,
                                            title: true,
                                            is_popular: true,
                                        },
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

    const category = categoryI18n.category
    const hasChildren = category.children.length > 0

    // Получаем популярные инструменты
    const popularTools = category.tools
        .filter(({ tool }) => {
            const toolI18n = tool.i18n[0]
            return toolI18n && toolI18n.is_popular === 1
        })
        .map(({ tool }) => ({
            id: tool.id,
            slug: tool.i18n[0]!.slug,
            h1: tool.i18n[0]!.h1,
            title: tool.i18n[0]!.title,
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
                og_description: childI18n.og_description,
            }
        })
        .filter((cat): cat is NonNullable<typeof cat> => cat !== null)

    // Парсим content_blocks_json
    let content: CategoryContent = {}
    if (categoryI18n.content_blocks_json) {
        try {
            const parsed = typeof categoryI18n.content_blocks_json === 'string'
                ? JSON.parse(categoryI18n.content_blocks_json)
                : categoryI18n.content_blocks_json
            content = parsed as CategoryContent
        } catch (e) {
            console.error('Error parsing content_blocks_json:', e)
        }
    }

    // Хлебные крошки
    const breadcrumbs = [
        { name: 'Calculator Scope', href: `/${lang}` },
        { name: categoryI18n.name, href: `/${lang}/${slug}` },
    ]

    return (
        <>
            <Header
                lang={lang}
                h1={categoryI18n.name}
                metaDescription={categoryI18n.short_description || undefined}
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
                                            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
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
                                                    className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                >
                                                    <h3 className="font-bold text-center mb-2 text-lg">
                                                        {tool.h1 || tool.title}
                                                    </h3>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SEO-описание */}
                                {(categoryI18n.og_title || categoryI18n.og_description) && (
                                    <div className="mb-12">
                                        {categoryI18n.og_title && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {categoryI18n.og_title}
                                            </h2>
                                        )}
                                        {categoryI18n.og_description && (
                                            <p className="text-lg text-gray-700">
                                                {categoryI18n.og_description}
                                            </p>
                                        )}
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
                                                    className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                >
                                                    <h3 className="font-bold text-center mb-2 text-lg">
                                                        {tool.h1 || tool.title}
                                                    </h3>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {allTools.map((tool) => (
                                                <Link
                                                    key={tool.id}
                                                    href={`/${lang}/${slug}/${tool.slug}`}
                                                    className="block text-blue-600 hover:text-blue-800 hover:underline p-2"
                                                >
                                                    <h4 className="font-medium">
                                                        {tool.h1 || tool.title}
                                                    </h4>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* SEO-описание */}
                                {(categoryI18n.og_title || categoryI18n.og_description) && (
                                    <div className="mb-12">
                                        {categoryI18n.og_title && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {categoryI18n.og_title}
                                            </h2>
                                        )}
                                        {categoryI18n.og_description && (
                                            <p className="text-lg text-gray-700">
                                                {categoryI18n.og_description}
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

                            {/* Смешанный список: Дочерние категории + Популярные инструменты */}
                            <div className="space-y-[20px]">
                                {/* Дочерние категории */}
                                {childCategories.map((child, index) => {
                                    const combinedIndex = index // Индекс в общем списке (начинается с 0)
                                    const showAdAfter1 = combinedIndex === 1 // После 2-го баннера дочерней категории (index 1 = 2-й элемент)

                                    return (
                                        <div key={child.id}>
                                            <Link
                                                href={`/${lang}/${child.slug}`}
                                                className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
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
                                            {showAdAfter1 && (
                                                <div className="mt-5">
                                                    <AdBanner
                                                        lang={lang}
                                                        adNumber={1}
                                                        href={content.ad_link_1}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Баннер рекламы №2: перед заголовком Popular */}
                                {popularTools.length > 0 && (
                                    <>
                                        <div className="mt-5">
                                            <AdBanner
                                                lang={lang}
                                                adNumber={2}
                                                href={content.ad_link_2}
                                            />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-6">
                                            Popular {categoryI18n.name}
                                        </h2>
                                    </>
                                )}

                                {/* Популярные инструменты */}
                                {popularTools.map((tool, index) => {
                                    const combinedIndex = childCategories.length + index // Общий индекс в смешанном списке
                                    const showAdAfter3 = index === 1 // После 2-го баннера популярного инструмента (index 1 = 2-й элемент в секции Popular)
                                    const showAdAfter4 = index === 4 // После 5-го баннера популярного инструмента (index 4 = 5-й элемент)
                                    const showAdAfterLong = combinedIndex === 9 // После 10-го элемента в общем списке (index 9 = 10-й элемент)

                                    return (
                                        <div key={tool.id}>
                                            <Link
                                                href={`/${lang}/${slug}/${tool.slug}`}
                                                className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                            >
                                                <h3 className="font-bold text-center mb-2 text-lg">
                                                    {tool.h1 || tool.title}
                                                </h3>
                                            </Link>
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
                                            {showAdAfterLong && (
                                                <div className="mt-5">
                                                    <AdBanner
                                                        lang={lang}
                                                        adNumber={1}
                                                        href={content.ad_link_1}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* SEO-описание */}
                                {(categoryI18n.og_title || categoryI18n.og_description) && (
                                    <div className="mt-12">
                                        {categoryI18n.og_title && (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                                {categoryI18n.og_title}
                                            </h2>
                                        )}
                                        {categoryI18n.og_description && (
                                            <p className="text-lg text-gray-700">
                                                {categoryI18n.og_description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                                        className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow h-[110px] flex flex-col justify-center"
                                                    >
                                                        <h3 className="font-bold text-center mb-2 text-lg">
                                                            {tool.h1 || tool.title}
                                                        </h3>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {allTools.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={`/${lang}/${slug}/${tool.slug}`}
                                                className="block text-blue-600 hover:text-blue-800 hover:underline p-2"
                                            >
                                                <h4 className="font-medium">
                                                    {tool.h1 || tool.title}
                                                </h4>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* SEO-описание */}
                            {(categoryI18n.og_title || categoryI18n.og_description) && (
                                <div className="mb-12">
                                    {categoryI18n.og_title && (
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            {categoryI18n.og_title}
                                        </h2>
                                    )}
                                    {categoryI18n.og_description && (
                                        <p className="text-lg text-gray-700">
                                            {categoryI18n.og_description}
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

