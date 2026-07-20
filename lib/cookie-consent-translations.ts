// Переводы для баннера согласия на использование cookie
export const cookieConsentTranslations: Record<string, {
    message: string
    acceptButton: string
    rejectButton: string
    policyLinkText: string
}> = {
    en: {
        message: 'We use cookies for essential site functions, analytics, and (in the future) advertising. You can accept or reject non-essential cookies at any time.',
        acceptButton: 'Accept',
        rejectButton: 'Reject',
        policyLinkText: 'Cookie Policy',
    },
    ru: {
        message: 'Мы используем cookie для базовой работы сайта, аналитики и (в будущем) рекламы. Вы можете принять или отклонить необязательные cookie в любой момент.',
        acceptButton: 'Принять',
        rejectButton: 'Отклонить',
        policyLinkText: 'Политика cookie',
    },
    lv: {
        message: 'Mēs izmantojam sīkfailus vietnes darbībai, analītikai un (nākotnē) reklāmai. Jūs jebkurā laikā varat pieņemt vai noraidīt neobligātos sīkfailus.',
        acceptButton: 'Pieņemt',
        rejectButton: 'Noraidīt',
        policyLinkText: 'Sīkfailu politika',
    },
    pl: {
        message: 'Używamy plików cookie do podstawowego działania strony, analityki i (w przyszłości) reklam. Możesz zaakceptować lub odrzucić niezbędne pliki cookie w dowolnym momencie.',
        acceptButton: 'Akceptuj',
        rejectButton: 'Odrzuć',
        policyLinkText: 'Polityka cookie',
    },
    es: {
        message: 'Utilizamos cookies para el funcionamiento esencial del sitio, análisis y (en el futuro) publicidad. Puede aceptar o rechazar las cookies no esenciales en cualquier momento.',
        acceptButton: 'Aceptar',
        rejectButton: 'Rechazar',
        policyLinkText: 'Política de cookies',
    },
    fr: {
        message: 'Nous utilisons des cookies pour le fonctionnement essentiel du site, l’analyse et (à l’avenir) la publicité. Vous pouvez accepter ou refuser les cookies non essentiels à tout moment.',
        acceptButton: 'Accepter',
        rejectButton: 'Refuser',
        policyLinkText: 'Politique de cookies',
    },
    it: {
        message: 'Utilizziamo i cookie per le funzioni essenziali del sito, l’analisi e (in futuro) la pubblicità. Puoi accettare o rifiutare i cookie non essenziali in qualsiasi momento.',
        acceptButton: 'Accetta',
        rejectButton: 'Rifiuta',
        policyLinkText: 'Cookie Policy',
    },
    de: {
        message: 'Wir verwenden Cookies für grundlegende Funktionen der Website, Analysen und (künftig) Werbung. Sie können nicht notwendige Cookies jederzeit akzeptieren oder ablehnen.',
        acceptButton: 'Akzeptieren',
        rejectButton: 'Ablehnen',
        policyLinkText: 'Cookie-Richtlinie',
    },
}

export function getCookieConsentTranslations(lang: string) {
    return cookieConsentTranslations[lang as keyof typeof cookieConsentTranslations] || cookieConsentTranslations.en
}
