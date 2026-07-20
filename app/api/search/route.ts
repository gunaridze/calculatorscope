import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/lib/search'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const lang = searchParams.get('lang')
    const q = searchParams.get('q') || ''

    if (!lang) {
        return NextResponse.json({ error: 'Missing lang parameter' }, { status: 400 })
    }

    try {
        const results = await search(q, lang, 8)
        return NextResponse.json({ results })
    } catch (error) {
        console.error('Error searching:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
