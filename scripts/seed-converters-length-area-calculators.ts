// One-off script: seeds 12 new Length & Area Converter calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-converters-length-area-calculators.ts
//
// Tool IDs 1069-1080, category_id '29' (Length & Area Converters, under Converters).
//
// UNIT-SYSTEM SWITCHING NOTE: unlike prior Finance batches, this category's whole
// point IS unit-system switching (metric <-> imperial), so every locale gets the
// same full "from unit" / "to unit" selector (not an EN/RU-only currency-style
// toggle) - conversion factors and unit codes are universal, only the option
// LABELS are translated per locale. Each tool defaults to a specific named pair
// (matching its SEO title) but the widget is fully flexible: any unit in the
// category can be converted to any other. This required extending the shared
// JSON engine (core/engines/json.ts) with two new registry functions
// (lengthConverter/areaConverter, in lib/tools/unitConverter.ts) since the
// existing `formulas` path forces all scope values to numbers and can't carry
// a "from_unit"/"to_unit" select's string value - the `functions` path (already
// used by bmiCalculator) passes params through untouched, which unit lookup needs.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LENGTH_AREA_CATEGORY_ID = '29'

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
const LENGTH_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { mm: 'Millimeters (mm)', cm: 'Centimeters (cm)', m: 'Meters (m)', km: 'Kilometers (km)', in: 'Inches (in)', ft: 'Feet (ft)', yd: 'Yards (yd)', mi: 'Miles (mi)' },
    ru: { mm: 'Миллиметры (мм)', cm: 'Сантиметры (см)', m: 'Метры (м)', km: 'Километры (км)', in: 'Дюймы (in)', ft: 'Футы (ft)', yd: 'Ярды (yd)', mi: 'Мили (mi)' },
    de: { mm: 'Millimeter (mm)', cm: 'Zentimeter (cm)', m: 'Meter (m)', km: 'Kilometer (km)', in: 'Zoll (in)', ft: 'Fuß (ft)', yd: 'Yard (yd)', mi: 'Meilen (mi)' },
    es: { mm: 'Milímetros (mm)', cm: 'Centímetros (cm)', m: 'Metros (m)', km: 'Kilómetros (km)', in: 'Pulgadas (in)', ft: 'Pies (ft)', yd: 'Yardas (yd)', mi: 'Millas (mi)' },
    fr: { mm: 'Millimètres (mm)', cm: 'Centimètres (cm)', m: 'Mètres (m)', km: 'Kilomètres (km)', in: 'Pouces (in)', ft: 'Pieds (ft)', yd: 'Yards (yd)', mi: 'Miles (mi)' },
    it: { mm: 'Millimetri (mm)', cm: 'Centimetri (cm)', m: 'Metri (m)', km: 'Chilometri (km)', in: 'Pollici (in)', ft: 'Piedi (ft)', yd: 'Iarde (yd)', mi: 'Miglia (mi)' },
    pl: { mm: 'Milimetry (mm)', cm: 'Centymetry (cm)', m: 'Metry (m)', km: 'Kilometry (km)', in: 'Cale (in)', ft: 'Stopy (ft)', yd: 'Jardy (yd)', mi: 'Mile (mi)' },
    lv: { mm: 'Milimetri (mm)', cm: 'Centimetri (cm)', m: 'Metri (m)', km: 'Kilometri (km)', in: 'Collas (in)', ft: 'Pēdas (ft)', yd: 'Jardi (yd)', mi: 'Jūdzes (mi)' },
}

const AREA_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { mm2: 'Square Millimeters (mm²)', cm2: 'Square Centimeters (cm²)', m2: 'Square Meters (m²)', km2: 'Square Kilometers (km²)', in2: 'Square Inches (in²)', ft2: 'Square Feet (ft²)', yd2: 'Square Yards (yd²)', acre: 'Acres (ac)', hectare: 'Hectares (ha)', mi2: 'Square Miles (mi²)' },
    ru: { mm2: 'Квадратные миллиметры (мм²)', cm2: 'Квадратные сантиметры (см²)', m2: 'Квадратные метры (м²)', km2: 'Квадратные километры (км²)', in2: 'Квадратные дюймы (in²)', ft2: 'Квадратные футы (ft²)', yd2: 'Квадратные ярды (yd²)', acre: 'Акры (ac)', hectare: 'Гектары (га)', mi2: 'Квадратные мили (mi²)' },
    de: { mm2: 'Quadratmillimeter (mm²)', cm2: 'Quadratzentimeter (cm²)', m2: 'Quadratmeter (m²)', km2: 'Quadratkilometer (km²)', in2: 'Quadratzoll (in²)', ft2: 'Quadratfuß (ft²)', yd2: 'Quadratyard (yd²)', acre: 'Acres (ac)', hectare: 'Hektar (ha)', mi2: 'Quadratmeilen (mi²)' },
    es: { mm2: 'Milímetros cuadrados (mm²)', cm2: 'Centímetros cuadrados (cm²)', m2: 'Metros cuadrados (m²)', km2: 'Kilómetros cuadrados (km²)', in2: 'Pulgadas cuadradas (in²)', ft2: 'Pies cuadrados (ft²)', yd2: 'Yardas cuadradas (yd²)', acre: 'Acres (ac)', hectare: 'Hectáreas (ha)', mi2: 'Millas cuadradas (mi²)' },
    fr: { mm2: 'Millimètres carrés (mm²)', cm2: 'Centimètres carrés (cm²)', m2: 'Mètres carrés (m²)', km2: 'Kilomètres carrés (km²)', in2: 'Pouces carrés (in²)', ft2: 'Pieds carrés (ft²)', yd2: 'Yards carrés (yd²)', acre: 'Acres (ac)', hectare: 'Hectares (ha)', mi2: 'Miles carrés (mi²)' },
    it: { mm2: 'Millimetri quadrati (mm²)', cm2: 'Centimetri quadrati (cm²)', m2: 'Metri quadrati (m²)', km2: 'Chilometri quadrati (km²)', in2: 'Pollici quadrati (in²)', ft2: 'Piedi quadrati (ft²)', yd2: 'Iarde quadrate (yd²)', acre: 'Acri (ac)', hectare: 'Ettari (ha)', mi2: 'Miglia quadrate (mi²)' },
    pl: { mm2: 'Milimetry kwadratowe (mm²)', cm2: 'Centymetry kwadratowe (cm²)', m2: 'Metry kwadratowe (m²)', km2: 'Kilometry kwadratowe (km²)', in2: 'Cale kwadratowe (in²)', ft2: 'Stopy kwadratowe (ft²)', yd2: 'Jardy kwadratowe (yd²)', acre: 'Akry (ac)', hectare: 'Hektary (ha)', mi2: 'Mile kwadratowe (mi²)' },
    lv: { mm2: 'Kvadrātmilimetri (mm²)', cm2: 'Kvadrātcentimetri (cm²)', m2: 'Kvadrātmetri (m²)', km2: 'Kvadrātkilometri (km²)', in2: 'Kvadrātcollas (in²)', ft2: 'Kvadrātpēdas (ft²)', yd2: 'Kvadrātjardi (yd²)', acre: 'Akri (ac)', hectare: 'Hektāri (ha)', mi2: 'Kvadrātjūdzes (mi²)' },
}

const LENGTH_UNIT_ORDER = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi']
const AREA_UNIT_ORDER = ['mm2', 'cm2', 'm2', 'km2', 'in2', 'ft2', 'yd2', 'acre', 'hectare', 'mi2']

function lengthUnitOptions(lang: string): Array<{ value: string; label: string }> {
    const labels = LENGTH_UNIT_LABELS[lang] || LENGTH_UNIT_LABELS.en
    return LENGTH_UNIT_ORDER.map((code) => ({ value: code, label: labels[code] }))
}

function areaUnitOptions(lang: string): Array<{ value: string; label: string }> {
    const labels = AREA_UNIT_LABELS[lang] || AREA_UNIT_LABELS.en
    return AREA_UNIT_ORDER.map((code) => ({ value: code, label: labels[code] }))
}

const FROM_LABEL: Record<string, string> = { en: 'From', ru: 'Из', de: 'Von', es: 'De', fr: 'De', it: 'Da', pl: 'Z', lv: 'No' }
const TO_LABEL: Record<string, string> = { en: 'To', ru: 'В', de: 'Zu', es: 'A', fr: 'Vers', it: 'A', pl: 'Do', lv: 'Uz' }
const VALUE_LABEL: Record<string, string> = { en: 'Value', ru: 'Значение', de: 'Wert', es: 'Valor', fr: 'Valeur', it: 'Valore', pl: 'Wartość', lv: 'Vērtība' }
const RESULT_LABEL: Record<string, string> = { en: 'Result', ru: 'Результат', de: 'Ergebnis', es: 'Resultado', fr: 'Résultat', it: 'Risultato', pl: 'Wynik', lv: 'Rezultāts' }

function lengthInputs(lang: string, placeholder: string): InputField[] {
    return [
        { name: 'value', label: VALUE_LABEL[lang] || VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder },
        { name: 'from_unit', label: FROM_LABEL[lang] || FROM_LABEL.en, type: 'select', options: lengthUnitOptions(lang) },
        { name: 'to_unit', label: TO_LABEL[lang] || TO_LABEL.en, type: 'select', options: lengthUnitOptions(lang) },
    ]
}

function areaInputs(lang: string, placeholder: string): InputField[] {
    return [
        { name: 'value', label: VALUE_LABEL[lang] || VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder },
        { name: 'from_unit', label: FROM_LABEL[lang] || FROM_LABEL.en, type: 'select', options: areaUnitOptions(lang) },
        { name: 'to_unit', label: TO_LABEL[lang] || TO_LABEL.en, type: 'select', options: areaUnitOptions(lang) },
    ]
}

function resultOutput(lang: string, precision: number): OutputField[] {
    return [{ name: 'result', label: RESULT_LABEL[lang] || RESULT_LABEL.en, unitFrom: 'to_unit', precision }]
}

// ============================================================
// 1069: Meters to Feet Converter
// ============================================================
const metersToFeet: ToolDef = {
    id: '1069',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'm' },
            { key: 'to_unit', default: 'ft' },
        ],
        functions: {
            result: { type: 'function', functionName: 'lengthConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'meters-to-feet-converter',
            title: 'Meters to Feet Converter',
            h1: 'Meters to Feet Converter',
            meta_title: 'Meters to Feet Converter | Convert Any Length Unit',
            meta_description: 'Convert meters to feet instantly, or switch to any other length unit — millimeters, centimeters, kilometers, inches, yards, and miles all supported.',
            short_answer: 'This converter changes a length value from meters to feet (1 meter = 3.2808 feet) — and can convert between any pair of length units using the selectors below.',
            intro_text: '<p>Meters and feet are the two most commonly compared length units between the metric and imperial systems — meters used almost everywhere in the world, feet still standard in the US, UK construction, and aviation altitude readings.</p><p>This isn\'t limited to meters and feet: use the "From" and "To" dropdowns to convert between any combination of millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 meter = 3.28084 feet (and 1 foot = 0.3048 meters exactly, by international definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two length units — not just meters and feet.',
                '<b>Precision matters for construction and engineering:</b> small rounding errors compound over long distances, so this converter uses high-precision factors rather than rounded approximations.',
            ],
            howto: [
                { question: 'How many feet are in a meter?', answer: '<p>1 meter equals approximately 3.28084 feet. To convert meters to feet, multiply the meter value by 3.28084.</p>' },
                { question: 'Can I convert feet back to meters with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Feet and Meters respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: lengthInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-metry-v-futy',
            title: 'Конвертер метров в футы',
            h1: 'Конвертер метров в футы',
            meta_title: 'Метры в футы | Конвертер любых единиц длины',
            meta_description: 'Конвертируйте метры в футы мгновенно, или переключитесь на любую другую единицу длины — миллиметры, сантиметры, километры, дюймы, ярды и мили.',
            short_answer: 'Этот конвертер переводит значение длины из метров в футы (1 метр = 3,2808 фута) — а также может конвертировать между любой парой единиц длины с помощью селекторов ниже.',
            intro_text: '<p>Метры и футы — две наиболее часто сравниваемые единицы длины между метрической и имперской системами — метры используются почти везде в мире, футы всё ещё стандарт в США, британском строительстве и показаниях высоты в авиации.</p><p>Это не ограничивается метрами и футами: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией миллиметров, сантиметров, метров, километров, дюймов, футов, ярдов и миль.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 метр = 3,28084 фута (а 1 фут = 0,3048 метра точно, по международному определению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами длины — не только метрами и футами.',
                '<b>Точность важна для строительства и инженерии:</b> небольшие ошибки округления накапливаются на больших расстояниях, поэтому этот конвертер использует точные коэффициенты, а не округлённые приближения.',
            ],
            howto: [
                { question: 'Сколько футов в метре?', answer: '<p>1 метр равен примерно 3,28084 фута. Чтобы конвертировать метры в футы, умножьте значение в метрах на 3,28084.</p>' },
                { question: 'Могу ли я конвертировать футы обратно в метры этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Футы и Метры соответственно; тот же виджет обрабатывает оба направления и любую другую пару единиц.</p>' },
            ],
            inputs: lengthInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'metru-uz-pedam-kalkulators',
            title: 'Metru uz Pēdām Kalkulators',
            h1: 'Metru uz Pēdām Kalkulators',
            meta_title: 'Metri uz Pēdas | Jebkuras Garuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet metrus uz pēdām acumirklī, vai pārslēdzieties uz jebkuru citu garuma vienību — milimetriem, centimetriem, kilometriem, collām, jardiem un jūdzēm.',
            short_answer: 'Šis konvertētājs pārvērš garuma vērtību no metriem uz pēdām (1 metrs = 3,2808 pēdas) — un var konvertēt starp jebkuru garuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Metri un pēdas ir divas visbiežāk salīdzinātās garuma vienības starp metrisko un imperiālo sistēmu — metri tiek izmantoti gandrīz visur pasaulē, pēdas joprojām ir standarts ASV, Lielbritānijas būvniecībā un aviācijas augstuma rādījumos.</p><p>Tas neaprobežojas ar metriem un pēdām: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru milimetru, centimetru, metru, kilometru, collu, pēdu, jardu un jūdžu kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 metrs = 3,28084 pēdas (un 1 pēda = 0,3048 metri precīzi, pēc starptautiskas definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām garuma vienībām — ne tikai metriem un pēdām.',
                '<b>Precizitāte ir svarīga būvniecībā un inženierijā:</b> nelielas noapaļošanas kļūdas summējas lielos attālumos, tāpēc šis konvertētājs izmanto augstas precizitātes koeficientus, nevis noapaļotas aptuvenas vērtības.',
            ],
            howto: [
                { question: 'Cik pēdu ir metrā?', answer: '<p>1 metrs ir aptuveni 3,28084 pēdas. Lai konvertētu metrus uz pēdām, reiziniet metru vērtību ar 3,28084.</p>' },
                { question: 'Vai varu konvertēt pēdas atpakaļ uz metriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Pēdām un Metriem; tas pats vidžets apstrādā abus virzienus un jebkuru citu vienību pāri.</p>' },
            ],
            inputs: lengthInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-metrow-na-stopy',
            title: 'Kalkulator Metrów na Stopy',
            h1: 'Kalkulator Metrów na Stopy',
            meta_title: 'Metry na Stopy | Konwerter Dowolnej Jednostki Długości',
            meta_description: 'Przelicz metry na stopy natychmiast lub przełącz się na dowolną inną jednostkę długości — milimetry, centymetry, kilometry, cale, jardy i mile.',
            short_answer: 'Ten konwerter zmienia wartość długości z metrów na stopy (1 metr = 3,2808 stopy) — może też przeliczać między dowolną parą jednostek długości za pomocą selektorów poniżej.',
            intro_text: '<p>Metry i stopy to dwie najczęściej porównywane jednostki długości między systemem metrycznym a imperialnym — metry używane niemal wszędzie na świecie, stopy nadal standardowe w USA, brytyjskim budownictwie i odczytach wysokości w lotnictwie.</p><p>Nie ogranicza się to do metrów i stóp: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją milimetrów, centymetrów, metrów, kilometrów, cali, stóp, jardów i mil.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 metr = 3,28084 stopy (a 1 stopa = dokładnie 0,3048 metra, według międzynarodowej definicji).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami długości — nie tylko metrami i stopami.',
                '<b>Precyzja ma znaczenie w budownictwie i inżynierii:</b> małe błędy zaokrąglenia kumulują się na dużych odległościach, dlatego ten konwerter używa precyzyjnych współczynników, a nie zaokrąglonych przybliżeń.',
            ],
            howto: [
                { question: 'Ile stóp jest w metrze?', answer: '<p>1 metr to około 3,28084 stopy. Aby przeliczyć metry na stopy, pomnóż wartość w metrach przez 3,28084.</p>' },
                { question: 'Czy mogę przeliczyć stopy z powrotem na metry tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Stopy i Metry; ten sam widget obsługuje oba kierunki i dowolną inną parę jednostek.</p>' },
            ],
            inputs: lengthInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-metros-a-pies',
            title: 'Calculadora de Metros a Pies',
            h1: 'Calculadora de Metros a Pies',
            meta_title: 'Metros a Pies | Convertidor de Cualquier Unidad de Longitud',
            meta_description: 'Convierte metros a pies al instante, o cambia a cualquier otra unidad de longitud — milímetros, centímetros, kilómetros, pulgadas, yardas y millas.',
            short_answer: 'Este convertidor cambia un valor de longitud de metros a pies (1 metro = 3,2808 pies) — y puede convertir entre cualquier par de unidades de longitud usando los selectores de abajo.',
            intro_text: '<p>Los metros y los pies son las dos unidades de longitud más comúnmente comparadas entre el sistema métrico e imperial — los metros se usan casi en todo el mundo, los pies siguen siendo estándar en EE. UU., la construcción británica y las lecturas de altitud en aviación.</p><p>Esto no se limita a metros y pies: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de milímetros, centímetros, metros, kilómetros, pulgadas, pies, yardas y millas.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 metro = 3,28084 pies (y 1 pie = 0,3048 metros exactos, por definición internacional).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de longitud cualesquiera — no solo metros y pies.',
                '<b>La precisión importa en construcción e ingeniería:</b> los pequeños errores de redondeo se acumulan en distancias largas, por lo que este convertidor usa factores de alta precisión en lugar de aproximaciones redondeadas.',
            ],
            howto: [
                { question: '¿Cuántos pies hay en un metro?', answer: '<p>1 metro equivale a aproximadamente 3,28084 pies. Para convertir metros a pies, multiplica el valor en metros por 3,28084.</p>' },
                { question: '¿Puedo convertir pies de vuelta a metros con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Pies y Metros respectivamente; el mismo widget maneja ambas direcciones y cualquier otro par de unidades.</p>' },
            ],
            inputs: lengthInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-metres-en-pieds',
            title: 'Calculateur de Mètres en Pieds',
            h1: 'Calculateur de Mètres en Pieds',
            meta_title: 'Mètres en Pieds | Convertisseur de Toute Unité de Longueur',
            meta_description: 'Convertissez des mètres en pieds instantanément, ou passez à toute autre unité de longueur — millimètres, centimètres, kilomètres, pouces, yards et miles.',
            short_answer: 'Ce convertisseur transforme une valeur de longueur de mètres en pieds (1 mètre = 3,2808 pieds) — et peut convertir entre n’importe quelle paire d’unités de longueur grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Les mètres et les pieds sont les deux unités de longueur les plus couramment comparées entre le système métrique et impérial — les mètres utilisés presque partout dans le monde, les pieds toujours la norme aux États-Unis, dans la construction britannique et les mesures d’altitude en aviation.</p><p>Cela ne se limite pas aux mètres et aux pieds : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison de millimètres, centimètres, mètres, kilomètres, pouces, pieds, yards et miles.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 mètre = 3,28084 pieds (et 1 pied = 0,3048 mètre exactement, par définition internationale).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de longueur quelconques — pas seulement mètres et pieds.',
                '<b>La précision compte en construction et en ingénierie :</b> de petites erreurs d’arrondi s’accumulent sur de longues distances, donc ce convertisseur utilise des facteurs de haute précision plutôt que des approximations arrondies.',
            ],
            howto: [
                { question: 'Combien de pieds y a-t-il dans un mètre ?', answer: '<p>1 mètre équivaut à environ 3,28084 pieds. Pour convertir des mètres en pieds, multipliez la valeur en mètres par 3,28084.</p>' },
                { question: 'Puis-je convertir des pieds en mètres avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Pieds et Mètres respectivement ; le même widget gère les deux sens et toute autre paire d’unités.</p>' },
            ],
            inputs: lengthInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-metri-a-piedi',
            title: 'Calcolatore da Metri a Piedi',
            h1: 'Calcolatore da Metri a Piedi',
            meta_title: 'Metri in Piedi | Convertitore di Qualsiasi Unità di Lunghezza',
            meta_description: 'Converti metri in piedi istantaneamente, o passa a qualsiasi altra unità di lunghezza — millimetri, centimetri, chilometri, pollici, iarde e miglia.',
            short_answer: 'Questo convertitore trasforma un valore di lunghezza da metri a piedi (1 metro = 3,2808 piedi) — e può convertire tra qualsiasi coppia di unità di lunghezza usando i selettori qui sotto.',
            intro_text: '<p>Metri e piedi sono le due unità di lunghezza più comunemente confrontate tra il sistema metrico e quello imperiale — i metri usati quasi ovunque nel mondo, i piedi ancora standard negli USA, nell’edilizia britannica e nelle letture di altitudine in aviazione.</p><p>Questo non si limita a metri e piedi: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di millimetri, centimetri, metri, chilometri, pollici, piedi, iarde e miglia.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 metro = 3,28084 piedi (e 1 piede = 0,3048 metri esatti, per definizione internazionale).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di lunghezza qualsiasi — non solo metri e piedi.',
                '<b>La precisione conta per edilizia e ingegneria:</b> piccoli errori di arrotondamento si accumulano su lunghe distanze, quindi questo convertitore usa fattori ad alta precisione anziché approssimazioni arrotondate.',
            ],
            howto: [
                { question: 'Quanti piedi ci sono in un metro?', answer: '<p>1 metro equivale a circa 3,28084 piedi. Per convertire metri in piedi, moltiplica il valore in metri per 3,28084.</p>' },
                { question: 'Posso convertire i piedi in metri con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Piedi e Metri; lo stesso widget gestisce entrambe le direzioni e qualsiasi altra coppia di unità.</p>' },
            ],
            inputs: lengthInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'meter-in-fuss-rechner',
            title: 'Meter in Fuß Rechner',
            h1: 'Meter in Fuß Rechner',
            meta_title: 'Meter in Fuß | Umrechner für Jede Längeneinheit',
            meta_description: 'Rechnen Sie Meter sofort in Fuß um, oder wechseln Sie zu jeder anderen Längeneinheit — Millimeter, Zentimeter, Kilometer, Zoll, Yards und Meilen.',
            short_answer: 'Dieser Umrechner wandelt einen Längenwert von Metern in Fuß um (1 Meter = 3,2808 Fuß) — und kann zwischen jedem beliebigen Paar von Längeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Meter und Fuß sind die beiden am häufigsten verglichenen Längeneinheiten zwischen dem metrischen und dem imperialen System — Meter werden fast überall auf der Welt verwendet, Fuß ist weiterhin Standard in den USA, im britischen Baugewerbe und bei Höhenangaben in der Luftfahrt.</p><p>Dies beschränkt sich nicht auf Meter und Fuß: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination aus Millimetern, Zentimetern, Metern, Kilometern, Zoll, Fuß, Yards und Meilen umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Meter = 3,28084 Fuß (und 1 Fuß = genau 0,3048 Meter, nach internationaler Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Längeneinheiten umzurechnen — nicht nur Meter und Fuß.',
                '<b>Präzision zählt für Bau und Technik:</b> kleine Rundungsfehler summieren sich über große Entfernungen, daher verwendet dieser Umrechner hochpräzise Faktoren statt gerundeter Näherungswerte.',
            ],
            howto: [
                { question: 'Wie viele Fuß sind in einem Meter?', answer: '<p>1 Meter entspricht etwa 3,28084 Fuß. Um Meter in Fuß umzurechnen, multiplizieren Sie den Meterwert mit 3,28084.</p>' },
                { question: 'Kann ich mit diesem Tool Fuß zurück in Meter umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Fuß bzw. Meter; dasselbe Widget verarbeitet beide Richtungen und jedes andere Einheitenpaar.</p>' },
            ],
            inputs: lengthInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1070: Centimeters to Inches Converter
