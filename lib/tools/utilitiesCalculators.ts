// SEO / text-analysis / everyday-task utility helpers for the Utilities category.
import { t } from './i18n'

// "SERP Title & Meta Description Checker" - character-count based validation
// against commonly cited Google SERP display guidance (title ~50-60 chars,
// meta description ~120-158 chars). This uses character counts rather than
// rendered pixel width, a deliberate simplification since pixel width
// depends on font/browser rendering and would need a per-character width
// table to approximate accurately.
//
// Status words are localized via `language` (from CalculatorWidget's page
// locale) and, for RU/ES/FR/IT, gender-agree with "title"(masc.) vs "meta
// description"(fem./neut.) matching the exact wording already published in
// each locale's key_points copy for this tool.
const TITLE_STATUS: Record<string, Record<string, string>> = {
    empty: { en: 'Empty', ru: 'Пусто', de: 'Leer', es: 'Vacío', fr: 'Vide', it: 'Vuoto', pl: 'Puste', lv: 'Tukšs' },
    too_short: { en: 'Too Short', ru: 'Слишком короткий', de: 'Zu Kurz', es: 'Demasiado Corto', fr: 'Trop Court', it: 'Troppo Corto', pl: 'Za Krótki', lv: 'Par īsu' },
    good: { en: 'Good', ru: 'Хорошо', de: 'Gut', es: 'Bien', fr: 'Bien', it: 'Buono', pl: 'Dobrze', lv: 'Labi' },
    too_long: { en: 'Too Long', ru: 'Слишком длинный', de: 'Zu Lang', es: 'Demasiado Largo', fr: 'Trop Long', it: 'Troppo Lungo', pl: 'Za Długi', lv: 'Par garu' },
}
const META_STATUS: Record<string, Record<string, string>> = {
    empty: { en: 'Empty', ru: 'Пусто', de: 'Leer', es: 'Vacía', fr: 'Vide', it: 'Vuota', pl: 'Puste', lv: 'Tukšs' },
    too_short: { en: 'Too Short', ru: 'Слишком короткое', de: 'Zu Kurz', es: 'Demasiado Corta', fr: 'Trop Courte', it: 'Troppo Corta', pl: 'Za Krótki', lv: 'Par īsu' },
    good: { en: 'Good', ru: 'Хорошо', de: 'Gut', es: 'Bien', fr: 'Bien', it: 'Buono', pl: 'Dobrze', lv: 'Labi' },
    too_long: { en: 'Too Long', ru: 'Слишком длинное', de: 'Zu Lang', es: 'Demasiado Larga', fr: 'Trop Longue', it: 'Troppo Lunga', pl: 'Za Długi', lv: 'Par garu' },
}
export function serpSnippetChecker(params: { title: unknown; meta_description: unknown; language: unknown }): {
    title_length: number; title_status: string; meta_length: number; meta_status: string
} {
    const title = String(params.title || '')
    const metaDescription = String(params.meta_description || '')
    const titleLength = title.length
    const metaLength = metaDescription.length
    const titleBucket = titleLength === 0 ? 'empty' : titleLength < 30 ? 'too_short' : titleLength <= 60 ? 'good' : 'too_long'
    const metaBucket = metaLength === 0 ? 'empty' : metaLength < 70 ? 'too_short' : metaLength <= 158 ? 'good' : 'too_long'
    return {
        title_length: titleLength,
        title_status: t(TITLE_STATUS[titleBucket], params.language),
        meta_length: metaLength,
        meta_status: t(META_STATUS[metaBucket], params.language),
    }
}

