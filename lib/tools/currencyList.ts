// The 30 currencies Frankfurter (ECB reference rates) publishes, with
// translated display names for the select dropdown and a currency symbol
// where one is commonly used.

export const CURRENCY_CODES = [
    'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'HKD', 'SGD',
    'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'ISK', 'TRY',
    'ZAR', 'MXN', 'BRL', 'INR', 'IDR', 'ILS', 'KRW', 'MYR', 'PHP', 'THB',
] as const

export type CurrencyCode = (typeof CURRENCY_CODES)[number]

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'CA$', AUD: 'A$', CNY: '¥', HKD: 'HK$', SGD: 'S$',
    NZD: 'NZ$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', ISK: 'kr', TRY: '₺',
    ZAR: 'R', MXN: 'MX$', BRL: 'R$', INR: '₹', IDR: 'Rp', ILS: '₪', KRW: '₩', MYR: 'RM', PHP: '₱', THB: '฿',
}

export const CURRENCY_NAMES: Record<CurrencyCode, Record<string, string>> = {
    USD: { en: 'US Dollar', ru: 'Доллар США', de: 'US-Dollar', es: 'Dólar Estadounidense', fr: 'Dollar Américain', it: 'Dollaro Statunitense', pl: 'Dolar Amerykański', lv: 'ASV Dolārs' },
    EUR: { en: 'Euro', ru: 'Евро', de: 'Euro', es: 'Euro', fr: 'Euro', it: 'Euro', pl: 'Euro', lv: 'Eiro' },
    GBP: { en: 'British Pound', ru: 'Британский фунт', de: 'Britisches Pfund', es: 'Libra Esterlina', fr: 'Livre Sterling', it: 'Sterlina Britannica', pl: 'Funt Brytyjski', lv: 'Lielbritānijas Mārciņa' },
    JPY: { en: 'Japanese Yen', ru: 'Японская иена', de: 'Japanischer Yen', es: 'Yen Japonés', fr: 'Yen Japonais', it: 'Yen Giapponese', pl: 'Jen Japoński', lv: 'Japānas Jena' },
    CHF: { en: 'Swiss Franc', ru: 'Швейцарский франк', de: 'Schweizer Franken', es: 'Franco Suizo', fr: 'Franc Suisse', it: 'Franco Svizzero', pl: 'Frank Szwajcarski', lv: 'Šveices Franks' },
    CAD: { en: 'Canadian Dollar', ru: 'Канадский доллар', de: 'Kanadischer Dollar', es: 'Dólar Canadiense', fr: 'Dollar Canadien', it: 'Dollaro Canadese', pl: 'Dolar Kanadyjski', lv: 'Kanādas Dolārs' },
    AUD: { en: 'Australian Dollar', ru: 'Австралийский доллар', de: 'Australischer Dollar', es: 'Dólar Australiano', fr: 'Dollar Australien', it: 'Dollaro Australiano', pl: 'Dolar Australijski', lv: 'Austrālijas Dolārs' },
    CNY: { en: 'Chinese Yuan', ru: 'Китайский юань', de: 'Chinesischer Yuan', es: 'Yuan Chino', fr: 'Yuan Chinois', it: 'Yuan Cinese', pl: 'Chiński Juan', lv: 'Ķīnas Juaņa' },
    HKD: { en: 'Hong Kong Dollar', ru: 'Гонконгский доллар', de: 'Hongkong-Dollar', es: 'Dólar de Hong Kong', fr: 'Dollar de Hong Kong', it: 'Dollaro di Hong Kong', pl: 'Dolar Hongkoński', lv: 'Honkongas Dolārs' },
    SGD: { en: 'Singapore Dollar', ru: 'Сингапурский доллар', de: 'Singapur-Dollar', es: 'Dólar de Singapur', fr: 'Dollar de Singapour', it: 'Dollaro di Singapore', pl: 'Dolar Singapurski', lv: 'Singapūras Dolārs' },
    NZD: { en: 'New Zealand Dollar', ru: 'Новозеландский доллар', de: 'Neuseeland-Dollar', es: 'Dólar Neozelandés', fr: 'Dollar Néo-Zélandais', it: 'Dollaro Neozelandese', pl: 'Dolar Nowozelandzki', lv: 'Jaunzēlandes Dolārs' },
    SEK: { en: 'Swedish Krona', ru: 'Шведская крона', de: 'Schwedische Krone', es: 'Corona Sueca', fr: 'Couronne Suédoise', it: 'Corona Svedese', pl: 'Korona Szwedzka', lv: 'Zviedrijas Krona' },
    NOK: { en: 'Norwegian Krone', ru: 'Норвежская крона', de: 'Norwegische Krone', es: 'Corona Noruega', fr: 'Couronne Norvégienne', it: 'Corona Norvegese', pl: 'Korona Norweska', lv: 'Norvēģijas Krona' },
    DKK: { en: 'Danish Krone', ru: 'Датская крона', de: 'Dänische Krone', es: 'Corona Danesa', fr: 'Couronne Danoise', it: 'Corona Danese', pl: 'Korona Duńska', lv: 'Dānijas Krona' },
    PLN: { en: 'Polish Złoty', ru: 'Польский злотый', de: 'Polnischer Złoty', es: 'Złoty Polaco', fr: 'Złoty Polonais', it: 'Złoty Polacco', pl: 'Polski Złoty', lv: 'Polijas Zlots' },
    CZK: { en: 'Czech Koruna', ru: 'Чешская крона', de: 'Tschechische Krone', es: 'Corona Checa', fr: 'Couronne Tchèque', it: 'Corona Ceca', pl: 'Korona Czeska', lv: 'Čehijas Krona' },
    HUF: { en: 'Hungarian Forint', ru: 'Венгерский форинт', de: 'Ungarischer Forint', es: 'Forinto Húngaro', fr: 'Forint Hongrois', it: 'Fiorino Ungherese', pl: 'Forint Węgierski', lv: 'Ungārijas Forints' },
    RON: { en: 'Romanian Leu', ru: 'Румынский лей', de: 'Rumänischer Leu', es: 'Leu Rumano', fr: 'Leu Roumain', it: 'Leu Rumeno', pl: 'Lej Rumuński', lv: 'Rumānijas Leja' },
    ISK: { en: 'Icelandic Króna', ru: 'Исландская крона', de: 'Isländische Krone', es: 'Corona Islandesa', fr: 'Couronne Islandaise', it: 'Corona Islandese', pl: 'Korona Islandzka', lv: 'Islandes Krona' },
    TRY: { en: 'Turkish Lira', ru: 'Турецкая лира', de: 'Türkische Lira', es: 'Lira Turca', fr: 'Livre Turque', it: 'Lira Turca', pl: 'Lira Turecka', lv: 'Turcijas Lira' },
    ZAR: { en: 'South African Rand', ru: 'Южноафриканский рэнд', de: 'Südafrikanischer Rand', es: 'Rand Sudafricano', fr: 'Rand Sud-Africain', it: 'Rand Sudafricano', pl: 'Rand Południowoafrykański', lv: 'Dienvidāfrikas Rands' },
    MXN: { en: 'Mexican Peso', ru: 'Мексиканское песо', de: 'Mexikanischer Peso', es: 'Peso Mexicano', fr: 'Peso Mexicain', it: 'Peso Messicano', pl: 'Peso Meksykańskie', lv: 'Meksikas Peso' },
    BRL: { en: 'Brazilian Real', ru: 'Бразильский реал', de: 'Brasilianischer Real', es: 'Real Brasileño', fr: 'Real Brésilien', it: 'Real Brasiliano', pl: 'Real Brazylijski', lv: 'Brazīlijas Reāls' },
    INR: { en: 'Indian Rupee', ru: 'Индийская рупия', de: 'Indische Rupie', es: 'Rupia India', fr: 'Roupie Indienne', it: 'Rupia Indiana', pl: 'Rupia Indyjska', lv: 'Indijas Rūpija' },
    IDR: { en: 'Indonesian Rupiah', ru: 'Индонезийская рупия', de: 'Indonesische Rupiah', es: 'Rupia Indonesia', fr: 'Roupie Indonésienne', it: 'Rupia Indonesiana', pl: 'Rupia Indonezyjska', lv: 'Indonēzijas Rūpija' },
    ILS: { en: 'Israeli New Shekel', ru: 'Новый израильский шекель', de: 'Israelischer Schekel', es: 'Nuevo Séquel Israelí', fr: 'Nouveau Shekel Israélien', it: 'Nuovo Siclo Israeliano', pl: 'Nowy Szekel Izraelski', lv: 'Izraēlas Šekelis' },
    KRW: { en: 'South Korean Won', ru: 'Южнокорейская вона', de: 'Südkoreanischer Won', es: 'Won Surcoreano', fr: 'Won Sud-Coréen', it: 'Won Sudcoreano', pl: 'Won Południowokoreański', lv: 'Dienvidkorejas Vona' },
    MYR: { en: 'Malaysian Ringgit', ru: 'Малайзийский ринггит', de: 'Malaysischer Ringgit', es: 'Ringgit Malayo', fr: 'Ringgit Malaisien', it: 'Ringgit Malese', pl: 'Ringgit Malezyjski', lv: 'Malaizijas Ringits' },
    PHP: { en: 'Philippine Peso', ru: 'Филиппинское песо', de: 'Philippinischer Peso', es: 'Peso Filipino', fr: 'Peso Philippin', it: 'Peso Filippino', pl: 'Peso Filipińskie', lv: 'Filipīnu Peso' },
    THB: { en: 'Thai Baht', ru: 'Тайский бат', de: 'Thailändischer Baht', es: 'Baht Tailandés', fr: 'Baht Thaïlandais', it: 'Baht Thailandese', pl: 'Bat Tajski', lv: 'Taizemes Bāts' },
}

export function getCurrencyName(code: string, lang: string): string {
    const entry = CURRENCY_NAMES[code as CurrencyCode]
    if (!entry) return code
    return entry[lang] || entry.en
}

export function getCurrencyLabel(code: string, lang: string): string {
    return `${code} - ${getCurrencyName(code, lang)}`
}
