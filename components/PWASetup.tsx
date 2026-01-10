'use client'

import { useEffect } from 'react'
import Script from 'next/script'

type PWASetupProps = {
    lang: string
    toolSlug?: string
    toolName?: string
}

export default function PWASetup({ lang, toolSlug, toolName }: PWASetupProps) {
    useEffect(() => {
        // Добавляем manifest link в head
        const manifestUrl = toolSlug 
            ? `/api/manifest?lang=${lang}&tool=${toolSlug}`
            : `/api/manifest?lang=${lang}`
        
        let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
        if (!manifestLink) {
            manifestLink = document.createElement('link')
            manifestLink.rel = 'manifest'
            document.head.appendChild(manifestLink)
        }
        manifestLink.href = manifestUrl

        // Добавляем meta теги для PWA
        const metaTags = [
            { name: 'theme-color', content: '#1a73e8' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            { name: 'apple-mobile-web-app-title', content: toolName || 'CalculatorScope Widget' }
        ]

        metaTags.forEach(({ name, content }) => {
            let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
            if (!meta) {
                meta = document.createElement('meta')
                meta.name = name
                document.head.appendChild(meta)
            }
            meta.content = content
        })

        // Регистрация Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope)
                    })
                    .catch((err) => {
                        console.log('ServiceWorker registration failed: ', err)
                    })
            })
        }

        // Cleanup function
        return () => {
            // Cleanup при размонтировании (если нужно)
        }
    }, [lang, toolSlug, toolName])

    return null
}

