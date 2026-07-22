'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getStopwatchTranslations } from '@/lib/countdown-stopwatch-translations'

type Props = {
    config: any
    interface: any
    initialValues?: any
    h1: string
    lang: string
    toolId?: string
    h1En?: string
    translations: {
        suggest: string
        getWidget: string
        downloadWidget: string
    }
    toolSlug?: string
}

function formatElapsed(ms: number): string {
    const totalCentiseconds = Math.floor(ms / 10)
    const centiseconds = totalCentiseconds % 100
    const totalSeconds = Math.floor(ms / 1000)
    const seconds = totalSeconds % 60
    const minutes = Math.floor(totalSeconds / 60) % 60
    const hours = Math.floor(totalSeconds / 3600)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

export default function StopwatchWidget({ h1, lang, translations, toolSlug }: Props) {
    const t = getStopwatchTranslations(lang)
    const [isRunning, setIsRunning] = useState(false)
    const [elapsedMs, setElapsedMs] = useState(0)
    const [laps, setLaps] = useState<number[]>([])
    const startRef = useRef<number>(0)
    const rafRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        if (!isRunning) return
        const tick = () => {
            setElapsedMs(Date.now() - startRef.current)
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isRunning])

    const handleStart = () => {
        startRef.current = Date.now() - elapsedMs
        setIsRunning(true)
    }
    const handleStop = () => {
        setIsRunning(false)
    }
    const handleReset = () => {
        setIsRunning(false)
        setElapsedMs(0)
        setLaps([])
    }
    const handleLap = () => {
        setLaps((prev) => [elapsedMs, ...prev])
    }

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="border border-gray-300 rounded-md p-6 text-center mb-4">
                    <div className="text-4xl font-bold text-blue-600 tabular-nums">{formatElapsed(elapsedMs)}</div>
                </div>

                <div className="flex gap-2 mb-4">
                    {!isRunning ? (
                        <button
                            onClick={handleStart}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                        >
                            {elapsedMs > 0 ? t.resume : t.start}
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                        >
                            {t.stop}
                        </button>
                    )}
                    <button
                        onClick={handleLap}
                        disabled={!isRunning}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        {t.lap}
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        {t.reset}
                    </button>
                </div>

                {laps.length > 0 && (
                    <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto mb-4">
                        {laps.map((lapMs, i) => (
                            <div key={laps.length - i} className="flex justify-between px-3 py-2 text-sm border-b border-gray-100 last:border-b-0">
                                <span className="text-gray-500">{t.lap} {laps.length - i}</span>
                                <span className="font-medium tabular-nums">{formatElapsed(lapMs)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5">
                    <Link href={`/${lang}/contact`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm block">
                        {translations.suggest}
                    </Link>
                    {toolSlug && (
                        <Link
                            href={`/${lang}/widget/${toolSlug}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm block text-center mt-[50px]"
                        >
                            {translations.getWidget}
                        </Link>
                    )}
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
