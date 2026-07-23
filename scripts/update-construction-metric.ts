// One-off script: retrofits metric-system support onto the 12 existing
// Construction Calculators (tool IDs 1169-1180, category '6'), seeded
// originally as imperial-only.
//
// Per the standing regionalization rule + user confirmation for this
// specific retrofit:
//   - EN: gets an Imperial/Metric toggle (unit_system select), defaults to
//     imperial (unchanged from what already shipped).
//   - RU: gets the same toggle, but defaults to metric (RU is treated as a
//     metric-flavored adaptation, not tied to one country).
//   - DE, LV, PL, IT, ES, FR: metric only, fixed - no toggle shown (the
//     unit_system input is present in config_json for the engine, but each
//     of these locales' inputs_json marks it `hidden: true` so no control
//     renders; CalculatorWidget.tsx skips rendering any input whose
//     fieldConfig.hidden is true).
//
// Metric conventions used (verified via web search against real merchant/
// supplier figures, not just algebraic conversion of the US numbers):
//   - Concrete bags: 20kg (~0.010 m³ yield) and 25kg (~0.0125 m³ yield).
//   - Gravel / sand / roadway fill density: ~1.5 tonnes/m³.
//   - Topsoil density: ~1.2 tonnes/m³.
//   - Mulch retail bag: 60 litres (0.06 m³).
//
// Run with: npx tsx scripts/update-construction-metric.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================
// Shared label dictionaries
// ============================================================
const UNIT_SYSTEM_LABEL: Record<string, string> = {
    en: 'Unit System', ru: 'Система единиц',
}
const IMPERIAL_OPTION_LABEL: Record<string, string> = {
    en: 'Imperial (ft, in, tons)', ru: 'Имперская (футы, дюймы, тонны)',
}
const METRIC_OPTION_LABEL: Record<string, string> = {
    en: 'Metric (m, cm, kg)', ru: 'Метрическая (м, см, кг)',
}
function unitSystemOptions(lang: string) {
    return [
        { value: 'imperial', label: IMPERIAL_OPTION_LABEL[lang] },
        { value: 'metric', label: METRIC_OPTION_LABEL[lang] },
    ]
}

// Dynamic (EN/RU toggle) dimension labels - unitMap resolves the (ft/m),
// (in/cm) suffix shown after the label based on the current unit_system value
const LENGTH_LABEL: Record<string, string> = { en: 'Length', ru: 'Длина' }
const WIDTH_LABEL: Record<string, string> = { en: 'Width', ru: 'Ширина' }
const DEPTH_LABEL: Record<string, string> = { en: 'Depth', ru: 'Глубина' }
const THICKNESS_LABEL: Record<string, string> = { en: 'Thickness', ru: 'Толщина' }
const HEIGHT_LABEL: Record<string, string> = { en: 'Height', ru: 'Высота' }
const DIAMETER_LABEL: Record<string, string> = { en: 'Diameter', ru: 'Диаметр' }
const FT_M_MAP = { imperial: 'ft', metric: 'm' }
const IN_CM_MAP = { imperial: 'in', metric: 'cm' }

// Fixed-metric (DE/LV/PL/IT/ES/FR) static dimension labels - no toggle, so
// the unit is baked directly into the label text like the rest of the site
const LENGTH_M_LABEL: Record<string, string> = {
    de: 'Länge (m)', lv: 'Garums (m)', pl: 'Długość (m)', it: 'Lunghezza (m)', es: 'Largo (m)', fr: 'Longueur (m)',
}
const WIDTH_M_LABEL: Record<string, string> = {
    de: 'Breite (m)', lv: 'Platums (m)', pl: 'Szerokość (m)', it: 'Larghezza (m)', es: 'Ancho (m)', fr: 'Largeur (m)',
}
const DEPTH_CM_LABEL: Record<string, string> = {
    de: 'Tiefe (cm)', lv: 'Dziļums (cm)', pl: 'Głębokość (cm)', it: 'Profondità (cm)', es: 'Profundidad (cm)', fr: 'Profondeur (cm)',
}
const THICKNESS_CM_LABEL: Record<string, string> = {
    de: 'Dicke (cm)', lv: 'Biezums (cm)', pl: 'Grubość (cm)', it: 'Spessore (cm)', es: 'Espesor (cm)', fr: 'Épaisseur (cm)',
}
const HEIGHT_M_LABEL: Record<string, string> = {
    de: 'Höhe (m)', lv: 'Augstums (m)', pl: 'Wysokość (m)', it: 'Altezza (m)', es: 'Altura (m)', fr: 'Hauteur (m)',
}
const DIAMETER_M_LABEL: Record<string, string> = {
    de: 'Durchmesser (m)', lv: 'Diametrs (m)', pl: 'Średnica (m)', it: 'Diametro (m)', es: 'Diámetro (m)', fr: 'Diamètre (m)',
}

// Output labels - static per key; a key with no value returned by the
// active unit_system branch is simply absent from `result`, and the widget
// already skips rendering any output row whose value is undefined, so both
// the imperial-key rows and the metric-key rows can be declared together
// without a runtime toggle mechanism on the output side.
const VOLUME_M3_LABEL: Record<string, string> = {
    en: 'Volume (m³)', ru: 'Объём (м³)', de: 'Volumen (m³)', lv: 'Tilpums (m³)', pl: 'Objętość (m³)',
    it: 'Volume (m³)', es: 'Volumen (m³)', fr: 'Volume (m³)',
}
const TONNES_LABEL: Record<string, string> = {
    en: 'Weight (tonnes)', ru: 'Вес (тонны)', de: 'Gewicht (Tonnen)', lv: 'Svars (tonnas)', pl: 'Waga (tony)',
    it: 'Peso (tonnellate)', es: 'Peso (toneladas)', fr: 'Poids (tonnes)',
}
const SQM_LABEL: Record<string, string> = {
    en: 'Area (m²)', ru: 'Площадь (м²)', de: 'Fläche (m²)', lv: 'Platība (m²)', pl: 'Powierzchnia (m²)',
    it: 'Area (m²)', es: 'Área (m²)', fr: 'Surface (m²)',
}

type ToolUpdate = {
    id: string
    config_json: {
        inputs: Array<{ key: string; default?: number | string }>
        functions: Record<string, { type: string; functionName: string; params: Record<string, string> }>
        outputs: Array<{ key: string; precision?: number }>
    }
    locales: Record<string, {
        inputs: any[]
        outputs: any[]
        key_points?: string[]
        short_answer?: string
        intro_text?: string
    }>
}

async function updateTool(update: ToolUpdate) {
    console.log(`\n🔧 Updating tool "${update.id}" (${Object.keys(update.locales).length} locales)`)

    await prisma.toolConfig.update({
        where: { tool_id: update.id },
        data: { config_json: update.config_json },
    })

    for (const [lang, content] of Object.entries(update.locales)) {
        const data: any = {
            // @ts-ignore
            inputs_json: content.inputs,
            // @ts-ignore
            outputs_json: content.outputs,
        }
        if (content.key_points) data.key_points_json = content.key_points
        if (content.short_answer) data.short_answer = content.short_answer
        if (content.intro_text) data.intro_text = content.intro_text

        await prisma.toolI18n.updateMany({
            where: { tool_id: update.id, lang },
            data,
        })
    }
}

// ============================================================
// 1169: Concrete Calculator
// ============================================================
const update1169: ToolUpdate = {
    id: '1169',
    config_json: {
        inputs: [{ key: 'length', default: 10 }, { key: 'width', default: 10 }, { key: 'thickness', default: 4 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'concreteCalculator', params: { length: 'length', width: 'width', thickness: 'thickness', unit_system: 'unit_system' } } },
        outputs: [{ key: 'volume_cuft', precision: 2 }, { key: 'volume_cuyd', precision: 2 }, { key: 'bags_80lb' }, { key: 'volume_m3', precision: 2 }, { key: 'bags_25kg' }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 10000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 10000 },
                { name: 'thickness', label: THICKNESS_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 4, metric: 10 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'volume_cuft', label: 'Cubic Feet', precision: 2 },
                { name: 'volume_cuyd', label: 'Cubic Yards', precision: 2 },
                { name: 'bags_80lb', label: 'Bags Needed (80 lb)' },
                { name: 'volume_m3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'bags_25kg', label: 'Bags Needed (25 kg)' },
            ],
            key_points: [
                '<b>Imperial formula:</b> Volume = Length × Width × (Thickness ÷ 12), converted to cubic yards by dividing by 27. Example: a 10×10 ft slab at 4 inches = 33.3 cubic feet = 1.23 cubic yards ≈ 56 bags of 80 lb pre-mix.',
                '<b>Metric formula:</b> Volume = Length × Width × (Thickness ÷ 100), in cubic meters. Example: a 3×3 m slab at 10 cm = 0.9 m³ ≈ 72 bags of 25 kg pre-mix.',
                '<b>Switch units</b> using the Unit System selector — all figures recalculate instantly in either Imperial (ft, in, 80 lb bags) or Metric (m, cm, 25 kg bags).',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 10000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 10000 },
                { name: 'thickness', label: THICKNESS_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 4, metric: 10 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'bags_25kg', label: 'Нужно мешков (25 кг)' },
                { name: 'volume_cuft', label: 'Кубические футы', precision: 2 },
                { name: 'volume_cuyd', label: 'Кубические ярды', precision: 2 },
                { name: 'bags_80lb', label: 'Нужно мешков (80 фунтов)' },
            ],
            key_points: [
                '<b>Метрическая формула:</b> Объём = Длина × Ширина × (Толщина ÷ 100), в кубических метрах. Пример: плита 3×3 м толщиной 10 см = 0,9 м³ ≈ 72 мешка смеси по 25 кг.',
                '<b>Имперская формула:</b> Объём = Длина × Ширина × (Толщина ÷ 12), переводится в кубические ярды делением на 27. Пример: плита 10×10 футов толщиной 4 дюйма = 1,23 куб. ярда ≈ 56 мешков по 80 фунтов.',
                '<b>Переключайте систему единиц</b> в селекторе — все значения пересчитываются мгновенно в имперской (футы, дюймы, мешки 80 фунтов) или метрической (м, см, мешки 25 кг) системе.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'thickness', label: THICKNESS_CM_LABEL.de, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.de, precision: 2 },
                { name: 'bags_25kg', label: 'Benötigte Säcke (25 kg)' },
            ],
            key_points: [
                '<b>Formel:</b> Volumen = Länge × Breite × (Dicke ÷ 100), in Kubikmetern.',
                '<b>Beispiel:</b> eine 3×3 m Platte mit 10 cm Dicke = 0,9 m³ ≈ 72 Säcke à 25 kg Fertigmischung.',
                '<b>Sackzahl:</b> basierend auf einem Standardertrag von etwa 0,0125 m³ pro 25-kg-Sack — immer aufrunden und ein paar zusätzliche Säcke für Verschnitt und unebenen Untergrund einplanen.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'thickness', label: DEPTH_CM_LABEL.lv, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.lv, precision: 2 },
                { name: 'bags_25kg', label: 'Nepieciešami maisi (25 kg)' },
            ],
            key_points: [
                '<b>Formula:</b> Tilpums = Garums × Platums × (Biezums ÷ 100), kubikmetros.',
                '<b>Piemērs:</b> 3×3 m plātne ar 10 cm biezumu = 0,9 m³ ≈ 72 maisi 25 kg gatavā maisījuma.',
                '<b>Maisu skaits:</b> pamatojoties uz standarta iznākumu apmēram 0,0125 m³ uz 25 kg maisu — vienmēr noapaļojiet uz augšu un iegādājieties dažus rezerves maisus.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'thickness', label: THICKNESS_CM_LABEL.pl, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.pl, precision: 2 },
                { name: 'bags_25kg', label: 'Potrzebne worki (25 kg)' },
            ],
            key_points: [
                '<b>Wzór:</b> Objętość = Długość × Szerokość × (Grubość ÷ 100), w metrach sześciennych.',
                '<b>Przykład:</b> płyta 3×3 m o grubości 10 cm = 0,9 m³ ≈ 72 worki gotowej mieszanki po 25 kg.',
                '<b>Liczba worków:</b> na podstawie standardowej wydajności około 0,0125 m³ na worek 25 kg — zawsze zaokrąglaj w górę i kup kilka dodatkowych worków na wypadek strat.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'thickness', label: THICKNESS_CM_LABEL.es, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.es, precision: 2 },
                { name: 'bags_25kg', label: 'Bolsas Necesarias (25 kg)' },
            ],
            key_points: [
                '<b>Fórmula:</b> Volumen = Largo × Ancho × (Espesor ÷ 100), en metros cúbicos.',
                '<b>Ejemplo:</b> una losa de 3×3 m con 10 cm de espesor = 0.9 m³ ≈ 72 bolsas de mezcla premezclada de 25 kg.',
                '<b>Número de bolsas:</b> basado en un rendimiento estándar de unos 0.0125 m³ por bolsa de 25 kg — redondea siempre hacia arriba y compra algunas bolsas extra.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'thickness', label: THICKNESS_CM_LABEL.fr, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.fr, precision: 2 },
                { name: 'bags_25kg', label: 'Sacs Nécessaires (25 kg)' },
            ],
            key_points: [
                '<b>Formule :</b> Volume = Longueur × Largeur × (Épaisseur ÷ 100), en mètres cubes.',
                '<b>Exemple :</b> une dalle de 3×3 m de 10 cm d\'épaisseur = 0,9 m³ ≈ 72 sacs de mélange prêt à l\'emploi de 25 kg.',
                '<b>Nombre de sacs :</b> basé sur un rendement standard d\'environ 0,0125 m³ par sac de 25 kg — arrondissez toujours au supérieur et achetez quelques sacs de plus.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'thickness', label: THICKNESS_CM_LABEL.it, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.it, precision: 2 },
                { name: 'bags_25kg', label: 'Sacchi Necessari (25 kg)' },
            ],
            key_points: [
                '<b>Formula:</b> Volume = Lunghezza × Larghezza × (Spessore ÷ 100), in metri cubi.',
                '<b>Esempio:</b> una soletta 3×3 m con spessore di 10 cm = 0,9 m³ ≈ 72 sacchi di premiscelato da 25 kg.',
                '<b>Numero di sacchi:</b> basato su una resa standard di circa 0,0125 m³ per sacco da 25 kg — arrotonda sempre per eccesso e acquista qualche sacco extra.',
            ],
        },
    },
}

