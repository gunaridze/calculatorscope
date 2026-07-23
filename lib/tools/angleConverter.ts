// Angle conversion helpers. Internally everything routes through degrees
// as the common base unit.

export type AngleUnit = 'degree' | 'radian' | 'gradian' | 'arcminute' | 'arcsecond' | 'turn'

const DEGREES_PER_UNIT: Record<AngleUnit, number> = {
    degree: 1,
    radian: 180 / Math.PI,
    gradian: 0.9,
    arcminute: 1 / 60,
    arcsecond: 1 / 3600,
    turn: 360,
}

function toDegrees(value: number, unit: AngleUnit): number {
    return value * DEGREES_PER_UNIT[unit]
}

function fromDegrees(degrees: number, unit: AngleUnit): number {
    return degrees / DEGREES_PER_UNIT[unit]
}

// "Angle Converter" - general multi-unit converter
export function angleConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    const value = Number(params.value) || 0
    const fromUnit = String(params.from_unit) as AngleUnit
    const toUnit = String(params.to_unit) as AngleUnit
    return fromDegrees(toDegrees(value, fromUnit), toUnit)
}

// "Degrees to Radians Calculator"
export function degreesToRadians(params: { value: unknown }): number {
    return (Number(params.value) || 0) * (Math.PI / 180)
}

// "Radians to Degrees Calculator"
export function radiansToDegrees(params: { value: unknown }): number {
    return (Number(params.value) || 0) * (180 / Math.PI)
}

// "Degrees Minutes Seconds to Decimal Degrees Converter"
export function dmsToDecimalDegrees(params: { degrees: unknown; minutes: unknown; seconds: unknown }): number {
    const degrees = Number(params.degrees) || 0
    const minutes = Number(params.minutes) || 0
    const seconds = Number(params.seconds) || 0
    const sign = degrees < 0 ? -1 : 1
    return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600)
}

function toTotalArcseconds(degrees: number, minutes: number, seconds: number): number {
    const sign = degrees < 0 ? -1 : 1
    return sign * (Math.abs(degrees) * 3600 + minutes * 60 + seconds)
}

function fromTotalArcseconds(totalArcseconds: number): { degrees: number; minutes: number; seconds: number } {
    const sign = totalArcseconds < 0 ? -1 : 1
    const abs = Math.round(Math.abs(totalArcseconds))
    const degrees = Math.floor(abs / 3600)
    const minutes = Math.floor((abs % 3600) / 60)
    const seconds = abs % 60
    return { degrees: sign * degrees, minutes, seconds }
}

// "Angle Addition and Subtraction Calculator" - two angles in D/M/S, added
// or subtracted; result is the raw D/M/S sum (not normalized to 0-360).
export function angleAddSubtract(params: {
    deg1: unknown; min1: unknown; sec1: unknown
    operation: unknown
    deg2: unknown; min2: unknown; sec2: unknown
}): { degrees: number; minutes: number; seconds: number; decimal_degrees: number } {
    const total1 = toTotalArcseconds(Number(params.deg1) || 0, Number(params.min1) || 0, Number(params.sec1) || 0)
    const total2 = toTotalArcseconds(Number(params.deg2) || 0, Number(params.min2) || 0, Number(params.sec2) || 0)
    const sign = String(params.operation) === 'subtract' ? -1 : 1
    const totalResult = total1 + sign * total2
    const { degrees, minutes, seconds } = fromTotalArcseconds(totalResult)
    return { degrees, minutes, seconds, decimal_degrees: totalResult / 3600 }
}

// "Reference and Coterminal Angle Calculator"
export function referenceCoterminalAngle(params: { angle: unknown }): {
    coterminal_angle: number
    reference_angle: number
    quadrant: number
} {
    const angle = Number(params.angle) || 0
    const coterminal = ((angle % 360) + 360) % 360
    let reference: number
    let quadrant: number
    if (coterminal <= 90) { reference = coterminal; quadrant = 1 }
    else if (coterminal <= 180) { reference = 180 - coterminal; quadrant = 2 }
    else if (coterminal <= 270) { reference = coterminal - 180; quadrant = 3 }
    else { reference = 360 - coterminal; quadrant = 4 }
    return { coterminal_angle: coterminal, reference_angle: reference, quadrant }
}
