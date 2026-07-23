'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrencyConverterTranslations } from '@/lib/currency-converter-translations'
import { CURRENCY_CODES, getCurrencyLabel } from '@/lib/tools/currencyList'

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

type RatesResponse = { base: string; date: string; rates: Record<string, number> }

export default function CurrencyConverterWidget({ h1, lang, translations, toolSlug }: Props) {
    const t = getCurrencyConverterTranslations(lang)
    const [amount, setAmount] = useState('100')
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('EUR')
    const [rates, setRates] = useState<RatesResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const loadRates = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/exchange-rates')
            if (!res.ok) throw new Error('Bad response')
            const data: RatesResponse = await res.json()
            setRates(data)
        } catch (e) {
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRates()
    }, [loadRates])

    const handleSwap = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    const numericAmount = parseFloat(amount) || 0
    let convertedAmount: number | null = null
    if (rates && rates.rates[fromCurrency] && rates.rates[toCurrency]) {
        const eurAmount = numericAmount / rates.rates[fromCurrency]
        convertedAmount = eurAmount * rates.rates[toCurrency]
    }

    return (
        <div className="w-full lg:w-[420px] lg:float-left lg:mr-5 mb-5 relative mx-auto lg:mx-0" style={{ maxWidth: '420px' }}>
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-lg font-bold">{h1}</h1>
            </div>

            <div className="bg-white border border-gray-200 border-t-0 p-5 mx-auto relative" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.amountLabel}</label>
                    <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.fromLabel}</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                    >
                        {CURRENCY_CODES.map((code) => (
                            <option key={code} value={code}>{getCurrencyLabel(code, lang)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-center my-1">
                    <button
                        onClick={handleSwap}
                        aria-label={t.swapLabel}
                        title={t.swapLabel}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-gray-600"
                    >
                        ⇅
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.toLabel}</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                    >
                        {CURRENCY_CODES.map((code) => (
                            <option key={code} value={code}>{getCurrencyLabel(code, lang)}</option>
                        ))}
                    </select>
                </div>

                <div className="border border-gray-300 rounded-md p-4 text-center">
                    {loading ? (
                        <div className="text-sm text-gray-500">{t.loadingRates}</div>
                    ) : error ? (
                        <div className="text-sm text-red-600">{t.errorLoadingRates}</div>
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-blue-600 tabular-nums">
                                {convertedAmount !== null ? convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '—'}
                                <span className="text-base font-medium text-gray-500 ml-2">{toCurrency}</span>
                            </div>
                            {rates && (
                                <div className="text-xs text-gray-400 mt-2">{t.lastUpdated}: {rates.date}</div>
                            )}
                        </>
                    )}
                </div>

                {!loading && !error && rates && (
                    <p className="text-xs text-gray-400 mt-3">{t.ratesSource}</p>
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
