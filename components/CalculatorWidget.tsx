'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { calculate, type JsonEngineConfig, type JsonEngineInput, type JsonEngineOutput } from '@/core/engines/json'
import TextCaseConverterWidget from './tools/TextCaseConverterWidget'
import BMICalculatorWidget from './tools/BMICalculatorWidget'
import CountdownTimerWidget from './tools/CountdownTimerWidget'
import StopwatchWidget from './tools/StopwatchWidget'
import CurrencyConverterWidget from './tools/CurrencyConverterWidget'

type Props = {
    config: JsonEngineConfig
    interface: any  // Переводы (Labels) из БД
    outputs?: any  // outputs_json из БД: [{name, label, unit, precision}] — для калькуляторов с несколькими результатами
    initialValues?: JsonEngineInput  // Для share links
    h1: string  // Заголовок для header виджета
    lang: string
    toolId?: string  // ID инструмента для аналитики
    h1En?: string  // H1 на английском языке для аналитики
    translations: {
        clear: string
        calculate: string
        result: string
        copy: string
        suggest: string
        getWidget: string
        // Новые переводы для UI
        inputLabel: string
        inputPlaceholder: string
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
        downloadWidget: string
        installPrompt: string
    }
    widgetPageSlug?: string  // Slug страницы виджета (id105) - устаревший, используйте toolSlug
    toolSlug?: string  // Slug инструмента для генерации ссылки на виджет
}

