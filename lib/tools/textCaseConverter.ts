/**
 * Утилита для конвертации регистра текста
 * Поддерживает различные форматы регистра: lowercase, UPPERCASE, Title Case, Sentence case, Alternating case, Random case
 */

export type TextCaseMode = 
    | 'lower'           // все строчные
    | 'upper'           // все заглавные
    | 'title'           // каждое слово с заглавной
    | 'sentence'         // как в предложении
    | 'alternating'     // чередование регистров
    | 'random'           // случайный регистр

export interface TextCaseConverterOptions {
    mode: TextCaseMode
}

export interface TextCaseConverterResult {
    result: string
}

/**
 * Конвертирует текст в указанный регистр
 */
export function textCaseConverter(
    text: string | number,
    options: TextCaseConverterOptions
): TextCaseConverterResult {
    if (!text && text !== 0) {
        return { result: '' }
    }

    const inputText = String(text).trim()
    if (!inputText) {
        return { result: '' }
    }

    let result = ''

    switch (options.mode) {
        case 'lower':
            result = inputText.toLowerCase()
            break

        case 'upper':
            result = inputText.toUpperCase()
            break

        case 'title':
            // Каждое слово начинается с заглавной буквы (сохраняем переносы строк)
            result = inputText
                .split(/\r?\n/)
                .map(line => {
                    return line
                        .toLowerCase()
                        .split(/\s+/)
                        .map(word => {
                            if (!word) return word
                            return word.charAt(0).toUpperCase() + word.slice(1)
                        })
                        .join(' ')
                })
                .join('\n')
            break

        case 'sentence':
            // Первая буква каждого предложения заглавная, остальное строчное
            const lowerText = inputText.toLowerCase()
            // Разбиваем по знакам препинания, сохраняя их
            const sentences = lowerText.split(/([.!?]\s*)/)
            let capitalizeNext = true
            result = sentences
                .map(part => {
                    if (capitalizeNext && part.trim()) {
                        capitalizeNext = false
                        return part.charAt(0).toUpperCase() + part.slice(1)
                    }
                    if (/[.!?]\s*$/.test(part)) {
                        capitalizeNext = true
                    }
                    return part
                })
                .join('')
            // Если нет знаков препинания, просто делаем первую букву заглавной
            if (!/[.!?]/.test(inputText)) {
                result = lowerText.charAt(0).toUpperCase() + lowerText.slice(1)
            }
            break

        case 'alternating':
            // Чередование заглавных и строчных букв (начинаем с маленькой)
            result = inputText
                .split('')
                .map((char, index) => {
                    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(char)) {
                        return char // Пробелы, знаки препинания и т.д. остаются без изменений
                    }
                    return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
                })
                .join('')
            break

        case 'random':
            // Случайный регистр для каждой буквы
            result = inputText
                .split('')
                .map(char => {
                    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(char)) {
                        return char // Пробелы, знаки препинания и т.д. остаются без изменений
                    }
                    return Math.random() < 0.5 ? char.toLowerCase() : char.toUpperCase()
                })
                .join('')
            break

        default:
            result = inputText
    }

    return { result: result }
}
