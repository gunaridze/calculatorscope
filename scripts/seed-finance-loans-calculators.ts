// One-off script: seeds 10 new Loans & Debt calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-finance-loans-calculators.ts
//
// Tool IDs 1013-1022, category_id '24' (Loans & Debt, under Finance). All formulas
// are pure mathjs expressions via the shared JSON engine (core/engines/json.ts).
// Every formula was verified against known reference figures before writing this
// file (e.g. $300,000 / 6% / 30yr amortization -> $1798.65/month) — see session
// notes; a body-fat formula unit bug earlier taught us to verify first, not after.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LOANS_DEBT_CATEGORY_ID = '24'

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
}

type OutputField = {
    name: string
    label: string
    unit?: string
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
        formulas: Record<string, string>
        outputs: Array<{ key: string; precision?: number }>
    }
    locales: Record<string, LocaleContent>
}

// Shared amortization sub-expression builder (kept as plain strings here since
// config_json is stored as-is; verified numerically in the session before use).
const R = '(annual_rate/100/12)'
const N = '(years*12)'
const PMT = `(principal*${R}*(1+${R})^${N} / ((1+${R})^${N} - 1))`

// ============================================================
// 1013: Loan Payment Calculator (Amortization)
// ============================================================
const loanPayment: ToolDef = {
    id: '1013',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 10000 },
            { key: 'annual_rate', default: 8 },
            { key: 'years', default: 5 },
        ],
        formulas: {
            monthly_payment: PMT,
            total_paid: `${PMT}*${N}`,
            total_interest: `${PMT}*${N} - principal`,
        },
        outputs: [
            { key: 'monthly_payment', precision: 2 },
            { key: 'total_paid', precision: 2 },
            { key: 'total_interest', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'loan-payment-calculator-amortization',
            title: 'Loan Payment Calculator - Monthly Amortization',
            h1: 'Loan Payment Calculator',
            meta_title: 'Loan Payment Calculator | Monthly Payment & Total Interest',
            meta_description: 'Calculate your monthly loan payment, total amount paid, and total interest using the standard amortization formula, based on principal, rate, and term.',
            short_answer: 'This calculator computes your fixed monthly loan payment using the standard amortization formula, along with the total amount you\'ll pay and the total interest over the life of the loan.',
            intro_text: '<p>Amortization is the process of paying off a loan through fixed monthly payments, where each payment covers both interest and a portion of the principal — early payments are mostly interest, later payments are mostly principal. This calculator applies the standard amortization formula used by banks and lenders worldwide to compute your exact monthly payment.</p><p><b>Borrowers</b> use this before taking out a personal loan, auto loan, or any fixed-term debt to understand the true monthly commitment and total cost, since the total interest paid can add up to a substantial fraction of the loan amount, especially over longer terms.</p>',
            key_points: [
                '<b>Standard Amortization Formula:</b> The same math used by banks: PMT = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Fixed Monthly Payment:</b> Assumes a fixed interest rate and equal monthly payments for the entire term — the most common loan structure.',
                '<b>Total Interest Matters:</b> Shorter terms mean higher monthly payments but significantly less total interest paid over the life of the loan.',
            ],
            howto: [
                { question: 'Why is my total interest so much higher on a longer loan term?', answer: '<p>Interest accrues on the outstanding balance every month; a longer term means the balance stays higher for longer, so more total interest accumulates even though each individual payment is smaller.</p>' },
                { question: 'Does this work for any type of loan?', answer: '<p>Yes — this formula applies to any fixed-rate, fixed-term loan with equal monthly payments: personal loans, auto loans, student loans, and mortgages alike.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Loan Amount', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Loan Term', type: 'number', unit: 'years', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Monthly Payment', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Total Amount Paid', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Total Interest', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-platezha-po-kreditu-amortizaciya',
            title: 'Калькулятор платежа по кредиту - Амортизация',
            h1: 'Калькулятор платежа по кредиту',
            meta_title: 'Калькулятор платежа по кредиту | Ежемесячный платёж и проценты',
            meta_description: 'Рассчитайте ежемесячный платёж по кредиту, общую сумму выплат и переплату по стандартной формуле амортизации.',
            short_answer: 'Этот калькулятор вычисляет фиксированный ежемесячный платёж по кредиту по стандартной формуле амортизации, а также общую сумму выплат и переплату по процентам за весь срок.',
            intro_text: '<p>Амортизация — это процесс погашения кредита фиксированными ежемесячными платежами, где каждый платёж покрывает и проценты, и часть основного долга — в начале платежи в основном идут на проценты, ближе к концу — на основной долг. Калькулятор применяет стандартную формулу амортизации, используемую банками по всему миру.</p><p><b>Заёмщики</b> используют это перед оформлением потребительского кредита, автокредита или любого срочного долга, чтобы понять реальную ежемесячную нагрузку и итоговую стоимость, так как переплата по процентам может составлять значительную долю от суммы кредита, особенно на длинных сроках.</p>',
            key_points: [
                '<b>Стандартная формула амортизации:</b> Та же математика, что используют банки: платёж = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Фиксированный ежемесячный платёж:</b> Предполагает фиксированную ставку и равные платежи на весь срок — самая распространённая структура кредита.',
                '<b>Переплата важна:</b> Короткий срок означает больший платёж, но значительно меньшую переплату за весь срок кредита.',
            ],
            howto: [
                { question: 'Почему переплата намного выше при длинном сроке кредита?', answer: '<p>Проценты начисляются на остаток долга каждый месяц; при длинном сроке остаток дольше остаётся высоким, поэтому переплата накапливается больше, даже если каждый отдельный платёж меньше.</p>' },
                { question: 'Подходит ли это для любого типа кредита?', answer: '<p>Да — эта формула применима к любому кредиту с фиксированной ставкой и равными ежемесячными платежами: потребительским, автокредитам, ипотеке.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Сумма кредита', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Срок кредита', type: 'number', unit: 'лет', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Ежемесячный платёж', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Общая сумма выплат', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Переплата по процентам', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'aizdevuma-maksajuma-kalkulators-amortizacija',
            title: 'Aizdevuma Maksājuma Kalkulators - Amortizācija',
            h1: 'Aizdevuma Maksājuma Kalkulators',
            meta_title: 'Aizdevuma Maksājuma Kalkulators | Ikmēneša Maksājums un Procenti',
            meta_description: 'Aprēķiniet ikmēneša aizdevuma maksājumu, kopējo samaksāto summu un procentu pārmaksu, izmantojot standarta amortizācijas formulu.',
            short_answer: 'Šis kalkulators aprēķina jūsu fiksēto ikmēneša aizdevuma maksājumu, izmantojot standarta amortizācijas formulu, kā arī kopējo samaksāto summu un procentu pārmaksu visā aizdevuma darbības laikā.',
            intro_text: '<p>Amortizācija ir aizdevuma dzēšanas process ar fiksētiem ikmēneša maksājumiem, kur katrs maksājums sedz gan procentus, gan daļu no pamatsummas — sākumā maksājumi galvenokārt sedz procentus, vēlāk — pamatsummu. Kalkulators izmanto standarta amortizācijas formulu, ko izmanto bankas visā pasaulē.</p><p><b>Aizņēmēji</b> to izmanto pirms patēriņa kredīta, auto kredīta vai jebkura cita termiņnoguldījuma parāda noformēšanas, lai saprastu reālo ikmēneša slogu un kopējās izmaksas, jo procentu pārmaksa var veidot ievērojamu daļu no aizdevuma summas, īpaši ilgākos termiņos.</p>',
            key_points: [
                '<b>Standarta amortizācijas formula:</b> Tā pati matemātika, ko izmanto bankas: maksājums = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Fiksēts ikmēneša maksājums:</b> Pieņem fiksētu procentu likmi un vienādus maksājumus visā termiņā — visizplatītākā aizdevuma struktūra.',
                '<b>Pārmaksai ir nozīme:</b> Īsāks termiņš nozīmē lielāku ikmēneša maksājumu, bet ievērojami mazāku kopējo pārmaksu.',
            ],
            howto: [
                { question: 'Kāpēc pārmaksa ir tik daudz lielāka ilgākā aizdevuma termiņā?', answer: '<p>Procenti tiek aprēķināti no atlikušās summas katru mēnesi; ilgākā termiņā atlikums ilgāk paliek augsts, tāpēc uzkrājas lielāka pārmaksa, pat ja katrs atsevišķais maksājums ir mazāks.</p>' },
                { question: 'Vai tas der jebkuram aizdevuma veidam?', answer: '<p>Jā — šī formula attiecas uz jebkuru aizdevumu ar fiksētu likmi un vienādiem ikmēneša maksājumiem: patēriņa kredītiem, auto kredītiem, hipotēkām.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Aizdevuma Summa', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Aizdevuma Termiņš', type: 'number', unit: 'gadi', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Ikmēneša Maksājums', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Kopējā Samaksātā Summa', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Procentu Pārmaksa', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-raty-kredytu-amortyzacja',
            title: 'Kalkulator Raty Kredytu - Amortyzacja',
            h1: 'Kalkulator Raty Kredytu',
            meta_title: 'Kalkulator Raty Kredytu | Miesięczna Rata i Odsetki',
            meta_description: 'Oblicz miesięczną ratę kredytu, całkowitą spłaconą kwotę i sumę odsetek za pomocą standardowej formuły amortyzacji.',
            short_answer: 'Ten kalkulator oblicza stałą miesięczną ratę kredytu za pomocą standardowej formuły amortyzacji, a także całkowitą spłaconą kwotę i sumę odsetek przez cały okres kredytowania.',
            intro_text: '<p>Amortyzacja to proces spłaty kredytu poprzez stałe miesięczne raty, gdzie każda rata pokrywa zarówno odsetki, jak i część kapitału — na początku raty są głównie odsetkowe, później głównie kapitałowe. Kalkulator wykorzystuje standardową formułę amortyzacji stosowaną przez banki na całym świecie.</p><p><b>Kredytobiorcy</b> używają tego przed zaciągnięciem kredytu gotówkowego, samochodowego lub innego długu o stałym terminie, aby zrozumieć rzeczywiste miesięczne obciążenie i całkowity koszt, ponieważ suma odsetek może stanowić znaczną część kwoty kredytu, zwłaszcza przy dłuższych okresach.</p>',
            key_points: [
                '<b>Standardowa formuła amortyzacji:</b> Ta sama matematyka, którą stosują banki: rata = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Stała miesięczna rata:</b> Zakłada stałą stopę procentową i równe raty przez cały okres — najpopularniejsza struktura kredytu.',
                '<b>Suma odsetek ma znaczenie:</b> Krótszy okres oznacza wyższą ratę, ale znacznie niższą sumę odsetek przez cały okres kredytowania.',
            ],
            howto: [
                { question: 'Dlaczego suma odsetek jest dużo wyższa przy dłuższym okresie kredytu?', answer: '<p>Odsetki naliczane są od pozostałego salda co miesiąc; przy dłuższym okresie saldo dłużej pozostaje wysokie, więc suma odsetek rośnie, mimo że każda pojedyncza rata jest mniejsza.</p>' },
                { question: 'Czy to działa dla każdego rodzaju kredytu?', answer: '<p>Tak — ta formuła dotyczy każdego kredytu o stałej stopie i równych ratach miesięcznych: gotówkowego, samochodowego, hipotecznego.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Kredytu', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Okres Kredytowania', type: 'number', unit: 'lat', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Rata Miesięczna', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Całkowita Spłacona Kwota', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Suma Odsetek', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-cuota-prestamo-amortizacion',
            title: 'Calculadora de Cuota de Préstamo - Amortización',
            h1: 'Calculadora de Cuota de Préstamo',
            meta_title: 'Calculadora de Cuota de Préstamo | Pago Mensual e Intereses',
            meta_description: 'Calcula tu cuota mensual de préstamo, el monto total pagado y el interés total usando la fórmula estándar de amortización.',
            short_answer: 'Esta calculadora calcula tu cuota mensual fija de préstamo usando la fórmula estándar de amortización, junto con el monto total que pagarás y el interés total durante la vida del préstamo.',
            intro_text: '<p>La amortización es el proceso de pagar un préstamo mediante cuotas mensuales fijas, donde cada cuota cubre tanto intereses como una parte del capital —las primeras cuotas son mayormente intereses, las últimas son mayormente capital. Esta calculadora aplica la fórmula estándar de amortización usada por bancos y prestamistas en todo el mundo.</p><p><b>Los prestatarios</b> usan esto antes de solicitar un préstamo personal, de auto o cualquier deuda a plazo fijo para entender el compromiso mensual real y el costo total, ya que el interés total puede sumar una fracción sustancial del monto del préstamo, especialmente en plazos más largos.</p>',
            key_points: [
                '<b>Fórmula estándar de amortización:</b> La misma matemática que usan los bancos: cuota = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Cuota mensual fija:</b> Asume una tasa de interés fija y cuotas mensuales iguales durante todo el plazo — la estructura de préstamo más común.',
                '<b>El interés total importa:</b> Plazos más cortos significan cuotas mensuales más altas pero un interés total significativamente menor durante la vida del préstamo.',
            ],
            howto: [
                { question: '¿Por qué mi interés total es mucho mayor en un plazo más largo?', answer: '<p>Los intereses se acumulan sobre el saldo pendiente cada mes; un plazo más largo significa que el saldo permanece alto por más tiempo, así que se acumula más interés total aunque cada cuota individual sea menor.</p>' },
                { question: '¿Funciona esto para cualquier tipo de préstamo?', answer: '<p>Sí — esta fórmula aplica a cualquier préstamo de tasa fija y plazo fijo con cuotas mensuales iguales: préstamos personales, de auto, estudiantiles e hipotecas.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto del Préstamo', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Plazo del Préstamo', type: 'number', unit: 'años', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Cuota Mensual', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Monto Total Pagado', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Interés Total', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-mensualite-pret-amortissement',
            title: 'Calculateur de Mensualité de Prêt - Amortissement',
            h1: 'Calculateur de Mensualité de Prêt',
            meta_title: 'Calculateur de Mensualité | Paiement Mensuel et Intérêts',
            meta_description: 'Calculez votre mensualité de prêt, le montant total payé et les intérêts totaux avec la formule standard d’amortissement.',
            short_answer: 'Ce calculateur détermine votre mensualité fixe de prêt avec la formule standard d’amortissement, ainsi que le montant total que vous paierez et les intérêts totaux sur la durée du prêt.',
            intro_text: '<p>L’amortissement est le processus de remboursement d’un prêt par mensualités fixes, où chaque paiement couvre à la fois des intérêts et une part du capital — les premiers paiements sont surtout des intérêts, les derniers surtout du capital. Ce calculateur applique la formule standard d’amortissement utilisée par les banques du monde entier.</p><p><b>Les emprunteurs</b> l’utilisent avant de contracter un prêt personnel, automobile ou toute autre dette à terme fixe pour comprendre l’engagement mensuel réel et le coût total, car les intérêts totaux peuvent représenter une part substantielle du montant emprunté, surtout sur de longues durées.</p>',
            key_points: [
                '<b>Formule standard d’amortissement :</b> Les mêmes mathématiques utilisées par les banques : mensualité = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Mensualité fixe :</b> Suppose un taux d’intérêt fixe et des mensualités égales pendant toute la durée — la structure de prêt la plus courante.',
                '<b>Les intérêts totaux comptent :</b> Une durée plus courte signifie des mensualités plus élevées mais des intérêts totaux nettement moindres sur la durée du prêt.',
            ],
            howto: [
                { question: 'Pourquoi mes intérêts totaux sont-ils bien plus élevés sur une durée plus longue ?', answer: '<p>Les intérêts s’accumulent sur le solde restant chaque mois ; une durée plus longue signifie que le solde reste élevé plus longtemps, donc plus d’intérêts totaux s’accumulent même si chaque mensualité est plus faible.</p>' },
                { question: 'Cela fonctionne-t-il pour tout type de prêt ?', answer: '<p>Oui — cette formule s’applique à tout prêt à taux fixe et durée fixe avec mensualités égales : prêts personnels, automobiles, étudiants et hypothèques.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant du Prêt', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Durée du Prêt', type: 'number', unit: 'ans', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Mensualité', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Montant Total Payé', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Intérêts Totaux', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-rata-prestito-ammortamento',
            title: 'Calcolatore Rata Prestito - Ammortamento',
            h1: 'Calcolatore Rata Prestito',
            meta_title: 'Calcolatore Rata Prestito | Pagamento Mensile e Interessi',
            meta_description: 'Calcola la tua rata mensile del prestito, l’importo totale pagato e gli interessi totali con la formula standard di ammortamento.',
            short_answer: 'Questo calcolatore determina la tua rata mensile fissa del prestito con la formula standard di ammortamento, insieme all’importo totale che pagherai e agli interessi totali sulla durata del prestito.',
            intro_text: '<p>L’ammortamento è il processo di rimborso di un prestito tramite rate mensili fisse, dove ogni rata copre sia interessi che una parte del capitale — le prime rate sono principalmente interessi, le ultime principalmente capitale. Questo calcolatore applica la formula standard di ammortamento usata dalle banche in tutto il mondo.</p><p><b>I mutuatari</b> lo usano prima di richiedere un prestito personale, auto o qualsiasi debito a termine fisso per capire l’impegno mensile reale e il costo totale, poiché gli interessi totali possono rappresentare una parte sostanziale dell’importo del prestito, specialmente su termini più lunghi.</p>',
            key_points: [
                '<b>Formula standard di ammortamento:</b> La stessa matematica usata dalle banche: rata = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Rata mensile fissa:</b> Presuppone un tasso di interesse fisso e rate mensili uguali per tutta la durata — la struttura di prestito più comune.',
                '<b>Gli interessi totali contano:</b> Termini più brevi significano rate mensili più alte ma interessi totali significativamente inferiori sulla durata del prestito.',
            ],
            howto: [
                { question: 'Perché i miei interessi totali sono molto più alti con un termine più lungo?', answer: '<p>Gli interessi maturano sul saldo residuo ogni mese; un termine più lungo significa che il saldo rimane alto più a lungo, quindi si accumulano più interessi totali anche se ogni singola rata è più piccola.</p>' },
                { question: 'Funziona per qualsiasi tipo di prestito?', answer: '<p>Sì — questa formula si applica a qualsiasi prestito a tasso fisso e durata fissa con rate mensili uguali: prestiti personali, auto, studenteschi e mutui.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo del Prestito', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Durata del Prestito', type: 'number', unit: 'anni', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Rata Mensile', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Importo Totale Pagato', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Interessi Totali', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'kreditraten-rechner-tilgung',
            title: 'Kreditraten-Rechner - Tilgungsplan',
            h1: 'Kreditraten-Rechner',
            meta_title: 'Kreditraten-Rechner | Monatliche Rate und Zinsen',
            meta_description: 'Berechnen Sie Ihre monatliche Kreditrate, den insgesamt gezahlten Betrag und die Gesamtzinsen mit der Standard-Tilgungsformel.',
            short_answer: 'Dieser Rechner berechnet Ihre feste monatliche Kreditrate mit der Standard-Tilgungsformel, zusammen mit dem Gesamtbetrag, den Sie zahlen werden, und den Gesamtzinsen über die Laufzeit des Kredits.',
            intro_text: '<p>Tilgung ist der Prozess der Rückzahlung eines Kredits durch feste monatliche Raten, wobei jede Zahlung sowohl Zinsen als auch einen Teil der Tilgung abdeckt — frühe Zahlungen sind größtenteils Zinsen, spätere größtenteils Tilgung. Dieser Rechner verwendet die von Banken weltweit genutzte Standard-Tilgungsformel.</p><p><b>Kreditnehmer</b> nutzen dies vor Aufnahme eines Privatkredits, Autokredits oder einer anderen befristeten Schuld, um die tatsächliche monatliche Belastung und die Gesamtkosten zu verstehen, da die Gesamtzinsen einen erheblichen Teil des Kreditbetrags ausmachen können, besonders bei längeren Laufzeiten.</p>',
            key_points: [
                '<b>Standard-Tilgungsformel:</b> Dieselbe Mathematik, die Banken verwenden: Rate = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1).',
                '<b>Feste monatliche Rate:</b> Setzt einen festen Zinssatz und gleiche monatliche Raten für die gesamte Laufzeit voraus — die häufigste Kreditstruktur.',
                '<b>Gesamtzinsen zählen:</b> Kürzere Laufzeiten bedeuten höhere monatliche Raten, aber deutlich weniger Gesamtzinsen über die Laufzeit des Kredits.',
            ],
            howto: [
                { question: 'Warum sind meine Gesamtzinsen bei längerer Laufzeit so viel höher?', answer: '<p>Zinsen fallen jeden Monat auf den ausstehenden Saldo an; eine längere Laufzeit bedeutet, dass der Saldo länger hoch bleibt, sodass sich mehr Gesamtzinsen ansammeln, auch wenn jede einzelne Rate kleiner ist.</p>' },
                { question: 'Funktioniert das für jede Kreditart?', answer: '<p>Ja — diese Formel gilt für jeden Kredit mit festem Zinssatz und fester Laufzeit mit gleichen monatlichen Raten: Privatkredite, Autokredite, Studienkredite und Hypotheken.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kreditbetrag', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0.1, max: 40, placeholder: '8' },
                { name: 'years', label: 'Kreditlaufzeit', type: 'number', unit: 'Jahre', min: 1, max: 40, placeholder: '5' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Monatliche Rate', unit: '$', precision: 2 },
                { name: 'total_paid', label: 'Gesamt Gezahlter Betrag', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Gesamtzinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1014: Mortgage Payment Calculator
// ============================================================
const mortgagePmtR = '(annual_rate/100/12)'
const mortgagePmtN = '(years*12)'
const mortgageLoanAmount = '(home_price - down_payment)'
const mortgagePMT = `(${mortgageLoanAmount}*${mortgagePmtR}*(1+${mortgagePmtR})^${mortgagePmtN} / ((1+${mortgagePmtR})^${mortgagePmtN} - 1))`

const mortgage: ToolDef = {
    id: '1014',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'home_price', default: 300000 },
            { key: 'down_payment', default: 60000 },
            { key: 'annual_rate', default: 6 },
            { key: 'years', default: 30 },
        ],
        formulas: {
            loan_amount: mortgageLoanAmount,
            monthly_payment: mortgagePMT,
            total_interest: `${mortgagePMT}*${mortgagePmtN} - ${mortgageLoanAmount}`,
        },
        outputs: [
            { key: 'loan_amount', precision: 2 },
            { key: 'monthly_payment', precision: 2 },
            { key: 'total_interest', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'mortgage-payment-calculator',
            title: 'Mortgage Payment Calculator - With Down Payment',
            h1: 'Mortgage Payment Calculator',
            meta_title: 'Mortgage Payment Calculator | Monthly Payment & Total Interest',
            meta_description: 'Calculate your monthly mortgage payment based on home price, down payment, interest rate, and loan term, plus total interest over the life of the loan.',
            short_answer: 'This calculator estimates your monthly mortgage payment based on the home price, your down payment, interest rate, and loan term, along with the total interest you\'ll pay over the life of the loan.',
            intro_text: '<p>A mortgage payment is calculated using the same amortization math as any other installment loan, but starts from the loan amount remaining after your down payment — the larger your down payment, the smaller your loan amount, monthly payment, and total interest.</p><p><b>Homebuyers</b> use this to compare "what if" scenarios before shopping for a home: a bigger down payment, a shorter term, or a different rate can each meaningfully change the monthly payment and total cost of homeownership over 15-30 years.</p>',
            key_points: [
                '<b>Down Payment Reduces Everything:</b> A larger down payment lowers the loan amount, monthly payment, and total interest paid — all three at once.',
                '<b>Standard 30-Year vs 15-Year:</b> A 15-year term has a higher monthly payment but dramatically less total interest than a 30-year term at the same rate.',
                '<b>Excludes Taxes & Insurance:</b> This shows principal-and-interest only; your actual monthly housing cost will also include property tax and homeowners insurance.',
            ],
            howto: [
                { question: 'Does this include property taxes and insurance?', answer: '<p>No — this calculates principal and interest (P&I) only, the core loan payment. Your total monthly housing payment will typically be higher once taxes and insurance are added.</p>' },
                { question: 'How much does a bigger down payment really save?', answer: '<p>Beyond reducing the loan amount directly, a bigger down payment reduces the base on which interest compounds every month, so the total interest savings are often larger than the down payment increase itself over a 30-year term.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Home Price', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Down Payment', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Loan Term', type: 'number', unit: 'years', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Loan Amount', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Monthly Payment (P&I)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Total Interest', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-ipotechnogo-platezha',
            title: 'Калькулятор ипотечного платежа - с первоначальным взносом',
            h1: 'Калькулятор ипотечного платежа',
            meta_title: 'Калькулятор ипотеки | Ежемесячный платёж и переплата',
            meta_description: 'Рассчитайте ежемесячный ипотечный платёж на основе цены жилья, первоначального взноса, ставки и срока, а также общую переплату по процентам.',
            short_answer: 'Этот калькулятор оценивает ежемесячный ипотечный платёж на основе цены жилья, первоначального взноса, процентной ставки и срока кредита, а также общую переплату за весь срок.',
            intro_text: '<p>Ипотечный платёж рассчитывается по той же математике амортизации, что и любой другой рассрочный кредит, но начинается с суммы кредита, оставшейся после первоначального взноса — чем больше взнос, тем меньше сумма кредита, платёж и переплата.</p><p><b>Покупатели жилья</b> используют это, чтобы сравнить сценарии перед покупкой: больший первоначальный взнос, более короткий срок или другая ставка могут существенно изменить ежемесячный платёж и общую стоимость владения жильём за 15-30 лет.</p>',
            key_points: [
                '<b>Взнос снижает всё:</b> Больший первоначальный взнос снижает сумму кредита, ежемесячный платёж и переплату — сразу по всем трём параметрам.',
                '<b>30 лет против 15 лет:</b> Срок 15 лет означает больший ежемесячный платёж, но значительно меньшую переплату по сравнению с 30 годами при той же ставке.',
                '<b>Без налогов и страховки:</b> Здесь показан только основной долг и проценты; реальный ежемесячный платёж за жильё будет включать налог на имущество и страховку.',
            ],
            howto: [
                { question: 'Включает ли это налоги на недвижимость и страховку?', answer: '<p>Нет — здесь рассчитывается только основной долг и проценты (P&I), базовый платёж по кредиту. Реальный ежемесячный платёж за жильё обычно выше с учётом налогов и страховки.</p>' },
                { question: 'Насколько реально экономит больший первоначальный взнос?', answer: '<p>Помимо прямого снижения суммы кредита, больший взнос уменьшает базу, на которую начисляются проценты каждый месяц, поэтому итоговая экономия на процентах за 30 лет часто больше самого увеличения взноса.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Цена жилья', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Первоначальный взнос', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Срок кредита', type: 'number', unit: 'лет', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Сумма кредита', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Ежемесячный платёж (осн.долг+%)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Переплата по процентам', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'hipotekas-maksajuma-kalkulators',
            title: 'Hipotēkas Maksājuma Kalkulators - Ar Sākotnējo Iemaksu',
            h1: 'Hipotēkas Maksājuma Kalkulators',
            meta_title: 'Hipotēkas Kalkulators | Ikmēneša Maksājums un Procenti',
            meta_description: 'Aprēķiniet ikmēneša hipotēkas maksājumu, balstoties uz mājas cenu, sākotnējo iemaksu, likmi un termiņu, kā arī kopējo procentu pārmaksu.',
            short_answer: 'Šis kalkulators novērtē jūsu ikmēneša hipotēkas maksājumu, balstoties uz mājas cenu, sākotnējo iemaksu, procentu likmi un aizdevuma termiņu, kā arī kopējos procentus, ko samaksāsiet visā termiņā.',
            intro_text: '<p>Hipotēkas maksājums tiek aprēķināts, izmantojot to pašu amortizācijas matemātiku, kas jebkuram citam aizdevumam, bet sākas no aizdevuma summas, kas paliek pēc sākotnējās iemaksas — jo lielāka iemaksa, jo mazāka aizdevuma summa, maksājums un pārmaksa.</p><p><b>Māju pircēji</b> to izmanto, lai salīdzinātu scenārijus pirms mājas iegādes: lielāka iemaksa, īsāks termiņš vai cita likme var būtiski mainīt ikmēneša maksājumu un kopējās mājokļa īpašumtiesību izmaksas 15-30 gadu laikā.</p>',
            key_points: [
                '<b>Iemaksa samazina visu:</b> Lielāka sākotnējā iemaksa samazina aizdevuma summu, ikmēneša maksājumu un pārmaksu — visus trīs vienlaikus.',
                '<b>30 gadi pret 15 gadiem:</b> 15 gadu termiņš nozīmē lielāku ikmēneša maksājumu, bet ievērojami mazāku pārmaksu nekā 30 gadu termiņš pie tās pašas likmes.',
                '<b>Neietver nodokļus un apdrošināšanu:</b> Šeit rādīts tikai pamatsummas un procentu maksājums; reālās ikmēneša mājokļa izmaksas ietvers arī nekustamā īpašuma nodokli un apdrošināšanu.',
            ],
            howto: [
                { question: 'Vai tas ietver nekustamā īpašuma nodokļus un apdrošināšanu?', answer: '<p>Nē — šeit aprēķināts tikai pamatsummas un procentu maksājums, aizdevuma pamata daļa. Reālais ikmēneša mājokļa maksājums parasti būs augstāks, pieskaitot nodokļus un apdrošināšanu.</p>' },
                { question: 'Cik daudz reāli ietaupa lielāka sākotnējā iemaksa?', answer: '<p>Papildus tiešai aizdevuma summas samazināšanai, lielāka iemaksa samazina bāzi, no kuras katru mēnesi tiek aprēķināti procenti, tāpēc kopējais procentu ietaupījums 30 gadu laikā bieži ir lielāks nekā pati iemaksas palielināšana.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Mājas Cena', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Sākotnējā Iemaksa', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Aizdevuma Termiņš', type: 'number', unit: 'gadi', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Aizdevuma Summa', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Ikmēneša Maksājums', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Procentu Pārmaksa', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-raty-hipotecznej',
            title: 'Kalkulator Raty Hipotecznej - Z Wkładem Własnym',
            h1: 'Kalkulator Raty Hipotecznej',
            meta_title: 'Kalkulator Hipoteczny | Rata Miesięczna i Odsetki',
            meta_description: 'Oblicz miesięczną ratę hipoteczną na podstawie ceny domu, wkładu własnego, oprocentowania i okresu kredytowania oraz sumę odsetek.',
            short_answer: 'Ten kalkulator szacuje miesięczną ratę hipoteczną na podstawie ceny domu, wkładu własnego, oprocentowania i okresu kredytowania, a także sumę odsetek przez cały okres.',
            intro_text: '<p>Rata hipoteczna jest obliczana za pomocą tej samej matematyki amortyzacji co każdy inny kredyt ratalny, ale zaczyna się od kwoty kredytu pozostałej po wkładzie własnym — im większy wkład, tym mniejsza kwota kredytu, rata i suma odsetek.</p><p><b>Kupujący dom</b> używają tego, aby porównać scenariusze przed zakupem: większy wkład własny, krótszy okres lub inne oprocentowanie mogą znacząco zmienić miesięczną ratę i całkowity koszt posiadania domu przez 15-30 lat.</p>',
            key_points: [
                '<b>Wkład własny redukuje wszystko:</b> Większy wkład własny obniża kwotę kredytu, ratę miesięczną i sumę odsetek — wszystkie trzy jednocześnie.',
                '<b>30 lat kontra 15 lat:</b> Okres 15 lat oznacza wyższą ratę miesięczną, ale znacznie niższą sumę odsetek niż 30 lat przy tym samym oprocentowaniu.',
                '<b>Bez podatków i ubezpieczenia:</b> Pokazano tylko kapitał i odsetki; rzeczywisty miesięczny koszt mieszkania będzie obejmował także podatek od nieruchomości i ubezpieczenie.',
            ],
            howto: [
                { question: 'Czy to uwzględnia podatki od nieruchomości i ubezpieczenie?', answer: '<p>Nie — to oblicza tylko kapitał i odsetki (P&I), podstawową ratę kredytu. Rzeczywista miesięczna rata za mieszkanie będzie zwykle wyższa po doliczeniu podatków i ubezpieczenia.</p>' },
                { question: 'Ile faktycznie oszczędza większy wkład własny?', answer: '<p>Poza bezpośrednim obniżeniem kwoty kredytu, większy wkład zmniejsza bazę, od której co miesiąc naliczane są odsetki, więc całkowita oszczędność na odsetkach przez 30 lat jest często większa niż sam wzrost wkładu.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Cena Domu', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Wkład Własny', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Roczne Oprocentowanie', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Okres Kredytowania', type: 'number', unit: 'lat', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Kwota Kredytu', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Rata Miesięczna (kapitał+odsetki)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Suma Odsetek', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-cuota-hipoteca',
            title: 'Calculadora de Cuota de Hipoteca - Con Pago Inicial',
            h1: 'Calculadora de Cuota de Hipoteca',
            meta_title: 'Calculadora de Hipoteca | Cuota Mensual e Intereses',
            meta_description: 'Calcula tu cuota mensual de hipoteca según el precio de la vivienda, el pago inicial, la tasa de interés y el plazo, más el interés total.',
            short_answer: 'Esta calculadora estima tu cuota mensual de hipoteca según el precio de la vivienda, tu pago inicial, la tasa de interés y el plazo del préstamo, junto con el interés total que pagarás durante la vida del préstamo.',
            intro_text: '<p>Una cuota de hipoteca se calcula con la misma matemática de amortización que cualquier otro préstamo a plazos, pero parte del monto del préstamo restante después de tu pago inicial — cuanto mayor sea tu pago inicial, menor será el monto del préstamo, la cuota mensual y el interés total.</p><p><b>Los compradores de vivienda</b> usan esto para comparar escenarios antes de buscar una casa: un pago inicial mayor, un plazo más corto o una tasa diferente pueden cambiar significativamente la cuota mensual y el costo total de la vivienda durante 15-30 años.</p>',
            key_points: [
                '<b>El pago inicial reduce todo:</b> Un pago inicial mayor reduce el monto del préstamo, la cuota mensual y el interés total — los tres a la vez.',
                '<b>30 años vs 15 años:</b> Un plazo de 15 años implica una cuota mensual mayor pero un interés total dramáticamente menor que uno de 30 años a la misma tasa.',
                '<b>Excluye impuestos y seguro:</b> Esto muestra solo capital e intereses; tu costo de vivienda mensual real también incluirá impuestos y seguro de vivienda.',
            ],
            howto: [
                { question: '¿Esto incluye impuestos a la propiedad y seguro?', answer: '<p>No — esto calcula solo capital e intereses (P&I), el pago base del préstamo. Tu pago mensual total de vivienda será típicamente mayor una vez añadidos impuestos y seguro.</p>' },
                { question: '¿Cuánto ahorra realmente un pago inicial mayor?', answer: '<p>Más allá de reducir directamente el monto del préstamo, un pago inicial mayor reduce la base sobre la que se acumulan intereses cada mes, por lo que el ahorro total en intereses suele ser mayor que el propio aumento del pago inicial en un plazo de 30 años.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Precio de la Vivienda', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Pago Inicial', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Plazo del Préstamo', type: 'number', unit: 'años', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Monto del Préstamo', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Cuota Mensual (Capital+Interés)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Interés Total', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-mensualite-hypotheque',
            title: 'Calculateur de Mensualité Hypothécaire - Avec Apport',
            h1: 'Calculateur de Mensualité Hypothécaire',
            meta_title: 'Calculateur Hypothécaire | Mensualité et Intérêts',
            meta_description: 'Calculez votre mensualité hypothécaire selon le prix du bien, l’apport, le taux d’intérêt et la durée, plus les intérêts totaux.',
            short_answer: 'Ce calculateur estime votre mensualité hypothécaire selon le prix du bien, votre apport, le taux d’intérêt et la durée du prêt, ainsi que les intérêts totaux sur la durée du prêt.',
            intro_text: '<p>Une mensualité hypothécaire est calculée avec les mêmes mathématiques d’amortissement que tout autre prêt à tempérament, mais part du montant du prêt restant après votre apport — plus votre apport est important, plus le montant du prêt, la mensualité et les intérêts totaux sont faibles.</p><p><b>Les acheteurs</b> utilisent cela pour comparer des scénarios avant de chercher un bien : un apport plus important, une durée plus courte ou un taux différent peuvent chacun changer significativement la mensualité et le coût total de la propriété sur 15-30 ans.</p>',
            key_points: [
                '<b>L’apport réduit tout :</b> Un apport plus important réduit le montant du prêt, la mensualité et les intérêts totaux — les trois à la fois.',
                '<b>30 ans contre 15 ans :</b> Une durée de 15 ans implique une mensualité plus élevée mais des intérêts totaux nettement inférieurs à 30 ans au même taux.',
                '<b>Hors taxes et assurance :</b> Ceci montre uniquement le capital et les intérêts ; votre coût de logement mensuel réel inclura aussi la taxe foncière et l’assurance habitation.',
            ],
            howto: [
                { question: 'Cela inclut-il les taxes foncières et l’assurance ?', answer: '<p>Non — ceci calcule uniquement le capital et les intérêts (P&I), le paiement de base du prêt. Votre mensualité totale de logement sera généralement plus élevée une fois les taxes et l’assurance ajoutées.</p>' },
                { question: 'Combien économise réellement un apport plus important ?', answer: '<p>Au-delà de réduire directement le montant du prêt, un apport plus important réduit la base sur laquelle les intérêts s’accumulent chaque mois, donc l’économie totale d’intérêts est souvent supérieure à l’augmentation de l’apport lui-même sur 30 ans.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Prix du Bien', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Apport', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Durée du Prêt', type: 'number', unit: 'ans', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Montant du Prêt', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Mensualité (Capital+Intérêts)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Intérêts Totaux', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-rata-mutuo',
            title: 'Calcolatore Rata Mutuo - Con Anticipo',
            h1: 'Calcolatore Rata Mutuo',
            meta_title: 'Calcolatore Mutuo | Rata Mensile e Interessi',
            meta_description: 'Calcola la tua rata mensile del mutuo in base al prezzo della casa, all’anticipo, al tasso di interesse e alla durata, più gli interessi totali.',
            short_answer: 'Questo calcolatore stima la tua rata mensile del mutuo in base al prezzo della casa, al tuo anticipo, al tasso di interesse e alla durata del prestito, insieme agli interessi totali che pagherai.',
            intro_text: '<p>Una rata di mutuo viene calcolata con la stessa matematica di ammortamento di qualsiasi altro prestito rateale, ma parte dall’importo del prestito rimanente dopo il tuo anticipo — maggiore è il tuo anticipo, minore sarà l’importo del prestito, la rata mensile e gli interessi totali.</p><p><b>Gli acquirenti di case</b> usano questo per confrontare scenari prima di cercare una casa: un anticipo maggiore, una durata più breve o un tasso diverso possono cambiare significativamente la rata mensile e il costo totale della proprietà su 15-30 anni.</p>',
            key_points: [
                '<b>L’anticipo riduce tutto:</b> Un anticipo maggiore riduce l’importo del prestito, la rata mensile e gli interessi totali — tutti e tre insieme.',
                '<b>30 anni contro 15 anni:</b> Una durata di 15 anni implica una rata mensile più alta ma interessi totali drasticamente inferiori rispetto a 30 anni allo stesso tasso.',
                '<b>Esclude tasse e assicurazione:</b> Questo mostra solo capitale e interessi; il tuo costo abitativo mensile reale includerà anche le tasse sulla proprietà e l’assicurazione casa.',
            ],
            howto: [
                { question: 'Questo include le tasse sulla proprietà e l’assicurazione?', answer: '<p>No — questo calcola solo capitale e interessi (P&I), il pagamento base del prestito. Il tuo pagamento mensile totale per la casa sarà tipicamente più alto una volta aggiunte tasse e assicurazione.</p>' },
                { question: 'Quanto risparmia realmente un anticipo maggiore?', answer: '<p>Oltre a ridurre direttamente l’importo del prestito, un anticipo maggiore riduce la base su cui maturano gli interessi ogni mese, quindi il risparmio totale sugli interessi è spesso maggiore dell’aumento dell’anticipo stesso su 30 anni.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Prezzo della Casa', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Anticipo', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Durata del Prestito', type: 'number', unit: 'anni', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Importo del Prestito', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Rata Mensile (Capitale+Interessi)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Interessi Totali', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'hypotheken-raten-rechner',
            title: 'Hypotheken-Raten-Rechner - Mit Anzahlung',
            h1: 'Hypotheken-Raten-Rechner',
            meta_title: 'Hypotheken-Rechner | Monatliche Rate und Zinsen',
            meta_description: 'Berechnen Sie Ihre monatliche Hypothekenrate basierend auf Kaufpreis, Anzahlung, Zinssatz und Laufzeit, plus Gesamtzinsen.',
            short_answer: 'Dieser Rechner schätzt Ihre monatliche Hypothekenrate basierend auf dem Kaufpreis, Ihrer Anzahlung, dem Zinssatz und der Kreditlaufzeit, zusammen mit den Gesamtzinsen über die Laufzeit.',
            intro_text: '<p>Eine Hypothekenrate wird mit derselben Tilgungsmathematik wie jeder andere Ratenkredit berechnet, beginnt aber beim Kreditbetrag, der nach Ihrer Anzahlung übrig bleibt — je größer Ihre Anzahlung, desto kleiner sind Kreditbetrag, monatliche Rate und Gesamtzinsen.</p><p><b>Hauskäufer</b> nutzen dies, um "Was-wäre-wenn"-Szenarien vor dem Hauskauf zu vergleichen: eine größere Anzahlung, eine kürzere Laufzeit oder ein anderer Zinssatz können jeweils die monatliche Rate und die Gesamtkosten des Eigenheims über 15-30 Jahre erheblich verändern.</p>',
            key_points: [
                '<b>Anzahlung reduziert alles:</b> Eine größere Anzahlung senkt Kreditbetrag, monatliche Rate und Gesamtzinsen — alle drei gleichzeitig.',
                '<b>30 Jahre vs. 15 Jahre:</b> Eine 15-jährige Laufzeit bedeutet eine höhere monatliche Rate, aber deutlich weniger Gesamtzinsen als eine 30-jährige Laufzeit beim gleichen Zinssatz.',
                '<b>Ohne Steuern & Versicherung:</b> Dies zeigt nur Tilgung und Zinsen; Ihre tatsächlichen monatlichen Wohnkosten umfassen auch Grundsteuer und Hausratversicherung.',
            ],
            howto: [
                { question: 'Sind Grundsteuer und Versicherung enthalten?', answer: '<p>Nein — dies berechnet nur Tilgung und Zinsen (P&I), die Kernkreditrate. Ihre gesamte monatliche Wohnkostenrate wird in der Regel höher sein, sobald Steuern und Versicherung hinzukommen.</p>' },
                { question: 'Wie viel spart eine größere Anzahlung wirklich?', answer: '<p>Neben der direkten Reduzierung des Kreditbetrags verringert eine größere Anzahlung die Basis, auf die jeden Monat Zinsen anfallen, sodass die gesamte Zinsersparnis über 30 Jahre oft größer ist als die Erhöhung der Anzahlung selbst.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Kaufpreis', type: 'number', unit: '$', min: 10000, max: 20000000, placeholder: '300000' },
                { name: 'down_payment', label: 'Anzahlung', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '60000' },
                { name: 'annual_rate', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0.1, max: 20, placeholder: '6' },
                { name: 'years', label: 'Kreditlaufzeit', type: 'number', unit: 'Jahre', min: 1, max: 40, placeholder: '30' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Kreditbetrag', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Monatliche Rate (Tilgung+Zinsen)', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Gesamtzinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1015: Auto Loan Calculator
// ============================================================
const autoR = '(annual_rate/100/12)'
const autoN = '(years*12)'
const autoLoanAmount = '(price - down_payment - trade_in)'
const autoPMT = `(${autoLoanAmount}*${autoR}*(1+${autoR})^${autoN} / ((1+${autoR})^${autoN} - 1))`

const autoLoan: ToolDef = {
    id: '1015',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'price', default: 30000 },
            { key: 'down_payment', default: 3000 },
            { key: 'trade_in', default: 0 },
            { key: 'annual_rate', default: 6 },
            { key: 'years', default: 5 },
        ],
        formulas: {
            loan_amount: autoLoanAmount,
            monthly_payment: autoPMT,
            total_interest: `${autoPMT}*${autoN} - ${autoLoanAmount}`,
        },
        outputs: [
            { key: 'loan_amount', precision: 2 },
            { key: 'monthly_payment', precision: 2 },
            { key: 'total_interest', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'auto-loan-calculator',
            title: 'Auto Loan Calculator - With Trade-In',
            h1: 'Auto Loan Calculator',
            meta_title: 'Auto Loan Calculator | Monthly Car Payment',
            meta_description: 'Calculate your monthly car loan payment based on vehicle price, down payment, trade-in value, interest rate, and loan term.',
            short_answer: 'This calculator estimates your monthly car payment based on the vehicle price, your down payment, any trade-in value, the interest rate, and the loan term.',
            intro_text: '<p>An auto loan follows the same amortization structure as any installment loan, but the amount financed is reduced by both your cash down payment and the value of any trade-in vehicle before the interest calculation begins.</p><p><b>Car buyers</b> use this to compare dealership financing offers against a pre-approved bank or credit union loan, and to see how a bigger down payment or trade-in reduces the monthly payment before walking into a dealership.</p>',
            key_points: [
                '<b>Trade-In Reduces Loan Amount:</b> Both cash down payment and trade-in value are subtracted from the price before financing.',
                '<b>Shorter Terms Save Interest:</b> Auto loans commonly range from 3-7 years; shorter terms mean higher payments but much less total interest.',
                '<b>Compare Before You Buy:</b> Use this to check a dealership\'s offered rate against your own bank or credit union pre-approval.',
            ],
            howto: [
                { question: 'Should I use my trade-in as a down payment?', answer: '<p>Both cash down payment and trade-in value reduce your loan amount the same way — what matters most is getting a fair trade-in valuation, since dealers sometimes lowball trade-in offers.</p>' },
                { question: 'What loan term should I choose?', answer: '<p>A shorter term (3-4 years) minimizes total interest paid; longer terms (6-7 years) lower the monthly payment but often mean paying more interest and risking being "underwater" on the loan longer.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Vehicle Price', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Down Payment', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Trade-In Value', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Loan Term', type: 'number', unit: 'years', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Amount Financed', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Monthly Payment', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Total Interest', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-avtokredita',
            title: 'Калькулятор автокредита - с trade-in',
            h1: 'Калькулятор автокредита',
            meta_title: 'Калькулятор автокредита | Ежемесячный платёж за авто',
            meta_description: 'Рассчитайте ежемесячный платёж по автокредиту на основе цены автомобиля, первоначального взноса, стоимости trade-in, ставки и срока.',
            short_answer: 'Этот калькулятор оценивает ежемесячный платёж за автомобиль на основе цены, первоначального взноса, стоимости сдаваемого в trade-in авто, ставки и срока кредита.',
            intro_text: '<p>Автокредит следует той же структуре амортизации, что и любой рассрочный кредит, но финансируемая сумма уменьшается как на денежный первоначальный взнос, так и на стоимость сдаваемого автомобиля (trade-in) перед расчётом процентов.</p><p><b>Покупатели автомобилей</b> используют это, чтобы сравнить предложение автосалона с предварительно одобренным кредитом банка, и увидеть, как больший взнос или trade-in снижают платёж ещё до визита в салон.</p>',
            key_points: [
                '<b>Trade-in снижает сумму кредита:</b> И денежный взнос, и стоимость trade-in вычитаются из цены до расчёта финансирования.',
                '<b>Короткий срок экономит на процентах:</b> Автокредиты обычно на 3-7 лет; короткий срок означает больший платёж, но намного меньшую переплату.',
                '<b>Сравнивайте перед покупкой:</b> Используйте это, чтобы сверить ставку автосалона с предложением своего банка.',
            ],
            howto: [
                { question: 'Стоит ли использовать trade-in как первоначальный взнос?', answer: '<p>И денежный взнос, и trade-in одинаково снижают сумму кредита — важнее всего получить справедливую оценку trade-in, так как салоны иногда занижают её.</p>' },
                { question: 'Какой срок кредита выбрать?', answer: '<p>Короткий срок (3-4 года) минимизирует переплату; длинный (6-7 лет) снижает платёж, но часто означает большую переплату и дольший риск остаться «под водой» по кредиту.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Цена автомобиля', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Первоначальный взнос', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Стоимость trade-in', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Срок кредита', type: 'number', unit: 'лет', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Сумма финансирования', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Ежемесячный платёж', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Переплата по процентам', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'auto-kredita-kalkulators',
            title: 'Auto Kredīta Kalkulators - Ar Maiņas Vērtību',
            h1: 'Auto Kredīta Kalkulators',
            meta_title: 'Auto Kredīta Kalkulators | Ikmēneša Maksājums par Auto',
            meta_description: 'Aprēķiniet ikmēneša auto kredīta maksājumu, balstoties uz auto cenu, sākotnējo iemaksu, maiņas vērtību, likmi un termiņu.',
            short_answer: 'Šis kalkulators novērtē jūsu ikmēneša auto maksājumu, balstoties uz transportlīdzekļa cenu, sākotnējo iemaksu, jebkuru maiņā nodotā auto vērtību, procentu likmi un aizdevuma termiņu.',
            intro_text: '<p>Auto kredīts seko tai pašai amortizācijas struktūrai kā jebkurš cits aizdevums, taču finansējamā summa tiek samazināta gan par skaidras naudas iemaksu, gan par maiņā nodotā auto vērtību, pirms tiek aprēķināti procenti.</p><p><b>Auto pircēji</b> to izmanto, lai salīdzinātu autosalona finansējuma piedāvājumu ar iepriekš apstiprinātu bankas aizdevumu, un redzētu, kā lielāka iemaksa vai maiņas vērtība samazina maksājumu jau pirms došanās uz salonu.</p>',
            key_points: [
                '<b>Maiņas vērtība samazina aizdevuma summu:</b> Gan skaidras naudas iemaksa, gan maiņas vērtība tiek atskaitīta no cenas pirms finansējuma aprēķina.',
                '<b>Īsāks termiņš ietaupa procentus:</b> Auto kredīti parasti ir uz 3-7 gadiem; īsāks termiņš nozīmē lielāku maksājumu, bet daudz mazāku pārmaksu.',
                '<b>Salīdziniet pirms pirkšanas:</b> Izmantojiet šo, lai salīdzinātu autosalona piedāvāto likmi ar savas bankas piedāvājumu.',
            ],
            howto: [
                { question: 'Vai maiņā nodoto auto izmantot kā iemaksu?', answer: '<p>Gan skaidras naudas iemaksa, gan maiņas vērtība vienādi samazina aizdevuma summu — svarīgākais ir saņemt godīgu maiņas vērtējumu, jo saloni dažreiz to novērtē pārāk zemu.</p>' },
                { question: 'Kādu aizdevuma termiņu izvēlēties?', answer: '<p>Īsāks termiņš (3-4 gadi) samazina kopējo pārmaksu; garāks (6-7 gadi) samazina maksājumu, bet bieži nozīmē lielāku pārmaksu un ilgāku risku palikt "zem ūdens" ar aizdevumu.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Transportlīdzekļa Cena', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Sākotnējā Iemaksa', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Maiņas Vērtība', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Aizdevuma Termiņš', type: 'number', unit: 'gadi', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Finansējuma Summa', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Ikmēneša Maksājums', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Procentu Pārmaksa', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-kredytu-samochodowego',
            title: 'Kalkulator Kredytu Samochodowego - Z Rozliczeniem Starego Auta',
            h1: 'Kalkulator Kredytu Samochodowego',
            meta_title: 'Kalkulator Kredytu Samochodowego | Rata za Samochód',
            meta_description: 'Oblicz miesięczną ratę kredytu samochodowego na podstawie ceny pojazdu, wkładu własnego, wartości rozliczenia starego auta, oprocentowania i okresu.',
            short_answer: 'Ten kalkulator szacuje twoją miesięczną ratę za samochód na podstawie ceny pojazdu, wkładu własnego, wartości rozliczenia starego auta, oprocentowania i okresu kredytowania.',
            intro_text: '<p>Kredyt samochodowy ma taką samą strukturę amortyzacji jak każdy kredyt ratalny, ale finansowana kwota jest pomniejszana zarówno o gotówkowy wkład własny, jak i wartość rozliczenia starego pojazdu, zanim naliczane są odsetki.</p><p><b>Kupujący samochody</b> używają tego, aby porównać ofertę finansowania dealera z wcześniej zatwierdzonym kredytem bankowym i zobaczyć, jak większy wkład własny lub rozliczenie starego auta obniża ratę jeszcze przed wizytą u dealera.</p>',
            key_points: [
                '<b>Rozliczenie starego auta obniża kwotę kredytu:</b> Zarówno gotówkowy wkład, jak i wartość rozliczenia są odejmowane od ceny przed obliczeniem finansowania.',
                '<b>Krótszy okres oszczędza na odsetkach:</b> Kredyty samochodowe zwykle trwają 3-7 lat; krótszy okres oznacza wyższą ratę, ale znacznie mniejszą sumę odsetek.',
                '<b>Porównaj przed zakupem:</b> Użyj tego, aby sprawdzić ofertę dealera względem własnego przedzatwierdzenia bankowego.',
            ],
            howto: [
                { question: 'Czy powinienem użyć rozliczenia starego auta jako wkładu?', answer: '<p>Zarówno gotówkowy wkład, jak i wartość rozliczenia obniżają kwotę kredytu w ten sam sposób — najważniejsze to uzyskać uczciwą wycenę rozliczenia, ponieważ dealerzy czasem ją zaniżają.</p>' },
                { question: 'Jaki okres kredytowania wybrać?', answer: '<p>Krótszy okres (3-4 lata) minimalizuje sumę odsetek; dłuższy (6-7 lat) obniża ratę, ale często oznacza wyższą sumę odsetek i dłuższe ryzyko "zadłużenia powyżej wartości" pojazdu.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Cena Pojazdu', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Wkład Własny', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Wartość Rozliczenia Starego Auta', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Roczne Oprocentowanie', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Okres Kredytowania', type: 'number', unit: 'lat', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Kwota Finansowania', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Rata Miesięczna', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Suma Odsetek', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-prestamo-auto',
            title: 'Calculadora de Préstamo de Auto - Con Vehículo de Cambio',
            h1: 'Calculadora de Préstamo de Auto',
            meta_title: 'Calculadora de Préstamo de Auto | Cuota Mensual del Coche',
            meta_description: 'Calcula tu cuota mensual de préstamo de auto según el precio del vehículo, el pago inicial, el valor del vehículo de cambio, la tasa y el plazo.',
            short_answer: 'Esta calculadora estima tu cuota mensual de auto según el precio del vehículo, tu pago inicial, el valor de cualquier vehículo de cambio, la tasa de interés y el plazo del préstamo.',
            intro_text: '<p>Un préstamo de auto sigue la misma estructura de amortización que cualquier préstamo a plazos, pero el monto financiado se reduce tanto por tu pago inicial en efectivo como por el valor de cualquier vehículo de cambio antes de calcular los intereses.</p><p><b>Los compradores de autos</b> usan esto para comparar las ofertas de financiamiento del concesionario contra un préstamo preaprobado de banco, y para ver cómo un pago inicial o vehículo de cambio mayor reduce la cuota antes de entrar al concesionario.</p>',
            key_points: [
                '<b>El vehículo de cambio reduce el préstamo:</b> Tanto el pago inicial en efectivo como el valor del vehículo de cambio se restan del precio antes del financiamiento.',
                '<b>Plazos más cortos ahorran intereses:</b> Los préstamos de auto suelen ser de 3-7 años; plazos más cortos significan cuotas más altas pero mucho menos interés total.',
                '<b>Compara antes de comprar:</b> Usa esto para verificar la tasa ofrecida por el concesionario contra tu propia preaprobación bancaria.',
            ],
            howto: [
                { question: '¿Debo usar mi vehículo de cambio como pago inicial?', answer: '<p>Tanto el pago inicial en efectivo como el valor de cambio reducen el monto del préstamo de la misma manera — lo más importante es obtener una valoración justa del vehículo de cambio, ya que los concesionarios a veces la subestiman.</p>' },
                { question: '¿Qué plazo de préstamo debo elegir?', answer: '<p>Un plazo más corto (3-4 años) minimiza el interés total pagado; plazos más largos (6-7 años) reducen la cuota mensual pero suelen significar pagar más interés y arriesgarse a quedar "bajo el agua" con el préstamo por más tiempo.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Precio del Vehículo', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Pago Inicial', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Valor del Vehículo de Cambio', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Plazo del Préstamo', type: 'number', unit: 'años', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Monto Financiado', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Cuota Mensual', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Interés Total', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-pret-auto',
            title: 'Calculateur de Prêt Auto - Avec Reprise',
            h1: 'Calculateur de Prêt Auto',
            meta_title: 'Calculateur de Prêt Auto | Mensualité de Voiture',
            meta_description: 'Calculez votre mensualité de prêt auto selon le prix du véhicule, l’apport, la valeur de reprise, le taux d’intérêt et la durée.',
            short_answer: 'Ce calculateur estime votre mensualité de voiture selon le prix du véhicule, votre apport, la valeur de reprise éventuelle, le taux d’intérêt et la durée du prêt.',
            intro_text: '<p>Un prêt auto suit la même structure d’amortissement que tout prêt à tempérament, mais le montant financé est réduit à la fois par votre apport en espèces et par la valeur de reprise d’un véhicule avant le calcul des intérêts.</p><p><b>Les acheteurs de voitures</b> utilisent cela pour comparer les offres de financement du concessionnaire à un prêt bancaire pré-approuvé, et pour voir comment un apport ou une reprise plus importante réduit la mensualité avant même d’entrer chez le concessionnaire.</p>',
            key_points: [
                '<b>La reprise réduit le montant du prêt :</b> L’apport en espèces et la valeur de reprise sont tous deux déduits du prix avant le financement.',
                '<b>Durées plus courtes = moins d’intérêts :</b> Les prêts auto vont généralement de 3 à 7 ans ; une durée plus courte signifie des mensualités plus élevées mais beaucoup moins d’intérêts totaux.',
                '<b>Comparez avant d’acheter :</b> Utilisez cela pour vérifier le taux proposé par le concessionnaire par rapport à votre propre pré-approbation bancaire.',
            ],
            howto: [
                { question: 'Dois-je utiliser ma reprise comme apport ?', answer: '<p>L’apport en espèces et la valeur de reprise réduisent le montant du prêt de la même manière — le plus important est d’obtenir une évaluation équitable de la reprise, car les concessionnaires la sous-évaluent parfois.</p>' },
                { question: 'Quelle durée de prêt choisir ?', answer: '<p>Une durée plus courte (3-4 ans) minimise les intérêts totaux payés ; une durée plus longue (6-7 ans) réduit la mensualité mais signifie souvent payer plus d’intérêts et risquer d’être "sous l’eau" sur le prêt plus longtemps.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Prix du Véhicule', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Apport', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Valeur de Reprise', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Durée du Prêt', type: 'number', unit: 'ans', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Montant Financé', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Mensualité', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Intérêts Totaux', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-prestito-auto',
            title: 'Calcolatore Prestito Auto - Con Permuta',
            h1: 'Calcolatore Prestito Auto',
            meta_title: 'Calcolatore Prestito Auto | Rata Mensile Auto',
            meta_description: 'Calcola la tua rata mensile del prestito auto in base al prezzo del veicolo, all’anticipo, al valore di permuta, al tasso e alla durata.',
            short_answer: 'Questo calcolatore stima la tua rata mensile per l’auto in base al prezzo del veicolo, al tuo anticipo, al valore di eventuale permuta, al tasso di interesse e alla durata del prestito.',
            intro_text: '<p>Un prestito auto segue la stessa struttura di ammortamento di qualsiasi prestito rateale, ma l’importo finanziato viene ridotto sia dall’anticipo in contanti che dal valore di un’eventuale permuta prima del calcolo degli interessi.</p><p><b>Gli acquirenti di auto</b> usano questo per confrontare le offerte di finanziamento del concessionario con un prestito bancario preapprovato, e per vedere come un anticipo o una permuta maggiore riducono la rata prima ancora di entrare dal concessionario.</p>',
            key_points: [
                '<b>La permuta riduce l’importo del prestito:</b> Sia l’anticipo in contanti che il valore di permuta vengono sottratti dal prezzo prima del finanziamento.',
                '<b>Durate più brevi risparmiano interessi:</b> I prestiti auto vanno solitamente da 3 a 7 anni; durate più brevi significano rate più alte ma molti meno interessi totali.',
                '<b>Confronta prima di comprare:</b> Usa questo per verificare il tasso offerto dal concessionario rispetto alla tua preapprovazione bancaria.',
            ],
            howto: [
                { question: 'Dovrei usare la mia permuta come anticipo?', answer: '<p>Sia l’anticipo in contanti che il valore di permuta riducono l’importo del prestito allo stesso modo — la cosa più importante è ottenere una valutazione equa della permuta, poiché i concessionari a volte la sottovalutano.</p>' },
                { question: 'Quale durata del prestito dovrei scegliere?', answer: '<p>Una durata più breve (3-4 anni) minimizza gli interessi totali pagati; durate più lunghe (6-7 anni) riducono la rata mensile ma spesso significano pagare più interessi e rischiare di rimanere "sott’acqua" sul prestito più a lungo.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Prezzo del Veicolo', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Anticipo', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Valore di Permuta', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Durata del Prestito', type: 'number', unit: 'anni', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Importo Finanziato', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Rata Mensile', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Interessi Totali', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'autokredit-rechner',
            title: 'Autokredit-Rechner - Mit Inzahlungnahme',
            h1: 'Autokredit-Rechner',
            meta_title: 'Autokredit-Rechner | Monatliche Autorate',
            meta_description: 'Berechnen Sie Ihre monatliche Autokreditrate basierend auf Fahrzeugpreis, Anzahlung, Inzahlungnahme-Wert, Zinssatz und Laufzeit.',
            short_answer: 'Dieser Rechner schätzt Ihre monatliche Autorate basierend auf dem Fahrzeugpreis, Ihrer Anzahlung, einem etwaigen Inzahlungnahme-Wert, dem Zinssatz und der Kreditlaufzeit.',
            intro_text: '<p>Ein Autokredit folgt derselben Tilgungsstruktur wie jeder Ratenkredit, aber der finanzierte Betrag wird sowohl durch Ihre Bar-Anzahlung als auch durch den Wert eines in Zahlung gegebenen Fahrzeugs reduziert, bevor die Zinsberechnung beginnt.</p><p><b>Autokäufer</b> nutzen dies, um Finanzierungsangebote des Händlers mit einem vorab genehmigten Bank- oder Kreditgenossenschaftskredit zu vergleichen und zu sehen, wie eine größere Anzahlung oder Inzahlungnahme die monatliche Rate senkt, bevor sie den Autohändler betreten.</p>',
            key_points: [
                '<b>Inzahlungnahme reduziert den Kreditbetrag:</b> Sowohl Bar-Anzahlung als auch Inzahlungnahme-Wert werden vor der Finanzierung vom Preis abgezogen.',
                '<b>Kürzere Laufzeiten sparen Zinsen:</b> Autokredite reichen üblicherweise von 3-7 Jahren; kürzere Laufzeiten bedeuten höhere Raten, aber viel weniger Gesamtzinsen.',
                '<b>Vergleichen Sie vor dem Kauf:</b> Nutzen Sie dies, um den vom Händler angebotenen Zinssatz mit Ihrer eigenen Bank-Vorab-Genehmigung zu vergleichen.',
            ],
            howto: [
                { question: 'Sollte ich meine Inzahlungnahme als Anzahlung nutzen?', answer: '<p>Sowohl Bar-Anzahlung als auch Inzahlungnahme-Wert reduzieren den Kreditbetrag auf die gleiche Weise — am wichtigsten ist eine faire Bewertung der Inzahlungnahme, da Händler diese manchmal zu niedrig ansetzen.</p>' },
                { question: 'Welche Kreditlaufzeit sollte ich wählen?', answer: '<p>Eine kürzere Laufzeit (3-4 Jahre) minimiert die gezahlten Gesamtzinsen; längere Laufzeiten (6-7 Jahre) senken die monatliche Rate, bedeuten aber oft mehr gezahlte Zinsen und ein längeres Risiko, beim Kredit "unter Wasser" zu sein.</p>' },
            ],
            inputs: [
                { name: 'price', label: 'Fahrzeugpreis', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment', label: 'Anzahlung', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '3000' },
                { name: 'trade_in', label: 'Inzahlungnahme-Wert', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '0' },
                { name: 'annual_rate', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Kreditlaufzeit', type: 'number', unit: 'Jahre', min: 1, max: 10, placeholder: '5' },
            ],
            outputs: [
                { name: 'loan_amount', label: 'Finanzierter Betrag', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Monatliche Rate', unit: '$', precision: 2 },
                { name: 'total_interest', label: 'Gesamtzinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1016: Simple Interest Calculator
// ============================================================
const simpleInterest: ToolDef = {
    id: '1016',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 1000 },
            { key: 'rate_pct', default: 5 },
            { key: 'years', default: 2 },
        ],
        formulas: {
            interest: 'principal*rate_pct/100*years',
            total_amount: 'principal + principal*rate_pct/100*years',
        },
        outputs: [
            { key: 'interest', precision: 2 },
            { key: 'total_amount', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'simple-interest-calculator',
            title: 'Simple Interest Calculator',
            h1: 'Simple Interest Calculator',
            meta_title: 'Simple Interest Calculator | Interest & Total Amount',
            meta_description: 'Calculate simple interest and total amount owed or earned using the classic I = P × r × t formula, based on principal, rate, and time.',
            short_answer: 'This calculator computes simple interest — interest calculated only on the original principal, not compounding — using the formula I = P × r × t, plus the total amount after interest.',
            intro_text: '<p>Simple interest grows linearly: interest is calculated only on the original principal amount, every period, with no compounding on previously earned interest. This is the simplest interest model and the basis for some personal loans, short-term notes, and bonds.</p><p><b>Borrowers and lenders</b> use simple interest for short-term or fixed-principal arrangements where compounding isn\'t applied, and it\'s a useful baseline to compare against compound interest to see how much difference compounding makes over the same period.</p>',
            key_points: [
                '<b>Classic Formula:</b> Interest = Principal × Rate × Time — no compounding, interest stays constant each period.',
                '<b>Linear Growth:</b> Unlike compound interest, the total grows in a straight line rather than accelerating over time.',
                '<b>Common Uses:</b> Short-term loans, car loans (in some cases), and certain bonds use simple interest instead of compound.',
            ],
            howto: [
                { question: 'What\'s the difference between simple and compound interest?', answer: '<p>Simple interest is calculated only on the principal; compound interest is calculated on the principal plus any interest already earned, so it grows faster over time. Use our Compound Interest Calculator to compare.</p>' },
                { question: 'Is my savings account simple or compound interest?', answer: '<p>Most savings accounts and investments use compound interest. Simple interest is more common in specific loan agreements — check your loan or account terms to confirm.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Principal Amount', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Time Period', type: 'number', unit: 'years', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Simple Interest', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Total Amount', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-prostyh-procentov',
            title: 'Калькулятор простых процентов',
            h1: 'Калькулятор простых процентов',
            meta_title: 'Калькулятор простых процентов | Проценты и итоговая сумма',
            meta_description: 'Рассчитайте простые проценты и итоговую сумму по классической формуле I = P × r × t на основе суммы, ставки и времени.',
            short_answer: 'Этот калькулятор рассчитывает простые проценты — проценты, начисляемые только на первоначальную сумму, без капитализации — по формуле I = P × r × t, а также итоговую сумму с процентами.',
            intro_text: '<p>Простые проценты растут линейно: проценты рассчитываются только на первоначальную сумму каждый период, без начисления процентов на уже полученные проценты. Это самая простая модель начисления процентов, используемая в некоторых потребительских кредитах, краткосрочных векселях и облигациях.</p><p><b>Заёмщики и кредиторы</b> используют простые проценты для краткосрочных договорённостей без капитализации, и это полезная база для сравнения со сложными процентами, чтобы увидеть разницу за тот же период.</p>',
            key_points: [
                '<b>Классическая формула:</b> Проценты = Сумма × Ставка × Время — без капитализации, проценты одинаковы каждый период.',
                '<b>Линейный рост:</b> В отличие от сложных процентов, итог растёт по прямой линии, а не ускоряется со временем.',
                '<b>Распространённое применение:</b> Краткосрочные кредиты, некоторые автокредиты и облигации используют простые проценты вместо сложных.',
            ],
            howto: [
                { question: 'В чём разница между простыми и сложными процентами?', answer: '<p>Простые проценты рассчитываются только на основную сумму; сложные — на сумму плюс уже начисленные проценты, поэтому растут быстрее. Используйте наш калькулятор сложных процентов для сравнения.</p>' },
                { question: 'На моём сберегательном счёте простые или сложные проценты?', answer: '<p>Большинство сберегательных счетов и инвестиций используют сложные проценты. Простые проценты чаще встречаются в определённых кредитных договорах — уточните условия своего счёта.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Основная сумма', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Период', type: 'number', unit: 'лет', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Простые проценты', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Итоговая сумма', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'vienkarso-procentu-kalkulators',
            title: 'Vienkāršo Procentu Kalkulators',
            h1: 'Vienkāršo Procentu Kalkulators',
            meta_title: 'Vienkāršo Procentu Kalkulators | Procenti un Kopējā Summa',
            meta_description: 'Aprēķiniet vienkāršos procentus un kopējo summu, izmantojot klasisko formulu I = P × r × t, balstoties uz pamatsummu, likmi un laiku.',
            short_answer: 'Šis kalkulators aprēķina vienkāršos procentus — procentus, kas aprēķināti tikai no sākotnējās pamatsummas, bez kapitalizācijas — izmantojot formulu I = P × r × t, kā arī kopējo summu ar procentiem.',
            intro_text: '<p>Vienkāršie procenti pieaug lineāri: procenti tiek aprēķināti tikai no sākotnējās pamatsummas katru periodu, bez procentu uzkrāšanas uz jau nopelnītajiem procentiem. Šī ir vienkāršākā procentu aprēķina modele, ko izmanto dažos patēriņa kredītos, īstermiņa vekseļos un obligācijās.</p><p><b>Aizņēmēji un aizdevēji</b> izmanto vienkāršos procentus īstermiņa vienošanās bez kapitalizācijas, un tas ir noderīgs pamats salīdzinājumam ar saliktajiem procentiem, lai redzētu atšķirību tajā pašā periodā.</p>',
            key_points: [
                '<b>Klasiskā formula:</b> Procenti = Pamatsumma × Likme × Laiks — bez kapitalizācijas, procenti katru periodu ir vienādi.',
                '<b>Lineārs pieaugums:</b> Atšķirībā no saliktajiem procentiem, kopsumma pieaug pa taisnu līniju, nevis paātrinās laika gaitā.',
                '<b>Bieža izmantošana:</b> Īstermiņa aizdevumi, daži auto kredīti un obligācijas izmanto vienkāršos procentus, nevis saliktos.',
            ],
            howto: [
                { question: 'Kāda ir atšķirība starp vienkāršiem un saliktiem procentiem?', answer: '<p>Vienkāršie procenti tiek aprēķināti tikai no pamatsummas; saliktie — no pamatsummas plus jau nopelnītajiem procentiem, tāpēc tie pieaug ātrāk. Izmantojiet mūsu Salikto Procentu Kalkulatoru salīdzināšanai.</p>' },
                { question: 'Vai manā krājkontā ir vienkārši vai salikti procenti?', answer: '<p>Lielākā daļa krājkontu un investīciju izmanto saliktos procentus. Vienkāršie procenti biežāk sastopami noteiktos kredītlīgumos — pārbaudiet sava konta noteikumus.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Pamatsumma', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Laika Periods', type: 'number', unit: 'gadi', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Vienkāršie Procenti', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Kopējā Summa', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-odsetek-prostych',
            title: 'Kalkulator Odsetek Prostych',
            h1: 'Kalkulator Odsetek Prostych',
            meta_title: 'Kalkulator Odsetek Prostych | Odsetki i Suma Całkowita',
            meta_description: 'Oblicz odsetki proste i całkowitą kwotę za pomocą klasycznego wzoru I = P × r × t, na podstawie kwoty głównej, stopy i czasu.',
            short_answer: 'Ten kalkulator oblicza odsetki proste — odsetki naliczane tylko od pierwotnej kwoty głównej, bez kapitalizacji — za pomocą wzoru I = P × r × t, oraz całkowitą kwotę po odsetkach.',
            intro_text: '<p>Odsetki proste rosną liniowo: odsetki są naliczane tylko od pierwotnej kwoty głównej w każdym okresie, bez naliczania odsetek od już naliczonych odsetek. To najprostszy model naliczania odsetek, stosowany w niektórych kredytach konsumenckich, krótkoterminowych wekslach i obligacjach.</p><p><b>Kredytobiorcy i kredytodawcy</b> używają odsetek prostych dla krótkoterminowych umów bez kapitalizacji, a to przydatna podstawa do porównania z odsetkami składanymi, aby zobaczyć różnicę w tym samym okresie.</p>',
            key_points: [
                '<b>Klasyczny wzór:</b> Odsetki = Kwota Główna × Stopa × Czas — bez kapitalizacji, odsetki są stałe każdego okresu.',
                '<b>Wzrost liniowy:</b> W przeciwieństwie do odsetek składanych, suma rośnie po linii prostej, a nie przyspiesza w czasie.',
                '<b>Częste zastosowania:</b> Kredyty krótkoterminowe, niektóre kredyty samochodowe i obligacje wykorzystują odsetki proste zamiast składanych.',
            ],
            howto: [
                { question: 'Jaka jest różnica między odsetkami prostymi a składanymi?', answer: '<p>Odsetki proste są naliczane tylko od kwoty głównej; składane — od kwoty głównej plus już naliczonych odsetek, więc rosną szybciej. Użyj naszego Kalkulatora Odsetek Składanych do porównania.</p>' },
                { question: 'Czy moje konto oszczędnościowe ma odsetki proste czy składane?', answer: '<p>Większość kont oszczędnościowych i inwestycji wykorzystuje odsetki składane. Odsetki proste są częstsze w określonych umowach kredytowych — sprawdź warunki swojego konta.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Główna', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Okres Czasu', type: 'number', unit: 'lat', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Odsetki Proste', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Suma Całkowita', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-interes-simple',
            title: 'Calculadora de Interés Simple',
            h1: 'Calculadora de Interés Simple',
            meta_title: 'Calculadora de Interés Simple | Interés y Monto Total',
            meta_description: 'Calcula el interés simple y el monto total usando la fórmula clásica I = P × r × t, según el capital, la tasa y el tiempo.',
            short_answer: 'Esta calculadora calcula el interés simple — interés calculado solo sobre el capital original, sin capitalización — usando la fórmula I = P × r × t, más el monto total después del interés.',
            intro_text: '<p>El interés simple crece de forma lineal: el interés se calcula solo sobre el monto principal original cada período, sin capitalizar sobre intereses ya generados. Este es el modelo de interés más simple, base de algunos préstamos personales, pagarés a corto plazo y bonos.</p><p><b>Prestatarios y prestamistas</b> usan el interés simple para acuerdos a corto plazo sin capitalización, y es una base útil para comparar con el interés compuesto y ver cuánta diferencia hace la capitalización en el mismo período.</p>',
            key_points: [
                '<b>Fórmula clásica:</b> Interés = Capital × Tasa × Tiempo — sin capitalización, el interés se mantiene constante cada período.',
                '<b>Crecimiento lineal:</b> A diferencia del interés compuesto, el total crece en línea recta en lugar de acelerarse con el tiempo.',
                '<b>Usos comunes:</b> Préstamos a corto plazo, algunos préstamos de auto y ciertos bonos usan interés simple en lugar de compuesto.',
            ],
            howto: [
                { question: '¿Cuál es la diferencia entre interés simple y compuesto?', answer: '<p>El interés simple se calcula solo sobre el capital; el compuesto se calcula sobre el capital más los intereses ya generados, por lo que crece más rápido. Usa nuestra Calculadora de Interés Compuesto para comparar.</p>' },
                { question: '¿Mi cuenta de ahorros tiene interés simple o compuesto?', answer: '<p>La mayoría de las cuentas de ahorro e inversiones usan interés compuesto. El interés simple es más común en ciertos acuerdos de préstamo — verifica los términos de tu cuenta.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto Principal', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Período de Tiempo', type: 'number', unit: 'años', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Interés Simple', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Monto Total', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-interet-simple',
            title: 'Calculateur d’Intérêt Simple',
            h1: 'Calculateur d’Intérêt Simple',
            meta_title: 'Calculateur d’Intérêt Simple | Intérêt et Montant Total',
            meta_description: 'Calculez l’intérêt simple et le montant total avec la formule classique I = P × r × t, selon le capital, le taux et le temps.',
            short_answer: 'Ce calculateur calcule l’intérêt simple — intérêt calculé uniquement sur le capital initial, sans capitalisation — avec la formule I = P × r × t, plus le montant total après intérêts.',
            intro_text: '<p>L’intérêt simple croît de manière linéaire : l’intérêt est calculé uniquement sur le montant principal initial à chaque période, sans capitalisation sur les intérêts déjà générés. C’est le modèle d’intérêt le plus simple, base de certains prêts personnels, billets à court terme et obligations.</p><p><b>Emprunteurs et prêteurs</b> utilisent l’intérêt simple pour des accords à court terme sans capitalisation, et c’est une base utile pour comparer avec l’intérêt composé et voir la différence sur la même période.</p>',
            key_points: [
                '<b>Formule classique :</b> Intérêt = Capital × Taux × Temps — sans capitalisation, l’intérêt reste constant à chaque période.',
                '<b>Croissance linéaire :</b> Contrairement à l’intérêt composé, le total croît en ligne droite plutôt que de s’accélérer avec le temps.',
                '<b>Usages courants :</b> Prêts à court terme, certains prêts auto et obligations utilisent l’intérêt simple plutôt que composé.',
            ],
            howto: [
                { question: 'Quelle est la différence entre intérêt simple et composé ?', answer: '<p>L’intérêt simple est calculé uniquement sur le capital ; l’intérêt composé est calculé sur le capital plus les intérêts déjà générés, donc il croît plus vite. Utilisez notre Calculateur d’Intérêt Composé pour comparer.</p>' },
                { question: 'Mon compte épargne a-t-il un intérêt simple ou composé ?', answer: '<p>La plupart des comptes épargne et investissements utilisent l’intérêt composé. L’intérêt simple est plus courant dans certains accords de prêt — vérifiez les conditions de votre compte.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant Principal', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Période', type: 'number', unit: 'ans', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Intérêt Simple', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Montant Total', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-interesse-semplice',
            title: 'Calcolatore di Interesse Semplice',
            h1: 'Calcolatore di Interesse Semplice',
            meta_title: 'Calcolatore Interesse Semplice | Interesse e Importo Totale',
            meta_description: 'Calcola l’interesse semplice e l’importo totale con la formula classica I = P × r × t, in base a capitale, tasso e tempo.',
            short_answer: 'Questo calcolatore calcola l’interesse semplice — interesse calcolato solo sul capitale originale, senza capitalizzazione — con la formula I = P × r × t, più l’importo totale dopo gli interessi.',
            intro_text: '<p>L’interesse semplice cresce linearmente: l’interesse viene calcolato solo sull’importo del capitale originale ogni periodo, senza capitalizzazione sugli interessi già maturati. Questo è il modello di interesse più semplice, alla base di alcuni prestiti personali, cambiali a breve termine e obbligazioni.</p><p><b>Mutuatari e prestatori</b> usano l’interesse semplice per accordi a breve termine senza capitalizzazione, ed è una base utile per confrontare con l’interesse composto e vedere quanta differenza fa la capitalizzazione nello stesso periodo.</p>',
            key_points: [
                '<b>Formula classica:</b> Interesse = Capitale × Tasso × Tempo — senza capitalizzazione, l’interesse rimane costante ogni periodo.',
                '<b>Crescita lineare:</b> A differenza dell’interesse composto, il totale cresce in linea retta anziché accelerare nel tempo.',
                '<b>Usi comuni:</b> Prestiti a breve termine, alcuni prestiti auto e determinate obbligazioni usano l’interesse semplice invece di quello composto.',
            ],
            howto: [
                { question: 'Qual è la differenza tra interesse semplice e composto?', answer: '<p>L’interesse semplice è calcolato solo sul capitale; quello composto è calcolato sul capitale più gli interessi già maturati, quindi cresce più velocemente. Usa il nostro Calcolatore di Interesse Composto per confrontare.</p>' },
                { question: 'Il mio conto di risparmio ha interesse semplice o composto?', answer: '<p>La maggior parte dei conti di risparmio e degli investimenti usa l’interesse composto. L’interesse semplice è più comune in determinati accordi di prestito — controlla i termini del tuo conto.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo del Capitale', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Periodo di Tempo', type: 'number', unit: 'anni', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Interesse Semplice', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Importo Totale', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'einfacher-zinsrechner',
            title: 'Einfacher Zinsrechner',
            h1: 'Einfacher Zinsrechner',
            meta_title: 'Einfacher Zinsrechner | Zinsen und Gesamtbetrag',
            meta_description: 'Berechnen Sie einfache Zinsen und den Gesamtbetrag mit der klassischen Formel I = P × r × t, basierend auf Kapital, Zinssatz und Zeit.',
            short_answer: 'Dieser Rechner berechnet einfache Zinsen — Zinsen, die nur auf das ursprüngliche Kapital berechnet werden, ohne Zinseszins — mit der Formel I = P × r × t, plus den Gesamtbetrag nach Zinsen.',
            intro_text: '<p>Einfache Zinsen wachsen linear: Zinsen werden jede Periode nur auf den ursprünglichen Kapitalbetrag berechnet, ohne Zinseszins auf bereits verdiente Zinsen. Dies ist das einfachste Zinsmodell und die Grundlage für einige Privatkredite, kurzfristige Schuldscheine und Anleihen.</p><p><b>Kreditnehmer und Kreditgeber</b> nutzen einfache Zinsen für kurzfristige Vereinbarungen ohne Zinseszins, und es ist eine nützliche Basis für den Vergleich mit Zinseszins, um zu sehen, wie viel Unterschied die Zinseszinsrechnung über denselben Zeitraum macht.</p>',
            key_points: [
                '<b>Klassische Formel:</b> Zinsen = Kapital × Zinssatz × Zeit — ohne Zinseszins, Zinsen bleiben jede Periode konstant.',
                '<b>Lineares Wachstum:</b> Im Gegensatz zum Zinseszins wächst der Gesamtbetrag geradlinig statt sich über die Zeit zu beschleunigen.',
                '<b>Häufige Verwendung:</b> Kurzfristige Kredite, manche Autokredite und bestimmte Anleihen verwenden einfache statt zusammengesetzte Zinsen.',
            ],
            howto: [
                { question: 'Was ist der Unterschied zwischen einfachen und Zinseszinsen?', answer: '<p>Einfache Zinsen werden nur auf das Kapital berechnet; Zinseszinsen werden auf das Kapital plus bereits verdiente Zinsen berechnet, sodass sie schneller wachsen. Nutzen Sie unseren Zinseszins-Rechner zum Vergleich.</p>' },
                { question: 'Hat mein Sparkonto einfache oder Zinseszinsen?', answer: '<p>Die meisten Sparkonten und Investitionen nutzen Zinseszinsen. Einfache Zinsen sind häufiger bei bestimmten Kreditvereinbarungen zu finden — prüfen Sie die Bedingungen Ihres Kontos.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kapitalbetrag', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Zeitraum', type: 'number', unit: 'Jahre', min: 0, max: 100, placeholder: '2' },
            ],
            outputs: [
                { name: 'interest', label: 'Einfache Zinsen', unit: '$', precision: 2 },
                { name: 'total_amount', label: 'Gesamtbetrag', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1017: Compound Interest Calculator
// ============================================================
const compoundFinal = 'principal*(1+rate_pct/100/compounds_per_year)^(compounds_per_year*years)'

const compoundInterest: ToolDef = {
    id: '1017',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 1000 },
            { key: 'rate_pct', default: 5 },
            { key: 'years', default: 10 },
            { key: 'compounds_per_year', default: 12 },
        ],
        formulas: {
            final_amount: compoundFinal,
            interest_earned: `${compoundFinal} - principal`,
        },
        outputs: [
            { key: 'final_amount', precision: 2 },
            { key: 'interest_earned', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'compound-interest-calculator',
            title: 'Compound Interest Calculator',
            h1: 'Compound Interest Calculator',
            meta_title: 'Compound Interest Calculator | Final Amount & Interest Earned',
            meta_description: 'Calculate how your money grows with compound interest, based on principal, rate, time, and compounding frequency (monthly, annually, etc.).',
            short_answer: 'This calculator shows how your money grows with compound interest — interest earned on both your original principal and previously earned interest — based on your compounding frequency.',
            intro_text: '<p>Compound interest is often called the most powerful force in personal finance: unlike simple interest, each period\'s interest is added to the principal, so future interest is calculated on a growing balance — producing accelerating, exponential growth over time.</p><p><b>Savers and investors</b> use this to see the real long-term impact of compounding frequency (monthly vs. annually) and time horizon — the earlier money is invested, the more time compounding has to work, often mattering more than the contribution amount itself.</p>',
            key_points: [
                '<b>Exponential Growth:</b> Interest earns interest, so growth accelerates over time rather than staying linear.',
                '<b>Compounding Frequency Matters:</b> More frequent compounding (monthly vs. annually) produces a slightly higher final amount at the same nominal rate.',
                '<b>Time Is the Biggest Lever:</b> Starting early has an outsized effect — a longer time horizon often beats a higher contribution amount.',
            ],
            howto: [
                { question: 'Does more frequent compounding make a big difference?', answer: '<p>It helps, but the effect is usually modest (a percentage point or less over long periods) compared to the impact of the interest rate itself and, especially, the length of time invested.</p>' },
                { question: 'How is this different from the Simple Interest Calculator?', answer: '<p>Simple interest only grows on the original principal; here, each period\'s interest is added to the balance and itself earns interest going forward — that\'s the entire difference, and it compounds (literally) over long time horizons.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Initial Amount', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Time Period', type: 'number', unit: 'years', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Compounding Frequency', type: 'select', options: [
                    { value: '1', label: 'Annually' },
                    { value: '4', label: 'Quarterly' },
                    { value: '12', label: 'Monthly' },
                    { value: '365', label: 'Daily' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Final Amount', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interest Earned', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-slozhnyh-procentov',
            title: 'Калькулятор сложных процентов',
            h1: 'Калькулятор сложных процентов',
            meta_title: 'Калькулятор сложных процентов | Итоговая сумма и доход',
            meta_description: 'Рассчитайте, как растут ваши деньги со сложными процентами, на основе суммы, ставки, времени и периодичности капитализации.',
            short_answer: 'Этот калькулятор показывает, как растут ваши деньги со сложными процентами — процентами, начисляемыми и на основную сумму, и на уже полученные проценты — в зависимости от периодичности капитализации.',
            intro_text: '<p>Сложные проценты часто называют самой мощной силой в личных финансах: в отличие от простых процентов, проценты каждого периода добавляются к основной сумме, поэтому будущие проценты рассчитываются на растущий баланс — что даёт ускоряющийся, экспоненциальный рост со временем.</p><p><b>Вкладчики и инвесторы</b> используют это, чтобы увидеть реальное долгосрочное влияние периодичности капитализации (ежемесячно против ежегодно) и временного горизонта — чем раньше вложены деньги, тем больше времени у капитализации, что часто важнее самой суммы взноса.</p>',
            key_points: [
                '<b>Экспоненциальный рост:</b> Проценты приносят проценты, поэтому рост ускоряется со временем, а не остаётся линейным.',
                '<b>Периодичность капитализации важна:</b> Более частая капитализация (ежемесячно против ежегодно) даёт немного большую итоговую сумму при той же номинальной ставке.',
                '<b>Время — главный рычаг:</b> Раннее начало имеет непропорционально большой эффект — долгий горизонт часто важнее большей суммы взноса.',
            ],
            howto: [
                { question: 'Сильно ли влияет более частая капитализация?', answer: '<p>Помогает, но эффект обычно скромный (процентный пункт или меньше за долгий период) по сравнению с влиянием самой ставки и, особенно, длительности инвестирования.</p>' },
                { question: 'Чем это отличается от калькулятора простых процентов?', answer: '<p>Простые проценты растут только на исходную сумму; здесь проценты каждого периода добавляются к балансу и сами начинают приносить проценты — в этом вся разница, и она накапливается на долгих горизонтах.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Начальная сумма', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Период', type: 'number', unit: 'лет', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Периодичность капитализации', type: 'select', options: [
                    { value: '1', label: 'Ежегодно' },
                    { value: '4', label: 'Ежеквартально' },
                    { value: '12', label: 'Ежемесячно' },
                    { value: '365', label: 'Ежедневно' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Итоговая сумма', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Полученный доход', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'salikto-procentu-kalkulators',
            title: 'Salikto Procentu Kalkulators',
            h1: 'Salikto Procentu Kalkulators',
            meta_title: 'Salikto Procentu Kalkulators | Gala Summa un Nopelnītie Procenti',
            meta_description: 'Aprēķiniet, kā jūsu nauda aug ar saliktiem procentiem, balstoties uz pamatsummu, likmi, laiku un kapitalizācijas biežumu.',
            short_answer: 'Šis kalkulators parāda, kā jūsu nauda aug ar saliktiem procentiem — procentiem, kas nopelnīti gan no jūsu sākotnējās pamatsummas, gan no jau nopelnītajiem procentiem — atkarībā no kapitalizācijas biežuma.',
            intro_text: '<p>Saliktie procenti bieži tiek saukti par visspēcīgāko spēku personīgajās finansēs: atšķirībā no vienkāršiem procentiem, katra perioda procenti tiek pievienoti pamatsummai, tāpēc turpmākie procenti tiek aprēķināti no augoša atlikuma — radot paātrinātu, eksponenciālu izaugsmi laika gaitā.</p><p><b>Krājēji un investori</b> to izmanto, lai redzētu reālo ilgtermiņa ietekmi no kapitalizācijas biežuma (ikmēneša pret ikgadēju) un laika horizonta — jo agrāk nauda tiek ieguldīta, jo vairāk laika ir kapitalizācijai, kas bieži ir svarīgāk par pašu iemaksas summu.</p>',
            key_points: [
                '<b>Eksponenciāla izaugsme:</b> Procenti nopelna procentus, tāpēc izaugsme laika gaitā paātrinās, nevis paliek lineāra.',
                '<b>Kapitalizācijas biežums ir svarīgs:</b> Biežāka kapitalizācija (ikmēneša pret ikgadēju) dod nedaudz lielāku gala summu pie tās pašas nominālās likmes.',
                '<b>Laiks ir lielākais svira:</b> Agrs sākums dod nesamērīgi lielu efektu — garāks laika horizonts bieži pārspēj lielāku iemaksas summu.',
            ],
            howto: [
                { question: 'Vai biežāka kapitalizācija dod lielu atšķirību?', answer: '<p>Tas palīdz, taču efekts parasti ir pieticīgs (procentpunkts vai mazāk ilgā periodā) salīdzinājumā ar pašas likmes un, jo īpaši, ieguldījuma perioda garuma ietekmi.</p>' },
                { question: 'Kā tas atšķiras no Vienkāršo Procentu Kalkulatora?', answer: '<p>Vienkāršie procenti aug tikai no sākotnējās pamatsummas; šeit katra perioda procenti tiek pievienoti atlikumam un paši sāk nopelnīt procentus — tā ir visa atšķirība, un tā uzkrājas garā laika periodā.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Sākuma Summa', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Laika Periods', type: 'number', unit: 'gadi', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Kapitalizācijas Biežums', type: 'select', options: [
                    { value: '1', label: 'Ik gadu' },
                    { value: '4', label: 'Ik ceturksni' },
                    { value: '12', label: 'Ik mēnesi' },
                    { value: '365', label: 'Ik dienu' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Gala Summa', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Nopelnītie Procenti', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-procentu-skladanego',
            title: 'Kalkulator Procentu Składanego',
            h1: 'Kalkulator Procentu Składanego',
            meta_title: 'Kalkulator Procentu Składanego | Suma Końcowa i Zarobione Odsetki',
            meta_description: 'Oblicz, jak rośnie twój kapitał dzięki procentowi składanemu, na podstawie kwoty głównej, stopy, czasu i częstotliwości kapitalizacji.',
            short_answer: 'Ten kalkulator pokazuje, jak rośnie twój kapitał dzięki procentowi składanemu — odsetkom naliczanym zarówno od pierwotnej kwoty głównej, jak i od już zarobionych odsetek — w zależności od częstotliwości kapitalizacji.',
            intro_text: '<p>Procent składany jest często nazywany najpotężniejszą siłą w finansach osobistych: w przeciwieństwie do procentu prostego, odsetki z każdego okresu są dodawane do kwoty głównej, więc przyszłe odsetki są naliczane od rosnącego salda — dając przyspieszający, wykładniczy wzrost w czasie.</p><p><b>Oszczędzający i inwestorzy</b> używają tego, aby zobaczyć rzeczywisty długoterminowy wpływ częstotliwości kapitalizacji (miesięcznej vs rocznej) i horyzontu czasowego — im wcześniej pieniądze są zainwestowane, tym więcej czasu ma kapitalizacja, co często jest ważniejsze niż sama kwota wpłaty.</p>',
            key_points: [
                '<b>Wzrost wykładniczy:</b> Odsetki zarabiają odsetki, więc wzrost przyspiesza w czasie zamiast pozostawać liniowy.',
                '<b>Częstotliwość kapitalizacji ma znaczenie:</b> Częstsza kapitalizacja (miesięczna vs roczna) daje nieco wyższą sumę końcową przy tej samej stopie nominalnej.',
                '<b>Czas to największa dźwignia:</b> Wczesny start ma nieproporcjonalnie duży wpływ — dłuższy horyzont czasowy często przewyższa wyższą kwotę wpłaty.',
            ],
            howto: [
                { question: 'Czy częstsza kapitalizacja robi dużą różnicę?', answer: '<p>Pomaga, ale efekt jest zwykle skromny (punkt procentowy lub mniej w długich okresach) w porównaniu z wpływem samej stopy procentowej i, zwłaszcza, długości okresu inwestycji.</p>' },
                { question: 'Czym to się różni od Kalkulatora Odsetek Prostych?', answer: '<p>Odsetki proste rosną tylko od pierwotnej kwoty głównej; tutaj odsetki z każdego okresu są dodawane do salda i same zaczynają zarabiać odsetki — to cała różnica, która kumuluje się w długich okresach.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Początkowa', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Okres Czasu', type: 'number', unit: 'lat', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Częstotliwość Kapitalizacji', type: 'select', options: [
                    { value: '1', label: 'Rocznie' },
                    { value: '4', label: 'Kwartalnie' },
                    { value: '12', label: 'Miesięcznie' },
                    { value: '365', label: 'Dziennie' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Suma Końcowa', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Zarobione Odsetki', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-interes-compuesto',
            title: 'Calculadora de Interés Compuesto',
            h1: 'Calculadora de Interés Compuesto',
            meta_title: 'Calculadora de Interés Compuesto | Monto Final e Interés Ganado',
            meta_description: 'Calcula cómo crece tu dinero con interés compuesto, según el capital, la tasa, el tiempo y la frecuencia de capitalización.',
            short_answer: 'Esta calculadora muestra cómo crece tu dinero con interés compuesto — interés ganado tanto sobre tu capital original como sobre los intereses ya generados — según tu frecuencia de capitalización.',
            intro_text: '<p>El interés compuesto suele llamarse la fuerza más poderosa en las finanzas personales: a diferencia del interés simple, el interés de cada período se añade al capital, por lo que el interés futuro se calcula sobre un saldo creciente — produciendo un crecimiento exponencial acelerado con el tiempo.</p><p><b>Ahorradores e inversores</b> usan esto para ver el impacto real a largo plazo de la frecuencia de capitalización (mensual vs. anual) y el horizonte temporal — cuanto antes se invierte el dinero, más tiempo tiene la capitalización para actuar, a menudo importando más que el monto de la aportación misma.</p>',
            key_points: [
                '<b>Crecimiento exponencial:</b> Los intereses generan intereses, por lo que el crecimiento se acelera con el tiempo en lugar de mantenerse lineal.',
                '<b>La frecuencia de capitalización importa:</b> Una capitalización más frecuente (mensual vs. anual) produce un monto final ligeramente mayor a la misma tasa nominal.',
                '<b>El tiempo es la palanca más grande:</b> Empezar temprano tiene un efecto desproporcionado — un horizonte temporal más largo suele superar una aportación mayor.',
            ],
            howto: [
                { question: '¿Una capitalización más frecuente marca una gran diferencia?', answer: '<p>Ayuda, pero el efecto suele ser modesto (un punto porcentual o menos en períodos largos) comparado con el impacto de la propia tasa de interés y, especialmente, la duración de la inversión.</p>' },
                { question: '¿En qué se diferencia esto de la Calculadora de Interés Simple?', answer: '<p>El interés simple solo crece sobre el capital original; aquí, el interés de cada período se añade al saldo y comienza a generar intereses por sí mismo — esa es toda la diferencia, y se acumula en horizontes largos.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto Inicial', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Período de Tiempo', type: 'number', unit: 'años', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Frecuencia de Capitalización', type: 'select', options: [
                    { value: '1', label: 'Anual' },
                    { value: '4', label: 'Trimestral' },
                    { value: '12', label: 'Mensual' },
                    { value: '365', label: 'Diaria' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Monto Final', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interés Ganado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-interet-compose',
            title: 'Calculateur d’Intérêt Composé',
            h1: 'Calculateur d’Intérêt Composé',
            meta_title: 'Calculateur d’Intérêt Composé | Montant Final et Intérêts Gagnés',
            meta_description: 'Calculez comment votre argent croît avec l’intérêt composé, selon le capital, le taux, le temps et la fréquence de capitalisation.',
            short_answer: 'Ce calculateur montre comment votre argent croît avec l’intérêt composé — intérêts gagnés à la fois sur votre capital initial et sur les intérêts déjà générés — selon votre fréquence de capitalisation.',
            intro_text: '<p>L’intérêt composé est souvent appelé la force la plus puissante en finance personnelle : contrairement à l’intérêt simple, l’intérêt de chaque période est ajouté au capital, donc les intérêts futurs sont calculés sur un solde croissant — produisant une croissance exponentielle accélérée avec le temps.</p><p><b>Épargnants et investisseurs</b> utilisent cela pour voir l’impact réel à long terme de la fréquence de capitalisation (mensuelle vs annuelle) et de l’horizon temporel — plus tôt l’argent est investi, plus la capitalisation a de temps pour agir, ce qui compte souvent plus que le montant de la contribution elle-même.</p>',
            key_points: [
                '<b>Croissance exponentielle :</b> Les intérêts génèrent des intérêts, donc la croissance s’accélère avec le temps plutôt que de rester linéaire.',
                '<b>La fréquence de capitalisation compte :</b> Une capitalisation plus fréquente (mensuelle vs annuelle) produit un montant final légèrement supérieur au même taux nominal.',
                '<b>Le temps est le plus grand levier :</b> Commencer tôt a un effet disproportionné — un horizon temporel plus long surpasse souvent une contribution plus élevée.',
            ],
            howto: [
                { question: 'Une capitalisation plus fréquente fait-elle une grande différence ?', answer: '<p>Cela aide, mais l’effet est généralement modeste (un point de pourcentage ou moins sur de longues périodes) comparé à l’impact du taux d’intérêt lui-même et, surtout, de la durée de l’investissement.</p>' },
                { question: 'En quoi cela diffère-t-il du Calculateur d’Intérêt Simple ?', answer: '<p>L’intérêt simple ne croît que sur le capital initial ; ici, l’intérêt de chaque période est ajouté au solde et génère lui-même des intérêts par la suite — c’est toute la différence, et elle s’accumule sur de longs horizons.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant Initial', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Période', type: 'number', unit: 'ans', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Fréquence de Capitalisation', type: 'select', options: [
                    { value: '1', label: 'Annuelle' },
                    { value: '4', label: 'Trimestrielle' },
                    { value: '12', label: 'Mensuelle' },
                    { value: '365', label: 'Quotidienne' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Montant Final', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Intérêts Gagnés', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-interesse-composto',
            title: 'Calcolatore di Interesse Composto',
            h1: 'Calcolatore di Interesse Composto',
            meta_title: 'Calcolatore Interesse Composto | Importo Finale e Interessi Maturati',
            meta_description: 'Calcola come cresce il tuo denaro con l’interesse composto, in base a capitale, tasso, tempo e frequenza di capitalizzazione.',
            short_answer: 'Questo calcolatore mostra come cresce il tuo denaro con l’interesse composto — interessi maturati sia sul tuo capitale originale che sugli interessi già guadagnati — in base alla frequenza di capitalizzazione.',
            intro_text: '<p>L’interesse composto è spesso chiamato la forza più potente della finanza personale: a differenza dell’interesse semplice, l’interesse di ogni periodo viene aggiunto al capitale, quindi gli interessi futuri vengono calcolati su un saldo crescente — producendo una crescita esponenziale che accelera nel tempo.</p><p><b>Risparmiatori e investitori</b> usano questo per vedere l’impatto reale a lungo termine della frequenza di capitalizzazione (mensile vs annuale) e dell’orizzonte temporale — prima si investe il denaro, più tempo ha la capitalizzazione per agire, spesso più importante dell’importo del contributo stesso.</p>',
            key_points: [
                '<b>Crescita esponenziale:</b> Gli interessi generano interessi, quindi la crescita accelera nel tempo invece di rimanere lineare.',
                '<b>La frequenza di capitalizzazione conta:</b> Una capitalizzazione più frequente (mensile vs annuale) produce un importo finale leggermente superiore allo stesso tasso nominale.',
                '<b>Il tempo è la leva più grande:</b> Iniziare presto ha un effetto sproporzionato — un orizzonte temporale più lungo spesso supera un contributo maggiore.',
            ],
            howto: [
                { question: 'Una capitalizzazione più frequente fa una grande differenza?', answer: '<p>Aiuta, ma l’effetto è di solito modesto (un punto percentuale o meno su periodi lunghi) rispetto all’impatto del tasso di interesse stesso e, soprattutto, della durata dell’investimento.</p>' },
                { question: 'In cosa differisce dal Calcolatore di Interesse Semplice?', answer: '<p>L’interesse semplice cresce solo sul capitale originale; qui, l’interesse di ogni periodo viene aggiunto al saldo e inizia a sua volta a generare interessi — questa è tutta la differenza, e si accumula su orizzonti lunghi.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo Iniziale', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Periodo di Tempo', type: 'number', unit: 'anni', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Frequenza di Capitalizzazione', type: 'select', options: [
                    { value: '1', label: 'Annuale' },
                    { value: '4', label: 'Trimestrale' },
                    { value: '12', label: 'Mensile' },
                    { value: '365', label: 'Giornaliera' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Importo Finale', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interessi Maturati', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'zinseszins-rechner',
            title: 'Zinseszins-Rechner',
            h1: 'Zinseszins-Rechner',
            meta_title: 'Zinseszins-Rechner | Endbetrag und Verdiente Zinsen',
            meta_description: 'Berechnen Sie, wie Ihr Geld mit Zinseszins wächst, basierend auf Kapital, Zinssatz, Zeit und Zinsperiode (monatlich, jährlich usw.).',
            short_answer: 'Dieser Rechner zeigt, wie Ihr Geld mit Zinseszins wächst — Zinsen, die sowohl auf Ihr ursprüngliches Kapital als auch auf bereits verdiente Zinsen berechnet werden — basierend auf Ihrer Zinsperiode.',
            intro_text: '<p>Zinseszins wird oft als die mächtigste Kraft in der persönlichen Finanzplanung bezeichnet: Im Gegensatz zu einfachen Zinsen wird der Zins jeder Periode zum Kapital hinzugefügt, sodass zukünftige Zinsen auf einem wachsenden Saldo berechnet werden — was zu beschleunigtem, exponentiellem Wachstum über die Zeit führt.</p><p><b>Sparer und Anleger</b> nutzen dies, um die reale langfristige Auswirkung der Zinsperiode (monatlich vs. jährlich) und des Zeithorizonts zu sehen — je früher Geld investiert wird, desto mehr Zeit hat der Zinseszins zu wirken, was oft wichtiger ist als der Beitragsbetrag selbst.</p>',
            key_points: [
                '<b>Exponentielles Wachstum:</b> Zinsen erzielen Zinsen, sodass das Wachstum über die Zeit beschleunigt statt linear zu bleiben.',
                '<b>Zinsperiode ist wichtig:</b> Häufigere Verzinsung (monatlich vs. jährlich) führt bei gleichem Nominalzins zu einem etwas höheren Endbetrag.',
                '<b>Zeit ist der größte Hebel:</b> Früh anzufangen hat einen überproportional großen Effekt — ein längerer Zeithorizont übertrifft oft einen höheren Beitrag.',
            ],
            howto: [
                { question: 'Macht häufigere Verzinsung einen großen Unterschied?', answer: '<p>Es hilft, aber der Effekt ist über lange Zeiträume meist bescheiden (ein Prozentpunkt oder weniger) im Vergleich zur Auswirkung des Zinssatzes selbst und besonders der Anlagedauer.</p>' },
                { question: 'Wie unterscheidet sich das vom einfachen Zinsrechner?', answer: '<p>Einfache Zinsen wachsen nur auf dem ursprünglichen Kapital; hier wird der Zins jeder Periode zum Saldo hinzugefügt und erzielt selbst weitere Zinsen — das ist der gesamte Unterschied, und er summiert sich über lange Zeithorizonte.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Anfangsbetrag', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Zeitraum', type: 'number', unit: 'Jahre', min: 0, max: 100, placeholder: '10' },
                { name: 'compounds_per_year', label: 'Zinsperiode', type: 'select', options: [
                    { value: '1', label: 'Jährlich' },
                    { value: '4', label: 'Vierteljährlich' },
                    { value: '12', label: 'Monatlich' },
                    { value: '365', label: 'Täglich' },
                ] },
            ],
            outputs: [
                { name: 'final_amount', label: 'Endbetrag', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Verdiente Zinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1018: Debt-to-Income Ratio Calculator
// ============================================================
const dti: ToolDef = {
    id: '1018',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'monthly_debt', default: 2000 },
            { key: 'monthly_income', default: 6000 },
        ],
        formulas: {
            dti_ratio: 'monthly_debt/monthly_income*100',
        },
        outputs: [{ key: 'dti_ratio', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'debt-to-income-ratio-calculator',
            title: 'Debt-to-Income (DTI) Ratio Calculator',
            h1: 'Debt-to-Income Ratio Calculator',
            meta_title: 'Debt-to-Income Ratio Calculator | DTI for Mortgage Approval',
            meta_description: 'Calculate your debt-to-income (DTI) ratio — the percentage of your gross monthly income that goes to debt payments — a key number lenders use for loan approval.',
            short_answer: 'This calculator computes your debt-to-income (DTI) ratio — the percentage of your gross monthly income that goes toward debt payments — one of the most important numbers lenders check before approving a loan.',
            intro_text: '<p>Debt-to-income ratio compares your total monthly debt payments (loans, credit cards, car payments — not including everyday living expenses) to your gross monthly income. Lenders use this ratio, alongside credit score, as a primary factor in mortgage and loan approval decisions.</p><p><b>Most mortgage lenders</b> look for a DTI below 36-43% depending on the loan type, with lower ratios qualifying for better rates; a high DTI signals to lenders that a large share of income is already committed to debt, increasing perceived lending risk.</p>',
            key_points: [
                '<b>Gross Income, Not Net:</b> DTI is calculated on gross (pre-tax) monthly income, not your take-home pay.',
                '<b>Debt Payments Only:</b> Includes loan/credit card/car payments — not groceries, utilities, or other living expenses.',
                '<b>Lender Thresholds:</b> Conventional mortgages typically want DTI below 36-43%; higher ratios may require a larger down payment or higher interest rate.',
            ],
            howto: [
                { question: 'What counts as "debt" in this calculation?', answer: '<p>Minimum monthly payments on loans, credit cards, car payments, student loans, and any other debt with a required monthly payment — not rent (unless applying for a mortgage, where it may be included differently) or everyday expenses.</p>' },
                { question: 'How can I lower my DTI?', answer: '<p>Pay down existing debt balances, avoid taking on new debt before a major loan application, or increase your income — any of these directly improves the ratio lenders see.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Total Monthly Debt Payments', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Gross Monthly Income', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Debt-to-Income Ratio', unit: '%', precision: 1 }],
        },
        ru: {
            slug: 'kalkulyator-otnosheniya-dolga-k-dohodu',
            title: 'Калькулятор отношения долга к доходу (DTI)',
            h1: 'Калькулятор отношения долга к доходу',
            meta_title: 'Калькулятор DTI | Отношение долга к доходу для одобрения кредита',
            meta_description: 'Рассчитайте отношение долга к доходу (DTI) — долю вашего валового месячного дохода, идущую на выплату долгов — ключевой показатель для одобрения кредита.',
            short_answer: 'Этот калькулятор вычисляет отношение долга к доходу (DTI) — долю вашего валового месячного дохода, идущую на выплату долгов — один из важнейших показателей, которые банки проверяют перед одобрением кредита.',
            intro_text: '<p>Отношение долга к доходу сравнивает общие ежемесячные выплаты по долгам (кредиты, кредитные карты, автокредиты — без учёта повседневных расходов) с валовым месячным доходом. Банки используют этот показатель наряду с кредитным рейтингом как основной фактор при одобрении ипотеки и кредитов.</p><p><b>Большинство ипотечных банков</b> ищут DTI ниже 36-43% в зависимости от типа кредита, с более низкими показателями для лучших ставок; высокий DTI сигнализирует банку, что значительная доля дохода уже занята долгами, повышая воспринимаемый риск кредитования.</p>',
            key_points: [
                '<b>Валовой, а не чистый доход:</b> DTI рассчитывается на основе валового (до налогов) месячного дохода, а не суммы на руки.',
                '<b>Только выплаты по долгам:</b> Включает платежи по кредитам/картам/авто — не продукты, коммунальные услуги и другие расходы.',
                '<b>Пороги банков:</b> Стандартные ипотеки обычно требуют DTI ниже 36-43%; более высокий показатель может потребовать больший взнос или более высокую ставку.',
            ],
            howto: [
                { question: 'Что считается «долгом» в этом расчёте?', answer: '<p>Минимальные ежемесячные платежи по кредитам, кредитным картам, автокредитам, студенческим займам и любым другим долгам с обязательным ежемесячным платежом — не аренда жилья или повседневные расходы.</p>' },
                { question: 'Как снизить свой DTI?', answer: '<p>Погасите существующие долги, избегайте новых долгов перед крупной заявкой на кредит или увеличьте доход — любое из этого напрямую улучшает показатель, который видит банк.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Общие ежемесячные выплаты по долгам', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Валовой месячный доход', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Отношение долга к доходу', unit: '%', precision: 1 }],
        },
        lv: {
            slug: 'paradu-ienakumu-attiecibas-kalkulators',
            title: 'Parādu-Ienākumu Attiecības (DTI) Kalkulators',
            h1: 'Parādu-Ienākumu Attiecības Kalkulators',
            meta_title: 'DTI Kalkulators | Parādu-Ienākumu Attiecība Kredīta Apstiprināšanai',
            meta_description: 'Aprēķiniet savu parādu-ienākumu attiecību (DTI) — daļu no jūsu bruto mēneša ienākumiem, kas iet parādu maksājumiem — galveno rādītāju kredīta apstiprināšanai.',
            short_answer: 'Šis kalkulators aprēķina jūsu parādu-ienākumu attiecību (DTI) — daļu no jūsu bruto mēneša ienākumiem, kas iet parādu maksājumiem — vienu no svarīgākajiem rādītājiem, ko aizdevēji pārbauda pirms kredīta apstiprināšanas.',
            intro_text: '<p>Parādu-ienākumu attiecība salīdzina jūsu kopējos ikmēneša parādu maksājumus (kredīti, kredītkartes, auto maksājumi — neietverot ikdienas dzīves izdevumus) ar bruto mēneša ienākumiem. Aizdevēji izmanto šo rādītāju kopā ar kredītvēsturi kā galveno faktoru hipotēkas un kredīta apstiprināšanas lēmumos.</p><p><b>Lielākā daļa hipotēku aizdevēju</b> meklē DTI zem 36-43%, atkarībā no kredīta veida, ar zemākām attiecībām kvalificējoties labākām likmēm; augsts DTI signalizē aizdevējam, ka liela ienākumu daļa jau ir saistīta ar parādiem, palielinot uztverto kreditēšanas risku.</p>',
            key_points: [
                '<b>Bruto, ne neto ienākumi:</b> DTI tiek aprēķināts no bruto (pirms nodokļiem) mēneša ienākumiem, nevis no summas rokā.',
                '<b>Tikai parādu maksājumi:</b> Ietver kredītu/karšu/auto maksājumus — ne pārtiku, komunālos pakalpojumus vai citus dzīves izdevumus.',
                '<b>Aizdevēju sliekšņi:</b> Standarta hipotēkas parasti vēlas DTI zem 36-43%; augstāka attiecība var pieprasīt lielāku iemaksu vai augstāku likmi.',
            ],
            howto: [
                { question: 'Kas tiek uzskatīts par "parādu" šajā aprēķinā?', answer: '<p>Minimālie ikmēneša maksājumi par kredītiem, kredītkartēm, auto kredītiem, studiju kredītiem un jebkuru citu parādu ar obligātu ikmēneša maksājumu — ne īre vai ikdienas izdevumi.</p>' },
                { question: 'Kā samazināt savu DTI?', answer: '<p>Nomaksājiet esošos parādus, izvairieties no jauniem parādiem pirms lielas kredīta pieteikuma, vai palieliniet ienākumus — jebkurš no tiem tieši uzlabo aizdevēja redzēto rādītāju.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Kopējie Ikmēneša Parādu Maksājumi', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Bruto Mēneša Ienākumi', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Parādu-Ienākumu Attiecība', unit: '%', precision: 1 }],
        },
        pl: {
            slug: 'kalkulator-wskaznika-dti',
            title: 'Kalkulator Wskaźnika Zadłużenia do Dochodu (DTI)',
            h1: 'Kalkulator Wskaźnika Zadłużenia do Dochodu',
            meta_title: 'Kalkulator DTI | Wskaźnik Zadłużenia do Dochodu przy Kredycie',
            meta_description: 'Oblicz wskaźnik zadłużenia do dochodu (DTI) — procent twojego dochodu brutto przeznaczony na spłatę długów — kluczowy wskaźnik przy zatwierdzaniu kredytu.',
            short_answer: 'Ten kalkulator oblicza twój wskaźnik zadłużenia do dochodu (DTI) — procent twojego miesięcznego dochodu brutto przeznaczony na spłatę długów — jeden z najważniejszych wskaźników sprawdzanych przez banki przed zatwierdzeniem kredytu.',
            intro_text: '<p>Wskaźnik zadłużenia do dochodu porównuje twoje całkowite miesięczne spłaty długów (kredyty, karty kredytowe, raty samochodowe — bez codziennych wydatków życiowych) z miesięcznym dochodem brutto. Banki wykorzystują ten wskaźnik obok historii kredytowej jako główny czynnik przy decyzjach o zatwierdzeniu kredytu hipotecznego i innych.</p><p><b>Większość banków hipotecznych</b> szuka DTI poniżej 36-43%, w zależności od rodzaju kredytu, przy czym niższe wskaźniki kwalifikują się do lepszych stóp; wysoki DTI sygnalizuje bankowi, że duża część dochodu jest już zaangażowana w długi, zwiększając postrzegane ryzyko kredytowe.</p>',
            key_points: [
                '<b>Dochód brutto, nie netto:</b> DTI jest obliczany na podstawie miesięcznego dochodu brutto (przed opodatkowaniem), a nie kwoty na rękę.',
                '<b>Tylko spłaty długów:</b> Obejmuje płatności kredytów/kart/rat samochodowych — nie żywność, media czy inne wydatki życiowe.',
                '<b>Progi banków:</b> Standardowe kredyty hipoteczne zazwyczaj wymagają DTI poniżej 36-43%; wyższy wskaźnik może wymagać większego wkładu własnego lub wyższego oprocentowania.',
            ],
            howto: [
                { question: 'Co liczy się jako "dług" w tym obliczeniu?', answer: '<p>Minimalne miesięczne płatności kredytów, kart kredytowych, rat samochodowych, kredytów studenckich i innych długów z obowiązkową miesięczną płatnością — nie czynsz ani codzienne wydatki.</p>' },
                { question: 'Jak obniżyć swój DTI?', answer: '<p>Spłać istniejące zadłużenie, unikaj zaciągania nowych długów przed większym wnioskiem kredytowym lub zwiększ dochód — każde z tych działań bezpośrednio poprawia wskaźnik widziany przez bank.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Całkowite Miesięczne Spłaty Długów', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Miesięczny Dochód Brutto', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Wskaźnik Zadłużenia do Dochodu', unit: '%', precision: 1 }],
        },
        es: {
            slug: 'calculadora-relacion-deuda-ingresos',
            title: 'Calculadora de Relación Deuda-Ingresos (DTI)',
            h1: 'Calculadora de Relación Deuda-Ingresos',
            meta_title: 'Calculadora DTI | Relación Deuda-Ingresos para Aprobación de Préstamo',
            meta_description: 'Calcula tu relación deuda-ingresos (DTI) — el porcentaje de tu ingreso mensual bruto destinado a pagos de deuda — clave para la aprobación de préstamos.',
            short_answer: 'Esta calculadora calcula tu relación deuda-ingresos (DTI) — el porcentaje de tu ingreso mensual bruto destinado a pagos de deuda — uno de los números más importantes que los prestamistas verifican antes de aprobar un préstamo.',
            intro_text: '<p>La relación deuda-ingresos compara tus pagos de deuda mensuales totales (préstamos, tarjetas de crédito, pagos de auto — sin incluir gastos de vida diarios) con tu ingreso mensual bruto. Los prestamistas usan esta relación, junto con el puntaje crediticio, como factor principal en las decisiones de aprobación de hipotecas y préstamos.</p><p><b>La mayoría de los prestamistas hipotecarios</b> buscan un DTI por debajo del 36-43% según el tipo de préstamo, con relaciones más bajas calificando para mejores tasas; un DTI alto indica al prestamista que una gran parte del ingreso ya está comprometida con deudas, aumentando el riesgo percibido.</p>',
            key_points: [
                '<b>Ingreso bruto, no neto:</b> El DTI se calcula sobre el ingreso mensual bruto (antes de impuestos), no sobre tu salario neto.',
                '<b>Solo pagos de deuda:</b> Incluye pagos de préstamos/tarjetas/auto — no comestibles, servicios públicos u otros gastos de vida.',
                '<b>Umbrales de prestamistas:</b> Las hipotecas convencionales suelen requerir un DTI por debajo del 36-43%; una relación más alta puede requerir un pago inicial mayor o una tasa de interés más alta.',
            ],
            howto: [
                { question: '¿Qué cuenta como "deuda" en este cálculo?', answer: '<p>Pagos mensuales mínimos de préstamos, tarjetas de crédito, pagos de auto, préstamos estudiantiles y cualquier otra deuda con un pago mensual obligatorio — no el alquiler ni los gastos cotidianos.</p>' },
                { question: '¿Cómo puedo reducir mi DTI?', answer: '<p>Paga saldos de deuda existentes, evita adquirir nueva deuda antes de una solicitud de préstamo importante, o aumenta tus ingresos — cualquiera de estos mejora directamente la relación que ven los prestamistas.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Pagos Mensuales Totales de Deuda', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Ingreso Mensual Bruto', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Relación Deuda-Ingresos', unit: '%', precision: 1 }],
        },
        fr: {
            slug: 'calculateur-ratio-dette-revenu',
            title: 'Calculateur de Ratio Dette-Revenu (DTI)',
            h1: 'Calculateur de Ratio Dette-Revenu',
            meta_title: 'Calculateur DTI | Ratio Dette-Revenu pour Approbation de Prêt',
            meta_description: 'Calculez votre ratio dette-revenu (DTI) — le pourcentage de votre revenu mensuel brut consacré aux paiements de dette — un chiffre clé pour l’approbation de prêt.',
            short_answer: 'Ce calculateur calcule votre ratio dette-revenu (DTI) — le pourcentage de votre revenu mensuel brut consacré aux paiements de dette — l’un des chiffres les plus importants que les prêteurs vérifient avant d’approuver un prêt.',
            intro_text: '<p>Le ratio dette-revenu compare vos paiements de dette mensuels totaux (prêts, cartes de crédit, paiements automobiles — hors dépenses de vie courante) à votre revenu mensuel brut. Les prêteurs utilisent ce ratio, avec le pointage de crédit, comme facteur principal dans les décisions d’approbation de prêt hypothécaire et autres.</p><p><b>La plupart des prêteurs hypothécaires</b> recherchent un DTI inférieur à 36-43 % selon le type de prêt, les ratios plus bas se qualifiant pour de meilleurs taux ; un DTI élevé signale au prêteur qu’une grande part du revenu est déjà engagée dans la dette, augmentant le risque perçu.</p>',
            key_points: [
                '<b>Revenu brut, pas net :</b> Le DTI est calculé sur le revenu mensuel brut (avant impôts), pas sur votre salaire net.',
                '<b>Paiements de dette uniquement :</b> Inclut les paiements de prêts/cartes/auto — pas l’épicerie, les services publics ou autres dépenses de vie.',
                '<b>Seuils des prêteurs :</b> Les prêts hypothécaires conventionnels exigent généralement un DTI inférieur à 36-43 % ; un ratio plus élevé peut nécessiter un apport plus important ou un taux d’intérêt plus élevé.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte comme "dette" dans ce calcul ?', answer: '<p>Les paiements mensuels minimums des prêts, cartes de crédit, paiements auto, prêts étudiants et toute autre dette avec un paiement mensuel obligatoire — pas le loyer ni les dépenses courantes.</p>' },
                { question: 'Comment puis-je réduire mon DTI ?', answer: '<p>Remboursez les soldes de dette existants, évitez de contracter de nouvelles dettes avant une grande demande de prêt, ou augmentez vos revenus — chacune de ces actions améliore directement le ratio vu par les prêteurs.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Paiements de Dette Mensuels Totaux', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Revenu Mensuel Brut', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Ratio Dette-Revenu', unit: '%', precision: 1 }],
        },
        it: {
            slug: 'calcolatore-rapporto-debito-reddito',
            title: 'Calcolatore Rapporto Debito-Reddito (DTI)',
            h1: 'Calcolatore Rapporto Debito-Reddito',
            meta_title: 'Calcolatore DTI | Rapporto Debito-Reddito per Approvazione Prestito',
            meta_description: 'Calcola il tuo rapporto debito-reddito (DTI) — la percentuale del tuo reddito mensile lordo destinata ai pagamenti del debito — chiave per l’approvazione del prestito.',
            short_answer: 'Questo calcolatore calcola il tuo rapporto debito-reddito (DTI) — la percentuale del tuo reddito mensile lordo destinata ai pagamenti del debito — uno dei numeri più importanti che i prestatori controllano prima di approvare un prestito.',
            intro_text: '<p>Il rapporto debito-reddito confronta i tuoi pagamenti mensili totali del debito (prestiti, carte di credito, rate auto — escluse le spese di vita quotidiana) con il tuo reddito mensile lordo. I prestatori usano questo rapporto, insieme al punteggio di credito, come fattore principale nelle decisioni di approvazione di mutui e prestiti.</p><p><b>La maggior parte dei mutuanti</b> cerca un DTI inferiore al 36-43% a seconda del tipo di prestito, con rapporti più bassi che si qualificano per tassi migliori; un DTI alto segnala al prestatore che una grande parte del reddito è già impegnata nel debito, aumentando il rischio percepito.</p>',
            key_points: [
                '<b>Reddito lordo, non netto:</b> Il DTI è calcolato sul reddito mensile lordo (prima delle tasse), non sullo stipendio netto.',
                '<b>Solo pagamenti del debito:</b> Include pagamenti di prestiti/carte/auto — non generi alimentari, utenze o altre spese di vita.',
                '<b>Soglie dei prestatori:</b> I mutui convenzionali richiedono tipicamente un DTI inferiore al 36-43%; un rapporto più alto può richiedere un anticipo maggiore o un tasso di interesse più alto.',
            ],
            howto: [
                { question: 'Cosa conta come "debito" in questo calcolo?', answer: '<p>Pagamenti mensili minimi di prestiti, carte di credito, rate auto, prestiti studenteschi e qualsiasi altro debito con un pagamento mensile obbligatorio — non l’affitto o le spese quotidiane.</p>' },
                { question: 'Come posso abbassare il mio DTI?', answer: '<p>Ripaga i saldi di debito esistenti, evita di contrarre nuovi debiti prima di una grande richiesta di prestito, o aumenta il tuo reddito — ognuna di queste azioni migliora direttamente il rapporto visto dai prestatori.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Pagamenti Mensili Totali del Debito', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Reddito Mensile Lordo', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Rapporto Debito-Reddito', unit: '%', precision: 1 }],
        },
        de: {
            slug: 'schulden-einkommens-verhaeltnis-rechner',
            title: 'Schulden-Einkommens-Verhältnis (DTI) Rechner',
            h1: 'Schulden-Einkommens-Verhältnis-Rechner',
            meta_title: 'DTI-Rechner | Schulden-Einkommens-Verhältnis für Kreditgenehmigung',
            meta_description: 'Berechnen Sie Ihr Schulden-Einkommens-Verhältnis (DTI) — den Prozentsatz Ihres monatlichen Bruttoeinkommens für Schuldenzahlungen — wichtig für Kreditgenehmigungen.',
            short_answer: 'Dieser Rechner berechnet Ihr Schulden-Einkommens-Verhältnis (DTI) — den Prozentsatz Ihres monatlichen Bruttoeinkommens, der für Schuldenzahlungen verwendet wird — eine der wichtigsten Zahlen, die Kreditgeber vor einer Kreditgenehmigung prüfen.',
            intro_text: '<p>Das Schulden-Einkommens-Verhältnis vergleicht Ihre gesamten monatlichen Schuldenzahlungen (Kredite, Kreditkarten, Autoraten — ohne alltägliche Lebenshaltungskosten) mit Ihrem monatlichen Bruttoeinkommen. Kreditgeber nutzen dieses Verhältnis neben der Bonität als Hauptfaktor bei Hypotheken- und Kreditgenehmigungsentscheidungen.</p><p><b>Die meisten Hypothekengeber</b> suchen ein DTI unter 36-43 %, je nach Kreditart, wobei niedrigere Verhältnisse für bessere Zinssätze qualifizieren; ein hohes DTI signalisiert dem Kreditgeber, dass ein großer Teil des Einkommens bereits für Schulden gebunden ist, was das wahrgenommene Kreditrisiko erhöht.</p>',
            key_points: [
                '<b>Bruttoeinkommen, nicht netto:</b> Das DTI wird auf Basis des monatlichen Bruttoeinkommens (vor Steuern) berechnet, nicht Ihres Nettogehalts.',
                '<b>Nur Schuldenzahlungen:</b> Umfasst Kredit-/Kreditkarten-/Autoratenzahlungen — nicht Lebensmittel, Nebenkosten oder andere Lebenshaltungskosten.',
                '<b>Schwellenwerte der Kreditgeber:</b> Konventionelle Hypotheken erfordern in der Regel ein DTI unter 36-43 %; ein höheres Verhältnis kann eine größere Anzahlung oder einen höheren Zinssatz erfordern.',
            ],
            howto: [
                { question: 'Was zählt bei dieser Berechnung als "Schulden"?', answer: '<p>Mindestmonatszahlungen für Kredite, Kreditkarten, Autoraten, Studienkredite und andere Schulden mit erforderlicher monatlicher Zahlung — nicht Miete oder alltägliche Ausgaben.</p>' },
                { question: 'Wie kann ich mein DTI senken?', answer: '<p>Zahlen Sie bestehende Schuldensalden ab, vermeiden Sie neue Schulden vor einem größeren Kreditantrag, oder erhöhen Sie Ihr Einkommen — jede dieser Maßnahmen verbessert direkt das von Kreditgebern gesehene Verhältnis.</p>' },
            ],
            inputs: [
                { name: 'monthly_debt', label: 'Gesamte Monatliche Schuldenzahlungen', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '2000' },
                { name: 'monthly_income', label: 'Monatliches Bruttoeinkommen', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '6000' },
            ],
            outputs: [{ name: 'dti_ratio', label: 'Schulden-Einkommens-Verhältnis', unit: '%', precision: 1 }],
        },
    },
}

// ============================================================
// 1019: Loan-to-Value (LTV) Ratio Calculator
// ============================================================
const ltv: ToolDef = {
    id: '1019',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'loan_amount', default: 270000 },
            { key: 'property_value', default: 300000 },
        ],
        formulas: {
            ltv_ratio: 'loan_amount/property_value*100',
        },
        outputs: [{ key: 'ltv_ratio', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'loan-to-value-ltv-ratio-calculator',
            title: 'Loan-to-Value (LTV) Ratio Calculator',
            h1: 'Loan-to-Value (LTV) Ratio Calculator',
            meta_title: 'LTV Calculator | Loan-to-Value Ratio for Mortgages',
            meta_description: 'Calculate your loan-to-value (LTV) ratio — the loan amount as a percentage of property value — used by lenders to assess mortgage risk and PMI requirements.',
            short_answer: 'This calculator computes your loan-to-value (LTV) ratio — your loan amount as a percentage of the property\'s value — a key figure lenders use to assess risk and determine whether private mortgage insurance is required.',
            intro_text: '<p>Loan-to-value ratio compares how much you\'re borrowing against how much the property is worth. A lower LTV means you have more equity (or a bigger down payment) in the property, which lenders view as lower risk since there\'s a larger cushion before the loan exceeds the property\'s value.</p><p><b>Mortgage lenders</b> typically require private mortgage insurance (PMI) when LTV exceeds 80% (i.e., down payment under 20%), and LTV also affects refinancing eligibility and the interest rate offered on new loans.</p>',
            key_points: [
                '<b>80% LTV Threshold:</b> Below 80% LTV (20%+ down payment) typically avoids private mortgage insurance on conventional loans.',
                '<b>Lower LTV = Lower Risk:</b> Lenders see lower LTV as safer, often resulting in better interest rates.',
                '<b>Used for Refinancing Too:</b> LTV also determines eligibility and terms when refinancing an existing mortgage.',
            ],
            howto: [
                { question: 'What LTV do I need to avoid PMI?', answer: '<p>Generally 80% or below (meaning at least a 20% down payment) avoids private mortgage insurance on a conventional loan, though specific requirements vary by lender and loan type.</p>' },
                { question: 'Does LTV change over time?', answer: '<p>Yes — as you pay down the loan principal and/or the property value changes, your LTV changes too, which is why some homeowners request PMI removal once their LTV drops below 80%.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Loan Amount', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Property Value', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Loan-to-Value Ratio', unit: '%', precision: 1 }],
        },
        ru: {
            slug: 'kalkulyator-otnosheniya-kredit-k-stoimosti-ltv',
            title: 'Калькулятор отношения кредита к стоимости (LTV)',
            h1: 'Калькулятор отношения кредита к стоимости (LTV)',
            meta_title: 'Калькулятор LTV | Отношение кредита к стоимости для ипотеки',
            meta_description: 'Рассчитайте отношение кредита к стоимости (LTV) — сумму кредита в процентах от стоимости недвижимости — используется банками для оценки риска ипотеки.',
            short_answer: 'Этот калькулятор вычисляет отношение кредита к стоимости (LTV) — сумму кредита в процентах от стоимости недвижимости — ключевой показатель, который банки используют для оценки риска и необходимости страхования ипотеки.',
            intro_text: '<p>Отношение кредита к стоимости сравнивает, сколько вы занимаете, с тем, сколько стоит недвижимость. Более низкий LTV означает больше собственного капитала (или больший первоначальный взнос) в недвижимости, что банки считают меньшим риском.</p><p><b>Ипотечные банки</b> обычно требуют страхование ипотеки (PMI), когда LTV превышает 80% (то есть взнос менее 20%), а LTV также влияет на возможность рефинансирования и предлагаемую ставку по новым кредитам.</p>',
            key_points: [
                '<b>Порог LTV 80%:</b> Ниже 80% LTV (взнос от 20%) обычно позволяет избежать страхования ипотеки по стандартным кредитам.',
                '<b>Ниже LTV = ниже риск:</b> Банки считают более низкий LTV безопаснее, что часто даёт лучшие ставки.',
                '<b>Используется и для рефинансирования:</b> LTV также определяет право на рефинансирование существующей ипотеки и его условия.',
            ],
            howto: [
                { question: 'Какой LTV нужен, чтобы избежать страхования ипотеки?', answer: '<p>Как правило, 80% или ниже (то есть взнос от 20%) позволяет избежать страхования по стандартному кредиту, хотя конкретные требования зависят от банка.</p>' },
                { question: 'Меняется ли LTV со временем?', answer: '<p>Да — по мере погашения основного долга и/или изменения стоимости недвижимости LTV меняется, поэтому некоторые заёмщики просят отменить страхование, когда LTV опускается ниже 80%.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Сумма кредита', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Стоимость недвижимости', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Отношение кредита к стоимости', unit: '%', precision: 1 }],
        },
        lv: {
            slug: 'aizdevuma-vertibas-attiecibas-ltv-kalkulators',
            title: 'Aizdevuma-Vērtības (LTV) Attiecības Kalkulators',
            h1: 'Aizdevuma-Vērtības (LTV) Attiecības Kalkulators',
            meta_title: 'LTV Kalkulators | Aizdevuma-Vērtības Attiecība Hipotēkām',
            meta_description: 'Aprēķiniet aizdevuma-vērtības (LTV) attiecību — aizdevuma summu procentos no īpašuma vērtības — ko aizdevēji izmanto riska novērtēšanai.',
            short_answer: 'Šis kalkulators aprēķina jūsu aizdevuma-vērtības (LTV) attiecību — aizdevuma summu procentos no īpašuma vērtības — galveno rādītāju, ko aizdevēji izmanto riska novērtēšanai un hipotēkas apdrošināšanas nepieciešamības noteikšanai.',
            intro_text: '<p>Aizdevuma-vērtības attiecība salīdzina to, cik daudz jūs aizņematies, ar to, cik daudz īpašums ir vērts. Zemāka LTV nozīmē vairāk pašu kapitāla (vai lielāku sākotnējo iemaksu) īpašumā, ko aizdevēji uzskata par zemāku risku.</p><p><b>Hipotēku aizdevēji</b> parasti pieprasa hipotēkas apdrošināšanu (PMI), kad LTV pārsniedz 80% (t.i., iemaksa zem 20%), un LTV ietekmē arī refinansēšanas iespējas un piedāvāto likmi jauniem aizdevumiem.</p>',
            key_points: [
                '<b>80% LTV slieksnis:</b> Zem 80% LTV (20%+ iemaksa) parasti ļauj izvairīties no hipotēkas apdrošināšanas standarta aizdevumiem.',
                '<b>Zemāks LTV = zemāks risks:</b> Aizdevēji zemāku LTV uzskata par drošāku, bieži nodrošinot labākas likmes.',
                '<b>Izmanto arī refinansēšanai:</b> LTV nosaka arī tiesības un nosacījumus esošas hipotēkas refinansēšanai.',
            ],
            howto: [
                { question: 'Kāda LTV nepieciešama, lai izvairītos no PMI?', answer: '<p>Parasti 80% vai zemāka (t.i., vismaz 20% iemaksa) ļauj izvairīties no hipotēkas apdrošināšanas standarta aizdevumam, lai gan konkrētās prasības atšķiras atkarībā no aizdevēja.</p>' },
                { question: 'Vai LTV mainās laika gaitā?', answer: '<p>Jā — atmaksājot pamatsummu un/vai mainoties īpašuma vērtībai, mainās arī LTV, tāpēc daži īpašnieki lūdz atcelt PMI, kad LTV nokrītas zem 80%.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Aizdevuma Summa', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Īpašuma Vērtība', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Aizdevuma-Vērtības Attiecība', unit: '%', precision: 1 }],
        },
        pl: {
            slug: 'kalkulator-wskaznika-ltv',
            title: 'Kalkulator Wskaźnika Kredytu do Wartości (LTV)',
            h1: 'Kalkulator Wskaźnika LTV',
            meta_title: 'Kalkulator LTV | Wskaźnik Kredytu do Wartości dla Hipotek',
            meta_description: 'Oblicz wskaźnik kredytu do wartości (LTV) — kwotę kredytu jako procent wartości nieruchomości — używany przez banki do oceny ryzyka hipotecznego.',
            short_answer: 'Ten kalkulator oblicza twój wskaźnik kredytu do wartości (LTV) — kwotę kredytu jako procent wartości nieruchomości — kluczową liczbę, którą banki wykorzystują do oceny ryzyka i wymogu ubezpieczenia kredytu hipotecznego.',
            intro_text: '<p>Wskaźnik kredytu do wartości porównuje, ile pożyczasz, z tym, ile jest warta nieruchomość. Niższy LTV oznacza więcej kapitału własnego (lub większy wkład własny) w nieruchomości, co banki postrzegają jako niższe ryzyko.</p><p><b>Banki hipoteczne</b> zazwyczaj wymagają prywatnego ubezpieczenia kredytu hipotecznego (PMI), gdy LTV przekracza 80% (czyli wkład poniżej 20%), a LTV wpływa również na możliwość refinansowania i oferowane oprocentowanie nowych kredytów.</p>',
            key_points: [
                '<b>Próg LTV 80%:</b> Poniżej 80% LTV (20%+ wkładu) zazwyczaj pozwala uniknąć ubezpieczenia kredytu hipotecznego przy standardowych kredytach.',
                '<b>Niższy LTV = niższe ryzyko:</b> Banki postrzegają niższy LTV jako bezpieczniejszy, co często skutkuje lepszym oprocentowaniem.',
                '<b>Używane też przy refinansowaniu:</b> LTV określa również kwalifikowalność i warunki przy refinansowaniu istniejącej hipoteki.',
            ],
            howto: [
                { question: 'Jaki LTV jest potrzebny, aby uniknąć PMI?', answer: '<p>Zazwyczaj 80% lub niżej (czyli co najmniej 20% wkładu) pozwala uniknąć ubezpieczenia przy standardowym kredycie, choć konkretne wymogi różnią się w zależności od banku.</p>' },
                { question: 'Czy LTV zmienia się z czasem?', answer: '<p>Tak — w miarę spłaty kapitału i/lub zmiany wartości nieruchomości zmienia się też LTV, dlatego niektórzy właściciele proszą o usunięcie PMI, gdy LTV spadnie poniżej 80%.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Kwota Kredytu', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Wartość Nieruchomości', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Wskaźnik Kredytu do Wartości', unit: '%', precision: 1 }],
        },
        es: {
            slug: 'calculadora-relacion-prestamo-valor-ltv',
            title: 'Calculadora de Relación Préstamo-Valor (LTV)',
            h1: 'Calculadora de Relación Préstamo-Valor (LTV)',
            meta_title: 'Calculadora LTV | Relación Préstamo-Valor para Hipotecas',
            meta_description: 'Calcula tu relación préstamo-valor (LTV) — el monto del préstamo como porcentaje del valor de la propiedad — usada por prestamistas para evaluar el riesgo hipotecario.',
            short_answer: 'Esta calculadora calcula tu relación préstamo-valor (LTV) — el monto de tu préstamo como porcentaje del valor de la propiedad — una cifra clave que los prestamistas usan para evaluar el riesgo y determinar si se requiere seguro hipotecario privado.',
            intro_text: '<p>La relación préstamo-valor compara cuánto estás pidiendo prestado con cuánto vale la propiedad. Un LTV más bajo significa más capital propio (o un pago inicial mayor) en la propiedad, lo que los prestamistas ven como menor riesgo.</p><p><b>Los prestamistas hipotecarios</b> típicamente requieren seguro hipotecario privado (PMI) cuando el LTV supera el 80% (es decir, pago inicial menor al 20%), y el LTV también afecta la elegibilidad para refinanciar y la tasa de interés ofrecida en nuevos préstamos.</p>',
            key_points: [
                '<b>Umbral de LTV del 80%:</b> Por debajo del 80% de LTV (20%+ de pago inicial) generalmente evita el seguro hipotecario privado en préstamos convencionales.',
                '<b>Menor LTV = menor riesgo:</b> Los prestamistas ven un LTV más bajo como más seguro, a menudo resultando en mejores tasas de interés.',
                '<b>También se usa para refinanciar:</b> El LTV también determina la elegibilidad y condiciones al refinanciar una hipoteca existente.',
            ],
            howto: [
                { question: '¿Qué LTV necesito para evitar el PMI?', answer: '<p>Generalmente 80% o menos (es decir, al menos 20% de pago inicial) evita el seguro hipotecario privado en un préstamo convencional, aunque los requisitos específicos varían según el prestamista.</p>' },
                { question: '¿Cambia el LTV con el tiempo?', answer: '<p>Sí — a medida que pagas el capital del préstamo y/o el valor de la propiedad cambia, tu LTV también cambia, por lo que algunos propietarios solicitan eliminar el PMI cuando su LTV baja del 80%.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Monto del Préstamo', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Valor de la Propiedad', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Relación Préstamo-Valor', unit: '%', precision: 1 }],
        },
        fr: {
            slug: 'calculateur-ratio-pret-valeur-ltv',
            title: 'Calculateur de Ratio Prêt-Valeur (LTV)',
            h1: 'Calculateur de Ratio Prêt-Valeur (LTV)',
            meta_title: 'Calculateur LTV | Ratio Prêt-Valeur pour Hypothèques',
            meta_description: 'Calculez votre ratio prêt-valeur (LTV) — le montant du prêt en pourcentage de la valeur du bien — utilisé par les prêteurs pour évaluer le risque hypothécaire.',
            short_answer: 'Ce calculateur calcule votre ratio prêt-valeur (LTV) — le montant de votre prêt en pourcentage de la valeur du bien — un chiffre clé que les prêteurs utilisent pour évaluer le risque et déterminer si une assurance hypothécaire privée est requise.',
            intro_text: '<p>Le ratio prêt-valeur compare combien vous empruntez à combien vaut le bien. Un LTV plus bas signifie plus de capitaux propres (ou un apport plus important) dans le bien, ce que les prêteurs considèrent comme un risque plus faible.</p><p><b>Les prêteurs hypothécaires</b> exigent généralement une assurance hypothécaire privée (PMI) lorsque le LTV dépasse 80 % (c’est-à-dire un apport inférieur à 20 %), et le LTV affecte également l’éligibilité au refinancement et le taux d’intérêt proposé sur les nouveaux prêts.</p>',
            key_points: [
                '<b>Seuil de LTV à 80 % :</b> En dessous de 80 % de LTV (apport de 20 %+) évite généralement l’assurance hypothécaire privée sur les prêts conventionnels.',
                '<b>LTV plus bas = risque plus faible :</b> Les prêteurs considèrent un LTV plus bas comme plus sûr, entraînant souvent de meilleurs taux d’intérêt.',
                '<b>Utilisé aussi pour le refinancement :</b> Le LTV détermine aussi l’éligibilité et les conditions lors du refinancement d’une hypothèque existante.',
            ],
            howto: [
                { question: 'Quel LTV faut-il pour éviter le PMI ?', answer: '<p>Généralement 80 % ou moins (soit au moins 20 % d’apport) évite l’assurance hypothécaire privée sur un prêt conventionnel, bien que les exigences spécifiques varient selon le prêteur.</p>' },
                { question: 'Le LTV change-t-il avec le temps ?', answer: '<p>Oui — à mesure que vous remboursez le capital et/ou que la valeur du bien change, votre LTV change aussi, c’est pourquoi certains propriétaires demandent la suppression du PMI une fois leur LTV sous 80 %.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Montant du Prêt', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Valeur du Bien', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Ratio Prêt-Valeur', unit: '%', precision: 1 }],
        },
        it: {
            slug: 'calcolatore-rapporto-prestito-valore-ltv',
            title: 'Calcolatore Rapporto Prestito-Valore (LTV)',
            h1: 'Calcolatore Rapporto Prestito-Valore (LTV)',
            meta_title: 'Calcolatore LTV | Rapporto Prestito-Valore per Mutui',
            meta_description: 'Calcola il tuo rapporto prestito-valore (LTV) — l’importo del prestito come percentuale del valore dell’immobile — usato dai prestatori per valutare il rischio del mutuo.',
            short_answer: 'Questo calcolatore calcola il tuo rapporto prestito-valore (LTV) — l’importo del tuo prestito come percentuale del valore dell’immobile — un dato chiave che i prestatori usano per valutare il rischio e determinare se è richiesta l’assicurazione ipotecaria privata.',
            intro_text: '<p>Il rapporto prestito-valore confronta quanto stai prendendo in prestito con quanto vale l’immobile. Un LTV più basso significa più capitale proprio (o un anticipo maggiore) nell’immobile, cosa che i prestatori vedono come rischio minore.</p><p><b>I mutuanti</b> tipicamente richiedono l’assicurazione ipotecaria privata (PMI) quando l’LTV supera l’80% (cioè anticipo inferiore al 20%), e l’LTV influisce anche sull’idoneità al rifinanziamento e sul tasso di interesse offerto sui nuovi prestiti.</p>',
            key_points: [
                '<b>Soglia LTV dell’80%:</b> Sotto l’80% di LTV (20%+ di anticipo) generalmente evita l’assicurazione ipotecaria privata sui mutui convenzionali.',
                '<b>LTV più basso = rischio più basso:</b> I prestatori vedono un LTV più basso come più sicuro, spesso risultando in tassi di interesse migliori.',
                '<b>Usato anche per il rifinanziamento:</b> L’LTV determina anche l’idoneità e i termini quando si rifinanzia un mutuo esistente.',
            ],
            howto: [
                { question: 'Quale LTV serve per evitare il PMI?', answer: '<p>Generalmente 80% o inferiore (cioè almeno il 20% di anticipo) evita l’assicurazione ipotecaria privata su un mutuo convenzionale, sebbene i requisiti specifici varino a seconda del prestatore.</p>' },
                { question: 'L’LTV cambia nel tempo?', answer: '<p>Sì — man mano che paghi il capitale del prestito e/o il valore dell’immobile cambia, cambia anche il tuo LTV, motivo per cui alcuni proprietari chiedono la rimozione del PMI quando il loro LTV scende sotto l’80%.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Importo del Prestito', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Valore dell’Immobile', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Rapporto Prestito-Valore', unit: '%', precision: 1 }],
        },
        de: {
            slug: 'beleihungsauslauf-ltv-rechner',
            title: 'Beleihungsauslauf (LTV) Rechner',
            h1: 'Beleihungsauslauf-Rechner (LTV)',
            meta_title: 'LTV-Rechner | Beleihungsauslauf für Hypotheken',
            meta_description: 'Berechnen Sie Ihren Beleihungsauslauf (LTV) — den Kreditbetrag als Prozentsatz des Immobilienwerts — zur Risikobewertung von Hypotheken.',
            short_answer: 'Dieser Rechner berechnet Ihren Beleihungsauslauf (LTV) — Ihren Kreditbetrag als Prozentsatz des Immobilienwerts — eine wichtige Zahl, die Kreditgeber zur Risikobewertung und zur Bestimmung der Notwendigkeit einer privaten Hypothekenversicherung verwenden.',
            intro_text: '<p>Der Beleihungsauslauf vergleicht, wie viel Sie leihen, mit dem Wert der Immobilie. Ein niedrigerer LTV bedeutet mehr Eigenkapital (oder eine größere Anzahlung) in der Immobilie, was Kreditgeber als geringeres Risiko betrachten.</p><p><b>Hypothekengeber</b> verlangen in der Regel eine private Hypothekenversicherung (PMI), wenn der LTV 80 % übersteigt (d. h. Anzahlung unter 20 %), und der LTV beeinflusst auch die Umschuldungsberechtigung und den angebotenen Zinssatz für neue Kredite.</p>',
            key_points: [
                '<b>80 %-LTV-Schwelle:</b> Unter 80 % LTV (20 %+ Anzahlung) vermeidet in der Regel eine private Hypothekenversicherung bei konventionellen Krediten.',
                '<b>Niedrigerer LTV = geringeres Risiko:</b> Kreditgeber sehen einen niedrigeren LTV als sicherer an, was oft zu besseren Zinssätzen führt.',
                '<b>Auch für Umschuldung relevant:</b> Der LTV bestimmt auch die Berechtigung und Konditionen bei der Umschuldung einer bestehenden Hypothek.',
            ],
            howto: [
                { question: 'Welchen LTV benötige ich, um PMI zu vermeiden?', answer: '<p>Im Allgemeinen vermeidet 80 % oder weniger (d. h. mindestens 20 % Anzahlung) die private Hypothekenversicherung bei einem konventionellen Kredit, wobei die genauen Anforderungen je nach Kreditgeber variieren.</p>' },
                { question: 'Ändert sich der LTV im Laufe der Zeit?', answer: '<p>Ja — während Sie die Kredittilgung abzahlen und/oder sich der Immobilienwert ändert, ändert sich auch Ihr LTV, weshalb manche Hausbesitzer die Entfernung der PMI beantragen, sobald ihr LTV unter 80 % fällt.</p>' },
            ],
            inputs: [
                { name: 'loan_amount', label: 'Kreditbetrag', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '270000' },
                { name: 'property_value', label: 'Immobilienwert', type: 'number', unit: '$', min: 1, max: 20000000, placeholder: '300000' },
            ],
            outputs: [{ name: 'ltv_ratio', label: 'Beleihungsauslauf', unit: '%', precision: 1 }],
        },
    },
}

// ============================================================
// 1020: Loan Payoff Time Calculator (fixed payment)
// ============================================================
const payoffR = '(annual_rate/100/12)'
const payoffN = `(-log(1 - ${payoffR}*balance/payment) / log(1+${payoffR}))`

const payoffTime: ToolDef = {
    id: '1020',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'balance', default: 5000 },
            { key: 'annual_rate', default: 18 },
            { key: 'payment', default: 150 },
        ],
        formulas: {
            months_to_payoff: payoffN,
            total_interest: `${payoffN}*payment - balance`,
        },
        outputs: [
            { key: 'months_to_payoff', precision: 1 },
            { key: 'total_interest', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'loan-payoff-time-calculator',
            title: 'Loan Payoff Time Calculator - Fixed Payment',
            h1: 'Loan Payoff Time Calculator',
            meta_title: 'Loan Payoff Calculator | How Long to Pay Off Debt',
            meta_description: 'Calculate how many months it will take to pay off a loan or credit card balance with a fixed monthly payment, plus the total interest paid.',
            short_answer: 'This calculator tells you how many months it will take to pay off a loan or credit card balance if you make a fixed monthly payment, along with the total interest you\'ll pay along the way.',
            intro_text: '<p>Given a starting balance, an interest rate, and a fixed monthly payment, there\'s a precise number of months required to reach zero — this calculator solves for that directly using the same math lenders and credit card companies use internally.</p><p><b>People carrying credit card or personal loan debt</b> use this to see the real payoff timeline, which is often much longer than expected once compounding interest is factored in — a key reason minimum-payment-only strategies can take years or even decades to clear a balance.</p>',
            key_points: [
                '<b>Payment Must Exceed Interest:</b> Your monthly payment must be greater than the first month\'s interest charge, or the balance will never reach zero.',
                '<b>Small Rate Changes, Big Time Differences:</b> Because interest compounds monthly, a few percentage points of rate can add months or years to the payoff timeline.',
                '<b>Same Math as Credit Cards:</b> This is the exact calculation behind the "minimum payment warning" disclosures required on credit card statements.',
            ],
            howto: [
                { question: 'Why does my calculator show an error or blank result?', answer: '<p>If your monthly payment doesn\'t exceed the interest accruing on the balance each month, the loan mathematically never gets paid off — increase the payment amount above the monthly interest charge.</p>' },
                { question: 'Why do credit card minimum payments take so long to pay off a balance?', answer: '<p>Minimum payments are often set just above the monthly interest charge, meaning very little goes toward the actual balance each month — this calculator shows exactly how many months that translates to.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Current Balance', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Annual Interest Rate (APR)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Fixed Monthly Payment', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Months to Pay Off', unit: 'months', precision: 1 },
                { name: 'total_interest', label: 'Total Interest Paid', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-vremeni-pogasheniya-kredita',
            title: 'Калькулятор времени погашения кредита - фиксированный платёж',
            h1: 'Калькулятор времени погашения кредита',
            meta_title: 'Калькулятор погашения долга | Сколько времени нужно на выплату',
            meta_description: 'Рассчитайте, сколько месяцев потребуется, чтобы погасить кредит или долг по кредитной карте при фиксированном ежемесячном платеже, а также общую переплату.',
            short_answer: 'Этот калькулятор показывает, сколько месяцев потребуется, чтобы погасить кредит или долг по кредитной карте при фиксированном ежемесячном платеже, а также общую переплату по процентам.',
            intro_text: '<p>При известном начальном балансе, процентной ставке и фиксированном ежемесячном платеже существует точное число месяцев для выхода на ноль — калькулятор решает это напрямую, используя ту же математику, что банки и компании кредитных карт применяют внутри.</p><p><b>Люди с долгом по кредитной карте или кредиту</b> используют это, чтобы увидеть реальный график погашения, который часто намного длиннее ожидаемого с учётом капитализации процентов.</p>',
            key_points: [
                '<b>Платёж должен превышать проценты:</b> Ежемесячный платёж должен быть больше начисленных за первый месяц процентов, иначе баланс никогда не достигнет нуля.',
                '<b>Малые изменения ставки — большая разница во времени:</b> Из-за ежемесячной капитализации процентов несколько процентных пунктов ставки могут добавить месяцы или годы к сроку погашения.',
                '<b>Та же математика, что и у кредитных карт:</b> Это точный расчёт, стоящий за предупреждениями о минимальном платеже в выписках по кредитным картам.',
            ],
            howto: [
                { question: 'Почему калькулятор показывает ошибку или пустой результат?', answer: '<p>Если ежемесячный платёж не превышает начисляемые на баланс проценты каждый месяц, кредит математически никогда не будет погашен — увеличьте сумму платежа выше ежемесячных процентов.</p>' },
                { question: 'Почему минимальные платежи по кредитной карте так долго гасят баланс?', answer: '<p>Минимальные платежи часто устанавливаются лишь немного выше ежемесячных процентов, поэтому очень мало идёт на сам баланс каждый месяц — калькулятор точно показывает, сколько это месяцев.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Текущий баланс', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Годовая процентная ставка (APR)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Фиксированный ежемесячный платёж', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Месяцев до погашения', unit: 'мес.', precision: 1 },
                { name: 'total_interest', label: 'Общая переплата', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'aizdevuma-atmaksas-laika-kalkulators',
            title: 'Aizdevuma Atmaksas Laika Kalkulators - Fiksēts Maksājums',
            h1: 'Aizdevuma Atmaksas Laika Kalkulators',
            meta_title: 'Parāda Atmaksas Kalkulators | Cik Ilgi Atmaksāt Parādu',
            meta_description: 'Aprēķiniet, cik mēnešu būs nepieciešams, lai atmaksātu aizdevumu vai kredītkartes parādu ar fiksētu ikmēneša maksājumu, kā arī kopējos procentus.',
            short_answer: 'Šis kalkulators parāda, cik mēnešu būs nepieciešams, lai atmaksātu aizdevumu vai kredītkartes parādu ar fiksētu ikmēneša maksājumu, kā arī kopējos samaksātos procentus.',
            intro_text: '<p>Zinot sākotnējo atlikumu, procentu likmi un fiksētu ikmēneša maksājumu, pastāv precīzs mēnešu skaits, lai sasniegtu nulli — kalkulators to atrisina tieši, izmantojot to pašu matemātiku, ko iekšēji izmanto bankas un kredītkaršu kompānijas.</p><p><b>Cilvēki ar kredītkartes vai aizdevuma parādu</b> to izmanto, lai redzētu reālo atmaksas grafiku, kas bieži ir daudz garāks nekā gaidīts, ņemot vērā procentu kapitalizāciju.</p>',
            key_points: [
                '<b>Maksājumam jāpārsniedz procenti:</b> Ikmēneša maksājumam jābūt lielākam par pirmā mēneša procentu maksu, citādi atlikums nekad nesasniegs nulli.',
                '<b>Nelielas likmes izmaiņas — liela laika atšķirība:</b> Tā kā procenti tiek kapitalizēti katru mēnesi, daži procentpunkti likmē var pievienot mēnešus vai gadus atmaksas grafikam.',
                '<b>Tā pati matemātika, kas kredītkartēm:</b> Tas ir precīzs aprēķins aiz "minimālā maksājuma brīdinājumiem" kredītkaršu izrakstos.',
            ],
            howto: [
                { question: 'Kāpēc kalkulators rāda kļūdu vai tukšu rezultātu?', answer: '<p>Ja ikmēneša maksājums nepārsniedz katru mēnesi uzkrātos procentus, aizdevums matemātiski nekad netiks atmaksāts — palieliniet maksājuma summu virs ikmēneša procentu maksas.</p>' },
                { question: 'Kāpēc kredītkartes minimālie maksājumi tik ilgi atmaksā atlikumu?', answer: '<p>Minimālie maksājumi bieži tiek noteikti tikai nedaudz virs ikmēneša procentu maksas, tāpēc ļoti maz nonāk pie paša atlikuma katru mēnesi — kalkulators precīzi parāda, cik mēnešu tas nozīmē.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Pašreizējais Atlikums', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Gada Procentu Likme (APR)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Fiksēts Ikmēneša Maksājums', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Mēneši Līdz Atmaksai', unit: 'mēn.', precision: 1 },
                { name: 'total_interest', label: 'Kopējie Samaksātie Procenti', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-czasu-splaty-kredytu',
            title: 'Kalkulator Czasu Spłaty Kredytu - Stała Rata',
            h1: 'Kalkulator Czasu Spłaty Kredytu',
            meta_title: 'Kalkulator Spłaty Długu | Ile Czasu na Spłatę Długu',
            meta_description: 'Oblicz, ile miesięcy zajmie spłata kredytu lub zadłużenia na karcie kredytowej przy stałej racie miesięcznej, plus sumę odsetek.',
            short_answer: 'Ten kalkulator pokazuje, ile miesięcy zajmie spłata kredytu lub zadłużenia na karcie kredytowej przy stałej racie miesięcznej, wraz z sumą odsetek, które zapłacisz po drodze.',
            intro_text: '<p>Znając początkowe saldo, oprocentowanie i stałą ratę miesięczną, istnieje dokładna liczba miesięcy potrzebna do osiągnięcia zera — ten kalkulator rozwiązuje to bezpośrednio, używając tej samej matematyki, której banki i firmy kart kredytowych używają wewnętrznie.</p><p><b>Osoby posiadające zadłużenie na karcie kredytowej lub kredycie osobistym</b> używają tego, aby zobaczyć rzeczywisty harmonogram spłaty, który jest często znacznie dłuższy niż oczekiwano po uwzględnieniu odsetek składanych.</p>',
            key_points: [
                '<b>Rata musi przekraczać odsetki:</b> Twoja miesięczna rata musi być większa niż naliczone odsetki za pierwszy miesiąc, inaczej saldo nigdy nie osiągnie zera.',
                '<b>Małe zmiany oprocentowania, duże różnice czasowe:</b> Ponieważ odsetki są kapitalizowane co miesiąc, kilka punktów procentowych oprocentowania może dodać miesiące lub lata do harmonogramu spłaty.',
                '<b>Ta sama matematyka co przy kartach kredytowych:</b> To dokładne obliczenie stojące za "ostrzeżeniami o minimalnej płatności" na wyciągach z kart kredytowych.',
            ],
            howto: [
                { question: 'Dlaczego mój kalkulator pokazuje błąd lub pusty wynik?', answer: '<p>Jeśli twoja miesięczna rata nie przekracza odsetek naliczanych na saldo co miesiąc, kredyt matematycznie nigdy nie zostanie spłacony — zwiększ kwotę raty powyżej miesięcznych odsetek.</p>' },
                { question: 'Dlaczego minimalne płatności na karcie kredytowej tak długo spłacają saldo?', answer: '<p>Minimalne płatności są często ustalane tylko nieco powyżej miesięcznych odsetek, więc bardzo mało trafia na samo saldo co miesiąc — kalkulator dokładnie pokazuje, ile to miesięcy.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Obecne Saldo', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Roczne Oprocentowanie (RRSO)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Stała Rata Miesięczna', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Miesiące do Spłaty', unit: 'mies.', precision: 1 },
                { name: 'total_interest', label: 'Suma Zapłaconych Odsetek', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-tiempo-pago-deuda',
            title: 'Calculadora de Tiempo para Pagar Deuda - Pago Fijo',
            h1: 'Calculadora de Tiempo para Pagar Deuda',
            meta_title: 'Calculadora de Pago de Deuda | Cuánto Tiempo para Pagar',
            meta_description: 'Calcula cuántos meses tomará pagar un préstamo o saldo de tarjeta de crédito con un pago mensual fijo, más el interés total pagado.',
            short_answer: 'Esta calculadora te dice cuántos meses tomará pagar un préstamo o saldo de tarjeta de crédito si haces un pago mensual fijo, junto con el interés total que pagarás en el camino.',
            intro_text: '<p>Dado un saldo inicial, una tasa de interés y un pago mensual fijo, hay un número preciso de meses necesarios para llegar a cero — esta calculadora resuelve eso directamente usando la misma matemática que usan internamente los bancos y compañías de tarjetas de crédito.</p><p><b>Las personas con deuda de tarjeta de crédito o préstamo personal</b> usan esto para ver el cronograma real de pago, que suele ser mucho más largo de lo esperado una vez que se considera el interés compuesto.</p>',
            key_points: [
                '<b>El pago debe superar el interés:</b> Tu pago mensual debe ser mayor que el cargo de interés del primer mes, o el saldo nunca llegará a cero.',
                '<b>Pequeños cambios de tasa, grandes diferencias de tiempo:</b> Como el interés se compone mensualmente, unos pocos puntos porcentuales de tasa pueden añadir meses o años al cronograma de pago.',
                '<b>La misma matemática que las tarjetas de crédito:</b> Este es el cálculo exacto detrás de las advertencias de "pago mínimo" requeridas en los estados de cuenta de tarjetas de crédito.',
            ],
            howto: [
                { question: '¿Por qué mi calculadora muestra un error o resultado en blanco?', answer: '<p>Si tu pago mensual no supera el interés que se acumula en el saldo cada mes, el préstamo matemáticamente nunca se pagará — aumenta el monto del pago por encima del cargo de interés mensual.</p>' },
                { question: '¿Por qué los pagos mínimos de tarjeta de crédito tardan tanto en pagar un saldo?', answer: '<p>Los pagos mínimos suelen fijarse apenas por encima del cargo de interés mensual, lo que significa que muy poco va al saldo real cada mes — esta calculadora muestra exactamente cuántos meses se traduce eso.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Saldo Actual', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Tasa de Interés Anual (TAE)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Pago Mensual Fijo', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Meses para Pagar', unit: 'meses', precision: 1 },
                { name: 'total_interest', label: 'Interés Total Pagado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-duree-remboursement-dette',
            title: 'Calculateur de Durée de Remboursement - Paiement Fixe',
            h1: 'Calculateur de Durée de Remboursement de Dette',
            meta_title: 'Calculateur de Remboursement | Combien de Temps pour Rembourser',
            meta_description: 'Calculez combien de mois il faudra pour rembourser un prêt ou un solde de carte de crédit avec un paiement mensuel fixe, plus les intérêts totaux.',
            short_answer: 'Ce calculateur vous indique combien de mois il faudra pour rembourser un prêt ou un solde de carte de crédit si vous effectuez un paiement mensuel fixe, ainsi que les intérêts totaux que vous paierez.',
            intro_text: '<p>Étant donné un solde de départ, un taux d’intérêt et un paiement mensuel fixe, il existe un nombre précis de mois nécessaires pour atteindre zéro — ce calculateur résout cela directement en utilisant les mêmes mathématiques que les banques et sociétés de cartes de crédit utilisent en interne.</p><p><b>Les personnes ayant une dette de carte de crédit ou de prêt personnel</b> utilisent cela pour voir le calendrier de remboursement réel, souvent bien plus long que prévu une fois les intérêts composés pris en compte.</p>',
            key_points: [
                '<b>Le paiement doit dépasser les intérêts :</b> Votre paiement mensuel doit être supérieur aux intérêts du premier mois, sinon le solde n’atteindra jamais zéro.',
                '<b>Petits changements de taux, grandes différences de temps :</b> Les intérêts se composant mensuellement, quelques points de pourcentage de taux peuvent ajouter des mois ou des années au calendrier de remboursement.',
                '<b>Les mêmes mathématiques que les cartes de crédit :</b> C’est le calcul exact derrière les avertissements de "paiement minimum" requis sur les relevés de carte de crédit.',
            ],
            howto: [
                { question: 'Pourquoi mon calculateur affiche-t-il une erreur ou un résultat vide ?', answer: '<p>Si votre paiement mensuel ne dépasse pas les intérêts accumulés sur le solde chaque mois, le prêt ne sera mathématiquement jamais remboursé — augmentez le montant du paiement au-dessus des intérêts mensuels.</p>' },
                { question: 'Pourquoi les paiements minimums de carte de crédit prennent-ils si longtemps à rembourser un solde ?', answer: '<p>Les paiements minimums sont souvent fixés juste au-dessus des intérêts mensuels, ce qui signifie que très peu va au solde réel chaque mois — ce calculateur montre exactement combien de mois cela représente.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Solde Actuel', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel (TAEG)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Paiement Mensuel Fixe', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Mois pour Rembourser', unit: 'mois', precision: 1 },
                { name: 'total_interest', label: 'Intérêts Totaux Payés', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-tempo-estinzione-debito',
            title: 'Calcolatore Tempo di Estinzione - Rata Fissa',
            h1: 'Calcolatore Tempo di Estinzione del Debito',
            meta_title: 'Calcolatore Estinzione Debito | Quanto Tempo per Estinguere il Debito',
            meta_description: 'Calcola quanti mesi ci vorranno per estinguere un prestito o un saldo di carta di credito con una rata mensile fissa, più gli interessi totali.',
            short_answer: 'Questo calcolatore ti dice quanti mesi ci vorranno per estinguere un prestito o un saldo di carta di credito se effettui una rata mensile fissa, insieme agli interessi totali che pagherai.',
            intro_text: '<p>Dato un saldo iniziale, un tasso di interesse e una rata mensile fissa, esiste un numero preciso di mesi necessari per raggiungere zero — questo calcolatore lo risolve direttamente usando la stessa matematica che banche e società di carte di credito usano internamente.</p><p><b>Le persone con debito su carta di credito o prestito personale</b> usano questo per vedere la reale tempistica di estinzione, spesso molto più lunga del previsto una volta considerato l’interesse composto.</p>',
            key_points: [
                '<b>La rata deve superare gli interessi:</b> La tua rata mensile deve essere maggiore degli interessi maturati nel primo mese, altrimenti il saldo non raggiungerà mai zero.',
                '<b>Piccole variazioni di tasso, grandi differenze di tempo:</b> Poiché gli interessi si capitalizzano mensilmente, alcuni punti percentuali di tasso possono aggiungere mesi o anni alla tempistica di estinzione.',
                '<b>La stessa matematica delle carte di credito:</b> Questo è il calcolo esatto dietro gli avvisi di "pagamento minimo" richiesti sugli estratti conto delle carte di credito.',
            ],
            howto: [
                { question: 'Perché il mio calcolatore mostra un errore o un risultato vuoto?', answer: '<p>Se la tua rata mensile non supera gli interessi maturati sul saldo ogni mese, il prestito matematicamente non verrà mai estinto — aumenta l’importo della rata sopra gli interessi mensili.</p>' },
                { question: 'Perché i pagamenti minimi della carta di credito impiegano così tanto a estinguere un saldo?', answer: '<p>I pagamenti minimi sono spesso impostati solo leggermente sopra gli interessi mensili, quindi molto poco va al saldo reale ogni mese — questo calcolatore mostra esattamente quanti mesi ciò comporta.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Saldo Attuale', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo (TAEG)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Rata Mensile Fissa', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Mesi per Estinguere', unit: 'mesi', precision: 1 },
                { name: 'total_interest', label: 'Interessi Totali Pagati', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'schulden-tilgungsdauer-rechner',
            title: 'Schulden-Tilgungsdauer-Rechner - Feste Rate',
            h1: 'Schulden-Tilgungsdauer-Rechner',
            meta_title: 'Schuldentilgungs-Rechner | Wie Lange Dauert die Schuldentilgung',
            meta_description: 'Berechnen Sie, wie viele Monate es dauert, einen Kredit oder Kreditkartensaldo mit einer festen monatlichen Rate zu tilgen, plus die gezahlten Gesamtzinsen.',
            short_answer: 'Dieser Rechner zeigt Ihnen, wie viele Monate es dauert, einen Kredit oder Kreditkartensaldo mit einer festen monatlichen Rate zu tilgen, zusammen mit den Gesamtzinsen, die Sie dabei zahlen.',
            intro_text: '<p>Bei einem Anfangssaldo, einem Zinssatz und einer festen monatlichen Rate gibt es eine genaue Anzahl von Monaten, die benötigt wird, um null zu erreichen — dieser Rechner löst dies direkt mit derselben Mathematik, die Banken und Kreditkartenunternehmen intern verwenden.</p><p><b>Menschen mit Kreditkarten- oder Privatkreditschulden</b> nutzen dies, um den tatsächlichen Tilgungszeitplan zu sehen, der oft viel länger ist als erwartet, sobald der Zinseszins berücksichtigt wird.</p>',
            key_points: [
                '<b>Rate muss Zinsen übersteigen:</b> Ihre monatliche Rate muss größer sein als die Zinsbelastung des ersten Monats, sonst erreicht der Saldo nie null.',
                '<b>Kleine Zinsänderungen, große Zeitunterschiede:</b> Da sich Zinsen monatlich verzinsen, können wenige Prozentpunkte Zinssatz Monate oder Jahre zum Tilgungszeitplan hinzufügen.',
                '<b>Dieselbe Mathematik wie bei Kreditkarten:</b> Dies ist die genaue Berechnung hinter den "Mindestzahlungswarnungen", die auf Kreditkartenabrechnungen vorgeschrieben sind.',
            ],
            howto: [
                { question: 'Warum zeigt mein Rechner einen Fehler oder ein leeres Ergebnis?', answer: '<p>Wenn Ihre monatliche Rate die monatlich anfallenden Zinsen auf den Saldo nicht übersteigt, wird der Kredit mathematisch nie getilgt — erhöhen Sie den Ratenbetrag über die monatliche Zinsbelastung hinaus.</p>' },
                { question: 'Warum dauern Mindestzahlungen bei Kreditkarten so lange, um einen Saldo zu tilgen?', answer: '<p>Mindestzahlungen werden oft nur knapp über der monatlichen Zinsbelastung festgelegt, sodass jeden Monat sehr wenig auf den tatsächlichen Saldo geht — dieser Rechner zeigt genau, wie viele Monate das bedeutet.</p>' },
            ],
            inputs: [
                { name: 'balance', label: 'Aktueller Saldo', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Jährlicher Zinssatz (Effektivzins)', type: 'number', unit: '%', min: 0.1, max: 50, placeholder: '18' },
                { name: 'payment', label: 'Feste Monatliche Rate', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '150' },
            ],
            outputs: [
                { name: 'months_to_payoff', label: 'Monate bis zur Tilgung', unit: 'Monate', precision: 1 },
                { name: 'total_interest', label: 'Gesamt Gezahlte Zinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1021: Extra Payment Savings Calculator
// ============================================================
const exR = '(annual_rate/100/12)'
const exN = '(years*12)'
const exPMT = `(principal*${exR}*(1+${exR})^${exN} / ((1+${exR})^${exN} - 1))`
const exNewPayment = `(${exPMT} + extra_payment)`
const exNewN = `(-log(1 - ${exR}*principal/${exNewPayment}) / log(1+${exR}))`
const exBaselineInterest = `(${exPMT}*${exN} - principal)`
const exNewInterest = `(${exNewPayment}*${exNewN} - principal)`

const extraPayment: ToolDef = {
    id: '1021',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 300000 },
            { key: 'annual_rate', default: 6 },
            { key: 'years', default: 30 },
            { key: 'extra_payment', default: 200 },
        ],
        formulas: {
            months_saved: `(${exN} - ${exNewN})`,
            interest_saved: `(${exBaselineInterest} - ${exNewInterest})`,
        },
        outputs: [
            { key: 'months_saved', precision: 1 },
            { key: 'interest_saved', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'extra-payment-savings-calculator',
            title: 'Extra Payment Savings Calculator - Loan Payoff',
            h1: 'Extra Payment Savings Calculator',
            meta_title: 'Extra Payment Calculator | Save Time & Interest on Your Loan',
            meta_description: 'Calculate how much time and interest you\'ll save by paying extra toward your loan or mortgage principal each month.',
            short_answer: 'This calculator shows how many months (and how much interest) you\'ll save by adding a fixed extra amount to your regular monthly loan payment, going directly toward the principal.',
            intro_text: '<p>Every extra dollar paid toward a loan\'s principal reduces the balance that future interest is calculated on — because interest compounds monthly on the outstanding balance, even modest extra payments compound into significant time and interest savings over a long loan term.</p><p><b>Homeowners and borrowers</b> use this to decide whether an extra monthly payment is worth it compared to investing that money elsewhere, and to see concretely how many years earlier they could be debt-free.</p>',
            key_points: [
                '<b>Extra Payments Go to Principal:</b> Assumes the extra amount is applied directly to the loan balance, not just prepaying future interest.',
                '<b>Bigger Impact on Longer Loans:</b> The savings effect is most dramatic on long-term loans like 30-year mortgages, where compounding has decades to work.',
                '<b>Compare to Investing:</b> If your loan\'s interest rate is lower than expected investment returns, it may be mathematically better to invest the extra money instead — this calculator shows what you\'d be giving up either way.',
            ],
            howto: [
                { question: 'Why does a small extra payment save so much interest?', answer: '<p>Because interest compounds on the remaining balance every month, reducing the balance early has a cascading effect — every future month\'s interest calculation is now based on a smaller number, for the entire remaining term.</p>' },
                { question: 'Should I always pay extra on my mortgage?', answer: '<p>Not necessarily — compare your loan\'s interest rate to what you could realistically earn investing that money instead. Extra payments make the most sense on higher-interest debt.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Loan Amount', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Original Loan Term', type: 'number', unit: 'years', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Extra Monthly Payment', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Time Saved', unit: 'months', precision: 1 },
                { name: 'interest_saved', label: 'Interest Saved', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-ekonomii-ot-dosrochnyh-platezhey',
            title: 'Калькулятор экономии от досрочных платежей по кредиту',
            h1: 'Калькулятор экономии от досрочных платежей',
            meta_title: 'Калькулятор досрочного погашения | Экономия времени и процентов',
            meta_description: 'Рассчитайте, сколько времени и процентов вы сэкономите, доплачивая к основному долгу по кредиту или ипотеке каждый месяц.',
            short_answer: 'Этот калькулятор показывает, сколько месяцев (и процентов) вы сэкономите, добавляя фиксированную сумму к обычному ежемесячному платежу по кредиту, направляемую напрямую на основной долг.',
            intro_text: '<p>Каждый дополнительный доллар, направленный на основной долг, уменьшает баланс, на который начисляются будущие проценты — поскольку проценты капитализируются ежемесячно на остатке, даже скромные доплаты складываются в значительную экономию времени и процентов за долгий срок кредита.</p><p><b>Владельцы недвижимости и заёмщики</b> используют это, чтобы решить, стоит ли доплата по сравнению с инвестированием этих денег в другое место, и увидеть конкретно, на сколько лет раньше можно освободиться от долга.</p>',
            key_points: [
                '<b>Доплата идёт на основной долг:</b> Предполагается, что дополнительная сумма применяется напрямую к балансу кредита, а не просто предоплачивает будущие проценты.',
                '<b>Больший эффект на длинных кредитах:</b> Эффект экономии наиболее выражен на долгосрочных кредитах вроде 30-летней ипотеки, где капитализации есть десятилетия, чтобы сработать.',
                '<b>Сравните с инвестированием:</b> Если ставка по кредиту ниже ожидаемой доходности инвестиций, математически может быть выгоднее инвестировать эти деньги — калькулятор показывает, от чего вы отказываетесь в любом случае.',
            ],
            howto: [
                { question: 'Почему небольшая доплата экономит так много процентов?', answer: '<p>Поскольку проценты капитализируются на остатке каждый месяц, раннее снижение баланса даёт каскадный эффект — расчёт процентов на все последующие месяцы теперь основан на меньшей сумме, на весь оставшийся срок.</p>' },
                { question: 'Стоит ли всегда доплачивать по ипотеке?', answer: '<p>Не обязательно — сравните ставку по кредиту с реальной доходностью, которую можно получить, инвестируя эти деньги. Доплаты имеют наибольший смысл на долгах с высокой ставкой.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Сумма кредита', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Изначальный срок кредита', type: 'number', unit: 'лет', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Дополнительный ежемесячный платёж', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Сэкономленное время', unit: 'мес.', precision: 1 },
                { name: 'interest_saved', label: 'Сэкономлено на процентах', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'papildu-maksajumu-ietaupijuma-kalkulators',
            title: 'Papildu Maksājumu Ietaupījuma Kalkulators - Aizdevuma Atmaksa',
            h1: 'Papildu Maksājumu Ietaupījuma Kalkulators',
            meta_title: 'Papildu Maksājumu Kalkulators | Ietaupiet Laiku un Procentus',
            meta_description: 'Aprēķiniet, cik daudz laika un procentu ietaupīsiet, katru mēnesi maksājot papildu summu aizdevuma vai hipotēkas pamatsummai.',
            short_answer: 'Šis kalkulators parāda, cik mēnešu (un procentu) ietaupīsiet, pievienojot fiksētu papildu summu regulārajam ikmēneša aizdevuma maksājumam, kas tieši iet uz pamatsummu.',
            intro_text: '<p>Katrs papildu dolārs, kas samaksāts aizdevuma pamatsummai, samazina atlikumu, no kura tiek aprēķināti nākotnes procenti — tā kā procenti tiek kapitalizēti katru mēnesi no atlikušās summas, pat nelielas papildu iemaksas rada nozīmīgu laika un procentu ietaupījumu ilgā aizdevuma termiņā.</p><p><b>Māju īpašnieki un aizņēmēji</b> to izmanto, lai izlemtu, vai papildu ikmēneša maksājums ir vērts, salīdzinot ar šīs naudas ieguldīšanu citur, un redzētu konkrēti, par cik gadiem agrāk var tikt vaļā no parāda.</p>',
            key_points: [
                '<b>Papildu maksājumi iet uz pamatsummu:</b> Pieņem, ka papildu summa tiek piemērota tieši aizdevuma atlikumam, nevis tikai priekšapmaksā nākotnes procentus.',
                '<b>Lielāka ietekme uz garākiem aizdevumiem:</b> Ietaupījuma efekts ir visspilgtākais ilgtermiņa aizdevumiem, piemēram, 30 gadu hipotēkām, kur kapitalizācijai ir desmitgades, lai darbotos.',
                '<b>Salīdziniet ar ieguldīšanu:</b> Ja aizdevuma likme ir zemāka par gaidāmo ieguldījumu ienesīgumu, matemātiski var būt izdevīgāk ieguldīt šo naudu citur — kalkulators rāda, no kā jūs atsakāties jebkurā gadījumā.',
            ],
            howto: [
                { question: 'Kāpēc neliela papildu iemaksa ietaupa tik daudz procentu?', answer: '<p>Tā kā procenti tiek kapitalizēti no atlikušās summas katru mēnesi, agrīna atlikuma samazināšana rada kaskādes efektu — visu turpmāko mēnešu procentu aprēķins tagad balstās uz mazāku summu visam atlikušajam termiņam.</p>' },
                { question: 'Vai vienmēr jāmaksā papildus hipotēkai?', answer: '<p>Ne obligāti — salīdziniet aizdevuma likmi ar reālo ienesīgumu, ko varētu iegūt, ieguldot šo naudu. Papildu maksājumi ir visjēdzīgākie augstākas likmes parādiem.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Aizdevuma Summa', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Sākotnējais Aizdevuma Termiņš', type: 'number', unit: 'gadi', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Papildu Ikmēneša Maksājums', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Ietaupītais Laiks', unit: 'mēn.', precision: 1 },
                { name: 'interest_saved', label: 'Ietaupītie Procenti', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-z-nadplaty',
            title: 'Kalkulator Oszczędności z Nadpłaty Kredytu',
            h1: 'Kalkulator Oszczędności z Nadpłaty',
            meta_title: 'Kalkulator Nadpłaty | Oszczędź Czas i Odsetki na Kredycie',
            meta_description: 'Oblicz, ile czasu i odsetek zaoszczędzisz, dokonując dodatkowej wpłaty na kapitał kredytu lub hipoteki co miesiąc.',
            short_answer: 'Ten kalkulator pokazuje, ile miesięcy (i odsetek) zaoszczędzisz, dodając stałą dodatkową kwotę do regularnej miesięcznej raty kredytu, trafiającą bezpośrednio na kapitał.',
            intro_text: '<p>Każdy dodatkowy dolar wpłacony na kapitał kredytu zmniejsza saldo, od którego naliczane są przyszłe odsetki — ponieważ odsetki kapitalizują się co miesiąc od pozostałego salda, nawet skromne dodatkowe wpłaty kumulują się w znaczące oszczędności czasu i odsetek przez długi okres kredytowania.</p><p><b>Właściciele domów i kredytobiorcy</b> używają tego, aby zdecydować, czy dodatkowa miesięczna wpłata jest warta w porównaniu z inwestowaniem tych pieniędzy gdzie indziej, i zobaczyć konkretnie, o ile lat wcześniej mogliby być wolni od długu.</p>',
            key_points: [
                '<b>Dodatkowe wpłaty trafiają na kapitał:</b> Zakłada, że dodatkowa kwota jest stosowana bezpośrednio do salda kredytu, a nie tylko przedpłaca przyszłe odsetki.',
                '<b>Większy wpływ na dłuższych kredytach:</b> Efekt oszczędności jest najbardziej dramatyczny w przypadku długoterminowych kredytów, takich jak 30-letnie hipoteki, gdzie kapitalizacja ma dekady na działanie.',
                '<b>Porównaj z inwestowaniem:</b> Jeśli oprocentowanie kredytu jest niższe niż oczekiwane zwroty z inwestycji, matematycznie lepiej może być zainwestować te pieniądze zamiast tego — kalkulator pokazuje, z czego rezygnujesz w obu przypadkach.',
            ],
            howto: [
                { question: 'Dlaczego mała dodatkowa wpłata oszczędza tak dużo odsetek?', answer: '<p>Ponieważ odsetki kapitalizują się od pozostałego salda co miesiąc, wczesne zmniejszenie salda ma efekt kaskadowy — obliczenie odsetek na wszystkie przyszłe miesiące jest teraz oparte na mniejszej liczbie, przez cały pozostały okres.</p>' },
                { question: 'Czy zawsze powinienem nadpłacać hipotekę?', answer: '<p>Niekoniecznie — porównaj oprocentowanie kredytu z tym, co realistycznie mógłbyś zarobić, inwestując te pieniądze. Dodatkowe wpłaty mają najwięcej sensu przy zadłużeniu o wyższym oprocentowaniu.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Kredytu', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Pierwotny Okres Kredytowania', type: 'number', unit: 'lat', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Dodatkowa Wpłata Miesięczna', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Zaoszczędzony Czas', unit: 'mies.', precision: 1 },
                { name: 'interest_saved', label: 'Zaoszczędzone Odsetki', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-ahorro-pago-extra',
            title: 'Calculadora de Ahorro por Pago Extra - Amortización de Préstamo',
            h1: 'Calculadora de Ahorro por Pago Extra',
            meta_title: 'Calculadora de Pago Extra | Ahorra Tiempo e Intereses en tu Préstamo',
            meta_description: 'Calcula cuánto tiempo e interés ahorrarás pagando una cantidad extra hacia el capital de tu préstamo o hipoteca cada mes.',
            short_answer: 'Esta calculadora muestra cuántos meses (y cuánto interés) ahorrarás añadiendo una cantidad extra fija a tu pago mensual regular del préstamo, destinada directamente al capital.',
            intro_text: '<p>Cada dólar extra pagado hacia el capital de un préstamo reduce el saldo sobre el que se calculan los intereses futuros — como el interés se compone mensualmente sobre el saldo pendiente, incluso pagos extra modestos se acumulan en ahorros significativos de tiempo e intereses durante un plazo de préstamo largo.</p><p><b>Propietarios de vivienda y prestatarios</b> usan esto para decidir si un pago mensual extra vale la pena en comparación con invertir ese dinero en otro lugar, y para ver concretamente cuántos años antes podrían estar libres de deudas.</p>',
            key_points: [
                '<b>Los pagos extra van al capital:</b> Asume que la cantidad extra se aplica directamente al saldo del préstamo, no solo prepagando intereses futuros.',
                '<b>Mayor impacto en préstamos más largos:</b> El efecto de ahorro es más dramático en préstamos a largo plazo como hipotecas a 30 años, donde la capitalización tiene décadas para actuar.',
                '<b>Compara con invertir:</b> Si la tasa de interés de tu préstamo es menor que los rendimientos de inversión esperados, matemáticamente puede ser mejor invertir ese dinero en su lugar — esta calculadora muestra a qué renuncias de cualquier manera.',
            ],
            howto: [
                { question: '¿Por qué un pequeño pago extra ahorra tanto interés?', answer: '<p>Porque el interés se compone sobre el saldo restante cada mes, reducir el saldo temprano tiene un efecto en cascada — el cálculo de interés de cada mes futuro ahora se basa en un número menor, durante todo el plazo restante.</p>' },
                { question: '¿Siempre debo pagar extra en mi hipoteca?', answer: '<p>No necesariamente — compara la tasa de interés de tu préstamo con lo que realistamente podrías ganar invirtiendo ese dinero. Los pagos extra tienen más sentido en deudas de mayor interés.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto del Préstamo', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Plazo Original del Préstamo', type: 'number', unit: 'años', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Pago Mensual Extra', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Tiempo Ahorrado', unit: 'meses', precision: 1 },
                { name: 'interest_saved', label: 'Interés Ahorrado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-economies-paiement-supplementaire',
            title: 'Calculateur d’Économies sur Paiement Supplémentaire - Prêt',
            h1: 'Calculateur d’Économies sur Paiement Supplémentaire',
            meta_title: 'Calculateur de Paiement Supplémentaire | Économisez Temps et Intérêts',
            meta_description: 'Calculez combien de temps et d’intérêts vous économiserez en payant un montant supplémentaire sur le capital de votre prêt ou hypothèque chaque mois.',
            short_answer: 'Ce calculateur montre combien de mois (et d’intérêts) vous économiserez en ajoutant un montant supplémentaire fixe à votre paiement mensuel habituel, allant directement au capital.',
            intro_text: '<p>Chaque dollar supplémentaire payé sur le capital d’un prêt réduit le solde sur lequel les intérêts futurs sont calculés — les intérêts se composant mensuellement sur le solde restant, même des paiements supplémentaires modestes s’accumulent en économies significatives de temps et d’intérêts sur une longue durée de prêt.</p><p><b>Propriétaires et emprunteurs</b> utilisent cela pour décider si un paiement mensuel supplémentaire en vaut la peine par rapport à investir cet argent ailleurs, et pour voir concrètement combien d’années plus tôt ils pourraient être libres de dettes.</p>',
            key_points: [
                '<b>Les paiements supplémentaires vont au capital :</b> Suppose que le montant supplémentaire est appliqué directement au solde du prêt, pas seulement en prépayant les intérêts futurs.',
                '<b>Impact plus important sur les prêts longs :</b> L’effet d’économie est le plus spectaculaire sur les prêts à long terme comme les hypothèques sur 30 ans, où la capitalisation a des décennies pour agir.',
                '<b>Comparez avec l’investissement :</b> Si le taux d’intérêt de votre prêt est inférieur aux rendements d’investissement attendus, il peut être mathématiquement préférable d’investir cet argent à la place — ce calculateur montre ce à quoi vous renoncez dans les deux cas.',
            ],
            howto: [
                { question: 'Pourquoi un petit paiement supplémentaire économise-t-il autant d’intérêts ?', answer: '<p>Parce que les intérêts se composent sur le solde restant chaque mois, réduire le solde tôt a un effet en cascade — le calcul des intérêts de chaque mois futur est désormais basé sur un montant plus petit, pour toute la durée restante.</p>' },
                { question: 'Dois-je toujours payer plus sur mon hypothèque ?', answer: '<p>Pas nécessairement — comparez le taux d’intérêt de votre prêt à ce que vous pourriez réellement gagner en investissant cet argent. Les paiements supplémentaires ont le plus de sens sur les dettes à taux plus élevé.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant du Prêt', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Durée Initiale du Prêt', type: 'number', unit: 'ans', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Paiement Mensuel Supplémentaire', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Temps Économisé', unit: 'mois', precision: 1 },
                { name: 'interest_saved', label: 'Intérêts Économisés', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-risparmio-rata-extra',
            title: 'Calcolatore Risparmio con Rata Extra - Estinzione Prestito',
            h1: 'Calcolatore Risparmio con Rata Extra',
            meta_title: 'Calcolatore Rata Extra | Risparmia Tempo e Interessi sul Prestito',
            meta_description: 'Calcola quanto tempo e interessi risparmierai pagando un importo extra sul capitale del tuo prestito o mutuo ogni mese.',
            short_answer: 'Questo calcolatore mostra quanti mesi (e interessi) risparmierai aggiungendo un importo extra fisso alla tua rata mensile regolare del prestito, destinato direttamente al capitale.',
            intro_text: '<p>Ogni dollaro extra pagato sul capitale di un prestito riduce il saldo su cui vengono calcolati gli interessi futuri — poiché gli interessi si capitalizzano mensilmente sul saldo residuo, anche pagamenti extra modesti si accumulano in risparmi significativi di tempo e interessi su una lunga durata del prestito.</p><p><b>Proprietari di case e mutuatari</b> usano questo per decidere se una rata mensile extra vale la pena rispetto a investire quel denaro altrove, e per vedere concretamente di quanti anni prima potrebbero essere liberi dai debiti.</p>',
            key_points: [
                '<b>I pagamenti extra vanno al capitale:</b> Presuppone che l’importo extra sia applicato direttamente al saldo del prestito, non solo prepagando gli interessi futuri.',
                '<b>Impatto maggiore sui prestiti più lunghi:</b> L’effetto di risparmio è più drammatico sui prestiti a lungo termine come i mutui trentennali, dove la capitalizzazione ha decenni per agire.',
                '<b>Confronta con l’investimento:</b> Se il tasso di interesse del tuo prestito è inferiore ai rendimenti di investimento attesi, potrebbe essere matematicamente meglio investire quel denaro invece — questo calcolatore mostra a cosa rinunci in entrambi i casi.',
            ],
            howto: [
                { question: 'Perché una piccola rata extra risparmia così tanti interessi?', answer: '<p>Poiché gli interessi si capitalizzano sul saldo residuo ogni mese, ridurre il saldo presto ha un effetto a cascata — il calcolo degli interessi per tutti i mesi futuri si basa ora su un numero minore, per l’intera durata residua.</p>' },
                { question: 'Dovrei sempre pagare extra sul mio mutuo?', answer: '<p>Non necessariamente — confronta il tasso di interesse del tuo prestito con quanto potresti realisticamente guadagnare investendo quel denaro. I pagamenti extra hanno più senso su debiti con tassi più alti.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo del Prestito', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Durata Originale del Prestito', type: 'number', unit: 'anni', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Rata Mensile Extra', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Tempo Risparmiato', unit: 'mesi', precision: 1 },
                { name: 'interest_saved', label: 'Interessi Risparmiati', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'zusatzzahlung-ersparnis-rechner',
            title: 'Zusatzzahlung-Ersparnis-Rechner - Kredittilgung',
            h1: 'Zusatzzahlung-Ersparnis-Rechner',
            meta_title: 'Zusatzzahlungs-Rechner | Zeit und Zinsen bei Ihrem Kredit Sparen',
            meta_description: 'Berechnen Sie, wie viel Zeit und Zinsen Sie sparen, indem Sie jeden Monat einen zusätzlichen Betrag auf die Tilgung Ihres Kredits oder Ihrer Hypothek zahlen.',
            short_answer: 'Dieser Rechner zeigt, wie viele Monate (und wie viel Zinsen) Sie sparen, indem Sie einen festen zusätzlichen Betrag zu Ihrer regulären monatlichen Kreditrate hinzufügen, der direkt auf die Tilgung geht.',
            intro_text: '<p>Jeder zusätzliche Dollar, der auf die Tilgung eines Kredits gezahlt wird, verringert den Saldo, auf den künftige Zinsen berechnet werden — da sich Zinsen monatlich auf den ausstehenden Saldo verzinsen, summieren sich selbst bescheidene Zusatzzahlungen zu erheblichen Zeit- und Zinsersparnissen über eine lange Kreditlaufzeit.</p><p><b>Hausbesitzer und Kreditnehmer</b> nutzen dies, um zu entscheiden, ob eine zusätzliche monatliche Zahlung sich lohnt im Vergleich zur anderweitigen Investition dieses Geldes, und um konkret zu sehen, um wie viele Jahre früher sie schuldenfrei sein könnten.</p>',
            key_points: [
                '<b>Zusatzzahlungen gehen auf die Tilgung:</b> Setzt voraus, dass der zusätzliche Betrag direkt auf den Kreditsaldo angewendet wird, nicht nur künftige Zinsen vorauszahlt.',
                '<b>Größere Wirkung bei längeren Krediten:</b> Der Sparent-Effekt ist bei langfristigen Krediten wie 30-jährigen Hypotheken am dramatischsten, wo die Zinseszinsrechnung Jahrzehnte Zeit hat zu wirken.',
                '<b>Vergleich mit Investieren:</b> Wenn der Zinssatz Ihres Kredits niedriger ist als erwartete Anlagerenditen, kann es mathematisch besser sein, das Geld stattdessen zu investieren — dieser Rechner zeigt, worauf Sie in beiden Fällen verzichten.',
            ],
            howto: [
                { question: 'Warum spart eine kleine Zusatzzahlung so viele Zinsen?', answer: '<p>Da sich Zinsen jeden Monat auf den verbleibenden Saldo verzinsen, hat eine frühe Saldoreduzierung einen Kaskadeneffekt — die Zinsberechnung jedes zukünftigen Monats basiert nun auf einer kleineren Zahl, für die gesamte verbleibende Laufzeit.</p>' },
                { question: 'Sollte ich immer zusätzlich auf meine Hypothek zahlen?', answer: '<p>Nicht unbedingt — vergleichen Sie den Zinssatz Ihres Kredits mit dem, was Sie realistisch durch Investieren dieses Geldes verdienen könnten. Zusatzzahlungen sind am sinnvollsten bei Schulden mit höherem Zinssatz.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kreditbetrag', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '300000' },
                { name: 'annual_rate', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '6' },
                { name: 'years', label: 'Ursprüngliche Kreditlaufzeit', type: 'number', unit: 'Jahre', min: 1, max: 40, placeholder: '30' },
                { name: 'extra_payment', label: 'Zusätzliche Monatliche Zahlung', type: 'number', unit: '$', min: 0, max: 100000, placeholder: '200' },
            ],
            outputs: [
                { name: 'months_saved', label: 'Gesparte Zeit', unit: 'Monate', precision: 1 },
                { name: 'interest_saved', label: 'Gesparte Zinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1022: Interest-Only Loan Calculator
// ============================================================
const interestOnly: ToolDef = {
    id: '1022',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 200000 },
            { key: 'annual_rate', default: 4 },
        ],
        formulas: {
            monthly_payment: 'principal*annual_rate/100/12',
            annual_payment: 'principal*annual_rate/100',
        },
        outputs: [
            { key: 'monthly_payment', precision: 2 },
            { key: 'annual_payment', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'interest-only-loan-calculator',
            title: 'Interest-Only Loan Calculator',
            h1: 'Interest-Only Loan Calculator',
            meta_title: 'Interest-Only Loan Calculator | Monthly Payment',
            meta_description: 'Calculate the monthly payment on an interest-only loan, where you pay only the interest and the principal balance stays unchanged.',
            short_answer: 'This calculator computes the monthly payment on an interest-only loan — where your payment covers only the interest charge, and the principal balance remains unchanged until the interest-only period ends.',
            intro_text: '<p>An interest-only loan structure means your monthly payment covers just the interest accrued that month — none of it reduces the principal balance. This results in a lower monthly payment than a fully amortizing loan of the same size and rate, but the full principal is still owed at the end of the interest-only period.</p><p><b>Real estate investors and some mortgage borrowers</b> use interest-only structures to minimize monthly cash outflow during a specific period, often planning to refinance, sell, or switch to full amortization before the interest-only period ends.</p>',
            key_points: [
                '<b>Principal Never Decreases:</b> Unlike a standard amortizing loan, the balance stays exactly the same each month during the interest-only period.',
                '<b>Lower Monthly Payment:</b> Interest-only payments are always lower than the equivalent amortizing payment at the same rate, since none goes toward principal.',
                '<b>Payment Jumps Later:</b> Once the interest-only period ends, the payment typically increases sharply as amortization begins on the full remaining term.',
            ],
            howto: [
                { question: 'Will I ever pay off the loan with interest-only payments?', answer: '<p>No — the principal balance never decreases with pure interest-only payments. The loan is only paid off through a lump-sum payment, refinancing, sale of the asset, or a switch to amortizing payments.</p>' },
                { question: 'Why would someone choose an interest-only loan?', answer: '<p>Common reasons include maximizing near-term cash flow for an investment property, expecting a future income increase, or planning to sell or refinance before amortization begins.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Loan Amount', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Monthly Interest-Only Payment', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Annual Interest-Only Payment', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-kredita-tolko-procenty',
            title: 'Калькулятор кредита с выплатой только процентов',
            h1: 'Калькулятор кредита «только проценты»',
            meta_title: 'Калькулятор кредита только с процентами | Ежемесячный платёж',
            meta_description: 'Рассчитайте ежемесячный платёж по кредиту с выплатой только процентов, где основной долг остаётся неизменным.',
            short_answer: 'Этот калькулятор вычисляет ежемесячный платёж по кредиту с выплатой только процентов — где платёж покрывает лишь начисленные проценты, а основной долг остаётся неизменным до окончания такого периода.',
            intro_text: '<p>Структура кредита «только проценты» означает, что ежемесячный платёж покрывает лишь начисленные за месяц проценты — ничего не идёт на снижение основного долга. Это даёт более низкий ежемесячный платёж, чем полностью амортизируемый кредит той же суммы и ставки, но полная сумма долга всё равно причитается в конце периода «только процентов».</p><p><b>Инвесторы в недвижимость и некоторые ипотечные заёмщики</b> используют такую структуру, чтобы минимизировать ежемесячный отток денег в определённый период, часто планируя рефинансирование, продажу или переход на полную амортизацию до окончания периода.</p>',
            key_points: [
                '<b>Основной долг никогда не уменьшается:</b> В отличие от стандартного амортизируемого кредита, баланс остаётся точно таким же каждый месяц в период «только процентов».',
                '<b>Более низкий ежемесячный платёж:</b> Платежи «только проценты» всегда ниже эквивалентного амортизируемого платежа при той же ставке, так как ничего не идёт на основной долг.',
                '<b>Платёж резко растёт позже:</b> Когда период «только процентов» заканчивается, платёж обычно резко возрастает, так как начинается амортизация на весь оставшийся срок.',
            ],
            howto: [
                { question: 'Погашу ли я кредит платежами «только проценты»?', answer: '<p>Нет — основной долг никогда не уменьшается при чисто процентных платежах. Кредит погашается только единовременным платежом, рефинансированием, продажей актива или переходом на амортизируемые платежи.</p>' },
                { question: 'Почему кто-то выбирает кредит «только проценты»?', answer: '<p>Частые причины: максимизация краткосрочного денежного потока для инвестиционной недвижимости, ожидание будущего роста дохода, или план продать/рефинансировать до начала амортизации.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Сумма кредита', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Ежемесячный платёж (только %)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Годовой платёж (только %)', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'tikai-procentu-aizdevuma-kalkulators',
            title: 'Tikai Procentu Aizdevuma Kalkulators',
            h1: 'Tikai Procentu Aizdevuma Kalkulators',
            meta_title: 'Tikai Procentu Aizdevuma Kalkulators | Ikmēneša Maksājums',
            meta_description: 'Aprēķiniet ikmēneša maksājumu aizdevumam ar tikai procentu maksājumiem, kur pamatsumma paliek nemainīga.',
            short_answer: 'Šis kalkulators aprēķina ikmēneša maksājumu aizdevumam ar tikai procentu maksājumiem — kur maksājums sedz tikai procentu maksu, un pamatsumma paliek nemainīga līdz tikai-procentu perioda beigām.',
            intro_text: '<p>Tikai-procentu aizdevuma struktūra nozīmē, ka ikmēneša maksājums sedz tikai attiecīgajā mēnesī uzkrāto procentu — nekas no tā nesamazina pamatsummu. Tas dod zemāku ikmēneša maksājumu nekā pilnībā amortizējošs aizdevums tāda paša izmēra un likmes, taču pilna pamatsumma joprojām jāsedz tikai-procentu perioda beigās.</p><p><b>Nekustamā īpašuma investori un daži hipotēkas ņēmēji</b> izmanto tikai-procentu struktūras, lai minimizētu ikmēneša naudas plūsmu noteiktā periodā, bieži plānojot refinansēt, pārdot vai pāriet uz pilnu amortizāciju pirms perioda beigām.</p>',
            key_points: [
                '<b>Pamatsumma nekad nesamazinās:</b> Atšķirībā no standarta amortizējoša aizdevuma, atlikums paliek tieši tāds pats katru mēnesi tikai-procentu periodā.',
                '<b>Zemāks ikmēneša maksājums:</b> Tikai-procentu maksājumi vienmēr ir zemāki nekā līdzvērtīgs amortizējošs maksājums pie tās pašas likmes, jo nekas neiet uz pamatsummu.',
                '<b>Maksājums vēlāk strauji pieaug:</b> Kad tikai-procentu periods beidzas, maksājums parasti strauji pieaug, jo sākas amortizācija par visu atlikušo termiņu.',
            ],
            howto: [
                { question: 'Vai jebkad nomaksāšu aizdevumu ar tikai-procentu maksājumiem?', answer: '<p>Nē — pamatsumma nekad nesamazinās ar tīri procentu maksājumiem. Aizdevums tiek atmaksāts tikai ar vienreizēju maksājumu, refinansēšanu, aktīva pārdošanu vai pāreju uz amortizējošiem maksājumiem.</p>' },
                { question: 'Kāpēc kāds izvēlētos tikai-procentu aizdevumu?', answer: '<p>Bieži iemesli ir tuvākā termiņa naudas plūsmas maksimizēšana investīciju īpašumam, gaidāms nākotnes ienākumu pieaugums, vai plāns pārdot vai refinansēt pirms amortizācijas sākuma.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Aizdevuma Summa', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Ikmēneša Maksājums (tikai %)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Gada Maksājums (tikai %)', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-kredytu-tylko-odsetki',
            title: 'Kalkulator Kredytu Tylko z Odsetkami',
            h1: 'Kalkulator Kredytu Tylko z Odsetkami',
            meta_title: 'Kalkulator Kredytu Tylko Odsetkowego | Rata Miesięczna',
            meta_description: 'Oblicz miesięczną ratę kredytu tylko z odsetkami, gdzie płacisz jedynie odsetki, a saldo kapitału pozostaje niezmienione.',
            short_answer: 'Ten kalkulator oblicza miesięczną ratę kredytu tylko z odsetkami — gdzie twoja rata pokrywa jedynie naliczone odsetki, a saldo kapitału pozostaje niezmienione do końca okresu tylko-odsetkowego.',
            intro_text: '<p>Struktura kredytu tylko z odsetkami oznacza, że twoja miesięczna rata pokrywa jedynie odsetki naliczone w danym miesiącu — nic z tego nie zmniejsza salda kapitału. Daje to niższą ratę miesięczną niż w pełni amortyzujący kredyt tej samej wysokości i oprocentowania, ale pełny kapitał wciąż jest należny na koniec okresu tylko-odsetkowego.</p><p><b>Inwestorzy w nieruchomości i niektórzy kredytobiorcy hipoteczni</b> używają struktur tylko-odsetkowych, aby zminimalizować miesięczny odpływ gotówki w określonym okresie, często planując refinansowanie, sprzedaż lub przejście na pełną amortyzację przed końcem okresu.</p>',
            key_points: [
                '<b>Kapitał nigdy nie maleje:</b> W przeciwieństwie do standardowego kredytu amortyzującego, saldo pozostaje dokładnie takie samo każdego miesiąca w okresie tylko-odsetkowym.',
                '<b>Niższa rata miesięczna:</b> Raty tylko-odsetkowe są zawsze niższe niż równoważna rata amortyzująca przy tym samym oprocentowaniu, ponieważ nic nie trafia na kapitał.',
                '<b>Rata gwałtownie rośnie później:</b> Po zakończeniu okresu tylko-odsetkowego rata zazwyczaj gwałtownie wzrasta, gdy zaczyna się amortyzacja na cały pozostały okres.',
            ],
            howto: [
                { question: 'Czy kiedykolwiek spłacę kredyt ratami tylko-odsetkowymi?', answer: '<p>Nie — saldo kapitału nigdy nie maleje przy czysto odsetkowych ratach. Kredyt jest spłacany tylko poprzez jednorazową wpłatę, refinansowanie, sprzedaż aktywa lub przejście na raty amortyzujące.</p>' },
                { question: 'Dlaczego ktoś wybrałby kredyt tylko-odsetkowy?', answer: '<p>Częste powody to maksymalizacja krótkoterminowego przepływu gotówki dla nieruchomości inwestycyjnej, oczekiwany przyszły wzrost dochodów, lub plan sprzedaży czy refinansowania przed rozpoczęciem amortyzacji.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Kredytu', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Rata Miesięczna (tylko odsetki)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Rata Roczna (tylko odsetki)', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-prestamo-solo-interes',
            title: 'Calculadora de Préstamo Solo de Interés',
            h1: 'Calculadora de Préstamo Solo de Interés',
            meta_title: 'Calculadora de Préstamo Solo Interés | Pago Mensual',
            meta_description: 'Calcula el pago mensual de un préstamo solo de interés, donde pagas únicamente el interés y el saldo del capital permanece sin cambios.',
            short_answer: 'Esta calculadora calcula el pago mensual de un préstamo solo de interés — donde tu pago cubre solo el cargo de interés, y el saldo del capital permanece sin cambios hasta que termina el período de solo interés.',
            intro_text: '<p>Una estructura de préstamo solo de interés significa que tu pago mensual cubre únicamente el interés acumulado ese mes — nada de eso reduce el saldo del capital. Esto resulta en un pago mensual más bajo que un préstamo totalmente amortizable del mismo monto y tasa, pero el capital completo todavía se debe al final del período solo de interés.</p><p><b>Los inversores inmobiliarios y algunos prestatarios hipotecarios</b> usan estructuras solo de interés para minimizar la salida de efectivo mensual durante un período específico, a menudo planeando refinanciar, vender o cambiar a amortización completa antes de que termine el período.</p>',
            key_points: [
                '<b>El capital nunca disminuye:</b> A diferencia de un préstamo amortizable estándar, el saldo permanece exactamente igual cada mes durante el período solo de interés.',
                '<b>Pago mensual más bajo:</b> Los pagos solo de interés siempre son más bajos que el pago amortizable equivalente a la misma tasa, ya que nada va al capital.',
                '<b>El pago aumenta después:</b> Una vez que termina el período solo de interés, el pago típicamente aumenta bruscamente cuando comienza la amortización sobre el plazo restante completo.',
            ],
            howto: [
                { question: '¿Alguna vez pagaré el préstamo con pagos solo de interés?', answer: '<p>No — el saldo del capital nunca disminuye con pagos puramente de interés. El préstamo solo se paga mediante un pago único, refinanciamiento, venta del activo, o un cambio a pagos amortizables.</p>' },
                { question: '¿Por qué alguien elegiría un préstamo solo de interés?', answer: '<p>Las razones comunes incluyen maximizar el flujo de caja a corto plazo para una propiedad de inversión, esperar un aumento de ingresos futuro, o planear vender o refinanciar antes de que comience la amortización.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto del Préstamo', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Pago Mensual (Solo Interés)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Pago Anual (Solo Interés)', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-pret-interets-seuls',
            title: 'Calculateur de Prêt à Intérêts Seuls',
            h1: 'Calculateur de Prêt à Intérêts Seuls',
            meta_title: 'Calculateur de Prêt à Intérêts Seuls | Mensualité',
            meta_description: 'Calculez la mensualité d’un prêt à intérêts seuls, où vous ne payez que les intérêts et le capital reste inchangé.',
            short_answer: 'Ce calculateur calcule la mensualité d’un prêt à intérêts seuls — où votre paiement couvre uniquement les intérêts, et le capital reste inchangé jusqu’à la fin de la période à intérêts seuls.',
            intro_text: '<p>Une structure de prêt à intérêts seuls signifie que votre mensualité couvre uniquement les intérêts accumulés ce mois-là — rien ne réduit le capital. Cela se traduit par une mensualité plus basse qu’un prêt entièrement amortissable de même montant et taux, mais le capital complet reste dû à la fin de la période à intérêts seuls.</p><p><b>Les investisseurs immobiliers et certains emprunteurs hypothécaires</b> utilisent des structures à intérêts seuls pour minimiser les sorties de trésorerie mensuelles pendant une période donnée, prévoyant souvent de refinancer, vendre, ou passer à l’amortissement complet avant la fin de la période.</p>',
            key_points: [
                '<b>Le capital ne diminue jamais :</b> Contrairement à un prêt amortissable standard, le solde reste exactement le même chaque mois pendant la période à intérêts seuls.',
                '<b>Mensualité plus basse :</b> Les paiements à intérêts seuls sont toujours inférieurs au paiement amortissable équivalent au même taux, puisque rien ne va au capital.',
                '<b>Le paiement augmente ensuite :</b> Une fois la période à intérêts seuls terminée, le paiement augmente généralement fortement lorsque l’amortissement commence sur la durée restante complète.',
            ],
            howto: [
                { question: 'Vais-je un jour rembourser le prêt avec des paiements à intérêts seuls ?', answer: '<p>Non — le capital ne diminue jamais avec des paiements purement à intérêts. Le prêt n’est remboursé que par un paiement forfaitaire, un refinancement, la vente de l’actif, ou un passage à des paiements amortissables.</p>' },
                { question: 'Pourquoi choisirait-on un prêt à intérêts seuls ?', answer: '<p>Les raisons courantes incluent la maximisation des flux de trésorerie à court terme pour un bien locatif, une augmentation de revenus attendue, ou un plan de vente ou de refinancement avant le début de l’amortissement.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant du Prêt', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Mensualité (Intérêts Seuls)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Paiement Annuel (Intérêts Seuls)', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-prestito-solo-interessi',
            title: 'Calcolatore Prestito Solo Interessi',
            h1: 'Calcolatore Prestito Solo Interessi',
            meta_title: 'Calcolatore Prestito Solo Interessi | Rata Mensile',
            meta_description: 'Calcola la rata mensile di un prestito solo interessi, dove paghi solo gli interessi e il capitale rimane invariato.',
            short_answer: 'Questo calcolatore calcola la rata mensile di un prestito solo interessi — dove il tuo pagamento copre solo gli interessi maturati, e il saldo del capitale rimane invariato fino alla fine del periodo solo interessi.',
            intro_text: '<p>Una struttura di prestito solo interessi significa che la tua rata mensile copre solo gli interessi maturati quel mese — nulla di ciò riduce il saldo del capitale. Questo si traduce in una rata mensile più bassa rispetto a un prestito completamente ammortizzante dello stesso importo e tasso, ma l’intero capitale è ancora dovuto alla fine del periodo solo interessi.</p><p><b>Gli investitori immobiliari e alcuni mutuatari</b> usano strutture solo interessi per minimizzare il deflusso di cassa mensile durante un periodo specifico, spesso pianificando di rifinanziare, vendere o passare all’ammortamento completo prima della fine del periodo.</p>',
            key_points: [
                '<b>Il capitale non diminuisce mai:</b> A differenza di un prestito ammortizzante standard, il saldo rimane esattamente lo stesso ogni mese durante il periodo solo interessi.',
                '<b>Rata mensile più bassa:</b> I pagamenti solo interessi sono sempre più bassi della rata ammortizzante equivalente allo stesso tasso, poiché nulla va al capitale.',
                '<b>La rata aumenta successivamente:</b> Una volta terminato il periodo solo interessi, la rata tipicamente aumenta bruscamente quando inizia l’ammortamento sull’intera durata residua.',
            ],
            howto: [
                { question: 'Estinguerò mai il prestito con pagamenti solo interessi?', answer: '<p>No — il saldo del capitale non diminuisce mai con pagamenti puramente di interessi. Il prestito viene estinto solo tramite un pagamento forfettario, rifinanziamento, vendita dell’immobile, o passaggio a rate ammortizzanti.</p>' },
                { question: 'Perché qualcuno sceglierebbe un prestito solo interessi?', answer: '<p>Ragioni comuni includono massimizzare il flusso di cassa a breve termine per una proprietà d’investimento, un aumento di reddito futuro atteso, o un piano di vendita o rifinanziamento prima dell’inizio dell’ammortamento.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo del Prestito', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Rata Mensile (Solo Interessi)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Rata Annuale (Solo Interessi)', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'tilgungsfreies-darlehen-rechner',
            title: 'Tilgungsfreies Darlehen Rechner',
            h1: 'Tilgungsfreies Darlehen Rechner',
            meta_title: 'Rechner für Zinsdarlehen | Monatliche Rate',
            meta_description: 'Berechnen Sie die monatliche Rate für ein tilgungsfreies Darlehen, bei dem Sie nur die Zinsen zahlen und die Tilgung unverändert bleibt.',
            short_answer: 'Dieser Rechner berechnet die monatliche Rate für ein tilgungsfreies Darlehen — bei dem Ihre Zahlung nur die Zinsbelastung abdeckt und die Tilgung bis zum Ende der tilgungsfreien Phase unverändert bleibt.',
            intro_text: '<p>Eine tilgungsfreie Darlehensstruktur bedeutet, dass Ihre monatliche Rate nur die in diesem Monat angefallenen Zinsen abdeckt — nichts davon reduziert die Tilgung. Dies führt zu einer niedrigeren monatlichen Rate als bei einem voll tilgenden Darlehen gleicher Höhe und Zinssatz, aber die volle Tilgung ist am Ende der tilgungsfreien Phase weiterhin fällig.</p><p><b>Immobilieninvestoren und manche Hypothekennehmer</b> nutzen tilgungsfreie Strukturen, um den monatlichen Geldabfluss während eines bestimmten Zeitraums zu minimieren, oft mit dem Plan, vor Ende der tilgungsfreien Phase zu refinanzieren, zu verkaufen oder zur vollen Tilgung zu wechseln.</p>',
            key_points: [
                '<b>Tilgung sinkt nie:</b> Anders als bei einem Standard-Tilgungsdarlehen bleibt der Saldo während der tilgungsfreien Phase jeden Monat genau gleich.',
                '<b>Niedrigere monatliche Rate:</b> Tilgungsfreie Zahlungen sind bei gleichem Zinssatz immer niedriger als die entsprechende Tilgungsrate, da nichts auf die Tilgung geht.',
                '<b>Rate steigt später sprunghaft:</b> Nach Ende der tilgungsfreien Phase steigt die Rate typischerweise stark an, da die Tilgung für die gesamte restliche Laufzeit beginnt.',
            ],
            howto: [
                { question: 'Werde ich das Darlehen jemals mit tilgungsfreien Zahlungen abbezahlen?', answer: '<p>Nein — die Tilgung sinkt bei reinen Zinszahlungen nie. Das Darlehen wird nur durch eine Einmalzahlung, Refinanzierung, den Verkauf des Vermögenswerts oder einen Wechsel zu Tilgungszahlungen abbezahlt.</p>' },
                { question: 'Warum würde jemand ein tilgungsfreies Darlehen wählen?', answer: '<p>Häufige Gründe sind die Maximierung des kurzfristigen Cashflows für eine Anlageimmobilie, ein erwarteter künftiger Einkommensanstieg, oder ein Plan, vor Beginn der Tilgung zu verkaufen oder zu refinanzieren.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kreditbetrag', type: 'number', unit: '$', min: 100, max: 20000000, placeholder: '200000' },
                { name: 'annual_rate', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0.1, max: 30, placeholder: '4' },
            ],
            outputs: [
                { name: 'monthly_payment', label: 'Monatliche Rate (Nur Zinsen)', unit: '$', precision: 2 },
                { name: 'annual_payment', label: 'Jährliche Rate (Nur Zinsen)', unit: '$', precision: 2 },
            ],
        },
    },
}

export const tools: ToolDef[] = [loanPayment, mortgage, autoLoan, simpleInterest, compoundInterest, dti, ltv, payoffTime, extraPayment, interestOnly]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: LOANS_DEBT_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: LOANS_DEBT_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} loans & debt calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
