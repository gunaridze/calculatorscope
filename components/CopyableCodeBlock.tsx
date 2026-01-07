'use client'

import React, { useState } from 'react'

type Props = {
    label: string
    code: string
}

export default function CopyableCodeBlock({ label, code }: Props) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative my-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">
                    {label}:
                </label>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="bg-white border border-gray-300 rounded p-4 overflow-x-auto text-sm">
                <code className="text-gray-800 whitespace-pre-wrap">{code}</code>
            </pre>
        </div>
    )
}
