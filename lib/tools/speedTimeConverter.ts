// Factor-based speed and time-duration unit converters, mirroring the
// pattern in unitConverter.ts / volumeMassConverter.ts.

export type SpeedUnit = 'mps' | 'kmh' | 'mph' | 'knot' | 'fps' | 'mach'
export type TimeUnit = 'ms' | 's' | 'min' | 'hour' | 'day' | 'week' | 'month' | 'year'

// Conversion factors relative to 1 meter/second
const SPEED_FACTORS: Record<SpeedUnit, number> = {
    mps: 1,
    kmh: 1000 / 3600,
    mph: 1609.344 / 3600,
    knot: 1852 / 3600,
    fps: 0.3048,
    mach: 340.3, // speed of sound, ISA standard atmosphere, sea level, 15°C
}

// Conversion factors relative to 1 second
const TIME_FACTORS: Record<TimeUnit, number> = {
    ms: 0.001,
    s: 1,
    min: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 86400 * 30.436875, // average Gregorian month (365.2425/12 days)
    year: 86400 * 365.2425, // average Gregorian year
}

function convert(value: unknown, fromUnit: unknown, toUnit: unknown, factors: Record<string, number>): number {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
    if (!isFinite(numValue)) return 0
    const fromFactor = factors[String(fromUnit)]
    const toFactor = factors[String(toUnit)]
    if (!fromFactor || !toFactor) return 0
    return (numValue * fromFactor) / toFactor
}

export function speedConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    return convert(params.value, params.from_unit, params.to_unit, SPEED_FACTORS)
}

export function timeUnitConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    return convert(params.value, params.from_unit, params.to_unit, TIME_FACTORS)
}
