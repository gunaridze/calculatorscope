import * as math from 'mathjs'
import { numberToWords, type NumberToWordsOptions } from '@/lib/tools/numberToWords'
import { textCaseConverter, type TextCaseConverterOptions } from '@/lib/tools/textCaseConverter'
import { bmiCalculator, type BMICalculatorOptions } from '@/lib/tools/bmiCalculator'
import { lengthConverter, areaConverter } from '@/lib/tools/unitConverter'
import { volumeConverter, massConverter } from '@/lib/tools/volumeMassConverter'
import { speedConverter, timeUnitConverter } from '@/lib/tools/speedTimeConverter'
import { speedDistanceTime } from '@/lib/tools/speedDistanceTime'
import {
    hmsAddSubtract,
    timeArithmetic,
    hoursMinutesAddSubtract,
    decimalToTime,
    timeToDecimal,
    to24HourTime,
    to12HourTime,
    hoursBetweenClockTimes,
} from '@/lib/tools/timeDurationCalc'
import {
    dateAddSubtract,
    dateDifference,
    daysAndBusinessDays,
    datetimeDifference,
    ageCalculator,
    ageChecker,
    romanNumeralDate,
} from '@/lib/tools/dateCalc'
import { workHours, clockInOutTotal, shiftCoverage } from '@/lib/tools/workShiftCalc'
import { focusSessionPlanner, contextSwitchingCost, meetingTimezoneOverlap } from '@/lib/tools/productivityCalc'
import { sunriseSunset } from '@/lib/tools/sunriseSunset'
import {
    temperatureConverter,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    celsiusToKelvin,
    fahrenheitToKelvin,
    temperatureDifference,
} from '@/lib/tools/temperatureConverter'
import {
    angleConverter,
    degreesToRadians,
    radiansToDegrees,
    dmsToDecimalDegrees,
    angleAddSubtract,
    referenceCoterminalAngle,
} from '@/lib/tools/angleConverter'
import { dataStorageConverter, downloadTimeCalculator } from '@/lib/tools/dataStorageConverter'
import {
    numberBaseConverter,
    binaryToDecimal,
    decimalToBinary,
    decimalToHexadecimal,
    hexadecimalToDecimal,
    textToBinary,
    binaryToText,
} from '@/lib/tools/numberBaseConverter'
import { numberToRoman, romanToNumber } from '@/lib/tools/romanNumeralConverter'
import {
    roasCalculator,
    cpaCalculator,
    cpmCalculator,
    ctrCalculator,
    conversionRateCalculator,
    funnelConversionCalculator,
    multiTouchAttributionCalculator,
    ltvCacRatioCalculator,
    churnRateCalculator,
    loyaltyProgramRoiCalculator,
    organicTrafficValueCalculator,
    emailMarketingRoiCalculator,
} from '@/lib/tools/marketingCalculators'
import {
    concreteCalculator,
    concreteBagsCalculator,
    cubicYardsCalculator,
    squareFootageCalculator,
    gravelCalculator,
    mulchCalculator,
    tankCapacityCalculator,
    roadwayFillCalculator,
    sandCalculator,
    topsoilCalculator,
    paverCalculator,
    retainingWallBlockCalculator,
} from '@/lib/tools/constructionCalculators'

export interface JsonEngineInput {
    [key: string]: number | string
}

export interface JsonEngineOutput {
    [key: string]: number | string
}

export interface JsonEngineConfig {
    inputs: Array<{
        key: string
        default?: number | string
    }>
    formulas?: Record<string, string>
    functions?: Record<string, {
        type: 'function'
        functionName: string
        params: Record<string, string>  // Маппинг: имя параметра функции -> ключ input
    }>
    outputs: Array<{
        key: string
        precision?: number
    }>
    language?: string  // Язык для локализации (en, ru, de, es, fr, it, pl, lv)
}

/**
 * Реестр кастомных функций
 */
