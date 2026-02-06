/**
 * Серверная обработка LaTeX формул через KaTeX
 * Используется для SSR рендеринга
 */

import katex from 'katex'

/**
 * Обрабатывает HTML с LaTeX формулами и рендерит их через KaTeX
 * Поддерживает:
 * - Inline формулы: $...$ или \(...\)
 * - Block формулы: $$...$$ или \[...\]
 */
export function processLatex(html: string): string {
    if (!html) return html

    let processed = html

    // ВАЖНО: Сначала обрабатываем block формулы, чтобы они не мешали inline
    
    // Обрабатываем block формулы $$...$$
    // Используем временный маркер для защиты от повторной обработки
    const blockMarker = '___KATEX_BLOCK_MARKER___'
    const blockFormulas: string[] = []
    
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        try {
            const rendered = katex.renderToString(formula.trim(), {
                displayMode: true,
                throwOnError: false,
            })
            blockFormulas.push(rendered)
            return `${blockMarker}${blockFormulas.length - 1}${blockMarker}`
        } catch (e) {
            console.error('KaTeX block error:', e)
            return match
        }
    })

    // Обрабатываем block формулы \[...\]
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        try {
            const rendered = katex.renderToString(formula.trim(), {
                displayMode: true,
                throwOnError: false,
            })
            blockFormulas.push(rendered)
            return `${blockMarker}${blockFormulas.length - 1}${blockMarker}`
        } catch (e) {
            console.error('KaTeX block error:', e)
            return match
        }
    })

    // Теперь обрабатываем inline формулы $...$ (уже без $$)
    processed = processed.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
        try {
            return katex.renderToString(formula.trim(), {
                displayMode: false,
                throwOnError: false,
            })
        } catch (e) {
            console.error('KaTeX inline error:', e)
            return match
        }
    })

    // Обрабатываем inline формулы \(...\)
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
        try {
            return katex.renderToString(formula.trim(), {
                displayMode: false,
                throwOnError: false,
            })
        } catch (e) {
            console.error('KaTeX inline error:', e)
            return match
        }
    })

    // Восстанавливаем block формулы
    blockFormulas.forEach((rendered, index) => {
        processed = processed.replace(`${blockMarker}${index}${blockMarker}`, rendered)
    })

    // Обрабатываем inline формулы \(...\)
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
        try {
            return katex.renderToString(formula.trim(), {
                displayMode: false,
                throwOnError: false,
            })
        } catch (e) {
            console.error('KaTeX inline error:', e)
            return match
        }
    })

    return processed
}
