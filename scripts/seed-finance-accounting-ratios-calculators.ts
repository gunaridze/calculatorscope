// One-off script: seeds 12 new Accounting & Financial Ratio calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-finance-accounting-ratios-calculators.ts
//
// Tool IDs 1057-1068, category_id '28' (Accounting & Financial Ratios, under Finance).
//
// REGIONAL ADAPTATION NOTE (see memory calculator-regionalization-rule):
// unlike VAT/business-pricing tools, standard accounting ratios (Current Ratio,
// Quick Ratio, D/E, ROE, ROA, Net Profit Margin, turnover ratios, DSO, Interest
// Coverage) are dimensionless (ratios, %, days, times) - there is no legally
// mandated country-specific "rate" the way VAT has one, so no per-locale
// numeric default is needed for those. The only two tools with a genuine
// monetary OUTPUT (Working Capital, EPS) get the same currency treatment used
// throughout this project: EN/RU carry a USD/EUR selector (unitFrom), while
// DE/LV/PL/IT/FR/ES use their own fixed local currency symbol.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ACCOUNTING_RATIOS_CATEGORY_ID = '28'

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
        formulas: Record<string, string>
        outputs: Array<{ key: string; precision?: number }>
    }
    locales: Record<string, LocaleContent>
}

// Reusable currency selector for EN/RU (global-audience locales) - only used
// on the two tools whose output is a genuine monetary amount (Working Capital, EPS).
const currencyInput: InputField = {
    name: 'currency',
    label: 'Currency',
    type: 'select',
    options: [
        { value: '$', label: 'USD ($)' },
        { value: '€', label: 'EUR (€)' },
    ],
}
const currencyInputRu: InputField = {
    name: 'currency',
    label: 'Валюта',
    type: 'select',
    options: [
        { value: '$', label: 'USD ($)' },
        { value: '€', label: 'EUR (€)' },
    ],
}

