'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
    
    // Нормализуем ui: если это объект с ключом "inputs", извлекаем массив
    // (Prisma может возвращать JSON как {inputs: [...]} вместо просто [...])
    const normalizedUi = useMemo(() => {
        if (!ui) {
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.warn('[BMICalculatorWidget] ui is null/undefined for lang:', lang, 'toolId:', toolId)
            }
            return null
        }
        // Если это объект с ключом "inputs", извлекаем массив
        if (typeof ui === 'object' && !Array.isArray(ui) && 'inputs' in ui && Array.isArray(ui.inputs)) {
            return ui.inputs
        }
        // Если это уже массив, возвращаем как есть
        if (Array.isArray(ui)) {
            return ui
        }
        // Если это объект с ключами языков
        if (typeof ui === 'object' && !Array.isArray(ui)) {
            // Проверяем, есть ли ключ текущего языка
            if (ui[lang] && Array.isArray(ui[lang])) {
                return ui[lang]
            }
            // Fallback на английский
            if (ui['en'] && Array.isArray(ui['en'])) {
                return ui['en']
            }
        }
        // Отладка: что именно пришло
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.warn('[BMICalculatorWidget] Unexpected ui structure:', typeof ui, Array.isArray(ui), Object.keys(ui || {}), 'lang:', lang)
        }
        return null
    }, [ui, lang, toolId])

    // Инициализация: только единицы и пол — из конфига; Age, Weight, Height, Feet, Inches — пустые (образец в placeholder)
    const getInitialValues = (): JsonEngineInput => {
        const defaults: JsonEngineInput = {}
        const keysWithDefaults = ['height_unit', 'gender', 'weight_unit']
        config.inputs.forEach((inp) => {
            if (keysWithDefaults.includes(inp.key) && inp.default !== undefined && inp.default !== null) {
                defaults[inp.key] = inp.default
            }
        })
        const merged = { ...defaults, ...(initialValues || {}) }
        if (merged.height_unit !== 'cm' && merged.height_unit !== 'ft_in') {
            merged.height_unit = 'ft_in'
        }
        return merged
    }

    const defaultValues = getInitialValues()
    const [values, setValues] = useState<JsonEngineInput>(defaultValues)
    const [result, setResult] = useState<JsonEngineOutput>({})

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
    // normalizedUi - это массив полей для текущего языка
    const getFieldConfig = (fieldName: string) => {
        if (!normalizedUi || !Array.isArray(normalizedUi)) {
            return null
        }
        return normalizedUi.find((field: any) => field.name === fieldName) || null
    }

    // Обработка изменения значений
    const handleChange = (key: string, value: string | number) => {
        setValues((prev) => {
            const newValues = { ...prev, [key]: value }
            // Если изменилась единица измерения, сбрасываем зависимые поля
            if (key === 'height_unit') {
                if (value !== 'ft_in') {
                    delete newValues.height_ft
                    delete newValues.height_in
                }
                if (value !== 'cm') {
                    delete newValues.height_value
                } else {
                    delete newValues.height_ft
                    delete newValues.height_in
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

    // Заменяем SVG на img в контейнере для html2canvas; возвращаем список (parent, img, svg) для восстановления
    const replaceSvgsWithImages = (container: HTMLElement): Promise<{ parent: Node; img: HTMLImageElement; svg: SVGElement }[]> => {
        const svgs = Array.from(container.querySelectorAll('svg'))
        if (svgs.length === 0) return Promise.resolve([])
        const restores: { parent: Node; img: HTMLImageElement; svg: SVGElement }[] = []
        const promises = svgs.map((svg) => {
            return new Promise<void>((resolve) => {
                const rect = svg.getBoundingClientRect()
                const w = Math.max(1, Math.round(rect.width))
                const h = Math.max(1, Math.round(rect.height))
                const canvas = document.createElement('canvas')
                canvas.width = w * 2
                canvas.height = h * 2
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve()
                    return
                }
                const img = document.createElement('img')
                const svgData = new XMLSerializer().serializeToString(svg)
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
                const url = URL.createObjectURL(svgBlob)
                img.onload = () => {
                    try {
                        ctx.scale(2, 2)
                        ctx.drawImage(img, 0, 0, w, h)
                        const dataUrl = canvas.toDataURL('image/png')
                        const newImg = document.createElement('img')
                        newImg.src = dataUrl
                        newImg.style.cssText = `width:${w}px;height:${h}px;display:block`
                        const parent = svg.parentNode
                        if (parent) {
                            parent.replaceChild(newImg, svg)
                            restores.push({ parent, img: newImg, svg })
                        }
                    } finally {
                        URL.revokeObjectURL(url)
                    }
                    resolve()
                }
                img.onerror = () => {
                    URL.revokeObjectURL(url)
                    resolve()
                }
                img.src = url
            })
        })
        return Promise.all(promises).then(() => restores)
    }

    const restoreSvgs = (restores: { parent: Node; img: HTMLImageElement; svg: SVGElement }[]) => {
        restores.forEach(({ parent, img, svg }) => {
            if (parent.contains(img)) {
                parent.replaceChild(svg, img)
            }
        })
    }

    // Сохранение результата как изображение JPG (блок результата + чарт)
    const handleSave = async () => {
        const resultElement = document.querySelector('[data-bmi-result]') as HTMLElement | null
        if (!resultElement) {
            saveAsTxtFallback()
            return
        }
        
        try {
            const html2canvas = (await import('html2canvas')).default
            
            // Создаём полностью новый простой HTML элемент без классов Tailwind
            const simpleContainer = document.createElement('div')
            simpleContainer.style.position = 'absolute'
            simpleContainer.style.left = '-9999px'
            simpleContainer.style.top = '0'
            simpleContainer.style.width = `${resultElement.offsetWidth}px`
            simpleContainer.style.backgroundColor = '#ffffff'
            simpleContainer.style.padding = '20px'
            simpleContainer.style.fontFamily = 'Arial, sans-serif'
            simpleContainer.style.color = '#000000'
            
            // Получаем данные из результата
            const status = result.bmi_status as string
            const chartColors: Record<string, string> = {
                underweight: '#bc2020',
                normal: '#008137',
                overweight: '#ffe400',
                obesity: '#8a0101'
            }
            const headerBg = chartColors[status] || chartColors.normal
            const headerTextColor = status === 'overweight' ? '#1f2937' : '#ffffff'
            
            // Создаём упрощённую структуру
            const header = document.createElement('div')
            header.style.backgroundColor = headerBg
            header.style.color = headerTextColor
            header.style.padding = '15px'
            header.style.borderRadius = '8px 8px 0 0'
            header.style.fontSize = '18px'
            header.style.fontWeight = 'bold'
            header.textContent = t.result.title
            simpleContainer.appendChild(header)
            
            const content = document.createElement('div')
            content.style.position = 'relative' // Для позиционирования логотипа
            content.style.backgroundColor = '#ffffff'
            content.style.padding = '20px'
            content.style.paddingBottom = '110px' // Добавляем место для логотипа внизу
            content.style.border = '1px solid #e5e7eb'
            content.style.borderTop = 'none'
            content.style.borderRadius = '0 0 8px 8px'
            
            // BMI и статус
            const bmiText = document.createElement('p')
            bmiText.style.textAlign = 'center'
            bmiText.style.fontSize = '18px'
            bmiText.style.fontWeight = '600'
            bmiText.style.marginBottom = '20px'
            bmiText.style.color = '#000000'
            bmiText.textContent = `BMI = ${typeof result.bmi === 'number' ? result.bmi.toFixed(1) : result.bmi} kg/m² (${getStatusLabel()})`
            content.appendChild(bmiText)
            
            // Копируем SVG чарт - ищем SVG внутри div с классом mb-6 (контейнер чарта)
            // или SVG с width="300px" / viewBox="0 0 300 163"
            const chartContainer = resultElement.querySelector('.mb-6') || resultElement
            const allSvgs = chartContainer.querySelectorAll('svg')
            let chartElement: SVGElement | null = null
            
            // Ищем SVG чарта по размеру (300px width или viewBox)
            for (const svg of Array.from(allSvgs)) {
                const width = svg.getAttribute('width')
                const viewBox = svg.getAttribute('viewBox')
                // Чарт имеет width="300px" или viewBox="0 0 300 163"
                // Иконка кнопки имеет viewBox="0 0 20 20"
                if ((width && width.includes('300')) || viewBox === '0 0 300 163') {
                    chartElement = svg as SVGElement
                    break
                }
            }
            
            if (chartElement) {
                const chartWrapper = document.createElement('div')
                chartWrapper.style.textAlign = 'center'
                chartWrapper.style.marginBottom = '20px'
                chartWrapper.style.width = '100%'
                // Копируем весь SVG с помощью outerHTML
                chartWrapper.innerHTML = chartElement.outerHTML
                const chartClone = chartWrapper.querySelector('svg') as SVGElement
                if (chartClone) {
                    chartClone.style.display = 'block'
                    chartClone.style.margin = '0 auto'
                    chartClone.setAttribute('width', '300px')
                    chartClone.setAttribute('height', '163px')
                    chartClone.style.width = '300px'
                    chartClone.style.height = '163px'
                    chartClone.style.maxWidth = '300px'
                    chartClone.style.maxHeight = '163px'
                }
                content.appendChild(chartWrapper)
            }
            
            // Метрики
            const metrics = document.createElement('div')
            metrics.style.marginBottom = '20px'
            metrics.style.fontSize = '14px'
            metrics.style.color = '#374151'
            metrics.style.lineHeight = '1.6'
            
            const metric1 = document.createElement('p')
            metric1.textContent = t.result.healthy_bmi_range
            metric1.style.marginBottom = '8px'
            metrics.appendChild(metric1)
            
            const metric2 = document.createElement('p')
            metric2.textContent = formatMessage(t.result.healthy_weight_for_height, {
                min: String(result.healthy_weight_min || ''),
                max: String(result.healthy_weight_max || ''),
                unit: weightUnitLabel
            })
            metric2.style.marginBottom = '8px'
            metrics.appendChild(metric2)
            
            const metric3 = document.createElement('p')
            metric3.textContent = formatMessage(t.result.bmi_prime, {
                value: String(result.bmi_prime || '')
            })
            metric3.style.marginBottom = '8px'
            metrics.appendChild(metric3)
            
            const metric4 = document.createElement('p')
            metric4.textContent = formatMessage(t.result.ponderal_index, {
                value: String(result.ponderal_index || '')
            })
            metrics.appendChild(metric4)
            
            content.appendChild(metrics)
            
            // Сообщение
            const message = getMessage()
            if (message) {
                let messageBg = '#d1fae5'
                if (status === 'underweight') messageBg = '#fee2e2'
                else if (status === 'overweight') messageBg = '#fef3c7'
                else if (status === 'obesity') messageBg = '#fecaca'
                
                const messageDiv = document.createElement('div')
                messageDiv.style.backgroundColor = messageBg
                messageDiv.style.border = '1px solid #d1d5db'
                messageDiv.style.borderRadius = '8px'
                messageDiv.style.padding = '16px'
                messageDiv.style.fontSize = '14px'
                messageDiv.style.color = '#1f2937'
                messageDiv.textContent = message
                content.appendChild(messageDiv)
            }
            
            // Добавляем логотип в левый нижний угол content (после всех элементов)
            const logoWrapper = document.createElement('div')
            logoWrapper.style.position = 'absolute'
            logoWrapper.style.bottom = '10px'
            logoWrapper.style.left = '10px'
            logoWrapper.style.width = '90px'
            logoWrapper.style.height = '90px'
            logoWrapper.style.zIndex = '10'
            
            const logoImg = document.createElement('img')
            logoImg.src = '/calculatorscope-logo.svg'
            logoImg.alt = 'Calculator Scope'
            logoImg.style.width = '90px'
            logoImg.style.height = '90px'
            logoImg.style.objectFit = 'contain'
            logoImg.style.display = 'block'
            logoImg.style.maxWidth = '90px'
            logoImg.style.maxHeight = '90px'
            
            logoWrapper.appendChild(logoImg)
            // Добавляем логотип в конец content, чтобы он был поверх всего
            content.appendChild(logoWrapper)
            
            simpleContainer.appendChild(content)
            
            // Ждём загрузки изображения перед захватом
            await new Promise((resolve) => {
                if (logoImg.complete) {
                    resolve(null)
                } else {
                    logoImg.onload = () => resolve(null)
                    logoImg.onerror = () => resolve(null) // Продолжаем даже если логотип не загрузился
                }
            })
            
            document.body.appendChild(simpleContainer)
            
            // Захватываем упрощённый элемент
            const canvas = await html2canvas(simpleContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
            })
            
            document.body.removeChild(simpleContainer)
            
            // Сохраняем canvas как JPG изображение
            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            const link = document.createElement('a')
            link.download = `bmi-result-${Date.now()}.jpg`
            link.href = imgData
            link.click()
        } catch (error: any) {
            console.error('Error saving image:', error)
            saveAsTxtFallback()
        }
    }

    const saveAsTxtFallback = () => {
        const resultText = `BMI: ${result.bmi ?? ''}\nStatus: ${result.bmi_status ?? ''}\nHealthy Weight Range: ${result.healthy_weight_min ?? ''} - ${result.healthy_weight_max ?? ''} ${values.weight_unit ?? ''}`
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

    // Height Unit: только cm и ft_in
    const heightUnit = values.height_unit as string || 'ft_in'
    const showHeightValue = heightUnit === 'cm'
    const showHeightFtIn = heightUnit === 'ft_in'

    // Скачать виджет — открыть калькулятор в popup
    const handleInstall = () => {
        if (typeof window !== 'undefined') {
            const isPopup = window.location.search.includes('do=pop')
            if (!isPopup) {
                const sep = window.location.search ? '&' : '?'
                window.open(`${window.location.pathname}${window.location.search}${sep}do=pop`, '_blank', 'width=400,height=600')
            }
        }
    }

    // Получаем единицу веса для отображения
    const weightUnit = values.weight_unit as string || 'lb'
    // Используем символы единиц (lb, kg, st) вместо локализованных названий для избежания склонений
    const weightUnitLabel = weightUnit === 'kg' ? 'kg' : weightUnit === 'lb' ? 'lb' : weightUnit === 'st' ? 'st' : weightUnit

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
                                {fieldConfig?.label || t.labels.age}
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={fieldConfig?.placeholder || '25'}
                                min={fieldConfig?.min || 2}
                                max={fieldConfig?.max || 120}
                                value={values.age !== undefined && values.age !== '' ? String(values.age) : ''}
                                onChange={(e) => handleChange('age', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
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
                    // Fallback опции, если fieldConfig не найден
                    const genderOptions = fieldConfig?.options || [
                        { value: 'male', label: t.genderOptions.male },
                        { value: 'female', label: t.genderOptions.female }
                    ]
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {fieldConfig?.label || t.labels.gender}
                            </label>
                            <div className="flex gap-2">
                                {genderOptions.map((opt: any) => {
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

                {/* Height Unit - только cm и ft / in */}
                {(() => {
                    const fieldConfig = getFieldConfig('height_unit')
                    const allOptions = fieldConfig?.options || [
                        { value: 'cm', label: 'cm' },
                        { value: 'ft_in', label: 'ft / in' }
                    ]
                    const heightUnitOptions = allOptions.filter(
                        (opt: any) => opt.value === 'cm' || opt.value === 'ft_in'
                    )
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {fieldConfig?.label || t.labels.height_unit}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {heightUnitOptions.map((opt: any) => {
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
                                {fieldConfig?.label || t.labels.height}
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={fieldConfig?.placeholder || '70'}
                                value={values.height_value !== undefined && values.height_value !== '' ? String(values.height_value) : ''}
                                onChange={(e) => handleChange('height_value', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
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
                                        {fieldConfig?.label || t.labels.height_ft}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={fieldConfig?.placeholder || '5'}
                                        value={values.height_ft !== undefined && values.height_ft !== '' ? String(values.height_ft) : ''}
                                        onChange={(e) => handleChange('height_ft', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        })()}
                        {(() => {
                            const fieldConfig = getFieldConfig('height_in')
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {fieldConfig?.label || t.labels.height_in}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={fieldConfig?.placeholder || '10'}
                                        min={fieldConfig?.min || 0}
                                        max={fieldConfig?.max || 11}
                                        value={values.height_in !== undefined && values.height_in !== '' ? String(values.height_in) : ''}
                                        onChange={(e) => handleChange('height_in', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        })()}
                    </div>
                )}

                {/* Weight Unit - кнопки выбора */}
                {(() => {
                    const fieldConfig = getFieldConfig('weight_unit')
                    // Fallback опции, если fieldConfig не найден
                    const weightUnitOptions = fieldConfig?.options || [
                        { value: 'kg', label: 'kg' },
                        { value: 'lb', label: 'lb' },
                        { value: 'st', label: 'st' }
                    ]
                    return (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {fieldConfig?.label || t.labels.weight_unit}
                            </label>
                            <div className="flex gap-2">
                                {weightUnitOptions.map((opt: any) => {
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
                                {fieldConfig?.label || t.labels.weight}
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={fieldConfig?.placeholder || '160'}
                                value={values.weight_value !== undefined && values.weight_value !== '' ? String(values.weight_value) : ''}
                                onChange={(e) => handleChange('weight_value', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    )
                })()}

                {/* Кнопки действий */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleCalculate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                    >
                        {translations.calculate}
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                    >
                        {translations.clear}
                    </button>
                </div>
            </div>

            {/* BOTTOM SECTION: Результат */}
            {Object.keys(result).length > 0 && (
                <div className="border-t border-gray-200 pt-6" data-bmi-result>
                    {/* Header Result — цвет как у сегментов чарта */}
                    {(() => {
                        const status = result.bmi_status as string
                        const chartColors: Record<string, { bg: string; hover: string }> = {
                            underweight: { bg: '#bc2020', hover: '#9a1a1a' },
                            normal: { bg: '#008137', hover: '#006b2e' },
                            overweight: { bg: '#ffe400', hover: '#e6ce00' },
                            obesity: { bg: '#8a0101', hover: '#6b0101' }
                        }
                        const colors = chartColors[status] || chartColors.normal
                        const isLight = status === 'overweight'
                        return (
                            <div
                                className="px-5 py-3 rounded-t-lg -mx-5 -mt-6 mb-4 flex justify-between items-center transition-colors"
                                style={{ backgroundColor: colors.bg }}
                            >
                                <h3 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                    {t.result.title}
                                </h3>
                                <button
                                    onClick={handleSave}
                                    className="flex flex-col items-center gap-0.5 text-sm px-2 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
                                    style={{ color: isLight ? '#1f2937' : '#fff' }}
                                    title={t.buttons.save_image || 'Save as Image'}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586L8.707 7.293zM3 9a2 2 0 012-2h1a1 1 0 010 2H5v7h10v-7h-1a1 1 0 110-2h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                    <span className="text-xs">{t.buttons.save || 'Save'}</span>
                                </button>
                            </div>
                        )
                    })()}

                    {/* BMI и статус */}
                    <div className="mb-4 text-center">
                        <p className="text-lg font-semibold text-gray-900">
                            BMI = {typeof result.bmi === 'number' ? result.bmi.toFixed(1) : result.bmi} kg/m² ({getStatusLabel()})
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

                    {/* Сообщение - цвет зависит от статуса */}
                    {getMessage() && (() => {
                        const status = result.bmi_status as string
                        let bgColor = 'bg-green-50 border-green-200'
                        if (status === 'underweight') {
                            bgColor = 'bg-red-50 border-red-200'
                        } else if (status === 'overweight') {
                            bgColor = 'bg-yellow-50 border-yellow-200'
                        } else if (status === 'obesity') {
                            bgColor = 'bg-red-100 border-red-300'
                        }
                        return (
                            <div className={`${bgColor} border rounded-lg p-4 mb-4`}>
                                <p className="text-sm text-gray-800">{getMessage()}</p>
                            </div>
                        )
                    })()}

                </div>
            )}

            {/* Footer — как в других калькуляторах */}
            <div className="mt-5">
                <Link
                    href={`/${lang}/contact`}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm block"
                >
                    {translations.suggest}
                </Link>
                <button
                    onClick={handleInstall}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm block mt-2 cursor-pointer text-left"
                    type="button"
                    style={{ background: 'none', border: 'none', padding: 0 }}
                >
                    {translations.downloadWidget}
                </button>
                <Link
                    href={toolSlug ? `/${lang}/widget/${toolSlug}` : `/${lang}/widget`}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm block text-center mt-[50px]"
                >
                    {translations.getWidget}
                </Link>
            </div>

            <div className="mt-5 text-right" style={{ marginTop: '20px' }}>
                <Link href={`/${lang}`} className="logo-widget inline-block">
                    <Image
                        src="/calculatorscope-logo.svg"
                        alt="Calculator Scope"
                        width={90}
                        height={90}
                        className="object-contain inline-block"
                    />
                </Link>
            </div>
            </div>
        </div>
    )
}