export default function CalculatorWidget({
    config,
    interface: ui,
    outputs,
    initialValues,
    h1,
    lang,
    toolId,
    h1En,
    translations,
    widgetPageSlug,
    toolSlug
}: Props) {
    // Для tool_id=1002 используем специальный компонент TextCaseConverterWidget
    if (toolId === '1002' || String(toolId) === '1002') {
        return (
            <TextCaseConverterWidget
                config={config}
                interface={ui}
                initialValues={initialValues}
                h1={h1}
                lang={lang}
                toolId={toolId}
                h1En={h1En}
                translations={translations}
                toolSlug={toolSlug}
            />
        )
    }

    // Для tool_id=1003 используем специальный компонент BMICalculatorWidget
    if (toolId === '1003' || String(toolId) === '1003') {
        return (
            <BMICalculatorWidget
                config={config}
                interface={ui}
                initialValues={initialValues}
                h1={h1}
                lang={lang}
                toolId={toolId}
                h1En={h1En}
                translations={translations}
                toolSlug={toolSlug}
            />
        )
    }
    // Для tool_id=1120 используем специальный компонент CountdownTimerWidget (живой тикающий таймер)
    if (toolId === '1120' || String(toolId) === '1120') {
        return (
            <CountdownTimerWidget
                config={config}
                interface={ui}
                initialValues={initialValues}
                h1={h1}
                lang={lang}
                toolId={toolId}
                h1En={h1En}
                translations={translations}
                toolSlug={toolSlug}
            />
        )
    }

    // Для tool_id=1126 используем специальный компонент StopwatchWidget (живой секундомер)
    if (toolId === '1126' || String(toolId) === '1126') {
        return (
            <StopwatchWidget
                config={config}
                interface={ui}
                initialValues={initialValues}
                h1={h1}
                lang={lang}
                toolId={toolId}
                h1En={h1En}
                translations={translations}
                toolSlug={toolSlug}
            />
        )
    }

    // Для tool_id=1156 используем специальный компонент CurrencyConverterWidget (живые курсы валют)
    if (toolId === '1156' || String(toolId) === '1156') {
        return (
            <CurrencyConverterWidget
                config={config}
                interface={ui}
                initialValues={initialValues}
                h1={h1}
                lang={lang}
                toolId={toolId}
                h1En={h1En}
                translations={translations}
                toolSlug={toolSlug}
            />
        )
    }

    // Храним значения всех инпутов
    // Инициализируем с default значениями из config
    const getInitialValues = (): JsonEngineInput => {
        const defaults: JsonEngineInput = {}
        const uiInputs = Array.isArray(ui) ? ui : undefined
        const todayStr = new Date().toISOString().slice(0, 10)
        config.inputs.forEach((inp) => {
            // Локальный дефолт (например, своя ставка НДС для языка) переопределяет общий config.inputs[].default
            const fieldConfig = uiInputs?.find((f: any) => f.name === inp.key)
            const localeOverride = fieldConfig?.default
            let value = localeOverride !== undefined ? localeOverride : inp.default
            // Специальное значение "today" для полей type: 'date' - подставляем реальную
            // текущую дату вместо статичного значения, зафиксированного при сидировании
            if (fieldConfig?.type === 'date' && value === 'today') {
                value = todayStr
            }
            if (value !== undefined) {
                defaults[inp.key] = value
            }
        })
        
        // Обязательно устанавливаем conversionMode, если его нет
        if (defaults.conversionMode === undefined) {
            defaults.conversionMode = 'words'
        }
        
        return { ...defaults, ...(initialValues || {}) }
    }
    
    // Инициализируем state с default значениями
    const defaultValues = getInitialValues()
    const [values, setValues] = useState<JsonEngineInput>(defaultValues)
    const [result, setResult] = useState<JsonEngineOutput>({})
    const [copied, setCopied] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstallable, setIsInstallable] = useState(false)

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
                    // Гарантируем, что conversionMode всегда есть
                    if (newValues.conversionMode === undefined || newValues.conversionMode === null || newValues.conversionMode === '') {
                        newValues.conversionMode = prev.conversionMode || config.inputs.find(i => i.key === 'conversionMode')?.default || 'words'
                    }
                    // Автоматически считаем при загрузке с query params
                    const calculated = calculate(config, newValues)
                    setResult(calculated)
                    return newValues
                })
            }
        }
    }, [config])

    // Отслеживание загрузки виджета в Google Analytics
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Получаем referrer (URL страницы, с которой открыт виджет)
            const referrer = document.referrer || window.location.href
            
            // Отправляем событие в Google Analytics через dataLayer
            if ((window as any).dataLayer) {
                (window as any).dataLayer.push({
                    event: 'widget_load',
                    eventCategory: 'Widget',
                    eventAction: 'Widget Loaded',
                    eventLabel: h1 || 'Unknown Widget',
                    widgetToolId: toolId || 'unknown',
                    widgetH1: h1 || 'Unknown',
                    widgetH1En: h1En || h1 || 'Unknown',
                    widgetLang: lang,
                    widgetReferrer: referrer,
                    widgetUrl: window.location.href
                })
            }
        }
    }, [toolId, h1, h1En, lang])

    // PWA Install Prompt - обработка beforeinstallprompt
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleBeforeInstallPrompt = (e: Event) => {
                e.preventDefault()
                console.log('beforeinstallprompt event fired')
                setDeferredPrompt(e)
                setIsInstallable(true)
            }

            // Проверяем, может ли страница быть установлена
            if ((window as any).navigator && (window as any).navigator.standalone) {
                // iOS - уже установлено
                console.log('PWA already installed (iOS standalone mode)')
            } else if (window.matchMedia('(display-mode: standalone)').matches) {
                // Уже установлено в standalone режиме
                console.log('PWA already installed (standalone mode)')
            } else {
                // Слушаем событие beforeinstallprompt
                window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
                console.log('Waiting for beforeinstallprompt event...')
            }

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            }
        }
    }, [])

    // Обработка ввода
    const handleChange = (key: string, val: string | number) => {
        // Используем функциональное обновление для немедленного применения изменений
        setValues((prev) => {
            return { ...prev, [key]: val }
        })
    }
    
    // Обработка изменения radio button - упрощенная функция без useCallback
    const handleRadioChange = (value: string) => {
        setValues((prev) => ({
            ...prev,
            conversionMode: value
        }))
    }

    // Главная функция расчета через единый движок
    const handleCalculate = () => {
        const cleanedValues = { ...values }
        // Удаляем пробелы из inputNumber перед расчетом (только для number-to-words)
        if (cleanedValues.inputNumber) {
            cleanedValues.inputNumber = String(cleanedValues.inputNumber).replace(/\s/g, '')
            setValues(cleanedValues)
        }
        const calculated = calculate(config, cleanedValues)
        setResult(calculated)
    }

    // Очистка формы
    const handleClear = () => {
        // При очистке сохраняем default значения, включая conversionMode
        const defaults: JsonEngineInput = {}
        const uiInputsForClear = Array.isArray(ui) ? ui : undefined
        const todayStrForClear = new Date().toISOString().slice(0, 10)
        config.inputs.forEach((inp) => {
            const fieldConfig = uiInputsForClear?.find((f: any) => f.name === inp.key)
            const localeOverride = fieldConfig?.default
            let value = localeOverride !== undefined ? localeOverride : inp.default
            if (fieldConfig?.type === 'date' && value === 'today') {
                value = todayStrForClear
            }
            if (value !== undefined) {
                defaults[inp.key] = value
            }
        })
        // Гарантируем, что conversionMode всегда есть
        if (defaults.conversionMode === undefined) {
            defaults.conversionMode = 'words'
        }
        setValues(defaults)
        setResult({})
    }

    // Форматирует одно значение output с учетом precision и unit
    // out.unitFrom позволяет брать единицу измерения динамически из значения другого поля
    // (например, из выбора валюты USD/EUR), а не из статичной строки out.unit
    const formatOutputValue = (out: any): string | null => {
        const raw = result[out.name]
        if (raw === undefined || raw === null) return null

        let formatted: string
        if (typeof raw === 'number') {
            const precision = out.precision !== undefined ? out.precision : 2
            const fixed = raw.toFixed(precision)
            // Если дробная часть после округления состоит из одних нулей дальше 2 знаков
            // (например "1000.000000"), обрезаем до 2 знаков ("1000.00") вместо того, чтобы
            // всегда показывать полную заданную точность
            if (precision > 2 && fixed.includes('.')) {
                const [intPart, decPart] = fixed.split('.')
                const trimmed = decPart.replace(/0+$/, '')
                formatted = trimmed.length >= 2 ? `${intPart}.${trimmed}` : `${intPart}.${decPart.slice(0, 2)}`
            } else {
                formatted = fixed
            }
        } else {
            formatted = String(raw)
        }

        let unit = out.unitFrom ? values[out.unitFrom] : out.unit
        // Для полей вроде "to_unit" в конвертерах единиц измерения показываем короткое
        // отображаемое сокращение (option.abbr), а не сырое внутреннее значение опции
        // (например "gallon_us_fluid") - если сокращение не задано (как у валютных
        // селектов '$'/'€'), используем значение как раньше
        if (out.unitFrom) {
            const uiInputs = Array.isArray(ui) ? ui : undefined
            const sourceField = uiInputs?.find((f: any) => f.name === out.unitFrom)
            const matchedOption = sourceField?.options?.find((o: any) => o.value === values[out.unitFrom])
            if (matchedOption?.abbr) {
                unit = matchedOption.abbr
            }
        }
        return `${formatted}${unit ? ` ${unit}` : ''}`
    }

    // Копирование результата - только видимый текст
    const handleCopy = () => {
        if (Object.keys(result).length === 0) return

        // Для калькуляторов с несколькими результатами копируем все строки
        const resultText = hasMultipleOutputs
            ? outputsConfig
                .map((out) => {
                    const value = formatOutputValue(out)
                    return value ? `${out.label || out.name}: ${value}` : null
                })
                .filter(Boolean)
                .join('\n')
            : (result.result ? String(result.result) : (result.textResult ? String(result.textResult) : ''))

        if (resultText) {
            navigator.clipboard.writeText(resultText).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
        }
    }

    // Установка PWA
    const handleInstall = async () => {
        console.log('handleInstall called, deferredPrompt:', !!deferredPrompt, 'isInstallable:', isInstallable)
        
        if (!deferredPrompt) {
            // Если prompt недоступен, перенаправляем на popup страницу, где можно установить PWA
            if (typeof window !== 'undefined') {
                console.log('PWA install prompt not available')
                
                // Проверяем, не в popup ли мы уже
                const isPopup = window.location.search.includes('do=pop')
                
                if (!isPopup) {
                    // Если не в popup, открываем popup страницу
                    const popupUrl = toolSlug 
                        ? `/${lang}/${toolSlug}?do=pop`
                        : `/${lang}?do=pop`
                    
                    // Отслеживание попытки установки без доступного prompt
                    if ((window as any).dataLayer) {
                        (window as any).dataLayer.push({
                            event: 'pwa_install_attempt',
                            eventCategory: 'Widget',
                            eventAction: 'PWA Install Attempt',
                            eventLabel: 'Redirecting to Popup',
                            widgetToolId: toolId || 'unknown',
                            widgetH1: h1 || 'Unknown',
                            widgetH1En: h1En || h1 || 'Unknown',
                            widgetLang: lang
                        })
                    }
                    
                    // Открываем в новом окне для установки PWA
                    window.open(popupUrl, '_blank', 'width=400,height=600')
                } else {
                    // Уже в popup, показываем инструкции
                    console.log('Already in popup mode, PWA install prompt not available')
                    // Можно показать сообщение о том, что установка недоступна или инструкции
                    // Но лучше просто ничего не делать, так как браузер сам покажет prompt, если возможно
                }
            }
            return
        }

        try {
            console.log('Showing PWA install prompt')
            // Показываем prompt установки
            deferredPrompt.prompt()

            // Ждем ответа пользователя
            const { outcome } = await deferredPrompt.userChoice
            console.log('User choice:', outcome)

            // Отслеживание в Google Analytics
            if (typeof window !== 'undefined' && (window as any).dataLayer) {
                (window as any).dataLayer.push({
                    event: 'pwa_install_prompt',
                    eventCategory: 'Widget',
                    eventAction: 'PWA Install Prompt',
                    eventLabel: outcome === 'accepted' ? 'Installed' : 'Dismissed',
                    widgetToolId: toolId || 'unknown',
                    widgetH1: h1 || 'Unknown',
                    widgetH1En: h1En || h1 || 'Unknown',
                    widgetLang: lang
                })
            }

            // Очищаем deferredPrompt после использования
            setDeferredPrompt(null)
            setIsInstallable(false)
        } catch (error) {
            console.error('Error during PWA installation:', error)
            // Если произошла ошибка, перенаправляем на popup страницу
            if (typeof window !== 'undefined') {
                const popupUrl = toolSlug 
                    ? `/${lang}/${toolSlug}?do=pop`
                    : `/${lang}?do=pop`
                window.open(popupUrl, '_blank', 'width=400,height=600')
            }
        }
    }

    // Получаем текущий режим конвертации из state
    // Теперь conversionMode ВСЕГДА есть в values, поэтому просто берем его напрямую
    const conversionMode = String(values.conversionMode || 'words')
    
    // Получаем конфигурацию полей из inputs_json
    // ui - это массив [{name, label, type, unit, min, max, options, placeholder}, ...] из tool_i18n.inputs_json
    const getFieldConfig = (key: string) => {
        if (Array.isArray(ui)) {
            return ui.find((f: any) => f.name === key)
        }
        if (Array.isArray(ui?.inputs)) {
            return ui.inputs.find((f: any) => f.name === key)
        }
        return ui?.inputs?.[key]
    }

    // outputs_json из tool_i18n: [{name, label, unit, precision}] - для калькуляторов с несколькими результатами
    const outputsConfig: any[] = Array.isArray(outputs) ? outputs : []
    const hasMultipleOutputs = outputsConfig.length > 0

    const inputNumberConfig = getFieldConfig('inputNumber')
    const textConfig = getFieldConfig('text') // Для text case converter
    const modeConfig = getFieldConfig('mode') // Для text case converter
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

    // Опции для Mode (text case converter)
    const modeOptions = modeConfig?.options || []

    // Определяем, это text case converter или number-to-words
    const isTextCaseConverter = config.inputs.some((inp: any) => inp.key === 'text')
    const isNumberToWords = config.inputs.some((inp: any) => inp.key === 'inputNumber')

    // Получаем текст результата для отображения
    const resultText = result.result ? String(result.result) : (result.textResult ? String(result.textResult) : '')

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            {/* Header Виджета */}
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            {/* Тело Калькулятора */}
            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                {/* Универсальное поле ввода - поддерживает text, textarea, select */}
                {isTextCaseConverter ? (
                    <>
                        {/* Поле ввода текста (textarea для text case converter) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {textConfig?.label || 'Add text:'}
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                rows={4}
                                placeholder={textConfig?.placeholder || 'Enter your text here...'}
                                onChange={(e) => handleChange('text', e.target.value)}
                                value={values.text !== undefined ? String(values.text) : ''}
                            />
                        </div>
                        {/* Выбор режима регистра */}
                        {modeConfig && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {modeConfig.label || 'To format:'}
                                </label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={(e) => handleChange('mode', e.target.value)}
                                    value={values.mode !== undefined ? String(values.mode) : (config.inputs.find((i: any) => i.key === 'mode')?.default || 'lower')}
                                >
                                    {modeOptions.map((option: any) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                ) : isNumberToWords ? (
                    <>
                        {/* Поле ввода числа (для number-to-words) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {translations.inputLabel}
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={inputNumberConfig?.placeholder || translations.inputPlaceholder}
                                onChange={(e) => handleChange('inputNumber', e.target.value)}
                                value={values.inputNumber !== undefined ? String(values.inputNumber) : ''}
                            />
                        </div>
                    </>
                ) : (
                    /* Универсальный рендер полей ввода по config.inputs + inputs_json (для всех остальных калькуляторов) */
                    <>
                        {config.inputs.map((inp) => {
                            const fieldConfig = getFieldConfig(inp.key)
                            const label = fieldConfig?.label || inp.key
                            const unit = fieldConfig?.unit
                            const isSelect = fieldConfig?.type === 'select' && Array.isArray(fieldConfig?.options)
                            const isDate = fieldConfig?.type === 'date'
                            const isText = fieldConfig?.type === 'text'
                            const currentValue = values[inp.key] !== undefined ? values[inp.key] : (inp.default ?? '')

                            return (
                                <div className="mb-4" key={inp.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {label}{unit ? ` (${unit})` : ''}
                                    </label>
                                    {isSelect ? (
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                            onChange={(e) => handleChange(inp.key, e.target.value)}
                                            value={String(currentValue)}
                                        >
                                            {fieldConfig.options.map((option: any) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : isDate ? (
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                            min={fieldConfig?.min ?? undefined}
                                            max={fieldConfig?.max ?? undefined}
                                            onChange={(e) => handleChange(inp.key, e.target.value)}
                                            value={String(currentValue)}
                                        />
                                    ) : isText ? (
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder={fieldConfig?.placeholder || ''}
                                            onChange={(e) => handleChange(inp.key, e.target.value)}
                                            value={String(currentValue)}
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder={fieldConfig?.placeholder || ''}
                                            min={fieldConfig?.min ?? undefined}
                                            max={fieldConfig?.max ?? undefined}
                                            onChange={(e) => handleChange(inp.key, e.target.value)}
                                            value={String(currentValue)}
                                        />
                                    )}
                                    {fieldConfig?.description && (
                                        <p className="text-xs text-gray-500 mt-1">{fieldConfig.description}</p>
                                    )}
                                </div>
                            )
                        })}
                    </>
                )}

                {/* Кнопки-переключатели для выбора формата (только для number-to-words) */}
                {isNumberToWords && (
                    <>
                        {/* Заголовок "To:" */}
                        <div className="mt-[15px] mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {translations.formatLabel}
                            </label>
                        </div>

                        <div className="space-y-[15px] mb-4">
                    {/* Words */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => handleRadioChange('words')}
                            className={`mr-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                conversionMode === 'words'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {translations.wordsOption}
                        </button>
                    </div>

                    {/* Currency */}
                    <div className="flex items-center flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleRadioChange('currency')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                conversionMode === 'currency'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {translations.currencyOption}
                        </button>
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
                    <div className="flex items-center flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleRadioChange('currency_vat')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                conversionMode === 'currency_vat'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {translations.currencyOption}
                        </button>
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
                        <span className="text-sm text-gray-700">{translations.plusVat}</span>
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
                        <button
                            type="button"
                            onClick={() => handleRadioChange('check_writing')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                                conversionMode === 'check_writing'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {translations.checkWritingOption}
                        </button>
                    </div>
                </div>

                        {/* Letter Case (только для number-to-words) */}
                        {isNumberToWords && (
                            <div className="flex items-center mb-4">
                                <label className="text-sm font-medium text-gray-700 mr-[15px]">
                                    {translations.letterCaseLabel}
                                </label>
                                <select
                                    className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    style={{ width: '180px', height: '29px', paddingLeft: '8px', paddingRight: '20px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                                    onChange={(e) => handleChange('textCase', e.target.value)}
                                    value={values.textCase !== undefined ? String(values.textCase) : (config.inputs.find((i: any) => i.key === 'textCase')?.default || 'Sentence case')}
                                >
                                    {textCaseOptions.map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                )}

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
                            disabled={hasMultipleOutputs ? Object.keys(result).length === 0 : !resultText}
                        >
                            {copied ? '✓' : translations.copy}
                        </button>
                    </div>

                    {/* Result Content */}
                    <div className="p-4" style={{ paddingBottom: '20px' }}>
                        {hasMultipleOutputs ? (
                            Object.keys(result).length > 0 ? (
                                <div className="space-y-2">
                                    {outputsConfig.map((out) => {
                                        const value = formatOutputValue(out)
                                        if (value === null) return null
                                        return (
                                            <div key={out.name} className="flex justify-between gap-3 text-gray-800">
                                                <span className="text-sm text-gray-600">{out.label || out.name}</span>
                                                <span className="font-semibold text-right">{value}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-sm">—</div>
                            )
                        ) : resultText ? (
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
                    
                    {/* PWA Install Button - всегда видна */}
                    <button
                        onClick={handleInstall}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm block mt-2 cursor-pointer text-left"
                        type="button"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        {translations.downloadWidget}
                    </button>
                    
                    <Link 
                        href={toolSlug ? `/${lang}/widget/${toolSlug}` : (widgetPageSlug ? `/${lang}/${widgetPageSlug}` : `/${lang}/widget`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm block text-center mt-[50px]"
                    >
                        {translations.getWidget}
                    </Link>
                </div>

                {/* Logo */}
                <div className="mt-5 text-right" style={{ marginTop: '20px' }}>
                    <Link 
                        href={`/${lang}`}
                        className="logo-widget inline-block"
                        onClick={() => {
                            // Отправка события в Google Analytics через dataLayer
                            if (typeof window !== 'undefined' && (window as any).dataLayer) {
                                (window as any).dataLayer.push({
                                    event: 'logo_click',
                                    eventCategory: 'Widget',
                                    eventAction: 'Logo Click',
                                    eventLabel: 'Logo Click',
                                    widgetToolId: toolId || 'unknown',
                                    widgetH1: h1 || 'Unknown',
                                    widgetH1En: h1En || h1 || 'Unknown',
                                    widgetLang: lang,
                                    widgetReferrer: document.referrer || window.location.href
                                })
                            }
                        }}
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
