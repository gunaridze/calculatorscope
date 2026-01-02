import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const lang = searchParams.get('lang')

    if (!lang) {
        return NextResponse.json({ error: 'Missing lang parameter' }, { status: 400 })
    }

    try {
        // Получаем только главные категории (первого уровня, без parent_id)
        const categories = await prisma.category.findMany({
            where: {
                parent_id: null // Только категории первого уровня
            },
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
        })
        
        // Форматируем данные, убирая дочерние категории
        const mainCategories = categories
            .filter(cat => cat.i18n.length > 0)
            .map(cat => ({
                id: cat.id,
                slug: cat.i18n[0].slug,
                name: cat.i18n[0].name,
                iconUrl: cat.i18n[0].og_image_url,
                sort_order: cat.sort_order,
            }))
            .sort((a, b) => a.sort_order - b.sort_order)

        return NextResponse.json({ categories: mainCategories })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

