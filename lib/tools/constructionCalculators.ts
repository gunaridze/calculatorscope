// Construction material / project-planning helpers.
// All bulk-material density figures (gravel, sand, topsoil, road fill) are
// standard construction-estimating conversion factors, not universal
// physical constants - actual material density varies with moisture and
// compaction, so these are documented, adjustable assumptions rather than
// unstated hard-coded numbers.

// Rounds up while tolerating floating-point representation error (e.g.
// 200 * 1.10 evaluates to 220.00000000000003 in JS, which would otherwise
// ceil to 221 instead of the correct 220).
function safeCeil(value: number): number {
    return Math.ceil(Math.round(value * 1e6) / 1e6)
}

// "Concrete Calculator" - slab/footing volume plus 80lb bag count
export function concreteCalculator(params: {
    length: unknown; width: unknown; thickness: unknown
}): { volume_cuft: number; volume_cuyd: number; bags_80lb: number } {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const thicknessIn = Number(params.thickness) || 0
    const volumeCuFt = length * width * (thicknessIn / 12)
    return {
        volume_cuft: volumeCuFt,
        volume_cuyd: volumeCuFt / 27,
        bags_80lb: safeCeil(volumeCuFt / 0.6),
    }
}

// "Concrete Bags Calculator" - bag count for 3 standard bag sizes given a
// known required volume. Yield figures: 40lb bag = 0.30 cu ft, 60lb = 0.45
// cu ft, 80lb = 0.60 cu ft (standard ready-mix bag yield ratings).
export function concreteBagsCalculator(params: { volume_cuft: unknown }): {
    bags_40lb: number; bags_60lb: number; bags_80lb: number
} {
    const volumeCuFt = Number(params.volume_cuft) || 0
    return {
        bags_40lb: safeCeil(volumeCuFt / 0.3),
        bags_60lb: safeCeil(volumeCuFt / 0.45),
        bags_80lb: safeCeil(volumeCuFt / 0.6),
    }
}

// "Cubic Yards Calculator" - general bulk-material volume, any dimensions in feet
export function cubicYardsCalculator(params: { length: unknown; width: unknown; depth: unknown }): number {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depth = Number(params.depth) || 0
    return (length * width * depth) / 27
}

// "Square Footage Calculator"
export function squareFootageCalculator(params: { length: unknown; width: unknown }): {
    sqft: number; sqyd: number; sqm: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const area = length * width
    return { sqft: area, sqyd: area / 9, sqm: area * 0.092903 }
}

// "Gravel Calculator" - density ~1.4 short tons per cubic yard (compacted gravel)
export function gravelCalculator(params: { length: unknown; width: unknown; depth: unknown }): {
    cuyd: number; tons: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depthIn = Number(params.depth) || 0
    const cuYd = (length * width * (depthIn / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.4 }
}

// "Mulch Calculator" - standard mulch bag = 2 cubic feet
export function mulchCalculator(params: { length: unknown; width: unknown; depth: unknown }): {
    cuft: number; cuyd: number; bags: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depthIn = Number(params.depth) || 0
    const cuFt = length * width * (depthIn / 12)
    return { cuft: cuFt, cuyd: cuFt / 27, bags: safeCeil(cuFt / 2) }
}

// "Tank Capacity Calculator" - cylindrical or rectangular tank
export function tankCapacityCalculator(params: {
    shape: unknown; diameter: unknown; length: unknown; width: unknown; height: unknown
}): { volume_cuft: number; gallons: number; liters: number } {
    const shape = String(params.shape)
    const height = Number(params.height) || 0
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

// "Roadway Fill Calculator" - density ~1.4 short tons per cubic yard (compacted fill/base)
export function roadwayFillCalculator(params: { length: unknown; width: unknown; depth: unknown }): {
    cuyd: number; tons: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depthIn = Number(params.depth) || 0
    const cuYd = (length * width * (depthIn / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.4 }
}

// "Sand Calculator" - density ~1.35 short tons per cubic yard
export function sandCalculator(params: { length: unknown; width: unknown; depth: unknown }): {
    cuyd: number; tons: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depthIn = Number(params.depth) || 0
    const cuYd = (length * width * (depthIn / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.35 }
}

// "Topsoil Calculator" - density ~1.0 short ton per cubic yard (looser than gravel/sand)
export function topsoilCalculator(params: { length: unknown; width: unknown; depth: unknown }): {
    cuyd: number; tons: number
} {
    const length = Number(params.length) || 0
    const width = Number(params.width) || 0
    const depthIn = Number(params.depth) || 0
    const cuYd = (length * width * (depthIn / 12)) / 27
    return { cuyd: cuYd, tons: cuYd * 1.0 }
}

// "Paver Calculator" - includes a 10% waste/cut factor, a common estimating margin
export function paverCalculator(params: {
    area: unknown; paver_length: unknown; paver_width: unknown
}): { paver_area_sqft: number; pavers_needed: number } {
    const area = Number(params.area) || 0
    const paverLengthIn = Number(params.paver_length) || 1
    const paverWidthIn = Number(params.paver_width) || 1
    const paverAreaSqFt = (paverLengthIn * paverWidthIn) / 144
    const paversNeeded = paverAreaSqFt > 0 ? safeCeil((area * 1.1) / paverAreaSqFt) : 0
    return { paver_area_sqft: paverAreaSqFt, pavers_needed: paversNeeded }
}

// "Retaining Wall Block Calculator" - includes a 5% waste/cut factor
export function retainingWallBlockCalculator(params: {
    wall_length: unknown; wall_height: unknown; block_length: unknown; block_height: unknown
}): { wall_area_sqft: number; block_area_sqft: number; blocks_needed: number } {
    const wallLength = Number(params.wall_length) || 0
    const wallHeight = Number(params.wall_height) || 0
    const blockLengthIn = Number(params.block_length) || 1
    const blockHeightIn = Number(params.block_height) || 1
    const wallAreaSqFt = wallLength * wallHeight
    const blockAreaSqFt = (blockLengthIn * blockHeightIn) / 144
    const blocksNeeded = blockAreaSqFt > 0 ? safeCeil((wallAreaSqFt * 1.05) / blockAreaSqFt) : 0
    return { wall_area_sqft: wallAreaSqFt, block_area_sqft: blockAreaSqFt, blocks_needed: blocksNeeded }
}
