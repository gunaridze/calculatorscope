import Link from 'next/link'

type FooterProps = {
    lang: string
}

export default function Footer({ lang }: FooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-gray-300 mt-auto">
            <div className="container mx-auto px-4 py-6">
                {/* Первый ряд - ссылки */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <Link 
                        href={`/${lang}/terms`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Legal Information & Terms of Use
                    </Link>
                    <Link 
                        href={`/${lang}/privacy`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <Link 
                        href={`/${lang}/contact`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Второй ряд - копирайт */}
                <div className="text-center text-black">
                    © {currentYear} CalculatorScope. All Rights Reserved.
                </div>
            </div>
        </footer>
    )
}
