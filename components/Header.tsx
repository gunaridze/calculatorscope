'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

type Category = {
    id: string
    slug: string
    name: string
    iconUrl?: string | null
    sort_order: number
    children: Category[]
}

const languages = [
    { code: 'en', name: 'En' },
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
    translations: {
        burger_button: string
        header_search_placeholder: string
    }
}

export default function Header({ lang, h1, metaDescription, translations }: HeaderProps) {
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
    const [isSwitchingLang, setIsSwitchingLang] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const currentLang = languages.find(l => l.code === lang) || languages[0]

    // Получаем текущий путь без языка для переключения языков
    const pathWithoutLang = pathname.replace(`/${lang}`, '') || '/'

    // Сортируем языки так, чтобы текущий был первым
    const sortedLanguages = useMemo(() => {
        const current = languages.find(l => l.code === lang)
        const others = languages.filter(l => l.code !== lang)
        return current ? [current, ...others] : languages
    }, [lang])

    // Сброс категорий при изменении языка
    useEffect(() => {
        setCategories([])
    }, [lang])

    // Загрузка категорий при открытии меню
    useEffect(() => {
        if (isCategoriesOpen && categories.length === 0 && !isLoadingCategories) {
            setIsLoadingCategories(true)
            fetch(`/api/categories?lang=${lang}`)
                .then(res => res.json())
                .then(data => {
                    if (data.categories) {
                        setCategories(data.categories)
                    }
                })
                .catch(error => {
                    console.error('Error loading categories:', error)
                })
                .finally(() => {
                    setIsLoadingCategories(false)
                })
        }
    }, [isCategoriesOpen, lang, categories.length, isLoadingCategories])

    // Обработка переключения языка
    const handleLanguageChange = async (targetLang: string) => {
        if (targetLang === lang || isSwitchingLang) return

        setIsSwitchingLang(true)

        try {
            // Запрашиваем правильный URL для нового языка
            const response = await fetch(
                `/api/language-switch?currentLang=${lang}&targetLang=${targetLang}&pathname=${encodeURIComponent(pathname)}`
            )
            const data = await response.json()
            
            if (data.url) {
                router.push(data.url)
                // Обновляем роутер, чтобы стили применились сразу
                router.refresh()
            } else {
                // Fallback: если API не вернул URL, идем на главную
                router.push(`/${targetLang}`)
                router.refresh()
            }
        } catch (error) {
            console.error('Error switching language:', error)
            // Fallback: в случае ошибки идем на главную
            router.push(`/${targetLang}`)
            router.refresh()
        } finally {
            setIsSwitchingLang(false)
        }
    }

    // Закрытие меню при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (isCategoriesOpen && !target.closest('header')) {
                setIsCategoriesOpen(false)
            }
        }

        if (isCategoriesOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCategoriesOpen])

    return (
        <header className="sticky top-0 z-50 relative">
            {/* Верхний блок */}
            <div className="bg-[#FFFFFF] border-b border-[#000000]">
                <div className="container mx-auto px-4">
                    {/* Мобильная версия первого ряда: бургер, лого, язык */}
                    <div className="flex items-center justify-between h-16 gap-4 md:hidden">
                        {/* Бургер категорий - только на мобильных */}
                        <button
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
                            style={{ color: '#1814E6' }}
                        >
                            <img
                                src={isCategoriesOpen ? "/burger-close.svg" : "/burger.svg"}
                                alt={isCategoriesOpen ? "Close menu" : "Open menu"}
                                className="w-5 h-auto"
                            />
                        </button>

                        {/* Лого - по центру на мобильных */}
                        <Link href={`/${lang}`} className="flex items-center gap-2 flex-shrink-0">
                            <Image
                                src="/calculatorscope-logo.svg"
                                alt="Calculator Scope"
                                height={50}
                                width={222}
                                className="h-7 w-auto"
                                priority
                            />
                        </Link>

                        {/* Выбор языка - мобильная версия */}
                        <div className="relative flex-shrink-0">
                            <select
                                value={lang}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                disabled={isSwitchingLang}
                                className="appearance-none bg-transparent border-none pl-2 pr-8 py-2 cursor-pointer focus:outline-none text-sm disabled:opacity-50"
                                style={{ color: '#1814E6' }}
                            >
                                {sortedLanguages.map((langOption) => (
                                    <option key={langOption.code} value={langOption.code}>
                                        {langOption.name}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: '#1814E6' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Десктопная версия первого ряда: лого, поиск, язык */}
                    <div className="hidden md:flex items-center justify-between h-16 gap-4">
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
                                    placeholder={translations.header_search_placeholder}
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
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                disabled={isSwitchingLang}
                                className="appearance-none bg-transparent border-none pl-3 pr-8 py-2 cursor-pointer focus:outline-none"
                                style={{ color: '#1814E6' }}
                            >
                                {sortedLanguages.map((langOption) => (
                                    <option key={langOption.code} value={langOption.code}>
                                        {langOption.name}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none w-4 h-4"
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

            {/* Второй ряд - поиск на мобильных */}
            <div className="bg-[#FFFFFF] border-b border-[#000000] md:hidden">
                <div className="container mx-auto px-4 py-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={translations.header_search_placeholder}
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
            </div>

            {/* Разделительная линия для мобильных */}
            <div className="h-px bg-[#000000] md:hidden"></div>

            {/* Нижний блок */}
            <div className="bg-[#F5F5F5]">
                <div className="container mx-auto px-4">
                    {/* Мобильная версия: только текст */}
                    <div className="py-4 md:hidden">
                        {h1 && (
                            <h1 className="text-base font-bold text-black mb-1 text-center">
                                {h1}
                            </h1>
                        )}
                        {metaDescription && (
                            <p className="text-xs text-gray-600 text-center px-2">
                                {metaDescription}
                            </p>
                        )}
                    </div>

                    {/* Десктопная версия: бургер, текст, пустое место */}
                    <div className="hidden md:flex items-center gap-4 py-4">
                        {/* Бургер категорий */}
                        <button
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
                            style={{ color: '#1814E6' }}
                        >
                            <img
                                src={isCategoriesOpen ? "/burger-close.svg" : "/burger.svg"}
                                alt={isCategoriesOpen ? "Close menu" : "Open menu"}
                                className="w-6 h-auto"
                            />
                            <span className="font-medium">{translations.burger_button}</span>
                        </button>

                        {/* H1 и meta_description - по центру с адаптивными размерами */}
                        <div className="flex-1 text-center">
                            {h1 && (
                                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-1">
                                    {h1}
                                </h1>
                            )}
                            {metaDescription && (
                                <p className="text-sm md:text-base text-gray-600 px-2">
                                    {metaDescription}
                                </p>
                            )}
                        </div>

                        {/* Пустое место справа для баланса */}
                        <div className="flex-shrink-0 min-w-[120px]"></div>
                    </div>
                </div>
            </div>

            {/* Выпадающее меню категорий */}
            {isCategoriesOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-[#000000] shadow-lg z-50 max-h-[80vh] overflow-y-auto pb-8 md:pb-12">
                    <div className="container mx-auto px-4 py-8 md:py-10">
                        {isLoadingCategories ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Loading categories...</p>
                            </div>
                        ) : categories.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                {categories.map((category, index) => (
                                    <div 
                                        key={category.id} 
                                        className={`relative ${index < categories.length - 1 && (index + 1) % 3 !== 0 ? 'md:pr-8 md:border-r md:border-gray-200' : ''}`}
                                    >
                                        {/* Карточка категории */}
                                        <div className="bg-gray-50 rounded-lg p-5 md:p-6 hover:bg-gray-100 transition-colors h-full border border-transparent hover:border-gray-200">
                                            {/* Главная категория с иконкой */}
                                            <Link
                                                href={`/${lang}/${category.slug}`}
                                                className="flex items-center gap-3 mb-4 group"
                                                onClick={() => setIsCategoriesOpen(false)}
                                            >
                                                {/* Иконка категории */}
                                                {category.iconUrl ? (
                                                    <img 
                                                        src={`/assets/icons/${category.iconUrl}`}
                                                        alt={category.name}
                                                        className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 bg-gray-300 rounded flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {/* Название категории - крупнее и темнее */}
                                                <span className="font-bold text-gray-900 text-lg md:text-xl group-hover:text-[#1814E6] transition-colors">
                                                    {category.name}
                                                </span>
                                            </Link>
                                            
                                            {/* Подкатегории - обычным шрифтом с увеличенным line-height */}
                                            {category.children.length > 0 && (
                                                <div className="space-y-2 pl-9 md:pl-10">
                                                    {category.children.map((child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/${lang}/${child.slug}`}
                                                            className="block text-gray-700 hover:text-[#1814E6] hover:underline text-sm md:text-base leading-relaxed transition-colors"
                                                            onClick={() => setIsCategoriesOpen(false)}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No categories found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}