// ============================================================
const cmToInches: ToolDef = {
    id: '1070',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 10 },
            { key: 'from_unit', default: 'cm' },
            { key: 'to_unit', default: 'in' },
        ],
        functions: {
            result: { type: 'function', functionName: 'lengthConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'centimeters-to-inches-converter',
            title: 'Centimeters to Inches Converter',
            h1: 'Centimeters to Inches Converter',
            meta_title: 'Centimeters to Inches Converter | Convert Any Length Unit',
            meta_description: 'Convert centimeters to inches instantly, or switch to any other length unit — millimeters, meters, kilometers, feet, yards, and miles all supported.',
            short_answer: 'This converter changes a length value from centimeters to inches (1 centimeter = 0.3937 inches) — and can convert between any pair of length units using the selectors below.',
            intro_text: '<p>Centimeters to inches is one of the most searched conversions online — used constantly for clothing sizes, screen dimensions, printed paper formats, and everyday measurements when comparing metric and US/imperial specifications.</p><p>This tool goes beyond a single fixed pair: use the "From" and "To" dropdowns to convert between any combination of millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 centimeter = 0.393701 inches (and 1 inch = exactly 2.54 centimeters, by international definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two length units — not just centimeters and inches.',
                '<b>Common use case:</b> comparing a metric measurement (e.g. a screen or garment listed in cm) against a US-market spec listed in inches.',
            ],
            howto: [
                { question: 'How many inches are in a centimeter?', answer: '<p>1 centimeter equals approximately 0.3937 inches. To convert centimeters to inches, divide the centimeter value by 2.54 (or multiply by 0.3937).</p>' },
                { question: 'Can I convert inches back to centimeters with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Inches and Centimeters respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: lengthInputs('en', '10'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-santimetry-v-dyuymy',
            title: 'Конвертер сантиметров в дюймы',
            h1: 'Конвертер сантиметров в дюймы',
            meta_title: 'Сантиметры в дюймы | Конвертер любых единиц длины',
            meta_description: 'Конвертируйте сантиметры в дюймы мгновенно, или переключитесь на любую другую единицу длины — миллиметры, метры, километры, футы, ярды и мили.',
            short_answer: 'Этот конвертер переводит значение длины из сантиметров в дюймы (1 сантиметр = 0,3937 дюйма) — а также может конвертировать между любой парой единиц длины с помощью селекторов ниже.',
            intro_text: '<p>Сантиметры в дюймы — одна из самых часто ищущихся конверсий онлайн — используется постоянно для размеров одежды, размеров экранов, форматов печатной бумаги и повседневных измерений при сравнении метрических и американских спецификаций.</p><p>Этот инструмент выходит за рамки одной фиксированной пары: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией миллиметров, сантиметров, метров, километров, дюймов, футов, ярдов и миль.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 сантиметр = 0,393701 дюйма (а 1 дюйм = ровно 2,54 сантиметра, по международному определению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами длины.',
                '<b>Частый случай использования:</b> сравнение метрического измерения (например, экрана или одежды в см) с американской спецификацией в дюймах.',
            ],
            howto: [
                { question: 'Сколько дюймов в сантиметре?', answer: '<p>1 сантиметр равен примерно 0,3937 дюйма. Чтобы конвертировать сантиметры в дюймы, разделите значение в сантиметрах на 2,54.</p>' },
                { question: 'Могу ли я конвертировать дюймы обратно в сантиметры этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Дюймы и Сантиметры соответственно.</p>' },
            ],
            inputs: lengthInputs('ru', '10'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'centimetru-uz-collam-kalkulators',
            title: 'Centimetru uz Collām Kalkulators',
            h1: 'Centimetru uz Collām Kalkulators',
            meta_title: 'Centimetri uz Collas | Jebkuras Garuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet centimetrus uz collām acumirklī, vai pārslēdzieties uz jebkuru citu garuma vienību — milimetriem, metriem, kilometriem, pēdām, jardiem un jūdzēm.',
            short_answer: 'Šis konvertētājs pārvērš garuma vērtību no centimetriem uz collām (1 centimetrs = 0,3937 collas) — un var konvertēt starp jebkuru garuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Centimetri uz collām ir viena no visbiežāk meklētajām konversijām tiešsaistē — tiek pastāvīgi izmantota apģērbu izmēriem, ekrānu izmēriem, drukāta papīra formātiem un ikdienas mērījumiem, salīdzinot metrisko un ASV specifikāciju.</p><p>Šis rīks sniedzas tālāk par vienu fiksētu pāri: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru milimetru, centimetru, metru, kilometru, collu, pēdu, jardu un jūdžu kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 centimetrs = 0,393701 collas (un 1 colla = tieši 2,54 centimetri, pēc starptautiskas definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām garuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> metriska mērījuma (piemēram, ekrāna vai apģērba, kas norādīts cm) salīdzināšana ar ASV tirgus specifikāciju collās.',
            ],
            howto: [
                { question: 'Cik collu ir centimetrā?', answer: '<p>1 centimetrs ir aptuveni 0,3937 collas. Lai konvertētu centimetrus uz collām, daliet centimetru vērtību ar 2,54.</p>' },
                { question: 'Vai varu konvertēt collas atpakaļ uz centimetriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Collām un Centimetriem.</p>' },
            ],
            inputs: lengthInputs('lv', '10'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-centymetrow-na-cale',
            title: 'Kalkulator Centymetrów na Cale',
            h1: 'Kalkulator Centymetrów na Cale',
            meta_title: 'Centymetry na Cale | Konwerter Dowolnej Jednostki Długości',
            meta_description: 'Przelicz centymetry na cale natychmiast lub przełącz się na dowolną inną jednostkę długości — milimetry, metry, kilometry, stopy, jardy i mile.',
            short_answer: 'Ten konwerter zmienia wartość długości z centymetrów na cale (1 centymetr = 0,3937 cala) — może też przeliczać między dowolną parą jednostek długości za pomocą selektorów poniżej.',
            intro_text: '<p>Centymetry na cale to jedna z najczęściej wyszukiwanych konwersji online — używana stale do rozmiarów odzieży, wymiarów ekranów, formatów papieru drukowanego i codziennych pomiarów przy porównywaniu specyfikacji metrycznych i amerykańskich.</p><p>To narzędzie wykracza poza jedną stałą parę: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją milimetrów, centymetrów, metrów, kilometrów, cali, stóp, jardów i mil.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 centymetr = 0,393701 cala (a 1 cal = dokładnie 2,54 centymetra, według międzynarodowej definicji).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami długości.',
                '<b>Częsty przypadek użycia:</b> porównanie pomiaru metrycznego (np. ekranu lub odzieży podanego w cm) ze specyfikacją rynku amerykańskiego podaną w calach.',
            ],
            howto: [
                { question: 'Ile cali jest w centymetrze?', answer: '<p>1 centymetr to około 0,3937 cala. Aby przeliczyć centymetry na cale, podziel wartość w centymetrach przez 2,54.</p>' },
                { question: 'Czy mogę przeliczyć cale z powrotem na centymetry tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Cale i Centymetry.</p>' },
            ],
            inputs: lengthInputs('pl', '10'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-centimetros-a-pulgadas',
            title: 'Calculadora de Centímetros a Pulgadas',
            h1: 'Calculadora de Centímetros a Pulgadas',
            meta_title: 'Centímetros a Pulgadas | Convertidor de Cualquier Unidad de Longitud',
            meta_description: 'Convierte centímetros a pulgadas al instante, o cambia a cualquier otra unidad de longitud — milímetros, metros, kilómetros, pies, yardas y millas.',
            short_answer: 'Este convertidor cambia un valor de longitud de centímetros a pulgadas (1 centímetro = 0,3937 pulgadas) — y puede convertir entre cualquier par de unidades de longitud usando los selectores de abajo.',
            intro_text: '<p>Centímetros a pulgadas es una de las conversiones más buscadas en línea — usada constantemente para tallas de ropa, dimensiones de pantallas, formatos de papel impreso y mediciones cotidianas al comparar especificaciones métricas y estadounidenses.</p><p>Esta herramienta va más allá de un único par fijo: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de milímetros, centímetros, metros, kilómetros, pulgadas, pies, yardas y millas.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 centímetro = 0,393701 pulgadas (y 1 pulgada = exactamente 2,54 centímetros, por definición internacional).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de longitud cualesquiera.',
                '<b>Caso de uso común:</b> comparar una medida métrica (por ejemplo, una pantalla o prenda indicada en cm) con una especificación del mercado estadounidense en pulgadas.',
            ],
            howto: [
                { question: '¿Cuántas pulgadas hay en un centímetro?', answer: '<p>1 centímetro equivale a aproximadamente 0,3937 pulgadas. Para convertir centímetros a pulgadas, divide el valor en centímetros entre 2,54.</p>' },
                { question: '¿Puedo convertir pulgadas de vuelta a centímetros con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Pulgadas y Centímetros respectivamente.</p>' },
            ],
            inputs: lengthInputs('es', '10'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-centimetres-en-pouces',
            title: 'Calculateur de Centimètres en Pouces',
            h1: 'Calculateur de Centimètres en Pouces',
            meta_title: 'Centimètres en Pouces | Convertisseur de Toute Unité de Longueur',
            meta_description: 'Convertissez des centimètres en pouces instantanément, ou passez à toute autre unité de longueur — millimètres, mètres, kilomètres, pieds, yards et miles.',
            short_answer: 'Ce convertisseur transforme une valeur de longueur de centimètres en pouces (1 centimètre = 0,3937 pouce) — et peut convertir entre n’importe quelle paire d’unités de longueur grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Centimètres en pouces est l’une des conversions les plus recherchées en ligne — utilisée constamment pour les tailles de vêtements, les dimensions d’écrans, les formats de papier imprimé et les mesures quotidiennes lors de la comparaison des spécifications métriques et américaines.</p><p>Cet outil va au-delà d’une seule paire fixe : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison de millimètres, centimètres, mètres, kilomètres, pouces, pieds, yards et miles.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 centimètre = 0,393701 pouce (et 1 pouce = exactement 2,54 centimètres, par définition internationale).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de longueur quelconques.',
                '<b>Cas d’usage courant :</b> comparer une mesure métrique (par ex. un écran ou un vêtement indiqué en cm) à une spécification du marché américain en pouces.',
            ],
            howto: [
                { question: 'Combien de pouces y a-t-il dans un centimètre ?', answer: '<p>1 centimètre équivaut à environ 0,3937 pouce. Pour convertir des centimètres en pouces, divisez la valeur en centimètres par 2,54.</p>' },
                { question: 'Puis-je convertir des pouces en centimètres avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Pouces et Centimètres respectivement.</p>' },
            ],
            inputs: lengthInputs('fr', '10'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-centimetri-a-pollici',
            title: 'Calcolatore da Centimetri a Pollici',
            h1: 'Calcolatore da Centimetri a Pollici',
            meta_title: 'Centimetri in Pollici | Convertitore di Qualsiasi Unità di Lunghezza',
            meta_description: 'Converti centimetri in pollici istantaneamente, o passa a qualsiasi altra unità di lunghezza — millimetri, metri, chilometri, piedi, iarde e miglia.',
            short_answer: 'Questo convertitore trasforma un valore di lunghezza da centimetri a pollici (1 centimetro = 0,3937 pollici) — e può convertire tra qualsiasi coppia di unità di lunghezza usando i selettori qui sotto.',
            intro_text: '<p>Centimetri in pollici è una delle conversioni più cercate online — usata costantemente per taglie di abbigliamento, dimensioni degli schermi, formati di carta stampata e misure quotidiane quando si confrontano specifiche metriche e statunitensi.</p><p>Questo strumento va oltre una singola coppia fissa: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di millimetri, centimetri, metri, chilometri, pollici, piedi, iarde e miglia.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 centimetro = 0,393701 pollici (e 1 pollice = esattamente 2,54 centimetri, per definizione internazionale).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di lunghezza qualsiasi.',
                '<b>Caso d’uso comune:</b> confrontare una misura metrica (ad es. uno schermo o un capo indicato in cm) con una specifica del mercato statunitense in pollici.',
            ],
            howto: [
                { question: 'Quanti pollici ci sono in un centimetro?', answer: '<p>1 centimetro equivale a circa 0,3937 pollici. Per convertire centimetri in pollici, dividi il valore in centimetri per 2,54.</p>' },
                { question: 'Posso convertire i pollici in centimetri con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Pollici e Centimetri.</p>' },
            ],
            inputs: lengthInputs('it', '10'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'zentimeter-in-zoll-rechner',
            title: 'Zentimeter in Zoll Rechner',
            h1: 'Zentimeter in Zoll Rechner',
            meta_title: 'Zentimeter in Zoll | Umrechner für Jede Längeneinheit',
            meta_description: 'Rechnen Sie Zentimeter sofort in Zoll um, oder wechseln Sie zu jeder anderen Längeneinheit — Millimeter, Meter, Kilometer, Fuß, Yards und Meilen.',
            short_answer: 'Dieser Umrechner wandelt einen Längenwert von Zentimetern in Zoll um (1 Zentimeter = 0,3937 Zoll) — und kann zwischen jedem beliebigen Paar von Längeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Zentimeter in Zoll ist eine der am häufigsten gesuchten Umrechnungen online — ständig verwendet für Kleidergrößen, Bildschirmabmessungen, Papierformate und alltägliche Messungen beim Vergleich metrischer und US-amerikanischer Spezifikationen.</p><p>Dieses Tool geht über ein einziges festes Paar hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination aus Millimetern, Zentimetern, Metern, Kilometern, Zoll, Fuß, Yards und Meilen umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Zentimeter = 0,393701 Zoll (und 1 Zoll = genau 2,54 Zentimeter, nach internationaler Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Längeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Vergleich einer metrischen Messung (z.B. eines Bildschirms oder Kleidungsstücks in cm) mit einer US-Marktspezifikation in Zoll.',
            ],
            howto: [
                { question: 'Wie viele Zoll sind in einem Zentimeter?', answer: '<p>1 Zentimeter entspricht etwa 0,3937 Zoll. Um Zentimeter in Zoll umzurechnen, teilen Sie den Zentimeterwert durch 2,54.</p>' },
                { question: 'Kann ich mit diesem Tool Zoll zurück in Zentimeter umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Zoll bzw. Zentimeter.</p>' },
            ],
            inputs: lengthInputs('de', '10'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1071: Kilometers to Miles Converter
// ============================================================
const kmToMiles: ToolDef = {
    id: '1071',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 5 },
            { key: 'from_unit', default: 'km' },
            { key: 'to_unit', default: 'mi' },
        ],
        functions: {
            result: { type: 'function', functionName: 'lengthConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'kilometers-to-miles-converter',
            title: 'Kilometers to Miles Converter',
            h1: 'Kilometers to Miles Converter',
            meta_title: 'Kilometers to Miles Converter | Convert Any Length Unit',
            meta_description: 'Convert kilometers to miles instantly, or switch to any other length unit — millimeters, centimeters, meters, inches, feet, and yards all supported.',
            short_answer: 'This converter changes a length value from kilometers to miles (1 kilometer = 0.6214 miles) — and can convert between any pair of length units using the selectors below.',
            intro_text: '<p>Kilometers to miles is essential for anyone comparing road signs, running/cycling distances, or vehicle speed readouts between countries using the metric system and those (like the US and UK) still using miles for road distances.</p><p>This tool isn\'t limited to km and miles: use the "From" and "To" dropdowns to convert between any combination of millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 kilometer = 0.621371 miles (and 1 mile = exactly 1.609344 kilometers, by international definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two length units — not just kilometers and miles.',
                '<b>Common use case:</b> converting a race distance (e.g. a 10K or marathon) or a car\'s speedometer reading between metric and imperial.',
            ],
            howto: [
                { question: 'How many miles are in a kilometer?', answer: '<p>1 kilometer equals approximately 0.6214 miles. To convert kilometers to miles, multiply the kilometer value by 0.6214.</p>' },
                { question: 'Can I convert miles back to kilometers with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Miles and Kilometers respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: lengthInputs('en', '5'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-kilometry-v-mili',
            title: 'Конвертер километров в мили',
            h1: 'Конвертер километров в мили',
            meta_title: 'Километры в мили | Конвертер любых единиц длины',
            meta_description: 'Конвертируйте километры в мили мгновенно, или переключитесь на любую другую единицу длины — миллиметры, сантиметры, метры, дюймы, футы и ярды.',
            short_answer: 'Этот конвертер переводит значение длины из километров в мили (1 километр = 0,6214 мили) — а также может конвертировать между любой парой единиц длины с помощью селекторов ниже.',
            intro_text: '<p>Километры в мили необходимы всем, кто сравнивает дорожные знаки, дистанции бега/велоспорта или показания скорости автомобиля между странами, использующими метрическую систему, и теми (как США и Великобритания), которые всё ещё используют мили для дорожных расстояний.</p><p>Этот инструмент не ограничивается км и милями: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц длины.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 километр = 0,621371 мили (а 1 миля = ровно 1,609344 километра, по международному определению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами длины.',
                '<b>Частый случай использования:</b> конвертация дистанции забега (например, 10 км или марафона) или показаний спидометра автомобиля между метрической и имперской системами.',
            ],
            howto: [
                { question: 'Сколько миль в километре?', answer: '<p>1 километр равен примерно 0,6214 мили. Чтобы конвертировать километры в мили, умножьте значение в километрах на 0,6214.</p>' },
                { question: 'Могу ли я конвертировать мили обратно в километры этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Мили и Километры соответственно.</p>' },
            ],
            inputs: lengthInputs('ru', '5'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'kilometru-uz-judzem-kalkulators',
            title: 'Kilometru uz Jūdzēm Kalkulators',
            h1: 'Kilometru uz Jūdzēm Kalkulators',
            meta_title: 'Kilometri uz Jūdzēm | Jebkuras Garuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kilometrus uz jūdzēm acumirklī, vai pārslēdzieties uz jebkuru citu garuma vienību — milimetriem, centimetriem, metriem, collām, pēdām un jardiem.',
            short_answer: 'Šis konvertētājs pārvērš garuma vērtību no kilometriem uz jūdzēm (1 kilometrs = 0,6214 jūdzes) — un var konvertēt starp jebkuru garuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Kilometri uz jūdzēm ir nepieciešami ikvienam, kas salīdzina ceļa zīmes, skriešanas/riteņbraukšanas distances vai automašīnas ātruma rādījumus starp valstīm, kas izmanto metrisko sistēmu, un tām (piemēram, ASV un Lielbritāniju), kas joprojām izmanto jūdzes ceļa attālumiem.</p><p>Šis rīks neaprobežojas ar km un jūdzēm: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru garuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kilometrs = 0,621371 jūdzes (un 1 jūdze = tieši 1,609344 kilometri, pēc starptautiskas definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām garuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> skrējiena distances (piemēram, 10 km vai maratona) vai automašīnas spidometra rādījuma konvertēšana starp metrisko un imperiālo sistēmu.',
            ],
            howto: [
                { question: 'Cik jūdžu ir kilometrā?', answer: '<p>1 kilometrs ir aptuveni 0,6214 jūdzes. Lai konvertētu kilometrus uz jūdzēm, reiziniet kilometru vērtību ar 0,6214.</p>' },
                { question: 'Vai varu konvertēt jūdzes atpakaļ uz kilometriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Jūdzēm un Kilometriem.</p>' },
            ],
            inputs: lengthInputs('lv', '5'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-kilometrow-na-mile',
            title: 'Kalkulator Kilometrów na Mile',
            h1: 'Kalkulator Kilometrów na Mile',
            meta_title: 'Kilometry na Mile | Konwerter Dowolnej Jednostki Długości',
            meta_description: 'Przelicz kilometry na mile natychmiast lub przełącz się na dowolną inną jednostkę długości — milimetry, centymetry, metry, cale, stopy i jardy.',
            short_answer: 'Ten konwerter zmienia wartość długości z kilometrów na mile (1 kilometr = 0,6214 mili) — może też przeliczać między dowolną parą jednostek długości za pomocą selektorów poniżej.',
            intro_text: '<p>Kilometry na mile są niezbędne dla każdego, kto porównuje znaki drogowe, dystanse biegowe/kolarskie lub odczyty prędkości pojazdu między krajami używającymi systemu metrycznego a tymi (jak USA i Wielka Brytania), które nadal używają mil do odległości drogowych.</p><p>To narzędzie nie ogranicza się do km i mil: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek długości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 kilometr = 0,621371 mili (a 1 mila = dokładnie 1,609344 kilometra, według międzynarodowej definicji).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami długości.',
                '<b>Częsty przypadek użycia:</b> przeliczanie dystansu biegu (np. 10K lub maratonu) lub odczytu prędkościomierza samochodu między systemem metrycznym a imperialnym.',
            ],
            howto: [
                { question: 'Ile mil jest w kilometrze?', answer: '<p>1 kilometr to około 0,6214 mili. Aby przeliczyć kilometry na mile, pomnóż wartość w kilometrach przez 0,6214.</p>' },
                { question: 'Czy mogę przeliczyć mile z powrotem na kilometry tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Mile i Kilometry.</p>' },
            ],
            inputs: lengthInputs('pl', '5'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-kilometros-a-millas',
            title: 'Calculadora de Kilómetros a Millas',
            h1: 'Calculadora de Kilómetros a Millas',
            meta_title: 'Kilómetros a Millas | Convertidor de Cualquier Unidad de Longitud',
            meta_description: 'Convierte kilómetros a millas al instante, o cambia a cualquier otra unidad de longitud — milímetros, centímetros, metros, pulgadas, pies y yardas.',
            short_answer: 'Este convertidor cambia un valor de longitud de kilómetros a millas (1 kilómetro = 0,6214 millas) — y puede convertir entre cualquier par de unidades de longitud usando los selectores de abajo.',
            intro_text: '<p>Kilómetros a millas es esencial para quien compara señales de tráfico, distancias de carrera/ciclismo o lecturas de velocidad de vehículos entre países que usan el sistema métrico y aquellos (como EE. UU. y el Reino Unido) que aún usan millas para distancias en carretera.</p><p>Esta herramienta no se limita a km y millas: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de longitud.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 kilómetro = 0,621371 millas (y 1 milla = exactamente 1,609344 kilómetros, por definición internacional).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de longitud cualesquiera.',
                '<b>Caso de uso común:</b> convertir la distancia de una carrera (por ejemplo, 10K o maratón) o la lectura del velocímetro de un coche entre métrico e imperial.',
            ],
            howto: [
                { question: '¿Cuántas millas hay en un kilómetro?', answer: '<p>1 kilómetro equivale a aproximadamente 0,6214 millas. Para convertir kilómetros a millas, multiplica el valor en kilómetros por 0,6214.</p>' },
                { question: '¿Puedo convertir millas de vuelta a kilómetros con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Millas y Kilómetros respectivamente.</p>' },
            ],
            inputs: lengthInputs('es', '5'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-kilometres-en-miles',
            title: 'Calculateur de Kilomètres en Miles',
            h1: 'Calculateur de Kilomètres en Miles',
            meta_title: 'Kilomètres en Miles | Convertisseur de Toute Unité de Longueur',
            meta_description: 'Convertissez des kilomètres en miles instantanément, ou passez à toute autre unité de longueur — millimètres, centimètres, mètres, pouces, pieds et yards.',
            short_answer: 'Ce convertisseur transforme une valeur de longueur de kilomètres en miles (1 kilomètre = 0,6214 mile) — et peut convertir entre n’importe quelle paire d’unités de longueur grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Kilomètres en miles est essentiel pour quiconque compare des panneaux routiers, des distances de course à pied/cyclisme ou des relevés de vitesse de véhicule entre des pays utilisant le système métrique et ceux (comme les États-Unis et le Royaume-Uni) utilisant encore les miles pour les distances routières.</p><p>Cet outil ne se limite pas aux km et aux miles : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de longueur.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 kilomètre = 0,621371 mile (et 1 mile = exactement 1,609344 kilomètre, par définition internationale).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de longueur quelconques.',
                '<b>Cas d’usage courant :</b> convertir la distance d’une course (par ex. un 10 km ou un marathon) ou le relevé du compteur de vitesse d’une voiture entre métrique et impérial.',
            ],
            howto: [
                { question: 'Combien de miles y a-t-il dans un kilomètre ?', answer: '<p>1 kilomètre équivaut à environ 0,6214 mile. Pour convertir des kilomètres en miles, multipliez la valeur en kilomètres par 0,6214.</p>' },
                { question: 'Puis-je convertir des miles en kilomètres avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Miles et Kilomètres respectivement.</p>' },
            ],
            inputs: lengthInputs('fr', '5'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-chilometri-a-miglia',
            title: 'Calcolatore da Chilometri a Miglia',
            h1: 'Calcolatore da Chilometri a Miglia',
            meta_title: 'Chilometri in Miglia | Convertitore di Qualsiasi Unità di Lunghezza',
            meta_description: 'Converti chilometri in miglia istantaneamente, o passa a qualsiasi altra unità di lunghezza — millimetri, centimetri, metri, pollici, piedi e iarde.',
            short_answer: 'Questo convertitore trasforma un valore di lunghezza da chilometri a miglia (1 chilometro = 0,6214 miglia) — e può convertire tra qualsiasi coppia di unità di lunghezza usando i selettori qui sotto.',
            intro_text: '<p>Chilometri in miglia è essenziale per chi confronta segnali stradali, distanze di corsa/ciclismo o letture di velocità dei veicoli tra paesi che usano il sistema metrico e quelli (come USA e Regno Unito) che usano ancora le miglia per le distanze stradali.</p><p>Questo strumento non si limita a km e miglia: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di lunghezza.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 chilometro = 0,621371 miglia (e 1 miglio = esattamente 1,609344 chilometri, per definizione internazionale).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di lunghezza qualsiasi.',
                '<b>Caso d’uso comune:</b> convertire la distanza di una gara (ad es. una 10K o una maratona) o la lettura del tachimetro di un’auto tra sistema metrico e imperiale.',
            ],
            howto: [
                { question: 'Quante miglia ci sono in un chilometro?', answer: '<p>1 chilometro equivale a circa 0,6214 miglia. Per convertire chilometri in miglia, moltiplica il valore in chilometri per 0,6214.</p>' },
                { question: 'Posso convertire le miglia in chilometri con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Miglia e Chilometri.</p>' },
            ],
            inputs: lengthInputs('it', '5'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'kilometer-in-meilen-rechner',
            title: 'Kilometer in Meilen Rechner',
            h1: 'Kilometer in Meilen Rechner',
            meta_title: 'Kilometer in Meilen | Umrechner für Jede Längeneinheit',
            meta_description: 'Rechnen Sie Kilometer sofort in Meilen um, oder wechseln Sie zu jeder anderen Längeneinheit — Millimeter, Zentimeter, Meter, Zoll, Fuß und Yards.',
            short_answer: 'Dieser Umrechner wandelt einen Längenwert von Kilometern in Meilen um (1 Kilometer = 0,6214 Meilen) — und kann zwischen jedem beliebigen Paar von Längeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Kilometer in Meilen ist unerlässlich für jeden, der Verkehrsschilder, Lauf-/Radstrecken oder Geschwindigkeitsanzeigen zwischen Ländern mit metrischem System und solchen (wie den USA und Großbritannien) vergleicht, die für Straßenentfernungen noch Meilen verwenden.</p><p>Dieses Tool beschränkt sich nicht auf km und Meilen: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Längeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Kilometer = 0,621371 Meilen (und 1 Meile = genau 1,609344 Kilometer, nach internationaler Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Längeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung einer Laufdistanz (z.B. 10 km oder Marathon) oder einer Tachoanzeige zwischen metrisch und imperial.',
            ],
            howto: [
                { question: 'Wie viele Meilen sind in einem Kilometer?', answer: '<p>1 Kilometer entspricht etwa 0,6214 Meilen. Um Kilometer in Meilen umzurechnen, multiplizieren Sie den Kilometerwert mit 0,6214.</p>' },
                { question: 'Kann ich mit diesem Tool Meilen zurück in Kilometer umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Meilen bzw. Kilometer.</p>' },
            ],
            inputs: lengthInputs('de', '5'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1072: Millimeters to Inches Converter
// ============================================================
const mmToInches: ToolDef = {
    id: '1072',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 25 },
            { key: 'from_unit', default: 'mm' },
            { key: 'to_unit', default: 'in' },
        ],
        functions: {
            result: { type: 'function', functionName: 'lengthConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'millimeters-to-inches-converter',
            title: 'Millimeters to Inches Converter',
            h1: 'Millimeters to Inches Converter',
            meta_title: 'Millimeters to Inches Converter | Convert Any Length Unit',
            meta_description: 'Convert millimeters to inches instantly, or switch to any other length unit — centimeters, meters, kilometers, feet, yards, and miles all supported.',
            short_answer: 'This converter changes a length value from millimeters to inches (1 millimeter = 0.0394 inches) — and can convert between any pair of length units using the selectors below.',
            intro_text: '<p>Millimeters to inches conversions come up constantly in engineering drawings, hardware specifications (bolt and screw sizes), and manufacturing tolerances, where the metric world uses millimeters and US-market parts are still specified in inches or fractions of an inch.</p><p>This tool isn\'t limited to mm and inches: use the "From" and "To" dropdowns to convert between any combination of millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 millimeter = 0.0393701 inches (and 1 inch = exactly 25.4 millimeters, by international definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two length units — not just millimeters and inches.',
                '<b>Precision matters:</b> for machining and hardware tolerances, use the full decimal result rather than rounding to a fraction unless your specification calls for it.',
            ],
            howto: [
                { question: 'How many inches are in a millimeter?', answer: '<p>1 millimeter equals approximately 0.03937 inches. To convert millimeters to inches, divide the millimeter value by 25.4.</p>' },
                { question: 'Can I convert inches back to millimeters with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Inches and Millimeters respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: lengthInputs('en', '25'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-millimetry-v-dyuymy',
            title: 'Конвертер миллиметров в дюймы',
            h1: 'Конвертер миллиметров в дюймы',
            meta_title: 'Миллиметры в дюймы | Конвертер любых единиц длины',
            meta_description: 'Конвертируйте миллиметры в дюймы мгновенно, или переключитесь на любую другую единицу длины — сантиметры, метры, километры, футы, ярды и мили.',
            short_answer: 'Этот конвертер переводит значение длины из миллиметров в дюймы (1 миллиметр = 0,0394 дюйма) — а также может конвертировать между любой парой единиц длины с помощью селекторов ниже.',
            intro_text: '<p>Конверсии миллиметров в дюймы постоянно встречаются в инженерных чертежах, спецификациях крепежа (размеры болтов и винтов) и производственных допусках, где метрический мир использует миллиметры, а американские детали всё ещё указываются в дюймах или долях дюйма.</p><p>Этот инструмент не ограничивается мм и дюймами: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц длины.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 миллиметр = 0,0393701 дюйма (а 1 дюйм = ровно 25,4 миллиметра, по международному определению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами длины.',
                '<b>Точность важна:</b> для механической обработки и допусков крепежа используйте полный десятичный результат, а не округление до дроби, если только ваша спецификация этого не требует.',
            ],
            howto: [
                { question: 'Сколько дюймов в миллиметре?', answer: '<p>1 миллиметр равен примерно 0,03937 дюйма. Чтобы конвертировать миллиметры в дюймы, разделите значение в миллиметрах на 25,4.</p>' },
                { question: 'Могу ли я конвертировать дюймы обратно в миллиметры этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Дюймы и Миллиметры соответственно.</p>' },
            ],
            inputs: lengthInputs('ru', '25'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'milimetru-uz-collam-kalkulators',
            title: 'Milimetru uz Collām Kalkulators',
            h1: 'Milimetru uz Collām Kalkulators',
            meta_title: 'Milimetri uz Collas | Jebkuras Garuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet milimetrus uz collām acumirklī, vai pārslēdzieties uz jebkuru citu garuma vienību — centimetriem, metriem, kilometriem, pēdām, jardiem un jūdzēm.',
            short_answer: 'Šis konvertētājs pārvērš garuma vērtību no milimetriem uz collām (1 milimetrs = 0,0394 collas) — un var konvertēt starp jebkuru garuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Milimetru uz collām konversijas pastāvīgi parādās inženiertehniskajos zīmējumos, aparatūras specifikācijās (bultskrūvju un skrūvju izmēri) un ražošanas pielaidēs, kur metriskā pasaule izmanto milimetrus, bet ASV tirgus detaļas joprojām tiek norādītas collās vai collu daļās.</p><p>Šis rīks neaprobežojas ar mm un collām: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru garuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 milimetrs = 0,0393701 collas (un 1 colla = tieši 25,4 milimetri, pēc starptautiskas definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām garuma vienībām.',
                '<b>Precizitāte ir svarīga:</b> mehāniskajai apstrādei un aparatūras pielaidēm izmantojiet pilnu decimāldaļskaitli, nevis noapaļojiet līdz daļai, ja vien specifikācija to neprasa.',
            ],
            howto: [
                { question: 'Cik collu ir milimetrā?', answer: '<p>1 milimetrs ir aptuveni 0,03937 collas. Lai konvertētu milimetrus uz collām, daliet milimetru vērtību ar 25,4.</p>' },
                { question: 'Vai varu konvertēt collas atpakaļ uz milimetriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Collām un Milimetriem.</p>' },
            ],
            inputs: lengthInputs('lv', '25'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-milimetrow-na-cale',
            title: 'Kalkulator Milimetrów na Cale',
            h1: 'Kalkulator Milimetrów na Cale',
            meta_title: 'Milimetry na Cale | Konwerter Dowolnej Jednostki Długości',
            meta_description: 'Przelicz milimetry na cale natychmiast lub przełącz się na dowolną inną jednostkę długości — centymetry, metry, kilometry, stopy, jardy i mile.',
            short_answer: 'Ten konwerter zmienia wartość długości z milimetrów na cale (1 milimetr = 0,0394 cala) — może też przeliczać między dowolną parą jednostek długości za pomocą selektorów poniżej.',
            intro_text: '<p>Konwersje milimetrów na cale pojawiają się stale w rysunkach inżynieryjnych, specyfikacjach elementów złącznych (rozmiary śrub i wkrętów) oraz tolerancjach produkcyjnych, gdzie świat metryczny używa milimetrów, a części rynku amerykańskiego wciąż są podawane w calach lub ułamkach cala.</p><p>To narzędzie nie ogranicza się do mm i cali: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek długości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 milimetr = 0,0393701 cala (a 1 cal = dokładnie 25,4 milimetra, według międzynarodowej definicji).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami długości.',
                '<b>Precyzja ma znaczenie:</b> przy obróbce mechanicznej i tolerancjach elementów złącznych używaj pełnego wyniku dziesiętnego, a nie zaokrąglenia do ułamka, chyba że wymaga tego specyfikacja.',
            ],
            howto: [
                { question: 'Ile cali jest w milimetrze?', answer: '<p>1 milimetr to około 0,03937 cala. Aby przeliczyć milimetry na cale, podziel wartość w milimetrach przez 25,4.</p>' },
                { question: 'Czy mogę przeliczyć cale z powrotem na milimetry tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Cale i Milimetry.</p>' },
            ],
            inputs: lengthInputs('pl', '25'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-milimetros-a-pulgadas',
            title: 'Calculadora de Milímetros a Pulgadas',
            h1: 'Calculadora de Milímetros a Pulgadas',
            meta_title: 'Milímetros a Pulgadas | Convertidor de Cualquier Unidad de Longitud',
            meta_description: 'Convierte milímetros a pulgadas al instante, o cambia a cualquier otra unidad de longitud — centímetros, metros, kilómetros, pies, yardas y millas.',
            short_answer: 'Este convertidor cambia un valor de longitud de milímetros a pulgadas (1 milímetro = 0,0394 pulgadas) — y puede convertir entre cualquier par de unidades de longitud usando los selectores de abajo.',
            intro_text: '<p>Las conversiones de milímetros a pulgadas surgen constantemente en dibujos de ingeniería, especificaciones de tornillería (tamaños de tornillos y pernos) y tolerancias de fabricación, donde el mundo métrico usa milímetros y las piezas del mercado estadounidense aún se especifican en pulgadas o fracciones de pulgada.</p><p>Esta herramienta no se limita a mm y pulgadas: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de longitud.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 milímetro = 0,0393701 pulgadas (y 1 pulgada = exactamente 25,4 milímetros, por definición internacional).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de longitud cualesquiera.',
                '<b>La precisión importa:</b> para mecanizado y tolerancias de tornillería, usa el resultado decimal completo en lugar de redondear a una fracción, a menos que tu especificación lo requiera.',
            ],
            howto: [
                { question: '¿Cuántas pulgadas hay en un milímetro?', answer: '<p>1 milímetro equivale a aproximadamente 0,03937 pulgadas. Para convertir milímetros a pulgadas, divide el valor en milímetros entre 25,4.</p>' },
                { question: '¿Puedo convertir pulgadas de vuelta a milímetros con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Pulgadas y Milímetros respectivamente.</p>' },
            ],
            inputs: lengthInputs('es', '25'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-millimetres-en-pouces',
            title: 'Calculateur de Millimètres en Pouces',
            h1: 'Calculateur de Millimètres en Pouces',
            meta_title: 'Millimètres en Pouces | Convertisseur de Toute Unité de Longueur',
            meta_description: 'Convertissez des millimètres en pouces instantanément, ou passez à toute autre unité de longueur — centimètres, mètres, kilomètres, pieds, yards et miles.',
            short_answer: 'Ce convertisseur transforme une valeur de longueur de millimètres en pouces (1 millimètre = 0,0394 pouce) — et peut convertir entre n’importe quelle paire d’unités de longueur grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Les conversions de millimètres en pouces reviennent constamment dans les dessins techniques, les spécifications de quincaillerie (tailles de boulons et de vis) et les tolérances de fabrication, où le monde métrique utilise les millimètres et les pièces du marché américain sont encore spécifiées en pouces ou en fractions de pouce.</p><p>Cet outil ne se limite pas aux mm et aux pouces : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de longueur.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 millimètre = 0,0393701 pouce (et 1 pouce = exactement 25,4 millimètres, par définition internationale).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de longueur quelconques.',
                '<b>La précision compte :</b> pour l’usinage et les tolérances de quincaillerie, utilisez le résultat décimal complet plutôt que d’arrondir à une fraction, sauf si votre spécification l’exige.',
            ],
            howto: [
                { question: 'Combien de pouces y a-t-il dans un millimètre ?', answer: '<p>1 millimètre équivaut à environ 0,03937 pouce. Pour convertir des millimètres en pouces, divisez la valeur en millimètres par 25,4.</p>' },
                { question: 'Puis-je convertir des pouces en millimètres avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Pouces et Millimètres respectivement.</p>' },
            ],
            inputs: lengthInputs('fr', '25'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-millimetri-a-pollici',
            title: 'Calcolatore da Millimetri a Pollici',
            h1: 'Calcolatore da Millimetri a Pollici',
            meta_title: 'Millimetri in Pollici | Convertitore di Qualsiasi Unità di Lunghezza',
            meta_description: 'Converti millimetri in pollici istantaneamente, o passa a qualsiasi altra unità di lunghezza — centimetri, metri, chilometri, piedi, iarde e miglia.',
            short_answer: 'Questo convertitore trasforma un valore di lunghezza da millimetri a pollici (1 millimetro = 0,0394 pollici) — e può convertire tra qualsiasi coppia di unità di lunghezza usando i selettori qui sotto.',
            intro_text: '<p>Le conversioni da millimetri a pollici ricorrono costantemente nei disegni tecnici, nelle specifiche della viteria (dimensioni di bulloni e viti) e nelle tolleranze di produzione, dove il mondo metrico usa i millimetri e i componenti del mercato statunitense sono ancora specificati in pollici o frazioni di pollice.</p><p>Questo strumento non si limita a mm e pollici: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di lunghezza.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 millimetro = 0,0393701 pollici (e 1 pollice = esattamente 25,4 millimetri, per definizione internazionale).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di lunghezza qualsiasi.',
                '<b>La precisione conta:</b> per lavorazioni meccaniche e tolleranze della viteria, usa il risultato decimale completo invece di arrotondare a una frazione, a meno che la tua specifica non lo richieda.',
            ],
            howto: [
                { question: 'Quanti pollici ci sono in un millimetro?', answer: '<p>1 millimetro equivale a circa 0,03937 pollici. Per convertire millimetri in pollici, dividi il valore in millimetri per 25,4.</p>' },
                { question: 'Posso convertire i pollici in millimetri con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Pollici e Millimetri.</p>' },
            ],
            inputs: lengthInputs('it', '25'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'millimeter-in-zoll-rechner',
            title: 'Millimeter in Zoll Rechner',
            h1: 'Millimeter in Zoll Rechner',
            meta_title: 'Millimeter in Zoll | Umrechner für Jede Längeneinheit',
            meta_description: 'Rechnen Sie Millimeter sofort in Zoll um, oder wechseln Sie zu jeder anderen Längeneinheit — Zentimeter, Meter, Kilometer, Fuß, Yards und Meilen.',
            short_answer: 'Dieser Umrechner wandelt einen Längenwert von Millimetern in Zoll um (1 Millimeter = 0,0394 Zoll) — und kann zwischen jedem beliebigen Paar von Längeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Millimeter-zu-Zoll-Umrechnungen kommen ständig in technischen Zeichnungen, Beschlagsspezifikationen (Schrauben- und Bolzengrößen) und Fertigungstoleranzen vor, wo die metrische Welt Millimeter verwendet und US-Marktteile weiterhin in Zoll oder Zollbruchteilen angegeben werden.</p><p>Dieses Tool beschränkt sich nicht auf mm und Zoll: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Längeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Millimeter = 0,0393701 Zoll (und 1 Zoll = genau 25,4 Millimeter, nach internationaler Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Längeneinheiten umzurechnen.',
                '<b>Präzision zählt:</b> für Bearbeitung und Beschlagstoleranzen verwenden Sie das vollständige Dezimalergebnis, statt auf einen Bruch zu runden, sofern Ihre Spezifikation dies nicht verlangt.',
            ],
            howto: [
                { question: 'Wie viele Zoll sind in einem Millimeter?', answer: '<p>1 Millimeter entspricht etwa 0,03937 Zoll. Um Millimeter in Zoll umzurechnen, teilen Sie den Millimeterwert durch 25,4.</p>' },
                { question: 'Kann ich mit diesem Tool Zoll zurück in Millimeter umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Zoll bzw. Millimeter.</p>' },
            ],
            inputs: lengthInputs('de', '25'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1073: Yards to Meters Converter
// ============================================================
const ydToMeters: ToolDef = {
    id: '1073',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'yd' },
            { key: 'to_unit', default: 'm' },
        ],
        functions: {
            result: { type: 'function', functionName: 'lengthConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'yards-to-meters-converter',
            title: 'Yards to Meters Converter',
            h1: 'Yards to Meters Converter',
            meta_title: 'Yards to Meters Converter | Convert Any Length Unit',
            meta_description: 'Convert yards to meters instantly, or switch to any other length unit — millimeters, centimeters, kilometers, inches, feet, and miles all supported.',
            short_answer: 'This converter changes a length value from yards to meters (1 yard = 0.9144 meters) — and can convert between any pair of length units using the selectors below.',
            intro_text: '<p>Yards to meters conversions come up in sports (American football fields, athletics track markings), fabric and carpet measurements, and landscaping — yards are a common imperial unit for mid-range distances, while meters are the metric equivalent used almost everywhere else.</p><p>This tool isn\'t limited to yards and meters: use the "From" and "To" dropdowns to convert between any combination of millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 yard = 0.9144 meters exactly (by international definition, since 1 yard = 3 feet = 36 inches = 36 × 0.0254 meters).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two length units — not just yards and meters.',
                '<b>Common use case:</b> converting fabric, carpet, or turf measurements sold by the yard into metric quantities for a project spec sheet.',
            ],
            howto: [
                { question: 'How many meters are in a yard?', answer: '<p>1 yard equals exactly 0.9144 meters. To convert yards to meters, multiply the yard value by 0.9144.</p>' },
                { question: 'Can I convert meters back to yards with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Meters and Yards respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: lengthInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-yardy-v-metry',
            title: 'Конвертер ярдов в метры',
            h1: 'Конвертер ярдов в метры',
            meta_title: 'Ярды в метры | Конвертер любых единиц длины',
            meta_description: 'Конвертируйте ярды в метры мгновенно, или переключитесь на любую другую единицу длины — миллиметры, сантиметры, километры, дюймы, футы и мили.',
            short_answer: 'Этот конвертер переводит значение длины из ярдов в метры (1 ярд = 0,9144 метра) — а также может конвертировать между любой парой единиц длины с помощью селекторов ниже.',
            intro_text: '<p>Конверсии ярдов в метры встречаются в спорте (поля американского футбола, разметка легкоатлетических дорожек), измерениях ткани и ковров, а также в ландшафтном дизайне — ярды являются распространённой имперской единицей для средних расстояний, а метры — их метрический эквивалент, используемый почти везде.</p><p>Этот инструмент не ограничивается ярдами и метрами: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц длины.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 ярд = ровно 0,9144 метра (по международному определению, поскольку 1 ярд = 3 фута = 36 дюймов).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами длины.',
                '<b>Частый случай использования:</b> конвертация измерений ткани, ковра или газона, продаваемых на ярды, в метрические величины для проектной спецификации.',
            ],
            howto: [
                { question: 'Сколько метров в ярде?', answer: '<p>1 ярд равен ровно 0,9144 метра. Чтобы конвертировать ярды в метры, умножьте значение в ярдах на 0,9144.</p>' },
                { question: 'Могу ли я конвертировать метры обратно в ярды этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Метры и Ярды соответственно.</p>' },
            ],
            inputs: lengthInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'jardu-uz-metriem-kalkulators',
            title: 'Jardu uz Metriem Kalkulators',
            h1: 'Jardu uz Metriem Kalkulators',
            meta_title: 'Jardi uz Metriem | Jebkuras Garuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet jardus uz metriem acumirklī, vai pārslēdzieties uz jebkuru citu garuma vienību — milimetriem, centimetriem, kilometriem, collām, pēdām un jūdzēm.',
            short_answer: 'Šis konvertētājs pārvērš garuma vērtību no jardiem uz metriem (1 jards = 0,9144 metri) — un var konvertēt starp jebkuru garuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Jardu uz metriem konversijas parādās sportā (Amerikas futbola laukumi, vieglatlētikas trases atzīmes), auduma un paklāju mērījumos, kā arī ainavu dizainā — jardi ir izplatīta imperiālā vienība vidēja attāluma mērījumiem, kamēr metri ir to metriskais ekvivalents, ko izmanto gandrīz visur.</p><p>Šis rīks neaprobežojas ar jardiem un metriem: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru garuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 jards = tieši 0,9144 metri (pēc starptautiskas definīcijas, jo 1 jards = 3 pēdas = 36 collas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām garuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> auduma, paklāja vai zāliena mērījumu, kas tiek pārdoti jardos, konvertēšana metriskajos daudzumos projekta specifikācijai.',
            ],
            howto: [
                { question: 'Cik metru ir jardā?', answer: '<p>1 jards ir tieši 0,9144 metri. Lai konvertētu jardus uz metriem, reiziniet jardu vērtību ar 0,9144.</p>' },
                { question: 'Vai varu konvertēt metrus atpakaļ uz jardiem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Metriem un Jardiem.</p>' },
            ],
            inputs: lengthInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-jardow-na-metry',
            title: 'Kalkulator Jardów na Metry',
            h1: 'Kalkulator Jardów na Metry',
            meta_title: 'Jardy na Metry | Konwerter Dowolnej Jednostki Długości',
            meta_description: 'Przelicz jardy na metry natychmiast lub przełącz się na dowolną inną jednostkę długości — milimetry, centymetry, kilometry, cale, stopy i mile.',
            short_answer: 'Ten konwerter zmienia wartość długości z jardów na metry (1 jard = 0,9144 metra) — może też przeliczać między dowolną parą jednostek długości za pomocą selektorów poniżej.',
            intro_text: '<p>Konwersje jardów na metry pojawiają się w sporcie (boiska futbolu amerykańskiego, oznaczenia bieżni lekkoatletycznych), pomiarach tkanin i dywanów oraz w ogrodnictwie krajobrazowym — jardy to popularna jednostka imperialna dla średnich odległości, podczas gdy metry to ich metryczny odpowiednik używany niemal wszędzie indziej.</p><p>To narzędzie nie ogranicza się do jardów i metrów: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek długości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 jard = dokładnie 0,9144 metra (według międzynarodowej definicji, ponieważ 1 jard = 3 stopy = 36 cali).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami długości.',
                '<b>Częsty przypadek użycia:</b> przeliczanie pomiarów tkaniny, dywanu lub trawy sprzedawanych na jardy na wartości metryczne dla arkusza specyfikacji projektu.',
            ],
            howto: [
                { question: 'Ile metrów jest w jardzie?', answer: '<p>1 jard to dokładnie 0,9144 metra. Aby przeliczyć jardy na metry, pomnóż wartość w jardach przez 0,9144.</p>' },
                { question: 'Czy mogę przeliczyć metry z powrotem na jardy tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Metry i Jardy.</p>' },
            ],
            inputs: lengthInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-yardas-a-metros',
            title: 'Calculadora de Yardas a Metros',
            h1: 'Calculadora de Yardas a Metros',
            meta_title: 'Yardas a Metros | Convertidor de Cualquier Unidad de Longitud',
            meta_description: 'Convierte yardas a metros al instante, o cambia a cualquier otra unidad de longitud — milímetros, centímetros, kilómetros, pulgadas, pies y millas.',
            short_answer: 'Este convertidor cambia un valor de longitud de yardas a metros (1 yarda = 0,9144 metros) — y puede convertir entre cualquier par de unidades de longitud usando los selectores de abajo.',
            intro_text: '<p>Las conversiones de yardas a metros aparecen en deportes (campos de fútbol americano, marcas de pistas de atletismo), medidas de tela y alfombras, y jardinería paisajística — las yardas son una unidad imperial común para distancias medias, mientras que los metros son su equivalente métrico usado en casi todos los demás lugares.</p><p>Esta herramienta no se limita a yardas y metros: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de longitud.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 yarda = exactamente 0,9144 metros (por definición internacional, ya que 1 yarda = 3 pies = 36 pulgadas).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de longitud cualesquiera.',
                '<b>Caso de uso común:</b> convertir medidas de tela, alfombra o césped vendidas por yarda a cantidades métricas para una hoja de especificaciones de proyecto.',
            ],
            howto: [
                { question: '¿Cuántos metros hay en una yarda?', answer: '<p>1 yarda equivale exactamente a 0,9144 metros. Para convertir yardas a metros, multiplica el valor en yardas por 0,9144.</p>' },
                { question: '¿Puedo convertir metros de vuelta a yardas con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Metros y Yardas respectivamente.</p>' },
            ],
            inputs: lengthInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-yards-en-metres',
            title: 'Calculateur de Yards en Mètres',
            h1: 'Calculateur de Yards en Mètres',
            meta_title: 'Yards en Mètres | Convertisseur de Toute Unité de Longueur',
            meta_description: 'Convertissez des yards en mètres instantanément, ou passez à toute autre unité de longueur — millimètres, centimètres, kilomètres, pouces, pieds et miles.',
            short_answer: 'Ce convertisseur transforme une valeur de longueur de yards en mètres (1 yard = 0,9144 mètre) — et peut convertir entre n’importe quelle paire d’unités de longueur grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Les conversions de yards en mètres reviennent dans le sport (terrains de football américain, marquages de pistes d’athlétisme), les mesures de tissu et de moquette, et l’aménagement paysager — le yard est une unité impériale courante pour les distances moyennes, tandis que le mètre est son équivalent métrique utilisé presque partout ailleurs.</p><p>Cet outil ne se limite pas aux yards et aux mètres : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de longueur.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 yard = exactement 0,9144 mètre (par définition internationale, puisque 1 yard = 3 pieds = 36 pouces).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de longueur quelconques.',
                '<b>Cas d’usage courant :</b> convertir des mesures de tissu, de moquette ou de gazon vendues au yard en quantités métriques pour une fiche de spécifications de projet.',
            ],
            howto: [
                { question: 'Combien de mètres y a-t-il dans un yard ?', answer: '<p>1 yard équivaut exactement à 0,9144 mètre. Pour convertir des yards en mètres, multipliez la valeur en yards par 0,9144.</p>' },
                { question: 'Puis-je convertir des mètres en yards avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Mètres et Yards respectivement.</p>' },
            ],
            inputs: lengthInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-iarde-a-metri',
            title: 'Calcolatore da Iarde a Metri',
            h1: 'Calcolatore da Iarde a Metri',
            meta_title: 'Iarde in Metri | Convertitore di Qualsiasi Unità di Lunghezza',
            meta_description: 'Converti iarde in metri istantaneamente, o passa a qualsiasi altra unità di lunghezza — millimetri, centimetri, chilometri, pollici, piedi e miglia.',
            short_answer: 'Questo convertitore trasforma un valore di lunghezza da iarde a metri (1 iarda = 0,9144 metri) — e può convertire tra qualsiasi coppia di unità di lunghezza usando i selettori qui sotto.',
            intro_text: '<p>Le conversioni da iarde a metri ricorrono nello sport (campi di football americano, segnature delle piste di atletica), nelle misure di tessuti e tappeti e nel giardinaggio paesaggistico — le iarde sono un’unità imperiale comune per le distanze medie, mentre i metri sono il loro equivalente metrico usato quasi ovunque altrove.</p><p>Questo strumento non si limita a iarde e metri: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di lunghezza.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 iarda = esattamente 0,9144 metri (per definizione internazionale, poiché 1 iarda = 3 piedi = 36 pollici).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di lunghezza qualsiasi.',
                '<b>Caso d’uso comune:</b> convertire misure di tessuto, tappeto o erba vendute a iarda in quantità metriche per una scheda di specifica del progetto.',
            ],
            howto: [
                { question: 'Quanti metri ci sono in una iarda?', answer: '<p>1 iarda equivale esattamente a 0,9144 metri. Per convertire iarde in metri, moltiplica il valore in iarde per 0,9144.</p>' },
                { question: 'Posso convertire i metri in iarde con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Metri e Iarde.</p>' },
            ],
            inputs: lengthInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'yard-in-meter-rechner',
            title: 'Yard in Meter Rechner',
            h1: 'Yard in Meter Rechner',
            meta_title: 'Yard in Meter | Umrechner für Jede Längeneinheit',
            meta_description: 'Rechnen Sie Yards sofort in Meter um, oder wechseln Sie zu jeder anderen Längeneinheit — Millimeter, Zentimeter, Kilometer, Zoll, Fuß und Meilen.',
            short_answer: 'Dieser Umrechner wandelt einen Längenwert von Yards in Meter um (1 Yard = 0,9144 Meter) — und kann zwischen jedem beliebigen Paar von Längeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Yard-zu-Meter-Umrechnungen kommen im Sport vor (American-Football-Felder, Leichtathletik-Bahnmarkierungen), bei Stoff- und Teppichmaßen sowie im Landschaftsbau — Yards sind eine gängige imperiale Einheit für mittlere Entfernungen, während Meter das metrische Äquivalent sind, das fast überall sonst verwendet wird.</p><p>Dieses Tool beschränkt sich nicht auf Yards und Meter: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Längeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Yard = genau 0,9144 Meter (nach internationaler Definition, da 1 Yard = 3 Fuß = 36 Zoll).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Längeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung von Stoff-, Teppich- oder Rasenmaßen, die pro Yard verkauft werden, in metrische Mengen für ein Projektspezifikationsblatt.',
            ],
            howto: [
                { question: 'Wie viele Meter sind in einem Yard?', answer: '<p>1 Yard entspricht genau 0,9144 Metern. Um Yards in Meter umzurechnen, multiplizieren Sie den Yard-Wert mit 0,9144.</p>' },
                { question: 'Kann ich mit diesem Tool Meter zurück in Yards umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Meter bzw. Yard.</p>' },
            ],
            inputs: lengthInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1074: Feet to Inches Converter
// ============================================================
const ftToInches: ToolDef = {
    id: '1074',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 6 },
            { key: 'from_unit', default: 'ft' },
            { key: 'to_unit', default: 'in' },
        ],
        functions: {
            result: { type: 'function', functionName: 'lengthConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'feet-to-inches-converter',
            title: 'Feet to Inches Converter',
            h1: 'Feet to Inches Converter',
            meta_title: 'Feet to Inches Converter | Convert Any Length Unit',
            meta_description: 'Convert feet to inches instantly, or switch to any other length unit — millimeters, centimeters, meters, kilometers, yards, and miles all supported.',
            short_answer: 'This converter changes a length value from feet to inches (1 foot = 12 inches) — and can convert between any pair of length units using the selectors below.',
            intro_text: '<p>Feet to inches is a within-imperial conversion used constantly for height (converting a "5 feet 8 inches" style height into a single number of inches), furniture and room dimensions, and any US/UK measurement expressed with mixed feet-and-inches notation.</p><p>This tool goes beyond feet and inches: use the "From" and "To" dropdowns to convert between any combination of millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 foot = exactly 12 inches, by definition — this is the one conversion on this page with no rounding at all.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two length units — not just feet and inches.',
                '<b>Common use case:</b> converting a height like "5 ft 8 in" into a single inches figure (5 × 12 + 8 = 68 inches) for medical, fitness, or sizing calculators that expect one number.',
            ],
            howto: [
                { question: 'How many inches are in a foot?', answer: '<p>1 foot equals exactly 12 inches. To convert feet to inches, multiply the foot value by 12.</p>' },
                { question: 'How do I convert a height like 5 feet 8 inches to total inches?', answer: '<p>Convert the feet portion to inches (5 × 12 = 60), then add the remaining inches (60 + 8 = 68 inches total). This calculator handles the feet-to-inches part of that math.</p>' },
            ],
            inputs: lengthInputs('en', '6'),
            outputs: resultOutput('en', 2),
        },
        ru: {
            slug: 'kalkulyator-futy-v-dyuymy',
            title: 'Конвертер футов в дюймы',
            h1: 'Конвертер футов в дюймы',
            meta_title: 'Футы в дюймы | Конвертер любых единиц длины',
            meta_description: 'Конвертируйте футы в дюймы мгновенно, или переключитесь на любую другую единицу длины — миллиметры, сантиметры, метры, километры, ярды и мили.',
            short_answer: 'Этот конвертер переводит значение длины из футов в дюймы (1 фут = 12 дюймов) — а также может конвертировать между любой парой единиц длины с помощью селекторов ниже.',
            intro_text: '<p>Футы в дюймы — это конверсия внутри имперской системы, постоянно используемая для роста (перевод роста вида "5 футов 8 дюймов" в единое число дюймов), размеров мебели и комнат, а также любых американских/британских измерений, выраженных в смешанной нотации футов и дюймов.</p><p>Этот инструмент выходит за рамки футов и дюймов: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц длины.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 фут = ровно 12 дюймов, по определению — это единственная конверсия на этой странице без какого-либо округления.',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами длины.',
                '<b>Частый случай использования:</b> перевод роста вида "5 футов 8 дюймов" в единое число дюймов (5 × 12 + 8 = 68 дюймов) для медицинских, фитнес- или размерных калькуляторов, ожидающих одно число.',
            ],
            howto: [
                { question: 'Сколько дюймов в футе?', answer: '<p>1 фут равен ровно 12 дюймам. Чтобы конвертировать футы в дюймы, умножьте значение в футах на 12.</p>' },
                { question: 'Как перевести рост вида 5 футов 8 дюймов в общее число дюймов?', answer: '<p>Переведите часть в футах в дюймы (5 × 12 = 60), затем добавьте оставшиеся дюймы (60 + 8 = 68 дюймов всего). Этот калькулятор обрабатывает часть с футами в дюймы.</p>' },
            ],
            inputs: lengthInputs('ru', '6'),
            outputs: resultOutput('ru', 2),
        },
        lv: {
            slug: 'pedu-uz-collam-kalkulators',
            title: 'Pēdu uz Collām Kalkulators',
            h1: 'Pēdu uz Collām Kalkulators',
            meta_title: 'Pēdas uz Collas | Jebkuras Garuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet pēdas uz collām acumirklī, vai pārslēdzieties uz jebkuru citu garuma vienību — milimetriem, centimetriem, metriem, kilometriem, jardiem un jūdzēm.',
            short_answer: 'Šis konvertētājs pārvērš garuma vērtību no pēdām uz collām (1 pēda = 12 collas) — un var konvertēt starp jebkuru garuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Pēdas uz collām ir konversija imperiālās sistēmas ietvaros, ko pastāvīgi izmanto auguma (piemēram, "5 pēdas 8 collas" pārvēršanai vienā collu skaitā), mēbeļu un istabu izmēru, kā arī jebkuru ASV/Lielbritānijas mērījumu izteikšanai jauktā pēdu-collu apzīmējumā.</p><p>Šis rīks sniedzas tālāk par pēdām un collām: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru garuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 pēda = tieši 12 collas, pēc definīcijas — tā ir vienīgā konversija šajā lapā bez jebkādas noapaļošanas.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām garuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> auguma, piemēram, "5 pēdas 8 collas", pārvēršana vienā collu skaitā (5 × 12 + 8 = 68 collas) medicīnas, fitnesa vai izmēru kalkulatoriem, kas gaida vienu skaitli.',
            ],
            howto: [
                { question: 'Cik collu ir pēdā?', answer: '<p>1 pēda ir tieši 12 collas. Lai konvertētu pēdas uz collām, reiziniet pēdu vērtību ar 12.</p>' },
                { question: 'Kā pārvērst augumu, piemēram, 5 pēdas 8 collas, kopējā collu skaitā?', answer: '<p>Pārvērtiet pēdu daļu collās (5 × 12 = 60), tad pievienojiet atlikušās collas (60 + 8 = 68 collas kopā). Šis kalkulators apstrādā pēdu-uz-collu daļu no šī aprēķina.</p>' },
            ],
            inputs: lengthInputs('lv', '6'),
            outputs: resultOutput('lv', 2),
        },
        pl: {
            slug: 'kalkulator-stop-na-cale',
            title: 'Kalkulator Stóp na Cale',
            h1: 'Kalkulator Stóp na Cale',
            meta_title: 'Stopy na Cale | Konwerter Dowolnej Jednostki Długości',
            meta_description: 'Przelicz stopy na cale natychmiast lub przełącz się na dowolną inną jednostkę długości — milimetry, centymetry, metry, kilometry, jardy i mile.',
            short_answer: 'Ten konwerter zmienia wartość długości ze stóp na cale (1 stopa = 12 cali) — może też przeliczać między dowolną parą jednostek długości za pomocą selektorów poniżej.',
            intro_text: '<p>Stopy na cale to konwersja w ramach systemu imperialnego, używana stale do wzrostu (przeliczenie wzrostu typu "5 stóp 8 cali" na pojedynczą liczbę cali), wymiarów mebli i pomieszczeń oraz wszelkich pomiarów amerykańskich/brytyjskich wyrażonych w mieszanej notacji stopy-cale.</p><p>To narzędzie wykracza poza stopy i cale: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek długości.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 stopa = dokładnie 12 cali, z definicji — to jedyna konwersja na tej stronie bez żadnego zaokrąglenia.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami długości.',
                '<b>Częsty przypadek użycia:</b> przeliczanie wzrostu typu "5 stóp 8 cali" na pojedynczą wartość w calach (5 × 12 + 8 = 68 cali) dla kalkulatorów medycznych, fitness lub rozmiarów oczekujących jednej liczby.',
            ],
            howto: [
                { question: 'Ile cali jest w stopie?', answer: '<p>1 stopa to dokładnie 12 cali. Aby przeliczyć stopy na cale, pomnóż wartość w stopach przez 12.</p>' },
                { question: 'Jak przeliczyć wzrost typu 5 stóp 8 cali na łączną liczbę cali?', answer: '<p>Przelicz część w stopach na cale (5 × 12 = 60), następnie dodaj pozostałe cale (60 + 8 = 68 cali łącznie). Ten kalkulator obsługuje część stopy-na-cale tego obliczenia.</p>' },
            ],
            inputs: lengthInputs('pl', '6'),
            outputs: resultOutput('pl', 2),
        },
        es: {
            slug: 'calculadora-de-pies-a-pulgadas',
            title: 'Calculadora de Pies a Pulgadas',
            h1: 'Calculadora de Pies a Pulgadas',
            meta_title: 'Pies a Pulgadas | Convertidor de Cualquier Unidad de Longitud',
            meta_description: 'Convierte pies a pulgadas al instante, o cambia a cualquier otra unidad de longitud — milímetros, centímetros, metros, kilómetros, yardas y millas.',
            short_answer: 'Este convertidor cambia un valor de longitud de pies a pulgadas (1 pie = 12 pulgadas) — y puede convertir entre cualquier par de unidades de longitud usando los selectores de abajo.',
            intro_text: '<p>Pies a pulgadas es una conversión dentro del sistema imperial usada constantemente para la altura (convertir una altura tipo "5 pies 8 pulgadas" en un único número de pulgadas), dimensiones de muebles y habitaciones, y cualquier medida estadounidense/británica expresada en notación mixta de pies y pulgadas.</p><p>Esta herramienta va más allá de pies y pulgadas: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de longitud.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 pie = exactamente 12 pulgadas, por definición — esta es la única conversión en esta página sin ningún redondeo.',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de longitud cualesquiera.',
                '<b>Caso de uso común:</b> convertir una altura como "5 pies 8 pulgadas" en una sola cifra de pulgadas (5 × 12 + 8 = 68 pulgadas) para calculadoras médicas, de fitness o de tallas que esperan un solo número.',
            ],
            howto: [
                { question: '¿Cuántas pulgadas hay en un pie?', answer: '<p>1 pie equivale exactamente a 12 pulgadas. Para convertir pies a pulgadas, multiplica el valor en pies por 12.</p>' },
                { question: '¿Cómo convierto una altura como 5 pies 8 pulgadas a pulgadas totales?', answer: '<p>Convierte la parte en pies a pulgadas (5 × 12 = 60), luego suma las pulgadas restantes (60 + 8 = 68 pulgadas en total). Esta calculadora maneja la parte de pies a pulgadas de esa operación.</p>' },
            ],
            inputs: lengthInputs('es', '6'),
            outputs: resultOutput('es', 2),
        },
        fr: {
            slug: 'calculateur-de-pieds-en-pouces',
            title: 'Calculateur de Pieds en Pouces',
            h1: 'Calculateur de Pieds en Pouces',
            meta_title: 'Pieds en Pouces | Convertisseur de Toute Unité de Longueur',
            meta_description: 'Convertissez des pieds en pouces instantanément, ou passez à toute autre unité de longueur — millimètres, centimètres, mètres, kilomètres, yards et miles.',
            short_answer: 'Ce convertisseur transforme une valeur de longueur de pieds en pouces (1 pied = 12 pouces) — et peut convertir entre n’importe quelle paire d’unités de longueur grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Pieds en pouces est une conversion au sein du système impérial, utilisée constamment pour la taille (convertir une taille du type « 5 pieds 8 pouces » en un seul nombre de pouces), les dimensions de meubles et de pièces, et toute mesure américaine/britannique exprimée en notation mixte pieds-pouces.</p><p>Cet outil va au-delà des pieds et des pouces : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de longueur.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 pied = exactement 12 pouces, par définition — c’est la seule conversion de cette page sans aucun arrondi.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de longueur quelconques.',
                '<b>Cas d’usage courant :</b> convertir une taille comme « 5 pieds 8 pouces » en un seul chiffre de pouces (5 × 12 + 8 = 68 pouces) pour des calculateurs médicaux, de fitness ou de tailles attendant un seul nombre.',
            ],
            howto: [
                { question: 'Combien de pouces y a-t-il dans un pied ?', answer: '<p>1 pied équivaut exactement à 12 pouces. Pour convertir des pieds en pouces, multipliez la valeur en pieds par 12.</p>' },
                { question: 'Comment convertir une taille comme 5 pieds 8 pouces en pouces totaux ?', answer: '<p>Convertissez la partie en pieds en pouces (5 × 12 = 60), puis ajoutez les pouces restants (60 + 8 = 68 pouces au total). Ce calculateur gère la partie pieds-en-pouces de ce calcul.</p>' },
            ],
            inputs: lengthInputs('fr', '6'),
            outputs: resultOutput('fr', 2),
        },
        it: {
            slug: 'calcolatore-da-piedi-a-pollici',
            title: 'Calcolatore da Piedi a Pollici',
            h1: 'Calcolatore da Piedi a Pollici',
            meta_title: 'Piedi in Pollici | Convertitore di Qualsiasi Unità di Lunghezza',
            meta_description: 'Converti piedi in pollici istantaneamente, o passa a qualsiasi altra unità di lunghezza — millimetri, centimetri, metri, chilometri, iarde e miglia.',
            short_answer: 'Questo convertitore trasforma un valore di lunghezza da piedi a pollici (1 piede = 12 pollici) — e può convertire tra qualsiasi coppia di unità di lunghezza usando i selettori qui sotto.',
            intro_text: '<p>Piedi in pollici è una conversione all’interno del sistema imperiale, usata costantemente per l’altezza (convertire un’altezza tipo "5 piedi 8 pollici" in un unico numero di pollici), le dimensioni di mobili e stanze e qualsiasi misura statunitense/britannica espressa in notazione mista piedi-pollici.</p><p>Questo strumento va oltre piedi e pollici: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di lunghezza.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 piede = esattamente 12 pollici, per definizione — questa è l’unica conversione in questa pagina senza alcun arrotondamento.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di lunghezza qualsiasi.',
                '<b>Caso d’uso comune:</b> convertire un’altezza come "5 piedi 8 pollici" in un’unica cifra in pollici (5 × 12 + 8 = 68 pollici) per calcolatori medici, fitness o di taglia che si aspettano un solo numero.',
            ],
            howto: [
                { question: 'Quanti pollici ci sono in un piede?', answer: '<p>1 piede equivale esattamente a 12 pollici. Per convertire piedi in pollici, moltiplica il valore in piedi per 12.</p>' },
                { question: 'Come converto un’altezza come 5 piedi 8 pollici in pollici totali?', answer: '<p>Converti la parte in piedi in pollici (5 × 12 = 60), poi aggiungi i pollici rimanenti (60 + 8 = 68 pollici totali). Questo calcolatore gestisce la parte piedi-in-pollici di quel calcolo.</p>' },
            ],
            inputs: lengthInputs('it', '6'),
            outputs: resultOutput('it', 2),
        },
        de: {
            slug: 'fuss-in-zoll-rechner',
            title: 'Fuß in Zoll Rechner',
            h1: 'Fuß in Zoll Rechner',
            meta_title: 'Fuß in Zoll | Umrechner für Jede Längeneinheit',
            meta_description: 'Rechnen Sie Fuß sofort in Zoll um, oder wechseln Sie zu jeder anderen Längeneinheit — Millimeter, Zentimeter, Meter, Kilometer, Yards und Meilen.',
            short_answer: 'Dieser Umrechner wandelt einen Längenwert von Fuß in Zoll um (1 Fuß = 12 Zoll) — und kann zwischen jedem beliebigen Paar von Längeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Fuß in Zoll ist eine Umrechnung innerhalb des imperialen Systems, die ständig für Körpergröße (Umrechnung einer Größe wie "5 Fuß 8 Zoll" in eine einzige Zollzahl), Möbel- und Raummaße sowie jede US-/UK-Messung in gemischter Fuß-Zoll-Notation verwendet wird.</p><p>Dieses Tool geht über Fuß und Zoll hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Längeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Fuß = genau 12 Zoll, per Definition — dies ist die einzige Umrechnung auf dieser Seite ganz ohne Rundung.',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Längeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung einer Körpergröße wie "5 Fuß 8 Zoll" in eine einzige Zollzahl (5 × 12 + 8 = 68 Zoll) für medizinische, Fitness- oder Größenrechner, die eine einzelne Zahl erwarten.',
            ],
            howto: [
                { question: 'Wie viele Zoll sind in einem Fuß?', answer: '<p>1 Fuß entspricht genau 12 Zoll. Um Fuß in Zoll umzurechnen, multiplizieren Sie den Fußwert mit 12.</p>' },
                { question: 'Wie rechne ich eine Größe wie 5 Fuß 8 Zoll in Gesamtzoll um?', answer: '<p>Rechnen Sie den Fußanteil in Zoll um (5 × 12 = 60), addieren Sie dann die restlichen Zoll (60 + 8 = 68 Zoll insgesamt). Dieser Rechner übernimmt den Fuß-zu-Zoll-Teil dieser Rechnung.</p>' },
            ],
            inputs: lengthInputs('de', '6'),
            outputs: resultOutput('de', 2),
        },
    },
}

