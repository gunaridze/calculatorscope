// Percent & ratio helpers: percentage math, everyday percent tools
// (tips, tax, discounts), and ratio/proportion tools.
import { t } from './i18n'

// "Percentage Calculator" - what is X% of Y?
export function percentageCalculator(params: { percent: unknown; base_number: unknown }): number {
    const percent = Number(params.percent) || 0
    const baseNumber = Number(params.base_number) || 0
    return (percent / 100) * baseNumber
}

// "Percent Change Calculator" - percent change from an old to a new value.
// `direction` is a localized word ("increase"/"decrease"/"no change"), not
// a raw output number, so it goes through the same t() helper as every
// other natural-language result string in this codebase.
const DIRECTION_INCREASE: Record<string, string> = {
    en: 'increase', ru: 'увеличение', de: 'Anstieg', es: 'aumento', fr: 'augmentation', it: 'aumento', pl: 'wzrost', lv: 'pieaugums',
}
const DIRECTION_DECREASE: Record<string, string> = {
    en: 'decrease', ru: 'уменьшение', de: 'Rückgang', es: 'disminución', fr: 'diminution', it: 'diminuzione', pl: 'spadek', lv: 'samazinājums',
}
const DIRECTION_NO_CHANGE: Record<string, string> = {
    en: 'no change', ru: 'без изменений', de: 'keine Änderung', es: 'sin cambio', fr: 'aucun changement', it: 'nessun cambiamento', pl: 'bez zmian', lv: 'bez izmaiņām',
}
export function percentChangeCalculator(params: { old_value: unknown; new_value: unknown; language: unknown }): {
    change_amount: number; percent_change: number; direction: string
} {
    const oldValue = Number(params.old_value) || 0
    const newValue = Number(params.new_value) || 0
    const changeAmount = newValue - oldValue
    const percentChange = oldValue !== 0 ? (changeAmount / Math.abs(oldValue)) * 100 : 0
    const direction = changeAmount > 0 ? DIRECTION_INCREASE : changeAmount < 0 ? DIRECTION_DECREASE : DIRECTION_NO_CHANGE
    return { change_amount: changeAmount, percent_change: Math.abs(percentChange), direction: t(direction, params.language) }
}

// "Percent Increase Calculator" - increase a value by a given percent
export function percentIncreaseCalculator(params: { original_value: unknown; percent: unknown }): {
    increase_amount: number; new_value: number
} {
    const originalValue = Number(params.original_value) || 0
    const percent = Number(params.percent) || 0
    const increaseAmount = originalValue * (percent / 100)
    return { increase_amount: increaseAmount, new_value: originalValue + increaseAmount }
}

// "Percent Decrease Calculator" - decrease a value by a given percent
export function percentDecreaseCalculator(params: { original_value: unknown; percent: unknown }): {
    decrease_amount: number; new_value: number
} {
    const originalValue = Number(params.original_value) || 0
    const percent = Number(params.percent) || 0
    const decreaseAmount = originalValue * (percent / 100)
    return { decrease_amount: decreaseAmount, new_value: originalValue - decreaseAmount }
}

// "Reverse Percentage Calculator" - X is Y% of what number?
export function reversePercentageCalculator(params: { part_value: unknown; percent: unknown }): number {
    const partValue = Number(params.part_value) || 0
    const percent = Number(params.percent) || 0
    return percent !== 0 ? partValue / (percent / 100) : 0
}

// "Tip Calculator"
export function tipCalculator(params: { bill_amount: unknown; tip_percent: unknown; num_people: unknown }): {
    tip_amount: number; total_amount: number; per_person_amount: number; tip_per_person: number
} {
    const billAmount = Number(params.bill_amount) || 0
    const tipPercent = Number(params.tip_percent) || 0
    const numPeople = Math.max(Number(params.num_people) || 1, 1)
    const tipAmount = billAmount * (tipPercent / 100)
    const totalAmount = billAmount + tipAmount
    return {
        tip_amount: tipAmount,
        total_amount: totalAmount,
        per_person_amount: totalAmount / numPeople,
        tip_per_person: tipAmount / numPeople,
    }
}

