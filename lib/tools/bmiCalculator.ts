/**
 * BMI Calculator (Body Mass Index Calculator)
 * tool_id = 1003
 */

export type BMIHeightUnit = 'cm' | 'm' | 'in' | 'ft' | 'ft_in' | 'm_cm'
export type BMIWeightUnit = 'kg' | 'lb' | 'st'
export type BMIGender = 'male' | 'female'
export type BMIStatus = 'underweight' | 'normal' | 'overweight' | 'obesity'

export interface BMICalculatorOptions {
    age: number
    gender: BMIGender
    height_unit: BMIHeightUnit
    height_value?: number
    height_ft?: number
    height_in?: number
    height_m?: number
    height_cm?: number
    weight_unit: BMIWeightUnit
    weight_value: number
}

export interface BMICalculatorResult {
    bmi: number
    bmi_status: BMIStatus
    healthy_bmi_min: number
    healthy_bmi_max: number
    healthy_weight_min: number
    healthy_weight_max: number
    weight_to_target: number
    bmi_prime: number
    ponderal_index: number
    height_meters: number
    weight_kg: number
}

/**
 * Нормализует рост в метры
 */
function normalizeHeight(options: BMICalculatorOptions): number {
    const { height_unit, height_value, height_ft, height_in, height_m, height_cm } = options

    switch (height_unit) {
        case 'cm':
            if (height_value === undefined) throw new Error('height_value is required for cm')
            return height_value / 100

        case 'm':
            if (height_value === undefined) throw new Error('height_value is required for m')
            return height_value

        case 'in':
            if (height_value === undefined) throw new Error('height_value is required for in')
            return height_value * 0.0254

        case 'ft':
            if (height_value === undefined) throw new Error('height_value is required for ft')
            return height_value * 0.3048

        case 'ft_in':
            if (height_ft === undefined || height_in === undefined) {
                throw new Error('height_ft and height_in are required for ft_in')
            }
            const totalInches = height_ft * 12 + height_in
            return totalInches * 0.0254

        case 'm_cm':
            if (height_m === undefined || height_cm === undefined) {
                throw new Error('height_m and height_cm are required for m_cm')
            }
            return height_m + height_cm / 100

        default:
            throw new Error(`Unknown height_unit: ${height_unit}`)
    }
}

/**
 * Нормализует вес в килограммы
 */
function normalizeWeight(weight_value: number, weight_unit: BMIWeightUnit): number {
    switch (weight_unit) {
        case 'kg':
            return weight_value
        case 'lb':
            return weight_value * 0.45359237
        case 'st':
            return weight_value * 6.35029318
        default:
            throw new Error(`Unknown weight_unit: ${weight_unit}`)
    }
}

/**
 * Конвертирует килограммы в выбранную единицу веса
 */
function convertWeightFromKg(kg: number, weight_unit: BMIWeightUnit): number {
    switch (weight_unit) {
        case 'kg':
            return kg
        case 'lb':
            return kg / 0.45359237
        case 'st':
            return kg / 6.35029318
        default:
            throw new Error(`Unknown weight_unit: ${weight_unit}`)
    }
}

/**
 * Определяет статус BMI
 */
function getBMIStatus(bmi: number): BMIStatus {
    if (bmi < 18.5) return 'underweight'
    if (bmi < 25) return 'normal'
    if (bmi < 30) return 'overweight'
    return 'obesity'
}

/**
 * Основная функция расчета BMI
 */
export function bmiCalculator(options: BMICalculatorOptions): BMICalculatorResult {
    // Валидация
    if (options.age < 2 || options.age > 120) {
        throw new Error('Age must be between 2 and 120')
    }

    // Нормализация роста и веса
    const height_meters = normalizeHeight(options)
    const weight_kg = normalizeWeight(options.weight_value, options.weight_unit)

    if (height_meters <= 0 || weight_kg <= 0) {
        throw new Error('Height and weight must be positive')
    }

    // Расчет BMI
    const bmi = weight_kg / (height_meters * height_meters)

    // Определение статуса
    const bmi_status = getBMIStatus(bmi)

    // Healthy BMI range (константы)
    const healthy_bmi_min = 18.5
    const healthy_bmi_max = 25

    // Healthy weight range (в кг)
    const healthy_weight_min_kg = healthy_bmi_min * height_meters * height_meters
    const healthy_weight_max_kg = healthy_bmi_max * height_meters * height_meters

    // Конвертация в выбранную единицу веса
    const healthy_weight_min = convertWeightFromKg(healthy_weight_min_kg, options.weight_unit)
    const healthy_weight_max = convertWeightFromKg(healthy_weight_max_kg, options.weight_unit)

    // Расчет weight_to_target
    let weight_to_target = 0
    if (bmi_status === 'underweight') {
        weight_to_target = healthy_weight_min - options.weight_value
    } else if (bmi_status === 'obesity' || bmi_status === 'overweight') {
        weight_to_target = options.weight_value - healthy_weight_max
    }

    // BMI Prime
    const bmi_prime = bmi / 25

    // Ponderal Index
    const ponderal_index = weight_kg / (height_meters * height_meters * height_meters)

    return {
        bmi: Math.round(bmi * 10) / 10, // 1 знак после запятой
        bmi_status,
        healthy_bmi_min,
        healthy_bmi_max,
        healthy_weight_min: Math.round(healthy_weight_min * 10) / 10, // 1 знак
        healthy_weight_max: Math.round(healthy_weight_max * 10) / 10, // 1 знак
        weight_to_target: Math.round(weight_to_target * 10) / 10, // 1 знак
        bmi_prime: Math.round(bmi_prime * 100) / 100, // 2 знака
        ponderal_index: Math.round(ponderal_index * 10) / 10, // 1 знак
        height_meters: Math.round(height_meters * 1000) / 1000, // 3 знака для точности
        weight_kg: Math.round(weight_kg * 100) / 100, // 2 знака для точности
    }
}
