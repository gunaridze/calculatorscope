'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSearchTranslations } from '@/lib/search-translations'

type SearchResult = {
    type: 'tool' | 'category'
    title: string
    description: string | null
    href: string
    score: number
}

type HeaderSearchProps = {
    lang: string
    placeholder: string
    inputId: string
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

export default function HeaderSearch({ lang, placeholder, inputId }: HeaderSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const router = useRouter()
    const t = getSearchTranslations(lang)

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        const trimmed = query.trim()
        if (trimmed.length < MIN_QUERY_LENGTH) {
            setResults([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        debounceRef.current = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(trimmed)}&lang=${lang}`)
                .then((res) => res.json())
                .then((data) => {
                    setResults(data.results || [])
                    setActiveIndex(-1)
                })
                .catch((error) => {
                    console.error('Error searching:', error)
                    setResults([])
                })
                .finally(() => setIsLoading(false))
        }, DEBOUNCE_MS)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query, lang])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const goToResult = useCallback(
        (result: SearchResult) => {
            setIsOpen(false)
            setQuery('')
            setResults([])
            router.push(result.href)
        },
        [router]
    )

    const goToAllResults = useCallback(() => {
        const trimmed = query.trim()
        if (trimmed.length < MIN_QUERY_LENGTH) return
        setIsOpen(false)
        router.push(`/${lang}/search?q=${encodeURIComponent(trimmed)}`)
    }, [query, lang, router])

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!isOpen) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, -1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0 && results[activeIndex]) {
                goToResult(results[activeIndex])
            } else {
                goToAllResults()
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const trimmedQuery = query.trim()
    const showHint = isOpen && trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH
    const showDropdown = isOpen && trimmedQuery.length >= MIN_QUERY_LENGTH

    return (
        <div className="relative" ref={containerRef}>
            <input
                id={inputId}
                name={inputId}
                type="text"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                    setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-2 pl-10 border border-[#000000] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1814E6] text-black placeholder:text-[#9A9898]"
            />
            <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#9A9898' }}
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {showHint && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#000000] rounded-md shadow-lg z-50">
                    <div className="px-4 py-3 text-sm text-gray-500">{t.typeToSearch}</div>
                </div>
            )}

            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#000000] rounded-md shadow-lg z-50 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-4 text-sm text-gray-500">{t.searching}</div>
                    ) : results.length > 0 ? (
                        <>
                            <ul>
                                {results.map((result, index) => (
                                    <li key={`${result.type}-${result.href}`}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                goToResult(result)
                                            }}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                index === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <span
                                                className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                                                style={{
                                                    color: result.type === 'tool' ? '#1814E6' : '#6B7280',
                                                    backgroundColor: result.type === 'tool' ? '#EEF0FF' : '#F3F4F6',
                                                }}
                                            >
                                                {result.type === 'tool' ? t.calculatorLabel : t.categoryLabel}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block font-medium text-gray-900 truncate">{result.title}</span>
                                                {result.description && (
                                                    <span className="block text-xs text-gray-500 truncate">{result.description}</span>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    goToAllResults()
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
                                style={{ color: '#1814E6' }}
                            >
                                {t.viewAllResults} →
                            </button>
                        </>
                    ) : (
                        <div className="px-4 py-4 text-sm text-gray-500">{t.noResults}</div>
                    )}
                </div>
            )}
        </div>
    )
}
