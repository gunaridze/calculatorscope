// One-off script: seeds 24 new Volume & Mass Converter calculators (12 volume + 12 mass)
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-converters-volume-mass-calculators.ts
//
// Tool IDs 1081-1104, category_id '30' (Volume & Mass Converters, under Converters).
// No new DB subcategories were created (per explicit decision) - "Volume" vs "Mass"
// is purely an organizational split in how these 24 tools were planned, not a nav
// split. Every volume tool's dropdown carries the FULL ~42-unit volume list, and
// every mass tool's dropdown carries the FULL ~27-unit mass list (comprehensive,
// matching the reference "Convert Volume" widget style, rather than the smaller
// curated subsets used in the earlier Length & Area batch).
//
// Conversion factors were researched against unitconverters.net/NIST/Wikipedia
// definitions (see conversation) and verified numerically before writing content,
// including several historically ambiguous units: hogshead (Imperial UK-beer
// 54gal vs US 63gal cask - kept as two distinct entries), assay ton (long/short -
// purpose-built mining values, not simple ton fractions), slug (derived from
// exact lb/ft/standard-gravity constants), and the avoirdupois/troy/metric
// pound & ounce families (three genuinely distinct units each).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VOLUME_MASS_CATEGORY_ID = '30'

type InputField = {
    name: string
    label: string
    type: 'number' | 'select'
    unit?: string | null
    min?: number | null
    max?: number | null
    description?: string
    placeholder?: string
    options?: Array<{ value: string; label: string }>
    default?: number | string
}

type OutputField = {
    name: string
    label: string
    unit?: string
    unitFrom?: string
    precision?: number
}

type LocaleContent = {
    slug: string
    title: string
    h1: string
    meta_title: string
    meta_description: string
    short_answer: string
    intro_text: string
    key_points: string[]
    howto: Array<{ question: string; answer: string }>
    inputs: InputField[]
    outputs: OutputField[]
}

type ToolDef = {
    id: string
    type: 'calculator'
    config_json: {
        inputs: Array<{ key: string; default?: number | string }>
        functions: Record<string, { type: 'function'; functionName: string; params: Record<string, string> }>
        outputs: Array<{ key: string; precision?: number }>
    }
    locales: Record<string, LocaleContent>
}

// ============================================================
// Shared unit label dictionaries (unit CODES are universal/stable across
// locales since they're used as function lookup keys - only LABELS translate)
// ============================================================
const VOLUME_UNIT_ORDER = [
    'liter', 'milliliter', 'deciliter', 'microliter', 'cubic_meter', 'cubic_cm', 'cubic_inch', 'cubic_foot', 'cubic_yard', 'cubic_mile', 'acre_foot', 'cord',
    'gallon_us_fluid', 'gallon_us_dry', 'gallon_imperial',
    'quart_us_fluid', 'quart_us_dry', 'quart_imperial',
    'pint_us_fluid', 'pint_us_dry', 'pint_imperial',
    'cup_us', 'cup_canadian', 'cup_breakfast',
    'fl_oz_us', 'fl_oz_imperial',
    'gill_us', 'gill_imperial',
    'tablespoon_us', 'tablespoon_canadian', 'tablespoon_imperial',
    'teaspoon_us', 'teaspoon_canadian', 'teaspoon_imperial',
    'barrel_us_fluid', 'barrel_us_dry', 'barrel_imperial', 'barrel_petroleum',
    'hogshead_us', 'hogshead_imperial',
    'bushel_us_dry', 'bushel_imperial',
    'peck_us_dry', 'peck_imperial',
]

const MASS_UNIT_ORDER = [
    'milligram', 'centigram', 'gram', 'kilogram', 'megagram',
    'microgram', 'carat_metric', 'point_metric', 'grain_metric',
    'grain_troy', 'pennyweight', 'dram_avdp', 'dram_troy',
    'ounce_avdp', 'ounce_troy', 'pound_avdp', 'pound_troy', 'pound_metric',
    'stone', 'hundredweight_short', 'hundredweight_long',
    'ton_short', 'ton_long', 'ton_metric', 'tonne_us',
    'ton_assay_short', 'ton_assay_long', 'slug',
]

const VOLUME_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: {
        liter: 'Liter (L)', milliliter: 'Milliliter (mL)', deciliter: 'Deciliter (dL)', microliter: 'Microliter (µL)',
        cubic_meter: 'Cubic Meter (m³)', cubic_cm: 'Cubic Centimeter (cm³)', cubic_inch: 'Cubic Inch (in³)', cubic_foot: 'Cubic Foot (ft³)', cubic_yard: 'Cubic Yard (yd³)', cubic_mile: 'Cubic Mile (mi³)', acre_foot: 'Acre-Foot', cord: 'Cord (firewood)',
        gallon_us_fluid: 'Gallon (U.S. fluid)', gallon_us_dry: 'Gallon (U.S. dry)', gallon_imperial: 'Gallon (Imperial)',
        quart_us_fluid: 'Quart (U.S. fluid)', quart_us_dry: 'Quart (U.S. dry)', quart_imperial: 'Quart (Imperial)',
        pint_us_fluid: 'Pint (U.S. fluid)', pint_us_dry: 'Pint (U.S. dry)', pint_imperial: 'Pint (Imperial)',
        cup_us: 'Cup (U.S.)', cup_canadian: 'Cup (Canadian)', cup_breakfast: 'Cup (breakfast)',
        fl_oz_us: 'Ounce (U.S. fluid)', fl_oz_imperial: 'Ounce (Imperial fluid)',
        gill_us: 'Gill (U.S.)', gill_imperial: 'Gill (Imperial)',
        tablespoon_us: 'Tablespoon (U.S.)', tablespoon_canadian: 'Tablespoon (Canadian)', tablespoon_imperial: 'Tablespoon (Imperial)',
        teaspoon_us: 'Teaspoon (U.S.)', teaspoon_canadian: 'Teaspoon (Canadian)', teaspoon_imperial: 'Teaspoon (Imperial)',
        barrel_us_fluid: 'Barrel (U.S. fluid)', barrel_us_dry: 'Barrel (U.S. dry)', barrel_imperial: 'Barrel (Imperial)', barrel_petroleum: 'Barrel (petroleum)',
        hogshead_us: 'Hogshead (U.S.)', hogshead_imperial: 'Hogshead (Imperial)',
        bushel_us_dry: 'Bushel (U.S. dry)', bushel_imperial: 'Bushel (Imperial)',
        peck_us_dry: 'Peck (U.S. dry)', peck_imperial: 'Peck (Imperial)',
    },
    ru: {
        liter: 'Литр (л)', milliliter: 'Миллилитр (мл)', deciliter: 'Децилитр (дл)', microliter: 'Микролитр (мкл)',
        cubic_meter: 'Кубический метр (м³)', cubic_cm: 'Кубический сантиметр (см³)', cubic_inch: 'Кубический дюйм (in³)', cubic_foot: 'Кубический фут (ft³)', cubic_yard: 'Кубический ярд (yd³)', cubic_mile: 'Кубическая миля (mi³)', acre_foot: 'Акро-фут', cord: 'Корд (дрова)',
        gallon_us_fluid: 'Галлон (амер. жидкостный)', gallon_us_dry: 'Галлон (амер. сыпучий)', gallon_imperial: 'Галлон (имперский)',
        quart_us_fluid: 'Кварта (амер. жидкостная)', quart_us_dry: 'Кварта (амер. сыпучая)', quart_imperial: 'Кварта (имперская)',
        pint_us_fluid: 'Пинта (амер. жидкостная)', pint_us_dry: 'Пинта (амер. сыпучая)', pint_imperial: 'Пинта (имперская)',
        cup_us: 'Чашка (амер.)', cup_canadian: 'Чашка (канадская)', cup_breakfast: 'Чашка (завтрак, брит.)',
        fl_oz_us: 'Унция (амер. жидкостная)', fl_oz_imperial: 'Унция (имперская жидкостная)',
        gill_us: 'Джилл (амер.)', gill_imperial: 'Джилл (имперский)',
        tablespoon_us: 'Столовая ложка (амер.)', tablespoon_canadian: 'Столовая ложка (канадская)', tablespoon_imperial: 'Столовая ложка (имперская)',
        teaspoon_us: 'Чайная ложка (амер.)', teaspoon_canadian: 'Чайная ложка (канадская)', teaspoon_imperial: 'Чайная ложка (имперская)',
        barrel_us_fluid: 'Баррель (амер. жидкостный)', barrel_us_dry: 'Баррель (амер. сыпучий)', barrel_imperial: 'Баррель (имперский)', barrel_petroleum: 'Баррель (нефтяной)',
        hogshead_us: 'Хогсхед (амер.)', hogshead_imperial: 'Хогсхед (имперский)',
        bushel_us_dry: 'Бушель (амер.)', bushel_imperial: 'Бушель (имперский)',
        peck_us_dry: 'Пек (амер.)', peck_imperial: 'Пек (имперский)',
    },
    de: {
        liter: 'Liter (L)', milliliter: 'Milliliter (mL)', deciliter: 'Deziliter (dL)', microliter: 'Mikroliter (µL)',
        cubic_meter: 'Kubikmeter (m³)', cubic_cm: 'Kubikzentimeter (cm³)', cubic_inch: 'Kubikzoll (in³)', cubic_foot: 'Kubikfuß (ft³)', cubic_yard: 'Kubikyard (yd³)', cubic_mile: 'Kubikmeile (mi³)', acre_foot: 'Acre-Foot', cord: 'Cord (Brennholz)',
        gallon_us_fluid: 'Gallone (US, flüssig)', gallon_us_dry: 'Gallone (US, trocken)', gallon_imperial: 'Gallone (Imperial)',
        quart_us_fluid: 'Quart (US, flüssig)', quart_us_dry: 'Quart (US, trocken)', quart_imperial: 'Quart (Imperial)',
        pint_us_fluid: 'Pint (US, flüssig)', pint_us_dry: 'Pint (US, trocken)', pint_imperial: 'Pint (Imperial)',
        cup_us: 'Cup (US)', cup_canadian: 'Cup (kanadisch)', cup_breakfast: 'Cup (Frühstück, brit.)',
        fl_oz_us: 'Fluid Ounce (US)', fl_oz_imperial: 'Fluid Ounce (Imperial)',
        gill_us: 'Gill (US)', gill_imperial: 'Gill (Imperial)',
        tablespoon_us: 'Esslöffel (US)', tablespoon_canadian: 'Esslöffel (kanadisch)', tablespoon_imperial: 'Esslöffel (Imperial)',
        teaspoon_us: 'Teelöffel (US)', teaspoon_canadian: 'Teelöffel (kanadisch)', teaspoon_imperial: 'Teelöffel (Imperial)',
        barrel_us_fluid: 'Barrel (US, flüssig)', barrel_us_dry: 'Barrel (US, trocken)', barrel_imperial: 'Barrel (Imperial)', barrel_petroleum: 'Barrel (Erdöl)',
        hogshead_us: 'Hogshead (US)', hogshead_imperial: 'Hogshead (Imperial)',
        bushel_us_dry: 'Bushel (US)', bushel_imperial: 'Bushel (Imperial)',
        peck_us_dry: 'Peck (US)', peck_imperial: 'Peck (Imperial)',
    },
    es: {
        liter: 'Litro (L)', milliliter: 'Mililitro (mL)', deciliter: 'Decilitro (dL)', microliter: 'Microlitro (µL)',
        cubic_meter: 'Metro cúbico (m³)', cubic_cm: 'Centímetro cúbico (cm³)', cubic_inch: 'Pulgada cúbica (in³)', cubic_foot: 'Pie cúbico (ft³)', cubic_yard: 'Yarda cúbica (yd³)', cubic_mile: 'Milla cúbica (mi³)', acre_foot: 'Acre-pie', cord: 'Cuerda (leña)',
        gallon_us_fluid: 'Galón (EE. UU., líquido)', gallon_us_dry: 'Galón (EE. UU., seco)', gallon_imperial: 'Galón (Imperial)',
        quart_us_fluid: 'Cuarto (EE. UU., líquido)', quart_us_dry: 'Cuarto (EE. UU., seco)', quart_imperial: 'Cuarto (Imperial)',
        pint_us_fluid: 'Pinta (EE. UU., líquida)', pint_us_dry: 'Pinta (EE. UU., seca)', pint_imperial: 'Pinta (Imperial)',
        cup_us: 'Taza (EE. UU.)', cup_canadian: 'Taza (canadiense)', cup_breakfast: 'Taza (desayuno, brit.)',
        fl_oz_us: 'Onza líquida (EE. UU.)', fl_oz_imperial: 'Onza líquida (Imperial)',
        gill_us: 'Gill (EE. UU.)', gill_imperial: 'Gill (Imperial)',
        tablespoon_us: 'Cucharada (EE. UU.)', tablespoon_canadian: 'Cucharada (canadiense)', tablespoon_imperial: 'Cucharada (Imperial)',
        teaspoon_us: 'Cucharadita (EE. UU.)', teaspoon_canadian: 'Cucharadita (canadiense)', teaspoon_imperial: 'Cucharadita (Imperial)',
        barrel_us_fluid: 'Barril (EE. UU., líquido)', barrel_us_dry: 'Barril (EE. UU., seco)', barrel_imperial: 'Barril (Imperial)', barrel_petroleum: 'Barril (petróleo)',
        hogshead_us: 'Hogshead (EE. UU.)', hogshead_imperial: 'Hogshead (Imperial)',
        bushel_us_dry: 'Bushel (EE. UU.)', bushel_imperial: 'Bushel (Imperial)',
        peck_us_dry: 'Peck (EE. UU.)', peck_imperial: 'Peck (Imperial)',
    },
    fr: {
        liter: 'Litre (L)', milliliter: 'Millilitre (mL)', deciliter: 'Décilitre (dL)', microliter: 'Microlitre (µL)',
        cubic_meter: 'Mètre cube (m³)', cubic_cm: 'Centimètre cube (cm³)', cubic_inch: 'Pouce cube (in³)', cubic_foot: 'Pied cube (ft³)', cubic_yard: 'Yard cube (yd³)', cubic_mile: 'Mile cube (mi³)', acre_foot: 'Acre-pied', cord: 'Corde (bois de chauffage)',
        gallon_us_fluid: 'Gallon (US, liquide)', gallon_us_dry: 'Gallon (US, sec)', gallon_imperial: 'Gallon (Impérial)',
        quart_us_fluid: 'Quart (US, liquide)', quart_us_dry: 'Quart (US, sec)', quart_imperial: 'Quart (Impérial)',
        pint_us_fluid: 'Pinte (US, liquide)', pint_us_dry: 'Pinte (US, sèche)', pint_imperial: 'Pinte (Impériale)',
        cup_us: 'Tasse (US)', cup_canadian: 'Tasse (canadienne)', cup_breakfast: 'Tasse (petit-déjeuner, brit.)',
        fl_oz_us: 'Once liquide (US)', fl_oz_imperial: 'Once liquide (Impériale)',
        gill_us: 'Gill (US)', gill_imperial: 'Gill (Impérial)',
        tablespoon_us: 'Cuillère à soupe (US)', tablespoon_canadian: 'Cuillère à soupe (canadienne)', tablespoon_imperial: 'Cuillère à soupe (Impériale)',
        teaspoon_us: 'Cuillère à café (US)', teaspoon_canadian: 'Cuillère à café (canadienne)', teaspoon_imperial: 'Cuillère à café (Impériale)',
        barrel_us_fluid: 'Baril (US, liquide)', barrel_us_dry: 'Baril (US, sec)', barrel_imperial: 'Baril (Impérial)', barrel_petroleum: 'Baril (pétrole)',
        hogshead_us: 'Hogshead (US)', hogshead_imperial: 'Hogshead (Impérial)',
        bushel_us_dry: 'Bushel (US)', bushel_imperial: 'Bushel (Impérial)',
        peck_us_dry: 'Peck (US)', peck_imperial: 'Peck (Impérial)',
    },
    it: {
        liter: 'Litro (L)', milliliter: 'Millilitro (mL)', deciliter: 'Decilitro (dL)', microliter: 'Microlitro (µL)',
        cubic_meter: 'Metro cubo (m³)', cubic_cm: 'Centimetro cubo (cm³)', cubic_inch: 'Pollice cubo (in³)', cubic_foot: 'Piede cubo (ft³)', cubic_yard: 'Iarda cuba (yd³)', cubic_mile: 'Miglio cubo (mi³)', acre_foot: 'Acro-piede', cord: 'Corda (legna da ardere)',
        gallon_us_fluid: 'Gallone (USA, liquido)', gallon_us_dry: 'Gallone (USA, secco)', gallon_imperial: 'Gallone (Imperiale)',
        quart_us_fluid: 'Quarto (USA, liquido)', quart_us_dry: 'Quarto (USA, secco)', quart_imperial: 'Quarto (Imperiale)',
        pint_us_fluid: 'Pinta (USA, liquida)', pint_us_dry: 'Pinta (USA, secca)', pint_imperial: 'Pinta (Imperiale)',
        cup_us: 'Tazza (USA)', cup_canadian: 'Tazza (canadese)', cup_breakfast: 'Tazza (colazione, brit.)',
        fl_oz_us: 'Oncia liquida (USA)', fl_oz_imperial: 'Oncia liquida (Imperiale)',
        gill_us: 'Gill (USA)', gill_imperial: 'Gill (Imperiale)',
        tablespoon_us: 'Cucchiaio (USA)', tablespoon_canadian: 'Cucchiaio (canadese)', tablespoon_imperial: 'Cucchiaio (Imperiale)',
        teaspoon_us: 'Cucchiaino (USA)', teaspoon_canadian: 'Cucchiaino (canadese)', teaspoon_imperial: 'Cucchiaino (Imperiale)',
        barrel_us_fluid: 'Barile (USA, liquido)', barrel_us_dry: 'Barile (USA, secco)', barrel_imperial: 'Barile (Imperiale)', barrel_petroleum: 'Barile (petrolio)',
        hogshead_us: 'Hogshead (USA)', hogshead_imperial: 'Hogshead (Imperiale)',
        bushel_us_dry: 'Bushel (USA)', bushel_imperial: 'Bushel (Imperiale)',
        peck_us_dry: 'Peck (USA)', peck_imperial: 'Peck (Imperiale)',
    },
    pl: {
        liter: 'Litr (L)', milliliter: 'Mililitr (mL)', deciliter: 'Decylitr (dL)', microliter: 'Mikrolitr (µL)',
        cubic_meter: 'Metr sześcienny (m³)', cubic_cm: 'Centymetr sześcienny (cm³)', cubic_inch: 'Cal sześcienny (in³)', cubic_foot: 'Stopa sześcienna (ft³)', cubic_yard: 'Jard sześcienny (yd³)', cubic_mile: 'Mila sześcienna (mi³)', acre_foot: 'Akro-stopa', cord: 'Sąg (drewno opałowe)',
        gallon_us_fluid: 'Galon (USA, płynny)', gallon_us_dry: 'Galon (USA, suchy)', gallon_imperial: 'Galon (Imperialny)',
        quart_us_fluid: 'Kwarta (USA, płynna)', quart_us_dry: 'Kwarta (USA, sucha)', quart_imperial: 'Kwarta (Imperialna)',
        pint_us_fluid: 'Pinta (USA, płynna)', pint_us_dry: 'Pinta (USA, sucha)', pint_imperial: 'Pinta (Imperialna)',
        cup_us: 'Filiżanka (USA)', cup_canadian: 'Filiżanka (kanadyjska)', cup_breakfast: 'Filiżanka (śniadaniowa, bryt.)',
        fl_oz_us: 'Uncja płynna (USA)', fl_oz_imperial: 'Uncja płynna (Imperialna)',
        gill_us: 'Gill (USA)', gill_imperial: 'Gill (Imperialny)',
        tablespoon_us: 'Łyżka stołowa (USA)', tablespoon_canadian: 'Łyżka stołowa (kanadyjska)', tablespoon_imperial: 'Łyżka stołowa (Imperialna)',
        teaspoon_us: 'Łyżeczka (USA)', teaspoon_canadian: 'Łyżeczka (kanadyjska)', teaspoon_imperial: 'Łyżeczka (Imperialna)',
        barrel_us_fluid: 'Baryłka (USA, płynna)', barrel_us_dry: 'Baryłka (USA, sucha)', barrel_imperial: 'Baryłka (Imperialna)', barrel_petroleum: 'Baryłka (ropy naftowej)',
        hogshead_us: 'Hogshead (USA)', hogshead_imperial: 'Hogshead (Imperialny)',
        bushel_us_dry: 'Buszel (USA)', bushel_imperial: 'Buszel (Imperialny)',
        peck_us_dry: 'Peck (USA)', peck_imperial: 'Peck (Imperialny)',
    },
    lv: {
        liter: 'Litrs (L)', milliliter: 'Mililitrs (mL)', deciliter: 'Decilitrs (dL)', microliter: 'Mikrolitrs (µL)',
        cubic_meter: 'Kubikmetrs (m³)', cubic_cm: 'Kubikcentimetrs (cm³)', cubic_inch: 'Kubikcolla (in³)', cubic_foot: 'Kubikpēda (ft³)', cubic_yard: 'Kubikjards (yd³)', cubic_mile: 'Kubikjūdze (mi³)', acre_foot: 'Akru pēda', cord: 'Korda (malka)',
        gallon_us_fluid: 'Galons (ASV, šķidrums)', gallon_us_dry: 'Galons (ASV, birstošs)', gallon_imperial: 'Galons (Imperiālais)',
        quart_us_fluid: 'Kvarta (ASV, šķidrums)', quart_us_dry: 'Kvarta (ASV, birstoša)', quart_imperial: 'Kvarta (Imperiālā)',
        pint_us_fluid: 'Pinte (ASV, šķidrums)', pint_us_dry: 'Pinte (ASV, birstoša)', pint_imperial: 'Pinte (Imperiālā)',
        cup_us: 'Tase (ASV)', cup_canadian: 'Tase (Kanādas)', cup_breakfast: 'Tase (brokastu, brit.)',
        fl_oz_us: 'Šķidruma unce (ASV)', fl_oz_imperial: 'Šķidruma unce (Imperiālā)',
        gill_us: 'Džils (ASV)', gill_imperial: 'Džils (Imperiālais)',
        tablespoon_us: 'Ēdamkarote (ASV)', tablespoon_canadian: 'Ēdamkarote (Kanādas)', tablespoon_imperial: 'Ēdamkarote (Imperiālā)',
        teaspoon_us: 'Tējkarote (ASV)', teaspoon_canadian: 'Tējkarote (Kanādas)', teaspoon_imperial: 'Tējkarote (Imperiālā)',
        barrel_us_fluid: 'Muca (ASV, šķidrums)', barrel_us_dry: 'Muca (ASV, birstoša)', barrel_imperial: 'Muca (Imperiālā)', barrel_petroleum: 'Muca (naftas)',
        hogshead_us: 'Hogshead (ASV)', hogshead_imperial: 'Hogshead (Imperiālais)',
        bushel_us_dry: 'Bušelis (ASV)', bushel_imperial: 'Bušelis (Imperiālais)',
        peck_us_dry: 'Peks (ASV)', peck_imperial: 'Peks (Imperiālais)',
    },
}

const MASS_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: {
        milligram: 'Milligram (mg)', centigram: 'Centigram (cg)', gram: 'Gram (g)', kilogram: 'Kilogram (kg)', megagram: 'Megagram (Mg)',
        microgram: 'Microgram (µg)', carat_metric: 'Carat (metric)', point_metric: 'Point (metric)', grain_metric: 'Grain (metric)',
        grain_troy: 'Grain (troy)', pennyweight: 'Pennyweight (dwt)', dram_avdp: 'Dram (avdp)', dram_troy: 'Dram (troy)',
        ounce_avdp: 'Ounce (avdp)', ounce_troy: 'Ounce (troy)', pound_avdp: 'Pound (avdp)', pound_troy: 'Pound (troy)', pound_metric: 'Pound (metric)',
        stone: 'Stone', hundredweight_short: 'Hundredweight (short)', hundredweight_long: 'Hundredweight (long)',
        ton_short: 'Ton (short)', ton_long: 'Ton (long)', ton_metric: 'Ton (metric)', tonne_us: 'Tonne (U.S. metric ton)',
        ton_assay_short: 'Ton-assay (short)', ton_assay_long: 'Ton-assay (long)', slug: 'Slug',
    },
    ru: {
        milligram: 'Миллиграмм (мг)', centigram: 'Сантиграмм (сг)', gram: 'Грамм (г)', kilogram: 'Килограмм (кг)', megagram: 'Мегаграмм (Мг)',
        microgram: 'Микрограмм (мкг)', carat_metric: 'Карат (метрический)', point_metric: 'Пойнт (метрический)', grain_metric: 'Гран (метрический)',
        grain_troy: 'Гран (тройский)', pennyweight: 'Пеннивейт (dwt)', dram_avdp: 'Драхма (авердюпуа)', dram_troy: 'Драхма (тройская)',
        ounce_avdp: 'Унция (авердюпуа)', ounce_troy: 'Унция (тройская)', pound_avdp: 'Фунт (авердюпуа)', pound_troy: 'Фунт (тройский)', pound_metric: 'Фунт (метрический)',
        stone: 'Стоун', hundredweight_short: 'Центнер (короткий, амер.)', hundredweight_long: 'Центнер (длинный, брит.)',
        ton_short: 'Тонна (короткая, амер.)', ton_long: 'Тонна (длинная, брит.)', ton_metric: 'Тонна (метрическая)', tonne_us: 'Тонна (амер. метрическая)',
        ton_assay_short: 'Ассай-тонна (короткая)', ton_assay_long: 'Ассай-тонна (длинная)', slug: 'Слаг',
    },
    de: {
        milligram: 'Milligramm (mg)', centigram: 'Zentigramm (cg)', gram: 'Gramm (g)', kilogram: 'Kilogramm (kg)', megagram: 'Megagramm (Mg)',
        microgram: 'Mikrogramm (µg)', carat_metric: 'Karat (metrisch)', point_metric: 'Point (metrisch)', grain_metric: 'Grain (metrisch)',
        grain_troy: 'Grain (Troy)', pennyweight: 'Pennyweight (dwt)', dram_avdp: 'Dram (avdp)', dram_troy: 'Dram (Troy)',
        ounce_avdp: 'Unze (avdp)', ounce_troy: 'Unze (Troy)', pound_avdp: 'Pfund (avdp)', pound_troy: 'Pfund (Troy)', pound_metric: 'Pfund (metrisch)',
        stone: 'Stone', hundredweight_short: 'Hundredweight (kurz, US)', hundredweight_long: 'Hundredweight (lang, UK)',
        ton_short: 'Tonne (kurz, US)', ton_long: 'Tonne (lang, UK)', ton_metric: 'Tonne (metrisch)', tonne_us: 'Tonne (US-metrisch)',
        ton_assay_short: 'Assay-Tonne (kurz)', ton_assay_long: 'Assay-Tonne (lang)', slug: 'Slug',
    },
    es: {
        milligram: 'Miligramo (mg)', centigram: 'Centigramo (cg)', gram: 'Gramo (g)', kilogram: 'Kilogramo (kg)', megagram: 'Megagramo (Mg)',
        microgram: 'Microgramo (µg)', carat_metric: 'Quilate (métrico)', point_metric: 'Punto (métrico)', grain_metric: 'Grano (métrico)',
        grain_troy: 'Grano (troy)', pennyweight: 'Pennyweight (dwt)', dram_avdp: 'Dracma (avdp)', dram_troy: 'Dracma (troy)',
        ounce_avdp: 'Onza (avdp)', ounce_troy: 'Onza (troy)', pound_avdp: 'Libra (avdp)', pound_troy: 'Libra (troy)', pound_metric: 'Libra (métrica)',
        stone: 'Stone', hundredweight_short: 'Quintal (corto, EE. UU.)', hundredweight_long: 'Quintal (largo, brit.)',
        ton_short: 'Tonelada (corta, EE. UU.)', ton_long: 'Tonelada (larga, brit.)', ton_metric: 'Tonelada (métrica)', tonne_us: 'Tonelada (métrica EE. UU.)',
        ton_assay_short: 'Tonelada de ensayo (corta)', ton_assay_long: 'Tonelada de ensayo (larga)', slug: 'Slug',
    },
    fr: {
        milligram: 'Milligramme (mg)', centigram: 'Centigramme (cg)', gram: 'Gramme (g)', kilogram: 'Kilogramme (kg)', megagram: 'Mégagramme (Mg)',
        microgram: 'Microgramme (µg)', carat_metric: 'Carat (métrique)', point_metric: 'Point (métrique)', grain_metric: 'Grain (métrique)',
        grain_troy: 'Grain (troy)', pennyweight: 'Pennyweight (dwt)', dram_avdp: 'Dram (avdp)', dram_troy: 'Dram (troy)',
        ounce_avdp: 'Once (avdp)', ounce_troy: 'Once (troy)', pound_avdp: 'Livre (avdp)', pound_troy: 'Livre (troy)', pound_metric: 'Livre (métrique)',
        stone: 'Stone', hundredweight_short: 'Hundredweight (court, US)', hundredweight_long: 'Hundredweight (long, UK)',
        ton_short: 'Tonne (courte, US)', ton_long: 'Tonne (longue, UK)', ton_metric: 'Tonne (métrique)', tonne_us: 'Tonne (métrique US)',
        ton_assay_short: 'Tonne d’essai (courte)', ton_assay_long: 'Tonne d’essai (longue)', slug: 'Slug',
    },
    it: {
        milligram: 'Milligrammo (mg)', centigram: 'Centigrammo (cg)', gram: 'Grammo (g)', kilogram: 'Chilogrammo (kg)', megagram: 'Megagrammo (Mg)',
        microgram: 'Microgrammo (µg)', carat_metric: 'Carato (metrico)', point_metric: 'Point (metrico)', grain_metric: 'Grain (metrico)',
        grain_troy: 'Grain (troy)', pennyweight: 'Pennyweight (dwt)', dram_avdp: 'Dram (avdp)', dram_troy: 'Dram (troy)',
        ounce_avdp: 'Oncia (avdp)', ounce_troy: 'Oncia (troy)', pound_avdp: 'Libbra (avdp)', pound_troy: 'Libbra (troy)', pound_metric: 'Libbra (metrica)',
        stone: 'Stone', hundredweight_short: 'Hundredweight (corto, USA)', hundredweight_long: 'Hundredweight (lungo, UK)',
        ton_short: 'Tonnellata (corta, USA)', ton_long: 'Tonnellata (lunga, UK)', ton_metric: 'Tonnellata (metrica)', tonne_us: 'Tonnellata (metrica USA)',
        ton_assay_short: 'Tonnellata di saggio (corta)', ton_assay_long: 'Tonnellata di saggio (lunga)', slug: 'Slug',
    },
    pl: {
        milligram: 'Miligram (mg)', centigram: 'Centygram (cg)', gram: 'Gram (g)', kilogram: 'Kilogram (kg)', megagram: 'Megagram (Mg)',
        microgram: 'Mikrogram (µg)', carat_metric: 'Karat (metryczny)', point_metric: 'Point (metryczny)', grain_metric: 'Grain (metryczny)',
        grain_troy: 'Grain (troy)', pennyweight: 'Pennyweight (dwt)', dram_avdp: 'Dram (avdp)', dram_troy: 'Dram (troy)',
        ounce_avdp: 'Uncja (avdp)', ounce_troy: 'Uncja (troy)', pound_avdp: 'Funt (avdp)', pound_troy: 'Funt (troy)', pound_metric: 'Funt (metryczny)',
        stone: 'Stone', hundredweight_short: 'Hundredweight (krótki, USA)', hundredweight_long: 'Hundredweight (długi, UK)',
        ton_short: 'Tona (krótka, USA)', ton_long: 'Tona (długa, UK)', ton_metric: 'Tona (metryczna)', tonne_us: 'Tona (metryczna USA)',
        ton_assay_short: 'Tona probiercza (krótka)', ton_assay_long: 'Tona probiercza (długa)', slug: 'Slug',
    },
    lv: {
        milligram: 'Miligrams (mg)', centigram: 'Centigrams (cg)', gram: 'Grams (g)', kilogram: 'Kilograms (kg)', megagram: 'Megagrams (Mg)',
        microgram: 'Mikrograms (µg)', carat_metric: 'Karāts (metriskais)', point_metric: 'Punkts (metriskais)', grain_metric: 'Grans (metriskais)',
        grain_troy: 'Grans (trojas)', pennyweight: 'Pennveits (dwt)', dram_avdp: 'Drahma (avdp)', dram_troy: 'Drahma (trojas)',
        ounce_avdp: 'Unce (avdp)', ounce_troy: 'Unce (trojas)', pound_avdp: 'Mārciņa (avdp)', pound_troy: 'Mārciņa (trojas)', pound_metric: 'Mārciņa (metriskā)',
        stone: 'Stouns', hundredweight_short: 'Sentners (īsais, ASV)', hundredweight_long: 'Sentners (garais, UK)',
        ton_short: 'Tonna (īsā, ASV)', ton_long: 'Tonna (garā, UK)', ton_metric: 'Tonna (metriskā)', tonne_us: 'Tonna (ASV metriskā)',
        ton_assay_short: 'Analīzes tonna (īsā)', ton_assay_long: 'Analīzes tonna (garā)', slug: 'Slugs',
    },
}

function volumeUnitOptions(lang: string): Array<{ value: string; label: string }> {
    const labels = VOLUME_UNIT_LABELS[lang] || VOLUME_UNIT_LABELS.en
    return VOLUME_UNIT_ORDER.map((code) => ({ value: code, label: labels[code] }))
}

function massUnitOptions(lang: string): Array<{ value: string; label: string }> {
    const labels = MASS_UNIT_LABELS[lang] || MASS_UNIT_LABELS.en
    return MASS_UNIT_ORDER.map((code) => ({ value: code, label: labels[code] }))
}

const FROM_LABEL: Record<string, string> = { en: 'From', ru: 'Из', de: 'Von', es: 'De', fr: 'De', it: 'Da', pl: 'Z', lv: 'No' }
const TO_LABEL: Record<string, string> = { en: 'To', ru: 'В', de: 'Zu', es: 'A', fr: 'Vers', it: 'A', pl: 'Do', lv: 'Uz' }
const VALUE_LABEL: Record<string, string> = { en: 'Value', ru: 'Значение', de: 'Wert', es: 'Valor', fr: 'Valeur', it: 'Valore', pl: 'Wartość', lv: 'Vērtība' }
const RESULT_LABEL: Record<string, string> = { en: 'Result', ru: 'Результат', de: 'Ergebnis', es: 'Resultado', fr: 'Résultat', it: 'Risultato', pl: 'Wynik', lv: 'Rezultāts' }

function volumeInputs(lang: string, placeholder: string): InputField[] {
    return [
        { name: 'value', label: VALUE_LABEL[lang] || VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder },
        { name: 'from_unit', label: FROM_LABEL[lang] || FROM_LABEL.en, type: 'select', options: volumeUnitOptions(lang) },
        { name: 'to_unit', label: TO_LABEL[lang] || TO_LABEL.en, type: 'select', options: volumeUnitOptions(lang) },
    ]
}

function massInputs(lang: string, placeholder: string): InputField[] {
    return [
        { name: 'value', label: VALUE_LABEL[lang] || VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder },
        { name: 'from_unit', label: FROM_LABEL[lang] || FROM_LABEL.en, type: 'select', options: massUnitOptions(lang) },
        { name: 'to_unit', label: TO_LABEL[lang] || TO_LABEL.en, type: 'select', options: massUnitOptions(lang) },
    ]
}

function resultOutput(lang: string, precision: number): OutputField[] {
    return [{ name: 'result', label: RESULT_LABEL[lang] || RESULT_LABEL.en, unitFrom: 'to_unit', precision }]
}

