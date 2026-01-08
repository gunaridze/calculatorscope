'use client'

import React, { useState, useEffect, useRef } from 'react'

type Props = {
    code: string  // HTML код из body_blocks_json (с плейсхолдерами уже замененными)
    widgetCode: string  // Финальный код виджета для копирования
}

export default function WidgetCodeBlock({ code, widgetCode }: Props) {
    const [copied, setCopied] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(widgetCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    useEffect(() => {
        // Заменяем ссылку на preview кнопкой после рендера
        if (contentRef.current) {
            const previewLink = contentRef.current.querySelector('a.widget-preview-link')
            if (previewLink) {
                const onclick = previewLink.getAttribute('onclick') || ''
                const text = previewLink.textContent || 'Preview this widget'
                
                // Создаем кнопку
                const button = document.createElement('button')
                button.className = 'px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg'
                button.textContent = text
                button.type = 'button'
                
                // Обработчик клика для кнопки
                button.addEventListener('click', (e) => {
                    e.preventDefault()
                    if (onclick) {
                        // Выполняем onclick из оригинальной ссылки
                        try {
                            // Создаем временную функцию для выполнения onclick
                            const func = new Function(onclick.replace(/return false;?/g, '').trim())
                            func()
                        } catch (err) {
                            console.error('Error executing onclick:', err)
                        }
                    }
                    return false
                })
                
                // Заменяем ссылку на кнопку
                previewLink.parentNode?.replaceChild(button, previewLink)
            }
        }
    }, [code])

    return (
        <div className="my-6">
            {/* Показываем HTML из body_blocks_json (может содержать инструкции) */}
            <div
                ref={contentRef}
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
