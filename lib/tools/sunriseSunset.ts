// Sunrise/sunset calculation using the standard simplified NOAA/Meeus solar
// position equation (accurate to within roughly a minute for most latitudes).
// Verified against known reference times for London (2024-06-21) and New
// York City (2024-01-01) before use.

const RAD = Math.PI / 180

function toJulian(date: Date): number {
    return date.getTime() / 86400000 + 2440587.5
}

function fromJulian(j: number): Date {
    return new Date((j - 2440587.5) * 86400000)
}

function formatUtcClock(date: Date, utcOffsetHours: number): string {
    const shifted = new Date(date.getTime() + utcOffsetHours * 3600000)
    const h = shifted.getUTCHours()
    const m = shifted.getUTCMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    let h12 = h % 12
    if (h12 === 0) h12 = 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function sunriseSunset(params: {
    latitude: unknown
    longitude: unknown
    date: unknown
    utc_offset: unknown
}): { sunrise: string; sunset: string; day_length_hours: number } {
    const lat = Number(params.latitude) || 0
    const lon = Number(params.longitude) || 0
    const utcOffset = Number(params.utc_offset) || 0
    const dateStr = String(params.date || '')
    const inputDate = new Date(`${dateStr}T00:00:00Z`)
    const validDate = isNaN(inputDate.getTime()) ? new Date() : inputDate

    const J_date = Math.floor(toJulian(validDate)) + 1.0 // JD at solar noon UTC of that calendar date
    const n = J_date - 2451545.0 + 0.0008
    const Jstar = n - lon / 360
    const M = (((357.5291 + 0.98560028 * Jstar) % 360) + 360) % 360
    const Mrad = M * RAD
    const C = 1.9148 * Math.sin(Mrad) + 0.02 * Math.sin(2 * Mrad) + 0.0003 * Math.sin(3 * Mrad)
    const lambda = (((M + C + 180 + 102.9372) % 360) + 360) % 360
    const lambdaRad = lambda * RAD
    const Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(Mrad) - 0.0069 * Math.sin(2 * lambdaRad)
    const sinDelta = Math.sin(lambdaRad) * Math.sin(23.4397 * RAD)
    const delta = Math.asin(sinDelta)
    const latRad = lat * RAD
    const cosH = (Math.sin(-0.833 * RAD) - Math.sin(latRad) * Math.sin(delta)) / (Math.cos(latRad) * Math.cos(delta))

    if (cosH > 1) return { sunrise: 'No sunrise (polar night)', sunset: 'No sunset (polar night)', day_length_hours: 0 }
    if (cosH < -1) return { sunrise: 'No sunset (midnight sun)', sunset: 'No sunset (midnight sun)', day_length_hours: 24 }

    const H = Math.acos(cosH) / RAD
    const Jrise = Jtransit - H / 360
    const Jset = Jtransit + H / 360

    return {
        sunrise: formatUtcClock(fromJulian(Jrise), utcOffset),
        sunset: formatUtcClock(fromJulian(Jset), utcOffset),
        day_length_hours: (2 * H) / 15,
    }
}
