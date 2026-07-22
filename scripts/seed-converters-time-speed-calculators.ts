// One-off script: seeds 11 new Time & Speed Converter calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-converters-time-speed-calculators.ts
//
// Tool IDs 1105-1115, category_id '31' (Time & Speed Converters, under Converters).
// These are the pure conversion/arithmetic tools from the requested list; the
// calendar/scheduling/live-widget tools (Age Calculator, Countdown Timer, Sunrise/
// Sunset, Meeting Time Zone Overlap, etc.) went to the separate pre-existing
// "Date & Time Calculators" category (id '9') in a companion seed script, since
// several of the requested titles literally end "| Date & Time Calculators".
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TIME_SPEED_CATEGORY_ID = '31'

type InputField = {
    name: string
    label: string
    type: 'number' | 'select'
    unit?: string | null
    min?: number | null
    max?: number | null
    description?: string
    placeholder?: string
    options?: Array<{ value: string; label: string; abbr?: string }>
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
// Shared unit dictionaries
// ============================================================
const SPEED_UNIT_ORDER = ['mps', 'kmh', 'mph', 'knot', 'fps', 'mach']
const TIME_UNIT_ORDER = ['ms', 's', 'min', 'hour', 'day', 'week', 'month', 'year']

const SPEED_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { mps: 'Meters per second (m/s)', kmh: 'Kilometers per hour (km/h)', mph: 'Miles per hour (mph)', knot: 'Knots (nautical mph)', fps: 'Feet per second (ft/s)', mach: 'Mach (speed of sound)' },
    ru: { mps: 'Метры в секунду (м/с)', kmh: 'Километры в час (км/ч)', mph: 'Мили в час (mph)', knot: 'Узлы (морские мили в час)', fps: 'Футы в секунду (ft/s)', mach: 'Мах (скорость звука)' },
    de: { mps: 'Meter pro Sekunde (m/s)', kmh: 'Kilometer pro Stunde (km/h)', mph: 'Meilen pro Stunde (mph)', knot: 'Knoten (Seemeilen pro Stunde)', fps: 'Fuß pro Sekunde (ft/s)', mach: 'Mach (Schallgeschwindigkeit)' },
    es: { mps: 'Metros por segundo (m/s)', kmh: 'Kilómetros por hora (km/h)', mph: 'Millas por hora (mph)', knot: 'Nudos (millas náuticas por hora)', fps: 'Pies por segundo (ft/s)', mach: 'Mach (velocidad del sonido)' },
    fr: { mps: 'Mètres par seconde (m/s)', kmh: 'Kilomètres par heure (km/h)', mph: 'Miles par heure (mph)', knot: 'Nœuds (miles nautiques par heure)', fps: 'Pieds par seconde (ft/s)', mach: 'Mach (vitesse du son)' },
    it: { mps: 'Metri al secondo (m/s)', kmh: 'Chilometri all’ora (km/h)', mph: 'Miglia all’ora (mph)', knot: 'Nodi (miglia nautiche all’ora)', fps: 'Piedi al secondo (ft/s)', mach: 'Mach (velocità del suono)' },
    pl: { mps: 'Metry na sekundę (m/s)', kmh: 'Kilometry na godzinę (km/h)', mph: 'Mile na godzinę (mph)', knot: 'Węzły (mile morskie na godzinę)', fps: 'Stopy na sekundę (ft/s)', mach: 'Mach (prędkość dźwięku)' },
    lv: { mps: 'Metri sekundē (m/s)', kmh: 'Kilometri stundā (km/h)', mph: 'Jūdzes stundā (mph)', knot: 'Mezgli (jūras jūdzes stundā)', fps: 'Pēdas sekundē (ft/s)', mach: 'Mahs (skaņas ātrums)' },
}

const TIME_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { ms: 'Milliseconds', s: 'Seconds', min: 'Minutes', hour: 'Hours', day: 'Days', week: 'Weeks', month: 'Months (avg.)', year: 'Years (avg.)' },
    ru: { ms: 'Миллисекунды', s: 'Секунды', min: 'Минуты', hour: 'Часы', day: 'Дни', week: 'Недели', month: 'Месяцы (ср.)', year: 'Годы (ср.)' },
    de: { ms: 'Millisekunden', s: 'Sekunden', min: 'Minuten', hour: 'Stunden', day: 'Tage', week: 'Wochen', month: 'Monate (Ø)', year: 'Jahre (Ø)' },
    es: { ms: 'Milisegundos', s: 'Segundos', min: 'Minutos', hour: 'Horas', day: 'Días', week: 'Semanas', month: 'Meses (prom.)', year: 'Años (prom.)' },
    fr: { ms: 'Millisecondes', s: 'Secondes', min: 'Minutes', hour: 'Heures', day: 'Jours', week: 'Semaines', month: 'Mois (moy.)', year: 'Années (moy.)' },
    it: { ms: 'Millisecondi', s: 'Secondi', min: 'Minuti', hour: 'Ore', day: 'Giorni', week: 'Settimane', month: 'Mesi (media)', year: 'Anni (media)' },
    pl: { ms: 'Milisekundy', s: 'Sekundy', min: 'Minuty', hour: 'Godziny', day: 'Dni', week: 'Tygodnie', month: 'Miesiące (śr.)', year: 'Lata (śr.)' },
    lv: { ms: 'Milisekundes', s: 'Sekundes', min: 'Minūtes', hour: 'Stundas', day: 'Dienas', week: 'Nedēļas', month: 'Mēneši (vid.)', year: 'Gadi (vid.)' },
}

function speedUnitOptions(lang: string) {
    const labels = SPEED_UNIT_LABELS[lang] || SPEED_UNIT_LABELS.en
    return SPEED_UNIT_ORDER.map((code) => ({ value: code, label: labels[code], abbr: code }))
}
function timeUnitOptions(lang: string) {
    const labels = TIME_UNIT_LABELS[lang] || TIME_UNIT_LABELS.en
    return TIME_UNIT_ORDER.map((code) => ({ value: code, label: labels[code], abbr: code }))
}

const FROM_LABEL: Record<string, string> = { en: 'From', ru: 'Из', de: 'Von', es: 'De', fr: 'De', it: 'Da', pl: 'Z', lv: 'No' }
const TO_LABEL: Record<string, string> = { en: 'To', ru: 'В', de: 'Zu', es: 'A', fr: 'Vers', it: 'A', pl: 'Do', lv: 'Uz' }
const VALUE_LABEL: Record<string, string> = { en: 'Value', ru: 'Значение', de: 'Wert', es: 'Valor', fr: 'Valeur', it: 'Valore', pl: 'Wartość', lv: 'Vērtība' }
const CONVERTED_LABEL: Record<string, string> = { en: 'Converted Value', ru: 'Результат конвертации', de: 'Umgerechneter Wert', es: 'Valor Convertido', fr: 'Valeur Convertie', it: 'Valore Convertito', pl: 'Przeliczona Wartość', lv: 'Pārrēķinātā Vērtība' }
const RESULT_LABEL: Record<string, string> = { en: 'Result', ru: 'Результат', de: 'Ergebnis', es: 'Resultado', fr: 'Résultat', it: 'Risultato', pl: 'Wynik', lv: 'Rezultāts' }

