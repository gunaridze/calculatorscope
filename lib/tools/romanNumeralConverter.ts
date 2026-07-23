// General number <-> Roman numeral conversion (standard subtractive notation,
// valid range 1-3999). Distinct from romanNumeralDate in dateCalc.ts, which
// formats a calendar date's month/day/year as separate Roman numeral groups.

const VALUES = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
const SYMBOLS = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
const ROMAN_VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }

// "Number to Roman Numeral Converter"
export function numberToRoman(params: { value: unknown }): string {
    const num = Math.round(Number(params.value) || 0)
    if (num < 1 || num > 3999) return 'Out of range (1-3999)'
    let result = ''
    let remaining = num
    for (let i = 0; i < VALUES.length; i++) {
        while (remaining >= VALUES[i]) {
            result += SYMBOLS[i]
            remaining -= VALUES[i]
        }
    }
    return result
}

// "Roman Numeral to Number Converter"
export function romanToNumber(params: { value: unknown }): string {
    const str = String(params.value ?? '').trim().toUpperCase()
    if (!str || !/^[IVXLCDM]+$/.test(str)) return 'Invalid Roman numeral'
    let total = 0
    for (let i = 0; i < str.length; i++) {
        const current = ROMAN_VALUE[str[i]]
        const next = ROMAN_VALUE[str[i + 1]]
        if (next && current < next) total -= current
        else total += current
    }
    return String(total)
}
