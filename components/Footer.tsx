import Link from 'next/link'

type FooterProps = {
    lang: string
    translations: {
        footer_link_1: string
        footer_link_2: string
        footer_link_3: string
        footer_copyright: string
    }
}

export default function Footer({ lang, translations }: FooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-gray-300 mt-auto bg-white">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <Link 
                        href={`/${lang}/privacy`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {translations.footer_link_1}
                    </Link>
                    <Link 
                        href={`/${lang}/terms`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {translations.footer_link_2}
                    </Link>
                    <Link 
                        href={`/${lang}/contact`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {translations.footer_link_3}
                    </Link>
                </div>
                <div className="text-center text-black">
                    © {currentYear} {translations.footer_copyright}
                </div>
            </div>
        </footer>
    )
}