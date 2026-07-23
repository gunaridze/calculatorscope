// One-off script: seeds 11 new Digital & Miscellaneous Converter calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-digital-misc-calculators.ts
//
// Tool IDs 1145-1155, category_id '33' (Digital & Miscellaneous Converters,
// under Converters). This category already had 1 tool (1001, Number to Words
// Converter) seeded in an earlier session. No explicit tool list was requested
// for the remaining 11; the split (storage x2, number-base/format x7, Roman
// numerals x2) was proposed and confirmed with the user before writing content.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DIGITAL_MISC_CATEGORY_ID = '33'

type InputField = {
    name: string
    label: string
    type: 'number' | 'select' | 'text'
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
// Shared label dictionaries
// ============================================================
const FROM_LABEL: Record<string, string> = { en: 'From', ru: 'Из', de: 'Von', es: 'De', fr: 'De', it: 'Da', pl: 'Z', lv: 'No' }
const TO_LABEL: Record<string, string> = { en: 'To', ru: 'В', de: 'Nach', es: 'A', fr: 'Vers', it: 'A', pl: 'Na', lv: 'Uz' }
const VALUE_LABEL: Record<string, string> = { en: 'Value', ru: 'Значение', de: 'Wert', es: 'Valor', fr: 'Valeur', it: 'Valore', pl: 'Wartość', lv: 'Vērtība' }
const CONVERTED_LABEL: Record<string, string> = { en: 'Converted Value', ru: 'Конвертированное значение', de: 'Umgerechneter Wert', es: 'Valor Convertido', fr: 'Valeur Convertie', it: 'Valore Convertito', pl: 'Przeliczona Wartość', lv: 'Pārrēķinātā Vērtība' }
const RESULT_LABEL: Record<string, string> = { en: 'Result', ru: 'Результат', de: 'Ergebnis', es: 'Resultado', fr: 'Résultat', it: 'Risultato', pl: 'Wynik', lv: 'Rezultāts' }

const STORAGE_UNIT_ORDER = ['bit', 'byte', 'KB', 'MB', 'GB', 'TB', 'PB']
const STORAGE_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { bit: 'Bits', byte: 'Bytes', KB: 'Kilobytes (KB)', MB: 'Megabytes (MB)', GB: 'Gigabytes (GB)', TB: 'Terabytes (TB)', PB: 'Petabytes (PB)' },
    ru: { bit: 'Биты', byte: 'Байты', KB: 'Килобайты (КБ)', MB: 'Мегабайты (МБ)', GB: 'Гигабайты (ГБ)', TB: 'Терабайты (ТБ)', PB: 'Петабайты (ПБ)' },
    de: { bit: 'Bits', byte: 'Bytes', KB: 'Kilobyte (KB)', MB: 'Megabyte (MB)', GB: 'Gigabyte (GB)', TB: 'Terabyte (TB)', PB: 'Petabyte (PB)' },
    es: { bit: 'Bits', byte: 'Bytes', KB: 'Kilobytes (KB)', MB: 'Megabytes (MB)', GB: 'Gigabytes (GB)', TB: 'Terabytes (TB)', PB: 'Petabytes (PB)' },
    fr: { bit: 'Bits', byte: 'Octets', KB: 'Kilooctets (Ko)', MB: 'Mégaoctets (Mo)', GB: 'Gigaoctets (Go)', TB: 'Téraoctets (To)', PB: 'Pétaoctets (Po)' },
    it: { bit: 'Bit', byte: 'Byte', KB: 'Kilobyte (KB)', MB: 'Megabyte (MB)', GB: 'Gigabyte (GB)', TB: 'Terabyte (TB)', PB: 'Petabyte (PB)' },
    pl: { bit: 'Bity', byte: 'Bajty', KB: 'Kilobajty (KB)', MB: 'Megabajty (MB)', GB: 'Gigabajty (GB)', TB: 'Terabajty (TB)', PB: 'Petabajty (PB)' },
    lv: { bit: 'Biti', byte: 'Baiti', KB: 'Kilobaiti (KB)', MB: 'Megabaiti (MB)', GB: 'Gigabaiti (GB)', TB: 'Terabaiti (TB)', PB: 'Petabaiti (PB)' },
}
function storageUnitOptions(lang: string) {
    const labels = STORAGE_UNIT_LABELS[lang] || STORAGE_UNIT_LABELS.en
    return STORAGE_UNIT_ORDER.map((code) => ({ value: code, label: labels[code], abbr: code }))
}

