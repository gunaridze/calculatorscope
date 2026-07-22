import Link from 'next/link'
import { getRelatedCalculatorsTitle } from '@/lib/related-calculators-translations'

type RelatedTool = {
    slug: string
    title: string
}

type Props = {
    tools: RelatedTool[]
    lang: string
    categorySlug: string
    className?: string
}

export default function RelatedCalculators({ tools, lang, categorySlug, className = '' }: Props) {
    if (tools.length === 0) return null

    return (
        <div className={`bg-gray-100 border border-gray-200 rounded-md p-4 ${className}`}>
            <div className="font-semibold text-gray-900 mb-3">{getRelatedCalculatorsTitle(lang)}</div>
            <ul className="space-y-2">
                {tools.map((tool) => (
                    <li key={tool.slug}>
                        <Link
                            href={`/${lang}/${categorySlug}/${tool.slug}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                            {tool.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
