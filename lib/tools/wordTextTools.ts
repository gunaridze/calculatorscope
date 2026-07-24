// Word & text analysis / word-game helpers for the Word & Text Tools category.
import { t } from './i18n'

// "Word & Character Counter"
export function wordCharacterCounter(params: { text: unknown }): {
    word_count: number; char_count_with_spaces: number; char_count_no_spaces: number
    sentence_count: number; paragraph_count: number; avg_word_length: number
} {
    const text = String(params.text || '')
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : []
    const wordCount = words.length
    const charCountWithSpaces = text.length
    const charCountNoSpaces = text.replace(/\s/g, '').length
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    const avgWordLength = wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0
    return {
        word_count: wordCount,
        char_count_with_spaces: charCountWithSpaces,
        char_count_no_spaces: charCountNoSpaces,
        sentence_count: sentences.length,
        paragraph_count: paragraphs.length || (trimmed ? 1 : 0),
        avg_word_length: avgWordLength,
    }
}

// "Reading Time Calculator" - speaking time uses a fixed ~130 wpm average
// speech pace convention, independent of the user-selected reading wpm
export function readingTimeCalculator(params: { text: unknown; wpm: unknown }): {
    word_count: number; reading_time_minutes: number; speaking_time_minutes: number
} {
    const text = String(params.text || '').trim()
    const words = text ? text.split(/\s+/).filter(Boolean) : []
    const wordCount = words.length
    const wpm = Number(params.wpm) || 200
    return {
        word_count: wordCount,
        reading_time_minutes: wordCount / wpm,
        speaking_time_minutes: wordCount / 130,
    }
}

// "Random Name Picker" - Fisher-Yates shuffle, returns the first N as a
// comma-separated string. Genuinely random (Math.random) since this runs
// fresh on each "Calculate" click, not memoized.
const NEED_ONE_NAME: Record<string, string> = {
    en: 'Please enter at least one name (one per line).', ru: 'Пожалуйста, введите хотя бы одно имя (по одному на строку).',
    de: 'Bitte geben Sie mindestens einen Namen ein (einen pro Zeile).', es: 'Introduce al menos un nombre (uno por línea).',
    fr: 'Veuillez entrer au moins un nom (un par ligne).', it: 'Inserisci almeno un nome (uno per riga).',
    pl: 'Wprowadź co najmniej jedno imię (jedno na linię).', lv: 'Lūdzu, ievadiet vismaz vienu vārdu (vienu rindā).',
}
export function randomNamePicker(params: { names: unknown; count: unknown; language: unknown }): string {
    const list = String(params.names || '').split('\n').map((n) => n.trim()).filter(Boolean)
    if (list.length === 0) return t(NEED_ONE_NAME, params.language)
    const pickCount = Math.min(Math.max(Number(params.count) || 1, 1), list.length)
    const indices = list.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices.slice(0, pickCount).map((i) => list[i]).join(', ')
}

