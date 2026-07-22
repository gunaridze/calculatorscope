// Work-hours / shift-scheduling helpers.

function to24(hour: unknown, ampm: unknown): number {
    let h = (Number(hour) || 12) % 12
    if (String(ampm).toUpperCase() === 'PM') h += 12
    return h
}

function formatHM(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60)
    const m = Math.round(totalMinutes % 60)
    return `${h}h ${m}m`
}

// "Work Hours Calculator" - single shift, start/end (12h clock) minus a break
export function workHours(params: {
    start_hour: unknown; start_minute: unknown; start_ampm: unknown
    end_hour: unknown; end_minute: unknown; end_ampm: unknown
    break_minutes: unknown
}): { result: string; decimal_hours: number } {
    const startMinutes = to24(params.start_hour, params.start_ampm) * 60 + (Number(params.start_minute) || 0)
    const endMinutes = to24(params.end_hour, params.end_ampm) * 60 + (Number(params.end_minute) || 0)
    let diff = endMinutes - startMinutes
    if (diff < 0) diff += 24 * 60
    diff -= Number(params.break_minutes) || 0
    if (diff < 0) diff = 0
    return { result: formatHM(diff), decimal_hours: diff / 60 }
}

// "Time Clock Calculator | Clock-In Clock-Out" - up to 3 clock in/out pairs
// summed together (unused pairs left at equal in/out time contribute zero)
export function clockInOutTotal(params: {
    in1_hour: unknown; in1_minute: unknown; in1_ampm: unknown; out1_hour: unknown; out1_minute: unknown; out1_ampm: unknown
    in2_hour: unknown; in2_minute: unknown; in2_ampm: unknown; out2_hour: unknown; out2_minute: unknown; out2_ampm: unknown
    in3_hour: unknown; in3_minute: unknown; in3_ampm: unknown; out3_hour: unknown; out3_minute: unknown; out3_ampm: unknown
}): { result: string; decimal_hours: number } {
    function pairMinutes(inH: unknown, inM: unknown, inAmpm: unknown, outH: unknown, outM: unknown, outAmpm: unknown): number {
        const start = to24(inH, inAmpm) * 60 + (Number(inM) || 0)
        const end = to24(outH, outAmpm) * 60 + (Number(outM) || 0)
        let diff = end - start
        if (diff < 0) diff += 24 * 60
        return diff
    }
    const total =
        pairMinutes(params.in1_hour, params.in1_minute, params.in1_ampm, params.out1_hour, params.out1_minute, params.out1_ampm) +
        pairMinutes(params.in2_hour, params.in2_minute, params.in2_ampm, params.out2_hour, params.out2_minute, params.out2_ampm) +
        pairMinutes(params.in3_hour, params.in3_minute, params.in3_ampm, params.out3_hour, params.out3_minute, params.out3_ampm)
    return { result: formatHM(total), decimal_hours: total / 60 }
}

// "Work Shift Coverage Calculator" - does a set of up to 3 shifts (24h clock)
// fully cover a required window? Computes covered vs. gap hours via interval
// union clipped to the required window.
export function shiftCoverage(params: {
    required_start_hour: unknown; required_end_hour: unknown
    shift1_start_hour: unknown; shift1_end_hour: unknown
    shift2_start_hour: unknown; shift2_end_hour: unknown
    shift3_start_hour: unknown; shift3_end_hour: unknown
}): { covered_hours: number; gap_hours: number; is_fully_covered: string } {
    const reqStart = Number(params.required_start_hour) || 0
    const reqEnd = Number(params.required_end_hour) || 0

    const shifts: Array<[number, number]> = [
        [Number(params.shift1_start_hour) || 0, Number(params.shift1_end_hour) || 0],
        [Number(params.shift2_start_hour) || 0, Number(params.shift2_end_hour) || 0],
        [Number(params.shift3_start_hour) || 0, Number(params.shift3_end_hour) || 0],
    ]
        .filter(([s, e]) => e > s)
        .map(([s, e]): [number, number] => [Math.max(s, reqStart), Math.min(e, reqEnd)])
        .filter(([s, e]) => e > s)
        .sort((a, b) => a[0] - b[0])

    // merge overlapping/adjacent intervals, then sum
    const merged: Array<[number, number]> = []
    for (const [s, e] of shifts) {
        const last = merged[merged.length - 1]
        if (last && s <= last[1]) {
            last[1] = Math.max(last[1], e)
        } else {
            merged.push([s, e])
        }
    }
    const covered_hours = merged.reduce((sum, [s, e]) => sum + (e - s), 0)
    const requiredHours = Math.max(0, reqEnd - reqStart)
    const gap_hours = Math.max(0, requiredHours - covered_hours)

    return {
        covered_hours,
        gap_hours,
        is_fully_covered: gap_hours <= 0.01 ? 'Yes' : 'No',
    }
}
