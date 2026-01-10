import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const size = searchParams.get('size') || '180'
        
        // Определяем путь к файлу иконки
        const iconPath = path.join(process.cwd(), 'public', `apple-touch-icon-${size}.png`)
        
        // Проверяем, существует ли файл
        if (!fs.existsSync(iconPath)) {
            // Fallback на стандартный apple-touch-icon.png
            const fallbackPath = path.join(process.cwd(), 'public', 'apple-touch-icon.png')
            if (!fs.existsSync(fallbackPath)) {
                return new NextResponse('Icon not found', { status: 404 })
            }
            
            const imageBuffer = fs.readFileSync(fallbackPath)
            return new NextResponse(imageBuffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            })
        }
        
        const imageBuffer = fs.readFileSync(iconPath)
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error serving apple-touch-icon:', error)
        return new NextResponse('Error serving icon', { status: 500 })
    }
}
