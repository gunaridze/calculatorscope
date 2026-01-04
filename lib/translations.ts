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
  | 'widget_clear'
  | 'widget_calculate'
  | 'widget_result'
  | 'widget_copy'
  | 'widget_suggest'
  | 'widget_get_widget'
  | 'widget_input_label'
  | 'widget_format_label'
  | 'widget_words_option'
  | 'widget_check_writing_option'
  | 'widget_currency_option'
  | 'widget_currency_vat_option'
  | 'widget_letter_case_label'
  | 'widget_lowercase_option'
  | 'widget_uppercase_option'
  | 'widget_title_case_option'
  | 'widget_sentence_case_option'
  | 'widget_plus_vat'

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
  widget_clear: string
  widget_calculate: string
  widget_result: string
  widget_copy: string
  widget_suggest: string
  widget_get_widget: string
  widget_input_label: string
  widget_format_label: string
  widget_words_option: string
  widget_check_writing_option: string
  widget_currency_option: string
  widget_currency_vat_option: string
  widget_letter_case_label: string
  widget_lowercase_option: string
  widget_uppercase_option: string
  widget_title_case_option: string
  widget_sentence_case_option: string
  widget_plus_vat: string
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
  widget_clear: 'Clear',
  widget_calculate: 'Calculate',
  widget_result: 'Result',
  widget_copy: 'Copy',
  widget_suggest: 'Suggest an improvement or request a new calculator.',
  widget_get_widget: 'Get a Free Widget for this Calculator',
  widget_input_label: 'Convert this Number:',
  widget_format_label: 'To:',
  widget_words_option: 'Words',
  widget_check_writing_option: 'Check Writing',
  widget_currency_option: 'Currency',
  widget_currency_vat_option: 'Currency + VAT',
  widget_letter_case_label: 'Letter Case:',
  widget_lowercase_option: 'lowercase',
  widget_uppercase_option: 'UPPERCASE',
  widget_title_case_option: 'Title Case',
  widget_sentence_case_option: 'Sentence case',
  widget_plus_vat: '+ VAT',
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
    widget_clear: t(lang, 'widget_clear'),
    widget_calculate: t(lang, 'widget_calculate'),
    widget_result: t(lang, 'widget_result'),
    widget_copy: t(lang, 'widget_copy'),
    widget_suggest: t(lang, 'widget_suggest'),
    widget_get_widget: t(lang, 'widget_get_widget'),
    widget_input_label: t(lang, 'widget_input_label'),
    widget_format_label: t(lang, 'widget_format_label'),
    widget_words_option: t(lang, 'widget_words_option'),
    widget_check_writing_option: t(lang, 'widget_check_writing_option'),
    widget_currency_option: t(lang, 'widget_currency_option'),
    widget_currency_vat_option: t(lang, 'widget_currency_vat_option'),
    widget_letter_case_label: t(lang, 'widget_letter_case_label'),
    widget_lowercase_option: t(lang, 'widget_lowercase_option'),
    widget_uppercase_option: t(lang, 'widget_uppercase_option'),
    widget_title_case_option: t(lang, 'widget_title_case_option'),
    widget_sentence_case_option: t(lang, 'widget_sentence_case_option'),
    widget_plus_vat: t(lang, 'widget_plus_vat'),
  }
}