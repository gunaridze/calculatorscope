import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const lang = searchParams.get('lang') || 'en'
        const toolSlug = searchParams.get('tool')
        
        // Если указан tool slug, получаем данные инструмента
        let toolName = 'CalculatorScope Widget'
        let startUrl = `/${lang}`
        
        if (toolSlug) {
            try {
                const toolI18n = await prisma.toolI18n.findUnique({
                    where: {
                        lang_slug: {
                            lang,
                            slug: toolSlug
                        }
                    },
                    select: {
                        h1: true,
                        title: true
                    }
                })
                
                if (toolI18n) {
                    toolName = toolI18n.h1 || toolI18n.title || toolName
                    // Для PWA start_url должен быть относительным, браузер добавит домен
                    // Используем полный путь с query параметром для popup режима
                    startUrl = `/${lang}/${toolSlug}?do=pop`
                }
            } catch (e) {
                console.error('Error fetching tool data for manifest:', e)
            }
        } else {
            // Если tool не указан, используем popup режим для главной
            startUrl = `/${lang}?do=pop`
        }

        const manifest = {
            name: `${toolName} - CalculatorScope`,
            short_name: 'Calc Widget',
            description: 'CalculatorScope Widget - Free calculator widget',
            start_url: startUrl,
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#1a73e8',
            orientation: 'portrait',
            scope: '/',
            icons: [
                {
                    src: '/widget-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable'
                },
                {
                    src: '/widget-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ]
        }

        return NextResponse.json(manifest, {
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'public, max-age=3600'
            }
        })
    } catch (error) {
        console.error('Error generating manifest:', error)
        // Fallback manifest
        const fallbackManifest = {
            name: 'CalculatorScope Widget',
            short_name: 'Calc Widget',
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#1a73e8',
            icons: [
                {
                    src: '/widget-192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: '/widget-512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        }
        
        return NextResponse.json(fallbackManifest, {
            headers: {
                'Content-Type': 'application/manifest+json'
            }
        })
    }
}

