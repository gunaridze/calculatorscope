import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const lang = searchParams.get('lang')

    if (!lang) {
        return NextResponse.json({ error: 'Missing lang parameter' }, { status: 400 })
    }

    try {
        // Порядок сортировки для выпадающего меню (по id из category_i18n)
        const menuSortOrder = [1, 16, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 19, 14, 15, 20, 18, 21]
        
        // Получаем id из category_i18n через raw query
        const categoryI18nIds = await prisma.$queryRaw<Array<{ id: number, category_id: string }>>`
            SELECT id, category_id 
            FROM category_i18n 
            WHERE lang = ${lang}
        `
        
        // Создаем маппинг category_id -> id из category_i18n
        const categoryIdToI18nId = new Map<string, number>()
        categoryI18nIds.forEach(row => {
            categoryIdToI18nId.set(row.category_id, Number(row.id))
        })

        // Получаем все категории с иерархией
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                parent_id: true,
                sort_order: true,
                i18n: {
                    where: { lang },
                    select: {
                        slug: true,
                        name: true,
                        og_image_url: true,
                    }
                },
                children: {
                    select: {
                        id: true,
                        sort_order: true,
                        i18n: {
                            where: { lang },
                            select: {
                                slug: true,
                                name: true,
                                og_image_url: true,
                            }
                        }
                    },
                    orderBy: { sort_order: 'asc' }
                }
            },
            orderBy: { sort_order: 'asc' }
        })
        
        // Фильтруем только главные категории (без parent_id) и форматируем данные
        const mainCategories = categories
            .filter(cat => !cat.parent_id && cat.i18n.length > 0)
            .map(cat => ({
                id: cat.id,
                i18nId: categoryIdToI18nId.get(cat.id) || 0, // id из category_i18n
                slug: cat.i18n[0].slug,
                name: cat.i18n[0].name,
                iconUrl: cat.i18n[0].og_image_url,
                sort_order: cat.sort_order,
                children: cat.children
                    .filter(child => child.i18n.length > 0)
                    .map(child => ({
                        id: child.id,
                        slug: child.i18n[0].slug,
                        name: child.i18n[0].name,
                        iconUrl: child.i18n[0].og_image_url,
                        sort_order: child.sort_order,
                    }))
                    .sort((a, b) => a.sort_order - b.sort_order)
            }))

        // Сортируем по указанному порядку для выпадающего меню (по id из category_i18n)
        const sortedCategories = mainCategories.sort((a, b) => {
            const indexA = menuSortOrder.indexOf(a.i18nId)
            const indexB = menuSortOrder.indexOf(b.i18nId)
            
            // Если id не найден в порядке сортировки, ставим в конец
            if (indexA === -1 && indexB === -1) return 0
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            
            return indexA - indexB
        })

        return NextResponse.json({ categories: sortedCategories })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

