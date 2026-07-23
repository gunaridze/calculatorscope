// One-off script: seeds 12 new Temperature & Angle Converter calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-temperature-angle-calculators.ts
//
// Tool IDs 1133-1144, category_id '32' (Temperature & Angle Converters, under
// Converters). No explicit tool list was requested for this category; the 12
// tools below (6 temperature + 6 angle) were proposed and confirmed with the
// user before writing content.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEMPERATURE_ANGLE_CATEGORY_ID = '32'

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
const TEMP_UNIT_ORDER = ['celsius', 'fahrenheit', 'kelvin', 'rankine']
const ANGLE_UNIT_ORDER = ['degree', 'radian', 'gradian', 'arcminute', 'arcsecond', 'turn']

const TEMP_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelvin (K)', rankine: 'Rankine (°R)' },
    ru: { celsius: 'Цельсий (°C)', fahrenheit: 'Фаренгейт (°F)', kelvin: 'Кельвин (K)', rankine: 'Ранкин (°R)' },
    de: { celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelvin (K)', rankine: 'Rankine (°R)' },
    es: { celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelvin (K)', rankine: 'Rankine (°R)' },
    fr: { celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelvin (K)', rankine: 'Rankine (°R)' },
    it: { celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelvin (K)', rankine: 'Rankine (°R)' },
    pl: { celsius: 'Celsjusz (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelwin (K)', rankine: 'Rankine (°R)' },
    lv: { celsius: 'Celsijs (°C)', fahrenheit: 'Fārenheits (°F)', kelvin: 'Kelvins (K)', rankine: 'Renkins (°R)' },
}

const ANGLE_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { degree: 'Degrees (°)', radian: 'Radians (rad)', gradian: 'Gradians (grad)', arcminute: 'Arcminutes (\')', arcsecond: 'Arcseconds (")', turn: 'Turns (rev)' },
    ru: { degree: 'Градусы (°)', radian: 'Радианы (рад)', gradian: 'Грады (град)', arcminute: 'Угловые минуты (\')', arcsecond: 'Угловые секунды (")', turn: 'Обороты (об)' },
    de: { degree: 'Grad (°)', radian: 'Radiant (rad)', gradian: 'Gon (grad)', arcminute: 'Bogenminuten (\')', arcsecond: 'Bogensekunden (")', turn: 'Umdrehungen (U)' },
    es: { degree: 'Grados (°)', radian: 'Radianes (rad)', gradian: 'Gradianes (grad)', arcminute: 'Minutos de Arco (\')', arcsecond: 'Segundos de Arco (")', turn: 'Vueltas (rev)' },
    fr: { degree: 'Degrés (°)', radian: 'Radians (rad)', gradian: 'Grades (grad)', arcminute: 'Minutes d’Arc (\')', arcsecond: 'Secondes d’Arc (")', turn: 'Tours (tr)' },
    it: { degree: 'Gradi (°)', radian: 'Radianti (rad)', gradian: 'Gradi Centesimali (grad)', arcminute: 'Primi d’Arco (\')', arcsecond: 'Secondi d’Arco (")', turn: 'Giri (rev)' },
    pl: { degree: 'Stopnie (°)', radian: 'Radiany (rad)', gradian: 'Grady (grad)', arcminute: 'Minuty Kątowe (\')', arcsecond: 'Sekundy Kątowe (")', turn: 'Obroty (obr)' },
    lv: { degree: 'Grādi (°)', radian: 'Radiāni (rad)', gradian: 'Grādieni (grad)', arcminute: 'Loka Minūtes (\')', arcsecond: 'Loka Sekundes (")', turn: 'Apgriezieni (apgr)' },
}

function tempUnitOptions(lang: string) {
    const labels = TEMP_UNIT_LABELS[lang] || TEMP_UNIT_LABELS.en
    return TEMP_UNIT_ORDER.map((code) => ({ value: code, label: labels[code], abbr: code }))
}
function angleUnitOptions(lang: string) {
    const labels = ANGLE_UNIT_LABELS[lang] || ANGLE_UNIT_LABELS.en
    return ANGLE_UNIT_ORDER.map((code) => ({ value: code, label: labels[code], abbr: code }))
}

const FROM_LABEL: Record<string, string> = { en: 'From', ru: 'Из', de: 'Von', es: 'De', fr: 'De', it: 'Da', pl: 'Z', lv: 'No' }
const TO_LABEL: Record<string, string> = { en: 'To', ru: 'В', de: 'Nach', es: 'A', fr: 'Vers', it: 'A', pl: 'Na', lv: 'Uz' }
const VALUE_LABEL: Record<string, string> = { en: 'Value', ru: 'Значение', de: 'Wert', es: 'Valor', fr: 'Valeur', it: 'Valore', pl: 'Wartość', lv: 'Vērtība' }
const CONVERTED_LABEL: Record<string, string> = { en: 'Converted Value', ru: 'Конвертированное значение', de: 'Umgerechneter Wert', es: 'Valor Convertido', fr: 'Valeur Convertie', it: 'Valore Convertito', pl: 'Przeliczona Wartość', lv: 'Pārrēķinātā Vērtība' }

// ============================================================
// 1133: Temperature Converter (general multi-unit)
// ============================================================
const temperatureConverterTool: ToolDef = {
    id: '1133',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 100 }, { key: 'from_unit', default: 'celsius' }, { key: 'to_unit', default: 'fahrenheit' }],
        functions: { result: { type: 'function', functionName: 'temperatureConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } } },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'temperature-converter', title: 'Temperature Converter', h1: 'Temperature Converter',
            meta_title: 'Temperature Converter | Celsius, Fahrenheit, Kelvin, Rankine',
            meta_description: 'Convert between Celsius, Fahrenheit, Kelvin, and Rankine instantly with this temperature converter.',
            short_answer: 'This converter changes a temperature value between Celsius, Fahrenheit, Kelvin, and Rankine using the selectors below.',
            intro_text: '<p>Different fields and regions use different temperature scales — Celsius for most of the world and science, Fahrenheit in the US, Kelvin for absolute/scientific measurements, and Rankine occasionally in engineering.</p><p>This tool converts between all four directly, so you don\'t need to remember separate formulas for each pair.</p>',
            key_points: [
                '<b>Key reference points:</b> water freezes at 0°C / 32°F / 273.15 K, and boils at 100°C / 212°F / 373.15 K (at sea level).',
                '<b>Kelvin and Rankine are absolute scales:</b> 0 K and 0°R represent absolute zero, with no negative values possible.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the four supported temperature scales.',
            ],
            howto: [
                { question: 'How do I convert Celsius to Fahrenheit?', answer: '<p>Multiply by 9/5 and add 32, or select "Celsius" as From and "Fahrenheit" as To in this converter.</p>' },
                { question: 'Why is Kelvin used in science?', answer: '<p>Kelvin has no negative values and starts at absolute zero, making it convenient for physics and chemistry formulas where temperature must be strictly positive.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.en, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.en, type: 'select', options: tempUnitOptions('en') },
                { name: 'to_unit', label: TO_LABEL.en, type: 'select', options: tempUnitOptions('en') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.en, unitFrom: 'to_unit', precision: 4 }],
        },
        ru: {
            slug: 'konverter-temperatury', title: 'Конвертер температуры', h1: 'Конвертер температуры',
            meta_title: 'Конвертер температуры | Цельсий, Фаренгейт, Кельвин, Ранкин',
            meta_description: 'Конвертируйте между Цельсием, Фаренгейтом, Кельвином и Ранкином мгновенно.',
            short_answer: 'Этот конвертер переводит значение температуры между Цельсием, Фаренгейтом, Кельвином и Ранкином.',
            intro_text: '<p>Разные страны и области используют разные шкалы температуры — Цельсий в большей части мира и науке, Фаренгейт в США, Кельвин для абсолютных научных измерений, Ранкин иногда в инженерии.</p><p>Этот инструмент конвертирует между всеми четырьмя напрямую.</p>',
            key_points: [
                '<b>Ключевые точки:</b> вода замерзает при 0°C / 32°F / 273,15 K и кипит при 100°C / 212°F / 373,15 K (на уровне моря).',
                '<b>Кельвин и Ранкин — абсолютные шкалы:</b> 0 K и 0°R представляют абсолютный ноль, отрицательные значения невозможны.',
                '<b>Полностью гибкий:</b> измените любой список, чтобы конвертировать между любыми двумя из четырёх шкал.',
            ],
            howto: [
                { question: 'Как перевести Цельсий в Фаренгейт?', answer: '<p>Умножьте на 9/5 и прибавьте 32, или выберите «Цельсий» как Из и «Фаренгейт» как В в этом конвертере.</p>' },
                { question: 'Почему в науке используется Кельвин?', answer: '<p>Кельвин не имеет отрицательных значений и начинается с абсолютного нуля, что удобно для формул физики и химии.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.ru, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.ru, type: 'select', options: tempUnitOptions('ru') },
                { name: 'to_unit', label: TO_LABEL.ru, type: 'select', options: tempUnitOptions('ru') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.ru, unitFrom: 'to_unit', precision: 4 }],
        },
        lv: {
            slug: 'temperaturas-konvertetajs', title: 'Temperatūras Konvertētājs', h1: 'Temperatūras Konvertētājs',
            meta_title: 'Temperatūras Konvertētājs | Celsijs, Fārenheits, Kelvins, Renkins',
            meta_description: 'Konvertējiet starp Celsiju, Fārenheitu, Kelviniem un Renkinu acumirklī.',
            short_answer: 'Šis konvertētājs pārrēķina temperatūras vērtību starp Celsiju, Fārenheitu, Kelviniem un Renkinu.',
            intro_text: '<p>Dažādas valstis un jomas izmanto dažādas temperatūras skalas — Celsijs lielākajā pasaules daļā un zinātnē, Fārenheits ASV, Kelvini absolūtiem zinātniskiem mērījumiem, Renkins reizēm inženierijā.</p><p>Šis rīks konvertē starp visām četrām tieši.</p>',
            key_points: [
                '<b>Galvenie atskaites punkti:</b> ūdens sasalst pie 0°C / 32°F / 273,15 K un vārās pie 100°C / 212°F / 373,15 K (jūras līmenī).',
                '<b>Kelvini un Renkins ir absolūtās skalas:</b> 0 K un 0°R apzīmē absolūto nulli, negatīvas vērtības nav iespējamas.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru sarakstu, lai konvertētu starp jebkurām divām no četrām skalām.',
            ],
            howto: [
                { question: 'Kā konvertēt Celsiju uz Fārenheitu?', answer: '<p>Reiziniet ar 9/5 un pieskaitiet 32, vai izvēlieties "Celsijs" kā No un "Fārenheits" kā Uz šajā konvertētājā.</p>' },
                { question: 'Kāpēc zinātnē izmanto Kelvinus?', answer: '<p>Kelviniem nav negatīvu vērtību un tie sākas ar absolūto nulli, kas ir ērti fizikas un ķīmijas formulām.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.lv, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.lv, type: 'select', options: tempUnitOptions('lv') },
                { name: 'to_unit', label: TO_LABEL.lv, type: 'select', options: tempUnitOptions('lv') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.lv, unitFrom: 'to_unit', precision: 4 }],
        },
        pl: {
            slug: 'konwerter-temperatury', title: 'Konwerter Temperatury', h1: 'Konwerter Temperatury',
            meta_title: 'Konwerter Temperatury | Celsjusz, Fahrenheit, Kelwin, Rankine',
            meta_description: 'Przelicz między Celsjuszem, Fahrenheitem, Kelwinami i Rankine natychmiast.',
            short_answer: 'Ten konwerter przelicza wartość temperatury między Celsjuszem, Fahrenheitem, Kelwinami i Rankine.',
            intro_text: '<p>Różne kraje i dziedziny używają różnych skal temperatury — Celsjusz w większości świata i nauce, Fahrenheit w USA, Kelwiny do bezwzględnych pomiarów naukowych, Rankine czasem w inżynierii.</p><p>To narzędzie przelicza między wszystkimi czterema bezpośrednio.</p>',
            key_points: [
                '<b>Kluczowe punkty odniesienia:</b> woda zamarza przy 0°C / 32°F / 273,15 K i wrze przy 100°C / 212°F / 373,15 K (na poziomie morza).',
                '<b>Kelwiny i Rankine to skale bezwzględne:</b> 0 K i 0°R oznaczają zero absolutne, wartości ujemne są niemożliwe.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę, aby przeliczyć między dowolnymi dwiema z czterech skal.',
            ],
            howto: [
                { question: 'Jak przeliczyć Celsjusza na Fahrenheita?', answer: '<p>Pomnóż przez 9/5 i dodaj 32, lub wybierz "Celsjusz" jako Z i "Fahrenheit" jako Na w tym konwerterze.</p>' },
                { question: 'Dlaczego w nauce używa się Kelwinów?', answer: '<p>Kelwiny nie mają wartości ujemnych i zaczynają się od zera absolutnego, co jest wygodne dla wzorów fizyki i chemii.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.pl, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.pl, type: 'select', options: tempUnitOptions('pl') },
                { name: 'to_unit', label: TO_LABEL.pl, type: 'select', options: tempUnitOptions('pl') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.pl, unitFrom: 'to_unit', precision: 4 }],
        },
        es: {
            slug: 'convertidor-de-temperatura', title: 'Convertidor de Temperatura', h1: 'Convertidor de Temperatura',
            meta_title: 'Convertidor de Temperatura | Celsius, Fahrenheit, Kelvin, Rankine',
            meta_description: 'Convierte entre Celsius, Fahrenheit, Kelvin y Rankine al instante.',
            short_answer: 'Este convertidor cambia un valor de temperatura entre Celsius, Fahrenheit, Kelvin y Rankine.',
            intro_text: '<p>Diferentes campos y regiones usan diferentes escalas de temperatura — Celsius en la mayor parte del mundo y la ciencia, Fahrenheit en EE. UU., Kelvin para mediciones científicas absolutas, y Rankine ocasionalmente en ingeniería.</p><p>Esta herramienta convierte entre las cuatro directamente.</p>',
            key_points: [
                '<b>Puntos de referencia clave:</b> el agua se congela a 0°C / 32°F / 273,15 K y hierve a 100°C / 212°F / 373,15 K (al nivel del mar).',
                '<b>Kelvin y Rankine son escalas absolutas:</b> 0 K y 0°R representan el cero absoluto, sin valores negativos posibles.',
                '<b>Totalmente flexible:</b> cambia cualquier lista desplegable para convertir entre cualquiera de las cuatro escalas.',
            ],
            howto: [
                { question: '¿Cómo convierto Celsius a Fahrenheit?', answer: '<p>Multiplica por 9/5 y suma 32, o selecciona "Celsius" como De y "Fahrenheit" como A en este convertidor.</p>' },
                { question: '¿Por qué se usa Kelvin en ciencia?', answer: '<p>Kelvin no tiene valores negativos y comienza en el cero absoluto, lo cual es conveniente para fórmulas de física y química.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.es, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.es, type: 'select', options: tempUnitOptions('es') },
                { name: 'to_unit', label: TO_LABEL.es, type: 'select', options: tempUnitOptions('es') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.es, unitFrom: 'to_unit', precision: 4 }],
        },
        fr: {
            slug: 'convertisseur-de-temperature', title: 'Convertisseur de Température', h1: 'Convertisseur de Température',
            meta_title: 'Convertisseur de Température | Celsius, Fahrenheit, Kelvin, Rankine',
            meta_description: 'Convertissez entre Celsius, Fahrenheit, Kelvin et Rankine instantanément.',
            short_answer: 'Ce convertisseur change une valeur de température entre Celsius, Fahrenheit, Kelvin et Rankine.',
            intro_text: '<p>Différents domaines et régions utilisent différentes échelles de température — Celsius dans la majeure partie du monde et en science, Fahrenheit aux États-Unis, Kelvin pour les mesures scientifiques absolues, et Rankine parfois en ingénierie.</p><p>Cet outil convertit entre les quatre directement.</p>',
            key_points: [
                '<b>Points de référence clés :</b> l’eau gèle à 0°C / 32°F / 273,15 K et bout à 100°C / 212°F / 373,15 K (au niveau de la mer).',
                '<b>Kelvin et Rankine sont des échelles absolues :</b> 0 K et 0°R représentent le zéro absolu, sans valeurs négatives possibles.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste pour convertir entre deux des quatre échelles.',
            ],
            howto: [
                { question: 'Comment convertir Celsius en Fahrenheit ?', answer: '<p>Multipliez par 9/5 et ajoutez 32, ou sélectionnez "Celsius" comme De et "Fahrenheit" comme Vers dans ce convertisseur.</p>' },
                { question: 'Pourquoi le Kelvin est-il utilisé en science ?', answer: '<p>Le Kelvin n’a pas de valeurs négatives et commence au zéro absolu, ce qui est pratique pour les formules de physique et de chimie.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.fr, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.fr, type: 'select', options: tempUnitOptions('fr') },
                { name: 'to_unit', label: TO_LABEL.fr, type: 'select', options: tempUnitOptions('fr') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.fr, unitFrom: 'to_unit', precision: 4 }],
        },
        it: {
            slug: 'convertitore-di-temperatura', title: 'Convertitore di Temperatura', h1: 'Convertitore di Temperatura',
            meta_title: 'Convertitore di Temperatura | Celsius, Fahrenheit, Kelvin, Rankine',
            meta_description: 'Converti tra Celsius, Fahrenheit, Kelvin e Rankine istantaneamente.',
            short_answer: 'Questo convertitore cambia un valore di temperatura tra Celsius, Fahrenheit, Kelvin e Rankine.',
            intro_text: '<p>Campi e regioni diverse usano scale di temperatura diverse — Celsius nella maggior parte del mondo e nella scienza, Fahrenheit negli USA, Kelvin per misurazioni scientifiche assolute, e Rankine occasionalmente nell’ingegneria.</p><p>Questo strumento converte tra tutte e quattro direttamente.</p>',
            key_points: [
                '<b>Punti di riferimento chiave:</b> l’acqua congela a 0°C / 32°F / 273,15 K e bolle a 100°C / 212°F / 373,15 K (al livello del mare).',
                '<b>Kelvin e Rankine sono scale assolute:</b> 0 K e 0°R rappresentano lo zero assoluto, senza valori negativi possibili.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu a tendina per convertire tra due delle quattro scale.',
            ],
            howto: [
                { question: 'Come converto Celsius in Fahrenheit?', answer: '<p>Moltiplica per 9/5 e aggiungi 32, oppure seleziona "Celsius" come Da e "Fahrenheit" come A in questo convertitore.</p>' },
                { question: 'Perché si usa Kelvin nella scienza?', answer: '<p>Kelvin non ha valori negativi e inizia dallo zero assoluto, il che è comodo per le formule di fisica e chimica.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.it, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.it, type: 'select', options: tempUnitOptions('it') },
                { name: 'to_unit', label: TO_LABEL.it, type: 'select', options: tempUnitOptions('it') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.it, unitFrom: 'to_unit', precision: 4 }],
        },
        de: {
            slug: 'temperatur-umrechner', title: 'Temperatur-Umrechner', h1: 'Temperatur-Umrechner',
            meta_title: 'Temperatur-Umrechner | Celsius, Fahrenheit, Kelvin, Rankine',
            meta_description: 'Rechnen Sie sofort zwischen Celsius, Fahrenheit, Kelvin und Rankine um.',
            short_answer: 'Dieser Umrechner wandelt einen Temperaturwert zwischen Celsius, Fahrenheit, Kelvin und Rankine um.',
            intro_text: '<p>Verschiedene Bereiche und Regionen verwenden unterschiedliche Temperaturskalen — Celsius in den meisten Teilen der Welt und in der Wissenschaft, Fahrenheit in den USA, Kelvin für absolute wissenschaftliche Messungen und Rankine gelegentlich in der Technik.</p><p>Dieses Tool rechnet direkt zwischen allen vieren um.</p>',
            key_points: [
                '<b>Wichtige Referenzpunkte:</b> Wasser gefriert bei 0°C / 32°F / 273,15 K und kocht bei 100°C / 212°F / 373,15 K (auf Meereshöhe).',
                '<b>Kelvin und Rankine sind absolute Skalen:</b> 0 K und 0°R stellen den absoluten Nullpunkt dar, negative Werte sind nicht möglich.',
                '<b>Voll flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der vier unterstützten Temperaturskalen umzurechnen.',
            ],
            howto: [
                { question: 'Wie rechne ich Celsius in Fahrenheit um?', answer: '<p>Multiplizieren Sie mit 9/5 und addieren Sie 32, oder wählen Sie "Celsius" als Von und "Fahrenheit" als Nach in diesem Umrechner.</p>' },
                { question: 'Warum wird Kelvin in der Wissenschaft verwendet?', answer: '<p>Kelvin hat keine negativen Werte und beginnt beim absoluten Nullpunkt, was für Formeln in Physik und Chemie praktisch ist.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.de, type: 'number', min: -1000000, max: 1000000, placeholder: '100' },
                { name: 'from_unit', label: FROM_LABEL.de, type: 'select', options: tempUnitOptions('de') },
                { name: 'to_unit', label: TO_LABEL.de, type: 'select', options: tempUnitOptions('de') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.de, unitFrom: 'to_unit', precision: 4 }],
        },
    },
}

const CELSIUS_LABEL: Record<string, string> = { en: 'Celsius (°C)', ru: 'Цельсий (°C)', de: 'Celsius (°C)', es: 'Celsius (°C)', fr: 'Celsius (°C)', it: 'Celsius (°C)', pl: 'Celsjusz (°C)', lv: 'Celsijs (°C)' }
const FAHRENHEIT_LABEL: Record<string, string> = { en: 'Fahrenheit (°F)', ru: 'Фаренгейт (°F)', de: 'Fahrenheit (°F)', es: 'Fahrenheit (°F)', fr: 'Fahrenheit (°F)', it: 'Fahrenheit (°F)', pl: 'Fahrenheit (°F)', lv: 'Fārenheits (°F)' }
const KELVIN_LABEL: Record<string, string> = { en: 'Kelvin (K)', ru: 'Кельвин (K)', de: 'Kelvin (K)', es: 'Kelvin (K)', fr: 'Kelvin (K)', it: 'Kelvin (K)', pl: 'Kelwin (K)', lv: 'Kelvins (K)' }

// ============================================================
// 1134: Celsius to Fahrenheit Calculator
// ============================================================
const celsiusToFahrenheitTool: ToolDef = {
    id: '1134',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 20 }],
        functions: { result: { type: 'function', functionName: 'celsiusToFahrenheit', params: { value: 'value' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'celsius-to-fahrenheit-calculator', title: 'Celsius to Fahrenheit Calculator', h1: 'Celsius to Fahrenheit Calculator',
            meta_title: 'Celsius to Fahrenheit Calculator | °C to °F Conversion',
            meta_description: 'Convert Celsius to Fahrenheit instantly with this simple temperature calculator.',
            short_answer: 'This calculator converts a Celsius temperature into Fahrenheit, e.g. 20°C = 68°F.',
            intro_text: '<p>Enter a temperature in Celsius to instantly see its Fahrenheit equivalent — useful for cooking, weather, or comparing US temperature readings.</p>',
            key_points: [
                '<b>Formula:</b> °F = °C × 9/5 + 32.',
                '<b>Example:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Reference points:</b> 0°C = 32°F (freezing), 37°C = 98.6°F (body temperature), 100°C = 212°F (boiling).',
            ],
            howto: [
                { question: 'What is 100°C in Fahrenheit?', answer: '<p>100 × 9/5 + 32 = 212°F, the boiling point of water at sea level.</p>' },
                { question: 'What is normal body temperature in Fahrenheit?', answer: '<p>37°C converts to 98.6°F, the traditionally cited average human body temperature.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.en, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-celsiya-v-farengejt', title: 'Калькулятор Цельсия в Фаренгейт', h1: 'Калькулятор Цельсия в Фаренгейт',
            meta_title: 'Цельсий в Фаренгейт | Конвертер °C в °F',
            meta_description: 'Конвертируйте Цельсий в Фаренгейт мгновенно с помощью этого простого калькулятора температуры.',
            short_answer: 'Этот калькулятор конвертирует температуру в Цельсиях в Фаренгейты, например 20°C = 68°F.',
            intro_text: '<p>Введите температуру в Цельсиях, чтобы мгновенно увидеть эквивалент в Фаренгейтах — полезно для готовки, погоды или сравнения показаний из США.</p>',
            key_points: [
                '<b>Формула:</b> °F = °C × 9/5 + 32.',
                '<b>Пример:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Опорные точки:</b> 0°C = 32°F (замерзание), 37°C = 98,6°F (температура тела), 100°C = 212°F (кипение).',
            ],
            howto: [
                { question: 'Сколько это 100°C в Фаренгейтах?', answer: '<p>100 × 9/5 + 32 = 212°F, точка кипения воды на уровне моря.</p>' },
                { question: 'Какая нормальная температура тела в Фаренгейтах?', answer: '<p>37°C соответствует 98,6°F, традиционно указываемой средней температуре тела человека.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.ru, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'celsija-uz-farenheita-kalkulators', title: 'Celsija uz Fārenheita Kalkulators', h1: 'Celsija uz Fārenheita Kalkulators',
            meta_title: 'Celsijs uz Fārenheitu | °C uz °F Konvertēšana',
            meta_description: 'Konvertējiet Celsiju uz Fārenheitu acumirklī ar šo vienkāršo temperatūras kalkulatoru.',
            short_answer: 'Šis kalkulators konvertē Celsija temperatūru uz Fārenheitu, piemēram, 20°C = 68°F.',
            intro_text: '<p>Ievadiet temperatūru Celsijos, lai uzreiz redzētu tās Fārenheita ekvivalentu — noderīgi gatavošanai, laikapstākļiem vai ASV rādījumu salīdzināšanai.</p>',
            key_points: [
                '<b>Formula:</b> °F = °C × 9/5 + 32.',
                '<b>Piemērs:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Atskaites punkti:</b> 0°C = 32°F (sasalšana), 37°C = 98,6°F (ķermeņa temperatūra), 100°C = 212°F (vārīšanās).',
            ],
            howto: [
                { question: 'Cik ir 100°C Fārenheitos?', answer: '<p>100 × 9/5 + 32 = 212°F, ūdens vārīšanās punkts jūras līmenī.</p>' },
                { question: 'Kāda ir normāla ķermeņa temperatūra Fārenheitos?', answer: '<p>37°C atbilst 98,6°F, tradicionāli minētajai vidējai cilvēka ķermeņa temperatūrai.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.lv, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-celsjusza-na-fahrenheita', title: 'Kalkulator Celsjusza na Fahrenheita', h1: 'Kalkulator Celsjusza na Fahrenheita',
            meta_title: 'Celsjusz na Fahrenheita | Konwerter °C na °F',
            meta_description: 'Przelicz Celsjusza na Fahrenheita natychmiast za pomocą tego prostego kalkulatora temperatury.',
            short_answer: 'Ten kalkulator przelicza temperaturę w Celsjuszach na Fahrenheity, np. 20°C = 68°F.',
            intro_text: '<p>Wpisz temperaturę w Celsjuszach, aby natychmiast zobaczyć jej odpowiednik w Fahrenheitach — przydatne do gotowania, pogody lub porównywania odczytów z USA.</p>',
            key_points: [
                '<b>Wzór:</b> °F = °C × 9/5 + 32.',
                '<b>Przykład:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Punkty odniesienia:</b> 0°C = 32°F (zamarzanie), 37°C = 98,6°F (temperatura ciała), 100°C = 212°F (wrzenie).',
            ],
            howto: [
                { question: 'Ile to 100°C w Fahrenheitach?', answer: '<p>100 × 9/5 + 32 = 212°F, temperatura wrzenia wody na poziomie morza.</p>' },
                { question: 'Jaka jest normalna temperatura ciała w Fahrenheitach?', answer: '<p>37°C odpowiada 98,6°F, tradycyjnie podawanej średniej temperaturze ciała człowieka.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.pl, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-celsius-a-fahrenheit', title: 'Calculadora de Celsius a Fahrenheit', h1: 'Calculadora de Celsius a Fahrenheit',
            meta_title: 'Celsius a Fahrenheit | Conversión de °C a °F',
            meta_description: 'Convierte Celsius a Fahrenheit al instante con esta sencilla calculadora de temperatura.',
            short_answer: 'Esta calculadora convierte una temperatura en Celsius a Fahrenheit, p. ej. 20°C = 68°F.',
            intro_text: '<p>Introduce una temperatura en Celsius para ver al instante su equivalente en Fahrenheit — útil para cocinar, el clima o comparar lecturas de EE. UU.</p>',
            key_points: [
                '<b>Fórmula:</b> °F = °C × 9/5 + 32.',
                '<b>Ejemplo:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Puntos de referencia:</b> 0°C = 32°F (congelación), 37°C = 98,6°F (temperatura corporal), 100°C = 212°F (ebullición).',
            ],
            howto: [
                { question: '¿Cuánto es 100°C en Fahrenheit?', answer: '<p>100 × 9/5 + 32 = 212°F, el punto de ebullición del agua al nivel del mar.</p>' },
                { question: '¿Cuál es la temperatura corporal normal en Fahrenheit?', answer: '<p>37°C equivale a 98,6°F, la temperatura corporal humana promedio tradicionalmente citada.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.es, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-celsius-en-fahrenheit', title: 'Calculateur de Celsius en Fahrenheit', h1: 'Calculateur de Celsius en Fahrenheit',
            meta_title: 'Celsius en Fahrenheit | Conversion de °C en °F',
            meta_description: 'Convertissez Celsius en Fahrenheit instantanément avec ce calculateur de température simple.',
            short_answer: 'Ce calculateur convertit une température Celsius en Fahrenheit, ex. 20°C = 68°F.',
            intro_text: '<p>Entrez une température en Celsius pour voir instantanément son équivalent en Fahrenheit — utile pour la cuisine, la météo ou comparer des relevés américains.</p>',
            key_points: [
                '<b>Formule :</b> °F = °C × 9/5 + 32.',
                '<b>Exemple :</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Points de référence :</b> 0°C = 32°F (congélation), 37°C = 98,6°F (température corporelle), 100°C = 212°F (ébullition).',
            ],
            howto: [
                { question: 'Combien font 100°C en Fahrenheit ?', answer: '<p>100 × 9/5 + 32 = 212°F, le point d’ébullition de l’eau au niveau de la mer.</p>' },
                { question: 'Quelle est la température corporelle normale en Fahrenheit ?', answer: '<p>37°C équivaut à 98,6°F, la température corporelle humaine moyenne traditionnellement citée.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.fr, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-da-celsius-a-fahrenheit', title: 'Calcolatore da Celsius a Fahrenheit', h1: 'Calcolatore da Celsius a Fahrenheit',
            meta_title: 'Celsius in Fahrenheit | Conversione da °C a °F',
            meta_description: 'Converti Celsius in Fahrenheit istantaneamente con questo semplice calcolatore di temperatura.',
            short_answer: 'Questo calcolatore converte una temperatura Celsius in Fahrenheit, es. 20°C = 68°F.',
            intro_text: '<p>Inserisci una temperatura in Celsius per vedere subito il suo equivalente in Fahrenheit — utile per cucinare, il meteo o confrontare letture statunitensi.</p>',
            key_points: [
                '<b>Formula:</b> °F = °C × 9/5 + 32.',
                '<b>Esempio:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Punti di riferimento:</b> 0°C = 32°F (congelamento), 37°C = 98,6°F (temperatura corporea), 100°C = 212°F (ebollizione).',
            ],
            howto: [
                { question: 'Quanto sono 100°C in Fahrenheit?', answer: '<p>100 × 9/5 + 32 = 212°F, il punto di ebollizione dell’acqua al livello del mare.</p>' },
                { question: 'Qual è la normale temperatura corporea in Fahrenheit?', answer: '<p>37°C equivale a 98,6°F, la temperatura corporea umana media tradizionalmente citata.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.it, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'celsius-in-fahrenheit-rechner', title: 'Celsius in Fahrenheit Rechner', h1: 'Celsius in Fahrenheit Rechner',
            meta_title: 'Celsius in Fahrenheit | Umrechnung von °C in °F',
            meta_description: 'Rechnen Sie Celsius sofort in Fahrenheit um mit diesem einfachen Temperaturrechner.',
            short_answer: 'Dieser Rechner wandelt eine Celsius-Temperatur in Fahrenheit um, z.B. 20°C = 68°F.',
            intro_text: '<p>Geben Sie eine Temperatur in Celsius ein, um sofort ihr Fahrenheit-Äquivalent zu sehen — nützlich zum Kochen, für Wetter oder zum Vergleichen US-amerikanischer Angaben.</p>',
            key_points: [
                '<b>Formel:</b> °F = °C × 9/5 + 32.',
                '<b>Beispiel:</b> 20°C × 9/5 + 32 = 68°F.',
                '<b>Referenzpunkte:</b> 0°C = 32°F (Gefrierpunkt), 37°C = 98,6°F (Körpertemperatur), 100°C = 212°F (Siedepunkt).',
            ],
            howto: [
                { question: 'Was sind 100°C in Fahrenheit?', answer: '<p>100 × 9/5 + 32 = 212°F, der Siedepunkt von Wasser auf Meereshöhe.</p>' },
                { question: 'Was ist die normale Körpertemperatur in Fahrenheit?', answer: '<p>37°C entspricht 98,6°F, der traditionell zitierten durchschnittlichen menschlichen Körpertemperatur.</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.de, type: 'number', min: -273.15, max: 1000000, placeholder: '20' }],
            outputs: [{ name: 'result', label: FAHRENHEIT_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1135: Fahrenheit to Celsius Calculator
// ============================================================
const fahrenheitToCelsiusTool: ToolDef = {
    id: '1135',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 68 }],
        functions: { result: { type: 'function', functionName: 'fahrenheitToCelsius', params: { value: 'value' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'fahrenheit-to-celsius-calculator', title: 'Fahrenheit to Celsius Calculator', h1: 'Fahrenheit to Celsius Calculator',
            meta_title: 'Fahrenheit to Celsius Calculator | °F to °C Conversion',
            meta_description: 'Convert Fahrenheit to Celsius instantly with this simple temperature calculator.',
            short_answer: 'This calculator converts a Fahrenheit temperature into Celsius, e.g. 68°F = 20°C.',
            intro_text: '<p>Enter a temperature in Fahrenheit to instantly see its Celsius equivalent — useful for cooking, weather, or reading international temperature scales.</p>',
            key_points: [
                '<b>Formula:</b> °C = (°F − 32) × 5/9.',
                '<b>Example:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Reference points:</b> 32°F = 0°C (freezing), 98.6°F = 37°C (body temperature), 212°F = 100°C (boiling).',
            ],
            howto: [
                { question: 'What is 0°F in Celsius?', answer: '<p>(0 − 32) × 5/9 = -17.78°C.</p>' },
                { question: 'What is room temperature in Celsius?', answer: '<p>A common "room temperature" of 70°F converts to about 21.1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.en, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-farengejta-v-celsiy', title: 'Калькулятор Фаренгейта в Цельсий', h1: 'Калькулятор Фаренгейта в Цельсий',
            meta_title: 'Фаренгейт в Цельсий | Конвертер °F в °C',
            meta_description: 'Конвертируйте Фаренгейт в Цельсий мгновенно с помощью этого простого калькулятора температуры.',
            short_answer: 'Этот калькулятор конвертирует температуру в Фаренгейтах в Цельсии, например 68°F = 20°C.',
            intro_text: '<p>Введите температуру в Фаренгейтах, чтобы мгновенно увидеть эквивалент в Цельсиях — полезно для готовки, погоды или чтения международных шкал.</p>',
            key_points: [
                '<b>Формула:</b> °C = (°F − 32) × 5/9.',
                '<b>Пример:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Опорные точки:</b> 32°F = 0°C (замерзание), 98,6°F = 37°C (температура тела), 212°F = 100°C (кипение).',
            ],
            howto: [
                { question: 'Сколько это 0°F в Цельсиях?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: 'Какая комнатная температура в Цельсиях?', answer: '<p>Обычная «комнатная температура» 70°F соответствует примерно 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.ru, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'farenheita-uz-celsija-kalkulators', title: 'Fārenheita uz Celsija Kalkulators', h1: 'Fārenheita uz Celsija Kalkulators',
            meta_title: 'Fārenheits uz Celsiju | °F uz °C Konvertēšana',
            meta_description: 'Konvertējiet Fārenheitu uz Celsiju acumirklī ar šo vienkāršo temperatūras kalkulatoru.',
            short_answer: 'Šis kalkulators konvertē Fārenheita temperatūru uz Celsiju, piemēram, 68°F = 20°C.',
            intro_text: '<p>Ievadiet temperatūru Fārenheitos, lai uzreiz redzētu tās Celsija ekvivalentu — noderīgi gatavošanai, laikapstākļiem vai starptautisko skalu lasīšanai.</p>',
            key_points: [
                '<b>Formula:</b> °C = (°F − 32) × 5/9.',
                '<b>Piemērs:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Atskaites punkti:</b> 32°F = 0°C (sasalšana), 98,6°F = 37°C (ķermeņa temperatūra), 212°F = 100°C (vārīšanās).',
            ],
            howto: [
                { question: 'Cik ir 0°F Celsijos?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: 'Kāda ir istabas temperatūra Celsijos?', answer: '<p>Parastā "istabas temperatūra" 70°F atbilst apmēram 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.lv, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-fahrenheita-na-celsjusza', title: 'Kalkulator Fahrenheita na Celsjusza', h1: 'Kalkulator Fahrenheita na Celsjusza',
            meta_title: 'Fahrenheit na Celsjusza | Konwerter °F na °C',
            meta_description: 'Przelicz Fahrenheita na Celsjusza natychmiast za pomocą tego prostego kalkulatora temperatury.',
            short_answer: 'Ten kalkulator przelicza temperaturę w Fahrenheitach na Celsjusze, np. 68°F = 20°C.',
            intro_text: '<p>Wpisz temperaturę w Fahrenheitach, aby natychmiast zobaczyć jej odpowiednik w Celsjuszach — przydatne do gotowania, pogody lub odczytywania skal międzynarodowych.</p>',
            key_points: [
                '<b>Wzór:</b> °C = (°F − 32) × 5/9.',
                '<b>Przykład:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Punkty odniesienia:</b> 32°F = 0°C (zamarzanie), 98,6°F = 37°C (temperatura ciała), 212°F = 100°C (wrzenie).',
            ],
            howto: [
                { question: 'Ile to 0°F w Celsjuszach?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: 'Jaka jest temperatura pokojowa w Celsjuszach?', answer: '<p>Typowa "temperatura pokojowa" 70°F odpowiada około 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.pl, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-fahrenheit-a-celsius', title: 'Calculadora de Fahrenheit a Celsius', h1: 'Calculadora de Fahrenheit a Celsius',
            meta_title: 'Fahrenheit a Celsius | Conversión de °F a °C',
            meta_description: 'Convierte Fahrenheit a Celsius al instante con esta sencilla calculadora de temperatura.',
            short_answer: 'Esta calculadora convierte una temperatura en Fahrenheit a Celsius, p. ej. 68°F = 20°C.',
            intro_text: '<p>Introduce una temperatura en Fahrenheit para ver al instante su equivalente en Celsius — útil para cocinar, el clima o leer escalas internacionales.</p>',
            key_points: [
                '<b>Fórmula:</b> °C = (°F − 32) × 5/9.',
                '<b>Ejemplo:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Puntos de referencia:</b> 32°F = 0°C (congelación), 98,6°F = 37°C (temperatura corporal), 212°F = 100°C (ebullición).',
            ],
            howto: [
                { question: '¿Cuánto es 0°F en Celsius?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: '¿Cuál es la temperatura ambiente en Celsius?', answer: '<p>Una "temperatura ambiente" común de 70°F equivale a unos 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.es, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-fahrenheit-en-celsius', title: 'Calculateur de Fahrenheit en Celsius', h1: 'Calculateur de Fahrenheit en Celsius',
            meta_title: 'Fahrenheit en Celsius | Conversion de °F en °C',
            meta_description: 'Convertissez Fahrenheit en Celsius instantanément avec ce calculateur de température simple.',
            short_answer: 'Ce calculateur convertit une température Fahrenheit en Celsius, ex. 68°F = 20°C.',
            intro_text: '<p>Entrez une température en Fahrenheit pour voir instantanément son équivalent en Celsius — utile pour la cuisine, la météo ou lire des échelles internationales.</p>',
            key_points: [
                '<b>Formule :</b> °C = (°F − 32) × 5/9.',
                '<b>Exemple :</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Points de référence :</b> 32°F = 0°C (congélation), 98,6°F = 37°C (température corporelle), 212°F = 100°C (ébullition).',
            ],
            howto: [
                { question: 'Combien font 0°F en Celsius ?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: 'Quelle est la température ambiante en Celsius ?', answer: '<p>Une "température ambiante" courante de 70°F équivaut à environ 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.fr, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-da-fahrenheit-a-celsius', title: 'Calcolatore da Fahrenheit a Celsius', h1: 'Calcolatore da Fahrenheit a Celsius',
            meta_title: 'Fahrenheit in Celsius | Conversione da °F a °C',
            meta_description: 'Converti Fahrenheit in Celsius istantaneamente con questo semplice calcolatore di temperatura.',
            short_answer: 'Questo calcolatore converte una temperatura Fahrenheit in Celsius, es. 68°F = 20°C.',
            intro_text: '<p>Inserisci una temperatura in Fahrenheit per vedere subito il suo equivalente in Celsius — utile per cucinare, il meteo o leggere scale internazionali.</p>',
            key_points: [
                '<b>Formula:</b> °C = (°F − 32) × 5/9.',
                '<b>Esempio:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Punti di riferimento:</b> 32°F = 0°C (congelamento), 98,6°F = 37°C (temperatura corporea), 212°F = 100°C (ebollizione).',
            ],
            howto: [
                { question: 'Quanto è 0°F in Celsius?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: 'Qual è la temperatura ambiente in Celsius?', answer: '<p>Una comune "temperatura ambiente" di 70°F equivale a circa 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.it, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'fahrenheit-in-celsius-rechner', title: 'Fahrenheit in Celsius Rechner', h1: 'Fahrenheit in Celsius Rechner',
            meta_title: 'Fahrenheit in Celsius | Umrechnung von °F in °C',
            meta_description: 'Rechnen Sie Fahrenheit sofort in Celsius um mit diesem einfachen Temperaturrechner.',
            short_answer: 'Dieser Rechner wandelt eine Fahrenheit-Temperatur in Celsius um, z.B. 68°F = 20°C.',
            intro_text: '<p>Geben Sie eine Temperatur in Fahrenheit ein, um sofort ihr Celsius-Äquivalent zu sehen — nützlich zum Kochen, für Wetter oder zum Lesen internationaler Skalen.</p>',
            key_points: [
                '<b>Formel:</b> °C = (°F − 32) × 5/9.',
                '<b>Beispiel:</b> (68 − 32) × 5/9 = 20°C.',
                '<b>Referenzpunkte:</b> 32°F = 0°C (Gefrierpunkt), 98,6°F = 37°C (Körpertemperatur), 212°F = 100°C (Siedepunkt).',
            ],
            howto: [
                { question: 'Was sind 0°F in Celsius?', answer: '<p>(0 − 32) × 5/9 = -17,78°C.</p>' },
                { question: 'Was ist Raumtemperatur in Celsius?', answer: '<p>Eine übliche "Raumtemperatur" von 70°F entspricht etwa 21,1°C.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.de, type: 'number', min: -1000000, max: 1000000, placeholder: '68' }],
            outputs: [{ name: 'result', label: CELSIUS_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1136: Celsius to Kelvin Calculator
// ============================================================
const celsiusToKelvinTool: ToolDef = {
    id: '1136',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 25 }],
        functions: { result: { type: 'function', functionName: 'celsiusToKelvin', params: { value: 'value' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'celsius-to-kelvin-calculator', title: 'Celsius to Kelvin Calculator', h1: 'Celsius to Kelvin Calculator',
            meta_title: 'Celsius to Kelvin Calculator | °C to K Conversion',
            meta_description: 'Convert Celsius to Kelvin instantly with this simple temperature calculator.',
            short_answer: 'This calculator converts a Celsius temperature into Kelvin, e.g. 25°C = 298.15 K.',
            intro_text: '<p>Enter a temperature in Celsius to instantly see its Kelvin equivalent — the standard unit for absolute/scientific temperature measurements.</p>',
            key_points: [
                '<b>Formula:</b> K = °C + 273.15.',
                '<b>Example:</b> 25°C + 273.15 = 298.15 K.',
                '<b>Absolute zero:</b> 0 K equals -273.15°C, the coldest theoretically possible temperature.',
            ],
            howto: [
                { question: 'What is 0°C in Kelvin?', answer: '<p>0 + 273.15 = 273.15 K, the freezing point of water.</p>' },
                { question: 'Why is there no "degrees" symbol for Kelvin?', answer: '<p>Kelvin is an absolute scale, so values are written simply as "K" (e.g. 300 K), not "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.en, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-celsiya-v-kelvin', title: 'Калькулятор Цельсия в Кельвин', h1: 'Калькулятор Цельсия в Кельвин',
            meta_title: 'Цельсий в Кельвин | Конвертер °C в K',
            meta_description: 'Конвертируйте Цельсий в Кельвин мгновенно с помощью этого простого калькулятора температуры.',
            short_answer: 'Этот калькулятор конвертирует температуру в Цельсиях в Кельвины, например 25°C = 298,15 K.',
            intro_text: '<p>Введите температуру в Цельсиях, чтобы мгновенно увидеть эквивалент в Кельвинах — стандартную единицу для абсолютных/научных измерений.</p>',
            key_points: [
                '<b>Формула:</b> K = °C + 273,15.',
                '<b>Пример:</b> 25°C + 273,15 = 298,15 K.',
                '<b>Абсолютный ноль:</b> 0 K равен -273,15°C, теоретически самая холодная возможная температура.',
            ],
            howto: [
                { question: 'Сколько это 0°C в Кельвинах?', answer: '<p>0 + 273,15 = 273,15 K, точка замерзания воды.</p>' },
                { question: 'Почему у Кельвина нет символа «градус»?', answer: '<p>Кельвин — абсолютная шкала, поэтому значения пишутся просто как «K» (например, 300 K), а не «°K».</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.ru, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'celsija-uz-kelvina-kalkulators', title: 'Celsija uz Kelvina Kalkulators', h1: 'Celsija uz Kelvina Kalkulators',
            meta_title: 'Celsijs uz Kelviniem | °C uz K Konvertēšana',
            meta_description: 'Konvertējiet Celsiju uz Kelviniem acumirklī ar šo vienkāršo temperatūras kalkulatoru.',
            short_answer: 'Šis kalkulators konvertē Celsija temperatūru uz Kelviniem, piemēram, 25°C = 298,15 K.',
            intro_text: '<p>Ievadiet temperatūru Celsijos, lai uzreiz redzētu tās Kelvinu ekvivalentu — standarta vienību absolūtiem/zinātniskiem mērījumiem.</p>',
            key_points: [
                '<b>Formula:</b> K = °C + 273,15.',
                '<b>Piemērs:</b> 25°C + 273,15 = 298,15 K.',
                '<b>Absolūtā nulle:</b> 0 K ir vienāds ar -273,15°C, teorētiski aukstākā iespējamā temperatūra.',
            ],
            howto: [
                { question: 'Cik ir 0°C Kelvinos?', answer: '<p>0 + 273,15 = 273,15 K, ūdens sasalšanas punkts.</p>' },
                { question: 'Kāpēc Kelviniem nav "grādu" simbola?', answer: '<p>Kelvini ir absolūtā skala, tāpēc vērtības raksta vienkārši kā "K" (piemēram, 300 K), nevis "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.lv, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-celsjusza-na-kelwiny', title: 'Kalkulator Celsjusza na Kelwiny', h1: 'Kalkulator Celsjusza na Kelwiny',
            meta_title: 'Celsjusz na Kelwiny | Konwerter °C na K',
            meta_description: 'Przelicz Celsjusza na Kelwiny natychmiast za pomocą tego prostego kalkulatora temperatury.',
            short_answer: 'Ten kalkulator przelicza temperaturę w Celsjuszach na Kelwiny, np. 25°C = 298,15 K.',
            intro_text: '<p>Wpisz temperaturę w Celsjuszach, aby natychmiast zobaczyć jej odpowiednik w Kelwinach — standardowej jednostce dla bezwzględnych/naukowych pomiarów.</p>',
            key_points: [
                '<b>Wzór:</b> K = °C + 273,15.',
                '<b>Przykład:</b> 25°C + 273,15 = 298,15 K.',
                '<b>Zero absolutne:</b> 0 K to -273,15°C, teoretycznie najzimniejsza możliwa temperatura.',
            ],
            howto: [
                { question: 'Ile to 0°C w Kelwinach?', answer: '<p>0 + 273,15 = 273,15 K, temperatura zamarzania wody.</p>' },
                { question: 'Dlaczego Kelwiny nie mają symbolu "stopnia"?', answer: '<p>Kelwiny to skala bezwzględna, więc wartości zapisuje się po prostu jako "K" (np. 300 K), a nie "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.pl, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-celsius-a-kelvin', title: 'Calculadora de Celsius a Kelvin', h1: 'Calculadora de Celsius a Kelvin',
            meta_title: 'Celsius a Kelvin | Conversión de °C a K',
            meta_description: 'Convierte Celsius a Kelvin al instante con esta sencilla calculadora de temperatura.',
            short_answer: 'Esta calculadora convierte una temperatura en Celsius a Kelvin, p. ej. 25°C = 298,15 K.',
            intro_text: '<p>Introduce una temperatura en Celsius para ver al instante su equivalente en Kelvin — la unidad estándar para mediciones científicas absolutas.</p>',
            key_points: [
                '<b>Fórmula:</b> K = °C + 273,15.',
                '<b>Ejemplo:</b> 25°C + 273,15 = 298,15 K.',
                '<b>Cero absoluto:</b> 0 K equivale a -273,15°C, la temperatura teóricamente más fría posible.',
            ],
            howto: [
                { question: '¿Cuánto es 0°C en Kelvin?', answer: '<p>0 + 273,15 = 273,15 K, el punto de congelación del agua.</p>' },
                { question: '¿Por qué Kelvin no tiene símbolo de "grados"?', answer: '<p>Kelvin es una escala absoluta, por lo que los valores se escriben simplemente como "K" (p. ej. 300 K), no "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.es, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-celsius-en-kelvin', title: 'Calculateur de Celsius en Kelvin', h1: 'Calculateur de Celsius en Kelvin',
            meta_title: 'Celsius en Kelvin | Conversion de °C en K',
            meta_description: 'Convertissez Celsius en Kelvin instantanément avec ce calculateur de température simple.',
            short_answer: 'Ce calculateur convertit une température Celsius en Kelvin, ex. 25°C = 298,15 K.',
            intro_text: '<p>Entrez une température en Celsius pour voir instantanément son équivalent en Kelvin — l’unité standard pour les mesures scientifiques absolues.</p>',
            key_points: [
                '<b>Formule :</b> K = °C + 273,15.',
                '<b>Exemple :</b> 25°C + 273,15 = 298,15 K.',
                '<b>Zéro absolu :</b> 0 K équivaut à -273,15°C, la température la plus froide théoriquement possible.',
            ],
            howto: [
                { question: 'Combien font 0°C en Kelvin ?', answer: '<p>0 + 273,15 = 273,15 K, le point de congélation de l’eau.</p>' },
                { question: 'Pourquoi le Kelvin n’a-t-il pas de symbole "degré" ?', answer: '<p>Le Kelvin est une échelle absolue, donc les valeurs s’écrivent simplement "K" (ex. 300 K), pas "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.fr, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-da-celsius-a-kelvin', title: 'Calcolatore da Celsius a Kelvin', h1: 'Calcolatore da Celsius a Kelvin',
            meta_title: 'Celsius in Kelvin | Conversione da °C a K',
            meta_description: 'Converti Celsius in Kelvin istantaneamente con questo semplice calcolatore di temperatura.',
            short_answer: 'Questo calcolatore converte una temperatura Celsius in Kelvin, es. 25°C = 298,15 K.',
            intro_text: '<p>Inserisci una temperatura in Celsius per vedere subito il suo equivalente in Kelvin — l’unità standard per le misurazioni scientifiche assolute.</p>',
            key_points: [
                '<b>Formula:</b> K = °C + 273,15.',
                '<b>Esempio:</b> 25°C + 273,15 = 298,15 K.',
                '<b>Zero assoluto:</b> 0 K equivale a -273,15°C, la temperatura teoricamente più fredda possibile.',
            ],
            howto: [
                { question: 'Quanto è 0°C in Kelvin?', answer: '<p>0 + 273,15 = 273,15 K, il punto di congelamento dell’acqua.</p>' },
                { question: 'Perché Kelvin non ha il simbolo "gradi"?', answer: '<p>Kelvin è una scala assoluta, quindi i valori si scrivono semplicemente come "K" (es. 300 K), non "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.it, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'celsius-in-kelvin-rechner', title: 'Celsius in Kelvin Rechner', h1: 'Celsius in Kelvin Rechner',
            meta_title: 'Celsius in Kelvin | Umrechnung von °C in K',
            meta_description: 'Rechnen Sie Celsius sofort in Kelvin um mit diesem einfachen Temperaturrechner.',
            short_answer: 'Dieser Rechner wandelt eine Celsius-Temperatur in Kelvin um, z.B. 25°C = 298,15 K.',
            intro_text: '<p>Geben Sie eine Temperatur in Celsius ein, um sofort ihr Kelvin-Äquivalent zu sehen — die Standardeinheit für absolute/wissenschaftliche Messungen.</p>',
            key_points: [
                '<b>Formel:</b> K = °C + 273,15.',
                '<b>Beispiel:</b> 25°C + 273,15 = 298,15 K.',
                '<b>Absoluter Nullpunkt:</b> 0 K entspricht -273,15°C, der theoretisch kältesten möglichen Temperatur.',
            ],
            howto: [
                { question: 'Was sind 0°C in Kelvin?', answer: '<p>0 + 273,15 = 273,15 K, der Gefrierpunkt von Wasser.</p>' },
                { question: 'Warum hat Kelvin kein "Grad"-Symbol?', answer: '<p>Kelvin ist eine absolute Skala, daher werden Werte einfach als "K" geschrieben (z.B. 300 K), nicht "°K".</p>' },
            ],
            inputs: [{ name: 'value', label: CELSIUS_LABEL.de, type: 'number', min: -273.15, max: 1000000, placeholder: '25' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1137: Fahrenheit to Kelvin Calculator
// ============================================================
const fahrenheitToKelvinTool: ToolDef = {
    id: '1137',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 98.6 }],
        functions: { result: { type: 'function', functionName: 'fahrenheitToKelvin', params: { value: 'value' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'fahrenheit-to-kelvin-calculator', title: 'Fahrenheit to Kelvin Calculator', h1: 'Fahrenheit to Kelvin Calculator',
            meta_title: 'Fahrenheit to Kelvin Calculator | °F to K Conversion',
            meta_description: 'Convert Fahrenheit to Kelvin instantly with this simple temperature calculator.',
            short_answer: 'This calculator converts a Fahrenheit temperature into Kelvin, e.g. 98.6°F = 310.15 K.',
            intro_text: '<p>Enter a temperature in Fahrenheit to instantly see its Kelvin equivalent — combines the Fahrenheit-to-Celsius and Celsius-to-Kelvin steps into one calculation.</p>',
            key_points: [
                '<b>Formula:</b> K = (°F − 32) × 5/9 + 273.15.',
                '<b>Example:</b> (98.6 − 32) × 5/9 + 273.15 = 310.15 K.',
                '<b>Reference point:</b> 32°F (freezing) equals 273.15 K.',
            ],
            howto: [
                { question: 'What is 32°F in Kelvin?', answer: '<p>(32 − 32) × 5/9 + 273.15 = 273.15 K, the freezing point of water.</p>' },
                { question: 'What is absolute zero in Fahrenheit?', answer: '<p>0 K equals -459.67°F, the coldest theoretically possible temperature.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.en, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-farengejta-v-kelvin', title: 'Калькулятор Фаренгейта в Кельвин', h1: 'Калькулятор Фаренгейта в Кельвин',
            meta_title: 'Фаренгейт в Кельвин | Конвертер °F в K',
            meta_description: 'Конвертируйте Фаренгейт в Кельвин мгновенно с помощью этого простого калькулятора температуры.',
            short_answer: 'Этот калькулятор конвертирует температуру в Фаренгейтах в Кельвины, например 98,6°F = 310,15 K.',
            intro_text: '<p>Введите температуру в Фаренгейтах, чтобы мгновенно увидеть эквивалент в Кельвинах — объединяет шаги Фаренгейт→Цельсий и Цельсий→Кельвин в один расчёт.</p>',
            key_points: [
                '<b>Формула:</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Пример:</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Опорная точка:</b> 32°F (замерзание) равно 273,15 K.',
            ],
            howto: [
                { question: 'Сколько это 32°F в Кельвинах?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, точка замерзания воды.</p>' },
                { question: 'Что такое абсолютный ноль в Фаренгейтах?', answer: '<p>0 K равен -459,67°F, теоретически самая холодная возможная температура.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.ru, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'farenheita-uz-kelvina-kalkulators', title: 'Fārenheita uz Kelvina Kalkulators', h1: 'Fārenheita uz Kelvina Kalkulators',
            meta_title: 'Fārenheits uz Kelviniem | °F uz K Konvertēšana',
            meta_description: 'Konvertējiet Fārenheitu uz Kelviniem acumirklī ar šo vienkāršo temperatūras kalkulatoru.',
            short_answer: 'Šis kalkulators konvertē Fārenheita temperatūru uz Kelviniem, piemēram, 98,6°F = 310,15 K.',
            intro_text: '<p>Ievadiet temperatūru Fārenheitos, lai uzreiz redzētu tās Kelvinu ekvivalentu — apvieno Fārenheits→Celsijs un Celsijs→Kelvini soļus vienā aprēķinā.</p>',
            key_points: [
                '<b>Formula:</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Piemērs:</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Atskaites punkts:</b> 32°F (sasalšana) ir vienāds ar 273,15 K.',
            ],
            howto: [
                { question: 'Cik ir 32°F Kelvinos?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, ūdens sasalšanas punkts.</p>' },
                { question: 'Kas ir absolūtā nulle Fārenheitos?', answer: '<p>0 K ir vienāds ar -459,67°F, teorētiski aukstākā iespējamā temperatūra.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.lv, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-fahrenheita-na-kelwiny', title: 'Kalkulator Fahrenheita na Kelwiny', h1: 'Kalkulator Fahrenheita na Kelwiny',
            meta_title: 'Fahrenheit na Kelwiny | Konwerter °F na K',
            meta_description: 'Przelicz Fahrenheita na Kelwiny natychmiast za pomocą tego prostego kalkulatora temperatury.',
            short_answer: 'Ten kalkulator przelicza temperaturę w Fahrenheitach na Kelwiny, np. 98,6°F = 310,15 K.',
            intro_text: '<p>Wpisz temperaturę w Fahrenheitach, aby natychmiast zobaczyć jej odpowiednik w Kelwinach — łączy kroki Fahrenheit→Celsjusz i Celsjusz→Kelwiny w jedno obliczenie.</p>',
            key_points: [
                '<b>Wzór:</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Przykład:</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Punkt odniesienia:</b> 32°F (zamarzanie) to 273,15 K.',
            ],
            howto: [
                { question: 'Ile to 32°F w Kelwinach?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, temperatura zamarzania wody.</p>' },
                { question: 'Co to jest zero absolutne w Fahrenheitach?', answer: '<p>0 K to -459,67°F, teoretycznie najzimniejsza możliwa temperatura.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.pl, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-fahrenheit-a-kelvin', title: 'Calculadora de Fahrenheit a Kelvin', h1: 'Calculadora de Fahrenheit a Kelvin',
            meta_title: 'Fahrenheit a Kelvin | Conversión de °F a K',
            meta_description: 'Convierte Fahrenheit a Kelvin al instante con esta sencilla calculadora de temperatura.',
            short_answer: 'Esta calculadora convierte una temperatura en Fahrenheit a Kelvin, p. ej. 98,6°F = 310,15 K.',
            intro_text: '<p>Introduce una temperatura en Fahrenheit para ver al instante su equivalente en Kelvin — combina los pasos de Fahrenheit a Celsius y Celsius a Kelvin en un solo cálculo.</p>',
            key_points: [
                '<b>Fórmula:</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Ejemplo:</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Punto de referencia:</b> 32°F (congelación) equivale a 273,15 K.',
            ],
            howto: [
                { question: '¿Cuánto es 32°F en Kelvin?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, el punto de congelación del agua.</p>' },
                { question: '¿Qué es el cero absoluto en Fahrenheit?', answer: '<p>0 K equivale a -459,67°F, la temperatura teóricamente más fría posible.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.es, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-fahrenheit-en-kelvin', title: 'Calculateur de Fahrenheit en Kelvin', h1: 'Calculateur de Fahrenheit en Kelvin',
            meta_title: 'Fahrenheit en Kelvin | Conversion de °F en K',
            meta_description: 'Convertissez Fahrenheit en Kelvin instantanément avec ce calculateur de température simple.',
            short_answer: 'Ce calculateur convertit une température Fahrenheit en Kelvin, ex. 98,6°F = 310,15 K.',
            intro_text: '<p>Entrez une température en Fahrenheit pour voir instantanément son équivalent en Kelvin — combine les étapes Fahrenheit vers Celsius et Celsius vers Kelvin en un seul calcul.</p>',
            key_points: [
                '<b>Formule :</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Exemple :</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Point de référence :</b> 32°F (congélation) équivaut à 273,15 K.',
            ],
            howto: [
                { question: 'Combien font 32°F en Kelvin ?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, le point de congélation de l’eau.</p>' },
                { question: 'Qu’est-ce que le zéro absolu en Fahrenheit ?', answer: '<p>0 K équivaut à -459,67°F, la température la plus froide théoriquement possible.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.fr, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-da-fahrenheit-a-kelvin', title: 'Calcolatore da Fahrenheit a Kelvin', h1: 'Calcolatore da Fahrenheit a Kelvin',
            meta_title: 'Fahrenheit in Kelvin | Conversione da °F a K',
            meta_description: 'Converti Fahrenheit in Kelvin istantaneamente con questo semplice calcolatore di temperatura.',
            short_answer: 'Questo calcolatore converte una temperatura Fahrenheit in Kelvin, es. 98,6°F = 310,15 K.',
            intro_text: '<p>Inserisci una temperatura in Fahrenheit per vedere subito il suo equivalente in Kelvin — combina i passaggi da Fahrenheit a Celsius e da Celsius a Kelvin in un unico calcolo.</p>',
            key_points: [
                '<b>Formula:</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Esempio:</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Punto di riferimento:</b> 32°F (congelamento) equivale a 273,15 K.',
            ],
            howto: [
                { question: 'Quanto è 32°F in Kelvin?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, il punto di congelamento dell’acqua.</p>' },
                { question: 'Cos’è lo zero assoluto in Fahrenheit?', answer: '<p>0 K equivale a -459,67°F, la temperatura teoricamente più fredda possibile.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.it, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'fahrenheit-in-kelvin-rechner', title: 'Fahrenheit in Kelvin Rechner', h1: 'Fahrenheit in Kelvin Rechner',
            meta_title: 'Fahrenheit in Kelvin | Umrechnung von °F in K',
            meta_description: 'Rechnen Sie Fahrenheit sofort in Kelvin um mit diesem einfachen Temperaturrechner.',
            short_answer: 'Dieser Rechner wandelt eine Fahrenheit-Temperatur in Kelvin um, z.B. 98,6°F = 310,15 K.',
            intro_text: '<p>Geben Sie eine Temperatur in Fahrenheit ein, um sofort ihr Kelvin-Äquivalent zu sehen — kombiniert die Schritte Fahrenheit zu Celsius und Celsius zu Kelvin in einer Berechnung.</p>',
            key_points: [
                '<b>Formel:</b> K = (°F − 32) × 5/9 + 273,15.',
                '<b>Beispiel:</b> (98,6 − 32) × 5/9 + 273,15 = 310,15 K.',
                '<b>Referenzpunkt:</b> 32°F (Gefrierpunkt) entspricht 273,15 K.',
            ],
            howto: [
                { question: 'Was sind 32°F in Kelvin?', answer: '<p>(32 − 32) × 5/9 + 273,15 = 273,15 K, der Gefrierpunkt von Wasser.</p>' },
                { question: 'Was ist der absolute Nullpunkt in Fahrenheit?', answer: '<p>0 K entspricht -459,67°F, der theoretisch kältesten möglichen Temperatur.</p>' },
            ],
            inputs: [{ name: 'value', label: FAHRENHEIT_LABEL.de, type: 'number', min: -459.67, max: 1000000, placeholder: '98.6' }],
            outputs: [{ name: 'result', label: KELVIN_LABEL.de, precision: 2 }],
        },
    },
}

function tempUnitSelectOptions(lang: string) {
    const l: Record<string, [string, string, string]> = {
        en: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'], ru: ['Цельсий (°C)', 'Фаренгейт (°F)', 'Кельвин (K)'],
        de: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'], es: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'],
        fr: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'], it: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'],
        pl: ['Celsjusz (°C)', 'Fahrenheit (°F)', 'Kelwin (K)'], lv: ['Celsijs (°C)', 'Fārenheits (°F)', 'Kelvins (K)'],
    }
    const [c, f, k] = l[lang] || l.en
    return [{ value: 'celsius', label: c }, { value: 'fahrenheit', label: f }, { value: 'kelvin', label: k }]
}
const TEMP1_LABEL: Record<string, string> = { en: 'First Temperature', ru: 'Первая температура', de: 'Erste Temperatur', es: 'Primera Temperatura', fr: 'Première Température', it: 'Prima Temperatura', pl: 'Pierwsza Temperatura', lv: 'Pirmā Temperatūra' }
const TEMP2_LABEL: Record<string, string> = { en: 'Second Temperature', ru: 'Вторая температура', de: 'Zweite Temperatur', es: 'Segunda Temperatura', fr: 'Deuxième Température', it: 'Seconda Temperatura', pl: 'Druga Temperatura', lv: 'Otrā Temperatūra' }
const UNIT_LABEL_TEMP: Record<string, string> = { en: 'Unit', ru: 'Единица', de: 'Einheit', es: 'Unidad', fr: 'Unité', it: 'Unità', pl: 'Jednostka', lv: 'Vienība' }

// ============================================================
// 1138: Temperature Difference Calculator
// ============================================================
const temperatureDifferenceTool: ToolDef = {
    id: '1138',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'temp1', default: 20 }, { key: 'temp2', default: 30 }, { key: 'unit', default: 'celsius' }],
        functions: { result: { type: 'function', functionName: 'temperatureDifference', params: { temp1: 'temp1', temp2: 'temp2', unit: 'unit' } } },
        outputs: [{ key: 'diff_celsius', precision: 2 }, { key: 'diff_fahrenheit', precision: 2 }, { key: 'diff_kelvin', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'temperature-difference-calculator', title: 'Temperature Difference Calculator', h1: 'Temperature Difference Calculator',
            meta_title: 'Temperature Difference Calculator | Compare Two Readings Across Scales',
            meta_description: 'Find the difference between two temperature readings, shown in Celsius, Fahrenheit, and Kelvin.',
            short_answer: 'This calculator finds the difference between two temperatures and shows that difference in Celsius, Fahrenheit, and Kelvin.',
            intro_text: '<p>Enter two temperature readings and their shared unit to see the size of the change between them — expressed in all three major scales, since a temperature <i>difference</i> converts differently than an absolute reading.</p>',
            key_points: [
                '<b>Key distinction:</b> a difference of 1°C or 1 K is always equal to a difference of 1.8°F — degree "sizes" differ between Fahrenheit and Celsius/Kelvin, even though absolute readings need an offset too.',
                '<b>Celsius and Kelvin differences match exactly:</b> since both scales use the same degree size, only the zero point differs.',
                '<b>Example:</b> a rise from 20°C to 30°C is a 10°C difference, equal to an 18°F difference and a 10 K difference.',
            ],
            howto: [
                { question: 'Why is the Fahrenheit difference bigger than the Celsius difference?', answer: '<p>Each Fahrenheit degree is smaller (5/9 the size of a Celsius degree), so the same real change in temperature corresponds to a larger number of Fahrenheit degrees.</p>' },
                { question: 'Does the order of the two temperatures matter?', answer: '<p>No — enter them in either order; a negative result simply means the second temperature is lower than the first.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.en, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.en, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.en, type: 'select', options: tempUnitSelectOptions('en'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Difference (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Difference (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Difference (K)', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-raznicy-temperatur', title: 'Калькулятор разницы температур', h1: 'Калькулятор разницы температур',
            meta_title: 'Калькулятор разницы температур | Сравнение показаний в разных шкалах',
            meta_description: 'Узнайте разницу между двумя показаниями температуры в Цельсиях, Фаренгейтах и Кельвинах.',
            short_answer: 'Этот калькулятор находит разницу между двумя температурами и показывает её в Цельсиях, Фаренгейтах и Кельвинах.',
            intro_text: '<p>Введите два показания температуры и их общую единицу, чтобы увидеть размер изменения между ними — выраженный во всех трёх основных шкалах.</p>',
            key_points: [
                '<b>Ключевое отличие:</b> разница в 1°C или 1 K всегда равна разнице в 1,8°F — размеры градусов различаются.',
                '<b>Разницы в Цельсиях и Кельвинах совпадают точно:</b> обе шкалы используют одинаковый размер градуса.',
                '<b>Пример:</b> повышение с 20°C до 30°C — это разница в 10°C, равная разнице в 18°F и 10 K.',
            ],
            howto: [
                { question: 'Почему разница в Фаренгейтах больше, чем в Цельсиях?', answer: '<p>Каждый градус Фаренгейта меньше (5/9 размера градуса Цельсия), поэтому то же реальное изменение температуры соответствует большему числу градусов Фаренгейта.</p>' },
                { question: 'Имеет ли значение порядок ввода двух температур?', answer: '<p>Нет — вводите их в любом порядке; отрицательный результат просто означает, что вторая температура ниже первой.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.ru, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.ru, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.ru, type: 'select', options: tempUnitSelectOptions('ru'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Разница (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Разница (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Разница (K)', precision: 2 },
            ],
        },
        lv: {
            slug: 'temperaturas-starpibas-kalkulators', title: 'Temperatūras Starpības Kalkulators', h1: 'Temperatūras Starpības Kalkulators',
            meta_title: 'Temperatūras Starpības Kalkulators | Salīdziniet Divus Rādījumus Dažādās Skalās',
            meta_description: 'Uzziniet starpību starp diviem temperatūras rādījumiem Celsijos, Fārenheitos un Kelvinos.',
            short_answer: 'Šis kalkulators atrod starpību starp divām temperatūrām un parāda to Celsijos, Fārenheitos un Kelvinos.',
            intro_text: '<p>Ievadiet divus temperatūras rādījumus un to kopīgo vienību, lai redzētu izmaiņu lielumu starp tiem — izteiktu visās trīs galvenajās skalās.</p>',
            key_points: [
                '<b>Galvenā atšķirība:</b> 1°C vai 1 K starpība vienmēr ir vienāda ar 1,8°F starpību — grādu "izmēri" atšķiras.',
                '<b>Celsija un Kelvina starpības sakrīt precīzi:</b> abas skalas izmanto vienādu grāda izmēru.',
                '<b>Piemērs:</b> pieaugums no 20°C līdz 30°C ir 10°C starpība, kas vienāda ar 18°F starpību un 10 K starpību.',
            ],
            howto: [
                { question: 'Kāpēc Fārenheita starpība ir lielāka nekā Celsija?', answer: '<p>Katrs Fārenheita grāds ir mazāks (5/9 no Celsija grāda izmēra), tāpēc tā pati reālā temperatūras izmaiņa atbilst lielākam Fārenheita grādu skaitam.</p>' },
                { question: 'Vai divu temperatūru secība ir svarīga?', answer: '<p>Nē — ievadiet tās jebkurā secībā; negatīvs rezultāts vienkārši nozīmē, ka otrā temperatūra ir zemāka par pirmo.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.lv, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.lv, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.lv, type: 'select', options: tempUnitSelectOptions('lv'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Starpība (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Starpība (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Starpība (K)', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-roznicy-temperatur', title: 'Kalkulator Różnicy Temperatur', h1: 'Kalkulator Różnicy Temperatur',
            meta_title: 'Kalkulator Różnicy Temperatur | Porównaj Dwa Odczyty w Różnych Skalach',
            meta_description: 'Znajdź różnicę między dwoma odczytami temperatury w Celsjuszach, Fahrenheitach i Kelwinach.',
            short_answer: 'Ten kalkulator znajduje różnicę między dwiema temperaturami i pokazuje ją w Celsjuszach, Fahrenheitach i Kelwinach.',
            intro_text: '<p>Wprowadź dwa odczyty temperatury i ich wspólną jednostkę, aby zobaczyć wielkość zmiany między nimi — wyrażoną we wszystkich trzech głównych skalach.</p>',
            key_points: [
                '<b>Kluczowa różnica:</b> różnica 1°C lub 1 K zawsze równa się różnicy 1,8°F — "rozmiary" stopni różnią się.',
                '<b>Różnice w Celsjuszach i Kelwinach są dokładnie takie same:</b> obie skale używają tego samego rozmiaru stopnia.',
                '<b>Przykład:</b> wzrost z 20°C do 30°C to różnica 10°C, równa różnicy 18°F i różnicy 10 K.',
            ],
            howto: [
                { question: 'Dlaczego różnica w Fahrenheitach jest większa niż w Celsjuszach?', answer: '<p>Każdy stopień Fahrenheita jest mniejszy (5/9 rozmiaru stopnia Celsjusza), więc ta sama rzeczywista zmiana temperatury odpowiada większej liczbie stopni Fahrenheita.</p>' },
                { question: 'Czy kolejność wprowadzania dwóch temperatur ma znaczenie?', answer: '<p>Nie — wpisz je w dowolnej kolejności; ujemny wynik oznacza po prostu, że druga temperatura jest niższa od pierwszej.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.pl, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.pl, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.pl, type: 'select', options: tempUnitSelectOptions('pl'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Różnica (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Różnica (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Różnica (K)', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-diferencia-de-temperatura', title: 'Calculadora de Diferencia de Temperatura', h1: 'Calculadora de Diferencia de Temperatura',
            meta_title: 'Calculadora de Diferencia de Temperatura | Compara Dos Lecturas en Distintas Escalas',
            meta_description: 'Encuentra la diferencia entre dos lecturas de temperatura, mostrada en Celsius, Fahrenheit y Kelvin.',
            short_answer: 'Esta calculadora encuentra la diferencia entre dos temperaturas y la muestra en Celsius, Fahrenheit y Kelvin.',
            intro_text: '<p>Introduce dos lecturas de temperatura y su unidad compartida para ver el tamaño del cambio entre ellas — expresado en las tres escalas principales.</p>',
            key_points: [
                '<b>Distinción clave:</b> una diferencia de 1°C o 1 K siempre equivale a una diferencia de 1,8°F — los "tamaños" de grado difieren.',
                '<b>Las diferencias en Celsius y Kelvin coinciden exactamente:</b> ambas escalas usan el mismo tamaño de grado.',
                '<b>Ejemplo:</b> un aumento de 20°C a 30°C es una diferencia de 10°C, igual a una diferencia de 18°F y 10 K.',
            ],
            howto: [
                { question: '¿Por qué la diferencia en Fahrenheit es mayor que en Celsius?', answer: '<p>Cada grado Fahrenheit es más pequeño (5/9 del tamaño de un grado Celsius), así que el mismo cambio real de temperatura corresponde a más grados Fahrenheit.</p>' },
                { question: '¿Importa el orden de las dos temperaturas?', answer: '<p>No — introdúcelas en cualquier orden; un resultado negativo simplemente significa que la segunda temperatura es más baja que la primera.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.es, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.es, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.es, type: 'select', options: tempUnitSelectOptions('es'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Diferencia (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Diferencia (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Diferencia (K)', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-difference-de-temperature', title: 'Calculateur de Différence de Température', h1: 'Calculateur de Différence de Température',
            meta_title: 'Calculateur de Différence de Température | Comparez Deux Relevés Selon les Échelles',
            meta_description: 'Trouvez la différence entre deux relevés de température, affichée en Celsius, Fahrenheit et Kelvin.',
            short_answer: 'Ce calculateur trouve la différence entre deux températures et l’affiche en Celsius, Fahrenheit et Kelvin.',
            intro_text: '<p>Entrez deux relevés de température et leur unité commune pour voir l’ampleur du changement entre eux — exprimé dans les trois échelles principales.</p>',
            key_points: [
                '<b>Distinction clé :</b> une différence de 1°C ou 1 K équivaut toujours à une différence de 1,8°F — les "tailles" de degré diffèrent.',
                '<b>Les différences en Celsius et Kelvin correspondent exactement :</b> les deux échelles utilisent la même taille de degré.',
                '<b>Exemple :</b> une hausse de 20°C à 30°C est une différence de 10°C, égale à une différence de 18°F et de 10 K.',
            ],
            howto: [
                { question: 'Pourquoi la différence en Fahrenheit est-elle plus grande qu’en Celsius ?', answer: '<p>Chaque degré Fahrenheit est plus petit (5/9 de la taille d’un degré Celsius), donc le même changement réel de température correspond à plus de degrés Fahrenheit.</p>' },
                { question: 'L’ordre des deux températures compte-t-il ?', answer: '<p>Non — entrez-les dans n’importe quel ordre ; un résultat négatif signifie simplement que la seconde température est plus basse que la première.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.fr, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.fr, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.fr, type: 'select', options: tempUnitSelectOptions('fr'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Différence (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Différence (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Différence (K)', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-differenza-di-temperatura', title: 'Calcolatore di Differenza di Temperatura', h1: 'Calcolatore di Differenza di Temperatura',
            meta_title: 'Calcolatore di Differenza di Temperatura | Confronta Due Letture tra Scale',
            meta_description: 'Trova la differenza tra due letture di temperatura, mostrata in Celsius, Fahrenheit e Kelvin.',
            short_answer: 'Questo calcolatore trova la differenza tra due temperature e la mostra in Celsius, Fahrenheit e Kelvin.',
            intro_text: '<p>Inserisci due letture di temperatura e la loro unità condivisa per vedere l’entità del cambiamento tra loro — espresso in tutte e tre le scale principali.</p>',
            key_points: [
                '<b>Distinzione chiave:</b> una differenza di 1°C o 1 K equivale sempre a una differenza di 1,8°F — le "dimensioni" dei gradi differiscono.',
                '<b>Le differenze in Celsius e Kelvin corrispondono esattamente:</b> entrambe le scale usano la stessa dimensione di grado.',
                '<b>Esempio:</b> un aumento da 20°C a 30°C è una differenza di 10°C, uguale a una differenza di 18°F e 10 K.',
            ],
            howto: [
                { question: 'Perché la differenza in Fahrenheit è maggiore di quella in Celsius?', answer: '<p>Ogni grado Fahrenheit è più piccolo (5/9 della dimensione di un grado Celsius), quindi lo stesso cambiamento reale di temperatura corrisponde a più gradi Fahrenheit.</p>' },
                { question: 'L’ordine delle due temperature conta?', answer: '<p>No — inseriscile in qualsiasi ordine; un risultato negativo significa semplicemente che la seconda temperatura è più bassa della prima.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.it, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.it, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.it, type: 'select', options: tempUnitSelectOptions('it'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Differenza (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Differenza (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Differenza (K)', precision: 2 },
            ],
        },
        de: {
            slug: 'temperaturunterschied-rechner', title: 'Temperaturunterschied-Rechner', h1: 'Temperaturunterschied-Rechner',
            meta_title: 'Temperaturunterschied-Rechner | Zwei Messwerte über Skalen Vergleichen',
            meta_description: 'Finden Sie den Unterschied zwischen zwei Temperaturmesswerten, angezeigt in Celsius, Fahrenheit und Kelvin.',
            short_answer: 'Dieser Rechner findet den Unterschied zwischen zwei Temperaturen und zeigt ihn in Celsius, Fahrenheit und Kelvin an.',
            intro_text: '<p>Geben Sie zwei Temperaturmesswerte und ihre gemeinsame Einheit ein, um die Größe der Veränderung zwischen ihnen zu sehen — ausgedrückt in allen drei wichtigen Skalen.</p>',
            key_points: [
                '<b>Wichtiger Unterschied:</b> eine Differenz von 1°C oder 1 K entspricht immer einer Differenz von 1,8°F — die Grad-"Größen" unterscheiden sich.',
                '<b>Celsius- und Kelvin-Differenzen stimmen genau überein:</b> beide Skalen verwenden die gleiche Gradgröße.',
                '<b>Beispiel:</b> ein Anstieg von 20°C auf 30°C ist eine Differenz von 10°C, gleich einer Differenz von 18°F und 10 K.',
            ],
            howto: [
                { question: 'Warum ist die Fahrenheit-Differenz größer als die Celsius-Differenz?', answer: '<p>Jedes Fahrenheit-Grad ist kleiner (5/9 der Größe eines Celsius-Grads), sodass dieselbe reale Temperaturänderung einer größeren Anzahl von Fahrenheit-Graden entspricht.</p>' },
                { question: 'Spielt die Reihenfolge der beiden Temperaturen eine Rolle?', answer: '<p>Nein — geben Sie sie in beliebiger Reihenfolge ein; ein negatives Ergebnis bedeutet einfach, dass die zweite Temperatur niedriger als die erste ist.</p>' },
            ],
            inputs: [
                { name: 'temp1', label: TEMP1_LABEL.de, type: 'number', min: -1000000, max: 1000000, placeholder: '20' },
                { name: 'temp2', label: TEMP2_LABEL.de, type: 'number', min: -1000000, max: 1000000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL_TEMP.de, type: 'select', options: tempUnitSelectOptions('de'), default: 'celsius' },
            ],
            outputs: [
                { name: 'diff_celsius', label: 'Differenz (°C)', precision: 2 },
                { name: 'diff_fahrenheit', label: 'Differenz (°F)', precision: 2 },
                { name: 'diff_kelvin', label: 'Differenz (K)', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1139: Angle Converter (general multi-unit)
// ============================================================
const angleConverterTool: ToolDef = {
    id: '1139',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 90 }, { key: 'from_unit', default: 'degree' }, { key: 'to_unit', default: 'radian' }],
        functions: { result: { type: 'function', functionName: 'angleConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } } },
        outputs: [{ key: 'result', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'angle-converter', title: 'Angle Converter', h1: 'Angle Converter',
            meta_title: 'Angle Converter | Degrees, Radians, Gradians, Arcminutes, Arcseconds, Turns',
            meta_description: 'Convert between degrees, radians, gradians, arcminutes, arcseconds, and turns instantly.',
            short_answer: 'This converter changes an angle value between degrees, radians, gradians, arcminutes, arcseconds, and turns using the selectors below.',
            intro_text: '<p>Angles are measured in different units depending on the field — degrees in everyday and navigation contexts, radians in mathematics and physics, gradians in some surveying traditions, and arcminutes/arcseconds for very precise angles like those in astronomy.</p><p>This tool converts between all six directly.</p>',
            key_points: [
                '<b>Key factors:</b> 1 radian ≈ 57.2958°; 1 gradian = 0.9°; 1 arcminute = 1/60°; 1 arcsecond = 1/3600°; 1 turn = 360°.',
                '<b>Radians and π:</b> a full circle is 2π radians, and 180° equals exactly π radians.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the six supported angle units.',
            ],
            howto: [
                { question: 'How do I convert degrees to radians?', answer: '<p>Multiply the degree value by π/180, or select "Degrees" as From and "Radians" as To in this converter.</p>' },
                { question: 'What is a gradian used for?', answer: '<p>Gradians divide a right angle into 100 units instead of 90, which some surveying and military instruments use for simpler decimal math.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.en, type: 'select', options: angleUnitOptions('en') },
                { name: 'to_unit', label: TO_LABEL.en, type: 'select', options: angleUnitOptions('en') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.en, unitFrom: 'to_unit', precision: 6 }],
        },
        ru: {
            slug: 'konverter-uglov', title: 'Конвертер углов', h1: 'Конвертер углов',
            meta_title: 'Конвертер углов | Градусы, радианы, грады, угловые минуты и секунды, обороты',
            meta_description: 'Конвертируйте между градусами, радианами, градами, угловыми минутами, секундами и оборотами мгновенно.',
            short_answer: 'Этот конвертер переводит значение угла между градусами, радианами, градами, угловыми минутами, секундами и оборотами.',
            intro_text: '<p>Углы измеряются в разных единицах в зависимости от области — градусы в повседневных и навигационных контекстах, радианы в математике и физике, грады в некоторых традициях геодезии.</p><p>Этот инструмент конвертирует между всеми шестью напрямую.</p>',
            key_points: [
                '<b>Ключевые коэффициенты:</b> 1 радиан ≈ 57,2958°; 1 град = 0,9°; 1 угловая минута = 1/60°; 1 угловая секунда = 1/3600°; 1 оборот = 360°.',
                '<b>Радианы и π:</b> полный круг составляет 2π радиан, а 180° равны точно π радиан.',
                '<b>Полностью гибкий:</b> измените любой список, чтобы конвертировать между любыми двумя из шести единиц.',
            ],
            howto: [
                { question: 'Как перевести градусы в радианы?', answer: '<p>Умножьте значение в градусах на π/180, или выберите «Градусы» как Из и «Радианы» как В в этом конвертере.</p>' },
                { question: 'Для чего используется град?', answer: '<p>Грады делят прямой угол на 100 единиц вместо 90, что некоторые геодезические и военные инструменты используют для упрощения десятичных расчётов.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.ru, type: 'select', options: angleUnitOptions('ru') },
                { name: 'to_unit', label: TO_LABEL.ru, type: 'select', options: angleUnitOptions('ru') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.ru, unitFrom: 'to_unit', precision: 6 }],
        },
        lv: {
            slug: 'lenku-konvertetajs', title: 'Leņķu Konvertētājs', h1: 'Leņķu Konvertētājs',
            meta_title: 'Leņķu Konvertētājs | Grādi, Radiāni, Grādieni, Loka Minūtes un Sekundes, Apgriezieni',
            meta_description: 'Konvertējiet starp grādiem, radiāniem, grādieniem, loka minūtēm, sekundēm un apgriezieniem acumirklī.',
            short_answer: 'Šis konvertētājs pārrēķina leņķa vērtību starp grādiem, radiāniem, grādieniem, loka minūtēm, sekundēm un apgriezieniem.',
            intro_text: '<p>Leņķi tiek mērīti dažādās vienībās atkarībā no jomas — grādi ikdienas un navigācijas kontekstos, radiāni matemātikā un fizikā, grādieni dažās ģeodēzijas tradīcijās.</p><p>Šis rīks konvertē starp visām sešām tieši.</p>',
            key_points: [
                '<b>Galvenie koeficienti:</b> 1 radiāns ≈ 57,2958°; 1 grādiens = 0,9°; 1 loka minūte = 1/60°; 1 loka sekunde = 1/3600°; 1 apgrieziens = 360°.',
                '<b>Radiāni un π:</b> pilns aplis ir 2π radiāni, un 180° ir tieši π radiāni.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru sarakstu, lai konvertētu starp jebkurām divām no sešām vienībām.',
            ],
            howto: [
                { question: 'Kā konvertēt grādus uz radiāniem?', answer: '<p>Reiziniet grādu vērtību ar π/180, vai izvēlieties "Grādi" kā No un "Radiāni" kā Uz šajā konvertētājā.</p>' },
                { question: 'Kam izmanto grādienu?', answer: '<p>Grādieni sadala taisno leņķi 100 vienībās, nevis 90, ko daži ģeodēzijas un militārie instrumenti izmanto vienkāršākai decimālai matemātikai.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.lv, type: 'select', options: angleUnitOptions('lv') },
                { name: 'to_unit', label: TO_LABEL.lv, type: 'select', options: angleUnitOptions('lv') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.lv, unitFrom: 'to_unit', precision: 6 }],
        },
        pl: {
            slug: 'konwerter-katow', title: 'Konwerter Kątów', h1: 'Konwerter Kątów',
            meta_title: 'Konwerter Kątów | Stopnie, Radiany, Grady, Minuty i Sekundy Kątowe, Obroty',
            meta_description: 'Przelicz między stopniami, radianami, gradami, minutami i sekundami kątowymi oraz obrotami natychmiast.',
            short_answer: 'Ten konwerter przelicza wartość kąta między stopniami, radianami, gradami, minutami i sekundami kątowymi oraz obrotami.',
            intro_text: '<p>Kąty są mierzone w różnych jednostkach w zależności od dziedziny — stopnie w codziennych i nawigacyjnych kontekstach, radiany w matematyce i fizyce, grady w niektórych tradycjach geodezyjnych.</p><p>To narzędzie przelicza między wszystkimi sześcioma bezpośrednio.</p>',
            key_points: [
                '<b>Kluczowe współczynniki:</b> 1 radian ≈ 57,2958°; 1 grad = 0,9°; 1 minuta kątowa = 1/60°; 1 sekunda kątowa = 1/3600°; 1 obrót = 360°.',
                '<b>Radiany i π:</b> pełne koło to 2π radianów, a 180° to dokładnie π radianów.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę, aby przeliczyć między dowolnymi dwiema z sześciu jednostek.',
            ],
            howto: [
                { question: 'Jak przeliczyć stopnie na radiany?', answer: '<p>Pomnóż wartość w stopniach przez π/180, lub wybierz "Stopnie" jako Z i "Radiany" jako Na w tym konwerterze.</p>' },
                { question: 'Do czego służy grad?', answer: '<p>Grady dzielą kąt prosty na 100 jednostek zamiast 90, co niektóre instrumenty geodezyjne i wojskowe wykorzystują dla prostszej matematyki dziesiętnej.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.pl, type: 'select', options: angleUnitOptions('pl') },
                { name: 'to_unit', label: TO_LABEL.pl, type: 'select', options: angleUnitOptions('pl') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.pl, unitFrom: 'to_unit', precision: 6 }],
        },
        es: {
            slug: 'convertidor-de-angulos', title: 'Convertidor de Ángulos', h1: 'Convertidor de Ángulos',
            meta_title: 'Convertidor de Ángulos | Grados, Radianes, Gradianes, Minutos y Segundos de Arco, Vueltas',
            meta_description: 'Convierte entre grados, radianes, gradianes, minutos y segundos de arco, y vueltas al instante.',
            short_answer: 'Este convertidor cambia un valor de ángulo entre grados, radianes, gradianes, minutos y segundos de arco, y vueltas.',
            intro_text: '<p>Los ángulos se miden en diferentes unidades según el campo — grados en contextos cotidianos y de navegación, radianes en matemáticas y física, gradianes en algunas tradiciones topográficas.</p><p>Esta herramienta convierte entre las seis directamente.</p>',
            key_points: [
                '<b>Factores clave:</b> 1 radián ≈ 57,2958°; 1 gradián = 0,9°; 1 minuto de arco = 1/60°; 1 segundo de arco = 1/3600°; 1 vuelta = 360°.',
                '<b>Radianes y π:</b> un círculo completo son 2π radianes, y 180° equivalen exactamente a π radianes.',
                '<b>Totalmente flexible:</b> cambia cualquier lista para convertir entre cualquiera de las seis unidades.',
            ],
            howto: [
                { question: '¿Cómo convierto grados a radianes?', answer: '<p>Multiplica el valor en grados por π/180, o selecciona "Grados" como De y "Radianes" como A en este convertidor.</p>' },
                { question: '¿Para qué se usa un gradián?', answer: '<p>Los gradianes dividen un ángulo recto en 100 unidades en lugar de 90, lo que algunos instrumentos topográficos y militares usan para simplificar cálculos decimales.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.es, type: 'select', options: angleUnitOptions('es') },
                { name: 'to_unit', label: TO_LABEL.es, type: 'select', options: angleUnitOptions('es') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.es, unitFrom: 'to_unit', precision: 6 }],
        },
        fr: {
            slug: 'convertisseur-dangles', title: 'Convertisseur d’Angles', h1: 'Convertisseur d’Angles',
            meta_title: 'Convertisseur d’Angles | Degrés, Radians, Grades, Minutes et Secondes d’Arc, Tours',
            meta_description: 'Convertissez entre degrés, radians, grades, minutes et secondes d’arc, et tours instantanément.',
            short_answer: 'Ce convertisseur change une valeur d’angle entre degrés, radians, grades, minutes et secondes d’arc, et tours.',
            intro_text: '<p>Les angles sont mesurés dans différentes unités selon le domaine — degrés dans les contextes quotidiens et de navigation, radians en mathématiques et physique, grades dans certaines traditions topographiques.</p><p>Cet outil convertit entre les six directement.</p>',
            key_points: [
                '<b>Facteurs clés :</b> 1 radian ≈ 57,2958° ; 1 grade = 0,9° ; 1 minute d’arc = 1/60° ; 1 seconde d’arc = 1/3600° ; 1 tour = 360°.',
                '<b>Radians et π :</b> un cercle complet fait 2π radians, et 180° équivaut exactement à π radians.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste pour convertir entre deux des six unités.',
            ],
            howto: [
                { question: 'Comment convertir des degrés en radians ?', answer: '<p>Multipliez la valeur en degrés par π/180, ou sélectionnez "Degrés" comme De et "Radians" comme Vers dans ce convertisseur.</p>' },
                { question: 'À quoi sert un grade ?', answer: '<p>Les grades divisent un angle droit en 100 unités au lieu de 90, ce que certains instruments topographiques et militaires utilisent pour simplifier les calculs décimaux.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.fr, type: 'select', options: angleUnitOptions('fr') },
                { name: 'to_unit', label: TO_LABEL.fr, type: 'select', options: angleUnitOptions('fr') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.fr, unitFrom: 'to_unit', precision: 6 }],
        },
        it: {
            slug: 'convertitore-di-angoli', title: 'Convertitore di Angoli', h1: 'Convertitore di Angoli',
            meta_title: 'Convertitore di Angoli | Gradi, Radianti, Gradi Centesimali, Primi e Secondi d’Arco, Giri',
            meta_description: 'Converti tra gradi, radianti, gradi centesimali, primi e secondi d’arco, e giri istantaneamente.',
            short_answer: 'Questo convertitore cambia un valore di angolo tra gradi, radianti, gradi centesimali, primi e secondi d’arco, e giri.',
            intro_text: '<p>Gli angoli si misurano in unità diverse a seconda del campo — gradi in contesti quotidiani e di navigazione, radianti in matematica e fisica, gradi centesimali in alcune tradizioni topografiche.</p><p>Questo strumento converte tra tutti e sei direttamente.</p>',
            key_points: [
                '<b>Fattori chiave:</b> 1 radiante ≈ 57,2958°; 1 grado centesimale = 0,9°; 1 primo d’arco = 1/60°; 1 secondo d’arco = 1/3600°; 1 giro = 360°.',
                '<b>Radianti e π:</b> un cerchio completo è 2π radianti, e 180° equivale esattamente a π radianti.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu per convertire tra due delle sei unità.',
            ],
            howto: [
                { question: 'Come converto i gradi in radianti?', answer: '<p>Moltiplica il valore in gradi per π/180, oppure seleziona "Gradi" come Da e "Radianti" come A in questo convertitore.</p>' },
                { question: 'A cosa serve un grado centesimale?', answer: '<p>I gradi centesimali dividono un angolo retto in 100 unità invece di 90, il che alcuni strumenti topografici e militari usano per semplificare i calcoli decimali.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.it, type: 'select', options: angleUnitOptions('it') },
                { name: 'to_unit', label: TO_LABEL.it, type: 'select', options: angleUnitOptions('it') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.it, unitFrom: 'to_unit', precision: 6 }],
        },
        de: {
            slug: 'winkel-umrechner', title: 'Winkel-Umrechner', h1: 'Winkel-Umrechner',
            meta_title: 'Winkel-Umrechner | Grad, Radiant, Gon, Bogenminuten und -sekunden, Umdrehungen',
            meta_description: 'Rechnen Sie zwischen Grad, Radiant, Gon, Bogenminuten und -sekunden sowie Umdrehungen sofort um.',
            short_answer: 'Dieser Umrechner wandelt einen Winkelwert zwischen Grad, Radiant, Gon, Bogenminuten und -sekunden sowie Umdrehungen um.',
            intro_text: '<p>Winkel werden je nach Fachgebiet in unterschiedlichen Einheiten gemessen — Grad im Alltag und in der Navigation, Radiant in Mathematik und Physik, Gon in manchen Vermessungstraditionen.</p><p>Dieses Tool rechnet direkt zwischen allen sechs um.</p>',
            key_points: [
                '<b>Wichtige Faktoren:</b> 1 Radiant ≈ 57,2958°; 1 Gon = 0,9°; 1 Bogenminute = 1/60°; 1 Bogensekunde = 1/3600°; 1 Umdrehung = 360°.',
                '<b>Radiant und π:</b> ein vollständiger Kreis sind 2π Radiant, und 180° entsprechen genau π Radiant.',
                '<b>Voll flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der sechs unterstützten Winkeleinheiten umzurechnen.',
            ],
            howto: [
                { question: 'Wie rechne ich Grad in Radiant um?', answer: '<p>Multiplizieren Sie den Gradwert mit π/180, oder wählen Sie "Grad" als Von und "Radiant" als Nach in diesem Umrechner.</p>' },
                { question: 'Wofür wird Gon verwendet?', answer: '<p>Gon teilt einen rechten Winkel in 100 statt 90 Einheiten, was manche Vermessungs- und Militärinstrumente für einfachere Dezimalrechnung nutzen.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '90' },
                { name: 'from_unit', label: FROM_LABEL.de, type: 'select', options: angleUnitOptions('de') },
                { name: 'to_unit', label: TO_LABEL.de, type: 'select', options: angleUnitOptions('de') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.de, unitFrom: 'to_unit', precision: 6 }],
        },
    },
}

const DEGREES_LABEL: Record<string, string> = { en: 'Degrees (°)', ru: 'Градусы (°)', de: 'Grad (°)', es: 'Grados (°)', fr: 'Degrés (°)', it: 'Gradi (°)', pl: 'Stopnie (°)', lv: 'Grādi (°)' }
const RADIANS_LABEL: Record<string, string> = { en: 'Radians (rad)', ru: 'Радианы (рад)', de: 'Radiant (rad)', es: 'Radianes (rad)', fr: 'Radians (rad)', it: 'Radianti (rad)', pl: 'Radiany (rad)', lv: 'Radiāni (rad)' }

// ============================================================
// 1140: Degrees to Radians Calculator
// ============================================================
const degreesToRadiansTool: ToolDef = {
    id: '1140',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 180 }],
        functions: { result: { type: 'function', functionName: 'degreesToRadians', params: { value: 'value' } } },
        outputs: [{ key: 'result', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'degrees-to-radians-calculator', title: 'Degrees to Radians Calculator', h1: 'Degrees to Radians Calculator',
            meta_title: 'Degrees to Radians Calculator | Convert ° to rad',
            meta_description: 'Convert degrees to radians instantly with this simple angle calculator.',
            short_answer: 'This calculator converts a degree value into radians, e.g. 180° = π radians ≈ 3.14159.',
            intro_text: '<p>Enter an angle in degrees to instantly see its radian equivalent — radians are the standard angle unit in mathematics, physics, and most programming languages\' trigonometric functions.</p>',
            key_points: [
                '<b>Formula:</b> radians = degrees × (π / 180).',
                '<b>Example:</b> 180° × (π/180) = π ≈ 3.14159 radians.',
                '<b>Common values:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'What is 45° in radians?', answer: '<p>45 × (π/180) = π/4 ≈ 0.7854 radians.</p>' },
                { question: 'Why do programming languages use radians?', answer: '<p>Most math libraries (sin, cos, tan) expect radians because they simplify calculus formulas involving trigonometric functions.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.en, precision: 6 }],
        },
        ru: {
            slug: 'kalkulyator-gradusov-v-radiany', title: 'Калькулятор градусов в радианы', h1: 'Калькулятор градусов в радианы',
            meta_title: 'Градусы в радианы | Конвертер ° в рад',
            meta_description: 'Конвертируйте градусы в радианы мгновенно с помощью этого простого калькулятора углов.',
            short_answer: 'Этот калькулятор конвертирует значение в градусах в радианы, например 180° = π радиан ≈ 3,14159.',
            intro_text: '<p>Введите угол в градусах, чтобы мгновенно увидеть эквивалент в радианах — радианы являются стандартной единицей угла в математике, физике и тригонометрических функциях большинства языков программирования.</p>',
            key_points: [
                '<b>Формула:</b> радианы = градусы × (π / 180).',
                '<b>Пример:</b> 180° × (π/180) = π ≈ 3,14159 радиан.',
                '<b>Частые значения:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'Сколько это 45° в радианах?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 радиан.</p>' },
                { question: 'Почему в языках программирования используются радианы?', answer: '<p>Большинство математических библиотек (sin, cos, tan) ожидают радианы, так как они упрощают формулы математического анализа.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.ru, precision: 6 }],
        },
        lv: {
            slug: 'gradu-uz-radianiem-kalkulators', title: 'Grādu uz Radiāniem Kalkulators', h1: 'Grādu uz Radiāniem Kalkulators',
            meta_title: 'Grādi uz Radiāniem | ° uz rad Konvertēšana',
            meta_description: 'Konvertējiet grādus uz radiāniem acumirklī ar šo vienkāršo leņķa kalkulatoru.',
            short_answer: 'Šis kalkulators konvertē grādu vērtību uz radiāniem, piemēram, 180° = π radiāni ≈ 3,14159.',
            intro_text: '<p>Ievadiet leņķi grādos, lai uzreiz redzētu tā radiānu ekvivalentu — radiāni ir standarta leņķa vienība matemātikā, fizikā un lielākās daļas programmēšanas valodu trigonometriskajās funkcijās.</p>',
            key_points: [
                '<b>Formula:</b> radiāni = grādi × (π / 180).',
                '<b>Piemērs:</b> 180° × (π/180) = π ≈ 3,14159 radiāni.',
                '<b>Biežas vērtības:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'Cik ir 45° radiānos?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 radiāni.</p>' },
                { question: 'Kāpēc programmēšanas valodas izmanto radiānus?', answer: '<p>Lielākā daļa matemātikas bibliotēku (sin, cos, tan) sagaida radiānus, jo tie vienkāršo formulas ar trigonometriskām funkcijām.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.lv, precision: 6 }],
        },
        pl: {
            slug: 'kalkulator-stopni-na-radiany', title: 'Kalkulator Stopni na Radiany', h1: 'Kalkulator Stopni na Radiany',
            meta_title: 'Stopnie na Radiany | Konwerter ° na rad',
            meta_description: 'Przelicz stopnie na radiany natychmiast za pomocą tego prostego kalkulatora kątów.',
            short_answer: 'Ten kalkulator przelicza wartość w stopniach na radiany, np. 180° = π radianów ≈ 3,14159.',
            intro_text: '<p>Wpisz kąt w stopniach, aby natychmiast zobaczyć jego odpowiednik w radianach — radiany są standardową jednostką kąta w matematyce, fizyce i funkcjach trygonometrycznych większości języków programowania.</p>',
            key_points: [
                '<b>Wzór:</b> radiany = stopnie × (π / 180).',
                '<b>Przykład:</b> 180° × (π/180) = π ≈ 3,14159 radianów.',
                '<b>Częste wartości:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'Ile to 45° w radianach?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 radiana.</p>' },
                { question: 'Dlaczego języki programowania używają radianów?', answer: '<p>Większość bibliotek matematycznych (sin, cos, tan) oczekuje radianów, ponieważ upraszczają one formuły analizy matematycznej.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.pl, precision: 6 }],
        },
        es: {
            slug: 'calculadora-de-grados-a-radianes', title: 'Calculadora de Grados a Radianes', h1: 'Calculadora de Grados a Radianes',
            meta_title: 'Grados a Radianes | Conversión de ° a rad',
            meta_description: 'Convierte grados a radianes al instante con esta sencilla calculadora de ángulos.',
            short_answer: 'Esta calculadora convierte un valor en grados a radianes, p. ej. 180° = π radianes ≈ 3,14159.',
            intro_text: '<p>Introduce un ángulo en grados para ver al instante su equivalente en radianes — los radianes son la unidad de ángulo estándar en matemáticas, física y las funciones trigonométricas de la mayoría de los lenguajes de programación.</p>',
            key_points: [
                '<b>Fórmula:</b> radianes = grados × (π / 180).',
                '<b>Ejemplo:</b> 180° × (π/180) = π ≈ 3,14159 radianes.',
                '<b>Valores comunes:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: '¿Cuánto es 45° en radianes?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 radianes.</p>' },
                { question: '¿Por qué los lenguajes de programación usan radianes?', answer: '<p>La mayoría de las bibliotecas matemáticas (sin, cos, tan) esperan radianes porque simplifican fórmulas de cálculo.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.es, precision: 6 }],
        },
        fr: {
            slug: 'calculateur-de-degres-en-radians', title: 'Calculateur de Degrés en Radians', h1: 'Calculateur de Degrés en Radians',
            meta_title: 'Degrés en Radians | Conversion de ° en rad',
            meta_description: 'Convertissez des degrés en radians instantanément avec ce calculateur d’angles simple.',
            short_answer: 'Ce calculateur convertit une valeur en degrés en radians, ex. 180° = π radians ≈ 3,14159.',
            intro_text: '<p>Entrez un angle en degrés pour voir instantanément son équivalent en radians — les radians sont l’unité d’angle standard en mathématiques, physique et dans les fonctions trigonométriques de la plupart des langages de programmation.</p>',
            key_points: [
                '<b>Formule :</b> radians = degrés × (π / 180).',
                '<b>Exemple :</b> 180° × (π/180) = π ≈ 3,14159 radians.',
                '<b>Valeurs courantes :</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'Combien font 45° en radians ?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 radians.</p>' },
                { question: 'Pourquoi les langages de programmation utilisent-ils les radians ?', answer: '<p>La plupart des bibliothèques mathématiques (sin, cos, tan) attendent des radians car ils simplifient les formules de calcul.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.fr, precision: 6 }],
        },
        it: {
            slug: 'calcolatore-da-gradi-a-radianti', title: 'Calcolatore da Gradi a Radianti', h1: 'Calcolatore da Gradi a Radianti',
            meta_title: 'Gradi in Radianti | Conversione da ° a rad',
            meta_description: 'Converti gradi in radianti istantaneamente con questo semplice calcolatore di angoli.',
            short_answer: 'Questo calcolatore converte un valore in gradi in radianti, es. 180° = π radianti ≈ 3,14159.',
            intro_text: '<p>Inserisci un angolo in gradi per vedere subito il suo equivalente in radianti — i radianti sono l’unità di angolo standard in matematica, fisica e nelle funzioni trigonometriche della maggior parte dei linguaggi di programmazione.</p>',
            key_points: [
                '<b>Formula:</b> radianti = gradi × (π / 180).',
                '<b>Esempio:</b> 180° × (π/180) = π ≈ 3,14159 radianti.',
                '<b>Valori comuni:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'Quanto sono 45° in radianti?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 radianti.</p>' },
                { question: 'Perché i linguaggi di programmazione usano i radianti?', answer: '<p>La maggior parte delle librerie matematiche (sin, cos, tan) si aspetta radianti perché semplificano le formule del calcolo.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.it, precision: 6 }],
        },
        de: {
            slug: 'grad-in-radiant-rechner', title: 'Grad in Radiant Rechner', h1: 'Grad in Radiant Rechner',
            meta_title: 'Grad in Radiant | Umrechnung von ° in rad',
            meta_description: 'Rechnen Sie Grad sofort in Radiant um mit diesem einfachen Winkelrechner.',
            short_answer: 'Dieser Rechner wandelt einen Gradwert in Radiant um, z.B. 180° = π Radiant ≈ 3,14159.',
            intro_text: '<p>Geben Sie einen Winkel in Grad ein, um sofort sein Radiant-Äquivalent zu sehen — Radiant ist die Standard-Winkeleinheit in Mathematik, Physik und den trigonometrischen Funktionen der meisten Programmiersprachen.</p>',
            key_points: [
                '<b>Formel:</b> Radiant = Grad × (π / 180).',
                '<b>Beispiel:</b> 180° × (π/180) = π ≈ 3,14159 Radiant.',
                '<b>Häufige Werte:</b> 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π.',
            ],
            howto: [
                { question: 'Was sind 45° in Radiant?', answer: '<p>45 × (π/180) = π/4 ≈ 0,7854 Radiant.</p>' },
                { question: 'Warum verwenden Programmiersprachen Radiant?', answer: '<p>Die meisten Mathematikbibliotheken (sin, cos, tan) erwarten Radiant, da sie Formeln der Analysis vereinfachen.</p>' },
            ],
            inputs: [{ name: 'value', label: DEGREES_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '180' }],
            outputs: [{ name: 'result', label: RADIANS_LABEL.de, precision: 6 }],
        },
    },
}

// ============================================================
// 1141: Radians to Degrees Calculator
// ============================================================
const radiansToDegreesTool: ToolDef = {
    id: '1141',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 3.14159265 }],
        functions: { result: { type: 'function', functionName: 'radiansToDegrees', params: { value: 'value' } } },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'radians-to-degrees-calculator', title: 'Radians to Degrees Calculator', h1: 'Radians to Degrees Calculator',
            meta_title: 'Radians to Degrees Calculator | Convert rad to °',
            meta_description: 'Convert radians to degrees instantly with this simple angle calculator.',
            short_answer: 'This calculator converts a radian value into degrees, e.g. π radians = 180°.',
            intro_text: '<p>Enter an angle in radians to instantly see its degree equivalent — useful when working with math or programming output that uses radians but you want a more intuitive degree reading.</p>',
            key_points: [
                '<b>Formula:</b> degrees = radians × (180 / π).',
                '<b>Example:</b> π × (180/π) = 180°.',
                '<b>Common values:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'What is 1 radian in degrees?', answer: '<p>1 × (180/π) ≈ 57.2958°.</p>' },
                { question: 'How do I enter π in this calculator?', answer: '<p>Type the decimal approximation (3.14159265) since the input only accepts plain numbers.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-radian-v-gradusy', title: 'Калькулятор радиан в градусы', h1: 'Калькулятор радиан в градусы',
            meta_title: 'Радианы в градусы | Конвертер рад в °',
            meta_description: 'Конвертируйте радианы в градусы мгновенно с помощью этого простого калькулятора углов.',
            short_answer: 'Этот калькулятор конвертирует значение в радианах в градусы, например π радиан = 180°.',
            intro_text: '<p>Введите угол в радианах, чтобы мгновенно увидеть эквивалент в градусах — полезно при работе с математическим или программным выводом, использующим радианы.</p>',
            key_points: [
                '<b>Формула:</b> градусы = радианы × (180 / π).',
                '<b>Пример:</b> π × (180/π) = 180°.',
                '<b>Частые значения:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'Сколько это 1 радиан в градусах?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: 'Как ввести π в этом калькуляторе?', answer: '<p>Введите десятичное приближение (3,14159265), так как поле принимает только обычные числа.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'radianu-uz-gradiem-kalkulators', title: 'Radiānu uz Grādiem Kalkulators', h1: 'Radiānu uz Grādiem Kalkulators',
            meta_title: 'Radiāni uz Grādiem | rad uz ° Konvertēšana',
            meta_description: 'Konvertējiet radiānus uz grādiem acumirklī ar šo vienkāršo leņķa kalkulatoru.',
            short_answer: 'Šis kalkulators konvertē radiānu vērtību uz grādiem, piemēram, π radiāni = 180°.',
            intro_text: '<p>Ievadiet leņķi radiānos, lai uzreiz redzētu tā grādu ekvivalentu — noderīgi, strādājot ar matemātikas vai programmēšanas izvadi, kas izmanto radiānus.</p>',
            key_points: [
                '<b>Formula:</b> grādi = radiāni × (180 / π).',
                '<b>Piemērs:</b> π × (180/π) = 180°.',
                '<b>Biežas vērtības:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'Cik ir 1 radiāns grādos?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: 'Kā ievadīt π šajā kalkulatorā?', answer: '<p>Ierakstiet decimālo tuvinājumu (3,14159265), jo lauks pieņem tikai parastus skaitļus.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-radianow-na-stopnie', title: 'Kalkulator Radianów na Stopnie', h1: 'Kalkulator Radianów na Stopnie',
            meta_title: 'Radiany na Stopnie | Konwerter rad na °',
            meta_description: 'Przelicz radiany na stopnie natychmiast za pomocą tego prostego kalkulatora kątów.',
            short_answer: 'Ten kalkulator przelicza wartość w radianach na stopnie, np. π radianów = 180°.',
            intro_text: '<p>Wpisz kąt w radianach, aby natychmiast zobaczyć jego odpowiednik w stopniach — przydatne przy pracy z wynikami matematycznymi lub programistycznymi używającymi radianów.</p>',
            key_points: [
                '<b>Wzór:</b> stopnie = radiany × (180 / π).',
                '<b>Przykład:</b> π × (180/π) = 180°.',
                '<b>Częste wartości:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'Ile to 1 radian w stopniach?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: 'Jak wpisać π w tym kalkulatorze?', answer: '<p>Wpisz przybliżenie dziesiętne (3,14159265), ponieważ pole przyjmuje tylko zwykłe liczby.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-radianes-a-grados', title: 'Calculadora de Radianes a Grados', h1: 'Calculadora de Radianes a Grados',
            meta_title: 'Radianes a Grados | Conversión de rad a °',
            meta_description: 'Convierte radianes a grados al instante con esta sencilla calculadora de ángulos.',
            short_answer: 'Esta calculadora convierte un valor en radianes a grados, p. ej. π radianes = 180°.',
            intro_text: '<p>Introduce un ángulo en radianes para ver al instante su equivalente en grados — útil al trabajar con resultados matemáticos o de programación que usan radianes.</p>',
            key_points: [
                '<b>Fórmula:</b> grados = radianes × (180 / π).',
                '<b>Ejemplo:</b> π × (180/π) = 180°.',
                '<b>Valores comunes:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: '¿Cuánto es 1 radián en grados?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: '¿Cómo introduzco π en esta calculadora?', answer: '<p>Escribe la aproximación decimal (3,14159265), ya que el campo solo acepta números normales.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-radians-en-degres', title: 'Calculateur de Radians en Degrés', h1: 'Calculateur de Radians en Degrés',
            meta_title: 'Radians en Degrés | Conversion de rad en °',
            meta_description: 'Convertissez des radians en degrés instantanément avec ce calculateur d’angles simple.',
            short_answer: 'Ce calculateur convertit une valeur en radians en degrés, ex. π radians = 180°.',
            intro_text: '<p>Entrez un angle en radians pour voir instantanément son équivalent en degrés — utile lorsque vous travaillez avec des résultats mathématiques ou de programmation utilisant des radians.</p>',
            key_points: [
                '<b>Formule :</b> degrés = radians × (180 / π).',
                '<b>Exemple :</b> π × (180/π) = 180°.',
                '<b>Valeurs courantes :</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'Combien fait 1 radian en degrés ?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: 'Comment entrer π dans ce calculateur ?', answer: '<p>Tapez l’approximation décimale (3,14159265), car le champ n’accepte que des nombres simples.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-da-radianti-a-gradi', title: 'Calcolatore da Radianti a Gradi', h1: 'Calcolatore da Radianti a Gradi',
            meta_title: 'Radianti in Gradi | Conversione da rad a °',
            meta_description: 'Converti radianti in gradi istantaneamente con questo semplice calcolatore di angoli.',
            short_answer: 'Questo calcolatore converte un valore in radianti in gradi, es. π radianti = 180°.',
            intro_text: '<p>Inserisci un angolo in radianti per vedere subito il suo equivalente in gradi — utile quando lavori con risultati matematici o di programmazione che usano radianti.</p>',
            key_points: [
                '<b>Formula:</b> gradi = radianti × (180 / π).',
                '<b>Esempio:</b> π × (180/π) = 180°.',
                '<b>Valori comuni:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'Quanto è 1 radiante in gradi?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: 'Come inserisco π in questo calcolatore?', answer: '<p>Digita l’approssimazione decimale (3,14159265), poiché il campo accetta solo numeri normali.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'radiant-in-grad-rechner', title: 'Radiant in Grad Rechner', h1: 'Radiant in Grad Rechner',
            meta_title: 'Radiant in Grad | Umrechnung von rad in °',
            meta_description: 'Rechnen Sie Radiant sofort in Grad um mit diesem einfachen Winkelrechner.',
            short_answer: 'Dieser Rechner wandelt einen Radiant-Wert in Grad um, z.B. π Radiant = 180°.',
            intro_text: '<p>Geben Sie einen Winkel in Radiant ein, um sofort sein Grad-Äquivalent zu sehen — nützlich bei mathematischen oder Programmier-Ausgaben, die Radiant verwenden.</p>',
            key_points: [
                '<b>Formel:</b> Grad = Radiant × (180 / π).',
                '<b>Beispiel:</b> π × (180/π) = 180°.',
                '<b>Häufige Werte:</b> π/2 = 90°, π = 180°, 3π/2 = 270°, 2π = 360°.',
            ],
            howto: [
                { question: 'Was ist 1 Radiant in Grad?', answer: '<p>1 × (180/π) ≈ 57,2958°.</p>' },
                { question: 'Wie gebe ich π in diesem Rechner ein?', answer: '<p>Geben Sie die Dezimalnäherung ein (3,14159265), da das Feld nur einfache Zahlen akzeptiert.</p>' },
            ],
            inputs: [{ name: 'value', label: RADIANS_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '3.14159265' }],
            outputs: [{ name: 'result', label: DEGREES_LABEL.de, precision: 4 }],
        },
    },
}

const DEG_LABEL: Record<string, string> = { en: 'Degrees', ru: 'Градусы', de: 'Grad', es: 'Grados', fr: 'Degrés', it: 'Gradi', pl: 'Stopnie', lv: 'Grādi' }
const MIN_ARC_LABEL: Record<string, string> = { en: 'Minutes', ru: 'Минуты', de: 'Minuten', es: 'Minutos', fr: 'Minutes', it: 'Minuti', pl: 'Minuty', lv: 'Minūtes' }
const SEC_ARC_LABEL: Record<string, string> = { en: 'Seconds', ru: 'Секунды', de: 'Sekunden', es: 'Segundos', fr: 'Secondes', it: 'Secondi', pl: 'Sekundy', lv: 'Sekundes' }
const DECIMAL_DEGREES_LABEL: Record<string, string> = { en: 'Decimal Degrees', ru: 'Десятичные градусы', de: 'Dezimalgrad', es: 'Grados Decimales', fr: 'Degrés Décimaux', it: 'Gradi Decimali', pl: 'Stopnie Dziesiętne', lv: 'Decimālie Grādi' }

// ============================================================
// 1142: Degrees Minutes Seconds to Decimal Degrees Converter
// ============================================================
const dmsToDecimalTool: ToolDef = {
    id: '1142',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'degrees', default: 40 }, { key: 'minutes', default: 26 }, { key: 'seconds', default: 46 }],
        functions: { result: { type: 'function', functionName: 'dmsToDecimalDegrees', params: { degrees: 'degrees', minutes: 'minutes', seconds: 'seconds' } } },
        outputs: [{ key: 'result', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'degrees-minutes-seconds-to-decimal-degrees-converter', title: 'Degrees Minutes Seconds to Decimal Degrees Converter', h1: 'Degrees Minutes Seconds to Decimal Degrees Converter',
            meta_title: 'DMS to Decimal Degrees Converter | Coordinate Format Conversion',
            meta_description: 'Convert degrees, minutes, and seconds (DMS) into decimal degrees instantly — common for GPS coordinates.',
            short_answer: 'This calculator converts a degrees/minutes/seconds (DMS) angle into decimal degrees, e.g. 40°26\'46" = 40.4461°.',
            intro_text: '<p>Geographic coordinates and precise angles are often given in degrees, minutes, and seconds (like 40°26\'46"N) — this tool converts that format into a single decimal degrees number, which is what most mapping software and GPS devices expect.</p>',
            key_points: [
                '<b>Formula:</b> decimal degrees = degrees + minutes/60 + seconds/3600.',
                '<b>Example:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40.4461°.',
                '<b>Negative coordinates:</b> for southern latitudes or western longitudes, enter the degrees value as negative (e.g. -73 for 73°W).',
            ],
            howto: [
                { question: 'How do I enter a southern latitude like 33°52\'04"S?', answer: '<p>Enter -33 as degrees, 52 as minutes, and 4 as seconds — the negative sign carries through to the decimal result.</p>' },
                { question: 'Why do minutes and seconds go up to 60, not 100?', answer: '<p>DMS notation is based on the sexagesimal (base-60) system, the same one used for clock time.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.en, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.en, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.en, precision: 6 }],
        },
        ru: {
            slug: 'konverter-gms-v-decimalnye-gradusy', title: 'Конвертер ГМС в десятичные градусы', h1: 'Конвертер ГМС в десятичные градусы',
            meta_title: 'ГМС в десятичные градусы | Конвертер формата координат',
            meta_description: 'Конвертируйте градусы, минуты и секунды (ГМС) в десятичные градусы мгновенно — часто используется для GPS-координат.',
            short_answer: 'Этот калькулятор конвертирует угол в градусах/минутах/секундах (ГМС) в десятичные градусы, например 40°26\'46" = 40,4461°.',
            intro_text: '<p>Географические координаты и точные углы часто задаются в градусах, минутах и секундах (например, 40°26\'46"с.ш.) — этот инструмент конвертирует такой формат в единое число десятичных градусов.</p>',
            key_points: [
                '<b>Формула:</b> десятичные градусы = градусы + минуты/60 + секунды/3600.',
                '<b>Пример:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Отрицательные координаты:</b> для южных широт или западных долгот вводите значение градусов как отрицательное.',
            ],
            howto: [
                { question: 'Как ввести южную широту вроде 33°52\'04"ю.ш.?', answer: '<p>Введите -33 как градусы, 52 как минуты и 4 как секунды — знак минус переносится в десятичный результат.</p>' },
                { question: 'Почему минуты и секунды доходят до 60, а не до 100?', answer: '<p>Нотация ГМС основана на шестидесятеричной системе, той же, что используется для часового времени.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.ru, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.ru, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.ru, precision: 6 }],
        },
        lv: {
            slug: 'gms-uz-decimalgradiem-konvertetajs', title: 'GMS uz Decimālgrādiem Konvertētājs', h1: 'GMS uz Decimālgrādiem Konvertētājs',
            meta_title: 'GMS uz Decimālgrādiem | Koordinātu Formāta Konvertēšana',
            meta_description: 'Konvertējiet grādus, minūtes un sekundes (GMS) uz decimālgrādiem acumirklī — bieži izmanto GPS koordinātām.',
            short_answer: 'Šis kalkulators konvertē grādu/minūšu/sekunžu (GMS) leņķi uz decimālgrādiem, piemēram, 40°26\'46" = 40,4461°.',
            intro_text: '<p>Ģeogrāfiskās koordinātas un precīzi leņķi bieži tiek doti grādos, minūtēs un sekundēs (piemēram, 40°26\'46"Z) — šis rīks konvertē šo formātu vienā decimālgrādu skaitlī.</p>',
            key_points: [
                '<b>Formula:</b> decimālgrādi = grādi + minūtes/60 + sekundes/3600.',
                '<b>Piemērs:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Negatīvas koordinātas:</b> dienvidu platumiem vai rietumu garumiem ievadiet grādu vērtību kā negatīvu.',
            ],
            howto: [
                { question: 'Kā ievadīt dienvidu platumu, piemēram, 33°52\'04"D?', answer: '<p>Ievadiet -33 kā grādus, 52 kā minūtes un 4 kā sekundes — mīnusa zīme pāriet uz decimālo rezultātu.</p>' },
                { question: 'Kāpēc minūtes un sekundes iet līdz 60, ne 100?', answer: '<p>GMS pieraksts balstās uz sešdesmitnieku sistēmu, to pašu, ko izmanto pulksteņa laikam.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.lv, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.lv, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.lv, precision: 6 }],
        },
        pl: {
            slug: 'konwerter-stopni-minut-sekund-na-stopnie-dziesietne', title: 'Konwerter Stopni Minut Sekund na Stopnie Dziesiętne', h1: 'Konwerter Stopni Minut Sekund na Stopnie Dziesiętne',
            meta_title: 'DMS na Stopnie Dziesiętne | Konwersja Formatu Współrzędnych',
            meta_description: 'Przelicz stopnie, minuty i sekundy (DMS) na stopnie dziesiętne natychmiast — powszechne dla współrzędnych GPS.',
            short_answer: 'Ten kalkulator przelicza kąt w stopniach/minutach/sekundach (DMS) na stopnie dziesiętne, np. 40°26\'46" = 40,4461°.',
            intro_text: '<p>Współrzędne geograficzne i precyzyjne kąty są często podawane w stopniach, minutach i sekundach (np. 40°26\'46"N) — to narzędzie przelicza ten format na pojedynczą liczbę stopni dziesiętnych.</p>',
            key_points: [
                '<b>Wzór:</b> stopnie dziesiętne = stopnie + minuty/60 + sekundy/3600.',
                '<b>Przykład:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Ujemne współrzędne:</b> dla południowych szerokości lub zachodnich długości wpisz wartość stopni jako ujemną.',
            ],
            howto: [
                { question: 'Jak wpisać południową szerokość jak 33°52\'04"S?', answer: '<p>Wpisz -33 jako stopnie, 52 jako minuty i 4 jako sekundy — znak minus przenosi się do wyniku dziesiętnego.</p>' },
                { question: 'Dlaczego minuty i sekundy idą do 60, nie do 100?', answer: '<p>Notacja DMS opiera się na systemie sześćdziesiątkowym, tym samym, który jest używany dla czasu zegarowego.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.pl, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.pl, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.pl, precision: 6 }],
        },
        es: {
            slug: 'convertidor-de-grados-minutos-segundos-a-grados-decimales', title: 'Convertidor de Grados Minutos Segundos a Grados Decimales', h1: 'Convertidor de Grados Minutos Segundos a Grados Decimales',
            meta_title: 'DMS a Grados Decimales | Conversión de Formato de Coordenadas',
            meta_description: 'Convierte grados, minutos y segundos (DMS) a grados decimales al instante — común para coordenadas GPS.',
            short_answer: 'Esta calculadora convierte un ángulo en grados/minutos/segundos (DMS) a grados decimales, p. ej. 40°26\'46" = 40,4461°.',
            intro_text: '<p>Las coordenadas geográficas y ángulos precisos suelen darse en grados, minutos y segundos (como 40°26\'46"N) — esta herramienta convierte ese formato en un único número de grados decimales.</p>',
            key_points: [
                '<b>Fórmula:</b> grados decimales = grados + minutos/60 + segundos/3600.',
                '<b>Ejemplo:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Coordenadas negativas:</b> para latitudes sur o longitudes oeste, introduce el valor de grados como negativo.',
            ],
            howto: [
                { question: '¿Cómo introduzco una latitud sur como 33°52\'04"S?', answer: '<p>Introduce -33 como grados, 52 como minutos y 4 como segundos — el signo negativo se traslada al resultado decimal.</p>' },
                { question: '¿Por qué los minutos y segundos llegan hasta 60, no 100?', answer: '<p>La notación DMS se basa en el sistema sexagesimal, el mismo usado para la hora del reloj.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.es, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.es, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.es, precision: 6 }],
        },
        fr: {
            slug: 'convertisseur-de-degres-minutes-secondes-en-degres-decimaux', title: 'Convertisseur de Degrés Minutes Secondes en Degrés Décimaux', h1: 'Convertisseur de Degrés Minutes Secondes en Degrés Décimaux',
            meta_title: 'DMS en Degrés Décimaux | Conversion de Format de Coordonnées',
            meta_description: 'Convertissez degrés, minutes et secondes (DMS) en degrés décimaux instantanément — courant pour les coordonnées GPS.',
            short_answer: 'Ce calculateur convertit un angle en degrés/minutes/secondes (DMS) en degrés décimaux, ex. 40°26\'46" = 40,4461°.',
            intro_text: '<p>Les coordonnées géographiques et les angles précis sont souvent donnés en degrés, minutes et secondes (comme 40°26\'46"N) — cet outil convertit ce format en un seul nombre de degrés décimaux.</p>',
            key_points: [
                '<b>Formule :</b> degrés décimaux = degrés + minutes/60 + secondes/3600.',
                '<b>Exemple :</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Coordonnées négatives :</b> pour les latitudes sud ou longitudes ouest, entrez la valeur des degrés comme négative.',
            ],
            howto: [
                { question: 'Comment entrer une latitude sud comme 33°52\'04"S ?', answer: '<p>Entrez -33 comme degrés, 52 comme minutes et 4 comme secondes — le signe négatif se répercute sur le résultat décimal.</p>' },
                { question: 'Pourquoi les minutes et secondes vont-elles jusqu’à 60, pas 100 ?', answer: '<p>La notation DMS repose sur le système sexagésimal, le même que celui utilisé pour l’heure.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.fr, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.fr, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.fr, precision: 6 }],
        },
        it: {
            slug: 'convertitore-da-gradi-minuti-secondi-a-gradi-decimali', title: 'Convertitore da Gradi Minuti Secondi a Gradi Decimali', h1: 'Convertitore da Gradi Minuti Secondi a Gradi Decimali',
            meta_title: 'DMS in Gradi Decimali | Conversione Formato Coordinate',
            meta_description: 'Converti gradi, minuti e secondi (DMS) in gradi decimali istantaneamente — comune per le coordinate GPS.',
            short_answer: 'Questo calcolatore converte un angolo in gradi/minuti/secondi (DMS) in gradi decimali, es. 40°26\'46" = 40,4461°.',
            intro_text: '<p>Le coordinate geografiche e gli angoli precisi sono spesso dati in gradi, minuti e secondi (come 40°26\'46"N) — questo strumento converte quel formato in un unico numero di gradi decimali.</p>',
            key_points: [
                '<b>Formula:</b> gradi decimali = gradi + minuti/60 + secondi/3600.',
                '<b>Esempio:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Coordinate negative:</b> per latitudini sud o longitudini ovest, inserisci il valore dei gradi come negativo.',
            ],
            howto: [
                { question: 'Come inserisco una latitudine sud come 33°52\'04"S?', answer: '<p>Inserisci -33 come gradi, 52 come minuti e 4 come secondi — il segno negativo si trasferisce al risultato decimale.</p>' },
                { question: 'Perché minuti e secondi arrivano a 60, non a 100?', answer: '<p>La notazione DMS si basa sul sistema sessagesimale, lo stesso usato per l’ora dell’orologio.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.it, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.it, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.it, precision: 6 }],
        },
        de: {
            slug: 'grad-minuten-sekunden-in-dezimalgrad-umrechner', title: 'Grad Minuten Sekunden in Dezimalgrad Umrechner', h1: 'Grad Minuten Sekunden in Dezimalgrad Umrechner',
            meta_title: 'DMS in Dezimalgrad | Koordinatenformat-Umrechnung',
            meta_description: 'Rechnen Sie Grad, Minuten und Sekunden (DMS) sofort in Dezimalgrad um — üblich für GPS-Koordinaten.',
            short_answer: 'Dieser Rechner wandelt einen Grad/Minuten/Sekunden-Winkel (DMS) in Dezimalgrad um, z.B. 40°26\'46" = 40,4461°.',
            intro_text: '<p>Geografische Koordinaten und präzise Winkel werden oft in Grad, Minuten und Sekunden angegeben (wie 40°26\'46"N) — dieses Tool rechnet dieses Format in eine einzelne Dezimalgrad-Zahl um.</p>',
            key_points: [
                '<b>Formel:</b> Dezimalgrad = Grad + Minuten/60 + Sekunden/3600.',
                '<b>Beispiel:</b> 40°26\'46" = 40 + 26/60 + 46/3600 = 40,4461°.',
                '<b>Negative Koordinaten:</b> für südliche Breiten oder westliche Längen geben Sie den Gradwert negativ ein.',
            ],
            howto: [
                { question: 'Wie gebe ich eine südliche Breite wie 33°52\'04"S ein?', answer: '<p>Geben Sie -33 als Grad, 52 als Minuten und 4 als Sekunden ein — das Minuszeichen überträgt sich auf das Dezimalergebnis.</p>' },
                { question: 'Warum gehen Minuten und Sekunden bis 60, nicht 100?', answer: '<p>Die DMS-Schreibweise basiert auf dem Sexagesimalsystem, demselben, das für die Uhrzeit verwendet wird.</p>' },
            ],
            inputs: [
                { name: 'degrees', label: DEG_LABEL.de, type: 'number', min: -180, max: 180, placeholder: '40' },
                { name: 'minutes', label: MIN_ARC_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '26' },
                { name: 'seconds', label: SEC_ARC_LABEL.de, type: 'number', min: 0, max: 59.999, placeholder: '46' },
            ],
            outputs: [{ name: 'result', label: DECIMAL_DEGREES_LABEL.de, precision: 6 }],
        },
    },
}

const ANGLE_OPERATION_LABEL: Record<string, string> = { en: 'Operation', ru: 'Операция', de: 'Operation', es: 'Operación', fr: 'Opération', it: 'Operazione', pl: 'Operacja', lv: 'Darbība' }
function angleAddSubtractOptions(lang: string) {
    const l: Record<string, [string, string]> = { en: ['Add', 'Subtract'], ru: ['Сложить', 'Вычесть'], de: ['Addieren', 'Subtrahieren'], es: ['Sumar', 'Restar'], fr: ['Additionner', 'Soustraire'], it: ['Aggiungi', 'Sottrai'], pl: ['Dodaj', 'Odejmij'], lv: ['Pieskaitīt', 'Atņemt'] }
    const [add, sub] = l[lang] || l.en
    return [{ value: 'add', label: add }, { value: 'subtract', label: sub }]
}
const ANGLE_RESULT_DMS_LABEL: Record<string, string> = { en: 'Result (D°M\'S")', ru: 'Результат (Г°М\'С")', de: 'Ergebnis (G°M\'S")', es: 'Resultado (G°M\'S")', fr: 'Résultat (D°M\'S")', it: 'Risultato (G°M\'S")', pl: 'Wynik (S°M\'S")', lv: 'Rezultāts (G°M\'S")' }

// ============================================================
// 1143: Angle Addition and Subtraction Calculator
// ============================================================
const angleAddSubtractTool: ToolDef = {
    id: '1143',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'deg1', default: 45 }, { key: 'min1', default: 30 }, { key: 'sec1', default: 0 },
            { key: 'operation', default: 'add' },
            { key: 'deg2', default: 10 }, { key: 'min2', default: 45 }, { key: 'sec2', default: 0 },
        ],
        functions: { result: { type: 'function', functionName: 'angleAddSubtract', params: { deg1: 'deg1', min1: 'min1', sec1: 'sec1', operation: 'operation', deg2: 'deg2', min2: 'min2', sec2: 'sec2' } } },
        outputs: [{ key: 'degrees' }, { key: 'minutes' }, { key: 'seconds' }, { key: 'decimal_degrees', precision: 6 }],
    },
    locales: {
        en: {
            slug: 'angle-addition-and-subtraction-calculator', title: 'Angle Addition and Subtraction Calculator', h1: 'Angle Addition and Subtraction Calculator',
            meta_title: 'Angle Addition and Subtraction Calculator | Add or Subtract D°M\'S" Angles',
            meta_description: 'Add or subtract two angles given in degrees, minutes, and seconds, and get the result instantly.',
            short_answer: 'This calculator adds or subtracts two angles given in degrees/minutes/seconds, e.g. 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Enter two angles in degrees, minutes, and seconds and choose add or subtract — useful for surveying, navigation, or any calculation combining precise angular measurements.</p>',
            key_points: [
                '<b>Method:</b> both angles are converted to total arcseconds, added or subtracted, then reformatted back to degrees/minutes/seconds.',
                '<b>Example:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Raw result:</b> the sum is not normalized to 0-360° — use the Reference and Coterminal Angle Calculator afterward if you need a normalized angle.',
            ],
            howto: [
                { question: 'What if the result exceeds 360°?', answer: '<p>It will show a raw value above 360° (e.g. 400°15\'00") — normalize it separately if you need an angle within one full rotation.</p>' },
                { question: 'How do I subtract a larger angle from a smaller one?', answer: '<p>Choose Subtract — the result will be negative, shown with a minus sign on the degrees value.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.en, type: 'select', options: angleAddSubtractOptions('en'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.en }, { name: 'minutes', label: MIN_ARC_LABEL.en }, { name: 'seconds', label: SEC_ARC_LABEL.en },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.en, precision: 6 },
            ],
        },
        ru: {
            slug: 'kalkulyator-slozheniya-i-vychitaniya-uglov', title: 'Калькулятор сложения и вычитания углов', h1: 'Калькулятор сложения и вычитания углов',
            meta_title: 'Калькулятор сложения и вычитания углов | Г°М\'С"',
            meta_description: 'Складывайте или вычитайте два угла в градусах, минутах и секундах и получайте результат мгновенно.',
            short_answer: 'Этот калькулятор складывает или вычитает два угла в градусах/минутах/секундах, например 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Введите два угла в градусах, минутах и секундах и выберите сложение или вычитание — полезно для геодезии, навигации или любых расчётов с точными угловыми измерениями.</p>',
            key_points: [
                '<b>Метод:</b> оба угла переводятся в угловые секунды, складываются или вычитаются, затем форматируются обратно.',
                '<b>Пример:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Необработанный результат:</b> сумма не нормализуется до 0-360° — используйте калькулятор опорного и коконечного угла при необходимости.',
            ],
            howto: [
                { question: 'Что если результат превышает 360°?', answer: '<p>Будет показано необработанное значение выше 360° — нормализуйте его отдельно при необходимости.</p>' },
                { question: 'Как вычесть больший угол из меньшего?', answer: '<p>Выберите Вычесть — результат будет отрицательным, показанным со знаком минус.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.ru, type: 'select', options: angleAddSubtractOptions('ru'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.ru }, { name: 'minutes', label: MIN_ARC_LABEL.ru }, { name: 'seconds', label: SEC_ARC_LABEL.ru },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.ru, precision: 6 },
            ],
        },
        lv: {
            slug: 'lenku-saskaitisanas-un-atnemsanas-kalkulators', title: 'Leņķu Saskaitīšanas un Atņemšanas Kalkulators', h1: 'Leņķu Saskaitīšanas un Atņemšanas Kalkulators',
            meta_title: 'Leņķu Saskaitīšanas un Atņemšanas Kalkulators | G°M\'S"',
            meta_description: 'Saskaitiet vai atņemiet divus leņķus grādos, minūtēs un sekundēs, un iegūstiet rezultātu acumirklī.',
            short_answer: 'Šis kalkulators saskaita vai atņem divus leņķus grādos/minūtēs/sekundēs, piemēram, 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Ievadiet divus leņķus grādos, minūtēs un sekundēs un izvēlieties saskaitīšanu vai atņemšanu — noderīgi ģeodēzijai, navigācijai vai jebkuram aprēķinam ar precīziem leņķa mērījumiem.</p>',
            key_points: [
                '<b>Metode:</b> abi leņķi tiek pārvērsti loka sekundēs, saskaitīti vai atņemti, tad pārformatēti atpakaļ.',
                '<b>Piemērs:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Neapstrādāts rezultāts:</b> summa netiek normalizēta uz 0-360° — vēlāk izmantojiet Atskaites un Koterminālā Leņķa Kalkulatoru, ja nepieciešams.',
            ],
            howto: [
                { question: 'Ko darīt, ja rezultāts pārsniedz 360°?', answer: '<p>Tiks parādīta neapstrādāta vērtība virs 360° — normalizējiet to atsevišķi, ja nepieciešams.</p>' },
                { question: 'Kā atņemt lielāku leņķi no mazāka?', answer: '<p>Izvēlieties Atņemt — rezultāts būs negatīvs, parādīts ar mīnusa zīmi.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.lv, type: 'select', options: angleAddSubtractOptions('lv'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.lv }, { name: 'minutes', label: MIN_ARC_LABEL.lv }, { name: 'seconds', label: SEC_ARC_LABEL.lv },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.lv, precision: 6 },
            ],
        },
        pl: {
            slug: 'kalkulator-dodawania-i-odejmowania-katow', title: 'Kalkulator Dodawania i Odejmowania Kątów', h1: 'Kalkulator Dodawania i Odejmowania Kątów',
            meta_title: 'Kalkulator Dodawania i Odejmowania Kątów | S°M\'S"',
            meta_description: 'Dodaj lub odejmij dwa kąty podane w stopniach, minutach i sekundach, i uzyskaj wynik natychmiast.',
            short_answer: 'Ten kalkulator dodaje lub odejmuje dwa kąty podane w stopniach/minutach/sekundach, np. 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Wprowadź dwa kąty w stopniach, minutach i sekundach i wybierz dodawanie lub odejmowanie — przydatne w geodezji, nawigacji lub obliczeniach z precyzyjnymi pomiarami kątowymi.</p>',
            key_points: [
                '<b>Metoda:</b> oba kąty są przeliczane na sekundy kątowe, dodawane lub odejmowane, a następnie formatowane z powrotem.',
                '<b>Przykład:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Surowy wynik:</b> suma nie jest normalizowana do 0-360° — użyj później Kalkulatora Kąta Odniesienia i Współkońcowego, jeśli potrzebne.',
            ],
            howto: [
                { question: 'Co jeśli wynik przekracza 360°?', answer: '<p>Pokaże surową wartość powyżej 360° — znormalizuj ją osobno, jeśli potrzebujesz kąta w jednym pełnym obrocie.</p>' },
                { question: 'Jak odjąć większy kąt od mniejszego?', answer: '<p>Wybierz Odejmij — wynik będzie ujemny, pokazany ze znakiem minus.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.pl, type: 'select', options: angleAddSubtractOptions('pl'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.pl }, { name: 'minutes', label: MIN_ARC_LABEL.pl }, { name: 'seconds', label: SEC_ARC_LABEL.pl },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.pl, precision: 6 },
            ],
        },
        es: {
            slug: 'calculadora-de-suma-y-resta-de-angulos', title: 'Calculadora de Suma y Resta de Ángulos', h1: 'Calculadora de Suma y Resta de Ángulos',
            meta_title: 'Calculadora de Suma y Resta de Ángulos | G°M\'S"',
            meta_description: 'Suma o resta dos ángulos dados en grados, minutos y segundos, y obtén el resultado al instante.',
            short_answer: 'Esta calculadora suma o resta dos ángulos dados en grados/minutos/segundos, p. ej. 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Introduce dos ángulos en grados, minutos y segundos y elige sumar o restar — útil para topografía, navegación o cualquier cálculo con mediciones angulares precisas.</p>',
            key_points: [
                '<b>Método:</b> ambos ángulos se convierten en segundos de arco totales, se suman o restan, y se reformatean de vuelta.',
                '<b>Ejemplo:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Resultado sin procesar:</b> la suma no se normaliza a 0-360° — usa después la Calculadora de Ángulo de Referencia y Coterminal si lo necesitas.',
            ],
            howto: [
                { question: '¿Qué pasa si el resultado supera 360°?', answer: '<p>Mostrará un valor sin procesar por encima de 360° — normalízalo por separado si necesitas un ángulo dentro de una vuelta completa.</p>' },
                { question: '¿Cómo resto un ángulo mayor de uno menor?', answer: '<p>Elige Restar — el resultado será negativo, mostrado con un signo menos.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.es, type: 'select', options: angleAddSubtractOptions('es'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.es }, { name: 'minutes', label: MIN_ARC_LABEL.es }, { name: 'seconds', label: SEC_ARC_LABEL.es },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.es, precision: 6 },
            ],
        },
        fr: {
            slug: 'calculateur-daddition-et-de-soustraction-dangles', title: 'Calculateur d’Addition et de Soustraction d’Angles', h1: 'Calculateur d’Addition et de Soustraction d’Angles',
            meta_title: 'Calculateur d’Addition et de Soustraction d’Angles | D°M\'S"',
            meta_description: 'Additionnez ou soustrayez deux angles donnés en degrés, minutes et secondes, et obtenez le résultat instantanément.',
            short_answer: 'Ce calculateur additionne ou soustrait deux angles donnés en degrés/minutes/secondes, ex. 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Entrez deux angles en degrés, minutes et secondes et choisissez additionner ou soustraire — utile pour la topographie, la navigation ou tout calcul avec des mesures angulaires précises.</p>',
            key_points: [
                '<b>Méthode :</b> les deux angles sont convertis en secondes d’arc totales, additionnés ou soustraits, puis reformatés.',
                '<b>Exemple :</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Résultat brut :</b> la somme n’est pas normalisée à 0-360° — utilisez ensuite le Calculateur d’Angle de Référence et Coterminal si nécessaire.',
            ],
            howto: [
                { question: 'Que se passe-t-il si le résultat dépasse 360° ?', answer: '<p>Il affichera une valeur brute supérieure à 360° — normalisez-la séparément si nécessaire.</p>' },
                { question: 'Comment soustraire un angle plus grand d’un plus petit ?', answer: '<p>Choisissez Soustraire — le résultat sera négatif, affiché avec un signe moins.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.fr, type: 'select', options: angleAddSubtractOptions('fr'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.fr }, { name: 'minutes', label: MIN_ARC_LABEL.fr }, { name: 'seconds', label: SEC_ARC_LABEL.fr },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.fr, precision: 6 },
            ],
        },
        it: {
            slug: 'calcolatore-di-addizione-e-sottrazione-di-angoli', title: 'Calcolatore di Addizione e Sottrazione di Angoli', h1: 'Calcolatore di Addizione e Sottrazione di Angoli',
            meta_title: 'Calcolatore di Addizione e Sottrazione di Angoli | G°M\'S"',
            meta_description: 'Somma o sottrai due angoli dati in gradi, minuti e secondi, e ottieni il risultato istantaneamente.',
            short_answer: 'Questo calcolatore somma o sottrae due angoli dati in gradi/minuti/secondi, es. 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Inserisci due angoli in gradi, minuti e secondi e scegli somma o sottrazione — utile per topografia, navigazione o qualsiasi calcolo con misurazioni angolari precise.</p>',
            key_points: [
                '<b>Metodo:</b> entrambi gli angoli vengono convertiti in secondi d’arco totali, sommati o sottratti, poi riformattati.',
                '<b>Esempio:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Risultato grezzo:</b> la somma non è normalizzata a 0-360° — usa poi il Calcolatore di Angolo di Riferimento e Coterminale se necessario.',
            ],
            howto: [
                { question: 'Cosa succede se il risultato supera 360°?', answer: '<p>Mostrerà un valore grezzo superiore a 360° — normalizzalo separatamente se necessario.</p>' },
                { question: 'Come sottraggo un angolo maggiore da uno minore?', answer: '<p>Scegli Sottrai — il risultato sarà negativo, mostrato con il segno meno.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.it, type: 'select', options: angleAddSubtractOptions('it'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.it }, { name: 'minutes', label: MIN_ARC_LABEL.it }, { name: 'seconds', label: SEC_ARC_LABEL.it },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.it, precision: 6 },
            ],
        },
        de: {
            slug: 'winkeladdition-und-subtraktion-rechner', title: 'Winkeladdition und -subtraktion Rechner', h1: 'Winkeladdition und -subtraktion Rechner',
            meta_title: 'Winkeladdition und -subtraktion Rechner | G°M\'S"',
            meta_description: 'Addieren oder subtrahieren Sie zwei Winkel in Grad, Minuten und Sekunden und erhalten Sie das Ergebnis sofort.',
            short_answer: 'Dieser Rechner addiert oder subtrahiert zwei Winkel in Grad/Minuten/Sekunden, z.B. 45°30\'00" + 10°45\'00" = 56°15\'00".',
            intro_text: '<p>Geben Sie zwei Winkel in Grad, Minuten und Sekunden ein und wählen Sie Addieren oder Subtrahieren — nützlich für Vermessung, Navigation oder Berechnungen mit präzisen Winkelmessungen.</p>',
            key_points: [
                '<b>Methode:</b> beide Winkel werden in Bogensekunden umgerechnet, addiert oder subtrahiert, dann zurückformatiert.',
                '<b>Beispiel:</b> 45°30\'00" + 10°45\'00" = 56°15\'00".',
                '<b>Rohes Ergebnis:</b> die Summe wird nicht auf 0-360° normalisiert — verwenden Sie danach bei Bedarf den Referenz- und Nebenwinkel-Rechner.',
            ],
            howto: [
                { question: 'Was, wenn das Ergebnis 360° überschreitet?', answer: '<p>Es wird ein roher Wert über 360° angezeigt — normalisieren Sie ihn separat, falls nötig.</p>' },
                { question: 'Wie subtrahiere ich einen größeren Winkel von einem kleineren?', answer: '<p>Wählen Sie Subtrahieren — das Ergebnis wird negativ mit Minuszeichen angezeigt.</p>' },
            ],
            inputs: [
                { name: 'deg1', label: DEG_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '45' },
                { name: 'min1', label: MIN_ARC_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
                { name: 'sec1', label: SEC_ARC_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'operation', label: ANGLE_OPERATION_LABEL.de, type: 'select', options: angleAddSubtractOptions('de'), default: 'add' },
                { name: 'deg2', label: DEG_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '10' },
                { name: 'min2', label: MIN_ARC_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '45' },
                { name: 'sec2', label: SEC_ARC_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
            ],
            outputs: [
                { name: 'degrees', label: DEG_LABEL.de }, { name: 'minutes', label: MIN_ARC_LABEL.de }, { name: 'seconds', label: SEC_ARC_LABEL.de },
                { name: 'decimal_degrees', label: DECIMAL_DEGREES_LABEL.de, precision: 6 },
            ],
        },
    },
}

const ANGLE_INPUT_LABEL: Record<string, string> = { en: 'Angle (degrees)', ru: 'Угол (градусы)', de: 'Winkel (Grad)', es: 'Ángulo (grados)', fr: 'Angle (degrés)', it: 'Angolo (gradi)', pl: 'Kąt (stopnie)', lv: 'Leņķis (grādi)' }
const COTERMINAL_LABEL: Record<string, string> = { en: 'Coterminal Angle', ru: 'Коконечный угол', de: 'Nebenwinkel', es: 'Ángulo Coterminal', fr: 'Angle Coterminal', it: 'Angolo Coterminale', pl: 'Kąt Współkońcowy', lv: 'Koterminālais Leņķis' }
const REFERENCE_LABEL: Record<string, string> = { en: 'Reference Angle', ru: 'Опорный угол', de: 'Referenzwinkel', es: 'Ángulo de Referencia', fr: 'Angle de Référence', it: 'Angolo di Riferimento', pl: 'Kąt Odniesienia', lv: 'Atskaites Leņķis' }
const QUADRANT_LABEL: Record<string, string> = { en: 'Quadrant', ru: 'Квадрант', de: 'Quadrant', es: 'Cuadrante', fr: 'Quadrant', it: 'Quadrante', pl: 'Ćwiartka', lv: 'Kvadrants' }

// ============================================================
// 1144: Reference and Coterminal Angle Calculator
// ============================================================
const referenceCoterminalTool: ToolDef = {
    id: '1144',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'angle', default: 740 }],
        functions: {
            coterminal_angle: { type: 'function', functionName: 'referenceCoterminalAngle', params: { angle: 'angle' } },
        },
        outputs: [{ key: 'coterminal_angle', precision: 4 }, { key: 'reference_angle', precision: 4 }, { key: 'quadrant' }],
    },
    locales: {
        en: {
            slug: 'reference-and-coterminal-angle-calculator', title: 'Reference and Coterminal Angle Calculator', h1: 'Reference and Coterminal Angle Calculator',
            meta_title: 'Reference and Coterminal Angle Calculator | Normalize Any Angle to 0-360°',
            meta_description: 'Find the coterminal angle (0-360°) and reference angle (0-90°) for any angle, plus its quadrant.',
            short_answer: 'This calculator finds the coterminal angle (normalized to 0-360°) and the reference angle (0-90°, the acute angle to the x-axis) for any input angle.',
            intro_text: '<p>Enter any angle, positive or negative, larger or smaller than a full circle, to find its coterminal angle (the equivalent angle within one full 360° rotation) and its reference angle (the acute angle formed with the x-axis) — both fundamental for trigonometry problems.</p>',
            key_points: [
                '<b>Coterminal angle:</b> found by adding or subtracting 360° until the result falls in [0°, 360°).',
                '<b>Reference angle:</b> always between 0° and 90°, measured from the terminal side of the angle to the nearest x-axis.',
                '<b>Example:</b> 740° has a coterminal angle of 20° (740 − 2×360 = 20°) and a reference angle of 20° (since it\'s already in quadrant 1).',
            ],
            howto: [
                { question: 'What is the reference angle for 200°?', answer: '<p>200° is in quadrant 3, so the reference angle is 200° − 180° = 20°.</p>' },
                { question: 'What about negative angles like -30°?', answer: '<p>The coterminal angle is 330° (-30° + 360°), which is in quadrant 4, giving a reference angle of 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.en, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.en, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.en, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.en },
            ],
        },
        ru: {
            slug: 'kalkulyator-opornogo-i-kokonechnogo-ugla', title: 'Калькулятор опорного и коконечного угла', h1: 'Калькулятор опорного и коконечного угла',
            meta_title: 'Калькулятор опорного и коконечного угла | Нормализация угла к 0-360°',
            meta_description: 'Найдите коконечный угол (0-360°) и опорный угол (0-90°) для любого угла, плюс его квадрант.',
            short_answer: 'Этот калькулятор находит коконечный угол (нормализованный к 0-360°) и опорный угол (0-90°) для любого входного угла.',
            intro_text: '<p>Введите любой угол, положительный или отрицательный, больше или меньше полного круга, чтобы найти его коконечный угол и опорный угол — оба фундаментальны для задач тригонометрии.</p>',
            key_points: [
                '<b>Коконечный угол:</b> находится добавлением или вычитанием 360°, пока результат не окажется в [0°, 360°).',
                '<b>Опорный угол:</b> всегда между 0° и 90°, измеряется от конечной стороны угла до ближайшей оси X.',
                '<b>Пример:</b> у 740° коконечный угол 20° (740 − 2×360 = 20°) и опорный угол 20°.',
            ],
            howto: [
                { question: 'Какой опорный угол для 200°?', answer: '<p>200° находится в квадранте 3, поэтому опорный угол = 200° − 180° = 20°.</p>' },
                { question: 'Что насчёт отрицательных углов вроде -30°?', answer: '<p>Коконечный угол — 330° (-30° + 360°), который в квадранте 4, давая опорный угол 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.ru, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.ru, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.ru, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.ru },
            ],
        },
        lv: {
            slug: 'atskaites-un-koterminala-lenka-kalkulators', title: 'Atskaites un Koterminālā Leņķa Kalkulators', h1: 'Atskaites un Koterminālā Leņķa Kalkulators',
            meta_title: 'Atskaites un Koterminālā Leņķa Kalkulators | Normalizējiet Jebkuru Leņķi uz 0-360°',
            meta_description: 'Atrodiet koterminālo leņķi (0-360°) un atskaites leņķi (0-90°) jebkuram leņķim, plus tā kvadrantu.',
            short_answer: 'Šis kalkulators atrod koterminālo leņķi (normalizētu uz 0-360°) un atskaites leņķi (0-90°) jebkuram ievadītajam leņķim.',
            intro_text: '<p>Ievadiet jebkuru leņķi, pozitīvu vai negatīvu, lielāku vai mazāku par pilnu apli, lai atrastu tā koterminālo leņķi un atskaites leņķi — abi ir fundamentāli trigonometrijas uzdevumiem.</p>',
            key_points: [
                '<b>Koterminālais leņķis:</b> atrasts, pieskaitot vai atņemot 360°, līdz rezultāts iekrīt [0°, 360°).',
                '<b>Atskaites leņķis:</b> vienmēr starp 0° un 90°, mērīts no leņķa gala malas līdz tuvākajai X asij.',
                '<b>Piemērs:</b> 740° koterminālais leņķis ir 20° (740 − 2×360 = 20°) un atskaites leņķis ir 20°.',
            ],
            howto: [
                { question: 'Kāds ir atskaites leņķis 200°?', answer: '<p>200° ir 3. kvadrantā, tāpēc atskaites leņķis = 200° − 180° = 20°.</p>' },
                { question: 'Ko darīt ar negatīviem leņķiem, piemēram, -30°?', answer: '<p>Koterminālais leņķis ir 330° (-30° + 360°), kas ir 4. kvadrantā, dodot atskaites leņķi 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.lv, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.lv, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.lv, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.lv },
            ],
        },
        pl: {
            slug: 'kalkulator-kata-odniesienia-i-wspolkoncowego', title: 'Kalkulator Kąta Odniesienia i Współkońcowego', h1: 'Kalkulator Kąta Odniesienia i Współkońcowego',
            meta_title: 'Kalkulator Kąta Odniesienia i Współkońcowego | Normalizuj Dowolny Kąt do 0-360°',
            meta_description: 'Znajdź kąt współkońcowy (0-360°) i kąt odniesienia (0-90°) dla dowolnego kąta, plus jego ćwiartkę.',
            short_answer: 'Ten kalkulator znajduje kąt współkońcowy (znormalizowany do 0-360°) i kąt odniesienia (0-90°) dla dowolnego wprowadzonego kąta.',
            intro_text: '<p>Wprowadź dowolny kąt, dodatni lub ujemny, większy lub mniejszy niż pełne koło, aby znaleźć jego kąt współkońcowy i kąt odniesienia — oba fundamentalne dla zadań trygonometrycznych.</p>',
            key_points: [
                '<b>Kąt współkońcowy:</b> znaleziony przez dodanie lub odjęcie 360°, aż wynik znajdzie się w [0°, 360°).',
                '<b>Kąt odniesienia:</b> zawsze między 0° a 90°, mierzony od ramienia końcowego kąta do najbliższej osi X.',
                '<b>Przykład:</b> 740° ma kąt współkońcowy 20° (740 − 2×360 = 20°) i kąt odniesienia 20°.',
            ],
            howto: [
                { question: 'Jaki jest kąt odniesienia dla 200°?', answer: '<p>200° jest w ćwiartce 3, więc kąt odniesienia = 200° − 180° = 20°.</p>' },
                { question: 'A co z ujemnymi kątami jak -30°?', answer: '<p>Kąt współkońcowy to 330° (-30° + 360°), który jest w ćwiartce 4, dając kąt odniesienia 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.pl, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.pl, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.pl, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.pl },
            ],
        },
        es: {
            slug: 'calculadora-de-angulo-de-referencia-y-coterminal', title: 'Calculadora de Ángulo de Referencia y Coterminal', h1: 'Calculadora de Ángulo de Referencia y Coterminal',
            meta_title: 'Calculadora de Ángulo de Referencia y Coterminal | Normaliza Cualquier Ángulo a 0-360°',
            meta_description: 'Encuentra el ángulo coterminal (0-360°) y el ángulo de referencia (0-90°) para cualquier ángulo, más su cuadrante.',
            short_answer: 'Esta calculadora encuentra el ángulo coterminal (normalizado a 0-360°) y el ángulo de referencia (0-90°) para cualquier ángulo introducido.',
            intro_text: '<p>Introduce cualquier ángulo, positivo o negativo, mayor o menor que un círculo completo, para encontrar su ángulo coterminal y su ángulo de referencia — ambos fundamentales para problemas de trigonometría.</p>',
            key_points: [
                '<b>Ángulo coterminal:</b> se encuentra sumando o restando 360° hasta que el resultado caiga en [0°, 360°).',
                '<b>Ángulo de referencia:</b> siempre entre 0° y 90°, medido desde el lado terminal del ángulo hasta el eje X más cercano.',
                '<b>Ejemplo:</b> 740° tiene un ángulo coterminal de 20° (740 − 2×360 = 20°) y un ángulo de referencia de 20°.',
            ],
            howto: [
                { question: '¿Cuál es el ángulo de referencia para 200°?', answer: '<p>200° está en el cuadrante 3, así que el ángulo de referencia = 200° − 180° = 20°.</p>' },
                { question: '¿Y los ángulos negativos como -30°?', answer: '<p>El ángulo coterminal es 330° (-30° + 360°), que está en el cuadrante 4, dando un ángulo de referencia de 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.es, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.es, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.es, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.es },
            ],
        },
        fr: {
            slug: 'calculateur-dangle-de-reference-et-coterminal', title: 'Calculateur d’Angle de Référence et Coterminal', h1: 'Calculateur d’Angle de Référence et Coterminal',
            meta_title: 'Calculateur d’Angle de Référence et Coterminal | Normalisez Tout Angle à 0-360°',
            meta_description: 'Trouvez l’angle coterminal (0-360°) et l’angle de référence (0-90°) pour tout angle, plus son quadrant.',
            short_answer: 'Ce calculateur trouve l’angle coterminal (normalisé à 0-360°) et l’angle de référence (0-90°) pour tout angle saisi.',
            intro_text: '<p>Entrez n’importe quel angle, positif ou négatif, plus grand ou plus petit qu’un cercle complet, pour trouver son angle coterminal et son angle de référence — tous deux fondamentaux pour les problèmes de trigonométrie.</p>',
            key_points: [
                '<b>Angle coterminal :</b> trouvé en ajoutant ou soustrayant 360° jusqu’à ce que le résultat tombe dans [0°, 360°).',
                '<b>Angle de référence :</b> toujours entre 0° et 90°, mesuré depuis le côté terminal de l’angle jusqu’à l’axe X le plus proche.',
                '<b>Exemple :</b> 740° a un angle coterminal de 20° (740 − 2×360 = 20°) et un angle de référence de 20°.',
            ],
            howto: [
                { question: 'Quel est l’angle de référence pour 200° ?', answer: '<p>200° est dans le quadrant 3, donc l’angle de référence = 200° − 180° = 20°.</p>' },
                { question: 'Qu’en est-il des angles négatifs comme -30° ?', answer: '<p>L’angle coterminal est 330° (-30° + 360°), qui est dans le quadrant 4, donnant un angle de référence de 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.fr, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.fr, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.fr, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.fr },
            ],
        },
        it: {
            slug: 'calcolatore-di-angolo-di-riferimento-e-coterminale', title: 'Calcolatore di Angolo di Riferimento e Coterminale', h1: 'Calcolatore di Angolo di Riferimento e Coterminale',
            meta_title: 'Calcolatore di Angolo di Riferimento e Coterminale | Normalizza Qualsiasi Angolo a 0-360°',
            meta_description: 'Trova l’angolo coterminale (0-360°) e l’angolo di riferimento (0-90°) per qualsiasi angolo, più il suo quadrante.',
            short_answer: 'Questo calcolatore trova l’angolo coterminale (normalizzato a 0-360°) e l’angolo di riferimento (0-90°) per qualsiasi angolo inserito.',
            intro_text: '<p>Inserisci qualsiasi angolo, positivo o negativo, maggiore o minore di un cerchio completo, per trovare il suo angolo coterminale e il suo angolo di riferimento — entrambi fondamentali per i problemi di trigonometria.</p>',
            key_points: [
                '<b>Angolo coterminale:</b> trovato aggiungendo o sottraendo 360° finché il risultato non cade in [0°, 360°).',
                '<b>Angolo di riferimento:</b> sempre tra 0° e 90°, misurato dal lato terminale dell’angolo all’asse X più vicino.',
                '<b>Esempio:</b> 740° ha un angolo coterminale di 20° (740 − 2×360 = 20°) e un angolo di riferimento di 20°.',
            ],
            howto: [
                { question: 'Qual è l’angolo di riferimento per 200°?', answer: '<p>200° è nel quadrante 3, quindi l’angolo di riferimento = 200° − 180° = 20°.</p>' },
                { question: 'E gli angoli negativi come -30°?', answer: '<p>L’angolo coterminale è 330° (-30° + 360°), che è nel quadrante 4, dando un angolo di riferimento di 360° − 330° = 30°.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.it, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.it, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.it, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.it },
            ],
        },
        de: {
            slug: 'referenz-und-nebenwinkel-rechner', title: 'Referenz- und Nebenwinkel-Rechner', h1: 'Referenz- und Nebenwinkel-Rechner',
            meta_title: 'Referenz- und Nebenwinkel-Rechner | Jeden Winkel auf 0-360° Normalisieren',
            meta_description: 'Finden Sie den Nebenwinkel (0-360°) und den Referenzwinkel (0-90°) für jeden Winkel, plus seinen Quadranten.',
            short_answer: 'Dieser Rechner findet den Nebenwinkel (auf 0-360° normalisiert) und den Referenzwinkel (0-90°) für jeden eingegebenen Winkel.',
            intro_text: '<p>Geben Sie einen beliebigen Winkel ein, positiv oder negativ, größer oder kleiner als ein voller Kreis, um seinen Nebenwinkel und seinen Referenzwinkel zu finden — beide grundlegend für trigonometrische Probleme.</p>',
            key_points: [
                '<b>Nebenwinkel:</b> gefunden durch Addieren oder Subtrahieren von 360°, bis das Ergebnis in [0°, 360°) fällt.',
                '<b>Referenzwinkel:</b> immer zwischen 0° und 90°, gemessen von der Endseite des Winkels zur nächsten X-Achse.',
                '<b>Beispiel:</b> 740° hat einen Nebenwinkel von 20° (740 − 2×360 = 20°) und einen Referenzwinkel von 20°.',
            ],
            howto: [
                { question: 'Was ist der Referenzwinkel für 200°?', answer: '<p>200° liegt im 3. Quadranten, daher ist der Referenzwinkel = 200° − 180° = 20°.</p>' },
                { question: 'Was ist mit negativen Winkeln wie -30°?', answer: '<p>Der Nebenwinkel ist 330° (-30° + 360°), der im 4. Quadranten liegt, was einen Referenzwinkel von 360° − 330° = 30° ergibt.</p>' },
            ],
            inputs: [{ name: 'angle', label: ANGLE_INPUT_LABEL.de, type: 'number', min: -1000000, max: 1000000, placeholder: '740' }],
            outputs: [
                { name: 'coterminal_angle', label: COTERMINAL_LABEL.de, precision: 4 },
                { name: 'reference_angle', label: REFERENCE_LABEL.de, precision: 4 },
                { name: 'quadrant', label: QUADRANT_LABEL.de },
            ],
        },
    },
}

export const tools: ToolDef[] = [
    temperatureConverterTool, celsiusToFahrenheitTool, fahrenheitToCelsiusTool, celsiusToKelvinTool, fahrenheitToKelvinTool, temperatureDifferenceTool,
    angleConverterTool, degreesToRadiansTool, radiansToDegreesTool, dmsToDecimalTool, angleAddSubtractTool, referenceCoterminalTool,
]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: TEMPERATURE_ANGLE_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: TEMPERATURE_ANGLE_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} temperature & angle converters across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