// ============================================================
// 1075: Square Meters to Square Feet Converter
// ============================================================
const m2ToFt2: ToolDef = {
    id: '1075',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 100 },
            { key: 'from_unit', default: 'm2' },
            { key: 'to_unit', default: 'ft2' },
        ],
        functions: {
            result: { type: 'function', functionName: 'areaConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'square-meters-to-square-feet-converter',
            title: 'Square Meters to Square Feet Converter',
            h1: 'Square Meters to Square Feet Converter',
            meta_title: 'Square Meters to Square Feet Converter | Convert Any Area Unit',
            meta_description: 'Convert square meters to square feet instantly, or switch to any other area unit — acres, hectares, square kilometers, square inches, and more all supported.',
            short_answer: 'This converter changes an area value from square meters to square feet (1 square meter = 10.7639 square feet) — and can convert between any pair of area units using the selectors below.',
            intro_text: '<p>Square meters to square feet is one of the most common real estate conversions, since property size in most of the world is listed in square meters while the US market lists floor area in square feet.</p><p>This tool goes beyond m² and ft²: use the "From" and "To" dropdowns to convert between any combination of square millimeters, square centimeters, square meters, square kilometers, square inches, square feet, square yards, acres, hectares, and square miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 square meter = 10.7639 square feet (since area scales with the square of the length factor: 1 m = 3.28084 ft, so 1 m² = 3.28084² ft²).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two area units — not just square meters and square feet.',
                '<b>Real estate context:</b> when comparing a property listed in m² against one listed in ft², remember area conversions are NOT linear like length — you can\'t just apply the length factor directly, you must square it (this calculator does that for you).',
            ],
            howto: [
                { question: 'How many square feet are in a square meter?', answer: '<p>1 square meter equals approximately 10.7639 square feet. To convert square meters to square feet, multiply the square meter value by 10.7639.</p>' },
                { question: 'Why can\'t I just multiply by the length conversion factor (3.28084)?', answer: '<p>Because area is two-dimensional — you have to square the length conversion factor (3.28084² ≈ 10.7639) to correctly convert area units, not apply it once as you would for a simple length conversion.</p>' },
            ],
            inputs: areaInputs('en', '100'),
            outputs: resultOutput('en', 2),
        },
        ru: {
            slug: 'kalkulyator-kvadratnye-metry-v-kvadratnye-futy',
            title: 'Конвертер квадратных метров в квадратные футы',
            h1: 'Конвертер квадратных метров в квадратные футы',
            meta_title: 'Квадратные метры в квадратные футы | Конвертер любых единиц площади',
            meta_description: 'Конвертируйте квадратные метры в квадратные футы мгновенно, или переключитесь на любую другую единицу площади — акры, гектары, квадратные километры и другие.',
            short_answer: 'Этот конвертер переводит значение площади из квадратных метров в квадратные футы (1 квадратный метр = 10,7639 квадратного фута) — а также может конвертировать между любой парой единиц площади с помощью селекторов ниже.',
            intro_text: '<p>Квадратные метры в квадратные футы — одна из самых распространённых конверсий в недвижимости, поскольку размер недвижимости в большей части мира указывается в квадратных метрах, а на американском рынке площадь пола указывается в квадратных футах.</p><p>Этот инструмент выходит за рамки м² и фут²: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц площади.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 квадратный метр = 10,7639 квадратного фута (поскольку площадь масштабируется квадратом коэффициента длины).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами площади.',
                '<b>Контекст недвижимости:</b> при сравнении недвижимости в м² с указанной в фут² помните, что конверсии площади НЕ линейны, как длина — нужно возводить коэффициент в квадрат (этот калькулятор делает это за вас).',
            ],
            howto: [
                { question: 'Сколько квадратных футов в квадратном метре?', answer: '<p>1 квадратный метр равен примерно 10,7639 квадратного фута. Чтобы конвертировать, умножьте значение в м² на 10,7639.</p>' },
                { question: 'Почему нельзя просто умножить на коэффициент конверсии длины (3,28084)?', answer: '<p>Потому что площадь двумерна — нужно возвести коэффициент длины в квадрат (3,28084² ≈ 10,7639), а не применять его один раз, как при простой конверсии длины.</p>' },
            ],
            inputs: areaInputs('ru', '100'),
            outputs: resultOutput('ru', 2),
        },
        lv: {
            slug: 'kvadratmetru-uz-kvadratpedam-kalkulators',
            title: 'Kvadrātmetru uz Kvadrātpēdām Kalkulators',
            h1: 'Kvadrātmetru uz Kvadrātpēdām Kalkulators',
            meta_title: 'Kvadrātmetri uz Kvadrātpēdām | Jebkuras Laukuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kvadrātmetrus uz kvadrātpēdām acumirklī, vai pārslēdzieties uz jebkuru citu laukuma vienību — akriem, hektāriem, kvadrātkilometriem un citām.',
            short_answer: 'Šis konvertētājs pārvērš laukuma vērtību no kvadrātmetriem uz kvadrātpēdām (1 kvadrātmetrs = 10,7639 kvadrātpēdas) — un var konvertēt starp jebkuru laukuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Kvadrātmetri uz kvadrātpēdām ir viena no visizplatītākajām nekustamā īpašuma konversijām, jo īpašuma izmērs lielākajā daļā pasaules tiek norādīts kvadrātmetros, bet ASV tirgū grīdas platība tiek norādīta kvadrātpēdās.</p><p>Šis rīks sniedzas tālāk par m² un pēdas²: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru laukuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kvadrātmetrs = 10,7639 kvadrātpēdas (jo laukums mainās proporcionāli garuma koeficienta kvadrātam).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām laukuma vienībām.',
                '<b>Nekustamā īpašuma konteksts:</b> salīdzinot īpašumu m² ar norādīto pēdās², atcerieties, ka laukuma konversijas NAV lineāras kā garums — jāreizina koeficients ar sevi (šis kalkulators to dara jūsu vietā).',
            ],
            howto: [
                { question: 'Cik kvadrātpēdu ir kvadrātmetrā?', answer: '<p>1 kvadrātmetrs ir aptuveni 10,7639 kvadrātpēdas. Lai konvertētu, reiziniet m² vērtību ar 10,7639.</p>' },
                { question: 'Kāpēc nevar vienkārši reizināt ar garuma konversijas koeficientu (3,28084)?', answer: '<p>Jo laukums ir divdimensiju — garuma koeficients jāceļ kvadrātā (3,28084² ≈ 10,7639), nevis jāpiemēro vienreiz kā vienkāršai garuma konversijai.</p>' },
            ],
            inputs: areaInputs('lv', '100'),
            outputs: resultOutput('lv', 2),
        },
        pl: {
            slug: 'kalkulator-metrow-kwadratowych-na-stopy-kwadratowe',
            title: 'Kalkulator Metrów Kwadratowych na Stopy Kwadratowe',
            h1: 'Kalkulator Metrów Kwadratowych na Stopy Kwadratowe',
            meta_title: 'Metry Kwadratowe na Stopy Kwadratowe | Konwerter Dowolnej Jednostki Powierzchni',
            meta_description: 'Przelicz metry kwadratowe na stopy kwadratowe natychmiast lub przełącz się na dowolną inną jednostkę powierzchni — akry, hektary, kilometry kwadratowe i inne.',
            short_answer: 'Ten konwerter zmienia wartość powierzchni z metrów kwadratowych na stopy kwadratowe (1 metr kwadratowy = 10,7639 stopy kwadratowej) — może też przeliczać między dowolną parą jednostek powierzchni za pomocą selektorów poniżej.',
            intro_text: '<p>Metry kwadratowe na stopy kwadratowe to jedna z najczęstszych konwersji w nieruchomościach, ponieważ wielkość nieruchomości w większości świata podawana jest w metrach kwadratowych, podczas gdy na rynku amerykańskim powierzchnia podłogi podawana jest w stopach kwadratowych.</p><p>To narzędzie wykracza poza m² i ft²: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek powierzchni.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 metr kwadratowy = 10,7639 stopy kwadratowej (ponieważ powierzchnia skaluje się z kwadratem współczynnika długości).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami powierzchni.',
                '<b>Kontekst nieruchomości:</b> porównując nieruchomość podaną w m² z tą podaną w ft², pamiętaj, że konwersje powierzchni NIE są liniowe jak długość — trzeba podnieść współczynnik do kwadratu (ten kalkulator robi to za ciebie).',
            ],
            howto: [
                { question: 'Ile stóp kwadratowych jest w metrze kwadratowym?', answer: '<p>1 metr kwadratowy to około 10,7639 stopy kwadratowej. Aby przeliczyć, pomnóż wartość w m² przez 10,7639.</p>' },
                { question: 'Dlaczego nie mogę po prostu pomnożyć przez współczynnik konwersji długości (3,28084)?', answer: '<p>Ponieważ powierzchnia jest dwuwymiarowa — trzeba podnieść współczynnik długości do kwadratu (3,28084² ≈ 10,7639), a nie zastosować go raz jak przy prostej konwersji długości.</p>' },
            ],
            inputs: areaInputs('pl', '100'),
            outputs: resultOutput('pl', 2),
        },
        es: {
            slug: 'calculadora-de-metros-cuadrados-a-pies-cuadrados',
            title: 'Calculadora de Metros Cuadrados a Pies Cuadrados',
            h1: 'Calculadora de Metros Cuadrados a Pies Cuadrados',
            meta_title: 'Metros Cuadrados a Pies Cuadrados | Convertidor de Cualquier Unidad de Área',
            meta_description: 'Convierte metros cuadrados a pies cuadrados al instante, o cambia a cualquier otra unidad de área — acres, hectáreas, kilómetros cuadrados y más.',
            short_answer: 'Este convertidor cambia un valor de área de metros cuadrados a pies cuadrados (1 metro cuadrado = 10,7639 pies cuadrados) — y puede convertir entre cualquier par de unidades de área usando los selectores de abajo.',
            intro_text: '<p>Metros cuadrados a pies cuadrados es una de las conversiones inmobiliarias más comunes, ya que el tamaño de las propiedades en la mayor parte del mundo se indica en metros cuadrados, mientras que el mercado estadounidense indica la superficie en pies cuadrados.</p><p>Esta herramienta va más allá de m² y ft²: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de área.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 metro cuadrado = 10,7639 pies cuadrados (ya que el área escala con el cuadrado del factor de longitud).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de área cualesquiera.',
                '<b>Contexto inmobiliario:</b> al comparar una propiedad listada en m² con una en ft², recuerda que las conversiones de área NO son lineales como la longitud — hay que elevar el factor al cuadrado (esta calculadora lo hace por ti).',
            ],
            howto: [
                { question: '¿Cuántos pies cuadrados hay en un metro cuadrado?', answer: '<p>1 metro cuadrado equivale aproximadamente a 10,7639 pies cuadrados. Para convertir, multiplica el valor en m² por 10,7639.</p>' },
                { question: '¿Por qué no puedo simplemente multiplicar por el factor de conversión de longitud (3,28084)?', answer: '<p>Porque el área es bidimensional — hay que elevar al cuadrado el factor de longitud (3,28084² ≈ 10,7639), no aplicarlo una sola vez como en una conversión de longitud simple.</p>' },
            ],
            inputs: areaInputs('es', '100'),
            outputs: resultOutput('es', 2),
        },
        fr: {
            slug: 'calculateur-de-metres-carres-en-pieds-carres',
            title: 'Calculateur de Mètres Carrés en Pieds Carrés',
            h1: 'Calculateur de Mètres Carrés en Pieds Carrés',
            meta_title: 'Mètres Carrés en Pieds Carrés | Convertisseur de Toute Unité de Surface',
            meta_description: 'Convertissez des mètres carrés en pieds carrés instantanément, ou passez à toute autre unité de surface — acres, hectares, kilomètres carrés et plus.',
            short_answer: 'Ce convertisseur transforme une valeur de surface de mètres carrés en pieds carrés (1 mètre carré = 10,7639 pieds carrés) — et peut convertir entre n’importe quelle paire d’unités de surface grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Mètres carrés en pieds carrés est l’une des conversions immobilières les plus courantes, la superficie des biens étant indiquée en mètres carrés dans la majeure partie du monde, tandis que le marché américain indique la surface au sol en pieds carrés.</p><p>Cet outil va au-delà des m² et ft² : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de surface.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 mètre carré = 10,7639 pieds carrés (car la surface évolue avec le carré du facteur de longueur).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de surface quelconques.',
                '<b>Contexte immobilier :</b> en comparant un bien indiqué en m² à un autre en ft², rappelez-vous que les conversions de surface ne sont PAS linéaires comme la longueur — il faut élever le facteur au carré (ce calculateur le fait pour vous).',
            ],
            howto: [
                { question: 'Combien de pieds carrés y a-t-il dans un mètre carré ?', answer: '<p>1 mètre carré équivaut à environ 10,7639 pieds carrés. Pour convertir, multipliez la valeur en m² par 10,7639.</p>' },
                { question: 'Pourquoi ne puis-je pas simplement multiplier par le facteur de conversion de longueur (3,28084) ?', answer: '<p>Parce que la surface est bidimensionnelle — il faut élever le facteur de longueur au carré (3,28084² ≈ 10,7639), pas l’appliquer une seule fois comme pour une simple conversion de longueur.</p>' },
            ],
            inputs: areaInputs('fr', '100'),
            outputs: resultOutput('fr', 2),
        },
        it: {
            slug: 'calcolatore-da-metri-quadrati-a-piedi-quadrati',
            title: 'Calcolatore da Metri Quadrati a Piedi Quadrati',
            h1: 'Calcolatore da Metri Quadrati a Piedi Quadrati',
            meta_title: 'Metri Quadrati in Piedi Quadrati | Convertitore di Qualsiasi Unità di Area',
            meta_description: 'Converti metri quadrati in piedi quadrati istantaneamente, o passa a qualsiasi altra unità di area — acri, ettari, chilometri quadrati e altro.',
            short_answer: 'Questo convertitore trasforma un valore di area da metri quadrati a piedi quadrati (1 metro quadrato = 10,7639 piedi quadrati) — e può convertire tra qualsiasi coppia di unità di area usando i selettori qui sotto.',
            intro_text: '<p>Metri quadrati in piedi quadrati è una delle conversioni immobiliari più comuni, poiché la dimensione degli immobili nella maggior parte del mondo è indicata in metri quadrati, mentre il mercato statunitense indica la superficie in piedi quadrati.</p><p>Questo strumento va oltre m² e ft²: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di area.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 metro quadrato = 10,7639 piedi quadrati (poiché l’area scala con il quadrato del fattore di lunghezza).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di area qualsiasi.',
                '<b>Contesto immobiliare:</b> confrontando un immobile indicato in m² con uno in ft², ricorda che le conversioni di area NON sono lineari come la lunghezza — bisogna elevare il fattore al quadrato (questo calcolatore lo fa per te).',
            ],
            howto: [
                { question: 'Quanti piedi quadrati ci sono in un metro quadrato?', answer: '<p>1 metro quadrato equivale a circa 10,7639 piedi quadrati. Per convertire, moltiplica il valore in m² per 10,7639.</p>' },
                { question: 'Perché non posso semplicemente moltiplicare per il fattore di conversione della lunghezza (3,28084)?', answer: '<p>Perché l’area è bidimensionale — bisogna elevare al quadrato il fattore di lunghezza (3,28084² ≈ 10,7639), non applicarlo una sola volta come in una semplice conversione di lunghezza.</p>' },
            ],
            inputs: areaInputs('it', '100'),
            outputs: resultOutput('it', 2),
        },
        de: {
            slug: 'quadratmeter-in-quadratfuss-rechner',
            title: 'Quadratmeter in Quadratfuß Rechner',
            h1: 'Quadratmeter in Quadratfuß Rechner',
            meta_title: 'Quadratmeter in Quadratfuß | Umrechner für Jede Flächeneinheit',
            meta_description: 'Rechnen Sie Quadratmeter sofort in Quadratfuß um, oder wechseln Sie zu jeder anderen Flächeneinheit — Acres, Hektar, Quadratkilometer und mehr.',
            short_answer: 'Dieser Umrechner wandelt einen Flächenwert von Quadratmetern in Quadratfuß um (1 Quadratmeter = 10,7639 Quadratfuß) — und kann zwischen jedem beliebigen Paar von Flächeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Quadratmeter in Quadratfuß ist eine der häufigsten Immobilienumrechnungen, da die Immobiliengröße in den meisten Teilen der Welt in Quadratmetern angegeben wird, während der US-Markt die Wohnfläche in Quadratfuß angibt.</p><p>Dieses Tool geht über m² und ft² hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Flächeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Quadratmeter = 10,7639 Quadratfuß (da sich die Fläche mit dem Quadrat des Längenfaktors skaliert).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Flächeneinheiten umzurechnen.',
                '<b>Immobilienkontext:</b> beim Vergleich einer in m² gelisteten Immobilie mit einer in ft² gelisteten, denken Sie daran, dass Flächenumrechnungen NICHT linear wie bei der Länge sind — Sie müssen den Faktor quadrieren (dieser Rechner erledigt das für Sie).',
            ],
            howto: [
                { question: 'Wie viele Quadratfuß sind in einem Quadratmeter?', answer: '<p>1 Quadratmeter entspricht etwa 10,7639 Quadratfuß. Um umzurechnen, multiplizieren Sie den m²-Wert mit 10,7639.</p>' },
                { question: 'Warum kann ich nicht einfach mit dem Längenumrechnungsfaktor (3,28084) multiplizieren?', answer: '<p>Weil die Fläche zweidimensional ist — Sie müssen den Längenfaktor quadrieren (3,28084² ≈ 10,7639), statt ihn einmal anzuwenden wie bei einer einfachen Längenumrechnung.</p>' },
            ],
            inputs: areaInputs('de', '100'),
            outputs: resultOutput('de', 2),
        },
    },
}

