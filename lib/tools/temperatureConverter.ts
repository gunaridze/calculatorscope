// Temperature conversion helpers. Internally everything routes through
// Celsius as the common base unit.

export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin' | 'rankine'

function toCelsius(value: number, unit: TemperatureUnit): number {
    switch (unit) {
        case 'celsius': return value
        case 'fahrenheit': return (value - 32) * 5 / 9
        case 'kelvin': return value - 273.15
        case 'rankine': return (value - 491.67) * 5 / 9
    }
}

function fromCelsius(celsius: number, unit: TemperatureUnit): number {
    switch (unit) {
        case 'celsius': return celsius
        case 'fahrenheit': return celsius * 9 / 5 + 32
        case 'kelvin': return celsius + 273.15
        case 'rankine': return (celsius + 273.15) * 9 / 5
    }
}

// "Temperature Converter" - general multi-unit converter
export function temperatureConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    const value = Number(params.value) || 0
    const fromUnit = String(params.from_unit) as TemperatureUnit
    const toUnit = String(params.to_unit) as TemperatureUnit
    return fromCelsius(toCelsius(value, fromUnit), toUnit)
}

// "Celsius to Fahrenheit Calculator"
export function celsiusToFahrenheit(params: { value: unknown }): number {
    return (Number(params.value) || 0) * 9 / 5 + 32
}

// "Fahrenheit to Celsius Calculator"
export function fahrenheitToCelsius(params: { value: unknown }): number {
    return ((Number(params.value) || 0) - 32) * 5 / 9
}

// "Celsius to Kelvin Calculator"
export function celsiusToKelvin(params: { value: unknown }): number {
    return (Number(params.value) || 0) + 273.15
}

// "Fahrenheit to Kelvin Calculator"
export function fahrenheitToKelvin(params: { value: unknown }): number {
    const c = ((Number(params.value) || 0) - 32) * 5 / 9
    return c + 273.15
}

// "Temperature Difference Calculator" - the size of a temperature interval
// depends on the scale (1 Fahrenheit degree = 5/9 of a Celsius/Kelvin degree),
// so this converts the *difference* (not an absolute reading) between scales.
export function temperatureDifference(params: { temp1: unknown; temp2: unknown; unit: unknown }): {
    diff_celsius: number
    diff_fahrenheit: number
    diff_kelvin: number
} {
    const temp1 = Number(params.temp1) || 0
    const temp2 = Number(params.temp2) || 0
    const unit = String(params.unit)
    const deltaCelsius = unit === 'fahrenheit' ? (temp2 - temp1) * 5 / 9 : temp2 - temp1
    return {
        diff_celsius: deltaCelsius,
        diff_fahrenheit: deltaCelsius * 9 / 5,
        diff_kelvin: deltaCelsius,
    }
}
