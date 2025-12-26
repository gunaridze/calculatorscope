import * as math from 'mathjs'

export interface JsonEngineInput {
    [key: string]: number | string
}

export interface JsonEngineOutput {
    [key: string]: number | string
}

export interface JsonEngineConfig {
    inputs: Array<{
        key: string
        default?: number
    }>
    formulas: Record<string, string>
    outputs: Array<{
        key: string
        precision?: number
    }>
}

/**
 * Единый движок для JSON калькуляторов
 * Используется на сервере и клиенте для консистентности
 */
export function calculate(
    config: JsonEngineConfig,
    inputValues: JsonEngineInput
): JsonEngineOutput {
    // 1. Подготавливаем переменные (превращаем строки в числа)
    const scope: Record<string, number> = {}
    config.inputs.forEach((inp) => {
        const val = typeof inputValues[inp.key] === 'number'
            ? inputValues[inp.key] as number
            : parseFloat(String(inputValues[inp.key])) || inp.default || 0
        scope[inp.key] = val
    })

    // 2. Считаем формулы через mathjs
    const results: JsonEngineOutput = {}

    Object.entries(config.formulas).forEach(([outKey, formula]) => {
        try {
            const rawResult = math.evaluate(formula as string, scope)
            // Проверяем, что результат валидный
            if (typeof rawResult === 'number' && !isNaN(rawResult) && isFinite(rawResult)) {
                results[outKey] = rawResult
            } else {
                console.error(`Invalid result for ${outKey}:`, rawResult)
                results[outKey] = 0
            }
        } catch (e) {
            console.error(`Ошибка вычисления формулы ${outKey}:`, e)
            results[outKey] = 0
        }
    })

    return results
}

/**
 * Валидация входных данных
 */
export function validate(
    config: JsonEngineConfig,
    inputValues: JsonEngineInput
): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Проверяем наличие всех обязательных inputs
    config.inputs.forEach((inp) => {
        const value = inputValues[inp.key]
        if (value === undefined || value === null || value === '') {
            if (inp.default === undefined) {
                errors.push(`Missing required input: ${inp.key}`)
            }
        } else {
            const numValue = typeof value === 'number' ? value : parseFloat(String(value))
            if (isNaN(numValue)) {
                errors.push(`Invalid number for input: ${inp.key}`)
            }
        }
    })

    return {
        valid: errors.length === 0,
        errors
    }
}
