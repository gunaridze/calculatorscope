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
            { name: 'apple-mobile-web-app-title', content: toolName || 'Calculator Scope' }
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

        // Добавляем Apple Touch Icons для iOS
        // Для главной страницы используем основные иконки, для widget - widget иконки
        const iconPrefix = toolSlug ? 'widget-apple' : 'apple-touch-icon'
        const appleIcons = [
            { sizes: '120x120', href: `/${iconPrefix}-120.png` },
            { sizes: '152x152', href: `/${iconPrefix}-152.png` },
            { sizes: '180x180', href: `/${iconPrefix}-180.png` }
        ]

        appleIcons.forEach(({ sizes, href }) => {
            let link = document.querySelector(`link[rel="apple-touch-icon"][sizes="${sizes}"]`) as HTMLLinkElement
            if (!link) {
                link = document.createElement('link')
                link.rel = 'apple-touch-icon'
                link.sizes = sizes
                document.head.appendChild(link)
            }
            link.href = href
        })

        // Добавляем стандартный apple-touch-icon (без sizes) для совместимости
        let defaultAppleIcon = document.querySelector('link[rel="apple-touch-icon"]:not([sizes])') as HTMLLinkElement
        if (!defaultAppleIcon) {
            defaultAppleIcon = document.createElement('link')
            defaultAppleIcon.rel = 'apple-touch-icon'
            document.head.appendChild(defaultAppleIcon)
        }
        defaultAppleIcon.href = `/${iconPrefix}-180.png`

        // Регистрация Service Worker - регистрируем сразу, не ждем load
        if ('serviceWorker' in navigator) {
            // Проверяем, не зарегистрирован ли уже service worker
            navigator.serviceWorker.getRegistration('/').then((registration) => {
                if (!registration) {
                    // Регистрируем только если еще не зарегистрирован
                    navigator.serviceWorker.register('/sw.js')
                        .then((registration) => {
                            console.log('ServiceWorker registration successful with scope: ', registration.scope)
                        })
                        .catch((err) => {
                            console.log('ServiceWorker registration failed: ', err)
                        })
                } else {
                    console.log('ServiceWorker already registered with scope: ', registration.scope)
                }
            })
        }

        // Cleanup function
        return () => {
            // Cleanup при размонтировании (если нужно)
        }
    }, [lang, toolSlug, toolName])

    return null
}

