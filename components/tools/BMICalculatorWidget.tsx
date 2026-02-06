'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { calculate, type JsonEngineConfig, type JsonEngineInput, type JsonEngineOutput } from '@/core/engines/json'
import { getBMICalculatorTranslations, formatMessage, type BMICalculatorLang } from '@/lib/bmi-calculator-translations'

type Props = {
    config: JsonEngineConfig
    interface: any
    initialValues?: JsonEngineInput
    h1: string
    lang: string
    toolId?: string
    h1En?: string
    translations: {
        clear: string
        calculate: string
        result: string
        copy: string
        suggest: string
        getWidget: string
        downloadWidget: string
    }
    toolSlug?: string
}

export default function BMICalculatorWidget({
    config, interface: ui, initialValues, h1, lang, toolId, h1En, translations, toolSlug
}: Props) {
    // Получаем переводы для UI результата
    const t = getBMICalculatorTranslations(lang as BMICalculatorLang)

    // Инициализация значений
    const getInitialValues = (): JsonEngineInput => {
        const defaults: JsonEngineInput = {}
        config.inputs.forEach((inp) => {
            if (inp.default !== undefined && inp.default !== null) {
                defaults[inp.key] = inp.default
            }
        })
        return { ...defaults, ...(initialValues || {}) }
    }

    const defaultValues = getInitialValues()
    const [values, setValues] = useState<JsonEngineInput>(defaultValues)
    const [result, setResult] = useState<JsonEngineOutput>({})
    const [copied, setCopied] = useState(false)

    // Применяем query params из URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const urlValues: JsonEngineInput = {}
            
            config.inputs.forEach((inp) => {
                const paramValue = params.get(inp.key)
                if (paramValue) {
                    const numValue = parseFloat(paramValue)
                    if (!isNaN(numValue)) {
                        urlValues[inp.key] = numValue
                    } else {
                        urlValues[inp.key] = paramValue
                    }
                }
            })

            if (Object.keys(urlValues).length > 0) {
                setValues((prev) => ({ ...prev, ...urlValues }))
            }
        }
    }, [config])

    // Получаем конфигурацию поля из inputs_json
    const getFieldConfig = (fieldName: string) => {
        // Проверяем структуру: может быть массив для языка или объект
        if (Array.isArray(ui?.[lang])) {
            return ui[lang].find((field: any) => field.name === fieldName)
        }
        if (Array.isArray(ui?.['en'])) {
            return ui['en'].find((field: any) => field.name === fieldName)
        }
        // Fallback: проверяем как объект
        return ui?.[lang]?.[fieldName] || ui?.['en']?.[fieldName]
    }

    // Обработка изменения значений
    const handleChange = (key: string, value: string | number) => {
        setValues((prev) => {
            const newValues = { ...prev, [key]: value }
            // Если изменилась единица измерения, сбрасываем зависимые поля
            if (key === 'height_unit') {
                // Сбрасываем все height поля кроме height_unit
                if (value !== 'ft_in') {
                    delete newValues.height_ft
                    delete newValues.height_in
                }
                if (value !== 'm_cm') {
                    delete newValues.height_m
                    delete newValues.height_cm
                }
                if (value === 'ft_in' || value === 'm_cm') {
                    delete newValues.height_value
                } else {
                    delete newValues.height_ft
                    delete newValues.height_in
                    delete newValues.height_m
                    delete newValues.height_cm
                }
            }
            return newValues
        })
    }

    // Расчет
    const handleCalculate = () => {
        try {
            const calculated = calculate(config, values)
            setResult(calculated)
        } catch (error) {
            console.error('Calculation error:', error)
        }
    }

    // Очистка
    const handleClear = () => {
        setValues(getInitialValues())
        setResult({})
    }

    // Сохранение результата
    const handleSave = () => {
        const resultText = `BMI: ${result.bmi || ''}\nStatus: ${result.bmi_status || ''}\nHealthy Weight Range: ${result.healthy_weight_min || ''} - ${result.healthy_weight_max || ''} ${values.weight_unit || ''}`
        const blob = new Blob([resultText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bmi-result.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Копирование результата
    const handleCopy = async () => {
        const resultText = `BMI: ${result.bmi || ''}\nStatus: ${result.bmi_status || ''}\nHealthy Weight Range: ${result.healthy_weight_min || ''} - ${result.healthy_weight_max || ''} ${values.weight_unit || ''}`
        try {
            await navigator.clipboard.writeText(resultText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // Определяем, какие поля показывать
    const heightUnit = values.height_unit as string || 'ft_in'
    const showHeightValue = heightUnit !== 'ft_in' && heightUnit !== 'm_cm'
    const showHeightFtIn = heightUnit === 'ft_in'
    const showHeightMCm = heightUnit === 'm_cm'

    // Получаем единицу веса для отображения
    const weightUnit = values.weight_unit as string || 'lb'
    const weightUnitLabel = t.units[weightUnit as keyof typeof t.units] || weightUnit

    // Формируем сообщение
    const getMessage = (): string => {
        const status = result.bmi_status as string
        if (status === 'normal') {
            return t.messages.healthy
        } else if (status === 'underweight') {
            const weight = result.weight_to_target as number || 0
            return formatMessage(t.messages.underweight, {
                weight: Math.abs(weight).toFixed(1),
                unit: weightUnitLabel
            })
        } else if (status === 'obesity' || status === 'overweight') {
            const weight = result.weight_to_target as number || 0
            return formatMessage(t.messages.obese, {
                weight: Math.abs(weight).toFixed(1),
                unit: weightUnitLabel
            })
        }
        return ''
    }

    // Получаем статус для отображения
    const getStatusLabel = (): string => {
        const status = result.bmi_status as string
        return t.status[status as keyof typeof t.status] || status
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{h1}</h2>
            </div>

            {/* TOP SECTION: Форма ввода */}
            <div className="mb-8">
                {/* Age */}
                {(() => {
                    const fieldConfig = getFieldConfig('age')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig?.label || 'Age'}
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={fieldConfig?.placeholder || '25'}
                                min={fieldConfig?.min || 2}
                                max={fieldConfig?.max || 120}
                                value={values.age !== undefined ? String(values.age) : ''}
                                onChange={(e) => handleChange('age', parseFloat(e.target.value) || 0)}
                            />
                            {fieldConfig?.description && (
                                <p className="text-xs text-gray-500 mt-1">{fieldConfig.description}</p>
                            )}
                        </div>
                    )
                })()}

                {/* Gender */}
                {(() => {
                    const fieldConfig = getFieldConfig('gender')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig?.label || 'Gender'}
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                value={values.gender as string || 'male'}
                                onChange={(e) => handleChange('gender', e.target.value)}
                            >
                                {fieldConfig?.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )
                })()}

                {/* Height Unit */}
                {(() => {
                    const fieldConfig = getFieldConfig('height_unit')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig?.label || 'Height Unit'}
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                value={heightUnit}
                                onChange={(e) => handleChange('height_unit', e.target.value)}
                            >
                                {fieldConfig?.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )
                })()}

                {/* Height Value (для одиночных единиц) */}
                {showHeightValue && (() => {
                    const fieldConfig = getFieldConfig('height_value')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig?.label || 'Height'}
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={fieldConfig?.placeholder || '70'}
                                value={values.height_value !== undefined ? String(values.height_value) : ''}
                                onChange={(e) => handleChange('height_value', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    )
                })()}

                {/* Height Ft/In (для ft_in режима) */}
                {showHeightFtIn && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        {(() => {
                            const fieldConfig = getFieldConfig('height_ft')
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {fieldConfig?.label || 'Feet'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={fieldConfig?.placeholder || '5'}
                                        value={values.height_ft !== undefined ? String(values.height_ft) : ''}
                                        onChange={(e) => handleChange('height_ft', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        })()}
                        {(() => {
                            const fieldConfig = getFieldConfig('height_in')
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {fieldConfig?.label || 'Inches'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={fieldConfig?.placeholder || '10'}
                                        min={fieldConfig?.min || 0}
                                        max={fieldConfig?.max || 11}
                                        value={values.height_in !== undefined ? String(values.height_in) : ''}
                                        onChange={(e) => handleChange('height_in', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        })()}
                    </div>
                )}

                {/* Height M/Cm (для m_cm режима) */}
                {showHeightMCm && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        {(() => {
                            const fieldConfig = getFieldConfig('height_m')
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {fieldConfig?.label || 'Meters'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={fieldConfig?.placeholder || '1'}
                                        value={values.height_m !== undefined ? String(values.height_m) : ''}
                                        onChange={(e) => handleChange('height_m', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        })()}
                        {(() => {
                            const fieldConfig = getFieldConfig('height_cm')
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {fieldConfig?.label || 'Centimeters'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={fieldConfig?.placeholder || '78'}
                                        min={fieldConfig?.min || 0}
                                        max={fieldConfig?.max || 99}
                                        value={values.height_cm !== undefined ? String(values.height_cm) : ''}
                                        onChange={(e) => handleChange('height_cm', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        })()}
                    </div>
                )}

                {/* Weight Unit */}
                {(() => {
                    const fieldConfig = getFieldConfig('weight_unit')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig?.label || 'Weight Unit'}
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                value={weightUnit}
                                onChange={(e) => handleChange('weight_unit', e.target.value)}
                            >
                                {fieldConfig?.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )
                })()}

                {/* Weight Value */}
                {(() => {
                    const fieldConfig = getFieldConfig('weight_value')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig?.label || 'Weight'}
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={fieldConfig?.placeholder || '160'}
                                value={values.weight_value !== undefined ? String(values.weight_value) : ''}
                                onChange={(e) => handleChange('weight_value', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    )
                })()}

                {/* Кнопки действий */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleCalculate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {translations.calculate}
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {translations.clear}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {translations.downloadWidget}
                    </button>
                </div>
            </div>

            {/* BOTTOM SECTION: Результат */}
            {Object.keys(result).length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t.result.title}</h3>

                    {/* BMI и статус */}
                    <div className="mb-4">
                        <p className="text-lg font-semibold text-gray-900">
                            BMI = {result.bmi} ({getStatusLabel()})
                        </p>
                    </div>

                    {/* Шкала BMI (упрощенная версия) */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-4 bg-red-200 rounded" style={{ opacity: (result.bmi_status === 'underweight') ? 1 : 0.3 }}>
                                <span className="text-xs text-gray-600 ml-1">Underweight</span>
                            </div>
                            <div className="flex-1 h-4 bg-green-200 rounded" style={{ opacity: (result.bmi_status === 'normal') ? 1 : 0.3 }}>
                                <span className="text-xs text-gray-600 ml-1">Normal</span>
                            </div>
                            <div className="flex-1 h-4 bg-yellow-200 rounded" style={{ opacity: (result.bmi_status === 'overweight') ? 1 : 0.3 }}>
                                <span className="text-xs text-gray-600 ml-1">Overweight</span>
                            </div>
                            <div className="flex-1 h-4 bg-red-300 rounded" style={{ opacity: (result.bmi_status === 'obesity') ? 1 : 0.3 }}>
                                <span className="text-xs text-gray-600 ml-1">Obesity</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                            &lt; 18.5 | 18.5-25 | 25-30 | &ge; 30
                        </div>
                    </div>

                    {/* Метрики */}
                    <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-700">
                            {t.result.healthy_bmi_range}
                        </p>
                        <p className="text-sm text-gray-700">
                            {formatMessage(t.result.healthy_weight_for_height, {
                                min: String(result.healthy_weight_min || ''),
                                max: String(result.healthy_weight_max || ''),
                                unit: weightUnitLabel
                            })}
                        </p>
                        <p className="text-sm text-gray-700">
                            {formatMessage(t.result.bmi_prime, {
                                value: String(result.bmi_prime || '')
                            })}
                        </p>
                        <p className="text-sm text-gray-700">
                            {formatMessage(t.result.ponderal_index, {
                                value: String(result.ponderal_index || '')
                            })}
                        </p>
                    </div>

                    {/* Сообщение */}
                    {getMessage() && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-800">{getMessage()}</p>
                        </div>
                    )}

                    {/* Кнопка копирования */}
                    <button
                        onClick={handleCopy}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {copied ? '✓' : translations.copy}
                    </button>
                </div>
            )}

            {/* Footer links */}
            <div className="mt-5">
                <Link href={`/${lang}/contact`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm block">
                    {translations.suggest}
                </Link>
                <button onClick={handleSave} className="text-blue-600 hover:text-blue-800 hover:underline text-sm block mt-2 cursor-pointer text-left" type="button" style={{ background: 'none', border: 'none', padding: 0 }}>
                    {translations.downloadWidget}
                </button>
                {toolSlug && (
                    <Link href={`/${lang}/widget/${toolSlug}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm block text-center mt-[50px]">
                        {translations.getWidget}
                    </Link>
                )}
            </div>

            {/* Logo */}
            <div className="mt-5 text-right" style={{ marginTop: '20px' }}>
                <Link href={`/${lang}`} className="logo-widget inline-block">
                    <Image src="/calculatorscope-logo.svg" alt="Calculator Scope" width={90} height={90} className="object-contain inline-block" />
                </Link>
            </div>
        </div>
    )
}
