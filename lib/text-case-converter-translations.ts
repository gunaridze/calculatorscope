/**
 * Переводы для виджета Text Case Converter (tool_id=1002)
 */

const MODE_VALUES = ['lower', 'upper', 'title', 'sentence', 'alternating', 'random'] as const

export type TextCaseConverterLang = 'en' | 'ru' | 'de' | 'es' | 'fr' | 'it' | 'pl' | 'lv'

export interface TextCaseConverterTranslations {
  mode_options: string[]
  text_label: string
  to_format_label: string
  actions: {
    clear: string
    save: string
    copy: string
  }
}

const translations: Record<TextCaseConverterLang, TextCaseConverterTranslations> = {
  en: {
    mode_options: ['lower case', 'UPPER CASE', 'Title Case', 'Sentence case', 'aLtErNaTiNg cAsE', 'ranDOM cAsE'],
    text_label: 'Add text:',
    to_format_label: 'To format',
    actions: { clear: 'Clear', save: 'Save', copy: 'Copy' }
  },
  ru: {
    mode_options: ['все строчные', 'ВСЕ ЗАГЛАВНЫЕ', 'Каждое Слово С Заглавной', 'Как в предложении', 'чЕрЕдОвАнИе рЕгИсТрОв', 'ПРоиЗВольнОЕ нАПисанИе'],
    text_label: 'Добавьте текст:',
    to_format_label: 'В формат',
    actions: { clear: 'Очистить', save: 'Сохранить', copy: 'Копировать' }
  },
  de: {
    mode_options: ['kleinschreibung', 'GROSSSCHREIBUNG', 'Wortanfänge Groß', 'Wie im Satz', 'wEcHsElNdE GrOß-/KlEiNsChReIbUnG', 'zUFäLlIge GroSS-/KlEinSCHreIBung'],
    text_label: 'Text hinzufügen:',
    to_format_label: 'In Format',
    actions: { clear: 'Leeren', save: 'Speichern', copy: 'Kopieren' }
  },
  es: {
    mode_options: ['minúsculas', 'MAYÚSCULAS', 'Mayúsculas Iniciales', 'Tipo oración', 'mAyÚsCuLaS AlTeRnAs', 'maYúScUlAs AleAtorIAs'],
    text_label: 'Añadir texto:',
    to_format_label: 'Al formato',
    actions: { clear: 'Limpiar', save: 'Guardar', copy: 'Copiar' }
  },
  fr: {
    mode_options: ['tout en minuscules', 'TOUT EN MAJUSCULES', 'Chaque Mot En Majuscule', 'Type phrase', 'cAsSe aLtErNéE', 'Casse aléatOirE'],
    text_label: 'Ajouter du texte :',
    to_format_label: 'Au format',
    actions: { clear: 'Effacer', save: 'Enregistrer', copy: 'Copier' }
  },
  it: {
    mode_options: ['tutto minuscolo', 'TUTTO MAIUSCOLO', 'Iniziali Maiuscole', 'Come in una frase', 'aLtErNaNzA MaIuScOlE/MiNuScOlE', 'MaiuSCOLE/miNuscOLE cASuali'],
    text_label: 'Aggiungi testo:',
    to_format_label: 'In formato',
    actions: { clear: 'Cancella', save: 'Salva', copy: 'Copia' }
  },
  pl: {
    mode_options: ['małe litery', 'WIELKIE LITERY', 'Każdy Wyraz Wielką', 'Jak w zdaniu', 'nApRzEmIeNnA WiElKoŚć lItEr', 'lOsowa wieLKoŚĆ LiTeR'],
    text_label: 'Dodaj tekst:',
    to_format_label: 'Do formatu',
    actions: { clear: 'Wyczyść', save: 'Zapisz', copy: 'Kopiuj' }
  },
  lv: {
    mode_options: ['mazie burti', 'LIELIE BURTI', 'Katrs Vārds Ar Lielo', 'Teikuma reģistrs', 'mAiŅīGs bUrTu rEģIsTrS', 'NeJaUšS BurtU rEĢIStrs'],
    text_label: 'Pievienot tekstu:',
    to_format_label: 'Uz formātu',
    actions: { clear: 'Notīrīt', save: 'Saglabāt', copy: 'Kopēt' }
  }
}

export function getTextCaseConverterTranslations(lang: string): TextCaseConverterTranslations {
  const key = lang as TextCaseConverterLang
  return translations[key] ?? translations.en
}

export function getTextCaseConverterModeOptions(lang: string): Array<{ value: string; label: string }> {
  const t = getTextCaseConverterTranslations(lang)
  return MODE_VALUES.map((value, i) => ({
    value,
    label: t.mode_options[i] ?? value
  }))
}
