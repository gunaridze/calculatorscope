// Duration / clock-time arithmetic helpers shared across the several
// "time calculator" style pages (each has a distinct input shape/framing,
// but they share this small set of underlying operations).

function formatDuration(totalSeconds: number): { result: string; decimal_hours: number } {
    const neg = totalSeconds < 0
    const abs = Math.round(Math.abs(totalSeconds))
    const h = Math.floor(abs / 3600)
    const m = Math.floor((abs % 3600) / 60)
    const s = abs % 60
    const result = `${neg ? '-' : ''}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return { result, decimal_hours: totalSeconds / 3600 }
}

// "Time Calculator hh:mm:ss" - add or subtract two full h:m:s durations
export function hmsAddSubtract(params: {
    h1: unknown; m1: unknown; s1: unknown
    operation: unknown
    h2: unknown; m2: unknown; s2: unknown
}): { result: string; decimal_hours: number } {
    const t1 = (Number(params.h1) || 0) * 3600 + (Number(params.m1) || 0) * 60 + (Number(params.s1) || 0)
    const t2 = (Number(params.h2) || 0) * 3600 + (Number(params.m2) || 0) * 60 + (Number(params.s2) || 0)
    const sign = String(params.operation) === 'subtract' ? -1 : 1
    return formatDuration(t1 + sign * t2)
}

// "Time Calculator | Add, Subtract, Multiply, Divide Time" - a single duration
// combined with a plain number, under a 4-way operation select. Add/subtract
// treat the number as decimal hours; multiply/divide treat it as a scalar.
export function timeArithmetic(params: {
    h1: unknown; m1: unknown; s1: unknown
    operation: unknown
    value2: unknown
}): { result: string; decimal_hours: number } {
    const t1 = (Number(params.h1) || 0) * 3600 + (Number(params.m1) || 0) * 60 + (Number(params.s1) || 0)
    const value2 = Number(params.value2) || 0
    const op = String(params.operation)
    let totalSeconds: number
    if (op === 'subtract') totalSeconds = t1 - value2 * 3600
    else if (op === 'multiply') totalSeconds = t1 * value2
    else if (op === 'divide') totalSeconds = value2 !== 0 ? t1 / value2 : 0
    else totalSeconds = t1 + value2 * 3600 // add
    return formatDuration(totalSeconds)
}

// "Hours and Minutes Calculator" - add/subtract two h:m durations (no seconds)
export function hoursMinutesAddSubtract(params: {
    h1: unknown; m1: unknown
    operation: unknown
    h2: unknown; m2: unknown
}): { result: string; decimal_hours: number } {
    const t1 = (Number(params.h1) || 0) * 60 + (Number(params.m1) || 0)
    const t2 = (Number(params.h2) || 0) * 60 + (Number(params.m2) || 0)
    const sign = String(params.operation) === 'subtract' ? -1 : 1
    const totalMinutes = t1 + sign * t2
    const neg = totalMinutes < 0
    const abs = Math.round(Math.abs(totalMinutes))
    const h = Math.floor(abs / 60)
    const m = abs % 60
    return { result: `${neg ? '-' : ''}${h}:${String(m).padStart(2, '0')}`, decimal_hours: totalMinutes / 60 }
}

// "Decimal to Time Calculator"
export function decimalToTime(params: { decimal_hours: unknown }): string {
    const dec = Number(params.decimal_hours) || 0
    const neg = dec < 0
    const totalSeconds = Math.round(Math.abs(dec) * 3600)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${neg ? '-' : ''}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// "Time to Decimal Calculator"
export function timeToDecimal(params: { hours: unknown; minutes: unknown; seconds: unknown }): number {
    const h = Number(params.hours) || 0
    const m = Number(params.minutes) || 0
    const s = Number(params.seconds) || 0
    return h + m / 60 + s / 3600
}

// "Military Time Converter" - standard 12h time -> 24h military time
export function to24HourTime(params: { hour: unknown; minute: unknown; ampm: unknown }): string {
    let hour = (Number(params.hour) || 12) % 12
    const minute = Number(params.minute) || 0
    if (String(params.ampm).toUpperCase() === 'PM') hour += 12
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// "Military Time Chart" - reverse direction, 24h military time -> standard 12h time
export function to12HourTime(params: { hour_24: unknown; minute: unknown }): string {
    const hour24 = ((Number(params.hour_24) || 0) % 24 + 24) % 24
    const minute = Number(params.minute) || 0
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    let hour12 = hour24 % 12
    if (hour12 === 0) hour12 = 12
    return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`
}

// "Hours Calculator" - duration between two clock times (12h format), wraps
// to the next day if the end time is earlier than the start time
export function hoursBetweenClockTimes(params: {
    start_hour: unknown; start_minute: unknown; start_ampm: unknown
    end_hour: unknown; end_minute: unknown; end_ampm: unknown
}): { result: string; decimal_hours: number } {
    function to24(hour: unknown, ampm: unknown): number {
        let h = (Number(hour) || 12) % 12
        if (String(ampm).toUpperCase() === 'PM') h += 12
        return h
    }
    const startMinutes = to24(params.start_hour, params.start_ampm) * 60 + (Number(params.start_minute) || 0)
    const endMinutes = to24(params.end_hour, params.end_ampm) * 60 + (Number(params.end_minute) || 0)
    let diff = endMinutes - startMinutes
    if (diff < 0) diff += 24 * 60
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return { result: `${hours}h ${minutes}m`, decimal_hours: diff / 60 }
}
