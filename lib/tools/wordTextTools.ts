// Word & text analysis / word-game helpers for the Word & Text Tools category.

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
export function randomNamePicker(params: { names: unknown; count: unknown }): string {
    const list = String(params.names || '').split('\n').map((n) => n.trim()).filter(Boolean)
    if (list.length === 0) return 'Please enter at least one name (one per line).'
    const pickCount = Math.min(Math.max(Number(params.count) || 1, 1), list.length)
    const indices = list.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices.slice(0, pickCount).map((i) => list[i]).join(', ')
}

// "Keyword Density Analyzer" - top 10 non-stopword keywords by frequency/density
const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'that', 'this', 'these',
    'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'his', 'her', 'their',
    'our', 'your', 'my', 'me', 'us', 'not', 'no', 'do', 'does', 'did', 'have', 'has', 'had',
    'will', 'would', 'can', 'could', 'should', 'shall', 'may', 'might', 'must', 'if', 'than',
    'then', 'so', 'such', 'there', 'here', 'which', 'who', 'whom', 'what', 'when', 'where', 'why', 'how',
])
export function keywordDensityAnalyzer(params: { text: unknown }): string {
    const text = String(params.text || '').toLowerCase()
    const allWords = text.match(/[a-z']+/g) || []
    const filtered = allWords.filter((w) => !STOPWORDS.has(w) && w.length > 1)
    const total = filtered.length
    if (total === 0) return 'No significant keywords found.'
    const counts: Record<string, number> = {}
    filtered.forEach((w) => {
        counts[w] = (counts[w] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const lines = sorted.map(([word, count]) => `${word}: ${count} (${((count / total) * 100).toFixed(1)}%)`)
    return `Total analyzed words: ${total}\n\nTop keywords:\n${lines.join('\n')}`
}

// "Common Misspellings Checker" - curated list of frequently cited English
// misspellings (not exhaustive, not a full dictionary/grammar check)
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
export function commonMisspellingsChecker(params: { text: unknown }): string {
    const text = String(params.text || '')
    const words = text.match(/[A-Za-z']+/g) || []
    const found: string[] = []
    const seen = new Set<string>()
    words.forEach((w) => {
        const lower = w.toLowerCase()
        if (MISSPELLINGS[lower] && !seen.has(lower)) {
            seen.add(lower)
            found.push(`"${w}" → did you mean "${MISSPELLINGS[lower]}"?`)
        }
    })
    if (found.length === 0) return 'No common misspellings found.'
    return `Found ${found.length} possible misspelling(s):\n\n${found.join('\n')}`
}

// "Anagram Checker"
function normalizeForAnagram(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join('')
}
export function anagramChecker(params: { text_a: unknown; text_b: unknown }): string {
    const a = String(params.text_a || '')
    const b = String(params.text_b || '')
    const normA = normalizeForAnagram(a)
    const normB = normalizeForAnagram(b)
    const isAnagram = normA.length > 0 && normA === normB
    return isAnagram
        ? `Yes! "${a}" and "${b}" are anagrams of each other.`
        : `No, "${a}" and "${b}" are not anagrams of each other.`
}

// "Palindrome Checker"
export function palindromeChecker(params: { text: unknown }): string {
    const text = String(params.text || '')
    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '')
    const reversed = cleaned.split('').reverse().join('')
    const isPalindrome = cleaned.length > 0 && cleaned === reversed
    return isPalindrome ? `Yes! "${text}" is a palindrome.` : `No, "${text}" is not a palindrome.`
}

// "Pig Latin Translator" - standard rule: vowel-initial words get "way"
// appended; consonant-initial words move the leading consonant cluster to
// the end and append "ay". Preserves capitalization and trailing punctuation.
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

// "Acronym Generator" - first letter of every word, uppercased
export function acronymGenerator(params: { text: unknown }): string {
    const text = String(params.text || '')
    const words = text.match(/[A-Za-z0-9]+/g) || []
    if (words.length === 0) return ''
    return words.map((w) => w[0].toUpperCase()).join('')
}

// "Random Word Generator" - picks from a curated common-word bank
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

// "Text Reverser" - reverses by character, word, or line
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
