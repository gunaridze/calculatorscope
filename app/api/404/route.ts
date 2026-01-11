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
                meta_title: true,
                meta_description: true,
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

        // Используем meta_title и meta_description из page_i18n
        const headline = pageData?.meta_title || content.headline || 'Page Not Found'
        const subtitle = pageData?.meta_description || content.subtitle || ''
        const buttonText = content.button || 'Go to Home page'
        const imageUrl = content.image || '/404-calculatorscope.png'

        // Получаем translations
        const translations = getTranslations(lang)

        const response = NextResponse.json({
            headline,
            subtitle,
            buttonText,
            imageUrl,
            translations,
        })
        
        // Отключаем кеширование
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        
        return response
    } catch (error) {
        console.error('Error fetching 404 data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch 404 data' },
            { status: 500 }
        )
    }
}
