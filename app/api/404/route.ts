import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTranslations } from '@/lib/translations'

// Интерфейс для body_blocks_json страницы 404
interface NotFoundContent {
    headline?: string
    subtitle?: string
    button?: string
    image?: string
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const lang = searchParams.get('lang') || 'en'

        // Получаем данные страницы 404 из базы данных
        // @ts-ignore - TypeScript не всегда правильно выводит типы из Prisma
        const pageData = await prisma.pageI18n.findFirst({
            where: {
                lang,
                page: { code: '404' }
            },
            select: {
                h1: true,
                short_answer: true,
                body_blocks_json: true,
            }
        })

        // Парсим body_blocks_json
        let content: NotFoundContent = {}
        if (pageData?.body_blocks_json) {
            try {
                const parsed = typeof pageData.body_blocks_json === 'string'
                    ? JSON.parse(pageData.body_blocks_json)
                    : pageData.body_blocks_json
                content = parsed as NotFoundContent
            } catch (e) {
                console.error('Error parsing body_blocks_json:', e)
            }
        }

        // Используем данные из body_blocks_json или fallback на h1/short_answer
        const headline = content.headline || pageData?.h1 || 'Page Not Found'
        const subtitle = content.subtitle || pageData?.short_answer || ''
        const buttonText = content.button || 'Go to Home page'
        const imageUrl = content.image || '/404-calculatorscope.png'

        // Получаем translations
        const translations = getTranslations(lang)

        return NextResponse.json({
            headline,
            subtitle,
            buttonText,
            imageUrl,
            translations,
        })
    } catch (error) {
        console.error('Error fetching 404 data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch 404 data' },
            { status: 500 }
        )
    }
}