// ============================================================
// 1105: Speed Conversion Calculator
// ============================================================
const speedConversion: ToolDef = {
    id: '1105',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 100 }, { key: 'from_unit', default: 'kmh' }, { key: 'to_unit', default: 'mph' }],
        functions: { result: { type: 'function', functionName: 'speedConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } } },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'speed-conversion-calculator', title: 'Speed Conversion Calculator', h1: 'Speed Conversion Calculator',
            meta_title: 'Speed Conversion Calculator | km/h, mph, m/s, Knots, Mach',
            meta_description: 'Convert between km/h, mph, m/s, knots, ft/s, and Mach instantly with this speed converter.',
            short_answer: 'This converter changes a speed value between km/h, mph, m/s, knots, ft/s, and Mach using the selectors below.',
            intro_text: '<p>Speed is expressed in different units around the world and across contexts — km/h and m/s in most metric countries, mph on US and UK roads, knots in aviation and marine navigation, and Mach for supersonic aircraft.</p><p>This tool converts between all six directly, so you don\'t need to look up separate conversion factors for each pair.</p>',
            key_points: [
                '<b>Key factors:</b> 1 km/h = 0.277778 m/s; 1 mph = 0.44704 m/s exactly; 1 knot = 0.514444 m/s (1 nautical mile/hour).',
                '<b>Mach is context-dependent:</b> the speed of sound varies with air temperature and altitude — this converter uses the standard sea-level value (340.3 m/s at 15°C), a common reference point, not the exact local speed of sound at altitude.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the six supported speed units.',
            ],
            howto: [
                { question: 'How do I convert km/h to mph?', answer: '<p>Multiply the km/h value by 0.621371, or select "Kilometers per hour" as From and "Miles per hour" as To in this converter.</p>' },
                { question: 'Why does Mach depend on altitude?', answer: '<p>The speed of sound decreases with lower air temperature, and temperature drops with altitude — so "Mach 1" at 35,000 feet is a slower absolute speed than "Mach 1" at sea level.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.en, type: 'select', options: speedUnitOptions('en') },
                { name: 'to_unit', label: TO_LABEL.en, type: 'select', options: speedUnitOptions('en') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.en, unitFrom: 'to_unit', precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-konversii-skorosti', title: 'Калькулятор конверсии скорости', h1: 'Калькулятор конверсии скорости',
            meta_title: 'Конвертер скорости | км/ч, миль/ч, м/с, узлы, Мах',
            meta_description: 'Конвертируйте между км/ч, миль/ч, м/с, узлами, футами/с и Махом мгновенно.',
            short_answer: 'Этот конвертер переводит значение скорости между км/ч, миль/ч, м/с, узлами, футами/с и Махом.',
            intro_text: '<p>Скорость выражается в разных единицах в мире и контекстах — км/ч и м/с в метрических странах, мили/ч на дорогах США и Великобритании, узлы в авиации и морской навигации, Мах для сверхзвуковых самолётов.</p><p>Этот инструмент конвертирует между всеми шестью напрямую.</p>',
            key_points: [
                '<b>Ключевые коэффициенты:</b> 1 км/ч = 0,277778 м/с; 1 миля/ч = 0,44704 м/с точно; 1 узел = 0,514444 м/с.',
                '<b>Мах зависит от контекста:</b> скорость звука меняется с температурой и высотой — используется стандартное значение на уровне моря (340,3 м/с при 15°C).',
                '<b>Полностью гибкий:</b> измените любой список, чтобы конвертировать между любыми двумя из шести единиц.',
            ],
            howto: [
                { question: 'Как перевести км/ч в мили/ч?', answer: '<p>Умножьте значение км/ч на 0,621371, или выберите "Километры в час" как "Из" и "Мили в час" как "В".</p>' },
                { question: 'Почему Мах зависит от высоты?', answer: '<p>Скорость звука уменьшается с понижением температуры воздуха, а температура падает с высотой.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.ru, type: 'select', options: speedUnitOptions('ru') },
                { name: 'to_unit', label: TO_LABEL.ru, type: 'select', options: speedUnitOptions('ru') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.ru, unitFrom: 'to_unit', precision: 4 }],
        },
        lv: {
            slug: 'atruma-konversijas-kalkulators', title: 'Ātruma Konversijas Kalkulators', h1: 'Ātruma Konversijas Kalkulators',
            meta_title: 'Ātruma Konvertētājs | km/h, mph, m/s, Mezgli, Mahs',
            meta_description: 'Konvertējiet starp km/h, mph, m/s, mezgliem, ft/s un Mahu acumirklī.',
            short_answer: 'Šis konvertētājs pārvērš ātruma vērtību starp km/h, mph, m/s, mezgliem, ft/s un Mahu.',
            intro_text: '<p>Ātrums tiek izteikts dažādās vienībās visā pasaulē — km/h un m/s metriskajās valstīs, mph ASV un Lielbritānijas ceļos, mezgli aviācijā un jūras navigācijā, Mahs virsskaņas lidmašīnām.</p><p>Šis rīks konvertē starp visām sešām tieši.</p>',
            key_points: [
                '<b>Galvenie koeficienti:</b> 1 km/h = 0,277778 m/s; 1 mph = 0,44704 m/s precīzi; 1 mezgls = 0,514444 m/s.',
                '<b>Mahs ir atkarīgs no konteksta:</b> skaņas ātrums mainās ar temperatūru un augstumu — izmantota standarta jūras līmeņa vērtība (340,3 m/s pie 15°C).',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru sarakstu, lai konvertētu starp jebkurām divām no sešām vienībām.',
            ],
            howto: [
                { question: 'Kā konvertēt km/h uz mph?', answer: '<p>Reiziniet km/h vērtību ar 0,621371, vai izvēlieties "Kilometri stundā" kā No un "Jūdzes stundā" kā Uz.</p>' },
                { question: 'Kāpēc Mahs ir atkarīgs no augstuma?', answer: '<p>Skaņas ātrums samazinās ar zemāku gaisa temperatūru, un temperatūra krītas ar augstumu.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.lv, type: 'select', options: speedUnitOptions('lv') },
                { name: 'to_unit', label: TO_LABEL.lv, type: 'select', options: speedUnitOptions('lv') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.lv, unitFrom: 'to_unit', precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-konwersji-predkosci', title: 'Kalkulator Konwersji Prędkości', h1: 'Kalkulator Konwersji Prędkości',
            meta_title: 'Konwerter Prędkości | km/h, mph, m/s, Węzły, Mach',
            meta_description: 'Przelicz między km/h, mph, m/s, węzłami, ft/s i Machem natychmiast.',
            short_answer: 'Ten konwerter zmienia wartość prędkości między km/h, mph, m/s, węzłami, ft/s i Machem.',
            intro_text: '<p>Prędkość wyrażana jest w różnych jednostkach na świecie — km/h i m/s w krajach metrycznych, mph na drogach USA i Wielkiej Brytanii, węzły w lotnictwie i żegludze, Mach dla samolotów naddźwiękowych.</p><p>To narzędzie przelicza między wszystkimi sześcioma bezpośrednio.</p>',
            key_points: [
                '<b>Kluczowe współczynniki:</b> 1 km/h = 0,277778 m/s; 1 mph = 0,44704 m/s dokładnie; 1 węzeł = 0,514444 m/s.',
                '<b>Mach zależy od kontekstu:</b> prędkość dźwięku zmienia się z temperaturą i wysokością — użyto standardowej wartości na poziomie morza (340,3 m/s przy 15°C).',
                '<b>W pełni elastyczny:</b> zmień dowolną listę, aby przeliczać między dowolnymi dwiema z sześciu jednostek.',
            ],
            howto: [
                { question: 'Jak przeliczyć km/h na mph?', answer: '<p>Pomnóż wartość km/h przez 0,621371, lub wybierz "Kilometry na godzinę" jako Z i "Mile na godzinę" jako Do.</p>' },
                { question: 'Dlaczego Mach zależy od wysokości?', answer: '<p>Prędkość dźwięku maleje wraz ze spadkiem temperatury powietrza, a temperatura spada wraz z wysokością.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.pl, type: 'select', options: speedUnitOptions('pl') },
                { name: 'to_unit', label: TO_LABEL.pl, type: 'select', options: speedUnitOptions('pl') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.pl, unitFrom: 'to_unit', precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-conversion-de-velocidad', title: 'Calculadora de Conversión de Velocidad', h1: 'Calculadora de Conversión de Velocidad',
            meta_title: 'Convertidor de Velocidad | km/h, mph, m/s, Nudos, Mach',
            meta_description: 'Convierte entre km/h, mph, m/s, nudos, ft/s y Mach al instante.',
            short_answer: 'Esta calculadora cambia un valor de velocidad entre km/h, mph, m/s, nudos, ft/s y Mach.',
            intro_text: '<p>La velocidad se expresa en diferentes unidades en el mundo — km/h y m/s en países métricos, mph en carreteras de EE. UU. y Reino Unido, nudos en aviación y navegación marítima, Mach para aviones supersónicos.</p><p>Esta herramienta convierte entre las seis directamente.</p>',
            key_points: [
                '<b>Factores clave:</b> 1 km/h = 0,277778 m/s; 1 mph = 0,44704 m/s exactos; 1 nudo = 0,514444 m/s.',
                '<b>Mach depende del contexto:</b> la velocidad del sonido varía con la temperatura y la altitud — se usa el valor estándar a nivel del mar (340,3 m/s a 15°C).',
                '<b>Totalmente flexible:</b> cambia cualquier lista para convertir entre dos cualesquiera de las seis unidades.',
            ],
            howto: [
                { question: '¿Cómo convierto km/h a mph?', answer: '<p>Multiplica el valor en km/h por 0,621371, o selecciona "Kilómetros por hora" como De y "Millas por hora" como A.</p>' },
                { question: '¿Por qué Mach depende de la altitud?', answer: '<p>La velocidad del sonido disminuye con la temperatura del aire, y la temperatura baja con la altitud.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.es, type: 'select', options: speedUnitOptions('es') },
                { name: 'to_unit', label: TO_LABEL.es, type: 'select', options: speedUnitOptions('es') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.es, unitFrom: 'to_unit', precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-conversion-de-vitesse', title: 'Calculateur de Conversion de Vitesse', h1: 'Calculateur de Conversion de Vitesse',
            meta_title: 'Convertisseur de Vitesse | km/h, mph, m/s, Nœuds, Mach',
            meta_description: 'Convertissez entre km/h, mph, m/s, nœuds, ft/s et Mach instantanément.',
            short_answer: 'Ce calculateur change une valeur de vitesse entre km/h, mph, m/s, nœuds, ft/s et Mach.',
            intro_text: '<p>La vitesse s’exprime dans différentes unités dans le monde — km/h et m/s dans les pays métriques, mph sur les routes américaines et britanniques, nœuds en aviation et navigation maritime, Mach pour les avions supersoniques.</p><p>Cet outil convertit entre les six directement.</p>',
            key_points: [
                '<b>Facteurs clés :</b> 1 km/h = 0,277778 m/s ; 1 mph = 0,44704 m/s exactement ; 1 nœud = 0,514444 m/s.',
                '<b>Le Mach dépend du contexte :</b> la vitesse du son varie avec la température et l’altitude — la valeur standard au niveau de la mer est utilisée (340,3 m/s à 15°C).',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste pour convertir entre deux des six unités.',
            ],
            howto: [
                { question: 'Comment convertir km/h en mph ?', answer: '<p>Multipliez la valeur en km/h par 0,621371, ou sélectionnez « Kilomètres par heure » comme De et « Miles par heure » comme Vers.</p>' },
                { question: 'Pourquoi le Mach dépend-il de l’altitude ?', answer: '<p>La vitesse du son diminue avec la baisse de température de l’air, et la température baisse avec l’altitude.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.fr, type: 'select', options: speedUnitOptions('fr') },
                { name: 'to_unit', label: TO_LABEL.fr, type: 'select', options: speedUnitOptions('fr') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.fr, unitFrom: 'to_unit', precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-conversione-della-velocita', title: 'Calcolatore di Conversione della Velocità', h1: 'Calcolatore di Conversione della Velocità',
            meta_title: 'Convertitore di Velocità | km/h, mph, m/s, Nodi, Mach',
            meta_description: 'Converti tra km/h, mph, m/s, nodi, ft/s e Mach istantaneamente.',
            short_answer: 'Questo convertitore cambia un valore di velocità tra km/h, mph, m/s, nodi, ft/s e Mach.',
            intro_text: '<p>La velocità è espressa in diverse unità nel mondo — km/h e m/s nei paesi metrici, mph sulle strade USA e britanniche, nodi in aviazione e navigazione marittima, Mach per aerei supersonici.</p><p>Questo strumento converte tra tutte e sei direttamente.</p>',
            key_points: [
                '<b>Fattori chiave:</b> 1 km/h = 0,277778 m/s; 1 mph = 0,44704 m/s esatti; 1 nodo = 0,514444 m/s.',
                '<b>Il Mach dipende dal contesto:</b> la velocità del suono varia con temperatura e altitudine — viene usato il valore standard a livello del mare (340,3 m/s a 15°C).',
                '<b>Completamente flessibile:</b> cambia qualsiasi elenco per convertire tra due qualsiasi delle sei unità.',
            ],
            howto: [
                { question: 'Come converto km/h in mph?', answer: '<p>Moltiplica il valore in km/h per 0,621371, oppure seleziona "Chilometri all’ora" come Da e "Miglia all’ora" come A.</p>' },
                { question: 'Perché il Mach dipende dall’altitudine?', answer: '<p>La velocità del suono diminuisce con la temperatura dell’aria, e la temperatura scende con l’altitudine.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.it, type: 'select', options: speedUnitOptions('it') },
                { name: 'to_unit', label: TO_LABEL.it, type: 'select', options: speedUnitOptions('it') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.it, unitFrom: 'to_unit', precision: 4 }],
        },
        de: {
            slug: 'geschwindigkeits-umrechner', title: 'Geschwindigkeits-Umrechner', h1: 'Geschwindigkeits-Umrechner',
            meta_title: 'Geschwindigkeitsumrechner | km/h, mph, m/s, Knoten, Mach',
            meta_description: 'Rechnen Sie zwischen km/h, mph, m/s, Knoten, ft/s und Mach sofort um.',
            short_answer: 'Dieser Rechner wandelt einen Geschwindigkeitswert zwischen km/h, mph, m/s, Knoten, ft/s und Mach um.',
            intro_text: '<p>Geschwindigkeit wird weltweit in unterschiedlichen Einheiten ausgedrückt — km/h und m/s in metrischen Ländern, mph auf US- und UK-Straßen, Knoten in Luftfahrt und Seefahrt, Mach für Überschallflugzeuge.</p><p>Dieses Tool rechnet direkt zwischen allen sechs um.</p>',
            key_points: [
                '<b>Wichtige Faktoren:</b> 1 km/h = 0,277778 m/s; 1 mph = genau 0,44704 m/s; 1 Knoten = 0,514444 m/s.',
                '<b>Mach ist kontextabhängig:</b> die Schallgeschwindigkeit variiert mit Lufttemperatur und Höhe — dieser Rechner verwendet den Standardwert auf Meereshöhe (340,3 m/s bei 15°C).',
                '<b>Vollständig flexibel:</b> ändern Sie eine der Listen, um zwischen zwei der sechs Einheiten umzurechnen.',
            ],
            howto: [
                { question: 'Wie rechne ich km/h in mph um?', answer: '<p>Multiplizieren Sie den km/h-Wert mit 0,621371, oder wählen Sie "Kilometer pro Stunde" als Von und "Meilen pro Stunde" als Zu.</p>' },
                { question: 'Warum hängt Mach von der Höhe ab?', answer: '<p>Die Schallgeschwindigkeit sinkt mit niedrigerer Lufttemperatur, und die Temperatur sinkt mit der Höhe.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.de, type: 'select', options: speedUnitOptions('de') },
                { name: 'to_unit', label: TO_LABEL.de, type: 'select', options: speedUnitOptions('de') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.de, unitFrom: 'to_unit', precision: 4 }],
        },
    },
}

// ============================================================
// 1106: Time Conversion Calculator
// ============================================================
const timeConversion: ToolDef = {
    id: '1106',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 1 }, { key: 'from_unit', default: 'hour' }, { key: 'to_unit', default: 'min' }],
        functions: { result: { type: 'function', functionName: 'timeUnitConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } } },
        outputs: [{ key: 'result', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'time-conversion-calculator', title: 'Time Conversion Calculator', h1: 'Time Conversion Calculator',
            meta_title: 'Time Conversion Calculator | Seconds, Minutes, Hours, Days, Years',
            meta_description: 'Convert between milliseconds, seconds, minutes, hours, days, weeks, months, and years instantly.',
            short_answer: 'This converter changes a time duration between milliseconds, seconds, minutes, hours, days, weeks, months, and years.',
            intro_text: '<p>This is a general-purpose time-unit converter for any duration — from milliseconds up to years — useful for anything from converting a stopwatch split to planning a project timeline in weeks or months.</p>',
            key_points: [
                '<b>Exact relationships:</b> 1 day = 24 hours = 1,440 minutes = 86,400 seconds exactly.',
                '<b>Months and years are averages:</b> since calendar months vary from 28-31 days, this converter uses the average Gregorian month (30.44 days) and year (365.2425 days) — for exact calendar-date math, use the Date Difference Calculator instead.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the eight supported time units.',
            ],
            howto: [
                { question: 'How many seconds are in a day?', answer: '<p>Exactly 86,400 seconds (24 × 60 × 60).</p>' },
                { question: 'Why use an "average" month instead of an exact one?', answer: '<p>A pure duration converter has no specific calendar month to reference — the average (30.44 days) is the standard convention for duration-only conversions. For date-to-date arithmetic, use a calendar-aware tool instead.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.en, type: 'select', options: timeUnitOptions('en') },
                { name: 'to_unit', label: TO_LABEL.en, type: 'select', options: timeUnitOptions('en') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.en, unitFrom: 'to_unit', precision: 6 }],
        },
        ru: {
            slug: 'kalkulyator-konversii-vremeni', title: 'Калькулятор конверсии времени', h1: 'Калькулятор конверсии времени',
            meta_title: 'Конвертер времени | Секунды, минуты, часы, дни, годы',
            meta_description: 'Конвертируйте между миллисекундами, секундами, минутами, часами, днями, неделями, месяцами и годами.',
            short_answer: 'Этот конвертер переводит длительность времени между миллисекундами, секундами, минутами, часами, днями, неделями, месяцами и годами.',
            intro_text: '<p>Это универсальный конвертер единиц времени для любой продолжительности — от миллисекунд до лет.</p>',
            key_points: [
                '<b>Точные соотношения:</b> 1 день = 24 часа = 1440 минут = 86400 секунд точно.',
                '<b>Месяцы и годы — средние значения:</b> используется среднее значение (30,44 дня для месяца, 365,2425 дня для года) — для точной календарной арифметики используйте калькулятор разницы дат.',
                '<b>Полностью гибкий:</b> измените любой список, чтобы конвертировать между любыми двумя из восьми единиц.',
            ],
            howto: [
                { question: 'Сколько секунд в сутках?', answer: '<p>Ровно 86400 секунд (24 × 60 × 60).</p>' },
                { question: 'Почему используется "средний" месяц?', answer: '<p>У чистого конвертера длительности нет конкретного календарного месяца — используется среднее значение.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.ru, type: 'select', options: timeUnitOptions('ru') },
                { name: 'to_unit', label: TO_LABEL.ru, type: 'select', options: timeUnitOptions('ru') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.ru, unitFrom: 'to_unit', precision: 6 }],
        },
        lv: {
            slug: 'laika-konversijas-kalkulators', title: 'Laika Konversijas Kalkulators', h1: 'Laika Konversijas Kalkulators',
            meta_title: 'Laika Konvertētājs | Sekundes, Minūtes, Stundas, Dienas, Gadi',
            meta_description: 'Konvertējiet starp milisekundēm, sekundēm, minūtēm, stundām, dienām, nedēļām, mēnešiem un gadiem.',
            short_answer: 'Šis konvertētājs pārvērš laika ilgumu starp milisekundēm, sekundēm, minūtēm, stundām, dienām, nedēļām, mēnešiem un gadiem.',
            intro_text: '<p>Šis ir universāls laika vienību konvertētājs jebkuram ilgumam — no milisekundēm līdz gadiem.</p>',
            key_points: [
                '<b>Precīzas attiecības:</b> 1 diena = 24 stundas = 1440 minūtes = 86400 sekundes precīzi.',
                '<b>Mēneši un gadi ir vidējie:</b> izmantota vidējā vērtība (30,44 dienas mēnesim, 365,2425 dienas gadam) — precīzai kalendāra aritmētikai izmantojiet Datumu Starpības Kalkulatoru.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru sarakstu, lai konvertētu starp jebkurām divām no astoņām vienībām.',
            ],
            howto: [
                { question: 'Cik sekunžu ir dienā?', answer: '<p>Tieši 86400 sekundes (24 × 60 × 60).</p>' },
                { question: 'Kāpēc izmantot "vidējo" mēnesi?', answer: '<p>Tīram ilguma konvertētājam nav konkrēta kalendāra mēneša — izmantota vidējā vērtība.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.lv, type: 'select', options: timeUnitOptions('lv') },
                { name: 'to_unit', label: TO_LABEL.lv, type: 'select', options: timeUnitOptions('lv') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.lv, unitFrom: 'to_unit', precision: 6 }],
        },
        pl: {
            slug: 'kalkulator-konwersji-czasu', title: 'Kalkulator Konwersji Czasu', h1: 'Kalkulator Konwersji Czasu',
            meta_title: 'Konwerter Czasu | Sekundy, Minuty, Godziny, Dni, Lata',
            meta_description: 'Przelicz między milisekundami, sekundami, minutami, godzinami, dniami, tygodniami, miesiącami i latami.',
            short_answer: 'Ten konwerter zmienia czas trwania między milisekundami, sekundami, minutami, godzinami, dniami, tygodniami, miesiącami i latami.',
            intro_text: '<p>To uniwersalny konwerter jednostek czasu dla dowolnego czasu trwania — od milisekund po lata.</p>',
            key_points: [
                '<b>Dokładne zależności:</b> 1 dzień = 24 godziny = 1440 minut = 86400 sekund dokładnie.',
                '<b>Miesiące i lata to średnie:</b> użyto średniej wartości (30,44 dnia dla miesiąca, 365,2425 dnia dla roku) — do dokładnej arytmetyki kalendarzowej użyj Kalkulatora Różnicy Dat.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę, aby przeliczać między dowolnymi dwiema z ośmiu jednostek.',
            ],
            howto: [
                { question: 'Ile sekund jest w dobie?', answer: '<p>Dokładnie 86400 sekund (24 × 60 × 60).</p>' },
                { question: 'Dlaczego używa się "średniego" miesiąca?', answer: '<p>Czysty konwerter czasu trwania nie ma konkretnego miesiąca kalendarzowego — używana jest wartość średnia.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.pl, type: 'select', options: timeUnitOptions('pl') },
                { name: 'to_unit', label: TO_LABEL.pl, type: 'select', options: timeUnitOptions('pl') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.pl, unitFrom: 'to_unit', precision: 6 }],
        },
        es: {
            slug: 'calculadora-de-conversion-de-tiempo', title: 'Calculadora de Conversión de Tiempo', h1: 'Calculadora de Conversión de Tiempo',
            meta_title: 'Convertidor de Tiempo | Segundos, Minutos, Horas, Días, Años',
            meta_description: 'Convierte entre milisegundos, segundos, minutos, horas, días, semanas, meses y años.',
            short_answer: 'Esta calculadora cambia una duración de tiempo entre milisegundos, segundos, minutos, horas, días, semanas, meses y años.',
            intro_text: '<p>Este es un convertidor de unidades de tiempo de propósito general para cualquier duración — desde milisegundos hasta años.</p>',
            key_points: [
                '<b>Relaciones exactas:</b> 1 día = 24 horas = 1440 minutos = 86400 segundos exactos.',
                '<b>Meses y años son promedios:</b> se usa el valor promedio (30,44 días para el mes, 365,2425 días para el año) — para aritmética exacta de calendario, usa la Calculadora de Diferencia de Fechas.',
                '<b>Totalmente flexible:</b> cambia cualquier lista para convertir entre dos cualesquiera de las ocho unidades.',
            ],
            howto: [
                { question: '¿Cuántos segundos hay en un día?', answer: '<p>Exactamente 86400 segundos (24 × 60 × 60).</p>' },
                { question: '¿Por qué se usa un mes "promedio"?', answer: '<p>Un convertidor de duración pura no tiene un mes calendario específico — se usa el valor promedio.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.es, type: 'select', options: timeUnitOptions('es') },
                { name: 'to_unit', label: TO_LABEL.es, type: 'select', options: timeUnitOptions('es') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.es, unitFrom: 'to_unit', precision: 6 }],
        },
        fr: {
            slug: 'calculateur-de-conversion-de-temps', title: 'Calculateur de Conversion de Temps', h1: 'Calculateur de Conversion de Temps',
            meta_title: 'Convertisseur de Temps | Secondes, Minutes, Heures, Jours, Années',
            meta_description: 'Convertissez entre millisecondes, secondes, minutes, heures, jours, semaines, mois et années.',
            short_answer: 'Ce calculateur change une durée entre millisecondes, secondes, minutes, heures, jours, semaines, mois et années.',
            intro_text: '<p>Ceci est un convertisseur d’unités de temps polyvalent pour toute durée — des millisecondes aux années.</p>',
            key_points: [
                '<b>Relations exactes :</b> 1 jour = 24 heures = 1440 minutes = 86400 secondes exactement.',
                '<b>Mois et années sont des moyennes :</b> la valeur moyenne est utilisée (30,44 jours pour le mois, 365,2425 jours pour l’année) — pour un calcul calendaire exact, utilisez le Calculateur de Différence de Dates.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste pour convertir entre deux des huit unités.',
            ],
            howto: [
                { question: 'Combien de secondes y a-t-il dans un jour ?', answer: '<p>Exactement 86400 secondes (24 × 60 × 60).</p>' },
                { question: 'Pourquoi utiliser un mois « moyen » ?', answer: '<p>Un convertisseur de durée pure n’a pas de mois calendaire spécifique — la valeur moyenne est utilisée.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.fr, type: 'select', options: timeUnitOptions('fr') },
                { name: 'to_unit', label: TO_LABEL.fr, type: 'select', options: timeUnitOptions('fr') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.fr, unitFrom: 'to_unit', precision: 6 }],
        },
        it: {
            slug: 'calcolatore-di-conversione-del-tempo', title: 'Calcolatore di Conversione del Tempo', h1: 'Calcolatore di Conversione del Tempo',
            meta_title: 'Convertitore di Tempo | Secondi, Minuti, Ore, Giorni, Anni',
            meta_description: 'Converti tra millisecondi, secondi, minuti, ore, giorni, settimane, mesi e anni.',
            short_answer: 'Questo convertitore cambia una durata tra millisecondi, secondi, minuti, ore, giorni, settimane, mesi e anni.',
            intro_text: '<p>Questo è un convertitore di unità di tempo generico per qualsiasi durata — da millisecondi ad anni.</p>',
            key_points: [
                '<b>Relazioni esatte:</b> 1 giorno = 24 ore = 1440 minuti = 86400 secondi esatti.',
                '<b>Mesi e anni sono medie:</b> viene usato il valore medio (30,44 giorni per il mese, 365,2425 giorni per l’anno) — per un’aritmetica di calendario esatta, usa il Calcolatore di Differenza tra Date.',
                '<b>Completamente flessibile:</b> cambia qualsiasi elenco per convertire tra due qualsiasi delle otto unità.',
            ],
            howto: [
                { question: 'Quanti secondi ci sono in un giorno?', answer: '<p>Esattamente 86400 secondi (24 × 60 × 60).</p>' },
                { question: 'Perché si usa un mese "medio"?', answer: '<p>Un convertitore di durata pura non ha un mese di calendario specifico — viene usato il valore medio.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.it, type: 'select', options: timeUnitOptions('it') },
                { name: 'to_unit', label: TO_LABEL.it, type: 'select', options: timeUnitOptions('it') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.it, unitFrom: 'to_unit', precision: 6 }],
        },
        de: {
            slug: 'zeit-umrechner', title: 'Zeit-Umrechner', h1: 'Zeit-Umrechner',
            meta_title: 'Zeitumrechner | Sekunden, Minuten, Stunden, Tage, Jahre',
            meta_description: 'Rechnen Sie zwischen Millisekunden, Sekunden, Minuten, Stunden, Tagen, Wochen, Monaten und Jahren um.',
            short_answer: 'Dieser Rechner wandelt eine Zeitdauer zwischen Millisekunden, Sekunden, Minuten, Stunden, Tagen, Wochen, Monaten und Jahren um.',
            intro_text: '<p>Dies ist ein universeller Zeiteinheiten-Rechner für jede Dauer — von Millisekunden bis zu Jahren.</p>',
            key_points: [
                '<b>Exakte Beziehungen:</b> 1 Tag = 24 Stunden = 1440 Minuten = genau 86400 Sekunden.',
                '<b>Monate und Jahre sind Durchschnittswerte:</b> es wird der Durchschnittswert verwendet (30,44 Tage für den Monat, 365,2425 Tage für das Jahr) — für exakte Kalenderarithmetik nutzen Sie den Datumsdifferenz-Rechner.',
                '<b>Vollständig flexibel:</b> ändern Sie eine der Listen, um zwischen zwei der acht Einheiten umzurechnen.',
            ],
            howto: [
                { question: 'Wie viele Sekunden hat ein Tag?', answer: '<p>Genau 86400 Sekunden (24 × 60 × 60).</p>' },
                { question: 'Warum wird ein "durchschnittlicher" Monat verwendet?', answer: '<p>Ein reiner Dauer-Rechner hat keinen bestimmten Kalendermonat als Referenz — der Durchschnittswert wird verwendet.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.de, type: 'select', options: timeUnitOptions('de') },
                { name: 'to_unit', label: TO_LABEL.de, type: 'select', options: timeUnitOptions('de') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.de, unitFrom: 'to_unit', precision: 6 }],
        },
    },
}

// ============================================================
// 1107: Speed Distance Time Calculator
// ============================================================
const solveForOptions: Record<string, Array<{ value: string; label: string }>> = {
    en: [{ value: 'distance', label: 'Distance' }, { value: 'speed', label: 'Speed' }, { value: 'time', label: 'Time' }],
    ru: [{ value: 'distance', label: 'Расстояние' }, { value: 'speed', label: 'Скорость' }, { value: 'time', label: 'Время' }],
    lv: [{ value: 'distance', label: 'Attālums' }, { value: 'speed', label: 'Ātrums' }, { value: 'time', label: 'Laiks' }],
    pl: [{ value: 'distance', label: 'Odległość' }, { value: 'speed', label: 'Prędkość' }, { value: 'time', label: 'Czas' }],
    es: [{ value: 'distance', label: 'Distancia' }, { value: 'speed', label: 'Velocidad' }, { value: 'time', label: 'Tiempo' }],
    fr: [{ value: 'distance', label: 'Distance' }, { value: 'speed', label: 'Vitesse' }, { value: 'time', label: 'Temps' }],
    it: [{ value: 'distance', label: 'Distanza' }, { value: 'speed', label: 'Velocità' }, { value: 'time', label: 'Tempo' }],
    de: [{ value: 'distance', label: 'Entfernung' }, { value: 'speed', label: 'Geschwindigkeit' }, { value: 'time', label: 'Zeit' }],
}
const SOLVE_FOR_LABEL: Record<string, string> = { en: 'Solve For', ru: 'Найти', de: 'Berechnen', es: 'Calcular', fr: 'Calculer', it: 'Calcolare', pl: 'Oblicz', lv: 'Aprēķināt' }
const DISTANCE_LABEL: Record<string, string> = { en: 'Distance', ru: 'Расстояние', de: 'Entfernung', es: 'Distancia', fr: 'Distance', it: 'Distanza', pl: 'Odległość', lv: 'Attālums' }
const SPEED_LABEL: Record<string, string> = { en: 'Speed', ru: 'Скорость', de: 'Geschwindigkeit', es: 'Velocidad', fr: 'Vitesse', it: 'Velocità', pl: 'Prędkość', lv: 'Ātrums' }
const TIME_LABEL: Record<string, string> = { en: 'Time', ru: 'Время', de: 'Zeit', es: 'Tiempo', fr: 'Temps', it: 'Tempo', pl: 'Czas', lv: 'Laiks' }

function sdtInputs(lang: string, distanceUnit: string, speedUnit: string): InputField[] {
    return [
        { name: 'solve_for', label: SOLVE_FOR_LABEL[lang], type: 'select', options: solveForOptions[lang], default: 'time' },
        { name: 'distance', label: DISTANCE_LABEL[lang], type: 'number', unit: distanceUnit, min: 0, max: 1000000000, placeholder: '100' },
        { name: 'speed', label: SPEED_LABEL[lang], type: 'number', unit: speedUnit, min: 0, max: 1000000000, placeholder: '60' },
        { name: 'time', label: TIME_LABEL[lang], type: 'number', unit: 'hours', min: 0, max: 1000000000, placeholder: '1.67' },
    ]
}
function sdtOutputs(lang: string, distanceUnit: string, speedUnit: string): OutputField[] {
    return [
        { name: 'distance', label: DISTANCE_LABEL[lang], unit: distanceUnit, precision: 3 },
        { name: 'speed', label: SPEED_LABEL[lang], unit: speedUnit, precision: 3 },
        { name: 'time', label: TIME_LABEL[lang], unit: 'hours', precision: 3 },
    ]
}

const speedDistanceTime: ToolDef = {
    id: '1107',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'solve_for', default: 'time' }, { key: 'distance', default: 100 }, { key: 'speed', default: 60 }, { key: 'time', default: 1.67 }],
        functions: { result: { type: 'function', functionName: 'speedDistanceTime', params: { solve_for: 'solve_for', distance: 'distance', speed: 'speed', time: 'time' } } },
        outputs: [{ key: 'distance', precision: 3 }, { key: 'speed', precision: 3 }, { key: 'time', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'speed-distance-time-calculator', title: 'Speed Distance Time Calculator', h1: 'Speed Distance Time Calculator',
            meta_title: 'Speed Distance Time Calculator | Solve for Any One of the Three',
            meta_description: 'Calculate speed, distance, or time from the other two using the classic speed = distance ÷ time relationship.',
            short_answer: 'This calculator solves the speed-distance-time relationship (speed = distance ÷ time) for whichever value you choose to find, given the other two.',
            intro_text: '<p>Speed, distance, and time are linked by one simple equation — knowing any two lets you calculate the third. Choose which one to solve for, enter the other two, and the result (along with the full relationship) is calculated instantly.</p>',
            key_points: [
                '<b>Formula:</b> Speed = Distance ÷ Time; Distance = Speed × Time; Time = Distance ÷ Speed.',
                '<b>Pick "Solve For" first:</b> select which value you want computed — the other two fields are what you fill in; whatever you type into the field matching your "Solve For" choice is ignored.',
                '<b>Units:</b> distance and speed use the same distance unit (e.g. km and km/h) for consistency, and time is always in hours.',
            ],
            howto: [
                { question: 'If I drove 100 km in 1.67 hours, what was my speed?', answer: '<p>Set "Solve For" to Speed, enter Distance = 100 and Time = 1.67 — the result is 60 km/h (100 ÷ 1.67).</p>' },
                { question: 'How do I find travel time for a given distance and speed?', answer: '<p>Set "Solve For" to Time, enter your Distance and Speed — Time = Distance ÷ Speed.</p>' },
            ],
            inputs: sdtInputs('en', 'km', 'km/h'),
            outputs: sdtOutputs('en', 'km', 'km/h'),
        },
        ru: {
            slug: 'kalkulyator-skorost-rasstoyanie-vremya', title: 'Калькулятор скорость-расстояние-время', h1: 'Калькулятор скорость-расстояние-время',
            meta_title: 'Скорость, расстояние, время | Найти любую из трёх величин',
            meta_description: 'Рассчитайте скорость, расстояние или время по двум известным величинам.',
            short_answer: 'Этот калькулятор решает соотношение скорость-расстояние-время (скорость = расстояние ÷ время) для выбранной величины по двум известным.',
            intro_text: '<p>Скорость, расстояние и время связаны одним простым уравнением — зная любые два значения, можно найти третье.</p>',
            key_points: [
                '<b>Формула:</b> Скорость = Расстояние ÷ Время; Расстояние = Скорость × Время; Время = Расстояние ÷ Скорость.',
                '<b>Сначала выберите "Найти":</b> выберите, какое значение нужно вычислить — остальные два заполняете вы.',
                '<b>Единицы:</b> расстояние и скорость используют одну и ту же единицу расстояния (например, км и км/ч), время всегда в часах.',
            ],
            howto: [
                { question: 'Если я проехал 100 км за 1,67 часа, какая была скорость?', answer: '<p>Установите "Найти" на Скорость, введите Расстояние = 100 и Время = 1,67 — результат 60 км/ч.</p>' },
                { question: 'Как найти время в пути по расстоянию и скорости?', answer: '<p>Установите "Найти" на Время, введите Расстояние и Скорость.</p>' },
            ],
            inputs: sdtInputs('ru', 'км', 'км/ч'),
            outputs: sdtOutputs('ru', 'км', 'км/ч'),
        },
        lv: {
            slug: 'atruma-attaluma-laika-kalkulators', title: 'Ātruma-Attāluma-Laika Kalkulators', h1: 'Ātruma-Attāluma-Laika Kalkulators',
            meta_title: 'Ātrums, Attālums, Laiks | Aprēķiniet Jebkuru no Trim',
            meta_description: 'Aprēķiniet ātrumu, attālumu vai laiku no pārējiem diviem lielumiem.',
            short_answer: 'Šis kalkulators risina ātruma-attāluma-laika attiecību (ātrums = attālums ÷ laiks) izvēlētajam lielumam.',
            intro_text: '<p>Ātrums, attālums un laiks ir saistīti ar vienu vienkāršu vienādojumu — zinot jebkurus divus, var aprēķināt trešo.</p>',
            key_points: [
                '<b>Formula:</b> Ātrums = Attālums ÷ Laiks; Attālums = Ātrums × Laiks; Laiks = Attālums ÷ Ātrums.',
                '<b>Vispirms izvēlieties "Aprēķināt":</b> izvēlieties, kuru lielumu aprēķināt — pārējos divus aizpildāt jūs.',
                '<b>Vienības:</b> attālums un ātrums izmanto vienu un to pašu attāluma vienību (piemēram, km un km/h), laiks vienmēr stundās.',
            ],
            howto: [
                { question: 'Ja braucu 100 km 1,67 stundās, kāds bija mans ātrums?', answer: '<p>Iestatiet "Aprēķināt" uz Ātrums, ievadiet Attālums = 100 un Laiks = 1,67 — rezultāts ir 60 km/h.</p>' },
                { question: 'Kā atrast braukšanas laiku pēc attāluma un ātruma?', answer: '<p>Iestatiet "Aprēķināt" uz Laiks, ievadiet Attālumu un Ātrumu.</p>' },
            ],
            inputs: sdtInputs('lv', 'km', 'km/h'),
            outputs: sdtOutputs('lv', 'km', 'km/h'),
        },
        pl: {
            slug: 'kalkulator-predkosc-odleglosc-czas', title: 'Kalkulator Prędkość-Odległość-Czas', h1: 'Kalkulator Prędkość-Odległość-Czas',
            meta_title: 'Prędkość, Odległość, Czas | Oblicz Dowolną z Trzech Wartości',
            meta_description: 'Oblicz prędkość, odległość lub czas na podstawie pozostałych dwóch wartości.',
            short_answer: 'Ten kalkulator rozwiązuje zależność prędkość-odległość-czas (prędkość = odległość ÷ czas) dla wybranej wartości.',
            intro_text: '<p>Prędkość, odległość i czas są powiązane jednym prostym równaniem — znając dowolne dwie wartości, można obliczyć trzecią.</p>',
            key_points: [
                '<b>Wzór:</b> Prędkość = Odległość ÷ Czas; Odległość = Prędkość × Czas; Czas = Odległość ÷ Prędkość.',
                '<b>Najpierw wybierz "Oblicz":</b> wybierz, którą wartość obliczyć — pozostałe dwie wypełniasz sam.',
                '<b>Jednostki:</b> odległość i prędkość używają tej samej jednostki odległości (np. km i km/h), czas zawsze w godzinach.',
            ],
            howto: [
                { question: 'Jeśli przejechałem 100 km w 1,67 godziny, jaka była moja prędkość?', answer: '<p>Ustaw "Oblicz" na Prędkość, wpisz Odległość = 100 i Czas = 1,67 — wynik to 60 km/h.</p>' },
                { question: 'Jak znaleźć czas podróży na podstawie odległości i prędkości?', answer: '<p>Ustaw "Oblicz" na Czas, wpisz Odległość i Prędkość.</p>' },
            ],
            inputs: sdtInputs('pl', 'km', 'km/h'),
            outputs: sdtOutputs('pl', 'km', 'km/h'),
        },
        es: {
            slug: 'calculadora-de-velocidad-distancia-tiempo', title: 'Calculadora de Velocidad, Distancia y Tiempo', h1: 'Calculadora de Velocidad, Distancia y Tiempo',
            meta_title: 'Velocidad, Distancia, Tiempo | Calcula Cualquiera de los Tres',
            meta_description: 'Calcula la velocidad, distancia o tiempo a partir de los otros dos valores.',
            short_answer: 'Esta calculadora resuelve la relación velocidad-distancia-tiempo (velocidad = distancia ÷ tiempo) para el valor elegido.',
            intro_text: '<p>Velocidad, distancia y tiempo están relacionados por una ecuación simple — conociendo dos cualesquiera, se puede calcular el tercero.</p>',
            key_points: [
                '<b>Fórmula:</b> Velocidad = Distancia ÷ Tiempo; Distancia = Velocidad × Tiempo; Tiempo = Distancia ÷ Velocidad.',
                '<b>Elige primero "Calcular":</b> selecciona qué valor calcular — los otros dos los completas tú.',
                '<b>Unidades:</b> distancia y velocidad usan la misma unidad de distancia (por ejemplo, km y km/h), el tiempo siempre en horas.',
            ],
            howto: [
                { question: 'Si conduje 100 km en 1,67 horas, ¿cuál fue mi velocidad?', answer: '<p>Configura "Calcular" en Velocidad, introduce Distancia = 100 y Tiempo = 1,67 — el resultado es 60 km/h.</p>' },
                { question: '¿Cómo encuentro el tiempo de viaje dados distancia y velocidad?', answer: '<p>Configura "Calcular" en Tiempo, introduce Distancia y Velocidad.</p>' },
            ],
            inputs: sdtInputs('es', 'km', 'km/h'),
            outputs: sdtOutputs('es', 'km', 'km/h'),
        },
        fr: {
            slug: 'calculateur-de-vitesse-distance-temps', title: 'Calculateur de Vitesse, Distance et Temps', h1: 'Calculateur de Vitesse, Distance et Temps',
            meta_title: 'Vitesse, Distance, Temps | Calculez l’une des Trois',
            meta_description: 'Calculez la vitesse, la distance ou le temps à partir des deux autres valeurs.',
            short_answer: 'Ce calculateur résout la relation vitesse-distance-temps (vitesse = distance ÷ temps) pour la valeur choisie.',
            intro_text: '<p>Vitesse, distance et temps sont liés par une équation simple — connaissant deux d’entre elles, on peut calculer la troisième.</p>',
            key_points: [
                '<b>Formule :</b> Vitesse = Distance ÷ Temps ; Distance = Vitesse × Temps ; Temps = Distance ÷ Vitesse.',
                '<b>Choisissez d’abord « Calculer » :</b> sélectionnez la valeur à calculer — vous remplissez les deux autres.',
                '<b>Unités :</b> distance et vitesse utilisent la même unité de distance (ex. km et km/h), le temps est toujours en heures.',
            ],
            howto: [
                { question: 'Si j’ai parcouru 100 km en 1,67 heure, quelle était ma vitesse ?', answer: '<p>Réglez « Calculer » sur Vitesse, entrez Distance = 100 et Temps = 1,67 — le résultat est 60 km/h.</p>' },
                { question: 'Comment trouver le temps de trajet pour une distance et une vitesse données ?', answer: '<p>Réglez « Calculer » sur Temps, entrez Distance et Vitesse.</p>' },
            ],
            inputs: sdtInputs('fr', 'km', 'km/h'),
            outputs: sdtOutputs('fr', 'km', 'km/h'),
        },
        it: {
            slug: 'calcolatore-velocita-distanza-tempo', title: 'Calcolatore Velocità, Distanza e Tempo', h1: 'Calcolatore Velocità, Distanza e Tempo',
            meta_title: 'Velocità, Distanza, Tempo | Calcola una delle Tre',
            meta_description: 'Calcola velocità, distanza o tempo a partire dagli altri due valori.',
            short_answer: 'Questo calcolatore risolve la relazione velocità-distanza-tempo (velocità = distanza ÷ tempo) per il valore scelto.',
            intro_text: '<p>Velocità, distanza e tempo sono collegati da una semplice equazione — conoscendone due, si può calcolare la terza.</p>',
            key_points: [
                '<b>Formula:</b> Velocità = Distanza ÷ Tempo; Distanza = Velocità × Tempo; Tempo = Distanza ÷ Velocità.',
                '<b>Scegli prima "Calcolare":</b> seleziona quale valore calcolare — gli altri due li inserisci tu.',
                '<b>Unità:</b> distanza e velocità usano la stessa unità di distanza (es. km e km/h), il tempo è sempre in ore.',
            ],
            howto: [
                { question: 'Se ho guidato 100 km in 1,67 ore, quale era la mia velocità?', answer: '<p>Imposta "Calcolare" su Velocità, inserisci Distanza = 100 e Tempo = 1,67 — il risultato è 60 km/h.</p>' },
                { question: 'Come trovo il tempo di viaggio data distanza e velocità?', answer: '<p>Imposta "Calcolare" su Tempo, inserisci Distanza e Velocità.</p>' },
            ],
            inputs: sdtInputs('it', 'km', 'km/h'),
            outputs: sdtOutputs('it', 'km', 'km/h'),
        },
        de: {
            slug: 'geschwindigkeit-entfernung-zeit-rechner', title: 'Geschwindigkeit-Entfernung-Zeit-Rechner', h1: 'Geschwindigkeit-Entfernung-Zeit-Rechner',
            meta_title: 'Geschwindigkeit, Entfernung, Zeit | Eine der Drei Berechnen',
            meta_description: 'Berechnen Sie Geschwindigkeit, Entfernung oder Zeit aus den beiden anderen Werten.',
            short_answer: 'Dieser Rechner löst die Beziehung Geschwindigkeit-Entfernung-Zeit (Geschwindigkeit = Entfernung ÷ Zeit) für den gewählten Wert.',
            intro_text: '<p>Geschwindigkeit, Entfernung und Zeit sind durch eine einfache Gleichung verbunden — kennt man zwei davon, lässt sich die dritte berechnen.</p>',
            key_points: [
                '<b>Formel:</b> Geschwindigkeit = Entfernung ÷ Zeit; Entfernung = Geschwindigkeit × Zeit; Zeit = Entfernung ÷ Geschwindigkeit.',
                '<b>Wählen Sie zuerst "Berechnen":</b> wählen Sie, welcher Wert berechnet werden soll — die anderen beiden füllen Sie aus.',
                '<b>Einheiten:</b> Entfernung und Geschwindigkeit verwenden dieselbe Entfernungseinheit (z.B. km und km/h), Zeit immer in Stunden.',
            ],
            howto: [
                { question: 'Wenn ich 100 km in 1,67 Stunden gefahren bin, wie hoch war meine Geschwindigkeit?', answer: '<p>Stellen Sie "Berechnen" auf Geschwindigkeit, geben Sie Entfernung = 100 und Zeit = 1,67 ein — das Ergebnis ist 60 km/h.</p>' },
                { question: 'Wie finde ich die Reisezeit bei gegebener Entfernung und Geschwindigkeit?', answer: '<p>Stellen Sie "Berechnen" auf Zeit, geben Sie Entfernung und Geschwindigkeit ein.</p>' },
            ],
            inputs: sdtInputs('de', 'km', 'km/h'),
            outputs: sdtOutputs('de', 'km', 'km/h'),
        },
    },
}

const DECIMAL_HOURS_LABEL: Record<string, string> = { en: 'Decimal Hours', ru: 'Десятичные часы', de: 'Dezimalstunden', es: 'Horas Decimales', fr: 'Heures Décimales', it: 'Ore Decimali', pl: 'Godziny Dziesiętne', lv: 'Decimālās Stundas' }
const HOURS_LABEL: Record<string, string> = { en: 'Hours', ru: 'Часы', de: 'Stunden', es: 'Horas', fr: 'Heures', it: 'Ore', pl: 'Godziny', lv: 'Stundas' }
const MINUTES_LABEL: Record<string, string> = { en: 'Minutes', ru: 'Минуты', de: 'Minuten', es: 'Minutos', fr: 'Minutes', it: 'Minuti', pl: 'Minuty', lv: 'Minūtes' }
const SECONDS_LABEL: Record<string, string> = { en: 'Seconds', ru: 'Секунды', de: 'Sekunden', es: 'Segundos', fr: 'Secondes', it: 'Secondi', pl: 'Sekundy', lv: 'Sekundes' }

// ============================================================
// 1108: Decimal to Time Calculator
// ============================================================
const decimalToTimeTool: ToolDef = {
    id: '1108',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'decimal_hours', default: 7.5 }],
        functions: { result: { type: 'function', functionName: 'decimalToTime', params: { decimal_hours: 'decimal_hours' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'decimal-to-time-calculator', title: 'Decimal to Time Calculator', h1: 'Decimal to Time Calculator',
            meta_title: 'Decimal to Time Calculator | Convert Decimal Hours to h:m:s',
            meta_description: 'Convert decimal hours (like 7.5) into standard hours:minutes:seconds format instantly.',
            short_answer: 'This calculator converts a decimal hours value (e.g. 7.5) into h:m:s format (7:30:00).',
            intro_text: '<p>Timesheets and payroll systems often store hours as decimals (7.5 hours) while people think in clock format (7 hours 30 minutes) — this tool bridges the two instantly.</p>',
            key_points: [
                '<b>Formula:</b> minutes = (decimal part) × 60, then seconds = (remaining decimal) × 60.',
                '<b>Example:</b> 7.5 decimal hours = 7 hours + 0.5×60 = 30 minutes = 7:30:00.',
                '<b>Common in payroll:</b> decimal hours are standard for timesheet totals since they add up cleanly; clock format is more intuitive for reading.',
            ],
            howto: [
                { question: 'What is 7.75 hours in h:m:s?', answer: '<p>7 hours, plus 0.75 × 60 = 45 minutes → 7:45:00.</p>' },
                { question: 'Can I convert negative values?', answer: '<p>Yes, a negative decimal produces a negative duration (e.g. -1.5 → -1:30:00), useful for showing a deficit.</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.en }],
        },
        ru: {
            slug: 'kalkulyator-decimal-v-vremya', title: 'Калькулятор десятичных часов во время', h1: 'Калькулятор десятичных часов во время',
            meta_title: 'Десятичные часы в время | Конвертер в формат ч:м:с',
            meta_description: 'Конвертируйте десятичные часы (например, 7,5) в формат часы:минуты:секунды мгновенно.',
            short_answer: 'Этот калькулятор конвертирует значение десятичных часов (например, 7,5) в формат ч:м:с (7:30:00).',
            intro_text: '<p>Табели учёта рабочего времени часто хранят часы в десятичном формате (7,5 часа), а люди мыслят в формате часов (7 часов 30 минут) — этот инструмент мгновенно связывает их.</p>',
            key_points: [
                '<b>Формула:</b> минуты = (дробная часть) × 60, затем секунды = (оставшаяся дробная часть) × 60.',
                '<b>Пример:</b> 7,5 десятичных часа = 7 часов + 0,5×60 = 30 минут = 7:30:00.',
                '<b>Часто в расчёте зарплаты:</b> десятичные часы стандартны для итогов табеля.',
            ],
            howto: [
                { question: 'Сколько это 7,75 часа в формате ч:м:с?', answer: '<p>7 часов плюс 0,75 × 60 = 45 минут → 7:45:00.</p>' },
                { question: 'Можно ли конвертировать отрицательные значения?', answer: '<p>Да, отрицательное десятичное число даёт отрицательную длительность (например, -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.ru }],
        },
        lv: {
            slug: 'decimalskaitla-uz-laiku-kalkulators', title: 'Decimālskaitļa uz Laiku Kalkulators', h1: 'Decimālskaitļa uz Laiku Kalkulators',
            meta_title: 'Decimālās Stundas uz Laiku | Konvertētājs h:m:s Formātā',
            meta_description: 'Konvertējiet decimālās stundas (piemēram, 7,5) uz stundas:minūtes:sekundes formātu acumirklī.',
            short_answer: 'Šis kalkulators konvertē decimālo stundu vērtību (piemēram, 7,5) uz h:m:s formātu (7:30:00).',
            intro_text: '<p>Darba laika uzskaites sistēmas bieži glabā stundas decimālā formātā (7,5 stundas), bet cilvēki domā pulksteņa formātā (7 stundas 30 minūtes).</p>',
            key_points: [
                '<b>Formula:</b> minūtes = (daļskaitlis) × 60, tad sekundes = (atlikušais daļskaitlis) × 60.',
                '<b>Piemērs:</b> 7,5 decimālas stundas = 7 stundas + 0,5×60 = 30 minūtes = 7:30:00.',
                '<b>Bieži algu aprēķinos:</b> decimālās stundas ir standarts darba laika uzskaites kopsummām.',
            ],
            howto: [
                { question: 'Cik ir 7,75 stundas h:m:s formātā?', answer: '<p>7 stundas plus 0,75 × 60 = 45 minūtes → 7:45:00.</p>' },
                { question: 'Vai varu konvertēt negatīvas vērtības?', answer: '<p>Jā, negatīvs decimālskaitlis dod negatīvu ilgumu (piemēram, -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.lv }],
        },
        pl: {
            slug: 'kalkulator-dziesietny-na-czas', title: 'Kalkulator z Dziesiętnego na Czas', h1: 'Kalkulator z Dziesiętnego na Czas',
            meta_title: 'Godziny Dziesiętne na Czas | Konwerter na Format h:m:s',
            meta_description: 'Przelicz godziny dziesiętne (np. 7,5) na format godziny:minuty:sekundy natychmiast.',
            short_answer: 'Ten kalkulator przelicza wartość godzin dziesiętnych (np. 7,5) na format h:m:s (7:30:00).',
            intro_text: '<p>Systemy ewidencji czasu pracy często przechowują godziny jako liczby dziesiętne (7,5 godziny), a ludzie myślą w formacie zegarowym (7 godzin 30 minut).</p>',
            key_points: [
                '<b>Wzór:</b> minuty = (część ułamkowa) × 60, potem sekundy = (pozostała część ułamkowa) × 60.',
                '<b>Przykład:</b> 7,5 godziny dziesiętnej = 7 godzin + 0,5×60 = 30 minut = 7:30:00.',
                '<b>Częste w płacach:</b> godziny dziesiętne są standardem dla sum w ewidencji czasu pracy.',
            ],
            howto: [
                { question: 'Ile to 7,75 godziny w formacie h:m:s?', answer: '<p>7 godzin plus 0,75 × 60 = 45 minut → 7:45:00.</p>' },
                { question: 'Czy mogę przeliczać wartości ujemne?', answer: '<p>Tak, ujemna liczba dziesiętna daje ujemny czas trwania (np. -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.pl }],
        },
        es: {
            slug: 'calculadora-de-decimal-a-tiempo', title: 'Calculadora de Decimal a Tiempo', h1: 'Calculadora de Decimal a Tiempo',
            meta_title: 'Decimal a Tiempo | Convertidor a Formato h:m:s',
            meta_description: 'Convierte horas decimales (como 7,5) a formato horas:minutos:segundos al instante.',
            short_answer: 'Esta calculadora convierte un valor de horas decimales (p. ej. 7,5) a formato h:m:s (7:30:00).',
            intro_text: '<p>Los sistemas de nómina suelen almacenar las horas como decimales (7,5 horas), mientras que las personas piensan en formato de reloj (7 horas 30 minutos).</p>',
            key_points: [
                '<b>Fórmula:</b> minutos = (parte decimal) × 60, luego segundos = (decimal restante) × 60.',
                '<b>Ejemplo:</b> 7,5 horas decimales = 7 horas + 0,5×60 = 30 minutos = 7:30:00.',
                '<b>Común en nóminas:</b> las horas decimales son estándar para totales de hojas de tiempo.',
            ],
            howto: [
                { question: '¿Cuánto es 7,75 horas en h:m:s?', answer: '<p>7 horas más 0,75 × 60 = 45 minutos → 7:45:00.</p>' },
                { question: '¿Puedo convertir valores negativos?', answer: '<p>Sí, un decimal negativo produce una duración negativa (p. ej. -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.es }],
        },
        fr: {
            slug: 'calculateur-de-decimal-en-temps', title: 'Calculateur de Décimal en Temps', h1: 'Calculateur de Décimal en Temps',
            meta_title: 'Décimal en Temps | Convertisseur au Format h:m:s',
            meta_description: 'Convertissez des heures décimales (comme 7,5) au format heures:minutes:secondes instantanément.',
            short_answer: 'Ce calculateur convertit une valeur d’heures décimales (ex. 7,5) au format h:m:s (7:30:00).',
            intro_text: '<p>Les systèmes de paie stockent souvent les heures en décimal (7,5 heures), tandis que les gens pensent au format horloge (7 heures 30 minutes).</p>',
            key_points: [
                '<b>Formule :</b> minutes = (partie décimale) × 60, puis secondes = (décimale restante) × 60.',
                '<b>Exemple :</b> 7,5 heures décimales = 7 heures + 0,5×60 = 30 minutes = 7:30:00.',
                '<b>Courant en paie :</b> les heures décimales sont la norme pour les totaux de feuilles de temps.',
            ],
            howto: [
                { question: 'Combien font 7,75 heures en h:m:s ?', answer: '<p>7 heures plus 0,75 × 60 = 45 minutes → 7:45:00.</p>' },
                { question: 'Puis-je convertir des valeurs négatives ?', answer: '<p>Oui, un décimal négatif produit une durée négative (ex. -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.fr }],
        },
        it: {
            slug: 'calcolatore-da-decimale-a-tempo', title: 'Calcolatore da Decimale a Tempo', h1: 'Calcolatore da Decimale a Tempo',
            meta_title: 'Decimale in Tempo | Convertitore in Formato h:m:s',
            meta_description: 'Converti ore decimali (come 7,5) in formato ore:minuti:secondi istantaneamente.',
            short_answer: 'Questo calcolatore converte un valore di ore decimali (es. 7,5) in formato h:m:s (7:30:00).',
            intro_text: '<p>I sistemi di gestione presenze spesso memorizzano le ore come decimali (7,5 ore), mentre le persone pensano in formato orologio (7 ore 30 minuti).</p>',
            key_points: [
                '<b>Formula:</b> minuti = (parte decimale) × 60, poi secondi = (decimale rimanente) × 60.',
                '<b>Esempio:</b> 7,5 ore decimali = 7 ore + 0,5×60 = 30 minuti = 7:30:00.',
                '<b>Comune nelle buste paga:</b> le ore decimali sono lo standard per i totali dei fogli presenze.',
            ],
            howto: [
                { question: 'Quanto sono 7,75 ore in h:m:s?', answer: '<p>7 ore più 0,75 × 60 = 45 minuti → 7:45:00.</p>' },
                { question: 'Posso convertire valori negativi?', answer: '<p>Sì, un decimale negativo produce una durata negativa (es. -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.it }],
        },
        de: {
            slug: 'dezimal-in-zeit-rechner', title: 'Dezimal in Zeit Rechner', h1: 'Dezimal in Zeit Rechner',
            meta_title: 'Dezimal in Zeit | Umrechner ins Format h:m:s',
            meta_description: 'Rechnen Sie Dezimalstunden (wie 7,5) sofort ins Format Stunden:Minuten:Sekunden um.',
            short_answer: 'Dieser Rechner wandelt einen Dezimalstundenwert (z.B. 7,5) ins Format h:m:s (7:30:00) um.',
            intro_text: '<p>Zeiterfassungssysteme speichern Stunden oft als Dezimalzahl (7,5 Stunden), während Menschen im Uhrformat denken (7 Stunden 30 Minuten).</p>',
            key_points: [
                '<b>Formel:</b> Minuten = (Dezimalteil) × 60, dann Sekunden = (verbleibender Dezimalteil) × 60.',
                '<b>Beispiel:</b> 7,5 Dezimalstunden = 7 Stunden + 0,5×60 = 30 Minuten = 7:30:00.',
                '<b>Üblich in der Lohnabrechnung:</b> Dezimalstunden sind Standard für Stundenzettel-Summen.',
            ],
            howto: [
                { question: 'Was sind 7,75 Stunden in h:m:s?', answer: '<p>7 Stunden plus 0,75 × 60 = 45 Minuten → 7:45:00.</p>' },
                { question: 'Kann ich negative Werte umrechnen?', answer: '<p>Ja, eine negative Dezimalzahl ergibt eine negative Dauer (z.B. -1,5 → -1:30:00).</p>' },
            ],
            inputs: [{ name: 'decimal_hours', label: DECIMAL_HOURS_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '7.5' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.de }],
        },
    },
}

// ============================================================
// 1109: Time to Decimal Calculator
// ============================================================
const timeToDecimalTool: ToolDef = {
    id: '1109',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'hours', default: 7 }, { key: 'minutes', default: 30 }, { key: 'seconds', default: 0 }],
        functions: { result: { type: 'function', functionName: 'timeToDecimal', params: { hours: 'hours', minutes: 'minutes', seconds: 'seconds' } } },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'time-to-decimal-calculator', title: 'Time to Decimal Calculator', h1: 'Time to Decimal Calculator',
            meta_title: 'Time to Decimal Calculator | Convert h:m:s to Decimal Hours',
            meta_description: 'Convert hours, minutes, and seconds into a single decimal hours value instantly.',
            short_answer: 'This calculator converts an h:m:s time into a single decimal hours number (e.g. 7:30:00 → 7.5).',
            intro_text: '<p>The reverse of Decimal to Time — useful for entering clock-format hours into a spreadsheet or payroll system that expects a single decimal number.</p>',
            key_points: [
                '<b>Formula:</b> Decimal Hours = Hours + Minutes ÷ 60 + Seconds ÷ 3600.',
                '<b>Example:</b> 7 hours 30 minutes = 7 + 30/60 = 7.5 decimal hours.',
                '<b>Tip:</b> for payroll, decimal hours make it easy to sum multiple shifts (7.5 + 8.25 = 15.75) without manual carrying.',
            ],
            howto: [
                { question: 'What is 8 hours 15 minutes as a decimal?', answer: '<p>8 + 15/60 = 8.25 decimal hours.</p>' },
                { question: 'How do I convert just minutes to decimal hours?', answer: '<p>Leave hours and seconds at 0, enter your minute value — e.g. 45 minutes = 0.75 decimal hours.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-vremya-v-decimal', title: 'Калькулятор времени в десятичные часы', h1: 'Калькулятор времени в десятичные часы',
            meta_title: 'Время в десятичные часы | Конвертер ч:м:с в десятичное число',
            meta_description: 'Конвертируйте часы, минуты и секунды в единое десятичное число часов мгновенно.',
            short_answer: 'Этот калькулятор конвертирует время ч:м:с в единое десятичное число часов (например, 7:30:00 → 7,5).',
            intro_text: '<p>Обратная операция к "Десятичные часы во время" — полезно для ввода часов в формате часов в таблицу или систему расчёта зарплаты.</p>',
            key_points: [
                '<b>Формула:</b> Десятичные часы = Часы + Минуты ÷ 60 + Секунды ÷ 3600.',
                '<b>Пример:</b> 7 часов 30 минут = 7 + 30/60 = 7,5 десятичных часа.',
                '<b>Совет:</b> для расчёта зарплаты десятичные часы легко суммировать.',
            ],
            howto: [
                { question: 'Сколько это 8 часов 15 минут в десятичном виде?', answer: '<p>8 + 15/60 = 8,25 десятичных часа.</p>' },
                { question: 'Как перевести только минуты в десятичные часы?', answer: '<p>Оставьте часы и секунды 0, введите значение минут — например, 45 минут = 0,75 десятичного часа.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'laika-uz-decimalskaitli-kalkulators', title: 'Laika uz Decimālskaitli Kalkulators', h1: 'Laika uz Decimālskaitli Kalkulators',
            meta_title: 'Laiks uz Decimālo | Konvertētājs no h:m:s uz Decimālām Stundām',
            meta_description: 'Konvertējiet stundas, minūtes un sekundes vienā decimālo stundu vērtībā acumirklī.',
            short_answer: 'Šis kalkulators konvertē h:m:s laiku vienā decimālo stundu skaitlī (piemēram, 7:30:00 → 7,5).',
            intro_text: '<p>Pretēja darbība "Decimālskaitlis uz laiku" — noderīga, ievadot pulksteņa formāta stundas izklājlapā vai algu sistēmā.</p>',
            key_points: [
                '<b>Formula:</b> Decimālās Stundas = Stundas + Minūtes ÷ 60 + Sekundes ÷ 3600.',
                '<b>Piemērs:</b> 7 stundas 30 minūtes = 7 + 30/60 = 7,5 decimālas stundas.',
                '<b>Padoms:</b> algu aprēķinam decimālās stundas ir viegli summēt.',
            ],
            howto: [
                { question: 'Cik ir 8 stundas 15 minūtes decimālā formā?', answer: '<p>8 + 15/60 = 8,25 decimālas stundas.</p>' },
                { question: 'Kā pārvērst tikai minūtes decimālās stundās?', answer: '<p>Atstājiet stundas un sekundes 0, ievadiet minūšu vērtību.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-czasu-na-dziesietny', title: 'Kalkulator Czasu na Dziesiętny', h1: 'Kalkulator Czasu na Dziesiętny',
            meta_title: 'Czas na Dziesiętny | Konwerter h:m:s na Godziny Dziesiętne',
            meta_description: 'Przelicz godziny, minuty i sekundy na jedną wartość dziesiętną godzin natychmiast.',
            short_answer: 'Ten kalkulator przelicza czas h:m:s na jedną liczbę dziesiętną godzin (np. 7:30:00 → 7,5).',
            intro_text: '<p>Odwrotność "Dziesiętny na czas" — przydatne przy wprowadzaniu godzin w formacie zegarowym do arkusza kalkulacyjnego.</p>',
            key_points: [
                '<b>Wzór:</b> Godziny Dziesiętne = Godziny + Minuty ÷ 60 + Sekundy ÷ 3600.',
                '<b>Przykład:</b> 7 godzin 30 minut = 7 + 30/60 = 7,5 godziny dziesiętnej.',
                '<b>Wskazówka:</b> przy płacach godziny dziesiętne łatwo sumować.',
            ],
            howto: [
                { question: 'Ile to 8 godzin 15 minut dziesiętnie?', answer: '<p>8 + 15/60 = 8,25 godziny dziesiętnej.</p>' },
                { question: 'Jak przeliczyć tylko minuty na godziny dziesiętne?', answer: '<p>Zostaw godziny i sekundy 0, wpisz wartość minut.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-tiempo-a-decimal', title: 'Calculadora de Tiempo a Decimal', h1: 'Calculadora de Tiempo a Decimal',
            meta_title: 'Tiempo a Decimal | Convertidor de h:m:s a Horas Decimales',
            meta_description: 'Convierte horas, minutos y segundos en un único valor de horas decimales al instante.',
            short_answer: 'Esta calculadora convierte un tiempo h:m:s en un único número de horas decimales (p. ej. 7:30:00 → 7,5).',
            intro_text: '<p>Lo contrario de Decimal a Tiempo — útil para introducir horas en formato reloj en una hoja de cálculo o sistema de nómina.</p>',
            key_points: [
                '<b>Fórmula:</b> Horas Decimales = Horas + Minutos ÷ 60 + Segundos ÷ 3600.',
                '<b>Ejemplo:</b> 7 horas 30 minutos = 7 + 30/60 = 7,5 horas decimales.',
                '<b>Consejo:</b> en nóminas, las horas decimales facilitan sumar varios turnos.',
            ],
            howto: [
                { question: '¿Cuánto es 8 horas 15 minutos en decimal?', answer: '<p>8 + 15/60 = 8,25 horas decimales.</p>' },
                { question: '¿Cómo convierto solo minutos a horas decimales?', answer: '<p>Deja horas y segundos en 0, introduce el valor de minutos.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-temps-en-decimal', title: 'Calculateur de Temps en Décimal', h1: 'Calculateur de Temps en Décimal',
            meta_title: 'Temps en Décimal | Convertisseur de h:m:s en Heures Décimales',
            meta_description: 'Convertissez heures, minutes et secondes en une seule valeur d’heures décimales instantanément.',
            short_answer: 'Ce calculateur convertit un temps h:m:s en un seul nombre d’heures décimales (ex. 7:30:00 → 7,5).',
            intro_text: '<p>L’inverse de Décimal en Temps — utile pour saisir des heures au format horloge dans un tableur ou un système de paie.</p>',
            key_points: [
                '<b>Formule :</b> Heures Décimales = Heures + Minutes ÷ 60 + Secondes ÷ 3600.',
                '<b>Exemple :</b> 7 heures 30 minutes = 7 + 30/60 = 7,5 heures décimales.',
                '<b>Astuce :</b> en paie, les heures décimales facilitent la somme de plusieurs quarts.',
            ],
            howto: [
                { question: 'Combien font 8 heures 15 minutes en décimal ?', answer: '<p>8 + 15/60 = 8,25 heures décimales.</p>' },
                { question: 'Comment convertir seulement des minutes en heures décimales ?', answer: '<p>Laissez heures et secondes à 0, entrez la valeur des minutes.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-da-tempo-a-decimale', title: 'Calcolatore da Tempo a Decimale', h1: 'Calcolatore da Tempo a Decimale',
            meta_title: 'Tempo in Decimale | Convertitore da h:m:s a Ore Decimali',
            meta_description: 'Converti ore, minuti e secondi in un unico valore di ore decimali istantaneamente.',
            short_answer: 'Questo calcolatore converte un tempo h:m:s in un unico numero di ore decimali (es. 7:30:00 → 7,5).',
            intro_text: '<p>Il contrario di Decimale in Tempo — utile per inserire ore in formato orologio in un foglio di calcolo o sistema paghe.</p>',
            key_points: [
                '<b>Formula:</b> Ore Decimali = Ore + Minuti ÷ 60 + Secondi ÷ 3600.',
                '<b>Esempio:</b> 7 ore 30 minuti = 7 + 30/60 = 7,5 ore decimali.',
                '<b>Consiglio:</b> nelle buste paga, le ore decimali facilitano la somma di più turni.',
            ],
            howto: [
                { question: 'Quanto sono 8 ore 15 minuti in decimale?', answer: '<p>8 + 15/60 = 8,25 ore decimali.</p>' },
                { question: 'Come converto solo i minuti in ore decimali?', answer: '<p>Lascia ore e secondi a 0, inserisci il valore dei minuti.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'zeit-in-dezimal-rechner', title: 'Zeit in Dezimal Rechner', h1: 'Zeit in Dezimal Rechner',
            meta_title: 'Zeit in Dezimal | Umrechner von h:m:s in Dezimalstunden',
            meta_description: 'Rechnen Sie Stunden, Minuten und Sekunden sofort in einen einzigen Dezimalstundenwert um.',
            short_answer: 'Dieser Rechner wandelt eine h:m:s-Zeit in eine einzige Dezimalstundenzahl um (z.B. 7:30:00 → 7,5).',
            intro_text: '<p>Die Umkehrung von Dezimal in Zeit — nützlich, um Uhrformat-Stunden in eine Tabelle oder ein Lohnabrechnungssystem einzugeben.</p>',
            key_points: [
                '<b>Formel:</b> Dezimalstunden = Stunden + Minuten ÷ 60 + Sekunden ÷ 3600.',
                '<b>Beispiel:</b> 7 Stunden 30 Minuten = 7 + 30/60 = 7,5 Dezimalstunden.',
                '<b>Tipp:</b> in der Lohnabrechnung erleichtern Dezimalstunden das Summieren mehrerer Schichten.',
            ],
            howto: [
                { question: 'Was sind 8 Stunden 15 Minuten als Dezimalzahl?', answer: '<p>8 + 15/60 = 8,25 Dezimalstunden.</p>' },
                { question: 'Wie rechne ich nur Minuten in Dezimalstunden um?', answer: '<p>Lassen Sie Stunden und Sekunden bei 0, geben Sie den Minutenwert ein.</p>' },
            ],
            inputs: [
                { name: 'hours', label: HOURS_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '7' },
                { name: 'minutes', label: MINUTES_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'seconds', label: SECONDS_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_HOURS_LABEL.de, precision: 4 }],
        },
    },
}

const HOUR_LABEL: Record<string, string> = { en: 'Hour', ru: 'Час', de: 'Stunde', es: 'Hora', fr: 'Heure', it: 'Ora', pl: 'Godzina', lv: 'Stunda' }
const MINUTE_LABEL: Record<string, string> = { en: 'Minute', ru: 'Минута', de: 'Minute', es: 'Minuto', fr: 'Minute', it: 'Minuto', pl: 'Minuta', lv: 'Minūte' }
const AMPM_LABEL: Record<string, string> = { en: 'AM/PM', ru: 'AM/PM', de: 'AM/PM', es: 'AM/PM', fr: 'AM/PM', it: 'AM/PM', pl: 'AM/PM', lv: 'AM/PM' }
const HOUR24_LABEL: Record<string, string> = { en: 'Hour (0-23)', ru: 'Час (0-23)', de: 'Stunde (0-23)', es: 'Hora (0-23)', fr: 'Heure (0-23)', it: 'Ora (0-23)', pl: 'Godzina (0-23)', lv: 'Stunda (0-23)' }
const OPERATION_LABEL: Record<string, string> = { en: 'Operation', ru: 'Операция', de: 'Operation', es: 'Operación', fr: 'Opération', it: 'Operazione', pl: 'Operacja', lv: 'Darbība' }
const VALUE2_LABEL: Record<string, string> = { en: 'Value', ru: 'Значение', de: 'Wert', es: 'Valor', fr: 'Valeur', it: 'Valore', pl: 'Wartość', lv: 'Vērtība' }
const START_TIME_LABEL: Record<string, string> = { en: 'Start Time', ru: 'Время начала', de: 'Startzeit', es: 'Hora de Inicio', fr: 'Heure de Début', it: 'Ora di Inizio', pl: 'Czas Rozpoczęcia', lv: 'Sākuma Laiks' }
const END_TIME_LABEL: Record<string, string> = { en: 'End Time', ru: 'Время окончания', de: 'Endzeit', es: 'Hora de Fin', fr: 'Heure de Fin', it: 'Ora di Fine', pl: 'Czas Zakończenia', lv: 'Beigu Laiks' }
const DURATION_RESULT_LABEL: Record<string, string> = { en: 'Duration', ru: 'Длительность', de: 'Dauer', es: 'Duración', fr: 'Durée', it: 'Durata', pl: 'Czas Trwania', lv: 'Ilgums' }
const DECIMAL_HOURS_RESULT_LABEL: Record<string, string> = { en: 'Decimal Hours', ru: 'Десятичные часы', de: 'Dezimalstunden', es: 'Horas Decimales', fr: 'Heures Décimales', it: 'Ore Decimali', pl: 'Godziny Dziesiętne', lv: 'Decimālās Stundas' }

function ampmOptions(lang: string) {
    const l: Record<string, [string, string]> = { en: ['AM', 'PM'], ru: ['AM (утро)', 'PM (день)'], de: ['AM (vormittags)', 'PM (nachmittags)'], es: ['AM (mañana)', 'PM (tarde)'], fr: ['AM (matin)', 'PM (après-midi)'], it: ['AM (mattina)', 'PM (pomeriggio)'], pl: ['AM (rano)', 'PM (popołudnie)'], lv: ['AM (rīts)', 'PM (pēcpusdiena)'] }
    const [am, pm] = l[lang] || l.en
    return [{ value: 'AM', label: am }, { value: 'PM', label: pm }]
}
function addSubtractOptions(lang: string) {
    const l: Record<string, [string, string]> = { en: ['Add', 'Subtract'], ru: ['Сложить', 'Вычесть'], de: ['Addieren', 'Subtrahieren'], es: ['Sumar', 'Restar'], fr: ['Additionner', 'Soustraire'], it: ['Aggiungi', 'Sottrai'], pl: ['Dodaj', 'Odejmij'], lv: ['Pieskaitīt', 'Atņemt'] }
    const [add, sub] = l[lang] || l.en
    return [{ value: 'add', label: add }, { value: 'subtract', label: sub }]
}
function fourOpOptions(lang: string) {
    const l: Record<string, [string, string, string, string]> = {
        en: ['Add', 'Subtract', 'Multiply', 'Divide'], ru: ['Сложить', 'Вычесть', 'Умножить', 'Разделить'],
        de: ['Addieren', 'Subtrahieren', 'Multiplizieren', 'Dividieren'], es: ['Sumar', 'Restar', 'Multiplicar', 'Dividir'],
        fr: ['Additionner', 'Soustraire', 'Multiplier', 'Diviser'], it: ['Aggiungi', 'Sottrai', 'Moltiplica', 'Dividi'],
        pl: ['Dodaj', 'Odejmij', 'Pomnóż', 'Podziel'], lv: ['Pieskaitīt', 'Atņemt', 'Reizināt', 'Dalīt'],
    }
    const [add, sub, mul, div] = l[lang] || l.en
    return [{ value: 'add', label: add }, { value: 'subtract', label: sub }, { value: 'multiply', label: mul }, { value: 'divide', label: div }]
}

// ============================================================
// 1110: Military Time Converter (12h -> 24h)
// ============================================================
const militaryTimeConverterTool: ToolDef = {
    id: '1110',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'hour', default: 2 }, { key: 'minute', default: 30 }, { key: 'ampm', default: 'PM' }],
        functions: { result: { type: 'function', functionName: 'to24HourTime', params: { hour: 'hour', minute: 'minute', ampm: 'ampm' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'military-time-converter', title: 'Military Time Converter', h1: 'Military Time Converter',
            meta_title: 'Military Time Converter | Convert 12-Hour to 24-Hour Time',
            meta_description: 'Convert standard 12-hour clock time (with AM/PM) into 24-hour military time instantly.',
            short_answer: 'This calculator converts a 12-hour clock time (e.g. 2:30 PM) into 24-hour military time (14:30).',
            intro_text: '<p>Military, aviation, medical, and international contexts commonly use 24-hour time to avoid AM/PM ambiguity — this tool converts your everyday clock time into that format.</p>',
            key_points: [
                '<b>Rule:</b> AM hours stay the same (12 AM becomes 00); PM hours add 12 (except 12 PM, which stays 12).',
                '<b>Example:</b> 2:30 PM → 14:30. 12:00 AM (midnight) → 00:00. 12:00 PM (noon) → 12:00.',
                '<b>Format:</b> military time is always written as 4 digits, HH:MM, with no AM/PM suffix.',
            ],
            howto: [
                { question: 'What is 9:15 AM in military time?', answer: '<p>AM hours under 12 stay the same, so 9:15 AM = 09:15.</p>' },
                { question: 'What is midnight in military time?', answer: '<p>12:00 AM (midnight) is 00:00 in 24-hour time.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.en, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.en, type: 'select', options: ampmOptions('en'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.en }],
        },
        ru: {
            slug: 'konverter-voennogo-vremeni', title: 'Конвертер военного времени', h1: 'Конвертер военного времени',
            meta_title: 'Конвертер военного времени | 12-часовой в 24-часовой формат',
            meta_description: 'Конвертируйте стандартное 12-часовое время (с AM/PM) в 24-часовое военное время мгновенно.',
            short_answer: 'Этот калькулятор конвертирует 12-часовое время (например, 2:30 PM) в 24-часовое военное время (14:30).',
            intro_text: '<p>Военный, авиационный, медицинский и международный контекст часто использует 24-часовой формат, чтобы избежать неоднозначности AM/PM.</p>',
            key_points: [
                '<b>Правило:</b> часы AM остаются такими же (12 AM становится 00); к часам PM добавляется 12 (кроме 12 PM, которое остаётся 12).',
                '<b>Пример:</b> 2:30 PM → 14:30. 12:00 AM (полночь) → 00:00. 12:00 PM (полдень) → 12:00.',
                '<b>Формат:</b> военное время всегда записывается как 4 цифры, ЧЧ:ММ, без суффикса AM/PM.',
            ],
            howto: [
                { question: 'Сколько это 9:15 AM в военном времени?', answer: '<p>Часы AM меньше 12 остаются такими же, поэтому 9:15 AM = 09:15.</p>' },
                { question: 'Что такое полночь в военном времени?', answer: '<p>12:00 AM (полночь) — это 00:00 в 24-часовом формате.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.ru, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.ru, type: 'select', options: ampmOptions('ru'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.ru }],
        },
        lv: {
            slug: 'karaspeka-laika-konvertetajs', title: 'Karaspēka Laika Konvertētājs', h1: 'Karaspēka Laika Konvertētājs',
            meta_title: 'Karaspēka Laika Konvertētājs | 12-Stundu uz 24-Stundu Formātu',
            meta_description: 'Konvertējiet standarta 12 stundu laiku (ar AM/PM) uz 24 stundu karaspēka laiku acumirklī.',
            short_answer: 'Šis kalkulators konvertē 12 stundu laiku (piemēram, 2:30 PM) uz 24 stundu karaspēka laiku (14:30).',
            intro_text: '<p>Militārajā, aviācijas, medicīnas un starptautiskajā kontekstā bieži izmanto 24 stundu formātu, lai izvairītos no AM/PM neskaidrības.</p>',
            key_points: [
                '<b>Noteikums:</b> AM stundas paliek nemainīgas (12 AM kļūst par 00); PM stundām pieskaita 12 (izņemot 12 PM, kas paliek 12).',
                '<b>Piemērs:</b> 2:30 PM → 14:30. 12:00 AM (pusnakts) → 00:00. 12:00 PM (pusdienlaiks) → 12:00.',
                '<b>Formāts:</b> karaspēka laiks vienmēr tiek rakstīts kā 4 cipari, HH:MM, bez AM/PM piedēkļa.',
            ],
            howto: [
                { question: 'Cik ir 9:15 AM karaspēka laikā?', answer: '<p>AM stundas zem 12 paliek nemainīgas, tāpēc 9:15 AM = 09:15.</p>' },
                { question: 'Kas ir pusnakts karaspēka laikā?', answer: '<p>12:00 AM (pusnakts) ir 00:00 24 stundu formātā.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.lv, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.lv, type: 'select', options: ampmOptions('lv'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-czasu-wojskowego', title: 'Konwerter Czasu Wojskowego', h1: 'Konwerter Czasu Wojskowego',
            meta_title: 'Konwerter Czasu Wojskowego | z 12-godzinnego na 24-godzinny',
            meta_description: 'Przelicz standardowy czas 12-godzinny (z AM/PM) na 24-godzinny czas wojskowy natychmiast.',
            short_answer: 'Ten kalkulator przelicza czas 12-godzinny (np. 2:30 PM) na 24-godzinny czas wojskowy (14:30).',
            intro_text: '<p>Kontekst wojskowy, lotniczy, medyczny i międzynarodowy często używa formatu 24-godzinnego, aby uniknąć niejednoznaczności AM/PM.</p>',
            key_points: [
                '<b>Zasada:</b> godziny AM pozostają takie same (12 AM staje się 00); do godzin PM dodaje się 12 (oprócz 12 PM, które pozostaje 12).',
                '<b>Przykład:</b> 2:30 PM → 14:30. 12:00 AM (północ) → 00:00. 12:00 PM (południe) → 12:00.',
                '<b>Format:</b> czas wojskowy zapisuje się zawsze jako 4 cyfry, GG:MM, bez sufiksu AM/PM.',
            ],
            howto: [
                { question: 'Ile to 9:15 AM w czasie wojskowym?', answer: '<p>Godziny AM poniżej 12 pozostają takie same, więc 9:15 AM = 09:15.</p>' },
                { question: 'Czym jest północ w czasie wojskowym?', answer: '<p>12:00 AM (północ) to 00:00 w formacie 24-godzinnym.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.pl, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.pl, type: 'select', options: ampmOptions('pl'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-hora-militar', title: 'Convertidor de Hora Militar', h1: 'Convertidor de Hora Militar',
            meta_title: 'Convertidor de Hora Militar | De 12 Horas a 24 Horas',
            meta_description: 'Convierte la hora estándar de 12 horas (con AM/PM) a hora militar de 24 horas al instante.',
            short_answer: 'Esta calculadora convierte una hora de 12 horas (p. ej. 2:30 PM) a hora militar de 24 horas (14:30).',
            intro_text: '<p>Los contextos militar, de aviación, médico e internacional suelen usar el formato de 24 horas para evitar la ambigüedad de AM/PM.</p>',
            key_points: [
                '<b>Regla:</b> las horas AM se mantienen igual (12 AM se convierte en 00); a las horas PM se les suma 12 (excepto 12 PM, que se mantiene en 12).',
                '<b>Ejemplo:</b> 2:30 PM → 14:30. 12:00 AM (medianoche) → 00:00. 12:00 PM (mediodía) → 12:00.',
                '<b>Formato:</b> la hora militar siempre se escribe como 4 dígitos, HH:MM, sin sufijo AM/PM.',
            ],
            howto: [
                { question: '¿Qué es 9:15 AM en hora militar?', answer: '<p>Las horas AM menores de 12 se mantienen igual, así que 9:15 AM = 09:15.</p>' },
                { question: '¿Qué es la medianoche en hora militar?', answer: '<p>12:00 AM (medianoche) es 00:00 en formato de 24 horas.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.es, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.es, type: 'select', options: ampmOptions('es'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-heure-militaire', title: 'Convertisseur d’Heure Militaire', h1: 'Convertisseur d’Heure Militaire',
            meta_title: 'Convertisseur d’Heure Militaire | de 12 h à 24 h',
            meta_description: 'Convertissez l’heure standard sur 12 heures (avec AM/PM) en heure militaire sur 24 heures instantanément.',
            short_answer: 'Ce calculateur convertit une heure sur 12 heures (ex. 2:30 PM) en heure militaire sur 24 heures (14:30).',
            intro_text: '<p>Les contextes militaire, aéronautique, médical et international utilisent souvent le format 24 heures pour éviter l’ambiguïté AM/PM.</p>',
            key_points: [
                '<b>Règle :</b> les heures AM restent identiques (12 AM devient 00) ; on ajoute 12 aux heures PM (sauf 12 PM, qui reste 12).',
                '<b>Exemple :</b> 2:30 PM → 14:30. 12:00 AM (minuit) → 00:00. 12:00 PM (midi) → 12:00.',
                '<b>Format :</b> l’heure militaire s’écrit toujours sur 4 chiffres, HH:MM, sans suffixe AM/PM.',
            ],
            howto: [
                { question: 'Que vaut 9:15 AM en heure militaire ?', answer: '<p>Les heures AM inférieures à 12 restent identiques, donc 9:15 AM = 09:15.</p>' },
                { question: 'Qu’est-ce que minuit en heure militaire ?', answer: '<p>12:00 AM (minuit) est 00:00 au format 24 heures.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.fr, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.fr, type: 'select', options: ampmOptions('fr'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-ora-militare', title: 'Convertitore Ora Militare', h1: 'Convertitore Ora Militare',
            meta_title: 'Convertitore Ora Militare | da 12 a 24 Ore',
            meta_description: 'Converti l’ora standard a 12 ore (con AM/PM) in ora militare a 24 ore istantaneamente.',
            short_answer: 'Questo calcolatore converte un’ora a 12 ore (es. 2:30 PM) in ora militare a 24 ore (14:30).',
            intro_text: '<p>I contesti militare, aeronautico, medico e internazionale usano spesso il formato a 24 ore per evitare l’ambiguità AM/PM.</p>',
            key_points: [
                '<b>Regola:</b> le ore AM restano invariate (12 AM diventa 00); alle ore PM si aggiunge 12 (tranne 12 PM, che resta 12).',
                '<b>Esempio:</b> 2:30 PM → 14:30. 12:00 AM (mezzanotte) → 00:00. 12:00 PM (mezzogiorno) → 12:00.',
                '<b>Formato:</b> l’ora militare si scrive sempre come 4 cifre, HH:MM, senza suffisso AM/PM.',
            ],
            howto: [
                { question: 'Quanto è 9:15 AM in ora militare?', answer: '<p>Le ore AM sotto 12 restano invariate, quindi 9:15 AM = 09:15.</p>' },
                { question: 'Cos’è la mezzanotte in ora militare?', answer: '<p>12:00 AM (mezzanotte) è 00:00 nel formato a 24 ore.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.it, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.it, type: 'select', options: ampmOptions('it'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.it }],
        },
        de: {
            slug: 'militaerzeit-umrechner', title: 'Militärzeit-Umrechner', h1: 'Militärzeit-Umrechner',
            meta_title: 'Militärzeit-Umrechner | von 12-Stunden auf 24-Stunden',
            meta_description: 'Rechnen Sie die Standard-12-Stunden-Zeit (mit AM/PM) sofort in die 24-Stunden-Militärzeit um.',
            short_answer: 'Dieser Rechner wandelt eine 12-Stunden-Zeit (z.B. 2:30 PM) in die 24-Stunden-Militärzeit (14:30) um.',
            intro_text: '<p>Militärische, Luftfahrt-, medizinische und internationale Kontexte verwenden oft das 24-Stunden-Format, um AM/PM-Mehrdeutigkeit zu vermeiden.</p>',
            key_points: [
                '<b>Regel:</b> AM-Stunden bleiben gleich (12 AM wird 00); zu PM-Stunden werden 12 addiert (außer 12 PM, das bei 12 bleibt).',
                '<b>Beispiel:</b> 2:30 PM → 14:30. 12:00 AM (Mitternacht) → 00:00. 12:00 PM (Mittag) → 12:00.',
                '<b>Format:</b> Militärzeit wird immer als 4 Ziffern geschrieben, HH:MM, ohne AM/PM-Suffix.',
            ],
            howto: [
                { question: 'Was ist 9:15 AM in Militärzeit?', answer: '<p>AM-Stunden unter 12 bleiben gleich, also 9:15 AM = 09:15.</p>' },
                { question: 'Was ist Mitternacht in Militärzeit?', answer: '<p>12:00 AM (Mitternacht) ist 00:00 im 24-Stunden-Format.</p>' },
            ],
            inputs: [
                { name: 'hour', label: HOUR_LABEL.de, type: 'number', min: 1, max: 12, placeholder: '2' },
                { name: 'minute', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'ampm', label: AMPM_LABEL.de, type: 'select', options: ampmOptions('de'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.de }],
        },
    },
}

// ============================================================
// 1111: Military Time Chart (24h -> 12h, reverse direction)
// ============================================================
const militaryTimeChartTool: ToolDef = {
    id: '1111',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'hour_24', default: 14 }, { key: 'minute', default: 30 }],
        functions: { result: { type: 'function', functionName: 'to12HourTime', params: { hour_24: 'hour_24', minute: 'minute' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'military-time-chart', title: 'Military Time Chart', h1: 'Military Time Chart',
            meta_title: 'Military Time Chart | Convert 24-Hour to 12-Hour Time',
            meta_description: 'Convert 24-hour military time into standard 12-hour AM/PM time instantly.',
            short_answer: 'This calculator converts 24-hour military time (e.g. 14:30) back into standard 12-hour clock time (2:30 PM).',
            intro_text: '<p>The reverse of the Military Time Converter — enter a 24-hour time and instantly see its everyday 12-hour AM/PM equivalent, handy as a quick reference chart.</p>',
            key_points: [
                '<b>Rule:</b> hours 00-11 are AM (00 becomes 12 AM); hours 12-23 are PM (subtract 12 from 13-23, 12 itself stays 12 PM).',
                '<b>Example:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Reference:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'What is 20:45 in 12-hour time?', answer: '<p>20 - 12 = 8, so 20:45 = 8:45 PM.</p>' },
                { question: 'What is 00:00 in 12-hour time?', answer: '<p>00:00 (midnight) is 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.en, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.en }],
        },
        ru: {
            slug: 'tablica-voennogo-vremeni', title: 'Таблица военного времени', h1: 'Таблица военного времени',
            meta_title: 'Таблица военного времени | 24-часовой в 12-часовой формат',
            meta_description: 'Конвертируйте 24-часовое военное время в стандартное 12-часовое время AM/PM мгновенно.',
            short_answer: 'Этот калькулятор конвертирует 24-часовое военное время (например, 14:30) обратно в стандартное 12-часовое время (2:30 PM).',
            intro_text: '<p>Обратная операция к конвертеру военного времени — введите 24-часовое время и мгновенно увидите его эквивалент AM/PM.</p>',
            key_points: [
                '<b>Правило:</b> часы 00-11 — это AM (00 становится 12 AM); часы 12-23 — это PM (вычтите 12 из 13-23, а 12 остаётся 12 PM).',
                '<b>Пример:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Справка:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'Сколько это 20:45 в 12-часовом формате?', answer: '<p>20 - 12 = 8, значит 20:45 = 8:45 PM.</p>' },
                { question: 'Что такое 00:00 в 12-часовом формате?', answer: '<p>00:00 (полночь) — это 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.ru, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.ru }],
        },
        lv: {
            slug: 'karaspeka-laika-tabula', title: 'Karaspēka Laika Tabula', h1: 'Karaspēka Laika Tabula',
            meta_title: 'Karaspēka Laika Tabula | 24-Stundu uz 12-Stundu Formātu',
            meta_description: 'Konvertējiet 24 stundu karaspēka laiku uz standarta 12 stundu AM/PM laiku acumirklī.',
            short_answer: 'Šis kalkulators konvertē 24 stundu karaspēka laiku (piemēram, 14:30) atpakaļ uz standarta 12 stundu laiku (2:30 PM).',
            intro_text: '<p>Pretēja darbība karaspēka laika konvertētājam — ievadiet 24 stundu laiku un uzreiz redzēsiet tā AM/PM ekvivalentu.</p>',
            key_points: [
                '<b>Noteikums:</b> stundas 00-11 ir AM (00 kļūst par 12 AM); stundas 12-23 ir PM (atņemiet 12 no 13-23, bet 12 paliek 12 PM).',
                '<b>Piemērs:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Uzziņa:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'Cik ir 20:45 12 stundu formātā?', answer: '<p>20 - 12 = 8, tātad 20:45 = 8:45 PM.</p>' },
                { question: 'Kas ir 00:00 12 stundu formātā?', answer: '<p>00:00 (pusnakts) ir 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.lv, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.lv }],
        },
        pl: {
            slug: 'tabela-czasu-wojskowego', title: 'Tabela Czasu Wojskowego', h1: 'Tabela Czasu Wojskowego',
            meta_title: 'Tabela Czasu Wojskowego | z 24-godzinnego na 12-godzinny',
            meta_description: 'Przelicz 24-godzinny czas wojskowy na standardowy 12-godzinny czas AM/PM natychmiast.',
            short_answer: 'Ten kalkulator przelicza 24-godzinny czas wojskowy (np. 14:30) z powrotem na standardowy czas 12-godzinny (2:30 PM).',
            intro_text: '<p>Odwrotność konwertera czasu wojskowego — wpisz czas 24-godzinny i natychmiast zobacz jego odpowiednik AM/PM.</p>',
            key_points: [
                '<b>Zasada:</b> godziny 00-11 to AM (00 staje się 12 AM); godziny 12-23 to PM (odejmij 12 od 13-23, a 12 pozostaje 12 PM).',
                '<b>Przykład:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Odniesienie:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'Ile to 20:45 w formacie 12-godzinnym?', answer: '<p>20 - 12 = 8, więc 20:45 = 8:45 PM.</p>' },
                { question: 'Czym jest 00:00 w formacie 12-godzinnym?', answer: '<p>00:00 (północ) to 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.pl, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.pl }],
        },
        es: {
            slug: 'tabla-de-hora-militar', title: 'Tabla de Hora Militar', h1: 'Tabla de Hora Militar',
            meta_title: 'Tabla de Hora Militar | de 24 Horas a 12 Horas',
            meta_description: 'Convierte la hora militar de 24 horas a la hora estándar de 12 horas AM/PM al instante.',
            short_answer: 'Esta calculadora convierte la hora militar de 24 horas (p. ej. 14:30) de nuevo a hora estándar de 12 horas (2:30 PM).',
            intro_text: '<p>Lo contrario del Convertidor de Hora Militar — introduce una hora de 24 horas y ve al instante su equivalente AM/PM.</p>',
            key_points: [
                '<b>Regla:</b> las horas 00-11 son AM (00 se convierte en 12 AM); las horas 12-23 son PM (resta 12 de 13-23, y 12 se mantiene en 12 PM).',
                '<b>Ejemplo:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Referencia:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: '¿Qué es 20:45 en formato de 12 horas?', answer: '<p>20 - 12 = 8, así que 20:45 = 8:45 PM.</p>' },
                { question: '¿Qué es 00:00 en formato de 12 horas?', answer: '<p>00:00 (medianoche) es 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.es, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.es }],
        },
        fr: {
            slug: 'tableau-heure-militaire', title: 'Tableau d’Heure Militaire', h1: 'Tableau d’Heure Militaire',
            meta_title: 'Tableau d’Heure Militaire | de 24 h à 12 h',
            meta_description: 'Convertissez l’heure militaire sur 24 heures en heure standard sur 12 heures AM/PM instantanément.',
            short_answer: 'Ce calculateur convertit l’heure militaire sur 24 heures (ex. 14:30) en heure standard sur 12 heures (2:30 PM).',
            intro_text: '<p>L’inverse du Convertisseur d’Heure Militaire — entrez une heure sur 24 heures et voyez instantanément son équivalent AM/PM.</p>',
            key_points: [
                '<b>Règle :</b> les heures 00-11 sont AM (00 devient 12 AM) ; les heures 12-23 sont PM (soustrayez 12 de 13-23, 12 restant 12 PM).',
                '<b>Exemple :</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Référence :</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'Que vaut 20:45 au format 12 heures ?', answer: '<p>20 - 12 = 8, donc 20:45 = 8:45 PM.</p>' },
                { question: 'Qu’est-ce que 00:00 au format 12 heures ?', answer: '<p>00:00 (minuit) est 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.fr, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.fr }],
        },
        it: {
            slug: 'tabella-ora-militare', title: 'Tabella Ora Militare', h1: 'Tabella Ora Militare',
            meta_title: 'Tabella Ora Militare | da 24 a 12 Ore',
            meta_description: 'Converti l’ora militare a 24 ore in ora standard a 12 ore AM/PM istantaneamente.',
            short_answer: 'Questo calcolatore converte l’ora militare a 24 ore (es. 14:30) in ora standard a 12 ore (2:30 PM).',
            intro_text: '<p>Il contrario del Convertitore Ora Militare — inserisci un’ora a 24 ore e vedi subito il suo equivalente AM/PM.</p>',
            key_points: [
                '<b>Regola:</b> le ore 00-11 sono AM (00 diventa 12 AM); le ore 12-23 sono PM (sottrai 12 da 13-23, 12 resta 12 PM).',
                '<b>Esempio:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Riferimento:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'Quanto è 20:45 in formato 12 ore?', answer: '<p>20 - 12 = 8, quindi 20:45 = 8:45 PM.</p>' },
                { question: 'Cos’è 00:00 in formato 12 ore?', answer: '<p>00:00 (mezzanotte) è 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.it, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.it }],
        },
        de: {
            slug: 'militaerzeit-tabelle', title: 'Militärzeit-Tabelle', h1: 'Militärzeit-Tabelle',
            meta_title: 'Militärzeit-Tabelle | von 24-Stunden auf 12-Stunden',
            meta_description: 'Rechnen Sie 24-Stunden-Militärzeit sofort in Standard-12-Stunden-Zeit AM/PM um.',
            short_answer: 'Dieser Rechner wandelt 24-Stunden-Militärzeit (z.B. 14:30) zurück in Standard-12-Stunden-Zeit (2:30 PM) um.',
            intro_text: '<p>Die Umkehrung des Militärzeit-Umrechners — geben Sie eine 24-Stunden-Zeit ein und sehen Sie sofort das AM/PM-Äquivalent.</p>',
            key_points: [
                '<b>Regel:</b> Stunden 00-11 sind AM (00 wird 12 AM); Stunden 12-23 sind PM (ziehen Sie 12 von 13-23 ab, 12 bleibt 12 PM).',
                '<b>Beispiel:</b> 14:30 → 2:30 PM. 00:00 → 12:00 AM. 12:00 → 12:00 PM.',
                '<b>Referenz:</b> 13:00=1 PM, 15:00=3 PM, 18:00=6 PM, 21:00=9 PM, 23:00=11 PM.',
            ],
            howto: [
                { question: 'Was ist 20:45 im 12-Stunden-Format?', answer: '<p>20 - 12 = 8, also 20:45 = 8:45 PM.</p>' },
                { question: 'Was ist 00:00 im 12-Stunden-Format?', answer: '<p>00:00 (Mitternacht) ist 12:00 AM.</p>' },
            ],
            inputs: [
                { name: 'hour_24', label: HOUR24_LABEL.de, type: 'number', min: 0, max: 23, placeholder: '14' },
                { name: 'minute', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.de }],
        },
    },
}

// ============================================================
// 1112: Time Calculator hh:mm:ss (add/subtract two full h:m:s durations)
// ============================================================
const timeCalcHmsTool: ToolDef = {
    id: '1112',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'h1', default: 2 }, { key: 'm1', default: 15 }, { key: 's1', default: 30 },
            { key: 'operation', default: 'add' },
            { key: 'h2', default: 1 }, { key: 'm2', default: 45 }, { key: 's2', default: 20 },
        ],
        functions: { result: { type: 'function', functionName: 'hmsAddSubtract', params: { h1: 'h1', m1: 'm1', s1: 's1', operation: 'operation', h2: 'h2', m2: 'm2', s2: 's2' } } },
        outputs: [{ key: 'result' }, { key: 'decimal_hours', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'time-calculator-hhmmss', title: 'Time Calculator hh:mm:ss', h1: 'Time Calculator hh:mm:ss',
            meta_title: 'Time Calculator hh:mm:ss | Add or Subtract Two Durations',
            meta_description: 'Add or subtract two hours:minutes:seconds durations and get the result instantly.',
            short_answer: 'This calculator adds or subtracts two h:m:s durations, e.g. 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Enter two durations in hours, minutes, and seconds and choose add or subtract — useful for combining video/audio clip lengths, task durations, or race splits.</p>',
            key_points: [
                '<b>Method:</b> both durations are converted to total seconds, added or subtracted, then reformatted back to h:m:s.',
                '<b>Example:</b> 2:15:30 + 1:45:20 = 4:00:50 (135930s + 6320s... converted correctly via seconds).',
                '<b>Negative results:</b> if subtracting produces a negative duration, the result is shown with a minus sign.',
            ],
            howto: [
                { question: 'How do I add three durations?', answer: '<p>Add the first two here, then use the result as one of the inputs in a second calculation.</p>' },
                { question: 'What if seconds overflow past 59?', answer: '<p>The calculator automatically carries seconds into minutes and minutes into hours in the final result.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.en, type: 'select', options: addSubtractOptions('en'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.en }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-vremeni-chchmmss', title: 'Калькулятор времени чч:мм:сс', h1: 'Калькулятор времени чч:мм:сс',
            meta_title: 'Калькулятор времени чч:мм:сс | Сложение и вычитание длительностей',
            meta_description: 'Складывайте или вычитайте две длительности часы:минуты:секунды и получайте результат мгновенно.',
            short_answer: 'Этот калькулятор складывает или вычитает две длительности ч:м:с, например 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Введите две длительности в часах, минутах и секундах и выберите сложение или вычитание.</p>',
            key_points: [
                '<b>Метод:</b> обе длительности переводятся в секунды, складываются или вычитаются, затем форматируются обратно в ч:м:с.',
                '<b>Пример:</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Отрицательные результаты:</b> если вычитание даёт отрицательную длительность, результат показывается со знаком минус.',
            ],
            howto: [
                { question: 'Как сложить три длительности?', answer: '<p>Сложите первые две здесь, затем используйте результат как один из входов во втором расчёте.</p>' },
                { question: 'Что если секунды превышают 59?', answer: '<p>Калькулятор автоматически переносит секунды в минуты, а минуты в часы.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.ru, type: 'select', options: addSubtractOptions('ru'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.ru }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'laika-kalkulators-hhmmss', title: 'Laika Kalkulators hh:mm:ss', h1: 'Laika Kalkulators hh:mm:ss',
            meta_title: 'Laika Kalkulators hh:mm:ss | Ilgumu Saskaitīšana un Atņemšana',
            meta_description: 'Saskaitiet vai atņemiet divus stundu:minūšu:sekunžu ilgumus un iegūstiet rezultātu acumirklī.',
            short_answer: 'Šis kalkulators saskaita vai atņem divus h:m:s ilgumus, piemēram, 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Ievadiet divus ilgumus stundās, minūtēs un sekundēs un izvēlieties saskaitīšanu vai atņemšanu.</p>',
            key_points: [
                '<b>Metode:</b> abi ilgumi tiek pārvērsti sekundēs, saskaitīti vai atņemti, tad pārformatēti atpakaļ uz h:m:s.',
                '<b>Piemērs:</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Negatīvi rezultāti:</b> ja atņemšana dod negatīvu ilgumu, rezultāts tiek parādīts ar mīnusa zīmi.',
            ],
            howto: [
                { question: 'Kā saskaitīt trīs ilgumus?', answer: '<p>Saskaitiet pirmos divus šeit, tad izmantojiet rezultātu kā vienu no ievadēm otrajā aprēķinā.</p>' },
                { question: 'Kas notiek, ja sekundes pārsniedz 59?', answer: '<p>Kalkulators automātiski pārnes sekundes uz minūtēm un minūtes uz stundām.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.lv, type: 'select', options: addSubtractOptions('lv'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.lv }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-czasu-gg-mm-ss', title: 'Kalkulator Czasu gg:mm:ss', h1: 'Kalkulator Czasu gg:mm:ss',
            meta_title: 'Kalkulator Czasu gg:mm:ss | Dodawanie i Odejmowanie Czasów Trwania',
            meta_description: 'Dodaj lub odejmij dwa czasy trwania godziny:minuty:sekundy i uzyskaj wynik natychmiast.',
            short_answer: 'Ten kalkulator dodaje lub odejmuje dwa czasy trwania g:m:s, np. 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Wprowadź dwa czasy trwania w godzinach, minutach i sekundach i wybierz dodawanie lub odejmowanie.</p>',
            key_points: [
                '<b>Metoda:</b> oba czasy trwania są przeliczane na sekundy, dodawane lub odejmowane, a następnie formatowane z powrotem na g:m:s.',
                '<b>Przykład:</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Wyniki ujemne:</b> jeśli odejmowanie daje ujemny czas trwania, wynik jest pokazany ze znakiem minus.',
            ],
            howto: [
                { question: 'Jak dodać trzy czasy trwania?', answer: '<p>Dodaj pierwsze dwa tutaj, a wynik użyj jako jednego z wejść w drugim obliczeniu.</p>' },
                { question: 'Co jeśli sekundy przekroczą 59?', answer: '<p>Kalkulator automatycznie przenosi sekundy na minuty, a minuty na godziny.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.pl, type: 'select', options: addSubtractOptions('pl'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.pl }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-tiempo-hhmmss', title: 'Calculadora de Tiempo hh:mm:ss', h1: 'Calculadora de Tiempo hh:mm:ss',
            meta_title: 'Calculadora de Tiempo hh:mm:ss | Sumar o Restar Duraciones',
            meta_description: 'Suma o resta dos duraciones de horas:minutos:segundos y obtén el resultado al instante.',
            short_answer: 'Esta calculadora suma o resta dos duraciones h:m:s, p. ej. 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Introduce dos duraciones en horas, minutos y segundos y elige sumar o restar.</p>',
            key_points: [
                '<b>Método:</b> ambas duraciones se convierten a segundos totales, se suman o restan, y se reformatean de vuelta a h:m:s.',
                '<b>Ejemplo:</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Resultados negativos:</b> si la resta produce una duración negativa, el resultado se muestra con signo menos.',
            ],
            howto: [
                { question: '¿Cómo sumo tres duraciones?', answer: '<p>Suma las dos primeras aquí, luego usa el resultado como una de las entradas en un segundo cálculo.</p>' },
                { question: '¿Qué pasa si los segundos superan 59?', answer: '<p>La calculadora traslada automáticamente los segundos a minutos y los minutos a horas.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.es, type: 'select', options: addSubtractOptions('es'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.es }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-temps-hhmmss', title: 'Calculateur de Temps hh:mm:ss', h1: 'Calculateur de Temps hh:mm:ss',
            meta_title: 'Calculateur de Temps hh:mm:ss | Additionner ou Soustraire des Durées',
            meta_description: 'Additionnez ou soustrayez deux durées heures:minutes:secondes et obtenez le résultat instantanément.',
            short_answer: 'Ce calculateur additionne ou soustrait deux durées h:m:s, ex. 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Entrez deux durées en heures, minutes et secondes et choisissez additionner ou soustraire.</p>',
            key_points: [
                '<b>Méthode :</b> les deux durées sont converties en secondes totales, additionnées ou soustraites, puis reformatées en h:m:s.',
                '<b>Exemple :</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Résultats négatifs :</b> si la soustraction produit une durée négative, le résultat est affiché avec un signe moins.',
            ],
            howto: [
                { question: 'Comment additionner trois durées ?', answer: '<p>Additionnez les deux premières ici, puis utilisez le résultat comme une des entrées dans un second calcul.</p>' },
                { question: 'Que se passe-t-il si les secondes dépassent 59 ?', answer: '<p>Le calculateur reporte automatiquement les secondes en minutes et les minutes en heures.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.fr, type: 'select', options: addSubtractOptions('fr'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.fr }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-tempo-hhmmss', title: 'Calcolatore di Tempo hh:mm:ss', h1: 'Calcolatore di Tempo hh:mm:ss',
            meta_title: 'Calcolatore di Tempo hh:mm:ss | Somma o Sottrai Durate',
            meta_description: 'Somma o sottrai due durate ore:minuti:secondi e ottieni il risultato istantaneamente.',
            short_answer: 'Questo calcolatore somma o sottrae due durate h:m:s, es. 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Inserisci due durate in ore, minuti e secondi e scegli somma o sottrazione.</p>',
            key_points: [
                '<b>Metodo:</b> entrambe le durate vengono convertite in secondi totali, sommate o sottratte, poi riformattate in h:m:s.',
                '<b>Esempio:</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Risultati negativi:</b> se la sottrazione produce una durata negativa, il risultato è mostrato con il segno meno.',
            ],
            howto: [
                { question: 'Come sommo tre durate?', answer: '<p>Somma le prime due qui, poi usa il risultato come uno degli input in un secondo calcolo.</p>' },
                { question: 'Cosa succede se i secondi superano 59?', answer: '<p>Il calcolatore riporta automaticamente i secondi in minuti e i minuti in ore.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.it, type: 'select', options: addSubtractOptions('it'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.it }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'zeitrechner-hhmmss', title: 'Zeitrechner hh:mm:ss', h1: 'Zeitrechner hh:mm:ss',
            meta_title: 'Zeitrechner hh:mm:ss | Zwei Dauern Addieren oder Subtrahieren',
            meta_description: 'Addieren oder subtrahieren Sie zwei Stunden:Minuten:Sekunden-Dauern und erhalten Sie das Ergebnis sofort.',
            short_answer: 'Dieser Rechner addiert oder subtrahiert zwei h:m:s-Dauern, z.B. 2:15:30 + 1:45:20 = 4:00:50.',
            intro_text: '<p>Geben Sie zwei Dauern in Stunden, Minuten und Sekunden ein und wählen Sie Addieren oder Subtrahieren.</p>',
            key_points: [
                '<b>Methode:</b> beide Dauern werden in Gesamtsekunden umgerechnet, addiert oder subtrahiert, dann zurück in h:m:s formatiert.',
                '<b>Beispiel:</b> 2:15:30 + 1:45:20 = 4:00:50.',
                '<b>Negative Ergebnisse:</b> ergibt die Subtraktion eine negative Dauer, wird das Ergebnis mit Minuszeichen angezeigt.',
            ],
            howto: [
                { question: 'Wie addiere ich drei Dauern?', answer: '<p>Addieren Sie hier die ersten beiden, verwenden Sie das Ergebnis dann als eine der Eingaben in einer zweiten Berechnung.</p>' },
                { question: 'Was, wenn die Sekunden 59 überschreiten?', answer: '<p>Der Rechner überträgt Sekunden automatisch in Minuten und Minuten in Stunden.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '2' },
                { name: 'm1', label: MINUTES_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '15' },
                { name: 's1', label: SECONDS_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'operation', label: OPERATION_LABEL.de, type: 'select', options: addSubtractOptions('de'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 's2', label: SECONDS_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '20' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.de }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.de, precision: 4 }],
        },
    },
}

// ============================================================
// 1113: Hours Calculator (duration between two clock times, 12h format)
// ============================================================
const hoursCalculatorTool: ToolDef = {
    id: '1113',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'start_hour', default: 9 }, { key: 'start_minute', default: 0 }, { key: 'start_ampm', default: 'AM' },
            { key: 'end_hour', default: 5 }, { key: 'end_minute', default: 30 }, { key: 'end_ampm', default: 'PM' },
        ],
        functions: { result: { type: 'function', functionName: 'hoursBetweenClockTimes', params: { start_hour: 'start_hour', start_minute: 'start_minute', start_ampm: 'start_ampm', end_hour: 'end_hour', end_minute: 'end_minute', end_ampm: 'end_ampm' } } },
        outputs: [{ key: 'result' }, { key: 'decimal_hours', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'hours-calculator', title: 'Hours Calculator', h1: 'Hours Calculator',
            meta_title: 'Hours Calculator | Duration Between Two Clock Times',
            meta_description: 'Calculate the number of hours and minutes between a start and end clock time instantly.',
            short_answer: 'This calculator finds the duration between two clock times, e.g. 9:00 AM to 5:30 PM = 8h 30m.',
            intro_text: '<p>Enter a start time and an end time (12-hour format) to find exactly how many hours and minutes lie between them — handy for shift lengths, appointment durations, or event spans.</p>',
            key_points: [
                '<b>Method:</b> both times are converted to minutes since midnight, and the difference is taken.',
                '<b>Overnight spans:</b> if the end time is earlier than the start time, the calculator assumes it falls on the next day (e.g. 10 PM to 6 AM = 8h).',
                '<b>Example:</b> 9:00 AM to 5:30 PM = 8 hours 30 minutes (8.5 decimal hours).',
            ],
            howto: [
                { question: 'How do I calculate an overnight shift?', answer: '<p>Just enter the start (e.g. 10:00 PM) and end (e.g. 6:00 AM) — the calculator automatically wraps to the next day.</p>' },
                { question: 'Does this account for unpaid breaks?', answer: '<p>No — this is a raw time difference. Subtract break time separately, or use the Work Hours Calculator, which has a dedicated break field.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.en, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.en, type: 'select', options: ampmOptions('en'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.en, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.en, type: 'select', options: ampmOptions('en'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.en }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-chasov', title: 'Калькулятор часов', h1: 'Калькулятор часов',
            meta_title: 'Калькулятор часов | Длительность между двумя временами',
            meta_description: 'Рассчитайте количество часов и минут между временем начала и окончания мгновенно.',
            short_answer: 'Этот калькулятор находит длительность между двумя моментами времени, например 9:00 AM до 5:30 PM = 8ч 30м.',
            intro_text: '<p>Введите время начала и окончания (12-часовой формат), чтобы узнать точное количество часов и минут между ними.</p>',
            key_points: [
                '<b>Метод:</b> оба времени переводятся в минуты от полуночи, и берётся разница.',
                '<b>Ночные интервалы:</b> если время окончания раньше времени начала, калькулятор предполагает, что оно приходится на следующий день.',
                '<b>Пример:</b> 9:00 AM до 5:30 PM = 8 часов 30 минут (8,5 десятичных часа).',
            ],
            howto: [
                { question: 'Как рассчитать ночную смену?', answer: '<p>Просто введите начало (например, 22:00) и конец (например, 6:00) — калькулятор автоматически переходит на следующий день.</p>' },
                { question: 'Учитывает ли это неоплачиваемые перерывы?', answer: '<p>Нет — это просто разница во времени. Вычтите время перерыва отдельно или используйте калькулятор рабочих часов.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.ru, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.ru, type: 'select', options: ampmOptions('ru'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.ru, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.ru, type: 'select', options: ampmOptions('ru'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.ru }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'stundu-kalkulators', title: 'Stundu Kalkulators', h1: 'Stundu Kalkulators',
            meta_title: 'Stundu Kalkulators | Ilgums Starp Diviem Pulksteņa Laikiem',
            meta_description: 'Aprēķiniet stundu un minūšu skaitu starp sākuma un beigu laiku acumirklī.',
            short_answer: 'Šis kalkulators atrod ilgumu starp diviem pulksteņa laikiem, piemēram, 9:00 AM līdz 5:30 PM = 8h 30m.',
            intro_text: '<p>Ievadiet sākuma un beigu laiku (12 stundu formātā), lai uzzinātu precīzu stundu un minūšu skaitu starp tiem.</p>',
            key_points: [
                '<b>Metode:</b> abi laiki tiek pārvērsti minūtēs no pusnakts, un tiek aprēķināta starpība.',
                '<b>Nakts intervāli:</b> ja beigu laiks ir agrāks par sākuma laiku, kalkulators pieņem, ka tas iekrīt nākamajā dienā.',
                '<b>Piemērs:</b> 9:00 AM līdz 5:30 PM = 8 stundas 30 minūtes (8,5 decimālās stundas).',
            ],
            howto: [
                { question: 'Kā aprēķināt nakts maiņu?', answer: '<p>Vienkārši ievadiet sākumu (piem., 22:00) un beigas (piem., 6:00) — kalkulators automātiski pāriet uz nākamo dienu.</p>' },
                { question: 'Vai tas ņem vērā neapmaksātus pārtraukumus?', answer: '<p>Nē — šī ir vienkārša laika starpība. Atņemiet pārtraukuma laiku atsevišķi vai izmantojiet Darba Stundu Kalkulatoru.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.lv, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.lv, type: 'select', options: ampmOptions('lv'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.lv, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.lv, type: 'select', options: ampmOptions('lv'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.lv }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-godzin', title: 'Kalkulator Godzin', h1: 'Kalkulator Godzin',
            meta_title: 'Kalkulator Godzin | Czas Trwania Między Dwoma Godzinami',
            meta_description: 'Oblicz liczbę godzin i minut między godziną rozpoczęcia a zakończenia natychmiast.',
            short_answer: 'Ten kalkulator znajduje czas trwania między dwiema godzinami, np. 9:00 AM do 5:30 PM = 8g 30m.',
            intro_text: '<p>Wprowadź godzinę rozpoczęcia i zakończenia (format 12-godzinny), aby dowiedzieć się, ile dokładnie godzin i minut je dzieli.</p>',
            key_points: [
                '<b>Metoda:</b> obie godziny są przeliczane na minuty od północy, a następnie obliczana jest różnica.',
                '<b>Nocne przedziały:</b> jeśli godzina zakończenia jest wcześniejsza niż rozpoczęcia, kalkulator zakłada, że przypada na następny dzień.',
                '<b>Przykład:</b> 9:00 AM do 5:30 PM = 8 godzin 30 minut (8,5 godziny dziesiętnej).',
            ],
            howto: [
                { question: 'Jak obliczyć zmianę nocną?', answer: '<p>Wpisz początek (np. 22:00) i koniec (np. 6:00) — kalkulator automatycznie przechodzi na następny dzień.</p>' },
                { question: 'Czy to uwzględnia nieodpłatne przerwy?', answer: '<p>Nie — to surowa różnica czasu. Odejmij czas przerwy osobno lub użyj Kalkulatora Godzin Pracy.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.pl, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.pl, type: 'select', options: ampmOptions('pl'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.pl, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.pl, type: 'select', options: ampmOptions('pl'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.pl }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-horas', title: 'Calculadora de Horas', h1: 'Calculadora de Horas',
            meta_title: 'Calculadora de Horas | Duración Entre Dos Horas',
            meta_description: 'Calcula el número de horas y minutos entre una hora de inicio y fin al instante.',
            short_answer: 'Esta calculadora encuentra la duración entre dos horas, p. ej. 9:00 AM a 5:30 PM = 8h 30m.',
            intro_text: '<p>Introduce una hora de inicio y una de fin (formato 12 horas) para saber exactamente cuántas horas y minutos hay entre ellas.</p>',
            key_points: [
                '<b>Método:</b> ambas horas se convierten en minutos desde la medianoche, y se calcula la diferencia.',
                '<b>Intervalos nocturnos:</b> si la hora de fin es anterior a la de inicio, la calculadora asume que cae al día siguiente.',
                '<b>Ejemplo:</b> 9:00 AM a 5:30 PM = 8 horas 30 minutos (8,5 horas decimales).',
            ],
            howto: [
                { question: '¿Cómo calculo un turno nocturno?', answer: '<p>Simplemente introduce el inicio (p. ej. 22:00) y el fin (p. ej. 6:00) — la calculadora pasa automáticamente al día siguiente.</p>' },
                { question: '¿Esto tiene en cuenta los descansos no remunerados?', answer: '<p>No — es una diferencia de tiempo bruta. Resta el tiempo de descanso por separado, o usa la Calculadora de Horas de Trabajo.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.es, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.es, type: 'select', options: ampmOptions('es'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.es, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.es, type: 'select', options: ampmOptions('es'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.es }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-dheures', title: 'Calculateur d’Heures', h1: 'Calculateur d’Heures',
            meta_title: 'Calculateur d’Heures | Durée Entre Deux Heures',
            meta_description: 'Calculez le nombre d’heures et de minutes entre une heure de début et de fin instantanément.',
            short_answer: 'Ce calculateur trouve la durée entre deux heures, ex. 9:00 AM à 5:30 PM = 8h 30m.',
            intro_text: '<p>Entrez une heure de début et de fin (format 12 heures) pour savoir exactement combien d’heures et de minutes les séparent.</p>',
            key_points: [
                '<b>Méthode :</b> les deux heures sont converties en minutes depuis minuit, et la différence est calculée.',
                '<b>Plages nocturnes :</b> si l’heure de fin est antérieure à celle de début, le calculateur suppose qu’elle tombe le lendemain.',
                '<b>Exemple :</b> 9:00 AM à 5:30 PM = 8 heures 30 minutes (8,5 heures décimales).',
            ],
            howto: [
                { question: 'Comment calculer un quart de nuit ?', answer: '<p>Entrez simplement le début (ex. 22:00) et la fin (ex. 6:00) — le calculateur passe automatiquement au lendemain.</p>' },
                { question: 'Cela tient-il compte des pauses non rémunérées ?', answer: '<p>Non — c’est une différence de temps brute. Soustrayez le temps de pause séparément, ou utilisez le Calculateur d’Heures de Travail.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.fr, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.fr, type: 'select', options: ampmOptions('fr'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.fr, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.fr, type: 'select', options: ampmOptions('fr'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.fr }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-ore', title: 'Calcolatore di Ore', h1: 'Calcolatore di Ore',
            meta_title: 'Calcolatore di Ore | Durata Tra Due Orari',
            meta_description: 'Calcola il numero di ore e minuti tra un orario di inizio e fine istantaneamente.',
            short_answer: 'Questo calcolatore trova la durata tra due orari, es. 9:00 AM alle 5:30 PM = 8h 30m.',
            intro_text: '<p>Inserisci un orario di inizio e uno di fine (formato 12 ore) per sapere esattamente quante ore e minuti li separano.</p>',
            key_points: [
                '<b>Metodo:</b> entrambi gli orari vengono convertiti in minuti dalla mezzanotte, e viene calcolata la differenza.',
                '<b>Intervalli notturni:</b> se l’orario di fine è precedente a quello di inizio, il calcolatore presume che cada nel giorno successivo.',
                '<b>Esempio:</b> 9:00 AM alle 5:30 PM = 8 ore 30 minuti (8,5 ore decimali).',
            ],
            howto: [
                { question: 'Come calcolo un turno notturno?', answer: '<p>Inserisci semplicemente l’inizio (es. 22:00) e la fine (es. 6:00) — il calcolatore passa automaticamente al giorno successivo.</p>' },
                { question: 'Questo tiene conto delle pause non pagate?', answer: '<p>No — è una differenza di tempo grezza. Sottrai il tempo di pausa separatamente, o usa il Calcolatore di Ore di Lavoro.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.it, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.it, type: 'select', options: ampmOptions('it'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.it, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.it, type: 'select', options: ampmOptions('it'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.it }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'stundenrechner', title: 'Stundenrechner', h1: 'Stundenrechner',
            meta_title: 'Stundenrechner | Dauer Zwischen Zwei Uhrzeiten',
            meta_description: 'Berechnen Sie die Anzahl der Stunden und Minuten zwischen Start- und Endzeit sofort.',
            short_answer: 'Dieser Rechner findet die Dauer zwischen zwei Uhrzeiten, z.B. 9:00 AM bis 5:30 PM = 8h 30m.',
            intro_text: '<p>Geben Sie eine Start- und Endzeit (12-Stunden-Format) ein, um genau zu erfahren, wie viele Stunden und Minuten dazwischen liegen.</p>',
            key_points: [
                '<b>Methode:</b> beide Zeiten werden in Minuten seit Mitternacht umgerechnet, und die Differenz wird gebildet.',
                '<b>Nächtliche Spannen:</b> wenn die Endzeit vor der Startzeit liegt, geht der Rechner davon aus, dass sie auf den nächsten Tag fällt.',
                '<b>Beispiel:</b> 9:00 AM bis 5:30 PM = 8 Stunden 30 Minuten (8,5 Dezimalstunden).',
            ],
            howto: [
                { question: 'Wie berechne ich eine Nachtschicht?', answer: '<p>Geben Sie einfach Start (z.B. 22:00) und Ende (z.B. 6:00) ein — der Rechner geht automatisch auf den nächsten Tag über.</p>' },
                { question: 'Berücksichtigt das unbezahlte Pausen?', answer: '<p>Nein — dies ist eine reine Zeitdifferenz. Ziehen Sie die Pausenzeit separat ab, oder verwenden Sie den Arbeitsstunden-Rechner.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.de, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.de, type: 'select', options: ampmOptions('de'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.de, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'end_ampm', label: AMPM_LABEL.de, type: 'select', options: ampmOptions('de'), default: 'PM' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.de }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.de, precision: 4 }],
        },
    },
}

// ============================================================
// 1114: Hours and Minutes Calculator (add/subtract, no seconds)
// ============================================================
const hoursMinutesCalcTool: ToolDef = {
    id: '1114',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'h1', default: 3 }, { key: 'm1', default: 45 },
            { key: 'operation', default: 'add' },
            { key: 'h2', default: 1 }, { key: 'm2', default: 30 },
        ],
        functions: { result: { type: 'function', functionName: 'hoursMinutesAddSubtract', params: { h1: 'h1', m1: 'm1', operation: 'operation', h2: 'h2', m2: 'm2' } } },
        outputs: [{ key: 'result' }, { key: 'decimal_hours', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'hours-and-minutes-calculator', title: 'Hours and Minutes Calculator | Add and Subtract Time', h1: 'Hours and Minutes Calculator',
            meta_title: 'Hours and Minutes Calculator | Add and Subtract Time',
            meta_description: 'Add or subtract two hours-and-minutes durations and get the result instantly.',
            short_answer: 'This calculator adds or subtracts two h:m durations, e.g. 3:45 + 1:30 = 5:15.',
            intro_text: '<p>A simplified version of the h:m:s calculator for when you only need hours and minutes — enter two durations and choose add or subtract.</p>',
            key_points: [
                '<b>Method:</b> both durations are converted to total minutes, added or subtracted, then reformatted back to h:m.',
                '<b>Example:</b> 3:45 + 1:30 = 5:15 (3h45m = 225 min, 1h30m = 90 min, total 315 min = 5h15m).',
                '<b>Negative results:</b> subtracting a larger duration from a smaller one shows a minus sign.',
            ],
            howto: [
                { question: 'What is 2:50 + 0:20?', answer: '<p>170 + 20 = 190 minutes = 3:10.</p>' },
                { question: 'Can I use this for timesheets?', answer: '<p>Yes — it\'s ideal for combining shift lengths recorded in hours and minutes.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.en, type: 'select', options: addSubtractOptions('en'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.en }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-chasov-i-minut', title: 'Калькулятор часов и минут | Сложение и вычитание времени', h1: 'Калькулятор часов и минут',
            meta_title: 'Калькулятор часов и минут | Сложение и вычитание времени',
            meta_description: 'Складывайте или вычитайте две длительности часы-минуты и получайте результат мгновенно.',
            short_answer: 'Этот калькулятор складывает или вычитает две длительности ч:м, например 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Упрощённая версия калькулятора ч:м:с для случаев, когда нужны только часы и минуты.</p>',
            key_points: [
                '<b>Метод:</b> обе длительности переводятся в минуты, складываются или вычитаются, затем форматируются обратно в ч:м.',
                '<b>Пример:</b> 3:45 + 1:30 = 5:15.',
                '<b>Отрицательные результаты:</b> вычитание большей длительности из меньшей показывает знак минус.',
            ],
            howto: [
                { question: 'Сколько это 2:50 + 0:20?', answer: '<p>170 + 20 = 190 минут = 3:10.</p>' },
                { question: 'Можно ли использовать это для табелей?', answer: '<p>Да — идеально подходит для суммирования длительности смен.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.ru, type: 'select', options: addSubtractOptions('ru'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.ru }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'stundu-un-minusu-kalkulators', title: 'Stundu un Minūšu Kalkulators | Laika Saskaitīšana un Atņemšana', h1: 'Stundu un Minūšu Kalkulators',
            meta_title: 'Stundu un Minūšu Kalkulators | Laika Saskaitīšana un Atņemšana',
            meta_description: 'Saskaitiet vai atņemiet divus stundu-minūšu ilgumus un iegūstiet rezultātu acumirklī.',
            short_answer: 'Šis kalkulators saskaita vai atņem divus h:m ilgumus, piemēram, 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Vienkāršota h:m:s kalkulatora versija gadījumiem, kad nepieciešamas tikai stundas un minūtes.</p>',
            key_points: [
                '<b>Metode:</b> abi ilgumi tiek pārvērsti minūtēs, saskaitīti vai atņemti, tad pārformatēti atpakaļ uz h:m.',
                '<b>Piemērs:</b> 3:45 + 1:30 = 5:15.',
                '<b>Negatīvi rezultāti:</b> lielāka ilguma atņemšana no mazāka parāda mīnusa zīmi.',
            ],
            howto: [
                { question: 'Cik ir 2:50 + 0:20?', answer: '<p>170 + 20 = 190 minūtes = 3:10.</p>' },
                { question: 'Vai varu izmantot to darba laika uzskaitei?', answer: '<p>Jā — tas ir ideāls, lai apvienotu maiņu ilgumus.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.lv, type: 'select', options: addSubtractOptions('lv'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.lv }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-godzin-i-minut', title: 'Kalkulator Godzin i Minut | Dodawanie i Odejmowanie Czasu', h1: 'Kalkulator Godzin i Minut',
            meta_title: 'Kalkulator Godzin i Minut | Dodawanie i Odejmowanie Czasu',
            meta_description: 'Dodaj lub odejmij dwa czasy trwania godziny-minuty i uzyskaj wynik natychmiast.',
            short_answer: 'Ten kalkulator dodaje lub odejmuje dwa czasy trwania g:m, np. 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Uproszczona wersja kalkulatora g:m:s na przypadki, gdy potrzebne są tylko godziny i minuty.</p>',
            key_points: [
                '<b>Metoda:</b> oba czasy trwania są przeliczane na minuty, dodawane lub odejmowane, a następnie formatowane z powrotem na g:m.',
                '<b>Przykład:</b> 3:45 + 1:30 = 5:15.',
                '<b>Wyniki ujemne:</b> odejmowanie większego czasu trwania od mniejszego pokazuje znak minus.',
            ],
            howto: [
                { question: 'Ile to 2:50 + 0:20?', answer: '<p>170 + 20 = 190 minut = 3:10.</p>' },
                { question: 'Czy mogę użyć tego do ewidencji czasu pracy?', answer: '<p>Tak — idealnie nadaje się do sumowania długości zmian.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.pl, type: 'select', options: addSubtractOptions('pl'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.pl }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-horas-y-minutos', title: 'Calculadora de Horas y Minutos | Sumar y Restar Tiempo', h1: 'Calculadora de Horas y Minutos',
            meta_title: 'Calculadora de Horas y Minutos | Sumar y Restar Tiempo',
            meta_description: 'Suma o resta dos duraciones de horas y minutos y obtén el resultado al instante.',
            short_answer: 'Esta calculadora suma o resta dos duraciones h:m, p. ej. 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Una versión simplificada de la calculadora h:m:s para cuando solo necesitas horas y minutos.</p>',
            key_points: [
                '<b>Método:</b> ambas duraciones se convierten en minutos totales, se suman o restan, y se reformatean de vuelta a h:m.',
                '<b>Ejemplo:</b> 3:45 + 1:30 = 5:15.',
                '<b>Resultados negativos:</b> restar una duración mayor de una menor muestra un signo menos.',
            ],
            howto: [
                { question: '¿Cuánto es 2:50 + 0:20?', answer: '<p>170 + 20 = 190 minutos = 3:10.</p>' },
                { question: '¿Puedo usar esto para hojas de tiempo?', answer: '<p>Sí — es ideal para combinar duraciones de turnos.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.es, type: 'select', options: addSubtractOptions('es'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.es }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-dheures-et-minutes', title: 'Calculateur d’Heures et de Minutes | Additionner et Soustraire le Temps', h1: 'Calculateur d’Heures et de Minutes',
            meta_title: 'Calculateur d’Heures et de Minutes | Additionner et Soustraire le Temps',
            meta_description: 'Additionnez ou soustrayez deux durées heures-minutes et obtenez le résultat instantanément.',
            short_answer: 'Ce calculateur additionne ou soustrait deux durées h:m, ex. 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Une version simplifiée du calculateur h:m:s pour quand vous n’avez besoin que d’heures et de minutes.</p>',
            key_points: [
                '<b>Méthode :</b> les deux durées sont converties en minutes totales, additionnées ou soustraites, puis reformatées en h:m.',
                '<b>Exemple :</b> 3:45 + 1:30 = 5:15.',
                '<b>Résultats négatifs :</b> soustraire une durée plus grande d’une plus petite affiche un signe moins.',
            ],
            howto: [
                { question: 'Combien font 2:50 + 0:20 ?', answer: '<p>170 + 20 = 190 minutes = 3:10.</p>' },
                { question: 'Puis-je utiliser cela pour des feuilles de temps ?', answer: '<p>Oui — c’est idéal pour combiner des durées de quarts de travail.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.fr, type: 'select', options: addSubtractOptions('fr'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.fr }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-ore-e-minuti', title: 'Calcolatore di Ore e Minuti | Somma e Sottrai il Tempo', h1: 'Calcolatore di Ore e Minuti',
            meta_title: 'Calcolatore di Ore e Minuti | Somma e Sottrai il Tempo',
            meta_description: 'Somma o sottrai due durate ore-minuti e ottieni il risultato istantaneamente.',
            short_answer: 'Questo calcolatore somma o sottrae due durate h:m, es. 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Una versione semplificata del calcolatore h:m:s per quando servono solo ore e minuti.</p>',
            key_points: [
                '<b>Metodo:</b> entrambe le durate vengono convertite in minuti totali, sommate o sottratte, poi riformattate in h:m.',
                '<b>Esempio:</b> 3:45 + 1:30 = 5:15.',
                '<b>Risultati negativi:</b> sottrarre una durata maggiore da una minore mostra il segno meno.',
            ],
            howto: [
                { question: 'Quanto è 2:50 + 0:20?', answer: '<p>170 + 20 = 190 minuti = 3:10.</p>' },
                { question: 'Posso usarlo per i fogli presenze?', answer: '<p>Sì — è ideale per sommare durate di turni.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.it, type: 'select', options: addSubtractOptions('it'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.it }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'stunden-und-minuten-rechner', title: 'Stunden- und Minutenrechner | Zeit Addieren und Subtrahieren', h1: 'Stunden- und Minutenrechner',
            meta_title: 'Stunden- und Minutenrechner | Zeit Addieren und Subtrahieren',
            meta_description: 'Addieren oder subtrahieren Sie zwei Stunden-Minuten-Dauern und erhalten Sie das Ergebnis sofort.',
            short_answer: 'Dieser Rechner addiert oder subtrahiert zwei h:m-Dauern, z.B. 3:45 + 1:30 = 5:15.',
            intro_text: '<p>Eine vereinfachte Version des h:m:s-Rechners für Fälle, in denen nur Stunden und Minuten benötigt werden.</p>',
            key_points: [
                '<b>Methode:</b> beide Dauern werden in Gesamtminuten umgerechnet, addiert oder subtrahiert, dann zurück in h:m formatiert.',
                '<b>Beispiel:</b> 3:45 + 1:30 = 5:15.',
                '<b>Negative Ergebnisse:</b> das Subtrahieren einer größeren Dauer von einer kleineren zeigt ein Minuszeichen.',
            ],
            howto: [
                { question: 'Was ist 2:50 + 0:20?', answer: '<p>170 + 20 = 190 Minuten = 3:10.</p>' },
                { question: 'Kann ich das für Stundenzettel verwenden?', answer: '<p>Ja — ideal, um Schichtlängen zu kombinieren.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '3' },
                { name: 'm1', label: MINUTES_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'operation', label: OPERATION_LABEL.de, type: 'select', options: addSubtractOptions('de'), default: 'add' },
                { name: 'h2', label: HOURS_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm2', label: MINUTES_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.de }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.de, precision: 4 }],
        },
    },
}

// ============================================================
// 1115: Time Calculator | Add, Subtract, Multiply, Divide Time
// ============================================================
const timeArithmeticTool: ToolDef = {
    id: '1115',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'h1', default: 1 }, { key: 'm1', default: 30 }, { key: 's1', default: 0 },
            { key: 'operation', default: 'multiply' },
            { key: 'value2', default: 3 },
        ],
        functions: { result: { type: 'function', functionName: 'timeArithmetic', params: { h1: 'h1', m1: 'm1', s1: 's1', operation: 'operation', value2: 'value2' } } },
        outputs: [{ key: 'result' }, { key: 'decimal_hours', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'time-calculator-add-subtract-multiply-divide', title: 'Time Calculator | Add, Subtract, Multiply, Divide Time', h1: 'Time Calculator | Add, Subtract, Multiply, Divide Time',
            meta_title: 'Time Calculator | Add, Subtract, Multiply, Divide Time',
            meta_description: 'Perform add, subtract, multiply, or divide operations on a time duration instantly.',
            short_answer: 'This calculator applies add, subtract, multiply, or divide to a duration, e.g. 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Enter a duration (h:m:s) and a value, then choose the operation. Add/subtract treat the value as decimal hours; multiply/divide treat it as a plain scaling factor.</p>',
            key_points: [
                '<b>Multiply example:</b> 1:30:00 (1.5h) × 3 = 4:30:00 — useful for scaling a per-unit time to a batch (e.g. 3 identical tasks).',
                '<b>Divide example:</b> 4:30:00 ÷ 3 = 1:30:00 — useful for splitting a total duration evenly.',
                '<b>Add/Subtract:</b> the value is treated as decimal hours added to or subtracted from the duration (e.g. 1:30:00 + 0.5 = 2:00:00).',
            ],
            howto: [
                { question: 'How do I halve a duration?', answer: '<p>Choose Divide and enter 2 as the value, e.g. 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'What happens if I divide by 0?', answer: '<p>The result is shown as 0:00:00 to avoid an undefined calculation.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.en, type: 'select', options: fourOpOptions('en'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.en }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-vremeni-4-operacii', title: 'Калькулятор времени | Сложение, вычитание, умножение, деление', h1: 'Калькулятор времени | Сложение, вычитание, умножение, деление',
            meta_title: 'Калькулятор времени | Сложение, вычитание, умножение, деление',
            meta_description: 'Выполняйте сложение, вычитание, умножение или деление над длительностью мгновенно.',
            short_answer: 'Этот калькулятор применяет сложение, вычитание, умножение или деление к длительности, например 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Введите длительность (ч:м:с) и значение, затем выберите операцию. При сложении/вычитании значение — десятичные часы; при умножении/делении — простой коэффициент.</p>',
            key_points: [
                '<b>Пример умножения:</b> 1:30:00 (1,5ч) × 3 = 4:30:00 — полезно для масштабирования времени на партию задач.',
                '<b>Пример деления:</b> 4:30:00 ÷ 3 = 1:30:00 — полезно для равномерного разделения общей длительности.',
                '<b>Сложение/вычитание:</b> значение рассматривается как десятичные часы (например, 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: 'Как разделить длительность пополам?', answer: '<p>Выберите Разделить и введите 2, например 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'Что если делить на 0?', answer: '<p>Результат показывается как 0:00:00, чтобы избежать неопределённого расчёта.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.ru, type: 'select', options: fourOpOptions('ru'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.ru }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'laika-kalkulators-4-darbibas', title: 'Laika Kalkulators | Saskaitīšana, Atņemšana, Reizināšana, Dalīšana', h1: 'Laika Kalkulators | Saskaitīšana, Atņemšana, Reizināšana, Dalīšana',
            meta_title: 'Laika Kalkulators | Saskaitīšana, Atņemšana, Reizināšana, Dalīšana',
            meta_description: 'Veiciet saskaitīšanas, atņemšanas, reizināšanas vai dalīšanas darbības ar laika ilgumu acumirklī.',
            short_answer: 'Šis kalkulators pielieto saskaitīšanu, atņemšanu, reizināšanu vai dalīšanu ilgumam, piemēram, 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Ievadiet ilgumu (h:m:s) un vērtību, tad izvēlieties darbību. Saskaitīšanā/atņemšanā vērtība ir decimālās stundas; reizināšanā/dalīšanā — vienkāršs koeficients.</p>',
            key_points: [
                '<b>Reizināšanas piemērs:</b> 1:30:00 (1,5h) × 3 = 4:30:00 — noderīgi, mērogojot laiku uz partiju.',
                '<b>Dalīšanas piemērs:</b> 4:30:00 ÷ 3 = 1:30:00 — noderīgi, vienmērīgi sadalot kopējo ilgumu.',
                '<b>Saskaitīšana/Atņemšana:</b> vērtība tiek uzskatīta par decimālām stundām (piemēram, 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: 'Kā uz pusēm sadalīt ilgumu?', answer: '<p>Izvēlieties Dalīt un ievadiet 2, piemēram, 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'Kas notiek, ja dala ar 0?', answer: '<p>Rezultāts tiek parādīts kā 0:00:00, lai izvairītos no nedefinēta aprēķina.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.lv, type: 'select', options: fourOpOptions('lv'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.lv }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-czasu-4-dzialania', title: 'Kalkulator Czasu | Dodawanie, Odejmowanie, Mnożenie, Dzielenie', h1: 'Kalkulator Czasu | Dodawanie, Odejmowanie, Mnożenie, Dzielenie',
            meta_title: 'Kalkulator Czasu | Dodawanie, Odejmowanie, Mnożenie, Dzielenie',
            meta_description: 'Wykonaj dodawanie, odejmowanie, mnożenie lub dzielenie na czasie trwania natychmiast.',
            short_answer: 'Ten kalkulator stosuje dodawanie, odejmowanie, mnożenie lub dzielenie do czasu trwania, np. 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Wprowadź czas trwania (g:m:s) i wartość, następnie wybierz operację. Przy dodawaniu/odejmowaniu wartość to godziny dziesiętne; przy mnożeniu/dzieleniu — zwykły współczynnik.</p>',
            key_points: [
                '<b>Przykład mnożenia:</b> 1:30:00 (1,5h) × 3 = 4:30:00 — przydatne do skalowania czasu na partię zadań.',
                '<b>Przykład dzielenia:</b> 4:30:00 ÷ 3 = 1:30:00 — przydatne do równomiernego podziału całkowitego czasu trwania.',
                '<b>Dodawanie/Odejmowanie:</b> wartość jest traktowana jako godziny dziesiętne (np. 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: 'Jak podzielić czas trwania na pół?', answer: '<p>Wybierz Podziel i wpisz 2, np. 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'Co się stanie przy dzieleniu przez 0?', answer: '<p>Wynik jest pokazany jako 0:00:00, aby uniknąć niezdefiniowanego obliczenia.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.pl, type: 'select', options: fourOpOptions('pl'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.pl }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-tiempo-4-operaciones', title: 'Calculadora de Tiempo | Sumar, Restar, Multiplicar, Dividir Tiempo', h1: 'Calculadora de Tiempo | Sumar, Restar, Multiplicar, Dividir Tiempo',
            meta_title: 'Calculadora de Tiempo | Sumar, Restar, Multiplicar, Dividir Tiempo',
            meta_description: 'Realiza operaciones de sumar, restar, multiplicar o dividir sobre una duración al instante.',
            short_answer: 'Esta calculadora aplica sumar, restar, multiplicar o dividir a una duración, p. ej. 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Introduce una duración (h:m:s) y un valor, luego elige la operación. Sumar/restar tratan el valor como horas decimales; multiplicar/dividir lo tratan como un factor de escala simple.</p>',
            key_points: [
                '<b>Ejemplo de multiplicación:</b> 1:30:00 (1,5h) × 3 = 4:30:00 — útil para escalar el tiempo de una tarea a un lote.',
                '<b>Ejemplo de división:</b> 4:30:00 ÷ 3 = 1:30:00 — útil para dividir una duración total de forma equitativa.',
                '<b>Sumar/Restar:</b> el valor se trata como horas decimales (p. ej. 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: '¿Cómo divido una duración a la mitad?', answer: '<p>Elige Dividir e introduce 2, p. ej. 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: '¿Qué pasa si divido entre 0?', answer: '<p>El resultado se muestra como 0:00:00 para evitar un cálculo indefinido.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.es, type: 'select', options: fourOpOptions('es'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.es }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-temps-4-operations', title: 'Calculateur de Temps | Additionner, Soustraire, Multiplier, Diviser le Temps', h1: 'Calculateur de Temps | Additionner, Soustraire, Multiplier, Diviser le Temps',
            meta_title: 'Calculateur de Temps | Additionner, Soustraire, Multiplier, Diviser le Temps',
            meta_description: 'Effectuez des opérations d’addition, soustraction, multiplication ou division sur une durée instantanément.',
            short_answer: 'Ce calculateur applique addition, soustraction, multiplication ou division à une durée, ex. 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Entrez une durée (h:m:s) et une valeur, puis choisissez l’opération. Addition/soustraction traitent la valeur comme des heures décimales ; multiplication/division la traitent comme un simple facteur.</p>',
            key_points: [
                '<b>Exemple de multiplication :</b> 1:30:00 (1,5h) × 3 = 4:30:00 — utile pour mettre à l’échelle un temps sur un lot de tâches.',
                '<b>Exemple de division :</b> 4:30:00 ÷ 3 = 1:30:00 — utile pour répartir uniformément une durée totale.',
                '<b>Addition/Soustraction :</b> la valeur est traitée comme des heures décimales (ex. 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: 'Comment diviser une durée en deux ?', answer: '<p>Choisissez Diviser et entrez 2, ex. 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'Que se passe-t-il en cas de division par 0 ?', answer: '<p>Le résultat est affiché comme 0:00:00 pour éviter un calcul indéfini.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.fr, type: 'select', options: fourOpOptions('fr'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.fr }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-tempo-4-operazioni', title: 'Calcolatore di Tempo | Somma, Sottrai, Moltiplica, Dividi il Tempo', h1: 'Calcolatore di Tempo | Somma, Sottrai, Moltiplica, Dividi il Tempo',
            meta_title: 'Calcolatore di Tempo | Somma, Sottrai, Moltiplica, Dividi il Tempo',
            meta_description: 'Esegui operazioni di somma, sottrazione, moltiplicazione o divisione su una durata istantaneamente.',
            short_answer: 'Questo calcolatore applica somma, sottrazione, moltiplicazione o divisione a una durata, es. 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Inserisci una durata (h:m:s) e un valore, poi scegli l’operazione. Somma/sottrazione trattano il valore come ore decimali; moltiplicazione/divisione lo trattano come un semplice fattore di scala.</p>',
            key_points: [
                '<b>Esempio di moltiplicazione:</b> 1:30:00 (1,5h) × 3 = 4:30:00 — utile per scalare il tempo su un lotto di attività.',
                '<b>Esempio di divisione:</b> 4:30:00 ÷ 3 = 1:30:00 — utile per suddividere equamente una durata totale.',
                '<b>Somma/Sottrazione:</b> il valore è trattato come ore decimali (es. 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: 'Come dimezzo una durata?', answer: '<p>Scegli Dividi e inserisci 2, es. 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'Cosa succede se divido per 0?', answer: '<p>Il risultato è mostrato come 0:00:00 per evitare un calcolo indefinito.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.it, type: 'select', options: fourOpOptions('it'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.it }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'zeitrechner-4-operationen', title: 'Zeitrechner | Zeit Addieren, Subtrahieren, Multiplizieren, Dividieren', h1: 'Zeitrechner | Zeit Addieren, Subtrahieren, Multiplizieren, Dividieren',
            meta_title: 'Zeitrechner | Zeit Addieren, Subtrahieren, Multiplizieren, Dividieren',
            meta_description: 'Führen Sie Additions-, Subtraktions-, Multiplikations- oder Divisionsoperationen an einer Zeitdauer sofort durch.',
            short_answer: 'Dieser Rechner wendet Addition, Subtraktion, Multiplikation oder Division auf eine Dauer an, z.B. 1:30:00 × 3 = 4:30:00.',
            intro_text: '<p>Geben Sie eine Dauer (h:m:s) und einen Wert ein, wählen Sie dann die Operation. Addition/Subtraktion behandeln den Wert als Dezimalstunden; Multiplikation/Division als einfachen Skalierungsfaktor.</p>',
            key_points: [
                '<b>Multiplikationsbeispiel:</b> 1:30:00 (1,5h) × 3 = 4:30:00 — nützlich, um eine Zeit pro Einheit auf eine Charge hochzurechnen.',
                '<b>Divisionsbeispiel:</b> 4:30:00 ÷ 3 = 1:30:00 — nützlich, um eine Gesamtdauer gleichmäßig aufzuteilen.',
                '<b>Addition/Subtraktion:</b> der Wert wird als Dezimalstunden behandelt (z.B. 1:30:00 + 0,5 = 2:00:00).',
            ],
            howto: [
                { question: 'Wie halbiere ich eine Dauer?', answer: '<p>Wählen Sie Dividieren und geben Sie 2 ein, z.B. 3:00:00 ÷ 2 = 1:30:00.</p>' },
                { question: 'Was passiert bei Division durch 0?', answer: '<p>Das Ergebnis wird als 0:00:00 angezeigt, um eine undefinierte Berechnung zu vermeiden.</p>' },
            ],
            inputs: [
                { name: 'h1', label: HOURS_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '1' },
                { name: 'm1', label: MINUTES_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 's1', label: SECONDS_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: OPERATION_LABEL.de, type: 'select', options: fourOpOptions('de'), default: 'multiply' },
                { name: 'value2', label: VALUE2_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '3' },
            ],
            outputs: [{ name: 'result', label: DURATION_RESULT_LABEL.de }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.de, precision: 4 }],
        },
    },
}

export const tools: ToolDef[] = [speedConversion, timeConversion, speedDistanceTime, decimalToTimeTool, timeToDecimalTool, militaryTimeConverterTool, militaryTimeChartTool, timeCalcHmsTool, hoursCalculatorTool, hoursMinutesCalcTool, timeArithmeticTool]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: TIME_SPEED_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: TIME_SPEED_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} time & speed converters across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
