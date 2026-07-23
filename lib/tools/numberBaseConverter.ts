// Number base / representation conversion helpers.

export type NumberBase = 'binary' | 'octal' | 'decimal' | 'hexadecimal'

const RADIX: Record<NumberBase, number> = { binary: 2, octal: 8, decimal: 10, hexadecimal: 16 }

const INVALID_INPUT = 'Invalid input'

// "Number Base Converter" - general converter between binary/octal/decimal/hex
export function numberBaseConverter(params: { value: unknown; from_base: unknown; to_base: unknown }): string {
    const raw = String(params.value ?? '').trim()
    const fromBase = String(params.from_base) as NumberBase
    const toBase = String(params.to_base) as NumberBase
    const n = parseInt(raw, RADIX[fromBase])
    if (isNaN(n)) return INVALID_INPUT
    return n.toString(RADIX[toBase]).toUpperCase()
}

// "Binary to Decimal Converter"
export function binaryToDecimal(params: { value: unknown }): string {
    const n = parseInt(String(params.value ?? '').trim(), 2)
    return isNaN(n) ? INVALID_INPUT : String(n)
}

// "Decimal to Binary Converter"
export function decimalToBinary(params: { value: unknown }): string {
    const n = parseInt(String(params.value ?? '').trim(), 10)
    return isNaN(n) ? INVALID_INPUT : n.toString(2)
}

// "Decimal to Hexadecimal Converter"
export function decimalToHexadecimal(params: { value: unknown }): string {
    const n = parseInt(String(params.value ?? '').trim(), 10)
    return isNaN(n) ? INVALID_INPUT : n.toString(16).toUpperCase()
}

// "Hexadecimal to Decimal Converter"
export function hexadecimalToDecimal(params: { value: unknown }): string {
    const n = parseInt(String(params.value ?? '').trim(), 16)
    return isNaN(n) ? INVALID_INPUT : String(n)
}

// "Text to Binary Converter" - ASCII text -> space-separated 8-bit codes
export function textToBinary(params: { value: unknown }): string {
    const text = String(params.value ?? '')
    if (!text) return ''
    return text
        .split('')
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ')
}

// "Binary to Text Converter" - space-separated 8-bit codes -> ASCII text
export function binaryToText(params: { value: unknown }): string {
    const raw = String(params.value ?? '').trim()
    if (!raw) return ''
    const groups = raw.split(/\s+/)
    if (groups.some((g) => !/^[01]{1,8}$/.test(g))) return INVALID_INPUT
    return groups.map((g) => String.fromCharCode(parseInt(g, 2))).join('')
}