// ============================================================
// 1076: Acres to Hectares Converter
// ============================================================
const acresToHectares: ToolDef = {
    id: '1076',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'acre' },
            { key: 'to_unit', default: 'hectare' },
        ],
        functions: {
            result: { type: 'function', functionName: 'areaConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'acres-to-hectares-converter',
            title: 'Acres to Hectares Converter',
            h1: 'Acres to Hectares Converter',
            meta_title: 'Acres to Hectares Converter | Convert Any Area Unit',
            meta_description: 'Convert acres to hectares instantly, or switch to any other area unit — square meters, square feet, square kilometers, square miles, and more all supported.',
            short_answer: 'This converter changes an area value from acres to hectares (1 acre = 0.4047 hectares) — and can convert between any pair of area units using the selectors below.',
            intro_text: '<p>Acres to hectares is essential for agriculture, forestry, and land transactions — acres remain the standard land unit in the US, UK, and several Commonwealth countries, while hectares are the metric standard used across most of the rest of the world.</p><p>This tool goes beyond acres and hectares: use the "From" and "To" dropdowns to convert between any combination of square millimeters, square centimeters, square meters, square kilometers, square inches, square feet, square yards, acres, hectares, and square miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 acre = 0.404686 hectares (and 1 hectare = 10,000 square meters exactly, by metric definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two area units — not just acres and hectares.',
                '<b>Common use case:</b> comparing farmland or plot listings between a US/UK source (acres) and a source using the metric system (hectares).',
            ],
            howto: [
                { question: 'How many hectares are in an acre?', answer: '<p>1 acre equals approximately 0.4047 hectares. To convert acres to hectares, multiply the acre value by 0.4047.</p>' },
                { question: 'Can I convert hectares back to acres with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Hectares and Acres respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: areaInputs('en', '1'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-akry-v-gektary',
            title: 'Конвертер акров в гектары',
            h1: 'Конвертер акров в гектары',
            meta_title: 'Акры в гектары | Конвертер любых единиц площади',
            meta_description: 'Конвертируйте акры в гектары мгновенно, или переключитесь на любую другую единицу площади — квадратные метры, квадратные футы, квадратные километры, квадратные мили.',
            short_answer: 'Этот конвертер переводит значение площади из акров в гектары (1 акр = 0,4047 гектара) — а также может конвертировать между любой парой единиц площади с помощью селекторов ниже.',
            intro_text: '<p>Акры в гектары необходимы для сельского хозяйства, лесоводства и земельных сделок — акры остаются стандартной земельной единицей в США, Великобритании и нескольких странах Содружества, тогда как гектары — метрический стандарт, используемый в большей части остального мира.</p><p>Этот инструмент выходит за рамки акров и гектаров: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц площади.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 акр = 0,404686 гектара (а 1 гектар = ровно 10 000 квадратных метров, по метрическому определению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами площади.',
                '<b>Частый случай использования:</b> сравнение объявлений о сельхозземле или участке между американским/британским источником (акры) и источником, использующим метрическую систему (гектары).',
            ],
            howto: [
                { question: 'Сколько гектаров в акре?', answer: '<p>1 акр равен примерно 0,4047 гектара. Чтобы конвертировать акры в гектары, умножьте значение в акрах на 0,4047.</p>' },
                { question: 'Могу ли я конвертировать гектары обратно в акры этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Гектары и Акры соответственно.</p>' },
            ],
            inputs: areaInputs('ru', '1'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'akru-uz-hektariem-kalkulators',
            title: 'Akru uz Hektāriem Kalkulators',
            h1: 'Akru uz Hektāriem Kalkulators',
            meta_title: 'Akri uz Hektāriem | Jebkuras Laukuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet akrus uz hektāriem acumirklī, vai pārslēdzieties uz jebkuru citu laukuma vienību — kvadrātmetriem, kvadrātpēdām, kvadrātkilometriem un citām.',
            short_answer: 'Šis konvertētājs pārvērš laukuma vērtību no akriem uz hektāriem (1 akrs = 0,4047 hektāri) — un var konvertēt starp jebkuru laukuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Akri uz hektāriem ir nepieciešami lauksaimniecībai, mežsaimniecībai un zemes darījumiem — akri joprojām ir standarta zemes vienība ASV, Lielbritānijā un vairākās Sadraudzības valstīs, kamēr hektāri ir metriskais standarts, ko izmanto lielākajā daļā pārējās pasaules.</p><p>Šis rīks sniedzas tālāk par akriem un hektāriem: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru laukuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 akrs = 0,404686 hektāri (un 1 hektārs = tieši 10 000 kvadrātmetru, pēc metriskās definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām laukuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> lauksaimniecības zemes vai zemesgabala sludinājumu salīdzināšana starp ASV/Lielbritānijas avotu (akri) un avotu, kas izmanto metrisko sistēmu (hektāri).',
            ],
            howto: [
                { question: 'Cik hektāru ir akrā?', answer: '<p>1 akrs ir aptuveni 0,4047 hektāri. Lai konvertētu akrus uz hektāriem, reiziniet akru vērtību ar 0,4047.</p>' },
                { question: 'Vai varu konvertēt hektārus atpakaļ uz akriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Hektāriem un Akriem.</p>' },
            ],
            inputs: areaInputs('lv', '1'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-akrow-na-hektary',
            title: 'Kalkulator Akrów na Hektary',
            h1: 'Kalkulator Akrów na Hektary',
            meta_title: 'Akry na Hektary | Konwerter Dowolnej Jednostki Powierzchni',
            meta_description: 'Przelicz akry na hektary natychmiast lub przełącz się na dowolną inną jednostkę powierzchni — metry kwadratowe, stopy kwadratowe, kilometry kwadratowe i inne.',
            short_answer: 'Ten konwerter zmienia wartość powierzchni z akrów na hektary (1 akr = 0,4047 hektara) — może też przeliczać między dowolną parą jednostek powierzchni za pomocą selektorów poniżej.',
            intro_text: '<p>Akry na hektary są niezbędne w rolnictwie, leśnictwie i transakcjach ziemi — akry pozostają standardową jednostką ziemi w USA, Wielkiej Brytanii i kilku krajach Wspólnoty Narodów, podczas gdy hektary to metryczny standard używany w większości reszty świata.</p><p>To narzędzie wykracza poza akry i hektary: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek powierzchni.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 akr = 0,404686 hektara (a 1 hektar = dokładnie 10 000 metrów kwadratowych, według definicji metrycznej).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami powierzchni.',
                '<b>Częsty przypadek użycia:</b> porównywanie ofert gruntów rolnych lub działek między źródłem amerykańskim/brytyjskim (akry) a źródłem używającym systemu metrycznego (hektary).',
            ],
            howto: [
                { question: 'Ile hektarów jest w akrze?', answer: '<p>1 akr to około 0,4047 hektara. Aby przeliczyć akry na hektary, pomnóż wartość w akrach przez 0,4047.</p>' },
                { question: 'Czy mogę przeliczyć hektary z powrotem na akry tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Hektary i Akry.</p>' },
            ],
            inputs: areaInputs('pl', '1'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-acres-a-hectareas',
            title: 'Calculadora de Acres a Hectáreas',
            h1: 'Calculadora de Acres a Hectáreas',
            meta_title: 'Acres a Hectáreas | Convertidor de Cualquier Unidad de Área',
            meta_description: 'Convierte acres a hectáreas al instante, o cambia a cualquier otra unidad de área — metros cuadrados, pies cuadrados, kilómetros cuadrados y más.',
            short_answer: 'Este convertidor cambia un valor de área de acres a hectáreas (1 acre = 0,4047 hectáreas) — y puede convertir entre cualquier par de unidades de área usando los selectores de abajo.',
            intro_text: '<p>Acres a hectáreas es esencial para la agricultura, la silvicultura y las transacciones de tierras — los acres siguen siendo la unidad estándar de tierra en EE. UU., el Reino Unido y varios países de la Commonwealth, mientras que las hectáreas son el estándar métrico usado en la mayor parte del resto del mundo.</p><p>Esta herramienta va más allá de acres y hectáreas: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de área.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 acre = 0,404686 hectáreas (y 1 hectárea = exactamente 10.000 metros cuadrados, por definición métrica).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de área cualesquiera.',
                '<b>Caso de uso común:</b> comparar listados de tierras agrícolas o parcelas entre una fuente estadounidense/británica (acres) y una fuente que usa el sistema métrico (hectáreas).',
            ],
            howto: [
                { question: '¿Cuántas hectáreas hay en un acre?', answer: '<p>1 acre equivale aproximadamente a 0,4047 hectáreas. Para convertir acres a hectáreas, multiplica el valor en acres por 0,4047.</p>' },
                { question: '¿Puedo convertir hectáreas de vuelta a acres con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Hectáreas y Acres respectivamente.</p>' },
            ],
            inputs: areaInputs('es', '1'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-dacres-en-hectares',
            title: 'Calculateur d’Acres en Hectares',
            h1: 'Calculateur d’Acres en Hectares',
            meta_title: 'Acres en Hectares | Convertisseur de Toute Unité de Surface',
            meta_description: 'Convertissez des acres en hectares instantanément, ou passez à toute autre unité de surface — mètres carrés, pieds carrés, kilomètres carrés et plus.',
            short_answer: 'Ce convertisseur transforme une valeur de surface d’acres en hectares (1 acre = 0,4047 hectare) — et peut convertir entre n’importe quelle paire d’unités de surface grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Acres en hectares est essentiel pour l’agriculture, la sylviculture et les transactions foncières — l’acre reste l’unité foncière standard aux États-Unis, au Royaume-Uni et dans plusieurs pays du Commonwealth, tandis que l’hectare est la norme métrique utilisée dans la majeure partie du reste du monde.</p><p>Cet outil va au-delà des acres et des hectares : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de surface.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 acre = 0,404686 hectare (et 1 hectare = exactement 10 000 mètres carrés, par définition métrique).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de surface quelconques.',
                '<b>Cas d’usage courant :</b> comparer des annonces de terres agricoles ou de parcelles entre une source américaine/britannique (acres) et une source utilisant le système métrique (hectares).',
            ],
            howto: [
                { question: 'Combien d’hectares y a-t-il dans un acre ?', answer: '<p>1 acre équivaut à environ 0,4047 hectare. Pour convertir des acres en hectares, multipliez la valeur en acres par 0,4047.</p>' },
                { question: 'Puis-je convertir des hectares en acres avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Hectares et Acres respectivement.</p>' },
            ],
            inputs: areaInputs('fr', '1'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-acri-a-ettari',
            title: 'Calcolatore da Acri a Ettari',
            h1: 'Calcolatore da Acri a Ettari',
            meta_title: 'Acri in Ettari | Convertitore di Qualsiasi Unità di Area',
            meta_description: 'Converti acri in ettari istantaneamente, o passa a qualsiasi altra unità di area — metri quadrati, piedi quadrati, chilometri quadrati e altro.',
            short_answer: 'Questo convertitore trasforma un valore di area da acri a ettari (1 acro = 0,4047 ettari) — e può convertire tra qualsiasi coppia di unità di area usando i selettori qui sotto.',
            intro_text: '<p>Acri in ettari è essenziale per agricoltura, silvicoltura e transazioni immobiliari agricole — gli acri restano l’unità di terreno standard negli USA, nel Regno Unito e in diversi paesi del Commonwealth, mentre gli ettari sono lo standard metrico usato nella maggior parte del resto del mondo.</p><p>Questo strumento va oltre acri ed ettari: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di area.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 acro = 0,404686 ettari (e 1 ettaro = esattamente 10.000 metri quadrati, per definizione metrica).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di area qualsiasi.',
                '<b>Caso d’uso comune:</b> confrontare annunci di terreni agricoli o lotti tra una fonte statunitense/britannica (acri) e una fonte che usa il sistema metrico (ettari).',
            ],
            howto: [
                { question: 'Quanti ettari ci sono in un acro?', answer: '<p>1 acro equivale a circa 0,4047 ettari. Per convertire acri in ettari, moltiplica il valore in acri per 0,4047.</p>' },
                { question: 'Posso convertire gli ettari in acri con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Ettari e Acri.</p>' },
            ],
            inputs: areaInputs('it', '1'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'acres-in-hektar-rechner',
            title: 'Acres in Hektar Rechner',
            h1: 'Acres in Hektar Rechner',
            meta_title: 'Acres in Hektar | Umrechner für Jede Flächeneinheit',
            meta_description: 'Rechnen Sie Acres sofort in Hektar um, oder wechseln Sie zu jeder anderen Flächeneinheit — Quadratmeter, Quadratfuß, Quadratkilometer und mehr.',
            short_answer: 'Dieser Umrechner wandelt einen Flächenwert von Acres in Hektar um (1 Acre = 0,4047 Hektar) — und kann zwischen jedem beliebigen Paar von Flächeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Acres in Hektar ist unerlässlich für Landwirtschaft, Forstwirtschaft und Grundstücksgeschäfte — Acres bleiben die Standard-Landeinheit in den USA, Großbritannien und mehreren Commonwealth-Ländern, während Hektar der metrische Standard ist, der im übrigen Teil der Welt verwendet wird.</p><p>Dieses Tool geht über Acres und Hektar hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Flächeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Acre = 0,404686 Hektar (und 1 Hektar = genau 10.000 Quadratmeter, nach metrischer Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Flächeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Vergleich von Ackerland- oder Grundstücksangeboten zwischen einer US-/UK-Quelle (Acres) und einer Quelle mit metrischem System (Hektar).',
            ],
            howto: [
                { question: 'Wie viele Hektar sind in einem Acre?', answer: '<p>1 Acre entspricht etwa 0,4047 Hektar. Um Acres in Hektar umzurechnen, multiplizieren Sie den Acre-Wert mit 0,4047.</p>' },
                { question: 'Kann ich mit diesem Tool Hektar zurück in Acres umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Hektar bzw. Acres.</p>' },
            ],
            inputs: areaInputs('de', '1'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1077: Square Feet to Square Meters Converter
// ============================================================
const ft2ToM2: ToolDef = {
    id: '1077',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1000 },
            { key: 'from_unit', default: 'ft2' },
            { key: 'to_unit', default: 'm2' },
        ],
        functions: {
            result: { type: 'function', functionName: 'areaConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'square-feet-to-square-meters-converter',
            title: 'Square Feet to Square Meters Converter',
            h1: 'Square Feet to Square Meters Converter',
            meta_title: 'Square Feet to Square Meters Converter | Convert Any Area Unit',
            meta_description: 'Convert square feet to square meters instantly, or switch to any other area unit — acres, hectares, square kilometers, square inches, and more all supported.',
            short_answer: 'This converter changes an area value from square feet to square meters (1 square foot = 0.0929 square meters) — and can convert between any pair of area units using the selectors below.',
            intro_text: '<p>Square feet to square meters is common when a US-listed home, office, or warehouse floor area needs to be understood in metric terms for an international buyer, architect, or contractor.</p><p>This tool goes beyond ft² and m²: use the "From" and "To" dropdowns to convert between any combination of square millimeters, square centimeters, square meters, square kilometers, square inches, square feet, square yards, acres, hectares, and square miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 square foot = 0.092903 square meters (the square of the length factor: 1 ft = 0.3048 m, so 1 ft² = 0.3048² m²).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two area units — not just square feet and square meters.',
                '<b>Real estate context:</b> a "1,000 sq ft apartment" is roughly 92.9 square meters — useful context when comparing US listings against metric-denominated markets.',
            ],
            howto: [
                { question: 'How many square meters are in a square foot?', answer: '<p>1 square foot equals approximately 0.0929 square meters. To convert square feet to square meters, multiply the square foot value by 0.0929.</p>' },
                { question: 'Why is the factor so much smaller than the length conversion (0.3048)?', answer: '<p>Because area conversion squares the length factor: 0.3048 × 0.3048 ≈ 0.0929. Squaring a number less than 1 makes it smaller, which is why the area factor looks disproportionately small compared to the length factor.</p>' },
            ],
            inputs: areaInputs('en', '1000'),
            outputs: resultOutput('en', 3),
        },
        ru: {
            slug: 'kalkulyator-kvadratnye-futy-v-kvadratnye-metry',
            title: 'Конвертер квадратных футов в квадратные метры',
            h1: 'Конвертер квадратных футов в квадратные метры',
            meta_title: 'Квадратные футы в квадратные метры | Конвертер любых единиц площади',
            meta_description: 'Конвертируйте квадратные футы в квадратные метры мгновенно, или переключитесь на любую другую единицу площади — акры, гектары, квадратные километры и другие.',
            short_answer: 'Этот конвертер переводит значение площади из квадратных футов в квадратные метры (1 квадратный фут = 0,0929 квадратного метра) — а также может конвертировать между любой парой единиц площади с помощью селекторов ниже.',
            intro_text: '<p>Квадратные футы в квадратные метры часто нужны, когда площадь дома, офиса или склада, указанная в США, должна быть понятна в метрических терминах для международного покупателя, архитектора или подрядчика.</p><p>Этот инструмент выходит за рамки фут² и м²: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц площади.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 квадратный фут = 0,092903 квадратного метра (квадрат коэффициента длины).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами площади.',
                '<b>Контекст недвижимости:</b> "квартира 1000 кв. футов" — это примерно 92,9 квадратного метра — полезный контекст при сравнении американских объявлений с метрическими рынками.',
            ],
            howto: [
                { question: 'Сколько квадратных метров в квадратном футе?', answer: '<p>1 квадратный фут равен примерно 0,0929 квадратного метра. Чтобы конвертировать, умножьте значение в фут² на 0,0929.</p>' },
                { question: 'Почему коэффициент намного меньше, чем при конверсии длины (0,3048)?', answer: '<p>Потому что конверсия площади возводит коэффициент длины в квадрат: 0,3048 × 0,3048 ≈ 0,0929. Возведение числа меньше 1 в квадрат уменьшает его.</p>' },
            ],
            inputs: areaInputs('ru', '1000'),
            outputs: resultOutput('ru', 3),
        },
        lv: {
            slug: 'kvadratpedu-uz-kvadratmetriem-kalkulators',
            title: 'Kvadrātpēdu uz Kvadrātmetriem Kalkulators',
            h1: 'Kvadrātpēdu uz Kvadrātmetriem Kalkulators',
            meta_title: 'Kvadrātpēdas uz Kvadrātmetriem | Jebkuras Laukuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kvadrātpēdas uz kvadrātmetriem acumirklī, vai pārslēdzieties uz jebkuru citu laukuma vienību — akriem, hektāriem, kvadrātkilometriem un citām.',
            short_answer: 'Šis konvertētājs pārvērš laukuma vērtību no kvadrātpēdām uz kvadrātmetriem (1 kvadrātpēda = 0,0929 kvadrātmetri) — un var konvertēt starp jebkuru laukuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Kvadrātpēdas uz kvadrātmetriem bieži nepieciešams, kad ASV norādītā mājas, biroja vai noliktavas platība jāsaprot metriskajā izteiksmē starptautiskam pircējam, arhitektam vai darbuzņēmējam.</p><p>Šis rīks sniedzas tālāk par pēdas² un m²: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru laukuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kvadrātpēda = 0,092903 kvadrātmetri (garuma koeficienta kvadrāts).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām laukuma vienībām.',
                '<b>Nekustamā īpašuma konteksts:</b> "1000 kvadrātpēdu dzīvoklis" ir aptuveni 92,9 kvadrātmetri — noderīgs konteksts, salīdzinot ASV sludinājumus ar metriskiem tirgiem.',
            ],
            howto: [
                { question: 'Cik kvadrātmetru ir kvadrātpēdā?', answer: '<p>1 kvadrātpēda ir aptuveni 0,0929 kvadrātmetri. Lai konvertētu, reiziniet pēdas² vērtību ar 0,0929.</p>' },
                { question: 'Kāpēc koeficients ir tik daudz mazāks nekā garuma konversijā (0,3048)?', answer: '<p>Jo laukuma konversija ceļ garuma koeficientu kvadrātā: 0,3048 × 0,3048 ≈ 0,0929. Skaitļa, kas mazāks par 1, kāpināšana kvadrātā to samazina.</p>' },
            ],
            inputs: areaInputs('lv', '1000'),
            outputs: resultOutput('lv', 3),
        },
        pl: {
            slug: 'kalkulator-stop-kwadratowych-na-metry-kwadratowe',
            title: 'Kalkulator Stóp Kwadratowych na Metry Kwadratowe',
            h1: 'Kalkulator Stóp Kwadratowych na Metry Kwadratowe',
            meta_title: 'Stopy Kwadratowe na Metry Kwadratowe | Konwerter Dowolnej Jednostki Powierzchni',
            meta_description: 'Przelicz stopy kwadratowe na metry kwadratowe natychmiast lub przełącz się na dowolną inną jednostkę powierzchni — akry, hektary, kilometry kwadratowe i inne.',
            short_answer: 'Ten konwerter zmienia wartość powierzchni ze stóp kwadratowych na metry kwadratowe (1 stopa kwadratowa = 0,0929 metra kwadratowego) — może też przeliczać między dowolną parą jednostek powierzchni za pomocą selektorów poniżej.',
            intro_text: '<p>Stopy kwadratowe na metry kwadratowe są przydatne, gdy powierzchnia domu, biura lub magazynu podana w USA musi być zrozumiała w jednostkach metrycznych dla międzynarodowego kupca, architekta lub wykonawcy.</p><p>To narzędzie wykracza poza ft² i m²: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek powierzchni.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 stopa kwadratowa = 0,092903 metra kwadratowego (kwadrat współczynnika długości).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami powierzchni.',
                '<b>Kontekst nieruchomości:</b> "mieszkanie 1000 stóp kwadratowych" to około 92,9 metra kwadratowego — przydatny kontekst przy porównywaniu ofert amerykańskich z rynkami metrycznymi.',
            ],
            howto: [
                { question: 'Ile metrów kwadratowych jest w stopie kwadratowej?', answer: '<p>1 stopa kwadratowa to około 0,0929 metra kwadratowego. Aby przeliczyć, pomnóż wartość w ft² przez 0,0929.</p>' },
                { question: 'Dlaczego współczynnik jest tak dużo mniejszy niż przy konwersji długości (0,3048)?', answer: '<p>Ponieważ konwersja powierzchni podnosi współczynnik długości do kwadratu: 0,3048 × 0,3048 ≈ 0,0929. Podniesienie liczby mniejszej niż 1 do kwadratu zmniejsza ją.</p>' },
            ],
            inputs: areaInputs('pl', '1000'),
            outputs: resultOutput('pl', 3),
        },
        es: {
            slug: 'calculadora-de-pies-cuadrados-a-metros-cuadrados',
            title: 'Calculadora de Pies Cuadrados a Metros Cuadrados',
            h1: 'Calculadora de Pies Cuadrados a Metros Cuadrados',
            meta_title: 'Pies Cuadrados a Metros Cuadrados | Convertidor de Cualquier Unidad de Área',
            meta_description: 'Convierte pies cuadrados a metros cuadrados al instante, o cambia a cualquier otra unidad de área — acres, hectáreas, kilómetros cuadrados y más.',
            short_answer: 'Este convertidor cambia un valor de área de pies cuadrados a metros cuadrados (1 pie cuadrado = 0,0929 metros cuadrados) — y puede convertir entre cualquier par de unidades de área usando los selectores de abajo.',
            intro_text: '<p>Pies cuadrados a metros cuadrados es común cuando la superficie de una vivienda, oficina o almacén listada en EE. UU. necesita entenderse en términos métricos para un comprador, arquitecto o contratista internacional.</p><p>Esta herramienta va más allá de ft² y m²: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de área.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 pie cuadrado = 0,092903 metros cuadrados (el cuadrado del factor de longitud).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de área cualesquiera.',
                '<b>Contexto inmobiliario:</b> un "apartamento de 1000 pies cuadrados" son aproximadamente 92,9 metros cuadrados — contexto útil al comparar listados de EE. UU. con mercados métricos.',
            ],
            howto: [
                { question: '¿Cuántos metros cuadrados hay en un pie cuadrado?', answer: '<p>1 pie cuadrado equivale aproximadamente a 0,0929 metros cuadrados. Para convertir, multiplica el valor en ft² por 0,0929.</p>' },
                { question: '¿Por qué el factor es tanto más pequeño que la conversión de longitud (0,3048)?', answer: '<p>Porque la conversión de área eleva al cuadrado el factor de longitud: 0,3048 × 0,3048 ≈ 0,0929. Elevar al cuadrado un número menor que 1 lo hace más pequeño.</p>' },
            ],
            inputs: areaInputs('es', '1000'),
            outputs: resultOutput('es', 3),
        },
        fr: {
            slug: 'calculateur-de-pieds-carres-en-metres-carres',
            title: 'Calculateur de Pieds Carrés en Mètres Carrés',
            h1: 'Calculateur de Pieds Carrés en Mètres Carrés',
            meta_title: 'Pieds Carrés en Mètres Carrés | Convertisseur de Toute Unité de Surface',
            meta_description: 'Convertissez des pieds carrés en mètres carrés instantanément, ou passez à toute autre unité de surface — acres, hectares, kilomètres carrés et plus.',
            short_answer: 'Ce convertisseur transforme une valeur de surface de pieds carrés en mètres carrés (1 pied carré = 0,0929 mètre carré) — et peut convertir entre n’importe quelle paire d’unités de surface grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Pieds carrés en mètres carrés est courant lorsque la surface d’une maison, d’un bureau ou d’un entrepôt listée aux États-Unis doit être comprise en termes métriques pour un acheteur, architecte ou entrepreneur international.</p><p>Cet outil va au-delà des ft² et m² : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de surface.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 pied carré = 0,092903 mètre carré (le carré du facteur de longueur).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de surface quelconques.',
                '<b>Contexte immobilier :</b> un « appartement de 1000 pieds carrés » représente environ 92,9 mètres carrés — un contexte utile lors de la comparaison d’annonces américaines avec des marchés métriques.',
            ],
            howto: [
                { question: 'Combien de mètres carrés y a-t-il dans un pied carré ?', answer: '<p>1 pied carré équivaut à environ 0,0929 mètre carré. Pour convertir, multipliez la valeur en ft² par 0,0929.</p>' },
                { question: 'Pourquoi le facteur est-il tellement plus petit que la conversion de longueur (0,3048) ?', answer: '<p>Parce que la conversion de surface élève le facteur de longueur au carré : 0,3048 × 0,3048 ≈ 0,0929. Élever au carré un nombre inférieur à 1 le rend plus petit.</p>' },
            ],
            inputs: areaInputs('fr', '1000'),
            outputs: resultOutput('fr', 3),
        },
        it: {
            slug: 'calcolatore-da-piedi-quadrati-a-metri-quadrati',
            title: 'Calcolatore da Piedi Quadrati a Metri Quadrati',
            h1: 'Calcolatore da Piedi Quadrati a Metri Quadrati',
            meta_title: 'Piedi Quadrati in Metri Quadrati | Convertitore di Qualsiasi Unità di Area',
            meta_description: 'Converti piedi quadrati in metri quadrati istantaneamente, o passa a qualsiasi altra unità di area — acri, ettari, chilometri quadrati e altro.',
            short_answer: 'Questo convertitore trasforma un valore di area da piedi quadrati a metri quadrati (1 piede quadrato = 0,0929 metri quadrati) — e può convertire tra qualsiasi coppia di unità di area usando i selettori qui sotto.',
            intro_text: '<p>Piedi quadrati in metri quadrati è comune quando la superficie di una casa, ufficio o magazzino indicata negli USA deve essere compresa in termini metrici per un acquirente, architetto o appaltatore internazionale.</p><p>Questo strumento va oltre ft² e m²: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di area.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 piede quadrato = 0,092903 metri quadrati (il quadrato del fattore di lunghezza).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di area qualsiasi.',
                '<b>Contesto immobiliare:</b> un "appartamento di 1000 piedi quadrati" equivale a circa 92,9 metri quadrati — contesto utile quando si confrontano annunci statunitensi con mercati metrici.',
            ],
            howto: [
                { question: 'Quanti metri quadrati ci sono in un piede quadrato?', answer: '<p>1 piede quadrato equivale a circa 0,0929 metri quadrati. Per convertire, moltiplica il valore in ft² per 0,0929.</p>' },
                { question: 'Perché il fattore è così più piccolo della conversione di lunghezza (0,3048)?', answer: '<p>Perché la conversione di area eleva al quadrato il fattore di lunghezza: 0,3048 × 0,3048 ≈ 0,0929. Elevare al quadrato un numero minore di 1 lo rende più piccolo.</p>' },
            ],
            inputs: areaInputs('it', '1000'),
            outputs: resultOutput('it', 3),
        },
        de: {
            slug: 'quadratfuss-in-quadratmeter-rechner',
            title: 'Quadratfuß in Quadratmeter Rechner',
            h1: 'Quadratfuß in Quadratmeter Rechner',
            meta_title: 'Quadratfuß in Quadratmeter | Umrechner für Jede Flächeneinheit',
            meta_description: 'Rechnen Sie Quadratfuß sofort in Quadratmeter um, oder wechseln Sie zu jeder anderen Flächeneinheit — Acres, Hektar, Quadratkilometer und mehr.',
            short_answer: 'Dieser Umrechner wandelt einen Flächenwert von Quadratfuß in Quadratmeter um (1 Quadratfuß = 0,0929 Quadratmeter) — und kann zwischen jedem beliebigen Paar von Flächeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Quadratfuß in Quadratmeter ist üblich, wenn die in den USA gelistete Wohn-, Büro- oder Lagerfläche für einen internationalen Käufer, Architekten oder Auftragnehmer in metrischen Begriffen verstanden werden muss.</p><p>Dieses Tool geht über ft² und m² hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Flächeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Quadratfuß = 0,092903 Quadratmeter (das Quadrat des Längenfaktors).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Flächeneinheiten umzurechnen.',
                '<b>Immobilienkontext:</b> eine "1000-Quadratfuß-Wohnung" entspricht etwa 92,9 Quadratmetern — nützlicher Kontext beim Vergleich von US-Angeboten mit metrischen Märkten.',
            ],
            howto: [
                { question: 'Wie viele Quadratmeter sind in einem Quadratfuß?', answer: '<p>1 Quadratfuß entspricht etwa 0,0929 Quadratmetern. Um umzurechnen, multiplizieren Sie den ft²-Wert mit 0,0929.</p>' },
                { question: 'Warum ist der Faktor so viel kleiner als bei der Längenumrechnung (0,3048)?', answer: '<p>Weil die Flächenumrechnung den Längenfaktor quadriert: 0,3048 × 0,3048 ≈ 0,0929. Das Quadrieren einer Zahl kleiner als 1 macht sie kleiner.</p>' },
            ],
            inputs: areaInputs('de', '1000'),
            outputs: resultOutput('de', 3),
        },
    },
}

