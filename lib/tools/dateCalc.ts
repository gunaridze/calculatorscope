// Calendar-date arithmetic helpers (Age, Date Difference, Business Days,
// Date +/- Units, Roman Numeral Date). All date inputs are 'YYYY-MM-DD'
// strings from a native <input type="date">; parsed with a literal midnight
// time so getFullYear/getMonth/getDate stay in the browser's local calendar
// throughout, avoiding UTC-vs-local off-by-one-day bugs.

function parseDate(value: unknown): Date {
    const str = String(value || '')
    const d = new Date(`${str}T00:00:00`)
    return isNaN(d.getTime()) ? new Date() : d
}

function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Standard year/month/day-borrow breakdown between two dates (d1 <= d2 assumed
// after the caller normalizes order); verified against known reference cases.
function diffYMD(d1: Date, d2: Date): { years: number; months: number; days: number } {
    let years = d2.getFullYear() - d1.getFullYear()
    let months = d2.getMonth() - d1.getMonth()
    let days = d2.getDate() - d1.getDate()
    if (days < 0) {
        months--
        const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0)
        days += prevMonth.getDate()
    }
    if (months < 0) {
        years--
        months += 12
    }
    return { years, months, days }
}

const MS_PER_DAY = 86400000

// "Date ± Calendar Units Calculator"
export function dateAddSubtract(params: {
    base_date: unknown
    amount: unknown
    unit: unknown
    operation: unknown
}): string {
    const base = parseDate(params.base_date)
    const amount = Number(params.amount) || 0
    const signed = String(params.operation) === 'subtract' ? -amount : amount
    const unit = String(params.unit)
    const result = new Date(base)
    if (unit === 'days') result.setDate(result.getDate() + signed)
    else if (unit === 'weeks') result.setDate(result.getDate() + signed * 7)
    else if (unit === 'months') result.setMonth(result.getMonth() + signed)
    else if (unit === 'years') result.setFullYear(result.getFullYear() + signed)
    return formatDate(result)
}

// "Date Difference Calculator" - Y/M/D breakdown plus totals
export function dateDifference(params: { date1: unknown; date2: unknown }): {
    years: number; months: number; days: number; total_days: number; total_weeks: number
} {
    let d1 = parseDate(params.date1)
    let d2 = parseDate(params.date2)
    if (d1 > d2) [d1, d2] = [d2, d1]
    const { years, months, days } = diffYMD(d1, d2)
    const total_days = Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY)
    return { years, months, days, total_days, total_weeks: Math.round((total_days / 7) * 10) / 10 }
}

// "Date Calculator | Days and Business Days" - total days AND weekday-only count
export function daysAndBusinessDays(params: { date1: unknown; date2: unknown }): {
    total_days: number; business_days: number; weekend_days: number
} {
    let d1 = parseDate(params.date1)
    let d2 = parseDate(params.date2)
    if (d1 > d2) [d1, d2] = [d2, d1]
    const total_days = Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY)
    let business_days = 0
    const cur = new Date(d1)
    cur.setDate(cur.getDate() + 1)
    while (cur <= d2) {
        const day = cur.getDay()
        if (day !== 0 && day !== 6) business_days++
        cur.setDate(cur.getDate() + 1)
    }
    return { total_days, business_days, weekend_days: total_days - business_days }
}

// "Time & Date Difference Calculator" - full datetime granularity (Y/M/D/H/M)
export function datetimeDifference(params: {
    date1: unknown; hour1: unknown; minute1: unknown
    date2: unknown; hour2: unknown; minute2: unknown
}): { years: number; months: number; days: number; hours: number; minutes: number; total_hours: number } {
    const dt1 = parseDate(params.date1)
    dt1.setHours(Number(params.hour1) || 0, Number(params.minute1) || 0, 0, 0)
    const dt2 = parseDate(params.date2)
    dt2.setHours(Number(params.hour2) || 0, Number(params.minute2) || 0, 0, 0)
    let start = dt1, end = dt2
    if (start > end) [start, end] = [end, start]

    const dateOnlyDiff = diffYMD(
        new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        new Date(end.getFullYear(), end.getMonth(), end.getDate())
    )
    let hours = end.getHours() - start.getHours()
    let minutes = end.getMinutes() - start.getMinutes()
    let days = dateOnlyDiff.days
    let months = dateOnlyDiff.months
    let years = dateOnlyDiff.years
    if (minutes < 0) { minutes += 60; hours-- }
    if (hours < 0) { hours += 24; days-- }
    if (days < 0) {
        months--
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
        days += prevMonth.getDate()
    }
    if (months < 0) { years--; months += 12 }

    const total_hours = (end.getTime() - start.getTime()) / 3600000
    return { years, months, days, hours, minutes, total_hours }
}

// "Age Calculator" / "How Old Am I?" - shared computation, different framing per page
export function ageCalculator(params: { birth_date: unknown; as_of_date: unknown }): {
    years: number; months: number; days: number; total_days: number; days_to_next_birthday: number
} {
    const birth = parseDate(params.birth_date)
    const asOf = parseDate(params.as_of_date)
    const { years, months, days } = diffYMD(birth, asOf)
    const total_days = Math.round((asOf.getTime() - birth.getTime()) / MS_PER_DAY)

    let nextBirthday = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < asOf) nextBirthday = new Date(asOf.getFullYear() + 1, birth.getMonth(), birth.getDate())
    const days_to_next_birthday = Math.round((nextBirthday.getTime() - asOf.getTime()) / MS_PER_DAY)

    return { years, months, days, total_days, days_to_next_birthday }
}

// "Age Checker" - eligibility against a minimum required age as of a given date
export function ageChecker(params: { birth_date: unknown; required_age: unknown; as_of_date: unknown }): {
    current_age: number; is_eligible: string; eligible_date: string
} {
    const birth = parseDate(params.birth_date)
    const asOf = parseDate(params.as_of_date)
    const requiredAge = Number(params.required_age) || 0
    const { years } = diffYMD(birth, asOf)

    const eligibleDate = new Date(birth.getFullYear() + requiredAge, birth.getMonth(), birth.getDate())
    const is_eligible = asOf >= eligibleDate ? 'Yes' : 'No'

    return { current_age: years, is_eligible, eligible_date: formatDate(eligibleDate) }
}

// "Roman Numeral Date Converter"
function toRoman(num: number): string {
    if (num <= 0) return ''
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    let result = ''
    let remaining = num
    for (let i = 0; i < values.length; i++) {
        while (remaining >= values[i]) {
            result += symbols[i]
            remaining -= values[i]
        }
    }
    return result
}

export function romanNumeralDate(params: { date: unknown }): string {
    const d = parseDate(params.date)
    const month = toRoman(d.getMonth() + 1)
    const day = toRoman(d.getDate())
    const year = toRoman(d.getFullYear())
    return `${month}.${day}.${year}`
}
