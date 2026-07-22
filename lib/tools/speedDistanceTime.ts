// Speed = Distance / Time relationship solver. Since the shared JSON engine's
// form model has no conditional field visibility, the widget always shows all
// three numeric fields (distance, speed, time) plus a "solve for" select; the
// field matching solve_for is simply recomputed from the other two and its
// entered value is ignored. All three fields are always returned so the
// result box shows the full, consistent relationship.
export function speedDistanceTime(params: {
    solve_for: unknown
    distance: unknown
    speed: unknown
    time: unknown
}): { distance: number; speed: number; time: number } {
    const solveFor = String(params.solve_for)
    const distance = Number(params.distance) || 0
    const speed = Number(params.speed) || 0
    const time = Number(params.time) || 0

    if (solveFor === 'speed') {
        return { distance, speed: time !== 0 ? distance / time : 0, time }
    }
    if (solveFor === 'time') {
        return { distance, speed, time: speed !== 0 ? distance / speed : 0 }
    }
    // default: solve for distance
    return { distance: speed * time, speed, time }
}