// "Keyword Density Analyzer" - top 10 non-stopword keywords by frequency/density.
// Words are matched with the Unicode `\p{L}` letter class (not `[a-z]`) so
// non-Latin scripts (Cyrillic, etc.) are counted correctly - matching `[a-z']`
// silently dropped every word in Cyrillic, Greek, or other non-Latin text.
// Stopwords are selected per `language` since "the/a/and"-style filtering
// only makes sense for the language the pasted content is actually in.
const STOPWORDS_BY_LANG: Record<string, Set<string>> = {
    en: new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'that', 'this', 'these',
        'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'his', 'her', 'their',
        'our', 'your', 'my', 'me', 'us', 'not', 'no', 'do', 'does', 'did', 'have', 'has', 'had',
        'will', 'would', 'can', 'could', 'should', 'shall', 'may', 'might', 'must', 'if', 'than',
        'then', 'so', 'such', 'there', 'here', 'which', 'who', 'whom', 'what', 'when', 'where', 'why', 'how',
    ]),
    ru: new Set([
        'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она',
        'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее',
        'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда',
        'даже', 'ну', 'вдруг', 'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до',
        'вас', 'опять', 'уж', 'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей', 'может',
        'они', 'тут', 'где', 'есть', 'надо', 'ней', 'для', 'мы', 'тебя', 'их', 'чем', 'была',
        'сам', 'без', 'будто', 'чего', 'раз', 'тоже', 'себе', 'под', 'будет', 'тогда', 'кто',
        'этот', 'того', 'потому', 'этого', 'какой', 'совсем', 'этом', 'один', 'почти', 'мой', 'тем', 'чтобы',
    ]),
    de: new Set([
        'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'eines', 'einem', 'einen',
        'und', 'oder', 'aber', 'ist', 'sind', 'war', 'waren', 'sein', 'wird', 'werden', 'wurde', 'wurden',
        'zu', 'von', 'in', 'an', 'auf', 'für', 'mit', 'bei', 'aus', 'als', 'dass', 'dieser', 'diese',
        'dieses', 'es', 'ich', 'du', 'er', 'sie', 'wir', 'ihr', 'ihre', 'unser', 'euer', 'nicht', 'kein',
        'hat', 'haben', 'hatte', 'hatten', 'kann', 'können', 'könnte', 'soll', 'sollte', 'muss', 'müssen',
        'wenn', 'dann', 'so', 'hier', 'da', 'wo', 'wer', 'was', 'wie', 'warum',
    ]),
    es: new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'es', 'son', 'era',
        'eran', 'ser', 'estar', 'de', 'a', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'que', 'este',
        'esta', 'estos', 'estas', 'se', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos',
        'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'no', 'hay', 'ha', 'han', 'había', 'puede', 'pueden',
        'debe', 'si', 'entonces', 'así', 'aquí', 'allí', 'donde', 'quien', 'qué', 'cómo', 'cuando', 'porque',
    ]),
    fr: new Set([
        'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'est', 'sont', 'était', 'étaient',
        'être', 'de', 'à', 'en', 'dans', 'pour', 'par', 'avec', 'sans', 'sur', 'que', 'ce', 'cette',
        'ces', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'son', 'sa', 'ses', 'mon', 'ma', 'mes',
        'ton', 'ta', 'tes', 'ne', 'pas', 'non', 'a', 'ont', 'avait', 'peut', 'peuvent', 'doit', 'si',
        'alors', 'ainsi', 'ici', 'là', 'où', 'qui', 'quoi', 'comment', 'quand', 'pourquoi',
    ]),
    it: new Set([
        'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'o', 'ma', 'è', 'sono', 'era',
        'erano', 'essere', 'di', 'a', 'in', 'per', 'con', 'su', 'da', 'che', 'questo', 'questa',
        'questi', 'queste', 'si', 'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'suo', 'sua',
        'suoi', 'sue', 'mio', 'mia', 'miei', 'mie', 'non', 'ha', 'hanno', 'aveva', 'può', 'possono',
        'deve', 'se', 'allora', 'così', 'qui', 'qua', 'dove', 'chi', 'cosa', 'come', 'quando', 'perché',
    ]),
    pl: new Set([
        'i', 'w', 'na', 'z', 'do', 'nie', 'że', 'to', 'jest', 'są', 'był', 'była', 'było', 'być',
        'się', 'o', 'po', 'dla', 'od', 'za', 'ale', 'lub', 'albo', 'ja', 'ty', 'on', 'ona', 'ono',
        'my', 'wy', 'oni', 'one', 'jego', 'jej', 'ich', 'mój', 'twój', 'nasz', 'wasz', 'jak', 'co',
        'kto', 'gdzie', 'kiedy', 'dlaczego', 'czy', 'tylko', 'już', 'jeszcze', 'bardzo', 'może',
        'można', 'ma', 'mają', 'miał', 'miała',
    ]),
    lv: new Set([
        'un', 'ir', 'ar', 'uz', 'no', 'par', 'kā', 'bet', 'vai', 'ka', 'tas', 'tā', 'šis', 'šī',
        'es', 'tu', 'viņš', 'viņa', 'mēs', 'jūs', 'viņi', 'viņas', 'savs', 'mans', 'tavs', 'mūsu',
        'jūsu', 'nav', 'arī', 'jau', 'vēl', 'tikai', 'ļoti', 'var', 'vari', 'ja', 'tad', 'tāpēc',
        'kur', 'kad', 'kāpēc', 'kas', 'kāds', 'tik', 'pie', 'priekš',
    ]),
}
const KD_NO_KEYWORDS: Record<string, string> = {
    en: 'No significant keywords found.', ru: 'Значимые ключевые слова не найдены.', de: 'Keine relevanten Schlüsselwörter gefunden.',
    es: 'No se encontraron palabras clave significativas.', fr: 'Aucun mot-clé significatif trouvé.', it: 'Nessuna parola chiave significativa trovata.',
    pl: 'Nie znaleziono istotnych słów kluczowych.', lv: 'Nozīmīgi atslēgvārdi netika atrasti.',
}
const KD_TOTAL_WORDS: Record<string, string> = {
    en: 'Total analyzed words', ru: 'Всего проанализировано слов', de: 'Analysierte Wörter insgesamt', es: 'Total de palabras analizadas',
    fr: 'Total des mots analysés', it: 'Totale parole analizzate', pl: 'Łączna liczba przeanalizowanych słów', lv: 'Kopā analizēti vārdi',
}
const KD_TOP_KEYWORDS: Record<string, string> = {
    en: 'Top keywords', ru: 'Топ ключевых слов', de: 'Top-Keywords', es: 'Principales palabras clave',
    fr: 'Principaux mots-clés', it: 'Parole chiave principali', pl: 'Najlepsze słowa kluczowe', lv: 'Populārākie atslēgvārdi',
}
export function keywordDensityAnalyzer(params: { text: unknown; language: unknown }): string {
    const lang = String(params.language || 'en')
    const text = String(params.text || '').toLowerCase()
    const allWords = text.match(/[\p{L}']+/gu) || []
    const stopwords = STOPWORDS_BY_LANG[lang] || STOPWORDS_BY_LANG.en
    const filtered = allWords.filter((w) => !stopwords.has(w) && w.length > 1)
    const total = filtered.length
    if (total === 0) return t(KD_NO_KEYWORDS, lang)
    const counts: Record<string, number> = {}
    filtered.forEach((w) => {
        counts[w] = (counts[w] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const lines = sorted.map(([word, count]) => `${word}: ${count} (${((count / total) * 100).toFixed(1)}%)`)
    return `${t(KD_TOTAL_WORDS, lang)}: ${total}\n\n${t(KD_TOP_KEYWORDS, lang)}:\n${lines.join('\n')}`
}

// "Common Misspellings Checker" - curated list of frequently cited English
// misspellings (not exhaustive, not a full dictionary/grammar check). The
// dictionary itself is intentionally English-only (that's this tool's
// stated scope, per its own published description) so Latin-letter word
// matching here is correct, not a bug - but the wrapper text around the
// results is localized to the page's language.
const MISSPELLINGS: Record<string, string> = {
    teh: 'the', recieve: 'receive', definately: 'definitely', seperate: 'separate', occured: 'occurred',
    wich: 'which', untill: 'until', goverment: 'government', neccessary: 'necessary', acheive: 'achieve',
    beleive: 'believe', concious: 'conscious', existance: 'existence', grammer: 'grammar',
    independant: 'independent', occassion: 'occasion', priviledge: 'privilege', publically: 'publicly',
    rediculous: 'ridiculous', tommorow: 'tomorrow', wierd: 'weird', amatuer: 'amateur', arguement: 'argument',
    basicly: 'basically', calender: 'calendar', collegue: 'colleague', commited: 'committed',
    definitly: 'definitely', embarass: 'embarrass', enviroment: 'environment', excelent: 'excellent',
    familar: 'familiar', finaly: 'finally', foriegn: 'foreign', happend: 'happened',
    immediatly: 'immediately', intelligance: 'intelligence', knowlege: 'knowledge', liason: 'liaison',
    libary: 'library', maintainance: 'maintenance', mispell: 'misspell', noticable: 'noticeable',
    occassionally: 'occasionally', pavillion: 'pavilion', posession: 'possession', recieved: 'received',
    refered: 'referred', relevent: 'relevant', religous: 'religious', seperately: 'separately',
    succesful: 'successful', supercede: 'supersede', suprise: 'surprise', tendancy: 'tendency',
    threshhold: 'threshold', truely: 'truly', unfortunatly: 'unfortunately', writting: 'writing',
}
const MISSPELLING_DID_YOU_MEAN: Record<string, string> = {
    en: 'did you mean', ru: 'вы имели в виду', de: 'meinten Sie', es: 'quisiste decir',
    fr: 'vouliez-vous dire', it: 'intendevi', pl: 'czy chodziło Ci o', lv: 'vai jums bija domāts',
}
const MISSPELLING_NONE_FOUND: Record<string, string> = {
    en: 'No common misspellings found.', ru: 'Частых ошибок не найдено.', de: 'Keine häufigen Rechtschreibfehler gefunden.',
    es: 'No se encontraron errores ortográficos comunes.', fr: "Aucune faute d'orthographe courante trouvée.", it: 'Nessun errore ortografico comune trovato.',
    pl: 'Nie znaleziono częstych błędów pisowni.', lv: 'Biežas pareizrakstības kļūdas netika atrastas.',
}
const MISSPELLING_FOUND_COUNT: Record<string, string> = {
    en: 'Found {n} possible misspelling(s)', ru: 'Найдено возможных ошибок: {n}', de: '{n} mögliche Rechtschreibfehler gefunden',
    es: 'Se encontraron {n} posible(s) error(es) ortográfico(s)', fr: '{n} faute(s) possible(s) trouvée(s)', it: 'Trovati {n} possibili errori ortografici',
    pl: 'Znaleziono możliwych błędów: {n}', lv: 'Atrastas {n} iespējamās kļūdas',
}
export function commonMisspellingsChecker(params: { text: unknown; language: unknown }): string {
    const lang = params.language
    const text = String(params.text || '')
    const words = text.match(/[A-Za-z']+/g) || []
    const found: string[] = []
    const seen = new Set<string>()
    words.forEach((w) => {
        const lower = w.toLowerCase()
        if (MISSPELLINGS[lower] && !seen.has(lower)) {
            seen.add(lower)
            found.push(`"${w}" → ${t(MISSPELLING_DID_YOU_MEAN, lang)} "${MISSPELLINGS[lower]}"?`)
        }
    })
    if (found.length === 0) return t(MISSPELLING_NONE_FOUND, lang)
    const header = t(MISSPELLING_FOUND_COUNT, lang).replace('{n}', String(found.length))
    return `${header}:\n\n${found.join('\n')}`
}

// "Anagram Checker". Normalization keeps Unicode letters/digits of any
// script (`\p{L}`/`\p{N}`, not `[a-z0-9]`) so non-Latin words (Cyrillic,
// etc.) can be compared correctly, not just English/Latin ones.
function normalizeForAnagram(s: string): string {
    return s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').split('').sort().join('')
}
const ANAGRAM_YES: Record<string, string> = {
    en: 'Yes! "{a}" and "{b}" are anagrams of each other.', ru: 'Да! «{a}» и «{b}» являются анаграммами друг друга.',
    de: 'Ja! „{a}" und „{b}" sind Anagramme voneinander.', es: '¡Sí! "{a}" y "{b}" son anagramas entre sí.',
    fr: 'Oui ! « {a} » et « {b} » sont des anagrammes l\'un de l\'autre.', it: 'Sì! "{a}" e "{b}" sono anagrammi l\'uno dell\'altro.',
    pl: 'Tak! "{a}" i "{b}" są swoimi anagramami.', lv: 'Jā! "{a}" un "{b}" ir savstarpējas anagrammas.',
}
const ANAGRAM_NO: Record<string, string> = {
    en: 'No, "{a}" and "{b}" are not anagrams of each other.', ru: 'Нет, «{a}» и «{b}» не являются анаграммами друг друга.',
    de: 'Nein, „{a}" und „{b}" sind keine Anagramme voneinander.', es: 'No, "{a}" y "{b}" no son anagramas entre sí.',
    fr: 'Non, « {a} » et « {b} » ne sont pas des anagrammes l\'un de l\'autre.', it: 'No, "{a}" e "{b}" non sono anagrammi l\'uno dell\'altro.',
    pl: 'Nie, "{a}" i "{b}" nie są swoimi anagramami.', lv: 'Nē, "{a}" un "{b}" nav savstarpējas anagrammas.',
}
export function anagramChecker(params: { text_a: unknown; text_b: unknown; language: unknown }): string {
    const a = String(params.text_a || '')
    const b = String(params.text_b || '')
    const normA = normalizeForAnagram(a)
    const normB = normalizeForAnagram(b)
    const isAnagram = normA.length > 0 && normA === normB
    const template = t(isAnagram ? ANAGRAM_YES : ANAGRAM_NO, params.language)
    return template.replace('{a}', a).replace('{b}', b)
}

// "Palindrome Checker". Same Unicode-letter/digit normalization as the
// anagram checker above, so palindromes in any script are detected.
const PALINDROME_YES: Record<string, string> = {
    en: 'Yes! "{t}" is a palindrome.', ru: 'Да! «{t}» — это палиндром.', de: 'Ja! „{t}" ist ein Palindrom.',
    es: '¡Sí! "{t}" es un palíndromo.', fr: 'Oui ! « {t} » est un palindrome.', it: 'Sì! "{t}" è un palindromo.',
    pl: 'Tak! "{t}" jest palindromem.', lv: 'Jā! "{t}" ir palindroms.',
}
const PALINDROME_NO: Record<string, string> = {
    en: 'No, "{t}" is not a palindrome.', ru: 'Нет, «{t}» не является палиндромом.', de: 'Nein, „{t}" ist kein Palindrom.',
    es: 'No, "{t}" no es un palíndromo.', fr: 'Non, « {t} » n\'est pas un palindrome.', it: 'No, "{t}" non è un palindromo.',
    pl: 'Nie, "{t}" nie jest palindromem.', lv: 'Nē, "{t}" nav palindroms.',
}
export function palindromeChecker(params: { text: unknown; language: unknown }): string {
    const text = String(params.text || '')
    const cleaned = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
    const reversed = cleaned.split('').reverse().join('')
    const isPalindrome = cleaned.length > 0 && cleaned === reversed
    const template = t(isPalindrome ? PALINDROME_YES : PALINDROME_NO, params.language)
    return template.replace('{t}', text)
}

// "Pig Latin Translator" - standard rule: vowel-initial words get "way"
// appended; consonant-initial words move the leading consonant cluster to
// the end and append "ay". Preserves capitalization and trailing punctuation.
// Not localized: this is specifically an English word-game (see tool
// description) - the output IS the transformation, not an explanation of it.
function pigLatinWord(word: string): string {
    const match = word.match(/^([A-Za-z]+)([.,!?;:]*)$/)
    if (!match) return word
    const w = match[1]
    const punct = match[2]
    const isCapitalized = w[0] === w[0].toUpperCase()
    const lower = w.toLowerCase()
    let result: string
    if (/^[aeiou]/.test(lower)) {
        result = lower + 'way'
    } else {
        const consonantMatch = lower.match(/^[^aeiou]+/)
        const cluster = consonantMatch ? consonantMatch[0] : ''
        result = lower.slice(cluster.length) + cluster + 'ay'
    }
    if (isCapitalized) result = result.charAt(0).toUpperCase() + result.slice(1)
    return result + punct
}
export function pigLatinTranslator(params: { text: unknown }): string {
    const text = String(params.text || '')
    if (!text.trim()) return ''
    return text.split(/(\s+)/).map((token) => (/\s+/.test(token) ? token : pigLatinWord(token))).join('')
}

// "Acronym Generator" - first letter of every word, uppercased. Not
// localized: the output is the generated acronym itself (from the user's
// own input text), not an explanation.
export function acronymGenerator(params: { text: unknown }): string {
    const text = String(params.text || '')
    const words = text.match(/[A-Za-z0-9]+/g) || []
    if (words.length === 0) return ''
    return words.map((w) => w[0].toUpperCase()).join('')
}

// "Random Word Generator" - picks from a curated common-word bank. Not
// localized: this specifically generates random *English* words (see tool
// description) - the output is the generated content itself, not an
// explanation, so it's intentionally always English regardless of page locale.
const WORD_BANK = [
    'apple', 'breeze', 'candle', 'desert', 'eagle', 'forest', 'garden', 'harbor', 'island', 'jungle',
    'kettle', 'lantern', 'mountain', 'notebook', 'ocean', 'pebble', 'quiet', 'river', 'sunset', 'thunder',
    'umbrella', 'valley', 'whisper', 'xylophone', 'yellow', 'zebra', 'anchor', 'bridge', 'canyon', 'diamond',
    'echo', 'feather', 'glacier', 'horizon', 'ivory', 'journey', 'kingdom', 'lighthouse', 'meadow', 'nectar',
    'orchard', 'puzzle', 'quartz', 'ribbon', 'shadow', 'tunnel', 'universe', 'velvet', 'waterfall', 'crystal',
]
export function randomWordGenerator(params: { count: unknown }): string {
    const n = Math.min(Math.max(Number(params.count) || 5, 1), 20)
    const words: string[] = []
    for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * WORD_BANK.length)
        words.push(WORD_BANK[idx])
    }
    return words.join(', ')
}

// "Text Reverser" - reverses by character, word, or line. Not localized:
// the output is the transformed input text itself, not an explanation.
export function textReverser(params: { text: unknown; mode: unknown }): string {
    const text = String(params.text || '')
    const mode = String(params.mode)
    if (mode === 'words') {
        return text.split(/\s+/).filter(Boolean).reverse().join(' ')
    }
    if (mode === 'lines') {
        return text.split('\n').reverse().join('\n')
    }
    return text.split('').reverse().join('')
}