// ============================================================
// 1170: Concrete Bags Calculator
// ============================================================
const VOLUME_INPUT_LABEL: Record<string, string> = { en: 'Required Volume', ru: 'Требуемый объём' }
const VOLUME_CUFT_INPUT_M3_MAP = { imperial: 'cu ft', metric: 'm³' }

const update1170: ToolUpdate = {
    id: '1170',
    config_json: {
        inputs: [{ key: 'volume', default: 10 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'concreteBagsCalculator', params: { volume: 'volume', unit_system: 'unit_system' } } },
        outputs: [{ key: 'bags_40lb' }, { key: 'bags_60lb' }, { key: 'bags_80lb' }, { key: 'bags_20kg' }, { key: 'bags_25kg' }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'volume', label: VOLUME_INPUT_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: VOLUME_CUFT_INPUT_M3_MAP, defaultBySystem: { imperial: 10, metric: 0.3 }, min: 0.01, max: 100000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'bags_40lb', label: 'Bags (40 lb)' },
                { name: 'bags_60lb', label: 'Bags (60 lb)' },
                { name: 'bags_80lb', label: 'Bags (80 lb)' },
                { name: 'bags_20kg', label: 'Bags (20 kg)' },
                { name: 'bags_25kg', label: 'Bags (25 kg)' },
            ],
            key_points: [
                '<b>Imperial yields:</b> 40 lb bag ≈ 0.30 cu ft, 60 lb ≈ 0.45 cu ft, 80 lb ≈ 0.60 cu ft. Example: 10 cu ft needs 34/23/17 bags respectively.',
                '<b>Metric yields:</b> 20 kg bag ≈ 0.010 m³, 25 kg bag ≈ 0.0125 m³. Example: 0.3 m³ needs 30 bags at 20 kg or 24 bags at 25 kg.',
                '<b>Don\'t know your volume yet?</b> Use the Concrete Calculator on this site first, in either unit system.',
            ],
        },
        ru: {
            inputs: [
                { name: 'volume', label: VOLUME_INPUT_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: VOLUME_CUFT_INPUT_M3_MAP, defaultBySystem: { imperial: 10, metric: 0.3 }, min: 0.01, max: 100000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'bags_20kg', label: 'Мешков (20 кг)' },
                { name: 'bags_25kg', label: 'Мешков (25 кг)' },
                { name: 'bags_40lb', label: 'Мешков (40 фунтов)' },
                { name: 'bags_60lb', label: 'Мешков (60 фунтов)' },
                { name: 'bags_80lb', label: 'Мешков (80 фунтов)' },
            ],
            key_points: [
                '<b>Метрический выход:</b> мешок 20 кг ≈ 0,010 м³, мешок 25 кг ≈ 0,0125 м³. Пример: 0,3 м³ требует 30 мешков по 20 кг или 24 мешка по 25 кг.',
                '<b>Имперский выход:</b> 40 фунтов ≈ 0,30 куб. фута, 60 фунтов ≈ 0,45 куб. фута, 80 фунтов ≈ 0,60 куб. фута.',
                '<b>Ещё не знаете объём?</b> Сначала используйте Калькулятор бетона на этом сайте, в любой системе единиц.',
            ],
        },
        de: {
            inputs: [
                { name: 'volume', label: 'Benötigtes Volumen (m³)', type: 'number', min: 0.01, max: 10000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'bags_20kg', label: 'Säcke (20 kg)' }, { name: 'bags_25kg', label: 'Säcke (25 kg)' }],
            key_points: [
                '<b>Standardertrag:</b> ein 20-kg-Sack ergibt etwa 0,010 m³, ein 25-kg-Sack etwa 0,0125 m³.',
                '<b>Beispiel:</b> für 0,3 m³ benötigen Sie 30 Säcke à 20 kg oder 24 Säcke à 25 kg.',
                '<b>Kennen Sie Ihr Volumen noch nicht?</b> Nutzen Sie zuerst den Beton-Rechner auf dieser Seite.',
            ],
        },
        lv: {
            inputs: [
                { name: 'volume', label: 'Nepieciešamais tilpums (m³)', type: 'number', min: 0.01, max: 10000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'bags_20kg', label: 'Maisi (20 kg)' }, { name: 'bags_25kg', label: 'Maisi (25 kg)' }],
            key_points: [
                '<b>Standarta iznākums:</b> 20 kg maiss dod apmēram 0,010 m³, 25 kg maiss apmēram 0,0125 m³.',
                '<b>Piemērs:</b> 0,3 m³ nepieciešami 30 maisi pa 20 kg vai 24 maisi pa 25 kg.',
                '<b>Vēl nezināt tilpumu?</b> Vispirms izmantojiet Betona Kalkulatoru šajā vietnē.',
            ],
        },
        pl: {
            inputs: [
                { name: 'volume', label: 'Wymagana objętość (m³)', type: 'number', min: 0.01, max: 10000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'bags_20kg', label: 'Worki (20 kg)' }, { name: 'bags_25kg', label: 'Worki (25 kg)' }],
            key_points: [
                '<b>Standardowa wydajność:</b> worek 20 kg daje około 0,010 m³, worek 25 kg około 0,0125 m³.',
                '<b>Przykład:</b> dla 0,3 m³ potrzeba 30 worków po 20 kg lub 24 worki po 25 kg.',
                '<b>Nie znasz jeszcze objętości?</b> Najpierw skorzystaj z Kalkulatora Betonu na tej stronie.',
            ],
        },
        es: {
            inputs: [
                { name: 'volume', label: 'Volumen Requerido (m³)', type: 'number', min: 0.01, max: 10000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'bags_20kg', label: 'Bolsas (20 kg)' }, { name: 'bags_25kg', label: 'Bolsas (25 kg)' }],
            key_points: [
                '<b>Rendimiento estándar:</b> una bolsa de 20 kg rinde unos 0,010 m³, una de 25 kg unos 0,0125 m³.',
                '<b>Ejemplo:</b> para 0,3 m³ necesitas 30 bolsas de 20 kg o 24 bolsas de 25 kg.',
                '<b>¿Aún no sabes tu volumen?</b> Usa primero la Calculadora de Concreto en este sitio.',
            ],
        },
        fr: {
            inputs: [
                { name: 'volume', label: 'Volume Requis (m³)', type: 'number', min: 0.01, max: 10000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'bags_20kg', label: 'Sacs (20 kg)' }, { name: 'bags_25kg', label: 'Sacs (25 kg)' }],
            key_points: [
                '<b>Rendement standard :</b> un sac de 20 kg donne environ 0,010 m³, un sac de 25 kg environ 0,0125 m³.',
                '<b>Exemple :</b> pour 0,3 m³, il faut 30 sacs de 20 kg ou 24 sacs de 25 kg.',
                '<b>Vous ne connaissez pas encore votre volume ?</b> Utilisez d\'abord le Calculateur de Béton sur ce site.',
            ],
        },
        it: {
            inputs: [
                { name: 'volume', label: 'Volume Richiesto (m³)', type: 'number', min: 0.01, max: 10000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'bags_20kg', label: 'Sacchi (20 kg)' }, { name: 'bags_25kg', label: 'Sacchi (25 kg)' }],
            key_points: [
                '<b>Resa standard:</b> un sacco da 20 kg rende circa 0,010 m³, uno da 25 kg circa 0,0125 m³.',
                '<b>Esempio:</b> per 0,3 m³ servono 30 sacchi da 20 kg o 24 sacchi da 25 kg.',
                '<b>Non conosci ancora il volume?</b> Usa prima il Calcolatore di Calcestruzzo su questo sito.',
            ],
        },
    },
}

