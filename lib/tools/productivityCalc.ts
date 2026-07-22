// Productivity / scheduling helpers with no single universal formula in the
// literature - each documents its assumption and lets the user override the
// key input rather than hard-coding an unstated constant.

// "Focus Session Planner" - how many focus+break sessions fit in a block of time
export function focusSessionPlanner(params: {
    total_minutes: unknown
    focus_minutes: unknown
    break_minutes: unknown
}): { sessions: number; total_focus_minutes: number; total_break_minutes: number; leftover_minutes: number } {
    const total = Number(params.total_minutes) || 0
    const focus = Number(params.focus_minutes) || 25
    const brk = Number(params.break_minutes) || 5
    const cycle = focus + brk
    const sessions = cycle > 0 ? Math.floor(total / cycle) : 0
    const total_focus_minutes = sessions * focus
    const total_break_minutes = sessions * brk
    const leftover_minutes = total - sessions * cycle
    return { sessions, total_focus_minutes, total_break_minutes, leftover_minutes }
}

// "Context Switching Cost Calculator" - cost-per-switch defaults to ~23.25
// minutes, the figure most commonly cited from Gloria Mark's (UC Irvine)
// interruption-recovery research; users should adjust it if they have a
// different, better-suited estimate for their own work.
export function contextSwitchingCost(params: {
    switches_per_day: unknown
    cost_per_switch_minutes: unknown
    work_days_per_week: unknown
}): { daily_hours_lost: number; weekly_hours_lost: number; annual_hours_lost: number } {
    const switches = Number(params.switches_per_day) || 0
    const costPerSwitch = Number(params.cost_per_switch_minutes) || 23.25
    const workDaysPerWeek = Number(params.work_days_per_week) || 5

    const daily_hours_lost = (switches * costPerSwitch) / 60
    const weekly_hours_lost = daily_hours_lost * workDaysPerWeek
    const annual_hours_lost = weekly_hours_lost * 52
    return { daily_hours_lost, weekly_hours_lost, annual_hours_lost }
}

// "Meeting Time Zone Overlap Calculator" - intersects two locations' working
// hours (fixed UTC offsets - does not auto-adjust for DST; the user should
// pick the offset that's currently in effect for each location)
export function meetingTimezoneOverlap(params: {
    offset1: unknown; start1: unknown; end1: unknown
    offset2: unknown; start2: unknown; end2: unknown
}): {
    overlap_hours: number
    overlap_start_loc1: number; overlap_end_loc1: number
    overlap_start_loc2: number; overlap_end_loc2: number
    has_overlap: string
} {
    const offset1 = Number(params.offset1) || 0
    const offset2 = Number(params.offset2) || 0
    const start1Utc = (Number(params.start1) || 0) - offset1
    const end1Utc = (Number(params.end1) || 0) - offset1
    const start2Utc = (Number(params.start2) || 0) - offset2
    const end2Utc = (Number(params.end2) || 0) - offset2

    const overlapStartUtc = Math.max(start1Utc, start2Utc)
    const overlapEndUtc = Math.min(end1Utc, end2Utc)
    const overlap_hours = Math.max(0, overlapEndUtc - overlapStartUtc)

    return {
        overlap_hours,
        overlap_start_loc1: overlap_hours > 0 ? overlapStartUtc + offset1 : 0,
        overlap_end_loc1: overlap_hours > 0 ? overlapEndUtc + offset1 : 0,
        overlap_start_loc2: overlap_hours > 0 ? overlapStartUtc + offset2 : 0,
        overlap_end_loc2: overlap_hours > 0 ? overlapEndUtc + offset2 : 0,
        has_overlap: overlap_hours > 0 ? 'Yes' : 'No',
    }
}
