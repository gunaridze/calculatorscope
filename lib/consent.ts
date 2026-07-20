// Утилиты для чтения/записи cookie согласия на использование cookie (analytics/ads)
export const CONSENT_COOKIE_NAME = 'consent_status'

export function readConsentCookie(): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

export function writeConsentCookie(value: 'granted' | 'denied') {
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}