// "URL Cleaner" - strips common analytics/ad tracking query parameters
const TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'msclkid', 'mc_cid', 'mc_eid', 'igshid', 'yclid', 'dclid', 'twclid', 'ref',
]
const INVALID_URL: Record<string, string> = {
    en: 'Invalid URL', ru: 'Некорректный URL', de: 'Ungültige URL', es: 'URL no válida',
    fr: 'URL invalide', it: 'URL non valido', pl: 'Nieprawidłowy URL', lv: 'Nederīgs URL',
}
export function removeTrackingParams(params: { url: unknown; language: unknown }): { cleaned_url: string; removed_count: number } {
    try {
        const u = new URL(String(params.url))
        let removedCount = 0
        TRACKING_PARAMS.forEach((p) => {
            if (u.searchParams.has(p)) {
                u.searchParams.delete(p)
                removedCount++
            }
        })
        return { cleaned_url: u.toString(), removed_count: removedCount }
    } catch {
        return { cleaned_url: t(INVALID_URL, params.language), removed_count: 0 }
    }
}

// "UTM Campaign URL Builder"
const INVALID_BASE_URL: Record<string, string> = {
    en: 'Invalid base URL', ru: 'Некорректный базовый URL', de: 'Ungültige Basis-URL', es: 'URL base no válida',
    fr: 'URL de base invalide', it: 'URL base non valido', pl: 'Nieprawidłowy podstawowy URL', lv: 'Nederīgs bāzes URL',
}
export function utmUrlBuilder(params: {
    base_url: unknown; source: unknown; medium: unknown; campaign: unknown; term: unknown; content: unknown; language: unknown
}): string {
    try {
        const u = new URL(String(params.base_url))
        const source = String(params.source || '')
        const medium = String(params.medium || '')
        const campaign = String(params.campaign || '')
        const term = String(params.term || '')
        const content = String(params.content || '')
        if (source) u.searchParams.set('utm_source', source)
        if (medium) u.searchParams.set('utm_medium', medium)
        if (campaign) u.searchParams.set('utm_campaign', campaign)
        if (term) u.searchParams.set('utm_term', term)
        if (content) u.searchParams.set('utm_content', content)
        return u.toString()
    } catch {
        return t(INVALID_BASE_URL, params.language)
    }
}

// Heuristic vowel-group syllable estimator (standard approximation used by
// most Flesch score calculators - not phonetically perfect, but close enough
// for a readability estimate).
function countSyllables(word: string): number {
    let w = word.toLowerCase().replace(/[^a-z]/g, '')
    if (!w) return 0
    if (w.length <= 3) return 1
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    w = w.replace(/^y/, '')
    const matches = w.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
}

// "Text Readability Score Calculator" - Flesch Reading Ease score.
// Reading-level bucket words match exactly the terms already published in
// each locale's key_points copy for this tool.
const NOT_APPLICABLE: Record<string, string> = {
    en: 'N/A', ru: 'Н/Д', de: 'Nicht verfügbar', es: 'N/D', fr: 'N/D', it: 'N/D', pl: 'Nie dotyczy', lv: 'Nav pieejams',
}
const READING_LEVELS: Record<string, Record<string, string>> = {
    very_easy: { en: 'Very Easy', ru: 'Очень легко', de: 'Sehr Leicht', es: 'Muy Fácil', fr: 'Très Facile', it: 'Molto Facile', pl: 'Bardzo łatwy', lv: 'Ļoti viegli' },
    easy: { en: 'Easy', ru: 'Легко', de: 'Leicht', es: 'Fácil', fr: 'Facile', it: 'Facile', pl: 'Łatwy', lv: 'Viegli' },
    fairly_easy: { en: 'Fairly Easy', ru: 'Довольно легко', de: 'Ziemlich Leicht', es: 'Bastante Fácil', fr: 'Assez Facile', it: 'Abbastanza Facile', pl: 'Dość łatwy', lv: 'Diezgan viegli' },
    standard: { en: 'Standard', ru: 'Стандартно', de: 'Standard', es: 'Estándar', fr: 'Standard', it: 'Standard', pl: 'Standardowy', lv: 'Standarta' },
    fairly_difficult: { en: 'Fairly Difficult', ru: 'Довольно сложно', de: 'Ziemlich Schwer', es: 'Bastante Difícil', fr: 'Assez Difficile', it: 'Abbastanza Difficile', pl: 'Dość trudny', lv: 'Diezgan grūti' },
    difficult: { en: 'Difficult', ru: 'Сложно', de: 'Schwer', es: 'Difícil', fr: 'Difficile', it: 'Difficile', pl: 'Trudny', lv: 'Grūti' },
    very_confusing: { en: 'Very Confusing', ru: 'Очень запутанно', de: 'Sehr Verwirrend', es: 'Muy Confuso', fr: 'Très Confus', it: 'Molto Confuso', pl: 'Bardzo trudny', lv: 'Ļoti sarežģīti' },
}
export function readabilityScoreCalculator(params: { text: unknown; language: unknown }): {
    word_count: number; sentence_count: number; flesch_reading_ease: number; reading_level: string
} {
    const text = String(params.text || '').trim()
    if (!text) return { word_count: 0, sentence_count: 0, flesch_reading_ease: 0, reading_level: t(NOT_APPLICABLE, params.language) }
    const words = text.split(/\s+/).filter(Boolean)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const wordCount = words.length
    const sentenceCount = Math.max(sentences.length, 1)
    const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0)
    const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / Math.max(wordCount, 1))
    let bucket: string
    if (score >= 90) bucket = 'very_easy'
    else if (score >= 80) bucket = 'easy'
    else if (score >= 70) bucket = 'fairly_easy'
    else if (score >= 60) bucket = 'standard'
    else if (score >= 50) bucket = 'fairly_difficult'
    else if (score >= 30) bucket = 'difficult'
    else bucket = 'very_confusing'
    return { word_count: wordCount, sentence_count: sentenceCount, flesch_reading_ease: score, reading_level: t(READING_LEVELS[bucket], params.language) }
}

