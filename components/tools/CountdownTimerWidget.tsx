'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCountdownTranslations } from '@/lib/countdown-stopwatch-translations'

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

function getDefaultTarget(): { date: string; hour: string; minute: string } {
    const d = new Date(Date.now() + 24 * 3600000)
    return {
        date: d.toISOString().slice(0, 10),
        hour: String(d.getHours()).padStart(2, '0'),
        minute: String(d.getMinutes()).padStart(2, '0'),
    }
}

export default function CountdownTimerWidget({ h1, lang, translations, toolSlug }: Props) {
    const t = getCountdownTranslations(lang)
    const defaults = getDefaultTarget()
    const [targetDate, setTargetDate] = useState(defaults.date)
    const [targetHour, setTargetHour] = useState(defaults.hour)
    const [targetMinute, setTargetMinute] = useState(defaults.minute)
    const [eventName, setEventName] = useState('')
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    const target = new Date(`${targetDate}T${targetHour.padStart(2, '0')}:${targetMinute.padStart(2, '0')}:00`)
    const diffMs = target.getTime() - now
    const isPast = diffMs <= 0
    const absMs = Math.abs(diffMs)
    const days = Math.floor(absMs / 86400000)
    const hours = Math.floor((absMs % 86400000) / 3600000)
    const minutes = Math.floor((absMs % 3600000) / 60000)
    const seconds = Math.floor((absMs % 60000) / 1000)

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.eventNameLabel}</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={t.eventNamePlaceholder}
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateLabel}</label>
                    <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.hourLabel}</label>
                        <input
                            type="number"
                            min={0}
                            max={23}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={targetHour}
                            onChange={(e) => setTargetHour(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.minuteLabel}</label>
                        <input
                            type="number"
                            min={0}
                            max={59}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={targetMinute}
                            onChange={(e) => setTargetMinute(e.target.value)}
                        />
                    </div>
                </div>

                <div className="border border-gray-300 rounded-md p-4 text-center">
                    {eventName && <div className="text-sm text-gray-600 mb-2 font-medium">{eventName}</div>}
                    {isPast ? (
                        <div className="text-lg font-bold text-gray-800">{t.eventPassed}</div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { value: days, label: t.days },
                                { value: hours, label: t.hours },
                                { value: minutes, label: t.minutes },
                                { value: seconds, label: t.seconds },
                            ].map((unit) => (
                                <div key={unit.label}>
                                    <div className="text-2xl font-bold text-blue-600 tabular-nums">{unit.value}</div>
                                    <div className="text-xs text-gray-500">{unit.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
