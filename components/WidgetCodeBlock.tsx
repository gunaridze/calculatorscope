'use client'

import React, { useState } from 'react'

type Props = {
    code: string  // HTML код из body_blocks_json (с плейсхолдерами уже замененными)
    widgetCode: string  // Финальный код виджета для копирования
}

export default function WidgetCodeBlock({ code, widgetCode }: Props) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(widgetCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="my-6">
            {/* Показываем HTML из body_blocks_json (может содержать инструкции) */}
            <div
                className="prose mb-4"
                dangerouslySetInnerHTML={{ __html: code }}
            />
            
            {/* Блок с кодом виджета */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Widget Code:
                    </label>
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <pre className="bg-white border border-gray-300 rounded p-4 overflow-x-auto text-sm">
                    <code className="text-gray-800 whitespace-pre-wrap">{widgetCode}</code>
                </pre>
            </div>
        </div>
    )
}