// ============================================================
// 1078: Square Kilometers to Square Miles Converter
// ============================================================
const km2ToMi2: ToolDef = {
    id: '1078',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 10 },
            { key: 'from_unit', default: 'km2' },
            { key: 'to_unit', default: 'mi2' },
        ],
        functions: {
            result: { type: 'function', functionName: 'areaConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'square-kilometers-to-square-miles-converter',
            title: 'Square Kilometers to Square Miles Converter',
            h1: 'Square Kilometers to Square Miles Converter',
            meta_title: 'Square Kilometers to Square Miles Converter | Convert Any Area Unit',
            meta_description: 'Convert square kilometers to square miles instantly, or switch to any other area unit — acres, hectares, square meters, square feet, and more all supported.',
            short_answer: 'This converter changes an area value from square kilometers to square miles (1 square kilometer = 0.3861 square miles) — and can convert between any pair of area units using the selectors below.',
            intro_text: '<p>Square kilometers to square miles is used for comparing large-scale areas — country and region sizes, national parks, wildfire coverage, and city metro areas — between countries that report land area in the metric system and the US, which typically reports in square miles.</p><p>This tool goes beyond km² and mi²: use the "From" and "To" dropdowns to convert between any combination of square millimeters, square centimeters, square meters, square kilometers, square inches, square feet, square yards, acres, hectares, and square miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 square kilometer = 0.386102 square miles (the square of the length factor: 1 km = 0.621371 mi, so 1 km² = 0.621371² mi²).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two area units — not just square kilometers and square miles.',
                '<b>Common use case:</b> comparing the reported size of a country, region, or natural disaster area between metric and US news sources.',
            ],
            howto: [
                { question: 'How many square miles are in a square kilometer?', answer: '<p>1 square kilometer equals approximately 0.3861 square miles. To convert, multiply the square kilometer value by 0.3861.</p>' },
                { question: 'Can I convert square miles back to square kilometers with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Square Miles and Square Kilometers respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: areaInputs('en', '10'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-kvadratnye-kilometry-v-kvadratnye-mili',
            title: 'Конвертер квадратных километров в квадратные мили',
            h1: 'Конвертер квадратных километров в квадратные мили',
            meta_title: 'Квадратные километры в квадратные мили | Конвертер любых единиц площади',
            meta_description: 'Конвертируйте квадратные километры в квадратные мили мгновенно, или переключитесь на любую другую единицу площади — акры, гектары, квадратные метры и другие.',
            short_answer: 'Этот конвертер переводит значение площади из квадратных километров в квадратные мили (1 квадратный километр = 0,3861 квадратной мили) — а также может конвертировать между любой парой единиц площади с помощью селекторов ниже.',
            intro_text: '<p>Квадратные километры в квадратные мили используются для сравнения крупномасштабных площадей — размеров стран и регионов, национальных парков, зон лесных пожаров и городских агломераций — между странами, сообщающими площадь земли в метрической системе, и США, которые обычно сообщают в квадратных милях.</p><p>Этот инструмент выходит за рамки км² и мили²: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц площади.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 квадратный километр = 0,386102 квадратной мили (квадрат коэффициента длины).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами площади.',
                '<b>Частый случай использования:</b> сравнение заявленного размера страны, региона или зоны стихийного бедствия между метрическими и американскими источниками новостей.',
            ],
            howto: [
                { question: 'Сколько квадратных миль в квадратном километре?', answer: '<p>1 квадратный километр равен примерно 0,3861 квадратной мили. Чтобы конвертировать, умножьте значение в км² на 0,3861.</p>' },
                { question: 'Могу ли я конвертировать квадратные мили обратно в квадратные километры этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Квадратные мили и Квадратные километры соответственно.</p>' },
            ],
            inputs: areaInputs('ru', '10'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'kvadratkilometru-uz-kvadratjudzem-kalkulators',
            title: 'Kvadrātkilometru uz Kvadrātjūdzēm Kalkulators',
            h1: 'Kvadrātkilometru uz Kvadrātjūdzēm Kalkulators',
            meta_title: 'Kvadrātkilometri uz Kvadrātjūdzēm | Jebkuras Laukuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kvadrātkilometrus uz kvadrātjūdzēm acumirklī, vai pārslēdzieties uz jebkuru citu laukuma vienību — akriem, hektāriem, kvadrātmetriem un citām.',
            short_answer: 'Šis konvertētājs pārvērš laukuma vērtību no kvadrātkilometriem uz kvadrātjūdzēm (1 kvadrātkilometrs = 0,3861 kvadrātjūdzes) — un var konvertēt starp jebkuru laukuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Kvadrātkilometri uz kvadrātjūdzēm tiek izmantoti, salīdzinot lielus laukumus — valstu un reģionu izmērus, nacionālos parkus, meža ugunsgrēku zonas un pilsētu aglomerācijas — starp valstīm, kas ziņo par zemes platību metriskajā sistēmā, un ASV, kas parasti ziņo kvadrātjūdzēs.</p><p>Šis rīks sniedzas tālāk par km² un jūdzes²: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru laukuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kvadrātkilometrs = 0,386102 kvadrātjūdzes (garuma koeficienta kvadrāts).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām laukuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> valsts, reģiona vai dabas katastrofas zonas paziņotā izmēra salīdzināšana starp metriskiem un ASV ziņu avotiem.',
            ],
            howto: [
                { question: 'Cik kvadrātjūdžu ir kvadrātkilometrā?', answer: '<p>1 kvadrātkilometrs ir aptuveni 0,3861 kvadrātjūdzes. Lai konvertētu, reiziniet km² vērtību ar 0,3861.</p>' },
                { question: 'Vai varu konvertēt kvadrātjūdzes atpakaļ uz kvadrātkilometriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Kvadrātjūdzēm un Kvadrātkilometriem.</p>' },
            ],
            inputs: areaInputs('lv', '10'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-kilometrow-kwadratowych-na-mile-kwadratowe',
            title: 'Kalkulator Kilometrów Kwadratowych na Mile Kwadratowe',
            h1: 'Kalkulator Kilometrów Kwadratowych na Mile Kwadratowe',
            meta_title: 'Kilometry Kwadratowe na Mile Kwadratowe | Konwerter Dowolnej Jednostki Powierzchni',
            meta_description: 'Przelicz kilometry kwadratowe na mile kwadratowe natychmiast lub przełącz się na dowolną inną jednostkę powierzchni — akry, hektary, metry kwadratowe i inne.',
            short_answer: 'Ten konwerter zmienia wartość powierzchni z kilometrów kwadratowych na mile kwadratowe (1 kilometr kwadratowy = 0,3861 mili kwadratowej) — może też przeliczać między dowolną parą jednostek powierzchni za pomocą selektorów poniżej.',
            intro_text: '<p>Kilometry kwadratowe na mile kwadratowe są używane do porównywania dużych obszarów — wielkości krajów i regionów, parków narodowych, zasięgu pożarów lasów i aglomeracji miejskich — między krajami raportującymi powierzchnię ziemi w systemie metrycznym a USA, które zazwyczaj raportują w milach kwadratowych.</p><p>To narzędzie wykracza poza km² i mi²: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek powierzchni.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 kilometr kwadratowy = 0,386102 mili kwadratowej (kwadrat współczynnika długości).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami powierzchni.',
                '<b>Częsty przypadek użycia:</b> porównywanie podanej wielkości kraju, regionu lub obszaru klęski żywiołowej między źródłami metrycznymi a amerykańskimi.',
            ],
            howto: [
                { question: 'Ile mil kwadratowych jest w kilometrze kwadratowym?', answer: '<p>1 kilometr kwadratowy to około 0,3861 mili kwadratowej. Aby przeliczyć, pomnóż wartość w km² przez 0,3861.</p>' },
                { question: 'Czy mogę przeliczyć mile kwadratowe z powrotem na kilometry kwadratowe tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Mile Kwadratowe i Kilometry Kwadratowe.</p>' },
            ],
            inputs: areaInputs('pl', '10'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-kilometros-cuadrados-a-millas-cuadradas',
            title: 'Calculadora de Kilómetros Cuadrados a Millas Cuadradas',
            h1: 'Calculadora de Kilómetros Cuadrados a Millas Cuadradas',
            meta_title: 'Kilómetros Cuadrados a Millas Cuadradas | Convertidor de Cualquier Unidad de Área',
            meta_description: 'Convierte kilómetros cuadrados a millas cuadradas al instante, o cambia a cualquier otra unidad de área — acres, hectáreas, metros cuadrados y más.',
            short_answer: 'Este convertidor cambia un valor de área de kilómetros cuadrados a millas cuadradas (1 kilómetro cuadrado = 0,3861 millas cuadradas) — y puede convertir entre cualquier par de unidades de área usando los selectores de abajo.',
            intro_text: '<p>Kilómetros cuadrados a millas cuadradas se usa para comparar áreas a gran escala — tamaños de países y regiones, parques nacionales, cobertura de incendios forestales y áreas metropolitanas — entre países que reportan superficie en el sistema métrico y EE. UU., que normalmente reporta en millas cuadradas.</p><p>Esta herramienta va más allá de km² y mi²: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de área.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 kilómetro cuadrado = 0,386102 millas cuadradas (el cuadrado del factor de longitud).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de área cualesquiera.',
                '<b>Caso de uso común:</b> comparar el tamaño reportado de un país, región o área de desastre natural entre fuentes métricas y estadounidenses.',
            ],
            howto: [
                { question: '¿Cuántas millas cuadradas hay en un kilómetro cuadrado?', answer: '<p>1 kilómetro cuadrado equivale aproximadamente a 0,3861 millas cuadradas. Para convertir, multiplica el valor en km² por 0,3861.</p>' },
                { question: '¿Puedo convertir millas cuadradas de vuelta a kilómetros cuadrados con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Millas Cuadradas y Kilómetros Cuadrados respectivamente.</p>' },
            ],
            inputs: areaInputs('es', '10'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-de-kilometres-carres-en-miles-carres',
            title: 'Calculateur de Kilomètres Carrés en Miles Carrés',
            h1: 'Calculateur de Kilomètres Carrés en Miles Carrés',
            meta_title: 'Kilomètres Carrés en Miles Carrés | Convertisseur de Toute Unité de Surface',
            meta_description: 'Convertissez des kilomètres carrés en miles carrés instantanément, ou passez à toute autre unité de surface — acres, hectares, mètres carrés et plus.',
            short_answer: 'Ce convertisseur transforme une valeur de surface de kilomètres carrés en miles carrés (1 kilomètre carré = 0,3861 mile carré) — et peut convertir entre n’importe quelle paire d’unités de surface grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Kilomètres carrés en miles carrés est utilisé pour comparer des superficies à grande échelle — tailles de pays et régions, parcs nationaux, couverture des feux de forêt et zones métropolitaines — entre les pays qui rapportent la superficie en système métrique et les États-Unis, qui rapportent généralement en miles carrés.</p><p>Cet outil va au-delà des km² et mi² : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de surface.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 kilomètre carré = 0,386102 mile carré (le carré du facteur de longueur).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de surface quelconques.',
                '<b>Cas d’usage courant :</b> comparer la taille rapportée d’un pays, d’une région ou d’une zone de catastrophe naturelle entre sources métriques et américaines.',
            ],
            howto: [
                { question: 'Combien de miles carrés y a-t-il dans un kilomètre carré ?', answer: '<p>1 kilomètre carré équivaut à environ 0,3861 mile carré. Pour convertir, multipliez la valeur en km² par 0,3861.</p>' },
                { question: 'Puis-je convertir des miles carrés en kilomètres carrés avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Miles Carrés et Kilomètres Carrés respectivement.</p>' },
            ],
            inputs: areaInputs('fr', '10'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-chilometri-quadrati-a-miglia-quadrate',
            title: 'Calcolatore da Chilometri Quadrati a Miglia Quadrate',
            h1: 'Calcolatore da Chilometri Quadrati a Miglia Quadrate',
            meta_title: 'Chilometri Quadrati in Miglia Quadrate | Convertitore di Qualsiasi Unità di Area',
            meta_description: 'Converti chilometri quadrati in miglia quadrate istantaneamente, o passa a qualsiasi altra unità di area — acri, ettari, metri quadrati e altro.',
            short_answer: 'Questo convertitore trasforma un valore di area da chilometri quadrati a miglia quadrate (1 chilometro quadrato = 0,3861 miglia quadrate) — e può convertire tra qualsiasi coppia di unità di area usando i selettori qui sotto.',
            intro_text: '<p>Chilometri quadrati in miglia quadrate viene usato per confrontare aree su larga scala — dimensioni di paesi e regioni, parchi nazionali, copertura di incendi boschivi e aree metropolitane — tra paesi che riportano la superficie nel sistema metrico e gli USA, che tipicamente riportano in miglia quadrate.</p><p>Questo strumento va oltre km² e mi²: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di area.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 chilometro quadrato = 0,386102 miglia quadrate (il quadrato del fattore di lunghezza).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di area qualsiasi.',
                '<b>Caso d’uso comune:</b> confrontare la dimensione riportata di un paese, regione o area di disastro naturale tra fonti metriche e statunitensi.',
            ],
            howto: [
                { question: 'Quante miglia quadrate ci sono in un chilometro quadrato?', answer: '<p>1 chilometro quadrato equivale a circa 0,3861 miglia quadrate. Per convertire, moltiplica il valore in km² per 0,3861.</p>' },
                { question: 'Posso convertire le miglia quadrate in chilometri quadrati con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Miglia Quadrate e Chilometri Quadrati.</p>' },
            ],
            inputs: areaInputs('it', '10'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'quadratkilometer-in-quadratmeilen-rechner',
            title: 'Quadratkilometer in Quadratmeilen Rechner',
            h1: 'Quadratkilometer in Quadratmeilen Rechner',
            meta_title: 'Quadratkilometer in Quadratmeilen | Umrechner für Jede Flächeneinheit',
            meta_description: 'Rechnen Sie Quadratkilometer sofort in Quadratmeilen um, oder wechseln Sie zu jeder anderen Flächeneinheit — Acres, Hektar, Quadratmeter und mehr.',
            short_answer: 'Dieser Umrechner wandelt einen Flächenwert von Quadratkilometern in Quadratmeilen um (1 Quadratkilometer = 0,3861 Quadratmeilen) — und kann zwischen jedem beliebigen Paar von Flächeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Quadratkilometer in Quadratmeilen wird verwendet, um großflächige Gebiete zu vergleichen — Länder- und Regionsgrößen, Nationalparks, Waldbrandausdehnung und Großstadtregionen — zwischen Ländern, die die Landfläche im metrischen System angeben, und den USA, die typischerweise in Quadratmeilen angeben.</p><p>Dieses Tool geht über km² und mi² hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Flächeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Quadratkilometer = 0,386102 Quadratmeilen (das Quadrat des Längenfaktors).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Flächeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Vergleich der angegebenen Größe eines Landes, einer Region oder eines Naturkatastrophengebiets zwischen metrischen und US-Nachrichtenquellen.',
            ],
            howto: [
                { question: 'Wie viele Quadratmeilen sind in einem Quadratkilometer?', answer: '<p>1 Quadratkilometer entspricht etwa 0,3861 Quadratmeilen. Um umzurechnen, multiplizieren Sie den km²-Wert mit 0,3861.</p>' },
                { question: 'Kann ich mit diesem Tool Quadratmeilen zurück in Quadratkilometer umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Quadratmeilen bzw. Quadratkilometer.</p>' },
            ],
            inputs: areaInputs('de', '10'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1079: Hectares to Acres Converter
// ============================================================
const hectaresToAcres: ToolDef = {
    id: '1079',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 5 },
            { key: 'from_unit', default: 'hectare' },
            { key: 'to_unit', default: 'acre' },
        ],
        functions: {
            result: { type: 'function', functionName: 'areaConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'hectares-to-acres-converter',
            title: 'Hectares to Acres Converter',
            h1: 'Hectares to Acres Converter',
            meta_title: 'Hectares to Acres Converter | Convert Any Area Unit',
            meta_description: 'Convert hectares to acres instantly, or switch to any other area unit — square meters, square feet, square kilometers, square miles, and more all supported.',
            short_answer: 'This converter changes an area value from hectares to acres (1 hectare = 2.4711 acres) — and can convert between any pair of area units using the selectors below.',
            intro_text: '<p>Hectares to acres is the reverse of the acres-to-hectares conversion, needed whenever a metric-denominated farmland, forest, or land registry figure needs to be understood by someone working in the US or UK acre-based system.</p><p>This tool goes beyond hectares and acres: use the "From" and "To" dropdowns to convert between any combination of square millimeters, square centimeters, square meters, square kilometers, square inches, square feet, square yards, acres, hectares, and square miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 hectare = 2.47105 acres (since 1 hectare = 10,000 square meters exactly, by metric definition).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two area units — not just hectares and acres.',
                '<b>Common use case:</b> converting a European or international land size (hectares) into the acre figure expected by a US buyer, lender, or agricultural report.',
            ],
            howto: [
                { question: 'How many acres are in a hectare?', answer: '<p>1 hectare equals approximately 2.4711 acres. To convert hectares to acres, multiply the hectare value by 2.4711.</p>' },
                { question: 'Can I convert acres back to hectares with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Acres and Hectares respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: areaInputs('en', '5'),
            outputs: resultOutput('en', 4),
        },
        ru: {
            slug: 'kalkulyator-gektary-v-akry',
            title: 'Конвертер гектаров в акры',
            h1: 'Конвертер гектаров в акры',
            meta_title: 'Гектары в акры | Конвертер любых единиц площади',
            meta_description: 'Конвертируйте гектары в акры мгновенно, или переключитесь на любую другую единицу площади — квадратные метры, квадратные футы, квадратные километры, квадратные мили.',
            short_answer: 'Этот конвертер переводит значение площади из гектаров в акры (1 гектар = 2,4711 акра) — а также может конвертировать между любой парой единиц площади с помощью селекторов ниже.',
            intro_text: '<p>Гектары в акры — обратная конверсия к акрам в гектары, нужная всякий раз, когда метрический показатель сельхозземли, леса или земельного реестра должен быть понятен тому, кто работает в американской или британской системе на основе акров.</p><p>Этот инструмент выходит за рамки гектаров и акров: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц площади.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 гектар = 2,47105 акра (поскольку 1 гектар = ровно 10 000 квадратных метров, по метрическому определению).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами площади.',
                '<b>Частый случай использования:</b> конвертация европейского или международного размера земли (гектары) в показатель акров, ожидаемый американским покупателем, кредитором или сельскохозяйственным отчётом.',
            ],
            howto: [
                { question: 'Сколько акров в гектаре?', answer: '<p>1 гектар равен примерно 2,4711 акра. Чтобы конвертировать гектары в акры, умножьте значение в гектарах на 2,4711.</p>' },
                { question: 'Могу ли я конвертировать акры обратно в гектары этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Акры и Гектары соответственно.</p>' },
            ],
            inputs: areaInputs('ru', '5'),
            outputs: resultOutput('ru', 4),
        },
        lv: {
            slug: 'hektaru-uz-akriem-kalkulators',
            title: 'Hektāru uz Akriem Kalkulators',
            h1: 'Hektāru uz Akriem Kalkulators',
            meta_title: 'Hektāri uz Akriem | Jebkuras Laukuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet hektārus uz akriem acumirklī, vai pārslēdzieties uz jebkuru citu laukuma vienību — kvadrātmetriem, kvadrātpēdām, kvadrātkilometriem un citām.',
            short_answer: 'Šis konvertētājs pārvērš laukuma vērtību no hektāriem uz akriem (1 hektārs = 2,4711 akri) — un var konvertēt starp jebkuru laukuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Hektāri uz akriem ir pretēja konversija akriem uz hektāriem, kas nepieciešama, kad metriskais lauksaimniecības zemes, meža vai zemes reģistra rādītājs jāsaprot kādam, kurš strādā ASV vai Lielbritānijas akru sistēmā.</p><p>Šis rīks sniedzas tālāk par hektāriem un akriem: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru laukuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 hektārs = 2,47105 akri (jo 1 hektārs = tieši 10 000 kvadrātmetru, pēc metriskās definīcijas).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām laukuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> Eiropas vai starptautiska zemes izmēra (hektāri) konvertēšana akru rādītājā, ko sagaida ASV pircējs, aizdevējs vai lauksaimniecības pārskats.',
            ],
            howto: [
                { question: 'Cik akru ir hektārā?', answer: '<p>1 hektārs ir aptuveni 2,4711 akri. Lai konvertētu hektārus uz akriem, reiziniet hektāru vērtību ar 2,4711.</p>' },
                { question: 'Vai varu konvertēt akrus atpakaļ uz hektāriem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Akriem un Hektāriem.</p>' },
            ],
            inputs: areaInputs('lv', '5'),
            outputs: resultOutput('lv', 4),
        },
        pl: {
            slug: 'kalkulator-hektarow-na-akry',
            title: 'Kalkulator Hektarów na Akry',
            h1: 'Kalkulator Hektarów na Akry',
            meta_title: 'Hektary na Akry | Konwerter Dowolnej Jednostki Powierzchni',
            meta_description: 'Przelicz hektary na akry natychmiast lub przełącz się na dowolną inną jednostkę powierzchni — metry kwadratowe, stopy kwadratowe, kilometry kwadratowe i inne.',
            short_answer: 'Ten konwerter zmienia wartość powierzchni z hektarów na akry (1 hektar = 2,4711 akra) — może też przeliczać między dowolną parą jednostek powierzchni za pomocą selektorów poniżej.',
            intro_text: '<p>Hektary na akry to odwrotność konwersji akrów na hektary, potrzebna, gdy metryczna wartość gruntu rolnego, lasu lub rejestru ziemi musi być zrozumiała dla kogoś pracującego w amerykańskim lub brytyjskim systemie opartym na akrach.</p><p>To narzędzie wykracza poza hektary i akry: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek powierzchni.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 hektar = 2,47105 akra (ponieważ 1 hektar = dokładnie 10 000 metrów kwadratowych, według definicji metrycznej).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami powierzchni.',
                '<b>Częsty przypadek użycia:</b> przeliczanie europejskiej lub międzynarodowej wielkości ziemi (hektary) na wartość w akrach oczekiwaną przez amerykańskiego nabywcę, kredytodawcę lub raport rolniczy.',
            ],
            howto: [
                { question: 'Ile akrów jest w hektarze?', answer: '<p>1 hektar to około 2,4711 akra. Aby przeliczyć hektary na akry, pomnóż wartość w hektarach przez 2,4711.</p>' },
                { question: 'Czy mogę przeliczyć akry z powrotem na hektary tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Akry i Hektary.</p>' },
            ],
            inputs: areaInputs('pl', '5'),
            outputs: resultOutput('pl', 4),
        },
        es: {
            slug: 'calculadora-de-hectareas-a-acres',
            title: 'Calculadora de Hectáreas a Acres',
            h1: 'Calculadora de Hectáreas a Acres',
            meta_title: 'Hectáreas a Acres | Convertidor de Cualquier Unidad de Área',
            meta_description: 'Convierte hectáreas a acres al instante, o cambia a cualquier otra unidad de área — metros cuadrados, pies cuadrados, kilómetros cuadrados y más.',
            short_answer: 'Este convertidor cambia un valor de área de hectáreas a acres (1 hectárea = 2,4711 acres) — y puede convertir entre cualquier par de unidades de área usando los selectores de abajo.',
            intro_text: '<p>Hectáreas a acres es la conversión inversa de acres a hectáreas, necesaria siempre que una cifra de tierra agrícola, bosque o registro de tierras en métrico deba entenderse por alguien que trabaja en el sistema de acres de EE. UU. o el Reino Unido.</p><p>Esta herramienta va más allá de hectáreas y acres: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de área.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 hectárea = 2,47105 acres (ya que 1 hectárea = exactamente 10.000 metros cuadrados, por definición métrica).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de área cualesquiera.',
                '<b>Caso de uso común:</b> convertir un tamaño de tierra europeo o internacional (hectáreas) a la cifra de acres esperada por un comprador, prestamista o informe agrícola de EE. UU.',
            ],
            howto: [
                { question: '¿Cuántos acres hay en una hectárea?', answer: '<p>1 hectárea equivale aproximadamente a 2,4711 acres. Para convertir hectáreas a acres, multiplica el valor en hectáreas por 2,4711.</p>' },
                { question: '¿Puedo convertir acres de vuelta a hectáreas con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Acres y Hectáreas respectivamente.</p>' },
            ],
            inputs: areaInputs('es', '5'),
            outputs: resultOutput('es', 4),
        },
        fr: {
            slug: 'calculateur-dhectares-en-acres',
            title: 'Calculateur d’Hectares en Acres',
            h1: 'Calculateur d’Hectares en Acres',
            meta_title: 'Hectares en Acres | Convertisseur de Toute Unité de Surface',
            meta_description: 'Convertissez des hectares en acres instantanément, ou passez à toute autre unité de surface — mètres carrés, pieds carrés, kilomètres carrés et plus.',
            short_answer: 'Ce convertisseur transforme une valeur de surface d’hectares en acres (1 hectare = 2,4711 acres) — et peut convertir entre n’importe quelle paire d’unités de surface grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Hectares en acres est l’inverse de la conversion acres en hectares, nécessaire chaque fois qu’un chiffre de terre agricole, forêt ou cadastre exprimé en métrique doit être compris par quelqu’un travaillant dans le système en acres des États-Unis ou du Royaume-Uni.</p><p>Cet outil va au-delà des hectares et des acres : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de surface.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 hectare = 2,47105 acres (puisque 1 hectare = exactement 10 000 mètres carrés, par définition métrique).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de surface quelconques.',
                '<b>Cas d’usage courant :</b> convertir une superficie européenne ou internationale (hectares) en chiffre d’acres attendu par un acheteur, prêteur ou rapport agricole américain.',
            ],
            howto: [
                { question: 'Combien d’acres y a-t-il dans un hectare ?', answer: '<p>1 hectare équivaut à environ 2,4711 acres. Pour convertir des hectares en acres, multipliez la valeur en hectares par 2,4711.</p>' },
                { question: 'Puis-je convertir des acres en hectares avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Acres et Hectares respectivement.</p>' },
            ],
            inputs: areaInputs('fr', '5'),
            outputs: resultOutput('fr', 4),
        },
        it: {
            slug: 'calcolatore-da-ettari-a-acri',
            title: 'Calcolatore da Ettari a Acri',
            h1: 'Calcolatore da Ettari a Acri',
            meta_title: 'Ettari in Acri | Convertitore di Qualsiasi Unità di Area',
            meta_description: 'Converti ettari in acri istantaneamente, o passa a qualsiasi altra unità di area — metri quadrati, piedi quadrati, chilometri quadrati e altro.',
            short_answer: 'Questo convertitore trasforma un valore di area da ettari a acri (1 ettaro = 2,4711 acri) — e può convertire tra qualsiasi coppia di unità di area usando i selettori qui sotto.',
            intro_text: '<p>Ettari in acri è l’inverso della conversione acri in ettari, necessaria ogni volta che una cifra di terreno agricolo, bosco o catasto in metrico deve essere compresa da qualcuno che lavora nel sistema in acri statunitense o britannico.</p><p>Questo strumento va oltre ettari e acri: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di area.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 ettaro = 2,47105 acri (poiché 1 ettaro = esattamente 10.000 metri quadrati, per definizione metrica).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di area qualsiasi.',
                '<b>Caso d’uso comune:</b> convertire una dimensione di terreno europea o internazionale (ettari) nella cifra in acri attesa da un acquirente, finanziatore o rapporto agricolo statunitense.',
            ],
            howto: [
                { question: 'Quanti acri ci sono in un ettaro?', answer: '<p>1 ettaro equivale a circa 2,4711 acri. Per convertire ettari in acri, moltiplica il valore in ettari per 2,4711.</p>' },
                { question: 'Posso convertire gli acri in ettari con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Acri e Ettari.</p>' },
            ],
            inputs: areaInputs('it', '5'),
            outputs: resultOutput('it', 4),
        },
        de: {
            slug: 'hektar-in-acres-rechner',
            title: 'Hektar in Acres Rechner',
            h1: 'Hektar in Acres Rechner',
            meta_title: 'Hektar in Acres | Umrechner für Jede Flächeneinheit',
            meta_description: 'Rechnen Sie Hektar sofort in Acres um, oder wechseln Sie zu jeder anderen Flächeneinheit — Quadratmeter, Quadratfuß, Quadratkilometer und mehr.',
            short_answer: 'Dieser Umrechner wandelt einen Flächenwert von Hektar in Acres um (1 Hektar = 2,4711 Acres) — und kann zwischen jedem beliebigen Paar von Flächeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Hektar in Acres ist die Umkehrung der Acres-in-Hektar-Umrechnung, benötigt, wenn eine metrische Angabe zu Ackerland, Wald oder Grundbuch von jemandem verstanden werden muss, der im US- oder UK-Acre-System arbeitet.</p><p>Dieses Tool geht über Hektar und Acres hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Flächeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Hektar = 2,47105 Acres (da 1 Hektar = genau 10.000 Quadratmeter, nach metrischer Definition).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Flächeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung einer europäischen oder internationalen Landgröße (Hektar) in die von einem US-Käufer, Kreditgeber oder Agrarbericht erwartete Acre-Zahl.',
            ],
            howto: [
                { question: 'Wie viele Acres sind in einem Hektar?', answer: '<p>1 Hektar entspricht etwa 2,4711 Acres. Um Hektar in Acres umzurechnen, multiplizieren Sie den Hektarwert mit 2,4711.</p>' },
                { question: 'Kann ich mit diesem Tool Acres zurück in Hektar umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Acres bzw. Hektar.</p>' },
            ],
            inputs: areaInputs('de', '5'),
            outputs: resultOutput('de', 4),
        },
    },
}