// ============================================================
// 1145: Data Storage Converter
// ============================================================
const dataStorageConverterTool: ToolDef = {
    id: '1145',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 1 }, { key: 'from_unit', default: 'GB' }, { key: 'to_unit', default: 'MB' }],
        functions: { result: { type: 'function', functionName: 'dataStorageConverter', params: { value: 'value', from_unit: 'from_unit', to_unit: 'to_unit' } } },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'data-storage-converter', title: 'Data Storage Converter', h1: 'Data Storage Converter',
            meta_title: 'Data Storage Converter | Bits, Bytes, KB, MB, GB, TB, PB',
            meta_description: 'Convert between bits, bytes, KB, MB, GB, TB, and PB instantly with this digital storage converter.',
            short_answer: 'This converter changes a data storage value between bits, bytes, KB, MB, GB, TB, and PB using the selectors below.',
            intro_text: '<p>File sizes, disk capacities, and memory are expressed in different units depending on scale — bytes for small files, up through gigabytes and terabytes for drives and backups.</p><p>This tool converts between all seven directly, using the standard binary convention where each unit is 1,024 times the previous one.</p>',
            key_points: [
                '<b>Binary convention:</b> 1 KB = 1,024 bytes, 1 MB = 1,024 KB, and so on — the convention used by operating systems when reporting file and drive sizes.',
                '<b>Bits vs. bytes:</b> 1 byte = 8 bits; network speeds are usually quoted in bits, while file sizes are usually quoted in bytes.',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the seven supported storage units.',
            ],
            howto: [
                { question: 'How many MB are in 1 GB?', answer: '<p>1,024 MB, following the binary (1,024-based) convention used by most operating systems.</p>' },
                { question: 'Why do some tools show slightly different results for GB?', answer: '<p>Some manufacturers use decimal (1,000-based) GB for marketing storage capacity, while operating systems typically report binary (1,024-based) GB — this converter uses the binary convention.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.en, type: 'select', options: storageUnitOptions('en') },
                { name: 'to_unit', label: TO_LABEL.en, type: 'select', options: storageUnitOptions('en') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.en, unitFrom: 'to_unit', precision: 4 }],
        },
        ru: {
            slug: 'konverter-cifrovogo-hranilishcha', title: 'Конвертер цифрового хранилища', h1: 'Конвертер цифрового хранилища',
            meta_title: 'Конвертер данных | Биты, байты, КБ, МБ, ГБ, ТБ, ПБ',
            meta_description: 'Конвертируйте между битами, байтами, КБ, МБ, ГБ, ТБ и ПБ мгновенно.',
            short_answer: 'Этот конвертер переводит значение объёма данных между битами, байтами, КБ, МБ, ГБ, ТБ и ПБ.',
            intro_text: '<p>Размеры файлов, ёмкость дисков и память выражаются в разных единицах в зависимости от масштаба — байты для маленьких файлов, вплоть до гигабайт и терабайт для дисков и резервных копий.</p><p>Этот инструмент конвертирует между всеми семью напрямую, используя стандартное двоичное соглашение, где каждая единица в 1024 раза больше предыдущей.</p>',
            key_points: [
                '<b>Двоичное соглашение:</b> 1 КБ = 1024 байта, 1 МБ = 1024 КБ и так далее.',
                '<b>Биты и байты:</b> 1 байт = 8 бит; скорость сети обычно указывается в битах, а размер файлов — в байтах.',
                '<b>Полностью гибкий:</b> измените любой список, чтобы конвертировать между любыми двумя из семи единиц.',
            ],
            howto: [
                { question: 'Сколько МБ в 1 ГБ?', answer: '<p>1024 МБ, следуя двоичному соглашению, используемому большинством операционных систем.</p>' },
                { question: 'Почему некоторые инструменты показывают немного другие результаты для ГБ?', answer: '<p>Некоторые производители используют десятичные (на основе 1000) ГБ для маркетинга объёма хранилища, а операционные системы обычно указывают двоичные (на основе 1024) ГБ.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.ru, type: 'select', options: storageUnitOptions('ru') },
                { name: 'to_unit', label: TO_LABEL.ru, type: 'select', options: storageUnitOptions('ru') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.ru, unitFrom: 'to_unit', precision: 4 }],
        },
        lv: {
            slug: 'datu-krataves-konvertetajs', title: 'Datu Krātaves Konvertētājs', h1: 'Datu Krātaves Konvertētājs',
            meta_title: 'Datu Krātaves Konvertētājs | Biti, Baiti, KB, MB, GB, TB, PB',
            meta_description: 'Konvertējiet starp bitiem, baitiem, KB, MB, GB, TB un PB acumirklī.',
            short_answer: 'Šis konvertētājs pārrēķina datu apjoma vērtību starp bitiem, baitiem, KB, MB, GB, TB un PB.',
            intro_text: '<p>Failu izmēri, disku ietilpība un atmiņa tiek izteikta dažādās vienībās atkarībā no mēroga — baiti maziem failiem, līdz pat gigabaitiem un terabaitiem diskiem un dublējumiem.</p><p>Šis rīks konvertē starp visām septiņām tieši, izmantojot standarta bināro konvenciju, kur katra vienība ir 1024 reizes lielāka par iepriekšējo.</p>',
            key_points: [
                '<b>Binārā konvencija:</b> 1 KB = 1024 baiti, 1 MB = 1024 KB, un tā tālāk.',
                '<b>Biti pret baitiem:</b> 1 baits = 8 biti; tīkla ātrumi parasti tiek norādīti bitos, bet failu izmēri — baitos.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru sarakstu, lai konvertētu starp jebkurām divām no septiņām vienībām.',
            ],
            howto: [
                { question: 'Cik MB ir 1 GB?', answer: '<p>1024 MB, sekojot binārajai konvencijai, ko izmanto lielākā daļa operētājsistēmu.</p>' },
                { question: 'Kāpēc daži rīki uzrāda nedaudz atšķirīgus rezultātus GB?', answer: '<p>Daži ražotāji izmanto decimālo (uz 1000 balstīto) GB krātuves apjoma tirgvedībai, bet operētājsistēmas parasti norāda bināro (uz 1024 balstīto) GB.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.lv, type: 'select', options: storageUnitOptions('lv') },
                { name: 'to_unit', label: TO_LABEL.lv, type: 'select', options: storageUnitOptions('lv') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.lv, unitFrom: 'to_unit', precision: 4 }],
        },
        pl: {
            slug: 'konwerter-pamieci-cyfrowej', title: 'Konwerter Pamięci Cyfrowej', h1: 'Konwerter Pamięci Cyfrowej',
            meta_title: 'Konwerter Danych | Bity, Bajty, KB, MB, GB, TB, PB',
            meta_description: 'Przelicz między bitami, bajtami, KB, MB, GB, TB i PB natychmiast.',
            short_answer: 'Ten konwerter przelicza wartość danych między bitami, bajtami, KB, MB, GB, TB i PB.',
            intro_text: '<p>Rozmiary plików, pojemności dysków i pamięć są wyrażane w różnych jednostkach w zależności od skali — bajty dla małych plików, aż po gigabajty i terabajty dla dysków i kopii zapasowych.</p><p>To narzędzie przelicza między wszystkimi siedmioma bezpośrednio, używając standardowej konwencji binarnej, gdzie każda jednostka jest 1024 razy większa od poprzedniej.</p>',
            key_points: [
                '<b>Konwencja binarna:</b> 1 KB = 1024 bajty, 1 MB = 1024 KB, i tak dalej.',
                '<b>Bity a bajty:</b> 1 bajt = 8 bitów; prędkości sieciowe są zwykle podawane w bitach, a rozmiary plików w bajtach.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę, aby przeliczyć między dowolnymi dwiema z siedmiu jednostek.',
            ],
            howto: [
                { question: 'Ile MB jest w 1 GB?', answer: '<p>1024 MB, zgodnie z konwencją binarną używaną przez większość systemów operacyjnych.</p>' },
                { question: 'Dlaczego niektóre narzędzia pokazują nieco inne wyniki dla GB?', answer: '<p>Niektórzy producenci używają dziesiętnych (opartych na 1000) GB do marketingu pojemności pamięci, podczas gdy systemy operacyjne zwykle podają binarne (oparte na 1024) GB.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.pl, type: 'select', options: storageUnitOptions('pl') },
                { name: 'to_unit', label: TO_LABEL.pl, type: 'select', options: storageUnitOptions('pl') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.pl, unitFrom: 'to_unit', precision: 4 }],
        },
        es: {
            slug: 'convertidor-de-almacenamiento-de-datos', title: 'Convertidor de Almacenamiento de Datos', h1: 'Convertidor de Almacenamiento de Datos',
            meta_title: 'Convertidor de Datos | Bits, Bytes, KB, MB, GB, TB, PB',
            meta_description: 'Convierte entre bits, bytes, KB, MB, GB, TB y PB al instante.',
            short_answer: 'Este convertidor cambia un valor de almacenamiento de datos entre bits, bytes, KB, MB, GB, TB y PB.',
            intro_text: '<p>Los tamaños de archivo, capacidades de disco y memoria se expresan en diferentes unidades según la escala — bytes para archivos pequeños, hasta gigabytes y terabytes para discos y copias de seguridad.</p><p>Esta herramienta convierte entre las siete directamente, usando la convención binaria estándar donde cada unidad es 1024 veces la anterior.</p>',
            key_points: [
                '<b>Convención binaria:</b> 1 KB = 1024 bytes, 1 MB = 1024 KB, y así sucesivamente.',
                '<b>Bits vs. bytes:</b> 1 byte = 8 bits; las velocidades de red suelen expresarse en bits, mientras que los tamaños de archivo en bytes.',
                '<b>Totalmente flexible:</b> cambia cualquier lista para convertir entre cualquiera de las siete unidades.',
            ],
            howto: [
                { question: '¿Cuántos MB hay en 1 GB?', answer: '<p>1024 MB, siguiendo la convención binaria usada por la mayoría de los sistemas operativos.</p>' },
                { question: '¿Por qué algunas herramientas muestran resultados ligeramente diferentes para GB?', answer: '<p>Algunos fabricantes usan GB decimales (base 1000) para comercializar la capacidad de almacenamiento, mientras que los sistemas operativos suelen reportar GB binarios (base 1024).</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.es, type: 'select', options: storageUnitOptions('es') },
                { name: 'to_unit', label: TO_LABEL.es, type: 'select', options: storageUnitOptions('es') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.es, unitFrom: 'to_unit', precision: 4 }],
        },
        fr: {
            slug: 'convertisseur-de-stockage-de-donnees', title: 'Convertisseur de Stockage de Données', h1: 'Convertisseur de Stockage de Données',
            meta_title: 'Convertisseur de Données | Bits, Octets, Ko, Mo, Go, To, Po',
            meta_description: 'Convertissez entre bits, octets, Ko, Mo, Go, To et Po instantanément.',
            short_answer: 'Ce convertisseur change une valeur de stockage de données entre bits, octets, Ko, Mo, Go, To et Po.',
            intro_text: '<p>Les tailles de fichiers, capacités de disque et mémoire sont exprimées dans différentes unités selon l’échelle — octets pour les petits fichiers, jusqu’aux gigaoctets et téraoctets pour les disques et sauvegardes.</p><p>Cet outil convertit entre les sept directement, en utilisant la convention binaire standard où chaque unité vaut 1024 fois la précédente.</p>',
            key_points: [
                '<b>Convention binaire :</b> 1 Ko = 1024 octets, 1 Mo = 1024 Ko, et ainsi de suite.',
                '<b>Bits vs octets :</b> 1 octet = 8 bits ; les vitesses réseau sont généralement exprimées en bits, tandis que les tailles de fichiers en octets.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste pour convertir entre deux des sept unités.',
            ],
            howto: [
                { question: 'Combien de Mo y a-t-il dans 1 Go ?', answer: '<p>1024 Mo, selon la convention binaire utilisée par la plupart des systèmes d’exploitation.</p>' },
                { question: 'Pourquoi certains outils affichent-ils des résultats légèrement différents pour les Go ?', answer: '<p>Certains fabricants utilisent des Go décimaux (base 1000) pour commercialiser la capacité de stockage, tandis que les systèmes d’exploitation indiquent généralement des Go binaires (base 1024).</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.fr, type: 'select', options: storageUnitOptions('fr') },
                { name: 'to_unit', label: TO_LABEL.fr, type: 'select', options: storageUnitOptions('fr') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.fr, unitFrom: 'to_unit', precision: 4 }],
        },
        it: {
            slug: 'convertitore-di-archiviazione-dati', title: 'Convertitore di Archiviazione Dati', h1: 'Convertitore di Archiviazione Dati',
            meta_title: 'Convertitore di Dati | Bit, Byte, KB, MB, GB, TB, PB',
            meta_description: 'Converti tra bit, byte, KB, MB, GB, TB e PB istantaneamente.',
            short_answer: 'Questo convertitore cambia un valore di archiviazione dati tra bit, byte, KB, MB, GB, TB e PB.',
            intro_text: '<p>Le dimensioni dei file, le capacità dei dischi e la memoria sono espresse in unità diverse a seconda della scala — byte per file piccoli, fino a gigabyte e terabyte per dischi e backup.</p><p>Questo strumento converte tra tutti e sette direttamente, usando la convenzione binaria standard dove ogni unità è 1024 volte la precedente.</p>',
            key_points: [
                '<b>Convenzione binaria:</b> 1 KB = 1024 byte, 1 MB = 1024 KB, e così via.',
                '<b>Bit contro byte:</b> 1 byte = 8 bit; le velocità di rete sono di solito espresse in bit, mentre le dimensioni dei file in byte.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu per convertire tra due delle sette unità.',
            ],
            howto: [
                { question: 'Quanti MB ci sono in 1 GB?', answer: '<p>1024 MB, seguendo la convenzione binaria usata dalla maggior parte dei sistemi operativi.</p>' },
                { question: 'Perché alcuni strumenti mostrano risultati leggermente diversi per i GB?', answer: '<p>Alcuni produttori usano GB decimali (base 1000) per commercializzare la capacità di archiviazione, mentre i sistemi operativi in genere riportano GB binari (base 1024).</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.it, type: 'select', options: storageUnitOptions('it') },
                { name: 'to_unit', label: TO_LABEL.it, type: 'select', options: storageUnitOptions('it') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.it, unitFrom: 'to_unit', precision: 4 }],
        },
        de: {
            slug: 'datenspeicher-umrechner', title: 'Datenspeicher-Umrechner', h1: 'Datenspeicher-Umrechner',
            meta_title: 'Datenumrechner | Bits, Bytes, KB, MB, GB, TB, PB',
            meta_description: 'Rechnen Sie zwischen Bits, Bytes, KB, MB, GB, TB und PB sofort um.',
            short_answer: 'Dieser Umrechner wandelt einen Datenspeicherwert zwischen Bits, Bytes, KB, MB, GB, TB und PB um.',
            intro_text: '<p>Dateigrößen, Festplattenkapazitäten und Speicher werden je nach Größenordnung in unterschiedlichen Einheiten ausgedrückt — Bytes für kleine Dateien, bis hin zu Gigabyte und Terabyte für Laufwerke und Backups.</p><p>Dieses Tool rechnet direkt zwischen allen sieben um, unter Verwendung der binären Konvention, bei der jede Einheit das 1024-fache der vorherigen ist.</p>',
            key_points: [
                '<b>Binäre Konvention:</b> 1 KB = 1024 Bytes, 1 MB = 1024 KB, und so weiter.',
                '<b>Bits vs. Bytes:</b> 1 Byte = 8 Bits; Netzwerkgeschwindigkeiten werden meist in Bits angegeben, Dateigrößen meist in Bytes.',
                '<b>Voll flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der sieben unterstützten Speichereinheiten umzurechnen.',
            ],
            howto: [
                { question: 'Wie viele MB sind in 1 GB?', answer: '<p>1024 MB, gemäß der binären Konvention, die von den meisten Betriebssystemen verwendet wird.</p>' },
                { question: 'Warum zeigen manche Tools leicht unterschiedliche Ergebnisse für GB?', answer: '<p>Manche Hersteller verwenden dezimale (1000-basierte) GB für die Vermarktung der Speicherkapazität, während Betriebssysteme normalerweise binäre (1024-basierte) GB melden.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '1' },
                { name: 'from_unit', label: FROM_LABEL.de, type: 'select', options: storageUnitOptions('de') },
                { name: 'to_unit', label: TO_LABEL.de, type: 'select', options: storageUnitOptions('de') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.de, unitFrom: 'to_unit', precision: 4 }],
        },
    },
}

const FILE_SIZE_LABEL: Record<string, string> = { en: 'File Size', ru: 'Размер файла', de: 'Dateigröße', es: 'Tamaño del Archivo', fr: 'Taille du Fichier', it: 'Dimensione File', pl: 'Rozmiar Pliku', lv: 'Faila Izmērs' }
const SPEED_LABEL: Record<string, string> = { en: 'Connection Speed', ru: 'Скорость соединения', de: 'Verbindungsgeschwindigkeit', es: 'Velocidad de Conexión', fr: 'Vitesse de Connexion', it: 'Velocità di Connessione', pl: 'Prędkość Połączenia', lv: 'Savienojuma Ātrums' }
const HOURS_LABEL: Record<string, string> = { en: 'Hours', ru: 'Часы', de: 'Stunden', es: 'Horas', fr: 'Heures', it: 'Ore', pl: 'Godziny', lv: 'Stundas' }
const MINUTES_LABEL: Record<string, string> = { en: 'Minutes', ru: 'Минуты', de: 'Minuten', es: 'Minutos', fr: 'Minutes', it: 'Minuti', pl: 'Minuty', lv: 'Minūtes' }
const SECONDS_LABEL: Record<string, string> = { en: 'Seconds', ru: 'Секунды', de: 'Sekunden', es: 'Segundos', fr: 'Secondes', it: 'Secondi', pl: 'Sekundy', lv: 'Sekundes' }

function fileSizeUnitOptions(lang: string) {
    const labels = STORAGE_UNIT_LABELS[lang] || STORAGE_UNIT_LABELS.en
    return ['MB', 'GB', 'TB'].map((code) => ({ value: code, label: labels[code], abbr: code }))
}
function speedUnitOptions(lang: string) {
    const l: Record<string, [string, string, string]> = {
        en: ['Kbps (kilobits/s)', 'Mbps (megabits/s)', 'Gbps (gigabits/s)'],
        ru: ['Кбит/с', 'Мбит/с', 'Гбит/с'],
        de: ['Kbit/s', 'Mbit/s', 'Gbit/s'],
        es: ['Kbps (kilobits/s)', 'Mbps (megabits/s)', 'Gbps (gigabits/s)'],
        fr: ['Kbit/s', 'Mbit/s', 'Gbit/s'],
        it: ['Kbit/s', 'Mbit/s', 'Gbit/s'],
        pl: ['Kb/s', 'Mb/s', 'Gb/s'],
        lv: ['Kbps', 'Mbps', 'Gbps'],
    }
    const [k, m, g] = l[lang] || l.en
    return [{ value: 'Kbps', label: k, abbr: 'Kbps' }, { value: 'Mbps', label: m, abbr: 'Mbps' }, { value: 'Gbps', label: g, abbr: 'Gbps' }]
}

// ============================================================
// 1146: Download Time Calculator
// ============================================================
const downloadTimeCalculatorTool: ToolDef = {
    id: '1146',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'file_size', default: 1 }, { key: 'file_size_unit', default: 'GB' }, { key: 'speed', default: 100 }, { key: 'speed_unit', default: 'Mbps' }],
        functions: { result: { type: 'function', functionName: 'downloadTimeCalculator', params: { file_size: 'file_size', file_size_unit: 'file_size_unit', speed: 'speed', speed_unit: 'speed_unit' } } },
        outputs: [{ key: 'hours' }, { key: 'minutes' }, { key: 'seconds' }, { key: 'total_seconds', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'download-time-calculator', title: 'Download Time Calculator', h1: 'Download Time Calculator',
            meta_title: 'Download Time Calculator | Estimate Time from File Size and Speed',
            meta_description: 'Estimate how long a download will take based on file size and your connection speed.',
            short_answer: 'This calculator estimates download time from a file size and connection speed, e.g. a 1 GB file at 100 Mbps takes about 1 minute 26 seconds.',
            intro_text: '<p>Enter a file size and your connection speed to estimate how long the download will take — useful for planning large downloads or comparing internet plans.</p>',
            key_points: [
                '<b>Units matter:</b> file size is measured in bytes (this tool uses binary/1,024-based MB, GB, TB), while connection speed is measured in bits per second (Mbps, using the decimal/1,000-based convention ISPs advertise) — 1 byte = 8 bits.',
                '<b>Formula:</b> time (seconds) = (file size in bytes × 8) ÷ (speed in bits per second).',
                '<b>Real-world note:</b> actual download speed is often lower than the advertised connection speed due to network overhead, so treat this as a best-case estimate.',
            ],
            howto: [
                { question: 'How long does a 1 GB file take at 100 Mbps?', answer: '<p>About 1 minute 26 seconds (1 GB = 8,589,934,592 bits ÷ 100,000,000 bps ≈ 85.9 seconds).</p>' },
                { question: 'Why is my actual download slower than this estimate?', answer: '<p>Advertised speeds are theoretical maximums — real-world factors like network congestion, Wi-Fi signal, and server limits usually reduce actual throughput.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.en, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('en'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.en, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('en'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.en }, { name: 'minutes', label: MINUTES_LABEL.en }, { name: 'seconds', label: SECONDS_LABEL.en },
                { name: 'total_seconds', label: 'Total Seconds', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-vremeni-zagruzki', title: 'Калькулятор времени загрузки', h1: 'Калькулятор времени загрузки',
            meta_title: 'Калькулятор времени загрузки | Оценка по размеру файла и скорости',
            meta_description: 'Оцените, сколько времени займёт загрузка на основе размера файла и скорости соединения.',
            short_answer: 'Этот калькулятор оценивает время загрузки по размеру файла и скорости соединения, например файл 1 ГБ при 100 Мбит/с занимает около 1 минуты 26 секунд.',
            intro_text: '<p>Введите размер файла и скорость вашего соединения, чтобы оценить, сколько времени займёт загрузка.</p>',
            key_points: [
                '<b>Единицы важны:</b> размер файла измеряется в байтах (двоичные МБ/ГБ/ТБ), а скорость соединения — в битах в секунду (Мбит/с, десятичное соглашение) — 1 байт = 8 бит.',
                '<b>Формула:</b> время (секунды) = (размер файла в байтах × 8) ÷ (скорость в битах в секунду).',
                '<b>На практике:</b> реальная скорость загрузки часто ниже заявленной из-за сетевых накладных расходов.',
            ],
            howto: [
                { question: 'Сколько времени займёт файл 1 ГБ при 100 Мбит/с?', answer: '<p>Около 1 минуты 26 секунд.</p>' },
                { question: 'Почему моя реальная загрузка медленнее этой оценки?', answer: '<p>Заявленные скорости — это теоретические максимумы; перегрузка сети, сигнал Wi-Fi и ограничения сервера обычно снижают реальную пропускную способность.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.ru, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('ru'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.ru, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('ru'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.ru }, { name: 'minutes', label: MINUTES_LABEL.ru }, { name: 'seconds', label: SECONDS_LABEL.ru },
                { name: 'total_seconds', label: 'Всего секунд', precision: 1 },
            ],
        },
        lv: {
            slug: 'lejupielades-laika-kalkulators', title: 'Lejupielādes Laika Kalkulators', h1: 'Lejupielādes Laika Kalkulators',
            meta_title: 'Lejupielādes Laika Kalkulators | Novērtējiet Laiku no Faila Izmēra un Ātruma',
            meta_description: 'Novērtējiet, cik ilgi ilgs lejupielāde, pamatojoties uz faila izmēru un jūsu savienojuma ātrumu.',
            short_answer: 'Šis kalkulators novērtē lejupielādes laiku no faila izmēra un savienojuma ātruma, piemēram, 1 GB fails ar 100 Mbps aizņem apmēram 1 minūti 26 sekundes.',
            intro_text: '<p>Ievadiet faila izmēru un jūsu savienojuma ātrumu, lai novērtētu, cik ilgi aizņems lejupielāde.</p>',
            key_points: [
                '<b>Vienības ir svarīgas:</b> faila izmērs tiek mērīts baitos (binārie MB/GB/TB), bet savienojuma ātrums — bitos sekundē (Mbps, decimālā konvencija) — 1 baits = 8 biti.',
                '<b>Formula:</b> laiks (sekundes) = (faila izmērs baitos × 8) ÷ (ātrums bitos sekundē).',
                '<b>Praksē:</b> reālais lejupielādes ātrums bieži ir zemāks par paziņoto sakarā ar tīkla papildizmaksām.',
            ],
            howto: [
                { question: 'Cik ilgi aizņem 1 GB fails ar 100 Mbps?', answer: '<p>Apmēram 1 minūti 26 sekundes.</p>' },
                { question: 'Kāpēc mana reālā lejupielāde ir lēnāka par šo novērtējumu?', answer: '<p>Paziņotie ātrumi ir teorētiskie maksimumi — tīkla pārslodze, Wi-Fi signāls un servera ierobežojumi parasti samazina reālo caurlaidspēju.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.lv, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('lv'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.lv, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('lv'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.lv }, { name: 'minutes', label: MINUTES_LABEL.lv }, { name: 'seconds', label: SECONDS_LABEL.lv },
                { name: 'total_seconds', label: 'Kopā Sekundes', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-czasu-pobierania', title: 'Kalkulator Czasu Pobierania', h1: 'Kalkulator Czasu Pobierania',
            meta_title: 'Kalkulator Czasu Pobierania | Oszacuj Czas na Podstawie Rozmiaru Pliku i Prędkości',
            meta_description: 'Oszacuj, ile potrwa pobieranie na podstawie rozmiaru pliku i prędkości połączenia.',
            short_answer: 'Ten kalkulator szacuje czas pobierania na podstawie rozmiaru pliku i prędkości połączenia, np. plik 1 GB przy 100 Mb/s zajmuje około 1 minuty 26 sekund.',
            intro_text: '<p>Wprowadź rozmiar pliku i prędkość swojego połączenia, aby oszacować, ile potrwa pobieranie.</p>',
            key_points: [
                '<b>Jednostki mają znaczenie:</b> rozmiar pliku mierzony jest w bajtach (binarne MB/GB/TB), a prędkość połączenia w bitach na sekundę (Mb/s, konwencja dziesiętna) — 1 bajt = 8 bitów.',
                '<b>Wzór:</b> czas (sekundy) = (rozmiar pliku w bajtach × 8) ÷ (prędkość w bitach na sekundę).',
                '<b>W praktyce:</b> rzeczywista prędkość pobierania jest często niższa niż deklarowana z powodu narzutu sieciowego.',
            ],
            howto: [
                { question: 'Ile czasu zajmie plik 1 GB przy 100 Mb/s?', answer: '<p>Około 1 minuty 26 sekund.</p>' },
                { question: 'Dlaczego moje rzeczywiste pobieranie jest wolniejsze niż to oszacowanie?', answer: '<p>Deklarowane prędkości to teoretyczne maksima — zatory sieciowe, sygnał Wi-Fi i ograniczenia serwera zwykle zmniejszają rzeczywistą przepustowość.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.pl, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('pl'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.pl, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('pl'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.pl }, { name: 'minutes', label: MINUTES_LABEL.pl }, { name: 'seconds', label: SECONDS_LABEL.pl },
                { name: 'total_seconds', label: 'Łącznie Sekund', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-de-tiempo-de-descarga', title: 'Calculadora de Tiempo de Descarga', h1: 'Calculadora de Tiempo de Descarga',
            meta_title: 'Calculadora de Tiempo de Descarga | Estima el Tiempo por Tamaño y Velocidad',
            meta_description: 'Estima cuánto tardará una descarga según el tamaño del archivo y tu velocidad de conexión.',
            short_answer: 'Esta calculadora estima el tiempo de descarga a partir del tamaño de archivo y la velocidad de conexión, p. ej. un archivo de 1 GB a 100 Mbps tarda unos 1 minuto 26 segundos.',
            intro_text: '<p>Introduce un tamaño de archivo y tu velocidad de conexión para estimar cuánto tardará la descarga.</p>',
            key_points: [
                '<b>Las unidades importan:</b> el tamaño del archivo se mide en bytes (MB/GB/TB binarios), mientras que la velocidad de conexión se mide en bits por segundo (Mbps, convención decimal) — 1 byte = 8 bits.',
                '<b>Fórmula:</b> tiempo (segundos) = (tamaño del archivo en bytes × 8) ÷ (velocidad en bits por segundo).',
                '<b>En la práctica:</b> la velocidad real de descarga suele ser menor que la anunciada debido a la sobrecarga de red.',
            ],
            howto: [
                { question: '¿Cuánto tarda un archivo de 1 GB a 100 Mbps?', answer: '<p>Unos 1 minuto 26 segundos.</p>' },
                { question: '¿Por qué mi descarga real es más lenta que esta estimación?', answer: '<p>Las velocidades anunciadas son máximos teóricos — la congestión de red, la señal Wi-Fi y los límites del servidor suelen reducir el rendimiento real.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.es, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('es'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.es, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('es'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.es }, { name: 'minutes', label: MINUTES_LABEL.es }, { name: 'seconds', label: SECONDS_LABEL.es },
                { name: 'total_seconds', label: 'Segundos Totales', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-de-temps-de-telechargement', title: 'Calculateur de Temps de Téléchargement', h1: 'Calculateur de Temps de Téléchargement',
            meta_title: 'Calculateur de Temps de Téléchargement | Estimez le Temps selon Taille et Vitesse',
            meta_description: 'Estimez combien de temps prendra un téléchargement selon la taille du fichier et votre vitesse de connexion.',
            short_answer: 'Ce calculateur estime le temps de téléchargement à partir de la taille du fichier et de la vitesse de connexion, ex. un fichier de 1 Go à 100 Mbit/s prend environ 1 minute 26 secondes.',
            intro_text: '<p>Entrez une taille de fichier et votre vitesse de connexion pour estimer combien de temps prendra le téléchargement.</p>',
            key_points: [
                '<b>Les unités comptent :</b> la taille du fichier est mesurée en octets (Mo/Go/To binaires), tandis que la vitesse de connexion est mesurée en bits par seconde (Mbit/s, convention décimale) — 1 octet = 8 bits.',
                '<b>Formule :</b> temps (secondes) = (taille du fichier en octets × 8) ÷ (vitesse en bits par seconde).',
                '<b>En pratique :</b> la vitesse réelle de téléchargement est souvent inférieure à celle annoncée en raison de la surcharge réseau.',
            ],
            howto: [
                { question: 'Combien de temps prend un fichier de 1 Go à 100 Mbit/s ?', answer: '<p>Environ 1 minute 26 secondes.</p>' },
                { question: 'Pourquoi mon téléchargement réel est-il plus lent que cette estimation ?', answer: '<p>Les vitesses annoncées sont des maximums théoriques — la congestion réseau, le signal Wi-Fi et les limites du serveur réduisent généralement le débit réel.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.fr, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('fr'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.fr, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('fr'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.fr }, { name: 'minutes', label: MINUTES_LABEL.fr }, { name: 'seconds', label: SECONDS_LABEL.fr },
                { name: 'total_seconds', label: 'Total Secondes', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-di-tempo-di-download', title: 'Calcolatore di Tempo di Download', h1: 'Calcolatore di Tempo di Download',
            meta_title: 'Calcolatore di Tempo di Download | Stima il Tempo da Dimensione e Velocità',
            meta_description: 'Stima quanto tempo richiederà un download in base alla dimensione del file e alla velocità di connessione.',
            short_answer: 'Questo calcolatore stima il tempo di download da una dimensione del file e velocità di connessione, es. un file da 1 GB a 100 Mbps richiede circa 1 minuto e 26 secondi.',
            intro_text: '<p>Inserisci una dimensione del file e la tua velocità di connessione per stimare quanto tempo richiederà il download.</p>',
            key_points: [
                '<b>Le unità contano:</b> la dimensione del file è misurata in byte (MB/GB/TB binari), mentre la velocità di connessione è misurata in bit al secondo (Mbps, convenzione decimale) — 1 byte = 8 bit.',
                '<b>Formula:</b> tempo (secondi) = (dimensione del file in byte × 8) ÷ (velocità in bit al secondo).',
                '<b>Nella pratica:</b> la velocità di download reale è spesso inferiore a quella pubblicizzata a causa del sovraccarico di rete.',
            ],
            howto: [
                { question: 'Quanto tempo richiede un file da 1 GB a 100 Mbps?', answer: '<p>Circa 1 minuto e 26 secondi.</p>' },
                { question: 'Perché il mio download reale è più lento di questa stima?', answer: '<p>Le velocità pubblicizzate sono massimi teorici — congestione di rete, segnale Wi-Fi e limiti del server di solito riducono il throughput reale.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.it, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('it'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.it, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('it'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.it }, { name: 'minutes', label: MINUTES_LABEL.it }, { name: 'seconds', label: SECONDS_LABEL.it },
                { name: 'total_seconds', label: 'Secondi Totali', precision: 1 },
            ],
        },
        de: {
            slug: 'download-zeit-rechner', title: 'Download-Zeit-Rechner', h1: 'Download-Zeit-Rechner',
            meta_title: 'Download-Zeit-Rechner | Zeit aus Dateigröße und Geschwindigkeit Schätzen',
            meta_description: 'Schätzen Sie, wie lange ein Download basierend auf Dateigröße und Verbindungsgeschwindigkeit dauert.',
            short_answer: 'Dieser Rechner schätzt die Download-Zeit aus Dateigröße und Verbindungsgeschwindigkeit, z.B. eine 1-GB-Datei bei 100 Mbit/s dauert etwa 1 Minute 26 Sekunden.',
            intro_text: '<p>Geben Sie eine Dateigröße und Ihre Verbindungsgeschwindigkeit ein, um zu schätzen, wie lange der Download dauern wird.</p>',
            key_points: [
                '<b>Einheiten sind wichtig:</b> Dateigröße wird in Bytes gemessen (binäre MB/GB/TB), während die Verbindungsgeschwindigkeit in Bit pro Sekunde gemessen wird (Mbit/s, dezimale Konvention) — 1 Byte = 8 Bit.',
                '<b>Formel:</b> Zeit (Sekunden) = (Dateigröße in Bytes × 8) ÷ (Geschwindigkeit in Bit pro Sekunde).',
                '<b>In der Praxis:</b> die tatsächliche Download-Geschwindigkeit ist oft niedriger als die beworbene aufgrund von Netzwerk-Overhead.',
            ],
            howto: [
                { question: 'Wie lange dauert eine 1-GB-Datei bei 100 Mbit/s?', answer: '<p>Etwa 1 Minute 26 Sekunden.</p>' },
                { question: 'Warum ist mein tatsächlicher Download langsamer als diese Schätzung?', answer: '<p>Beworbene Geschwindigkeiten sind theoretische Maximalwerte — Netzwerküberlastung, WLAN-Signal und Serverbeschränkungen reduzieren normalerweise den tatsächlichen Durchsatz.</p>' },
            ],
            inputs: [
                { name: 'file_size', label: FILE_SIZE_LABEL.de, type: 'number', min: 0, max: 1000000, placeholder: '1' },
                { name: 'file_size_unit', label: '', type: 'select', options: fileSizeUnitOptions('de'), default: 'GB' },
                { name: 'speed', label: SPEED_LABEL.de, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'speed_unit', label: '', type: 'select', options: speedUnitOptions('de'), default: 'Mbps' },
            ],
            outputs: [
                { name: 'hours', label: HOURS_LABEL.de }, { name: 'minutes', label: MINUTES_LABEL.de }, { name: 'seconds', label: SECONDS_LABEL.de },
                { name: 'total_seconds', label: 'Sekunden Gesamt', precision: 1 },
            ],
        },
    },
}

const BASE_UNIT_ORDER = ['binary', 'octal', 'decimal', 'hexadecimal']
const BASE_UNIT_LABELS: Record<string, Record<string, string>> = {
    en: { binary: 'Binary (base 2)', octal: 'Octal (base 8)', decimal: 'Decimal (base 10)', hexadecimal: 'Hexadecimal (base 16)' },
    ru: { binary: 'Двоичная (осн. 2)', octal: 'Восьмеричная (осн. 8)', decimal: 'Десятичная (осн. 10)', hexadecimal: 'Шестнадцатеричная (осн. 16)' },
    de: { binary: 'Binär (Basis 2)', octal: 'Oktal (Basis 8)', decimal: 'Dezimal (Basis 10)', hexadecimal: 'Hexadezimal (Basis 16)' },
    es: { binary: 'Binario (base 2)', octal: 'Octal (base 8)', decimal: 'Decimal (base 10)', hexadecimal: 'Hexadecimal (base 16)' },
    fr: { binary: 'Binaire (base 2)', octal: 'Octal (base 8)', decimal: 'Décimal (base 10)', hexadecimal: 'Hexadécimal (base 16)' },
    it: { binary: 'Binario (base 2)', octal: 'Ottale (base 8)', decimal: 'Decimale (base 10)', hexadecimal: 'Esadecimale (base 16)' },
    pl: { binary: 'Binarny (podstawa 2)', octal: 'Ósemkowy (podstawa 8)', decimal: 'Dziesiętny (podstawa 10)', hexadecimal: 'Szesnastkowy (podstawa 16)' },
    lv: { binary: 'Binārā (bāze 2)', octal: 'Astoņniekā (bāze 8)', decimal: 'Decimālā (bāze 10)', hexadecimal: 'Heksadecimālā (bāze 16)' },
}
function baseUnitOptions(lang: string) {
    const labels = BASE_UNIT_LABELS[lang] || BASE_UNIT_LABELS.en
    return BASE_UNIT_ORDER.map((code) => ({ value: code, label: labels[code] }))
}

// ============================================================
// 1147: Number Base Converter (general)
// ============================================================
const numberBaseConverterTool: ToolDef = {
    id: '1147',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: '255' }, { key: 'from_base', default: 'decimal' }, { key: 'to_base', default: 'hexadecimal' }],
        functions: { result: { type: 'function', functionName: 'numberBaseConverter', params: { value: 'value', from_base: 'from_base', to_base: 'to_base' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'number-base-converter', title: 'Number Base Converter', h1: 'Number Base Converter',
            meta_title: 'Number Base Converter | Binary, Octal, Decimal, Hexadecimal',
            meta_description: 'Convert numbers between binary, octal, decimal, and hexadecimal instantly.',
            short_answer: 'This converter changes a number between binary, octal, decimal, and hexadecimal using the selectors below.',
            intro_text: '<p>Different number bases are used across computing and mathematics — binary for how computers store data, hexadecimal for compact byte representations (like color codes), octal in some legacy systems, and decimal for everyday use.</p><p>This tool converts between all four directly.</p>',
            key_points: [
                '<b>Binary (base 2):</b> uses only digits 0-1, the native representation for digital computing.',
                '<b>Hexadecimal (base 16):</b> uses digits 0-9 and letters A-F, commonly used for memory addresses and color codes (e.g. #FF5733).',
                '<b>Fully flexible:</b> change either dropdown to convert between any two of the four supported number bases.',
            ],
            howto: [
                { question: 'How do I convert decimal 255 to hexadecimal?', answer: '<p>255 in decimal equals FF in hexadecimal — select "Decimal" as From and "Hexadecimal" as To.</p>' },
                { question: 'What happens if I enter invalid characters for the selected base?', answer: '<p>The calculator shows "Invalid input" — for example, entering "2" while "Binary" is selected as From, since binary only allows 0 and 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.en, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.en, type: 'select', options: baseUnitOptions('en') },
                { name: 'to_base', label: TO_LABEL.en, type: 'select', options: baseUnitOptions('en') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.en }],
        },
        ru: {
            slug: 'konverter-sistem-schisleniya', title: 'Конвертер систем счисления', h1: 'Конвертер систем счисления',
            meta_title: 'Конвертер систем счисления | Двоичная, восьмеричная, десятичная, шестнадцатеричная',
            meta_description: 'Конвертируйте числа между двоичной, восьмеричной, десятичной и шестнадцатеричной системами мгновенно.',
            short_answer: 'Этот конвертер переводит число между двоичной, восьмеричной, десятичной и шестнадцатеричной системами.',
            intro_text: '<p>Разные системы счисления используются в вычислениях и математике — двоичная для хранения данных компьютерами, шестнадцатеричная для компактного представления байтов (например, цветовые коды), восьмеричная в некоторых устаревших системах.</p><p>Этот инструмент конвертирует между всеми четырьмя напрямую.</p>',
            key_points: [
                '<b>Двоичная (осн. 2):</b> использует только цифры 0-1, родное представление для цифровых вычислений.',
                '<b>Шестнадцатеричная (осн. 16):</b> использует цифры 0-9 и буквы A-F, обычно для адресов памяти и цветовых кодов.',
                '<b>Полностью гибкий:</b> измените любой список, чтобы конвертировать между любыми двумя из четырёх систем.',
            ],
            howto: [
                { question: 'Как перевести десятичное 255 в шестнадцатеричное?', answer: '<p>255 в десятичной равно FF в шестнадцатеричной — выберите «Десятичная» как Из и «Шестнадцатеричная» как В.</p>' },
                { question: 'Что если ввести недопустимые символы для выбранной системы?', answer: '<p>Калькулятор покажет «Invalid input» — например, ввод «2» при выбранной двоичной системе, так как в ней допустимы только 0 и 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.ru, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.ru, type: 'select', options: baseUnitOptions('ru') },
                { name: 'to_base', label: TO_LABEL.ru, type: 'select', options: baseUnitOptions('ru') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.ru }],
        },
        lv: {
            slug: 'skaitlu-sistemu-konvertetajs', title: 'Skaitļu Sistēmu Konvertētājs', h1: 'Skaitļu Sistēmu Konvertētājs',
            meta_title: 'Skaitļu Sistēmu Konvertētājs | Binārā, Astoņniekā, Decimālā, Heksadecimālā',
            meta_description: 'Konvertējiet skaitļus starp bināro, astoņnieka, decimālo un heksadecimālo sistēmu acumirklī.',
            short_answer: 'Šis konvertētājs pārrēķina skaitli starp bināro, astoņnieka, decimālo un heksadecimālo sistēmu.',
            intro_text: '<p>Dažādas skaitļu sistēmas tiek izmantotas skaitļošanā un matemātikā — binārā datoru datu glabāšanai, heksadecimālā kompaktai baitu attēlošanai (piemēram, krāsu kodi), astoņnieka dažās mantotās sistēmās.</p><p>Šis rīks konvertē starp visām četrām tieši.</p>',
            key_points: [
                '<b>Binārā (bāze 2):</b> izmanto tikai ciparus 0-1, dabiskais attēlojums ciparu skaitļošanai.',
                '<b>Heksadecimālā (bāze 16):</b> izmanto ciparus 0-9 un burtus A-F, parasti atmiņas adresēm un krāsu kodiem.',
                '<b>Pilnībā elastīgs:</b> mainiet jebkuru sarakstu, lai konvertētu starp jebkurām divām no četrām sistēmām.',
            ],
            howto: [
                { question: 'Kā konvertēt decimālo 255 uz heksadecimālo?', answer: '<p>255 decimālā ir vienāds ar FF heksadecimālā — izvēlieties "Decimālā" kā No un "Heksadecimālā" kā Uz.</p>' },
                { question: 'Kas notiek, ja ievadu nederīgas rakstzīmes izvēlētajai sistēmai?', answer: '<p>Kalkulators parāda "Invalid input" — piemēram, ievadot "2", kad izvēlēta "Binārā" kā No, jo binārā atļauj tikai 0 un 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.lv, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.lv, type: 'select', options: baseUnitOptions('lv') },
                { name: 'to_base', label: TO_LABEL.lv, type: 'select', options: baseUnitOptions('lv') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-systemow-liczbowych', title: 'Konwerter Systemów Liczbowych', h1: 'Konwerter Systemów Liczbowych',
            meta_title: 'Konwerter Systemów Liczbowych | Binarny, Ósemkowy, Dziesiętny, Szesnastkowy',
            meta_description: 'Przelicz liczby między systemem binarnym, ósemkowym, dziesiętnym i szesnastkowym natychmiast.',
            short_answer: 'Ten konwerter przelicza liczbę między systemem binarnym, ósemkowym, dziesiętnym i szesnastkowym.',
            intro_text: '<p>Różne systemy liczbowe są używane w informatyce i matematyce — binarny do przechowywania danych przez komputery, szesnastkowy do zwartej reprezentacji bajtów (np. kody kolorów), ósemkowy w niektórych starszych systemach.</p><p>To narzędzie przelicza między wszystkimi czterema bezpośrednio.</p>',
            key_points: [
                '<b>Binarny (podstawa 2):</b> używa tylko cyfr 0-1, naturalna reprezentacja dla informatyki cyfrowej.',
                '<b>Szesnastkowy (podstawa 16):</b> używa cyfr 0-9 i liter A-F, powszechnie stosowany dla adresów pamięci i kodów kolorów.',
                '<b>W pełni elastyczny:</b> zmień dowolną listę, aby przeliczyć między dowolnymi dwoma z czterech systemów.',
            ],
            howto: [
                { question: 'Jak przeliczyć dziesiętne 255 na szesnastkowe?', answer: '<p>255 dziesiętnie to FF szesnastkowo — wybierz "Dziesiętny" jako Z i "Szesnastkowy" jako Na.</p>' },
                { question: 'Co się stanie, jeśli wpiszę nieprawidłowe znaki dla wybranego systemu?', answer: '<p>Kalkulator pokaże "Invalid input" — np. wpisanie "2" przy wybranym systemie binarnym, ponieważ binarny dopuszcza tylko 0 i 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.pl, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.pl, type: 'select', options: baseUnitOptions('pl') },
                { name: 'to_base', label: TO_LABEL.pl, type: 'select', options: baseUnitOptions('pl') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-sistemas-numericos', title: 'Convertidor de Sistemas Numéricos', h1: 'Convertidor de Sistemas Numéricos',
            meta_title: 'Convertidor de Sistemas Numéricos | Binario, Octal, Decimal, Hexadecimal',
            meta_description: 'Convierte números entre binario, octal, decimal y hexadecimal al instante.',
            short_answer: 'Este convertidor cambia un número entre binario, octal, decimal y hexadecimal.',
            intro_text: '<p>Diferentes sistemas numéricos se usan en informática y matemáticas — binario para cómo las computadoras almacenan datos, hexadecimal para representaciones compactas de bytes (como códigos de color), octal en algunos sistemas antiguos.</p><p>Esta herramienta convierte entre los cuatro directamente.</p>',
            key_points: [
                '<b>Binario (base 2):</b> usa solo los dígitos 0-1, la representación nativa de la informática digital.',
                '<b>Hexadecimal (base 16):</b> usa dígitos 0-9 y letras A-F, comúnmente para direcciones de memoria y códigos de color.',
                '<b>Totalmente flexible:</b> cambia cualquier lista para convertir entre cualquiera de los cuatro sistemas.',
            ],
            howto: [
                { question: '¿Cómo convierto el decimal 255 a hexadecimal?', answer: '<p>255 en decimal equivale a FF en hexadecimal — selecciona "Decimal" como De y "Hexadecimal" como A.</p>' },
                { question: '¿Qué pasa si introduzco caracteres inválidos para el sistema seleccionado?', answer: '<p>La calculadora muestra "Invalid input" — por ejemplo, introducir "2" con "Binario" seleccionado como De, ya que el binario solo permite 0 y 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.es, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.es, type: 'select', options: baseUnitOptions('es') },
                { name: 'to_base', label: TO_LABEL.es, type: 'select', options: baseUnitOptions('es') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-de-bases-numeriques', title: 'Convertisseur de Bases Numériques', h1: 'Convertisseur de Bases Numériques',
            meta_title: 'Convertisseur de Bases Numériques | Binaire, Octal, Décimal, Hexadécimal',
            meta_description: 'Convertissez des nombres entre binaire, octal, décimal et hexadécimal instantanément.',
            short_answer: 'Ce convertisseur change un nombre entre binaire, octal, décimal et hexadécimal.',
            intro_text: '<p>Différentes bases numériques sont utilisées en informatique et en mathématiques — binaire pour le stockage des données par les ordinateurs, hexadécimal pour des représentations compactes d’octets (comme les codes couleur), octal dans certains systèmes hérités.</p><p>Cet outil convertit entre les quatre directement.</p>',
            key_points: [
                '<b>Binaire (base 2) :</b> utilise uniquement les chiffres 0-1, la représentation native de l’informatique numérique.',
                '<b>Hexadécimal (base 16) :</b> utilise les chiffres 0-9 et les lettres A-F, couramment utilisé pour les adresses mémoire et les codes couleur.',
                '<b>Entièrement flexible :</b> changez n’importe quelle liste pour convertir entre deux des quatre systèmes.',
            ],
            howto: [
                { question: 'Comment convertir le décimal 255 en hexadécimal ?', answer: '<p>255 en décimal équivaut à FF en hexadécimal — sélectionnez "Décimal" comme De et "Hexadécimal" comme Vers.</p>' },
                { question: 'Que se passe-t-il si j’entre des caractères invalides pour la base sélectionnée ?', answer: '<p>Le calculateur affiche "Invalid input" — par exemple, entrer "2" avec "Binaire" sélectionné comme De, car le binaire n’autorise que 0 et 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.fr, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.fr, type: 'select', options: baseUnitOptions('fr') },
                { name: 'to_base', label: TO_LABEL.fr, type: 'select', options: baseUnitOptions('fr') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-di-basi-numeriche', title: 'Convertitore di Basi Numeriche', h1: 'Convertitore di Basi Numeriche',
            meta_title: 'Convertitore di Basi Numeriche | Binario, Ottale, Decimale, Esadecimale',
            meta_description: 'Converti numeri tra binario, ottale, decimale ed esadecimale istantaneamente.',
            short_answer: 'Questo convertitore cambia un numero tra binario, ottale, decimale ed esadecimale.',
            intro_text: '<p>Diverse basi numeriche sono usate nell’informatica e nella matematica — binaria per come i computer memorizzano i dati, esadecimale per rappresentazioni compatte di byte (come i codici colore), ottale in alcuni sistemi legacy.</p><p>Questo strumento converte tra tutte e quattro direttamente.</p>',
            key_points: [
                '<b>Binario (base 2):</b> usa solo le cifre 0-1, la rappresentazione nativa per l’informatica digitale.',
                '<b>Esadecimale (base 16):</b> usa cifre 0-9 e lettere A-F, comunemente usato per indirizzi di memoria e codici colore.',
                '<b>Completamente flessibile:</b> cambia qualsiasi menu per convertire tra due dei quattro sistemi.',
            ],
            howto: [
                { question: 'Come converto il decimale 255 in esadecimale?', answer: '<p>255 in decimale equivale a FF in esadecimale — seleziona "Decimale" come Da e "Esadecimale" come A.</p>' },
                { question: 'Cosa succede se inserisco caratteri non validi per la base selezionata?', answer: '<p>Il calcolatore mostra "Invalid input" — ad esempio, inserendo "2" con "Binario" selezionato come Da, poiché il binario ammette solo 0 e 1.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.it, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.it, type: 'select', options: baseUnitOptions('it') },
                { name: 'to_base', label: TO_LABEL.it, type: 'select', options: baseUnitOptions('it') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.it }],
        },
        de: {
            slug: 'zahlensystem-umrechner', title: 'Zahlensystem-Umrechner', h1: 'Zahlensystem-Umrechner',
            meta_title: 'Zahlensystem-Umrechner | Binär, Oktal, Dezimal, Hexadezimal',
            meta_description: 'Rechnen Sie Zahlen zwischen Binär-, Oktal-, Dezimal- und Hexadezimalsystem sofort um.',
            short_answer: 'Dieser Umrechner wandelt eine Zahl zwischen Binär-, Oktal-, Dezimal- und Hexadezimalsystem um.',
            intro_text: '<p>Verschiedene Zahlensysteme werden in Informatik und Mathematik verwendet — binär für die Datenspeicherung von Computern, hexadezimal für kompakte Byte-Darstellungen (wie Farbcodes), oktal in einigen älteren Systemen.</p><p>Dieses Tool rechnet direkt zwischen allen vieren um.</p>',
            key_points: [
                '<b>Binär (Basis 2):</b> verwendet nur die Ziffern 0-1, die native Darstellung für die digitale Datenverarbeitung.',
                '<b>Hexadezimal (Basis 16):</b> verwendet Ziffern 0-9 und Buchstaben A-F, häufig für Speicheradressen und Farbcodes.',
                '<b>Voll flexibel:</b> ändern Sie eines der Dropdown-Menüs, um zwischen zwei der vier unterstützten Zahlensysteme umzurechnen.',
            ],
            howto: [
                { question: 'Wie rechne ich Dezimal 255 in Hexadezimal um?', answer: '<p>255 dezimal entspricht FF hexadezimal — wählen Sie "Dezimal" als Von und "Hexadezimal" als Nach.</p>' },
                { question: 'Was passiert, wenn ich ungültige Zeichen für das gewählte System eingebe?', answer: '<p>Der Rechner zeigt "Invalid input" — zum Beispiel bei Eingabe von "2", während "Binär" als Von ausgewählt ist, da Binär nur 0 und 1 zulässt.</p>' },
            ],
            inputs: [
                { name: 'value', label: VALUE_LABEL.de, type: 'text', placeholder: '255' },
                { name: 'from_base', label: FROM_LABEL.de, type: 'select', options: baseUnitOptions('de') },
                { name: 'to_base', label: TO_LABEL.de, type: 'select', options: baseUnitOptions('de') },
            ],
            outputs: [{ name: 'result', label: CONVERTED_LABEL.de }],
        },
    },
}

const BINARY_LABEL: Record<string, string> = { en: 'Binary Number', ru: 'Двоичное число', de: 'Binärzahl', es: 'Número Binario', fr: 'Nombre Binaire', it: 'Numero Binario', pl: 'Liczba Binarna', lv: 'Binārais Skaitlis' }
const DECIMAL_LABEL: Record<string, string> = { en: 'Decimal Number', ru: 'Десятичное число', de: 'Dezimalzahl', es: 'Número Decimal', fr: 'Nombre Décimal', it: 'Numero Decimale', pl: 'Liczba Dziesiętna', lv: 'Decimālais Skaitlis' }
const HEX_LABEL: Record<string, string> = { en: 'Hexadecimal Number', ru: 'Шестнадцатеричное число', de: 'Hexadezimalzahl', es: 'Número Hexadecimal', fr: 'Nombre Hexadécimal', it: 'Numero Esadecimale', pl: 'Liczba Szesnastkowa', lv: 'Heksadecimālais Skaitlis' }

// ============================================================
// 1148: Binary to Decimal Converter
// ============================================================
const binaryToDecimalTool: ToolDef = {
    id: '1148',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: '1010' }],
        functions: { result: { type: 'function', functionName: 'binaryToDecimal', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'binary-to-decimal-converter', title: 'Binary to Decimal Converter', h1: 'Binary to Decimal Converter',
            meta_title: 'Binary to Decimal Converter | Convert Base 2 to Base 10',
            meta_description: 'Convert a binary number into decimal instantly with this simple converter.',
            short_answer: 'This calculator converts a binary number into decimal, e.g. 1010 (binary) = 10 (decimal).',
            intro_text: '<p>Enter a binary number (using only 0s and 1s) to instantly see its decimal equivalent — useful for computer science studies or working with low-level data.</p>',
            key_points: [
                '<b>Method:</b> each binary digit represents a power of 2, read right to left (1, 2, 4, 8, 16...); the decimal value is the sum of powers where the binary digit is 1.',
                '<b>Example:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Only 0s and 1s:</b> any other character makes the input invalid, since binary only has two digits.',
            ],
            howto: [
                { question: 'What is 11111111 in decimal?', answer: '<p>255 — this is the maximum value representable in 8 bits (a byte).</p>' },
                { question: 'What is 100000 in decimal?', answer: '<p>32, since it\'s 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.en, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.en }],
        },
        ru: {
            slug: 'kalkulyator-dvoichnogo-v-desyatichnoe', title: 'Калькулятор двоичного в десятичное', h1: 'Калькулятор двоичного в десятичное',
            meta_title: 'Двоичное в десятичное | Конвертер из системы 2 в систему 10',
            meta_description: 'Конвертируйте двоичное число в десятичное мгновенно с помощью этого простого конвертера.',
            short_answer: 'Этот калькулятор конвертирует двоичное число в десятичное, например 1010 (двоичное) = 10 (десятичное).',
            intro_text: '<p>Введите двоичное число (используя только 0 и 1), чтобы мгновенно увидеть его десятичный эквивалент.</p>',
            key_points: [
                '<b>Метод:</b> каждая двоичная цифра представляет степень двойки, считая справа налево (1, 2, 4, 8, 16...).',
                '<b>Пример:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Только 0 и 1:</b> любой другой символ делает ввод недопустимым.',
            ],
            howto: [
                { question: 'Сколько это 11111111 в десятичной?', answer: '<p>255 — максимальное значение, представимое 8 битами (байтом).</p>' },
                { question: 'Сколько это 100000 в десятичной?', answer: '<p>32, так как это 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.ru, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.ru }],
        },
        lv: {
            slug: 'binara-uz-decimalo-kalkulators', title: 'Binārā uz Decimālo Kalkulators', h1: 'Binārā uz Decimālo Kalkulators',
            meta_title: 'Binārā uz Decimālo | Konvertētājs no Bāzes 2 uz Bāzi 10',
            meta_description: 'Konvertējiet binārā skaitli uz decimālo acumirklī ar šo vienkāršo konvertētāju.',
            short_answer: 'Šis kalkulators konvertē binārā skaitli uz decimālo, piemēram, 1010 (binārā) = 10 (decimālā).',
            intro_text: '<p>Ievadiet binārā skaitli (izmantojot tikai 0 un 1), lai uzreiz redzētu tā decimālo ekvivalentu.</p>',
            key_points: [
                '<b>Metode:</b> katrs binārais cipars pārstāv divnieka pakāpi, skaitot no labās uz kreiso (1, 2, 4, 8, 16...).',
                '<b>Piemērs:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Tikai 0 un 1:</b> jebkura cita rakstzīme padara ievadi nederīgu.',
            ],
            howto: [
                { question: 'Cik ir 11111111 decimālā?', answer: '<p>255 — maksimālā vērtība, ko var attēlot 8 bitos (baitā).</p>' },
                { question: 'Cik ir 100000 decimālā?', answer: '<p>32, jo tas ir 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.lv, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.lv }],
        },
        pl: {
            slug: 'kalkulator-binarnego-na-dziesietny', title: 'Kalkulator Binarnego na Dziesiętny', h1: 'Kalkulator Binarnego na Dziesiętny',
            meta_title: 'Binarny na Dziesiętny | Konwerter z Podstawy 2 na Podstawę 10',
            meta_description: 'Przelicz liczbę binarną na dziesiętną natychmiast za pomocą tego prostego konwertera.',
            short_answer: 'Ten kalkulator przelicza liczbę binarną na dziesiętną, np. 1010 (binarnie) = 10 (dziesiętnie).',
            intro_text: '<p>Wpisz liczbę binarną (używając tylko 0 i 1), aby natychmiast zobaczyć jej odpowiednik dziesiętny.</p>',
            key_points: [
                '<b>Metoda:</b> każda cyfra binarna reprezentuje potęgę 2, licząc od prawej do lewej (1, 2, 4, 8, 16...).',
                '<b>Przykład:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Tylko 0 i 1:</b> każdy inny znak sprawia, że wejście jest nieprawidłowe.',
            ],
            howto: [
                { question: 'Ile to 11111111 dziesiętnie?', answer: '<p>255 — maksymalna wartość reprezentowalna w 8 bitach (bajcie).</p>' },
                { question: 'Ile to 100000 dziesiętnie?', answer: '<p>32, ponieważ to 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.pl, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.pl }],
        },
        es: {
            slug: 'calculadora-de-binario-a-decimal', title: 'Calculadora de Binario a Decimal', h1: 'Calculadora de Binario a Decimal',
            meta_title: 'Binario a Decimal | Conversión de Base 2 a Base 10',
            meta_description: 'Convierte un número binario a decimal al instante con este sencillo convertidor.',
            short_answer: 'Esta calculadora convierte un número binario a decimal, p. ej. 1010 (binario) = 10 (decimal).',
            intro_text: '<p>Introduce un número binario (usando solo 0 y 1) para ver al instante su equivalente decimal.</p>',
            key_points: [
                '<b>Método:</b> cada dígito binario representa una potencia de 2, leyendo de derecha a izquierda (1, 2, 4, 8, 16...).',
                '<b>Ejemplo:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Solo 0 y 1:</b> cualquier otro carácter hace que la entrada sea inválida.',
            ],
            howto: [
                { question: '¿Cuánto es 11111111 en decimal?', answer: '<p>255 — el valor máximo representable en 8 bits (un byte).</p>' },
                { question: '¿Cuánto es 100000 en decimal?', answer: '<p>32, ya que es 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.es, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.es }],
        },
        fr: {
            slug: 'calculateur-de-binaire-en-decimal', title: 'Calculateur de Binaire en Décimal', h1: 'Calculateur de Binaire en Décimal',
            meta_title: 'Binaire en Décimal | Conversion de Base 2 en Base 10',
            meta_description: 'Convertissez un nombre binaire en décimal instantanément avec ce convertisseur simple.',
            short_answer: 'Ce calculateur convertit un nombre binaire en décimal, ex. 1010 (binaire) = 10 (décimal).',
            intro_text: '<p>Entrez un nombre binaire (en utilisant uniquement 0 et 1) pour voir instantanément son équivalent décimal.</p>',
            key_points: [
                '<b>Méthode :</b> chaque chiffre binaire représente une puissance de 2, lue de droite à gauche (1, 2, 4, 8, 16...).',
                '<b>Exemple :</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Seulement 0 et 1 :</b> tout autre caractère rend l’entrée invalide.',
            ],
            howto: [
                { question: 'Combien fait 11111111 en décimal ?', answer: '<p>255 — la valeur maximale représentable sur 8 bits (un octet).</p>' },
                { question: 'Combien fait 100000 en décimal ?', answer: '<p>32, puisque c’est 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.fr, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.fr }],
        },
        it: {
            slug: 'calcolatore-da-binario-a-decimale', title: 'Calcolatore da Binario a Decimale', h1: 'Calcolatore da Binario a Decimale',
            meta_title: 'Binario in Decimale | Conversione da Base 2 a Base 10',
            meta_description: 'Converti un numero binario in decimale istantaneamente con questo semplice convertitore.',
            short_answer: 'Questo calcolatore converte un numero binario in decimale, es. 1010 (binario) = 10 (decimale).',
            intro_text: '<p>Inserisci un numero binario (usando solo 0 e 1) per vedere subito il suo equivalente decimale.</p>',
            key_points: [
                '<b>Metodo:</b> ogni cifra binaria rappresenta una potenza di 2, letta da destra a sinistra (1, 2, 4, 8, 16...).',
                '<b>Esempio:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Solo 0 e 1:</b> qualsiasi altro carattere rende l’input non valido.',
            ],
            howto: [
                { question: 'Quanto è 11111111 in decimale?', answer: '<p>255 — il valore massimo rappresentabile in 8 bit (un byte).</p>' },
                { question: 'Quanto è 100000 in decimale?', answer: '<p>32, poiché è 1×2⁵ = 32.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.it, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.it }],
        },
        de: {
            slug: 'binaer-in-dezimal-rechner', title: 'Binär in Dezimal Rechner', h1: 'Binär in Dezimal Rechner',
            meta_title: 'Binär in Dezimal | Umrechnung von Basis 2 in Basis 10',
            meta_description: 'Rechnen Sie eine Binärzahl sofort in Dezimal um mit diesem einfachen Umrechner.',
            short_answer: 'Dieser Rechner wandelt eine Binärzahl in Dezimal um, z.B. 1010 (binär) = 10 (dezimal).',
            intro_text: '<p>Geben Sie eine Binärzahl ein (nur mit 0 und 1), um sofort ihr Dezimal-Äquivalent zu sehen.</p>',
            key_points: [
                '<b>Methode:</b> jede Binärziffer repräsentiert eine Zweierpotenz, von rechts nach links gelesen (1, 2, 4, 8, 16...).',
                '<b>Beispiel:</b> 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.',
                '<b>Nur 0 und 1:</b> jedes andere Zeichen macht die Eingabe ungültig.',
            ],
            howto: [
                { question: 'Was ist 11111111 in Dezimal?', answer: '<p>255 — der Maximalwert, der mit 8 Bit (einem Byte) darstellbar ist.</p>' },
                { question: 'Was ist 100000 in Dezimal?', answer: '<p>32, da es 1×2⁵ = 32 ist.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_LABEL.de, type: 'text', placeholder: '1010' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.de }],
        },
    },
}

// ============================================================
// 1149: Decimal to Binary Converter
// ============================================================
const decimalToBinaryTool: ToolDef = {
    id: '1149',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 10 }],
        functions: { result: { type: 'function', functionName: 'decimalToBinary', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'decimal-to-binary-converter', title: 'Decimal to Binary Converter', h1: 'Decimal to Binary Converter',
            meta_title: 'Decimal to Binary Converter | Convert Base 10 to Base 2',
            meta_description: 'Convert a decimal number into binary instantly with this simple converter.',
            short_answer: 'This calculator converts a decimal number into binary, e.g. 10 (decimal) = 1010 (binary).',
            intro_text: '<p>Enter a whole decimal number to instantly see its binary equivalent — useful for computer science studies or working with low-level data representations.</p>',
            key_points: [
                '<b>Method:</b> repeatedly divide the number by 2, recording the remainders; reading the remainders bottom-to-top gives the binary digits.',
                '<b>Example:</b> 10 ÷ 2 = 5 r0, 5 ÷ 2 = 2 r1, 2 ÷ 2 = 1 r0, 1 ÷ 2 = 0 r1 → reading remainders bottom-up: 1010.',
                '<b>Negative numbers:</b> this calculator works with non-negative whole numbers only.',
            ],
            howto: [
                { question: 'What is 255 in binary?', answer: '<p>11111111 — the maximum value representable in 8 bits (a byte).</p>' },
                { question: 'What is 0 in binary?', answer: '<p>0 — the same in any base.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.en }],
        },
        ru: {
            slug: 'kalkulyator-desyatichnogo-v-dvoichnoe', title: 'Калькулятор десятичного в двоичное', h1: 'Калькулятор десятичного в двоичное',
            meta_title: 'Десятичное в двоичное | Конвертер из системы 10 в систему 2',
            meta_description: 'Конвертируйте десятичное число в двоичное мгновенно с помощью этого простого конвертера.',
            short_answer: 'Этот калькулятор конвертирует десятичное число в двоичное, например 10 (десятичное) = 1010 (двоичное).',
            intro_text: '<p>Введите целое десятичное число, чтобы мгновенно увидеть его двоичный эквивалент.</p>',
            key_points: [
                '<b>Метод:</b> многократно делите число на 2, записывая остатки; чтение остатков снизу вверх даёт двоичные цифры.',
                '<b>Пример:</b> 10 ÷ 2 = 5 ост.0, 5 ÷ 2 = 2 ост.1, 2 ÷ 2 = 1 ост.0, 1 ÷ 2 = 0 ост.1 → снизу вверх: 1010.',
                '<b>Отрицательные числа:</b> этот калькулятор работает только с неотрицательными целыми числами.',
            ],
            howto: [
                { question: 'Сколько это 255 в двоичной?', answer: '<p>11111111 — максимальное значение, представимое 8 битами (байтом).</p>' },
                { question: 'Сколько это 0 в двоичной?', answer: '<p>0 — то же самое в любой системе.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.ru }],
        },
        lv: {
            slug: 'decimala-uz-binaro-kalkulators', title: 'Decimālā uz Bināro Kalkulators', h1: 'Decimālā uz Bināro Kalkulators',
            meta_title: 'Decimālā uz Bināro | Konvertētājs no Bāzes 10 uz Bāzi 2',
            meta_description: 'Konvertējiet decimālo skaitli uz bināro acumirklī ar šo vienkāršo konvertētāju.',
            short_answer: 'Šis kalkulators konvertē decimālo skaitli uz bināro, piemēram, 10 (decimālā) = 1010 (binārā).',
            intro_text: '<p>Ievadiet veselu decimālu skaitli, lai uzreiz redzētu tā binārā ekvivalentu.</p>',
            key_points: [
                '<b>Metode:</b> atkārtoti daliet skaitli ar 2, pierakstot atlikumus; atlikumu lasīšana no apakšas uz augšu dod binārā ciparus.',
                '<b>Piemērs:</b> 10 ÷ 2 = 5 at.0, 5 ÷ 2 = 2 at.1, 2 ÷ 2 = 1 at.0, 1 ÷ 2 = 0 at.1 → no apakšas uz augšu: 1010.',
                '<b>Negatīvi skaitļi:</b> šis kalkulators strādā tikai ar nenegatīviem veseliem skaitļiem.',
            ],
            howto: [
                { question: 'Cik ir 255 binārā?', answer: '<p>11111111 — maksimālā vērtība, ko var attēlot 8 bitos (baitā).</p>' },
                { question: 'Cik ir 0 binārā?', answer: '<p>0 — tas pats jebkurā sistēmā.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.lv }],
        },
        pl: {
            slug: 'kalkulator-dziesietnego-na-binarny', title: 'Kalkulator Dziesiętnego na Binarny', h1: 'Kalkulator Dziesiętnego na Binarny',
            meta_title: 'Dziesiętny na Binarny | Konwerter z Podstawy 10 na Podstawę 2',
            meta_description: 'Przelicz liczbę dziesiętną na binarną natychmiast za pomocą tego prostego konwertera.',
            short_answer: 'Ten kalkulator przelicza liczbę dziesiętną na binarną, np. 10 (dziesiętnie) = 1010 (binarnie).',
            intro_text: '<p>Wpisz liczbę całkowitą dziesiętną, aby natychmiast zobaczyć jej odpowiednik binarny.</p>',
            key_points: [
                '<b>Metoda:</b> wielokrotnie dziel liczbę przez 2, zapisując reszty; odczytanie reszt od dołu do góry daje cyfry binarne.',
                '<b>Przykład:</b> 10 ÷ 2 = 5 r.0, 5 ÷ 2 = 2 r.1, 2 ÷ 2 = 1 r.0, 1 ÷ 2 = 0 r.1 → od dołu do góry: 1010.',
                '<b>Liczby ujemne:</b> ten kalkulator działa tylko z nieujemnymi liczbami całkowitymi.',
            ],
            howto: [
                { question: 'Ile to 255 binarnie?', answer: '<p>11111111 — maksymalna wartość reprezentowalna w 8 bitach (bajcie).</p>' },
                { question: 'Ile to 0 binarnie?', answer: '<p>0 — to samo w każdym systemie.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.pl }],
        },
        es: {
            slug: 'calculadora-de-decimal-a-binario', title: 'Calculadora de Decimal a Binario', h1: 'Calculadora de Decimal a Binario',
            meta_title: 'Decimal a Binario | Conversión de Base 10 a Base 2',
            meta_description: 'Convierte un número decimal a binario al instante con este sencillo convertidor.',
            short_answer: 'Esta calculadora convierte un número decimal a binario, p. ej. 10 (decimal) = 1010 (binario).',
            intro_text: '<p>Introduce un número decimal entero para ver al instante su equivalente binario.</p>',
            key_points: [
                '<b>Método:</b> divide repetidamente el número entre 2, anotando los residuos; leer los residuos de abajo hacia arriba da los dígitos binarios.',
                '<b>Ejemplo:</b> 10 ÷ 2 = 5 r0, 5 ÷ 2 = 2 r1, 2 ÷ 2 = 1 r0, 1 ÷ 2 = 0 r1 → de abajo hacia arriba: 1010.',
                '<b>Números negativos:</b> esta calculadora funciona solo con números enteros no negativos.',
            ],
            howto: [
                { question: '¿Cuánto es 255 en binario?', answer: '<p>11111111 — el valor máximo representable en 8 bits (un byte).</p>' },
                { question: '¿Cuánto es 0 en binario?', answer: '<p>0 — igual en cualquier base.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.es }],
        },
        fr: {
            slug: 'calculateur-de-decimal-en-binaire', title: 'Calculateur de Décimal en Binaire', h1: 'Calculateur de Décimal en Binaire',
            meta_title: 'Décimal en Binaire | Conversion de Base 10 en Base 2',
            meta_description: 'Convertissez un nombre décimal en binaire instantanément avec ce convertisseur simple.',
            short_answer: 'Ce calculateur convertit un nombre décimal en binaire, ex. 10 (décimal) = 1010 (binaire).',
            intro_text: '<p>Entrez un nombre décimal entier pour voir instantanément son équivalent binaire.</p>',
            key_points: [
                '<b>Méthode :</b> divisez répétitivement le nombre par 2, en notant les restes ; lire les restes de bas en haut donne les chiffres binaires.',
                '<b>Exemple :</b> 10 ÷ 2 = 5 r0, 5 ÷ 2 = 2 r1, 2 ÷ 2 = 1 r0, 1 ÷ 2 = 0 r1 → de bas en haut : 1010.',
                '<b>Nombres négatifs :</b> ce calculateur fonctionne uniquement avec des nombres entiers non négatifs.',
            ],
            howto: [
                { question: 'Combien fait 255 en binaire ?', answer: '<p>11111111 — la valeur maximale représentable sur 8 bits (un octet).</p>' },
                { question: 'Combien fait 0 en binaire ?', answer: '<p>0 — la même chose dans n’importe quelle base.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.fr }],
        },
        it: {
            slug: 'calcolatore-da-decimale-a-binario', title: 'Calcolatore da Decimale a Binario', h1: 'Calcolatore da Decimale a Binario',
            meta_title: 'Decimale in Binario | Conversione da Base 10 a Base 2',
            meta_description: 'Converti un numero decimale in binario istantaneamente con questo semplice convertitore.',
            short_answer: 'Questo calcolatore converte un numero decimale in binario, es. 10 (decimale) = 1010 (binario).',
            intro_text: '<p>Inserisci un numero decimale intero per vedere subito il suo equivalente binario.</p>',
            key_points: [
                '<b>Metodo:</b> dividi ripetutamente il numero per 2, annotando i resti; leggere i resti dal basso verso l’alto dà le cifre binarie.',
                '<b>Esempio:</b> 10 ÷ 2 = 5 r0, 5 ÷ 2 = 2 r1, 2 ÷ 2 = 1 r0, 1 ÷ 2 = 0 r1 → dal basso verso l’alto: 1010.',
                '<b>Numeri negativi:</b> questo calcolatore funziona solo con numeri interi non negativi.',
            ],
            howto: [
                { question: 'Quanto è 255 in binario?', answer: '<p>11111111 — il valore massimo rappresentabile in 8 bit (un byte).</p>' },
                { question: 'Quanto è 0 in binario?', answer: '<p>0 — lo stesso in qualsiasi base.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.it }],
        },
        de: {
            slug: 'dezimal-in-binaer-rechner', title: 'Dezimal in Binär Rechner', h1: 'Dezimal in Binär Rechner',
            meta_title: 'Dezimal in Binär | Umrechnung von Basis 10 in Basis 2',
            meta_description: 'Rechnen Sie eine Dezimalzahl sofort in Binär um mit diesem einfachen Umrechner.',
            short_answer: 'Dieser Rechner wandelt eine Dezimalzahl in Binär um, z.B. 10 (dezimal) = 1010 (binär).',
            intro_text: '<p>Geben Sie eine ganze Dezimalzahl ein, um sofort ihr binäres Äquivalent zu sehen.</p>',
            key_points: [
                '<b>Methode:</b> teilen Sie die Zahl wiederholt durch 2 und notieren Sie die Reste; das Lesen der Reste von unten nach oben ergibt die Binärziffern.',
                '<b>Beispiel:</b> 10 ÷ 2 = 5 R0, 5 ÷ 2 = 2 R1, 2 ÷ 2 = 1 R0, 1 ÷ 2 = 0 R1 → von unten nach oben: 1010.',
                '<b>Negative Zahlen:</b> dieser Rechner funktioniert nur mit nicht-negativen ganzen Zahlen.',
            ],
            howto: [
                { question: 'Was ist 255 in Binär?', answer: '<p>11111111 — der Maximalwert, der mit 8 Bit (einem Byte) darstellbar ist.</p>' },
                { question: 'Was ist 0 in Binär?', answer: '<p>0 — dasselbe in jedem Zahlensystem.</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '10' }],
            outputs: [{ name: 'result', label: BINARY_LABEL.de }],
        },
    },
}

// ============================================================
// 1150: Decimal to Hexadecimal Converter
// ============================================================
const decimalToHexadecimalTool: ToolDef = {
    id: '1150',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 255 }],
        functions: { result: { type: 'function', functionName: 'decimalToHexadecimal', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'decimal-to-hexadecimal-converter', title: 'Decimal to Hexadecimal Converter', h1: 'Decimal to Hexadecimal Converter',
            meta_title: 'Decimal to Hexadecimal Converter | Convert Base 10 to Base 16',
            meta_description: 'Convert a decimal number into hexadecimal instantly with this simple converter.',
            short_answer: 'This calculator converts a decimal number into hexadecimal, e.g. 255 (decimal) = FF (hexadecimal).',
            intro_text: '<p>Enter a whole decimal number to instantly see its hexadecimal equivalent — commonly used for color codes, memory addresses, and compact byte representations.</p>',
            key_points: [
                '<b>Method:</b> repeatedly divide the number by 16, converting remainders 10-15 into letters A-F.',
                '<b>Example:</b> 255 ÷ 16 = 15 r15 → 15 becomes F, remainder 15 becomes F → FF.',
                '<b>Common use:</b> web colors like #FF5733 use pairs of hex digits (00-FF) for red, green, and blue values.',
            ],
            howto: [
                { question: 'What is 4096 in hexadecimal?', answer: '<p>1000 — since 16³ = 4096.</p>' },
                { question: 'Why does hexadecimal use letters?', answer: '<p>Base 16 needs 16 distinct digits, so after 0-9 it continues with A (10) through F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.en }],
        },
        ru: {
            slug: 'kalkulyator-desyatichnogo-v-shestnadcatirichnoe', title: 'Калькулятор десятичного в шестнадцатеричное', h1: 'Калькулятор десятичного в шестнадцатеричное',
            meta_title: 'Десятичное в шестнадцатеричное | Конвертер из системы 10 в систему 16',
            meta_description: 'Конвертируйте десятичное число в шестнадцатеричное мгновенно с помощью этого простого конвертера.',
            short_answer: 'Этот калькулятор конвертирует десятичное число в шестнадцатеричное, например 255 (десятичное) = FF (шестнадцатеричное).',
            intro_text: '<p>Введите целое десятичное число, чтобы мгновенно увидеть его шестнадцатеричный эквивалент — часто используется для цветовых кодов и адресов памяти.</p>',
            key_points: [
                '<b>Метод:</b> многократно делите число на 16, преобразуя остатки 10-15 в буквы A-F.',
                '<b>Пример:</b> 255 ÷ 16 = 15 ост.15 → получаем FF.',
                '<b>Частое использование:</b> веб-цвета вроде #FF5733 используют пары шестнадцатеричных цифр (00-FF).',
            ],
            howto: [
                { question: 'Сколько это 4096 в шестнадцатеричной?', answer: '<p>1000 — так как 16³ = 4096.</p>' },
                { question: 'Почему в шестнадцатеричной используются буквы?', answer: '<p>Системе с основанием 16 нужно 16 разных цифр, поэтому после 0-9 идут A (10) до F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.ru }],
        },
        lv: {
            slug: 'decimala-uz-heksadecimalo-kalkulators', title: 'Decimālā uz Heksadecimālo Kalkulators', h1: 'Decimālā uz Heksadecimālo Kalkulators',
            meta_title: 'Decimālā uz Heksadecimālo | Konvertētājs no Bāzes 10 uz Bāzi 16',
            meta_description: 'Konvertējiet decimālo skaitli uz heksadecimālo acumirklī ar šo vienkāršo konvertētāju.',
            short_answer: 'Šis kalkulators konvertē decimālo skaitli uz heksadecimālo, piemēram, 255 (decimālā) = FF (heksadecimālā).',
            intro_text: '<p>Ievadiet veselu decimālu skaitli, lai uzreiz redzētu tā heksadecimālo ekvivalentu — bieži izmanto krāsu kodiem un atmiņas adresēm.</p>',
            key_points: [
                '<b>Metode:</b> atkārtoti daliet skaitli ar 16, pārvēršot atlikumus 10-15 burtos A-F.',
                '<b>Piemērs:</b> 255 ÷ 16 = 15 at.15 → iegūstam FF.',
                '<b>Bieža lietošana:</b> tīmekļa krāsas, piemēram, #FF5733, izmanto heksadecimālo ciparu pārus (00-FF).',
            ],
            howto: [
                { question: 'Cik ir 4096 heksadecimālā?', answer: '<p>1000 — jo 16³ = 4096.</p>' },
                { question: 'Kāpēc heksadecimālā izmanto burtus?', answer: '<p>Bāzei 16 nepieciešami 16 atšķirīgi cipari, tāpēc pēc 0-9 turpinās ar A (10) līdz F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.lv }],
        },
        pl: {
            slug: 'kalkulator-dziesietnego-na-szesnastkowy', title: 'Kalkulator Dziesiętnego na Szesnastkowy', h1: 'Kalkulator Dziesiętnego na Szesnastkowy',
            meta_title: 'Dziesiętny na Szesnastkowy | Konwerter z Podstawy 10 na Podstawę 16',
            meta_description: 'Przelicz liczbę dziesiętną na szesnastkową natychmiast za pomocą tego prostego konwertera.',
            short_answer: 'Ten kalkulator przelicza liczbę dziesiętną na szesnastkową, np. 255 (dziesiętnie) = FF (szesnastkowo).',
            intro_text: '<p>Wpisz liczbę całkowitą dziesiętną, aby natychmiast zobaczyć jej odpowiednik szesnastkowy — często używany do kodów kolorów i adresów pamięci.</p>',
            key_points: [
                '<b>Metoda:</b> wielokrotnie dziel liczbę przez 16, zamieniając reszty 10-15 na litery A-F.',
                '<b>Przykład:</b> 255 ÷ 16 = 15 r.15 → otrzymujemy FF.',
                '<b>Częste zastosowanie:</b> kolory internetowe jak #FF5733 używają par cyfr szesnastkowych (00-FF).',
            ],
            howto: [
                { question: 'Ile to 4096 szesnastkowo?', answer: '<p>1000 — ponieważ 16³ = 4096.</p>' },
                { question: 'Dlaczego system szesnastkowy używa liter?', answer: '<p>Podstawa 16 potrzebuje 16 różnych cyfr, więc po 0-9 kontynuuje się A (10) do F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.pl }],
        },
        es: {
            slug: 'calculadora-de-decimal-a-hexadecimal', title: 'Calculadora de Decimal a Hexadecimal', h1: 'Calculadora de Decimal a Hexadecimal',
            meta_title: 'Decimal a Hexadecimal | Conversión de Base 10 a Base 16',
            meta_description: 'Convierte un número decimal a hexadecimal al instante con este sencillo convertidor.',
            short_answer: 'Esta calculadora convierte un número decimal a hexadecimal, p. ej. 255 (decimal) = FF (hexadecimal).',
            intro_text: '<p>Introduce un número decimal entero para ver al instante su equivalente hexadecimal — comúnmente usado para códigos de color y direcciones de memoria.</p>',
            key_points: [
                '<b>Método:</b> divide repetidamente el número entre 16, convirtiendo los residuos 10-15 en letras A-F.',
                '<b>Ejemplo:</b> 255 ÷ 16 = 15 r15 → obtenemos FF.',
                '<b>Uso común:</b> los colores web como #FF5733 usan pares de dígitos hexadecimales (00-FF).',
            ],
            howto: [
                { question: '¿Cuánto es 4096 en hexadecimal?', answer: '<p>1000 — ya que 16³ = 4096.</p>' },
                { question: '¿Por qué el hexadecimal usa letras?', answer: '<p>La base 16 necesita 16 dígitos distintos, así que tras 0-9 continúa con A (10) hasta F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.es }],
        },
        fr: {
            slug: 'calculateur-de-decimal-en-hexadecimal', title: 'Calculateur de Décimal en Hexadécimal', h1: 'Calculateur de Décimal en Hexadécimal',
            meta_title: 'Décimal en Hexadécimal | Conversion de Base 10 en Base 16',
            meta_description: 'Convertissez un nombre décimal en hexadécimal instantanément avec ce convertisseur simple.',
            short_answer: 'Ce calculateur convertit un nombre décimal en hexadécimal, ex. 255 (décimal) = FF (hexadécimal).',
            intro_text: '<p>Entrez un nombre décimal entier pour voir instantanément son équivalent hexadécimal — couramment utilisé pour les codes couleur et les adresses mémoire.</p>',
            key_points: [
                '<b>Méthode :</b> divisez répétitivement le nombre par 16, en convertissant les restes 10-15 en lettres A-F.',
                '<b>Exemple :</b> 255 ÷ 16 = 15 r15 → on obtient FF.',
                '<b>Usage courant :</b> les couleurs web comme #FF5733 utilisent des paires de chiffres hexadécimaux (00-FF).',
            ],
            howto: [
                { question: 'Combien fait 4096 en hexadécimal ?', answer: '<p>1000 — puisque 16³ = 4096.</p>' },
                { question: 'Pourquoi l’hexadécimal utilise-t-il des lettres ?', answer: '<p>La base 16 a besoin de 16 chiffres distincts, donc après 0-9 elle continue avec A (10) jusqu’à F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.fr }],
        },
        it: {
            slug: 'calcolatore-da-decimale-a-esadecimale', title: 'Calcolatore da Decimale a Esadecimale', h1: 'Calcolatore da Decimale a Esadecimale',
            meta_title: 'Decimale in Esadecimale | Conversione da Base 10 a Base 16',
            meta_description: 'Converti un numero decimale in esadecimale istantaneamente con questo semplice convertitore.',
            short_answer: 'Questo calcolatore converte un numero decimale in esadecimale, es. 255 (decimale) = FF (esadecimale).',
            intro_text: '<p>Inserisci un numero decimale intero per vedere subito il suo equivalente esadecimale — comunemente usato per codici colore e indirizzi di memoria.</p>',
            key_points: [
                '<b>Metodo:</b> dividi ripetutamente il numero per 16, convertendo i resti 10-15 in lettere A-F.',
                '<b>Esempio:</b> 255 ÷ 16 = 15 r15 → otteniamo FF.',
                '<b>Uso comune:</b> i colori web come #FF5733 usano coppie di cifre esadecimali (00-FF).',
            ],
            howto: [
                { question: 'Quanto è 4096 in esadecimale?', answer: '<p>1000 — poiché 16³ = 4096.</p>' },
                { question: 'Perché l’esadecimale usa le lettere?', answer: '<p>La base 16 richiede 16 cifre distinte, quindi dopo 0-9 continua con A (10) fino a F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.it }],
        },
        de: {
            slug: 'dezimal-in-hexadezimal-rechner', title: 'Dezimal in Hexadezimal Rechner', h1: 'Dezimal in Hexadezimal Rechner',
            meta_title: 'Dezimal in Hexadezimal | Umrechnung von Basis 10 in Basis 16',
            meta_description: 'Rechnen Sie eine Dezimalzahl sofort in Hexadezimal um mit diesem einfachen Umrechner.',
            short_answer: 'Dieser Rechner wandelt eine Dezimalzahl in Hexadezimal um, z.B. 255 (dezimal) = FF (hexadezimal).',
            intro_text: '<p>Geben Sie eine ganze Dezimalzahl ein, um sofort ihr hexadezimales Äquivalent zu sehen — häufig für Farbcodes und Speicheradressen verwendet.</p>',
            key_points: [
                '<b>Methode:</b> teilen Sie die Zahl wiederholt durch 16 und wandeln Sie Reste 10-15 in Buchstaben A-F um.',
                '<b>Beispiel:</b> 255 ÷ 16 = 15 R15 → ergibt FF.',
                '<b>Häufige Verwendung:</b> Webfarben wie #FF5733 verwenden Paare von Hex-Ziffern (00-FF).',
            ],
            howto: [
                { question: 'Was ist 4096 in Hexadezimal?', answer: '<p>1000 — da 16³ = 4096.</p>' },
                { question: 'Warum verwendet Hexadezimal Buchstaben?', answer: '<p>Basis 16 benötigt 16 unterschiedliche Ziffern, daher folgt nach 0-9 A (10) bis F (15).</p>' },
            ],
            inputs: [{ name: 'value', label: DECIMAL_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '255' }],
            outputs: [{ name: 'result', label: HEX_LABEL.de }],
        },
    },
}

// ============================================================
// 1151: Hexadecimal to Decimal Converter
// ============================================================
const hexadecimalToDecimalTool: ToolDef = {
    id: '1151',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 'FF' }],
        functions: { result: { type: 'function', functionName: 'hexadecimalToDecimal', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'hexadecimal-to-decimal-converter', title: 'Hexadecimal to Decimal Converter', h1: 'Hexadecimal to Decimal Converter',
            meta_title: 'Hexadecimal to Decimal Converter | Convert Base 16 to Base 10',
            meta_description: 'Convert a hexadecimal number into decimal instantly with this simple converter.',
            short_answer: 'This calculator converts a hexadecimal number into decimal, e.g. FF (hexadecimal) = 255 (decimal).',
            intro_text: '<p>Enter a hexadecimal number (using digits 0-9 and letters A-F) to instantly see its decimal equivalent — useful for reading color codes, memory addresses, or other hex-encoded values.</p>',
            key_points: [
                '<b>Method:</b> each hex digit represents a power of 16, read right to left; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Example:</b> FF = 15×16 + 15×1 = 255.',
                '<b>Case-insensitive:</b> both uppercase (FF) and lowercase (ff) work the same way.',
            ],
            howto: [
                { question: 'What is 1A in decimal?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'What is the decimal value of the color code FF5733?', answer: '<p>Split into pairs: FF=255 (red), 57=87 (green), 33=51 (blue) — convert each pair separately using this tool.</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.en, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.en }],
        },
        ru: {
            slug: 'kalkulyator-shestnadcatirichnogo-v-desyatichnoe', title: 'Калькулятор шестнадцатеричного в десятичное', h1: 'Калькулятор шестнадцатеричного в десятичное',
            meta_title: 'Шестнадцатеричное в десятичное | Конвертер из системы 16 в систему 10',
            meta_description: 'Конвертируйте шестнадцатеричное число в десятичное мгновенно с помощью этого простого конвертера.',
            short_answer: 'Этот калькулятор конвертирует шестнадцатеричное число в десятичное, например FF (шестнадцатеричное) = 255 (десятичное).',
            intro_text: '<p>Введите шестнадцатеричное число (используя цифры 0-9 и буквы A-F), чтобы мгновенно увидеть его десятичный эквивалент.</p>',
            key_points: [
                '<b>Метод:</b> каждая шестнадцатеричная цифра представляет степень 16, считая справа налево; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Пример:</b> FF = 15×16 + 15×1 = 255.',
                '<b>Регистр не важен:</b> и заглавные (FF), и строчные (ff) буквы работают одинаково.',
            ],
            howto: [
                { question: 'Сколько это 1A в десятичной?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'Каково десятичное значение цветового кода FF5733?', answer: '<p>Разделите на пары: FF=255 (красный), 57=87 (зелёный), 33=51 (синий).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.ru, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.ru }],
        },
        lv: {
            slug: 'heksadecimala-uz-decimalo-kalkulators', title: 'Heksadecimālā uz Decimālo Kalkulators', h1: 'Heksadecimālā uz Decimālo Kalkulators',
            meta_title: 'Heksadecimālā uz Decimālo | Konvertētājs no Bāzes 16 uz Bāzi 10',
            meta_description: 'Konvertējiet heksadecimālo skaitli uz decimālo acumirklī ar šo vienkāršo konvertētāju.',
            short_answer: 'Šis kalkulators konvertē heksadecimālo skaitli uz decimālo, piemēram, FF (heksadecimālā) = 255 (decimālā).',
            intro_text: '<p>Ievadiet heksadecimālu skaitli (izmantojot ciparus 0-9 un burtus A-F), lai uzreiz redzētu tā decimālo ekvivalentu.</p>',
            key_points: [
                '<b>Metode:</b> katrs heksadecimālais cipars pārstāv 16 pakāpi, skaitot no labās uz kreiso; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Piemērs:</b> FF = 15×16 + 15×1 = 255.',
                '<b>Reģistrs nav svarīgs:</b> gan lielie (FF), gan mazie (ff) burti darbojas vienādi.',
            ],
            howto: [
                { question: 'Cik ir 1A decimālā?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'Kāda ir krāsu koda FF5733 decimālā vērtība?', answer: '<p>Sadaliet pāros: FF=255 (sarkans), 57=87 (zaļš), 33=51 (zils).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.lv, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.lv }],
        },
        pl: {
            slug: 'kalkulator-szesnastkowego-na-dziesietny', title: 'Kalkulator Szesnastkowego na Dziesiętny', h1: 'Kalkulator Szesnastkowego na Dziesiętny',
            meta_title: 'Szesnastkowy na Dziesiętny | Konwerter z Podstawy 16 na Podstawę 10',
            meta_description: 'Przelicz liczbę szesnastkową na dziesiętną natychmiast za pomocą tego prostego konwertera.',
            short_answer: 'Ten kalkulator przelicza liczbę szesnastkową na dziesiętną, np. FF (szesnastkowo) = 255 (dziesiętnie).',
            intro_text: '<p>Wpisz liczbę szesnastkową (używając cyfr 0-9 i liter A-F), aby natychmiast zobaczyć jej odpowiednik dziesiętny.</p>',
            key_points: [
                '<b>Metoda:</b> każda cyfra szesnastkowa reprezentuje potęgę 16, licząc od prawej do lewej; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Przykład:</b> FF = 15×16 + 15×1 = 255.',
                '<b>Wielkość liter nieistotna:</b> zarówno wielkie (FF), jak i małe (ff) litery działają tak samo.',
            ],
            howto: [
                { question: 'Ile to 1A dziesiętnie?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'Jaka jest dziesiętna wartość kodu koloru FF5733?', answer: '<p>Podziel na pary: FF=255 (czerwony), 57=87 (zielony), 33=51 (niebieski).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.pl, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.pl }],
        },
        es: {
            slug: 'calculadora-de-hexadecimal-a-decimal', title: 'Calculadora de Hexadecimal a Decimal', h1: 'Calculadora de Hexadecimal a Decimal',
            meta_title: 'Hexadecimal a Decimal | Conversión de Base 16 a Base 10',
            meta_description: 'Convierte un número hexadecimal a decimal al instante con este sencillo convertidor.',
            short_answer: 'Esta calculadora convierte un número hexadecimal a decimal, p. ej. FF (hexadecimal) = 255 (decimal).',
            intro_text: '<p>Introduce un número hexadecimal (usando dígitos 0-9 y letras A-F) para ver al instante su equivalente decimal.</p>',
            key_points: [
                '<b>Método:</b> cada dígito hexadecimal representa una potencia de 16, leyendo de derecha a izquierda; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Ejemplo:</b> FF = 15×16 + 15×1 = 255.',
                '<b>No distingue mayúsculas:</b> tanto mayúsculas (FF) como minúsculas (ff) funcionan igual.',
            ],
            howto: [
                { question: '¿Cuánto es 1A en decimal?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: '¿Cuál es el valor decimal del código de color FF5733?', answer: '<p>Divide en pares: FF=255 (rojo), 57=87 (verde), 33=51 (azul).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.es, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.es }],
        },
        fr: {
            slug: 'calculateur-dhexadecimal-en-decimal', title: 'Calculateur d’Hexadécimal en Décimal', h1: 'Calculateur d’Hexadécimal en Décimal',
            meta_title: 'Hexadécimal en Décimal | Conversion de Base 16 en Base 10',
            meta_description: 'Convertissez un nombre hexadécimal en décimal instantanément avec ce convertisseur simple.',
            short_answer: 'Ce calculateur convertit un nombre hexadécimal en décimal, ex. FF (hexadécimal) = 255 (décimal).',
            intro_text: '<p>Entrez un nombre hexadécimal (en utilisant les chiffres 0-9 et les lettres A-F) pour voir instantanément son équivalent décimal.</p>',
            key_points: [
                '<b>Méthode :</b> chaque chiffre hexadécimal représente une puissance de 16, lue de droite à gauche ; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Exemple :</b> FF = 15×16 + 15×1 = 255.',
                '<b>Insensible à la casse :</b> majuscules (FF) et minuscules (ff) fonctionnent de la même façon.',
            ],
            howto: [
                { question: 'Combien fait 1A en décimal ?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'Quelle est la valeur décimale du code couleur FF5733 ?', answer: '<p>Divisez en paires : FF=255 (rouge), 57=87 (vert), 33=51 (bleu).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.fr, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.fr }],
        },
        it: {
            slug: 'calcolatore-da-esadecimale-a-decimale', title: 'Calcolatore da Esadecimale a Decimale', h1: 'Calcolatore da Esadecimale a Decimale',
            meta_title: 'Esadecimale in Decimale | Conversione da Base 16 a Base 10',
            meta_description: 'Converti un numero esadecimale in decimale istantaneamente con questo semplice convertitore.',
            short_answer: 'Questo calcolatore converte un numero esadecimale in decimale, es. FF (esadecimale) = 255 (decimale).',
            intro_text: '<p>Inserisci un numero esadecimale (usando cifre 0-9 e lettere A-F) per vedere subito il suo equivalente decimale.</p>',
            key_points: [
                '<b>Metodo:</b> ogni cifra esadecimale rappresenta una potenza di 16, letta da destra a sinistra; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Esempio:</b> FF = 15×16 + 15×1 = 255.',
                '<b>Non sensibile a maiuscole/minuscole:</b> sia maiuscolo (FF) che minuscolo (ff) funzionano allo stesso modo.',
            ],
            howto: [
                { question: 'Quanto è 1A in decimale?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'Qual è il valore decimale del codice colore FF5733?', answer: '<p>Dividi in coppie: FF=255 (rosso), 57=87 (verde), 33=51 (blu).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.it, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.it }],
        },
        de: {
            slug: 'hexadezimal-in-dezimal-rechner', title: 'Hexadezimal in Dezimal Rechner', h1: 'Hexadezimal in Dezimal Rechner',
            meta_title: 'Hexadezimal in Dezimal | Umrechnung von Basis 16 in Basis 10',
            meta_description: 'Rechnen Sie eine Hexadezimalzahl sofort in Dezimal um mit diesem einfachen Umrechner.',
            short_answer: 'Dieser Rechner wandelt eine Hexadezimalzahl in Dezimal um, z.B. FF (hexadezimal) = 255 (dezimal).',
            intro_text: '<p>Geben Sie eine Hexadezimalzahl ein (mit Ziffern 0-9 und Buchstaben A-F), um sofort ihr Dezimal-Äquivalent zu sehen.</p>',
            key_points: [
                '<b>Methode:</b> jede Hex-Ziffer repräsentiert eine Potenz von 16, von rechts nach links gelesen; A=10, B=11, C=12, D=13, E=14, F=15.',
                '<b>Beispiel:</b> FF = 15×16 + 15×1 = 255.',
                '<b>Groß-/Kleinschreibung egal:</b> sowohl Großbuchstaben (FF) als auch Kleinbuchstaben (ff) funktionieren gleich.',
            ],
            howto: [
                { question: 'Was ist 1A in Dezimal?', answer: '<p>1×16 + 10×1 = 26.</p>' },
                { question: 'Was ist der Dezimalwert des Farbcodes FF5733?', answer: '<p>Teilen Sie in Paare: FF=255 (Rot), 57=87 (Grün), 33=51 (Blau).</p>' },
            ],
            inputs: [{ name: 'value', label: HEX_LABEL.de, type: 'text', placeholder: 'FF' }],
            outputs: [{ name: 'result', label: DECIMAL_LABEL.de }],
        },
    },
}

const TEXT_LABEL: Record<string, string> = { en: 'Text', ru: 'Текст', de: 'Text', es: 'Texto', fr: 'Texte', it: 'Testo', pl: 'Tekst', lv: 'Teksts' }
const BINARY_CODE_LABEL: Record<string, string> = { en: 'Binary Code', ru: 'Двоичный код', de: 'Binärcode', es: 'Código Binario', fr: 'Code Binaire', it: 'Codice Binario', pl: 'Kod Binarny', lv: 'Binārais Kods' }

// ============================================================
// 1152: Text to Binary Converter
// ============================================================
const textToBinaryTool: ToolDef = {
    id: '1152',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 'Hello' }],
        functions: { result: { type: 'function', functionName: 'textToBinary', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'text-to-binary-converter', title: 'Text to Binary Converter', h1: 'Text to Binary Converter',
            meta_title: 'Text to Binary Converter | ASCII Text to Binary Code',
            meta_description: 'Convert any text into binary code (8-bit ASCII values) instantly.',
            short_answer: 'This calculator converts text into binary code, one 8-bit group per character, e.g. "Hi" = 01001000 01101001.',
            intro_text: '<p>Enter any text to see its binary representation — each character is converted to its ASCII code and shown as an 8-bit binary number, a common way computers represent text internally.</p>',
            key_points: [
                '<b>Method:</b> each character\'s ASCII code (0-255) is converted to binary and padded to 8 digits.',
                '<b>Example:</b> "A" has ASCII code 65, which in binary is 01000001.',
                '<b>Spaces between groups:</b> each character\'s 8-bit code is separated by a space for readability.',
            ],
            howto: [
                { question: 'What is a space character in binary?', answer: '<p>00100000 — the ASCII code for a space is 32.</p>' },
                { question: 'Does this support special characters and emoji?', answer: '<p>It supports standard ASCII characters (letters, numbers, punctuation); characters outside the ASCII range may not convert as expected since ASCII only covers codes 0-255.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.en, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.en }],
        },
        ru: {
            slug: 'konverter-teksta-v-dvoichnyj-kod', title: 'Конвертер текста в двоичный код', h1: 'Конвертер текста в двоичный код',
            meta_title: 'Текст в двоичный код | ASCII текст в бинарный код',
            meta_description: 'Конвертируйте любой текст в двоичный код (8-битные значения ASCII) мгновенно.',
            short_answer: 'Этот калькулятор конвертирует текст в двоичный код, по 8-битной группе на символ, например «Hi» = 01001000 01101001.',
            intro_text: '<p>Введите любой текст, чтобы увидеть его двоичное представление — каждый символ конвертируется в код ASCII и показывается как 8-битное двоичное число.</p>',
            key_points: [
                '<b>Метод:</b> код ASCII каждого символа (0-255) конвертируется в двоичный и дополняется до 8 цифр.',
                '<b>Пример:</b> у «A» код ASCII 65, что в двоичной системе — 01000001.',
                '<b>Пробелы между группами:</b> 8-битный код каждого символа отделяется пробелом для читаемости.',
            ],
            howto: [
                { question: 'Что такое пробел в двоичном коде?', answer: '<p>00100000 — код ASCII для пробела равен 32.</p>' },
                { question: 'Поддерживаются ли специальные символы и эмодзи?', answer: '<p>Поддерживаются стандартные символы ASCII; символы вне диапазона ASCII могут конвертироваться некорректно.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.ru, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.ru }],
        },
        lv: {
            slug: 'teksta-uz-binaro-kodu-konvertetajs', title: 'Teksta uz Bināro Kodu Konvertētājs', h1: 'Teksta uz Bināro Kodu Konvertētājs',
            meta_title: 'Teksts uz Bināro Kodu | ASCII Teksts uz Bināro Kodu',
            meta_description: 'Konvertējiet jebkuru tekstu bināra kodā (8 bitu ASCII vērtībās) acumirklī.',
            short_answer: 'Šis kalkulators konvertē tekstu bināra kodā, pa 8 bitu grupai vienai rakstzīmei, piemēram, "Hi" = 01001000 01101001.',
            intro_text: '<p>Ievadiet jebkuru tekstu, lai redzētu tā bināro attēlojumu — katra rakstzīme tiek konvertēta uz ASCII kodu un parādīta kā 8 bitu binārs skaitlis.</p>',
            key_points: [
                '<b>Metode:</b> katras rakstzīmes ASCII kods (0-255) tiek konvertēts binārā un papildināts līdz 8 cipariem.',
                '<b>Piemērs:</b> "A" ASCII kods ir 65, kas binārā ir 01000001.',
                '<b>Atstarpes starp grupām:</b> katras rakstzīmes 8 bitu kods tiek atdalīts ar atstarpi lasāmībai.',
            ],
            howto: [
                { question: 'Kāda ir atstarpes rakstzīme binārā?', answer: '<p>00100000 — ASCII kods atstarpei ir 32.</p>' },
                { question: 'Vai tas atbalsta īpašās rakstzīmes un emocijzīmes?', answer: '<p>Tas atbalsta standarta ASCII rakstzīmes; rakstzīmes ārpus ASCII diapazona var nekonvertēties pareizi.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.lv, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-tekstu-na-kod-binarny', title: 'Konwerter Tekstu na Kod Binarny', h1: 'Konwerter Tekstu na Kod Binarny',
            meta_title: 'Tekst na Kod Binarny | Tekst ASCII na Kod Binarny',
            meta_description: 'Przelicz dowolny tekst na kod binarny (8-bitowe wartości ASCII) natychmiast.',
            short_answer: 'Ten kalkulator przelicza tekst na kod binarny, po 8-bitowej grupie na znak, np. "Hi" = 01001000 01101001.',
            intro_text: '<p>Wpisz dowolny tekst, aby zobaczyć jego reprezentację binarną — każdy znak jest przeliczany na kod ASCII i pokazywany jako 8-bitowa liczba binarna.</p>',
            key_points: [
                '<b>Metoda:</b> kod ASCII każdego znaku (0-255) jest przeliczany na binarny i uzupełniany do 8 cyfr.',
                '<b>Przykład:</b> "A" ma kod ASCII 65, co binarnie to 01000001.',
                '<b>Spacje między grupami:</b> 8-bitowy kod każdego znaku jest oddzielony spacją dla czytelności.',
            ],
            howto: [
                { question: 'Jak wygląda znak spacji binarnie?', answer: '<p>00100000 — kod ASCII dla spacji to 32.</p>' },
                { question: 'Czy to obsługuje znaki specjalne i emoji?', answer: '<p>Obsługuje standardowe znaki ASCII; znaki spoza zakresu ASCII mogą nie przeliczać się poprawnie.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.pl, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-texto-a-binario', title: 'Convertidor de Texto a Binario', h1: 'Convertidor de Texto a Binario',
            meta_title: 'Texto a Binario | Texto ASCII a Código Binario',
            meta_description: 'Convierte cualquier texto en código binario (valores ASCII de 8 bits) al instante.',
            short_answer: 'Esta calculadora convierte texto en código binario, un grupo de 8 bits por carácter, p. ej. "Hi" = 01001000 01101001.',
            intro_text: '<p>Introduce cualquier texto para ver su representación binaria — cada carácter se convierte a su código ASCII y se muestra como un número binario de 8 bits.</p>',
            key_points: [
                '<b>Método:</b> el código ASCII de cada carácter (0-255) se convierte a binario y se rellena a 8 dígitos.',
                '<b>Ejemplo:</b> "A" tiene código ASCII 65, que en binario es 01000001.',
                '<b>Espacios entre grupos:</b> el código de 8 bits de cada carácter se separa con un espacio para mayor legibilidad.',
            ],
            howto: [
                { question: '¿Cuál es el carácter de espacio en binario?', answer: '<p>00100000 — el código ASCII de un espacio es 32.</p>' },
                { question: '¿Esto admite caracteres especiales y emojis?', answer: '<p>Admite caracteres ASCII estándar; los caracteres fuera del rango ASCII pueden no convertirse correctamente.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.es, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-de-texte-en-binaire', title: 'Convertisseur de Texte en Binaire', h1: 'Convertisseur de Texte en Binaire',
            meta_title: 'Texte en Binaire | Texte ASCII en Code Binaire',
            meta_description: 'Convertissez n’importe quel texte en code binaire (valeurs ASCII 8 bits) instantanément.',
            short_answer: 'Ce calculateur convertit du texte en code binaire, un groupe de 8 bits par caractère, ex. "Hi" = 01001000 01101001.',
            intro_text: '<p>Entrez n’importe quel texte pour voir sa représentation binaire — chaque caractère est converti en son code ASCII et affiché comme un nombre binaire de 8 bits.</p>',
            key_points: [
                '<b>Méthode :</b> le code ASCII de chaque caractère (0-255) est converti en binaire et complété à 8 chiffres.',
                '<b>Exemple :</b> "A" a le code ASCII 65, soit 01000001 en binaire.',
                '<b>Espaces entre les groupes :</b> le code 8 bits de chaque caractère est séparé par un espace pour la lisibilité.',
            ],
            howto: [
                { question: 'Quel est le caractère espace en binaire ?', answer: '<p>00100000 — le code ASCII d’un espace est 32.</p>' },
                { question: 'Cela prend-il en charge les caractères spéciaux et les émojis ?', answer: '<p>Il prend en charge les caractères ASCII standard ; les caractères hors de la plage ASCII peuvent ne pas se convertir correctement.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.fr, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-da-testo-a-binario', title: 'Convertitore da Testo a Binario', h1: 'Convertitore da Testo a Binario',
            meta_title: 'Testo in Binario | Testo ASCII in Codice Binario',
            meta_description: 'Converti qualsiasi testo in codice binario (valori ASCII a 8 bit) istantaneamente.',
            short_answer: 'Questo calcolatore converte il testo in codice binario, un gruppo di 8 bit per carattere, es. "Hi" = 01001000 01101001.',
            intro_text: '<p>Inserisci qualsiasi testo per vedere la sua rappresentazione binaria — ogni carattere viene convertito nel suo codice ASCII e mostrato come un numero binario a 8 bit.</p>',
            key_points: [
                '<b>Metodo:</b> il codice ASCII di ogni carattere (0-255) viene convertito in binario e riempito a 8 cifre.',
                '<b>Esempio:</b> "A" ha codice ASCII 65, che in binario è 01000001.',
                '<b>Spazi tra i gruppi:</b> il codice a 8 bit di ogni carattere è separato da uno spazio per leggibilità.',
            ],
            howto: [
                { question: 'Qual è il carattere spazio in binario?', answer: '<p>00100000 — il codice ASCII di uno spazio è 32.</p>' },
                { question: 'Questo supporta caratteri speciali ed emoji?', answer: '<p>Supporta i caratteri ASCII standard; i caratteri fuori dall’intervallo ASCII potrebbero non convertirsi correttamente.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.it, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.it }],
        },
        de: {
            slug: 'text-in-binaer-umrechner', title: 'Text in Binär Umrechner', h1: 'Text in Binär Umrechner',
            meta_title: 'Text in Binär | ASCII-Text in Binärcode',
            meta_description: 'Rechnen Sie beliebigen Text sofort in Binärcode um (8-Bit-ASCII-Werte).',
            short_answer: 'Dieser Rechner wandelt Text in Binärcode um, eine 8-Bit-Gruppe pro Zeichen, z.B. "Hi" = 01001000 01101001.',
            intro_text: '<p>Geben Sie beliebigen Text ein, um seine binäre Darstellung zu sehen — jedes Zeichen wird in seinen ASCII-Code umgewandelt und als 8-Bit-Binärzahl angezeigt.</p>',
            key_points: [
                '<b>Methode:</b> der ASCII-Code jedes Zeichens (0-255) wird in Binär umgewandelt und auf 8 Stellen aufgefüllt.',
                '<b>Beispiel:</b> "A" hat den ASCII-Code 65, was binär 01000001 ist.',
                '<b>Leerzeichen zwischen Gruppen:</b> der 8-Bit-Code jedes Zeichens wird zur besseren Lesbarkeit durch ein Leerzeichen getrennt.',
            ],
            howto: [
                { question: 'Was ist das Leerzeichen in Binär?', answer: '<p>00100000 — der ASCII-Code für ein Leerzeichen ist 32.</p>' },
                { question: 'Unterstützt dies Sonderzeichen und Emojis?', answer: '<p>Es unterstützt Standard-ASCII-Zeichen; Zeichen außerhalb des ASCII-Bereichs werden möglicherweise nicht wie erwartet umgewandelt.</p>' },
            ],
            inputs: [{ name: 'value', label: TEXT_LABEL.de, type: 'text', placeholder: 'Hello' }],
            outputs: [{ name: 'result', label: BINARY_CODE_LABEL.de }],
        },
    },
}

// ============================================================
// 1153: Binary to Text Converter
// ============================================================
const binaryToTextTool: ToolDef = {
    id: '1153',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: '01001000 01101001' }],
        functions: { result: { type: 'function', functionName: 'binaryToText', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'binary-to-text-converter', title: 'Binary to Text Converter', h1: 'Binary to Text Converter',
            meta_title: 'Binary to Text Converter | Binary Code to ASCII Text',
            meta_description: 'Convert binary code (8-bit groups) back into readable text instantly.',
            short_answer: 'This calculator converts binary code into readable text, e.g. 01001000 01101001 = "Hi".',
            intro_text: '<p>Enter binary code as space-separated 8-bit groups to decode it back into readable text — the reverse of the Text to Binary Converter.</p>',
            key_points: [
                '<b>Format:</b> each group of up to 8 binary digits (0s and 1s) is treated as one character\'s ASCII code.',
                '<b>Example:</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Separation required:</b> groups must be separated by spaces so the calculator knows where each character\'s code begins and ends.',
            ],
            howto: [
                { question: 'What if my binary code is all one continuous string with no spaces?', answer: '<p>Insert spaces every 8 digits first, since this calculator relies on spaces to split characters.</p>' },
                { question: 'What does "Invalid input" mean?', answer: '<p>It means one of the groups contains characters other than 0 and 1, or is longer than 8 digits.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.en, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.en }],
        },
        ru: {
            slug: 'konverter-dvoichnogo-koda-v-tekst', title: 'Конвертер двоичного кода в текст', h1: 'Конвертер двоичного кода в текст',
            meta_title: 'Двоичный код в текст | Бинарный код в ASCII текст',
            meta_description: 'Конвертируйте двоичный код (8-битные группы) обратно в читаемый текст мгновенно.',
            short_answer: 'Этот калькулятор конвертирует двоичный код в читаемый текст, например 01001000 01101001 = «Hi».',
            intro_text: '<p>Введите двоичный код в виде 8-битных групп через пробел, чтобы декодировать его обратно в текст.</p>',
            key_points: [
                '<b>Формат:</b> каждая группа до 8 двоичных цифр (0 и 1) рассматривается как код ASCII одного символа.',
                '<b>Пример:</b> 01001000 = 72 = «H», 01101001 = 105 = «i» → «Hi».',
                '<b>Требуется разделение:</b> группы должны разделяться пробелами.',
            ],
            howto: [
                { question: 'Что если мой двоичный код — одна сплошная строка без пробелов?', answer: '<p>Сначала вставьте пробелы через каждые 8 цифр.</p>' },
                { question: 'Что означает «Invalid input»?', answer: '<p>Это означает, что одна из групп содержит символы, отличные от 0 и 1, или длиннее 8 цифр.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.ru, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.ru }],
        },
        lv: {
            slug: 'binara-koda-uz-tekstu-konvertetajs', title: 'Bināra Koda uz Tekstu Konvertētājs', h1: 'Bināra Koda uz Tekstu Konvertētājs',
            meta_title: 'Binārais Kods uz Tekstu | Binārais Kods uz ASCII Tekstu',
            meta_description: 'Konvertējiet bināro kodu (8 bitu grupas) atpakaļ lasāmā tekstā acumirklī.',
            short_answer: 'Šis kalkulators konvertē bināro kodu lasāmā tekstā, piemēram, 01001000 01101001 = "Hi".',
            intro_text: '<p>Ievadiet bināro kodu kā 8 bitu grupas, atdalītas ar atstarpēm, lai atkodētu to atpakaļ lasāmā tekstā.</p>',
            key_points: [
                '<b>Formāts:</b> katra grupa līdz 8 binārajiem cipariem (0 un 1) tiek uzskatīta par vienas rakstzīmes ASCII kodu.',
                '<b>Piemērs:</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Nepieciešams atdalījums:</b> grupām jābūt atdalītām ar atstarpēm.',
            ],
            howto: [
                { question: 'Ko darīt, ja mans binārais kods ir viena nepārtraukta virkne bez atstarpēm?', answer: '<p>Vispirms ievietojiet atstarpes ik pēc 8 cipariem.</p>' },
                { question: 'Ko nozīmē "Invalid input"?', answer: '<p>Tas nozīmē, ka viena no grupām satur rakstzīmes, kas nav 0 vai 1, vai ir garāka par 8 cipariem.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.lv, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-kodu-binarnego-na-tekst', title: 'Konwerter Kodu Binarnego na Tekst', h1: 'Konwerter Kodu Binarnego na Tekst',
            meta_title: 'Kod Binarny na Tekst | Kod Binarny na Tekst ASCII',
            meta_description: 'Przelicz kod binarny (grupy 8-bitowe) z powrotem na czytelny tekst natychmiast.',
            short_answer: 'Ten kalkulator przelicza kod binarny na czytelny tekst, np. 01001000 01101001 = "Hi".',
            intro_text: '<p>Wpisz kod binarny jako grupy 8-bitowe oddzielone spacjami, aby zdekodować go z powrotem na tekst.</p>',
            key_points: [
                '<b>Format:</b> każda grupa do 8 cyfr binarnych (0 i 1) jest traktowana jako kod ASCII jednego znaku.',
                '<b>Przykład:</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Wymagane rozdzielenie:</b> grupy muszą być oddzielone spacjami.',
            ],
            howto: [
                { question: 'Co jeśli mój kod binarny to jeden ciągły ciąg bez spacji?', answer: '<p>Najpierw wstaw spacje co 8 cyfr.</p>' },
                { question: 'Co oznacza "Invalid input"?', answer: '<p>Oznacza to, że jedna z grup zawiera znaki inne niż 0 i 1, lub jest dłuższa niż 8 cyfr.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.pl, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-binario-a-texto', title: 'Convertidor de Binario a Texto', h1: 'Convertidor de Binario a Texto',
            meta_title: 'Binario a Texto | Código Binario a Texto ASCII',
            meta_description: 'Convierte código binario (grupos de 8 bits) de vuelta a texto legible al instante.',
            short_answer: 'Esta calculadora convierte código binario en texto legible, p. ej. 01001000 01101001 = "Hi".',
            intro_text: '<p>Introduce código binario como grupos de 8 bits separados por espacios para decodificarlo de vuelta a texto legible.</p>',
            key_points: [
                '<b>Formato:</b> cada grupo de hasta 8 dígitos binarios (0 y 1) se trata como el código ASCII de un carácter.',
                '<b>Ejemplo:</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Separación requerida:</b> los grupos deben estar separados por espacios.',
            ],
            howto: [
                { question: '¿Qué pasa si mi código binario es una cadena continua sin espacios?', answer: '<p>Inserta espacios cada 8 dígitos primero.</p>' },
                { question: '¿Qué significa "Invalid input"?', answer: '<p>Significa que uno de los grupos contiene caracteres distintos de 0 y 1, o es más largo de 8 dígitos.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.es, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-de-binaire-en-texte', title: 'Convertisseur de Binaire en Texte', h1: 'Convertisseur de Binaire en Texte',
            meta_title: 'Binaire en Texte | Code Binaire en Texte ASCII',
            meta_description: 'Convertissez le code binaire (groupes de 8 bits) en texte lisible instantanément.',
            short_answer: 'Ce calculateur convertit le code binaire en texte lisible, ex. 01001000 01101001 = "Hi".',
            intro_text: '<p>Entrez le code binaire sous forme de groupes de 8 bits séparés par des espaces pour le décoder en texte lisible.</p>',
            key_points: [
                '<b>Format :</b> chaque groupe de jusqu’à 8 chiffres binaires (0 et 1) est traité comme le code ASCII d’un caractère.',
                '<b>Exemple :</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Séparation requise :</b> les groupes doivent être séparés par des espaces.',
            ],
            howto: [
                { question: 'Que faire si mon code binaire est une seule chaîne continue sans espaces ?', answer: '<p>Insérez d’abord des espaces tous les 8 chiffres.</p>' },
                { question: 'Que signifie "Invalid input" ?', answer: '<p>Cela signifie qu’un des groupes contient des caractères autres que 0 et 1, ou dépasse 8 chiffres.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.fr, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-da-binario-a-testo', title: 'Convertitore da Binario a Testo', h1: 'Convertitore da Binario a Testo',
            meta_title: 'Binario in Testo | Codice Binario in Testo ASCII',
            meta_description: 'Converti il codice binario (gruppi a 8 bit) di nuovo in testo leggibile istantaneamente.',
            short_answer: 'Questo calcolatore converte il codice binario in testo leggibile, es. 01001000 01101001 = "Hi".',
            intro_text: '<p>Inserisci il codice binario come gruppi a 8 bit separati da spazi per decodificarlo di nuovo in testo leggibile.</p>',
            key_points: [
                '<b>Formato:</b> ogni gruppo fino a 8 cifre binarie (0 e 1) è trattato come il codice ASCII di un carattere.',
                '<b>Esempio:</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Separazione richiesta:</b> i gruppi devono essere separati da spazi.',
            ],
            howto: [
                { question: 'Cosa succede se il mio codice binario è una stringa continua senza spazi?', answer: '<p>Inserisci prima gli spazi ogni 8 cifre.</p>' },
                { question: 'Cosa significa "Invalid input"?', answer: '<p>Significa che uno dei gruppi contiene caratteri diversi da 0 e 1, o è più lungo di 8 cifre.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.it, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.it }],
        },
        de: {
            slug: 'binaer-in-text-rechner', title: 'Binär in Text Rechner', h1: 'Binär in Text Rechner',
            meta_title: 'Binär in Text | Binärcode in ASCII-Text',
            meta_description: 'Rechnen Sie Binärcode (8-Bit-Gruppen) sofort zurück in lesbaren Text um.',
            short_answer: 'Dieser Rechner wandelt Binärcode in lesbaren Text um, z.B. 01001000 01101001 = "Hi".',
            intro_text: '<p>Geben Sie Binärcode als durch Leerzeichen getrennte 8-Bit-Gruppen ein, um ihn zurück in lesbaren Text zu decodieren.</p>',
            key_points: [
                '<b>Format:</b> jede Gruppe von bis zu 8 Binärziffern (0 und 1) wird als ASCII-Code eines Zeichens behandelt.',
                '<b>Beispiel:</b> 01001000 = 72 = "H", 01101001 = 105 = "i" → "Hi".',
                '<b>Trennung erforderlich:</b> Gruppen müssen durch Leerzeichen getrennt werden.',
            ],
            howto: [
                { question: 'Was, wenn mein Binärcode eine durchgehende Zeichenfolge ohne Leerzeichen ist?', answer: '<p>Fügen Sie zuerst alle 8 Ziffern Leerzeichen ein.</p>' },
                { question: 'Was bedeutet "Invalid input"?', answer: '<p>Es bedeutet, dass eine der Gruppen andere Zeichen als 0 und 1 enthält oder länger als 8 Ziffern ist.</p>' },
            ],
            inputs: [{ name: 'value', label: BINARY_CODE_LABEL.de, type: 'text', placeholder: '01001000 01101001' }],
            outputs: [{ name: 'result', label: TEXT_LABEL.de }],
        },
    },
}

const NUMBER_LABEL: Record<string, string> = { en: 'Number', ru: 'Число', de: 'Zahl', es: 'Número', fr: 'Nombre', it: 'Numero', pl: 'Liczba', lv: 'Skaitlis' }
const ROMAN_NUMERAL_LABEL: Record<string, string> = { en: 'Roman Numeral', ru: 'Римская цифра', de: 'Römische Zahl', es: 'Número Romano', fr: 'Chiffre Romain', it: 'Numero Romano', pl: 'Cyfra Rzymska', lv: 'Romiešu Cipars' }

// ============================================================
// 1154: Number to Roman Numeral Converter
// ============================================================
const numberToRomanTool: ToolDef = {
    id: '1154',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 1994 }],
        functions: { result: { type: 'function', functionName: 'numberToRoman', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'number-to-roman-numeral-converter', title: 'Number to Roman Numeral Converter', h1: 'Number to Roman Numeral Converter',
            meta_title: 'Number to Roman Numeral Converter | Convert 1-3999 to Roman Numerals',
            meta_description: 'Convert any whole number (1-3999) into Roman numerals instantly.',
            short_answer: 'This calculator converts a whole number into Roman numerals, e.g. 1994 = MCMXCIV.',
            intro_text: '<p>Enter any whole number from 1 to 3999 to see its Roman numeral form — useful for movie copyright years, clock faces, book chapter numbers, or general interest.</p>',
            key_points: [
                '<b>Basic symbols:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Subtractive notation:</b> a smaller symbol before a larger one means subtraction (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Range limit:</b> standard Roman numerals only cleanly represent 1 to 3999; there\'s no standard symbol for zero or numbers ≥ 4000.',
            ],
            howto: [
                { question: 'How do I write 2024 in Roman numerals?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Why can\'t I convert 0 or negative numbers?', answer: '<p>The Romans had no symbol for zero, and Roman numerals don\'t represent negative values — the valid range is 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.en, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.en }],
        },
        ru: {
            slug: 'konverter-chisla-v-rimskie-cifry', title: 'Конвертер числа в римские цифры', h1: 'Конвертер числа в римские цифры',
            meta_title: 'Число в римские цифры | Конвертер 1-3999 в римские цифры',
            meta_description: 'Конвертируйте любое целое число (1-3999) в римские цифры мгновенно.',
            short_answer: 'Этот калькулятор конвертирует целое число в римские цифры, например 1994 = MCMXCIV.',
            intro_text: '<p>Введите любое целое число от 1 до 3999, чтобы увидеть его в форме римских цифр — полезно для годов в титрах фильмов, циферблатов часов, номеров глав книг.</p>',
            key_points: [
                '<b>Основные символы:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Вычитательная запись:</b> меньший символ перед большим означает вычитание (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Ограничение диапазона:</b> стандартные римские цифры чисто представляют только 1-3999; нет стандартного символа для нуля или чисел ≥ 4000.',
            ],
            howto: [
                { question: 'Как записать 2024 римскими цифрами?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Почему я не могу конвертировать 0 или отрицательные числа?', answer: '<p>У римлян не было символа для нуля, и римские цифры не представляют отрицательные значения — допустимый диапазон 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.ru, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.ru }],
        },
        lv: {
            slug: 'skaitla-uz-romiesu-ciparu-konvertetajs', title: 'Skaitļa uz Romiešu Ciparu Konvertētājs', h1: 'Skaitļa uz Romiešu Ciparu Konvertētājs',
            meta_title: 'Skaitlis uz Romiešu Cipariem | Konvertētājs 1-3999 uz Romiešu Cipariem',
            meta_description: 'Konvertējiet jebkuru veselu skaitli (1-3999) romiešu ciparos acumirklī.',
            short_answer: 'Šis kalkulators konvertē veselu skaitli romiešu ciparos, piemēram, 1994 = MCMXCIV.',
            intro_text: '<p>Ievadiet jebkuru veselu skaitli no 1 līdz 3999, lai redzētu tā romiešu ciparu formu — noderīgi filmu autortiesību gadiem, pulksteņu cifrantiem, grāmatu nodaļu numuriem.</p>',
            key_points: [
                '<b>Pamata simboli:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Atņemšanas pieraksts:</b> mazāks simbols pirms lielāka nozīmē atņemšanu (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Diapazona ierobežojums:</b> standarta romiešu cipari skaidri attēlo tikai 1 līdz 3999; nav standarta simbola nullei vai skaitļiem ≥ 4000.',
            ],
            howto: [
                { question: 'Kā uzrakstīt 2024 romiešu ciparos?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Kāpēc nevaru konvertēt 0 vai negatīvus skaitļus?', answer: '<p>Romiešiem nebija simbola nullei, un romiešu cipari neattēlo negatīvas vērtības — derīgais diapazons ir 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.lv, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-liczby-na-cyfry-rzymskie', title: 'Konwerter Liczby na Cyfry Rzymskie', h1: 'Konwerter Liczby na Cyfry Rzymskie',
            meta_title: 'Liczba na Cyfry Rzymskie | Konwerter 1-3999 na Cyfry Rzymskie',
            meta_description: 'Przelicz dowolną liczbę całkowitą (1-3999) na cyfry rzymskie natychmiast.',
            short_answer: 'Ten kalkulator przelicza liczbę całkowitą na cyfry rzymskie, np. 1994 = MCMXCIV.',
            intro_text: '<p>Wpisz dowolną liczbę całkowitą od 1 do 3999, aby zobaczyć jej formę w cyfrach rzymskich — przydatne dla lat praw autorskich filmów, tarcz zegarowych, numerów rozdziałów książek.</p>',
            key_points: [
                '<b>Podstawowe symbole:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Notacja odejmowania:</b> mniejszy symbol przed większym oznacza odejmowanie (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Ograniczenie zakresu:</b> standardowe cyfry rzymskie czysto reprezentują tylko 1-3999; nie ma standardowego symbolu dla zera ani liczb ≥ 4000.',
            ],
            howto: [
                { question: 'Jak zapisać 2024 cyframi rzymskimi?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Dlaczego nie mogę przeliczyć 0 lub liczb ujemnych?', answer: '<p>Rzymianie nie mieli symbolu zera, a cyfry rzymskie nie reprezentują wartości ujemnych — poprawny zakres to 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.pl, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-numero-a-numeros-romanos', title: 'Convertidor de Número a Números Romanos', h1: 'Convertidor de Número a Números Romanos',
            meta_title: 'Número a Números Romanos | Convertidor de 1-3999 a Números Romanos',
            meta_description: 'Convierte cualquier número entero (1-3999) a números romanos al instante.',
            short_answer: 'Esta calculadora convierte un número entero a números romanos, p. ej. 1994 = MCMXCIV.',
            intro_text: '<p>Introduce cualquier número entero del 1 al 3999 para ver su forma en números romanos — útil para años de copyright de películas, esferas de reloj, números de capítulos de libros.</p>',
            key_points: [
                '<b>Símbolos básicos:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Notación sustractiva:</b> un símbolo más pequeño antes de uno más grande significa resta (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Límite de rango:</b> los números romanos estándar solo representan claramente del 1 al 3999; no hay símbolo estándar para cero o números ≥ 4000.',
            ],
            howto: [
                { question: '¿Cómo escribo 2024 en números romanos?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: '¿Por qué no puedo convertir 0 o números negativos?', answer: '<p>Los romanos no tenían símbolo para el cero, y los números romanos no representan valores negativos — el rango válido es 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.es, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-de-nombre-en-chiffres-romains', title: 'Convertisseur de Nombre en Chiffres Romains', h1: 'Convertisseur de Nombre en Chiffres Romains',
            meta_title: 'Nombre en Chiffres Romains | Convertisseur de 1-3999 en Chiffres Romains',
            meta_description: 'Convertissez n’importe quel nombre entier (1-3999) en chiffres romains instantanément.',
            short_answer: 'Ce calculateur convertit un nombre entier en chiffres romains, ex. 1994 = MCMXCIV.',
            intro_text: '<p>Entrez n’importe quel nombre entier de 1 à 3999 pour voir sa forme en chiffres romains — utile pour les années de copyright de films, les cadrans d’horloge, les numéros de chapitres de livres.</p>',
            key_points: [
                '<b>Symboles de base :</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Notation soustractive :</b> un symbole plus petit avant un plus grand signifie une soustraction (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Limite de plage :</b> les chiffres romains standard ne représentent proprement que 1 à 3999 ; il n’y a pas de symbole standard pour zéro ou les nombres ≥ 4000.',
            ],
            howto: [
                { question: 'Comment écrire 2024 en chiffres romains ?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Pourquoi ne puis-je pas convertir 0 ou des nombres négatifs ?', answer: '<p>Les Romains n’avaient pas de symbole pour zéro, et les chiffres romains ne représentent pas de valeurs négatives — la plage valide est 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.fr, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-da-numero-a-numeri-romani', title: 'Convertitore da Numero a Numeri Romani', h1: 'Convertitore da Numero a Numeri Romani',
            meta_title: 'Numero in Numeri Romani | Convertitore da 1-3999 a Numeri Romani',
            meta_description: 'Converti qualsiasi numero intero (1-3999) in numeri romani istantaneamente.',
            short_answer: 'Questo calcolatore converte un numero intero in numeri romani, es. 1994 = MCMXCIV.',
            intro_text: '<p>Inserisci qualsiasi numero intero da 1 a 3999 per vedere la sua forma in numeri romani — utile per anni di copyright dei film, quadranti di orologi, numeri di capitoli di libri.</p>',
            key_points: [
                '<b>Simboli base:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Notazione sottrattiva:</b> un simbolo più piccolo prima di uno più grande significa sottrazione (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Limite di intervallo:</b> i numeri romani standard rappresentano chiaramente solo da 1 a 3999; non esiste un simbolo standard per zero o numeri ≥ 4000.',
            ],
            howto: [
                { question: 'Come scrivo 2024 in numeri romani?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Perché non posso convertire 0 o numeri negativi?', answer: '<p>I romani non avevano un simbolo per lo zero, e i numeri romani non rappresentano valori negativi — l’intervallo valido è 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.it, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.it }],
        },
        de: {
            slug: 'zahl-in-roemische-zahlen-umrechner', title: 'Zahl in Römische Zahlen Umrechner', h1: 'Zahl in Römische Zahlen Umrechner',
            meta_title: 'Zahl in Römische Zahlen | Umrechner von 1-3999 in Römische Zahlen',
            meta_description: 'Rechnen Sie jede ganze Zahl (1-3999) sofort in römische Zahlen um.',
            short_answer: 'Dieser Rechner wandelt eine ganze Zahl in römische Zahlen um, z.B. 1994 = MCMXCIV.',
            intro_text: '<p>Geben Sie eine beliebige ganze Zahl von 1 bis 3999 ein, um ihre römische Zahlenform zu sehen — nützlich für Filmjahre im Abspann, Uhrenziffernblätter, Buchkapitelnummern.</p>',
            key_points: [
                '<b>Grundsymbole:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
                '<b>Subtraktive Notation:</b> ein kleineres Symbol vor einem größeren bedeutet Subtraktion (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).',
                '<b>Bereichsgrenze:</b> Standard-Römische Zahlen stellen sauber nur 1 bis 3999 dar; es gibt kein Standardsymbol für Null oder Zahlen ≥ 4000.',
            ],
            howto: [
                { question: 'Wie schreibe ich 2024 in römischen Zahlen?', answer: '<p>MMXXIV (2000=MM, 20=XX, 4=IV).</p>' },
                { question: 'Warum kann ich 0 oder negative Zahlen nicht umrechnen?', answer: '<p>Die Römer hatten kein Symbol für Null, und römische Zahlen stellen keine negativen Werte dar — der gültige Bereich ist 1-3999.</p>' },
            ],
            inputs: [{ name: 'value', label: NUMBER_LABEL.de, type: 'number', min: 1, max: 3999, placeholder: '1994' }],
            outputs: [{ name: 'result', label: ROMAN_NUMERAL_LABEL.de }],
        },
    },
}

// ============================================================
// 1155: Roman Numeral to Number Converter
// ============================================================
const romanToNumberTool: ToolDef = {
    id: '1155',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'value', default: 'MCMXCIV' }],
        functions: { result: { type: 'function', functionName: 'romanToNumber', params: { value: 'value' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'roman-numeral-to-number-converter', title: 'Roman Numeral to Number Converter', h1: 'Roman Numeral to Number Converter',
            meta_title: 'Roman Numeral to Number Converter | Convert Roman Numerals to Decimal',
            meta_description: 'Convert a Roman numeral into its decimal number value instantly.',
            short_answer: 'This calculator converts a Roman numeral into a decimal number, e.g. MCMXCIV = 1994.',
            intro_text: '<p>Enter a Roman numeral (using letters I, V, X, L, C, D, M) to instantly see its decimal number value — useful for reading movie copyright years, clock faces, or historical dates.</p>',
            key_points: [
                '<b>Method:</b> add each symbol\'s value left to right, but subtract a symbol if it comes right before a larger one.',
                '<b>Example:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Case-insensitive:</b> both uppercase (MCMXCIV) and lowercase (mcmxciv) work the same way.',
            ],
            howto: [
                { question: 'What number is XLII?', answer: '<p>XL=40, II=2, so XLII = 42.</p>' },
                { question: 'What if I enter an invalid Roman numeral like "IIII" or "VV"?', answer: '<p>This calculator parses the symbols using the standard subtraction rule and will still return a value, but it may not match standard Roman numeral notation (which would write 4 as "IV", not "IIII").</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.en, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.en }],
        },
        ru: {
            slug: 'konverter-rimskih-cifr-v-chislo', title: 'Конвертер римских цифр в число', h1: 'Конвертер римских цифр в число',
            meta_title: 'Римские цифры в число | Конвертер римских цифр в десятичное',
            meta_description: 'Конвертируйте римскую цифру в её десятичное числовое значение мгновенно.',
            short_answer: 'Этот калькулятор конвертирует римскую цифру в десятичное число, например MCMXCIV = 1994.',
            intro_text: '<p>Введите римскую цифру (используя буквы I, V, X, L, C, D, M), чтобы мгновенно увидеть её десятичное числовое значение.</p>',
            key_points: [
                '<b>Метод:</b> складывайте значения символов слева направо, но вычитайте символ, если он стоит перед большим.',
                '<b>Пример:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Регистр не важен:</b> и заглавные (MCMXCIV), и строчные (mcmxciv) буквы работают одинаково.',
            ],
            howto: [
                { question: 'Какое число XLII?', answer: '<p>XL=40, II=2, значит XLII = 42.</p>' },
                { question: 'Что если ввести недопустимую римскую цифру вроде «IIII» или «VV»?', answer: '<p>Этот калькулятор разбирает символы по стандартному правилу вычитания и всё равно вернёт значение, но оно может не соответствовать стандартной записи римских цифр.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.ru, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.ru }],
        },
        lv: {
            slug: 'romiesu-ciparu-uz-skaitli-konvertetajs', title: 'Romiešu Ciparu uz Skaitli Konvertētājs', h1: 'Romiešu Ciparu uz Skaitli Konvertētājs',
            meta_title: 'Romiešu Cipari uz Skaitli | Konvertētājs no Romiešu Cipariem uz Decimālo',
            meta_description: 'Konvertējiet romiešu ciparu tā decimālajā skaitliskajā vērtībā acumirklī.',
            short_answer: 'Šis kalkulators konvertē romiešu ciparu decimālā skaitlī, piemēram, MCMXCIV = 1994.',
            intro_text: '<p>Ievadiet romiešu ciparu (izmantojot burtus I, V, X, L, C, D, M), lai uzreiz redzētu tā decimālo skaitlisko vērtību.</p>',
            key_points: [
                '<b>Metode:</b> saskaitiet katra simbola vērtību no kreisās uz labo, bet atņemiet simbolu, ja tas atrodas tieši pirms lielāka.',
                '<b>Piemērs:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Reģistrs nav svarīgs:</b> gan lielie (MCMXCIV), gan mazie (mcmxciv) burti darbojas vienādi.',
            ],
            howto: [
                { question: 'Kāds skaitlis ir XLII?', answer: '<p>XL=40, II=2, tātad XLII = 42.</p>' },
                { question: 'Ko darīt, ja ievadu nederīgu romiešu ciparu, piemēram, "IIII" vai "VV"?', answer: '<p>Šis kalkulators parsē simbolus, izmantojot standarta atņemšanas noteikumu, un tomēr atgriezīs vērtību, taču tā var neatbilst standarta romiešu ciparu pierakstam.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.lv, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-cyfr-rzymskich-na-liczbe', title: 'Konwerter Cyfr Rzymskich na Liczbę', h1: 'Konwerter Cyfr Rzymskich na Liczbę',
            meta_title: 'Cyfry Rzymskie na Liczbę | Konwerter Cyfr Rzymskich na Dziesiętną',
            meta_description: 'Przelicz cyfrę rzymską na jej dziesiętną wartość liczbową natychmiast.',
            short_answer: 'Ten kalkulator przelicza cyfrę rzymską na liczbę dziesiętną, np. MCMXCIV = 1994.',
            intro_text: '<p>Wpisz cyfrę rzymską (używając liter I, V, X, L, C, D, M), aby natychmiast zobaczyć jej dziesiętną wartość liczbową.</p>',
            key_points: [
                '<b>Metoda:</b> dodawaj wartość każdego symbolu od lewej do prawej, ale odejmuj symbol, jeśli znajduje się tuż przed większym.',
                '<b>Przykład:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Wielkość liter nieistotna:</b> zarówno wielkie (MCMXCIV), jak i małe (mcmxciv) litery działają tak samo.',
            ],
            howto: [
                { question: 'Jaka to liczba XLII?', answer: '<p>XL=40, II=2, więc XLII = 42.</p>' },
                { question: 'Co jeśli wpiszę nieprawidłową cyfrę rzymską jak "IIII" lub "VV"?', answer: '<p>Ten kalkulator analizuje symbole używając standardowej reguły odejmowania i nadal zwróci wartość, ale może nie odpowiadać standardowemu zapisowi cyfr rzymskich.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.pl, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-numeros-romanos-a-numero', title: 'Convertidor de Números Romanos a Número', h1: 'Convertidor de Números Romanos a Número',
            meta_title: 'Números Romanos a Número | Convertidor de Números Romanos a Decimal',
            meta_description: 'Convierte un número romano en su valor numérico decimal al instante.',
            short_answer: 'Esta calculadora convierte un número romano en un número decimal, p. ej. MCMXCIV = 1994.',
            intro_text: '<p>Introduce un número romano (usando las letras I, V, X, L, C, D, M) para ver al instante su valor numérico decimal.</p>',
            key_points: [
                '<b>Método:</b> suma el valor de cada símbolo de izquierda a derecha, pero resta un símbolo si va justo antes de uno más grande.',
                '<b>Ejemplo:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>No distingue mayúsculas:</b> tanto mayúsculas (MCMXCIV) como minúsculas (mcmxciv) funcionan igual.',
            ],
            howto: [
                { question: '¿Qué número es XLII?', answer: '<p>XL=40, II=2, así que XLII = 42.</p>' },
                { question: '¿Qué pasa si introduzco un número romano inválido como "IIII" o "VV"?', answer: '<p>Esta calculadora analiza los símbolos usando la regla estándar de resta y aún devolverá un valor, pero puede no coincidir con la notación romana estándar.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.es, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-de-chiffres-romains-en-nombre', title: 'Convertisseur de Chiffres Romains en Nombre', h1: 'Convertisseur de Chiffres Romains en Nombre',
            meta_title: 'Chiffres Romains en Nombre | Convertisseur de Chiffres Romains en Décimal',
            meta_description: 'Convertissez un chiffre romain en sa valeur numérique décimale instantanément.',
            short_answer: 'Ce calculateur convertit un chiffre romain en nombre décimal, ex. MCMXCIV = 1994.',
            intro_text: '<p>Entrez un chiffre romain (en utilisant les lettres I, V, X, L, C, D, M) pour voir instantanément sa valeur numérique décimale.</p>',
            key_points: [
                '<b>Méthode :</b> additionnez la valeur de chaque symbole de gauche à droite, mais soustrayez un symbole s’il précède immédiatement un plus grand.',
                '<b>Exemple :</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Insensible à la casse :</b> majuscules (MCMXCIV) et minuscules (mcmxciv) fonctionnent de la même façon.',
            ],
            howto: [
                { question: 'Quel nombre est XLII ?', answer: '<p>XL=40, II=2, donc XLII = 42.</p>' },
                { question: 'Que se passe-t-il si j’entre un chiffre romain invalide comme "IIII" ou "VV" ?', answer: '<p>Ce calculateur analyse les symboles selon la règle standard de soustraction et renverra tout de même une valeur, mais elle peut ne pas correspondre à la notation romaine standard.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.fr, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-da-numeri-romani-a-numero', title: 'Convertitore da Numeri Romani a Numero', h1: 'Convertitore da Numeri Romani a Numero',
            meta_title: 'Numeri Romani in Numero | Convertitore da Numeri Romani a Decimale',
            meta_description: 'Converti un numero romano nel suo valore numerico decimale istantaneamente.',
            short_answer: 'Questo calcolatore converte un numero romano in un numero decimale, es. MCMXCIV = 1994.',
            intro_text: '<p>Inserisci un numero romano (usando le lettere I, V, X, L, C, D, M) per vedere subito il suo valore numerico decimale.</p>',
            key_points: [
                '<b>Metodo:</b> somma il valore di ogni simbolo da sinistra a destra, ma sottrai un simbolo se precede immediatamente uno più grande.',
                '<b>Esempio:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Non sensibile a maiuscole/minuscole:</b> sia maiuscolo (MCMXCIV) che minuscolo (mcmxciv) funzionano allo stesso modo.',
            ],
            howto: [
                { question: 'Che numero è XLII?', answer: '<p>XL=40, II=2, quindi XLII = 42.</p>' },
                { question: 'Cosa succede se inserisco un numero romano non valido come "IIII" o "VV"?', answer: '<p>Questo calcolatore analizza i simboli usando la regola standard di sottrazione e restituirà comunque un valore, ma potrebbe non corrispondere alla notazione romana standard.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.it, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.it }],
        },
        de: {
            slug: 'roemische-zahl-in-zahl-umrechner', title: 'Römische Zahl in Zahl Umrechner', h1: 'Römische Zahl in Zahl Umrechner',
            meta_title: 'Römische Zahl in Zahl | Umrechner von Römischen Zahlen in Dezimal',
            meta_description: 'Rechnen Sie eine römische Zahl sofort in ihren dezimalen Zahlenwert um.',
            short_answer: 'Dieser Rechner wandelt eine römische Zahl in eine Dezimalzahl um, z.B. MCMXCIV = 1994.',
            intro_text: '<p>Geben Sie eine römische Zahl ein (mit den Buchstaben I, V, X, L, C, D, M), um sofort ihren dezimalen Zahlenwert zu sehen.</p>',
            key_points: [
                '<b>Methode:</b> addieren Sie den Wert jedes Symbols von links nach rechts, subtrahieren Sie aber ein Symbol, wenn es direkt vor einem größeren steht.',
                '<b>Beispiel:</b> MCMXCIV = M(1000) + CM(900) + XC(90) + IV(4) = 1994.',
                '<b>Groß-/Kleinschreibung egal:</b> sowohl Großbuchstaben (MCMXCIV) als auch Kleinbuchstaben (mcmxciv) funktionieren gleich.',
            ],
            howto: [
                { question: 'Welche Zahl ist XLII?', answer: '<p>XL=40, II=2, also XLII = 42.</p>' },
                { question: 'Was passiert, wenn ich eine ungültige römische Zahl wie "IIII" oder "VV" eingebe?', answer: '<p>Dieser Rechner analysiert die Symbole nach der Standard-Subtraktionsregel und gibt trotzdem einen Wert zurück, der aber möglicherweise nicht der Standard-Schreibweise entspricht.</p>' },
            ],
            inputs: [{ name: 'value', label: ROMAN_NUMERAL_LABEL.de, type: 'text', placeholder: 'MCMXCIV' }],
            outputs: [{ name: 'result', label: NUMBER_LABEL.de }],
        },
    },
}

export const tools: ToolDef[] = [
    dataStorageConverterTool, downloadTimeCalculatorTool,
    numberBaseConverterTool, binaryToDecimalTool, decimalToBinaryTool, decimalToHexadecimalTool, hexadecimalToDecimalTool, textToBinaryTool, binaryToTextTool,
    numberToRomanTool, romanToNumberTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: DIGITAL_MISC_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: DIGITAL_MISC_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} digital & miscellaneous converters across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
