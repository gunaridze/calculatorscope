import { prisma } from './db'

export type SearchResult = {
    type: 'tool' | 'category'
    title: string
    description: string | null
    href: string
    score: number
}

const MIN_QUERY_LENGTH = 2

function scoreText(text: string | null | undefined, query: string, weight: number): number {
    if (!text) return 0
    const lower = text.toLowerCase()
    if (lower === query) return weight * 2.5
    if (lower.startsWith(query)) return weight * 1.6
    if (lower.includes(query)) return weight
    return 0
}

// Простой ранжированный поиск по калькуляторам и категориям для конкретного языка.
// Датасет небольшой (десятки-сотни записей на язык), поэтому полнотекстовый индекс
// Postgres (tsvector/GIN) пока избыточен — фильтруем через ILIKE и ранжируем в JS.
export async function search(query: string, lang: string, limit = 8): Promise<SearchResult[]> {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) return []
    const q = trimmed.toLowerCase()

    const [tools, categories] = await Promise.all([
        prisma.toolI18n.findMany({
            where: {
                lang,
                tool: { status: 'published' },
                OR: [
                    { title: { contains: trimmed, mode: 'insensitive' } },
                    { h1: { contains: trimmed, mode: 'insensitive' } },
                    { short_answer: { contains: trimmed, mode: 'insensitive' } },
                    { meta_description: { contains: trimmed, mode: 'insensitive' } },
                ],
            },
            select: {
                slug: true,
                title: true,
                h1: true,
                short_answer: true,
                meta_description: true,
                is_popular: true,
                tool: {
                    select: {
                        categories: {
                            take: 1,
                            select: {
                                category: {
                                    select: {
                                        i18n: { where: { lang }, take: 1, select: { slug: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            take: 200,
        }),
        prisma.categoryI18n.findMany({
            where: {
                lang,
                OR: [
                    { name: { contains: trimmed, mode: 'insensitive' } },
                    { short_description: { contains: trimmed, mode: 'insensitive' } },
                    { meta_description: { contains: trimmed, mode: 'insensitive' } },
                ],
            },
            select: {
                slug: true,
                name: true,
                short_description: true,
                meta_description: true,
                is_popular: true,
            },
            take: 50,
        }),
    ])

    const toolResults: SearchResult[] = tools.map((row) => {
        const title = row.h1 || row.title
        const categorySlug = row.tool.categories[0]?.category.i18n[0]?.slug
        let score =
            scoreText(row.title, q, 100) +
            scoreText(row.h1, q, 90) +
            scoreText(row.short_answer, q, 20) +
            scoreText(row.meta_description, q, 15)
        if (row.is_popular) score += 10

        return {
            type: 'tool' as const,
            title,
            description: row.meta_description,
            href: categorySlug ? `/${lang}/${categorySlug}/${row.slug}` : `/${lang}/${row.slug}`,
            score,
        }
    })

    const categoryResults: SearchResult[] = categories.map((row) => {
        let score = scoreText(row.name, q, 80) + scoreText(row.short_description, q, 15) + scoreText(row.meta_description, q, 12)
        if (row.is_popular) score += 8

        return {
            type: 'category' as const,
            title: row.name,
            description: row.short_description || row.meta_description,
            href: `/${lang}/${row.slug}`,
            score,
        }
    })

    return [...toolResults, ...categoryResults]
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}
