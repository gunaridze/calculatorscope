import { NextRequest, NextResponse } from 'next/server'
import { getLanguageSwitchUrl } from '@/lib/i18n'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const currentLang = searchParams.get('currentLang')
    const targetLang = searchParams.get('targetLang')
    const pathname = searchParams.get('pathname')

    if (!currentLang || !targetLang || !pathname) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    try {
        const newUrl = await getLanguageSwitchUrl(currentLang, targetLang, pathname)
        return NextResponse.json({ url: newUrl })
    } catch (error) {
        console.error('Error getting language switch URL:', error)
        // В случае ошибки возвращаем на главную
        return NextResponse.json({ url: `/${targetLang}` })
    }
}
