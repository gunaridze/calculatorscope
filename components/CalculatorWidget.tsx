'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
        // Новые переводы для UI
        inputLabel: string
        formatLabel: string
        wordsOption: string
        checkWritingOption: string
        currencyOption: string
        currencyVatOption: string
        letterCaseLabel: string
        lowercaseOption: string
        uppercaseOption: string
        titleCaseOption: string
        sentenceCaseOption: string
        plusVat: string
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
    // Инициализируем с default значениями из config
    const getInitialValues = (): JsonEngineInput => {
        const defaults: JsonEngineInput = {}
        config.inputs.forEach((inp) => {
            if (inp.default !== undefined) {
                defaults[inp.key] = inp.default
            }
        })
        return { ...defaults, ...(initialValues || {}) }
    }
    // Инициализируем state с default значениями
    const defaultValues = getInitialValues()
    const [values, setValues] = useState<JsonEngineInput>(defaultValues)
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
                    urlValues[inp.key] = paramValue
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
        // Используем функциональное обновление для немедленного применения изменений
        setValues((prev) => {
            return { ...prev, [key]: val }
        })
    }
    
    // Обработка изменения radio button - отдельная функция для гарантированного обновления
    const handleRadioChange = useCallback((value: string) => {
        // Используем функциональное обновление для немедленного применения
        // Важно: создаем полностью новый объект для гарантированного обновления React
        setValues((prev) => {
            return {
                ...prev,
                conversionMode: value
            }
        })
    }, [])

    // Главная функция расчета через единый движок
    const handleCalculate = () => {
        // Удаляем пробелы из inputNumber перед расчетом
        const cleanedValues = { ...values }
        if (cleanedValues.inputNumber) {
            cleanedValues.inputNumber = String(cleanedValues.inputNumber).replace(/\s/g, '')
            setValues(cleanedValues)
        }
        const calculated = calculate(config, cleanedValues)
        setResult(calculated)
    }

    // Очистка формы
    const handleClear = () => {
        // При очистке сохраняем default значения
        const defaults: JsonEngineInput = {}
        config.inputs.forEach((inp) => {
            if (inp.default !== undefined) {
                defaults[inp.key] = inp.default
            }
        })
        setValues(defaults)
        setResult({})
    }

    // Копирование результата - только видимый текст
    const handleCopy = () => {
        if (Object.keys(result).length === 0) return
        
        // Копируем только textResult (видимый текст)
        const resultText = result.textResult ? String(result.textResult) : ''
        
        if (resultText) {
            navigator.clipboard.writeText(resultText).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
        }
    }

    // Получаем текущий режим конвертации из state
    // Используем значение напрямую из values, если его нет - из default
    // Важно: проверяем явно на undefined и null, чтобы React видел изменения
    const currentConversionMode = (values.conversionMode !== undefined && values.conversionMode !== null && values.conversionMode !== '')
        ? String(values.conversionMode)
        : String(config.inputs.find(i => i.key === 'conversionMode')?.default ?? 'words')
    const conversionMode = currentConversionMode
    
    // Получаем конфигурацию полей из inputs_json
    const getFieldConfig = (key: string) => {
        if (Array.isArray(ui?.inputs)) {
            return ui.inputs.find((f: any) => f.name === key)
        }
        return ui?.inputs?.[key]
    }

    const inputNumberConfig = getFieldConfig('inputNumber')
    const currencyConfig = getFieldConfig('currency')
    const vatRateConfig = getFieldConfig('vatRate')
    const textCaseConfig = getFieldConfig('textCase')

    // Валюты для dropdown
    const currencies = currencyConfig?.options || [
        { value: 'USD', label: 'USD' },
        { value: 'GBP', label: 'GBP' },
        { value: 'EUR', label: 'EUR' },
        { value: 'PLN', label: 'PLN' },
        { value: 'RUB', label: 'RUB' }
    ]

    // Опции для Letter Case
    const textCaseOptions = textCaseConfig?.options || [
        { value: 'lowercase', label: translations.lowercaseOption },
        { value: 'UPPERCASE', label: translations.uppercaseOption },
        { value: 'Title Case', label: translations.titleCaseOption },
        { value: 'Sentence case', label: translations.sentenceCaseOption }
    ]

    // Получаем текст результата для отображения
    const resultText = result.textResult ? String(result.textResult) : ''

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            {/* Header Виджета */}
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            {/* Тело Калькулятора */}
            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                {/* Поле ввода числа */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {translations.inputLabel}
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={inputNumberConfig?.placeholder || "Enter number"}
                        onChange={(e) => handleChange('inputNumber', e.target.value)}
                        value={values.inputNumber !== undefined ? String(values.inputNumber) : ''}
                    />
                </div>

                {/* Заголовок "To:" */}
                <div className="mt-[15px] mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {translations.formatLabel}
                    </label>
                </div>

                {/* Radio Buttons для выбора формата */}
                <div className="space-y-[15px] mb-4">
                    {/* Words */}
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="mode-words"
                            name="conversionMode"
                            value="words"
                            checked={conversionMode === 'words'}
                            onChange={(e) => handleRadioChange(e.target.value)}
                            className="mr-2 cursor-pointer"
                        />
                        <label htmlFor="mode-words" className="text-sm text-gray-700 cursor-pointer">
                            {translations.wordsOption}
                        </label>
                    </div>

                    {/* Currency */}
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="mode-currency"
                            name="conversionMode"
                            value="currency"
                            checked={conversionMode === 'currency'}
                            onChange={(e) => handleRadioChange(e.target.value)}
                            className="mr-2 cursor-pointer"
                        />
                        <label htmlFor="mode-currency" className="text-sm text-gray-700 mr-[15px] cursor-pointer">
                            {translations.currencyOption}
                        </label>
                        <select
                            className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            style={{ width: '65px', height: '29px', paddingLeft: '8px', paddingRight: '20px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            value={values.currency !== undefined ? String(values.currency) : (config.inputs.find(i => i.key === 'currency')?.default || 'USD')}
                        >
                            {currencies.map((curr: any) => (
                                <option key={curr.value} value={curr.value}>
                                    {curr.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Currency + VAT */}
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="mode-currency-vat"
                            name="conversionMode"
                            value="currency_vat"
                            checked={conversionMode === 'currency_vat'}
                            onChange={(e) => handleRadioChange(e.target.value)}
                            className="mr-2 cursor-pointer"
                        />
                        <label htmlFor="mode-currency-vat" className="text-sm text-gray-700 mr-[15px] cursor-pointer">
                            {translations.currencyOption}
                        </label>
                        <select
                            className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            style={{ width: '65px', height: '29px', paddingLeft: '8px', paddingRight: '20px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            value={values.currency !== undefined ? String(values.currency) : (config.inputs.find(i => i.key === 'currency')?.default || 'USD')}
                        >
                            {currencies.map((curr: any) => (
                                <option key={curr.value} value={curr.value}>
                                    {curr.label}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-700 mr-[5px] ml-[5px]">{translations.plusVat}</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{1,2}"
                            maxLength={2}
                            className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-right pr-6"
                            style={{ width: '65px', height: '29px', paddingLeft: '8px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Ctext x=\'6\' y=\'9\' text-anchor=\'middle\' font-size=\'10\' fill=\'%23333\'%3E%25%3C/text%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                            placeholder="0"
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '')
                                if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
                                    handleChange('vatRate', val === '' ? 0 : parseInt(val))
                                }
                            }}
                            value={values.vatRate !== undefined && values.vatRate !== 0 ? String(values.vatRate) : ''}
                        />
                    </div>

                    {/* Check Writing */}
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="mode-check-writing"
                            name="conversionMode"
                            value="check_writing"
                            checked={conversionMode === 'check_writing'}
                            onChange={(e) => handleRadioChange(e.target.value)}
                            className="mr-2 cursor-pointer"
                        />
                        <label htmlFor="mode-check-writing" className="text-sm text-gray-700 cursor-pointer">
                            {translations.checkWritingOption}
                        </label>
                    </div>
                </div>

                {/* Letter Case */}
                <div className="flex items-center mb-4">
                    <label className="text-sm font-medium text-gray-700 mr-[15px]">
                        {translations.letterCaseLabel}
                    </label>
                    <select
                        className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ width: '180px', height: '29px', paddingLeft: '8px', paddingRight: '20px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                        onChange={(e) => handleChange('textCase', e.target.value)}
                        value={values.textCase !== undefined ? String(values.textCase) : (config.inputs.find(i => i.key === 'textCase')?.default || 'Sentence case')}
                    >
                        {textCaseOptions.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
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
                            disabled={!resultText}
                        >
                            {copied ? '✓' : translations.copy}
                        </button>
                    </div>
                    
                    {/* Result Content */}
                    <div className="p-4" style={{ paddingBottom: '20px' }}>
                        {resultText ? (
                            <div className="text-gray-800 whitespace-pre-wrap">
                                {resultText}
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
