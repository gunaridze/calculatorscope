'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { calculate, type JsonEngineConfig, type JsonEngineInput, type JsonEngineOutput } from '@/core/engines/json'

type Props = {
    config: JsonEngineConfig
    interface: any  // Переводы (Labels) из БД
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
        installPrompt: string
    }
    toolSlug?: string
}

export default function TextCaseConverterWidget({
    config,
    interface: ui,
    initialValues,
    h1,
    lang,
    toolId,
    h1En,
    translations,
    toolSlug
}: Props) {
    // Получаем конфигурацию полей из inputs_json
    const getFieldConfig = (key: string) => {
        if (Array.isArray(ui?.inputs)) {
            return ui.inputs.find((f: any) => f.name === key)
        }
        return ui?.inputs?.[key]
    }

    const textConfig = getFieldConfig('text')
    const modeConfig = getFieldConfig('mode')

    // Опции для режимов
    const modeOptions = modeConfig?.options || []

    // Инициализация значений
    const getInitialValues = (): JsonEngineInput => {
        const defaults: JsonEngineInput = {}
        config.inputs.forEach((inp) => {
            if (inp.default !== undefined) {
                defaults[inp.key] = inp.default
            }
        })
        return { ...defaults, ...(initialValues || {}) }
    }

    const [values, setValues] = useState<JsonEngineInput>(getInitialValues())
    const [result, setResult] = useState<JsonEngineOutput>({})
    const [copied, setCopied] = useState(false)

    // Применяем initialValues при изменении
    useEffect(() => {
        if (initialValues) {
            setValues((prev) => ({ ...prev, ...initialValues }))
        }
    }, [initialValues])

    // Обработка ввода текста
    const handleTextChange = (text: string) => {
        setValues((prev) => ({ ...prev, text }))
    }

    // Обработка выбора режима и мгновенный расчет
    const handleModeSelect = (mode: string) => {
        // Если текста нет, ничего не делаем
        if (!values.text || String(values.text).trim() === '') {
            setValues((prev) => ({ ...prev, mode }))
            return
        }

        const newValues = { ...values, mode }
        
        // Мгновенный расчет
        const calculated = calculate(config, newValues)
        setResult(calculated)
        
        // Обновляем текст результатом
        if (calculated.result) {
            setValues((prev) => ({ ...prev, text: String(calculated.result), mode }))
        } else {
            setValues((prev) => ({ ...prev, mode }))
        }
    }

    // Очистка формы
    const handleClear = () => {
        const defaults: JsonEngineInput = {}
        config.inputs.forEach((inp) => {
            if (inp.default !== undefined) {
                defaults[inp.key] = inp.default
            }
        })
        setValues(defaults)
        setResult({})
    }

    // Копирование результата
    const handleCopy = async () => {
        const textToCopy = values.text !== undefined ? String(values.text) : ''
        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }
    }

    // Сохранение в файл
    const handleSave = () => {
        const textToSave = values.text !== undefined ? String(values.text) : ''
        if (!textToSave) return

        const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'text-case-converted.txt'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    // Текущий текст для отображения
    const displayText = values.text !== undefined ? String(values.text) : ''

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            {/* Header Виджета */}
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            {/* Тело Виджета */}
            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                {/* Большое текстовое поле */}
                <div className="mb-0">
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        rows={8}
                        placeholder={textConfig?.placeholder || 'Добавьте текст...'}
                        value={displayText}
                        onChange={(e) => handleTextChange(e.target.value)}
                    />
                </div>

                {/* Панель действий (прикреплена к textarea) */}
                <div className="flex gap-2 -mt-1 mb-4 border-t border-gray-200 pt-2">
                    <button
                        onClick={handleClear}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        {translations.clear}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`flex-1 font-medium py-2 px-4 rounded-md transition-colors text-sm ${
                            copied
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {copied ? 'Copied!' : translations.copy}
                    </button>
                </div>

                {/* Заголовок "В формат:" */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                        {modeConfig?.label || 'To format:'}
                    </label>
                </div>

                {/* Вертикальный список кнопок режимов */}
                <div className="space-y-2 mb-4">
                    {modeOptions.map((option: any) => {
                        const isActive = values.mode === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleModeSelect(option.value)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md border transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>

                {/* Logo */}
                <div className="mt-5 text-right" style={{ marginTop: '20px' }}>
                    <Link
                        href={`/${lang}`}
                        className="logo-widget inline-block"
                    >
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