// Standard recursive tournament-bracket seed order (e.g. for size 8:
// [1,8,4,5,2,7,3,6]) - guarantees byes are paired against a real entrant
// rather than against each other, as long as byes < bracketSize / 2, which
// always holds here since bracketSize is the smallest power of two >= the
// team count.
function seedOrder(n: number): number[] {
    if (n === 1) return [1]
    const prev = seedOrder(n / 2)
    const result: number[] = []
    prev.forEach((s) => {
        result.push(s)
        result.push(n + 1 - s)
    })
    return result
}

// "Tournament Bracket Generator" - single-elimination bracket from a
// newline-separated list of team names (a text-based way to accept a
// variable-length list within this engine's static-form input model).
// Every structural word in the generated bracket (round names, "Match",
// "vs", the bye/advance phrase, and the "Winner of Round X Match Y"
// placeholder) is localized; team names themselves are passed through
// verbatim since they're free-text user input, not translatable content.
const NEED_MORE_TEAMS: Record<string, string> = {
    en: 'Please enter at least 2 team names (one per line).', ru: 'Пожалуйста, введите как минимум 2 названия команд (по одному на строку).',
    de: 'Bitte geben Sie mindestens 2 Teamnamen ein (einen pro Zeile).', es: 'Introduce al menos 2 nombres de equipos (uno por línea).',
    fr: "Veuillez entrer au moins 2 noms d'équipes (un par ligne).", it: 'Inserisci almeno 2 nomi di squadre (uno per riga).',
    pl: 'Wprowadź co najmniej 2 nazwy drużyn (jedną na linię).', lv: 'Lūdzu, ievadiet vismaz 2 komandu nosaukumus (vienu rindā).',
}
const BRACKET_FINAL: Record<string, string> = { en: 'Final', ru: 'Финал', de: 'Finale', es: 'Final', fr: 'Finale', it: 'Finale', pl: 'Finał', lv: 'Fināls' }
const BRACKET_SEMIFINALS: Record<string, string> = { en: 'Semifinals', ru: 'Полуфиналы', de: 'Halbfinale', es: 'Semifinales', fr: 'Demi-finales', it: 'Semifinali', pl: 'Półfinały', lv: 'Pusfināli' }
const BRACKET_QUARTERFINALS: Record<string, string> = { en: 'Quarterfinals', ru: 'Четвертьфиналы', de: 'Viertelfinale', es: 'Cuartos de Final', fr: 'Quarts de Finale', it: 'Quarti di Finale', pl: 'Ćwierćfinały', lv: 'Ceturtdaļfināli' }
const BRACKET_ROUND: Record<string, string> = { en: 'Round', ru: 'Раунд', de: 'Runde', es: 'Ronda', fr: 'Tour', it: 'Turno', pl: 'Runda', lv: 'Raunds' }
const BRACKET_MATCH: Record<string, string> = { en: 'Match', ru: 'Матч', de: 'Spiel', es: 'Partido', fr: 'Match', it: 'Partita', pl: 'Mecz', lv: 'Spēle' }
const BRACKET_VS: Record<string, string> = { en: 'vs', ru: 'против', de: 'gegen', es: 'contra', fr: 'contre', it: 'contro', pl: 'kontra', lv: 'pret' }
const BRACKET_ADVANCES_BYE: Record<string, string> = {
    en: 'advances (bye)', ru: 'проходит без игры (bye)', de: 'kommt kampflos weiter', es: 'avanza (bye)',
    fr: 'avance (bye)', it: 'avanza (turno di riposo)', pl: 'awansuje (pauza)', lv: 'virzās tālāk (bez spēles)',
}
const BRACKET_WINNER_OF: Record<string, string> = {
    en: 'Winner of', ru: 'Победитель', de: 'Sieger von', es: 'Ganador de', fr: 'Vainqueur du', it: 'Vincitore del', pl: 'Zwycięzca', lv: 'Uzvarētājs no',
}
// Genitive-case forms of "Round"/"Match", needed only inside the "Winner of
// Round X Match Y" phrase for languages with grammatical case (RU/PL/LV) -
// "Победитель Раунда 1 Матча 1", not the nominative "Раунд"/"Матч" used
// elsewhere as standalone labels ("Round 3:", "Match 2:"). Other locales
// reuse the plain BRACKET_ROUND/BRACKET_MATCH nominative forms since French,
// German, Spanish, Italian, and English don't decline nouns by case here.
const BRACKET_ROUND_GEN: Record<string, string> = { ru: 'Раунда', pl: 'Rundy', lv: 'Raunda' }
const BRACKET_MATCH_GEN: Record<string, string> = { ru: 'Матча', pl: 'Meczu', lv: 'Spēles' }
export function tournamentBracketGenerator(params: { team_names: unknown; language: unknown }): string {
    const lang = params.language
    const raw = String(params.team_names || '')
    let teams = raw.split('\n').map((s) => s.trim()).filter(Boolean)
    if (teams.length < 2) return t(NEED_MORE_TEAMS, lang)
    if (teams.length > 64) teams = teams.slice(0, 64)

    let bracketSize = 2
    while (bracketSize < teams.length) bracketSize *= 2

    const order = seedOrder(bracketSize)
    const slots = order.map((seed) => (seed <= teams.length ? teams[seed - 1] : 'BYE'))

    const roundLabel = (matchCount: number, round: number): string => {
        if (matchCount === 1) return t(BRACKET_FINAL, lang)
        if (matchCount === 2) return t(BRACKET_SEMIFINALS, lang)
        if (matchCount === 4) return t(BRACKET_QUARTERFINALS, lang)
        return `${t(BRACKET_ROUND, lang)} ${round}`
    }
    const winnerOfLabel = (round: number, matchNum: number): string => {
        const roundWord = BRACKET_ROUND_GEN[String(lang)] || t(BRACKET_ROUND, lang)
        const matchWord = BRACKET_MATCH_GEN[String(lang)] || t(BRACKET_MATCH, lang)
        return `${t(BRACKET_WINNER_OF, lang)} ${roundWord} ${round} ${matchWord} ${matchNum}`
    }

    const lines: string[] = []
    let round = 1
    let currentLabels = slots
    while (currentLabels.length > 1) {
        const matchCount = currentLabels.length / 2
        lines.push(`${roundLabel(matchCount, round)}:`)
        const nextLabels: string[] = []
        for (let i = 0; i < currentLabels.length; i += 2) {
            const a = currentLabels[i]
            const b = currentLabels[i + 1]
            const matchNum = i / 2 + 1
            if (round === 1) {
                if (b === 'BYE') lines.push(`  ${t(BRACKET_MATCH, lang)} ${matchNum}: ${a} ${t(BRACKET_ADVANCES_BYE, lang)}`)
                else if (a === 'BYE') lines.push(`  ${t(BRACKET_MATCH, lang)} ${matchNum}: ${b} ${t(BRACKET_ADVANCES_BYE, lang)}`)
                else lines.push(`  ${t(BRACKET_MATCH, lang)} ${matchNum}: ${a} ${t(BRACKET_VS, lang)} ${b}`)
            } else {
                lines.push(`  ${t(BRACKET_MATCH, lang)} ${matchNum}: ${winnerOfLabel(round - 1, i + 1)} ${t(BRACKET_VS, lang)} ${winnerOfLabel(round - 1, i + 2)}`)
            }
            const winnerLabel = b === 'BYE' ? a : a === 'BYE' ? b : `Winner of R${round}M${matchNum}`
            nextLabels.push(winnerLabel)
        }
        currentLabels = nextLabels
        round++
        lines.push('')
    }
    return lines.join('\n').trim()
}