// ============================================================
// 1081: Liters to Gallons Converter
// ============================================================
const litersToGallons: ToolDef = {
    id: '1081',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'liter' },
            { key: 'to_unit', default: 'gallon_us_fluid' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'liters-to-gallons-converter',
            title: 'Liters to Gallons Converter',
            h1: 'Liters to Gallons Converter',
            meta_title: 'Liters to Gallons Converter | Convert Any Volume Unit',
            meta_description: 'Convert liters to gallons instantly, or switch to any of 40+ volume units — milliliters, cubic meters, cups, pints, barrels, bushels, and more.',
            short_answer: 'This converter changes a volume value from liters to U.S. fluid gallons (1 liter = 0.264172 gallons) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Liters to gallons is one of the most common volume conversions, needed constantly for fuel prices, beverage container sizes, and cooking quantities when comparing the metric world to the US, which still uses gallons for fuel and liquid measures.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of volume units — metric (milliliters through cubic meters), US customary (fluid and dry gallons, quarts, pints, cups, ounces, tablespoons, teaspoons), Imperial (UK gallons, pints, gills), and specialized units (barrels, bushels, pecks, hogsheads, cords, acre-feet).</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 liter = 0.264172 U.S. fluid gallons (and 1 U.S. gallon = exactly 3.785411784 liters, by legal US definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units — metric, US customary, Imperial, and specialized measures.',
                '<b>Watch for "which gallon":</b> the U.S. fluid gallon, U.S. dry gallon, and Imperial gallon are three genuinely different sizes — always confirm which one your source is using before comparing figures.',
            ],
            howto: [
                { question: 'How many gallons are in a liter?', answer: '<p>1 liter equals approximately 0.2642 U.S. fluid gallons. To convert liters to gallons, multiply the liter value by 0.264172, or divide by 3.785411784.</p>' },
                { question: 'Is a U.S. gallon the same as a UK (Imperial) gallon?', answer: '<p>No — the Imperial gallon (4.54609 L) is about 20% larger than the U.S. gallon (3.785411784 L). Select "Gallon (Imperial)" specifically if you need the UK size rather than the US one.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 6),
        },
        ru: {
            slug: 'kalkulyator-litry-v-galony',
            title: 'Конвертер литров в галлоны',
            h1: 'Конвертер литров в галлоны',
            meta_title: 'Литры в галлоны | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте литры в галлоны мгновенно, или переключитесь на любую из 40+ единиц объёма — миллилитры, кубометры, чашки, пинты, баррели, бушели и другие.',
            short_answer: 'Этот конвертер переводит значение объёма из литров в американские галлоны (1 литр = 0,264172 галлона) — а также может конвертировать между более чем 40 единицами объёма с помощью селекторов ниже.',
            intro_text: '<p>Литры в галлоны — одна из самых распространённых конверсий объёма, постоянно нужная для цен на топливо, размеров тары напитков и кулинарных величин при сравнении метрического мира с США, которые всё ещё используют галлоны для топлива и жидкостей.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц объёма — метрические, американские, имперские и специализированные (баррели, бушели, пеки, хогсхеды, корды, акро-футы).</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 литр = 0,264172 американского галлона (а 1 американский галлон = ровно 3,785411784 литра, по законодательному определению США).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 поддерживаемых единиц объёма.',
                '<b>Следите за тем, "какой галлон":</b> американский жидкостный галлон, американский сыпучий галлон и имперский галлон — три действительно разных размера.',
            ],
            howto: [
                { question: 'Сколько галлонов в литре?', answer: '<p>1 литр равен примерно 0,2642 американского галлона. Чтобы конвертировать, умножьте значение в литрах на 0,264172.</p>' },
                { question: 'Американский галлон такой же, как британский (имперский)?', answer: '<p>Нет — имперский галлон (4,54609 л) примерно на 20% больше американского (3,785411784 л). Выберите "Галлон (имперский)", если нужен британский размер.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 6),
        },
        lv: {
            slug: 'litru-uz-galoniem-kalkulators',
            title: 'Litru uz Galoniem Kalkulators',
            h1: 'Litru uz Galoniem Kalkulators',
            meta_title: 'Litri uz Galoniem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet litrus uz galoniem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām — mililitriem, kubikmetriem, tasēm, pintēm, mucām, bušeļiem.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no litriem uz ASV galoniem (1 litrs = 0,264172 galoni) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Litri uz galoniem ir viena no visizplatītākajām tilpuma konversijām, pastāvīgi nepieciešama degvielas cenām, dzērienu iepakojuma izmēriem un kulinārijas daudzumiem, salīdzinot metrisko pasauli ar ASV, kas joprojām izmanto galonus degvielai un šķidrumiem.</p><p>Šis rīks neaprobežojas ar vienu pāri: sarakstos "No" un "Uz" ir pilns tilpuma vienību klāsts — metriskās, ASV, imperiālās un specializētas vienības (mucas, bušeļi, peki, hogsheadi, kordas, akru pēdas).</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 litrs = 0,264172 ASV galoni (un 1 ASV galons = tieši 3,785411784 litri, pēc ASV likumiskās definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 atbalstītajām tilpuma vienībām.',
                '<b>Uzmanieties, "kurš galons":</b> ASV šķidruma galons, ASV birstošais galons un imperiālais galons ir trīs patiešām atšķirīgi izmēri.',
            ],
            howto: [
                { question: 'Cik galonu ir litrā?', answer: '<p>1 litrs ir aptuveni 0,2642 ASV galoni. Lai konvertētu, reiziniet litru vērtību ar 0,264172.</p>' },
                { question: 'Vai ASV galons ir tas pats, kas Lielbritānijas (imperiālais) galons?', answer: '<p>Nē — imperiālais galons (4,54609 L) ir apmēram par 20% lielāks nekā ASV galons (3,785411784 L).</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 6),
        },
        pl: {
            slug: 'kalkulator-litrow-na-galony',
            title: 'Kalkulator Litrów na Galony',
            h1: 'Kalkulator Litrów na Galony',
            meta_title: 'Litry na Galony | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz litry na galony natychmiast lub przełącz się na dowolną z 40+ jednostek objętości — mililitry, metry sześcienne, filiżanki, pinty, baryłki, buszle.',
            short_answer: 'Ten konwerter zmienia wartość objętości z litrów na galony amerykańskie (1 litr = 0,264172 galona) — może też przeliczać między ponad 40 jednostkami objętości za pomocą selektorów poniżej.',
            intro_text: '<p>Litry na galony to jedna z najczęstszych konwersji objętości, potrzebna stale przy cenach paliwa, rozmiarach opakowań napojów i ilościach kulinarnych przy porównywaniu świata metrycznego z USA, które nadal używają galonów do paliwa i płynów.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek objętości — metryczne, amerykańskie, imperialne i specjalistyczne (baryłki, buszle, pecki, hogsheady, sągi, akro-stopy).</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 litr = 0,264172 galona amerykańskiego (a 1 galon amerykański = dokładnie 3,785411784 litra, według definicji prawnej USA).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 obsługiwanych jednostek objętości.',
                '<b>Uważaj, "który galon":</b> amerykański galon płynny, amerykański galon suchy i galon imperialny to trzy naprawdę różne rozmiary.',
            ],
            howto: [
                { question: 'Ile galonów jest w litrze?', answer: '<p>1 litr to około 0,2642 galona amerykańskiego. Aby przeliczyć, pomnóż wartość w litrach przez 0,264172.</p>' },
                { question: 'Czy galon amerykański to to samo co galon brytyjski (imperialny)?', answer: '<p>Nie — galon imperialny (4,54609 L) jest o około 20% większy niż galon amerykański (3,785411784 L).</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 6),
        },
        es: {
            slug: 'calculadora-de-litros-a-galones',
            title: 'Calculadora de Litros a Galones',
            h1: 'Calculadora de Litros a Galones',
            meta_title: 'Litros a Galones | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte litros a galones al instante, o cambia a cualquiera de más de 40 unidades de volumen — mililitros, metros cúbicos, tazas, pintas, barriles, bushels.',
            short_answer: 'Esta calculadora cambia un valor de volumen de litros a galones estadounidenses (1 litro = 0,264172 galones) — y puede convertir entre más de 40 unidades de volumen usando los selectores de abajo.',
            intro_text: '<p>Litros a galones es una de las conversiones de volumen más comunes, necesaria constantemente para precios de combustible, tamaños de envases de bebidas y cantidades de cocina al comparar el mundo métrico con EE. UU., que aún usa galones para combustible y líquidos.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de volumen — métricas, estadounidenses, imperiales y especializadas (barriles, bushels, pecks, hogsheads, cuerdas, acres-pie).</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 litro = 0,264172 galones estadounidenses (y 1 galón estadounidense = exactamente 3,785411784 litros, por definición legal de EE. UU.).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen soportadas.',
                '<b>Ten cuidado con "qué galón":</b> el galón líquido estadounidense, el galón seco estadounidense y el galón imperial son tres tamaños genuinamente diferentes.',
            ],
            howto: [
                { question: '¿Cuántos galones hay en un litro?', answer: '<p>1 litro equivale aproximadamente a 0,2642 galones estadounidenses. Para convertir, multiplica el valor en litros por 0,264172.</p>' },
                { question: '¿Es un galón estadounidense lo mismo que un galón (imperial) del Reino Unido?', answer: '<p>No — el galón imperial (4,54609 L) es aproximadamente un 20% más grande que el galón estadounidense (3,785411784 L).</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 6),
        },
        fr: {
            slug: 'calculateur-de-litres-en-gallons',
            title: 'Calculateur de Litres en Gallons',
            h1: 'Calculateur de Litres en Gallons',
            meta_title: 'Litres en Gallons | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des litres en gallons instantanément, ou passez à l’une des 40+ unités de volume — millilitres, mètres cubes, tasses, pintes, barils, bushels.',
            short_answer: 'Ce calculateur transforme une valeur de volume de litres en gallons américains (1 litre = 0,264172 gallon) — et peut convertir entre plus de 40 unités de volume grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Litres en gallons est l’une des conversions de volume les plus courantes, nécessaire constamment pour les prix du carburant, les tailles de contenants de boissons et les quantités de cuisine lors de la comparaison du monde métrique avec les États-Unis, qui utilisent encore les gallons pour le carburant et les liquides.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de volume — métriques, américaines, impériales et spécialisées (barils, bushels, pecks, hogsheads, cordes, acres-pieds).</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 litre = 0,264172 gallon américain (et 1 gallon américain = exactement 3,785411784 litres, par définition légale américaine).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Attention à « quel gallon » :</b> le gallon liquide américain, le gallon sec américain et le gallon impérial sont trois tailles véritablement différentes.',
            ],
            howto: [
                { question: 'Combien de gallons y a-t-il dans un litre ?', answer: '<p>1 litre équivaut à environ 0,2642 gallon américain. Pour convertir, multipliez la valeur en litres par 0,264172.</p>' },
                { question: 'Un gallon américain est-il identique à un gallon (impérial) britannique ?', answer: '<p>Non — le gallon impérial (4,54609 L) est environ 20 % plus grand que le gallon américain (3,785411784 L).</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 6),
        },
        it: {
            slug: 'calcolatore-da-litri-a-galloni',
            title: 'Calcolatore da Litri a Galloni',
            h1: 'Calcolatore da Litri a Galloni',
            meta_title: 'Litri in Galloni | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti litri in galloni istantaneamente, o passa a una delle 40+ unità di volume — millilitri, metri cubi, tazze, pinte, barili, bushel.',
            short_answer: 'Questo convertitore trasforma un valore di volume da litri a galloni statunitensi (1 litro = 0,264172 galloni) — e può convertire tra oltre 40 unità di volume usando i selettori qui sotto.',
            intro_text: '<p>Litri in galloni è una delle conversioni di volume più comuni, necessaria costantemente per i prezzi del carburante, le dimensioni dei contenitori di bevande e le quantità di cucina quando si confronta il mondo metrico con gli USA, che usano ancora i galloni per carburante e liquidi.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di volume — metriche, statunitensi, imperiali e specializzate (barili, bushel, peck, hogshead, corde, acri-piede).</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 litro = 0,264172 galloni statunitensi (e 1 gallone statunitense = esattamente 3,785411784 litri, per definizione legale statunitense).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume supportate.',
                '<b>Attenzione a "quale gallone":</b> il gallone liquido statunitense, il gallone secco statunitense e il gallone imperiale sono tre dimensioni realmente diverse.',
            ],
            howto: [
                { question: 'Quanti galloni ci sono in un litro?', answer: '<p>1 litro equivale a circa 0,2642 galloni statunitensi. Per convertire, moltiplica il valore in litri per 0,264172.</p>' },
                { question: 'Un gallone statunitense è uguale a un gallone (imperiale) britannico?', answer: '<p>No — il gallone imperiale (4,54609 L) è circa il 20% più grande del gallone statunitense (3,785411784 L).</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 6),
        },
        de: {
            slug: 'liter-in-gallonen-rechner',
            title: 'Liter in Gallonen Rechner',
            h1: 'Liter in Gallonen Rechner',
            meta_title: 'Liter in Gallonen | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Liter sofort in Gallonen um, oder wechseln Sie zu einer von 40+ Volumeneinheiten — Milliliter, Kubikmeter, Cups, Pints, Barrel, Bushel.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von Litern in US-Gallonen um (1 Liter = 0,264172 Gallonen) — und kann zwischen über 40 Volumeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Liter in Gallonen ist eine der häufigsten Volumenumrechnungen, ständig benötigt für Kraftstoffpreise, Getränkebehältergrößen und Kochmengen beim Vergleich der metrischen Welt mit den USA, die für Kraftstoff und Flüssigkeiten weiterhin Gallonen verwenden.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Volumeneinheiten ab — metrisch, US-amerikanisch, imperial und spezialisiert (Barrel, Bushel, Peck, Hogshead, Cord, Acre-Foot).</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Liter = 0,264172 US-Gallonen (und 1 US-Gallone = genau 3,785411784 Liter, nach gesetzlicher US-Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Achten Sie darauf, "welche Gallone":</b> die US-Flüssiggallone, die US-Trockengallone und die imperiale Gallone sind drei tatsächlich unterschiedliche Größen.',
            ],
            howto: [
                { question: 'Wie viele Gallonen sind in einem Liter?', answer: '<p>1 Liter entspricht etwa 0,2642 US-Gallonen. Um umzurechnen, multiplizieren Sie den Literwert mit 0,264172.</p>' },
                { question: 'Ist eine US-Gallone dasselbe wie eine britische (imperiale) Gallone?', answer: '<p>Nein — die imperiale Gallone (4,54609 L) ist etwa 20% größer als die US-Gallone (3,785411784 L).</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 6),
        },
    },
}

// ============================================================
// 1082: Gallons to Liters Converter
// ============================================================
const gallonsToLiters: ToolDef = {
    id: '1082',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'gallon_us_fluid' },
            { key: 'to_unit', default: 'liter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'gallons-to-liters-converter',
            title: 'Gallons to Liters Converter',
            h1: 'Gallons to Liters Converter',
            meta_title: 'Gallons to Liters Converter | Convert Any Volume Unit',
            meta_description: 'Convert gallons to liters instantly, or switch to any of 40+ volume units — milliliters, cubic meters, cups, pints, barrels, bushels, and more.',
            short_answer: 'This converter changes a volume value from U.S. fluid gallons to liters (1 gallon = 3.785412 liters) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Gallons to liters is the reverse of liters-to-gallons, needed whenever a US-denominated fuel, paint, or beverage quantity in gallons needs to be understood in metric terms.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of volume units — metric (milliliters through cubic meters), US customary (fluid and dry gallons, quarts, pints, cups, ounces, tablespoons, teaspoons), Imperial (UK gallons, pints, gills), and specialized units (barrels, bushels, pecks, hogsheads, cords, acre-feet).</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. fluid gallon = exactly 3.785411784 liters, by legal US definition.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units — metric, US customary, Imperial, and specialized measures.',
                '<b>Watch for "which gallon":</b> this converter defaults to the U.S. fluid gallon — select "Gallon (Imperial)" instead if your source is UK-based, since it\'s about 20% larger.',
            ],
            howto: [
                { question: 'How many liters are in a gallon?', answer: '<p>1 U.S. gallon equals exactly 3.785411784 liters. To convert gallons to liters, multiply the gallon value by 3.785412.</p>' },
                { question: 'Can I convert liters back to gallons with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Liter and Gallon (U.S. fluid) respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 6),
        },
        ru: {
            slug: 'kalkulyator-galony-v-litry',
            title: 'Конвертер галлонов в литры',
            h1: 'Конвертер галлонов в литры',
            meta_title: 'Галлоны в литры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте галлоны в литры мгновенно, или переключитесь на любую из 40+ единиц объёма — миллилитры, кубометры, чашки, пинты, баррели, бушели.',
            short_answer: 'Этот конвертер переводит значение объёма из американских галлонов в литры (1 галлон = 3,785412 литра) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Галлоны в литры — обратная конверсия к литрам в галлоны, нужная всякий раз, когда американское количество топлива, краски или напитка в галлонах должно быть понято в метрических терминах.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц объёма.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американский галлон = ровно 3,785411784 литра, по законодательному определению США.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Следите за тем, "какой галлон":</b> этот конвертер по умолчанию использует американский жидкостный галлон — выберите "Галлон (имперский)", если источник британский.',
            ],
            howto: [
                { question: 'Сколько литров в галлоне?', answer: '<p>1 американский галлон равен ровно 3,785411784 литра. Чтобы конвертировать, умножьте значение в галлонах на 3,785412.</p>' },
                { question: 'Могу ли я конвертировать литры обратно в галлоны этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Литр и Галлон (амер. жидкостный) соответственно.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 6),
        },
        lv: {
            slug: 'galonu-uz-litriem-kalkulators',
            title: 'Galonu uz Litriem Kalkulators',
            h1: 'Galonu uz Litriem Kalkulators',
            meta_title: 'Galoni uz Litriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet galonus uz litriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV galoniem uz litriem (1 galons = 3,785412 litri) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Galoni uz litriem ir pretēja konversija litriem uz galoniem, kas nepieciešama, kad ASV degvielas, krāsas vai dzēriena daudzums galonos jāsaprot metriskajā izteiksmē.</p><p>Šis rīks neaprobežojas ar vienu pāri: saraksti "No" un "Uz" aptver pilnu tilpuma vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV galons = tieši 3,785411784 litri, pēc ASV likumiskās definīcijas.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Uzmanieties, "kurš galons":</b> šis konvertētājs pēc noklusējuma izmanto ASV šķidruma galonu — izvēlieties "Galons (Imperiālais)", ja avots ir Lielbritānijas.',
            ],
            howto: [
                { question: 'Cik litru ir galonā?', answer: '<p>1 ASV galons ir tieši 3,785411784 litri. Lai konvertētu, reiziniet galonu vērtību ar 3,785412.</p>' },
                { question: 'Vai varu konvertēt litrus atpakaļ uz galoniem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Litru un Galonu (ASV, šķidrums).</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 6),
        },
        pl: {
            slug: 'kalkulator-galonow-na-litry',
            title: 'Kalkulator Galonów na Litry',
            h1: 'Kalkulator Galonów na Litry',
            meta_title: 'Galony na Litry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz galony na litry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z galonów amerykańskich na litry (1 galon = 3,785412 litra) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Galony na litry to odwrotność litrów na galony, potrzebna, gdy amerykańska ilość paliwa, farby lub napoju w galonach musi być zrozumiana w jednostkach metrycznych.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek objętości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 galon amerykański = dokładnie 3,785411784 litra, według definicji prawnej USA.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Uważaj, "który galon":</b> ten konwerter domyślnie używa amerykańskiego galonu płynnego — wybierz "Galon (Imperialny)", jeśli źródło jest brytyjskie.',
            ],
            howto: [
                { question: 'Ile litrów jest w galonie?', answer: '<p>1 galon amerykański to dokładnie 3,785411784 litra. Aby przeliczyć, pomnóż wartość w galonach przez 3,785412.</p>' },
                { question: 'Czy mogę przeliczyć litry z powrotem na galony tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Litr i Galon (USA, płynny).</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 6),
        },
        es: {
            slug: 'calculadora-de-galones-a-litros',
            title: 'Calculadora de Galones a Litros',
            h1: 'Calculadora de Galones a Litros',
            meta_title: 'Galones a Litros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte galones a litros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de galones estadounidenses a litros (1 galón = 3,785412 litros) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Galones a litros es la conversión inversa de litros a galones, necesaria siempre que una cantidad estadounidense de combustible, pintura o bebida en galones deba entenderse en términos métricos.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de volumen.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 galón estadounidense = exactamente 3,785411784 litros, por definición legal de EE. UU.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Ten cuidado con "qué galón":</b> esta calculadora usa por defecto el galón líquido estadounidense — selecciona "Galón (Imperial)" si tu fuente es del Reino Unido.',
            ],
            howto: [
                { question: '¿Cuántos litros hay en un galón?', answer: '<p>1 galón estadounidense equivale exactamente a 3,785411784 litros. Para convertir, multiplica el valor en galones por 3,785412.</p>' },
                { question: '¿Puedo convertir litros de vuelta a galones con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Litro y Galón (EE. UU., líquido) respectivamente.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 6),
        },
        fr: {
            slug: 'calculateur-de-gallons-en-litres',
            title: 'Calculateur de Gallons en Litres',
            h1: 'Calculateur de Gallons en Litres',
            meta_title: 'Gallons en Litres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des gallons en litres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de gallons américains en litres (1 gallon = 3,785412 litres) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Gallons en litres est l’inverse de litres en gallons, nécessaire chaque fois qu’une quantité américaine de carburant, de peinture ou de boisson en gallons doit être comprise en termes métriques.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de volume.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 gallon américain = exactement 3,785411784 litres, par définition légale américaine.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Attention à « quel gallon » :</b> ce calculateur utilise par défaut le gallon liquide américain — sélectionnez « Gallon (Impérial) » si votre source est britannique.',
            ],
            howto: [
                { question: 'Combien de litres y a-t-il dans un gallon ?', answer: '<p>1 gallon américain équivaut exactement à 3,785411784 litres. Pour convertir, multipliez la valeur en gallons par 3,785412.</p>' },
                { question: 'Puis-je convertir des litres en gallons avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Litre et Gallon (US, liquide) respectivement.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 6),
        },
        it: {
            slug: 'calcolatore-da-galloni-a-litri',
            title: 'Calcolatore da Galloni a Litri',
            h1: 'Calcolatore da Galloni a Litri',
            meta_title: 'Galloni in Litri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti galloni in litri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da galloni statunitensi a litri (1 gallone = 3,785412 litri) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Galloni in litri è l’inverso di litri in galloni, necessaria ogni volta che una quantità statunitense di carburante, vernice o bevanda in galloni deve essere compresa in termini metrici.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di volume.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 gallone statunitense = esattamente 3,785411784 litri, per definizione legale statunitense.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume supportate.',
                '<b>Attenzione a "quale gallone":</b> questo convertitore usa di default il gallone liquido statunitense — seleziona "Gallone (Imperiale)" se la tua fonte è britannica.',
            ],
            howto: [
                { question: 'Quanti litri ci sono in un gallone?', answer: '<p>1 gallone statunitense equivale esattamente a 3,785411784 litri. Per convertire, moltiplica il valore in galloni per 3,785412.</p>' },
                { question: 'Posso convertire i litri in galloni con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Litro e Gallone (USA, liquido).</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 6),
        },
        de: {
            slug: 'gallonen-in-liter-rechner',
            title: 'Gallonen in Liter Rechner',
            h1: 'Gallonen in Liter Rechner',
            meta_title: 'Gallonen in Liter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Gallonen sofort in Liter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Gallonen in Liter um (1 Gallone = 3,785412 Liter) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Gallonen in Liter ist die Umkehrung von Liter in Gallonen, benötigt, wenn eine US-Menge an Kraftstoff, Farbe oder Getränk in Gallonen in metrischen Begriffen verstanden werden muss.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Volumeneinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Gallone = genau 3,785411784 Liter, nach gesetzlicher US-Definition.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Achten Sie darauf, "welche Gallone":</b> dieser Rechner verwendet standardmäßig die US-Flüssiggallone — wählen Sie "Gallone (Imperial)", wenn Ihre Quelle britisch ist.',
            ],
            howto: [
                { question: 'Wie viele Liter sind in einer Gallone?', answer: '<p>1 US-Gallone entspricht genau 3,785411784 Litern. Um umzurechnen, multiplizieren Sie den Gallonenwert mit 3,785412.</p>' },
                { question: 'Kann ich mit diesem Tool Liter zurück in Gallonen umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Liter bzw. Gallone (US, flüssig).</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 6),
        },
    },
}

// ============================================================
// 1083: Milliliters to Fluid Ounces Converter
// ============================================================
const mlToFlOz: ToolDef = {
    id: '1083',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 100 },
            { key: 'from_unit', default: 'milliliter' },
            { key: 'to_unit', default: 'fl_oz_us' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'milliliters-to-fluid-ounces-converter',
            title: 'Milliliters to Fluid Ounces Converter',
            h1: 'Milliliters to Fluid Ounces Converter',
            meta_title: 'Milliliters to Fluid Ounces Converter | Convert Any Volume Unit',
            meta_description: 'Convert milliliters to fluid ounces instantly, or switch to any of 40+ volume units — liters, cups, pints, gallons, tablespoons, and more.',
            short_answer: 'This converter changes a volume value from milliliters to U.S. fluid ounces (1 mL = 0.033814 fl oz) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Milliliters to fluid ounces is constantly needed for reading bottle and container labels, recipe conversions, and medication dosing when comparing metric (mL) product labeling to the US customary fluid ounce.</p><p>This tool goes beyond mL and US fl oz: the "From" and "To" dropdowns cover the full range of volume units — metric, US customary, Imperial (including the distinct Imperial fluid ounce), and specialized units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 milliliter = 0.033814 U.S. fluid ounces (and 1 U.S. fluid ounce = exactly 29.5735295625 mL).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Two different fluid ounces:</b> the U.S. fluid ounce (29.5735 mL) and the Imperial fluid ounce (28.4131 mL) are close but not identical — select "Ounce (Imperial fluid)" if your source is UK-based.',
            ],
            howto: [
                { question: 'How many fluid ounces are in a milliliter?', answer: '<p>1 milliliter equals approximately 0.0338 U.S. fluid ounces. To convert, divide the milliliter value by 29.5735295625, or multiply by 0.033814.</p>' },
                { question: 'Why do US and UK fluid ounces differ?', answer: '<p>They come from two different historical gallon definitions — the US fluid ounce is 1/128 of a US gallon, while the Imperial fluid ounce is 1/160 of an Imperial gallon, and the two gallons themselves are different sizes.</p>' },
            ],
            inputs: volumeInputs('en', '100'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-milllitry-v-zhidkostnye-untsii',
            title: 'Конвертер миллилитров в жидкостные унции',
            h1: 'Конвертер миллилитров в жидкостные унции',
            meta_title: 'Миллилитры в жидкостные унции | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте миллилитры в жидкостные унции мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из миллилитров в американские жидкостные унции (1 мл = 0,033814 унции) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Миллилитры в жидкостные унции постоянно нужны для чтения этикеток бутылок и упаковок, кулинарных конверсий и дозирования лекарств при сравнении метрической маркировки (мл) с американской жидкостной унцией.</p><p>Этот инструмент выходит за рамки мл и амер. жидк. унции: списки "Из" и "В" охватывают полный диапазон единиц объёма.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 миллилитр = 0,033814 американской жидкостной унции (а 1 американская жидкостная унция = ровно 29,5735295625 мл).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Две разные жидкостные унции:</b> американская (29,5735 мл) и имперская (28,4131 мл) близки, но не идентичны.',
            ],
            howto: [
                { question: 'Сколько жидкостных унций в миллилитре?', answer: '<p>1 миллилитр равен примерно 0,0338 американской жидкостной унции. Чтобы конвертировать, разделите значение в мл на 29,5735295625.</p>' },
                { question: 'Почему американские и британские жидкостные унции отличаются?', answer: '<p>Они происходят от двух разных исторических определений галлона — американская унция составляет 1/128 американского галлона, а имперская — 1/160 имперского галлона.</p>' },
            ],
            inputs: volumeInputs('ru', '100'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'mililitru-uz-skidruma-unci-kalkulators',
            title: 'Mililitru uz Šķidruma Unci Kalkulators',
            h1: 'Mililitru uz Šķidruma Unci Kalkulators',
            meta_title: 'Mililitri uz Šķidruma Unci | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet mililitrus uz šķidruma uncēm acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no mililitriem uz ASV šķidruma uncēm (1 mL = 0,033814 unces) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Mililitri uz šķidruma uncēm pastāvīgi nepieciešami, lasot pudeļu un iepakojumu etiķetes, kulinārijas konversijās un medikamentu devās, salīdzinot metrisko (mL) marķējumu ar ASV šķidruma unci.</p><p>Šis rīks sniedzas tālāk par mL un ASV šķidruma unci: saraksti "No" un "Uz" aptver pilnu tilpuma vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 mililitrs = 0,033814 ASV šķidruma unces (un 1 ASV šķidruma unce = tieši 29,5735295625 mL).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Divas dažādas šķidruma unces:</b> ASV (29,5735 mL) un imperiālā (28,4131 mL) ir tuvas, bet ne identiskas.',
            ],
            howto: [
                { question: 'Cik šķidruma unču ir mililitrā?', answer: '<p>1 mililitrs ir aptuveni 0,0338 ASV šķidruma unces. Lai konvertētu, daliet mL vērtību ar 29,5735295625.</p>' },
                { question: 'Kāpēc ASV un Lielbritānijas šķidruma unces atšķiras?', answer: '<p>Tās nāk no diviem dažādiem vēsturiskiem galona definīcijām — ASV unce ir 1/128 no ASV galona, bet imperiālā — 1/160 no imperiālā galona.</p>' },
            ],
            inputs: volumeInputs('lv', '100'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-mililitrow-na-uncje-plynne',
            title: 'Kalkulator Mililitrów na Uncje Płynne',
            h1: 'Kalkulator Mililitrów na Uncje Płynne',
            meta_title: 'Mililitry na Uncje Płynne | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz mililitry na uncje płynne natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z mililitrów na amerykańskie uncje płynne (1 mL = 0,033814 uncji) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Mililitry na uncje płynne są stale potrzebne przy odczytywaniu etykiet butelek i opakowań, przeliczaniu przepisów kulinarnych i dawkowaniu leków przy porównywaniu metrycznego oznaczenia (mL) z amerykańską uncją płynną.</p><p>To narzędzie wykracza poza mL i amerykańską uncję płynną: listy "Z" i "Do" obejmują pełny zakres jednostek objętości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 mililitr = 0,033814 amerykańskiej uncji płynnej (a 1 amerykańska uncja płynna = dokładnie 29,5735295625 mL).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Dwie różne uncje płynne:</b> amerykańska (29,5735 mL) i imperialna (28,4131 mL) są zbliżone, ale nie identyczne.',
            ],
            howto: [
                { question: 'Ile uncji płynnych jest w mililitrze?', answer: '<p>1 mililitr to około 0,0338 amerykańskiej uncji płynnej. Aby przeliczyć, podziel wartość w mL przez 29,5735295625.</p>' },
                { question: 'Dlaczego amerykańskie i brytyjskie uncje płynne się różnią?', answer: '<p>Pochodzą z dwóch różnych historycznych definicji galonu — amerykańska uncja to 1/128 galonu amerykańskiego, a imperialna to 1/160 galonu imperialnego.</p>' },
            ],
            inputs: volumeInputs('pl', '100'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-mililitros-a-onzas-liquidas',
            title: 'Calculadora de Mililitros a Onzas Líquidas',
            h1: 'Calculadora de Mililitros a Onzas Líquidas',
            meta_title: 'Mililitros a Onzas Líquidas | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte mililitros a onzas líquidas al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de mililitros a onzas líquidas estadounidenses (1 mL = 0,033814 onzas) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Mililitros a onzas líquidas se necesita constantemente para leer etiquetas de botellas y envases, conversiones de recetas y dosificación de medicamentos al comparar el etiquetado métrico (mL) con la onza líquida estadounidense.</p><p>Esta herramienta va más allá de mL y onzas líquidas de EE. UU.: los menús desplegables "De" y "A" cubren toda la gama de unidades de volumen.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 mililitro = 0,033814 onzas líquidas estadounidenses (y 1 onza líquida estadounidense = exactamente 29,5735295625 mL).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Dos onzas líquidas diferentes:</b> la estadounidense (29,5735 mL) y la imperial (28,4131 mL) son cercanas pero no idénticas.',
            ],
            howto: [
                { question: '¿Cuántas onzas líquidas hay en un mililitro?', answer: '<p>1 mililitro equivale aproximadamente a 0,0338 onzas líquidas estadounidenses. Para convertir, divide el valor en mL entre 29,5735295625.</p>' },
                { question: '¿Por qué difieren las onzas líquidas de EE. UU. y del Reino Unido?', answer: '<p>Provienen de dos definiciones históricas de galón diferentes — la onza estadounidense es 1/128 de un galón estadounidense, mientras que la imperial es 1/160 de un galón imperial.</p>' },
            ],
            inputs: volumeInputs('es', '100'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-millilitres-en-onces-liquides',
            title: 'Calculateur de Millilitres en Onces Liquides',
            h1: 'Calculateur de Millilitres en Onces Liquides',
            meta_title: 'Millilitres en Onces Liquides | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des millilitres en onces liquides instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de millilitres en onces liquides américaines (1 mL = 0,033814 once) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Millilitres en onces liquides est constamment nécessaire pour lire les étiquettes de bouteilles et d’emballages, les conversions de recettes et le dosage de médicaments lors de la comparaison de l’étiquetage métrique (mL) avec l’once liquide américaine.</p><p>Cet outil va au-delà des mL et des onces liquides US : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de volume.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 millilitre = 0,033814 once liquide américaine (et 1 once liquide américaine = exactement 29,5735295625 mL).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Deux onces liquides différentes :</b> l’américaine (29,5735 mL) et l’impériale (28,4131 mL) sont proches mais pas identiques.',
            ],
            howto: [
                { question: 'Combien d’onces liquides y a-t-il dans un millilitre ?', answer: '<p>1 millilitre équivaut à environ 0,0338 once liquide américaine. Pour convertir, divisez la valeur en mL par 29,5735295625.</p>' },
                { question: 'Pourquoi les onces liquides américaines et britanniques diffèrent-elles ?', answer: '<p>Elles proviennent de deux définitions historiques de gallon différentes — l’once américaine est 1/128 d’un gallon américain, tandis que l’impériale est 1/160 d’un gallon impérial.</p>' },
            ],
            inputs: volumeInputs('fr', '100'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-millilitri-a-once-fluide',
            title: 'Calcolatore da Millilitri a Once Fluide',
            h1: 'Calcolatore da Millilitri a Once Fluide',
            meta_title: 'Millilitri in Once Fluide | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti millilitri in once fluide istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da millilitri a once fluide statunitensi (1 mL = 0,033814 once) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Millilitri in once fluide è costantemente necessario per leggere le etichette di bottiglie e confezioni, le conversioni di ricette e il dosaggio di farmaci quando si confronta l’etichettatura metrica (mL) con l’oncia fluida statunitense.</p><p>Questo strumento va oltre mL e once fluide USA: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di volume.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 millilitro = 0,033814 once fluide statunitensi (e 1 oncia fluida statunitense = esattamente 29,5735295625 mL).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Due once fluide diverse:</b> quella statunitense (29,5735 mL) e quella imperiale (28,4131 mL) sono vicine ma non identiche.',
            ],
            howto: [
                { question: 'Quante once fluide ci sono in un millilitro?', answer: '<p>1 millilitro equivale a circa 0,0338 once fluide statunitensi. Per convertire, dividi il valore in mL per 29,5735295625.</p>' },
                { question: 'Perché le once fluide statunitensi e britanniche differiscono?', answer: '<p>Derivano da due diverse definizioni storiche di gallone — l’oncia statunitense è 1/128 di un gallone statunitense, mentre l’imperiale è 1/160 di un gallone imperiale.</p>' },
            ],
            inputs: volumeInputs('it', '100'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'milliliter-in-flüssigunzen-rechner',
            title: 'Milliliter in Flüssigunzen Rechner',
            h1: 'Milliliter in Flüssigunzen Rechner',
            meta_title: 'Milliliter in Flüssigunzen | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Milliliter sofort in Flüssigunzen um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von Millilitern in US-Flüssigunzen um (1 mL = 0,033814 fl oz) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Milliliter in Flüssigunzen wird ständig benötigt, um Flaschen- und Verpackungsetiketten zu lesen, Rezepte umzurechnen und Medikamente zu dosieren, wenn metrische (mL) Produktkennzeichnung mit der US-amerikanischen Flüssigunze verglichen wird.</p><p>Dieses Tool geht über mL und US fl oz hinaus: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Volumeneinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Milliliter = 0,033814 US-Flüssigunzen (und 1 US-Flüssigunze = genau 29,5735295625 mL).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Zwei verschiedene Flüssigunzen:</b> die US-amerikanische (29,5735 mL) und die imperiale (28,4131 mL) sind nah beieinander, aber nicht identisch.',
            ],
            howto: [
                { question: 'Wie viele Flüssigunzen sind in einem Milliliter?', answer: '<p>1 Milliliter entspricht etwa 0,0338 US-Flüssigunzen. Um umzurechnen, teilen Sie den mL-Wert durch 29,5735295625.</p>' },
                { question: 'Warum unterscheiden sich US- und UK-Flüssigunzen?', answer: '<p>Sie stammen aus zwei unterschiedlichen historischen Gallonendefinitionen — die US-Unze ist 1/128 einer US-Gallone, während die imperiale 1/160 einer imperialen Gallone ist.</p>' },
            ],
            inputs: volumeInputs('de', '100'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1084: Cups to Milliliters Converter
// ============================================================
const cupsToMl: ToolDef = {
    id: '1084',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'cup_us' },
            { key: 'to_unit', default: 'milliliter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'cups-to-milliliters-converter',
            title: 'Cups to Milliliters Converter',
            h1: 'Cups to Milliliters Converter',
            meta_title: 'Cups to Milliliters Converter | Convert Any Volume Unit',
            meta_description: 'Convert cups to milliliters instantly, or switch to any of 40+ volume units — liters, fluid ounces, tablespoons, teaspoons, pints, and more.',
            short_answer: 'This converter changes a volume value from U.S. cups to milliliters (1 cup = 236.588 mL) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Cups to milliliters is one of the most common cooking conversions, since US recipes are written in cups while most of the world measures ingredients in milliliters.</p><p>This tool goes beyond cups and mL: the "From" and "To" dropdowns also cover the Canadian cup and the historical UK "breakfast cup" — three genuinely different sizes sharing the same name — plus the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. cup = exactly 236.5882365 milliliters.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Three different "cups":</b> the U.S. cup (236.59 mL), the Canadian cup (227.30 mL), and the UK "breakfast cup" (284.13 mL) are all distinct — check which one your recipe means before converting.',
            ],
            howto: [
                { question: 'How many milliliters are in a cup?', answer: '<p>1 U.S. cup equals exactly 236.5882365 milliliters (commonly rounded to 237 mL in recipes). To convert, multiply the cup value by 236.588.</p>' },
                { question: 'Is a Canadian cup the same as a US cup?', answer: '<p>No — the Canadian cup (227.3045 mL) is based on 8 imperial fluid ounces and is about 4% smaller than the US cup. Select "Cup (Canadian)" if your recipe is Canadian in origin.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 2),
        },
        ru: {
            slug: 'kalkulyator-chashki-v-milllitry',
            title: 'Конвертер чашек в миллилитры',
            h1: 'Конвертер чашек в миллилитры',
            meta_title: 'Чашки в миллилитры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте чашки в миллилитры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из американских чашек в миллилитры (1 чашка = 236,588 мл) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Чашки в миллилитры — одна из самых распространённых кулинарных конверсий, так как американские рецепты написаны в чашках, а большая часть мира измеряет ингредиенты в миллилитрах.</p><p>Этот инструмент выходит за рамки чашек и мл: списки "Из" и "В" также охватывают канадскую чашку и историческую британскую "чашку для завтрака".</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американская чашка = ровно 236,5882365 миллилитра.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Три разные "чашки":</b> американская (236,59 мл), канадская (227,30 мл) и британская "для завтрака" (284,13 мл) — все разные.',
            ],
            howto: [
                { question: 'Сколько миллилитров в чашке?', answer: '<p>1 американская чашка равна ровно 236,5882365 миллилитра (обычно округляется до 237 мл в рецептах).</p>' },
                { question: 'Канадская чашка такая же, как американская?', answer: '<p>Нет — канадская чашка (227,3045 мл) основана на 8 имперских жидкостных унциях и примерно на 4% меньше американской.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 2),
        },
        lv: {
            slug: 'tases-uz-mililitriem-kalkulators',
            title: 'Tases uz Mililitriem Kalkulators',
            h1: 'Tases uz Mililitriem Kalkulators',
            meta_title: 'Tases uz Mililitriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet tases uz mililitriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV tasēm uz mililitriem (1 tase = 236,588 mL) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Tases uz mililitriem ir viena no visizplatītākajām kulinārijas konversijām, jo ASV receptes rakstītas tasēs, kamēr lielākā daļa pasaules mēra ingredientus mililitros.</p><p>Šis rīks sniedzas tālāk par tasēm un mL: saraksti "No" un "Uz" aptver arī Kanādas tasi un vēsturisko Lielbritānijas "brokastu tasi".</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV tase = tieši 236,5882365 mililitri.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Trīs dažādas "tases":</b> ASV (236,59 mL), Kanādas (227,30 mL) un Lielbritānijas "brokastu" (284,13 mL) ir visas atšķirīgas.',
            ],
            howto: [
                { question: 'Cik mililitru ir tasē?', answer: '<p>1 ASV tase ir tieši 236,5882365 mililitri (parasti noapaļo līdz 237 mL receptēs).</p>' },
                { question: 'Vai Kanādas tase ir tāda pati kā ASV tase?', answer: '<p>Nē — Kanādas tase (227,3045 mL) balstīta uz 8 imperiālām šķidruma uncēm un ir apmēram par 4% mazāka nekā ASV tase.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 2),
        },
        pl: {
            slug: 'kalkulator-filizanek-na-mililitry',
            title: 'Kalkulator Filiżanek na Mililitry',
            h1: 'Kalkulator Filiżanek na Mililitry',
            meta_title: 'Filiżanki na Mililitry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz filiżanki na mililitry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z filiżanek amerykańskich na mililitry (1 filiżanka = 236,588 mL) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Filiżanki na mililitry to jedna z najczęstszych konwersji kulinarnych, ponieważ amerykańskie przepisy są pisane w filiżankach, a większość świata mierzy składniki w mililitrach.</p><p>To narzędzie wykracza poza filiżanki i mL: listy "Z" i "Do" obejmują także filiżankę kanadyjską i historyczną brytyjską "filiżankę śniadaniową".</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 filiżanka amerykańska = dokładnie 236,5882365 mililitra.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Trzy różne "filiżanki":</b> amerykańska (236,59 mL), kanadyjska (227,30 mL) i brytyjska "śniadaniowa" (284,13 mL) są różne.',
            ],
            howto: [
                { question: 'Ile mililitrów jest w filiżance?', answer: '<p>1 filiżanka amerykańska to dokładnie 236,5882365 mililitra (zwykle zaokrąglane do 237 mL w przepisach).</p>' },
                { question: 'Czy filiżanka kanadyjska to to samo co amerykańska?', answer: '<p>Nie — filiżanka kanadyjska (227,3045 mL) opiera się na 8 imperialnych uncjach płynnych i jest o około 4% mniejsza niż amerykańska.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 2),
        },
        es: {
            slug: 'calculadora-de-tazas-a-mililitros',
            title: 'Calculadora de Tazas a Mililitros',
            h1: 'Calculadora de Tazas a Mililitros',
            meta_title: 'Tazas a Mililitros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte tazas a mililitros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de tazas estadounidenses a mililitros (1 taza = 236,588 mL) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Tazas a mililitros es una de las conversiones de cocina más comunes, ya que las recetas estadounidenses se escriben en tazas mientras que la mayor parte del mundo mide los ingredientes en mililitros.</p><p>Esta herramienta va más allá de tazas y mL: los menús desplegables "De" y "A" también cubren la taza canadiense y la histórica "taza de desayuno" británica.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 taza estadounidense = exactamente 236,5882365 mililitros.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Tres "tazas" diferentes:</b> la estadounidense (236,59 mL), la canadiense (227,30 mL) y la "de desayuno" británica (284,13 mL) son distintas.',
            ],
            howto: [
                { question: '¿Cuántos mililitros hay en una taza?', answer: '<p>1 taza estadounidense equivale exactamente a 236,5882365 mililitros (normalmente redondeada a 237 mL en recetas).</p>' },
                { question: '¿Es una taza canadiense igual a una taza estadounidense?', answer: '<p>No — la taza canadiense (227,3045 mL) se basa en 8 onzas líquidas imperiales y es aproximadamente un 4% más pequeña que la estadounidense.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 2),
        },
        fr: {
            slug: 'calculateur-de-tasses-en-millilitres',
            title: 'Calculateur de Tasses en Millilitres',
            h1: 'Calculateur de Tasses en Millilitres',
            meta_title: 'Tasses en Millilitres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des tasses en millilitres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de tasses américaines en millilitres (1 tasse = 236,588 mL) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Tasses en millilitres est l’une des conversions culinaires les plus courantes, les recettes américaines étant écrites en tasses tandis que la majeure partie du monde mesure les ingrédients en millilitres.</p><p>Cet outil va au-delà des tasses et des mL : les listes déroulantes « De » et « Vers » couvrent aussi la tasse canadienne et la « tasse de petit-déjeuner » britannique historique.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 tasse américaine = exactement 236,5882365 millilitres.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Trois « tasses » différentes :</b> l’américaine (236,59 mL), la canadienne (227,30 mL) et la « petit-déjeuner » britannique (284,13 mL) sont toutes distinctes.',
            ],
            howto: [
                { question: 'Combien de millilitres y a-t-il dans une tasse ?', answer: '<p>1 tasse américaine équivaut exactement à 236,5882365 millilitres (souvent arrondie à 237 mL dans les recettes).</p>' },
                { question: 'Une tasse canadienne est-elle identique à une tasse américaine ?', answer: '<p>Non — la tasse canadienne (227,3045 mL) est basée sur 8 onces liquides impériales et est environ 4 % plus petite que la tasse américaine.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 2),
        },
        it: {
            slug: 'calcolatore-da-tazze-a-millilitri',
            title: 'Calcolatore da Tazze a Millilitri',
            h1: 'Calcolatore da Tazze a Millilitri',
            meta_title: 'Tazze in Millilitri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti tazze in millilitri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da tazze statunitensi a millilitri (1 tazza = 236,588 mL) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Tazze in millilitri è una delle conversioni culinarie più comuni, poiché le ricette statunitensi sono scritte in tazze mentre gran parte del mondo misura gli ingredienti in millilitri.</p><p>Questo strumento va oltre tazze e mL: i menu a tendina "Da" e "A" coprono anche la tazza canadese e la storica "tazza da colazione" britannica.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 tazza statunitense = esattamente 236,5882365 millilitri.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Tre "tazze" diverse:</b> quella statunitense (236,59 mL), quella canadese (227,30 mL) e quella "da colazione" britannica (284,13 mL) sono tutte distinte.',
            ],
            howto: [
                { question: 'Quanti millilitri ci sono in una tazza?', answer: '<p>1 tazza statunitense equivale esattamente a 236,5882365 millilitri (spesso arrotondata a 237 mL nelle ricette).</p>' },
                { question: 'Una tazza canadese è uguale a una tazza statunitense?', answer: '<p>No — la tazza canadese (227,3045 mL) si basa su 8 once fluide imperiali ed è circa il 4% più piccola di quella statunitense.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 2),
        },
        de: {
            slug: 'cups-in-milliliter-rechner',
            title: 'Cups in Milliliter Rechner',
            h1: 'Cups in Milliliter Rechner',
            meta_title: 'Cups in Milliliter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Cups sofort in Milliliter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Cups in Milliliter um (1 Cup = 236,588 mL) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Cups in Milliliter ist eine der häufigsten Kochumrechnungen, da US-Rezepte in Cups geschrieben sind, während der Großteil der Welt Zutaten in Millilitern misst.</p><p>Dieses Tool geht über Cups und mL hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch den kanadischen Cup und den historischen britischen "Breakfast Cup" ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Cup = genau 236,5882365 Milliliter.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Drei verschiedene "Cups":</b> der US-Cup (236,59 mL), der kanadische Cup (227,30 mL) und der britische "Breakfast Cup" (284,13 mL) sind alle unterschiedlich.',
            ],
            howto: [
                { question: 'Wie viele Milliliter sind in einem Cup?', answer: '<p>1 US-Cup entspricht genau 236,5882365 Millilitern (in Rezepten oft auf 237 mL gerundet).</p>' },
                { question: 'Ist ein kanadischer Cup dasselbe wie ein US-Cup?', answer: '<p>Nein — der kanadische Cup (227,3045 mL) basiert auf 8 imperialen Flüssigunzen und ist etwa 4% kleiner als der US-Cup.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 2),
        },
    },
}

// ============================================================
// 1085: Tablespoons to Milliliters Converter
// ============================================================
const tbspToMl: ToolDef = {
    id: '1085',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'tablespoon_us' },
            { key: 'to_unit', default: 'milliliter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'tablespoons-to-milliliters-converter',
            title: 'Tablespoons to Milliliters Converter',
            h1: 'Tablespoons to Milliliters Converter',
            meta_title: 'Tablespoons to Milliliters Converter | Convert Any Volume Unit',
            meta_description: 'Convert tablespoons to milliliters instantly, or switch to any of 40+ volume units — cups, teaspoons, fluid ounces, liters, and more.',
            short_answer: 'This converter changes a volume value from U.S. tablespoons to milliliters (1 tablespoon = 14.787 mL) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Tablespoons to milliliters is a frequent cooking and pharmacy conversion, since US recipes and some medication instructions use tablespoons while most measuring tools and international recipes use milliliters.</p><p>This tool goes beyond the US tablespoon: the "From" and "To" dropdowns also cover the Canadian and Imperial tablespoon (both slightly different sizes) plus the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. tablespoon = 14.7868 milliliters (exactly half a US fluid ounce).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Three tablespoon sizes:</b> U.S. (14.787 mL), Canadian (14.207 mL), and Imperial (17.758 mL) tablespoons are all different — the Imperial one is notably larger.',
            ],
            howto: [
                { question: 'How many milliliters are in a tablespoon?', answer: '<p>1 U.S. tablespoon equals approximately 14.787 milliliters (commonly rounded to 15 mL). To convert, multiply the tablespoon value by 14.7868.</p>' },
                { question: 'How many tablespoons are in a cup?', answer: '<p>There are 16 U.S. tablespoons in 1 U.S. cup, since a cup is 236.588 mL and a tablespoon is 14.7868 mL.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-stolovye-lozhki-v-milllitry',
            title: 'Конвертер столовых ложек в миллилитры',
            h1: 'Конвертер столовых ложек в миллилитры',
            meta_title: 'Столовые ложки в миллилитры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте столовые ложки в миллилитры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из американских столовых ложек в миллилитры (1 ложка = 14,787 мл) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Столовые ложки в миллилитры — частая кулинарная и фармацевтическая конверсия, так как американские рецепты используют ложки, а большинство измерительных инструментов — миллилитры.</p><p>Этот инструмент выходит за рамки американской ложки: списки "Из" и "В" также охватывают канадскую и имперскую столовую ложку.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американская столовая ложка = 14,7868 миллилитра (ровно половина американской жидкостной унции).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Три размера ложки:</b> американская (14,787 мл), канадская (14,207 мл) и имперская (17,758 мл) — все разные.',
            ],
            howto: [
                { question: 'Сколько миллилитров в столовой ложке?', answer: '<p>1 американская столовая ложка равна примерно 14,787 миллилитра (обычно округляется до 15 мл).</p>' },
                { question: 'Сколько столовых ложек в чашке?', answer: '<p>В 1 американской чашке 16 столовых ложек, так как чашка составляет 236,588 мл, а ложка — 14,7868 мл.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'edamkarosu-uz-mililitriem-kalkulators',
            title: 'Ēdamkarošu uz Mililitriem Kalkulators',
            h1: 'Ēdamkarošu uz Mililitriem Kalkulators',
            meta_title: 'Ēdamkarotes uz Mililitriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet ēdamkarotes uz mililitriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV ēdamkarotēm uz mililitriem (1 karote = 14,787 mL) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Ēdamkarotes uz mililitriem ir bieža kulinārijas un farmācijas konversija, jo ASV receptes izmanto karotes, kamēr lielākā daļa mērinstrumentu izmanto mililitrus.</p><p>Šis rīks sniedzas tālāk par ASV karoti: saraksti "No" un "Uz" aptver arī Kanādas un Imperiālo ēdamkaroti.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV ēdamkarote = 14,7868 mililitri (tieši puse no ASV šķidruma unces).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Trīs karošu izmēri:</b> ASV (14,787 mL), Kanādas (14,207 mL) un Imperiālā (17,758 mL) karotes ir visas atšķirīgas.',
            ],
            howto: [
                { question: 'Cik mililitru ir ēdamkarotē?', answer: '<p>1 ASV ēdamkarote ir aptuveni 14,787 mililitri (parasti noapaļo līdz 15 mL).</p>' },
                { question: 'Cik ēdamkarošu ir tasē?', answer: '<p>1 ASV tasē ir 16 ēdamkarotes, jo tase ir 236,588 mL, bet karote — 14,7868 mL.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-lyzek-stolowych-na-mililitry',
            title: 'Kalkulator Łyżek Stołowych na Mililitry',
            h1: 'Kalkulator Łyżek Stołowych na Mililitry',
            meta_title: 'Łyżki Stołowe na Mililitry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz łyżki stołowe na mililitry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z amerykańskich łyżek stołowych na mililitry (1 łyżka = 14,787 mL) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Łyżki stołowe na mililitry to częsta konwersja kulinarna i farmaceutyczna, ponieważ amerykańskie przepisy używają łyżek, a większość narzędzi pomiarowych używa mililitrów.</p><p>To narzędzie wykracza poza amerykańską łyżkę: listy "Z" i "Do" obejmują także łyżkę kanadyjską i imperialną.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykańska łyżka stołowa = 14,7868 mililitra (dokładnie połowa amerykańskiej uncji płynnej).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Trzy rozmiary łyżki:</b> amerykańska (14,787 mL), kanadyjska (14,207 mL) i imperialna (17,758 mL) są różne.',
            ],
            howto: [
                { question: 'Ile mililitrów jest w łyżce stołowej?', answer: '<p>1 amerykańska łyżka stołowa to około 14,787 mililitra (zwykle zaokrąglane do 15 mL).</p>' },
                { question: 'Ile łyżek stołowych jest w filiżance?', answer: '<p>W 1 amerykańskiej filiżance jest 16 łyżek stołowych, ponieważ filiżanka to 236,588 mL, a łyżka to 14,7868 mL.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-cucharadas-a-mililitros',
            title: 'Calculadora de Cucharadas a Mililitros',
            h1: 'Calculadora de Cucharadas a Mililitros',
            meta_title: 'Cucharadas a Mililitros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte cucharadas a mililitros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de cucharadas estadounidenses a mililitros (1 cucharada = 14,787 mL) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Cucharadas a mililitros es una conversión frecuente en cocina y farmacia, ya que las recetas estadounidenses usan cucharadas mientras que la mayoría de las herramientas de medición usan mililitros.</p><p>Esta herramienta va más allá de la cucharada estadounidense: los menús desplegables "De" y "A" también cubren la cucharada canadiense e imperial.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 cucharada estadounidense = 14,7868 mililitros (exactamente la mitad de una onza líquida estadounidense).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Tres tamaños de cucharada:</b> la estadounidense (14,787 mL), la canadiense (14,207 mL) y la imperial (17,758 mL) son todas diferentes.',
            ],
            howto: [
                { question: '¿Cuántos mililitros hay en una cucharada?', answer: '<p>1 cucharada estadounidense equivale aproximadamente a 14,787 mililitros (comúnmente redondeada a 15 mL).</p>' },
                { question: '¿Cuántas cucharadas hay en una taza?', answer: '<p>Hay 16 cucharadas estadounidenses en 1 taza estadounidense, ya que una taza son 236,588 mL y una cucharada son 14,7868 mL.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-de-cuilleres-a-soupe-en-millilitres',
            title: 'Calculateur de Cuillères à Soupe en Millilitres',
            h1: 'Calculateur de Cuillères à Soupe en Millilitres',
            meta_title: 'Cuillères à Soupe en Millilitres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des cuillères à soupe en millilitres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de cuillères à soupe américaines en millilitres (1 cuillère = 14,787 mL) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Cuillères à soupe en millilitres est une conversion fréquente en cuisine et en pharmacie, les recettes américaines utilisant des cuillères tandis que la plupart des outils de mesure utilisent des millilitres.</p><p>Cet outil va au-delà de la cuillère américaine : les listes déroulantes « De » et « Vers » couvrent aussi la cuillère canadienne et impériale.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 cuillère à soupe américaine = 14,7868 millilitres (exactement la moitié d’une once liquide américaine).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Trois tailles de cuillère :</b> l’américaine (14,787 mL), la canadienne (14,207 mL) et l’impériale (17,758 mL) sont toutes différentes.',
            ],
            howto: [
                { question: 'Combien de millilitres y a-t-il dans une cuillère à soupe ?', answer: '<p>1 cuillère à soupe américaine équivaut à environ 14,787 millilitres (souvent arrondie à 15 mL).</p>' },
                { question: 'Combien de cuillères à soupe y a-t-il dans une tasse ?', answer: '<p>Il y a 16 cuillères à soupe américaines dans 1 tasse américaine, une tasse valant 236,588 mL et une cuillère 14,7868 mL.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-cucchiai-a-millilitri',
            title: 'Calcolatore da Cucchiai a Millilitri',
            h1: 'Calcolatore da Cucchiai a Millilitri',
            meta_title: 'Cucchiai in Millilitri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti cucchiai in millilitri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da cucchiai statunitensi a millilitri (1 cucchiaio = 14,787 mL) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Cucchiai in millilitri è una conversione frequente in cucina e farmacia, poiché le ricette statunitensi usano i cucchiai mentre la maggior parte degli strumenti di misura usa i millilitri.</p><p>Questo strumento va oltre il cucchiaio statunitense: i menu a tendina "Da" e "A" coprono anche il cucchiaio canadese e imperiale.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 cucchiaio statunitense = 14,7868 millilitri (esattamente metà di un’oncia fluida statunitense).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Tre dimensioni di cucchiaio:</b> quello statunitense (14,787 mL), canadese (14,207 mL) e imperiale (17,758 mL) sono tutti diversi.',
            ],
            howto: [
                { question: 'Quanti millilitri ci sono in un cucchiaio?', answer: '<p>1 cucchiaio statunitense equivale a circa 14,787 millilitri (spesso arrotondato a 15 mL).</p>' },
                { question: 'Quanti cucchiai ci sono in una tazza?', answer: '<p>Ci sono 16 cucchiai statunitensi in 1 tazza statunitense, poiché una tazza è 236,588 mL e un cucchiaio è 14,7868 mL.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'esslöffel-in-milliliter-rechner',
            title: 'Esslöffel in Milliliter Rechner',
            h1: 'Esslöffel in Milliliter Rechner',
            meta_title: 'Esslöffel in Milliliter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Esslöffel sofort in Milliliter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Esslöffeln in Milliliter um (1 Esslöffel = 14,787 mL) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Esslöffel in Milliliter ist eine häufige Koch- und Apothekenumrechnung, da US-Rezepte Esslöffel verwenden, während die meisten Messwerkzeuge Milliliter verwenden.</p><p>Dieses Tool geht über den US-Esslöffel hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch den kanadischen und imperialen Esslöffel ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Esslöffel = 14,7868 Milliliter (genau die Hälfte einer US-Flüssigunze).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Drei Löffelgrößen:</b> der US- (14,787 mL), kanadische (14,207 mL) und imperiale (17,758 mL) Esslöffel sind alle unterschiedlich.',
            ],
            howto: [
                { question: 'Wie viele Milliliter sind in einem Esslöffel?', answer: '<p>1 US-Esslöffel entspricht etwa 14,787 Millilitern (oft auf 15 mL gerundet).</p>' },
                { question: 'Wie viele Esslöffel sind in einem Cup?', answer: '<p>In 1 US-Cup sind 16 Esslöffel, da ein Cup 236,588 mL und ein Esslöffel 14,7868 mL entspricht.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 3),
        },
    },
}

// ============================================================
// 1086: Teaspoons to Milliliters Converter
// ============================================================
const tspToMl: ToolDef = {
    id: '1086',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'teaspoon_us' },
            { key: 'to_unit', default: 'milliliter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'teaspoons-to-milliliters-converter',
            title: 'Teaspoons to Milliliters Converter',
            h1: 'Teaspoons to Milliliters Converter',
            meta_title: 'Teaspoons to Milliliters Converter | Convert Any Volume Unit',
            meta_description: 'Convert teaspoons to milliliters instantly, or switch to any of 40+ volume units — tablespoons, cups, fluid ounces, liters, and more.',
            short_answer: 'This converter changes a volume value from U.S. teaspoons to milliliters (1 teaspoon = 4.929 mL) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Teaspoons to milliliters is essential for medication dosing (many liquid medicine labels give both units) and small-quantity cooking measurements like spices, baking soda, or extracts.</p><p>This tool goes beyond the US teaspoon: the "From" and "To" dropdowns also cover the Canadian and Imperial teaspoon (both slightly different) plus the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. teaspoon = 4.9289 milliliters (commonly rounded to 5 mL for dosing purposes).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Medication safety note:</b> a kitchen teaspoon is not a precise medical dosing tool — for medicine, always use the dosing device (syringe or cup) provided, since actual kitchen spoons vary in real volume.',
            ],
            howto: [
                { question: 'How many milliliters are in a teaspoon?', answer: '<p>1 U.S. teaspoon equals approximately 4.929 milliliters (rounded to 5 mL in most medical and cooking contexts). To convert, multiply by 4.9289.</p>' },
                { question: 'How many teaspoons are in a tablespoon?', answer: '<p>There are exactly 3 U.S. teaspoons in 1 U.S. tablespoon.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-chaynye-lozhki-v-milllitry',
            title: 'Конвертер чайных ложек в миллилитры',
            h1: 'Конвертер чайных ложек в миллилитры',
            meta_title: 'Чайные ложки в миллилитры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте чайные ложки в миллилитры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из американских чайных ложек в миллилитры (1 ложка = 4,929 мл) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Чайные ложки в миллилитры необходимы для дозирования лекарств и небольших кулинарных измерений, таких как специи или экстракты.</p><p>Этот инструмент выходит за рамки американской чайной ложки: списки "Из" и "В" также охватывают канадскую и имперскую чайную ложку.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американская чайная ложка = 4,9289 миллилитра (обычно округляется до 5 мл для дозирования).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Важно для лекарств:</b> кухонная ложка не является точным медицинским инструментом — для лекарств всегда используйте прилагаемое дозирующее устройство.',
            ],
            howto: [
                { question: 'Сколько миллилитров в чайной ложке?', answer: '<p>1 американская чайная ложка равна примерно 4,929 миллилитра (округляется до 5 мл в большинстве контекстов).</p>' },
                { question: 'Сколько чайных ложек в столовой?', answer: '<p>В 1 американской столовой ложке ровно 3 чайные ложки.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'tejkarosu-uz-mililitriem-kalkulators',
            title: 'Tējkarošu uz Mililitriem Kalkulators',
            h1: 'Tējkarošu uz Mililitriem Kalkulators',
            meta_title: 'Tējkarotes uz Mililitriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet tējkarotes uz mililitriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV tējkarotēm uz mililitriem (1 karote = 4,929 mL) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Tējkarotes uz mililitriem ir svarīgas medikamentu devām un mazu kulinārijas mērījumu, piemēram, garšvielu vai ekstraktu, veikšanai.</p><p>Šis rīks sniedzas tālāk par ASV tējkaroti: saraksti "No" un "Uz" aptver arī Kanādas un Imperiālo tējkaroti.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV tējkarote = 4,9289 mililitri (parasti noapaļo līdz 5 mL devu vajadzībām).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Medikamentu drošība:</b> virtuves karote nav precīzs medicīnisks devu instruments — medikamentiem vienmēr izmantojiet komplektā esošo devu ierīci.',
            ],
            howto: [
                { question: 'Cik mililitru ir tējkarotē?', answer: '<p>1 ASV tējkarote ir aptuveni 4,929 mililitri (noapaļo līdz 5 mL vairumā kontekstu).</p>' },
                { question: 'Cik tējkarošu ir ēdamkarotē?', answer: '<p>1 ASV ēdamkarotē ir tieši 3 tējkarotes.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-lyzeczek-na-mililitry',
            title: 'Kalkulator Łyżeczek na Mililitry',
            h1: 'Kalkulator Łyżeczek na Mililitry',
            meta_title: 'Łyżeczki na Mililitry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz łyżeczki na mililitry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z amerykańskich łyżeczek na mililitry (1 łyżeczka = 4,929 mL) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Łyżeczki na mililitry są niezbędne do dawkowania leków i małych pomiarów kulinarnych, takich jak przyprawy czy ekstrakty.</p><p>To narzędzie wykracza poza amerykańską łyżeczkę: listy "Z" i "Do" obejmują także łyżeczkę kanadyjską i imperialną.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykańska łyżeczka = 4,9289 mililitra (zwykle zaokrąglane do 5 mL dla dawkowania).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Uwaga dotycząca leków:</b> łyżeczka kuchenna nie jest precyzyjnym narzędziem medycznym — do leków zawsze używaj dołączonego urządzenia dozującego.',
            ],
            howto: [
                { question: 'Ile mililitrów jest w łyżeczce?', answer: '<p>1 amerykańska łyżeczka to około 4,929 mililitra (zaokrąglane do 5 mL w większości kontekstów).</p>' },
                { question: 'Ile łyżeczek jest w łyżce stołowej?', answer: '<p>W 1 amerykańskiej łyżce stołowej są dokładnie 3 łyżeczki.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-cucharaditas-a-mililitros',
            title: 'Calculadora de Cucharaditas a Mililitros',
            h1: 'Calculadora de Cucharaditas a Mililitros',
            meta_title: 'Cucharaditas a Mililitros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte cucharaditas a mililitros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de cucharaditas estadounidenses a mililitros (1 cucharadita = 4,929 mL) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Cucharaditas a mililitros es esencial para la dosificación de medicamentos y mediciones culinarias pequeñas como especias o extractos.</p><p>Esta herramienta va más allá de la cucharadita estadounidense: los menús desplegables "De" y "A" también cubren la cucharadita canadiense e imperial.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 cucharadita estadounidense = 4,9289 mililitros (comúnmente redondeada a 5 mL para dosificación).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Nota de seguridad para medicamentos:</b> una cucharadita de cocina no es una herramienta de dosificación médica precisa — usa siempre el dispositivo dosificador incluido.',
            ],
            howto: [
                { question: '¿Cuántos mililitros hay en una cucharadita?', answer: '<p>1 cucharadita estadounidense equivale aproximadamente a 4,929 mililitros (redondeada a 5 mL en la mayoría de los contextos).</p>' },
                { question: '¿Cuántas cucharaditas hay en una cucharada?', answer: '<p>Hay exactamente 3 cucharaditas estadounidenses en 1 cucharada estadounidense.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-de-cuilleres-a-cafe-en-millilitres',
            title: 'Calculateur de Cuillères à Café en Millilitres',
            h1: 'Calculateur de Cuillères à Café en Millilitres',
            meta_title: 'Cuillères à Café en Millilitres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des cuillères à café en millilitres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de cuillères à café américaines en millilitres (1 cuillère = 4,929 mL) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Cuillères à café en millilitres est essentiel pour le dosage de médicaments et les petites mesures culinaires comme les épices ou les extraits.</p><p>Cet outil va au-delà de la cuillère à café américaine : les listes déroulantes « De » et « Vers » couvrent aussi la cuillère canadienne et impériale.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 cuillère à café américaine = 4,9289 millilitres (souvent arrondie à 5 mL pour le dosage).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Remarque sur la sécurité des médicaments :</b> une cuillère à café de cuisine n’est pas un outil de dosage médical précis — utilisez toujours le dispositif doseur fourni.',
            ],
            howto: [
                { question: 'Combien de millilitres y a-t-il dans une cuillère à café ?', answer: '<p>1 cuillère à café américaine équivaut à environ 4,929 millilitres (arrondie à 5 mL dans la plupart des contextes).</p>' },
                { question: 'Combien de cuillères à café y a-t-il dans une cuillère à soupe ?', answer: '<p>Il y a exactement 3 cuillères à café américaines dans 1 cuillère à soupe américaine.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-cucchiaini-a-millilitri',
            title: 'Calcolatore da Cucchiaini a Millilitri',
            h1: 'Calcolatore da Cucchiaini a Millilitri',
            meta_title: 'Cucchiaini in Millilitri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti cucchiaini in millilitri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da cucchiaini statunitensi a millilitri (1 cucchiaino = 4,929 mL) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Cucchiaini in millilitri è essenziale per il dosaggio di farmaci e piccole misure culinarie come spezie o estratti.</p><p>Questo strumento va oltre il cucchiaino statunitense: i menu a tendina "Da" e "A" coprono anche il cucchiaino canadese e imperiale.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 cucchiaino statunitense = 4,9289 millilitri (spesso arrotondato a 5 mL per il dosaggio).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Nota di sicurezza sui farmaci:</b> un cucchiaino da cucina non è uno strumento di dosaggio medico preciso — usa sempre il dispositivo dosatore fornito.',
            ],
            howto: [
                { question: 'Quanti millilitri ci sono in un cucchiaino?', answer: '<p>1 cucchiaino statunitense equivale a circa 4,929 millilitri (arrotondato a 5 mL nella maggior parte dei contesti).</p>' },
                { question: 'Quanti cucchiaini ci sono in un cucchiaio?', answer: '<p>Ci sono esattamente 3 cucchiaini statunitensi in 1 cucchiaio statunitense.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'teeloeffel-in-milliliter-rechner',
            title: 'Teelöffel in Milliliter Rechner',
            h1: 'Teelöffel in Milliliter Rechner',
            meta_title: 'Teelöffel in Milliliter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Teelöffel sofort in Milliliter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Teelöffeln in Milliliter um (1 Teelöffel = 4,929 mL) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Teelöffel in Milliliter ist unerlässlich für die Medikamentendosierung und kleine Kochmengen wie Gewürze oder Extrakte.</p><p>Dieses Tool geht über den US-Teelöffel hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch den kanadischen und imperialen Teelöffel ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Teelöffel = 4,9289 Milliliter (für Dosierungszwecke oft auf 5 mL gerundet).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Hinweis zur Medikamentensicherheit:</b> ein Küchenteelöffel ist kein präzises medizinisches Dosierwerkzeug — verwenden Sie für Medikamente immer das mitgelieferte Dosiergerät.',
            ],
            howto: [
                { question: 'Wie viele Milliliter sind in einem Teelöffel?', answer: '<p>1 US-Teelöffel entspricht etwa 4,929 Millilitern (in den meisten Kontexten auf 5 mL gerundet).</p>' },
                { question: 'Wie viele Teelöffel sind in einem Esslöffel?', answer: '<p>In 1 US-Esslöffel sind genau 3 Teelöffel.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 3),
        },
    },
}

// ============================================================
// 1087: Quarts to Liters Converter
// ============================================================
const quartsToLiters: ToolDef = {
    id: '1087',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'quart_us_fluid' },
            { key: 'to_unit', default: 'liter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'quarts-to-liters-converter',
            title: 'Quarts to Liters Converter',
            h1: 'Quarts to Liters Converter',
            meta_title: 'Quarts to Liters Converter | Convert Any Volume Unit',
            meta_description: 'Convert quarts to liters instantly, or switch to any of 40+ volume units — gallons, pints, cups, milliliters, and more.',
            short_answer: 'This converter changes a volume value from U.S. fluid quarts to liters (1 quart = 0.9464 liters) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Quarts to liters comes up for motor oil, food storage containers, and beverage sizes sold in quarts in the US market that need a metric equivalent.</p><p>This tool goes beyond the US fluid quart: the "From" and "To" dropdowns also cover the US dry quart and Imperial quart (both different sizes) plus the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. fluid quart = exactly 0.946352946 liters (¼ of a US fluid gallon).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Three quart sizes:</b> U.S. fluid (0.9464 L), U.S. dry (1.1012 L), and Imperial (1.1365 L) quarts are all different — select the right one for your context.',
            ],
            howto: [
                { question: 'How many liters are in a quart?', answer: '<p>1 U.S. fluid quart equals exactly 0.946352946 liters. To convert, multiply the quart value by 0.946353.</p>' },
                { question: 'How many quarts are in a gallon?', answer: '<p>There are exactly 4 U.S. fluid quarts in 1 U.S. fluid gallon.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-kvarty-v-litry',
            title: 'Конвертер кварт в литры',
            h1: 'Конвертер кварт в литры',
            meta_title: 'Кварты в литры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте кварты в литры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из американских жидкостных кварт в литры (1 кварта = 0,9464 литра) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Кварты в литры нужны для моторного масла, контейнеров для хранения еды и напитков, продаваемых в квартах на американском рынке.</p><p>Этот инструмент выходит за рамки американской жидкостной кварты: списки "Из" и "В" также охватывают американскую сыпучую и имперскую кварту.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американская жидкостная кварта = ровно 0,946352946 литра (¼ американского галлона).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Три размера кварты:</b> американская жидкостная (0,9464 л), американская сыпучая (1,1012 л) и имперская (1,1365 л) — все разные.',
            ],
            howto: [
                { question: 'Сколько литров в кварте?', answer: '<p>1 американская жидкостная кварта равна ровно 0,946352946 литра.</p>' },
                { question: 'Сколько кварт в галлоне?', answer: '<p>В 1 американском жидкостном галлоне ровно 4 кварты.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'kvartu-uz-litriem-kalkulators',
            title: 'Kvartu uz Litriem Kalkulators',
            h1: 'Kvartu uz Litriem Kalkulators',
            meta_title: 'Kvartas uz Litriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kvartas uz litriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV šķidruma kvartām uz litriem (1 kvarta = 0,9464 litri) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Kvartas uz litriem nepieciešamas motoreļļai, pārtikas uzglabāšanas traukiem un dzērieniem, ko pārdod kvartās ASV tirgū.</p><p>Šis rīks sniedzas tālāk par ASV šķidruma kvartu: saraksti "No" un "Uz" aptver arī ASV birstošo un Imperiālo kvartu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV šķidruma kvarta = tieši 0,946352946 litri (¼ no ASV galona).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Trīs kvartu izmēri:</b> ASV šķidruma (0,9464 L), ASV birstošā (1,1012 L) un Imperiālā (1,1365 L) kvartas ir visas atšķirīgas.',
            ],
            howto: [
                { question: 'Cik litru ir kvartā?', answer: '<p>1 ASV šķidruma kvarta ir tieši 0,946352946 litri.</p>' },
                { question: 'Cik kvartu ir galonā?', answer: '<p>1 ASV šķidruma galonā ir tieši 4 kvartas.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-kwart-na-litry',
            title: 'Kalkulator Kwart na Litry',
            h1: 'Kalkulator Kwart na Litry',
            meta_title: 'Kwarty na Litry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz kwarty na litry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z amerykańskich kwart płynnych na litry (1 kwarta = 0,9464 litra) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Kwarty na litry są przydatne dla oleju silnikowego, pojemników do przechowywania żywności i napojów sprzedawanych w kwartach na rynku amerykańskim.</p><p>To narzędzie wykracza poza amerykańską kwartę płynną: listy "Z" i "Do" obejmują także amerykańską kwartę suchą i imperialną.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykańska kwarta płynna = dokładnie 0,946352946 litra (¼ galonu amerykańskiego).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Trzy rozmiary kwarty:</b> amerykańska płynna (0,9464 L), amerykańska sucha (1,1012 L) i imperialna (1,1365 L) są różne.',
            ],
            howto: [
                { question: 'Ile litrów jest w kwarcie?', answer: '<p>1 amerykańska kwarta płynna to dokładnie 0,946352946 litra.</p>' },
                { question: 'Ile kwart jest w galonie?', answer: '<p>W 1 amerykańskim galonie płynnym są dokładnie 4 kwarty.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-cuartos-a-litros',
            title: 'Calculadora de Cuartos a Litros',
            h1: 'Calculadora de Cuartos a Litros',
            meta_title: 'Cuartos a Litros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte cuartos a litros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de cuartos líquidos estadounidenses a litros (1 cuarto = 0,9464 litros) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Cuartos a litros surge para el aceite de motor, los contenedores de almacenamiento de alimentos y las bebidas vendidas en cuartos en el mercado estadounidense.</p><p>Esta herramienta va más allá del cuarto líquido estadounidense: los menús desplegables "De" y "A" también cubren el cuarto seco estadounidense y el imperial.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 cuarto líquido estadounidense = exactamente 0,946352946 litros (¼ de un galón estadounidense).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Tres tamaños de cuarto:</b> el líquido estadounidense (0,9464 L), el seco estadounidense (1,1012 L) y el imperial (1,1365 L) son todos diferentes.',
            ],
            howto: [
                { question: '¿Cuántos litros hay en un cuarto?', answer: '<p>1 cuarto líquido estadounidense equivale exactamente a 0,946352946 litros.</p>' },
                { question: '¿Cuántos cuartos hay en un galón?', answer: '<p>Hay exactamente 4 cuartos líquidos estadounidenses en 1 galón líquido estadounidense.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-quarts-en-litres',
            title: 'Calculateur de Quarts en Litres',
            h1: 'Calculateur de Quarts en Litres',
            meta_title: 'Quarts en Litres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des quarts en litres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de quarts liquides américains en litres (1 quart = 0,9464 litre) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Quarts en litres est utile pour l’huile moteur, les contenants de stockage alimentaire et les boissons vendues en quarts sur le marché américain.</p><p>Cet outil va au-delà du quart liquide américain : les listes déroulantes « De » et « Vers » couvrent aussi le quart sec américain et le quart impérial.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 quart liquide américain = exactement 0,946352946 litre (¼ d’un gallon américain).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Trois tailles de quart :</b> le liquide américain (0,9464 L), le sec américain (1,1012 L) et l’impérial (1,1365 L) sont tous différents.',
            ],
            howto: [
                { question: 'Combien de litres y a-t-il dans un quart ?', answer: '<p>1 quart liquide américain équivaut exactement à 0,946352946 litre.</p>' },
                { question: 'Combien de quarts y a-t-il dans un gallon ?', answer: '<p>Il y a exactement 4 quarts liquides américains dans 1 gallon liquide américain.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-quarti-a-litri',
            title: 'Calcolatore da Quarti a Litri',
            h1: 'Calcolatore da Quarti a Litri',
            meta_title: 'Quarti in Litri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti quarti in litri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da quarti liquidi statunitensi a litri (1 quarto = 0,9464 litri) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Quarti in litri è utile per l’olio motore, i contenitori per la conservazione degli alimenti e le bevande vendute in quarti nel mercato statunitense.</p><p>Questo strumento va oltre il quarto liquido statunitense: i menu a tendina "Da" e "A" coprono anche il quarto secco statunitense e imperiale.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 quarto liquido statunitense = esattamente 0,946352946 litri (¼ di un gallone statunitense).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Tre dimensioni di quarto:</b> quello liquido statunitense (0,9464 L), secco statunitense (1,1012 L) e imperiale (1,1365 L) sono tutti diversi.',
            ],
            howto: [
                { question: 'Quanti litri ci sono in un quarto?', answer: '<p>1 quarto liquido statunitense equivale esattamente a 0,946352946 litri.</p>' },
                { question: 'Quanti quarti ci sono in un gallone?', answer: '<p>Ci sono esattamente 4 quarti liquidi statunitensi in 1 gallone liquido statunitense.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'quart-in-liter-rechner',
            title: 'Quart in Liter Rechner',
            h1: 'Quart in Liter Rechner',
            meta_title: 'Quart in Liter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Quart sofort in Liter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Flüssigquart in Liter um (1 Quart = 0,9464 Liter) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Quart in Liter kommt bei Motoröl, Lebensmittelaufbewahrungsbehältern und Getränken vor, die in Quart auf dem US-Markt verkauft werden.</p><p>Dieses Tool geht über das US-Flüssigquart hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch das US-Trockenquart und das imperiale Quart ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Flüssigquart = genau 0,946352946 Liter (¼ einer US-Gallone).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Drei Quart-Größen:</b> das US-Flüssig- (0,9464 L), US-Trocken- (1,1012 L) und imperiale (1,1365 L) Quart sind alle unterschiedlich.',
            ],
            howto: [
                { question: 'Wie viele Liter sind in einem Quart?', answer: '<p>1 US-Flüssigquart entspricht genau 0,946352946 Litern.</p>' },
                { question: 'Wie viele Quart sind in einer Gallone?', answer: '<p>In 1 US-Flüssiggallone sind genau 4 Quart.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1088: Pints to Liters Converter
// ============================================================
const pintsToLiters: ToolDef = {
    id: '1088',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'pint_us_fluid' },
            { key: 'to_unit', default: 'liter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'pints-to-liters-converter',
            title: 'Pints to Liters Converter',
            h1: 'Pints to Liters Converter',
            meta_title: 'Pints to Liters Converter | Convert Any Volume Unit',
            meta_description: 'Convert pints to liters instantly, or switch to any of 40+ volume units — quarts, gallons, cups, milliliters, and more.',
            short_answer: 'This converter changes a volume value from U.S. fluid pints to liters (1 pint = 0.4732 liters) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Pints to liters is a classic beer, milk, and ice cream conversion, since pints remain a common serving and packaging size in both the US and UK — though the two pints are different sizes.</p><p>This tool goes beyond the US fluid pint: the "From" and "To" dropdowns also cover the US dry pint and the notably larger Imperial (UK) pint plus the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. fluid pint = exactly 0.473176473 liters (½ of a US fluid quart).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>UK pints are bigger:</b> the Imperial pint (0.5683 L) is about 20% larger than the US fluid pint (0.4732 L) — a "pint of beer" means different amounts in the US versus the UK.',
            ],
            howto: [
                { question: 'How many liters are in a pint?', answer: '<p>1 U.S. fluid pint equals exactly 0.473176473 liters. To convert, multiply the pint value by 0.473176.</p>' },
                { question: 'Is a UK pint the same as a US pint?', answer: '<p>No — the Imperial (UK) pint is 0.56826125 liters, roughly 20% larger than the US fluid pint. Select "Pint (Imperial)" if your source is British.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-pinty-v-litry',
            title: 'Конвертер пинт в литры',
            h1: 'Конвертер пинт в литры',
            meta_title: 'Пинты в литры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте пинты в литры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из американских жидкостных пинт в литры (1 пинта = 0,4732 литра) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Пинты в литры — классическая конверсия для пива, молока и мороженого, так как пинты остаются распространённым размером порций и упаковки как в США, так и в Великобритании — хотя эти две пинты разного размера.</p><p>Этот инструмент выходит за рамки американской жидкостной пинты: списки "Из" и "В" также охватывают американскую сыпучую и заметно большую имперскую (британскую) пинту.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американская жидкостная пинта = ровно 0,473176473 литра (½ американской кварты).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Британские пинты больше:</b> имперская пинта (0,5683 л) примерно на 20% больше американской (0,4732 л).',
            ],
            howto: [
                { question: 'Сколько литров в пинте?', answer: '<p>1 американская жидкостная пинта равна ровно 0,473176473 литра.</p>' },
                { question: 'Британская пинта такая же, как американская?', answer: '<p>Нет — имперская (британская) пинта составляет 0,56826125 литра, примерно на 20% больше американской.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'pintu-uz-litriem-kalkulators',
            title: 'Pintu uz Litriem Kalkulators',
            h1: 'Pintu uz Litriem Kalkulators',
            meta_title: 'Pintes uz Litriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet pintes uz litriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV šķidruma pintēm uz litriem (1 pinte = 0,4732 litri) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Pintes uz litriem ir klasiska konversija alum, pienam un saldējumam, jo pintes joprojām ir izplatīts porciju un iepakojuma izmērs gan ASV, gan Lielbritānijā — lai gan šīs divas pintes ir dažāda izmēra.</p><p>Šis rīks sniedzas tālāk par ASV šķidruma pinti: saraksti "No" un "Uz" aptver arī ASV birstošo un ievērojami lielāko Imperiālo (Lielbritānijas) pinti.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV šķidruma pinte = tieši 0,473176473 litri (½ no ASV kvartas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Lielbritānijas pintes ir lielākas:</b> Imperiālā pinte (0,5683 L) ir apmēram par 20% lielāka nekā ASV pinte (0,4732 L).',
            ],
            howto: [
                { question: 'Cik litru ir pintē?', answer: '<p>1 ASV šķidruma pinte ir tieši 0,473176473 litri.</p>' },
                { question: 'Vai Lielbritānijas pinte ir tāda pati kā ASV pinte?', answer: '<p>Nē — Imperiālā (Lielbritānijas) pinte ir 0,56826125 litri, apmēram par 20% lielāka nekā ASV pinte.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-pint-na-litry',
            title: 'Kalkulator Pint na Litry',
            h1: 'Kalkulator Pint na Litry',
            meta_title: 'Pinty na Litry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz pinty na litry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z amerykańskich pint płynnych na litry (1 pinta = 0,4732 litra) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Pinty na litry to klasyczna konwersja dla piwa, mleka i lodów, ponieważ pinty pozostają popularnym rozmiarem porcji i opakowań zarówno w USA, jak i w Wielkiej Brytanii — choć te dwie pinty mają różne rozmiary.</p><p>To narzędzie wykracza poza amerykańską pintę płynną: listy "Z" i "Do" obejmują także amerykańską pintę suchą i znacznie większą imperialną (brytyjską).</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykańska pinta płynna = dokładnie 0,473176473 litra (½ amerykańskiej kwarty).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Brytyjskie pinty są większe:</b> pinta imperialna (0,5683 L) jest o około 20% większa niż amerykańska pinta płynna (0,4732 L).',
            ],
            howto: [
                { question: 'Ile litrów jest w piencie?', answer: '<p>1 amerykańska pinta płynna to dokładnie 0,473176473 litra.</p>' },
                { question: 'Czy brytyjska pinta to to samo co amerykańska?', answer: '<p>Nie — imperialna (brytyjska) pinta to 0,56826125 litra, około 20% więcej niż amerykańska.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-pintas-a-litros',
            title: 'Calculadora de Pintas a Litros',
            h1: 'Calculadora de Pintas a Litros',
            meta_title: 'Pintas a Litros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte pintas a litros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de pintas líquidas estadounidenses a litros (1 pinta = 0,4732 litros) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Pintas a litros es una conversión clásica para cerveza, leche y helado, ya que las pintas siguen siendo un tamaño común de porción y envasado tanto en EE. UU. como en el Reino Unido — aunque las dos pintas son de tamaños diferentes.</p><p>Esta herramienta va más allá de la pinta líquida estadounidense: los menús desplegables "De" y "A" también cubren la pinta seca estadounidense y la notablemente más grande pinta imperial (británica).</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 pinta líquida estadounidense = exactamente 0,473176473 litros (½ de un cuarto estadounidense).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Las pintas británicas son más grandes:</b> la pinta imperial (0,5683 L) es aproximadamente un 20% más grande que la pinta líquida estadounidense (0,4732 L).',
            ],
            howto: [
                { question: '¿Cuántos litros hay en una pinta?', answer: '<p>1 pinta líquida estadounidense equivale exactamente a 0,473176473 litros.</p>' },
                { question: '¿Es una pinta británica igual a una pinta estadounidense?', answer: '<p>No — la pinta imperial (británica) es de 0,56826125 litros, aproximadamente un 20% más grande que la estadounidense.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-pintes-en-litres',
            title: 'Calculateur de Pintes en Litres',
            h1: 'Calculateur de Pintes en Litres',
            meta_title: 'Pintes en Litres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des pintes en litres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de pintes liquides américaines en litres (1 pinte = 0,4732 litre) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Pintes en litres est une conversion classique pour la bière, le lait et la crème glacée, les pintes restant une taille de portion et d’emballage courante aux États-Unis comme au Royaume-Uni — bien que les deux pintes soient de tailles différentes.</p><p>Cet outil va au-delà de la pinte liquide américaine : les listes déroulantes « De » et « Vers » couvrent aussi la pinte sèche américaine et la pinte impériale (britannique), nettement plus grande.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 pinte liquide américaine = exactement 0,473176473 litre (½ d’un quart américain).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Les pintes britanniques sont plus grandes :</b> la pinte impériale (0,5683 L) est environ 20 % plus grande que la pinte liquide américaine (0,4732 L).',
            ],
            howto: [
                { question: 'Combien de litres y a-t-il dans une pinte ?', answer: '<p>1 pinte liquide américaine équivaut exactement à 0,473176473 litre.</p>' },
                { question: 'Une pinte britannique est-elle identique à une pinte américaine ?', answer: '<p>Non — la pinte impériale (britannique) est de 0,56826125 litre, environ 20 % plus grande que l’américaine.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-pinte-a-litri',
            title: 'Calcolatore da Pinte a Litri',
            h1: 'Calcolatore da Pinte a Litri',
            meta_title: 'Pinte in Litri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti pinte in litri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da pinte liquide statunitensi a litri (1 pinta = 0,4732 litri) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Pinte in litri è una conversione classica per birra, latte e gelato, poiché le pinte restano una dimensione comune di porzione e confezionamento sia negli USA che nel Regno Unito — anche se le due pinte hanno dimensioni diverse.</p><p>Questo strumento va oltre la pinta liquida statunitense: i menu a tendina "Da" e "A" coprono anche la pinta secca statunitense e la notevolmente più grande pinta imperiale (britannica).</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 pinta liquida statunitense = esattamente 0,473176473 litri (½ di un quarto statunitense).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Le pinte britanniche sono più grandi:</b> la pinta imperiale (0,5683 L) è circa il 20% più grande della pinta liquida statunitense (0,4732 L).',
            ],
            howto: [
                { question: 'Quanti litri ci sono in una pinta?', answer: '<p>1 pinta liquida statunitense equivale esattamente a 0,473176473 litri.</p>' },
                { question: 'Una pinta britannica è uguale a una pinta statunitense?', answer: '<p>No — la pinta imperiale (britannica) è di 0,56826125 litri, circa il 20% più grande di quella statunitense.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'pint-in-liter-rechner',
            title: 'Pint in Liter Rechner',
            h1: 'Pint in Liter Rechner',
            meta_title: 'Pint in Liter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Pint sofort in Liter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Flüssigpint in Liter um (1 Pint = 0,4732 Liter) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Pint in Liter ist eine klassische Umrechnung für Bier, Milch und Eis, da Pints sowohl in den USA als auch in Großbritannien eine gängige Portions- und Verpackungsgröße bleiben — obwohl die beiden Pints unterschiedlich groß sind.</p><p>Dieses Tool geht über das US-Flüssigpint hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch das US-Trockenpint und das deutlich größere imperiale (britische) Pint ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Flüssigpint = genau 0,473176473 Liter (½ eines US-Quart).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Britische Pints sind größer:</b> das imperiale Pint (0,5683 L) ist etwa 20% größer als das US-Flüssigpint (0,4732 L).',
            ],
            howto: [
                { question: 'Wie viele Liter sind in einem Pint?', answer: '<p>1 US-Flüssigpint entspricht genau 0,473176473 Litern.</p>' },
                { question: 'Ist ein UK-Pint dasselbe wie ein US-Pint?', answer: '<p>Nein — das imperiale (UK) Pint sind 0,56826125 Liter, etwa 20% größer als das US-Flüssigpint.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1089: Cubic Feet to Liters Converter
// ============================================================
const ft3ToLiters: ToolDef = {
    id: '1089',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'cubic_foot' },
            { key: 'to_unit', default: 'liter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'cubic-feet-to-liters-converter',
            title: 'Cubic Feet to Liters Converter',
            h1: 'Cubic Feet to Liters Converter',
            meta_title: 'Cubic Feet to Liters Converter | Convert Any Volume Unit',
            meta_description: 'Convert cubic feet to liters instantly, or switch to any of 40+ volume units — cubic meters, gallons, cubic yards, and more.',
            short_answer: 'This converter changes a volume value from cubic feet to liters (1 cubic foot = 28.3168 liters) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Cubic feet to liters comes up in refrigerator and freezer capacity specs, HVAC airflow calculations, and shipping container volumes, since cubic feet is still common in US product specifications while liters is the metric standard.</p><p>This tool goes beyond ft³ and liters: the "From" and "To" dropdowns cover the full range of volume units, including cubic meters, cubic yards, gallons, and specialized measures.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 cubic foot = 28.316846592 liters (defined from the exact foot = 0.3048 m).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Common use case:</b> converting a US appliance\'s cubic-feet capacity rating (e.g. a 20 cu ft refrigerator) into liters for an international spec sheet.',
            ],
            howto: [
                { question: 'How many liters are in a cubic foot?', answer: '<p>1 cubic foot equals approximately 28.3168 liters. To convert, multiply the cubic foot value by 28.316846592.</p>' },
                { question: 'How many gallons are in a cubic foot?', answer: '<p>1 cubic foot equals approximately 7.48 US gallons — select "Gallon (U.S. fluid)" as the "To" unit to get this conversion directly.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-kubicheskie-futy-v-litry',
            title: 'Конвертер кубических футов в литры',
            h1: 'Конвертер кубических футов в литры',
            meta_title: 'Кубические футы в литры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте кубические футы в литры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из кубических футов в литры (1 куб. фут = 28,3168 литра) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Кубические футы в литры нужны для спецификаций объёма холодильников и морозильников, расчётов воздушного потока в HVAC и объёмов транспортных контейнеров.</p><p>Этот инструмент выходит за рамки куб. футов и литров: списки "Из" и "В" охватывают полный диапазон единиц объёма.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 кубический фут = 28,316846592 литра (определяется из точного фута = 0,3048 м).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Частый случай использования:</b> конвертация ёмкости американского прибора в кубических футах (например, холодильник на 20 куб. футов) в литры.',
            ],
            howto: [
                { question: 'Сколько литров в кубическом футе?', answer: '<p>1 кубический фут равен примерно 28,3168 литра.</p>' },
                { question: 'Сколько галлонов в кубическом футе?', answer: '<p>1 кубический фут равен примерно 7,48 американского галлона.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'kubikpedu-uz-litriem-kalkulators',
            title: 'Kubikpēdu uz Litriem Kalkulators',
            h1: 'Kubikpēdu uz Litriem Kalkulators',
            meta_title: 'Kubikpēdas uz Litriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kubikpēdas uz litriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no kubikpēdām uz litriem (1 kubikpēda = 28,3168 litri) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Kubikpēdas uz litriem nepieciešamas ledusskapju un saldētavu tilpuma specifikācijās, HVAC gaisa plūsmas aprēķinos un kravu konteineru tilpumos.</p><p>Šis rīks sniedzas tālāk par ft³ un litriem: saraksti "No" un "Uz" aptver pilnu tilpuma vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kubikpēda = 28,316846592 litri (definēts no precīzas pēdas = 0,3048 m).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> ASV ierīces tilpuma kubikpēdās (piemēram, 20 kubikpēdu ledusskapja) konvertēšana litros.',
            ],
            howto: [
                { question: 'Cik litru ir kubikpēdā?', answer: '<p>1 kubikpēda ir aptuveni 28,3168 litri.</p>' },
                { question: 'Cik galonu ir kubikpēdā?', answer: '<p>1 kubikpēda ir aptuveni 7,48 ASV galoni.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-stop-szesciennych-na-litry',
            title: 'Kalkulator Stóp Sześciennych na Litry',
            h1: 'Kalkulator Stóp Sześciennych na Litry',
            meta_title: 'Stopy Sześcienne na Litry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz stopy sześcienne na litry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości ze stóp sześciennych na litry (1 stopa sześcienna = 28,3168 litra) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Stopy sześcienne na litry są przydatne w specyfikacjach pojemności lodówek i zamrażarek, obliczeniach przepływu powietrza HVAC i objętościach kontenerów transportowych.</p><p>To narzędzie wykracza poza ft³ i litry: listy "Z" i "Do" obejmują pełny zakres jednostek objętości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 stopa sześcienna = 28,316846592 litra (zdefiniowana z dokładnej stopy = 0,3048 m).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Częsty przypadek użycia:</b> przeliczanie pojemności amerykańskiego urządzenia w stopach sześciennych (np. lodówka 20 ft³) na litry.',
            ],
            howto: [
                { question: 'Ile litrów jest w stopie sześciennej?', answer: '<p>1 stopa sześcienna to około 28,3168 litra.</p>' },
                { question: 'Ile galonów jest w stopie sześciennej?', answer: '<p>1 stopa sześcienna to około 7,48 galona amerykańskiego.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-pies-cubicos-a-litros',
            title: 'Calculadora de Pies Cúbicos a Litros',
            h1: 'Calculadora de Pies Cúbicos a Litros',
            meta_title: 'Pies Cúbicos a Litros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte pies cúbicos a litros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de pies cúbicos a litros (1 pie cúbico = 28,3168 litros) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Pies cúbicos a litros surge en las especificaciones de capacidad de refrigeradores y congeladores, cálculos de flujo de aire HVAC y volúmenes de contenedores de envío.</p><p>Esta herramienta va más allá de ft³ y litros: los menús desplegables "De" y "A" cubren toda la gama de unidades de volumen.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 pie cúbico = 28,316846592 litros (definido a partir del pie exacto = 0,3048 m).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Caso de uso común:</b> convertir la capacidad de un electrodoméstico estadounidense en pies cúbicos (por ejemplo, un refrigerador de 20 pies³) a litros.',
            ],
            howto: [
                { question: '¿Cuántos litros hay en un pie cúbico?', answer: '<p>1 pie cúbico equivale aproximadamente a 28,3168 litros.</p>' },
                { question: '¿Cuántos galones hay en un pie cúbico?', answer: '<p>1 pie cúbico equivale aproximadamente a 7,48 galones estadounidenses.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-pieds-cubes-en-litres',
            title: 'Calculateur de Pieds Cubes en Litres',
            h1: 'Calculateur de Pieds Cubes en Litres',
            meta_title: 'Pieds Cubes en Litres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des pieds cubes en litres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de pieds cubes en litres (1 pied cube = 28,3168 litres) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Pieds cubes en litres revient dans les spécifications de capacité des réfrigérateurs et congélateurs, les calculs de débit d’air HVAC et les volumes de conteneurs d’expédition.</p><p>Cet outil va au-delà des ft³ et des litres : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de volume.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 pied cube = 28,316846592 litres (défini à partir du pied exact = 0,3048 m).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Cas d’usage courant :</b> convertir la capacité en pieds cubes d’un appareil américain (par ex. un réfrigérateur de 20 pi³) en litres.',
            ],
            howto: [
                { question: 'Combien de litres y a-t-il dans un pied cube ?', answer: '<p>1 pied cube équivaut à environ 28,3168 litres.</p>' },
                { question: 'Combien de gallons y a-t-il dans un pied cube ?', answer: '<p>1 pied cube équivaut à environ 7,48 gallons américains.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-piedi-cubi-a-litri',
            title: 'Calcolatore da Piedi Cubi a Litri',
            h1: 'Calcolatore da Piedi Cubi a Litri',
            meta_title: 'Piedi Cubi in Litri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti piedi cubi in litri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da piedi cubi a litri (1 piede cubo = 28,3168 litri) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Piedi cubi in litri è utile nelle specifiche di capacità di frigoriferi e congelatori, nei calcoli di flusso d’aria HVAC e nei volumi di container di spedizione.</p><p>Questo strumento va oltre ft³ e litri: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di volume.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 piede cubo = 28,316846592 litri (definito dal piede esatto = 0,3048 m).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Caso d’uso comune:</b> convertire la capacità di un elettrodomestico statunitense in piedi cubi (ad es. un frigorifero da 20 ft³) in litri.',
            ],
            howto: [
                { question: 'Quanti litri ci sono in un piede cubo?', answer: '<p>1 piede cubo equivale a circa 28,3168 litri.</p>' },
                { question: 'Quanti galloni ci sono in un piede cubo?', answer: '<p>1 piede cubo equivale a circa 7,48 galloni statunitensi.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'kubikfuss-in-liter-rechner',
            title: 'Kubikfuß in Liter Rechner',
            h1: 'Kubikfuß in Liter Rechner',
            meta_title: 'Kubikfuß in Liter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Kubikfuß sofort in Liter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von Kubikfuß in Liter um (1 Kubikfuß = 28,3168 Liter) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Kubikfuß in Liter kommt bei Kapazitätsangaben für Kühl- und Gefrierschränke, HVAC-Luftstromberechnungen und Frachtcontainer-Volumen vor.</p><p>Dieses Tool geht über ft³ und Liter hinaus: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Volumeneinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Kubikfuß = 28,316846592 Liter (definiert aus dem exakten Fuß = 0,3048 m).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung der Kubikfuß-Kapazität eines US-Geräts (z.B. ein 20-Kubikfuß-Kühlschrank) in Liter.',
            ],
            howto: [
                { question: 'Wie viele Liter sind in einem Kubikfuß?', answer: '<p>1 Kubikfuß entspricht etwa 28,3168 Litern.</p>' },
                { question: 'Wie viele Gallonen sind in einem Kubikfuß?', answer: '<p>1 Kubikfuß entspricht etwa 7,48 US-Gallonen.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1090: Cubic Meters to Liters Converter
// ============================================================
const m3ToLiters: ToolDef = {
    id: '1090',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'cubic_meter' },
            { key: 'to_unit', default: 'liter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'cubic-meters-to-liters-converter',
            title: 'Cubic Meters to Liters Converter',
            h1: 'Cubic Meters to Liters Converter',
            meta_title: 'Cubic Meters to Liters Converter | Convert Any Volume Unit',
            meta_description: 'Convert cubic meters to liters instantly, or switch to any of 40+ volume units — cubic feet, gallons, cubic yards, and more.',
            short_answer: 'This converter changes a volume value from cubic meters to liters (1 cubic meter = 1,000 liters exactly) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>Cubic meters to liters is a simple but essential conversion for water usage bills (often metered in m³), shipping and freight volume, and construction material quantities like concrete or gravel.</p><p>This tool goes beyond m³ and liters: the "From" and "To" dropdowns cover the full range of volume units, from milliliters up through cubic miles and specialized measures.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 cubic meter = exactly 1,000 liters, since both are SI-derived units (1 liter is defined as 1 cubic decimeter).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>No rounding needed:</b> unlike most conversions on this page, cubic meters to liters is an exact whole-number relationship — no approximation involved.',
            ],
            howto: [
                { question: 'How many liters are in a cubic meter?', answer: '<p>1 cubic meter equals exactly 1,000 liters. To convert, simply multiply the cubic meter value by 1,000.</p>' },
                { question: 'Why is my water bill measured in cubic meters?', answer: '<p>Water utilities in most metric countries meter usage in cubic meters because it\'s a convenient unit for large volumes — 1 m³ (1,000 liters) is roughly the daily water use of a small household.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 2),
        },
        ru: {
            slug: 'kalkulyator-kubicheskie-metry-v-litry',
            title: 'Конвертер кубических метров в литры',
            h1: 'Конвертер кубических метров в литры',
            meta_title: 'Кубические метры в литры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте кубические метры в литры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из кубических метров в литры (1 кубический метр = ровно 1000 литров) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Кубические метры в литры — простая, но важная конверсия для счетов за воду (часто измеряется в м³), объёмов грузоперевозок и количества строительных материалов, таких как бетон или гравий.</p><p>Этот инструмент выходит за рамки м³ и литров: списки "Из" и "В" охватывают полный диапазон единиц объёма.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 кубический метр = ровно 1000 литров, так как оба являются производными единицами СИ.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Округление не требуется:</b> в отличие от большинства конверсий на этой странице, кубометры в литры — точное целочисленное отношение.',
            ],
            howto: [
                { question: 'Сколько литров в кубическом метре?', answer: '<p>1 кубический метр равен ровно 1000 литров.</p>' },
                { question: 'Почему счёт за воду измеряется в кубометрах?', answer: '<p>Коммунальные службы в большинстве метрических стран измеряют потребление воды в кубометрах, так как это удобная единица для больших объёмов.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 2),
        },
        lv: {
            slug: 'kubikmetru-uz-litriem-kalkulators',
            title: 'Kubikmetru uz Litriem Kalkulators',
            h1: 'Kubikmetru uz Litriem Kalkulators',
            meta_title: 'Kubikmetri uz Litriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kubikmetrus uz litriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no kubikmetriem uz litriem (1 kubikmetrs = tieši 1000 litri) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Kubikmetri uz litriem ir vienkārša, bet svarīga konversija ūdens patēriņa rēķiniem (bieži mēra m³), kravu apjomam un būvmateriālu daudzumiem, piemēram, betonam vai grantij.</p><p>Šis rīks sniedzas tālāk par m³ un litriem: saraksti "No" un "Uz" aptver pilnu tilpuma vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kubikmetrs = tieši 1000 litri, jo abas ir SI atvasinātas vienības.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Nav nepieciešama noapaļošana:</b> atšķirībā no lielākās daļas konversiju šajā lapā, kubikmetri uz litriem ir precīza veselu skaitļu attiecība.',
            ],
            howto: [
                { question: 'Cik litru ir kubikmetrā?', answer: '<p>1 kubikmetrs ir tieši 1000 litri.</p>' },
                { question: 'Kāpēc mans ūdens rēķins tiek mērīts kubikmetros?', answer: '<p>Ūdensapgādes uzņēmumi lielākajā daļā metrisko valstu mēra patēriņu kubikmetros, jo tā ir ērta vienība lieliem apjomiem.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 2),
        },
        pl: {
            slug: 'kalkulator-metrow-szesciennych-na-litry',
            title: 'Kalkulator Metrów Sześciennych na Litry',
            h1: 'Kalkulator Metrów Sześciennych na Litry',
            meta_title: 'Metry Sześcienne na Litry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz metry sześcienne na litry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z metrów sześciennych na litry (1 metr sześcienny = dokładnie 1000 litrów) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Metry sześcienne na litry to prosta, ale istotna konwersja dla rachunków za wodę (często mierzonej w m³), objętości transportu i ilości materiałów budowlanych, takich jak beton czy żwir.</p><p>To narzędzie wykracza poza m³ i litry: listy "Z" i "Do" obejmują pełny zakres jednostek objętości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 metr sześcienny = dokładnie 1000 litrów, ponieważ oba są jednostkami pochodnymi SI.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Bez zaokrąglania:</b> w przeciwieństwie do większości konwersji na tej stronie, metry sześcienne na litry to dokładna relacja liczb całkowitych.',
            ],
            howto: [
                { question: 'Ile litrów jest w metrze sześciennym?', answer: '<p>1 metr sześcienny to dokładnie 1000 litrów.</p>' },
                { question: 'Dlaczego mój rachunek za wodę jest mierzony w metrach sześciennych?', answer: '<p>Przedsiębiorstwa wodociągowe w większości krajów metrycznych mierzą zużycie w metrach sześciennych, ponieważ to wygodna jednostka dla dużych objętości.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 2),
        },
        es: {
            slug: 'calculadora-de-metros-cubicos-a-litros',
            title: 'Calculadora de Metros Cúbicos a Litros',
            h1: 'Calculadora de Metros Cúbicos a Litros',
            meta_title: 'Metros Cúbicos a Litros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte metros cúbicos a litros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de metros cúbicos a litros (1 metro cúbico = exactamente 1000 litros) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>Metros cúbicos a litros es una conversión simple pero esencial para facturas de consumo de agua (a menudo medidas en m³), volumen de transporte y cantidades de materiales de construcción como hormigón o grava.</p><p>Esta herramienta va más allá de m³ y litros: los menús desplegables "De" y "A" cubren toda la gama de unidades de volumen.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 metro cúbico = exactamente 1000 litros, ya que ambas son unidades derivadas del SI.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>No requiere redondeo:</b> a diferencia de la mayoría de conversiones en esta página, metros cúbicos a litros es una relación numérica exacta.',
            ],
            howto: [
                { question: '¿Cuántos litros hay en un metro cúbico?', answer: '<p>1 metro cúbico son exactamente 1000 litros.</p>' },
                { question: '¿Por qué mi factura de agua se mide en metros cúbicos?', answer: '<p>Las empresas de agua en la mayoría de países métricos miden el consumo en metros cúbicos porque es una unidad conveniente para grandes volúmenes.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 2),
        },
        fr: {
            slug: 'calculateur-de-metres-cubes-en-litres',
            title: 'Calculateur de Mètres Cubes en Litres',
            h1: 'Calculateur de Mètres Cubes en Litres',
            meta_title: 'Mètres Cubes en Litres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des mètres cubes en litres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de mètres cubes en litres (1 mètre cube = exactement 1000 litres) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Mètres cubes en litres est une conversion simple mais essentielle pour les factures d’eau (souvent mesurées en m³), le volume de fret et les quantités de matériaux de construction comme le béton ou le gravier.</p><p>Cet outil va au-delà des m³ et des litres : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de volume.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 mètre cube = exactement 1000 litres, les deux étant des unités dérivées du SI.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Aucun arrondi nécessaire :</b> contrairement à la plupart des conversions sur cette page, mètres cubes en litres est une relation exacte en nombres entiers.',
            ],
            howto: [
                { question: 'Combien de litres y a-t-il dans un mètre cube ?', answer: '<p>1 mètre cube équivaut exactement à 1000 litres.</p>' },
                { question: 'Pourquoi ma facture d’eau est-elle mesurée en mètres cubes ?', answer: '<p>Les compagnies des eaux dans la plupart des pays métriques mesurent la consommation en mètres cubes car c’est une unité pratique pour les grands volumes.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 2),
        },
        it: {
            slug: 'calcolatore-da-metri-cubi-a-litri',
            title: 'Calcolatore da Metri Cubi a Litri',
            h1: 'Calcolatore da Metri Cubi a Litri',
            meta_title: 'Metri Cubi in Litri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti metri cubi in litri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da metri cubi a litri (1 metro cubo = esattamente 1000 litri) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Metri cubi in litri è una conversione semplice ma essenziale per le bollette dell’acqua (spesso misurate in m³), il volume di trasporto merci e le quantità di materiali edili come cemento o ghiaia.</p><p>Questo strumento va oltre m³ e litri: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di volume.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 metro cubo = esattamente 1000 litri, poiché entrambe sono unità derivate del SI.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Nessun arrotondamento necessario:</b> a differenza della maggior parte delle conversioni in questa pagina, metri cubi in litri è una relazione numerica esatta.',
            ],
            howto: [
                { question: 'Quanti litri ci sono in un metro cubo?', answer: '<p>1 metro cubo equivale esattamente a 1000 litri.</p>' },
                { question: 'Perché la mia bolletta dell’acqua è misurata in metri cubi?', answer: '<p>Le aziende idriche nella maggior parte dei paesi metrici misurano il consumo in metri cubi perché è un’unità comoda per grandi volumi.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 2),
        },
        de: {
            slug: 'kubikmeter-in-liter-rechner',
            title: 'Kubikmeter in Liter Rechner',
            h1: 'Kubikmeter in Liter Rechner',
            meta_title: 'Kubikmeter in Liter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Kubikmeter sofort in Liter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von Kubikmetern in Liter um (1 Kubikmeter = genau 1000 Liter) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Kubikmeter in Liter ist eine einfache, aber wesentliche Umrechnung für Wasserrechnungen (oft in m³ gemessen), Frachtvolumen und Mengen von Baumaterialien wie Beton oder Kies.</p><p>Dieses Tool geht über m³ und Liter hinaus: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Volumeneinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Kubikmeter = genau 1000 Liter, da beide von SI-Einheiten abgeleitet sind.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Keine Rundung nötig:</b> im Gegensatz zu den meisten Umrechnungen auf dieser Seite ist Kubikmeter zu Liter ein exaktes Verhältnis ganzer Zahlen.',
            ],
            howto: [
                { question: 'Wie viele Liter sind in einem Kubikmeter?', answer: '<p>1 Kubikmeter sind genau 1000 Liter.</p>' },
                { question: 'Warum wird meine Wasserrechnung in Kubikmetern gemessen?', answer: '<p>Wasserversorger in den meisten metrischen Ländern messen den Verbrauch in Kubikmetern, da es eine praktische Einheit für große Volumina ist.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 2),
        },
    },
}

// ============================================================
// 1091: Barrels (Petroleum) to Gallons Converter
// ============================================================
const barrelPetroleumToGallons: ToolDef = {
    id: '1091',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'barrel_petroleum' },
            { key: 'to_unit', default: 'gallon_us_fluid' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'barrels-petroleum-to-gallons-converter',
            title: 'Barrels (Petroleum) to Gallons Converter',
            h1: 'Barrels (Petroleum) to Gallons Converter',
            meta_title: 'Oil Barrels to Gallons Converter | Convert Any Volume Unit',
            meta_description: 'Convert petroleum barrels to gallons instantly, or switch to any of 40+ volume units — liters, cubic meters, and more.',
            short_answer: 'This converter changes a volume value from petroleum barrels to U.S. fluid gallons (1 barrel = 42 gallons exactly) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>The petroleum barrel is the standard unit for pricing and trading crude oil worldwide (as in "$80 a barrel" oil prices), even though it isn\'t used for retail fuel sales, which are priced per gallon or liter.</p><p>This tool goes beyond the petroleum barrel: the "From" and "To" dropdowns also cover the distinct Imperial barrel, U.S. fluid/dry barrels, and the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 petroleum barrel = exactly 42 U.S. fluid gallons (158.987 liters) — this specific 42-gallon definition is unique to the oil industry.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>Not the same as other barrels:</b> the petroleum barrel, Imperial barrel (36 imperial gallons), and U.S. fluid barrel (31.5 gallons, used for other liquids) are three genuinely different sizes sharing the word "barrel."',
            ],
            howto: [
                { question: 'How many gallons are in a barrel of oil?', answer: '<p>1 petroleum barrel equals exactly 42 U.S. gallons. This 42-gallon standard was set in the early Pennsylvania oil industry and has been the global oil-trading standard ever since.</p>' },
                { question: 'Why don\'t gas stations sell fuel by the barrel?', answer: '<p>The barrel is a wholesale/trading unit for crude oil; refined products like gasoline are sold to consumers by the gallon (US) or liter (most other countries) at a much smaller retail scale.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 2),
        },
        ru: {
            slug: 'kalkulyator-barreli-nefti-v-galony',
            title: 'Конвертер нефтяных баррелей в галлоны',
            h1: 'Конвертер нефтяных баррелей в галлоны',
            meta_title: 'Баррели нефти в галлоны | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте нефтяные баррели в галлоны мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из нефтяных баррелей в американские галлоны (1 баррель = ровно 42 галлона) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Нефтяной баррель — стандартная единица для ценообразования и торговли сырой нефтью во всём мире (как в "$80 за баррель"), хотя он не используется для розничной продажи топлива, которая оценивается за галлон или литр.</p><p>Этот инструмент выходит за рамки нефтяного барреля: списки "Из" и "В" также охватывают отдельный имперский баррель, американские жидкостный/сыпучий баррели.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 нефтяной баррель = ровно 42 американских галлона (158,987 литра) — это специфическое определение уникально для нефтяной отрасли.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Не то же самое, что другие баррели:</b> нефтяной баррель, имперский баррель (36 имперских галлонов) и американский жидкостный баррель (31,5 галлона) — три действительно разных размера.',
            ],
            howto: [
                { question: 'Сколько галлонов в барреле нефти?', answer: '<p>1 нефтяной баррель равен ровно 42 американским галлонам. Этот стандарт в 42 галлона был установлен в ранней нефтяной отрасли Пенсильвании.</p>' },
                { question: 'Почему заправки не продают топливо баррелями?', answer: '<p>Баррель — это оптовая/торговая единица для сырой нефти; переработанные продукты, такие как бензин, продаются потребителям за галлон или литр.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 2),
        },
        lv: {
            slug: 'naftas-mucu-uz-galoniem-kalkulators',
            title: 'Naftas Mucu uz Galoniem Kalkulators',
            h1: 'Naftas Mucu uz Galoniem Kalkulators',
            meta_title: 'Naftas Mucas uz Galoniem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet naftas mucas uz galoniem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no naftas mucām uz ASV galoniem (1 muca = tieši 42 galoni) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Naftas muca ir standarta vienība jēlnaftas cenošanai un tirdzniecībai visā pasaulē, lai gan tā netiek izmantota degvielas mazumtirdzniecībai, kas tiek vērtēta par galonu vai litru.</p><p>Šis rīks sniedzas tālāk par naftas mucu: saraksti "No" un "Uz" aptver arī atsevišķu Imperiālo mucu, ASV šķidruma/birstošo mucu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 naftas muca = tieši 42 ASV galoni (158,987 litri) — šī specifiskā 42 galonu definīcija ir unikāla naftas nozarei.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>Nav tas pats, kas citas mucas:</b> naftas muca, Imperiālā muca (36 imperiālie galoni) un ASV šķidruma muca (31,5 galoni) ir trīs patiešām atšķirīgi izmēri.',
            ],
            howto: [
                { question: 'Cik galonu ir naftas mucā?', answer: '<p>1 naftas muca ir tieši 42 ASV galoni. Šis 42 galonu standarts tika noteikts agrīnajā Pensilvānijas naftas nozarē.</p>' },
                { question: 'Kāpēc degvielas uzpildes stacijas nepārdod degvielu mucās?', answer: '<p>Muca ir vairumtirdzniecības/tirdzniecības vienība jēlnaftai; pārstrādātie produkti, piemēram, benzīns, tiek pārdoti patērētājiem par galonu vai litru.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 2),
        },
        pl: {
            slug: 'kalkulator-barylek-ropy-na-galony',
            title: 'Kalkulator Baryłek Ropy na Galony',
            h1: 'Kalkulator Baryłek Ropy na Galony',
            meta_title: 'Baryłki Ropy na Galony | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz baryłki ropy na galony natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z baryłek ropy naftowej na galony amerykańskie (1 baryłka = dokładnie 42 galony) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Baryłka ropy naftowej to standardowa jednostka wyceny i handlu ropą naftową na całym świecie, choć nie jest używana do detalicznej sprzedaży paliwa, wycenianej za galon lub litr.</p><p>To narzędzie wykracza poza baryłkę ropy: listy "Z" i "Do" obejmują także odrębną baryłkę imperialną, amerykańskie baryłki płynne/suche.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 baryłka ropy = dokładnie 42 galony amerykańskie (158,987 litra) — ta specyficzna definicja jest unikalna dla przemysłu naftowego.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>To nie to samo, co inne baryłki:</b> baryłka ropy, baryłka imperialna (36 galonów imperialnych) i amerykańska baryłka płynna (31,5 galona) to trzy naprawdę różne rozmiary.',
            ],
            howto: [
                { question: 'Ile galonów jest w baryłce ropy?', answer: '<p>1 baryłka ropy to dokładnie 42 galony amerykańskie. Ten standard 42 galonów został ustalony we wczesnym przemyśle naftowym Pensylwanii.</p>' },
                { question: 'Dlaczego stacje benzynowe nie sprzedają paliwa baryłkami?', answer: '<p>Baryłka to jednostka hurtowa/handlowa dla ropy naftowej; produkty rafinowane, takie jak benzyna, są sprzedawane konsumentom za galon lub litr.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 2),
        },
        es: {
            slug: 'calculadora-de-barriles-de-petroleo-a-galones',
            title: 'Calculadora de Barriles de Petróleo a Galones',
            h1: 'Calculadora de Barriles de Petróleo a Galones',
            meta_title: 'Barriles de Petróleo a Galones | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte barriles de petróleo a galones al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de barriles de petróleo a galones estadounidenses (1 barril = exactamente 42 galones) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>El barril de petróleo es la unidad estándar para la fijación de precios y el comercio de petróleo crudo en todo el mundo, aunque no se usa para la venta minorista de combustible, que se cotiza por galón o litro.</p><p>Esta herramienta va más allá del barril de petróleo: los menús desplegables "De" y "A" también cubren el barril imperial y los barriles líquido/seco estadounidenses.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 barril de petróleo = exactamente 42 galones estadounidenses (158,987 litros) — esta definición específica de 42 galones es exclusiva de la industria petrolera.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>No es lo mismo que otros barriles:</b> el barril de petróleo, el barril imperial (36 galones imperiales) y el barril líquido estadounidense (31,5 galones) son tres tamaños genuinamente diferentes.',
            ],
            howto: [
                { question: '¿Cuántos galones hay en un barril de petróleo?', answer: '<p>1 barril de petróleo equivale exactamente a 42 galones estadounidenses. Este estándar de 42 galones se estableció en los primeros días de la industria petrolera de Pensilvania.</p>' },
                { question: '¿Por qué las gasolineras no venden combustible por barril?', answer: '<p>El barril es una unidad mayorista/comercial para el petróleo crudo; los productos refinados como la gasolina se venden a los consumidores por galón o litro.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 2),
        },
        fr: {
            slug: 'calculateur-de-barils-de-petrole-en-gallons',
            title: 'Calculateur de Barils de Pétrole en Gallons',
            h1: 'Calculateur de Barils de Pétrole en Gallons',
            meta_title: 'Barils de Pétrole en Gallons | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des barils de pétrole en gallons instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de barils de pétrole en gallons américains (1 baril = exactement 42 gallons) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Le baril de pétrole est l’unité standard pour la tarification et le commerce du pétrole brut dans le monde entier, bien qu’il ne soit pas utilisé pour la vente au détail de carburant, facturée au gallon ou au litre.</p><p>Cet outil va au-delà du baril de pétrole : les listes déroulantes « De » et « Vers » couvrent aussi le baril impérial distinct et les barils liquide/sec américains.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 baril de pétrole = exactement 42 gallons américains (158,987 litres) — cette définition spécifique de 42 gallons est propre à l’industrie pétrolière.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Différent des autres barils :</b> le baril de pétrole, le baril impérial (36 gallons impériaux) et le baril liquide américain (31,5 gallons) sont trois tailles véritablement différentes.',
            ],
            howto: [
                { question: 'Combien de gallons y a-t-il dans un baril de pétrole ?', answer: '<p>1 baril de pétrole équivaut exactement à 42 gallons américains. Cette norme de 42 gallons a été établie au début de l’industrie pétrolière de Pennsylvanie.</p>' },
                { question: 'Pourquoi les stations-service ne vendent-elles pas le carburant au baril ?', answer: '<p>Le baril est une unité de gros/commerciale pour le pétrole brut ; les produits raffinés comme l’essence sont vendus aux consommateurs au gallon ou au litre.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 2),
        },
        it: {
            slug: 'calcolatore-da-barili-di-petrolio-a-galloni',
            title: 'Calcolatore da Barili di Petrolio a Galloni',
            h1: 'Calcolatore da Barili di Petrolio a Galloni',
            meta_title: 'Barili di Petrolio in Galloni | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti barili di petrolio in galloni istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da barili di petrolio a galloni statunitensi (1 barile = esattamente 42 galloni) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Il barile di petrolio è l’unità standard per la determinazione del prezzo e il commercio del petrolio greggio in tutto il mondo, sebbene non venga usato per la vendita al dettaglio di carburante, prezzata per gallone o litro.</p><p>Questo strumento va oltre il barile di petrolio: i menu a tendina "Da" e "A" coprono anche il distinto barile imperiale e i barili liquido/secco statunitensi.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 barile di petrolio = esattamente 42 galloni statunitensi (158,987 litri) — questa definizione specifica di 42 galloni è unica per l’industria petrolifera.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>Non è lo stesso di altri barili:</b> il barile di petrolio, il barile imperiale (36 galloni imperiali) e il barile liquido statunitense (31,5 galloni) sono tre dimensioni realmente diverse.',
            ],
            howto: [
                { question: 'Quanti galloni ci sono in un barile di petrolio?', answer: '<p>1 barile di petrolio equivale esattamente a 42 galloni statunitensi. Questo standard di 42 galloni è stato stabilito nei primi anni dell’industria petrolifera della Pennsylvania.</p>' },
                { question: 'Perché le stazioni di servizio non vendono carburante a barili?', answer: '<p>Il barile è un’unità all’ingrosso/commerciale per il petrolio greggio; i prodotti raffinati come la benzina vengono venduti ai consumatori per gallone o litro.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 2),
        },
        de: {
            slug: 'erdoelfass-in-gallonen-rechner',
            title: 'Erdölfass in Gallonen Rechner',
            h1: 'Erdölfass in Gallonen Rechner',
            meta_title: 'Ölfässer in Gallonen | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie Erdölfässer sofort in Gallonen um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von Erdölfässern in US-Gallonen um (1 Fass = genau 42 Gallonen) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Das Erdölfass (Barrel) ist die Standardeinheit für die Preisgestaltung und den Handel mit Rohöl weltweit, auch wenn es nicht für den Einzelhandelsverkauf von Kraftstoff verwendet wird, der pro Gallone oder Liter berechnet wird.</p><p>Dieses Tool geht über das Erdölfass hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch das eigenständige imperiale Fass sowie US-Flüssig-/Trockenfässer ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Erdölfass = genau 42 US-Gallonen (158,987 Liter) — diese spezifische 42-Gallonen-Definition ist einzigartig für die Ölindustrie.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>Nicht dasselbe wie andere Fässer:</b> das Erdölfass, das imperiale Fass (36 imperiale Gallonen) und das US-Flüssigfass (31,5 Gallonen) sind drei tatsächlich unterschiedliche Größen.',
            ],
            howto: [
                { question: 'Wie viele Gallonen sind in einem Ölfass?', answer: '<p>1 Erdölfass entspricht genau 42 US-Gallonen. Dieser 42-Gallonen-Standard wurde in der frühen Ölindustrie Pennsylvanias festgelegt.</p>' },
                { question: 'Warum verkaufen Tankstellen Kraftstoff nicht fassweise?', answer: '<p>Das Fass ist eine Großhandels-/Handelseinheit für Rohöl; raffinierte Produkte wie Benzin werden Verbrauchern pro Gallone oder Liter verkauft.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 2),
        },
    },
}

// ============================================================
// 1092: Bushels (U.S.) to Liters Converter
// ============================================================
const bushelsToLiters: ToolDef = {
    id: '1092',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'bushel_us_dry' },
            { key: 'to_unit', default: 'liter' },
        ],
        functions: {
            result: { type: 'function', functionName: 'volumeConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'bushels-to-liters-converter',
            title: 'Bushels (U.S.) to Liters Converter',
            h1: 'Bushels (U.S.) to Liters Converter',
            meta_title: 'Bushels to Liters Converter | Convert Any Volume Unit',
            meta_description: 'Convert U.S. bushels to liters instantly, or switch to any of 40+ volume units — pecks, gallons, cubic feet, and more.',
            short_answer: 'This converter changes a volume value from U.S. bushels to liters (1 bushel = 35.239 liters) — and can convert between over 40 volume units using the selectors below.',
            intro_text: '<p>The bushel is a traditional dry-goods measure still used in US agriculture for pricing and trading grain, corn, wheat, and soybeans — a farmer or grain trader may need to convert bushels to liters or cubic meters when comparing to international harvest and shipping figures.</p><p>This tool goes beyond the US bushel: the "From" and "To" dropdowns also cover the distinct Imperial bushel and peck, plus the full range of other volume units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. (Winchester) bushel = 35.2390701686 liters (defined as 2,150.42 cubic inches).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 40+ supported volume units.',
                '<b>US and Imperial bushels differ:</b> the Imperial bushel (36.369 liters) is about 3% larger than the US bushel — always check which standard your grain figures are quoted in.',
            ],
            howto: [
                { question: 'How many liters are in a bushel?', answer: '<p>1 U.S. bushel equals approximately 35.239 liters. To convert, multiply the bushel value by 35.2390701686.</p>' },
                { question: 'Why is grain priced and measured in bushels instead of weight?', answer: '<p>Historically grain was measured by volume for practical trading reasons, though modern grain trading often converts bushel prices to weight-equivalent figures (e.g. bushels of corn have a standard assumed weight) for more precise comparisons.</p>' },
            ],
            inputs: volumeInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-busheli-v-litry',
            title: 'Конвертер бушелей (США) в литры',
            h1: 'Конвертер бушелей (США) в литры',
            meta_title: 'Бушели в литры | Конвертер любых единиц объёма',
            meta_description: 'Конвертируйте американские бушели в литры мгновенно, или переключитесь на любую из 40+ единиц объёма.',
            short_answer: 'Этот конвертер переводит значение объёма из американских бушелей в литры (1 бушель = 35,239 литра) — а также может конвертировать между более чем 40 единицами объёма.',
            intro_text: '<p>Бушель — традиционная мера сыпучих товаров, всё ещё используемая в сельском хозяйстве США для ценообразования и торговли зерном, кукурузой, пшеницей и соей.</p><p>Этот инструмент выходит за рамки американского бушеля: списки "Из" и "В" также охватывают отдельный имперский бушель и пек.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американский (винчестерский) бушель = 35,2390701686 литра (определяется как 2150,42 кубических дюйма).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 40 единиц объёма.',
                '<b>Американский и имперский бушели отличаются:</b> имперский бушель (36,369 литра) примерно на 3% больше американского.',
            ],
            howto: [
                { question: 'Сколько литров в бушеле?', answer: '<p>1 американский бушель равен примерно 35,239 литра.</p>' },
                { question: 'Почему зерно измеряется в бушелях, а не по весу?', answer: '<p>Исторически зерно измерялось по объёму по практическим причинам торговли, хотя современная торговля зерном часто переводит цены бушеля в весовые эквиваленты.</p>' },
            ],
            inputs: volumeInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'busela-uz-litriem-kalkulators',
            title: 'Bušeļa (ASV) uz Litriem Kalkulators',
            h1: 'Bušeļa (ASV) uz Litriem Kalkulators',
            meta_title: 'Bušeļi uz Litriem | Jebkuras Tilpuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet ASV bušeļus uz litriem acumirklī, vai pārslēdzieties uz jebkuru no 40+ tilpuma vienībām.',
            short_answer: 'Šis konvertētājs pārvērš tilpuma vērtību no ASV bušeļiem uz litriem (1 bušelis = 35,239 litri) — un var konvertēt starp vairāk nekā 40 tilpuma vienībām.',
            intro_text: '<p>Bušelis ir tradicionāls birstošu preču mērs, kas joprojām tiek izmantots ASV lauksaimniecībā graudu, kukurūzas, kviešu un sojas pupu cenošanai un tirdzniecībai.</p><p>Šis rīks sniedzas tālāk par ASV bušeli: saraksti "No" un "Uz" aptver arī atsevišķu Imperiālo bušeli un peku.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV (Vinčesteras) bušelis = 35,2390701686 litri (definēts kā 2150,42 kubikcollas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 40 tilpuma vienībām.',
                '<b>ASV un Imperiālais bušelis atšķiras:</b> Imperiālais bušelis (36,369 litri) ir apmēram par 3% lielāks nekā ASV bušelis.',
            ],
            howto: [
                { question: 'Cik litru ir bušelī?', answer: '<p>1 ASV bušelis ir aptuveni 35,239 litri.</p>' },
                { question: 'Kāpēc graudi tiek mēriti bušeļos, nevis pēc svara?', answer: '<p>Vēsturiski graudi tika mēriti pēc tilpuma praktisku tirdzniecības iemeslu dēļ, lai gan mūsdienu graudu tirdzniecība bieži pārvērš bušeļa cenas svara ekvivalentos.</p>' },
            ],
            inputs: volumeInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-buszli-na-litry',
            title: 'Kalkulator Buszli (USA) na Litry',
            h1: 'Kalkulator Buszli (USA) na Litry',
            meta_title: 'Buszle na Litry | Konwerter Dowolnej Jednostki Objętości',
            meta_description: 'Przelicz amerykańskie buszle na litry natychmiast lub przełącz się na dowolną z 40+ jednostek objętości.',
            short_answer: 'Ten konwerter zmienia wartość objętości z amerykańskich buszli na litry (1 buszel = 35,239 litra) — może też przeliczać między ponad 40 jednostkami objętości.',
            intro_text: '<p>Buszel to tradycyjna miara towarów sypkich, wciąż używana w rolnictwie USA do wyceny i handlu zbożem, kukurydzą, pszenicą i soją.</p><p>To narzędzie wykracza poza amerykański buszel: listy "Z" i "Do" obejmują także odrębny buszel imperialny i peck.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykański (Winchester) buszel = 35,2390701686 litra (zdefiniowany jako 2150,42 cali sześciennych).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 40 jednostek objętości.',
                '<b>Amerykański i imperialny buszel różnią się:</b> buszel imperialny (36,369 litra) jest o około 3% większy niż amerykański.',
            ],
            howto: [
                { question: 'Ile litrów jest w buszlu?', answer: '<p>1 amerykański buszel to około 35,239 litra.</p>' },
                { question: 'Dlaczego zboże jest wyceniane i mierzone w buszlach zamiast wagi?', answer: '<p>Historycznie zboże mierzono objętością ze względów praktycznych handlu, choć nowoczesny handel zbożem często przelicza ceny buszla na ekwiwalenty wagowe.</p>' },
            ],
            inputs: volumeInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-bushels-a-litros',
            title: 'Calculadora de Bushels (EE. UU.) a Litros',
            h1: 'Calculadora de Bushels (EE. UU.) a Litros',
            meta_title: 'Bushels a Litros | Convertidor de Cualquier Unidad de Volumen',
            meta_description: 'Convierte bushels estadounidenses a litros al instante, o cambia a cualquiera de más de 40 unidades de volumen.',
            short_answer: 'Esta calculadora cambia un valor de volumen de bushels estadounidenses a litros (1 bushel = 35,239 litros) — y puede convertir entre más de 40 unidades de volumen.',
            intro_text: '<p>El bushel es una medida tradicional de productos secos aún utilizada en la agricultura estadounidense para fijar precios y comerciar grano, maíz, trigo y soja.</p><p>Esta herramienta va más allá del bushel estadounidense: los menús desplegables "De" y "A" también cubren el bushel y el peck imperiales distintos.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 bushel estadounidense (Winchester) = 35,2390701686 litros (definido como 2150,42 pulgadas cúbicas).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 40 unidades de volumen.',
                '<b>Los bushels estadounidense e imperial difieren:</b> el bushel imperial (36,369 litros) es aproximadamente un 3% más grande que el estadounidense.',
            ],
            howto: [
                { question: '¿Cuántos litros hay en un bushel?', answer: '<p>1 bushel estadounidense equivale aproximadamente a 35,239 litros.</p>' },
                { question: '¿Por qué el grano se cotiza y mide en bushels en lugar de peso?', answer: '<p>Históricamente el grano se medía por volumen por razones prácticas de comercio, aunque el comercio moderno de granos suele convertir los precios por bushel a equivalentes de peso.</p>' },
            ],
            inputs: volumeInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-boisseaux-en-litres',
            title: 'Calculateur de Boisseaux (US) en Litres',
            h1: 'Calculateur de Boisseaux (US) en Litres',
            meta_title: 'Boisseaux en Litres | Convertisseur de Toute Unité de Volume',
            meta_description: 'Convertissez des boisseaux américains en litres instantanément, ou passez à l’une des 40+ unités de volume.',
            short_answer: 'Ce calculateur transforme une valeur de volume de boisseaux américains en litres (1 boisseau = 35,239 litres) — et peut convertir entre plus de 40 unités de volume.',
            intro_text: '<p>Le boisseau est une mesure traditionnelle de produits secs encore utilisée dans l’agriculture américaine pour la tarification et le commerce des céréales, du maïs, du blé et du soja.</p><p>Cet outil va au-delà du boisseau américain : les listes déroulantes « De » et « Vers » couvrent aussi le boisseau et le peck impériaux distincts.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 boisseau américain (Winchester) = 35,2390701686 litres (défini comme 2150,42 pouces cubes).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 40 unités de volume prises en charge.',
                '<b>Les boisseaux américain et impérial diffèrent :</b> le boisseau impérial (36,369 litres) est environ 3 % plus grand que l’américain.',
            ],
            howto: [
                { question: 'Combien de litres y a-t-il dans un boisseau ?', answer: '<p>1 boisseau américain équivaut à environ 35,239 litres.</p>' },
                { question: 'Pourquoi les céréales sont-elles tarifées et mesurées en boisseaux plutôt qu’en poids ?', answer: '<p>Historiquement, les céréales étaient mesurées en volume pour des raisons pratiques de commerce, bien que le commerce moderne des céréales convertisse souvent les prix au boisseau en équivalents de poids.</p>' },
            ],
            inputs: volumeInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-bushel-a-litri',
            title: 'Calcolatore da Bushel (USA) a Litri',
            h1: 'Calcolatore da Bushel (USA) a Litri',
            meta_title: 'Bushel in Litri | Convertitore di Qualsiasi Unità di Volume',
            meta_description: 'Converti bushel statunitensi in litri istantaneamente, o passa a una delle 40+ unità di volume.',
            short_answer: 'Questo convertitore trasforma un valore di volume da bushel statunitensi a litri (1 bushel = 35,239 litri) — e può convertire tra oltre 40 unità di volume.',
            intro_text: '<p>Il bushel è una misura tradizionale di prodotti secchi ancora usata nell’agricoltura statunitense per la determinazione del prezzo e il commercio di grano, mais, frumento e soia.</p><p>Questo strumento va oltre il bushel statunitense: i menu a tendina "Da" e "A" coprono anche il distinto bushel e peck imperiali.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 bushel statunitense (Winchester) = 35,2390701686 litri (definito come 2150,42 pollici cubi).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 40 unità di volume.',
                '<b>I bushel statunitense e imperiale differiscono:</b> il bushel imperiale (36,369 litri) è circa il 3% più grande di quello statunitense.',
            ],
            howto: [
                { question: 'Quanti litri ci sono in un bushel?', answer: '<p>1 bushel statunitense equivale a circa 35,239 litri.</p>' },
                { question: 'Perché il grano viene quotato e misurato in bushel invece che a peso?', answer: '<p>Storicamente il grano veniva misurato a volume per ragioni pratiche di commercio, anche se il commercio moderno del grano spesso converte i prezzi per bushel in equivalenti di peso.</p>' },
            ],
            inputs: volumeInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'bushel-in-liter-rechner',
            title: 'Bushel (US) in Liter Rechner',
            h1: 'Bushel (US) in Liter Rechner',
            meta_title: 'Bushel in Liter | Umrechner für Jede Volumeneinheit',
            meta_description: 'Rechnen Sie US-Bushel sofort in Liter um, oder wechseln Sie zu einer von 40+ Volumeneinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Volumenwert von US-Bushel in Liter um (1 Bushel = 35,239 Liter) — und kann zwischen über 40 Volumeneinheiten umrechnen.',
            intro_text: '<p>Der Bushel ist ein traditionelles Trockenmaß, das in der US-Landwirtschaft noch immer zur Preisgestaltung und zum Handel mit Getreide, Mais, Weizen und Sojabohnen verwendet wird.</p><p>Dieses Tool geht über den US-Bushel hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch den eigenständigen imperialen Bushel und Peck ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Bushel (Winchester) = 35,2390701686 Liter (definiert als 2150,42 Kubikzoll).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 40 unterstützten Volumeneinheiten umzurechnen.',
                '<b>US- und imperialer Bushel unterscheiden sich:</b> der imperiale Bushel (36,369 Liter) ist etwa 3% größer als der US-Bushel.',
            ],
            howto: [
                { question: 'Wie viele Liter sind in einem Bushel?', answer: '<p>1 US-Bushel entspricht etwa 35,239 Litern.</p>' },
                { question: 'Warum wird Getreide in Bushel statt nach Gewicht bepreist?', answer: '<p>Historisch wurde Getreide aus praktischen Handelsgründen nach Volumen gemessen, obwohl der moderne Getreidehandel Bushel-Preise oft in Gewichtsäquivalente umrechnet.</p>' },
            ],
            inputs: volumeInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1093: Grams to Ounces Converter
// ============================================================
const gramsToOunces: ToolDef = {
    id: '1093',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 100 },
            { key: 'from_unit', default: 'gram' },
            { key: 'to_unit', default: 'ounce_avdp' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'grams-to-ounces-converter',
            title: 'Grams to Ounces Converter',
            h1: 'Grams to Ounces Converter',
            meta_title: 'Grams to Ounces Converter | Convert Any Mass Unit',
            meta_description: 'Convert grams to ounces instantly, or switch to any of 25+ mass units — kilograms, pounds, carats, troy ounces, tons, and more.',
            short_answer: 'This converter changes a mass value from grams to (avoirdupois) ounces (1 gram = 0.035274 oz) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Grams to ounces is one of the most common mass conversions, needed constantly for food labels, postage weights, and recipe conversions when comparing metric packaging to US customary ounces.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of mass units — metric (milligrams through metric tons), avoirdupois (the everyday ounce/pound system), troy (used for precious metals), and specialized units (carats, stone, slugs, assay tons).</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 gram = 0.035274 avoirdupois ounces (and 1 ounce = exactly 28.349523125 grams).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Watch for "which ounce":</b> the everyday (avoirdupois) ounce and the troy ounce (used for gold and silver) are different sizes — a troy ounce is about 10% heavier than a regular ounce.',
            ],
            howto: [
                { question: 'How many ounces are in a gram?', answer: '<p>1 gram equals approximately 0.0353 ounces. To convert grams to ounces, multiply the gram value by 0.035274, or divide by 28.349523125.</p>' },
                { question: 'Is a troy ounce the same as a regular ounce?', answer: '<p>No — a troy ounce is 31.1035 grams, about 10% more than the standard avoirdupois ounce (28.3495 grams). Select "Ounce (troy)" if you\'re working with precious metals.</p>' },
            ],
            inputs: massInputs('en', '100'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-grammy-v-untsii',
            title: 'Конвертер граммов в унции',
            h1: 'Конвертер граммов в унции',
            meta_title: 'Граммы в унции | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте граммы в унции мгновенно, или переключитесь на любую из 25+ единиц массы — килограммы, фунты, караты, тройские унции, тонны.',
            short_answer: 'Этот конвертер переводит значение массы из граммов в унции (авердюпуа) (1 грамм = 0,035274 унции) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Граммы в унции — одна из самых распространённых конверсий массы, постоянно нужная для этикеток продуктов, почтовых весов и кулинарных конверсий при сравнении метрической упаковки с американскими унциями.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц массы — метрические, авердюпуа, тройские (для драгоценных металлов) и специализированные (караты, стоуны, слаги, ассай-тонны).</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 грамм = 0,035274 унции авердюпуа (а 1 унция = ровно 28,349523125 грамма).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Следите за тем, "какая унция":</b> обычная (авердюпуа) унция и тройская унция (для золота и серебра) — разного размера, тройская примерно на 10% тяжелее.',
            ],
            howto: [
                { question: 'Сколько унций в грамме?', answer: '<p>1 грамм равен примерно 0,0353 унции. Чтобы конвертировать, умножьте значение в граммах на 0,035274.</p>' },
                { question: 'Тройская унция такая же, как обычная?', answer: '<p>Нет — тройская унция составляет 31,1035 грамма, примерно на 10% больше стандартной унции авердюпуа (28,3495 грамма).</p>' },
            ],
            inputs: massInputs('ru', '100'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'gramu-uz-uncem-kalkulators',
            title: 'Gramu uz Uncēm Kalkulators',
            h1: 'Gramu uz Uncēm Kalkulators',
            meta_title: 'Grami uz Uncēm | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet gramus uz uncēm acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām — kilogramiem, mārciņām, karātiem, trojas uncēm, tonnām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no gramiem uz uncēm (avdp) (1 grams = 0,035274 unces) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Grami uz uncēm ir viena no visizplatītākajām masas konversijām, pastāvīgi nepieciešama pārtikas etiķetēm, pasta svariem un kulinārijas konversijām.</p><p>Šis rīks neaprobežojas ar vienu pāri: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu — metriskās, avdp, trojas (dārgmetāliem) un specializētās (karāti, stouni, slugi, analīzes tonnas).</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 grams = 0,035274 avdp unces (un 1 unce = tieši 28,349523125 grami).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Uzmanieties, "kura unce":</b> ikdienas (avdp) unce un trojas unce (zeltam un sudrabam) ir dažāda izmēra — trojas unce ir apmēram par 10% smagāka.',
            ],
            howto: [
                { question: 'Cik unču ir gramā?', answer: '<p>1 grams ir aptuveni 0,0353 unces. Lai konvertētu, reiziniet gramu vērtību ar 0,035274.</p>' },
                { question: 'Vai trojas unce ir tāda pati kā parasta unce?', answer: '<p>Nē — trojas unce ir 31,1035 grami, apmēram par 10% vairāk nekā standarta avdp unce (28,3495 grami).</p>' },
            ],
            inputs: massInputs('lv', '100'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-gramow-na-uncje',
            title: 'Kalkulator Gramów na Uncje',
            h1: 'Kalkulator Gramów na Uncje',
            meta_title: 'Gramy na Uncje | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz gramy na uncje natychmiast lub przełącz się na dowolną z 25+ jednostek masy — kilogramy, funty, karaty, uncje trojańskie, tony.',
            short_answer: 'Ten konwerter zmienia wartość masy z gramów na uncje (avdp) (1 gram = 0,035274 uncji) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Gramy na uncje to jedna z najczęstszych konwersji masy, potrzebna stale przy etykietach żywności, wagach pocztowych i przeliczaniu przepisów.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek masy — metryczne, avdp, trojańskie (dla metali szlachetnych) i specjalistyczne (karaty, stone, slugi, tony probiercze).</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 gram = 0,035274 uncji avdp (a 1 uncja = dokładnie 28,349523125 grama).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Uważaj, "która uncja":</b> zwykła (avdp) uncja i uncja trojańska (dla złota i srebra) mają różne rozmiary — trojańska jest o około 10% cięższa.',
            ],
            howto: [
                { question: 'Ile uncji jest w gramie?', answer: '<p>1 gram to około 0,0353 uncji. Aby przeliczyć, pomnóż wartość w gramach przez 0,035274.</p>' },
                { question: 'Czy uncja trojańska to to samo co zwykła?', answer: '<p>Nie — uncja trojańska to 31,1035 grama, około 10% więcej niż standardowa uncja avdp (28,3495 grama).</p>' },
            ],
            inputs: massInputs('pl', '100'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-gramos-a-onzas',
            title: 'Calculadora de Gramos a Onzas',
            h1: 'Calculadora de Gramos a Onzas',
            meta_title: 'Gramos a Onzas | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte gramos a onzas al instante, o cambia a cualquiera de más de 25 unidades de masa — kilogramos, libras, quilates, onzas troy, toneladas.',
            short_answer: 'Esta calculadora cambia un valor de masa de gramos a onzas (avoirdupois) (1 gramo = 0,035274 onzas) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Gramos a onzas es una de las conversiones de masa más comunes, necesaria constantemente para etiquetas de alimentos, pesos postales y conversiones de recetas.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa — métricas, avoirdupois, troy (metales preciosos) y especializadas (quilates, stone, slugs, toneladas de ensayo).</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 gramo = 0,035274 onzas avoirdupois (y 1 onza = exactamente 28,349523125 gramos).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Ten cuidado con "qué onza":</b> la onza cotidiana (avoirdupois) y la onza troy (oro y plata) son de tamaños diferentes — la troy es aproximadamente un 10% más pesada.',
            ],
            howto: [
                { question: '¿Cuántas onzas hay en un gramo?', answer: '<p>1 gramo equivale aproximadamente a 0,0353 onzas. Para convertir, multiplica el valor en gramos por 0,035274.</p>' },
                { question: '¿Es una onza troy igual a una onza normal?', answer: '<p>No — una onza troy son 31,1035 gramos, aproximadamente un 10% más que la onza avoirdupois estándar (28,3495 gramos).</p>' },
            ],
            inputs: massInputs('es', '100'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-grammes-en-onces',
            title: 'Calculateur de Grammes en Onces',
            h1: 'Calculateur de Grammes en Onces',
            meta_title: 'Grammes en Onces | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des grammes en onces instantanément, ou passez à l’une des 25+ unités de masse — kilogrammes, livres, carats, onces troy, tonnes.',
            short_answer: 'Ce calculateur transforme une valeur de masse de grammes en onces (avoirdupois) (1 gramme = 0,035274 once) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Grammes en onces est l’une des conversions de masse les plus courantes, nécessaire constamment pour les étiquettes alimentaires, les poids postaux et les conversions de recettes.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse — métriques, avoirdupois, troy (métaux précieux) et spécialisées (carats, stone, slugs, tonnes d’essai).</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 gramme = 0,035274 once avoirdupois (et 1 once = exactement 28,349523125 grammes).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Attention à « quelle once » :</b> l’once courante (avoirdupois) et l’once troy (or et argent) sont de tailles différentes — la troy est environ 10 % plus lourde.',
            ],
            howto: [
                { question: 'Combien d’onces y a-t-il dans un gramme ?', answer: '<p>1 gramme équivaut à environ 0,0353 once. Pour convertir, multipliez la valeur en grammes par 0,035274.</p>' },
                { question: 'Une once troy est-elle identique à une once normale ?', answer: '<p>Non — une once troy fait 31,1035 grammes, environ 10 % de plus que l’once avoirdupois standard (28,3495 grammes).</p>' },
            ],
            inputs: massInputs('fr', '100'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-grammi-a-once',
            title: 'Calcolatore da Grammi a Once',
            h1: 'Calcolatore da Grammi a Once',
            meta_title: 'Grammi in Once | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti grammi in once istantaneamente, o passa a una delle 25+ unità di massa — chilogrammi, libbre, carati, once troy, tonnellate.',
            short_answer: 'Questo convertitore trasforma un valore di massa da grammi a once (avoirdupois) (1 grammo = 0,035274 once) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Grammi in once è una delle conversioni di massa più comuni, necessaria costantemente per etichette alimentari, pesi postali e conversioni di ricette.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa — metriche, avoirdupois, troy (metalli preziosi) e specializzate (carati, stone, slug, tonnellate di saggio).</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 grammo = 0,035274 once avoirdupois (e 1 oncia = esattamente 28,349523125 grammi).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Attenzione a "quale oncia":</b> l’oncia comune (avoirdupois) e l’oncia troy (oro e argento) hanno dimensioni diverse — la troy è circa il 10% più pesante.',
            ],
            howto: [
                { question: 'Quante once ci sono in un grammo?', answer: '<p>1 grammo equivale a circa 0,0353 once. Per convertire, moltiplica il valore in grammi per 0,035274.</p>' },
                { question: 'Un’oncia troy è uguale a un’oncia normale?', answer: '<p>No — un’oncia troy sono 31,1035 grammi, circa il 10% in più rispetto all’oncia avoirdupois standard (28,3495 grammi).</p>' },
            ],
            inputs: massInputs('it', '100'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'gramm-in-unzen-rechner',
            title: 'Gramm in Unzen Rechner',
            h1: 'Gramm in Unzen Rechner',
            meta_title: 'Gramm in Unzen | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Gramm sofort in Unzen um, oder wechseln Sie zu einer von 25+ Masseeinheiten — Kilogramm, Pfund, Karat, Feinunzen, Tonnen.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von Gramm in (avoirdupois) Unzen um (1 Gramm = 0,035274 Unzen) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Gramm in Unzen ist eine der häufigsten Masseumrechnungen, ständig benötigt für Lebensmitteletiketten, Portogewichte und Rezeptumrechnungen.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab — metrisch, avoirdupois, Troy (Edelmetalle) und spezialisiert (Karat, Stone, Slug, Assay-Tonnen).</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Gramm = 0,035274 avoirdupois Unzen (und 1 Unze = genau 28,349523125 Gramm).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Achten Sie darauf, "welche Unze":</b> die alltägliche (avoirdupois) Unze und die Feinunze (Troy, für Gold und Silber) sind unterschiedlich groß — die Feinunze ist etwa 10% schwerer.',
            ],
            howto: [
                { question: 'Wie viele Unzen sind in einem Gramm?', answer: '<p>1 Gramm entspricht etwa 0,0353 Unzen. Um umzurechnen, multiplizieren Sie den Grammwert mit 0,035274.</p>' },
                { question: 'Ist eine Feinunze dasselbe wie eine normale Unze?', answer: '<p>Nein — eine Feinunze (Troy) sind 31,1035 Gramm, etwa 10% mehr als die Standard-Unze (28,3495 Gramm).</p>' },
            ],
            inputs: massInputs('de', '100'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1094: Kilograms to Pounds Converter
// ============================================================
const kgToLbs: ToolDef = {
    id: '1094',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'kilogram' },
            { key: 'to_unit', default: 'pound_avdp' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'kilograms-to-pounds-converter',
            title: 'Kilograms to Pounds Converter',
            h1: 'Kilograms to Pounds Converter',
            meta_title: 'Kilograms to Pounds Converter | Convert Any Mass Unit',
            meta_description: 'Convert kilograms to pounds instantly, or switch to any of 25+ mass units — ounces, stone, tons, grams, and more.',
            short_answer: 'This converter changes a mass value from kilograms to (avoirdupois) pounds (1 kg = 2.2046 lb) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Kilograms to pounds is needed constantly for body weight, luggage limits, and shipping weights when comparing metric measurements to the US and UK customary pound.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of mass units — metric, avoirdupois (everyday), troy (precious metals), and specialized units (stone, slugs, hundredweights, long/short tons).</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 kilogram = 2.20462 avoirdupois pounds (and 1 pound = exactly 0.45359237 kg, by international agreement).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Quick mental estimate:</b> for a rough conversion, double the kilogram figure and add about 10% (e.g. 70 kg × 2 = 140, +10% ≈ 154 lb, close to the exact 154.3 lb).',
            ],
            howto: [
                { question: 'How many pounds are in a kilogram?', answer: '<p>1 kilogram equals approximately 2.2046 pounds. To convert, multiply the kilogram value by 2.20462.</p>' },
                { question: 'Why is the pound defined in terms of the kilogram?', answer: '<p>Since 1959, the international avoirdupois pound has been legally defined as exactly 0.45359237 kilograms, making the kilogram the true base unit and the pound a derived one, even in countries that still use pounds day-to-day.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-kilogrammy-v-funty',
            title: 'Конвертер килограммов в фунты',
            h1: 'Конвертер килограммов в фунты',
            meta_title: 'Килограммы в фунты | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте килограммы в фунты мгновенно, или переключитесь на любую из 25+ единиц массы — унции, стоуны, тонны, граммы.',
            short_answer: 'Этот конвертер переводит значение массы из килограммов в фунты (авердюпуа) (1 кг = 2,2046 фунта) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Килограммы в фунты постоянно нужны для веса тела, лимитов багажа и веса при доставке при сравнении метрических измерений с американским и британским фунтом.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц массы.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 килограмм = 2,20462 фунта авердюпуа (а 1 фунт = ровно 0,45359237 кг, по международному соглашению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Быстрая оценка в уме:</b> для приблизительной конверсии удвойте значение в кг и добавьте около 10% (например, 70 кг × 2 = 140, +10% ≈ 154 фунта).',
            ],
            howto: [
                { question: 'Сколько фунтов в килограмме?', answer: '<p>1 килограмм равен примерно 2,2046 фунта. Чтобы конвертировать, умножьте значение в кг на 2,20462.</p>' },
                { question: 'Почему фунт определяется через килограмм?', answer: '<p>С 1959 года международный фунт авердюпуа юридически определён как ровно 0,45359237 килограмма.</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'kilogramu-uz-marcinam-kalkulators',
            title: 'Kilogramu uz Mārciņām Kalkulators',
            h1: 'Kilogramu uz Mārciņām Kalkulators',
            meta_title: 'Kilogrami uz Mārciņām | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet kilogramus uz mārciņām acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām — uncēm, stouniem, tonnām, gramiem.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no kilogramiem uz mārciņām (avdp) (1 kg = 2,2046 mārciņas) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Kilogrami uz mārciņām pastāvīgi nepieciešami ķermeņa svaram, bagāžas limitiem un kravu svariem, salīdzinot metriskos mērījumus ar ASV un Lielbritānijas mārciņu.</p><p>Šis rīks neaprobežojas ar vienu pāri: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kilograms = 2,20462 avdp mārciņas (un 1 mārciņa = tieši 0,45359237 kg, pēc starptautiskas vienošanās).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Ātrs prāta novērtējums:</b> aptuvenai konversijai dubultojiet kilogramu skaitli un pievienojiet apmēram 10%.',
            ],
            howto: [
                { question: 'Cik mārciņu ir kilogramā?', answer: '<p>1 kilograms ir aptuveni 2,2046 mārciņas. Lai konvertētu, reiziniet kg vērtību ar 2,20462.</p>' },
                { question: 'Kāpēc mārciņa tiek definēta caur kilogramu?', answer: '<p>Kopš 1959. gada starptautiskā avdp mārciņa likumīgi definēta kā tieši 0,45359237 kilogrami.</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-kilogramow-na-funty',
            title: 'Kalkulator Kilogramów na Funty',
            h1: 'Kalkulator Kilogramów na Funty',
            meta_title: 'Kilogramy na Funty | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz kilogramy na funty natychmiast lub przełącz się na dowolną z 25+ jednostek masy — uncje, stone, tony, gramy.',
            short_answer: 'Ten konwerter zmienia wartość masy z kilogramów na funty (avdp) (1 kg = 2,2046 funta) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Kilogramy na funty są stale potrzebne przy wadze ciała, limitach bagażu i wagach przesyłek przy porównywaniu pomiarów metrycznych z amerykańskim i brytyjskim funtem.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek masy.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 kilogram = 2,20462 funta avdp (a 1 funt = dokładnie 0,45359237 kg, według międzynarodowego porozumienia).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Szybkie oszacowanie w pamięci:</b> dla przybliżonej konwersji podwój wartość w kg i dodaj około 10%.',
            ],
            howto: [
                { question: 'Ile funtów jest w kilogramie?', answer: '<p>1 kilogram to około 2,2046 funta. Aby przeliczyć, pomnóż wartość w kg przez 2,20462.</p>' },
                { question: 'Dlaczego funt jest definiowany przez kilogram?', answer: '<p>Od 1959 roku międzynarodowy funt avdp jest prawnie zdefiniowany jako dokładnie 0,45359237 kg.</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-kilogramos-a-libras',
            title: 'Calculadora de Kilogramos a Libras',
            h1: 'Calculadora de Kilogramos a Libras',
            meta_title: 'Kilogramos a Libras | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte kilogramos a libras al instante, o cambia a cualquiera de más de 25 unidades de masa — onzas, stone, toneladas, gramos.',
            short_answer: 'Esta calculadora cambia un valor de masa de kilogramos a libras (avoirdupois) (1 kg = 2,2046 libras) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Kilogramos a libras se necesita constantemente para el peso corporal, los límites de equipaje y los pesos de envío al comparar mediciones métricas con la libra estadounidense y británica.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 kilogramo = 2,20462 libras avoirdupois (y 1 libra = exactamente 0,45359237 kg, por acuerdo internacional).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Estimación mental rápida:</b> para una conversión aproximada, duplica la cifra en kg y añade aproximadamente un 10%.',
            ],
            howto: [
                { question: '¿Cuántas libras hay en un kilogramo?', answer: '<p>1 kilogramo equivale aproximadamente a 2,2046 libras. Para convertir, multiplica el valor en kg por 2,20462.</p>' },
                { question: '¿Por qué la libra se define en términos del kilogramo?', answer: '<p>Desde 1959, la libra avoirdupois internacional está legalmente definida como exactamente 0,45359237 kilogramos.</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-kilogrammes-en-livres',
            title: 'Calculateur de Kilogrammes en Livres',
            h1: 'Calculateur de Kilogrammes en Livres',
            meta_title: 'Kilogrammes en Livres | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des kilogrammes en livres instantanément, ou passez à l’une des 25+ unités de masse — onces, stone, tonnes, grammes.',
            short_answer: 'Ce calculateur transforme une valeur de masse de kilogrammes en livres (avoirdupois) (1 kg = 2,2046 livres) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Kilogrammes en livres est constamment nécessaire pour le poids corporel, les limites de bagages et les poids d’expédition lors de la comparaison des mesures métriques avec la livre américaine et britannique.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 kilogramme = 2,20462 livres avoirdupois (et 1 livre = exactement 0,45359237 kg, par accord international).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Estimation mentale rapide :</b> pour une conversion approximative, doublez le chiffre en kg et ajoutez environ 10 %.',
            ],
            howto: [
                { question: 'Combien de livres y a-t-il dans un kilogramme ?', answer: '<p>1 kilogramme équivaut à environ 2,2046 livres. Pour convertir, multipliez la valeur en kg par 2,20462.</p>' },
                { question: 'Pourquoi la livre est-elle définie en fonction du kilogramme ?', answer: '<p>Depuis 1959, la livre avoirdupois internationale est légalement définie comme exactement 0,45359237 kilogramme.</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-chilogrammi-a-libbre',
            title: 'Calcolatore da Chilogrammi a Libbre',
            h1: 'Calcolatore da Chilogrammi a Libbre',
            meta_title: 'Chilogrammi in Libbre | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti chilogrammi in libbre istantaneamente, o passa a una delle 25+ unità di massa — once, stone, tonnellate, grammi.',
            short_answer: 'Questo convertitore trasforma un valore di massa da chilogrammi a libbre (avoirdupois) (1 kg = 2,2046 libbre) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Chilogrammi in libbre è costantemente necessario per il peso corporeo, i limiti di bagaglio e i pesi di spedizione quando si confrontano misure metriche con la libbra statunitense e britannica.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 chilogrammo = 2,20462 libbre avoirdupois (e 1 libbra = esattamente 0,45359237 kg, per accordo internazionale).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Stima mentale rapida:</b> per una conversione approssimativa, raddoppia la cifra in kg e aggiungi circa il 10%.',
            ],
            howto: [
                { question: 'Quante libbre ci sono in un chilogrammo?', answer: '<p>1 chilogrammo equivale a circa 2,2046 libbre. Per convertire, moltiplica il valore in kg per 2,20462.</p>' },
                { question: 'Perché la libbra è definita in termini di chilogrammo?', answer: '<p>Dal 1959, la libbra avoirdupois internazionale è legalmente definita come esattamente 0,45359237 chilogrammi.</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'kilogramm-in-pfund-rechner',
            title: 'Kilogramm in Pfund Rechner',
            h1: 'Kilogramm in Pfund Rechner',
            meta_title: 'Kilogramm in Pfund | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Kilogramm sofort in Pfund um, oder wechseln Sie zu einer von 25+ Masseeinheiten — Unzen, Stone, Tonnen, Gramm.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von Kilogramm in (avoirdupois) Pfund um (1 kg = 2,2046 lb) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Kilogramm in Pfund wird ständig für Körpergewicht, Gepäckgrenzen und Versandgewichte benötigt, wenn metrische Messungen mit dem US- und UK-Pfund verglichen werden.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Kilogramm = 2,20462 avoirdupois Pfund (und 1 Pfund = genau 0,45359237 kg, nach internationaler Vereinbarung).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Schnelle Kopfrechnung:</b> für eine grobe Umrechnung verdoppeln Sie den Kilogrammwert und addieren etwa 10%.',
            ],
            howto: [
                { question: 'Wie viele Pfund sind in einem Kilogramm?', answer: '<p>1 Kilogramm entspricht etwa 2,2046 Pfund. Um umzurechnen, multiplizieren Sie den kg-Wert mit 2,20462.</p>' },
                { question: 'Warum wird das Pfund über das Kilogramm definiert?', answer: '<p>Seit 1959 ist das internationale avoirdupois Pfund gesetzlich als genau 0,45359237 Kilogramm definiert.</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1095: Pounds to Kilograms Converter
// ============================================================
const lbsToKg: ToolDef = {
    id: '1095',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'pound_avdp' },
            { key: 'to_unit', default: 'kilogram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'pounds-to-kilograms-converter',
            title: 'Pounds to Kilograms Converter',
            h1: 'Pounds to Kilograms Converter',
            meta_title: 'Pounds to Kilograms Converter | Convert Any Mass Unit',
            meta_description: 'Convert pounds to kilograms instantly, or switch to any of 25+ mass units — ounces, stone, tons, grams, and more.',
            short_answer: 'This converter changes a mass value from (avoirdupois) pounds to kilograms (1 lb = 0.4536 kg) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Pounds to kilograms is the reverse of kilograms-to-pounds, needed whenever a US or UK weight in pounds (body weight, gym equipment, shipping) needs to be understood in metric terms.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of mass units — metric, avoirdupois, troy (precious metals), and specialized units (stone, slugs, hundredweights, long/short tons).</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 avoirdupois pound = exactly 0.45359237 kilograms, by international agreement (1959).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Common use case:</b> converting gym weights (plates and dumbbells sold in lb in the US) to kg for comparison with metric equipment.',
            ],
            howto: [
                { question: 'How many kilograms are in a pound?', answer: '<p>1 pound equals exactly 0.45359237 kilograms. To convert, multiply the pound value by 0.453592.</p>' },
                { question: 'Can I convert kilograms back to pounds with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Kilogram and Pound (avdp) respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-funty-v-kilogrammy',
            title: 'Конвертер фунтов в килограммы',
            h1: 'Конвертер фунтов в килограммы',
            meta_title: 'Фунты в килограммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте фунты в килограммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из фунтов (авердюпуа) в килограммы (1 фунт = 0,4536 кг) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Фунты в килограммы — обратная конверсия к килограммам в фунты, нужная всякий раз, когда американский или британский вес в фунтах должен быть понят в метрических терминах.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц массы.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 фунт авердюпуа = ровно 0,45359237 килограмма, по международному соглашению (1959 год).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Частый случай использования:</b> конвертация веса спортивного инвентаря (блины и гантели в фунтах в США) в кг.',
            ],
            howto: [
                { question: 'Сколько килограммов в фунте?', answer: '<p>1 фунт равен ровно 0,45359237 килограмма. Чтобы конвертировать, умножьте значение в фунтах на 0,453592.</p>' },
                { question: 'Могу ли я конвертировать килограммы обратно в фунты этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Килограмм и Фунт (авердюпуа) соответственно.</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'marcinu-uz-kilogramiem-kalkulators',
            title: 'Mārciņu uz Kilogramiem Kalkulators',
            h1: 'Mārciņu uz Kilogramiem Kalkulators',
            meta_title: 'Mārciņas uz Kilogramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet mārciņas uz kilogramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no mārciņām (avdp) uz kilogramiem (1 mārciņa = 0,4536 kg) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Mārciņas uz kilogramiem ir pretēja konversija kilogramiem uz mārciņām, kas nepieciešama, kad ASV vai Lielbritānijas svars mārciņās jāsaprot metriskajā izteiksmē.</p><p>Šis rīks neaprobežojas ar vienu pāri: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 avdp mārciņa = tieši 0,45359237 kilogrami, pēc starptautiskas vienošanās (1959. gads).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> sporta zāles svaru (diski un hanteles ASV pārdotas mārciņās) konvertēšana kg.',
            ],
            howto: [
                { question: 'Cik kilogramu ir mārciņā?', answer: '<p>1 mārciņa ir tieši 0,45359237 kilogrami. Lai konvertētu, reiziniet mārciņu vērtību ar 0,453592.</p>' },
                { question: 'Vai varu konvertēt kilogramus atpakaļ uz mārciņām ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Kilogramu un Mārciņu (avdp).</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-funtow-na-kilogramy',
            title: 'Kalkulator Funtów na Kilogramy',
            h1: 'Kalkulator Funtów na Kilogramy',
            meta_title: 'Funty na Kilogramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz funty na kilogramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z funtów (avdp) na kilogramy (1 funt = 0,4536 kg) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Funty na kilogramy to odwrotność kilogramów na funty, potrzebna, gdy amerykańska lub brytyjska waga w funtach musi być zrozumiana w jednostkach metrycznych.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek masy.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 funt avdp = dokładnie 0,45359237 kilograma, według międzynarodowego porozumienia (1959 r.).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Częsty przypadek użycia:</b> przeliczanie ciężarów siłowni (talerze i hantle sprzedawane w funtach w USA) na kg.',
            ],
            howto: [
                { question: 'Ile kilogramów jest w funcie?', answer: '<p>1 funt to dokładnie 0,45359237 kilograma. Aby przeliczyć, pomnóż wartość w funtach przez 0,453592.</p>' },
                { question: 'Czy mogę przeliczyć kilogramy z powrotem na funty tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Kilogram i Funt (avdp).</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-libras-a-kilogramos',
            title: 'Calculadora de Libras a Kilogramos',
            h1: 'Calculadora de Libras a Kilogramos',
            meta_title: 'Libras a Kilogramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte libras a kilogramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de libras (avoirdupois) a kilogramos (1 lb = 0,4536 kg) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Libras a kilogramos es la conversión inversa de kilogramos a libras, necesaria siempre que un peso estadounidense o británico en libras deba entenderse en términos métricos.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 libra avoirdupois = exactamente 0,45359237 kilogramos, por acuerdo internacional (1959).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Caso de uso común:</b> convertir pesos de gimnasio (discos y mancuernas vendidos en lb en EE. UU.) a kg.',
            ],
            howto: [
                { question: '¿Cuántos kilogramos hay en una libra?', answer: '<p>1 libra equivale exactamente a 0,45359237 kilogramos. Para convertir, multiplica el valor en libras por 0,453592.</p>' },
                { question: '¿Puedo convertir kilogramos de vuelta a libras con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Kilogramo y Libra (avdp) respectivamente.</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-livres-en-kilogrammes',
            title: 'Calculateur de Livres en Kilogrammes',
            h1: 'Calculateur de Livres en Kilogrammes',
            meta_title: 'Livres en Kilogrammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des livres en kilogrammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de livres (avoirdupois) en kilogrammes (1 lb = 0,4536 kg) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Livres en kilogrammes est l’inverse de kilogrammes en livres, nécessaire chaque fois qu’un poids américain ou britannique en livres doit être compris en termes métriques.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 livre avoirdupois = exactement 0,45359237 kilogramme, par accord international (1959).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Cas d’usage courant :</b> convertir des poids de musculation (disques et haltères vendus en lb aux États-Unis) en kg.',
            ],
            howto: [
                { question: 'Combien de kilogrammes y a-t-il dans une livre ?', answer: '<p>1 livre équivaut exactement à 0,45359237 kilogramme. Pour convertir, multipliez la valeur en livres par 0,453592.</p>' },
                { question: 'Puis-je convertir des kilogrammes en livres avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Kilogramme et Livre (avdp) respectivement.</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-libbre-a-chilogrammi',
            title: 'Calcolatore da Libbre a Chilogrammi',
            h1: 'Calcolatore da Libbre a Chilogrammi',
            meta_title: 'Libbre in Chilogrammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti libbre in chilogrammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da libbre (avoirdupois) a chilogrammi (1 lb = 0,4536 kg) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Libbre in chilogrammi è l’inverso di chilogrammi in libbre, necessaria ogni volta che un peso statunitense o britannico in libbre deve essere compreso in termini metrici.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 libbra avoirdupois = esattamente 0,45359237 chilogrammi, per accordo internazionale (1959).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Caso d’uso comune:</b> convertire pesi da palestra (dischi e manubri venduti in lb negli USA) in kg.',
            ],
            howto: [
                { question: 'Quanti chilogrammi ci sono in una libbra?', answer: '<p>1 libbra equivale esattamente a 0,45359237 chilogrammi. Per convertire, moltiplica il valore in libbre per 0,453592.</p>' },
                { question: 'Posso convertire i chilogrammi in libbre con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Chilogrammo e Libbra (avdp).</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'pfund-in-kilogramm-rechner',
            title: 'Pfund in Kilogramm Rechner',
            h1: 'Pfund in Kilogramm Rechner',
            meta_title: 'Pfund in Kilogramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Pfund sofort in Kilogramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von (avoirdupois) Pfund in Kilogramm um (1 lb = 0,4536 kg) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Pfund in Kilogramm ist die Umkehrung von Kilogramm in Pfund, benötigt, wenn ein US- oder UK-Gewicht in Pfund in metrischen Begriffen verstanden werden muss.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 avoirdupois Pfund = genau 0,45359237 Kilogramm, nach internationaler Vereinbarung (1959).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung von Fitnessstudio-Gewichten (Scheiben und Hanteln in den USA in lb verkauft) in kg.',
            ],
            howto: [
                { question: 'Wie viele Kilogramm sind in einem Pfund?', answer: '<p>1 Pfund entspricht genau 0,45359237 Kilogramm. Um umzurechnen, multiplizieren Sie den Pfundwert mit 0,453592.</p>' },
                { question: 'Kann ich mit diesem Tool Kilogramm zurück in Pfund umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Kilogramm bzw. Pfund (avdp).</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1096: Grams to Pounds Converter
// ============================================================
const gramsToLbs: ToolDef = {
    id: '1096',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 500 },
            { key: 'from_unit', default: 'gram' },
            { key: 'to_unit', default: 'pound_avdp' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 5 }],
    },
    locales: {
        en: {
            slug: 'grams-to-pounds-converter',
            title: 'Grams to Pounds Converter',
            h1: 'Grams to Pounds Converter',
            meta_title: 'Grams to Pounds Converter | Convert Any Mass Unit',
            meta_description: 'Convert grams to pounds instantly, or switch to any of 25+ mass units — kilograms, ounces, stone, tons, and more.',
            short_answer: 'This converter changes a mass value from grams to (avoirdupois) pounds (1 g = 0.0022 lb) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Grams to pounds comes up when a small-to-medium metric mass (food portions, small parcels, newborn birth weights recorded in grams internationally) needs a pound equivalent for a US audience.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of mass units — metric, avoirdupois, troy, and specialized units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 gram = 0.00220462 avoirdupois pounds (1 pound = 453.59237 grams).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>For larger masses, convert via kilograms first:</b> since pounds are relatively large compared to grams, this conversion gives very small decimal results for everyday gram quantities — for masses in the kilogram range, converting kg directly to lb is often more intuitive.',
            ],
            howto: [
                { question: 'How many pounds are in a gram?', answer: '<p>1 gram equals approximately 0.0022 pounds. To convert, multiply the gram value by 0.00220462, or divide by 453.59237.</p>' },
                { question: 'How many grams are in a pound?', answer: '<p>1 pound equals exactly 453.59237 grams — useful when converting a recipe or product weight the other direction.</p>' },
            ],
            inputs: massInputs('en', '500'),
            outputs: resultOutput('en', 5),
        },
        ru: {
            slug: 'kalkulyator-grammy-v-funty',
            title: 'Конвертер граммов в фунты',
            h1: 'Конвертер граммов в фунты',
            meta_title: 'Граммы в фунты | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте граммы в фунты мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из граммов в фунты (авердюпуа) (1 г = 0,0022 фунта) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Граммы в фунты нужны, когда небольшая или средняя метрическая масса (порции еды, небольшие посылки, вес новорождённых) должна быть переведена в фунты для американской аудитории.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц массы.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 грамм = 0,00220462 фунта авердюпуа (1 фунт = 453,59237 грамма).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Для больших масс конвертируйте через килограммы:</b> для повседневных масс в диапазоне килограммов конвертация кг напрямую в фунты часто интуитивнее.',
            ],
            howto: [
                { question: 'Сколько фунтов в грамме?', answer: '<p>1 грамм равен примерно 0,0022 фунта. Чтобы конвертировать, умножьте значение в граммах на 0,00220462.</p>' },
                { question: 'Сколько граммов в фунте?', answer: '<p>1 фунт равен ровно 453,59237 грамма.</p>' },
            ],
            inputs: massInputs('ru', '500'),
            outputs: resultOutput('ru', 5),
        },
        lv: {
            slug: 'gramu-uz-marcinam-kalkulators',
            title: 'Gramu uz Mārciņām Kalkulators',
            h1: 'Gramu uz Mārciņām Kalkulators',
            meta_title: 'Grami uz Mārciņām | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet gramus uz mārciņām acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no gramiem uz mārciņām (avdp) (1 g = 0,0022 mārciņas) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Grami uz mārciņām nepieciešami, kad neliela vai vidēja metriskā masa (ēdiena porcijas, mazas sūtījumi, jaundzimušo svars) jāpārvērš mārciņās ASV auditorijai.</p><p>Šis rīks neaprobežojas ar vienu pāri: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 grams = 0,00220462 avdp mārciņas (1 mārciņa = 453,59237 grami).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Lielākām masām konvertējiet caur kilogramiem:</b> ikdienas masām kilogramu diapazonā tiešā kg uz mārciņām konvertēšana bieži ir intuitīvāka.',
            ],
            howto: [
                { question: 'Cik mārciņu ir gramā?', answer: '<p>1 grams ir aptuveni 0,0022 mārciņas. Lai konvertētu, reiziniet gramu vērtību ar 0,00220462.</p>' },
                { question: 'Cik gramu ir mārciņā?', answer: '<p>1 mārciņa ir tieši 453,59237 grami.</p>' },
            ],
            inputs: massInputs('lv', '500'),
            outputs: resultOutput('lv', 5),
        },
        pl: {
            slug: 'kalkulator-gramow-na-funty',
            title: 'Kalkulator Gramów na Funty',
            h1: 'Kalkulator Gramów na Funty',
            meta_title: 'Gramy na Funty | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz gramy na funty natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z gramów na funty (avdp) (1 g = 0,0022 funta) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Gramy na funty są przydatne, gdy mała lub średnia masa metryczna (porcje jedzenia, małe paczki, waga urodzeniowa noworodków) musi zostać przeliczona na funty dla amerykańskiej publiczności.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek masy.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 gram = 0,00220462 funta avdp (1 funt = 453,59237 grama).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Dla większych mas przeliczaj przez kilogramy:</b> dla codziennych mas w zakresie kilogramów bezpośrednie przeliczenie kg na funty jest zwykle bardziej intuicyjne.',
            ],
            howto: [
                { question: 'Ile funtów jest w gramie?', answer: '<p>1 gram to około 0,0022 funta. Aby przeliczyć, pomnóż wartość w gramach przez 0,00220462.</p>' },
                { question: 'Ile gramów jest w funcie?', answer: '<p>1 funt to dokładnie 453,59237 grama.</p>' },
            ],
            inputs: massInputs('pl', '500'),
            outputs: resultOutput('pl', 5),
        },
        es: {
            slug: 'calculadora-de-gramos-a-libras',
            title: 'Calculadora de Gramos a Libras',
            h1: 'Calculadora de Gramos a Libras',
            meta_title: 'Gramos a Libras | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte gramos a libras al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de gramos a libras (avoirdupois) (1 g = 0,0022 libras) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Gramos a libras surge cuando una masa métrica pequeña o mediana (porciones de comida, paquetes pequeños, peso al nacer de recién nacidos) necesita un equivalente en libras para una audiencia estadounidense.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 gramo = 0,00220462 libras avoirdupois (1 libra = 453,59237 gramos).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Para masas mayores, convierte primero a kilogramos:</b> para masas cotidianas en el rango de kilogramos, convertir kg directamente a libras suele ser más intuitivo.',
            ],
            howto: [
                { question: '¿Cuántas libras hay en un gramo?', answer: '<p>1 gramo equivale aproximadamente a 0,0022 libras. Para convertir, multiplica el valor en gramos por 0,00220462.</p>' },
                { question: '¿Cuántos gramos hay en una libra?', answer: '<p>1 libra equivale exactamente a 453,59237 gramos.</p>' },
            ],
            inputs: massInputs('es', '500'),
            outputs: resultOutput('es', 5),
        },
        fr: {
            slug: 'calculateur-de-grammes-en-livres',
            title: 'Calculateur de Grammes en Livres',
            h1: 'Calculateur de Grammes en Livres',
            meta_title: 'Grammes en Livres | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des grammes en livres instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de grammes en livres (avoirdupois) (1 g = 0,0022 livre) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Grammes en livres revient lorsqu’une masse métrique petite à moyenne (portions alimentaires, petits colis, poids de naissance des nouveau-nés) a besoin d’un équivalent en livres pour un public américain.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 gramme = 0,00220462 livre avoirdupois (1 livre = 453,59237 grammes).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Pour des masses plus importantes, convertissez d’abord en kilogrammes :</b> pour les masses courantes de l’ordre du kilogramme, convertir directement kg en livres est souvent plus intuitif.',
            ],
            howto: [
                { question: 'Combien de livres y a-t-il dans un gramme ?', answer: '<p>1 gramme équivaut à environ 0,0022 livre. Pour convertir, multipliez la valeur en grammes par 0,00220462.</p>' },
                { question: 'Combien de grammes y a-t-il dans une livre ?', answer: '<p>1 livre équivaut exactement à 453,59237 grammes.</p>' },
            ],
            inputs: massInputs('fr', '500'),
            outputs: resultOutput('fr', 5),
        },
        it: {
            slug: 'calcolatore-da-grammi-a-libbre',
            title: 'Calcolatore da Grammi a Libbre',
            h1: 'Calcolatore da Grammi a Libbre',
            meta_title: 'Grammi in Libbre | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti grammi in libbre istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da grammi a libbre (avoirdupois) (1 g = 0,0022 libbre) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Grammi in libbre è utile quando una massa metrica piccola o media (porzioni di cibo, piccoli pacchi, peso alla nascita dei neonati) necessita di un equivalente in libbre per un pubblico statunitense.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 grammo = 0,00220462 libbre avoirdupois (1 libbra = 453,59237 grammi).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Per masse maggiori, converti prima in chilogrammi:</b> per masse quotidiane nell’intervallo dei chilogrammi, convertire kg direttamente in libbre è spesso più intuitivo.',
            ],
            howto: [
                { question: 'Quante libbre ci sono in un grammo?', answer: '<p>1 grammo equivale a circa 0,0022 libbre. Per convertire, moltiplica il valore in grammi per 0,00220462.</p>' },
                { question: 'Quanti grammi ci sono in una libbra?', answer: '<p>1 libbra equivale esattamente a 453,59237 grammi.</p>' },
            ],
            inputs: massInputs('it', '500'),
            outputs: resultOutput('it', 5),
        },
        de: {
            slug: 'gramm-in-pfund-rechner',
            title: 'Gramm in Pfund Rechner',
            h1: 'Gramm in Pfund Rechner',
            meta_title: 'Gramm in Pfund | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Gramm sofort in Pfund um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von Gramm in (avoirdupois) Pfund um (1 g = 0,0022 lb) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Gramm in Pfund kommt vor, wenn eine kleine bis mittlere metrische Masse (Essensportionen, kleine Pakete, Geburtsgewichte von Neugeborenen) ein Pfund-Äquivalent für ein US-Publikum benötigt.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Gramm = 0,00220462 avoirdupois Pfund (1 Pfund = 453,59237 Gramm).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Für größere Massen zuerst über Kilogramm umrechnen:</b> für alltägliche Massen im Kilogrammbereich ist die direkte Umrechnung von kg in Pfund oft intuitiver.',
            ],
            howto: [
                { question: 'Wie viele Pfund sind in einem Gramm?', answer: '<p>1 Gramm entspricht etwa 0,0022 Pfund. Um umzurechnen, multiplizieren Sie den Grammwert mit 0,00220462.</p>' },
                { question: 'Wie viele Gramm sind in einem Pfund?', answer: '<p>1 Pfund entspricht genau 453,59237 Gramm.</p>' },
            ],
            inputs: massInputs('de', '500'),
            outputs: resultOutput('de', 5),
        },
    },
}

// ============================================================
// 1097: Milligrams to Grams Converter
// ============================================================
const mgToGrams: ToolDef = {
    id: '1097',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 500 },
            { key: 'from_unit', default: 'milligram' },
            { key: 'to_unit', default: 'gram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'milligrams-to-grams-converter',
            title: 'Milligrams to Grams Converter',
            h1: 'Milligrams to Grams Converter',
            meta_title: 'Milligrams to Grams Converter | Convert Any Mass Unit',
            meta_description: 'Convert milligrams to grams instantly, or switch to any of 25+ mass units — micrograms, kilograms, ounces, grains, and more.',
            short_answer: 'This converter changes a mass value from milligrams to grams (1 mg = 0.001 g) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Milligrams to grams is essential for reading medication dosages, vitamin and supplement labels, and precise laboratory or jewelry measurements, since active ingredients are usually listed in milligrams while everyday scales read in grams.</p><p>This tool isn\'t limited to mg and g: the "From" and "To" dropdowns cover the full range of mass units, from micrograms up through metric tons, plus troy and specialized units used for precious metals and gemstones.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 milligram = exactly 0.001 grams (1,000 milligrams = 1 gram, both SI-derived units).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>No rounding needed:</b> since both units are decimal SI units, this conversion is always an exact power-of-ten shift, never an approximation.',
            ],
            howto: [
                { question: 'How many grams are in a milligram?', answer: '<p>1 milligram equals exactly 0.001 grams. To convert, divide the milligram value by 1,000 (or move the decimal point three places left).</p>' },
                { question: 'Why are medication doses given in milligrams instead of grams?', answer: '<p>Many active pharmaceutical ingredients are effective in very small quantities — milligrams give more precise, whole-number-friendly dosing than fractional grams would.</p>' },
            ],
            inputs: massInputs('en', '500'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-milligrammy-v-grammy',
            title: 'Конвертер миллиграммов в граммы',
            h1: 'Конвертер миллиграммов в граммы',
            meta_title: 'Миллиграммы в граммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте миллиграммы в граммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из миллиграммов в граммы (1 мг = 0,001 г) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Миллиграммы в граммы необходимы для чтения дозировок лекарств, этикеток витаминов и добавок, а также точных лабораторных или ювелирных измерений.</p><p>Этот инструмент не ограничен мг и г: списки "Из" и "В" охватывают полный диапазон единиц массы.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 миллиграмм = ровно 0,001 грамма (1000 миллиграммов = 1 грамм).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Округление не требуется:</b> так как обе единицы десятичные СИ, эта конверсия всегда точный сдвиг степени десяти.',
            ],
            howto: [
                { question: 'Сколько граммов в миллиграмме?', answer: '<p>1 миллиграмм равен ровно 0,001 грамма. Чтобы конвертировать, разделите значение в мг на 1000.</p>' },
                { question: 'Почему дозы лекарств указываются в миллиграммах, а не в граммах?', answer: '<p>Многие активные фармацевтические ингредиенты эффективны в очень малых количествах — миллиграммы дают более точное дозирование.</p>' },
            ],
            inputs: massInputs('ru', '500'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'miligramu-uz-gramiem-kalkulators',
            title: 'Miligramu uz Gramiem Kalkulators',
            h1: 'Miligramu uz Gramiem Kalkulators',
            meta_title: 'Miligrami uz Gramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet miligramus uz gramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no miligramiem uz gramiem (1 mg = 0,001 g) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Miligrami uz gramiem ir svarīgi medikamentu devu, vitamīnu un uztura bagātinātāju etiķešu lasīšanai, kā arī precīziem laboratorijas vai juvelierizstrādājumu mērījumiem.</p><p>Šis rīks neaprobežojas ar mg un g: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 miligrams = tieši 0,001 grami (1000 miligrami = 1 grams).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Nav nepieciešama noapaļošana:</b> abas vienības ir decimālas SI vienības, tāpēc šī konversija vienmēr ir precīza desmitnieka pakāpes maiņa.',
            ],
            howto: [
                { question: 'Cik gramu ir miligramā?', answer: '<p>1 miligrams ir tieši 0,001 grami. Lai konvertētu, daliet mg vērtību ar 1000.</p>' },
                { question: 'Kāpēc medikamentu devas norāda miligramos, nevis gramos?', answer: '<p>Daudzas aktīvās farmaceitiskās sastāvdaļas ir efektīvas ļoti mazos daudzumos — miligrami dod precīzāku devu.</p>' },
            ],
            inputs: massInputs('lv', '500'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-miligramow-na-gramy',
            title: 'Kalkulator Miligramów na Gramy',
            h1: 'Kalkulator Miligramów na Gramy',
            meta_title: 'Miligramy na Gramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz miligramy na gramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z miligramów na gramy (1 mg = 0,001 g) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Miligramy na gramy są niezbędne do odczytywania dawek leków, etykiet witamin i suplementów oraz precyzyjnych pomiarów laboratoryjnych lub jubilerskich.</p><p>To narzędzie nie ogranicza się do mg i g: listy "Z" i "Do" obejmują pełny zakres jednostek masy.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 miligram = dokładnie 0,001 grama (1000 miligramów = 1 gram).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Bez zaokrąglania:</b> ponieważ obie jednostki są dziesiętnymi jednostkami SI, ta konwersja to zawsze dokładne przesunięcie o potęgę dziesięciu.',
            ],
            howto: [
                { question: 'Ile gramów jest w miligramie?', answer: '<p>1 miligram to dokładnie 0,001 grama. Aby przeliczyć, podziel wartość w mg przez 1000.</p>' },
                { question: 'Dlaczego dawki leków podawane są w miligramach, a nie gramach?', answer: '<p>Wiele aktywnych substancji farmaceutycznych jest skutecznych w bardzo małych ilościach — miligramy dają dokładniejsze dawkowanie.</p>' },
            ],
            inputs: massInputs('pl', '500'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-miligramos-a-gramos',
            title: 'Calculadora de Miligramos a Gramos',
            h1: 'Calculadora de Miligramos a Gramos',
            meta_title: 'Miligramos a Gramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte miligramos a gramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de miligramos a gramos (1 mg = 0,001 g) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Miligramos a gramos es esencial para leer dosis de medicamentos, etiquetas de vitaminas y suplementos, y mediciones precisas de laboratorio o joyería.</p><p>Esta herramienta no se limita a mg y g: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 miligramo = exactamente 0,001 gramos (1000 miligramos = 1 gramo).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>No requiere redondeo:</b> como ambas unidades son unidades SI decimales, esta conversión es siempre un cambio exacto de potencia de diez.',
            ],
            howto: [
                { question: '¿Cuántos gramos hay en un miligramo?', answer: '<p>1 miligramo equivale exactamente a 0,001 gramos. Para convertir, divide el valor en mg entre 1000.</p>' },
                { question: '¿Por qué las dosis de medicamentos se dan en miligramos en lugar de gramos?', answer: '<p>Muchos principios activos farmacéuticos son efectivos en cantidades muy pequeñas — los miligramos dan una dosificación más precisa.</p>' },
            ],
            inputs: massInputs('es', '500'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-milligrammes-en-grammes',
            title: 'Calculateur de Milligrammes en Grammes',
            h1: 'Calculateur de Milligrammes en Grammes',
            meta_title: 'Milligrammes en Grammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des milligrammes en grammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de milligrammes en grammes (1 mg = 0,001 g) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Milligrammes en grammes est essentiel pour lire les doses de médicaments, les étiquettes de vitamines et compléments, et les mesures précises de laboratoire ou de bijouterie.</p><p>Cet outil ne se limite pas aux mg et g : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 milligramme = exactement 0,001 gramme (1000 milligrammes = 1 gramme).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Aucun arrondi nécessaire :</b> les deux unités étant décimales SI, cette conversion est toujours un décalage exact de puissance de dix.',
            ],
            howto: [
                { question: 'Combien de grammes y a-t-il dans un milligramme ?', answer: '<p>1 milligramme équivaut exactement à 0,001 gramme. Pour convertir, divisez la valeur en mg par 1000.</p>' },
                { question: 'Pourquoi les doses de médicaments sont-elles données en milligrammes plutôt qu’en grammes ?', answer: '<p>De nombreux principes actifs pharmaceutiques sont efficaces en très petites quantités — les milligrammes offrent un dosage plus précis.</p>' },
            ],
            inputs: massInputs('fr', '500'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-milligrammi-a-grammi',
            title: 'Calcolatore da Milligrammi a Grammi',
            h1: 'Calcolatore da Milligrammi a Grammi',
            meta_title: 'Milligrammi in Grammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti milligrammi in grammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da milligrammi a grammi (1 mg = 0,001 g) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Milligrammi in grammi è essenziale per leggere i dosaggi dei farmaci, le etichette di vitamine e integratori e le misurazioni precise di laboratorio o gioielleria.</p><p>Questo strumento non si limita a mg e g: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 milligrammo = esattamente 0,001 grammi (1000 milligrammi = 1 grammo).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Nessun arrotondamento necessario:</b> poiché entrambe le unità sono unità SI decimali, questa conversione è sempre uno spostamento esatto di potenza di dieci.',
            ],
            howto: [
                { question: 'Quanti grammi ci sono in un milligrammo?', answer: '<p>1 milligrammo equivale esattamente a 0,001 grammi. Per convertire, dividi il valore in mg per 1000.</p>' },
                { question: 'Perché le dosi dei farmaci sono date in milligrammi anziché in grammi?', answer: '<p>Molti principi attivi farmaceutici sono efficaci in quantità molto piccole — i milligrammi danno un dosaggio più preciso.</p>' },
            ],
            inputs: massInputs('it', '500'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'milligramm-in-gramm-rechner',
            title: 'Milligramm in Gramm Rechner',
            h1: 'Milligramm in Gramm Rechner',
            meta_title: 'Milligramm in Gramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Milligramm sofort in Gramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von Milligramm in Gramm um (1 mg = 0,001 g) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Milligramm in Gramm ist unerlässlich zum Lesen von Medikamentendosierungen, Vitamin- und Nahrungsergänzungsmitteletiketten sowie präzisen Labor- oder Schmuckmessungen.</p><p>Dieses Tool beschränkt sich nicht auf mg und g: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Milligramm = genau 0,001 Gramm (1000 Milligramm = 1 Gramm).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Keine Rundung nötig:</b> da beide Einheiten dezimale SI-Einheiten sind, ist diese Umrechnung immer eine exakte Zehnerpotenz-Verschiebung.',
            ],
            howto: [
                { question: 'Wie viele Gramm sind in einem Milligramm?', answer: '<p>1 Milligramm entspricht genau 0,001 Gramm. Um umzurechnen, teilen Sie den mg-Wert durch 1000.</p>' },
                { question: 'Warum werden Medikamentendosen in Milligramm statt Gramm angegeben?', answer: '<p>Viele pharmazeutische Wirkstoffe sind in sehr kleinen Mengen wirksam — Milligramm ermöglichen eine präzisere Dosierung.</p>' },
            ],
            inputs: massInputs('de', '500'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1098: Stone to Kilograms Converter
// ============================================================
const stoneToKg: ToolDef = {
    id: '1098',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 10 },
            { key: 'from_unit', default: 'stone' },
            { key: 'to_unit', default: 'kilogram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'stone-to-kilograms-converter',
            title: 'Stone to Kilograms Converter',
            h1: 'Stone to Kilograms Converter',
            meta_title: 'Stone to Kilograms Converter | Convert Any Mass Unit',
            meta_description: 'Convert stone to kilograms instantly, or switch to any of 25+ mass units — pounds, ounces, tons, grams, and more.',
            short_answer: 'This converter changes a mass value from stone to kilograms (1 stone = 6.3503 kg) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>The stone is a traditional British and Irish unit still used colloquially for body weight (a common way to state adult weight in the UK/Ireland, e.g. "12 stone 4"), even though the UK officially uses metric units for most other purposes.</p><p>This tool goes beyond stone and kilograms: the "From" and "To" dropdowns cover the full range of mass units, including pounds, ounces, and specialized measures.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 stone = exactly 6.35029318 kilograms (14 avoirdupois pounds).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Stone is rarely subdivided by decimals:</b> UK body weight is traditionally expressed as "X stone Y pounds" (e.g. 12 stone 4 lb) rather than a decimal stone value — convert the pounds portion separately if needed.',
            ],
            howto: [
                { question: 'How many kilograms are in a stone?', answer: '<p>1 stone equals exactly 6.35029318 kilograms. To convert, multiply the stone value by 6.35029.</p>' },
                { question: 'How many pounds are in a stone?', answer: '<p>There are exactly 14 avoirdupois pounds in 1 stone — this is a fixed, unchanging relationship.</p>' },
            ],
            inputs: massInputs('en', '10'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-stouny-v-kilogrammy',
            title: 'Конвертер стоунов в килограммы',
            h1: 'Конвертер стоунов в килограммы',
            meta_title: 'Стоуны в килограммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте стоуны в килограммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из стоунов в килограммы (1 стоун = 6,3503 кг) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Стоун — традиционная британская и ирландская единица, всё ещё используемая разговорно для веса тела (распространённый способ указания веса взрослого в Великобритании/Ирландии).</p><p>Этот инструмент выходит за рамки стоунов и килограммов: списки "Из" и "В" охватывают полный диапазон единиц массы.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 стоун = ровно 6,35029318 килограмма (14 фунтов авердюпуа).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Стоун редко делится десятично:</b> вес в Великобритании традиционно выражается как "X стоунов Y фунтов".',
            ],
            howto: [
                { question: 'Сколько килограммов в стоуне?', answer: '<p>1 стоун равен ровно 6,35029318 килограмма. Чтобы конвертировать, умножьте значение в стоунах на 6,35029.</p>' },
                { question: 'Сколько фунтов в стоуне?', answer: '<p>В 1 стоуне ровно 14 фунтов авердюпуа.</p>' },
            ],
            inputs: massInputs('ru', '10'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'stounu-uz-kilogramiem-kalkulators',
            title: 'Stounu uz Kilogramiem Kalkulators',
            h1: 'Stounu uz Kilogramiem Kalkulators',
            meta_title: 'Stouni uz Kilogramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet stounus uz kilogramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no stouniem uz kilogramiem (1 stouns = 6,3503 kg) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Stouns ir tradicionāla britu un īru vienība, kas joprojām sarunvalodā tiek izmantota ķermeņa svaram Lielbritānijā un Īrijā.</p><p>Šis rīks sniedzas tālāk par stouniem un kilogramiem: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 stouns = tieši 6,35029318 kilogrami (14 avdp mārciņas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Stouns reti tiek dalīts decimāli:</b> Lielbritānijas ķermeņa svars tradicionāli tiek izteikts kā "X stouni Y mārciņas".',
            ],
            howto: [
                { question: 'Cik kilogramu ir stounā?', answer: '<p>1 stouns ir tieši 6,35029318 kilogrami. Lai konvertētu, reiziniet stounu vērtību ar 6,35029.</p>' },
                { question: 'Cik mārciņu ir stounā?', answer: '<p>1 stounā ir tieši 14 avdp mārciņas.</p>' },
            ],
            inputs: massInputs('lv', '10'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-stone-na-kilogramy',
            title: 'Kalkulator Stone na Kilogramy',
            h1: 'Kalkulator Stone na Kilogramy',
            meta_title: 'Stone na Kilogramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz stone na kilogramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy ze stone na kilogramy (1 stone = 6,3503 kg) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Stone to tradycyjna brytyjska i irlandzka jednostka wciąż potocznie używana do wagi ciała w Wielkiej Brytanii i Irlandii.</p><p>To narzędzie wykracza poza stone i kilogramy: listy "Z" i "Do" obejmują pełny zakres jednostek masy.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 stone = dokładnie 6,35029318 kilograma (14 funtów avdp).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Stone rzadko dzieli się dziesiętnie:</b> brytyjska waga ciała jest tradycyjnie wyrażana jako "X stone Y funtów".',
            ],
            howto: [
                { question: 'Ile kilogramów jest w stone?', answer: '<p>1 stone to dokładnie 6,35029318 kilograma. Aby przeliczyć, pomnóż wartość w stone przez 6,35029.</p>' },
                { question: 'Ile funtów jest w stone?', answer: '<p>W 1 stone jest dokładnie 14 funtów avdp.</p>' },
            ],
            inputs: massInputs('pl', '10'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-stone-a-kilogramos',
            title: 'Calculadora de Stone a Kilogramos',
            h1: 'Calculadora de Stone a Kilogramos',
            meta_title: 'Stone a Kilogramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte stone a kilogramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de stone a kilogramos (1 stone = 6,3503 kg) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>El stone es una unidad tradicional británica e irlandesa aún usada coloquialmente para el peso corporal en el Reino Unido e Irlanda.</p><p>Esta herramienta va más allá del stone y los kilogramos: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 stone = exactamente 6,35029318 kilogramos (14 libras avoirdupois).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>El stone rara vez se subdivide con decimales:</b> el peso corporal británico se expresa tradicionalmente como "X stone Y libras".',
            ],
            howto: [
                { question: '¿Cuántos kilogramos hay en un stone?', answer: '<p>1 stone equivale exactamente a 6,35029318 kilogramos. Para convertir, multiplica el valor en stone por 6,35029.</p>' },
                { question: '¿Cuántas libras hay en un stone?', answer: '<p>Hay exactamente 14 libras avoirdupois en 1 stone.</p>' },
            ],
            inputs: massInputs('es', '10'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-de-stone-en-kilogrammes',
            title: 'Calculateur de Stone en Kilogrammes',
            h1: 'Calculateur de Stone en Kilogrammes',
            meta_title: 'Stone en Kilogrammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des stone en kilogrammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de stone en kilogrammes (1 stone = 6,3503 kg) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Le stone est une unité britannique et irlandaise traditionnelle encore utilisée familièrement pour le poids corporel au Royaume-Uni et en Irlande.</p><p>Cet outil va au-delà du stone et des kilogrammes : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 stone = exactement 6,35029318 kilogrammes (14 livres avoirdupois).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Le stone est rarement subdivisé en décimales :</b> le poids corporel britannique s’exprime traditionnellement comme « X stone Y livres ».',
            ],
            howto: [
                { question: 'Combien de kilogrammes y a-t-il dans un stone ?', answer: '<p>1 stone équivaut exactement à 6,35029318 kilogrammes. Pour convertir, multipliez la valeur en stone par 6,35029.</p>' },
                { question: 'Combien de livres y a-t-il dans un stone ?', answer: '<p>Il y a exactement 14 livres avoirdupois dans 1 stone.</p>' },
            ],
            inputs: massInputs('fr', '10'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-stone-a-chilogrammi',
            title: 'Calcolatore da Stone a Chilogrammi',
            h1: 'Calcolatore da Stone a Chilogrammi',
            meta_title: 'Stone in Chilogrammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti stone in chilogrammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da stone a chilogrammi (1 stone = 6,3503 kg) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Lo stone è un’unità tradizionale britannica e irlandese ancora usata colloquialmente per il peso corporeo nel Regno Unito e in Irlanda.</p><p>Questo strumento va oltre stone e chilogrammi: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 stone = esattamente 6,35029318 chilogrammi (14 libbre avoirdupois).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Lo stone raramente viene suddiviso con decimali:</b> il peso corporeo britannico è tradizionalmente espresso come "X stone Y libbre".',
            ],
            howto: [
                { question: 'Quanti chilogrammi ci sono in uno stone?', answer: '<p>1 stone equivale esattamente a 6,35029318 chilogrammi. Per convertire, moltiplica il valore in stone per 6,35029.</p>' },
                { question: 'Quante libbre ci sono in uno stone?', answer: '<p>Ci sono esattamente 14 libbre avoirdupois in 1 stone.</p>' },
            ],
            inputs: massInputs('it', '10'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'stone-in-kilogramm-rechner',
            title: 'Stone in Kilogramm Rechner',
            h1: 'Stone in Kilogramm Rechner',
            meta_title: 'Stone in Kilogramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Stone sofort in Kilogramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von Stone in Kilogramm um (1 Stone = 6,3503 kg) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Der Stone ist eine traditionelle britische und irische Einheit, die in Großbritannien und Irland umgangssprachlich noch für das Körpergewicht verwendet wird.</p><p>Dieses Tool geht über Stone und Kilogramm hinaus: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Stone = genau 6,35029318 Kilogramm (14 avoirdupois Pfund).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Stone wird selten dezimal unterteilt:</b> das britische Körpergewicht wird traditionell als "X Stone Y Pfund" ausgedrückt.',
            ],
            howto: [
                { question: 'Wie viele Kilogramm sind in einem Stone?', answer: '<p>1 Stone entspricht genau 6,35029318 Kilogramm. Um umzurechnen, multiplizieren Sie den Stone-Wert mit 6,35029.</p>' },
                { question: 'Wie viele Pfund sind in einem Stone?', answer: '<p>In 1 Stone sind genau 14 avoirdupois Pfund.</p>' },
            ],
            inputs: massInputs('de', '10'),
            outputs: resultOutput('de', 3),
        },
    },
}

// ============================================================
// 1099: Tons (short) to Kilograms Converter
// ============================================================
const tonsToKg: ToolDef = {
    id: '1099',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'ton_short' },
            { key: 'to_unit', default: 'kilogram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'tons-to-kilograms-converter',
            title: 'Tons (Short) to Kilograms Converter',
            h1: 'Tons (Short) to Kilograms Converter',
            meta_title: 'Tons to Kilograms Converter | Convert Any Mass Unit',
            meta_description: 'Convert US short tons to kilograms instantly, or switch to any of 25+ mass units — long tons, metric tons, pounds, and more.',
            short_answer: 'This converter changes a mass value from U.S. short tons to kilograms (1 short ton = 907.185 kg) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>The short ton (2,000 lb) is the standard "ton" used in the US for freight, vehicle weight ratings, and bulk material pricing, while most of the rest of the world uses the metric ton (1,000 kg) for the same purposes.</p><p>This tool goes beyond the short ton: the "From" and "To" dropdowns also cover the UK long ton and the metric ton (tonne) plus the full range of other mass units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. short ton = exactly 907.18474 kilograms (2,000 avoirdupois pounds).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Three different "tons":</b> the US short ton (907.2 kg), the UK long ton (1,016.0 kg), and the metric tonne (1,000 kg) are all different — always confirm which one a figure refers to.',
            ],
            howto: [
                { question: 'How many kilograms are in a ton?', answer: '<p>1 U.S. short ton equals exactly 907.18474 kilograms. To convert, multiply the ton value by 907.18474.</p>' },
                { question: 'What\'s the difference between a short ton and a long ton?', answer: '<p>The US short ton is 2,000 pounds (907.2 kg); the British long ton is 2,240 pounds (1,016.0 kg) — about 12% heavier. Select "Ton (long)" if your source is British.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-tonny-v-kilogrammy',
            title: 'Конвертер коротких тонн в килограммы',
            h1: 'Конвертер коротких тонн в килограммы',
            meta_title: 'Тонны в килограммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте американские короткие тонны в килограммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из американских коротких тонн в килограммы (1 короткая тонна = 907,185 кг) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Короткая тонна (2000 фунтов) — стандартная "тонна", используемая в США для грузоперевозок, весовых характеристик транспортных средств и оптовых цен на материалы, тогда как большая часть остального мира использует метрическую тонну (1000 кг).</p><p>Этот инструмент выходит за рамки короткой тонны: списки "Из" и "В" также охватывают британскую длинную тонну и метрическую тонну.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американская короткая тонна = ровно 907,18474 килограмма (2000 фунтов авердюпуа).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Три разные "тонны":</b> американская короткая (907,2 кг), британская длинная (1016,0 кг) и метрическая (1000 кг) — все разные.',
            ],
            howto: [
                { question: 'Сколько килограммов в тонне?', answer: '<p>1 американская короткая тонна равна ровно 907,18474 килограмма.</p>' },
                { question: 'В чём разница между короткой и длинной тонной?', answer: '<p>Американская короткая тонна — 2000 фунтов (907,2 кг); британская длинная тонна — 2240 фунтов (1016,0 кг), примерно на 12% тяжелее.</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'tonnu-uz-kilogramiem-kalkulators',
            title: 'Tonnu (Īsā) uz Kilogramiem Kalkulators',
            h1: 'Tonnu (Īsā) uz Kilogramiem Kalkulators',
            meta_title: 'Tonnas uz Kilogramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet ASV īsās tonnas uz kilogramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no ASV īsajām tonnām uz kilogramiem (1 īsā tonna = 907,185 kg) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Īsā tonna (2000 mārciņas) ir standarta "tonna", ko ASV izmanto kravu pārvadājumiem, transportlīdzekļu svara klasifikācijai un beztaras materiālu cenošanai.</p><p>Šis rīks sniedzas tālāk par īso tonnu: saraksti "No" un "Uz" aptver arī Lielbritānijas garo tonnu un metrisko tonnu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV īsā tonna = tieši 907,18474 kilogrami (2000 avdp mārciņas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Trīs dažādas "tonnas":</b> ASV īsā (907,2 kg), Lielbritānijas garā (1016,0 kg) un metriskā (1000 kg) ir visas atšķirīgas.',
            ],
            howto: [
                { question: 'Cik kilogramu ir tonnā?', answer: '<p>1 ASV īsā tonna ir tieši 907,18474 kilogrami.</p>' },
                { question: 'Kāda ir atšķirība starp īso un garo tonnu?', answer: '<p>ASV īsā tonna ir 2000 mārciņas (907,2 kg); Lielbritānijas garā tonna ir 2240 mārciņas (1016,0 kg), apmēram par 12% smagāka.</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-ton-na-kilogramy',
            title: 'Kalkulator Ton (Krótkich) na Kilogramy',
            h1: 'Kalkulator Ton (Krótkich) na Kilogramy',
            meta_title: 'Tony na Kilogramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz amerykańskie tony krótkie na kilogramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z amerykańskich ton krótkich na kilogramy (1 tona krótka = 907,185 kg) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Tona krótka (2000 funtów) to standardowa "tona" używana w USA dla frachtu, oceny wagi pojazdów i cen materiałów masowych.</p><p>To narzędzie wykracza poza tonę krótką: listy "Z" i "Do" obejmują także brytyjską tonę długą i tonę metryczną.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykańska tona krótka = dokładnie 907,18474 kilograma (2000 funtów avdp).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Trzy różne "tony":</b> amerykańska krótka (907,2 kg), brytyjska długa (1016,0 kg) i metryczna (1000 kg) są różne.',
            ],
            howto: [
                { question: 'Ile kilogramów jest w tonie?', answer: '<p>1 amerykańska tona krótka to dokładnie 907,18474 kilograma.</p>' },
                { question: 'Jaka jest różnica między toną krótką a długą?', answer: '<p>Amerykańska tona krótka to 2000 funtów (907,2 kg); brytyjska tona długa to 2240 funtów (1016,0 kg), około 12% cięższa.</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-toneladas-a-kilogramos',
            title: 'Calculadora de Toneladas (Cortas) a Kilogramos',
            h1: 'Calculadora de Toneladas (Cortas) a Kilogramos',
            meta_title: 'Toneladas a Kilogramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte toneladas cortas estadounidenses a kilogramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de toneladas cortas estadounidenses a kilogramos (1 tonelada corta = 907,185 kg) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>La tonelada corta (2000 lb) es la "tonelada" estándar usada en EE. UU. para carga, calificaciones de peso de vehículos y precios de materiales a granel.</p><p>Esta herramienta va más allá de la tonelada corta: los menús desplegables "De" y "A" también cubren la tonelada larga británica y la tonelada métrica.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 tonelada corta estadounidense = exactamente 907,18474 kilogramos (2000 libras avoirdupois).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Tres "toneladas" diferentes:</b> la corta estadounidense (907,2 kg), la larga británica (1016,0 kg) y la métrica (1000 kg) son todas diferentes.',
            ],
            howto: [
                { question: '¿Cuántos kilogramos hay en una tonelada?', answer: '<p>1 tonelada corta estadounidense equivale exactamente a 907,18474 kilogramos.</p>' },
                { question: '¿Cuál es la diferencia entre una tonelada corta y una larga?', answer: '<p>La tonelada corta estadounidense son 2000 libras (907,2 kg); la tonelada larga británica son 2240 libras (1016,0 kg), aproximadamente un 12% más pesada.</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-tonnes-courtes-en-kilogrammes',
            title: 'Calculateur de Tonnes (Courtes) en Kilogrammes',
            h1: 'Calculateur de Tonnes (Courtes) en Kilogrammes',
            meta_title: 'Tonnes en Kilogrammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des tonnes courtes américaines en kilogrammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de tonnes courtes américaines en kilogrammes (1 tonne courte = 907,185 kg) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>La tonne courte (2000 lb) est la « tonne » standard utilisée aux États-Unis pour le fret, les capacités de poids des véhicules et les prix des matériaux en vrac.</p><p>Cet outil va au-delà de la tonne courte : les listes déroulantes « De » et « Vers » couvrent aussi la tonne longue britannique et la tonne métrique.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 tonne courte américaine = exactement 907,18474 kilogrammes (2000 livres avoirdupois).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Trois « tonnes » différentes :</b> la courte américaine (907,2 kg), la longue britannique (1016,0 kg) et la métrique (1000 kg) sont toutes différentes.',
            ],
            howto: [
                { question: 'Combien de kilogrammes y a-t-il dans une tonne ?', answer: '<p>1 tonne courte américaine équivaut exactement à 907,18474 kilogrammes.</p>' },
                { question: 'Quelle est la différence entre une tonne courte et une tonne longue ?', answer: '<p>La tonne courte américaine fait 2000 livres (907,2 kg) ; la tonne longue britannique fait 2240 livres (1016,0 kg), environ 12 % plus lourde.</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-tonnellate-corte-a-chilogrammi',
            title: 'Calcolatore da Tonnellate (Corte) a Chilogrammi',
            h1: 'Calcolatore da Tonnellate (Corte) a Chilogrammi',
            meta_title: 'Tonnellate in Chilogrammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti tonnellate corte statunitensi in chilogrammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da tonnellate corte statunitensi a chilogrammi (1 tonnellata corta = 907,185 kg) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>La tonnellata corta (2000 lb) è la "tonnellata" standard usata negli USA per il trasporto merci, le classificazioni di peso dei veicoli e i prezzi dei materiali sfusi.</p><p>Questo strumento va oltre la tonnellata corta: i menu a tendina "Da" e "A" coprono anche la tonnellata lunga britannica e la tonnellata metrica.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 tonnellata corta statunitense = esattamente 907,18474 chilogrammi (2000 libbre avoirdupois).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Tre "tonnellate" diverse:</b> quella corta statunitense (907,2 kg), quella lunga britannica (1016,0 kg) e quella metrica (1000 kg) sono tutte diverse.',
            ],
            howto: [
                { question: 'Quanti chilogrammi ci sono in una tonnellata?', answer: '<p>1 tonnellata corta statunitense equivale esattamente a 907,18474 chilogrammi.</p>' },
                { question: 'Qual è la differenza tra una tonnellata corta e una lunga?', answer: '<p>La tonnellata corta statunitense è 2000 libbre (907,2 kg); la tonnellata lunga britannica è 2240 libbre (1016,0 kg), circa il 12% più pesante.</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'tonnen-in-kilogramm-rechner',
            title: 'Tonnen (Kurz) in Kilogramm Rechner',
            h1: 'Tonnen (Kurz) in Kilogramm Rechner',
            meta_title: 'Tonnen in Kilogramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie US-Kurztonnen sofort in Kilogramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von US-Kurztonnen in Kilogramm um (1 Kurztonne = 907,185 kg) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Die Kurztonne (2000 lb) ist die in den USA standardmäßig verwendete "Tonne" für Fracht, Fahrzeuggewichtsklassen und Massengutpreise.</p><p>Dieses Tool geht über die Kurztonne hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch die britische Langtonne und die metrische Tonne ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-Kurztonne = genau 907,18474 Kilogramm (2000 avoirdupois Pfund).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Drei verschiedene "Tonnen":</b> die US-Kurztonne (907,2 kg), die britische Langtonne (1016,0 kg) und die metrische Tonne (1000 kg) sind alle unterschiedlich.',
            ],
            howto: [
                { question: 'Wie viele Kilogramm sind in einer Tonne?', answer: '<p>1 US-Kurztonne entspricht genau 907,18474 Kilogramm.</p>' },
                { question: 'Was ist der Unterschied zwischen einer Kurz- und einer Langtonne?', answer: '<p>Die US-Kurztonne hat 2000 Pfund (907,2 kg); die britische Langtonne hat 2240 Pfund (1016,0 kg), etwa 12% schwerer.</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1100: Tonnes (Metric) to Pounds Converter
// ============================================================
const tonnesToLbs: ToolDef = {
    id: '1100',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'ton_metric' },
            { key: 'to_unit', default: 'pound_avdp' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'tonnes-to-pounds-converter',
            title: 'Tonnes (Metric) to Pounds Converter',
            h1: 'Tonnes (Metric) to Pounds Converter',
            meta_title: 'Tonnes to Pounds Converter | Convert Any Mass Unit',
            meta_description: 'Convert metric tonnes to pounds instantly, or switch to any of 25+ mass units — kilograms, short tons, long tons, and more.',
            short_answer: 'This converter changes a mass value from metric tonnes to (avoirdupois) pounds (1 tonne = 2,204.62 lb) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Metric tonnes to pounds comes up when comparing international shipping, freight, or bulk commodity weights (quoted in tonnes almost everywhere except the US) to the pound-based figures common in US logistics and trade reporting.</p><p>This tool goes beyond tonnes and pounds: the "From" and "To" dropdowns also cover the US short ton and UK long ton, plus the full range of other mass units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 metric tonne = 1,000 kg = approximately 2,204.62 avoirdupois pounds.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Not the same as a US ton:</b> a metric tonne (1,000 kg / 2,204.62 lb) is about 10% heavier than a US short ton (907.2 kg / 2,000 lb) — don\'t assume "ton" and "tonne" are interchangeable in precise contexts.',
            ],
            howto: [
                { question: 'How many pounds are in a metric tonne?', answer: '<p>1 metric tonne equals approximately 2,204.62 pounds. To convert, multiply the tonne value by 2,204.62.</p>' },
                { question: 'Is a "tonne" the same as a "ton"?', answer: '<p>Not always — "tonne" (spelled with an e) specifically refers to the 1,000 kg metric ton, while "ton" without qualification could mean the US short ton (907.2 kg) or the UK long ton (1,016.0 kg) depending on context.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-tonny-v-funty',
            title: 'Конвертер метрических тонн в фунты',
            h1: 'Конвертер метрических тонн в фунты',
            meta_title: 'Тонны в фунты | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте метрические тонны в фунты мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из метрических тонн в фунты (авердюпуа) (1 тонна = 2204,62 фунта) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Метрические тонны в фунты нужны при сравнении международных грузоперевозок или веса товаров оптом (указывается в тоннах почти везде, кроме США) с показателями в фунтах, распространёнными в американской логистике.</p><p>Этот инструмент выходит за рамки тонн и фунтов: списки "Из" и "В" также охватывают американскую короткую и британскую длинную тонну.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 метрическая тонна = 1000 кг = примерно 2204,62 фунта авердюпуа.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Не то же самое, что американская тонна:</b> метрическая тонна (1000 кг) примерно на 10% тяжелее американской короткой тонны (907,2 кг).',
            ],
            howto: [
                { question: 'Сколько фунтов в метрической тонне?', answer: '<p>1 метрическая тонна равна примерно 2204,62 фунта.</p>' },
                { question: '"Тонна" — это то же самое, что и "тонна"?', answer: '<p>Не всегда — метрическая тонна конкретно означает 1000 кг, тогда как "тонна" без уточнения может означать американскую короткую (907,2 кг) или британскую длинную (1016,0 кг).</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'tonnu-uz-marcinam-kalkulators',
            title: 'Tonnu (Metriskās) uz Mārciņām Kalkulators',
            h1: 'Tonnu (Metriskās) uz Mārciņām Kalkulators',
            meta_title: 'Tonnas uz Mārciņām | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet metriskās tonnas uz mārciņām acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no metriskajām tonnām uz mārciņām (avdp) (1 tonna = 2204,62 mārciņas) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Metriskās tonnas uz mārciņām parādās, salīdzinot starptautiskus kravu pārvadājumus vai vairumtirdzniecības preču svaru ar mārciņās izteiktiem rādītājiem, kas izplatīti ASV loģistikā.</p><p>Šis rīks sniedzas tālāk par tonnām un mārciņām: saraksti "No" un "Uz" aptver arī ASV īso un Lielbritānijas garo tonnu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 metriskā tonna = 1000 kg = aptuveni 2204,62 avdp mārciņas.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Nav tas pats, kas ASV tonna:</b> metriskā tonna (1000 kg) ir apmēram par 10% smagāka nekā ASV īsā tonna (907,2 kg).',
            ],
            howto: [
                { question: 'Cik mārciņu ir metriskajā tonnā?', answer: '<p>1 metriskā tonna ir aptuveni 2204,62 mārciņas.</p>' },
                { question: 'Vai "tonna" ir tas pats, kas "tonna"?', answer: '<p>Ne vienmēr — metriskā tonna konkrēti nozīmē 1000 kg, kamēr "tonna" bez precizējuma var nozīmēt ASV īso (907,2 kg) vai Lielbritānijas garo (1016,0 kg).</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-ton-metrycznych-na-funty',
            title: 'Kalkulator Ton (Metrycznych) na Funty',
            h1: 'Kalkulator Ton (Metrycznych) na Funty',
            meta_title: 'Tony na Funty | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz tony metryczne na funty natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z ton metrycznych na funty (avdp) (1 tona = 2204,62 funta) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Tony metryczne na funty pojawiają się przy porównywaniu międzynarodowego transportu lub wagi towarów masowych z wartościami w funtach powszechnymi w amerykańskiej logistyce.</p><p>To narzędzie wykracza poza tony i funty: listy "Z" i "Do" obejmują także amerykańską tonę krótką i brytyjską tonę długą.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 tona metryczna = 1000 kg = około 2204,62 funta avdp.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>To nie to samo, co amerykańska tona:</b> tona metryczna (1000 kg) jest o około 10% cięższa niż amerykańska tona krótka (907,2 kg).',
            ],
            howto: [
                { question: 'Ile funtów jest w tonie metrycznej?', answer: '<p>1 tona metryczna to około 2204,62 funta.</p>' },
                { question: 'Czy "tona" to to samo co "tona metryczna"?', answer: '<p>Nie zawsze — tona metryczna konkretnie oznacza 1000 kg, podczas gdy "tona" bez doprecyzowania może oznaczać amerykańską krótką (907,2 kg) lub brytyjską długą (1016,0 kg).</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-toneladas-metricas-a-libras',
            title: 'Calculadora de Toneladas (Métricas) a Libras',
            h1: 'Calculadora de Toneladas (Métricas) a Libras',
            meta_title: 'Toneladas a Libras | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte toneladas métricas a libras al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de toneladas métricas a libras (avoirdupois) (1 tonelada = 2204,62 libras) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Toneladas métricas a libras surge al comparar el transporte internacional o el peso de mercancías a granel con cifras en libras comunes en la logística estadounidense.</p><p>Esta herramienta va más allá de toneladas y libras: los menús desplegables "De" y "A" también cubren la tonelada corta estadounidense y la tonelada larga británica.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 tonelada métrica = 1000 kg = aproximadamente 2204,62 libras avoirdupois.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>No es lo mismo que una tonelada estadounidense:</b> una tonelada métrica (1000 kg) es aproximadamente un 10% más pesada que una tonelada corta estadounidense (907,2 kg).',
            ],
            howto: [
                { question: '¿Cuántas libras hay en una tonelada métrica?', answer: '<p>1 tonelada métrica equivale aproximadamente a 2204,62 libras.</p>' },
                { question: '¿Es una "tonelada" lo mismo que una "tonelada métrica"?', answer: '<p>No siempre — la tonelada métrica se refiere específicamente a 1000 kg, mientras que "tonelada" sin especificar podría significar la corta estadounidense (907,2 kg) o la larga británica (1016,0 kg).</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-de-tonnes-metriques-en-livres',
            title: 'Calculateur de Tonnes (Métriques) en Livres',
            h1: 'Calculateur de Tonnes (Métriques) en Livres',
            meta_title: 'Tonnes en Livres | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des tonnes métriques en livres instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de tonnes métriques en livres (avoirdupois) (1 tonne = 2204,62 livres) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Tonnes métriques en livres revient lors de la comparaison du transport international ou du poids de matières premières en vrac avec des chiffres en livres courants dans la logistique américaine.</p><p>Cet outil va au-delà des tonnes et des livres : les listes déroulantes « De » et « Vers » couvrent aussi la tonne courte américaine et la tonne longue britannique.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 tonne métrique = 1000 kg = environ 2204,62 livres avoirdupois.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Différent d’une tonne américaine :</b> une tonne métrique (1000 kg) est environ 10 % plus lourde qu’une tonne courte américaine (907,2 kg).',
            ],
            howto: [
                { question: 'Combien de livres y a-t-il dans une tonne métrique ?', answer: '<p>1 tonne métrique équivaut à environ 2204,62 livres.</p>' },
                { question: 'Une « tonne » est-elle la même chose qu’une « tonne métrique » ?', answer: '<p>Pas toujours — la tonne métrique désigne spécifiquement 1000 kg, tandis que « tonne » sans précision pourrait signifier la tonne courte américaine (907,2 kg) ou la tonne longue britannique (1016,0 kg).</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-tonnellate-metriche-a-libbre',
            title: 'Calcolatore da Tonnellate (Metriche) a Libbre',
            h1: 'Calcolatore da Tonnellate (Metriche) a Libbre',
            meta_title: 'Tonnellate in Libbre | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti tonnellate metriche in libbre istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da tonnellate metriche a libbre (avoirdupois) (1 tonnellata = 2204,62 libbre) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Tonnellate metriche in libbre viene usato quando si confronta il trasporto internazionale o il peso di merci sfuse con cifre in libbre comuni nella logistica statunitense.</p><p>Questo strumento va oltre tonnellate e libbre: i menu a tendina "Da" e "A" coprono anche la tonnellata corta statunitense e la tonnellata lunga britannica.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 tonnellata metrica = 1000 kg = circa 2204,62 libbre avoirdupois.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Non è lo stesso di una tonnellata statunitense:</b> una tonnellata metrica (1000 kg) è circa il 10% più pesante di una tonnellata corta statunitense (907,2 kg).',
            ],
            howto: [
                { question: 'Quante libbre ci sono in una tonnellata metrica?', answer: '<p>1 tonnellata metrica equivale a circa 2204,62 libbre.</p>' },
                { question: 'Una "tonnellata" è la stessa cosa di una "tonnellata metrica"?', answer: '<p>Non sempre — la tonnellata metrica si riferisce specificamente a 1000 kg, mentre "tonnellata" senza specificazione potrebbe significare la corta statunitense (907,2 kg) o la lunga britannica (1016,0 kg).</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'tonnen-in-pfund-rechner',
            title: 'Tonnen (Metrisch) in Pfund Rechner',
            h1: 'Tonnen (Metrisch) in Pfund Rechner',
            meta_title: 'Tonnen in Pfund | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie metrische Tonnen sofort in Pfund um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von metrischen Tonnen in (avoirdupois) Pfund um (1 Tonne = 2204,62 lb) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Metrische Tonnen in Pfund kommt vor, wenn internationale Fracht- oder Massengutgewichte mit den in der US-Logistik üblichen Pfund-Angaben verglichen werden.</p><p>Dieses Tool geht über Tonnen und Pfund hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch die US-Kurztonne und die britische Langtonne ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 metrische Tonne = 1000 kg = etwa 2204,62 avoirdupois Pfund.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Nicht dasselbe wie eine US-Tonne:</b> eine metrische Tonne (1000 kg) ist etwa 10% schwerer als eine US-Kurztonne (907,2 kg).',
            ],
            howto: [
                { question: 'Wie viele Pfund sind in einer metrischen Tonne?', answer: '<p>1 metrische Tonne entspricht etwa 2204,62 Pfund.</p>' },
                { question: 'Ist eine "Tonne" dasselbe wie eine "metrische Tonne"?', answer: '<p>Nicht immer — die metrische Tonne bezieht sich speziell auf 1000 kg, während "Tonne" ohne Präzisierung die US-Kurztonne (907,2 kg) oder die britische Langtonne (1016,0 kg) bedeuten könnte.</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 3),
        },
    },
}

// ============================================================
// 1101: Ounces to Grams Converter
// ============================================================
const ouncesToGrams: ToolDef = {
    id: '1101',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'ounce_avdp' },
            { key: 'to_unit', default: 'gram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'ounces-to-grams-converter',
            title: 'Ounces to Grams Converter',
            h1: 'Ounces to Grams Converter',
            meta_title: 'Ounces to Grams Converter | Convert Any Mass Unit',
            meta_description: 'Convert ounces to grams instantly, or switch to any of 25+ mass units — pounds, kilograms, troy ounces, and more.',
            short_answer: 'This converter changes a mass value from (avoirdupois) ounces to grams (1 oz = 28.3495 g) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>Ounces to grams is the reverse of grams-to-ounces, needed constantly for cooking (converting a US recipe\'s ounce measurements into grams), craft materials, and package weights.</p><p>This tool isn\'t limited to a single pair: the "From" and "To" dropdowns cover the full range of mass units — metric, avoirdupois, troy, and specialized units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 avoirdupois ounce = exactly 28.349523125 grams.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Common use case:</b> converting a US recipe\'s ounce-based ingredient list (e.g. "8 oz cream cheese") into grams for a kitchen scale calibrated in metric.',
            ],
            howto: [
                { question: 'How many grams are in an ounce?', answer: '<p>1 ounce equals exactly 28.349523125 grams (commonly rounded to 28 or 30 grams in casual use). To convert, multiply the ounce value by 28.3495.</p>' },
                { question: 'Can I convert grams back to ounces with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Gram and Ounce (avdp) respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-untsii-v-grammy',
            title: 'Конвертер унций в граммы',
            h1: 'Конвертер унций в граммы',
            meta_title: 'Унции в граммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте унции в граммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из унций (авердюпуа) в граммы (1 унция = 28,3495 г) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Унции в граммы — обратная конверсия к граммам в унции, постоянно нужная для кулинарии, крафтовых материалов и веса упаковок.</p><p>Этот инструмент не ограничен одной парой: списки "Из" и "В" охватывают полный диапазон единиц массы.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 унция авердюпуа = ровно 28,349523125 грамма.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Частый случай использования:</b> конвертация ингредиентов американского рецепта в унциях в граммы для кухонных весов.',
            ],
            howto: [
                { question: 'Сколько граммов в унции?', answer: '<p>1 унция равна ровно 28,349523125 грамма.</p>' },
                { question: 'Могу ли я конвертировать граммы обратно в унции этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Грамм и Унцию (авердюпуа) соответственно.</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'unci-uz-gramiem-kalkulators',
            title: 'Unci uz Gramiem Kalkulators',
            h1: 'Unci uz Gramiem Kalkulators',
            meta_title: 'Unces uz Gramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet unces uz gramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no uncēm (avdp) uz gramiem (1 unce = 28,3495 grami) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Unces uz gramiem ir pretēja konversija gramiem uz uncēm, pastāvīgi nepieciešama kulinārijai, amatniecības materiāliem un iepakojumu svaram.</p><p>Šis rīks neaprobežojas ar vienu pāri: saraksti "No" un "Uz" aptver pilnu masas vienību klāstu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 avdp unce = tieši 28,349523125 grami.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> ASV receptes unces sastāvdaļu saraksta konvertēšana gramos virtuves svariem.',
            ],
            howto: [
                { question: 'Cik gramu ir uncē?', answer: '<p>1 unce ir tieši 28,349523125 grami.</p>' },
                { question: 'Vai varu konvertēt gramus atpakaļ uz uncēm ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Gramu un Unci (avdp).</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-uncji-na-gramy',
            title: 'Kalkulator Uncji na Gramy',
            h1: 'Kalkulator Uncji na Gramy',
            meta_title: 'Uncje na Gramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz uncje na gramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z uncji (avdp) na gramy (1 uncja = 28,3495 grama) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Uncje na gramy to odwrotność gramów na uncje, stale potrzebna w gotowaniu, materiałach rzemieślniczych i wagach opakowań.</p><p>To narzędzie nie ogranicza się do jednej pary: listy "Z" i "Do" obejmują pełny zakres jednostek masy.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 uncja avdp = dokładnie 28,349523125 grama.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Częsty przypadek użycia:</b> przeliczanie listy składników amerykańskiego przepisu w uncjach na gramy dla wagi kuchennej.',
            ],
            howto: [
                { question: 'Ile gramów jest w uncji?', answer: '<p>1 uncja to dokładnie 28,349523125 grama.</p>' },
                { question: 'Czy mogę przeliczyć gramy z powrotem na uncje tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Gram i Uncję (avdp).</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-onzas-a-gramos',
            title: 'Calculadora de Onzas a Gramos',
            h1: 'Calculadora de Onzas a Gramos',
            meta_title: 'Onzas a Gramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte onzas a gramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de onzas (avoirdupois) a gramos (1 oz = 28,3495 g) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>Onzas a gramos es la conversión inversa de gramos a onzas, necesaria constantemente en cocina, materiales de manualidades y pesos de paquetes.</p><p>Esta herramienta no se limita a un solo par: los menús desplegables "De" y "A" cubren toda la gama de unidades de masa.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 onza avoirdupois = exactamente 28,349523125 gramos.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Caso de uso común:</b> convertir la lista de ingredientes en onzas de una receta estadounidense a gramos para una báscula de cocina métrica.',
            ],
            howto: [
                { question: '¿Cuántos gramos hay en una onza?', answer: '<p>1 onza equivale exactamente a 28,349523125 gramos.</p>' },
                { question: '¿Puedo convertir gramos de vuelta a onzas con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Gramo y Onza (avdp) respectivamente.</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-donces-en-grammes',
            title: 'Calculateur d’Onces en Grammes',
            h1: 'Calculateur d’Onces en Grammes',
            meta_title: 'Onces en Grammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des onces en grammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse d’onces (avoirdupois) en grammes (1 once = 28,3495 g) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Onces en grammes est l’inverse de grammes en onces, nécessaire constamment en cuisine, pour les matériaux d’artisanat et les poids de colis.</p><p>Cet outil ne se limite pas à une seule paire : les listes déroulantes « De » et « Vers » couvrent toute la gamme des unités de masse.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 once avoirdupois = exactement 28,349523125 grammes.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Cas d’usage courant :</b> convertir la liste d’ingrédients en onces d’une recette américaine en grammes pour une balance de cuisine métrique.',
            ],
            howto: [
                { question: 'Combien de grammes y a-t-il dans une once ?', answer: '<p>1 once équivaut exactement à 28,349523125 grammes.</p>' },
                { question: 'Puis-je convertir des grammes en onces avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Gramme et Once (avdp) respectivement.</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-once-a-grammi',
            title: 'Calcolatore da Once a Grammi',
            h1: 'Calcolatore da Once a Grammi',
            meta_title: 'Once in Grammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti once in grammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da once (avoirdupois) a grammi (1 oz = 28,3495 g) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Once in grammi è l’inverso di grammi in once, necessaria costantemente in cucina, per materiali artigianali e pesi di pacchi.</p><p>Questo strumento non si limita a una singola coppia: i menu a tendina "Da" e "A" coprono l’intera gamma di unità di massa.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 oncia avoirdupois = esattamente 28,349523125 grammi.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Caso d’uso comune:</b> convertire la lista di ingredienti in once di una ricetta statunitense in grammi per una bilancia da cucina metrica.',
            ],
            howto: [
                { question: 'Quanti grammi ci sono in un’oncia?', answer: '<p>1 oncia equivale esattamente a 28,349523125 grammi.</p>' },
                { question: 'Posso convertire i grammi in once con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Grammo e Oncia (avdp).</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'unze-in-gramm-rechner',
            title: 'Unze in Gramm Rechner',
            h1: 'Unze in Gramm Rechner',
            meta_title: 'Unze in Gramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Unzen sofort in Gramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von (avoirdupois) Unzen in Gramm um (1 oz = 28,3495 g) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Unzen in Gramm ist die Umkehrung von Gramm in Unzen, ständig benötigt beim Kochen, für Bastelmaterialien und Paketgewichte.</p><p>Dieses Tool beschränkt sich nicht auf ein einziges Paar: die Dropdown-Menüs "Von" und "Zu" decken die gesamte Bandbreite an Masseeinheiten ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 avoirdupois Unze = genau 28,349523125 Gramm.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung einer US-Rezeptzutatenliste in Unzen in Gramm für eine metrische Küchenwaage.',
            ],
            howto: [
                { question: 'Wie viele Gramm sind in einer Unze?', answer: '<p>1 Unze entspricht genau 28,349523125 Gramm.</p>' },
                { question: 'Kann ich mit diesem Tool Gramm zurück in Unzen umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Gramm bzw. Unze (avdp).</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 3),
        },
    },
}

// ============================================================
// 1102: Ounces (Troy) to Grams Converter
// ============================================================
const troyOuncesToGrams: ToolDef = {
    id: '1102',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'ounce_troy' },
            { key: 'to_unit', default: 'gram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'troy-ounces-to-grams-converter',
            title: 'Ounces (Troy) to Grams Converter',
            h1: 'Ounces (Troy) to Grams Converter',
            meta_title: 'Troy Ounces to Grams Converter | Convert Any Mass Unit',
            meta_description: 'Convert troy ounces to grams instantly, or switch to any of 25+ mass units — pennyweight, grains, avoirdupois ounces, and more.',
            short_answer: 'This converter changes a mass value from troy ounces to grams (1 troy oz = 31.1035 g) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>The troy ounce is the standard unit for pricing and weighing precious metals worldwide — gold, silver, platinum, and palladium are quoted "per troy ounce," not the everyday avoirdupois ounce.</p><p>This tool goes beyond troy ounces and grams: the "From" and "To" dropdowns also cover pennyweight and troy grain (both part of the same historical system), plus the full range of other mass units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 troy ounce = exactly 31.1034768 grams (480 grains).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Not the same as a regular ounce:</b> a troy ounce (31.10 g) is about 10% heavier than an avoirdupois ounce (28.35 g) — precious metal prices always use the troy ounce specifically.',
            ],
            howto: [
                { question: 'How many grams are in a troy ounce?', answer: '<p>1 troy ounce equals exactly 31.1034768 grams. To convert, multiply the troy ounce value by 31.1034768.</p>' },
                { question: 'Why do gold and silver use troy ounces instead of regular ounces?', answer: '<p>The troy weight system has been the traditional standard for precious metals and gemstones for centuries, predating and remaining separate from the everyday avoirdupois system used for most other goods.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-troyskie-untsii-v-grammy',
            title: 'Конвертер тройских унций в граммы',
            h1: 'Конвертер тройских унций в граммы',
            meta_title: 'Тройские унции в граммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте тройские унции в граммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из тройских унций в граммы (1 тройская унция = 31,1035 г) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Тройская унция — стандартная единица для ценообразования и взвешивания драгоценных металлов по всему миру — золото, серебро, платина и палладий котируются "за тройскую унцию".</p><p>Этот инструмент выходит за рамки тройских унций и граммов: списки "Из" и "В" также охватывают пеннивейт и тройский гран.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 тройская унция = ровно 31,1034768 грамма (480 гран).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Не то же самое, что обычная унция:</b> тройская унция (31,10 г) примерно на 10% тяжелее унции авердюпуа (28,35 г).',
            ],
            howto: [
                { question: 'Сколько граммов в тройской унции?', answer: '<p>1 тройская унция равна ровно 31,1034768 грамма.</p>' },
                { question: 'Почему золото и серебро используют тройские унции вместо обычных?', answer: '<p>Тройская система весов была традиционным стандартом для драгоценных металлов и драгоценных камней на протяжении веков.</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'trojas-uncu-uz-gramiem-kalkulators',
            title: 'Unci (Trojas) uz Gramiem Kalkulators',
            h1: 'Unci (Trojas) uz Gramiem Kalkulators',
            meta_title: 'Trojas Unces uz Gramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet trojas unces uz gramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no trojas uncēm uz gramiem (1 trojas unce = 31,1035 grami) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Trojas unce ir standarta vienība dārgmetālu cenošanai un svēršanai visā pasaulē — zelts, sudrabs, platīns un pallādijs tiek kotēti "par trojas unci".</p><p>Šis rīks sniedzas tālāk par trojas uncēm un gramiem: saraksti "No" un "Uz" aptver arī pennveitu un trojas granu.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 trojas unce = tieši 31,1034768 grami (480 grani).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Nav tas pats, kas parasta unce:</b> trojas unce (31,10 g) ir apmēram par 10% smagāka nekā avdp unce (28,35 g).',
            ],
            howto: [
                { question: 'Cik gramu ir trojas uncē?', answer: '<p>1 trojas unce ir tieši 31,1034768 grami.</p>' },
                { question: 'Kāpēc zelts un sudrabs izmanto trojas unces, nevis parastās?', answer: '<p>Trojas svaru sistēma gadsimtiem ilgi bijusi tradicionālais standarts dārgmetāliem un dārgakmeņiem.</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-uncji-trojanskich-na-gramy',
            title: 'Kalkulator Uncji (Trojańskich) na Gramy',
            h1: 'Kalkulator Uncji (Trojańskich) na Gramy',
            meta_title: 'Uncje Trojańskie na Gramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz uncje trojańskie na gramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z uncji trojańskich na gramy (1 uncja trojańska = 31,1035 grama) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Uncja trojańska to standardowa jednostka do wyceny i ważenia metali szlachetnych na całym świecie — złoto, srebro, platyna i pallad są notowane "za uncję trojańską".</p><p>To narzędzie wykracza poza uncje trojańskie i gramy: listy "Z" i "Do" obejmują także pennyweight i grain trojański.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 uncja trojańska = dokładnie 31,1034768 grama (480 grainów).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>To nie to samo, co zwykła uncja:</b> uncja trojańska (31,10 g) jest o około 10% cięższa niż uncja avdp (28,35 g).',
            ],
            howto: [
                { question: 'Ile gramów jest w uncji trojańskiej?', answer: '<p>1 uncja trojańska to dokładnie 31,1034768 grama.</p>' },
                { question: 'Dlaczego złoto i srebro używają uncji trojańskich zamiast zwykłych?', answer: '<p>System wag trojańskich od wieków jest tradycyjnym standardem dla metali szlachetnych i kamieni szlachetnych.</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-onzas-troy-a-gramos',
            title: 'Calculadora de Onzas (Troy) a Gramos',
            h1: 'Calculadora de Onzas (Troy) a Gramos',
            meta_title: 'Onzas Troy a Gramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte onzas troy a gramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de onzas troy a gramos (1 onza troy = 31,1035 g) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>La onza troy es la unidad estándar para fijar precios y pesar metales preciosos en todo el mundo — el oro, la plata, el platino y el paladio se cotizan "por onza troy".</p><p>Esta herramienta va más allá de las onzas troy y los gramos: los menús desplegables "De" y "A" también cubren el pennyweight y el grano troy.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 onza troy = exactamente 31,1034768 gramos (480 granos).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>No es lo mismo que una onza normal:</b> una onza troy (31,10 g) es aproximadamente un 10% más pesada que una onza avoirdupois (28,35 g).',
            ],
            howto: [
                { question: '¿Cuántos gramos hay en una onza troy?', answer: '<p>1 onza troy equivale exactamente a 31,1034768 gramos.</p>' },
                { question: '¿Por qué el oro y la plata usan onzas troy en lugar de onzas normales?', answer: '<p>El sistema de peso troy ha sido el estándar tradicional para metales preciosos y piedras preciosas durante siglos.</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-donces-troy-en-grammes',
            title: 'Calculateur d’Onces (Troy) en Grammes',
            h1: 'Calculateur d’Onces (Troy) en Grammes',
            meta_title: 'Onces Troy en Grammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des onces troy en grammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse d’onces troy en grammes (1 once troy = 31,1035 g) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>L’once troy est l’unité standard pour la tarification et la pesée des métaux précieux dans le monde entier — l’or, l’argent, le platine et le palladium sont cotés « par once troy ».</p><p>Cet outil va au-delà des onces troy et des grammes : les listes déroulantes « De » et « Vers » couvrent aussi le pennyweight et le grain troy.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 once troy = exactement 31,1034768 grammes (480 grains).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Différent d’une once normale :</b> une once troy (31,10 g) est environ 10 % plus lourde qu’une once avoirdupois (28,35 g).',
            ],
            howto: [
                { question: 'Combien de grammes y a-t-il dans une once troy ?', answer: '<p>1 once troy équivaut exactement à 31,1034768 grammes.</p>' },
                { question: 'Pourquoi l’or et l’argent utilisent-ils des onces troy plutôt que des onces normales ?', answer: '<p>Le système de poids troy est la norme traditionnelle pour les métaux précieux et pierres précieuses depuis des siècles.</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-once-troy-a-grammi',
            title: 'Calcolatore da Once (Troy) a Grammi',
            h1: 'Calcolatore da Once (Troy) a Grammi',
            meta_title: 'Once Troy in Grammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti once troy in grammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da once troy a grammi (1 oncia troy = 31,1035 g) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>L’oncia troy è l’unità standard per la determinazione del prezzo e la pesatura dei metalli preziosi in tutto il mondo — oro, argento, platino e palladio sono quotati "per oncia troy".</p><p>Questo strumento va oltre le once troy e i grammi: i menu a tendina "Da" e "A" coprono anche il pennyweight e il grano troy.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 oncia troy = esattamente 31,1034768 grammi (480 grani).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Non è lo stesso di un’oncia normale:</b> un’oncia troy (31,10 g) è circa il 10% più pesante di un’oncia avoirdupois (28,35 g).',
            ],
            howto: [
                { question: 'Quanti grammi ci sono in un’oncia troy?', answer: '<p>1 oncia troy equivale esattamente a 31,1034768 grammi.</p>' },
                { question: 'Perché oro e argento usano once troy invece di once normali?', answer: '<p>Il sistema di peso troy è lo standard tradizionale per metalli preziosi e pietre preziose da secoli.</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'feinunze-in-gramm-rechner',
            title: 'Feinunze (Troy) in Gramm Rechner',
            h1: 'Feinunze (Troy) in Gramm Rechner',
            meta_title: 'Feinunzen in Gramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Feinunzen sofort in Gramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von Feinunzen (Troy) in Gramm um (1 Feinunze = 31,1035 g) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Die Feinunze (Troy-Unze) ist die weltweite Standardeinheit für die Preisgestaltung und Wägung von Edelmetallen — Gold, Silber, Platin und Palladium werden "pro Feinunze" notiert.</p><p>Dieses Tool geht über Feinunzen und Gramm hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch Pennyweight und Troy-Grain ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Feinunze = genau 31,1034768 Gramm (480 Grains).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Nicht dasselbe wie eine normale Unze:</b> eine Feinunze (31,10 g) ist etwa 10% schwerer als eine avoirdupois Unze (28,35 g).',
            ],
            howto: [
                { question: 'Wie viele Gramm sind in einer Feinunze?', answer: '<p>1 Feinunze entspricht genau 31,1034768 Gramm.</p>' },
                { question: 'Warum verwenden Gold und Silber Feinunzen statt normaler Unzen?', answer: '<p>Das Troy-Gewichtssystem ist seit Jahrhunderten der traditionelle Standard für Edelmetalle und Edelsteine.</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1103: Carats to Grams Converter
// ============================================================
const caratsToGrams: ToolDef = {
    id: '1103',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'carat_metric' },
            { key: 'to_unit', default: 'gram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'carats-to-grams-converter',
            title: 'Carats (Metric) to Grams Converter',
            h1: 'Carats (Metric) to Grams Converter',
            meta_title: 'Carats to Grams Converter | Convert Any Mass Unit',
            meta_description: 'Convert metric carats to grams instantly, or switch to any of 25+ mass units — points, grains, troy ounces, and more.',
            short_answer: 'This converter changes a mass value from metric carats to grams (1 carat = 0.2 g exactly) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>The carat is the international standard unit for weighing diamonds and other gemstones, standardized in 1907 to exactly 200 milligrams so that gem weights would be consistent worldwide.</p><p>This tool goes beyond carats and grams: the "From" and "To" dropdowns also cover the gemological "point" (1/100 of a carat) plus the full range of other mass units, including troy units for precious metal settings.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 metric carat = exactly 0.2 grams (200 milligrams), an internationally standardized value since 1907.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>Don\'t confuse "carat" with "karat":</b> carat (gemstone weight) is completely different from karat (gold purity, e.g. "18 karat gold") — they sound alike but measure different things entirely.',
            ],
            howto: [
                { question: 'How many grams are in a carat?', answer: '<p>1 metric carat equals exactly 0.2 grams (200 mg). To convert, multiply the carat value by 0.2.</p>' },
                { question: 'What is a "point" in gemstone weight?', answer: '<p>A point is 1/100 of a carat (2 mg) — used for very precise small-stone weights, e.g. "75 points" means 0.75 carats.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-karaty-v-grammy',
            title: 'Конвертер каратов (метрических) в граммы',
            h1: 'Конвертер каратов (метрических) в граммы',
            meta_title: 'Караты в граммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте метрические караты в граммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из метрических каратов в граммы (1 карат = ровно 0,2 г) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Карат — международная стандартная единица для взвешивания бриллиантов и других драгоценных камней, стандартизированная в 1907 году как ровно 200 миллиграммов.</p><p>Этот инструмент выходит за рамки каратов и граммов: списки "Из" и "В" также охватывают геммологический "пойнт" (1/100 карата).</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 метрический карат = ровно 0,2 грамма (200 миллиграммов), международно стандартизированное значение с 1907 года.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Не путайте "карат" (веса) с "каратом" (пробы золота):</b> это разные понятия, звучащие похоже, но измеряющие совершенно разное.',
            ],
            howto: [
                { question: 'Сколько граммов в карате?', answer: '<p>1 метрический карат равен ровно 0,2 грамма (200 мг).</p>' },
                { question: 'Что такое "пойнт" в весе драгоценных камней?', answer: '<p>Пойнт — это 1/100 карата (2 мг) — используется для очень точного веса маленьких камней, например "75 пойнтов" означает 0,75 карата.</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'karatu-uz-gramiem-kalkulators',
            title: 'Karātu (Metrisko) uz Gramiem Kalkulators',
            h1: 'Karātu (Metrisko) uz Gramiem Kalkulators',
            meta_title: 'Karāti uz Gramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet metriskos karātus uz gramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no metriskiem karātiem uz gramiem (1 karāts = tieši 0,2 grami) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Karāts ir starptautiska standarta vienība dimantu un citu dārgakmeņu svēršanai, standartizēta 1907. gadā kā tieši 200 miligrami.</p><p>Šis rīks sniedzas tālāk par karātiem un gramiem: saraksti "No" un "Uz" aptver arī gemoloģisko "punktu" (1/100 no karāta).</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 metriskais karāts = tieši 0,2 grami (200 miligrami), starptautiski standartizēta vērtība kopš 1907. gada.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>Nesajauciet "karātu" (svars) ar "karāti" (zelta prove):</b> tie ir pilnīgi atšķirīgi jēdzieni, kas izklausās līdzīgi.',
            ],
            howto: [
                { question: 'Cik gramu ir karātā?', answer: '<p>1 metriskais karāts ir tieši 0,2 grami (200 mg).</p>' },
                { question: 'Kas ir "punkts" dārgakmeņu svarā?', answer: '<p>Punkts ir 1/100 no karāta (2 mg) — izmanto ļoti precīziem mazu akmeņu svariem, piemēram, "75 punkti" nozīmē 0,75 karātus.</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-karatow-na-gramy',
            title: 'Kalkulator Karatów (Metrycznych) na Gramy',
            h1: 'Kalkulator Karatów (Metrycznych) na Gramy',
            meta_title: 'Karaty na Gramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz karaty metryczne na gramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z karatów metrycznych na gramy (1 karat = dokładnie 0,2 grama) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Karat to międzynarodowa standardowa jednostka do ważenia diamentów i innych kamieni szlachetnych, znormalizowana w 1907 roku do dokładnie 200 miligramów.</p><p>To narzędzie wykracza poza karaty i gramy: listy "Z" i "Do" obejmują także gemologiczny "punkt" (1/100 karata).</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 karat metryczny = dokładnie 0,2 grama (200 miligramów), międzynarodowo znormalizowana wartość od 1907 roku.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Nie myl "karata" (waga) z "karatem" (próba złota):</b> to zupełnie różne pojęcia, które brzmią podobnie.',
            ],
            howto: [
                { question: 'Ile gramów jest w karacie?', answer: '<p>1 karat metryczny to dokładnie 0,2 grama (200 mg).</p>' },
                { question: 'Co to jest "punkt" w wadze kamieni szlachetnych?', answer: '<p>Punkt to 1/100 karata (2 mg) — używany do bardzo precyzyjnych wag małych kamieni, np. "75 punktów" oznacza 0,75 karata.</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-quilates-a-gramos',
            title: 'Calculadora de Quilates (Métricos) a Gramos',
            h1: 'Calculadora de Quilates (Métricos) a Gramos',
            meta_title: 'Quilates a Gramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte quilates métricos a gramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa de quilates métricos a gramos (1 quilate = exactamente 0,2 g) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>El quilate es la unidad estándar internacional para pesar diamantes y otras piedras preciosas, estandarizada en 1907 a exactamente 200 miligramos.</p><p>Esta herramienta va más allá de quilates y gramos: los menús desplegables "De" y "A" también cubren el "punto" gemológico (1/100 de quilate).</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 quilate métrico = exactamente 0,2 gramos (200 miligramos), un valor estandarizado internacionalmente desde 1907.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>No confundas "quilate" (peso) con "quilate" (pureza del oro):</b> son conceptos completamente diferentes que suenan parecido.',
            ],
            howto: [
                { question: '¿Cuántos gramos hay en un quilate?', answer: '<p>1 quilate métrico equivale exactamente a 0,2 gramos (200 mg).</p>' },
                { question: '¿Qué es un "punto" en el peso de piedras preciosas?', answer: '<p>Un punto es 1/100 de quilate (2 mg) — usado para pesos muy precisos de piedras pequeñas, p. ej. "75 puntos" significa 0,75 quilates.</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-carats-en-grammes',
            title: 'Calculateur de Carats (Métriques) en Grammes',
            h1: 'Calculateur de Carats (Métriques) en Grammes',
            meta_title: 'Carats en Grammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des carats métriques en grammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse de carats métriques en grammes (1 carat = exactement 0,2 g) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Le carat est l’unité standard internationale pour peser les diamants et autres pierres précieuses, normalisée en 1907 à exactement 200 milligrammes.</p><p>Cet outil va au-delà des carats et des grammes : les listes déroulantes « De » et « Vers » couvrent aussi le « point » gemmologique (1/100 de carat).</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 carat métrique = exactement 0,2 gramme (200 milligrammes), une valeur normalisée internationalement depuis 1907.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Ne confondez pas « carat » (poids) et « carat » (pureté de l’or) :</b> ce sont des concepts totalement différents qui se ressemblent à l’oral.',
            ],
            howto: [
                { question: 'Combien de grammes y a-t-il dans un carat ?', answer: '<p>1 carat métrique équivaut exactement à 0,2 gramme (200 mg).</p>' },
                { question: 'Qu’est-ce qu’un « point » dans le poids des pierres précieuses ?', answer: '<p>Un point est 1/100 de carat (2 mg) — utilisé pour les poids très précis de petites pierres, par ex. « 75 points » signifie 0,75 carat.</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-carati-a-grammi',
            title: 'Calcolatore da Carati (Metrici) a Grammi',
            h1: 'Calcolatore da Carati (Metrici) a Grammi',
            meta_title: 'Carati in Grammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti carati metrici in grammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa da carati metrici a grammi (1 carato = esattamente 0,2 g) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Il carato è l’unità standard internazionale per pesare diamanti e altre pietre preziose, standardizzata nel 1907 a esattamente 200 milligrammi.</p><p>Questo strumento va oltre carati e grammi: i menu a tendina "Da" e "A" coprono anche il "punto" gemmologico (1/100 di carato).</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 carato metrico = esattamente 0,2 grammi (200 milligrammi), un valore standardizzato a livello internazionale dal 1907.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>Non confondere "carato" (peso) con "carato" (purezza dell’oro):</b> sono concetti completamente diversi che suonano simili.',
            ],
            howto: [
                { question: 'Quanti grammi ci sono in un carato?', answer: '<p>1 carato metrico equivale esattamente a 0,2 grammi (200 mg).</p>' },
                { question: 'Cos’è un "punto" nel peso delle pietre preziose?', answer: '<p>Un punto è 1/100 di carato (2 mg) — usato per pesi molto precisi di pietre piccole, ad es. "75 punti" significa 0,75 carati.</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'karat-in-gramm-rechner',
            title: 'Karat (Metrisch) in Gramm Rechner',
            h1: 'Karat (Metrisch) in Gramm Rechner',
            meta_title: 'Karat in Gramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie metrische Karat sofort in Gramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert von metrischen Karat in Gramm um (1 Karat = genau 0,2 g) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Das Karat ist die internationale Standardeinheit zum Wiegen von Diamanten und anderen Edelsteinen, 1907 auf genau 200 Milligramm standardisiert.</p><p>Dieses Tool geht über Karat und Gramm hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch den gemmologischen "Point" (1/100 Karat) ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 metrisches Karat = genau 0,2 Gramm (200 Milligramm), ein international standardisierter Wert seit 1907.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>Verwechseln Sie nicht "Karat" (Gewicht) mit "Karat" (Goldreinheit):</b> das sind völlig unterschiedliche Konzepte, die ähnlich klingen.',
            ],
            howto: [
                { question: 'Wie viele Gramm sind in einem Karat?', answer: '<p>1 metrisches Karat entspricht genau 0,2 Gramm (200 mg).</p>' },
                { question: 'Was ist ein "Point" beim Edelsteingewicht?', answer: '<p>Ein Point ist 1/100 Karat (2 mg) — wird für sehr präzise Gewichte kleiner Steine verwendet, z.B. bedeutet "75 Points" 0,75 Karat.</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1104: Hundredweight (Short) to Kilograms Converter
// ============================================================
const hundredweightToKg: ToolDef = {
    id: '1104',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'hundredweight_short' },
            { key: 'to_unit', default: 'kilogram' },
        ],
        functions: {
            result: { type: 'function', functionName: 'massConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'hundredweight-to-kilograms-converter',
            title: 'Hundredweight (Short) to Kilograms Converter',
            h1: 'Hundredweight (Short) to Kilograms Converter',
            meta_title: 'Hundredweight to Kilograms Converter | Convert Any Mass Unit',
            meta_description: 'Convert hundredweight to kilograms instantly, or switch to any of 25+ mass units — long hundredweight, tons, pounds, and more.',
            short_answer: 'This converter changes a mass value from the U.S. (short) hundredweight to kilograms (1 cwt = 45.359 kg) — and can convert between over 25 mass units using the selectors below.',
            intro_text: '<p>The hundredweight (abbreviated "cwt") is still used in the US for agricultural commodity pricing (grain, livestock feed, some produce) and in the UK/Commonwealth for certain traditional trade contexts, though the two definitions differ.</p><p>This tool goes beyond the US hundredweight: the "From" and "To" dropdowns also cover the UK long hundredweight (a different size) plus the full range of other mass units.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 U.S. (short) hundredweight = exactly 45.359237 kilograms (100 avoirdupois pounds).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the 25+ supported mass units.',
                '<b>US and UK hundredweights differ:</b> the US short hundredweight is 100 lb (45.36 kg), while the UK long hundredweight is 112 lb (50.80 kg) — about 12% heavier.',
            ],
            howto: [
                { question: 'How many kilograms are in a hundredweight?', answer: '<p>1 U.S. (short) hundredweight equals exactly 45.359237 kilograms. To convert, multiply the hundredweight value by 45.359237.</p>' },
                { question: 'Why does the US hundredweight differ from the UK one?', answer: '<p>The US system defines it as exactly 100 pounds for simplicity, while the traditional British system defines it as 112 pounds (8 stone) — a historical difference that persists in agricultural and commodity trading terminology today.</p>' },
            ],
            inputs: massInputs('en', '1'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-centner-v-kilogrammy',
            title: 'Конвертер центнеров (коротких) в килограммы',
            h1: 'Конвертер центнеров (коротких) в килограммы',
            meta_title: 'Центнер в килограммы | Конвертер любых единиц массы',
            meta_description: 'Конвертируйте центнеры в килограммы мгновенно, или переключитесь на любую из 25+ единиц массы.',
            short_answer: 'Этот конвертер переводит значение массы из американского (короткого) центнера в килограммы (1 центнер = 45,359 кг) — а также может конвертировать между более чем 25 единицами массы.',
            intro_text: '<p>Центнер (сокращённо "cwt") всё ещё используется в США для ценообразования сельскохозяйственных товаров (зерно, корма, некоторые продукты) и в Великобритании для некоторых традиционных торговых контекстов.</p><p>Этот инструмент выходит за рамки американского центнера: списки "Из" и "В" также охватывают британский длинный центнер.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 американский (короткий) центнер = ровно 45,359237 килограмма (100 фунтов авердюпуа).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя из более чем 25 единиц массы.',
                '<b>Американский и британский центнеры отличаются:</b> американский короткий — 100 фунтов (45,36 кг), британский длинный — 112 фунтов (50,80 кг).',
            ],
            howto: [
                { question: 'Сколько килограммов в центнере?', answer: '<p>1 американский (короткий) центнер равен ровно 45,359237 килограмма.</p>' },
                { question: 'Почему американский центнер отличается от британского?', answer: '<p>Американская система определяет его как ровно 100 фунтов для простоты, тогда как традиционная британская система определяет его как 112 фунтов (8 стоунов).</p>' },
            ],
            inputs: massInputs('ru', '1'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'sentnera-uz-kilogramiem-kalkulators',
            title: 'Sentnera (Īsā) uz Kilogramiem Kalkulators',
            h1: 'Sentnera (Īsā) uz Kilogramiem Kalkulators',
            meta_title: 'Sentners uz Kilogramiem | Jebkuras Masas Vienības Konvertētājs',
            meta_description: 'Konvertējiet sentneru uz kilogramiem acumirklī, vai pārslēdzieties uz jebkuru no 25+ masas vienībām.',
            short_answer: 'Šis konvertētājs pārvērš masas vērtību no ASV (īsā) sentnera uz kilogramiem (1 sentners = 45,359 kg) — un var konvertēt starp vairāk nekā 25 masas vienībām.',
            intro_text: '<p>Sentners (saīsināti "cwt") joprojām tiek izmantots ASV lauksaimniecības preču cenošanai (graudi, lopbarība, daži produkti) un Lielbritānijā/Sadraudzībā dažos tradicionālos tirdzniecības kontekstos.</p><p>Šis rīks sniedzas tālāk par ASV sentneru: saraksti "No" un "Uz" aptver arī Lielbritānijas garo sentneru.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 ASV (īsais) sentners = tieši 45,359237 kilogrami (100 avdp mārciņas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām no vairāk nekā 25 masas vienībām.',
                '<b>ASV un Lielbritānijas sentneri atšķiras:</b> ASV īsais ir 100 mārciņas (45,36 kg), Lielbritānijas garais ir 112 mārciņas (50,80 kg).',
            ],
            howto: [
                { question: 'Cik kilogramu ir sentnerā?', answer: '<p>1 ASV (īsais) sentners ir tieši 45,359237 kilogrami.</p>' },
                { question: 'Kāpēc ASV sentners atšķiras no Lielbritānijas?', answer: '<p>ASV sistēma to definē kā tieši 100 mārciņas vienkāršības labad, kamēr tradicionālā britu sistēma to definē kā 112 mārciņas (8 stouni).</p>' },
            ],
            inputs: massInputs('lv', '1'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-centnara-na-kilogramy',
            title: 'Kalkulator Centnara (Krótkiego) na Kilogramy',
            h1: 'Kalkulator Centnara (Krótkiego) na Kilogramy',
            meta_title: 'Centnar na Kilogramy | Konwerter Dowolnej Jednostki Masy',
            meta_description: 'Przelicz centnar na kilogramy natychmiast lub przełącz się na dowolną z 25+ jednostek masy.',
            short_answer: 'Ten konwerter zmienia wartość masy z amerykańskiego (krótkiego) centnara na kilogramy (1 cwt = 45,359 kg) — może też przeliczać między ponad 25 jednostkami masy.',
            intro_text: '<p>Centnar (skrót "cwt") jest wciąż używany w USA do wyceny towarów rolnych (zboże, pasza, niektóre produkty) oraz w Wielkiej Brytanii/Wspólnocie Narodów w niektórych tradycyjnych kontekstach handlowych.</p><p>To narzędzie wykracza poza amerykański centnar: listy "Z" i "Do" obejmują także brytyjski centnar długi.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 amerykański (krótki) centnar = dokładnie 45,359237 kilograma (100 funtów avdp).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema z ponad 25 jednostek masy.',
                '<b>Amerykański i brytyjski centnar różnią się:</b> amerykański krótki to 100 funtów (45,36 kg), brytyjski długi to 112 funtów (50,80 kg).',
            ],
            howto: [
                { question: 'Ile kilogramów jest w centnarze?', answer: '<p>1 amerykański (krótki) centnar to dokładnie 45,359237 kilograma.</p>' },
                { question: 'Dlaczego amerykański centnar różni się od brytyjskiego?', answer: '<p>System amerykański definiuje go jako dokładnie 100 funtów dla uproszczenia, podczas gdy tradycyjny system brytyjski definiuje go jako 112 funtów (8 stone).</p>' },
            ],
            inputs: massInputs('pl', '1'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-quintal-a-kilogramos',
            title: 'Calculadora de Quintal (Corto) a Kilogramos',
            h1: 'Calculadora de Quintal (Corto) a Kilogramos',
            meta_title: 'Quintal a Kilogramos | Convertidor de Cualquier Unidad de Masa',
            meta_description: 'Convierte quintales a kilogramos al instante, o cambia a cualquiera de más de 25 unidades de masa.',
            short_answer: 'Esta calculadora cambia un valor de masa del quintal estadounidense (corto) a kilogramos (1 cwt = 45,359 kg) — y puede convertir entre más de 25 unidades de masa.',
            intro_text: '<p>El quintal (abreviado "cwt") todavía se usa en EE. UU. para la fijación de precios de productos agrícolas (grano, pienso, algunos productos) y en el Reino Unido para ciertos contextos comerciales tradicionales.</p><p>Esta herramienta va más allá del quintal estadounidense: los menús desplegables "De" y "A" también cubren el quintal largo británico.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 quintal (corto) estadounidense = exactamente 45,359237 kilogramos (100 libras avoirdupois).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos cualesquiera de las más de 25 unidades de masa.',
                '<b>Los quintales estadounidense y británico difieren:</b> el corto estadounidense son 100 libras (45,36 kg), el largo británico son 112 libras (50,80 kg).',
            ],
            howto: [
                { question: '¿Cuántos kilogramos hay en un quintal?', answer: '<p>1 quintal (corto) estadounidense equivale exactamente a 45,359237 kilogramos.</p>' },
                { question: '¿Por qué el quintal estadounidense difiere del británico?', answer: '<p>El sistema estadounidense lo define como exactamente 100 libras por simplicidad, mientras que el sistema británico tradicional lo define como 112 libras (8 stone).</p>' },
            ],
            inputs: massInputs('es', '1'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-de-quintal-en-kilogrammes',
            title: 'Calculateur de Quintal (Court) en Kilogrammes',
            h1: 'Calculateur de Quintal (Court) en Kilogrammes',
            meta_title: 'Quintal en Kilogrammes | Convertisseur de Toute Unité de Masse',
            meta_description: 'Convertissez des quintaux en kilogrammes instantanément, ou passez à l’une des 25+ unités de masse.',
            short_answer: 'Ce calculateur transforme une valeur de masse du quintal américain (court) en kilogrammes (1 cwt = 45,359 kg) — et peut convertir entre plus de 25 unités de masse.',
            intro_text: '<p>Le quintal (abrégé « cwt ») est encore utilisé aux États-Unis pour la tarification des produits agricoles (céréales, aliments pour bétail, certains produits) et au Royaume-Uni dans certains contextes commerciaux traditionnels.</p><p>Cet outil va au-delà du quintal américain : les listes déroulantes « De » et « Vers » couvrent aussi le quintal long britannique.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 quintal (court) américain = exactement 45,359237 kilogrammes (100 livres avoirdupois).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux des plus de 25 unités de masse prises en charge.',
                '<b>Les quintaux américain et britannique diffèrent :</b> le court américain fait 100 livres (45,36 kg), le long britannique fait 112 livres (50,80 kg).',
            ],
            howto: [
                { question: 'Combien de kilogrammes y a-t-il dans un quintal ?', answer: '<p>1 quintal (court) américain équivaut exactement à 45,359237 kilogrammes.</p>' },
                { question: 'Pourquoi le quintal américain diffère-t-il du britannique ?', answer: '<p>Le système américain le définit comme exactement 100 livres pour simplifier, tandis que le système britannique traditionnel le définit comme 112 livres (8 stone).</p>' },
            ],
            inputs: massInputs('fr', '1'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-quintale-a-chilogrammi',
            title: 'Calcolatore da Quintale (Corto) a Chilogrammi',
            h1: 'Calcolatore da Quintale (Corto) a Chilogrammi',
            meta_title: 'Quintale in Chilogrammi | Convertitore di Qualsiasi Unità di Massa',
            meta_description: 'Converti quintali in chilogrammi istantaneamente, o passa a una delle 25+ unità di massa.',
            short_answer: 'Questo convertitore trasforma un valore di massa dal quintale statunitense (corto) a chilogrammi (1 cwt = 45,359 kg) — e può convertire tra oltre 25 unità di massa.',
            intro_text: '<p>Il quintale (abbreviato "cwt") è ancora usato negli USA per la determinazione del prezzo di prodotti agricoli (grano, mangimi, alcuni prodotti) e nel Regno Unito in alcuni contesti commerciali tradizionali.</p><p>Questo strumento va oltre il quintale statunitense: i menu a tendina "Da" e "A" coprono anche il quintale lungo britannico.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 quintale (corto) statunitense = esattamente 45,359237 chilogrammi (100 libbre avoirdupois).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due qualsiasi delle oltre 25 unità di massa.',
                '<b>I quintali statunitense e britannico differiscono:</b> quello corto statunitense è 100 libbre (45,36 kg), quello lungo britannico è 112 libbre (50,80 kg).',
            ],
            howto: [
                { question: 'Quanti chilogrammi ci sono in un quintale?', answer: '<p>1 quintale (corto) statunitense equivale esattamente a 45,359237 chilogrammi.</p>' },
                { question: 'Perché il quintale statunitense differisce da quello britannico?', answer: '<p>Il sistema statunitense lo definisce come esattamente 100 libbre per semplicità, mentre il sistema britannico tradizionale lo definisce come 112 libbre (8 stone).</p>' },
            ],
            inputs: massInputs('it', '1'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'zentner-in-kilogramm-rechner',
            title: 'Hundredweight (Kurz) in Kilogramm Rechner',
            h1: 'Hundredweight (Kurz) in Kilogramm Rechner',
            meta_title: 'Hundredweight in Kilogramm | Umrechner für Jede Masseeinheit',
            meta_description: 'Rechnen Sie Hundredweight sofort in Kilogramm um, oder wechseln Sie zu einer von 25+ Masseeinheiten.',
            short_answer: 'Dieser Rechner wandelt einen Massewert vom US-(kurzen) Hundredweight in Kilogramm um (1 cwt = 45,359 kg) — und kann zwischen über 25 Masseeinheiten umrechnen.',
            intro_text: '<p>Das Hundredweight (Abkürzung "cwt") wird in den USA noch für die Preisgestaltung landwirtschaftlicher Rohstoffe verwendet und in Großbritannien in bestimmten traditionellen Handelskontexten.</p><p>Dieses Tool geht über das US-Hundredweight hinaus: die Dropdown-Menüs "Von" und "Zu" decken auch das britische lange Hundredweight ab.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 US-(kurzes) Hundredweight = genau 45,359237 Kilogramm (100 avoirdupois Pfund).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der über 25 unterstützten Masseeinheiten umzurechnen.',
                '<b>US- und UK-Hundredweight unterscheiden sich:</b> das US-kurze sind 100 Pfund (45,36 kg), das UK-lange sind 112 Pfund (50,80 kg).',
            ],
            howto: [
                { question: 'Wie viele Kilogramm sind in einem Hundredweight?', answer: '<p>1 US-(kurzes) Hundredweight entspricht genau 45,359237 Kilogramm.</p>' },
                { question: 'Warum unterscheidet sich das US-Hundredweight vom britischen?', answer: '<p>Das US-System definiert es der Einfachheit halber als genau 100 Pfund, während das traditionelle britische System es als 112 Pfund (8 Stone) definiert.</p>' },
            ],
            inputs: massInputs('de', '1'),
            outputs: resultOutput('de', 3),
        },
    },
}

export const tools: ToolDef[] = [litersToGallons, gallonsToLiters, mlToFlOz, cupsToMl, tbspToMl, tspToMl, quartsToLiters, pintsToLiters, ft3ToLiters, m3ToLiters, barrelPetroleumToGallons, bushelsToLiters, gramsToOunces, kgToLbs, lbsToKg, gramsToLbs, mgToGrams, stoneToKg, tonsToKg, tonnesToLbs, ouncesToGrams, troyOuncesToGrams, caratsToGrams, hundredweightToKg]

// ============================================================
// Seeding logic
// ============================================================
async function seedTool(def: ToolDef) {
    console.log(`\n🚀 Seeding tool "${def.id}" (${Object.keys(def.locales).length} locales)`)

    await prisma.tool.upsert({
        where: { id: def.id },
        update: { type: def.type, engine: 'json', status: 'published' },
        create: { id: def.id, type: def.type, engine: 'json', status: 'published' },
    })

    await prisma.toolConfig.upsert({
        where: { tool_id: def.id },
        update: { config_json: def.config_json },
        create: { tool_id: def.id, config_json: def.config_json },
    })

    for (const [lang, content] of Object.entries(def.locales)) {
        await prisma.toolI18n.upsert({
            where: { lang_slug: { lang, slug: content.slug } },
            update: {
                tool_id: def.id,
                title: content.title,
                h1: content.h1,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                meta_robots: 'index,follow',
                short_answer: content.short_answer,
                intro_text: content.intro_text,
                // @ts-ignore - Prisma JSON field typing
                key_points_json: content.key_points,
                // @ts-ignore
                howto_json: content.howto,
                // @ts-ignore
                inputs_json: content.inputs,
                // @ts-ignore
                outputs_json: content.outputs,
            },
            create: {
                tool_id: def.id,
                lang,
                slug: content.slug,
                title: content.title,
                h1: content.h1,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                meta_robots: 'index,follow',
                short_answer: content.short_answer,
                intro_text: content.intro_text,
                // @ts-ignore
                key_points_json: content.key_points,
                // @ts-ignore
                howto_json: content.howto,
                // @ts-ignore
                inputs_json: content.inputs,
                // @ts-ignore
                outputs_json: content.outputs,
            },
        })
    }

    const existingLink = await prisma.toolCategory.findUnique({
        where: { tool_id_category_id: { tool_id: def.id, category_id: VOLUME_MASS_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: VOLUME_MASS_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} volume & mass converters across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
