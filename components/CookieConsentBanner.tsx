'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCookieConsentTranslations } from '@/lib/cookie-consent-translations'
import { readConsentCookie, writeConsentCookie } from '@/lib/consent'

type CookieConsentBannerProps = {
    lang: string
}

export default function CookieConsentBanner({ lang }: CookieConsentBannerProps) {
    const router = useRouter()
    const translations = getCookieConsentTranslations(lang)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(readConsentCookie() === null)
    }, [])

    function handleChoice(choice: 'granted' | 'denied') {
        writeConsentCookie(choice)
        setVisible(false)
        router.refresh()
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 shadow-lg">
            <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <p className="text-sm text-gray-700 flex-1 w-full sm:w-auto">
                    {translations.message}{' '}
                    <Link href={`/${lang}/cookies`} className="text-blue-600 hover:text-blue-800 underline">
                        {translations.policyLinkText}
                    </Link>
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => handleChoice('denied')}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {translations.rejectButton}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChoice('granted')}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {translations.acceptButton}
                    </button>
                </div>
            </div>
        </div>
    )
}
