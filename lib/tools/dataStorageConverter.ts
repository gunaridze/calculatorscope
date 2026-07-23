// Digital storage helpers. Storage capacity uses binary (1024-based) prefixes,
// the common practical convention for file/disk sizes. Network transfer speed
// uses decimal (1000-based) prefixes, matching how ISPs advertise bandwidth
// (e.g. "100 Mbps") - these are genuinely different conventions, not an
// oversight, and is why the Download Time Calculator below keeps them separate.

export type StorageUnit = 'bit' | 'byte' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB'

const BYTES_PER_UNIT: Record<StorageUnit, number> = {
    bit: 1 / 8,
    byte: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
}

// "Data Storage Converter" - general multi-unit converter
export function dataStorageConverter(params: { value: unknown; from_unit: unknown; to_unit: unknown }): number {
    const value = Number(params.value) || 0
    const fromUnit = String(params.from_unit) as StorageUnit
    const toUnit = String(params.to_unit) as StorageUnit
    return (value * BYTES_PER_UNIT[fromUnit]) / BYTES_PER_UNIT[toUnit]
}

const FILE_SIZE_UNIT_BYTES: Record<string, number> = { MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
const SPEED_UNIT_BPS: Record<string, number> = { Kbps: 1000, Mbps: 1000 ** 2, Gbps: 1000 ** 3 }

// "Download Time Calculator" - file size (binary storage units) divided by
// transfer speed (decimal network units), converted through a common bits base.
export function downloadTimeCalculator(params: {
    file_size: unknown; file_size_unit: unknown
    speed: unknown; speed_unit: unknown
}): { hours: number; minutes: number; seconds: number; total_seconds: number } {
    const fileSize = Number(params.file_size) || 0
    const fileSizeUnit = String(params.file_size_unit)
    const speed = Number(params.speed) || 0
    const speedUnit = String(params.speed_unit)

    const fileSizeBits = fileSize * (FILE_SIZE_UNIT_BYTES[fileSizeUnit] || 0) * 8
    const speedBps = speed * (SPEED_UNIT_BPS[speedUnit] || 0)
    const totalSeconds = speedBps > 0 ? fileSizeBits / speedBps : 0

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.round(totalSeconds % 60)
    return { hours, minutes, seconds, total_seconds: totalSeconds }
}
