'use client'

import React, { useState } from 'react'
import * as math from 'mathjs' // Библиотека для безопасной математики

type Props = {
    config: any     // Формулы из БД
    interface: any  // Переводы (Labels) из БД
}

export default function JsonCalculator({ config, interface: ui }: Props) {
    // Храним значения всех инпутов
    const [values, setValues] = useState<Record<string, number | string>>({})
    const [result, setResult] = useState<Record<string, number | string>>({})

    // Обработка ввода
    const handleChange = (key: string, val: string) => {
        setValues((prev) => ({ ...prev, [key]: val }))
    }

    // Главная функция расчета
    const handleCalculate = () => {
        try {
            // 1. Подготавливаем переменные (превращаем строки в числа)
            const scope: Record<string, number> = {}
            config.inputs.forEach((inp: any) => {
                const val = parseFloat(values[inp.key] as string) || inp.default || 0
                scope[inp.key] = val
            })

            // 2. Считаем формулы через mathjs
            const newResults: Record<string, number> = {}

            // Пробегаем по формулам из конфига (например "val_inch": "val_cm / 2.54")
            Object.entries(config.formulas).forEach(([outKey, formula]) => {
                // @ts-ignore
                const rawResult = math.evaluate(formula as string, scope)
                newResults[outKey] = rawResult
            })

            setResult(newResults)
        } catch (e) {
            console.error("Ошибка вычислений:", e)
        }
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-lg">

            {/* INPUTS */}
            <div className="space-y-4 mb-6">
                {config.inputs.map((inp: any) => (
                    <div key={inp.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {ui?.inputs?.[inp.key]?.label || inp.key}
                        </label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={ui?.inputs?.[inp.key]?.placeholder || "0"}
                            onChange={(e) => handleChange(inp.key, e.target.value)}
                            defaultValue={inp.default}
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
                    {config.outputs.map((out: any) => (
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