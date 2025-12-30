import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

type TranslationKey = 
  | 'header_h1'
  | 'header_text'
  | 'burger_button'
  | 'header_search_placeholder'
  | 'footer_link_1'
  | 'footer_link_2'
  | 'footer_link_3'
  | 'footer_copyright'

type Lang = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pl' | 'ru' | 'lv'

interface TranslationRow {
  lang: Lang
  header_h1: string
  header_text: string
  burger_button: string
  header_search_placeholder: string
  footer_link_1: string
  footer_link_2: string
  footer_link_3: string
  footer_copyright: string
}

let translationsCache: Map<Lang, TranslationRow> | null = null

function loadTranslations(): Map<Lang, TranslationRow> {
  if (translationsCache) {
    return translationsCache
  }

  const csvPath = path.join(process.cwd(), 'scripts', 'header_and_footer_texts.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.warn(`⚠️  Translations file not found: ${csvPath}`)
    // Возвращаем пустую карту, fallback будет использован в функции t()
    translationsCache = new Map()
    return translationsCache
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records: TranslationRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ';',
  })

  const translations = new Map<Lang, TranslationRow>()
  
  for (const record of records) {
    translations.set(record.lang as Lang, record)
  }

  translationsCache = translations
  return translations
}

// Fallback переводы на английском
const fallbackTranslations: Record<TranslationKey, string> = {
  header_h1: 'Calculator Scope - Smart Online Calculators for Everything',
  header_text: 'From math, science, finance, health, and construction to marketing, text tools, developer utilities, and more. All calculators in one fast, accurate, easy-to-use platform.',
  burger_button: 'Calculators',
  header_search_placeholder: 'Search calculator',
  footer_link_1: 'Privacy Policy',
  footer_link_2: 'Legal Information & Terms of Use',
  footer_link_3: 'Contact Us',
  footer_copyright: 'CalculatorScope. All Rights Reserved.',
}

export function t(lang: string, key: TranslationKey): string {
  const translations = loadTranslations()
  const langTranslations = translations.get(lang as Lang)
  
  if (langTranslations && langTranslations[key]) {
    return langTranslations[key]
  }
  
  // Fallback на английский, если перевод не найден
  return fallbackTranslations[key]
}

export function getTranslations(lang: string): Record<TranslationKey, string> {
  return {
    header_h1: t(lang, 'header_h1'),
    header_text: t(lang, 'header_text'),
    burger_button: t(lang, 'burger_button'),
    header_search_placeholder: t(lang, 'header_search_placeholder'),
    footer_link_1: t(lang, 'footer_link_1'),
    footer_link_2: t(lang, 'footer_link_2'),
    footer_link_3: t(lang, 'footer_link_3'),
    footer_copyright: t(lang, 'footer_copyright'),
  }
}