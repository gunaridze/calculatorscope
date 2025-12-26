'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const languages = [
    { code: 'en', name: 'Eng' },
    { code: 'de', name: 'De' },
    { code: 'es', name: 'Es' },
    { code: 'fr', name: 'Fr' },
    { code: 'it', name: 'It' },
    { code: 'pl', name: 'Pl' },
    { code: 'ru', name: 'Ru' },
    { code: 'lv', name: 'Lv' },
]

type HeaderProps = {
    lang: string
    h1?: string
    metaDescription?: string
}

export default function Header({ lang, h1, metaDescription }: HeaderProps) {
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
    const pathname = usePathname()
    const currentLang = languages.find(l => l.code === lang) || languages[0]

    // Получаем текущий путь без языка для переключения языков
    const pathWithoutLang = pathname.replace(`/${lang}`, '') || '/'

    return (
        <header className="sticky top-0 z-50">
            {/* Верхний блок */}
            <div className="bg-[#FFFFFF] border-b border-[#000000]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Лого */}
                        <Link href={`/${lang}`} className="flex items-center gap-2 flex-shrink-0">
                            <Image 
                                src="/calculatorscope-logo.svg"
                                alt="Calculator Scope"
                                height={50}
                                width={222}
                                className="h-8 w-auto"
                                priority
                            />
                        </Link>

                        {/* Поиск */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search calculator"
                                    className="w-full px-4 py-2 pl-10 border border-[#000000] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1814E6]"
                                    style={{ color: '#9A9898' }}
                                />
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: '#9A9898' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Выбор языка */}
                        <div className="relative flex-shrink-0">
                            <select
                                value={lang}
                                onChange={(e) => {
                                    window.location.href = `/${e.target.value}${pathWithoutLang}`
                                }}
                                className="appearance-none bg-transparent border-none px-3 py-2 cursor-pointer focus:outline-none"
                                style={{ color: '#1814E6' }}
                            >
                                {languages.map((langOption) => (
                                    <option key={langOption.code} value={langOption.code}>
                                        {langOption.name}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: '#1814E6' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Разделительная линия */}
            <div className="h-px bg-[#000000]"></div>

            {/* Нижний блок */}
            <div className="bg-[#F5F5F5]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 py-4">
                        {/* Бургер категорий */}
                        <button
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
                            style={{ color: '#1814E6' }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="font-medium">Calculators</span>
                        </button>

                        {/* H1 и meta_description - по центру с адаптивными размерами */}
                        <div className="flex-1 text-center">
                            {h1 && (
                                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black mb-1">
                                    {h1}
                                </h1>
                            )}
                            {metaDescription && (
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
                                    {metaDescription}
                                </p>
                            )}
                        </div>

                        {/* Пустое место справа для баланса */}
                        <div className="flex-shrink-0 w-0 sm:w-auto sm:min-w-[120px]"></div>
                    </div>
                </div>
            </div>
        </header>
    )
}
