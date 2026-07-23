// One-off script: seeds 12 new Marketing Calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-marketing-calculators.ts
//
// Tool IDs 1157-1168, category_id '5' (Marketing Calculators, top-level,
// no parent). No explicit tool list was given, only 7 themes (ROAS, CPA,
// attribution, funnels, customer value, loyalty programs, organic traffic
// ROI) for 12 tools; the concrete list was proposed and confirmed with the
// user before writing content. Customer Lifetime Value and Customer
// Acquisition Cost already exist as standalone tools elsewhere (Finance,
// ids 1052/1053) - the "customer value" theme here is covered by a new
// LTV:CAC Ratio Calculator instead of duplicating those.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MARKETING_CATEGORY_ID = '5'

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
const REVENUE_LABEL: Record<string, string> = { en: 'Revenue', ru: 'Выручка', de: 'Umsatz', es: 'Ingresos', fr: 'Revenu', it: 'Ricavi', pl: 'Przychód', lv: 'Ieņēmumi' }
const AD_SPEND_LABEL: Record<string, string> = { en: 'Ad Spend', ru: 'Расходы на рекламу', de: 'Werbeausgaben', es: 'Gasto en Publicidad', fr: 'Dépenses Publicitaires', it: 'Spesa Pubblicitaria', pl: 'Wydatki na Reklamę', lv: 'Reklāmas Izdevumi' }
const TOTAL_SPEND_LABEL: Record<string, string> = { en: 'Total Spend', ru: 'Общие расходы', de: 'Gesamtausgaben', es: 'Gasto Total', fr: 'Dépense Totale', it: 'Spesa Totale', pl: 'Całkowite Wydatki', lv: 'Kopējie Izdevumi' }
const CONVERSIONS_LABEL: Record<string, string> = { en: 'Conversions', ru: 'Конверсии', de: 'Conversions', es: 'Conversiones', fr: 'Conversions', it: 'Conversioni', pl: 'Konwersje', lv: 'Konversijas' }
const IMPRESSIONS_LABEL: Record<string, string> = { en: 'Impressions', ru: 'Показы', de: 'Impressionen', es: 'Impresiones', fr: 'Impressions', it: 'Impressioni', pl: 'Wyświetlenia', lv: 'Parādīšanas' }
const CLICKS_LABEL: Record<string, string> = { en: 'Clicks', ru: 'Клики', de: 'Klicks', es: 'Clics', fr: 'Clics', it: 'Clic', pl: 'Kliknięcia', lv: 'Klikšķi' }
const VISITORS_LABEL: Record<string, string> = { en: 'Visitors', ru: 'Посетители', de: 'Besucher', es: 'Visitantes', fr: 'Visiteurs', it: 'Visitatori', pl: 'Odwiedzający', lv: 'Apmeklētāji' }

