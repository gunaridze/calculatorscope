// Marketing performance / growth / ROI helpers.
import { t } from './i18n'

// "ROAS Calculator" - Return on Ad Spend
export function roasCalculator(params: { revenue: unknown; ad_spend: unknown }): { roas: number; roas_percentage: number } {
    const revenue = Number(params.revenue) || 0
    const adSpend = Number(params.ad_spend) || 0
    const roas = adSpend > 0 ? revenue / adSpend : 0
    return { roas, roas_percentage: roas * 100 }
}

// "CPA Calculator" - Cost Per Acquisition/Action
export function cpaCalculator(params: { total_spend: unknown; conversions: unknown }): number {
    const spend = Number(params.total_spend) || 0
    const conversions = Number(params.conversions) || 0
    return conversions > 0 ? spend / conversions : 0
}

// "CPM Calculator" - Cost Per Mille (per 1,000 impressions)
export function cpmCalculator(params: { total_spend: unknown; impressions: unknown }): number {
    const spend = Number(params.total_spend) || 0
    const impressions = Number(params.impressions) || 0
    return impressions > 0 ? (spend / impressions) * 1000 : 0
}

// "CTR Calculator" - Click-Through Rate
export function ctrCalculator(params: { clicks: unknown; impressions: unknown }): number {
    const clicks = Number(params.clicks) || 0
    const impressions = Number(params.impressions) || 0
    return impressions > 0 ? (clicks / impressions) * 100 : 0
}

// "Conversion Rate Calculator"
export function conversionRateCalculator(params: { conversions: unknown; visitors: unknown }): number {
    const conversions = Number(params.conversions) || 0
    const visitors = Number(params.visitors) || 0
    return visitors > 0 ? (conversions / visitors) * 100 : 0
}

// "Marketing Funnel Conversion Calculator" - 4-stage funnel
// (e.g. Visitors -> Leads -> Qualified Leads -> Customers)
export function funnelConversionCalculator(params: {
    stage1: unknown; stage2: unknown; stage3: unknown; stage4: unknown
}): { rate_1_to_2: number; rate_2_to_3: number; rate_3_to_4: number; overall_rate: number } {
    const s1 = Number(params.stage1) || 0
    const s2 = Number(params.stage2) || 0
    const s3 = Number(params.stage3) || 0
    const s4 = Number(params.stage4) || 0
    return {
        rate_1_to_2: s1 > 0 ? (s2 / s1) * 100 : 0,
        rate_2_to_3: s2 > 0 ? (s3 / s2) * 100 : 0,
        rate_3_to_4: s3 > 0 ? (s4 / s3) * 100 : 0,
        overall_rate: s1 > 0 ? (s4 / s1) * 100 : 0,
    }
}

// "Multi-Touch Attribution Calculator" - splits credit for a conversion's
// value across 4 fixed touchpoints in the customer journey, per model.
// position_based (U-shaped) uses the common 40/10/10/40 split.
export function multiTouchAttributionCalculator(params: {
    conversion_value: unknown; model: unknown
}): { touchpoint1: number; touchpoint2: number; touchpoint3: number; touchpoint4: number } {
    const value = Number(params.conversion_value) || 0
    const model = String(params.model)
    let weights: [number, number, number, number]
    switch (model) {
        case 'first_touch': weights = [1, 0, 0, 0]; break
        case 'last_touch': weights = [0, 0, 0, 1]; break
        case 'position_based': weights = [0.4, 0.1, 0.1, 0.4]; break
        default: weights = [0.25, 0.25, 0.25, 0.25] // linear
    }
    return {
        touchpoint1: value * weights[0],
        touchpoint2: value * weights[1],
        touchpoint3: value * weights[2],
        touchpoint4: value * weights[3],
    }
}

// "LTV:CAC Ratio Calculator" - combines two metrics that already have
// standalone calculators elsewhere on the site (Customer Lifetime Value,
// Customer Acquisition Cost) into the single benchmark ratio marketers
// actually use to judge unit economics (commonly cited healthy range: 3:1-5:1).
const LTV_CAC_ASSESSMENT: Record<string, Record<string, string>> = {
    unprofitable: { en: 'Unprofitable', ru: 'Убыточно', de: 'Unrentabel', es: 'No Rentable', fr: 'Non Rentable', it: 'Non Redditizio', pl: 'Nieopłacalne', lv: 'Nerentabls' },
    weak: { en: 'Weak', ru: 'Слабо', de: 'Schwach', es: 'Débil', fr: 'Faible', it: 'Debole', pl: 'Słabe', lv: 'Vājš' },
    healthy: { en: 'Healthy', ru: 'Хорошо', de: 'Gesund', es: 'Saludable', fr: 'Sain', it: 'Sano', pl: 'Zdrowe', lv: 'Veselīgs' },
    very_strong: { en: 'Very Strong', ru: 'Очень хорошо', de: 'Sehr Stark', es: 'Muy Fuerte', fr: 'Très Fort', it: 'Molto Forte', pl: 'Bardzo Mocne', lv: 'Ļoti Spēcīgs' },
}
export function ltvCacRatioCalculator(params: { ltv: unknown; cac: unknown; language: unknown }): { ratio: number; assessment: string } {
    const ltv = Number(params.ltv) || 0
    const cac = Number(params.cac) || 0
    const ratio = cac > 0 ? ltv / cac : 0
    let bucket: string
    if (ratio < 1) bucket = 'unprofitable'
    else if (ratio < 3) bucket = 'weak'
    else if (ratio <= 5) bucket = 'healthy'
    else bucket = 'very_strong'
    return { ratio, assessment: t(LTV_CAC_ASSESSMENT[bucket], params.language) }
}

// "Customer Churn Rate Calculator"
export function churnRateCalculator(params: { customers_start: unknown; customers_lost: unknown }): {
    churn_rate: number; retention_rate: number
} {
    const start = Number(params.customers_start) || 0
    const lost = Number(params.customers_lost) || 0
    const churnRate = start > 0 ? (lost / start) * 100 : 0
    return { churn_rate: churnRate, retention_rate: 100 - churnRate }
}

// "Customer Loyalty Program ROI Calculator"
export function loyaltyProgramRoiCalculator(params: {
    program_cost: unknown; incremental_revenue: unknown
}): { roi_percentage: number; net_gain: number } {
    const cost = Number(params.program_cost) || 0
    const incrementalRevenue = Number(params.incremental_revenue) || 0
    const netGain = incrementalRevenue - cost
    return { roi_percentage: cost > 0 ? (netGain / cost) * 100 : 0, net_gain: netGain }
}

// "Organic Traffic Value Calculator" - estimates what organic search traffic
// would have cost if it had to be purchased via paid ads at an equivalent
// cost-per-click (a standard SEO-value framing, akin to tools like Ahrefs'
// "Traffic Value" metric).
export function organicTrafficValueCalculator(params: {
    organic_visitors: unknown; equivalent_cpc: unknown
}): number {
    const visitors = Number(params.organic_visitors) || 0
    const cpc = Number(params.equivalent_cpc) || 0
    return visitors * cpc
}

// "Email Marketing ROI Calculator"
export function emailMarketingRoiCalculator(params: {
    campaign_revenue: unknown; campaign_cost: unknown
}): { roi_percentage: number; net_profit: number } {
    const revenue = Number(params.campaign_revenue) || 0
    const cost = Number(params.campaign_cost) || 0
    const netProfit = revenue - cost
    return { roi_percentage: cost > 0 ? (netProfit / cost) * 100 : 0, net_profit: netProfit }
}
