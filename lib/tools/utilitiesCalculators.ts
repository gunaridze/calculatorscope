// SEO / text-analysis / everyday-task utility helpers for the Utilities category.

// "SERP Title & Meta Description Checker" - character-count based validation
// against commonly cited Google SERP display guidance (title ~50-60 chars,
// meta description ~120-158 chars). This uses character counts rather than
// rendered pixel width, a deliberate simplification since pixel width
// depends on font/browser rendering and would need a per-character width
// table to approximate accurately.
export function serpSnippetChecker(params: { title: unknown; meta_description: unknown }): {
    title_length: number; title_status: string; meta_length: number; meta_status: string
} {
    const title = String(params.title || '')
    const metaDescription = String(params.meta_description || '')
    const titleLength = title.length
    const metaLength = metaDescription.length
    const titleStatus = titleLength === 0 ? 'Empty' : titleLength < 30 ? 'Too Short' : titleLength <= 60 ? 'Good' : 'Too Long'
    const metaStatus = metaLength === 0 ? 'Empty' : metaLength < 70 ? 'Too Short' : metaLength <= 158 ? 'Good' : 'Too Long'
    return { title_length: titleLength, title_status: titleStatus, meta_length: metaLength, meta_status: metaStatus }
}

// "URL Cleaner" - strips common analytics/ad tracking query parameters
const TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'msclkid', 'mc_cid', 'mc_eid', 'igshid', 'yclid', 'dclid', 'twclid', 'ref',
]
export function removeTrackingParams(params: { url: unknown }): { cleaned_url: string; removed_count: number } {
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
        return { cleaned_url: 'Invalid URL', removed_count: 0 }
    }
}

// "UTM Campaign URL Builder"
export function utmUrlBuilder(params: {
    base_url: unknown; source: unknown; medium: unknown; campaign: unknown; term: unknown; content: unknown
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
        return 'Invalid base URL'
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

// "Text Readability Score Calculator" - Flesch Reading Ease score
export function readabilityScoreCalculator(params: { text: unknown }): {
    word_count: number; sentence_count: number; flesch_reading_ease: number; reading_level: string
} {
    const text = String(params.text || '').trim()
    if (!text) return { word_count: 0, sentence_count: 0, flesch_reading_ease: 0, reading_level: 'N/A' }
    const words = text.split(/\s+/).filter(Boolean)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const wordCount = words.length
    const sentenceCount = Math.max(sentences.length, 1)
    const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0)
    const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / Math.max(wordCount, 1))
    let readingLevel: string
    if (score >= 90) readingLevel = 'Very Easy'
    else if (score >= 80) readingLevel = 'Easy'
    else if (score >= 70) readingLevel = 'Fairly Easy'
    else if (score >= 60) readingLevel = 'Standard'
    else if (score >= 50) readingLevel = 'Fairly Difficult'
    else if (score >= 30) readingLevel = 'Difficult'
    else readingLevel = 'Very Confusing'
    return { word_count: wordCount, sentence_count: sentenceCount, flesch_reading_ease: score, reading_level: readingLevel }
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
export function tournamentBracketGenerator(params: { team_names: unknown }): string {
    const raw = String(params.team_names || '')
    let teams = raw.split('\n').map((s) => s.trim()).filter(Boolean)
    if (teams.length < 2) return 'Please enter at least 2 team names (one per line).'
    if (teams.length > 64) teams = teams.slice(0, 64)

    let bracketSize = 2
    while (bracketSize < teams.length) bracketSize *= 2

    const order = seedOrder(bracketSize)
    const slots = order.map((seed) => (seed <= teams.length ? teams[seed - 1] : 'BYE'))

    const lines: string[] = []
    let round = 1
    let currentLabels = slots
    while (currentLabels.length > 1) {
        const matchCount = currentLabels.length / 2
        const roundName =
            matchCount === 1 ? 'Final' : matchCount === 2 ? 'Semifinals' : matchCount === 4 ? 'Quarterfinals' : `Round ${round}`
        lines.push(`${roundName}:`)
        const nextLabels: string[] = []
        for (let i = 0; i < currentLabels.length; i += 2) {
            const a = currentLabels[i]
            const b = currentLabels[i + 1]
            const matchNum = i / 2 + 1
            if (round === 1) {
                if (b === 'BYE') lines.push(`  Match ${matchNum}: ${a} advances (bye)`)
                else if (a === 'BYE') lines.push(`  Match ${matchNum}: ${b} advances (bye)`)
                else lines.push(`  Match ${matchNum}: ${a} vs ${b}`)
            } else {
                lines.push(`  Match ${matchNum}: Winner of Round ${round - 1} Match ${i + 1} vs Winner of Round ${round - 1} Match ${i + 2}`)
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
export function platformLimitValidator(params: { text: unknown; platform: unknown }): {
    char_count: number; limit: number; remaining: number; status: string
} {
    const text = String(params.text || '')
    const limit = PLATFORM_LIMITS[String(params.platform)] || PLATFORM_LIMITS.x_twitter
    const charCount = text.length
    const remaining = limit - charCount
    const status = charCount <= limit ? 'Within Limit' : 'Over Limit'
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
export function duplicateLineRemover(params: { text: unknown }): string {
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
    return `Original lines: ${originalCount}\nUnique lines: ${uniqueCount}\nDuplicates removed: ${removedCount}\n\n--- Cleaned Text ---\n${unique.join('\n')}`
}

// "Text Diff Checker" - a simple line-set comparison (which lines are only
// in A, only in B, or in both), not a positional sequence diff like git
// diff or the Myers algorithm - documented as a deliberate simplification
// suited to quick "what changed" checks on short text blocks.
export function textDiffChecker(params: { text_a: unknown; text_b: unknown }): string {
    const linesA = String(params.text_a || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const linesB = String(params.text_b || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const setA = new Set(linesA)
    const setB = new Set(linesB)
    const removed = linesA.filter((l) => !setB.has(l))
    const added = linesB.filter((l) => !setA.has(l))
    const unchanged = linesA.filter((l) => setB.has(l))
    let result = `Only in Text A (removed): ${removed.length}\n`
    result += removed.map((l) => `  - ${l}`).join('\n')
    result += `\n\nOnly in Text B (added): ${added.length}\n`
    result += added.map((l) => `  + ${l}`).join('\n')
    result += `\n\nUnchanged lines: ${unchanged.length}`
    return result
}

// "Meta Tag / Open Graph Generator" - templated HTML meta tag block
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

// "Robots.txt Generator"
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
// for a given paragraph count.
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