// ============================================================
// 1171: Cubic Yards Calculator
// ============================================================
const update1171: ToolUpdate = {
    id: '1171',
    config_json: {
        inputs: [{ key: 'length', default: 10 }, { key: 'width', default: 10 }, { key: 'depth', default: 1 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'cubicYardsCalculator', params: { length: 'length', width: 'width', depth: 'depth', unit_system: 'unit_system' } } },
        outputs: [{ key: 'volume_cuyd', precision: 3 }, { key: 'volume_m3', precision: 3 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 1, metric: 0.3 }, min: 0.01, max: 1000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'volume_cuyd', label: 'Cubic Yards', precision: 3 },
                { name: 'volume_m3', label: VOLUME_M3_LABEL.en, precision: 3 },
            ],
            key_points: [
                '<b>Imperial formula:</b> Cubic Yards = (Length × Width × Depth in feet) ÷ 27. Example: 20×10 ft at 1 ft deep = 7.41 cubic yards.',
                '<b>Metric formula:</b> Cubic Meters = Length × Width × Depth, all in meters. Example: 6×3 m at 0.3 m deep = 5.4 cubic meters.',
                '<b>Works for any bulk material</b> — dirt, gravel, mulch, sand, or concrete — in either unit system.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 1, metric: 0.3 }, min: 0.01, max: 1000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.ru, precision: 3 },
                { name: 'volume_cuyd', label: 'Кубические ярды', precision: 3 },
            ],
            key_points: [
                '<b>Метрическая формула:</b> Куб. метры = Длина × Ширина × Глубина, всё в метрах. Пример: 6×3 м глубиной 0,3 м = 5,4 куб. метра.',
                '<b>Имперская формула:</b> Куб. ярды = (Длина × Ширина × Глубина в футах) ÷ 27. Пример: 20×10 футов глубиной 1 фут = 7,41 куб. ярда.',
                '<b>Подходит для любого сыпучего материала</b> — грунта, щебня, мульчи, песка или бетона — в любой системе единиц.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: 'Tiefe (m)', type: 'number', min: 0.01, max: 1000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.de, precision: 3 }],
            key_points: [
                '<b>Formel:</b> Kubikmeter = Länge × Breite × Tiefe, alles in Metern.',
                '<b>Beispiel:</b> 6×3 m bei 0,3 m Tiefe = 5,4 Kubikmeter.',
                '<b>Geeignet für jedes Schüttgut</b> — Erde, Kies, Mulch, Sand oder Beton.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: 'Dziļums (m)', type: 'number', min: 0.01, max: 1000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.lv, precision: 3 }],
            key_points: [
                '<b>Formula:</b> Kubikmetri = Garums × Platums × Dziļums, viss metros.',
                '<b>Piemērs:</b> 6×3 m ar 0,3 m dziļumu = 5,4 kubikmetri.',
                '<b>Piemērots jebkuram bēra materiālam</b> — zemei, šķembām, mulčai, smiltīm vai betonam.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: 'Głębokość (m)', type: 'number', min: 0.01, max: 1000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.pl, precision: 3 }],
            key_points: [
                '<b>Wzór:</b> Metry sześcienne = Długość × Szerokość × Głębokość, wszystko w metrach.',
                '<b>Przykład:</b> 6×3 m przy głębokości 0,3 m = 5,4 metra sześciennego.',
                '<b>Odpowiedni dla dowolnego materiału sypkiego</b> — ziemi, żwiru, ściółki, piasku lub betonu.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: 'Profundidad (m)', type: 'number', min: 0.01, max: 1000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.es, precision: 3 }],
            key_points: [
                '<b>Fórmula:</b> Metros Cúbicos = Largo × Ancho × Profundidad, todo en metros.',
                '<b>Ejemplo:</b> 6×3 m a 0.3 m de profundidad = 5.4 metros cúbicos.',
                '<b>Sirve para cualquier material a granel</b> — tierra, grava, mantillo, arena u hormigón.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: 'Profondeur (m)', type: 'number', min: 0.01, max: 1000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.fr, precision: 3 }],
            key_points: [
                '<b>Formule :</b> Mètres Cubes = Longueur × Largeur × Profondeur, tout en mètres.',
                '<b>Exemple :</b> 6×3 m à 0,3 m de profondeur = 5,4 mètres cubes.',
                '<b>Convient à tout matériau en vrac</b> — terre, gravier, paillis, sable ou béton.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: 'Profondità (m)', type: 'number', min: 0.01, max: 1000, placeholder: '0.3' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.it, precision: 3 }],
            key_points: [
                '<b>Formula:</b> Metri Cubi = Lunghezza × Larghezza × Profondità, tutto in metri.',
                '<b>Esempio:</b> 6×3 m a 0,3 m di profondità = 5,4 metri cubi.',
                '<b>Adatto a qualsiasi materiale sfuso</b> — terra, ghiaia, pacciame, sabbia o calcestruzzo.',
            ],
        },
    },
}

// ============================================================
// 1172: Square Footage Calculator
// ============================================================
const update1172: ToolUpdate = {
    id: '1172',
    config_json: {
        inputs: [{ key: 'length', default: 12 }, { key: 'width', default: 15 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'squareFootageCalculator', params: { length: 'length', width: 'width', unit_system: 'unit_system' } } },
        outputs: [{ key: 'sqft', precision: 2 }, { key: 'sqyd', precision: 2 }, { key: 'sqm', precision: 2 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 12, metric: 4 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 15, metric: 5 }, min: 0.1, max: 100000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'sqft', label: 'Square Feet', precision: 2 },
                { name: 'sqyd', label: 'Square Yards', precision: 2 },
                { name: 'sqm', label: SQM_LABEL.en, precision: 2 },
            ],
            key_points: [
                '<b>Imperial formula:</b> Area = Length × Width, in feet. Example: 12×15 ft = 180 sq ft = 20 sq yd.',
                '<b>Metric formula:</b> Area = Length × Width, in meters. Example: 4×5 m = 20 m².',
                '<b>Switch units</b> using the Unit System selector to enter dimensions directly in feet or meters.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 12, metric: 4 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 15, metric: 5 }, min: 0.1, max: 100000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'sqm', label: SQM_LABEL.ru, precision: 2 },
                { name: 'sqft', label: 'Квадратные футы', precision: 2 },
                { name: 'sqyd', label: 'Квадратные ярды', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая формула:</b> Площадь = Длина × Ширина, в метрах. Пример: 4×5 м = 20 м².',
                '<b>Имперская формула:</b> Площадь = Длина × Ширина, в футах. Пример: 12×15 футов = 180 кв. футов = 20 кв. ярдов.',
                '<b>Переключайте систему единиц</b> в селекторе, чтобы вводить размеры в футах или метрах.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '4' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'sqm', label: SQM_LABEL.de, precision: 2 }],
            key_points: [
                '<b>Formel:</b> Fläche = Länge × Breite, in Metern.',
                '<b>Beispiel:</b> 4×5 m = 20 m².',
                '<b>Funktioniert für</b> Zimmer, Terrassen, Rasenflächen und andere rechteckige Bereiche.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '4' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'sqm', label: SQM_LABEL.lv, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Platība = Garums × Platums, metros.',
                '<b>Piemērs:</b> 4×5 m = 20 m².',
                '<b>Noder</b> istabām, terasēm, zālieniem un citām taisnstūra formas platībām.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '4' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'sqm', label: SQM_LABEL.pl, precision: 2 }],
            key_points: [
                '<b>Wzór:</b> Powierzchnia = Długość × Szerokość, w metrach.',
                '<b>Przykład:</b> 4×5 m = 20 m².',
                '<b>Przydatny dla</b> pokoi, tarasów, trawników i innych prostokątnych powierzchni.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '4' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'sqm', label: SQM_LABEL.es, precision: 2 }],
            key_points: [
                '<b>Fórmula:</b> Área = Largo × Ancho, en metros.',
                '<b>Ejemplo:</b> 4×5 m = 20 m².',
                '<b>Útil para</b> habitaciones, terrazas, céspedes y otras áreas rectangulares.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '4' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'sqm', label: SQM_LABEL.fr, precision: 2 }],
            key_points: [
                '<b>Formule :</b> Surface = Longueur × Largeur, en mètres.',
                '<b>Exemple :</b> 4×5 m = 20 m².',
                '<b>Utile pour</b> les pièces, terrasses, pelouses et autres surfaces rectangulaires.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '4' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'sqm', label: SQM_LABEL.it, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Area = Lunghezza × Larghezza, in metri.',
                '<b>Esempio:</b> 4×5 m = 20 m².',
                '<b>Utile per</b> stanze, terrazze, prati e altre aree rettangolari.',
            ],
        },
    },
}

// ============================================================
// 1173: Gravel Calculator
// ============================================================
const update1173: ToolUpdate = {
    id: '1173',
    config_json: {
        inputs: [{ key: 'length', default: 20 }, { key: 'width', default: 10 }, { key: 'depth', default: 4 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'gravelCalculator', params: { length: 'length', width: 'width', depth: 'depth', unit_system: 'unit_system' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }, { key: 'm3', precision: 2 }, { key: 'tonnes', precision: 2 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 4, metric: 10 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'cuyd', label: 'Cubic Yards', precision: 2 },
                { name: 'tons', label: 'Tons', precision: 2 },
                { name: 'm3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.en, precision: 2 },
            ],
            key_points: [
                '<b>Imperial:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.4. Example: 20×10 ft at 4 in = 2.47 cubic yards ≈ 3.46 tons.',
                '<b>Metric:</b> Cubic Meters = Length × Width × (Depth in cm ÷ 100); Tonnes = Cubic Meters × 1.5. Example: 6×3 m at 10 cm = 1.8 m³ ≈ 2.7 tonnes.',
                '<b>Density is an estimate</b> in both systems — actual gravel weight varies by type and moisture content.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 4, metric: 10 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'm3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.ru, precision: 2 },
                { name: 'cuyd', label: 'Кубические ярды', precision: 2 },
                { name: 'tons', label: 'Тонны', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая:</b> Куб. метры = Длина × Ширина × (Глубина в см ÷ 100); Тонны = Куб. метры × 1,5. Пример: 6×3 м глубиной 10 см = 1,8 м³ ≈ 2,7 тонны.',
                '<b>Имперская:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,4. Пример: 20×10 футов глубиной 4 дюйма = 2,47 куб. ярда ≈ 3,46 тонны.',
                '<b>Плотность — это оценка</b> в обеих системах — реальный вес щебня зависит от типа и влажности.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.de, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.de, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.de, precision: 2 }],
            key_points: [
                '<b>Formel:</b> Kubikmeter = Länge × Breite × (Tiefe in cm ÷ 100); Tonnen = Kubikmeter × 1,5.',
                '<b>Beispiel:</b> 6×3 m bei 10 cm Tiefe = 1,8 m³ ≈ 2,7 Tonnen.',
                '<b>Dichteannahme:</b> ~1,5 Tonnen pro Kubikmeter, eine gängige Schätzung für verdichteten Kies.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.lv, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.lv, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.lv, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Kubikmetri = Garums × Platums × (Dziļums cm ÷ 100); Tonnas = Kubikmetri × 1,5.',
                '<b>Piemērs:</b> 6×3 m ar 10 cm dziļumu = 1,8 m³ ≈ 2,7 tonnas.',
                '<b>Blīvuma pieņēmums:</b> ~1,5 tonnas uz kubikmetru, izplatīts novērtējums sablīvētām šķembām.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.pl, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.pl, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.pl, precision: 2 }],
            key_points: [
                '<b>Wzór:</b> Metry sześcienne = Długość × Szerokość × (Głębokość w cm ÷ 100); Tony = Metry sześcienne × 1,5.',
                '<b>Przykład:</b> 6×3 m przy głębokości 10 cm = 1,8 m³ ≈ 2,7 tony.',
                '<b>Założenie gęstości:</b> ~1,5 tony na metr sześcienny, popularne oszacowanie dla zagęszczonego żwiru.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.es, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.es, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.es, precision: 2 }],
            key_points: [
                '<b>Fórmula:</b> Metros Cúbicos = Largo × Ancho × (Profundidad en cm ÷ 100); Toneladas = Metros Cúbicos × 1.5.',
                '<b>Ejemplo:</b> 6×3 m a 10 cm de profundidad = 1.8 m³ ≈ 2.7 toneladas.',
                '<b>Suposición de densidad:</b> ~1.5 toneladas por metro cúbico, una estimación común para grava compactada.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.fr, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.fr, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.fr, precision: 2 }],
            key_points: [
                '<b>Formule :</b> Mètres Cubes = Longueur × Largeur × (Profondeur en cm ÷ 100) ; Tonnes = Mètres Cubes × 1,5.',
                '<b>Exemple :</b> 6×3 m à 10 cm de profondeur = 1,8 m³ ≈ 2,7 tonnes.',
                '<b>Hypothèse de densité :</b> ~1,5 tonne par mètre cube, une estimation courante pour du gravier compacté.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.it, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.it, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.it, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Metri Cubi = Lunghezza × Larghezza × (Profondità in cm ÷ 100); Tonnellate = Metri Cubi × 1,5.',
                '<b>Esempio:</b> 6×3 m a 10 cm di profondità = 1,8 m³ ≈ 2,7 tonnellate.',
                '<b>Ipotesi di densità:</b> ~1,5 tonnellate per metro cubo, una stima comune per ghiaia compattata.',
            ],
        },
    },
}

// ============================================================
// 1174: Mulch Calculator
// ============================================================
const update1174: ToolUpdate = {
    id: '1174',
    config_json: {
        inputs: [{ key: 'length', default: 20 }, { key: 'width', default: 10 }, { key: 'depth', default: 3 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'mulchCalculator', params: { length: 'length', width: 'width', depth: 'depth', unit_system: 'unit_system' } } },
        outputs: [{ key: 'cuft', precision: 2 }, { key: 'cuyd', precision: 2 }, { key: 'volume_m3', precision: 2 }, { key: 'bags', precision: 0 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 3, metric: 8 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'cuft', label: 'Cubic Feet', precision: 2 },
                { name: 'cuyd', label: 'Cubic Yards', precision: 2 },
                { name: 'volume_m3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'bags', label: 'Bags Needed', precision: 0 },
            ],
            key_points: [
                '<b>Imperial:</b> Cubic Feet = Length × Width × (Depth in inches ÷ 12); Bags = Cubic Feet ÷ 2 (standard 2 cu ft retail bag). Example: 20×10 ft at 3 in = 50 cu ft ≈ 25 bags.',
                '<b>Metric:</b> Cubic Meters = Length × Width × (Depth in cm ÷ 100); Bags = Cubic Meters ÷ 0.06 (standard 60 litre retail bag). Example: 6×3 m at 8 cm = 1.44 m³ ≈ 24 bags.',
                '<b>Depth guidance:</b> 5-8 cm (2-3 in) is typical for refreshing existing mulch; 8-10 cm (3-4 in) for a new bed.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 3, metric: 8 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'bags', label: 'Нужно мешков', precision: 0 },
                { name: 'cuft', label: 'Кубические футы', precision: 2 },
                { name: 'cuyd', label: 'Кубические ярды', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая:</b> Куб. метры = Длина × Ширина × (Глубина в см ÷ 100); Мешки = Куб. метры ÷ 0,06 (стандартный мешок 60 литров). Пример: 6×3 м глубиной 8 см = 1,44 м³ ≈ 24 мешка.',
                '<b>Имперская:</b> Куб. футы = Длина × Ширина × (Глубина в дюймах ÷ 12); Мешки = Куб. футы ÷ 2. Пример: 20×10 футов глубиной 3 дюйма = 50 куб. футов ≈ 25 мешков.',
                '<b>Рекомендация по глубине:</b> 5-8 см типично для обновления мульчи; 8-10 см для новой клумбы.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.de, type: 'number', min: 0.1, max: 300, placeholder: '8' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.de, precision: 2 },
                { name: 'bags', label: 'Benötigte Säcke (60 l)', precision: 0 },
            ],
            key_points: [
                '<b>Formel:</b> Kubikmeter = Länge × Breite × (Tiefe in cm ÷ 100); Säcke = Kubikmeter ÷ 0,06 (Standard 60-Liter-Sack).',
                '<b>Beispiel:</b> 6×3 m bei 8 cm Tiefe = 1,44 m³ ≈ 24 Säcke.',
                '<b>Tiefenempfehlung:</b> 5-8 cm ist typisch zum Auffrischen von vorhandenem Mulch; 8-10 cm für ein neues Beet.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.lv, type: 'number', min: 0.1, max: 300, placeholder: '8' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.lv, precision: 2 },
                { name: 'bags', label: 'Nepieciešami maisi (60 l)', precision: 0 },
            ],
            key_points: [
                '<b>Formula:</b> Kubikmetri = Garums × Platums × (Dziļums cm ÷ 100); Maisi = Kubikmetri ÷ 0,06 (standarta 60 litru maiss).',
                '<b>Piemērs:</b> 6×3 m ar 8 cm dziļumu = 1,44 m³ ≈ 24 maisi.',
                '<b>Dziļuma ieteikums:</b> 5-8 cm ir tipiski esošas mulčas atjaunošanai; 8-10 cm jaunai dobei.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.pl, type: 'number', min: 0.1, max: 300, placeholder: '8' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.pl, precision: 2 },
                { name: 'bags', label: 'Potrzebne worki (60 l)', precision: 0 },
            ],
            key_points: [
                '<b>Wzór:</b> Metry sześcienne = Długość × Szerokość × (Głębokość w cm ÷ 100); Worki = Metry sześcienne ÷ 0,06 (standardowy worek 60 litrów).',
                '<b>Przykład:</b> 6×3 m przy głębokości 8 cm = 1,44 m³ ≈ 24 worki.',
                '<b>Wskazówka głębokości:</b> 5-8 cm to typowa wartość dla odświeżenia ściółki; 8-10 cm dla nowej rabaty.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.es, type: 'number', min: 0.1, max: 300, placeholder: '8' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.es, precision: 2 },
                { name: 'bags', label: 'Bolsas necesarias (60 l)', precision: 0 },
            ],
            key_points: [
                '<b>Fórmula:</b> Metros Cúbicos = Largo × Ancho × (Profundidad en cm ÷ 100); Bolsas = Metros Cúbicos ÷ 0.06 (bolsa estándar de 60 litros).',
                '<b>Ejemplo:</b> 6×3 m a 8 cm de profundidad = 1.44 m³ ≈ 24 bolsas.',
                '<b>Guía de profundidad:</b> 5-8 cm es típico para renovar mantillo existente; 8-10 cm para un macizo nuevo.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.fr, type: 'number', min: 0.1, max: 300, placeholder: '8' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.fr, precision: 2 },
                { name: 'bags', label: 'Sacs nécessaires (60 l)', precision: 0 },
            ],
            key_points: [
                '<b>Formule :</b> Mètres Cubes = Longueur × Largeur × (Profondeur en cm ÷ 100) ; Sacs = Mètres Cubes ÷ 0,06 (sac standard de 60 litres).',
                '<b>Exemple :</b> 6×3 m à 8 cm de profondeur = 1,44 m³ ≈ 24 sacs.',
                '<b>Conseil de profondeur :</b> 5-8 cm est typique pour rafraîchir un paillis existant ; 8-10 cm pour un nouveau massif.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.it, type: 'number', min: 0.1, max: 300, placeholder: '8' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.it, precision: 2 },
                { name: 'bags', label: 'Sacchi necessari (60 l)', precision: 0 },
            ],
            key_points: [
                '<b>Formula:</b> Metri Cubi = Lunghezza × Larghezza × (Profondità in cm ÷ 100); Sacchi = Metri Cubi ÷ 0,06 (sacco standard da 60 litri).',
                '<b>Esempio:</b> 6×3 m a 8 cm di profondità = 1,44 m³ ≈ 24 sacchi.',
                '<b>Guida profondità:</b> 5-8 cm è tipico per rinnovare pacciame esistente; 8-10 cm per una nuova aiuola.',
            ],
        },
    },
}

// ============================================================
// 1175: Tank Capacity Calculator
// ============================================================
const update1175: ToolUpdate = {
    id: '1175',
    config_json: {
        inputs: [
            { key: 'shape', default: 'cylindrical' }, { key: 'diameter', default: 4 },
            { key: 'length', default: 6 }, { key: 'width', default: 3 }, { key: 'height', default: 5 },
            { key: 'unit_system', default: 'imperial' },
        ],
        functions: { result: { type: 'function', functionName: 'tankCapacityCalculator', params: { shape: 'shape', diameter: 'diameter', length: 'length', width: 'width', height: 'height', unit_system: 'unit_system' } } },
        outputs: [{ key: 'volume_cuft', precision: 2 }, { key: 'gallons', precision: 2 }, { key: 'volume_m3', precision: 2 }, { key: 'liters', precision: 2 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'shape', label: 'Tank Shape', type: 'select', options: [{ value: 'cylindrical', label: 'Cylindrical' }, { value: 'rectangular', label: 'Rectangular' }] },
                { name: 'diameter', label: DIAMETER_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 4, metric: 1.2 }, min: 0.1, max: 10000 },
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 6, metric: 1.8 }, min: 0.1, max: 10000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 3, metric: 0.9 }, min: 0.1, max: 10000 },
                { name: 'height', label: HEIGHT_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 5, metric: 1.5 }, min: 0.1, max: 10000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'volume_cuft', label: 'Volume (cubic feet)', precision: 2 },
                { name: 'gallons', label: 'Volume (US gallons)', precision: 2 },
                { name: 'volume_m3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'liters', label: 'Volume (liters)', precision: 2 },
            ],
            key_points: [
                '<b>Imperial cylindrical:</b> Volume = π × (Diameter ÷ 2)² × Height, in feet, converted to US gallons. Example: 4 ft diameter × 5 ft = 62.83 cu ft ≈ 470.1 gallons.',
                '<b>Metric cylindrical:</b> Volume = π × (Diameter ÷ 2)² × Height, in meters, converted to liters. Example: 1.2 m diameter × 1.5 m = 1.70 m³ ≈ 1696.5 liters.',
                '<b>Rectangular:</b> Volume = Length × Width × Height, in either unit system.',
            ],
        },
        ru: {
            inputs: [
                { name: 'shape', label: 'Форма резервуара', type: 'select', options: [{ value: 'cylindrical', label: 'Цилиндрическая' }, { value: 'rectangular', label: 'Прямоугольная' }] },
                { name: 'diameter', label: DIAMETER_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 4, metric: 1.2 }, min: 0.1, max: 10000 },
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 6, metric: 1.8 }, min: 0.1, max: 10000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 3, metric: 0.9 }, min: 0.1, max: 10000 },
                { name: 'height', label: HEIGHT_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 5, metric: 1.5 }, min: 0.1, max: 10000 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'volume_m3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'liters', label: 'Объём (литры)', precision: 2 },
                { name: 'volume_cuft', label: 'Объём (куб. футы)', precision: 2 },
                { name: 'gallons', label: 'Объём (галлоны США)', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая (цилиндр):</b> Объём = π × (Диаметр ÷ 2)² × Высота, в метрах, переводится в литры. Пример: диаметр 1,2 м × 1,5 м = 1,70 м³ ≈ 1696,5 литра.',
                '<b>Имперская (цилиндр):</b> Объём = π × (Диаметр ÷ 2)² × Высота, в футах, переводится в галлоны США. Пример: диаметр 4 фута × 5 футов = 62,83 куб. фута ≈ 470,1 галлона.',
                '<b>Прямоугольная форма:</b> Объём = Длина × Ширина × Высота, в любой системе единиц.',
            ],
        },
        de: {
            inputs: [
                { name: 'shape', label: 'Tankform', type: 'select', options: [{ value: 'cylindrical', label: 'Zylindrisch' }, { value: 'rectangular', label: 'Rechteckig' }] },
                { name: 'diameter', label: DIAMETER_M_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '1.2' },
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '1.8' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '0.9' },
                { name: 'height', label: HEIGHT_M_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '1.5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.de, precision: 2 }, { name: 'liters', label: 'Volumen (Liter)', precision: 2 }],
            key_points: [
                '<b>Zylindrische Formel:</b> Volumen = π × (Durchmesser ÷ 2)² × Höhe, in Metern, umgerechnet in Liter.',
                '<b>Beispiel:</b> 1,2 m Durchmesser × 1,5 m Höhe = 1,70 m³ ≈ 1696,5 Liter.',
                '<b>Rechteckig:</b> Volumen = Länge × Breite × Höhe.',
            ],
        },
        lv: {
            inputs: [
                { name: 'shape', label: 'Tvertnes Forma', type: 'select', options: [{ value: 'cylindrical', label: 'Cilindriska' }, { value: 'rectangular', label: 'Taisnstūra' }] },
                { name: 'diameter', label: DIAMETER_M_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '1.2' },
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '1.8' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '0.9' },
                { name: 'height', label: HEIGHT_M_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '1.5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.lv, precision: 2 }, { name: 'liters', label: 'Tilpums (litri)', precision: 2 }],
            key_points: [
                '<b>Cilindra formula:</b> Tilpums = π × (Diametrs ÷ 2)² × Augstums, metros, pārrēķināts litros.',
                '<b>Piemērs:</b> 1,2 m diametrs × 1,5 m augstums = 1,70 m³ ≈ 1696,5 litri.',
                '<b>Taisnstūra forma:</b> Tilpums = Garums × Platums × Augstums.',
            ],
        },
        pl: {
            inputs: [
                { name: 'shape', label: 'Kształt Zbiornika', type: 'select', options: [{ value: 'cylindrical', label: 'Cylindryczny' }, { value: 'rectangular', label: 'Prostokątny' }] },
                { name: 'diameter', label: DIAMETER_M_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '1.2' },
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '1.8' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '0.9' },
                { name: 'height', label: HEIGHT_M_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '1.5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.pl, precision: 2 }, { name: 'liters', label: 'Objętość (litry)', precision: 2 }],
            key_points: [
                '<b>Wzór dla cylindra:</b> Objętość = π × (Średnica ÷ 2)² × Wysokość, w metrach, przeliczona na litry.',
                '<b>Przykład:</b> średnica 1,2 m × 1,5 m wysokości = 1,70 m³ ≈ 1696,5 litra.',
                '<b>Prostokątny:</b> Objętość = Długość × Szerokość × Wysokość.',
            ],
        },
        es: {
            inputs: [
                { name: 'shape', label: 'Forma del Tanque', type: 'select', options: [{ value: 'cylindrical', label: 'Cilíndrico' }, { value: 'rectangular', label: 'Rectangular' }] },
                { name: 'diameter', label: DIAMETER_M_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '1.2' },
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '1.8' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '0.9' },
                { name: 'height', label: HEIGHT_M_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '1.5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.es, precision: 2 }, { name: 'liters', label: 'Volumen (litros)', precision: 2 }],
            key_points: [
                '<b>Fórmula cilíndrica:</b> Volumen = π × (Diámetro ÷ 2)² × Altura, en metros, convertido a litros.',
                '<b>Ejemplo:</b> diámetro 1.2 m × altura 1.5 m = 1.70 m³ ≈ 1696.5 litros.',
                '<b>Rectangular:</b> Volumen = Largo × Ancho × Altura.',
            ],
        },
        fr: {
            inputs: [
                { name: 'shape', label: 'Forme du Réservoir', type: 'select', options: [{ value: 'cylindrical', label: 'Cylindrique' }, { value: 'rectangular', label: 'Rectangulaire' }] },
                { name: 'diameter', label: DIAMETER_M_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '1.2' },
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '1.8' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '0.9' },
                { name: 'height', label: HEIGHT_M_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '1.5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.fr, precision: 2 }, { name: 'liters', label: 'Volume (litres)', precision: 2 }],
            key_points: [
                '<b>Formule cylindrique :</b> Volume = π × (Diamètre ÷ 2)² × Hauteur, en mètres, converti en litres.',
                '<b>Exemple :</b> diamètre 1,2 m × hauteur 1,5 m = 1,70 m³ ≈ 1696,5 litres.',
                '<b>Rectangulaire :</b> Volume = Longueur × Largeur × Hauteur.',
            ],
        },
        it: {
            inputs: [
                { name: 'shape', label: 'Forma del Serbatoio', type: 'select', options: [{ value: 'cylindrical', label: 'Cilindrico' }, { value: 'rectangular', label: 'Rettangolare' }] },
                { name: 'diameter', label: DIAMETER_M_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '1.2' },
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '1.8' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '0.9' },
                { name: 'height', label: HEIGHT_M_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '1.5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'volume_m3', label: VOLUME_M3_LABEL.it, precision: 2 }, { name: 'liters', label: 'Volume (litri)', precision: 2 }],
            key_points: [
                '<b>Formula cilindrica:</b> Volume = π × (Diametro ÷ 2)² × Altezza, in metri, convertito in litri.',
                '<b>Esempio:</b> diametro 1,2 m × altezza 1,5 m = 1,70 m³ ≈ 1696,5 litri.',
                '<b>Rettangolare:</b> Volume = Lunghezza × Larghezza × Altezza.',
            ],
        },
    },
}

// ============================================================
// 1176: Roadway Fill Calculator
// ============================================================
const update1176: ToolUpdate = {
    id: '1176',
    config_json: {
        inputs: [{ key: 'length', default: 100 }, { key: 'width', default: 20 }, { key: 'depth', default: 6 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'roadwayFillCalculator', params: { length: 'length', width: 'width', depth: 'depth', unit_system: 'unit_system' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }, { key: 'm3', precision: 2 }, { key: 'tonnes', precision: 2 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 100, metric: 30 }, min: 0.1, max: 1000000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 5 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 6, metric: 15 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'cuyd', label: 'Cubic Yards', precision: 2 },
                { name: 'tons', label: 'Tons', precision: 2 },
                { name: 'm3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.en, precision: 2 },
            ],
            key_points: [
                '<b>Imperial:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.4. Example: 100×20 ft at 6 in = 37.04 cubic yards ≈ 51.85 tons.',
                '<b>Metric:</b> Cubic Meters = Length × Width × (Depth in cm ÷ 100); Tonnes = Cubic Meters × 1.5. Example: 30×5 m at 15 cm = 22.5 m³ ≈ 33.75 tonnes.',
                '<b>Density is an estimate</b> in both systems for compacted road base fill.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 100, metric: 30 }, min: 0.1, max: 1000000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 5 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 6, metric: 15 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'm3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.ru, precision: 2 },
                { name: 'cuyd', label: 'Кубические ярды', precision: 2 },
                { name: 'tons', label: 'Тонны', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая:</b> Куб. метры = Длина × Ширина × (Глубина в см ÷ 100); Тонны = Куб. метры × 1,5. Пример: 30×5 м глубиной 15 см = 22,5 м³ ≈ 33,75 тонны.',
                '<b>Имперская:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,4. Пример: 100×20 футов глубиной 6 дюймов = 37,04 куб. ярда ≈ 51,85 тонны.',
                '<b>Плотность — это оценка</b> в обеих системах для утрамбованного дорожного основания.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 1000000, placeholder: '30' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'depth', label: DEPTH_CM_LABEL.de, type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.de, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.de, precision: 2 }],
            key_points: [
                '<b>Formel:</b> Kubikmeter = Länge × Breite × (Tiefe in cm ÷ 100); Tonnen = Kubikmeter × 1,5.',
                '<b>Beispiel:</b> 30×5 m bei 15 cm Tiefe = 22,5 m³ ≈ 33,75 Tonnen.',
                '<b>Dichteannahme:</b> ~1,5 Tonnen pro Kubikmeter für verdichteten Straßenunterbau.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 1000000, placeholder: '30' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'depth', label: DEPTH_CM_LABEL.lv, type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.lv, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.lv, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Kubikmetri = Garums × Platums × (Dziļums cm ÷ 100); Tonnas = Kubikmetri × 1,5.',
                '<b>Piemērs:</b> 30×5 m ar 15 cm dziļumu = 22,5 m³ ≈ 33,75 tonnas.',
                '<b>Blīvuma pieņēmums:</b> ~1,5 tonnas uz kubikmetru sablīvētai ceļa pamatnei.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 1000000, placeholder: '30' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'depth', label: DEPTH_CM_LABEL.pl, type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.pl, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.pl, precision: 2 }],
            key_points: [
                '<b>Wzór:</b> Metry sześcienne = Długość × Szerokość × (Głębokość w cm ÷ 100); Tony = Metry sześcienne × 1,5.',
                '<b>Przykład:</b> 30×5 m przy głębokości 15 cm = 22,5 m³ ≈ 33,75 tony.',
                '<b>Założenie gęstości:</b> ~1,5 tony na metr sześcienny dla zagęszczonej podbudowy drogowej.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 1000000, placeholder: '30' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'depth', label: DEPTH_CM_LABEL.es, type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.es, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.es, precision: 2 }],
            key_points: [
                '<b>Fórmula:</b> Metros Cúbicos = Largo × Ancho × (Profundidad en cm ÷ 100); Toneladas = Metros Cúbicos × 1.5.',
                '<b>Ejemplo:</b> 30×5 m a 15 cm de profundidad = 22.5 m³ ≈ 33.75 toneladas.',
                '<b>Suposición de densidad:</b> ~1.5 toneladas por metro cúbico para base de carretera compactada.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 1000000, placeholder: '30' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'depth', label: DEPTH_CM_LABEL.fr, type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.fr, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.fr, precision: 2 }],
            key_points: [
                '<b>Formule :</b> Mètres Cubes = Longueur × Largeur × (Profondeur en cm ÷ 100) ; Tonnes = Mètres Cubes × 1,5.',
                '<b>Exemple :</b> 30×5 m à 15 cm de profondeur = 22,5 m³ ≈ 33,75 tonnes.',
                '<b>Hypothèse de densité :</b> ~1,5 tonne par mètre cube pour base de route compactée.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 1000000, placeholder: '30' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '5' },
                { name: 'depth', label: DEPTH_CM_LABEL.it, type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.it, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.it, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Metri Cubi = Lunghezza × Larghezza × (Profondità in cm ÷ 100); Tonnellate = Metri Cubi × 1,5.',
                '<b>Esempio:</b> 30×5 m a 15 cm di profondità = 22,5 m³ ≈ 33,75 tonnellate.',
                '<b>Ipotesi di densità:</b> ~1,5 tonnellate per metro cubo per base stradale compattata.',
            ],
        },
    },
}

// ============================================================
// 1177: Sand Calculator
// ============================================================
const update1177: ToolUpdate = {
    id: '1177',
    config_json: {
        inputs: [{ key: 'length', default: 15 }, { key: 'width', default: 10 }, { key: 'depth', default: 2 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'sandCalculator', params: { length: 'length', width: 'width', depth: 'depth', unit_system: 'unit_system' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }, { key: 'm3', precision: 2 }, { key: 'tonnes', precision: 2 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 15, metric: 4.5 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 2, metric: 5 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'cuyd', label: 'Cubic Yards', precision: 2 },
                { name: 'tons', label: 'Tons', precision: 2 },
                { name: 'm3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.en, precision: 2 },
            ],
            key_points: [
                '<b>Imperial:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.35. Example: 15×10 ft at 2 in = 0.93 cubic yards ≈ 1.25 tons.',
                '<b>Metric:</b> Cubic Meters = Length × Width × (Depth in cm ÷ 100); Tonnes = Cubic Meters × 1.5. Example: 4.5×3 m at 5 cm = 0.675 m³ ≈ 1.01 tonnes.',
                '<b>Density is an estimate</b> in both systems for typical building/sharp sand.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 15, metric: 4.5 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 10, metric: 3 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 2, metric: 5 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'm3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.ru, precision: 2 },
                { name: 'cuyd', label: 'Кубические ярды', precision: 2 },
                { name: 'tons', label: 'Тонны', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая:</b> Куб. метры = Длина × Ширина × (Глубина в см ÷ 100); Тонны = Куб. метры × 1,5. Пример: 4,5×3 м глубиной 5 см = 0,675 м³ ≈ 1,01 тонны.',
                '<b>Имперская:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,35. Пример: 15×10 футов глубиной 2 дюйма = 0,93 куб. ярда ≈ 1,25 тонны.',
                '<b>Плотность — это оценка</b> в обеих системах для обычного строительного песка.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.de, type: 'number', min: 0.1, max: 300, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.de, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.de, precision: 2 }],
            key_points: [
                '<b>Formel:</b> Kubikmeter = Länge × Breite × (Tiefe in cm ÷ 100); Tonnen = Kubikmeter × 1,5.',
                '<b>Beispiel:</b> 4,5×3 m bei 5 cm Tiefe = 0,675 m³ ≈ 1,01 Tonnen.',
                '<b>Dichteannahme:</b> ~1,5 Tonnen pro Kubikmeter für typischen Bausand.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.lv, type: 'number', min: 0.1, max: 300, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.lv, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.lv, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Kubikmetri = Garums × Platums × (Dziļums cm ÷ 100); Tonnas = Kubikmetri × 1,5.',
                '<b>Piemērs:</b> 4,5×3 m ar 5 cm dziļumu = 0,675 m³ ≈ 1,01 tonnas.',
                '<b>Blīvuma pieņēmums:</b> ~1,5 tonnas uz kubikmetru parastai būvniecības smiltij.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.pl, type: 'number', min: 0.1, max: 300, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.pl, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.pl, precision: 2 }],
            key_points: [
                '<b>Wzór:</b> Metry sześcienne = Długość × Szerokość × (Głębokość w cm ÷ 100); Tony = Metry sześcienne × 1,5.',
                '<b>Przykład:</b> 4,5×3 m przy głębokości 5 cm = 0,675 m³ ≈ 1,01 tony.',
                '<b>Założenie gęstości:</b> ~1,5 tony na metr sześcienny dla typowego piasku budowlanego.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.es, type: 'number', min: 0.1, max: 300, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.es, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.es, precision: 2 }],
            key_points: [
                '<b>Fórmula:</b> Metros Cúbicos = Largo × Ancho × (Profundidad en cm ÷ 100); Toneladas = Metros Cúbicos × 1.5.',
                '<b>Ejemplo:</b> 4.5×3 m a 5 cm de profundidad = 0.675 m³ ≈ 1.01 toneladas.',
                '<b>Suposición de densidad:</b> ~1.5 toneladas por metro cúbico para arena de construcción típica.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.fr, type: 'number', min: 0.1, max: 300, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.fr, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.fr, precision: 2 }],
            key_points: [
                '<b>Formule :</b> Mètres Cubes = Longueur × Largeur × (Profondeur en cm ÷ 100) ; Tonnes = Mètres Cubes × 1,5.',
                '<b>Exemple :</b> 4,5×3 m à 5 cm de profondeur = 0,675 m³ ≈ 1,01 tonne.',
                '<b>Hypothèse de densité :</b> ~1,5 tonne par mètre cube pour du sable de construction typique.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '3' },
                { name: 'depth', label: DEPTH_CM_LABEL.it, type: 'number', min: 0.1, max: 300, placeholder: '5' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.it, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.it, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Metri Cubi = Lunghezza × Larghezza × (Profondità in cm ÷ 100); Tonnellate = Metri Cubi × 1,5.',
                '<b>Esempio:</b> 4,5×3 m a 5 cm di profondità = 0,675 m³ ≈ 1,01 tonnellate.',
                '<b>Ipotesi di densità:</b> ~1,5 tonnellate per metro cubo per la tipica sabbia da costruzione.',
            ],
        },
    },
}

// ============================================================
// 1178: Topsoil Calculator
// ============================================================
const update1178: ToolUpdate = {
    id: '1178',
    config_json: {
        inputs: [{ key: 'length', default: 20 }, { key: 'width', default: 15 }, { key: 'depth', default: 4 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'topsoilCalculator', params: { length: 'length', width: 'width', depth: 'depth', unit_system: 'unit_system' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }, { key: 'm3', precision: 2 }, { key: 'tonnes', precision: 2 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 15, metric: 4.5 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 4, metric: 10 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'cuyd', label: 'Cubic Yards', precision: 2 },
                { name: 'tons', label: 'Tons', precision: 2 },
                { name: 'm3', label: VOLUME_M3_LABEL.en, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.en, precision: 2 },
            ],
            key_points: [
                '<b>Imperial:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.0. Example: 20×15 ft at 4 in = 3.70 cubic yards ≈ 3.70 tons.',
                '<b>Metric:</b> Cubic Meters = Length × Width × (Depth in cm ÷ 100); Tonnes = Cubic Meters × 1.2. Example: 6×4.5 m at 10 cm = 2.7 m³ ≈ 3.24 tonnes.',
                '<b>Density is an estimate</b> in both systems — topsoil is lighter than sand or gravel due to its organic content.',
            ],
        },
        ru: {
            inputs: [
                { name: 'length', label: LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 15, metric: 4.5 }, min: 0.1, max: 100000 },
                { name: 'depth', label: DEPTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 4, metric: 10 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'm3', label: VOLUME_M3_LABEL.ru, precision: 2 },
                { name: 'tonnes', label: TONNES_LABEL.ru, precision: 2 },
                { name: 'cuyd', label: 'Кубические ярды', precision: 2 },
                { name: 'tons', label: 'Тонны', precision: 2 },
            ],
            key_points: [
                '<b>Метрическая:</b> Куб. метры = Длина × Ширина × (Глубина в см ÷ 100); Тонны = Куб. метры × 1,2. Пример: 6×4,5 м глубиной 10 см = 2,7 м³ ≈ 3,24 тонны.',
                '<b>Имперская:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,0. Пример: 20×15 футов глубиной 4 дюйма = 3,70 куб. ярда ≈ 3,70 тонны.',
                '<b>Плотность — это оценка</b> в обеих системах — грунт легче песка или щебня из-за органики.',
            ],
        },
        de: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'depth', label: DEPTH_CM_LABEL.de, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.de, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.de, precision: 2 }],
            key_points: [
                '<b>Formel:</b> Kubikmeter = Länge × Breite × (Tiefe in cm ÷ 100); Tonnen = Kubikmeter × 1,2.',
                '<b>Beispiel:</b> 6×4,5 m bei 10 cm Tiefe = 2,7 m³ ≈ 3,24 Tonnen.',
                '<b>Dichteannahme:</b> ~1,2 Tonnen pro Kubikmeter für losen Mutterboden.',
            ],
        },
        lv: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'depth', label: DEPTH_CM_LABEL.lv, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.lv, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.lv, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Kubikmetri = Garums × Platums × (Dziļums cm ÷ 100); Tonnas = Kubikmetri × 1,2.',
                '<b>Piemērs:</b> 6×4,5 m ar 10 cm dziļumu = 2,7 m³ ≈ 3,24 tonnas.',
                '<b>Blīvuma pieņēmums:</b> ~1,2 tonnas uz kubikmetru irdenai augsnei.',
            ],
        },
        pl: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'depth', label: DEPTH_CM_LABEL.pl, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.pl, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.pl, precision: 2 }],
            key_points: [
                '<b>Wzór:</b> Metry sześcienne = Długość × Szerokość × (Głębokość w cm ÷ 100); Tony = Metry sześcienne × 1,2.',
                '<b>Przykład:</b> 6×4,5 m przy głębokości 10 cm = 2,7 m³ ≈ 3,24 tony.',
                '<b>Założenie gęstości:</b> ~1,2 tony na metr sześcienny dla luźnej ziemi urodzajnej.',
            ],
        },
        es: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'depth', label: DEPTH_CM_LABEL.es, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.es, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.es, precision: 2 }],
            key_points: [
                '<b>Fórmula:</b> Metros Cúbicos = Largo × Ancho × (Profundidad en cm ÷ 100); Toneladas = Metros Cúbicos × 1.2.',
                '<b>Ejemplo:</b> 6×4.5 m a 10 cm de profundidad = 2.7 m³ ≈ 3.24 toneladas.',
                '<b>Suposición de densidad:</b> ~1.2 toneladas por metro cúbico para tierra vegetal suelta.',
            ],
        },
        fr: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'depth', label: DEPTH_CM_LABEL.fr, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.fr, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.fr, precision: 2 }],
            key_points: [
                '<b>Formule :</b> Mètres Cubes = Longueur × Largeur × (Profondeur en cm ÷ 100) ; Tonnes = Mètres Cubes × 1,2.',
                '<b>Exemple :</b> 6×4,5 m à 10 cm de profondeur = 2,7 m³ ≈ 3,24 tonnes.',
                '<b>Hypothèse de densité :</b> ~1,2 tonne par mètre cube pour de la terre végétale meuble.',
            ],
        },
        it: {
            inputs: [
                { name: 'length', label: LENGTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'width', label: WIDTH_M_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '4.5' },
                { name: 'depth', label: DEPTH_CM_LABEL.it, type: 'number', min: 0.1, max: 300, placeholder: '10' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [{ name: 'm3', label: VOLUME_M3_LABEL.it, precision: 2 }, { name: 'tonnes', label: TONNES_LABEL.it, precision: 2 }],
            key_points: [
                '<b>Formula:</b> Metri Cubi = Lunghezza × Larghezza × (Profondità in cm ÷ 100); Tonnellate = Metri Cubi × 1,2.',
                '<b>Esempio:</b> 6×4,5 m a 10 cm di profondità = 2,7 m³ ≈ 3,24 tonnellate.',
                '<b>Ipotesi di densità:</b> ~1,2 tonnellate per metro cubo per terriccio sciolto.',
            ],
        },
    },
}

// ============================================================
// 1179: Paver Calculator
// ============================================================
const AREA_INPUT_LABEL: Record<string, string> = { en: 'Area to Cover', ru: 'Площадь покрытия' }
const AREA_SQFT_SQM_MAP = { imperial: 'sq ft', metric: 'm²' }
const PAVER_LENGTH_LABEL: Record<string, string> = { en: 'Paver Length', ru: 'Длина плитки' }
const PAVER_WIDTH_LABEL: Record<string, string> = { en: 'Paver Width', ru: 'Ширина плитки' }

const update1179: ToolUpdate = {
    id: '1179',
    config_json: {
        inputs: [{ key: 'area', default: 200 }, { key: 'paver_length', default: 12 }, { key: 'paver_width', default: 6 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'paverCalculator', params: { area: 'area', paver_length: 'paver_length', paver_width: 'paver_width', unit_system: 'unit_system' } } },
        outputs: [{ key: 'paver_area_sqft', precision: 3 }, { key: 'paver_area_sqm', precision: 3 }, { key: 'pavers_needed', precision: 0 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'area', label: AREA_INPUT_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: AREA_SQFT_SQM_MAP, defaultBySystem: { imperial: 200, metric: 18 }, min: 0.1, max: 1000000 },
                { name: 'paver_length', label: PAVER_LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 12, metric: 30 }, min: 0.1, max: 300 },
                { name: 'paver_width', label: PAVER_WIDTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 6, metric: 15 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'paver_area_sqft', label: 'Area per Paver (sq ft)', precision: 3 },
                { name: 'paver_area_sqm', label: 'Area per Paver (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Pavers Needed (incl. 10% waste)', precision: 0 },
            ],
            key_points: [
                '<b>Imperial:</b> Area per Paver = (Length × Width in inches) ÷ 144; Pavers Needed = (Area × 1.10) ÷ Area per Paver. Example: 200 sq ft with 12×6 in pavers = 440 pavers.',
                '<b>Metric:</b> Area per Paver = (Length × Width in cm) ÷ 10000; Pavers Needed = (Area × 1.10) ÷ Area per Paver. Example: 18 m² with 30×15 cm pavers = 440 pavers.',
                '<b>Why add 10%?</b> cutting pavers around edges and curves always creates some waste, in either unit system.',
            ],
        },
        ru: {
            inputs: [
                { name: 'area', label: AREA_INPUT_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: AREA_SQFT_SQM_MAP, defaultBySystem: { imperial: 200, metric: 18 }, min: 0.1, max: 1000000 },
                { name: 'paver_length', label: PAVER_LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 12, metric: 30 }, min: 0.1, max: 300 },
                { name: 'paver_width', label: PAVER_WIDTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 6, metric: 15 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Площадь одной плитки (м²)', precision: 3 },
                { name: 'pavers_needed', label: 'Нужно плиток (с запасом 10%)', precision: 0 },
                { name: 'paver_area_sqft', label: 'Площадь одной плитки (кв. футы)', precision: 3 },
            ],
            key_points: [
                '<b>Метрическая:</b> Площадь плитки = (Длина × Ширина в см) ÷ 10000; Нужно плиток = (Площадь × 1,10) ÷ Площадь плитки. Пример: 18 м² плиткой 30×15 см = 440 плиток.',
                '<b>Имперская:</b> Площадь плитки = (Длина × Ширина в дюймах) ÷ 144; Нужно плиток = (Площадь × 1,10) ÷ Площадь плитки. Пример: 200 кв. футов плиткой 12×6 дюймов = 440 плиток.',
                '<b>Зачем добавлять 10%?</b> подрезка плитки по краям и изгибам всегда создаёт отходы, в любой системе единиц.',
            ],
        },
        de: {
            inputs: [
                { name: 'area', label: 'Zu bedeckende Fläche (m²)', type: 'number', min: 0.1, max: 1000000, placeholder: '18' },
                { name: 'paver_length', label: 'Pflasterstein-Länge (cm)', type: 'number', min: 0.1, max: 300, placeholder: '30' },
                { name: 'paver_width', label: 'Pflasterstein-Breite (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Fläche pro Pflasterstein (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Benötigte Pflastersteine (inkl. 10% Verschnitt)', precision: 0 },
            ],
            key_points: [
                '<b>Formel:</b> Fläche pro Stein = (Länge × Breite in cm) ÷ 10000; Benötigte Steine = (Fläche × 1,10) ÷ Fläche pro Stein.',
                '<b>Beispiel:</b> 18 m² mit 30×15 cm Steinen = 440 Steine.',
                '<b>Warum 10% hinzufügen?</b> das Schneiden von Steinen an Rändern und Kurven erzeugt immer etwas Verschnitt.',
            ],
        },
        lv: {
            inputs: [
                { name: 'area', label: 'Segjamā platība (m²)', type: 'number', min: 0.1, max: 1000000, placeholder: '18' },
                { name: 'paver_length', label: 'Bruģakmens garums (cm)', type: 'number', min: 0.1, max: 300, placeholder: '30' },
                { name: 'paver_width', label: 'Bruģakmens platums (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Platība uz bruģakmeni (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Nepieciešami bruģakmeņi (ar 10% rezervi)', precision: 0 },
            ],
            key_points: [
                '<b>Formula:</b> Platība uz akmeni = (Garums × Platums cm) ÷ 10000; Nepieciešami akmeņi = (Platība × 1,10) ÷ Platība uz akmeni.',
                '<b>Piemērs:</b> 18 m² ar 30×15 cm bruģakmeņiem = 440 akmeņi.',
                '<b>Kāpēc pievienot 10%?</b> bruģakmeņu griešana ap malām un līkumiem vienmēr rada atkritumus.',
            ],
        },
        pl: {
            inputs: [
                { name: 'area', label: 'Powierzchnia do pokrycia (m²)', type: 'number', min: 0.1, max: 1000000, placeholder: '18' },
                { name: 'paver_length', label: 'Długość kostki (cm)', type: 'number', min: 0.1, max: 300, placeholder: '30' },
                { name: 'paver_width', label: 'Szerokość kostki (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Powierzchnia na kostkę (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Potrzebne kostki (z 10% zapasem)', precision: 0 },
            ],
            key_points: [
                '<b>Wzór:</b> Powierzchnia kostki = (Długość × Szerokość w cm) ÷ 10000; Potrzebne kostki = (Powierzchnia × 1,10) ÷ Powierzchnia kostki.',
                '<b>Przykład:</b> 18 m² z kostką 30×15 cm = 440 kostek.',
                '<b>Dlaczego dodać 10%?</b> cięcie kostki wokół krawędzi i zakrętów zawsze tworzy odpady.',
            ],
        },
        es: {
            inputs: [
                { name: 'area', label: 'Área a Cubrir (m²)', type: 'number', min: 0.1, max: 1000000, placeholder: '18' },
                { name: 'paver_length', label: 'Largo del Adoquín (cm)', type: 'number', min: 0.1, max: 300, placeholder: '30' },
                { name: 'paver_width', label: 'Ancho del Adoquín (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Área por Adoquín (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Adoquines Necesarios (con 10% de margen)', precision: 0 },
            ],
            key_points: [
                '<b>Fórmula:</b> Área por Adoquín = (Largo × Ancho en cm) ÷ 10000; Adoquines Necesarios = (Área × 1.10) ÷ Área por Adoquín.',
                '<b>Ejemplo:</b> 18 m² con adoquines de 30×15 cm = 440 adoquines.',
                '<b>¿Por qué añadir 10%?</b> cortar adoquines alrededor de bordes y curvas siempre genera desperdicio.',
            ],
        },
        fr: {
            inputs: [
                { name: 'area', label: 'Surface à Couvrir (m²)', type: 'number', min: 0.1, max: 1000000, placeholder: '18' },
                { name: 'paver_length', label: 'Longueur du Pavé (cm)', type: 'number', min: 0.1, max: 300, placeholder: '30' },
                { name: 'paver_width', label: 'Largeur du Pavé (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Surface par Pavé (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Pavés Nécessaires (avec 10% de marge)', precision: 0 },
            ],
            key_points: [
                '<b>Formule :</b> Surface par Pavé = (Longueur × Largeur en cm) ÷ 10000 ; Pavés Nécessaires = (Surface × 1,10) ÷ Surface par Pavé.',
                '<b>Exemple :</b> 18 m² avec des pavés de 30×15 cm = 440 pavés.',
                '<b>Pourquoi ajouter 10% ?</b> couper des pavés autour des bords et des courbes crée toujours des pertes.',
            ],
        },
        it: {
            inputs: [
                { name: 'area', label: 'Area da Coprire (m²)', type: 'number', min: 0.1, max: 1000000, placeholder: '18' },
                { name: 'paver_length', label: 'Lunghezza della Pavimentazione (cm)', type: 'number', min: 0.1, max: 300, placeholder: '30' },
                { name: 'paver_width', label: 'Larghezza della Pavimentazione (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'paver_area_sqm', label: 'Area per Pavimentazione (m²)', precision: 3 },
                { name: 'pavers_needed', label: 'Pavimentazione Necessaria (con 10% di scarto)', precision: 0 },
            ],
            key_points: [
                '<b>Formula:</b> Area per Piastrella = (Lunghezza × Larghezza in cm) ÷ 10000; Piastrelle Necessarie = (Area × 1,10) ÷ Area per Piastrella.',
                '<b>Esempio:</b> 18 m² con piastrelle 30×15 cm = 440 piastrelle.',
                '<b>Perché aggiungere il 10%?</b> tagliare le piastrelle intorno a bordi e curve crea sempre scarto.',
            ],
        },
    },
}

// ============================================================
// 1180: Retaining Wall Block Calculator
// ============================================================
const WALL_LENGTH_LABEL: Record<string, string> = { en: 'Wall Length', ru: 'Длина стены' }
const WALL_HEIGHT_LABEL: Record<string, string> = { en: 'Wall Height', ru: 'Высота стены' }
const BLOCK_LENGTH_LABEL: Record<string, string> = { en: 'Block Length', ru: 'Длина блока' }
const BLOCK_HEIGHT_LABEL: Record<string, string> = { en: 'Block Height', ru: 'Высота блока' }

const update1180: ToolUpdate = {
    id: '1180',
    config_json: {
        inputs: [{ key: 'wall_length', default: 20 }, { key: 'wall_height', default: 3 }, { key: 'block_length', default: 18 }, { key: 'block_height', default: 6 }, { key: 'unit_system', default: 'imperial' }],
        functions: { result: { type: 'function', functionName: 'retainingWallBlockCalculator', params: { wall_length: 'wall_length', wall_height: 'wall_height', block_length: 'block_length', block_height: 'block_height', unit_system: 'unit_system' } } },
        outputs: [{ key: 'wall_area_sqft', precision: 2 }, { key: 'block_area_sqft', precision: 3 }, { key: 'wall_area_sqm', precision: 2 }, { key: 'block_area_sqm', precision: 3 }, { key: 'blocks_needed', precision: 0 }],
    },
    locales: {
        en: {
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'wall_height', label: WALL_HEIGHT_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 3, metric: 1 }, min: 0.1, max: 1000 },
                { name: 'block_length', label: BLOCK_LENGTH_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 18, metric: 45 }, min: 0.1, max: 300 },
                { name: 'block_height', label: BLOCK_HEIGHT_LABEL.en, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 6, metric: 15 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.en, type: 'select', options: unitSystemOptions('en'), default: 'imperial' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: 'Wall Area (sq ft)', precision: 2 },
                { name: 'block_area_sqft', label: 'Area per Block (sq ft)', precision: 3 },
                { name: 'wall_area_sqm', label: 'Wall Area (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Area per Block (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Blocks Needed (incl. 5% waste)', precision: 0 },
            ],
            key_points: [
                '<b>Imperial:</b> Area per Block = (Length × Height in inches) ÷ 144; Blocks Needed = (Wall Area × 1.05) ÷ Area per Block. Example: 20×3 ft wall with 18×6 in blocks = 84 blocks.',
                '<b>Metric:</b> Area per Block = (Length × Height in cm) ÷ 10000; Blocks Needed = (Wall Area × 1.05) ÷ Area per Block. Example: 6×1 m wall with 45×15 cm blocks = 94 blocks.',
                '<b>Note:</b> this estimates the visible face blocks only, in either unit system — it does not include base/foundation blocks, capstones, or drainage gravel.',
            ],
        },
        ru: {
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 20, metric: 6 }, min: 0.1, max: 100000 },
                { name: 'wall_height', label: WALL_HEIGHT_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: FT_M_MAP, defaultBySystem: { imperial: 3, metric: 1 }, min: 0.1, max: 1000 },
                { name: 'block_length', label: BLOCK_LENGTH_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 18, metric: 45 }, min: 0.1, max: 300 },
                { name: 'block_height', label: BLOCK_HEIGHT_LABEL.ru, type: 'number', unitFrom: 'unit_system', unitMap: IN_CM_MAP, defaultBySystem: { imperial: 6, metric: 15 }, min: 0.1, max: 300 },
                { name: 'unit_system', label: UNIT_SYSTEM_LABEL.ru, type: 'select', options: unitSystemOptions('ru'), default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Площадь стены (м²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Площадь одного блока (м²)', precision: 3 },
                { name: 'blocks_needed', label: 'Нужно блоков (с запасом 5%)', precision: 0 },
                { name: 'wall_area_sqft', label: 'Площадь стены (кв. футы)', precision: 2 },
                { name: 'block_area_sqft', label: 'Площадь одного блока (кв. футы)', precision: 3 },
            ],
            key_points: [
                '<b>Метрическая:</b> Площадь блока = (Длина × Высота в см) ÷ 10000; Нужно блоков = (Площадь стены × 1,05) ÷ Площадь блока. Пример: стена 6×1 м с блоками 45×15 см = 94 блока.',
                '<b>Имперская:</b> Площадь блока = (Длина × Высота в дюймах) ÷ 144; Нужно блоков = (Площадь стены × 1,05) ÷ Площадь блока. Пример: стена 20×3 фута с блоками 18×6 дюймов = 84 блока.',
                '<b>Примечание:</b> это оценка только лицевых блоков, в любой системе единиц — не включает базовые блоки, крышки или дренажный щебень.',
            ],
        },
        de: {
            inputs: [
                { name: 'wall_length', label: 'Wandlänge (m)', type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'wall_height', label: 'Wandhöhe (m)', type: 'number', min: 0.1, max: 1000, placeholder: '1' },
                { name: 'block_length', label: 'Blocklänge (cm)', type: 'number', min: 0.1, max: 300, placeholder: '45' },
                { name: 'block_height', label: 'Blockhöhe (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Wandfläche (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Fläche pro Block (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Benötigte Blöcke (inkl. 5% Verschnitt)', precision: 0 },
            ],
            key_points: [
                '<b>Formel:</b> Fläche pro Block = (Länge × Höhe in cm) ÷ 10000; Benötigte Blöcke = (Wandfläche × 1,05) ÷ Fläche pro Block.',
                '<b>Beispiel:</b> 6×1 m Wand mit 45×15 cm Blöcken = 94 Blöcke.',
                '<b>Hinweis:</b> dies schätzt nur die sichtbaren Frontblöcke — ohne Basis-/Fundamentblöcke, Abdecksteine oder Dränagekies.',
            ],
        },
        lv: {
            inputs: [
                { name: 'wall_length', label: 'Sienas garums (m)', type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'wall_height', label: 'Sienas augstums (m)', type: 'number', min: 0.1, max: 1000, placeholder: '1' },
                { name: 'block_length', label: 'Bloka garums (cm)', type: 'number', min: 0.1, max: 300, placeholder: '45' },
                { name: 'block_height', label: 'Bloka augstums (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Sienas platība (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Platība uz bloku (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Nepieciešami bloki (ar 5% rezervi)', precision: 0 },
            ],
            key_points: [
                '<b>Formula:</b> Platība uz bloku = (Garums × Augstums cm) ÷ 10000; Nepieciešami bloki = (Sienas platība × 1,05) ÷ Platība uz bloku.',
                '<b>Piemērs:</b> 6×1 m siena ar 45×15 cm blokiem = 94 bloki.',
                '<b>Piezīme:</b> šis novērtē tikai redzamos priekšpuses blokus — neietver pamata blokus, virsakmeņus vai drenāžas šķembas.',
            ],
        },
        pl: {
            inputs: [
                { name: 'wall_length', label: 'Długość ściany (m)', type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'wall_height', label: 'Wysokość ściany (m)', type: 'number', min: 0.1, max: 1000, placeholder: '1' },
                { name: 'block_length', label: 'Długość bloku (cm)', type: 'number', min: 0.1, max: 300, placeholder: '45' },
                { name: 'block_height', label: 'Wysokość bloku (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Powierzchnia ściany (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Powierzchnia na blok (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Potrzebne bloki (z 5% zapasem)', precision: 0 },
            ],
            key_points: [
                '<b>Wzór:</b> Powierzchnia bloku = (Długość × Wysokość w cm) ÷ 10000; Potrzebne bloki = (Powierzchnia ściany × 1,05) ÷ Powierzchnia bloku.',
                '<b>Przykład:</b> ściana 6×1 m z blokami 45×15 cm = 94 bloki.',
                '<b>Uwaga:</b> to szacuje tylko widoczne bloki licowe — nie obejmuje bloków podstawy, nakryw ani żwiru drenażowego.',
            ],
        },
        es: {
            inputs: [
                { name: 'wall_length', label: 'Largo del Muro (m)', type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'wall_height', label: 'Altura del Muro (m)', type: 'number', min: 0.1, max: 1000, placeholder: '1' },
                { name: 'block_length', label: 'Largo del Bloque (cm)', type: 'number', min: 0.1, max: 300, placeholder: '45' },
                { name: 'block_height', label: 'Altura del Bloque (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Área del Muro (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Área por Bloque (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Bloques Necesarios (con 5% de margen)', precision: 0 },
            ],
            key_points: [
                '<b>Fórmula:</b> Área por Bloque = (Largo × Altura en cm) ÷ 10000; Bloques Necesarios = (Área del Muro × 1.05) ÷ Área por Bloque.',
                '<b>Ejemplo:</b> muro de 6×1 m con bloques de 45×15 cm = 94 bloques.',
                '<b>Nota:</b> esto estima solo los bloques de cara visible — no incluye bloques base, remates o grava de drenaje.',
            ],
        },
        fr: {
            inputs: [
                { name: 'wall_length', label: 'Longueur du Mur (m)', type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'wall_height', label: 'Hauteur du Mur (m)', type: 'number', min: 0.1, max: 1000, placeholder: '1' },
                { name: 'block_length', label: 'Longueur du Bloc (cm)', type: 'number', min: 0.1, max: 300, placeholder: '45' },
                { name: 'block_height', label: 'Hauteur du Bloc (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Surface du Mur (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Surface par Bloc (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Blocs Nécessaires (avec 5% de marge)', precision: 0 },
            ],
            key_points: [
                '<b>Formule :</b> Surface par Bloc = (Longueur × Hauteur en cm) ÷ 10000 ; Blocs Nécessaires = (Surface du Mur × 1,05) ÷ Surface par Bloc.',
                '<b>Exemple :</b> mur de 6×1 m avec des blocs de 45×15 cm = 94 blocs.',
                '<b>Remarque :</b> ceci estime uniquement les blocs de face visibles — sans les blocs de base, couronnements ou gravier de drainage.',
            ],
        },
        it: {
            inputs: [
                { name: 'wall_length', label: 'Lunghezza del Muro (m)', type: 'number', min: 0.1, max: 100000, placeholder: '6' },
                { name: 'wall_height', label: 'Altezza del Muro (m)', type: 'number', min: 0.1, max: 1000, placeholder: '1' },
                { name: 'block_length', label: 'Lunghezza del Blocco (cm)', type: 'number', min: 0.1, max: 300, placeholder: '45' },
                { name: 'block_height', label: 'Altezza del Blocco (cm)', type: 'number', min: 0.1, max: 300, placeholder: '15' },
                { name: 'unit_system', label: '', type: 'select', hidden: true, default: 'metric' },
            ],
            outputs: [
                { name: 'wall_area_sqm', label: 'Area del Muro (m²)', precision: 2 },
                { name: 'block_area_sqm', label: 'Area per Blocco (m²)', precision: 3 },
                { name: 'blocks_needed', label: 'Blocchi Necessari (con 5% di scarto)', precision: 0 },
            ],
            key_points: [
                '<b>Formula:</b> Area per Blocco = (Lunghezza × Altezza in cm) ÷ 10000; Blocchi Necessari = (Area del Muro × 1,05) ÷ Area per Blocco.',
                '<b>Esempio:</b> muro 6×1 m con blocchi 45×15 cm = 94 blocchi.',
                '<b>Nota:</b> questo stima solo i blocchi della faccia visibile — non include blocchi di base, coronamenti o ghiaia di drenaggio.',
            ],
        },
    },
}

// ============================================================
// Run all updates
// ============================================================
const updates = [
    update1169, update1170, update1171, update1172, update1173, update1174,
    update1175, update1176, update1177, update1178, update1179, update1180,
]

async function main() {
    for (const update of updates) {
        await updateTool(update)
    }
    console.log(`\n✅ Updated ${updates.length} construction calculators with metric support`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
