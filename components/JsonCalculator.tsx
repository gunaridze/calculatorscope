'use client'

import React, { useState, useEffect } from 'react'
import { calculate, type JsonEngineConfig, type JsonEngineInput, type JsonEngineOutput } from '@/core/engines/json'

type Props = {
    config: JsonEngineConfig
    interface: any  // Переводы (Labels) из БД
    initialValues?: JsonEngineInput  // Для share links
}

export default function JsonCalculator({ config, interface: ui, initialValues }: Props) {
    // Храним значения всех инпутов
    const [values, setValues] = useState<JsonEngineInput>(initialValues || {})
    const [result, setResult] = useState<JsonEngineOutput>({})

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
    }, [config]) // Добавлен config в зависимости

    // Обработка ввода
    const handleChange = (key: string, val: string) => {
        setValues((prev) => ({ ...prev, [key]: val }))
    }

    // Главная функция расчета через единый движок
    const handleCalculate = () => {
        const calculated = calculate(config, values)
        setResult(calculated)
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-lg">
            {/* INPUTS */}
            <div className="space-y-4 mb-6">
                {config.inputs.map((inp) => (
                    <div key={inp.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {ui?.inputs?.[inp.key]?.label || inp.key}
                        </label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={ui?.inputs?.[inp.key]?.placeholder || "0"}
                            onChange={(e) => handleChange(inp.key, e.target.value)}
                            value={values[inp.key] !== undefined ? String(values[inp.key]) : (inp.default !== undefined ? String(inp.default) : '')}
                        />
                    </div>
                ))}
            </div>

            {/* BUTTON */}
            <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-colors"
            >
                {ui?.cta || "Calculate"}
            </button>

            {/* OUTPUTS */}
            {Object.keys(result).length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    {config.outputs.map((out) => (
                        <div key={out.key} className="flex justify-between items-center mb-2 last:mb-0">
                            <span className="text-gray-600 font-medium">
                                {ui?.outputs?.[out.key]?.label || out.key}:
                            </span>
                            <span className="text-2xl font-bold text-blue-900">
                                {typeof result[out.key] === 'number'
                                    ? (result[out.key] as number).toFixed(out.precision || 2)
                                    : result[out.key]}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}