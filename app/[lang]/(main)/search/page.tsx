import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getTranslations } from '@/lib/translations'
import { getSearchTranslations } from '@/lib/search-translations'
import { search } from '@/lib/search'

type Props = {
    params: Promise<{ lang: string }>
    searchParams?: Promise<{ q?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { lang } = await params
    const sp = await searchParams
    const t = getSearchTranslations(lang)
    const q = sp?.q?.trim() || ''

    return {
        title: q ? `${t.resultsFor} "${q}" — Calculator Scope` : 'Search — Calculator Scope',
        robots: 'noindex,follow',
    }
}

export default async function SearchPage({ params, searchParams }: Props) {
    const { lang } = await params
    const sp = await searchParams
    const translations = getTranslations(lang)
    const t = getSearchTranslations(lang)
    const q = sp?.q?.trim() || ''

    const results = q ? await search(q, lang, 30) : []

    return (
        <>
            <Header
                lang={lang}
                translations={{
                    burger_button: translations.burger_button,
                    header_search_placeholder: translations.header_search_placeholder,
                }}
            />
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                    {q ? `${t.resultsFor} "${q}"` : t.resultsFor}
                </h1>

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((result) => (
                            <Link
                                key={`${result.type}-${result.href}`}
                                href={result.href}
                                className="block bg-[#eff6ff] border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <span
                                    className="inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded mb-3"
                                    style={{
                                        color: result.type === 'tool' ? '#1814E6' : '#6B7280',
                                        backgroundColor: result.type === 'tool' ? '#FFFFFF' : '#F3F4F6',
                                    }}
                                >
                                    {result.type === 'tool' ? t.calculatorLabel : t.categoryLabel}
                                </span>
                                <h3 className="font-bold mb-2 text-lg text-gray-900">{result.title}</h3>
                                {result.description && (
                                    <p className="text-sm text-gray-600">{result.description}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">{t.noResults}</p>
                )}
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
