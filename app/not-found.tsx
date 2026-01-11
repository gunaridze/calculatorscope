import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'

// Функция для получения локализованного текста 404
function get404Text(lang: string) {
    const texts: Record<string, { first: string; second: string }> = {
        'ru': {
            first: 'Мы не можем найти то, что вы ищете.',
            second: 'Давайте вернёмся на главную страницу.'
        },
        'de': {
            first: 'Wir können nicht finden, wonach Sie suchen.',
            second: 'Gehen wir zurück zur Startseite.'
        },
        'es': {
            first: 'No podemos encontrar lo que estás buscando.',
            second: 'Volvamos a la página de inicio.'
        },
        'fr': {
            first: 'Nous ne trouvons pas ce que vous recherchez.',
            second: 'Revenons à la page d\'accueil.'
        },
        'it': {
            first: 'Non riusciamo a trovare ciò che stai cercando.',
            second: 'Torniamo alla pagina principale.'
        },
        'pl': {
            first: 'Nie możemy znaleźć tego, czego szukasz.',
            second: 'Wróćmy na stronę główną.'
        },
        'lv': {
            first: 'Mēs nevaram atrast to, ko jūs meklējat.',
            second: 'Atgriezīsimies uz sākumlapu.'
        },
    }

    return texts[lang] || {
        first: 'We can\'t find what you\'re looking for.',
        second: 'Let\'s go back to Home page.'
    }
}

// Функция для определения языка из заголовков
async function getLang(): Promise<string> {
    try {
        const headersList = await headers()
        const referer = headersList.get('referer') || ''
        
        // Пытаемся извлечь язык из referer
        const langMatch = referer.match(/\/\/([^\/]+)\/([a-z]{2})(?:\/|$)/)
        if (langMatch) {
            const lang = langMatch[2]
            const supportedLangs = ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv']
            if (supportedLangs.includes(lang)) {
                return lang
            }
        }

        // Пытаемся получить из заголовков Accept-Language
        const acceptLanguage = headersList.get('accept-language') || ''
        const preferredLang = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase()
        
        if (preferredLang && ['en', 'de', 'es', 'fr', 'it', 'pl', 'ru', 'lv'].includes(preferredLang)) {
            return preferredLang
        }
    } catch (error) {
        // Если не удалось получить заголовки, используем дефолтный язык
    }

    return 'en' // Дефолтный язык
}

export default async function NotFound() {
    const lang = await getLang()
    const text = get404Text(lang)
    const homeUrl = `/${lang}`

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center max-w-4xl w-full px-4">
                {/* Картинка - чуть левее от центра */}
                <div className="flex justify-center mb-8 relative" style={{ left: '-5%' }}>
                    <Image
                        src="/404-calculatorscope.png"
                        alt="404"
                        width={600}
                        height={400}
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Текст */}
                <div className="text-center space-y-4">
                    <p className="text-xl text-gray-900">
                        {text.first}
                    </p>
                    <p className="text-xl text-gray-900">
                        <Link 
                            href={homeUrl}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {text.second}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
