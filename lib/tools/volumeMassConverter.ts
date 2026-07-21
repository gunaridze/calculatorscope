// Comprehensive volume/mass unit conversion, mirroring the pattern established
// in unitConverter.ts (length/area) but with much larger unit tables covering
// every unit requested for the Volume & Mass Converters category, including
// several historically ambiguous ones (hogshead, assay ton, slug, long/short
// tons and hundredweights, avoirdupois/troy/metric pound & ounce families).
// Factors verified against unitconverters.net / NIST / Wikipedia definitions.

export type VolumeUnit =
    | 'acre_foot' | 'barrel_imperial' | 'barrel_petroleum' | 'barrel_us_dry' | 'barrel_us_fluid'
    | 'bushel_imperial' | 'bushel_us_dry' | 'cord' | 'cubic_foot' | 'cubic_inch' | 'cubic_cm'
    | 'cubic_meter' | 'cubic_mile' | 'cubic_yard' | 'cup_breakfast' | 'cup_canadian' | 'cup_us'
    | 'fl_oz_imperial' | 'fl_oz_us' | 'gallon_imperial' | 'gallon_us_dry' | 'gallon_us_fluid'
    | 'gill_imperial' | 'gill_us' | 'hogshead_imperial' | 'hogshead_us' | 'liter' | 'deciliter'
    | 'milliliter' | 'microliter' | 'peck_imperial' | 'peck_us_dry' | 'pint_imperial'
    | 'pint_us_dry' | 'pint_us_fluid' | 'quart_imperial' | 'quart_us_dry' | 'quart_us_fluid'
    | 'tablespoon_canadian' | 'tablespoon_imperial' | 'tablespoon_us'
    | 'teaspoon_canadian' | 'teaspoon_imperial' | 'teaspoon_us'

export type MassUnit =
    | 'carat_metric' | 'point_metric' | 'centigram' | 'dram_avdp' | 'dram_troy' | 'grain_metric'
    | 'grain_troy' | 'gram' | 'hundredweight_long' | 'hundredweight_short' | 'kilogram'
    | 'megagram' | 'milligram' | 'microgram' | 'ounce_avdp' | 'ounce_troy' | 'pennyweight'
    | 'pound_avdp' | 'pound_metric' | 'pound_troy' | 'slug' | 'stone' | 'ton_assay_long'
    | 'ton_assay_short' | 'ton_long' | 'ton_short' | 'ton_metric' | 'tonne_us'

// Conversion factors relative to 1 liter
const VOLUME_FACTORS: Record<VolumeUnit, number> = {
    acre_foot: 1233481.8375,
    barrel_imperial: 163.65924,
    barrel_petroleum: 158.987294928,
    barrel_us_dry: 115.6271236039,
    barrel_us_fluid: 119.240471196,
    bushel_imperial: 36.36872,
    bushel_us_dry: 35.2390701686,
    cord: 3624.556363776,
    cubic_foot: 28.3168466,
    cubic_inch: 0.0163871,
    cubic_cm: 0.001,
    cubic_meter: 1000,
    cubic_mile: 4168181825440.58,
    cubic_yard: 764.554858,
    cup_breakfast: 0.284130625,
    cup_canadian: 0.2273045,
    cup_us: 0.2365882365,
    fl_oz_imperial: 0.0284130625,
    fl_oz_us: 0.0295735295625,
    gallon_imperial: 4.54609,
    gallon_us_dry: 4.40488377086,
    gallon_us_fluid: 3.785411784,
    gill_imperial: 0.1420653125,
    gill_us: 0.11829411825,
    hogshead_imperial: 245.48886,
    hogshead_us: 238.480942392,
    liter: 1,
    deciliter: 0.1,
    milliliter: 0.001,
    microliter: 0.000001,
    peck_imperial: 9.09218,
    peck_us_dry: 8.80976754215,
    pint_imperial: 0.56826125,
    pint_us_dry: 0.550610471358,
    pint_us_fluid: 0.473176473,
    quart_imperial: 1.1365225,
    quart_us_dry: 1.101220942715,
    quart_us_fluid: 0.946352946,
    tablespoon_canadian: 0.01420653125,
    tablespoon_imperial: 0.017758164,
    tablespoon_us: 0.01478676478125,
    teaspoon_canadian: 0.00473551041667,
    teaspoon_imperial: 0.005919388,
    teaspoon_us: 0.00492892159375,
}

// Conversion factors relative to 1 gram
const MASS_FACTORS: Record<MassUnit, number> = {
    carat_metric: 0.2,
    point_metric: 0.002,
    centigram: 0.01,
    dram_avdp: 1.7718451953125,
    dram_troy: 3.8879346,
    grain_metric: 0.05,
    grain_troy: 0.06479891,
    gram: 1,
    hundredweight_long: 50802.34544,
    hundredweight_short: 45359.237,
    kilogram: 1000,
    megagram: 1000000,
    milligram: 0.001,
    microgram: 0.000001,
    ounce_avdp: 28.349523125,
    ounce_troy: 31.1034768,
    pennyweight: 1.55517384,
    pound_avdp: 453.59237,
    pound_metric: 500,
    pound_troy: 373.2417216,
    slug: 14593.9029372,
    stone: 6350.29318,
    ton_assay_long: 32.6666667,
    ton_assay_short: 29.1666667,
    ton_long: 1016046.9088,
    ton_short: 907184.74,
    ton_metric: 1000000,
    tonne_us: 1000000,
}

function convert(value: unknown, fromUnit: unknown, toUnit: unknown, factors: Record<string, number>): number {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
    if (!isFinite(numValue)) return 0
    const fromFactor = factors[String(fromUnit)]
    const toFactor = factors[String(toUnit)]
    if (!fromFactor || !toFactor) return 0
    return (numValue * fromFactor) / toFactor
}

export function volumeConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    return convert(params.value, params.from_unit, params.to_unit, VOLUME_FACTORS)
}

export function massConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    return convert(params.value, params.from_unit, params.to_unit, MASS_FACTORS)
}