// ============================================================
// 1157: ROAS Calculator (Return on Ad Spend)
// ============================================================
const roasCalculatorTool: ToolDef = {
    id: '1157',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'revenue', default: 5000 }, { key: 'ad_spend', default: 1000 }],
        functions: { result: { type: 'function', functionName: 'roasCalculator', params: { revenue: 'revenue', ad_spend: 'ad_spend' } } },
        outputs: [{ key: 'roas', precision: 2 }, { key: 'roas_percentage', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'roas-calculator', title: 'ROAS Calculator', h1: 'ROAS Calculator (Return on Ad Spend)',
            meta_title: 'ROAS Calculator | Return on Ad Spend',
            meta_description: 'Calculate Return on Ad Spend (ROAS) instantly from revenue and ad spend.',
            short_answer: 'This calculator finds your Return on Ad Spend (ROAS), e.g. $5,000 revenue from $1,000 ad spend = a 5:1 ROAS.',
            intro_text: '<p>ROAS measures how much revenue you generate for every dollar spent on advertising — enter your campaign revenue and ad spend to see the ratio instantly.</p>',
            key_points: [
                '<b>Formula:</b> ROAS = Revenue ÷ Ad Spend.',
                '<b>Example:</b> $5,000 revenue ÷ $1,000 ad spend = 5 (often written as "5:1" or "500%").',
                '<b>Benchmark:</b> a ROAS of 4:1 or higher is commonly considered a solid target for most e-commerce campaigns, though the right target varies heavily by industry and margin.',
            ],
            howto: [
                { question: 'What does a ROAS of 1 mean?', answer: '<p>You\'re making back exactly what you spent on ads (breaking even before accounting for other costs like product, shipping, or overhead).</p>' },
                { question: 'Is ROAS the same as profit?', answer: '<p>No — ROAS only compares revenue to ad spend, not overall profit. A high ROAS on low-margin products can still be unprofitable once product and operating costs are factored in.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.en, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        ru: {
            slug: 'kalkulyator-roas', title: 'Калькулятор ROAS', h1: 'Калькулятор ROAS (окупаемость рекламных расходов)',
            meta_title: 'Калькулятор ROAS | Окупаемость рекламных расходов',
            meta_description: 'Рассчитайте окупаемость рекламных расходов (ROAS) мгновенно по выручке и расходам на рекламу.',
            short_answer: 'Этот калькулятор находит ROAS, например 5000$ выручки от 1000$ расходов на рекламу = ROAS 5:1.',
            intro_text: '<p>ROAS измеряет, сколько выручки вы получаете на каждый доллар, потраченный на рекламу — введите выручку и расходы на рекламу кампании, чтобы мгновенно увидеть соотношение.</p>',
            key_points: [
                '<b>Формула:</b> ROAS = Выручка ÷ Расходы на рекламу.',
                '<b>Пример:</b> 5000$ выручки ÷ 1000$ расходов = 5 (часто записывается как «5:1» или «500%»).',
                '<b>Ориентир:</b> ROAS 4:1 или выше обычно считается хорошей целью для большинства e-commerce кампаний, но точная цель сильно зависит от отрасли и маржи.',
            ],
            howto: [
                { question: 'Что значит ROAS равный 1?', answer: '<p>Вы возвращаете ровно то, что потратили на рекламу (окупаемость до учёта других затрат вроде товара, доставки или накладных расходов).</p>' },
                { question: 'ROAS — это то же самое, что прибыль?', answer: '<p>Нет — ROAS сравнивает только выручку с расходами на рекламу, а не общую прибыль. Высокий ROAS на низкомаржинальных товарах всё ещё может быть убыточным.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.ru, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        lv: {
            slug: 'roas-kalkulators', title: 'ROAS Kalkulators', h1: 'ROAS Kalkulators (Reklāmas Izdevumu Atdeve)',
            meta_title: 'ROAS Kalkulators | Reklāmas Izdevumu Atdeve',
            meta_description: 'Aprēķiniet reklāmas izdevumu atdevi (ROAS) acumirklī no ieņēmumiem un reklāmas izdevumiem.',
            short_answer: 'Šis kalkulators atrod jūsu ROAS, piemēram, 5000$ ieņēmumu no 1000$ reklāmas izdevumiem = ROAS 5:1.',
            intro_text: '<p>ROAS mēra, cik daudz ieņēmumu jūs gūstat par katru reklāmā iztērēto dolāru — ievadiet kampaņas ieņēmumus un reklāmas izdevumus, lai uzreiz redzētu attiecību.</p>',
            key_points: [
                '<b>Formula:</b> ROAS = Ieņēmumi ÷ Reklāmas Izdevumi.',
                '<b>Piemērs:</b> 5000$ ieņēmumi ÷ 1000$ reklāmas izdevumi = 5 (bieži raksta kā "5:1" vai "500%").',
                '<b>Etalons:</b> ROAS 4:1 vai augstāks parasti tiek uzskatīts par labu mērķi lielākajai daļai e-komercijas kampaņu, taču precīzs mērķis stipri atšķiras atkarībā no nozares un peļņas normas.',
            ],
            howto: [
                { question: 'Ko nozīmē ROAS, kas vienāds ar 1?', answer: '<p>Jūs atgūstat tieši to, ko iztērējāt reklāmai (līdzsvars pirms citu izmaksu, piemēram, produkta vai piegādes, ņemšanas vērā).</p>' },
                { question: 'Vai ROAS ir tas pats, kas peļņa?', answer: '<p>Nē — ROAS salīdzina tikai ieņēmumus ar reklāmas izdevumiem, nevis kopējo peļņu. Augsts ROAS zemas peļņas produktiem joprojām var būt nerentabls.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.lv, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        pl: {
            slug: 'kalkulator-roas', title: 'Kalkulator ROAS', h1: 'Kalkulator ROAS (Zwrot z Wydatków na Reklamę)',
            meta_title: 'Kalkulator ROAS | Zwrot z Wydatków na Reklamę',
            meta_description: 'Oblicz zwrot z wydatków na reklamę (ROAS) natychmiast na podstawie przychodu i wydatków na reklamę.',
            short_answer: 'Ten kalkulator znajduje Twój ROAS, np. 5000$ przychodu z 1000$ wydatków na reklamę = ROAS 5:1.',
            intro_text: '<p>ROAS mierzy, ile przychodu generujesz na każdego dolara wydanego na reklamę — wpisz przychód i wydatki kampanii, aby natychmiast zobaczyć wskaźnik.</p>',
            key_points: [
                '<b>Wzór:</b> ROAS = Przychód ÷ Wydatki na Reklamę.',
                '<b>Przykład:</b> 5000$ przychodu ÷ 1000$ wydatków = 5 (często zapisywane jako "5:1" lub "500%").',
                '<b>Punkt odniesienia:</b> ROAS 4:1 lub wyższy jest zwykle uważany za solidny cel dla większości kampanii e-commerce, ale odpowiedni cel mocno zależy od branży i marży.',
            ],
            howto: [
                { question: 'Co oznacza ROAS równy 1?', answer: '<p>Odzyskujesz dokładnie to, co wydałeś na reklamę (próg rentowności przed uwzględnieniem innych kosztów, jak produkt czy dostawa).</p>' },
                { question: 'Czy ROAS to to samo co zysk?', answer: '<p>Nie — ROAS porównuje tylko przychód z wydatkami na reklamę, a nie ogólny zysk. Wysoki ROAS przy niskomarżowych produktach może nadal być nierentowny.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.pl, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        es: {
            slug: 'calculadora-de-roas', title: 'Calculadora de ROAS', h1: 'Calculadora de ROAS (Retorno de la Inversión Publicitaria)',
            meta_title: 'Calculadora de ROAS | Retorno de la Inversión Publicitaria',
            meta_description: 'Calcula el retorno de la inversión publicitaria (ROAS) al instante a partir de ingresos y gasto publicitario.',
            short_answer: 'Esta calculadora encuentra tu ROAS, p. ej. $5,000 de ingresos por $1,000 de gasto publicitario = un ROAS de 5:1.',
            intro_text: '<p>El ROAS mide cuántos ingresos generas por cada dólar gastado en publicidad — introduce los ingresos y el gasto publicitario de la campaña para ver la proporción al instante.</p>',
            key_points: [
                '<b>Fórmula:</b> ROAS = Ingresos ÷ Gasto Publicitario.',
                '<b>Ejemplo:</b> $5,000 de ingresos ÷ $1,000 de gasto = 5 (a menudo escrito como "5:1" o "500%").',
                '<b>Referencia:</b> un ROAS de 4:1 o superior se considera comúnmente un buen objetivo para la mayoría de campañas de e-commerce, aunque el objetivo adecuado varía mucho según la industria y el margen.',
            ],
            howto: [
                { question: '¿Qué significa un ROAS de 1?', answer: '<p>Recuperas exactamente lo que gastaste en publicidad (punto de equilibrio antes de contar otros costos como producto o envío).</p>' },
                { question: '¿El ROAS es lo mismo que el beneficio?', answer: '<p>No — el ROAS solo compara ingresos con gasto publicitario, no el beneficio general. Un ROAS alto en productos de bajo margen aún puede ser no rentable.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.es, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        fr: {
            slug: 'calculateur-de-roas', title: 'Calculateur de ROAS', h1: 'Calculateur de ROAS (Retour sur Dépenses Publicitaires)',
            meta_title: 'Calculateur de ROAS | Retour sur Dépenses Publicitaires',
            meta_description: 'Calculez le retour sur dépenses publicitaires (ROAS) instantanément à partir du revenu et des dépenses publicitaires.',
            short_answer: 'Ce calculateur trouve votre ROAS, ex. 5 000 $ de revenu pour 1 000 $ de dépenses publicitaires = un ROAS de 5:1.',
            intro_text: '<p>Le ROAS mesure combien de revenu vous générez pour chaque dollar dépensé en publicité — entrez le revenu et les dépenses publicitaires de la campagne pour voir instantanément le ratio.</p>',
            key_points: [
                '<b>Formule :</b> ROAS = Revenu ÷ Dépenses Publicitaires.',
                '<b>Exemple :</b> 5 000 $ de revenu ÷ 1 000 $ de dépenses = 5 (souvent écrit "5:1" ou "500%").',
                '<b>Référence :</b> un ROAS de 4:1 ou plus est généralement considéré comme un bon objectif pour la plupart des campagnes e-commerce, mais l’objectif approprié varie fortement selon le secteur et la marge.',
            ],
            howto: [
                { question: 'Que signifie un ROAS de 1 ?', answer: '<p>Vous récupérez exactement ce que vous avez dépensé en publicité (seuil de rentabilité avant autres coûts comme le produit ou la livraison).</p>' },
                { question: 'Le ROAS est-il la même chose que le profit ?', answer: '<p>Non — le ROAS compare uniquement le revenu aux dépenses publicitaires, pas le profit global. Un ROAS élevé sur des produits à faible marge peut rester non rentable.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.fr, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        it: {
            slug: 'calcolatore-di-roas', title: 'Calcolatore di ROAS', h1: 'Calcolatore di ROAS (Ritorno sulla Spesa Pubblicitaria)',
            meta_title: 'Calcolatore di ROAS | Ritorno sulla Spesa Pubblicitaria',
            meta_description: 'Calcola il ritorno sulla spesa pubblicitaria (ROAS) istantaneamente da ricavi e spesa pubblicitaria.',
            short_answer: 'Questo calcolatore trova il tuo ROAS, es. $5.000 di ricavi da $1.000 di spesa pubblicitaria = un ROAS di 5:1.',
            intro_text: '<p>Il ROAS misura quanti ricavi generi per ogni dollaro speso in pubblicità — inserisci i ricavi e la spesa pubblicitaria della campagna per vedere subito il rapporto.</p>',
            key_points: [
                '<b>Formula:</b> ROAS = Ricavi ÷ Spesa Pubblicitaria.',
                '<b>Esempio:</b> $5.000 di ricavi ÷ $1.000 di spesa = 5 (spesso scritto come "5:1" o "500%").',
                '<b>Benchmark:</b> un ROAS di 4:1 o superiore è comunemente considerato un buon obiettivo per la maggior parte delle campagne e-commerce, ma l\'obiettivo giusto varia molto in base a settore e margine.',
            ],
            howto: [
                { question: 'Cosa significa un ROAS di 1?', answer: '<p>Stai recuperando esattamente ciò che hai speso in pubblicità (pareggio prima di considerare altri costi come prodotto o spedizione).</p>' },
                { question: 'Il ROAS è lo stesso del profitto?', answer: '<p>No — il ROAS confronta solo i ricavi con la spesa pubblicitaria, non il profitto complessivo. Un ROAS alto su prodotti a basso margine può comunque non essere redditizio.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.it, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
        de: {
            slug: 'roas-rechner', title: 'ROAS-Rechner', h1: 'ROAS-Rechner (Return on Ad Spend)',
            meta_title: 'ROAS-Rechner | Return on Ad Spend',
            meta_description: 'Berechnen Sie den Return on Ad Spend (ROAS) sofort aus Umsatz und Werbeausgaben.',
            short_answer: 'Dieser Rechner findet Ihren ROAS, z.B. 5.000 $ Umsatz aus 1.000 $ Werbeausgaben = ein ROAS von 5:1.',
            intro_text: '<p>ROAS misst, wie viel Umsatz Sie für jeden für Werbung ausgegebenen Dollar erzielen — geben Sie Kampagnenumsatz und Werbeausgaben ein, um sofort das Verhältnis zu sehen.</p>',
            key_points: [
                '<b>Formel:</b> ROAS = Umsatz ÷ Werbeausgaben.',
                '<b>Beispiel:</b> 5.000 $ Umsatz ÷ 1.000 $ Ausgaben = 5 (oft geschrieben als "5:1" oder "500%").',
                '<b>Richtwert:</b> ein ROAS von 4:1 oder höher gilt für die meisten E-Commerce-Kampagnen als solides Ziel, das passende Ziel variiert jedoch stark je nach Branche und Marge.',
            ],
            howto: [
                { question: 'Was bedeutet ein ROAS von 1?', answer: '<p>Sie holen genau das zurück, was Sie für Werbung ausgegeben haben (Kostendeckung vor Berücksichtigung anderer Kosten wie Produkt oder Versand).</p>' },
                { question: 'Ist ROAS dasselbe wie Gewinn?', answer: '<p>Nein — ROAS vergleicht nur Umsatz mit Werbeausgaben, nicht den Gesamtgewinn. Ein hoher ROAS bei margenschwachen Produkten kann trotzdem unrentabel sein.</p>' },
            ],
            inputs: [
                { name: 'revenue', label: REVENUE_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '5000' },
                { name: 'ad_spend', label: AD_SPEND_LABEL.de, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roas', label: 'ROAS', precision: 2 }, { name: 'roas_percentage', label: 'ROAS (%)', precision: 1 }],
        },
    },
}

// ============================================================
// 1158: CPA Calculator (Cost Per Acquisition/Action)
// ============================================================
const cpaCalculatorTool: ToolDef = {
    id: '1158',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'total_spend', default: 1000 }, { key: 'conversions', default: 50 }],
        functions: { result: { type: 'function', functionName: 'cpaCalculator', params: { total_spend: 'total_spend', conversions: 'conversions' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'cpa-calculator', title: 'CPA Calculator', h1: 'CPA Calculator (Cost Per Acquisition)',
            meta_title: 'CPA Calculator | Cost Per Acquisition / Cost Per Action',
            meta_description: 'Calculate Cost Per Acquisition (CPA) instantly from total spend and conversions.',
            short_answer: 'This calculator finds your Cost Per Acquisition (CPA), e.g. $1,000 spend ÷ 50 conversions = $20 CPA.',
            intro_text: '<p>CPA tells you how much you\'re paying, on average, for each conversion (sale, lead, sign-up, or whatever action you\'re tracking) — enter your total spend and number of conversions to see the cost per acquisition.</p>',
            key_points: [
                '<b>Formula:</b> CPA = Total Spend ÷ Conversions.',
                '<b>Example:</b> $1,000 spend ÷ 50 conversions = $20 per conversion.',
                '<b>Compare to value:</b> a campaign is generally profitable when CPA is comfortably below the value each conversion brings in (e.g. average order value or customer lifetime value).',
            ],
            howto: [
                { question: 'Is a lower CPA always better?', answer: '<p>Usually yes, but not always — a slightly higher CPA from a channel that brings higher-value or more loyal customers can still be the better investment.</p>' },
                { question: 'What counts as a "conversion"?', answer: '<p>Whatever action you\'re measuring — a purchase, a form submission, a free trial sign-up, an app install — as long as you\'re consistent about what you count.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.en, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-cpa', title: 'Калькулятор CPA', h1: 'Калькулятор CPA (стоимость привлечения)',
            meta_title: 'Калькулятор CPA | Стоимость привлечения клиента/действия',
            meta_description: 'Рассчитайте стоимость привлечения (CPA) мгновенно по общим расходам и количеству конверсий.',
            short_answer: 'Этот калькулятор находит CPA, например 1000$ расходов ÷ 50 конверсий = 20$ CPA.',
            intro_text: '<p>CPA показывает, сколько вы в среднем платите за каждую конверсию (продажу, лид, регистрацию) — введите общие расходы и число конверсий, чтобы увидеть стоимость привлечения.</p>',
            key_points: [
                '<b>Формула:</b> CPA = Общие расходы ÷ Конверсии.',
                '<b>Пример:</b> 1000$ расходов ÷ 50 конверсий = 20$ за конверсию.',
                '<b>Сравнение с ценностью:</b> кампания обычно прибыльна, когда CPA заметно ниже ценности, которую приносит каждая конверсия.',
            ],
            howto: [
                { question: 'Всегда ли более низкий CPA лучше?', answer: '<p>Обычно да, но не всегда — немного более высокий CPA от канала, приносящего более ценных клиентов, всё же может быть лучшей инвестицией.</p>' },
                { question: 'Что считается «конверсией»?', answer: '<p>Любое отслеживаемое действие — покупка, заполнение формы, регистрация на пробную версию, установка приложения.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.ru, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        lv: {
            slug: 'cpa-kalkulators', title: 'CPA Kalkulators', h1: 'CPA Kalkulators (Piesaistes Izmaksas)',
            meta_title: 'CPA Kalkulators | Piesaistes/Darbības Izmaksas',
            meta_description: 'Aprēķiniet piesaistes izmaksas (CPA) acumirklī no kopējiem izdevumiem un konversijām.',
            short_answer: 'Šis kalkulators atrod jūsu CPA, piemēram, 1000$ izdevumi ÷ 50 konversijas = 20$ CPA.',
            intro_text: '<p>CPA parāda, cik vidēji jūs maksājat par katru konversiju (pārdošanu, potenciālo klientu, reģistrāciju) — ievadiet kopējos izdevumus un konversiju skaitu, lai redzētu piesaistes izmaksas.</p>',
            key_points: [
                '<b>Formula:</b> CPA = Kopējie Izdevumi ÷ Konversijas.',
                '<b>Piemērs:</b> 1000$ izdevumi ÷ 50 konversijas = 20$ par konversiju.',
                '<b>Salīdzinājums ar vērtību:</b> kampaņa parasti ir rentabla, ja CPA ir ievērojami zemāks par vērtību, ko sniedz katra konversija.',
            ],
            howto: [
                { question: 'Vai zemāks CPA vienmēr ir labāks?', answer: '<p>Parasti jā, bet ne vienmēr — nedaudz augstāks CPA no kanāla, kas piesaista vērtīgākus klientus, joprojām var būt labāks ieguldījums.</p>' },
                { question: 'Kas tiek uzskatīts par "konversiju"?', answer: '<p>Jebkura darbība, ko mērāt — pirkums, veidlapas aizpildīšana, bezmaksas izmēģinājuma reģistrācija, lietotnes instalēšana.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.lv, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-cpa', title: 'Kalkulator CPA', h1: 'Kalkulator CPA (Koszt Pozyskania)',
            meta_title: 'Kalkulator CPA | Koszt Pozyskania/Działania',
            meta_description: 'Oblicz koszt pozyskania (CPA) natychmiast na podstawie całkowitych wydatków i liczby konwersji.',
            short_answer: 'Ten kalkulator znajduje Twój CPA, np. 1000$ wydatków ÷ 50 konwersji = 20$ CPA.',
            intro_text: '<p>CPA pokazuje, ile średnio płacisz za każdą konwersję (sprzedaż, lead, rejestrację) — wpisz całkowite wydatki i liczbę konwersji, aby zobaczyć koszt pozyskania.</p>',
            key_points: [
                '<b>Wzór:</b> CPA = Całkowite Wydatki ÷ Konwersje.',
                '<b>Przykład:</b> 1000$ wydatków ÷ 50 konwersji = 20$ za konwersję.',
                '<b>Porównanie z wartością:</b> kampania jest generalnie rentowna, gdy CPA jest wyraźnie niższe niż wartość, jaką przynosi każda konwersja.',
            ],
            howto: [
                { question: 'Czy niższy CPA jest zawsze lepszy?', answer: '<p>Zazwyczaj tak, ale nie zawsze — nieco wyższy CPA z kanału przynoszącego bardziej wartościowych klientów może nadal być lepszą inwestycją.</p>' },
                { question: 'Co liczy się jako "konwersja"?', answer: '<p>Dowolna śledzona akcja — zakup, wypełnienie formularza, rejestracja do darmowej wersji próbnej, instalacja aplikacji.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.pl, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-cpa', title: 'Calculadora de CPA', h1: 'Calculadora de CPA (Costo por Adquisición)',
            meta_title: 'Calculadora de CPA | Costo por Adquisición/Acción',
            meta_description: 'Calcula el costo por adquisición (CPA) al instante a partir del gasto total y las conversiones.',
            short_answer: 'Esta calculadora encuentra tu CPA, p. ej. $1,000 de gasto ÷ 50 conversiones = $20 de CPA.',
            intro_text: '<p>El CPA indica cuánto pagas, en promedio, por cada conversión (venta, lead, registro) — introduce tu gasto total y número de conversiones para ver el costo por adquisición.</p>',
            key_points: [
                '<b>Fórmula:</b> CPA = Gasto Total ÷ Conversiones.',
                '<b>Ejemplo:</b> $1,000 de gasto ÷ 50 conversiones = $20 por conversión.',
                '<b>Comparar con el valor:</b> una campaña suele ser rentable cuando el CPA está cómodamente por debajo del valor que aporta cada conversión.',
            ],
            howto: [
                { question: '¿Un CPA más bajo siempre es mejor?', answer: '<p>Normalmente sí, pero no siempre — un CPA ligeramente más alto de un canal que atrae clientes más valiosos puede seguir siendo la mejor inversión.</p>' },
                { question: '¿Qué cuenta como "conversión"?', answer: '<p>Cualquier acción que estés midiendo — una compra, el envío de un formulario, un registro de prueba gratuita, una instalación de app.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.es, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-cpa', title: 'Calculateur de CPA', h1: 'Calculateur de CPA (Coût par Acquisition)',
            meta_title: 'Calculateur de CPA | Coût par Acquisition/Action',
            meta_description: 'Calculez le coût par acquisition (CPA) instantanément à partir des dépenses totales et des conversions.',
            short_answer: 'Ce calculateur trouve votre CPA, ex. 1 000 $ de dépenses ÷ 50 conversions = 20 $ de CPA.',
            intro_text: '<p>Le CPA indique combien vous payez en moyenne pour chaque conversion (vente, lead, inscription) — entrez vos dépenses totales et le nombre de conversions pour voir le coût par acquisition.</p>',
            key_points: [
                '<b>Formule :</b> CPA = Dépenses Totales ÷ Conversions.',
                '<b>Exemple :</b> 1 000 $ de dépenses ÷ 50 conversions = 20 $ par conversion.',
                '<b>Comparer à la valeur :</b> une campagne est généralement rentable lorsque le CPA est nettement inférieur à la valeur apportée par chaque conversion.',
            ],
            howto: [
                { question: 'Un CPA plus bas est-il toujours meilleur ?', answer: '<p>Généralement oui, mais pas toujours — un CPA légèrement plus élevé d’un canal apportant des clients plus précieux peut rester le meilleur investissement.</p>' },
                { question: 'Qu’est-ce qui compte comme "conversion" ?', answer: '<p>Toute action que vous mesurez — un achat, l’envoi d’un formulaire, une inscription à un essai gratuit, une installation d’application.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.fr, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-cpa', title: 'Calcolatore di CPA', h1: 'Calcolatore di CPA (Costo per Acquisizione)',
            meta_title: 'Calcolatore di CPA | Costo per Acquisizione/Azione',
            meta_description: 'Calcola il costo per acquisizione (CPA) istantaneamente da spesa totale e conversioni.',
            short_answer: 'Questo calcolatore trova il tuo CPA, es. $1.000 di spesa ÷ 50 conversioni = $20 di CPA.',
            intro_text: '<p>Il CPA indica quanto paghi, in media, per ogni conversione (vendita, lead, iscrizione) — inserisci la spesa totale e il numero di conversioni per vedere il costo per acquisizione.</p>',
            key_points: [
                '<b>Formula:</b> CPA = Spesa Totale ÷ Conversioni.',
                '<b>Esempio:</b> $1.000 di spesa ÷ 50 conversioni = $20 per conversione.',
                '<b>Confronto con il valore:</b> una campagna è generalmente redditizia quando il CPA è comodamente inferiore al valore apportato da ogni conversione.',
            ],
            howto: [
                { question: 'Un CPA più basso è sempre migliore?', answer: '<p>Di solito sì, ma non sempre — un CPA leggermente più alto da un canale che porta clienti più preziosi può comunque essere l\'investimento migliore.</p>' },
                { question: 'Cosa conta come "conversione"?', answer: '<p>Qualsiasi azione tu stia misurando — un acquisto, l\'invio di un modulo, un\'iscrizione a una prova gratuita, un\'installazione di app.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.it, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
        de: {
            slug: 'cpa-rechner', title: 'CPA-Rechner', h1: 'CPA-Rechner (Cost Per Acquisition)',
            meta_title: 'CPA-Rechner | Cost Per Acquisition/Action',
            meta_description: 'Berechnen Sie die Kosten pro Akquisition (CPA) sofort aus Gesamtausgaben und Conversions.',
            short_answer: 'Dieser Rechner findet Ihren CPA, z.B. 1.000 $ Ausgaben ÷ 50 Conversions = 20 $ CPA.',
            intro_text: '<p>CPA zeigt, wie viel Sie durchschnittlich für jede Conversion (Verkauf, Lead, Anmeldung) bezahlen — geben Sie Ihre Gesamtausgaben und Anzahl der Conversions ein, um die Kosten pro Akquisition zu sehen.</p>',
            key_points: [
                '<b>Formel:</b> CPA = Gesamtausgaben ÷ Conversions.',
                '<b>Beispiel:</b> 1.000 $ Ausgaben ÷ 50 Conversions = 20 $ pro Conversion.',
                '<b>Vergleich mit Wert:</b> eine Kampagne ist im Allgemeinen profitabel, wenn der CPA deutlich unter dem Wert liegt, den jede Conversion bringt.',
            ],
            howto: [
                { question: 'Ist ein niedrigerer CPA immer besser?', answer: '<p>Normalerweise ja, aber nicht immer — ein etwas höherer CPA von einem Kanal, der wertvollere Kunden bringt, kann trotzdem die bessere Investition sein.</p>' },
                { question: 'Was zählt als "Conversion"?', answer: '<p>Jede Aktion, die Sie messen — ein Kauf, eine Formularübermittlung, eine Anmeldung für eine kostenlose Testversion, eine App-Installation.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'conversions', label: CONVERSIONS_LABEL.de, type: 'number', min: 0.01, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'result', label: 'CPA', precision: 2 }],
        },
    },
}

// ============================================================
// 1159: CPM Calculator (Cost Per Mille / thousand impressions)
// ============================================================
const cpmCalculatorTool: ToolDef = {
    id: '1159',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'total_spend', default: 500 }, { key: 'impressions', default: 250000 }],
        functions: { result: { type: 'function', functionName: 'cpmCalculator', params: { total_spend: 'total_spend', impressions: 'impressions' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'cpm-calculator', title: 'CPM Calculator', h1: 'CPM Calculator (Cost Per 1,000 Impressions)',
            meta_title: 'CPM Calculator | Cost Per Mille (1,000 Impressions)',
            meta_description: 'Calculate CPM (cost per 1,000 impressions) instantly from total spend and total impressions.',
            short_answer: 'This calculator finds your CPM, e.g. $500 spend for 250,000 impressions = $2.00 CPM.',
            intro_text: '<p>CPM (cost per mille, "mille" being Latin for thousand) tells you how much you\'re paying for every 1,000 ad impressions — enter your total spend and impressions to see the rate.</p>',
            key_points: [
                '<b>Formula:</b> CPM = (Total Spend ÷ Impressions) × 1,000.',
                '<b>Example:</b> ($500 ÷ 250,000) × 1,000 = $2.00 per 1,000 impressions.',
                '<b>Best for awareness campaigns:</b> CPM is most useful for comparing the cost-efficiency of reach/brand-awareness campaigns, where the goal is impressions rather than clicks or conversions.',
            ],
            howto: [
                { question: 'How is CPM different from CPC?', answer: '<p>CPM charges (or measures cost) per 1,000 views/impressions regardless of clicks, while CPC (cost per click) only counts when someone actually clicks the ad.</p>' },
                { question: 'What\'s a "good" CPM?', answer: '<p>It varies enormously by platform, audience, and format — display ads often have low CPMs (a few dollars), while premium video or highly targeted audiences can run much higher.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.en, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-cpm', title: 'Калькулятор CPM', h1: 'Калькулятор CPM (стоимость за 1000 показов)',
            meta_title: 'Калькулятор CPM | Стоимость за 1000 показов',
            meta_description: 'Рассчитайте CPM (стоимость за 1000 показов) мгновенно по общим расходам и количеству показов.',
            short_answer: 'Этот калькулятор находит CPM, например 500$ расходов на 250 000 показов = 2,00$ CPM.',
            intro_text: '<p>CPM (стоимость за тысячу показов) показывает, сколько вы платите за каждую 1000 показов рекламы — введите общие расходы и показы, чтобы увидеть ставку.</p>',
            key_points: [
                '<b>Формула:</b> CPM = (Общие расходы ÷ Показы) × 1000.',
                '<b>Пример:</b> (500$ ÷ 250 000) × 1000 = 2,00$ за 1000 показов.',
                '<b>Лучше для имиджевых кампаний:</b> CPM наиболее полезен для сравнения эффективности кампаний на охват/узнаваемость бренда.',
            ],
            howto: [
                { question: 'Чем CPM отличается от CPC?', answer: '<p>CPM учитывает стоимость за 1000 показов независимо от кликов, а CPC (цена за клик) считается только при реальном клике по рекламе.</p>' },
                { question: 'Что такое «хороший» CPM?', answer: '<p>Сильно зависит от платформы, аудитории и формата — медийная реклама часто имеет низкий CPM, тогда как премиум-видео может быть намного дороже.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.ru, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        lv: {
            slug: 'cpm-kalkulators', title: 'CPM Kalkulators', h1: 'CPM Kalkulators (Izmaksas par 1000 Parādīšanām)',
            meta_title: 'CPM Kalkulators | Izmaksas par 1000 Parādīšanām',
            meta_description: 'Aprēķiniet CPM (izmaksas par 1000 parādīšanām) acumirklī no kopējiem izdevumiem un parādīšanu skaita.',
            short_answer: 'Šis kalkulators atrod jūsu CPM, piemēram, 500$ izdevumi par 250 000 parādīšanām = 2,00$ CPM.',
            intro_text: '<p>CPM (izmaksas par tūkstoti) parāda, cik jūs maksājat par katrām 1000 reklāmas parādīšanām — ievadiet kopējos izdevumus un parādīšanas, lai redzētu likmi.</p>',
            key_points: [
                '<b>Formula:</b> CPM = (Kopējie Izdevumi ÷ Parādīšanas) × 1000.',
                '<b>Piemērs:</b> (500$ ÷ 250 000) × 1000 = 2,00$ par 1000 parādīšanām.',
                '<b>Vislabāk zīmola atpazīstamības kampaņām:</b> CPM ir visnoderīgākais, salīdzinot sasniedzamības kampaņu izmaksu efektivitāti.',
            ],
            howto: [
                { question: 'Kā CPM atšķiras no CPC?', answer: '<p>CPM aprēķina izmaksas par 1000 skatījumiem neatkarīgi no klikšķiem, bet CPC (izmaksas par klikšķi) skaita tikai reālus klikšķus.</p>' },
                { question: 'Kāds ir "labs" CPM?', answer: '<p>Tas ļoti atšķiras atkarībā no platformas, auditorijas un formāta — displeja reklāmām bieži ir zems CPM, bet prēmijas video var būt daudz dārgāks.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.lv, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-cpm', title: 'Kalkulator CPM', h1: 'Kalkulator CPM (Koszt za 1000 Wyświetleń)',
            meta_title: 'Kalkulator CPM | Koszt za 1000 Wyświetleń',
            meta_description: 'Oblicz CPM (koszt za 1000 wyświetleń) natychmiast na podstawie całkowitych wydatków i liczby wyświetleń.',
            short_answer: 'Ten kalkulator znajduje Twoje CPM, np. 500$ wydatków na 250 000 wyświetleń = 2,00$ CPM.',
            intro_text: '<p>CPM (koszt za tysiąc) pokazuje, ile płacisz za każde 1000 wyświetleń reklamy — wpisz całkowite wydatki i wyświetlenia, aby zobaczyć stawkę.</p>',
            key_points: [
                '<b>Wzór:</b> CPM = (Całkowite Wydatki ÷ Wyświetlenia) × 1000.',
                '<b>Przykład:</b> (500$ ÷ 250 000) × 1000 = 2,00$ za 1000 wyświetleń.',
                '<b>Najlepsze dla kampanii wizerunkowych:</b> CPM jest najbardziej przydatne do porównywania efektywności kosztowej kampanii zasięgowych/wizerunkowych.',
            ],
            howto: [
                { question: 'Czym CPM różni się od CPC?', answer: '<p>CPM liczy koszt za 1000 wyświetleń niezależnie od kliknięć, a CPC (koszt za kliknięcie) liczy tylko rzeczywiste kliknięcia.</p>' },
                { question: 'Co to jest "dobre" CPM?', answer: '<p>Bardzo różni się w zależności od platformy, odbiorców i formatu — reklamy displayowe często mają niskie CPM, a premium wideo może być znacznie droższe.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.pl, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-cpm', title: 'Calculadora de CPM', h1: 'Calculadora de CPM (Costo por Mil Impresiones)',
            meta_title: 'Calculadora de CPM | Costo por Mil Impresiones',
            meta_description: 'Calcula el CPM (costo por mil impresiones) al instante a partir del gasto total y las impresiones totales.',
            short_answer: 'Esta calculadora encuentra tu CPM, p. ej. $500 de gasto por 250,000 impresiones = $2.00 de CPM.',
            intro_text: '<p>El CPM (costo por mil) indica cuánto pagas por cada 1,000 impresiones publicitarias — introduce tu gasto total e impresiones para ver la tarifa.</p>',
            key_points: [
                '<b>Fórmula:</b> CPM = (Gasto Total ÷ Impresiones) × 1,000.',
                '<b>Ejemplo:</b> ($500 ÷ 250,000) × 1,000 = $2.00 por 1,000 impresiones.',
                '<b>Mejor para campañas de reconocimiento:</b> el CPM es más útil para comparar la eficiencia de costos de campañas de alcance/reconocimiento de marca.',
            ],
            howto: [
                { question: '¿En qué se diferencia el CPM del CPC?', answer: '<p>El CPM calcula el costo por 1,000 impresiones sin importar los clics, mientras que el CPC (costo por clic) solo cuenta cuando alguien hace clic.</p>' },
                { question: '¿Qué es un "buen" CPM?', answer: '<p>Varía enormemente según la plataforma, audiencia y formato — los anuncios display suelen tener CPM bajos, mientras que el video premium puede ser mucho más caro.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.es, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-cpm', title: 'Calculateur de CPM', h1: 'Calculateur de CPM (Coût pour Mille Impressions)',
            meta_title: 'Calculateur de CPM | Coût pour Mille Impressions',
            meta_description: 'Calculez le CPM (coût pour mille impressions) instantanément à partir des dépenses totales et des impressions totales.',
            short_answer: 'Ce calculateur trouve votre CPM, ex. 500 $ de dépenses pour 250 000 impressions = 2,00 $ de CPM.',
            intro_text: '<p>Le CPM (coût pour mille) indique combien vous payez pour chaque 1 000 impressions publicitaires — entrez vos dépenses totales et impressions pour voir le taux.</p>',
            key_points: [
                '<b>Formule :</b> CPM = (Dépenses Totales ÷ Impressions) × 1 000.',
                '<b>Exemple :</b> (500 $ ÷ 250 000) × 1 000 = 2,00 $ pour 1 000 impressions.',
                '<b>Idéal pour les campagnes de notoriété :</b> le CPM est surtout utile pour comparer l’efficacité des campagnes de portée/notoriété de marque.',
            ],
            howto: [
                { question: 'En quoi le CPM diffère-t-il du CPC ?', answer: '<p>Le CPM calcule le coût pour 1 000 impressions indépendamment des clics, tandis que le CPC (coût par clic) ne compte que lorsqu’un clic a lieu.</p>' },
                { question: 'Qu’est-ce qu’un "bon" CPM ?', answer: '<p>Cela varie énormément selon la plateforme, l’audience et le format — les publicités display ont souvent un faible CPM, tandis que la vidéo premium peut coûter beaucoup plus cher.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.fr, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-cpm', title: 'Calcolatore di CPM', h1: 'Calcolatore di CPM (Costo per Mille Impressioni)',
            meta_title: 'Calcolatore di CPM | Costo per Mille Impressioni',
            meta_description: 'Calcola il CPM (costo per mille impressioni) istantaneamente da spesa totale e impressioni totali.',
            short_answer: 'Questo calcolatore trova il tuo CPM, es. $500 di spesa per 250.000 impressioni = $2,00 di CPM.',
            intro_text: '<p>Il CPM (costo per mille) indica quanto paghi per ogni 1.000 impressioni pubblicitarie — inserisci la spesa totale e le impressioni per vedere la tariffa.</p>',
            key_points: [
                '<b>Formula:</b> CPM = (Spesa Totale ÷ Impressioni) × 1.000.',
                '<b>Esempio:</b> ($500 ÷ 250.000) × 1.000 = $2,00 per 1.000 impressioni.',
                '<b>Ideale per campagne di brand awareness:</b> il CPM è più utile per confrontare l\'efficienza dei costi delle campagne di copertura/notorietà del marchio.',
            ],
            howto: [
                { question: 'In cosa differisce il CPM dal CPC?', answer: '<p>Il CPM calcola il costo per 1.000 impressioni indipendentemente dai clic, mentre il CPC (costo per clic) conta solo quando qualcuno clicca effettivamente.</p>' },
                { question: 'Cos\'è un "buon" CPM?', answer: '<p>Varia enormemente in base a piattaforma, pubblico e formato — gli annunci display hanno spesso CPM bassi, mentre il video premium può costare molto di più.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.it, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
        de: {
            slug: 'cpm-rechner', title: 'CPM-Rechner', h1: 'CPM-Rechner (Kosten pro 1.000 Impressionen)',
            meta_title: 'CPM-Rechner | Kosten pro Tausend Impressionen',
            meta_description: 'Berechnen Sie den CPM (Kosten pro 1.000 Impressionen) sofort aus Gesamtausgaben und Gesamtimpressionen.',
            short_answer: 'Dieser Rechner findet Ihren CPM, z.B. 500 $ Ausgaben für 250.000 Impressionen = 2,00 $ CPM.',
            intro_text: '<p>CPM (Kosten pro Tausend) zeigt, wie viel Sie für je 1.000 Werbeimpressionen zahlen — geben Sie Gesamtausgaben und Impressionen ein, um den Satz zu sehen.</p>',
            key_points: [
                '<b>Formel:</b> CPM = (Gesamtausgaben ÷ Impressionen) × 1.000.',
                '<b>Beispiel:</b> (500 $ ÷ 250.000) × 1.000 = 2,00 $ pro 1.000 Impressionen.',
                '<b>Am besten für Awareness-Kampagnen:</b> CPM ist am nützlichsten, um die Kosteneffizienz von Reichweiten-/Markenbekanntheitskampagnen zu vergleichen.',
            ],
            howto: [
                { question: 'Wie unterscheidet sich CPM von CPC?', answer: '<p>CPM berechnet Kosten pro 1.000 Impressionen unabhängig von Klicks, während CPC (Kosten pro Klick) nur bei tatsächlichen Klicks zählt.</p>' },
                { question: 'Was ist ein "guter" CPM?', answer: '<p>Variiert enorm je nach Plattform, Zielgruppe und Format — Display-Anzeigen haben oft niedrige CPMs, während Premium-Video viel teurer sein kann.</p>' },
            ],
            inputs: [
                { name: 'total_spend', label: TOTAL_SPEND_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '500' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.de, type: 'number', min: 1, max: 1000000000000, placeholder: '250000' },
            ],
            outputs: [{ name: 'result', label: 'CPM', precision: 2 }],
        },
    },
}

// ============================================================
// 1160: CTR Calculator (Click-Through Rate)
// ============================================================
const ctrCalculatorTool: ToolDef = {
    id: '1160',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'clicks', default: 250 }, { key: 'impressions', default: 10000 }],
        functions: { result: { type: 'function', functionName: 'ctrCalculator', params: { clicks: 'clicks', impressions: 'impressions' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'ctr-calculator', title: 'CTR Calculator', h1: 'CTR Calculator (Click-Through Rate)',
            meta_title: 'CTR Calculator | Click-Through Rate',
            meta_description: 'Calculate Click-Through Rate (CTR) instantly from clicks and impressions.',
            short_answer: 'This calculator finds your Click-Through Rate (CTR), e.g. 250 clicks from 10,000 impressions = a 2.5% CTR.',
            intro_text: '<p>CTR measures what percentage of people who saw your ad or link actually clicked it — enter your clicks and impressions to see the rate.</p>',
            key_points: [
                '<b>Formula:</b> CTR = (Clicks ÷ Impressions) × 100.',
                '<b>Example:</b> (250 ÷ 10,000) × 100 = 2.5%.',
                '<b>Benchmark:</b> average CTRs vary widely by channel and format — search ads often see 2-5%, while display ads are typically well under 1%.',
            ],
            howto: [
                { question: 'What does a low CTR mean?', answer: '<p>It usually suggests the ad copy, image, or targeting isn\'t resonating with the audience seeing it — worth testing different creative or refining who you\'re showing it to.</p>' },
                { question: 'Does a high CTR guarantee good results?', answer: '<p>Not necessarily — a high CTR with a low conversion rate afterward may mean you\'re attracting clicks that aren\'t genuinely interested in converting.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.en, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-ctr', title: 'Калькулятор CTR', h1: 'Калькулятор CTR (кликабельность)',
            meta_title: 'Калькулятор CTR | Показатель кликабельности',
            meta_description: 'Рассчитайте кликабельность (CTR) мгновенно по количеству кликов и показов.',
            short_answer: 'Этот калькулятор находит CTR, например 250 кликов от 10 000 показов = CTR 2,5%.',
            intro_text: '<p>CTR измеряет, какой процент людей, увидевших вашу рекламу или ссылку, действительно кликнули по ней — введите клики и показы, чтобы увидеть показатель.</p>',
            key_points: [
                '<b>Формула:</b> CTR = (Клики ÷ Показы) × 100.',
                '<b>Пример:</b> (250 ÷ 10 000) × 100 = 2,5%.',
                '<b>Ориентир:</b> средний CTR сильно варьируется по каналам и форматам — поисковая реклама часто показывает 2-5%, а медийная обычно значительно ниже 1%.',
            ],
            howto: [
                { question: 'Что означает низкий CTR?', answer: '<p>Обычно это говорит о том, что текст объявления, изображение или таргетинг не резонируют с аудиторией.</p>' },
                { question: 'Гарантирует ли высокий CTR хорошие результаты?', answer: '<p>Не обязательно — высокий CTR с низкой последующей конверсией может означать, что вы привлекаете клики от неподходящей аудитории.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.ru, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        lv: {
            slug: 'ctr-kalkulators', title: 'CTR Kalkulators', h1: 'CTR Kalkulators (Klikšķu Skaits)',
            meta_title: 'CTR Kalkulators | Klikšķu Caurspiešanas Rādītājs',
            meta_description: 'Aprēķiniet klikšķu skaitu (CTR) acumirklī no klikšķiem un parādīšanām.',
            short_answer: 'Šis kalkulators atrod jūsu CTR, piemēram, 250 klikšķi no 10 000 parādīšanām = CTR 2,5%.',
            intro_text: '<p>CTR mēra, cik procenti cilvēku, kas redzēja jūsu reklāmu vai saiti, faktiski uzklikšķināja uz tās — ievadiet klikšķus un parādīšanas, lai redzētu rādītāju.</p>',
            key_points: [
                '<b>Formula:</b> CTR = (Klikšķi ÷ Parādīšanas) × 100.',
                '<b>Piemērs:</b> (250 ÷ 10 000) × 100 = 2,5%.',
                '<b>Etalons:</b> vidējais CTR ļoti atšķiras atkarībā no kanāla un formāta — meklēšanas reklāmām bieži ir 2-5%, bet displeja reklāmām parasti krietni zem 1%.',
            ],
            howto: [
                { question: 'Ko nozīmē zems CTR?', answer: '<p>Parasti tas norāda, ka reklāmas teksts, attēls vai mērķauditorija nerezonē ar auditoriju, kas to redz.</p>' },
                { question: 'Vai augsts CTR garantē labus rezultātus?', answer: '<p>Ne obligāti — augsts CTR ar zemu konversijas līmeni pēc tam var nozīmēt, ka piesaistāt klikšķus no nepiemērotas auditorijas.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.lv, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-ctr', title: 'Kalkulator CTR', h1: 'Kalkulator CTR (Współczynnik Klikalności)',
            meta_title: 'Kalkulator CTR | Współczynnik Klikalności',
            meta_description: 'Oblicz współczynnik klikalności (CTR) natychmiast na podstawie kliknięć i wyświetleń.',
            short_answer: 'Ten kalkulator znajduje Twój CTR, np. 250 kliknięć z 10 000 wyświetleń = CTR 2,5%.',
            intro_text: '<p>CTR mierzy, jaki procent osób, które zobaczyły Twoją reklamę lub link, faktycznie w nią kliknął — wpisz kliknięcia i wyświetlenia, aby zobaczyć wskaźnik.</p>',
            key_points: [
                '<b>Wzór:</b> CTR = (Kliknięcia ÷ Wyświetlenia) × 100.',
                '<b>Przykład:</b> (250 ÷ 10 000) × 100 = 2,5%.',
                '<b>Punkt odniesienia:</b> średnie CTR bardzo różnią się w zależności od kanału i formatu — reklamy w wyszukiwarce często osiągają 2-5%, a display zwykle poniżej 1%.',
            ],
            howto: [
                { question: 'Co oznacza niski CTR?', answer: '<p>Zwykle sugeruje, że tekst reklamy, obraz lub targetowanie nie trafiają do odbiorców, którzy je widzą.</p>' },
                { question: 'Czy wysoki CTR gwarantuje dobre wyniki?', answer: '<p>Niekoniecznie — wysoki CTR z niskim późniejszym współczynnikiem konwersji może oznaczać przyciąganie kliknięć od niewłaściwych odbiorców.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.pl, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-ctr', title: 'Calculadora de CTR', h1: 'Calculadora de CTR (Tasa de Clics)',
            meta_title: 'Calculadora de CTR | Tasa de Clics',
            meta_description: 'Calcula la tasa de clics (CTR) al instante a partir de clics e impresiones.',
            short_answer: 'Esta calculadora encuentra tu CTR, p. ej. 250 clics de 10,000 impresiones = un CTR del 2.5%.',
            intro_text: '<p>El CTR mide qué porcentaje de personas que vieron tu anuncio o enlace realmente hicieron clic — introduce tus clics e impresiones para ver la tasa.</p>',
            key_points: [
                '<b>Fórmula:</b> CTR = (Clics ÷ Impresiones) × 100.',
                '<b>Ejemplo:</b> (250 ÷ 10,000) × 100 = 2.5%.',
                '<b>Referencia:</b> el CTR promedio varía enormemente según el canal y formato — los anuncios de búsqueda suelen tener 2-5%, mientras que los display suelen estar muy por debajo del 1%.',
            ],
            howto: [
                { question: '¿Qué significa un CTR bajo?', answer: '<p>Generalmente sugiere que el copy, la imagen o la segmentación del anuncio no están resonando con la audiencia que lo ve.</p>' },
                { question: '¿Un CTR alto garantiza buenos resultados?', answer: '<p>No necesariamente — un CTR alto con una tasa de conversión baja después puede significar que atraes clics no genuinamente interesados.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.es, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-ctr', title: 'Calculateur de CTR', h1: 'Calculateur de CTR (Taux de Clics)',
            meta_title: 'Calculateur de CTR | Taux de Clics',
            meta_description: 'Calculez le taux de clics (CTR) instantanément à partir des clics et impressions.',
            short_answer: 'Ce calculateur trouve votre CTR, ex. 250 clics pour 10 000 impressions = un CTR de 2,5%.',
            intro_text: '<p>Le CTR mesure quel pourcentage de personnes ayant vu votre annonce ou lien ont réellement cliqué — entrez vos clics et impressions pour voir le taux.</p>',
            key_points: [
                '<b>Formule :</b> CTR = (Clics ÷ Impressions) × 100.',
                '<b>Exemple :</b> (250 ÷ 10 000) × 100 = 2,5%.',
                '<b>Référence :</b> le CTR moyen varie énormément selon le canal et le format — les annonces de recherche affichent souvent 2-5%, tandis que le display est généralement bien en dessous de 1%.',
            ],
            howto: [
                { question: 'Que signifie un CTR faible ?', answer: '<p>Cela suggère généralement que le texte, l’image ou le ciblage de l’annonce ne résonne pas avec l’audience qui la voit.</p>' },
                { question: 'Un CTR élevé garantit-il de bons résultats ?', answer: '<p>Pas nécessairement — un CTR élevé avec un faible taux de conversion ensuite peut signifier que vous attirez des clics non réellement intéressés.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.fr, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-ctr', title: 'Calcolatore di CTR', h1: 'Calcolatore di CTR (Tasso di Clic)',
            meta_title: 'Calcolatore di CTR | Tasso di Clic',
            meta_description: 'Calcola il tasso di clic (CTR) istantaneamente da clic e impressioni.',
            short_answer: 'Questo calcolatore trova il tuo CTR, es. 250 clic da 10.000 impressioni = un CTR del 2,5%.',
            intro_text: '<p>Il CTR misura quale percentuale di persone che hanno visto il tuo annuncio o link ci ha effettivamente cliccato — inserisci clic e impressioni per vedere il tasso.</p>',
            key_points: [
                '<b>Formula:</b> CTR = (Clic ÷ Impressioni) × 100.',
                '<b>Esempio:</b> (250 ÷ 10.000) × 100 = 2,5%.',
                '<b>Benchmark:</b> il CTR medio varia enormemente in base a canale e formato — gli annunci di ricerca spesso vedono 2-5%, mentre il display è tipicamente ben sotto l\'1%.',
            ],
            howto: [
                { question: 'Cosa significa un CTR basso?', answer: '<p>Di solito suggerisce che il testo, l\'immagine o il targeting dell\'annuncio non risuonano con il pubblico che lo vede.</p>' },
                { question: 'Un CTR alto garantisce buoni risultati?', answer: '<p>Non necessariamente — un CTR alto con un basso tasso di conversione successivo può significare che attiri clic non realmente interessati.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.it, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
        de: {
            slug: 'ctr-rechner', title: 'CTR-Rechner', h1: 'CTR-Rechner (Klickrate)',
            meta_title: 'CTR-Rechner | Klickrate',
            meta_description: 'Berechnen Sie die Klickrate (CTR) sofort aus Klicks und Impressionen.',
            short_answer: 'Dieser Rechner findet Ihre CTR, z.B. 250 Klicks aus 10.000 Impressionen = eine CTR von 2,5%.',
            intro_text: '<p>CTR misst, welcher Prozentsatz der Personen, die Ihre Anzeige oder Ihren Link gesehen haben, tatsächlich darauf geklickt hat — geben Sie Ihre Klicks und Impressionen ein, um die Rate zu sehen.</p>',
            key_points: [
                '<b>Formel:</b> CTR = (Klicks ÷ Impressionen) × 100.',
                '<b>Beispiel:</b> (250 ÷ 10.000) × 100 = 2,5%.',
                '<b>Richtwert:</b> durchschnittliche CTRs variieren stark je nach Kanal und Format — Suchanzeigen erreichen oft 2-5%, während Display-Anzeigen typischerweise deutlich unter 1% liegen.',
            ],
            howto: [
                { question: 'Was bedeutet eine niedrige CTR?', answer: '<p>Dies deutet meist darauf hin, dass Anzeigentext, Bild oder Targeting nicht bei der Zielgruppe ankommen.</p>' },
                { question: 'Garantiert eine hohe CTR gute Ergebnisse?', answer: '<p>Nicht unbedingt — eine hohe CTR mit anschließend niedriger Conversion-Rate kann bedeuten, dass Sie Klicks von nicht wirklich interessierten Nutzern anziehen.</p>' },
            ],
            inputs: [
                { name: 'clicks', label: CLICKS_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '250' },
                { name: 'impressions', label: IMPRESSIONS_LABEL.de, type: 'number', min: 1, max: 1000000000000, placeholder: '10000' },
            ],
            outputs: [{ name: 'result', label: 'CTR (%)', precision: 2 }],
        },
    },
}

// ============================================================
// 1161: Conversion Rate Calculator
// ============================================================
const conversionRateCalculatorTool: ToolDef = {
    id: '1161',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'conversions', default: 50 }, { key: 'visitors', default: 2000 }],
        functions: { result: { type: 'function', functionName: 'conversionRateCalculator', params: { conversions: 'conversions', visitors: 'visitors' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'conversion-rate-calculator', title: 'Conversion Rate Calculator', h1: 'Conversion Rate Calculator',
            meta_title: 'Conversion Rate Calculator | Visitors to Conversions',
            meta_description: 'Calculate your conversion rate instantly from conversions and total visitors.',
            short_answer: 'This calculator finds your conversion rate, e.g. 50 conversions from 2,000 visitors = a 2.5% conversion rate.',
            intro_text: '<p>Conversion rate measures what percentage of visitors complete a desired action (a purchase, sign-up, or lead form) — enter your conversions and total visitors to see the rate.</p>',
            key_points: [
                '<b>Formula:</b> Conversion Rate = (Conversions ÷ Visitors) × 100.',
                '<b>Example:</b> (50 ÷ 2,000) × 100 = 2.5%.',
                '<b>Typical range:</b> e-commerce conversion rates commonly fall between 1-4%, though it varies widely by industry, traffic source, and how "conversion" is defined.',
            ],
            howto: [
                { question: 'How can I improve my conversion rate?', answer: '<p>Common levers include clearer calls-to-action, faster page load times, trust signals (reviews, guarantees), simplified checkout, and better-matched traffic sources.</p>' },
                { question: 'Should I use visitors or sessions in this calculation?', answer: '<p>Either works as long as you\'re consistent — using unique visitors avoids double-counting repeat visits within the same period, which is usually the more standard approach.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.en, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Conversion Rate (%)', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-koeffiicienta-konversii', title: 'Калькулятор коэффициента конверсии', h1: 'Калькулятор коэффициента конверсии',
            meta_title: 'Калькулятор коэффициента конверсии | От посетителей к конверсиям',
            meta_description: 'Рассчитайте коэффициент конверсии мгновенно по количеству конверсий и посетителей.',
            short_answer: 'Этот калькулятор находит коэффициент конверсии, например 50 конверсий от 2000 посетителей = 2,5%.',
            intro_text: '<p>Коэффициент конверсии измеряет, какой процент посетителей совершает целевое действие (покупку, регистрацию, заявку) — введите конверсии и общее число посетителей, чтобы увидеть показатель.</p>',
            key_points: [
                '<b>Формула:</b> Коэффициент конверсии = (Конверсии ÷ Посетители) × 100.',
                '<b>Пример:</b> (50 ÷ 2000) × 100 = 2,5%.',
                '<b>Типичный диапазон:</b> конверсия в e-commerce обычно составляет 1-4%, но сильно зависит от отрасли, источника трафика и определения «конверсии».',
            ],
            howto: [
                { question: 'Как улучшить коэффициент конверсии?', answer: '<p>Обычные рычаги: более чёткие призывы к действию, быстрая загрузка страниц, сигналы доверия, упрощённое оформление заказа.</p>' },
                { question: 'Использовать посетителей или сессии в этом расчёте?', answer: '<p>Оба варианта подходят, если вы последовательны — уникальные посетители избегают двойного счёта повторных визитов.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.ru, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Коэффициент конверсии (%)', precision: 2 }],
        },
        lv: {
            slug: 'konversijas-koeficienta-kalkulators', title: 'Konversijas Koeficienta Kalkulators', h1: 'Konversijas Koeficienta Kalkulators',
            meta_title: 'Konversijas Koeficienta Kalkulators | No Apmeklētājiem uz Konversijām',
            meta_description: 'Aprēķiniet konversijas koeficientu acumirklī no konversijām un kopējā apmeklētāju skaita.',
            short_answer: 'Šis kalkulators atrod jūsu konversijas koeficientu, piemēram, 50 konversijas no 2000 apmeklētājiem = 2,5%.',
            intro_text: '<p>Konversijas koeficients mēra, cik procenti apmeklētāju veic vēlamo darbību (pirkumu, reģistrāciju, pieteikumu) — ievadiet konversijas un kopējo apmeklētāju skaitu, lai redzētu rādītāju.</p>',
            key_points: [
                '<b>Formula:</b> Konversijas Koeficients = (Konversijas ÷ Apmeklētāji) × 100.',
                '<b>Piemērs:</b> (50 ÷ 2000) × 100 = 2,5%.',
                '<b>Tipiskais diapazons:</b> e-komercijas konversijas parasti ir 1-4%, taču tas ļoti atšķiras atkarībā no nozares un trafika avota.',
            ],
            howto: [
                { question: 'Kā uzlabot konversijas koeficientu?', answer: '<p>Bieži izmantoti līdzekļi: skaidrāki aicinājumi rīkoties, ātrāka lapu ielāde, uzticības signāli, vienkāršota pasūtīšana.</p>' },
                { question: 'Vai izmantot apmeklētājus vai sesijas šajā aprēķinā?', answer: '<p>Abi der, ja esat konsekventi — unikālie apmeklētāji izvairās no atkārtotu apmeklējumu dubultas skaitīšanas.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.lv, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Konversijas Koeficients (%)', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-wspolczynnika-konwersji', title: 'Kalkulator Współczynnika Konwersji', h1: 'Kalkulator Współczynnika Konwersji',
            meta_title: 'Kalkulator Współczynnika Konwersji | Od Odwiedzających do Konwersji',
            meta_description: 'Oblicz współczynnik konwersji natychmiast na podstawie konwersji i całkowitej liczby odwiedzających.',
            short_answer: 'Ten kalkulator znajduje Twój współczynnik konwersji, np. 50 konwersji z 2000 odwiedzających = 2,5%.',
            intro_text: '<p>Współczynnik konwersji mierzy, jaki procent odwiedzających wykonuje pożądaną akcję (zakup, rejestrację, formularz kontaktowy) — wpisz konwersje i całkowitą liczbę odwiedzających, aby zobaczyć wskaźnik.</p>',
            key_points: [
                '<b>Wzór:</b> Współczynnik Konwersji = (Konwersje ÷ Odwiedzający) × 100.',
                '<b>Przykład:</b> (50 ÷ 2000) × 100 = 2,5%.',
                '<b>Typowy zakres:</b> współczynniki konwersji e-commerce zwykle wynoszą 1-4%, ale mocno zależą od branży i źródła ruchu.',
            ],
            howto: [
                { question: 'Jak poprawić współczynnik konwersji?', answer: '<p>Częste dźwignie to jaśniejsze wezwania do działania, szybsze ładowanie strony, sygnały zaufania, uproszczony proces zakupowy.</p>' },
                { question: 'Czy używać odwiedzających czy sesji w tym obliczeniu?', answer: '<p>Oba działają, jeśli jesteś konsekwentny — unikalni odwiedzający unikają podwójnego liczenia powtórnych wizyt.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.pl, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Współczynnik Konwersji (%)', precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-tasa-de-conversion', title: 'Calculadora de Tasa de Conversión', h1: 'Calculadora de Tasa de Conversión',
            meta_title: 'Calculadora de Tasa de Conversión | De Visitantes a Conversiones',
            meta_description: 'Calcula tu tasa de conversión al instante a partir de conversiones y visitantes totales.',
            short_answer: 'Esta calculadora encuentra tu tasa de conversión, p. ej. 50 conversiones de 2,000 visitantes = una tasa del 2.5%.',
            intro_text: '<p>La tasa de conversión mide qué porcentaje de visitantes completa una acción deseada (una compra, registro o formulario) — introduce tus conversiones y visitantes totales para ver la tasa.</p>',
            key_points: [
                '<b>Fórmula:</b> Tasa de Conversión = (Conversiones ÷ Visitantes) × 100.',
                '<b>Ejemplo:</b> (50 ÷ 2,000) × 100 = 2.5%.',
                '<b>Rango típico:</b> las tasas de conversión de e-commerce suelen estar entre 1-4%, aunque varía mucho según la industria y fuente de tráfico.',
            ],
            howto: [
                { question: '¿Cómo puedo mejorar mi tasa de conversión?', answer: '<p>Palancas comunes incluyen llamadas a la acción más claras, carga de página más rápida, señales de confianza, checkout simplificado.</p>' },
                { question: '¿Debo usar visitantes o sesiones en este cálculo?', answer: '<p>Ambos funcionan si eres consistente — usar visitantes únicos evita contar dos veces las visitas repetidas.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.es, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Tasa de Conversión (%)', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-taux-de-conversion', title: 'Calculateur de Taux de Conversion', h1: 'Calculateur de Taux de Conversion',
            meta_title: 'Calculateur de Taux de Conversion | Des Visiteurs aux Conversions',
            meta_description: 'Calculez votre taux de conversion instantanément à partir des conversions et des visiteurs totaux.',
            short_answer: 'Ce calculateur trouve votre taux de conversion, ex. 50 conversions pour 2 000 visiteurs = un taux de 2,5%.',
            intro_text: '<p>Le taux de conversion mesure quel pourcentage de visiteurs accomplit une action souhaitée (achat, inscription, formulaire) — entrez vos conversions et visiteurs totaux pour voir le taux.</p>',
            key_points: [
                '<b>Formule :</b> Taux de Conversion = (Conversions ÷ Visiteurs) × 100.',
                '<b>Exemple :</b> (50 ÷ 2 000) × 100 = 2,5%.',
                '<b>Plage typique :</b> les taux de conversion e-commerce se situent souvent entre 1-4%, mais varient beaucoup selon le secteur et la source de trafic.',
            ],
            howto: [
                { question: 'Comment améliorer mon taux de conversion ?', answer: '<p>Les leviers courants incluent des appels à l’action plus clairs, un chargement de page plus rapide, des signaux de confiance, un paiement simplifié.</p>' },
                { question: 'Dois-je utiliser les visiteurs ou les sessions dans ce calcul ?', answer: '<p>Les deux fonctionnent si vous êtes cohérent — les visiteurs uniques évitent de compter deux fois les visites répétées.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.fr, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Taux de Conversion (%)', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-tasso-di-conversione', title: 'Calcolatore di Tasso di Conversione', h1: 'Calcolatore di Tasso di Conversione',
            meta_title: 'Calcolatore di Tasso di Conversione | Da Visitatori a Conversioni',
            meta_description: 'Calcola il tasso di conversione istantaneamente da conversioni e visitatori totali.',
            short_answer: 'Questo calcolatore trova il tuo tasso di conversione, es. 50 conversioni da 2.000 visitatori = un tasso del 2,5%.',
            intro_text: '<p>Il tasso di conversione misura quale percentuale di visitatori completa un\'azione desiderata (un acquisto, una registrazione, un modulo) — inserisci le conversioni e i visitatori totali per vedere il tasso.</p>',
            key_points: [
                '<b>Formula:</b> Tasso di Conversione = (Conversioni ÷ Visitatori) × 100.',
                '<b>Esempio:</b> (50 ÷ 2.000) × 100 = 2,5%.',
                '<b>Intervallo tipico:</b> i tassi di conversione e-commerce sono comunemente tra 1-4%, ma variano molto in base a settore e fonte di traffico.',
            ],
            howto: [
                { question: 'Come posso migliorare il mio tasso di conversione?', answer: '<p>Leve comuni includono call-to-action più chiare, caricamento pagine più veloce, segnali di fiducia, checkout semplificato.</p>' },
                { question: 'Dovrei usare visitatori o sessioni in questo calcolo?', answer: '<p>Entrambi funzionano se sei coerente — usare visitatori unici evita di contare due volte le visite ripetute.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.it, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Tasso di Conversione (%)', precision: 2 }],
        },
        de: {
            slug: 'conversion-rate-rechner', title: 'Conversion-Rate-Rechner', h1: 'Conversion-Rate-Rechner',
            meta_title: 'Conversion-Rate-Rechner | Von Besuchern zu Conversions',
            meta_description: 'Berechnen Sie Ihre Conversion-Rate sofort aus Conversions und Gesamtbesuchern.',
            short_answer: 'Dieser Rechner findet Ihre Conversion-Rate, z.B. 50 Conversions aus 2.000 Besuchern = eine Rate von 2,5%.',
            intro_text: '<p>Die Conversion-Rate misst, welcher Prozentsatz der Besucher eine gewünschte Aktion abschließt (Kauf, Anmeldung, Formular) — geben Sie Ihre Conversions und Gesamtbesucher ein, um die Rate zu sehen.</p>',
            key_points: [
                '<b>Formel:</b> Conversion-Rate = (Conversions ÷ Besucher) × 100.',
                '<b>Beispiel:</b> (50 ÷ 2.000) × 100 = 2,5%.',
                '<b>Typischer Bereich:</b> E-Commerce-Conversion-Raten liegen häufig bei 1-4%, variieren aber stark je nach Branche und Traffic-Quelle.',
            ],
            howto: [
                { question: 'Wie kann ich meine Conversion-Rate verbessern?', answer: '<p>Übliche Hebel sind klarere Handlungsaufforderungen, schnellere Ladezeiten, Vertrauenssignale, vereinfachter Checkout.</p>' },
                { question: 'Soll ich Besucher oder Sitzungen in dieser Berechnung verwenden?', answer: '<p>Beides funktioniert, solange Sie konsistent sind — eindeutige Besucher vermeiden Doppelzählung wiederholter Besuche.</p>' },
            ],
            inputs: [
                { name: 'conversions', label: CONVERSIONS_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
                { name: 'visitors', label: VISITORS_LABEL.de, type: 'number', min: 1, max: 1000000000, placeholder: '2000' },
            ],
            outputs: [{ name: 'result', label: 'Conversion-Rate (%)', precision: 2 }],
        },
    },
}

const STAGE1_LABEL: Record<string, string> = { en: 'Visitors', ru: 'Посетители', de: 'Besucher', es: 'Visitantes', fr: 'Visiteurs', it: 'Visitatori', pl: 'Odwiedzający', lv: 'Apmeklētāji' }
const STAGE2_LABEL: Record<string, string> = { en: 'Leads', ru: 'Лиды', de: 'Leads', es: 'Leads', fr: 'Leads', it: 'Lead', pl: 'Leady', lv: 'Potenciālie Klienti' }
const STAGE3_LABEL: Record<string, string> = { en: 'Qualified Leads', ru: 'Квалифицированные лиды', de: 'Qualifizierte Leads', es: 'Leads Cualificados', fr: 'Leads Qualifiés', it: 'Lead Qualificati', pl: 'Zakwalifikowane Leady', lv: 'Kvalificēti Potenciālie Klienti' }
const STAGE4_LABEL: Record<string, string> = { en: 'Customers', ru: 'Клиенты', de: 'Kunden', es: 'Clientes', fr: 'Clients', it: 'Clienti', pl: 'Klienci', lv: 'Klienti' }

// ============================================================
// 1162: Marketing Funnel Conversion Calculator
// ============================================================
const funnelConversionCalculatorTool: ToolDef = {
    id: '1162',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'stage1', default: 10000 }, { key: 'stage2', default: 1000 }, { key: 'stage3', default: 300 }, { key: 'stage4', default: 60 }],
        functions: { result: { type: 'function', functionName: 'funnelConversionCalculator', params: { stage1: 'stage1', stage2: 'stage2', stage3: 'stage3', stage4: 'stage4' } } },
        outputs: [{ key: 'rate_1_to_2', precision: 2 }, { key: 'rate_2_to_3', precision: 2 }, { key: 'rate_3_to_4', precision: 2 }, { key: 'overall_rate', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'marketing-funnel-conversion-calculator', title: 'Marketing Funnel Conversion Calculator', h1: 'Marketing Funnel Conversion Calculator',
            meta_title: 'Marketing Funnel Conversion Calculator | Stage-by-Stage Drop-off',
            meta_description: 'Calculate conversion rates at each stage of your marketing funnel, from visitors to customers.',
            short_answer: 'This calculator finds the conversion rate between each stage of a 4-stage funnel (Visitors → Leads → Qualified Leads → Customers), plus the overall rate.',
            intro_text: '<p>Enter the number of people at each stage of your funnel to see exactly where you\'re losing the most prospects — the biggest drop-off points are usually where optimization efforts pay off most.</p>',
            key_points: [
                '<b>Stage-by-stage rates:</b> each consecutive pair (Visitors→Leads, Leads→Qualified Leads, Qualified Leads→Customers) gets its own conversion percentage.',
                '<b>Overall rate:</b> the full-funnel conversion from Visitors all the way to Customers, useful for high-level tracking over time.',
                '<b>Where to focus:</b> the stage with the lowest conversion percentage usually represents the biggest opportunity for improvement, though the right fix depends on why people are dropping off there.',
            ],
            howto: [
                { question: 'What if my funnel only has 2 or 3 stages, not 4?', answer: '<p>Enter the same value for any stage you don\'t use as the one before it — that stage will show a 100% conversion rate and effectively drop out of the analysis.</p>' },
                { question: 'Why is my overall conversion rate so much lower than any individual stage?', answer: '<p>Overall rate compounds every stage together — even three strong 30% conversion stages in a row only carry 2.7% of visitors all the way through (0.3 × 0.3 × 0.3).</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.en, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Visitors → Leads', precision: 2 },
                { name: 'rate_2_to_3', label: 'Leads → Qualified Leads', precision: 2 },
                { name: 'rate_3_to_4', label: 'Qualified Leads → Customers', precision: 2 },
                { name: 'overall_rate', label: 'Overall Conversion Rate', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-konversii-voronki', title: 'Калькулятор конверсии воронки', h1: 'Калькулятор конверсии маркетинговой воронки',
            meta_title: 'Калькулятор конверсии воронки | Отсев на каждом этапе',
            meta_description: 'Рассчитайте коэффициенты конверсии на каждом этапе маркетинговой воронки, от посетителей до клиентов.',
            short_answer: 'Этот калькулятор находит конверсию между каждым этапом 4-этапной воронки (Посетители → Лиды → Квалифицированные лиды → Клиенты), плюс общий показатель.',
            intro_text: '<p>Введите количество людей на каждом этапе воронки, чтобы точно увидеть, где вы теряете больше всего потенциальных клиентов.</p>',
            key_points: [
                '<b>Показатели по этапам:</b> каждая последовательная пара получает свой процент конверсии.',
                '<b>Общий показатель:</b> конверсия по всей воронке от посетителей до клиентов.',
                '<b>Куда сосредоточиться:</b> этап с самым низким процентом конверсии обычно представляет наибольшую возможность для улучшения.',
            ],
            howto: [
                { question: 'Что если в моей воронке только 2 или 3 этапа, а не 4?', answer: '<p>Введите то же значение для неиспользуемого этапа, что и для предыдущего — этот этап покажет 100% конверсию.</p>' },
                { question: 'Почему моя общая конверсия намного ниже, чем на отдельных этапах?', answer: '<p>Общий показатель перемножает все этапы вместе — даже три сильных этапа по 30% дают только 2,7% сквозной конверсии.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.ru, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Посетители → Лиды', precision: 2 },
                { name: 'rate_2_to_3', label: 'Лиды → Квалифицированные лиды', precision: 2 },
                { name: 'rate_3_to_4', label: 'Квалифицированные лиды → Клиенты', precision: 2 },
                { name: 'overall_rate', label: 'Общая конверсия', precision: 2 },
            ],
        },
        lv: {
            slug: 'marketinga-piltuves-konversijas-kalkulators', title: 'Mārketinga Piltuves Konversijas Kalkulators', h1: 'Mārketinga Piltuves Konversijas Kalkulators',
            meta_title: 'Mārketinga Piltuves Konversijas Kalkulators | Kritums Katrā Posmā',
            meta_description: 'Aprēķiniet konversijas koeficientus katrā mārketinga piltuves posmā, no apmeklētājiem līdz klientiem.',
            short_answer: 'Šis kalkulators atrod konversiju starp katru 4 posmu piltuves posmu (Apmeklētāji → Potenciālie Klienti → Kvalificēti Potenciālie Klienti → Klienti), plus kopējo rādītāju.',
            intro_text: '<p>Ievadiet cilvēku skaitu katrā piltuves posmā, lai precīzi redzētu, kur zaudējat visvairāk potenciālo klientu.</p>',
            key_points: [
                '<b>Rādītāji pa posmiem:</b> katrs secīgais pāris iegūst savu konversijas procentu.',
                '<b>Kopējais rādītājs:</b> pilnas piltuves konversija no apmeklētājiem līdz klientiem.',
                '<b>Kur koncentrēties:</b> posms ar zemāko konversijas procentu parasti sniedz vislielāko iespēju uzlabojumiem.',
            ],
            howto: [
                { question: 'Ko darīt, ja manai piltuvei ir tikai 2 vai 3 posmi, ne 4?', answer: '<p>Ievadiet to pašu vērtību neizmantotajam posmam, kas iepriekšējam — šis posms parādīs 100% konversiju.</p>' },
                { question: 'Kāpēc mana kopējā konversija ir daudz zemāka nekā atsevišķos posmos?', answer: '<p>Kopējais rādītājs reizina visus posmus kopā — pat trīs spēcīgi 30% posmi dod tikai 2,7% caurejas konversiju.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.lv, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Apmeklētāji → Potenciālie Klienti', precision: 2 },
                { name: 'rate_2_to_3', label: 'Potenciālie Klienti → Kvalificēti', precision: 2 },
                { name: 'rate_3_to_4', label: 'Kvalificēti → Klienti', precision: 2 },
                { name: 'overall_rate', label: 'Kopējā Konversija', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-konwersji-lejka-marketingowego', title: 'Kalkulator Konwersji Lejka Marketingowego', h1: 'Kalkulator Konwersji Lejka Marketingowego',
            meta_title: 'Kalkulator Konwersji Lejka | Spadek na Każdym Etapie',
            meta_description: 'Oblicz współczynniki konwersji na każdym etapie lejka marketingowego, od odwiedzających do klientów.',
            short_answer: 'Ten kalkulator znajduje konwersję między każdym etapem 4-etapowego lejka (Odwiedzający → Leady → Zakwalifikowane Leady → Klienci), plus ogólny wskaźnik.',
            intro_text: '<p>Wpisz liczbę osób na każdym etapie lejka, aby dokładnie zobaczyć, gdzie tracisz najwięcej potencjalnych klientów.</p>',
            key_points: [
                '<b>Wskaźniki etapowe:</b> każda kolejna para otrzymuje własny procent konwersji.',
                '<b>Ogólny wskaźnik:</b> konwersja całego lejka od odwiedzających do klientów.',
                '<b>Gdzie się skupić:</b> etap z najniższym procentem konwersji zwykle stanowi największą szansę na poprawę.',
            ],
            howto: [
                { question: 'Co jeśli mój lejek ma tylko 2 lub 3 etapy, nie 4?', answer: '<p>Wpisz tę samą wartość dla nieużywanego etapu co dla poprzedniego — ten etap pokaże 100% konwersji.</p>' },
                { question: 'Dlaczego moja ogólna konwersja jest znacznie niższa niż na poszczególnych etapach?', answer: '<p>Ogólny wskaźnik mnoży wszystkie etapy razem — nawet trzy silne etapy po 30% dają tylko 2,7% konwersji przelotowej.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.pl, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Odwiedzający → Leady', precision: 2 },
                { name: 'rate_2_to_3', label: 'Leady → Zakwalifikowane', precision: 2 },
                { name: 'rate_3_to_4', label: 'Zakwalifikowane → Klienci', precision: 2 },
                { name: 'overall_rate', label: 'Ogólna Konwersja', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-conversion-de-embudo', title: 'Calculadora de Conversión de Embudo', h1: 'Calculadora de Conversión de Embudo de Marketing',
            meta_title: 'Calculadora de Conversión de Embudo | Caída en Cada Etapa',
            meta_description: 'Calcula las tasas de conversión en cada etapa de tu embudo de marketing, desde visitantes hasta clientes.',
            short_answer: 'Esta calculadora encuentra la conversión entre cada etapa de un embudo de 4 etapas (Visitantes → Leads → Leads Cualificados → Clientes), más la tasa general.',
            intro_text: '<p>Introduce el número de personas en cada etapa de tu embudo para ver exactamente dónde estás perdiendo más prospectos.</p>',
            key_points: [
                '<b>Tasas por etapa:</b> cada par consecutivo obtiene su propio porcentaje de conversión.',
                '<b>Tasa general:</b> la conversión de todo el embudo desde visitantes hasta clientes.',
                '<b>Dónde enfocarse:</b> la etapa con el menor porcentaje de conversión suele representar la mayor oportunidad de mejora.',
            ],
            howto: [
                { question: '¿Qué pasa si mi embudo solo tiene 2 o 3 etapas, no 4?', answer: '<p>Introduce el mismo valor para cualquier etapa que no uses que el de la anterior — esa etapa mostrará una conversión del 100%.</p>' },
                { question: '¿Por qué mi tasa de conversión general es mucho más baja que cualquier etapa individual?', answer: '<p>La tasa general compone todas las etapas juntas — incluso tres etapas fuertes del 30% seguidas solo llevan un 2.7% hasta el final.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.es, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Visitantes → Leads', precision: 2 },
                { name: 'rate_2_to_3', label: 'Leads → Leads Cualificados', precision: 2 },
                { name: 'rate_3_to_4', label: 'Leads Cualificados → Clientes', precision: 2 },
                { name: 'overall_rate', label: 'Tasa de Conversión General', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-conversion-dentonnoir', title: 'Calculateur de Conversion d’Entonnoir', h1: 'Calculateur de Conversion d’Entonnoir Marketing',
            meta_title: 'Calculateur de Conversion d’Entonnoir | Chute à Chaque Étape',
            meta_description: 'Calculez les taux de conversion à chaque étape de votre entonnoir marketing, des visiteurs aux clients.',
            short_answer: 'Ce calculateur trouve la conversion entre chaque étape d’un entonnoir à 4 étapes (Visiteurs → Leads → Leads Qualifiés → Clients), plus le taux global.',
            intro_text: '<p>Entrez le nombre de personnes à chaque étape de votre entonnoir pour voir exactement où vous perdez le plus de prospects.</p>',
            key_points: [
                '<b>Taux par étape :</b> chaque paire consécutive obtient son propre pourcentage de conversion.',
                '<b>Taux global :</b> la conversion de l’entonnoir complet, des visiteurs aux clients.',
                '<b>Où se concentrer :</b> l’étape avec le pourcentage de conversion le plus bas représente généralement la plus grande opportunité d’amélioration.',
            ],
            howto: [
                { question: 'Et si mon entonnoir n’a que 2 ou 3 étapes, pas 4 ?', answer: '<p>Entrez la même valeur pour toute étape non utilisée que pour la précédente — cette étape affichera une conversion de 100%.</p>' },
                { question: 'Pourquoi mon taux de conversion global est-il tellement plus bas que n’importe quelle étape individuelle ?', answer: '<p>Le taux global compose toutes les étapes ensemble — même trois étapes fortes à 30% d’affilée ne laissent passer que 2,7% des visiteurs.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.fr, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Visiteurs → Leads', precision: 2 },
                { name: 'rate_2_to_3', label: 'Leads → Leads Qualifiés', precision: 2 },
                { name: 'rate_3_to_4', label: 'Leads Qualifiés → Clients', precision: 2 },
                { name: 'overall_rate', label: 'Taux de Conversion Global', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-conversione-del-funnel', title: 'Calcolatore di Conversione del Funnel', h1: 'Calcolatore di Conversione del Funnel di Marketing',
            meta_title: 'Calcolatore di Conversione del Funnel | Calo a Ogni Fase',
            meta_description: 'Calcola i tassi di conversione in ogni fase del tuo funnel di marketing, dai visitatori ai clienti.',
            short_answer: 'Questo calcolatore trova la conversione tra ogni fase di un funnel a 4 fasi (Visitatori → Lead → Lead Qualificati → Clienti), più il tasso complessivo.',
            intro_text: '<p>Inserisci il numero di persone in ogni fase del tuo funnel per vedere esattamente dove stai perdendo più potenziali clienti.</p>',
            key_points: [
                '<b>Tassi per fase:</b> ogni coppia consecutiva ottiene la propria percentuale di conversione.',
                '<b>Tasso complessivo:</b> la conversione dell\'intero funnel dai visitatori ai clienti.',
                '<b>Dove concentrarsi:</b> la fase con la percentuale di conversione più bassa rappresenta solitamente la maggiore opportunità di miglioramento.',
            ],
            howto: [
                { question: 'Cosa succede se il mio funnel ha solo 2 o 3 fasi, non 4?', answer: '<p>Inserisci lo stesso valore per qualsiasi fase non utilizzata di quello precedente — quella fase mostrerà una conversione del 100%.</p>' },
                { question: 'Perché il mio tasso di conversione complessivo è molto più basso di qualsiasi fase individuale?', answer: '<p>Il tasso complessivo compone tutte le fasi insieme — anche tre fasi forti al 30% di seguito portano solo il 2,7% fino in fondo.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.it, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Visitatori → Lead', precision: 2 },
                { name: 'rate_2_to_3', label: 'Lead → Lead Qualificati', precision: 2 },
                { name: 'rate_3_to_4', label: 'Lead Qualificati → Clienti', precision: 2 },
                { name: 'overall_rate', label: 'Tasso di Conversione Complessivo', precision: 2 },
            ],
        },
        de: {
            slug: 'marketing-funnel-konversionsrechner', title: 'Marketing-Funnel-Konversionsrechner', h1: 'Marketing-Funnel-Konversionsrechner',
            meta_title: 'Marketing-Funnel-Konversionsrechner | Abfall in Jeder Phase',
            meta_description: 'Berechnen Sie die Konversionsraten in jeder Phase Ihres Marketing-Funnels, von Besuchern bis zu Kunden.',
            short_answer: 'Dieser Rechner findet die Konversion zwischen jeder Phase eines 4-Phasen-Funnels (Besucher → Leads → Qualifizierte Leads → Kunden), plus die Gesamtrate.',
            intro_text: '<p>Geben Sie die Anzahl der Personen in jeder Phase Ihres Funnels ein, um genau zu sehen, wo Sie die meisten Interessenten verlieren.</p>',
            key_points: [
                '<b>Phasen-Raten:</b> jedes aufeinanderfolgende Paar erhält seinen eigenen Konversionsprozentsatz.',
                '<b>Gesamtrate:</b> die Konversion des gesamten Funnels von Besuchern bis zu Kunden.',
                '<b>Worauf man sich konzentrieren sollte:</b> die Phase mit dem niedrigsten Konversionsprozentsatz stellt normalerweise die größte Verbesserungsmöglichkeit dar.',
            ],
            howto: [
                { question: 'Was, wenn mein Funnel nur 2 oder 3 Phasen hat, nicht 4?', answer: '<p>Geben Sie für jede ungenutzte Phase denselben Wert wie für die vorherige ein — diese Phase zeigt dann eine 100%ige Konversion.</p>' },
                { question: 'Warum ist meine Gesamtkonversionsrate viel niedriger als jede einzelne Phase?', answer: '<p>Die Gesamtrate multipliziert alle Phasen zusammen — selbst drei starke 30%-Phasen hintereinander lassen nur 2,7% ganz durch.</p>' },
            ],
            inputs: [
                { name: 'stage1', label: STAGE1_LABEL.de, type: 'number', min: 1, max: 1000000000, placeholder: '10000' },
                { name: 'stage2', label: STAGE2_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'stage3', label: STAGE3_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '300' },
                { name: 'stage4', label: STAGE4_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '60' },
            ],
            outputs: [
                { name: 'rate_1_to_2', label: 'Besucher → Leads', precision: 2 },
                { name: 'rate_2_to_3', label: 'Leads → Qualifizierte Leads', precision: 2 },
                { name: 'rate_3_to_4', label: 'Qualifizierte Leads → Kunden', precision: 2 },
                { name: 'overall_rate', label: 'Gesamtkonversionsrate', precision: 2 },
            ],
        },
    },
}

const CONVERSION_VALUE_LABEL: Record<string, string> = { en: 'Conversion Value', ru: 'Ценность конверсии', de: 'Conversion-Wert', es: 'Valor de Conversión', fr: 'Valeur de Conversion', it: 'Valore di Conversione', pl: 'Wartość Konwersji', lv: 'Konversijas Vērtība' }
const ATTR_MODEL_LABEL: Record<string, string> = { en: 'Attribution Model', ru: 'Модель атрибуции', de: 'Attributionsmodell', es: 'Modelo de Atribución', fr: 'Modèle d’Attribution', it: 'Modello di Attribuzione', pl: 'Model Atrybucji', lv: 'Atribūcijas Modelis' }
function attributionModelOptions(lang: string) {
    const l: Record<string, [string, string, string, string]> = {
        en: ['First Touch', 'Last Touch', 'Linear (Equal Credit)', 'Position-Based (U-Shaped)'],
        ru: ['Первое касание', 'Последнее касание', 'Линейная (равное распределение)', 'По позиции (U-образная)'],
        de: ['Erster Kontakt', 'Letzter Kontakt', 'Linear (Gleiche Gewichtung)', 'Positionsbasiert (U-Form)'],
        es: ['Primer Contacto', 'Último Contacto', 'Lineal (Crédito Igual)', 'Basado en Posición (Forma de U)'],
        fr: ['Premier Contact', 'Dernier Contact', 'Linéaire (Crédit Égal)', 'Basé sur la Position (Forme en U)'],
        it: ['Primo Contatto', 'Ultimo Contatto', 'Lineare (Credito Uguale)', 'Basato sulla Posizione (Forma a U)'],
        pl: ['Pierwszy Kontakt', 'Ostatni Kontakt', 'Liniowy (Równy Udział)', 'Oparty na Pozycji (Kształt U)'],
        lv: ['Pirmais Kontakts', 'Pēdējais Kontakts', 'Lineārais (Vienāds Sadalījums)', 'Pozīcijas (U-Veida)'],
    }
    const [first, last, linear, position] = l[lang] || l.en
    return [
        { value: 'first_touch', label: first }, { value: 'last_touch', label: last },
        { value: 'linear', label: linear }, { value: 'position_based', label: position },
    ]
}

// ============================================================
// 1163: Multi-Touch Attribution Calculator
// ============================================================
const multiTouchAttributionCalculatorTool: ToolDef = {
    id: '1163',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'conversion_value', default: 1000 }, { key: 'model', default: 'linear' }],
        functions: { result: { type: 'function', functionName: 'multiTouchAttributionCalculator', params: { conversion_value: 'conversion_value', model: 'model' } } },
        outputs: [{ key: 'touchpoint1', precision: 2 }, { key: 'touchpoint2', precision: 2 }, { key: 'touchpoint3', precision: 2 }, { key: 'touchpoint4', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'multi-touch-attribution-calculator', title: 'Multi-Touch Attribution Calculator', h1: 'Multi-Touch Attribution Calculator',
            meta_title: 'Multi-Touch Attribution Calculator | Split Conversion Credit Across Touchpoints',
            meta_description: 'Split a conversion\'s value across 4 touchpoints using first-touch, last-touch, linear, or position-based attribution models.',
            short_answer: 'This calculator splits a conversion\'s value across 4 touchpoints in the customer journey, using your chosen attribution model.',
            intro_text: '<p>Customers often interact with several marketing touchpoints (an ad, an email, a social post, a direct visit) before converting — this tool shows how much credit each of 4 touchpoints gets under different attribution models.</p>',
            key_points: [
                '<b>First Touch:</b> gives 100% of the credit to the very first touchpoint that introduced the customer.',
                '<b>Last Touch:</b> gives 100% of the credit to the final touchpoint right before conversion.',
                '<b>Linear:</b> splits credit equally (25% each) across all 4 touchpoints. <b>Position-Based (U-shaped):</b> gives 40% each to the first and last touchpoints, and 10% each to the two middle ones.',
            ],
            howto: [
                { question: 'Which attribution model should I use?', answer: '<p>There\'s no universally "correct" model — first/last touch are simplest but can overweight one channel, while linear and position-based try to more fairly credit the full journey. Many marketers compare multiple models rather than relying on just one.</p>' },
                { question: 'What if my customer journey has more or fewer than 4 touchpoints?', answer: '<p>This calculator assumes exactly 4 touchpoints for simplicity — real customer journeys can be shorter or longer, but the same model logic (first/last/linear/position-based) applies regardless of the exact count.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.en, type: 'select', options: attributionModelOptions('en'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Touchpoint 1 (First)', precision: 2 },
                { name: 'touchpoint2', label: 'Touchpoint 2', precision: 2 },
                { name: 'touchpoint3', label: 'Touchpoint 3', precision: 2 },
                { name: 'touchpoint4', label: 'Touchpoint 4 (Last)', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-multikanalnoj-atribucii', title: 'Калькулятор мультиканальной атрибуции', h1: 'Калькулятор мультиканальной атрибуции',
            meta_title: 'Калькулятор мультиканальной атрибуции | Распределение ценности конверсии',
            meta_description: 'Распределите ценность конверсии между 4 точками касания, используя модели атрибуции первого касания, последнего, линейную или позиционную.',
            short_answer: 'Этот калькулятор распределяет ценность конверсии между 4 точками касания пути клиента, используя выбранную вами модель атрибуции.',
            intro_text: '<p>Клиенты часто взаимодействуют с несколькими маркетинговыми точками касания перед конверсией — этот инструмент показывает, сколько ценности получает каждая из 4 точек касания по разным моделям.</p>',
            key_points: [
                '<b>Первое касание:</b> отдаёт 100% ценности самой первой точке касания.',
                '<b>Последнее касание:</b> отдаёт 100% ценности последней точке касания перед конверсией.',
                '<b>Линейная:</b> распределяет ценность поровну (по 25%) между всеми 4 точками. <b>По позиции (U-образная):</b> даёт по 40% первой и последней точкам, и по 10% двум средним.',
            ],
            howto: [
                { question: 'Какую модель атрибуции использовать?', answer: '<p>Универсально «правильной» модели нет — первое/последнее касание проще всего, но могут переоценивать один канал.</p>' },
                { question: 'Что если в пути моего клиента больше или меньше 4 точек касания?', answer: '<p>Этот калькулятор для простоты предполагает ровно 4 точки касания — реальные пути могут быть короче или длиннее.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.ru, type: 'select', options: attributionModelOptions('ru'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Точка касания 1 (первая)', precision: 2 },
                { name: 'touchpoint2', label: 'Точка касания 2', precision: 2 },
                { name: 'touchpoint3', label: 'Точка касания 3', precision: 2 },
                { name: 'touchpoint4', label: 'Точка касания 4 (последняя)', precision: 2 },
            ],
        },
        lv: {
            slug: 'daudzkanalu-atribucijas-kalkulators', title: 'Daudzkanālu Atribūcijas Kalkulators', h1: 'Daudzkanālu Atribūcijas Kalkulators',
            meta_title: 'Daudzkanālu Atribūcijas Kalkulators | Konversijas Vērtības Sadale',
            meta_description: 'Sadaliet konversijas vērtību starp 4 kontaktpunktiem, izmantojot pirmā/pēdējā kontakta, lineāro vai pozīcijas atribūcijas modeļus.',
            short_answer: 'Šis kalkulators sadala konversijas vērtību starp 4 klienta ceļa kontaktpunktiem, izmantojot jūsu izvēlēto atribūcijas modeli.',
            intro_text: '<p>Klienti bieži mijiedarbojas ar vairākiem mārketinga kontaktpunktiem pirms konversijas — šis rīks parāda, cik daudz vērtības saņem katrs no 4 kontaktpunktiem dažādos modeļos.</p>',
            key_points: [
                '<b>Pirmais Kontakts:</b> piešķir 100% vērtības pirmajam kontaktpunktam.',
                '<b>Pēdējais Kontakts:</b> piešķir 100% vērtības pēdējam kontaktpunktam pirms konversijas.',
                '<b>Lineārais:</b> sadala vērtību vienādi (pa 25%) starp visiem 4 kontaktpunktiem. <b>Pozīcijas (U-veida):</b> dod pa 40% pirmajam un pēdējam, un pa 10% diviem vidējiem.',
            ],
            howto: [
                { question: 'Kuru atribūcijas modeli man izmantot?', answer: '<p>Nav universāli "pareiza" modeļa — pirmā/pēdējā kontakta modeļi ir vienkāršākie, bet var pārvērtēt vienu kanālu.</p>' },
                { question: 'Ko darīt, ja manam klienta ceļam ir vairāk vai mazāk par 4 kontaktpunktiem?', answer: '<p>Šis kalkulators vienkāršības labad pieņem tieši 4 kontaktpunktus — reāli ceļi var būt īsāki vai garāki.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.lv, type: 'select', options: attributionModelOptions('lv'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Kontaktpunkts 1 (pirmais)', precision: 2 },
                { name: 'touchpoint2', label: 'Kontaktpunkts 2', precision: 2 },
                { name: 'touchpoint3', label: 'Kontaktpunkts 3', precision: 2 },
                { name: 'touchpoint4', label: 'Kontaktpunkts 4 (pēdējais)', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-atrybucji-wielokanalowej', title: 'Kalkulator Atrybucji Wielokanałowej', h1: 'Kalkulator Atrybucji Wielokanałowej',
            meta_title: 'Kalkulator Atrybucji Wielokanałowej | Podział Wartości Konwersji',
            meta_description: 'Podziel wartość konwersji między 4 punkty styku, korzystając z modeli atrybucji pierwszego/ostatniego kontaktu, liniowego lub pozycyjnego.',
            short_answer: 'Ten kalkulator dzieli wartość konwersji między 4 punkty styku w podróży klienta, korzystając z wybranego modelu atrybucji.',
            intro_text: '<p>Klienci często wchodzą w interakcję z kilkoma punktami styku marketingowego przed konwersją — to narzędzie pokazuje, ile wartości otrzymuje każdy z 4 punktów styku w różnych modelach.</p>',
            key_points: [
                '<b>Pierwszy Kontakt:</b> przypisuje 100% wartości pierwszemu punktowi styku.',
                '<b>Ostatni Kontakt:</b> przypisuje 100% wartości ostatniemu punktowi styku przed konwersją.',
                '<b>Liniowy:</b> dzieli wartość równo (po 25%) między wszystkie 4 punkty. <b>Oparty na Pozycji (Kształt U):</b> daje po 40% pierwszemu i ostatniemu, i po 10% dwóm środkowym.',
            ],
            howto: [
                { question: 'Którego modelu atrybucji powinienem użyć?', answer: '<p>Nie ma uniwersalnie "poprawnego" modelu — pierwszy/ostatni kontakt są najprostsze, ale mogą przeceniać jeden kanał.</p>' },
                { question: 'Co jeśli moja podróż klienta ma więcej lub mniej niż 4 punkty styku?', answer: '<p>Ten kalkulator dla uproszczenia zakłada dokładnie 4 punkty styku — rzeczywiste podróże mogą być krótsze lub dłuższe.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.pl, type: 'select', options: attributionModelOptions('pl'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Punkt Styku 1 (pierwszy)', precision: 2 },
                { name: 'touchpoint2', label: 'Punkt Styku 2', precision: 2 },
                { name: 'touchpoint3', label: 'Punkt Styku 3', precision: 2 },
                { name: 'touchpoint4', label: 'Punkt Styku 4 (ostatni)', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-atribucion-multitoque', title: 'Calculadora de Atribución Multitoque', h1: 'Calculadora de Atribución Multitoque',
            meta_title: 'Calculadora de Atribución Multitoque | Reparte el Crédito de Conversión',
            meta_description: 'Reparte el valor de una conversión entre 4 puntos de contacto usando modelos de atribución de primer toque, último toque, lineal o basado en posición.',
            short_answer: 'Esta calculadora reparte el valor de una conversión entre 4 puntos de contacto del recorrido del cliente, usando el modelo de atribución elegido.',
            intro_text: '<p>Los clientes suelen interactuar con varios puntos de contacto de marketing antes de convertir — esta herramienta muestra cuánto crédito recibe cada uno de los 4 puntos de contacto según distintos modelos.</p>',
            key_points: [
                '<b>Primer Contacto:</b> otorga el 100% del crédito al primer punto de contacto.',
                '<b>Último Contacto:</b> otorga el 100% del crédito al último punto de contacto antes de convertir.',
                '<b>Lineal:</b> reparte el crédito equitativamente (25% cada uno) entre los 4 puntos. <b>Basado en Posición (Forma de U):</b> da 40% al primero y al último, y 10% a cada uno de los dos intermedios.',
            ],
            howto: [
                { question: '¿Qué modelo de atribución debería usar?', answer: '<p>No hay un modelo universalmente "correcto" — primer/último toque son los más simples pero pueden sobrevalorar un canal.</p>' },
                { question: '¿Qué pasa si mi recorrido de cliente tiene más o menos de 4 puntos de contacto?', answer: '<p>Esta calculadora asume exactamente 4 puntos de contacto por simplicidad — los recorridos reales pueden ser más cortos o largos.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.es, type: 'select', options: attributionModelOptions('es'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Punto de Contacto 1 (primero)', precision: 2 },
                { name: 'touchpoint2', label: 'Punto de Contacto 2', precision: 2 },
                { name: 'touchpoint3', label: 'Punto de Contacto 3', precision: 2 },
                { name: 'touchpoint4', label: 'Punto de Contacto 4 (último)', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-dattribution-multi-touch', title: 'Calculateur d’Attribution Multi-Touch', h1: 'Calculateur d’Attribution Multi-Touch',
            meta_title: 'Calculateur d’Attribution Multi-Touch | Répartir le Crédit de Conversion',
            meta_description: 'Répartissez la valeur d’une conversion entre 4 points de contact selon des modèles d’attribution premier/dernier contact, linéaire ou basé sur la position.',
            short_answer: 'Ce calculateur répartit la valeur d’une conversion entre 4 points de contact du parcours client, selon le modèle d’attribution choisi.',
            intro_text: '<p>Les clients interagissent souvent avec plusieurs points de contact marketing avant de convertir — cet outil montre combien de crédit reçoit chacun des 4 points de contact selon différents modèles.</p>',
            key_points: [
                '<b>Premier Contact :</b> attribue 100% du crédit au tout premier point de contact.',
                '<b>Dernier Contact :</b> attribue 100% du crédit au dernier point de contact avant conversion.',
                '<b>Linéaire :</b> répartit le crédit équitablement (25% chacun) entre les 4 points. <b>Basé sur la Position (Forme en U) :</b> donne 40% chacun au premier et dernier, et 10% chacun aux deux intermédiaires.',
            ],
            howto: [
                { question: 'Quel modèle d’attribution devrais-je utiliser ?', answer: '<p>Il n’existe pas de modèle universellement "correct" — premier/dernier contact sont les plus simples mais peuvent surpondérer un canal.</p>' },
                { question: 'Et si le parcours de mon client a plus ou moins de 4 points de contact ?', answer: '<p>Ce calculateur suppose exactement 4 points de contact par simplicité — les parcours réels peuvent être plus courts ou plus longs.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.fr, type: 'select', options: attributionModelOptions('fr'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Point de Contact 1 (premier)', precision: 2 },
                { name: 'touchpoint2', label: 'Point de Contact 2', precision: 2 },
                { name: 'touchpoint3', label: 'Point de Contact 3', precision: 2 },
                { name: 'touchpoint4', label: 'Point de Contact 4 (dernier)', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-attribuzione-multi-touch', title: 'Calcolatore di Attribuzione Multi-Touch', h1: 'Calcolatore di Attribuzione Multi-Touch',
            meta_title: 'Calcolatore di Attribuzione Multi-Touch | Distribuisci il Credito di Conversione',
            meta_description: 'Distribuisci il valore di una conversione tra 4 punti di contatto usando modelli di attribuzione primo/ultimo tocco, lineare o basato sulla posizione.',
            short_answer: 'Questo calcolatore distribuisce il valore di una conversione tra 4 punti di contatto nel percorso del cliente, usando il modello di attribuzione scelto.',
            intro_text: '<p>I clienti spesso interagiscono con diversi punti di contatto di marketing prima di convertire — questo strumento mostra quanto credito riceve ciascuno dei 4 punti di contatto secondo diversi modelli.</p>',
            key_points: [
                '<b>Primo Contatto:</b> assegna il 100% del credito al primissimo punto di contatto.',
                '<b>Ultimo Contatto:</b> assegna il 100% del credito all\'ultimo punto di contatto prima della conversione.',
                '<b>Lineare:</b> distribuisce il credito equamente (25% ciascuno) tra i 4 punti. <b>Basato sulla Posizione (Forma a U):</b> dà il 40% ciascuno al primo e all\'ultimo, e il 10% ciascuno ai due centrali.',
            ],
            howto: [
                { question: 'Quale modello di attribuzione dovrei usare?', answer: '<p>Non esiste un modello universalmente "corretto" — primo/ultimo tocco sono i più semplici ma possono sovrappesare un canale.</p>' },
                { question: 'Cosa succede se il mio percorso cliente ha più o meno di 4 punti di contatto?', answer: '<p>Questo calcolatore presume esattamente 4 punti di contatto per semplicità — i percorsi reali possono essere più corti o più lunghi.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.it, type: 'select', options: attributionModelOptions('it'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Punto di Contatto 1 (primo)', precision: 2 },
                { name: 'touchpoint2', label: 'Punto di Contatto 2', precision: 2 },
                { name: 'touchpoint3', label: 'Punto di Contatto 3', precision: 2 },
                { name: 'touchpoint4', label: 'Punto di Contatto 4 (ultimo)', precision: 2 },
            ],
        },
        de: {
            slug: 'multi-touch-attributions-rechner', title: 'Multi-Touch-Attributions-Rechner', h1: 'Multi-Touch-Attributions-Rechner',
            meta_title: 'Multi-Touch-Attributions-Rechner | Conversion-Guthaben Aufteilen',
            meta_description: 'Teilen Sie den Wert einer Conversion auf 4 Touchpoints auf, mit Erster-Kontakt-, Letzter-Kontakt-, linearen oder positionsbasierten Attributionsmodellen.',
            short_answer: 'Dieser Rechner teilt den Wert einer Conversion auf 4 Touchpoints in der Customer Journey auf, nach Ihrem gewählten Attributionsmodell.',
            intro_text: '<p>Kunden interagieren oft mit mehreren Marketing-Touchpoints (einer Anzeige, einer E-Mail, einem Social-Media-Post, einem Direktbesuch) bevor sie konvertieren — dieses Tool zeigt, wie viel Guthaben jeder der 4 Touchpoints unter verschiedenen Attributionsmodellen erhält.</p>',
            key_points: [
                '<b>Erster Kontakt:</b> gibt 100% des Guthabens dem allerersten Touchpoint.',
                '<b>Letzter Kontakt:</b> gibt 100% des Guthabens dem letzten Touchpoint vor der Conversion.',
                '<b>Linear:</b> teilt das Guthaben gleichmäßig (je 25%) auf alle 4 Touchpoints auf. <b>Positionsbasiert (U-Form):</b> gibt je 40% dem ersten und letzten Touchpoint, und je 10% den beiden mittleren.',
            ],
            howto: [
                { question: 'Welches Attributionsmodell sollte ich verwenden?', answer: '<p>Es gibt kein universell "richtiges" Modell — erster/letzter Kontakt sind am einfachsten, können aber einen Kanal überbewerten.</p>' },
                { question: 'Was, wenn meine Customer Journey mehr oder weniger als 4 Touchpoints hat?', answer: '<p>Dieser Rechner geht der Einfachheit halber von genau 4 Touchpoints aus — reale Journeys können kürzer oder länger sein.</p>' },
            ],
            inputs: [
                { name: 'conversion_value', label: CONVERSION_VALUE_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '1000' },
                { name: 'model', label: ATTR_MODEL_LABEL.de, type: 'select', options: attributionModelOptions('de'), default: 'linear' },
            ],
            outputs: [
                { name: 'touchpoint1', label: 'Touchpoint 1 (Erster)', precision: 2 },
                { name: 'touchpoint2', label: 'Touchpoint 2', precision: 2 },
                { name: 'touchpoint3', label: 'Touchpoint 3', precision: 2 },
                { name: 'touchpoint4', label: 'Touchpoint 4 (Letzter)', precision: 2 },
            ],
        },
    },
}

const LTV_LABEL: Record<string, string> = { en: 'Customer Lifetime Value (LTV)', ru: 'Пожизненная ценность клиента (LTV)', de: 'Customer Lifetime Value (LTV)', es: 'Valor de Vida del Cliente (LTV)', fr: 'Valeur Vie Client (LTV)', it: 'Valore del Ciclo di Vita del Cliente (LTV)', pl: 'Wartość Życiowa Klienta (LTV)', lv: 'Klienta Dzīves Vērtība (LTV)' }
const CAC_LABEL: Record<string, string> = { en: 'Customer Acquisition Cost (CAC)', ru: 'Стоимость привлечения клиента (CAC)', de: 'Kundenakquisitionskosten (CAC)', es: 'Costo de Adquisición de Clientes (CAC)', fr: 'Coût d’Acquisition Client (CAC)', it: 'Costo di Acquisizione del Cliente (CAC)', pl: 'Koszt Pozyskania Klienta (CAC)', lv: 'Klienta Iegūšanas Izmaksas (CAC)' }
const RATIO_LABEL: Record<string, string> = { en: 'LTV:CAC Ratio', ru: 'Соотношение LTV:CAC', de: 'LTV:CAC-Verhältnis', es: 'Ratio LTV:CAC', fr: 'Ratio LTV:CAC', it: 'Rapporto LTV:CAC', pl: 'Wskaźnik LTV:CAC', lv: 'LTV:CAC Attiecība' }
const ASSESSMENT_LABEL: Record<string, string> = { en: 'Assessment', ru: 'Оценка', de: 'Einschätzung', es: 'Evaluación', fr: 'Évaluation', it: 'Valutazione', pl: 'Ocena', lv: 'Novērtējums' }

// ============================================================
// 1164: LTV:CAC Ratio Calculator
// ============================================================
const ltvCacRatioCalculatorTool: ToolDef = {
    id: '1164',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'ltv', default: 900 }, { key: 'cac', default: 300 }],
        functions: { result: { type: 'function', functionName: 'ltvCacRatioCalculator', params: { ltv: 'ltv', cac: 'cac' } } },
        outputs: [{ key: 'ratio', precision: 2 }, { key: 'assessment' }],
    },
    locales: {
        en: {
            slug: 'ltv-cac-ratio-calculator', title: 'LTV:CAC Ratio Calculator', h1: 'LTV:CAC Ratio Calculator',
            meta_title: 'LTV:CAC Ratio Calculator | Customer Value vs. Acquisition Cost Benchmark',
            meta_description: 'Calculate your LTV:CAC ratio to see whether your customer economics are healthy, weak, or unprofitable.',
            short_answer: 'This calculator finds your LTV:CAC ratio, e.g. $900 lifetime value ÷ $300 acquisition cost = a 3:1 ratio, generally considered healthy.',
            intro_text: '<p>The LTV:CAC ratio compares how much a customer is worth over their lifetime against how much it costs to acquire them — enter both figures (each has its own dedicated calculator elsewhere on this site if you need to compute them first) to get the combined benchmark marketers actually use to judge unit economics.</p>',
            key_points: [
                '<b>Formula:</b> LTV:CAC Ratio = Customer Lifetime Value ÷ Customer Acquisition Cost.',
                '<b>Commonly cited benchmark:</b> a ratio of 3:1 to 5:1 is often considered healthy — below 1:1 means you\'re losing money on every customer, and above 5:1 may suggest you could profitably invest more in growth.',
                '<b>Context matters:</b> the "right" ratio varies by business model, growth stage, and how long it takes to recover the acquisition cost — a fast-growing startup may intentionally accept a lower ratio to capture market share.',
            ],
            howto: [
                { question: 'What if I don\'t know my LTV or CAC yet?', answer: '<p>Use the dedicated Customer Lifetime Value (CLV) Calculator and Customer Acquisition Cost (CAC) Calculator elsewhere on this site to compute each figure first, then enter both here.</p>' },
                { question: 'Why is 3:1 considered a common benchmark?', answer: '<p>It leaves enough margin above the break-even point (1:1) to cover other operating costs beyond acquisition and still turn a healthy profit per customer.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.en, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.en, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.en }],
        },
        ru: {
            slug: 'kalkulyator-sootnosheniya-ltv-cac', title: 'Калькулятор соотношения LTV:CAC', h1: 'Калькулятор соотношения LTV:CAC',
            meta_title: 'Калькулятор LTV:CAC | Ценность клиента против стоимости привлечения',
            meta_description: 'Рассчитайте соотношение LTV:CAC, чтобы увидеть, здорова ли экономика ваших клиентов, слаба или убыточна.',
            short_answer: 'Этот калькулятор находит соотношение LTV:CAC, например 900$ пожизненной ценности ÷ 300$ стоимости привлечения = соотношение 3:1, обычно считающееся здоровым.',
            intro_text: '<p>Соотношение LTV:CAC сравнивает, сколько стоит клиент за всё время сотрудничества, с тем, сколько стоит его привлечь.</p>',
            key_points: [
                '<b>Формула:</b> Соотношение LTV:CAC = Пожизненная ценность клиента ÷ Стоимость привлечения клиента.',
                '<b>Часто упоминаемый ориентир:</b> соотношение от 3:1 до 5:1 обычно считается здоровым — ниже 1:1 означает убыток на каждом клиенте.',
                '<b>Контекст важен:</b> «правильное» соотношение зависит от бизнес-модели, стадии роста и того, как быстро окупаются затраты на привлечение.',
            ],
            howto: [
                { question: 'Что если я ещё не знаю свой LTV или CAC?', answer: '<p>Используйте отдельные калькуляторы LTV и CAC на этом сайте, чтобы сначала рассчитать каждый показатель, затем введите оба здесь.</p>' },
                { question: 'Почему 3:1 считается распространённым ориентиром?', answer: '<p>Это оставляет достаточный запас сверх точки безубыточности (1:1), чтобы покрыть другие операционные расходы и всё ещё получить здоровую прибыль на клиента.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.ru, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.ru, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.ru }],
        },
        lv: {
            slug: 'ltv-cac-attiecibas-kalkulators', title: 'LTV:CAC Attiecības Kalkulators', h1: 'LTV:CAC Attiecības Kalkulators',
            meta_title: 'LTV:CAC Kalkulators | Klienta Vērtība pret Piesaistes Izmaksām',
            meta_description: 'Aprēķiniet LTV:CAC attiecību, lai redzētu, vai jūsu klientu ekonomika ir veselīga, vāja vai nerentabla.',
            short_answer: 'Šis kalkulators atrod jūsu LTV:CAC attiecību, piemēram, 900$ dzīves vērtība ÷ 300$ piesaistes izmaksas = 3:1 attiecība, parasti uzskatīta par veselīgu.',
            intro_text: '<p>LTV:CAC attiecība salīdzina, cik klients ir vērts visa sadarbības laika garumā, ar to, cik maksā viņu piesaistīt.</p>',
            key_points: [
                '<b>Formula:</b> LTV:CAC Attiecība = Klienta Dzīves Vērtība ÷ Klienta Piesaistes Izmaksas.',
                '<b>Bieži minēts etalons:</b> attiecība no 3:1 līdz 5:1 bieži tiek uzskatīta par veselīgu — zem 1:1 nozīmē zaudējumus katram klientam.',
                '<b>Konteksts ir svarīgs:</b> "pareizā" attiecība atšķiras atkarībā no biznesa modeļa un izaugsmes stadijas.',
            ],
            howto: [
                { question: 'Ko darīt, ja vēl nezinu savu LTV vai CAC?', answer: '<p>Izmantojiet atsevišķos LTV un CAC kalkulatorus šajā vietnē, lai vispirms aprēķinātu katru rādītāju.</p>' },
                { question: 'Kāpēc 3:1 tiek uzskatīts par izplatītu etalonu?', answer: '<p>Tas atstāj pietiekamu rezervi virs līdzsvara punkta (1:1), lai segtu citas darbības izmaksas un joprojām gūtu veselīgu peļņu par klientu.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.lv, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.lv, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.lv }],
        },
        pl: {
            slug: 'kalkulator-wskaznika-ltv-cac', title: 'Kalkulator Wskaźnika LTV:CAC', h1: 'Kalkulator Wskaźnika LTV:CAC',
            meta_title: 'Kalkulator LTV:CAC | Wartość Klienta a Koszt Pozyskania',
            meta_description: 'Oblicz wskaźnik LTV:CAC, aby zobaczyć, czy ekonomia Twoich klientów jest zdrowa, słaba czy nierentowna.',
            short_answer: 'Ten kalkulator znajduje Twój wskaźnik LTV:CAC, np. 900$ wartości życiowej ÷ 300$ kosztu pozyskania = wskaźnik 3:1, zwykle uważany za zdrowy.',
            intro_text: '<p>Wskaźnik LTV:CAC porównuje, ile klient jest wart w całym okresie współpracy, z tym, ile kosztuje jego pozyskanie.</p>',
            key_points: [
                '<b>Wzór:</b> Wskaźnik LTV:CAC = Wartość Życiowa Klienta ÷ Koszt Pozyskania Klienta.',
                '<b>Często cytowany punkt odniesienia:</b> wskaźnik od 3:1 do 5:1 jest często uważany za zdrowy — poniżej 1:1 oznacza stratę na każdym kliencie.',
                '<b>Kontekst ma znaczenie:</b> "właściwy" wskaźnik zależy od modelu biznesowego i etapu wzrostu.',
            ],
            howto: [
                { question: 'Co jeśli jeszcze nie znam mojego LTV lub CAC?', answer: '<p>Użyj osobnych kalkulatorów LTV i CAC na tej stronie, aby najpierw obliczyć każdą wartość.</p>' },
                { question: 'Dlaczego 3:1 jest uważane za typowy punkt odniesienia?', answer: '<p>Pozostawia to wystarczający margines powyżej progu rentowności (1:1), aby pokryć inne koszty operacyjne i nadal osiągnąć zdrowy zysk na klienta.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.pl, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.pl, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.pl }],
        },
        es: {
            slug: 'calculadora-de-ratio-ltv-cac', title: 'Calculadora de Ratio LTV:CAC', h1: 'Calculadora de Ratio LTV:CAC',
            meta_title: 'Calculadora LTV:CAC | Valor del Cliente vs. Costo de Adquisición',
            meta_description: 'Calcula tu ratio LTV:CAC para ver si la economía de tus clientes es saludable, débil o no rentable.',
            short_answer: 'Esta calculadora encuentra tu ratio LTV:CAC, p. ej. $900 de valor de vida ÷ $300 de costo de adquisición = un ratio de 3:1, generalmente considerado saludable.',
            intro_text: '<p>El ratio LTV:CAC compara cuánto vale un cliente durante su vida útil frente a cuánto cuesta adquirirlo.</p>',
            key_points: [
                '<b>Fórmula:</b> Ratio LTV:CAC = Valor de Vida del Cliente ÷ Costo de Adquisición de Clientes.',
                '<b>Referencia comúnmente citada:</b> un ratio de 3:1 a 5:1 suele considerarse saludable — por debajo de 1:1 significa pérdidas en cada cliente.',
                '<b>El contexto importa:</b> el ratio "correcto" varía según el modelo de negocio y la etapa de crecimiento.',
            ],
            howto: [
                { question: '¿Qué pasa si aún no conozco mi LTV o CAC?', answer: '<p>Usa las calculadoras dedicadas de LTV y CAC en este sitio para calcular primero cada cifra.</p>' },
                { question: '¿Por qué se considera 3:1 una referencia común?', answer: '<p>Deja suficiente margen por encima del punto de equilibrio (1:1) para cubrir otros costos operativos y aun así obtener una ganancia saludable por cliente.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.es, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.es, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.es }],
        },
        fr: {
            slug: 'calculateur-de-ratio-ltv-cac', title: 'Calculateur de Ratio LTV:CAC', h1: 'Calculateur de Ratio LTV:CAC',
            meta_title: 'Calculateur LTV:CAC | Valeur Client vs. Coût d’Acquisition',
            meta_description: 'Calculez votre ratio LTV:CAC pour voir si l’économie de vos clients est saine, faible ou non rentable.',
            short_answer: 'Ce calculateur trouve votre ratio LTV:CAC, ex. 900 $ de valeur vie ÷ 300 $ de coût d’acquisition = un ratio de 3:1, généralement considéré comme sain.',
            intro_text: '<p>Le ratio LTV:CAC compare combien vaut un client sur toute sa durée de vie par rapport à combien il coûte à acquérir.</p>',
            key_points: [
                '<b>Formule :</b> Ratio LTV:CAC = Valeur Vie Client ÷ Coût d’Acquisition Client.',
                '<b>Référence couramment citée :</b> un ratio de 3:1 à 5:1 est souvent considéré comme sain — en dessous de 1:1 signifie une perte sur chaque client.',
                '<b>Le contexte compte :</b> le ratio "correct" varie selon le modèle économique et le stade de croissance.',
            ],
            howto: [
                { question: 'Et si je ne connais pas encore mon LTV ou CAC ?', answer: '<p>Utilisez les calculateurs dédiés LTV et CAC sur ce site pour calculer d’abord chaque chiffre.</p>' },
                { question: 'Pourquoi 3:1 est-il considéré comme une référence courante ?', answer: '<p>Cela laisse une marge suffisante au-dessus du seuil de rentabilité (1:1) pour couvrir d’autres coûts opérationnels et réaliser un profit sain par client.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.fr, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.fr, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.fr }],
        },
        it: {
            slug: 'calcolatore-di-rapporto-ltv-cac', title: 'Calcolatore di Rapporto LTV:CAC', h1: 'Calcolatore di Rapporto LTV:CAC',
            meta_title: 'Calcolatore LTV:CAC | Valore Cliente vs. Costo di Acquisizione',
            meta_description: 'Calcola il tuo rapporto LTV:CAC per vedere se l\'economia dei tuoi clienti è sana, debole o non redditizia.',
            short_answer: 'Questo calcolatore trova il tuo rapporto LTV:CAC, es. $900 di valore vita ÷ $300 di costo di acquisizione = un rapporto di 3:1, generalmente considerato sano.',
            intro_text: '<p>Il rapporto LTV:CAC confronta quanto vale un cliente durante la sua vita rispetto a quanto costa acquisirlo.</p>',
            key_points: [
                '<b>Formula:</b> Rapporto LTV:CAC = Valore del Ciclo di Vita del Cliente ÷ Costo di Acquisizione del Cliente.',
                '<b>Benchmark comunemente citato:</b> un rapporto da 3:1 a 5:1 è spesso considerato sano — sotto 1:1 significa perdite su ogni cliente.',
                '<b>Il contesto conta:</b> il rapporto "giusto" varia in base al modello di business e allo stadio di crescita.',
            ],
            howto: [
                { question: 'Cosa succede se non conosco ancora il mio LTV o CAC?', answer: '<p>Usa i calcolatori dedicati LTV e CAC su questo sito per calcolare prima ciascun valore.</p>' },
                { question: 'Perché 3:1 è considerato un benchmark comune?', answer: '<p>Lascia un margine sufficiente sopra il punto di pareggio (1:1) per coprire altri costi operativi e ottenere comunque un profitto sano per cliente.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.it, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.it, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.it }],
        },
        de: {
            slug: 'ltv-cac-verhaeltnis-rechner', title: 'LTV:CAC-Verhältnis-Rechner', h1: 'LTV:CAC-Verhältnis-Rechner',
            meta_title: 'LTV:CAC-Rechner | Kundenwert vs. Akquisitionskosten',
            meta_description: 'Berechnen Sie Ihr LTV:CAC-Verhältnis, um zu sehen, ob Ihre Kundenökonomie gesund, schwach oder unrentabel ist.',
            short_answer: 'Dieser Rechner findet Ihr LTV:CAC-Verhältnis, z.B. 900 $ Lifetime Value ÷ 300 $ Akquisitionskosten = ein Verhältnis von 3:1, allgemein als gesund betrachtet.',
            intro_text: '<p>Das LTV:CAC-Verhältnis vergleicht, wie viel ein Kunde über seine gesamte Lebensdauer wert ist, mit den Kosten für seine Akquisition.</p>',
            key_points: [
                '<b>Formel:</b> LTV:CAC-Verhältnis = Customer Lifetime Value ÷ Kundenakquisitionskosten.',
                '<b>Häufig genannter Richtwert:</b> ein Verhältnis von 3:1 bis 5:1 gilt oft als gesund — unter 1:1 bedeutet Verlust bei jedem Kunden.',
                '<b>Kontext ist wichtig:</b> das "richtige" Verhältnis variiert je nach Geschäftsmodell und Wachstumsphase.',
            ],
            howto: [
                { question: 'Was, wenn ich meinen LTV oder CAC noch nicht kenne?', answer: '<p>Verwenden Sie die speziellen LTV- und CAC-Rechner auf dieser Website, um zuerst jeden Wert zu berechnen.</p>' },
                { question: 'Warum gilt 3:1 als häufiger Richtwert?', answer: '<p>Dies lässt genug Spielraum über dem Break-even-Punkt (1:1), um andere Betriebskosten zu decken und trotzdem einen gesunden Gewinn pro Kunde zu erzielen.</p>' },
            ],
            inputs: [
                { name: 'ltv', label: LTV_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '900' },
                { name: 'cac', label: CAC_LABEL.de, type: 'number', min: 0.01, max: 1000000000, placeholder: '300' },
            ],
            outputs: [{ name: 'ratio', label: RATIO_LABEL.de, precision: 2 }, { name: 'assessment', label: ASSESSMENT_LABEL.de }],
        },
    },
}

const CUSTOMERS_START_LABEL: Record<string, string> = { en: 'Customers at Start of Period', ru: 'Клиенты на начало периода', de: 'Kunden zu Periodenbeginn', es: 'Clientes al Inicio del Período', fr: 'Clients en Début de Période', it: 'Clienti a Inizio Periodo', pl: 'Klienci na Początku Okresu', lv: 'Klienti Perioda Sākumā' }
const CUSTOMERS_LOST_LABEL: Record<string, string> = { en: 'Customers Lost', ru: 'Потерянные клиенты', de: 'Verlorene Kunden', es: 'Clientes Perdidos', fr: 'Clients Perdus', it: 'Clienti Persi', pl: 'Utraceni Klienci', lv: 'Zaudētie Klienti' }
const CHURN_RATE_LABEL: Record<string, string> = { en: 'Churn Rate (%)', ru: 'Показатель оттока (%)', de: 'Abwanderungsrate (%)', es: 'Tasa de Cancelación (%)', fr: 'Taux d’Attrition (%)', it: 'Tasso di Abbandono (%)', pl: 'Wskaźnik Rezygnacji (%)', lv: 'Aizplūšanas Līmenis (%)' }
const RETENTION_RATE_LABEL: Record<string, string> = { en: 'Retention Rate (%)', ru: 'Показатель удержания (%)', de: 'Bindungsrate (%)', es: 'Tasa de Retención (%)', fr: 'Taux de Rétention (%)', it: 'Tasso di Fidelizzazione (%)', pl: 'Wskaźnik Retencji (%)', lv: 'Noturēšanas Līmenis (%)' }

// ============================================================
// 1165: Customer Churn Rate Calculator
// ============================================================
const churnRateCalculatorTool: ToolDef = {
    id: '1165',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'customers_start', default: 1000 }, { key: 'customers_lost', default: 50 }],
        functions: { result: { type: 'function', functionName: 'churnRateCalculator', params: { customers_start: 'customers_start', customers_lost: 'customers_lost' } } },
        outputs: [{ key: 'churn_rate', precision: 2 }, { key: 'retention_rate', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'customer-churn-rate-calculator', title: 'Customer Churn Rate Calculator', h1: 'Customer Churn Rate Calculator',
            meta_title: 'Customer Churn Rate Calculator | Churn and Retention Rate',
            meta_description: 'Calculate customer churn rate and retention rate instantly from starting customers and customers lost.',
            short_answer: 'This calculator finds your churn rate, e.g. losing 50 of 1,000 starting customers = a 5% churn rate (95% retention).',
            intro_text: '<p>Churn rate measures the percentage of customers you lose over a given period — enter how many customers you started with and how many you lost to see both churn and retention rates.</p>',
            key_points: [
                '<b>Formula:</b> Churn Rate = (Customers Lost ÷ Customers at Start) × 100; Retention Rate = 100% − Churn Rate.',
                '<b>Example:</b> losing 50 of 1,000 customers = (50 ÷ 1,000) × 100 = 5% churn, 95% retention.',
                '<b>Why it matters:</b> even small reductions in churn compound significantly over time, since retained customers keep generating revenue without additional acquisition cost.',
            ],
            howto: [
                { question: 'What time period should I use?', answer: '<p>Whatever period matches your business cycle — commonly monthly or annually. Be consistent so you can compare churn over time.</p>' },
                { question: 'What\'s considered a "good" churn rate?', answer: '<p>It varies hugely by industry — subscription software often targets under 5-7% annual churn, while some consumer subscriptions see much higher rates and still remain profitable.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.en, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.en, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-ottoka-klientov', title: 'Калькулятор оттока клиентов', h1: 'Калькулятор оттока клиентов',
            meta_title: 'Калькулятор оттока клиентов | Показатели оттока и удержания',
            meta_description: 'Рассчитайте показатель оттока и удержания клиентов мгновенно по начальному числу клиентов и потерянным клиентам.',
            short_answer: 'Этот калькулятор находит показатель оттока, например потеря 50 из 1000 клиентов = отток 5% (удержание 95%).',
            intro_text: '<p>Показатель оттока измеряет процент клиентов, которых вы теряете за период — введите начальное число клиентов и потерянных, чтобы увидеть оба показателя.</p>',
            key_points: [
                '<b>Формула:</b> Отток = (Потерянные клиенты ÷ Клиенты на начало) × 100; Удержание = 100% − Отток.',
                '<b>Пример:</b> потеря 50 из 1000 клиентов = (50 ÷ 1000) × 100 = 5% оттока, 95% удержания.',
                '<b>Почему это важно:</b> даже небольшие сокращения оттока значительно накапливаются со временем.',
            ],
            howto: [
                { question: 'Какой период времени использовать?', answer: '<p>Тот, что соответствует циклу вашего бизнеса — обычно месяц или год.</p>' },
                { question: 'Что считается «хорошим» показателем оттока?', answer: '<p>Сильно зависит от отрасли — подписочное ПО обычно нацелено на менее 5-7% годового оттока.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.ru, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.ru, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'klientu-aizplusanas-kalkulators', title: 'Klientu Aizplūšanas Kalkulators', h1: 'Klientu Aizplūšanas Kalkulators',
            meta_title: 'Klientu Aizplūšanas Kalkulators | Aizplūšanas un Noturēšanas Līmenis',
            meta_description: 'Aprēķiniet klientu aizplūšanas un noturēšanas līmeni acumirklī no sākuma klientu skaita un zaudētajiem klientiem.',
            short_answer: 'Šis kalkulators atrod jūsu aizplūšanas līmeni, piemēram, zaudējot 50 no 1000 sākotnējiem klientiem = 5% aizplūšana (95% noturēšana).',
            intro_text: '<p>Aizplūšanas līmenis mēra klientu procentu, ko zaudējat noteiktā periodā — ievadiet, ar cik klientiem sākāt un cik zaudējāt, lai redzētu abus rādītājus.</p>',
            key_points: [
                '<b>Formula:</b> Aizplūšanas Līmenis = (Zaudētie Klienti ÷ Klienti Sākumā) × 100; Noturēšanas Līmenis = 100% − Aizplūšana.',
                '<b>Piemērs:</b> zaudējot 50 no 1000 klientiem = (50 ÷ 1000) × 100 = 5% aizplūšana, 95% noturēšana.',
                '<b>Kāpēc tas ir svarīgi:</b> pat nelieli aizplūšanas samazinājumi laika gaitā ievērojami uzkrājas.',
            ],
            howto: [
                { question: 'Kādu laika periodu izmantot?', answer: '<p>To, kas atbilst jūsu biznesa ciklam — parasti mēnesi vai gadu.</p>' },
                { question: 'Kas tiek uzskatīts par "labu" aizplūšanas līmeni?', answer: '<p>Ļoti atšķiras atkarībā no nozares — abonēšanas programmatūra bieži tiecas uz mazāk nekā 5-7% gada aizplūšanu.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.lv, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.lv, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-wskaznika-rezygnacji-klientow', title: 'Kalkulator Wskaźnika Rezygnacji Klientów', h1: 'Kalkulator Wskaźnika Rezygnacji Klientów',
            meta_title: 'Kalkulator Rezygnacji Klientów | Wskaźnik Rezygnacji i Retencji',
            meta_description: 'Oblicz wskaźnik rezygnacji i retencji klientów natychmiast na podstawie liczby klientów początkowych i utraconych.',
            short_answer: 'Ten kalkulator znajduje Twój wskaźnik rezygnacji, np. utrata 50 z 1000 początkowych klientów = 5% rezygnacji (95% retencji).',
            intro_text: '<p>Wskaźnik rezygnacji mierzy procent klientów, których tracisz w danym okresie — wpisz, ilu klientów miałeś na początku i ilu straciłeś.</p>',
            key_points: [
                '<b>Wzór:</b> Wskaźnik Rezygnacji = (Utraceni Klienci ÷ Klienci na Początku) × 100; Retencja = 100% − Rezygnacja.',
                '<b>Przykład:</b> utrata 50 z 1000 klientów = (50 ÷ 1000) × 100 = 5% rezygnacji, 95% retencji.',
                '<b>Dlaczego to ważne:</b> nawet niewielkie zmniejszenia rezygnacji znacząco kumulują się z czasem.',
            ],
            howto: [
                { question: 'Jaki okres czasu powinienem użyć?', answer: '<p>Ten, który pasuje do cyklu Twojego biznesu — zwykle miesiąc lub rok.</p>' },
                { question: 'Co jest uważane za "dobry" wskaźnik rezygnacji?', answer: '<p>Bardzo różni się w zależności od branży — oprogramowanie subskrypcyjne często celuje w poniżej 5-7% rocznej rezygnacji.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.pl, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.pl, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-tasa-de-cancelacion', title: 'Calculadora de Tasa de Cancelación', h1: 'Calculadora de Tasa de Cancelación de Clientes',
            meta_title: 'Calculadora de Cancelación de Clientes | Tasa de Cancelación y Retención',
            meta_description: 'Calcula la tasa de cancelación y retención de clientes al instante a partir de clientes iniciales y clientes perdidos.',
            short_answer: 'Esta calculadora encuentra tu tasa de cancelación, p. ej. perder 50 de 1,000 clientes iniciales = una tasa de cancelación del 5% (95% de retención).',
            intro_text: '<p>La tasa de cancelación mide el porcentaje de clientes que pierdes durante un período — introduce cuántos clientes tenías al inicio y cuántos perdiste.</p>',
            key_points: [
                '<b>Fórmula:</b> Tasa de Cancelación = (Clientes Perdidos ÷ Clientes al Inicio) × 100; Retención = 100% − Cancelación.',
                '<b>Ejemplo:</b> perder 50 de 1,000 clientes = (50 ÷ 1,000) × 100 = 5% de cancelación, 95% de retención.',
                '<b>Por qué importa:</b> incluso pequeñas reducciones en la cancelación se acumulan significativamente con el tiempo.',
            ],
            howto: [
                { question: '¿Qué período de tiempo debo usar?', answer: '<p>El que coincida con tu ciclo de negocio — comúnmente mensual o anual.</p>' },
                { question: '¿Qué se considera una "buena" tasa de cancelación?', answer: '<p>Varía enormemente según la industria — el software por suscripción suele apuntar a menos del 5-7% de cancelación anual.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.es, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.es, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-taux-dattrition', title: 'Calculateur de Taux d’Attrition', h1: 'Calculateur de Taux d’Attrition Client',
            meta_title: 'Calculateur d’Attrition Client | Taux d’Attrition et de Rétention',
            meta_description: 'Calculez le taux d’attrition et de rétention client instantanément à partir des clients de départ et des clients perdus.',
            short_answer: 'Ce calculateur trouve votre taux d’attrition, ex. perdre 50 des 1 000 clients de départ = un taux d’attrition de 5% (95% de rétention).',
            intro_text: '<p>Le taux d’attrition mesure le pourcentage de clients que vous perdez sur une période donnée — entrez combien de clients vous aviez au départ et combien vous en avez perdu.</p>',
            key_points: [
                '<b>Formule :</b> Taux d’Attrition = (Clients Perdus ÷ Clients au Départ) × 100 ; Rétention = 100% − Attrition.',
                '<b>Exemple :</b> perdre 50 des 1 000 clients = (50 ÷ 1 000) × 100 = 5% d’attrition, 95% de rétention.',
                '<b>Pourquoi c’est important :</b> même de petites réductions d’attrition s’accumulent significativement avec le temps.',
            ],
            howto: [
                { question: 'Quelle période dois-je utiliser ?', answer: '<p>Celle qui correspond à votre cycle d’entreprise — généralement mensuelle ou annuelle.</p>' },
                { question: 'Qu’est-ce qu’un "bon" taux d’attrition ?', answer: '<p>Cela varie énormément selon le secteur — les logiciels par abonnement visent souvent moins de 5-7% d’attrition annuelle.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.fr, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.fr, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-tasso-di-abbandono', title: 'Calcolatore di Tasso di Abbandono', h1: 'Calcolatore di Tasso di Abbandono Clienti',
            meta_title: 'Calcolatore di Abbandono Clienti | Tasso di Abbandono e Fidelizzazione',
            meta_description: 'Calcola il tasso di abbandono e fidelizzazione clienti istantaneamente da clienti iniziali e clienti persi.',
            short_answer: 'Questo calcolatore trova il tuo tasso di abbandono, es. perdere 50 di 1.000 clienti iniziali = un tasso di abbandono del 5% (95% di fidelizzazione).',
            intro_text: '<p>Il tasso di abbandono misura la percentuale di clienti che perdi in un dato periodo — inserisci quanti clienti avevi all\'inizio e quanti ne hai persi.</p>',
            key_points: [
                '<b>Formula:</b> Tasso di Abbandono = (Clienti Persi ÷ Clienti a Inizio) × 100; Fidelizzazione = 100% − Abbandono.',
                '<b>Esempio:</b> perdere 50 di 1.000 clienti = (50 ÷ 1.000) × 100 = 5% di abbandono, 95% di fidelizzazione.',
                '<b>Perché è importante:</b> anche piccole riduzioni dell\'abbandono si accumulano significativamente nel tempo.',
            ],
            howto: [
                { question: 'Quale periodo di tempo dovrei usare?', answer: '<p>Quello che corrisponde al tuo ciclo aziendale — comunemente mensile o annuale.</p>' },
                { question: 'Cosa è considerato un "buon" tasso di abbandono?', answer: '<p>Varia enormemente in base al settore — il software in abbonamento spesso punta a un abbandono annuale inferiore al 5-7%.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.it, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.it, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'kundenabwanderungsrate-rechner', title: 'Kundenabwanderungsrate-Rechner', h1: 'Kundenabwanderungsrate-Rechner',
            meta_title: 'Kundenabwanderungs-Rechner | Abwanderungs- und Bindungsrate',
            meta_description: 'Berechnen Sie Kundenabwanderungs- und Bindungsrate sofort aus Startkunden und verlorenen Kunden.',
            short_answer: 'Dieser Rechner findet Ihre Abwanderungsrate, z.B. Verlust von 50 von 1.000 Startkunden = eine Abwanderungsrate von 5% (95% Bindung).',
            intro_text: '<p>Die Abwanderungsrate misst den Prozentsatz der Kunden, die Sie über einen bestimmten Zeitraum verlieren — geben Sie ein, mit wie vielen Kunden Sie gestartet sind und wie viele Sie verloren haben.</p>',
            key_points: [
                '<b>Formel:</b> Abwanderungsrate = (Verlorene Kunden ÷ Kunden zu Beginn) × 100; Bindungsrate = 100% − Abwanderungsrate.',
                '<b>Beispiel:</b> Verlust von 50 von 1.000 Kunden = (50 ÷ 1.000) × 100 = 5% Abwanderung, 95% Bindung.',
                '<b>Warum es wichtig ist:</b> selbst kleine Reduzierungen der Abwanderung summieren sich im Laufe der Zeit erheblich.',
            ],
            howto: [
                { question: 'Welchen Zeitraum sollte ich verwenden?', answer: '<p>Denjenigen, der zu Ihrem Geschäftszyklus passt — üblicherweise monatlich oder jährlich.</p>' },
                { question: 'Was gilt als "gute" Abwanderungsrate?', answer: '<p>Variiert stark je nach Branche — Abonnement-Software zielt oft auf unter 5-7% jährliche Abwanderung.</p>' },
            ],
            inputs: [
                { name: 'customers_start', label: CUSTOMERS_START_LABEL.de, type: 'number', min: 1, max: 1000000000, placeholder: '1000' },
                { name: 'customers_lost', label: CUSTOMERS_LOST_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '50' },
            ],
            outputs: [{ name: 'churn_rate', label: CHURN_RATE_LABEL.de, precision: 2 }, { name: 'retention_rate', label: RETENTION_RATE_LABEL.de, precision: 2 }],
        },
    },
}

const PROGRAM_COST_LABEL: Record<string, string> = { en: 'Loyalty Program Cost', ru: 'Стоимость программы лояльности', de: 'Kosten des Treueprogramms', es: 'Costo del Programa de Lealtad', fr: 'Coût du Programme de Fidélité', it: 'Costo del Programma Fedeltà', pl: 'Koszt Programu Lojalnościowego', lv: 'Lojalitātes Programmas Izmaksas' }
const INCREMENTAL_REVENUE_LABEL: Record<string, string> = { en: 'Incremental Revenue from Members', ru: 'Дополнительная выручка от участников', de: 'Zusätzlicher Umsatz von Mitgliedern', es: 'Ingresos Incrementales de Miembros', fr: 'Revenu Incrémental des Membres', it: 'Ricavi Incrementali dai Membri', pl: 'Przychód Przyrostowy od Członków', lv: 'Papildu Ieņēmumi no Dalībniekiem' }
const ROI_PERCENTAGE_LABEL: Record<string, string> = { en: 'ROI (%)', ru: 'ROI (%)', de: 'ROI (%)', es: 'ROI (%)', fr: 'ROI (%)', it: 'ROI (%)', pl: 'ROI (%)', lv: 'ROI (%)' }
const NET_GAIN_LABEL: Record<string, string> = { en: 'Net Gain', ru: 'Чистая прибыль', de: 'Nettogewinn', es: 'Ganancia Neta', fr: 'Gain Net', it: 'Guadagno Netto', pl: 'Zysk Netto', lv: 'Neto Peļņa' }

// ============================================================
// 1166: Customer Loyalty Program ROI Calculator
// ============================================================
const loyaltyProgramRoiCalculatorTool: ToolDef = {
    id: '1166',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'program_cost', default: 5000 }, { key: 'incremental_revenue', default: 20000 }],
        functions: { result: { type: 'function', functionName: 'loyaltyProgramRoiCalculator', params: { program_cost: 'program_cost', incremental_revenue: 'incremental_revenue' } } },
        outputs: [{ key: 'roi_percentage', precision: 1 }, { key: 'net_gain', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'customer-loyalty-program-roi-calculator', title: 'Customer Loyalty Program ROI Calculator', h1: 'Customer Loyalty Program ROI Calculator',
            meta_title: 'Loyalty Program ROI Calculator | Measure Program Profitability',
            meta_description: 'Calculate the ROI of your customer loyalty program from its cost and the incremental revenue it generates.',
            short_answer: 'This calculator finds your loyalty program\'s ROI, e.g. $5,000 program cost generating $20,000 incremental revenue = a 300% ROI.',
            intro_text: '<p>Enter what your loyalty program costs to run and the extra revenue it generates from member behavior (compared to non-members) to see whether the program is paying for itself.</p>',
            key_points: [
                '<b>Formula:</b> ROI = ((Incremental Revenue − Program Cost) ÷ Program Cost) × 100.',
                '<b>Example:</b> ($20,000 − $5,000) ÷ $5,000 × 100 = 300% ROI.',
                '<b>Isolating "incremental":</b> the hardest part is estimating revenue that\'s truly attributable to the program — often done by comparing average spend/frequency of loyalty members versus similar non-member customers.',
            ],
            howto: [
                { question: 'What counts as "program cost"?', answer: '<p>Everything spent to run it — discounts and rewards given out, platform/software fees, and staff time managing the program.</p>' },
                { question: 'How do I estimate incremental revenue if I don\'t have a clean comparison group?', answer: '<p>A common approach is comparing purchase frequency and average order value before and after a customer joined the program, or against a similar cohort of non-members.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.en, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.en, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-roi-programmy-loyalnosti', title: 'Калькулятор ROI программы лояльности', h1: 'Калькулятор ROI программы лояльности',
            meta_title: 'Калькулятор ROI программы лояльности | Прибыльность программы',
            meta_description: 'Рассчитайте ROI программы лояльности по её стоимости и дополнительной выручке.',
            short_answer: 'Этот калькулятор находит ROI программы лояльности, например 5000$ стоимости, приносящей 20000$ дополнительной выручки = ROI 300%.',
            intro_text: '<p>Введите стоимость программы лояльности и дополнительную выручку от поведения участников (по сравнению с не-участниками), чтобы увидеть, окупается ли программа.</p>',
            key_points: [
                '<b>Формула:</b> ROI = ((Дополнительная выручка − Стоимость программы) ÷ Стоимость программы) × 100.',
                '<b>Пример:</b> (20000$ − 5000$) ÷ 5000$ × 100 = 300% ROI.',
                '<b>Выделение «дополнительного»:</b> сложнее всего оценить выручку, действительно связанную с программой.',
            ],
            howto: [
                { question: 'Что считается «стоимостью программы»?', answer: '<p>Всё, что тратится на её работу — скидки и награды, плата за платформу, время сотрудников.</p>' },
                { question: 'Как оценить дополнительную выручку без чёткой контрольной группы?', answer: '<p>Обычный подход — сравнение частоты покупок и среднего чека до и после присоединения клиента к программе.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.ru, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.ru, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'lojalitates-programmas-roi-kalkulators', title: 'Lojalitātes Programmas ROI Kalkulators', h1: 'Lojalitātes Programmas ROI Kalkulators',
            meta_title: 'Lojalitātes Programmas ROI Kalkulators | Programmas Rentabilitāte',
            meta_description: 'Aprēķiniet klientu lojalitātes programmas ROI no tās izmaksām un radītajiem papildu ieņēmumiem.',
            short_answer: 'Šis kalkulators atrod jūsu lojalitātes programmas ROI, piemēram, 5000$ izmaksas, kas rada 20000$ papildu ieņēmumu = 300% ROI.',
            intro_text: '<p>Ievadiet, cik maksā jūsu lojalitātes programmas darbība un papildu ieņēmumus, ko tā rada no dalībnieku uzvedības.</p>',
            key_points: [
                '<b>Formula:</b> ROI = ((Papildu Ieņēmumi − Programmas Izmaksas) ÷ Programmas Izmaksas) × 100.',
                '<b>Piemērs:</b> (20000$ − 5000$) ÷ 5000$ × 100 = 300% ROI.',
                '<b>"Papildu" izdalīšana:</b> visgrūtāk ir novērtēt ieņēmumus, kas patiešām attiecināmi uz programmu.',
            ],
            howto: [
                { question: 'Kas tiek uzskatīts par "programmas izmaksām"?', answer: '<p>Viss, kas iztērēts tās darbībai — atlaides un balvas, platformas maksas, personāla laiks.</p>' },
                { question: 'Kā novērtēt papildu ieņēmumus bez skaidras salīdzinājuma grupas?', answer: '<p>Izplatīta pieeja ir salīdzināt pirkumu biežumu un vidējo pasūtījuma vērtību pirms un pēc klienta pievienošanās programmai.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.lv, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.lv, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-roi-programu-lojalnosciowego', title: 'Kalkulator ROI Programu Lojalnościowego', h1: 'Kalkulator ROI Programu Lojalnościowego',
            meta_title: 'Kalkulator ROI Programu Lojalnościowego | Rentowność Programu',
            meta_description: 'Oblicz ROI programu lojalnościowego na podstawie jego kosztu i przychodu przyrostowego.',
            short_answer: 'Ten kalkulator znajduje ROI Twojego programu lojalnościowego, np. 5000$ kosztu generującego 20000$ przychodu przyrostowego = ROI 300%.',
            intro_text: '<p>Wpisz, ile kosztuje prowadzenie programu lojalnościowego i dodatkowy przychód generowany przez zachowanie członków, aby zobaczyć, czy program się zwraca.</p>',
            key_points: [
                '<b>Wzór:</b> ROI = ((Przychód Przyrostowy − Koszt Programu) ÷ Koszt Programu) × 100.',
                '<b>Przykład:</b> (20000$ − 5000$) ÷ 5000$ × 100 = 300% ROI.',
                '<b>Izolowanie "przyrostowego":</b> najtrudniejsze jest oszacowanie przychodu naprawdę przypisywalnego programowi.',
            ],
            howto: [
                { question: 'Co liczy się jako "koszt programu"?', answer: '<p>Wszystko wydane na jego prowadzenie — rabaty i nagrody, opłaty za platformę, czas personelu.</p>' },
                { question: 'Jak oszacować przychód przyrostowy bez czystej grupy porównawczej?', answer: '<p>Powszechne podejście to porównanie częstotliwości zakupów i średniej wartości zamówienia przed i po dołączeniu klienta do programu.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.pl, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.pl, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-roi-de-programa-de-lealtad', title: 'Calculadora de ROI de Programa de Lealtad', h1: 'Calculadora de ROI de Programa de Lealtad de Clientes',
            meta_title: 'Calculadora de ROI de Lealtad | Mide la Rentabilidad del Programa',
            meta_description: 'Calcula el ROI de tu programa de lealtad de clientes a partir de su costo e ingresos incrementales generados.',
            short_answer: 'Esta calculadora encuentra el ROI de tu programa de lealtad, p. ej. $5,000 de costo que genera $20,000 de ingresos incrementales = un ROI del 300%.',
            intro_text: '<p>Introduce cuánto cuesta operar tu programa de lealtad y los ingresos extra que genera por el comportamiento de los miembros para ver si el programa se está pagando solo.</p>',
            key_points: [
                '<b>Fórmula:</b> ROI = ((Ingresos Incrementales − Costo del Programa) ÷ Costo del Programa) × 100.',
                '<b>Ejemplo:</b> ($20,000 − $5,000) ÷ $5,000 × 100 = 300% de ROI.',
                '<b>Aislar lo "incremental":</b> lo más difícil es estimar los ingresos realmente atribuibles al programa.',
            ],
            howto: [
                { question: '¿Qué cuenta como "costo del programa"?', answer: '<p>Todo lo gastado en operarlo — descuentos y recompensas, tarifas de plataforma, tiempo del personal.</p>' },
                { question: '¿Cómo estimo los ingresos incrementales sin un grupo de comparación claro?', answer: '<p>Un enfoque común es comparar la frecuencia de compra y el valor promedio de pedido antes y después de que un cliente se uniera al programa.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.es, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.es, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-roi-de-programme-de-fidelite', title: 'Calculateur de ROI de Programme de Fidélité', h1: 'Calculateur de ROI de Programme de Fidélité Client',
            meta_title: 'Calculateur ROI de Fidélité | Mesurez la Rentabilité du Programme',
            meta_description: 'Calculez le ROI de votre programme de fidélité client à partir de son coût et du revenu incrémental généré.',
            short_answer: 'Ce calculateur trouve le ROI de votre programme de fidélité, ex. 5 000 $ de coût générant 20 000 $ de revenu incrémental = un ROI de 300%.',
            intro_text: '<p>Entrez combien coûte l’exploitation de votre programme de fidélité et le revenu supplémentaire généré par le comportement des membres pour voir si le programme se rentabilise.</p>',
            key_points: [
                '<b>Formule :</b> ROI = ((Revenu Incrémental − Coût du Programme) ÷ Coût du Programme) × 100.',
                '<b>Exemple :</b> (20 000 $ − 5 000 $) ÷ 5 000 $ × 100 = 300% de ROI.',
                '<b>Isoler "l\'incrémental" :</b> le plus difficile est d’estimer le revenu réellement attribuable au programme.',
            ],
            howto: [
                { question: 'Qu’est-ce qui compte comme "coût du programme" ?', answer: '<p>Tout ce qui est dépensé pour le faire fonctionner — remises et récompenses, frais de plateforme, temps du personnel.</p>' },
                { question: 'Comment estimer le revenu incrémental sans groupe de comparaison clair ?', answer: '<p>Une approche courante consiste à comparer la fréquence d’achat et la valeur moyenne de commande avant et après l’adhésion d’un client au programme.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.fr, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.fr, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-roi-del-programma-fedelta', title: 'Calcolatore di ROI del Programma Fedeltà', h1: 'Calcolatore di ROI del Programma Fedeltà Clienti',
            meta_title: 'Calcolatore ROI Fedeltà | Misura la Redditività del Programma',
            meta_description: 'Calcola il ROI del tuo programma fedeltà clienti dal suo costo e dai ricavi incrementali generati.',
            short_answer: 'Questo calcolatore trova il ROI del tuo programma fedeltà, es. $5.000 di costo che genera $20.000 di ricavi incrementali = un ROI del 300%.',
            intro_text: '<p>Inserisci quanto costa gestire il tuo programma fedeltà e i ricavi extra generati dal comportamento dei membri per vedere se il programma si ripaga da solo.</p>',
            key_points: [
                '<b>Formula:</b> ROI = ((Ricavi Incrementali − Costo del Programma) ÷ Costo del Programma) × 100.',
                '<b>Esempio:</b> ($20.000 − $5.000) ÷ $5.000 × 100 = 300% di ROI.',
                '<b>Isolare "l\'incrementale":</b> la parte più difficile è stimare i ricavi veramente attribuibili al programma.',
            ],
            howto: [
                { question: 'Cosa conta come "costo del programma"?', answer: '<p>Tutto ciò che viene speso per gestirlo — sconti e premi, costi della piattaforma, tempo del personale.</p>' },
                { question: 'Come stimo i ricavi incrementali senza un gruppo di confronto pulito?', answer: '<p>Un approccio comune è confrontare la frequenza di acquisto e il valore medio dell\'ordine prima e dopo che un cliente si è unito al programma.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.it, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.it, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'treueprogramm-roi-rechner', title: 'Treueprogramm-ROI-Rechner', h1: 'Kundentreueprogramm-ROI-Rechner',
            meta_title: 'Treueprogramm-ROI-Rechner | Programmrentabilität Messen',
            meta_description: 'Berechnen Sie den ROI Ihres Kundentreueprogramms aus seinen Kosten und dem erzielten zusätzlichen Umsatz.',
            short_answer: 'Dieser Rechner findet den ROI Ihres Treueprogramms, z.B. 5.000 $ Kosten, die 20.000 $ zusätzlichen Umsatz generieren = ein ROI von 300%.',
            intro_text: '<p>Geben Sie ein, was Ihr Treueprogramm im Betrieb kostet und den zusätzlichen Umsatz, den es durch das Verhalten der Mitglieder generiert, um zu sehen, ob sich das Programm rechnet.</p>',
            key_points: [
                '<b>Formel:</b> ROI = ((Zusätzlicher Umsatz − Programmkosten) ÷ Programmkosten) × 100.',
                '<b>Beispiel:</b> (20.000 $ − 5.000 $) ÷ 5.000 $ × 100 = 300% ROI.',
                '<b>"Zusätzlich" isolieren:</b> am schwierigsten ist es, den Umsatz zu schätzen, der wirklich dem Programm zuzuschreiben ist.',
            ],
            howto: [
                { question: 'Was zählt als "Programmkosten"?', answer: '<p>Alles, was für den Betrieb ausgegeben wird — Rabatte und Prämien, Plattform-/Softwaregebühren, Personalzeit.</p>' },
                { question: 'Wie schätze ich den zusätzlichen Umsatz ohne saubere Vergleichsgruppe?', answer: '<p>Ein gängiger Ansatz ist der Vergleich von Kaufhäufigkeit und durchschnittlichem Bestellwert vor und nach dem Beitritt eines Kunden zum Programm.</p>' },
            ],
            inputs: [
                { name: 'program_cost', label: PROGRAM_COST_LABEL.de, type: 'number', min: 0.01, max: 1000000000, placeholder: '5000' },
                { name: 'incremental_revenue', label: INCREMENTAL_REVENUE_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '20000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.de, precision: 1 }, { name: 'net_gain', label: NET_GAIN_LABEL.de, precision: 2 }],
        },
    },
}

const ORGANIC_VISITORS_LABEL: Record<string, string> = { en: 'Organic Visitors (per month)', ru: 'Органические посетители (в месяц)', de: 'Organische Besucher (pro Monat)', es: 'Visitantes Orgánicos (al mes)', fr: 'Visiteurs Organiques (par mois)', it: 'Visitatori Organici (al mese)', pl: 'Odwiedzający Organiczni (miesięcznie)', lv: 'Organiskie Apmeklētāji (mēnesī)' }
const EQUIVALENT_CPC_LABEL: Record<string, string> = { en: 'Equivalent Cost Per Click (Paid Ads)', ru: 'Эквивалентная цена за клик (реклама)', de: 'Äquivalenter Klickpreis (bezahlte Anzeigen)', es: 'Costo por Clic Equivalente (Anuncios Pagados)', fr: 'Coût par Clic Équivalent (Publicités Payantes)', it: 'Costo per Clic Equivalente (Annunci a Pagamento)', pl: 'Równoważny Koszt za Kliknięcie (Reklamy Płatne)', lv: 'Ekvivalentā Izmaksa par Klikšķi (Apmaksātas Reklāmas)' }
const ESTIMATED_VALUE_LABEL: Record<string, string> = { en: 'Estimated Monthly Traffic Value', ru: 'Оценочная ценность трафика в месяц', de: 'Geschätzter Monatlicher Traffic-Wert', es: 'Valor Mensual Estimado del Tráfico', fr: 'Valeur Mensuelle Estimée du Trafic', it: 'Valore Mensile Stimato del Traffico', pl: 'Szacowana Miesięczna Wartość Ruchu', lv: 'Aptuvenā Ikmēneša Trafika Vērtība' }

// ============================================================
// 1167: Organic Traffic Value Calculator
// ============================================================
const organicTrafficValueCalculatorTool: ToolDef = {
    id: '1167',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'organic_visitors', default: 10000 }, { key: 'equivalent_cpc', default: 2.5 }],
        functions: { result: { type: 'function', functionName: 'organicTrafficValueCalculator', params: { organic_visitors: 'organic_visitors', equivalent_cpc: 'equivalent_cpc' } } },
        outputs: [{ key: 'result', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'organic-traffic-value-calculator', title: 'Organic Traffic Value Calculator', h1: 'Organic Traffic Value Calculator',
            meta_title: 'Organic Traffic Value Calculator | What Would This SEO Traffic Cost as Ads?',
            meta_description: 'Estimate the dollar value of your organic search traffic by comparing it to what the equivalent paid ad clicks would cost.',
            short_answer: 'This calculator estimates what your organic traffic would cost if purchased via paid ads, e.g. 10,000 visitors at a $2.50 equivalent CPC = $25,000 in estimated monthly value.',
            intro_text: '<p>Organic (unpaid, SEO-driven) search traffic doesn\'t have a direct cost, but you can estimate its value by asking: "what would it cost to buy this same traffic through paid ads?" — enter your organic visitor count and an equivalent cost-per-click to see the estimated value.</p>',
            key_points: [
                '<b>Formula:</b> Estimated Value = Organic Visitors × Equivalent CPC.',
                '<b>Example:</b> 10,000 visitors × $2.50 = $25,000 estimated monthly value.',
                '<b>Where to find equivalent CPC:</b> keyword research tools (like Google Keyword Planner or SEO platforms) show average cost-per-click for the search terms your organic traffic ranks for — use a blended average across your top-ranking keywords.',
            ],
            howto: [
                { question: 'Is this the same as actual revenue from organic traffic?', answer: '<p>No — this estimates the media cost you\'re avoiding, not the revenue the traffic generates. It\'s a way to demonstrate SEO\'s value in advertising-equivalent terms, often used to justify SEO budget.</p>' },
                { question: 'Why might this overstate or understate true value?', answer: '<p>It assumes paid and organic clicks convert similarly, which isn\'t always true — organic clicks are sometimes higher-intent (overstating paid-equivalent value) or lower-intent depending on the query type.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.en, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-cennosti-organicheskogo-trafika', title: 'Калькулятор ценности органического трафика', h1: 'Калькулятор ценности органического трафика',
            meta_title: 'Калькулятор ценности SEO-трафика | Сколько бы стоил такой трафик в рекламе?',
            meta_description: 'Оцените денежную ценность органического поискового трафика, сравнив его со стоимостью аналогичных платных кликов.',
            short_answer: 'Этот калькулятор оценивает, сколько бы стоил ваш органический трафик при покупке через платную рекламу, например 10 000 посетителей при эквивалентной цене за клик 2,5$ = 25 000$ оценочной месячной ценности.',
            intro_text: '<p>Органический (неоплаченный, SEO) поисковый трафик не имеет прямой стоимости, но вы можете оценить его ценность, спросив: «сколько бы стоило купить такой же трафик через платную рекламу?»</p>',
            key_points: [
                '<b>Формула:</b> Оценочная ценность = Органические посетители × Эквивалентная цена за клик.',
                '<b>Пример:</b> 10 000 посетителей × 2,5$ = 25 000$ оценочной месячной ценности.',
                '<b>Где найти эквивалентную цену за клик:</b> инструменты исследования ключевых слов показывают среднюю цену за клик для поисковых запросов.',
            ],
            howto: [
                { question: 'Это то же самое, что реальная выручка от органического трафика?', answer: '<p>Нет — это оценивает медиа-затраты, которых вы избегаете, а не выручку, которую генерирует трафик.</p>' },
                { question: 'Почему это может завышать или занижать истинную ценность?', answer: '<p>Предполагается, что платные и органические клики конвертируются одинаково, что не всегда верно.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.ru, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'organiska-trafika-vertibas-kalkulators', title: 'Organiskā Trafika Vērtības Kalkulators', h1: 'Organiskā Trafika Vērtības Kalkulators',
            meta_title: 'SEO Trafika Vērtības Kalkulators | Cik Šis Trafiks Maksātu kā Reklāma?',
            meta_description: 'Novērtējiet organiskā meklēšanas trafika naudas vērtību, salīdzinot to ar līdzvērtīgu apmaksātu klikšķu izmaksām.',
            short_answer: 'Šis kalkulators novērtē, cik jūsu organiskais trafiks maksātu, ja to pirktu caur apmaksātu reklāmu, piemēram, 10 000 apmeklētāju ar 2,5$ ekvivalentu CPC = 25 000$ aptuvenā mēneša vērtība.',
            intro_text: '<p>Organiskajam (bezmaksas, SEO virzītam) meklēšanas trafikam nav tiešu izmaksu, bet jūs varat novērtēt tā vērtību, jautājot: "cik maksātu iegādāties šādu pašu trafiku caur apmaksātu reklāmu?"</p>',
            key_points: [
                '<b>Formula:</b> Aptuvenā Vērtība = Organiskie Apmeklētāji × Ekvivalentā CPC.',
                '<b>Piemērs:</b> 10 000 apmeklētāju × 2,5$ = 25 000$ aptuvenā mēneša vērtība.',
                '<b>Kur atrast ekvivalentu CPC:</b> atslēgvārdu izpētes rīki parāda vidējo izmaksu par klikšķi meklēšanas terminiem.',
            ],
            howto: [
                { question: 'Vai tas ir tas pats, kas reālie ieņēmumi no organiskā trafika?', answer: '<p>Nē — tas novērtē medija izmaksas, no kurām izvairāties, nevis ieņēmumus, ko trafiks rada.</p>' },
                { question: 'Kāpēc tas var pārvērtēt vai novērtēt par zemu patieso vērtību?', answer: '<p>Tiek pieņemts, ka apmaksātie un organiskie klikšķi konvertējas līdzīgi, kas ne vienmēr ir taisnība.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.lv, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-wartosci-ruchu-organicznego', title: 'Kalkulator Wartości Ruchu Organicznego', h1: 'Kalkulator Wartości Ruchu Organicznego',
            meta_title: 'Kalkulator Wartości Ruchu SEO | Ile Kosztowałby Ten Ruch jako Reklama?',
            meta_description: 'Oszacuj wartość pieniężną ruchu organicznego, porównując go do kosztu równoważnych płatnych kliknięć.',
            short_answer: 'Ten kalkulator szacuje, ile kosztowałby Twój ruch organiczny przy zakupie przez płatną reklamę, np. 10 000 odwiedzających przy równoważnym CPC 2,5$ = 25 000$ szacowanej miesięcznej wartości.',
            intro_text: '<p>Organiczny (bezpłatny, napędzany SEO) ruch wyszukiwania nie ma bezpośredniego kosztu, ale możesz oszacować jego wartość, pytając: "ile kosztowałoby kupienie tego samego ruchu przez płatną reklamę?"</p>',
            key_points: [
                '<b>Wzór:</b> Szacowana Wartość = Odwiedzający Organiczni × Równoważne CPC.',
                '<b>Przykład:</b> 10 000 odwiedzających × 2,5$ = 25 000$ szacowanej miesięcznej wartości.',
                '<b>Gdzie znaleźć równoważne CPC:</b> narzędzia do badania słów kluczowych pokazują średni koszt za kliknięcie.',
            ],
            howto: [
                { question: 'Czy to to samo co rzeczywisty przychód z ruchu organicznego?', answer: '<p>Nie — to szacuje koszty medialne, których unikasz, a nie przychód generowany przez ruch.</p>' },
                { question: 'Dlaczego może to zawyżać lub zaniżać prawdziwą wartość?', answer: '<p>Zakłada, że płatne i organiczne kliknięcia konwertują podobnie, co nie zawsze jest prawdą.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.pl, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-valor-de-trafico-organico', title: 'Calculadora de Valor de Tráfico Orgánico', h1: 'Calculadora de Valor de Tráfico Orgánico',
            meta_title: 'Calculadora de Valor SEO | ¿Cuánto Costaría Este Tráfico como Anuncios?',
            meta_description: 'Estima el valor monetario de tu tráfico de búsqueda orgánico comparándolo con lo que costarían los clics pagados equivalentes.',
            short_answer: 'Esta calculadora estima lo que costaría tu tráfico orgánico si se comprara mediante anuncios pagados, p. ej. 10,000 visitantes a un CPC equivalente de $2.50 = $25,000 en valor mensual estimado.',
            intro_text: '<p>El tráfico de búsqueda orgánico (no pagado, impulsado por SEO) no tiene un costo directo, pero puedes estimar su valor preguntando: "¿cuánto costaría comprar este mismo tráfico mediante anuncios pagados?"</p>',
            key_points: [
                '<b>Fórmula:</b> Valor Estimado = Visitantes Orgánicos × CPC Equivalente.',
                '<b>Ejemplo:</b> 10,000 visitantes × $2.50 = $25,000 de valor mensual estimado.',
                '<b>Dónde encontrar el CPC equivalente:</b> las herramientas de investigación de palabras clave muestran el costo por clic promedio.',
            ],
            howto: [
                { question: '¿Es esto lo mismo que los ingresos reales del tráfico orgánico?', answer: '<p>No — esto estima el costo de medios que estás evitando, no los ingresos que genera el tráfico.</p>' },
                { question: '¿Por qué esto podría sobreestimar o subestimar el valor real?', answer: '<p>Asume que los clics pagados y orgánicos convierten de manera similar, lo cual no siempre es cierto.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.es, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-valeur-de-trafic-organique', title: 'Calculateur de Valeur de Trafic Organique', h1: 'Calculateur de Valeur de Trafic Organique',
            meta_title: 'Calculateur de Valeur SEO | Combien Coûterait ce Trafic en Publicité ?',
            meta_description: 'Estimez la valeur monétaire de votre trafic de recherche organique en le comparant au coût des clics payants équivalents.',
            short_answer: 'Ce calculateur estime ce que coûterait votre trafic organique s\'il était acheté via des publicités payantes, ex. 10 000 visiteurs à un CPC équivalent de 2,50 $ = 25 000 $ de valeur mensuelle estimée.',
            intro_text: '<p>Le trafic de recherche organique (non payant, issu du SEO) n\'a pas de coût direct, mais vous pouvez estimer sa valeur en vous demandant : "combien coûterait l\'achat de ce même trafic via des publicités payantes ?"</p>',
            key_points: [
                '<b>Formule :</b> Valeur Estimée = Visiteurs Organiques × CPC Équivalent.',
                '<b>Exemple :</b> 10 000 visiteurs × 2,50 $ = 25 000 $ de valeur mensuelle estimée.',
                '<b>Où trouver le CPC équivalent :</b> les outils de recherche de mots-clés affichent le coût par clic moyen.',
            ],
            howto: [
                { question: 'Est-ce la même chose que le revenu réel du trafic organique ?', answer: '<p>Non — cela estime le coût média que vous évitez, pas le revenu généré par le trafic.</p>' },
                { question: 'Pourquoi cela pourrait-il surestimer ou sous-estimer la vraie valeur ?', answer: '<p>Cela suppose que les clics payants et organiques convertissent de manière similaire, ce qui n\'est pas toujours vrai.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.fr, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-valore-del-traffico-organico', title: 'Calcolatore di Valore del Traffico Organico', h1: 'Calcolatore di Valore del Traffico Organico',
            meta_title: 'Calcolatore Valore SEO | Quanto Costerebbe Questo Traffico come Annunci?',
            meta_description: 'Stima il valore monetario del tuo traffico di ricerca organico confrontandolo con il costo dei clic a pagamento equivalenti.',
            short_answer: 'Questo calcolatore stima quanto costerebbe il tuo traffico organico se acquistato tramite annunci a pagamento, es. 10.000 visitatori a un CPC equivalente di $2,50 = $25.000 di valore mensile stimato.',
            intro_text: '<p>Il traffico di ricerca organico (non a pagamento, guidato dalla SEO) non ha un costo diretto, ma puoi stimare il suo valore chiedendoti: "quanto costerebbe acquistare lo stesso traffico tramite annunci a pagamento?"</p>',
            key_points: [
                '<b>Formula:</b> Valore Stimato = Visitatori Organici × CPC Equivalente.',
                '<b>Esempio:</b> 10.000 visitatori × $2,50 = $25.000 di valore mensile stimato.',
                '<b>Dove trovare il CPC equivalente:</b> gli strumenti di ricerca delle parole chiave mostrano il costo medio per clic.',
            ],
            howto: [
                { question: 'È lo stesso dei ricavi reali dal traffico organico?', answer: '<p>No — questo stima il costo media che stai evitando, non i ricavi generati dal traffico.</p>' },
                { question: 'Perché questo potrebbe sovrastimare o sottostimare il valore reale?', answer: '<p>Presuppone che i clic a pagamento e organici convertano in modo simile, il che non è sempre vero.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.it, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'organischer-traffic-wert-rechner', title: 'Organischer-Traffic-Wert-Rechner', h1: 'Organischer-Traffic-Wert-Rechner',
            meta_title: 'SEO-Traffic-Wert-Rechner | Was Würde Dieser Traffic als Anzeigen Kosten?',
            meta_description: 'Schätzen Sie den Geldwert Ihres organischen Suchtraffics, indem Sie ihn mit den Kosten äquivalenter bezahlter Klicks vergleichen.',
            short_answer: 'Dieser Rechner schätzt, was Ihr organischer Traffic kosten würde, wenn er über bezahlte Anzeigen gekauft würde, z.B. 10.000 Besucher bei einem äquivalenten CPC von 2,50 $ = 25.000 $ geschätzter monatlicher Wert.',
            intro_text: '<p>Organischer (unbezahlter, SEO-gesteuerter) Suchtraffic hat keine direkten Kosten, aber Sie können seinen Wert schätzen, indem Sie fragen: "Was würde es kosten, denselben Traffic über bezahlte Anzeigen zu kaufen?"</p>',
            key_points: [
                '<b>Formel:</b> Geschätzter Wert = Organische Besucher × Äquivalenter CPC.',
                '<b>Beispiel:</b> 10.000 Besucher × 2,50 $ = 25.000 $ geschätzter monatlicher Wert.',
                '<b>Wo Sie den äquivalenten CPC finden:</b> Keyword-Recherche-Tools zeigen die durchschnittlichen Kosten pro Klick.',
            ],
            howto: [
                { question: 'Ist das dasselbe wie der tatsächliche Umsatz aus organischem Traffic?', answer: '<p>Nein — dies schätzt die Media-Kosten, die Sie vermeiden, nicht den Umsatz, den der Traffic generiert.</p>' },
                { question: 'Warum könnte dies den wahren Wert über- oder unterschätzen?', answer: '<p>Es wird angenommen, dass bezahlte und organische Klicks ähnlich konvertieren, was nicht immer zutrifft.</p>' },
            ],
            inputs: [
                { name: 'organic_visitors', label: ORGANIC_VISITORS_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '10000' },
                { name: 'equivalent_cpc', label: EQUIVALENT_CPC_LABEL.de, type: 'number', min: 0, max: 100000, placeholder: '2.5' },
            ],
            outputs: [{ name: 'result', label: ESTIMATED_VALUE_LABEL.de, precision: 2 }],
        },
    },
}

const CAMPAIGN_REVENUE_LABEL: Record<string, string> = { en: 'Campaign Revenue', ru: 'Выручка от кампании', de: 'Kampagnenumsatz', es: 'Ingresos de la Campaña', fr: 'Revenu de la Campagne', it: 'Ricavi della Campagna', pl: 'Przychód z Kampanii', lv: 'Kampaņas Ieņēmumi' }
const CAMPAIGN_COST_LABEL: Record<string, string> = { en: 'Campaign Cost', ru: 'Стоимость кампании', de: 'Kampagnenkosten', es: 'Costo de la Campaña', fr: 'Coût de la Campagne', it: 'Costo della Campagna', pl: 'Koszt Kampanii', lv: 'Kampaņas Izmaksas' }
const NET_PROFIT_LABEL: Record<string, string> = { en: 'Net Profit', ru: 'Чистая прибыль', de: 'Nettogewinn', es: 'Beneficio Neto', fr: 'Bénéfice Net', it: 'Profitto Netto', pl: 'Zysk Netto', lv: 'Neto Peļņa' }

// ============================================================
// 1168: Email Marketing ROI Calculator
// ============================================================
const emailMarketingRoiCalculatorTool: ToolDef = {
    id: '1168',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'campaign_revenue', default: 8000 }, { key: 'campaign_cost', default: 1000 }],
        functions: { result: { type: 'function', functionName: 'emailMarketingRoiCalculator', params: { campaign_revenue: 'campaign_revenue', campaign_cost: 'campaign_cost' } } },
        outputs: [{ key: 'roi_percentage', precision: 1 }, { key: 'net_profit', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'email-marketing-roi-calculator', title: 'Email Marketing ROI Calculator', h1: 'Email Marketing ROI Calculator',
            meta_title: 'Email Marketing ROI Calculator | Campaign Revenue vs. Cost',
            meta_description: 'Calculate the ROI of an email marketing campaign from its revenue and cost.',
            short_answer: 'This calculator finds your email campaign\'s ROI, e.g. $8,000 revenue from a $1,000 campaign = a 700% ROI.',
            intro_text: '<p>Enter the revenue generated by an email campaign and what it cost to run (platform fees, design, copywriting time) to see the return on investment.</p>',
            key_points: [
                '<b>Formula:</b> ROI = ((Campaign Revenue − Campaign Cost) ÷ Campaign Cost) × 100.',
                '<b>Example:</b> ($8,000 − $1,000) ÷ $1,000 × 100 = 700% ROI.',
                '<b>Why email often performs well:</b> email marketing typically has a lower cost per send than paid channels, and reaches an audience that already opted in, which is why it frequently shows a high ROI relative to other channels.',
            ],
            howto: [
                { question: 'What should I include in "campaign cost"?', answer: '<p>Email platform/software fees, any paid list-building costs, and the value of time spent designing and writing the campaign.</p>' },
                { question: 'How do I attribute revenue specifically to an email campaign?', answer: '<p>Use unique tracking links or discount codes tied to the campaign, or compare purchases from recipients against a control group who didn\'t receive the email.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.en, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.en, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.en, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-roi-email-marketinga', title: 'Калькулятор ROI email-маркетинга', h1: 'Калькулятор ROI email-маркетинга',
            meta_title: 'Калькулятор ROI email-маркетинга | Выручка кампании против затрат',
            meta_description: 'Рассчитайте ROI email-кампании по её выручке и стоимости.',
            short_answer: 'Этот калькулятор находит ROI вашей email-кампании, например 8000$ выручки от кампании стоимостью 1000$ = ROI 700%.',
            intro_text: '<p>Введите выручку, сгенерированную email-кампанией, и стоимость её проведения, чтобы увидеть рентабельность инвестиций.</p>',
            key_points: [
                '<b>Формула:</b> ROI = ((Выручка кампании − Стоимость кампании) ÷ Стоимость кампании) × 100.',
                '<b>Пример:</b> (8000$ − 1000$) ÷ 1000$ × 100 = 700% ROI.',
                '<b>Почему email часто эффективен:</b> email-маркетинг обычно имеет более низкую стоимость на отправку, чем платные каналы.',
            ],
            howto: [
                { question: 'Что включить в «стоимость кампании»?', answer: '<p>Плату за платформу, расходы на формирование списка, стоимость времени на дизайн и написание текстов.</p>' },
                { question: 'Как отнести выручку конкретно к email-кампании?', answer: '<p>Используйте уникальные ссылки отслеживания или промокоды, связанные с кампанией.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.ru, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.ru, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.ru, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'e-pasta-marketinga-roi-kalkulators', title: 'E-pasta Mārketinga ROI Kalkulators', h1: 'E-pasta Mārketinga ROI Kalkulators',
            meta_title: 'E-pasta Mārketinga ROI Kalkulators | Kampaņas Ieņēmumi pret Izmaksām',
            meta_description: 'Aprēķiniet e-pasta mārketinga kampaņas ROI no tās ieņēmumiem un izmaksām.',
            short_answer: 'Šis kalkulators atrod jūsu e-pasta kampaņas ROI, piemēram, 8000$ ieņēmumu no 1000$ kampaņas = 700% ROI.',
            intro_text: '<p>Ievadiet e-pasta kampaņas radītos ieņēmumus un tās darbības izmaksas, lai redzētu ieguldījumu atdevi.</p>',
            key_points: [
                '<b>Formula:</b> ROI = ((Kampaņas Ieņēmumi − Kampaņas Izmaksas) ÷ Kampaņas Izmaksas) × 100.',
                '<b>Piemērs:</b> (8000$ − 1000$) ÷ 1000$ × 100 = 700% ROI.',
                '<b>Kāpēc e-pasts bieži darbojas labi:</b> e-pasta mārketingam parasti ir zemākas izmaksas par sūtījumu nekā apmaksātiem kanāliem.',
            ],
            howto: [
                { question: 'Ko iekļaut "kampaņas izmaksās"?', answer: '<p>E-pasta platformas maksu, saraksta veidošanas izmaksas un dizaina/rakstīšanas laika vērtību.</p>' },
                { question: 'Kā attiecināt ieņēmumus tieši uz e-pasta kampaņu?', answer: '<p>Izmantojiet unikālas izsekošanas saites vai atlaižu kodus, kas saistīti ar kampaņu.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.lv, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.lv, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.lv, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-roi-email-marketingu', title: 'Kalkulator ROI Email Marketingu', h1: 'Kalkulator ROI Email Marketingu',
            meta_title: 'Kalkulator ROI Email Marketingu | Przychód z Kampanii vs. Koszt',
            meta_description: 'Oblicz ROI kampanii email marketingowej na podstawie jej przychodu i kosztu.',
            short_answer: 'Ten kalkulator znajduje ROI Twojej kampanii email, np. 8000$ przychodu z kampanii kosztującej 1000$ = ROI 700%.',
            intro_text: '<p>Wpisz przychód wygenerowany przez kampanię email i koszt jej prowadzenia, aby zobaczyć zwrot z inwestycji.</p>',
            key_points: [
                '<b>Wzór:</b> ROI = ((Przychód z Kampanii − Koszt Kampanii) ÷ Koszt Kampanii) × 100.',
                '<b>Przykład:</b> (8000$ − 1000$) ÷ 1000$ × 100 = 700% ROI.',
                '<b>Dlaczego email często dobrze działa:</b> email marketing zwykle ma niższy koszt wysyłki niż kanały płatne.',
            ],
            howto: [
                { question: 'Co powinienem uwzględnić w "koszcie kampanii"?', answer: '<p>Opłaty za platformę email, koszty budowania listy oraz wartość czasu poświęconego na projekt i teksty.</p>' },
                { question: 'Jak przypisać przychód konkretnie do kampanii email?', answer: '<p>Użyj unikalnych linków śledzących lub kodów rabatowych powiązanych z kampanią.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.pl, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.pl, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.pl, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-roi-de-email-marketing', title: 'Calculadora de ROI de Email Marketing', h1: 'Calculadora de ROI de Email Marketing',
            meta_title: 'Calculadora de ROI de Email Marketing | Ingresos de Campaña vs. Costo',
            meta_description: 'Calcula el ROI de una campaña de email marketing a partir de sus ingresos y costo.',
            short_answer: 'Esta calculadora encuentra el ROI de tu campaña de email, p. ej. $8,000 de ingresos de una campaña de $1,000 = un ROI del 700%.',
            intro_text: '<p>Introduce los ingresos generados por una campaña de email y lo que costó ejecutarla para ver el retorno de la inversión.</p>',
            key_points: [
                '<b>Fórmula:</b> ROI = ((Ingresos de la Campaña − Costo de la Campaña) ÷ Costo de la Campaña) × 100.',
                '<b>Ejemplo:</b> ($8,000 − $1,000) ÷ $1,000 × 100 = 700% de ROI.',
                '<b>Por qué el email suele funcionar bien:</b> el email marketing típicamente tiene un costo por envío menor que los canales pagados.',
            ],
            howto: [
                { question: '¿Qué debo incluir en el "costo de la campaña"?', answer: '<p>Tarifas de la plataforma de email, costos de construcción de lista pagados, y el valor del tiempo dedicado a diseñar y redactar.</p>' },
                { question: '¿Cómo atribuyo ingresos específicamente a una campaña de email?', answer: '<p>Usa enlaces de seguimiento únicos o códigos de descuento vinculados a la campaña.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.es, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.es, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.es, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-roi-demail-marketing', title: 'Calculateur de ROI d’Email Marketing', h1: 'Calculateur de ROI d’Email Marketing',
            meta_title: 'Calculateur de ROI d’Email Marketing | Revenu de Campagne vs. Coût',
            meta_description: 'Calculez le ROI d’une campagne d’email marketing à partir de son revenu et de son coût.',
            short_answer: 'Ce calculateur trouve le ROI de votre campagne email, ex. 8 000 $ de revenu d’une campagne à 1 000 $ = un ROI de 700%.',
            intro_text: '<p>Entrez le revenu généré par une campagne email et son coût d’exécution pour voir le retour sur investissement.</p>',
            key_points: [
                '<b>Formule :</b> ROI = ((Revenu de la Campagne − Coût de la Campagne) ÷ Coût de la Campagne) × 100.',
                '<b>Exemple :</b> (8 000 $ − 1 000 $) ÷ 1 000 $ × 100 = 700% de ROI.',
                '<b>Pourquoi l’email performe souvent bien :</b> l’email marketing a généralement un coût par envoi inférieur aux canaux payants.',
            ],
            howto: [
                { question: 'Que devrais-je inclure dans le "coût de la campagne" ?', answer: '<p>Frais de plateforme email, coûts payants de constitution de liste, et la valeur du temps passé à concevoir et rédiger.</p>' },
                { question: 'Comment attribuer le revenu spécifiquement à une campagne email ?', answer: '<p>Utilisez des liens de suivi uniques ou des codes de réduction liés à la campagne.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.fr, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.fr, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.fr, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-roi-di-email-marketing', title: 'Calcolatore di ROI di Email Marketing', h1: 'Calcolatore di ROI di Email Marketing',
            meta_title: 'Calcolatore di ROI Email Marketing | Ricavi Campagna vs. Costo',
            meta_description: 'Calcola il ROI di una campagna di email marketing dai suoi ricavi e costi.',
            short_answer: 'Questo calcolatore trova il ROI della tua campagna email, es. $8.000 di ricavi da una campagna da $1.000 = un ROI del 700%.',
            intro_text: '<p>Inserisci i ricavi generati da una campagna email e quanto è costata da gestire per vedere il ritorno sull\'investimento.</p>',
            key_points: [
                '<b>Formula:</b> ROI = ((Ricavi della Campagna − Costo della Campagna) ÷ Costo della Campagna) × 100.',
                '<b>Esempio:</b> ($8.000 − $1.000) ÷ $1.000 × 100 = 700% di ROI.',
                '<b>Perché l\'email spesso funziona bene:</b> l\'email marketing ha tipicamente un costo per invio inferiore rispetto ai canali a pagamento.',
            ],
            howto: [
                { question: 'Cosa dovrei includere nel "costo della campagna"?', answer: '<p>Costi della piattaforma email, costi a pagamento per la costruzione della lista, e il valore del tempo speso per progettare e scrivere.</p>' },
                { question: 'Come attribuisco i ricavi specificamente a una campagna email?', answer: '<p>Usa link di tracciamento univoci o codici sconto legati alla campagna.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.it, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.it, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.it, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'email-marketing-roi-rechner', title: 'E-Mail-Marketing-ROI-Rechner', h1: 'E-Mail-Marketing-ROI-Rechner',
            meta_title: 'E-Mail-Marketing-ROI-Rechner | Kampagnenumsatz vs. Kosten',
            meta_description: 'Berechnen Sie den ROI einer E-Mail-Marketing-Kampagne aus ihrem Umsatz und ihren Kosten.',
            short_answer: 'Dieser Rechner findet den ROI Ihrer E-Mail-Kampagne, z.B. 8.000 $ Umsatz aus einer Kampagne für 1.000 $ = ein ROI von 700%.',
            intro_text: '<p>Geben Sie den von einer E-Mail-Kampagne generierten Umsatz und die Kosten für ihre Durchführung ein, um den Return on Investment zu sehen.</p>',
            key_points: [
                '<b>Formel:</b> ROI = ((Kampagnenumsatz − Kampagnenkosten) ÷ Kampagnenkosten) × 100.',
                '<b>Beispiel:</b> (8.000 $ − 1.000 $) ÷ 1.000 $ × 100 = 700% ROI.',
                '<b>Warum E-Mail oft gut abschneidet:</b> E-Mail-Marketing hat typischerweise niedrigere Kosten pro Versand als bezahlte Kanäle.',
            ],
            howto: [
                { question: 'Was sollte ich in "Kampagnenkosten" einbeziehen?', answer: '<p>E-Mail-Plattformgebühren, bezahlte Kosten für den Listenaufbau und den Wert der Zeit für Design und Texterstellung.</p>' },
                { question: 'Wie ordne ich Umsatz speziell einer E-Mail-Kampagne zu?', answer: '<p>Verwenden Sie eindeutige Tracking-Links oder Rabattcodes, die mit der Kampagne verknüpft sind.</p>' },
            ],
            inputs: [
                { name: 'campaign_revenue', label: CAMPAIGN_REVENUE_LABEL.de, type: 'number', min: 0, max: 1000000000, placeholder: '8000' },
                { name: 'campaign_cost', label: CAMPAIGN_COST_LABEL.de, type: 'number', min: 0.01, max: 1000000000, placeholder: '1000' },
            ],
            outputs: [{ name: 'roi_percentage', label: ROI_PERCENTAGE_LABEL.de, precision: 1 }, { name: 'net_profit', label: NET_PROFIT_LABEL.de, precision: 2 }],
        },
    },
}

export const tools: ToolDef[] = [
    roasCalculatorTool, cpaCalculatorTool, cpmCalculatorTool, ctrCalculatorTool, conversionRateCalculatorTool,
    funnelConversionCalculatorTool, multiTouchAttributionCalculatorTool, ltvCacRatioCalculatorTool,
    churnRateCalculatorTool, loyaltyProgramRoiCalculatorTool, organicTrafficValueCalculatorTool, emailMarketingRoiCalculatorTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: MARKETING_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: MARKETING_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} marketing calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
