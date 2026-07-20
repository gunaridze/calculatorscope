// One-off script: seeds 10 new Interest & APR calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-finance-interest-apr-calculators.ts
//
// Tool IDs 1023-1032, category_id '25' (Interest & APR, under Finance). All
// formulas verified numerically against known reference figures before writing
// this file (e.g. 6% APR compounded monthly -> 6.1678% EAR).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INTEREST_APR_CATEGORY_ID = '25'

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

// ============================================================
// 1023: APR to EAR (Effective Annual Rate) Calculator
// ============================================================
const aprToEar: ToolDef = {
    id: '1023',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'apr', default: 6 },
            { key: 'n', default: 12 },
        ],
        formulas: {
            ear: '((1 + apr/100/n)^n - 1)*100',
        },
        outputs: [{ key: 'ear', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'apr-to-ear-effective-annual-rate-calculator',
            title: 'APR to EAR Calculator - Effective Annual Rate',
            h1: 'APR to EAR Calculator',
            meta_title: 'APR to EAR Calculator | Effective Annual Rate',
            meta_description: 'Convert a nominal APR to its Effective Annual Rate (EAR) based on compounding frequency — see the real annual cost or yield behind the advertised rate.',
            short_answer: 'This calculator converts a nominal APR (Annual Percentage Rate) into its Effective Annual Rate (EAR) — the real annual rate once compounding is accounted for, which is always equal to or higher than the nominal rate.',
            intro_text: '<p>APR is a nominal rate that doesn\'t account for how often interest compounds within the year. EAR (also called APY on savings products) reflects the true annual rate once monthly, daily, or other compounding is factored in — the more frequent the compounding, the bigger the gap between APR and EAR.</p><p><b>Borrowers and savers</b> use this to compare offers fairly: two loans or savings accounts with the same advertised APR but different compounding frequencies actually cost or pay differently, and EAR is the number that makes them directly comparable.</p>',
            key_points: [
                '<b>EAR ≥ APR Always:</b> More frequent compounding always produces an EAR equal to or greater than the nominal APR.',
                '<b>Formula:</b> EAR = (1 + APR/n)ⁿ − 1, where n is the number of compounding periods per year.',
                '<b>Use for Fair Comparison:</b> Always compare EAR, not APR, when comparing two offers with different compounding frequencies.',
            ],
            howto: [
                { question: 'Why is EAR higher than APR?', answer: '<p>Because interest is added to the balance before the end of the year (e.g., monthly), and that added interest itself starts earning interest — the more often this happens, the larger the gap.</p>' },
                { question: 'Is APY the same as EAR?', answer: '<p>Yes — APY (Annual Percentage Yield) is the same calculation as EAR, just the term used for savings and investment products rather than loans.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'Nominal APR', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Compounding Periods per Year', type: 'select', options: [
                    { value: '1', label: 'Annually' },
                    { value: '4', label: 'Quarterly' },
                    { value: '12', label: 'Monthly' },
                    { value: '365', label: 'Daily' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Effective Annual Rate (EAR)', unit: '%', precision: 3 }],
        },
        ru: {
            slug: 'kalkulyator-apr-v-ear-effektivnaya-stavka',
            title: 'Калькулятор APR в EAR - Эффективная годовая ставка',
            h1: 'Калькулятор APR в EAR',
            meta_title: 'Калькулятор EAR | Эффективная годовая процентная ставка',
            meta_description: 'Переведите номинальную ставку APR в эффективную годовую ставку (EAR) с учётом периодичности капитализации.',
            short_answer: 'Этот калькулятор переводит номинальную ставку APR в эффективную годовую ставку (EAR) — реальную годовую ставку с учётом капитализации, которая всегда равна или выше номинальной.',
            intro_text: '<p>APR — это номинальная ставка, не учитывающая, как часто проценты капитализируются в течение года. EAR (также называемая APY для вкладов) отражает реальную годовую ставку с учётом ежемесячной, ежедневной или иной капитализации — чем чаще капитализация, тем больше разница между APR и EAR.</p><p><b>Заёмщики и вкладчики</b> используют это для честного сравнения предложений: два кредита или вклада с одинаковым номинальным APR, но разной периодичностью капитализации, реально стоят или приносят по-разному, и EAR — число, делающее их напрямую сравнимыми.</p>',
            key_points: [
                '<b>EAR всегда ≥ APR:</b> Более частая капитализация всегда даёт EAR равный или больше номинального APR.',
                '<b>Формула:</b> EAR = (1 + APR/n)ⁿ − 1, где n — число периодов капитализации в год.',
                '<b>Используйте для честного сравнения:</b> Всегда сравнивайте EAR, а не APR, при сравнении двух предложений с разной периодичностью.',
            ],
            howto: [
                { question: 'Почему EAR выше, чем APR?', answer: '<p>Потому что проценты добавляются к балансу до конца года (например, ежемесячно), и добавленные проценты сами начинают приносить проценты — чем чаще это происходит, тем больше разница.</p>' },
                { question: 'APY — это то же самое, что EAR?', answer: '<p>Да — APY (годовая процентная доходность) вычисляется так же, как EAR, просто термин используется для вкладов и инвестиций, а не кредитов.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'Номинальный APR', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Периодов капитализации в год', type: 'select', options: [
                    { value: '1', label: 'Ежегодно' },
                    { value: '4', label: 'Ежеквартально' },
                    { value: '12', label: 'Ежемесячно' },
                    { value: '365', label: 'Ежедневно' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Эффективная годовая ставка (EAR)', unit: '%', precision: 3 }],
        },
        lv: {
            slug: 'apr-uz-ear-kalkulators-efektiva-gada-likme',
            title: 'APR uz EAR Kalkulators - Efektīvā Gada Likme',
            h1: 'APR uz EAR Kalkulators',
            meta_title: 'EAR Kalkulators | Efektīvā Gada Procentu Likme',
            meta_description: 'Pārrēķiniet nominālo APR uz efektīvo gada likmi (EAR), balstoties uz kapitalizācijas biežumu.',
            short_answer: 'Šis kalkulators pārrēķina nominālo APR uz efektīvo gada likmi (EAR) — reālo gada likmi, ņemot vērā kapitalizāciju, kas vienmēr ir vienāda vai augstāka par nominālo likmi.',
            intro_text: '<p>APR ir nominālā likme, kas neņem vērā, cik bieži procenti tiek kapitalizēti gada laikā. EAR (saukta arī par APY noguldījumiem) atspoguļo reālo gada likmi, ņemot vērā ikmēneša, ikdienas vai citu kapitalizāciju — jo biežāka kapitalizācija, jo lielāka atšķirība starp APR un EAR.</p><p><b>Aizņēmēji un noguldītāji</b> to izmanto godīgai piedāvājumu salīdzināšanai: divi aizdevumi vai noguldījumi ar vienādu nominālo APR, bet atšķirīgu kapitalizācijas biežumu, reāli maksā vai nes ienākumus atšķirīgi, un EAR ir skaitlis, kas padara tos tieši salīdzināmus.</p>',
            key_points: [
                '<b>EAR vienmēr ≥ APR:</b> Biežāka kapitalizācija vienmēr dod EAR, kas vienāds vai lielāks par nominālo APR.',
                '<b>Formula:</b> EAR = (1 + APR/n)ⁿ − 1, kur n ir kapitalizācijas periodu skaits gadā.',
                '<b>Izmantojiet godīgai salīdzināšanai:</b> Vienmēr salīdziniet EAR, nevis APR, salīdzinot divus piedāvājumus ar atšķirīgu kapitalizācijas biežumu.',
            ],
            howto: [
                { question: 'Kāpēc EAR ir augstāka nekā APR?', answer: '<p>Tāpēc, ka procenti tiek pievienoti atlikumam pirms gada beigām (piemēram, katru mēnesi), un pievienotie procenti paši sāk nopelnīt procentus — jo biežāk tas notiek, jo lielāka atšķirība.</p>' },
                { question: 'Vai APY ir tas pats, kas EAR?', answer: '<p>Jā — APY (gada procentu ienesīgums) tiek aprēķināts tāpat kā EAR, tikai termins tiek izmantots noguldījumiem un investīcijām, nevis aizdevumiem.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'Nominālais APR', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Kapitalizācijas Periodi Gadā', type: 'select', options: [
                    { value: '1', label: 'Ik gadu' },
                    { value: '4', label: 'Ik ceturksni' },
                    { value: '12', label: 'Ik mēnesi' },
                    { value: '365', label: 'Ik dienu' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Efektīvā Gada Likme (EAR)', unit: '%', precision: 3 }],
        },
        pl: {
            slug: 'kalkulator-apr-na-ear-efektywna-stopa-roczna',
            title: 'Kalkulator APR na EAR - Efektywna Stopa Roczna',
            h1: 'Kalkulator APR na EAR',
            meta_title: 'Kalkulator EAR | Efektywna Roczna Stopa Procentowa',
            meta_description: 'Przelicz nominalną stopę APR na efektywną stopę roczną (EAR), w zależności od częstotliwości kapitalizacji.',
            short_answer: 'Ten kalkulator przelicza nominalną stopę APR na efektywną stopę roczną (EAR) — rzeczywistą roczną stopę po uwzględnieniu kapitalizacji, która jest zawsze równa lub wyższa od stopy nominalnej.',
            intro_text: '<p>APR to stopa nominalna, która nie uwzględnia, jak często odsetki są kapitalizowane w ciągu roku. EAR (nazywana też APY dla oszczędności) odzwierciedla rzeczywistą stopę roczną po uwzględnieniu miesięcznej, dziennej lub innej kapitalizacji — im częstsza kapitalizacja, tym większa różnica między APR a EAR.</p><p><b>Kredytobiorcy i oszczędzający</b> używają tego do uczciwego porównania ofert: dwa kredyty lub konta oszczędnościowe o tym samym nominalnym APR, ale różnej częstotliwości kapitalizacji, faktycznie kosztują lub zarabiają inaczej, a EAR to liczba, która czyni je bezpośrednio porównywalnymi.</p>',
            key_points: [
                '<b>EAR zawsze ≥ APR:</b> Częstsza kapitalizacja zawsze daje EAR równe lub większe niż nominalne APR.',
                '<b>Wzór:</b> EAR = (1 + APR/n)ⁿ − 1, gdzie n to liczba okresów kapitalizacji w roku.',
                '<b>Używaj do uczciwego porównania:</b> Zawsze porównuj EAR, nie APR, przy porównywaniu dwóch ofert o różnej częstotliwości kapitalizacji.',
            ],
            howto: [
                { question: 'Dlaczego EAR jest wyższe niż APR?', answer: '<p>Ponieważ odsetki są dodawane do salda przed końcem roku (np. co miesiąc), a dodane odsetki same zaczynają zarabiać odsetki — im częściej to się dzieje, tym większa różnica.</p>' },
                { question: 'Czy APY to to samo co EAR?', answer: '<p>Tak — APY (roczna stopa zwrotu) jest obliczane tak samo jak EAR, tylko termin ten jest używany dla produktów oszczędnościowych i inwestycyjnych, a nie kredytów.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'Nominalne APR', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Okresy Kapitalizacji w Roku', type: 'select', options: [
                    { value: '1', label: 'Rocznie' },
                    { value: '4', label: 'Kwartalnie' },
                    { value: '12', label: 'Miesięcznie' },
                    { value: '365', label: 'Dziennie' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Efektywna Stopa Roczna (EAR)', unit: '%', precision: 3 }],
        },
        es: {
            slug: 'calculadora-apr-a-tae-tasa-anual-efectiva',
            title: 'Calculadora de APR a TAE - Tasa Anual Efectiva',
            h1: 'Calculadora de APR a TAE',
            meta_title: 'Calculadora TAE | Tasa Anual Efectiva',
            meta_description: 'Convierte una APR nominal a su Tasa Anual Efectiva (TAE) según la frecuencia de capitalización.',
            short_answer: 'Esta calculadora convierte una APR nominal en su Tasa Anual Efectiva (TAE) — la tasa anual real una vez considerada la capitalización, que siempre es igual o mayor que la tasa nominal.',
            intro_text: '<p>La APR es una tasa nominal que no considera con qué frecuencia se capitaliza el interés durante el año. La TAE (también llamada APY en productos de ahorro) refleja la tasa anual real una vez que se tiene en cuenta la capitalización mensual, diaria u otra — cuanto más frecuente la capitalización, mayor la diferencia entre APR y TAE.</p><p><b>Prestatarios y ahorradores</b> usan esto para comparar ofertas de forma justa: dos préstamos o cuentas de ahorro con la misma APR anunciada pero diferente frecuencia de capitalización en realidad cuestan o rinden distinto, y la TAE es el número que los hace directamente comparables.</p>',
            key_points: [
                '<b>TAE ≥ APR siempre:</b> Una capitalización más frecuente siempre produce una TAE igual o mayor que la APR nominal.',
                '<b>Fórmula:</b> TAE = (1 + APR/n)ⁿ − 1, donde n es el número de períodos de capitalización por año.',
                '<b>Usar para comparación justa:</b> Compara siempre la TAE, no la APR, al comparar dos ofertas con diferente frecuencia de capitalización.',
            ],
            howto: [
                { question: '¿Por qué la TAE es más alta que la APR?', answer: '<p>Porque el interés se añade al saldo antes de fin de año (por ejemplo, mensualmente), y ese interés añadido comienza a generar intereses por sí mismo — cuanto más ocurre esto, mayor la diferencia.</p>' },
                { question: '¿Es el APY lo mismo que la TAE?', answer: '<p>Sí — el APY (rendimiento porcentual anual) se calcula igual que la TAE, solo que el término se usa para productos de ahorro e inversión en lugar de préstamos.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'APR Nominal', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Períodos de Capitalización al Año', type: 'select', options: [
                    { value: '1', label: 'Anual' },
                    { value: '4', label: 'Trimestral' },
                    { value: '12', label: 'Mensual' },
                    { value: '365', label: 'Diaria' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Tasa Anual Efectiva (TAE)', unit: '%', precision: 3 }],
        },
        fr: {
            slug: 'calculateur-taeg-vers-tae-taux-annuel-effectif',
            title: 'Calculateur TAEG vers TAE - Taux Annuel Effectif',
            h1: 'Calculateur TAEG vers TAE',
            meta_title: 'Calculateur TAE | Taux Annuel Effectif',
            meta_description: 'Convertissez un TAEG nominal en Taux Annuel Effectif (TAE), selon la fréquence de capitalisation.',
            short_answer: 'Ce calculateur convertit un TAEG nominal en Taux Annuel Effectif (TAE) — le taux annuel réel une fois la capitalisation prise en compte, toujours égal ou supérieur au taux nominal.',
            intro_text: '<p>Le TAEG est un taux nominal qui ne tient pas compte de la fréquence de capitalisation des intérêts durant l’année. Le TAE (aussi appelé APY pour les produits d’épargne) reflète le taux annuel réel une fois la capitalisation mensuelle, quotidienne ou autre prise en compte — plus la capitalisation est fréquente, plus l’écart entre TAEG et TAE est grand.</p><p><b>Emprunteurs et épargnants</b> utilisent cela pour comparer les offres équitablement : deux prêts ou comptes épargne avec le même TAEG affiché mais des fréquences de capitalisation différentes coûtent ou rapportent réellement différemment, et le TAE est le chiffre qui les rend directement comparables.</p>',
            key_points: [
                '<b>TAE ≥ TAEG toujours :</b> Une capitalisation plus fréquente produit toujours un TAE égal ou supérieur au TAEG nominal.',
                '<b>Formule :</b> TAE = (1 + TAEG/n)ⁿ − 1, où n est le nombre de périodes de capitalisation par an.',
                '<b>À utiliser pour une comparaison équitable :</b> Comparez toujours le TAE, pas le TAEG, lors de la comparaison de deux offres avec des fréquences de capitalisation différentes.',
            ],
            howto: [
                { question: 'Pourquoi le TAE est-il plus élevé que le TAEG ?', answer: '<p>Parce que les intérêts sont ajoutés au solde avant la fin de l’année (par exemple mensuellement), et ces intérêts ajoutés génèrent eux-mêmes des intérêts — plus cela se produit souvent, plus l’écart est grand.</p>' },
                { question: 'L’APY est-il la même chose que le TAE ?', answer: '<p>Oui — l’APY (rendement annuel en pourcentage) se calcule de la même manière que le TAE, le terme étant simplement utilisé pour les produits d’épargne et d’investissement plutôt que pour les prêts.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'TAEG Nominal', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Périodes de Capitalisation par An', type: 'select', options: [
                    { value: '1', label: 'Annuelle' },
                    { value: '4', label: 'Trimestrielle' },
                    { value: '12', label: 'Mensuelle' },
                    { value: '365', label: 'Quotidienne' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Taux Annuel Effectif (TAE)', unit: '%', precision: 3 }],
        },
        it: {
            slug: 'calcolatore-tan-a-tae-tasso-annuo-effettivo',
            title: 'Calcolatore TAN a TAE - Tasso Annuo Effettivo',
            h1: 'Calcolatore TAN a TAE',
            meta_title: 'Calcolatore TAE | Tasso Annuo Effettivo',
            meta_description: 'Converti un TAN nominale nel suo Tasso Annuo Effettivo (TAE), in base alla frequenza di capitalizzazione.',
            short_answer: 'Questo calcolatore converte un TAN nominale nel suo Tasso Annuo Effettivo (TAE) — il tasso annuo reale una volta considerata la capitalizzazione, sempre uguale o superiore al tasso nominale.',
            intro_text: '<p>Il TAN è un tasso nominale che non considera quanto spesso l’interesse si capitalizza durante l’anno. Il TAE (chiamato anche APY per i prodotti di risparmio) riflette il tasso annuo reale una volta considerata la capitalizzazione mensile, giornaliera o altra — più frequente è la capitalizzazione, maggiore è il divario tra TAN e TAE.</p><p><b>Mutuatari e risparmiatori</b> usano questo per confrontare le offerte in modo equo: due prestiti o conti di risparmio con lo stesso TAN pubblicizzato ma diversa frequenza di capitalizzazione in realtà costano o rendono diversamente, e il TAE è il numero che li rende direttamente confrontabili.</p>',
            key_points: [
                '<b>TAE sempre ≥ TAN:</b> Una capitalizzazione più frequente produce sempre un TAE uguale o superiore al TAN nominale.',
                '<b>Formula:</b> TAE = (1 + TAN/n)ⁿ − 1, dove n è il numero di periodi di capitalizzazione all’anno.',
                '<b>Usa per un confronto equo:</b> Confronta sempre il TAE, non il TAN, quando confronti due offerte con diversa frequenza di capitalizzazione.',
            ],
            howto: [
                { question: 'Perché il TAE è più alto del TAN?', answer: '<p>Perché l’interesse viene aggiunto al saldo prima della fine dell’anno (ad esempio mensilmente), e l’interesse aggiunto inizia a sua volta a generare interessi — più spesso ciò accade, maggiore è il divario.</p>' },
                { question: 'L’APY è la stessa cosa del TAE?', answer: '<p>Sì — l’APY (rendimento percentuale annuo) viene calcolato allo stesso modo del TAE, solo che il termine viene usato per prodotti di risparmio e investimento anziché prestiti.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'TAN Nominale', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Periodi di Capitalizzazione all’Anno', type: 'select', options: [
                    { value: '1', label: 'Annuale' },
                    { value: '4', label: 'Trimestrale' },
                    { value: '12', label: 'Mensile' },
                    { value: '365', label: 'Giornaliera' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Tasso Annuo Effettivo (TAE)', unit: '%', precision: 3 }],
        },
        de: {
            slug: 'sollzins-zu-effektivzins-rechner',
            title: 'Sollzins zu Effektivzins Rechner - Effektiver Jahreszins',
            h1: 'Sollzins zu Effektivzins Rechner',
            meta_title: 'Effektivzins-Rechner | Effektiver Jahreszins',
            meta_description: 'Rechnen Sie einen nominalen Sollzins in den effektiven Jahreszins um, basierend auf der Zinsperiode.',
            short_answer: 'Dieser Rechner wandelt einen nominalen Sollzins in den effektiven Jahreszins um — den tatsächlichen Jahreszins nach Berücksichtigung der Zinsperiode, der immer gleich oder höher als der Nominalzins ist.',
            intro_text: '<p>Der Sollzins ist ein Nominalzins, der nicht berücksichtigt, wie oft Zinsen innerhalb des Jahres verzinst werden. Der effektive Jahreszins (bei Sparprodukten auch APY genannt) spiegelt den tatsächlichen Jahreszins wider, sobald monatliche, tägliche oder andere Verzinsung berücksichtigt wird — je häufiger die Verzinsung, desto größer die Lücke zwischen Sollzins und Effektivzins.</p><p><b>Kreditnehmer und Sparer</b> nutzen dies für einen fairen Vergleich von Angeboten: Zwei Kredite oder Sparkonten mit demselben beworbenen Sollzins, aber unterschiedlicher Zinsperiode, kosten oder zahlen tatsächlich unterschiedlich, und der Effektivzins ist die Zahl, die sie direkt vergleichbar macht.</p>',
            key_points: [
                '<b>Effektivzins ≥ Sollzins immer:</b> Häufigere Verzinsung führt immer zu einem Effektivzins, der gleich oder höher als der nominale Sollzins ist.',
                '<b>Formel:</b> Effektivzins = (1 + Sollzins/n)ⁿ − 1, wobei n die Anzahl der Zinsperioden pro Jahr ist.',
                '<b>Für fairen Vergleich nutzen:</b> Vergleichen Sie immer den Effektivzins, nicht den Sollzins, wenn Sie zwei Angebote mit unterschiedlicher Zinsperiode vergleichen.',
            ],
            howto: [
                { question: 'Warum ist der Effektivzins höher als der Sollzins?', answer: '<p>Weil Zinsen vor Jahresende zum Saldo hinzugefügt werden (z. B. monatlich), und diese hinzugefügten Zinsen selbst beginnen, Zinsen zu erzielen — je häufiger dies geschieht, desto größer die Lücke.</p>' },
                { question: 'Ist APY dasselbe wie Effektivzins?', answer: '<p>Ja — APY (jährliche Rendite in Prozent) wird genauso berechnet wie der Effektivzins, nur wird der Begriff für Spar- und Anlageprodukte statt für Kredite verwendet.</p>' },
            ],
            inputs: [
                { name: 'apr', label: 'Nomineller Sollzins', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
                { name: 'n', label: 'Zinsperioden pro Jahr', type: 'select', options: [
                    { value: '1', label: 'Jährlich' },
                    { value: '4', label: 'Vierteljährlich' },
                    { value: '12', label: 'Monatlich' },
                    { value: '365', label: 'Täglich' },
                ] },
            ],
            outputs: [{ name: 'ear', label: 'Effektiver Jahreszins', unit: '%', precision: 3 }],
        },
    },
}

// ============================================================
// 1024: Solve for Interest Rate Calculator
// ============================================================
const solveRate: ToolDef = {
    id: '1024',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 1000 },
            { key: 'final_amount', default: 1628.89 },
            { key: 'years', default: 10 },
        ],
        formulas: {
            rate_pct: '((final_amount/principal)^(1/years) - 1)*100',
        },
        outputs: [{ key: 'rate_pct', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'interest-rate-calculator-solve-for-rate',
            title: 'Interest Rate Calculator - Solve for Rate',
            h1: 'Interest Rate Calculator',
            meta_title: 'Interest Rate Calculator | Find the Rate from P, A, and Time',
            meta_description: 'Find the annual interest rate given a starting amount, final amount, and time period — the reverse of a compound interest calculation.',
            short_answer: 'This calculator works backward from a compound interest calculation: given how much you started with, how much you ended up with, and how long it took, it solves for the annual interest rate that connects them.',
            intro_text: '<p>Sometimes you know the beginning and ending values of an investment or debt and the time elapsed, but not the rate itself — for example, an old investment statement, a family loan, or an investment that grew from $1,000 to $1,628.89 over 10 years. This calculator solves for the annually compounded rate that explains that growth.</p><p><b>Investors reviewing past performance</b> use this to back out the effective annual return of an investment, and it\'s also useful for verifying whether an advertised or assumed rate on a loan or account actually matches its real growth history.</p>',
            key_points: [
                '<b>Reverse-Engineers the Rate:</b> Solves A = P(1+r)ⁿ for r, given P, A, and n (years).',
                '<b>Assumes Annual Compounding:</b> This calculates the equivalent annually-compounded rate; more frequent compounding at a lower stated rate could produce the same result.',
                '<b>Useful for Verification:</b> Check whether an investment\'s actual historical growth matches its advertised or expected rate.',
            ],
            howto: [
                { question: 'What if I don\'t know the exact final amount?', answer: '<p>Use your best estimate — the calculated rate will be an approximation proportional to the accuracy of your inputs. Small differences in the final amount can noticeably shift the computed rate over long periods.</p>' },
                { question: 'Does this account for additional contributions during the period?', answer: '<p>No — this assumes a single lump sum grew from the starting to the final amount with no additional deposits or withdrawals along the way.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Starting Amount', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Final Amount', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Time Period', type: 'number', unit: 'years', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Annual Interest Rate', unit: '%', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-poiska-procentnoy-stavki',
            title: 'Калькулятор поиска процентной ставки',
            h1: 'Калькулятор поиска процентной ставки',
            meta_title: 'Калькулятор ставки | Найти ставку по сумме и времени',
            meta_description: 'Найдите годовую процентную ставку по начальной сумме, конечной сумме и периоду времени.',
            short_answer: 'Этот калькулятор работает в обратную сторону от расчёта сложных процентов: зная начальную сумму, конечную сумму и время, он находит годовую ставку, которая их связывает.',
            intro_text: '<p>Иногда известны начальное и конечное значения инвестиции или долга и прошедшее время, но не сама ставка — например, старая выписка по инвестициям, семейный займ или инвестиция, выросшая с $1000 до $1628.89 за 10 лет. Калькулятор находит ежегодно капитализируемую ставку, объясняющую этот рост.</p><p><b>Инвесторы, анализирующие прошлые результаты</b>, используют это, чтобы вычислить эффективную годовую доходность инвестиции, а также чтобы проверить, соответствует ли заявленная или предполагаемая ставка по кредиту или счёту реальной истории роста.</p>',
            key_points: [
                '<b>Обратный расчёт ставки:</b> Решает A = P(1+r)ⁿ относительно r, зная P, A и n (лет).',
                '<b>Предполагает годовую капитализацию:</b> Рассчитывается эквивалентная ежегодно капитализируемая ставка; более частая капитализация при меньшей заявленной ставке может дать тот же результат.',
                '<b>Полезно для проверки:</b> Проверьте, соответствует ли реальный исторический рост инвестиции заявленной или ожидаемой ставке.',
            ],
            howto: [
                { question: 'Что если я не знаю точную конечную сумму?', answer: '<p>Используйте лучшую оценку — рассчитанная ставка будет приближением, пропорциональным точности ваших данных. Небольшие различия в конечной сумме могут заметно сдвинуть рассчитанную ставку за долгий период.</p>' },
                { question: 'Учитывает ли это дополнительные взносы в течение периода?', answer: '<p>Нет — предполагается, что единовременная сумма выросла с начальной до конечной без дополнительных вкладов или снятий по пути.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Начальная сумма', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Конечная сумма', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Период времени', type: 'number', unit: 'лет', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Годовая процентная ставка', unit: '%', precision: 2 }],
        },
        lv: {
            slug: 'procentu-likmes-atrasanas-kalkulators',
            title: 'Procentu Likmes Atrašanas Kalkulators',
            h1: 'Procentu Likmes Atrašanas Kalkulators',
            meta_title: 'Likmes Kalkulators | Atrodiet Likmi no Summas un Laika',
            meta_description: 'Atrodiet gada procentu likmi, zinot sākuma summu, gala summu un laika periodu.',
            short_answer: 'Šis kalkulators darbojas pretējā virzienā no salikto procentu aprēķina: zinot, ar cik sākāt, cik ieguvāt un cik ilgi tas aizņēma, tas atrisina gada procentu likmi, kas tos savieno.',
            intro_text: '<p>Dažreiz jūs zināt investīcijas vai parāda sākuma un beigu vērtības un pagājušo laiku, bet ne pašu likmi — piemēram, vecu investīciju izrakstu, ģimenes aizdevumu vai investīciju, kas 10 gadu laikā izauga no $1000 līdz $1628.89. Kalkulators atrisina gada kapitalizācijas likmi, kas izskaidro šo pieaugumu.</p><p><b>Investori, kas pārskata pagātnes rezultātus</b>, to izmanto, lai aprēķinātu investīcijas efektīvo gada ienesīgumu, un tas noder arī, lai pārbaudītu, vai reklamētā vai pieņemtā likme aizdevumam vai kontam atbilst reālajai izaugsmes vēsturei.</p>',
            key_points: [
                '<b>Aprēķina likmi pretējā virzienā:</b> Atrisina A = P(1+r)ⁿ attiecībā pret r, zinot P, A un n (gadus).',
                '<b>Pieņem gada kapitalizāciju:</b> Aprēķina ekvivalento gada kapitalizācijas likmi; biežāka kapitalizācija ar zemāku norādīto likmi varētu dot to pašu rezultātu.',
                '<b>Noderīgi verifikācijai:</b> Pārbaudiet, vai investīcijas reālā vēsturiskā izaugsme atbilst reklamētajai vai gaidītajai likmei.',
            ],
            howto: [
                { question: 'Ko darīt, ja nezinu precīzu gala summu?', answer: '<p>Izmantojiet labāko novērtējumu — aprēķinātā likme būs tuvinājums, proporcionāls jūsu ievadīto datu precizitātei. Nelielas atšķirības gala summā var manāmi mainīt aprēķināto likmi ilgā periodā.</p>' },
                { question: 'Vai tas ņem vērā papildu iemaksas perioda laikā?', answer: '<p>Nē — tiek pieņemts, ka viena summa izauga no sākuma līdz gala summai bez papildu iemaksām vai izņemšanas pa ceļam.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Sākuma Summa', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Gala Summa', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Laika Periods', type: 'number', unit: 'gadi', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Gada Procentu Likme', unit: '%', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-wyznaczania-stopy-procentowej',
            title: 'Kalkulator Wyznaczania Stopy Procentowej',
            h1: 'Kalkulator Wyznaczania Stopy Procentowej',
            meta_title: 'Kalkulator Stopy | Znajdź Stopę z Kwoty i Czasu',
            meta_description: 'Znajdź roczną stopę procentową na podstawie kwoty początkowej, kwoty końcowej i okresu czasu.',
            short_answer: 'Ten kalkulator działa w odwrotnym kierunku od obliczenia procentu składanego: znając kwotę początkową, kwotę końcową i czas, wyznacza roczną stopę procentową, która je łączy.',
            intro_text: '<p>Czasami znasz początkową i końcową wartość inwestycji lub długu oraz upływający czas, ale nie samą stopę — na przykład stare zestawienie inwestycyjne, pożyczkę rodzinną lub inwestycję, która wzrosła z 1000 do 1628,89 w ciągu 10 lat. Kalkulator wyznacza rocznie kapitalizowaną stopę, która wyjaśnia ten wzrost.</p><p><b>Inwestorzy przeglądający wyniki historyczne</b> używają tego, aby wyliczyć efektywny roczny zwrot z inwestycji, a także aby sprawdzić, czy reklamowana lub zakładana stopa kredytu bądź konta rzeczywiście odpowiada rzeczywistej historii wzrostu.</p>',
            key_points: [
                '<b>Odwraca obliczenie stopy:</b> Rozwiązuje A = P(1+r)ⁿ względem r, znając P, A i n (lata).',
                '<b>Zakłada roczną kapitalizację:</b> Oblicza równoważną rocznie kapitalizowaną stopę; częstsza kapitalizacja przy niższej podanej stopie może dać ten sam wynik.',
                '<b>Przydatne do weryfikacji:</b> Sprawdź, czy rzeczywisty historyczny wzrost inwestycji odpowiada reklamowanej lub oczekiwanej stopie.',
            ],
            howto: [
                { question: 'Co jeśli nie znam dokładnej kwoty końcowej?', answer: '<p>Użyj najlepszego oszacowania — obliczona stopa będzie przybliżeniem proporcjonalnym do dokładności danych wejściowych. Małe różnice w kwocie końcowej mogą zauważalnie zmienić obliczoną stopę w długim okresie.</p>' },
                { question: 'Czy to uwzględnia dodatkowe wpłaty w trakcie okresu?', answer: '<p>Nie — zakłada się, że jednorazowa kwota wzrosła z początkowej do końcowej bez dodatkowych wpłat lub wypłat po drodze.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Początkowa', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Kwota Końcowa', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Okres Czasu', type: 'number', unit: 'lat', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Roczna Stopa Procentowa', unit: '%', precision: 2 }],
        },
        es: {
            slug: 'calculadora-tasa-interes-despejar-tasa',
            title: 'Calculadora de Tasa de Interés - Despejar la Tasa',
            h1: 'Calculadora de Tasa de Interés',
            meta_title: 'Calculadora de Tasa | Encuentra la Tasa a partir de P, A y Tiempo',
            meta_description: 'Encuentra la tasa de interés anual dado un monto inicial, un monto final y un período de tiempo.',
            short_answer: 'Esta calculadora funciona a la inversa de un cálculo de interés compuesto: dado cuánto empezaste, cuánto terminaste teniendo y cuánto tiempo tomó, despeja la tasa de interés anual que los conecta.',
            intro_text: '<p>A veces conoces los valores inicial y final de una inversión o deuda y el tiempo transcurrido, pero no la tasa en sí — por ejemplo, un estado de cuenta de inversión antiguo, un préstamo familiar, o una inversión que creció de $1,000 a $1,628.89 en 10 años. Esta calculadora despeja la tasa compuesta anualmente que explica ese crecimiento.</p><p><b>Los inversores que revisan el rendimiento pasado</b> usan esto para calcular el retorno anual efectivo de una inversión, y también es útil para verificar si una tasa anunciada o asumida en un préstamo o cuenta realmente coincide con su historial de crecimiento real.</p>',
            key_points: [
                '<b>Calcula la tasa a la inversa:</b> Resuelve A = P(1+r)ⁿ para r, dados P, A y n (años).',
                '<b>Asume capitalización anual:</b> Esto calcula la tasa equivalente compuesta anualmente; una capitalización más frecuente a una tasa nominal menor podría producir el mismo resultado.',
                '<b>Útil para verificación:</b> Comprueba si el crecimiento histórico real de una inversión coincide con su tasa anunciada o esperada.',
            ],
            howto: [
                { question: '¿Qué pasa si no conozco el monto final exacto?', answer: '<p>Usa tu mejor estimación — la tasa calculada será una aproximación proporcional a la precisión de tus datos. Pequeñas diferencias en el monto final pueden desplazar notablemente la tasa calculada en períodos largos.</p>' },
                { question: '¿Esto considera aportaciones adicionales durante el período?', answer: '<p>No — se asume que una suma única creció desde el monto inicial hasta el final sin depósitos ni retiros adicionales en el camino.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto Inicial', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Monto Final', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Período de Tiempo', type: 'number', unit: 'años', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Tasa de Interés Anual', unit: '%', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-taux-interet-resoudre-taux',
            title: 'Calculateur de Taux d’Intérêt - Résoudre le Taux',
            h1: 'Calculateur de Taux d’Intérêt',
            meta_title: 'Calculateur de Taux | Trouver le Taux à partir de P, A et Temps',
            meta_description: 'Trouvez le taux d’intérêt annuel à partir d’un montant de départ, d’un montant final et d’une période de temps.',
            short_answer: 'Ce calculateur fonctionne à l’inverse d’un calcul d’intérêt composé : connaissant le montant de départ, le montant final et le temps écoulé, il résout le taux d’intérêt annuel qui les relie.',
            intro_text: '<p>Parfois, vous connaissez les valeurs de départ et de fin d’un investissement ou d’une dette et le temps écoulé, mais pas le taux lui-même — par exemple, un ancien relevé d’investissement, un prêt familial, ou un investissement passé de 1 000 $ à 1 628,89 $ en 10 ans. Ce calculateur résout le taux composé annuellement qui explique cette croissance.</p><p><b>Les investisseurs qui examinent les performances passées</b> utilisent cela pour déduire le rendement annuel effectif d’un investissement, et c’est aussi utile pour vérifier si un taux annoncé ou supposé sur un prêt ou un compte correspond réellement à son historique de croissance réel.</p>',
            key_points: [
                '<b>Calcule le taux à l’inverse :</b> Résout A = P(1+r)ⁿ pour r, connaissant P, A et n (années).',
                '<b>Suppose une capitalisation annuelle :</b> Ceci calcule le taux équivalent composé annuellement ; une capitalisation plus fréquente à un taux nominal plus bas pourrait produire le même résultat.',
                '<b>Utile pour la vérification :</b> Vérifiez si la croissance historique réelle d’un investissement correspond à son taux annoncé ou attendu.',
            ],
            howto: [
                { question: 'Que faire si je ne connais pas le montant final exact ?', answer: '<p>Utilisez votre meilleure estimation — le taux calculé sera une approximation proportionnelle à la précision de vos données. De petites différences dans le montant final peuvent déplacer sensiblement le taux calculé sur de longues périodes.</p>' },
                { question: 'Cela tient-il compte des contributions supplémentaires pendant la période ?', answer: '<p>Non — cela suppose qu’une somme forfaitaire unique a évolué du montant de départ au montant final sans dépôts ni retraits supplémentaires en cours de route.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant de Départ', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Montant Final', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Période', type: 'number', unit: 'ans', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Taux d’Intérêt Annuel', unit: '%', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-tasso-interesse-risolvi-tasso',
            title: 'Calcolatore Tasso di Interesse - Risolvi il Tasso',
            h1: 'Calcolatore Tasso di Interesse',
            meta_title: 'Calcolatore Tasso | Trova il Tasso da P, A e Tempo',
            meta_description: 'Trova il tasso di interesse annuo dato un importo iniziale, un importo finale e un periodo di tempo.',
            short_answer: 'Questo calcolatore funziona al contrario rispetto a un calcolo di interesse composto: dato quanto hai iniziato, quanto hai finito per avere e quanto tempo ci è voluto, risolve il tasso di interesse annuo che li collega.',
            intro_text: '<p>A volte conosci i valori iniziale e finale di un investimento o debito e il tempo trascorso, ma non il tasso stesso — ad esempio, un vecchio estratto conto di investimento, un prestito familiare, o un investimento cresciuto da 1.000 a 1.628,89 in 10 anni. Questo calcolatore risolve il tasso composto annualmente che spiega questa crescita.</p><p><b>Gli investitori che rivedono le prestazioni passate</b> usano questo per dedurre il rendimento annuo effettivo di un investimento, ed è utile anche per verificare se un tasso pubblicizzato o assunto su un prestito o conto corrisponde realmente alla sua vera storia di crescita.</p>',
            key_points: [
                '<b>Ricava il tasso a ritroso:</b> Risolve A = P(1+r)ⁿ per r, dati P, A e n (anni).',
                '<b>Presuppone capitalizzazione annuale:</b> Questo calcola il tasso equivalente capitalizzato annualmente; una capitalizzazione più frequente a un tasso nominale inferiore potrebbe produrre lo stesso risultato.',
                '<b>Utile per la verifica:</b> Controlla se la crescita storica reale di un investimento corrisponde al tasso pubblicizzato o atteso.',
            ],
            howto: [
                { question: 'Cosa succede se non conosco l’importo finale esatto?', answer: '<p>Usa la tua migliore stima — il tasso calcolato sarà un’approssimazione proporzionale alla precisione dei tuoi dati. Piccole differenze nell’importo finale possono spostare notevolmente il tasso calcolato su periodi lunghi.</p>' },
                { question: 'Questo considera contributi aggiuntivi durante il periodo?', answer: '<p>No — si presume che una somma unica sia cresciuta dall’importo iniziale a quello finale senza depositi o prelievi aggiuntivi lungo il percorso.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo Iniziale', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Importo Finale', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Periodo di Tempo', type: 'number', unit: 'anni', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Tasso di Interesse Annuo', unit: '%', precision: 2 }],
        },
        de: {
            slug: 'zinssatz-rechner-nach-satz-aufloesen',
            title: 'Zinssatz-Rechner - Nach dem Zinssatz Auflösen',
            h1: 'Zinssatz-Rechner',
            meta_title: 'Zinssatz-Rechner | Zinssatz aus Betrag und Zeit Ermitteln',
            meta_description: 'Ermitteln Sie den jährlichen Zinssatz anhand eines Anfangsbetrags, Endbetrags und Zeitraums.',
            short_answer: 'Dieser Rechner arbeitet rückwärts von einer Zinseszinsberechnung: Ausgehend davon, womit Sie begonnen haben, was am Ende herauskam und wie lange es dauerte, löst er nach dem jährlichen Zinssatz auf, der beides verbindet.',
            intro_text: '<p>Manchmal kennen Sie den Anfangs- und Endwert einer Anlage oder Schuld sowie die vergangene Zeit, aber nicht den Zinssatz selbst — zum Beispiel ein alter Anlagekontoauszug, ein Familienkredit, oder eine Anlage, die in 10 Jahren von 1.000 $ auf 1.628,89 $ gewachsen ist. Dieser Rechner löst nach dem jährlich verzinsten Zinssatz auf, der dieses Wachstum erklärt.</p><p><b>Anleger, die vergangene Performance überprüfen</b>, nutzen dies, um die effektive jährliche Rendite einer Anlage zu ermitteln, und es ist auch nützlich, um zu prüfen, ob ein beworbener oder angenommener Zinssatz eines Kredits oder Kontos tatsächlich seiner realen Wachstumsgeschichte entspricht.</p>',
            key_points: [
                '<b>Ermittelt den Zinssatz rückwärts:</b> Löst A = P(1+r)ⁿ nach r auf, gegeben P, A und n (Jahre).',
                '<b>Setzt jährliche Verzinsung voraus:</b> Dies berechnet den äquivalenten jährlich verzinsten Satz; häufigere Verzinsung bei einem niedrigeren angegebenen Satz könnte dasselbe Ergebnis liefern.',
                '<b>Nützlich zur Überprüfung:</b> Prüfen Sie, ob das tatsächliche historische Wachstum einer Anlage dem beworbenen oder erwarteten Zinssatz entspricht.',
            ],
            howto: [
                { question: 'Was, wenn ich den genauen Endbetrag nicht kenne?', answer: '<p>Verwenden Sie Ihre beste Schätzung — der berechnete Zinssatz ist eine Annäherung proportional zur Genauigkeit Ihrer Eingaben. Kleine Unterschiede im Endbetrag können den berechneten Zinssatz über lange Zeiträume merklich verschieben.</p>' },
                { question: 'Berücksichtigt dies zusätzliche Einzahlungen während des Zeitraums?', answer: '<p>Nein — es wird angenommen, dass ein einmaliger Betrag ohne zusätzliche Einzahlungen oder Abhebungen unterwegs vom Anfangs- zum Endbetrag gewachsen ist.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Anfangsbetrag', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1000' },
                { name: 'final_amount', label: 'Endbetrag', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '1628.89' },
                { name: 'years', label: 'Zeitraum', type: 'number', unit: 'Jahre', min: 0.1, max: 100, placeholder: '10' },
            ],
            outputs: [{ name: 'rate_pct', label: 'Jährlicher Zinssatz', unit: '%', precision: 2 }],
        },
    },
}

// ============================================================
// 1025: Rule of 72 (Doubling Time) Calculator
// ============================================================
const ruleOf72: ToolDef = {
    id: '1025',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'rate_pct', default: 8 },
        ],
        formulas: {
            years_approx: '72/rate_pct',
            years_exact: 'log(2)/log(1+rate_pct/100)',
        },
        outputs: [
            { key: 'years_approx', precision: 1 },
            { key: 'years_exact', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'rule-of-72-calculator-doubling-time',
            title: 'Rule of 72 Calculator - Doubling Time',
            h1: 'Rule of 72 Calculator',
            meta_title: 'Rule of 72 Calculator | How Long to Double Your Money',
            meta_description: 'Calculate how many years it takes to double your money at a given annual interest rate, using both the classic Rule of 72 shortcut and the exact formula.',
            short_answer: 'This calculator shows how many years it takes for an investment to double at a given annual rate — using both the famous "Rule of 72" mental-math shortcut and the exact logarithmic formula for comparison.',
            intro_text: '<p>The Rule of 72 is a quick mental-math shortcut: divide 72 by the annual interest rate to estimate how many years it takes for an investment to double. It\'s remarkably accurate for rates between roughly 6% and 10%, and a handy way to build intuition about compounding without a calculator.</p><p><b>Investors</b> use this to quickly gauge the power of different return rates — the difference between a 4% and 8% return isn\'t just "twice as fast," it\'s the difference between 18 years and 9 years to double an investment.</p>',
            key_points: [
                '<b>Quick Mental Math:</b> Years to double ≈ 72 ÷ rate — no calculator needed for a rough estimate.',
                '<b>Most Accurate Near 8%:</b> The approximation is closest to the exact answer for rates in the 6-10% range; it drifts more at very low or very high rates.',
                '<b>Exact Formula Included:</b> Years = ln(2) / ln(1 + rate) gives the precise answer for any rate.',
            ],
            howto: [
                { question: 'Why 72 specifically?', answer: '<p>72 has many small divisors (1, 2, 3, 4, 6, 8, 9, 12...), making it easy to divide by common interest rates mentally, and it happens to approximate ln(2)×100 closely across typical rates.</p>' },
                { question: 'Does the Rule of 72 work for high inflation or very high rates?', answer: '<p>It becomes less accurate outside the roughly 6-10% range — for very high rates, some use the "Rule of 69.3" or "Rule of 70" instead, or just use the exact formula shown here.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Doubling Time (Rule of 72)', unit: 'years', precision: 1 },
                { name: 'years_exact', label: 'Doubling Time (Exact)', unit: 'years', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-pravila-72-udvoenie-summy',
            title: 'Калькулятор правила 72 - удвоение суммы',
            h1: 'Калькулятор правила 72',
            meta_title: 'Калькулятор правила 72 | Сколько времени нужно, чтобы удвоить деньги',
            meta_description: 'Рассчитайте, сколько лет нужно, чтобы удвоить сумму при заданной годовой ставке, по правилу 72 и по точной формуле.',
            short_answer: 'Этот калькулятор показывает, сколько лет нужно, чтобы инвестиция удвоилась при заданной годовой ставке — используя как знаменитое «правило 72» для устного счёта, так и точную логарифмическую формулу для сравнения.',
            intro_text: '<p>Правило 72 — быстрый способ устного счёта: разделите 72 на годовую процентную ставку, чтобы оценить, сколько лет нужно для удвоения инвестиции. Оно удивительно точно для ставок примерно от 6% до 10% и удобно для интуитивного понимания капитализации без калькулятора.</p><p><b>Инвесторы</b> используют это, чтобы быстро оценить силу разных ставок доходности — разница между 4% и 8% доходностью — это не просто «в два раза быстрее», это разница между 18 и 9 годами для удвоения инвестиции.</p>',
            key_points: [
                '<b>Быстрый устный расчёт:</b> Годы для удвоения ≈ 72 ÷ ставка — калькулятор не нужен для грубой оценки.',
                '<b>Наиболее точно около 8%:</b> Приближение ближе всего к точному ответу для ставок 6-10%; отклоняется больше при очень низких или высоких ставках.',
                '<b>Точная формула включена:</b> Годы = ln(2) / ln(1 + ставка) даёт точный ответ для любой ставки.',
            ],
            howto: [
                { question: 'Почему именно 72?', answer: '<p>У 72 много малых делителей (1, 2, 3, 4, 6, 8, 9, 12...), что упрощает деление на распространённые ставки в уме, и оно близко приближает ln(2)×100 для типичных ставок.</p>' },
                { question: 'Работает ли правило 72 при высокой инфляции или очень высоких ставках?', answer: '<p>Оно становится менее точным вне диапазона примерно 6-10% — для очень высоких ставок иногда используют «правило 69.3» или «правило 70», либо просто точную формулу, приведённую здесь.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Время удвоения (правило 72)', unit: 'лет', precision: 1 },
                { name: 'years_exact', label: 'Время удвоения (точное)', unit: 'лет', precision: 2 },
            ],
        },
        lv: {
            slug: '72-noteikuma-kalkulators-dubultosanas-laiks',
            title: '72 Noteikuma Kalkulators - Dubultošanās Laiks',
            h1: '72 Noteikuma Kalkulators',
            meta_title: '72 Noteikuma Kalkulators | Cik Ilgi Dubultot Naudu',
            meta_description: 'Aprēķiniet, cik gadu nepieciešams, lai dubultotu summu pie noteiktas gada likmes, izmantojot 72 noteikumu un precīzo formulu.',
            short_answer: 'Šis kalkulators parāda, cik gadu nepieciešams, lai investīcija dubultotos pie noteiktas gada likmes — izmantojot gan slaveno "72 noteikumu" prāta aprēķinam, gan precīzo logaritmisko formulu salīdzināšanai.',
            intro_text: '<p>72 noteikums ir ātrs prāta aprēķina paņēmiens: daliet 72 ar gada procentu likmi, lai novērtētu, cik gadu nepieciešams investīcijas dubultošanai. Tas ir pārsteidzoši precīzs likmēm no aptuveni 6% līdz 10% un noder, lai bez kalkulatora intuitīvi saprastu kapitalizāciju.</p><p><b>Investori</b> to izmanto, lai ātri novērtētu dažādu ienesīguma likmju spēku — atšķirība starp 4% un 8% ienesīgumu nav vienkārši "divreiz ātrāk", tā ir atšķirība starp 18 un 9 gadiem investīcijas dubultošanai.</p>',
            key_points: [
                '<b>Ātrs prāta aprēķins:</b> Gadi dubultošanai ≈ 72 ÷ likme — kalkulators nav vajadzīgs aptuvenam novērtējumam.',
                '<b>Visprecīzākais ap 8%:</b> Tuvinājums ir vistuvāk precīzajai atbildei likmēm 6-10% diapazonā; tas novirzās vairāk pie ļoti zemām vai augstām likmēm.',
                '<b>Iekļauta precīzā formula:</b> Gadi = ln(2) / ln(1 + likme) dod precīzu atbildi jebkurai likmei.',
            ],
            howto: [
                { question: 'Kāpēc tieši 72?', answer: '<p>72 ir daudz mazu dalītāju (1, 2, 3, 4, 6, 8, 9, 12...), kas atvieglo dalīšanu ar izplatītām likmēm prātā, un tas tuvina ln(2)×100 tipiskām likmēm.</p>' },
                { question: 'Vai 72 noteikums darbojas augstas inflācijas vai ļoti augstu likmju gadījumā?', answer: '<p>Tas kļūst mazāk precīzs ārpus aptuveni 6-10% diapazona — ļoti augstām likmēm dažreiz izmanto "69.3 noteikumu" vai "70 noteikumu", vai vienkārši šeit doto precīzo formulu.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Dubultošanās Laiks (72 noteikums)', unit: 'gadi', precision: 1 },
                { name: 'years_exact', label: 'Dubultošanās Laiks (precīzs)', unit: 'gadi', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-reguly-72-czas-podwojenia',
            title: 'Kalkulator Reguły 72 - Czas Podwojenia',
            h1: 'Kalkulator Reguły 72',
            meta_title: 'Kalkulator Reguły 72 | Ile Czasu na Podwojenie Pieniędzy',
            meta_description: 'Oblicz, ile lat zajmie podwojenie kwoty przy danej rocznej stopie procentowej, korzystając z reguły 72 i dokładnego wzoru.',
            short_answer: 'Ten kalkulator pokazuje, ile lat zajmuje podwojenie inwestycji przy danej rocznej stopie — używając słynnej "Reguły 72" do obliczeń w pamięci oraz dokładnego wzoru logarytmicznego do porównania.',
            intro_text: '<p>Reguła 72 to szybki sposób obliczeń w pamięci: podziel 72 przez roczną stopę procentową, aby oszacować, ile lat zajmie podwojenie inwestycji. Jest zaskakująco dokładna dla stóp w zakresie około 6-10% i przydatna do intuicyjnego zrozumienia kapitalizacji bez kalkulatora.</p><p><b>Inwestorzy</b> używają tego, aby szybko ocenić siłę różnych stóp zwrotu — różnica między zwrotem 4% a 8% to nie tylko "dwa razy szybciej", to różnica między 18 a 9 latami do podwojenia inwestycji.</p>',
            key_points: [
                '<b>Szybkie obliczenia w pamięci:</b> Lata do podwojenia ≈ 72 ÷ stopa — kalkulator nie jest potrzebny do przybliżonego oszacowania.',
                '<b>Najdokładniejsza blisko 8%:</b> Przybliżenie jest najbliższe dokładnej odpowiedzi dla stóp w zakresie 6-10%; odchyla się bardziej przy bardzo niskich lub wysokich stopach.',
                '<b>Dołączono dokładny wzór:</b> Lata = ln(2) / ln(1 + stopa) daje precyzyjną odpowiedź dla dowolnej stopy.',
            ],
            howto: [
                { question: 'Dlaczego akurat 72?', answer: '<p>72 ma wiele małych dzielników (1, 2, 3, 4, 6, 8, 9, 12...), co ułatwia dzielenie przez typowe stopy procentowe w pamięci, i blisko przybliża ln(2)×100 dla typowych stóp.</p>' },
                { question: 'Czy reguła 72 działa przy wysokiej inflacji lub bardzo wysokich stopach?', answer: '<p>Staje się mniej dokładna poza zakresem około 6-10% — dla bardzo wysokich stóp czasem używa się "reguły 69,3" lub "reguły 70", albo po prostu dokładnego wzoru pokazanego tutaj.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Czas Podwojenia (Reguła 72)', unit: 'lat', precision: 1 },
                { name: 'years_exact', label: 'Czas Podwojenia (Dokładny)', unit: 'lat', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-regla-del-72-tiempo-duplicacion',
            title: 'Calculadora de la Regla del 72 - Tiempo de Duplicación',
            h1: 'Calculadora de la Regla del 72',
            meta_title: 'Calculadora Regla del 72 | Cuánto Tiempo para Duplicar tu Dinero',
            meta_description: 'Calcula cuántos años toma duplicar tu dinero a una tasa de interés anual dada, con la regla del 72 y la fórmula exacta.',
            short_answer: 'Esta calculadora muestra cuántos años toma que una inversión se duplique a una tasa anual dada — usando tanto el famoso atajo mental de la "Regla del 72" como la fórmula logarítmica exacta para comparar.',
            intro_text: '<p>La Regla del 72 es un atajo mental rápido: divide 72 entre la tasa de interés anual para estimar cuántos años toma que una inversión se duplique. Es notablemente precisa para tasas entre aproximadamente 6% y 10%, y una forma práctica de entender la capitalización sin calculadora.</p><p><b>Los inversores</b> usan esto para evaluar rápidamente el poder de diferentes tasas de retorno — la diferencia entre un retorno del 4% y del 8% no es solo "el doble de rápido", es la diferencia entre 18 años y 9 años para duplicar una inversión.</p>',
            key_points: [
                '<b>Cálculo mental rápido:</b> Años para duplicar ≈ 72 ÷ tasa — no se necesita calculadora para una estimación aproximada.',
                '<b>Más precisa cerca del 8%:</b> La aproximación está más cerca de la respuesta exacta para tasas en el rango de 6-10%; se desvía más en tasas muy bajas o muy altas.',
                '<b>Fórmula exacta incluida:</b> Años = ln(2) / ln(1 + tasa) da la respuesta precisa para cualquier tasa.',
            ],
            howto: [
                { question: '¿Por qué específicamente 72?', answer: '<p>72 tiene muchos divisores pequeños (1, 2, 3, 4, 6, 8, 9, 12...), lo que facilita dividir mentalmente por tasas de interés comunes, y se aproxima bastante a ln(2)×100 en tasas típicas.</p>' },
                { question: '¿Funciona la Regla del 72 con inflación alta o tasas muy altas?', answer: '<p>Se vuelve menos precisa fuera del rango aproximado de 6-10% — para tasas muy altas, algunos usan la "Regla del 69.3" o "Regla del 70", o simplemente la fórmula exacta mostrada aquí.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Tiempo de Duplicación (Regla del 72)', unit: 'años', precision: 1 },
                { name: 'years_exact', label: 'Tiempo de Duplicación (Exacto)', unit: 'años', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-regle-de-72-temps-de-doublement',
            title: 'Calculateur de la Règle de 72 - Temps de Doublement',
            h1: 'Calculateur de la Règle de 72',
            meta_title: 'Calculateur Règle de 72 | Combien de Temps pour Doubler son Argent',
            meta_description: 'Calculez combien d’années il faut pour doubler votre argent à un taux d’intérêt annuel donné, avec la règle de 72 et la formule exacte.',
            short_answer: 'Ce calculateur montre combien d’années il faut pour qu’un investissement double à un taux annuel donné — en utilisant à la fois la célèbre astuce mentale de la "Règle de 72" et la formule logarithmique exacte pour comparer.',
            intro_text: '<p>La Règle de 72 est une astuce de calcul mental rapide : divisez 72 par le taux d’intérêt annuel pour estimer combien d’années il faut pour qu’un investissement double. Elle est remarquablement précise pour des taux entre environ 6 % et 10 %, et pratique pour comprendre intuitivement la capitalisation sans calculatrice.</p><p><b>Les investisseurs</b> utilisent cela pour évaluer rapidement la puissance de différents taux de rendement — la différence entre un rendement de 4 % et de 8 % n’est pas simplement "deux fois plus rapide", c’est la différence entre 18 ans et 9 ans pour doubler un investissement.</p>',
            key_points: [
                '<b>Calcul mental rapide :</b> Années pour doubler ≈ 72 ÷ taux — pas besoin de calculatrice pour une estimation approximative.',
                '<b>Plus précis près de 8 % :</b> L’approximation est la plus proche de la réponse exacte pour des taux dans la plage de 6-10 % ; elle dérive davantage pour des taux très bas ou très élevés.',
                '<b>Formule exacte incluse :</b> Années = ln(2) / ln(1 + taux) donne la réponse précise pour n’importe quel taux.',
            ],
            howto: [
                { question: 'Pourquoi spécifiquement 72 ?', answer: '<p>72 a de nombreux petits diviseurs (1, 2, 3, 4, 6, 8, 9, 12...), ce qui facilite la division mentale par des taux d’intérêt courants, et il se rapproche étroitement de ln(2)×100 pour des taux typiques.</p>' },
                { question: 'La Règle de 72 fonctionne-t-elle avec une inflation élevée ou des taux très élevés ?', answer: '<p>Elle devient moins précise en dehors de la plage d’environ 6-10 % — pour des taux très élevés, certains utilisent la "Règle de 69,3" ou la "Règle de 70", ou simplement la formule exacte présentée ici.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Temps de Doublement (Règle de 72)', unit: 'ans', precision: 1 },
                { name: 'years_exact', label: 'Temps de Doublement (Exact)', unit: 'ans', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-regola-del-72-tempo-di-raddoppio',
            title: 'Calcolatore Regola del 72 - Tempo di Raddoppio',
            h1: 'Calcolatore Regola del 72',
            meta_title: 'Calcolatore Regola del 72 | Quanto Tempo per Raddoppiare i Soldi',
            meta_description: 'Calcola quanti anni servono per raddoppiare i tuoi soldi a un dato tasso di interesse annuo, con la regola del 72 e la formula esatta.',
            short_answer: 'Questo calcolatore mostra quanti anni servono affinché un investimento raddoppi a un dato tasso annuo — usando sia la famosa scorciatoia mentale della "Regola del 72" sia la formula logaritmica esatta per confronto.',
            intro_text: '<p>La Regola del 72 è una rapida scorciatoia di calcolo mentale: dividi 72 per il tasso di interesse annuo per stimare quanti anni servono affinché un investimento raddoppi. È notevolmente accurata per tassi tra circa il 6% e il 10%, ed è un modo pratico per capire intuitivamente la capitalizzazione senza calcolatrice.</p><p><b>Gli investitori</b> usano questo per valutare rapidamente la potenza di diversi tassi di rendimento — la differenza tra un rendimento del 4% e dell’8% non è solo "il doppio più veloce", è la differenza tra 18 anni e 9 anni per raddoppiare un investimento.</p>',
            key_points: [
                '<b>Calcolo mentale rapido:</b> Anni per raddoppiare ≈ 72 ÷ tasso — non serve una calcolatrice per una stima approssimativa.',
                '<b>Più accurata vicino all’8%:</b> L’approssimazione è più vicina alla risposta esatta per tassi nell’intervallo 6-10%; si discosta di più a tassi molto bassi o molto alti.',
                '<b>Formula esatta inclusa:</b> Anni = ln(2) / ln(1 + tasso) dà la risposta precisa per qualsiasi tasso.',
            ],
            howto: [
                { question: 'Perché proprio 72?', answer: '<p>72 ha molti piccoli divisori (1, 2, 3, 4, 6, 8, 9, 12...), rendendo facile la divisione mentale per tassi di interesse comuni, e si avvicina molto a ln(2)×100 per tassi tipici.</p>' },
                { question: 'La Regola del 72 funziona con inflazione alta o tassi molto alti?', answer: '<p>Diventa meno accurata al di fuori dell’intervallo circa 6-10% — per tassi molto alti, alcuni usano la "Regola del 69,3" o la "Regola del 70", oppure semplicemente la formula esatta mostrata qui.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Tempo di Raddoppio (Regola del 72)', unit: 'anni', precision: 1 },
                { name: 'years_exact', label: 'Tempo di Raddoppio (Esatto)', unit: 'anni', precision: 2 },
            ],
        },
        de: {
            slug: '72er-regel-rechner-verdoppelungszeit',
            title: '72er-Regel-Rechner - Verdoppelungszeit',
            h1: '72er-Regel-Rechner',
            meta_title: '72er-Regel-Rechner | Wie Lange bis zur Verdoppelung des Geldes',
            meta_description: 'Berechnen Sie, wie viele Jahre es dauert, Ihr Geld bei einem gegebenen Jahreszins zu verdoppeln, mit der 72er-Regel und der exakten Formel.',
            short_answer: 'Dieser Rechner zeigt, wie viele Jahre es dauert, bis sich eine Anlage bei einem gegebenen Jahreszins verdoppelt — sowohl mit der berühmten "72er-Regel" für Kopfrechnen als auch mit der exakten logarithmischen Formel zum Vergleich.',
            intro_text: '<p>Die 72er-Regel ist eine schnelle Kopfrechen-Abkürzung: Teilen Sie 72 durch den Jahreszins, um zu schätzen, wie viele Jahre es dauert, bis sich eine Anlage verdoppelt. Sie ist bemerkenswert genau für Zinssätze zwischen etwa 6 % und 10 % und eine praktische Möglichkeit, ein Gefühl für Zinseszins ohne Rechner zu entwickeln.</p><p><b>Anleger</b> nutzen dies, um die Kraft verschiedener Renditen schnell einzuschätzen — der Unterschied zwischen 4 % und 8 % Rendite ist nicht nur "doppelt so schnell", es ist der Unterschied zwischen 18 Jahren und 9 Jahren bis zur Verdoppelung einer Anlage.</p>',
            key_points: [
                '<b>Schnelles Kopfrechnen:</b> Jahre bis zur Verdoppelung ≈ 72 ÷ Zinssatz — kein Rechner für eine grobe Schätzung nötig.',
                '<b>Am genauesten nahe 8 %:</b> Die Näherung liegt für Zinssätze im Bereich 6-10 % am nächsten an der exakten Antwort; bei sehr niedrigen oder hohen Zinssätzen weicht sie stärker ab.',
                '<b>Exakte Formel enthalten:</b> Jahre = ln(2) / ln(1 + Zinssatz) liefert die genaue Antwort für jeden Zinssatz.',
            ],
            howto: [
                { question: 'Warum genau 72?', answer: '<p>72 hat viele kleine Teiler (1, 2, 3, 4, 6, 8, 9, 12...), was das Teilen durch gängige Zinssätze im Kopf erleichtert, und es nähert sich eng an ln(2)×100 für typische Zinssätze an.</p>' },
                { question: 'Funktioniert die 72er-Regel bei hoher Inflation oder sehr hohen Zinssätzen?', answer: '<p>Sie wird außerhalb des Bereichs von etwa 6-10 % ungenauer — für sehr hohe Zinssätze verwenden manche stattdessen die "69,3er-Regel" oder "70er-Regel", oder einfach die hier gezeigte exakte Formel.</p>' },
            ],
            inputs: [
                { name: 'rate_pct', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0.1, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'years_approx', label: 'Verdoppelungszeit (72er-Regel)', unit: 'Jahre', precision: 1 },
                { name: 'years_exact', label: 'Verdoppelungszeit (Exakt)', unit: 'Jahre', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1026: Continuous Compounding Calculator
// ============================================================
const continuousCompounding: ToolDef = {
    id: '1026',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 1000 },
            { key: 'rate_pct', default: 5 },
            { key: 'years', default: 10 },
        ],
        formulas: {
            final_amount: 'principal*e^(rate_pct/100*years)',
            interest_earned: 'principal*e^(rate_pct/100*years) - principal',
        },
        outputs: [
            { key: 'final_amount', precision: 2 },
            { key: 'interest_earned', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'continuous-compounding-calculator',
            title: 'Continuous Compounding Interest Calculator',
            h1: 'Continuous Compounding Calculator',
            meta_title: 'Continuous Compounding Calculator | A = Pe^(rt)',
            meta_description: 'Calculate compound interest with continuous compounding — the theoretical limit of compounding frequency — using the formula A = Pe^(rt).',
            short_answer: 'This calculator computes compound growth using continuous compounding — the mathematical limit as compounding frequency approaches infinity — using the formula A = Pe^(rt).',
            intro_text: '<p>Continuous compounding is the theoretical extreme of compound interest: instead of compounding annually, monthly, or even daily, interest is calculated as if it compounds at every possible instant. It uses Euler\'s number (e ≈ 2.71828) in place of a fixed number of compounding periods.</p><p><b>While no real bank account compounds truly continuously</b>, this model is widely used in finance theory, options pricing, and academic contexts as the natural upper bound — daily compounding is already extremely close to the continuous result for typical interest rates.</p>',
            key_points: [
                '<b>Formula:</b> A = Pe^(rt), where e is Euler\'s number (~2.71828), r is the annual rate, and t is time in years.',
                '<b>Theoretical Maximum:</b> Continuous compounding gives the highest possible result for a given nominal rate — daily compounding is already very close.',
                '<b>Common in Financial Theory:</b> Used in options pricing models (like Black-Scholes) and academic finance rather than everyday consumer banking.',
            ],
            howto: [
                { question: 'Do any real accounts use continuous compounding?', answer: '<p>Essentially none advertise true continuous compounding for consumers — daily compounding is the practical equivalent used by most high-yield savings products, since the difference from continuous compounding is negligible.</p>' },
                { question: 'How much more does continuous compounding earn versus monthly?', answer: '<p>The difference is small for typical rates and time frames — often a fraction of a percent over many years — since monthly and daily compounding already approach the continuous limit closely.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Initial Amount', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Time Period', type: 'number', unit: 'years', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Final Amount', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interest Earned', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-nepreryvnogo-nachisleniya-procentov',
            title: 'Калькулятор непрерывного начисления процентов',
            h1: 'Калькулятор непрерывной капитализации',
            meta_title: 'Калькулятор непрерывной капитализации | A = Pe^(rt)',
            meta_description: 'Рассчитайте сложные проценты с непрерывной капитализацией — теоретическим пределом частоты капитализации — по формуле A = Pe^(rt).',
            short_answer: 'Этот калькулятор рассчитывает рост по формуле непрерывной капитализации — математического предела при стремлении частоты капитализации к бесконечности — по формуле A = Pe^(rt).',
            intro_text: '<p>Непрерывная капитализация — теоретический предел сложных процентов: вместо ежегодного, ежемесячного или даже ежедневного начисления, проценты рассчитываются так, будто капитализация происходит в каждый возможный момент. Используется число Эйлера (e ≈ 2.71828) вместо фиксированного числа периодов капитализации.</p><p><b>Хотя ни один реальный банковский счёт не капитализируется по-настоящему непрерывно</b>, эта модель широко используется в финансовой теории, ценообразовании опционов и академических контекстах как естественная верхняя граница.</p>',
            key_points: [
                '<b>Формула:</b> A = Pe^(rt), где e — число Эйлера (~2.71828), r — годовая ставка, t — время в годах.',
                '<b>Теоретический максимум:</b> Непрерывная капитализация даёт наибольший возможный результат при заданной номинальной ставке — ежедневная капитализация уже очень близка.',
                '<b>Распространена в финансовой теории:</b> Используется в моделях ценообразования опционов (например, Блэка-Шоулза) и академических финансах, а не в повседневном банкинге.',
            ],
            howto: [
                { question: 'Используют ли реальные счета непрерывную капитализацию?', answer: '<p>Практически никто не рекламирует истинную непрерывную капитализацию для потребителей — ежедневная капитализация является практическим эквивалентом, используемым большинством высокодоходных сберегательных продуктов.</p>' },
                { question: 'Насколько больше даёт непрерывная капитализация по сравнению с ежемесячной?', answer: '<p>Разница мала для типичных ставок и периодов — часто доли процента за много лет — так как ежемесячная и ежедневная капитализация уже близко приближаются к непрерывному пределу.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Начальная сумма', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Период', type: 'number', unit: 'лет', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Итоговая сумма', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Полученный доход', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'nepartrauktas-kapitalizacijas-kalkulators',
            title: 'Nepārtrauktas Kapitalizācijas Procentu Kalkulators',
            h1: 'Nepārtrauktas Kapitalizācijas Kalkulators',
            meta_title: 'Nepārtrauktas Kapitalizācijas Kalkulators | A = Pe^(rt)',
            meta_description: 'Aprēķiniet saliktos procentus ar nepārtrauktu kapitalizāciju — teorētisko kapitalizācijas biežuma robežu — izmantojot formulu A = Pe^(rt).',
            short_answer: 'Šis kalkulators aprēķina pieaugumu, izmantojot nepārtrauktu kapitalizāciju — matemātisko robežu, kad kapitalizācijas biežums tuvojas bezgalībai — izmantojot formulu A = Pe^(rt).',
            intro_text: '<p>Nepārtraukta kapitalizācija ir saliktu procentu teorētiskā galējība: tā vietā, lai kapitalizētu gadā, mēnesī vai pat dienā, procenti tiek aprēķināti tā, it kā kapitalizācija notiktu katrā iespējamā mirklī. Tiek izmantots Eilera skaitlis (e ≈ 2.71828) fiksēta kapitalizācijas periodu skaita vietā.</p><p><b>Lai gan neviens reāls bankas konts patiešām nekapitalizējas nepārtraukti</b>, šis modelis tiek plaši izmantots finanšu teorijā, opciju cenu noteikšanā un akadēmiskos kontekstos kā dabiska augšējā robeža.</p>',
            key_points: [
                '<b>Formula:</b> A = Pe^(rt), kur e ir Eilera skaitlis (~2.71828), r ir gada likme, un t ir laiks gados.',
                '<b>Teorētiskais maksimums:</b> Nepārtraukta kapitalizācija dod lielāko iespējamo rezultātu pie noteiktas nominālās likmes — ikdienas kapitalizācija jau ir ļoti tuvu.',
                '<b>Izplatīta finanšu teorijā:</b> Izmanto opciju cenu noteikšanas modeļos (piemēram, Black-Scholes) un akadēmiskajās finansēs, nevis ikdienas banku darbībā.',
            ],
            howto: [
                { question: 'Vai kādi reāli konti izmanto nepārtrauktu kapitalizāciju?', answer: '<p>Praktiski neviens nereklamē patiesu nepārtrauktu kapitalizāciju patērētājiem — ikdienas kapitalizācija ir praktiskais ekvivalents, ko izmanto lielākā daļa augstas ienesīguma krājproduktu.</p>' },
                { question: 'Cik daudz vairāk dod nepārtraukta kapitalizācija salīdzinājumā ar ikmēneša?', answer: '<p>Atšķirība ir neliela tipiskām likmēm un periodiem — bieži procenta daļa vairāku gadu laikā — jo ikmēneša un ikdienas kapitalizācija jau tuvojas nepārtrauktajai robežai.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Sākuma Summa', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Laika Periods', type: 'number', unit: 'gadi', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Gala Summa', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Nopelnītie Procenti', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-kapitalizacji-ciaglej',
            title: 'Kalkulator Kapitalizacji Ciągłej',
            h1: 'Kalkulator Kapitalizacji Ciągłej',
            meta_title: 'Kalkulator Kapitalizacji Ciągłej | A = Pe^(rt)',
            meta_description: 'Oblicz procent składany z kapitalizacją ciągłą — teoretyczną granicą częstotliwości kapitalizacji — za pomocą wzoru A = Pe^(rt).',
            short_answer: 'Ten kalkulator oblicza wzrost przy kapitalizacji ciągłej — matematycznej granicy, gdy częstotliwość kapitalizacji dąży do nieskończoności — za pomocą wzoru A = Pe^(rt).',
            intro_text: '<p>Kapitalizacja ciągła to teoretyczna skrajność procentu składanego: zamiast kapitalizować rocznie, miesięcznie czy nawet dziennie, odsetki są obliczane tak, jakby kapitalizacja zachodziła w każdej możliwej chwili. Wykorzystuje liczbę Eulera (e ≈ 2,71828) zamiast stałej liczby okresów kapitalizacji.</p><p><b>Choć żadne prawdziwe konto bankowe nie kapitalizuje się naprawdę w sposób ciągły</b>, model ten jest szeroko stosowany w teorii finansów, wycenie opcji i kontekstach akademickich jako naturalna górna granica.</p>',
            key_points: [
                '<b>Wzór:</b> A = Pe^(rt), gdzie e to liczba Eulera (~2,71828), r to roczna stopa, a t to czas w latach.',
                '<b>Teoretyczne maksimum:</b> Kapitalizacja ciągła daje najwyższy możliwy wynik przy danej stopie nominalnej — kapitalizacja dzienna jest już bardzo blisko.',
                '<b>Powszechna w teorii finansów:</b> Stosowana w modelach wyceny opcji (np. Blacka-Scholesa) i finansach akademickich, a nie w codziennej bankowości konsumenckiej.',
            ],
            howto: [
                { question: 'Czy jakieś prawdziwe konta stosują kapitalizację ciągłą?', answer: '<p>Praktycznie żadne nie reklamują prawdziwej kapitalizacji ciągłej dla konsumentów — kapitalizacja dzienna jest praktycznym odpowiednikiem stosowanym przez większość produktów oszczędnościowych o wysokiej rentowności.</p>' },
                { question: 'Ile więcej daje kapitalizacja ciągła w porównaniu z miesięczną?', answer: '<p>Różnica jest niewielka dla typowych stóp i okresów — często ułamek procenta przez wiele lat — ponieważ kapitalizacja miesięczna i dzienna już zbliżają się do granicy ciągłej.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Początkowa', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Okres Czasu', type: 'number', unit: 'lat', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Suma Końcowa', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Zarobione Odsetki', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-capitalizacion-continua',
            title: 'Calculadora de Capitalización Continua',
            h1: 'Calculadora de Capitalización Continua',
            meta_title: 'Calculadora de Capitalización Continua | A = Pe^(rt)',
            meta_description: 'Calcula el interés compuesto con capitalización continua — el límite teórico de la frecuencia de capitalización — con la fórmula A = Pe^(rt).',
            short_answer: 'Esta calculadora calcula el crecimiento compuesto usando capitalización continua — el límite matemático cuando la frecuencia de capitalización se acerca al infinito — con la fórmula A = Pe^(rt).',
            intro_text: '<p>La capitalización continua es el extremo teórico del interés compuesto: en lugar de capitalizar anual, mensual o incluso diariamente, el interés se calcula como si se capitalizara en cada instante posible. Usa el número de Euler (e ≈ 2,71828) en lugar de un número fijo de períodos de capitalización.</p><p><b>Aunque ninguna cuenta bancaria real capitaliza verdaderamente de forma continua</b>, este modelo se usa ampliamente en teoría financiera, valoración de opciones y contextos académicos como el límite superior natural.</p>',
            key_points: [
                '<b>Fórmula:</b> A = Pe^(rt), donde e es el número de Euler (~2,71828), r es la tasa anual y t es el tiempo en años.',
                '<b>Máximo teórico:</b> La capitalización continua da el resultado más alto posible para una tasa nominal dada — la capitalización diaria ya está muy cerca.',
                '<b>Común en teoría financiera:</b> Se usa en modelos de valoración de opciones (como Black-Scholes) y finanzas académicas, no en la banca de consumo cotidiana.',
            ],
            howto: [
                { question: '¿Alguna cuenta real usa capitalización continua?', answer: '<p>Prácticamente ninguna anuncia capitalización continua real para consumidores — la capitalización diaria es el equivalente práctico usado por la mayoría de los productos de ahorro de alto rendimiento.</p>' },
                { question: '¿Cuánto más gana la capitalización continua frente a la mensual?', answer: '<p>La diferencia es pequeña para tasas y períodos típicos — a menudo una fracción de un por ciento durante muchos años — ya que la capitalización mensual y diaria ya se acercan mucho al límite continuo.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto Inicial', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Período de Tiempo', type: 'number', unit: 'años', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Monto Final', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interés Ganado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-capitalisation-continue',
            title: 'Calculateur de Capitalisation Continue',
            h1: 'Calculateur de Capitalisation Continue',
            meta_title: 'Calculateur de Capitalisation Continue | A = Pe^(rt)',
            meta_description: 'Calculez l’intérêt composé avec capitalisation continue — la limite théorique de la fréquence de capitalisation — avec la formule A = Pe^(rt).',
            short_answer: 'Ce calculateur calcule la croissance composée en utilisant la capitalisation continue — la limite mathématique lorsque la fréquence de capitalisation tend vers l’infini — avec la formule A = Pe^(rt).',
            intro_text: '<p>La capitalisation continue est l’extrême théorique de l’intérêt composé : au lieu de capitaliser annuellement, mensuellement ou même quotidiennement, l’intérêt est calculé comme s’il se capitalisait à chaque instant possible. Elle utilise le nombre d’Euler (e ≈ 2,71828) à la place d’un nombre fixe de périodes de capitalisation.</p><p><b>Bien qu’aucun compte bancaire réel ne se capitalise véritablement en continu</b>, ce modèle est largement utilisé en théorie financière, dans la valorisation des options et en contextes académiques comme la borne supérieure naturelle.</p>',
            key_points: [
                '<b>Formule :</b> A = Pe^(rt), où e est le nombre d’Euler (~2,71828), r est le taux annuel et t le temps en années.',
                '<b>Maximum théorique :</b> La capitalisation continue donne le résultat le plus élevé possible pour un taux nominal donné — la capitalisation quotidienne en est déjà très proche.',
                '<b>Courante en théorie financière :</b> Utilisée dans les modèles de valorisation d’options (comme Black-Scholes) et la finance académique, pas dans la banque de détail quotidienne.',
            ],
            howto: [
                { question: 'Des comptes réels utilisent-ils la capitalisation continue ?', answer: '<p>Pratiquement aucun n’annonce une véritable capitalisation continue pour les consommateurs — la capitalisation quotidienne est l’équivalent pratique utilisé par la plupart des produits d’épargne à haut rendement.</p>' },
                { question: 'Combien de plus rapporte la capitalisation continue par rapport à la mensuelle ?', answer: '<p>La différence est faible pour des taux et périodes typiques — souvent une fraction de pourcent sur plusieurs années — car la capitalisation mensuelle et quotidienne se rapprochent déjà beaucoup de la limite continue.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant Initial', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Période', type: 'number', unit: 'ans', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Montant Final', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Intérêts Gagnés', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-capitalizzazione-continua',
            title: 'Calcolatore di Capitalizzazione Continua',
            h1: 'Calcolatore di Capitalizzazione Continua',
            meta_title: 'Calcolatore Capitalizzazione Continua | A = Pe^(rt)',
            meta_description: 'Calcola l’interesse composto con capitalizzazione continua — il limite teorico della frequenza di capitalizzazione — con la formula A = Pe^(rt).',
            short_answer: 'Questo calcolatore calcola la crescita composta usando la capitalizzazione continua — il limite matematico quando la frequenza di capitalizzazione tende all’infinito — con la formula A = Pe^(rt).',
            intro_text: '<p>La capitalizzazione continua è l’estremo teorico dell’interesse composto: invece di capitalizzare annualmente, mensilmente o anche giornalmente, l’interesse viene calcolato come se si capitalizzasse in ogni istante possibile. Usa il numero di Eulero (e ≈ 2,71828) al posto di un numero fisso di periodi di capitalizzazione.</p><p><b>Sebbene nessun vero conto bancario si capitalizzi realmente in modo continuo</b>, questo modello è ampiamente usato nella teoria finanziaria, nella valutazione delle opzioni e in contesti accademici come limite superiore naturale.</p>',
            key_points: [
                '<b>Formula:</b> A = Pe^(rt), dove e è il numero di Eulero (~2,71828), r è il tasso annuo e t il tempo in anni.',
                '<b>Massimo teorico:</b> La capitalizzazione continua dà il risultato più alto possibile per un dato tasso nominale — la capitalizzazione giornaliera è già molto vicina.',
                '<b>Comune nella teoria finanziaria:</b> Usata nei modelli di valutazione delle opzioni (come Black-Scholes) e nella finanza accademica, non nel banking al dettaglio quotidiano.',
            ],
            howto: [
                { question: 'Qualche conto reale usa la capitalizzazione continua?', answer: '<p>Praticamente nessuno pubblicizza una vera capitalizzazione continua per i consumatori — la capitalizzazione giornaliera è l’equivalente pratico usato dalla maggior parte dei prodotti di risparmio ad alto rendimento.</p>' },
                { question: 'Quanto di più guadagna la capitalizzazione continua rispetto a quella mensile?', answer: '<p>La differenza è piccola per tassi e periodi tipici — spesso una frazione di punto percentuale su molti anni — poiché la capitalizzazione mensile e giornaliera si avvicinano già molto al limite continuo.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo Iniziale', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Periodo di Tempo', type: 'number', unit: 'anni', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Importo Finale', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interessi Maturati', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'kontinuierliche-verzinsung-rechner',
            title: 'Rechner für Kontinuierliche Verzinsung',
            h1: 'Rechner für Kontinuierliche Verzinsung',
            meta_title: 'Rechner Kontinuierliche Verzinsung | A = Pe^(rt)',
            meta_description: 'Berechnen Sie Zinseszins mit kontinuierlicher Verzinsung — dem theoretischen Grenzwert der Zinsperiode — mit der Formel A = Pe^(rt).',
            short_answer: 'Dieser Rechner berechnet zusammengesetztes Wachstum mit kontinuierlicher Verzinsung — dem mathematischen Grenzwert, wenn sich die Zinsperiode der Unendlichkeit nähert — mit der Formel A = Pe^(rt).',
            intro_text: '<p>Kontinuierliche Verzinsung ist das theoretische Extrem des Zinseszinses: Anstatt jährlich, monatlich oder sogar täglich zu verzinsen, werden Zinsen so berechnet, als würden sie zu jedem möglichen Zeitpunkt anfallen. Sie verwendet die Eulersche Zahl (e ≈ 2,71828) anstelle einer festen Anzahl von Zinsperioden.</p><p><b>Obwohl kein echtes Bankkonto wirklich kontinuierlich verzinst wird</b>, wird dieses Modell in der Finanztheorie, bei der Optionsbewertung und in akademischen Kontexten als natürliche Obergrenze weit verbreitet verwendet.</p>',
            key_points: [
                '<b>Formel:</b> A = Pe^(rt), wobei e die Eulersche Zahl (~2,71828), r der Jahreszins und t die Zeit in Jahren ist.',
                '<b>Theoretisches Maximum:</b> Kontinuierliche Verzinsung ergibt das höchstmögliche Ergebnis bei einem gegebenen Nominalzins — tägliche Verzinsung ist bereits sehr nah dran.',
                '<b>Häufig in der Finanztheorie:</b> Verwendet in Optionsbewertungsmodellen (wie Black-Scholes) und akademischer Finanzwissenschaft, nicht im alltäglichen Privatkundengeschäft.',
            ],
            howto: [
                { question: 'Nutzen echte Konten kontinuierliche Verzinsung?', answer: '<p>Praktisch keines bewirbt echte kontinuierliche Verzinsung für Verbraucher — tägliche Verzinsung ist das praktische Äquivalent, das von den meisten hochverzinslichen Sparprodukten verwendet wird.</p>' },
                { question: 'Wie viel mehr erwirtschaftet kontinuierliche Verzinsung im Vergleich zu monatlicher?', answer: '<p>Der Unterschied ist bei typischen Zinssätzen und Zeiträumen gering — oft ein Bruchteil eines Prozents über viele Jahre — da monatliche und tägliche Verzinsung sich bereits eng an den kontinuierlichen Grenzwert annähern.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Anfangsbetrag', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '1000' },
                { name: 'rate_pct', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Zeitraum', type: 'number', unit: 'Jahre', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_amount', label: 'Endbetrag', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Verdiente Zinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1027: Daily Interest Rate Calculator
// ============================================================
const dailyRate: ToolDef = {
    id: '1027',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'annual_rate', default: 6 },
        ],
        formulas: {
            simple_daily_rate: 'annual_rate/365',
            effective_daily_rate: '((1+annual_rate/100)^(1/365)-1)*100',
        },
        outputs: [
            { key: 'simple_daily_rate', precision: 5 },
            { key: 'effective_daily_rate', precision: 5 },
        ],
    },
    locales: {
        en: {
            slug: 'daily-interest-rate-calculator',
            title: 'Daily Interest Rate Calculator',
            h1: 'Daily Interest Rate Calculator',
            meta_title: 'Daily Interest Rate Calculator | Convert Annual Rate to Daily',
            meta_description: 'Convert an annual interest rate to its daily equivalent, using both the simple (linear) method and the compound (effective) method.',
            short_answer: 'This calculator converts an annual interest rate into a daily rate two ways: the simple method (dividing by 365) and the compound method (finding the rate that, compounded daily, produces the same annual result).',
            intro_text: '<p>Some financial calculations — credit card interest, per-diem penalties, prorated fees — need a daily rate rather than an annual one. There are two valid ways to derive it: simply dividing the annual rate by 365, or finding the true compound daily rate that, applied 365 times, exactly reproduces the annual rate.</p><p><b>Lenders and billing systems</b> often use the simple daily rate for calculating per-day interest charges on outstanding balances, since it\'s easier to compute and explain, even though it\'s a very close approximation rather than the mathematically "pure" compound daily rate.</p>',
            key_points: [
                '<b>Simple Daily Rate:</b> Annual rate ÷ 365 — the most common method used in everyday billing and interest accrual.',
                '<b>Effective (Compound) Daily Rate:</b> The rate that, compounded 365 times, exactly equals the annual rate — very slightly lower than the simple rate.',
                '<b>Used for Per-Diem Calculations:</b> Common in credit card interest, late fees, and prorated billing.',
            ],
            howto: [
                { question: 'Which daily rate should I use?', answer: '<p>Most credit cards and billing systems use the simple daily rate (annual ÷ 365) for calculating daily interest charges — check your specific account terms, but this is the most common convention.</p>' },
                { question: 'Why are the two daily rates slightly different?', answer: '<p>The simple rate assumes no compounding within the day-to-day calculation; the effective rate accounts for the fact that daily compounding needs a slightly smaller daily rate to reach the same annual total.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Annual Interest Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Simple Daily Rate', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Effective (Compound) Daily Rate', unit: '%', precision: 5 },
            ],
        },
        ru: {
            slug: 'kalkulyator-dnevnoy-procentnoy-stavki',
            title: 'Калькулятор дневной процентной ставки',
            h1: 'Калькулятор дневной процентной ставки',
            meta_title: 'Калькулятор дневной ставки | Перевод годовой ставки в дневную',
            meta_description: 'Переведите годовую процентную ставку в дневную двумя способами: простым (линейным) и сложным (эффективным).',
            short_answer: 'Этот калькулятор переводит годовую процентную ставку в дневную двумя способами: простым методом (деление на 365) и сложным методом (нахождение ставки, которая при ежедневной капитализации даёт тот же годовой результат).',
            intro_text: '<p>Некоторым финансовым расчётам — процентам по кредитным картам, штрафам за день, пропорциональным комиссиям — нужна дневная ставка, а не годовая. Есть два верных способа её вывести: просто разделить годовую ставку на 365, или найти истинную сложную дневную ставку, которая при применении 365 раз точно воспроизводит годовую ставку.</p><p><b>Кредиторы и billing-системы</b> часто используют простую дневную ставку для расчёта дневных процентных начислений на остаток, так как её проще вычислить и объяснить.</p>',
            key_points: [
                '<b>Простая дневная ставка:</b> Годовая ставка ÷ 365 — самый распространённый метод в повседневных расчётах.',
                '<b>Эффективная (сложная) дневная ставка:</b> Ставка, которая при капитализации 365 раз точно равна годовой — немного ниже простой.',
                '<b>Используется для расчётов по дням:</b> Распространена в процентах по кредитным картам, штрафах за просрочку и пропорциональных начислениях.',
            ],
            howto: [
                { question: 'Какую дневную ставку использовать?', answer: '<p>Большинство кредитных карт и billing-систем используют простую дневную ставку (годовая ÷ 365) для расчёта дневных процентов — проверьте условия своего счёта, но это самое распространённое соглашение.</p>' },
                { question: 'Почему две дневные ставки немного отличаются?', answer: '<p>Простая ставка не предполагает капитализации внутри расчёта день-в-день; эффективная ставка учитывает, что ежедневной капитализации нужна чуть меньшая дневная ставка для достижения того же годового итога.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Годовая процентная ставка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Простая дневная ставка', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Эффективная (сложная) дневная ставка', unit: '%', precision: 5 },
            ],
        },
        lv: {
            slug: 'dienas-procentu-likmes-kalkulators',
            title: 'Dienas Procentu Likmes Kalkulators',
            h1: 'Dienas Procentu Likmes Kalkulators',
            meta_title: 'Dienas Likmes Kalkulators | Pārrēķini Gada Likmi uz Dienas',
            meta_description: 'Pārrēķiniet gada procentu likmi uz tās dienas ekvivalentu, izmantojot vienkāršo un salikto metodi.',
            short_answer: 'Šis kalkulators pārrēķina gada procentu likmi dienas likmē divos veidos: vienkāršā metode (dalīšana ar 365) un saliktā metode (atrast likmi, kas, kapitalizējot katru dienu, dod to pašu gada rezultātu).',
            intro_text: '<p>Dažiem finanšu aprēķiniem — kredītkaršu procentiem, dienas soda naudai, proporcionālām maksām — nepieciešama dienas likme, nevis gada. Ir divi derīgi veidi, kā to iegūt: vienkārši dalot gada likmi ar 365, vai atrodot patieso salikto dienas likmi, kas, piemērota 365 reizes, precīzi atveido gada likmi.</p><p><b>Aizdevēji un norēķinu sistēmas</b> bieži izmanto vienkāršo dienas likmi, lai aprēķinātu dienas procentu maksas par atlikumu, jo to ir vieglāk aprēķināt un izskaidrot.</p>',
            key_points: [
                '<b>Vienkāršā dienas likme:</b> Gada likme ÷ 365 — visizplatītākā metode ikdienas norēķinos.',
                '<b>Efektīvā (saliktā) dienas likme:</b> Likme, kas, kapitalizēta 365 reizes, precīzi vienāda ar gada likmi — nedaudz zemāka par vienkāršo.',
                '<b>Izmanto dienas aprēķiniem:</b> Izplatīta kredītkaršu procentos, kavējuma soda naudās un proporcionālos rēķinos.',
            ],
            howto: [
                { question: 'Kuru dienas likmi izmantot?', answer: '<p>Lielākā daļa kredītkaršu un norēķinu sistēmu izmanto vienkāršo dienas likmi (gada ÷ 365), lai aprēķinātu dienas procentu maksas — pārbaudiet sava konta noteikumus, bet šī ir visizplatītākā konvencija.</p>' },
                { question: 'Kāpēc abas dienas likmes nedaudz atšķiras?', answer: '<p>Vienkāršā likme nepieņem kapitalizāciju dienas-uz-dienu aprēķinā; efektīvā likme ņem vērā, ka ikdienas kapitalizācijai nepieciešama nedaudz mazāka dienas likme, lai sasniegtu to pašu gada kopsummu.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Gada Procentu Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Vienkāršā Dienas Likme', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Efektīvā (Saliktā) Dienas Likme', unit: '%', precision: 5 },
            ],
        },
        pl: {
            slug: 'kalkulator-dziennej-stopy-procentowej',
            title: 'Kalkulator Dziennej Stopy Procentowej',
            h1: 'Kalkulator Dziennej Stopy Procentowej',
            meta_title: 'Kalkulator Dziennej Stopy | Przelicz Roczną Stopę na Dzienną',
            meta_description: 'Przelicz roczną stopę procentową na jej dzienny odpowiednik, metodą prostą i składaną.',
            short_answer: 'Ten kalkulator przelicza roczną stopę procentową na dzienną na dwa sposoby: metodą prostą (dzielenie przez 365) i metodą składaną (znalezienie stopy, która przy dziennej kapitalizacji daje ten sam wynik roczny).',
            intro_text: '<p>Niektóre obliczenia finansowe — odsetki na kartach kredytowych, kary dzienne, proporcjonalne opłaty — wymagają stopy dziennej, a nie rocznej. Istnieją dwa poprawne sposoby jej wyznaczenia: po prostu podzielenie rocznej stopy przez 365, lub znalezienie prawdziwej złożonej stopy dziennej, która zastosowana 365 razy dokładnie odtwarza roczną stopę.</p><p><b>Kredytodawcy i systemy rozliczeniowe</b> często używają prostej stopy dziennej do obliczania dziennych odsetek od zaległego salda, ponieważ łatwiej ją obliczyć i wyjaśnić.</p>',
            key_points: [
                '<b>Prosta stopa dzienna:</b> Roczna stopa ÷ 365 — najczęstsza metoda w codziennych rozliczeniach.',
                '<b>Efektywna (składana) stopa dzienna:</b> Stopa, która skapitalizowana 365 razy dokładnie równa się rocznej — nieco niższa od prostej.',
                '<b>Używana do obliczeń dziennych:</b> Powszechna w odsetkach kart kredytowych, opłatach za zwłokę i rozliczeniach proporcjonalnych.',
            ],
            howto: [
                { question: 'Której stopy dziennej powinienem użyć?', answer: '<p>Większość kart kredytowych i systemów rozliczeniowych używa prostej stopy dziennej (roczna ÷ 365) do obliczania dziennych odsetek — sprawdź warunki swojego konta, ale to najpowszechniejsza konwencja.</p>' },
                { question: 'Dlaczego te dwie stopy dzienne nieznacznie się różnią?', answer: '<p>Prosta stopa nie zakłada kapitalizacji w obliczeniu dzień-po-dniu; efektywna stopa uwzględnia, że dzienna kapitalizacja wymaga nieco mniejszej stopy dziennej, aby osiągnąć tę samą roczną sumę.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Roczna Stopa Procentowa', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Prosta Stopa Dzienna', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Efektywna (Składana) Stopa Dzienna', unit: '%', precision: 5 },
            ],
        },
        es: {
            slug: 'calculadora-tasa-interes-diaria',
            title: 'Calculadora de Tasa de Interés Diaria',
            h1: 'Calculadora de Tasa de Interés Diaria',
            meta_title: 'Calculadora de Tasa Diaria | Convierte Tasa Anual a Diaria',
            meta_description: 'Convierte una tasa de interés anual a su equivalente diario, con el método simple y el método compuesto.',
            short_answer: 'Esta calculadora convierte una tasa de interés anual en una tasa diaria de dos formas: el método simple (dividiendo entre 365) y el método compuesto (encontrando la tasa que, capitalizada diariamente, produce el mismo resultado anual).',
            intro_text: '<p>Algunos cálculos financieros —intereses de tarjetas de crédito, penalizaciones diarias, cargos prorrateados— necesitan una tasa diaria en lugar de una anual. Hay dos formas válidas de derivarla: simplemente dividiendo la tasa anual entre 365, o encontrando la verdadera tasa diaria compuesta que, aplicada 365 veces, reproduce exactamente la tasa anual.</p><p><b>Los prestamistas y sistemas de facturación</b> suelen usar la tasa diaria simple para calcular cargos de interés diarios sobre saldos pendientes, ya que es más fácil de calcular y explicar.</p>',
            key_points: [
                '<b>Tasa diaria simple:</b> Tasa anual ÷ 365 — el método más común en la facturación cotidiana.',
                '<b>Tasa diaria efectiva (compuesta):</b> La tasa que, capitalizada 365 veces, es exactamente igual a la tasa anual — ligeramente menor que la simple.',
                '<b>Usada para cálculos por día:</b> Común en intereses de tarjetas de crédito, cargos por mora y facturación prorrateada.',
            ],
            howto: [
                { question: '¿Qué tasa diaria debo usar?', answer: '<p>La mayoría de las tarjetas de crédito y sistemas de facturación usan la tasa diaria simple (anual ÷ 365) para calcular cargos diarios — verifica los términos de tu cuenta, pero esta es la convención más común.</p>' },
                { question: '¿Por qué las dos tasas diarias son ligeramente diferentes?', answer: '<p>La tasa simple no asume capitalización en el cálculo día a día; la tasa efectiva considera que la capitalización diaria necesita una tasa diaria ligeramente menor para alcanzar el mismo total anual.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Tasa de Interés Anual', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Tasa Diaria Simple', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Tasa Diaria Efectiva (Compuesta)', unit: '%', precision: 5 },
            ],
        },
        fr: {
            slug: 'calculateur-taux-interet-journalier',
            title: 'Calculateur de Taux d’Intérêt Journalier',
            h1: 'Calculateur de Taux d’Intérêt Journalier',
            meta_title: 'Calculateur de Taux Journalier | Convertir un Taux Annuel en Journalier',
            meta_description: 'Convertissez un taux d’intérêt annuel en son équivalent journalier, avec la méthode simple et la méthode composée.',
            short_answer: 'Ce calculateur convertit un taux d’intérêt annuel en taux journalier de deux façons : la méthode simple (division par 365) et la méthode composée (trouver le taux qui, capitalisé quotidiennement, produit le même résultat annuel).',
            intro_text: '<p>Certains calculs financiers — intérêts de carte de crédit, pénalités journalières, frais au prorata — nécessitent un taux journalier plutôt qu’annuel. Il existe deux façons valables de le calculer : diviser simplement le taux annuel par 365, ou trouver le véritable taux journalier composé qui, appliqué 365 fois, reproduit exactement le taux annuel.</p><p><b>Les prêteurs et systèmes de facturation</b> utilisent souvent le taux journalier simple pour calculer les intérêts quotidiens sur les soldes impayés, car il est plus facile à calculer et à expliquer.</p>',
            key_points: [
                '<b>Taux journalier simple :</b> Taux annuel ÷ 365 — la méthode la plus courante dans la facturation quotidienne.',
                '<b>Taux journalier effectif (composé) :</b> Le taux qui, capitalisé 365 fois, équivaut exactement au taux annuel — légèrement inférieur au taux simple.',
                '<b>Utilisé pour les calculs au prorata :</b> Courant dans les intérêts de carte de crédit, les frais de retard et la facturation au prorata.',
            ],
            howto: [
                { question: 'Quel taux journalier dois-je utiliser ?', answer: '<p>La plupart des cartes de crédit et systèmes de facturation utilisent le taux journalier simple (annuel ÷ 365) pour calculer les intérêts quotidiens — vérifiez les conditions de votre compte, mais c’est la convention la plus courante.</p>' },
                { question: 'Pourquoi les deux taux journaliers diffèrent-ils légèrement ?', answer: '<p>Le taux simple ne suppose pas de capitalisation dans le calcul jour après jour ; le taux effectif tient compte du fait que la capitalisation quotidienne nécessite un taux journalier légèrement inférieur pour atteindre le même total annuel.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Taux d’Intérêt Annuel', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Taux Journalier Simple', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Taux Journalier Effectif (Composé)', unit: '%', precision: 5 },
            ],
        },
        it: {
            slug: 'calcolatore-tasso-interesse-giornaliero',
            title: 'Calcolatore Tasso di Interesse Giornaliero',
            h1: 'Calcolatore Tasso di Interesse Giornaliero',
            meta_title: 'Calcolatore Tasso Giornaliero | Converti Tasso Annuo in Giornaliero',
            meta_description: 'Converti un tasso di interesse annuo nel suo equivalente giornaliero, con il metodo semplice e quello composto.',
            short_answer: 'Questo calcolatore converte un tasso di interesse annuo in un tasso giornaliero in due modi: il metodo semplice (dividendo per 365) e il metodo composto (trovando il tasso che, capitalizzato giornalmente, produce lo stesso risultato annuo).',
            intro_text: '<p>Alcuni calcoli finanziari — interessi su carte di credito, penali giornaliere, spese pro rata — richiedono un tasso giornaliero anziché uno annuo. Ci sono due modi validi per derivarlo: dividere semplicemente il tasso annuo per 365, oppure trovare il vero tasso giornaliero composto che, applicato 365 volte, riproduce esattamente il tasso annuo.</p><p><b>Prestatori e sistemi di fatturazione</b> spesso usano il tasso giornaliero semplice per calcolare gli interessi giornalieri sui saldi in sospeso, poiché è più facile da calcolare e spiegare.</p>',
            key_points: [
                '<b>Tasso giornaliero semplice:</b> Tasso annuo ÷ 365 — il metodo più comune nella fatturazione quotidiana.',
                '<b>Tasso giornaliero effettivo (composto):</b> Il tasso che, capitalizzato 365 volte, equivale esattamente al tasso annuo — leggermente inferiore a quello semplice.',
                '<b>Usato per calcoli pro rata:</b> Comune negli interessi delle carte di credito, nelle penali di ritardo e nella fatturazione proporzionale.',
            ],
            howto: [
                { question: 'Quale tasso giornaliero dovrei usare?', answer: '<p>La maggior parte delle carte di credito e dei sistemi di fatturazione usa il tasso giornaliero semplice (annuo ÷ 365) per calcolare gli interessi giornalieri — controlla i termini del tuo conto, ma questa è la convenzione più comune.</p>' },
                { question: 'Perché i due tassi giornalieri sono leggermente diversi?', answer: '<p>Il tasso semplice non presuppone capitalizzazione nel calcolo giorno per giorno; il tasso effettivo considera che la capitalizzazione giornaliera richiede un tasso giornaliero leggermente inferiore per raggiungere lo stesso totale annuo.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Tasso di Interesse Annuo', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Tasso Giornaliero Semplice', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Tasso Giornaliero Effettivo (Composto)', unit: '%', precision: 5 },
            ],
        },
        de: {
            slug: 'tageszins-rechner',
            title: 'Tageszins-Rechner',
            h1: 'Tageszins-Rechner',
            meta_title: 'Tageszins-Rechner | Jahreszins in Tageszins Umrechnen',
            meta_description: 'Rechnen Sie einen Jahreszins in seinen Tagesäquivalent um, mit der einfachen und der zusammengesetzten Methode.',
            short_answer: 'Dieser Rechner wandelt einen Jahreszins auf zwei Arten in einen Tageszins um: die einfache Methode (Division durch 365) und die zusammengesetzte Methode (Ermittlung des Zinssatzes, der täglich verzinst das gleiche Jahresergebnis liefert).',
            intro_text: '<p>Manche Finanzberechnungen — Kreditkartenzinsen, Tagesstrafen, anteilige Gebühren — benötigen einen Tageszins statt eines Jahreszinses. Es gibt zwei gültige Wege, ihn abzuleiten: einfach den Jahreszins durch 365 teilen, oder den wahren zusammengesetzten Tageszins finden, der 365-mal angewendet genau den Jahreszins ergibt.</p><p><b>Kreditgeber und Abrechnungssysteme</b> verwenden oft den einfachen Tageszins zur Berechnung täglicher Zinsbelastungen auf ausstehende Salden, da er leichter zu berechnen und zu erklären ist.</p>',
            key_points: [
                '<b>Einfacher Tageszins:</b> Jahreszins ÷ 365 — die häufigste Methode in der alltäglichen Abrechnung.',
                '<b>Effektiver (zusammengesetzter) Tageszins:</b> Der Zinssatz, der 365-mal verzinst genau dem Jahreszins entspricht — geringfügig niedriger als der einfache Satz.',
                '<b>Für anteilige Berechnungen genutzt:</b> Häufig bei Kreditkartenzinsen, Verzugsgebühren und anteiliger Abrechnung.',
            ],
            howto: [
                { question: 'Welchen Tageszins sollte ich verwenden?', answer: '<p>Die meisten Kreditkarten und Abrechnungssysteme verwenden den einfachen Tageszins (Jahr ÷ 365) zur Berechnung täglicher Zinsen — prüfen Sie Ihre spezifischen Kontobedingungen, aber dies ist die gängigste Konvention.</p>' },
                { question: 'Warum unterscheiden sich die beiden Tageszinsen leicht?', answer: '<p>Der einfache Zins geht von keiner Verzinsung innerhalb der Tag-für-Tag-Berechnung aus; der effektive Zins berücksichtigt, dass die tägliche Verzinsung einen etwas kleineren Tageszins benötigt, um denselben Jahresgesamtbetrag zu erreichen.</p>' },
            ],
            inputs: [
                { name: 'annual_rate', label: 'Jährlicher Zinssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '6' },
            ],
            outputs: [
                { name: 'simple_daily_rate', label: 'Einfacher Tageszins', unit: '%', precision: 5 },
                { name: 'effective_daily_rate', label: 'Effektiver (Zusammengesetzter) Tageszins', unit: '%', precision: 5 },
            ],
        },
    },
}

// ============================================================
// 1028: Blended (Weighted Average) Interest Rate Calculator
// ============================================================
const blendedRate: ToolDef = {
    id: '1028',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'balance1', default: 10000 },
            { key: 'rate1', default: 5 },
            { key: 'balance2', default: 20000 },
            { key: 'rate2', default: 8 },
        ],
        formulas: {
            blended_rate: '(balance1*rate1 + balance2*rate2)/(balance1+balance2)',
            total_balance: 'balance1 + balance2',
        },
        outputs: [
            { key: 'blended_rate', precision: 3 },
            { key: 'total_balance', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'blended-interest-rate-calculator',
            title: 'Blended Interest Rate Calculator - Two Loans',
            h1: 'Blended Interest Rate Calculator',
            meta_title: 'Blended Rate Calculator | Weighted Average Interest Rate',
            meta_description: 'Calculate the blended (weighted average) interest rate across two loans or debts of different balances and rates.',
            short_answer: 'This calculator computes the blended (weighted average) interest rate across two loans or debts — useful for understanding your true overall borrowing cost when you have multiple debts at different rates.',
            intro_text: '<p>When you have more than one loan — say a mortgage and a HELOC, or two student loans — a single "blended rate" gives you one number that represents your true overall interest cost, weighted by how much you owe on each. This is more informative than averaging the rates alone, which ignores balance size.</p><p><b>Borrowers considering refinancing or consolidation</b> use this to check whether a new consolidated loan\'s rate actually beats their current blended rate — consolidating into a rate above your blended rate would actually cost more, despite potentially simplifying payments.</p>',
            key_points: [
                '<b>Weighted, Not Simple, Average:</b> Larger balances count more toward the blended rate — a $20,000 loan at 8% pulls the average up more than a $5,000 loan at the same rate.',
                '<b>Use Before Consolidating:</b> Compare a proposed consolidation loan\'s rate against your blended rate, not just against your highest or lowest individual rate.',
                '<b>Formula:</b> Blended Rate = (Balance₁×Rate₁ + Balance₂×Rate₂) / (Balance₁+Balance₂).',
            ],
            howto: [
                { question: 'What if I have more than two loans?', answer: '<p>Apply the same weighted-average logic across all of them — combine two at a time using this calculator, then blend that result with the next loan\'s balance and rate.</p>' },
                { question: 'Should I always consolidate to my blended rate or lower?', answer: '<p>Generally yes for pure cost — a consolidation rate above your blended rate increases total interest cost, though other factors (fixed vs. variable rate, single payment convenience, credit impact) may still make sense to weigh.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Loan 1 Balance', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Loan 1 Interest Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Loan 2 Balance', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Loan 2 Interest Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Blended Interest Rate', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Total Combined Balance', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-smeshannoy-procentnoy-stavki',
            title: 'Калькулятор смешанной процентной ставки - два кредита',
            h1: 'Калькулятор смешанной процентной ставки',
            meta_title: 'Калькулятор смешанной ставки | Средневзвешенная процентная ставка',
            meta_description: 'Рассчитайте смешанную (средневзвешенную) процентную ставку по двум кредитам или долгам с разными балансами и ставками.',
            short_answer: 'Этот калькулятор вычисляет смешанную (средневзвешенную) процентную ставку по двум кредитам или долгам — полезно для понимания реальной общей стоимости заимствования при нескольких долгах с разными ставками.',
            intro_text: '<p>Когда у вас больше одного кредита — например, ипотека и кредитная линия под залог жилья, или два студенческих займа — единая «смешанная ставка» даёт одно число, представляющее реальную общую стоимость процентов, взвешенную по сумме долга по каждому. Это информативнее, чем простое усреднение ставок без учёта размера баланса.</p><p><b>Заёмщики, рассматривающие рефинансирование или объединение долгов</b>, используют это, чтобы проверить, действительно ли ставка нового объединённого кредита выгоднее их текущей смешанной ставки.</p>',
            key_points: [
                '<b>Взвешенное, а не простое среднее:</b> Больший баланс сильнее влияет на смешанную ставку — кредит $20,000 под 8% поднимает среднюю больше, чем $5,000 под ту же ставку.',
                '<b>Используйте перед объединением:</b> Сравнивайте ставку предлагаемого объединённого кредита со смешанной ставкой, а не только с самой высокой или низкой отдельной ставкой.',
                '<b>Формула:</b> Смешанная ставка = (Баланс₁×Ставка₁ + Баланс₂×Ставка₂) / (Баланс₁+Баланс₂).',
            ],
            howto: [
                { question: 'Что если у меня больше двух кредитов?', answer: '<p>Примените ту же логику взвешенного среднего ко всем — объединяйте по два за раз с помощью этого калькулятора, затем смешивайте результат со следующим кредитом.</p>' },
                { question: 'Всегда ли стоит объединять по смешанной ставке или ниже?', answer: '<p>Как правило да, для чистой стоимости — ставка объединения выше смешанной увеличивает общую переплату, хотя другие факторы (фиксированная/плавающая ставка, удобство единого платежа) тоже стоит учитывать.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Баланс кредита 1', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Ставка кредита 1', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Баланс кредита 2', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Ставка кредита 2', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Смешанная процентная ставка', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Общий совокупный баланс', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'jauktas-procentu-likmes-kalkulators',
            title: 'Jauktas Procentu Likmes Kalkulators - Divi Aizdevumi',
            h1: 'Jauktas Procentu Likmes Kalkulators',
            meta_title: 'Jauktās Likmes Kalkulators | Vidējā Svērtā Procentu Likme',
            meta_description: 'Aprēķiniet jaukto (vidējo svērto) procentu likmi diviem aizdevumiem vai parādiem ar atšķirīgiem atlikumiem un likmēm.',
            short_answer: 'Šis kalkulators aprēķina jaukto (vidējo svērto) procentu likmi diviem aizdevumiem vai parādiem — noderīgi, lai saprastu reālās kopējās aizņemšanās izmaksas, ja jums ir vairāki parādi ar atšķirīgām likmēm.',
            intro_text: '<p>Ja jums ir vairāk nekā viens aizdevums — piemēram, hipotēka un mājokļa kredītlīnija, vai divi studiju kredīti — viena "jauktā likme" dod vienu skaitli, kas atspoguļo jūsu reālās kopējās procentu izmaksas, svērtas pēc katra parāda apjoma. Tas ir informatīvāk nekā vienkārši vidējot likmes bez atlikuma lieluma ņemšanas vērā.</p><p><b>Aizņēmēji, kas apsver refinansēšanu vai konsolidāciju</b>, izmanto šo, lai pārbaudītu, vai jaunā konsolidētā aizdevuma likme tiešām pārspēj viņu pašreizējo jaukto likmi.</p>',
            key_points: [
                '<b>Svērtais, ne vienkāršais vidējais:</b> Lielāki atlikumi vairāk ietekmē jaukto likmi — $20,000 aizdevums ar 8% paceļ vidējo vairāk nekā $5,000 ar to pašu likmi.',
                '<b>Izmantojiet pirms konsolidācijas:</b> Salīdziniet piedāvātā konsolidācijas aizdevuma likmi ar savu jaukto likmi, nevis tikai ar augstāko vai zemāko atsevišķo likmi.',
                '<b>Formula:</b> Jauktā likme = (Atlikums₁×Likme₁ + Atlikums₂×Likme₂) / (Atlikums₁+Atlikums₂).',
            ],
            howto: [
                { question: 'Ko darīt, ja man ir vairāk nekā divi aizdevumi?', answer: '<p>Piemērojiet to pašu svērtā vidējā loģiku visiem — apvienojiet pa diviem, izmantojot šo kalkulatoru, tad sajauciet rezultātu ar nākamā aizdevuma atlikumu un likmi.</p>' },
                { question: 'Vai vienmēr jākonsolidē pie jauktās likmes vai zemāk?', answer: '<p>Parasti jā tīrai izmaksai — konsolidācijas likme virs jauktās likmes palielina kopējās procentu izmaksas, lai gan citi faktori (fiksēta/mainīga likme, viena maksājuma ērtums) arī var būt vērtīgi izsvērt.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: '1. Aizdevuma Atlikums', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: '1. Aizdevuma Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: '2. Aizdevuma Atlikums', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: '2. Aizdevuma Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Jauktā Procentu Likme', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Kopējais Apvienotais Atlikums', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-mieszanego-oprocentowania',
            title: 'Kalkulator Mieszanego Oprocentowania - Dwa Kredyty',
            h1: 'Kalkulator Mieszanego Oprocentowania',
            meta_title: 'Kalkulator Mieszanej Stopy | Średnia Ważona Stopa Procentowa',
            meta_description: 'Oblicz mieszaną (średnią ważoną) stopę procentową dla dwóch kredytów lub długów o różnych saldach i stopach.',
            short_answer: 'Ten kalkulator oblicza mieszaną (średnią ważoną) stopę procentową dla dwóch kredytów lub długów — przydatne do zrozumienia rzeczywistego całkowitego kosztu pożyczki przy wielu długach o różnych stopach.',
            intro_text: '<p>Gdy masz więcej niż jeden kredyt — na przykład hipotekę i linię kredytową pod zastaw domu, lub dwa kredyty studenckie — pojedyncza "mieszana stopa" daje jedną liczbę reprezentującą twój rzeczywisty całkowity koszt odsetkowy, ważony według wysokości zadłużenia w każdym. Jest to bardziej informacyjne niż samo uśrednienie stóp bez uwzględnienia wielkości salda.</p><p><b>Kredytobiorcy rozważający refinansowanie lub konsolidację</b> używają tego, aby sprawdzić, czy stopa nowego skonsolidowanego kredytu faktycznie jest lepsza niż ich obecna mieszana stopa.</p>',
            key_points: [
                '<b>Ważona, nie prosta średnia:</b> Większe salda liczą się bardziej w mieszanej stopie — kredyt 20 000 przy 8% podnosi średnią bardziej niż 5 000 przy tej samej stopie.',
                '<b>Użyj przed konsolidacją:</b> Porównaj stopę proponowanego kredytu konsolidacyjnego z mieszaną stopą, a nie tylko z najwyższą lub najniższą indywidualną stopą.',
                '<b>Wzór:</b> Mieszana Stopa = (Saldo₁×Stopa₁ + Saldo₂×Stopa₂) / (Saldo₁+Saldo₂).',
            ],
            howto: [
                { question: 'Co jeśli mam więcej niż dwa kredyty?', answer: '<p>Zastosuj tę samą logikę średniej ważonej do wszystkich — łącz po dwa naraz za pomocą tego kalkulatora, a następnie zmieszaj wynik z saldem i stopą kolejnego kredytu.</p>' },
                { question: 'Czy zawsze powinienem konsolidować do mieszanej stopy lub niżej?', answer: '<p>Zazwyczaj tak dla czystego kosztu — stopa konsolidacji powyżej mieszanej stopy zwiększa całkowity koszt odsetkowy, choć inne czynniki (stała/zmienna stopa, wygoda jednej płatności) też warto rozważyć.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Saldo Kredytu 1', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Stopa Kredytu 1', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Saldo Kredytu 2', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Stopa Kredytu 2', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Mieszana Stopa Procentowa', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Łączne Saldo', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-tasa-interes-combinada',
            title: 'Calculadora de Tasa de Interés Combinada - Dos Préstamos',
            h1: 'Calculadora de Tasa de Interés Combinada',
            meta_title: 'Calculadora de Tasa Combinada | Tasa de Interés Promedio Ponderada',
            meta_description: 'Calcula la tasa de interés combinada (promedio ponderado) entre dos préstamos o deudas con diferentes saldos y tasas.',
            short_answer: 'Esta calculadora calcula la tasa de interés combinada (promedio ponderado) entre dos préstamos o deudas — útil para entender tu costo real total de endeudamiento cuando tienes varias deudas a diferentes tasas.',
            intro_text: '<p>Cuando tienes más de un préstamo —digamos una hipoteca y una línea de crédito sobre el valor de la vivienda, o dos préstamos estudiantiles— una única "tasa combinada" te da un número que representa tu costo real total de interés, ponderado por cuánto debes en cada uno. Esto es más informativo que promediar las tasas solas, lo cual ignora el tamaño del saldo.</p><p><b>Los prestatarios que consideran refinanciar o consolidar</b> usan esto para verificar si la tasa de un nuevo préstamo consolidado realmente supera su tasa combinada actual.</p>',
            key_points: [
                '<b>Promedio ponderado, no simple:</b> Los saldos más grandes cuentan más hacia la tasa combinada — un préstamo de $20,000 al 8% eleva el promedio más que uno de $5,000 a la misma tasa.',
                '<b>Úsalo antes de consolidar:</b> Compara la tasa de un préstamo de consolidación propuesto con tu tasa combinada, no solo con tu tasa individual más alta o más baja.',
                '<b>Fórmula:</b> Tasa Combinada = (Saldo₁×Tasa₁ + Saldo₂×Tasa₂) / (Saldo₁+Saldo₂).',
            ],
            howto: [
                { question: '¿Qué pasa si tengo más de dos préstamos?', answer: '<p>Aplica la misma lógica de promedio ponderado a todos ellos — combina dos a la vez con esta calculadora, luego combina ese resultado con el saldo y tasa del siguiente préstamo.</p>' },
                { question: '¿Siempre debo consolidar a mi tasa combinada o menor?', answer: '<p>Generalmente sí por el costo puro — una tasa de consolidación por encima de tu tasa combinada aumenta el costo total de interés, aunque otros factores (tasa fija vs. variable, comodidad de un solo pago) también pueden valer la pena considerar.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Saldo del Préstamo 1', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Tasa del Préstamo 1', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Saldo del Préstamo 2', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Tasa del Préstamo 2', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Tasa de Interés Combinada', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Saldo Total Combinado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-taux-interet-mixte',
            title: 'Calculateur de Taux d’Intérêt Mixte - Deux Prêts',
            h1: 'Calculateur de Taux d’Intérêt Mixte',
            meta_title: 'Calculateur de Taux Mixte | Taux d’Intérêt Moyen Pondéré',
            meta_description: 'Calculez le taux d’intérêt mixte (moyenne pondérée) entre deux prêts ou dettes avec des soldes et taux différents.',
            short_answer: 'Ce calculateur calcule le taux d’intérêt mixte (moyenne pondérée) entre deux prêts ou dettes — utile pour comprendre votre coût d’emprunt réel global lorsque vous avez plusieurs dettes à des taux différents.',
            intro_text: '<p>Lorsque vous avez plusieurs prêts — disons une hypothèque et une marge de crédit sur valeur domiciliaire, ou deux prêts étudiants — un seul "taux mixte" vous donne un chiffre représentant votre coût d’intérêt réel global, pondéré par ce que vous devez sur chacun. C’est plus informatif que de simplement faire la moyenne des taux, ce qui ignore la taille du solde.</p><p><b>Les emprunteurs envisageant un refinancement ou une consolidation</b> utilisent cela pour vérifier si le taux d’un nouveau prêt consolidé bat réellement leur taux mixte actuel.</p>',
            key_points: [
                '<b>Moyenne pondérée, pas simple :</b> Les soldes plus importants comptent davantage dans le taux mixte — un prêt de 20 000 $ à 8 % augmente plus la moyenne qu’un prêt de 5 000 $ au même taux.',
                '<b>À utiliser avant de consolider :</b> Comparez le taux d’un prêt de consolidation proposé à votre taux mixte, pas seulement à votre taux individuel le plus élevé ou le plus bas.',
                '<b>Formule :</b> Taux Mixte = (Solde₁×Taux₁ + Solde₂×Taux₂) / (Solde₁+Solde₂).',
            ],
            howto: [
                { question: 'Que faire si j’ai plus de deux prêts ?', answer: '<p>Appliquez la même logique de moyenne pondérée à tous — combinez-en deux à la fois avec ce calculateur, puis mélangez ce résultat avec le solde et le taux du prochain prêt.</p>' },
                { question: 'Dois-je toujours consolider à mon taux mixte ou en dessous ?', answer: '<p>Généralement oui pour le coût pur — un taux de consolidation supérieur à votre taux mixte augmente le coût total des intérêts, bien que d’autres facteurs (taux fixe vs variable, commodité d’un seul paiement) puissent aussi valoir la peine d’être pesés.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Solde du Prêt 1', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Taux du Prêt 1', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Solde du Prêt 2', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Taux du Prêt 2', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Taux d’Intérêt Mixte', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Solde Total Combiné', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-tasso-interesse-misto',
            title: 'Calcolatore Tasso di Interesse Misto - Due Prestiti',
            h1: 'Calcolatore Tasso di Interesse Misto',
            meta_title: 'Calcolatore Tasso Misto | Tasso di Interesse Medio Ponderato',
            meta_description: 'Calcola il tasso di interesse misto (media ponderata) tra due prestiti o debiti con saldi e tassi diversi.',
            short_answer: 'Questo calcolatore calcola il tasso di interesse misto (media ponderata) tra due prestiti o debiti — utile per capire il tuo costo reale complessivo di indebitamento quando hai più debiti a tassi diversi.',
            intro_text: '<p>Quando hai più di un prestito — ad esempio un mutuo e una linea di credito garantita dalla casa, o due prestiti studenteschi — un unico "tasso misto" ti dà un numero che rappresenta il tuo costo reale complessivo degli interessi, ponderato in base a quanto devi su ciascuno. Questo è più informativo che semplicemente fare la media dei tassi, che ignora la dimensione del saldo.</p><p><b>I mutuatari che considerano il rifinanziamento o il consolidamento</b> usano questo per verificare se il tasso di un nuovo prestito consolidato batte davvero il loro attuale tasso misto.</p>',
            key_points: [
                '<b>Media ponderata, non semplice:</b> I saldi più grandi contano di più nel tasso misto — un prestito di 20.000 all’8% alza la media più di uno di 5.000 allo stesso tasso.',
                '<b>Usa prima di consolidare:</b> Confronta il tasso di un prestito di consolidamento proposto con il tuo tasso misto, non solo con il tuo tasso individuale più alto o più basso.',
                '<b>Formula:</b> Tasso Misto = (Saldo₁×Tasso₁ + Saldo₂×Tasso₂) / (Saldo₁+Saldo₂).',
            ],
            howto: [
                { question: 'Cosa succede se ho più di due prestiti?', answer: '<p>Applica la stessa logica di media ponderata a tutti — combina due alla volta con questo calcolatore, poi fondi quel risultato con il saldo e il tasso del prossimo prestito.</p>' },
                { question: 'Dovrei sempre consolidare al mio tasso misto o inferiore?', answer: '<p>Generalmente sì per il costo puro — un tasso di consolidamento superiore al tuo tasso misto aumenta il costo totale degli interessi, sebbene altri fattori (tasso fisso/variabile, comodità di un unico pagamento) possano comunque valere la pena considerare.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Saldo Prestito 1', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Tasso Prestito 1', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Saldo Prestito 2', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Tasso Prestito 2', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Tasso di Interesse Misto', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Saldo Totale Combinato', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'mischzins-rechner',
            title: 'Mischzins-Rechner - Zwei Kredite',
            h1: 'Mischzins-Rechner',
            meta_title: 'Mischzins-Rechner | Gewichteter Durchschnittlicher Zinssatz',
            meta_description: 'Berechnen Sie den Mischzins (gewichteten Durchschnitt) über zwei Kredite oder Schulden mit unterschiedlichen Salden und Zinssätzen.',
            short_answer: 'Dieser Rechner berechnet den Mischzins (gewichteten Durchschnitt) über zwei Kredite oder Schulden — nützlich, um Ihre wahren gesamten Kreditkosten zu verstehen, wenn Sie mehrere Schulden zu unterschiedlichen Zinssätzen haben.',
            intro_text: '<p>Wenn Sie mehr als einen Kredit haben — etwa eine Hypothek und eine Eigenheim-Kreditlinie, oder zwei Studienkredite — gibt Ihnen ein einziger "Mischzins" eine Zahl, die Ihre wahren gesamten Zinskosten repräsentiert, gewichtet danach, wie viel Sie bei jedem schulden. Dies ist aussagekräftiger als die reine Durchschnittsbildung der Zinssätze, die die Saldogröße ignoriert.</p><p><b>Kreditnehmer, die eine Umschuldung oder Konsolidierung erwägen</b>, nutzen dies, um zu prüfen, ob der Zinssatz eines neuen konsolidierten Kredits tatsächlich ihren aktuellen Mischzins schlägt.</p>',
            key_points: [
                '<b>Gewichteter, nicht einfacher Durchschnitt:</b> Größere Salden zählen mehr zum Mischzins — ein Kredit über 20.000 $ bei 8 % hebt den Durchschnitt stärker an als einer über 5.000 $ zum gleichen Satz.',
                '<b>Vor der Konsolidierung nutzen:</b> Vergleichen Sie den Zinssatz eines vorgeschlagenen Konsolidierungskredits mit Ihrem Mischzins, nicht nur mit Ihrem höchsten oder niedrigsten Einzelzinssatz.',
                '<b>Formel:</b> Mischzins = (Saldo₁×Zins₁ + Saldo₂×Zins₂) / (Saldo₁+Saldo₂).',
            ],
            howto: [
                { question: 'Was, wenn ich mehr als zwei Kredite habe?', answer: '<p>Wenden Sie die gleiche gewichtete Durchschnittslogik auf alle an — kombinieren Sie jeweils zwei mit diesem Rechner und mischen Sie dann dieses Ergebnis mit dem Saldo und Zinssatz des nächsten Kredits.</p>' },
                { question: 'Sollte ich immer zu meinem Mischzins oder niedriger konsolidieren?', answer: '<p>Für reine Kosten in der Regel ja — ein Konsolidierungszins über Ihrem Mischzins erhöht die gesamten Zinskosten, obwohl andere Faktoren (fester vs. variabler Zins, Bequemlichkeit einer einzigen Zahlung) ebenfalls abzuwägen sein können.</p>' },
            ],
            inputs: [
                { name: 'balance1', label: 'Kredit 1 Saldo', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '10000' },
                { name: 'rate1', label: 'Kredit 1 Zinssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'balance2', label: 'Kredit 2 Saldo', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'rate2', label: 'Kredit 2 Zinssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '8' },
            ],
            outputs: [
                { name: 'blended_rate', label: 'Mischzins', unit: '%', precision: 3 },
                { name: 'total_balance', label: 'Gesamtsaldo', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1029: Real Interest Rate Calculator (Fisher Equation)
// ============================================================
const realRate: ToolDef = {
    id: '1029',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'nominal_rate', default: 5 },
            { key: 'inflation_rate', default: 3 },
        ],
        formulas: {
            real_rate: '((1+nominal_rate/100)/(1+inflation_rate/100) - 1)*100',
            real_rate_approx: 'nominal_rate - inflation_rate',
        },
        outputs: [
            { key: 'real_rate', precision: 3 },
            { key: 'real_rate_approx', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'real-interest-rate-calculator-fisher-equation',
            title: 'Real Interest Rate Calculator - Fisher Equation',
            h1: 'Real Interest Rate Calculator',
            meta_title: 'Real Interest Rate Calculator | Fisher Equation',
            meta_description: 'Calculate your real interest rate — the nominal rate adjusted for inflation — using the exact Fisher equation and the simple approximation.',
            short_answer: 'This calculator computes your real interest rate — your nominal rate adjusted for inflation, showing your true purchasing-power gain — using both the exact Fisher equation and the common simple approximation.',
            intro_text: '<p>A nominal interest rate tells you how much money grows in raw dollar terms, but inflation erodes what that money can actually buy. The real interest rate strips out inflation to show your true gain in purchasing power — a 5% return during 3% inflation isn\'t really a 5% gain in what you can afford.</p><p><b>Investors and savers</b> use the real rate to judge whether an investment is actually growing their wealth or merely keeping pace with rising prices — a nominal return below the inflation rate means a negative real return, even though the account balance is technically growing.</p>',
            key_points: [
                '<b>Exact Fisher Equation:</b> Real Rate = (1+Nominal)/(1+Inflation) − 1 — the mathematically precise version.',
                '<b>Simple Approximation:</b> Nominal − Inflation is commonly used as a quick estimate, and is close enough at low rates, but diverges more as rates rise.',
                '<b>Negative Real Rates Happen:</b> When inflation exceeds the nominal rate, your real return is negative — your money is losing purchasing power even while the account balance grows.',
            ],
            howto: [
                { question: 'Why use the exact formula instead of just subtracting?', answer: '<p>Simple subtraction (nominal − inflation) is a close approximation at low rates but becomes noticeably less accurate as either rate rises — the exact Fisher equation is always correct.</p>' },
                { question: 'What does a negative real rate mean for my savings?', answer: '<p>It means your money is technically growing but losing purchasing power faster than it earns interest — common during high-inflation periods with low savings account rates.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Nominal Interest Rate', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Inflation Rate', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Real Interest Rate (Exact)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Real Interest Rate (Approx.)', unit: '%', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-realnoy-procentnoy-stavki-formula-fishera',
            title: 'Калькулятор реальной процентной ставки - формула Фишера',
            h1: 'Калькулятор реальной процентной ставки',
            meta_title: 'Калькулятор реальной ставки | Формула Фишера',
            meta_description: 'Рассчитайте реальную процентную ставку — номинальную ставку с поправкой на инфляцию — по точной формуле Фишера и простому приближению.',
            short_answer: 'Этот калькулятор вычисляет реальную процентную ставку — номинальную ставку с поправкой на инфляцию, показывающую реальный прирост покупательной способности — по точной формуле Фишера и распространённому упрощённому приближению.',
            intro_text: '<p>Номинальная процентная ставка показывает, насколько растут деньги в чистых долларах, но инфляция снижает то, что эти деньги реально могут купить. Реальная ставка убирает инфляцию, показывая истинный прирост покупательной способности — доходность 5% при инфляции 3% — это не настоящий прирост в 5% в том, что вы можете себе позволить.</p><p><b>Инвесторы и вкладчики</b> используют реальную ставку, чтобы оценить, действительно ли инвестиция увеличивает благосостояние или просто не отстаёт от роста цен.</p>',
            key_points: [
                '<b>Точная формула Фишера:</b> Реальная ставка = (1+Номинальная)/(1+Инфляция) − 1 — математически точная версия.',
                '<b>Простое приближение:</b> Номинальная − Инфляция часто используется как быстрая оценка, достаточно близкая при низких ставках, но расходится больше при росте ставок.',
                '<b>Отрицательные реальные ставки бывают:</b> Когда инфляция превышает номинальную ставку, реальная доходность отрицательна — деньги теряют покупательную способность, даже если баланс счёта технически растёт.',
            ],
            howto: [
                { question: 'Зачем использовать точную формулу вместо простого вычитания?', answer: '<p>Простое вычитание (номинальная − инфляция) — близкое приближение при низких ставках, но становится заметно менее точным при росте любой из ставок — точная формула Фишера всегда верна.</p>' },
                { question: 'Что означает отрицательная реальная ставка для моих сбережений?', answer: '<p>Это значит, что деньги технически растут, но теряют покупательную способность быстрее, чем зарабатывают проценты — распространено в периоды высокой инфляции с низкими ставками по вкладам.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Номинальная процентная ставка', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Уровень инфляции', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Реальная ставка (точная)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Реальная ставка (приближ.)', unit: '%', precision: 2 },
            ],
        },
        lv: {
            slug: 'realas-procentu-likmes-kalkulators-fisera-vienadojums',
            title: 'Reālās Procentu Likmes Kalkulators - Fišera Vienādojums',
            h1: 'Reālās Procentu Likmes Kalkulators',
            meta_title: 'Reālās Likmes Kalkulators | Fišera Vienādojums',
            meta_description: 'Aprēķiniet reālo procentu likmi — nominālo likmi, koriģētu ar inflāciju — izmantojot precīzo Fišera vienādojumu un vienkāršo tuvinājumu.',
            short_answer: 'Šis kalkulators aprēķina jūsu reālo procentu likmi — nominālo likmi, koriģētu ar inflāciju, parādot reālo pirktspējas pieaugumu — izmantojot gan precīzo Fišera vienādojumu, gan izplatīto vienkāršo tuvinājumu.',
            intro_text: '<p>Nominālā procentu likme parāda, cik daudz nauda aug tīros dolāros, taču inflācija samazina to, ko šī nauda reāli var nopirkt. Reālā likme izslēdz inflāciju, parādot patieso pirktspējas pieaugumu — 5% ienesīgums pie 3% inflācijas nav patiess 5% pieaugums tam, ko varat atļauties.</p><p><b>Investori un noguldītāji</b> izmanto reālo likmi, lai novērtētu, vai investīcija patiešām palielina bagātību vai vienkārši nesatur soli ar augošajām cenām.</p>',
            key_points: [
                '<b>Precīzais Fišera vienādojums:</b> Reālā likme = (1+Nominālā)/(1+Inflācija) − 1 — matemātiski precīzā versija.',
                '<b>Vienkāršais tuvinājums:</b> Nominālā − Inflācija bieži tiek izmantota kā ātrs novērtējums, pietiekami tuvs pie zemām likmēm, bet vairāk atšķiras, likmēm pieaugot.',
                '<b>Negatīvas reālās likmes gadās:</b> Kad inflācija pārsniedz nominālo likmi, reālais ienesīgums ir negatīvs — nauda zaudē pirktspēju, pat ja konta atlikums tehniski aug.',
            ],
            howto: [
                { question: 'Kāpēc izmantot precīzo formulu, nevis vienkāršu atņemšanu?', answer: '<p>Vienkārša atņemšana (nominālā − inflācija) ir tuvs tuvinājums pie zemām likmēm, bet kļūst manāmi mazāk precīza, jebkurai likmei pieaugot — precīzais Fišera vienādojums vienmēr ir pareizs.</p>' },
                { question: 'Ko negatīva reālā likme nozīmē maniem uzkrājumiem?', answer: '<p>Tas nozīmē, ka jūsu nauda tehniski aug, bet zaudē pirktspēju ātrāk, nekā nopelna procentus — izplatīts augstas inflācijas periodos ar zemām krājkontu likmēm.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Nominālā Procentu Likme', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Inflācijas Līmenis', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Reālā Likme (precīza)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Reālā Likme (tuvinājums)', unit: '%', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-realnej-stopy-procentowej-rownanie-fishera',
            title: 'Kalkulator Realnej Stopy Procentowej - Równanie Fishera',
            h1: 'Kalkulator Realnej Stopy Procentowej',
            meta_title: 'Kalkulator Realnej Stopy | Równanie Fishera',
            meta_description: 'Oblicz realną stopę procentową — stopę nominalną skorygowaną o inflację — za pomocą dokładnego równania Fishera i prostego przybliżenia.',
            short_answer: 'Ten kalkulator oblicza twoją realną stopę procentową — stopę nominalną skorygowaną o inflację, pokazującą rzeczywisty wzrost siły nabywczej — za pomocą dokładnego równania Fishera i powszechnego prostego przybliżenia.',
            intro_text: '<p>Nominalna stopa procentowa pokazuje, jak bardzo rosną pieniądze w czystych dolarach, ale inflacja zmniejsza to, co te pieniądze mogą faktycznie kupić. Realna stopa usuwa inflację, pokazując prawdziwy wzrost siły nabywczej — zwrot 5% przy inflacji 3% to nie jest prawdziwy wzrost o 5% w tym, na co cię stać.</p><p><b>Inwestorzy i oszczędzający</b> używają realnej stopy, aby ocenić, czy inwestycja rzeczywiście zwiększa majątek, czy tylko nadąża za rosnącymi cenami.</p>',
            key_points: [
                '<b>Dokładne równanie Fishera:</b> Realna Stopa = (1+Nominalna)/(1+Inflacja) − 1 — matematycznie precyzyjna wersja.',
                '<b>Proste przybliżenie:</b> Nominalna − Inflacja jest powszechnie używane jako szybkie oszacowanie, wystarczająco bliskie przy niskich stopach, ale bardziej rozbieżne przy rosnących stopach.',
                '<b>Ujemne realne stopy się zdarzają:</b> Gdy inflacja przewyższa stopę nominalną, realny zwrot jest ujemny — pieniądze tracą siłę nabywczą, mimo że saldo konta technicznie rośnie.',
            ],
            howto: [
                { question: 'Dlaczego używać dokładnego wzoru zamiast po prostu odejmowania?', answer: '<p>Proste odejmowanie (nominalna − inflacja) jest bliskim przybliżeniem przy niskich stopach, ale staje się zauważalnie mniej dokładne, gdy którakolwiek stopa rośnie — dokładne równanie Fishera jest zawsze poprawne.</p>' },
                { question: 'Co oznacza ujemna realna stopa dla moich oszczędności?', answer: '<p>Oznacza to, że twoje pieniądze technicznie rosną, ale tracą siłę nabywczą szybciej, niż zarabiają odsetki — powszechne w okresach wysokiej inflacji przy niskim oprocentowaniu kont oszczędnościowych.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Nominalna Stopa Procentowa', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Stopa Inflacji', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Realna Stopa (Dokładna)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Realna Stopa (Przybliżona)', unit: '%', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-tasa-interes-real-ecuacion-fisher',
            title: 'Calculadora de Tasa de Interés Real - Ecuación de Fisher',
            h1: 'Calculadora de Tasa de Interés Real',
            meta_title: 'Calculadora de Tasa Real | Ecuación de Fisher',
            meta_description: 'Calcula tu tasa de interés real — la tasa nominal ajustada por inflación — con la ecuación exacta de Fisher y la aproximación simple.',
            short_answer: 'Esta calculadora calcula tu tasa de interés real — tu tasa nominal ajustada por inflación, mostrando tu ganancia real en poder adquisitivo — usando la ecuación exacta de Fisher y la aproximación simple común.',
            intro_text: '<p>Una tasa de interés nominal indica cuánto crece el dinero en términos de dólares brutos, pero la inflación erosiona lo que ese dinero realmente puede comprar. La tasa real elimina la inflación para mostrar tu ganancia real en poder adquisitivo — un rendimiento del 5% durante una inflación del 3% no es realmente una ganancia del 5% en lo que puedes permitirte.</p><p><b>Inversores y ahorradores</b> usan la tasa real para juzgar si una inversión realmente está aumentando su riqueza o simplemente sigue el ritmo de los precios crecientes.</p>',
            key_points: [
                '<b>Ecuación exacta de Fisher:</b> Tasa Real = (1+Nominal)/(1+Inflación) − 1 — la versión matemáticamente precisa.',
                '<b>Aproximación simple:</b> Nominal − Inflación se usa comúnmente como estimación rápida, y es suficientemente cercana a tasas bajas, pero diverge más a medida que suben las tasas.',
                '<b>Las tasas reales negativas ocurren:</b> Cuando la inflación supera la tasa nominal, tu rendimiento real es negativo — tu dinero pierde poder adquisitivo aunque el saldo de la cuenta técnicamente crezca.',
            ],
            howto: [
                { question: '¿Por qué usar la fórmula exacta en lugar de simplemente restar?', answer: '<p>La resta simple (nominal − inflación) es una aproximación cercana a tasas bajas, pero se vuelve notablemente menos precisa a medida que cualquiera de las tasas aumenta — la ecuación exacta de Fisher siempre es correcta.</p>' },
                { question: '¿Qué significa una tasa real negativa para mis ahorros?', answer: '<p>Significa que tu dinero técnicamente crece pero pierde poder adquisitivo más rápido de lo que gana en intereses — común durante períodos de alta inflación con tasas bajas de cuentas de ahorro.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Tasa de Interés Nominal', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Tasa de Inflación', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Tasa de Interés Real (Exacta)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Tasa de Interés Real (Aprox.)', unit: '%', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-taux-interet-reel-equation-fisher',
            title: 'Calculateur de Taux d’Intérêt Réel - Équation de Fisher',
            h1: 'Calculateur de Taux d’Intérêt Réel',
            meta_title: 'Calculateur de Taux Réel | Équation de Fisher',
            meta_description: 'Calculez votre taux d’intérêt réel — le taux nominal ajusté de l’inflation — avec l’équation exacte de Fisher et l’approximation simple.',
            short_answer: 'Ce calculateur calcule votre taux d’intérêt réel — votre taux nominal ajusté de l’inflation, montrant votre gain réel de pouvoir d’achat — en utilisant l’équation exacte de Fisher et l’approximation simple courante.',
            intro_text: '<p>Un taux d’intérêt nominal indique combien l’argent croît en dollars bruts, mais l’inflation érode ce que cet argent peut réellement acheter. Le taux réel élimine l’inflation pour montrer votre gain réel de pouvoir d’achat — un rendement de 5 % avec une inflation de 3 % n’est pas vraiment un gain de 5 % dans ce que vous pouvez vous permettre.</p><p><b>Investisseurs et épargnants</b> utilisent le taux réel pour juger si un investissement augmente réellement leur richesse ou suit simplement le rythme de la hausse des prix.</p>',
            key_points: [
                '<b>Équation exacte de Fisher :</b> Taux Réel = (1+Nominal)/(1+Inflation) − 1 — la version mathématiquement précise.',
                '<b>Approximation simple :</b> Nominal − Inflation est couramment utilisé comme estimation rapide, suffisamment proche à taux bas, mais diverge davantage à mesure que les taux augmentent.',
                '<b>Les taux réels négatifs existent :</b> Lorsque l’inflation dépasse le taux nominal, votre rendement réel est négatif — votre argent perd du pouvoir d’achat même si le solde du compte augmente techniquement.',
            ],
            howto: [
                { question: 'Pourquoi utiliser la formule exacte plutôt qu’une simple soustraction ?', answer: '<p>La soustraction simple (nominal − inflation) est une approximation proche à taux bas, mais devient nettement moins précise à mesure que l’un ou l’autre taux augmente — l’équation exacte de Fisher est toujours correcte.</p>' },
                { question: 'Que signifie un taux réel négatif pour mon épargne ?', answer: '<p>Cela signifie que votre argent croît techniquement mais perd du pouvoir d’achat plus vite qu’il ne gagne des intérêts — courant pendant les périodes de forte inflation avec des taux d’épargne bas.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Taux d’Intérêt Nominal', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Taux d’Inflation', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Taux d’Intérêt Réel (Exact)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Taux d’Intérêt Réel (Approx.)', unit: '%', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-tasso-interesse-reale-equazione-fisher',
            title: 'Calcolatore Tasso di Interesse Reale - Equazione di Fisher',
            h1: 'Calcolatore Tasso di Interesse Reale',
            meta_title: 'Calcolatore Tasso Reale | Equazione di Fisher',
            meta_description: 'Calcola il tuo tasso di interesse reale — il tasso nominale corretto per l’inflazione — con l’equazione esatta di Fisher e l’approssimazione semplice.',
            short_answer: 'Questo calcolatore calcola il tuo tasso di interesse reale — il tasso nominale corretto per l’inflazione, mostrando il tuo reale guadagno di potere d’acquisto — usando sia l’equazione esatta di Fisher sia la comune approssimazione semplice.',
            intro_text: '<p>Un tasso di interesse nominale indica quanto crescono i soldi in termini di dollari grezzi, ma l’inflazione erode ciò che quei soldi possono realmente comprare. Il tasso reale rimuove l’inflazione per mostrare il tuo reale guadagno di potere d’acquisto — un rendimento del 5% con un’inflazione del 3% non è realmente un guadagno del 5% in ciò che puoi permetterti.</p><p><b>Investitori e risparmiatori</b> usano il tasso reale per giudicare se un investimento sta realmente aumentando la loro ricchezza o semplicemente tenendo il passo con l’aumento dei prezzi.</p>',
            key_points: [
                '<b>Equazione esatta di Fisher:</b> Tasso Reale = (1+Nominale)/(1+Inflazione) − 1 — la versione matematicamente precisa.',
                '<b>Approssimazione semplice:</b> Nominale − Inflazione è comunemente usata come stima rapida, sufficientemente vicina a tassi bassi, ma diverge di più al crescere dei tassi.',
                '<b>I tassi reali negativi accadono:</b> Quando l’inflazione supera il tasso nominale, il tuo rendimento reale è negativo — i tuoi soldi perdono potere d’acquisto anche se il saldo del conto tecnicamente cresce.',
            ],
            howto: [
                { question: 'Perché usare la formula esatta invece di una semplice sottrazione?', answer: '<p>La sottrazione semplice (nominale − inflazione) è un’approssimazione vicina a tassi bassi, ma diventa notevolmente meno accurata quando uno dei due tassi sale — l’equazione esatta di Fisher è sempre corretta.</p>' },
                { question: 'Cosa significa un tasso reale negativo per i miei risparmi?', answer: '<p>Significa che i tuoi soldi crescono tecnicamente ma perdono potere d’acquisto più velocemente di quanto guadagnino interessi — comune durante periodi di alta inflazione con basse aliquote sui conti di risparmio.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Tasso di Interesse Nominale', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Tasso di Inflazione', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Tasso di Interesse Reale (Esatto)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Tasso di Interesse Reale (Approssimato)', unit: '%', precision: 2 },
            ],
        },
        de: {
            slug: 'realzins-rechner-fisher-gleichung',
            title: 'Realzins-Rechner - Fisher-Gleichung',
            h1: 'Realzins-Rechner',
            meta_title: 'Realzins-Rechner | Fisher-Gleichung',
            meta_description: 'Berechnen Sie Ihren Realzins — den um die Inflation bereinigten Nominalzins — mit der exakten Fisher-Gleichung und der einfachen Näherung.',
            short_answer: 'Dieser Rechner berechnet Ihren Realzins — Ihren Nominalzins bereinigt um die Inflation, der Ihren tatsächlichen Kaufkraftgewinn zeigt — mit der exakten Fisher-Gleichung und der gängigen einfachen Näherung.',
            intro_text: '<p>Ein Nominalzins zeigt, wie stark Geld in reinen Dollarbeträgen wächst, aber die Inflation mindert, was dieses Geld tatsächlich kaufen kann. Der Realzins entfernt die Inflation, um Ihren wahren Kaufkraftgewinn zu zeigen — eine Rendite von 5 % bei 3 % Inflation ist nicht wirklich ein 5-%-Gewinn in dem, was Sie sich leisten können.</p><p><b>Anleger und Sparer</b> nutzen den Realzins, um zu beurteilen, ob eine Anlage tatsächlich ihr Vermögen mehrt oder nur mit steigenden Preisen Schritt hält.</p>',
            key_points: [
                '<b>Exakte Fisher-Gleichung:</b> Realzins = (1+Nominal)/(1+Inflation) − 1 — die mathematisch präzise Version.',
                '<b>Einfache Näherung:</b> Nominal − Inflation wird häufig als schnelle Schätzung verwendet und liegt bei niedrigen Zinssätzen nah dran, weicht aber bei steigenden Zinssätzen stärker ab.',
                '<b>Negative Realzinsen kommen vor:</b> Wenn die Inflation den Nominalzins übersteigt, ist Ihre reale Rendite negativ — Ihr Geld verliert an Kaufkraft, auch wenn der Kontostand technisch wächst.',
            ],
            howto: [
                { question: 'Warum die exakte Formel statt einfacher Subtraktion verwenden?', answer: '<p>Einfache Subtraktion (Nominal − Inflation) ist bei niedrigen Zinssätzen eine gute Näherung, wird aber merklich ungenauer, wenn einer der beiden Sätze steigt — die exakte Fisher-Gleichung ist immer korrekt.</p>' },
                { question: 'Was bedeutet ein negativer Realzins für meine Ersparnisse?', answer: '<p>Es bedeutet, dass Ihr Geld technisch wächst, aber schneller an Kaufkraft verliert, als es Zinsen erwirtschaftet — häufig in Phasen hoher Inflation bei niedrigen Sparkontenzinsen.</p>' },
            ],
            inputs: [
                { name: 'nominal_rate', label: 'Nominaler Zinssatz', type: 'number', unit: '%', min: -20, max: 100, placeholder: '5' },
                { name: 'inflation_rate', label: 'Inflationsrate', type: 'number', unit: '%', min: -20, max: 100, placeholder: '3' },
            ],
            outputs: [
                { name: 'real_rate', label: 'Realzins (Exakt)', unit: '%', precision: 3 },
                { name: 'real_rate_approx', label: 'Realzins (Näherung)', unit: '%', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1030: Add-On Interest Calculator
// ============================================================
const addOnInterest: ToolDef = {
    id: '1030',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 10000 },
            { key: 'rate_pct', default: 6 },
            { key: 'years', default: 3 },
        ],
        formulas: {
            total_interest: 'principal*rate_pct/100*years',
            total_payback: 'principal + principal*rate_pct/100*years',
            monthly_payment: '(principal + principal*rate_pct/100*years)/(years*12)',
        },
        outputs: [
            { key: 'total_interest', precision: 2 },
            { key: 'total_payback', precision: 2 },
            { key: 'monthly_payment', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'add-on-interest-calculator',
            title: 'Add-On Interest Calculator',
            h1: 'Add-On Interest Calculator',
            meta_title: 'Add-On Interest Calculator | Total Payback & Monthly Payment',
            meta_description: 'Calculate total interest and monthly payment using the add-on interest method, common in some consumer and auto loans — and see why it costs more than standard amortization.',
            short_answer: 'This calculator computes payments under the "add-on" interest method, where the total interest for the full term is calculated upfront on the original principal and added before dividing into equal payments — a method that costs more than standard amortization at the same stated rate.',
            intro_text: '<p>The add-on interest method calculates interest on the full original principal for the entire loan term upfront, then adds that interest to the principal and divides the total into equal monthly payments. Because interest is charged on the original balance the whole time — even as you pay it down — this method produces a much higher effective rate than standard amortization at the same stated percentage.</p><p><b>Some consumer loans, retail installment plans, and older-style auto loans</b> still use add-on interest, and understanding the difference matters: a "6% add-on" loan can have an effective APR closer to 11%, since standard amortization would let the falling balance reduce future interest.</p>',
            key_points: [
                '<b>Interest Calculated Upfront:</b> Total interest = Principal × Rate × Years, calculated on the full original amount for the whole term.',
                '<b>Costs More Than It Looks:</b> The effective interest rate on an add-on loan is roughly double the stated rate, since your balance is actually declining but you\'re still charged as if it weren\'t.',
                '<b>Watch for This Method:</b> Always ask whether a loan uses add-on interest or standard amortization — the same stated rate produces very different real costs.',
            ],
            howto: [
                { question: 'Why does add-on interest cost so much more?', answer: '<p>Because interest is calculated as if you owed the full original balance for the entire term, even though you\'re paying it down each month — you\'re effectively paying interest on money you\'ve already repaid.</p>' },
                { question: 'How do I know if my loan uses add-on interest?', answer: '<p>Check your loan agreement or ask your lender directly — if the total interest was calculated once upfront on the full principal rather than recalculated monthly on a declining balance, it\'s an add-on loan.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Loan Amount', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Add-On Interest Rate', type: 'number', unit: '%/year', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Loan Term', type: 'number', unit: 'years', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Total Interest', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Total Payback Amount', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Monthly Payment', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-dobavlyaemyh-procentov',
            title: 'Калькулятор добавляемых процентов (add-on)',
            h1: 'Калькулятор добавляемых процентов',
            meta_title: 'Калькулятор Add-On процентов | Общая сумма и ежемесячный платёж',
            meta_description: 'Рассчитайте общую переплату и ежемесячный платёж по методу «add-on» процентов, распространённому в некоторых потребительских и автокредитах.',
            short_answer: 'Этот калькулятор рассчитывает платежи по методу «add-on» (добавляемых) процентов, где вся переплата за весь срок рассчитывается заранее на первоначальную сумму и добавляется перед делением на равные платежи — метод, который обходится дороже стандартной амортизации при той же заявленной ставке.',
            intro_text: '<p>Метод add-on рассчитывает проценты на всю первоначальную сумму за весь срок кредита заранее, затем добавляет эти проценты к основному долгу и делит итог на равные ежемесячные платежи. Поскольку проценты начисляются на первоначальный баланс всё время — даже по мере его погашения — этот метод даёт намного более высокую эффективную ставку, чем стандартная амортизация при той же заявленной ставке.</p><p><b>Некоторые потребительские кредиты, розничные рассрочки и автокредиты старого образца</b> всё ещё используют add-on проценты, и понимание разницы важно: кредит «6% add-on» может иметь эффективный APR около 11%.</p>',
            key_points: [
                '<b>Проценты рассчитаны заранее:</b> Общая переплата = Сумма × Ставка × Годы, рассчитанная на полную первоначальную сумму за весь срок.',
                '<b>Стоит дороже, чем кажется:</b> Эффективная ставка по add-on кредиту примерно вдвое выше заявленной, так как баланс фактически снижается, но проценты начисляются, как если бы этого не происходило.',
                '<b>Следите за этим методом:</b> Всегда уточняйте, использует ли кредит add-on проценты или стандартную амортизацию — при одинаковой заявленной ставке реальная стоимость сильно отличается.',
            ],
            howto: [
                { question: 'Почему add-on проценты стоят намного дороже?', answer: '<p>Потому что проценты рассчитываются так, будто вы должны весь первоначальный баланс на протяжении всего срока, хотя фактически погашаете его каждый месяц — вы фактически платите проценты за уже погашенные деньги.</p>' },
                { question: 'Как узнать, использует ли мой кредит add-on проценты?', answer: '<p>Проверьте кредитный договор или спросите у кредитора напрямую — если общая переплата была рассчитана один раз заранее на полную сумму, а не пересчитывалась ежемесячно на снижающийся остаток, это add-on кредит.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Сумма кредита', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Ставка Add-On', type: 'number', unit: '%/год', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Срок кредита', type: 'number', unit: 'лет', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Общая переплата', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Общая сумма к возврату', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Ежемесячный платёж', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'pievienoto-procentu-kalkulators',
            title: 'Pievienoto Procentu (Add-On) Kalkulators',
            h1: 'Pievienoto Procentu Kalkulators',
            meta_title: 'Add-On Procentu Kalkulators | Kopējā Summa un Ikmēneša Maksājums',
            meta_description: 'Aprēķiniet kopējos procentus un ikmēneša maksājumu, izmantojot pievienoto procentu (add-on) metodi, kas izplatīta dažos patēriņa un auto kredītos.',
            short_answer: 'Šis kalkulators aprēķina maksājumus pēc "add-on" (pievienoto) procentu metodes, kur kopējie procenti par visu termiņu tiek aprēķināti iepriekš no sākotnējās pamatsummas un pievienoti pirms sadalīšanas vienādos maksājumos — metode, kas maksā vairāk nekā standarta amortizācija pie tās pašas norādītās likmes.',
            intro_text: '<p>Add-on metode aprēķina procentus no visas sākotnējās pamatsummas par visu aizdevuma termiņu iepriekš, tad pievieno šos procentus pamatsummai un sadala kopsummu vienādos ikmēneša maksājumos. Tā kā procenti tiek iekasēti no sākotnējā atlikuma visu laiku — pat atmaksājot to — šī metode dod daudz augstāku efektīvo likmi nekā standarta amortizācija pie tās pašas norādītās procentu likmes.</p><p><b>Daži patēriņa kredīti, mazumtirdzniecības nomaksas plāni un vecāka stila auto kredīti</b> joprojām izmanto add-on procentus.</p>',
            key_points: [
                '<b>Procenti aprēķināti iepriekš:</b> Kopējie procenti = Pamatsumma × Likme × Gadi, aprēķināti no pilnas sākotnējās summas par visu termiņu.',
                '<b>Maksā vairāk, nekā šķiet:</b> Efektīvā procentu likme add-on aizdevumam ir aptuveni divreiz augstāka par norādīto likmi, jo atlikums faktiski samazinās, bet procenti tiek iekasēti tā, it kā tas nenotiktu.',
                '<b>Sekojiet šai metodei:</b> Vienmēr jautājiet, vai aizdevums izmanto add-on procentus vai standarta amortizāciju — tā pati norādītā likme dod ļoti atšķirīgas reālas izmaksas.',
            ],
            howto: [
                { question: 'Kāpēc add-on procenti maksā tik daudz vairāk?', answer: '<p>Tāpēc, ka procenti tiek aprēķināti tā, it kā jūs būtu parādā visu sākotnējo atlikumu visu termiņu, lai gan faktiski to atmaksājat katru mēnesi — jūs faktiski maksājat procentus par jau atmaksātu naudu.</p>' },
                { question: 'Kā zināt, vai mans aizdevums izmanto add-on procentus?', answer: '<p>Pārbaudiet aizdevuma līgumu vai jautājiet aizdevējam tieši — ja kopējie procenti tika aprēķināti vienreiz iepriekš no pilnas summas, nevis pārrēķināti katru mēnesi no samazinošā atlikuma, tas ir add-on aizdevums.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Aizdevuma Summa', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Add-On Procentu Likme', type: 'number', unit: '%/gadā', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Aizdevuma Termiņš', type: 'number', unit: 'gadi', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Kopējie Procenti', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Kopējā Atmaksājamā Summa', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Ikmēneša Maksājums', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-odsetek-doliczanych',
            title: 'Kalkulator Odsetek Doliczanych (Add-On)',
            h1: 'Kalkulator Odsetek Doliczanych',
            meta_title: 'Kalkulator Odsetek Add-On | Całkowita Kwota i Rata Miesięczna',
            meta_description: 'Oblicz całkowite odsetki i ratę miesięczną metodą odsetek doliczanych (add-on), powszechną w niektórych kredytach konsumenckich i samochodowych.',
            short_answer: 'Ten kalkulator oblicza raty metodą odsetek "add-on" (doliczanych), gdzie całkowite odsetki za cały okres są obliczane z góry od pierwotnej kwoty głównej i dodawane przed podziałem na równe raty — metoda, która kosztuje więcej niż standardowa amortyzacja przy tej samej podanej stopie.',
            intro_text: '<p>Metoda add-on oblicza odsetki od pełnej pierwotnej kwoty głównej za cały okres kredytu z góry, następnie dodaje te odsetki do kapitału i dzieli sumę na równe raty miesięczne. Ponieważ odsetki są naliczane od pierwotnego salda przez cały czas — nawet w miarę jego spłaty — ta metoda daje znacznie wyższą efektywną stopę niż standardowa amortyzacja przy tej samej podanej stopie procentowej.</p><p><b>Niektóre kredyty konsumenckie, plany ratalne w sklepach i starsze kredyty samochodowe</b> nadal używają odsetek add-on.</p>',
            key_points: [
                '<b>Odsetki obliczane z góry:</b> Całkowite odsetki = Kapitał × Stopa × Lata, obliczone od pełnej pierwotnej kwoty za cały okres.',
                '<b>Kosztuje więcej niż się wydaje:</b> Efektywna stopa procentowa kredytu add-on jest w przybliżeniu dwukrotnie wyższa od podanej stopy, ponieważ saldo faktycznie maleje, ale odsetki są naliczane tak, jakby tak nie było.',
                '<b>Uważaj na tę metodę:</b> Zawsze pytaj, czy kredyt wykorzystuje odsetki add-on czy standardową amortyzację — ta sama podana stopa daje bardzo różne rzeczywiste koszty.',
            ],
            howto: [
                { question: 'Dlaczego odsetki add-on kosztują tak dużo więcej?', answer: '<p>Ponieważ odsetki są obliczane tak, jakbyś był winien pełne pierwotne saldo przez cały okres, mimo że faktycznie spłacasz je co miesiąc — faktycznie płacisz odsetki od już spłaconych pieniędzy.</p>' },
                { question: 'Jak sprawdzić, czy mój kredyt wykorzystuje odsetki add-on?', answer: '<p>Sprawdź umowę kredytową lub zapytaj bezpośrednio kredytodawcę — jeśli całkowite odsetki zostały obliczone raz z góry od pełnego kapitału, a nie przeliczane co miesiąc od malejącego salda, to jest kredyt add-on.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Kredytu', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Stopa Odsetek Add-On', type: 'number', unit: '%/rok', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Okres Kredytowania', type: 'number', unit: 'lat', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Suma Odsetek', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Całkowita Kwota do Spłaty', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Rata Miesięczna', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-interes-add-on',
            title: 'Calculadora de Interés Add-On (Añadido)',
            h1: 'Calculadora de Interés Add-On',
            meta_title: 'Calculadora Interés Add-On | Pago Total y Cuota Mensual',
            meta_description: 'Calcula el interés total y la cuota mensual usando el método de interés add-on, común en algunos préstamos de consumo y de auto.',
            short_answer: 'Esta calculadora calcula pagos bajo el método de interés "add-on" (añadido), donde el interés total del plazo completo se calcula por adelantado sobre el capital original y se añade antes de dividirlo en pagos iguales — un método que cuesta más que la amortización estándar a la misma tasa declarada.',
            intro_text: '<p>El método add-on calcula el interés sobre todo el capital original durante todo el plazo del préstamo por adelantado, luego añade ese interés al capital y divide el total en cuotas mensuales iguales. Como el interés se cobra sobre el saldo original todo el tiempo —incluso mientras lo pagas— este método produce una tasa efectiva mucho más alta que la amortización estándar a la misma tasa declarada.</p><p><b>Algunos préstamos de consumo, planes de pago a plazos en tiendas y préstamos de auto de estilo antiguo</b> aún usan interés add-on.</p>',
            key_points: [
                '<b>Interés calculado por adelantado:</b> Interés Total = Capital × Tasa × Años, calculado sobre el monto original completo durante todo el plazo.',
                '<b>Cuesta más de lo que parece:</b> La tasa de interés efectiva de un préstamo add-on es aproximadamente el doble de la tasa declarada, ya que tu saldo en realidad va disminuyendo pero se te cobra como si no fuera así.',
                '<b>Ten cuidado con este método:</b> Pregunta siempre si un préstamo usa interés add-on o amortización estándar — la misma tasa declarada produce costos reales muy diferentes.',
            ],
            howto: [
                { question: '¿Por qué el interés add-on cuesta tanto más?', answer: '<p>Porque el interés se calcula como si debieras el saldo original completo durante todo el plazo, aunque en realidad lo estés pagando cada mes — efectivamente pagas intereses por dinero que ya has devuelto.</p>' },
                { question: '¿Cómo sé si mi préstamo usa interés add-on?', answer: '<p>Revisa tu contrato de préstamo o pregunta directamente a tu prestamista — si el interés total se calculó una vez por adelantado sobre el capital completo en lugar de recalcularse mensualmente sobre un saldo decreciente, es un préstamo add-on.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto del Préstamo', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Tasa de Interés Add-On', type: 'number', unit: '%/año', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Plazo del Préstamo', type: 'number', unit: 'años', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Interés Total', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Monto Total a Devolver', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Cuota Mensual', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-interet-add-on',
            title: 'Calculateur d’Intérêt Add-On (Ajouté)',
            h1: 'Calculateur d’Intérêt Add-On',
            meta_title: 'Calculateur Intérêt Add-On | Remboursement Total et Mensualité',
            meta_description: 'Calculez l’intérêt total et la mensualité avec la méthode d’intérêt add-on, courante dans certains prêts à la consommation et automobiles.',
            short_answer: 'Ce calculateur calcule les paiements selon la méthode d’intérêt "add-on" (ajouté), où l’intérêt total pour toute la durée est calculé à l’avance sur le capital initial et ajouté avant division en paiements égaux — une méthode qui coûte plus cher que l’amortissement standard au même taux affiché.',
            intro_text: '<p>La méthode add-on calcule l’intérêt sur la totalité du capital initial pour toute la durée du prêt à l’avance, puis ajoute cet intérêt au capital et divise le total en mensualités égales. Comme l’intérêt est facturé sur le solde initial tout le temps — même à mesure que vous le remboursez — cette méthode produit un taux effectif bien plus élevé que l’amortissement standard au même taux affiché.</p><p><b>Certains prêts à la consommation, plans de paiement échelonné en magasin et prêts automobiles à l’ancienne</b> utilisent encore l’intérêt add-on.</p>',
            key_points: [
                '<b>Intérêt calculé à l’avance :</b> Intérêt Total = Capital × Taux × Années, calculé sur le montant initial complet pour toute la durée.',
                '<b>Coûte plus cher qu’il n’y paraît :</b> Le taux d’intérêt effectif d’un prêt add-on est environ le double du taux affiché, car votre solde diminue réellement mais vous êtes facturé comme si ce n’était pas le cas.',
                '<b>Méfiez-vous de cette méthode :</b> Demandez toujours si un prêt utilise l’intérêt add-on ou l’amortissement standard — le même taux affiché produit des coûts réels très différents.',
            ],
            howto: [
                { question: 'Pourquoi l’intérêt add-on coûte-t-il tellement plus cher ?', answer: '<p>Parce que l’intérêt est calculé comme si vous deviez le solde initial complet pendant toute la durée, même si vous le remboursez chaque mois — vous payez effectivement des intérêts sur de l’argent déjà remboursé.</p>' },
                { question: 'Comment savoir si mon prêt utilise l’intérêt add-on ?', answer: '<p>Vérifiez votre contrat de prêt ou demandez directement à votre prêteur — si l’intérêt total a été calculé une fois à l’avance sur le capital complet plutôt que recalculé mensuellement sur un solde décroissant, c’est un prêt add-on.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant du Prêt', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Taux d’Intérêt Add-On', type: 'number', unit: '%/an', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Durée du Prêt', type: 'number', unit: 'ans', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Intérêts Totaux', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Montant Total à Rembourser', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Mensualité', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-interesse-add-on',
            title: 'Calcolatore Interesse Add-On (Aggiunto)',
            h1: 'Calcolatore Interesse Add-On',
            meta_title: 'Calcolatore Interesse Add-On | Rimborso Totale e Rata Mensile',
            meta_description: 'Calcola l’interesse totale e la rata mensile con il metodo dell’interesse add-on, comune in alcuni prestiti al consumo e auto.',
            short_answer: 'Questo calcolatore calcola i pagamenti con il metodo dell’interesse "add-on" (aggiunto), dove l’interesse totale per l’intera durata viene calcolato in anticipo sul capitale originale e aggiunto prima di dividerlo in rate uguali — un metodo che costa più dell’ammortamento standard allo stesso tasso dichiarato.',
            intro_text: '<p>Il metodo add-on calcola l’interesse sull’intero capitale originale per tutta la durata del prestito in anticipo, poi aggiunge quell’interesse al capitale e divide il totale in rate mensili uguali. Poiché l’interesse viene addebitato sul saldo originale per tutto il tempo — anche mentre lo si rimborsa — questo metodo produce un tasso effettivo molto più alto dell’ammortamento standard allo stesso tasso dichiarato.</p><p><b>Alcuni prestiti al consumo, piani rateali al dettaglio e prestiti auto di vecchio stile</b> usano ancora l’interesse add-on.</p>',
            key_points: [
                '<b>Interesse calcolato in anticipo:</b> Interesse Totale = Capitale × Tasso × Anni, calcolato sull’intero importo originale per tutta la durata.',
                '<b>Costa più di quanto sembri:</b> Il tasso di interesse effettivo di un prestito add-on è circa il doppio del tasso dichiarato, poiché il saldo in realtà diminuisce ma viene addebitato come se non lo facesse.',
                '<b>Attenzione a questo metodo:</b> Chiedi sempre se un prestito usa interesse add-on o ammortamento standard — lo stesso tasso dichiarato produce costi reali molto diversi.',
            ],
            howto: [
                { question: 'Perché l’interesse add-on costa così tanto di più?', answer: '<p>Perché l’interesse viene calcolato come se dovessi l’intero saldo originale per tutta la durata, anche se in realtà lo stai rimborsando ogni mese — di fatto paghi interessi su denaro già restituito.</p>' },
                { question: 'Come faccio a sapere se il mio prestito usa interesse add-on?', answer: '<p>Controlla il tuo contratto di prestito o chiedi direttamente al tuo prestatore — se l’interesse totale è stato calcolato una volta in anticipo sul capitale completo anziché ricalcolato mensilmente su un saldo decrescente, è un prestito add-on.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo del Prestito', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Tasso di Interesse Add-On', type: 'number', unit: '%/anno', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Durata del Prestito', type: 'number', unit: 'anni', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Interessi Totali', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Importo Totale da Rimborsare', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Rata Mensile', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'aufschlagszins-rechner',
            title: 'Aufschlagszins-Rechner (Add-On)',
            h1: 'Aufschlagszins-Rechner',
            meta_title: 'Add-On-Zins-Rechner | Gesamtrückzahlung und Monatsrate',
            meta_description: 'Berechnen Sie Gesamtzinsen und monatliche Rate mit der Add-On-Zinsmethode, die bei manchen Verbraucher- und Autokrediten üblich ist.',
            short_answer: 'Dieser Rechner berechnet Zahlungen nach der "Add-On"-Zinsmethode, bei der die Gesamtzinsen für die gesamte Laufzeit im Voraus auf das ursprüngliche Kapital berechnet und vor der Aufteilung in gleiche Raten hinzugefügt werden — eine Methode, die bei gleichem Nominalzins mehr kostet als die Standardtilgung.',
            intro_text: '<p>Die Add-On-Methode berechnet Zinsen auf das gesamte ursprüngliche Kapital für die gesamte Kreditlaufzeit im Voraus, fügt diese Zinsen dann zum Kapital hinzu und teilt die Summe in gleiche Monatsraten auf. Da Zinsen die ganze Zeit auf den ursprünglichen Saldo berechnet werden — selbst während Sie ihn abzahlen — führt diese Methode zu einem deutlich höheren effektiven Zinssatz als die Standardtilgung bei gleichem Nominalzins.</p><p><b>Manche Verbraucherkredite, Ratenzahlungspläne im Einzelhandel und ältere Autokredite</b> verwenden noch Add-On-Zinsen.</p>',
            key_points: [
                '<b>Zinsen im Voraus berechnet:</b> Gesamtzinsen = Kapital × Zinssatz × Jahre, berechnet auf den vollen ursprünglichen Betrag für die gesamte Laufzeit.',
                '<b>Kostet mehr, als es aussieht:</b> Der effektive Zinssatz eines Add-On-Kredits ist etwa doppelt so hoch wie der angegebene Satz, da Ihr Saldo tatsächlich sinkt, Ihnen aber so berechnet wird, als wäre dies nicht der Fall.',
                '<b>Achten Sie auf diese Methode:</b> Fragen Sie immer, ob ein Kredit Add-On-Zinsen oder Standardtilgung verwendet — derselbe angegebene Zinssatz führt zu sehr unterschiedlichen realen Kosten.',
            ],
            howto: [
                { question: 'Warum kostet Add-On-Zins so viel mehr?', answer: '<p>Weil Zinsen so berechnet werden, als würden Sie den vollen ursprünglichen Saldo über die gesamte Laufzeit schulden, obwohl Sie ihn tatsächlich jeden Monat abzahlen — Sie zahlen effektiv Zinsen auf bereits zurückgezahltes Geld.</p>' },
                { question: 'Wie erkenne ich, ob mein Kredit Add-On-Zinsen verwendet?', answer: '<p>Prüfen Sie Ihren Kreditvertrag oder fragen Sie direkt Ihren Kreditgeber — wenn die Gesamtzinsen einmalig im Voraus auf das volle Kapital berechnet wurden, statt monatlich auf einem sinkenden Saldo neu berechnet zu werden, handelt es sich um einen Add-On-Kredit.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kreditbetrag', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Add-On-Zinssatz', type: 'number', unit: '%/Jahr', min: 0.1, max: 50, placeholder: '6' },
                { name: 'years', label: 'Kreditlaufzeit', type: 'number', unit: 'Jahre', min: 1, max: 30, placeholder: '3' },
            ],
            outputs: [
                { name: 'total_interest', label: 'Gesamtzinsen', unit: '$', precision: 2 },
                { name: 'total_payback', label: 'Gesamtrückzahlungsbetrag', unit: '$', precision: 2 },
                { name: 'monthly_payment', label: 'Monatliche Rate', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1031: Present Value Calculator
// ============================================================
const presentValue: ToolDef = {
    id: '1031',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'future_value', default: 10000 },
            { key: 'rate_pct', default: 5 },
            { key: 'years', default: 10 },
        ],
        formulas: {
            present_value: 'future_value/(1+rate_pct/100)^years',
            discount_amount: 'future_value - future_value/(1+rate_pct/100)^years',
        },
        outputs: [
            { key: 'present_value', precision: 2 },
            { key: 'discount_amount', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'present-value-calculator',
            title: 'Present Value Calculator - Time Value of Money',
            h1: 'Present Value Calculator',
            meta_title: 'Present Value Calculator | Discount a Future Amount to Today',
            meta_description: 'Calculate the present value of a future sum of money, given a discount rate and time period — the core time-value-of-money calculation.',
            short_answer: 'This calculator computes the present value of a future amount of money — how much a sum you\'ll receive in the future is actually worth today, once you account for the time value of money at a given discount rate.',
            intro_text: '<p>A dollar today is worth more than a dollar in the future, because today\'s dollar can be invested and grow. Present value "discounts" a future sum back to today\'s equivalent, using a chosen discount rate that reflects what that money could otherwise earn.</p><p><b>Anyone comparing a future payment or investment</b> — a lawsuit settlement paid over time, a bond\'s future payout, or an investment return promised years from now — uses present value to judge whether the future amount is genuinely worth waiting for compared to money in hand today.</p>',
            key_points: [
                '<b>Formula:</b> PV = FV / (1 + r)ⁿ, where FV is the future value, r is the discount rate, and n is the number of years.',
                '<b>Inverse of Future Value:</b> This is the mirror image of a standard compound interest calculation — it discounts backward instead of growing forward.',
                '<b>Discount Rate Choice Matters:</b> A higher discount rate makes the present value lower, since it implies the money could earn more elsewhere in the meantime.',
            ],
            howto: [
                { question: 'What discount rate should I use?', answer: '<p>Commonly your expected investment return, cost of capital, or a risk-free rate like a treasury bond yield — the "right" rate depends on the specific financial decision being evaluated.</p>' },
                { question: 'Why is a future dollar worth less than today\'s dollar?', answer: '<p>Because a dollar in hand today can be invested and grow through interest or returns — a dollar received later missed out on that growth opportunity, which is exactly what the discount rate captures.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Future Value', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Discount Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Number of Years', type: 'number', unit: 'years', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Present Value', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Total Discount', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-tekushchey-stoimosti-deneg',
            title: 'Калькулятор текущей стоимости денег',
            h1: 'Калькулятор текущей стоимости',
            meta_title: 'Калькулятор PV | Дисконтирование будущей суммы к сегодня',
            meta_description: 'Рассчитайте текущую стоимость будущей суммы денег при заданной ставке дисконтирования и периоде времени.',
            short_answer: 'Этот калькулятор вычисляет текущую стоимость будущей суммы денег — сколько реально стоит сегодня сумма, которую вы получите в будущем, с учётом временной стоимости денег при заданной ставке дисконтирования.',
            intro_text: '<p>Доллар сегодня стоит больше, чем доллар в будущем, потому что сегодняшний доллар можно инвестировать и он вырастет. Текущая стоимость «дисконтирует» будущую сумму до сегодняшнего эквивалента, используя выбранную ставку дисконтирования, отражающую, сколько эти деньги могли бы заработать иначе.</p><p><b>Любой, кто сравнивает будущий платёж или инвестицию</b> — выплату по иску во времени, будущую выплату по облигации или доходность инвестиции через годы — использует текущую стоимость, чтобы оценить, действительно ли стоит ждать будущую сумму по сравнению с деньгами на руках сегодня.</p>',
            key_points: [
                '<b>Формула:</b> PV = FV / (1 + r)ⁿ, где FV — будущая стоимость, r — ставка дисконтирования, n — число лет.',
                '<b>Обратное к будущей стоимости:</b> Это зеркальное отражение стандартного расчёта сложных процентов — дисконтирование назад вместо роста вперёд.',
                '<b>Выбор ставки дисконтирования важен:</b> Более высокая ставка снижает текущую стоимость, так как подразумевает, что деньги могли бы заработать больше в другом месте.',
            ],
            howto: [
                { question: 'Какую ставку дисконтирования использовать?', answer: '<p>Обычно это ожидаемая доходность инвестиций, стоимость капитала или безрисковая ставка вроде доходности гособлигаций — «правильная» ставка зависит от конкретного финансового решения.</p>' },
                { question: 'Почему будущий доллар стоит меньше сегодняшнего?', answer: '<p>Потому что доллар на руках сегодня можно инвестировать, и он вырастет за счёт процентов или доходности — доллар, полученный позже, упустил эту возможность роста, что и отражает ставка дисконтирования.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Будущая стоимость', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Ставка дисконтирования', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Число лет', type: 'number', unit: 'лет', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Текущая стоимость', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Общий дисконт', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'sabrigo-vertibas-kalkulators',
            title: 'Šābrīža Vērtības Kalkulators - Naudas Laika Vērtība',
            h1: 'Šābrīža Vērtības Kalkulators',
            meta_title: 'PV Kalkulators | Diskontējiet Nākotnes Summu uz Šodienu',
            meta_description: 'Aprēķiniet nākotnes naudas summas šābrīža vērtību, ņemot vērā diskonta likmi un laika periodu.',
            short_answer: 'Šis kalkulators aprēķina nākotnes naudas summas šābrīža vērtību — cik reāli ir vērta summa, ko saņemsiet nākotnē, ņemot vērā naudas laika vērtību pie noteiktas diskonta likmes.',
            intro_text: '<p>Dolārs šodien ir vērts vairāk nekā dolārs nākotnē, jo šodienas dolāru var ieguldīt, un tas augs. Šābrīža vērtība "diskontē" nākotnes summu atpakaļ uz šodienas ekvivalentu, izmantojot izvēlēto diskonta likmi, kas atspoguļo, ko šī nauda citādi varētu nopelnīt.</p><p><b>Ikviens, kas salīdzina nākotnes maksājumu vai investīciju</b> — tiesas prāvas izmaksu laika gaitā, obligācijas nākotnes izmaksu vai investīciju atdevi pēc gadiem — izmanto šābrīža vērtību, lai novērtētu, vai nākotnes summa patiešām ir vērts gaidīt salīdzinājumā ar naudu rokā šodien.</p>',
            key_points: [
                '<b>Formula:</b> PV = FV / (1 + r)ⁿ, kur FV ir nākotnes vērtība, r ir diskonta likme, un n ir gadu skaits.',
                '<b>Nākotnes vērtības pretstats:</b> Tas ir spoguļattēls standarta salikto procentu aprēķinam — diskontē atpakaļ, nevis aug uz priekšu.',
                '<b>Diskonta likmes izvēlei ir nozīme:</b> Augstāka diskonta likme padara šābrīža vērtību zemāku, jo tas nozīmē, ka nauda citur varētu nopelnīt vairāk.',
            ],
            howto: [
                { question: 'Kādu diskonta likmi izmantot?', answer: '<p>Parasti tā ir jūsu gaidāmā investīciju atdeve, kapitāla izmaksas vai bezriska likme, piemēram, valsts obligāciju ienesīgums — "pareizā" likme atkarīga no konkrētā finanšu lēmuma.</p>' },
                { question: 'Kāpēc nākotnes dolārs ir vērts mazāk nekā šodienas dolārs?', answer: '<p>Tāpēc, ka dolāru rokā šodien var ieguldīt, un tas augs ar procentiem vai atdevi — vēlāk saņemts dolārs palaida garām šo izaugsmes iespēju, ko tieši atspoguļo diskonta likme.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Nākotnes Vērtība', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Diskonta Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Gadu Skaits', type: 'number', unit: 'gadi', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Šābrīža Vērtība', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Kopējais Diskonts', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wartosci-biezacej',
            title: 'Kalkulator Wartości Bieżącej - Wartość Pieniądza w Czasie',
            h1: 'Kalkulator Wartości Bieżącej',
            meta_title: 'Kalkulator PV | Zdyskontuj Przyszłą Kwotę do Dziś',
            meta_description: 'Oblicz wartość bieżącą przyszłej sumy pieniędzy, przy danej stopie dyskontowej i okresie czasu.',
            short_answer: 'Ten kalkulator oblicza wartość bieżącą przyszłej kwoty pieniędzy — ile jest faktycznie warta dziś suma, którą otrzymasz w przyszłości, uwzględniając wartość pieniądza w czasie przy danej stopie dyskontowej.',
            intro_text: '<p>Dolar dzisiaj jest wart więcej niż dolar w przyszłości, ponieważ dzisiejszy dolar można zainwestować i będzie rósł. Wartość bieżąca "dyskontuje" przyszłą sumę z powrotem do dzisiejszego odpowiednika, używając wybranej stopy dyskontowej, która odzwierciedla, ile te pieniądze mogłyby zarobić gdzie indziej.</p><p><b>Każdy, kto porównuje przyszłą płatność lub inwestycję</b> — wypłatę z ugody sądowej rozłożoną w czasie, przyszłą wypłatę z obligacji lub zwrot z inwestycji obiecany za lata — używa wartości bieżącej, aby ocenić, czy przyszła kwota naprawdę warta jest czekania w porównaniu z pieniędzmi w ręku dzisiaj.</p>',
            key_points: [
                '<b>Wzór:</b> PV = FV / (1 + r)ⁿ, gdzie FV to wartość przyszła, r to stopa dyskontowa, a n to liczba lat.',
                '<b>Odwrotność wartości przyszłej:</b> To lustrzane odbicie standardowego obliczenia procentu składanego — dyskontuje wstecz zamiast rosnąć naprzód.',
                '<b>Wybór stopy dyskontowej ma znaczenie:</b> Wyższa stopa dyskontowa obniża wartość bieżącą, ponieważ oznacza, że pieniądze mogłyby zarobić więcej gdzie indziej.',
            ],
            howto: [
                { question: 'Jakiej stopy dyskontowej powinienem użyć?', answer: '<p>Zazwyczaj jest to oczekiwany zwrot z inwestycji, koszt kapitału lub stopa wolna od ryzyka, jak rentowność obligacji skarbowych — "właściwa" stopa zależy od konkretnej decyzji finansowej.</p>' },
                { question: 'Dlaczego przyszły dolar jest wart mniej niż dzisiejszy?', answer: '<p>Ponieważ dolar w ręku dzisiaj można zainwestować i będzie rósł dzięki odsetkom lub zwrotom — dolar otrzymany później stracił tę szansę wzrostu, co dokładnie odzwierciedla stopa dyskontowa.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Wartość Przyszła', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Stopa Dyskontowa', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Liczba Lat', type: 'number', unit: 'lat', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Wartość Bieżąca', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Całkowity Dyskont', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-valor-presente',
            title: 'Calculadora de Valor Presente - Valor del Dinero en el Tiempo',
            h1: 'Calculadora de Valor Presente',
            meta_title: 'Calculadora VP | Descuenta una Cantidad Futura a Hoy',
            meta_description: 'Calcula el valor presente de una suma futura de dinero, dada una tasa de descuento y un período de tiempo.',
            short_answer: 'Esta calculadora calcula el valor presente de una cantidad futura de dinero — cuánto vale realmente hoy una suma que recibirás en el futuro, considerando el valor del dinero en el tiempo a una tasa de descuento dada.',
            intro_text: '<p>Un dólar hoy vale más que un dólar en el futuro, porque el dólar de hoy puede invertirse y crecer. El valor presente "descuenta" una suma futura a su equivalente actual, usando una tasa de descuento elegida que refleja lo que ese dinero podría ganar de otra manera.</p><p><b>Cualquiera que compare un pago futuro o una inversión</b> —una liquidación judicial pagada con el tiempo, el pago futuro de un bono, o un rendimiento de inversión prometido dentro de años— usa el valor presente para juzgar si la cantidad futura realmente vale la pena esperar en comparación con el dinero en mano hoy.</p>',
            key_points: [
                '<b>Fórmula:</b> VP = VF / (1 + r)ⁿ, donde VF es el valor futuro, r es la tasa de descuento y n es el número de años.',
                '<b>Inverso del valor futuro:</b> Esta es la imagen espejo de un cálculo estándar de interés compuesto — descuenta hacia atrás en lugar de crecer hacia adelante.',
                '<b>La elección de la tasa de descuento importa:</b> Una tasa de descuento más alta hace que el valor presente sea menor, ya que implica que el dinero podría ganar más en otro lugar.',
            ],
            howto: [
                { question: '¿Qué tasa de descuento debo usar?', answer: '<p>Comúnmente tu rendimiento de inversión esperado, el costo de capital, o una tasa libre de riesgo como el rendimiento de un bono del tesoro — la tasa "correcta" depende de la decisión financiera específica que se evalúa.</p>' },
                { question: '¿Por qué un dólar futuro vale menos que el dólar de hoy?', answer: '<p>Porque un dólar en mano hoy puede invertirse y crecer mediante intereses o rendimientos — un dólar recibido después se perdió esa oportunidad de crecimiento, que es exactamente lo que captura la tasa de descuento.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Valor Futuro', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Tasa de Descuento', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Número de Años', type: 'number', unit: 'años', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Valor Presente', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Descuento Total', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-valeur-actuelle',
            title: 'Calculateur de Valeur Actuelle - Valeur Temporelle de l’Argent',
            h1: 'Calculateur de Valeur Actuelle',
            meta_title: 'Calculateur VA | Actualiser un Montant Futur à Aujourd’hui',
            meta_description: 'Calculez la valeur actuelle d’une somme future, selon un taux d’actualisation et une période de temps.',
            short_answer: 'Ce calculateur calcule la valeur actuelle d’un montant futur — combien vaut réellement aujourd’hui une somme que vous recevrez à l’avenir, en tenant compte de la valeur temporelle de l’argent à un taux d’actualisation donné.',
            intro_text: '<p>Un dollar aujourd’hui vaut plus qu’un dollar dans le futur, car le dollar d’aujourd’hui peut être investi et croître. La valeur actuelle "actualise" une somme future vers son équivalent d’aujourd’hui, en utilisant un taux d’actualisation choisi qui reflète ce que cet argent pourrait autrement rapporter.</p><p><b>Quiconque compare un paiement futur ou un investissement</b> — un règlement judiciaire payé dans le temps, le paiement futur d’une obligation, ou un rendement d’investissement promis dans des années — utilise la valeur actuelle pour juger si le montant futur vaut vraiment la peine d’attendre par rapport à l’argent en main aujourd’hui.</p>',
            key_points: [
                '<b>Formule :</b> VA = VF / (1 + r)ⁿ, où VF est la valeur future, r le taux d’actualisation, et n le nombre d’années.',
                '<b>Inverse de la valeur future :</b> C’est l’image miroir d’un calcul standard d’intérêt composé — cela actualise vers l’arrière au lieu de croître vers l’avant.',
                '<b>Le choix du taux d’actualisation compte :</b> Un taux d’actualisation plus élevé rend la valeur actuelle plus basse, car cela implique que l’argent pourrait rapporter davantage ailleurs.',
            ],
            howto: [
                { question: 'Quel taux d’actualisation dois-je utiliser ?', answer: '<p>Généralement votre rendement d’investissement attendu, le coût du capital, ou un taux sans risque comme le rendement d’une obligation d’État — le taux "correct" dépend de la décision financière spécifique évaluée.</p>' },
                { question: 'Pourquoi un dollar futur vaut-il moins que le dollar d’aujourd’hui ?', answer: '<p>Parce qu’un dollar en main aujourd’hui peut être investi et croître grâce aux intérêts ou rendements — un dollar reçu plus tard a manqué cette opportunité de croissance, ce que le taux d’actualisation capture exactement.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Valeur Future', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Taux d’Actualisation', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Nombre d’Années', type: 'number', unit: 'ans', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Valeur Actuelle', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Actualisation Totale', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-valore-attuale',
            title: 'Calcolatore Valore Attuale - Valore Temporale del Denaro',
            h1: 'Calcolatore Valore Attuale',
            meta_title: 'Calcolatore VA | Attualizza un Importo Futuro a Oggi',
            meta_description: 'Calcola il valore attuale di una somma futura, dato un tasso di attualizzazione e un periodo di tempo.',
            short_answer: 'Questo calcolatore calcola il valore attuale di un importo futuro — quanto vale realmente oggi una somma che riceverai in futuro, considerando il valore temporale del denaro a un dato tasso di attualizzazione.',
            intro_text: '<p>Un dollaro oggi vale più di un dollaro in futuro, perché il dollaro di oggi può essere investito e crescere. Il valore attuale "attualizza" una somma futura al suo equivalente odierno, usando un tasso di attualizzazione scelto che riflette quanto quel denaro potrebbe altrimenti guadagnare.</p><p><b>Chiunque confronti un pagamento futuro o un investimento</b> — una liquidazione giudiziaria pagata nel tempo, il pagamento futuro di un’obbligazione, o un rendimento di investimento promesso tra anni — usa il valore attuale per giudicare se l’importo futuro vale davvero la pena attendere rispetto al denaro in mano oggi.</p>',
            key_points: [
                '<b>Formula:</b> VA = VF / (1 + r)ⁿ, dove VF è il valore futuro, r è il tasso di attualizzazione, e n è il numero di anni.',
                '<b>Inverso del valore futuro:</b> Questa è l’immagine speculare di un calcolo standard di interesse composto — attualizza all’indietro invece di crescere in avanti.',
                '<b>La scelta del tasso di attualizzazione conta:</b> Un tasso di attualizzazione più alto rende il valore attuale più basso, poiché implica che il denaro potrebbe guadagnare di più altrove.',
            ],
            howto: [
                { question: 'Quale tasso di attualizzazione dovrei usare?', answer: '<p>Comunemente il tuo rendimento di investimento atteso, il costo del capitale, o un tasso privo di rischio come il rendimento di un titolo di stato — il tasso "corretto" dipende dalla specifica decisione finanziaria valutata.</p>' },
                { question: 'Perché un dollaro futuro vale meno del dollaro di oggi?', answer: '<p>Perché un dollaro in mano oggi può essere investito e crescere tramite interessi o rendimenti — un dollaro ricevuto più tardi ha perso quell’opportunità di crescita, che è esattamente ciò che il tasso di attualizzazione cattura.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Valore Futuro', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Tasso di Attualizzazione', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Numero di Anni', type: 'number', unit: 'anni', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Valore Attuale', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Attualizzazione Totale', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'barwert-rechner',
            title: 'Barwert-Rechner - Zeitwert des Geldes',
            h1: 'Barwert-Rechner',
            meta_title: 'Barwert-Rechner | Zukünftigen Betrag auf Heute Abzinsen',
            meta_description: 'Berechnen Sie den Barwert eines zukünftigen Geldbetrags, gegeben einem Abzinsungssatz und Zeitraum.',
            short_answer: 'Dieser Rechner berechnet den Barwert eines zukünftigen Geldbetrags — wie viel eine Summe, die Sie in Zukunft erhalten, heute tatsächlich wert ist, unter Berücksichtigung des Zeitwerts des Geldes bei einem gegebenen Abzinsungssatz.',
            intro_text: '<p>Ein Dollar heute ist mehr wert als ein Dollar in der Zukunft, weil der heutige Dollar investiert werden kann und wächst. Der Barwert "diskontiert" eine zukünftige Summe zurück auf ihr heutiges Äquivalent, unter Verwendung eines gewählten Abzinsungssatzes, der widerspiegelt, was dieses Geld sonst verdienen könnte.</p><p><b>Jeder, der eine zukünftige Zahlung oder Investition vergleicht</b> — eine über Zeit ausgezahlte Prozessvergleichssumme, die zukünftige Auszahlung einer Anleihe, oder eine Jahre entfernte versprochene Anlagerendite — nutzt den Barwert, um zu beurteilen, ob der zukünftige Betrag wirklich das Warten wert ist im Vergleich zu Geld in der Hand heute.</p>',
            key_points: [
                '<b>Formel:</b> BW = ZW / (1 + r)ⁿ, wobei ZW der zukünftige Wert, r der Abzinsungssatz und n die Anzahl der Jahre ist.',
                '<b>Umkehrung des Zukunftswerts:</b> Dies ist das Spiegelbild einer Standard-Zinseszinsberechnung — es diskontiert rückwärts statt vorwärts zu wachsen.',
                '<b>Wahl des Abzinsungssatzes ist wichtig:</b> Ein höherer Abzinsungssatz macht den Barwert niedriger, da er impliziert, dass das Geld andernorts mehr verdienen könnte.',
            ],
            howto: [
                { question: 'Welchen Abzinsungssatz sollte ich verwenden?', answer: '<p>Üblicherweise Ihre erwartete Anlagerendite, Kapitalkosten, oder einen risikofreien Satz wie eine Staatsanleihenrendite — der "richtige" Satz hängt von der spezifischen zu bewertenden finanziellen Entscheidung ab.</p>' },
                { question: 'Warum ist ein zukünftiger Dollar weniger wert als der heutige Dollar?', answer: '<p>Weil ein Dollar in der Hand heute investiert werden kann und durch Zinsen oder Renditen wächst — ein später erhaltener Dollar hat diese Wachstumschance verpasst, was genau der Abzinsungssatz erfasst.</p>' },
            ],
            inputs: [
                { name: 'future_value', label: 'Zukünftiger Wert', type: 'number', unit: '$', min: 0.01, max: 100000000, placeholder: '10000' },
                { name: 'rate_pct', label: 'Abzinsungssatz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'years', label: 'Anzahl der Jahre', type: 'number', unit: 'Jahre', min: 0, max: 100, placeholder: '10' },
            ],
            outputs: [
                { name: 'present_value', label: 'Barwert', unit: '$', precision: 2 },
                { name: 'discount_amount', label: 'Gesamtabzinsung', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1032: APY Comparison Calculator
// ============================================================
const apyComparison: ToolDef = {
    id: '1032',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'rate_a', default: 5 },
            { key: 'n_a', default: 12 },
            { key: 'rate_b', default: 5.1 },
            { key: 'n_b', default: 1 },
        ],
        formulas: {
            apy_a: '((1+rate_a/100/n_a)^n_a - 1)*100',
            apy_b: '((1+rate_b/100/n_b)^n_b - 1)*100',
            difference: '((1+rate_a/100/n_a)^n_a - 1)*100 - ((1+rate_b/100/n_b)^n_b - 1)*100',
        },
        outputs: [
            { key: 'apy_a', precision: 3 },
            { key: 'apy_b', precision: 3 },
            { key: 'difference', precision: 3 },
        ],
    },
    locales: {
        en: {
            slug: 'apy-comparison-calculator',
            title: 'APY Comparison Calculator - Compare Two Rates',
            h1: 'APY Comparison Calculator',
            meta_title: 'APY Comparison Calculator | Compare Two Savings Rates Fairly',
            meta_description: 'Compare two savings or loan offers with different nominal rates and compounding frequencies by converting both to their true Annual Percentage Yield (APY).',
            short_answer: 'This calculator compares two rate offers — each with its own nominal rate and compounding frequency — by converting both to their true Annual Percentage Yield (APY), so you can see which one actually pays or costs more.',
            intro_text: '<p>Banks advertise rates with different compounding frequencies — one savings account might offer 5% compounded monthly, another 5.1% compounded annually. Comparing the nominal rates alone is misleading; only the effective annual yield (APY) tells you which one truly earns more.</p><p><b>Shoppers comparing savings accounts, CDs, or loan offers</b> use this side-by-side comparison to avoid being misled by a headline rate that looks better but actually yields less once compounding frequency is properly accounted for.</p>',
            key_points: [
                '<b>Same Math, Two Offers:</b> Converts both nominal rates to APY using the standard compounding formula, then compares them directly.',
                '<b>A Lower Nominal Rate Can Win:</b> More frequent compounding can make a lower advertised rate actually yield more than a higher rate compounded less often.',
                '<b>Always Compare APY, Not Nominal Rate:</b> This is the single most important rule when shopping for savings accounts or comparing loan offers.',
            ],
            howto: [
                { question: 'Why would a bank advertise a lower rate that compounds more often?', answer: '<p>Marketing sometimes emphasizes the nominal rate rather than APY since it can look attractive on its own — always check the actual APY disclosed (required by law in many countries) rather than just the headline rate.</p>' },
                { question: 'Does this work for comparing loan offers too?', answer: '<p>Yes — the same logic applies to loans: a lower nominal APR compounded more frequently could have a higher effective cost than a slightly higher APR compounded less often.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Offer A - Nominal Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Offer A - Compounding Frequency', type: 'select', options: [
                    { value: '1', label: 'Annually' },
                    { value: '4', label: 'Quarterly' },
                    { value: '12', label: 'Monthly' },
                    { value: '365', label: 'Daily' },
                ] },
                { name: 'rate_b', label: 'Offer B - Nominal Rate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Offer B - Compounding Frequency', type: 'select', options: [
                    { value: '1', label: 'Annually' },
                    { value: '4', label: 'Quarterly' },
                    { value: '12', label: 'Monthly' },
                    { value: '365', label: 'Daily' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Offer A - Effective APY', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Offer B - Effective APY', unit: '%', precision: 3 },
                { name: 'difference', label: 'Difference (A − B)', unit: 'pp', precision: 3 },
            ],
        },
        ru: {
            slug: 'kalkulyator-sravneniya-apy',
            title: 'Калькулятор сравнения APY - две ставки',
            h1: 'Калькулятор сравнения APY',
            meta_title: 'Калькулятор сравнения APY | Честно сравните два предложения',
            meta_description: 'Сравните два предложения по вкладу или кредиту с разными номинальными ставками и периодичностью капитализации, переведя оба в реальную годовую доходность (APY).',
            short_answer: 'Этот калькулятор сравнивает два предложения по ставке — каждое со своей номинальной ставкой и периодичностью капитализации — переводя оба в реальную годовую доходность (APY), чтобы увидеть, какое действительно приносит больше или стоит дороже.',
            intro_text: '<p>Банки рекламируют ставки с разной периодичностью капитализации — один вклад может предлагать 5% с ежемесячной капитализацией, другой — 5.1% с ежегодной. Сравнение только номинальных ставок вводит в заблуждение; только эффективная годовая доходность (APY) показывает, какая действительно приносит больше.</p><p><b>Те, кто сравнивает вклады, депозиты или кредитные предложения</b>, используют это параллельное сравнение, чтобы не быть введёнными в заблуждение заголовочной ставкой, которая выглядит лучше, но реально даёт меньше.</p>',
            key_points: [
                '<b>Одна математика, два предложения:</b> Переводит обе номинальные ставки в APY по стандартной формуле капитализации, затем сравнивает напрямую.',
                '<b>Более низкая номинальная ставка может победить:</b> Более частая капитализация может сделать более низкую рекламируемую ставку реально более доходной, чем более высокую ставку с редкой капитализацией.',
                '<b>Всегда сравнивайте APY, а не номинальную ставку:</b> Это самое важное правило при выборе вклада или сравнении кредитных предложений.',
            ],
            howto: [
                { question: 'Почему банк рекламирует более низкую ставку с более частой капитализацией?', answer: '<p>Маркетинг иногда делает акцент на номинальной ставке, а не на APY, так как она сама по себе выглядит привлекательно — всегда проверяйте фактический раскрываемый APY, а не только заголовочную ставку.</p>' },
                { question: 'Работает ли это и для сравнения кредитных предложений?', answer: '<p>Да — та же логика применима к кредитам: более низкий номинальный APR с более частой капитализацией может иметь более высокую эффективную стоимость, чем немного более высокий APR с редкой капитализацией.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Предложение A - Номинальная ставка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Предложение A - Периодичность капитализации', type: 'select', options: [
                    { value: '1', label: 'Ежегодно' },
                    { value: '4', label: 'Ежеквартально' },
                    { value: '12', label: 'Ежемесячно' },
                    { value: '365', label: 'Ежедневно' },
                ] },
                { name: 'rate_b', label: 'Предложение B - Номинальная ставка', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Предложение B - Периодичность капитализации', type: 'select', options: [
                    { value: '1', label: 'Ежегодно' },
                    { value: '4', label: 'Ежеквартально' },
                    { value: '12', label: 'Ежемесячно' },
                    { value: '365', label: 'Ежедневно' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Предложение A - Эффективный APY', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Предложение B - Эффективный APY', unit: '%', precision: 3 },
                { name: 'difference', label: 'Разница (A − B)', unit: 'п.п.', precision: 3 },
            ],
        },
        lv: {
            slug: 'apy-salidzinasanas-kalkulators',
            title: 'APY Salīdzināšanas Kalkulators - Divas Likmes',
            h1: 'APY Salīdzināšanas Kalkulators',
            meta_title: 'APY Salīdzināšanas Kalkulators | Godīgi Salīdziniet Divus Piedāvājumus',
            meta_description: 'Salīdziniet divus noguldījuma vai aizdevuma piedāvājumus ar atšķirīgām nominālajām likmēm un kapitalizācijas biežumu, pārrēķinot abus uz reālo gada ienesīgumu (APY).',
            short_answer: 'Šis kalkulators salīdzina divus likmes piedāvājumus — katru ar savu nominālo likmi un kapitalizācijas biežumu — pārrēķinot abus uz reālo gada ienesīgumu (APY), lai redzētu, kurš patiešām maksā vai nes vairāk.',
            intro_text: '<p>Bankas reklamē likmes ar atšķirīgu kapitalizācijas biežumu — viens noguldījums var piedāvāt 5% ar ikmēneša kapitalizāciju, cits — 5.1% ar ikgadēju. Tikai nominālo likmju salīdzināšana maldina; tikai efektīvais gada ienesīgums (APY) parāda, kurš patiešām nes vairāk.</p><p><b>Cilvēki, kas salīdzina noguldījumus, depozītus vai kredīta piedāvājumus</b>, izmanto šo salīdzinājumu blakus, lai neļautu sevi maldināt ar galveno likmi, kas izskatās labāka, bet reāli dod mazāk.</p>',
            key_points: [
                '<b>Viena matemātika, divi piedāvājumi:</b> Pārrēķina abas nominālās likmes uz APY, izmantojot standarta kapitalizācijas formulu, tad salīdzina tieši.',
                '<b>Zemāka nominālā likme var uzvarēt:</b> Biežāka kapitalizācija var padarīt zemāku reklamēto likmi reāli ienesīgāku nekā augstāku likmi ar retāku kapitalizāciju.',
                '<b>Vienmēr salīdziniet APY, ne nominālo likmi:</b> Tas ir vissvarīgākais noteikums, izvēloties noguldījumu vai salīdzinot kredīta piedāvājumus.',
            ],
            howto: [
                { question: 'Kāpēc banka reklamē zemāku likmi ar biežāku kapitalizāciju?', answer: '<p>Mārketings dažreiz uzsver nominālo likmi, nevis APY, jo tā pati par sevi izskatās pievilcīga — vienmēr pārbaudiet faktisko atklāto APY, nevis tikai galveno likmi.</p>' },
                { question: 'Vai tas der arī kredīta piedāvājumu salīdzināšanai?', answer: '<p>Jā — tā pati loģika attiecas uz aizdevumiem: zemāks nominālais APR ar biežāku kapitalizāciju var būt ar augstāku efektīvo izmaksu nekā nedaudz augstāks APR ar retāku kapitalizāciju.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Piedāvājums A - Nominālā Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Piedāvājums A - Kapitalizācijas Biežums', type: 'select', options: [
                    { value: '1', label: 'Ik gadu' },
                    { value: '4', label: 'Ik ceturksni' },
                    { value: '12', label: 'Ik mēnesi' },
                    { value: '365', label: 'Ik dienu' },
                ] },
                { name: 'rate_b', label: 'Piedāvājums B - Nominālā Likme', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Piedāvājums B - Kapitalizācijas Biežums', type: 'select', options: [
                    { value: '1', label: 'Ik gadu' },
                    { value: '4', label: 'Ik ceturksni' },
                    { value: '12', label: 'Ik mēnesi' },
                    { value: '365', label: 'Ik dienu' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Piedāvājums A - Efektīvais APY', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Piedāvājums B - Efektīvais APY', unit: '%', precision: 3 },
                { name: 'difference', label: 'Starpība (A − B)', unit: 'p.p.', precision: 3 },
            ],
        },
        pl: {
            slug: 'kalkulator-porownania-apy',
            title: 'Kalkulator Porównania APY - Dwie Stopy',
            h1: 'Kalkulator Porównania APY',
            meta_title: 'Kalkulator Porównania APY | Uczciwie Porównaj Dwie Oferty',
            meta_description: 'Porównaj dwie oferty oszczędnościowe lub kredytowe o różnych stopach nominalnych i częstotliwości kapitalizacji, przeliczając obie na rzeczywistą roczną stopę zwrotu (APY).',
            short_answer: 'Ten kalkulator porównuje dwie oferty stóp procentowych — każda z własną stopą nominalną i częstotliwością kapitalizacji — przeliczając obie na rzeczywistą roczną stopę zwrotu (APY), abyś mógł zobaczyć, która faktycznie płaci lub kosztuje więcej.',
            intro_text: '<p>Banki reklamują stopy o różnej częstotliwości kapitalizacji — jedno konto oszczędnościowe może oferować 5% kapitalizowane miesięcznie, inne 5,1% kapitalizowane rocznie. Porównywanie samych stóp nominalnych jest mylące; tylko efektywna roczna stopa zwrotu (APY) pokazuje, która faktycznie zarabia więcej.</p><p><b>Osoby porównujące konta oszczędnościowe, lokaty czy oferty kredytowe</b> używają tego porównania obok siebie, aby nie dać się zwieść nagłówkowej stopie, która wygląda lepiej, ale faktycznie daje mniej.</p>',
            key_points: [
                '<b>Ta sama matematyka, dwie oferty:</b> Przelicza obie stopy nominalne na APY za pomocą standardowego wzoru kapitalizacji, a następnie porównuje je bezpośrednio.',
                '<b>Niższa stopa nominalna może wygrać:</b> Częstsza kapitalizacja może sprawić, że niższa reklamowana stopa faktycznie da wyższy zwrot niż wyższa stopa kapitalizowana rzadziej.',
                '<b>Zawsze porównuj APY, nie stopę nominalną:</b> To najważniejsza zasada przy wyborze konta oszczędnościowego lub porównywaniu ofert kredytowych.',
            ],
            howto: [
                { question: 'Dlaczego bank reklamuje niższą stopę z częstszą kapitalizacją?', answer: '<p>Marketing czasem podkreśla stopę nominalną zamiast APY, ponieważ sama w sobie wygląda atrakcyjnie — zawsze sprawdzaj rzeczywiste ujawnione APY, a nie tylko stopę nagłówkową.</p>' },
                { question: 'Czy to działa też przy porównywaniu ofert kredytowych?', answer: '<p>Tak — ta sama logika dotyczy kredytów: niższe nominalne APR kapitalizowane częściej może mieć wyższy efektywny koszt niż nieco wyższe APR kapitalizowane rzadziej.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Oferta A - Stopa Nominalna', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Oferta A - Częstotliwość Kapitalizacji', type: 'select', options: [
                    { value: '1', label: 'Rocznie' },
                    { value: '4', label: 'Kwartalnie' },
                    { value: '12', label: 'Miesięcznie' },
                    { value: '365', label: 'Dziennie' },
                ] },
                { name: 'rate_b', label: 'Oferta B - Stopa Nominalna', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Oferta B - Częstotliwość Kapitalizacji', type: 'select', options: [
                    { value: '1', label: 'Rocznie' },
                    { value: '4', label: 'Kwartalnie' },
                    { value: '12', label: 'Miesięcznie' },
                    { value: '365', label: 'Dziennie' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Oferta A - Efektywne APY', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Oferta B - Efektywne APY', unit: '%', precision: 3 },
                { name: 'difference', label: 'Różnica (A − B)', unit: 'pp', precision: 3 },
            ],
        },
        es: {
            slug: 'calculadora-comparacion-tae',
            title: 'Calculadora de Comparación de TAE - Dos Tasas',
            h1: 'Calculadora de Comparación de TAE',
            meta_title: 'Calculadora de Comparación TAE | Compara Dos Ofertas Justamente',
            meta_description: 'Compara dos ofertas de ahorro o préstamo con diferentes tasas nominales y frecuencias de capitalización, convirtiendo ambas a su Tasa Anual Efectiva (TAE) real.',
            short_answer: 'Esta calculadora compara dos ofertas de tasas — cada una con su propia tasa nominal y frecuencia de capitalización — convirtiendo ambas a su Tasa Anual Efectiva (TAE) real, para que puedas ver cuál realmente paga o cuesta más.',
            intro_text: '<p>Los bancos anuncian tasas con diferentes frecuencias de capitalización — una cuenta de ahorro puede ofrecer 5% capitalizado mensualmente, otra 5,1% capitalizado anualmente. Comparar solo las tasas nominales es engañoso; solo el rendimiento anual efectivo (TAE) te dice cuál realmente gana más.</p><p><b>Quienes comparan cuentas de ahorro, CDs u ofertas de préstamo</b> usan esta comparación lado a lado para evitar ser engañados por una tasa titular que parece mejor pero realmente rinde menos una vez que se considera correctamente la frecuencia de capitalización.</p>',
            key_points: [
                '<b>La misma matemática, dos ofertas:</b> Convierte ambas tasas nominales a TAE usando la fórmula de capitalización estándar, luego las compara directamente.',
                '<b>Una tasa nominal más baja puede ganar:</b> Una capitalización más frecuente puede hacer que una tasa anunciada más baja rinda en realidad más que una tasa más alta capitalizada con menos frecuencia.',
                '<b>Siempre compara la TAE, no la tasa nominal:</b> Esta es la regla más importante al buscar cuentas de ahorro o comparar ofertas de préstamo.',
            ],
            howto: [
                { question: '¿Por qué un banco anunciaría una tasa más baja que capitaliza con más frecuencia?', answer: '<p>El marketing a veces enfatiza la tasa nominal en lugar de la TAE, ya que puede verse atractiva por sí sola — siempre verifica la TAE real divulgada en lugar de solo la tasa titular.</p>' },
                { question: '¿Esto funciona también para comparar ofertas de préstamo?', answer: '<p>Sí — la misma lógica se aplica a los préstamos: una APR nominal más baja capitalizada con mayor frecuencia podría tener un costo efectivo más alto que una APR ligeramente más alta capitalizada con menos frecuencia.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Oferta A - Tasa Nominal', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Oferta A - Frecuencia de Capitalización', type: 'select', options: [
                    { value: '1', label: 'Anual' },
                    { value: '4', label: 'Trimestral' },
                    { value: '12', label: 'Mensual' },
                    { value: '365', label: 'Diaria' },
                ] },
                { name: 'rate_b', label: 'Oferta B - Tasa Nominal', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Oferta B - Frecuencia de Capitalización', type: 'select', options: [
                    { value: '1', label: 'Anual' },
                    { value: '4', label: 'Trimestral' },
                    { value: '12', label: 'Mensual' },
                    { value: '365', label: 'Diaria' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Oferta A - TAE Efectiva', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Oferta B - TAE Efectiva', unit: '%', precision: 3 },
                { name: 'difference', label: 'Diferencia (A − B)', unit: 'pp', precision: 3 },
            ],
        },
        fr: {
            slug: 'calculateur-comparaison-apy',
            title: 'Calculateur de Comparaison APY - Deux Taux',
            h1: 'Calculateur de Comparaison APY',
            meta_title: 'Calculateur de Comparaison APY | Comparez Équitablement Deux Offres',
            meta_description: 'Comparez deux offres d’épargne ou de prêt avec des taux nominaux et fréquences de capitalisation différents, en convertissant les deux en leur véritable rendement annuel en pourcentage (APY).',
            short_answer: 'Ce calculateur compare deux offres de taux — chacune avec son propre taux nominal et sa fréquence de capitalisation — en convertissant les deux en leur véritable rendement annuel en pourcentage (APY), afin que vous puissiez voir laquelle rapporte ou coûte réellement le plus.',
            intro_text: '<p>Les banques annoncent des taux avec des fréquences de capitalisation différentes — un compte épargne peut offrir 5 % capitalisé mensuellement, un autre 5,1 % capitalisé annuellement. Comparer uniquement les taux nominaux est trompeur ; seul le rendement annuel effectif (APY) indique lequel rapporte réellement le plus.</p><p><b>Ceux qui comparent des comptes épargne, des CD ou des offres de prêt</b> utilisent cette comparaison côte à côte pour éviter d’être trompés par un taux affiché qui semble meilleur mais rapporte en réalité moins une fois la fréquence de capitalisation correctement prise en compte.</p>',
            key_points: [
                '<b>Même calcul, deux offres :</b> Convertit les deux taux nominaux en APY à l’aide de la formule de capitalisation standard, puis les compare directement.',
                '<b>Un taux nominal plus bas peut gagner :</b> Une capitalisation plus fréquente peut faire qu’un taux affiché plus bas rapporte en réalité plus qu’un taux plus élevé capitalisé moins souvent.',
                '<b>Comparez toujours l’APY, pas le taux nominal :</b> C’est la règle la plus importante lors de la recherche de comptes épargne ou de la comparaison d’offres de prêt.',
            ],
            howto: [
                { question: 'Pourquoi une banque annoncerait-elle un taux plus bas qui capitalise plus souvent ?', answer: '<p>Le marketing met parfois l’accent sur le taux nominal plutôt que sur l’APY car il peut sembler attractif en soi — vérifiez toujours l’APY réel divulgué plutôt que simplement le taux affiché.</p>' },
                { question: 'Cela fonctionne-t-il aussi pour comparer des offres de prêt ?', answer: '<p>Oui — la même logique s’applique aux prêts : un TAEG nominal plus bas capitalisé plus fréquemment pourrait avoir un coût effectif plus élevé qu’un TAEG légèrement plus élevé capitalisé moins souvent.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Offre A - Taux Nominal', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Offre A - Fréquence de Capitalisation', type: 'select', options: [
                    { value: '1', label: 'Annuelle' },
                    { value: '4', label: 'Trimestrielle' },
                    { value: '12', label: 'Mensuelle' },
                    { value: '365', label: 'Quotidienne' },
                ] },
                { name: 'rate_b', label: 'Offre B - Taux Nominal', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Offre B - Fréquence de Capitalisation', type: 'select', options: [
                    { value: '1', label: 'Annuelle' },
                    { value: '4', label: 'Trimestrielle' },
                    { value: '12', label: 'Mensuelle' },
                    { value: '365', label: 'Quotidienne' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Offre A - APY Effectif', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Offre B - APY Effectif', unit: '%', precision: 3 },
                { name: 'difference', label: 'Différence (A − B)', unit: 'pp', precision: 3 },
            ],
        },
        it: {
            slug: 'calcolatore-confronto-apy',
            title: 'Calcolatore Confronto APY - Due Tassi',
            h1: 'Calcolatore Confronto APY',
            meta_title: 'Calcolatore Confronto APY | Confronta Equamente Due Offerte',
            meta_description: 'Confronta due offerte di risparmio o prestito con tassi nominali e frequenze di capitalizzazione diversi, convertendo entrambi nel vero rendimento percentuale annuo (APY).',
            short_answer: 'Questo calcolatore confronta due offerte di tasso — ciascuna con il proprio tasso nominale e frequenza di capitalizzazione — convertendo entrambe nel vero rendimento percentuale annuo (APY), così puoi vedere quale rende o costa realmente di più.',
            intro_text: '<p>Le banche pubblicizzano tassi con frequenze di capitalizzazione diverse — un conto di risparmio potrebbe offrire il 5% capitalizzato mensilmente, un altro il 5,1% capitalizzato annualmente. Confrontare solo i tassi nominali è fuorviante; solo il rendimento annuo effettivo (APY) dice quale rende realmente di più.</p><p><b>Chi confronta conti di risparmio, certificati di deposito o offerte di prestito</b> usa questo confronto affiancato per evitare di essere fuorviato da un tasso in evidenza che sembra migliore ma in realtà rende meno una volta considerata correttamente la frequenza di capitalizzazione.</p>',
            key_points: [
                '<b>Stessa matematica, due offerte:</b> Converte entrambi i tassi nominali in APY usando la formula di capitalizzazione standard, poi li confronta direttamente.',
                '<b>Un tasso nominale più basso può vincere:</b> Una capitalizzazione più frequente può far sì che un tasso pubblicizzato più basso renda in realtà di più di un tasso più alto capitalizzato meno spesso.',
                '<b>Confronta sempre l’APY, non il tasso nominale:</b> Questa è la regola più importante quando si cercano conti di risparmio o si confrontano offerte di prestito.',
            ],
            howto: [
                { question: 'Perché una banca pubblicizzerebbe un tasso più basso che si capitalizza più spesso?', answer: '<p>Il marketing a volte enfatizza il tasso nominale invece dell’APY poiché può sembrare attraente di per sé — controlla sempre l’APY effettivo dichiarato invece del solo tasso in evidenza.</p>' },
                { question: 'Funziona anche per confrontare offerte di prestito?', answer: '<p>Sì — la stessa logica si applica ai prestiti: un TAN nominale più basso capitalizzato più frequentemente potrebbe avere un costo effettivo più alto di un TAN leggermente più alto capitalizzato meno spesso.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Offerta A - Tasso Nominale', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Offerta A - Frequenza di Capitalizzazione', type: 'select', options: [
                    { value: '1', label: 'Annuale' },
                    { value: '4', label: 'Trimestrale' },
                    { value: '12', label: 'Mensile' },
                    { value: '365', label: 'Giornaliera' },
                ] },
                { name: 'rate_b', label: 'Offerta B - Tasso Nominale', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Offerta B - Frequenza di Capitalizzazione', type: 'select', options: [
                    { value: '1', label: 'Annuale' },
                    { value: '4', label: 'Trimestrale' },
                    { value: '12', label: 'Mensile' },
                    { value: '365', label: 'Giornaliera' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Offerta A - APY Effettivo', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Offerta B - APY Effettivo', unit: '%', precision: 3 },
                { name: 'difference', label: 'Differenza (A − B)', unit: 'pp', precision: 3 },
            ],
        },
        de: {
            slug: 'apy-vergleichsrechner',
            title: 'APY-Vergleichsrechner - Zwei Zinssätze',
            h1: 'APY-Vergleichsrechner',
            meta_title: 'APY-Vergleichsrechner | Zwei Sparzinsen Fair Vergleichen',
            meta_description: 'Vergleichen Sie zwei Spar- oder Kreditangebote mit unterschiedlichen Nominalzinsen und Zinsperioden, indem Sie beide in ihre wahre effektive Jahresrendite (APY) umrechnen.',
            short_answer: 'Dieser Rechner vergleicht zwei Zinsangebote — jedes mit eigenem Nominalzins und eigener Zinsperiode — indem beide in ihre wahre effektive Jahresrendite (APY) umgerechnet werden, sodass Sie sehen können, welches tatsächlich mehr einbringt oder kostet.',
            intro_text: '<p>Banken bewerben Zinssätze mit unterschiedlichen Zinsperioden — ein Sparkonto bietet vielleicht 5 % monatlich verzinst, ein anderes 5,1 % jährlich verzinst. Der Vergleich nur der Nominalzinsen ist irreführend; nur die effektive Jahresrendite (APY) zeigt, welches wirklich mehr einbringt.</p><p><b>Wer Sparkonten, Festgelder oder Kreditangebote vergleicht</b>, nutzt diesen direkten Vergleich, um sich nicht von einem Schlagzeilenzins täuschen zu lassen, der besser aussieht, aber bei korrekter Berücksichtigung der Zinsperiode tatsächlich weniger einbringt.</p>',
            key_points: [
                '<b>Gleiche Mathematik, zwei Angebote:</b> Rechnet beide Nominalzinsen mit der Standard-Verzinsungsformel in APY um und vergleicht sie dann direkt.',
                '<b>Ein niedrigerer Nominalzins kann gewinnen:</b> Häufigere Verzinsung kann einen niedrigeren beworbenen Zins tatsächlich mehr einbringen lassen als einen höheren, seltener verzinsten Zins.',
                '<b>Vergleichen Sie immer APY, nicht den Nominalzins:</b> Dies ist die wichtigste Regel bei der Suche nach Sparkonten oder dem Vergleich von Kreditangeboten.',
            ],
            howto: [
                { question: 'Warum würde eine Bank einen niedrigeren, häufiger verzinsten Zins bewerben?', answer: '<p>Das Marketing betont manchmal den Nominalzins statt den APY, da er für sich genommen attraktiv wirken kann — prüfen Sie immer den tatsächlich offengelegten APY statt nur den Schlagzeilenzins.</p>' },
                { question: 'Funktioniert dies auch zum Vergleich von Kreditangeboten?', answer: '<p>Ja — die gleiche Logik gilt für Kredite: ein niedrigerer nominaler Sollzins mit häufigerer Verzinsung könnte höhere effektive Kosten haben als ein etwas höherer, seltener verzinster Sollzins.</p>' },
            ],
            inputs: [
                { name: 'rate_a', label: 'Angebot A - Nominalzins', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5' },
                { name: 'n_a', label: 'Angebot A - Zinsperiode', type: 'select', options: [
                    { value: '1', label: 'Jährlich' },
                    { value: '4', label: 'Vierteljährlich' },
                    { value: '12', label: 'Monatlich' },
                    { value: '365', label: 'Täglich' },
                ] },
                { name: 'rate_b', label: 'Angebot B - Nominalzins', type: 'number', unit: '%', min: 0, max: 100, placeholder: '5.1' },
                { name: 'n_b', label: 'Angebot B - Zinsperiode', type: 'select', options: [
                    { value: '1', label: 'Jährlich' },
                    { value: '4', label: 'Vierteljährlich' },
                    { value: '12', label: 'Monatlich' },
                    { value: '365', label: 'Täglich' },
                ] },
            ],
            outputs: [
                { name: 'apy_a', label: 'Angebot A - Effektiver APY', unit: '%', precision: 3 },
                { name: 'apy_b', label: 'Angebot B - Effektiver APY', unit: '%', precision: 3 },
                { name: 'difference', label: 'Differenz (A − B)', unit: 'pp', precision: 3 },
            ],
        },
    },
}

export const tools: ToolDef[] = [aprToEar, solveRate, ruleOf72, continuousCompounding, dailyRate, blendedRate, realRate, addOnInterest, presentValue, apyComparison]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: INTEREST_APR_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: INTEREST_APR_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} interest & APR calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
