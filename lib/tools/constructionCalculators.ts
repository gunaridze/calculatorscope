// Construction material / project-planning helpers.
//
// Every function accepts a `unit_system` param ('imperial' | 'metric') and
// branches its math accordingly. Imperial inputs are ft/in and outputs are
// cubic yards/tons; metric inputs are m/cm and outputs are cubic meters/
// tonnes. These are NOT the same formula unit-converted - the imperial and
// metric branches each use their own real-world estimating conventions
// (bag sizes, densities), verified against typical supplier/merchant figures
// rather than derived algebraically from the US numbers:
//   - Concrete bags: US 40/60/80 lb bags (yield 0.30/0.45/0.60 cu ft) vs.
//     EU 20/25 kg bags (yield ~0.010/0.0125 m³ - "~80 bags of 25kg per m³"
//     is a commonly cited merchant figure).
//   - Gravel/sand/roadway fill density: US ~1.4-1.35 short tons/cu yd vs.
//     EU ~1.5 tonnes/m³ (a standard round estimating figure for compacted
//     aggregate/sharp sand).
//   - Topsoil density: US ~1.0 short ton/cu yd vs. EU ~1.2 tonnes/m³
//     (topsoil density varies more than aggregate due to organic content).
//   - Mulch bag: US 2 cu ft retail bag vs. EU 60 litre (0.06 m³) retail bag.
// All figures are documented, adjustable estimating assumptions, not
// universal physical constants - actual material density varies with
// moisture and compaction.

// Rounds up while tolerating floating-point representation error (e.g.
// 200 * 1.10 evaluates to 220.00000000000003 in JS, which would otherwise
// ceil to 221 instead of the correct 220).
function safeCeil(value: number): number {
    return Math.ceil(Math.round(value * 1e6) / 1e6)
}

function isMetric(unitSystem: unknown): boolean {
    return String(unitSystem) === 'metric'
}

// "Concrete Calculator" - slab/footing volume plus bag count
export function concreteCalculator(params: {
    length: unknown; width: unknown; thickness: unknown; unit_system: unknown
}): { volume_cuft?: number; volume_cuyd?: number; bags_80lb?: number; volume_m3?: number; bags_25kg?: number } {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const thickness = Number(params.thickness) || 0
    if (isMetric(params.unit_system)) {
        const volumeM3 = length * width * (thickness / 100)
        return { volume_m3: volumeM3, bags_25kg: safeCeil(volumeM3 / 0.0125) }
    }
    const volumeCuFt = length * width * (thickness / 12)
    return {
        volume_cuft: volumeCuFt,
        volume_cuyd: volumeCuFt / 27,
        bags_80lb: safeCeil(volumeCuFt / 0.6),
    }
}

// "Concrete Bags Calculator" - bag count for standard bag sizes given a
// known required volume. Imperial yields: 40lb=0.30 cu ft, 60lb=0.45 cu ft,
// 80lb=0.60 cu ft. Metric yields: 20kg=0.010 m³, 25kg=0.0125 m³.
export function concreteBagsCalculator(params: { volume: unknown; unit_system: unknown }): {
    bags_40lb?: number; bags_60lb?: number; bags_80lb?: number; bags_20kg?: number; bags_25kg?: number
} {
    const volume = Number(params.volume) || 0
    if (isMetric(params.unit_system)) {
        return { bags_20kg: safeCeil(volume / 0.01), bags_25kg: safeCeil(volume / 0.0125) }
    }
    return {
        bags_40lb: safeCeil(volume / 0.3),
        bags_60lb: safeCeil(volume / 0.45),
        bags_80lb: safeCeil(volume / 0.6),
    }
}

// "Cubic Yards Calculator" - general bulk-material volume
export function cubicYardsCalculator(params: { length: unknown; width: unknown; depth: unknown; unit_system: unknown }): {
    volume_cuyd?: number; volume_m3?: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depth = Number(params.depth) || 0
    if (isMetric(params.unit_system)) {
        return { volume_m3: length * width * depth }
    }
    return { volume_cuyd: (length * width * depth) / 27 }
}

// "Square Footage Calculator"
export function squareFootageCalculator(params: { length: unknown; width: unknown; unit_system: unknown }): {
    sqft?: number; sqyd?: number; sqm?: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const area = length * width
    if (isMetric(params.unit_system)) {
        return { sqm: area }
    }
    return { sqft: area, sqyd: area / 9 }
}