// ============================================================
// 1080: Square Yards to Square Meters Converter
// ============================================================
const yd2ToM2: ToolDef = {
    id: '1080',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'value', default: 1 },
            { key: 'from_unit', default: 'yd2' },
            { key: 'to_unit', default: 'm2' },
        ],
        functions: {
            result: { type: 'function', functionName: 'areaConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } },
        },
        outputs: [{ key: 'result', precision: 5 }],
    },
    locales: {
        en: {
            slug: 'square-yards-to-square-meters-converter',
            title: 'Square Yards to Square Meters Converter',
            h1: 'Square Yards to Square Meters Converter',
            meta_title: 'Square Yards to Square Meters Converter | Convert Any Area Unit',
            meta_description: 'Convert square yards to square meters instantly, or switch to any other area unit — acres, hectares, square feet, square kilometers, and more all supported.',
            short_answer: 'This converter changes an area value from square yards to square meters (1 square yard = 0.8361 square meters) — and can convert between any pair of area units using the selectors below.',
            intro_text: '<p>Square yards to square meters comes up when comparing carpet, turf, or fabric area sold by the square yard (common in the US and UK) against a metric quantity needed for an international order or building specification.</p><p>This tool goes beyond yd² and m²: use the "From" and "To" dropdowns to convert between any combination of square millimeters, square centimeters, square meters, square kilometers, square inches, square feet, square yards, acres, hectares, and square miles.</p>',
            key_points: [
                '<b>Conversion factor:</b> 1 square yard = 0.836127 square meters (the square of the length factor: 1 yd = 0.9144 m, so 1 yd² = 0.9144² m²).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two area units — not just square yards and square meters.',
                '<b>Common use case:</b> converting a carpet or landscaping quote priced per square yard into square meters for a metric project budget.',
            ],
            howto: [
                { question: 'How many square meters are in a square yard?', answer: '<p>1 square yard equals approximately 0.8361 square meters. To convert, multiply the square yard value by 0.8361.</p>' },
                { question: 'Can I convert square meters back to square yards with this tool?', answer: '<p>Yes — just swap the "From" and "To" selectors to Square Meters and Square Yards respectively; the same widget handles both directions and any other unit pair.</p>' },
            ],
            inputs: areaInputs('en', '1'),
            outputs: resultOutput('en', 5),
        },
        ru: {
            slug: 'kalkulyator-kvadratnye-yardy-v-kvadratnye-metry',
            title: 'Конвертер квадратных ярдов в квадратные метры',
            h1: 'Конвертер квадратных ярдов в квадратные метры',
            meta_title: 'Квадратные ярды в квадратные метры | Конвертер любых единиц площади',
            meta_description: 'Конвертируйте квадратные ярды в квадратные метры мгновенно, или переключитесь на любую другую единицу площади — акры, гектары, квадратные футы и другие.',
            short_answer: 'Этот конвертер переводит значение площади из квадратных ярдов в квадратные метры (1 квадратный ярд = 0,8361 квадратного метра) — а также может конвертировать между любой парой единиц площади с помощью селекторов ниже.',
            intro_text: '<p>Квадратные ярды в квадратные метры нужны при сравнении площади ковра, газона или ткани, продаваемых за квадратный ярд (распространено в США и Великобритании), с метрическим количеством, необходимым для международного заказа или строительной спецификации.</p><p>Этот инструмент выходит за рамки ярд² и м²: используйте выпадающие списки "Из" и "В", чтобы конвертировать между любой комбинацией единиц площади.</p>',
            key_points: [
                '<b>Коэффициент конверсии:</b> 1 квадратный ярд = 0,836127 квадратного метра (квадрат коэффициента длины).',
                '<b>Полностью гибкий:</b> измените любой выпадающий список, чтобы конвертировать между любыми двумя единицами площади.',
                '<b>Частый случай использования:</b> конвертация расценки на ковёр или ландшафтные работы за квадратный ярд в квадратные метры для метрического бюджета проекта.',
            ],
            howto: [
                { question: 'Сколько квадратных метров в квадратном ярде?', answer: '<p>1 квадратный ярд равен примерно 0,8361 квадратного метра. Чтобы конвертировать, умножьте значение в ярд² на 0,8361.</p>' },
                { question: 'Могу ли я конвертировать квадратные метры обратно в квадратные ярды этим инструментом?', answer: '<p>Да — просто поменяйте местами селекторы "Из" и "В" на Квадратные метры и Квадратные ярды соответственно.</p>' },
            ],
            inputs: areaInputs('ru', '1'),
            outputs: resultOutput('ru', 5),
        },
        lv: {
            slug: 'kvadratjardu-uz-kvadratmetriem-kalkulators',
            title: 'Kvadrātjardu uz Kvadrātmetriem Kalkulators',
            h1: 'Kvadrātjardu uz Kvadrātmetriem Kalkulators',
            meta_title: 'Kvadrātjardi uz Kvadrātmetriem | Jebkuras Laukuma Vienības Konvertētājs',
            meta_description: 'Konvertējiet kvadrātjardus uz kvadrātmetriem acumirklī, vai pārslēdzieties uz jebkuru citu laukuma vienību — akriem, hektāriem, kvadrātpēdām un citām.',
            short_answer: 'Šis konvertētājs pārvērš laukuma vērtību no kvadrātjardiem uz kvadrātmetriem (1 kvadrātjards = 0,8361 kvadrātmetri) — un var konvertēt starp jebkuru laukuma vienību pāri, izmantojot zemāk esošos selektorus.',
            intro_text: '<p>Kvadrātjardi uz kvadrātmetriem parādās, salīdzinot paklāja, zāliena vai auduma laukumu, kas tiek pārdots kvadrātjardos (izplatīts ASV un Lielbritānijā), ar metrisko daudzumu, kas nepieciešams starptautiskam pasūtījumam vai būvniecības specifikācijai.</p><p>Šis rīks sniedzas tālāk par jardiem² un m²: izmantojiet nolaižamās izvēlnes "No" un "Uz", lai konvertētu starp jebkuru laukuma vienību kombināciju.</p>',
            key_points: [
                '<b>Konversijas koeficients:</b> 1 kvadrātjards = 0,836127 kvadrātmetri (garuma koeficienta kvadrāts).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru nolaižamo izvēlni, lai konvertētu starp jebkurām divām laukuma vienībām.',
                '<b>Bieži izmantošanas gadījums:</b> paklāja vai ainavu darbu cenas piedāvājuma, kas norādīts par kvadrātjardu, konvertēšana kvadrātmetros metriskā projekta budžetam.',
            ],
            howto: [
                { question: 'Cik kvadrātmetru ir kvadrātjardā?', answer: '<p>1 kvadrātjards ir aptuveni 0,8361 kvadrātmetri. Lai konvertētu, reiziniet jardu² vērtību ar 0,8361.</p>' },
                { question: 'Vai varu konvertēt kvadrātmetrus atpakaļ uz kvadrātjardiem ar šo rīku?', answer: '<p>Jā — vienkārši samainiet "No" un "Uz" selektorus attiecīgi uz Kvadrātmetriem un Kvadrātjardiem.</p>' },
            ],
            inputs: areaInputs('lv', '1'),
            outputs: resultOutput('lv', 5),
        },
        pl: {
            slug: 'kalkulator-jardow-kwadratowych-na-metry-kwadratowe',
            title: 'Kalkulator Jardów Kwadratowych na Metry Kwadratowe',
            h1: 'Kalkulator Jardów Kwadratowych na Metry Kwadratowe',
            meta_title: 'Jardy Kwadratowe na Metry Kwadratowe | Konwerter Dowolnej Jednostki Powierzchni',
            meta_description: 'Przelicz jardy kwadratowe na metry kwadratowe natychmiast lub przełącz się na dowolną inną jednostkę powierzchni — akry, hektary, stopy kwadratowe i inne.',
            short_answer: 'Ten konwerter zmienia wartość powierzchni z jardów kwadratowych na metry kwadratowe (1 jard kwadratowy = 0,8361 metra kwadratowego) — może też przeliczać między dowolną parą jednostek powierzchni za pomocą selektorów poniżej.',
            intro_text: '<p>Jardy kwadratowe na metry kwadratowe pojawiają się przy porównywaniu powierzchni dywanu, trawnika lub tkaniny sprzedawanej na jard kwadratowy (powszechne w USA i Wielkiej Brytanii) z wartością metryczną potrzebną do międzynarodowego zamówienia lub specyfikacji budowlanej.</p><p>To narzędzie wykracza poza yd² i m²: użyj list rozwijanych "Z" i "Do", aby przeliczać między dowolną kombinacją jednostek powierzchni.</p>',
            key_points: [
                '<b>Współczynnik konwersji:</b> 1 jard kwadratowy = 0,836127 metra kwadratowego (kwadrat współczynnika długości).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę rozwijaną, aby przeliczać między dowolnymi dwiema jednostkami powierzchni.',
                '<b>Częsty przypadek użycia:</b> przeliczanie wyceny dywanu lub prac ogrodowych podanej za jard kwadratowy na metry kwadratowe dla metrycznego budżetu projektu.',
            ],
            howto: [
                { question: 'Ile metrów kwadratowych jest w jardzie kwadratowym?', answer: '<p>1 jard kwadratowy to około 0,8361 metra kwadratowego. Aby przeliczyć, pomnóż wartość w yd² przez 0,8361.</p>' },
                { question: 'Czy mogę przeliczyć metry kwadratowe z powrotem na jardy kwadratowe tym narzędziem?', answer: '<p>Tak — po prostu zamień selektory "Z" i "Do" odpowiednio na Metry Kwadratowe i Jardy Kwadratowe.</p>' },
            ],
            inputs: areaInputs('pl', '1'),
            outputs: resultOutput('pl', 5),
        },
        es: {
            slug: 'calculadora-de-yardas-cuadradas-a-metros-cuadrados',
            title: 'Calculadora de Yardas Cuadradas a Metros Cuadrados',
            h1: 'Calculadora de Yardas Cuadradas a Metros Cuadrados',
            meta_title: 'Yardas Cuadradas a Metros Cuadrados | Convertidor de Cualquier Unidad de Área',
            meta_description: 'Convierte yardas cuadradas a metros cuadrados al instante, o cambia a cualquier otra unidad de área — acres, hectáreas, pies cuadrados y más.',
            short_answer: 'Este convertidor cambia un valor de área de yardas cuadradas a metros cuadrados (1 yarda cuadrada = 0,8361 metros cuadrados) — y puede convertir entre cualquier par de unidades de área usando los selectores de abajo.',
            intro_text: '<p>Yardas cuadradas a metros cuadrados surge al comparar la superficie de alfombra, césped o tela vendida por yarda cuadrada (común en EE. UU. y el Reino Unido) con una cantidad métrica necesaria para un pedido internacional o una especificación de construcción.</p><p>Esta herramienta va más allá de yd² y m²: usa los menús desplegables "De" y "A" para convertir entre cualquier combinación de unidades de área.</p>',
            key_points: [
                '<b>Factor de conversión:</b> 1 yarda cuadrada = 0,836127 metros cuadrados (el cuadrado del factor de longitud).',
                '<b>Totalmente flexible:</b> cambia cualquier menú desplegable para convertir entre dos unidades de área cualesquiera.',
                '<b>Caso de uso común:</b> convertir un presupuesto de alfombra o jardinería cotizado por yarda cuadrada a metros cuadrados para un presupuesto de proyecto métrico.',
            ],
            howto: [
                { question: '¿Cuántos metros cuadrados hay en una yarda cuadrada?', answer: '<p>1 yarda cuadrada equivale aproximadamente a 0,8361 metros cuadrados. Para convertir, multiplica el valor en yd² por 0,8361.</p>' },
                { question: '¿Puedo convertir metros cuadrados de vuelta a yardas cuadradas con esta herramienta?', answer: '<p>Sí — simplemente intercambia los selectores "De" y "A" a Metros Cuadrados y Yardas Cuadradas respectivamente.</p>' },
            ],
            inputs: areaInputs('es', '1'),
            outputs: resultOutput('es', 5),
        },
        fr: {
            slug: 'calculateur-de-yards-carres-en-metres-carres',
            title: 'Calculateur de Yards Carrés en Mètres Carrés',
            h1: 'Calculateur de Yards Carrés en Mètres Carrés',
            meta_title: 'Yards Carrés en Mètres Carrés | Convertisseur de Toute Unité de Surface',
            meta_description: 'Convertissez des yards carrés en mètres carrés instantanément, ou passez à toute autre unité de surface — acres, hectares, pieds carrés et plus.',
            short_answer: 'Ce convertisseur transforme une valeur de surface de yards carrés en mètres carrés (1 yard carré = 0,8361 mètre carré) — et peut convertir entre n’importe quelle paire d’unités de surface grâce aux sélecteurs ci-dessous.',
            intro_text: '<p>Yards carrés en mètres carrés apparaît lors de la comparaison de la surface de moquette, gazon ou tissu vendue au yard carré (courant aux États-Unis et au Royaume-Uni) avec une quantité métrique nécessaire pour une commande internationale ou une spécification de construction.</p><p>Cet outil va au-delà des yd² et m² : utilisez les listes déroulantes « De » et « Vers » pour convertir entre n’importe quelle combinaison d’unités de surface.</p>',
            key_points: [
                '<b>Facteur de conversion :</b> 1 yard carré = 0,836127 mètre carré (le carré du facteur de longueur).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste déroulante pour convertir entre deux unités de surface quelconques.',
                '<b>Cas d’usage courant :</b> convertir un devis de moquette ou de paysagisme facturé au yard carré en mètres carrés pour un budget de projet métrique.',
            ],
            howto: [
                { question: 'Combien de mètres carrés y a-t-il dans un yard carré ?', answer: '<p>1 yard carré équivaut à environ 0,8361 mètre carré. Pour convertir, multipliez la valeur en yd² par 0,8361.</p>' },
                { question: 'Puis-je convertir des mètres carrés en yards carrés avec cet outil ?', answer: '<p>Oui — il suffit d’échanger les sélecteurs « De » et « Vers » vers Mètres Carrés et Yards Carrés respectivement.</p>' },
            ],
            inputs: areaInputs('fr', '1'),
            outputs: resultOutput('fr', 5),
        },
        it: {
            slug: 'calcolatore-da-iarde-quadrate-a-metri-quadrati',
            title: 'Calcolatore da Iarde Quadrate a Metri Quadrati',
            h1: 'Calcolatore da Iarde Quadrate a Metri Quadrati',
            meta_title: 'Iarde Quadrate in Metri Quadrati | Convertitore di Qualsiasi Unità di Area',
            meta_description: 'Converti iarde quadrate in metri quadrati istantaneamente, o passa a qualsiasi altra unità di area — acri, ettari, piedi quadrati e altro.',
            short_answer: 'Questo convertitore trasforma un valore di area da iarde quadrate a metri quadrati (1 iarda quadrata = 0,8361 metri quadrati) — e può convertire tra qualsiasi coppia di unità di area usando i selettori qui sotto.',
            intro_text: '<p>Iarde quadrate in metri quadrati emerge quando si confronta la superficie di tappeti, prato o tessuto venduti a iarda quadrata (comune negli USA e nel Regno Unito) con una quantità metrica necessaria per un ordine internazionale o una specifica edilizia.</p><p>Questo strumento va oltre yd² e m²: usa i menu a tendina "Da" e "A" per convertire tra qualsiasi combinazione di unità di area.</p>',
            key_points: [
                '<b>Fattore di conversione:</b> 1 iarda quadrata = 0,836127 metri quadrati (il quadrato del fattore di lunghezza).',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due unità di area qualsiasi.',
                '<b>Caso d’uso comune:</b> convertire un preventivo di tappeti o giardinaggio quotato per iarda quadrata in metri quadrati per un budget di progetto metrico.',
            ],
            howto: [
                { question: 'Quanti metri quadrati ci sono in una iarda quadrata?', answer: '<p>1 iarda quadrata equivale a circa 0,8361 metri quadrati. Per convertire, moltiplica il valore in yd² per 0,8361.</p>' },
                { question: 'Posso convertire i metri quadrati in iarde quadrate con questo strumento?', answer: '<p>Sì — basta scambiare i selettori "Da" e "A" rispettivamente in Metri Quadrati e Iarde Quadrate.</p>' },
            ],
            inputs: areaInputs('it', '1'),
            outputs: resultOutput('it', 5),
        },
        de: {
            slug: 'quadratyard-in-quadratmeter-rechner',
            title: 'Quadratyard in Quadratmeter Rechner',
            h1: 'Quadratyard in Quadratmeter Rechner',
            meta_title: 'Quadratyard in Quadratmeter | Umrechner für Jede Flächeneinheit',
            meta_description: 'Rechnen Sie Quadratyards sofort in Quadratmeter um, oder wechseln Sie zu jeder anderen Flächeneinheit — Acres, Hektar, Quadratfuß und mehr.',
            short_answer: 'Dieser Umrechner wandelt einen Flächenwert von Quadratyards in Quadratmeter um (1 Quadratyard = 0,8361 Quadratmeter) — und kann zwischen jedem beliebigen Paar von Flächeneinheiten mit den Auswahlfeldern unten umrechnen.',
            intro_text: '<p>Quadratyard in Quadratmeter kommt vor, wenn die Teppich-, Rasen- oder Stofffläche, die pro Quadratyard verkauft wird (üblich in den USA und Großbritannien), mit einer metrischen Menge für eine internationale Bestellung oder Baugenehmigung verglichen werden muss.</p><p>Dieses Tool geht über yd² und m² hinaus: Verwenden Sie die Dropdown-Menüs "Von" und "Zu", um zwischen jeder Kombination von Flächeneinheiten umzurechnen.</p>',
            key_points: [
                '<b>Umrechnungsfaktor:</b> 1 Quadratyard = 0,836127 Quadratmeter (das Quadrat des Längenfaktors).',
                '<b>Vollständig flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei beliebigen Flächeneinheiten umzurechnen.',
                '<b>Häufiger Anwendungsfall:</b> Umrechnung eines Teppich- oder Landschaftsbau-Angebots, das pro Quadratyard berechnet wird, in Quadratmeter für ein metrisches Projektbudget.',
            ],
            howto: [
                { question: 'Wie viele Quadratmeter sind in einem Quadratyard?', answer: '<p>1 Quadratyard entspricht etwa 0,8361 Quadratmetern. Um umzurechnen, multiplizieren Sie den yd²-Wert mit 0,8361.</p>' },
                { question: 'Kann ich mit diesem Tool Quadratmeter zurück in Quadratyards umrechnen?', answer: '<p>Ja — tauschen Sie einfach die Auswahlfelder "Von" und "Zu" zu Quadratmeter bzw. Quadratyard.</p>' },
            ],
            inputs: areaInputs('de', '1'),
            outputs: resultOutput('de', 5),
        },
    },
}

export const tools: ToolDef[] = [metersToFeet, cmToInches, kmToMiles, mmToInches, ydToMeters, ftToInches, m2ToFt2, acresToHectares, ft2ToM2, km2ToMi2, hectaresToAcres, yd2ToM2]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: LENGTH_AREA_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: LENGTH_AREA_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} length & area converters across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
