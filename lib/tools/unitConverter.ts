// Generic length/area unit conversion, driven by "from"/"to" unit selects
// rather than a fixed formula pair - lets one widget serve any unit combination
// within its category (length or area) while still defaulting to a specific
// SEO-targeted pair per tool.

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi'
export type AreaUnit = 'mm2' | 'cm2' | 'm2' | 'km2' | 'in2' | 'ft2' | 'yd2' | 'acre' | 'hectare' | 'mi2'

// Conversion factors relative to 1 meter (length) / 1 square meter (area)
const LENGTH_FACTORS: Record<LengthUnit, number> = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
}

const AREA_FACTORS: Record<AreaUnit, number> = {
    mm2: 0.000001,
    cm2: 0.0001,
    m2: 1,
    km2: 1000000,
    in2: 0.00064516,
    ft2: 0.09290304,
    yd2: 0.83612736,
    acre: 4046.8564224,
    hectare: 10000,
    mi2: 2589988.110336,
}

function convert(value: unknown, fromUnit: unknown, toUnit: unknown, factors: Record<string, number>): number {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
    if (!isFinite(numValue)) return 0
    const fromFactor = factors[String(fromUnit)]
    const toFactor = factors[String(toUnit)]
    if (!fromFactor || !toFactor) return 0
    return (numValue * fromFactor) / toFactor
}

export function lengthConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    return convert(params.value, params.from_unit, params.to_unit, LENGTH_FACTORS)
}

export function areaConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    return convert(params.value, params.from_unit, params.to_unit, AREA_FACTORS)
}