// "Character Counter & Platform Limit Validator"
const PLATFORM_LIMITS: Record<string, number> = {
    x_twitter: 280,
    instagram_caption: 2200,
    meta_description: 158,
    title_tag: 60,
    sms: 160,
    meta_ads_primary_text: 125,
    youtube_title: 100,
}
const WITHIN_LIMIT: Record<string, string> = {
    en: 'Within Limit', ru: 'В пределах лимита', de: 'Innerhalb des Limits', es: 'Dentro del Límite',
    fr: 'Dans la Limite', it: 'Entro il Limite', pl: 'W Granicach Limitu', lv: 'Robežās',
}
const OVER_LIMIT: Record<string, string> = {
    en: 'Over Limit', ru: 'Превышен лимит', de: 'Limit Überschritten', es: 'Límite Superado',
    fr: 'Limite Dépassée', it: 'Limite Superato', pl: 'Przekroczono Limit', lv: 'Pārsniegts Limits',
}
export function platformLimitValidator(params: { text: unknown; platform: unknown; language: unknown }): {
    char_count: number; limit: number; remaining: number; status: string
} {
    const text = String(params.text || '')
    const limit = PLATFORM_LIMITS[String(params.platform)] || PLATFORM_LIMITS.x_twitter
    const charCount = text.length
    const remaining = limit - charCount
    const status = charCount <= limit ? t(WITHIN_LIMIT, params.language) : t(OVER_LIMIT, params.language)
    return { char_count: charCount, limit, remaining, status }
}

