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

    // Декодируем HTML entities для символов, которые могут быть экранированы
    // Это важно, если данные из БД содержат экранированные символы
    processed = processed
        .replace(/&#36;/g, '$')  // $ как HTML entity
        .replace(/&amp;#36;/g, '$')  // Двойное экранирование
        .replace(/&dollar;/g, '$')  // Именованная сущность (редко используется)

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
    // Используем простой regex и проверяем контекст вручную
    const inlineMatches: Array<{ match: string; formula: string; offset: number }> = []
    
    // Собираем все совпадения
    let match
    const regex = /\$([^$\n\r]+?)\$/g
    while ((match = regex.exec(processed)) !== null) {
        inlineMatches.push({
            match: match[0],
            formula: match[1],
            offset: match.index
        })
    }
    
    // Обрабатываем совпадения в обратном порядке (чтобы не сбить индексы)
    for (let i = inlineMatches.length - 1; i >= 0; i--) {
        const { match: fullMatch, formula, offset } = inlineMatches[i]
        const trimmed = formula.trim()
        
        if (!trimmed) continue // Пропускаем пустые формулы
        
        // Проверяем, не находимся ли мы внутри HTML тега
        const beforeMatch = processed.substring(0, offset)
        const lastTagOpen = beforeMatch.lastIndexOf('<')
        const lastTagClose = beforeMatch.lastIndexOf('>')
        
        // Если последний открывающий тег был после последнего закрывающего,
        // значит мы внутри тега - пропускаем
        if (lastTagOpen > lastTagClose) {
            continue
        }
        
        try {
            const rendered = katex.renderToString(trimmed, {
                displayMode: false,
                throwOnError: false,
            })
            // Заменяем совпадение на рендеренную формулу
            processed = processed.substring(0, offset) + rendered + processed.substring(offset + fullMatch.length)
        } catch (e) {
            console.error('KaTeX inline error:', e)
        }
    }

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

    return processed
}
