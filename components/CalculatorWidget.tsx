'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { calculate, type JsonEngineConfig, type JsonEngineInput, type JsonEngineOutput } from '@/core/engines/json'

type Props = {
    config: JsonEngineConfig
    interface: any  // Переводы (Labels) из БД
    initialValues?: JsonEngineInput  // Для share links
    h1: string  // Заголовок для header виджета
    lang: string
    translations: {
        clear: string
        calculate: string
        result: string
        copy: string
        suggest: string
        getWidget: string
    }
    widgetPageSlug?: string  // Slug страницы виджета (id105)
}

export default function CalculatorWidget({ 
    config, 
    interface: ui, 
    initialValues,
    h1,
    lang,
    translations,
    widgetPageSlug
}: Props) {
    // Храним значения всех инпутов
    const [values, setValues] = useState<JsonEngineInput>(initialValues || {})
    const [result, setResult] = useState<JsonEngineOutput>({})
    const [copied, setCopied] = useState(false)

    // Применяем query params из URL (клиент-side)
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
                    }
                }
            })

            if (Object.keys(urlValues).length > 0) {
                setValues((prev) => {
                    const newValues = { ...prev, ...urlValues }
                    // Автоматически считаем при загрузке с query params
                    const calculated = calculate(config, newValues)
                    setResult(calculated)
                    return newValues
                })
            }
        }
    }, [config])

    // Обработка ввода
    const handleChange = (key: string, val: string | number) => {
        setValues((prev) => ({ ...prev, [key]: val }))
    }
    
    // Проверка условия отображения поля
    const shouldShowField = (fieldConfig: any): boolean => {
        if (!fieldConfig.showCondition) return true
        
        const { field, operator, value } = fieldConfig.showCondition
        const fieldValue = values[field]
        
        switch (operator) {
            case 'equals':
                return String(fieldValue) === String(value)
            case 'notEquals':
                return String(fieldValue) !== String(value)
            default:
                return true
        }
    }

    // Главная функция расчета через единый движок
    const handleCalculate = () => {
        const calculated = calculate(config, values)
        setResult(calculated)
    }

    // Очистка формы
    const handleClear = () => {
        setValues({})
        setResult({})
    }

    // Копирование результата
    const handleCopy = () => {
        if (Object.keys(result).length === 0) return
        
        // Формируем текст результата
        const resultText = config.outputs.map((out) => {
            const label = ui?.outputs?.[out.key]?.label || out.key
            const value = typeof result[out.key] === 'number'
                ? (result[out.key] as number).toFixed(out.precision || 2)
                : result[out.key]
            return `${label}: ${value}`
        }).join('\n')

        navigator.clipboard.writeText(resultText).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    // Формируем текст результата для отображения
    const getResultText = (): string => {
        if (Object.keys(result).length === 0) return ''
        
        return config.outputs.map((out) => {
            const value = typeof result[out.key] === 'number'
                ? (result[out.key] as number).toFixed(out.precision || 2)
                : String(result[out.key])
            return value
        }).join('\n')
    }

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            {/* Header Виджета */}
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            {/* Тело Калькулятора */}
            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                {/* INPUTS */}
                <div className="space-y-4 mb-4">
                    {config.inputs.map((inp) => {
                        // Получаем конфигурацию поля из inputs_json
                        const fieldConfig = Array.isArray(ui?.inputs) 
                            ? ui.inputs.find((f: any) => f.name === inp.key)
                            : ui?.inputs?.[inp.key]
                        
                        // Проверяем условие отображения
                        if (!shouldShowField(fieldConfig || {})) {
                            return null
                        }
                        
                        const fieldType = fieldConfig?.type || 'number'
                        const label = fieldConfig?.label || inp.key
                        const placeholder = fieldConfig?.placeholder || (fieldType === 'number' ? '0' : '')
                        
                        return (
                            <div key={inp.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {label}
                                </label>
                                
                                {fieldType === 'select' && fieldConfig?.options ? (
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => handleChange(inp.key, e.target.value)}
                                        value={values[inp.key] !== undefined ? String(values[inp.key]) : (inp.default !== undefined ? String(inp.default) : '')}
                                    >
                                        {fieldConfig.options.map((opt: any) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : fieldType === 'text' ? (
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={placeholder}
                                        onChange={(e) => handleChange(inp.key, e.target.value)}
                                        value={values[inp.key] !== undefined ? String(values[inp.key]) : (inp.default !== undefined ? String(inp.default) : '')}
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={placeholder}
                                        onChange={(e) => handleChange(inp.key, e.target.value)}
                                        value={values[inp.key] !== undefined ? String(values[inp.key]) : (inp.default !== undefined ? String(inp.default) : '')}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Action Row */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={handleClear}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {translations.clear}
                    </button>
                    <button
                        onClick={handleCalculate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        {translations.calculate}
                    </button>
                </div>

                {/* Result Box */}
                <div 
                    className="border border-gray-300 rounded-md relative mx-auto"
                    style={{ width: '370px', maxWidth: '100%', minHeight: '150px' }}
                >
                    {/* Top Row: Label and Copy Button */}
                    <div className="flex justify-between items-center p-2 border-b border-gray-300 bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">{translations.result}</span>
                        <button
                            onClick={handleCopy}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                            disabled={Object.keys(result).length === 0}
                        >
                            {copied ? '✓' : translations.copy}
                        </button>
                    </div>
                    
                    {/* Result Content */}
                    <div className="p-4" style={{ paddingBottom: '20px' }}>
                        {Object.keys(result).length > 0 ? (
                            <div className="space-y-2">
                                {config.outputs.map((out) => (
                                    <div key={out.key} className="text-gray-800 whitespace-pre-wrap">
                                        {typeof result[out.key] === 'number'
                                            ? (result[out.key] as number).toFixed(out.precision || 2)
                                            : String(result[out.key])}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">—</div>
                        )}
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-5">
                    <Link 
                        href={`/${lang}/contact`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm block"
                    >
                        {translations.suggest}
                    </Link>
                    
                    {widgetPageSlug && (
                        <Link 
                            href={`/${lang}/${widgetPageSlug}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm block text-center mt-[50px]"
                        >
                            {translations.getWidget}
                        </Link>
                    )}
                </div>

                {/* Logo */}
                <div className="absolute bottom-[15px] right-[15px]">
                    <Image
                        src="/calculatorscope-logo.svg"
                        alt="Calculator Scope"
                        width={90}
                        height={90}
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    )
}

