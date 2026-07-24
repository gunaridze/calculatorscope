// Shared helper for lib/tools/* functions that return human-readable
// explanatory text (statuses, messages, generated summaries) rather than
// pure numbers. `language` arrives via CalculatorWidget -> calculate()'s
// `config.language` (set from the page's route param in page.tsx) and is
// auto-injected into every function's params - see core/engines/json.ts.
export type SiteLang = 'en' | 'ru' | 'de' | 'es' | 'fr' | 'it' | 'pl' | 'lv'

// Looks up `lang` in `dict`, falling back to English, then to the first
// available value if even English is missing (should never happen in
// practice since every dict below defines `en`).
export function t(dict: Partial<Record<SiteLang, string>>, language: unknown): string {
    const lang = String(language || 'en') as SiteLang
    return dict[lang] ?? dict.en ?? Object.values(dict)[0] ?? ''
}