// "Slug Generator" - converts text to a URL-friendly slug
export function slugGenerator(params: { text: unknown }): string {
    const text = String(params.text || '')
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
}

// "Duplicate Line Remover" - dedupes lines (case-sensitive, preserves first
// occurrence order) and reports the counts alongside the cleaned text.
const DEDUPE_ORIGINAL_LINES: Record<string, string> = {
    en: 'Original lines', ru: 'Исходных строк', de: 'Ursprüngliche Zeilen', es: 'Líneas originales',
    fr: 'Lignes originales', it: 'Righe originali', pl: 'Oryginalne linie', lv: 'Sākotnējās rindas',
}
const DEDUPE_UNIQUE_LINES: Record<string, string> = {
    en: 'Unique lines', ru: 'Уникальных строк', de: 'Eindeutige Zeilen', es: 'Líneas únicas',
    fr: 'Lignes uniques', it: 'Righe uniche', pl: 'Unikalne linie', lv: 'Unikālās rindas',
}
const DEDUPE_DUPLICATES_REMOVED: Record<string, string> = {
    en: 'Duplicates removed', ru: 'Удалено дубликатов', de: 'Entfernte Duplikate', es: 'Duplicados eliminados',
    fr: 'Doublons supprimés', it: 'Duplicati rimossi', pl: 'Usunięte duplikaty', lv: 'Noņemti dublikāti',
}
const DEDUPE_CLEANED_TEXT: Record<string, string> = {
    en: 'Cleaned Text', ru: 'Очищенный текст', de: 'Bereinigter Text', es: 'Texto Limpio',
    fr: 'Texte Nettoyé', it: 'Testo Pulito', pl: 'Oczyszczony Tekst', lv: 'Iztīrītais Teksts',
}
export function duplicateLineRemover(params: { text: unknown; language: unknown }): string {
    const text = String(params.text || '')
    const lines = text.split('\n')
    const seen = new Set<string>()
    const unique: string[] = []
    for (const line of lines) {
        if (!seen.has(line)) {
            seen.add(line)
            unique.push(line)
        }
    }
    const originalCount = lines.length
    const uniqueCount = unique.length
    const removedCount = originalCount - uniqueCount
    const lang = params.language
    return `${t(DEDUPE_ORIGINAL_LINES, lang)}: ${originalCount}\n${t(DEDUPE_UNIQUE_LINES, lang)}: ${uniqueCount}\n${t(DEDUPE_DUPLICATES_REMOVED, lang)}: ${removedCount}\n\n--- ${t(DEDUPE_CLEANED_TEXT, lang)} ---\n${unique.join('\n')}`
}

