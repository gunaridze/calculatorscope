import { NextResponse } from 'next/server'

// Proxies Frankfurter (ECB reference rates, free, no API key required) so the
// client never calls a third party directly. The upstream fetch is cached by
// Next.js's Data Cache for 1 hour (revalidate: 3600) - ECB rates only update
// once per business day anyway, so hourly is already more than fresh enough.
// Always fetched EUR-based; the widget derives any pair via cross-division.
const UPSTREAM_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR'

export async function GET() {
    try {
        const res = await fetch(UPSTREAM_URL, { next: { revalidate: 3600 } })

        if (!res.ok) {
            return NextResponse.json({ error: 'Exchange rate provider unavailable' }, { status: 502 })
        }

        const data = await res.json()
        // EUR itself isn't included in the "rates" map since it's the base
        const rates = { ...data.rates, EUR: 1 }

        return NextResponse.json(
            { base: 'EUR', date: data.date, rates },
            { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } }
        )
    } catch (error) {
        console.error('Error fetching exchange rates:', error)
        return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 502 })
    }
}
