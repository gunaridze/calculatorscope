// One-off script: seeds 12 new Percent & Ratio Calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-percent-ratio-calculators.ts
//
// Tool IDs 1204-1215, category_id '10' (Percent & Ratio, top-level,
// pre-seeded in all 8 locales with 0 tools). No explicit tool list was
// given, only 5 themes (percent increase/decrease/change, tip/tax/discount,
// ratios/proportions/aspect-ratios) for 12 tools; the concrete list was
// proposed and confirmed with the user before writing content, deliberately
// avoiding duplication with Finance's existing VAT/Discount/accounting-ratio
// tools (built as generic quick-percent tools, not finance-specific ones).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PERCENT_RATIO_CATEGORY_ID = '10'

type InputField = {
    name: string
    label: string
    type: 'number' | 'select' | 'text' | 'textarea'
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
    type: string
    config_json: {
        inputs: Array<{ key: string; default?: number | string }>
        functions: Record<string, { type: string; functionName: string; params: Record<string, string> }>
        outputs: Array<{ key: string; precision?: number }>
    }
    locales: Record<string, LocaleContent>
}

// ============================================================
// 1204: Percentage Calculator (What is X% of Y?)
// ============================================================
const PERCENT_INPUT_LABEL: Record<string, string> = {
    en: 'Percent (%)', ru: 'Процент (%)', lv: 'Procenti (%)', pl: 'Procent (%)',
    es: 'Porcentaje (%)', fr: 'Pourcentage (%)', it: 'Percentuale (%)', de: 'Prozent (%)',
}
const BASE_NUMBER_LABEL: Record<string, string> = {
    en: 'Of This Number', ru: 'От этого числа', lv: 'No Šī Skaitļa', pl: 'Z Tej Liczby',
    es: 'De Este Número', fr: 'De Ce Nombre', it: 'Di Questo Numero', de: 'Von Dieser Zahl',
}
const RESULT_LABEL: Record<string, string> = {
    en: 'Result', ru: 'Результат', lv: 'Rezultāts', pl: 'Wynik',
    es: 'Resultado', fr: 'Résultat', it: 'Risultato', de: 'Ergebnis',
}

