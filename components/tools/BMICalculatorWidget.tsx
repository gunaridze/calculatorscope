'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { calculate, type JsonEngineConfig, type JsonEngineInput, type JsonEngineOutput } from '@/core/engines/json'
import { getBMICalculatorTranslations, formatMessage, type BMICalculatorLang } from '@/lib/bmi-calculator-translations'
import BMIGaugeChart from './BMIGaugeChart'

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

    // Сохранение результата в PDF
    const handleSave = async () => {
        try {
            // Динамически импортируем библиотеки для PDF
            const { default: jsPDF } = await import('jspdf')
            const html2canvas = (await import('html2canvas')).default
            
            // Находим элемент результата для сохранения
            const resultElement = document.querySelector('[data-bmi-result]')
            if (!resultElement) {
                // Fallback: сохраняем как текст
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
                return
            }

            // Создаем canvas из HTML элемента
            const canvas = await html2canvas(resultElement as HTMLElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false
            })

            const imgData = canvas.toDataURL('image/png', 1.0)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })
            
            const imgWidth = 210 // A4 width in mm
            const pageHeight = 297 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight
            let position = 0

            // Добавляем первую страницу
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            // Добавляем дополнительные страницы, если изображение не помещается
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save(`bmi-result-${Date.now()}.pdf`)
        } catch (error) {
            console.error('Error saving PDF:', error)
            // Fallback: сохраняем как текст
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
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            {/* Header Виджета */}
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            {/* Тело Калькулятора */}
            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>

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

                {/* Gender - кнопки выбора */}
                {(() => {
                    const fieldConfig = getFieldConfig('gender')
                    const currentGender = values.gender as string || 'male'
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {fieldConfig?.label || 'Gender'}
                            </label>
                            <div className="flex gap-2">
                                {fieldConfig?.options?.map((opt: any) => {
                                    const isActive = currentGender === opt.value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleChange('gender', opt.value)}
                                            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                                isActive
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })()}

                {/* Height Unit - кнопки выбора */}
                {(() => {
                    const fieldConfig = getFieldConfig('height_unit')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {fieldConfig?.label || 'Height Unit'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {fieldConfig?.options?.map((opt: any) => {
                                    const isActive = heightUnit === opt.value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleChange('height_unit', opt.value)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                                isActive
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    )
                                })}
                            </div>
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

                {/* Weight Unit - кнопки выбора */}
                {(() => {
                    const fieldConfig = getFieldConfig('weight_unit')
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {fieldConfig?.label || 'Weight Unit'}
                            </label>
                            <div className="flex gap-2">
                                {fieldConfig?.options?.map((opt: any) => {
                                    const isActive = weightUnit === opt.value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleChange('weight_unit', opt.value)}
                                            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                                isActive
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    )
                                })}
                            </div>
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
                        title="Save result"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* BOTTOM SECTION: Результат */}
            {Object.keys(result).length > 0 && (
                <div className="border-t border-gray-200 pt-6" data-bmi-result>
                    {/* Header Result с кнопкой Save */}
                    <div className="bg-green-600 text-white px-5 py-3 rounded-t-lg -mx-5 -mt-6 mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold">{t.result.title}</h3>
                        <button
                            onClick={handleSave}
                            className="flex flex-col items-center gap-0.5 text-sm hover:bg-green-700 px-2 py-1 rounded transition-colors"
                            title="Save as PDF"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586L8.707 7.293zM3 9a2 2 0 012-2h1a1 1 0 010 2H5v7h10v-7h-1a1 1 0 110-2h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                            <span className="text-xs">save</span>
                        </button>
                    </div>

                    {/* BMI и статус */}
                    <div className="mb-4 text-center">
                        <p className="text-lg font-semibold text-gray-900">
                            BMI = {result.bmi} kg/m² ({getStatusLabel()})
                        </p>
                    </div>

                    {/* BMI Gauge Chart */}
                    <div className="mb-6">
                        <BMIGaugeChart 
                            bmi={result.bmi as number} 
                            status={result.bmi_status as 'underweight' | 'normal' | 'overweight' | 'obesity'}
                            lang={lang}
                        />
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
                <div className="px-6 pb-4 flex justify-end">
                    <Link href={`/${lang}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Image src="/calculatorscope-logo.svg" alt="Calculator Scope" width={20} height={20} className="w-5 h-5 object-contain" />
                        <div className="flex flex-col">
                            <span className="font-medium">Calculator Scope</span>
                            <span className="text-xs text-gray-500">Online Calculators for Everything</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
