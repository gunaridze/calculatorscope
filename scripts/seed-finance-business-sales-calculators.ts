// One-off script: seeds 12 new Business & Sales calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-finance-business-sales-calculators.ts
//
// Tool IDs 1045-1056, category_id '27' (Business & Sales, under Finance).
//
// REGIONAL ADAPTATION (first batch applying this rule - see memory
// calculator-regionalization-rule): EN and RU get a currency selector
// (USD $ / EUR €) and money outputs use unitFrom to display the chosen
// symbol dynamically. DE/LV/PL/IT/ES/FR use a fixed local currency and,
// for VAT-based tools, each locale's real standard VAT/IVA/TVA rate as a
// per-locale input default (DE 19%, LV 21%, PL 23% w/ PLN, IT 22%, FR 20%,
// ES 21%), overriding the shared config default via inputs_json[].default.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BUSINESS_SALES_CATEGORY_ID = '27'

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

// Reusable currency selector for EN/RU (global-audience locales)
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
// 1045: Profit Margin Calculator
// ============================================================
const profitMargin: ToolDef = {
    id: '1045',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'cost', default: 60 },
            { key: 'price', default: 100 },
        ],
        formulas: {
            margin_pct: '(price-cost)/price*100',
            profit: 'price-cost',
        },
        outputs: [
            { key: 'margin_pct', precision: 2 },
            { key: 'profit', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'profit-margin-calculator',
            title: 'Profit Margin Calculator',
            h1: 'Profit Margin Calculator',
            meta_title: 'Profit Margin Calculator | Gross Margin % from Cost & Price',
            meta_description: 'Calculate your gross profit margin percentage from your cost and selling price — the core pricing metric for any product or service business.',
            short_answer: 'This calculator computes your gross profit margin — the percentage of your selling price that is profit after covering the cost of the item — from your cost and selling price.',
            intro_text: '<p>Profit margin measures how much of each sale is actual profit, expressed as a percentage of the selling price (not the cost — a common point of confusion with markup, which is measured against cost instead). A 40% margin means 40 cents of every dollar in revenue is profit.</p><p><b>Business owners and pricing managers</b> use margin to compare profitability across products regardless of price point, and to set pricing that meets a target profitability threshold before committing to a selling price.</p>',
            key_points: [
                '<b>Margin vs. Markup:</b> Margin is profit ÷ selling price; markup is profit ÷ cost. The same dollar profit gives a lower margin % than markup % — they are not interchangeable.',
                '<b>Formula:</b> Margin % = (Price − Cost) ÷ Price × 100.',
                '<b>Higher Isn\'t Always Better:</b> Extremely high margins on low-volume items may earn less total profit than modest margins on high-volume ones — margin is one input to pricing strategy, not the whole picture.',
            ],
            howto: [
                { question: 'What\'s a good profit margin?', answer: '<p>It varies hugely by industry — grocery retail often runs 1-3% margins while software can run 70%+. Compare against your specific industry benchmark rather than a universal target.</p>' },
                { question: 'Why is my margin lower than my markup?', answer: '<p>Margin is calculated against the (higher) selling price, while markup is calculated against the (lower) cost — the same profit dollar amount always produces a smaller margin percentage than markup percentage.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Cost', type: 'number', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Selling Price', type: 'number', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Profit Margin', unit: '%', precision: 2 },
                { name: 'profit', label: 'Profit per Unit', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-pribyli-marzhi',
            title: 'Калькулятор маржи прибыли',
            h1: 'Калькулятор маржи прибыли',
            meta_title: 'Калькулятор маржи | Валовая маржа % из себестоимости и цены',
            meta_description: 'Рассчитайте процент валовой маржи прибыли из себестоимости и цены продажи — ключевую метрику ценообразования для любого бизнеса.',
            short_answer: 'Этот калькулятор вычисляет валовую маржу прибыли — процент от цены продажи, являющийся прибылью после покрытия себестоимости товара.',
            intro_text: '<p>Маржа прибыли показывает, какая часть каждой продажи является прибылью, выраженной в процентах от цены продажи (не от себестоимости — частая путаница с наценкой, которая измеряется относительно себестоимости). Маржа 40% означает, что 40 копеек с каждого рубля выручки — прибыль.</p><p><b>Владельцы бизнеса и менеджеры по ценообразованию</b> используют маржу, чтобы сравнивать прибыльность разных товаров независимо от их цены.</p>',
            key_points: [
                '<b>Маржа против наценки:</b> Маржа = прибыль ÷ цена продажи; наценка = прибыль ÷ себестоимость. Одна и та же прибыль в деньгах даёт меньший % маржи, чем % наценки.',
                '<b>Формула:</b> Маржа % = (Цена − Себестоимость) ÷ Цена × 100.',
                '<b>Выше не всегда лучше:</b> Очень высокая маржа при низком объёме продаж может приносить меньше общей прибыли, чем скромная маржа при высоком объёме.',
            ],
            howto: [
                { question: 'Какая маржа считается хорошей?', answer: '<p>Сильно зависит от отрасли — розница продуктов часто работает с маржой 1-3%, а софт — 70%+. Сравнивайте с бенчмарком своей отрасли.</p>' },
                { question: 'Почему моя маржа ниже наценки?', answer: '<p>Маржа считается от (более высокой) цены продажи, а наценка — от (более низкой) себестоимости, поэтому одна и та же прибыль в деньгах всегда даёт меньший процент маржи, чем наценки.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Себестоимость', type: 'number', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Цена продажи', type: 'number', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Маржа прибыли', unit: '%', precision: 2 },
                { name: 'profit', label: 'Прибыль с единицы', precision: 2 },
            ],
        },
        lv: {
            slug: 'peluas-marzas-kalkulators',
            title: 'Peļņas Maržas Kalkulators',
            h1: 'Peļņas Maržas Kalkulators',
            meta_title: 'Maržas Kalkulators | Bruto Marža % no Pašizmaksas un Cenas',
            meta_description: 'Aprēķiniet bruto peļņas maržas procentu no pašizmaksas un pārdošanas cenas — galveno cenu noteikšanas rādītāju jebkuram uzņēmumam.',
            short_answer: 'Šis kalkulators aprēķina bruto peļņas maržu — procentu no pārdošanas cenas, kas ir peļņa pēc preces pašizmaksas segšanas.',
            intro_text: '<p>Peļņas marža parāda, cik liela daļa no katras pārdošanas ir reāla peļņa, izteikta procentos no pārdošanas cenas (nevis pašizmaksas — bieža sajaukšana ar uzcenojumu, ko mēra pret pašizmaksu). 40% marža nozīmē, ka 40 centi no katra eiro ieņēmumos ir peļņa.</p><p><b>Uzņēmumu īpašnieki un cenu noteikšanas vadītāji</b> izmanto maržu, lai salīdzinātu dažādu preču rentabilitāti neatkarīgi no cenas līmeņa.</p>',
            key_points: [
                '<b>Marža pret uzcenojumu:</b> Marža = peļņa ÷ pārdošanas cena; uzcenojums = peļņa ÷ pašizmaksa. Tā pati peļņa naudā dod zemāku maržas % nekā uzcenojuma %.',
                '<b>Formula:</b> Marža % = (Cena − Pašizmaksa) ÷ Cena × 100.',
                '<b>Augstāks ne vienmēr labāks:</b> Ļoti augsta marža ar zemu apjomu var nest mazāk kopējās peļņas nekā mērena marža ar augstu apjomu.',
            ],
            howto: [
                { question: 'Kāda marža tiek uzskatīta par labu?', answer: '<p>Ļoti atkarīgs no nozares — pārtikas mazumtirdzniecība bieži strādā ar 1-3% maržu, bet programmatūra — 70%+.</p>' },
                { question: 'Kāpēc mana marža ir zemāka nekā uzcenojums?', answer: '<p>Marža tiek aprēķināta no (augstākas) pārdošanas cenas, bet uzcenojums — no (zemākas) pašizmaksas, tāpēc tā pati peļņa vienmēr dod zemāku maržas procentu.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Pašizmaksa', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Pārdošanas Cena', type: 'number', unit: '€', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Peļņas Marža', unit: '%', precision: 2 },
                { name: 'profit', label: 'Peļņa par Vienību', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-marzy-zysku',
            title: 'Kalkulator Marży Zysku',
            h1: 'Kalkulator Marży Zysku',
            meta_title: 'Kalkulator Marży | Marża Brutto % z Kosztu i Ceny',
            meta_description: 'Oblicz procent marży brutto na podstawie kosztu i ceny sprzedaży — kluczowy wskaźnik cenowy dla każdej firmy.',
            short_answer: 'Ten kalkulator oblicza marżę brutto — procent ceny sprzedaży, który jest zyskiem po pokryciu kosztu produktu.',
            intro_text: '<p>Marża zysku pokazuje, jaka część każdej sprzedaży to rzeczywisty zysk, wyrażona jako procent ceny sprzedaży (nie kosztu — częste mylenie z narzutem, który liczony jest względem kosztu). Marża 40% oznacza, że 40 groszy z każdej złotówki przychodu to zysk.</p><p><b>Właściciele firm i menedżerowie ds. cen</b> używają marży do porównywania rentowności różnych produktów niezależnie od poziomu ceny.</p>',
            key_points: [
                '<b>Marża kontra narzut:</b> Marża = zysk ÷ cena sprzedaży; narzut = zysk ÷ koszt. Ten sam zysk w pieniądzu daje niższy % marży niż % narzutu.',
                '<b>Wzór:</b> Marża % = (Cena − Koszt) ÷ Cena × 100.',
                '<b>Wyższa nie zawsze lepsza:</b> Bardzo wysoka marża przy niskim wolumenie może przynieść mniej łącznego zysku niż umiarkowana marża przy wysokim wolumenie.',
            ],
            howto: [
                { question: 'Jaka marża jest uważana za dobrą?', answer: '<p>Mocno zależy od branży — handel spożywczy często działa na marży 1-3%, a oprogramowanie na 70%+.</p>' },
                { question: 'Dlaczego moja marża jest niższa niż narzut?', answer: '<p>Marża jest liczona od (wyższej) ceny sprzedaży, a narzut od (niższego) kosztu, więc ten sam zysk zawsze daje niższy procent marży niż narzutu.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Koszt', type: 'number', unit: 'zł', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Cena Sprzedaży', type: 'number', unit: 'zł', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Marża Zysku', unit: '%', precision: 2 },
                { name: 'profit', label: 'Zysk na Jednostkę', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-margen-de-beneficio',
            title: 'Calculadora de Margen de Beneficio',
            h1: 'Calculadora de Margen de Beneficio',
            meta_title: 'Calculadora de Margen | Margen Bruto % desde Coste y Precio',
            meta_description: 'Calcula tu porcentaje de margen de beneficio bruto a partir del coste y precio de venta — la métrica clave de precios para cualquier negocio.',
            short_answer: 'Esta calculadora calcula tu margen de beneficio bruto — el porcentaje del precio de venta que es beneficio tras cubrir el coste del artículo.',
            intro_text: '<p>El margen de beneficio mide cuánto de cada venta es beneficio real, expresado como porcentaje del precio de venta (no del coste — una confusión común con el margen comercial, que se mide sobre el coste). Un margen del 40% significa que 40 céntimos de cada euro de ingresos son beneficio.</p><p><b>Propietarios de negocios y responsables de precios en España</b> usan el margen para comparar la rentabilidad entre productos independientemente de su precio.</p>',
            key_points: [
                '<b>Margen frente a margen comercial (markup):</b> Margen = beneficio ÷ precio de venta; markup = beneficio ÷ coste. El mismo beneficio en euros da un % de margen menor que de markup.',
                '<b>Fórmula:</b> Margen % = (Precio − Coste) ÷ Precio × 100.',
                '<b>Más alto no siempre es mejor:</b> Un margen muy alto con bajo volumen puede generar menos beneficio total que un margen modesto con alto volumen.',
            ],
            howto: [
                { question: '¿Qué margen de beneficio es bueno?', answer: '<p>Varía mucho según el sector — el comercio de alimentación en España suele tener márgenes del 1-3%, mientras que el software puede superar el 70%.</p>' },
                { question: '¿Por qué mi margen es menor que mi markup?', answer: '<p>El margen se calcula sobre el precio de venta (más alto), mientras que el markup se calcula sobre el coste (más bajo), por lo que el mismo beneficio siempre da un porcentaje de margen menor.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Coste', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Precio de Venta', type: 'number', unit: '€', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Margen de Beneficio', unit: '%', precision: 2 },
                { name: 'profit', label: 'Beneficio por Unidad', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-marge-beneficiaire',
            title: 'Calculateur de Marge Bénéficiaire',
            h1: 'Calculateur de Marge Bénéficiaire',
            meta_title: 'Calculateur de Marge | Marge Brute % à partir du Coût et Prix',
            meta_description: 'Calculez votre pourcentage de marge bénéficiaire brute à partir du coût et du prix de vente — l’indicateur de tarification clé pour toute entreprise.',
            short_answer: 'Ce calculateur calcule votre marge bénéficiaire brute — le pourcentage du prix de vente qui est du bénéfice après couverture du coût de l’article.',
            intro_text: '<p>La marge bénéficiaire mesure la part de chaque vente qui est un bénéfice réel, exprimée en pourcentage du prix de vente (pas du coût — une confusion courante avec le coefficient multiplicateur, calculé sur le coût). Une marge de 40 % signifie que 40 centimes de chaque euro de revenu sont du bénéfice.</p><p><b>Les chefs d’entreprise et responsables tarifaires en France</b> utilisent la marge pour comparer la rentabilité entre produits indépendamment du prix.</p>',
            key_points: [
                '<b>Marge contre coefficient multiplicateur :</b> Marge = bénéfice ÷ prix de vente ; coefficient = bénéfice ÷ coût. Le même bénéfice en euros donne un % de marge inférieur au % de coefficient.',
                '<b>Formule :</b> Marge % = (Prix − Coût) ÷ Prix × 100.',
                '<b>Plus élevé n’est pas toujours mieux :</b> Une marge très élevée sur un faible volume peut rapporter moins de bénéfice total qu’une marge modeste sur un volume élevé.',
            ],
            howto: [
                { question: 'Quelle est une bonne marge bénéficiaire ?', answer: '<p>Cela varie énormément selon le secteur — l’alimentaire en France fonctionne souvent avec des marges de 1-3 %, tandis que le logiciel peut dépasser 70 %.</p>' },
                { question: 'Pourquoi ma marge est-elle inférieure à mon coefficient multiplicateur ?', answer: '<p>La marge est calculée sur le prix de vente (plus élevé), tandis que le coefficient est calculé sur le coût (plus faible), donc le même bénéfice donne toujours un pourcentage de marge inférieur.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Coût', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Prix de Vente', type: 'number', unit: '€', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Marge Bénéficiaire', unit: '%', precision: 2 },
                { name: 'profit', label: 'Bénéfice par Unité', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-margine-di-profitto',
            title: 'Calcolatore Margine di Profitto',
            h1: 'Calcolatore Margine di Profitto',
            meta_title: 'Calcolatore Margine | Margine Lordo % da Costo e Prezzo',
            meta_description: 'Calcola la percentuale del tuo margine di profitto lordo da costo e prezzo di vendita — la metrica di prezzo fondamentale per qualsiasi attività.',
            short_answer: 'Questo calcolatore calcola il tuo margine di profitto lordo — la percentuale del prezzo di vendita che è profitto dopo aver coperto il costo dell’articolo.',
            intro_text: '<p>Il margine di profitto misura quanto di ogni vendita sia profitto reale, espresso come percentuale del prezzo di vendita (non del costo — una confusione comune con il ricarico, calcolato sul costo). Un margine del 40% significa che 40 centesimi di ogni euro di ricavo sono profitto.</p><p><b>Titolari di attività e responsabili prezzi in Italia</b> usano il margine per confrontare la redditività tra prodotti indipendentemente dal prezzo.</p>',
            key_points: [
                '<b>Margine contro ricarico:</b> Margine = profitto ÷ prezzo di vendita; ricarico = profitto ÷ costo. Lo stesso profitto in euro dà una % di margine inferiore alla % di ricarico.',
                '<b>Formula:</b> Margine % = (Prezzo − Costo) ÷ Prezzo × 100.',
                '<b>Più alto non è sempre meglio:</b> Un margine molto alto con basso volume può generare meno profitto totale di un margine modesto con alto volume.',
            ],
            howto: [
                { question: 'Che margine di profitto è considerato buono?', answer: '<p>Varia molto per settore — il commercio alimentare in Italia opera spesso con margini dell’1-3%, mentre il software può superare il 70%.</p>' },
                { question: 'Perché il mio margine è inferiore al mio ricarico?', answer: '<p>Il margine è calcolato sul prezzo di vendita (più alto), mentre il ricarico è calcolato sul costo (più basso), quindi lo stesso profitto dà sempre una percentuale di margine inferiore.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Costo', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Prezzo di Vendita', type: 'number', unit: '€', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Margine di Profitto', unit: '%', precision: 2 },
                { name: 'profit', label: 'Profitto per Unità', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'gewinnmarge-rechner',
            title: 'Gewinnmarge-Rechner',
            h1: 'Gewinnmarge-Rechner',
            meta_title: 'Margen-Rechner | Bruttomarge % aus Kosten und Preis',
            meta_description: 'Berechnen Sie Ihre Bruttogewinnmarge in Prozent aus Kosten und Verkaufspreis — die zentrale Preiskennzahl für jedes Unternehmen.',
            short_answer: 'Dieser Rechner berechnet Ihre Bruttogewinnmarge — den Prozentsatz des Verkaufspreises, der nach Deckung der Kosten Gewinn ist.',
            intro_text: '<p>Die Gewinnmarge misst, wie viel jedes Verkaufs tatsächlicher Gewinn ist, ausgedrückt als Prozentsatz des Verkaufspreises (nicht der Kosten — eine häufige Verwechslung mit dem Aufschlag, der auf die Kosten bezogen wird). Eine Marge von 40 % bedeutet, dass 40 Cent von jedem Euro Umsatz Gewinn sind.</p><p><b>Unternehmer und Preismanager in Deutschland</b> nutzen die Marge, um die Rentabilität verschiedener Produkte unabhängig vom Preis zu vergleichen.</p>',
            key_points: [
                '<b>Marge vs. Aufschlag:</b> Marge = Gewinn ÷ Verkaufspreis; Aufschlag = Gewinn ÷ Kosten. Derselbe Gewinnbetrag ergibt einen niedrigeren Margen-% als Aufschlags-%.',
                '<b>Formel:</b> Marge % = (Preis − Kosten) ÷ Preis × 100.',
                '<b>Höher ist nicht immer besser:</b> Eine sehr hohe Marge bei geringem Volumen kann weniger Gesamtgewinn bringen als eine moderate Marge bei hohem Volumen.',
            ],
            howto: [
                { question: 'Was ist eine gute Gewinnmarge?', answer: '<p>Variiert stark je nach Branche — der Lebensmitteleinzelhandel in Deutschland arbeitet oft mit 1-3 % Marge, während Software 70 %+ erreichen kann.</p>' },
                { question: 'Warum ist meine Marge niedriger als mein Aufschlag?', answer: '<p>Die Marge wird auf den (höheren) Verkaufspreis berechnet, der Aufschlag auf die (niedrigeren) Kosten — derselbe Gewinnbetrag ergibt daher immer einen niedrigeren Margen-Prozentsatz.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Kosten', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'price', label: 'Verkaufspreis', type: 'number', unit: '€', min: 0.01, max: 100000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'margin_pct', label: 'Gewinnmarge', unit: '%', precision: 2 },
                { name: 'profit', label: 'Gewinn pro Einheit', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1046: Markup Calculator
// ============================================================
const markup: ToolDef = {
    id: '1046',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'cost', default: 60 },
            { key: 'markup_pct', default: 50 },
        ],
        formulas: {
            selling_price: 'cost*(1+markup_pct/100)',
            profit: 'cost*(1+markup_pct/100) - cost',
        },
        outputs: [
            { key: 'selling_price', precision: 2 },
            { key: 'profit', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'markup-calculator',
            title: 'Markup Calculator - Selling Price from Cost',
            h1: 'Markup Calculator',
            meta_title: 'Markup Calculator | Selling Price from Cost & Markup %',
            meta_description: 'Calculate the selling price and profit from your cost and desired markup percentage — with a currency selector for USD or EUR.',
            short_answer: 'This calculator computes the selling price and profit you get by applying a markup percentage to your cost — markup is measured against cost, not against the final selling price (that\'s margin).',
            intro_text: '<p>Markup is the percentage added to cost to arrive at a selling price — a 50% markup on a $60 cost gives a $90 price. It\'s a common way retailers and wholesalers set prices, since it\'s calculated directly from what they know (the cost) rather than working backward from a target margin.</p><p><b>Retailers and product businesses</b> use standard markup percentages by category (e.g., a common retail markup convention) as a starting point, then adjust for competition and perceived value.</p>',
            key_points: [
                '<b>Formula:</b> Selling Price = Cost × (1 + Markup% ÷ 100).',
                '<b>Markup ≠ Margin:</b> A 50% markup produces a 33.3% margin, not 50% — see our Profit Margin Calculator to convert between the two.',
                '<b>Common Starting Point for Pricing:</b> Many retail categories have conventional markup ranges; check industry norms before setting your own.',
            ],
            howto: [
                { question: 'What markup should I use?', answer: '<p>It varies by industry and category — retail apparel often uses 100%+ markup (keystone pricing), while grocery uses much thinner margins. Research your specific category\'s norms.</p>' },
                { question: 'How is markup different from margin?', answer: '<p>Markup is profit divided by cost; margin is profit divided by selling price. The same profit dollar amount always gives a higher markup percentage than margin percentage.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Cost', type: 'number', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Markup', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
                currencyInput,
            ],
            outputs: [
                { name: 'selling_price', label: 'Selling Price', unitFrom: 'currency', precision: 2 },
                { name: 'profit', label: 'Profit', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-nacenki',
            title: 'Калькулятор наценки - цена продажи из себестоимости',
            h1: 'Калькулятор наценки',
            meta_title: 'Калькулятор наценки | Цена продажи из себестоимости и наценки %',
            meta_description: 'Рассчитайте цену продажи и прибыль по себестоимости и желаемому проценту наценки — с выбором валюты USD или EUR.',
            short_answer: 'Этот калькулятор вычисляет цену продажи и прибыль при применении процента наценки к себестоимости — наценка считается от себестоимости, а не от итоговой цены продажи (это маржа).',
            intro_text: '<p>Наценка — это процент, добавляемый к себестоимости для получения цены продажи — наценка 50% на себестоимость $60 даёт цену $90. Это распространённый способ ценообразования у розничных и оптовых продавцов.</p><p><b>Розничные и товарные бизнесы</b> используют стандартные проценты наценки по категориям как отправную точку.</p>',
            key_points: [
                '<b>Формула:</b> Цена продажи = Себестоимость × (1 + Наценка% ÷ 100).',
                '<b>Наценка ≠ Маржа:</b> Наценка 50% даёт маржу 33.3%, а не 50% — используйте наш калькулятор маржи для конвертации.',
                '<b>Распространённая отправная точка:</b> Многие розничные категории имеют условные диапазоны наценки; проверьте нормы своей отрасли.',
            ],
            howto: [
                { question: 'Какую наценку использовать?', answer: '<p>Зависит от отрасли и категории — розница одежды часто использует наценку 100%+, а продукты питания — гораздо более тонкую маржу.</p>' },
                { question: 'Чем наценка отличается от маржи?', answer: '<p>Наценка = прибыль ÷ себестоимость; маржа = прибыль ÷ цена продажи. Одна и та же прибыль в деньгах всегда даёт больший процент наценки, чем маржи.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Себестоимость', type: 'number', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Наценка', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'selling_price', label: 'Цена продажи', unitFrom: 'currency', precision: 2 },
                { name: 'profit', label: 'Прибыль', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'uzcenojuma-kalkulators',
            title: 'Uzcenojuma Kalkulators - Pārdošanas Cena no Pašizmaksas',
            h1: 'Uzcenojuma Kalkulators',
            meta_title: 'Uzcenojuma Kalkulators | Pārdošanas Cena no Pašizmaksas un Uzcenojuma %',
            meta_description: 'Aprēķiniet pārdošanas cenu un peļņu no pašizmaksas un vēlamā uzcenojuma procenta.',
            short_answer: 'Šis kalkulators aprēķina pārdošanas cenu un peļņu, piemērojot uzcenojuma procentu pašizmaksai — uzcenojums tiek mērīts pret pašizmaksu, nevis pret gala pārdošanas cenu (tā ir marža).',
            intro_text: '<p>Uzcenojums ir procents, kas pievienots pašizmaksai, lai iegūtu pārdošanas cenu — 50% uzcenojums €60 pašizmaksai dod €90 cenu. Tas ir izplatīts veids, kā mazumtirgotāji un vairumtirgotāji nosaka cenas.</p><p><b>Mazumtirgotāji un preču uzņēmumi</b> izmanto standarta uzcenojuma procentus pēc kategorijas kā sākumpunktu.</p>',
            key_points: [
                '<b>Formula:</b> Pārdošanas Cena = Pašizmaksa × (1 + Uzcenojums% ÷ 100).',
                '<b>Uzcenojums ≠ Marža:</b> 50% uzcenojums dod 33.3% maržu, nevis 50% — izmantojiet mūsu maržas kalkulatoru konvertēšanai.',
                '<b>Izplatīts sākumpunkts:</b> Daudzām mazumtirdzniecības kategorijām ir vispārpieņemti uzcenojuma diapazoni; pārbaudiet savas nozares normas.',
            ],
            howto: [
                { question: 'Kādu uzcenojumu izmantot?', answer: '<p>Atkarīgs no nozares un kategorijas — apģērbu mazumtirdzniecība bieži izmanto 100%+ uzcenojumu, bet pārtika — daudz mazāku maržu.</p>' },
                { question: 'Kā uzcenojums atšķiras no maržas?', answer: '<p>Uzcenojums = peļņa ÷ pašizmaksa; marža = peļņa ÷ pārdošanas cena. Tā pati peļņa vienmēr dod lielāku uzcenojuma procentu nekā maržas.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Pašizmaksa', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Uzcenojums', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
            ],
            outputs: [
                { name: 'selling_price', label: 'Pārdošanas Cena', unit: '€', precision: 2 },
                { name: 'profit', label: 'Peļņa', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-narzutu',
            title: 'Kalkulator Narzutu - Cena Sprzedaży z Kosztu',
            h1: 'Kalkulator Narzutu',
            meta_title: 'Kalkulator Narzutu | Cena Sprzedaży z Kosztu i Narzutu %',
            meta_description: 'Oblicz cenę sprzedaży i zysk na podstawie kosztu i pożądanego procentu narzutu.',
            short_answer: 'Ten kalkulator oblicza cenę sprzedaży i zysk przy zastosowaniu procentu narzutu do kosztu — narzut jest liczony względem kosztu, a nie ceny sprzedaży (to marża).',
            intro_text: '<p>Narzut to procent dodawany do kosztu, aby uzyskać cenę sprzedaży — narzut 50% na koszt 60 zł daje cenę 90 zł. To powszechny sposób ustalania cen przez sprzedawców detalicznych i hurtowych.</p><p><b>Sprzedawcy detaliczni i firmy produktowe</b> używają standardowych procentów narzutu według kategorii jako punktu wyjścia.</p>',
            key_points: [
                '<b>Wzór:</b> Cena Sprzedaży = Koszt × (1 + Narzut% ÷ 100).',
                '<b>Narzut ≠ Marża:</b> Narzut 50% daje marżę 33,3%, a nie 50% — użyj naszego kalkulatora marży do konwersji.',
                '<b>Powszechny punkt wyjścia:</b> Wiele kategorii detalicznych ma umowne zakresy narzutu; sprawdź normy swojej branży.',
            ],
            howto: [
                { question: 'Jaki narzut zastosować?', answer: '<p>Zależy od branży i kategorii — odzież detaliczna często stosuje narzut 100%+, a spożywka znacznie cieńszą marżę.</p>' },
                { question: 'Czym narzut różni się od marży?', answer: '<p>Narzut = zysk ÷ koszt; marża = zysk ÷ cena sprzedaży. Ten sam zysk zawsze daje wyższy procent narzutu niż marży.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Koszt', type: 'number', unit: 'zł', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Narzut', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
            ],
            outputs: [
                { name: 'selling_price', label: 'Cena Sprzedaży', unit: 'zł', precision: 2 },
                { name: 'profit', label: 'Zysk', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-margen-comercial',
            title: 'Calculadora de Margen Comercial (Markup) - Precio desde Coste',
            h1: 'Calculadora de Margen Comercial',
            meta_title: 'Calculadora de Markup | Precio de Venta desde Coste y Markup %',
            meta_description: 'Calcula el precio de venta y el beneficio a partir de tu coste y el porcentaje de margen comercial deseado.',
            short_answer: 'Esta calculadora calcula el precio de venta y el beneficio al aplicar un porcentaje de margen comercial (markup) sobre tu coste — se mide sobre el coste, no sobre el precio final (eso es el margen).',
            intro_text: '<p>El markup es el porcentaje añadido al coste para llegar a un precio de venta — un markup del 50% sobre un coste de 60€ da un precio de 90€. Es una forma común en que minoristas y mayoristas en España fijan precios.</p><p><b>Comercios y negocios de producto en España</b> usan porcentajes de markup estándar por categoría como punto de partida.</p>',
            key_points: [
                '<b>Fórmula:</b> Precio de Venta = Coste × (1 + Markup% ÷ 100).',
                '<b>Markup ≠ Margen:</b> Un markup del 50% produce un margen del 33,3%, no del 50% — usa nuestra Calculadora de Margen para convertir.',
                '<b>Punto de partida común:</b> Muchas categorías minoristas en España tienen rangos convencionales de markup; consulta las normas de tu sector.',
            ],
            howto: [
                { question: '¿Qué markup debo usar?', answer: '<p>Varía según sector y categoría — la moda minorista suele usar markup del 100%+, mientras la alimentación usa márgenes mucho más estrechos.</p>' },
                { question: '¿En qué se diferencia el markup del margen?', answer: '<p>Markup = beneficio ÷ coste; margen = beneficio ÷ precio de venta. El mismo beneficio siempre da un porcentaje de markup mayor que de margen.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Coste', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Margen Comercial', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
            ],
            outputs: [
                { name: 'selling_price', label: 'Precio de Venta', unit: '€', precision: 2 },
                { name: 'profit', label: 'Beneficio', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-coefficient-multiplicateur',
            title: 'Calculateur de Coefficient Multiplicateur - Prix depuis Coût',
            h1: 'Calculateur de Coefficient Multiplicateur',
            meta_title: 'Calculateur de Marge Commerciale | Prix de Vente depuis Coût et %',
            meta_description: 'Calculez le prix de vente et le bénéfice à partir de votre coût et du pourcentage de coefficient multiplicateur souhaité.',
            short_answer: 'Ce calculateur calcule le prix de vente et le bénéfice en appliquant un pourcentage de coefficient multiplicateur à votre coût — calculé sur le coût, pas sur le prix final (c\'est la marge).',
            intro_text: '<p>Le coefficient multiplicateur est le pourcentage ajouté au coût pour obtenir un prix de vente — un coefficient de 50 % sur un coût de 60 € donne un prix de 90 €. C\'est une méthode courante de fixation des prix chez les détaillants et grossistes en France.</p><p><b>Commerces et entreprises de produits en France</b> utilisent des pourcentages standards par catégorie comme point de départ.</p>',
            key_points: [
                '<b>Formule :</b> Prix de Vente = Coût × (1 + Coefficient% ÷ 100).',
                '<b>Coefficient ≠ Marge :</b> Un coefficient de 50 % produit une marge de 33,3 %, pas 50 % — utilisez notre Calculateur de Marge pour convertir.',
                '<b>Point de départ courant :</b> De nombreuses catégories de vente au détail en France ont des fourchettes conventionnelles ; vérifiez les normes de votre secteur.',
            ],
            howto: [
                { question: 'Quel coefficient dois-je utiliser ?', answer: '<p>Varie selon le secteur et la catégorie — la mode au détail utilise souvent un coefficient de 100 %+, tandis que l\'alimentaire utilise des marges bien plus fines.</p>' },
                { question: 'En quoi le coefficient diffère-t-il de la marge ?', answer: '<p>Coefficient = bénéfice ÷ coût ; marge = bénéfice ÷ prix de vente. Le même bénéfice donne toujours un pourcentage de coefficient supérieur à celui de la marge.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Coût', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Coefficient Multiplicateur', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
            ],
            outputs: [
                { name: 'selling_price', label: 'Prix de Vente', unit: '€', precision: 2 },
                { name: 'profit', label: 'Bénéfice', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-ricarico',
            title: 'Calcolatore di Ricarico - Prezzo di Vendita dal Costo',
            h1: 'Calcolatore di Ricarico',
            meta_title: 'Calcolatore Ricarico | Prezzo di Vendita da Costo e Ricarico %',
            meta_description: 'Calcola il prezzo di vendita e il profitto dal tuo costo e dalla percentuale di ricarico desiderata.',
            short_answer: 'Questo calcolatore calcola il prezzo di vendita e il profitto applicando una percentuale di ricarico al tuo costo — il ricarico è misurato sul costo, non sul prezzo finale (quello è il margine).',
            intro_text: '<p>Il ricarico è la percentuale aggiunta al costo per arrivare a un prezzo di vendita — un ricarico del 50% su un costo di 60€ dà un prezzo di 90€. È un modo comune in cui rivenditori e grossisti in Italia fissano i prezzi.</p><p><b>Rivenditori e attività di prodotto in Italia</b> usano percentuali di ricarico standard per categoria come punto di partenza.</p>',
            key_points: [
                '<b>Formula:</b> Prezzo di Vendita = Costo × (1 + Ricarico% ÷ 100).',
                '<b>Ricarico ≠ Margine:</b> Un ricarico del 50% produce un margine del 33,3%, non del 50% — usa il nostro Calcolatore di Margine per convertire.',
                '<b>Punto di partenza comune:</b> Molte categorie retail in Italia hanno intervalli convenzionali di ricarico; verifica le norme del tuo settore.',
            ],
            howto: [
                { question: 'Che ricarico dovrei usare?', answer: '<p>Varia per settore e categoria — l’abbigliamento al dettaglio usa spesso ricarichi del 100%+, mentre l’alimentare usa margini molto più sottili.</p>' },
                { question: 'In cosa il ricarico differisce dal margine?', answer: '<p>Ricarico = profitto ÷ costo; margine = profitto ÷ prezzo di vendita. Lo stesso profitto dà sempre una percentuale di ricarico maggiore di quella di margine.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Costo', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Ricarico', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
            ],
            outputs: [
                { name: 'selling_price', label: 'Prezzo di Vendita', unit: '€', precision: 2 },
                { name: 'profit', label: 'Profitto', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'aufschlag-rechner',
            title: 'Aufschlag-Rechner - Verkaufspreis aus Kosten',
            h1: 'Aufschlag-Rechner',
            meta_title: 'Aufschlag-Rechner | Verkaufspreis aus Kosten und Aufschlag %',
            meta_description: 'Berechnen Sie den Verkaufspreis und Gewinn aus Ihren Kosten und dem gewünschten Aufschlagsprozentsatz.',
            short_answer: 'Dieser Rechner berechnet den Verkaufspreis und Gewinn bei Anwendung eines Aufschlagsprozentsatzes auf Ihre Kosten — der Aufschlag wird auf die Kosten bezogen, nicht auf den Endverkaufspreis (das ist die Marge).',
            intro_text: '<p>Der Aufschlag ist der Prozentsatz, der zu den Kosten addiert wird, um einen Verkaufspreis zu erhalten — ein Aufschlag von 50 % auf Kosten von 60 € ergibt einen Preis von 90 €. Dies ist eine gängige Methode, mit der Einzelhändler und Großhändler in Deutschland Preise festlegen.</p><p><b>Einzelhändler und Produktunternehmen in Deutschland</b> nutzen standardmäßige Aufschlagsprozentsätze je Kategorie als Ausgangspunkt.</p>',
            key_points: [
                '<b>Formel:</b> Verkaufspreis = Kosten × (1 + Aufschlag% ÷ 100).',
                '<b>Aufschlag ≠ Marge:</b> Ein Aufschlag von 50 % ergibt eine Marge von 33,3 %, nicht 50 % — nutzen Sie unseren Margen-Rechner zur Umrechnung.',
                '<b>Häufiger Ausgangspunkt:</b> Viele Einzelhandelskategorien in Deutschland haben übliche Aufschlagsbereiche; prüfen Sie die Normen Ihrer Branche.',
            ],
            howto: [
                { question: 'Welchen Aufschlag sollte ich verwenden?', answer: '<p>Variiert je nach Branche und Kategorie — Bekleidungseinzelhandel nutzt oft 100 %+ Aufschlag, während Lebensmittel viel geringere Margen haben.</p>' },
                { question: 'Wie unterscheidet sich Aufschlag von Marge?', answer: '<p>Aufschlag = Gewinn ÷ Kosten; Marge = Gewinn ÷ Verkaufspreis. Derselbe Gewinn ergibt immer einen höheren Aufschlags-Prozentsatz als Margen-Prozentsatz.</p>' },
            ],
            inputs: [
                { name: 'cost', label: 'Kosten', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '60' },
                { name: 'markup_pct', label: 'Aufschlag', type: 'number', unit: '%', min: 0, max: 1000, placeholder: '50' },
            ],
            outputs: [
                { name: 'selling_price', label: 'Verkaufspreis', unit: '€', precision: 2 },
                { name: 'profit', label: 'Gewinn', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1047: Break-Even Point Calculator
// ============================================================
const breakEven: ToolDef = {
    id: '1047',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'fixed_costs', default: 10000 },
            { key: 'price', default: 50 },
            { key: 'variable_cost', default: 30 },
        ],
        formulas: {
            units: 'fixed_costs/(price-variable_cost)',
            revenue: '(fixed_costs/(price-variable_cost))*price',
        },
        outputs: [
            { key: 'units', precision: 1 },
            { key: 'revenue', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'break-even-point-calculator',
            title: 'Break-Even Point Calculator',
            h1: 'Break-Even Point Calculator',
            meta_title: 'Break-Even Calculator | Units & Revenue to Cover Costs',
            meta_description: 'Calculate how many units you need to sell — and the revenue that represents — to cover your fixed and variable costs and break even.',
            short_answer: 'This calculator computes your break-even point — the number of units you need to sell (and the revenue that represents) for your business to cover all its costs with zero profit or loss.',
            intro_text: '<p>Break-even analysis answers a fundamental business question: how much do I need to sell before I stop losing money? It divides your fixed costs (rent, salaries — costs that don\'t change with sales volume) by your contribution margin per unit (price minus variable cost per unit) to find the exact sales volume where total revenue equals total costs.</p><p><b>New businesses and product launches</b> use this before committing to a price or cost structure, to sanity-check whether the required sales volume is realistically achievable given market size and competition.</p>',
            key_points: [
                '<b>Formula:</b> Break-Even Units = Fixed Costs ÷ (Price − Variable Cost per Unit).',
                '<b>Contribution Margin:</b> Price minus variable cost is what each sale contributes toward covering fixed costs — a low contribution margin means you need very high volume to break even.',
                '<b>Beyond Break-Even = Profit:</b> Every unit sold past the break-even point contributes its full margin directly to profit, since fixed costs are already covered.',
            ],
            howto: [
                { question: 'What counts as a fixed cost vs a variable cost?', answer: '<p>Fixed costs stay the same regardless of sales volume (rent, salaries, insurance); variable costs scale with each unit sold (materials, packaging, per-unit shipping).</p>' },
                { question: 'What if my price is lower than my variable cost?', answer: '<p>You can never break even in that case — every sale loses money regardless of volume. The price must exceed the variable cost per unit for break-even analysis to be meaningful.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Fixed Costs', type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Price per Unit', type: 'number', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Variable Cost per Unit', type: 'number', min: 0, max: 10000000, placeholder: '30' },
                currencyInput,
            ],
            outputs: [
                { name: 'units', label: 'Break-Even Units', unit: 'units', precision: 1 },
                { name: 'revenue', label: 'Break-Even Revenue', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-tochki-bezubytochnosti',
            title: 'Калькулятор точки безубыточности',
            h1: 'Калькулятор точки безубыточности',
            meta_title: 'Калькулятор безубыточности | Единицы и выручка для покрытия затрат',
            meta_description: 'Рассчитайте, сколько единиц нужно продать — и какая это выручка — чтобы покрыть постоянные и переменные затраты и выйти в ноль.',
            short_answer: 'Этот калькулятор вычисляет точку безубыточности — количество единиц, которое нужно продать (и соответствующую выручку), чтобы бизнес покрыл все затраты при нулевой прибыли и убытке.',
            intro_text: '<p>Анализ безубыточности отвечает на фундаментальный вопрос: сколько нужно продать, чтобы перестать терять деньги? Он делит постоянные затраты (аренда, зарплаты) на маржинальный доход с единицы (цена минус переменные затраты на единицу).</p><p><b>Новые бизнесы и запуски продуктов</b> используют это перед принятием решения о цене, чтобы проверить, реалистичен ли требуемый объём продаж.</p>',
            key_points: [
                '<b>Формула:</b> Точка безубыточности (ед.) = Постоянные затраты ÷ (Цена − Переменные затраты на ед.).',
                '<b>Маржинальный доход:</b> Цена минус переменные затраты — это то, что каждая продажа вносит в покрытие постоянных затрат.',
                '<b>После точки безубыточности — прибыль:</b> Каждая проданная единица сверх точки безубыточности идёт напрямую в прибыль.',
            ],
            howto: [
                { question: 'Что считается постоянными, а что переменными затратами?', answer: '<p>Постоянные затраты не меняются с объёмом продаж (аренда, зарплаты); переменные растут с каждой проданной единицей (материалы, упаковка).</p>' },
                { question: 'Что если цена ниже переменных затрат?', answer: '<p>Тогда выйти в ноль невозможно — каждая продажа приносит убыток независимо от объёма.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Постоянные затраты', type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Цена за единицу', type: 'number', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Переменные затраты на единицу', type: 'number', min: 0, max: 10000000, placeholder: '30' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'units', label: 'Точка безубыточности (ед.)', unit: 'ед.', precision: 1 },
                { name: 'revenue', label: 'Выручка на точке безубыточности', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'pasnodrosinasanas-punkta-kalkulators',
            title: 'Pašnodrošināšanās Punkta Kalkulators',
            h1: 'Pašnodrošināšanās Punkta Kalkulators',
            meta_title: 'Pašnodrošināšanās Kalkulators | Vienības un Ieņēmumi Izmaksu Segšanai',
            meta_description: 'Aprēķiniet, cik vienību jāpārdod — un kādi tie ir ieņēmumi —, lai segtu fiksētās un mainīgās izmaksas un sasniegtu pašnodrošināšanos.',
            short_answer: 'Šis kalkulators aprēķina pašnodrošināšanās punktu — vienību skaitu, kas jāpārdod, lai uzņēmums segtu visas izmaksas ar nulles peļņu vai zaudējumiem.',
            intro_text: '<p>Pašnodrošināšanās analīze atbild uz pamata jautājumu: cik daudz jāpārdod, lai pārstātu zaudēt naudu? Tā dala fiksētās izmaksas (īre, algas) ar seguma summu uz vienību (cena mīnus mainīgās izmaksas uz vienību).</p><p><b>Jauni uzņēmumi un produktu palaišanas</b> to izmanto pirms cenas noteikšanas.</p>',
            key_points: [
                '<b>Formula:</b> Pašnodrošināšanās Vienības = Fiksētās Izmaksas ÷ (Cena − Mainīgās Izmaksas uz Vienību).',
                '<b>Seguma summa:</b> Cena mīnus mainīgās izmaksas ir tas, ko katra pārdošana dod fiksēto izmaksu segšanai.',
                '<b>Pēc pašnodrošināšanās — peļņa:</b> Katra pārdotā vienība virs šī punkta dod pilnu peļņu.',
            ],
            howto: [
                { question: 'Kas tiek uzskatīts par fiksētajām, kas par mainīgajām izmaksām?', answer: '<p>Fiksētās izmaksas nemainās ar pārdošanas apjomu (īre, algas); mainīgās pieaug ar katru pārdoto vienību (materiāli, iepakojums).</p>' },
                { question: 'Ko darīt, ja cena ir zemāka par mainīgajām izmaksām?', answer: '<p>Tad pašnodrošināšanās nav iespējama — katra pārdošana rada zaudējumus neatkarīgi no apjoma.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Fiksētās Izmaksas', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Cena par Vienību', type: 'number', unit: '€', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Mainīgās Izmaksas uz Vienību', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '30' },
            ],
            outputs: [
                { name: 'units', label: 'Pašnodrošināšanās Vienības', unit: 'gab.', precision: 1 },
                { name: 'revenue', label: 'Ieņēmumi Pašnodrošināšanās Punktā', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-progu-rentownosci',
            title: 'Kalkulator Progu Rentowności',
            h1: 'Kalkulator Progu Rentowności',
            meta_title: 'Kalkulator Progu Rentowności | Jednostki i Przychód na Pokrycie Kosztów',
            meta_description: 'Oblicz, ile jednostek musisz sprzedać — i jaki to przychód — aby pokryć koszty stałe i zmienne i osiągnąć próg rentowności.',
            short_answer: 'Ten kalkulator oblicza próg rentowności — liczbę jednostek, które musisz sprzedać (i odpowiadający jej przychód), aby firma pokryła wszystkie koszty przy zerowym zysku lub stracie.',
            intro_text: '<p>Analiza progu rentowności odpowiada na podstawowe pytanie: ile muszę sprzedać, aby przestać tracić pieniądze? Dzieli koszty stałe (czynsz, pensje) przez marżę pokrycia na jednostkę (cena minus koszt zmienny na jednostkę).</p><p><b>Nowe firmy i wprowadzenia produktów</b> używają tego przed ustaleniem ceny.</p>',
            key_points: [
                '<b>Wzór:</b> Jednostki Progu Rentowności = Koszty Stałe ÷ (Cena − Koszt Zmienny na Jednostkę).',
                '<b>Marża pokrycia:</b> Cena minus koszt zmienny to to, co każda sprzedaż wnosi na pokrycie kosztów stałych.',
                '<b>Powyżej progu — zysk:</b> Każda jednostka sprzedana powyżej progu rentowności przynosi pełną marżę jako zysk.',
            ],
            howto: [
                { question: 'Co liczy się jako koszt stały, a co zmienny?', answer: '<p>Koszty stałe nie zmieniają się wraz z wolumenem sprzedaży (czynsz, pensje); zmienne rosną z każdą sprzedaną jednostką (materiały, opakowania).</p>' },
                { question: 'Co jeśli cena jest niższa niż koszt zmienny?', answer: '<p>Wtedy osiągnięcie progu rentowności jest niemożliwe — każda sprzedaż przynosi stratę niezależnie od wolumenu.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Koszty Stałe', type: 'number', unit: 'zł', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Cena za Jednostkę', type: 'number', unit: 'zł', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Koszt Zmienny na Jednostkę', type: 'number', unit: 'zł', min: 0, max: 10000000, placeholder: '30' },
            ],
            outputs: [
                { name: 'units', label: 'Jednostki Progu Rentowności', unit: 'szt.', precision: 1 },
                { name: 'revenue', label: 'Przychód przy Progu Rentowności', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-punto-de-equilibrio',
            title: 'Calculadora de Punto de Equilibrio',
            h1: 'Calculadora de Punto de Equilibrio',
            meta_title: 'Calculadora de Punto de Equilibrio | Unidades e Ingresos para Cubrir Costes',
            meta_description: 'Calcula cuántas unidades necesitas vender — y los ingresos que representa — para cubrir tus costes fijos y variables y alcanzar el punto de equilibrio.',
            short_answer: 'Esta calculadora calcula tu punto de equilibrio — el número de unidades que necesitas vender (y los ingresos que representa) para que tu negocio cubra todos sus costes sin beneficio ni pérdida.',
            intro_text: '<p>El análisis del punto de equilibrio responde a una pregunta fundamental: ¿cuánto necesito vender antes de dejar de perder dinero? Divide tus costes fijos (alquiler, salarios) entre el margen de contribución por unidad (precio menos coste variable por unidad).</p><p><b>Los nuevos negocios en España</b> usan esto antes de fijar un precio, para comprobar si el volumen de ventas requerido es realista.</p>',
            key_points: [
                '<b>Fórmula:</b> Unidades de Equilibrio = Costes Fijos ÷ (Precio − Coste Variable por Unidad).',
                '<b>Margen de contribución:</b> Precio menos coste variable es lo que cada venta aporta para cubrir los costes fijos.',
                '<b>Más allá del equilibrio = beneficio:</b> Cada unidad vendida tras el punto de equilibrio aporta su margen completo directamente al beneficio.',
            ],
            howto: [
                { question: '¿Qué cuenta como coste fijo frente a coste variable?', answer: '<p>Los costes fijos no cambian con el volumen de ventas (alquiler, salarios); los variables aumentan con cada unidad vendida (materiales, embalaje).</p>' },
                { question: '¿Qué pasa si mi precio es menor que mi coste variable?', answer: '<p>Nunca podrás alcanzar el equilibrio en ese caso — cada venta pierde dinero sin importar el volumen.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Costes Fijos', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Precio por Unidad', type: 'number', unit: '€', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Coste Variable por Unidad', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '30' },
            ],
            outputs: [
                { name: 'units', label: 'Unidades de Equilibrio', unit: 'uds.', precision: 1 },
                { name: 'revenue', label: 'Ingresos en el Equilibrio', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-seuil-de-rentabilite',
            title: 'Calculateur de Seuil de Rentabilité',
            h1: 'Calculateur de Seuil de Rentabilité',
            meta_title: 'Calculateur de Seuil de Rentabilité | Unités et Revenu pour Couvrir les Coûts',
            meta_description: 'Calculez combien d’unités vous devez vendre — et le revenu que cela représente — pour couvrir vos coûts fixes et variables et atteindre le seuil de rentabilité.',
            short_answer: 'Ce calculateur calcule votre seuil de rentabilité — le nombre d’unités que vous devez vendre (et le revenu correspondant) pour que votre entreprise couvre tous ses coûts sans profit ni perte.',
            intro_text: '<p>L’analyse du seuil de rentabilité répond à une question fondamentale : combien dois-je vendre avant d’arrêter de perdre de l’argent ? Elle divise vos coûts fixes (loyer, salaires) par la marge sur coût variable par unité (prix moins coût variable par unité).</p><p><b>Les nouvelles entreprises en France</b> utilisent cela avant de fixer un prix, pour vérifier si le volume de ventes requis est réaliste.</p>',
            key_points: [
                '<b>Formule :</b> Unités du Seuil = Coûts Fixes ÷ (Prix − Coût Variable par Unité).',
                '<b>Marge sur coût variable :</b> Le prix moins le coût variable est ce que chaque vente apporte pour couvrir les coûts fixes.',
                '<b>Au-delà du seuil = profit :</b> Chaque unité vendue au-delà du seuil de rentabilité apporte sa marge complète directement au profit.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte comme coût fixe contre coût variable ?', answer: '<p>Les coûts fixes ne changent pas avec le volume des ventes (loyer, salaires) ; les variables augmentent avec chaque unité vendue (matériaux, emballage).</p>' },
                { question: 'Que faire si mon prix est inférieur à mon coût variable ?', answer: '<p>Vous ne pourrez jamais atteindre le seuil dans ce cas — chaque vente perd de l’argent quel que soit le volume.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Coûts Fixes', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Prix par Unité', type: 'number', unit: '€', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Coût Variable par Unité', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '30' },
            ],
            outputs: [
                { name: 'units', label: 'Unités du Seuil de Rentabilité', unit: 'unités', precision: 1 },
                { name: 'revenue', label: 'Revenu au Seuil de Rentabilité', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-punto-di-pareggio',
            title: 'Calcolatore del Punto di Pareggio',
            h1: 'Calcolatore del Punto di Pareggio',
            meta_title: 'Calcolatore Punto di Pareggio | Unità e Ricavi per Coprire i Costi',
            meta_description: 'Calcola quante unità devi vendere — e i ricavi che rappresenta — per coprire i costi fissi e variabili e raggiungere il punto di pareggio.',
            short_answer: 'Questo calcolatore calcola il tuo punto di pareggio — il numero di unità che devi vendere (e i ricavi corrispondenti) affinché la tua attività copra tutti i costi con zero profitto o perdita.',
            intro_text: '<p>L’analisi del punto di pareggio risponde a una domanda fondamentale: quanto devo vendere prima di smettere di perdere denaro? Divide i tuoi costi fissi (affitto, stipendi) per il margine di contribuzione per unità (prezzo meno costo variabile per unità).</p><p><b>Le nuove attività in Italia</b> usano questo prima di fissare un prezzo, per verificare se il volume di vendite richiesto è realistico.</p>',
            key_points: [
                '<b>Formula:</b> Unità di Pareggio = Costi Fissi ÷ (Prezzo − Costo Variabile per Unità).',
                '<b>Margine di contribuzione:</b> Prezzo meno costo variabile è ciò che ogni vendita contribuisce a coprire i costi fissi.',
                '<b>Oltre il pareggio = profitto:</b> Ogni unità venduta oltre il punto di pareggio contribuisce il suo margine completo direttamente al profitto.',
            ],
            howto: [
                { question: 'Cosa conta come costo fisso rispetto a costo variabile?', answer: '<p>I costi fissi non cambiano con il volume delle vendite (affitto, stipendi); i variabili aumentano con ogni unità venduta (materiali, imballaggio).</p>' },
                { question: 'Cosa succede se il mio prezzo è inferiore al mio costo variabile?', answer: '<p>Non potrai mai raggiungere il pareggio in quel caso — ogni vendita perde denaro indipendentemente dal volume.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Costi Fissi', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Prezzo per Unità', type: 'number', unit: '€', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Costo Variabile per Unità', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '30' },
            ],
            outputs: [
                { name: 'units', label: 'Unità di Pareggio', unit: 'unità', precision: 1 },
                { name: 'revenue', label: 'Ricavi al Pareggio', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'break-even-punkt-rechner',
            title: 'Break-Even-Punkt-Rechner',
            h1: 'Break-Even-Punkt-Rechner',
            meta_title: 'Break-Even-Rechner | Einheiten und Umsatz zur Kostendeckung',
            meta_description: 'Berechnen Sie, wie viele Einheiten Sie verkaufen müssen — und welcher Umsatz das entspricht —, um Ihre fixen und variablen Kosten zu decken und den Break-Even zu erreichen.',
            short_answer: 'Dieser Rechner berechnet Ihren Break-Even-Punkt — die Anzahl der Einheiten, die Sie verkaufen müssen (und den entsprechenden Umsatz), damit Ihr Unternehmen alle Kosten bei null Gewinn oder Verlust deckt.',
            intro_text: '<p>Die Break-Even-Analyse beantwortet eine grundlegende Frage: Wie viel muss ich verkaufen, um keine Verluste mehr zu machen? Sie teilt Ihre Fixkosten (Miete, Gehälter) durch den Deckungsbeitrag pro Einheit (Preis minus variable Kosten pro Einheit).</p><p><b>Neue Unternehmen in Deutschland</b> nutzen dies vor der Preisfestlegung, um zu prüfen, ob das erforderliche Verkaufsvolumen realistisch ist.</p>',
            key_points: [
                '<b>Formel:</b> Break-Even-Einheiten = Fixkosten ÷ (Preis − Variable Kosten pro Einheit).',
                '<b>Deckungsbeitrag:</b> Preis minus variable Kosten ist das, was jeder Verkauf zur Deckung der Fixkosten beiträgt.',
                '<b>Über dem Break-Even = Gewinn:</b> Jede über den Break-Even-Punkt hinaus verkaufte Einheit trägt ihre volle Marge direkt zum Gewinn bei.',
            ],
            howto: [
                { question: 'Was zählt als Fixkosten gegenüber variablen Kosten?', answer: '<p>Fixkosten bleiben unabhängig vom Verkaufsvolumen gleich (Miete, Gehälter); variable Kosten steigen mit jeder verkauften Einheit (Material, Verpackung).</p>' },
                { question: 'Was, wenn mein Preis niedriger als meine variablen Kosten ist?', answer: '<p>Dann können Sie nie den Break-Even erreichen — jeder Verkauf verliert unabhängig vom Volumen Geld.</p>' },
            ],
            inputs: [
                { name: 'fixed_costs', label: 'Fixkosten', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'price', label: 'Preis pro Einheit', type: 'number', unit: '€', min: 0.01, max: 10000000, placeholder: '50' },
                { name: 'variable_cost', label: 'Variable Kosten pro Einheit', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '30' },
            ],
            outputs: [
                { name: 'units', label: 'Break-Even-Einheiten', unit: 'Einheiten', precision: 1 },
                { name: 'revenue', label: 'Umsatz am Break-Even', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1048: Discount / Sale Price Calculator
// ============================================================
const discount: ToolDef = {
    id: '1048',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'original_price', default: 100 },
            { key: 'discount_pct', default: 20 },
        ],
        formulas: {
            final_price: 'original_price*(1-discount_pct/100)',
            savings: 'original_price*(discount_pct/100)',
        },
        outputs: [
            { key: 'final_price', precision: 2 },
            { key: 'savings', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'discount-sale-price-calculator',
            title: 'Discount / Sale Price Calculator',
            h1: 'Discount & Sale Price Calculator',
            meta_title: 'Discount Calculator | Final Price & Savings',
            meta_description: 'Calculate the final sale price and total savings from an original price and a discount percentage — for sellers pricing a promotion or shoppers checking a deal.',
            short_answer: 'This calculator applies a percentage discount to an original price to show you the final sale price and the exact amount saved.',
            intro_text: '<p>Whether you\'re a retailer setting up a sale campaign or a shopper verifying a "20% off" tag, this calculator does the same simple math: multiply the original price by the discount percentage to find the savings, then subtract to get the final price.</p><p><b>Retailers</b> use this to model promotions and confirm the resulting margin still works; <b>shoppers</b> use it to double-check advertised savings.</p>',
            key_points: [
                '<b>Formula:</b> Final Price = Original Price × (1 − Discount % ÷ 100).',
                '<b>Savings:</b> Original Price × (Discount % ÷ 100) — the amount taken off.',
                '<b>Stacking discounts:</b> Two sequential discounts (e.g. 20% then 10%) do NOT add to 30% off — they compound to 28% off. Apply this calculator twice, feeding the first result back in as the new original price.',
            ],
            howto: [
                { question: 'Does a 50% discount followed by a 50% discount make it free?', answer: '<p>No — discounts compound multiplicatively, not additively. 50% off, then 50% off the new price, leaves you paying 25% of the original price, not 0%.</p>' },
                { question: 'How do I calculate the discount percentage instead, if I know both prices?', answer: '<p>Discount % = (Original Price − Final Price) ÷ Original Price × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Original Price', type: 'number', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Discount', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
                currencyInput,
            ],
            outputs: [
                { name: 'final_price', label: 'Final Sale Price', unitFrom: 'currency', precision: 2 },
                { name: 'savings', label: 'You Save', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-skidki-i-tseny-so-skidkoy',
            title: 'Калькулятор скидки и цены со скидкой',
            h1: 'Калькулятор скидки и цены со скидкой',
            meta_title: 'Калькулятор скидки | Итоговая цена и экономия',
            meta_description: 'Рассчитайте итоговую цену продажи и общую экономию от первоначальной цены и процента скидки.',
            short_answer: 'Этот калькулятор применяет процентную скидку к первоначальной цене, показывая итоговую цену и точную сумму экономии.',
            intro_text: '<p>Продавец, настраивающий акцию, или покупатель, проверяющий ярлык "скидка 20%" — оба выполняют одну и ту же простую математику: умножить первоначальную цену на процент скидки, чтобы найти экономию, затем вычесть, чтобы получить итоговую цену.</p><p><b>Продавцы</b> используют это для моделирования акций; <b>покупатели</b> — для проверки заявленной экономии.</p>',
            key_points: [
                '<b>Формула:</b> Итоговая цена = Первоначальная цена × (1 − Скидка % ÷ 100).',
                '<b>Экономия:</b> Первоначальная цена × (Скидка % ÷ 100).',
                '<b>Суммирование скидок:</b> Две последовательные скидки (например, 20%, затем 10%) НЕ складываются в 30% — они дают 28% скидки. Примените калькулятор дважды.',
            ],
            howto: [
                { question: 'Скидка 50% плюс ещё 50% делает товар бесплатным?', answer: '<p>Нет — скидки перемножаются, а не складываются. 50%, затем ещё 50% от новой цены — это 25% от исходной цены, а не 0%.</p>' },
                { question: 'Как рассчитать процент скидки, если известны обе цены?', answer: '<p>Скидка % = (Первоначальная цена − Итоговая цена) ÷ Первоначальная цена × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Первоначальная цена', type: 'number', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Скидка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'final_price', label: 'Итоговая цена', unitFrom: 'currency', precision: 2 },
                { name: 'savings', label: 'Экономия', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'atlaides-un-parduosanas-cenas-kalkulators',
            title: 'Atlaides un Pārdošanas Cenas Kalkulators',
            h1: 'Atlaides un Pārdošanas Cenas Kalkulators',
            meta_title: 'Atlaides Kalkulators | Gala Cena un Ietaupījums',
            meta_description: 'Aprēķiniet gala pārdošanas cenu un kopējo ietaupījumu no sākotnējās cenas un atlaides procenta.',
            short_answer: 'Šis kalkulators piemēro procentuālu atlaidi sākotnējai cenai, lai parādītu gala pārdošanas cenu un precīzu ietaupīto summu.',
            intro_text: '<p>Mazumtirgotājs, kas veido akciju, vai pircējs, kas pārbauda "20% atlaide" uzlīmi — abi veic vienu un to pašu vienkāršo matemātiku.</p><p><b>Mazumtirgotāji</b> to izmanto akciju modelēšanai; <b>pircēji</b> — reklamētā ietaupījuma pārbaudei.</p>',
            key_points: [
                '<b>Formula:</b> Gala Cena = Sākotnējā Cena × (1 − Atlaide % ÷ 100).',
                '<b>Ietaupījums:</b> Sākotnējā Cena × (Atlaide % ÷ 100).',
                '<b>Atlaižu summēšana:</b> Divas secīgas atlaides (20%, tad 10%) NEsummējas 30% — tās dod 28% atlaidi kopā.',
            ],
            howto: [
                { question: 'Vai 50% atlaide plus vēl 50% padara preci bezmaksas?', answer: '<p>Nē — atlaides reizinās, nevis summējas. 50%, tad vēl 50% no jaunās cenas, atstāj 25% no sākotnējās cenas.</p>' },
                { question: 'Kā aprēķināt atlaides procentu, ja zinu abas cenas?', answer: '<p>Atlaide % = (Sākotnējā Cena − Gala Cena) ÷ Sākotnējā Cena × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Sākotnējā Cena', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Atlaide', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_price', label: 'Gala Pārdošanas Cena', unit: '€', precision: 2 },
                { name: 'savings', label: 'Jūs Ietaupāt', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-rabatu-i-ceny-promocyjnej',
            title: 'Kalkulator Rabatu i Ceny Promocyjnej',
            h1: 'Kalkulator Rabatu i Ceny Promocyjnej',
            meta_title: 'Kalkulator Rabatu | Cena Końcowa i Oszczędności',
            meta_description: 'Oblicz cenę końcową i całkowite oszczędności na podstawie ceny pierwotnej i procentu rabatu.',
            short_answer: 'Ten kalkulator stosuje rabat procentowy do ceny pierwotnej, pokazując cenę końcową i dokładną zaoszczędzoną kwotę.',
            intro_text: '<p>Sprzedawca ustawiający promocję lub kupujący sprawdzający metkę "20% rabatu" — oboje wykonują tę samą prostą matematykę.</p><p><b>Sprzedawcy</b> używają tego do modelowania promocji; <b>kupujący</b> — do weryfikacji reklamowanych oszczędności.</p>',
            key_points: [
                '<b>Wzór:</b> Cena Końcowa = Cena Pierwotna × (1 − Rabat % ÷ 100).',
                '<b>Oszczędności:</b> Cena Pierwotna × (Rabat % ÷ 100).',
                '<b>Sumowanie rabatów:</b> Dwa kolejne rabaty (20%, potem 10%) NIE sumują się do 30% — dają razem 28% rabatu.',
            ],
            howto: [
                { question: 'Czy rabat 50% plus kolejne 50% czyni produkt darmowym?', answer: '<p>Nie — rabaty mnożą się, a nie sumują. 50%, potem kolejne 50% z nowej ceny, to 25% ceny pierwotnej.</p>' },
                { question: 'Jak obliczyć procent rabatu, znając obie ceny?', answer: '<p>Rabat % = (Cena Pierwotna − Cena Końcowa) ÷ Cena Pierwotna × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Cena Pierwotna', type: 'number', unit: 'zł', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Rabat', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_price', label: 'Cena Końcowa', unit: 'zł', precision: 2 },
                { name: 'savings', label: 'Oszczędzasz', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-descuento-y-precio-de-oferta',
            title: 'Calculadora de Descuento y Precio de Oferta',
            h1: 'Calculadora de Descuento y Precio de Oferta',
            meta_title: 'Calculadora de Descuentos | Precio Final y Ahorro',
            meta_description: 'Calcula el precio final de venta y el ahorro total a partir del precio original y un porcentaje de descuento.',
            short_answer: 'Esta calculadora aplica un descuento porcentual a un precio original para mostrarte el precio final y la cantidad exacta ahorrada.',
            intro_text: '<p>Ya seas un comercio en España organizando una campaña de rebajas o un comprador verificando una etiqueta de "20% de descuento", esta calculadora hace las mismas cuentas simples.</p><p><b>Los comercios</b> lo usan para modelar promociones; <b>los compradores</b>, para comprobar el ahorro anunciado.</p>',
            key_points: [
                '<b>Fórmula:</b> Precio Final = Precio Original × (1 − Descuento % ÷ 100).',
                '<b>Ahorro:</b> Precio Original × (Descuento % ÷ 100).',
                '<b>Descuentos acumulados:</b> Dos descuentos sucesivos (20%, luego 10%) NO suman 30% — se combinan en un 28% de descuento total.',
            ],
            howto: [
                { question: '¿Un 50% de descuento seguido de otro 50% hace el producto gratis?', answer: '<p>No — los descuentos se multiplican, no se suman. 50%, luego otro 50% sobre el nuevo precio, deja pagando el 25% del precio original.</p>' },
                { question: '¿Cómo calculo el porcentaje de descuento si conozco ambos precios?', answer: '<p>Descuento % = (Precio Original − Precio Final) ÷ Precio Original × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Precio Original', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Descuento', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_price', label: 'Precio Final', unit: '€', precision: 2 },
                { name: 'savings', label: 'Ahorras', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-remise-et-prix-solde',
            title: 'Calculateur de Remise et Prix Soldé',
            h1: 'Calculateur de Remise et Prix Soldé',
            meta_title: 'Calculateur de Remise | Prix Final et Économies',
            meta_description: 'Calculez le prix de vente final et les économies totales à partir du prix d’origine et d’un pourcentage de remise.',
            short_answer: 'Ce calculateur applique une remise en pourcentage à un prix d’origine pour vous montrer le prix final et le montant exact économisé.',
            intro_text: '<p>Que vous soyez un commerçant en France organisant des soldes ou un acheteur vérifiant une étiquette « 20% de remise », ce calculateur fait le même calcul simple.</p><p><b>Les commerçants</b> l’utilisent pour modéliser des promotions ; <b>les acheteurs</b>, pour vérifier les économies annoncées.</p>',
            key_points: [
                '<b>Formule :</b> Prix Final = Prix d’Origine × (1 − Remise % ÷ 100).',
                '<b>Économies :</b> Prix d’Origine × (Remise % ÷ 100).',
                '<b>Cumul des remises :</b> Deux remises successives (20 %, puis 10 %) ne s’additionnent PAS à 30 % — elles se combinent pour 28 % de remise totale.',
            ],
            howto: [
                { question: 'Une remise de 50 % suivie d’une autre de 50 % rend-elle le produit gratuit ?', answer: '<p>Non — les remises se multiplient, elles ne s’additionnent pas. 50 %, puis encore 50 % sur le nouveau prix, laisse payer 25 % du prix d’origine.</p>' },
                { question: 'Comment calculer le pourcentage de remise si je connais les deux prix ?', answer: '<p>Remise % = (Prix d’Origine − Prix Final) ÷ Prix d’Origine × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Prix d’Origine', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Remise', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_price', label: 'Prix Final', unit: '€', precision: 2 },
                { name: 'savings', label: 'Vous Économisez', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-sconto-e-prezzo-di-vendita',
            title: 'Calcolatore Sconto e Prezzo di Vendita',
            h1: 'Calcolatore Sconto e Prezzo di Vendita',
            meta_title: 'Calcolatore Sconto | Prezzo Finale e Risparmio',
            meta_description: 'Calcola il prezzo finale di vendita e il risparmio totale a partire dal prezzo originale e da una percentuale di sconto.',
            short_answer: 'Questo calcolatore applica uno sconto percentuale a un prezzo originale per mostrarti il prezzo finale e l’importo esatto risparmiato.',
            intro_text: '<p>Che tu sia un negoziante in Italia che organizza una promozione o un cliente che verifica un cartellino "20% di sconto", questo calcolatore fa lo stesso semplice calcolo.</p><p><b>I negozianti</b> lo usano per modellare le promozioni; <b>i clienti</b>, per verificare il risparmio pubblicizzato.</p>',
            key_points: [
                '<b>Formula:</b> Prezzo Finale = Prezzo Originale × (1 − Sconto % ÷ 100).',
                '<b>Risparmio:</b> Prezzo Originale × (Sconto % ÷ 100).',
                '<b>Sconti cumulativi:</b> Due sconti successivi (20%, poi 10%) NON si sommano al 30% — si combinano in uno sconto totale del 28%.',
            ],
            howto: [
                { question: 'Uno sconto del 50% seguito da un altro 50% rende il prodotto gratuito?', answer: '<p>No — gli sconti si moltiplicano, non si sommano. 50%, poi un altro 50% sul nuovo prezzo, lascia pagare il 25% del prezzo originale.</p>' },
                { question: 'Come calcolo la percentuale di sconto se conosco entrambi i prezzi?', answer: '<p>Sconto % = (Prezzo Originale − Prezzo Finale) ÷ Prezzo Originale × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Prezzo Originale', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Sconto', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_price', label: 'Prezzo Finale', unit: '€', precision: 2 },
                { name: 'savings', label: 'Risparmi', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'rabatt-und-verkaufspreis-rechner',
            title: 'Rabatt- und Verkaufspreis-Rechner',
            h1: 'Rabatt- und Verkaufspreis-Rechner',
            meta_title: 'Rabattrechner | Endpreis und Ersparnis',
            meta_description: 'Berechnen Sie den endgültigen Verkaufspreis und die Gesamtersparnis aus einem Originalpreis und einem Rabattprozentsatz.',
            short_answer: 'Dieser Rechner wendet einen prozentualen Rabatt auf einen Originalpreis an, um Ihnen den Endpreis und den genauen Sparbetrag zu zeigen.',
            intro_text: '<p>Ob Sie ein Einzelhändler in Deutschland sind, der eine Aktion plant, oder ein Käufer, der ein "20% Rabatt"-Schild überprüft — dieser Rechner macht die gleiche einfache Mathematik.</p><p><b>Einzelhändler</b> nutzen dies, um Aktionen zu modellieren; <b>Käufer</b>, um beworbene Ersparnisse zu überprüfen.</p>',
            key_points: [
                '<b>Formel:</b> Endpreis = Originalpreis × (1 − Rabatt % ÷ 100).',
                '<b>Ersparnis:</b> Originalpreis × (Rabatt % ÷ 100).',
                '<b>Kombinierte Rabatte:</b> Zwei aufeinanderfolgende Rabatte (20%, dann 10%) ergeben KEINE 30% — sie kombinieren sich zu 28% Gesamtrabatt.',
            ],
            howto: [
                { question: 'Macht ein Rabatt von 50% gefolgt von weiteren 50% das Produkt kostenlos?', answer: '<p>Nein — Rabatte multiplizieren sich, sie addieren sich nicht. 50%, dann weitere 50% auf den neuen Preis, bedeutet, dass Sie 25% des Originalpreises zahlen.</p>' },
                { question: 'Wie berechne ich den Rabattprozentsatz, wenn ich beide Preise kenne?', answer: '<p>Rabatt % = (Originalpreis − Endpreis) ÷ Originalpreis × 100.</p>' },
            ],
            inputs: [
                { name: 'original_price', label: 'Originalpreis', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '100' },
                { name: 'discount_pct', label: 'Rabatt', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_price', label: 'Endpreis', unit: '€', precision: 2 },
                { name: 'savings', label: 'Sie Sparen', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1049: VAT / Sales Tax Calculator (per-locale VAT rate defaults)
// ============================================================
const vat: ToolDef = {
    id: '1049',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'net_price', default: 100 },
            { key: 'vat_rate', default: 20 },
        ],
        formulas: {
            vat_amount: 'net_price*(vat_rate/100)',
            gross_price: 'net_price*(1+vat_rate/100)',
        },
        outputs: [
            { key: 'vat_amount', precision: 2 },
            { key: 'gross_price', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'vat-sales-tax-calculator',
            title: 'VAT / Sales Tax Calculator',
            h1: 'VAT / Sales Tax Calculator',
            meta_title: 'VAT Calculator | Add Tax to a Net Price',
            meta_description: 'Calculate the VAT (or sales tax) amount and the final gross price from a net price and a tax rate — set your own local rate.',
            short_answer: 'This calculator adds VAT (value-added tax) or sales tax to a net (pre-tax) price to show you the tax amount and the final gross price the customer pays.',
            intro_text: '<p>VAT rates vary widely by country — the default here is set to 20%, a common general rate, but you should replace it with your own jurisdiction\'s rate before relying on the result. This is a forward tax calculation: you know the net price and want the tax and gross price.</p><p><b>Businesses</b> use this to quote gross prices to consumers from a net cost basis; <b>freelancers and sellers</b> use it to work out how much tax to add to an invoice.</p>',
            key_points: [
                '<b>Formula:</b> VAT Amount = Net Price × (VAT Rate ÷ 100); Gross Price = Net Price × (1 + VAT Rate ÷ 100).',
                '<b>Rates vary by country and product:</b> many countries apply a reduced rate to essentials (food, books, medicine) and a standard rate to everything else — check your local tax authority for the exact rate that applies.',
                '<b>Going the other way?</b> If you have a gross (tax-included) price and need to extract the net price, use our Reverse VAT Calculator instead.',
            ],
            howto: [
                { question: 'What\'s the difference between VAT and US sales tax?', answer: '<p>VAT is collected incrementally at each stage of production and is included in the shelf price in most countries; US sales tax is added only at the final point of sale and is usually shown separately at checkout. The arithmetic here works the same way for both once you know the applicable rate.</p>' },
                { question: 'Should I use the standard or reduced VAT rate?', answer: '<p>That depends on the product/service category in your jurisdiction — many countries reduce VAT for food, books, or medical goods. Check your local rate before finalizing pricing.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Net Price (before tax)', type: 'number', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'VAT / Tax Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
                currencyInput,
            ],
            outputs: [
                { name: 'vat_amount', label: 'Tax Amount', unitFrom: 'currency', precision: 2 },
                { name: 'gross_price', label: 'Gross Price (with tax)', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-nds',
            title: 'Калькулятор НДС',
            h1: 'Калькулятор НДС',
            meta_title: 'Калькулятор НДС | Добавление налога к цене без НДС',
            meta_description: 'Рассчитайте сумму НДС и итоговую цену с учётом налога по цене без НДС и налоговой ставке — укажите свою локальную ставку.',
            short_answer: 'Этот калькулятор добавляет НДС к цене без налога, показывая сумму налога и итоговую цену с учётом НДС, которую платит покупатель.',
            intro_text: '<p>Ставки НДС сильно различаются по странам — по умолчанию здесь установлено 20% (частая базовая ставка), но замените её на актуальную ставку своей юрисдикции перед использованием результата.</p><p><b>Бизнес</b> использует это, чтобы указать цену с налогом для потребителей на основе цены без налога; <b>фрилансеры и продавцы</b> — чтобы рассчитать, сколько налога добавить в счёт.</p>',
            key_points: [
                '<b>Формула:</b> Сумма НДС = Цена без НДС × (Ставка НДС ÷ 100); Цена с НДС = Цена без НДС × (1 + Ставка НДС ÷ 100).',
                '<b>Ставки различаются по странам и товарам:</b> во многих странах действует пониженная ставка на товары первой необходимости.',
                '<b>Обратная задача?</b> Если у вас есть цена с НДС и нужно выделить цену без налога, используйте наш калькулятор обратного НДС.',
            ],
            howto: [
                { question: 'В чём разница между НДС и налогом с продаж США?', answer: '<p>НДС собирается поэтапно на каждом этапе производства и обычно включён в цену на полке; налог с продаж в США добавляется только в момент продажи и обычно показывается отдельно на кассе.</p>' },
                { question: 'Использовать стандартную или пониженную ставку НДС?', answer: '<p>Это зависит от категории товара/услуги в вашей юрисдикции — многие страны снижают НДС на продукты питания, книги или медицинские товары.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Цена без налога', type: 'number', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'Ставка НДС', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
                currencyInputRu,
            ],
            outputs: [
                { name: 'vat_amount', label: 'Сумма налога', unitFrom: 'currency', precision: 2 },
                { name: 'gross_price', label: 'Цена с налогом', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'pvn-kalkulators',
            title: 'PVN Kalkulators',
            h1: 'PVN Kalkulators',
            meta_title: 'PVN Kalkulators | Pievienot Nodokli Cenai bez PVN',
            meta_description: 'Aprēķiniet PVN summu un gala cenu ar PVN no cenas bez PVN — noklusējuma likme atbilst Latvijas standarta PVN likmei 21%.',
            short_answer: 'Šis kalkulators pievieno PVN cenai bez nodokļa, lai parādītu nodokļa summu un gala cenu ar PVN, ko maksā klients.',
            intro_text: '<p>Latvijā standarta PVN likme ir 21%, tāpēc tas ir šī kalkulatora noklusējums — bet dažām precēm un pakalpojumiem (piemēram, grāmatām, medikamentiem) piemēro samazinātu likmi, tāpēc pārbaudiet savu konkrēto gadījumu.</p><p><b>Uzņēmumi</b> to izmanto, lai norādītu klientiem cenu ar nodokli; <b>pašnodarbinātie un pārdevēji</b> — lai aprēķinātu, cik nodokļa pievienot rēķinam.</p>',
            key_points: [
                '<b>Formula:</b> PVN Summa = Cena bez PVN × (PVN Likme ÷ 100); Cena ar PVN = Cena bez PVN × (1 + PVN Likme ÷ 100).',
                '<b>Latvijas standarta likme ir 21%</b>, bet samazinātā likme (12% vai 5%) attiecas uz noteiktām precēm/pakalpojumiem — pārbaudiet VID noteikumus.',
                '<b>Pretēja aprēķina gadījumā</b> — ja jums ir cena ar PVN un jāizdala cena bez PVN, izmantojiet mūsu Apgrieztā PVN Kalkulatoru.',
            ],
            howto: [
                { question: 'Kāda ir samazinātā PVN likme Latvijā?', answer: '<p>Latvijā ir divas samazinātas likmes — 12% (piemēram, medikamentiem, viesnīcu pakalpojumiem) un 5% (dažiem pārtikas produktiem un grāmatām) — papildus standarta 21% likmei.</p>' },
                { question: 'Kā aprēķināt cenu bez PVN, ja zinu cenu ar PVN?', answer: '<p>Izmantojiet Apgrieztā PVN Kalkulatoru — dalot ar (1 + likme/100) nevis reizinot.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Cena bez PVN', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'PVN Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '21', default: 21 },
            ],
            outputs: [
                { name: 'vat_amount', label: 'PVN Summa', unit: '€', precision: 2 },
                { name: 'gross_price', label: 'Cena ar PVN', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-vat',
            title: 'Kalkulator VAT',
            h1: 'Kalkulator VAT',
            meta_title: 'Kalkulator VAT | Doliczanie Podatku do Ceny Netto',
            meta_description: 'Oblicz kwotę VAT i cenę brutto na podstawie ceny netto — domyślna stawka odpowiada polskiej standardowej stawce VAT 23%.',
            short_answer: 'Ten kalkulator dolicza VAT do ceny netto, pokazując kwotę podatku i cenę brutto płaconą przez klienta.',
            intro_text: '<p>W Polsce standardowa stawka VAT wynosi 23%, dlatego jest to domyślna wartość tego kalkulatora — jednak niektóre towary i usługi (np. książki, żywność) mają obniżoną stawkę, więc sprawdź swój konkretny przypadek.</p><p><b>Firmy</b> używają tego, aby podać klientom cenę z podatkiem; <b>freelancerzy i sprzedawcy</b> — aby obliczyć, ile VAT doliczyć do faktury.</p>',
            key_points: [
                '<b>Wzór:</b> Kwota VAT = Cena Netto × (Stawka VAT ÷ 100); Cena Brutto = Cena Netto × (1 + Stawka VAT ÷ 100).',
                '<b>Polska standardowa stawka to 23%</b>, ale obniżone stawki (8% lub 5%) dotyczą określonych towarów/usług — sprawdź przepisy podatkowe.',
                '<b>Odwrotny przypadek?</b> Jeśli masz cenę brutto i chcesz wyodrębnić cenę netto, użyj naszego Kalkulatora Odwrotnego VAT.',
            ],
            howto: [
                { question: 'Jaka jest obniżona stawka VAT w Polsce?', answer: '<p>Polska ma obniżone stawki 8% i 5% (np. dla żywności, książek) oprócz standardowej stawki 23%.</p>' },
                { question: 'Jak obliczyć cenę netto, jeśli znam cenę brutto?', answer: '<p>Użyj Kalkulatora Odwrotnego VAT — dzieląc przez (1 + stawka/100) zamiast mnożyć.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Cena Netto', type: 'number', unit: 'zł', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'Stawka VAT', type: 'number', unit: '%', min: 0, max: 100, placeholder: '23', default: 23 },
            ],
            outputs: [
                { name: 'vat_amount', label: 'Kwota VAT', unit: 'zł', precision: 2 },
                { name: 'gross_price', label: 'Cena Brutto', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-iva',
            title: 'Calculadora de IVA',
            h1: 'Calculadora de IVA',
            meta_title: 'Calculadora de IVA | Añadir Impuesto a un Precio sin IVA',
            meta_description: 'Calcula el importe del IVA y el precio final con impuesto a partir de un precio sin IVA — la tasa por defecto corresponde al tipo general español del 21%.',
            short_answer: 'Esta calculadora añade el IVA a un precio sin impuesto para mostrarte el importe del impuesto y el precio final con IVA que paga el cliente.',
            intro_text: '<p>En España el tipo general de IVA es del 21%, por eso es el valor por defecto de esta calculadora — aunque algunos productos y servicios (alimentos básicos, libros, medicamentos) tienen un tipo reducido (10% o 4%), así que comprueba tu caso concreto.</p><p><b>Las empresas</b> usan esto para indicar precios con impuesto a los clientes; <b>autónomos y vendedores</b>, para calcular cuánto IVA añadir a una factura.</p>',
            key_points: [
                '<b>Fórmula:</b> Importe de IVA = Precio sin IVA × (Tipo de IVA ÷ 100); Precio con IVA = Precio sin IVA × (1 + Tipo de IVA ÷ 100).',
                '<b>El tipo general en España es del 21%</b>, con tipos reducidos del 10% y superreducido del 4% para ciertos productos — consulta la normativa de la Agencia Tributaria.',
                '<b>¿Caso inverso?</b> Si tienes un precio con IVA y necesitas extraer el precio sin IVA, usa nuestra Calculadora de IVA Inverso.',
            ],
            howto: [
                { question: '¿Cuál es el tipo reducido de IVA en España?', answer: '<p>España tiene un tipo reducido del 10% (por ejemplo, hostelería, transporte) y un superreducido del 4% (alimentos básicos, libros, medicamentos), además del tipo general del 21%.</p>' },
                { question: '¿Cómo calculo el precio sin IVA si conozco el precio con IVA?', answer: '<p>Usa nuestra Calculadora de IVA Inverso — dividiendo entre (1 + tipo/100) en lugar de multiplicar.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Precio sin IVA', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'Tipo de IVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '21', default: 21 },
            ],
            outputs: [
                { name: 'vat_amount', label: 'Importe de IVA', unit: '€', precision: 2 },
                { name: 'gross_price', label: 'Precio con IVA', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-tva',
            title: 'Calculateur de TVA',
            h1: 'Calculateur de TVA',
            meta_title: 'Calculateur de TVA | Ajouter la Taxe à un Prix HT',
            meta_description: 'Calculez le montant de la TVA et le prix final TTC à partir d’un prix HT — le taux par défaut correspond au taux normal français de 20%.',
            short_answer: 'Ce calculateur ajoute la TVA à un prix hors taxe pour vous montrer le montant de la taxe et le prix TTC final payé par le client.',
            intro_text: '<p>En France, le taux normal de TVA est de 20 %, c’est donc la valeur par défaut de ce calculateur — mais certains produits et services (alimentation, livres, énergie) bénéficient de taux réduits (10 %, 5,5 % ou 2,1 %), vérifiez donc votre cas précis.</p><p><b>Les entreprises</b> l’utilisent pour indiquer des prix TTC aux clients ; <b>les indépendants et vendeurs</b>, pour calculer la TVA à ajouter sur une facture.</p>',
            key_points: [
                '<b>Formule :</b> Montant TVA = Prix HT × (Taux TVA ÷ 100) ; Prix TTC = Prix HT × (1 + Taux TVA ÷ 100).',
                '<b>Le taux normal en France est de 20 %</b>, avec des taux réduits de 10 %, 5,5 % et 2,1 % selon les produits — vérifiez la réglementation fiscale.',
                '<b>Cas inverse ?</b> Si vous avez un prix TTC et devez en extraire le prix HT, utilisez notre Calculateur de TVA Inversée.',
            ],
            howto: [
                { question: 'Quel est le taux réduit de TVA en France ?', answer: '<p>La France a des taux réduits de 10 % (restauration, transport), 5,5 % (produits alimentaires de base, livres) et 2,1 % (médicaments remboursables), en plus du taux normal de 20 %.</p>' },
                { question: 'Comment calculer le prix HT si je connais le prix TTC ?', answer: '<p>Utilisez notre Calculateur de TVA Inversée — en divisant par (1 + taux/100) plutôt qu’en multipliant.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Prix HT', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'Taux de TVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
            ],
            outputs: [
                { name: 'vat_amount', label: 'Montant TVA', unit: '€', precision: 2 },
                { name: 'gross_price', label: 'Prix TTC', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-iva',
            title: 'Calcolatore IVA',
            h1: 'Calcolatore IVA',
            meta_title: 'Calcolatore IVA | Aggiungere l’Imposta a un Prezzo Netto',
            meta_description: 'Calcola l’importo IVA e il prezzo finale lordo a partire da un prezzo netto — l’aliquota predefinita corrisponde all’aliquota ordinaria italiana del 22%.',
            short_answer: 'Questo calcolatore aggiunge l’IVA a un prezzo netto per mostrarti l’importo dell’imposta e il prezzo lordo finale pagato dal cliente.',
            intro_text: '<p>In Italia l’aliquota IVA ordinaria è del 22%, quindi è il valore predefinito di questo calcolatore — ma alcuni beni e servizi (alimentari, libri, alcuni farmaci) hanno aliquote ridotte (10% o 4%), quindi verifica il tuo caso specifico.</p><p><b>Le aziende</b> lo usano per indicare prezzi con imposta ai clienti; <b>liberi professionisti e venditori</b>, per calcolare quanta IVA aggiungere a una fattura.</p>',
            key_points: [
                '<b>Formula:</b> Importo IVA = Prezzo Netto × (Aliquota IVA ÷ 100); Prezzo Lordo = Prezzo Netto × (1 + Aliquota IVA ÷ 100).',
                '<b>L’aliquota ordinaria in Italia è del 22%</b>, con aliquote ridotte del 10% e del 4% per determinati beni — verifica la normativa fiscale.',
                '<b>Caso inverso?</b> Se hai un prezzo lordo e devi estrarre il prezzo netto, usa il nostro Calcolatore IVA Inversa.',
            ],
            howto: [
                { question: 'Qual è l’aliquota IVA ridotta in Italia?', answer: '<p>L’Italia ha aliquote ridotte del 10% (ad esempio alberghi, alcuni alimenti) e del 4% (beni di prima necessità, alcuni libri), oltre all’aliquota ordinaria del 22%.</p>' },
                { question: 'Come calcolo il prezzo netto se conosco il prezzo lordo?', answer: '<p>Usa il nostro Calcolatore IVA Inversa — dividendo per (1 + aliquota/100) anziché moltiplicare.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Prezzo Netto', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'Aliquota IVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '22', default: 22 },
            ],
            outputs: [
                { name: 'vat_amount', label: 'Importo IVA', unit: '€', precision: 2 },
                { name: 'gross_price', label: 'Prezzo Lordo', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'mehrwertsteuer-rechner',
            title: 'Mehrwertsteuer-Rechner',
            h1: 'Mehrwertsteuer-Rechner',
            meta_title: 'MwSt-Rechner | Steuer zu einem Nettopreis Hinzufügen',
            meta_description: 'Berechnen Sie den Mehrwertsteuerbetrag und den Bruttopreis aus einem Nettopreis — der Standardsatz entspricht dem deutschen Regelsteuersatz von 19%.',
            short_answer: 'Dieser Rechner fügt die Mehrwertsteuer zu einem Nettopreis hinzu, um Ihnen den Steuerbetrag und den endgültigen Bruttopreis zu zeigen, den der Kunde zahlt.',
            intro_text: '<p>In Deutschland beträgt der reguläre Mehrwertsteuersatz 19%, daher ist dies der Standardwert dieses Rechners — einige Waren und Dienstleistungen (Lebensmittel, Bücher) unterliegen jedoch dem ermäßigten Satz von 7%, prüfen Sie also Ihren konkreten Fall.</p><p><b>Unternehmen</b> nutzen dies, um Kunden Bruttopreise zu nennen; <b>Freiberufler und Verkäufer</b>, um zu berechnen, wie viel MwSt. einer Rechnung hinzuzufügen ist.</p>',
            key_points: [
                '<b>Formel:</b> MwSt-Betrag = Nettopreis × (MwSt-Satz ÷ 100); Bruttopreis = Nettopreis × (1 + MwSt-Satz ÷ 100).',
                '<b>Der Regelsatz in Deutschland beträgt 19%</b>, mit einem ermäßigten Satz von 7% für bestimmte Waren — prüfen Sie die Steuervorschriften.',
                '<b>Umgekehrter Fall?</b> Wenn Sie einen Bruttopreis haben und den Nettopreis herausrechnen müssen, nutzen Sie unseren Umgekehrten-MwSt-Rechner.',
            ],
            howto: [
                { question: 'Wie hoch ist der ermäßigte MwSt-Satz in Deutschland?', answer: '<p>Deutschland hat einen ermäßigten Satz von 7% (z.B. Lebensmittel, Bücher, Zeitungen) zusätzlich zum Regelsatz von 19%.</p>' },
                { question: 'Wie berechne ich den Nettopreis, wenn ich den Bruttopreis kenne?', answer: '<p>Nutzen Sie unseren Umgekehrten-MwSt-Rechner — teilen Sie durch (1 + Satz/100) statt zu multiplizieren.</p>' },
            ],
            inputs: [
                { name: 'net_price', label: 'Nettopreis', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '100' },
                { name: 'vat_rate', label: 'MwSt-Satz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '19', default: 19 },
            ],
            outputs: [
                { name: 'vat_amount', label: 'MwSt-Betrag', unit: '€', precision: 2 },
                { name: 'gross_price', label: 'Bruttopreis', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1050: Reverse VAT Calculator (per-locale VAT rate defaults)
// ============================================================
const reverseVat: ToolDef = {
    id: '1050',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'gross_price', default: 119 },
            { key: 'vat_rate', default: 19 },
        ],
        formulas: {
            net_price: 'gross_price/(1+vat_rate/100)',
            vat_amount: 'gross_price - gross_price/(1+vat_rate/100)',
        },
        outputs: [
            { key: 'net_price', precision: 2 },
            { key: 'vat_amount', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'reverse-vat-calculator',
            title: 'Reverse VAT Calculator',
            h1: 'Reverse VAT Calculator',
            meta_title: 'Reverse VAT Calculator | Extract Net Price from Gross',
            meta_description: 'Extract the net (pre-tax) price and the VAT amount from a gross (tax-included) price — for when you know the total and need to back out the tax.',
            short_answer: 'This calculator extracts the net price and the VAT amount from a gross price that already includes tax — the reverse of adding VAT.',
            intro_text: '<p>If you know only the final price a customer paid (tax included) and need to know how much of that was tax versus the underlying net price, this calculator does that in one step, dividing by (1 + rate ÷ 100) instead of multiplying.</p><p><b>Accountants and bookkeepers</b> use this constantly to reconstruct net revenue from gross receipts; <b>shoppers</b> use it to see how much tax was embedded in a purchase.</p>',
            key_points: [
                '<b>Formula:</b> Net Price = Gross Price ÷ (1 + VAT Rate ÷ 100).',
                '<b>Common mistake:</b> you cannot get the net price by simply subtracting the tax percentage from the gross price (e.g. gross × 0.81 for 19% VAT) — that overstates the deduction. You must divide, not multiply by (1 − rate).',
                '<b>Going the other way?</b> If you have a net price and need to add tax, use our VAT / Sales Tax Calculator instead.',
            ],
            howto: [
                { question: 'Why can\'t I just subtract the tax percentage from the gross price?', answer: '<p>Because the tax rate applies to the net price, not the gross price. Subtracting 19% from a gross price removes too much — you must divide by 1.19 instead, which is mathematically different from multiplying by 0.81.</p>' },
                { question: 'What rate should I use?', answer: '<p>Use the VAT/sales tax rate that was actually applied to the original transaction — check the invoice or receipt if unsure.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Gross Price (tax included)', type: 'number', min: 0, max: 1000000000, placeholder: '119' },
                { name: 'vat_rate', label: 'VAT / Tax Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
                currencyInput,
            ],
            outputs: [
                { name: 'net_price', label: 'Net Price (before tax)', unitFrom: 'currency', precision: 2 },
                { name: 'vat_amount', label: 'Tax Amount', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-obratnogo-nds',
            title: 'Калькулятор обратного НДС',
            h1: 'Калькулятор обратного НДС',
            meta_title: 'Калькулятор обратного НДС | Выделение цены без налога из цены с НДС',
            meta_description: 'Выделите цену без налога и сумму НДС из цены, уже включающей налог — когда известна итоговая сумма и нужно вычленить налог.',
            short_answer: 'Этот калькулятор выделяет цену без налога и сумму НДС из цены, уже включающей налог — обратная операция к добавлению НДС.',
            intro_text: '<p>Если вы знаете только итоговую цену, которую заплатил покупатель (с учётом налога), и нужно узнать, сколько из этого — налог, а сколько — цена без налога, этот калькулятор делает это за один шаг, деля на (1 + ставка ÷ 100) вместо умножения.</p><p><b>Бухгалтеры</b> постоянно используют это для восстановления чистой выручки из валовых поступлений; <b>покупатели</b> — чтобы увидеть, сколько налога было заложено в покупку.</p>',
            key_points: [
                '<b>Формула:</b> Цена без налога = Цена с НДС ÷ (1 + Ставка НДС ÷ 100).',
                '<b>Частая ошибка:</b> нельзя получить цену без налога простым вычитанием процента налога из цены с НДС — это завышает вычет. Нужно делить, а не умножать на (1 − ставка).',
                '<b>Обратная задача?</b> Если у вас есть цена без налога и нужно добавить налог, используйте наш калькулятор НДС.',
            ],
            howto: [
                { question: 'Почему нельзя просто вычесть процент налога из цены с НДС?', answer: '<p>Потому что ставка налога применяется к цене без налога, а не к цене с НДС. Вычитание 19% из цены с НДС убирает слишком много — нужно делить на 1.19, а не умножать на 0.81.</p>' },
                { question: 'Какую ставку использовать?', answer: '<p>Используйте ставку НДС, которая фактически применялась к исходной транзакции — проверьте счёт или чек, если не уверены.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Цена с налогом', type: 'number', min: 0, max: 1000000000, placeholder: '119' },
                { name: 'vat_rate', label: 'Ставка НДС', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
                currencyInputRu,
            ],
            outputs: [
                { name: 'net_price', label: 'Цена без налога', unitFrom: 'currency', precision: 2 },
                { name: 'vat_amount', label: 'Сумма налога', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'apgrieztais-pvn-kalkulators',
            title: 'Apgrieztais PVN Kalkulators',
            h1: 'Apgrieztais PVN Kalkulators',
            meta_title: 'Apgrieztais PVN Kalkulators | Izdalīt Cenu bez PVN no Cenas ar PVN',
            meta_description: 'Izdaliet cenu bez nodokļa un PVN summu no cenas, kas jau ietver nodokli — noklusējuma likme atbilst Latvijas standarta PVN likmei 21%.',
            short_answer: 'Šis kalkulators izdala cenu bez nodokļa un PVN summu no cenas, kas jau ietver nodokli — pretēja darbība PVN pievienošanai.',
            intro_text: '<p>Ja zināt tikai gala cenu, ko klients samaksāja (ar nodokli), un jāzina, cik daudz no tā ir nodoklis, šis kalkulators to izdara vienā solī, dalot ar (1 + likme ÷ 100) nevis reizinot.</p><p><b>Grāmatveži</b> to pastāvīgi izmanto, lai atjaunotu neto ieņēmumus no bruto ieņēmumiem; <b>pircēji</b> — lai redzētu, cik daudz nodokļa bija iekļauts pirkumā.</p>',
            key_points: [
                '<b>Formula:</b> Cena bez PVN = Cena ar PVN ÷ (1 + PVN Likme ÷ 100).',
                '<b>Bieža kļūda:</b> nevar iegūt cenu bez PVN, vienkārši atņemot nodokļa procentu no cenas ar PVN — tas pārāk lielu daļu atskaita. Jādala, nevis jāreizina ar (1 − likme).',
                '<b>Pretēja aprēķina gadījumā?</b> Ja jums ir cena bez PVN un jāpievieno nodoklis, izmantojiet mūsu PVN Kalkulatoru.',
            ],
            howto: [
                { question: 'Kāpēc nevar vienkārši atņemt nodokļa procentu no cenas ar PVN?', answer: '<p>Jo nodokļa likme tiek piemērota cenai bez PVN, nevis cenai ar PVN. 19% atņemšana no cenas ar PVN noņem pārāk daudz — jādala ar 1.19, nevis jāreizina ar 0.81.</p>' },
                { question: 'Kādu likmi izmantot?', answer: '<p>Izmantojiet PVN likmi, kas faktiski tika piemērota sākotnējam darījumam — pārbaudiet rēķinu vai čeku, ja neesat pārliecināts.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Cena ar PVN', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '121' },
                { name: 'vat_rate', label: 'PVN Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '21', default: 21 },
            ],
            outputs: [
                { name: 'net_price', label: 'Cena bez PVN', unit: '€', precision: 2 },
                { name: 'vat_amount', label: 'PVN Summa', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-odwrotnego-vat',
            title: 'Kalkulator Odwrotnego VAT',
            h1: 'Kalkulator Odwrotnego VAT',
            meta_title: 'Kalkulator Odwrotnego VAT | Wyodrębnienie Ceny Netto z Ceny Brutto',
            meta_description: 'Wyodrębnij cenę netto i kwotę VAT z ceny brutto — domyślna stawka odpowiada polskiej standardowej stawce VAT 23%.',
            short_answer: 'Ten kalkulator wyodrębnia cenę netto i kwotę VAT z ceny brutto, która już zawiera podatek — odwrotność dodawania VAT.',
            intro_text: '<p>Jeśli znasz tylko cenę końcową zapłaconą przez klienta (z podatkiem) i musisz wiedzieć, ile z tego to podatek, ten kalkulator robi to w jednym kroku, dzieląc przez (1 + stawka ÷ 100) zamiast mnożyć.</p><p><b>Księgowi</b> używają tego stale do odtwarzania przychodu netto z wpływów brutto; <b>kupujący</b> — aby zobaczyć, ile podatku było wliczone w zakup.</p>',
            key_points: [
                '<b>Wzór:</b> Cena Netto = Cena Brutto ÷ (1 + Stawka VAT ÷ 100).',
                '<b>Częsty błąd:</b> nie można uzyskać ceny netto, po prostu odejmując procent podatku od ceny brutto — to zawyża odliczenie. Trzeba dzielić, a nie mnożyć przez (1 − stawka).',
                '<b>Odwrotny przypadek?</b> Jeśli masz cenę netto i chcesz doliczyć podatek, użyj naszego Kalkulatora VAT.',
            ],
            howto: [
                { question: 'Dlaczego nie mogę po prostu odjąć procentu podatku od ceny brutto?', answer: '<p>Ponieważ stawka podatku dotyczy ceny netto, a nie brutto. Odjęcie 23% od ceny brutto usuwa zbyt dużo — trzeba podzielić przez 1.23, a nie pomnożyć przez 0.77.</p>' },
                { question: 'Jaką stawkę powinienem użyć?', answer: '<p>Użyj stawki VAT, która faktycznie była zastosowana do pierwotnej transakcji — sprawdź fakturę lub paragon, jeśli nie masz pewności.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Cena Brutto', type: 'number', unit: 'zł', min: 0, max: 1000000000, placeholder: '123' },
                { name: 'vat_rate', label: 'Stawka VAT', type: 'number', unit: '%', min: 0, max: 100, placeholder: '23', default: 23 },
            ],
            outputs: [
                { name: 'net_price', label: 'Cena Netto', unit: 'zł', precision: 2 },
                { name: 'vat_amount', label: 'Kwota VAT', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-iva-inverso',
            title: 'Calculadora de IVA Inverso',
            h1: 'Calculadora de IVA Inverso',
            meta_title: 'Calculadora de IVA Inverso | Extraer Precio Neto del Precio con IVA',
            meta_description: 'Extrae el precio sin IVA y el importe del impuesto a partir de un precio con IVA incluido — la tasa por defecto corresponde al tipo general español del 21%.',
            short_answer: 'Esta calculadora extrae el precio sin IVA y el importe del IVA de un precio que ya incluye el impuesto — lo contrario de añadir IVA.',
            intro_text: '<p>Si solo conoces el precio final que pagó el cliente (con IVA) y necesitas saber cuánto de eso era impuesto, esta calculadora lo hace en un paso, dividiendo entre (1 + tipo ÷ 100) en lugar de multiplicar.</p><p><b>Los contables</b> usan esto constantemente para reconstruir ingresos netos a partir de recibos brutos; <b>los compradores</b>, para ver cuánto impuesto estaba incluido en una compra.</p>',
            key_points: [
                '<b>Fórmula:</b> Precio sin IVA = Precio con IVA ÷ (1 + Tipo de IVA ÷ 100).',
                '<b>Error común:</b> no puedes obtener el precio sin IVA simplemente restando el porcentaje de impuesto del precio con IVA — eso sobreestima la deducción. Debes dividir, no multiplicar por (1 − tipo).',
                '<b>¿Caso inverso?</b> Si tienes un precio sin IVA y necesitas añadir el impuesto, usa nuestra Calculadora de IVA.',
            ],
            howto: [
                { question: '¿Por qué no puedo simplemente restar el porcentaje de impuesto del precio con IVA?', answer: '<p>Porque el tipo de impuesto se aplica al precio sin IVA, no al precio con IVA. Restar el 21% de un precio con IVA elimina demasiado — debes dividir entre 1.21, no multiplicar por 0.79.</p>' },
                { question: '¿Qué tipo debo usar?', answer: '<p>Usa el tipo de IVA que se aplicó realmente a la transacción original — consulta la factura o el recibo si no estás seguro.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Precio con IVA', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '121' },
                { name: 'vat_rate', label: 'Tipo de IVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '21', default: 21 },
            ],
            outputs: [
                { name: 'net_price', label: 'Precio sin IVA', unit: '€', precision: 2 },
                { name: 'vat_amount', label: 'Importe de IVA', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-tva-inversee',
            title: 'Calculateur de TVA Inversée',
            h1: 'Calculateur de TVA Inversée',
            meta_title: 'Calculateur de TVA Inversée | Extraire le Prix HT du Prix TTC',
            meta_description: 'Extrayez le prix hors taxe et le montant de la TVA à partir d’un prix TTC — le taux par défaut correspond au taux normal français de 20%.',
            short_answer: 'Ce calculateur extrait le prix HT et le montant de la TVA d’un prix TTC — l’inverse de l’ajout de TVA.',
            intro_text: '<p>Si vous ne connaissez que le prix final payé par le client (TTC) et devez savoir quelle part était de la taxe, ce calculateur le fait en une étape, en divisant par (1 + taux ÷ 100) plutôt qu’en multipliant.</p><p><b>Les comptables</b> utilisent cela constamment pour reconstruire le chiffre d’affaires net à partir des encaissements bruts ; <b>les acheteurs</b>, pour voir combien de taxe était inclus dans un achat.</p>',
            key_points: [
                '<b>Formule :</b> Prix HT = Prix TTC ÷ (1 + Taux TVA ÷ 100).',
                '<b>Erreur fréquente :</b> vous ne pouvez pas obtenir le prix HT en soustrayant simplement le pourcentage de taxe du prix TTC — cela surestime la déduction. Il faut diviser, pas multiplier par (1 − taux).',
                '<b>Cas inverse ?</b> Si vous avez un prix HT et devez ajouter la taxe, utilisez notre Calculateur de TVA.',
            ],
            howto: [
                { question: 'Pourquoi ne puis-je pas simplement soustraire le pourcentage de taxe du prix TTC ?', answer: '<p>Parce que le taux de taxe s’applique au prix HT, pas au prix TTC. Soustraire 20 % d’un prix TTC enlève trop — il faut diviser par 1,20, pas multiplier par 0,80.</p>' },
                { question: 'Quel taux dois-je utiliser ?', answer: '<p>Utilisez le taux de TVA réellement appliqué à la transaction d’origine — vérifiez la facture ou le reçu en cas de doute.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Prix TTC', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '120' },
                { name: 'vat_rate', label: 'Taux de TVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
            ],
            outputs: [
                { name: 'net_price', label: 'Prix HT', unit: '€', precision: 2 },
                { name: 'vat_amount', label: 'Montant TVA', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-iva-inversa',
            title: 'Calcolatore IVA Inversa',
            h1: 'Calcolatore IVA Inversa',
            meta_title: 'Calcolatore IVA Inversa | Estrarre il Prezzo Netto dal Prezzo Lordo',
            meta_description: 'Estrai il prezzo netto e l’importo IVA da un prezzo lordo — l’aliquota predefinita corrisponde all’aliquota ordinaria italiana del 22%.',
            short_answer: 'Questo calcolatore estrae il prezzo netto e l’importo IVA da un prezzo che include già l’imposta — l’inverso dell’aggiunta dell’IVA.',
            intro_text: '<p>Se conosci solo il prezzo finale pagato dal cliente (con IVA) e devi sapere quanto di quello era imposta, questo calcolatore lo fa in un passaggio, dividendo per (1 + aliquota ÷ 100) invece di moltiplicare.</p><p><b>I commercialisti</b> lo usano costantemente per ricostruire il ricavo netto dagli incassi lordi; <b>gli acquirenti</b>, per vedere quanta imposta era inclusa in un acquisto.</p>',
            key_points: [
                '<b>Formula:</b> Prezzo Netto = Prezzo Lordo ÷ (1 + Aliquota IVA ÷ 100).',
                '<b>Errore comune:</b> non puoi ottenere il prezzo netto semplicemente sottraendo la percentuale d’imposta dal prezzo lordo — ciò sovrastima la detrazione. Devi dividere, non moltiplicare per (1 − aliquota).',
                '<b>Caso inverso?</b> Se hai un prezzo netto e devi aggiungere l’imposta, usa il nostro Calcolatore IVA.',
            ],
            howto: [
                { question: 'Perché non posso semplicemente sottrarre la percentuale d’imposta dal prezzo lordo?', answer: '<p>Perché l’aliquota si applica al prezzo netto, non al prezzo lordo. Sottrarre il 22% da un prezzo lordo rimuove troppo — devi dividere per 1.22, non moltiplicare per 0.78.</p>' },
                { question: 'Quale aliquota dovrei usare?', answer: '<p>Usa l’aliquota IVA effettivamente applicata alla transazione originale — controlla la fattura o lo scontrino se non sei sicuro.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Prezzo Lordo', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '122' },
                { name: 'vat_rate', label: 'Aliquota IVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '22', default: 22 },
            ],
            outputs: [
                { name: 'net_price', label: 'Prezzo Netto', unit: '€', precision: 2 },
                { name: 'vat_amount', label: 'Importo IVA', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'umgekehrter-mehrwertsteuer-rechner',
            title: 'Umgekehrter Mehrwertsteuer-Rechner',
            h1: 'Umgekehrter Mehrwertsteuer-Rechner',
            meta_title: 'Umgekehrter MwSt-Rechner | Nettopreis aus Bruttopreis Extrahieren',
            meta_description: 'Extrahieren Sie den Nettopreis und den MwSt-Betrag aus einem Bruttopreis — der Standardsatz entspricht dem deutschen Regelsteuersatz von 19%.',
            short_answer: 'Dieser Rechner extrahiert den Nettopreis und den MwSt-Betrag aus einem Bruttopreis, der bereits die Steuer enthält — das Gegenteil der MwSt-Hinzufügung.',
            intro_text: '<p>Wenn Sie nur den vom Kunden gezahlten Endpreis (inkl. Steuer) kennen und wissen müssen, wie viel davon Steuer war, macht dieser Rechner das in einem Schritt, indem er durch (1 + Satz ÷ 100) teilt statt zu multiplizieren.</p><p><b>Buchhalter</b> nutzen dies ständig, um Nettoumsatz aus Bruttoeinnahmen zu rekonstruieren; <b>Käufer</b>, um zu sehen, wie viel Steuer in einem Kauf enthalten war.</p>',
            key_points: [
                '<b>Formel:</b> Nettopreis = Bruttopreis ÷ (1 + MwSt-Satz ÷ 100).',
                '<b>Häufiger Fehler:</b> Sie können den Nettopreis nicht einfach durch Abziehen des Steuerprozentsatzes vom Bruttopreis erhalten — das überschätzt den Abzug. Sie müssen teilen, nicht mit (1 − Satz) multiplizieren.',
                '<b>Umgekehrter Fall?</b> Wenn Sie einen Nettopreis haben und Steuer hinzufügen müssen, nutzen Sie unseren Mehrwertsteuer-Rechner.',
            ],
            howto: [
                { question: 'Warum kann ich nicht einfach den Steuerprozentsatz vom Bruttopreis abziehen?', answer: '<p>Weil sich der Steuersatz auf den Nettopreis bezieht, nicht auf den Bruttopreis. Das Abziehen von 19% von einem Bruttopreis entfernt zu viel — Sie müssen durch 1,19 teilen, nicht mit 0,81 multiplizieren.</p>' },
                { question: 'Welchen Satz sollte ich verwenden?', answer: '<p>Verwenden Sie den MwSt-Satz, der tatsächlich auf die ursprüngliche Transaktion angewendet wurde — prüfen Sie im Zweifel die Rechnung oder den Kassenbon.</p>' },
            ],
            inputs: [
                { name: 'gross_price', label: 'Bruttopreis', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '119' },
                { name: 'vat_rate', label: 'MwSt-Satz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '19', default: 19 },
            ],
            outputs: [
                { name: 'net_price', label: 'Nettopreis', unit: '€', precision: 2 },
                { name: 'vat_amount', label: 'MwSt-Betrag', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1051: Revenue Growth Rate Calculator
// ============================================================
const revenueGrowth: ToolDef = {
    id: '1051',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'previous_revenue', default: 100000 },
            { key: 'current_revenue', default: 120000 },
        ],
        formulas: {
            growth_pct: '(current_revenue-previous_revenue)/previous_revenue*100',
        },
        outputs: [
            { key: 'growth_pct', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'revenue-growth-rate-calculator',
            title: 'Revenue Growth Rate Calculator',
            h1: 'Revenue Growth Rate Calculator',
            meta_title: 'Revenue Growth Rate Calculator | Period-over-Period % Change',
            meta_description: 'Calculate your revenue growth rate as a percentage between two periods — for board decks, investor updates, or your own business tracking.',
            short_answer: 'This calculator computes the percentage change in revenue between a previous period and a current period — your revenue growth rate.',
            intro_text: '<p>Growth rate is one of the most-watched metrics in business — it tells you (and investors) whether revenue is trending up or down and by how much, independent of absolute size. It works for any two comparable periods: month-over-month, quarter-over-quarter, or year-over-year.</p><p><b>Founders and finance teams</b> track this every reporting cycle; a negative result signals revenue decline and warrants investigation.</p>',
            key_points: [
                '<b>Formula:</b> Growth Rate % = (Current Revenue − Previous Revenue) ÷ Previous Revenue × 100.',
                '<b>Compare like periods:</b> comparing a holiday-quarter to a slow quarter without adjusting for seasonality can be misleading — many businesses prefer year-over-year comparisons to control for seasonal effects.',
                '<b>Negative growth</b> simply means revenue declined — the percentage shown will be negative, which is expected and correctly signals contraction.',
            ],
            howto: [
                { question: 'Should I use month-over-month or year-over-year growth?', answer: '<p>Year-over-year controls for seasonality (e.g. retail spikes in December) and is usually the more meaningful headline number; month-over-month is useful for spotting short-term momentum shifts.</p>' },
                { question: 'What\'s a "good" revenue growth rate?', answer: '<p>It depends heavily on company stage and industry — early-stage startups often target 15-20%+ month-over-month, while mature companies may consider 10-20% annual growth strong. There\'s no universal benchmark.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Previous Period Revenue', type: 'number', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Current Period Revenue', type: 'number', min: 0, max: 100000000000, placeholder: '120000' },
                currencyInput,
            ],
            outputs: [
                { name: 'growth_pct', label: 'Revenue Growth Rate', unit: '%', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-tempa-rosta-vyruchki',
            title: 'Калькулятор темпа роста выручки',
            h1: 'Калькулятор темпа роста выручки',
            meta_title: 'Калькулятор роста выручки | Изменение в % между периодами',
            meta_description: 'Рассчитайте темп роста выручки в процентах между двумя периодами — для отчётов, обновлений для инвесторов или собственного учёта.',
            short_answer: 'Этот калькулятор вычисляет процентное изменение выручки между предыдущим и текущим периодом — темп роста выручки.',
            intro_text: '<p>Темп роста — один из самых отслеживаемых показателей в бизнесе — он показывает, растёт ли выручка или падает и насколько, независимо от абсолютного размера. Подходит для любых сравнимых периодов: месяц к месяцу, квартал к кварталу или год к году.</p><p><b>Основатели и финансовые команды</b> отслеживают это каждый отчётный цикл; отрицательный результат сигнализирует о снижении выручки и требует анализа.</p>',
            key_points: [
                '<b>Формула:</b> Темп роста % = (Текущая выручка − Предыдущая выручка) ÷ Предыдущая выручка × 100.',
                '<b>Сравнивайте сопоставимые периоды:</b> сравнение праздничного квартала с медленным без учёта сезонности может вводить в заблуждение — многие бизнесы предпочитают сравнение год к году.',
                '<b>Отрицательный рост</b> просто означает снижение выручки — показанный процент будет отрицательным, это ожидаемо и корректно сигнализирует о сокращении.',
            ],
            howto: [
                { question: 'Использовать рост месяц к месяцу или год к году?', answer: '<p>Год к году учитывает сезонность (например, всплески розничных продаж в декабре) и обычно является более значимым показателем; месяц к месяцу полезен для выявления краткосрочных изменений.</p>' },
                { question: 'Какой темп роста выручки считается "хорошим"?', answer: '<p>Сильно зависит от стадии компании и отрасли — стартапы на ранней стадии часто нацелены на 15-20%+ в месяц, тогда как зрелые компании могут считать сильным ростом 10-20% в год.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Выручка предыдущего периода', type: 'number', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Выручка текущего периода', type: 'number', min: 0, max: 100000000000, placeholder: '120000' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'growth_pct', label: 'Темп роста выручки', unit: '%', precision: 2 },
            ],
        },
        lv: {
            slug: 'ienemumu-izaugsmes-tempa-kalkulators',
            title: 'Ieņēmumu Izaugsmes Tempa Kalkulators',
            h1: 'Ieņēmumu Izaugsmes Tempa Kalkulators',
            meta_title: 'Ieņēmumu Izaugsmes Kalkulators | Izmaiņas % starp Periodiem',
            meta_description: 'Aprēķiniet ieņēmumu izaugsmes tempu procentos starp diviem periodiem — atskaitēm, investoru atjauninājumiem vai sava biznesa uzskaitei.',
            short_answer: 'Šis kalkulators aprēķina ieņēmumu procentuālo izmaiņu starp iepriekšējo un pašreizējo periodu — jūsu ieņēmumu izaugsmes tempu.',
            intro_text: '<p>Izaugsmes temps ir viens no visvairāk vērotajiem rādītājiem biznesā — tas parāda, vai ieņēmumi aug vai krītas un cik daudz, neatkarīgi no absolūtā apjoma.</p><p><b>Dibinātāji un finanšu komandas</b> to seko katru atskaites periodu; negatīvs rezultāts signalizē par ieņēmumu samazināšanos.</p>',
            key_points: [
                '<b>Formula:</b> Izaugsmes Temps % = (Pašreizējie Ieņēmumi − Iepriekšējie Ieņēmumi) ÷ Iepriekšējie Ieņēmumi × 100.',
                '<b>Salīdziniet līdzīgus periodus:</b> svētku ceturkšņa salīdzināšana ar lēnu ceturksni bez sezonalitātes korekcijas var maldināt — daudzi uzņēmumi izvēlas salīdzinājumu gadu pret gadu.',
                '<b>Negatīva izaugsme</b> vienkārši nozīmē, ka ieņēmumi samazinājās — parādītais procents būs negatīvs, tas ir gaidāms un pareizi signalizē par sarukumu.',
            ],
            howto: [
                { question: 'Vai izmantot izaugsmi mēnesi pret mēnesi vai gadu pret gadu?', answer: '<p>Gads pret gadu ņem vērā sezonalitāti un parasti ir nozīmīgāks rādītājs; mēnesis pret mēnesi ir noderīgs īstermiņa pārmaiņu pamanīšanai.</p>' },
                { question: 'Kāds ieņēmumu izaugsmes temps tiek uzskatīts par "labu"?', answer: '<p>Ļoti atkarīgs no uzņēmuma stadijas un nozares — jauni uzņēmumi bieži tiecas pēc 15-20%+ mēnesī, bet nobrieduši uzņēmumi 10-20% gadā var uzskatīt par spēcīgu.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Iepriekšējā Perioda Ieņēmumi', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Pašreizējā Perioda Ieņēmumi', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '120000' },
            ],
            outputs: [
                { name: 'growth_pct', label: 'Ieņēmumu Izaugsmes Temps', unit: '%', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-tempa-wzrostu-przychodow',
            title: 'Kalkulator Tempa Wzrostu Przychodów',
            h1: 'Kalkulator Tempa Wzrostu Przychodów',
            meta_title: 'Kalkulator Wzrostu Przychodów | Zmiana % Między Okresami',
            meta_description: 'Oblicz tempo wzrostu przychodów w procentach między dwoma okresami — do raportów, aktualizacji dla inwestorów lub własnego śledzenia biznesu.',
            short_answer: 'Ten kalkulator oblicza procentową zmianę przychodów między poprzednim a bieżącym okresem — tempo wzrostu przychodów.',
            intro_text: '<p>Tempo wzrostu to jeden z najczęściej obserwowanych wskaźników w biznesie — pokazuje, czy przychody rosną, czy spadają i o ile, niezależnie od wartości bezwzględnej.</p><p><b>Założyciele i zespoły finansowe</b> śledzą to co cykl raportowy; wynik ujemny sygnalizuje spadek przychodów.</p>',
            key_points: [
                '<b>Wzór:</b> Tempo Wzrostu % = (Bieżące Przychody − Poprzednie Przychody) ÷ Poprzednie Przychody × 100.',
                '<b>Porównuj podobne okresy:</b> porównywanie kwartału świątecznego ze słabym kwartałem bez korekty sezonowej może wprowadzać w błąd — wiele firm woli porównania rok do roku.',
                '<b>Ujemny wzrost</b> po prostu oznacza spadek przychodów — pokazany procent będzie ujemny, co jest oczekiwane i poprawnie sygnalizuje kurczenie się.',
            ],
            howto: [
                { question: 'Czy używać wzrostu miesiąc do miesiąca, czy rok do roku?', answer: '<p>Rok do roku uwzględnia sezonowość i zwykle jest bardziej znaczącym wskaźnikiem; miesiąc do miesiąca jest przydatny do wychwytywania krótkoterminowych zmian.</p>' },
                { question: 'Jakie tempo wzrostu przychodów uznaje się za "dobre"?', answer: '<p>Mocno zależy od etapu firmy i branży — startupy na wczesnym etapie często celują w 15-20%+ miesięcznie, podczas gdy dojrzałe firmy mogą uznać 10-20% rocznie za silny wynik.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Przychody Poprzedniego Okresu', type: 'number', unit: 'zł', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Przychody Bieżącego Okresu', type: 'number', unit: 'zł', min: 0, max: 100000000000, placeholder: '120000' },
            ],
            outputs: [
                { name: 'growth_pct', label: 'Tempo Wzrostu Przychodów', unit: '%', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-tasa-de-crecimiento-de-ingresos',
            title: 'Calculadora de Tasa de Crecimiento de Ingresos',
            h1: 'Calculadora de Tasa de Crecimiento de Ingresos',
            meta_title: 'Calculadora de Crecimiento de Ingresos | Variación % entre Periodos',
            meta_description: 'Calcula tu tasa de crecimiento de ingresos como porcentaje entre dos periodos — para informes, actualizaciones a inversores o tu propio seguimiento del negocio.',
            short_answer: 'Esta calculadora calcula el cambio porcentual en los ingresos entre un periodo anterior y uno actual — tu tasa de crecimiento de ingresos.',
            intro_text: '<p>La tasa de crecimiento es una de las métricas más vigiladas en los negocios — te indica (a ti y a los inversores) si los ingresos van al alza o a la baja y en qué medida, independientemente del tamaño absoluto.</p><p><b>Los fundadores y equipos financieros en España</b> siguen esto cada ciclo de informes; un resultado negativo señala una caída de ingresos y requiere investigación.</p>',
            key_points: [
                '<b>Fórmula:</b> Tasa de Crecimiento % = (Ingresos Actuales − Ingresos Anteriores) ÷ Ingresos Anteriores × 100.',
                '<b>Compara periodos similares:</b> comparar un trimestre de vacaciones con uno flojo sin ajustar por estacionalidad puede ser engañoso — muchas empresas prefieren comparaciones interanuales.',
                '<b>Crecimiento negativo</b> simplemente significa que los ingresos disminuyeron — el porcentaje mostrado será negativo, lo cual es esperado y señala correctamente una contracción.',
            ],
            howto: [
                { question: '¿Debo usar el crecimiento mes a mes o interanual?', answer: '<p>El interanual controla la estacionalidad y suele ser la cifra más significativa; el mes a mes es útil para detectar cambios de impulso a corto plazo.</p>' },
                { question: '¿Qué tasa de crecimiento de ingresos es "buena"?', answer: '<p>Depende mucho de la etapa de la empresa y el sector — las startups en fase inicial suelen apuntar a un 15-20%+ mensual, mientras que las empresas maduras pueden considerar fuerte un 10-20% anual.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Ingresos del Periodo Anterior', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Ingresos del Periodo Actual', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '120000' },
            ],
            outputs: [
                { name: 'growth_pct', label: 'Tasa de Crecimiento de Ingresos', unit: '%', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-taux-de-croissance-du-chiffre-daffaires',
            title: 'Calculateur de Taux de Croissance du Chiffre d’Affaires',
            h1: 'Calculateur de Taux de Croissance du Chiffre d’Affaires',
            meta_title: 'Calculateur de Croissance du CA | Variation % entre Périodes',
            meta_description: 'Calculez votre taux de croissance du chiffre d’affaires en pourcentage entre deux périodes — pour des rapports, mises à jour investisseurs ou votre propre suivi.',
            short_answer: 'Ce calculateur calcule la variation en pourcentage du chiffre d’affaires entre une période précédente et une période actuelle — votre taux de croissance.',
            intro_text: '<p>Le taux de croissance est l’une des métriques les plus surveillées en entreprise — il indique (à vous et aux investisseurs) si le chiffre d’affaires augmente ou diminue et de combien, indépendamment de la taille absolue.</p><p><b>Les fondateurs et équipes financières en France</b> suivent cela à chaque cycle de reporting ; un résultat négatif signale un déclin du chiffre d’affaires.</p>',
            key_points: [
                '<b>Formule :</b> Taux de Croissance % = (CA Actuel − CA Précédent) ÷ CA Précédent × 100.',
                '<b>Comparez des périodes similaires :</b> comparer un trimestre de fêtes à un trimestre creux sans ajustement saisonnier peut être trompeur — beaucoup d’entreprises préfèrent les comparaisons d’une année sur l’autre.',
                '<b>Une croissance négative</b> signifie simplement que le chiffre d’affaires a diminué — le pourcentage affiché sera négatif, ce qui est attendu et signale correctement une contraction.',
            ],
            howto: [
                { question: 'Dois-je utiliser la croissance mois sur mois ou d’une année sur l’autre ?', answer: '<p>La comparaison annuelle contrôle la saisonnalité et est généralement le chiffre le plus significatif ; mois sur mois est utile pour repérer les changements d’élan à court terme.</p>' },
                { question: 'Quel taux de croissance du chiffre d’affaires est « bon » ?', answer: '<p>Cela dépend fortement du stade de l’entreprise et du secteur — les startups en phase précoce visent souvent 15-20 %+ par mois, tandis que les entreprises matures peuvent considérer 10-20 % annuel comme solide.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'CA de la Période Précédente', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'CA de la Période Actuelle', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '120000' },
            ],
            outputs: [
                { name: 'growth_pct', label: 'Taux de Croissance du CA', unit: '%', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-tasso-di-crescita-dei-ricavi',
            title: 'Calcolatore del Tasso di Crescita dei Ricavi',
            h1: 'Calcolatore del Tasso di Crescita dei Ricavi',
            meta_title: 'Calcolatore Crescita Ricavi | Variazione % tra Periodi',
            meta_description: 'Calcola il tasso di crescita dei ricavi in percentuale tra due periodi — per report, aggiornamenti agli investitori o il tuo monitoraggio aziendale.',
            short_answer: 'Questo calcolatore calcola la variazione percentuale dei ricavi tra un periodo precedente e uno attuale — il tuo tasso di crescita dei ricavi.',
            intro_text: '<p>Il tasso di crescita è una delle metriche più monitorate nel business — indica (a te e agli investitori) se i ricavi stanno aumentando o diminuendo e di quanto, indipendentemente dalla dimensione assoluta.</p><p><b>I fondatori e i team finanziari in Italia</b> monitorano questo ogni ciclo di reporting; un risultato negativo segnala un calo dei ricavi.</p>',
            key_points: [
                '<b>Formula:</b> Tasso di Crescita % = (Ricavi Attuali − Ricavi Precedenti) ÷ Ricavi Precedenti × 100.',
                '<b>Confronta periodi simili:</b> confrontare un trimestre di festività con uno lento senza correggere per la stagionalità può essere fuorviante — molte aziende preferiscono confronti anno su anno.',
                '<b>Crescita negativa</b> significa semplicemente che i ricavi sono diminuiti — la percentuale mostrata sarà negativa, il che è previsto e segnala correttamente una contrazione.',
            ],
            howto: [
                { question: 'Dovrei usare la crescita mese su mese o anno su anno?', answer: '<p>Anno su anno controlla la stagionalità ed è solitamente il numero più significativo; mese su mese è utile per individuare cambiamenti di slancio a breve termine.</p>' },
                { question: 'Quale tasso di crescita dei ricavi è "buono"?', answer: '<p>Dipende molto dallo stadio dell’azienda e dal settore — le startup in fase iniziale spesso puntano al 15-20%+ mensile, mentre le aziende mature possono considerare forte una crescita annua del 10-20%.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Ricavi del Periodo Precedente', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Ricavi del Periodo Attuale', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '120000' },
            ],
            outputs: [
                { name: 'growth_pct', label: 'Tasso di Crescita dei Ricavi', unit: '%', precision: 2 },
            ],
        },
        de: {
            slug: 'umsatzwachstumsrate-rechner',
            title: 'Umsatzwachstumsrate-Rechner',
            h1: 'Umsatzwachstumsrate-Rechner',
            meta_title: 'Umsatzwachstum-Rechner | Prozentuale Veränderung zwischen Perioden',
            meta_description: 'Berechnen Sie Ihre Umsatzwachstumsrate in Prozent zwischen zwei Perioden — für Berichte, Investoren-Updates oder Ihr eigenes Geschäfts-Tracking.',
            short_answer: 'Dieser Rechner berechnet die prozentuale Veränderung des Umsatzes zwischen einer vorherigen und einer aktuellen Periode — Ihre Umsatzwachstumsrate.',
            intro_text: '<p>Die Wachstumsrate ist eine der meistbeobachteten Kennzahlen im Geschäft — sie zeigt Ihnen (und Investoren), ob der Umsatz steigt oder fällt und um wie viel, unabhängig von der absoluten Größe.</p><p><b>Gründer und Finanzteams in Deutschland</b> verfolgen dies jeden Berichtszyklus; ein negatives Ergebnis signalisiert einen Umsatzrückgang.</p>',
            key_points: [
                '<b>Formel:</b> Wachstumsrate % = (Aktueller Umsatz − Vorheriger Umsatz) ÷ Vorheriger Umsatz × 100.',
                '<b>Vergleichbare Perioden vergleichen:</b> der Vergleich eines Feiertagsquartals mit einem langsamen Quartal ohne Saisonbereinigung kann irreführend sein — viele Unternehmen bevorzugen Jahresvergleiche.',
                '<b>Negatives Wachstum</b> bedeutet einfach, dass der Umsatz zurückgegangen ist — der angezeigte Prozentsatz wird negativ sein, was erwartet wird und korrekt eine Kontraktion signalisiert.',
            ],
            howto: [
                { question: 'Sollte ich Monat-zu-Monat- oder Jahr-zu-Jahr-Wachstum verwenden?', answer: '<p>Jahr-zu-Jahr kontrolliert die Saisonalität und ist normalerweise die aussagekräftigere Kennzahl; Monat-zu-Monat ist nützlich, um kurzfristige Dynamikänderungen zu erkennen.</p>' },
                { question: 'Was ist eine "gute" Umsatzwachstumsrate?', answer: '<p>Hängt stark von Unternehmensphase und Branche ab — frühphasige Startups zielen oft auf 15-20%+ monatlich, während reife Unternehmen 10-20% jährliches Wachstum als stark betrachten könnten.</p>' },
            ],
            inputs: [
                { name: 'previous_revenue', label: 'Umsatz der Vorperiode', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '100000' },
                { name: 'current_revenue', label: 'Umsatz der Aktuellen Periode', type: 'number', unit: '€', min: 0, max: 100000000000, placeholder: '120000' },
            ],
            outputs: [
                { name: 'growth_pct', label: 'Umsatzwachstumsrate', unit: '%', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1052: Customer Lifetime Value (CLV) Calculator
// ============================================================
const clv: ToolDef = {
    id: '1052',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'avg_purchase_value', default: 50 },
            { key: 'purchase_frequency', default: 4 },
            { key: 'customer_lifespan', default: 5 },
        ],
        formulas: {
            clv: 'avg_purchase_value*purchase_frequency*customer_lifespan',
        },
        outputs: [
            { key: 'clv', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'customer-lifetime-value-clv-calculator',
            title: 'Customer Lifetime Value (CLV) Calculator',
            h1: 'Customer Lifetime Value (CLV) Calculator',
            meta_title: 'CLV Calculator | Estimate Customer Lifetime Value',
            meta_description: 'Estimate customer lifetime value (CLV) from average purchase value, purchase frequency, and customer lifespan — a core metric for marketing budget decisions.',
            short_answer: 'This calculator estimates Customer Lifetime Value (CLV) — the total revenue you can expect from a single customer over the entire relationship.',
            intro_text: '<p>CLV multiplies three numbers: how much a customer spends per purchase, how often they purchase per year, and how many years they typically stay a customer. The result tells you the total revenue one average customer generates — critical context for deciding how much you can afford to spend acquiring one (see our CAC Calculator).</p><p><b>Marketing and growth teams</b> use CLV alongside CAC to judge whether an acquisition channel is actually profitable.</p>',
            key_points: [
                '<b>Formula:</b> CLV = Average Purchase Value × Purchase Frequency (per year) × Customer Lifespan (years).',
                '<b>CLV:CAC ratio matters more than CLV alone:</b> a common rule of thumb targets a ratio of at least 3:1 (CLV three times CAC) for a sustainable business model.',
                '<b>This is a simplified model:</b> more advanced CLV models discount future revenue for time value of money and factor in gross margin, not just revenue — use this as a directional estimate, not a precise forecast.',
            ],
            howto: [
                { question: 'Should I use revenue or profit in this calculation?', answer: '<p>This simplified formula uses revenue (average purchase value). For a margin-based view of true profitability per customer, multiply the CLV result by your gross margin percentage.</p>' },
                { question: 'How do I estimate customer lifespan if I don\'t have historical data yet?', answer: '<p>Use 1 ÷ your monthly churn rate to estimate average lifespan in months, then convert to years — or use an industry benchmark for your business type as a starting estimate.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Average Purchase Value', type: 'number', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Purchase Frequency (per year)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Customer Lifespan (years)', type: 'number', min: 0, max: 100, placeholder: '5' },
                currencyInput,
            ],
            outputs: [
                { name: 'clv', label: 'Customer Lifetime Value', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-pozhiznennoy-tsennosti-klienta-clv',
            title: 'Калькулятор пожизненной ценности клиента (CLV)',
            h1: 'Калькулятор пожизненной ценности клиента (CLV)',
            meta_title: 'Калькулятор CLV | Оценка пожизненной ценности клиента',
            meta_description: 'Оцените пожизненную ценность клиента (CLV) на основе средней суммы покупки, частоты покупок и срока жизни клиента.',
            short_answer: 'Этот калькулятор оценивает пожизненную ценность клиента (CLV) — общую выручку, которую вы можете ожидать от одного клиента за всё время отношений.',
            intro_text: '<p>CLV перемножает три числа: сколько клиент тратит за покупку, как часто он покупает в год, и сколько лет он обычно остаётся клиентом. Результат показывает общую выручку от одного среднего клиента — критически важный контекст для решения, сколько можно потратить на привлечение одного клиента (см. наш калькулятор CAC).</p><p><b>Маркетинг и growth-команды</b> используют CLV вместе с CAC, чтобы оценить, действительно ли канал привлечения прибылен.</p>',
            key_points: [
                '<b>Формула:</b> CLV = Средняя сумма покупки × Частота покупок (в год) × Срок жизни клиента (лет).',
                '<b>Соотношение CLV:CAC важнее самого CLV:</b> распространённое эмпирическое правило — соотношение не менее 3:1 (CLV в три раза больше CAC) для устойчивой бизнес-модели.',
                '<b>Это упрощённая модель:</b> более продвинутые модели CLV дисконтируют будущую выручку и учитывают валовую маржу, а не только выручку.',
            ],
            howto: [
                { question: 'Использовать выручку или прибыль в этом расчёте?', answer: '<p>Эта упрощённая формула использует выручку (среднюю сумму покупки). Для оценки истинной прибыльности на клиента умножьте результат CLV на процент валовой маржи.</p>' },
                { question: 'Как оценить срок жизни клиента, если нет исторических данных?', answer: '<p>Используйте 1 ÷ ежемесячный отток, чтобы оценить средний срок жизни в месяцах, затем переведите в годы.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Средняя сумма покупки', type: 'number', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Частота покупок (в год)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Срок жизни клиента (лет)', type: 'number', min: 0, max: 100, placeholder: '5' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'clv', label: 'Пожизненная ценность клиента', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'klienta-dziveslaika-vertibas-clv-kalkulators',
            title: 'Klienta Dzīveslaika Vērtības (CLV) Kalkulators',
            h1: 'Klienta Dzīveslaika Vērtības (CLV) Kalkulators',
            meta_title: 'CLV Kalkulators | Novērtēt Klienta Dzīveslaika Vērtību',
            meta_description: 'Novērtējiet klienta dzīveslaika vērtību (CLV) no vidējās pirkuma vērtības, pirkumu biežuma un klienta dzīveslaika.',
            short_answer: 'Šis kalkulators novērtē klienta dzīveslaika vērtību (CLV) — kopējos ieņēmumus, ko varat sagaidīt no viena klienta visā attiecību laikā.',
            intro_text: '<p>CLV reizina trīs skaitļus: cik klients tērē par pirkumu, cik bieži viņš pērk gadā un cik gadus viņš parasti paliek klients. Rezultāts parāda kopējos ieņēmumus no viena vidējā klienta.</p><p><b>Mārketinga komandas</b> izmanto CLV kopā ar CAC, lai novērtētu, vai piesaistes kanāls tiešām ir rentabls.</p>',
            key_points: [
                '<b>Formula:</b> CLV = Vidējā Pirkuma Vērtība × Pirkumu Biežums (gadā) × Klienta Dzīveslaiks (gados).',
                '<b>CLV:CAC attiecība ir svarīgāka par pašu CLV:</b> izplatīts noteikums ir vismaz 3:1 attiecība ilgtspējīgam biznesa modelim.',
                '<b>Tas ir vienkāršots modelis:</b> attīstītāki CLV modeļi diskontē nākotnes ieņēmumus un ņem vērā bruto peļņu, nevis tikai ieņēmumus.',
            ],
            howto: [
                { question: 'Vai izmantot ieņēmumus vai peļņu šajā aprēķinā?', answer: '<p>Šī vienkāršotā formula izmanto ieņēmumus. Patiesai peļņas ainai reiziniet CLV rezultātu ar bruto peļņas procentu.</p>' },
                { question: 'Kā novērtēt klienta dzīveslaiku, ja nav vēsturisku datu?', answer: '<p>Izmantojiet 1 ÷ ikmēneša aizplūšanas rādītāju, lai novērtētu vidējo dzīveslaiku mēnešos, tad pārvērtiet gados.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Vidējā Pirkuma Vērtība', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Pirkumu Biežums (gadā)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Klienta Dzīveslaiks (gados)', type: 'number', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'clv', label: 'Klienta Dzīveslaika Vērtība', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wartosci-zycia-klienta-clv',
            title: 'Kalkulator Wartości Życia Klienta (CLV)',
            h1: 'Kalkulator Wartości Życia Klienta (CLV)',
            meta_title: 'Kalkulator CLV | Oszacuj Wartość Życia Klienta',
            meta_description: 'Oszacuj wartość życia klienta (CLV) na podstawie średniej wartości zakupu, częstotliwości zakupów i długości relacji z klientem.',
            short_answer: 'Ten kalkulator szacuje Wartość Życia Klienta (CLV) — całkowity przychód, jakiego możesz oczekiwać od jednego klienta przez cały czas trwania relacji.',
            intro_text: '<p>CLV mnoży trzy liczby: ile klient wydaje na zakup, jak często kupuje w ciągu roku i przez ile lat zazwyczaj pozostaje klientem. Wynik pokazuje całkowity przychód od jednego przeciętnego klienta.</p><p><b>Zespoły marketingowe i growth</b> używają CLV razem z CAC, aby ocenić, czy kanał pozyskiwania jest rzeczywiście rentowny.</p>',
            key_points: [
                '<b>Wzór:</b> CLV = Średnia Wartość Zakupu × Częstotliwość Zakupów (rocznie) × Długość Relacji (lata).',
                '<b>Stosunek CLV:CAC ważniejszy niż samo CLV:</b> powszechna zasada to co najmniej 3:1 dla zrównoważonego modelu biznesowego.',
                '<b>To uproszczony model:</b> bardziej zaawansowane modele CLV dyskontują przyszłe przychody i uwzględniają marżę brutto, nie tylko przychód.',
            ],
            howto: [
                { question: 'Czy używać przychodu, czy zysku w tym obliczeniu?', answer: '<p>Ten uproszczony wzór używa przychodu. Dla realnej rentowności pomnóż wynik CLV przez procent marży brutto.</p>' },
                { question: 'Jak oszacować długość relacji z klientem bez danych historycznych?', answer: '<p>Użyj 1 ÷ miesięczny wskaźnik rezygnacji, aby oszacować średnią długość relacji w miesiącach, potem przelicz na lata.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Średnia Wartość Zakupu', type: 'number', unit: 'zł', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Częstotliwość Zakupów (rocznie)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Długość Relacji (lata)', type: 'number', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'clv', label: 'Wartość Życia Klienta', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-valor-de-vida-del-cliente-clv',
            title: 'Calculadora de Valor de Vida del Cliente (CLV)',
            h1: 'Calculadora de Valor de Vida del Cliente (CLV)',
            meta_title: 'Calculadora CLV | Estimar el Valor de Vida del Cliente',
            meta_description: 'Estima el valor de vida del cliente (CLV) a partir del valor medio de compra, la frecuencia de compra y la duración de la relación con el cliente.',
            short_answer: 'Esta calculadora estima el Valor de Vida del Cliente (CLV) — los ingresos totales que puedes esperar de un solo cliente durante toda la relación.',
            intro_text: '<p>El CLV multiplica tres números: cuánto gasta un cliente por compra, con qué frecuencia compra al año y cuántos años suele permanecer como cliente. El resultado indica los ingresos totales generados por un cliente promedio.</p><p><b>Los equipos de marketing y crecimiento en España</b> usan el CLV junto con el CAC para juzgar si un canal de adquisición es realmente rentable.</p>',
            key_points: [
                '<b>Fórmula:</b> CLV = Valor Medio de Compra × Frecuencia de Compra (anual) × Duración de la Relación (años).',
                '<b>La relación CLV:CAC importa más que el CLV solo:</b> una regla común busca una relación de al menos 3:1 para un modelo de negocio sostenible.',
                '<b>Este es un modelo simplificado:</b> modelos de CLV más avanzados descuentan los ingresos futuros y consideran el margen bruto, no solo los ingresos.',
            ],
            howto: [
                { question: '¿Debo usar ingresos o beneficio en este cálculo?', answer: '<p>Esta fórmula simplificada usa ingresos. Para una visión de rentabilidad real, multiplica el resultado del CLV por tu porcentaje de margen bruto.</p>' },
                { question: '¿Cómo estimo la duración de la relación si no tengo datos históricos?', answer: '<p>Usa 1 ÷ tu tasa de cancelación mensual para estimar la duración media en meses, luego conviértela a años.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Valor Medio de Compra', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Frecuencia de Compra (anual)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Duración de la Relación (años)', type: 'number', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'clv', label: 'Valor de Vida del Cliente', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-valeur-vie-client-clv',
            title: 'Calculateur de Valeur Vie Client (CLV)',
            h1: 'Calculateur de Valeur Vie Client (CLV)',
            meta_title: 'Calculateur CLV | Estimer la Valeur Vie Client',
            meta_description: 'Estimez la valeur vie client (CLV) à partir de la valeur moyenne d’achat, de la fréquence d’achat et de la durée de la relation client.',
            short_answer: 'Ce calculateur estime la Valeur Vie Client (CLV) — le revenu total que vous pouvez attendre d’un seul client sur toute la durée de la relation.',
            intro_text: '<p>La CLV multiplie trois nombres : combien un client dépense par achat, à quelle fréquence il achète par an, et combien d’années il reste généralement client. Le résultat indique le revenu total généré par un client moyen.</p><p><b>Les équipes marketing et croissance en France</b> utilisent la CLV avec le CAC pour juger si un canal d’acquisition est réellement rentable.</p>',
            key_points: [
                '<b>Formule :</b> CLV = Valeur Moyenne d’Achat × Fréquence d’Achat (par an) × Durée de la Relation Client (années).',
                '<b>Le ratio CLV:CAC compte plus que la CLV seule :</b> une règle courante vise un ratio d’au moins 3:1 pour un modèle économique durable.',
                '<b>C’est un modèle simplifié :</b> des modèles CLV plus avancés actualisent les revenus futurs et intègrent la marge brute, pas seulement le revenu.',
            ],
            howto: [
                { question: 'Dois-je utiliser le revenu ou le profit dans ce calcul ?', answer: '<p>Cette formule simplifiée utilise le revenu. Pour une vision de rentabilité réelle, multipliez le résultat de la CLV par votre pourcentage de marge brute.</p>' },
                { question: 'Comment estimer la durée de la relation client sans données historiques ?', answer: '<p>Utilisez 1 ÷ votre taux de désabonnement mensuel pour estimer la durée moyenne en mois, puis convertissez en années.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Valeur Moyenne d’Achat', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Fréquence d’Achat (par an)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Durée de la Relation (années)', type: 'number', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'clv', label: 'Valeur Vie Client', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-valore-vita-cliente-clv',
            title: 'Calcolatore del Valore Vita Cliente (CLV)',
            h1: 'Calcolatore del Valore Vita Cliente (CLV)',
            meta_title: 'Calcolatore CLV | Stimare il Valore Vita Cliente',
            meta_description: 'Stima il valore vita cliente (CLV) a partire dal valore medio d’acquisto, dalla frequenza d’acquisto e dalla durata della relazione con il cliente.',
            short_answer: 'Questo calcolatore stima il Valore Vita Cliente (CLV) — il ricavo totale che puoi aspettarti da un singolo cliente durante l’intera relazione.',
            intro_text: '<p>Il CLV moltiplica tre numeri: quanto spende un cliente per acquisto, quanto spesso acquista all’anno e per quanti anni rimane tipicamente cliente. Il risultato indica il ricavo totale generato da un cliente medio.</p><p><b>I team di marketing e crescita in Italia</b> usano il CLV insieme al CAC per giudicare se un canale di acquisizione è realmente redditizio.</p>',
            key_points: [
                '<b>Formula:</b> CLV = Valore Medio d’Acquisto × Frequenza d’Acquisto (annua) × Durata della Relazione (anni).',
                '<b>Il rapporto CLV:CAC conta più del CLV da solo:</b> una regola comune punta a un rapporto di almeno 3:1 per un modello di business sostenibile.',
                '<b>Questo è un modello semplificato:</b> modelli CLV più avanzati scontano i ricavi futuri e considerano il margine lordo, non solo il ricavo.',
            ],
            howto: [
                { question: 'Dovrei usare il ricavo o il profitto in questo calcolo?', answer: '<p>Questa formula semplificata usa il ricavo. Per una visione di redditività reale, moltiplica il risultato del CLV per la tua percentuale di margine lordo.</p>' },
                { question: 'Come stimo la durata della relazione senza dati storici?', answer: '<p>Usa 1 ÷ il tuo tasso di abbandono mensile per stimare la durata media in mesi, poi converti in anni.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Valore Medio d’Acquisto', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Frequenza d’Acquisto (annua)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Durata della Relazione (anni)', type: 'number', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'clv', label: 'Valore Vita Cliente', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'kundenlebenswert-clv-rechner',
            title: 'Kundenlebenswert (CLV) Rechner',
            h1: 'Kundenlebenswert (CLV) Rechner',
            meta_title: 'CLV-Rechner | Kundenlebenswert Schätzen',
            meta_description: 'Schätzen Sie den Kundenlebenswert (CLV) anhand des durchschnittlichen Kaufwerts, der Kauffrequenz und der Kundenbeziehungsdauer.',
            short_answer: 'Dieser Rechner schätzt den Kundenlebenswert (Customer Lifetime Value, CLV) — den Gesamtumsatz, den Sie von einem einzelnen Kunden über die gesamte Beziehung erwarten können.',
            intro_text: '<p>Der CLV multipliziert drei Zahlen: wie viel ein Kunde pro Kauf ausgibt, wie oft er pro Jahr kauft, und wie viele Jahre er typischerweise Kunde bleibt. Das Ergebnis zeigt den Gesamtumsatz eines durchschnittlichen Kunden.</p><p><b>Marketing- und Wachstumsteams in Deutschland</b> nutzen CLV zusammen mit CAC, um zu beurteilen, ob ein Akquisitionskanal wirklich profitabel ist.</p>',
            key_points: [
                '<b>Formel:</b> CLV = Durchschnittlicher Kaufwert × Kauffrequenz (pro Jahr) × Kundenbeziehungsdauer (Jahre).',
                '<b>Das CLV:CAC-Verhältnis zählt mehr als der CLV allein:</b> eine gängige Faustregel strebt ein Verhältnis von mindestens 3:1 für ein nachhaltiges Geschäftsmodell an.',
                '<b>Dies ist ein vereinfachtes Modell:</b> fortgeschrittenere CLV-Modelle diskontieren zukünftige Umsätze und berücksichtigen die Bruttomarge, nicht nur den Umsatz.',
            ],
            howto: [
                { question: 'Sollte ich Umsatz oder Gewinn in dieser Berechnung verwenden?', answer: '<p>Diese vereinfachte Formel verwendet Umsatz. Für eine Sicht auf die tatsächliche Rentabilität multiplizieren Sie das CLV-Ergebnis mit Ihrem Bruttomargenprozentsatz.</p>' },
                { question: 'Wie schätze ich die Kundenbeziehungsdauer ohne historische Daten?', answer: '<p>Verwenden Sie 1 ÷ Ihre monatliche Abwanderungsrate, um die durchschnittliche Dauer in Monaten zu schätzen, dann in Jahre umrechnen.</p>' },
            ],
            inputs: [
                { name: 'avg_purchase_value', label: 'Durchschnittlicher Kaufwert', type: 'number', unit: '€', min: 0, max: 10000000, placeholder: '50' },
                { name: 'purchase_frequency', label: 'Kauffrequenz (pro Jahr)', type: 'number', min: 0, max: 1000, placeholder: '4' },
                { name: 'customer_lifespan', label: 'Kundenbeziehungsdauer (Jahre)', type: 'number', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'clv', label: 'Kundenlebenswert', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1053: Customer Acquisition Cost (CAC) Calculator
// ============================================================
const cac: ToolDef = {
    id: '1053',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'marketing_spend', default: 5000 },
            { key: 'new_customers', default: 100 },
        ],
        formulas: {
            cac: 'marketing_spend/new_customers',
        },
        outputs: [
            { key: 'cac', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'customer-acquisition-cost-cac-calculator',
            title: 'Customer Acquisition Cost (CAC) Calculator',
            h1: 'Customer Acquisition Cost (CAC) Calculator',
            meta_title: 'CAC Calculator | Cost to Acquire a New Customer',
            meta_description: 'Calculate customer acquisition cost (CAC) from total marketing/sales spend and number of new customers acquired.',
            short_answer: 'This calculator computes Customer Acquisition Cost (CAC) — how much you spent, on average, to acquire each new customer.',
            intro_text: '<p>CAC divides your total sales and marketing spend for a period by the number of new customers acquired in that same period. It\'s a fundamental efficiency metric: rising CAC over time (holding channels constant) usually signals market saturation or declining ad performance.</p><p><b>Compare CAC against CLV</b> (see our CLV Calculator) — spending more to acquire a customer than they\'ll ever be worth is unsustainable, no matter how good the growth-rate headline looks.</p>',
            key_points: [
                '<b>Formula:</b> CAC = Total Sales & Marketing Spend ÷ Number of New Customers Acquired.',
                '<b>Include ALL acquisition costs:</b> ad spend, sales team salaries/commissions, marketing tools, and content production — not just ad spend alone, or CAC will be understated.',
                '<b>Track by channel:</b> blended CAC across all channels hides which specific channels are efficient vs. wasteful — calculate CAC per channel when possible.',
            ],
            howto: [
                { question: 'What counts as "marketing spend" for this calculation?', answer: '<p>Ideally all costs involved in acquiring customers: ad spend, salaries for marketing/sales staff, tools/software, agency fees, and content costs — a narrower "ad spend only" number will understate true CAC.</p>' },
                { question: 'What\'s a healthy CAC?', answer: '<p>There\'s no universal number — it only makes sense relative to CLV. A common target is CLV at least 3x CAC, though this varies by business model and how quickly you need to recoup the cost (payback period).</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Total Sales & Marketing Spend', type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'New Customers Acquired', type: 'number', min: 1, max: 10000000, placeholder: '100' },
                currencyInput,
            ],
            outputs: [
                { name: 'cac', label: 'Customer Acquisition Cost', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-stoimosti-privlecheniya-klienta-cac',
            title: 'Калькулятор стоимости привлечения клиента (CAC)',
            h1: 'Калькулятор стоимости привлечения клиента (CAC)',
            meta_title: 'Калькулятор CAC | Стоимость привлечения нового клиента',
            meta_description: 'Рассчитайте стоимость привлечения клиента (CAC) на основе общих затрат на маркетинг/продажи и числа привлечённых новых клиентов.',
            short_answer: 'Этот калькулятор вычисляет стоимость привлечения клиента (CAC) — сколько вы в среднем потратили на привлечение каждого нового клиента.',
            intro_text: '<p>CAC делит общие затраты на продажи и маркетинг за период на число новых клиентов, привлечённых за тот же период. Это фундаментальный показатель эффективности: рост CAC со временем обычно сигнализирует о насыщении рынка или снижении эффективности рекламы.</p><p><b>Сравнивайте CAC с CLV</b> (см. наш калькулятор CLV) — тратить на привлечение клиента больше, чем он когда-либо принесёт, неустойчиво.</p>',
            key_points: [
                '<b>Формула:</b> CAC = Общие затраты на продажи и маркетинг ÷ Число привлечённых новых клиентов.',
                '<b>Учитывайте ВСЕ затраты на привлечение:</b> расходы на рекламу, зарплаты отдела продаж, маркетинговые инструменты и производство контента.',
                '<b>Отслеживайте по каналам:</b> смешанный CAC по всем каналам скрывает, какие каналы эффективны, а какие расточительны.',
            ],
            howto: [
                { question: 'Что считается "маркетинговыми затратами" в этом расчёте?', answer: '<p>В идеале все затраты на привлечение клиентов: реклама, зарплаты маркетинга/продаж, инструменты/софт, агентские услуги и контент.</p>' },
                { question: 'Какой CAC считается здоровым?', answer: '<p>Универсального числа нет — он имеет смысл только относительно CLV. Обычная цель — CLV минимум в 3 раза больше CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Общие затраты на продажи и маркетинг', type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Число привлечённых новых клиентов', type: 'number', min: 1, max: 10000000, placeholder: '100' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'cac', label: 'Стоимость привлечения клиента', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'klientu-piesaistes-izmaksu-cac-kalkulators',
            title: 'Klientu Piesaistes Izmaksu (CAC) Kalkulators',
            h1: 'Klientu Piesaistes Izmaksu (CAC) Kalkulators',
            meta_title: 'CAC Kalkulators | Jauna Klienta Piesaistes Izmaksas',
            meta_description: 'Aprēķiniet klientu piesaistes izmaksas (CAC) no kopējiem mārketinga/pārdošanas izdevumiem un jauno klientu skaita.',
            short_answer: 'Šis kalkulators aprēķina Klientu Piesaistes Izmaksas (CAC) — cik vidēji iztērējāt, lai piesaistītu katru jauno klientu.',
            intro_text: '<p>CAC dala kopējos pārdošanas un mārketinga izdevumus par periodu ar jauno klientu skaitu, kas piesaistīti tajā pašā periodā. Tas ir efektivitātes rādītājs: pieaugošs CAC laika gaitā parasti signalizē par tirgus piesātinājumu.</p><p><b>Salīdziniet CAC ar CLV</b> (skatiet mūsu CLV kalkulatoru) — tērēt vairāk klienta piesaistei, nekā viņš jebkad dos, nav ilgtspējīgi.</p>',
            key_points: [
                '<b>Formula:</b> CAC = Kopējie Pārdošanas un Mārketinga Izdevumi ÷ Piesaistīto Jauno Klientu Skaits.',
                '<b>Iekļaujiet VISAS piesaistes izmaksas:</b> reklāmas izdevumus, pārdošanas komandas algas, mārketinga rīkus un satura veidošanu.',
                '<b>Sekojiet pa kanāliem:</b> jaukts CAC visos kanālos slēpj, kuri kanāli ir efektīvi un kuri izšķērdīgi.',
            ],
            howto: [
                { question: 'Kas tiek uzskatīts par "mārketinga izdevumiem" šajā aprēķinā?', answer: '<p>Ideālā gadījumā visas klientu piesaistes izmaksas: reklāma, mārketinga/pārdošanas personāla algas, rīki/programmatūra, aģentūru maksas un satura izmaksas.</p>' },
                { question: 'Kāds CAC tiek uzskatīts par veselīgu?', answer: '<p>Universāla skaitļa nav — tas ir jēgpilns tikai attiecībā pret CLV. Bieža mērķauditorija ir CLV vismaz 3x lielāks par CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Kopējie Pārdošanas un Mārketinga Izdevumi', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Piesaistīto Jauno Klientu Skaits', type: 'number', min: 1, max: 10000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'cac', label: 'Klientu Piesaistes Izmaksas', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-kosztu-pozyskania-klienta-cac',
            title: 'Kalkulator Kosztu Pozyskania Klienta (CAC)',
            h1: 'Kalkulator Kosztu Pozyskania Klienta (CAC)',
            meta_title: 'Kalkulator CAC | Koszt Pozyskania Nowego Klienta',
            meta_description: 'Oblicz koszt pozyskania klienta (CAC) na podstawie całkowitych wydatków na marketing/sprzedaż i liczby pozyskanych nowych klientów.',
            short_answer: 'Ten kalkulator oblicza Koszt Pozyskania Klienta (CAC) — ile średnio wydałeś na pozyskanie każdego nowego klienta.',
            intro_text: '<p>CAC dzieli całkowite wydatki na sprzedaż i marketing w danym okresie przez liczbę nowych klientów pozyskanych w tym samym okresie. To fundamentalny wskaźnik efektywności: rosnący CAC zwykle sygnalizuje nasycenie rynku.</p><p><b>Porównuj CAC z CLV</b> (zobacz nasz kalkulator CLV) — wydawanie więcej na pozyskanie klienta niż kiedykolwiek przyniesie, jest niezrównoważone.</p>',
            key_points: [
                '<b>Wzór:</b> CAC = Całkowite Wydatki na Sprzedaż i Marketing ÷ Liczba Pozyskanych Nowych Klientów.',
                '<b>Uwzględnij WSZYSTKIE koszty pozyskania:</b> wydatki na reklamę, pensje zespołu sprzedaży, narzędzia marketingowe i produkcję treści.',
                '<b>Śledź według kanałów:</b> uśredniony CAC ukrywa, które kanały są efektywne, a które marnotrawne.',
            ],
            howto: [
                { question: 'Co liczy się jako "wydatki marketingowe" w tym obliczeniu?', answer: '<p>Idealnie wszystkie koszty pozyskiwania klientów: wydatki na reklamę, pensje marketingu/sprzedaży, narzędzia/oprogramowanie, opłaty agencyjne i koszty treści.</p>' },
                { question: 'Jaki CAC jest uznawany za zdrowy?', answer: '<p>Nie ma uniwersalnej liczby — ma sens tylko w odniesieniu do CLV. Częstym celem jest CLV co najmniej 3x wyższe niż CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Całkowite Wydatki na Sprzedaż i Marketing', type: 'number', unit: 'zł', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Liczba Pozyskanych Nowych Klientów', type: 'number', min: 1, max: 10000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'cac', label: 'Koszt Pozyskania Klienta', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-coste-de-adquisicion-de-clientes-cac',
            title: 'Calculadora de Coste de Adquisición de Clientes (CAC)',
            h1: 'Calculadora de Coste de Adquisición de Clientes (CAC)',
            meta_title: 'Calculadora CAC | Coste de Adquirir un Nuevo Cliente',
            meta_description: 'Calcula el coste de adquisición de clientes (CAC) a partir del gasto total en marketing/ventas y el número de nuevos clientes adquiridos.',
            short_answer: 'Esta calculadora calcula el Coste de Adquisición de Clientes (CAC) — cuánto gastaste, de media, para adquirir cada nuevo cliente.',
            intro_text: '<p>El CAC divide tu gasto total en ventas y marketing durante un periodo entre el número de nuevos clientes adquiridos en ese mismo periodo. Es una métrica de eficiencia fundamental: un CAC creciente suele señalar saturación del mercado.</p><p><b>Compara el CAC con el CLV</b> (ver nuestra Calculadora de CLV) — gastar más en adquirir un cliente de lo que valdrá nunca es insostenible.</p>',
            key_points: [
                '<b>Fórmula:</b> CAC = Gasto Total en Ventas y Marketing ÷ Número de Nuevos Clientes Adquiridos.',
                '<b>Incluye TODOS los costes de adquisición:</b> gasto publicitario, salarios del equipo de ventas, herramientas de marketing y producción de contenido.',
                '<b>Rastrea por canal:</b> el CAC combinado de todos los canales oculta cuáles son eficientes y cuáles derrochadores.',
            ],
            howto: [
                { question: '¿Qué cuenta como "gasto de marketing" en este cálculo?', answer: '<p>Idealmente todos los costes de adquisición de clientes: gasto publicitario, salarios de marketing/ventas, herramientas/software, honorarios de agencia y costes de contenido.</p>' },
                { question: '¿Qué CAC es "saludable"?', answer: '<p>No hay un número universal — solo tiene sentido en relación con el CLV. Un objetivo común es un CLV al menos 3 veces el CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Gasto Total en Ventas y Marketing', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Nuevos Clientes Adquiridos', type: 'number', min: 1, max: 10000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'cac', label: 'Coste de Adquisición de Clientes', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-cout-dacquisition-client-cac',
            title: 'Calculateur de Coût d’Acquisition Client (CAC)',
            h1: 'Calculateur de Coût d’Acquisition Client (CAC)',
            meta_title: 'Calculateur CAC | Coût d’Acquisition d’un Nouveau Client',
            meta_description: 'Calculez le coût d’acquisition client (CAC) à partir des dépenses totales de marketing/vente et du nombre de nouveaux clients acquis.',
            short_answer: 'Ce calculateur calcule le Coût d’Acquisition Client (CAC) — combien vous avez dépensé, en moyenne, pour acquérir chaque nouveau client.',
            intro_text: '<p>Le CAC divise vos dépenses totales de vente et marketing sur une période par le nombre de nouveaux clients acquis durant cette même période. C’est une métrique d’efficacité fondamentale : un CAC croissant signale souvent une saturation du marché.</p><p><b>Comparez le CAC au CLV</b> (voir notre Calculateur de CLV) — dépenser plus pour acquérir un client que ce qu’il rapportera jamais n’est pas viable.</p>',
            key_points: [
                '<b>Formule :</b> CAC = Dépenses Totales de Vente et Marketing ÷ Nombre de Nouveaux Clients Acquis.',
                '<b>Incluez TOUS les coûts d’acquisition :</b> dépenses publicitaires, salaires de l’équipe commerciale, outils marketing et production de contenu.',
                '<b>Suivez par canal :</b> un CAC mélangé sur tous les canaux masque quels canaux sont efficaces et lesquels sont gaspilleurs.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte comme « dépenses marketing » dans ce calcul ?', answer: '<p>Idéalement tous les coûts d’acquisition de clients : dépenses publicitaires, salaires marketing/vente, outils/logiciels, honoraires d’agence et coûts de contenu.</p>' },
                { question: 'Quel CAC est « sain » ?', answer: '<p>Il n’y a pas de chiffre universel — il n’a de sens que par rapport au CLV. Un objectif courant est un CLV au moins 3 fois supérieur au CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Dépenses Totales de Vente et Marketing', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Nouveaux Clients Acquis', type: 'number', min: 1, max: 10000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'cac', label: 'Coût d’Acquisition Client', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-costo-di-acquisizione-cliente-cac',
            title: 'Calcolatore del Costo di Acquisizione Cliente (CAC)',
            h1: 'Calcolatore del Costo di Acquisizione Cliente (CAC)',
            meta_title: 'Calcolatore CAC | Costo per Acquisire un Nuovo Cliente',
            meta_description: 'Calcola il costo di acquisizione cliente (CAC) a partire dalla spesa totale in marketing/vendite e dal numero di nuovi clienti acquisiti.',
            short_answer: 'Questo calcolatore calcola il Costo di Acquisizione Cliente (CAC) — quanto hai speso, in media, per acquisire ogni nuovo cliente.',
            intro_text: '<p>Il CAC divide la tua spesa totale in vendite e marketing per un periodo per il numero di nuovi clienti acquisiti nello stesso periodo. È una metrica di efficienza fondamentale: un CAC crescente segnala solitamente saturazione del mercato.</p><p><b>Confronta il CAC con il CLV</b> (vedi il nostro Calcolatore CLV) — spendere di più per acquisire un cliente di quanto varrà mai non è sostenibile.</p>',
            key_points: [
                '<b>Formula:</b> CAC = Spesa Totale in Vendite e Marketing ÷ Numero di Nuovi Clienti Acquisiti.',
                '<b>Includi TUTTI i costi di acquisizione:</b> spesa pubblicitaria, stipendi del team vendite, strumenti di marketing e produzione di contenuti.',
                '<b>Monitora per canale:</b> il CAC combinato su tutti i canali nasconde quali canali sono efficienti e quali dispendiosi.',
            ],
            howto: [
                { question: 'Cosa conta come "spesa di marketing" in questo calcolo?', answer: '<p>Idealmente tutti i costi di acquisizione clienti: spesa pubblicitaria, stipendi marketing/vendite, strumenti/software, commissioni agenzia e costi dei contenuti.</p>' },
                { question: 'Quale CAC è considerato "sano"?', answer: '<p>Non esiste un numero universale — ha senso solo rispetto al CLV. Un obiettivo comune è un CLV almeno 3 volte il CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Spesa Totale in Vendite e Marketing', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Nuovi Clienti Acquisiti', type: 'number', min: 1, max: 10000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'cac', label: 'Costo di Acquisizione Cliente', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'kundenakquisitionskosten-cac-rechner',
            title: 'Kundenakquisitionskosten (CAC) Rechner',
            h1: 'Kundenakquisitionskosten (CAC) Rechner',
            meta_title: 'CAC-Rechner | Kosten zur Gewinnung eines Neuen Kunden',
            meta_description: 'Berechnen Sie die Kundenakquisitionskosten (CAC) aus den gesamten Marketing-/Vertriebsausgaben und der Anzahl gewonnener Neukunden.',
            short_answer: 'Dieser Rechner berechnet die Kundenakquisitionskosten (CAC) — wie viel Sie im Durchschnitt ausgegeben haben, um jeden neuen Kunden zu gewinnen.',
            intro_text: '<p>CAC teilt Ihre gesamten Vertriebs- und Marketingausgaben für einen Zeitraum durch die Anzahl der in diesem Zeitraum gewonnenen Neukunden. Es ist eine grundlegende Effizienzkennzahl: steigende CAC signalisiert meist Marktsättigung.</p><p><b>Vergleichen Sie CAC mit CLV</b> (siehe unseren CLV-Rechner) — mehr für die Gewinnung eines Kunden auszugeben, als er jemals wert sein wird, ist nicht nachhaltig.</p>',
            key_points: [
                '<b>Formel:</b> CAC = Gesamte Vertriebs- und Marketingausgaben ÷ Anzahl Gewonnener Neukunden.',
                '<b>Beziehen Sie ALLE Akquisitionskosten ein:</b> Werbeausgaben, Gehälter des Vertriebsteams, Marketing-Tools und Content-Produktion.',
                '<b>Nach Kanal verfolgen:</b> gemischte CAC über alle Kanäle verbirgt, welche Kanäle effizient und welche verschwenderisch sind.',
            ],
            howto: [
                { question: 'Was zählt als "Marketingausgaben" in dieser Berechnung?', answer: '<p>Idealerweise alle Kosten der Kundengewinnung: Werbeausgaben, Gehälter für Marketing/Vertrieb, Tools/Software, Agenturgebühren und Content-Kosten.</p>' },
                { question: 'Was ist ein "gesunder" CAC?', answer: '<p>Es gibt keine universelle Zahl — sie ist nur im Verhältnis zum CLV sinnvoll. Ein gängiges Ziel ist ein CLV mindestens 3x höher als der CAC.</p>' },
            ],
            inputs: [
                { name: 'marketing_spend', label: 'Gesamte Vertriebs- und Marketingausgaben', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'new_customers', label: 'Gewonnene Neukunden', type: 'number', min: 1, max: 10000000, placeholder: '100' },
            ],
            outputs: [
                { name: 'cac', label: 'Kundenakquisitionskosten', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1054: Price per Unit Calculator
// ============================================================
const pricePerUnit: ToolDef = {
    id: '1054',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'total_price', default: 12 },
            { key: 'quantity', default: 4 },
        ],
        formulas: {
            unit_price: 'total_price/quantity',
        },
        outputs: [
            { key: 'unit_price', precision: 4 },
        ],
    },
    locales: {
        en: {
            slug: 'price-per-unit-calculator',
            title: 'Price per Unit Calculator',
            h1: 'Price per Unit Calculator',
            meta_title: 'Price per Unit Calculator | Compare Deals by Unit Cost',
            meta_description: 'Calculate the price per unit (per item, kg, liter, or any measure) from a total price and quantity — the fastest way to compare deals.',
            short_answer: 'This calculator divides a total price by quantity to give you the price per single unit — the key number for comparing which pack size or deal is actually cheaper.',
            intro_text: '<p>A bigger pack isn\'t always the better deal — the only fair way to compare is price per unit (per item, per kg, per liter, whatever the relevant measure is). This calculator does that single division for you.</p><p><b>Retailers</b> use this to set and audit shelf-tag unit pricing (often legally required); <b>shoppers</b> use it to compare pack sizes at a glance.</p>',
            key_points: [
                '<b>Formula:</b> Price per Unit = Total Price ÷ Quantity.',
                '<b>Always compare the same unit:</b> to compare a 500g pack against a 1kg pack, convert both to price-per-kg first — comparing price-per-pack directly is misleading.',
                '<b>Unit pricing is often mandated by law</b> on grocery shelf tags in the EU and elsewhere, precisely because raw pack price is easy to misjudge.',
            ],
            howto: [
                { question: 'How do I compare two different pack sizes?', answer: '<p>Calculate the price per unit for each pack separately (using the same unit of measure — e.g. both per kg or both per liter), then compare the two unit prices directly. The lower one is the better deal.</p>' },
                { question: 'What counts as a "unit" here?', answer: '<p>Whatever makes sense for what you\'re buying — a single item, a kilogram, a liter, 100 sheets, etc. The formula is the same regardless; just be consistent with what "quantity" represents.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Total Price', type: 'number', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Quantity (units, kg, liters, etc.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
                currencyInput,
            ],
            outputs: [
                { name: 'unit_price', label: 'Price per Unit', unitFrom: 'currency', precision: 4 },
            ],
        },
        ru: {
            slug: 'kalkulyator-tseny-za-edinitsu',
            title: 'Калькулятор цены за единицу',
            h1: 'Калькулятор цены за единицу',
            meta_title: 'Калькулятор цены за единицу | Сравнение предложений по цене за единицу',
            meta_description: 'Рассчитайте цену за единицу (за штуку, кг, литр или любую меру) из общей цены и количества — самый быстрый способ сравнить предложения.',
            short_answer: 'Этот калькулятор делит общую цену на количество, чтобы получить цену за одну единицу — ключевое число для сравнения, какая упаковка или предложение действительно дешевле.',
            intro_text: '<p>Больший размер упаковки не всегда выгоднее — единственный честный способ сравнения — цена за единицу (за штуку, за кг, за литр). Этот калькулятор делает это единственное деление за вас.</p><p><b>Продавцы</b> используют это для установки и проверки цены за единицу на ценниках; <b>покупатели</b> — для сравнения размеров упаковок с первого взгляда.</p>',
            key_points: [
                '<b>Формула:</b> Цена за единицу = Общая цена ÷ Количество.',
                '<b>Всегда сравнивайте одну и ту же единицу:</b> чтобы сравнить упаковку 500г с упаковкой 1кг, сначала переведите обе в цену за кг.',
                '<b>Указание цены за единицу часто требуется по закону</b> на ценниках в продуктовых магазинах в ЕС и других странах.',
            ],
            howto: [
                { question: 'Как сравнить два разных размера упаковки?', answer: '<p>Рассчитайте цену за единицу для каждой упаковки отдельно (используя одну и ту же меру), затем сравните две цены напрямую. Меньшая — более выгодное предложение.</p>' },
                { question: 'Что считается "единицей" здесь?', answer: '<p>То, что имеет смысл для покупаемого товара — отдельный предмет, килограмм, литр, 100 листов и т.д. Формула та же в любом случае.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Общая цена', type: 'number', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Количество (шт, кг, л и т.д.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'unit_price', label: 'Цена за единицу', unitFrom: 'currency', precision: 4 },
            ],
        },
        lv: {
            slug: 'cenas-par-vienibu-kalkulators',
            title: 'Cenas par Vienību Kalkulators',
            h1: 'Cenas par Vienību Kalkulators',
            meta_title: 'Cenas par Vienību Kalkulators | Salīdziniet Piedāvājumus pēc Vienības Cenas',
            meta_description: 'Aprēķiniet cenu par vienību (par gabalu, kg, litru vai jebkuru mēru) no kopējās cenas un daudzuma — ātrākais veids, kā salīdzināt piedāvājumus.',
            short_answer: 'Šis kalkulators dala kopējo cenu ar daudzumu, lai iegūtu cenu par vienu vienību — galveno skaitli, lai salīdzinātu, kurš iepakojuma izmērs vai piedāvājums patiešām ir lētāks.',
            intro_text: '<p>Lielāks iepakojums ne vienmēr ir labāks piedāvājums — vienīgais godīgais veids, kā salīdzināt, ir cena par vienību. Šis kalkulators veic šo vienkāršo dalījumu jūsu vietā.</p><p><b>Mazumtirgotāji</b> to izmanto, lai iestatītu un pārbaudītu vienības cenu; <b>pircēji</b> — lai salīdzinātu iepakojuma izmērus vienā acu skatienā.</p>',
            key_points: [
                '<b>Formula:</b> Cena par Vienību = Kopējā Cena ÷ Daudzums.',
                '<b>Vienmēr salīdziniet to pašu vienību:</b> lai salīdzinātu 500g iepakojumu ar 1kg iepakojumu, vispirms pārvērtiet abus cenā par kg.',
                '<b>Vienības cena bieži ir likumā noteikta</b> pārtikas veikalu plauktu etiķetēs ES un citur.',
            ],
            howto: [
                { question: 'Kā salīdzināt divus dažādus iepakojuma izmērus?', answer: '<p>Aprēķiniet cenu par vienību katram iepakojumam atsevišķi (izmantojot to pašu mēru), tad salīdziniet abas vienības cenas tieši.</p>' },
                { question: 'Kas šeit tiek uzskatīts par "vienību"?', answer: '<p>Jebkas, kas ir jēgpilns tam, ko pērkat — atsevišķa prece, kilograms, litrs, 100 lapas utt.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Kopējā Cena', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Daudzums (gab, kg, l utt.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'unit_price', label: 'Cena par Vienību', unit: '€', precision: 4 },
            ],
        },
        pl: {
            slug: 'kalkulator-ceny-za-jednostke',
            title: 'Kalkulator Ceny za Jednostkę',
            h1: 'Kalkulator Ceny za Jednostkę',
            meta_title: 'Kalkulator Ceny za Jednostkę | Porównaj Oferty wg Kosztu Jednostkowego',
            meta_description: 'Oblicz cenę za jednostkę (za sztukę, kg, litr lub dowolną miarę) z ceny całkowitej i ilości — najszybszy sposób na porównanie ofert.',
            short_answer: 'Ten kalkulator dzieli cenę całkowitą przez ilość, aby uzyskać cenę za jedną jednostkę — kluczową liczbę do porównania, które opakowanie lub oferta jest rzeczywiście tańsza.',
            intro_text: '<p>Większe opakowanie nie zawsze jest lepszą ofertą — jedynym uczciwym sposobem porównania jest cena za jednostkę. Ten kalkulator wykonuje za ciebie to proste dzielenie.</p><p><b>Sprzedawcy</b> używają tego do ustalania i audytowania cen jednostkowych na metkach; <b>kupujący</b> — do szybkiego porównania rozmiarów opakowań.</p>',
            key_points: [
                '<b>Wzór:</b> Cena za Jednostkę = Cena Całkowita ÷ Ilość.',
                '<b>Zawsze porównuj tę samą jednostkę:</b> aby porównać opakowanie 500g z opakowaniem 1kg, najpierw przelicz obie na cenę za kg.',
                '<b>Cena jednostkowa jest często wymagana prawem</b> na metkach w sklepach spożywczych w UE i gdzie indziej.',
            ],
            howto: [
                { question: 'Jak porównać dwa różne rozmiary opakowań?', answer: '<p>Oblicz cenę za jednostkę dla każdego opakowania osobno (używając tej samej miary), a następnie porównaj obie ceny jednostkowe bezpośrednio.</p>' },
                { question: 'Co liczy się tutaj jako "jednostka"?', answer: '<p>Cokolwiek ma sens dla tego, co kupujesz — pojedynczy element, kilogram, litr, 100 arkuszy itp.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Cena Całkowita', type: 'number', unit: 'zł', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Ilość (szt, kg, l itd.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'unit_price', label: 'Cena za Jednostkę', unit: 'zł', precision: 4 },
            ],
        },
        es: {
            slug: 'calculadora-de-precio-por-unidad',
            title: 'Calculadora de Precio por Unidad',
            h1: 'Calculadora de Precio por Unidad',
            meta_title: 'Calculadora de Precio por Unidad | Compara Ofertas por Coste Unitario',
            meta_description: 'Calcula el precio por unidad (por artículo, kg, litro o cualquier medida) a partir de un precio total y una cantidad — la forma más rápida de comparar ofertas.',
            short_answer: 'Esta calculadora divide un precio total entre la cantidad para darte el precio por unidad — el número clave para comparar qué tamaño de paquete u oferta es realmente más barato.',
            intro_text: '<p>Un paquete más grande no siempre es mejor oferta — la única forma justa de comparar es el precio por unidad. Esta calculadora hace esa división por ti.</p><p><b>Los comercios en España</b> usan esto para fijar y auditar el precio por unidad de medida en las etiquetas (a menudo obligatorio por ley); <b>los compradores</b>, para comparar tamaños de paquete de un vistazo.</p>',
            key_points: [
                '<b>Fórmula:</b> Precio por Unidad = Precio Total ÷ Cantidad.',
                '<b>Compara siempre la misma unidad:</b> para comparar un paquete de 500g con uno de 1kg, convierte primero ambos a precio por kg.',
                '<b>El precio por unidad suele ser obligatorio por ley</b> en las etiquetas de supermercados en la UE y otros lugares.',
            ],
            howto: [
                { question: '¿Cómo comparo dos tamaños de paquete diferentes?', answer: '<p>Calcula el precio por unidad de cada paquete por separado (usando la misma unidad de medida), luego compara los dos precios unitarios directamente.</p>' },
                { question: '¿Qué cuenta como "unidad" aquí?', answer: '<p>Lo que tenga sentido para lo que estás comprando — un artículo, un kilogramo, un litro, 100 hojas, etc.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Precio Total', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Cantidad (uds, kg, l, etc.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'unit_price', label: 'Precio por Unidad', unit: '€', precision: 4 },
            ],
        },
        fr: {
            slug: 'calculateur-de-prix-a-lunite',
            title: 'Calculateur de Prix à l’Unité',
            h1: 'Calculateur de Prix à l’Unité',
            meta_title: 'Calculateur de Prix à l’Unité | Comparer les Offres par Coût Unitaire',
            meta_description: 'Calculez le prix à l’unité (par article, kg, litre ou toute autre mesure) à partir d’un prix total et d’une quantité — le moyen le plus rapide de comparer des offres.',
            short_answer: 'Ce calculateur divise un prix total par la quantité pour vous donner le prix à l’unité — le chiffre clé pour comparer quel format ou offre est réellement le moins cher.',
            intro_text: '<p>Un plus grand format n’est pas toujours la meilleure affaire — la seule façon équitable de comparer est le prix à l’unité. Ce calculateur fait cette simple division pour vous.</p><p><b>Les commerçants en France</b> utilisent cela pour fixer et vérifier le prix au kilo/litre sur les étiquettes (souvent une obligation légale) ; <b>les acheteurs</b>, pour comparer les formats en un coup d’œil.</p>',
            key_points: [
                '<b>Formule :</b> Prix à l’Unité = Prix Total ÷ Quantité.',
                '<b>Comparez toujours la même unité :</b> pour comparer un paquet de 500g à un paquet de 1kg, convertissez d’abord les deux en prix au kg.',
                '<b>Le prix à l’unité est souvent une obligation légale</b> sur les étiquettes des rayons en UE et ailleurs.',
            ],
            howto: [
                { question: 'Comment comparer deux formats différents ?', answer: '<p>Calculez le prix à l’unité pour chaque format séparément (en utilisant la même unité de mesure), puis comparez directement les deux prix unitaires.</p>' },
                { question: 'Qu’est-ce qui compte comme « unité » ici ?', answer: '<p>Ce qui a du sens pour ce que vous achetez — un article, un kilogramme, un litre, 100 feuilles, etc.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Prix Total', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Quantité (unités, kg, litres, etc.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'unit_price', label: 'Prix à l’Unité', unit: '€', precision: 4 },
            ],
        },
        it: {
            slug: 'calcolatore-prezzo-per-unita',
            title: 'Calcolatore del Prezzo per Unità',
            h1: 'Calcolatore del Prezzo per Unità',
            meta_title: 'Calcolatore Prezzo per Unità | Confronta le Offerte per Costo Unitario',
            meta_description: 'Calcola il prezzo per unità (per pezzo, kg, litro o qualsiasi misura) a partire da un prezzo totale e una quantità — il modo più rapido per confrontare le offerte.',
            short_answer: 'Questo calcolatore divide un prezzo totale per la quantità per darti il prezzo per una singola unità — il numero chiave per confrontare quale formato o offerta sia davvero più conveniente.',
            intro_text: '<p>Una confezione più grande non è sempre l’affare migliore — l’unico modo corretto di confrontare è il prezzo per unità. Questo calcolatore fa questa semplice divisione per te.</p><p><b>I negozianti in Italia</b> lo usano per impostare e verificare il prezzo per unità di misura sulle etichette (spesso obbligatorio per legge); <b>i clienti</b>, per confrontare le dimensioni delle confezioni a colpo d’occhio.</p>',
            key_points: [
                '<b>Formula:</b> Prezzo per Unità = Prezzo Totale ÷ Quantità.',
                '<b>Confronta sempre la stessa unità:</b> per confrontare una confezione da 500g con una da 1kg, converti prima entrambe in prezzo per kg.',
                '<b>Il prezzo per unità è spesso obbligatorio per legge</b> sulle etichette dei supermercati nell’UE e altrove.',
            ],
            howto: [
                { question: 'Come confronto due formati di confezione diversi?', answer: '<p>Calcola il prezzo per unità per ogni confezione separatamente (usando la stessa unità di misura), poi confronta direttamente i due prezzi unitari.</p>' },
                { question: 'Cosa conta come "unità" qui?', answer: '<p>Qualsiasi cosa abbia senso per ciò che stai acquistando — un singolo articolo, un chilogrammo, un litro, 100 fogli, ecc.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Prezzo Totale', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Quantità (pezzi, kg, litri, ecc.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'unit_price', label: 'Prezzo per Unità', unit: '€', precision: 4 },
            ],
        },
        de: {
            slug: 'preis-pro-einheit-rechner',
            title: 'Preis-pro-Einheit-Rechner',
            h1: 'Preis-pro-Einheit-Rechner',
            meta_title: 'Preis-pro-Einheit-Rechner | Angebote nach Stückkosten Vergleichen',
            meta_description: 'Berechnen Sie den Preis pro Einheit (pro Stück, kg, Liter oder jedem Maß) aus Gesamtpreis und Menge — der schnellste Weg, Angebote zu vergleichen.',
            short_answer: 'Dieser Rechner teilt einen Gesamtpreis durch die Menge, um Ihnen den Preis pro einzelner Einheit zu geben — die entscheidende Zahl, um zu vergleichen, welche Packungsgröße oder welches Angebot tatsächlich günstiger ist.',
            intro_text: '<p>Eine größere Packung ist nicht immer das bessere Angebot — der einzig faire Vergleich ist der Preis pro Einheit. Dieser Rechner erledigt diese einfache Division für Sie.</p><p><b>Einzelhändler in Deutschland</b> nutzen dies, um Grundpreise auf Regaletiketten festzulegen und zu prüfen (oft gesetzlich vorgeschrieben); <b>Käufer</b>, um Packungsgrößen auf einen Blick zu vergleichen.</p>',
            key_points: [
                '<b>Formel:</b> Preis pro Einheit = Gesamtpreis ÷ Menge.',
                '<b>Vergleichen Sie immer dieselbe Einheit:</b> um eine 500g-Packung mit einer 1kg-Packung zu vergleichen, rechnen Sie zuerst beide auf Preis pro kg um.',
                '<b>Der Grundpreis ist in Deutschland gesetzlich vorgeschrieben</b> (Preisangabenverordnung) auf Supermarkt-Regaletiketten.',
            ],
            howto: [
                { question: 'Wie vergleiche ich zwei verschiedene Packungsgrößen?', answer: '<p>Berechnen Sie den Preis pro Einheit für jede Packung separat (mit demselben Maß), und vergleichen Sie dann die beiden Einheitspreise direkt.</p>' },
                { question: 'Was zählt hier als "Einheit"?', answer: '<p>Was auch immer für Ihren Einkauf sinnvoll ist — ein einzelner Artikel, ein Kilogramm, ein Liter, 100 Blatt usw.</p>' },
            ],
            inputs: [
                { name: 'total_price', label: 'Gesamtpreis', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '12' },
                { name: 'quantity', label: 'Menge (Stück, kg, Liter usw.)', type: 'number', min: 0.0001, max: 100000000, placeholder: '4' },
            ],
            outputs: [
                { name: 'unit_price', label: 'Preis pro Einheit', unit: '€', precision: 4 },
            ],
        },
    },
}

// ============================================================
// 1055: Retail Price from Wholesale Calculator (currency toggle + per-locale VAT default)
// ============================================================
const retailFromWholesale: ToolDef = {
    id: '1055',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'wholesale_price', default: 40 },
            { key: 'markup_pct', default: 100 },
            { key: 'vat_rate', default: 20 },
        ],
        formulas: {
            retail_price: 'wholesale_price*(1+markup_pct/100)*(1+vat_rate/100)',
            retail_price_ex_vat: 'wholesale_price*(1+markup_pct/100)',
        },
        outputs: [
            { key: 'retail_price_ex_vat', precision: 2 },
            { key: 'retail_price', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'retail-price-from-wholesale-calculator',
            title: 'Retail Price from Wholesale Calculator',
            h1: 'Retail Price from Wholesale Calculator',
            meta_title: 'Retail Pricing Calculator | Wholesale Cost to Shelf Price',
            meta_description: 'Calculate the retail shelf price (with and without VAT) from a wholesale cost and your desired markup percentage.',
            short_answer: 'This calculator turns a wholesale/cost price into a retail shelf price by applying your markup, then shows the final consumer price including tax.',
            intro_text: '<p>Retailers buy at wholesale, add a markup to cover overhead and profit, then (in most countries) add tax on top to reach the final consumer-facing price. This calculator chains all three steps: wholesale → marked-up price → tax-inclusive retail price.</p><p><b>Retail buyers and small business owners</b> use this to quickly price new stock without a spreadsheet.</p>',
            key_points: [
                '<b>Formula:</b> Retail Price (ex-tax) = Wholesale Price × (1 + Markup % ÷ 100); Retail Price (with tax) = Retail Price (ex-tax) × (1 + Tax Rate % ÷ 100).',
                '<b>Markup vs margin:</b> a 100% markup on wholesale is a 50% margin on the resulting retail (ex-tax) price — they are not the same number. Use our Markup Calculator to convert between the two if needed.',
                '<b>Adjust the tax rate</b> to match your local jurisdiction — the default here is a general reference rate, not necessarily your country\'s.',
            ],
            howto: [
                { question: 'Should the markup be applied before or after tax?', answer: '<p>Markup should be applied first, to the wholesale cost. Tax is then applied on top of the marked-up (retail ex-tax) price, since tax is generally due on the final sale price, not the wholesale cost.</p>' },
                { question: 'What markup percentage should I use?', answer: '<p>This varies enormously by industry — apparel retailers often use 100%+ markups (keystone pricing), while grocery margins are typically much thinner. There\'s no universal answer; it depends on your category and overhead.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Wholesale Price', type: 'number', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Markup', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'VAT / Tax Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
                currencyInput,
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Retail Price (before tax)', unitFrom: 'currency', precision: 2 },
                { name: 'retail_price', label: 'Retail Price (with tax)', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-roznichnoy-tseny-iz-optovoy',
            title: 'Калькулятор розничной цены из оптовой',
            h1: 'Калькулятор розничной цены из оптовой',
            meta_title: 'Калькулятор розничной цены | От оптовой стоимости до цены на полке',
            meta_description: 'Рассчитайте розничную цену на полке (с НДС и без) из оптовой стоимости и желаемой наценки.',
            short_answer: 'Этот калькулятор превращает оптовую цену в розничную цену на полке, применяя вашу наценку, затем показывает итоговую цену для потребителя с учётом налога.',
            intro_text: '<p>Розничные продавцы покупают оптом, добавляют наценку для покрытия расходов и прибыли, затем (в большинстве стран) добавляют налог сверху, чтобы получить итоговую цену для потребителя.</p><p><b>Розничные покупатели и владельцы малого бизнеса</b> используют это, чтобы быстро оценить новый товар без таблиц.</p>',
            key_points: [
                '<b>Формула:</b> Розничная цена (без налога) = Оптовая цена × (1 + Наценка % ÷ 100); Розничная цена (с налогом) = Розничная цена (без налога) × (1 + Ставка налога % ÷ 100).',
                '<b>Наценка vs маржа:</b> наценка 100% на оптовую цену — это маржа 50% на итоговой розничной (без налога) цене — это не одно и то же число.',
                '<b>Скорректируйте ставку налога</b> под вашу юрисдикцию — значение по умолчанию здесь — справочная ставка, не обязательно вашей страны.',
            ],
            howto: [
                { question: 'Наценку применять до или после налога?', answer: '<p>Наценка применяется первой, к оптовой стоимости. Затем налог применяется поверх наценённой (розничной без налога) цены.</p>' },
                { question: 'Какую наценку использовать?', answer: '<p>Сильно зависит от отрасли — розница одежды часто использует наценки 100%+, тогда как маржа в продуктовых магазинах обычно намного тоньше.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Оптовая цена', type: 'number', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Наценка', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'Ставка НДС', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
                currencyInputRu,
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Розничная цена (без налога)', unitFrom: 'currency', precision: 2 },
                { name: 'retail_price', label: 'Розничная цена (с налогом)', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'mazumtirdzniecibas-cenas-no-vairumtirdzniecibas-kalkulators',
            title: 'Mazumtirdzniecības Cenas no Vairumtirdzniecības Kalkulators',
            h1: 'Mazumtirdzniecības Cenas no Vairumtirdzniecības Kalkulators',
            meta_title: 'Mazumtirdzniecības Cenas Kalkulators | No Vairumtirdzniecības Izmaksām līdz Plaukta Cenai',
            meta_description: 'Aprēķiniet mazumtirdzniecības plaukta cenu (ar un bez PVN) no vairumtirdzniecības izmaksām un vēlamās uzcenas — noklusējuma PVN likme atbilst Latvijas 21%.',
            short_answer: 'Šis kalkulators pārvērš vairumtirdzniecības/pašizmaksas cenu par mazumtirdzniecības plaukta cenu, piemērojot jūsu uzcenu, tad parāda gala cenu patērētājam ar nodokli.',
            intro_text: '<p>Mazumtirgotāji pērk vairumā, pievieno uzcenu, lai segtu izmaksas un peļņu, tad (lielākajā daļā valstu) pievieno nodokli, lai iegūtu gala cenu patērētājam. Šis kalkulators apvieno visus trīs soļus.</p><p><b>Mazumtirdzniecības pircēji un mazo uzņēmumu īpašnieki</b> to izmanto, lai ātri noteiktu jauna preču krājuma cenu.</p>',
            key_points: [
                '<b>Formula:</b> Mazumtirdzniecības Cena (bez nodokļa) = Vairumtirdzniecības Cena × (1 + Uzcena % ÷ 100); Mazumtirdzniecības Cena (ar nodokli) = ... × (1 + PVN Likme % ÷ 100).',
                '<b>Uzcena pret peļņas normu:</b> 100% uzcena vairumtirdzniecības cenai ir 50% peļņas norma gala mazumtirdzniecības (bez nodokļa) cenai — tie nav vienādi skaitļi.',
                '<b>Pielāgojiet PVN likmi</b> savai jurisdikcijai — Latvijas standarta likme ir 21%.',
            ],
            howto: [
                { question: 'Vai uzcena jāpiemēro pirms vai pēc nodokļa?', answer: '<p>Uzcena jāpiemēro vispirms, vairumtirdzniecības izmaksām. Nodoklis pēc tam tiek piemērots virs uzcenotās (mazumtirdzniecības bez nodokļa) cenas.</p>' },
                { question: 'Kādu uzcenas procentu izmantot?', answer: '<p>Tas ļoti atšķiras pēc nozares — apģērbu mazumtirgotāji bieži izmanto 100%+ uzcenas, kamēr pārtikas veikalu peļņas normas parasti ir daudz šaurākas.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Vairumtirdzniecības Cena', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Uzcena', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'PVN Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '21', default: 21 },
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Mazumtirdzniecības Cena (bez PVN)', unit: '€', precision: 2 },
                { name: 'retail_price', label: 'Mazumtirdzniecības Cena (ar PVN)', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-ceny-detalicznej-z-ceny-hurtowej',
            title: 'Kalkulator Ceny Detalicznej z Ceny Hurtowej',
            h1: 'Kalkulator Ceny Detalicznej z Ceny Hurtowej',
            meta_title: 'Kalkulator Ceny Detalicznej | Od Kosztu Hurtowego do Ceny na Półce',
            meta_description: 'Oblicz cenę detaliczną na półce (z VAT i bez) na podstawie ceny hurtowej i pożądanej marży — domyślna stawka VAT to polskie 23%.',
            short_answer: 'Ten kalkulator zamienia cenę hurtową/kosztową na cenę detaliczną na półce, stosując twoją marżę, a następnie pokazuje ostateczną cenę dla konsumenta z podatkiem.',
            intro_text: '<p>Sprzedawcy detaliczni kupują hurtowo, dodają narzut na pokrycie kosztów i zysku, a następnie (w większości krajów) dodają podatek, aby uzyskać ostateczną cenę dla konsumenta.</p><p><b>Nabywcy detaliczni i właściciele małych firm</b> używają tego do szybkiego wyceniania nowego towaru.</p>',
            key_points: [
                '<b>Wzór:</b> Cena Detaliczna (netto) = Cena Hurtowa × (1 + Narzut % ÷ 100); Cena Detaliczna (brutto) = ... × (1 + Stawka VAT % ÷ 100).',
                '<b>Narzut vs marża:</b> 100% narzutu na cenę hurtową to 50% marży na cenie detalicznej netto — to nie są te same liczby.',
                '<b>Dostosuj stawkę VAT</b> do swojej jurysdykcji — polska standardowa stawka to 23%.',
            ],
            howto: [
                { question: 'Czy narzut stosować przed czy po podatku?', answer: '<p>Narzut należy zastosować najpierw, do ceny hurtowej. Podatek jest następnie stosowany na cenie detalicznej netto.</p>' },
                { question: 'Jaki procent narzutu powinienem użyć?', answer: '<p>To ogromnie różni się w zależności od branży — sprzedawcy odzieży często stosują narzuty 100%+, podczas gdy marże spożywcze są zwykle znacznie cieńsze.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Cena Hurtowa', type: 'number', unit: 'zł', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Narzut', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'Stawka VAT', type: 'number', unit: '%', min: 0, max: 100, placeholder: '23', default: 23 },
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Cena Detaliczna (netto)', unit: 'zł', precision: 2 },
                { name: 'retail_price', label: 'Cena Detaliczna (brutto)', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-precio-de-venta-desde-mayorista',
            title: 'Calculadora de Precio de Venta desde Mayorista',
            h1: 'Calculadora de Precio de Venta desde Mayorista',
            meta_title: 'Calculadora de Precio de Venta | De Coste Mayorista a Precio en Tienda',
            meta_description: 'Calcula el precio de venta al público (con y sin IVA) a partir del coste mayorista y el margen deseado — la tasa por defecto es el 21% español.',
            short_answer: 'Esta calculadora convierte un precio mayorista/de coste en un precio de venta al público aplicando tu margen, y luego muestra el precio final al consumidor con impuesto incluido.',
            intro_text: '<p>Los minoristas compran al por mayor, añaden un margen para cubrir gastos y beneficio, y luego (en la mayoría de países) añaden impuesto para llegar al precio final para el consumidor.</p><p><b>Compradores minoristas y pequeños negocios en España</b> usan esto para fijar precios rápidamente sin una hoja de cálculo.</p>',
            key_points: [
                '<b>Fórmula:</b> Precio de Venta (sin IVA) = Precio Mayorista × (1 + Margen % ÷ 100); Precio de Venta (con IVA) = ... × (1 + Tipo de IVA % ÷ 100).',
                '<b>Margen sobre coste vs margen sobre venta:</b> un 100% de margen sobre el coste mayorista equivale a un 50% de margen sobre el precio de venta final (sin IVA) — no son el mismo número.',
                '<b>Ajusta el tipo de IVA</b> a tu jurisdicción — el tipo general en España es del 21%.',
            ],
            howto: [
                { question: '¿El margen se aplica antes o después del impuesto?', answer: '<p>El margen debe aplicarse primero, al coste mayorista. El impuesto se aplica después, sobre el precio de venta sin IVA.</p>' },
                { question: '¿Qué porcentaje de margen debo usar?', answer: '<p>Varía enormemente según el sector — los minoristas de ropa suelen usar márgenes del 100%+, mientras que los márgenes de alimentación suelen ser mucho más ajustados.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Precio Mayorista', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Margen', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'Tipo de IVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '21', default: 21 },
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Precio de Venta (sin IVA)', unit: '€', precision: 2 },
                { name: 'retail_price', label: 'Precio de Venta (con IVA)', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-prix-de-detail-a-partir-du-prix-de-gros',
            title: 'Calculateur de Prix de Détail à Partir du Prix de Gros',
            h1: 'Calculateur de Prix de Détail à Partir du Prix de Gros',
            meta_title: 'Calculateur de Prix de Détail | Du Coût de Gros au Prix en Rayon',
            meta_description: 'Calculez le prix de détail (avec et sans TVA) à partir d’un coût de gros et de votre marge souhaitée — le taux par défaut est le taux français de 20%.',
            short_answer: 'Ce calculateur transforme un prix de gros/coût en prix de détail en appliquant votre marge, puis affiche le prix final consommateur, taxe incluse.',
            intro_text: '<p>Les détaillants achètent en gros, ajoutent une marge pour couvrir les frais généraux et le profit, puis (dans la plupart des pays) ajoutent la taxe pour arriver au prix final consommateur.</p><p><b>Les acheteurs détaillants et petits commerçants en France</b> utilisent cela pour fixer rapidement le prix d’un nouveau stock.</p>',
            key_points: [
                '<b>Formule :</b> Prix de Détail (HT) = Prix de Gros × (1 + Marge % ÷ 100) ; Prix de Détail (TTC) = ... × (1 + Taux TVA % ÷ 100).',
                '<b>Marge sur coût vs marge sur vente :</b> une marge de 100 % sur le prix de gros correspond à une marge de 50 % sur le prix de détail final (HT) — ce ne sont pas les mêmes chiffres.',
                '<b>Ajustez le taux de TVA</b> à votre juridiction — le taux normal en France est de 20 %.',
            ],
            howto: [
                { question: 'La marge doit-elle être appliquée avant ou après la taxe ?', answer: '<p>La marge doit être appliquée en premier, au coût de gros. La taxe est ensuite appliquée sur le prix de détail HT.</p>' },
                { question: 'Quel pourcentage de marge dois-je utiliser ?', answer: '<p>Cela varie énormément selon le secteur — les détaillants de vêtements utilisent souvent des marges de 100 %+, tandis que les marges alimentaires sont généralement bien plus faibles.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Prix de Gros', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Marge', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'Taux de TVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '20', default: 20 },
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Prix de Détail (HT)', unit: '€', precision: 2 },
                { name: 'retail_price', label: 'Prix de Détail (TTC)', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-prezzo-al-dettaglio-da-ingrosso',
            title: 'Calcolatore Prezzo al Dettaglio da Ingrosso',
            h1: 'Calcolatore Prezzo al Dettaglio da Ingrosso',
            meta_title: 'Calcolatore Prezzo al Dettaglio | Dal Costo all’Ingrosso al Prezzo di Scaffale',
            meta_description: 'Calcola il prezzo al dettaglio (con e senza IVA) a partire dal costo all’ingrosso e dal ricarico desiderato — l’aliquota predefinita è quella italiana del 22%.',
            short_answer: 'Questo calcolatore trasforma un prezzo all’ingrosso/di costo in un prezzo al dettaglio applicando il tuo ricarico, poi mostra il prezzo finale al consumatore con imposta inclusa.',
            intro_text: '<p>I rivenditori comprano all’ingrosso, aggiungono un ricarico per coprire spese e profitto, poi (nella maggior parte dei paesi) aggiungono l’imposta per arrivare al prezzo finale al consumatore.</p><p><b>Acquirenti al dettaglio e piccoli imprenditori in Italia</b> usano questo per prezzare rapidamente nuova merce.</p>',
            key_points: [
                '<b>Formula:</b> Prezzo al Dettaglio (netto) = Prezzo all’Ingrosso × (1 + Ricarico % ÷ 100); Prezzo al Dettaglio (lordo) = ... × (1 + Aliquota IVA % ÷ 100).',
                '<b>Ricarico vs margine:</b> un ricarico del 100% sul prezzo all’ingrosso equivale a un margine del 50% sul prezzo al dettaglio finale (netto) — non sono lo stesso numero.',
                '<b>Regola l’aliquota IVA</b> in base alla tua giurisdizione — l’aliquota ordinaria in Italia è del 22%.',
            ],
            howto: [
                { question: 'Il ricarico va applicato prima o dopo l’imposta?', answer: '<p>Il ricarico va applicato prima, al costo all’ingrosso. L’imposta viene poi applicata sul prezzo al dettaglio netto.</p>' },
                { question: 'Quale percentuale di ricarico dovrei usare?', answer: '<p>Varia enormemente in base al settore — i rivenditori di abbigliamento usano spesso ricarichi del 100%+, mentre i margini alimentari sono tipicamente molto più sottili.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Prezzo all’Ingrosso', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Ricarico', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'Aliquota IVA', type: 'number', unit: '%', min: 0, max: 100, placeholder: '22', default: 22 },
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Prezzo al Dettaglio (netto)', unit: '€', precision: 2 },
                { name: 'retail_price', label: 'Prezzo al Dettaglio (lordo)', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'einzelhandelspreis-aus-grosshandelspreis-rechner',
            title: 'Einzelhandelspreis aus Großhandelspreis Rechner',
            h1: 'Einzelhandelspreis aus Großhandelspreis Rechner',
            meta_title: 'Einzelhandelspreis-Rechner | Vom Großhandelspreis zum Regalpreis',
            meta_description: 'Berechnen Sie den Einzelhandelspreis (mit und ohne MwSt.) aus einem Großhandelspreis und Ihrem gewünschten Aufschlag — Standardsatz ist der deutsche Regelsatz von 19%.',
            short_answer: 'Dieser Rechner verwandelt einen Großhandels-/Kostenpreis in einen Einzelhandels-Regalpreis, indem er Ihren Aufschlag anwendet, und zeigt dann den endgültigen Verbraucherpreis inklusive Steuer.',
            intro_text: '<p>Einzelhändler kaufen im Großhandel ein, fügen einen Aufschlag hinzu, um Gemeinkosten und Gewinn zu decken, und fügen dann (in den meisten Ländern) Steuer hinzu, um den endgültigen Verbraucherpreis zu erreichen.</p><p><b>Einzelhandelskäufer und Kleinunternehmer in Deutschland</b> nutzen dies, um neue Ware schnell zu bepreisen.</p>',
            key_points: [
                '<b>Formel:</b> Einzelhandelspreis (netto) = Großhandelspreis × (1 + Aufschlag % ÷ 100); Einzelhandelspreis (brutto) = ... × (1 + MwSt-Satz % ÷ 100).',
                '<b>Aufschlag vs. Marge:</b> ein Aufschlag von 100% auf den Großhandelspreis entspricht einer Marge von 50% auf den endgültigen Einzelhandelspreis (netto) — das sind nicht dieselben Zahlen.',
                '<b>Passen Sie den MwSt-Satz</b> an Ihre Gerichtsbarkeit an — der deutsche Regelsatz beträgt 19%.',
            ],
            howto: [
                { question: 'Sollte der Aufschlag vor oder nach der Steuer angewendet werden?', answer: '<p>Der Aufschlag sollte zuerst auf die Großhandelskosten angewendet werden. Die Steuer wird dann auf den aufgeschlagenen (Einzelhandels-netto) Preis angewendet.</p>' },
                { question: 'Welchen Aufschlagsprozentsatz sollte ich verwenden?', answer: '<p>Dies variiert enorm je nach Branche — Bekleidungshändler verwenden oft Aufschläge von 100%+, während Lebensmittelmargen typischerweise viel dünner sind.</p>' },
            ],
            inputs: [
                { name: 'wholesale_price', label: 'Großhandelspreis', type: 'number', unit: '€', min: 0, max: 100000000, placeholder: '40' },
                { name: 'markup_pct', label: 'Aufschlag', type: 'number', unit: '%', min: 0, max: 10000, placeholder: '100' },
                { name: 'vat_rate', label: 'MwSt-Satz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '19', default: 19 },
            ],
            outputs: [
                { name: 'retail_price_ex_vat', label: 'Einzelhandelspreis (netto)', unit: '€', precision: 2 },
                { name: 'retail_price', label: 'Einzelhandelspreis (brutto)', unit: '€', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1056: Commission Calculator
// ============================================================
const commission: ToolDef = {
    id: '1056',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'sale_amount', default: 10000 },
            { key: 'commission_pct', default: 5 },
        ],
        formulas: {
            commission: 'sale_amount*(commission_pct/100)',
            net_amount: 'sale_amount - sale_amount*(commission_pct/100)',
        },
        outputs: [
            { key: 'commission', precision: 2 },
            { key: 'net_amount', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'commission-calculator',
            title: 'Commission Calculator',
            h1: 'Commission Calculator',
            meta_title: 'Commission Calculator | Sales Commission & Net Payout',
            meta_description: 'Calculate the commission amount and the net payout from a sale amount and a commission percentage rate.',
            short_answer: 'This calculator computes the commission earned on a sale, and the net amount left over after the commission is taken out.',
            intro_text: '<p>Whether you\'re a salesperson estimating a paycheck, a real estate agent calculating a fee, or a marketplace working out a seller\'s net payout, this is the same simple percentage calculation: sale amount × commission rate.</p><p><b>Sales teams and agents</b> use this to quickly estimate earnings before a formal payout statement arrives; <b>sellers on commission-based marketplaces</b> use it to see what they\'ll actually receive.</p>',
            key_points: [
                '<b>Formula:</b> Commission = Sale Amount × (Commission % ÷ 100); Net Amount = Sale Amount − Commission.',
                '<b>Tiered commission structures</b> (e.g. 5% on the first €10,000, 8% above that) require applying this calculation separately to each tier and summing the results — this calculator handles a single flat rate.',
                '<b>Who pays the commission</b> varies by industry — in real estate it\'s typically the seller; on marketplaces it\'s usually deducted from the seller\'s proceeds before payout.',
            ],
            howto: [
                { question: 'How do I handle a tiered commission structure?', answer: '<p>Split the sale amount into the relevant tier bands, run this calculation for each band at its own rate, then add the results together for total commission.</p>' },
                { question: 'Is commission calculated before or after other fees/taxes?', answer: '<p>That depends on your specific contract or platform\'s terms — always check whether commission is calculated on gross sale price or on a net-of-other-fees amount.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Sale Amount', type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Commission Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                currencyInput,
            ],
            outputs: [
                { name: 'commission', label: 'Commission Amount', unitFrom: 'currency', precision: 2 },
                { name: 'net_amount', label: 'Net Amount (after commission)', unitFrom: 'currency', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-komissii',
            title: 'Калькулятор комиссии',
            h1: 'Калькулятор комиссии',
            meta_title: 'Калькулятор комиссии | Комиссия с продаж и чистая выплата',
            meta_description: 'Рассчитайте сумму комиссии и чистую выплату из суммы продажи и процентной ставки комиссии.',
            short_answer: 'Этот калькулятор вычисляет комиссию, заработанную с продажи, и чистую сумму, оставшуюся после вычета комиссии.',
            intro_text: '<p>Продавец, оценивающий зарплату, риелтор, рассчитывающий гонорар, или маркетплейс, вычисляющий чистую выплату продавцу — все выполняют один и тот же простой процентный расчёт.</p><p><b>Отделы продаж и агенты</b> используют это для быстрой оценки заработка; <b>продавцы на маркетплейсах с комиссией</b> — чтобы увидеть, что они фактически получат.</p>',
            key_points: [
                '<b>Формула:</b> Комиссия = Сумма продажи × (Комиссия % ÷ 100); Чистая сумма = Сумма продажи − Комиссия.',
                '<b>Ступенчатые структуры комиссии</b> (например, 5% на первые €10 000, 8% сверх этого) требуют отдельного применения расчёта к каждой ступени.',
                '<b>Кто платит комиссию</b> зависит от отрасли — в недвижимости обычно продавец; на маркетплейсах обычно вычитается из выручки продавца.',
            ],
            howto: [
                { question: 'Как обработать ступенчатую структуру комиссии?', answer: '<p>Разделите сумму продажи на соответствующие ступени, выполните расчёт для каждой по своей ставке, затем сложите результаты.</p>' },
                { question: 'Комиссия рассчитывается до или после других сборов/налогов?', answer: '<p>Зависит от вашего конкретного договора или условий платформы — всегда проверяйте, рассчитывается ли комиссия с валовой суммы продажи или с суммы за вычетом других сборов.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Сумма продажи', type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Ставка комиссии', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                currencyInputRu,
            ],
            outputs: [
                { name: 'commission', label: 'Сумма комиссии', unitFrom: 'currency', precision: 2 },
                { name: 'net_amount', label: 'Чистая сумма (после комиссии)', unitFrom: 'currency', precision: 2 },
            ],
        },
        lv: {
            slug: 'komisijas-kalkulators',
            title: 'Komisijas Kalkulators',
            h1: 'Komisijas Kalkulators',
            meta_title: 'Komisijas Kalkulators | Pārdošanas Komisija un Neto Izmaksa',
            meta_description: 'Aprēķiniet komisijas summu un neto izmaksu no pārdošanas summas un komisijas procentu likmes.',
            short_answer: 'Šis kalkulators aprēķina komisiju, kas nopelnīta no pārdošanas, un neto summu, kas paliek pēc komisijas atskaitīšanas.',
            intro_text: '<p>Pārdevējs, kas novērtē algu, nekustamā īpašuma aģents, kas aprēķina maksu, vai tirdzniecības platforma, kas aprēķina pārdevēja neto izmaksu — visi veic vienu un to pašu vienkāršo procentuālo aprēķinu.</p><p><b>Pārdošanas komandas un aģenti</b> to izmanto, lai ātri novērtētu ienākumus; <b>pārdevēji komisijas maksas platformās</b> — lai redzētu, ko viņi faktiski saņems.</p>',
            key_points: [
                '<b>Formula:</b> Komisija = Pārdošanas Summa × (Komisija % ÷ 100); Neto Summa = Pārdošanas Summa − Komisija.',
                '<b>Pakāpju komisijas struktūras</b> (piemēram, 5% par pirmajiem €10 000, 8% virs tā) prasa piemērot šo aprēķinu atsevišķi katrai pakāpei.',
                '<b>Kurš maksā komisiju</b> atšķiras pēc nozares — nekustamajā īpašumā parasti pārdevējs; platformās parasti tiek atskaitīts no pārdevēja ieņēmumiem.',
            ],
            howto: [
                { question: 'Kā rīkoties ar pakāpju komisijas struktūru?', answer: '<p>Sadaliet pārdošanas summu attiecīgajās pakāpēs, veiciet šo aprēķinu katrai pakāpei ar tās likmi, tad saskaitiet rezultātus.</p>' },
                { question: 'Vai komisija tiek aprēķināta pirms vai pēc citām maksām/nodokļiem?', answer: '<p>Tas atkarīgs no jūsu konkrētā līguma vai platformas noteikumiem — vienmēr pārbaudiet, vai komisija tiek aprēķināta no bruto pārdošanas cenas.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Pārdošanas Summa', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Komisijas Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'commission', label: 'Komisijas Summa', unit: '€', precision: 2 },
                { name: 'net_amount', label: 'Neto Summa (pēc komisijas)', unit: '€', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-prowizji',
            title: 'Kalkulator Prowizji',
            h1: 'Kalkulator Prowizji',
            meta_title: 'Kalkulator Prowizji | Prowizja od Sprzedaży i Wypłata Netto',
            meta_description: 'Oblicz kwotę prowizji i wypłatę netto na podstawie kwoty sprzedaży i procentowej stawki prowizji.',
            short_answer: 'Ten kalkulator oblicza prowizję zarobioną na sprzedaży oraz kwotę netto pozostałą po odjęciu prowizji.',
            intro_text: '<p>Sprzedawca szacujący wypłatę, agent nieruchomości obliczający opłatę, lub platforma handlowa obliczająca wypłatę netto dla sprzedawcy — wszyscy wykonują tę samą prostą kalkulację procentową.</p><p><b>Zespoły sprzedaży i agenci</b> używają tego do szybkiego szacowania zarobków; <b>sprzedawcy na platformach prowizyjnych</b> — aby zobaczyć, co faktycznie otrzymają.</p>',
            key_points: [
                '<b>Wzór:</b> Prowizja = Kwota Sprzedaży × (Prowizja % ÷ 100); Kwota Netto = Kwota Sprzedaży − Prowizja.',
                '<b>Progresywne struktury prowizji</b> (np. 5% od pierwszych 10 000 zł, 8% powyżej) wymagają zastosowania tej kalkulacji osobno dla każdego progu.',
                '<b>Kto płaci prowizję</b> różni się w zależności od branży — w nieruchomościach zwykle sprzedawca; na platformach zwykle odejmowana jest od wpływów sprzedawcy.',
            ],
            howto: [
                { question: 'Jak obsłużyć progresywną strukturę prowizji?', answer: '<p>Podziel kwotę sprzedaży na odpowiednie progi, wykonaj obliczenie dla każdego progu według jego stawki, a następnie zsumuj wyniki.</p>' },
                { question: 'Czy prowizja jest obliczana przed czy po innych opłatach/podatkach?', answer: '<p>Zależy to od konkretnej umowy lub warunków platformy — zawsze sprawdź, czy prowizja jest obliczana od kwoty brutto czy netto z innych opłat.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Kwota Sprzedaży', type: 'number', unit: 'zł', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Stawka Prowizji', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'commission', label: 'Kwota Prowizji', unit: 'zł', precision: 2 },
                { name: 'net_amount', label: 'Kwota Netto (po prowizji)', unit: 'zł', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-comision',
            title: 'Calculadora de Comisión',
            h1: 'Calculadora de Comisión',
            meta_title: 'Calculadora de Comisión | Comisión de Venta y Pago Neto',
            meta_description: 'Calcula el importe de la comisión y el pago neto a partir de un importe de venta y una tasa de comisión en porcentaje.',
            short_answer: 'Esta calculadora calcula la comisión ganada en una venta y el importe neto que queda tras descontar la comisión.',
            intro_text: '<p>Un vendedor que estima su nómina, un agente inmobiliario que calcula sus honorarios, o un marketplace que calcula el pago neto de un vendedor — todos realizan el mismo cálculo porcentual simple.</p><p><b>Los equipos de ventas y agentes en España</b> usan esto para estimar rápidamente ganancias; <b>los vendedores en marketplaces con comisión</b>, para ver qué recibirán realmente.</p>',
            key_points: [
                '<b>Fórmula:</b> Comisión = Importe de Venta × (Comisión % ÷ 100); Importe Neto = Importe de Venta − Comisión.',
                '<b>Las estructuras de comisión escalonadas</b> (p.ej. 5% en los primeros 10.000€, 8% por encima) requieren aplicar este cálculo por separado a cada tramo.',
                '<b>Quién paga la comisión</b> varía según el sector — en inmobiliaria suele ser el vendedor; en marketplaces suele descontarse de los ingresos del vendedor.',
            ],
            howto: [
                { question: '¿Cómo manejo una estructura de comisión escalonada?', answer: '<p>Divide el importe de venta en los tramos correspondientes, aplica este cálculo a cada tramo con su propia tasa, y luego suma los resultados.</p>' },
                { question: '¿La comisión se calcula antes o después de otras tarifas/impuestos?', answer: '<p>Depende de tu contrato específico o las condiciones de la plataforma — comprueba siempre si la comisión se calcula sobre el precio bruto de venta o neto de otras tarifas.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Importe de Venta', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Tasa de Comisión', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'commission', label: 'Importe de Comisión', unit: '€', precision: 2 },
                { name: 'net_amount', label: 'Importe Neto (tras comisión)', unit: '€', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-commission',
            title: 'Calculateur de Commission',
            h1: 'Calculateur de Commission',
            meta_title: 'Calculateur de Commission | Commission de Vente et Paiement Net',
            meta_description: 'Calculez le montant de la commission et le paiement net à partir d’un montant de vente et d’un taux de commission en pourcentage.',
            short_answer: 'Ce calculateur calcule la commission gagnée sur une vente et le montant net restant après déduction de la commission.',
            intro_text: '<p>Un vendeur estimant sa paie, un agent immobilier calculant ses honoraires, ou une marketplace calculant le paiement net d’un vendeur — tous effectuent le même calcul de pourcentage simple.</p><p><b>Les équipes commerciales et agents en France</b> utilisent cela pour estimer rapidement les gains ; <b>les vendeurs sur des marketplaces à commission</b>, pour voir ce qu’ils recevront réellement.</p>',
            key_points: [
                '<b>Formule :</b> Commission = Montant de Vente × (Commission % ÷ 100) ; Montant Net = Montant de Vente − Commission.',
                '<b>Les structures de commission par paliers</b> (par ex. 5 % sur les premiers 10 000 €, 8 % au-delà) nécessitent d’appliquer ce calcul séparément à chaque palier.',
                '<b>Qui paie la commission</b> varie selon le secteur — dans l’immobilier c’est généralement le vendeur ; sur les marketplaces elle est généralement déduite des recettes du vendeur.',
            ],
            howto: [
                { question: 'Comment gérer une structure de commission par paliers ?', answer: '<p>Divisez le montant de vente selon les paliers concernés, appliquez ce calcul à chaque palier avec son propre taux, puis additionnez les résultats.</p>' },
                { question: 'La commission est-elle calculée avant ou après les autres frais/taxes ?', answer: '<p>Cela dépend de votre contrat spécifique ou des conditions de la plateforme — vérifiez toujours si la commission est calculée sur le prix de vente brut ou net d’autres frais.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Montant de Vente', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Taux de Commission', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'commission', label: 'Montant de la Commission', unit: '€', precision: 2 },
                { name: 'net_amount', label: 'Montant Net (après commission)', unit: '€', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-commissione',
            title: 'Calcolatore di Commissione',
            h1: 'Calcolatore di Commissione',
            meta_title: 'Calcolatore di Commissione | Commissione di Vendita e Pagamento Netto',
            meta_description: 'Calcola l’importo della commissione e il pagamento netto a partire da un importo di vendita e un tasso di commissione percentuale.',
            short_answer: 'Questo calcolatore calcola la commissione guadagnata su una vendita e l’importo netto rimanente dopo la detrazione della commissione.',
            intro_text: '<p>Un venditore che stima la busta paga, un agente immobiliare che calcola la parcella, o un marketplace che calcola il pagamento netto di un venditore — tutti eseguono lo stesso semplice calcolo percentuale.</p><p><b>I team di vendita e gli agenti in Italia</b> usano questo per stimare rapidamente i guadagni; <b>i venditori su marketplace a commissione</b>, per vedere cosa riceveranno effettivamente.</p>',
            key_points: [
                '<b>Formula:</b> Commissione = Importo di Vendita × (Commissione % ÷ 100); Importo Netto = Importo di Vendita − Commissione.',
                '<b>Le strutture di commissione a fasce</b> (ad es. 5% sui primi 10.000€, 8% oltre) richiedono di applicare questo calcolo separatamente a ciascuna fascia.',
                '<b>Chi paga la commissione</b> varia in base al settore — nell’immobiliare è tipicamente il venditore; sui marketplace viene solitamente detratta dai proventi del venditore.',
            ],
            howto: [
                { question: 'Come gestisco una struttura di commissione a fasce?', answer: '<p>Dividi l’importo di vendita nelle fasce pertinenti, esegui questo calcolo per ciascuna fascia al proprio tasso, poi somma i risultati.</p>' },
                { question: 'La commissione viene calcolata prima o dopo altre commissioni/imposte?', answer: '<p>Dipende dal tuo contratto specifico o dai termini della piattaforma — verifica sempre se la commissione è calcolata sul prezzo di vendita lordo o al netto di altre commissioni.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Importo di Vendita', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Tasso di Commissione', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'commission', label: 'Importo della Commissione', unit: '€', precision: 2 },
                { name: 'net_amount', label: 'Importo Netto (dopo commissione)', unit: '€', precision: 2 },
            ],
        },
        de: {
            slug: 'provisions-rechner',
            title: 'Provisions-Rechner',
            h1: 'Provisions-Rechner',
            meta_title: 'Provisionsrechner | Verkaufsprovision und Netto-Auszahlung',
            meta_description: 'Berechnen Sie den Provisionsbetrag und die Netto-Auszahlung aus einem Verkaufsbetrag und einem Provisionssatz.',
            short_answer: 'Dieser Rechner berechnet die auf einen Verkauf verdiente Provision und den nach Abzug der Provision verbleibenden Nettobetrag.',
            intro_text: '<p>Ob Sie ein Verkäufer sind, der eine Gehaltsabrechnung schätzt, ein Immobilienmakler, der eine Gebühr berechnet, oder ein Marktplatz, der die Netto-Auszahlung eines Verkäufers ermittelt — alle führen dieselbe einfache Prozentrechnung durch.</p><p><b>Vertriebsteams und Makler in Deutschland</b> nutzen dies, um Einnahmen schnell zu schätzen; <b>Verkäufer auf provisionsbasierten Marktplätzen</b>, um zu sehen, was sie tatsächlich erhalten.</p>',
            key_points: [
                '<b>Formel:</b> Provision = Verkaufsbetrag × (Provision % ÷ 100); Nettobetrag = Verkaufsbetrag − Provision.',
                '<b>Gestaffelte Provisionsstrukturen</b> (z.B. 5% auf die ersten 10.000€, 8% darüber) erfordern die separate Anwendung dieser Berechnung auf jede Stufe.',
                '<b>Wer die Provision zahlt</b> variiert je nach Branche — bei Immobilien typischerweise der Verkäufer; bei Marktplätzen wird sie meist von den Erlösen des Verkäufers abgezogen.',
            ],
            howto: [
                { question: 'Wie gehe ich mit einer gestaffelten Provisionsstruktur um?', answer: '<p>Teilen Sie den Verkaufsbetrag in die relevanten Stufen auf, führen Sie diese Berechnung für jede Stufe mit ihrem eigenen Satz durch und addieren Sie dann die Ergebnisse.</p>' },
                { question: 'Wird die Provision vor oder nach anderen Gebühren/Steuern berechnet?', answer: '<p>Das hängt von Ihrem spezifischen Vertrag oder den Plattformbedingungen ab — prüfen Sie immer, ob die Provision auf den Brutto-Verkaufspreis oder auf einen um andere Gebühren bereinigten Betrag berechnet wird.</p>' },
            ],
            inputs: [
                { name: 'sale_amount', label: 'Verkaufsbetrag', type: 'number', unit: '€', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'commission_pct', label: 'Provisionssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
            ],
            outputs: [
                { name: 'commission', label: 'Provisionsbetrag', unit: '€', precision: 2 },
                { name: 'net_amount', label: 'Nettobetrag (nach Provision)', unit: '€', precision: 2 },
            ],
        },
    },
}

export const tools: ToolDef[] = [profitMargin, markup, breakEven, discount, vat, reverseVat, revenueGrowth, clv, cac, pricePerUnit, retailFromWholesale, commission]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: BUSINESS_SALES_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: BUSINESS_SALES_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} business & sales calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