// "Gravel Calculator" - density ~1.4 short tons/cu yd (imperial) or
// ~1.5 tonnes/m³ (metric) for compacted gravel
export function gravelCalculator(params: { length: unknown; width: unknown; depth: unknown; unit_system: unknown }): {
    cuyd?: number; tons?: number; m3?: number; tonnes?: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depth = Number(params.depth) || 0
    if (isMetric(params.unit_system)) {
        const m3 = length * width * (depth / 100)
        return { m3, tonnes: m3 * 1.5 }
    }
    const cuYd = (length * width * (depth / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.4 }
}

// "Mulch Calculator" - standard retail bag: 2 cu ft (imperial) or 60 litres (metric)
export function mulchCalculator(params: { length: unknown; width: unknown; depth: unknown; unit_system: unknown }): {
    cuft?: number; cuyd?: number; volume_m3?: number; bags: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depth = Number(params.depth) || 0
    if (isMetric(params.unit_system)) {
        const volumeM3 = length * width * (depth / 100)
        return { volume_m3: volumeM3, bags: safeCeil(volumeM3 / 0.06) }
    }
    const cuFt = length * width * (depth / 12)
    return { cuft: cuFt, cuyd: cuFt / 27, bags: safeCeil(cuFt / 2) }
}

// "Tank Capacity Calculator" - cylindrical or rectangular tank
export function tankCapacityCalculator(params: {
    shape: unknown; diameter: unknown; length: unknown; width: unknown; height: unknown; unit_system: unknown
}): { volume_cuft?: number; gallons?: number; volume_m3?: number; liters: number } {
    const shape = String(params.shape)
    const height = Number(params.height) || 0
    if (isMetric(params.unit_system)) {
        let volumeM3: number
        if (shape === 'cylindrical') {
            const diameter = Number(params.diameter) || 0
            volumeM3 = Math.PI * (diameter / 2) ** 2 * height
        } else {
            const length = Number(params.length) || 0
            const width = Number(params.width) || 0
            volumeM3 = length * width * height
        }
        return { volume_m3: volumeM3, liters: volumeM3 * 1000 }
    }
    let volumeCuFt: number
    if (shape === 'cylindrical') {
        const diameter = Number(params.diameter) || 0
        volumeCuFt = Math.PI * (diameter / 2) ** 2 * height
    } else {
        const length = Number(params.length) || 0
        const width = Number(params.width) || 0
        volumeCuFt = length * width * height
    }
    const gallons = volumeCuFt * 7.48052
    return { volume_cuft: volumeCuFt, gallons, liters: gallons * 3.785411784 }
}

// "Roadway Fill Calculator" - density ~1.4 short tons/cu yd (imperial) or
// ~1.5 tonnes/m³ (metric), same convention as compacted gravel/base fill
export function roadwayFillCalculator(params: { length: unknown; width: unknown; depth: unknown; unit_system: unknown }): {
    cuyd?: number; tons?: number; m3?: number; tonnes?: number
} {
    return gravelCalculator(params)
}

// "Sand Calculator" - density ~1.35 short tons/cu yd (imperial) or
// ~1.5 tonnes/m³ (metric, sharp/building sand)
export function sandCalculator(params: { length: unknown; width: unknown; depth: unknown; unit_system: unknown }): {
    cuyd?: number; tons?: number; m3?: number; tonnes?: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depth = Number(params.depth) || 0
    if (isMetric(params.unit_system)) {
        const m3 = length * width * (depth / 100)
        return { m3, tonnes: m3 * 1.5 }
    }
    const cuYd = (length * width * (depth / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.35 }
}

// "Topsoil Calculator" - density ~1.0 short ton/cu yd (imperial) or
// ~1.2 tonnes/m³ (metric) - looser than gravel/sand
export function topsoilCalculator(params: { length: unknown; width: unknown; depth: unknown; unit_system: unknown }): {
    cuyd?: number; tons?: number; m3?: number; tonnes?: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depth = Number(params.depth) || 0
    if (isMetric(params.unit_system)) {
        const m3 = length * width * (depth / 100)
        return { m3, tonnes: m3 * 1.2 }
    }
    const cuYd = (length * width * (depth / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.0 }
}

// "Paver Calculator" - includes a 10% waste/cut factor, a common estimating margin
export function paverCalculator(params: {
    area: unknown; paver_length: unknown; paver_width: unknown; unit_system: unknown
}): { paver_area_sqft?: number; paver_area_sqm?: number; pavers_needed: number } {
    const area = Number(params.area) || 0
    const paverLength = Number(params.paver_length) || 1
    const paverWidth = Number(params.paver_width) || 1
    if (isMetric(params.unit_system)) {
        const paverAreaSqM = (paverLength * paverWidth) / 10000
        const paversNeeded = paverAreaSqM > 0 ? safeCeil((area * 1.1) / paverAreaSqM) : 0
        return { paver_area_sqm: paverAreaSqM, pavers_needed: paversNeeded }
    }
    const paverAreaSqFt = (paverLength * paverWidth) / 144
    const paversNeeded = paverAreaSqFt > 0 ? safeCeil((area * 1.1) / paverAreaSqFt) : 0
    return { paver_area_sqft: paverAreaSqFt, pavers_needed: paversNeeded }
}

// "Retaining Wall Block Calculator" - includes a 5% waste/cut factor
export function retainingWallBlockCalculator(params: {
    wall_length: unknown; wall_height: unknown; block_length: unknown; block_height: unknown; unit_system: unknown
}): { wall_area_sqft?: number; block_area_sqft?: number; wall_area_sqm?: number; block_area_sqm?: number; blocks_needed: number } {
    const wallLength = Number(params.wall_length) || 0
    const wallHeight = Number(params.wall_height) || 0
    const blockLength = Number(params.block_length) || 1
    const blockHeight = Number(params.block_height) || 1
    if (isMetric(params.unit_system)) {
        const wallAreaSqM = wallLength * wallHeight
        const blockAreaSqM = (blockLength * blockHeight) / 10000
        const blocksNeeded = blockAreaSqM > 0 ? safeCeil((wallAreaSqM * 1.05) / blockAreaSqM) : 0
        return { wall_area_sqm: wallAreaSqM, block_area_sqm: blockAreaSqM, blocks_needed: blocksNeeded }
    }
    const wallAreaSqFt = wallLength * wallHeight
    const blockAreaSqFt = (blockLength * blockHeight) / 144
    const blocksNeeded = blockAreaSqFt > 0 ? safeCeil((wallAreaSqFt * 1.05) / blockAreaSqFt) : 0
    return { wall_area_sqft: wallAreaSqFt, block_area_sqft: blockAreaSqFt, blocks_needed: blocksNeeded }
}