const percentageCalculatorTool: ToolDef = {
    id: '1204',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'percent', default: 25 }, { key: 'base_number', default: 200 }],
        functions: { result: { type: 'function', functionName: 'percentageCalculator', params: { percent: 'percent', base_number: 'base_number' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'percentage-calculator', title: 'Percentage Calculator', h1: 'Percentage Calculator',
            meta_title: 'Percentage Calculator | What is X% of Y?',
            meta_description: 'Calculate what a given percentage of any number is — instantly find X% of Y.',
            short_answer: 'This calculator finds a percentage of a number, e.g. 25% of 200 = 50.',
            intro_text: '<p>Enter a percentage and a number to instantly find what that percentage of the number is — the most basic and commonly needed percentage calculation.</p>',
            key_points: [
                '<b>Formula:</b> Result = (Percent ÷ 100) × Number.',
                '<b>Example:</b> 25% of 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Works with decimals too:</b> e.g. 7.5% of 340 works exactly the same way.',
            ],
            howto: [
                { question: 'How do I find what percentage one number is of another?', answer: '<p>That\'s a different calculation (reverse percentage) — use our Reverse Percentage Calculator for that instead.</p>' },
                { question: 'Can I use negative numbers?', answer: '<p>Yes — the formula works the same way and returns a negative result if the base number is negative.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.en, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-protsentov', title: 'Калькулятор процентов', h1: 'Калькулятор процентов',
            meta_title: 'Калькулятор процентов | Сколько составляет X% от Y?',
            meta_description: 'Рассчитайте, сколько составляет заданный процент от любого числа — мгновенно найдите X% от Y.',
            short_answer: 'Этот калькулятор находит процент от числа, например 25% от 200 = 50.',
            intro_text: '<p>Введите процент и число, чтобы мгновенно узнать, сколько составляет этот процент от числа — самый базовый и часто нужный расчёт с процентами.</p>',
            key_points: [
                '<b>Формула:</b> Результат = (Процент ÷ 100) × Число.',
                '<b>Пример:</b> 25% от 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Работает и с дробными числами:</b> например, 7,5% от 340 считается точно так же.',
            ],
            howto: [
                { question: 'Как узнать, сколько процентов одно число составляет от другого?', answer: '<p>Это другой расчёт (обратный процент) — используйте наш Калькулятор обратного процента.</p>' },
                { question: 'Можно ли использовать отрицательные числа?', answer: '<p>Да — формула работает так же и даёт отрицательный результат, если базовое число отрицательное.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.ru, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'procentu-kalkulators', title: 'Procentu Kalkulators', h1: 'Procentu Kalkulators',
            meta_title: 'Procentu Kalkulators | Cik ir X% no Y?',
            meta_description: 'Aprēķiniet, cik ir noteikts procents no jebkura skaitļa — uzreiz atrodiet X% no Y.',
            short_answer: 'Šis kalkulators atrod procentu no skaitļa, piemēram, 25% no 200 = 50.',
            intro_text: '<p>Ievadiet procentu un skaitli, lai uzreiz uzzinātu, cik ir šis procents no skaitļa — visbiežāk nepieciešamais procentu aprēķins.</p>',
            key_points: [
                '<b>Formula:</b> Rezultāts = (Procenti ÷ 100) × Skaitlis.',
                '<b>Piemērs:</b> 25% no 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Darbojas arī ar decimāldaļskaitļiem:</b> piemēram, 7,5% no 340 aprēķina tieši tāpat.',
            ],
            howto: [
                { question: 'Kā uzzināt, cik procentu viens skaitlis ir no otra?', answer: '<p>Tas ir cits aprēķins (apgrieztais procents) — izmantojiet mūsu Apgrieztā Procenta Kalkulatoru.</p>' },
                { question: 'Vai varu izmantot negatīvus skaitļus?', answer: '<p>Jā — formula darbojas tāpat un atgriež negatīvu rezultātu, ja bāzes skaitlis ir negatīvs.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.lv, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-procentowy', title: 'Kalkulator Procentowy', h1: 'Kalkulator Procentowy',
            meta_title: 'Kalkulator Procentowy | Ile to X% z Y?',
            meta_description: 'Oblicz, ile wynosi dany procent z dowolnej liczby — natychmiast znajdź X% z Y.',
            short_answer: 'Ten kalkulator znajduje procent z liczby, np. 25% z 200 = 50.',
            intro_text: '<p>Wpisz procent i liczbę, aby natychmiast dowiedzieć się, ile wynosi ten procent z liczby — najbardziej podstawowe i często potrzebne obliczenie procentowe.</p>',
            key_points: [
                '<b>Wzór:</b> Wynik = (Procent ÷ 100) × Liczba.',
                '<b>Przykład:</b> 25% z 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Działa też z ułamkami dziesiętnymi:</b> np. 7,5% z 340 liczy się dokładnie tak samo.',
            ],
            howto: [
                { question: 'Jak dowiedzieć się, jakim procentem jednej liczby jest druga?', answer: '<p>To inne obliczenie (procent odwrotny) — użyj naszego Kalkulatora Procentu Odwrotnego.</p>' },
                { question: 'Czy mogę używać liczb ujemnych?', answer: '<p>Tak — wzór działa tak samo i zwraca ujemny wynik, jeśli liczba bazowa jest ujemna.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.pl, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-porcentaje', title: 'Calculadora de Porcentaje', h1: 'Calculadora de Porcentaje',
            meta_title: 'Calculadora de Porcentaje | ¿Cuánto es X% de Y?',
            meta_description: 'Calcula cuánto es un porcentaje dado de cualquier número — encuentra instantáneamente X% de Y.',
            short_answer: 'Esta calculadora encuentra un porcentaje de un número, p. ej. 25% de 200 = 50.',
            intro_text: '<p>Introduce un porcentaje y un número para saber instantáneamente cuánto es ese porcentaje del número — el cálculo de porcentaje más básico y comúnmente necesario.</p>',
            key_points: [
                '<b>Fórmula:</b> Resultado = (Porcentaje ÷ 100) × Número.',
                '<b>Ejemplo:</b> 25% de 200 = (25 ÷ 100) × 200 = 50.',
                '<b>También funciona con decimales:</b> p. ej. 7.5% de 340 se calcula exactamente igual.',
            ],
            howto: [
                { question: '¿Cómo encuentro qué porcentaje es un número de otro?', answer: '<p>Ese es un cálculo diferente (porcentaje inverso) — usa nuestra Calculadora de Porcentaje Inverso para eso.</p>' },
                { question: '¿Puedo usar números negativos?', answer: '<p>Sí — la fórmula funciona igual y devuelve un resultado negativo si el número base es negativo.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.es, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-pourcentage', title: 'Calculateur de Pourcentage', h1: 'Calculateur de Pourcentage',
            meta_title: 'Calculateur de Pourcentage | Combien Fait X% de Y ?',
            meta_description: 'Calculez combien fait un pourcentage donné de n\'importe quel nombre — trouvez instantanément X% de Y.',
            short_answer: 'Ce calculateur trouve un pourcentage d\'un nombre, ex. 25% de 200 = 50.',
            intro_text: '<p>Entrez un pourcentage et un nombre pour savoir instantanément combien fait ce pourcentage du nombre — le calcul de pourcentage le plus basique et le plus couramment nécessaire.</p>',
            key_points: [
                '<b>Formule :</b> Résultat = (Pourcentage ÷ 100) × Nombre.',
                '<b>Exemple :</b> 25% de 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Fonctionne aussi avec les décimales :</b> ex. 7,5% de 340 se calcule exactement de la même façon.',
            ],
            howto: [
                { question: 'Comment trouver quel pourcentage un nombre représente d\'un autre ?', answer: '<p>C\'est un calcul différent (pourcentage inverse) — utilisez notre Calculateur de Pourcentage Inverse pour cela.</p>' },
                { question: 'Puis-je utiliser des nombres négatifs ?', answer: '<p>Oui — la formule fonctionne de la même façon et renvoie un résultat négatif si le nombre de base est négatif.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.fr, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-percentuale', title: 'Calcolatore di Percentuale', h1: 'Calcolatore di Percentuale',
            meta_title: 'Calcolatore di Percentuale | Quanto è il X% di Y?',
            meta_description: 'Calcola quanto è una data percentuale di qualsiasi numero — trova istantaneamente il X% di Y.',
            short_answer: 'Questo calcolatore trova una percentuale di un numero, es. il 25% di 200 = 50.',
            intro_text: '<p>Inserisci una percentuale e un numero per sapere istantaneamente quanto è quella percentuale del numero — il calcolo percentuale più basilare e comunemente necessario.</p>',
            key_points: [
                '<b>Formula:</b> Risultato = (Percentuale ÷ 100) × Numero.',
                '<b>Esempio:</b> il 25% di 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Funziona anche con i decimali:</b> es. il 7,5% di 340 si calcola esattamente allo stesso modo.',
            ],
            howto: [
                { question: 'Come trovo quale percentuale un numero è di un altro?', answer: '<p>Questo è un calcolo diverso (percentuale inversa) — usa il nostro Calcolatore di Percentuale Inversa per questo.</p>' },
                { question: 'Posso usare numeri negativi?', answer: '<p>Sì — la formula funziona allo stesso modo e restituisce un risultato negativo se il numero base è negativo.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.it, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'prozentrechner', title: 'Prozentrechner', h1: 'Prozentrechner',
            meta_title: 'Prozentrechner | Wie Viel Sind X% von Y?',
            meta_description: 'Berechnen Sie, wie viel ein bestimmter Prozentsatz einer beliebigen Zahl ist — finden Sie sofort X% von Y.',
            short_answer: 'Dieser Rechner findet einen Prozentsatz einer Zahl, z.B. 25% von 200 = 50.',
            intro_text: '<p>Geben Sie einen Prozentsatz und eine Zahl ein, um sofort zu erfahren, wie viel dieser Prozentsatz der Zahl ist — die grundlegendste und am häufigsten benötigte Prozentberechnung.</p>',
            key_points: [
                '<b>Formel:</b> Ergebnis = (Prozent ÷ 100) × Zahl.',
                '<b>Beispiel:</b> 25% von 200 = (25 ÷ 100) × 200 = 50.',
                '<b>Funktioniert auch mit Dezimalzahlen:</b> z.B. 7,5% von 340 wird genauso berechnet.',
            ],
            howto: [
                { question: 'Wie finde ich heraus, wie viel Prozent eine Zahl von einer anderen ist?', answer: '<p>Das ist eine andere Berechnung (umgekehrter Prozentsatz) — nutzen Sie dafür unseren Umgekehrten-Prozentsatz-Rechner.</p>' },
                { question: 'Kann ich negative Zahlen verwenden?', answer: '<p>Ja — die Formel funktioniert genauso und liefert ein negatives Ergebnis, wenn die Basiszahl negativ ist.</p>' },
            ],
            inputs: [
                { name: 'percent', label: PERCENT_INPUT_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '25' },
                { name: 'base_number', label: BASE_NUMBER_LABEL.de, type: 'number', min: -1000000000, max: 1000000000, placeholder: '200' },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1205: Percent Change Calculator
// ============================================================
const OLD_VALUE_LABEL: Record<string, string> = {
    en: 'Old Value', ru: 'Старое значение', lv: 'Sākotnējā Vērtība', pl: 'Stara Wartość',
    es: 'Valor Antiguo', fr: 'Ancienne Valeur', it: 'Valore Precedente', de: 'Alter Wert',
}
const NEW_VALUE_LABEL: Record<string, string> = {
    en: 'New Value', ru: 'Новое значение', lv: 'Jaunā Vērtība', pl: 'Nowa Wartość',
    es: 'Valor Nuevo', fr: 'Nouvelle Valeur', it: 'Nuovo Valore', de: 'Neuer Wert',
}
const CHANGE_AMOUNT_LABEL: Record<string, string> = {
    en: 'Change Amount', ru: 'Величина изменения', lv: 'Izmaiņu Apjoms', pl: 'Wielkość Zmiany',
    es: 'Cantidad de Cambio', fr: 'Montant du Changement', it: 'Importo della Variazione', de: 'Änderungsbetrag',
}
const PERCENT_CHANGE_LABEL: Record<string, string> = {
    en: 'Percent Change', ru: 'Изменение в процентах', lv: 'Procentuālās Izmaiņas', pl: 'Zmiana Procentowa',
    es: 'Cambio Porcentual', fr: 'Variation en Pourcentage', it: 'Variazione Percentuale', de: 'Prozentuale Änderung',
}
const DIRECTION_LABEL: Record<string, string> = {
    en: 'Direction', ru: 'Направление', lv: 'Virziens', pl: 'Kierunek',
    es: 'Dirección', fr: 'Direction', it: 'Direzione', de: 'Richtung',
}

const percentChangeCalculatorTool: ToolDef = {
    id: '1205',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'old_value', default: 50 }, { key: 'new_value', default: 75 }],
        functions: { result: { type: 'function', functionName: 'percentChangeCalculator', params: { old_value: 'old_value', new_value: 'new_value' } } },
        outputs: [{ key: 'change_amount', precision: 2 }, { key: 'percent_change', precision: 2 }, { key: 'direction' }],
    },
    locales: {
        en: {
            slug: 'percent-change-calculator', title: 'Percent Change Calculator', h1: 'Percent Change Calculator',
            meta_title: 'Percent Change Calculator | Find the % Increase or Decrease Between Two Numbers',
            meta_description: 'Calculate the percentage change between an old and new value, and instantly see whether it\'s an increase or decrease.',
            short_answer: 'This calculator finds the percent change between two numbers, e.g. from 50 to 75 is a 50% increase.',
            intro_text: '<p>Enter an old value and a new value to find the percentage change between them — automatically detecting whether it\'s an increase or a decrease.</p>',
            key_points: [
                '<b>Formula:</b> Percent Change = |(New Value − Old Value) ÷ Old Value| × 100.',
                '<b>Example:</b> from 50 to 75 = (25 ÷ 50) × 100 = 50% increase.',
                '<b>Direction:</b> the result is always shown as a positive percentage, with a separate "increase" or "decrease" label so it\'s unambiguous either way.',
            ],
            howto: [
                { question: 'What if the old value is zero?', answer: '<p>Percent change is undefined when starting from zero (any increase from zero is technically an infinite percentage), so this calculator returns 0% in that edge case rather than an error.</p>' },
                { question: 'Is this the same as percent difference?', answer: '<p>Not quite — percent change measures change relative to the starting (old) value specifically, while percent difference (less common) sometimes uses the average of the two values instead.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.en, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.en, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.en, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.en, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.en },
            ],
        },
        ru: {
            slug: 'kalkulyator-izmeneniya-v-protsentah', title: 'Калькулятор изменения в процентах', h1: 'Калькулятор изменения в процентах',
            meta_title: 'Калькулятор изменения в процентах | Найдите % роста или падения между двумя числами',
            meta_description: 'Рассчитайте процентное изменение между старым и новым значением и мгновенно узнайте, рост это или падение.',
            short_answer: 'Этот калькулятор находит процентное изменение между двумя числами, например от 50 до 75 — это рост на 50%.',
            intro_text: '<p>Введите старое и новое значение, чтобы найти процентное изменение между ними — автоматически определяя, рост это или падение.</p>',
            key_points: [
                '<b>Формула:</b> Изменение в процентах = |(Новое значение − Старое значение) ÷ Старое значение| × 100.',
                '<b>Пример:</b> от 50 до 75 = (25 ÷ 50) × 100 = рост на 50%.',
                '<b>Направление:</b> результат всегда показывается как положительный процент, с отдельной меткой "рост" или "падение".',
            ],
            howto: [
                { question: 'Что если старое значение равно нулю?', answer: '<p>Процентное изменение не определено при старте с нуля, поэтому калькулятор возвращает 0% в этом крайнем случае, а не ошибку.</p>' },
                { question: 'Это то же самое, что процентная разница?', answer: '<p>Не совсем — процентное изменение измеряется относительно начального (старого) значения, а процентная разница иногда использует среднее двух значений.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.ru, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.ru, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.ru, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.ru },
            ],
        },
        lv: {
            slug: 'procentualo-izmainu-kalkulators', title: 'Procentuālo Izmaiņu Kalkulators', h1: 'Procentuālo Izmaiņu Kalkulators',
            meta_title: 'Procentuālo Izmaiņu Kalkulators | Atrodiet % Pieaugumu vai Samazinājumu Starp Diviem Skaitļiem',
            meta_description: 'Aprēķiniet procentuālo izmaiņu starp veco un jauno vērtību un uzreiz redziet, vai tas ir pieaugums vai samazinājums.',
            short_answer: 'Šis kalkulators atrod procentuālo izmaiņu starp diviem skaitļiem, piemēram, no 50 uz 75 ir 50% pieaugums.',
            intro_text: '<p>Ievadiet veco un jauno vērtību, lai atrastu procentuālo izmaiņu starp tām — automātiski nosakot, vai tas ir pieaugums vai samazinājums.</p>',
            key_points: [
                '<b>Formula:</b> Procentuālās Izmaiņas = |(Jaunā Vērtība − Sākotnējā Vērtība) ÷ Sākotnējā Vērtība| × 100.',
                '<b>Piemērs:</b> no 50 uz 75 = (25 ÷ 50) × 100 = 50% pieaugums.',
                '<b>Virziens:</b> rezultāts vienmēr tiek parādīts kā pozitīvs procents, ar atsevišķu "pieaugums" vai "samazinājums" atzīmi.',
            ],
            howto: [
                { question: 'Kas notiek, ja sākotnējā vērtība ir nulle?', answer: '<p>Procentuālā izmaiņa nav definēta, sākot no nulles, tāpēc šis kalkulators šajā gadījumā atgriež 0%, nevis kļūdu.</p>' },
                { question: 'Vai tas ir tas pats, kas procentuālā starpība?', answer: '<p>Ne gluži — procentuālā izmaiņa mēra izmaiņu attiecībā pret sākotnējo vērtību, bet procentuālā starpība dažreiz izmanto abu vērtību vidējo.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.lv, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.lv, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.lv, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.lv },
            ],
        },
        pl: {
            slug: 'kalkulator-zmiany-procentowej', title: 'Kalkulator Zmiany Procentowej', h1: 'Kalkulator Zmiany Procentowej',
            meta_title: 'Kalkulator Zmiany Procentowej | Znajdź % Wzrostu lub Spadku Między Dwiema Liczbami',
            meta_description: 'Oblicz zmianę procentową między starą a nową wartością i natychmiast zobacz, czy to wzrost, czy spadek.',
            short_answer: 'Ten kalkulator znajduje zmianę procentową między dwiema liczbami, np. z 50 do 75 to wzrost o 50%.',
            intro_text: '<p>Wpisz starą i nową wartość, aby znaleźć zmianę procentową między nimi — automatycznie wykrywając, czy to wzrost, czy spadek.</p>',
            key_points: [
                '<b>Wzór:</b> Zmiana Procentowa = |(Nowa Wartość − Stara Wartość) ÷ Stara Wartość| × 100.',
                '<b>Przykład:</b> z 50 do 75 = (25 ÷ 50) × 100 = wzrost o 50%.',
                '<b>Kierunek:</b> wynik jest zawsze pokazywany jako dodatni procent, z osobną etykietą "wzrost" lub "spadek".',
            ],
            howto: [
                { question: 'Co jeśli stara wartość wynosi zero?', answer: '<p>Zmiana procentowa jest niezdefiniowana przy starcie od zera, więc ten kalkulator zwraca w tym przypadku 0%, a nie błąd.</p>' },
                { question: 'Czy to to samo co różnica procentowa?', answer: '<p>Nie do końca — zmiana procentowa mierzy zmianę względem wartości początkowej, a różnica procentowa czasem wykorzystuje średnią z obu wartości.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.pl, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.pl, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.pl, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.pl },
            ],
        },
        es: {
            slug: 'calculadora-de-cambio-porcentual', title: 'Calculadora de Cambio Porcentual', h1: 'Calculadora de Cambio Porcentual',
            meta_title: 'Calculadora de Cambio Porcentual | Encuentra el % de Aumento o Disminución Entre Dos Números',
            meta_description: 'Calcula el cambio porcentual entre un valor antiguo y uno nuevo, y ve al instante si es un aumento o una disminución.',
            short_answer: 'Esta calculadora encuentra el cambio porcentual entre dos números, p. ej. de 50 a 75 es un aumento del 50%.',
            intro_text: '<p>Introduce un valor antiguo y uno nuevo para encontrar el cambio porcentual entre ellos — detectando automáticamente si es un aumento o una disminución.</p>',
            key_points: [
                '<b>Fórmula:</b> Cambio Porcentual = |(Valor Nuevo − Valor Antiguo) ÷ Valor Antiguo| × 100.',
                '<b>Ejemplo:</b> de 50 a 75 = (25 ÷ 50) × 100 = aumento del 50%.',
                '<b>Dirección:</b> el resultado siempre se muestra como un porcentaje positivo, con una etiqueta separada de "aumento" o "disminución".',
            ],
            howto: [
                { question: '¿Qué pasa si el valor antiguo es cero?', answer: '<p>El cambio porcentual no está definido al partir de cero, así que esta calculadora devuelve 0% en ese caso extremo, no un error.</p>' },
                { question: '¿Es esto lo mismo que la diferencia porcentual?', answer: '<p>No exactamente — el cambio porcentual mide el cambio relativo al valor inicial, mientras que la diferencia porcentual a veces usa el promedio de ambos valores.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.es, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.es, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.es, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.es, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.es },
            ],
        },
        fr: {
            slug: 'calculateur-de-variation-en-pourcentage', title: 'Calculateur de Variation en Pourcentage', h1: 'Calculateur de Variation en Pourcentage',
            meta_title: 'Calculateur de Variation en Pourcentage | Trouvez le % d\'Augmentation ou de Diminution',
            meta_description: 'Calculez la variation en pourcentage entre une ancienne et une nouvelle valeur, et voyez instantanément s\'il s\'agit d\'une augmentation ou d\'une diminution.',
            short_answer: 'Ce calculateur trouve la variation en pourcentage entre deux nombres, ex. de 50 à 75 est une augmentation de 50%.',
            intro_text: '<p>Entrez une ancienne valeur et une nouvelle valeur pour trouver la variation en pourcentage entre elles — détectant automatiquement s\'il s\'agit d\'une augmentation ou d\'une diminution.</p>',
            key_points: [
                '<b>Formule :</b> Variation en Pourcentage = |(Nouvelle Valeur − Ancienne Valeur) ÷ Ancienne Valeur| × 100.',
                '<b>Exemple :</b> de 50 à 75 = (25 ÷ 50) × 100 = augmentation de 50%.',
                '<b>Direction :</b> le résultat est toujours affiché sous forme de pourcentage positif, avec une étiquette séparée "augmentation" ou "diminution".',
            ],
            howto: [
                { question: 'Que se passe-t-il si l\'ancienne valeur est zéro ?', answer: '<p>La variation en pourcentage n\'est pas définie en partant de zéro, donc ce calculateur renvoie 0% dans ce cas limite, pas une erreur.</p>' },
                { question: 'Est-ce la même chose que la différence en pourcentage ?', answer: '<p>Pas tout à fait — la variation en pourcentage mesure le changement par rapport à la valeur de départ, tandis que la différence en pourcentage utilise parfois la moyenne des deux valeurs.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.fr, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.fr, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.fr, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.fr },
            ],
        },
        it: {
            slug: 'calcolatore-di-variazione-percentuale', title: 'Calcolatore di Variazione Percentuale', h1: 'Calcolatore di Variazione Percentuale',
            meta_title: 'Calcolatore di Variazione Percentuale | Trova la % di Aumento o Diminuzione tra Due Numeri',
            meta_description: 'Calcola la variazione percentuale tra un valore precedente e uno nuovo, e scopri istantaneamente se è un aumento o una diminuzione.',
            short_answer: 'Questo calcolatore trova la variazione percentuale tra due numeri, es. da 50 a 75 è un aumento del 50%.',
            intro_text: '<p>Inserisci un valore precedente e uno nuovo per trovare la variazione percentuale tra loro — rilevando automaticamente se è un aumento o una diminuzione.</p>',
            key_points: [
                '<b>Formula:</b> Variazione Percentuale = |(Nuovo Valore − Valore Precedente) ÷ Valore Precedente| × 100.',
                '<b>Esempio:</b> da 50 a 75 = (25 ÷ 50) × 100 = aumento del 50%.',
                '<b>Direzione:</b> il risultato viene sempre mostrato come percentuale positiva, con un\'etichetta separata "aumento" o "diminuzione".',
            ],
            howto: [
                { question: 'Cosa succede se il valore precedente è zero?', answer: '<p>La variazione percentuale non è definita partendo da zero, quindi questo calcolatore restituisce 0% in questo caso limite, non un errore.</p>' },
                { question: 'È lo stesso della differenza percentuale?', answer: '<p>Non esattamente — la variazione percentuale misura il cambiamento rispetto al valore iniziale, mentre la differenza percentuale a volte usa la media dei due valori.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.it, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.it, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.it, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.it, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.it },
            ],
        },
        de: {
            slug: 'prozentuale-veranderung-rechner', title: 'Prozentuale-Veränderung-Rechner', h1: 'Prozentuale-Veränderung-Rechner',
            meta_title: 'Prozentuale-Veränderung-Rechner | Finden Sie den %-Anstieg oder -Rückgang Zwischen Zwei Zahlen',
            meta_description: 'Berechnen Sie die prozentuale Veränderung zwischen einem alten und einem neuen Wert und sehen Sie sofort, ob es ein Anstieg oder Rückgang ist.',
            short_answer: 'Dieser Rechner findet die prozentuale Veränderung zwischen zwei Zahlen, z.B. ist von 50 auf 75 ein Anstieg von 50%.',
            intro_text: '<p>Geben Sie einen alten und einen neuen Wert ein, um die prozentuale Veränderung zwischen ihnen zu finden — automatisch erkannt, ob es sich um einen Anstieg oder Rückgang handelt.</p>',
            key_points: [
                '<b>Formel:</b> Prozentuale Veränderung = |(Neuer Wert − Alter Wert) ÷ Alter Wert| × 100.',
                '<b>Beispiel:</b> von 50 auf 75 = (25 ÷ 50) × 100 = Anstieg von 50%.',
                '<b>Richtung:</b> das Ergebnis wird immer als positiver Prozentsatz angezeigt, mit einer separaten Kennzeichnung "Anstieg" oder "Rückgang".',
            ],
            howto: [
                { question: 'Was passiert, wenn der alte Wert null ist?', answer: '<p>Die prozentuale Veränderung ist bei einem Start von null nicht definiert, daher gibt dieser Rechner in diesem Grenzfall 0% zurück, keinen Fehler.</p>' },
                { question: 'Ist das dasselbe wie die prozentuale Differenz?', answer: '<p>Nicht ganz — die prozentuale Veränderung misst die Änderung relativ zum Ausgangswert, während die prozentuale Differenz manchmal den Durchschnitt beider Werte verwendet.</p>' },
            ],
            inputs: [
                { name: 'old_value', label: OLD_VALUE_LABEL.de, type: 'number', placeholder: '50' },
                { name: 'new_value', label: NEW_VALUE_LABEL.de, type: 'number', placeholder: '75' },
            ],
            outputs: [
                { name: 'change_amount', label: CHANGE_AMOUNT_LABEL.de, precision: 2 },
                { name: 'percent_change', label: PERCENT_CHANGE_LABEL.de, precision: 2 },
                { name: 'direction', label: DIRECTION_LABEL.de },
            ],
        },
    },
}

// ============================================================
// 1206: Percent Increase Calculator
// ============================================================
const ORIGINAL_VALUE_LABEL: Record<string, string> = {
    en: 'Original Value', ru: 'Исходное значение', lv: 'Sākotnējā Vērtība', pl: 'Wartość Początkowa',
    es: 'Valor Original', fr: 'Valeur Initiale', it: 'Valore Originale', de: 'Ursprungswert',
}
const INCREASE_PERCENT_LABEL: Record<string, string> = {
    en: 'Increase By (%)', ru: 'Увеличить на (%)', lv: 'Palielināt Par (%)', pl: 'Zwiększ o (%)',
    es: 'Aumentar en (%)', fr: 'Augmenter de (%)', it: 'Aumenta del (%)', de: 'Erhöhen Um (%)',
}
const INCREASE_AMOUNT_LABEL: Record<string, string> = {
    en: 'Increase Amount', ru: 'Величина увеличения', lv: 'Palielinājuma Apjoms', pl: 'Wielkość Zwiększenia',
    es: 'Cantidad de Aumento', fr: 'Montant de l\'Augmentation', it: 'Importo dell\'Aumento', de: 'Erhöhungsbetrag',
}
const NEW_VALUE_RESULT_LABEL: Record<string, string> = {
    en: 'New Value', ru: 'Новое значение', lv: 'Jaunā Vērtība', pl: 'Nowa Wartość',
    es: 'Nuevo Valor', fr: 'Nouvelle Valeur', it: 'Nuovo Valore', de: 'Neuer Wert',
}

const percentIncreaseCalculatorTool: ToolDef = {
    id: '1206',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'original_value', default: 200 }, { key: 'percent', default: 15 }],
        functions: { result: { type: 'function', functionName: 'percentIncreaseCalculator', params: { original_value: 'original_value', percent: 'percent' } } },
        outputs: [{ key: 'increase_amount', precision: 2 }, { key: 'new_value', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'percent-increase-calculator', title: 'Percent Increase Calculator', h1: 'Percent Increase Calculator',
            meta_title: 'Percent Increase Calculator | Increase a Number by a Percentage',
            meta_description: 'Calculate the result of increasing any number by a given percentage — instantly find the new value and the increase amount.',
            short_answer: 'This calculator increases a number by a percentage, e.g. 200 increased by 15% = 230.',
            intro_text: '<p>Enter an original value and a percentage to find the increase amount and the resulting new value — useful for raises, price increases, and growth projections.</p>',
            key_points: [
                '<b>Formula:</b> New Value = Original Value × (1 + Percent ÷ 100).',
                '<b>Example:</b> 200 increased by 15% = 200 × 1.15 = 230 (an increase of 30).',
                '<b>Common uses:</b> salary raises, rent increases, price hikes, and year-over-year growth projections.',
            ],
            howto: [
                { question: 'How is this different from the Percent Change Calculator?', answer: '<p>Percent Change finds the percentage between two known values; this calculator goes the other way — you know the percentage and want to find the new value.</p>' },
                { question: 'Can I use this for compound increases over multiple periods?', answer: '<p>Not directly — this calculates a single increase. For multiple compounding periods, you\'d apply this calculation repeatedly or use a compound interest calculator.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.en, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.en, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-uvelicheniya-na-protsent', title: 'Калькулятор увеличения на процент', h1: 'Калькулятор увеличения на процент',
            meta_title: 'Калькулятор увеличения на процент | Увеличьте число на процент',
            meta_description: 'Рассчитайте результат увеличения любого числа на заданный процент — мгновенно найдите новое значение и величину увеличения.',
            short_answer: 'Этот калькулятор увеличивает число на процент, например 200 при увеличении на 15% = 230.',
            intro_text: '<p>Введите исходное значение и процент, чтобы найти величину увеличения и итоговое новое значение — полезно для повышений зарплаты, роста цен и прогнозов роста.</p>',
            key_points: [
                '<b>Формула:</b> Новое значение = Исходное значение × (1 + Процент ÷ 100).',
                '<b>Пример:</b> 200 при увеличении на 15% = 200 × 1,15 = 230 (увеличение на 30).',
                '<b>Частое применение:</b> повышение зарплаты, рост арендной платы, повышение цен и прогнозы годового роста.',
            ],
            howto: [
                { question: 'Чем это отличается от Калькулятора изменения в процентах?', answer: '<p>Калькулятор изменения находит процент между двумя известными значениями; этот калькулятор работает наоборот — вы знаете процент и хотите найти новое значение.</p>' },
                { question: 'Можно ли использовать это для сложного роста за несколько периодов?', answer: '<p>Не напрямую — этот калькулятор рассчитывает одно увеличение. Для нескольких периодов применяйте расчёт повторно или используйте калькулятор сложных процентов.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.ru, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'procentualas-palielinasanas-kalkulators', title: 'Procentuālās Palielināšanas Kalkulators', h1: 'Procentuālās Palielināšanas Kalkulators',
            meta_title: 'Procentuālās Palielināšanas Kalkulators | Palieliniet Skaitli Par Procentu',
            meta_description: 'Aprēķiniet rezultātu, palielinot jebkuru skaitli par noteiktu procentu — uzreiz atrodiet jauno vērtību un palielinājuma apjomu.',
            short_answer: 'Šis kalkulators palielina skaitli par procentu, piemēram, 200, palielinot par 15% = 230.',
            intro_text: '<p>Ievadiet sākotnējo vērtību un procentu, lai atrastu palielinājuma apjomu un iegūto jauno vērtību — noderīgi algas paaugstinājumiem, cenu pieaugumam un izaugsmes prognozēm.</p>',
            key_points: [
                '<b>Formula:</b> Jaunā Vērtība = Sākotnējā Vērtība × (1 + Procenti ÷ 100).',
                '<b>Piemērs:</b> 200, palielinot par 15% = 200 × 1,15 = 230 (palielinājums par 30).',
                '<b>Bieži izmantots:</b> algas paaugstinājumiem, īres cenu pieaugumam, cenu paaugstinājumiem un gada izaugsmes prognozēm.',
            ],
            howto: [
                { question: 'Kā tas atšķiras no Procentuālo Izmaiņu Kalkulatora?', answer: '<p>Izmaiņu kalkulators atrod procentu starp divām zināmām vērtībām; šis kalkulators darbojas pretēji — jūs zināt procentu un vēlaties atrast jauno vērtību.</p>' },
                { question: 'Vai varu to izmantot saliktam pieaugumam vairākos periodos?', answer: '<p>Ne tieši — šis aprēķina vienu palielinājumu. Vairākiem periodiem piemērojiet šo aprēķinu atkārtoti vai izmantojiet salikto procentu kalkulatoru.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.lv, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wzrostu-procentowego', title: 'Kalkulator Wzrostu Procentowego', h1: 'Kalkulator Wzrostu Procentowego',
            meta_title: 'Kalkulator Wzrostu Procentowego | Zwiększ Liczbę o Procent',
            meta_description: 'Oblicz wynik zwiększenia dowolnej liczby o podany procent — natychmiast znajdź nową wartość i wielkość zwiększenia.',
            short_answer: 'Ten kalkulator zwiększa liczbę o procent, np. 200 zwiększone o 15% = 230.',
            intro_text: '<p>Wpisz wartość początkową i procent, aby znaleźć wielkość zwiększenia i wynikową nową wartość — przydatne przy podwyżkach, wzroście cen i prognozach wzrostu.</p>',
            key_points: [
                '<b>Wzór:</b> Nowa Wartość = Wartość Początkowa × (1 + Procent ÷ 100).',
                '<b>Przykład:</b> 200 zwiększone o 15% = 200 × 1,15 = 230 (zwiększenie o 30).',
                '<b>Częste zastosowania:</b> podwyżki wynagrodzeń, wzrost czynszu, podwyżki cen i prognozy wzrostu rok do roku.',
            ],
            howto: [
                { question: 'Czym to się różni od Kalkulatora Zmiany Procentowej?', answer: '<p>Kalkulator zmiany znajduje procent między dwiema znanymi wartościami; ten kalkulator działa odwrotnie — znasz procent i chcesz znaleźć nową wartość.</p>' },
                { question: 'Czy mogę użyć tego do złożonego wzrostu w wielu okresach?', answer: '<p>Nie bezpośrednio — to oblicza pojedyncze zwiększenie. Dla wielu okresów zastosuj to obliczenie wielokrotnie lub użyj kalkulatora procentu składanego.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.pl, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-aumento-porcentual', title: 'Calculadora de Aumento Porcentual', h1: 'Calculadora de Aumento Porcentual',
            meta_title: 'Calculadora de Aumento Porcentual | Aumenta un Número por un Porcentaje',
            meta_description: 'Calcula el resultado de aumentar cualquier número en un porcentaje dado — encuentra al instante el nuevo valor y la cantidad de aumento.',
            short_answer: 'Esta calculadora aumenta un número por un porcentaje, p. ej. 200 aumentado en un 15% = 230.',
            intro_text: '<p>Introduce un valor original y un porcentaje para encontrar la cantidad de aumento y el nuevo valor resultante — útil para aumentos salariales, subidas de precios y proyecciones de crecimiento.</p>',
            key_points: [
                '<b>Fórmula:</b> Nuevo Valor = Valor Original × (1 + Porcentaje ÷ 100).',
                '<b>Ejemplo:</b> 200 aumentado en un 15% = 200 × 1.15 = 230 (un aumento de 30).',
                '<b>Usos comunes:</b> aumentos salariales, subidas de alquiler, subidas de precios y proyecciones de crecimiento interanual.',
            ],
            howto: [
                { question: '¿En qué se diferencia esto de la Calculadora de Cambio Porcentual?', answer: '<p>El Cambio Porcentual encuentra el porcentaje entre dos valores conocidos; esta calculadora funciona al revés — conoces el porcentaje y quieres encontrar el nuevo valor.</p>' },
                { question: '¿Puedo usar esto para aumentos compuestos en varios períodos?', answer: '<p>No directamente — esto calcula un único aumento. Para varios períodos compuestos, aplicarías este cálculo repetidamente o usarías una calculadora de interés compuesto.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.es, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.es, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-daugmentation-en-pourcentage', title: 'Calculateur d\'Augmentation en Pourcentage', h1: 'Calculateur d\'Augmentation en Pourcentage',
            meta_title: 'Calculateur d\'Augmentation en Pourcentage | Augmentez un Nombre d\'un Pourcentage',
            meta_description: 'Calculez le résultat de l\'augmentation de n\'importe quel nombre d\'un pourcentage donné — trouvez instantanément la nouvelle valeur et le montant de l\'augmentation.',
            short_answer: 'Ce calculateur augmente un nombre d\'un pourcentage, ex. 200 augmenté de 15% = 230.',
            intro_text: '<p>Entrez une valeur initiale et un pourcentage pour trouver le montant de l\'augmentation et la nouvelle valeur résultante — utile pour les augmentations de salaire, les hausses de prix et les projections de croissance.</p>',
            key_points: [
                '<b>Formule :</b> Nouvelle Valeur = Valeur Initiale × (1 + Pourcentage ÷ 100).',
                '<b>Exemple :</b> 200 augmenté de 15% = 200 × 1,15 = 230 (une augmentation de 30).',
                '<b>Usages courants :</b> augmentations de salaire, hausses de loyer, hausses de prix et projections de croissance annuelle.',
            ],
            howto: [
                { question: 'En quoi cela diffère-t-il du Calculateur de Variation en Pourcentage ?', answer: '<p>La Variation en Pourcentage trouve le pourcentage entre deux valeurs connues ; ce calculateur fonctionne dans l\'autre sens — vous connaissez le pourcentage et voulez trouver la nouvelle valeur.</p>' },
                { question: 'Puis-je utiliser cela pour des augmentations composées sur plusieurs périodes ?', answer: '<p>Pas directement — cela calcule une seule augmentation. Pour plusieurs périodes composées, vous appliqueriez ce calcul de manière répétée ou utiliseriez un calculateur d\'intérêts composés.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.fr, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-aumento-percentuale', title: 'Calcolatore di Aumento Percentuale', h1: 'Calcolatore di Aumento Percentuale',
            meta_title: 'Calcolatore di Aumento Percentuale | Aumenta un Numero di una Percentuale',
            meta_description: 'Calcola il risultato dell\'aumento di qualsiasi numero di una percentuale data — trova istantaneamente il nuovo valore e l\'importo dell\'aumento.',
            short_answer: 'Questo calcolatore aumenta un numero di una percentuale, es. 200 aumentato del 15% = 230.',
            intro_text: '<p>Inserisci un valore originale e una percentuale per trovare l\'importo dell\'aumento e il nuovo valore risultante — utile per aumenti salariali, aumenti di prezzo e proiezioni di crescita.</p>',
            key_points: [
                '<b>Formula:</b> Nuovo Valore = Valore Originale × (1 + Percentuale ÷ 100).',
                '<b>Esempio:</b> 200 aumentato del 15% = 200 × 1,15 = 230 (un aumento di 30).',
                '<b>Usi comuni:</b> aumenti salariali, aumenti dell\'affitto, aumenti di prezzo e proiezioni di crescita anno su anno.',
            ],
            howto: [
                { question: 'In cosa differisce dal Calcolatore di Variazione Percentuale?', answer: '<p>La Variazione Percentuale trova la percentuale tra due valori noti; questo calcolatore funziona al contrario — conosci la percentuale e vuoi trovare il nuovo valore.</p>' },
                { question: 'Posso usarlo per aumenti composti su più periodi?', answer: '<p>Non direttamente — questo calcola un singolo aumento. Per più periodi composti, applicheresti questo calcolo ripetutamente o useresti un calcolatore di interesse composto.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.it, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.it, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'prozentuale-erhoehung-rechner', title: 'Prozentuale-Erhöhung-Rechner', h1: 'Prozentuale-Erhöhung-Rechner',
            meta_title: 'Prozentuale-Erhöhung-Rechner | Eine Zahl um einen Prozentsatz Erhöhen',
            meta_description: 'Berechnen Sie das Ergebnis der Erhöhung einer beliebigen Zahl um einen bestimmten Prozentsatz — finden Sie sofort den neuen Wert und den Erhöhungsbetrag.',
            short_answer: 'Dieser Rechner erhöht eine Zahl um einen Prozentsatz, z.B. 200 um 15% erhöht = 230.',
            intro_text: '<p>Geben Sie einen Ursprungswert und einen Prozentsatz ein, um den Erhöhungsbetrag und den resultierenden neuen Wert zu finden — nützlich für Gehaltserhöhungen, Preiserhöhungen und Wachstumsprognosen.</p>',
            key_points: [
                '<b>Formel:</b> Neuer Wert = Ursprungswert × (1 + Prozent ÷ 100).',
                '<b>Beispiel:</b> 200 um 15% erhöht = 200 × 1,15 = 230 (eine Erhöhung um 30).',
                '<b>Häufige Anwendungen:</b> Gehaltserhöhungen, Mieterhöhungen, Preiserhöhungen und Jahresvergleich-Wachstumsprognosen.',
            ],
            howto: [
                { question: 'Wie unterscheidet sich das vom Prozentuale-Veränderung-Rechner?', answer: '<p>Die prozentuale Veränderung findet den Prozentsatz zwischen zwei bekannten Werten; dieser Rechner funktioniert umgekehrt — Sie kennen den Prozentsatz und möchten den neuen Wert finden.</p>' },
                { question: 'Kann ich das für zusammengesetzte Erhöhungen über mehrere Perioden verwenden?', answer: '<p>Nicht direkt — dies berechnet eine einzelne Erhöhung. Für mehrere Zinsperioden würden Sie diese Berechnung wiederholt anwenden oder einen Zinseszinsrechner verwenden.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.de, type: 'number', placeholder: '200' },
                { name: 'percent', label: INCREASE_PERCENT_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'increase_amount', label: INCREASE_AMOUNT_LABEL.de, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1207: Percent Decrease Calculator
// ============================================================
const DECREASE_PERCENT_LABEL: Record<string, string> = {
    en: 'Decrease By (%)', ru: 'Уменьшить на (%)', lv: 'Samazināt Par (%)', pl: 'Zmniejsz o (%)',
    es: 'Disminuir en (%)', fr: 'Diminuer de (%)', it: 'Diminuisci del (%)', de: 'Verringern Um (%)',
}
const DECREASE_AMOUNT_LABEL: Record<string, string> = {
    en: 'Decrease Amount', ru: 'Величина уменьшения', lv: 'Samazinājuma Apjoms', pl: 'Wielkość Zmniejszenia',
    es: 'Cantidad de Disminución', fr: 'Montant de la Diminution', it: 'Importo della Diminuzione', de: 'Verringerungsbetrag',
}

const percentDecreaseCalculatorTool: ToolDef = {
    id: '1207',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'original_value', default: 200 }, { key: 'percent', default: 15 }],
        functions: { result: { type: 'function', functionName: 'percentDecreaseCalculator', params: { original_value: 'original_value', percent: 'percent' } } },
        outputs: [{ key: 'decrease_amount', precision: 2 }, { key: 'new_value', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'percent-decrease-calculator', title: 'Percent Decrease Calculator', h1: 'Percent Decrease Calculator',
            meta_title: 'Percent Decrease Calculator | Decrease a Number by a Percentage',
            meta_description: 'Calculate the result of decreasing any number by a given percentage — instantly find the new value and the decrease amount.',
            short_answer: 'This calculator decreases a number by a percentage, e.g. 200 decreased by 15% = 170.',
            intro_text: '<p>Enter an original value and a percentage to find the decrease amount and the resulting new value — useful for markdowns, pay cuts, and depreciation estimates.</p>',
            key_points: [
                '<b>Formula:</b> New Value = Original Value × (1 − Percent ÷ 100).',
                '<b>Example:</b> 200 decreased by 15% = 200 × 0.85 = 170 (a decrease of 30).',
                '<b>Common uses:</b> price markdowns, budget cuts, weight loss tracking, and value depreciation estimates.',
            ],
            howto: [
                { question: 'What happens if the percentage is over 100%?', answer: '<p>The new value becomes negative — mathematically consistent, though rarely meaningful for real-world quantities like prices.</p>' },
                { question: 'Is this the same as a discount calculation?', answer: '<p>Yes, the math is identical — this is the same formula used for calculating a discounted price, just framed generically for any number.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.en, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.en, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-umensheniya-na-protsent', title: 'Калькулятор уменьшения на процент', h1: 'Калькулятор уменьшения на процент',
            meta_title: 'Калькулятор уменьшения на процент | Уменьшите число на процент',
            meta_description: 'Рассчитайте результат уменьшения любого числа на заданный процент — мгновенно найдите новое значение и величину уменьшения.',
            short_answer: 'Этот калькулятор уменьшает число на процент, например 200 при уменьшении на 15% = 170.',
            intro_text: '<p>Введите исходное значение и процент, чтобы найти величину уменьшения и итоговое новое значение — полезно для скидок, снижения зарплаты и оценки амортизации.</p>',
            key_points: [
                '<b>Формула:</b> Новое значение = Исходное значение × (1 − Процент ÷ 100).',
                '<b>Пример:</b> 200 при уменьшении на 15% = 200 × 0,85 = 170 (уменьшение на 30).',
                '<b>Частое применение:</b> снижение цен, сокращение бюджета, отслеживание потери веса и оценка амортизации стоимости.',
            ],
            howto: [
                { question: 'Что произойдёт, если процент больше 100%?', answer: '<p>Новое значение станет отрицательным — математически корректно, хотя редко имеет смысл для реальных величин вроде цен.</p>' },
                { question: 'Это то же самое, что расчёт скидки?', answer: '<p>Да, математика идентична — это та же формула, что используется для расчёта цены со скидкой, просто в общем виде для любого числа.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.ru, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'procentualas-samazinasanas-kalkulators', title: 'Procentuālās Samazināšanas Kalkulators', h1: 'Procentuālās Samazināšanas Kalkulators',
            meta_title: 'Procentuālās Samazināšanas Kalkulators | Samaziniet Skaitli Par Procentu',
            meta_description: 'Aprēķiniet rezultātu, samazinot jebkuru skaitli par noteiktu procentu — uzreiz atrodiet jauno vērtību un samazinājuma apjomu.',
            short_answer: 'Šis kalkulators samazina skaitli par procentu, piemēram, 200, samazinot par 15% = 170.',
            intro_text: '<p>Ievadiet sākotnējo vērtību un procentu, lai atrastu samazinājuma apjomu un iegūto jauno vērtību — noderīgi atlaidēm, algas samazinājumiem un amortizācijas aprēķiniem.</p>',
            key_points: [
                '<b>Formula:</b> Jaunā Vērtība = Sākotnējā Vērtība × (1 − Procenti ÷ 100).',
                '<b>Piemērs:</b> 200, samazinot par 15% = 200 × 0,85 = 170 (samazinājums par 30).',
                '<b>Bieži izmantots:</b> cenu atlaidēm, budžeta samazinājumiem, svara zuduma izsekošanai un vērtības amortizācijas aprēķiniem.',
            ],
            howto: [
                { question: 'Kas notiek, ja procents pārsniedz 100%?', answer: '<p>Jaunā vērtība kļūst negatīva — matemātiski korekti, lai gan reti jēgpilni reāliem lielumiem, piemēram, cenām.</p>' },
                { question: 'Vai tas ir tas pats, kas atlaides aprēķins?', answer: '<p>Jā, matemātika ir identiska — tā ir tā pati formula, ko izmanto atlaides cenas aprēķināšanai, tikai vispārīgi jebkuram skaitlim.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.lv, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-spadku-procentowego', title: 'Kalkulator Spadku Procentowego', h1: 'Kalkulator Spadku Procentowego',
            meta_title: 'Kalkulator Spadku Procentowego | Zmniejsz Liczbę o Procent',
            meta_description: 'Oblicz wynik zmniejszenia dowolnej liczby o podany procent — natychmiast znajdź nową wartość i wielkość zmniejszenia.',
            short_answer: 'Ten kalkulator zmniejsza liczbę o procent, np. 200 zmniejszone o 15% = 170.',
            intro_text: '<p>Wpisz wartość początkową i procent, aby znaleźć wielkość zmniejszenia i wynikową nową wartość — przydatne przy przecenach, obniżkach wynagrodzeń i szacowaniu amortyzacji.</p>',
            key_points: [
                '<b>Wzór:</b> Nowa Wartość = Wartość Początkowa × (1 − Procent ÷ 100).',
                '<b>Przykład:</b> 200 zmniejszone o 15% = 200 × 0,85 = 170 (zmniejszenie o 30).',
                '<b>Częste zastosowania:</b> przeceny cen, cięcia budżetowe, śledzenie utraty wagi i szacowanie amortyzacji wartości.',
            ],
            howto: [
                { question: 'Co się stanie, jeśli procent przekroczy 100%?', answer: '<p>Nowa wartość staje się ujemna — matematycznie poprawne, choć rzadko sensowne dla rzeczywistych wielkości jak ceny.</p>' },
                { question: 'Czy to to samo co obliczenie rabatu?', answer: '<p>Tak, matematyka jest identyczna — to ten sam wzór używany do obliczania ceny po rabacie, tylko ujęty ogólnie dla dowolnej liczby.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.pl, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-disminucion-porcentual', title: 'Calculadora de Disminución Porcentual', h1: 'Calculadora de Disminución Porcentual',
            meta_title: 'Calculadora de Disminución Porcentual | Disminuye un Número por un Porcentaje',
            meta_description: 'Calcula el resultado de disminuir cualquier número en un porcentaje dado — encuentra al instante el nuevo valor y la cantidad de disminución.',
            short_answer: 'Esta calculadora disminuye un número por un porcentaje, p. ej. 200 disminuido en un 15% = 170.',
            intro_text: '<p>Introduce un valor original y un porcentaje para encontrar la cantidad de disminución y el nuevo valor resultante — útil para rebajas, recortes salariales y estimaciones de depreciación.</p>',
            key_points: [
                '<b>Fórmula:</b> Nuevo Valor = Valor Original × (1 − Porcentaje ÷ 100).',
                '<b>Ejemplo:</b> 200 disminuido en un 15% = 200 × 0.85 = 170 (una disminución de 30).',
                '<b>Usos comunes:</b> rebajas de precios, recortes de presupuesto, seguimiento de pérdida de peso y estimaciones de depreciación de valor.',
            ],
            howto: [
                { question: '¿Qué pasa si el porcentaje supera el 100%?', answer: '<p>El nuevo valor se vuelve negativo — matemáticamente consistente, aunque rara vez tiene sentido para cantidades reales como precios.</p>' },
                { question: '¿Es esto lo mismo que un cálculo de descuento?', answer: '<p>Sí, las matemáticas son idénticas — esta es la misma fórmula usada para calcular un precio con descuento, solo planteada de forma genérica para cualquier número.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.es, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.es, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-diminution-en-pourcentage', title: 'Calculateur de Diminution en Pourcentage', h1: 'Calculateur de Diminution en Pourcentage',
            meta_title: 'Calculateur de Diminution en Pourcentage | Diminuez un Nombre d\'un Pourcentage',
            meta_description: 'Calculez le résultat de la diminution de n\'importe quel nombre d\'un pourcentage donné — trouvez instantanément la nouvelle valeur et le montant de la diminution.',
            short_answer: 'Ce calculateur diminue un nombre d\'un pourcentage, ex. 200 diminué de 15% = 170.',
            intro_text: '<p>Entrez une valeur initiale et un pourcentage pour trouver le montant de la diminution et la nouvelle valeur résultante — utile pour les démarques, les baisses de salaire et les estimations de dépréciation.</p>',
            key_points: [
                '<b>Formule :</b> Nouvelle Valeur = Valeur Initiale × (1 − Pourcentage ÷ 100).',
                '<b>Exemple :</b> 200 diminué de 15% = 200 × 0,85 = 170 (une diminution de 30).',
                '<b>Usages courants :</b> démarques de prix, coupes budgétaires, suivi de perte de poids et estimations de dépréciation de valeur.',
            ],
            howto: [
                { question: 'Que se passe-t-il si le pourcentage dépasse 100% ?', answer: '<p>La nouvelle valeur devient négative — mathématiquement cohérent, bien que rarement significatif pour des quantités réelles comme les prix.</p>' },
                { question: 'Est-ce la même chose qu\'un calcul de remise ?', answer: '<p>Oui, les mathématiques sont identiques — c\'est la même formule utilisée pour calculer un prix remisé, simplement formulée de manière générique pour n\'importe quel nombre.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.fr, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-diminuzione-percentuale', title: 'Calcolatore di Diminuzione Percentuale', h1: 'Calcolatore di Diminuzione Percentuale',
            meta_title: 'Calcolatore di Diminuzione Percentuale | Diminuisci un Numero di una Percentuale',
            meta_description: 'Calcola il risultato della diminuzione di qualsiasi numero di una percentuale data — trova istantaneamente il nuovo valore e l\'importo della diminuzione.',
            short_answer: 'Questo calcolatore diminuisce un numero di una percentuale, es. 200 diminuito del 15% = 170.',
            intro_text: '<p>Inserisci un valore originale e una percentuale per trovare l\'importo della diminuzione e il nuovo valore risultante — utile per ribassi, tagli salariali e stime di deprezzamento.</p>',
            key_points: [
                '<b>Formula:</b> Nuovo Valore = Valore Originale × (1 − Percentuale ÷ 100).',
                '<b>Esempio:</b> 200 diminuito del 15% = 200 × 0,85 = 170 (una diminuzione di 30).',
                '<b>Usi comuni:</b> ribassi di prezzo, tagli di bilancio, monitoraggio della perdita di peso e stime di deprezzamento del valore.',
            ],
            howto: [
                { question: 'Cosa succede se la percentuale supera il 100%?', answer: '<p>Il nuovo valore diventa negativo — matematicamente coerente, anche se raramente significativo per quantità reali come i prezzi.</p>' },
                { question: 'È lo stesso di un calcolo di sconto?', answer: '<p>Sì, la matematica è identica — questa è la stessa formula usata per calcolare un prezzo scontato, solo formulata genericamente per qualsiasi numero.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.it, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.it, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'prozentuale-verringerung-rechner', title: 'Prozentuale-Verringerung-Rechner', h1: 'Prozentuale-Verringerung-Rechner',
            meta_title: 'Prozentuale-Verringerung-Rechner | Eine Zahl um einen Prozentsatz Verringern',
            meta_description: 'Berechnen Sie das Ergebnis der Verringerung einer beliebigen Zahl um einen bestimmten Prozentsatz — finden Sie sofort den neuen Wert und den Verringerungsbetrag.',
            short_answer: 'Dieser Rechner verringert eine Zahl um einen Prozentsatz, z.B. 200 um 15% verringert = 170.',
            intro_text: '<p>Geben Sie einen Ursprungswert und einen Prozentsatz ein, um den Verringerungsbetrag und den resultierenden neuen Wert zu finden — nützlich für Preisnachlässe, Gehaltskürzungen und Abschreibungsschätzungen.</p>',
            key_points: [
                '<b>Formel:</b> Neuer Wert = Ursprungswert × (1 − Prozent ÷ 100).',
                '<b>Beispiel:</b> 200 um 15% verringert = 200 × 0,85 = 170 (eine Verringerung um 30).',
                '<b>Häufige Anwendungen:</b> Preisnachlässe, Budgetkürzungen, Gewichtsverlust-Tracking und Wertminderungsschätzungen.',
            ],
            howto: [
                { question: 'Was passiert, wenn der Prozentsatz über 100% liegt?', answer: '<p>Der neue Wert wird negativ — mathematisch konsistent, aber selten sinnvoll für reale Größen wie Preise.</p>' },
                { question: 'Ist das dasselbe wie eine Rabattberechnung?', answer: '<p>Ja, die Mathematik ist identisch — dies ist dieselbe Formel, die zur Berechnung eines rabattierten Preises verwendet wird, nur allgemein für jede Zahl formuliert.</p>' },
            ],
            inputs: [
                { name: 'original_value', label: ORIGINAL_VALUE_LABEL.de, type: 'number', placeholder: '200' },
                { name: 'percent', label: DECREASE_PERCENT_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'decrease_amount', label: DECREASE_AMOUNT_LABEL.de, precision: 2 },
                { name: 'new_value', label: NEW_VALUE_RESULT_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1208: Reverse Percentage Calculator
// ============================================================
const PART_VALUE_LABEL: Record<string, string> = {
    en: 'This Number', ru: 'Это число', lv: 'Šis Skaitlis', pl: 'Ta Liczba',
    es: 'Este Número', fr: 'Ce Nombre', it: 'Questo Numero', de: 'Diese Zahl',
}
const IS_WHAT_PERCENT_LABEL: Record<string, string> = {
    en: 'Is This % of the Answer', ru: 'Составляет этот % от ответа', lv: 'Ir Šis % no Atbildes', pl: 'To Ten % Odpowiedzi',
    es: 'Es Este % de la Respuesta', fr: 'Est Ce % de la Réponse', it: 'È Questa % della Risposta', de: 'Ist Dieser % der Antwort',
}
const BASE_NUMBER_RESULT_LABEL: Record<string, string> = {
    en: 'Base Number', ru: 'Базовое число', lv: 'Bāzes Skaitlis', pl: 'Liczba Bazowa',
    es: 'Número Base', fr: 'Nombre de Base', it: 'Numero Base', de: 'Basiszahl',
}

const reversePercentageCalculatorTool: ToolDef = {
    id: '1208',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'part_value', default: 45 }, { key: 'percent', default: 15 }],
        functions: { result: { type: 'function', functionName: 'reversePercentageCalculator', params: { part_value: 'part_value', percent: 'percent' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'reverse-percentage-calculator', title: 'Reverse Percentage Calculator', h1: 'Reverse Percentage Calculator',
            meta_title: 'Reverse Percentage Calculator | Find the Original Number from a Percentage',
            meta_description: 'Find the original (base) number when you know a value and what percentage of that number it represents.',
            short_answer: 'This calculator works backward from a percentage, e.g. if 45 is 15% of a number, that number is 300.',
            intro_text: '<p>Enter a known value and the percentage it represents to find the original base number it came from — useful when you know a discounted price and the discount percentage, but need the original price.</p>',
            key_points: [
                '<b>Formula:</b> Base Number = Value ÷ (Percent ÷ 100).',
                '<b>Example:</b> if 45 is 15% of a number, the number = 45 ÷ 0.15 = 300.',
                '<b>Common use:</b> you know a tax amount and the tax rate, and want to find the pre-tax price — or you know a commission amount and rate, and want the total sale value.',
            ],
            howto: [
                { question: 'How is this different from the basic Percentage Calculator?', answer: '<p>The Percentage Calculator finds a percentage OF a known number; this one works backward — you know the result and the percentage, and want to find the original number.</p>' },
                { question: 'What if the percentage is zero?', answer: '<p>Division by zero is undefined, so this calculator returns 0 in that edge case rather than an error.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.en, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.en, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-obratnogo-protsenta', title: 'Калькулятор обратного процента', h1: 'Калькулятор обратного процента',
            meta_title: 'Калькулятор обратного процента | Найдите исходное число по проценту',
            meta_description: 'Найдите исходное (базовое) число, если известно значение и то, какой процент от этого числа оно составляет.',
            short_answer: 'Этот калькулятор работает в обратную сторону от процента, например если 45 составляет 15% от числа, это число равно 300.',
            intro_text: '<p>Введите известное значение и процент, который оно составляет, чтобы найти исходное базовое число — полезно, когда известна цена со скидкой и процент скидки, а нужна исходная цена.</p>',
            key_points: [
                '<b>Формула:</b> Базовое число = Значение ÷ (Процент ÷ 100).',
                '<b>Пример:</b> если 45 составляет 15% от числа, то число = 45 ÷ 0,15 = 300.',
                '<b>Частое применение:</b> известна сумма налога и ставка налога, нужна цена до налога — или известна сумма комиссии и ставка, нужна общая сумма сделки.',
            ],
            howto: [
                { question: 'Чем это отличается от обычного Калькулятора процентов?', answer: '<p>Калькулятор процентов находит процент ОТ известного числа; этот работает в обратную сторону — вы знаете результат и процент и хотите найти исходное число.</p>' },
                { question: 'Что если процент равен нулю?', answer: '<p>Деление на ноль не определено, поэтому калькулятор возвращает 0 в этом крайнем случае, а не ошибку.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.ru, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.ru, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'apgriezta-procenta-kalkulators', title: 'Apgriezta Procenta Kalkulators', h1: 'Apgriezta Procenta Kalkulators',
            meta_title: 'Apgriezta Procenta Kalkulators | Atrodiet Sākotnējo Skaitli no Procenta',
            meta_description: 'Atrodiet sākotnējo (bāzes) skaitli, ja zināt vērtību un to, kādu procentu no tā skaitļa tā veido.',
            short_answer: 'Šis kalkulators aprēķina pretēji procentam, piemēram, ja 45 ir 15% no skaitļa, tas skaitlis ir 300.',
            intro_text: '<p>Ievadiet zināmu vērtību un procentu, ko tā veido, lai atrastu sākotnējo bāzes skaitli — noderīgi, ja zināt cenu ar atlaidi un atlaides procentu, bet nepieciešama sākotnējā cena.</p>',
            key_points: [
                '<b>Formula:</b> Bāzes Skaitlis = Vērtība ÷ (Procenti ÷ 100).',
                '<b>Piemērs:</b> ja 45 ir 15% no skaitļa, tad skaitlis = 45 ÷ 0,15 = 300.',
                '<b>Bieži izmantots:</b> zināt nodokļa summu un likmi, vajadzīga cena pirms nodokļa — vai zināt komisijas summu un likmi, vajadzīga kopējā darījuma summa.',
            ],
            howto: [
                { question: 'Kā tas atšķiras no parastā Procentu Kalkulatora?', answer: '<p>Procentu Kalkulators atrod procentu NO zināma skaitļa; šis darbojas pretēji — jūs zināt rezultātu un procentu un vēlaties atrast sākotnējo skaitli.</p>' },
                { question: 'Kas notiek, ja procents ir nulle?', answer: '<p>Dalīšana ar nulli nav definēta, tāpēc šis kalkulators šajā gadījumā atgriež 0, nevis kļūdu.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.lv, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.lv, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-procentu-odwrotnego', title: 'Kalkulator Procentu Odwrotnego', h1: 'Kalkulator Procentu Odwrotnego',
            meta_title: 'Kalkulator Procentu Odwrotnego | Znajdź Liczbę Wyjściową z Procentu',
            meta_description: 'Znajdź pierwotną (bazową) liczbę, gdy znasz wartość i to, jaki procent tej liczby ona stanowi.',
            short_answer: 'Ten kalkulator liczy wstecz od procentu, np. jeśli 45 to 15% liczby, ta liczba wynosi 300.',
            intro_text: '<p>Wpisz znaną wartość i procent, jaki ona stanowi, aby znaleźć pierwotną liczbę bazową — przydatne, gdy znasz cenę po rabacie i procent rabatu, ale potrzebujesz ceny pierwotnej.</p>',
            key_points: [
                '<b>Wzór:</b> Liczba Bazowa = Wartość ÷ (Procent ÷ 100).',
                '<b>Przykład:</b> jeśli 45 to 15% liczby, to liczba = 45 ÷ 0,15 = 300.',
                '<b>Częste zastosowanie:</b> znasz kwotę podatku i stawkę podatku, potrzebujesz ceny przed podatkiem — lub znasz kwotę prowizji i stawkę, potrzebujesz całkowitej wartości sprzedaży.',
            ],
            howto: [
                { question: 'Czym to się różni od podstawowego Kalkulatora Procentowego?', answer: '<p>Kalkulator Procentowy znajduje procent Z znanej liczby; ten działa odwrotnie — znasz wynik i procent i chcesz znaleźć liczbę pierwotną.</p>' },
                { question: 'Co jeśli procent wynosi zero?', answer: '<p>Dzielenie przez zero jest niezdefiniowane, więc ten kalkulator zwraca w tym przypadku 0, a nie błąd.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.pl, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.pl, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-porcentaje-inverso', title: 'Calculadora de Porcentaje Inverso', h1: 'Calculadora de Porcentaje Inverso',
            meta_title: 'Calculadora de Porcentaje Inverso | Encuentra el Número Original a Partir de un Porcentaje',
            meta_description: 'Encuentra el número original (base) cuando conoces un valor y qué porcentaje de ese número representa.',
            short_answer: 'Esta calculadora trabaja hacia atrás desde un porcentaje, p. ej. si 45 es el 15% de un número, ese número es 300.',
            intro_text: '<p>Introduce un valor conocido y el porcentaje que representa para encontrar el número base original del que proviene — útil cuando conoces un precio con descuento y el porcentaje de descuento, pero necesitas el precio original.</p>',
            key_points: [
                '<b>Fórmula:</b> Número Base = Valor ÷ (Porcentaje ÷ 100).',
                '<b>Ejemplo:</b> si 45 es el 15% de un número, el número = 45 ÷ 0.15 = 300.',
                '<b>Uso común:</b> conoces el monto de un impuesto y la tasa, y quieres encontrar el precio antes de impuestos — o conoces una comisión y su tasa, y quieres el valor total de la venta.',
            ],
            howto: [
                { question: '¿En qué se diferencia esto de la Calculadora de Porcentaje básica?', answer: '<p>La Calculadora de Porcentaje encuentra un porcentaje DE un número conocido; esta funciona al revés — conoces el resultado y el porcentaje, y quieres encontrar el número original.</p>' },
                { question: '¿Qué pasa si el porcentaje es cero?', answer: '<p>La división entre cero no está definida, así que esta calculadora devuelve 0 en ese caso extremo, no un error.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.es, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.es, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-pourcentage-inverse', title: 'Calculateur de Pourcentage Inverse', h1: 'Calculateur de Pourcentage Inverse',
            meta_title: 'Calculateur de Pourcentage Inverse | Trouvez le Nombre d\'Origine à Partir d\'un Pourcentage',
            meta_description: 'Trouvez le nombre d\'origine (de base) lorsque vous connaissez une valeur et le pourcentage de ce nombre qu\'elle représente.',
            short_answer: 'Ce calculateur fonctionne à rebours à partir d\'un pourcentage, ex. si 45 est 15% d\'un nombre, ce nombre est 300.',
            intro_text: '<p>Entrez une valeur connue et le pourcentage qu\'elle représente pour trouver le nombre de base d\'origine dont elle provient — utile lorsque vous connaissez un prix remisé et le pourcentage de remise, mais avez besoin du prix d\'origine.</p>',
            key_points: [
                '<b>Formule :</b> Nombre de Base = Valeur ÷ (Pourcentage ÷ 100).',
                '<b>Exemple :</b> si 45 est 15% d\'un nombre, le nombre = 45 ÷ 0,15 = 300.',
                '<b>Usage courant :</b> vous connaissez un montant de taxe et le taux, et voulez trouver le prix avant taxe — ou vous connaissez une commission et son taux, et voulez la valeur totale de la vente.',
            ],
            howto: [
                { question: 'En quoi cela diffère-t-il du Calculateur de Pourcentage de base ?', answer: '<p>Le Calculateur de Pourcentage trouve un pourcentage D\'un nombre connu ; celui-ci fonctionne à l\'envers — vous connaissez le résultat et le pourcentage, et voulez trouver le nombre d\'origine.</p>' },
                { question: 'Que se passe-t-il si le pourcentage est zéro ?', answer: '<p>La division par zéro n\'est pas définie, donc ce calculateur renvoie 0 dans ce cas limite, pas une erreur.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.fr, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.fr, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-percentuale-inversa', title: 'Calcolatore di Percentuale Inversa', h1: 'Calcolatore di Percentuale Inversa',
            meta_title: 'Calcolatore di Percentuale Inversa | Trova il Numero Originale da una Percentuale',
            meta_description: 'Trova il numero originale (base) quando conosci un valore e quale percentuale di quel numero rappresenta.',
            short_answer: 'Questo calcolatore lavora a ritroso da una percentuale, es. se 45 è il 15% di un numero, quel numero è 300.',
            intro_text: '<p>Inserisci un valore noto e la percentuale che rappresenta per trovare il numero base originale da cui proviene — utile quando conosci un prezzo scontato e la percentuale di sconto, ma ti serve il prezzo originale.</p>',
            key_points: [
                '<b>Formula:</b> Numero Base = Valore ÷ (Percentuale ÷ 100).',
                '<b>Esempio:</b> se 45 è il 15% di un numero, il numero = 45 ÷ 0,15 = 300.',
                '<b>Uso comune:</b> conosci l\'importo di un\'imposta e l\'aliquota, e vuoi trovare il prezzo al netto delle imposte — oppure conosci una commissione e la sua aliquota, e vuoi il valore totale della vendita.',
            ],
            howto: [
                { question: 'In cosa differisce dal Calcolatore di Percentuale di base?', answer: '<p>Il Calcolatore di Percentuale trova una percentuale DI un numero noto; questo funziona al contrario — conosci il risultato e la percentuale, e vuoi trovare il numero originale.</p>' },
                { question: 'Cosa succede se la percentuale è zero?', answer: '<p>La divisione per zero non è definita, quindi questo calcolatore restituisce 0 in questo caso limite, non un errore.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.it, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.it, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'umgekehrter-prozentsatz-rechner', title: 'Umgekehrter-Prozentsatz-Rechner', h1: 'Umgekehrter-Prozentsatz-Rechner',
            meta_title: 'Umgekehrter-Prozentsatz-Rechner | Finden Sie die Ursprungszahl aus einem Prozentsatz',
            meta_description: 'Finden Sie die ursprüngliche (Basis-)Zahl, wenn Sie einen Wert kennen und wissen, welchen Prozentsatz dieser Zahl er darstellt.',
            short_answer: 'Dieser Rechner arbeitet rückwärts von einem Prozentsatz aus, z.B. wenn 45 15% einer Zahl ist, ist diese Zahl 300.',
            intro_text: '<p>Geben Sie einen bekannten Wert und den Prozentsatz ein, den er darstellt, um die ursprüngliche Basiszahl zu finden — nützlich, wenn Sie einen rabattierten Preis und den Rabattprozentsatz kennen, aber den ursprünglichen Preis benötigen.</p>',
            key_points: [
                '<b>Formel:</b> Basiszahl = Wert ÷ (Prozent ÷ 100).',
                '<b>Beispiel:</b> wenn 45 15% einer Zahl ist, ist die Zahl = 45 ÷ 0,15 = 300.',
                '<b>Häufige Anwendung:</b> Sie kennen einen Steuerbetrag und den Steuersatz und möchten den Preis vor Steuern finden — oder Sie kennen einen Provisionsbetrag und -satz und möchten den gesamten Verkaufswert.',
            ],
            howto: [
                { question: 'Wie unterscheidet sich das vom einfachen Prozentrechner?', answer: '<p>Der Prozentrechner findet einen Prozentsatz VON einer bekannten Zahl; dieser funktioniert umgekehrt — Sie kennen das Ergebnis und den Prozentsatz und möchten die Ursprungszahl finden.</p>' },
                { question: 'Was passiert, wenn der Prozentsatz null ist?', answer: '<p>Division durch null ist nicht definiert, daher gibt dieser Rechner in diesem Grenzfall 0 zurück, keinen Fehler.</p>' },
            ],
            inputs: [
                { name: 'part_value', label: PART_VALUE_LABEL.de, type: 'number', placeholder: '45' },
                { name: 'percent', label: IS_WHAT_PERCENT_LABEL.de, type: 'number', min: -100000, max: 100000, placeholder: '15' },
            ],
            outputs: [{ name: 'result', label: BASE_NUMBER_RESULT_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1209: Tip Calculator
// ============================================================
const BILL_AMOUNT_LABEL: Record<string, string> = {
    en: 'Bill Amount', ru: 'Сумма счёта', lv: 'Rēķina Summa', pl: 'Kwota Rachunku',
    es: 'Monto de la Cuenta', fr: 'Montant de l\'Addition', it: 'Importo del Conto', de: 'Rechnungsbetrag',
}
const TIP_PERCENT_LABEL: Record<string, string> = {
    en: 'Tip Percentage', ru: 'Процент чаевых', lv: 'Dzeramnaudas Procenti', pl: 'Procent Napiwku',
    es: 'Porcentaje de Propina', fr: 'Pourcentage de Pourboire', it: 'Percentuale di Mancia', de: 'Trinkgeld-Prozentsatz',
}
const NUM_PEOPLE_LABEL: Record<string, string> = {
    en: 'Number of People', ru: 'Количество человек', lv: 'Cilvēku Skaits', pl: 'Liczba Osób',
    es: 'Número de Personas', fr: 'Nombre de Personnes', it: 'Numero di Persone', de: 'Anzahl der Personen',
}
const TIP_AMOUNT_LABEL: Record<string, string> = {
    en: 'Tip Amount', ru: 'Сумма чаевых', lv: 'Dzeramnaudas Summa', pl: 'Kwota Napiwku',
    es: 'Monto de Propina', fr: 'Montant du Pourboire', it: 'Importo della Mancia', de: 'Trinkgeldbetrag',
}
const TOTAL_AMOUNT_LABEL: Record<string, string> = {
    en: 'Total Amount', ru: 'Итоговая сумма', lv: 'Kopējā Summa', pl: 'Kwota Całkowita',
    es: 'Monto Total', fr: 'Montant Total', it: 'Importo Totale', de: 'Gesamtbetrag',
}
const PER_PERSON_LABEL: Record<string, string> = {
    en: 'Amount Per Person', ru: 'Сумма на человека', lv: 'Summa uz Personu', pl: 'Kwota na Osobę',
    es: 'Monto por Persona', fr: 'Montant par Personne', it: 'Importo a Persona', de: 'Betrag pro Person',
}
const TIP_PER_PERSON_LABEL: Record<string, string> = {
    en: 'Tip Per Person', ru: 'Чаевые на человека', lv: 'Dzeramnauda uz Personu', pl: 'Napiwek na Osobę',
    es: 'Propina por Persona', fr: 'Pourboire par Personne', it: 'Mancia a Persona', de: 'Trinkgeld pro Person',
}

const tipCalculatorTool: ToolDef = {
    id: '1209',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'bill_amount', default: 100 }, { key: 'tip_percent', default: 20 }, { key: 'num_people', default: 4 }],
        functions: { result: { type: 'function', functionName: 'tipCalculator', params: { bill_amount: 'bill_amount', tip_percent: 'tip_percent', num_people: 'num_people' } } },
        outputs: [{ key: 'tip_amount', precision: 2 }, { key: 'total_amount', precision: 2 }, { key: 'per_person_amount', precision: 2 }, { key: 'tip_per_person', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'tip-calculator', title: 'Tip Calculator', h1: 'Tip Calculator',
            meta_title: 'Tip Calculator | Calculate Tip and Split the Bill',
            meta_description: 'Calculate the tip amount, total bill, and per-person split for any group size and tip percentage.',
            short_answer: 'This calculator finds your tip and split, e.g. a $100 bill with a 20% tip split 4 ways = $30 per person.',
            intro_text: '<p>Enter your bill amount, desired tip percentage, and number of people to instantly find the tip amount, total bill, and how much each person owes.</p>',
            key_points: [
                '<b>Formula:</b> Tip = Bill × (Tip % ÷ 100); Total = Bill + Tip; Per Person = Total ÷ Number of People.',
                '<b>Example:</b> a $100 bill with a 20% tip = $20 tip, $120 total — split 4 ways = $30 per person.',
                '<b>Typical tip ranges:</b> 15-20% is common at US restaurants for standard service; some diners tip more for excellent service or less for counter service.',
            ],
            howto: [
                { question: 'Should I tip on the pre-tax or post-tax amount?', answer: '<p>Conventions vary — many people tip on the pre-tax subtotal, though tipping on the total (including tax) is also common and simpler to calculate.</p>' },
                { question: 'Does this handle uneven splits?', answer: '<p>No — this assumes an even split among all people; for itemized/uneven splits, you\'d need to calculate each person\'s share separately.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.en, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.en, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.en, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.en, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.en, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.en, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-chaevyh', title: 'Калькулятор чаевых', h1: 'Калькулятор чаевых',
            meta_title: 'Калькулятор чаевых | Рассчитайте чаевые и разделите счёт',
            meta_description: 'Рассчитайте сумму чаевых, общий счёт и сумму на человека для любого размера компании и процента чаевых.',
            short_answer: 'Этот калькулятор находит чаевые и разделение счёта, например счёт 100 у.е. с чаевыми 20% на 4 человек = 30 у.е. на человека.',
            intro_text: '<p>Введите сумму счёта, желаемый процент чаевых и количество человек, чтобы мгновенно найти сумму чаевых, общий счёт и сколько должен каждый.</p>',
            key_points: [
                '<b>Формула:</b> Чаевые = Счёт × (Процент чаевых ÷ 100); Итого = Счёт + Чаевые; На человека = Итого ÷ Количество человек.',
                '<b>Пример:</b> счёт 100 у.е. с чаевыми 20% = 20 у.е. чаевых, 120 у.е. итого — на 4 человек = 30 у.е. на человека.',
                '<b>Типичный размер чаевых:</b> 15-20% обычно в ресторанах США за стандартное обслуживание; за отличное обслуживание чаевые могут быть больше.',
            ],
            howto: [
                { question: 'Давать чаевые с суммы до или после налога?', answer: '<p>Практика различается — многие дают чаевые с суммы до налога, хотя чаевые с общей суммы (включая налог) тоже распространены и проще для расчёта.</p>' },
                { question: 'Учитывает ли это неравное разделение?', answer: '<p>Нет — предполагается равное разделение между всеми; для неравного разделения долю каждого нужно считать отдельно.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.ru, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.ru, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.ru, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.ru, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'dzeramnaudas-kalkulators', title: 'Dzeramnaudas Kalkulators', h1: 'Dzeramnaudas Kalkulators',
            meta_title: 'Dzeramnaudas Kalkulators | Aprēķiniet Dzeramnaudu un Sadaliet Rēķinu',
            meta_description: 'Aprēķiniet dzeramnaudas summu, kopējo rēķinu un sadalījumu uz personu jebkuram grupas lielumam un dzeramnaudas procentam.',
            short_answer: 'Šis kalkulators atrod jūsu dzeramnaudu un sadalījumu, piemēram, rēķins 100 vienībās ar 20% dzeramnaudu, sadalot starp 4 cilvēkiem = 30 vienības uz personu.',
            intro_text: '<p>Ievadiet rēķina summu, vēlamo dzeramnaudas procentu un cilvēku skaitu, lai uzreiz atrastu dzeramnaudas summu, kopējo rēķinu un cik katram jāmaksā.</p>',
            key_points: [
                '<b>Formula:</b> Dzeramnauda = Rēķins × (Dzeramnaudas % ÷ 100); Kopā = Rēķins + Dzeramnauda; Uz Personu = Kopā ÷ Cilvēku Skaits.',
                '<b>Piemērs:</b> rēķins 100 vienības ar 20% dzeramnaudu = 20 dzeramnauda, 120 kopā — sadalot starp 4 cilvēkiem = 30 uz personu.',
                '<b>Tipiskais dzeramnaudas apjoms:</b> 15-20% ir izplatīts ASV restorānos par standarta apkalpošanu.',
            ],
            howto: [
                { question: 'Vai dzeramnauda jāskaita no summas pirms vai pēc nodokļa?', answer: '<p>Prakse atšķiras — daudzi dod dzeramnaudu no summas pirms nodokļa, lai gan dzeramnauda no kopējās summas (ieskaitot nodokli) arī ir izplatīta.</p>' },
                { question: 'Vai tas ņem vērā nevienlīdzīgu sadalījumu?', answer: '<p>Nē — tas pieņem vienlīdzīgu sadalījumu starp visiem; nevienlīdzīgam sadalījumam katra daļa jāaprēķina atsevišķi.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.lv, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.lv, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.lv, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.lv, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-napiwkow', title: 'Kalkulator Napiwków', h1: 'Kalkulator Napiwków',
            meta_title: 'Kalkulator Napiwków | Oblicz Napiwek i Podziel Rachunek',
            meta_description: 'Oblicz kwotę napiwku, całkowity rachunek i podział na osobę dla dowolnej wielkości grupy i procentu napiwku.',
            short_answer: 'Ten kalkulator znajduje twój napiwek i podział, np. rachunek 100 jednostek z 20% napiwkiem podzielony na 4 osoby = 30 jednostek na osobę.',
            intro_text: '<p>Wpisz kwotę rachunku, pożądany procent napiwku i liczbę osób, aby natychmiast znaleźć kwotę napiwku, całkowity rachunek i ile powinien zapłacić każdy.</p>',
            key_points: [
                '<b>Wzór:</b> Napiwek = Rachunek × (Procent Napiwku ÷ 100); Suma = Rachunek + Napiwek; Na Osobę = Suma ÷ Liczba Osób.',
                '<b>Przykład:</b> rachunek 100 jednostek z 20% napiwkiem = 20 napiwku, 120 razem — podzielone na 4 osoby = 30 na osobę.',
                '<b>Typowa wysokość napiwku:</b> 15-20% jest typowe w amerykańskich restauracjach za standardową obsługę.',
            ],
            howto: [
                { question: 'Czy napiwek powinienem liczyć od kwoty przed czy po podatku?', answer: '<p>Zwyczaje się różnią — wielu daje napiwek od kwoty przed podatkiem, choć napiwek od kwoty całkowitej (z podatkiem) też jest powszechny.</p>' },
                { question: 'Czy to uwzględnia nierówny podział?', answer: '<p>Nie — zakłada równy podział między wszystkimi; dla nierównego podziału każdą część trzeba obliczyć osobno.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.pl, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.pl, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.pl, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.pl, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-propina', title: 'Calculadora de Propina', h1: 'Calculadora de Propina',
            meta_title: 'Calculadora de Propina | Calcula la Propina y Divide la Cuenta',
            meta_description: 'Calcula el monto de la propina, la cuenta total y la división por persona para cualquier tamaño de grupo y porcentaje de propina.',
            short_answer: 'Esta calculadora encuentra tu propina y división, p. ej. una cuenta de 100 con una propina del 20% dividida entre 4 personas = 30 por persona.',
            intro_text: '<p>Introduce el monto de tu cuenta, el porcentaje de propina deseado y el número de personas para encontrar al instante el monto de la propina, la cuenta total y cuánto debe cada persona.</p>',
            key_points: [
                '<b>Fórmula:</b> Propina = Cuenta × (% de Propina ÷ 100); Total = Cuenta + Propina; Por Persona = Total ÷ Número de Personas.',
                '<b>Ejemplo:</b> una cuenta de 100 con una propina del 20% = 20 de propina, 120 total — dividido entre 4 personas = 30 por persona.',
                '<b>Rangos típicos de propina:</b> 15-20% es común en restaurantes de EE. UU. por servicio estándar.',
            ],
            howto: [
                { question: '¿Debo dar propina sobre el monto antes o después de impuestos?', answer: '<p>Las convenciones varían — muchas personas dan propina sobre el subtotal antes de impuestos, aunque dar propina sobre el total también es común.</p>' },
                { question: '¿Esto maneja divisiones desiguales?', answer: '<p>No — esto asume una división equitativa entre todas las personas; para divisiones desiguales, tendrías que calcular la parte de cada persona por separado.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.es, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.es, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.es, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.es, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.es, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.es, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-pourboire', title: 'Calculateur de Pourboire', h1: 'Calculateur de Pourboire',
            meta_title: 'Calculateur de Pourboire | Calculez le Pourboire et Partagez l\'Addition',
            meta_description: 'Calculez le montant du pourboire, l\'addition totale et la répartition par personne pour tout groupe et pourcentage de pourboire.',
            short_answer: 'Ce calculateur trouve votre pourboire et la répartition, ex. une addition de 100 avec un pourboire de 20% partagée entre 4 personnes = 30 par personne.',
            intro_text: '<p>Entrez le montant de votre addition, le pourcentage de pourboire souhaité et le nombre de personnes pour trouver instantanément le montant du pourboire, l\'addition totale et combien chaque personne doit.</p>',
            key_points: [
                '<b>Formule :</b> Pourboire = Addition × (% de Pourboire ÷ 100) ; Total = Addition + Pourboire ; Par Personne = Total ÷ Nombre de Personnes.',
                '<b>Exemple :</b> une addition de 100 avec un pourboire de 20% = 20 de pourboire, 120 au total — partagé entre 4 personnes = 30 par personne.',
                '<b>Fourchettes de pourboire typiques :</b> 15-20% est courant dans les restaurants américains pour un service standard.',
            ],
            howto: [
                { question: 'Dois-je donner un pourboire sur le montant avant ou après taxes ?', answer: '<p>Les conventions varient — beaucoup donnent un pourboire sur le sous-total avant taxes, bien que le pourboire sur le total (taxes incluses) soit aussi courant.</p>' },
                { question: 'Cela gère-t-il les partages inégaux ?', answer: '<p>Non — cela suppose un partage égal entre toutes les personnes ; pour des partages inégaux, vous devriez calculer la part de chacun séparément.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.fr, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.fr, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.fr, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.fr, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-mancia', title: 'Calcolatore di Mancia', h1: 'Calcolatore di Mancia',
            meta_title: 'Calcolatore di Mancia | Calcola la Mancia e Dividi il Conto',
            meta_description: 'Calcola l\'importo della mancia, il conto totale e la divisione a persona per qualsiasi dimensione di gruppo e percentuale di mancia.',
            short_answer: 'Questo calcolatore trova la tua mancia e divisione, es. un conto da 100 con una mancia del 20% diviso tra 4 persone = 30 a persona.',
            intro_text: '<p>Inserisci l\'importo del tuo conto, la percentuale di mancia desiderata e il numero di persone per trovare istantaneamente l\'importo della mancia, il conto totale e quanto deve ciascuna persona.</p>',
            key_points: [
                '<b>Formula:</b> Mancia = Conto × (% Mancia ÷ 100); Totale = Conto + Mancia; A Persona = Totale ÷ Numero di Persone.',
                '<b>Esempio:</b> un conto da 100 con una mancia del 20% = 20 di mancia, 120 totale — diviso tra 4 persone = 30 a persona.',
                '<b>Intervalli tipici di mancia:</b> 15-20% è comune nei ristoranti americani per un servizio standard.',
            ],
            howto: [
                { question: 'Dovrei lasciare la mancia sull\'importo prima o dopo le tasse?', answer: '<p>Le convenzioni variano — molte persone lasciano la mancia sul subtotale prima delle tasse, anche se la mancia sul totale è anche comune.</p>' },
                { question: 'Questo gestisce divisioni non uniformi?', answer: '<p>No — questo presuppone una divisione uniforme tra tutte le persone; per divisioni non uniformi, dovresti calcolare la quota di ciascuna persona separatamente.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.it, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.it, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.it, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.it, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.it, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.it, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'trinkgeld-rechner', title: 'Trinkgeld-Rechner', h1: 'Trinkgeld-Rechner',
            meta_title: 'Trinkgeld-Rechner | Trinkgeld Berechnen und Rechnung Teilen',
            meta_description: 'Berechnen Sie den Trinkgeldbetrag, die Gesamtrechnung und die Aufteilung pro Person für jede Gruppengröße und jeden Trinkgeld-Prozentsatz.',
            short_answer: 'Dieser Rechner findet Ihr Trinkgeld und die Aufteilung, z.B. eine Rechnung über 100 mit 20% Trinkgeld, geteilt durch 4 Personen = 30 pro Person.',
            intro_text: '<p>Geben Sie Ihren Rechnungsbetrag, den gewünschten Trinkgeld-Prozentsatz und die Anzahl der Personen ein, um sofort den Trinkgeldbetrag, die Gesamtrechnung und den Betrag pro Person zu finden.</p>',
            key_points: [
                '<b>Formel:</b> Trinkgeld = Rechnung × (Trinkgeld-% ÷ 100); Gesamt = Rechnung + Trinkgeld; Pro Person = Gesamt ÷ Anzahl der Personen.',
                '<b>Beispiel:</b> eine Rechnung über 100 mit 20% Trinkgeld = 20 Trinkgeld, 120 gesamt — geteilt durch 4 Personen = 30 pro Person.',
                '<b>Typische Trinkgeldspannen:</b> 15-20% ist in US-Restaurants für Standardservice üblich.',
            ],
            howto: [
                { question: 'Sollte ich auf den Betrag vor oder nach Steuern Trinkgeld geben?', answer: '<p>Die Konventionen variieren — viele geben Trinkgeld auf den Zwischensumme vor Steuern, obwohl Trinkgeld auf den Gesamtbetrag ebenfalls üblich ist.</p>' },
                { question: 'Werden ungleiche Aufteilungen berücksichtigt?', answer: '<p>Nein — es wird eine gleichmäßige Aufteilung unter allen Personen angenommen; für ungleiche Aufteilungen müssten Sie den Anteil jeder Person separat berechnen.</p>' },
            ],
            inputs: [
                { name: 'bill_amount', label: BILL_AMOUNT_LABEL.de, type: 'number', min: 0, max: 1000000, placeholder: '100' },
                { name: 'tip_percent', label: TIP_PERCENT_LABEL.de, type: 'number', min: 0, max: 100, placeholder: '20' },
                { name: 'num_people', label: NUM_PEOPLE_LABEL.de, type: 'number', min: 1, max: 100, placeholder: '4' },
            ],
            outputs: [
                { name: 'tip_amount', label: TIP_AMOUNT_LABEL.de, precision: 2 },
                { name: 'total_amount', label: TOTAL_AMOUNT_LABEL.de, precision: 2 },
                { name: 'per_person_amount', label: PER_PERSON_LABEL.de, precision: 2 },
                { name: 'tip_per_person', label: TIP_PER_PERSON_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1210: Sales Tax Calculator
// ============================================================
const PRICE_LABEL: Record<string, string> = {
    en: 'Price (before tax)', ru: 'Цена (без налога)', lv: 'Cena (bez nodokļa)', pl: 'Cena (bez podatku)',
    es: 'Precio (antes de impuestos)', fr: 'Prix (hors taxe)', it: 'Prezzo (senza tasse)', de: 'Preis (vor Steuern)',
}
const TAX_RATE_LABEL: Record<string, string> = {
    en: 'Tax Rate (%)', ru: 'Ставка налога (%)', lv: 'Nodokļa Likme (%)', pl: 'Stawka Podatku (%)',
    es: 'Tasa de Impuesto (%)', fr: 'Taux de Taxe (%)', it: 'Aliquota Fiscale (%)', de: 'Steuersatz (%)',
}
const TAX_AMOUNT_LABEL: Record<string, string> = {
    en: 'Tax Amount', ru: 'Сумма налога', lv: 'Nodokļa Summa', pl: 'Kwota Podatku',
    es: 'Monto del Impuesto', fr: 'Montant de la Taxe', it: 'Importo dell\'Imposta', de: 'Steuerbetrag',
}
const TOTAL_PRICE_LABEL: Record<string, string> = {
    en: 'Total Price', ru: 'Итоговая цена', lv: 'Kopējā Cena', pl: 'Cena Całkowita',
    es: 'Precio Total', fr: 'Prix Total', it: 'Prezzo Totale', de: 'Gesamtpreis',
}

const salesTaxCalculatorTool: ToolDef = {
    id: '1210',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'price', default: 80 }, { key: 'tax_rate', default: 8.5 }],
        functions: { result: { type: 'function', functionName: 'salesTaxCalculator', params: { price: 'price', tax_rate: 'tax_rate' } } },
        outputs: [{ key: 'tax_amount', precision: 2 }, { key: 'total_price', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'sales-tax-calculator', title: 'Sales Tax Calculator', h1: 'Sales Tax Calculator',
            meta_title: 'Sales Tax Calculator | Find Tax Amount and Total Price',
            meta_description: 'Calculate sales tax and the final total price for any purchase, given the pre-tax price and tax rate.',
            short_answer: 'This calculator finds sales tax, e.g. an $80 item with 8.5% tax adds $6.80 tax for an $86.80 total.',
            intro_text: '<p>Enter the pre-tax price and your local sales tax rate to instantly find the tax amount and the total price you\'ll pay.</p>',
            key_points: [
                '<b>Formula:</b> Tax Amount = Price × (Tax Rate ÷ 100); Total Price = Price + Tax Amount.',
                '<b>Example:</b> an $80 item at 8.5% tax = $6.80 tax, $86.80 total.',
                '<b>Tax rates vary widely</b> by country, state, and even city — check your local rate for an accurate result.',
            ],
            howto: [
                { question: 'Where do I find my local sales tax rate?', answer: '<p>Sales tax rates are set by state, county, and sometimes city governments (in the US) or as a national VAT rate (in most other countries) — check your local government\'s tax authority website for the exact current rate.</p>' },
                { question: 'Is this the same as VAT?', answer: '<p>The math is the same, though VAT (common outside the US) is often already included in displayed prices, while US sales tax is typically added at checkout — check which convention applies to your situation.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.en, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.en, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-naloga-s-prodazh', title: 'Калькулятор налога с продаж', h1: 'Калькулятор налога с продаж',
            meta_title: 'Калькулятор налога с продаж | Найдите сумму налога и итоговую цену',
            meta_description: 'Рассчитайте налог с продаж и итоговую цену покупки по цене без налога и ставке налога.',
            short_answer: 'Этот калькулятор находит налог с продаж, например товар за 80 у.е. с налогом 8,5% добавляет 6,80 у.е. налога, итого 86,80 у.е.',
            intro_text: '<p>Введите цену без налога и местную ставку налога с продаж, чтобы мгновенно найти сумму налога и итоговую цену, которую вы заплатите.</p>',
            key_points: [
                '<b>Формула:</b> Сумма налога = Цена × (Ставка налога ÷ 100); Итоговая цена = Цена + Сумма налога.',
                '<b>Пример:</b> товар за 80 у.е. с налогом 8,5% = 6,80 налога, итого 86,80.',
                '<b>Ставки налога сильно различаются</b> по странам, регионам и даже городам — уточните вашу местную ставку для точного результата.',
            ],
            howto: [
                { question: 'Где найти местную ставку налога с продаж?', answer: '<p>Ставки налога устанавливаются региональными и городскими властями (в США) или как национальная ставка НДС (в большинстве других стран) — проверьте сайт вашего налогового органа для точной актуальной ставки.</p>' },
                { question: 'Это то же самое, что НДС?', answer: '<p>Математика та же, хотя НДС (распространён вне США) часто уже включён в отображаемые цены, а налог с продаж в США обычно добавляется при оплате.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.ru, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'pardosanas-nodokla-kalkulators', title: 'Pārdošanas Nodokļa Kalkulators', h1: 'Pārdošanas Nodokļa Kalkulators',
            meta_title: 'Pārdošanas Nodokļa Kalkulators | Atrodiet Nodokļa Summu un Kopējo Cenu',
            meta_description: 'Aprēķiniet pārdošanas nodokli un galīgo kopējo cenu jebkuram pirkumam, ņemot vērā cenu bez nodokļa un nodokļa likmi.',
            short_answer: 'Šis kalkulators atrod pārdošanas nodokli, piemēram, prece par 80 vienībām ar 8,5% nodokli pievieno 6,80 nodokli, kopā 86,80.',
            intro_text: '<p>Ievadiet cenu bez nodokļa un jūsu vietējo pārdošanas nodokļa likmi, lai uzreiz atrastu nodokļa summu un kopējo cenu, ko jūs samaksāsiet.</p>',
            key_points: [
                '<b>Formula:</b> Nodokļa Summa = Cena × (Nodokļa Likme ÷ 100); Kopējā Cena = Cena + Nodokļa Summa.',
                '<b>Piemērs:</b> prece par 80 ar 8,5% nodokli = 6,80 nodoklis, kopā 86,80.',
                '<b>Nodokļu likmes ļoti atšķiras</b> pēc valsts, reģiona un pat pilsētas — pārbaudiet savu vietējo likmi precīzam rezultātam.',
            ],
            howto: [
                { question: 'Kur atrast savu vietējo pārdošanas nodokļa likmi?', answer: '<p>Nodokļu likmes nosaka valsts, reģionālās un dažreiz pašvaldības iestādes vai kā valsts PVN likme (lielākajā daļā citu valstu) — pārbaudiet savas nodokļu iestādes vietni precīzai aktuālajai likmei.</p>' },
                { question: 'Vai tas ir tas pats, kas PVN?', answer: '<p>Matemātika ir tā pati, lai gan PVN bieži jau ir iekļauts parādītajās cenās, bet ASV pārdošanas nodoklis parasti tiek pievienots pie kases.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.lv, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-podatku-od-sprzedazy', title: 'Kalkulator Podatku od Sprzedaży', h1: 'Kalkulator Podatku od Sprzedaży',
            meta_title: 'Kalkulator Podatku od Sprzedaży | Znajdź Kwotę Podatku i Cenę Całkowitą',
            meta_description: 'Oblicz podatek od sprzedaży i ostateczną cenę całkowitą dla dowolnego zakupu, na podstawie ceny przed podatkiem i stawki podatku.',
            short_answer: 'Ten kalkulator znajduje podatek od sprzedaży, np. produkt za 80 z podatkiem 8,5% dodaje 6,80 podatku, razem 86,80.',
            intro_text: '<p>Wpisz cenę przed podatkiem i lokalną stawkę podatku od sprzedaży, aby natychmiast znaleźć kwotę podatku i całkowitą cenę, którą zapłacisz.</p>',
            key_points: [
                '<b>Wzór:</b> Kwota Podatku = Cena × (Stawka Podatku ÷ 100); Cena Całkowita = Cena + Kwota Podatku.',
                '<b>Przykład:</b> produkt za 80 z podatkiem 8,5% = 6,80 podatku, razem 86,80.',
                '<b>Stawki podatkowe znacznie się różnią</b> w zależności od kraju, regionu, a nawet miasta — sprawdź swoją lokalną stawkę dla dokładnego wyniku.',
            ],
            howto: [
                { question: 'Gdzie znajdę moją lokalną stawkę podatku od sprzedaży?', answer: '<p>Stawki podatkowe są ustalane przez władze regionalne i czasem miejskie (w USA) lub jako krajowa stawka VAT (w większości innych krajów).</p>' },
                { question: 'Czy to to samo co VAT?', answer: '<p>Matematyka jest taka sama, chociaż VAT jest często już wliczony w wyświetlane ceny, podczas gdy amerykański podatek od sprzedaży zwykle jest dodawany przy kasie.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.pl, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-impuesto-sobre-ventas', title: 'Calculadora de Impuesto sobre Ventas', h1: 'Calculadora de Impuesto sobre Ventas',
            meta_title: 'Calculadora de Impuesto sobre Ventas | Encuentra el Monto del Impuesto y el Precio Total',
            meta_description: 'Calcula el impuesto sobre ventas y el precio total final para cualquier compra, dado el precio antes de impuestos y la tasa de impuesto.',
            short_answer: 'Esta calculadora encuentra el impuesto sobre ventas, p. ej. un artículo de 80 con un impuesto del 8.5% añade 6.80 de impuesto, total 86.80.',
            intro_text: '<p>Introduce el precio antes de impuestos y tu tasa de impuesto sobre ventas local para encontrar al instante el monto del impuesto y el precio total que pagarás.</p>',
            key_points: [
                '<b>Fórmula:</b> Monto del Impuesto = Precio × (Tasa de Impuesto ÷ 100); Precio Total = Precio + Monto del Impuesto.',
                '<b>Ejemplo:</b> un artículo de 80 con un 8.5% de impuesto = 6.80 de impuesto, 86.80 total.',
                '<b>Las tasas de impuesto varían ampliamente</b> según el país, la región e incluso la ciudad — consulta tu tasa local para un resultado preciso.',
            ],
            howto: [
                { question: '¿Dónde encuentro mi tasa de impuesto sobre ventas local?', answer: '<p>Las tasas de impuesto las fijan gobiernos regionales y a veces municipales (en EE. UU.) o como una tasa nacional de IVA (en la mayoría de otros países).</p>' },
                { question: '¿Es esto lo mismo que el IVA?', answer: '<p>La matemática es la misma, aunque el IVA suele estar ya incluido en los precios mostrados, mientras que el impuesto sobre ventas de EE. UU. normalmente se añade al pagar.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.es, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.es, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-taxe-de-vente', title: 'Calculateur de Taxe de Vente', h1: 'Calculateur de Taxe de Vente',
            meta_title: 'Calculateur de Taxe de Vente | Trouvez le Montant de la Taxe et le Prix Total',
            meta_description: 'Calculez la taxe de vente et le prix total final pour tout achat, à partir du prix hors taxe et du taux de taxe.',
            short_answer: 'Ce calculateur trouve la taxe de vente, ex. un article à 80 avec une taxe de 8,5% ajoute 6,80 de taxe, pour un total de 86,80.',
            intro_text: '<p>Entrez le prix hors taxe et votre taux de taxe de vente local pour trouver instantanément le montant de la taxe et le prix total que vous paierez.</p>',
            key_points: [
                '<b>Formule :</b> Montant de la Taxe = Prix × (Taux de Taxe ÷ 100) ; Prix Total = Prix + Montant de la Taxe.',
                '<b>Exemple :</b> un article à 80 avec une taxe de 8,5% = 6,80 de taxe, 86,80 au total.',
                '<b>Les taux de taxe varient considérablement</b> selon le pays, la région et même la ville — vérifiez votre taux local pour un résultat précis.',
            ],
            howto: [
                { question: 'Où trouver mon taux de taxe de vente local ?', answer: '<p>Les taux de taxe sont fixés par les gouvernements régionaux et parfois municipaux (aux États-Unis) ou comme un taux de TVA national (dans la plupart des autres pays).</p>' },
                { question: 'Est-ce la même chose que la TVA ?', answer: '<p>Le calcul est le même, bien que la TVA soit souvent déjà incluse dans les prix affichés, tandis que la taxe de vente américaine est généralement ajoutée à la caisse.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.fr, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-imposta-sulle-vendite', title: 'Calcolatore di Imposta sulle Vendite', h1: 'Calcolatore di Imposta sulle Vendite',
            meta_title: 'Calcolatore di Imposta sulle Vendite | Trova l\'Importo dell\'Imposta e il Prezzo Totale',
            meta_description: 'Calcola l\'imposta sulle vendite e il prezzo totale finale per qualsiasi acquisto, dato il prezzo al netto delle imposte e l\'aliquota fiscale.',
            short_answer: 'Questo calcolatore trova l\'imposta sulle vendite, es. un articolo da 80 con un\'imposta dell\'8,5% aggiunge 6,80 di imposta, totale 86,80.',
            intro_text: '<p>Inserisci il prezzo al netto delle imposte e la tua aliquota fiscale locale per trovare istantaneamente l\'importo dell\'imposta e il prezzo totale che pagherai.</p>',
            key_points: [
                '<b>Formula:</b> Importo dell\'Imposta = Prezzo × (Aliquota Fiscale ÷ 100); Prezzo Totale = Prezzo + Importo dell\'Imposta.',
                '<b>Esempio:</b> un articolo da 80 con un\'imposta dell\'8,5% = 6,80 di imposta, 86,80 totale.',
                '<b>Le aliquote fiscali variano notevolmente</b> per paese, regione e persino città — controlla la tua aliquota locale per un risultato accurato.',
            ],
            howto: [
                { question: 'Dove trovo la mia aliquota fiscale locale sulle vendite?', answer: '<p>Le aliquote fiscali sono fissate da governi regionali e talvolta comunali (negli USA) o come aliquota IVA nazionale (nella maggior parte degli altri paesi).</p>' },
                { question: 'È lo stesso dell\'IVA?', answer: '<p>Il calcolo è lo stesso, anche se l\'IVA è spesso già inclusa nei prezzi mostrati, mentre l\'imposta sulle vendite USA viene tipicamente aggiunta alla cassa.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.it, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.it, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'umsatzsteuer-rechner', title: 'Umsatzsteuer-Rechner', h1: 'Umsatzsteuer-Rechner',
            meta_title: 'Umsatzsteuer-Rechner | Steuerbetrag und Gesamtpreis Finden',
            meta_description: 'Berechnen Sie die Umsatzsteuer und den endgültigen Gesamtpreis für jeden Kauf anhand des Preises vor Steuern und des Steuersatzes.',
            short_answer: 'Dieser Rechner findet die Umsatzsteuer, z.B. fügt ein Artikel für 80 mit 8,5% Steuer 6,80 Steuer hinzu, für insgesamt 86,80.',
            intro_text: '<p>Geben Sie den Preis vor Steuern und Ihren lokalen Umsatzsteuersatz ein, um sofort den Steuerbetrag und den Gesamtpreis zu finden, den Sie zahlen werden.</p>',
            key_points: [
                '<b>Formel:</b> Steuerbetrag = Preis × (Steuersatz ÷ 100); Gesamtpreis = Preis + Steuerbetrag.',
                '<b>Beispiel:</b> ein Artikel für 80 mit 8,5% Steuer = 6,80 Steuer, 86,80 gesamt.',
                '<b>Steuersätze variieren stark</b> je nach Land, Region und sogar Stadt — prüfen Sie Ihren lokalen Satz für ein genaues Ergebnis.',
            ],
            howto: [
                { question: 'Wo finde ich meinen lokalen Umsatzsteuersatz?', answer: '<p>Steuersätze werden von regionalen und manchmal kommunalen Behörden (in den USA) oder als nationaler Mehrwertsteuersatz (in den meisten anderen Ländern) festgelegt.</p>' },
                { question: 'Ist das dasselbe wie die Mehrwertsteuer?', answer: '<p>Die Berechnung ist gleich, obwohl die Mehrwertsteuer oft bereits in angezeigten Preisen enthalten ist, während die US-Umsatzsteuer normalerweise an der Kasse hinzugefügt wird.</p>' },
            ],
            inputs: [
                { name: 'price', label: PRICE_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '80' },
                { name: 'tax_rate', label: TAX_RATE_LABEL.de, type: 'number', min: 0, max: 100, placeholder: '8.5' },
            ],
            outputs: [
                { name: 'tax_amount', label: TAX_AMOUNT_LABEL.de, precision: 2 },
                { name: 'total_price', label: TOTAL_PRICE_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1211: Discount Calculator
// ============================================================
const ORIGINAL_PRICE_LABEL: Record<string, string> = {
    en: 'Original Price', ru: 'Исходная цена', lv: 'Sākotnējā Cena', pl: 'Cena Początkowa',
    es: 'Precio Original', fr: 'Prix Initial', it: 'Prezzo Originale', de: 'Ursprünglicher Preis',
}
const DISCOUNT_PERCENT_LABEL: Record<string, string> = {
    en: 'Discount (%)', ru: 'Скидка (%)', lv: 'Atlaide (%)', pl: 'Rabat (%)',
    es: 'Descuento (%)', fr: 'Remise (%)', it: 'Sconto (%)', de: 'Rabatt (%)',
}
const SAVINGS_AMOUNT_LABEL: Record<string, string> = {
    en: 'You Save', ru: 'Вы экономите', lv: 'Jūs Ietaupāt', pl: 'Oszczędzasz',
    es: 'Ahorras', fr: 'Vous Économisez', it: 'Risparmi', de: 'Sie Sparen',
}
const FINAL_PRICE_LABEL: Record<string, string> = {
    en: 'Final Price', ru: 'Итоговая цена', lv: 'Galīgā Cena', pl: 'Cena Końcowa',
    es: 'Precio Final', fr: 'Prix Final', it: 'Prezzo Finale', de: 'Endpreis',
}

const discountCalculatorTool: ToolDef = {
    id: '1211',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'original_price', default: 120 }, { key: 'discount_percent', default: 25 }],
        functions: { result: { type: 'function', functionName: 'discountCalculator', params: { original_price: 'original_price', discount_percent: 'discount_percent' } } },
        outputs: [{ key: 'savings_amount', precision: 2 }, { key: 'final_price', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'discount-calculator', title: 'Discount Calculator', h1: 'Discount Calculator',
            meta_title: 'Discount Calculator | Find Your Savings and Final Price',
            meta_description: 'Calculate how much you save and the final sale price for any percentage discount.',
            short_answer: 'This calculator finds your discount, e.g. a $120 item at 25% off saves you $30, for a final price of $90.',
            intro_text: '<p>Enter the original price and discount percentage to instantly find how much you save and the final price after the discount.</p>',
            key_points: [
                '<b>Formula:</b> Savings = Original Price × (Discount % ÷ 100); Final Price = Original Price − Savings.',
                '<b>Example:</b> a $120 item at 25% off saves $30, for a final price of $90.',
                '<b>Stacking discounts:</b> if you have two discounts (e.g. a sale price plus a coupon), apply them one at a time — the second discount applies to the already-discounted price, not the original.',
            ],
            howto: [
                { question: 'How do I calculate two stacked discounts?', answer: '<p>Apply the first discount to get an intermediate price, then apply the second discount to that intermediate price — this calculator can be used twice in sequence.</p>' },
                { question: 'Does this include sales tax?', answer: '<p>No — this only calculates the discount itself; add sales tax separately using our Sales Tax Calculator if needed.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.en, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.en, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-skidki', title: 'Калькулятор скидки', h1: 'Калькулятор скидки',
            meta_title: 'Калькулятор скидки | Найдите экономию и итоговую цену',
            meta_description: 'Рассчитайте, сколько вы сэкономите и итоговую цену продажи для любого процента скидки.',
            short_answer: 'Этот калькулятор находит вашу скидку, например товар за 120 у.е. со скидкой 25% экономит 30 у.е., итоговая цена 90 у.е.',
            intro_text: '<p>Введите исходную цену и процент скидки, чтобы мгновенно узнать, сколько вы сэкономите и итоговую цену после скидки.</p>',
            key_points: [
                '<b>Формула:</b> Экономия = Исходная цена × (Скидка % ÷ 100); Итоговая цена = Исходная цена − Экономия.',
                '<b>Пример:</b> товар за 120 у.е. со скидкой 25% экономит 30 у.е., итоговая цена 90 у.е.',
                '<b>Суммирование скидок:</b> если у вас две скидки (например, цена по акции плюс купон), применяйте их по очереди — вторая скидка применяется к уже сниженной цене, а не к исходной.',
            ],
            howto: [
                { question: 'Как рассчитать две суммируемые скидки?', answer: '<p>Примените первую скидку, чтобы получить промежуточную цену, затем примените вторую скидку к этой промежуточной цене — этот калькулятор можно использовать дважды подряд.</p>' },
                { question: 'Учитывается ли налог с продаж?', answer: '<p>Нет — рассчитывается только сама скидка; добавьте налог отдельно с помощью нашего Калькулятора налога с продаж, если нужно.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.ru, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.ru, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'atlaides-kalkulators', title: 'Atlaides Kalkulators', h1: 'Atlaides Kalkulators',
            meta_title: 'Atlaides Kalkulators | Atrodiet Savus Ietaupījumus un Galīgo Cenu',
            meta_description: 'Aprēķiniet, cik daudz jūs ietaupāt un galīgo pārdošanas cenu jebkurai procentuālai atlaidei.',
            short_answer: 'Šis kalkulators atrod jūsu atlaidi, piemēram, prece par 120 ar 25% atlaidi ietaupa 30, galīgā cena 90.',
            intro_text: '<p>Ievadiet sākotnējo cenu un atlaides procentu, lai uzreiz uzzinātu, cik jūs ietaupāt un galīgo cenu pēc atlaides.</p>',
            key_points: [
                '<b>Formula:</b> Ietaupījums = Sākotnējā Cena × (Atlaide % ÷ 100); Galīgā Cena = Sākotnējā Cena − Ietaupījums.',
                '<b>Piemērs:</b> prece par 120 ar 25% atlaidi ietaupa 30, galīgā cena 90.',
                '<b>Atlaižu summēšana:</b> ja jums ir divas atlaides, piemērojiet tās pēc kārtas — otrā atlaide attiecas uz jau samazināto cenu, nevis sākotnējo.',
            ],
            howto: [
                { question: 'Kā aprēķināt divas summētas atlaides?', answer: '<p>Piemērojiet pirmo atlaidi, lai iegūtu starpposma cenu, tad piemērojiet otro atlaidi šai starpposma cenai — šo kalkulatoru var izmantot divreiz pēc kārtas.</p>' },
                { question: 'Vai tas ietver pārdošanas nodokli?', answer: '<p>Nē — tas aprēķina tikai pašu atlaidi; pievienojiet nodokli atsevišķi, izmantojot mūsu Pārdošanas Nodokļa Kalkulatoru, ja nepieciešams.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.lv, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.lv, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-rabatu', title: 'Kalkulator Rabatu', h1: 'Kalkulator Rabatu',
            meta_title: 'Kalkulator Rabatu | Znajdź Swoje Oszczędności i Cenę Końcową',
            meta_description: 'Oblicz, ile oszczędzasz i końcową cenę sprzedaży dla dowolnego procentu rabatu.',
            short_answer: 'Ten kalkulator znajduje twój rabat, np. produkt za 120 z rabatem 25% oszczędza 30, cena końcowa 90.',
            intro_text: '<p>Wpisz cenę początkową i procent rabatu, aby natychmiast dowiedzieć się, ile oszczędzasz i cenę końcową po rabacie.</p>',
            key_points: [
                '<b>Wzór:</b> Oszczędności = Cena Początkowa × (Rabat % ÷ 100); Cena Końcowa = Cena Początkowa − Oszczędności.',
                '<b>Przykład:</b> produkt za 120 z rabatem 25% oszczędza 30, cena końcowa 90.',
                '<b>Sumowanie rabatów:</b> jeśli masz dwa rabaty, stosuj je po kolei — drugi rabat dotyczy już obniżonej ceny, nie pierwotnej.',
            ],
            howto: [
                { question: 'Jak obliczyć dwa sumowane rabaty?', answer: '<p>Zastosuj pierwszy rabat, aby uzyskać cenę pośrednią, następnie zastosuj drugi rabat do tej ceny pośredniej — ten kalkulator można użyć dwukrotnie pod rząd.</p>' },
                { question: 'Czy to uwzględnia podatek od sprzedaży?', answer: '<p>Nie — to oblicza tylko sam rabat; dodaj podatek osobno za pomocą naszego Kalkulatora Podatku od Sprzedaży, jeśli potrzebne.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.pl, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.pl, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-descuento', title: 'Calculadora de Descuento', h1: 'Calculadora de Descuento',
            meta_title: 'Calculadora de Descuento | Encuentra tus Ahorros y el Precio Final',
            meta_description: 'Calcula cuánto ahorras y el precio final de venta para cualquier porcentaje de descuento.',
            short_answer: 'Esta calculadora encuentra tu descuento, p. ej. un artículo de 120 con 25% de descuento ahorra 30, precio final 90.',
            intro_text: '<p>Introduce el precio original y el porcentaje de descuento para saber al instante cuánto ahorras y el precio final después del descuento.</p>',
            key_points: [
                '<b>Fórmula:</b> Ahorro = Precio Original × (Descuento % ÷ 100); Precio Final = Precio Original − Ahorro.',
                '<b>Ejemplo:</b> un artículo de 120 con 25% de descuento ahorra 30, precio final 90.',
                '<b>Descuentos acumulados:</b> si tienes dos descuentos, aplícalos uno a la vez — el segundo descuento se aplica al precio ya descontado, no al original.',
            ],
            howto: [
                { question: '¿Cómo calculo dos descuentos acumulados?', answer: '<p>Aplica el primer descuento para obtener un precio intermedio, luego aplica el segundo descuento a ese precio intermedio — esta calculadora se puede usar dos veces seguidas.</p>' },
                { question: '¿Esto incluye el impuesto sobre ventas?', answer: '<p>No — esto solo calcula el descuento en sí; añade el impuesto por separado usando nuestra Calculadora de Impuesto sobre Ventas si es necesario.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.es, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.es, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-remise', title: 'Calculateur de Remise', h1: 'Calculateur de Remise',
            meta_title: 'Calculateur de Remise | Trouvez Vos Économies et le Prix Final',
            meta_description: 'Calculez combien vous économisez et le prix de vente final pour n\'importe quel pourcentage de remise.',
            short_answer: 'Ce calculateur trouve votre remise, ex. un article à 120 avec 25% de remise économise 30, prix final 90.',
            intro_text: '<p>Entrez le prix initial et le pourcentage de remise pour savoir instantanément combien vous économisez et le prix final après la remise.</p>',
            key_points: [
                '<b>Formule :</b> Économies = Prix Initial × (Remise % ÷ 100) ; Prix Final = Prix Initial − Économies.',
                '<b>Exemple :</b> un article à 120 avec 25% de remise économise 30, prix final 90.',
                '<b>Cumul de remises :</b> si vous avez deux remises, appliquez-les une à la fois — la seconde remise s\'applique au prix déjà réduit, pas au prix initial.',
            ],
            howto: [
                { question: 'Comment calculer deux remises cumulées ?', answer: '<p>Appliquez la première remise pour obtenir un prix intermédiaire, puis appliquez la seconde remise à ce prix intermédiaire — ce calculateur peut être utilisé deux fois de suite.</p>' },
                { question: 'Cela inclut-il la taxe de vente ?', answer: '<p>Non — cela calcule uniquement la remise elle-même ; ajoutez la taxe séparément avec notre Calculateur de Taxe de Vente si nécessaire.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.fr, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.fr, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-sconto', title: 'Calcolatore di Sconto', h1: 'Calcolatore di Sconto',
            meta_title: 'Calcolatore di Sconto | Trova i Tuoi Risparmi e il Prezzo Finale',
            meta_description: 'Calcola quanto risparmi e il prezzo di vendita finale per qualsiasi percentuale di sconto.',
            short_answer: 'Questo calcolatore trova il tuo sconto, es. un articolo da 120 con il 25% di sconto risparmia 30, prezzo finale 90.',
            intro_text: '<p>Inserisci il prezzo originale e la percentuale di sconto per sapere istantaneamente quanto risparmi e il prezzo finale dopo lo sconto.</p>',
            key_points: [
                '<b>Formula:</b> Risparmio = Prezzo Originale × (Sconto % ÷ 100); Prezzo Finale = Prezzo Originale − Risparmio.',
                '<b>Esempio:</b> un articolo da 120 con il 25% di sconto risparmia 30, prezzo finale 90.',
                '<b>Sconti cumulativi:</b> se hai due sconti, applicali uno alla volta — il secondo sconto si applica al prezzo già scontato, non a quello originale.',
            ],
            howto: [
                { question: 'Come calcolo due sconti cumulativi?', answer: '<p>Applica il primo sconto per ottenere un prezzo intermedio, poi applica il secondo sconto a quel prezzo intermedio — questo calcolatore può essere usato due volte di seguito.</p>' },
                { question: 'Questo include l\'imposta sulle vendite?', answer: '<p>No — questo calcola solo lo sconto stesso; aggiungi l\'imposta separatamente usando il nostro Calcolatore di Imposta sulle Vendite se necessario.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.it, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.it, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'rabatt-rechner', title: 'Rabatt-Rechner', h1: 'Rabatt-Rechner',
            meta_title: 'Rabatt-Rechner | Finden Sie Ihre Ersparnis und den Endpreis',
            meta_description: 'Berechnen Sie, wie viel Sie sparen und den endgültigen Verkaufspreis für jeden prozentualen Rabatt.',
            short_answer: 'Dieser Rechner findet Ihren Rabatt, z.B. spart ein Artikel für 120 bei 25% Rabatt 30, Endpreis 90.',
            intro_text: '<p>Geben Sie den ursprünglichen Preis und den Rabattprozentsatz ein, um sofort zu erfahren, wie viel Sie sparen und den Endpreis nach dem Rabatt.</p>',
            key_points: [
                '<b>Formel:</b> Ersparnis = Ursprünglicher Preis × (Rabatt % ÷ 100); Endpreis = Ursprünglicher Preis − Ersparnis.',
                '<b>Beispiel:</b> ein Artikel für 120 bei 25% Rabatt spart 30, Endpreis 90.',
                '<b>Kombinierte Rabatte:</b> wenn Sie zwei Rabatte haben, wenden Sie diese nacheinander an — der zweite Rabatt gilt für den bereits reduzierten Preis, nicht den ursprünglichen.',
            ],
            howto: [
                { question: 'Wie berechne ich zwei kombinierte Rabatte?', answer: '<p>Wenden Sie den ersten Rabatt an, um einen Zwischenpreis zu erhalten, dann wenden Sie den zweiten Rabatt auf diesen Zwischenpreis an — dieser Rechner kann zweimal nacheinander verwendet werden.</p>' },
                { question: 'Ist die Umsatzsteuer enthalten?', answer: '<p>Nein — dies berechnet nur den Rabatt selbst; fügen Sie bei Bedarf die Steuer separat mit unserem Umsatzsteuer-Rechner hinzu.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: ORIGINAL_PRICE_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'discount_percent', label: DISCOUNT_PERCENT_LABEL.de, type: 'number', min: 0, max: 100, placeholder: '25' },
            ],
            outputs: [
                { name: 'savings_amount', label: SAVINGS_AMOUNT_LABEL.de, precision: 2 },
                { name: 'final_price', label: FINAL_PRICE_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1212: Ratio Simplifier
// ============================================================
const RATIO_A_LABEL: Record<string, string> = {
    en: 'First Number', ru: 'Первое число', lv: 'Pirmais Skaitlis', pl: 'Pierwsza Liczba',
    es: 'Primer Número', fr: 'Premier Nombre', it: 'Primo Numero', de: 'Erste Zahl',
}
const RATIO_B_LABEL: Record<string, string> = {
    en: 'Second Number', ru: 'Второе число', lv: 'Otrais Skaitlis', pl: 'Druga Liczba',
    es: 'Segundo Número', fr: 'Deuxième Nombre', it: 'Secondo Numero', de: 'Zweite Zahl',
}
const SIMPLIFIED_RATIO_LABEL: Record<string, string> = {
    en: 'Simplified Ratio', ru: 'Упрощённое соотношение', lv: 'Vienkāršotā Attiecība', pl: 'Uproszczony Stosunek',
    es: 'Proporción Simplificada', fr: 'Ratio Simplifié', it: 'Rapporto Semplificato', de: 'Vereinfachtes Verhältnis',
}

const ratioSimplifierTool: ToolDef = {
    id: '1212',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'ratio_a', default: 8 }, { key: 'ratio_b', default: 12 }],
        functions: { result: { type: 'function', functionName: 'ratioSimplifier', params: { ratio_a: 'ratio_a', ratio_b: 'ratio_b' } } },
        outputs: [{ key: 'simplified_a' }, { key: 'simplified_b' }, { key: 'simplified_ratio' }],
    },
    locales: {
        en: {
            slug: 'ratio-simplifier', title: 'Ratio Simplifier', h1: 'Ratio Simplifier',
            meta_title: 'Ratio Simplifier | Reduce a Ratio to Its Simplest Form',
            meta_description: 'Simplify any ratio (like 8:12) to its lowest whole-number terms (like 2:3) instantly.',
            short_answer: 'This calculator simplifies a ratio, e.g. 8:12 simplifies to 2:3.',
            intro_text: '<p>Enter two numbers to instantly reduce their ratio to its simplest whole-number form, the same way you\'d simplify a fraction.</p>',
            key_points: [
                '<b>Method:</b> both numbers are divided by their greatest common divisor (GCD) to reach the simplest equivalent ratio.',
                '<b>Example:</b> 8:12 — the GCD of 8 and 12 is 4, so 8÷4 : 12÷4 = 2:3.',
                '<b>Works for any whole numbers,</b> including large ones — e.g. 144:216 simplifies to 2:3 as well.',
            ],
            howto: [
                { question: 'What if the ratio is already in simplest form?', answer: '<p>The calculator returns the same numbers unchanged — e.g. 2:3 simplifies to 2:3 since its GCD is already 1.</p>' },
                { question: 'Does this work with decimals?', answer: '<p>This tool is designed for whole-number ratios; for decimal ratios, first multiply both numbers by a power of 10 to make them whole numbers.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.en }],
        },
        ru: {
            slug: 'uproscheniye-otnosheniya', title: 'Упрощение соотношения', h1: 'Упрощение соотношения',
            meta_title: 'Упрощение соотношения | Приведите соотношение к простейшему виду',
            meta_description: 'Упростите любое соотношение (например, 8:12) до простейших целых чисел (например, 2:3) мгновенно.',
            short_answer: 'Этот калькулятор упрощает соотношение, например 8:12 упрощается до 2:3.',
            intro_text: '<p>Введите два числа, чтобы мгновенно привести их соотношение к простейшему виду с целыми числами — так же, как упрощают дробь.</p>',
            key_points: [
                '<b>Метод:</b> оба числа делятся на их наибольший общий делитель (НОД), чтобы получить простейшее эквивалентное соотношение.',
                '<b>Пример:</b> 8:12 — НОД чисел 8 и 12 равен 4, поэтому 8÷4 : 12÷4 = 2:3.',
                '<b>Работает с любыми целыми числами,</b> включая большие — например, 144:216 также упрощается до 2:3.',
            ],
            howto: [
                { question: 'Что если соотношение уже в простейшем виде?', answer: '<p>Калькулятор вернёт те же числа без изменений — например, 2:3 упрощается до 2:3, так как их НОД уже равен 1.</p>' },
                { question: 'Работает ли это с дробными числами?', answer: '<p>Этот инструмент рассчитан на целочисленные соотношения; для дробных сначала умножьте оба числа на степень 10, чтобы сделать их целыми.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.ru }],
        },
        lv: {
            slug: 'attiecibas-vienkarsotajs', title: 'Attiecības Vienkāršotājs', h1: 'Attiecības Vienkāršotājs',
            meta_title: 'Attiecības Vienkāršotājs | Samaziniet Attiecību Līdz Vienkāršākajai Formai',
            meta_description: 'Uzreiz vienkāršojiet jebkuru attiecību (piemēram, 8:12) līdz vienkāršākajiem veseliem skaitļiem (piemēram, 2:3).',
            short_answer: 'Šis kalkulators vienkāršo attiecību, piemēram, 8:12 vienkāršojas līdz 2:3.',
            intro_text: '<p>Ievadiet divus skaitļus, lai uzreiz samazinātu to attiecību līdz vienkāršākajai veselo skaitļu formai — tāpat kā vienkāršotu daļskaitli.</p>',
            key_points: [
                '<b>Metode:</b> abi skaitļi tiek dalīti ar to lielāko kopīgo dalītāju (LKD), lai iegūtu vienkāršāko ekvivalento attiecību.',
                '<b>Piemērs:</b> 8:12 — 8 un 12 LKD ir 4, tāpēc 8÷4 : 12÷4 = 2:3.',
                '<b>Darbojas ar jebkuriem veseliem skaitļiem,</b> ieskaitot lielus — piem., 144:216 arī vienkāršojas līdz 2:3.',
            ],
            howto: [
                { question: 'Kas notiek, ja attiecība jau ir vienkāršākajā formā?', answer: '<p>Kalkulators atgriezīs tos pašus skaitļus nemainītus — piem., 2:3 vienkāršojas līdz 2:3, jo to LKD jau ir 1.</p>' },
                { question: 'Vai tas darbojas ar decimāldaļskaitļiem?', answer: '<p>Šis rīks paredzēts veselu skaitļu attiecībām; decimāldaļskaitļiem vispirms reiziniet abus skaitļus ar 10 pakāpi, lai tie kļūtu veseli.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.lv }],
        },
        pl: {
            slug: 'upraszczanie-proporcji', title: 'Upraszczanie Proporcji', h1: 'Upraszczanie Proporcji',
            meta_title: 'Upraszczanie Proporcji | Zredukuj Proporcję do Najprostszej Formy',
            meta_description: 'Natychmiast uprość dowolną proporcję (np. 8:12) do najprostszych liczb całkowitych (np. 2:3).',
            short_answer: 'Ten kalkulator upraszcza proporcję, np. 8:12 upraszcza się do 2:3.',
            intro_text: '<p>Wpisz dwie liczby, aby natychmiast zredukować ich proporcję do najprostszej formy liczb całkowitych — tak samo jak upraszcza się ułamek.</p>',
            key_points: [
                '<b>Metoda:</b> obie liczby są dzielone przez ich największy wspólny dzielnik (NWD), aby uzyskać najprostszą równoważną proporcję.',
                '<b>Przykład:</b> 8:12 — NWD liczb 8 i 12 to 4, więc 8÷4 : 12÷4 = 2:3.',
                '<b>Działa dla dowolnych liczb całkowitych,</b> w tym dużych — np. 144:216 również upraszcza się do 2:3.',
            ],
            howto: [
                { question: 'Co jeśli proporcja jest już w najprostszej formie?', answer: '<p>Kalkulator zwróci te same liczby bez zmian — np. 2:3 upraszcza się do 2:3, ponieważ ich NWD już wynosi 1.</p>' },
                { question: 'Czy to działa z ułamkami dziesiętnymi?', answer: '<p>To narzędzie jest przeznaczone dla proporcji liczb całkowitych; dla ułamków dziesiętnych najpierw pomnóż obie liczby przez potęgę 10, aby stały się liczbami całkowitymi.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.pl }],
        },
        es: {
            slug: 'simplificador-de-proporciones', title: 'Simplificador de Proporciones', h1: 'Simplificador de Proporciones',
            meta_title: 'Simplificador de Proporciones | Reduce una Proporción a su Forma Más Simple',
            meta_description: 'Simplifica cualquier proporción (como 8:12) a sus términos enteros más simples (como 2:3) al instante.',
            short_answer: 'Esta calculadora simplifica una proporción, p. ej. 8:12 se simplifica a 2:3.',
            intro_text: '<p>Introduce dos números para reducir instantáneamente su proporción a su forma más simple de números enteros — igual que simplificarías una fracción.</p>',
            key_points: [
                '<b>Método:</b> ambos números se dividen por su máximo común divisor (MCD) para llegar a la proporción equivalente más simple.',
                '<b>Ejemplo:</b> 8:12 — el MCD de 8 y 12 es 4, así que 8÷4 : 12÷4 = 2:3.',
                '<b>Funciona con cualquier número entero,</b> incluidos los grandes — p. ej. 144:216 también se simplifica a 2:3.',
            ],
            howto: [
                { question: '¿Qué pasa si la proporción ya está en su forma más simple?', answer: '<p>La calculadora devuelve los mismos números sin cambios — p. ej. 2:3 se simplifica a 2:3 ya que su MCD ya es 1.</p>' },
                { question: '¿Esto funciona con decimales?', answer: '<p>Esta herramienta está diseñada para proporciones de números enteros; para proporciones decimales, primero multiplica ambos números por una potencia de 10 para convertirlos en enteros.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.es }],
        },
        fr: {
            slug: 'simplificateur-de-ratio', title: 'Simplificateur de Ratio', h1: 'Simplificateur de Ratio',
            meta_title: 'Simplificateur de Ratio | Réduisez un Ratio à sa Forme la Plus Simple',
            meta_description: 'Simplifiez instantanément n\'importe quel ratio (comme 8:12) à ses termes entiers les plus simples (comme 2:3).',
            short_answer: 'Ce calculateur simplifie un ratio, ex. 8:12 se simplifie en 2:3.',
            intro_text: '<p>Entrez deux nombres pour réduire instantanément leur ratio à sa forme entière la plus simple — de la même façon que vous simplifieriez une fraction.</p>',
            key_points: [
                '<b>Méthode :</b> les deux nombres sont divisés par leur plus grand diviseur commun (PGCD) pour atteindre le ratio équivalent le plus simple.',
                '<b>Exemple :</b> 8:12 — le PGCD de 8 et 12 est 4, donc 8÷4 : 12÷4 = 2:3.',
                '<b>Fonctionne avec tous les nombres entiers,</b> y compris les grands — ex. 144:216 se simplifie aussi en 2:3.',
            ],
            howto: [
                { question: 'Que se passe-t-il si le ratio est déjà sous sa forme la plus simple ?', answer: '<p>Le calculateur renvoie les mêmes nombres inchangés — ex. 2:3 se simplifie en 2:3 puisque son PGCD est déjà 1.</p>' },
                { question: 'Cela fonctionne-t-il avec les décimales ?', answer: '<p>Cet outil est conçu pour les ratios de nombres entiers ; pour les ratios décimaux, multipliez d\'abord les deux nombres par une puissance de 10 pour en faire des entiers.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.fr }],
        },
        it: {
            slug: 'semplificatore-di-rapporti', title: 'Semplificatore di Rapporti', h1: 'Semplificatore di Rapporti',
            meta_title: 'Semplificatore di Rapporti | Riduci un Rapporto alla Sua Forma Più Semplice',
            meta_description: 'Semplifica istantaneamente qualsiasi rapporto (come 8:12) ai suoi termini interi più semplici (come 2:3).',
            short_answer: 'Questo calcolatore semplifica un rapporto, es. 8:12 si semplifica in 2:3.',
            intro_text: '<p>Inserisci due numeri per ridurre istantaneamente il loro rapporto alla forma intera più semplice — allo stesso modo in cui semplificheresti una frazione.</p>',
            key_points: [
                '<b>Metodo:</b> entrambi i numeri vengono divisi per il loro massimo comune divisore (MCD) per raggiungere il rapporto equivalente più semplice.',
                '<b>Esempio:</b> 8:12 — l\'MCD di 8 e 12 è 4, quindi 8÷4 : 12÷4 = 2:3.',
                '<b>Funziona con qualsiasi numero intero,</b> compresi quelli grandi — es. anche 144:216 si semplifica in 2:3.',
            ],
            howto: [
                { question: 'Cosa succede se il rapporto è già nella forma più semplice?', answer: '<p>Il calcolatore restituisce gli stessi numeri invariati — es. 2:3 si semplifica in 2:3 poiché il loro MCD è già 1.</p>' },
                { question: 'Funziona con i decimali?', answer: '<p>Questo strumento è progettato per rapporti di numeri interi; per rapporti decimali, moltiplica prima entrambi i numeri per una potenza di 10 per renderli interi.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.it }],
        },
        de: {
            slug: 'verhaeltnis-vereinfacher', title: 'Verhältnis-Vereinfacher', h1: 'Verhältnis-Vereinfacher',
            meta_title: 'Verhältnis-Vereinfacher | Reduzieren Sie ein Verhältnis auf die Einfachste Form',
            meta_description: 'Vereinfachen Sie jedes Verhältnis (wie 8:12) sofort auf die einfachsten ganzzahligen Terme (wie 2:3).',
            short_answer: 'Dieser Rechner vereinfacht ein Verhältnis, z.B. wird 8:12 zu 2:3 vereinfacht.',
            intro_text: '<p>Geben Sie zwei Zahlen ein, um ihr Verhältnis sofort auf die einfachste ganzzahlige Form zu reduzieren — genau wie Sie einen Bruch vereinfachen würden.</p>',
            key_points: [
                '<b>Methode:</b> beide Zahlen werden durch ihren größten gemeinsamen Teiler (ggT) geteilt, um das einfachste äquivalente Verhältnis zu erhalten.',
                '<b>Beispiel:</b> 8:12 — der ggT von 8 und 12 ist 4, also 8÷4 : 12÷4 = 2:3.',
                '<b>Funktioniert mit jeder ganzen Zahl,</b> auch großen — z.B. wird auch 144:216 zu 2:3 vereinfacht.',
            ],
            howto: [
                { question: 'Was passiert, wenn das Verhältnis bereits in der einfachsten Form ist?', answer: '<p>Der Rechner gibt dieselben Zahlen unverändert zurück — z.B. wird 2:3 zu 2:3 vereinfacht, da ihr ggT bereits 1 ist.</p>' },
                { question: 'Funktioniert das mit Dezimalzahlen?', answer: '<p>Dieses Tool ist für ganzzahlige Verhältnisse konzipiert; multiplizieren Sie bei Dezimalverhältnissen zuerst beide Zahlen mit einer Zehnerpotenz, um sie zu ganzen Zahlen zu machen.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '8' },
                { name: 'ratio_b', label: RATIO_B_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '12' },
            ],
            outputs: [{ name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.de }],
        },
    },
}

// ============================================================
// 1213: Proportion Calculator (solve for X)
// ============================================================
const SOLVE_FOR_LABEL: Record<string, string> = {
    en: 'Solve For', ru: 'Решить относительно', lv: 'Atrisināt Attiecībā uz', pl: 'Rozwiąż Dla',
    es: 'Resolver Para', fr: 'Résoudre Pour', it: 'Risolvi Per', de: 'Auflösen Nach',
}
const SOLVE_FOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
    en: [{ value: 'a', label: 'A (in A/B = C/D)' }, { value: 'b', label: 'B (in A/B = C/D)' }, { value: 'c', label: 'C (in A/B = C/D)' }, { value: 'd', label: 'D (in A/B = C/D)' }],
    ru: [{ value: 'a', label: 'A (в A/B = C/D)' }, { value: 'b', label: 'B (в A/B = C/D)' }, { value: 'c', label: 'C (в A/B = C/D)' }, { value: 'd', label: 'D (в A/B = C/D)' }],
    lv: [{ value: 'a', label: 'A (izteiksmē A/B = C/D)' }, { value: 'b', label: 'B (izteiksmē A/B = C/D)' }, { value: 'c', label: 'C (izteiksmē A/B = C/D)' }, { value: 'd', label: 'D (izteiksmē A/B = C/D)' }],
    pl: [{ value: 'a', label: 'A (w A/B = C/D)' }, { value: 'b', label: 'B (w A/B = C/D)' }, { value: 'c', label: 'C (w A/B = C/D)' }, { value: 'd', label: 'D (w A/B = C/D)' }],
    es: [{ value: 'a', label: 'A (en A/B = C/D)' }, { value: 'b', label: 'B (en A/B = C/D)' }, { value: 'c', label: 'C (en A/B = C/D)' }, { value: 'd', label: 'D (en A/B = C/D)' }],
    fr: [{ value: 'a', label: 'A (dans A/B = C/D)' }, { value: 'b', label: 'B (dans A/B = C/D)' }, { value: 'c', label: 'C (dans A/B = C/D)' }, { value: 'd', label: 'D (dans A/B = C/D)' }],
    it: [{ value: 'a', label: 'A (in A/B = C/D)' }, { value: 'b', label: 'B (in A/B = C/D)' }, { value: 'c', label: 'C (in A/B = C/D)' }, { value: 'd', label: 'D (in A/B = C/D)' }],
    de: [{ value: 'a', label: 'A (in A/B = C/D)' }, { value: 'b', label: 'B (in A/B = C/D)' }, { value: 'c', label: 'C (in A/B = C/D)' }, { value: 'd', label: 'D (in A/B = C/D)' }],
}
const VALUE_A_LABEL: Record<string, string> = { en: 'A', ru: 'A', lv: 'A', pl: 'A', es: 'A', fr: 'A', it: 'A', de: 'A' }
const VALUE_B_LABEL: Record<string, string> = { en: 'B', ru: 'B', lv: 'B', pl: 'B', es: 'B', fr: 'B', it: 'B', de: 'B' }
const VALUE_C_LABEL: Record<string, string> = { en: 'C', ru: 'C', lv: 'C', pl: 'C', es: 'C', fr: 'C', it: 'C', de: 'C' }
const VALUE_D_LABEL: Record<string, string> = { en: 'D', ru: 'D', lv: 'D', pl: 'D', es: 'D', fr: 'D', it: 'D', de: 'D' }

const proportionCalculatorTool: ToolDef = {
    id: '1213',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'a', default: 2 }, { key: 'b', default: 3 }, { key: 'c', default: 10 }, { key: 'd', default: 0 }, { key: 'solve_for', default: 'd' }],
        functions: { result: { type: 'function', functionName: 'proportionCalculator', params: { a: 'a', b: 'b', c: 'c', d: 'd', solve_for: 'solve_for' } } },
        outputs: [{ key: 'result', precision: 4 }],
    },
    locales: {
        en: {
            slug: 'proportion-calculator', title: 'Proportion Calculator', h1: 'Proportion Calculator',
            meta_title: 'Proportion Calculator | Solve A/B = C/D for the Missing Value',
            meta_description: 'Solve any proportion (A/B = C/D) for a missing value using cross-multiplication — instantly find the unknown term.',
            short_answer: 'This calculator solves proportions, e.g. if 2/3 = 10/D, then D = 15.',
            intro_text: '<p>Enter three known values in the proportion A/B = C/D, choose which term is missing, and instantly solve for it using cross-multiplication.</p>',
            key_points: [
                '<b>Cross-multiplication formula:</b> A × D = B × C, rearranged to solve for whichever term is unknown.',
                '<b>Example:</b> if 2/3 = 10/D, cross-multiplying gives 2D = 30, so D = 15.',
                '<b>Common uses:</b> scaling recipes, converting map distances to real distances, and solving similar-triangle geometry problems.',
            ],
            howto: [
                { question: 'What does "Solve For" mean here?', answer: '<p>Select which of the four terms (A, B, C, or D) you want the calculator to find — its own input value is then ignored and only used to label the field.</p>' },
                { question: 'Can I use this for recipe scaling?', answer: '<p>Yes — e.g. if a recipe for 4 servings needs 2 cups of flour, set up 4/2 = (new servings)/D to find how much flour you need for a different serving size.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.en, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.en, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.en, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.en, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.en, type: 'select', options: SOLVE_FOR_OPTIONS.en },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.en, precision: 4 }],
        },
        ru: {
            slug: 'kalkulyator-proportsiy', title: 'Калькулятор пропорций', h1: 'Калькулятор пропорций',
            meta_title: 'Калькулятор пропорций | Решите A/B = C/D для недостающего значения',
            meta_description: 'Решите любую пропорцию (A/B = C/D) для недостающего значения методом перекрёстного умножения — мгновенно найдите неизвестный член.',
            short_answer: 'Этот калькулятор решает пропорции, например если 2/3 = 10/D, то D = 15.',
            intro_text: '<p>Введите три известных значения в пропорции A/B = C/D, выберите, какой член недостающий, и мгновенно решите для него методом перекрёстного умножения.</p>',
            key_points: [
                '<b>Формула перекрёстного умножения:</b> A × D = B × C, преобразуется для решения относительно неизвестного члена.',
                '<b>Пример:</b> если 2/3 = 10/D, перекрёстное умножение даёт 2D = 30, значит D = 15.',
                '<b>Частое применение:</b> масштабирование рецептов, перевод расстояний на карте в реальные расстояния и решение задач по подобию треугольников.',
            ],
            howto: [
                { question: 'Что означает "Решить относительно" здесь?', answer: '<p>Выберите, какой из четырёх членов (A, B, C или D) должен найти калькулятор — его собственное введённое значение при этом игнорируется.</p>' },
                { question: 'Можно ли использовать это для масштабирования рецептов?', answer: '<p>Да — например, если рецепт на 4 порции требует 2 стакана муки, составьте 4/2 = (новые порции)/D, чтобы найти нужное количество муки для другого числа порций.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.ru, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.ru, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.ru, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.ru, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.ru, type: 'select', options: SOLVE_FOR_OPTIONS.ru },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.ru, precision: 4 }],
        },
        lv: {
            slug: 'proporciju-kalkulators', title: 'Proporciju Kalkulators', h1: 'Proporciju Kalkulators',
            meta_title: 'Proporciju Kalkulators | Atrisiniet A/B = C/D Trūkstošajai Vērtībai',
            meta_description: 'Atrisiniet jebkuru proporciju (A/B = C/D) trūkstošai vērtībai, izmantojot krustveida reizināšanu.',
            short_answer: 'Šis kalkulators atrisina proporcijas, piemēram, ja 2/3 = 10/D, tad D = 15.',
            intro_text: '<p>Ievadiet trīs zināmas vērtības proporcijā A/B = C/D, izvēlieties, kurš termins trūkst, un uzreiz atrisiniet to, izmantojot krustveida reizināšanu.</p>',
            key_points: [
                '<b>Krustveida reizināšanas formula:</b> A × D = B × C, pārkārtota, lai atrisinātu jebkuru nezināmo terminu.',
                '<b>Piemērs:</b> ja 2/3 = 10/D, krustveida reizināšana dod 2D = 30, tātad D = 15.',
                '<b>Bieži izmantots:</b> recepšu mērogošanai, kartes attālumu pārvēršanai reālos attālumos un līdzīgu trijstūru ģeometrijas uzdevumu risināšanai.',
            ],
            howto: [
                { question: 'Ko šeit nozīmē "Atrisināt attiecībā uz"?', answer: '<p>Izvēlieties, kuru no četriem terminiem (A, B, C vai D) kalkulatoram jāatrod — tā paša ievades vērtība tiek ignorēta.</p>' },
                { question: 'Vai varu to izmantot recepšu mērogošanai?', answer: '<p>Jā — piemēram, ja recepte 4 porcijām prasa 2 tases miltu, izveidojiet 4/2 = (jaunās porcijas)/D, lai atrastu nepieciešamo miltu daudzumu citam porciju skaitam.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.lv, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.lv, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.lv, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.lv, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.lv, type: 'select', options: SOLVE_FOR_OPTIONS.lv },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.lv, precision: 4 }],
        },
        pl: {
            slug: 'kalkulator-proporcji', title: 'Kalkulator Proporcji', h1: 'Kalkulator Proporcji',
            meta_title: 'Kalkulator Proporcji | Rozwiąż A/B = C/D dla Brakującej Wartości',
            meta_description: 'Rozwiąż dowolną proporcję (A/B = C/D) dla brakującej wartości za pomocą mnożenia na krzyż.',
            short_answer: 'Ten kalkulator rozwiązuje proporcje, np. jeśli 2/3 = 10/D, to D = 15.',
            intro_text: '<p>Wpisz trzy znane wartości w proporcji A/B = C/D, wybierz, który wyraz brakuje, i natychmiast rozwiąż go za pomocą mnożenia na krzyż.</p>',
            key_points: [
                '<b>Wzór mnożenia na krzyż:</b> A × D = B × C, przekształcony, aby rozwiązać dla dowolnego nieznanego wyrazu.',
                '<b>Przykład:</b> jeśli 2/3 = 10/D, mnożenie na krzyż daje 2D = 30, więc D = 15.',
                '<b>Częste zastosowania:</b> skalowanie przepisów, przeliczanie odległości na mapie na rzeczywiste odległości i rozwiązywanie zadań geometrycznych z podobnymi trójkątami.',
            ],
            howto: [
                { question: 'Co oznacza tutaj "Rozwiąż dla"?', answer: '<p>Wybierz, który z czterech wyrazów (A, B, C lub D) ma znaleźć kalkulator — jego własna wartość wejściowa jest wtedy ignorowana.</p>' },
                { question: 'Czy mogę użyć tego do skalowania przepisów?', answer: '<p>Tak — np. jeśli przepis na 4 porcje wymaga 2 szklanek mąki, ustaw 4/2 = (nowe porcje)/D, aby znaleźć potrzebną ilość mąki dla innej liczby porcji.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.pl, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.pl, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.pl, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.pl, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.pl, type: 'select', options: SOLVE_FOR_OPTIONS.pl },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.pl, precision: 4 }],
        },
        es: {
            slug: 'calculadora-de-proporciones', title: 'Calculadora de Proporciones', h1: 'Calculadora de Proporciones',
            meta_title: 'Calculadora de Proporciones | Resuelve A/B = C/D para el Valor Faltante',
            meta_description: 'Resuelve cualquier proporción (A/B = C/D) para un valor faltante usando la multiplicación cruzada.',
            short_answer: 'Esta calculadora resuelve proporciones, p. ej. si 2/3 = 10/D, entonces D = 15.',
            intro_text: '<p>Introduce tres valores conocidos en la proporción A/B = C/D, elige qué término falta, y resuélvelo al instante usando la multiplicación cruzada.</p>',
            key_points: [
                '<b>Fórmula de multiplicación cruzada:</b> A × D = B × C, reorganizada para resolver cualquier término desconocido.',
                '<b>Ejemplo:</b> si 2/3 = 10/D, la multiplicación cruzada da 2D = 30, así que D = 15.',
                '<b>Usos comunes:</b> escalar recetas, convertir distancias del mapa a distancias reales, y resolver problemas de geometría de triángulos semejantes.',
            ],
            howto: [
                { question: '¿Qué significa "Resolver Para" aquí?', answer: '<p>Selecciona cuál de los cuatro términos (A, B, C o D) quieres que encuentre la calculadora — su propio valor de entrada se ignora entonces.</p>' },
                { question: '¿Puedo usar esto para escalar recetas?', answer: '<p>Sí — p. ej. si una receta para 4 porciones necesita 2 tazas de harina, configura 4/2 = (nuevas porciones)/D para encontrar cuánta harina necesitas para otro tamaño de porción.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.es, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.es, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.es, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.es, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.es, type: 'select', options: SOLVE_FOR_OPTIONS.es },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.es, precision: 4 }],
        },
        fr: {
            slug: 'calculateur-de-proportion', title: 'Calculateur de Proportion', h1: 'Calculateur de Proportion',
            meta_title: 'Calculateur de Proportion | Résolvez A/B = C/D pour la Valeur Manquante',
            meta_description: 'Résolvez n\'importe quelle proportion (A/B = C/D) pour une valeur manquante en utilisant la multiplication croisée.',
            short_answer: 'Ce calculateur résout des proportions, ex. si 2/3 = 10/D, alors D = 15.',
            intro_text: '<p>Entrez trois valeurs connues dans la proportion A/B = C/D, choisissez quel terme manque, et résolvez-le instantanément par multiplication croisée.</p>',
            key_points: [
                '<b>Formule de multiplication croisée :</b> A × D = B × C, réarrangée pour résoudre n\'importe quel terme inconnu.',
                '<b>Exemple :</b> si 2/3 = 10/D, la multiplication croisée donne 2D = 30, donc D = 15.',
                '<b>Usages courants :</b> mise à l\'échelle de recettes, conversion de distances cartographiques en distances réelles, et résolution de problèmes de géométrie sur les triangles semblables.',
            ],
            howto: [
                { question: 'Que signifie "Résoudre Pour" ici ?', answer: '<p>Sélectionnez lequel des quatre termes (A, B, C ou D) vous voulez que le calculateur trouve — sa propre valeur d\'entrée est alors ignorée.</p>' },
                { question: 'Puis-je utiliser cela pour la mise à l\'échelle de recettes ?', answer: '<p>Oui — ex. si une recette pour 4 portions nécessite 2 tasses de farine, configurez 4/2 = (nouvelles portions)/D pour trouver la quantité de farine nécessaire pour une autre taille de portion.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.fr, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.fr, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.fr, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.fr, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.fr, type: 'select', options: SOLVE_FOR_OPTIONS.fr },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.fr, precision: 4 }],
        },
        it: {
            slug: 'calcolatore-di-proporzioni', title: 'Calcolatore di Proporzioni', h1: 'Calcolatore di Proporzioni',
            meta_title: 'Calcolatore di Proporzioni | Risolvi A/B = C/D per il Valore Mancante',
            meta_description: 'Risolvi qualsiasi proporzione (A/B = C/D) per un valore mancante usando la moltiplicazione incrociata.',
            short_answer: 'Questo calcolatore risolve le proporzioni, es. se 2/3 = 10/D, allora D = 15.',
            intro_text: '<p>Inserisci tre valori noti nella proporzione A/B = C/D, scegli quale termine manca, e risolvilo istantaneamente usando la moltiplicazione incrociata.</p>',
            key_points: [
                '<b>Formula di moltiplicazione incrociata:</b> A × D = B × C, riorganizzata per risolvere qualsiasi termine sconosciuto.',
                '<b>Esempio:</b> se 2/3 = 10/D, la moltiplicazione incrociata dà 2D = 30, quindi D = 15.',
                '<b>Usi comuni:</b> scalare ricette, convertire distanze su mappa in distanze reali, e risolvere problemi di geometria sui triangoli simili.',
            ],
            howto: [
                { question: 'Cosa significa "Risolvi Per" qui?', answer: '<p>Seleziona quale dei quattro termini (A, B, C o D) vuoi che il calcolatore trovi — il suo stesso valore di input viene quindi ignorato.</p>' },
                { question: 'Posso usarlo per scalare ricette?', answer: '<p>Sì — es. se una ricetta per 4 porzioni richiede 2 tazze di farina, imposta 4/2 = (nuove porzioni)/D per trovare quanta farina serve per una porzione diversa.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.it, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.it, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.it, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.it, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.it, type: 'select', options: SOLVE_FOR_OPTIONS.it },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.it, precision: 4 }],
        },
        de: {
            slug: 'verhaeltnisgleichung-rechner', title: 'Verhältnisgleichung-Rechner', h1: 'Verhältnisgleichung-Rechner',
            meta_title: 'Verhältnisgleichung-Rechner | Lösen Sie A/B = C/D nach dem Fehlenden Wert',
            meta_description: 'Lösen Sie jede Verhältnisgleichung (A/B = C/D) nach einem fehlenden Wert mittels Kreuzmultiplikation.',
            short_answer: 'Dieser Rechner löst Verhältnisgleichungen, z.B. wenn 2/3 = 10/D, dann ist D = 15.',
            intro_text: '<p>Geben Sie drei bekannte Werte in der Verhältnisgleichung A/B = C/D ein, wählen Sie, welcher Term fehlt, und lösen Sie ihn sofort mittels Kreuzmultiplikation.</p>',
            key_points: [
                '<b>Kreuzmultiplikationsformel:</b> A × D = B × C, umgestellt, um nach dem jeweils unbekannten Term aufzulösen.',
                '<b>Beispiel:</b> wenn 2/3 = 10/D, ergibt die Kreuzmultiplikation 2D = 30, also D = 15.',
                '<b>Häufige Anwendungen:</b> Skalieren von Rezepten, Umrechnen von Kartenentfernungen in reale Entfernungen und Lösen von Geometrieaufgaben mit ähnlichen Dreiecken.',
            ],
            howto: [
                { question: 'Was bedeutet "Auflösen Nach" hier?', answer: '<p>Wählen Sie, welchen der vier Terme (A, B, C oder D) der Rechner finden soll — sein eigener Eingabewert wird dann ignoriert.</p>' },
                { question: 'Kann ich das für die Skalierung von Rezepten verwenden?', answer: '<p>Ja — wenn z.B. ein Rezept für 4 Portionen 2 Tassen Mehl benötigt, richten Sie 4/2 = (neue Portionen)/D ein, um herauszufinden, wie viel Mehl Sie für eine andere Portionsgröße benötigen.</p>' },
            ],
            inputs: [
                { name: 'a', label: VALUE_A_LABEL.de, type: 'number', placeholder: '2' },
                { name: 'b', label: VALUE_B_LABEL.de, type: 'number', placeholder: '3' },
                { name: 'c', label: VALUE_C_LABEL.de, type: 'number', placeholder: '10' },
                { name: 'd', label: VALUE_D_LABEL.de, type: 'number', placeholder: '0' },
                { name: 'solve_for', label: SOLVE_FOR_LABEL.de, type: 'select', options: SOLVE_FOR_OPTIONS.de },
            ],
            outputs: [{ name: 'result', label: RESULT_LABEL.de, precision: 4 }],
        },
    },
}

// ============================================================
// 1214: Aspect Ratio Calculator
// ============================================================
const WIDTH_LABEL: Record<string, string> = {
    en: 'Width', ru: 'Ширина', lv: 'Platums', pl: 'Szerokość',
    es: 'Ancho', fr: 'Largeur', it: 'Larghezza', de: 'Breite',
}
const HEIGHT_LABEL: Record<string, string> = {
    en: 'Height', ru: 'Высота', lv: 'Augstums', pl: 'Wysokość',
    es: 'Alto', fr: 'Hauteur', it: 'Altezza', de: 'Höhe',
}
const ASPECT_SOLVE_FOR_LABEL: Record<string, string> = {
    en: 'What Do You Need?', ru: 'Что вам нужно?', lv: 'Kas Jums Nepieciešams?', pl: 'Czego Potrzebujesz?',
    es: '¿Qué Necesitas?', fr: 'De Quoi Avez-Vous Besoin ?', it: 'Di Cosa Hai Bisogno?', de: 'Was Benötigen Sie?',
}
const ASPECT_SOLVE_FOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
    en: [
        { value: 'simplify_ratio', label: 'Just the simplified ratio' },
        { value: 'find_height', label: 'Find height for a target width' },
        { value: 'find_width', label: 'Find width for a target height' },
    ],
    ru: [
        { value: 'simplify_ratio', label: 'Только упрощённое соотношение' },
        { value: 'find_height', label: 'Найти высоту для заданной ширины' },
        { value: 'find_width', label: 'Найти ширину для заданной высоты' },
    ],
    lv: [
        { value: 'simplify_ratio', label: 'Tikai vienkāršotā attiecība' },
        { value: 'find_height', label: 'Atrast augstumu vēlamajam platumam' },
        { value: 'find_width', label: 'Atrast platumu vēlamajam augstumam' },
    ],
    pl: [
        { value: 'simplify_ratio', label: 'Tylko uproszczony stosunek' },
        { value: 'find_height', label: 'Znajdź wysokość dla docelowej szerokości' },
        { value: 'find_width', label: 'Znajdź szerokość dla docelowej wysokości' },
    ],
    es: [
        { value: 'simplify_ratio', label: 'Solo la proporción simplificada' },
        { value: 'find_height', label: 'Encontrar altura para un ancho objetivo' },
        { value: 'find_width', label: 'Encontrar ancho para una altura objetivo' },
    ],
    fr: [
        { value: 'simplify_ratio', label: 'Juste le ratio simplifié' },
        { value: 'find_height', label: 'Trouver la hauteur pour une largeur cible' },
        { value: 'find_width', label: 'Trouver la largeur pour une hauteur cible' },
    ],
    it: [
        { value: 'simplify_ratio', label: 'Solo il rapporto semplificato' },
        { value: 'find_height', label: 'Trova altezza per una larghezza target' },
        { value: 'find_width', label: 'Trova larghezza per un\'altezza target' },
    ],
    de: [
        { value: 'simplify_ratio', label: 'Nur das vereinfachte Verhältnis' },
        { value: 'find_height', label: 'Höhe für eine Zielbreite finden' },
        { value: 'find_width', label: 'Breite für eine Zielhöhe finden' },
    ],
}
const TARGET_VALUE_LABEL: Record<string, string> = {
    en: 'Target Width or Height', ru: 'Целевая ширина или высота', lv: 'Mērķa Platums vai Augstums', pl: 'Docelowa Szerokość lub Wysokość',
    es: 'Ancho o Alto Objetivo', fr: 'Largeur ou Hauteur Cible', it: 'Larghezza o Altezza Target', de: 'Zielbreite oder -höhe',
}
const COMPUTED_DIMENSION_LABEL: Record<string, string> = {
    en: 'Computed Dimension', ru: 'Вычисленный размер', lv: 'Aprēķinātais Izmērs', pl: 'Obliczony Wymiar',
    es: 'Dimensión Calculada', fr: 'Dimension Calculée', it: 'Dimensione Calcolata', de: 'Berechnete Abmessung',
}

const aspectRatioCalculatorTool: ToolDef = {
    id: '1214',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'width', default: 1920 }, { key: 'height', default: 1080 }, { key: 'target_value', default: 1280 }, { key: 'solve_for', default: 'simplify_ratio' }],
        functions: { result: { type: 'function', functionName: 'aspectRatioCalculator', params: { width: 'width', height: 'height', target_value: 'target_value', solve_for: 'solve_for' } } },
        outputs: [{ key: 'simplified_ratio' }, { key: 'computed_dimension', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'aspect-ratio-calculator', title: 'Aspect Ratio Calculator', h1: 'Aspect Ratio Calculator',
            meta_title: 'Aspect Ratio Calculator | Find Ratios and Proportional Dimensions',
            meta_description: 'Find the simplified aspect ratio of any width and height, and calculate a proportional new width or height for resizing.',
            short_answer: 'This calculator finds aspect ratios, e.g. 1920×1080 simplifies to a 16:9 ratio.',
            intro_text: '<p>Enter a width and height to find the simplified aspect ratio (like 16:9), and optionally calculate a new proportional width or height for resizing images or video.</p>',
            key_points: [
                '<b>Simplified ratio:</b> found the same way as the Ratio Simplifier, by dividing both dimensions by their greatest common divisor.',
                '<b>Example:</b> 1920×1080 simplifies to 16:9 — the standard widescreen ratio.',
                '<b>Resizing:</b> to keep an image proportional, a new height = target width × (original height ÷ original width), and vice versa.',
            ],
            howto: [
                { question: 'Why does my resized image look stretched if I don\'t use this?', answer: '<p>If width and height aren\'t scaled by the exact same factor, the image distorts — this calculator ensures the new dimension keeps the original proportions.</p>' },
                { question: 'What are common aspect ratios?', answer: '<p>16:9 (widescreen video), 4:3 (older TVs/monitors), 1:1 (square, social media), and 21:9 (ultrawide) are among the most common.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.en, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.en, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.en, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.en },
                { name: 'target_value', label: TARGET_VALUE_LABEL.en, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.en },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-sootnosheniya-storon', title: 'Калькулятор соотношения сторон', h1: 'Калькулятор соотношения сторон',
            meta_title: 'Калькулятор соотношения сторон | Найдите соотношения и пропорциональные размеры',
            meta_description: 'Найдите упрощённое соотношение сторон для любой ширины и высоты, и рассчитайте пропорциональную новую ширину или высоту для изменения размера.',
            short_answer: 'Этот калькулятор находит соотношение сторон, например 1920×1080 упрощается до соотношения 16:9.',
            intro_text: '<p>Введите ширину и высоту, чтобы найти упрощённое соотношение сторон (например, 16:9), и при желании рассчитайте новую пропорциональную ширину или высоту для изменения размера изображений или видео.</p>',
            key_points: [
                '<b>Упрощённое соотношение:</b> находится так же, как в Упрощении соотношения — делением обоих размеров на их наибольший общий делитель.',
                '<b>Пример:</b> 1920×1080 упрощается до 16:9 — стандартное широкоформатное соотношение.',
                '<b>Изменение размера:</b> чтобы сохранить пропорции изображения, новая высота = целевая ширина × (исходная высота ÷ исходная ширина), и наоборот.',
            ],
            howto: [
                { question: 'Почему изображение выглядит растянутым, если не использовать это?', answer: '<p>Если ширина и высота не масштабируются с одинаковым коэффициентом, изображение искажается — этот калькулятор гарантирует сохранение исходных пропорций.</p>' },
                { question: 'Какие бывают распространённые соотношения сторон?', answer: '<p>16:9 (широкоформатное видео), 4:3 (старые телевизоры/мониторы), 1:1 (квадрат, соцсети) и 21:9 (сверхширокий) — самые распространённые.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.ru, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.ru, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.ru, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.ru },
                { name: 'target_value', label: TARGET_VALUE_LABEL.ru, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.ru },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'malu-attiecibas-kalkulators', title: 'Malu Attiecības Kalkulators', h1: 'Malu Attiecības Kalkulators',
            meta_title: 'Malu Attiecības Kalkulators | Atrodiet Attiecības un Proporcionālos Izmērus',
            meta_description: 'Atrodiet vienkāršoto malu attiecību jebkuram platumam un augstumam, un aprēķiniet proporcionālu jaunu platumu vai augstumu izmēra maiņai.',
            short_answer: 'Šis kalkulators atrod malu attiecības, piemēram, 1920×1080 vienkāršojas līdz 16:9 attiecībai.',
            intro_text: '<p>Ievadiet platumu un augstumu, lai atrastu vienkāršoto malu attiecību (piemēram, 16:9), un pēc izvēles aprēķiniet jaunu proporcionālu platumu vai augstumu attēlu vai video izmēra maiņai.</p>',
            key_points: [
                '<b>Vienkāršotā attiecība:</b> tiek atrasta tāpat kā Attiecības Vienkāršotājā — dalot abus izmērus ar to lielāko kopīgo dalītāju.',
                '<b>Piemērs:</b> 1920×1080 vienkāršojas līdz 16:9 — standarta platekrāna attiecība.',
                '<b>Izmēra maiņa:</b> lai saglabātu attēla proporcijas, jauns augstums = mērķa platums × (sākotnējais augstums ÷ sākotnējais platums), un otrādi.',
            ],
            howto: [
                { question: 'Kāpēc mans izmainītais attēls izskatās izstiepts, ja to neizmantoju?', answer: '<p>Ja platums un augstums netiek mērogoti ar tieši to pašu koeficientu, attēls tiek izkropļots — šis kalkulators nodrošina, ka jaunais izmērs saglabā sākotnējās proporcijas.</p>' },
                { question: 'Kādas ir izplatītākās malu attiecības?', answer: '<p>16:9 (platekrāna video), 4:3 (vecāki televizori/monitori), 1:1 (kvadrāts, sociālie tīkli) un 21:9 (īpaši plats) ir starp visizplatītākajām.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.lv, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.lv, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.lv, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.lv },
                { name: 'target_value', label: TARGET_VALUE_LABEL.lv, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.lv },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-proporcji-obrazu', title: 'Kalkulator Proporcji Obrazu', h1: 'Kalkulator Proporcji Obrazu',
            meta_title: 'Kalkulator Proporcji Obrazu | Znajdź Stosunki i Proporcjonalne Wymiary',
            meta_description: 'Znajdź uproszczony stosunek proporcji dla dowolnej szerokości i wysokości oraz oblicz proporcjonalną nową szerokość lub wysokość do zmiany rozmiaru.',
            short_answer: 'Ten kalkulator znajduje proporcje obrazu, np. 1920×1080 upraszcza się do stosunku 16:9.',
            intro_text: '<p>Wpisz szerokość i wysokość, aby znaleźć uproszczony stosunek proporcji (jak 16:9), i opcjonalnie oblicz nową proporcjonalną szerokość lub wysokość do zmiany rozmiaru obrazów lub wideo.</p>',
            key_points: [
                '<b>Uproszczony stosunek:</b> znajdowany tak samo jak w Upraszczaniu Proporcji — poprzez podzielenie obu wymiarów przez ich największy wspólny dzielnik.',
                '<b>Przykład:</b> 1920×1080 upraszcza się do 16:9 — standardowego stosunku szerokoekranowego.',
                '<b>Zmiana rozmiaru:</b> aby zachować proporcje obrazu, nowa wysokość = docelowa szerokość × (oryginalna wysokość ÷ oryginalna szerokość), i odwrotnie.',
            ],
            howto: [
                { question: 'Dlaczego mój zmieniony obraz wygląda na rozciągnięty, jeśli tego nie użyję?', answer: '<p>Jeśli szerokość i wysokość nie są skalowane dokładnie tym samym współczynnikiem, obraz zostaje zniekształcony — ten kalkulator zapewnia, że nowy wymiar zachowuje oryginalne proporcje.</p>' },
                { question: 'Jakie są popularne proporcje obrazu?', answer: '<p>16:9 (wideo szerokoekranowe), 4:3 (starsze telewizory/monitory), 1:1 (kwadrat, media społecznościowe) i 21:9 (ultra szerokie) należą do najpopularniejszych.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.pl, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.pl, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.pl, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.pl },
                { name: 'target_value', label: TARGET_VALUE_LABEL.pl, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.pl },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-relacion-de-aspecto', title: 'Calculadora de Relación de Aspecto', h1: 'Calculadora de Relación de Aspecto',
            meta_title: 'Calculadora de Relación de Aspecto | Encuentra Proporciones y Dimensiones Proporcionales',
            meta_description: 'Encuentra la relación de aspecto simplificada de cualquier ancho y alto, y calcula un nuevo ancho o alto proporcional para redimensionar.',
            short_answer: 'Esta calculadora encuentra relaciones de aspecto, p. ej. 1920×1080 se simplifica a una relación 16:9.',
            intro_text: '<p>Introduce un ancho y alto para encontrar la relación de aspecto simplificada (como 16:9), y opcionalmente calcula un nuevo ancho o alto proporcional para redimensionar imágenes o video.</p>',
            key_points: [
                '<b>Relación simplificada:</b> se encuentra igual que en el Simplificador de Proporciones, dividiendo ambas dimensiones por su máximo común divisor.',
                '<b>Ejemplo:</b> 1920×1080 se simplifica a 16:9 — la relación panorámica estándar.',
                '<b>Redimensionar:</b> para mantener una imagen proporcional, nuevo alto = ancho objetivo × (alto original ÷ ancho original), y viceversa.',
            ],
            howto: [
                { question: '¿Por qué mi imagen redimensionada se ve estirada si no uso esto?', answer: '<p>Si el ancho y el alto no se escalan exactamente por el mismo factor, la imagen se distorsiona — esta calculadora asegura que la nueva dimensión mantenga las proporciones originales.</p>' },
                { question: '¿Cuáles son las relaciones de aspecto comunes?', answer: '<p>16:9 (video panorámico), 4:3 (televisores/monitores antiguos), 1:1 (cuadrado, redes sociales) y 21:9 (ultra panorámico) están entre las más comunes.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.es, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.es, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.es, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.es },
                { name: 'target_value', label: TARGET_VALUE_LABEL.es, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.es },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-rapport-daspect', title: 'Calculateur de Rapport d\'Aspect', h1: 'Calculateur de Rapport d\'Aspect',
            meta_title: 'Calculateur de Rapport d\'Aspect | Trouvez des Ratios et Dimensions Proportionnelles',
            meta_description: 'Trouvez le rapport d\'aspect simplifié de toute largeur et hauteur, et calculez une nouvelle largeur ou hauteur proportionnelle pour redimensionner.',
            short_answer: 'Ce calculateur trouve les rapports d\'aspect, ex. 1920×1080 se simplifie en un ratio 16:9.',
            intro_text: '<p>Entrez une largeur et une hauteur pour trouver le rapport d\'aspect simplifié (comme 16:9), et calculez éventuellement une nouvelle largeur ou hauteur proportionnelle pour redimensionner des images ou vidéos.</p>',
            key_points: [
                '<b>Ratio simplifié :</b> trouvé de la même manière que le Simplificateur de Ratio, en divisant les deux dimensions par leur plus grand diviseur commun.',
                '<b>Exemple :</b> 1920×1080 se simplifie en 16:9 — le ratio grand écran standard.',
                '<b>Redimensionnement :</b> pour garder une image proportionnelle, nouvelle hauteur = largeur cible × (hauteur originale ÷ largeur originale), et vice versa.',
            ],
            howto: [
                { question: 'Pourquoi mon image redimensionnée semble-t-elle étirée si je n\'utilise pas cela ?', answer: '<p>Si la largeur et la hauteur ne sont pas mises à l\'échelle exactement par le même facteur, l\'image se déforme — ce calculateur garantit que la nouvelle dimension conserve les proportions originales.</p>' },
                { question: 'Quels sont les rapports d\'aspect courants ?', answer: '<p>16:9 (vidéo grand écran), 4:3 (anciens téléviseurs/moniteurs), 1:1 (carré, réseaux sociaux) et 21:9 (ultra large) sont parmi les plus courants.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.fr, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.fr, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.fr, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.fr },
                { name: 'target_value', label: TARGET_VALUE_LABEL.fr, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.fr },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-proporzioni-immagine', title: 'Calcolatore di Proporzioni Immagine', h1: 'Calcolatore di Proporzioni Immagine',
            meta_title: 'Calcolatore di Proporzioni Immagine | Trova Rapporti e Dimensioni Proporzionali',
            meta_description: 'Trova il rapporto d\'aspetto semplificato di qualsiasi larghezza e altezza, e calcola una nuova larghezza o altezza proporzionale per il ridimensionamento.',
            short_answer: 'Questo calcolatore trova i rapporti d\'aspetto, es. 1920×1080 si semplifica in un rapporto 16:9.',
            intro_text: '<p>Inserisci una larghezza e altezza per trovare il rapporto d\'aspetto semplificato (come 16:9), e opzionalmente calcola una nuova larghezza o altezza proporzionale per ridimensionare immagini o video.</p>',
            key_points: [
                '<b>Rapporto semplificato:</b> trovato allo stesso modo del Semplificatore di Rapporti, dividendo entrambe le dimensioni per il loro massimo comune divisore.',
                '<b>Esempio:</b> 1920×1080 si semplifica in 16:9 — il rapporto widescreen standard.',
                '<b>Ridimensionamento:</b> per mantenere un\'immagine proporzionale, nuova altezza = larghezza target × (altezza originale ÷ larghezza originale), e viceversa.',
            ],
            howto: [
                { question: 'Perché la mia immagine ridimensionata sembra allungata se non uso questo?', answer: '<p>Se larghezza e altezza non vengono scalate esattamente dello stesso fattore, l\'immagine si distorce — questo calcolatore assicura che la nuova dimensione mantenga le proporzioni originali.</p>' },
                { question: 'Quali sono i rapporti d\'aspetto comuni?', answer: '<p>16:9 (video widescreen), 4:3 (vecchi TV/monitor), 1:1 (quadrato, social media) e 21:9 (ultra wide) sono tra i più comuni.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.it, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.it, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.it, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.it },
                { name: 'target_value', label: TARGET_VALUE_LABEL.it, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.it },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'seitenverhaeltnis-rechner', title: 'Seitenverhältnis-Rechner', h1: 'Seitenverhältnis-Rechner',
            meta_title: 'Seitenverhältnis-Rechner | Verhältnisse und Proportionale Abmessungen Finden',
            meta_description: 'Finden Sie das vereinfachte Seitenverhältnis für jede Breite und Höhe, und berechnen Sie eine proportionale neue Breite oder Höhe zur Größenänderung.',
            short_answer: 'Dieser Rechner findet Seitenverhältnisse, z.B. vereinfacht sich 1920×1080 zu einem 16:9-Verhältnis.',
            intro_text: '<p>Geben Sie eine Breite und Höhe ein, um das vereinfachte Seitenverhältnis (wie 16:9) zu finden, und berechnen Sie optional eine neue proportionale Breite oder Höhe zum Ändern der Größe von Bildern oder Videos.</p>',
            key_points: [
                '<b>Vereinfachtes Verhältnis:</b> wird genauso gefunden wie im Verhältnis-Vereinfacher, indem beide Abmessungen durch ihren größten gemeinsamen Teiler geteilt werden.',
                '<b>Beispiel:</b> 1920×1080 vereinfacht sich zu 16:9 — dem Standard-Breitbildverhältnis.',
                '<b>Größenänderung:</b> um ein Bild proportional zu halten, ist die neue Höhe = Zielbreite × (Originalhöhe ÷ Originalbreite), und umgekehrt.',
            ],
            howto: [
                { question: 'Warum sieht mein Bild nach der Größenänderung gestreckt aus, wenn ich dies nicht verwende?', answer: '<p>Wenn Breite und Höhe nicht um genau denselben Faktor skaliert werden, verzerrt sich das Bild — dieser Rechner stellt sicher, dass die neue Abmessung die ursprünglichen Proportionen beibehält.</p>' },
                { question: 'Was sind gängige Seitenverhältnisse?', answer: '<p>16:9 (Breitbildvideo), 4:3 (ältere Fernseher/Monitore), 1:1 (quadratisch, soziale Medien) und 21:9 (ultrabreit) gehören zu den häufigsten.</p>' },
            ],
            inputs: [
                { name: 'width', label: WIDTH_LABEL.de, type: 'number', min: 0.01, max: 100000, placeholder: '1920' },
                { name: 'height', label: HEIGHT_LABEL.de, type: 'number', min: 0.01, max: 100000, placeholder: '1080' },
                { name: 'solve_for', label: ASPECT_SOLVE_FOR_LABEL.de, type: 'select', options: ASPECT_SOLVE_FOR_OPTIONS.de },
                { name: 'target_value', label: TARGET_VALUE_LABEL.de, type: 'number', min: 0.01, max: 100000, placeholder: '1280' },
            ],
            outputs: [
                { name: 'simplified_ratio', label: SIMPLIFIED_RATIO_LABEL.de },
                { name: 'computed_dimension', label: COMPUTED_DIMENSION_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1215: Ratio to Percentage Converter
// ============================================================
const PERCENTAGE_A_LABEL: Record<string, string> = {
    en: 'First Share (%)', ru: 'Первая доля (%)', lv: 'Pirmā Daļa (%)', pl: 'Pierwszy Udział (%)',
    es: 'Primera Parte (%)', fr: 'Première Part (%)', it: 'Prima Quota (%)', de: 'Erster Anteil (%)',
}
const PERCENTAGE_B_LABEL: Record<string, string> = {
    en: 'Second Share (%)', ru: 'Вторая доля (%)', lv: 'Otrā Daļa (%)', pl: 'Drugi Udział (%)',
    es: 'Segunda Parte (%)', fr: 'Deuxième Part (%)', it: 'Seconda Quota (%)', de: 'Zweiter Anteil (%)',
}

const ratioToPercentageConverterTool: ToolDef = {
    id: '1215',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'ratio_a', default: 1 }, { key: 'ratio_b', default: 4 }],
        functions: { result: { type: 'function', functionName: 'ratioToPercentageConverter', params: { ratio_a: 'ratio_a', ratio_b: 'ratio_b' } } },
        outputs: [{ key: 'percentage_a', precision: 2 }, { key: 'percentage_b', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'ratio-to-percentage-converter', title: 'Ratio to Percentage Converter', h1: 'Ratio to Percentage Converter',
            meta_title: 'Ratio to Percentage Converter | Convert a Ratio into Percentages',
            meta_description: 'Convert any two-part ratio (like 1:4) into percentages (like 20% and 80%) instantly.',
            short_answer: 'This calculator converts a ratio to percentages, e.g. a 1:4 ratio is 20% and 80%.',
            intro_text: '<p>Enter a two-part ratio to instantly convert it into the percentage each part represents of the whole — useful for understanding splits, mixtures, and allocations expressed as ratios.</p>',
            key_points: [
                '<b>Formula:</b> Percentage of Part A = (A ÷ (A + B)) × 100, and likewise for Part B.',
                '<b>Example:</b> a 1:4 ratio — total parts = 5, so Part A = (1÷5)×100 = 20% and Part B = (4÷5)×100 = 80%.',
                '<b>Always sums to 100%:</b> the two percentages always add up to exactly 100%, since they represent the whole split into two parts.',
            ],
            howto: [
                { question: 'Can I use this for a ratio with more than two parts?', answer: '<p>Not directly — this tool is built for two-part ratios; for a three-part ratio (like 1:2:3), you\'d divide each part by the total sum of all three parts.</p>' },
                { question: 'What\'s a real-world example of this?', answer: '<p>If a recipe calls for a 1:4 ratio of concentrate to water, that means the mixture is 20% concentrate and 80% water by volume.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.en, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'konverter-otnosheniya-v-protsenty', title: 'Конвертер соотношения в проценты', h1: 'Конвертер соотношения в проценты',
            meta_title: 'Конвертер соотношения в проценты | Переведите соотношение в проценты',
            meta_description: 'Мгновенно переведите любое двухчастное соотношение (например, 1:4) в проценты (например, 20% и 80%).',
            short_answer: 'Этот калькулятор переводит соотношение в проценты, например соотношение 1:4 — это 20% и 80%.',
            intro_text: '<p>Введите двухчастное соотношение, чтобы мгновенно перевести его в проценты, которые составляет каждая часть от целого — полезно для понимания разделений, смесей и распределений, выраженных как соотношения.</p>',
            key_points: [
                '<b>Формула:</b> Процент части A = (A ÷ (A + B)) × 100, аналогично для части B.',
                '<b>Пример:</b> соотношение 1:4 — всего частей 5, поэтому часть A = (1÷5)×100 = 20%, часть B = (4÷5)×100 = 80%.',
                '<b>Всегда в сумме 100%:</b> два процента всегда дают в сумме ровно 100%, так как представляют целое, разделённое на две части.',
            ],
            howto: [
                { question: 'Можно ли использовать это для соотношения из трёх и более частей?', answer: '<p>Не напрямую — этот инструмент создан для двухчастных соотношений; для трёхчастного соотношения нужно делить каждую часть на общую сумму всех трёх частей.</p>' },
                { question: 'Какой реальный пример этого?', answer: '<p>Если рецепт требует соотношение концентрата к воде 1:4, это значит, что смесь состоит из 20% концентрата и 80% воды по объёму.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.ru, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'attiecibas-uz-procentiem-konverters', title: 'Attiecības uz Procentiem Konverters', h1: 'Attiecības uz Procentiem Konverters',
            meta_title: 'Attiecības uz Procentiem Konverters | Pārveidojiet Attiecību Procentos',
            meta_description: 'Uzreiz pārveidojiet jebkuru divdaļu attiecību (piemēram, 1:4) procentos (piemēram, 20% un 80%).',
            short_answer: 'Šis kalkulators pārveido attiecību procentos, piemēram, 1:4 attiecība ir 20% un 80%.',
            intro_text: '<p>Ievadiet divdaļu attiecību, lai uzreiz pārveidotu to procentos, ko katra daļa veido no kopuma — noderīgi, lai izprastu sadalījumus, maisījumus un piešķīrumus, kas izteikti kā attiecības.</p>',
            key_points: [
                '<b>Formula:</b> Daļas A Procenti = (A ÷ (A + B)) × 100, un tāpat Daļai B.',
                '<b>Piemērs:</b> attiecība 1:4 — kopā 5 daļas, tāpēc Daļa A = (1÷5)×100 = 20%, Daļa B = (4÷5)×100 = 80%.',
                '<b>Vienmēr summējas līdz 100%:</b> abi procenti vienmēr summējas tieši līdz 100%, jo tie pārstāv veselu, sadalītu divās daļās.',
            ],
            howto: [
                { question: 'Vai varu izmantot to attiecībai ar vairāk nekā divām daļām?', answer: '<p>Ne tieši — šis rīks ir veidots divdaļu attiecībām; trīsdaļu attiecībai katra daļa jādala ar visu trīs daļu kopējo summu.</p>' },
                { question: 'Kāds ir reāls piemērs tam?', answer: '<p>Ja recepte prasa koncentrāta un ūdens attiecību 1:4, tas nozīmē, ka maisījums pēc tilpuma ir 20% koncentrāta un 80% ūdens.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.lv, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'konwerter-proporcji-na-procenty', title: 'Konwerter Proporcji na Procenty', h1: 'Konwerter Proporcji na Procenty',
            meta_title: 'Konwerter Proporcji na Procenty | Przekonwertuj Proporcję na Procenty',
            meta_description: 'Natychmiast przekonwertuj dowolną dwuczęściową proporcję (jak 1:4) na procenty (jak 20% i 80%).',
            short_answer: 'Ten kalkulator konwertuje proporcję na procenty, np. proporcja 1:4 to 20% i 80%.',
            intro_text: '<p>Wpisz dwuczęściową proporcję, aby natychmiast przekonwertować ją na procent, jaki każda część stanowi z całości — przydatne do zrozumienia podziałów, mieszanek i alokacji wyrażonych jako proporcje.</p>',
            key_points: [
                '<b>Wzór:</b> Procent Części A = (A ÷ (A + B)) × 100, analogicznie dla Części B.',
                '<b>Przykład:</b> proporcja 1:4 — łącznie 5 części, więc Część A = (1÷5)×100 = 20%, Część B = (4÷5)×100 = 80%.',
                '<b>Zawsze sumuje się do 100%:</b> oba procenty zawsze sumują się dokładnie do 100%, ponieważ reprezentują całość podzieloną na dwie części.',
            ],
            howto: [
                { question: 'Czy mogę użyć tego dla proporcji z więcej niż dwiema częściami?', answer: '<p>Nie bezpośrednio — to narzędzie jest zbudowane dla proporcji dwuczęściowych; dla proporcji trzyczęściowej należy podzielić każdą część przez całkowitą sumę wszystkich trzech części.</p>' },
                { question: 'Jaki jest przykład z życia?', answer: '<p>Jeśli przepis wymaga proporcji koncentratu do wody 1:4, oznacza to, że mieszanka to 20% koncentratu i 80% wody objętościowo.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.pl, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'convertidor-de-proporcion-a-porcentaje', title: 'Convertidor de Proporción a Porcentaje', h1: 'Convertidor de Proporción a Porcentaje',
            meta_title: 'Convertidor de Proporción a Porcentaje | Convierte una Proporción en Porcentajes',
            meta_description: 'Convierte instantáneamente cualquier proporción de dos partes (como 1:4) en porcentajes (como 20% y 80%).',
            short_answer: 'Esta calculadora convierte una proporción en porcentajes, p. ej. una proporción 1:4 es 20% y 80%.',
            intro_text: '<p>Introduce una proporción de dos partes para convertirla al instante en el porcentaje que cada parte representa del total — útil para entender divisiones, mezclas y asignaciones expresadas como proporciones.</p>',
            key_points: [
                '<b>Fórmula:</b> Porcentaje de la Parte A = (A ÷ (A + B)) × 100, e igualmente para la Parte B.',
                '<b>Ejemplo:</b> una proporción 1:4 — total de partes = 5, así que Parte A = (1÷5)×100 = 20% y Parte B = (4÷5)×100 = 80%.',
                '<b>Siempre suma 100%:</b> los dos porcentajes siempre suman exactamente 100%, ya que representan el total dividido en dos partes.',
            ],
            howto: [
                { question: '¿Puedo usar esto para una proporción con más de dos partes?', answer: '<p>No directamente — esta herramienta está diseñada para proporciones de dos partes; para una proporción de tres partes, dividirías cada parte por la suma total de las tres.</p>' },
                { question: '¿Cuál es un ejemplo real de esto?', answer: '<p>Si una receta requiere una proporción de concentrado a agua de 1:4, significa que la mezcla es 20% concentrado y 80% agua en volumen.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.es, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'convertisseur-de-ratio-en-pourcentage', title: 'Convertisseur de Ratio en Pourcentage', h1: 'Convertisseur de Ratio en Pourcentage',
            meta_title: 'Convertisseur de Ratio en Pourcentage | Convertissez un Ratio en Pourcentages',
            meta_description: 'Convertissez instantanément n\'importe quel ratio à deux parties (comme 1:4) en pourcentages (comme 20% et 80%).',
            short_answer: 'Ce calculateur convertit un ratio en pourcentages, ex. un ratio de 1:4 est 20% et 80%.',
            intro_text: '<p>Entrez un ratio à deux parties pour le convertir instantanément en pourcentage que chaque partie représente du total — utile pour comprendre les répartitions, mélanges et allocations exprimés en ratios.</p>',
            key_points: [
                '<b>Formule :</b> Pourcentage de la Partie A = (A ÷ (A + B)) × 100, et de même pour la Partie B.',
                '<b>Exemple :</b> un ratio de 1:4 — total des parties = 5, donc Partie A = (1÷5)×100 = 20% et Partie B = (4÷5)×100 = 80%.',
                '<b>Somme toujours à 100% :</b> les deux pourcentages s\'additionnent toujours pour donner exactement 100%, puisqu\'ils représentent le tout divisé en deux parties.',
            ],
            howto: [
                { question: 'Puis-je utiliser cela pour un ratio à plus de deux parties ?', answer: '<p>Pas directement — cet outil est conçu pour les ratios à deux parties ; pour un ratio à trois parties, vous diviseriez chaque partie par la somme totale des trois parties.</p>' },
                { question: 'Quel est un exemple concret de cela ?', answer: '<p>Si une recette demande un ratio concentré/eau de 1:4, cela signifie que le mélange est composé de 20% de concentré et 80% d\'eau en volume.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.fr, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'convertitore-da-rapporto-a-percentuale', title: 'Convertitore da Rapporto a Percentuale', h1: 'Convertitore da Rapporto a Percentuale',
            meta_title: 'Convertitore da Rapporto a Percentuale | Converti un Rapporto in Percentuali',
            meta_description: 'Converti istantaneamente qualsiasi rapporto a due parti (come 1:4) in percentuali (come 20% e 80%).',
            short_answer: 'Questo calcolatore converte un rapporto in percentuali, es. un rapporto 1:4 è 20% e 80%.',
            intro_text: '<p>Inserisci un rapporto a due parti per convertirlo istantaneamente nella percentuale che ciascuna parte rappresenta del totale — utile per comprendere divisioni, miscele e allocazioni espresse come rapporti.</p>',
            key_points: [
                '<b>Formula:</b> Percentuale della Parte A = (A ÷ (A + B)) × 100, e analogamente per la Parte B.',
                '<b>Esempio:</b> un rapporto 1:4 — totale parti = 5, quindi Parte A = (1÷5)×100 = 20% e Parte B = (4÷5)×100 = 80%.',
                '<b>Somma sempre 100%:</b> le due percentuali sommano sempre esattamente 100%, poiché rappresentano il tutto diviso in due parti.',
            ],
            howto: [
                { question: 'Posso usarlo per un rapporto con più di due parti?', answer: '<p>Non direttamente — questo strumento è costruito per rapporti a due parti; per un rapporto a tre parti, divideresti ogni parte per la somma totale di tutte e tre.</p>' },
                { question: 'Qual è un esempio reale di questo?', answer: '<p>Se una ricetta richiede un rapporto concentrato/acqua di 1:4, significa che la miscela è 20% concentrato e 80% acqua in volume.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.it, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'verhaeltnis-zu-prozent-konverter', title: 'Verhältnis-zu-Prozent-Konverter', h1: 'Verhältnis-zu-Prozent-Konverter',
            meta_title: 'Verhältnis-zu-Prozent-Konverter | Wandeln Sie ein Verhältnis in Prozentsätze Um',
            meta_description: 'Wandeln Sie jedes zweiteilige Verhältnis (wie 1:4) sofort in Prozentsätze (wie 20% und 80%) um.',
            short_answer: 'Dieser Rechner wandelt ein Verhältnis in Prozentsätze um, z.B. ist ein Verhältnis von 1:4 gleich 20% und 80%.',
            intro_text: '<p>Geben Sie ein zweiteiliges Verhältnis ein, um es sofort in den Prozentsatz umzuwandeln, den jeder Teil vom Ganzen darstellt — nützlich zum Verständnis von Aufteilungen, Mischungen und Zuweisungen, die als Verhältnisse ausgedrückt werden.</p>',
            key_points: [
                '<b>Formel:</b> Prozentsatz von Teil A = (A ÷ (A + B)) × 100, und entsprechend für Teil B.',
                '<b>Beispiel:</b> ein Verhältnis von 1:4 — Gesamtteile = 5, also Teil A = (1÷5)×100 = 20% und Teil B = (4÷5)×100 = 80%.',
                '<b>Summiert sich immer auf 100%:</b> die beiden Prozentsätze ergeben immer genau 100%, da sie das Ganze darstellen, das in zwei Teile geteilt ist.',
            ],
            howto: [
                { question: 'Kann ich das für ein Verhältnis mit mehr als zwei Teilen verwenden?', answer: '<p>Nicht direkt — dieses Tool ist für zweiteilige Verhältnisse konzipiert; für ein dreiteiliges Verhältnis würden Sie jeden Teil durch die Gesamtsumme aller drei Teile teilen.</p>' },
                { question: 'Was ist ein Beispiel aus der Praxis dafür?', answer: '<p>Wenn ein Rezept ein Verhältnis von Konzentrat zu Wasser von 1:4 verlangt, bedeutet das, dass die Mischung volumenmäßig 20% Konzentrat und 80% Wasser ist.</p>' },
            ],
            inputs: [
                { name: 'ratio_a', label: RATIO_A_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '1' },
                { name: 'ratio_b', label: RATIO_B_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'percentage_a', label: PERCENTAGE_A_LABEL.de, precision: 2 },
                { name: 'percentage_b', label: PERCENTAGE_B_LABEL.de, precision: 2 },
            ],
        },
    },
}

export const tools: ToolDef[] = [
    percentageCalculatorTool, percentChangeCalculatorTool, percentIncreaseCalculatorTool, percentDecreaseCalculatorTool,
    reversePercentageCalculatorTool, tipCalculatorTool, salesTaxCalculatorTool, discountCalculatorTool,
    ratioSimplifierTool, proportionCalculatorTool, aspectRatioCalculatorTool, ratioToPercentageConverterTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: PERCENT_RATIO_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: PERCENT_RATIO_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} percent & ratio calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