const FUNCTION_REGISTRY: Record<string, (params: Record<string, any>) => any> = {
    numberToWords: (params: Record<string, any>) => {
        const { value, mode, currency, vatRate, textCase, language } = params
        const options: NumberToWordsOptions = {
            mode: mode || 'words',
            currency: currency || 'USD',
            vatRate: vatRate ? parseFloat(String(vatRate)) : undefined,
            textCase: textCase || 'Sentence case',
            language: language || 'en'
        }
        return numberToWords(value, options)
    },
    textCaseConverter: (params: Record<string, any>) => {
        const { text, mode } = params
        const options: TextCaseConverterOptions = {
            mode: mode || 'lower'
        }
        return textCaseConverter(text, options)
    },
    bmiCalculator: (params: Record<string, any>) => {
        const {
            age,
            gender,
            height_unit,
            height_value,
            height_ft,
            height_in,
            height_m,
            height_cm,
            weight_unit,
            weight_value
        } = params

        const options: BMICalculatorOptions = {
            age: age ? Number(age) : 25,
            gender: gender || 'male',
            height_unit: height_unit || 'ft_in',
            height_value: height_value !== undefined ? Number(height_value) : undefined,
            height_ft: height_ft !== undefined ? Number(height_ft) : undefined,
            height_in: height_in !== undefined ? Number(height_in) : undefined,
            height_m: height_m !== undefined ? Number(height_m) : undefined,
            height_cm: height_cm !== undefined ? Number(height_cm) : undefined,
            weight_unit: weight_unit || 'lb',
            weight_value: weight_value ? Number(weight_value) : 160
        }

        return bmiCalculator(options)
    },
    lengthConverter: (params: Record<string, any>) => {
        return lengthConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    areaConverter: (params: Record<string, any>) => {
        return areaConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    volumeConverter: (params: Record<string, any>) => {
        return volumeConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    massConverter: (params: Record<string, any>) => {
        return massConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    speedConverter: (params: Record<string, any>) => {
        return speedConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    timeUnitConverter: (params: Record<string, any>) => {
        return timeUnitConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    speedDistanceTime: (params: Record<string, any>) => {
        return speedDistanceTime({ solve_for: params.solve_for, distance: params.distance, speed: params.speed, time: params.time })
    },
    hmsAddSubtract: (params: Record<string, any>) => {
        return hmsAddSubtract(params as any)
    },
    timeArithmetic: (params: Record<string, any>) => {
        return timeArithmetic(params as any)
    },
    hoursMinutesAddSubtract: (params: Record<string, any>) => {
        return hoursMinutesAddSubtract(params as any)
    },
    decimalToTime: (params: Record<string, any>) => {
        return decimalToTime({ decimal_hours: params.decimal_hours })
    },
    timeToDecimal: (params: Record<string, any>) => {
        return timeToDecimal({ hours: params.hours, minutes: params.minutes, seconds: params.seconds })
    },
    to24HourTime: (params: Record<string, any>) => {
        return to24HourTime({ hour: params.hour, minute: params.minute, ampm: params.ampm })
    },
    to12HourTime: (params: Record<string, any>) => {
        return to12HourTime({ hour_24: params.hour_24, minute: params.minute })
    },
    hoursBetweenClockTimes: (params: Record<string, any>) => {
        return hoursBetweenClockTimes(params as any)
    },
    dateAddSubtract: (params: Record<string, any>) => {
        return dateAddSubtract({ base_date: params.base_date, amount: params.amount, unit: params.unit, operation: params.operation })
    },
    dateDifference: (params: Record<string, any>) => {
        return dateDifference({ date1: params.date1, date2: params.date2 })
    },
    daysAndBusinessDays: (params: Record<string, any>) => {
        return daysAndBusinessDays({ date1: params.date1, date2: params.date2 })
    },
    datetimeDifference: (params: Record<string, any>) => {
        return datetimeDifference(params as any)
    },
    ageCalculator: (params: Record<string, any>) => {
        return ageCalculator({ birth_date: params.birth_date, as_of_date: params.as_of_date })
    },
    ageChecker: (params: Record<string, any>) => {
        return ageChecker({ birth_date: params.birth_date, required_age: params.required_age, as_of_date: params.as_of_date })
    },
    romanNumeralDate: (params: Record<string, any>) => {
        return romanNumeralDate({ date: params.date })
    },
    workHours: (params: Record<string, any>) => {
        return workHours(params as any)
    },
    clockInOutTotal: (params: Record<string, any>) => {
        return clockInOutTotal(params as any)
    },
    shiftCoverage: (params: Record<string, any>) => {
        return shiftCoverage(params as any)
    },
    focusSessionPlanner: (params: Record<string, any>) => {
        return focusSessionPlanner({ total_minutes: params.total_minutes, focus_minutes: params.focus_minutes, break_minutes: params.break_minutes })
    },
    contextSwitchingCost: (params: Record<string, any>) => {
        return contextSwitchingCost({ switches_per_day: params.switches_per_day, cost_per_switch_minutes: params.cost_per_switch_minutes, work_days_per_week: params.work_days_per_week })
    },
    meetingTimezoneOverlap: (params: Record<string, any>) => {
        return meetingTimezoneOverlap(params as any)
    },
    sunriseSunset: (params: Record<string, any>) => {
        return sunriseSunset({ latitude: params.latitude, longitude: params.longitude, date: params.date, utc_offset: params.utc_offset })
    },
    temperatureConverter: (params: Record<string, any>) => {
        return temperatureConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    celsiusToFahrenheit: (params: Record<string, any>) => {
        return celsiusToFahrenheit({ value: params.value })
    },
    fahrenheitToCelsius: (params: Record<string, any>) => {
        return fahrenheitToCelsius({ value: params.value })
    },
    celsiusToKelvin: (params: Record<string, any>) => {
        return celsiusToKelvin({ value: params.value })
    },
    fahrenheitToKelvin: (params: Record<string, any>) => {
        return fahrenheitToKelvin({ value: params.value })
    },
    temperatureDifference: (params: Record<string, any>) => {
        return temperatureDifference({ temp1: params.temp1, temp2: params.temp2, unit: params.unit })
    },
    angleConverter: (params: Record<string, any>) => {
        return angleConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    degreesToRadians: (params: Record<string, any>) => {
        return degreesToRadians({ value: params.value })
    },
    radiansToDegrees: (params: Record<string, any>) => {
        return radiansToDegrees({ value: params.value })
    },
    dmsToDecimalDegrees: (params: Record<string, any>) => {
        return dmsToDecimalDegrees({ degrees: params.degrees, minutes: params.minutes, seconds: params.seconds })
    },
    angleAddSubtract: (params: Record<string, any>) => {
        return angleAddSubtract(params as any)
    },
    referenceCoterminalAngle: (params: Record<string, any>) => {
        return referenceCoterminalAngle({ angle: params.angle })
    },
    dataStorageConverter: (params: Record<string, any>) => {
        return dataStorageConverter({ value: params.value, from_unit: params.from_unit, to_unit: params.to_unit })
    },
    downloadTimeCalculator: (params: Record<string, any>) => {
        return downloadTimeCalculator({ file_size: params.file_size, file_size_unit: params.file_size_unit, speed: params.speed, speed_unit: params.speed_unit })
    },
    numberBaseConverter: (params: Record<string, any>) => {
        return numberBaseConverter({ value: params.value, from_base: params.from_base, to_base: params.to_base })
    },
    binaryToDecimal: (params: Record<string, any>) => {
        return binaryToDecimal({ value: params.value })
    },
    decimalToBinary: (params: Record<string, any>) => {
        return decimalToBinary({ value: params.value })
    },
    decimalToHexadecimal: (params: Record<string, any>) => {
        return decimalToHexadecimal({ value: params.value })
    },
    hexadecimalToDecimal: (params: Record<string, any>) => {
        return hexadecimalToDecimal({ value: params.value })
    },
    textToBinary: (params: Record<string, any>) => {
        return textToBinary({ value: params.value })
    },
    binaryToText: (params: Record<string, any>) => {
        return binaryToText({ value: params.value })
    },
    numberToRoman: (params: Record<string, any>) => {
        return numberToRoman({ value: params.value })
    },
    romanToNumber: (params: Record<string, any>) => {
        return romanToNumber({ value: params.value })
    },
    roasCalculator: (params: Record<string, any>) => {
        return roasCalculator({ revenue: params.revenue, ad_spend: params.ad_spend })
    },
    cpaCalculator: (params: Record<string, any>) => {
        return cpaCalculator({ total_spend: params.total_spend, conversions: params.conversions })
    },
    cpmCalculator: (params: Record<string, any>) => {
        return cpmCalculator({ total_spend: params.total_spend, impressions: params.impressions })
    },
    ctrCalculator: (params: Record<string, any>) => {
        return ctrCalculator({ clicks: params.clicks, impressions: params.impressions })
    },
    conversionRateCalculator: (params: Record<string, any>) => {
        return conversionRateCalculator({ conversions: params.conversions, visitors: params.visitors })
    },
    funnelConversionCalculator: (params: Record<string, any>) => {
        return funnelConversionCalculator({ stage1: params.stage1, stage2: params.stage2, stage3: params.stage3, stage4: params.stage4 })
    },
    multiTouchAttributionCalculator: (params: Record<string, any>) => {
        return multiTouchAttributionCalculator({ conversion_value: params.conversion_value, model: params.model })
    },
    ltvCacRatioCalculator: (params: Record<string, any>) => {
        return ltvCacRatioCalculator({ ltv: params.ltv, cac: params.cac })
    },
    churnRateCalculator: (params: Record<string, any>) => {
        return churnRateCalculator({ customers_start: params.customers_start, customers_lost: params.customers_lost })
    },
    loyaltyProgramRoiCalculator: (params: Record<string, any>) => {
        return loyaltyProgramRoiCalculator({ program_cost: params.program_cost, incremental_revenue: params.incremental_revenue })
    },
    organicTrafficValueCalculator: (params: Record<string, any>) => {
        return organicTrafficValueCalculator({ organic_visitors: params.organic_visitors, equivalent_cpc: params.equivalent_cpc })
    },
    emailMarketingRoiCalculator: (params: Record<string, any>) => {
        return emailMarketingRoiCalculator({ campaign_revenue: params.campaign_revenue, campaign_cost: params.campaign_cost })
    },
    concreteCalculator: (params: Record<string, any>) => {
        return concreteCalculator({ length: params.length, width: params.width, thickness: params.thickness })
    },
    concreteBagsCalculator: (params: Record<string, any>) => {
        return concreteBagsCalculator({ volume_cuft: params.volume_cuft })
    },
    cubicYardsCalculator: (params: Record<string, any>) => {
        return cubicYardsCalculator({ length: params.length, width: params.width, depth: params.depth })
    },
    squareFootageCalculator: (params: Record<string, any>) => {
        return squareFootageCalculator({ length: params.length, width: params.width })
    },
    gravelCalculator: (params: Record<string, any>) => {
        return gravelCalculator({ length: params.length, width: params.width, depth: params.depth })
    },
    mulchCalculator: (params: Record<string, any>) => {
        return mulchCalculator({ length: params.length, width: params.width, depth: params.depth })
    },
    tankCapacityCalculator: (params: Record<string, any>) => {
        return tankCapacityCalculator({ shape: params.shape, diameter: params.diameter, length: params.length, width: params.width, height: params.height })
    },
    roadwayFillCalculator: (params: Record<string, any>) => {
        return roadwayFillCalculator({ length: params.length, width: params.width, depth: params.depth })
    },
    sandCalculator: (params: Record<string, any>) => {
        return sandCalculator({ length: params.length, width: params.width, depth: params.depth })
    },
    topsoilCalculator: (params: Record<string, any>) => {
        return topsoilCalculator({ length: params.length, width: params.width, depth: params.depth })
    },
    paverCalculator: (params: Record<string, any>) => {
        return paverCalculator({ area: params.area, paver_length: params.paver_length, paver_width: params.paver_width })
    },
    retainingWallBlockCalculator: (params: Record<string, any>) => {
        return retainingWallBlockCalculator({ wall_length: params.wall_length, wall_height: params.wall_height, block_length: params.block_length, block_height: params.block_height })
    },
}

/**
 * Единый движок для JSON калькуляторов
 * Используется на сервере и клиенте для консистентности
 */
export function calculate(
    config: JsonEngineConfig,
    inputValues: JsonEngineInput
): JsonEngineOutput {
    // 1. Подготавливаем переменные (превращаем строки в числа где нужно)
    const scope: Record<string, number | string> = {}
    config.inputs.forEach((inp) => {
        const inputValue = inputValues[inp.key]
        if (inputValue !== undefined && inputValue !== null && inputValue !== '') {
            scope[inp.key] = inputValue
        } else if (inp.default !== undefined) {
            scope[inp.key] = inp.default
        }
    })

    // 2. Обрабатываем результаты
    const results: JsonEngineOutput = {}

    // 2a. Обрабатываем формулы (если есть)
    if (config.formulas) {
        Object.entries(config.formulas).forEach(([outKey, formula]) => {
            try {
                // Для формул конвертируем все в числа
                const numericScope: Record<string, number> = {}
                Object.entries(scope).forEach(([key, val]) => {
                    numericScope[key] = typeof val === 'number' ? val : parseFloat(String(val)) || 0
                })
                
                const rawResult = math.evaluate(formula as string, numericScope)
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
    }

    // 2b. Обрабатываем кастомные функции (если есть)
    if (config.functions) {
        Object.entries(config.functions).forEach(([outKey, funcConfig]) => {
            try {
                if (funcConfig.type === 'function' && FUNCTION_REGISTRY[funcConfig.functionName]) {
                    // Подготавливаем параметры для функции
                    const params: Record<string, any> = {}
                    // Добавляем язык из конфига, если он не передан явно
                    if (config.language && !params.language) {
                        params.language = config.language
                    }
                    Object.entries(funcConfig.params).forEach(([paramName, inputKey]) => {
                        const value = scope[inputKey]
                        // Для числовых параметров конвертируем в число
                        if (paramName === 'vatRate' && value !== undefined && value !== null) {
                            params[paramName] = typeof value === 'number' ? value : parseFloat(String(value)) || 0
                        } else {
                            params[paramName] = value
                        }
                    })
                    
                    // Вызываем функцию
                    const functionResult = FUNCTION_REGISTRY[funcConfig.functionName](params)
                    
                    // Обрабатываем результат
                    if (typeof functionResult === 'object' && functionResult !== null) {
                        // Если функция возвращает объект (например, { textResult, calculatedTotal })
                        // Извлекаем все поля из объекта в results
                        Object.entries(functionResult).forEach(([key, value]) => {
                            results[key] = value as string | number
                        })
                    } else {
                        results[outKey] = functionResult as string | number
                    }
                }
            } catch (e) {
                console.error(`Ошибка выполнения функции ${outKey}:`, e)
            }
        })
    }

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