// "Text Diff Checker" - a simple line-set comparison (which lines are only
// in A, only in B, or in both), not a positional sequence diff like git
// diff or the Myers algorithm - documented as a deliberate simplification
// suited to quick "what changed" checks on short text blocks.
const DIFF_ONLY_IN_A: Record<string, string> = {
    en: 'Only in Text A (removed)', ru: 'Только в тексте A (удалено)', de: 'Nur in Text A (entfernt)', es: 'Solo en el Texto A (eliminado)',
    fr: 'Uniquement dans le Texte A (supprimé)', it: 'Solo nel Testo A (rimosso)', pl: 'Tylko w Tekście A (usunięte)', lv: 'Tikai Tekstā A (noņemts)',
}
const DIFF_ONLY_IN_B: Record<string, string> = {
    en: 'Only in Text B (added)', ru: 'Только в тексте B (добавлено)', de: 'Nur in Text B (hinzugefügt)', es: 'Solo en el Texto B (añadido)',
    fr: 'Uniquement dans le Texte B (ajouté)', it: 'Solo nel Testo B (aggiunto)', pl: 'Tylko w Tekście B (dodane)', lv: 'Tikai Tekstā B (pievienots)',
}
const DIFF_UNCHANGED: Record<string, string> = {
    en: 'Unchanged lines', ru: 'Неизменённые строки', de: 'Unveränderte Zeilen', es: 'Líneas sin cambios',
    fr: 'Lignes inchangées', it: 'Righe invariate', pl: 'Niezmienione linie', lv: 'Nemainītās rindas',
}
export function textDiffChecker(params: { text_a: unknown; text_b: unknown; language: unknown }): string {
    const linesA = String(params.text_a || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const linesB = String(params.text_b || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const setA = new Set(linesA)
    const setB = new Set(linesB)
    const removed = linesA.filter((l) => !setB.has(l))
    const added = linesB.filter((l) => !setA.has(l))
    const unchanged = linesA.filter((l) => setB.has(l))
    const lang = params.language
    let result = `${t(DIFF_ONLY_IN_A, lang)}: ${removed.length}\n`
    result += removed.map((l) => `  - ${l}`).join('\n')
    result += `\n\n${t(DIFF_ONLY_IN_B, lang)}: ${added.length}\n`
    result += added.map((l) => `  + ${l}`).join('\n')
    result += `\n\n${t(DIFF_UNCHANGED, lang)}: ${unchanged.length}`
    return result
}

// "Meta Tag / Open Graph Generator" - templated HTML meta tag block. Not
// localized: the tag/attribute names (title, description, og:title, ...)
// are required HTML/Open Graph syntax, not natural-language explanation -
// translating them would produce a broken, non-functional snippet.
export function metaTagGenerator(params: {
    title: unknown; description: unknown; url: unknown; image_url: unknown; site_name: unknown
}): string {
    const esc = (s: unknown) => String(s || '').replace(/"/g, '&quot;')
    const title = params.title
    const description = params.description
    const url = params.url
    const imageUrl = String(params.image_url || '')
    const siteName = String(params.site_name || '')
    const lines = [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}">`,
        `<meta property="og:title" content="${esc(title)}">`,
        `<meta property="og:description" content="${esc(description)}">`,
        `<meta property="og:url" content="${esc(url)}">`,
        `<meta property="og:type" content="website">`,
    ]
    if (imageUrl) lines.push(`<meta property="og:image" content="${esc(imageUrl)}">`)
    if (siteName) lines.push(`<meta property="og:site_name" content="${esc(siteName)}">`)
    lines.push(`<meta name="twitter:card" content="summary_large_image">`)
    lines.push(`<meta name="twitter:title" content="${esc(title)}">`)
    lines.push(`<meta name="twitter:description" content="${esc(description)}">`)
    if (imageUrl) lines.push(`<meta name="twitter:image" content="${esc(imageUrl)}">`)
    return lines.join('\n')
}

// "Robots.txt Generator" - not localized: "User-agent:", "Disallow:", and
// "Sitemap:" are required robots.txt directive syntax, not natural-language
// explanation - translating them would produce a file crawlers can't parse.
export function robotsTxtGenerator(params: {
    allow_all: unknown; disallow_paths: unknown; sitemap_url: unknown; user_agent: unknown
}): string {
    const userAgent = String(params.user_agent || '*').trim() || '*'
    const lines = [`User-agent: ${userAgent}`]
    if (String(params.allow_all) === 'yes') {
        lines.push('Disallow:')
    } else {
        const paths = String(params.disallow_paths || '').split(',').map((p) => p.trim()).filter(Boolean)
        if (paths.length === 0) {
            lines.push('Disallow:')
        } else {
            paths.forEach((p) => lines.push(`Disallow: ${p.startsWith('/') ? p : '/' + p}`))
        }
    }
    const sitemapUrl = String(params.sitemap_url || '')
    if (sitemapUrl) {
        lines.push('')
        lines.push(`Sitemap: ${sitemapUrl}`)
    }
    return lines.join('\n')
}

// "Lorem Ipsum Generator" - deterministic pseudo-random placeholder text
// (Math.sin-based sequence, not crypto-random) so results are reproducible
// for a given paragraph count. Not localized: Lorem Ipsum is Latin
// placeholder text by definition, in every locale.
const LOREM_WORDS = (
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
    'enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
    'in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non ' +
    'proident sunt culpa qui officia deserunt mollit anim id est laborum'
).split(' ')

function pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

export function loremIpsumGenerator(params: { paragraphs: unknown }): string {
    const count = Math.min(Math.max(Number(params.paragraphs) || 1, 1), 20)
    const result: string[] = []
    let seed = 1
    for (let p = 0; p < count; p++) {
        const sentenceCount = 4 + Math.floor(pseudoRandom(seed++) * 4)
        const sentences: string[] = []
        for (let s = 0; s < sentenceCount; s++) {
            const wordCount = 8 + Math.floor(pseudoRandom(seed++) * 10)
            const words: string[] = []
            for (let w = 0; w < wordCount; w++) {
                const idx = Math.floor(pseudoRandom(seed++) * LOREM_WORDS.length)
                words.push(LOREM_WORDS[idx])
            }
            let sentence = words.join(' ')
            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
            sentences.push(sentence)
        }
        let paragraph = sentences.join(' ')
        if (p === 0) paragraph = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paragraph
        result.push(paragraph)
    }
    return result.join('\n\n')
}