// ============================================================
// 1057: Current Ratio Calculator
// ============================================================
const currentRatio: ToolDef = {
    id: '1057',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'current_assets', default: 150000 },
            { key: 'current_liabilities', default: 75000 },
        ],
        formulas: {
            current_ratio: 'current_assets/current_liabilities',
        },
        outputs: [
            { key: 'current_ratio', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'current-ratio-calculator',
            title: 'Current Ratio Calculator',
            h1: 'Current Ratio Calculator',
            meta_title: 'Current Ratio Calculator | Liquidity & Short-Term Solvency',
            meta_description: 'Calculate the current ratio from current assets and current liabilities — a core liquidity metric showing whether a company can cover its short-term obligations.',
            short_answer: 'This calculator divides current assets by current liabilities to give you the current ratio — a measure of how well a company can pay off its short-term debts with its short-term assets.',
            intro_text: '<p>The current ratio is one of the most widely used liquidity ratios in financial analysis. It answers a simple question: for every unit of short-term debt, how many units of short-term assets does the company have to cover it?</p><p><b>Lenders, investors, and business owners</b> use this ratio to gauge short-term financial health before a more detailed cash-flow analysis. It works the same way regardless of currency or accounting jurisdiction — only the underlying balance-sheet figures (GAAP or IFRS) need to be current.</p>',
            key_points: [
                '<b>Formula:</b> Current Ratio = Current Assets ÷ Current Liabilities.',
                '<b>Rule of thumb:</b> a ratio between 1.5 and 3 is generally considered healthy — below 1 suggests the company may struggle to meet short-term obligations, while a very high ratio (5+) can indicate idle assets not being put to productive use.',
                '<b>Industry matters:</b> "healthy" varies a lot by sector — retailers with fast inventory turnover can operate safely with lower ratios than capital-intensive manufacturers.',
            ],
            howto: [
                { question: 'What counts as a "current" asset or liability?', answer: '<p>Current assets are those expected to be converted to cash within one year (cash, receivables, inventory); current liabilities are obligations due within one year (accounts payable, short-term debt, accrued expenses) — both are found on the balance sheet.</p>' },
                { question: 'Is a higher current ratio always better?', answer: '<p>Not necessarily — an excessively high ratio can mean the company is hoarding cash or has too much slow-moving inventory instead of investing in growth. Context (industry, growth stage) matters more than the number alone.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Current Assets', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Current Liabilities', type: 'number', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Current Ratio', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-koefficienta-tekushchey-likvidnosti',
            title: 'Калькулятор коэффициента текущей ликвидности',
            h1: 'Калькулятор коэффициента текущей ликвидности',
            meta_title: 'Коэффициент текущей ликвидности | Ликвидность и краткосрочная платёжеспособность',
            meta_description: 'Рассчитайте коэффициент текущей ликвидности из оборотных активов и краткосрочных обязательств — ключевой показатель способности компании покрывать краткосрочные долги.',
            short_answer: 'Этот калькулятор делит оборотные активы на краткосрочные обязательства, чтобы получить коэффициент текущей ликвидности — показатель того, насколько хорошо компания может погасить краткосрочные долги за счёт краткосрочных активов.',
            intro_text: '<p>Коэффициент текущей ликвидности — один из самых широко используемых показателей ликвидности в финансовом анализе. Он отвечает на простой вопрос: сколько единиц краткосрочных активов приходится на каждую единицу краткосрочного долга?</p><p><b>Кредиторы, инвесторы и владельцы бизнеса</b> используют этот коэффициент для оценки краткосрочного финансового здоровья. Он работает одинаково независимо от валюты или юрисдикции учёта — важны лишь актуальные данные баланса (GAAP или МСФО).</p>',
            key_points: [
                '<b>Формула:</b> Коэффициент текущей ликвидности = Оборотные активы ÷ Краткосрочные обязательства.',
                '<b>Эмпирическое правило:</b> значение от 1,5 до 3 обычно считается здоровым — ниже 1 говорит о возможных трудностях с краткосрочными обязательствами, а очень высокое значение (5+) может указывать на неэффективное использование активов.',
                '<b>Отрасль важна:</b> "здоровое" значение сильно варьируется по секторам — розница с быстрой оборачиваемостью запасов может безопасно работать с более низким коэффициентом, чем капиталоёмкое производство.',
            ],
            howto: [
                { question: 'Что считается "текущим" активом или обязательством?', answer: '<p>Оборотные активы — те, что ожидается конвертировать в денежные средства в течение года (деньги, дебиторка, запасы); краткосрочные обязательства — долги со сроком погашения до года (кредиторка, краткосрочные займы, начисленные расходы).</p>' },
                { question: 'Всегда ли более высокий коэффициент лучше?', answer: '<p>Не обязательно — слишком высокий коэффициент может означать, что компания накапливает наличные или имеет избыток медленно оборачиваемых запасов вместо инвестиций в рост.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Оборотные активы', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Краткосрочные обязательства', type: 'number', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Коэффициент текущей ликвидности', precision: 2 },
            ],
        },
        lv: {
            slug: 'kartejas-likviditates-koeficienta-kalkulators',
            title: 'Kārtējās Likviditātes Koeficienta Kalkulators',
            h1: 'Kārtējās Likviditātes Koeficienta Kalkulators',
            meta_title: 'Kārtējās Likviditātes Koeficients | Likviditāte un Īstermiņa Maksātspēja',
            meta_description: 'Aprēķiniet kārtējās likviditātes koeficientu no apgrozāmajiem līdzekļiem un īstermiņa saistībām — galveno likviditātes rādītāju.',
            short_answer: 'Šis kalkulators dala apgrozāmos līdzekļus ar īstermiņa saistībām, lai iegūtu kārtējās likviditātes koeficientu — rādītāju, cik labi uzņēmums var segt īstermiņa parādus ar īstermiņa aktīviem.',
            intro_text: '<p>Kārtējās likviditātes koeficients ir viens no visplašāk izmantotajiem likviditātes rādītājiem finanšu analīzē. Tas atbild uz vienkāršu jautājumu: cik apgrozāmo līdzekļu vienību ir uz katru īstermiņa parāda vienību?</p><p><b>Kreditori, investori un uzņēmumu īpašnieki</b> to izmanto, lai novērtētu īstermiņa finanšu veselību. Tas darbojas vienādi neatkarīgi no valūtas vai uzskaites jurisdikcijas.</p>',
            key_points: [
                '<b>Formula:</b> Kārtējās Likviditātes Koeficients = Apgrozāmie Līdzekļi ÷ Īstermiņa Saistības.',
                '<b>Vispārējs noteikums:</b> vērtība no 1,5 līdz 3 parasti tiek uzskatīta par veselīgu — zem 1 norāda uz iespējamām grūtībām, ļoti augsta vērtība (5+) var norādīt uz neefektīvi izmantotiem aktīviem.',
                '<b>Nozare ir svarīga:</b> "veselīga" vērtība ļoti atšķiras pēc nozares — mazumtirdzniecība ar ātru krājumu apriti var droši darboties ar zemāku koeficientu nekā kapitālietilpīga ražošana.',
            ],
            howto: [
                { question: 'Kas tiek uzskatīts par "kārtējo" aktīvu vai saistību?', answer: '<p>Apgrozāmie līdzekļi ir tie, kurus sagaida konvertēt naudā gada laikā (nauda, debitori, krājumi); īstermiņa saistības ir parādi ar termiņu līdz gadam (kreditori, īstermiņa aizdevumi).</p>' },
                { question: 'Vai augstāks koeficients vienmēr ir labāks?', answer: '<p>Ne vienmēr — pārāk augsts koeficients var nozīmēt, ka uzņēmums uzkrāj naudu vai tam ir pārāk daudz lēni apgrozāmu krājumu, nevis investē izaugsmē.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Apgrozāmie Līdzekļi', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Īstermiņa Saistības', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Kārtējās Likviditātes Koeficients', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wskaznika-plynnosci-biezacej',
            title: 'Kalkulator Wskaźnika Płynności Bieżącej',
            h1: 'Kalkulator Wskaźnika Płynności Bieżącej',
            meta_title: 'Wskaźnik Płynności Bieżącej | Płynność i Wypłacalność Krótkoterminowa',
            meta_description: 'Oblicz wskaźnik płynności bieżącej z aktywów obrotowych i zobowiązań krótkoterminowych — kluczowy miernik płynności.',
            short_answer: 'Ten kalkulator dzieli aktywa obrotowe przez zobowiązania krótkoterminowe, aby uzyskać wskaźnik płynności bieżącej — miarę tego, jak dobrze firma może spłacić krótkoterminowe długi swoimi krótkoterminowymi aktywami.',
            intro_text: '<p>Wskaźnik płynności bieżącej jest jednym z najczęściej stosowanych wskaźników płynności w analizie finansowej. Odpowiada na proste pytanie: ile jednostek aktywów krótkoterminowych przypada na każdą jednostkę krótkoterminowego długu?</p><p><b>Kredytodawcy, inwestorzy i właściciele firm</b> używają tego wskaźnika do oceny krótkoterminowej kondycji finansowej. Działa tak samo niezależnie od waluty czy jurysdykcji rachunkowej.</p>',
            key_points: [
                '<b>Wzór:</b> Wskaźnik Płynności Bieżącej = Aktywa Obrotowe ÷ Zobowiązania Krótkoterminowe.',
                '<b>Reguła kciuka:</b> wartość między 1,5 a 3 jest zwykle uważana za zdrową — poniżej 1 sugeruje możliwe trudności, a bardzo wysoka wartość (5+) może wskazywać na nieefektywnie wykorzystywane aktywa.',
                '<b>Branża ma znaczenie:</b> "zdrowa" wartość mocno różni się w zależności od sektora — detaliści z szybką rotacją zapasów mogą bezpiecznie działać z niższym wskaźnikiem niż kapitałochłonni producenci.',
            ],
            howto: [
                { question: 'Co liczy się jako aktywo lub zobowiązanie "bieżące"?', answer: '<p>Aktywa obrotowe to te oczekiwane do zamiany na gotówkę w ciągu roku (gotówka, należności, zapasy); zobowiązania krótkoterminowe to długi z terminem do roku (zobowiązania handlowe, krótkoterminowe pożyczki).</p>' },
                { question: 'Czy wyższy wskaźnik zawsze jest lepszy?', answer: '<p>Niekoniecznie — zbyt wysoki wskaźnik może oznaczać, że firma gromadzi gotówkę lub ma zbyt dużo wolno rotujących zapasów zamiast inwestować w rozwój.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Aktywa Obrotowe', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Zobowiązania Krótkoterminowe', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Wskaźnik Płynności Bieżącej', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-ratio-de-liquidez-corriente',
            title: 'Calculadora de Ratio de Liquidez Corriente',
            h1: 'Calculadora de Ratio de Liquidez Corriente',
            meta_title: 'Ratio de Liquidez Corriente | Liquidez y Solvencia a Corto Plazo',
            meta_description: 'Calcula el ratio de liquidez corriente a partir del activo corriente y el pasivo corriente — una métrica clave de liquidez.',
            short_answer: 'Esta calculadora divide el activo corriente entre el pasivo corriente para darte el ratio de liquidez corriente — una medida de cuán bien una empresa puede cubrir sus deudas a corto plazo con sus activos a corto plazo.',
            intro_text: '<p>El ratio de liquidez corriente es uno de los ratios de liquidez más utilizados en el análisis financiero. Responde a una pregunta simple: ¿cuántas unidades de activo a corto plazo tiene la empresa por cada unidad de deuda a corto plazo?</p><p><b>Prestamistas, inversores y propietarios de negocios en España</b> usan este ratio para evaluar la salud financiera a corto plazo.</p>',
            key_points: [
                '<b>Fórmula:</b> Ratio de Liquidez Corriente = Activo Corriente ÷ Pasivo Corriente.',
                '<b>Regla general:</b> un ratio entre 1,5 y 3 suele considerarse saludable — por debajo de 1 sugiere posibles dificultades, y un ratio muy alto (5+) puede indicar activos ociosos.',
                '<b>El sector importa:</b> lo "saludable" varía mucho según el sector — los minoristas con rotación rápida de inventario pueden operar con seguridad con ratios más bajos que los fabricantes intensivos en capital.',
            ],
            howto: [
                { question: '¿Qué se considera un activo o pasivo "corriente"?', answer: '<p>El activo corriente es el que se espera convertir en efectivo en un año (caja, cuentas por cobrar, inventario); el pasivo corriente son deudas con vencimiento a un año (proveedores, deuda a corto plazo).</p>' },
                { question: '¿Un ratio más alto es siempre mejor?', answer: '<p>No necesariamente — un ratio excesivamente alto puede significar que la empresa acumula efectivo o tiene demasiado inventario de lenta rotación en lugar de invertir en crecimiento.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Activo Corriente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Pasivo Corriente', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Ratio de Liquidez Corriente', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-ratio-de-liquidite-generale',
            title: 'Calculateur de Ratio de Liquidité Générale',
            h1: 'Calculateur de Ratio de Liquidité Générale',
            meta_title: 'Ratio de Liquidité Générale | Liquidité et Solvabilité à Court Terme',
            meta_description: 'Calculez le ratio de liquidité générale à partir de l’actif circulant et du passif circulant — un indicateur clé de liquidité.',
            short_answer: 'Ce calculateur divise l’actif circulant par le passif circulant pour vous donner le ratio de liquidité générale — une mesure de la capacité d’une entreprise à couvrir ses dettes à court terme avec ses actifs à court terme.',
            intro_text: '<p>Le ratio de liquidité générale est l’un des ratios de liquidité les plus utilisés en analyse financière. Il répond à une question simple : combien d’unités d’actif à court terme l’entreprise possède-t-elle pour chaque unité de dette à court terme ?</p><p><b>Les prêteurs, investisseurs et dirigeants d’entreprise en France</b> utilisent ce ratio pour évaluer la santé financière à court terme.</p>',
            key_points: [
                '<b>Formule :</b> Ratio de Liquidité Générale = Actif Circulant ÷ Passif Circulant.',
                '<b>Règle générale :</b> un ratio entre 1,5 et 3 est généralement considéré comme sain — en dessous de 1, cela suggère des difficultés possibles, et un ratio très élevé (5+) peut indiquer des actifs sous-utilisés.',
                '<b>Le secteur compte :</b> ce qui est « sain » varie beaucoup selon le secteur — les détaillants à rotation rapide des stocks peuvent fonctionner en toute sécurité avec des ratios plus bas que les fabricants à forte intensité capitalistique.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte comme actif ou passif « circulant » ?', answer: '<p>L’actif circulant est celui censé être converti en liquidités dans l’année (trésorerie, créances, stocks) ; le passif circulant regroupe les dettes exigibles dans l’année (dettes fournisseurs, dettes à court terme).</p>' },
                { question: 'Un ratio plus élevé est-il toujours meilleur ?', answer: '<p>Pas nécessairement — un ratio excessivement élevé peut signifier que l’entreprise thésaurise des liquidités ou possède trop de stocks à rotation lente au lieu d’investir dans la croissance.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Actif Circulant', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Passif Circulant', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Ratio de Liquidité Générale', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-indice-di-liquidita-corrente',
            title: 'Calcolatore Indice di Liquidità Corrente',
            h1: 'Calcolatore Indice di Liquidità Corrente',
            meta_title: 'Indice di Liquidità Corrente | Liquidità e Solvibilità a Breve Termine',
            meta_description: 'Calcola l’indice di liquidità corrente dall’attivo corrente e dal passivo corrente — un indicatore chiave di liquidità.',
            short_answer: 'Questo calcolatore divide l’attivo corrente per il passivo corrente per darti l’indice di liquidità corrente — una misura di quanto bene un’azienda possa coprire i debiti a breve termine con le attività a breve termine.',
            intro_text: '<p>L’indice di liquidità corrente è uno degli indici di liquidità più utilizzati nell’analisi finanziaria. Risponde a una domanda semplice: quante unità di attivo a breve termine ha l’azienda per ogni unità di debito a breve termine?</p><p><b>Finanziatori, investitori e imprenditori in Italia</b> usano questo indice per valutare la salute finanziaria a breve termine.</p>',
            key_points: [
                '<b>Formula:</b> Indice di Liquidità Corrente = Attivo Corrente ÷ Passivo Corrente.',
                '<b>Regola generale:</b> un indice tra 1,5 e 3 è generalmente considerato sano — sotto 1 suggerisce possibili difficoltà, un indice molto alto (5+) può indicare attività non sfruttate.',
                '<b>Il settore conta:</b> cosa sia "sano" varia molto per settore — i rivenditori con rotazione rapida delle scorte possono operare in sicurezza con indici più bassi rispetto ai produttori ad alta intensità di capitale.',
            ],
            howto: [
                { question: 'Cosa conta come attivo o passivo "corrente"?', answer: '<p>L’attivo corrente è quello che ci si aspetta di convertire in contanti entro un anno (cassa, crediti, scorte); il passivo corrente sono debiti con scadenza entro un anno (debiti verso fornitori, debiti a breve termine).</p>' },
                { question: 'Un indice più alto è sempre migliore?', answer: '<p>Non necessariamente — un indice eccessivamente alto può significare che l’azienda accumula liquidità o ha troppe scorte a lenta rotazione invece di investire nella crescita.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Attivo Corrente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Passivo Corrente', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Indice di Liquidità Corrente', precision: 2 },
            ],
        },
        de: {
            slug: 'liquiditaetsgrad-1-rechner',
            title: 'Liquiditätsgrad-Rechner (Current Ratio)',
            h1: 'Liquiditätsgrad-Rechner (Current Ratio)',
            meta_title: 'Current Ratio Rechner | Liquidität und Kurzfristige Zahlungsfähigkeit',
            meta_description: 'Berechnen Sie das Umlaufvermögen im Verhältnis zu den kurzfristigen Verbindlichkeiten — eine zentrale Liquiditätskennzahl.',
            short_answer: 'Dieser Rechner teilt das Umlaufvermögen durch die kurzfristigen Verbindlichkeiten, um die Current Ratio (Liquiditätsgrad 3) zu ermitteln — ein Maß dafür, wie gut ein Unternehmen seine kurzfristigen Schulden mit kurzfristigen Vermögenswerten decken kann.',
            intro_text: '<p>Die Current Ratio ist eine der am häufigsten verwendeten Liquiditätskennzahlen in der Finanzanalyse. Sie beantwortet eine einfache Frage: Wie viele Einheiten kurzfristiges Vermögen stehen jeder Einheit kurzfristiger Schulden gegenüber?</p><p><b>Kreditgeber, Investoren und Unternehmer in Deutschland</b> nutzen diese Kennzahl, um die kurzfristige finanzielle Gesundheit einzuschätzen.</p>',
            key_points: [
                '<b>Formel:</b> Current Ratio = Umlaufvermögen ÷ Kurzfristige Verbindlichkeiten.',
                '<b>Faustregel:</b> ein Wert zwischen 1,5 und 3 gilt allgemein als gesund — unter 1 deutet auf mögliche Schwierigkeiten hin, ein sehr hoher Wert (5+) kann auf ungenutzte Vermögenswerte hindeuten.',
                '<b>Branche zählt:</b> "gesund" variiert stark je nach Branche — Einzelhändler mit schnellem Lagerumschlag können sicher mit niedrigeren Werten arbeiten als kapitalintensive Hersteller.',
            ],
            howto: [
                { question: 'Was zählt als "kurzfristiges" Vermögen oder kurzfristige Verbindlichkeit?', answer: '<p>Umlaufvermögen sind Werte, die voraussichtlich innerhalb eines Jahres in liquide Mittel umgewandelt werden (Kasse, Forderungen, Vorräte); kurzfristige Verbindlichkeiten sind Schulden mit Fälligkeit innerhalb eines Jahres (Verbindlichkeiten aus L&L, kurzfristige Kredite).</p>' },
                { question: 'Ist eine höhere Current Ratio immer besser?', answer: '<p>Nicht unbedingt — eine zu hohe Ratio kann bedeuten, dass das Unternehmen Bargeld hortet oder zu viele langsam drehende Vorräte hat, statt in Wachstum zu investieren.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Umlaufvermögen', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Kurzfristige Verbindlichkeiten', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'current_ratio', label: 'Current Ratio', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1058: Quick Ratio (Acid-Test) Calculator
// ============================================================
const quickRatio: ToolDef = {
    id: '1058',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'current_assets', default: 150000 },
            { key: 'inventory', default: 50000 },
            { key: 'current_liabilities', default: 75000 },
        ],
        formulas: {
            quick_ratio: '(current_assets-inventory)/current_liabilities',
        },
        outputs: [
            { key: 'quick_ratio', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'quick-ratio-acid-test-calculator',
            title: 'Quick Ratio (Acid-Test) Calculator',
            h1: 'Quick Ratio (Acid-Test) Calculator',
            meta_title: 'Quick Ratio Calculator | Acid-Test for Immediate Liquidity',
            meta_description: 'Calculate the quick ratio (acid-test ratio) — a stricter liquidity measure that excludes inventory, showing whether a company can meet short-term obligations without selling stock.',
            short_answer: 'This calculator computes the quick ratio (also called the acid-test ratio) — current assets minus inventory, divided by current liabilities — a stricter view of short-term liquidity than the current ratio.',
            intro_text: '<p>The quick ratio refines the current ratio by removing inventory from the numerator, since inventory can be slow or uncertain to convert to cash (unlike cash, marketable securities, or receivables). This gives a more conservative view of a company\'s ability to pay short-term debts immediately.</p><p><b>Analysts and lenders</b> favor this ratio over the plain current ratio for companies where inventory is illiquid, seasonal, or hard to value quickly.</p>',
            key_points: [
                '<b>Formula:</b> Quick Ratio = (Current Assets − Inventory) ÷ Current Liabilities.',
                '<b>Rule of thumb:</b> a quick ratio of 1.0 or above is generally considered healthy — it means the company could cover all short-term liabilities without selling any inventory.',
                '<b>Why exclude inventory?</b> Unlike cash or receivables, inventory must first be sold (and collected on, if sold on credit) before it becomes cash — a process that can take weeks or months.',
            ],
            howto: [
                { question: 'How is the quick ratio different from the current ratio?', answer: '<p>The current ratio includes all current assets (including inventory); the quick ratio excludes inventory, giving a stricter, more immediate picture of liquidity — useful when inventory is slow-moving or hard to liquidate quickly.</p>' },
                { question: 'What if a company has no inventory at all (e.g. a service business)?', answer: '<p>In that case the quick ratio and current ratio will be identical, since there is no inventory to subtract.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Current Assets', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Inventory', type: 'number', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Current Liabilities', type: 'number', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Quick Ratio', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-koefficienta-bystroy-likvidnosti',
            title: 'Калькулятор коэффициента быстрой ликвидности',
            h1: 'Калькулятор коэффициента быстрой ликвидности',
            meta_title: 'Коэффициент быстрой ликвидности | Строгая оценка немедленной ликвидности',
            meta_description: 'Рассчитайте коэффициент быстрой ликвидности (acid-test) — более строгий показатель ликвидности, исключающий запасы.',
            short_answer: 'Этот калькулятор вычисляет коэффициент быстрой ликвидности — оборотные активы за вычетом запасов, делённые на краткосрочные обязательства — более строгий взгляд на ликвидность, чем коэффициент текущей ликвидности.',
            intro_text: '<p>Коэффициент быстрой ликвидности уточняет коэффициент текущей ликвидности, исключая запасы из числителя, так как запасы могут медленно или неопределённо конвертироваться в деньги.</p><p><b>Аналитики и кредиторы</b> предпочитают этот коэффициент обычному коэффициенту текущей ликвидности для компаний, где запасы неликвидны, сезонны или трудно оцениваемы быстро.</p>',
            key_points: [
                '<b>Формула:</b> Коэффициент быстрой ликвидности = (Оборотные активы − Запасы) ÷ Краткосрочные обязательства.',
                '<b>Эмпирическое правило:</b> значение 1,0 или выше обычно считается здоровым — это означает, что компания может покрыть все краткосрочные обязательства, не продавая запасы.',
                '<b>Почему исключаются запасы?</b> В отличие от денег или дебиторки, запасы сначала нужно продать (и получить оплату, если продано в кредит), прежде чем они станут деньгами.',
            ],
            howto: [
                { question: 'Чем коэффициент быстрой ликвидности отличается от текущей?', answer: '<p>Коэффициент текущей ликвидности включает все оборотные активы (включая запасы); коэффициент быстрой ликвидности исключает запасы, давая более строгую картину ликвидности.</p>' },
                { question: 'Что если у компании вообще нет запасов (например, сфера услуг)?', answer: '<p>В этом случае коэффициенты быстрой и текущей ликвидности будут идентичны, так как нет запасов для вычитания.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Оборотные активы', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Запасы', type: 'number', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Краткосрочные обязательства', type: 'number', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Коэффициент быстрой ликвидности', precision: 2 },
            ],
        },
        lv: {
            slug: 'atra-likviditates-koeficienta-kalkulators',
            title: 'Ātrās Likviditātes Koeficienta Kalkulators',
            h1: 'Ātrās Likviditātes Koeficienta Kalkulators',
            meta_title: 'Ātrās Likviditātes Koeficients | Stingrāks Tūlītējas Likviditātes Mērs',
            meta_description: 'Aprēķiniet ātrās likviditātes koeficientu — stingrāku likviditātes mēru, kas izslēdz krājumus.',
            short_answer: 'Šis kalkulators aprēķina ātrās likviditātes koeficientu — apgrozāmos līdzekļus mīnus krājumus, dalītus ar īstermiņa saistībām — stingrāku likviditātes skatījumu nekā kārtējās likviditātes koeficients.',
            intro_text: '<p>Ātrās likviditātes koeficients precizē kārtējās likviditātes koeficientu, izslēdzot krājumus no skaitītāja, jo krājumus var būt lēni vai neskaidri konvertēt naudā.</p><p><b>Analītiķi un kreditori</b> dod priekšroku šim koeficientam, kad krājumi ir nelikvīdi, sezonāli vai grūti novērtējami ātri.</p>',
            key_points: [
                '<b>Formula:</b> Ātrās Likviditātes Koeficients = (Apgrozāmie Līdzekļi − Krājumi) ÷ Īstermiņa Saistības.',
                '<b>Vispārējs noteikums:</b> vērtība 1,0 vai augstāka parasti tiek uzskatīta par veselīgu.',
                '<b>Kāpēc izslēgt krājumus?</b> Atšķirībā no naudas vai debitoriem, krājumi vispirms jāpārdod, pirms tie kļūst par naudu.',
            ],
            howto: [
                { question: 'Kā ātrās likviditātes koeficients atšķiras no kārtējās?', answer: '<p>Kārtējās likviditātes koeficients iekļauj visus apgrozāmos līdzekļus (ieskaitot krājumus); ātrās likviditātes koeficients izslēdz krājumus.</p>' },
                { question: 'Ko darīt, ja uzņēmumam vispār nav krājumu (piemēram, pakalpojumu uzņēmums)?', answer: '<p>Tādā gadījumā ātrās un kārtējās likviditātes koeficienti būs identiski.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Apgrozāmie Līdzekļi', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Krājumi', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Īstermiņa Saistības', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Ātrās Likviditātes Koeficients', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wskaznika-plynnosci-szybkiej',
            title: 'Kalkulator Wskaźnika Płynności Szybkiej',
            h1: 'Kalkulator Wskaźnika Płynności Szybkiej',
            meta_title: 'Wskaźnik Płynności Szybkiej | Ostrzejsza Miara Natychmiastowej Płynności',
            meta_description: 'Oblicz wskaźnik płynności szybkiej — bardziej rygorystyczną miarę płynności wykluczającą zapasy.',
            short_answer: 'Ten kalkulator oblicza wskaźnik płynności szybkiej — aktywa obrotowe pomniejszone o zapasy, podzielone przez zobowiązania krótkoterminowe.',
            intro_text: '<p>Wskaźnik płynności szybkiej precyzuje wskaźnik płynności bieżącej, wykluczając zapasy z licznika, ponieważ zapasy mogą być wolno lub niepewnie zamieniane na gotówkę.</p><p><b>Analitycy i kredytodawcy</b> preferują ten wskaźnik dla firm, gdzie zapasy są niepłynne, sezonowe lub trudne do szybkiej wyceny.</p>',
            key_points: [
                '<b>Wzór:</b> Wskaźnik Płynności Szybkiej = (Aktywa Obrotowe − Zapasy) ÷ Zobowiązania Krótkoterminowe.',
                '<b>Reguła kciuka:</b> wartość 1,0 lub wyższa jest zwykle uważana za zdrową.',
                '<b>Dlaczego wykluczyć zapasy?</b> W przeciwieństwie do gotówki czy należności, zapasy najpierw trzeba sprzedać, zanim staną się gotówką.',
            ],
            howto: [
                { question: 'Czym wskaźnik płynności szybkiej różni się od bieżącej?', answer: '<p>Wskaźnik płynności bieżącej obejmuje wszystkie aktywa obrotowe (w tym zapasy); wskaźnik płynności szybkiej wyklucza zapasy.</p>' },
                { question: 'Co jeśli firma w ogóle nie ma zapasów (np. firma usługowa)?', answer: '<p>W takim przypadku wskaźniki płynności szybkiej i bieżącej będą identyczne.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Aktywa Obrotowe', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Zapasy', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Zobowiązania Krótkoterminowe', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Wskaźnik Płynności Szybkiej', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-ratio-de-liquidez-inmediata',
            title: 'Calculadora de Ratio de Liquidez Inmediata (Acid-Test)',
            h1: 'Calculadora de Ratio de Liquidez Inmediata (Acid-Test)',
            meta_title: 'Ratio de Liquidez Inmediata | Prueba Ácida de Liquidez',
            meta_description: 'Calcula el ratio de liquidez inmediata (prueba ácida) — una medida de liquidez más estricta que excluye el inventario.',
            short_answer: 'Esta calculadora calcula el ratio de liquidez inmediata (prueba ácida) — el activo corriente menos el inventario, dividido entre el pasivo corriente.',
            intro_text: '<p>El ratio de liquidez inmediata refina el ratio de liquidez corriente eliminando el inventario del numerador, ya que el inventario puede tardar o ser incierto de convertir en efectivo.</p><p><b>Analistas y prestamistas en España</b> prefieren este ratio para empresas donde el inventario es poco líquido, estacional o difícil de valorar rápidamente.</p>',
            key_points: [
                '<b>Fórmula:</b> Ratio de Liquidez Inmediata = (Activo Corriente − Inventario) ÷ Pasivo Corriente.',
                '<b>Regla general:</b> un ratio de 1,0 o superior suele considerarse saludable.',
                '<b>¿Por qué excluir el inventario?</b> A diferencia del efectivo o las cuentas por cobrar, el inventario primero debe venderse antes de convertirse en efectivo.',
            ],
            howto: [
                { question: '¿En qué se diferencia del ratio de liquidez corriente?', answer: '<p>El ratio de liquidez corriente incluye todo el activo corriente (incluido el inventario); el de liquidez inmediata excluye el inventario.</p>' },
                { question: '¿Qué pasa si una empresa no tiene inventario (por ejemplo, un negocio de servicios)?', answer: '<p>En ese caso, los ratios de liquidez inmediata y corriente serán idénticos.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Activo Corriente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Inventario', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Pasivo Corriente', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Ratio de Liquidez Inmediata', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-ratio-de-liquidite-reduite',
            title: 'Calculateur de Ratio de Liquidité Réduite (Acid-Test)',
            h1: 'Calculateur de Ratio de Liquidité Réduite (Acid-Test)',
            meta_title: 'Ratio de Liquidité Réduite | Test Acide de Liquidité Immédiate',
            meta_description: 'Calculez le ratio de liquidité réduite (test acide) — une mesure de liquidité plus stricte excluant les stocks.',
            short_answer: 'Ce calculateur calcule le ratio de liquidité réduite (test acide) — l’actif circulant moins les stocks, divisé par le passif circulant.',
            intro_text: '<p>Le ratio de liquidité réduite affine le ratio de liquidité générale en retirant les stocks du numérateur, car les stocks peuvent être lents ou incertains à convertir en liquidités.</p><p><b>Les analystes et prêteurs en France</b> préfèrent ce ratio pour les entreprises où les stocks sont peu liquides, saisonniers ou difficiles à évaluer rapidement.</p>',
            key_points: [
                '<b>Formule :</b> Ratio de Liquidité Réduite = (Actif Circulant − Stocks) ÷ Passif Circulant.',
                '<b>Règle générale :</b> un ratio de 1,0 ou plus est généralement considéré comme sain.',
                '<b>Pourquoi exclure les stocks ?</b> Contrairement à la trésorerie ou aux créances, les stocks doivent d’abord être vendus avant de devenir des liquidités.',
            ],
            howto: [
                { question: 'En quoi diffère-t-il du ratio de liquidité générale ?', answer: '<p>Le ratio de liquidité générale inclut tout l’actif circulant (y compris les stocks) ; le ratio de liquidité réduite exclut les stocks.</p>' },
                { question: 'Que se passe-t-il si une entreprise n’a aucun stock (par ex. une entreprise de services) ?', answer: '<p>Dans ce cas, les ratios de liquidité réduite et générale seront identiques.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Actif Circulant', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Stocks', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Passif Circulant', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Ratio de Liquidité Réduite', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-indice-di-liquidita-immediata',
            title: 'Calcolatore Indice di Liquidità Immediata (Acid-Test)',
            h1: 'Calcolatore Indice di Liquidità Immediata (Acid-Test)',
            meta_title: 'Indice di Liquidità Immediata | Test Acido di Liquidità',
            meta_description: 'Calcola l’indice di liquidità immediata (acid-test) — una misura di liquidità più rigorosa che esclude le scorte.',
            short_answer: 'Questo calcolatore calcola l’indice di liquidità immediata (acid-test) — l’attivo corrente meno le scorte, diviso per il passivo corrente.',
            intro_text: '<p>L’indice di liquidità immediata affina l’indice di liquidità corrente rimuovendo le scorte dal numeratore, poiché le scorte possono richiedere tempo o essere incerte da convertire in contanti.</p><p><b>Analisti e finanziatori in Italia</b> preferiscono questo indice per aziende in cui le scorte sono illiquide, stagionali o difficili da valutare rapidamente.</p>',
            key_points: [
                '<b>Formula:</b> Indice di Liquidità Immediata = (Attivo Corrente − Scorte) ÷ Passivo Corrente.',
                '<b>Regola generale:</b> un indice di 1,0 o superiore è generalmente considerato sano.',
                '<b>Perché escludere le scorte?</b> A differenza della cassa o dei crediti, le scorte devono prima essere vendute prima di diventare contanti.',
            ],
            howto: [
                { question: 'In cosa differisce dall’indice di liquidità corrente?', answer: '<p>L’indice di liquidità corrente include tutto l’attivo corrente (incluse le scorte); l’indice di liquidità immediata esclude le scorte.</p>' },
                { question: 'Cosa succede se un’azienda non ha scorte (ad es. un’attività di servizi)?', answer: '<p>In quel caso, gli indici di liquidità immediata e corrente saranno identici.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Attivo Corrente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Scorte', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Passivo Corrente', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Indice di Liquidità Immediata', precision: 2 },
            ],
        },
        de: {
            slug: 'liquiditaetsgrad-2-rechner',
            title: 'Liquiditätsgrad-2-Rechner (Acid-Test)',
            h1: 'Liquiditätsgrad-2-Rechner (Acid-Test)',
            meta_title: 'Quick Ratio Rechner | Acid-Test für Sofortige Liquidität',
            meta_description: 'Berechnen Sie den Liquiditätsgrad 2 (Quick Ratio / Acid-Test) — ein strengeres Liquiditätsmaß ohne Vorräte.',
            short_answer: 'Dieser Rechner berechnet den Liquiditätsgrad 2 (Quick Ratio) — Umlaufvermögen minus Vorräte, geteilt durch kurzfristige Verbindlichkeiten.',
            intro_text: '<p>Der Liquiditätsgrad 2 verfeinert die Current Ratio, indem Vorräte aus dem Zähler entfernt werden, da Vorräte langsam oder unsicher in Bargeld umgewandelt werden können.</p><p><b>Analysten und Kreditgeber in Deutschland</b> bevorzugen diese Kennzahl für Unternehmen, bei denen Vorräte illiquide, saisonal oder schwer schnell zu bewerten sind.</p>',
            key_points: [
                '<b>Formel:</b> Liquiditätsgrad 2 = (Umlaufvermögen − Vorräte) ÷ Kurzfristige Verbindlichkeiten.',
                '<b>Faustregel:</b> ein Wert von 1,0 oder höher gilt allgemein als gesund.',
                '<b>Warum Vorräte ausschließen?</b> Im Gegensatz zu Bargeld oder Forderungen müssen Vorräte erst verkauft werden, bevor sie zu Bargeld werden.',
            ],
            howto: [
                { question: 'Wie unterscheidet sich der Liquiditätsgrad 2 von der Current Ratio?', answer: '<p>Die Current Ratio umfasst das gesamte Umlaufvermögen (einschließlich Vorräte); der Liquiditätsgrad 2 schließt Vorräte aus.</p>' },
                { question: 'Was, wenn ein Unternehmen überhaupt keine Vorräte hat (z.B. ein Dienstleistungsunternehmen)?', answer: '<p>In diesem Fall sind Liquiditätsgrad 2 und Current Ratio identisch.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Umlaufvermögen', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'inventory', label: 'Vorräte', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '50000' },
                { name: 'current_liabilities', label: 'Kurzfristige Verbindlichkeiten', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'quick_ratio', label: 'Liquiditätsgrad 2 (Quick Ratio)', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1059: Debt-to-Equity Ratio Calculator
// ============================================================
const debtToEquity: ToolDef = {
    id: '1059',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'total_liabilities', default: 200000 },
            { key: 'shareholders_equity', default: 400000 },
        ],
        formulas: {
            de_ratio: 'total_liabilities/shareholders_equity',
        },
        outputs: [
            { key: 'de_ratio', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'debt-to-equity-ratio-calculator',
            title: 'Debt-to-Equity Ratio Calculator',
            h1: 'Debt-to-Equity Ratio Calculator',
            meta_title: 'Debt-to-Equity Ratio Calculator | Leverage & Financial Risk',
            meta_description: 'Calculate the debt-to-equity (D/E) ratio from total liabilities and shareholders\' equity — a key measure of financial leverage and risk.',
            short_answer: 'This calculator divides total liabilities by shareholders\' equity to give you the debt-to-equity ratio — a measure of how much a company relies on debt versus its own capital to finance its assets.',
            intro_text: '<p>The debt-to-equity ratio is a cornerstone leverage metric. It shows how many units of debt a company carries for every unit of equity capital — a higher ratio means more reliance on borrowed money, which amplifies both potential returns and financial risk.</p><p><b>Investors, lenders, and analysts</b> use this ratio to assess how aggressively a company is financed and how exposed it might be during downturns.</p>',
            key_points: [
                '<b>Formula:</b> Debt-to-Equity Ratio = Total Liabilities ÷ Shareholders\' Equity.',
                '<b>Interpretation:</b> a ratio of 1.0 means debt and equity are equal; below 1 means the company relies more on equity, above 1 means more on debt — but "good" varies enormously by industry (capital-intensive industries like utilities and manufacturing typically run higher than software or services companies).',
                '<b>Not the same as risk in isolation:</b> a high D/E ratio isn\'t automatically bad if the company generates stable, predictable cash flow to service that debt — context and interest coverage matter alongside this ratio.',
            ],
            howto: [
                { question: 'What exactly counts as "total liabilities"?', answer: '<p>All amounts the company owes: short-term liabilities (accounts payable, short-term debt) plus long-term liabilities (long-term debt, bonds, deferred obligations) — found on the balance sheet.</p>' },
                { question: 'Why do industries differ so much in "acceptable" D/E ratios?', answer: '<p>Capital-intensive businesses (utilities, real estate, manufacturing) typically use more debt to finance long-lived assets, while asset-light businesses (software, consulting) usually run lower ratios since they need less capital investment.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Total Liabilities', type: 'number', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: "Shareholders' Equity", type: 'number', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Debt-to-Equity Ratio', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-koefficienta-debt-to-equity',
            title: 'Калькулятор коэффициента долг/капитал (D/E)',
            h1: 'Калькулятор коэффициента долг/капитал (D/E)',
            meta_title: 'Коэффициент долг/капитал | Финансовый рычаг и риск',
            meta_description: 'Рассчитайте коэффициент долг/собственный капитал (D/E) из общих обязательств и собственного капитала — ключевой показатель финансового рычага.',
            short_answer: 'Этот калькулятор делит общие обязательства на собственный капитал, чтобы получить коэффициент долг/капитал — показатель того, насколько компания полагается на заёмные средства относительно собственного капитала.',
            intro_text: '<p>Коэффициент долг/капитал — базовый показатель финансового рычага. Он показывает, сколько единиц долга приходится на каждую единицу собственного капитала — более высокий коэффициент означает большую зависимость от заёмных средств.</p><p><b>Инвесторы, кредиторы и аналитики</b> используют этот коэффициент, чтобы оценить, насколько агрессивно финансируется компания.</p>',
            key_points: [
                '<b>Формула:</b> Коэффициент долг/капитал = Общие обязательства ÷ Собственный капитал.',
                '<b>Интерпретация:</b> коэффициент 1,0 означает равенство долга и капитала; ниже 1 — больше опоры на капитал, выше 1 — на долг, но "хорошее" значение сильно варьируется по отраслям.',
                '<b>Не всегда риск сам по себе:</b> высокий коэффициент D/E не обязательно плох, если компания генерирует стабильный денежный поток для обслуживания долга.',
            ],
            howto: [
                { question: 'Что именно считается "общими обязательствами"?', answer: '<p>Все суммы, которые компания должна: краткосрочные обязательства (кредиторка, краткосрочные займы) плюс долгосрочные обязательства (долгосрочные займы, облигации).</p>' },
                { question: 'Почему отрасли так сильно различаются по "приемлемым" значениям D/E?', answer: '<p>Капиталоёмкие бизнесы (коммунальные услуги, недвижимость, производство) обычно используют больше долга, тогда как бизнесы с малыми активами (софт, консалтинг) обычно имеют более низкие коэффициенты.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Общие обязательства', type: 'number', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Собственный капитал', type: 'number', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Коэффициент долг/капитал', precision: 2 },
            ],
        },
        lv: {
            slug: 'saistibu-pret-pasu-kapitalu-koeficienta-kalkulators',
            title: 'Saistību pret Pašu Kapitālu Koeficienta Kalkulators',
            h1: 'Saistību pret Pašu Kapitālu Koeficienta Kalkulators',
            meta_title: 'D/E Koeficients | Finanšu Svira un Risks',
            meta_description: 'Aprēķiniet saistību pret pašu kapitālu koeficientu (D/E) no kopējām saistībām un pašu kapitāla.',
            short_answer: 'Šis kalkulators dala kopējās saistības ar pašu kapitālu, lai iegūtu saistību pret pašu kapitālu koeficientu — rādītāju, cik uzņēmums paļaujas uz aizņemtajiem līdzekļiem.',
            intro_text: '<p>Saistību pret pašu kapitālu koeficients ir pamata finanšu sviras rādītājs. Tas parāda, cik parāda vienību ir uz katru pašu kapitāla vienību — augstāks koeficients nozīmē lielāku paļaušanos uz aizņemtajiem līdzekļiem.</p><p><b>Investori, kreditori un analītiķi</b> izmanto šo koeficientu, lai novērtētu, cik agresīvi uzņēmums tiek finansēts.</p>',
            key_points: [
                '<b>Formula:</b> D/E Koeficients = Kopējās Saistības ÷ Pašu Kapitāls.',
                '<b>Interpretācija:</b> koeficients 1,0 nozīmē vienādu parādu un kapitālu; zem 1 — vairāk paļaušanās uz kapitālu, virs 1 — uz parādu.',
                '<b>Ne vienmēr risks pats par sevi:</b> augsts D/E koeficients nav automātiski slikts, ja uzņēmums ģenerē stabilu naudas plūsmu parāda apkalpošanai.',
            ],
            howto: [
                { question: 'Kas tieši tiek uzskatīts par "kopējām saistībām"?', answer: '<p>Visas summas, ko uzņēmums ir parādā: īstermiņa saistības plus ilgtermiņa saistības.</p>' },
                { question: 'Kāpēc nozares tik ļoti atšķiras "pieņemamajos" D/E koeficientos?', answer: '<p>Kapitālietilpīgi biznesi parasti izmanto vairāk parāda, kamēr biznesi ar maziem aktīviem parasti darbojas ar zemākiem koeficientiem.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Kopējās Saistības', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Pašu Kapitāls', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Saistību pret Pašu Kapitālu Koeficients', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wskaznika-zadluzenia-kapitalu-wlasnego',
            title: 'Kalkulator Wskaźnika Zadłużenia do Kapitału Własnego',
            h1: 'Kalkulator Wskaźnika Zadłużenia do Kapitału Własnego',
            meta_title: 'Wskaźnik D/E | Dźwignia Finansowa i Ryzyko',
            meta_description: 'Oblicz wskaźnik zadłużenia do kapitału własnego (D/E) z całkowitych zobowiązań i kapitału własnego.',
            short_answer: 'Ten kalkulator dzieli całkowite zobowiązania przez kapitał własny, aby uzyskać wskaźnik zadłużenia do kapitału własnego — miarę tego, jak bardzo firma polega na długu względem własnego kapitału.',
            intro_text: '<p>Wskaźnik zadłużenia do kapitału własnego to podstawowa miara dźwigni finansowej. Pokazuje, ile jednostek długu przypada na każdą jednostkę kapitału własnego — wyższy wskaźnik oznacza większe poleganie na pożyczonych środkach.</p><p><b>Inwestorzy, kredytodawcy i analitycy</b> używają tego wskaźnika do oceny, jak agresywnie finansowana jest firma.</p>',
            key_points: [
                '<b>Wzór:</b> Wskaźnik D/E = Całkowite Zobowiązania ÷ Kapitał Własny.',
                '<b>Interpretacja:</b> wskaźnik 1,0 oznacza równość długu i kapitału; poniżej 1 — większe poleganie na kapitale, powyżej 1 — na długu.',
                '<b>Nie zawsze ryzyko samo w sobie:</b> wysoki wskaźnik D/E nie musi być zły, jeśli firma generuje stabilne przepływy pieniężne do obsługi długu.',
            ],
            howto: [
                { question: 'Co dokładnie liczy się jako "całkowite zobowiązania"?', answer: '<p>Wszystkie kwoty, które firma jest winna: zobowiązania krótkoterminowe plus zobowiązania długoterminowe.</p>' },
                { question: 'Dlaczego branże tak bardzo różnią się w "akceptowalnych" wskaźnikach D/E?', answer: '<p>Firmy kapitałochłonne zwykle używają więcej długu, podczas gdy firmy o niskich aktywach zwykle mają niższe wskaźniki.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Całkowite Zobowiązania', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Kapitał Własny', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Wskaźnik Zadłużenia do Kapitału Własnego', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-ratio-deuda-sobre-patrimonio',
            title: 'Calculadora de Ratio Deuda sobre Patrimonio (D/E)',
            h1: 'Calculadora de Ratio Deuda sobre Patrimonio (D/E)',
            meta_title: 'Ratio Deuda/Patrimonio | Apalancamiento y Riesgo Financiero',
            meta_description: 'Calcula el ratio deuda sobre patrimonio (D/E) a partir del pasivo total y el patrimonio neto.',
            short_answer: 'Esta calculadora divide el pasivo total entre el patrimonio neto para darte el ratio deuda sobre patrimonio — una medida de cuánto depende una empresa de la deuda frente a su propio capital.',
            intro_text: '<p>El ratio deuda sobre patrimonio es una métrica fundamental de apalancamiento. Muestra cuántas unidades de deuda tiene una empresa por cada unidad de capital propio.</p><p><b>Inversores, prestamistas y analistas en España</b> usan este ratio para evaluar cuán agresivamente está financiada una empresa.</p>',
            key_points: [
                '<b>Fórmula:</b> Ratio D/E = Pasivo Total ÷ Patrimonio Neto.',
                '<b>Interpretación:</b> un ratio de 1,0 significa que la deuda y el patrimonio son iguales; por debajo de 1 depende más del patrimonio, por encima de 1 más de la deuda.',
                '<b>No siempre es riesgo por sí solo:</b> un D/E alto no es automáticamente malo si la empresa genera un flujo de caja estable para atender esa deuda.',
            ],
            howto: [
                { question: '¿Qué cuenta exactamente como "pasivo total"?', answer: '<p>Todas las cantidades que la empresa debe: pasivo corriente más pasivo no corriente.</p>' },
                { question: '¿Por qué los sectores difieren tanto en ratios D/E "aceptables"?', answer: '<p>Los negocios intensivos en capital suelen usar más deuda, mientras que los negocios con pocos activos suelen tener ratios más bajos.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Pasivo Total', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Patrimonio Neto', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Ratio Deuda sobre Patrimonio', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-ratio-dendettement',
            title: 'Calculateur de Ratio d’Endettement (Dette/Capitaux Propres)',
            h1: 'Calculateur de Ratio d’Endettement (Dette/Capitaux Propres)',
            meta_title: 'Ratio Dette/Capitaux Propres | Effet de Levier et Risque Financier',
            meta_description: 'Calculez le ratio dette sur capitaux propres (D/E) à partir du passif total et des capitaux propres.',
            short_answer: 'Ce calculateur divise le passif total par les capitaux propres pour vous donner le ratio d’endettement — une mesure de la dépendance d’une entreprise à la dette par rapport à ses propres capitaux.',
            intro_text: '<p>Le ratio d’endettement est une métrique fondamentale de levier financier. Il montre combien d’unités de dette une entreprise porte pour chaque unité de capitaux propres.</p><p><b>Investisseurs, prêteurs et analystes en France</b> utilisent ce ratio pour évaluer avec quelle agressivité une entreprise est financée.</p>',
            key_points: [
                '<b>Formule :</b> Ratio D/E = Passif Total ÷ Capitaux Propres.',
                '<b>Interprétation :</b> un ratio de 1,0 signifie que la dette et les capitaux propres sont égaux ; en dessous de 1, l’entreprise dépend plus des capitaux propres, au-dessus de 1, plus de la dette.',
                '<b>Pas toujours un risque en soi :</b> un D/E élevé n’est pas automatiquement mauvais si l’entreprise génère un flux de trésorerie stable pour assurer le service de cette dette.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte exactement comme « passif total » ?', answer: '<p>Tous les montants dus par l’entreprise : passif circulant plus passif non circulant.</p>' },
                { question: 'Pourquoi les secteurs diffèrent-ils autant en matière de ratios D/E « acceptables » ?', answer: '<p>Les entreprises à forte intensité capitalistique utilisent généralement plus de dette, tandis que les entreprises à faible intensité d’actifs affichent généralement des ratios plus bas.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Passif Total', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Capitaux Propres', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Ratio d’Endettement (D/E)', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-rapporto-debito-patrimonio-netto',
            title: 'Calcolatore Rapporto Debito/Patrimonio Netto (D/E)',
            h1: 'Calcolatore Rapporto Debito/Patrimonio Netto (D/E)',
            meta_title: 'Rapporto D/E | Leva Finanziaria e Rischio',
            meta_description: 'Calcola il rapporto debito/patrimonio netto (D/E) dal totale delle passività e dal patrimonio netto.',
            short_answer: 'Questo calcolatore divide il totale delle passività per il patrimonio netto per darti il rapporto debito/patrimonio netto — una misura di quanto un’azienda si affidi al debito rispetto al proprio capitale.',
            intro_text: '<p>Il rapporto debito/patrimonio netto è una metrica fondamentale di leva finanziaria. Mostra quante unità di debito un’azienda porta per ogni unità di capitale proprio.</p><p><b>Investitori, finanziatori e analisti in Italia</b> usano questo rapporto per valutare quanto aggressivamente un’azienda sia finanziata.</p>',
            key_points: [
                '<b>Formula:</b> Rapporto D/E = Totale Passività ÷ Patrimonio Netto.',
                '<b>Interpretazione:</b> un rapporto di 1,0 significa che debito e patrimonio sono uguali; sotto 1 significa maggiore dipendenza dal patrimonio, sopra 1 dal debito.',
                '<b>Non sempre rischio di per sé:</b> un D/E alto non è automaticamente negativo se l’azienda genera un flusso di cassa stabile per servire quel debito.',
            ],
            howto: [
                { question: 'Cosa conta esattamente come "totale passività"?', answer: '<p>Tutti gli importi che l’azienda deve: passività correnti più passività non correnti.</p>' },
                { question: 'Perché i settori differiscono così tanto nei rapporti D/E "accettabili"?', answer: '<p>Le aziende ad alta intensità di capitale usano tipicamente più debito, mentre le aziende con pochi asset hanno tipicamente rapporti più bassi.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Totale Passività', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Patrimonio Netto', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Rapporto Debito/Patrimonio Netto', precision: 2 },
            ],
        },
        de: {
            slug: 'verschuldungsgrad-rechner',
            title: 'Verschuldungsgrad-Rechner (Debt-to-Equity)',
            h1: 'Verschuldungsgrad-Rechner (Debt-to-Equity)',
            meta_title: 'Verschuldungsgrad Rechner | Fremdkapitalhebel und Finanzrisiko',
            meta_description: 'Berechnen Sie den Verschuldungsgrad (Debt-to-Equity) aus Gesamtverbindlichkeiten und Eigenkapital.',
            short_answer: 'Dieser Rechner teilt die Gesamtverbindlichkeiten durch das Eigenkapital, um den Verschuldungsgrad zu ermitteln — ein Maß dafür, wie stark ein Unternehmen auf Fremdkapital im Vergleich zu eigenem Kapital angewiesen ist.',
            intro_text: '<p>Der Verschuldungsgrad ist eine zentrale Kennzahl für den Fremdkapitalhebel. Er zeigt, wie viele Einheiten Fremdkapital ein Unternehmen pro Einheit Eigenkapital trägt.</p><p><b>Investoren, Kreditgeber und Analysten in Deutschland</b> nutzen diese Kennzahl, um einzuschätzen, wie aggressiv ein Unternehmen finanziert ist.</p>',
            key_points: [
                '<b>Formel:</b> Verschuldungsgrad = Gesamtverbindlichkeiten ÷ Eigenkapital.',
                '<b>Interpretation:</b> ein Wert von 1,0 bedeutet, dass Fremd- und Eigenkapital gleich sind; unter 1 mehr Eigenkapital, über 1 mehr Fremdkapital.',
                '<b>Nicht automatisch ein Risiko:</b> ein hoher Verschuldungsgrad ist nicht automatisch schlecht, wenn das Unternehmen stabile, vorhersehbare Cashflows zur Bedienung dieser Schulden erwirtschaftet.',
            ],
            howto: [
                { question: 'Was genau zählt als "Gesamtverbindlichkeiten"?', answer: '<p>Alle Beträge, die das Unternehmen schuldet: kurzfristige Verbindlichkeiten plus langfristige Verbindlichkeiten.</p>' },
                { question: 'Warum unterscheiden sich Branchen so stark bei "akzeptablen" Verschuldungsgraden?', answer: '<p>Kapitalintensive Unternehmen nutzen typischerweise mehr Fremdkapital, während Unternehmen mit geringem Kapitalbedarf niedrigere Werte aufweisen.</p>' },
            ],
            inputs: [
                { name: 'total_liabilities', label: 'Gesamtverbindlichkeiten', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '200000' },
                { name: 'shareholders_equity', label: 'Eigenkapital', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'de_ratio', label: 'Verschuldungsgrad (Debt-to-Equity)', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1060: Return on Equity (ROE) Calculator
// ============================================================
const roe: ToolDef = {
    id: '1060',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'net_income', default: 50000 },
            { key: 'shareholders_equity', default: 400000 },
        ],
        formulas: {
            roe_pct: 'net_income/shareholders_equity*100',
        },
        outputs: [
            { key: 'roe_pct', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'return-on-equity-roe-calculator',
            title: 'Return on Equity (ROE) Calculator',
            h1: 'Return on Equity (ROE) Calculator',
            meta_title: 'ROE Calculator | Return on Equity for Shareholders',
            meta_description: 'Calculate return on equity (ROE) from net income and shareholders\' equity — a key profitability metric showing how efficiently a company uses equity capital.',
            short_answer: 'This calculator divides net income by shareholders\' equity to give you return on equity (ROE) — a percentage showing how much profit a company generates for every unit of shareholder capital invested.',
            intro_text: '<p>ROE is one of the most-watched profitability ratios for investors, since it directly measures how effectively management turns shareholders\' invested capital into profit. Unlike ROA, it excludes the effect of financing structure on assets — it looks purely at return relative to equity.</p><p><b>Investors and analysts</b> compare ROE across companies in the same industry to judge management efficiency and capital allocation.</p>',
            key_points: [
                '<b>Formula:</b> ROE = Net Income ÷ Shareholders\' Equity × 100.',
                '<b>Rule of thumb:</b> an ROE in the 15-20% range is often considered strong, though "good" varies significantly by industry and market conditions.',
                '<b>Watch for leverage effects:</b> a company can artificially boost ROE by taking on more debt (reducing equity) rather than genuinely improving profitability — always check the debt-to-equity ratio alongside ROE.',
            ],
            howto: [
                { question: 'What\'s the difference between ROE and ROA?', answer: '<p>ROE measures return relative to shareholders\' equity only; ROA measures return relative to total assets (equity plus debt). A company with high debt can show high ROE but modest ROA — comparing both gives a fuller picture.</p>' },
                { question: 'Should I use average equity instead of period-end equity?', answer: '<p>For deeper analysis, many analysts use average equity over the period (beginning + ending, divided by two) to smooth out mid-year swings — this calculator uses a single equity figure for simplicity, which is standard for a quick estimate.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Net Income', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: "Shareholders' Equity", type: 'number', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Return on Equity (ROE)', unit: '%', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-rentabelnosti-sobstvennogo-kapitala-roe',
            title: 'Калькулятор рентабельности собственного капитала (ROE)',
            h1: 'Калькулятор рентабельности собственного капитала (ROE)',
            meta_title: 'Калькулятор ROE | Рентабельность собственного капитала',
            meta_description: 'Рассчитайте рентабельность собственного капитала (ROE) из чистой прибыли и собственного капитала — ключевой показатель прибыльности.',
            short_answer: 'Этот калькулятор делит чистую прибыль на собственный капитал, чтобы получить ROE — процент, показывающий, сколько прибыли компания генерирует на каждую единицу вложенного акционерного капитала.',
            intro_text: '<p>ROE — один из самых отслеживаемых показателей прибыльности для инвесторов, так как напрямую измеряет, насколько эффективно менеджмент превращает вложенный капитал акционеров в прибыль.</p><p><b>Инвесторы и аналитики</b> сравнивают ROE между компаниями одной отрасли, чтобы оценить эффективность управления.</p>',
            key_points: [
                '<b>Формула:</b> ROE = Чистая прибыль ÷ Собственный капитал × 100.',
                '<b>Эмпирическое правило:</b> ROE в диапазоне 15-20% часто считается сильным показателем, хотя "хорошее" значение сильно зависит от отрасли.',
                '<b>Остерегайтесь эффекта левериджа:</b> компания может искусственно завысить ROE, увеличив долг (уменьшая капитал), а не реально улучшив прибыльность — всегда проверяйте коэффициент долг/капитал вместе с ROE.',
            ],
            howto: [
                { question: 'В чём разница между ROE и ROA?', answer: '<p>ROE измеряет доходность относительно собственного капитала; ROA — относительно всех активов (капитал плюс долг). Компания с высоким долгом может показывать высокий ROE, но скромный ROA.</p>' },
                { question: 'Стоит ли использовать средний капитал вместо капитала на конец периода?', answer: '<p>Для более глубокого анализа многие аналитики используют средний капитал за период (начало + конец, делённое на два) — этот калькулятор использует единое значение для простоты.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Чистая прибыль', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Собственный капитал', type: 'number', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Рентабельность собственного капитала (ROE)', unit: '%', precision: 2 },
            ],
        },
        lv: {
            slug: 'pasu-kapitala-rentabilitates-roe-kalkulators',
            title: 'Pašu Kapitāla Rentabilitātes (ROE) Kalkulators',
            h1: 'Pašu Kapitāla Rentabilitātes (ROE) Kalkulators',
            meta_title: 'ROE Kalkulators | Pašu Kapitāla Rentabilitāte',
            meta_description: 'Aprēķiniet pašu kapitāla rentabilitāti (ROE) no tīrās peļņas un pašu kapitāla.',
            short_answer: 'Šis kalkulators dala tīro peļņu ar pašu kapitālu, lai iegūtu ROE — procentu, kas parāda, cik daudz peļņas uzņēmums ģenerē uz katru ieguldīto akcionāru kapitāla vienību.',
            intro_text: '<p>ROE ir viens no visvairāk vērotajiem rentabilitātes rādītājiem investoriem, jo tas tieši mēra, cik efektīvi vadība pārvērš akcionāru ieguldīto kapitālu peļņā.</p><p><b>Investori un analītiķi</b> salīdzina ROE starp uzņēmumiem vienā nozarē, lai novērtētu vadības efektivitāti.</p>',
            key_points: [
                '<b>Formula:</b> ROE = Tīrā Peļņa ÷ Pašu Kapitāls × 100.',
                '<b>Vispārējs noteikums:</b> ROE 15-20% diapazonā bieži tiek uzskatīts par spēcīgu, lai gan "labs" ļoti atšķiras pēc nozares.',
                '<b>Uzmanieties no sviras efekta:</b> uzņēmums var mākslīgi palielināt ROE, uzņemoties vairāk parāda (samazinot kapitālu), nevis reāli uzlabojot rentabilitāti.',
            ],
            howto: [
                { question: 'Kāda ir atšķirība starp ROE un ROA?', answer: '<p>ROE mēra atdevi attiecībā pret pašu kapitālu; ROA mēra atdevi attiecībā pret visiem aktīviem (kapitāls plus parāds).</p>' },
                { question: 'Vai jāizmanto vidējais kapitāls, nevis perioda beigu kapitāls?', answer: '<p>Dziļākai analīzei daudzi analītiķi izmanto vidējo kapitālu par periodu — šis kalkulators vienkāršības labad izmanto vienu kapitāla vērtību.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Tīrā Peļņa', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Pašu Kapitāls', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Pašu Kapitāla Rentabilitāte (ROE)', unit: '%', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-rentownosci-kapitalu-wlasnego-roe',
            title: 'Kalkulator Rentowności Kapitału Własnego (ROE)',
            h1: 'Kalkulator Rentowności Kapitału Własnego (ROE)',
            meta_title: 'Kalkulator ROE | Rentowność Kapitału Własnego',
            meta_description: 'Oblicz rentowność kapitału własnego (ROE) z zysku netto i kapitału własnego.',
            short_answer: 'Ten kalkulator dzieli zysk netto przez kapitał własny, aby uzyskać ROE — procent pokazujący, ile zysku firma generuje na każdą jednostkę zainwestowanego kapitału akcjonariuszy.',
            intro_text: '<p>ROE to jeden z najczęściej obserwowanych wskaźników rentowności dla inwestorów, ponieważ bezpośrednio mierzy, jak efektywnie zarządzanie zamienia zainwestowany kapitał akcjonariuszy w zysk.</p><p><b>Inwestorzy i analitycy</b> porównują ROE między firmami w tej samej branży, aby ocenić efektywność zarządzania.</p>',
            key_points: [
                '<b>Wzór:</b> ROE = Zysk Netto ÷ Kapitał Własny × 100.',
                '<b>Reguła kciuka:</b> ROE w zakresie 15-20% jest często uważane za silne, choć "dobre" znacznie różni się w zależności od branży.',
                '<b>Uważaj na efekty dźwigni:</b> firma może sztucznie zwiększyć ROE, zaciągając więcej długu (zmniejszając kapitał), zamiast rzeczywiście poprawiać rentowność.',
            ],
            howto: [
                { question: 'Jaka jest różnica między ROE a ROA?', answer: '<p>ROE mierzy zwrot względem kapitału własnego; ROA mierzy zwrot względem wszystkich aktywów (kapitał plus dług).</p>' },
                { question: 'Czy powinienem użyć średniego kapitału zamiast kapitału na koniec okresu?', answer: '<p>Do głębszej analizy wielu analityków używa średniego kapitału w okresie — ten kalkulator dla prostoty używa jednej wartości kapitału.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Zysk Netto', type: 'number', unit: 'zł', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Kapitał Własny', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Rentowność Kapitału Własnego (ROE)', unit: '%', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-rentabilidad-financiera-roe',
            title: 'Calculadora de Rentabilidad Financiera (ROE)',
            h1: 'Calculadora de Rentabilidad Financiera (ROE)',
            meta_title: 'Calculadora ROE | Rentabilidad sobre el Patrimonio',
            meta_description: 'Calcula la rentabilidad financiera (ROE) a partir del beneficio neto y el patrimonio neto.',
            short_answer: 'Esta calculadora divide el beneficio neto entre el patrimonio neto para darte el ROE — un porcentaje que muestra cuánto beneficio genera una empresa por cada unidad de capital de los accionistas invertido.',
            intro_text: '<p>El ROE es uno de los ratios de rentabilidad más vigilados por los inversores, ya que mide directamente cuán eficientemente la dirección convierte el capital invertido por los accionistas en beneficio.</p><p><b>Los inversores y analistas en España</b> comparan el ROE entre empresas del mismo sector para juzgar la eficiencia de la gestión.</p>',
            key_points: [
                '<b>Fórmula:</b> ROE = Beneficio Neto ÷ Patrimonio Neto × 100.',
                '<b>Regla general:</b> un ROE en el rango del 15-20% suele considerarse fuerte, aunque lo "bueno" varía mucho según el sector.',
                '<b>Cuidado con los efectos del apalancamiento:</b> una empresa puede aumentar artificialmente el ROE asumiendo más deuda (reduciendo el patrimonio) en lugar de mejorar realmente la rentabilidad.',
            ],
            howto: [
                { question: '¿Cuál es la diferencia entre ROE y ROA?', answer: '<p>El ROE mide el retorno respecto al patrimonio neto; el ROA mide el retorno respecto al activo total (patrimonio más deuda).</p>' },
                { question: '¿Debo usar el patrimonio promedio en lugar del patrimonio a fin de periodo?', answer: '<p>Para un análisis más profundo, muchos analistas usan el patrimonio promedio del periodo — esta calculadora usa una sola cifra por simplicidad.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Beneficio Neto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Patrimonio Neto', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Rentabilidad Financiera (ROE)', unit: '%', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-rentabilite-des-capitaux-propres-roe',
            title: 'Calculateur de Rentabilité des Capitaux Propres (ROE)',
            h1: 'Calculateur de Rentabilité des Capitaux Propres (ROE)',
            meta_title: 'Calculateur ROE | Rentabilité pour les Actionnaires',
            meta_description: 'Calculez la rentabilité des capitaux propres (ROE) à partir du résultat net et des capitaux propres.',
            short_answer: 'Ce calculateur divise le résultat net par les capitaux propres pour vous donner le ROE — un pourcentage montrant combien de profit une entreprise génère pour chaque unité de capital actionnarial investi.',
            intro_text: '<p>Le ROE est l’un des ratios de rentabilité les plus surveillés par les investisseurs, car il mesure directement l’efficacité avec laquelle la direction transforme le capital investi par les actionnaires en profit.</p><p><b>Les investisseurs et analystes en France</b> comparent le ROE entre entreprises du même secteur pour juger l’efficacité de la gestion.</p>',
            key_points: [
                '<b>Formule :</b> ROE = Résultat Net ÷ Capitaux Propres × 100.',
                '<b>Règle générale :</b> un ROE dans la fourchette de 15-20 % est souvent considéré comme solide, bien que ce qui est « bon » varie considérablement selon le secteur.',
                '<b>Attention aux effets de levier :</b> une entreprise peut artificiellement gonfler son ROE en s’endettant davantage (réduisant les capitaux propres) plutôt qu’en améliorant réellement sa rentabilité.',
            ],
            howto: [
                { question: 'Quelle est la différence entre ROE et ROA ?', answer: '<p>Le ROE mesure le rendement par rapport aux capitaux propres uniquement ; le ROA mesure le rendement par rapport à l’actif total (capitaux propres plus dette).</p>' },
                { question: 'Dois-je utiliser les capitaux propres moyens plutôt que ceux de fin de période ?', answer: '<p>Pour une analyse plus poussée, de nombreux analystes utilisent les capitaux propres moyens sur la période — ce calculateur utilise un chiffre unique par simplicité.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Résultat Net', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Capitaux Propres', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Rentabilité des Capitaux Propres (ROE)', unit: '%', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-rendimento-del-capitale-proprio-roe',
            title: 'Calcolatore Rendimento del Capitale Proprio (ROE)',
            h1: 'Calcolatore Rendimento del Capitale Proprio (ROE)',
            meta_title: 'Calcolatore ROE | Rendimento per gli Azionisti',
            meta_description: 'Calcola il ROE (rendimento del capitale proprio) dall’utile netto e dal patrimonio netto.',
            short_answer: 'Questo calcolatore divide l’utile netto per il patrimonio netto per darti il ROE — una percentuale che mostra quanto profitto genera un’azienda per ogni unità di capitale azionario investito.',
            intro_text: '<p>Il ROE è uno degli indici di redditività più osservati dagli investitori, poiché misura direttamente quanto efficacemente il management trasforma il capitale investito dagli azionisti in profitto.</p><p><b>Investitori e analisti in Italia</b> confrontano il ROE tra aziende dello stesso settore per giudicare l’efficienza della gestione.</p>',
            key_points: [
                '<b>Formula:</b> ROE = Utile Netto ÷ Patrimonio Netto × 100.',
                '<b>Regola generale:</b> un ROE nell’intervallo 15-20% è spesso considerato solido, sebbene ciò che è "buono" vari notevolmente per settore.',
                '<b>Attenzione agli effetti della leva:</b> un’azienda può gonfiare artificialmente il ROE assumendo più debito (riducendo il patrimonio) invece di migliorare realmente la redditività.',
            ],
            howto: [
                { question: 'Qual è la differenza tra ROE e ROA?', answer: '<p>Il ROE misura il rendimento rispetto al patrimonio netto; il ROA misura il rendimento rispetto al totale delle attività (patrimonio più debito).</p>' },
                { question: 'Dovrei usare il patrimonio medio invece di quello di fine periodo?', answer: '<p>Per un’analisi più approfondita, molti analisti usano il patrimonio medio nel periodo — questo calcolatore usa una singola cifra per semplicità.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Utile Netto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Patrimonio Netto', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Rendimento del Capitale Proprio (ROE)', unit: '%', precision: 2 },
            ],
        },
        de: {
            slug: 'eigenkapitalrendite-roe-rechner',
            title: 'Eigenkapitalrendite (ROE) Rechner',
            h1: 'Eigenkapitalrendite (ROE) Rechner',
            meta_title: 'ROE Rechner | Eigenkapitalrendite für Aktionäre',
            meta_description: 'Berechnen Sie die Eigenkapitalrendite (ROE) aus Nettoeinkommen und Eigenkapital.',
            short_answer: 'Dieser Rechner teilt den Nettogewinn durch das Eigenkapital, um die Eigenkapitalrendite (ROE) zu ermitteln — einen Prozentsatz, der zeigt, wie viel Gewinn ein Unternehmen pro Einheit investierten Aktionärskapitals erwirtschaftet.',
            intro_text: '<p>ROE ist eine der meistbeachteten Rentabilitätskennzahlen für Investoren, da sie direkt misst, wie effektiv das Management das investierte Kapital der Aktionäre in Gewinn umwandelt.</p><p><b>Investoren und Analysten in Deutschland</b> vergleichen den ROE zwischen Unternehmen derselben Branche, um die Managementeffizienz zu beurteilen.</p>',
            key_points: [
                '<b>Formel:</b> ROE = Nettogewinn ÷ Eigenkapital × 100.',
                '<b>Faustregel:</b> ein ROE im Bereich von 15-20% gilt oft als stark, obwohl "gut" je nach Branche stark variiert.',
                '<b>Vorsicht vor Hebeleffekten:</b> ein Unternehmen kann den ROE künstlich steigern, indem es mehr Schulden aufnimmt (Eigenkapital reduziert), statt die Rentabilität wirklich zu verbessern.',
            ],
            howto: [
                { question: 'Was ist der Unterschied zwischen ROE und ROA?', answer: '<p>ROE misst die Rendite nur im Verhältnis zum Eigenkapital; ROA misst die Rendite im Verhältnis zur Gesamtvermögensbasis (Eigenkapital plus Fremdkapital).</p>' },
                { question: 'Sollte ich das durchschnittliche Eigenkapital statt des Periodenend-Eigenkapitals verwenden?', answer: '<p>Für eine tiefere Analyse verwenden viele Analysten das durchschnittliche Eigenkapital über den Zeitraum — dieser Rechner verwendet der Einfachheit halber einen einzigen Wert.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Nettogewinn', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'shareholders_equity', label: 'Eigenkapital', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '400000' },
            ],
            outputs: [
                { name: 'roe_pct', label: 'Eigenkapitalrendite (ROE)', unit: '%', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1061: Return on Assets (ROA) Calculator
// ============================================================
const roa: ToolDef = {
    id: '1061',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'net_income', default: 50000 },
            { key: 'total_assets', default: 1000000 },
        ],
        formulas: {
            roa_pct: 'net_income/total_assets*100',
        },
        outputs: [
            { key: 'roa_pct', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'return-on-assets-roa-calculator',
            title: 'Return on Assets (ROA) Calculator',
            h1: 'Return on Assets (ROA) Calculator',
            meta_title: 'ROA Calculator | Return on Total Assets',
            meta_description: 'Calculate return on assets (ROA) from net income and total assets — a key profitability metric showing how efficiently a company uses everything it owns to generate profit.',
            short_answer: 'This calculator divides net income by total assets to give you return on assets (ROA) — a percentage showing how efficiently a company converts its total assets into profit, regardless of how those assets are financed.',
            intro_text: '<p>ROA measures profitability relative to the full asset base a company controls — both the portion financed by equity and the portion financed by debt. This makes it a useful complement to ROE, which only looks at the equity portion.</p><p><b>Analysts</b> use ROA to compare operational efficiency across companies with different capital structures, since it isn\'t distorted by how much debt a company carries.</p>',
            key_points: [
                '<b>Formula:</b> ROA = Net Income ÷ Total Assets × 100.',
                '<b>Asset-heavy industries run lower ROA:</b> capital-intensive businesses (manufacturing, utilities, airlines) typically show lower ROA than asset-light businesses (software, services) simply because they need more assets to generate the same revenue.',
                '<b>Compare within the same industry:</b> ROA is most meaningful when benchmarked against direct competitors, since asset intensity varies enormously across sectors.',
            ],
            howto: [
                { question: 'Why is ROA usually lower than ROE for the same company?', answer: '<p>Because total assets (the ROA denominator) include both equity and debt, while equity (the ROE denominator) is only part of that total — so ROA is diluted by the debt-financed portion of assets, making it mathematically smaller in most leveraged companies.</p>' },
                { question: 'Is a negative ROA always a red flag?', answer: '<p>A negative ROA means the company posted a net loss — common for early-stage or high-growth companies reinvesting heavily, but concerning for a mature company that should be consistently profitable.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Net Income', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Total Assets', type: 'number', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Return on Assets (ROA)', unit: '%', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-rentabelnosti-aktivov-roa',
            title: 'Калькулятор рентабельности активов (ROA)',
            h1: 'Калькулятор рентабельности активов (ROA)',
            meta_title: 'Калькулятор ROA | Рентабельность совокупных активов',
            meta_description: 'Рассчитайте рентабельность активов (ROA) из чистой прибыли и общих активов — ключевой показатель эффективности использования активов.',
            short_answer: 'Этот калькулятор делит чистую прибыль на общие активы, чтобы получить ROA — процент, показывающий, насколько эффективно компания превращает свои активы в прибыль, независимо от того, как эти активы финансируются.',
            intro_text: '<p>ROA измеряет прибыльность относительно всей базы активов компании — как части, финансируемой капиталом, так и части, финансируемой долгом. Это делает его полезным дополнением к ROE.</p><p><b>Аналитики</b> используют ROA для сравнения операционной эффективности компаний с разной структурой капитала.</p>',
            key_points: [
                '<b>Формула:</b> ROA = Чистая прибыль ÷ Общие активы × 100.',
                '<b>Капиталоёмкие отрасли показывают более низкий ROA:</b> производство, коммунальные услуги, авиакомпании обычно показывают более низкий ROA, чем бизнесы с малыми активами.',
                '<b>Сравнивайте в рамках одной отрасли:</b> ROA наиболее показателен при сравнении с прямыми конкурентами.',
            ],
            howto: [
                { question: 'Почему ROA обычно ниже, чем ROE для одной компании?', answer: '<p>Потому что общие активы (знаменатель ROA) включают и капитал, и долг, тогда как капитал (знаменатель ROE) — лишь часть этой суммы.</p>' },
                { question: 'Отрицательный ROA — всегда тревожный сигнал?', answer: '<p>Отрицательный ROA означает, что компания понесла чистый убыток — обычное явление для стартапов или быстрорастущих компаний, реинвестирующих прибыль.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Чистая прибыль', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Общие активы', type: 'number', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Рентабельность активов (ROA)', unit: '%', precision: 2 },
            ],
        },
        lv: {
            slug: 'aktivu-rentabilitates-roa-kalkulators',
            title: 'Aktīvu Rentabilitātes (ROA) Kalkulators',
            h1: 'Aktīvu Rentabilitātes (ROA) Kalkulators',
            meta_title: 'ROA Kalkulators | Kopējo Aktīvu Rentabilitāte',
            meta_description: 'Aprēķiniet aktīvu rentabilitāti (ROA) no tīrās peļņas un kopējiem aktīviem.',
            short_answer: 'Šis kalkulators dala tīro peļņu ar kopējiem aktīviem, lai iegūtu ROA — procentu, kas parāda, cik efektīvi uzņēmums pārvērš savus aktīvus peļņā.',
            intro_text: '<p>ROA mēra rentabilitāti attiecībā pret visu uzņēmuma aktīvu bāzi — gan pašu kapitāla, gan parāda finansēto daļu. Tas padara to par noderīgu papildinājumu ROE.</p><p><b>Analītiķi</b> izmanto ROA, lai salīdzinātu operatīvo efektivitāti starp uzņēmumiem ar atšķirīgu kapitāla struktūru.</p>',
            key_points: [
                '<b>Formula:</b> ROA = Tīrā Peļņa ÷ Kopējie Aktīvi × 100.',
                '<b>Aktīvu ietilpīgas nozares uzrāda zemāku ROA:</b> ražošana, komunālie pakalpojumi parasti uzrāda zemāku ROA nekā biznesi ar maziem aktīviem.',
                '<b>Salīdziniet vienā nozarē:</b> ROA ir visnozīmīgākais, salīdzinot ar tiešajiem konkurentiem.',
            ],
            howto: [
                { question: 'Kāpēc ROA parasti ir zemāks nekā ROE tam pašam uzņēmumam?', answer: '<p>Jo kopējie aktīvi (ROA saucējs) ietver gan kapitālu, gan parādu, kamēr kapitāls (ROE saucējs) ir tikai daļa no šīs summas.</p>' },
                { question: 'Vai negatīvs ROA vienmēr ir brīdinājuma signāls?', answer: '<p>Negatīvs ROA nozīmē, ka uzņēmums cietis tīros zaudējumus — bieži sastopams jaunuzņēmumos vai strauji augošos uzņēmumos.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Tīrā Peļņa', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Kopējie Aktīvi', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Aktīvu Rentabilitāte (ROA)', unit: '%', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-rentownosci-aktywow-roa',
            title: 'Kalkulator Rentowności Aktywów (ROA)',
            h1: 'Kalkulator Rentowności Aktywów (ROA)',
            meta_title: 'Kalkulator ROA | Rentowność Aktywów Ogółem',
            meta_description: 'Oblicz rentowność aktywów (ROA) z zysku netto i aktywów ogółem.',
            short_answer: 'Ten kalkulator dzieli zysk netto przez aktywa ogółem, aby uzyskać ROA — procent pokazujący, jak efektywnie firma zamienia swoje aktywa w zysk.',
            intro_text: '<p>ROA mierzy rentowność w stosunku do całej bazy aktywów firmy — zarówno części finansowanej kapitałem, jak i częścią finansowaną długiem. To czyni go użytecznym uzupełnieniem ROE.</p><p><b>Analitycy</b> używają ROA do porównywania efektywności operacyjnej firm o różnej strukturze kapitału.</p>',
            key_points: [
                '<b>Wzór:</b> ROA = Zysk Netto ÷ Aktywa Ogółem × 100.',
                '<b>Branże kapitałochłonne mają niższe ROA:</b> produkcja, media zwykle wykazują niższe ROA niż firmy o niskich aktywach.',
                '<b>Porównuj w ramach tej samej branży:</b> ROA jest najbardziej znaczące przy porównaniu z bezpośrednimi konkurentami.',
            ],
            howto: [
                { question: 'Dlaczego ROA jest zwykle niższe niż ROE dla tej samej firmy?', answer: '<p>Ponieważ aktywa ogółem (mianownik ROA) obejmują zarówno kapitał, jak i dług, podczas gdy kapitał (mianownik ROE) to tylko część tej sumy.</p>' },
                { question: 'Czy ujemne ROA zawsze jest sygnałem ostrzegawczym?', answer: '<p>Ujemne ROA oznacza, że firma odnotowała stratę netto — częste w start-upach lub szybko rosnących firmach reinwestujących zyski.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Zysk Netto', type: 'number', unit: 'zł', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Aktywa Ogółem', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Rentowność Aktywów (ROA)', unit: '%', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-rentabilidad-sobre-activos-roa',
            title: 'Calculadora de Rentabilidad sobre Activos (ROA)',
            h1: 'Calculadora de Rentabilidad sobre Activos (ROA)',
            meta_title: 'Calculadora ROA | Rentabilidad sobre el Activo Total',
            meta_description: 'Calcula la rentabilidad sobre activos (ROA) a partir del beneficio neto y el activo total.',
            short_answer: 'Esta calculadora divide el beneficio neto entre el activo total para darte el ROA — un porcentaje que muestra cuán eficientemente una empresa convierte sus activos totales en beneficio.',
            intro_text: '<p>El ROA mide la rentabilidad respecto a toda la base de activos que controla una empresa — tanto la parte financiada con patrimonio como la financiada con deuda. Esto lo convierte en un complemento útil del ROE.</p><p><b>Los analistas en España</b> usan el ROA para comparar la eficiencia operativa entre empresas con distintas estructuras de capital.</p>',
            key_points: [
                '<b>Fórmula:</b> ROA = Beneficio Neto ÷ Activo Total × 100.',
                '<b>Los sectores intensivos en activos tienen ROA más bajo:</b> fabricación, servicios públicos suelen mostrar ROA más bajo que negocios con pocos activos.',
                '<b>Compara dentro del mismo sector:</b> el ROA es más significativo cuando se compara con competidores directos.',
            ],
            howto: [
                { question: '¿Por qué el ROA suele ser menor que el ROE para la misma empresa?', answer: '<p>Porque el activo total (denominador del ROA) incluye tanto el patrimonio como la deuda, mientras que el patrimonio (denominador del ROE) es solo parte de ese total.</p>' },
                { question: '¿Un ROA negativo siempre es una señal de alarma?', answer: '<p>Un ROA negativo significa que la empresa registró una pérdida neta — común en empresas emergentes o de alto crecimiento que reinvierten fuertemente.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Beneficio Neto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Activo Total', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Rentabilidad sobre Activos (ROA)', unit: '%', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-rentabilite-des-actifs-roa',
            title: 'Calculateur de Rentabilité des Actifs (ROA)',
            h1: 'Calculateur de Rentabilité des Actifs (ROA)',
            meta_title: 'Calculateur ROA | Rendement de l’Actif Total',
            meta_description: 'Calculez la rentabilité des actifs (ROA) à partir du résultat net et de l’actif total.',
            short_answer: 'Ce calculateur divise le résultat net par l’actif total pour vous donner le ROA — un pourcentage montrant avec quelle efficacité une entreprise convertit ses actifs totaux en profit.',
            intro_text: '<p>Le ROA mesure la rentabilité par rapport à toute la base d’actifs qu’une entreprise contrôle — à la fois la part financée par les capitaux propres et celle financée par la dette. Cela en fait un complément utile au ROE.</p><p><b>Les analystes en France</b> utilisent le ROA pour comparer l’efficacité opérationnelle entre entreprises ayant des structures de capital différentes.</p>',
            key_points: [
                '<b>Formule :</b> ROA = Résultat Net ÷ Actif Total × 100.',
                '<b>Les secteurs à forte intensité d’actifs ont un ROA plus faible :</b> l’industrie, les services publics affichent généralement un ROA plus faible que les entreprises à faible intensité d’actifs.',
                '<b>Comparez au sein du même secteur :</b> le ROA est le plus pertinent lorsqu’il est comparé à des concurrents directs.',
            ],
            howto: [
                { question: 'Pourquoi le ROA est-il généralement inférieur au ROE pour une même entreprise ?', answer: '<p>Parce que l’actif total (dénominateur du ROA) inclut à la fois les capitaux propres et la dette, alors que les capitaux propres (dénominateur du ROE) n’en représentent qu’une partie.</p>' },
                { question: 'Un ROA négatif est-il toujours un signal d’alarme ?', answer: '<p>Un ROA négatif signifie que l’entreprise a enregistré une perte nette — courant pour les entreprises en démarrage ou à forte croissance qui réinvestissent massivement.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Résultat Net', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Actif Total', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Rentabilité des Actifs (ROA)', unit: '%', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-rendimento-degli-attivi-roa',
            title: 'Calcolatore Rendimento degli Attivi (ROA)',
            h1: 'Calcolatore Rendimento degli Attivi (ROA)',
            meta_title: 'Calcolatore ROA | Rendimento del Totale Attivo',
            meta_description: 'Calcola il ROA (rendimento degli attivi) dall’utile netto e dal totale attivo.',
            short_answer: 'Questo calcolatore divide l’utile netto per il totale attivo per darti il ROA — una percentuale che mostra quanto efficientemente un’azienda converte i suoi attivi totali in profitto.',
            intro_text: '<p>Il ROA misura la redditività rispetto all’intera base di attivi che un’azienda controlla — sia la parte finanziata dal patrimonio sia quella finanziata dal debito. Questo lo rende un utile complemento al ROE.</p><p><b>Gli analisti in Italia</b> usano il ROA per confrontare l’efficienza operativa tra aziende con strutture di capitale diverse.</p>',
            key_points: [
                '<b>Formula:</b> ROA = Utile Netto ÷ Totale Attivo × 100.',
                '<b>I settori ad alta intensità di attivi hanno ROA più basso:</b> produzione, utility mostrano tipicamente ROA più basso rispetto ad aziende con pochi attivi.',
                '<b>Confronta all’interno dello stesso settore:</b> il ROA è più significativo se confrontato con concorrenti diretti.',
            ],
            howto: [
                { question: 'Perché il ROA è solitamente inferiore al ROE per la stessa azienda?', answer: '<p>Perché il totale attivo (denominatore del ROA) include sia il patrimonio sia il debito, mentre il patrimonio (denominatore del ROE) è solo una parte di quel totale.</p>' },
                { question: 'Un ROA negativo è sempre un segnale d’allarme?', answer: '<p>Un ROA negativo significa che l’azienda ha registrato una perdita netta — comune in aziende in fase iniziale o ad alta crescita che reinvestono pesantemente.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Utile Netto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Totale Attivo', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Rendimento degli Attivi (ROA)', unit: '%', precision: 2 },
            ],
        },
        de: {
            slug: 'gesamtkapitalrendite-roa-rechner',
            title: 'Gesamtkapitalrendite (ROA) Rechner',
            h1: 'Gesamtkapitalrendite (ROA) Rechner',
            meta_title: 'ROA Rechner | Rendite auf das Gesamtvermögen',
            meta_description: 'Berechnen Sie die Gesamtkapitalrendite (ROA) aus Nettoeinkommen und Gesamtvermögen.',
            short_answer: 'Dieser Rechner teilt den Nettogewinn durch das Gesamtvermögen, um die Gesamtkapitalrendite (ROA) zu ermitteln — einen Prozentsatz, der zeigt, wie effizient ein Unternehmen sein gesamtes Vermögen in Gewinn umwandelt.',
            intro_text: '<p>ROA misst die Rentabilität im Verhältnis zur gesamten Vermögensbasis eines Unternehmens — sowohl den durch Eigenkapital als auch den durch Fremdkapital finanzierten Teil. Das macht sie zu einer nützlichen Ergänzung zum ROE.</p><p><b>Analysten in Deutschland</b> nutzen ROA, um die operative Effizienz zwischen Unternehmen mit unterschiedlicher Kapitalstruktur zu vergleichen.</p>',
            key_points: [
                '<b>Formel:</b> ROA = Nettogewinn ÷ Gesamtvermögen × 100.',
                '<b>Kapitalintensive Branchen weisen niedrigere ROA auf:</b> Fertigung, Versorgungsunternehmen zeigen typischerweise niedrigere ROA als Unternehmen mit geringem Kapitalbedarf.',
                '<b>Vergleichen Sie innerhalb derselben Branche:</b> ROA ist am aussagekräftigsten im Vergleich mit direkten Wettbewerbern.',
            ],
            howto: [
                { question: 'Warum ist ROA normalerweise niedriger als ROE für dasselbe Unternehmen?', answer: '<p>Weil das Gesamtvermögen (Nenner von ROA) sowohl Eigenkapital als auch Fremdkapital umfasst, während Eigenkapital (Nenner von ROE) nur ein Teil dieser Summe ist.</p>' },
                { question: 'Ist eine negative ROA immer ein Warnsignal?', answer: '<p>Eine negative ROA bedeutet, dass das Unternehmen einen Nettoverlust verzeichnet hat — üblich bei jungen oder stark wachsenden Unternehmen, die stark reinvestieren.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Nettogewinn', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'total_assets', label: 'Gesamtvermögen', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1000000' },
            ],
            outputs: [
                { name: 'roa_pct', label: 'Gesamtkapitalrendite (ROA)', unit: '%', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1062: Net Profit Margin Calculator (financial-statement analysis,
// distinct from the pricing-focused Profit Margin Calculator in Business & Sales)
// ============================================================
const netProfitMargin: ToolDef = {
    id: '1062',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'net_income', default: 50000 },
            { key: 'revenue', default: 500000 },
        ],
        formulas: {
            npm_pct: 'net_income/revenue*100',
        },
        outputs: [
            { key: 'npm_pct', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'net-profit-margin-calculator',
            title: 'Net Profit Margin Calculator',
            h1: 'Net Profit Margin Calculator',
            meta_title: 'Net Profit Margin Calculator | Bottom-Line Profitability',
            meta_description: 'Calculate net profit margin from net income and total revenue — the bottom-line profitability ratio used in financial statement analysis.',
            short_answer: 'This calculator divides net income by total revenue to give you the net profit margin — the percentage of every unit of revenue that ultimately becomes profit after all expenses, interest, and taxes.',
            intro_text: '<p>Net profit margin is the "bottom line" profitability ratio in financial statement analysis — it accounts for every cost a business incurs (cost of goods sold, operating expenses, interest, taxes) rather than just direct product costs. It differs from a simple price-vs-cost markup calculation, since it reflects an entire income statement.</p><p><b>Investors and analysts</b> use net profit margin to compare overall profitability efficiency across companies and track trends over time, since it captures everything below the revenue line.</p>',
            key_points: [
                '<b>Formula:</b> Net Profit Margin = Net Income ÷ Total Revenue × 100.',
                '<b>Not the same as gross margin:</b> gross margin only subtracts direct cost of goods sold from revenue; net profit margin subtracts everything — operating costs, interest, and taxes — giving the true bottom line.',
                '<b>Benchmarks vary hugely by industry:</b> software companies often post net margins above 20%, while grocery retailers commonly operate on margins of just 1-3% — always compare within the same sector.',
            ],
            howto: [
                { question: 'Where do I find "net income" on financial statements?', answer: '<p>Net income is the final line of the income statement (profit and loss statement), after all revenue, cost of goods sold, operating expenses, interest, and taxes have been accounted for.</p>' },
                { question: 'Why is net profit margin more useful than looking at net income alone?', answer: '<p>Net income alone doesn\'t tell you how efficient a business is — a $1 million profit on $100 million revenue (1% margin) is very different from $1 million profit on $5 million revenue (20% margin). The ratio normalizes for company size.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Net Income', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Total Revenue', type: 'number', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Net Profit Margin', unit: '%', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-chistoy-rentabelnosti',
            title: 'Калькулятор чистой рентабельности',
            h1: 'Калькулятор чистой рентабельности',
            meta_title: 'Чистая рентабельность | Итоговая прибыльность бизнеса',
            meta_description: 'Рассчитайте чистую рентабельность из чистой прибыли и общей выручки — итоговый показатель прибыльности для анализа финансовой отчётности.',
            short_answer: 'Этот калькулятор делит чистую прибыль на общую выручку, чтобы получить чистую рентабельность — процент от каждой единицы выручки, который в итоге становится прибылью после всех расходов, процентов и налогов.',
            intro_text: '<p>Чистая рентабельность — это "итоговый" показатель прибыльности в анализе финансовой отчётности — он учитывает все затраты бизнеса (себестоимость, операционные расходы, проценты, налоги), а не только прямые затраты на продукт.</p><p><b>Инвесторы и аналитики</b> используют чистую рентабельность для сравнения общей эффективности прибыльности между компаниями.</p>',
            key_points: [
                '<b>Формула:</b> Чистая рентабельность = Чистая прибыль ÷ Общая выручка × 100.',
                '<b>Не то же самое, что валовая маржа:</b> валовая маржа вычитает из выручки только прямую себестоимость; чистая рентабельность вычитает всё.',
                '<b>Эталоны сильно различаются по отраслям:</b> софтверные компании часто показывают чистую маржу выше 20%, тогда как продуктовые ритейлеры обычно работают с маржой всего 1-3%.',
            ],
            howto: [
                { question: 'Где найти "чистую прибыль" в финансовой отчётности?', answer: '<p>Чистая прибыль — это последняя строка отчёта о прибылях и убытках, после учёта всей выручки, себестоимости, операционных расходов, процентов и налогов.</p>' },
                { question: 'Почему чистая рентабельность полезнее, чем просто чистая прибыль?', answer: '<p>Сама по себе чистая прибыль не показывает эффективность бизнеса — прибыль $1 млн на выручку $100 млн (1% маржи) сильно отличается от прибыли $1 млн на выручку $5 млн (20% маржи).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Чистая прибыль', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Общая выручка', type: 'number', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Чистая рентабельность', unit: '%', precision: 2 },
            ],
        },
        lv: {
            slug: 'tiras-peljnas-normas-kalkulators',
            title: 'Tīrās Peļņas Normas Kalkulators',
            h1: 'Tīrās Peļņas Normas Kalkulators',
            meta_title: 'Tīrās Peļņas Norma | Gala Rentabilitāte',
            meta_description: 'Aprēķiniet tīrās peļņas normu no tīrās peļņas un kopējiem ieņēmumiem — gala rentabilitātes rādītāju finanšu pārskatu analīzē.',
            short_answer: 'Šis kalkulators dala tīro peļņu ar kopējiem ieņēmumiem, lai iegūtu tīrās peļņas normu — procentu no katras ieņēmumu vienības, kas galu galā kļūst par peļņu pēc visiem izdevumiem, procentiem un nodokļiem.',
            intro_text: '<p>Tīrās peļņas norma ir "gala" rentabilitātes rādītājs finanšu pārskatu analīzē — tas ņem vērā visas biznesa izmaksas, nevis tikai tiešās produkta izmaksas.</p><p><b>Investori un analītiķi</b> izmanto tīrās peļņas normu, lai salīdzinātu vispārējo rentabilitātes efektivitāti starp uzņēmumiem.</p>',
            key_points: [
                '<b>Formula:</b> Tīrās Peļņas Norma = Tīrā Peļņa ÷ Kopējie Ieņēmumi × 100.',
                '<b>Nav tas pats, kas bruto marža:</b> bruto marža atskaita no ieņēmumiem tikai tiešās izmaksas; tīrās peļņas norma atskaita visu.',
                '<b>Etaloni ļoti atšķiras pēc nozares:</b> programmatūras uzņēmumi bieži uzrāda tīro maržu virs 20%, kamēr pārtikas mazumtirgotāji parasti darbojas ar tikai 1-3% maržu.',
            ],
            howto: [
                { question: 'Kur atrast "tīro peļņu" finanšu pārskatos?', answer: '<p>Tīrā peļņa ir peļņas un zaudējumu aprēķina pēdējā rinda, pēc visu ieņēmumu, izmaksu, operatīvo izdevumu, procentu un nodokļu ņemšanas vērā.</p>' },
                { question: 'Kāpēc tīrās peļņas norma ir noderīgāka nekā tikai tīrā peļņa?', answer: '<p>Tīrā peļņa pati par sevi neparāda biznesa efektivitāti — 1 miljona peļņa no 100 miljonu ieņēmumiem (1% marža) ļoti atšķiras no 1 miljona peļņas no 5 miljonu ieņēmumiem (20% marža).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Tīrā Peļņa', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Kopējie Ieņēmumi', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Tīrās Peļņas Norma', unit: '%', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-marzy-zysku-netto',
            title: 'Kalkulator Marży Zysku Netto',
            h1: 'Kalkulator Marży Zysku Netto',
            meta_title: 'Marża Zysku Netto | Rentowność Końcowa',
            meta_description: 'Oblicz marżę zysku netto z zysku netto i całkowitych przychodów — wskaźnik końcowej rentowności w analizie sprawozdań finansowych.',
            short_answer: 'Ten kalkulator dzieli zysk netto przez całkowite przychody, aby uzyskać marżę zysku netto — procent z każdej jednostki przychodu, który ostatecznie staje się zyskiem po wszystkich kosztach, odsetkach i podatkach.',
            intro_text: '<p>Marża zysku netto to "końcowy" wskaźnik rentowności w analizie sprawozdań finansowych — uwzględnia wszystkie koszty biznesu, a nie tylko bezpośrednie koszty produktu.</p><p><b>Inwestorzy i analitycy</b> używają marży zysku netto do porównywania ogólnej efektywności rentowności między firmami.</p>',
            key_points: [
                '<b>Wzór:</b> Marża Zysku Netto = Zysk Netto ÷ Całkowite Przychody × 100.',
                '<b>To nie to samo, co marża brutto:</b> marża brutto odejmuje od przychodów tylko bezpośredni koszt sprzedanych towarów; marża zysku netto odejmuje wszystko.',
                '<b>Wzorce mocno różnią się w zależności od branży:</b> firmy software\'owe często osiągają marże netto powyżej 20%, podczas gdy sklepy spożywcze zwykle działają z marżą zaledwie 1-3%.',
            ],
            howto: [
                { question: 'Gdzie znaleźć "zysk netto" w sprawozdaniach finansowych?', answer: '<p>Zysk netto to ostatnia linia rachunku zysków i strat, po uwzględnieniu wszystkich przychodów, kosztów sprzedanych towarów, kosztów operacyjnych, odsetek i podatków.</p>' },
                { question: 'Dlaczego marża zysku netto jest bardziej użyteczna niż sam zysk netto?', answer: '<p>Sam zysk netto nie mówi, jak efektywna jest firma — 1 mln zysku przy 100 mln przychodów (1% marży) bardzo różni się od 1 mln zysku przy 5 mln przychodów (20% marży).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Zysk Netto', type: 'number', unit: 'zł', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Całkowite Przychody', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Marża Zysku Netto', unit: '%', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-margen-de-beneficio-neto',
            title: 'Calculadora de Margen de Beneficio Neto',
            h1: 'Calculadora de Margen de Beneficio Neto',
            meta_title: 'Margen de Beneficio Neto | Rentabilidad Final',
            meta_description: 'Calcula el margen de beneficio neto a partir del beneficio neto y los ingresos totales — el ratio de rentabilidad final en el análisis de estados financieros.',
            short_answer: 'Esta calculadora divide el beneficio neto entre los ingresos totales para darte el margen de beneficio neto — el porcentaje de cada unidad de ingresos que finalmente se convierte en beneficio tras todos los gastos, intereses e impuestos.',
            intro_text: '<p>El margen de beneficio neto es el ratio de rentabilidad "final" en el análisis de estados financieros — tiene en cuenta todos los costes de un negocio, no solo los costes directos del producto.</p><p><b>Los inversores y analistas en España</b> usan el margen de beneficio neto para comparar la eficiencia de rentabilidad general entre empresas.</p>',
            key_points: [
                '<b>Fórmula:</b> Margen de Beneficio Neto = Beneficio Neto ÷ Ingresos Totales × 100.',
                '<b>No es lo mismo que el margen bruto:</b> el margen bruto solo resta de los ingresos el coste directo de ventas; el margen de beneficio neto resta todo.',
                '<b>Los puntos de referencia varían enormemente por sector:</b> las empresas de software suelen registrar márgenes netos superiores al 20%, mientras que los supermercados suelen operar con márgenes de solo 1-3%.',
            ],
            howto: [
                { question: '¿Dónde encuentro el "beneficio neto" en los estados financieros?', answer: '<p>El beneficio neto es la última línea de la cuenta de resultados, después de contabilizar todos los ingresos, el coste de ventas, los gastos operativos, los intereses y los impuestos.</p>' },
                { question: '¿Por qué el margen de beneficio neto es más útil que mirar solo el beneficio neto?', answer: '<p>El beneficio neto por sí solo no indica la eficiencia de un negocio — un beneficio de 1 millón sobre 100 millones de ingresos (1% de margen) es muy diferente de 1 millón sobre 5 millones (20% de margen).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Beneficio Neto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Ingresos Totales', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Margen de Beneficio Neto', unit: '%', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-marge-beneficiaire-nette',
            title: 'Calculateur de Marge Bénéficiaire Nette',
            h1: 'Calculateur de Marge Bénéficiaire Nette',
            meta_title: 'Marge Bénéficiaire Nette | Rentabilité Finale',
            meta_description: 'Calculez la marge bénéficiaire nette à partir du résultat net et du chiffre d’affaires total — le ratio de rentabilité finale en analyse financière.',
            short_answer: 'Ce calculateur divise le résultat net par le chiffre d’affaires total pour vous donner la marge bénéficiaire nette — le pourcentage de chaque unité de revenu qui devient finalement du profit après toutes les charges, intérêts et impôts.',
            intro_text: '<p>La marge bénéficiaire nette est le ratio de rentabilité « final » en analyse des états financiers — elle prend en compte tous les coûts d’une entreprise, pas seulement les coûts directs du produit.</p><p><b>Les investisseurs et analystes en France</b> utilisent la marge bénéficiaire nette pour comparer l’efficacité globale de rentabilité entre entreprises.</p>',
            key_points: [
                '<b>Formule :</b> Marge Bénéficiaire Nette = Résultat Net ÷ Chiffre d’Affaires Total × 100.',
                '<b>Ce n’est pas la même chose que la marge brute :</b> la marge brute ne soustrait du revenu que le coût direct des ventes ; la marge bénéficiaire nette soustrait tout.',
                '<b>Les références varient énormément selon le secteur :</b> les entreprises de logiciels affichent souvent des marges nettes supérieures à 20 %, tandis que les épiceries opèrent généralement avec des marges de seulement 1-3 %.',
            ],
            howto: [
                { question: 'Où trouver le « résultat net » dans les états financiers ?', answer: '<p>Le résultat net est la dernière ligne du compte de résultat, après prise en compte de tous les revenus, coûts des ventes, charges d’exploitation, intérêts et impôts.</p>' },
                { question: 'Pourquoi la marge bénéficiaire nette est-elle plus utile que le résultat net seul ?', answer: '<p>Le résultat net seul ne montre pas l’efficacité d’une entreprise — un profit d’1 million sur 100 millions de revenus (1 % de marge) est très différent d’1 million sur 5 millions (20 % de marge).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Résultat Net', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Chiffre d’Affaires Total', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Marge Bénéficiaire Nette', unit: '%', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-margine-di-utile-netto',
            title: 'Calcolatore Margine di Utile Netto',
            h1: 'Calcolatore Margine di Utile Netto',
            meta_title: 'Margine di Utile Netto | Redditività Finale',
            meta_description: 'Calcola il margine di utile netto dall’utile netto e dai ricavi totali — l’indice di redditività finale nell’analisi di bilancio.',
            short_answer: 'Questo calcolatore divide l’utile netto per i ricavi totali per darti il margine di utile netto — la percentuale di ogni unità di ricavo che alla fine diventa profitto dopo tutte le spese, interessi e imposte.',
            intro_text: '<p>Il margine di utile netto è l’indice di redditività "finale" nell’analisi di bilancio — tiene conto di tutti i costi di un’azienda, non solo dei costi diretti del prodotto.</p><p><b>Investitori e analisti in Italia</b> usano il margine di utile netto per confrontare l’efficienza di redditività complessiva tra aziende.</p>',
            key_points: [
                '<b>Formula:</b> Margine di Utile Netto = Utile Netto ÷ Ricavi Totali × 100.',
                '<b>Non è lo stesso del margine lordo:</b> il margine lordo sottrae dai ricavi solo il costo diretto delle vendite; il margine di utile netto sottrae tutto.',
                '<b>I benchmark variano enormemente per settore:</b> le aziende di software spesso registrano margini netti superiori al 20%, mentre i supermercati tipicamente operano con margini di solo 1-3%.',
            ],
            howto: [
                { question: 'Dove trovo l’"utile netto" nei bilanci?', answer: '<p>L’utile netto è l’ultima riga del conto economico, dopo aver contabilizzato tutti i ricavi, il costo delle vendite, le spese operative, gli interessi e le imposte.</p>' },
                { question: 'Perché il margine di utile netto è più utile del solo utile netto?', answer: '<p>L’utile netto da solo non indica quanto sia efficiente un’azienda — un profitto di 1 milione su 100 milioni di ricavi (1% di margine) è molto diverso da 1 milione su 5 milioni (20% di margine).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Utile Netto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Ricavi Totali', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Margine di Utile Netto', unit: '%', precision: 2 },
            ],
        },
        de: {
            slug: 'nettogewinnmarge-rechner',
            title: 'Nettogewinnmarge-Rechner',
            h1: 'Nettogewinnmarge-Rechner',
            meta_title: 'Nettogewinnmarge | Endgültige Rentabilität',
            meta_description: 'Berechnen Sie die Nettogewinnmarge aus Nettogewinn und Gesamtumsatz — die endgültige Rentabilitätskennzahl in der Jahresabschlussanalyse.',
            short_answer: 'Dieser Rechner teilt den Nettogewinn durch den Gesamtumsatz, um Ihnen die Nettogewinnmarge zu zeigen — den Prozentsatz jeder Umsatzeinheit, der letztlich nach allen Kosten, Zinsen und Steuern zu Gewinn wird.',
            intro_text: '<p>Die Nettogewinnmarge ist die "endgültige" Rentabilitätskennzahl in der Jahresabschlussanalyse — sie berücksichtigt alle Kosten eines Unternehmens, nicht nur die direkten Produktkosten.</p><p><b>Investoren und Analysten in Deutschland</b> nutzen die Nettogewinnmarge, um die allgemeine Rentabilitätseffizienz zwischen Unternehmen zu vergleichen.</p>',
            key_points: [
                '<b>Formel:</b> Nettogewinnmarge = Nettogewinn ÷ Gesamtumsatz × 100.',
                '<b>Nicht dasselbe wie die Bruttomarge:</b> die Bruttomarge zieht vom Umsatz nur die direkten Herstellungskosten ab; die Nettogewinnmarge zieht alles ab.',
                '<b>Benchmarks variieren stark je nach Branche:</b> Softwareunternehmen weisen oft Nettomargen über 20% auf, während Lebensmitteleinzelhändler meist mit nur 1-3% Marge arbeiten.',
            ],
            howto: [
                { question: 'Wo finde ich den "Nettogewinn" in Jahresabschlüssen?', answer: '<p>Der Nettogewinn ist die letzte Zeile der Gewinn- und Verlustrechnung, nach Berücksichtigung aller Umsätze, Herstellungskosten, Betriebskosten, Zinsen und Steuern.</p>' },
                { question: 'Warum ist die Nettogewinnmarge nützlicher als der Nettogewinn allein?', answer: '<p>Der Nettogewinn allein zeigt nicht, wie effizient ein Unternehmen ist — ein Gewinn von 1 Million bei 100 Millionen Umsatz (1% Marge) unterscheidet sich stark von 1 Million bei 5 Millionen Umsatz (20% Marge).</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Nettogewinn', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '50000' },
                { name: 'revenue', label: 'Gesamtumsatz', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '500000' },
            ],
            outputs: [
                { name: 'npm_pct', label: 'Nettogewinnmarge', unit: '%', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1063: Working Capital Calculator (monetary output — currency toggle for EN/RU)
// ============================================================
const workingCapital: ToolDef = {
    id: '1063',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'current_assets', default: 150000 },
            { key: 'current_liabilities', default: 75000 },
        ],
        formulas: {
            working_capital: 'current_assets-current_liabilities',
        },
        outputs: [
            { key: 'working_capital', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'working-capital-calculator',
            title: 'Working Capital Calculator',
            h1: 'Working Capital Calculator',
            meta_title: 'Working Capital Calculator | Short-Term Financial Health',
            meta_description: 'Calculate working capital from current assets and current liabilities — the absolute amount of short-term resources a business has available after covering short-term debts.',
            short_answer: 'This calculator subtracts current liabilities from current assets to give you working capital — the actual amount of money a business has left over to fund day-to-day operations after covering short-term obligations.',
            intro_text: '<p>Working capital is the dollar (or euro) counterpart to the current ratio — instead of a ratio, it gives you the actual surplus (or shortfall) of short-term resources over short-term debts. A positive figure means the business can comfortably fund operations; a negative figure signals a potential cash crunch.</p><p><b>Business owners and lenders</b> use working capital to plan day-to-day operations, inventory purchases, and payroll funding needs.</p>',
            key_points: [
                '<b>Formula:</b> Working Capital = Current Assets − Current Liabilities.',
                '<b>Positive vs negative:</b> positive working capital means short-term assets exceed short-term debts (healthy cushion); negative working capital means the opposite and can signal liquidity trouble even if the company is profitable on paper.',
                '<b>Watch the trend, not just the number:</b> a shrinking working capital balance over several periods can be an early warning sign, even if the current figure looks fine.',
            ],
            howto: [
                { question: 'How is working capital different from the current ratio?', answer: '<p>The current ratio expresses the same relationship as a ratio (current assets ÷ current liabilities); working capital expresses it as an absolute currency amount (current assets − current liabilities) — both use the same balance-sheet inputs.</p>' },
                { question: 'Can a company have negative working capital and still be healthy?', answer: '<p>In some business models (e.g. subscription businesses collecting cash upfront, or grocery retailers with very fast inventory turnover), negative working capital can be normal and even a sign of an efficient business model — context matters.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Current Assets', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Current Liabilities', type: 'number', min: 0, max: 1000000000000, placeholder: '75000' },
                currencyInput,
            ],
            outputs: [
                { name: 'working_capital', label: 'Working Capital', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-oborotnogo-kapitala',
            title: 'Калькулятор оборотного капитала',
            h1: 'Калькулятор оборотного капитала',
            meta_title: 'Оборотный капитал | Краткосрочное финансовое здоровье',
            meta_description: 'Рассчитайте оборотный капитал из оборотных активов и краткосрочных обязательств — сумму краткосрочных ресурсов, доступных после покрытия краткосрочных долгов.',
            short_answer: 'Этот калькулятор вычитает краткосрочные обязательства из оборотных активов, чтобы получить оборотный капитал — фактическую сумму денег, которая остаётся у бизнеса для финансирования текущей деятельности.',
            intro_text: '<p>Оборотный капитал — это денежный (в рублях, долларах или евро) эквивалент коэффициента текущей ликвидности — вместо коэффициента он даёт фактический излишек (или недостачу) краткосрочных ресурсов над краткосрочными долгами.</p><p><b>Владельцы бизнеса и кредиторы</b> используют оборотный капитал для планирования повседневных операций.</p>',
            key_points: [
                '<b>Формула:</b> Оборотный капитал = Оборотные активы − Краткосрочные обязательства.',
                '<b>Положительный vs отрицательный:</b> положительный оборотный капитал означает, что краткосрочные активы превышают краткосрочные долги; отрицательный — наоборот и может сигнализировать о проблемах с ликвидностью.',
                '<b>Следите за трендом, а не только за числом:</b> сокращающийся оборотный капитал за несколько периодов может быть ранним предупреждающим сигналом.',
            ],
            howto: [
                { question: 'Чем оборотный капитал отличается от коэффициента текущей ликвидности?', answer: '<p>Коэффициент текущей ликвидности выражает то же отношение в виде коэффициента; оборотный капитал выражает его в виде абсолютной денежной суммы.</p>' },
                { question: 'Может ли компания иметь отрицательный оборотный капитал и оставаться здоровой?', answer: '<p>В некоторых бизнес-моделях (например, подписочные сервисы, собирающие деньги заранее) отрицательный оборотный капитал может быть нормой.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Оборотные активы', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Краткосрочные обязательства', type: 'number', min: 0, max: 1000000000000, placeholder: '75000' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'working_capital', label: 'Оборотный капитал', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'apgrozamo-lidzeklu-kalkulators',
            title: 'Apgrozāmo Līdzekļu Kalkulators',
            h1: 'Apgrozāmo Līdzekļu Kalkulators',
            meta_title: 'Apgrozāmie Līdzekļi | Īstermiņa Finansiālā Veselība',
            meta_description: 'Aprēķiniet apgrozāmos līdzekļus no apgrozāmajiem aktīviem un īstermiņa saistībām.',
            short_answer: 'Šis kalkulators atskaita īstermiņa saistības no apgrozāmajiem aktīviem, lai iegūtu apgrozāmos līdzekļus — faktisko naudas summu, kas biznesam paliek pāri ikdienas darbības finansēšanai.',
            intro_text: '<p>Apgrozāmie līdzekļi ir naudas (euro) ekvivalents kārtējās likviditātes koeficientam — tā vietā, lai dotu koeficientu, tas dod faktisko pārpalikumu (vai iztrūkumu) īstermiņa resursu pār īstermiņa parādiem.</p><p><b>Uzņēmumu īpašnieki un kreditori</b> izmanto apgrozāmos līdzekļus, lai plānotu ikdienas darbību.</p>',
            key_points: [
                '<b>Formula:</b> Apgrozāmie Līdzekļi = Apgrozāmie Aktīvi − Īstermiņa Saistības.',
                '<b>Pozitīvs pret negatīvu:</b> pozitīvi apgrozāmie līdzekļi nozīmē, ka īstermiņa aktīvi pārsniedz īstermiņa parādus; negatīvi — pretēji un var signalizēt par likviditātes problēmām.',
                '<b>Vērojiet tendenci, ne tikai skaitli:</b> sarūkoša apgrozāmo līdzekļu bilance vairākos periodos var būt agrīns brīdinājuma signāls.',
            ],
            howto: [
                { question: 'Kā apgrozāmie līdzekļi atšķiras no kārtējās likviditātes koeficienta?', answer: '<p>Kārtējās likviditātes koeficients izsaka to pašu attiecību kā koeficientu; apgrozāmie līdzekļi izsaka to kā absolūtu naudas summu.</p>' },
                { question: 'Vai uzņēmumam var būt negatīvi apgrozāmie līdzekļi un tomēr būt veselīgam?', answer: '<p>Dažos biznesa modeļos (piemēram, abonēšanas biznesi, kas iekasē naudu iepriekš) negatīvi apgrozāmie līdzekļi var būt normāli.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Apgrozāmie Aktīvi', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Īstermiņa Saistības', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'working_capital', label: 'Apgrozāmie Līdzekļi', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-kapitalu-obrotowego',
            title: 'Kalkulator Kapitału Obrotowego',
            h1: 'Kalkulator Kapitału Obrotowego',
            meta_title: 'Kapitał Obrotowy | Krótkoterminowa Kondycja Finansowa',
            meta_description: 'Oblicz kapitał obrotowy z aktywów obrotowych i zobowiązań krótkoterminowych.',
            short_answer: 'Ten kalkulator odejmuje zobowiązania krótkoterminowe od aktywów obrotowych, aby uzyskać kapitał obrotowy — rzeczywistą kwotę pieniędzy, jaka pozostaje firmie na finansowanie bieżącej działalności.',
            intro_text: '<p>Kapitał obrotowy to pieniężny (złotowy) odpowiednik wskaźnika płynności bieżącej — zamiast wskaźnika daje rzeczywistą nadwyżkę (lub niedobór) zasobów krótkoterminowych nad długami krótkoterminowymi.</p><p><b>Właściciele firm i kredytodawcy</b> używają kapitału obrotowego do planowania codziennej działalności.</p>',
            key_points: [
                '<b>Wzór:</b> Kapitał Obrotowy = Aktywa Obrotowe − Zobowiązania Krótkoterminowe.',
                '<b>Dodatni vs ujemny:</b> dodatni kapitał obrotowy oznacza, że aktywa krótkoterminowe przewyższają długi krótkoterminowe; ujemny oznacza odwrotnie.',
                '<b>Obserwuj trend, nie tylko liczbę:</b> kurczący się kapitał obrotowy przez kilka okresów może być wczesnym sygnałem ostrzegawczym.',
            ],
            howto: [
                { question: 'Czym kapitał obrotowy różni się od wskaźnika płynności bieżącej?', answer: '<p>Wskaźnik płynności bieżącej wyraża tę samą relację jako wskaźnik; kapitał obrotowy wyraża ją jako bezwzględną kwotę pieniężną.</p>' },
                { question: 'Czy firma może mieć ujemny kapitał obrotowy i nadal być zdrowa?', answer: '<p>W niektórych modelach biznesowych (np. firmy subskrypcyjne pobierające pieniądze z góry) ujemny kapitał obrotowy może być normalny.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Aktywa Obrotowe', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Zobowiązania Krótkoterminowe', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'working_capital', label: 'Kapitał Obrotowy', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-capital-de-trabajo',
            title: 'Calculadora de Capital de Trabajo',
            h1: 'Calculadora de Capital de Trabajo',
            meta_title: 'Capital de Trabajo | Salud Financiera a Corto Plazo',
            meta_description: 'Calcula el capital de trabajo a partir del activo corriente y el pasivo corriente.',
            short_answer: 'Esta calculadora resta el pasivo corriente del activo corriente para darte el capital de trabajo — la cantidad real de dinero que le queda a un negocio para financiar sus operaciones diarias.',
            intro_text: '<p>El capital de trabajo es el equivalente monetario (en euros) del ratio de liquidez corriente — en lugar de un ratio, te da el excedente (o déficit) real de recursos a corto plazo sobre deudas a corto plazo.</p><p><b>Propietarios de negocios y prestamistas en España</b> usan el capital de trabajo para planificar las operaciones diarias.</p>',
            key_points: [
                '<b>Fórmula:</b> Capital de Trabajo = Activo Corriente − Pasivo Corriente.',
                '<b>Positivo vs negativo:</b> el capital de trabajo positivo significa que los activos a corto plazo superan las deudas a corto plazo; el negativo significa lo contrario.',
                '<b>Observa la tendencia, no solo el número:</b> un capital de trabajo que se reduce a lo largo de varios periodos puede ser una señal de alerta temprana.',
            ],
            howto: [
                { question: '¿En qué se diferencia del ratio de liquidez corriente?', answer: '<p>El ratio de liquidez corriente expresa la misma relación como ratio; el capital de trabajo la expresa como una cantidad monetaria absoluta.</p>' },
                { question: '¿Puede una empresa tener capital de trabajo negativo y aun así ser saludable?', answer: '<p>En algunos modelos de negocio (por ejemplo, empresas de suscripción que cobran por adelantado) el capital de trabajo negativo puede ser normal.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Activo Corriente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Pasivo Corriente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'working_capital', label: 'Capital de Trabajo', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-fonds-de-roulement',
            title: 'Calculateur de Fonds de Roulement',
            h1: 'Calculateur de Fonds de Roulement',
            meta_title: 'Fonds de Roulement | Santé Financière à Court Terme',
            meta_description: 'Calculez le fonds de roulement à partir de l’actif circulant et du passif circulant.',
            short_answer: 'Ce calculateur soustrait le passif circulant de l’actif circulant pour vous donner le fonds de roulement — le montant réel d’argent dont dispose une entreprise pour financer ses opérations quotidiennes.',
            intro_text: '<p>Le fonds de roulement est l’équivalent monétaire (en euros) du ratio de liquidité générale — au lieu d’un ratio, il donne l’excédent (ou le déficit) réel de ressources à court terme sur les dettes à court terme.</p><p><b>Les dirigeants d’entreprise et prêteurs en France</b> utilisent le fonds de roulement pour planifier les opérations quotidiennes.</p>',
            key_points: [
                '<b>Formule :</b> Fonds de Roulement = Actif Circulant − Passif Circulant.',
                '<b>Positif vs négatif :</b> un fonds de roulement positif signifie que les actifs à court terme dépassent les dettes à court terme ; négatif signifie l’inverse.',
                '<b>Surveillez la tendance, pas seulement le chiffre :</b> un fonds de roulement qui se réduit sur plusieurs périodes peut être un signal d’alerte précoce.',
            ],
            howto: [
                { question: 'En quoi le fonds de roulement diffère-t-il du ratio de liquidité générale ?', answer: '<p>Le ratio de liquidité générale exprime la même relation sous forme de ratio ; le fonds de roulement l’exprime sous forme de montant monétaire absolu.</p>' },
                { question: 'Une entreprise peut-elle avoir un fonds de roulement négatif et rester saine ?', answer: '<p>Dans certains modèles économiques (par ex. les entreprises par abonnement encaissant à l’avance), un fonds de roulement négatif peut être normal.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Actif Circulant', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Passif Circulant', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'working_capital', label: 'Fonds de Roulement', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-capitale-circolante',
            title: 'Calcolatore Capitale Circolante',
            h1: 'Calcolatore Capitale Circolante',
            meta_title: 'Capitale Circolante | Salute Finanziaria a Breve Termine',
            meta_description: 'Calcola il capitale circolante dall’attivo corrente e dal passivo corrente.',
            short_answer: 'Questo calcolatore sottrae il passivo corrente dall’attivo corrente per darti il capitale circolante — l’importo reale di denaro che rimane a un’azienda per finanziare le operazioni quotidiane.',
            intro_text: '<p>Il capitale circolante è l’equivalente monetario (in euro) dell’indice di liquidità corrente — invece di un indice, dà il surplus (o il deficit) reale di risorse a breve termine rispetto ai debiti a breve termine.</p><p><b>Imprenditori e finanziatori in Italia</b> usano il capitale circolante per pianificare le operazioni quotidiane.</p>',
            key_points: [
                '<b>Formula:</b> Capitale Circolante = Attivo Corrente − Passivo Corrente.',
                '<b>Positivo vs negativo:</b> un capitale circolante positivo significa che gli attivi a breve termine superano i debiti a breve termine; negativo significa il contrario.',
                '<b>Osserva la tendenza, non solo il numero:</b> un capitale circolante in diminuzione su più periodi può essere un segnale di allarme precoce.',
            ],
            howto: [
                { question: 'In cosa differisce dall’indice di liquidità corrente?', answer: '<p>L’indice di liquidità corrente esprime la stessa relazione come indice; il capitale circolante la esprime come importo monetario assoluto.</p>' },
                { question: 'Un’azienda può avere capitale circolante negativo ed essere comunque sana?', answer: '<p>In alcuni modelli di business (ad es. aziende in abbonamento che incassano in anticipo) un capitale circolante negativo può essere normale.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Attivo Corrente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Passivo Corrente', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'working_capital', label: 'Capitale Circolante', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'working-capital-rechner',
            title: 'Working-Capital-Rechner (Nettoumlaufvermögen)',
            h1: 'Working-Capital-Rechner (Nettoumlaufvermögen)',
            meta_title: 'Working Capital | Kurzfristige Finanzielle Gesundheit',
            meta_description: 'Berechnen Sie das Working Capital aus Umlaufvermögen und kurzfristigen Verbindlichkeiten.',
            short_answer: 'Dieser Rechner zieht die kurzfristigen Verbindlichkeiten vom Umlaufvermögen ab, um das Working Capital (Nettoumlaufvermögen) zu ermitteln — den tatsächlichen Geldbetrag, der einem Unternehmen zur Finanzierung des Tagesgeschäfts verbleibt.',
            intro_text: '<p>Working Capital ist das monetäre (Euro-)Gegenstück zur Current Ratio — statt einer Kennzahl liefert es den tatsächlichen Überschuss (oder das Defizit) kurzfristiger Ressourcen gegenüber kurzfristigen Schulden.</p><p><b>Unternehmer und Kreditgeber in Deutschland</b> nutzen das Working Capital zur Planung des Tagesgeschäfts.</p>',
            key_points: [
                '<b>Formel:</b> Working Capital = Umlaufvermögen − Kurzfristige Verbindlichkeiten.',
                '<b>Positiv vs. negativ:</b> positives Working Capital bedeutet, dass kurzfristige Vermögenswerte die kurzfristigen Schulden übersteigen; negativ bedeutet das Gegenteil.',
                '<b>Achten Sie auf den Trend, nicht nur die Zahl:</b> ein schrumpfendes Working Capital über mehrere Perioden kann ein frühes Warnsignal sein.',
            ],
            howto: [
                { question: 'Wie unterscheidet sich Working Capital von der Current Ratio?', answer: '<p>Die Current Ratio drückt dieselbe Beziehung als Kennzahl aus; das Working Capital drückt sie als absoluten Geldbetrag aus.</p>' },
                { question: 'Kann ein Unternehmen negatives Working Capital haben und trotzdem gesund sein?', answer: '<p>In manchen Geschäftsmodellen (z.B. Abo-Unternehmen, die im Voraus kassieren) kann negatives Working Capital normal sein.</p>' },
            ],
            inputs: [
                { name: 'current_assets', label: 'Umlaufvermögen', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'current_liabilities', label: 'Kurzfristige Verbindlichkeiten', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '75000' },
            ],
            outputs: [
                { name: 'working_capital', label: 'Working Capital', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1064: Inventory Turnover Ratio Calculator
// ============================================================
const inventoryTurnover: ToolDef = {
    id: '1064',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'cogs', default: 600000 },
            { key: 'average_inventory', default: 100000 },
        ],
        formulas: {
            turnover: 'cogs/average_inventory',
            days_to_sell: '365/(cogs/average_inventory)',
        },
        outputs: [
            { key: 'turnover', precision: 2 },
            { key: 'days_to_sell', precision: 1 },
        ],
    },
    locales: {
        en: {
            slug: 'inventory-turnover-ratio-calculator',
            title: 'Inventory Turnover Ratio Calculator',
            h1: 'Inventory Turnover Ratio Calculator',
            meta_title: 'Inventory Turnover Calculator | How Fast Stock Sells',
            meta_description: 'Calculate inventory turnover ratio and days-to-sell from cost of goods sold and average inventory — a key efficiency measure for retail and manufacturing.',
            short_answer: 'This calculator divides cost of goods sold by average inventory to give you the inventory turnover ratio — how many times a company sells through its entire inventory in a period — plus the equivalent average days to sell.',
            intro_text: '<p>Inventory turnover measures how efficiently a company manages its stock. A higher turnover generally means products are selling quickly and less cash is tied up sitting on shelves; a lower turnover can signal overstocking, weak demand, or obsolete inventory.</p><p><b>Retailers, wholesalers, and manufacturers</b> track this ratio closely since inventory often represents one of the largest uses of working capital.</p>',
            key_points: [
                '<b>Formula:</b> Inventory Turnover = Cost of Goods Sold ÷ Average Inventory; Days to Sell = 365 ÷ Turnover.',
                '<b>Average inventory</b> is typically (beginning inventory + ending inventory) ÷ 2, which smooths out seasonal swings compared to using a single point-in-time balance.',
                '<b>Benchmarks vary hugely by industry:</b> grocery stores may turn inventory over 15-20+ times a year, while heavy machinery manufacturers might turn it over just 3-5 times — always compare within the same sector.',
            ],
            howto: [
                { question: 'What counts as "cost of goods sold" (COGS)?', answer: '<p>COGS is the direct cost of producing or acquiring the goods sold during the period (materials, direct labor, manufacturing overhead) — found on the income statement, above gross profit.</p>' },
                { question: 'Is a very high inventory turnover always good?', answer: '<p>Not necessarily — extremely high turnover can mean a company is understocked and losing sales to stockouts. The right level depends on balancing carrying costs against the risk of running out of stock.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Cost of Goods Sold (COGS)', type: 'number', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Average Inventory', type: 'number', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Inventory Turnover Ratio', unit: 'x/year', precision: 2 },
                { name: 'days_to_sell', label: 'Average Days to Sell Inventory', unit: 'days', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-oborachivaemosti-zapasov',
            title: 'Калькулятор оборачиваемости запасов',
            h1: 'Калькулятор оборачиваемости запасов',
            meta_title: 'Оборачиваемость запасов | Как быстро продаются товары',
            meta_description: 'Рассчитайте коэффициент оборачиваемости запасов и срок реализации из себестоимости и среднего остатка запасов.',
            short_answer: 'Этот калькулятор делит себестоимость продаж на средний остаток запасов, чтобы получить коэффициент оборачиваемости — сколько раз компания продаёт весь свой запас за период — плюс эквивалентное среднее число дней на продажу.',
            intro_text: '<p>Оборачиваемость запасов измеряет, насколько эффективно компания управляет своими запасами. Более высокая оборачиваемость обычно означает, что товары продаются быстро.</p><p><b>Розничные продавцы, оптовики и производители</b> внимательно следят за этим коэффициентом, так как запасы часто представляют одно из крупнейших использований оборотного капитала.</p>',
            key_points: [
                '<b>Формула:</b> Оборачиваемость запасов = Себестоимость ÷ Средний остаток запасов; Дни на продажу = 365 ÷ Оборачиваемость.',
                '<b>Средний остаток запасов</b> обычно рассчитывается как (начальный + конечный остаток) ÷ 2.',
                '<b>Эталоны сильно различаются по отраслям:</b> продуктовые магазины могут оборачивать запасы 15-20+ раз в год, тогда как производители тяжёлого оборудования — всего 3-5 раз.',
            ],
            howto: [
                { question: 'Что считается "себестоимостью продаж" (COGS)?', answer: '<p>COGS — прямые затраты на производство или приобретение проданных товаров за период (материалы, прямой труд, производственные накладные расходы).</p>' },
                { question: 'Всегда ли очень высокая оборачиваемость запасов — это хорошо?', answer: '<p>Не обязательно — чрезмерно высокая оборачиваемость может означать, что у компании недостаточно запасов и она теряет продажи из-за дефицита товара.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Себестоимость продаж (COGS)', type: 'number', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Средний остаток запасов', type: 'number', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Коэффициент оборачиваемости запасов', unit: 'раз/год', precision: 2 },
                { name: 'days_to_sell', label: 'Среднее число дней на продажу запасов', unit: 'дней', precision: 1 },
            ],
        },
        lv: {
            slug: 'krajumu-apgrozijuma-kalkulators',
            title: 'Krājumu Apgrozījuma Kalkulators',
            h1: 'Krājumu Apgrozījuma Kalkulators',
            meta_title: 'Krājumu Apgrozījums | Cik Ātri Pārdodas Krājumi',
            meta_description: 'Aprēķiniet krājumu apgrozījuma koeficientu un pārdošanas dienu skaitu no pārdoto preču pašizmaksas un vidējiem krājumiem.',
            short_answer: 'Šis kalkulators dala pārdoto preču pašizmaksu ar vidējiem krājumiem, lai iegūtu krājumu apgrozījuma koeficientu — cik reizes uzņēmums pārdod visus savus krājumus periodā — plus ekvivalentu vidējo dienu skaitu pārdošanai.',
            intro_text: '<p>Krājumu apgrozījums mēra, cik efektīvi uzņēmums pārvalda savus krājumus. Augstāks apgrozījums parasti nozīmē, ka produkti tiek pārdoti ātri.</p><p><b>Mazumtirgotāji, vairumtirgotāji un ražotāji</b> rūpīgi seko šim koeficientam.</p>',
            key_points: [
                '<b>Formula:</b> Krājumu Apgrozījums = Pašizmaksa ÷ Vidējie Krājumi; Pārdošanas Dienas = 365 ÷ Apgrozījums.',
                '<b>Vidējie krājumi</b> parasti ir (sākuma krājumi + beigu krājumi) ÷ 2.',
                '<b>Etaloni ļoti atšķiras pēc nozares:</b> pārtikas veikali var apgrozīt krājumus 15-20+ reizes gadā, kamēr smago iekārtu ražotāji — tikai 3-5 reizes.',
            ],
            howto: [
                { question: 'Kas tiek uzskatīts par "pārdoto preču pašizmaksu" (COGS)?', answer: '<p>COGS ir tiešās izmaksas pārdoto preču ražošanai vai iegādei periodā (materiāli, tiešais darbaspēks, ražošanas pieskaitāmās izmaksas).</p>' },
                { question: 'Vai ļoti augsts krājumu apgrozījums vienmēr ir labi?', answer: '<p>Ne vienmēr — pārmērīgi augsts apgrozījums var nozīmēt, ka uzņēmumam ir nepietiekami krājumi un tas zaudē pārdošanu no preču trūkuma.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Pārdoto Preču Pašizmaksa (COGS)', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Vidējie Krājumi', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Krājumu Apgrozījuma Koeficients', unit: 'reizes/gadā', precision: 2 },
                { name: 'days_to_sell', label: 'Vidējais Dienu Skaits Pārdošanai', unit: 'dienas', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-rotacji-zapasow',
            title: 'Kalkulator Rotacji Zapasów',
            h1: 'Kalkulator Rotacji Zapasów',
            meta_title: 'Rotacja Zapasów | Jak Szybko Sprzedaje się Towar',
            meta_description: 'Oblicz wskaźnik rotacji zapasów i dni sprzedaży z kosztu własnego sprzedaży i średnich zapasów.',
            short_answer: 'Ten kalkulator dzieli koszt własny sprzedaży przez średnie zapasy, aby uzyskać wskaźnik rotacji zapasów — ile razy firma sprzedaje cały swój zapas w danym okresie — plus równoważną średnią liczbę dni na sprzedaż.',
            intro_text: '<p>Rotacja zapasów mierzy, jak efektywnie firma zarządza swoimi zapasami. Wyższa rotacja zwykle oznacza, że produkty sprzedają się szybko.</p><p><b>Sprzedawcy detaliczni, hurtownicy i producenci</b> uważnie śledzą ten wskaźnik.</p>',
            key_points: [
                '<b>Wzór:</b> Rotacja Zapasów = Koszt Własny Sprzedaży ÷ Średnie Zapasy; Dni Sprzedaży = 365 ÷ Rotacja.',
                '<b>Średnie zapasy</b> to zwykle (zapasy początkowe + zapasy końcowe) ÷ 2.',
                '<b>Wzorce mocno różnią się w zależności od branży:</b> sklepy spożywcze mogą obracać zapasami 15-20+ razy w roku, podczas gdy producenci ciężkich maszyn tylko 3-5 razy.',
            ],
            howto: [
                { question: 'Co liczy się jako "koszt własny sprzedaży" (COGS)?', answer: '<p>COGS to bezpośredni koszt produkcji lub nabycia sprzedanych towarów w danym okresie (materiały, bezpośrednia praca, koszty ogólne produkcji).</p>' },
                { question: 'Czy bardzo wysoka rotacja zapasów zawsze jest dobra?', answer: '<p>Niekoniecznie — ekstremalnie wysoka rotacja może oznaczać, że firma ma zbyt małe zapasy i traci sprzedaż z powodu braków towarowych.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Koszt Własny Sprzedaży (COGS)', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Średnie Zapasy', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Wskaźnik Rotacji Zapasów', unit: 'razy/rok', precision: 2 },
                { name: 'days_to_sell', label: 'Średnia Liczba Dni na Sprzedaż', unit: 'dni', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-de-rotacion-de-inventario',
            title: 'Calculadora de Rotación de Inventario',
            h1: 'Calculadora de Rotación de Inventario',
            meta_title: 'Rotación de Inventario | Qué Tan Rápido se Vende el Stock',
            meta_description: 'Calcula la rotación de inventario y los días para vender a partir del coste de ventas y el inventario medio.',
            short_answer: 'Esta calculadora divide el coste de ventas entre el inventario medio para darte la rotación de inventario — cuántas veces una empresa vende todo su inventario en un periodo — más el equivalente en días promedio para vender.',
            intro_text: '<p>La rotación de inventario mide cuán eficientemente una empresa gestiona su stock. Una rotación más alta generalmente significa que los productos se venden rápido.</p><p><b>Los minoristas, mayoristas y fabricantes en España</b> siguen de cerca este ratio.</p>',
            key_points: [
                '<b>Fórmula:</b> Rotación de Inventario = Coste de Ventas ÷ Inventario Medio; Días para Vender = 365 ÷ Rotación.',
                '<b>El inventario medio</b> suele ser (inventario inicial + inventario final) ÷ 2.',
                '<b>Los puntos de referencia varían enormemente por sector:</b> los supermercados pueden rotar el inventario 15-20+ veces al año, mientras que los fabricantes de maquinaria pesada solo 3-5 veces.',
            ],
            howto: [
                { question: '¿Qué cuenta como "coste de ventas" (COGS)?', answer: '<p>El coste de ventas es el coste directo de producir o adquirir los bienes vendidos durante el periodo (materiales, mano de obra directa, gastos generales de fabricación).</p>' },
                { question: '¿Una rotación de inventario muy alta siempre es buena?', answer: '<p>No necesariamente — una rotación extremadamente alta puede significar que la empresa tiene poco stock y pierde ventas por falta de existencias.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Coste de Ventas (COGS)', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Inventario Medio', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Rotación de Inventario', unit: 'veces/año', precision: 2 },
                { name: 'days_to_sell', label: 'Días Promedio para Vender', unit: 'días', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-de-rotation-des-stocks',
            title: 'Calculateur de Rotation des Stocks',
            h1: 'Calculateur de Rotation des Stocks',
            meta_title: 'Rotation des Stocks | Vitesse de Vente du Stock',
            meta_description: 'Calculez la rotation des stocks et les jours de vente à partir du coût des ventes et du stock moyen.',
            short_answer: 'Ce calculateur divise le coût des ventes par le stock moyen pour vous donner la rotation des stocks — combien de fois une entreprise vend l’intégralité de son stock sur une période — plus l’équivalent en jours moyens de vente.',
            intro_text: '<p>La rotation des stocks mesure l’efficacité avec laquelle une entreprise gère son stock. Une rotation plus élevée signifie généralement que les produits se vendent rapidement.</p><p><b>Les détaillants, grossistes et fabricants en France</b> suivent de près ce ratio.</p>',
            key_points: [
                '<b>Formule :</b> Rotation des Stocks = Coût des Ventes ÷ Stock Moyen ; Jours de Vente = 365 ÷ Rotation.',
                '<b>Le stock moyen</b> est généralement (stock initial + stock final) ÷ 2.',
                '<b>Les références varient énormément selon le secteur :</b> les épiceries peuvent faire tourner leur stock 15-20+ fois par an, tandis que les fabricants de machines lourdes seulement 3-5 fois.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte comme « coût des ventes » (COGS) ?', answer: '<p>Le coût des ventes est le coût direct de production ou d’acquisition des biens vendus pendant la période (matériaux, main-d’œuvre directe, frais généraux de fabrication).</p>' },
                { question: 'Une rotation des stocks très élevée est-elle toujours bonne ?', answer: '<p>Pas nécessairement — une rotation extrêmement élevée peut signifier que l’entreprise est en sous-stock et perd des ventes en raison de ruptures de stock.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Coût des Ventes (COGS)', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Stock Moyen', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Rotation des Stocks', unit: 'fois/an', precision: 2 },
                { name: 'days_to_sell', label: 'Jours Moyens de Vente', unit: 'jours', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-rotazione-di-magazzino',
            title: 'Calcolatore Rotazione di Magazzino',
            h1: 'Calcolatore Rotazione di Magazzino',
            meta_title: 'Rotazione di Magazzino | Quanto Velocemente si Vende lo Stock',
            meta_description: 'Calcola la rotazione di magazzino e i giorni di vendita dal costo del venduto e dalle scorte medie.',
            short_answer: 'Questo calcolatore divide il costo del venduto per le scorte medie per darti la rotazione di magazzino — quante volte un’azienda vende l’intero magazzino in un periodo — più l’equivalente in giorni medi di vendita.',
            intro_text: '<p>La rotazione di magazzino misura quanto efficientemente un’azienda gestisce le proprie scorte. Una rotazione più alta generalmente significa che i prodotti si vendono rapidamente.</p><p><b>Rivenditori, grossisti e produttori in Italia</b> monitorano attentamente questo indice.</p>',
            key_points: [
                '<b>Formula:</b> Rotazione di Magazzino = Costo del Venduto ÷ Scorte Medie; Giorni di Vendita = 365 ÷ Rotazione.',
                '<b>Le scorte medie</b> sono tipicamente (scorte iniziali + scorte finali) ÷ 2.',
                '<b>I benchmark variano enormemente per settore:</b> i supermercati possono ruotare le scorte 15-20+ volte all’anno, mentre i produttori di macchinari pesanti solo 3-5 volte.',
            ],
            howto: [
                { question: 'Cosa conta come "costo del venduto" (COGS)?', answer: '<p>Il costo del venduto è il costo diretto di produzione o acquisizione dei beni venduti durante il periodo (materiali, manodopera diretta, spese generali di produzione).</p>' },
                { question: 'Una rotazione di magazzino molto alta è sempre positiva?', answer: '<p>Non necessariamente — una rotazione estremamente alta può significare che l’azienda è sotto-scorta e perde vendite per mancanza di prodotto.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Costo del Venduto (COGS)', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Scorte Medie', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Rotazione di Magazzino', unit: 'volte/anno', precision: 2 },
                { name: 'days_to_sell', label: 'Giorni Medi di Vendita', unit: 'giorni', precision: 1 },
            ],
        },
        de: {
            slug: 'lagerumschlag-rechner',
            title: 'Lagerumschlag-Rechner',
            h1: 'Lagerumschlag-Rechner',
            meta_title: 'Lagerumschlag | Wie Schnell sich Bestände Verkaufen',
            meta_description: 'Berechnen Sie den Lagerumschlag und die Verkaufstage aus den Herstellungskosten und dem durchschnittlichen Lagerbestand.',
            short_answer: 'Dieser Rechner teilt die Herstellungskosten des Umsatzes durch den durchschnittlichen Lagerbestand, um den Lagerumschlag zu ermitteln — wie oft ein Unternehmen seinen gesamten Lagerbestand in einem Zeitraum verkauft — plus die entsprechenden durchschnittlichen Verkaufstage.',
            intro_text: '<p>Der Lagerumschlag misst, wie effizient ein Unternehmen seinen Bestand verwaltet. Ein höherer Umschlag bedeutet in der Regel, dass sich Produkte schnell verkaufen.</p><p><b>Einzelhändler, Großhändler und Hersteller in Deutschland</b> verfolgen diese Kennzahl genau.</p>',
            key_points: [
                '<b>Formel:</b> Lagerumschlag = Herstellungskosten des Umsatzes ÷ Durchschnittlicher Lagerbestand; Verkaufstage = 365 ÷ Umschlag.',
                '<b>Durchschnittlicher Lagerbestand</b> ist typischerweise (Anfangsbestand + Endbestand) ÷ 2.',
                '<b>Benchmarks variieren stark je nach Branche:</b> Lebensmittelgeschäfte können ihren Bestand 15-20+ mal im Jahr umschlagen, während Hersteller von Schwermaschinen nur 3-5 mal.',
            ],
            howto: [
                { question: 'Was zählt als "Herstellungskosten des Umsatzes" (COGS)?', answer: '<p>COGS sind die direkten Kosten für die Herstellung oder den Erwerb der im Zeitraum verkauften Waren (Material, direkte Arbeit, Herstellungsgemeinkosten).</p>' },
                { question: 'Ist ein sehr hoher Lagerumschlag immer gut?', answer: '<p>Nicht unbedingt — ein extrem hoher Umschlag kann bedeuten, dass ein Unternehmen unterbestockt ist und Verkäufe durch Fehlbestände verliert.</p>' },
            ],
            inputs: [
                { name: 'cogs', label: 'Herstellungskosten des Umsatzes (COGS)', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '600000' },
                { name: 'average_inventory', label: 'Durchschnittlicher Lagerbestand', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '100000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Lagerumschlag', unit: 'x/Jahr', precision: 2 },
                { name: 'days_to_sell', label: 'Durchschnittliche Verkaufstage', unit: 'Tage', precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1065: Accounts Receivable Turnover Calculator
// ============================================================
const arTurnover: ToolDef = {
    id: '1065',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'net_credit_sales', default: 1200000 },
            { key: 'average_ar', default: 150000 },
        ],
        formulas: {
            turnover: 'net_credit_sales/average_ar',
        },
        outputs: [
            { key: 'turnover', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'accounts-receivable-turnover-calculator',
            title: 'Accounts Receivable Turnover Calculator',
            h1: 'Accounts Receivable Turnover Calculator',
            meta_title: 'AR Turnover Calculator | How Fast Customers Pay',
            meta_description: 'Calculate accounts receivable turnover from net credit sales and average accounts receivable — a key measure of how efficiently a company collects money owed by customers.',
            short_answer: 'This calculator divides net credit sales by average accounts receivable to give you the AR turnover ratio — how many times a company collects its average receivables balance in a period.',
            intro_text: '<p>Accounts receivable turnover measures how efficiently a company converts credit sales into cash. A higher turnover generally means customers pay quickly and collections are effective; a lower turnover can signal collection problems or overly generous credit terms.</p><p><b>Finance teams and analysts</b> use this ratio to assess credit policy effectiveness and predict cash flow timing.</p>',
            key_points: [
                '<b>Formula:</b> AR Turnover = Net Credit Sales ÷ Average Accounts Receivable.',
                '<b>Average AR</b> is typically (beginning receivables + ending receivables) ÷ 2, smoothing out fluctuations across the period.',
                '<b>Pair with Days Sales Outstanding (DSO):</b> turnover tells you "how many times," while DSO (365 ÷ turnover) tells you the average number of days it takes to collect — both views are useful together.',
            ],
            howto: [
                { question: 'Why "net credit sales" and not total revenue?', answer: '<p>Cash sales are collected immediately and don\'t belong in a receivables collection metric — only sales made on credit (invoiced, to be paid later) create the receivables balance this ratio is measuring.</p>' },
                { question: 'Is a higher AR turnover always better?', answer: '<p>Generally yes for cash flow, but an extremely high turnover combined with declining sales could mean credit terms are too strict, potentially costing the business sales to competitors offering more flexible terms.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Net Credit Sales', type: 'number', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Average Accounts Receivable', type: 'number', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'AR Turnover Ratio', unit: 'x/year', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-oborachivaemosti-debitorskoy-zadolzhennosti',
            title: 'Калькулятор оборачиваемости дебиторской задолженности',
            h1: 'Калькулятор оборачиваемости дебиторской задолженности',
            meta_title: 'Оборачиваемость дебиторки | Как быстро платят клиенты',
            meta_description: 'Рассчитайте оборачиваемость дебиторской задолженности из чистых продаж в кредит и среднего остатка дебиторки.',
            short_answer: 'Этот калькулятор делит чистые продажи в кредит на средний остаток дебиторской задолженности, чтобы получить коэффициент оборачиваемости — сколько раз компания собирает свой средний остаток дебиторки за период.',
            intro_text: '<p>Оборачиваемость дебиторской задолженности измеряет, насколько эффективно компания превращает продажи в кредит в денежные средства.</p><p><b>Финансовые команды и аналитики</b> используют этот коэффициент для оценки эффективности кредитной политики.</p>',
            key_points: [
                '<b>Формула:</b> Оборачиваемость ДЗ = Чистые продажи в кредит ÷ Средняя дебиторская задолженность.',
                '<b>Средняя ДЗ</b> обычно рассчитывается как (начальный + конечный остаток) ÷ 2.',
                '<b>Сочетайте с DSO (срок оборота дебиторки):</b> оборачиваемость показывает "сколько раз", а DSO (365 ÷ оборачиваемость) — среднее число дней на сбор.',
            ],
            howto: [
                { question: 'Почему "чистые продажи в кредит", а не общая выручка?', answer: '<p>Продажи за наличные собираются немедленно и не относятся к показателю сбора дебиторки — только продажи в кредит создают остаток дебиторки.</p>' },
                { question: 'Всегда ли более высокая оборачиваемость лучше?', answer: '<p>В целом да для денежного потока, но чрезмерно высокая оборачиваемость в сочетании со снижением продаж может означать слишком строгие условия кредита.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Чистые продажи в кредит', type: 'number', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Средняя дебиторская задолженность', type: 'number', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Коэффициент оборачиваемости ДЗ', unit: 'раз/год', precision: 2 },
            ],
        },
        lv: {
            slug: 'debitoru-parada-apgrozijuma-kalkulators',
            title: 'Debitoru Parāda Apgrozījuma Kalkulators',
            h1: 'Debitoru Parāda Apgrozījuma Kalkulators',
            meta_title: 'Debitoru Apgrozījums | Cik Ātri Maksā Klienti',
            meta_description: 'Aprēķiniet debitoru parāda apgrozījumu no neto kredīta pārdošanas un vidējā debitoru parāda.',
            short_answer: 'Šis kalkulators dala neto kredīta pārdošanu ar vidējo debitoru parādu, lai iegūtu apgrozījuma koeficientu — cik reizes uzņēmums iekasē savu vidējo debitoru atlikumu periodā.',
            intro_text: '<p>Debitoru parāda apgrozījums mēra, cik efektīvi uzņēmums pārvērš kredīta pārdošanu naudā.</p><p><b>Finanšu komandas un analītiķi</b> izmanto šo koeficientu, lai novērtētu kredītpolitikas efektivitāti.</p>',
            key_points: [
                '<b>Formula:</b> Debitoru Apgrozījums = Neto Kredīta Pārdošana ÷ Vidējais Debitoru Parāds.',
                '<b>Vidējais debitoru parāds</b> parasti ir (sākuma + beigu atlikums) ÷ 2.',
                '<b>Apvienojiet ar DSO:</b> apgrozījums parāda "cik reizes", bet DSO (365 ÷ apgrozījums) parāda vidējo dienu skaitu iekasēšanai.',
            ],
            howto: [
                { question: 'Kāpēc "neto kredīta pārdošana", nevis kopējie ieņēmumi?', answer: '<p>Skaidras naudas pārdošana tiek iekasēta uzreiz un nepieder pie debitoru iekasēšanas rādītāja — tikai kredīta pārdošana rada debitoru atlikumu.</p>' },
                { question: 'Vai augstāks debitoru apgrozījums vienmēr ir labāks?', answer: '<p>Kopumā jā naudas plūsmai, bet pārmērīgi augsts apgrozījums kopā ar samazinošos pārdošanu var nozīmēt pārāk stingrus kredīta noteikumus.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Neto Kredīta Pārdošana', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Vidējais Debitoru Parāds', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Debitoru Apgrozījuma Koeficients', unit: 'reizes/gadā', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-rotacji-naleznosci',
            title: 'Kalkulator Rotacji Należności',
            h1: 'Kalkulator Rotacji Należności',
            meta_title: 'Rotacja Należności | Jak Szybko Płacą Klienci',
            meta_description: 'Oblicz rotację należności ze sprzedaży kredytowej netto i średnich należności.',
            short_answer: 'Ten kalkulator dzieli sprzedaż kredytową netto przez średnie należności, aby uzyskać wskaźnik rotacji należności — ile razy firma odzyskuje swoje średnie saldo należności w okresie.',
            intro_text: '<p>Rotacja należności mierzy, jak efektywnie firma zamienia sprzedaż kredytową na gotówkę.</p><p><b>Zespoły finansowe i analitycy</b> używają tego wskaźnika do oceny efektywności polityki kredytowej.</p>',
            key_points: [
                '<b>Wzór:</b> Rotacja Należności = Sprzedaż Kredytowa Netto ÷ Średnie Należności.',
                '<b>Średnie należności</b> to zwykle (saldo początkowe + saldo końcowe) ÷ 2.',
                '<b>Połącz z DSO:</b> rotacja pokazuje "ile razy", a DSO (365 ÷ rotacja) pokazuje średnią liczbę dni na odzyskanie.',
            ],
            howto: [
                { question: 'Dlaczego "sprzedaż kredytowa netto", a nie całkowity przychód?', answer: '<p>Sprzedaż gotówkowa jest odzyskiwana natychmiast i nie należy do wskaźnika odzyskiwania należności — tylko sprzedaż kredytowa tworzy saldo należności.</p>' },
                { question: 'Czy wyższa rotacja należności zawsze jest lepsza?', answer: '<p>Ogólnie tak dla przepływów pieniężnych, ale nadmiernie wysoka rotacja połączona ze spadającą sprzedażą może oznaczać zbyt surowe warunki kredytowe.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Sprzedaż Kredytowa Netto', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Średnie Należności', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Wskaźnik Rotacji Należności', unit: 'razy/rok', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-rotacion-de-cuentas-por-cobrar',
            title: 'Calculadora de Rotación de Cuentas por Cobrar',
            h1: 'Calculadora de Rotación de Cuentas por Cobrar',
            meta_title: 'Rotación de Cuentas por Cobrar | Qué Tan Rápido Pagan los Clientes',
            meta_description: 'Calcula la rotación de cuentas por cobrar a partir de las ventas netas a crédito y las cuentas por cobrar medias.',
            short_answer: 'Esta calculadora divide las ventas netas a crédito entre las cuentas por cobrar medias para darte el ratio de rotación — cuántas veces una empresa cobra su saldo medio de cuentas por cobrar en un periodo.',
            intro_text: '<p>La rotación de cuentas por cobrar mide cuán eficientemente una empresa convierte las ventas a crédito en efectivo.</p><p><b>Los equipos financieros y analistas en España</b> usan este ratio para evaluar la eficacia de la política de crédito.</p>',
            key_points: [
                '<b>Fórmula:</b> Rotación de CxC = Ventas Netas a Crédito ÷ Cuentas por Cobrar Medias.',
                '<b>Las cuentas por cobrar medias</b> suelen ser (saldo inicial + saldo final) ÷ 2.',
                '<b>Combina con DSO:</b> la rotación indica "cuántas veces", mientras que el DSO (365 ÷ rotación) indica el número medio de días para cobrar.',
            ],
            howto: [
                { question: '¿Por qué "ventas netas a crédito" y no los ingresos totales?', answer: '<p>Las ventas al contado se cobran de inmediato y no pertenecen a una métrica de cobro de cuentas por cobrar — solo las ventas a crédito crean el saldo que este ratio mide.</p>' },
                { question: '¿Una rotación de CxC más alta siempre es mejor?', answer: '<p>Generalmente sí para el flujo de caja, pero una rotación extremadamente alta combinada con ventas decrecientes podría indicar condiciones de crédito demasiado estrictas.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Ventas Netas a Crédito', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Cuentas por Cobrar Medias', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Ratio de Rotación de CxC', unit: 'veces/año', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-rotation-des-creances',
            title: 'Calculateur de Rotation des Créances Clients',
            h1: 'Calculateur de Rotation des Créances Clients',
            meta_title: 'Rotation des Créances | Vitesse de Paiement des Clients',
            meta_description: 'Calculez la rotation des créances clients à partir des ventes nettes à crédit et des créances moyennes.',
            short_answer: 'Ce calculateur divise les ventes nettes à crédit par les créances moyennes pour vous donner le ratio de rotation des créances — combien de fois une entreprise recouvre son solde moyen de créances sur une période.',
            intro_text: '<p>La rotation des créances mesure l’efficacité avec laquelle une entreprise convertit les ventes à crédit en liquidités.</p><p><b>Les équipes financières et analystes en France</b> utilisent ce ratio pour évaluer l’efficacité de la politique de crédit.</p>',
            key_points: [
                '<b>Formule :</b> Rotation des Créances = Ventes Nettes à Crédit ÷ Créances Moyennes.',
                '<b>Les créances moyennes</b> sont généralement (solde initial + solde final) ÷ 2.',
                '<b>Associez au DSO :</b> la rotation indique « combien de fois », tandis que le DSO (365 ÷ rotation) indique le nombre moyen de jours pour recouvrer.',
            ],
            howto: [
                { question: 'Pourquoi « ventes nettes à crédit » et non le chiffre d’affaires total ?', answer: '<p>Les ventes au comptant sont encaissées immédiatement et n’appartiennent pas à une métrique de recouvrement des créances — seules les ventes à crédit créent le solde de créances mesuré.</p>' },
                { question: 'Une rotation des créances plus élevée est-elle toujours meilleure ?', answer: '<p>Généralement oui pour la trésorerie, mais une rotation extrêmement élevée combinée à des ventes en baisse pourrait signifier des conditions de crédit trop strictes.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Ventes Nettes à Crédit', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Créances Moyennes', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Ratio de Rotation des Créances', unit: 'fois/an', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-rotazione-crediti',
            title: 'Calcolatore Rotazione Crediti',
            h1: 'Calcolatore Rotazione Crediti',
            meta_title: 'Rotazione Crediti | Quanto Velocemente Pagano i Clienti',
            meta_description: 'Calcola la rotazione dei crediti dalle vendite nette a credito e dai crediti medi.',
            short_answer: 'Questo calcolatore divide le vendite nette a credito per i crediti medi per darti il rapporto di rotazione dei crediti — quante volte un’azienda incassa il proprio saldo medio di crediti in un periodo.',
            intro_text: '<p>La rotazione dei crediti misura quanto efficientemente un’azienda converte le vendite a credito in contanti.</p><p><b>I team finanziari e gli analisti in Italia</b> usano questo indice per valutare l’efficacia della politica di credito.</p>',
            key_points: [
                '<b>Formula:</b> Rotazione Crediti = Vendite Nette a Credito ÷ Crediti Medi.',
                '<b>I crediti medi</b> sono tipicamente (saldo iniziale + saldo finale) ÷ 2.',
                '<b>Abbina al DSO:</b> la rotazione indica "quante volte", mentre il DSO (365 ÷ rotazione) indica il numero medio di giorni per l’incasso.',
            ],
            howto: [
                { question: 'Perché "vendite nette a credito" e non i ricavi totali?', answer: '<p>Le vendite in contanti vengono incassate immediatamente e non appartengono a un indice di incasso crediti — solo le vendite a credito creano il saldo crediti misurato.</p>' },
                { question: 'Una rotazione dei crediti più alta è sempre migliore?', answer: '<p>Generalmente sì per il flusso di cassa, ma una rotazione estremamente alta combinata con vendite in calo potrebbe significare condizioni di credito troppo rigide.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Vendite Nette a Credito', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Crediti Medi', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Rapporto di Rotazione Crediti', unit: 'volte/anno', precision: 2 },
            ],
        },
        de: {
            slug: 'debitorenumschlag-rechner',
            title: 'Debitorenumschlag-Rechner',
            h1: 'Debitorenumschlag-Rechner',
            meta_title: 'Debitorenumschlag | Wie Schnell Kunden Zahlen',
            meta_description: 'Berechnen Sie den Debitorenumschlag aus Netto-Kreditverkäufen und durchschnittlichen Forderungen.',
            short_answer: 'Dieser Rechner teilt die Netto-Kreditverkäufe durch die durchschnittlichen Forderungen, um den Debitorenumschlag zu ermitteln — wie oft ein Unternehmen seinen durchschnittlichen Forderungsbestand in einem Zeitraum einzieht.',
            intro_text: '<p>Der Debitorenumschlag misst, wie effizient ein Unternehmen Kreditverkäufe in Bargeld umwandelt.</p><p><b>Finanzteams und Analysten in Deutschland</b> nutzen diese Kennzahl, um die Effektivität der Kreditpolitik zu beurteilen.</p>',
            key_points: [
                '<b>Formel:</b> Debitorenumschlag = Netto-Kreditverkäufe ÷ Durchschnittliche Forderungen.',
                '<b>Durchschnittliche Forderungen</b> sind typischerweise (Anfangsbestand + Endbestand) ÷ 2.',
                '<b>Kombinieren Sie mit DSO:</b> der Umschlag zeigt "wie oft", während DSO (365 ÷ Umschlag) die durchschnittliche Anzahl der Tage bis zum Inkasso zeigt.',
            ],
            howto: [
                { question: 'Warum "Netto-Kreditverkäufe" und nicht der Gesamtumsatz?', answer: '<p>Barverkäufe werden sofort eingezogen und gehören nicht zu einer Forderungseinzugskennzahl — nur Kreditverkäufe erzeugen den gemessenen Forderungsbestand.</p>' },
                { question: 'Ist ein höherer Debitorenumschlag immer besser?', answer: '<p>Für den Cashflow im Allgemeinen ja, aber ein extrem hoher Umschlag in Kombination mit sinkenden Verkäufen könnte zu strenge Kreditbedingungen bedeuten.</p>' },
            ],
            inputs: [
                { name: 'net_credit_sales', label: 'Netto-Kreditverkäufe', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '1200000' },
                { name: 'average_ar', label: 'Durchschnittliche Forderungen', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '150000' },
            ],
            outputs: [
                { name: 'turnover', label: 'Debitorenumschlag', unit: 'x/Jahr', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1066: Days Sales Outstanding (DSO) Calculator
// ============================================================
const dso: ToolDef = {
    id: '1066',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'accounts_receivable', default: 150000 },
            { key: 'net_credit_sales', default: 1200000 },
        ],
        formulas: {
            dso_days: '(accounts_receivable/net_credit_sales)*365',
        },
        outputs: [
            { key: 'dso_days', precision: 1 },
        ],
    },
    locales: {
        en: {
            slug: 'days-sales-outstanding-dso-calculator',
            title: 'Days Sales Outstanding (DSO) Calculator',
            h1: 'Days Sales Outstanding (DSO) Calculator',
            meta_title: 'DSO Calculator | Average Collection Period',
            meta_description: 'Calculate Days Sales Outstanding (DSO) from accounts receivable and net credit sales — the average number of days it takes to collect payment after a sale.',
            short_answer: 'This calculator computes Days Sales Outstanding (DSO) — the average number of days a company takes to collect payment after making a credit sale.',
            intro_text: '<p>DSO translates the accounts receivable turnover ratio into an intuitive "days" figure — instead of "how many times a year," it tells you "how many days on average." A lower DSO means faster collections and better cash flow; a rising DSO trend often signals loosening credit standards or collection problems.</p><p><b>Credit managers and CFOs</b> track DSO monthly to spot collection issues early, often comparing it against the company\'s own stated payment terms (e.g. "net 30").</p>',
            key_points: [
                '<b>Formula:</b> DSO = (Accounts Receivable ÷ Net Credit Sales) × 365.',
                '<b>Compare DSO to your payment terms:</b> if your invoices say "net 30" but your DSO is 55 days, customers are paying nearly twice as slowly as agreed — a clear collections red flag.',
                '<b>Trend matters more than a single snapshot:</b> a DSO that\'s rising quarter over quarter, even if still "acceptable" in absolute terms, deserves investigation before it becomes a bigger cash flow problem.',
            ],
            howto: [
                { question: 'What\'s a "good" DSO?', answer: '<p>It depends heavily on your industry and standard payment terms — a DSO close to your stated credit terms (e.g. ~30 days for "net 30" terms) is generally healthy; significantly higher suggests collection issues.</p>' },
                { question: 'Should I use 365 or 360 days in the formula?', answer: '<p>365 (calendar year) is the most common convention for DSO; some finance teams use 360 for simplicity in certain international contexts, but the difference is minor for this metric.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Accounts Receivable', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Net Credit Sales', type: 'number', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Days Sales Outstanding (DSO)', unit: 'days', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-perioda-oborota-debitorskoy-zadolzhennosti-dso',
            title: 'Калькулятор периода оборота дебиторской задолженности (DSO)',
            h1: 'Калькулятор периода оборота дебиторской задолженности (DSO)',
            meta_title: 'Калькулятор DSO | Средний период инкассации',
            meta_description: 'Рассчитайте DSO из дебиторской задолженности и чистых продаж в кредит — среднее число дней на получение оплаты после продажи.',
            short_answer: 'Этот калькулятор вычисляет DSO — среднее число дней, которое требуется компании для получения оплаты после продажи в кредит.',
            intro_text: '<p>DSO переводит коэффициент оборачиваемости дебиторки в интуитивно понятный показатель "дней". Более низкий DSO означает более быстрый сбор платежей.</p><p><b>Кредитные менеджеры и финансовые директора</b> отслеживают DSO ежемесячно, чтобы вовремя заметить проблемы со сбором платежей.</p>',
            key_points: [
                '<b>Формула:</b> DSO = (Дебиторская задолженность ÷ Чистые продажи в кредит) × 365.',
                '<b>Сравнивайте DSO с условиями оплаты:</b> если счета выставляются с отсрочкой 30 дней, а DSO составляет 55 дней, клиенты платят почти вдвое медленнее, чем договорено.',
                '<b>Тренд важнее одного снимка:</b> растущий DSO из квартала в квартал заслуживает внимания, даже если абсолютное значение ещё "приемлемо".',
            ],
            howto: [
                { question: 'Что считается "хорошим" DSO?', answer: '<p>Сильно зависит от отрасли и стандартных условий оплаты — DSO, близкий к заявленным условиям кредита (например, ~30 дней), обычно здоров.</p>' },
                { question: 'Использовать 365 или 360 дней в формуле?', answer: '<p>365 (календарный год) — самая распространённая конвенция для DSO; некоторые финансовые команды используют 360 для упрощения.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Дебиторская задолженность', type: 'number', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Чистые продажи в кредит', type: 'number', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Период оборота дебиторки (DSO)', unit: 'дней', precision: 1 },
            ],
        },
        lv: {
            slug: 'debitoru-parada-apgrozijuma-perioda-dso-kalkulators',
            title: 'Debitoru Parāda Apgrozījuma Perioda (DSO) Kalkulators',
            h1: 'Debitoru Parāda Apgrozījuma Perioda (DSO) Kalkulators',
            meta_title: 'DSO Kalkulators | Vidējais Iekasēšanas Periods',
            meta_description: 'Aprēķiniet DSO no debitoru parāda un neto kredīta pārdošanas — vidējo dienu skaitu maksājuma saņemšanai pēc pārdošanas.',
            short_answer: 'Šis kalkulators aprēķina DSO — vidējo dienu skaitu, kas uzņēmumam nepieciešams, lai saņemtu samaksu pēc kredīta pārdošanas.',
            intro_text: '<p>DSO pārvērš debitoru parāda apgrozījuma koeficientu intuitīvā "dienu" rādītājā. Zemāks DSO nozīmē ātrāku maksājumu iekasēšanu.</p><p><b>Kredītu vadītāji un finanšu direktori</b> seko DSO ik mēnesi, lai savlaicīgi pamanītu iekasēšanas problēmas.</p>',
            key_points: [
                '<b>Formula:</b> DSO = (Debitoru Parāds ÷ Neto Kredīta Pārdošana) × 365.',
                '<b>Salīdziniet DSO ar apmaksas noteikumiem:</b> ja rēķini paredz 30 dienu atlikšanu, bet DSO ir 55 dienas, klienti maksā gandrīz divreiz lēnāk nekā vienots.',
                '<b>Tendence ir svarīgāka par vienu momentuzņēmumu:</b> DSO, kas pieaug ceturksni pēc ceturkšņa, ir jāizpēta.',
            ],
            howto: [
                { question: 'Kas ir "labs" DSO?', answer: '<p>Ļoti atkarīgs no nozares un standarta apmaksas noteikumiem — DSO tuvu deklarētajiem kredīta noteikumiem parasti ir veselīgs.</p>' },
                { question: 'Vai formulā izmantot 365 vai 360 dienas?', answer: '<p>365 (kalendārais gads) ir visizplatītākā konvencija DSO; dažas finanšu komandas izmanto 360 vienkāršības labad.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Debitoru Parāds', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Neto Kredīta Pārdošana', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Debitoru Apgrozījuma Periods (DSO)', unit: 'dienas', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-okresu-splywu-naleznosci-dso',
            title: 'Kalkulator Okresu Spływu Należności (DSO)',
            h1: 'Kalkulator Okresu Spływu Należności (DSO)',
            meta_title: 'Kalkulator DSO | Średni Okres Windykacji',
            meta_description: 'Oblicz DSO z należności i sprzedaży kredytowej netto — średnią liczbę dni potrzebnych na otrzymanie płatności po sprzedaży.',
            short_answer: 'Ten kalkulator oblicza DSO — średnią liczbę dni, jaką firma potrzebuje na otrzymanie płatności po dokonaniu sprzedaży kredytowej.',
            intro_text: '<p>DSO przekłada wskaźnik rotacji należności na intuicyjny wskaźnik "dni". Niższe DSO oznacza szybsze inkaso.</p><p><b>Menedżerowie kredytowi i dyrektorzy finansowi</b> śledzą DSO co miesiąc, aby wcześnie wychwycić problemy z windykacją.</p>',
            key_points: [
                '<b>Wzór:</b> DSO = (Należności ÷ Sprzedaż Kredytowa Netto) × 365.',
                '<b>Porównaj DSO z warunkami płatności:</b> jeśli faktury mają termin 30 dni, a DSO wynosi 55 dni, klienci płacą prawie dwa razy wolniej niż uzgodniono.',
                '<b>Trend jest ważniejszy niż pojedynczy odczyt:</b> rosnące DSO kwartał do kwartału zasługuje na zbadanie.',
            ],
            howto: [
                { question: 'Co to jest "dobre" DSO?', answer: '<p>Mocno zależy od branży i standardowych warunków płatności — DSO zbliżone do zadeklarowanych warunków kredytu jest zwykle zdrowe.</p>' },
                { question: 'Czy w formule użyć 365 czy 360 dni?', answer: '<p>365 (rok kalendarzowy) to najczęstsza konwencja dla DSO; niektóre zespoły finansowe używają 360 dla uproszczenia.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Należności', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Sprzedaż Kredytowa Netto', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Okres Spływu Należności (DSO)', unit: 'dni', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-de-dias-de-venta-pendientes-de-cobro-dso',
            title: 'Calculadora de Días de Venta Pendientes de Cobro (DSO)',
            h1: 'Calculadora de Días de Venta Pendientes de Cobro (DSO)',
            meta_title: 'Calculadora DSO | Periodo Medio de Cobro',
            meta_description: 'Calcula el DSO a partir de las cuentas por cobrar y las ventas netas a crédito — el número medio de días para cobrar tras una venta.',
            short_answer: 'Esta calculadora calcula el DSO — el número medio de días que tarda una empresa en cobrar tras realizar una venta a crédito.',
            intro_text: '<p>El DSO traduce el ratio de rotación de cuentas por cobrar a una cifra intuitiva de "días". Un DSO más bajo significa cobros más rápidos.</p><p><b>Los gerentes de crédito y directores financieros en España</b> siguen el DSO mensualmente para detectar problemas de cobro a tiempo.</p>',
            key_points: [
                '<b>Fórmula:</b> DSO = (Cuentas por Cobrar ÷ Ventas Netas a Crédito) × 365.',
                '<b>Compara el DSO con tus condiciones de pago:</b> si tus facturas dicen "30 días" pero tu DSO es de 55 días, los clientes pagan casi el doble de lento de lo acordado.',
                '<b>La tendencia importa más que una sola foto:</b> un DSO que sube trimestre tras trimestre merece investigación.',
            ],
            howto: [
                { question: '¿Qué es un DSO "bueno"?', answer: '<p>Depende mucho de tu sector y condiciones de pago estándar — un DSO cercano a tus condiciones de crédito declaradas suele ser saludable.</p>' },
                { question: '¿Debo usar 365 o 360 días en la fórmula?', answer: '<p>365 (año calendario) es la convención más común para el DSO; algunos equipos financieros usan 360 por simplicidad.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Cuentas por Cobrar', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Ventas Netas a Crédito', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Días de Venta Pendientes de Cobro (DSO)', unit: 'días', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-de-delai-moyen-de-recouvrement-dso',
            title: 'Calculateur de Délai Moyen de Recouvrement (DSO)',
            h1: 'Calculateur de Délai Moyen de Recouvrement (DSO)',
            meta_title: 'Calculateur DSO | Délai Moyen de Recouvrement',
            meta_description: 'Calculez le DSO à partir des créances clients et des ventes nettes à crédit — le nombre moyen de jours pour recouvrer un paiement après une vente.',
            short_answer: 'Ce calculateur calcule le DSO — le nombre moyen de jours qu’une entreprise met à recouvrer un paiement après une vente à crédit.',
            intro_text: '<p>Le DSO traduit le ratio de rotation des créances en un chiffre intuitif de « jours ». Un DSO plus bas signifie des recouvrements plus rapides.</p><p><b>Les responsables crédit et directeurs financiers en France</b> suivent le DSO chaque mois pour repérer tôt les problèmes de recouvrement.</p>',
            key_points: [
                '<b>Formule :</b> DSO = (Créances Clients ÷ Ventes Nettes à Crédit) × 365.',
                '<b>Comparez le DSO à vos conditions de paiement :</b> si vos factures indiquent 30 jours mais que votre DSO est de 55 jours, les clients paient presque deux fois plus lentement que convenu.',
                '<b>La tendance compte plus qu’un seul instantané :</b> un DSO en hausse trimestre après trimestre mérite d’être examiné.',
            ],
            howto: [
                { question: 'Qu’est-ce qu’un « bon » DSO ?', answer: '<p>Cela dépend fortement de votre secteur et de vos conditions de paiement standard — un DSO proche de vos conditions de crédit déclarées est généralement sain.</p>' },
                { question: 'Dois-je utiliser 365 ou 360 jours dans la formule ?', answer: '<p>365 (année civile) est la convention la plus courante pour le DSO ; certaines équipes financières utilisent 360 par simplicité.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Créances Clients', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Ventes Nettes à Crédit', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Délai Moyen de Recouvrement (DSO)', unit: 'jours', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-giorni-medi-di-incasso-dso',
            title: 'Calcolatore Giorni Medi di Incasso (DSO)',
            h1: 'Calcolatore Giorni Medi di Incasso (DSO)',
            meta_title: 'Calcolatore DSO | Periodo Medio di Incasso',
            meta_description: 'Calcola il DSO dai crediti e dalle vendite nette a credito — il numero medio di giorni per incassare dopo una vendita.',
            short_answer: 'Questo calcolatore calcola il DSO — il numero medio di giorni che un’azienda impiega per incassare dopo aver effettuato una vendita a credito.',
            intro_text: '<p>Il DSO traduce il rapporto di rotazione crediti in un dato intuitivo espresso in "giorni". Un DSO più basso significa incassi più rapidi.</p><p><b>I responsabili del credito e i CFO in Italia</b> monitorano il DSO mensilmente per individuare tempestivamente problemi di incasso.</p>',
            key_points: [
                '<b>Formula:</b> DSO = (Crediti ÷ Vendite Nette a Credito) × 365.',
                '<b>Confronta il DSO con le tue condizioni di pagamento:</b> se le tue fatture indicano 30 giorni ma il tuo DSO è di 55 giorni, i clienti pagano quasi il doppio più lentamente del concordato.',
                '<b>La tendenza conta più di un singolo dato:</b> un DSO in aumento trimestre dopo trimestre merita un’indagine.',
            ],
            howto: [
                { question: 'Cos’è un "buon" DSO?', answer: '<p>Dipende molto dal tuo settore e dalle condizioni di pagamento standard — un DSO vicino alle tue condizioni di credito dichiarate è generalmente sano.</p>' },
                { question: 'Dovrei usare 365 o 360 giorni nella formula?', answer: '<p>365 (anno solare) è la convenzione più comune per il DSO; alcuni team finanziari usano 360 per semplicità.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Crediti', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Vendite Nette a Credito', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Giorni Medi di Incasso (DSO)', unit: 'giorni', precision: 1 },
            ],
        },
        de: {
            slug: 'debitorenlaufzeit-dso-rechner',
            title: 'Debitorenlaufzeit (DSO) Rechner',
            h1: 'Debitorenlaufzeit (DSO) Rechner',
            meta_title: 'DSO Rechner | Durchschnittliche Zahlungsdauer',
            meta_description: 'Berechnen Sie die Debitorenlaufzeit (DSO) aus Forderungen und Netto-Kreditverkäufen — die durchschnittliche Anzahl der Tage bis zum Zahlungseingang nach einem Verkauf.',
            short_answer: 'Dieser Rechner berechnet die Debitorenlaufzeit (DSO) — die durchschnittliche Anzahl der Tage, die ein Unternehmen benötigt, um nach einem Kreditverkauf die Zahlung zu erhalten.',
            intro_text: '<p>DSO übersetzt den Debitorenumschlag in eine intuitive "Tage"-Zahl. Eine niedrigere DSO bedeutet schnellere Zahlungseingänge.</p><p><b>Kreditmanager und CFOs in Deutschland</b> verfolgen die DSO monatlich, um Inkassoprobleme frühzeitig zu erkennen.</p>',
            key_points: [
                '<b>Formel:</b> DSO = (Forderungen ÷ Netto-Kreditverkäufe) × 365.',
                '<b>Vergleichen Sie die DSO mit Ihren Zahlungsbedingungen:</b> wenn Ihre Rechnungen "netto 30" vorgeben, Ihre DSO aber 55 Tage beträgt, zahlen Kunden fast doppelt so langsam wie vereinbart.',
                '<b>Der Trend zählt mehr als eine Momentaufnahme:</b> eine von Quartal zu Quartal steigende DSO verdient eine Untersuchung.',
            ],
            howto: [
                { question: 'Was ist eine "gute" DSO?', answer: '<p>Hängt stark von Ihrer Branche und den Standard-Zahlungsbedingungen ab — eine DSO nahe Ihren angegebenen Kreditbedingungen ist in der Regel gesund.</p>' },
                { question: 'Sollte ich 365 oder 360 Tage in der Formel verwenden?', answer: '<p>365 (Kalenderjahr) ist die gängigste Konvention für DSO; manche Finanzteams verwenden 360 der Einfachheit halber.</p>' },
            ],
            inputs: [
                { name: 'accounts_receivable', label: 'Forderungen', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '150000' },
                { name: 'net_credit_sales', label: 'Netto-Kreditverkäufe', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '1200000' },
            ],
            outputs: [
                { name: 'dso_days', label: 'Debitorenlaufzeit (DSO)', unit: 'Tage', precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1067: Interest Coverage Ratio Calculator
// ============================================================
const interestCoverage: ToolDef = {
    id: '1067',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'ebit', default: 300000 },
            { key: 'interest_expense', default: 50000 },
        ],
        formulas: {
            coverage: 'ebit/interest_expense',
        },
        outputs: [
            { key: 'coverage', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'interest-coverage-ratio-calculator',
            title: 'Interest Coverage Ratio Calculator',
            h1: 'Interest Coverage Ratio Calculator',
            meta_title: 'Interest Coverage Ratio Calculator | Debt Servicing Safety Margin',
            meta_description: 'Calculate the interest coverage ratio from EBIT and interest expense — a key measure of how easily a company can pay interest on its outstanding debt.',
            short_answer: 'This calculator divides EBIT (earnings before interest and taxes) by interest expense to give you the interest coverage ratio — how many times over a company could pay its interest obligations from operating earnings.',
            intro_text: '<p>The interest coverage ratio is a core solvency metric for lenders and bondholders. It shows the safety margin a company has for making interest payments — a higher ratio means more comfortable room, while a ratio close to or below 1 signals the company may struggle to service its debt.</p><p><b>Lenders and credit analysts</b> use this ratio heavily when assessing loan applications and bond covenants.</p>',
            key_points: [
                '<b>Formula:</b> Interest Coverage Ratio = EBIT ÷ Interest Expense.',
                '<b>Rule of thumb:</b> a ratio above 2-3 is generally considered a reasonable safety margin; below 1.5 raises concern, and below 1 means the company cannot cover interest payments from operating earnings alone.',
                '<b>Industry and rate environment matter:</b> capital-intensive, cyclical industries typically maintain higher coverage ratios as a buffer against earnings volatility.',
            ],
            howto: [
                { question: 'Where do I find EBIT on the income statement?', answer: '<p>EBIT (earnings before interest and taxes) is operating income — revenue minus operating expenses, before interest and tax are deducted. It\'s often listed directly on the income statement or easily derived from it.</p>' },
                { question: 'What does a very high interest coverage ratio mean?', answer: '<p>A very high ratio (10+) suggests the company has ample capacity to take on more debt if needed, or is conservatively financed relative to its earnings power — generally a sign of financial strength.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Earnings Before Interest & Taxes)', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Interest Expense', type: 'number', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Interest Coverage Ratio', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-koefficienta-pokrytiya-protsentov',
            title: 'Калькулятор коэффициента покрытия процентов',
            h1: 'Калькулятор коэффициента покрытия процентов',
            meta_title: 'Коэффициент покрытия процентов | Запас прочности по обслуживанию долга',
            meta_description: 'Рассчитайте коэффициент покрытия процентов из EBIT и процентных расходов — показатель того, насколько легко компания может платить проценты по долгу.',
            short_answer: 'Этот калькулятор делит EBIT (прибыль до вычета процентов и налогов) на процентные расходы, чтобы получить коэффициент покрытия процентов — сколько раз компания могла бы покрыть свои процентные обязательства за счёт операционной прибыли.',
            intro_text: '<p>Коэффициент покрытия процентов — базовый показатель платёжеспособности для кредиторов и держателей облигаций. Он показывает запас прочности компании для выплаты процентов.</p><p><b>Кредиторы и кредитные аналитики</b> активно используют этот коэффициент при оценке кредитных заявок.</p>',
            key_points: [
                '<b>Формула:</b> Коэффициент покрытия процентов = EBIT ÷ Процентные расходы.',
                '<b>Эмпирическое правило:</b> коэффициент выше 2-3 обычно считается разумным запасом прочности; ниже 1,5 вызывает опасения, а ниже 1 означает, что компания не может покрыть проценты только за счёт операционной прибыли.',
                '<b>Отрасль и процентная среда важны:</b> капиталоёмкие, циклические отрасли обычно поддерживают более высокие коэффициенты покрытия.',
            ],
            howto: [
                { question: 'Где найти EBIT в отчёте о прибылях и убытках?', answer: '<p>EBIT (прибыль до вычета процентов и налогов) — это операционная прибыль: выручка минус операционные расходы, до вычета процентов и налогов.</p>' },
                { question: 'Что означает очень высокий коэффициент покрытия процентов?', answer: '<p>Очень высокий коэффициент (10+) говорит о том, что у компании есть большой запас для привлечения дополнительного долга при необходимости.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (прибыль до процентов и налогов)', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Процентные расходы', type: 'number', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Коэффициент покрытия процентов', precision: 2 },
            ],
        },
        lv: {
            slug: 'procentu-segsanas-koeficienta-kalkulators',
            title: 'Procentu Segšanas Koeficienta Kalkulators',
            h1: 'Procentu Segšanas Koeficienta Kalkulators',
            meta_title: 'Procentu Segšanas Koeficients | Parāda Apkalpošanas Drošības Rezerve',
            meta_description: 'Aprēķiniet procentu segšanas koeficientu no EBIT un procentu izdevumiem.',
            short_answer: 'Šis kalkulators dala EBIT (peļņu pirms procentiem un nodokļiem) ar procentu izdevumiem, lai iegūtu procentu segšanas koeficientu — cik reizes uzņēmums varētu segt savas procentu saistības no operatīvās peļņas.',
            intro_text: '<p>Procentu segšanas koeficients ir pamata maksātspējas rādītājs kreditoriem un obligāciju turētājiem. Tas parāda uzņēmuma drošības rezervi procentu maksājumu veikšanai.</p><p><b>Kreditori un kredītanalītiķi</b> plaši izmanto šo koeficientu, novērtējot kredīta pieteikumus.</p>',
            key_points: [
                '<b>Formula:</b> Procentu Segšanas Koeficients = EBIT ÷ Procentu Izdevumi.',
                '<b>Vispārējs noteikums:</b> koeficients virs 2-3 parasti tiek uzskatīts par saprātīgu drošības rezervi; zem 1,5 rada bažas.',
                '<b>Nozare un procentu vide ir svarīga:</b> kapitālietilpīgas, cikliskas nozares parasti uztur augstākus segšanas koeficientus.',
            ],
            howto: [
                { question: 'Kur atrast EBIT peļņas un zaudējumu aprēķinā?', answer: '<p>EBIT (peļņa pirms procentiem un nodokļiem) ir operatīvie ienākumi — ieņēmumi mīnus operatīvie izdevumi, pirms procentu un nodokļu atskaitīšanas.</p>' },
                { question: 'Ko nozīmē ļoti augsts procentu segšanas koeficients?', answer: '<p>Ļoti augsts koeficients (10+) liecina, ka uzņēmumam ir liela kapacitāte uzņemties papildu parādu, ja nepieciešams.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Peļņa pirms Procentiem un Nodokļiem)', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Procentu Izdevumi', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Procentu Segšanas Koeficients', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wskaznika-pokrycia-odsetek',
            title: 'Kalkulator Wskaźnika Pokrycia Odsetek',
            h1: 'Kalkulator Wskaźnika Pokrycia Odsetek',
            meta_title: 'Wskaźnik Pokrycia Odsetek | Margines Bezpieczeństwa Obsługi Długu',
            meta_description: 'Oblicz wskaźnik pokrycia odsetek z EBIT i kosztów odsetkowych.',
            short_answer: 'Ten kalkulator dzieli EBIT (zysk przed odsetkami i podatkami) przez koszty odsetkowe, aby uzyskać wskaźnik pokrycia odsetek — ile razy firma mogłaby pokryć swoje zobowiązania odsetkowe z zysku operacyjnego.',
            intro_text: '<p>Wskaźnik pokrycia odsetek to podstawowa miara wypłacalności dla kredytodawców i obligatariuszy. Pokazuje margines bezpieczeństwa firmy do spłaty odsetek.</p><p><b>Kredytodawcy i analitycy kredytowi</b> intensywnie korzystają z tego wskaźnika przy ocenie wniosków kredytowych.</p>',
            key_points: [
                '<b>Wzór:</b> Wskaźnik Pokrycia Odsetek = EBIT ÷ Koszty Odsetkowe.',
                '<b>Reguła kciuka:</b> wskaźnik powyżej 2-3 jest zwykle uważany za rozsądny margines bezpieczeństwa; poniżej 1,5 budzi obawy.',
                '<b>Branża i otoczenie stóp procentowych mają znaczenie:</b> kapitałochłonne, cykliczne branże zwykle utrzymują wyższe wskaźniki pokrycia.',
            ],
            howto: [
                { question: 'Gdzie znaleźć EBIT w rachunku zysków i strat?', answer: '<p>EBIT (zysk przed odsetkami i podatkami) to zysk operacyjny — przychody minus koszty operacyjne, przed odliczeniem odsetek i podatków.</p>' },
                { question: 'Co oznacza bardzo wysoki wskaźnik pokrycia odsetek?', answer: '<p>Bardzo wysoki wskaźnik (10+) sugeruje, że firma ma dużą zdolność do zaciągnięcia dodatkowego długu w razie potrzeby.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Zysk przed Odsetkami i Podatkami)', type: 'number', unit: 'zł', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Koszty Odsetkowe', type: 'number', unit: 'zł', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Wskaźnik Pokrycia Odsetek', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-ratio-de-cobertura-de-intereses',
            title: 'Calculadora de Ratio de Cobertura de Intereses',
            h1: 'Calculadora de Ratio de Cobertura de Intereses',
            meta_title: 'Ratio de Cobertura de Intereses | Margen de Seguridad del Servicio de Deuda',
            meta_description: 'Calcula el ratio de cobertura de intereses a partir del EBIT y los gastos por intereses.',
            short_answer: 'Esta calculadora divide el EBIT (beneficio antes de intereses e impuestos) entre los gastos por intereses para darte el ratio de cobertura de intereses — cuántas veces podría una empresa pagar sus obligaciones de intereses con el beneficio operativo.',
            intro_text: '<p>El ratio de cobertura de intereses es una métrica clave de solvencia para prestamistas y tenedores de bonos. Muestra el margen de seguridad que tiene una empresa para realizar pagos de intereses.</p><p><b>Prestamistas y analistas de crédito en España</b> usan este ratio intensamente al evaluar solicitudes de préstamo.</p>',
            key_points: [
                '<b>Fórmula:</b> Ratio de Cobertura de Intereses = EBIT ÷ Gastos por Intereses.',
                '<b>Regla general:</b> un ratio superior a 2-3 suele considerarse un margen de seguridad razonable; por debajo de 1,5 genera preocupación.',
                '<b>El sector y el entorno de tipos importan:</b> los sectores intensivos en capital y cíclicos suelen mantener ratios de cobertura más altos.',
            ],
            howto: [
                { question: '¿Dónde encuentro el EBIT en la cuenta de resultados?', answer: '<p>El EBIT (beneficio antes de intereses e impuestos) es el resultado operativo — ingresos menos gastos operativos, antes de deducir intereses e impuestos.</p>' },
                { question: '¿Qué significa un ratio de cobertura de intereses muy alto?', answer: '<p>Un ratio muy alto (10+) sugiere que la empresa tiene amplia capacidad para asumir más deuda si es necesario.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Beneficio antes de Intereses e Impuestos)', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Gastos por Intereses', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Ratio de Cobertura de Intereses', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-ratio-de-couverture-des-interets',
            title: 'Calculateur de Ratio de Couverture des Intérêts',
            h1: 'Calculateur de Ratio de Couverture des Intérêts',
            meta_title: 'Ratio de Couverture des Intérêts | Marge de Sécurité du Service de la Dette',
            meta_description: 'Calculez le ratio de couverture des intérêts à partir de l’EBIT et des charges d’intérêts.',
            short_answer: 'Ce calculateur divise l’EBIT (résultat avant intérêts et impôts) par les charges d’intérêts pour vous donner le ratio de couverture des intérêts — combien de fois une entreprise pourrait payer ses intérêts avec son résultat d’exploitation.',
            intro_text: '<p>Le ratio de couverture des intérêts est une mesure de solvabilité essentielle pour les prêteurs et les détenteurs d’obligations. Il montre la marge de sécurité dont dispose une entreprise pour payer ses intérêts.</p><p><b>Les prêteurs et analystes crédit en France</b> utilisent intensivement ce ratio lors de l’évaluation des demandes de prêt.</p>',
            key_points: [
                '<b>Formule :</b> Ratio de Couverture des Intérêts = EBIT ÷ Charges d’Intérêts.',
                '<b>Règle générale :</b> un ratio supérieur à 2-3 est généralement considéré comme une marge de sécurité raisonnable ; en dessous de 1,5, cela suscite des inquiétudes.',
                '<b>Le secteur et l’environnement des taux comptent :</b> les secteurs à forte intensité capitalistique et cycliques maintiennent généralement des ratios de couverture plus élevés.',
            ],
            howto: [
                { question: 'Où trouver l’EBIT dans le compte de résultat ?', answer: '<p>L’EBIT (résultat avant intérêts et impôts) est le résultat d’exploitation — le chiffre d’affaires moins les charges d’exploitation, avant déduction des intérêts et impôts.</p>' },
                { question: 'Que signifie un ratio de couverture des intérêts très élevé ?', answer: '<p>Un ratio très élevé (10+) suggère que l’entreprise a une grande capacité à contracter davantage de dette si nécessaire.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Résultat avant Intérêts et Impôts)', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Charges d’Intérêts', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Ratio de Couverture des Intérêts', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-indice-di-copertura-degli-interessi',
            title: 'Calcolatore Indice di Copertura degli Interessi',
            h1: 'Calcolatore Indice di Copertura degli Interessi',
            meta_title: 'Indice di Copertura Interessi | Margine di Sicurezza sul Debito',
            meta_description: 'Calcola l’indice di copertura degli interessi dall’EBIT e dagli oneri finanziari.',
            short_answer: 'Questo calcolatore divide l’EBIT (utile prima di interessi e imposte) per gli oneri finanziari per darti l’indice di copertura degli interessi — quante volte un’azienda potrebbe pagare i propri interessi con l’utile operativo.',
            intro_text: '<p>L’indice di copertura degli interessi è una metrica di solvibilità fondamentale per finanziatori e obbligazionisti. Mostra il margine di sicurezza di cui dispone un’azienda per pagare gli interessi.</p><p><b>Finanziatori e analisti del credito in Italia</b> usano intensamente questo indice nella valutazione delle richieste di prestito.</p>',
            key_points: [
                '<b>Formula:</b> Indice di Copertura Interessi = EBIT ÷ Oneri Finanziari.',
                '<b>Regola generale:</b> un indice superiore a 2-3 è generalmente considerato un margine di sicurezza ragionevole; sotto 1,5 desta preoccupazione.',
                '<b>Il settore e l’ambiente dei tassi contano:</b> i settori ad alta intensità di capitale e ciclici mantengono tipicamente indici di copertura più alti.',
            ],
            howto: [
                { question: 'Dove trovo l’EBIT nel conto economico?', answer: '<p>L’EBIT (utile prima di interessi e imposte) è il reddito operativo — ricavi meno spese operative, prima della deduzione di interessi e imposte.</p>' },
                { question: 'Cosa significa un indice di copertura degli interessi molto alto?', answer: '<p>Un indice molto alto (10+) suggerisce che l’azienda ha ampia capacità di assumere ulteriore debito se necessario.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Utile prima di Interessi e Imposte)', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Oneri Finanziari', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Indice di Copertura degli Interessi', precision: 2 },
            ],
        },
        de: {
            slug: 'zinsdeckungsgrad-rechner',
            title: 'Zinsdeckungsgrad-Rechner',
            h1: 'Zinsdeckungsgrad-Rechner',
            meta_title: 'Zinsdeckungsgrad | Sicherheitsmarge für Schuldendienst',
            meta_description: 'Berechnen Sie den Zinsdeckungsgrad aus EBIT und Zinsaufwand.',
            short_answer: 'Dieser Rechner teilt das EBIT (Ergebnis vor Zinsen und Steuern) durch den Zinsaufwand, um den Zinsdeckungsgrad zu ermitteln — wie oft ein Unternehmen seine Zinsverpflichtungen aus dem operativen Ergebnis decken könnte.',
            intro_text: '<p>Der Zinsdeckungsgrad ist eine zentrale Solvenzkennzahl für Kreditgeber und Anleihegläubiger. Er zeigt die Sicherheitsmarge, die ein Unternehmen für Zinszahlungen hat.</p><p><b>Kreditgeber und Kreditanalysten in Deutschland</b> nutzen diese Kennzahl intensiv bei der Bewertung von Kreditanträgen.</p>',
            key_points: [
                '<b>Formel:</b> Zinsdeckungsgrad = EBIT ÷ Zinsaufwand.',
                '<b>Faustregel:</b> ein Wert über 2-3 gilt allgemein als angemessene Sicherheitsmarge; unter 1,5 gibt Anlass zur Sorge.',
                '<b>Branche und Zinsumfeld spielen eine Rolle:</b> kapitalintensive, zyklische Branchen halten typischerweise höhere Deckungsgrade.',
            ],
            howto: [
                { question: 'Wo finde ich das EBIT in der Gewinn- und Verlustrechnung?', answer: '<p>EBIT (Ergebnis vor Zinsen und Steuern) ist das operative Ergebnis — Umsatz minus Betriebskosten, vor Abzug von Zinsen und Steuern.</p>' },
                { question: 'Was bedeutet ein sehr hoher Zinsdeckungsgrad?', answer: '<p>Ein sehr hoher Wert (10+) deutet darauf hin, dass das Unternehmen bei Bedarf reichlich Kapazität hat, weitere Schulden aufzunehmen.</p>' },
            ],
            inputs: [
                { name: 'ebit', label: 'EBIT (Ergebnis vor Zinsen und Steuern)', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '300000' },
                { name: 'interest_expense', label: 'Zinsaufwand', type: 'number', unit: '€', min: 0.01, max: 1000000000000, placeholder: '50000' },
            ],
            outputs: [
                { name: 'coverage', label: 'Zinsdeckungsgrad', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1068: Earnings Per Share (EPS) Calculator (monetary output — currency toggle for EN/RU)
// ============================================================
const eps: ToolDef = {
    id: '1068',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'net_income', default: 1000000 },
            { key: 'preferred_dividends', default: 100000 },
            { key: 'weighted_shares', default: 900000 },
        ],
        formulas: {
            eps: '(net_income-preferred_dividends)/weighted_shares',
        },
        outputs: [
            { key: 'eps', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'earnings-per-share-eps-calculator',
            title: 'Earnings Per Share (EPS) Calculator',
            h1: 'Earnings Per Share (EPS) Calculator',
            meta_title: 'EPS Calculator | Profit Allocated to Each Share',
            meta_description: 'Calculate earnings per share (EPS) from net income, preferred dividends, and weighted average shares outstanding — a core metric investors use to value stocks.',
            short_answer: 'This calculator computes earnings per share (EPS) — the portion of a company\'s profit allocated to each outstanding share of common stock, after preferred dividends are paid.',
            intro_text: '<p>EPS is one of the most closely watched metrics in equity investing. It converts total company profit into a per-share figure, making it possible to compare profitability across companies of different sizes and to compute valuation multiples like the P/E ratio.</p><p><b>Investors and analysts</b> track EPS trends quarter over quarter and year over year as a primary signal of whether a company\'s profitability is improving.</p>',
            key_points: [
                '<b>Formula:</b> EPS = (Net Income − Preferred Dividends) ÷ Weighted Average Shares Outstanding.',
                '<b>Why subtract preferred dividends?</b> Preferred shareholders have a priority claim on profits before common shareholders — only what remains after paying them belongs to common stock, which is what EPS measures.',
                '<b>Basic vs diluted EPS:</b> this calculator computes basic EPS using actual shares outstanding; diluted EPS (a separate, typically lower figure) also accounts for potential shares from options, warrants, and convertible securities.',
            ],
            howto: [
                { question: 'Why "weighted average" shares instead of the share count at a single point in time?', answer: '<p>If a company issues or buybacks shares during the period, a simple period-end count would misrepresent the shares actually outstanding throughout the reporting period — the weighted average correctly accounts for the time each share count was in effect.</p>' },
                { question: 'How is EPS used to value a stock?', answer: '<p>EPS is the denominator in the price-to-earnings (P/E) ratio — dividing a stock\'s market price by its EPS tells investors how many years of current earnings they\'re paying for at the current share price.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Net Income', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Preferred Dividends', type: 'number', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Weighted Average Shares Outstanding', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
                currencyInput,
            ],
            outputs: [
                { name: 'eps', label: 'Earnings Per Share (EPS)', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-pribyli-na-aktsiyu-eps',
            title: 'Калькулятор прибыли на акцию (EPS)',
            h1: 'Калькулятор прибыли на акцию (EPS)',
            meta_title: 'Калькулятор EPS | Прибыль, приходящаяся на каждую акцию',
            meta_description: 'Рассчитайте прибыль на акцию (EPS) из чистой прибыли, дивидендов по привилегированным акциям и средневзвешенного числа акций.',
            short_answer: 'Этот калькулятор вычисляет прибыль на акцию (EPS) — часть прибыли компании, приходящуюся на каждую обыкновенную акцию, после выплаты дивидендов по привилегированным акциям.',
            intro_text: '<p>EPS — один из самых пристально отслеживаемых показателей в инвестировании в акции. Он переводит общую прибыль компании в показатель на акцию.</p><p><b>Инвесторы и аналитики</b> отслеживают тренды EPS от квартала к кварталу и от года к году как основной сигнал улучшения прибыльности компании.</p>',
            key_points: [
                '<b>Формула:</b> EPS = (Чистая прибыль − Дивиденды по привилегированным акциям) ÷ Средневзвешенное число акций в обращении.',
                '<b>Почему вычитаются привилегированные дивиденды?</b> Держатели привилегированных акций имеют приоритетное право на прибыль перед держателями обыкновенных акций.',
                '<b>Базовый vs разводнённый EPS:</b> этот калькулятор вычисляет базовый EPS, используя фактическое число акций в обращении.',
            ],
            howto: [
                { question: 'Почему "средневзвешенное" число акций, а не число на определённый момент?', answer: '<p>Если компания выпускает или выкупает акции в течение периода, простой подсчёт на конец периода исказит реальное число акций в обращении.</p>' },
                { question: 'Как EPS используется для оценки акции?', answer: '<p>EPS — знаменатель коэффициента цена/прибыль (P/E) — деление рыночной цены акции на её EPS показывает, за сколько лет текущей прибыли инвестор платит по текущей цене.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Чистая прибыль', type: 'number', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Дивиденды по привилегированным акциям', type: 'number', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Средневзвешенное число акций в обращении', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'eps', label: 'Прибыль на акцию (EPS)', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'pelnas-uz-akciju-eps-kalkulators',
            title: 'Peļņas uz Akciju (EPS) Kalkulators',
            h1: 'Peļņas uz Akciju (EPS) Kalkulators',
            meta_title: 'EPS Kalkulators | Peļņa, kas Piešķirta Katrai Akcijai',
            meta_description: 'Aprēķiniet peļņu uz akciju (EPS) no tīrās peļņas, priekšrocību akciju dividendēm un vidējā svērtā akciju skaita.',
            short_answer: 'Šis kalkulators aprēķina peļņu uz akciju (EPS) — uzņēmuma peļņas daļu, kas piešķirta katrai parastajai akcijai pēc priekšrocību akciju dividenžu izmaksas.',
            intro_text: '<p>EPS ir viens no visvairāk vērotajiem rādītājiem akciju investīcijās. Tas pārvērš uzņēmuma kopējo peļņu rādītājā uz vienu akciju.</p><p><b>Investori un analītiķi</b> seko EPS tendencēm ceturksni pēc ceturkšņa un gadu pēc gada.</p>',
            key_points: [
                '<b>Formula:</b> EPS = (Tīrā Peļņa − Priekšrocību Akciju Dividendes) ÷ Vidējais Svērtais Akciju Skaits Apgrozībā.',
                '<b>Kāpēc atskaitīt priekšrocību dividendes?</b> Priekšrocību akciju turētājiem ir prioritāras tiesības uz peļņu pirms parasto akciju turētājiem.',
                '<b>Pamata pret atšķaidīto EPS:</b> šis kalkulators aprēķina pamata EPS, izmantojot faktisko akciju skaitu apgrozībā.',
            ],
            howto: [
                { question: 'Kāpēc "vidējais svērtais" akciju skaits, nevis skaits vienā brīdī?', answer: '<p>Ja uzņēmums izlaiž vai atpērk akcijas perioda laikā, vienkāršs perioda beigu skaits nepareizi atspoguļotu faktiski apgrozībā esošās akcijas.</p>' },
                { question: 'Kā EPS tiek izmantots akcijas vērtēšanai?', answer: '<p>EPS ir cenas/peļņas (P/E) koeficienta saucējs — akcijas tirgus cenas dalīšana ar tās EPS parāda, par cik gadu peļņu investors maksā pašreizējā cenā.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Tīrā Peļņa', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Priekšrocību Akciju Dividendes', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Vidējais Svērtais Akciju Skaits Apgrozībā', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
            ],
            outputs: [
                { name: 'eps', label: 'Peļņa uz Akciju (EPS)', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-zysku-na-akcje-eps',
            title: 'Kalkulator Zysku na Akcję (EPS)',
            h1: 'Kalkulator Zysku na Akcję (EPS)',
            meta_title: 'Kalkulator EPS | Zysk Przypisany na Każdą Akcję',
            meta_description: 'Oblicz zysk na akcję (EPS) z zysku netto, dywidend uprzywilejowanych i średnioważonej liczby akcji.',
            short_answer: 'Ten kalkulator oblicza zysk na akcję (EPS) — część zysku firmy przypisaną na każdą akcję zwykłą, po wypłacie dywidend uprzywilejowanych.',
            intro_text: '<p>EPS to jeden z najbardziej obserwowanych wskaźników w inwestowaniu w akcje. Zamienia całkowity zysk firmy na wartość na akcję.</p><p><b>Inwestorzy i analitycy</b> śledzą trendy EPS kwartał do kwartału i rok do roku.</p>',
            key_points: [
                '<b>Wzór:</b> EPS = (Zysk Netto − Dywidendy Uprzywilejowane) ÷ Średnioważona Liczba Akcji w Obiegu.',
                '<b>Dlaczego odejmuje się dywidendy uprzywilejowane?</b> Akcjonariusze uprzywilejowani mają priorytetowe prawo do zysków przed akcjonariuszami zwykłymi.',
                '<b>Podstawowy vs rozwodniony EPS:</b> ten kalkulator oblicza podstawowy EPS, używając faktycznej liczby akcji w obiegu.',
            ],
            howto: [
                { question: 'Dlaczego "średnioważona" liczba akcji, a nie liczba w jednym momencie?', answer: '<p>Jeśli firma emituje lub odkupuje akcje w trakcie okresu, prosta liczba na koniec okresu błędnie przedstawiałaby faktycznie pozostające w obiegu akcje.</p>' },
                { question: 'Jak EPS jest używany do wyceny akcji?', answer: '<p>EPS jest mianownikiem wskaźnika cena/zysk (P/E) — podzielenie ceny rynkowej akcji przez EPS pokazuje, za ile lat obecnego zysku inwestor płaci przy obecnej cenie.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Zysk Netto', type: 'number', unit: 'zł', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Dywidendy Uprzywilejowane', type: 'number', unit: 'zł', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Średnioważona Liczba Akcji w Obiegu', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
            ],
            outputs: [
                { name: 'eps', label: 'Zysk na Akcję (EPS)', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-beneficio-por-accion-bpa',
            title: 'Calculadora de Beneficio por Acción (BPA/EPS)',
            h1: 'Calculadora de Beneficio por Acción (BPA/EPS)',
            meta_title: 'Calculadora BPA | Beneficio Asignado a Cada Acción',
            meta_description: 'Calcula el beneficio por acción (BPA) a partir del beneficio neto, los dividendos preferentes y el número medio ponderado de acciones.',
            short_answer: 'Esta calculadora calcula el beneficio por acción (BPA) — la parte del beneficio de una empresa asignada a cada acción ordinaria en circulación, tras pagar los dividendos preferentes.',
            intro_text: '<p>El BPA es una de las métricas más vigiladas en la inversión en acciones. Convierte el beneficio total de la empresa en una cifra por acción.</p><p><b>Los inversores y analistas en España</b> siguen las tendencias del BPA trimestre tras trimestre y año tras año.</p>',
            key_points: [
                '<b>Fórmula:</b> BPA = (Beneficio Neto − Dividendos Preferentes) ÷ Número Medio Ponderado de Acciones en Circulación.',
                '<b>¿Por qué restar los dividendos preferentes?</b> Los accionistas preferentes tienen un derecho prioritario sobre los beneficios antes que los accionistas ordinarios.',
                '<b>BPA básico vs diluido:</b> esta calculadora calcula el BPA básico usando el número real de acciones en circulación.',
            ],
            howto: [
                { question: '¿Por qué "número medio ponderado" de acciones en lugar del número en un momento dado?', answer: '<p>Si una empresa emite o recompra acciones durante el periodo, un simple recuento a fin de periodo representaría erróneamente las acciones realmente en circulación.</p>' },
                { question: '¿Cómo se usa el BPA para valorar una acción?', answer: '<p>El BPA es el denominador del ratio precio/beneficio (PER) — dividir el precio de mercado de una acción entre su BPA indica cuántos años de beneficio actual se están pagando al precio actual.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Beneficio Neto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Dividendos Preferentes', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Número Medio Ponderado de Acciones', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
            ],
            outputs: [
                { name: 'eps', label: 'Beneficio por Acción (BPA)', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-benefice-par-action-bpa',
            title: 'Calculateur de Bénéfice par Action (BPA)',
            h1: 'Calculateur de Bénéfice par Action (BPA)',
            meta_title: 'Calculateur BPA | Profit Attribué à Chaque Action',
            meta_description: 'Calculez le bénéfice par action (BPA) à partir du résultat net, des dividendes prioritaires et du nombre moyen pondéré d’actions.',
            short_answer: 'Ce calculateur calcule le bénéfice par action (BPA) — la part du profit d’une entreprise attribuée à chaque action ordinaire en circulation, après paiement des dividendes prioritaires.',
            intro_text: '<p>Le BPA est l’une des métriques les plus surveillées en investissement en actions. Il convertit le profit total de l’entreprise en un chiffre par action.</p><p><b>Les investisseurs et analystes en France</b> suivent les tendances du BPA trimestre après trimestre et année après année.</p>',
            key_points: [
                '<b>Formule :</b> BPA = (Résultat Net − Dividendes Prioritaires) ÷ Nombre Moyen Pondéré d’Actions en Circulation.',
                '<b>Pourquoi soustraire les dividendes prioritaires ?</b> Les actionnaires prioritaires ont une créance prioritaire sur les profits avant les actionnaires ordinaires.',
                '<b>BPA de base vs dilué :</b> ce calculateur calcule le BPA de base en utilisant le nombre réel d’actions en circulation.',
            ],
            howto: [
                { question: 'Pourquoi un nombre « moyen pondéré » d’actions plutôt qu’à un instant donné ?', answer: '<p>Si une entreprise émet ou rachète des actions pendant la période, un simple décompte de fin de période représenterait mal les actions réellement en circulation.</p>' },
                { question: 'Comment le BPA est-il utilisé pour évaluer une action ?', answer: '<p>Le BPA est le dénominateur du ratio cours/bénéfice (PER) — diviser le prix du marché d’une action par son BPA indique combien d’années de bénéfice actuel sont payées au prix actuel.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Résultat Net', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Dividendes Prioritaires', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Nombre Moyen Pondéré d’Actions en Circulation', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
            ],
            outputs: [
                { name: 'eps', label: 'Bénéfice par Action (BPA)', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-utile-per-azione-eps',
            title: 'Calcolatore Utile per Azione (EPS)',
            h1: 'Calcolatore Utile per Azione (EPS)',
            meta_title: 'Calcolatore EPS | Profitto Allocato a Ciascuna Azione',
            meta_description: 'Calcola l’utile per azione (EPS) da utile netto, dividendi privilegiati e numero medio ponderato di azioni.',
            short_answer: 'Questo calcolatore calcola l’utile per azione (EPS) — la parte del profitto di un’azienda allocata a ciascuna azione ordinaria in circolazione, dopo il pagamento dei dividendi privilegiati.',
            intro_text: '<p>L’EPS è una delle metriche più osservate negli investimenti azionari. Converte l’utile totale dell’azienda in una cifra per azione.</p><p><b>Investitori e analisti in Italia</b> monitorano le tendenze dell’EPS trimestre dopo trimestre e anno dopo anno.</p>',
            key_points: [
                '<b>Formula:</b> EPS = (Utile Netto − Dividendi Privilegiati) ÷ Numero Medio Ponderato di Azioni in Circolazione.',
                '<b>Perché sottrarre i dividendi privilegiati?</b> Gli azionisti privilegiati hanno un diritto prioritario sugli utili rispetto agli azionisti ordinari.',
                '<b>EPS base vs diluito:</b> questo calcolatore calcola l’EPS base usando il numero effettivo di azioni in circolazione.',
            ],
            howto: [
                { question: 'Perché il numero "medio ponderato" di azioni invece del numero in un dato momento?', answer: '<p>Se un’azienda emette o riacquista azioni durante il periodo, un semplice conteggio di fine periodo rappresenterebbe erroneamente le azioni effettivamente in circolazione.</p>' },
                { question: 'Come si usa l’EPS per valutare un’azione?', answer: '<p>L’EPS è il denominatore del rapporto prezzo/utili (P/E) — dividere il prezzo di mercato di un’azione per il suo EPS indica quanti anni di utile attuale si stanno pagando al prezzo attuale.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Utile Netto', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Dividendi Privilegiati', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Numero Medio Ponderato di Azioni', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
            ],
            outputs: [
                { name: 'eps', label: 'Utile per Azione (EPS)', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'gewinn-je-aktie-eps-rechner',
            title: 'Gewinn je Aktie (EPS) Rechner',
            h1: 'Gewinn je Aktie (EPS) Rechner',
            meta_title: 'EPS Rechner | Gewinn je Ausstehender Aktie',
            meta_description: 'Berechnen Sie den Gewinn je Aktie (EPS) aus Nettogewinn, Vorzugsdividenden und gewichteter durchschnittlicher Aktienanzahl.',
            short_answer: 'Dieser Rechner berechnet den Gewinn je Aktie (EPS) — den Teil des Unternehmensgewinns, der jeder ausstehenden Stammaktie zugeordnet wird, nach Zahlung der Vorzugsdividenden.',
            intro_text: '<p>EPS ist eine der am genauesten beobachteten Kennzahlen im Aktieninvestment. Sie wandelt den Gesamtgewinn eines Unternehmens in eine Kennzahl je Aktie um.</p><p><b>Investoren und Analysten in Deutschland</b> verfolgen EPS-Trends von Quartal zu Quartal und von Jahr zu Jahr.</p>',
            key_points: [
                '<b>Formel:</b> EPS = (Nettogewinn − Vorzugsdividenden) ÷ Gewichtete Durchschnittliche Ausstehende Aktien.',
                '<b>Warum werden Vorzugsdividenden abgezogen?</b> Vorzugsaktionäre haben einen vorrangigen Anspruch auf Gewinne vor Stammaktionären.',
                '<b>Basis- vs. verwässertes EPS:</b> dieser Rechner berechnet das Basis-EPS anhand der tatsächlich ausstehenden Aktien.',
            ],
            howto: [
                { question: 'Warum "gewichteter Durchschnitt" statt der Aktienanzahl zu einem Zeitpunkt?', answer: '<p>Wenn ein Unternehmen während des Zeitraums Aktien ausgibt oder zurückkauft, würde eine einfache Zählung zum Periodenende die tatsächlich ausstehenden Aktien falsch darstellen.</p>' },
                { question: 'Wie wird EPS zur Bewertung einer Aktie verwendet?', answer: '<p>EPS ist der Nenner des Kurs-Gewinn-Verhältnisses (KGV) — die Division des Marktpreises einer Aktie durch ihr EPS zeigt, wie viele Jahre des aktuellen Gewinns zum aktuellen Preis bezahlt werden.</p>' },
            ],
            inputs: [
                { name: 'net_income', label: 'Nettogewinn', type: 'number', unit: '€', min: -1000000000000, max: 1000000000000, placeholder: '1000000' },
                { name: 'preferred_dividends', label: 'Vorzugsdividenden', type: 'number', unit: '€', min: 0, max: 1000000000000, placeholder: '100000' },
                { name: 'weighted_shares', label: 'Gewichtete Durchschnittliche Ausstehende Aktien', type: 'number', min: 1, max: 1000000000000, placeholder: '900000' },
            ],
            outputs: [
                { name: 'eps', label: 'Gewinn je Aktie (EPS)', unit: '€', precision: 2 },
            ],
        },
    },
}

export const tools: ToolDef[] = [currentRatio, quickRatio, debtToEquity, roe, roa, netProfitMargin, workingCapital, inventoryTurnover, arTurnover, dso, interestCoverage, eps]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: ACCOUNTING_RATIOS_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: ACCOUNTING_RATIOS_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} accounting & financial ratio calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