// "Sales Tax Calculator"
export function salesTaxCalculator(params: { price: unknown; tax_rate: unknown }): { tax_amount: number; total_price: number } {
    const price = Number(params.price) || 0
    const taxRate = Number(params.tax_rate) || 0
    const taxAmount = price * (taxRate / 100)
    return { tax_amount: taxAmount, total_price: price + taxAmount }
}

// "Discount Calculator"
export function discountCalculator(params: { original_price: unknown; discount_percent: unknown }): {
    savings_amount: number; final_price: number
} {
    const originalPrice = Number(params.original_price) || 0
    const discountPercent = Number(params.discount_percent) || 0
    const savingsAmount = originalPrice * (discountPercent / 100)
    return { savings_amount: savingsAmount, final_price: originalPrice - savingsAmount }
}

// Greatest common divisor, used by both the ratio simplifier and the
// aspect ratio calculator's simplified-ratio output
function gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) {
        ;[a, b] = [b, a % b]
    }
    return a || 1
}

// "Ratio Simplifier" - reduces a:b to its simplest whole-number form
export function ratioSimplifier(params: { ratio_a: unknown; ratio_b: unknown }): {
    simplified_a: number; simplified_b: number; simplified_ratio: string
} {
    const ratioA = Number(params.ratio_a) || 0
    const ratioB = Number(params.ratio_b) || 0
    const g = gcd(ratioA, ratioB)
    const simplifiedA = ratioA / g
    const simplifiedB = ratioB / g
    return { simplified_a: simplifiedA, simplified_b: simplifiedB, simplified_ratio: `${simplifiedA}:${simplifiedB}` }
}

// "Proportion Calculator" - solves a/b = c/d for whichever of the four
// terms is selected via `solve_for` (a static-form-friendly stand-in for
// "leave one field blank", since this engine has no dynamic field hiding)
export function proportionCalculator(params: { a: unknown; b: unknown; c: unknown; d: unknown; solve_for: unknown }): number {
    const a = Number(params.a) || 0
    const b = Number(params.b) || 0
    const c = Number(params.c) || 0
    const d = Number(params.d) || 0
    const solveFor = String(params.solve_for)
    if (solveFor === 'a') return b !== 0 ? (b * c) / d : 0
    if (solveFor === 'b') return c !== 0 ? (a * d) / c : 0
    if (solveFor === 'c') return b !== 0 ? (a * d) / b : 0
    return a !== 0 ? (b * c) / a : 0 // solve_for === 'd'
}

// "Aspect Ratio Calculator" - always returns the simplified ratio (e.g.
// 1920x1080 -> "16:9"), and additionally computes a proportional target
// width or height when `solve_for` requests one (e.g. resizing an image to
// a new width while keeping its aspect ratio, solving for the new height).
export function aspectRatioCalculator(params: {
    width: unknown; height: unknown; target_value: unknown; solve_for: unknown
}): { simplified_ratio: string; computed_dimension?: number } {
    const width = Number(params.width) || 0
    const height = Number(params.height) || 0
    const targetValue = Number(params.target_value) || 0
    const g = gcd(width, height)
    const simplifiedRatio = `${width / g}:${height / g}`
    const solveFor = String(params.solve_for)
    if (solveFor === 'find_height' && width !== 0) {
        return { simplified_ratio: simplifiedRatio, computed_dimension: targetValue * (height / width) }
    }
    if (solveFor === 'find_width' && height !== 0) {
        return { simplified_ratio: simplifiedRatio, computed_dimension: targetValue * (width / height) }
    }
    return { simplified_ratio: simplifiedRatio }
}

// "Ratio to Percentage Converter" - e.g. a 1:4 ratio is 20% : 80%
export function ratioToPercentageConverter(params: { ratio_a: unknown; ratio_b: unknown }): {
    percentage_a: number; percentage_b: number
} {
    const ratioA = Number(params.ratio_a) || 0
    const ratioB = Number(params.ratio_b) || 0
    const total = ratioA + ratioB
    return {
        percentage_a: total !== 0 ? (ratioA / total) * 100 : 0,
        percentage_b: total !== 0 ? (ratioB / total) * 100 : 0,
    }
}
