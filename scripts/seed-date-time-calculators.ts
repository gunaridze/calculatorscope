// One-off script: seeds 17 new Date & Time Calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-date-time-calculators.ts
//
// Tool IDs 1116-1132, category_id '9' (Date & Time Calculators).
// These are the calendar/scheduling/productivity tools from the requested
// list; the pure conversion/arithmetic tools went to the "Time & Speed
// Converters" category (id '31') in a companion seed script.
//
// Two tools (1120 Countdown Timer, 1126 Digital Stopwatch) are rendered by
// bespoke live-ticking React components (CountdownTimerWidget.tsx /
// StopwatchWidget.tsx), special-cased by tool_id in CalculatorWidget.tsx.
// Their config_json is a minimal placeholder since the generic engine is
// bypassed entirely; only the ToolI18n content (title/h1/meta/SEO copy)
// actually drives their page.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DATE_TIME_CATEGORY_ID = '9'

type InputField = {
    name: string
    label: string
    type: 'number' | 'select' | 'date'
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
// Shared field labels
// ============================================================
const RESULT_LABEL: Record<string, string> = { en: 'Result', ru: 'Результат', de: 'Ergebnis', es: 'Resultado', fr: 'Résultat', it: 'Risultato', pl: 'Wynik', lv: 'Rezultāts' }
const DATE_LABEL: Record<string, string> = { en: 'Date', ru: 'Дата', de: 'Datum', es: 'Fecha', fr: 'Date', it: 'Data', pl: 'Data', lv: 'Datums' }
const START_DATE_LABEL: Record<string, string> = { en: 'Start Date', ru: 'Дата начала', de: 'Startdatum', es: 'Fecha de Inicio', fr: 'Date de Début', it: 'Data di Inizio', pl: 'Data Rozpoczęcia', lv: 'Sākuma Datums' }
const END_DATE_LABEL: Record<string, string> = { en: 'End Date', ru: 'Дата окончания', de: 'Enddatum', es: 'Fecha de Fin', fr: 'Date de Fin', it: 'Data di Fine', pl: 'Data Zakończenia', lv: 'Beigu Datums' }
const BIRTH_DATE_LABEL: Record<string, string> = { en: 'Birth Date', ru: 'Дата рождения', de: 'Geburtsdatum', es: 'Fecha de Nacimiento', fr: 'Date de Naissance', it: 'Data di Nascita', pl: 'Data Urodzenia', lv: 'Dzimšanas Datums' }
const AS_OF_DATE_LABEL: Record<string, string> = { en: 'As of Date', ru: 'По состоянию на дату', de: 'Stichtag', es: 'Fecha de Referencia', fr: 'Date de Référence', it: 'Data di Riferimento', pl: 'Data Odniesienia', lv: 'Atskaites Datums' }
const YEARS_LABEL: Record<string, string> = { en: 'Years', ru: 'Лет', de: 'Jahre', es: 'Años', fr: 'Ans', it: 'Anni', pl: 'Lata', lv: 'Gadi' }
const MONTHS_LABEL: Record<string, string> = { en: 'Months', ru: 'Месяцев', de: 'Monate', es: 'Meses', fr: 'Mois', it: 'Mesi', pl: 'Miesiące', lv: 'Mēneši' }
const DAYS_LABEL: Record<string, string> = { en: 'Days', ru: 'Дней', de: 'Tage', es: 'Días', fr: 'Jours', it: 'Giorni', pl: 'Dni', lv: 'Dienas' }
const TOTAL_DAYS_LABEL: Record<string, string> = { en: 'Total Days', ru: 'Всего дней', de: 'Gesamttage', es: 'Días Totales', fr: 'Jours Totaux', it: 'Giorni Totali', pl: 'Łącznie Dni', lv: 'Kopā Dienas' }
const TOTAL_WEEKS_LABEL: Record<string, string> = { en: 'Total Weeks', ru: 'Всего недель', de: 'Gesamtwochen', es: 'Semanas Totales', fr: 'Semaines Totales', it: 'Settimane Totali', pl: 'Łącznie Tygodni', lv: 'Kopā Nedēļas' }
const AMOUNT_LABEL: Record<string, string> = { en: 'Amount', ru: 'Количество', de: 'Menge', es: 'Cantidad', fr: 'Quantité', it: 'Quantità', pl: 'Ilość', lv: 'Daudzums' }
const UNIT_LABEL: Record<string, string> = { en: 'Unit', ru: 'Единица', de: 'Einheit', es: 'Unidad', fr: 'Unité', it: 'Unità', pl: 'Jednostka', lv: 'Vienība' }
const OPERATION_LABEL: Record<string, string> = { en: 'Operation', ru: 'Операция', de: 'Operation', es: 'Operación', fr: 'Opération', it: 'Operazione', pl: 'Operacja', lv: 'Darbība' }
const HOUR_LABEL: Record<string, string> = { en: 'Hour', ru: 'Час', de: 'Stunde', es: 'Hora', fr: 'Heure', it: 'Ora', pl: 'Godzina', lv: 'Stunda' }
const MINUTE_LABEL: Record<string, string> = { en: 'Minute', ru: 'Минута', de: 'Minute', es: 'Minuto', fr: 'Minute', it: 'Minuto', pl: 'Minuta', lv: 'Minūte' }
const AMPM_LABEL: Record<string, string> = { en: 'AM/PM', ru: 'AM/PM', de: 'AM/PM', es: 'AM/PM', fr: 'AM/PM', it: 'AM/PM', pl: 'AM/PM', lv: 'AM/PM' }
const DURATION_RESULT_LABEL: Record<string, string> = { en: 'Duration', ru: 'Длительность', de: 'Dauer', es: 'Duración', fr: 'Durée', it: 'Durata', pl: 'Czas Trwania', lv: 'Ilgums' }
const DECIMAL_HOURS_RESULT_LABEL: Record<string, string> = { en: 'Decimal Hours', ru: 'Десятичные часы', de: 'Dezimalstunden', es: 'Horas Decimales', fr: 'Heures Décimales', it: 'Ore Decimali', pl: 'Godziny Dziesiętne', lv: 'Decimālās Stundas' }

function ampmOptions(lang: string) {
    const l: Record<string, [string, string]> = { en: ['AM', 'PM'], ru: ['AM (утро)', 'PM (день)'], de: ['AM (vormittags)', 'PM (nachmittags)'], es: ['AM (mañana)', 'PM (tarde)'], fr: ['AM (matin)', 'PM (après-midi)'], it: ['AM (mattina)', 'PM (pomeriggio)'], pl: ['AM (rano)', 'PM (popołudnie)'], lv: ['AM (rīts)', 'PM (pēcpusdiena)'] }
    const [am, pm] = l[lang] || l.en
    return [{ value: 'AM', label: am }, { value: 'PM', label: pm }]
}
function unitOptions(lang: string) {
    const l: Record<string, [string, string, string, string]> = {
        en: ['Days', 'Weeks', 'Months', 'Years'], ru: ['Дни', 'Недели', 'Месяцы', 'Годы'],
        de: ['Tage', 'Wochen', 'Monate', 'Jahre'], es: ['Días', 'Semanas', 'Meses', 'Años'],
        fr: ['Jours', 'Semaines', 'Mois', 'Années'], it: ['Giorni', 'Settimane', 'Mesi', 'Anni'],
        pl: ['Dni', 'Tygodnie', 'Miesiące', 'Lata'], lv: ['Dienas', 'Nedēļas', 'Mēneši', 'Gadi'],
    }
    const [d, w, m, y] = l[lang] || l.en
    return [{ value: 'days', label: d }, { value: 'weeks', label: w }, { value: 'months', label: m }, { value: 'years', label: y }]
}
function addSubtractOptions(lang: string) {
    const l: Record<string, [string, string]> = { en: ['Add', 'Subtract'], ru: ['Сложить', 'Вычесть'], de: ['Addieren', 'Subtrahieren'], es: ['Sumar', 'Restar'], fr: ['Additionner', 'Soustraire'], it: ['Aggiungi', 'Sottrai'], pl: ['Dodaj', 'Odejmij'], lv: ['Pieskaitīt', 'Atņemt'] }
    const [add, sub] = l[lang] || l.en
    return [{ value: 'add', label: add }, { value: 'subtract', label: sub }]
}

// ============================================================
// 1116: Roman Numeral Date Converter
// ============================================================
const romanDateTool: ToolDef = {
    id: '1116',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'date', default: 'today' }],
        functions: { result: { type: 'function', functionName: 'romanNumeralDate', params: { date: 'date' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'roman-numeral-date-converter', title: 'Roman Numeral Date Converter', h1: 'Roman Numeral Date Converter',
            meta_title: 'Roman Numeral Date Converter | Convert Any Date to Roman Numerals',
            meta_description: 'Convert any calendar date into Roman numerals — perfect for tattoos, engravings, or wedding invitations.',
            short_answer: 'This calculator converts a date (month.day.year) into Roman numerals, e.g. July 21, 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Roman numeral dates are a popular choice for tattoos, wedding rings, and engravings. Pick any date and instantly see its Roman numeral form.</p>',
            key_points: [
                '<b>Format:</b> Month.Day.Year, each part converted separately (e.g. July 21, 2024 → VII.XXI.MMXXIV).',
                '<b>Roman numeral basics:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, combined using standard subtractive notation (IV=4, IX=9).',
                '<b>Example year:</b> 2024 = MMXXIV (M+M+XX+IV = 1000+1000+20+4).',
            ],
            howto: [
                { question: 'How is the day converted if it’s a large number like 29?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), following the same subtractive rules as any other number.</p>' },
                { question: 'Can I use this for a wedding date?', answer: '<p>Yes — enter your wedding date and copy the Roman numeral result for engraving or invitations.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.en, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.en }],
        },
        ru: {
            slug: 'konverter-daty-v-rimskie-cifry', title: 'Конвертер даты в римские цифры', h1: 'Конвертер даты в римские цифры',
            meta_title: 'Конвертер даты в римские цифры | Дата в римском формате',
            meta_description: 'Конвертируйте любую календарную дату в римские цифры — идеально для татуировок, гравировок или свадебных приглашений.',
            short_answer: 'Этот калькулятор конвертирует дату (месяц.день.год) в римские цифры, например 21 июля 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Даты римскими цифрами популярны для татуировок, обручальных колец и гравировок. Выберите любую дату и мгновенно увидите её римскую форму.</p>',
            key_points: [
                '<b>Формат:</b> Месяц.День.Год, каждая часть конвертируется отдельно.',
                '<b>Основы римских цифр:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, комбинируются с вычитательной записью (IV=4, IX=9).',
                '<b>Пример года:</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: 'Как конвертируется день, если это большое число, например 29?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), по тем же правилам вычитания.</p>' },
                { question: 'Можно ли использовать это для даты свадьбы?', answer: '<p>Да — введите дату свадьбы и скопируйте результат для гравировки или приглашений.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.ru, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.ru }],
        },
        lv: {
            slug: 'datuma-uz-romiesu-cipariem-konvertetajs', title: 'Datuma uz Romiešu Cipariem Konvertētājs', h1: 'Datuma uz Romiešu Cipariem Konvertētājs',
            meta_title: 'Datuma uz Romiešu Cipariem Konvertētājs | Datums Romiešu Formātā',
            meta_description: 'Konvertējiet jebkuru kalendāra datumu romiešu ciparos — lieliski piemērots tetovējumiem, gravējumiem vai kāzu ielūgumiem.',
            short_answer: 'Šis kalkulators konvertē datumu (mēnesis.diena.gads) romiešu ciparos, piemēram, 2024. gada 21. jūlijs → VII.XXI.MMXXIV.',
            intro_text: '<p>Datumi romiešu ciparos ir populāri tetovējumiem, kāzu gredzeniem un gravējumiem. Izvēlieties jebkuru datumu un uzreiz redzēsiet tā romiešu formu.</p>',
            key_points: [
                '<b>Formāts:</b> Mēnesis.Diena.Gads, katra daļa konvertēta atsevišķi.',
                '<b>Romiešu ciparu pamati:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, kombinēti ar standarta atņemšanas pierakstu (IV=4, IX=9).',
                '<b>Gada piemērs:</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: 'Kā tiek konvertēta diena, ja tas ir liels skaitlis, piemēram, 29?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), pēc tiem pašiem atņemšanas noteikumiem.</p>' },
                { question: 'Vai varu izmantot to kāzu datumam?', answer: '<p>Jā — ievadiet kāzu datumu un kopējiet romiešu ciparu rezultātu gravēšanai vai ielūgumiem.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.lv, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.lv }],
        },
        pl: {
            slug: 'konwerter-daty-na-cyfry-rzymskie', title: 'Konwerter Daty na Cyfry Rzymskie', h1: 'Konwerter Daty na Cyfry Rzymskie',
            meta_title: 'Konwerter Daty na Cyfry Rzymskie | Data w Formacie Rzymskim',
            meta_description: 'Przelicz dowolną datę kalendarzową na cyfry rzymskie — idealne na tatuaże, grawerowanie lub zaproszenia ślubne.',
            short_answer: 'Ten kalkulator przelicza datę (miesiąc.dzień.rok) na cyfry rzymskie, np. 21 lipca 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Daty w cyfrach rzymskich są popularne na tatuaże, obrączki ślubne i grawerowanie. Wybierz dowolną datę i natychmiast zobacz jej rzymską formę.</p>',
            key_points: [
                '<b>Format:</b> Miesiąc.Dzień.Rok, każda część przeliczana osobno.',
                '<b>Podstawy cyfr rzymskich:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, łączone przy użyciu notacji odejmowania (IV=4, IX=9).',
                '<b>Przykład roku:</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: 'Jak przelicza się dzień, jeśli to duża liczba jak 29?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), według tych samych zasad odejmowania.</p>' },
                { question: 'Czy mogę użyć tego na datę ślubu?', answer: '<p>Tak — wpisz datę ślubu i skopiuj wynik w cyfrach rzymskich do grawerowania lub zaproszeń.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.pl, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.pl }],
        },
        es: {
            slug: 'convertidor-de-fecha-a-numeros-romanos', title: 'Convertidor de Fecha a Números Romanos', h1: 'Convertidor de Fecha a Números Romanos',
            meta_title: 'Convertidor de Fecha a Números Romanos | Fecha en Formato Romano',
            meta_description: 'Convierte cualquier fecha del calendario a números romanos — perfecto para tatuajes, grabados o invitaciones de boda.',
            short_answer: 'Esta calculadora convierte una fecha (mes.día.año) a números romanos, p. ej. 21 de julio de 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Las fechas en números romanos son una opción popular para tatuajes, anillos de boda y grabados. Elige cualquier fecha y ve al instante su forma en números romanos.</p>',
            key_points: [
                '<b>Formato:</b> Mes.Día.Año, cada parte convertida por separado.',
                '<b>Fundamentos de números romanos:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, combinados con notación sustractiva (IV=4, IX=9).',
                '<b>Ejemplo de año:</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: '¿Cómo se convierte el día si es un número grande como 29?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), siguiendo las mismas reglas sustractivas.</p>' },
                { question: '¿Puedo usar esto para una fecha de boda?', answer: '<p>Sí — introduce tu fecha de boda y copia el resultado en números romanos para grabar o invitaciones.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.es, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.es }],
        },
        fr: {
            slug: 'convertisseur-de-date-en-chiffres-romains', title: 'Convertisseur de Date en Chiffres Romains', h1: 'Convertisseur de Date en Chiffres Romains',
            meta_title: 'Convertisseur de Date en Chiffres Romains | Date au Format Romain',
            meta_description: 'Convertissez n’importe quelle date en chiffres romains — parfait pour les tatouages, gravures ou faire-part de mariage.',
            short_answer: 'Ce calculateur convertit une date (mois.jour.année) en chiffres romains, ex. 21 juillet 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Les dates en chiffres romains sont un choix populaire pour les tatouages, alliances et gravures. Choisissez une date et voyez instantanément sa forme en chiffres romains.</p>',
            key_points: [
                '<b>Format :</b> Mois.Jour.Année, chaque partie convertie séparément.',
                '<b>Bases des chiffres romains :</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, combinés avec la notation soustractive (IV=4, IX=9).',
                '<b>Exemple d’année :</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: 'Comment le jour est-il converti si c’est un grand nombre comme 29 ?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), selon les mêmes règles soustractives.</p>' },
                { question: 'Puis-je utiliser ceci pour une date de mariage ?', answer: '<p>Oui — entrez votre date de mariage et copiez le résultat en chiffres romains pour la gravure ou les faire-part.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.fr, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.fr }],
        },
        it: {
            slug: 'convertitore-di-data-in-numeri-romani', title: 'Convertitore di Data in Numeri Romani', h1: 'Convertitore di Data in Numeri Romani',
            meta_title: 'Convertitore di Data in Numeri Romani | Data in Formato Romano',
            meta_description: 'Converti qualsiasi data del calendario in numeri romani — perfetto per tatuaggi, incisioni o inviti di matrimonio.',
            short_answer: 'Questo calcolatore converte una data (mese.giorno.anno) in numeri romani, es. 21 luglio 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Le date in numeri romani sono una scelta popolare per tatuaggi, fedi nuziali e incisioni. Scegli una data e vedi subito la sua forma in numeri romani.</p>',
            key_points: [
                '<b>Formato:</b> Mese.Giorno.Anno, ogni parte convertita separatamente.',
                '<b>Basi dei numeri romani:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, combinati con notazione sottrattiva (IV=4, IX=9).',
                '<b>Esempio di anno:</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: 'Come si converte il giorno se è un numero grande come 29?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), seguendo le stesse regole sottrattive.</p>' },
                { question: 'Posso usarlo per una data di matrimonio?', answer: '<p>Sì — inserisci la data del matrimonio e copia il risultato in numeri romani per l’incisione o gli inviti.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.it, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.it }],
        },
        de: {
            slug: 'datum-in-roemische-zahlen-umrechner', title: 'Datum in Römische Zahlen Umrechner', h1: 'Datum in Römische Zahlen Umrechner',
            meta_title: 'Datum in Römische Zahlen | Datum im Römischen Format',
            meta_description: 'Rechnen Sie jedes Kalenderdatum in römische Zahlen um — perfekt für Tattoos, Gravuren oder Hochzeitseinladungen.',
            short_answer: 'Dieser Rechner wandelt ein Datum (Monat.Tag.Jahr) in römische Zahlen um, z.B. 21. Juli 2024 → VII.XXI.MMXXIV.',
            intro_text: '<p>Daten in römischen Zahlen sind eine beliebte Wahl für Tattoos, Eheringe und Gravuren. Wählen Sie ein Datum und sehen Sie sofort seine römische Form.</p>',
            key_points: [
                '<b>Format:</b> Monat.Tag.Jahr, jeder Teil separat umgerechnet.',
                '<b>Grundlagen römischer Zahlen:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000, kombiniert mit subtraktiver Notation (IV=4, IX=9).',
                '<b>Jahresbeispiel:</b> 2024 = MMXXIV.',
            ],
            howto: [
                { question: 'Wie wird der Tag umgerechnet, wenn es eine große Zahl wie 29 ist?', answer: '<p>29 = XXIX (X+X+IX = 10+10+9), nach denselben subtraktiven Regeln.</p>' },
                { question: 'Kann ich das für ein Hochzeitsdatum verwenden?', answer: '<p>Ja — geben Sie Ihr Hochzeitsdatum ein und kopieren Sie das Ergebnis in römischen Zahlen für Gravuren oder Einladungen.</p>' },
            ],
            inputs: [{ name: 'date', label: DATE_LABEL.de, type: 'date', default: 'today' }],
            outputs: [{ name: 'result', label: RESULT_LABEL.de }],
        },
    },
}

// ============================================================
// 1117: Age Calculator
// ============================================================
const ageCalculatorTool: ToolDef = {
    id: '1117',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'birth_date', default: '1990-01-01' }, { key: 'as_of_date', default: 'today' }],
        functions: { result: { type: 'function', functionName: 'ageCalculator', params: { birth_date: 'birth_date', as_of_date: 'as_of_date' } } },
        outputs: [{ key: 'years' }, { key: 'months' }, { key: 'days' }, { key: 'total_days' }, { key: 'days_to_next_birthday' }],
    },
    locales: {
        en: {
            slug: 'age-calculator', title: 'Age Calculator', h1: 'Age Calculator',
            meta_title: 'Age Calculator | Find Your Exact Age in Years, Months, Days',
            meta_description: 'Calculate your exact age in years, months, and days from your birth date, plus days until your next birthday.',
            short_answer: 'This calculator finds your exact age in years, months, and days as of any date, plus a countdown to your next birthday.',
            intro_text: '<p>Enter a birth date to find the exact age as of today (or any other reference date) — broken down into years, months, and days, plus total days lived and days remaining to the next birthday.</p>',
            key_points: [
                '<b>Method:</b> a standard year/month/day-borrow calendar subtraction between birth date and reference date.',
                '<b>Total days:</b> the exact number of days lived is also shown, useful for milestone tracking (e.g. 10,000 days old).',
                '<b>Next birthday:</b> the countdown automatically rolls over to next year once this year’s birthday has passed.',
            ],
            howto: [
                { question: 'What if I was born on February 29 (leap day)?', answer: '<p>The calculator uses standard calendar-month arithmetic, treating the anniversary correctly across leap and non-leap years.</p>' },
                { question: 'Can I check my age as of a future or past date?', answer: '<p>Yes — change the "As of Date" field to any date to see your age at that point in time.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.en, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.en, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.en }, { name: 'months', label: MONTHS_LABEL.en }, { name: 'days', label: DAYS_LABEL.en },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.en },
                { name: 'days_to_next_birthday', label: 'Days to Next Birthday' },
            ],
        },
        ru: {
            slug: 'kalkulyator-vozrasta', title: 'Калькулятор возраста', h1: 'Калькулятор возраста',
            meta_title: 'Калькулятор возраста | Точный возраст в годах, месяцах, днях',
            meta_description: 'Рассчитайте свой точный возраст в годах, месяцах и днях по дате рождения, плюс дни до следующего дня рождения.',
            short_answer: 'Этот калькулятор находит точный возраст в годах, месяцах и днях на любую дату, плюс отсчёт до следующего дня рождения.',
            intro_text: '<p>Введите дату рождения, чтобы узнать точный возраст на сегодня (или другую дату) — в годах, месяцах и днях, плюс всего прожитых дней и дней до следующего дня рождения.</p>',
            key_points: [
                '<b>Метод:</b> стандартное календарное вычитание год/месяц/день с заимствованием.',
                '<b>Всего дней:</b> также показывается точное количество прожитых дней, полезно для отслеживания вех (например, 10000 дней).',
                '<b>Следующий день рождения:</b> отсчёт автоматически переходит на следующий год после того, как день рождения этого года прошёл.',
            ],
            howto: [
                { question: 'Что если я родился 29 февраля (високосный день)?', answer: '<p>Калькулятор использует стандартную календарную арифметику, корректно обрабатывая годовщину в високосные и обычные годы.</p>' },
                { question: 'Могу ли я проверить возраст на будущую или прошлую дату?', answer: '<p>Да — измените поле "По состоянию на дату" на любую дату, чтобы увидеть возраст на тот момент.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.ru, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.ru, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.ru }, { name: 'months', label: MONTHS_LABEL.ru }, { name: 'days', label: DAYS_LABEL.ru },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.ru },
                { name: 'days_to_next_birthday', label: 'Дней до следующего дня рождения' },
            ],
        },
        lv: {
            slug: 'vecuma-kalkulators', title: 'Vecuma Kalkulators', h1: 'Vecuma Kalkulators',
            meta_title: 'Vecuma Kalkulators | Precīzs Vecums Gados, Mēnešos, Dienās',
            meta_description: 'Aprēķiniet precīzu vecumu gados, mēnešos un dienās no dzimšanas datuma, plus dienas līdz nākamajai dzimšanas dienai.',
            short_answer: 'Šis kalkulators atrod precīzu vecumu gados, mēnešos un dienās uz jebkuru datumu, plus atskaiti līdz nākamajai dzimšanas dienai.',
            intro_text: '<p>Ievadiet dzimšanas datumu, lai uzzinātu precīzu vecumu šodien (vai jebkurā citā datumā) — gados, mēnešos un dienās, plus kopējās nodzīvotās dienas un dienas līdz nākamajai dzimšanas dienai.</p>',
            key_points: [
                '<b>Metode:</b> standarta kalendāra gada/mēneša/dienas atņemšana starp dzimšanas datumu un atskaites datumu.',
                '<b>Kopā dienas:</b> tiek parādīts arī precīzs nodzīvoto dienu skaits, noderīgi atskaites punktu izsekošanai.',
                '<b>Nākamā dzimšanas diena:</b> atskaite automātiski pāriet uz nākamo gadu, kad šī gada dzimšanas diena ir pagājusi.',
            ],
            howto: [
                { question: 'Ko darīt, ja esmu dzimis 29. februārī (garā gada diena)?', answer: '<p>Kalkulators izmanto standarta kalendāra aritmētiku, pareizi apstrādājot gadadienu garajos un parastajos gados.</p>' },
                { question: 'Vai varu pārbaudīt vecumu uz nākotnes vai pagātnes datumu?', answer: '<p>Jā — mainiet "Atskaites Datums" lauku uz jebkuru datumu, lai redzētu vecumu tajā brīdī.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.lv, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.lv, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.lv }, { name: 'months', label: MONTHS_LABEL.lv }, { name: 'days', label: DAYS_LABEL.lv },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.lv },
                { name: 'days_to_next_birthday', label: 'Dienas līdz Nākamajai Dzimšanas Dienai' },
            ],
        },
        pl: {
            slug: 'kalkulator-wieku', title: 'Kalkulator Wieku', h1: 'Kalkulator Wieku',
            meta_title: 'Kalkulator Wieku | Dokładny Wiek w Latach, Miesiącach, Dniach',
            meta_description: 'Oblicz dokładny wiek w latach, miesiącach i dniach na podstawie daty urodzenia, plus dni do następnych urodzin.',
            short_answer: 'Ten kalkulator znajduje dokładny wiek w latach, miesiącach i dniach na dowolną datę, plus odliczanie do następnych urodzin.',
            intro_text: '<p>Wprowadź datę urodzenia, aby poznać dokładny wiek na dziś (lub inną datę) — w latach, miesiącach i dniach, plus łączną liczbę przeżytych dni i dni do następnych urodzin.</p>',
            key_points: [
                '<b>Metoda:</b> standardowe kalendarzowe odejmowanie rok/miesiąc/dzień między datą urodzenia a datą odniesienia.',
                '<b>Łącznie dni:</b> pokazywana jest też dokładna liczba przeżytych dni, przydatna do śledzenia kamieni milowych.',
                '<b>Następne urodziny:</b> odliczanie automatycznie przechodzi na następny rok, gdy tegoroczne urodziny minęły.',
            ],
            howto: [
                { question: 'Co jeśli urodziłem się 29 lutego (dzień przestępny)?', answer: '<p>Kalkulator używa standardowej arytmetyki kalendarzowej, poprawnie obsługując rocznicę w latach przestępnych i zwykłych.</p>' },
                { question: 'Czy mogę sprawdzić wiek na przyszłą lub przeszłą datę?', answer: '<p>Tak — zmień pole "Data Odniesienia" na dowolną datę, aby zobaczyć wiek w tamtym momencie.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.pl, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.pl, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.pl }, { name: 'months', label: MONTHS_LABEL.pl }, { name: 'days', label: DAYS_LABEL.pl },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.pl },
                { name: 'days_to_next_birthday', label: 'Dni do Następnych Urodzin' },
            ],
        },
        es: {
            slug: 'calculadora-de-edad', title: 'Calculadora de Edad', h1: 'Calculadora de Edad',
            meta_title: 'Calculadora de Edad | Edad Exacta en Años, Meses, Días',
            meta_description: 'Calcula tu edad exacta en años, meses y días a partir de tu fecha de nacimiento, más los días hasta tu próximo cumpleaños.',
            short_answer: 'Esta calculadora encuentra tu edad exacta en años, meses y días a fecha de hoy, más una cuenta regresiva hasta tu próximo cumpleaños.',
            intro_text: '<p>Introduce una fecha de nacimiento para conocer la edad exacta a día de hoy (o cualquier otra fecha de referencia) — desglosada en años, meses y días, más el total de días vividos y días restantes hasta el próximo cumpleaños.</p>',
            key_points: [
                '<b>Método:</b> una resta calendárica estándar de año/mes/día entre la fecha de nacimiento y la de referencia.',
                '<b>Días totales:</b> también se muestra el número exacto de días vividos, útil para seguir hitos.',
                '<b>Próximo cumpleaños:</b> la cuenta regresiva pasa automáticamente al año siguiente una vez que el cumpleaños de este año ha pasado.',
            ],
            howto: [
                { question: '¿Qué pasa si nací el 29 de febrero (día bisiesto)?', answer: '<p>La calculadora usa aritmética calendárica estándar, tratando correctamente el aniversario en años bisiestos y no bisiestos.</p>' },
                { question: '¿Puedo comprobar mi edad a fecha futura o pasada?', answer: '<p>Sí — cambia el campo "Fecha de Referencia" a cualquier fecha para ver tu edad en ese momento.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.es, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.es, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.es }, { name: 'months', label: MONTHS_LABEL.es }, { name: 'days', label: DAYS_LABEL.es },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.es },
                { name: 'days_to_next_birthday', label: 'Días hasta el Próximo Cumpleaños' },
            ],
        },
        fr: {
            slug: 'calculateur-dage', title: 'Calculateur d’Âge', h1: 'Calculateur d’Âge',
            meta_title: 'Calculateur d’Âge | Âge Exact en Années, Mois, Jours',
            meta_description: 'Calculez votre âge exact en années, mois et jours à partir de votre date de naissance, plus les jours jusqu’à votre prochain anniversaire.',
            short_answer: 'Ce calculateur trouve votre âge exact en années, mois et jours à ce jour, plus un compte à rebours jusqu’à votre prochain anniversaire.',
            intro_text: '<p>Entrez une date de naissance pour connaître l’âge exact à aujourd’hui (ou toute autre date de référence) — décomposé en années, mois et jours, plus le total de jours vécus et les jours restants jusqu’au prochain anniversaire.</p>',
            key_points: [
                '<b>Méthode :</b> une soustraction calendaire standard année/mois/jour entre la date de naissance et la date de référence.',
                '<b>Jours totaux :</b> le nombre exact de jours vécus est aussi affiché, utile pour suivre des jalons.',
                '<b>Prochain anniversaire :</b> le compte à rebours passe automatiquement à l’année suivante une fois l’anniversaire de cette année passé.',
            ],
            howto: [
                { question: 'Que se passe-t-il si je suis né le 29 février (jour bissextile) ?', answer: '<p>Le calculateur utilise une arithmétique calendaire standard, traitant correctement l’anniversaire les années bissextiles et non bissextiles.</p>' },
                { question: 'Puis-je vérifier mon âge à une date future ou passée ?', answer: '<p>Oui — changez le champ "Date de Référence" à n’importe quelle date pour voir votre âge à ce moment-là.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.fr, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.fr, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.fr }, { name: 'months', label: MONTHS_LABEL.fr }, { name: 'days', label: DAYS_LABEL.fr },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.fr },
                { name: 'days_to_next_birthday', label: 'Jours jusqu’au Prochain Anniversaire' },
            ],
        },
        it: {
            slug: 'calcolatore-di-eta', title: 'Calcolatore di Età', h1: 'Calcolatore di Età',
            meta_title: 'Calcolatore di Età | Età Esatta in Anni, Mesi, Giorni',
            meta_description: 'Calcola la tua età esatta in anni, mesi e giorni dalla data di nascita, più i giorni al prossimo compleanno.',
            short_answer: 'Questo calcolatore trova la tua età esatta in anni, mesi e giorni a oggi, più un conto alla rovescia al prossimo compleanno.',
            intro_text: '<p>Inserisci una data di nascita per conoscere l’età esatta a oggi (o a un’altra data di riferimento) — scomposta in anni, mesi e giorni, più il totale dei giorni vissuti e i giorni rimanenti al prossimo compleanno.</p>',
            key_points: [
                '<b>Metodo:</b> una sottrazione calendaristica standard anno/mese/giorno tra la data di nascita e quella di riferimento.',
                '<b>Giorni totali:</b> viene mostrato anche il numero esatto di giorni vissuti, utile per tracciare traguardi.',
                '<b>Prossimo compleanno:</b> il conto alla rovescia passa automaticamente all’anno successivo una volta passato il compleanno di quest’anno.',
            ],
            howto: [
                { question: 'Cosa succede se sono nato il 29 febbraio (giorno bisestile)?', answer: '<p>Il calcolatore usa l’aritmetica calendaristica standard, trattando correttamente l’anniversario negli anni bisestili e non.</p>' },
                { question: 'Posso controllare la mia età a una data futura o passata?', answer: '<p>Sì — cambia il campo "Data di Riferimento" con qualsiasi data per vedere la tua età in quel momento.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.it, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.it, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.it }, { name: 'months', label: MONTHS_LABEL.it }, { name: 'days', label: DAYS_LABEL.it },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.it },
                { name: 'days_to_next_birthday', label: 'Giorni al Prossimo Compleanno' },
            ],
        },
        de: {
            slug: 'alter-rechner', title: 'Altersrechner', h1: 'Altersrechner',
            meta_title: 'Altersrechner | Genaues Alter in Jahren, Monaten, Tagen',
            meta_description: 'Berechnen Sie Ihr genaues Alter in Jahren, Monaten und Tagen ab Ihrem Geburtsdatum, plus Tage bis zum nächsten Geburtstag.',
            short_answer: 'Dieser Rechner findet Ihr genaues Alter in Jahren, Monaten und Tagen zu einem beliebigen Datum, plus einen Countdown bis zum nächsten Geburtstag.',
            intro_text: '<p>Geben Sie ein Geburtsdatum ein, um das genaue Alter heute (oder an einem anderen Stichtag) zu erfahren — aufgeschlüsselt in Jahre, Monate und Tage, plus gesamte gelebte Tage und verbleibende Tage bis zum nächsten Geburtstag.</p>',
            key_points: [
                '<b>Methode:</b> eine standardmäßige kalendarische Jahr/Monat/Tag-Subtraktion zwischen Geburtsdatum und Stichtag.',
                '<b>Gesamttage:</b> die exakte Anzahl gelebter Tage wird ebenfalls angezeigt, nützlich zur Verfolgung von Meilensteinen.',
                '<b>Nächster Geburtstag:</b> der Countdown springt automatisch auf das nächste Jahr, sobald der diesjährige Geburtstag vorüber ist.',
            ],
            howto: [
                { question: 'Was, wenn ich am 29. Februar (Schalttag) geboren bin?', answer: '<p>Der Rechner verwendet standardmäßige Kalenderarithmetik und behandelt das Jubiläum in Schalt- und Nicht-Schaltjahren korrekt.</p>' },
                { question: 'Kann ich mein Alter zu einem zukünftigen oder vergangenen Datum prüfen?', answer: '<p>Ja — ändern Sie das Feld "Stichtag" auf ein beliebiges Datum, um Ihr Alter zu diesem Zeitpunkt zu sehen.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.de, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.de, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.de }, { name: 'months', label: MONTHS_LABEL.de }, { name: 'days', label: DAYS_LABEL.de },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.de },
                { name: 'days_to_next_birthday', label: 'Tage bis zum Nächsten Geburtstag' },
            ],
        },
    },
}

// ============================================================
// 1118: Age Checker
// ============================================================
const ageCheckerTool: ToolDef = {
    id: '1118',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'birth_date', default: '2005-01-01' }, { key: 'required_age', default: 18 }, { key: 'as_of_date', default: 'today' }],
        functions: { result: { type: 'function', functionName: 'ageChecker', params: { birth_date: 'birth_date', required_age: 'required_age', as_of_date: 'as_of_date' } } },
        outputs: [{ key: 'current_age' }, { key: 'is_eligible' }, { key: 'eligible_date' }],
    },
    locales: {
        en: {
            slug: 'age-checker', title: 'Age Checker', h1: 'Age Checker',
            meta_title: 'Age Checker | Verify Eligibility Against a Minimum Age',
            meta_description: 'Check whether someone meets a minimum required age (e.g. 18, 21, 65) as of any date.',
            short_answer: 'This calculator checks whether a birth date meets a minimum required age (e.g. 18) as of a given date, and shows exactly when eligibility begins.',
            intro_text: '<p>Enter a birth date and a required minimum age to instantly see whether the eligibility threshold has been met, plus the exact date it was (or will be) reached.</p>',
            key_points: [
                '<b>Common uses:</b> voting age (18), alcohol purchase age (varies by country, often 18 or 21), retirement eligibility (e.g. 65), or contest/promotion age gates.',
                '<b>Eligible date:</b> calculated as the birth date\'s anniversary in the year the required age is reached.',
                '<b>As of date:</b> defaults to today, but can be changed to check eligibility on a specific past or future date (e.g. an event date).',
            ],
            howto: [
                { question: 'How do I check if someone is old enough to vote?', answer: '<p>Enter their birth date, set required age to 18 (or your country\'s voting age), and check "as of" the election date.</p>' },
                { question: 'Does this account for different legal ages by country?', answer: '<p>No — enter whatever minimum age applies in your jurisdiction using the Required Age field.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.en, type: 'date' },
                { name: 'required_age', label: 'Required Minimum Age', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.en, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Current Age' },
                { name: 'is_eligible', label: 'Meets Required Age?' },
                { name: 'eligible_date', label: 'Date Requirement Is Met' },
            ],
        },
        ru: {
            slug: 'proverka-vozrasta', title: 'Проверка возраста', h1: 'Проверка возраста',
            meta_title: 'Проверка возраста | Соответствие минимальному возрасту',
            meta_description: 'Проверьте, соответствует ли кто-то минимальному требуемому возрасту (например, 18, 21, 65) на любую дату.',
            short_answer: 'Этот калькулятор проверяет, соответствует ли дата рождения минимальному требуемому возрасту (например, 18) на указанную дату.',
            intro_text: '<p>Введите дату рождения и минимальный требуемый возраст, чтобы мгновенно узнать, достигнут ли порог, и точную дату его достижения.</p>',
            key_points: [
                '<b>Частые случаи:</b> возраст голосования (18), возраст покупки алкоголя, возраст выхода на пенсию (например, 65).',
                '<b>Дата соответствия:</b> рассчитывается как годовщина даты рождения в году достижения требуемого возраста.',
                '<b>По состоянию на дату:</b> по умолчанию сегодня, но можно изменить для проверки на конкретную дату.',
            ],
            howto: [
                { question: 'Как проверить, достаточно ли лет для голосования?', answer: '<p>Введите дату рождения, установите требуемый возраст 18, проверьте на дату выборов.</p>' },
                { question: 'Учитывает ли это разный возраст в разных странах?', answer: '<p>Нет — введите минимальный возраст, применимый в вашей юрисдикции, в поле требуемого возраста.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.ru, type: 'date' },
                { name: 'required_age', label: 'Требуемый минимальный возраст', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.ru, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Текущий возраст' },
                { name: 'is_eligible', label: 'Соответствует требуемому возрасту?' },
                { name: 'eligible_date', label: 'Дата достижения требования' },
            ],
        },
        lv: {
            slug: 'vecuma-parbaude', title: 'Vecuma Pārbaude', h1: 'Vecuma Pārbaude',
            meta_title: 'Vecuma Pārbaude | Atbilstība Minimālajam Vecumam',
            meta_description: 'Pārbaudiet, vai kāds atbilst minimālajam nepieciešamajam vecumam (piemēram, 18, 21, 65) uz jebkuru datumu.',
            short_answer: 'Šis kalkulators pārbauda, vai dzimšanas datums atbilst minimālajam nepieciešamajam vecumam (piemēram, 18) uz norādīto datumu.',
            intro_text: '<p>Ievadiet dzimšanas datumu un minimālo nepieciešamo vecumu, lai uzreiz redzētu, vai slieksnis ir sasniegts, plus precīzu datumu, kad tas tika (vai tiks) sasniegts.</p>',
            key_points: [
                '<b>Biežāki lietojumi:</b> balsošanas vecums (18), alkohola iegādes vecums, pensijas vecums (piemēram, 65).',
                '<b>Atbilstības datums:</b> aprēķināts kā dzimšanas datuma gadadiena gadā, kad tiek sasniegts nepieciešamais vecums.',
                '<b>Atskaites datums:</b> pēc noklusējuma šodiena, bet var mainīt, lai pārbaudītu konkrētu datumu.',
            ],
            howto: [
                { question: 'Kā pārbaudīt, vai kāds ir pietiekami vecs, lai balsotu?', answer: '<p>Ievadiet dzimšanas datumu, iestatiet nepieciešamo vecumu 18, pārbaudiet vēlēšanu datumā.</p>' },
                { question: 'Vai tas ņem vērā dažādus juridiskos vecumus dažādās valstīs?', answer: '<p>Nē — ievadiet jūsu jurisdikcijā piemērojamo minimālo vecumu laukā Nepieciešamais Vecums.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.lv, type: 'date' },
                { name: 'required_age', label: 'Nepieciešamais Minimālais Vecums', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.lv, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Pašreizējais Vecums' },
                { name: 'is_eligible', label: 'Atbilst Nepieciešamajam Vecumam?' },
                { name: 'eligible_date', label: 'Datums, Kad Prasība Ir Izpildīta' },
            ],
        },
        pl: {
            slug: 'sprawdzanie-wieku', title: 'Sprawdzanie Wieku', h1: 'Sprawdzanie Wieku',
            meta_title: 'Sprawdzanie Wieku | Weryfikacja Minimalnego Wieku',
            meta_description: 'Sprawdź, czy ktoś spełnia minimalny wymagany wiek (np. 18, 21, 65) na dowolną datę.',
            short_answer: 'Ten kalkulator sprawdza, czy data urodzenia spełnia minimalny wymagany wiek (np. 18) na daną datę.',
            intro_text: '<p>Wprowadź datę urodzenia i minimalny wymagany wiek, aby natychmiast zobaczyć, czy próg został osiągnięty, oraz dokładną datę jego osiągnięcia.</p>',
            key_points: [
                '<b>Częste zastosowania:</b> wiek wyborczy (18), wiek zakupu alkoholu, wiek emerytalny (np. 65).',
                '<b>Data spełnienia:</b> obliczana jako rocznica daty urodzenia w roku osiągnięcia wymaganego wieku.',
                '<b>Data odniesienia:</b> domyślnie dziś, ale można zmienić, aby sprawdzić konkretną datę.',
            ],
            howto: [
                { question: 'Jak sprawdzić, czy ktoś jest wystarczająco dorosły, aby głosować?', answer: '<p>Wpisz datę urodzenia, ustaw wymagany wiek na 18, sprawdź na dzień wyborów.</p>' },
                { question: 'Czy to uwzględnia różny wiek prawny w różnych krajach?', answer: '<p>Nie — wpisz minimalny wiek obowiązujący w Twojej jurysdykcji w polu Wymagany Wiek.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.pl, type: 'date' },
                { name: 'required_age', label: 'Wymagany Minimalny Wiek', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.pl, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Obecny Wiek' },
                { name: 'is_eligible', label: 'Spełnia Wymagany Wiek?' },
                { name: 'eligible_date', label: 'Data Spełnienia Wymogu' },
            ],
        },
        es: {
            slug: 'verificador-de-edad', title: 'Verificador de Edad', h1: 'Verificador de Edad',
            meta_title: 'Verificador de Edad | Verifica la Elegibilidad por Edad Mínima',
            meta_description: 'Comprueba si alguien cumple una edad mínima requerida (p. ej. 18, 21, 65) a cualquier fecha.',
            short_answer: 'Esta calculadora comprueba si una fecha de nacimiento cumple una edad mínima requerida (p. ej. 18) a una fecha dada.',
            intro_text: '<p>Introduce una fecha de nacimiento y una edad mínima requerida para ver al instante si se ha cumplido el umbral, más la fecha exacta en que se alcanzó (o se alcanzará).</p>',
            key_points: [
                '<b>Usos comunes:</b> edad de voto (18), edad de compra de alcohol, edad de jubilación (p. ej. 65).',
                '<b>Fecha de elegibilidad:</b> calculada como el aniversario de la fecha de nacimiento en el año en que se alcanza la edad requerida.',
                '<b>Fecha de referencia:</b> por defecto hoy, pero se puede cambiar para comprobar una fecha específica.',
            ],
            howto: [
                { question: '¿Cómo compruebo si alguien tiene edad suficiente para votar?', answer: '<p>Introduce su fecha de nacimiento, establece la edad requerida en 18, comprueba a fecha de la elección.</p>' },
                { question: '¿Esto tiene en cuenta diferentes edades legales según el país?', answer: '<p>No — introduce la edad mínima que aplique en tu jurisdicción en el campo Edad Requerida.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.es, type: 'date' },
                { name: 'required_age', label: 'Edad Mínima Requerida', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.es, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Edad Actual' },
                { name: 'is_eligible', label: '¿Cumple la Edad Requerida?' },
                { name: 'eligible_date', label: 'Fecha en que se Cumple el Requisito' },
            ],
        },
        fr: {
            slug: 'verificateur-dage', title: 'Vérificateur d’Âge', h1: 'Vérificateur d’Âge',
            meta_title: 'Vérificateur d’Âge | Vérifiez l’Éligibilité par Âge Minimum',
            meta_description: 'Vérifiez si quelqu’un atteint un âge minimum requis (ex. 18, 21, 65) à n’importe quelle date.',
            short_answer: 'Ce calculateur vérifie si une date de naissance atteint un âge minimum requis (ex. 18) à une date donnée.',
            intro_text: '<p>Entrez une date de naissance et un âge minimum requis pour voir instantanément si le seuil est atteint, plus la date exacte à laquelle il a été (ou sera) atteint.</p>',
            key_points: [
                '<b>Usages courants :</b> âge de vote (18), âge d’achat d’alcool, âge de retraite (ex. 65).',
                '<b>Date d’éligibilité :</b> calculée comme l’anniversaire de la date de naissance l’année où l’âge requis est atteint.',
                '<b>Date de référence :</b> par défaut aujourd’hui, mais modifiable pour vérifier une date précise.',
            ],
            howto: [
                { question: 'Comment vérifier si quelqu’un a l’âge de voter ?', answer: '<p>Entrez sa date de naissance, réglez l’âge requis à 18, vérifiez à la date de l’élection.</p>' },
                { question: 'Cela tient-il compte des différents âges légaux selon les pays ?', answer: '<p>Non — entrez l’âge minimum applicable dans votre juridiction dans le champ Âge Requis.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.fr, type: 'date' },
                { name: 'required_age', label: 'Âge Minimum Requis', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.fr, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Âge Actuel' },
                { name: 'is_eligible', label: 'Atteint l’Âge Requis ?' },
                { name: 'eligible_date', label: 'Date où l’Exigence est Atteinte' },
            ],
        },
        it: {
            slug: 'verificatore-di-eta', title: 'Verificatore di Età', h1: 'Verificatore di Età',
            meta_title: 'Verificatore di Età | Verifica l’Idoneità per Età Minima',
            meta_description: 'Verifica se qualcuno soddisfa un’età minima richiesta (es. 18, 21, 65) a qualsiasi data.',
            short_answer: 'Questo calcolatore verifica se una data di nascita soddisfa un’età minima richiesta (es. 18) a una data specifica.',
            intro_text: '<p>Inserisci una data di nascita e un’età minima richiesta per vedere subito se la soglia è stata raggiunta, più la data esatta in cui è stata (o sarà) raggiunta.</p>',
            key_points: [
                '<b>Usi comuni:</b> età di voto (18), età di acquisto alcolici, età pensionabile (es. 65).',
                '<b>Data di idoneità:</b> calcolata come l’anniversario della data di nascita nell’anno in cui si raggiunge l’età richiesta.',
                '<b>Data di riferimento:</b> di default oggi, ma modificabile per verificare una data specifica.',
            ],
            howto: [
                { question: 'Come verifico se qualcuno ha l’età per votare?', answer: '<p>Inserisci la sua data di nascita, imposta l’età richiesta a 18, verifica alla data delle elezioni.</p>' },
                { question: 'Questo tiene conto delle diverse età legali per paese?', answer: '<p>No — inserisci l’età minima applicabile nella tua giurisdizione nel campo Età Richiesta.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.it, type: 'date' },
                { name: 'required_age', label: 'Età Minima Richiesta', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.it, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Età Attuale' },
                { name: 'is_eligible', label: 'Soddisfa l’Età Richiesta?' },
                { name: 'eligible_date', label: 'Data in cui il Requisito è Soddisfatto' },
            ],
        },
        de: {
            slug: 'altersnachweis-rechner', title: 'Altersnachweis-Rechner', h1: 'Altersnachweis-Rechner',
            meta_title: 'Altersnachweis-Rechner | Berechtigung nach Mindestalter Prüfen',
            meta_description: 'Prüfen Sie, ob jemand ein Mindestalter (z.B. 18, 21, 65) zu einem beliebigen Datum erfüllt.',
            short_answer: 'Dieser Rechner prüft, ob ein Geburtsdatum ein Mindestalter (z.B. 18) zu einem bestimmten Datum erfüllt.',
            intro_text: '<p>Geben Sie ein Geburtsdatum und ein erforderliches Mindestalter ein, um sofort zu sehen, ob die Schwelle erreicht wurde, plus das genaue Datum, an dem sie erreicht wurde (oder wird).</p>',
            key_points: [
                '<b>Häufige Anwendungen:</b> Wahlalter (18), Alkoholkaufalter, Renteneintrittsalter (z.B. 65).',
                '<b>Berechtigungsdatum:</b> berechnet als Jubiläum des Geburtsdatums im Jahr, in dem das erforderliche Alter erreicht wird.',
                '<b>Stichtag:</b> standardmäßig heute, aber änderbar, um ein bestimmtes Datum zu prüfen.',
            ],
            howto: [
                { question: 'Wie prüfe ich, ob jemand alt genug zum Wählen ist?', answer: '<p>Geben Sie das Geburtsdatum ein, setzen Sie das erforderliche Alter auf 18, prüfen Sie zum Wahltermin.</p>' },
                { question: 'Berücksichtigt dies unterschiedliche gesetzliche Altersgrenzen je nach Land?', answer: '<p>Nein — geben Sie das in Ihrer Rechtsordnung geltende Mindestalter im Feld Erforderliches Alter ein.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.de, type: 'date' },
                { name: 'required_age', label: 'Erforderliches Mindestalter', type: 'number', min: 0, max: 130, placeholder: '18' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.de, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'current_age', label: 'Aktuelles Alter' },
                { name: 'is_eligible', label: 'Erfüllt Erforderliches Alter?' },
                { name: 'eligible_date', label: 'Datum der Erfüllung' },
            ],
        },
    },
}

// ============================================================
// 1119: How Old Am I? (same underlying function as Age Calculator,
// framed as a first-person quick-answer page)
// ============================================================
const howOldAmITool: ToolDef = {
    id: '1119',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'birth_date', default: '1990-01-01' }, { key: 'as_of_date', default: 'today' }],
        functions: { result: { type: 'function', functionName: 'ageCalculator', params: { birth_date: 'birth_date', as_of_date: 'as_of_date' } } },
        outputs: [{ key: 'years' }, { key: 'months' }, { key: 'days' }, { key: 'total_days' }, { key: 'days_to_next_birthday' }],
    },
    locales: {
        en: {
            slug: 'how-old-am-i', title: 'How Old Am I?', h1: 'How Old Am I?',
            meta_title: 'How Old Am I? | Find Your Exact Age Right Now',
            meta_description: 'Enter your birth date to instantly find out exactly how old you are today, in years, months, and days.',
            short_answer: 'Enter your birth date below and this tool tells you exactly how old you are today, in years, months, and days.',
            intro_text: '<p>A quick answer to the question everyone asks at some point — enter your birth date and see your exact current age, broken down precisely.</p>',
            key_points: [
                '<b>Precision:</b> your age is shown down to the day, not just the year — e.g. "34 years, 2 months, 15 days".',
                '<b>Total days lived:</b> also shown, a fun number for milestone tracking (10,000 days, 20,000 days, etc.).',
                '<b>Next birthday:</b> the tool also counts down the days remaining until your next birthday.',
            ],
            howto: [
                { question: 'Why is my age different from what I expected?', answer: '<p>Age is calculated precisely to the day using your exact birth date, not rounded — check that the birth date entered is correct.</p>' },
                { question: 'Can I find out how old I was on a specific past date?', answer: '<p>Yes — change the "As of Date" field to any date in the past to see your age at that time.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.en, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.en, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.en }, { name: 'months', label: MONTHS_LABEL.en }, { name: 'days', label: DAYS_LABEL.en },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.en },
                { name: 'days_to_next_birthday', label: 'Days to Next Birthday' },
            ],
        },
        ru: {
            slug: 'skolko-mne-let', title: 'Сколько мне лет?', h1: 'Сколько мне лет?',
            meta_title: 'Сколько мне лет? | Точный возраст прямо сейчас',
            meta_description: 'Введите дату рождения, чтобы мгновенно узнать, сколько вам лет сегодня, в годах, месяцах и днях.',
            short_answer: 'Введите дату рождения ниже, и этот инструмент точно скажет, сколько вам лет сегодня, в годах, месяцах и днях.',
            intro_text: '<p>Быстрый ответ на вопрос, который рано или поздно задаёт каждый — введите дату рождения и узнайте точный текущий возраст.</p>',
            key_points: [
                '<b>Точность:</b> ваш возраст показан с точностью до дня, а не только года.',
                '<b>Всего прожитых дней:</b> также показывается, забавное число для отслеживания вех.',
                '<b>Следующий день рождения:</b> инструмент также считает дни до следующего дня рождения.',
            ],
            howto: [
                { question: 'Почему мой возраст отличается от ожидаемого?', answer: '<p>Возраст рассчитывается точно до дня по вашей точной дате рождения — проверьте правильность введённой даты.</p>' },
                { question: 'Могу ли я узнать, сколько мне было лет на конкретную прошлую дату?', answer: '<p>Да — измените поле "По состоянию на дату" на любую прошлую дату.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.ru, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.ru, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.ru }, { name: 'months', label: MONTHS_LABEL.ru }, { name: 'days', label: DAYS_LABEL.ru },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.ru },
                { name: 'days_to_next_birthday', label: 'Дней до следующего дня рождения' },
            ],
        },
        lv: {
            slug: 'cik-man-gadu', title: 'Cik Man Gadu?', h1: 'Cik Man Gadu?',
            meta_title: 'Cik Man Gadu? | Precīzs Vecums Tieši Tagad',
            meta_description: 'Ievadiet dzimšanas datumu, lai uzreiz uzzinātu, cik jums gadu šodien, gados, mēnešos un dienās.',
            short_answer: 'Ievadiet dzimšanas datumu zemāk, un šis rīks precīzi pateiks, cik jums gadu šodien, gados, mēnešos un dienās.',
            intro_text: '<p>Ātra atbilde uz jautājumu, ko agri vai vēlu uzdod ikviens — ievadiet dzimšanas datumu un uzziniet precīzu pašreizējo vecumu.</p>',
            key_points: [
                '<b>Precizitāte:</b> jūsu vecums tiek parādīts precīzi līdz dienai, ne tikai gadam.',
                '<b>Kopā nodzīvotās dienas:</b> arī tiek parādītas, jautrs skaitlis atskaites punktu izsekošanai.',
                '<b>Nākamā dzimšanas diena:</b> rīks arī skaita dienas līdz nākamajai dzimšanas dienai.',
            ],
            howto: [
                { question: 'Kāpēc mans vecums atšķiras no gaidītā?', answer: '<p>Vecums tiek aprēķināts precīzi līdz dienai, izmantojot jūsu precīzo dzimšanas datumu — pārbaudiet, vai datums ievadīts pareizi.</p>' },
                { question: 'Vai varu uzzināt, cik man bija gadu konkrētā pagātnes datumā?', answer: '<p>Jā — mainiet "Atskaites Datums" lauku uz jebkuru pagātnes datumu.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.lv, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.lv, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.lv }, { name: 'months', label: MONTHS_LABEL.lv }, { name: 'days', label: DAYS_LABEL.lv },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.lv },
                { name: 'days_to_next_birthday', label: 'Dienas līdz Nākamajai Dzimšanas Dienai' },
            ],
        },
        pl: {
            slug: 'ile-mam-lat', title: 'Ile Mam Lat?', h1: 'Ile Mam Lat?',
            meta_title: 'Ile Mam Lat? | Dokładny Wiek Właśnie Teraz',
            meta_description: 'Wpisz datę urodzenia, aby natychmiast dowiedzieć się, ile masz dziś lat, w latach, miesiącach i dniach.',
            short_answer: 'Wpisz poniżej datę urodzenia, a to narzędzie dokładnie powie, ile masz dziś lat, w latach, miesiącach i dniach.',
            intro_text: '<p>Szybka odpowiedź na pytanie, które prędzej czy później zadaje każdy — wpisz datę urodzenia i zobacz dokładny obecny wiek.</p>',
            key_points: [
                '<b>Precyzja:</b> Twój wiek jest pokazany dokładnie co do dnia, nie tylko roku.',
                '<b>Łączna liczba przeżytych dni:</b> również pokazywana, ciekawa liczba do śledzenia kamieni milowych.',
                '<b>Następne urodziny:</b> narzędzie liczy też dni pozostałe do następnych urodzin.',
            ],
            howto: [
                { question: 'Dlaczego mój wiek różni się od oczekiwanego?', answer: '<p>Wiek jest obliczany dokładnie co do dnia na podstawie dokładnej daty urodzenia — sprawdź, czy wpisana data jest poprawna.</p>' },
                { question: 'Czy mogę dowiedzieć się, ile miałem lat w konkretnej przeszłej dacie?', answer: '<p>Tak — zmień pole "Data Odniesienia" na dowolną przeszłą datę.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.pl, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.pl, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.pl }, { name: 'months', label: MONTHS_LABEL.pl }, { name: 'days', label: DAYS_LABEL.pl },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.pl },
                { name: 'days_to_next_birthday', label: 'Dni do Następnych Urodzin' },
            ],
        },
        es: {
            slug: 'cuantos-anos-tengo', title: '¿Cuántos Años Tengo?', h1: '¿Cuántos Años Tengo?',
            meta_title: '¿Cuántos Años Tengo? | Tu Edad Exacta Ahora Mismo',
            meta_description: 'Introduce tu fecha de nacimiento para descubrir al instante exactamente cuántos años tienes hoy, en años, meses y días.',
            short_answer: 'Introduce tu fecha de nacimiento abajo y esta herramienta te dirá exactamente cuántos años tienes hoy, en años, meses y días.',
            intro_text: '<p>Una respuesta rápida a la pregunta que todos se hacen tarde o temprano — introduce tu fecha de nacimiento y ve tu edad actual exacta.</p>',
            key_points: [
                '<b>Precisión:</b> tu edad se muestra con precisión de días, no solo años.',
                '<b>Días totales vividos:</b> también se muestra, un número divertido para seguir hitos.',
                '<b>Próximo cumpleaños:</b> la herramienta también cuenta los días restantes hasta tu próximo cumpleaños.',
            ],
            howto: [
                { question: '¿Por qué mi edad es diferente de lo esperado?', answer: '<p>La edad se calcula con precisión de días usando tu fecha de nacimiento exacta — comprueba que la fecha introducida sea correcta.</p>' },
                { question: '¿Puedo saber cuántos años tenía en una fecha pasada específica?', answer: '<p>Sí — cambia el campo "Fecha de Referencia" a cualquier fecha pasada.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.es, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.es, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.es }, { name: 'months', label: MONTHS_LABEL.es }, { name: 'days', label: DAYS_LABEL.es },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.es },
                { name: 'days_to_next_birthday', label: 'Días hasta el Próximo Cumpleaños' },
            ],
        },
        fr: {
            slug: 'quel-age-ai-je', title: 'Quel Âge Ai-je ?', h1: 'Quel Âge Ai-je ?',
            meta_title: 'Quel Âge Ai-je ? | Votre Âge Exact Maintenant',
            meta_description: 'Entrez votre date de naissance pour découvrir instantanément exactement quel âge vous avez aujourd’hui, en années, mois et jours.',
            short_answer: 'Entrez votre date de naissance ci-dessous et cet outil vous dira exactement quel âge vous avez aujourd’hui, en années, mois et jours.',
            intro_text: '<p>Une réponse rapide à la question que tout le monde se pose tôt ou tard — entrez votre date de naissance et voyez votre âge actuel exact.</p>',
            key_points: [
                '<b>Précision :</b> votre âge est affiché au jour près, pas seulement à l’année.',
                '<b>Jours totaux vécus :</b> aussi affiché, un chiffre amusant pour suivre des jalons.',
                '<b>Prochain anniversaire :</b> l’outil compte aussi les jours restants jusqu’à votre prochain anniversaire.',
            ],
            howto: [
                { question: 'Pourquoi mon âge est-il différent de ce que j’attendais ?', answer: '<p>L’âge est calculé précisément au jour près à partir de votre date de naissance exacte — vérifiez que la date entrée est correcte.</p>' },
                { question: 'Puis-je savoir quel âge j’avais à une date passée précise ?', answer: '<p>Oui — changez le champ "Date de Référence" à n’importe quelle date passée.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.fr, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.fr, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.fr }, { name: 'months', label: MONTHS_LABEL.fr }, { name: 'days', label: DAYS_LABEL.fr },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.fr },
                { name: 'days_to_next_birthday', label: 'Jours jusqu’au Prochain Anniversaire' },
            ],
        },
        it: {
            slug: 'quanti-anni-ho', title: 'Quanti Anni Ho?', h1: 'Quanti Anni Ho?',
            meta_title: 'Quanti Anni Ho? | La Tua Età Esatta Adesso',
            meta_description: 'Inserisci la tua data di nascita per scoprire subito esattamente quanti anni hai oggi, in anni, mesi e giorni.',
            short_answer: 'Inserisci la tua data di nascita qui sotto e questo strumento ti dirà esattamente quanti anni hai oggi, in anni, mesi e giorni.',
            intro_text: '<p>Una risposta rapida alla domanda che tutti si fanno prima o poi — inserisci la data di nascita e vedi la tua età attuale esatta.</p>',
            key_points: [
                '<b>Precisione:</b> la tua età è mostrata con precisione al giorno, non solo all’anno.',
                '<b>Giorni totali vissuti:</b> mostrato anche, un numero divertente per tracciare traguardi.',
                '<b>Prossimo compleanno:</b> lo strumento conta anche i giorni rimanenti fino al tuo prossimo compleanno.',
            ],
            howto: [
                { question: 'Perché la mia età è diversa da quella attesa?', answer: '<p>L’età è calcolata con precisione al giorno usando la tua data di nascita esatta — verifica che la data inserita sia corretta.</p>' },
                { question: 'Posso scoprire quanti anni avevo in una data passata specifica?', answer: '<p>Sì — cambia il campo "Data di Riferimento" con qualsiasi data passata.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.it, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.it, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.it }, { name: 'months', label: MONTHS_LABEL.it }, { name: 'days', label: DAYS_LABEL.it },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.it },
                { name: 'days_to_next_birthday', label: 'Giorni al Prossimo Compleanno' },
            ],
        },
        de: {
            slug: 'wie-alt-bin-ich', title: 'Wie Alt Bin Ich?', h1: 'Wie Alt Bin Ich?',
            meta_title: 'Wie Alt Bin Ich? | Ihr Genaues Alter Jetzt',
            meta_description: 'Geben Sie Ihr Geburtsdatum ein, um sofort herauszufinden, wie alt Sie heute genau sind, in Jahren, Monaten und Tagen.',
            short_answer: 'Geben Sie unten Ihr Geburtsdatum ein, und dieses Tool sagt Ihnen genau, wie alt Sie heute sind, in Jahren, Monaten und Tagen.',
            intro_text: '<p>Eine schnelle Antwort auf die Frage, die sich früher oder später jeder stellt — geben Sie Ihr Geburtsdatum ein und sehen Sie Ihr genaues aktuelles Alter.</p>',
            key_points: [
                '<b>Präzision:</b> Ihr Alter wird tagesgenau angezeigt, nicht nur jahresgenau.',
                '<b>Gesamte gelebte Tage:</b> ebenfalls angezeigt, eine interessante Zahl zur Verfolgung von Meilensteinen.',
                '<b>Nächster Geburtstag:</b> das Tool zählt auch die verbleibenden Tage bis zu Ihrem nächsten Geburtstag.',
            ],
            howto: [
                { question: 'Warum ist mein Alter anders als erwartet?', answer: '<p>Das Alter wird tagesgenau anhand Ihres exakten Geburtsdatums berechnet — prüfen Sie, ob das eingegebene Datum korrekt ist.</p>' },
                { question: 'Kann ich herausfinden, wie alt ich an einem bestimmten vergangenen Datum war?', answer: '<p>Ja — ändern Sie das Feld "Stichtag" auf ein beliebiges vergangenes Datum.</p>' },
            ],
            inputs: [
                { name: 'birth_date', label: BIRTH_DATE_LABEL.de, type: 'date' },
                { name: 'as_of_date', label: AS_OF_DATE_LABEL.de, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.de }, { name: 'months', label: MONTHS_LABEL.de }, { name: 'days', label: DAYS_LABEL.de },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.de },
                { name: 'days_to_next_birthday', label: 'Tage bis zum Nächsten Geburtstag' },
            ],
        },
    },
}

// ============================================================
// 1120: Countdown Timer | Event Countdown Clock (bespoke live-ticking widget)
// Rendered by CountdownTimerWidget.tsx, special-cased by tool_id in
// CalculatorWidget.tsx. config_json is a minimal placeholder since the
// generic engine is bypassed - only ToolI18n content drives the page shell.
// ============================================================
const countdownTimerTool: ToolDef = {
    id: '1120',
    type: 'calculator',
    config_json: { inputs: [], functions: {}, outputs: [] },
    locales: {
        en: {
            slug: 'countdown-timer', title: 'Countdown Timer | Event Countdown Clock', h1: 'Countdown Timer',
            meta_title: 'Countdown Timer | Live Event Countdown Clock',
            meta_description: 'Set a target date and time and watch a live countdown to your event, in days, hours, minutes, and seconds.',
            short_answer: 'This tool counts down live to any date and time you set, showing days, hours, minutes, and seconds remaining.',
            intro_text: '<p>Set a target date, hour, and minute (and optionally name your event) to see a live, second-by-second countdown — perfect for launches, deadlines, weddings, or any date you\'re counting down to.</p>',
            key_points: [
                '<b>Live updating:</b> the countdown refreshes every second in your browser, no need to reload the page.',
                '<b>Past events:</b> if the target date has already passed, the tool shows a "this event has passed" message instead of negative numbers.',
                '<b>Custom event name:</b> optionally label your countdown so it\'s clear at a glance what you\'re counting down to.',
            ],
            howto: [
                { question: 'Does the countdown keep running if I leave the page open?', answer: '<p>Yes — it updates live every second for as long as the page stays open in your browser.</p>' },
                { question: 'Can I count down to a time today, not just a future date?', answer: '<p>Yes — set today\'s date and any hour/minute later than the current time.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        ru: {
            slug: 'tajmer-obratnogo-otscheta', title: 'Таймер обратного отсчёта | Часы обратного отсчёта события', h1: 'Таймер обратного отсчёта',
            meta_title: 'Таймер обратного отсчёта | Живые часы отсчёта до события',
            meta_description: 'Установите целевую дату и время и наблюдайте живой обратный отсчёт до вашего события, в днях, часах, минутах и секундах.',
            short_answer: 'Этот инструмент ведёт живой обратный отсчёт до любой установленной даты и времени, показывая оставшиеся дни, часы, минуты и секунды.',
            intro_text: '<p>Установите целевую дату, час и минуту (и, при желании, назовите событие), чтобы увидеть живой, посекундный обратный отсчёт.</p>',
            key_points: [
                '<b>Живое обновление:</b> отсчёт обновляется каждую секунду в браузере, без перезагрузки страницы.',
                '<b>Прошедшие события:</b> если целевая дата уже прошла, инструмент показывает сообщение "это событие уже прошло".',
                '<b>Название события:</b> можно подписать отсчёт, чтобы было ясно, до чего он ведётся.',
            ],
            howto: [
                { question: 'Продолжает ли отсчёт работать, если оставить страницу открытой?', answer: '<p>Да — он обновляется каждую секунду, пока страница открыта в браузере.</p>' },
                { question: 'Могу ли я отсчитывать время сегодня, а не только будущую дату?', answer: '<p>Да — установите сегодняшнюю дату и любой час/минуту позже текущего времени.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        lv: {
            slug: 'atskaites-taimeris', title: 'Atskaites Taimeris | Notikuma Atskaites Pulkstenis', h1: 'Atskaites Taimeris',
            meta_title: 'Atskaites Taimeris | Dzīvā Notikuma Atskaite',
            meta_description: 'Iestatiet mērķa datumu un laiku un vērojiet dzīvu atskaiti līdz jūsu notikumam dienās, stundās, minūtēs un sekundēs.',
            short_answer: 'Šis rīks veic dzīvu atskaiti līdz jebkuram iestatītajam datumam un laikam, parādot atlikušās dienas, stundas, minūtes un sekundes.',
            intro_text: '<p>Iestatiet mērķa datumu, stundu un minūti (un, ja vēlaties, nosauciet notikumu), lai redzētu dzīvu, sekunžu precizitātes atskaiti.</p>',
            key_points: [
                '<b>Dzīva atjaunināšana:</b> atskaite tiek atjaunināta katru sekundi pārlūkprogrammā, nav nepieciešams pārlādēt lapu.',
                '<b>Pagājuši notikumi:</b> ja mērķa datums jau pagājis, rīks parāda ziņojumu "šis notikums jau ir pagājis".',
                '<b>Pielāgots notikuma nosaukums:</b> varat nosaukt savu atskaiti, lai būtu skaidrs, uz ko tā attiecas.',
            ],
            howto: [
                { question: 'Vai atskaite turpina darboties, ja atstāju lapu atvērtu?', answer: '<p>Jā — tā atjauninās katru sekundi, kamēr lapa ir atvērta pārlūkprogrammā.</p>' },
                { question: 'Vai varu skaitīt laiku līdz šodienai, ne tikai nākotnes datumam?', answer: '<p>Jā — iestatiet šodienas datumu un jebkuru stundu/minūti vēlāk par pašreizējo laiku.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        pl: {
            slug: 'minutnik-odliczajacy', title: 'Minutnik Odliczający | Zegar Odliczania do Wydarzenia', h1: 'Minutnik Odliczający',
            meta_title: 'Minutnik Odliczający | Zegar Odliczania na Żywo',
            meta_description: 'Ustaw docelową datę i godzinę i obserwuj odliczanie na żywo do wydarzenia, w dniach, godzinach, minutach i sekundach.',
            short_answer: 'To narzędzie odlicza na żywo do dowolnej ustawionej daty i godziny, pokazując pozostałe dni, godziny, minuty i sekundy.',
            intro_text: '<p>Ustaw docelową datę, godzinę i minutę (opcjonalnie nazwij wydarzenie), aby zobaczyć odliczanie na żywo co do sekundy.</p>',
            key_points: [
                '<b>Aktualizacja na żywo:</b> odliczanie odświeża się co sekundę w przeglądarce, bez potrzeby przeładowania strony.',
                '<b>Minione wydarzenia:</b> jeśli docelowa data już minęła, narzędzie pokazuje komunikat "to wydarzenie już minęło".',
                '<b>Nazwa wydarzenia:</b> możesz opisać swoje odliczanie, aby było jasne, do czego się odnosi.',
            ],
            howto: [
                { question: 'Czy odliczanie działa nadal, jeśli zostawię stronę otwartą?', answer: '<p>Tak — aktualizuje się co sekundę, dopóki strona jest otwarta w przeglądarce.</p>' },
                { question: 'Czy mogę odliczać do godziny dzisiaj, nie tylko do przyszłej daty?', answer: '<p>Tak — ustaw dzisiejszą datę i dowolną godzinę/minutę późniejszą niż obecny czas.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        es: {
            slug: 'temporizador-de-cuenta-regresiva', title: 'Temporizador de Cuenta Regresiva | Reloj de Cuenta Regresiva de Evento', h1: 'Temporizador de Cuenta Regresiva',
            meta_title: 'Temporizador de Cuenta Regresiva | Reloj en Vivo',
            meta_description: 'Establece una fecha y hora objetivo y observa una cuenta regresiva en vivo hasta tu evento, en días, horas, minutos y segundos.',
            short_answer: 'Esta herramienta cuenta regresivamente en vivo hasta cualquier fecha y hora que establezcas, mostrando días, horas, minutos y segundos restantes.',
            intro_text: '<p>Establece una fecha, hora y minuto objetivo (y opcionalmente nombra tu evento) para ver una cuenta regresiva en vivo, segundo a segundo.</p>',
            key_points: [
                '<b>Actualización en vivo:</b> la cuenta regresiva se actualiza cada segundo en tu navegador, sin recargar la página.',
                '<b>Eventos pasados:</b> si la fecha objetivo ya pasó, la herramienta muestra un mensaje de "este evento ya ha pasado".',
                '<b>Nombre de evento personalizado:</b> opcionalmente etiqueta tu cuenta regresiva para saber de un vistazo qué estás contando.',
            ],
            howto: [
                { question: '¿La cuenta regresiva sigue funcionando si dejo la página abierta?', answer: '<p>Sí — se actualiza en vivo cada segundo mientras la página permanezca abierta en tu navegador.</p>' },
                { question: '¿Puedo contar regresivamente hasta una hora de hoy, no solo una fecha futura?', answer: '<p>Sí — establece la fecha de hoy y cualquier hora/minuto posterior a la hora actual.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        fr: {
            slug: 'compte-a-rebours', title: 'Compte à Rebours | Horloge de Compte à Rebours d’Événement', h1: 'Compte à Rebours',
            meta_title: 'Compte à Rebours | Horloge en Direct',
            meta_description: 'Définissez une date et une heure cibles et observez un compte à rebours en direct jusqu’à votre événement, en jours, heures, minutes et secondes.',
            short_answer: 'Cet outil décompte en direct jusqu’à toute date et heure que vous définissez, affichant jours, heures, minutes et secondes restants.',
            intro_text: '<p>Définissez une date, une heure et une minute cibles (et nommez éventuellement votre événement) pour voir un compte à rebours en direct, seconde par seconde.</p>',
            key_points: [
                '<b>Mise à jour en direct :</b> le compte à rebours se rafraîchit chaque seconde dans votre navigateur, sans recharger la page.',
                '<b>Événements passés :</b> si la date cible est déjà passée, l’outil affiche un message "cet événement est déjà passé".',
                '<b>Nom d’événement personnalisé :</b> nommez éventuellement votre compte à rebours pour savoir d’un coup d’œil ce que vous attendez.',
            ],
            howto: [
                { question: 'Le compte à rebours continue-t-il si je laisse la page ouverte ?', answer: '<p>Oui — il se met à jour en direct chaque seconde tant que la page reste ouverte dans votre navigateur.</p>' },
                { question: 'Puis-je décompter jusqu’à une heure aujourd’hui, pas seulement une date future ?', answer: '<p>Oui — réglez la date d’aujourd’hui et une heure/minute postérieure à l’heure actuelle.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        it: {
            slug: 'timer-conto-alla-rovescia', title: 'Timer Conto alla Rovescia | Orologio Conto alla Rovescia Evento', h1: 'Timer Conto alla Rovescia',
            meta_title: 'Timer Conto alla Rovescia | Orologio in Diretta',
            meta_description: 'Imposta una data e un’ora obiettivo e guarda un conto alla rovescia in diretta fino al tuo evento, in giorni, ore, minuti e secondi.',
            short_answer: 'Questo strumento conta alla rovescia in diretta fino a qualsiasi data e ora tu imposti, mostrando giorni, ore, minuti e secondi rimanenti.',
            intro_text: '<p>Imposta una data, ora e minuto obiettivo (e opzionalmente nomina il tuo evento) per vedere un conto alla rovescia in diretta, secondo per secondo.</p>',
            key_points: [
                '<b>Aggiornamento in diretta:</b> il conto alla rovescia si aggiorna ogni secondo nel tuo browser, senza ricaricare la pagina.',
                '<b>Eventi passati:</b> se la data obiettivo è già passata, lo strumento mostra un messaggio "questo evento è già passato".',
                '<b>Nome evento personalizzato:</b> opzionalmente etichetta il tuo conto alla rovescia per sapere a colpo d’occhio cosa stai contando.',
            ],
            howto: [
                { question: 'Il conto alla rovescia continua se lascio la pagina aperta?', answer: '<p>Sì — si aggiorna in diretta ogni secondo finché la pagina resta aperta nel tuo browser.</p>' },
                { question: 'Posso contare alla rovescia fino a un’ora di oggi, non solo una data futura?', answer: '<p>Sì — imposta la data di oggi e qualsiasi ora/minuto successivo all’ora attuale.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        de: {
            slug: 'countdown-timer', title: 'Countdown-Timer | Ereignis-Countdown-Uhr', h1: 'Countdown-Timer',
            meta_title: 'Countdown-Timer | Live-Countdown-Uhr',
            meta_description: 'Legen Sie ein Zieldatum und eine Zielzeit fest und verfolgen Sie einen Live-Countdown zu Ihrem Ereignis, in Tagen, Stunden, Minuten und Sekunden.',
            short_answer: 'Dieses Tool zählt live bis zu jedem von Ihnen festgelegten Datum und jeder Uhrzeit herunter und zeigt verbleibende Tage, Stunden, Minuten und Sekunden.',
            intro_text: '<p>Legen Sie ein Zieldatum, eine Stunde und eine Minute fest (und benennen Sie optional Ihr Ereignis), um einen Live-Countdown Sekunde für Sekunde zu sehen.</p>',
            key_points: [
                '<b>Live-Aktualisierung:</b> der Countdown aktualisiert sich jede Sekunde in Ihrem Browser, ohne die Seite neu zu laden.',
                '<b>Vergangene Ereignisse:</b> ist das Zieldatum bereits vergangen, zeigt das Tool die Meldung "dieses Ereignis liegt bereits in der Vergangenheit".',
                '<b>Benutzerdefinierter Ereignisname:</b> beschriften Sie Ihren Countdown optional, damit auf einen Blick klar ist, worauf er sich bezieht.',
            ],
            howto: [
                { question: 'Läuft der Countdown weiter, wenn ich die Seite geöffnet lasse?', answer: '<p>Ja — er aktualisiert sich live jede Sekunde, solange die Seite in Ihrem Browser geöffnet bleibt.</p>' },
                { question: 'Kann ich bis zu einer Uhrzeit heute herunterzählen, nicht nur zu einem zukünftigen Datum?', answer: '<p>Ja — stellen Sie das heutige Datum und eine Stunde/Minute nach der aktuellen Zeit ein.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
    },
}

// ============================================================
// 1121: Date ± Calendar Units Calculator
// ============================================================
const dateAddSubtractTool: ToolDef = {
    id: '1121',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'base_date', default: 'today' }, { key: 'amount', default: 30 }, { key: 'unit', default: 'days' }, { key: 'operation', default: 'add' }],
        functions: { result: { type: 'function', functionName: 'dateAddSubtract', params: { base_date: 'base_date', amount: 'amount', unit: 'unit', operation: 'operation' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'date-plus-minus-calendar-units-calculator', title: 'Date ± Calendar Units Calculator', h1: 'Date ± Calendar Units Calculator',
            meta_title: 'Date ± Calendar Units Calculator | Add or Subtract Days, Weeks, Months, Years',
            meta_description: 'Add or subtract days, weeks, months, or years from any date and get the resulting date instantly.',
            short_answer: 'This calculator adds or subtracts a chosen number of days, weeks, months, or years to/from a base date.',
            intro_text: '<p>Enter a starting date, an amount, and a unit (days, weeks, months, or years), then choose add or subtract to find the resulting date — useful for deadlines, due dates, or planning ahead.</p>',
            key_points: [
                '<b>Months and years:</b> added using calendar-month arithmetic (e.g. Jan 31 + 1 month rolls to the last valid day of February).',
                '<b>Days and weeks:</b> added as exact day counts (1 week = 7 days exactly).',
                '<b>Example:</b> today + 90 days gives the date exactly 90 days from now, accounting for month lengths automatically.',
            ],
            howto: [
                { question: 'How do I find a date 6 months from today?', answer: '<p>Set the base date to today, amount to 6, unit to Months, operation to Add.</p>' },
                { question: 'Can I go backward from a date?', answer: '<p>Yes — choose Subtract instead of Add to go back in time.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Base Date', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.en, type: 'select', options: unitOptions('en'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.en, type: 'select', options: addSubtractOptions('en'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Resulting Date' }],
        },
        ru: {
            slug: 'kalkulyator-data-plyus-minus-edinicy', title: 'Калькулятор дата ± единицы календаря', h1: 'Калькулятор дата ± единицы календаря',
            meta_title: 'Калькулятор дата ± единицы | Сложение и вычитание дней, недель, месяцев, лет',
            meta_description: 'Складывайте или вычитайте дни, недели, месяцы или годы из любой даты и получайте результат мгновенно.',
            short_answer: 'Этот калькулятор складывает или вычитает выбранное количество дней, недель, месяцев или лет к/от базовой даты.',
            intro_text: '<p>Введите начальную дату, количество и единицу (дни, недели, месяцы, годы), затем выберите сложение или вычитание, чтобы найти результирующую дату.</p>',
            key_points: [
                '<b>Месяцы и годы:</b> добавляются с использованием календарной арифметики месяцев.',
                '<b>Дни и недели:</b> добавляются как точное количество дней (1 неделя = ровно 7 дней).',
                '<b>Пример:</b> сегодня + 90 дней даёт дату ровно через 90 дней от текущего момента.',
            ],
            howto: [
                { question: 'Как найти дату через 6 месяцев от сегодня?', answer: '<p>Установите базовую дату на сегодня, количество 6, единицу Месяцы, операцию Сложить.</p>' },
                { question: 'Могу ли я двигаться назад от даты?', answer: '<p>Да — выберите Вычесть вместо Сложить, чтобы двигаться назад во времени.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Базовая дата', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.ru, type: 'select', options: unitOptions('ru'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.ru, type: 'select', options: addSubtractOptions('ru'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Результирующая дата' }],
        },
        lv: {
            slug: 'datums-plus-minus-kalendara-vienibas-kalkulators', title: 'Datums ± Kalendāra Vienības Kalkulators', h1: 'Datums ± Kalendāra Vienības Kalkulators',
            meta_title: 'Datums ± Kalendāra Vienības | Dienu, Nedēļu, Mēnešu, Gadu Saskaitīšana',
            meta_description: 'Saskaitiet vai atņemiet dienas, nedēļas, mēnešus vai gadus no jebkura datuma un iegūstiet rezultātu acumirklī.',
            short_answer: 'Šis kalkulators saskaita vai atņem izvēlēto dienu, nedēļu, mēnešu vai gadu skaitu bāzes datumam.',
            intro_text: '<p>Ievadiet sākuma datumu, daudzumu un vienību (dienas, nedēļas, mēneši, gadi), tad izvēlieties saskaitīšanu vai atņemšanu, lai atrastu iegūto datumu.</p>',
            key_points: [
                '<b>Mēneši un gadi:</b> tiek pievienoti, izmantojot kalendāra mēnešu aritmētiku.',
                '<b>Dienas un nedēļas:</b> tiek pievienotas kā precīzs dienu skaits (1 nedēļa = tieši 7 dienas).',
                '<b>Piemērs:</b> šodiena + 90 dienas dod datumu tieši 90 dienas no tagad.',
            ],
            howto: [
                { question: 'Kā atrast datumu 6 mēnešus no šodienas?', answer: '<p>Iestatiet bāzes datumu uz šodienu, daudzumu 6, vienību Mēneši, darbību Pieskaitīt.</p>' },
                { question: 'Vai varu virzīties atpakaļ no datuma?', answer: '<p>Jā — izvēlieties Atņemt, nevis Pieskaitīt, lai virzītos atpakaļ laikā.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Bāzes Datums', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.lv, type: 'select', options: unitOptions('lv'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.lv, type: 'select', options: addSubtractOptions('lv'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Iegūtais Datums' }],
        },
        pl: {
            slug: 'kalkulator-data-plus-minus-jednostki', title: 'Kalkulator Data ± Jednostki Kalendarzowe', h1: 'Kalkulator Data ± Jednostki Kalendarzowe',
            meta_title: 'Kalkulator Data ± Jednostki | Dodawanie i Odejmowanie Dni, Tygodni, Miesięcy, Lat',
            meta_description: 'Dodaj lub odejmij dni, tygodnie, miesiące lub lata od dowolnej daty i uzyskaj wynik natychmiast.',
            short_answer: 'Ten kalkulator dodaje lub odejmuje wybraną liczbę dni, tygodni, miesięcy lub lat do/od daty bazowej.',
            intro_text: '<p>Wprowadź datę początkową, ilość i jednostkę (dni, tygodnie, miesiące, lata), a następnie wybierz dodawanie lub odejmowanie, aby znaleźć wynikową datę.</p>',
            key_points: [
                '<b>Miesiące i lata:</b> dodawane przy użyciu arytmetyki kalendarzowych miesięcy.',
                '<b>Dni i tygodnie:</b> dodawane jako dokładna liczba dni (1 tydzień = dokładnie 7 dni).',
                '<b>Przykład:</b> dziś + 90 dni daje datę dokładnie 90 dni od teraz.',
            ],
            howto: [
                { question: 'Jak znaleźć datę 6 miesięcy od dziś?', answer: '<p>Ustaw datę bazową na dziś, ilość na 6, jednostkę na Miesiące, operację na Dodaj.</p>' },
                { question: 'Czy mogę cofnąć się od daty?', answer: '<p>Tak — wybierz Odejmij zamiast Dodaj, aby cofnąć się w czasie.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Data Bazowa', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.pl, type: 'select', options: unitOptions('pl'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.pl, type: 'select', options: addSubtractOptions('pl'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Wynikowa Data' }],
        },
        es: {
            slug: 'calculadora-fecha-mas-menos-unidades', title: 'Calculadora Fecha ± Unidades de Calendario', h1: 'Calculadora Fecha ± Unidades de Calendario',
            meta_title: 'Calculadora Fecha ± Unidades | Sumar o Restar Días, Semanas, Meses, Años',
            meta_description: 'Suma o resta días, semanas, meses o años a cualquier fecha y obtén el resultado al instante.',
            short_answer: 'Esta calculadora suma o resta una cantidad elegida de días, semanas, meses o años a/de una fecha base.',
            intro_text: '<p>Introduce una fecha inicial, una cantidad y una unidad (días, semanas, meses o años), luego elige sumar o restar para encontrar la fecha resultante.</p>',
            key_points: [
                '<b>Meses y años:</b> se suman usando aritmética calendárica de meses.',
                '<b>Días y semanas:</b> se suman como recuento exacto de días (1 semana = exactamente 7 días).',
                '<b>Ejemplo:</b> hoy + 90 días da la fecha exactamente 90 días a partir de ahora.',
            ],
            howto: [
                { question: '¿Cómo encuentro una fecha a 6 meses de hoy?', answer: '<p>Establece la fecha base en hoy, cantidad en 6, unidad en Meses, operación en Sumar.</p>' },
                { question: '¿Puedo retroceder desde una fecha?', answer: '<p>Sí — elige Restar en lugar de Sumar para retroceder en el tiempo.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Fecha Base', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.es, type: 'select', options: unitOptions('es'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.es, type: 'select', options: addSubtractOptions('es'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Fecha Resultante' }],
        },
        fr: {
            slug: 'calculateur-date-plus-moins-unites', title: 'Calculateur Date ± Unités de Calendrier', h1: 'Calculateur Date ± Unités de Calendrier',
            meta_title: 'Calculateur Date ± Unités | Additionner ou Soustraire Jours, Semaines, Mois, Années',
            meta_description: 'Ajoutez ou soustrayez des jours, semaines, mois ou années à n’importe quelle date et obtenez le résultat instantanément.',
            short_answer: 'Ce calculateur ajoute ou soustrait un nombre choisi de jours, semaines, mois ou années à/d’une date de base.',
            intro_text: '<p>Entrez une date de départ, une quantité et une unité (jours, semaines, mois ou années), puis choisissez additionner ou soustraire pour trouver la date résultante.</p>',
            key_points: [
                '<b>Mois et années :</b> ajoutés en utilisant l’arithmétique calendaire des mois.',
                '<b>Jours et semaines :</b> ajoutés comme un nombre exact de jours (1 semaine = exactement 7 jours).',
                '<b>Exemple :</b> aujourd’hui + 90 jours donne la date exactement 90 jours à partir de maintenant.',
            ],
            howto: [
                { question: 'Comment trouver une date 6 mois après aujourd’hui ?', answer: '<p>Réglez la date de base sur aujourd’hui, la quantité sur 6, l’unité sur Mois, l’opération sur Additionner.</p>' },
                { question: 'Puis-je reculer à partir d’une date ?', answer: '<p>Oui — choisissez Soustraire au lieu d’Additionner pour reculer dans le temps.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Date de Base', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.fr, type: 'select', options: unitOptions('fr'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.fr, type: 'select', options: addSubtractOptions('fr'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Date Résultante' }],
        },
        it: {
            slug: 'calcolatore-data-piu-meno-unita', title: 'Calcolatore Data ± Unità di Calendario', h1: 'Calcolatore Data ± Unità di Calendario',
            meta_title: 'Calcolatore Data ± Unità | Somma o Sottrai Giorni, Settimane, Mesi, Anni',
            meta_description: 'Somma o sottrai giorni, settimane, mesi o anni a qualsiasi data e ottieni il risultato istantaneamente.',
            short_answer: 'Questo calcolatore somma o sottrae una quantità scelta di giorni, settimane, mesi o anni a/da una data base.',
            intro_text: '<p>Inserisci una data iniziale, una quantità e un’unità (giorni, settimane, mesi o anni), poi scegli somma o sottrazione per trovare la data risultante.</p>',
            key_points: [
                '<b>Mesi e anni:</b> sommati usando l’aritmetica calendaristica dei mesi.',
                '<b>Giorni e settimane:</b> sommati come conteggio esatto di giorni (1 settimana = esattamente 7 giorni).',
                '<b>Esempio:</b> oggi + 90 giorni dà la data esattamente 90 giorni da adesso.',
            ],
            howto: [
                { question: 'Come trovo una data tra 6 mesi da oggi?', answer: '<p>Imposta la data base su oggi, quantità su 6, unità su Mesi, operazione su Somma.</p>' },
                { question: 'Posso tornare indietro da una data?', answer: '<p>Sì — scegli Sottrai invece di Somma per tornare indietro nel tempo.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Data Base', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.it, type: 'select', options: unitOptions('it'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.it, type: 'select', options: addSubtractOptions('it'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Data Risultante' }],
        },
        de: {
            slug: 'datum-plus-minus-kalendereinheiten-rechner', title: 'Datum ± Kalendereinheiten Rechner', h1: 'Datum ± Kalendereinheiten Rechner',
            meta_title: 'Datum ± Kalendereinheiten | Tage, Wochen, Monate, Jahre Addieren oder Subtrahieren',
            meta_description: 'Addieren oder subtrahieren Sie Tage, Wochen, Monate oder Jahre von einem beliebigen Datum und erhalten Sie das Ergebnis sofort.',
            short_answer: 'Dieser Rechner addiert oder subtrahiert eine gewählte Anzahl von Tagen, Wochen, Monaten oder Jahren zu/von einem Basisdatum.',
            intro_text: '<p>Geben Sie ein Startdatum, eine Menge und eine Einheit (Tage, Wochen, Monate oder Jahre) ein, wählen Sie dann Addieren oder Subtrahieren, um das resultierende Datum zu finden.</p>',
            key_points: [
                '<b>Monate und Jahre:</b> addiert mit kalendarischer Monatsarithmetik.',
                '<b>Tage und Wochen:</b> addiert als exakte Tageszahl (1 Woche = genau 7 Tage).',
                '<b>Beispiel:</b> heute + 90 Tage ergibt das Datum genau 90 Tage ab jetzt.',
            ],
            howto: [
                { question: 'Wie finde ich ein Datum 6 Monate ab heute?', answer: '<p>Setzen Sie das Basisdatum auf heute, Menge auf 6, Einheit auf Monate, Operation auf Addieren.</p>' },
                { question: 'Kann ich von einem Datum zurückgehen?', answer: '<p>Ja — wählen Sie Subtrahieren statt Addieren, um in der Zeit zurückzugehen.</p>' },
            ],
            inputs: [
                { name: 'base_date', label: 'Basisdatum', type: 'date', default: 'today' },
                { name: 'amount', label: AMOUNT_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '30' },
                { name: 'unit', label: UNIT_LABEL.de, type: 'select', options: unitOptions('de'), default: 'days' },
                { name: 'operation', label: OPERATION_LABEL.de, type: 'select', options: addSubtractOptions('de'), default: 'add' },
            ],
            outputs: [{ name: 'result', label: 'Resultierendes Datum' }],
        },
    },
}

// ============================================================
// 1122: Date Calculator | Days and Business Days
// ============================================================
const daysBusinessDaysTool: ToolDef = {
    id: '1122',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'date1', default: 'today' }, { key: 'date2', default: 'today' }],
        functions: { result: { type: 'function', functionName: 'daysAndBusinessDays', params: { date1: 'date1', date2: 'date2' } } },
        outputs: [{ key: 'total_days' }, { key: 'business_days' }, { key: 'weekend_days' }],
    },
    locales: {
        en: {
            slug: 'date-calculator-days-and-business-days', title: 'Date Calculator | Days and Business Days', h1: 'Date Calculator | Days and Business Days',
            meta_title: 'Date Calculator | Days and Business Days Between Two Dates',
            meta_description: 'Find the total number of days and weekday-only business days between two dates.',
            short_answer: 'This calculator finds both the total calendar days and the business days (weekdays only, excluding Saturdays/Sundays) between two dates.',
            intro_text: '<p>Enter two dates to see the total number of days between them, plus a separate count of business days (Monday-Friday only) — useful for calculating project timelines, delivery estimates, or payment terms.</p>',
            key_points: [
                '<b>Total days:</b> the exact calendar-day difference between the two dates.',
                '<b>Business days:</b> counts only Monday through Friday, excluding both dates\' start day (counts full days between).',
                '<b>Weekend days:</b> the remainder — total days minus business days.',
            ],
            howto: [
                { question: 'Does this account for public holidays?', answer: '<p>No — it only excludes weekends (Saturday/Sunday). Subtract holiday days manually if needed for your region.</p>' },
                { question: 'What if I enter the dates in the wrong order?', answer: '<p>The calculator automatically handles either order and returns a positive difference.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.en, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.en, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.en },
                { name: 'business_days', label: 'Business Days' },
                { name: 'weekend_days', label: 'Weekend Days' },
            ],
        },
        ru: {
            slug: 'kalkulyator-dat-i-rabochih-dnej', title: 'Калькулятор дат и рабочих дней', h1: 'Калькулятор дат и рабочих дней',
            meta_title: 'Калькулятор дат | Дни и рабочие дни между двумя датами',
            meta_description: 'Узнайте общее количество дней и рабочих дней (без выходных) между двумя датами.',
            short_answer: 'Этот калькулятор находит как общее количество календарных дней, так и рабочих дней (только будни, без суббот/воскресений) между двумя датами.',
            intro_text: '<p>Введите две даты, чтобы увидеть общее количество дней между ними, плюс отдельный подсчёт рабочих дней (только понедельник-пятница).</p>',
            key_points: [
                '<b>Всего дней:</b> точная разница в календарных днях между двумя датами.',
                '<b>Рабочие дни:</b> считаются только с понедельника по пятницу.',
                '<b>Выходные дни:</b> остаток — всего дней минус рабочие дни.',
            ],
            howto: [
                { question: 'Учитываются ли государственные праздники?', answer: '<p>Нет — исключаются только выходные (суббота/воскресенье). Вычтите праздничные дни вручную при необходимости.</p>' },
                { question: 'Что если я введу даты в неправильном порядке?', answer: '<p>Калькулятор автоматически обрабатывает любой порядок и возвращает положительную разницу.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.ru, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.ru, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.ru },
                { name: 'business_days', label: 'Рабочие дни' },
                { name: 'weekend_days', label: 'Выходные дни' },
            ],
        },
        lv: {
            slug: 'datumu-un-darba-dienu-kalkulators', title: 'Datumu Kalkulators | Dienas un Darba Dienas', h1: 'Datumu Kalkulators | Dienas un Darba Dienas',
            meta_title: 'Datumu Kalkulators | Dienas un Darba Dienas Starp Diviem Datumiem',
            meta_description: 'Uzziniet kopējo dienu skaitu un tikai darba dienu skaitu (bez sestdienām/svētdienām) starp diviem datumiem.',
            short_answer: 'Šis kalkulators atrod gan kopējās kalendāra dienas, gan darba dienas (tikai darbdienas, izņemot sestdienas/svētdienas) starp diviem datumiem.',
            intro_text: '<p>Ievadiet divus datumus, lai redzētu kopējo dienu skaitu starp tiem, plus atsevišķu darba dienu skaitu (tikai pirmdiena-piektdiena).</p>',
            key_points: [
                '<b>Kopā dienas:</b> precīza kalendāra dienu starpība starp diviem datumiem.',
                '<b>Darba dienas:</b> skaitītas tikai no pirmdienas līdz piektdienai.',
                '<b>Nedēļas nogales dienas:</b> atlikums — kopā dienas mīnus darba dienas.',
            ],
            howto: [
                { question: 'Vai tas ņem vērā valsts svētkus?', answer: '<p>Nē — izslēgtas tikai nedēļas nogales (sestdiena/svētdiena). Atņemiet svētku dienas manuāli, ja nepieciešams.</p>' },
                { question: 'Kas notiek, ja ievadu datumus nepareizā secībā?', answer: '<p>Kalkulators automātiski apstrādā jebkuru secību un atgriež pozitīvu starpību.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.lv, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.lv, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.lv },
                { name: 'business_days', label: 'Darba Dienas' },
                { name: 'weekend_days', label: 'Nedēļas Nogales Dienas' },
            ],
        },
        pl: {
            slug: 'kalkulator-dat-i-dni-roboczych', title: 'Kalkulator Dat | Dni i Dni Robocze', h1: 'Kalkulator Dat | Dni i Dni Robocze',
            meta_title: 'Kalkulator Dat | Dni i Dni Robocze Między Dwiema Datami',
            meta_description: 'Poznaj łączną liczbę dni oraz dni roboczych (bez weekendów) między dwiema datami.',
            short_answer: 'Ten kalkulator znajduje zarówno łączną liczbę dni kalendarzowych, jak i dni roboczych (tylko dni powszednie, bez sobót/niedziel) między dwiema datami.',
            intro_text: '<p>Wprowadź dwie daty, aby zobaczyć łączną liczbę dni między nimi, plus osobne zliczenie dni roboczych (tylko poniedziałek-piątek).</p>',
            key_points: [
                '<b>Łącznie dni:</b> dokładna różnica w dniach kalendarzowych między dwiema datami.',
                '<b>Dni robocze:</b> liczone tylko od poniedziałku do piątku.',
                '<b>Dni weekendowe:</b> reszta — łącznie dni minus dni robocze.',
            ],
            howto: [
                { question: 'Czy to uwzględnia święta państwowe?', answer: '<p>Nie — wyklucza tylko weekendy (sobota/niedziela). Odejmij dni świąteczne ręcznie, jeśli potrzebne.</p>' },
                { question: 'Co jeśli wpiszę daty w złej kolejności?', answer: '<p>Kalkulator automatycznie obsługuje dowolną kolejność i zwraca dodatnią różnicę.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.pl, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.pl, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.pl },
                { name: 'business_days', label: 'Dni Robocze' },
                { name: 'weekend_days', label: 'Dni Weekendowe' },
            ],
        },
        es: {
            slug: 'calculadora-de-fechas-dias-y-dias-habiles', title: 'Calculadora de Fechas | Días y Días Hábiles', h1: 'Calculadora de Fechas | Días y Días Hábiles',
            meta_title: 'Calculadora de Fechas | Días y Días Hábiles Entre Dos Fechas',
            meta_description: 'Encuentra el número total de días y los días hábiles (solo entre semana) entre dos fechas.',
            short_answer: 'Esta calculadora encuentra tanto el total de días del calendario como los días hábiles (solo entre semana, excluyendo sábados/domingos) entre dos fechas.',
            intro_text: '<p>Introduce dos fechas para ver el número total de días entre ellas, más un recuento aparte de días hábiles (solo de lunes a viernes).</p>',
            key_points: [
                '<b>Días totales:</b> la diferencia exacta en días del calendario entre las dos fechas.',
                '<b>Días hábiles:</b> cuenta solo de lunes a viernes.',
                '<b>Días de fin de semana:</b> el resto — días totales menos días hábiles.',
            ],
            howto: [
                { question: '¿Esto tiene en cuenta los días festivos?', answer: '<p>No — solo excluye los fines de semana (sábado/domingo). Resta los días festivos manualmente si es necesario.</p>' },
                { question: '¿Qué pasa si introduzco las fechas en el orden equivocado?', answer: '<p>La calculadora maneja automáticamente cualquier orden y devuelve una diferencia positiva.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.es, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.es, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.es },
                { name: 'business_days', label: 'Días Hábiles' },
                { name: 'weekend_days', label: 'Días de Fin de Semana' },
            ],
        },
        fr: {
            slug: 'calculateur-de-dates-jours-et-jours-ouvres', title: 'Calculateur de Dates | Jours et Jours Ouvrés', h1: 'Calculateur de Dates | Jours et Jours Ouvrés',
            meta_title: 'Calculateur de Dates | Jours et Jours Ouvrés Entre Deux Dates',
            meta_description: 'Trouvez le nombre total de jours et les jours ouvrés (en semaine uniquement) entre deux dates.',
            short_answer: 'Ce calculateur trouve à la fois le total de jours calendaires et les jours ouvrés (en semaine uniquement, hors samedis/dimanches) entre deux dates.',
            intro_text: '<p>Entrez deux dates pour voir le nombre total de jours entre elles, plus un décompte séparé des jours ouvrés (lundi-vendredi uniquement).</p>',
            key_points: [
                '<b>Jours totaux :</b> la différence exacte en jours calendaires entre les deux dates.',
                '<b>Jours ouvrés :</b> compte uniquement du lundi au vendredi.',
                '<b>Jours de week-end :</b> le reste — jours totaux moins jours ouvrés.',
            ],
            howto: [
                { question: 'Cela tient-il compte des jours fériés ?', answer: '<p>Non — cela exclut uniquement les week-ends (samedi/dimanche). Soustrayez les jours fériés manuellement si nécessaire.</p>' },
                { question: 'Que se passe-t-il si j’entre les dates dans le mauvais ordre ?', answer: '<p>Le calculateur gère automatiquement n’importe quel ordre et renvoie une différence positive.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.fr, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.fr, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.fr },
                { name: 'business_days', label: 'Jours Ouvrés' },
                { name: 'weekend_days', label: 'Jours de Week-end' },
            ],
        },
        it: {
            slug: 'calcolatore-di-date-giorni-e-giorni-lavorativi', title: 'Calcolatore di Date | Giorni e Giorni Lavorativi', h1: 'Calcolatore di Date | Giorni e Giorni Lavorativi',
            meta_title: 'Calcolatore di Date | Giorni e Giorni Lavorativi Tra Due Date',
            meta_description: 'Trova il numero totale di giorni e i giorni lavorativi (solo infrasettimanali) tra due date.',
            short_answer: 'Questo calcolatore trova sia il totale dei giorni di calendario sia i giorni lavorativi (solo infrasettimanali, esclusi sabati/domeniche) tra due date.',
            intro_text: '<p>Inserisci due date per vedere il numero totale di giorni tra loro, più un conteggio separato dei giorni lavorativi (solo lunedì-venerdì).</p>',
            key_points: [
                '<b>Giorni totali:</b> la differenza esatta in giorni di calendario tra le due date.',
                '<b>Giorni lavorativi:</b> conta solo da lunedì a venerdì.',
                '<b>Giorni di weekend:</b> il resto — giorni totali meno giorni lavorativi.',
            ],
            howto: [
                { question: 'Questo tiene conto dei giorni festivi?', answer: '<p>No — esclude solo i weekend (sabato/domenica). Sottrai manualmente i giorni festivi se necessario.</p>' },
                { question: 'Cosa succede se inserisco le date nell’ordine sbagliato?', answer: '<p>Il calcolatore gestisce automaticamente qualsiasi ordine e restituisce una differenza positiva.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.it, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.it, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.it },
                { name: 'business_days', label: 'Giorni Lavorativi' },
                { name: 'weekend_days', label: 'Giorni di Weekend' },
            ],
        },
        de: {
            slug: 'datumsrechner-tage-und-werktage', title: 'Datumsrechner | Tage und Werktage', h1: 'Datumsrechner | Tage und Werktage',
            meta_title: 'Datumsrechner | Tage und Werktage Zwischen Zwei Daten',
            meta_description: 'Finden Sie die Gesamtzahl der Tage und die reinen Werktage (ohne Wochenende) zwischen zwei Daten.',
            short_answer: 'Dieser Rechner findet sowohl die Gesamtzahl der Kalendertage als auch die Werktage (nur Wochentage, ohne Samstag/Sonntag) zwischen zwei Daten.',
            intro_text: '<p>Geben Sie zwei Daten ein, um die Gesamtzahl der Tage zwischen ihnen zu sehen, plus eine separate Zählung der Werktage (nur Montag-Freitag).</p>',
            key_points: [
                '<b>Gesamttage:</b> die genaue Kalendertagdifferenz zwischen den beiden Daten.',
                '<b>Werktage:</b> zählt nur Montag bis Freitag.',
                '<b>Wochenendtage:</b> der Rest — Gesamttage minus Werktage.',
            ],
            howto: [
                { question: 'Berücksichtigt dies gesetzliche Feiertage?', answer: '<p>Nein — es schließt nur Wochenenden (Samstag/Sonntag) aus. Ziehen Sie Feiertage bei Bedarf manuell ab.</p>' },
                { question: 'Was, wenn ich die Daten in falscher Reihenfolge eingebe?', answer: '<p>Der Rechner verarbeitet automatisch jede Reihenfolge und gibt eine positive Differenz zurück.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.de, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.de, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'total_days', label: TOTAL_DAYS_LABEL.de },
                { name: 'business_days', label: 'Werktage' },
                { name: 'weekend_days', label: 'Wochenendtage' },
            ],
        },
    },
}

// ============================================================
// 1123: Date Difference Calculator
// ============================================================
const dateDifferenceTool: ToolDef = {
    id: '1123',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'date1', default: 'today' }, { key: 'date2', default: 'today' }],
        functions: { result: { type: 'function', functionName: 'dateDifference', params: { date1: 'date1', date2: 'date2' } } },
        outputs: [{ key: 'years' }, { key: 'months' }, { key: 'days' }, { key: 'total_days' }, { key: 'total_weeks', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'date-difference-calculator', title: 'Date Difference Calculator', h1: 'Date Difference Calculator',
            meta_title: 'Date Difference Calculator | Years, Months, Days Between Two Dates',
            meta_description: 'Find the exact difference between two dates in years, months, and days, plus total days and weeks.',
            short_answer: 'This calculator finds the exact difference between two dates, broken down into years, months, and days, plus total days and weeks.',
            intro_text: '<p>Enter two dates to see exactly how far apart they are — as a years/months/days breakdown, plus total days and total weeks, useful for anniversaries, planning, or general curiosity.</p>',
            key_points: [
                '<b>Breakdown:</b> uses standard calendar year/month/day-borrow subtraction, giving an intuitive result like "2 years, 3 months, 10 days".',
                '<b>Total days/weeks:</b> also shown as single numbers for quick reference.',
                '<b>Order-independent:</b> enter the dates in either order — the calculator always returns a positive difference.',
            ],
            howto: [
                { question: 'How many days are there between January 1 and December 31 of the same year?', answer: '<p>364 days (365 in a leap year), since it\'s the difference, not an inclusive count.</p>' },
                { question: 'Can I use this to count down to a future date?', answer: '<p>Yes — enter today\'s date and any future date to see exactly how far away it is.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.en, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.en, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.en }, { name: 'months', label: MONTHS_LABEL.en }, { name: 'days', label: DAYS_LABEL.en },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.en }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.en, precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-raznicy-dat', title: 'Калькулятор разницы дат', h1: 'Калькулятор разницы дат',
            meta_title: 'Калькулятор разницы дат | Годы, месяцы, дни между двумя датами',
            meta_description: 'Узнайте точную разницу между двумя датами в годах, месяцах и днях, плюс всего дней и недель.',
            short_answer: 'Этот калькулятор находит точную разницу между двумя датами, разбитую на годы, месяцы и дни, плюс всего дней и недель.',
            intro_text: '<p>Введите две даты, чтобы увидеть, насколько они удалены друг от друга — в виде разбивки годы/месяцы/дни, плюс всего дней и недель.</p>',
            key_points: [
                '<b>Разбивка:</b> используется стандартное календарное вычитание год/месяц/день с заимствованием.',
                '<b>Всего дней/недель:</b> также показывается как отдельные числа для быстрой справки.',
                '<b>Независимо от порядка:</b> введите даты в любом порядке — калькулятор всегда возвращает положительную разницу.',
            ],
            howto: [
                { question: 'Сколько дней между 1 января и 31 декабря того же года?', answer: '<p>364 дня (365 в високосный год), так как это разница, а не включительный подсчёт.</p>' },
                { question: 'Могу ли я использовать это для отсчёта до будущей даты?', answer: '<p>Да — введите сегодняшнюю дату и любую будущую дату, чтобы увидеть, насколько она далеко.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.ru, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.ru, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.ru }, { name: 'months', label: MONTHS_LABEL.ru }, { name: 'days', label: DAYS_LABEL.ru },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.ru }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.ru, precision: 1 },
            ],
        },
        lv: {
            slug: 'datumu-starpibas-kalkulators', title: 'Datumu Starpības Kalkulators', h1: 'Datumu Starpības Kalkulators',
            meta_title: 'Datumu Starpības Kalkulators | Gadi, Mēneši, Dienas Starp Diviem Datumiem',
            meta_description: 'Uzziniet precīzu starpību starp diviem datumiem gados, mēnešos un dienās, plus kopā dienas un nedēļas.',
            short_answer: 'Šis kalkulators atrod precīzu starpību starp diviem datumiem, sadalītu gados, mēnešos un dienās, plus kopā dienas un nedēļas.',
            intro_text: '<p>Ievadiet divus datumus, lai redzētu, cik tālu tie ir viens no otra — kā gadu/mēnešu/dienu sadalījumu, plus kopā dienas un nedēļas.</p>',
            key_points: [
                '<b>Sadalījums:</b> izmanto standarta kalendāra gada/mēneša/dienas atņemšanu.',
                '<b>Kopā dienas/nedēļas:</b> arī tiek parādītas kā atsevišķi skaitļi ātrai uzziņai.',
                '<b>Neatkarīgs no secības:</b> ievadiet datumus jebkurā secībā — kalkulators vienmēr atgriež pozitīvu starpību.',
            ],
            howto: [
                { question: 'Cik dienu ir starp 1. janvāri un 31. decembri tajā pašā gadā?', answer: '<p>364 dienas (365 garā gadā), jo tā ir starpība, nevis ieskaitošs skaits.</p>' },
                { question: 'Vai varu izmantot to, lai skaitītu līdz nākotnes datumam?', answer: '<p>Jā — ievadiet šodienas datumu un jebkuru nākotnes datumu.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.lv, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.lv, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.lv }, { name: 'months', label: MONTHS_LABEL.lv }, { name: 'days', label: DAYS_LABEL.lv },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.lv }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.lv, precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-roznicy-dat', title: 'Kalkulator Różnicy Dat', h1: 'Kalkulator Różnicy Dat',
            meta_title: 'Kalkulator Różnicy Dat | Lata, Miesiące, Dni Między Dwiema Datami',
            meta_description: 'Poznaj dokładną różnicę między dwiema datami w latach, miesiącach i dniach, plus łączne dni i tygodnie.',
            short_answer: 'Ten kalkulator znajduje dokładną różnicę między dwiema datami, podzieloną na lata, miesiące i dni, plus łączne dni i tygodnie.',
            intro_text: '<p>Wprowadź dwie daty, aby zobaczyć, jak bardzo są od siebie oddalone — jako podział lata/miesiące/dni, plus łączne dni i tygodnie.</p>',
            key_points: [
                '<b>Podział:</b> używa standardowego kalendarzowego odejmowania rok/miesiąc/dzień.',
                '<b>Łącznie dni/tygodnie:</b> pokazywane też jako pojedyncze liczby dla szybkiego odniesienia.',
                '<b>Niezależne od kolejności:</b> wprowadź daty w dowolnej kolejności — kalkulator zawsze zwraca dodatnią różnicę.',
            ],
            howto: [
                { question: 'Ile dni jest między 1 stycznia a 31 grudnia tego samego roku?', answer: '<p>364 dni (365 w roku przestępnym), ponieważ to różnica, a nie liczenie włącznie.</p>' },
                { question: 'Czy mogę użyć tego do odliczania do przyszłej daty?', answer: '<p>Tak — wpisz dzisiejszą datę i dowolną przyszłą datę.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.pl, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.pl, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.pl }, { name: 'months', label: MONTHS_LABEL.pl }, { name: 'days', label: DAYS_LABEL.pl },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.pl }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.pl, precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-de-diferencia-de-fechas', title: 'Calculadora de Diferencia de Fechas', h1: 'Calculadora de Diferencia de Fechas',
            meta_title: 'Calculadora de Diferencia de Fechas | Años, Meses, Días Entre Dos Fechas',
            meta_description: 'Encuentra la diferencia exacta entre dos fechas en años, meses y días, más días y semanas totales.',
            short_answer: 'Esta calculadora encuentra la diferencia exacta entre dos fechas, desglosada en años, meses y días, más días y semanas totales.',
            intro_text: '<p>Introduce dos fechas para ver exactamente cuán distantes están — como un desglose años/meses/días, más días y semanas totales.</p>',
            key_points: [
                '<b>Desglose:</b> usa la resta calendárica estándar de año/mes/día.',
                '<b>Días/semanas totales:</b> también se muestran como números individuales para referencia rápida.',
                '<b>Independiente del orden:</b> introduce las fechas en cualquier orden — la calculadora siempre devuelve una diferencia positiva.',
            ],
            howto: [
                { question: '¿Cuántos días hay entre el 1 de enero y el 31 de diciembre del mismo año?', answer: '<p>364 días (365 en año bisiesto), ya que es la diferencia, no un recuento inclusivo.</p>' },
                { question: '¿Puedo usar esto para contar hasta una fecha futura?', answer: '<p>Sí — introduce la fecha de hoy y cualquier fecha futura.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.es, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.es, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.es }, { name: 'months', label: MONTHS_LABEL.es }, { name: 'days', label: DAYS_LABEL.es },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.es }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.es, precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-de-difference-de-dates', title: 'Calculateur de Différence de Dates', h1: 'Calculateur de Différence de Dates',
            meta_title: 'Calculateur de Différence de Dates | Années, Mois, Jours Entre Deux Dates',
            meta_description: 'Trouvez la différence exacte entre deux dates en années, mois et jours, plus le total de jours et semaines.',
            short_answer: 'Ce calculateur trouve la différence exacte entre deux dates, décomposée en années, mois et jours, plus le total de jours et semaines.',
            intro_text: '<p>Entrez deux dates pour voir exactement à quelle distance elles sont l’une de l’autre — sous forme de décomposition années/mois/jours, plus le total de jours et semaines.</p>',
            key_points: [
                '<b>Décomposition :</b> utilise une soustraction calendaire standard année/mois/jour.',
                '<b>Total jours/semaines :</b> aussi affiché comme des nombres uniques pour référence rapide.',
                '<b>Indépendant de l’ordre :</b> entrez les dates dans n’importe quel ordre — le calculateur renvoie toujours une différence positive.',
            ],
            howto: [
                { question: 'Combien de jours y a-t-il entre le 1er janvier et le 31 décembre de la même année ?', answer: '<p>364 jours (365 en année bissextile), car c’est la différence, pas un décompte inclusif.</p>' },
                { question: 'Puis-je utiliser ceci pour compter jusqu’à une date future ?', answer: '<p>Oui — entrez la date d’aujourd’hui et n’importe quelle date future.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.fr, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.fr, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.fr }, { name: 'months', label: MONTHS_LABEL.fr }, { name: 'days', label: DAYS_LABEL.fr },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.fr }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.fr, precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-di-differenza-tra-date', title: 'Calcolatore di Differenza tra Date', h1: 'Calcolatore di Differenza tra Date',
            meta_title: 'Calcolatore di Differenza tra Date | Anni, Mesi, Giorni Tra Due Date',
            meta_description: 'Trova la differenza esatta tra due date in anni, mesi e giorni, più giorni e settimane totali.',
            short_answer: 'Questo calcolatore trova la differenza esatta tra due date, scomposta in anni, mesi e giorni, più giorni e settimane totali.',
            intro_text: '<p>Inserisci due date per vedere esattamente quanto distano l’una dall’altra — come scomposizione anni/mesi/giorni, più giorni e settimane totali.</p>',
            key_points: [
                '<b>Scomposizione:</b> usa la sottrazione calendaristica standard anno/mese/giorno.',
                '<b>Giorni/settimane totali:</b> mostrati anche come numeri singoli per riferimento rapido.',
                '<b>Indipendente dall’ordine:</b> inserisci le date in qualsiasi ordine — il calcolatore restituisce sempre una differenza positiva.',
            ],
            howto: [
                { question: 'Quanti giorni ci sono tra il 1° gennaio e il 31 dicembre dello stesso anno?', answer: '<p>364 giorni (365 in un anno bisestile), poiché è la differenza, non un conteggio inclusivo.</p>' },
                { question: 'Posso usarlo per contare fino a una data futura?', answer: '<p>Sì — inserisci la data di oggi e qualsiasi data futura.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.it, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.it, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.it }, { name: 'months', label: MONTHS_LABEL.it }, { name: 'days', label: DAYS_LABEL.it },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.it }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.it, precision: 1 },
            ],
        },
        de: {
            slug: 'datumsdifferenz-rechner', title: 'Datumsdifferenz-Rechner', h1: 'Datumsdifferenz-Rechner',
            meta_title: 'Datumsdifferenz-Rechner | Jahre, Monate, Tage Zwischen Zwei Daten',
            meta_description: 'Finden Sie die genaue Differenz zwischen zwei Daten in Jahren, Monaten und Tagen, plus Gesamttage und -wochen.',
            short_answer: 'Dieser Rechner findet die genaue Differenz zwischen zwei Daten, aufgeschlüsselt in Jahre, Monate und Tage, plus Gesamttage und -wochen.',
            intro_text: '<p>Geben Sie zwei Daten ein, um genau zu sehen, wie weit sie auseinanderliegen — als Jahre/Monate/Tage-Aufschlüsselung, plus Gesamttage und -wochen.</p>',
            key_points: [
                '<b>Aufschlüsselung:</b> verwendet eine standardmäßige kalendarische Jahr/Monat/Tag-Subtraktion.',
                '<b>Gesamttage/-wochen:</b> auch als Einzelzahlen zur schnellen Referenz angezeigt.',
                '<b>Reihenfolge-unabhängig:</b> geben Sie die Daten in beliebiger Reihenfolge ein — der Rechner gibt immer eine positive Differenz zurück.',
            ],
            howto: [
                { question: 'Wie viele Tage liegen zwischen dem 1. Januar und dem 31. Dezember desselben Jahres?', answer: '<p>364 Tage (365 in einem Schaltjahr), da es die Differenz ist, keine inklusive Zählung.</p>' },
                { question: 'Kann ich damit bis zu einem zukünftigen Datum zählen?', answer: '<p>Ja — geben Sie das heutige Datum und ein beliebiges zukünftiges Datum ein.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.de, type: 'date', default: 'today' },
                { name: 'date2', label: END_DATE_LABEL.de, type: 'date', default: 'today' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.de }, { name: 'months', label: MONTHS_LABEL.de }, { name: 'days', label: DAYS_LABEL.de },
                { name: 'total_days', label: TOTAL_DAYS_LABEL.de }, { name: 'total_weeks', label: TOTAL_WEEKS_LABEL.de, precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1124: Time & Date Difference Calculator (full datetime granularity)
// ============================================================
const datetimeDifferenceTool: ToolDef = {
    id: '1124',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'date1', default: 'today' }, { key: 'hour1', default: 9 }, { key: 'minute1', default: 0 },
            { key: 'date2', default: 'today' }, { key: 'hour2', default: 17 }, { key: 'minute2', default: 30 },
        ],
        functions: { result: { type: 'function', functionName: 'datetimeDifference', params: { date1: 'date1', hour1: 'hour1', minute1: 'minute1', date2: 'date2', hour2: 'hour2', minute2: 'minute2' } } },
        outputs: [{ key: 'years' }, { key: 'months' }, { key: 'days' }, { key: 'hours' }, { key: 'minutes' }, { key: 'total_hours', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'time-and-date-difference-calculator', title: 'Time & Date Difference Calculator', h1: 'Time & Date Difference Calculator',
            meta_title: 'Time & Date Difference Calculator | Full Datetime Granularity',
            meta_description: 'Find the exact difference between two dates and times, down to the minute, plus total hours.',
            short_answer: 'This calculator finds the difference between two full date-and-time points, broken down into years, months, days, hours, and minutes.',
            intro_text: '<p>Unlike a simple date-only difference, this tool also accounts for the specific hour and minute on each date — useful for precise event durations, project spans, or travel time calculations.</p>',
            key_points: [
                '<b>Full granularity:</b> the result includes years, months, days, hours, and minutes, plus a single total-hours figure.',
                '<b>Example:</b> Jan 1 9:00 AM to Jan 3 5:30 PM = 2 days, 8 hours, 30 minutes (56.5 total hours).',
                '<b>Order-independent:</b> enter the two datetimes in either order — the calculator returns a positive difference.',
            ],
            howto: [
                { question: 'How is this different from the plain Date Difference Calculator?', answer: '<p>This tool factors in the exact hour and minute on each date, not just the calendar day, giving a more precise result.</p>' },
                { question: 'What does "total hours" mean?', answer: '<p>It\'s the entire difference expressed as a single decimal number of hours, useful for billing or duration tracking.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.en, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.en + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.en, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.en + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.en }, { name: 'months', label: MONTHS_LABEL.en }, { name: 'days', label: DAYS_LABEL.en },
                { name: 'hours', label: 'Hours' }, { name: 'minutes', label: 'Minutes' }, { name: 'total_hours', label: 'Total Hours', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-raznicy-daty-i-vremeni', title: 'Калькулятор разницы даты и времени', h1: 'Калькулятор разницы даты и времени',
            meta_title: 'Калькулятор разницы даты и времени | Полная точность до минуты',
            meta_description: 'Узнайте точную разницу между двумя датами и временем, с точностью до минуты, плюс всего часов.',
            short_answer: 'Этот калькулятор находит разницу между двумя полными точками даты и времени, разбитую на годы, месяцы, дни, часы и минуты.',
            intro_text: '<p>В отличие от простой разницы дат, этот инструмент также учитывает конкретный час и минуту на каждой дате.</p>',
            key_points: [
                '<b>Полная детализация:</b> результат включает годы, месяцы, дни, часы и минуты, плюс единую цифру общих часов.',
                '<b>Пример:</b> 1 янв 9:00 до 3 янв 17:30 = 2 дня, 8 часов, 30 минут (56,5 часа всего).',
                '<b>Независимо от порядка:</b> введите даты-времена в любом порядке.',
            ],
            howto: [
                { question: 'Чем это отличается от простого калькулятора разницы дат?', answer: '<p>Этот инструмент учитывает точный час и минуту на каждой дате, а не только календарный день.</p>' },
                { question: 'Что означает "всего часов"?', answer: '<p>Это вся разница, выраженная как единое десятичное число часов.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.ru, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.ru + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.ru, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.ru + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.ru }, { name: 'months', label: MONTHS_LABEL.ru }, { name: 'days', label: DAYS_LABEL.ru },
                { name: 'hours', label: 'Часы' }, { name: 'minutes', label: 'Минуты' }, { name: 'total_hours', label: 'Всего часов', precision: 2 },
            ],
        },
        lv: {
            slug: 'laika-un-datuma-starpibas-kalkulators', title: 'Laika un Datuma Starpības Kalkulators', h1: 'Laika un Datuma Starpības Kalkulators',
            meta_title: 'Laika un Datuma Starpības Kalkulators | Pilna Precizitāte līdz Minūtei',
            meta_description: 'Uzziniet precīzu starpību starp diviem datumiem un laikiem, precīzi līdz minūtei, plus kopā stundas.',
            short_answer: 'Šis kalkulators atrod starpību starp diviem pilniem datuma un laika punktiem, sadalītu gados, mēnešos, dienās, stundās un minūtēs.',
            intro_text: '<p>Atšķirībā no vienkāršas datumu starpības, šis rīks arī ņem vērā konkrēto stundu un minūti katrā datumā.</p>',
            key_points: [
                '<b>Pilna detalizācija:</b> rezultāts ietver gadus, mēnešus, dienas, stundas un minūtes, plus vienu kopējo stundu skaitli.',
                '<b>Piemērs:</b> 1. janvāris 9:00 līdz 3. janvārim 17:30 = 2 dienas, 8 stundas, 30 minūtes (56,5 stundas kopā).',
                '<b>Neatkarīgs no secības:</b> ievadiet abus datumus-laikus jebkurā secībā.',
            ],
            howto: [
                { question: 'Kā tas atšķiras no vienkāršā Datumu Starpības Kalkulatora?', answer: '<p>Šis rīks ņem vērā precīzu stundu un minūti katrā datumā, ne tikai kalendāra dienu.</p>' },
                { question: 'Ko nozīmē "kopā stundas"?', answer: '<p>Tā ir visa starpība, izteikta kā viens decimāls stundu skaitlis.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.lv, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.lv + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.lv, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.lv + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.lv }, { name: 'months', label: MONTHS_LABEL.lv }, { name: 'days', label: DAYS_LABEL.lv },
                { name: 'hours', label: 'Stundas' }, { name: 'minutes', label: 'Minūtes' }, { name: 'total_hours', label: 'Kopā Stundas', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-roznicy-czasu-i-daty', title: 'Kalkulator Różnicy Czasu i Daty', h1: 'Kalkulator Różnicy Czasu i Daty',
            meta_title: 'Kalkulator Różnicy Czasu i Daty | Pełna Precyzja do Minuty',
            meta_description: 'Poznaj dokładną różnicę między dwiema datami i godzinami, co do minuty, plus łączne godziny.',
            short_answer: 'Ten kalkulator znajduje różnicę między dwoma pełnymi punktami daty i czasu, podzieloną na lata, miesiące, dni, godziny i minuty.',
            intro_text: '<p>W przeciwieństwie do prostej różnicy dat, to narzędzie uwzględnia też konkretną godzinę i minutę w każdej dacie.</p>',
            key_points: [
                '<b>Pełna szczegółowość:</b> wynik zawiera lata, miesiące, dni, godziny i minuty, plus jedną łączną liczbę godzin.',
                '<b>Przykład:</b> 1 sty 9:00 do 3 sty 17:30 = 2 dni, 8 godzin, 30 minut (56,5 godziny łącznie).',
                '<b>Niezależne od kolejności:</b> wprowadź oba momenty w dowolnej kolejności.',
            ],
            howto: [
                { question: 'Czym to się różni od zwykłego Kalkulatora Różnicy Dat?', answer: '<p>To narzędzie uwzględnia dokładną godzinę i minutę na każdej dacie, nie tylko dzień kalendarzowy.</p>' },
                { question: 'Co oznacza "łączne godziny"?', answer: '<p>To cała różnica wyrażona jako pojedyncza liczba dziesiętna godzin.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.pl, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.pl + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.pl, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.pl + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.pl }, { name: 'months', label: MONTHS_LABEL.pl }, { name: 'days', label: DAYS_LABEL.pl },
                { name: 'hours', label: 'Godziny' }, { name: 'minutes', label: 'Minuty' }, { name: 'total_hours', label: 'Łącznie Godzin', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-diferencia-de-fecha-y-hora', title: 'Calculadora de Diferencia de Fecha y Hora', h1: 'Calculadora de Diferencia de Fecha y Hora',
            meta_title: 'Calculadora de Diferencia de Fecha y Hora | Precisión Completa al Minuto',
            meta_description: 'Encuentra la diferencia exacta entre dos fechas y horas, al minuto, más horas totales.',
            short_answer: 'Esta calculadora encuentra la diferencia entre dos puntos completos de fecha y hora, desglosada en años, meses, días, horas y minutos.',
            intro_text: '<p>A diferencia de una simple diferencia de fechas, esta herramienta también tiene en cuenta la hora y minuto específicos de cada fecha.</p>',
            key_points: [
                '<b>Granularidad completa:</b> el resultado incluye años, meses, días, horas y minutos, más una cifra única de horas totales.',
                '<b>Ejemplo:</b> 1 de enero 9:00 a 3 de enero 17:30 = 2 días, 8 horas, 30 minutos (56,5 horas totales).',
                '<b>Independiente del orden:</b> introduce ambas fechas-horas en cualquier orden.',
            ],
            howto: [
                { question: '¿En qué se diferencia de la Calculadora de Diferencia de Fechas simple?', answer: '<p>Esta herramienta tiene en cuenta la hora y minuto exactos de cada fecha, no solo el día calendario.</p>' },
                { question: '¿Qué significa "horas totales"?', answer: '<p>Es toda la diferencia expresada como un único número decimal de horas.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.es, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.es + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.es, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.es + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.es }, { name: 'months', label: MONTHS_LABEL.es }, { name: 'days', label: DAYS_LABEL.es },
                { name: 'hours', label: 'Horas' }, { name: 'minutes', label: 'Minutos' }, { name: 'total_hours', label: 'Horas Totales', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-difference-de-date-et-heure', title: 'Calculateur de Différence de Date et Heure', h1: 'Calculateur de Différence de Date et Heure',
            meta_title: 'Calculateur de Différence de Date et Heure | Précision Complète à la Minute',
            meta_description: 'Trouvez la différence exacte entre deux dates et heures, à la minute près, plus le total d’heures.',
            short_answer: 'Ce calculateur trouve la différence entre deux points complets de date et heure, décomposée en années, mois, jours, heures et minutes.',
            intro_text: '<p>Contrairement à une simple différence de dates, cet outil tient aussi compte de l’heure et de la minute précises de chaque date.</p>',
            key_points: [
                '<b>Granularité complète :</b> le résultat inclut années, mois, jours, heures et minutes, plus un chiffre unique d’heures totales.',
                '<b>Exemple :</b> 1er janvier 9:00 au 3 janvier 17:30 = 2 jours, 8 heures, 30 minutes (56,5 heures au total).',
                '<b>Indépendant de l’ordre :</b> entrez les deux dates-heures dans n’importe quel ordre.',
            ],
            howto: [
                { question: 'En quoi est-ce différent du simple Calculateur de Différence de Dates ?', answer: '<p>Cet outil prend en compte l’heure et la minute exactes de chaque date, pas seulement le jour calendaire.</p>' },
                { question: 'Que signifie "heures totales" ?', answer: '<p>C’est toute la différence exprimée comme un seul nombre décimal d’heures.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.fr, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.fr + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.fr, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.fr + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.fr }, { name: 'months', label: MONTHS_LABEL.fr }, { name: 'days', label: DAYS_LABEL.fr },
                { name: 'hours', label: 'Heures' }, { name: 'minutes', label: 'Minutes' }, { name: 'total_hours', label: 'Heures Totales', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-differenza-tra-data-e-ora', title: 'Calcolatore di Differenza tra Data e Ora', h1: 'Calcolatore di Differenza tra Data e Ora',
            meta_title: 'Calcolatore di Differenza tra Data e Ora | Precisione Completa al Minuto',
            meta_description: 'Trova la differenza esatta tra due date e orari, al minuto, più le ore totali.',
            short_answer: 'Questo calcolatore trova la differenza tra due punti completi di data e ora, scomposta in anni, mesi, giorni, ore e minuti.',
            intro_text: '<p>A differenza di una semplice differenza di date, questo strumento tiene conto anche dell’ora e del minuto specifici di ciascuna data.</p>',
            key_points: [
                '<b>Granularità completa:</b> il risultato include anni, mesi, giorni, ore e minuti, più una cifra unica di ore totali.',
                '<b>Esempio:</b> 1 gennaio 9:00 al 3 gennaio 17:30 = 2 giorni, 8 ore, 30 minuti (56,5 ore totali).',
                '<b>Indipendente dall’ordine:</b> inserisci entrambe le date-ore in qualsiasi ordine.',
            ],
            howto: [
                { question: 'In cosa differisce dal semplice Calcolatore di Differenza tra Date?', answer: '<p>Questo strumento tiene conto dell’ora e del minuto esatti di ciascuna data, non solo del giorno di calendario.</p>' },
                { question: 'Cosa significa "ore totali"?', answer: '<p>È l’intera differenza espressa come un unico numero decimale di ore.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.it, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.it + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.it, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.it + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.it }, { name: 'months', label: MONTHS_LABEL.it }, { name: 'days', label: DAYS_LABEL.it },
                { name: 'hours', label: 'Ore' }, { name: 'minutes', label: 'Minuti' }, { name: 'total_hours', label: 'Ore Totali', precision: 2 },
            ],
        },
        de: {
            slug: 'zeit-und-datumsdifferenz-rechner', title: 'Zeit- und Datumsdifferenz-Rechner', h1: 'Zeit- und Datumsdifferenz-Rechner',
            meta_title: 'Zeit- und Datumsdifferenz-Rechner | Volle Genauigkeit bis zur Minute',
            meta_description: 'Finden Sie die genaue Differenz zwischen zwei Daten und Uhrzeiten, minutengenau, plus Gesamtstunden.',
            short_answer: 'Dieser Rechner findet die Differenz zwischen zwei vollständigen Datum-Zeit-Punkten, aufgeschlüsselt in Jahre, Monate, Tage, Stunden und Minuten.',
            intro_text: '<p>Anders als eine einfache Datumsdifferenz berücksichtigt dieses Tool auch die genaue Stunde und Minute an jedem Datum.</p>',
            key_points: [
                '<b>Volle Granularität:</b> das Ergebnis umfasst Jahre, Monate, Tage, Stunden und Minuten, plus eine einzelne Gesamtstundenzahl.',
                '<b>Beispiel:</b> 1. Jan 9:00 bis 3. Jan 17:30 = 2 Tage, 8 Stunden, 30 Minuten (56,5 Stunden insgesamt).',
                '<b>Reihenfolge-unabhängig:</b> geben Sie beide Datum-Zeit-Punkte in beliebiger Reihenfolge ein.',
            ],
            howto: [
                { question: 'Wie unterscheidet sich das vom einfachen Datumsdifferenz-Rechner?', answer: '<p>Dieses Tool berücksichtigt die genaue Stunde und Minute an jedem Datum, nicht nur den Kalendertag.</p>' },
                { question: 'Was bedeutet "Gesamtstunden"?', answer: '<p>Das ist die gesamte Differenz, ausgedrückt als eine einzelne Dezimalstundenzahl.</p>' },
            ],
            inputs: [
                { name: 'date1', label: START_DATE_LABEL.de, type: 'date', default: 'today' },
                { name: 'hour1', label: HOUR_LABEL.de + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '9' },
                { name: 'minute1', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'date2', label: END_DATE_LABEL.de, type: 'date', default: 'today' },
                { name: 'hour2', label: HOUR_LABEL.de + ' (0-23)', type: 'number', min: 0, max: 23, placeholder: '17' },
                { name: 'minute2', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '30' },
            ],
            outputs: [
                { name: 'years', label: YEARS_LABEL.de }, { name: 'months', label: MONTHS_LABEL.de }, { name: 'days', label: DAYS_LABEL.de },
                { name: 'hours', label: 'Stunden' }, { name: 'minutes', label: 'Minuten' }, { name: 'total_hours', label: 'Gesamtstunden', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1125: Sunrise and Sunset Times for Any Location
// ============================================================
const sunriseSunsetTool: ToolDef = {
    id: '1125',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'latitude', default: 40.7128 }, { key: 'longitude', default: -74.006 }, { key: 'date', default: 'today' }, { key: 'utc_offset', default: -5 }],
        functions: { result: { type: 'function', functionName: 'sunriseSunset', params: { latitude: 'latitude', longitude: 'longitude', date: 'date', utc_offset: 'utc_offset' } } },
        outputs: [{ key: 'sunrise' }, { key: 'sunset' }, { key: 'day_length_hours', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'sunrise-and-sunset-times', title: 'Sunrise and Sunset Times for Any Location | calculatorscope', h1: 'Sunrise and Sunset Times for Any Location',
            meta_title: 'Sunrise and Sunset Times Calculator | Any Location, Any Date',
            meta_description: 'Find sunrise, sunset, and day length for any latitude/longitude and date using the standard solar position formula.',
            short_answer: 'This calculator finds sunrise and sunset times, plus total daylight hours, for any location and date using latitude, longitude, and UTC offset.',
            intro_text: '<p>Enter a location\'s latitude and longitude, a date, and the UTC offset currently in effect there, to calculate sunrise, sunset, and total day length using the standard NOAA/Meeus solar position formula (accurate to roughly a minute).</p>',
            key_points: [
                '<b>Latitude/longitude:</b> use decimal degrees (e.g. New York City is approximately 40.71, -74.01).',
                '<b>UTC offset:</b> enter the offset currently in effect at that location (accounting for daylight saving time manually if applicable).',
                '<b>Polar regions:</b> near the poles in summer/winter, the calculator will report "midnight sun" or "polar night" instead of specific times.',
            ],
            howto: [
                { question: 'How accurate are these times?', answer: '<p>The formula is accurate to within roughly a minute for most locations and dates — sufficient for planning purposes, though not to the second.</p>' },
                { question: 'Where do I find a location\'s latitude and longitude?', answer: '<p>Any map service (search "[city name] coordinates") will show decimal latitude/longitude you can copy into this calculator.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Latitude', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Longitude', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.en, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'UTC Offset (hours)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Sunrise' }, { name: 'sunset', label: 'Sunset' },
                { name: 'day_length_hours', label: 'Day Length (hours)', precision: 2 },
            ],
        },
        ru: {
            slug: 'vremya-voshoda-i-zahoda-solnca', title: 'Время восхода и захода солнца для любого места | calculatorscope', h1: 'Время восхода и захода солнца для любого места',
            meta_title: 'Калькулятор восхода и захода солнца | Любое место, любая дата',
            meta_description: 'Узнайте время восхода, захода солнца и продолжительность дня для любых координат и даты по стандартной формуле солнечной позиции.',
            short_answer: 'Этот калькулятор находит время восхода и захода солнца, плюс общее количество световых часов, для любого места и даты.',
            intro_text: '<p>Введите широту и долготу места, дату и текущее смещение UTC, чтобы рассчитать восход, закат и общую продолжительность дня по стандартной формуле NOAA/Meeus.</p>',
            key_points: [
                '<b>Широта/долгота:</b> используйте десятичные градусы (например, Нью-Йорк примерно 40,71, -74,01).',
                '<b>Смещение UTC:</b> введите текущее смещение для этого места (учитывая переход на летнее время вручную, если применимо).',
                '<b>Полярные регионы:</b> вблизи полюсов летом/зимой калькулятор сообщит "полярный день" или "полярная ночь".',
            ],
            howto: [
                { question: 'Насколько точно это время?', answer: '<p>Формула точна примерно до минуты для большинства мест и дат — достаточно для планирования.</p>' },
                { question: 'Где найти широту и долготу места?', answer: '<p>Любой картографический сервис покажет десятичные координаты, которые можно скопировать в этот калькулятор.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Широта', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Долгота', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.ru, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'Смещение UTC (часы)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Восход' }, { name: 'sunset', label: 'Закат' },
                { name: 'day_length_hours', label: 'Продолжительность дня (часы)', precision: 2 },
            ],
        },
        lv: {
            slug: 'saullekta-un-saulrieta-laiki', title: 'Saullēkta un Saulrieta Laiki Jebkurai Vietai | calculatorscope', h1: 'Saullēkta un Saulrieta Laiki Jebkurai Vietai',
            meta_title: 'Saullēkta un Saulrieta Kalkulators | Jebkura Vieta, Jebkurš Datums',
            meta_description: 'Uzziniet saullēktu, saulrietu un dienas garumu jebkurām koordinātām un datumam, izmantojot standarta saules pozīcijas formulu.',
            short_answer: 'Šis kalkulators atrod saullēkta un saulrieta laikus, plus kopējās dienasgaismas stundas, jebkurai vietai un datumam.',
            intro_text: '<p>Ievadiet vietas platuma un garuma grādus, datumu un pašreiz spēkā esošo UTC nobīdi, lai aprēķinātu saullēktu, saulrietu un kopējo dienas garumu, izmantojot standarta NOAA/Meeus formulu.</p>',
            key_points: [
                '<b>Platums/garums:</b> izmantojiet decimālgradus (piemēram, Ņujorka ir aptuveni 40,71, -74,01).',
                '<b>UTC nobīde:</b> ievadiet pašreiz spēkā esošo nobīdi šajā vietā.',
                '<b>Polāri reģioni:</b> vasarā/ziemā pie poliem kalkulators ziņos "baltās naktis" vai "polārā nakts".',
            ],
            howto: [
                { question: 'Cik precīzi ir šie laiki?', answer: '<p>Formula ir precīza aptuveni līdz minūtei lielākajai daļai vietu un datumu.</p>' },
                { question: 'Kur atrast vietas platumu un garumu?', answer: '<p>Jebkurš karšu pakalpojums parādīs decimālas koordinātas, kuras varat kopēt šajā kalkulatorā.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Platums', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Garums', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.lv, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'UTC Nobīde (stundas)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Saullēkts' }, { name: 'sunset', label: 'Saulriets' },
                { name: 'day_length_hours', label: 'Dienas Garums (stundas)', precision: 2 },
            ],
        },
        pl: {
            slug: 'godziny-wschodu-i-zachodu-slonca', title: 'Godziny Wschodu i Zachodu Słońca dla Dowolnej Lokalizacji | calculatorscope', h1: 'Godziny Wschodu i Zachodu Słońca dla Dowolnej Lokalizacji',
            meta_title: 'Kalkulator Wschodu i Zachodu Słońca | Dowolna Lokalizacja, Dowolna Data',
            meta_description: 'Znajdź wschód, zachód słońca i długość dnia dla dowolnej szerokości/długości geograficznej i daty, używając standardowego wzoru pozycji słońca.',
            short_answer: 'Ten kalkulator znajduje godziny wschodu i zachodu słońca, plus łączną liczbę godzin światła dziennego, dla dowolnej lokalizacji i daty.',
            intro_text: '<p>Wprowadź szerokość i długość geograficzną lokalizacji, datę i aktualnie obowiązujące przesunięcie UTC, aby obliczyć wschód, zachód słońca i całkowitą długość dnia.</p>',
            key_points: [
                '<b>Szerokość/długość:</b> użyj stopni dziesiętnych (np. Nowy Jork to około 40,71, -74,01).',
                '<b>Przesunięcie UTC:</b> wprowadź przesunięcie aktualnie obowiązujące w tej lokalizacji.',
                '<b>Regiony polarne:</b> latem/zimą blisko biegunów kalkulator zgłosi "biały dzień" lub "noc polarną".',
            ],
            howto: [
                { question: 'Jak dokładne są te godziny?', answer: '<p>Wzór jest dokładny w granicach około minuty dla większości lokalizacji i dat.</p>' },
                { question: 'Gdzie znaleźć szerokość i długość geograficzną lokalizacji?', answer: '<p>Dowolny serwis mapowy pokaże dziesiętne współrzędne, które można skopiować do tego kalkulatora.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Szerokość Geograficzna', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Długość Geograficzna', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.pl, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'Przesunięcie UTC (godziny)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Wschód Słońca' }, { name: 'sunset', label: 'Zachód Słońca' },
                { name: 'day_length_hours', label: 'Długość Dnia (godziny)', precision: 2 },
            ],
        },
        es: {
            slug: 'horas-de-amanecer-y-atardecer', title: 'Horas de Amanecer y Atardecer para Cualquier Ubicación | calculatorscope', h1: 'Horas de Amanecer y Atardecer para Cualquier Ubicación',
            meta_title: 'Calculadora de Amanecer y Atardecer | Cualquier Ubicación, Cualquier Fecha',
            meta_description: 'Encuentra el amanecer, atardecer y duración del día para cualquier latitud/longitud y fecha usando la fórmula estándar de posición solar.',
            short_answer: 'Esta calculadora encuentra las horas de amanecer y atardecer, más el total de horas de luz diurna, para cualquier ubicación y fecha.',
            intro_text: '<p>Introduce la latitud y longitud de una ubicación, una fecha, y el desfase UTC actualmente vigente allí, para calcular el amanecer, atardecer y duración total del día.</p>',
            key_points: [
                '<b>Latitud/longitud:</b> usa grados decimales (p. ej. Nueva York es aproximadamente 40,71, -74,01).',
                '<b>Desfase UTC:</b> introduce el desfase actualmente vigente en esa ubicación.',
                '<b>Regiones polares:</b> cerca de los polos en verano/invierno, la calculadora informará "sol de medianoche" o "noche polar".',
            ],
            howto: [
                { question: '¿Qué tan precisas son estas horas?', answer: '<p>La fórmula es precisa dentro de aproximadamente un minuto para la mayoría de ubicaciones y fechas.</p>' },
                { question: '¿Dónde encuentro la latitud y longitud de una ubicación?', answer: '<p>Cualquier servicio de mapas mostrará coordenadas decimales que puedes copiar en esta calculadora.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Latitud', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Longitud', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.es, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'Desfase UTC (horas)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Amanecer' }, { name: 'sunset', label: 'Atardecer' },
                { name: 'day_length_hours', label: 'Duración del Día (horas)', precision: 2 },
            ],
        },
        fr: {
            slug: 'heures-de-lever-et-coucher-du-soleil', title: 'Heures de Lever et Coucher du Soleil pour Tout Lieu | calculatorscope', h1: 'Heures de Lever et Coucher du Soleil pour Tout Lieu',
            meta_title: 'Calculateur de Lever et Coucher du Soleil | Tout Lieu, Toute Date',
            meta_description: 'Trouvez le lever, le coucher du soleil et la durée du jour pour toute latitude/longitude et date en utilisant la formule standard de position solaire.',
            short_answer: 'Ce calculateur trouve les heures de lever et coucher du soleil, plus le total d’heures de lumière du jour, pour tout lieu et toute date.',
            intro_text: '<p>Entrez la latitude et la longitude d’un lieu, une date, et le décalage UTC actuellement en vigueur là-bas, pour calculer le lever, le coucher du soleil et la durée totale du jour.</p>',
            key_points: [
                '<b>Latitude/longitude :</b> utilisez des degrés décimaux (ex. New York est environ 40,71, -74,01).',
                '<b>Décalage UTC :</b> entrez le décalage actuellement en vigueur à cet endroit.',
                '<b>Régions polaires :</b> près des pôles en été/hiver, le calculateur indiquera "soleil de minuit" ou "nuit polaire".',
            ],
            howto: [
                { question: 'Quelle est la précision de ces heures ?', answer: '<p>La formule est précise à environ une minute près pour la plupart des lieux et dates.</p>' },
                { question: 'Où trouver la latitude et longitude d’un lieu ?', answer: '<p>Tout service de cartographie affichera des coordonnées décimales que vous pouvez copier dans ce calculateur.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Latitude', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Longitude', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.fr, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'Décalage UTC (heures)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Lever du Soleil' }, { name: 'sunset', label: 'Coucher du Soleil' },
                { name: 'day_length_hours', label: 'Durée du Jour (heures)', precision: 2 },
            ],
        },
        it: {
            slug: 'orari-di-alba-e-tramonto', title: 'Orari di Alba e Tramonto per Qualsiasi Località | calculatorscope', h1: 'Orari di Alba e Tramonto per Qualsiasi Località',
            meta_title: 'Calcolatore di Alba e Tramonto | Qualsiasi Località, Qualsiasi Data',
            meta_description: 'Trova alba, tramonto e durata del giorno per qualsiasi latitudine/longitudine e data usando la formula standard della posizione solare.',
            short_answer: 'Questo calcolatore trova gli orari di alba e tramonto, più il totale delle ore di luce diurna, per qualsiasi località e data.',
            intro_text: '<p>Inserisci la latitudine e longitudine di una località, una data e lo scostamento UTC attualmente in vigore lì, per calcolare alba, tramonto e durata totale del giorno.</p>',
            key_points: [
                '<b>Latitudine/longitudine:</b> usa gradi decimali (es. New York è circa 40,71, -74,01).',
                '<b>Scostamento UTC:</b> inserisci lo scostamento attualmente in vigore in quella località.',
                '<b>Regioni polari:</b> vicino ai poli in estate/inverno, il calcolatore segnalerà "sole di mezzanotte" o "notte polare".',
            ],
            howto: [
                { question: 'Quanto sono precisi questi orari?', answer: '<p>La formula è precisa entro circa un minuto per la maggior parte delle località e date.</p>' },
                { question: 'Dove trovo la latitudine e longitudine di una località?', answer: '<p>Qualsiasi servizio di mappe mostrerà coordinate decimali da copiare in questo calcolatore.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Latitudine', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Longitudine', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.it, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'Scostamento UTC (ore)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Alba' }, { name: 'sunset', label: 'Tramonto' },
                { name: 'day_length_hours', label: 'Durata del Giorno (ore)', precision: 2 },
            ],
        },
        de: {
            slug: 'sonnenaufgang-und-sonnenuntergang-zeiten', title: 'Sonnenaufgang- und Sonnenuntergang-Zeiten für Jeden Ort | calculatorscope', h1: 'Sonnenaufgang- und Sonnenuntergang-Zeiten für Jeden Ort',
            meta_title: 'Sonnenaufgang- und Sonnenuntergang-Rechner | Jeder Ort, Jedes Datum',
            meta_description: 'Finden Sie Sonnenaufgang, Sonnenuntergang und Tageslänge für jede Breite/Länge und jedes Datum mit der Standard-Sonnenpositionsformel.',
            short_answer: 'Dieser Rechner findet Sonnenaufgang- und Sonnenuntergangszeiten, plus gesamte Tageslichtstunden, für jeden Ort und jedes Datum.',
            intro_text: '<p>Geben Sie Breiten- und Längengrad eines Ortes, ein Datum und den dort aktuell geltenden UTC-Versatz ein, um Sonnenaufgang, Sonnenuntergang und die gesamte Taglänge zu berechnen.</p>',
            key_points: [
                '<b>Breite/Länge:</b> verwenden Sie Dezimalgrad (z.B. New York ist etwa 40,71, -74,01).',
                '<b>UTC-Versatz:</b> geben Sie den an diesem Ort aktuell geltenden Versatz ein.',
                '<b>Polarregionen:</b> in der Nähe der Pole im Sommer/Winter meldet der Rechner "Mitternachtssonne" oder "Polarnacht".',
            ],
            howto: [
                { question: 'Wie genau sind diese Zeiten?', answer: '<p>Die Formel ist für die meisten Orte und Daten auf etwa eine Minute genau.</p>' },
                { question: 'Wo finde ich Breiten- und Längengrad eines Ortes?', answer: '<p>Jeder Kartendienst zeigt Dezimalkoordinaten, die Sie in diesen Rechner kopieren können.</p>' },
            ],
            inputs: [
                { name: 'latitude', label: 'Breitengrad', type: 'number', min: -90, max: 90, placeholder: '40.7128' },
                { name: 'longitude', label: 'Längengrad', type: 'number', min: -180, max: 180, placeholder: '-74.006' },
                { name: 'date', label: DATE_LABEL.de, type: 'date', default: 'today' },
                { name: 'utc_offset', label: 'UTC-Versatz (Stunden)', type: 'number', min: -12, max: 14, placeholder: '-5' },
            ],
            outputs: [
                { name: 'sunrise', label: 'Sonnenaufgang' }, { name: 'sunset', label: 'Sonnenuntergang' },
                { name: 'day_length_hours', label: 'Taglänge (Stunden)', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1126: Digital Stopwatch Timer Calculator (bespoke live-ticking widget)
// Rendered by StopwatchWidget.tsx, special-cased by tool_id in
// CalculatorWidget.tsx. config_json is a minimal placeholder.
// ============================================================
const stopwatchTool: ToolDef = {
    id: '1126',
    type: 'calculator',
    config_json: { inputs: [], functions: {}, outputs: [] },
    locales: {
        en: {
            slug: 'digital-stopwatch-timer', title: 'Digital Stopwatch Timer Calculator', h1: 'Digital Stopwatch Timer',
            meta_title: 'Digital Stopwatch Timer | Start, Stop, Lap Online',
            meta_description: 'A free online stopwatch with start, stop, lap, and reset — accurate to the centisecond, right in your browser.',
            short_answer: 'This is a live digital stopwatch with start/stop, lap tracking, and reset, accurate to hundredths of a second.',
            intro_text: '<p>Use this stopwatch to time anything — workouts, presentations, cooking, or any activity you need to measure — with lap tracking to record intermediate splits without stopping the clock.</p>',
            key_points: [
                '<b>Precision:</b> displays elapsed time down to the centisecond (hundredths of a second).',
                '<b>Lap tracking:</b> record a lap at any point without stopping the stopwatch, building a list of split times.',
                '<b>Resume support:</b> stop the stopwatch and resume later from where you left off, without losing elapsed time.',
            ],
            howto: [
                { question: 'Does the stopwatch keep running if I switch browser tabs?', answer: '<p>Yes — it continues tracking real elapsed time in the background and updates when you return to the tab.</p>' },
                { question: 'What does Reset do?', answer: '<p>Reset clears the elapsed time and all recorded laps back to zero.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        ru: {
            slug: 'cifrovoj-sekundomer', title: 'Цифровой секундомер таймер', h1: 'Цифровой секундомер',
            meta_title: 'Цифровой секундомер | Старт, стоп, круг онлайн',
            meta_description: 'Бесплатный онлайн-секундомер со стартом, стопом, кругами и сбросом — точность до сотых долей секунды, прямо в браузере.',
            short_answer: 'Это живой цифровой секундомер со стартом/стопом, отслеживанием кругов и сбросом, с точностью до сотых секунды.',
            intro_text: '<p>Используйте этот секундомер, чтобы засекать что угодно — тренировки, презентации, готовку или любую активность.</p>',
            key_points: [
                '<b>Точность:</b> отображает прошедшее время с точностью до сотых секунды.',
                '<b>Отслеживание кругов:</b> записывайте круг в любой момент, не останавливая секундомер.',
                '<b>Поддержка продолжения:</b> остановите секундомер и продолжите позже с того же места.',
            ],
            howto: [
                { question: 'Продолжает ли секундомер работать при переключении вкладок?', answer: '<p>Да — он продолжает отслеживать реальное прошедшее время в фоне.</p>' },
                { question: 'Что делает кнопка Сброс?', answer: '<p>Сброс обнуляет прошедшее время и все записанные круги.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        lv: {
            slug: 'digitalais-hronometrs', title: 'Digitālais Hronometrs Taimeris', h1: 'Digitālais Hronometrs',
            meta_title: 'Digitālais Hronometrs | Sākt, Apturēt, Aplis Tiešsaistē',
            meta_description: 'Bezmaksas tiešsaistes hronometrs ar sākšanu, apturēšanu, apļiem un atiestatīšanu — precizitāte līdz simtdaļai sekundes.',
            short_answer: 'Šis ir dzīvs digitālais hronometrs ar sākšanu/apturēšanu, apļu izsekošanu un atiestatīšanu, precīzs līdz simtdaļai sekundes.',
            intro_text: '<p>Izmantojiet šo hronometru, lai laiku ko vien vēlaties — treniņus, prezentācijas, ēdiena gatavošanu vai jebkuru citu aktivitāti.</p>',
            key_points: [
                '<b>Precizitāte:</b> parāda pagājušo laiku līdz simtdaļai sekundes.',
                '<b>Apļu izsekošana:</b> ierakstiet apli jebkurā brīdī, neapturot hronometru.',
                '<b>Turpināšanas atbalsts:</b> apturiet hronometru un turpiniet vēlāk no tās pašas vietas.',
            ],
            howto: [
                { question: 'Vai hronometrs turpina darboties, ja pārslēdzu pārlūkprogrammas cilnes?', answer: '<p>Jā — tas turpina izsekot reālo pagājušo laiku fonā.</p>' },
                { question: 'Ko dara poga Atiestatīt?', answer: '<p>Atiestatīt notīra pagājušo laiku un visus ierakstītos apļus līdz nullei.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        pl: {
            slug: 'cyfrowy-stoper', title: 'Cyfrowy Stoper Timer', h1: 'Cyfrowy Stoper',
            meta_title: 'Cyfrowy Stoper | Start, Stop, Okrążenie Online',
            meta_description: 'Darmowy stoper online ze startem, stopem, okrążeniami i resetem — dokładność do setnej sekundy, prosto w przeglądarce.',
            short_answer: 'To żywy cyfrowy stoper ze startem/stopem, śledzeniem okrążeń i resetem, dokładny do setnych części sekundy.',
            intro_text: '<p>Użyj tego stopera, aby mierzyć czas czegokolwiek — treningów, prezentacji, gotowania lub dowolnej innej czynności.</p>',
            key_points: [
                '<b>Precyzja:</b> wyświetla upływający czas z dokładnością do setnych sekundy.',
                '<b>Śledzenie okrążeń:</b> zapisz okrążenie w dowolnym momencie, nie zatrzymując stopera.',
                '<b>Wsparcie wznawiania:</b> zatrzymaj stoper i wznów później od tego samego miejsca.',
            ],
            howto: [
                { question: 'Czy stoper działa dalej, jeśli przełączę karty przeglądarki?', answer: '<p>Tak — nadal śledzi rzeczywisty upływający czas w tle.</p>' },
                { question: 'Co robi przycisk Reset?', answer: '<p>Reset czyści upływający czas i wszystkie zapisane okrążenia do zera.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        es: {
            slug: 'cronometro-digital', title: 'Cronómetro Digital Calculadora', h1: 'Cronómetro Digital',
            meta_title: 'Cronómetro Digital | Iniciar, Detener, Vuelta en Línea',
            meta_description: 'Un cronómetro en línea gratuito con iniciar, detener, vuelta y reiniciar — preciso hasta la centésima de segundo, en tu navegador.',
            short_answer: 'Este es un cronómetro digital en vivo con iniciar/detener, seguimiento de vueltas y reinicio, preciso hasta centésimas de segundo.',
            intro_text: '<p>Usa este cronómetro para medir el tiempo de cualquier cosa — entrenamientos, presentaciones, cocina, o cualquier actividad.</p>',
            key_points: [
                '<b>Precisión:</b> muestra el tiempo transcurrido con precisión de centésimas de segundo.',
                '<b>Seguimiento de vueltas:</b> registra una vuelta en cualquier momento sin detener el cronómetro.',
                '<b>Soporte de reanudación:</b> detén el cronómetro y reanuda más tarde desde donde lo dejaste.',
            ],
            howto: [
                { question: '¿El cronómetro sigue funcionando si cambio de pestaña del navegador?', answer: '<p>Sí — continúa siguiendo el tiempo real transcurrido en segundo plano.</p>' },
                { question: '¿Qué hace Reiniciar?', answer: '<p>Reiniciar borra el tiempo transcurrido y todas las vueltas registradas a cero.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        fr: {
            slug: 'chronometre-numerique', title: 'Chronomètre Numérique Calculateur', h1: 'Chronomètre Numérique',
            meta_title: 'Chronomètre Numérique | Démarrer, Arrêter, Tour en Ligne',
            meta_description: 'Un chronomètre en ligne gratuit avec démarrer, arrêter, tour et réinitialiser — précis à la centième de seconde, dans votre navigateur.',
            short_answer: 'Ceci est un chronomètre numérique en direct avec démarrer/arrêter, suivi des tours et réinitialisation, précis à la centième de seconde.',
            intro_text: '<p>Utilisez ce chronomètre pour minuter n’importe quoi — entraînements, présentations, cuisine, ou toute autre activité.</p>',
            key_points: [
                '<b>Précision :</b> affiche le temps écoulé à la centième de seconde près.',
                '<b>Suivi des tours :</b> enregistrez un tour à tout moment sans arrêter le chronomètre.',
                '<b>Support de reprise :</b> arrêtez le chronomètre et reprenez plus tard là où vous vous êtes arrêté.',
            ],
            howto: [
                { question: 'Le chronomètre continue-t-il si je change d’onglet du navigateur ?', answer: '<p>Oui — il continue de suivre le temps réel écoulé en arrière-plan.</p>' },
                { question: 'Que fait Réinitialiser ?', answer: '<p>Réinitialiser efface le temps écoulé et tous les tours enregistrés à zéro.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        it: {
            slug: 'cronometro-digitale', title: 'Cronometro Digitale Calcolatore', h1: 'Cronometro Digitale',
            meta_title: 'Cronometro Digitale | Avvia, Ferma, Giro Online',
            meta_description: 'Un cronometro online gratuito con avvia, ferma, giro e reimposta — preciso al centesimo di secondo, direttamente nel tuo browser.',
            short_answer: 'Questo è un cronometro digitale in diretta con avvia/ferma, tracciamento dei giri e reimpostazione, preciso al centesimo di secondo.',
            intro_text: '<p>Usa questo cronometro per cronometrare qualsiasi cosa — allenamenti, presentazioni, cucina, o qualsiasi attività.</p>',
            key_points: [
                '<b>Precisione:</b> mostra il tempo trascorso con precisione al centesimo di secondo.',
                '<b>Tracciamento dei giri:</b> registra un giro in qualsiasi momento senza fermare il cronometro.',
                '<b>Supporto ripresa:</b> ferma il cronometro e riprendi più tardi da dove avevi interrotto.',
            ],
            howto: [
                { question: 'Il cronometro continua a funzionare se cambio scheda del browser?', answer: '<p>Sì — continua a tracciare il tempo reale trascorso in background.</p>' },
                { question: 'Cosa fa Reimposta?', answer: '<p>Reimposta azzera il tempo trascorso e tutti i giri registrati.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
        de: {
            slug: 'digitale-stoppuhr', title: 'Digitale Stoppuhr Rechner', h1: 'Digitale Stoppuhr',
            meta_title: 'Digitale Stoppuhr | Start, Stopp, Runde Online',
            meta_description: 'Eine kostenlose Online-Stoppuhr mit Start, Stopp, Runde und Zurücksetzen — genau auf die Hundertstelsekunde, direkt in Ihrem Browser.',
            short_answer: 'Dies ist eine live digitale Stoppuhr mit Start/Stopp, Rundenverfolgung und Zurücksetzen, genau auf Hundertstelsekunden.',
            intro_text: '<p>Verwenden Sie diese Stoppuhr, um alles zu timen — Workouts, Präsentationen, Kochen oder jede andere Aktivität.</p>',
            key_points: [
                '<b>Präzision:</b> zeigt die verstrichene Zeit auf die Hundertstelsekunde genau an.',
                '<b>Rundenverfolgung:</b> zeichnen Sie jederzeit eine Runde auf, ohne die Stoppuhr anzuhalten.',
                '<b>Fortsetzungsunterstützung:</b> stoppen Sie die Stoppuhr und setzen Sie später dort fort, wo Sie aufgehört haben.',
            ],
            howto: [
                { question: 'Läuft die Stoppuhr weiter, wenn ich Browser-Tabs wechsle?', answer: '<p>Ja — sie verfolgt die tatsächlich verstrichene Zeit weiterhin im Hintergrund.</p>' },
                { question: 'Was macht Zurücksetzen?', answer: '<p>Zurücksetzen löscht die verstrichene Zeit und alle aufgezeichneten Runden auf null.</p>' },
            ],
            inputs: [],
            outputs: [],
        },
    },
}

// ============================================================
// 1127: Work Hours Calculator
// ============================================================
const workHoursTool: ToolDef = {
    id: '1127',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'start_hour', default: 9 }, { key: 'start_minute', default: 0 }, { key: 'start_ampm', default: 'AM' },
            { key: 'end_hour', default: 5 }, { key: 'end_minute', default: 0 }, { key: 'end_ampm', default: 'PM' },
            { key: 'break_minutes', default: 30 },
        ],
        functions: { result: { type: 'function', functionName: 'workHours', params: { start_hour: 'start_hour', start_minute: 'start_minute', start_ampm: 'start_ampm', end_hour: 'end_hour', end_minute: 'end_minute', end_ampm: 'end_ampm', break_minutes: 'break_minutes' } } },
        outputs: [{ key: 'result' }, { key: 'decimal_hours', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'work-hours-calculator', title: 'Work Hours Calculator', h1: 'Work Hours Calculator',
            meta_title: 'Work Hours Calculator | Shift Hours Minus Break',
            meta_description: 'Calculate total hours worked in a shift, after subtracting your unpaid break, instantly.',
            short_answer: 'This calculator finds total hours worked in a single shift, after subtracting an unpaid break, e.g. 9 AM-5 PM minus 30 min break = 7h 30m.',
            intro_text: '<p>Enter your shift start time, end time, and unpaid break length to find exactly how many hours you worked — useful for timesheets or checking your paycheck.</p>',
            key_points: [
                '<b>Method:</b> raw shift duration (end minus start) minus the break minutes entered.',
                '<b>Overnight shifts:</b> if the end time is earlier than the start time, the calculator assumes the shift wraps past midnight.',
                '<b>Example:</b> 9:00 AM to 5:00 PM (8 hours) minus a 30-minute break = 7 hours 30 minutes.',
            ],
            howto: [
                { question: 'What if I had two separate breaks?', answer: '<p>Add them together and enter the total break minutes (e.g. 15 + 15 = 30).</p>' },
                { question: 'Does this handle overnight shifts?', answer: '<p>Yes — enter a start time like 10:00 PM and end time like 6:00 AM, and the calculator automatically wraps to the next day.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.en, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.en, type: 'select', options: ampmOptions('en'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.en, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.en, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.en, type: 'select', options: ampmOptions('en'), default: 'PM' },
                { name: 'break_minutes', label: 'Unpaid Break (minutes)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Hours Worked' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-rabochih-chasov', title: 'Калькулятор рабочих часов', h1: 'Калькулятор рабочих часов',
            meta_title: 'Калькулятор рабочих часов | Часы смены минус перерыв',
            meta_description: 'Рассчитайте общее количество отработанных часов за смену, после вычета неоплачиваемого перерыва, мгновенно.',
            short_answer: 'Этот калькулятор находит общее количество отработанных часов за одну смену, после вычета неоплачиваемого перерыва.',
            intro_text: '<p>Введите время начала смены, время окончания и продолжительность неоплачиваемого перерыва, чтобы точно узнать, сколько часов вы отработали.</p>',
            key_points: [
                '<b>Метод:</b> общая продолжительность смены (конец минус начало) минус введённые минуты перерыва.',
                '<b>Ночные смены:</b> если время окончания раньше времени начала, калькулятор предполагает переход через полночь.',
                '<b>Пример:</b> 9:00 до 17:00 (8 часов) минус 30-минутный перерыв = 7 часов 30 минут.',
            ],
            howto: [
                { question: 'Что если у меня было два отдельных перерыва?', answer: '<p>Сложите их и введите общее количество минут перерыва (например, 15 + 15 = 30).</p>' },
                { question: 'Обрабатывает ли это ночные смены?', answer: '<p>Да — введите время начала, например 22:00, и окончания, например 6:00, калькулятор автоматически перейдёт на следующий день.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.ru, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.ru, type: 'select', options: ampmOptions('ru'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.ru, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.ru, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.ru, type: 'select', options: ampmOptions('ru'), default: 'PM' },
                { name: 'break_minutes', label: 'Неоплачиваемый перерыв (минуты)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Отработанные часы' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'darba-stundu-kalkulators', title: 'Darba Stundu Kalkulators', h1: 'Darba Stundu Kalkulators',
            meta_title: 'Darba Stundu Kalkulators | Maiņas Stundas Mīnus Pārtraukums',
            meta_description: 'Aprēķiniet kopējās nostrādātās stundas maiņā pēc neapmaksātā pārtraukuma atņemšanas acumirklī.',
            short_answer: 'Šis kalkulators atrod kopējās nostrādātās stundas vienā maiņā pēc neapmaksātā pārtraukuma atņemšanas.',
            intro_text: '<p>Ievadiet maiņas sākuma laiku, beigu laiku un neapmaksātā pārtraukuma ilgumu, lai precīzi uzzinātu, cik stundas nostrādājāt.</p>',
            key_points: [
                '<b>Metode:</b> maiņas kopējais ilgums (beigas mīnus sākums) mīnus ievadītās pārtraukuma minūtes.',
                '<b>Nakts maiņas:</b> ja beigu laiks ir agrāks par sākuma laiku, kalkulators pieņem pāreju pāri pusnaktij.',
                '<b>Piemērs:</b> 9:00 līdz 17:00 (8 stundas) mīnus 30 minūšu pārtraukums = 7 stundas 30 minūtes.',
            ],
            howto: [
                { question: 'Ko darīt, ja man bija divi atsevišķi pārtraukumi?', answer: '<p>Saskaitiet tos kopā un ievadiet kopējo pārtraukuma minūšu skaitu.</p>' },
                { question: 'Vai tas apstrādā nakts maiņas?', answer: '<p>Jā — ievadiet sākuma laiku, piemēram, 22:00, un beigu laiku, piemēram, 6:00.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.lv, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.lv, type: 'select', options: ampmOptions('lv'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.lv, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.lv, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.lv, type: 'select', options: ampmOptions('lv'), default: 'PM' },
                { name: 'break_minutes', label: 'Neapmaksātais Pārtraukums (minūtes)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Nostrādātās Stundas' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-godzin-pracy', title: 'Kalkulator Godzin Pracy', h1: 'Kalkulator Godzin Pracy',
            meta_title: 'Kalkulator Godzin Pracy | Godziny Zmiany Minus Przerwa',
            meta_description: 'Oblicz łączną liczbę przepracowanych godzin w zmianie, po odjęciu nieodpłatnej przerwy, natychmiast.',
            short_answer: 'Ten kalkulator znajduje łączną liczbę przepracowanych godzin w jednej zmianie, po odjęciu nieodpłatnej przerwy.',
            intro_text: '<p>Wprowadź godzinę rozpoczęcia zmiany, godzinę zakończenia i długość nieodpłatnej przerwy, aby dokładnie wiedzieć, ile godzin przepracowałeś.</p>',
            key_points: [
                '<b>Metoda:</b> surowy czas trwania zmiany (koniec minus początek) minus wprowadzone minuty przerwy.',
                '<b>Zmiany nocne:</b> jeśli godzina zakończenia jest wcześniejsza niż rozpoczęcia, kalkulator zakłada przejście przez północ.',
                '<b>Przykład:</b> 9:00 do 17:00 (8 godzin) minus 30-minutowa przerwa = 7 godzin 30 minut.',
            ],
            howto: [
                { question: 'Co jeśli miałem dwie osobne przerwy?', answer: '<p>Zsumuj je i wpisz łączną liczbę minut przerwy.</p>' },
                { question: 'Czy to obsługuje zmiany nocne?', answer: '<p>Tak — wpisz godzinę rozpoczęcia np. 22:00 i zakończenia np. 6:00.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.pl, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.pl, type: 'select', options: ampmOptions('pl'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.pl, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.pl, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.pl, type: 'select', options: ampmOptions('pl'), default: 'PM' },
                { name: 'break_minutes', label: 'Nieodpłatna Przerwa (minuty)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Przepracowane Godziny' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-horas-de-trabajo', title: 'Calculadora de Horas de Trabajo', h1: 'Calculadora de Horas de Trabajo',
            meta_title: 'Calculadora de Horas de Trabajo | Horas de Turno Menos Descanso',
            meta_description: 'Calcula el total de horas trabajadas en un turno, tras restar tu descanso no remunerado, al instante.',
            short_answer: 'Esta calculadora encuentra el total de horas trabajadas en un solo turno, tras restar un descanso no remunerado.',
            intro_text: '<p>Introduce la hora de inicio de tu turno, la hora de fin y la duración del descanso no remunerado para saber exactamente cuántas horas trabajaste.</p>',
            key_points: [
                '<b>Método:</b> duración bruta del turno (fin menos inicio) menos los minutos de descanso introducidos.',
                '<b>Turnos nocturnos:</b> si la hora de fin es anterior a la de inicio, la calculadora asume que el turno pasa la medianoche.',
                '<b>Ejemplo:</b> 9:00 a 17:00 (8 horas) menos un descanso de 30 minutos = 7 horas 30 minutos.',
            ],
            howto: [
                { question: '¿Qué pasa si tuve dos descansos separados?', answer: '<p>Súmalos e introduce el total de minutos de descanso.</p>' },
                { question: '¿Esto maneja turnos nocturnos?', answer: '<p>Sí — introduce una hora de inicio como 22:00 y de fin como 6:00.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.es, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.es, type: 'select', options: ampmOptions('es'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.es, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.es, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.es, type: 'select', options: ampmOptions('es'), default: 'PM' },
                { name: 'break_minutes', label: 'Descanso No Remunerado (minutos)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Horas Trabajadas' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-dheures-de-travail', title: 'Calculateur d’Heures de Travail', h1: 'Calculateur d’Heures de Travail',
            meta_title: 'Calculateur d’Heures de Travail | Heures de Quart Moins Pause',
            meta_description: 'Calculez le total d’heures travaillées dans un quart, après déduction de votre pause non rémunérée, instantanément.',
            short_answer: 'Ce calculateur trouve le total d’heures travaillées dans un seul quart, après déduction d’une pause non rémunérée.',
            intro_text: '<p>Entrez l’heure de début de votre quart, l’heure de fin et la durée de la pause non rémunérée pour savoir exactement combien d’heures vous avez travaillé.</p>',
            key_points: [
                '<b>Méthode :</b> durée brute du quart (fin moins début) moins les minutes de pause entrées.',
                '<b>Quarts de nuit :</b> si l’heure de fin est antérieure à celle de début, le calculateur suppose que le quart passe minuit.',
                '<b>Exemple :</b> 9:00 à 17:00 (8 heures) moins une pause de 30 minutes = 7 heures 30 minutes.',
            ],
            howto: [
                { question: 'Que faire si j’ai eu deux pauses séparées ?', answer: '<p>Additionnez-les et entrez le total des minutes de pause.</p>' },
                { question: 'Cela gère-t-il les quarts de nuit ?', answer: '<p>Oui — entrez une heure de début comme 22:00 et de fin comme 6:00.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.fr, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.fr, type: 'select', options: ampmOptions('fr'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.fr, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.fr, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.fr, type: 'select', options: ampmOptions('fr'), default: 'PM' },
                { name: 'break_minutes', label: 'Pause Non Rémunérée (minutes)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Heures Travaillées' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-ore-di-lavoro', title: 'Calcolatore di Ore di Lavoro', h1: 'Calcolatore di Ore di Lavoro',
            meta_title: 'Calcolatore di Ore di Lavoro | Ore di Turno Meno Pausa',
            meta_description: 'Calcola il totale delle ore lavorate in un turno, dopo aver sottratto la pausa non retribuita, istantaneamente.',
            short_answer: 'Questo calcolatore trova il totale delle ore lavorate in un singolo turno, dopo aver sottratto una pausa non retribuita.',
            intro_text: '<p>Inserisci l’orario di inizio del turno, l’orario di fine e la durata della pausa non retribuita per sapere esattamente quante ore hai lavorato.</p>',
            key_points: [
                '<b>Metodo:</b> durata grezza del turno (fine meno inizio) meno i minuti di pausa inseriti.',
                '<b>Turni notturni:</b> se l’orario di fine è precedente a quello di inizio, il calcolatore presume che il turno passi la mezzanotte.',
                '<b>Esempio:</b> 9:00 alle 17:00 (8 ore) meno una pausa di 30 minuti = 7 ore 30 minuti.',
            ],
            howto: [
                { question: 'Cosa succede se ho avuto due pause separate?', answer: '<p>Sommale e inserisci il totale dei minuti di pausa.</p>' },
                { question: 'Questo gestisce i turni notturni?', answer: '<p>Sì — inserisci un orario di inizio come 22:00 e di fine come 6:00.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.it, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.it, type: 'select', options: ampmOptions('it'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.it, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.it, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.it, type: 'select', options: ampmOptions('it'), default: 'PM' },
                { name: 'break_minutes', label: 'Pausa Non Retribuita (minuti)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Ore Lavorate' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'arbeitsstunden-rechner', title: 'Arbeitsstunden-Rechner', h1: 'Arbeitsstunden-Rechner',
            meta_title: 'Arbeitsstunden-Rechner | Schichtstunden Minus Pause',
            meta_description: 'Berechnen Sie die gesamten in einer Schicht gearbeiteten Stunden nach Abzug Ihrer unbezahlten Pause, sofort.',
            short_answer: 'Dieser Rechner findet die gesamten in einer einzelnen Schicht gearbeiteten Stunden nach Abzug einer unbezahlten Pause.',
            intro_text: '<p>Geben Sie Ihre Schichtstart-, Schichtendzeit und die Länge der unbezahlten Pause ein, um genau zu erfahren, wie viele Stunden Sie gearbeitet haben.</p>',
            key_points: [
                '<b>Methode:</b> reine Schichtdauer (Ende minus Start) minus die eingegebenen Pausenminuten.',
                '<b>Nachtschichten:</b> wenn die Endzeit vor der Startzeit liegt, geht der Rechner davon aus, dass die Schicht über Mitternacht geht.',
                '<b>Beispiel:</b> 9:00 bis 17:00 (8 Stunden) minus 30 Minuten Pause = 7 Stunden 30 Minuten.',
            ],
            howto: [
                { question: 'Was, wenn ich zwei separate Pausen hatte?', answer: '<p>Addieren Sie diese und geben Sie die Gesamtpausenminuten ein.</p>' },
                { question: 'Werden Nachtschichten unterstützt?', answer: '<p>Ja — geben Sie eine Startzeit wie 22:00 und Endzeit wie 6:00 ein.</p>' },
            ],
            inputs: [
                { name: 'start_hour', label: HOUR_LABEL.de, type: 'number', min: 1, max: 12, placeholder: '9' },
                { name: 'start_minute', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'start_ampm', label: AMPM_LABEL.de, type: 'select', options: ampmOptions('de'), default: 'AM' },
                { name: 'end_hour', label: HOUR_LABEL.de, type: 'number', min: 1, max: 12, placeholder: '5' },
                { name: 'end_minute', label: MINUTE_LABEL.de, type: 'number', min: 0, max: 59, placeholder: '0' },
                { name: 'end_ampm', label: AMPM_LABEL.de, type: 'select', options: ampmOptions('de'), default: 'PM' },
                { name: 'break_minutes', label: 'Unbezahlte Pause (Minuten)', type: 'number', min: 0, max: 480, placeholder: '30' },
            ],
            outputs: [{ name: 'result', label: 'Gearbeitete Stunden' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.de, precision: 4 }],
        },
    },
}

// ============================================================
// 1128: Time Clock Calculator | Clock-In Clock-Out (up to 3 in/out pairs)
// ============================================================
function clockPairInputs(lang: string, n: number) {
    const inLabel: Record<string, string> = { en: `Clock In ${n}`, ru: `Вход ${n}`, de: `Kommen ${n}`, es: `Entrada ${n}`, fr: `Arrivée ${n}`, it: `Entrata ${n}`, pl: `Wejście ${n}`, lv: `Ienākšana ${n}` }
    const outLabel: Record<string, string> = { en: `Clock Out ${n}`, ru: `Выход ${n}`, de: `Gehen ${n}`, es: `Salida ${n}`, fr: `Départ ${n}`, it: `Uscita ${n}`, pl: `Wyjście ${n}`, lv: `Iziešana ${n}` }
    return [
        { name: `in${n}_hour`, label: `${inLabel[lang] || inLabel.en} - ${HOUR_LABEL[lang] || HOUR_LABEL.en}`, type: 'number' as const, min: 1, max: 12, default: n === 1 ? 9 : 12 },
        { name: `in${n}_minute`, label: `${inLabel[lang] || inLabel.en} - ${MINUTE_LABEL[lang] || MINUTE_LABEL.en}`, type: 'number' as const, min: 0, max: 59, default: 0 },
        { name: `in${n}_ampm`, label: `${inLabel[lang] || inLabel.en} - AM/PM`, type: 'select' as const, options: ampmOptions(lang), default: n === 1 ? 'AM' : 'PM' },
        { name: `out${n}_hour`, label: `${outLabel[lang] || outLabel.en} - ${HOUR_LABEL[lang] || HOUR_LABEL.en}`, type: 'number' as const, min: 1, max: 12, default: n === 1 ? 12 : 12 },
        { name: `out${n}_minute`, label: `${outLabel[lang] || outLabel.en} - ${MINUTE_LABEL[lang] || MINUTE_LABEL.en}`, type: 'number' as const, min: 0, max: 59, default: 0 },
        { name: `out${n}_ampm`, label: `${outLabel[lang] || outLabel.en} - AM/PM`, type: 'select' as const, options: ampmOptions(lang), default: n === 1 ? 'PM' : 'PM' },
    ]
}
const clockInOutTool: ToolDef = {
    id: '1128',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'in1_hour', default: 9 }, { key: 'in1_minute', default: 0 }, { key: 'in1_ampm', default: 'AM' },
            { key: 'out1_hour', default: 12 }, { key: 'out1_minute', default: 0 }, { key: 'out1_ampm', default: 'PM' },
            { key: 'in2_hour', default: 1 }, { key: 'in2_minute', default: 0 }, { key: 'in2_ampm', default: 'PM' },
            { key: 'out2_hour', default: 5 }, { key: 'out2_minute', default: 0 }, { key: 'out2_ampm', default: 'PM' },
            { key: 'in3_hour', default: 12 }, { key: 'in3_minute', default: 0 }, { key: 'in3_ampm', default: 'PM' },
            { key: 'out3_hour', default: 12 }, { key: 'out3_minute', default: 0 }, { key: 'out3_ampm', default: 'PM' },
        ],
        functions: {
            result: {
                type: 'function', functionName: 'clockInOutTotal', params: {
                    in1_hour: 'in1_hour', in1_minute: 'in1_minute', in1_ampm: 'in1_ampm', out1_hour: 'out1_hour', out1_minute: 'out1_minute', out1_ampm: 'out1_ampm',
                    in2_hour: 'in2_hour', in2_minute: 'in2_minute', in2_ampm: 'in2_ampm', out2_hour: 'out2_hour', out2_minute: 'out2_minute', out2_ampm: 'out2_ampm',
                    in3_hour: 'in3_hour', in3_minute: 'in3_minute', in3_ampm: 'in3_ampm', out3_hour: 'out3_hour', out3_minute: 'out3_minute', out3_ampm: 'out3_ampm',
                }
            }
        },
        outputs: [{ key: 'result' }, { key: 'decimal_hours', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'time-clock-calculator-clock-in-clock-out', title: 'Time Clock Calculator | Clock-In Clock-Out', h1: 'Time Clock Calculator | Clock-In Clock-Out',
            meta_title: 'Time Clock Calculator | Sum Up to 3 Clock-In/Clock-Out Pairs',
            meta_description: 'Add up to three separate clock-in and clock-out time pairs to find your total hours worked in a day.',
            short_answer: 'This calculator sums up to three clock-in/clock-out pairs to find your total hours worked, useful when you clocked in and out multiple times in a day.',
            intro_text: '<p>If you clocked in and out more than once in a day (e.g. morning shift, lunch break, afternoon shift), enter each pair of times to get your total hours worked across all of them.</p>',
            key_points: [
                '<b>Unused pairs:</b> leave a pair\'s clock-in and clock-out at the same time (e.g. 12:00 PM to 12:00 PM) if you only worked one or two periods.',
                '<b>Method:</b> each pair\'s duration is calculated separately, then all pairs are summed together.',
                '<b>Example:</b> 9 AM-12 PM plus 1 PM-5 PM = 3 hours + 4 hours = 7 hours total.',
            ],
            howto: [
                { question: 'I only worked one continuous shift — how do I use this?', answer: '<p>Enter your single shift in the first pair, and leave the second and third pairs\' in/out times identical (contributing zero).</p>' },
                { question: 'Can I use this for a split shift with a lunch break?', answer: '<p>Yes — enter the morning period as pair 1 and the afternoon period as pair 2.</p>' },
            ],
            inputs: [...clockPairInputs('en', 1), ...clockPairInputs('en', 2), ...clockPairInputs('en', 3)],
            outputs: [{ name: 'result', label: 'Total Hours Worked' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-tabelya-vhod-vyhod', title: 'Калькулятор табеля | Вход-выход', h1: 'Калькулятор табеля | Вход-выход',
            meta_title: 'Калькулятор табеля учёта времени | Суммирование до 3 пар вход/выход',
            meta_description: 'Сложите до трёх отдельных пар времени входа и выхода, чтобы найти общее количество отработанных часов за день.',
            short_answer: 'Этот калькулятор суммирует до трёх пар вход/выход, чтобы найти общее количество отработанных часов.',
            intro_text: '<p>Если вы отмечались более одного раза в день, введите каждую пару времени, чтобы получить общее количество отработанных часов.</p>',
            key_points: [
                '<b>Неиспользуемые пары:</b> оставьте вход и выход пары одинаковыми, если вы работали только один или два периода.',
                '<b>Метод:</b> длительность каждой пары рассчитывается отдельно, затем все пары суммируются.',
                '<b>Пример:</b> 9:00-12:00 плюс 13:00-17:00 = 3 часа + 4 часа = 7 часов всего.',
            ],
            howto: [
                { question: 'Я работал только одну непрерывную смену — как это использовать?', answer: '<p>Введите вашу смену в первую пару, оставьте вторую и третью пары с одинаковым временем.</p>' },
                { question: 'Могу ли я использовать это для смены с обеденным перерывом?', answer: '<p>Да — введите утренний период как пару 1, а дневной период как пару 2.</p>' },
            ],
            inputs: [...clockPairInputs('ru', 1), ...clockPairInputs('ru', 2), ...clockPairInputs('ru', 3)],
            outputs: [{ name: 'result', label: 'Всего отработано часов' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'darba-laika-kalkulators-ienakšana-izeja', title: 'Darba Laika Kalkulators | Ienākšana-Iziešana', h1: 'Darba Laika Kalkulators | Ienākšana-Iziešana',
            meta_title: 'Darba Laika Kalkulators | Summē līdz 3 Ienākšanas/Iziešanas Pāriem',
            meta_description: 'Saskaitiet līdz trīs atsevišķiem ienākšanas un iziešanas laika pāriem, lai atrastu kopējās nostrādātās stundas dienā.',
            short_answer: 'Šis kalkulators summē līdz trīs ienākšanas/iziešanas pāriem, lai atrastu kopējās nostrādātās stundas.',
            intro_text: '<p>Ja jūs atzīmējāties vairāk nekā vienu reizi dienā, ievadiet katru laika pāri, lai iegūtu kopējās nostrādātās stundas.</p>',
            key_points: [
                '<b>Neizmantoti pāri:</b> atstājiet pāra ienākšanu un iziešanu vienādu, ja strādājāt tikai vienu vai divus periodus.',
                '<b>Metode:</b> katra pāra ilgums tiek aprēķināts atsevišķi, tad visi pāri tiek summēti.',
                '<b>Piemērs:</b> 9:00-12:00 plus 13:00-17:00 = 3 stundas + 4 stundas = 7 stundas kopā.',
            ],
            howto: [
                { question: 'Es strādāju tikai vienu nepārtrauktu maiņu — kā to izmantot?', answer: '<p>Ievadiet savu maiņu pirmajā pārī, atstājiet otro un trešo pāri ar vienādu laiku.</p>' },
                { question: 'Vai varu izmantot to sadalītai maiņai ar pusdienu pārtraukumu?', answer: '<p>Jā — ievadiet rīta periodu kā 1. pāri, pēcpusdienas periodu kā 2. pāri.</p>' },
            ],
            inputs: [...clockPairInputs('lv', 1), ...clockPairInputs('lv', 2), ...clockPairInputs('lv', 3)],
            outputs: [{ name: 'result', label: 'Kopā Nostrādātās Stundas' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-czasu-pracy-wejscie-wyjscie', title: 'Kalkulator Czasu Pracy | Wejście-Wyjście', h1: 'Kalkulator Czasu Pracy | Wejście-Wyjście',
            meta_title: 'Kalkulator Rejestracji Czasu Pracy | Suma do 3 Par Wejście/Wyjście',
            meta_description: 'Zsumuj do trzech osobnych par czasu wejścia i wyjścia, aby znaleźć łączną liczbę przepracowanych godzin w ciągu dnia.',
            short_answer: 'Ten kalkulator sumuje do trzech par wejście/wyjście, aby znaleźć łączną liczbę przepracowanych godzin.',
            intro_text: '<p>Jeśli rejestrowałeś się więcej niż raz dziennie, wpisz każdą parę czasów, aby uzyskać łączną liczbę przepracowanych godzin.</p>',
            key_points: [
                '<b>Nieużywane pary:</b> zostaw wejście i wyjście pary takie same, jeśli pracowałeś tylko jeden lub dwa okresy.',
                '<b>Metoda:</b> czas trwania każdej pary jest obliczany osobno, a następnie wszystkie pary są sumowane.',
                '<b>Przykład:</b> 9:00-12:00 plus 13:00-17:00 = 3 godziny + 4 godziny = 7 godzin łącznie.',
            ],
            howto: [
                { question: 'Pracowałem tylko jedną ciągłą zmianę — jak tego użyć?', answer: '<p>Wpisz swoją zmianę w pierwszej parze, zostaw drugą i trzecią parę z identycznym czasem.</p>' },
                { question: 'Czy mogę użyć tego do zmiany podzielonej przerwą obiadową?', answer: '<p>Tak — wpisz okres poranny jako parę 1, a popołudniowy jako parę 2.</p>' },
            ],
            inputs: [...clockPairInputs('pl', 1), ...clockPairInputs('pl', 2), ...clockPairInputs('pl', 3)],
            outputs: [{ name: 'result', label: 'Łącznie Przepracowane Godziny' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-reloj-entrada-salida', title: 'Calculadora de Reloj | Entrada-Salida', h1: 'Calculadora de Reloj | Entrada-Salida',
            meta_title: 'Calculadora de Reloj de Fichaje | Suma hasta 3 Pares de Entrada/Salida',
            meta_description: 'Suma hasta tres pares separados de hora de entrada y salida para encontrar el total de horas trabajadas en un día.',
            short_answer: 'Esta calculadora suma hasta tres pares de entrada/salida para encontrar el total de horas trabajadas.',
            intro_text: '<p>Si fichaste entrada y salida más de una vez en un día, introduce cada par de horas para obtener el total de horas trabajadas.</p>',
            key_points: [
                '<b>Pares no usados:</b> deja la entrada y salida de un par iguales si solo trabajaste uno o dos períodos.',
                '<b>Método:</b> la duración de cada par se calcula por separado, luego todos los pares se suman.',
                '<b>Ejemplo:</b> 9:00-12:00 más 13:00-17:00 = 3 horas + 4 horas = 7 horas en total.',
            ],
            howto: [
                { question: 'Solo trabajé un turno continuo, ¿cómo lo uso?', answer: '<p>Introduce tu turno único en el primer par, deja el segundo y tercer par con horas idénticas.</p>' },
                { question: '¿Puedo usar esto para un turno partido con descanso de comida?', answer: '<p>Sí — introduce el período de mañana como par 1 y el de tarde como par 2.</p>' },
            ],
            inputs: [...clockPairInputs('es', 1), ...clockPairInputs('es', 2), ...clockPairInputs('es', 3)],
            outputs: [{ name: 'result', label: 'Total de Horas Trabajadas' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-pointeuse-arrivee-depart', title: 'Calculateur de Pointeuse | Arrivée-Départ', h1: 'Calculateur de Pointeuse | Arrivée-Départ',
            meta_title: 'Calculateur de Pointeuse | Somme jusqu’à 3 Paires Arrivée/Départ',
            meta_description: 'Additionnez jusqu’à trois paires distinctes d’heures d’arrivée et de départ pour trouver le total d’heures travaillées en une journée.',
            short_answer: 'Ce calculateur additionne jusqu’à trois paires arrivée/départ pour trouver le total d’heures travaillées.',
            intro_text: '<p>Si vous avez pointé votre arrivée et votre départ plus d’une fois dans une journée, entrez chaque paire d’heures pour obtenir le total d’heures travaillées.</p>',
            key_points: [
                '<b>Paires inutilisées :</b> laissez l’arrivée et le départ d’une paire identiques si vous n’avez travaillé qu’une ou deux périodes.',
                '<b>Méthode :</b> la durée de chaque paire est calculée séparément, puis toutes les paires sont additionnées.',
                '<b>Exemple :</b> 9:00-12:00 plus 13:00-17:00 = 3 heures + 4 heures = 7 heures au total.',
            ],
            howto: [
                { question: 'Je n’ai travaillé qu’un seul quart continu, comment l’utiliser ?', answer: '<p>Entrez votre quart unique dans la première paire, laissez les deuxième et troisième paires avec des heures identiques.</p>' },
                { question: 'Puis-je utiliser ceci pour un quart divisé avec pause déjeuner ?', answer: '<p>Oui — entrez la période du matin comme paire 1 et celle de l’après-midi comme paire 2.</p>' },
            ],
            inputs: [...clockPairInputs('fr', 1), ...clockPairInputs('fr', 2), ...clockPairInputs('fr', 3)],
            outputs: [{ name: 'result', label: 'Total d’Heures Travaillées' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-orologio-marcatempo-entrata-uscita', title: 'Calcolatore Orologio Marcatempo | Entrata-Uscita', h1: 'Calcolatore Orologio Marcatempo | Entrata-Uscita',
            meta_title: 'Calcolatore Marcatempo | Somma fino a 3 Coppie Entrata/Uscita',
            meta_description: 'Somma fino a tre coppie separate di orari di entrata e uscita per trovare il totale delle ore lavorate in un giorno.',
            short_answer: 'Questo calcolatore somma fino a tre coppie entrata/uscita per trovare il totale delle ore lavorate.',
            intro_text: '<p>Se hai timbrato entrata e uscita più di una volta in un giorno, inserisci ogni coppia di orari per ottenere il totale delle ore lavorate.</p>',
            key_points: [
                '<b>Coppie non usate:</b> lascia entrata e uscita di una coppia uguali se hai lavorato solo uno o due periodi.',
                '<b>Metodo:</b> la durata di ogni coppia viene calcolata separatamente, poi tutte le coppie vengono sommate.',
                '<b>Esempio:</b> 9:00-12:00 più 13:00-17:00 = 3 ore + 4 ore = 7 ore totali.',
            ],
            howto: [
                { question: 'Ho lavorato solo un turno continuo, come lo uso?', answer: '<p>Inserisci il tuo turno unico nella prima coppia, lascia la seconda e terza coppia con orari identici.</p>' },
                { question: 'Posso usarlo per un turno spezzato con pausa pranzo?', answer: '<p>Sì — inserisci il periodo mattutino come coppia 1 e quello pomeridiano come coppia 2.</p>' },
            ],
            inputs: [...clockPairInputs('it', 1), ...clockPairInputs('it', 2), ...clockPairInputs('it', 3)],
            outputs: [{ name: 'result', label: 'Totale Ore Lavorate' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'stempeluhr-rechner-kommen-gehen', title: 'Stempeluhr-Rechner | Kommen-Gehen', h1: 'Stempeluhr-Rechner | Kommen-Gehen',
            meta_title: 'Stempeluhr-Rechner | Summe von bis zu 3 Kommen/Gehen-Paaren',
            meta_description: 'Addieren Sie bis zu drei separate Kommen- und Gehen-Zeitpaare, um Ihre gesamten Arbeitsstunden an einem Tag zu finden.',
            short_answer: 'Dieser Rechner summiert bis zu drei Kommen/Gehen-Paare, um Ihre gesamten Arbeitsstunden zu finden.',
            intro_text: '<p>Wenn Sie an einem Tag mehr als einmal ein- und ausgestempelt haben, geben Sie jedes Zeitpaar ein, um Ihre gesamten Arbeitsstunden zu erhalten.</p>',
            key_points: [
                '<b>Ungenutzte Paare:</b> lassen Sie Kommen und Gehen eines Paares gleich, wenn Sie nur einen oder zwei Zeiträume gearbeitet haben.',
                '<b>Methode:</b> die Dauer jedes Paares wird separat berechnet, dann werden alle Paare summiert.',
                '<b>Beispiel:</b> 9:00-12:00 plus 13:00-17:00 = 3 Stunden + 4 Stunden = 7 Stunden insgesamt.',
            ],
            howto: [
                { question: 'Ich habe nur eine durchgehende Schicht gearbeitet — wie nutze ich das?', answer: '<p>Geben Sie Ihre einzelne Schicht im ersten Paar ein, lassen Sie das zweite und dritte Paar mit identischen Zeiten.</p>' },
                { question: 'Kann ich dies für eine geteilte Schicht mit Mittagspause verwenden?', answer: '<p>Ja — geben Sie den Vormittag als Paar 1 und den Nachmittag als Paar 2 ein.</p>' },
            ],
            inputs: [...clockPairInputs('de', 1), ...clockPairInputs('de', 2), ...clockPairInputs('de', 3)],
            outputs: [{ name: 'result', label: 'Gesamte Gearbeitete Stunden' }, { name: 'decimal_hours', label: DECIMAL_HOURS_RESULT_LABEL.de, precision: 4 }],
        },
    },
}

// ============================================================
// 1129: Work Shift Coverage Calculator
// ============================================================
function shiftInputs(lang: string) {
    const reqStart: Record<string, string> = { en: 'Required Start (24h)', ru: 'Начало требования (24ч)', de: 'Erforderlicher Start (24h)', es: 'Inicio Requerido (24h)', fr: 'Début Requis (24h)', it: 'Inizio Richiesto (24h)', pl: 'Wymagany Start (24h)', lv: 'Nepieciešamais Sākums (24h)' }
    const reqEnd: Record<string, string> = { en: 'Required End (24h)', ru: 'Конец требования (24ч)', de: 'Erforderliches Ende (24h)', es: 'Fin Requerido (24h)', fr: 'Fin Requise (24h)', it: 'Fine Richiesta (24h)', pl: 'Wymagany Koniec (24h)', lv: 'Nepieciešamās Beigas (24h)' }
    const shiftStart: Record<string, string> = { en: 'Start (24h)', ru: 'Начало (24ч)', de: 'Start (24h)', es: 'Inicio (24h)', fr: 'Début (24h)', it: 'Inizio (24h)', pl: 'Start (24h)', lv: 'Sākums (24h)' }
    const shiftEnd: Record<string, string> = { en: 'End (24h)', ru: 'Конец (24ч)', de: 'Ende (24h)', es: 'Fin (24h)', fr: 'Fin (24h)', it: 'Fine (24h)', pl: 'Koniec (24h)', lv: 'Beigas (24h)' }
    const shift: Record<string, string> = { en: 'Shift', ru: 'Смена', de: 'Schicht', es: 'Turno', fr: 'Quart', it: 'Turno', pl: 'Zmiana', lv: 'Maiņa' }
    const g = (rec: Record<string, string>) => rec[lang] || rec.en
    return [
        { name: 'required_start_hour', label: g(reqStart), type: 'number' as const, min: 0, max: 24, default: 8 },
        { name: 'required_end_hour', label: g(reqEnd), type: 'number' as const, min: 0, max: 24, default: 20 },
        { name: 'shift1_start_hour', label: `${g(shift)} 1 ${g(shiftStart)}`, type: 'number' as const, min: 0, max: 24, default: 8 },
        { name: 'shift1_end_hour', label: `${g(shift)} 1 ${g(shiftEnd)}`, type: 'number' as const, min: 0, max: 24, default: 14 },
        { name: 'shift2_start_hour', label: `${g(shift)} 2 ${g(shiftStart)}`, type: 'number' as const, min: 0, max: 24, default: 13 },
        { name: 'shift2_end_hour', label: `${g(shift)} 2 ${g(shiftEnd)}`, type: 'number' as const, min: 0, max: 24, default: 20 },
        { name: 'shift3_start_hour', label: `${g(shift)} 3 ${g(shiftStart)}`, type: 'number' as const, min: 0, max: 24, default: 0 },
        { name: 'shift3_end_hour', label: `${g(shift)} 3 ${g(shiftEnd)}`, type: 'number' as const, min: 0, max: 24, default: 0 },
    ]
}
const shiftCoverageTool: ToolDef = {
    id: '1129',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'required_start_hour', default: 8 }, { key: 'required_end_hour', default: 20 },
            { key: 'shift1_start_hour', default: 8 }, { key: 'shift1_end_hour', default: 14 },
            { key: 'shift2_start_hour', default: 13 }, { key: 'shift2_end_hour', default: 20 },
            { key: 'shift3_start_hour', default: 0 }, { key: 'shift3_end_hour', default: 0 },
        ],
        functions: {
            result: {
                type: 'function', functionName: 'shiftCoverage', params: {
                    required_start_hour: 'required_start_hour', required_end_hour: 'required_end_hour',
                    shift1_start_hour: 'shift1_start_hour', shift1_end_hour: 'shift1_end_hour',
                    shift2_start_hour: 'shift2_start_hour', shift2_end_hour: 'shift2_end_hour',
                    shift3_start_hour: 'shift3_start_hour', shift3_end_hour: 'shift3_end_hour',
                }
            }
        },
        outputs: [{ key: 'covered_hours', precision: 2 }, { key: 'gap_hours', precision: 2 }, { key: 'is_fully_covered' }],
    },
    locales: {
        en: {
            slug: 'work-shift-coverage-calculator', title: 'Work Shift Coverage Calculator', h1: 'Work Shift Coverage Calculator',
            meta_title: 'Work Shift Coverage Calculator | Check Schedule Gaps',
            meta_description: 'Check whether up to 3 shifts fully cover a required time window, and find any coverage gaps.',
            short_answer: 'This calculator checks whether up to three shifts fully cover a required time window, and reports any gap hours.',
            intro_text: '<p>Enter a required coverage window (e.g. 8:00-20:00) and up to three shifts (using 24-hour times), and this tool tells you the total covered hours, any gap hours left uncovered, and whether coverage is complete.</p>',
            key_points: [
                '<b>Overlapping shifts:</b> overlapping or adjacent shifts are merged automatically so hours aren\'t double-counted.',
                '<b>Unused shifts:</b> set a shift\'s start and end to the same value (e.g. 0 and 0) if you only need one or two shifts.',
                '<b>24-hour format:</b> enter times as decimal hours (e.g. 13.5 for 1:30 PM), using the 0-24 scale.',
            ],
            howto: [
                { question: 'What if two shifts overlap?', answer: '<p>Overlapping time is only counted once — the calculator merges overlapping intervals before summing covered hours.</p>' },
                { question: 'How do I check a single 8-hour shift?', answer: '<p>Enter it as Shift 1, and leave Shift 2 and Shift 3 both set to 0 and 0.</p>' },
            ],
            inputs: shiftInputs('en'),
            outputs: [
                { name: 'covered_hours', label: 'Covered Hours', precision: 2 },
                { name: 'gap_hours', label: 'Gap Hours', precision: 2 },
                { name: 'is_fully_covered', label: 'Fully Covered?' },
            ],
        },
        ru: {
            slug: 'kalkulyator-pokrytiya-smen', title: 'Калькулятор покрытия смен', h1: 'Калькулятор покрытия смен',
            meta_title: 'Калькулятор покрытия смен | Проверка пробелов в расписании',
            meta_description: 'Проверьте, полностью ли до 3 смен покрывают требуемое временное окно, и найдите пробелы в покрытии.',
            short_answer: 'Этот калькулятор проверяет, полностью ли до трёх смен покрывают требуемое временное окно, и сообщает о часах пробелов.',
            intro_text: '<p>Введите требуемое окно покрытия (например, 8:00-20:00) и до трёх смен (в 24-часовом формате), и этот инструмент покажет общее количество покрытых часов, пробелы и полноту покрытия.</p>',
            key_points: [
                '<b>Перекрывающиеся смены:</b> перекрывающиеся или соседние смены автоматически объединяются.',
                '<b>Неиспользуемые смены:</b> установите начало и конец смены на одинаковое значение (например, 0 и 0), если нужны только одна или две смены.',
                '<b>24-часовой формат:</b> вводите время как десятичные часы (например, 13,5 для 13:30).',
            ],
            howto: [
                { question: 'Что если две смены перекрываются?', answer: '<p>Перекрывающееся время считается только один раз.</p>' },
                { question: 'Как проверить одну 8-часовую смену?', answer: '<p>Введите её как Смена 1, оставьте Смену 2 и Смену 3 на 0 и 0.</p>' },
            ],
            inputs: shiftInputs('ru'),
            outputs: [
                { name: 'covered_hours', label: 'Покрытые часы', precision: 2 },
                { name: 'gap_hours', label: 'Часы пробела', precision: 2 },
                { name: 'is_fully_covered', label: 'Полностью покрыто?' },
            ],
        },
        lv: {
            slug: 'darba-mainu-parklajuma-kalkulators', title: 'Darba Maiņu Pārklājuma Kalkulators', h1: 'Darba Maiņu Pārklājuma Kalkulators',
            meta_title: 'Darba Maiņu Pārklājuma Kalkulators | Pārbaudiet Grafika Robus',
            meta_description: 'Pārbaudiet, vai līdz 3 maiņas pilnībā pārklāj nepieciešamo laika logu, un atrodiet pārklājuma robus.',
            short_answer: 'Šis kalkulators pārbauda, vai līdz trīs maiņas pilnībā pārklāj nepieciešamo laika logu, un ziņo par robu stundām.',
            intro_text: '<p>Ievadiet nepieciešamo pārklājuma logu (piemēram, 8:00-20:00) un līdz trīs maiņām (24 stundu formātā), un šis rīks parādīs kopējās pārklātās stundas, robus un pārklājuma pilnīgumu.</p>',
            key_points: [
                '<b>Pārklājošās maiņas:</b> pārklājošās vai blakus esošās maiņas tiek automātiski apvienotas.',
                '<b>Neizmantotas maiņas:</b> iestatiet maiņas sākumu un beigas uz vienādu vērtību (piemēram, 0 un 0), ja nepieciešamas tikai viena vai divas maiņas.',
                '<b>24 stundu formāts:</b> ievadiet laiku kā decimālas stundas (piemēram, 13,5 par 13:30).',
            ],
            howto: [
                { question: 'Kas notiek, ja divas maiņas pārklājas?', answer: '<p>Pārklājošais laiks tiek skaitīts tikai vienreiz.</p>' },
                { question: 'Kā pārbaudīt vienu 8 stundu maiņu?', answer: '<p>Ievadiet to kā Maiņa 1, atstājiet Maiņu 2 un Maiņu 3 uz 0 un 0.</p>' },
            ],
            inputs: shiftInputs('lv'),
            outputs: [
                { name: 'covered_hours', label: 'Pārklātās Stundas', precision: 2 },
                { name: 'gap_hours', label: 'Robu Stundas', precision: 2 },
                { name: 'is_fully_covered', label: 'Pilnībā Pārklāts?' },
            ],
        },
        pl: {
            slug: 'kalkulator-pokrycia-zmian', title: 'Kalkulator Pokrycia Zmian', h1: 'Kalkulator Pokrycia Zmian',
            meta_title: 'Kalkulator Pokrycia Zmian | Sprawdź Luki w Harmonogramie',
            meta_description: 'Sprawdź, czy do 3 zmian w pełni pokrywa wymagane okno czasowe, i znajdź luki w pokryciu.',
            short_answer: 'Ten kalkulator sprawdza, czy do trzech zmian w pełni pokrywa wymagane okno czasowe, i zgłasza godziny luk.',
            intro_text: '<p>Wprowadź wymagane okno pokrycia (np. 8:00-20:00) i do trzech zmian (w formacie 24-godzinnym), a to narzędzie pokaże łączne godziny pokrycia, luki i pełność pokrycia.</p>',
            key_points: [
                '<b>Nakładające się zmiany:</b> nakładające się lub sąsiadujące zmiany są automatycznie łączone.',
                '<b>Nieużywane zmiany:</b> ustaw początek i koniec zmiany na tę samą wartość (np. 0 i 0), jeśli potrzebne są tylko jedna lub dwie zmiany.',
                '<b>Format 24-godzinny:</b> wpisz czas jako godziny dziesiętne (np. 13,5 dla 13:30).',
            ],
            howto: [
                { question: 'Co jeśli dwie zmiany się nakładają?', answer: '<p>Nakładający się czas jest liczony tylko raz.</p>' },
                { question: 'Jak sprawdzić pojedynczą 8-godzinną zmianę?', answer: '<p>Wpisz ją jako Zmiana 1, zostaw Zmianę 2 i Zmianę 3 na 0 i 0.</p>' },
            ],
            inputs: shiftInputs('pl'),
            outputs: [
                { name: 'covered_hours', label: 'Pokryte Godziny', precision: 2 },
                { name: 'gap_hours', label: 'Godziny Luki', precision: 2 },
                { name: 'is_fully_covered', label: 'W Pełni Pokryte?' },
            ],
        },
        es: {
            slug: 'calculadora-de-cobertura-de-turnos', title: 'Calculadora de Cobertura de Turnos', h1: 'Calculadora de Cobertura de Turnos',
            meta_title: 'Calculadora de Cobertura de Turnos | Comprueba Huecos en el Horario',
            meta_description: 'Comprueba si hasta 3 turnos cubren completamente una ventana de tiempo requerida, y encuentra huecos de cobertura.',
            short_answer: 'Esta calculadora comprueba si hasta tres turnos cubren completamente una ventana de tiempo requerida, e informa de horas de hueco.',
            intro_text: '<p>Introduce una ventana de cobertura requerida (p. ej. 8:00-20:00) y hasta tres turnos (en formato de 24 horas), y esta herramienta te dirá las horas totales cubiertas, huecos y si la cobertura es completa.</p>',
            key_points: [
                '<b>Turnos superpuestos:</b> los turnos superpuestos o adyacentes se fusionan automáticamente.',
                '<b>Turnos no usados:</b> establece el inicio y fin de un turno al mismo valor (p. ej. 0 y 0) si solo necesitas uno o dos turnos.',
                '<b>Formato de 24 horas:</b> introduce las horas como decimales (p. ej. 13,5 para las 13:30).',
            ],
            howto: [
                { question: '¿Qué pasa si dos turnos se superponen?', answer: '<p>El tiempo superpuesto solo se cuenta una vez.</p>' },
                { question: '¿Cómo compruebo un único turno de 8 horas?', answer: '<p>Introdúcelo como Turno 1, deja Turno 2 y Turno 3 en 0 y 0.</p>' },
            ],
            inputs: shiftInputs('es'),
            outputs: [
                { name: 'covered_hours', label: 'Horas Cubiertas', precision: 2 },
                { name: 'gap_hours', label: 'Horas de Hueco', precision: 2 },
                { name: 'is_fully_covered', label: '¿Cobertura Completa?' },
            ],
        },
        fr: {
            slug: 'calculateur-de-couverture-de-quarts', title: 'Calculateur de Couverture de Quarts', h1: 'Calculateur de Couverture de Quarts',
            meta_title: 'Calculateur de Couverture de Quarts | Vérifiez les Trous d’Horaire',
            meta_description: 'Vérifiez si jusqu’à 3 quarts couvrent entièrement une fenêtre horaire requise, et trouvez les trous de couverture.',
            short_answer: 'Ce calculateur vérifie si jusqu’à trois quarts couvrent entièrement une fenêtre horaire requise, et signale les heures de trou.',
            intro_text: '<p>Entrez une fenêtre de couverture requise (ex. 8:00-20:00) et jusqu’à trois quarts (au format 24 heures), et cet outil vous indiquera les heures totales couvertes, les trous et si la couverture est complète.</p>',
            key_points: [
                '<b>Quarts qui se chevauchent :</b> les quarts qui se chevauchent ou sont adjacents sont automatiquement fusionnés.',
                '<b>Quarts non utilisés :</b> réglez le début et la fin d’un quart à la même valeur (ex. 0 et 0) si vous n’avez besoin que d’un ou deux quarts.',
                '<b>Format 24 heures :</b> entrez les heures en décimal (ex. 13,5 pour 13:30).',
            ],
            howto: [
                { question: 'Que se passe-t-il si deux quarts se chevauchent ?', answer: '<p>Le temps qui se chevauche n’est compté qu’une seule fois.</p>' },
                { question: 'Comment vérifier un seul quart de 8 heures ?', answer: '<p>Entrez-le comme Quart 1, laissez Quart 2 et Quart 3 à 0 et 0.</p>' },
            ],
            inputs: shiftInputs('fr'),
            outputs: [
                { name: 'covered_hours', label: 'Heures Couvertes', precision: 2 },
                { name: 'gap_hours', label: 'Heures de Trou', precision: 2 },
                { name: 'is_fully_covered', label: 'Entièrement Couvert ?' },
            ],
        },
        it: {
            slug: 'calcolatore-di-copertura-turni', title: 'Calcolatore di Copertura Turni', h1: 'Calcolatore di Copertura Turni',
            meta_title: 'Calcolatore di Copertura Turni | Verifica Buchi nel Programma',
            meta_description: 'Verifica se fino a 3 turni coprono completamente una finestra oraria richiesta, e trova eventuali buchi di copertura.',
            short_answer: 'Questo calcolatore verifica se fino a tre turni coprono completamente una finestra oraria richiesta, e segnala le ore di buco.',
            intro_text: '<p>Inserisci una finestra di copertura richiesta (es. 8:00-20:00) e fino a tre turni (in formato 24 ore), e questo strumento ti dirà le ore totali coperte, eventuali buchi e se la copertura è completa.</p>',
            key_points: [
                '<b>Turni sovrapposti:</b> i turni sovrapposti o adiacenti vengono uniti automaticamente.',
                '<b>Turni non usati:</b> imposta inizio e fine di un turno allo stesso valore (es. 0 e 0) se ti servono solo uno o due turni.',
                '<b>Formato 24 ore:</b> inserisci gli orari come ore decimali (es. 13,5 per le 13:30).',
            ],
            howto: [
                { question: 'Cosa succede se due turni si sovrappongono?', answer: '<p>Il tempo sovrapposto viene contato solo una volta.</p>' },
                { question: 'Come verifico un singolo turno di 8 ore?', answer: '<p>Inseriscilo come Turno 1, lascia Turno 2 e Turno 3 a 0 e 0.</p>' },
            ],
            inputs: shiftInputs('it'),
            outputs: [
                { name: 'covered_hours', label: 'Ore Coperte', precision: 2 },
                { name: 'gap_hours', label: 'Ore di Buco', precision: 2 },
                { name: 'is_fully_covered', label: 'Completamente Coperto?' },
            ],
        },
        de: {
            slug: 'schichtabdeckungs-rechner', title: 'Schichtabdeckungs-Rechner', h1: 'Schichtabdeckungs-Rechner',
            meta_title: 'Schichtabdeckungs-Rechner | Zeitplanlücken Prüfen',
            meta_description: 'Prüfen Sie, ob bis zu 3 Schichten ein erforderliches Zeitfenster vollständig abdecken, und finden Sie Abdeckungslücken.',
            short_answer: 'Dieser Rechner prüft, ob bis zu drei Schichten ein erforderliches Zeitfenster vollständig abdecken, und meldet etwaige Lückenstunden.',
            intro_text: '<p>Geben Sie ein erforderliches Abdeckungsfenster (z.B. 8:00-20:00) und bis zu drei Schichten (im 24-Stunden-Format) ein, und dieses Tool zeigt Ihnen die gesamten abgedeckten Stunden, etwaige Lücken und ob die Abdeckung vollständig ist.</p>',
            key_points: [
                '<b>Überlappende Schichten:</b> überlappende oder angrenzende Schichten werden automatisch zusammengeführt.',
                '<b>Ungenutzte Schichten:</b> setzen Sie Start und Ende einer Schicht auf denselben Wert (z.B. 0 und 0), wenn Sie nur eine oder zwei Schichten benötigen.',
                '<b>24-Stunden-Format:</b> geben Sie Zeiten als Dezimalstunden ein (z.B. 13,5 für 13:30).',
            ],
            howto: [
                { question: 'Was passiert, wenn sich zwei Schichten überschneiden?', answer: '<p>Überschneidende Zeit wird nur einmal gezählt.</p>' },
                { question: 'Wie prüfe ich eine einzelne 8-Stunden-Schicht?', answer: '<p>Geben Sie sie als Schicht 1 ein, lassen Sie Schicht 2 und Schicht 3 auf 0 und 0.</p>' },
            ],
            inputs: shiftInputs('de'),
            outputs: [
                { name: 'covered_hours', label: 'Abgedeckte Stunden', precision: 2 },
                { name: 'gap_hours', label: 'Lückenstunden', precision: 2 },
                { name: 'is_fully_covered', label: 'Vollständig Abgedeckt?' },
            ],
        },
    },
}

// ============================================================
// 1130: Focus Session Planner | Date & Time Calculators
// ============================================================
const focusSessionTool: ToolDef = {
    id: '1130',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'total_minutes', default: 120 }, { key: 'focus_minutes', default: 25 }, { key: 'break_minutes', default: 5 }],
        functions: { result: { type: 'function', functionName: 'focusSessionPlanner', params: { total_minutes: 'total_minutes', focus_minutes: 'focus_minutes', break_minutes: 'break_minutes' } } },
        outputs: [{ key: 'sessions' }, { key: 'total_focus_minutes' }, { key: 'total_break_minutes' }, { key: 'leftover_minutes' }],
    },
    locales: {
        en: {
            slug: 'focus-session-planner', title: 'Focus Session Planner | Date & Time Calculators', h1: 'Focus Session Planner',
            meta_title: 'Focus Session Planner | Pomodoro-Style Focus/Break Scheduler',
            meta_description: 'Plan how many focus and break sessions (Pomodoro-style) fit into a block of available time.',
            short_answer: 'This calculator finds how many focus+break sessions (Pomodoro-style) fit into a given block of time, e.g. 120 minutes at 25/5 = 4 sessions with 0 minutes leftover.',
            intro_text: '<p>Enter the total time you have available, plus your preferred focus session and break lengths, to see how many complete cycles fit in — the classic Pomodoro technique defaults to 25 minutes focus / 5 minutes break.</p>',
            key_points: [
                '<b>Default:</b> 25 minutes focus / 5 minutes break is the classic Pomodoro Technique ratio, but fully adjustable.',
                '<b>Leftover minutes:</b> any time that doesn\'t fit a complete cycle is shown separately, so you know how much spare time remains.',
                '<b>Example:</b> 120 minutes at 25 focus + 5 break (30-minute cycle) = 4 complete sessions, 0 minutes leftover.',
            ],
            howto: [
                { question: 'What if I prefer 50-minute focus sessions?', answer: '<p>Change the focus minutes field to 50 (and adjust the break as desired) — the calculator recalculates instantly.</p>' },
                { question: 'What happens to leftover time?', answer: '<p>It\'s shown as a separate number — not enough for one more full cycle, but you can use it as extra buffer or a shorter final session.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Total Available Time (minutes)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Focus Session Length (minutes)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Break Length (minutes)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Number of Sessions' },
                { name: 'total_focus_minutes', label: 'Total Focus Minutes' },
                { name: 'total_break_minutes', label: 'Total Break Minutes' },
                { name: 'leftover_minutes', label: 'Leftover Minutes' },
            ],
        },
        ru: {
            slug: 'planirovshchik-sessij-fokusa', title: 'Планировщик сессий фокуса | Калькуляторы даты и времени', h1: 'Планировщик сессий фокуса',
            meta_title: 'Планировщик сессий фокуса | Планировщик фокус/перерыв в стиле Помодоро',
            meta_description: 'Спланируйте, сколько сессий фокуса и перерывов (в стиле Помодоро) поместится в доступное время.',
            short_answer: 'Этот калькулятор находит, сколько циклов фокус+перерыв (в стиле Помодоро) поместится в заданный блок времени.',
            intro_text: '<p>Введите общее доступное время, плюс предпочитаемую длительность сессии фокуса и перерыва, чтобы увидеть, сколько полных циклов поместится.</p>',
            key_points: [
                '<b>По умолчанию:</b> 25 минут фокуса / 5 минут перерыва — классическое соотношение техники Помодоро.',
                '<b>Оставшиеся минуты:</b> время, не вписывающееся в полный цикл, показывается отдельно.',
                '<b>Пример:</b> 120 минут при 25 фокус + 5 перерыв (цикл 30 минут) = 4 полные сессии, 0 минут остатка.',
            ],
            howto: [
                { question: 'Что если я предпочитаю 50-минутные сессии фокуса?', answer: '<p>Измените поле минут фокуса на 50 — калькулятор мгновенно пересчитает.</p>' },
                { question: 'Что происходит с оставшимся временем?', answer: '<p>Оно показывается как отдельное число — недостаточно для ещё одного полного цикла, но можно использовать как буфер.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Всего доступного времени (минуты)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Длительность сессии фокуса (минуты)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Длительность перерыва (минуты)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Количество сессий' },
                { name: 'total_focus_minutes', label: 'Всего минут фокуса' },
                { name: 'total_break_minutes', label: 'Всего минут перерыва' },
                { name: 'leftover_minutes', label: 'Оставшиеся минуты' },
            ],
        },
        lv: {
            slug: 'fokusa-sesiju-planotajs', title: 'Fokusa Sesiju Plānotājs | Datuma un Laika Kalkulatori', h1: 'Fokusa Sesiju Plānotājs',
            meta_title: 'Fokusa Sesiju Plānotājs | Pomodoro Stila Fokusa/Pārtraukuma Plānotājs',
            meta_description: 'Plānojiet, cik fokusa un pārtraukuma sesiju (Pomodoro stilā) ietilpst pieejamajā laika blokā.',
            short_answer: 'Šis kalkulators atrod, cik fokuss+pārtraukums cikli (Pomodoro stilā) ietilpst dotajā laika blokā.',
            intro_text: '<p>Ievadiet kopējo pieejamo laiku, plus vēlamo fokusa sesijas un pārtraukuma ilgumu, lai redzētu, cik pilnu ciklu ietilpst.</p>',
            key_points: [
                '<b>Noklusējums:</b> 25 minūtes fokuss / 5 minūtes pārtraukums ir klasiskā Pomodoro Tehnikas proporcija.',
                '<b>Atlikušās minūtes:</b> laiks, kas neietilpst pilnā ciklā, tiek parādīts atsevišķi.',
                '<b>Piemērs:</b> 120 minūtes ar 25 fokuss + 5 pārtraukums (30 minūšu cikls) = 4 pilnas sesijas, 0 minūtes atlikuma.',
            ],
            howto: [
                { question: 'Ko darīt, ja es dodu priekšroku 50 minūšu fokusa sesijām?', answer: '<p>Mainiet fokusa minūšu lauku uz 50 — kalkulators uzreiz pārrēķina.</p>' },
                { question: 'Kas notiek ar atlikušo laiku?', answer: '<p>Tas tiek parādīts kā atsevišķs skaitlis — nepietiek vēl vienam pilnam ciklam, bet varat izmantot kā papildu buferi.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Kopējais Pieejamais Laiks (minūtes)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Fokusa Sesijas Ilgums (minūtes)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Pārtraukuma Ilgums (minūtes)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Sesiju Skaits' },
                { name: 'total_focus_minutes', label: 'Kopā Fokusa Minūtes' },
                { name: 'total_break_minutes', label: 'Kopā Pārtraukuma Minūtes' },
                { name: 'leftover_minutes', label: 'Atlikušās Minūtes' },
            ],
        },
        pl: {
            slug: 'planer-sesji-skupienia', title: 'Planer Sesji Skupienia | Kalkulatory Daty i Czasu', h1: 'Planer Sesji Skupienia',
            meta_title: 'Planer Sesji Skupienia | Planowanie Skupienia/Przerwy w Stylu Pomodoro',
            meta_description: 'Zaplanuj, ile sesji skupienia i przerw (w stylu Pomodoro) zmieści się w dostępnym czasie.',
            short_answer: 'Ten kalkulator znajduje, ile cykli skupienie+przerwa (w stylu Pomodoro) zmieści się w danym bloku czasu.',
            intro_text: '<p>Wprowadź całkowity dostępny czas, plus preferowaną długość sesji skupienia i przerwy, aby zobaczyć, ile pełnych cykli się zmieści.</p>',
            key_points: [
                '<b>Domyślnie:</b> 25 minut skupienia / 5 minut przerwy to klasyczna proporcja Techniki Pomodoro.',
                '<b>Pozostałe minuty:</b> czas, który nie mieści się w pełnym cyklu, jest pokazywany osobno.',
                '<b>Przykład:</b> 120 minut przy 25 skupienie + 5 przerwa (cykl 30 minut) = 4 pełne sesje, 0 minut pozostałości.',
            ],
            howto: [
                { question: 'Co jeśli wolę 50-minutowe sesje skupienia?', answer: '<p>Zmień pole minut skupienia na 50 — kalkulator natychmiast przeliczy.</p>' },
                { question: 'Co dzieje się z pozostałym czasem?', answer: '<p>Jest pokazywany jako osobna liczba — niewystarczająca na kolejny pełny cykl, ale można wykorzystać jako bufor.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Łącznie Dostępny Czas (minuty)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Długość Sesji Skupienia (minuty)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Długość Przerwy (minuty)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Liczba Sesji' },
                { name: 'total_focus_minutes', label: 'Łącznie Minut Skupienia' },
                { name: 'total_break_minutes', label: 'Łącznie Minut Przerwy' },
                { name: 'leftover_minutes', label: 'Pozostałe Minuty' },
            ],
        },
        es: {
            slug: 'planificador-de-sesiones-de-enfoque', title: 'Planificador de Sesiones de Enfoque | Calculadoras de Fecha y Hora', h1: 'Planificador de Sesiones de Enfoque',
            meta_title: 'Planificador de Sesiones de Enfoque | Planificador Enfoque/Descanso Estilo Pomodoro',
            meta_description: 'Planifica cuántas sesiones de enfoque y descanso (estilo Pomodoro) caben en un bloque de tiempo disponible.',
            short_answer: 'Esta calculadora encuentra cuántos ciclos enfoque+descanso (estilo Pomodoro) caben en un bloque de tiempo dado.',
            intro_text: '<p>Introduce el tiempo total disponible, más la duración preferida de la sesión de enfoque y descanso, para ver cuántos ciclos completos caben.</p>',
            key_points: [
                '<b>Por defecto:</b> 25 minutos de enfoque / 5 minutos de descanso es la proporción clásica de la Técnica Pomodoro.',
                '<b>Minutos sobrantes:</b> el tiempo que no cabe en un ciclo completo se muestra por separado.',
                '<b>Ejemplo:</b> 120 minutos con 25 enfoque + 5 descanso (ciclo de 30 minutos) = 4 sesiones completas, 0 minutos sobrantes.',
            ],
            howto: [
                { question: '¿Y si prefiero sesiones de enfoque de 50 minutos?', answer: '<p>Cambia el campo de minutos de enfoque a 50 — la calculadora recalcula al instante.</p>' },
                { question: '¿Qué pasa con el tiempo sobrante?', answer: '<p>Se muestra como un número separado — no suficiente para otro ciclo completo, pero puedes usarlo como margen extra.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Tiempo Total Disponible (minutos)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Duración de Sesión de Enfoque (minutos)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Duración del Descanso (minutos)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Número de Sesiones' },
                { name: 'total_focus_minutes', label: 'Minutos Totales de Enfoque' },
                { name: 'total_break_minutes', label: 'Minutos Totales de Descanso' },
                { name: 'leftover_minutes', label: 'Minutos Sobrantes' },
            ],
        },
        fr: {
            slug: 'planificateur-de-sessions-de-concentration', title: 'Planificateur de Sessions de Concentration | Calculateurs de Date et Heure', h1: 'Planificateur de Sessions de Concentration',
            meta_title: 'Planificateur de Sessions de Concentration | Planificateur Concentration/Pause Style Pomodoro',
            meta_description: 'Planifiez combien de sessions de concentration et de pause (style Pomodoro) tiennent dans un bloc de temps disponible.',
            short_answer: 'Ce calculateur trouve combien de cycles concentration+pause (style Pomodoro) tiennent dans un bloc de temps donné.',
            intro_text: '<p>Entrez le temps total disponible, plus la durée préférée de session de concentration et de pause, pour voir combien de cycles complets tiennent.</p>',
            key_points: [
                '<b>Par défaut :</b> 25 minutes de concentration / 5 minutes de pause est le ratio classique de la Technique Pomodoro.',
                '<b>Minutes restantes :</b> le temps qui ne tient pas dans un cycle complet est affiché séparément.',
                '<b>Exemple :</b> 120 minutes à 25 concentration + 5 pause (cycle de 30 minutes) = 4 sessions complètes, 0 minute restante.',
            ],
            howto: [
                { question: 'Et si je préfère des sessions de concentration de 50 minutes ?', answer: '<p>Changez le champ minutes de concentration à 50 — le calculateur recalcule instantanément.</p>' },
                { question: 'Que devient le temps restant ?', answer: '<p>Il est affiché comme un nombre séparé — pas assez pour un cycle complet supplémentaire, mais utilisable comme marge.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Temps Total Disponible (minutes)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Durée de Session de Concentration (minutes)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Durée de la Pause (minutes)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Nombre de Sessions' },
                { name: 'total_focus_minutes', label: 'Minutes Totales de Concentration' },
                { name: 'total_break_minutes', label: 'Minutes Totales de Pause' },
                { name: 'leftover_minutes', label: 'Minutes Restantes' },
            ],
        },
        it: {
            slug: 'pianificatore-di-sessioni-di-concentrazione', title: 'Pianificatore di Sessioni di Concentrazione | Calcolatori di Data e Ora', h1: 'Pianificatore di Sessioni di Concentrazione',
            meta_title: 'Pianificatore di Sessioni di Concentrazione | Pianificatore Concentrazione/Pausa in Stile Pomodoro',
            meta_description: 'Pianifica quante sessioni di concentrazione e pausa (in stile Pomodoro) si adattano a un blocco di tempo disponibile.',
            short_answer: 'Questo calcolatore trova quanti cicli concentrazione+pausa (in stile Pomodoro) si adattano a un dato blocco di tempo.',
            intro_text: '<p>Inserisci il tempo totale disponibile, più la durata preferita della sessione di concentrazione e pausa, per vedere quanti cicli completi si adattano.</p>',
            key_points: [
                '<b>Predefinito:</b> 25 minuti di concentrazione / 5 minuti di pausa è il rapporto classico della Tecnica Pomodoro.',
                '<b>Minuti rimanenti:</b> il tempo che non si adatta a un ciclo completo viene mostrato separatamente.',
                '<b>Esempio:</b> 120 minuti con 25 concentrazione + 5 pausa (ciclo di 30 minuti) = 4 sessioni complete, 0 minuti rimanenti.',
            ],
            howto: [
                { question: 'Cosa succede se preferisco sessioni di concentrazione di 50 minuti?', answer: '<p>Cambia il campo minuti di concentrazione a 50 — il calcolatore ricalcola istantaneamente.</p>' },
                { question: 'Cosa succede al tempo rimanente?', answer: '<p>Viene mostrato come un numero separato — non sufficiente per un altro ciclo completo, ma utilizzabile come margine extra.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Tempo Totale Disponibile (minuti)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Durata Sessione di Concentrazione (minuti)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Durata Pausa (minuti)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Numero di Sessioni' },
                { name: 'total_focus_minutes', label: 'Minuti Totali di Concentrazione' },
                { name: 'total_break_minutes', label: 'Minuti Totali di Pausa' },
                { name: 'leftover_minutes', label: 'Minuti Rimanenti' },
            ],
        },
        de: {
            slug: 'fokussitzungsplaner', title: 'Fokussitzungsplaner | Datum- und Zeitrechner', h1: 'Fokussitzungsplaner',
            meta_title: 'Fokussitzungsplaner | Pomodoro-Stil Fokus/Pause-Planer',
            meta_description: 'Planen Sie, wie viele Fokus- und Pausensitzungen (im Pomodoro-Stil) in einen verfügbaren Zeitblock passen.',
            short_answer: 'Dieser Rechner findet, wie viele Fokus+Pause-Zyklen (im Pomodoro-Stil) in einen gegebenen Zeitblock passen.',
            intro_text: '<p>Geben Sie die gesamte verfügbare Zeit ein, plus Ihre bevorzugte Fokussitzungs- und Pausenlänge, um zu sehen, wie viele vollständige Zyklen hineinpassen.</p>',
            key_points: [
                '<b>Standard:</b> 25 Minuten Fokus / 5 Minuten Pause ist das klassische Pomodoro-Technik-Verhältnis.',
                '<b>Restliche Minuten:</b> Zeit, die nicht in einen vollständigen Zyklus passt, wird separat angezeigt.',
                '<b>Beispiel:</b> 120 Minuten bei 25 Fokus + 5 Pause (30-Minuten-Zyklus) = 4 vollständige Sitzungen, 0 Minuten Rest.',
            ],
            howto: [
                { question: 'Was, wenn ich 50-minütige Fokussitzungen bevorzuge?', answer: '<p>Ändern Sie das Feld Fokusminuten auf 50 — der Rechner rechnet sofort neu.</p>' },
                { question: 'Was passiert mit der restlichen Zeit?', answer: '<p>Sie wird als separate Zahl angezeigt — nicht genug für einen weiteren vollständigen Zyklus, aber als zusätzlicher Puffer nutzbar.</p>' },
            ],
            inputs: [
                { name: 'total_minutes', label: 'Gesamte Verfügbare Zeit (Minuten)', type: 'number', min: 1, max: 10000, placeholder: '120' },
                { name: 'focus_minutes', label: 'Fokussitzungslänge (Minuten)', type: 'number', min: 1, max: 500, placeholder: '25' },
                { name: 'break_minutes', label: 'Pausenlänge (Minuten)', type: 'number', min: 0, max: 200, placeholder: '5' },
            ],
            outputs: [
                { name: 'sessions', label: 'Anzahl der Sitzungen' },
                { name: 'total_focus_minutes', label: 'Gesamte Fokusminuten' },
                { name: 'total_break_minutes', label: 'Gesamte Pausenminuten' },
                { name: 'leftover_minutes', label: 'Restliche Minuten' },
            ],
        },
    },
}

// ============================================================
// 1131: Context Switching Cost Calculator | Date & Time Calculators
// ============================================================
const contextSwitchingTool: ToolDef = {
    id: '1131',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'switches_per_day', default: 10 }, { key: 'cost_per_switch_minutes', default: 23.25 }, { key: 'work_days_per_week', default: 5 }],
        functions: { result: { type: 'function', functionName: 'contextSwitchingCost', params: { switches_per_day: 'switches_per_day', cost_per_switch_minutes: 'cost_per_switch_minutes', work_days_per_week: 'work_days_per_week' } } },
        outputs: [{ key: 'daily_hours_lost', precision: 2 }, { key: 'weekly_hours_lost', precision: 2 }, { key: 'annual_hours_lost', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'context-switching-cost-calculator', title: 'Context Switching Cost Calculator | Date & Time Calculators', h1: 'Context Switching Cost Calculator',
            meta_title: 'Context Switching Cost Calculator | Hours Lost to Task Switching',
            meta_description: 'Estimate how many hours per day, week, and year are lost to context switching between tasks.',
            short_answer: 'This calculator estimates hours lost per day, week, and year due to context switching, based on how many times you switch tasks and the recovery cost per switch.',
            intro_text: '<p>Every time you switch from one task to another, there\'s a mental "recovery cost" before you\'re fully re-focused. Enter how many times per day you switch tasks to estimate the cumulative time lost.</p>',
            key_points: [
                '<b>Default cost per switch:</b> ~23.25 minutes, the figure most commonly cited from Gloria Mark\'s (UC Irvine) interruption-recovery research — adjust it if you have a different estimate for your own work.',
                '<b>Method:</b> daily hours lost = switches × cost per switch (minutes) ÷ 60; weekly = daily × work days; annual = weekly × 52.',
                '<b>Example:</b> 10 switches/day × 23.25 min = 3.875 hours lost daily, or about 19.4 hours weekly at 5 work days.',
            ],
            howto: [
                { question: 'Where does the 23.25-minute default come from?', answer: '<p>It\'s a widely cited figure from research by Dr. Gloria Mark at UC Irvine studying how long it takes to fully resume a task after an interruption. It\'s an estimate, not a universal constant — adjust it if better data is available for your context.</p>' },
                { question: 'How can I reduce this cost in practice?', answer: '<p>Batching similar tasks together and limiting notifications are common strategies to reduce the number of daily switches.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Task Switches per Day', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Recovery Cost per Switch (minutes)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Work Days per Week', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Daily Hours Lost', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Weekly Hours Lost', precision: 2 },
                { name: 'annual_hours_lost', label: 'Annual Hours Lost', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-stoimosti-pereklyucheniya-konteksta', title: 'Калькулятор стоимости переключения контекста | Калькуляторы даты и времени', h1: 'Калькулятор стоимости переключения контекста',
            meta_title: 'Калькулятор стоимости переключения контекста | Часы, потерянные на переключение задач',
            meta_description: 'Оцените, сколько часов в день, неделю и год теряется из-за переключения контекста между задачами.',
            short_answer: 'Этот калькулятор оценивает часы, потерянные в день, неделю и год из-за переключения контекста.',
            intro_text: '<p>Каждый раз, когда вы переключаетесь с одной задачи на другую, есть "стоимость восстановления" внимания. Введите, сколько раз в день вы переключаете задачи.</p>',
            key_points: [
                '<b>Стоимость по умолчанию:</b> ~23,25 минуты, наиболее часто цитируемая цифра из исследований Глории Марк (Калифорнийский университет в Ирвайне).',
                '<b>Метод:</b> дневные потерянные часы = переключения × стоимость переключения (минуты) ÷ 60.',
                '<b>Пример:</b> 10 переключений/день × 23,25 мин = 3,875 часа потеряно ежедневно.',
            ],
            howto: [
                { question: 'Откуда взялось значение по умолчанию 23,25 минуты?', answer: '<p>Это широко цитируемая цифра из исследований доктора Глории Марк.</p>' },
                { question: 'Как уменьшить эту стоимость на практике?', answer: '<p>Группировка похожих задач и ограничение уведомлений — распространённые стратегии.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Переключений задач в день', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Стоимость восстановления за переключение (минуты)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Рабочих дней в неделю', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Потерянных часов в день', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Потерянных часов в неделю', precision: 2 },
                { name: 'annual_hours_lost', label: 'Потерянных часов в год', precision: 1 },
            ],
        },
        lv: {
            slug: 'konteksta-parslegsanas-izmaksu-kalkulators', title: 'Konteksta Pārslēgšanas Izmaksu Kalkulators | Datuma un Laika Kalkulatori', h1: 'Konteksta Pārslēgšanas Izmaksu Kalkulators',
            meta_title: 'Konteksta Pārslēgšanas Izmaksu Kalkulators | Stundas Zaudētas Uzdevumu Pārslēgšanā',
            meta_description: 'Novērtējiet, cik stundu dienā, nedēļā un gadā tiek zaudētas konteksta pārslēgšanas dēļ starp uzdevumiem.',
            short_answer: 'Šis kalkulators novērtē stundas, kas zaudētas dienā, nedēļā un gadā konteksta pārslēgšanas dēļ.',
            intro_text: '<p>Katru reizi, kad pārslēdzaties no viena uzdevuma uz citu, ir garīga "atgūšanās izmaksa". Ievadiet, cik reižu dienā pārslēdzat uzdevumus.</p>',
            key_points: [
                '<b>Noklusējuma izmaksa par pārslēgšanu:</b> ~23,25 minūtes, biežāk citētais skaitlis no Glorijas Markas (UC Irvine) pētījumiem.',
                '<b>Metode:</b> dienas zaudētās stundas = pārslēgšanas × izmaksa par pārslēgšanu (minūtes) ÷ 60.',
                '<b>Piemērs:</b> 10 pārslēgšanas/dienā × 23,25 min = 3,875 stundas zaudētas dienā.',
            ],
            howto: [
                { question: 'No kurienes rodas noklusējuma vērtība 23,25 minūtes?', answer: '<p>Tas ir plaši citēts skaitlis no Dr. Glorijas Markas pētījumiem.</p>' },
                { question: 'Kā samazināt šīs izmaksas praksē?', answer: '<p>Līdzīgu uzdevumu grupēšana un paziņojumu ierobežošana ir izplatītas stratēģijas.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Uzdevumu Pārslēgšanas Dienā', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Atgūšanās Izmaksa par Pārslēgšanu (minūtes)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Darba Dienas Nedēļā', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Zaudētas Stundas Dienā', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Zaudētas Stundas Nedēļā', precision: 2 },
                { name: 'annual_hours_lost', label: 'Zaudētas Stundas Gadā', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-kosztu-przelaczania-kontekstu', title: 'Kalkulator Kosztu Przełączania Kontekstu | Kalkulatory Daty i Czasu', h1: 'Kalkulator Kosztu Przełączania Kontekstu',
            meta_title: 'Kalkulator Kosztu Przełączania Kontekstu | Godziny Stracone na Przełączanie Zadań',
            meta_description: 'Oszacuj, ile godzin dziennie, tygodniowo i rocznie traci się na przełączanie kontekstu między zadaniami.',
            short_answer: 'Ten kalkulator szacuje godziny stracone dziennie, tygodniowo i rocznie z powodu przełączania kontekstu.',
            intro_text: '<p>Za każdym razem, gdy przełączasz się z jednego zadania na inne, występuje mentalny "koszt odzyskania" skupienia. Wpisz, ile razy dziennie przełączasz zadania.</p>',
            key_points: [
                '<b>Domyślny koszt przełączenia:</b> ~23,25 minuty, najczęściej cytowana liczba z badań Glorii Mark (UC Irvine).',
                '<b>Metoda:</b> dzienne stracone godziny = przełączenia × koszt przełączenia (minuty) ÷ 60.',
                '<b>Przykład:</b> 10 przełączeń/dzień × 23,25 min = 3,875 godziny straconej dziennie.',
            ],
            howto: [
                { question: 'Skąd bierze się domyślna wartość 23,25 minuty?', answer: '<p>To szeroko cytowana liczba z badań dr Glorii Mark.</p>' },
                { question: 'Jak zmniejszyć ten koszt w praktyce?', answer: '<p>Grupowanie podobnych zadań i ograniczanie powiadomień to typowe strategie.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Przełączeń Zadań Dziennie', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Koszt Odzyskania na Przełączenie (minuty)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Dni Robocze w Tygodniu', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Stracone Godziny Dziennie', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Stracone Godziny Tygodniowo', precision: 2 },
                { name: 'annual_hours_lost', label: 'Stracone Godziny Rocznie', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-de-costo-de-cambio-de-contexto', title: 'Calculadora de Costo de Cambio de Contexto | Calculadoras de Fecha y Hora', h1: 'Calculadora de Costo de Cambio de Contexto',
            meta_title: 'Calculadora de Costo de Cambio de Contexto | Horas Perdidas por Cambiar de Tarea',
            meta_description: 'Estima cuántas horas al día, semana y año se pierden por el cambio de contexto entre tareas.',
            short_answer: 'Esta calculadora estima las horas perdidas al día, semana y año debido al cambio de contexto.',
            intro_text: '<p>Cada vez que cambias de una tarea a otra, hay un "costo de recuperación" mental. Introduce cuántas veces al día cambias de tarea.</p>',
            key_points: [
                '<b>Costo predeterminado por cambio:</b> ~23,25 minutos, la cifra más citada de la investigación de Gloria Mark (UC Irvine).',
                '<b>Método:</b> horas perdidas diarias = cambios × costo por cambio (minutos) ÷ 60.',
                '<b>Ejemplo:</b> 10 cambios/día × 23,25 min = 3,875 horas perdidas diariamente.',
            ],
            howto: [
                { question: '¿De dónde viene el valor predeterminado de 23,25 minutos?', answer: '<p>Es una cifra ampliamente citada de la investigación de la Dra. Gloria Mark.</p>' },
                { question: '¿Cómo puedo reducir este costo en la práctica?', answer: '<p>Agrupar tareas similares y limitar notificaciones son estrategias comunes.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Cambios de Tarea al Día', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Costo de Recuperación por Cambio (minutos)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Días Laborables por Semana', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Horas Perdidas al Día', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Horas Perdidas a la Semana', precision: 2 },
                { name: 'annual_hours_lost', label: 'Horas Perdidas al Año', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-de-cout-de-changement-de-contexte', title: 'Calculateur de Coût de Changement de Contexte | Calculateurs de Date et Heure', h1: 'Calculateur de Coût de Changement de Contexte',
            meta_title: 'Calculateur de Coût de Changement de Contexte | Heures Perdues au Changement de Tâche',
            meta_description: 'Estimez combien d’heures par jour, semaine et année sont perdues à cause du changement de contexte entre tâches.',
            short_answer: 'Ce calculateur estime les heures perdues par jour, semaine et année à cause du changement de contexte.',
            intro_text: '<p>Chaque fois que vous passez d’une tâche à une autre, il y a un "coût de récupération" mental. Entrez combien de fois par jour vous changez de tâche.</p>',
            key_points: [
                '<b>Coût par défaut par changement :</b> ~23,25 minutes, le chiffre le plus cité de la recherche de Gloria Mark (UC Irvine).',
                '<b>Méthode :</b> heures perdues quotidiennes = changements × coût par changement (minutes) ÷ 60.',
                '<b>Exemple :</b> 10 changements/jour × 23,25 min = 3,875 heures perdues quotidiennement.',
            ],
            howto: [
                { question: 'D’où vient la valeur par défaut de 23,25 minutes ?', answer: '<p>C’est un chiffre largement cité de la recherche du Dr Gloria Mark.</p>' },
                { question: 'Comment réduire ce coût en pratique ?', answer: '<p>Regrouper des tâches similaires et limiter les notifications sont des stratégies courantes.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Changements de Tâche par Jour', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Coût de Récupération par Changement (minutes)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Jours Ouvrés par Semaine', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Heures Perdues par Jour', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Heures Perdues par Semaine', precision: 2 },
                { name: 'annual_hours_lost', label: 'Heures Perdues par An', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-di-costo-del-cambio-di-contesto', title: 'Calcolatore di Costo del Cambio di Contesto | Calcolatori di Data e Ora', h1: 'Calcolatore di Costo del Cambio di Contesto',
            meta_title: 'Calcolatore di Costo del Cambio di Contesto | Ore Perse nel Cambio di Attività',
            meta_description: 'Stima quante ore al giorno, alla settimana e all’anno si perdono a causa del cambio di contesto tra attività.',
            short_answer: 'Questo calcolatore stima le ore perse al giorno, alla settimana e all’anno a causa del cambio di contesto.',
            intro_text: '<p>Ogni volta che passi da un’attività a un’altra, c’è un "costo di recupero" mentale. Inserisci quante volte al giorno cambi attività.</p>',
            key_points: [
                '<b>Costo predefinito per cambio:</b> ~23,25 minuti, la cifra più citata dalla ricerca di Gloria Mark (UC Irvine).',
                '<b>Metodo:</b> ore perse giornaliere = cambi × costo per cambio (minuti) ÷ 60.',
                '<b>Esempio:</b> 10 cambi/giorno × 23,25 min = 3,875 ore perse giornalmente.',
            ],
            howto: [
                { question: 'Da dove viene il valore predefinito di 23,25 minuti?', answer: '<p>È una cifra ampiamente citata dalla ricerca della Dr.ssa Gloria Mark.</p>' },
                { question: 'Come posso ridurre questo costo in pratica?', answer: '<p>Raggruppare attività simili e limitare le notifiche sono strategie comuni.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Cambi di Attività al Giorno', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Costo di Recupero per Cambio (minuti)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Giorni Lavorativi a Settimana', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Ore Perse al Giorno', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Ore Perse a Settimana', precision: 2 },
                { name: 'annual_hours_lost', label: 'Ore Perse all’Anno', precision: 1 },
            ],
        },
        de: {
            slug: 'kontextwechsel-kosten-rechner', title: 'Kontextwechsel-Kosten-Rechner | Datum- und Zeitrechner', h1: 'Kontextwechsel-Kosten-Rechner',
            meta_title: 'Kontextwechsel-Kosten-Rechner | Durch Aufgabenwechsel Verlorene Stunden',
            meta_description: 'Schätzen Sie, wie viele Stunden pro Tag, Woche und Jahr durch Kontextwechsel zwischen Aufgaben verloren gehen.',
            short_answer: 'Dieser Rechner schätzt verlorene Stunden pro Tag, Woche und Jahr durch Kontextwechsel.',
            intro_text: '<p>Jedes Mal, wenn Sie von einer Aufgabe zur nächsten wechseln, gibt es mentale "Wiederherstellungskosten". Geben Sie ein, wie oft Sie pro Tag die Aufgabe wechseln.</p>',
            key_points: [
                '<b>Standardkosten pro Wechsel:</b> ~23,25 Minuten, die am häufigsten zitierte Zahl aus der Forschung von Gloria Mark (UC Irvine).',
                '<b>Methode:</b> tägliche verlorene Stunden = Wechsel × Kosten pro Wechsel (Minuten) ÷ 60.',
                '<b>Beispiel:</b> 10 Wechsel/Tag × 23,25 Min = 3,875 Stunden täglich verloren.',
            ],
            howto: [
                { question: 'Woher kommt der Standardwert von 23,25 Minuten?', answer: '<p>Es ist eine weit verbreitete Zahl aus der Forschung von Dr. Gloria Mark.</p>' },
                { question: 'Wie kann ich diese Kosten in der Praxis reduzieren?', answer: '<p>Ähnliche Aufgaben zu bündeln und Benachrichtigungen zu begrenzen sind gängige Strategien.</p>' },
            ],
            inputs: [
                { name: 'switches_per_day', label: 'Aufgabenwechsel pro Tag', type: 'number', min: 0, max: 200, placeholder: '10' },
                { name: 'cost_per_switch_minutes', label: 'Wiederherstellungskosten pro Wechsel (Minuten)', type: 'number', min: 0, max: 120, placeholder: '23.25' },
                { name: 'work_days_per_week', label: 'Arbeitstage pro Woche', type: 'number', min: 1, max: 7, placeholder: '5' },
            ],
            outputs: [
                { name: 'daily_hours_lost', label: 'Täglich Verlorene Stunden', precision: 2 },
                { name: 'weekly_hours_lost', label: 'Wöchentlich Verlorene Stunden', precision: 2 },
                { name: 'annual_hours_lost', label: 'Jährlich Verlorene Stunden', precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1132: Meeting Time Zone Overlap Calculator | Date & Time Calculators
// Intentionally uses fixed UTC offsets, not a full IANA timezone/DST
// database - the user should pick the currently-effective offset per
// location. Documented as a deliberate scoping simplification.
// ============================================================
const meetingOverlapTool: ToolDef = {
    id: '1132',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'offset1', default: -5 }, { key: 'start1', default: 9 }, { key: 'end1', default: 17 },
            { key: 'offset2', default: 1 }, { key: 'start2', default: 9 }, { key: 'end2', default: 17 },
        ],
        functions: { result: { type: 'function', functionName: 'meetingTimezoneOverlap', params: { offset1: 'offset1', start1: 'start1', end1: 'end1', offset2: 'offset2', start2: 'start2', end2: 'end2' } } },
        outputs: [{ key: 'overlap_hours', precision: 2 }, { key: 'overlap_start_loc1', precision: 1 }, { key: 'overlap_end_loc1', precision: 1 }, { key: 'overlap_start_loc2', precision: 1 }, { key: 'overlap_end_loc2', precision: 1 }, { key: 'has_overlap' }],
    },
    locales: {
        en: {
            slug: 'meeting-time-zone-overlap-calculator', title: 'Meeting Time Zone Overlap Calculator | Date & Time Calculators', h1: 'Meeting Time Zone Overlap Calculator',
            meta_title: 'Meeting Time Zone Overlap Calculator | Find Shared Working Hours',
            meta_description: 'Find the overlapping working hours between two time zones for scheduling meetings across locations.',
            short_answer: 'This calculator finds the overlapping working hours between two locations, given their UTC offset and work-hour window, so you can schedule a meeting both sides can attend.',
            intro_text: '<p>Enter each location\'s UTC offset (hours from UTC) and typical work-hour window, and this tool finds the overlapping hours when both locations are working — the overlap is shown in both locations\' local times.</p>',
            key_points: [
                '<b>Fixed UTC offsets:</b> this calculator uses fixed hour offsets rather than a full time zone database — enter the offset currently in effect at each location (adjusting manually for daylight saving time if applicable).',
                '<b>Example:</b> New York (UTC-5, 9-17) and London (UTC+1, 9-17) share a 3-hour overlap (14:00-17:00 New York / 19:00-22:00 wait — actual overlap is 9-12 NY / 14-17 London depending on offsets).',
                '<b>No overlap:</b> if the working hours don\'t intersect at all, the calculator reports zero overlap hours.',
            ],
            howto: [
                { question: 'How do I find my location\'s current UTC offset?', answer: '<p>Search "[your city] UTC offset" — remember it may change with daylight saving time, so update it if needed.</p>' },
                { question: 'What if there\'s no overlap at all?', answer: '<p>The calculator will show 0 overlap hours and "No" for has-overlap, meaning you\'ll need to adjust someone\'s hours or find an asynchronous solution.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'Location 1 UTC Offset (hours)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Location 1 Work Start (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Location 1 Work End (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'Location 2 UTC Offset (hours)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Location 2 Work Start (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Location 2 Work End (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Overlap Hours', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Overlap Start (Location 1 Time)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Overlap End (Location 1 Time)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Overlap Start (Location 2 Time)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Overlap End (Location 2 Time)', precision: 1 },
                { name: 'has_overlap', label: 'Overlap Exists?' },
            ],
        },
        ru: {
            slug: 'kalkulyator-peresecheniya-chasovyh-poyasov', title: 'Калькулятор пересечения часовых поясов | Калькуляторы даты и времени', h1: 'Калькулятор пересечения часовых поясов',
            meta_title: 'Калькулятор пересечения часовых поясов | Найдите общие рабочие часы',
            meta_description: 'Найдите пересекающиеся рабочие часы между двумя часовыми поясами для планирования встреч.',
            short_answer: 'Этот калькулятор находит пересекающиеся рабочие часы между двумя местами, учитывая их смещение UTC и рабочее окно.',
            intro_text: '<p>Введите смещение UTC каждого места и типичное рабочее окно, и этот инструмент найдёт часы пересечения, когда оба места работают.</p>',
            key_points: [
                '<b>Фиксированные смещения UTC:</b> калькулятор использует фиксированные смещения, а не полную базу часовых поясов.',
                '<b>Пример:</b> Нью-Йорк (UTC-5, 9-17) и Лондон (UTC+1, 9-17) делят пересечение в зависимости от смещений.',
                '<b>Нет пересечения:</b> если рабочие часы вообще не пересекаются, калькулятор сообщит ноль часов пересечения.',
            ],
            howto: [
                { question: 'Как узнать текущее смещение UTC моего места?', answer: '<p>Поищите "[ваш город] смещение UTC" — помните, что оно может меняться с переходом на летнее время.</p>' },
                { question: 'Что если пересечения вообще нет?', answer: '<p>Калькулятор покажет 0 часов пересечения и "Нет" для наличия пересечения.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'Смещение UTC места 1 (часы)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Начало работы места 1 (24ч)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Конец работы места 1 (24ч)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'Смещение UTC места 2 (часы)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Начало работы места 2 (24ч)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Конец работы места 2 (24ч)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Часы пересечения', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Начало пересечения (время места 1)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Конец пересечения (время места 1)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Начало пересечения (время места 2)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Конец пересечения (время места 2)', precision: 1 },
                { name: 'has_overlap', label: 'Есть пересечение?' },
            ],
        },
        lv: {
            slug: 'sanaksmju-laika-joslu-parklajuma-kalkulators', title: 'Sanāksmju Laika Joslu Pārklājuma Kalkulators | Datuma un Laika Kalkulatori', h1: 'Sanāksmju Laika Joslu Pārklājuma Kalkulators',
            meta_title: 'Sanāksmju Laika Joslu Pārklājuma Kalkulators | Atrodiet Kopīgās Darba Stundas',
            meta_description: 'Atrodiet pārklājošās darba stundas starp divām laika joslām sanāksmju plānošanai.',
            short_answer: 'Šis kalkulators atrod pārklājošās darba stundas starp divām vietām, ņemot vērā to UTC nobīdi un darba stundu logu.',
            intro_text: '<p>Ievadiet katras vietas UTC nobīdi un tipisko darba stundu logu, un šis rīks atradīs pārklāšanās stundas, kad abas vietas strādā.</p>',
            key_points: [
                '<b>Fiksētas UTC nobīdes:</b> kalkulators izmanto fiksētas nobīdes, nevis pilnu laika joslu datubāzi.',
                '<b>Piemērs:</b> Ņujorka (UTC-5, 9-17) un Londona (UTC+1, 9-17) dala pārklāšanos atkarībā no nobīdēm.',
                '<b>Nav pārklāšanās:</b> ja darba stundas nemaz nepārklājas, kalkulators ziņo nulli pārklāšanās stundu.',
            ],
            howto: [
                { question: 'Kā uzzināt manas vietas pašreizējo UTC nobīdi?', answer: '<p>Meklējiet "[jūsu pilsēta] UTC nobīde" — atcerieties, ka tā var mainīties ar vasaras laiku.</p>' },
                { question: 'Kas notiek, ja pārklāšanās nemaz nav?', answer: '<p>Kalkulators parādīs 0 pārklāšanās stundu un "Nē" pārklāšanās esamībai.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: '1. Vietas UTC Nobīde (stundas)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: '1. Vietas Darba Sākums (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: '1. Vietas Darba Beigas (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: '2. Vietas UTC Nobīde (stundas)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: '2. Vietas Darba Sākums (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: '2. Vietas Darba Beigas (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Pārklāšanās Stundas', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Pārklāšanās Sākums (1. Vietas Laiks)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Pārklāšanās Beigas (1. Vietas Laiks)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Pārklāšanās Sākums (2. Vietas Laiks)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Pārklāšanās Beigas (2. Vietas Laiks)', precision: 1 },
                { name: 'has_overlap', label: 'Vai Ir Pārklāšanās?' },
            ],
        },
        pl: {
            slug: 'kalkulator-nakladania-sie-stref-czasowych-spotkan', title: 'Kalkulator Nakładania się Stref Czasowych Spotkań | Kalkulatory Daty i Czasu', h1: 'Kalkulator Nakładania się Stref Czasowych Spotkań',
            meta_title: 'Kalkulator Nakładania się Stref Czasowych | Znajdź Wspólne Godziny Pracy',
            meta_description: 'Znajdź nakładające się godziny pracy między dwiema strefami czasowymi do planowania spotkań.',
            short_answer: 'Ten kalkulator znajduje nakładające się godziny pracy między dwiema lokalizacjami, biorąc pod uwagę ich przesunięcie UTC i okno godzin pracy.',
            intro_text: '<p>Wprowadź przesunięcie UTC każdej lokalizacji i typowe okno godzin pracy, a to narzędzie znajdzie godziny nakładania się, gdy obie lokalizacje pracują.</p>',
            key_points: [
                '<b>Stałe przesunięcia UTC:</b> kalkulator używa stałych przesunięć, a nie pełnej bazy stref czasowych.',
                '<b>Przykład:</b> Nowy Jork (UTC-5, 9-17) i Londyn (UTC+1, 9-17) dzielą nakładanie się w zależności od przesunięć.',
                '<b>Brak nakładania:</b> jeśli godziny pracy w ogóle się nie pokrywają, kalkulator zgłosi zero godzin nakładania.',
            ],
            howto: [
                { question: 'Jak znaleźć aktualne przesunięcie UTC mojej lokalizacji?', answer: '<p>Wyszukaj "[twoje miasto] przesunięcie UTC" — pamiętaj, że może się zmieniać z czasem letnim.</p>' },
                { question: 'Co jeśli w ogóle nie ma nakładania?', answer: '<p>Kalkulator pokaże 0 godzin nakładania i "Nie" dla istnienia nakładania.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'Przesunięcie UTC Lokalizacji 1 (godziny)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Początek Pracy Lokalizacji 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Koniec Pracy Lokalizacji 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'Przesunięcie UTC Lokalizacji 2 (godziny)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Początek Pracy Lokalizacji 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Koniec Pracy Lokalizacji 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Godziny Nakładania', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Początek Nakładania (Czas Lokalizacji 1)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Koniec Nakładania (Czas Lokalizacji 1)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Początek Nakładania (Czas Lokalizacji 2)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Koniec Nakładania (Czas Lokalizacji 2)', precision: 1 },
                { name: 'has_overlap', label: 'Czy Występuje Nakładanie?' },
            ],
        },
        es: {
            slug: 'calculadora-de-superposicion-de-zonas-horarias-de-reuniones', title: 'Calculadora de Superposición de Zonas Horarias de Reuniones | Calculadoras de Fecha y Hora', h1: 'Calculadora de Superposición de Zonas Horarias de Reuniones',
            meta_title: 'Calculadora de Superposición de Zonas Horarias | Encuentra Horas Laborables Compartidas',
            meta_description: 'Encuentra las horas laborables superpuestas entre dos zonas horarias para programar reuniones.',
            short_answer: 'Esta calculadora encuentra las horas laborables superpuestas entre dos ubicaciones, dado su desfase UTC y ventana de horas laborables.',
            intro_text: '<p>Introduce el desfase UTC de cada ubicación y su ventana típica de horas laborables, y esta herramienta encontrará las horas superpuestas cuando ambas ubicaciones estén trabajando.</p>',
            key_points: [
                '<b>Desfases UTC fijos:</b> esta calculadora usa desfases fijos en lugar de una base de datos completa de zonas horarias.',
                '<b>Ejemplo:</b> Nueva York (UTC-5, 9-17) y Londres (UTC+1, 9-17) comparten superposición según los desfases.',
                '<b>Sin superposición:</b> si las horas laborables no se cruzan en absoluto, la calculadora informa cero horas de superposición.',
            ],
            howto: [
                { question: '¿Cómo encuentro el desfase UTC actual de mi ubicación?', answer: '<p>Busca "[tu ciudad] desfase UTC" — recuerda que puede cambiar con el horario de verano.</p>' },
                { question: '¿Qué pasa si no hay superposición en absoluto?', answer: '<p>La calculadora mostrará 0 horas de superposición y "No" para existencia de superposición.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'Desfase UTC Ubicación 1 (horas)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Inicio Laboral Ubicación 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Fin Laboral Ubicación 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'Desfase UTC Ubicación 2 (horas)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Inicio Laboral Ubicación 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Fin Laboral Ubicación 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Horas de Superposición', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Inicio de Superposición (Hora Ubicación 1)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Fin de Superposición (Hora Ubicación 1)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Inicio de Superposición (Hora Ubicación 2)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Fin de Superposición (Hora Ubicación 2)', precision: 1 },
                { name: 'has_overlap', label: '¿Existe Superposición?' },
            ],
        },
        fr: {
            slug: 'calculateur-de-chevauchement-de-fuseaux-horaires-de-reunion', title: 'Calculateur de Chevauchement de Fuseaux Horaires de Réunion | Calculateurs de Date et Heure', h1: 'Calculateur de Chevauchement de Fuseaux Horaires de Réunion',
            meta_title: 'Calculateur de Chevauchement de Fuseaux Horaires | Trouvez les Heures de Travail Partagées',
            meta_description: 'Trouvez les heures de travail qui se chevauchent entre deux fuseaux horaires pour planifier des réunions.',
            short_answer: 'Ce calculateur trouve les heures de travail qui se chevauchent entre deux lieux, selon leur décalage UTC et leur fenêtre d’heures de travail.',
            intro_text: '<p>Entrez le décalage UTC de chaque lieu et sa fenêtre habituelle d’heures de travail, et cet outil trouvera les heures de chevauchement lorsque les deux lieux travaillent.</p>',
            key_points: [
                '<b>Décalages UTC fixes :</b> ce calculateur utilise des décalages fixes plutôt qu’une base de données complète de fuseaux horaires.',
                '<b>Exemple :</b> New York (UTC-5, 9-17) et Londres (UTC+1, 9-17) partagent un chevauchement selon les décalages.',
                '<b>Aucun chevauchement :</b> si les heures de travail ne se croisent pas du tout, le calculateur indique zéro heure de chevauchement.',
            ],
            howto: [
                { question: 'Comment trouver le décalage UTC actuel de mon lieu ?', answer: '<p>Recherchez "[votre ville] décalage UTC" — rappelez-vous qu’il peut changer avec l’heure d’été.</p>' },
                { question: 'Que se passe-t-il s’il n’y a aucun chevauchement ?', answer: '<p>Le calculateur affichera 0 heure de chevauchement et "Non" pour l’existence d’un chevauchement.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'Décalage UTC Lieu 1 (heures)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Début de Travail Lieu 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Fin de Travail Lieu 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'Décalage UTC Lieu 2 (heures)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Début de Travail Lieu 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Fin de Travail Lieu 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Heures de Chevauchement', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Début du Chevauchement (Heure Lieu 1)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Fin du Chevauchement (Heure Lieu 1)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Début du Chevauchement (Heure Lieu 2)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Fin du Chevauchement (Heure Lieu 2)', precision: 1 },
                { name: 'has_overlap', label: 'Chevauchement Existant ?' },
            ],
        },
        it: {
            slug: 'calcolatore-di-sovrapposizione-fuso-orario-riunioni', title: 'Calcolatore di Sovrapposizione Fuso Orario Riunioni | Calcolatori di Data e Ora', h1: 'Calcolatore di Sovrapposizione Fuso Orario Riunioni',
            meta_title: 'Calcolatore di Sovrapposizione Fuso Orario | Trova le Ore Lavorative Condivise',
            meta_description: 'Trova le ore lavorative sovrapposte tra due fusi orari per pianificare riunioni.',
            short_answer: 'Questo calcolatore trova le ore lavorative sovrapposte tra due località, dato il loro scostamento UTC e la finestra di orario lavorativo.',
            intro_text: '<p>Inserisci lo scostamento UTC di ciascuna località e la tipica finestra di orario lavorativo, e questo strumento troverà le ore di sovrapposizione quando entrambe le località lavorano.</p>',
            key_points: [
                '<b>Scostamenti UTC fissi:</b> questo calcolatore usa scostamenti fissi anziché un database completo dei fusi orari.',
                '<b>Esempio:</b> New York (UTC-5, 9-17) e Londra (UTC+1, 9-17) condividono una sovrapposizione a seconda degli scostamenti.',
                '<b>Nessuna sovrapposizione:</b> se gli orari lavorativi non si intersecano affatto, il calcolatore riporta zero ore di sovrapposizione.',
            ],
            howto: [
                { question: 'Come trovo lo scostamento UTC attuale della mia località?', answer: '<p>Cerca "[la tua città] scostamento UTC" — ricorda che può cambiare con l’ora legale.</p>' },
                { question: 'Cosa succede se non c’è sovrapposizione?', answer: '<p>Il calcolatore mostrerà 0 ore di sovrapposizione e "No" per l’esistenza di sovrapposizione.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'Scostamento UTC Località 1 (ore)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Inizio Lavoro Località 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Fine Lavoro Località 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'Scostamento UTC Località 2 (ore)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Inizio Lavoro Località 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Fine Lavoro Località 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Ore di Sovrapposizione', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Inizio Sovrapposizione (Ora Località 1)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Fine Sovrapposizione (Ora Località 1)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Inizio Sovrapposizione (Ora Località 2)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Fine Sovrapposizione (Ora Località 2)', precision: 1 },
                { name: 'has_overlap', label: 'Esiste Sovrapposizione?' },
            ],
        },
        de: {
            slug: 'meeting-zeitzonen-ueberschneidungs-rechner', title: 'Meeting-Zeitzonen-Überschneidungs-Rechner | Datum- und Zeitrechner', h1: 'Meeting-Zeitzonen-Überschneidungs-Rechner',
            meta_title: 'Meeting-Zeitzonen-Überschneidungs-Rechner | Gemeinsame Arbeitsstunden Finden',
            meta_description: 'Finden Sie die sich überschneidenden Arbeitsstunden zwischen zwei Zeitzonen zur Terminplanung.',
            short_answer: 'Dieser Rechner findet die sich überschneidenden Arbeitsstunden zwischen zwei Orten, basierend auf ihrem UTC-Versatz und Arbeitsstundenfenster.',
            intro_text: '<p>Geben Sie den UTC-Versatz jedes Ortes und das typische Arbeitsstundenfenster ein, und dieses Tool findet die Überschneidungsstunden, wenn beide Orte arbeiten.</p>',
            key_points: [
                '<b>Feste UTC-Versätze:</b> dieser Rechner verwendet feste Stundenversätze statt einer vollständigen Zeitzonendatenbank.',
                '<b>Beispiel:</b> New York (UTC-5, 9-17) und London (UTC+1, 9-17) teilen sich eine Überschneidung je nach Versatz.',
                '<b>Keine Überschneidung:</b> wenn sich die Arbeitsstunden überhaupt nicht überschneiden, meldet der Rechner null Überschneidungsstunden.',
            ],
            howto: [
                { question: 'Wie finde ich den aktuellen UTC-Versatz meines Ortes?', answer: '<p>Suchen Sie nach "[Ihre Stadt] UTC-Versatz" — denken Sie daran, dass er sich mit der Sommerzeit ändern kann.</p>' },
                { question: 'Was, wenn es überhaupt keine Überschneidung gibt?', answer: '<p>Der Rechner zeigt 0 Überschneidungsstunden und "Nein" für das Vorhandensein einer Überschneidung.</p>' },
            ],
            inputs: [
                { name: 'offset1', label: 'UTC-Versatz Ort 1 (Stunden)', type: 'number', min: -12, max: 14, placeholder: '-5' },
                { name: 'start1', label: 'Arbeitsbeginn Ort 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end1', label: 'Arbeitsende Ort 1 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
                { name: 'offset2', label: 'UTC-Versatz Ort 2 (Stunden)', type: 'number', min: -12, max: 14, placeholder: '1' },
                { name: 'start2', label: 'Arbeitsbeginn Ort 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '9' },
                { name: 'end2', label: 'Arbeitsende Ort 2 (24h)', type: 'number', min: 0, max: 24, placeholder: '17' },
            ],
            outputs: [
                { name: 'overlap_hours', label: 'Überschneidungsstunden', precision: 2 },
                { name: 'overlap_start_loc1', label: 'Überschneidungsbeginn (Zeit Ort 1)', precision: 1 },
                { name: 'overlap_end_loc1', label: 'Überschneidungsende (Zeit Ort 1)', precision: 1 },
                { name: 'overlap_start_loc2', label: 'Überschneidungsbeginn (Zeit Ort 2)', precision: 1 },
                { name: 'overlap_end_loc2', label: 'Überschneidungsende (Zeit Ort 2)', precision: 1 },
                { name: 'has_overlap', label: 'Überschneidung Vorhanden?' },
            ],
        },
    },
}

export const tools: ToolDef[] = [
    romanDateTool, ageCalculatorTool, ageCheckerTool, howOldAmITool, countdownTimerTool,
    dateAddSubtractTool, daysBusinessDaysTool, dateDifferenceTool, datetimeDifferenceTool, sunriseSunsetTool,
    stopwatchTool, workHoursTool, clockInOutTool, shiftCoverageTool, focusSessionTool,
    contextSwitchingTool, meetingOverlapTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: DATE_TIME_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: DATE_TIME_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} date & time calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
