import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const lang = searchParams.get('lang')

    if (!lang) {
        return NextResponse.json({ error: 'Missing lang parameter' }, { status: 400 })
    }

    try {
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
                slug: cat.i18n[0].slug,
                name: cat.i18n[0].name,
                sort_order: cat.sort_order,
                children: cat.children
                    .filter(child => child.i18n.length > 0)
                    .map(child => ({
                        id: child.id,
                        slug: child.i18n[0].slug,
                        name: child.i18n[0].name,
                        sort_order: child.sort_order,
                    }))
                    .sort((a, b) => a.sort_order - b.sort_order)
            }))
            .sort((a, b) => a.sort_order - b.sort_order)

        return NextResponse.json({ categories: mainCategories })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

