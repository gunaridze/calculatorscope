// One-off script: seeds 12 new Saving & Investing calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-finance-saving-investing-calculators.ts
//
// Tool IDs 1033-1044, category_id '26' (Saving & Investing, under Finance).
// All formulas verified numerically against known reference figures before
// writing this file (e.g. $50k goal / 6% / 10yr -> $305.10/month required).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SAVING_INVESTING_CATEGORY_ID = '26'

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

// Shared annuity sub-expressions (verified numerically before use)
const R = '(annual_rate/100/12)'
const N = '(years*12)'

// ============================================================
// 1033: Savings Goal Calculator
// ============================================================
const savingsGoal: ToolDef = {
    id: '1033',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'goal_amount', default: 50000 },
            { key: 'annual_rate', default: 6 },
            { key: 'years', default: 10 },
        ],
        formulas: {
            monthly_deposit: `goal_amount*${R} / ((1+${R})^${N} - 1)`,
            total_contributed: `(goal_amount*${R} / ((1+${R})^${N} - 1)) * ${N}`,
        },
        outputs: [
            { key: 'monthly_deposit', precision: 2 },
            { key: 'total_contributed', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'savings-goal-calculator',
            title: 'Savings Goal Calculator - Required Monthly Deposit',
            h1: 'Savings Goal Calculator',
            meta_title: 'Savings Goal Calculator | How Much to Save Monthly',
            meta_description: 'Calculate how much you need to save each month to reach a specific savings goal, given your timeframe and expected rate of return.',
            short_answer: 'This calculator tells you exactly how much to deposit each month to reach a specific savings goal by a target date, given an expected annual rate of return.',
            intro_text: '<p>Working backward from a savings goal to a monthly deposit amount uses the future value of an annuity formula — the same math behind retirement calculators, but solved for the payment instead of the final balance. It answers the practical question: "how much do I actually need to set aside each month?"</p><p><b>Anyone with a specific savings target</b> — a big purchase, a milestone birthday trip, a down payment — can use this to turn an abstract goal into a concrete, actionable monthly number.</p>',
            key_points: [
                '<b>Solves for the Payment:</b> Uses the future value of annuity formula, rearranged to find the required monthly deposit.',
                '<b>Rate of Return Matters:</b> A higher assumed return lowers the required monthly deposit, since your money does more of the work — but only if that return is realistic for how you actually save.',
                '<b>Starting From Zero:</b> This assumes no existing savings toward the goal; if you already have some saved, look for a goal calculator that accounts for a starting balance.',
            ],
            howto: [
                { question: 'What rate of return should I assume?', answer: '<p>For a savings account or CD, use the actual rate offered. For an investment account, many use a conservative long-term average (e.g., 4-7%) rather than optimistic recent returns.</p>' },
                { question: 'What if I can\'t afford the monthly amount shown?', answer: '<p>Extend your timeframe, lower your goal amount, or look for a higher-yield savings vehicle — all three levers directly reduce the required monthly deposit.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Savings Goal', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Time to Goal', type: 'number', unit: 'years', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Required Monthly Deposit', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total You Will Contribute', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-celi-nakopleniy',
            title: 'Калькулятор цели накоплений - необходимый ежемесячный взнос',
            h1: 'Калькулятор цели накоплений',
            meta_title: 'Калькулятор цели накоплений | Сколько копить в месяц',
            meta_description: 'Рассчитайте, сколько нужно откладывать каждый месяц, чтобы достичь цели накоплений с учётом срока и ожидаемой доходности.',
            short_answer: 'Этот калькулятор показывает, сколько именно откладывать каждый месяц, чтобы достичь конкретной цели накоплений к нужной дате при заданной ожидаемой годовой доходности.',
            intro_text: '<p>Расчёт от цели накоплений к ежемесячному взносу использует формулу будущей стоимости аннуитета — ту же математику, что стоит за калькуляторами пенсионных накоплений, но решённую относительно платежа, а не итогового баланса.</p><p><b>Любой с конкретной целью накоплений</b> — крупная покупка, юбилейная поездка, первоначальный взнос — может превратить абстрактную цель в конкретную ежемесячную сумму.</p>',
            key_points: [
                '<b>Решает относительно платежа:</b> Использует формулу будущей стоимости аннуитета, преобразованную для нахождения необходимого ежемесячного взноса.',
                '<b>Доходность имеет значение:</b> Более высокая предполагаемая доходность снижает необходимый взнос, поскольку деньги делают больше работы сами.',
                '<b>Старт с нуля:</b> Предполагается отсутствие текущих накоплений на цель; если у вас уже что-то отложено, ищите калькулятор, учитывающий начальный баланс.',
            ],
            howto: [
                { question: 'Какую доходность предполагать?', answer: '<p>Для сберегательного счёта или вклада используйте реальную предлагаемую ставку. Для инвестиционного счёта многие используют консервативное долгосрочное среднее (например, 4-7%).</p>' },
                { question: 'Что если я не могу откладывать показанную сумму?', answer: '<p>Увеличьте срок, снизьте целевую сумму или найдите инструмент с более высокой доходностью — все три рычага напрямую снижают необходимый ежемесячный взнос.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Цель накоплений', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Срок до цели', type: 'number', unit: 'лет', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Необходимый ежемесячный взнос', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Всего вы внесёте', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'uzkrajumu-merka-kalkulators',
            title: 'Uzkrājumu Mērķa Kalkulators - Nepieciešamā Ikmēneša Iemaksa',
            h1: 'Uzkrājumu Mērķa Kalkulators',
            meta_title: 'Uzkrājumu Mērķa Kalkulators | Cik Krāt Katru Mēnesi',
            meta_description: 'Aprēķiniet, cik jums jāuzkrāj katru mēnesi, lai sasniegtu uzkrājumu mērķi, ņemot vērā termiņu un gaidīto ienesīgumu.',
            short_answer: 'Šis kalkulators parāda, cik tieši jāiemaksā katru mēnesi, lai sasniegtu konkrētu uzkrājumu mērķi līdz noteiktam datumam pie dotā gada ienesīguma.',
            intro_text: '<p>Aprēķins no uzkrājumu mērķa uz ikmēneša iemaksu izmanto annuitātes nākotnes vērtības formulu — to pašu matemātiku, kas ir pensijas uzkrājumu kalkulatoru pamatā, bet atrisinātu attiecībā uz maksājumu, nevis gala atlikumu.</p><p><b>Ikviens ar konkrētu uzkrājumu mērķi</b> — liels pirkums, jubilejas ceļojums, sākotnējā iemaksa — var pārvērst abstraktu mērķi konkrētā ikmēneša summā.</p>',
            key_points: [
                '<b>Atrisina attiecībā uz maksājumu:</b> Izmanto annuitātes nākotnes vērtības formulu, pārveidotu, lai atrastu nepieciešamo ikmēneša iemaksu.',
                '<b>Ienesīgumam ir nozīme:</b> Augstāks pieņemtais ienesīgums samazina nepieciešamo iemaksu, jo nauda paveic vairāk darba pati.',
                '<b>Sākums no nulles:</b> Pieņem, ka pašlaik nav uzkrājumu mērķim; ja jums jau kaut kas ir uzkrāts, meklējiet kalkulatoru, kas ņem vērā sākuma atlikumu.',
            ],
            howto: [
                { question: 'Kādu ienesīgumu pieņemt?', answer: '<p>Krājkontam vai depozītam izmantojiet reālo piedāvāto likmi. Investīciju kontam daudzi izmanto konservatīvu ilgtermiņa vidējo (piemēram, 4-7%).</p>' },
                { question: 'Ko darīt, ja nevaru atļauties parādīto summu?', answer: '<p>Pagariniet termiņu, samaziniet mērķa summu vai meklējiet augstāka ienesīguma instrumentu — visi trīs sviras tieši samazina nepieciešamo ikmēneša iemaksu.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Uzkrājumu Mērķis', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Laiks Līdz Mērķim', type: 'number', unit: 'gadi', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Nepieciešamā Ikmēneša Iemaksa', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Kopā Iemaksāsiet', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-celu-oszczednosciowego',
            title: 'Kalkulator Celu Oszczędnościowego - Wymagana Miesięczna Wpłata',
            h1: 'Kalkulator Celu Oszczędnościowego',
            meta_title: 'Kalkulator Celu Oszczędnościowego | Ile Oszczędzać Miesięcznie',
            meta_description: 'Oblicz, ile musisz oszczędzać każdego miesiąca, aby osiągnąć cel oszczędnościowy, biorąc pod uwagę czas i oczekiwaną stopę zwrotu.',
            short_answer: 'Ten kalkulator pokazuje dokładnie, ile wpłacać każdego miesiąca, aby osiągnąć konkretny cel oszczędnościowy do docelowej daty, przy danej oczekiwanej rocznej stopie zwrotu.',
            intro_text: '<p>Obliczenie wstecz od celu oszczędnościowego do kwoty miesięcznej wpłaty wykorzystuje wzór na wartość przyszłą renty — tę samą matematykę, która stoi za kalkulatorami emerytalnymi, ale rozwiązaną względem wpłaty, a nie salda końcowego.</p><p><b>Każdy z konkretnym celem oszczędnościowym</b> — duży zakup, wyjątkowa podróż, wkład własny — może zamienić abstrakcyjny cel w konkretną, miesięczną liczbę.</p>',
            key_points: [
                '<b>Rozwiązuje względem wpłaty:</b> Wykorzystuje wzór na wartość przyszłą renty, przekształcony, aby znaleźć wymaganą miesięczną wpłatę.',
                '<b>Stopa zwrotu ma znaczenie:</b> Wyższa zakładana stopa zwrotu obniża wymaganą wpłatę, ponieważ pieniądze wykonują więcej pracy same.',
                '<b>Start od zera:</b> Zakłada brak istniejących oszczędności na ten cel; jeśli masz już coś odłożone, poszukaj kalkulatora uwzględniającego saldo początkowe.',
            ],
            howto: [
                { question: 'Jaką stopę zwrotu założyć?', answer: '<p>Dla konta oszczędnościowego lub lokaty użyj rzeczywistej oferowanej stopy. Dla konta inwestycyjnego wielu używa konserwatywnej długoterminowej średniej (np. 4-7%).</p>' },
                { question: 'Co jeśli nie stać mnie na pokazaną kwotę?', answer: '<p>Wydłuż okres, obniż kwotę celu lub poszukaj instrumentu o wyższej rentowności — wszystkie trzy dźwignie bezpośrednio zmniejszają wymaganą miesięczną wpłatę.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Cel Oszczędnościowy', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Czas do Celu', type: 'number', unit: 'lat', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Wymagana Miesięczna Wpłata', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Łącznie Wpłacisz', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-meta-de-ahorro',
            title: 'Calculadora de Meta de Ahorro - Depósito Mensual Requerido',
            h1: 'Calculadora de Meta de Ahorro',
            meta_title: 'Calculadora de Meta de Ahorro | Cuánto Ahorrar al Mes',
            meta_description: 'Calcula cuánto necesitas ahorrar cada mes para alcanzar una meta de ahorro específica, según tu plazo y rendimiento esperado.',
            short_answer: 'Esta calculadora te indica exactamente cuánto depositar cada mes para alcanzar una meta de ahorro específica en una fecha objetivo, dado un rendimiento anual esperado.',
            intro_text: '<p>Calcular hacia atrás desde una meta de ahorro hasta un depósito mensual usa la fórmula del valor futuro de una anualidad — la misma matemática detrás de las calculadoras de jubilación, pero resuelta para el pago en lugar del saldo final.</p><p><b>Cualquiera con una meta de ahorro específica</b> —una gran compra, un viaje especial, un pago inicial— puede convertir una meta abstracta en un número mensual concreto y accionable.</p>',
            key_points: [
                '<b>Resuelve para el pago:</b> Usa la fórmula del valor futuro de una anualidad, reorganizada para encontrar el depósito mensual requerido.',
                '<b>El rendimiento importa:</b> Un rendimiento asumido más alto reduce el depósito requerido, ya que tu dinero hace más del trabajo.',
                '<b>Empezando desde cero:</b> Esto asume que no hay ahorros existentes hacia la meta; si ya tienes algo ahorrado, busca una calculadora que considere un saldo inicial.',
            ],
            howto: [
                { question: '¿Qué tasa de rendimiento debo asumir?', answer: '<p>Para una cuenta de ahorro o CD, usa la tasa real ofrecida. Para una cuenta de inversión, muchos usan un promedio conservador a largo plazo (por ejemplo, 4-7%).</p>' },
                { question: '¿Qué pasa si no puedo pagar la cantidad mensual mostrada?', answer: '<p>Extiende tu plazo, reduce tu meta, o busca un vehículo de mayor rendimiento — las tres palancas reducen directamente el depósito mensual requerido.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Meta de Ahorro', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Tiempo hasta la Meta', type: 'number', unit: 'años', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Depósito Mensual Requerido', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total que Aportarás', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-objectif-epargne',
            title: 'Calculateur d’Objectif d’Épargne - Dépôt Mensuel Requis',
            h1: 'Calculateur d’Objectif d’Épargne',
            meta_title: 'Calculateur d’Objectif d’Épargne | Combien Épargner par Mois',
            meta_description: 'Calculez combien vous devez épargner chaque mois pour atteindre un objectif d’épargne spécifique, selon votre échéance et le rendement attendu.',
            short_answer: 'Ce calculateur vous indique exactement combien déposer chaque mois pour atteindre un objectif d’épargne spécifique à une date cible, selon un rendement annuel attendu.',
            intro_text: '<p>Calculer à rebours d’un objectif d’épargne vers un montant de dépôt mensuel utilise la formule de la valeur future d’une rente — les mêmes mathématiques derrière les calculateurs de retraite, mais résolue pour le paiement plutôt que le solde final.</p><p><b>Quiconque a un objectif d’épargne précis</b> — un gros achat, un voyage spécial, un apport — peut transformer un objectif abstrait en un chiffre mensuel concret et actionnable.</p>',
            key_points: [
                '<b>Résout pour le paiement :</b> Utilise la formule de la valeur future d’une rente, réarrangée pour trouver le dépôt mensuel requis.',
                '<b>Le rendement compte :</b> Un rendement supposé plus élevé réduit le dépôt requis, car votre argent fait plus de travail.',
                '<b>Départ de zéro :</b> Cela suppose l’absence d’épargne existante vers l’objectif ; si vous avez déjà quelque chose d’épargné, cherchez un calculateur tenant compte d’un solde de départ.',
            ],
            howto: [
                { question: 'Quel taux de rendement dois-je supposer ?', answer: '<p>Pour un compte épargne ou un CD, utilisez le taux réel offert. Pour un compte d’investissement, beaucoup utilisent une moyenne conservatrice à long terme (par ex. 4-7 %).</p>' },
                { question: 'Que faire si je ne peux pas me permettre le montant mensuel affiché ?', answer: '<p>Prolongez votre échéance, réduisez votre objectif, ou cherchez un véhicule à rendement plus élevé — ces trois leviers réduisent directement le dépôt mensuel requis.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Objectif d’Épargne', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Temps jusqu’à l’Objectif', type: 'number', unit: 'ans', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Dépôt Mensuel Requis', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total que Vous Verserez', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-obiettivo-risparmio',
            title: 'Calcolatore Obiettivo di Risparmio - Deposito Mensile Richiesto',
            h1: 'Calcolatore Obiettivo di Risparmio',
            meta_title: 'Calcolatore Obiettivo di Risparmio | Quanto Risparmiare al Mese',
            meta_description: 'Calcola quanto devi risparmiare ogni mese per raggiungere un obiettivo di risparmio specifico, in base al periodo e al rendimento atteso.',
            short_answer: 'Questo calcolatore ti dice esattamente quanto depositare ogni mese per raggiungere un obiettivo di risparmio specifico entro una data prefissata, dato un rendimento annuo atteso.',
            intro_text: '<p>Calcolare a ritroso da un obiettivo di risparmio a un importo di deposito mensile usa la formula del valore futuro di una rendita — la stessa matematica dietro i calcolatori pensionistici, ma risolta per il pagamento anziché per il saldo finale.</p><p><b>Chiunque abbia un obiettivo di risparmio specifico</b> — un grande acquisto, un viaggio speciale, un anticipo — può trasformare un obiettivo astratto in un numero mensile concreto e attuabile.</p>',
            key_points: [
                '<b>Risolve per il pagamento:</b> Usa la formula del valore futuro di una rendita, riorganizzata per trovare il deposito mensile richiesto.',
                '<b>Il rendimento conta:</b> Un rendimento ipotizzato più alto riduce il deposito richiesto, poiché il tuo denaro fa più lavoro da solo.',
                '<b>Partenza da zero:</b> Questo presuppone nessun risparmio esistente verso l’obiettivo; se hai già qualcosa risparmiato, cerca un calcolatore che consideri un saldo iniziale.',
            ],
            howto: [
                { question: 'Quale tasso di rendimento dovrei ipotizzare?', answer: '<p>Per un conto di risparmio o un CD, usa il tasso reale offerto. Per un conto di investimento, molti usano una media conservativa a lungo termine (es. 4-7%).</p>' },
                { question: 'Cosa succede se non posso permettermi l’importo mensile mostrato?', answer: '<p>Estendi il tuo periodo, riduci il tuo obiettivo, o cerca uno strumento con rendimento più alto — tutte e tre le leve riducono direttamente il deposito mensile richiesto.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Obiettivo di Risparmio', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Tempo per l’Obiettivo', type: 'number', unit: 'anni', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Deposito Mensile Richiesto', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Totale che Verserai', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'sparziel-rechner',
            title: 'Sparziel-Rechner - Erforderliche Monatliche Einzahlung',
            h1: 'Sparziel-Rechner',
            meta_title: 'Sparziel-Rechner | Wie Viel Monatlich Sparen',
            meta_description: 'Berechnen Sie, wie viel Sie monatlich sparen müssen, um ein bestimmtes Sparziel zu erreichen, basierend auf Zeitrahmen und erwarteter Rendite.',
            short_answer: 'Dieser Rechner zeigt Ihnen genau, wie viel Sie monatlich einzahlen müssen, um ein bestimmtes Sparziel bis zu einem Zieldatum zu erreichen, bei einer erwarteten jährlichen Rendite.',
            intro_text: '<p>Die Rückwärtsberechnung von einem Sparziel zu einem monatlichen Einzahlungsbetrag verwendet die Formel des Endwerts einer Rente — dieselbe Mathematik hinter Rentenrechnern, jedoch nach der Zahlung statt nach dem Endsaldo aufgelöst.</p><p><b>Jeder mit einem bestimmten Sparziel</b> — ein großer Kauf, eine besondere Reise, eine Anzahlung — kann ein abstraktes Ziel in eine konkrete, umsetzbare monatliche Zahl verwandeln.</p>',
            key_points: [
                '<b>Löst nach der Zahlung auf:</b> Verwendet die Formel des Rentenendwerts, umgestellt, um die erforderliche monatliche Einzahlung zu finden.',
                '<b>Rendite ist wichtig:</b> Eine höher angenommene Rendite senkt die erforderliche Einzahlung, da Ihr Geld mehr der Arbeit übernimmt.',
                '<b>Start bei Null:</b> Dies setzt voraus, dass noch keine Ersparnisse für das Ziel vorhanden sind; wenn Sie bereits etwas gespart haben, suchen Sie einen Rechner, der einen Startsaldo berücksichtigt.',
            ],
            howto: [
                { question: 'Welche Rendite sollte ich annehmen?', answer: '<p>Für ein Sparkonto oder Festgeld verwenden Sie den tatsächlich angebotenen Zinssatz. Für ein Anlagekonto verwenden viele einen konservativen langfristigen Durchschnitt (z. B. 4-7 %).</p>' },
                { question: 'Was, wenn ich mir den angezeigten monatlichen Betrag nicht leisten kann?', answer: '<p>Verlängern Sie Ihren Zeitrahmen, senken Sie Ihr Zielbetrag, oder suchen Sie ein renditestärkeres Instrument — alle drei Hebel senken direkt die erforderliche monatliche Einzahlung.</p>' },
            ],
            inputs: [
                { name: 'goal_amount', label: 'Sparziel', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Zeit bis zum Ziel', type: 'number', unit: 'Jahre', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'monthly_deposit', label: 'Erforderliche Monatliche Einzahlung', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Insgesamt Eingezahlt', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1034: Future Value of Regular Savings Calculator
// ============================================================
const futureValueSavings: ToolDef = {
    id: '1034',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'initial_deposit', default: 1000 },
            { key: 'monthly_deposit', default: 200 },
            { key: 'annual_rate', default: 6 },
            { key: 'years', default: 10 },
        ],
        formulas: {
            final_value: `initial_deposit*(1+${R})^${N} + monthly_deposit*(((1+${R})^${N}-1)/${R})`,
            total_contributed: `initial_deposit + monthly_deposit*${N}`,
            interest_earned: `(initial_deposit*(1+${R})^${N} + monthly_deposit*(((1+${R})^${N}-1)/${R})) - (initial_deposit + monthly_deposit*${N})`,
        },
        outputs: [
            { key: 'final_value', precision: 2 },
            { key: 'total_contributed', precision: 2 },
            { key: 'interest_earned', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'future-value-of-savings-calculator',
            title: 'Future Value of Savings Calculator',
            h1: 'Future Value of Savings Calculator',
            meta_title: 'Future Value Calculator | Savings Plan Growth',
            meta_description: 'Calculate how much your savings will grow to, given a starting deposit, regular monthly contributions, and an annual rate of return.',
            short_answer: 'This calculator projects how much your savings plan will be worth in the future, combining a starting lump sum with regular monthly contributions growing at a given annual rate.',
            intro_text: '<p>This is the "forward" direction of savings planning: instead of solving for the deposit needed to hit a goal, you plug in what you\'re already planning to save and see where it lands. It combines compound growth on your starting balance with the future value of your ongoing monthly contributions.</p><p><b>Savers with an existing plan</b> use this to check whether their current savings rate is on track for a target, or simply to see the payoff of consistent monthly saving over time.</p>',
            key_points: [
                '<b>Two Growth Sources:</b> Your starting deposit compounds on its own, while monthly contributions build up via the future-value-of-annuity formula.',
                '<b>Consistency Compounds:</b> Small, regular contributions often outgrow a single larger deposit over long time horizons, thanks to how compounding rewards time in the market.',
                '<b>See the Interest Breakdown:</b> The gap between what you contributed and the final value is pure growth from compounding.',
            ],
            howto: [
                { question: 'Does the monthly deposit happen at the start or end of each month?', answer: '<p>This calculator assumes deposits at the end of each month (an "ordinary annuity") — the most common convention for savings plan projections.</p>' },
                { question: 'Can I use this for a workplace retirement account?', answer: '<p>Yes — plug in your current balance as the initial deposit and your regular contribution as the monthly amount for a solid projection, though real accounts may vary contributions over time.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Starting Deposit', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Monthly Contribution', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Time Period', type: 'number', unit: 'years', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Final Value', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total Contributed', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interest Earned', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-budushchey-stoimosti-sberezheniy',
            title: 'Калькулятор будущей стоимости сбережений',
            h1: 'Калькулятор будущей стоимости сбережений',
            meta_title: 'Калькулятор будущей стоимости | Рост плана сбережений',
            meta_description: 'Рассчитайте, до какой суммы вырастут ваши сбережения при начальном взносе, регулярных ежемесячных пополнениях и заданной годовой доходности.',
            short_answer: 'Этот калькулятор прогнозирует, сколько будет стоить ваш план сбережений в будущем, объединяя начальную сумму с регулярными ежемесячными взносами при заданной годовой доходности.',
            intro_text: '<p>Это «прямое» направление планирования сбережений: вместо расчёта необходимого взноса для достижения цели, вы вводите то, что уже планируете откладывать, и видите, к чему это приведёт. Объединяет сложный рост начального баланса с будущей стоимостью текущих ежемесячных взносов.</p><p><b>Вкладчики с существующим планом</b> используют это, чтобы проверить, соответствует ли текущая норма сбережений цели, или просто увидеть отдачу от стабильных ежемесячных сбережений со временем.</p>',
            key_points: [
                '<b>Два источника роста:</b> Начальный взнос растёт сам по себе, а ежемесячные взносы накапливаются по формуле будущей стоимости аннуитета.',
                '<b>Постоянство накапливается:</b> Небольшие регулярные взносы часто перегоняют один крупный взнос на длинных горизонтах благодаря вознаграждению капитализации за время.',
                '<b>Видна разбивка процентов:</b> Разница между внесённым и итоговой суммой — это чистый рост от капитализации.',
            ],
            howto: [
                { question: 'Взнос происходит в начале или в конце месяца?', answer: '<p>Калькулятор предполагает взносы в конце каждого месяца (обычный аннуитет) — самое распространённое соглашение для прогнозов планов сбережений.</p>' },
                { question: 'Можно ли использовать это для пенсионного счёта на работе?', answer: '<p>Да — введите текущий баланс как начальный взнос и регулярный взнос как ежемесячную сумму для надёжного прогноза, хотя реальные взносы могут меняться со временем.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Начальный взнос', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Ежемесячный взнос', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Период', type: 'number', unit: 'лет', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Итоговая стоимость', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Всего внесено', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Полученный доход', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'uzkrajumu-nakotnes-vertibas-kalkulators',
            title: 'Uzkrājumu Nākotnes Vērtības Kalkulators',
            h1: 'Uzkrājumu Nākotnes Vērtības Kalkulators',
            meta_title: 'Nākotnes Vērtības Kalkulators | Uzkrājumu Plāna Izaugsme',
            meta_description: 'Aprēķiniet, cik daudz jūsu uzkrājumi izaugs, ņemot vērā sākuma iemaksu, regulārās ikmēneša iemaksas un gada ienesīgumu.',
            short_answer: 'Šis kalkulators prognozē, cik daudz jūsu uzkrājumu plāns būs vērts nākotnē, apvienojot sākuma summu ar regulārām ikmēneša iemaksām, kas aug pie dotā gada ienesīguma.',
            intro_text: '<p>Šis ir uzkrājumu plānošanas "uz priekšu" virziens: tā vietā, lai aprēķinātu nepieciešamo iemaksu mērķa sasniegšanai, jūs ievadāt to, ko jau plānojat uzkrāt, un redzat, pie kā tas noved.</p><p><b>Krājēji ar esošu plānu</b> to izmanto, lai pārbaudītu, vai pašreizējais uzkrājumu temps atbilst mērķim, vai vienkārši redzētu regulāru ikmēneša uzkrājumu atdevi laika gaitā.</p>',
            key_points: [
                '<b>Divi izaugsmes avoti:</b> Sākuma iemaksa aug pati, bet ikmēneša iemaksas uzkrājas pēc annuitātes nākotnes vērtības formulas.',
                '<b>Konsekvence uzkrājas:</b> Nelielas regulāras iemaksas bieži pārspēj vienu lielāku iemaksu ilgā laika periodā, pateicoties tam, kā kapitalizācija atalgo laiku tirgū.',
                '<b>Redzams procentu sadalījums:</b> Starpība starp iemaksāto un gala vērtību ir tīra izaugsme no kapitalizācijas.',
            ],
            howto: [
                { question: 'Vai ikmēneša iemaksa notiek mēneša sākumā vai beigās?', answer: '<p>Kalkulators pieņem iemaksas katra mēneša beigās (parasta annuitāte) — visizplatītākā konvencija uzkrājumu plānu prognozēm.</p>' },
                { question: 'Vai varu izmantot to darba pensijas kontam?', answer: '<p>Jā — ievadiet pašreizējo atlikumu kā sākuma iemaksu un regulāro iemaksu kā ikmēneša summu solīdai prognozei, lai gan reālās iemaksas var mainīties laika gaitā.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Sākuma Iemaksa', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Ikmēneša Iemaksa', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Laika Periods', type: 'number', unit: 'gadi', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Gala Vērtība', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Kopā Iemaksāts', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Nopelnītie Procenti', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-przyszlej-wartosci-oszczednosci',
            title: 'Kalkulator Przyszłej Wartości Oszczędności',
            h1: 'Kalkulator Przyszłej Wartości Oszczędności',
            meta_title: 'Kalkulator Przyszłej Wartości | Wzrost Planu Oszczędnościowego',
            meta_description: 'Oblicz, ile urosną twoje oszczędności, biorąc pod uwagę wpłatę początkową, regularne miesięczne wpłaty i roczną stopę zwrotu.',
            short_answer: 'Ten kalkulator prognozuje, ile będzie wart twój plan oszczędnościowy w przyszłości, łącząc kwotę początkową z regularnymi miesięcznymi wpłatami rosnącymi przy danej rocznej stopie zwrotu.',
            intro_text: '<p>To "przyszły" kierunek planowania oszczędności: zamiast obliczać wpłatę potrzebną do osiągnięcia celu, wprowadzasz to, co już planujesz oszczędzać, i widzisz, do czego to prowadzi.</p><p><b>Oszczędzający z istniejącym planem</b> używają tego, aby sprawdzić, czy obecne tempo oszczędzania jest na dobrej drodze do celu, lub po prostu zobaczyć efekt konsekwentnego miesięcznego oszczędzania w czasie.</p>',
            key_points: [
                '<b>Dwa źródła wzrostu:</b> Wpłata początkowa rośnie sama, a miesięczne wpłaty kumulują się według wzoru przyszłej wartości renty.',
                '<b>Konsekwencja się kumuluje:</b> Małe, regularne wpłaty często wyprzedzają jedną większą wpłatę na długich horyzontach dzięki temu, jak kapitalizacja nagradza czas na rynku.',
                '<b>Zobacz podział odsetek:</b> Różnica między wpłaconą kwotą a wartością końcową to czysty wzrost z kapitalizacji.',
            ],
            howto: [
                { question: 'Czy miesięczna wpłata następuje na początku czy na końcu miesiąca?', answer: '<p>Ten kalkulator zakłada wpłaty na końcu każdego miesiąca (zwykła renta) — najpowszechniejsza konwencja dla prognoz planów oszczędnościowych.</p>' },
                { question: 'Czy mogę użyć tego dla pracowniczego konta emerytalnego?', answer: '<p>Tak — wprowadź obecne saldo jako wpłatę początkową i regularną wpłatę jako miesięczną kwotę dla solidnej prognozy, choć rzeczywiste wpłaty mogą się zmieniać w czasie.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Wpłata Początkowa', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Miesięczna Wpłata', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Okres Czasu', type: 'number', unit: 'lat', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Wartość Końcowa', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Łącznie Wpłacono', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Zarobione Odsetki', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-valor-futuro-ahorros',
            title: 'Calculadora de Valor Futuro de Ahorros',
            h1: 'Calculadora de Valor Futuro de Ahorros',
            meta_title: 'Calculadora de Valor Futuro | Crecimiento del Plan de Ahorro',
            meta_description: 'Calcula cuánto crecerán tus ahorros, dado un depósito inicial, aportaciones mensuales regulares y una tasa de rendimiento anual.',
            short_answer: 'Esta calculadora proyecta cuánto valdrá tu plan de ahorro en el futuro, combinando una suma inicial con aportaciones mensuales regulares creciendo a una tasa anual dada.',
            intro_text: '<p>Esta es la dirección "hacia adelante" de la planificación del ahorro: en lugar de despejar el depósito necesario para alcanzar una meta, introduces lo que ya planeas ahorrar y ves a dónde llega.</p><p><b>Los ahorradores con un plan existente</b> usan esto para verificar si su tasa de ahorro actual va por buen camino hacia una meta, o simplemente para ver el resultado de ahorrar consistentemente cada mes con el tiempo.</p>',
            key_points: [
                '<b>Dos fuentes de crecimiento:</b> Tu depósito inicial se capitaliza por sí solo, mientras las aportaciones mensuales se acumulan mediante la fórmula del valor futuro de una anualidad.',
                '<b>La constancia se acumula:</b> Las aportaciones pequeñas y regulares a menudo superan a un solo depósito más grande en horizontes largos, gracias a cómo la capitalización recompensa el tiempo en el mercado.',
                '<b>Ve el desglose de intereses:</b> La diferencia entre lo que aportaste y el valor final es crecimiento puro de la capitalización.',
            ],
            howto: [
                { question: '¿La aportación mensual ocurre al principio o al final de cada mes?', answer: '<p>Esta calculadora asume aportaciones al final de cada mes (una "anualidad ordinaria") — la convención más común para proyecciones de planes de ahorro.</p>' },
                { question: '¿Puedo usar esto para una cuenta de jubilación laboral?', answer: '<p>Sí — introduce tu saldo actual como el depósito inicial y tu aportación regular como el monto mensual para una proyección sólida, aunque las cuentas reales pueden variar las aportaciones con el tiempo.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Depósito Inicial', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Aportación Mensual', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Período de Tiempo', type: 'number', unit: 'años', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valor Final', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total Aportado', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interés Ganado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-valeur-future-epargne',
            title: 'Calculateur de Valeur Future de l’Épargne',
            h1: 'Calculateur de Valeur Future de l’Épargne',
            meta_title: 'Calculateur de Valeur Future | Croissance du Plan d’Épargne',
            meta_description: 'Calculez combien votre épargne va croître, selon un dépôt initial, des contributions mensuelles régulières et un taux de rendement annuel.',
            short_answer: 'Ce calculateur projette combien votre plan d’épargne vaudra dans le futur, combinant une somme de départ avec des contributions mensuelles régulières croissant à un taux annuel donné.',
            intro_text: '<p>C’est la direction "en avant" de la planification de l’épargne : au lieu de résoudre le dépôt nécessaire pour atteindre un objectif, vous entrez ce que vous prévoyez déjà d’épargner et voyez où cela mène.</p><p><b>Les épargnants avec un plan existant</b> utilisent cela pour vérifier si leur taux d’épargne actuel est sur la bonne voie vers un objectif, ou simplement pour voir le résultat d’une épargne mensuelle constante dans le temps.</p>',
            key_points: [
                '<b>Deux sources de croissance :</b> Votre dépôt initial se capitalise seul, tandis que les contributions mensuelles s’accumulent via la formule de la valeur future d’une rente.',
                '<b>La régularité se cumule :</b> De petites contributions régulières dépassent souvent un seul dépôt plus important sur de longs horizons, grâce à la façon dont la capitalisation récompense le temps sur le marché.',
                '<b>Voyez la répartition des intérêts :</b> L’écart entre ce que vous avez versé et la valeur finale est une croissance pure due à la capitalisation.',
            ],
            howto: [
                { question: 'La contribution mensuelle se fait-elle au début ou à la fin de chaque mois ?', answer: '<p>Ce calculateur suppose des dépôts à la fin de chaque mois (une "rente ordinaire") — la convention la plus courante pour les projections de plans d’épargne.</p>' },
                { question: 'Puis-je utiliser cela pour un compte de retraite d’entreprise ?', answer: '<p>Oui — entrez votre solde actuel comme dépôt initial et votre contribution régulière comme montant mensuel pour une projection solide, bien que les comptes réels puissent varier les contributions dans le temps.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Dépôt Initial', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Contribution Mensuelle', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Période', type: 'number', unit: 'ans', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valeur Finale', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total Versé', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Intérêts Gagnés', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-valore-futuro-risparmi',
            title: 'Calcolatore Valore Futuro dei Risparmi',
            h1: 'Calcolatore Valore Futuro dei Risparmi',
            meta_title: 'Calcolatore Valore Futuro | Crescita del Piano di Risparmio',
            meta_description: 'Calcola quanto cresceranno i tuoi risparmi, dato un deposito iniziale, contributi mensili regolari e un tasso di rendimento annuo.',
            short_answer: 'Questo calcolatore proietta quanto varrà il tuo piano di risparmio in futuro, combinando una somma iniziale con contributi mensili regolari che crescono a un tasso annuo dato.',
            intro_text: '<p>Questa è la direzione "in avanti" della pianificazione del risparmio: invece di calcolare il deposito necessario per raggiungere un obiettivo, inserisci ciò che già pianifichi di risparmiare e vedi dove arriva.</p><p><b>I risparmiatori con un piano esistente</b> usano questo per verificare se il loro attuale tasso di risparmio è sulla buona strada per un obiettivo, o semplicemente per vedere il risultato di un risparmio mensile costante nel tempo.</p>',
            key_points: [
                '<b>Due fonti di crescita:</b> Il tuo deposito iniziale si capitalizza da solo, mentre i contributi mensili si accumulano tramite la formula del valore futuro di una rendita.',
                '<b>La costanza si accumula:</b> Contributi piccoli e regolari spesso superano un unico deposito più grande su orizzonti lunghi, grazie a come la capitalizzazione premia il tempo sul mercato.',
                '<b>Vedi la ripartizione degli interessi:</b> Il divario tra ciò che hai contribuito e il valore finale è crescita pura dalla capitalizzazione.',
            ],
            howto: [
                { question: 'Il contributo mensile avviene all’inizio o alla fine di ogni mese?', answer: '<p>Questo calcolatore presuppone depositi alla fine di ogni mese (una "rendita ordinaria") — la convenzione più comune per le proiezioni dei piani di risparmio.</p>' },
                { question: 'Posso usarlo per un conto pensionistico aziendale?', answer: '<p>Sì — inserisci il tuo saldo attuale come deposito iniziale e il tuo contributo regolare come importo mensile per una proiezione solida, sebbene i conti reali possano variare i contributi nel tempo.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Deposito Iniziale', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Contributo Mensile', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Periodo di Tempo', type: 'number', unit: 'anni', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valore Finale', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Totale Contribuito', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interessi Maturati', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'zukunftswert-sparen-rechner',
            title: 'Zukunftswert-Sparrechner',
            h1: 'Zukunftswert-Sparrechner',
            meta_title: 'Zukunftswert-Rechner | Wachstum des Sparplans',
            meta_description: 'Berechnen Sie, wie stark Ihre Ersparnisse wachsen, basierend auf einer Anfangseinzahlung, regelmäßigen monatlichen Beiträgen und einer jährlichen Rendite.',
            short_answer: 'Dieser Rechner prognostiziert, wie viel Ihr Sparplan in Zukunft wert sein wird, indem er eine Anfangssumme mit regelmäßigen monatlichen Beiträgen kombiniert, die bei einer gegebenen jährlichen Rendite wachsen.',
            intro_text: '<p>Dies ist die "vorwärts"-Richtung der Sparplanung: Anstatt die für ein Ziel benötigte Einzahlung zu berechnen, geben Sie ein, was Sie bereits zu sparen planen, und sehen, wohin es führt.</p><p><b>Sparer mit einem bestehenden Plan</b> nutzen dies, um zu prüfen, ob ihre aktuelle Sparrate auf Kurs für ein Ziel ist, oder einfach um den Ertrag konsequenten monatlichen Sparens über die Zeit zu sehen.</p>',
            key_points: [
                '<b>Zwei Wachstumsquellen:</b> Ihre Anfangseinzahlung verzinst sich selbst, während sich monatliche Beiträge über die Rentenendwert-Formel aufbauen.',
                '<b>Beständigkeit summiert sich:</b> Kleine, regelmäßige Beiträge übertreffen oft eine einzelne größere Einzahlung über lange Zeiträume, dank der Belohnung von Zeit im Markt durch Zinseszins.',
                '<b>Sehen Sie die Zinsaufschlüsselung:</b> Die Lücke zwischen Ihren Einzahlungen und dem Endwert ist reines Wachstum durch Zinseszins.',
            ],
            howto: [
                { question: 'Erfolgt die monatliche Einzahlung am Anfang oder Ende jedes Monats?', answer: '<p>Dieser Rechner geht von Einzahlungen am Ende jedes Monats aus (eine "nachschüssige Rente") — die gängigste Konvention für Sparplanprognosen.</p>' },
                { question: 'Kann ich dies für ein betriebliches Altersvorsorgekonto verwenden?', answer: '<p>Ja — geben Sie Ihren aktuellen Saldo als Anfangseinzahlung und Ihren regelmäßigen Beitrag als Monatsbetrag für eine solide Prognose ein, obwohl echte Konten die Beiträge im Laufe der Zeit variieren können.</p>' },
            ],
            inputs: [
                { name: 'initial_deposit', label: 'Anfangseinzahlung', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '1000' },
                { name: 'monthly_deposit', label: 'Monatlicher Beitrag', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '200' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Zeitraum', type: 'number', unit: 'Jahre', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'final_value', label: 'Endwert', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Gesamt Eingezahlt', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Verdiente Zinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1035: Retirement Savings Calculator
// ============================================================
const retirementSavings: ToolDef = {
    id: '1035',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'current_savings', default: 20000 },
            { key: 'monthly_contribution', default: 300 },
            { key: 'annual_rate', default: 7 },
            { key: 'years', default: 25 },
        ],
        formulas: {
            retirement_balance: `current_savings*(1+${R})^${N} + monthly_contribution*(((1+${R})^${N}-1)/${R})`,
            total_contributed: `current_savings + monthly_contribution*${N}`,
        },
        outputs: [
            { key: 'retirement_balance', precision: 2 },
            { key: 'total_contributed', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'retirement-savings-calculator',
            title: 'Retirement Savings Calculator',
            h1: 'Retirement Savings Calculator',
            meta_title: 'Retirement Savings Calculator | Projected Balance at Retirement',
            meta_description: 'Project your retirement balance based on current savings, monthly contributions, expected return, and years until retirement.',
            short_answer: 'This calculator projects your retirement account balance based on what you\'ve already saved, how much you contribute monthly, your expected rate of return, and how many years remain until retirement.',
            intro_text: '<p>Retirement projections combine two growth engines: your existing balance compounding on its own, and your ongoing monthly contributions building up over time via the future value of an annuity. Together they show where your retirement savings realistically land if you stay the course.</p><p><b>Anyone planning for retirement</b> uses this to sanity-check whether current contributions are enough, or to see how increasing monthly contributions or working a few extra years changes the final number.</p>',
            key_points: [
                '<b>Two Growth Engines Combined:</b> Existing balance compounds independently; monthly contributions accumulate via annuity growth — both added together.',
                '<b>Small Increases Compound Over Decades:</b> Because retirement horizons are long, even modest increases to monthly contributions can produce a dramatically larger final balance.',
                '<b>Doesn\'t Account for Inflation:</b> This shows nominal dollars; consider using a more conservative "real" rate of return if you want the result in today\'s purchasing power.',
            ],
            howto: [
                { question: 'What rate of return should I use for retirement projections?', answer: '<p>A common conservative assumption for a diversified stock/bond portfolio is 5-7% annually over long horizons, though this varies by asset allocation and risk tolerance.</p>' },
                { question: 'Does this include employer matching contributions?', answer: '<p>Only if you include the match in your monthly contribution figure — add your own contribution plus any employer match to get an accurate total monthly amount.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Current Retirement Savings', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Monthly Contribution', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Years Until Retirement', type: 'number', unit: 'years', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Projected Retirement Balance', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total You Will Contribute', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-pensionnyh-nakopleniy',
            title: 'Калькулятор пенсионных накоплений',
            h1: 'Калькулятор пенсионных накоплений',
            meta_title: 'Калькулятор пенсионных накоплений | Прогноз баланса к пенсии',
            meta_description: 'Спрогнозируйте баланс пенсионных накоплений на основе текущих сбережений, ежемесячных взносов, ожидаемой доходности и лет до пенсии.',
            short_answer: 'Этот калькулятор прогнозирует баланс пенсионного счёта на основе уже накопленного, ежемесячного взноса, ожидаемой доходности и оставшихся лет до пенсии.',
            intro_text: '<p>Пенсионные прогнозы объединяют два источника роста: существующий баланс, растущий сам по себе, и текущие ежемесячные взносы, накапливающиеся со временем по формуле будущей стоимости аннуитета.</p><p><b>Любой, кто планирует пенсию</b>, использует это, чтобы проверить, достаточно ли текущих взносов, или увидеть, как увеличение ежемесячного взноса или несколько дополнительных лет работы меняют итоговую сумму.</p>',
            key_points: [
                '<b>Два источника роста вместе:</b> Существующий баланс растёт независимо; ежемесячные взносы накапливаются через рост аннуитета — оба складываются.',
                '<b>Небольшие увеличения накапливаются десятилетиями:</b> Поскольку горизонт пенсии долог, даже скромное увеличение ежемесячного взноса может дать намного больший итоговый баланс.',
                '<b>Не учитывает инфляцию:</b> Показаны номинальные доллары; рассмотрите более консервативную «реальную» ставку доходности для результата в сегодняшней покупательной способности.',
            ],
            howto: [
                { question: 'Какую доходность использовать для пенсионных прогнозов?', answer: '<p>Распространённое консервативное предположение для диверсифицированного портфеля акций/облигаций — 5-7% годовых на долгом горизонте.</p>' },
                { question: 'Учитывает ли это работодательское софинансирование?', answer: '<p>Только если вы включите софинансирование в сумму ежемесячного взноса — добавьте свой взнос плюс любое софинансирование работодателя для точной ежемесячной суммы.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Текущие пенсионные накопления', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Ежемесячный взнос', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Лет до пенсии', type: 'number', unit: 'лет', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Прогнозируемый баланс к пенсии', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Всего вы внесёте', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'pensijas-uzkrajumu-kalkulators',
            title: 'Pensijas Uzkrājumu Kalkulators',
            h1: 'Pensijas Uzkrājumu Kalkulators',
            meta_title: 'Pensijas Uzkrājumu Kalkulators | Prognozētais Atlikums Pensijā',
            meta_description: 'Prognozējiet savu pensijas atlikumu, balstoties uz pašreizējiem uzkrājumiem, ikmēneša iemaksām, gaidīto ienesīgumu un gadiem līdz pensijai.',
            short_answer: 'Šis kalkulators prognozē jūsu pensijas konta atlikumu, balstoties uz jau uzkrāto, ikmēneša iemaksu, gaidīto ienesīgumu un atlikušajiem gadiem līdz pensijai.',
            intro_text: '<p>Pensijas prognozes apvieno divus izaugsmes avotus: esošo atlikumu, kas aug pats, un pašreizējās ikmēneša iemaksas, kas uzkrājas laika gaitā pēc annuitātes nākotnes vērtības formulas.</p><p><b>Ikviens, kas plāno pensiju</b>, izmanto to, lai pārbaudītu, vai pašreizējās iemaksas ir pietiekamas, vai redzētu, kā ikmēneša iemaksas palielināšana vai daži papildu darba gadi maina gala summu.</p>',
            key_points: [
                '<b>Divi izaugsmes avoti kopā:</b> Esošais atlikums aug neatkarīgi; ikmēneša iemaksas uzkrājas caur annuitātes izaugsmi — abi tiek summēti.',
                '<b>Nelieli pieaugumi uzkrājas gadu desmitos:</b> Tā kā pensijas horizonts ir garš, pat neliels ikmēneša iemaksas pieaugums var dot daudz lielāku gala atlikumu.',
                '<b>Neņem vērā inflāciju:</b> Parādīti nominālie dolāri; apsveriet konservatīvāku "reālo" ienesīguma likmi rezultātam šodienas pirktspējā.',
            ],
            howto: [
                { question: 'Kādu ienesīgumu izmantot pensijas prognozēm?', answer: '<p>Izplatīts konservatīvs pieņēmums diversificētam akciju/obligāciju portfelim ir 5-7% gadā ilgā horizontā.</p>' },
                { question: 'Vai tas ietver darba devēja līdzfinansējumu?', answer: '<p>Tikai tad, ja iekļaujat līdzfinansējumu ikmēneša iemaksas summā — pievienojiet savu iemaksu plus jebkuru darba devēja līdzfinansējumu precīzai ikmēneša summai.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Pašreizējie Pensijas Uzkrājumi', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Ikmēneša Iemaksa', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Gadi Līdz Pensijai', type: 'number', unit: 'gadi', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Prognozētais Atlikums Pensijā', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Kopā Iemaksāsiet', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-emerytalnych',
            title: 'Kalkulator Oszczędności Emerytalnych',
            h1: 'Kalkulator Oszczędności Emerytalnych',
            meta_title: 'Kalkulator Emerytalny | Prognozowane Saldo na Emeryturze',
            meta_description: 'Prognozuj swoje saldo emerytalne na podstawie obecnych oszczędności, miesięcznych wpłat, oczekiwanej stopy zwrotu i lat do emerytury.',
            short_answer: 'Ten kalkulator prognozuje saldo twojego konta emerytalnego na podstawie tego, co już zaoszczędziłeś, ile wpłacasz miesięcznie, oczekiwanej stopy zwrotu i liczby lat pozostałych do emerytury.',
            intro_text: '<p>Prognozy emerytalne łączą dwa źródła wzrostu: istniejące saldo rosnące samodzielnie oraz bieżące miesięczne wpłaty kumulujące się w czasie według wzoru przyszłej wartości renty.</p><p><b>Każdy planujący emeryturę</b> używa tego, aby sprawdzić, czy obecne wpłaty są wystarczające, lub zobaczyć, jak zwiększenie miesięcznej wpłaty lub kilka dodatkowych lat pracy zmienia końcową liczbę.</p>',
            key_points: [
                '<b>Dwa źródła wzrostu razem:</b> Istniejące saldo rośnie niezależnie; miesięczne wpłaty kumulują się przez wzrost renty — oba są sumowane.',
                '<b>Małe wzrosty kumulują się przez dekady:</b> Ponieważ horyzont emerytalny jest długi, nawet skromne zwiększenie miesięcznej wpłaty może dać dramatycznie większe saldo końcowe.',
                '<b>Nie uwzględnia inflacji:</b> Pokazuje nominalne dolary; rozważ bardziej konserwatywną "realną" stopę zwrotu dla wyniku w dzisiejszej sile nabywczej.',
            ],
            howto: [
                { question: 'Jaką stopę zwrotu użyć do prognoz emerytalnych?', answer: '<p>Powszechne konserwatywne założenie dla zdywersyfikowanego portfela akcji/obligacji to 5-7% rocznie w długim horyzoncie.</p>' },
                { question: 'Czy to uwzględnia dopasowanie pracodawcy?', answer: '<p>Tylko jeśli uwzględnisz dopasowanie w kwocie miesięcznej wpłaty — dodaj swoją wpłatę plus dopasowanie pracodawcy dla dokładnej miesięcznej sumy.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Obecne Oszczędności Emerytalne', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Miesięczna Wpłata', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Lata do Emerytury', type: 'number', unit: 'lat', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Prognozowane Saldo Emerytalne', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Łącznie Wpłacisz', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-ahorros-jubilacion',
            title: 'Calculadora de Ahorros para la Jubilación',
            h1: 'Calculadora de Ahorros para la Jubilación',
            meta_title: 'Calculadora de Jubilación | Saldo Proyectado al Jubilarte',
            meta_description: 'Proyecta tu saldo de jubilación según tus ahorros actuales, aportaciones mensuales, rendimiento esperado y años hasta la jubilación.',
            short_answer: 'Esta calculadora proyecta el saldo de tu cuenta de jubilación según lo que ya has ahorrado, cuánto aportas mensualmente, tu tasa de rendimiento esperada y cuántos años quedan hasta la jubilación.',
            intro_text: '<p>Las proyecciones de jubilación combinan dos motores de crecimiento: tu saldo existente capitalizándose por sí solo, y tus aportaciones mensuales continuas acumulándose con el tiempo mediante el valor futuro de una anualidad.</p><p><b>Cualquiera que planifique su jubilación</b> usa esto para verificar si las aportaciones actuales son suficientes, o para ver cómo aumentar la aportación mensual o trabajar algunos años más cambia el número final.</p>',
            key_points: [
                '<b>Dos motores de crecimiento combinados:</b> El saldo existente se capitaliza de forma independiente; las aportaciones mensuales se acumulan mediante el crecimiento de anualidad — ambos se suman.',
                '<b>Pequeños aumentos se acumulan durante décadas:</b> Como los horizontes de jubilación son largos, incluso aumentos modestos en las aportaciones mensuales pueden producir un saldo final dramáticamente mayor.',
                '<b>No considera la inflación:</b> Esto muestra dólares nominales; considera usar una tasa de rendimiento "real" más conservadora si quieres el resultado en poder adquisitivo actual.',
            ],
            howto: [
                { question: '¿Qué tasa de rendimiento debo usar para proyecciones de jubilación?', answer: '<p>Una suposición conservadora común para una cartera diversificada de acciones/bonos es 5-7% anual en horizontes largos.</p>' },
                { question: '¿Esto incluye las aportaciones equivalentes del empleador?', answer: '<p>Solo si incluyes el aporte equivalente en tu cifra de aportación mensual — suma tu propia aportación más cualquier aporte equivalente del empleador para un monto mensual total preciso.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Ahorros Actuales para la Jubilación', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Aportación Mensual', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Años Hasta la Jubilación', type: 'number', unit: 'años', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Saldo Proyectado de Jubilación', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total que Aportarás', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-epargne-retraite',
            title: 'Calculateur d’Épargne Retraite',
            h1: 'Calculateur d’Épargne Retraite',
            meta_title: 'Calculateur Retraite | Solde Projeté à la Retraite',
            meta_description: 'Projetez votre solde de retraite selon votre épargne actuelle, vos contributions mensuelles, le rendement attendu et le nombre d’années avant la retraite.',
            short_answer: 'Ce calculateur projette le solde de votre compte de retraite selon ce que vous avez déjà épargné, votre contribution mensuelle, votre taux de rendement attendu et le nombre d’années restantes avant la retraite.',
            intro_text: '<p>Les projections de retraite combinent deux moteurs de croissance : votre solde existant se capitalisant seul, et vos contributions mensuelles continues s’accumulant dans le temps via la valeur future d’une rente.</p><p><b>Quiconque planifie sa retraite</b> utilise cela pour vérifier si les contributions actuelles sont suffisantes, ou pour voir comment augmenter la contribution mensuelle ou travailler quelques années de plus change le chiffre final.</p>',
            key_points: [
                '<b>Deux moteurs de croissance combinés :</b> Le solde existant se capitalise indépendamment ; les contributions mensuelles s’accumulent via la croissance de rente — les deux sont additionnés.',
                '<b>De petites augmentations se cumulent sur des décennies :</b> Comme les horizons de retraite sont longs, même des augmentations modestes des contributions mensuelles peuvent produire un solde final considérablement plus élevé.',
                '<b>Ne tient pas compte de l’inflation :</b> Ceci montre des dollars nominaux ; envisagez un taux de rendement "réel" plus conservateur si vous voulez le résultat en pouvoir d’achat actuel.',
            ],
            howto: [
                { question: 'Quel taux de rendement dois-je utiliser pour les projections de retraite ?', answer: '<p>Une hypothèse conservatrice courante pour un portefeuille diversifié d’actions/obligations est de 5-7 % par an sur de longs horizons.</p>' },
                { question: 'Cela inclut-il les contributions de contrepartie de l’employeur ?', answer: '<p>Seulement si vous incluez la contrepartie dans votre montant de contribution mensuelle — ajoutez votre propre contribution plus toute contrepartie de l’employeur pour un montant mensuel total précis.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Épargne Retraite Actuelle', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Contribution Mensuelle', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Années Avant la Retraite', type: 'number', unit: 'ans', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Solde de Retraite Projeté', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total que Vous Verserez', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-risparmi-pensione',
            title: 'Calcolatore Risparmi per la Pensione',
            h1: 'Calcolatore Risparmi per la Pensione',
            meta_title: 'Calcolatore Pensione | Saldo Proiettato alla Pensione',
            meta_description: 'Proietta il tuo saldo pensionistico in base ai risparmi attuali, ai contributi mensili, al rendimento atteso e agli anni rimanenti alla pensione.',
            short_answer: 'Questo calcolatore proietta il saldo del tuo conto pensionistico in base a quanto hai già risparmiato, quanto contribuisci mensilmente, il tuo tasso di rendimento atteso e quanti anni rimangono alla pensione.',
            intro_text: '<p>Le proiezioni pensionistiche combinano due motori di crescita: il tuo saldo esistente che si capitalizza da solo, e i tuoi contributi mensili continui che si accumulano nel tempo tramite il valore futuro di una rendita.</p><p><b>Chiunque pianifichi la pensione</b> usa questo per verificare se i contributi attuali sono sufficienti, o per vedere come aumentare il contributo mensile o lavorare qualche anno in più cambia il numero finale.</p>',
            key_points: [
                '<b>Due motori di crescita combinati:</b> Il saldo esistente si capitalizza indipendentemente; i contributi mensili si accumulano tramite la crescita della rendita — entrambi sommati.',
                '<b>Piccoli aumenti si accumulano nei decenni:</b> Poiché gli orizzonti pensionistici sono lunghi, anche modesti aumenti dei contributi mensili possono produrre un saldo finale drammaticamente più grande.',
                '<b>Non considera l’inflazione:</b> Questo mostra dollari nominali; considera di usare un tasso di rendimento "reale" più conservativo se vuoi il risultato nel potere d’acquisto odierno.',
            ],
            howto: [
                { question: 'Quale tasso di rendimento dovrei usare per le proiezioni pensionistiche?', answer: '<p>Un’ipotesi conservativa comune per un portafoglio diversificato di azioni/obbligazioni è del 5-7% annuo su orizzonti lunghi.</p>' },
                { question: 'Questo include i contributi di corrispondenza del datore di lavoro?', answer: '<p>Solo se includi la corrispondenza nella tua cifra di contributo mensile — aggiungi il tuo contributo più qualsiasi corrispondenza del datore di lavoro per un importo mensile totale accurato.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Risparmi Pensionistici Attuali', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Contributo Mensile', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Anni Alla Pensione', type: 'number', unit: 'anni', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Saldo Pensionistico Proiettato', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Totale che Verserai', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'altersvorsorge-rechner',
            title: 'Altersvorsorge-Rechner',
            h1: 'Altersvorsorge-Rechner',
            meta_title: 'Altersvorsorge-Rechner | Prognostiziertes Guthaben bei Rentenbeginn',
            meta_description: 'Prognostizieren Sie Ihr Rentenguthaben basierend auf aktuellen Ersparnissen, monatlichen Beiträgen, erwarteter Rendite und Jahren bis zur Rente.',
            short_answer: 'Dieser Rechner prognostiziert Ihr Rentenkontoguthaben basierend auf dem, was Sie bereits gespart haben, wie viel Sie monatlich einzahlen, Ihrer erwarteten Rendite und wie vielen Jahren bis zur Rente.',
            intro_text: '<p>Rentenprognosen kombinieren zwei Wachstumsmotoren: Ihr bestehendes Guthaben, das sich selbst verzinst, und Ihre laufenden monatlichen Beiträge, die sich im Laufe der Zeit über den Rentenendwert aufbauen.</p><p><b>Jeder, der für den Ruhestand plant</b>, nutzt dies, um zu prüfen, ob die aktuellen Beiträge ausreichen, oder um zu sehen, wie eine Erhöhung der monatlichen Beiträge oder ein paar zusätzliche Arbeitsjahre die Endzahl verändern.</p>',
            key_points: [
                '<b>Zwei kombinierte Wachstumsmotoren:</b> Bestehendes Guthaben verzinst sich unabhängig; monatliche Beiträge sammeln sich über Rentenwachstum an — beide werden addiert.',
                '<b>Kleine Erhöhungen summieren sich über Jahrzehnte:</b> Da die Rentenhorizonte lang sind, können selbst bescheidene Erhöhungen der monatlichen Beiträge ein deutlich größeres Endguthaben erzeugen.',
                '<b>Berücksichtigt keine Inflation:</b> Dies zeigt Nominalbeträge; erwägen Sie eine konservativere "reale" Rendite, wenn Sie das Ergebnis in heutiger Kaufkraft möchten.',
            ],
            howto: [
                { question: 'Welche Rendite sollte ich für Rentenprognosen verwenden?', answer: '<p>Eine übliche konservative Annahme für ein diversifiziertes Aktien-/Anleihenportfolio sind 5-7 % jährlich über lange Horizonte.</p>' },
                { question: 'Beinhaltet dies Arbeitgeber-Matching-Beiträge?', answer: '<p>Nur wenn Sie das Matching in Ihrem monatlichen Beitragsbetrag einbeziehen — addieren Sie Ihren eigenen Beitrag plus jedes Arbeitgeber-Matching für einen genauen monatlichen Gesamtbetrag.</p>' },
            ],
            inputs: [
                { name: 'current_savings', label: 'Aktuelle Altersvorsorge-Ersparnisse', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '20000' },
                { name: 'monthly_contribution', label: 'Monatlicher Beitrag', type: 'number', unit: '$', min: 0, max: 1000000, placeholder: '300' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Jahre Bis zur Rente', type: 'number', unit: 'Jahre', min: 0.1, max: 60, placeholder: '25' },
            ],
            outputs: [
                { name: 'retirement_balance', label: 'Prognostiziertes Rentenguthaben', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Insgesamt Eingezahlt', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1036: College Savings (529) Calculator
// ============================================================
const collegeSavings: ToolDef = {
    id: '1036',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'target_amount', default: 100000 },
            { key: 'current_savings', default: 10000 },
            { key: 'annual_rate', default: 7 },
            { key: 'years', default: 15 },
        ],
        formulas: {
            monthly_deposit: `(target_amount - current_savings*(1+${R})^${N}) * ${R} / ((1+${R})^${N} - 1)`,
        },
        outputs: [{ key: 'monthly_deposit', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'college-savings-529-calculator',
            title: 'College Savings (529) Calculator',
            h1: 'College Savings Calculator',
            meta_title: '529 College Savings Calculator | Required Monthly Contribution',
            meta_description: 'Calculate the monthly contribution needed to reach a college savings goal, accounting for savings you already have and years until enrollment.',
            short_answer: 'This calculator computes the monthly contribution needed to reach your college savings goal, taking into account what you\'ve already saved and your expected investment return.',
            intro_text: '<p>College savings plans (like 529 accounts in the US) let money grow tax-advantaged toward future education costs. This calculator accounts for a starting balance already saved, then solves for the monthly contribution needed to close the gap to your target by the time your child starts college.</p><p><b>Parents planning ahead</b> use this to convert a future tuition estimate into an actionable monthly savings number, adjusting as college cost estimates or investment performance change over time.</p>',
            key_points: [
                '<b>Accounts for a Head Start:</b> Unlike a from-zero goal calculator, this factors in savings you already have, reducing the required monthly amount.',
                '<b>Time Is Your Biggest Ally:</b> Starting when a child is young dramatically lowers the monthly contribution needed versus starting a few years before enrollment.',
                '<b>Revisit Periodically:</b> College cost inflation and investment returns both shift over time — recalculate every year or two to stay on track.',
            ],
            howto: [
                { question: 'What if the target amount changes as college gets closer?', answer: '<p>Recalculate with an updated target — college cost estimates typically rise over time, so periodic check-ins help avoid a large shortfall discovered too late.</p>' },
                { question: 'What return should I assume for a 529 plan?', answer: '<p>Most 529 plans use age-based portfolios that grow more conservative as college approaches — a blended long-term estimate of 5-7% is common for younger children\'s accounts.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'College Savings Goal', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Current Savings', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Years Until Enrollment', type: 'number', unit: 'years', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Required Monthly Contribution', unit: '$', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-nakopleniy-na-obrazovanie',
            title: 'Калькулятор накоплений на образование (529)',
            h1: 'Калькулятор накоплений на образование',
            meta_title: 'Калькулятор накоплений на колледж | Необходимый ежемесячный взнос',
            meta_description: 'Рассчитайте ежемесячный взнос, необходимый для достижения цели накоплений на образование, с учётом уже накопленного и лет до поступления.',
            short_answer: 'Этот калькулятор вычисляет ежемесячный взнос, необходимый для достижения цели накоплений на образование, учитывая уже накопленное и ожидаемую доходность инвестиций.',
            intro_text: '<p>Планы накоплений на образование (как счета 529 в США) позволяют деньгам расти с налоговыми льготами для будущих расходов на обучение. Калькулятор учитывает уже накопленный стартовый баланс и рассчитывает ежемесячный взнос, необходимый для закрытия разрыва до цели к моменту поступления ребёнка.</p><p><b>Родители, планирующие заранее</b>, используют это, чтобы превратить оценку будущей стоимости обучения в конкретную ежемесячную сумму накоплений.</p>',
            key_points: [
                '<b>Учитывает стартовое преимущество:</b> В отличие от калькулятора цели с нуля, это учитывает уже имеющиеся накопления, снижая необходимую ежемесячную сумму.',
                '<b>Время — ваш главный союзник:</b> Начало накоплений, когда ребёнок ещё мал, значительно снижает необходимый ежемесячный взнос по сравнению с началом за несколько лет до поступления.',
                '<b>Пересматривайте периодически:</b> Инфляция стоимости обучения и доходность инвестиций меняются со временем — пересчитывайте раз в год-два.',
            ],
            howto: [
                { question: 'Что если целевая сумма изменится по мере приближения поступления?', answer: '<p>Пересчитайте с обновлённой целью — оценки стоимости обучения обычно растут со временем, поэтому периодические проверки помогают избежать позднего обнаружения нехватки.</p>' },
                { question: 'Какую доходность предполагать для плана 529?', answer: '<p>Большинство планов 529 используют возрастные портфели, становящиеся консервативнее по мере приближения поступления — смешанная долгосрочная оценка 5-7% распространена для счетов маленьких детей.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Цель накоплений на образование', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Текущие накопления', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Лет до поступления', type: 'number', unit: 'лет', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Необходимый ежемесячный взнос', unit: '$', precision: 2 }],
        },
        lv: {
            slug: 'izglitibas-uzkrajumu-kalkulators',
            title: 'Izglītības Uzkrājumu Kalkulators (529)',
            h1: 'Izglītības Uzkrājumu Kalkulators',
            meta_title: 'Koledžas Uzkrājumu Kalkulators | Nepieciešamā Ikmēneša Iemaksa',
            meta_description: 'Aprēķiniet ikmēneša iemaksu, kas nepieciešama, lai sasniegtu izglītības uzkrājumu mērķi, ņemot vērā jau uzkrāto un gadus līdz uzņemšanai.',
            short_answer: 'Šis kalkulators aprēķina ikmēneša iemaksu, kas nepieciešama, lai sasniegtu izglītības uzkrājumu mērķi, ņemot vērā jau uzkrāto un gaidīto investīciju ienesīgumu.',
            intro_text: '<p>Izglītības uzkrājumu plāni (kā 529 konti ASV) ļauj naudai augt ar nodokļu atvieglojumiem nākotnes izglītības izmaksām. Kalkulators ņem vērā jau uzkrāto sākuma atlikumu, tad aprēķina ikmēneša iemaksu, kas nepieciešama, lai aizvērtu starpību līdz mērķim, kad bērns sāk mācības.</p><p><b>Vecāki, kas plāno savlaicīgi</b>, izmanto to, lai pārvērstu nākotnes mācību maksas novērtējumu konkrētā ikmēneša uzkrājumu summā.</p>',
            key_points: [
                '<b>Ņem vērā priekšrocību:</b> Atšķirībā no mērķa kalkulatora no nulles, tas ņem vērā jau esošos uzkrājumus, samazinot nepieciešamo ikmēneša summu.',
                '<b>Laiks ir jūsu lielākais sabiedrotais:</b> Uzkrāšanas sākšana, kad bērns ir mazs, ievērojami samazina nepieciešamo ikmēneša iemaksu salīdzinājumā ar sākšanu dažus gadus pirms uzņemšanas.',
                '<b>Pārskatiet periodiski:</b> Mācību izmaksu inflācija un investīciju ienesīgums mainās laika gaitā — pārrēķiniet ik pēc gada vai diviem.',
            ],
            howto: [
                { question: 'Ko darīt, ja mērķa summa mainās, tuvojoties uzņemšanai?', answer: '<p>Pārrēķiniet ar atjauninātu mērķi — mācību izmaksu novērtējumi parasti laika gaitā pieaug, tāpēc periodiskas pārbaudes palīdz izvairīties no vēlu atklāta iztrūkuma.</p>' },
                { question: 'Kādu ienesīgumu pieņemt 529 plānam?', answer: '<p>Lielākā daļa 529 plānu izmanto vecumam pielāgotus portfeļus, kas kļūst konservatīvāki, tuvojoties uzņemšanai — jaukta ilgtermiņa aplēse 5-7% ir izplatīta mazu bērnu kontiem.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Izglītības Uzkrājumu Mērķis', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Pašreizējie Uzkrājumi', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Gadi Līdz Uzņemšanai', type: 'number', unit: 'gadi', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Nepieciešamā Ikmēneša Iemaksa', unit: '$', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-na-studia',
            title: 'Kalkulator Oszczędności na Studia (529)',
            h1: 'Kalkulator Oszczędności na Studia',
            meta_title: 'Kalkulator Oszczędności na Studia | Wymagana Miesięczna Wpłata',
            meta_description: 'Oblicz miesięczną wpłatę potrzebną do osiągnięcia celu oszczędnościowego na studia, uwzględniając już zaoszczędzone środki i lata do rozpoczęcia nauki.',
            short_answer: 'Ten kalkulator oblicza miesięczną wpłatę potrzebną do osiągnięcia celu oszczędnościowego na studia, uwzględniając to, co już zaoszczędziłeś, i oczekiwany zwrot z inwestycji.',
            intro_text: '<p>Plany oszczędnościowe na studia (jak konta 529 w USA) pozwalają pieniądzom rosnąć z korzyściami podatkowymi na przyszłe koszty edukacji. Kalkulator uwzględnia już zaoszczędzone saldo początkowe, a następnie oblicza miesięczną wpłatę potrzebną, by zamknąć lukę do celu, gdy dziecko rozpocznie naukę.</p><p><b>Rodzice planujący z wyprzedzeniem</b> używają tego, aby zamienić szacunek przyszłego czesnego w konkretną miesięczną liczbę oszczędności.</p>',
            key_points: [
                '<b>Uwzględnia przewagę startową:</b> W przeciwieństwie do kalkulatora celu od zera, uwzględnia już posiadane oszczędności, zmniejszając wymaganą miesięczną kwotę.',
                '<b>Czas to twój największy sojusznik:</b> Rozpoczęcie oszczędzania, gdy dziecko jest małe, znacznie obniża wymaganą miesięczną wpłatę w porównaniu z rozpoczęciem kilka lat przed rozpoczęciem nauki.',
                '<b>Sprawdzaj okresowo:</b> Inflacja kosztów studiów i zwroty z inwestycji zmieniają się w czasie — przeliczaj co rok lub dwa.',
            ],
            howto: [
                { question: 'Co jeśli kwota docelowa zmieni się w miarę zbliżania się studiów?', answer: '<p>Przelicz z zaktualizowanym celem — szacunki kosztów studiów zazwyczaj rosną w czasie, więc okresowe sprawdzanie pomaga uniknąć dużego niedoboru odkrytego za późno.</p>' },
                { question: 'Jaki zwrot założyć dla planu 529?', answer: '<p>Większość planów 529 wykorzystuje portfele dostosowane do wieku, które stają się bardziej konserwatywne wraz ze zbliżaniem się studiów — mieszane długoterminowe oszacowanie 5-7% jest powszechne dla kont małych dzieci.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Cel Oszczędności na Studia', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Obecne Oszczędności', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Lata do Rozpoczęcia Nauki', type: 'number', unit: 'lat', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Wymagana Miesięczna Wpłata', unit: '$', precision: 2 }],
        },
        es: {
            slug: 'calculadora-ahorro-universitario',
            title: 'Calculadora de Ahorro Universitario (529)',
            h1: 'Calculadora de Ahorro Universitario',
            meta_title: 'Calculadora de Ahorro Universitario | Aportación Mensual Requerida',
            meta_description: 'Calcula la aportación mensual necesaria para alcanzar una meta de ahorro universitario, considerando lo ya ahorrado y los años hasta la inscripción.',
            short_answer: 'Esta calculadora calcula la aportación mensual necesaria para alcanzar tu meta de ahorro universitario, considerando lo que ya has ahorrado y tu rendimiento de inversión esperado.',
            intro_text: '<p>Los planes de ahorro universitario (como las cuentas 529 en EE.UU.) permiten que el dinero crezca con ventajas fiscales para futuros costos educativos. Esta calculadora considera un saldo inicial ya ahorrado y luego despeja la aportación mensual necesaria para cerrar la brecha hacia tu meta cuando tu hijo comience la universidad.</p><p><b>Los padres que planifican con anticipación</b> usan esto para convertir una estimación futura de matrícula en un número mensual de ahorro accionable.</p>',
            key_points: [
                '<b>Considera una ventaja inicial:</b> A diferencia de una calculadora de meta desde cero, esto tiene en cuenta los ahorros que ya tienes, reduciendo el monto mensual requerido.',
                '<b>El tiempo es tu mayor aliado:</b> Empezar cuando un hijo es pequeño reduce drásticamente la aportación mensual necesaria frente a empezar unos años antes de la inscripción.',
                '<b>Revisa periódicamente:</b> La inflación del costo universitario y los rendimientos de inversión cambian con el tiempo — recalcula cada uno o dos años.',
            ],
            howto: [
                { question: '¿Qué pasa si el monto objetivo cambia a medida que se acerca la universidad?', answer: '<p>Recalcula con un objetivo actualizado — las estimaciones de costo universitario suelen aumentar con el tiempo, así que las revisiones periódicas ayudan a evitar un déficit grande descubierto demasiado tarde.</p>' },
                { question: '¿Qué rendimiento debo asumir para un plan 529?', answer: '<p>La mayoría de los planes 529 usan carteras basadas en la edad que se vuelven más conservadoras a medida que se acerca la universidad — una estimación combinada a largo plazo del 5-7% es común para cuentas de niños pequeños.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Meta de Ahorro Universitario', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Ahorros Actuales', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Años Hasta la Inscripción', type: 'number', unit: 'años', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Aportación Mensual Requerida', unit: '$', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-epargne-etudes',
            title: 'Calculateur d’Épargne Études (529)',
            h1: 'Calculateur d’Épargne Études',
            meta_title: 'Calculateur d’Épargne Études | Contribution Mensuelle Requise',
            meta_description: 'Calculez la contribution mensuelle nécessaire pour atteindre un objectif d’épargne études, en tenant compte de l’épargne déjà constituée et des années avant l’inscription.',
            short_answer: 'Ce calculateur calcule la contribution mensuelle nécessaire pour atteindre votre objectif d’épargne études, en tenant compte de ce que vous avez déjà épargné et de votre rendement d’investissement attendu.',
            intro_text: '<p>Les plans d’épargne études (comme les comptes 529 aux États-Unis) permettent à l’argent de croître avec des avantages fiscaux pour les futurs frais de scolarité. Ce calculateur tient compte d’un solde de départ déjà épargné, puis résout la contribution mensuelle nécessaire pour combler l’écart vers votre objectif au moment où votre enfant commence ses études.</p><p><b>Les parents qui planifient à l’avance</b> utilisent cela pour convertir une estimation future des frais de scolarité en un chiffre d’épargne mensuel exploitable.</p>',
            key_points: [
                '<b>Tient compte d’une longueur d’avance :</b> Contrairement à un calculateur d’objectif partant de zéro, cela intègre l’épargne que vous avez déjà, réduisant le montant mensuel requis.',
                '<b>Le temps est votre plus grand allié :</b> Commencer quand un enfant est jeune réduit considérablement la contribution mensuelle nécessaire par rapport à commencer quelques années avant l’inscription.',
                '<b>Réévaluez périodiquement :</b> L’inflation des frais de scolarité et les rendements d’investissement évoluent tous deux dans le temps — recalculez tous les un à deux ans.',
            ],
            howto: [
                { question: 'Que faire si le montant cible change à mesure que les études approchent ?', answer: '<p>Recalculez avec un objectif mis à jour — les estimations de frais de scolarité augmentent généralement avec le temps, donc des vérifications périodiques aident à éviter un manque important découvert trop tard.</p>' },
                { question: 'Quel rendement dois-je supposer pour un plan 529 ?', answer: '<p>La plupart des plans 529 utilisent des portefeuilles basés sur l’âge qui deviennent plus conservateurs à mesure que les études approchent — une estimation combinée à long terme de 5-7 % est courante pour les comptes de jeunes enfants.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Objectif d’Épargne Études', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Épargne Actuelle', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Années Avant l’Inscription', type: 'number', unit: 'ans', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Contribution Mensuelle Requise', unit: '$', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-risparmio-universita',
            title: 'Calcolatore Risparmio Università (529)',
            h1: 'Calcolatore Risparmio Università',
            meta_title: 'Calcolatore Risparmio Università | Contributo Mensile Richiesto',
            meta_description: 'Calcola il contributo mensile necessario per raggiungere un obiettivo di risparmio universitario, considerando quanto già risparmiato e gli anni all’iscrizione.',
            short_answer: 'Questo calcolatore calcola il contributo mensile necessario per raggiungere il tuo obiettivo di risparmio universitario, considerando quanto hai già risparmiato e il tuo rendimento di investimento atteso.',
            intro_text: '<p>I piani di risparmio universitario (come i conti 529 negli USA) permettono al denaro di crescere con vantaggi fiscali per i futuri costi educativi. Questo calcolatore considera un saldo iniziale già risparmiato, poi risolve il contributo mensile necessario per colmare il divario verso il tuo obiettivo quando tuo figlio inizia l’università.</p><p><b>I genitori che pianificano in anticipo</b> usano questo per trasformare una stima futura delle tasse universitarie in un numero mensile di risparmio attuabile.</p>',
            key_points: [
                '<b>Considera un vantaggio di partenza:</b> A differenza di un calcolatore di obiettivo da zero, questo tiene conto dei risparmi già presenti, riducendo l’importo mensile richiesto.',
                '<b>Il tempo è il tuo più grande alleato:</b> Iniziare quando un figlio è piccolo riduce drasticamente il contributo mensile necessario rispetto a iniziare pochi anni prima dell’iscrizione.',
                '<b>Rivedi periodicamente:</b> L’inflazione dei costi universitari e i rendimenti degli investimenti cambiano entrambi nel tempo — ricalcola ogni uno o due anni.',
            ],
            howto: [
                { question: 'Cosa succede se l’importo obiettivo cambia man mano che l’università si avvicina?', answer: '<p>Ricalcola con un obiettivo aggiornato — le stime dei costi universitari tendono ad aumentare nel tempo, quindi i controlli periodici aiutano a evitare un grande divario scoperto troppo tardi.</p>' },
                { question: 'Quale rendimento dovrei ipotizzare per un piano 529?', answer: '<p>La maggior parte dei piani 529 usa portafogli basati sull’età che diventano più conservativi man mano che l’università si avvicina — una stima combinata a lungo termine del 5-7% è comune per i conti dei bambini piccoli.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Obiettivo di Risparmio Universitario', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Risparmi Attuali', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Anni All’Iscrizione', type: 'number', unit: 'anni', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Contributo Mensile Richiesto', unit: '$', precision: 2 }],
        },
        de: {
            slug: 'ausbildungssparen-rechner',
            title: 'Ausbildungssparen-Rechner (529)',
            h1: 'Ausbildungssparen-Rechner',
            meta_title: 'Studiensparen-Rechner | Erforderlicher Monatlicher Beitrag',
            meta_description: 'Berechnen Sie den monatlichen Beitrag, der nötig ist, um ein Ausbildungssparziel zu erreichen, unter Berücksichtigung bereits vorhandener Ersparnisse und Jahre bis zur Einschreibung.',
            short_answer: 'Dieser Rechner berechnet den monatlichen Beitrag, der nötig ist, um Ihr Ausbildungssparziel zu erreichen, unter Berücksichtigung dessen, was Sie bereits gespart haben, und Ihrer erwarteten Anlagerendite.',
            intro_text: '<p>Ausbildungssparpläne (wie 529-Konten in den USA) lassen Geld steuerbegünstigt für zukünftige Ausbildungskosten wachsen. Dieser Rechner berücksichtigt einen bereits gesparten Anfangssaldo und löst dann nach dem monatlichen Beitrag auf, der nötig ist, um die Lücke zu Ihrem Ziel zu schließen, bis Ihr Kind mit dem Studium beginnt.</p><p><b>Eltern, die vorausplanen</b>, nutzen dies, um eine zukünftige Studiengebührenschätzung in eine umsetzbare monatliche Sparzahl umzuwandeln.</p>',
            key_points: [
                '<b>Berücksichtigt einen Vorsprung:</b> Anders als ein Zielrechner von null aus berücksichtigt dies bereits vorhandene Ersparnisse und senkt so den erforderlichen monatlichen Betrag.',
                '<b>Zeit ist Ihr größter Verbündeter:</b> Der Beginn, wenn ein Kind noch jung ist, senkt den erforderlichen monatlichen Beitrag drastisch im Vergleich zum Beginn wenige Jahre vor der Einschreibung.',
                '<b>Regelmäßig überprüfen:</b> Studiengebühreninflation und Anlagerenditen ändern sich beide mit der Zeit — berechnen Sie alle ein bis zwei Jahre neu.',
            ],
            howto: [
                { question: 'Was, wenn sich der Zielbetrag ändert, je näher das Studium rückt?', answer: '<p>Berechnen Sie mit einem aktualisierten Ziel neu — Schätzungen der Studiengebühren steigen typischerweise im Laufe der Zeit, daher helfen regelmäßige Überprüfungen, ein zu spät entdecktes großes Defizit zu vermeiden.</p>' },
                { question: 'Welche Rendite sollte ich für einen 529-Plan annehmen?', answer: '<p>Die meisten 529-Pläne verwenden altersbasierte Portfolios, die konservativer werden, je näher das Studium rückt — eine gemischte langfristige Schätzung von 5-7 % ist für Konten jüngerer Kinder üblich.</p>' },
            ],
            inputs: [
                { name: 'target_amount', label: 'Ausbildungssparziel', type: 'number', unit: '$', min: 1, max: 10000000, placeholder: '100000' },
                { name: 'current_savings', label: 'Aktuelle Ersparnisse', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '10000' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Jahre Bis zur Einschreibung', type: 'number', unit: 'Jahre', min: 0.1, max: 25, placeholder: '15' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Erforderlicher Monatlicher Beitrag', unit: '$', precision: 2 }],
        },
    },
}

// ============================================================
// 1037: House Down Payment Savings Calculator
// ============================================================
const houseDownPayment: ToolDef = {
    id: '1037',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'home_price', default: 350000 },
            { key: 'down_payment_pct', default: 20 },
            { key: 'current_savings', default: 15000 },
            { key: 'annual_rate', default: 4 },
            { key: 'years', default: 5 },
        ],
        formulas: {
            down_payment_goal: 'home_price*down_payment_pct/100',
            monthly_deposit: `(home_price*down_payment_pct/100 - current_savings*(1+${R})^${N}) * ${R} / ((1+${R})^${N} - 1)`,
        },
        outputs: [
            { key: 'down_payment_goal', precision: 2 },
            { key: 'monthly_deposit', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'house-down-payment-savings-calculator',
            title: 'House Down Payment Savings Calculator',
            h1: 'House Down Payment Savings Calculator',
            meta_title: 'Down Payment Savings Calculator | Monthly Savings Needed',
            meta_description: 'Calculate how much to save monthly to reach your home down payment goal, based on target home price, down payment percentage, and current savings.',
            short_answer: 'This calculator computes your down payment target based on home price and down payment percentage, then works out the monthly savings needed to get there given your current savings and expected return.',
            intro_text: '<p>A down payment goal starts with simple arithmetic — home price times your target percentage (commonly 20% to avoid mortgage insurance, though many loans allow less). This calculator then applies the same savings-plan math used for any goal to find your required monthly contribution.</p><p><b>Prospective homebuyers</b> use this to set a realistic house-hunting timeline: if the required monthly savings amount doesn\'t fit the budget, extending the timeline or targeting a lower down payment percentage are the two main levers.</p>',
            key_points: [
                '<b>Two-Step Calculation:</b> First derives your dollar down payment goal from the home price and percentage, then solves for the monthly savings needed.',
                '<b>20% Isn\'t Mandatory:</b> Many conventional loans allow down payments as low as 3-5%, though a lower down payment usually means mortgage insurance and a larger loan.',
                '<b>Existing Savings Help:</b> Money you\'ve already saved reduces the future monthly amount needed, since it compounds on its own in the meantime.',
            ],
            howto: [
                { question: 'Do I really need 20% down?', answer: '<p>No — many conventional and government-backed loans allow down payments well below 20%, though a smaller down payment typically means private mortgage insurance (PMI) and a bigger loan-to-value ratio.</p>' },
                { question: 'Should I keep down payment savings in a savings account or invest it?', answer: '<p>For a near-term goal (a few years or less), a high-yield savings account or CD is generally safer than market investments, since you can\'t afford a market downturn right before you need the money.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Target Home Price', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Down Payment Percentage', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Current Savings', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Years Until Purchase', type: 'number', unit: 'years', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Down Payment Goal', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Required Monthly Savings', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-nakopleniy-na-pervyy-vznos',
            title: 'Калькулятор накоплений на первоначальный взнос за жильё',
            h1: 'Калькулятор накоплений на первоначальный взнос',
            meta_title: 'Калькулятор первоначального взноса | Необходимые ежемесячные накопления',
            meta_description: 'Рассчитайте, сколько копить в месяц для первоначального взноса за жильё, исходя из цены дома, процента взноса и текущих накоплений.',
            short_answer: 'Этот калькулятор вычисляет цель по первоначальному взносу на основе цены жилья и процента взноса, затем рассчитывает необходимые ежемесячные накопления с учётом текущих сбережений и ожидаемой доходности.',
            intro_text: '<p>Цель по первоначальному взносу начинается с простой арифметики — цена жилья умножается на целевой процент (обычно 20%, чтобы избежать страхования ипотеки, хотя многие кредиты допускают меньше). Калькулятор применяет ту же математику плана накоплений для любой цели, чтобы найти необходимый ежемесячный взнос.</p><p><b>Будущие покупатели жилья</b> используют это, чтобы установить реалистичный график поиска дома.</p>',
            key_points: [
                '<b>Двухшаговый расчёт:</b> Сначала выводит цель в долларах из цены жилья и процента, затем рассчитывает необходимые ежемесячные накопления.',
                '<b>20% не обязательны:</b> Многие стандартные кредиты допускают взнос от 3-5%, хотя меньший взнос обычно означает страхование ипотеки и больший кредит.',
                '<b>Существующие накопления помогают:</b> Уже отложенные деньги снижают будущую необходимую ежемесячную сумму, так как растут сами по себе.',
            ],
            howto: [
                { question: 'Действительно ли нужно 20% первоначального взноса?', answer: '<p>Нет — многие стандартные и государственные кредиты допускают взнос значительно ниже 20%, хотя меньший взнос обычно означает страхование ипотеки (PMI) и больший коэффициент кредит/стоимость.</p>' },
                { question: 'Хранить накопления на взнос на сберегательном счёте или инвестировать?', answer: '<p>Для краткосрочной цели (несколько лет или меньше) высокодоходный сберегательный счёт или вклад обычно безопаснее рыночных инвестиций.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Целевая цена жилья', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Процент первоначального взноса', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Текущие накопления', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Лет до покупки', type: 'number', unit: 'лет', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Цель по первоначальному взносу', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Необходимые ежемесячные накопления', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'majas-sakotnejas-iemaksas-uzkrajumu-kalkulators',
            title: 'Mājas Sākotnējās Iemaksas Uzkrājumu Kalkulators',
            h1: 'Mājas Sākotnējās Iemaksas Uzkrājumu Kalkulators',
            meta_title: 'Sākotnējās Iemaksas Kalkulators | Nepieciešamie Ikmēneša Uzkrājumi',
            meta_description: 'Aprēķiniet, cik krāt katru mēnesi, lai sasniegtu mājas sākotnējās iemaksas mērķi, balstoties uz mājas cenu, iemaksas procentu un pašreizējiem uzkrājumiem.',
            short_answer: 'Šis kalkulators aprēķina jūsu sākotnējās iemaksas mērķi, balstoties uz mājas cenu un iemaksas procentu, tad aprēķina nepieciešamos ikmēneša uzkrājumus.',
            intro_text: '<p>Sākotnējās iemaksas mērķis sākas ar vienkāršu aritmētiku — mājas cena reiz jūsu mērķa procents (parasti 20%, lai izvairītos no hipotēkas apdrošināšanas, lai gan daudzi aizdevumi pieļauj mazāk). Kalkulators tad piemēro to pašu uzkrājumu plāna matemātiku jebkuram mērķim, lai atrastu nepieciešamo ikmēneša iemaksu.</p><p><b>Potenciālie māju pircēji</b> to izmanto, lai noteiktu reālistisku mājas meklēšanas grafiku.</p>',
            key_points: [
                '<b>Divu soļu aprēķins:</b> Vispirms iegūst jūsu dolāru sākotnējās iemaksas mērķi no mājas cenas un procenta, tad aprēķina nepieciešamos ikmēneša uzkrājumus.',
                '<b>20% nav obligāti:</b> Daudzi standarta aizdevumi pieļauj iemaksu no 3-5%, lai gan mazāka iemaksa parasti nozīmē hipotēkas apdrošināšanu un lielāku aizdevumu.',
                '<b>Esošie uzkrājumi palīdz:</b> Jau uzkrātā nauda samazina nepieciešamo nākotnes ikmēneša summu, jo tā aug pati.',
            ],
            howto: [
                { question: 'Vai tiešām nepieciešami 20% iemaksas?', answer: '<p>Nē — daudzi standarta un valsts atbalstīti aizdevumi pieļauj iemaksu ievērojami zem 20%, lai gan mazāka iemaksa parasti nozīmē hipotēkas apdrošināšanu (PMI) un lielāku aizdevuma-vērtības attiecību.</p>' },
                { question: 'Vai turēt iemaksas uzkrājumus krājkontā vai ieguldīt?', answer: '<p>Tuvākā termiņa mērķim (daži gadi vai mazāk) augsta ienesīguma krājkonts vai depozīts parasti ir drošāks par tirgus investīcijām.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Mērķa Mājas Cena', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Sākotnējās Iemaksas Procents', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Pašreizējie Uzkrājumi', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Gadi Līdz Pirkumam', type: 'number', unit: 'gadi', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Sākotnējās Iemaksas Mērķis', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Nepieciešamie Ikmēneša Uzkrājumi', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-na-wklad-wlasny',
            title: 'Kalkulator Oszczędności na Wkład Własny do Domu',
            h1: 'Kalkulator Oszczędności na Wkład Własny',
            meta_title: 'Kalkulator Wkładu Własnego | Wymagane Miesięczne Oszczędności',
            meta_description: 'Oblicz, ile oszczędzać miesięcznie, aby osiągnąć cel wkładu własnego na dom, na podstawie ceny domu, procentu wkładu i obecnych oszczędności.',
            short_answer: 'Ten kalkulator oblicza twój cel wkładu własnego na podstawie ceny domu i procentu wkładu, a następnie wylicza wymagane miesięczne oszczędności.',
            intro_text: '<p>Cel wkładu własnego zaczyna się od prostej arytmetyki — cena domu razy twój docelowy procent (zwykle 20%, aby uniknąć ubezpieczenia kredytu, choć wiele kredytów pozwala na mniej). Kalkulator stosuje tę samą matematykę planu oszczędnościowego dla dowolnego celu.</p><p><b>Potencjalni nabywcy domów</b> używają tego, aby ustalić realistyczny harmonogram poszukiwań domu.</p>',
            key_points: [
                '<b>Dwustopniowe obliczenie:</b> Najpierw wyprowadza cel w dolarach z ceny domu i procentu, następnie oblicza wymagane miesięczne oszczędności.',
                '<b>20% nie jest obowiązkowe:</b> Wiele standardowych kredytów pozwala na wkład od 3-5%, choć mniejszy wkład zwykle oznacza ubezpieczenie kredytu i większy kredyt.',
                '<b>Istniejące oszczędności pomagają:</b> Pieniądze, które już odłożyłeś, zmniejszają wymaganą przyszłą miesięczną kwotę, ponieważ rosną same.',
            ],
            howto: [
                { question: 'Czy naprawdę potrzebuję 20% wkładu?', answer: '<p>Nie — wiele standardowych i rządowych kredytów pozwala na wkład znacznie poniżej 20%, choć mniejszy wkład zwykle oznacza ubezpieczenie kredytu (PMI) i wyższy wskaźnik LTV.</p>' },
                { question: 'Czy trzymać oszczędności na wkład na koncie oszczędnościowym czy inwestować?', answer: '<p>Dla celu krótkoterminowego (kilka lat lub mniej) konto oszczędnościowe o wysokim oprocentowaniu lub lokata są zazwyczaj bezpieczniejsze niż inwestycje rynkowe.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Docelowa Cena Domu', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Procent Wkładu Własnego', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Obecne Oszczędności', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Lata do Zakupu', type: 'number', unit: 'lat', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Cel Wkładu Własnego', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Wymagane Miesięczne Oszczędności', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-ahorro-pago-inicial-casa',
            title: 'Calculadora de Ahorro para el Pago Inicial de una Casa',
            h1: 'Calculadora de Ahorro para el Pago Inicial',
            meta_title: 'Calculadora de Pago Inicial | Ahorro Mensual Necesario',
            meta_description: 'Calcula cuánto ahorrar al mes para alcanzar tu meta de pago inicial, según el precio de la vivienda, el porcentaje de enganche y tus ahorros actuales.',
            short_answer: 'Esta calculadora calcula tu meta de pago inicial según el precio de la vivienda y el porcentaje de enganche, luego determina el ahorro mensual necesario para llegar allí.',
            intro_text: '<p>Una meta de pago inicial comienza con aritmética simple —precio de la vivienda por tu porcentaje objetivo (comúnmente 20% para evitar el seguro hipotecario, aunque muchos préstamos permiten menos). Esta calculadora aplica la misma matemática de plan de ahorro a cualquier meta.</p><p><b>Los futuros compradores de vivienda</b> usan esto para establecer un cronograma realista de búsqueda de casa.</p>',
            key_points: [
                '<b>Cálculo en dos pasos:</b> Primero deriva tu meta en dólares a partir del precio y el porcentaje, luego calcula el ahorro mensual necesario.',
                '<b>El 20% no es obligatorio:</b> Muchos préstamos convencionales permiten pagos iniciales desde 3-5%, aunque un pago inicial menor suele significar seguro hipotecario y un préstamo mayor.',
                '<b>Los ahorros existentes ayudan:</b> El dinero que ya has ahorrado reduce el monto mensual futuro necesario, ya que se capitaliza por sí solo mientras tanto.',
            ],
            howto: [
                { question: '¿Realmente necesito el 20% de enganche?', answer: '<p>No — muchos préstamos convencionales y respaldados por el gobierno permiten pagos iniciales muy por debajo del 20%, aunque un pago inicial menor suele significar seguro hipotecario privado (PMI) y una relación préstamo-valor mayor.</p>' },
                { question: '¿Debo mantener los ahorros del enganche en una cuenta de ahorro o invertirlos?', answer: '<p>Para una meta a corto plazo (unos pocos años o menos), una cuenta de ahorro de alto rendimiento o un CD son generalmente más seguros que las inversiones de mercado.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Precio Objetivo de la Vivienda', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Porcentaje de Pago Inicial', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Ahorros Actuales', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Años Hasta la Compra', type: 'number', unit: 'años', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Meta de Pago Inicial', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Ahorro Mensual Requerido', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-epargne-apport-immobilier',
            title: 'Calculateur d’Épargne pour Apport Immobilier',
            h1: 'Calculateur d’Épargne pour Apport',
            meta_title: 'Calculateur d’Apport | Épargne Mensuelle Nécessaire',
            meta_description: 'Calculez combien épargner par mois pour atteindre votre objectif d’apport, selon le prix cible du bien, le pourcentage d’apport et l’épargne actuelle.',
            short_answer: 'Ce calculateur détermine votre objectif d’apport selon le prix du bien et le pourcentage d’apport, puis calcule l’épargne mensuelle nécessaire pour y parvenir.',
            intro_text: '<p>Un objectif d’apport commence par une arithmétique simple — le prix du bien multiplié par votre pourcentage cible (généralement 20 % pour éviter l’assurance hypothécaire, bien que de nombreux prêts permettent moins). Ce calculateur applique ensuite les mêmes mathématiques de plan d’épargne à tout objectif.</p><p><b>Les futurs acheteurs</b> utilisent cela pour établir un calendrier réaliste de recherche de logement.</p>',
            key_points: [
                '<b>Calcul en deux étapes :</b> Dérive d’abord votre objectif en dollars à partir du prix et du pourcentage, puis résout l’épargne mensuelle nécessaire.',
                '<b>20 % n’est pas obligatoire :</b> De nombreux prêts conventionnels permettent des apports de seulement 3-5 %, bien qu’un apport plus faible signifie généralement une assurance hypothécaire et un prêt plus important.',
                '<b>L’épargne existante aide :</b> L’argent déjà épargné réduit le montant mensuel futur nécessaire, car il se capitalise seul entre-temps.',
            ],
            howto: [
                { question: 'Ai-je vraiment besoin de 20 % d’apport ?', answer: '<p>Non — de nombreux prêts conventionnels et garantis par l’État permettent des apports bien inférieurs à 20 %, bien qu’un apport plus faible signifie généralement une assurance hypothécaire privée et un ratio prêt-valeur plus élevé.</p>' },
                { question: 'Dois-je garder l’épargne d’apport sur un compte épargne ou l’investir ?', answer: '<p>Pour un objectif à court terme (quelques années ou moins), un compte épargne à haut rendement ou un CD est généralement plus sûr que les investissements boursiers.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Prix Cible du Bien', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Pourcentage d’Apport', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Épargne Actuelle', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Années Avant l’Achat', type: 'number', unit: 'ans', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Objectif d’Apport', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Épargne Mensuelle Requise', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-risparmio-anticipo-casa',
            title: 'Calcolatore Risparmio per Anticipo Casa',
            h1: 'Calcolatore Risparmio per Anticipo Casa',
            meta_title: 'Calcolatore Anticipo | Risparmio Mensile Necessario',
            meta_description: 'Calcola quanto risparmiare al mese per raggiungere il tuo obiettivo di anticipo, in base al prezzo della casa, alla percentuale di anticipo e ai risparmi attuali.',
            short_answer: 'Questo calcolatore calcola il tuo obiettivo di anticipo in base al prezzo della casa e alla percentuale di anticipo, poi determina il risparmio mensile necessario per raggiungerlo.',
            intro_text: '<p>Un obiettivo di anticipo inizia con un’aritmetica semplice — prezzo della casa moltiplicato per la percentuale obiettivo (comunemente il 20% per evitare l’assicurazione ipotecaria, sebbene molti prestiti ne consentano meno). Questo calcolatore applica poi la stessa matematica del piano di risparmio a qualsiasi obiettivo.</p><p><b>I potenziali acquirenti di case</b> usano questo per stabilire una tempistica realistica di ricerca della casa.</p>',
            key_points: [
                '<b>Calcolo in due fasi:</b> Prima deriva il tuo obiettivo in dollari dal prezzo e dalla percentuale, poi calcola il risparmio mensile necessario.',
                '<b>Il 20% non è obbligatorio:</b> Molti prestiti convenzionali consentono anticipi anche del 3-5%, sebbene un anticipo inferiore significhi solitamente assicurazione ipotecaria e un prestito maggiore.',
                '<b>I risparmi esistenti aiutano:</b> Il denaro già risparmiato riduce l’importo mensile futuro necessario, poiché cresce da solo nel frattempo.',
            ],
            howto: [
                { question: 'Ho davvero bisogno del 20% di anticipo?', answer: '<p>No — molti prestiti convenzionali e garantiti dal governo consentono anticipi ben inferiori al 20%, sebbene un anticipo minore significhi solitamente assicurazione ipotecaria privata (PMI) e un rapporto prestito-valore maggiore.</p>' },
                { question: 'Dovrei tenere i risparmi per l’anticipo in un conto di risparmio o investirli?', answer: '<p>Per un obiettivo a breve termine (pochi anni o meno), un conto di risparmio ad alto rendimento o un CD sono generalmente più sicuri degli investimenti di mercato.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Prezzo Obiettivo della Casa', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Percentuale di Anticipo', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Risparmi Attuali', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Anni All’Acquisto', type: 'number', unit: 'anni', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Obiettivo di Anticipo', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Risparmio Mensile Richiesto', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'haus-anzahlung-sparrechner',
            title: 'Haus-Anzahlung-Sparrechner',
            h1: 'Haus-Anzahlung-Sparrechner',
            meta_title: 'Anzahlungs-Sparrechner | Erforderliche Monatliche Ersparnisse',
            meta_description: 'Berechnen Sie, wie viel Sie monatlich sparen müssen, um Ihr Anzahlungsziel zu erreichen, basierend auf Kaufpreis, Anzahlungsprozentsatz und aktuellen Ersparnissen.',
            short_answer: 'Dieser Rechner berechnet Ihr Anzahlungsziel basierend auf Kaufpreis und Anzahlungsprozentsatz und ermittelt dann die erforderlichen monatlichen Ersparnisse.',
            intro_text: '<p>Ein Anzahlungsziel beginnt mit einfacher Arithmetik — Kaufpreis mal Ihr Zielprozentsatz (üblicherweise 20 %, um eine Hypothekenversicherung zu vermeiden, obwohl viele Kredite weniger erlauben). Dieser Rechner wendet dann dieselbe Sparplan-Mathematik auf jedes Ziel an.</p><p><b>Zukünftige Hauskäufer</b> nutzen dies, um einen realistischen Zeitplan für die Haussuche festzulegen.</p>',
            key_points: [
                '<b>Zweistufige Berechnung:</b> Leitet zunächst Ihr Dollar-Anzahlungsziel aus Kaufpreis und Prozentsatz ab, löst dann nach den erforderlichen monatlichen Ersparnissen auf.',
                '<b>20 % sind nicht verpflichtend:</b> Viele konventionelle Kredite erlauben Anzahlungen von nur 3-5 %, obwohl eine niedrigere Anzahlung meist eine Hypothekenversicherung und einen größeren Kredit bedeutet.',
                '<b>Bestehende Ersparnisse helfen:</b> Bereits gespartes Geld senkt den zukünftig benötigten monatlichen Betrag, da es in der Zwischenzeit selbst wächst.',
            ],
            howto: [
                { question: 'Brauche ich wirklich 20 % Anzahlung?', answer: '<p>Nein — viele konventionelle und staatlich unterstützte Kredite erlauben Anzahlungen deutlich unter 20 %, obwohl eine kleinere Anzahlung meist eine private Hypothekenversicherung (PMI) und ein höheres Beleihungsverhältnis bedeutet.</p>' },
                { question: 'Sollte ich Anzahlungsersparnisse auf einem Sparkonto halten oder investieren?', answer: '<p>Für ein kurzfristiges Ziel (wenige Jahre oder weniger) ist ein hochverzinsliches Sparkonto oder Festgeld in der Regel sicherer als Marktanlagen.</p>' },
            ],
            inputs: [
                { name: 'home_price', label: 'Ziel-Kaufpreis', type: 'number', unit: '$', min: 1000, max: 20000000, placeholder: '350000' },
                { name: 'down_payment_pct', label: 'Anzahlungsprozentsatz', type: 'number', unit: '%', min: 1, max: 100, placeholder: '20' },
                { name: 'current_savings', label: 'Aktuelle Ersparnisse', type: 'number', unit: '$', min: 0, max: 20000000, placeholder: '15000' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 20, placeholder: '4' },
                { name: 'years', label: 'Jahre Bis zum Kauf', type: 'number', unit: 'Jahre', min: 0.1, max: 30, placeholder: '5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Anzahlungsziel', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Erforderliche Monatliche Ersparnisse', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1038: Wedding Savings Calculator
// ============================================================
const weddingSavings: ToolDef = {
    id: '1038',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'wedding_budget', default: 30000 },
            { key: 'current_savings', default: 5000 },
            { key: 'annual_rate', default: 3 },
            { key: 'years', default: 2 },
        ],
        formulas: {
            monthly_deposit: `(wedding_budget - current_savings*(1+${R})^${N}) * ${R} / ((1+${R})^${N} - 1)`,
        },
        outputs: [{ key: 'monthly_deposit', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'wedding-savings-calculator',
            title: 'Wedding Savings Calculator',
            h1: 'Wedding Savings Calculator',
            meta_title: 'Wedding Savings Calculator | Monthly Savings Needed',
            meta_description: 'Calculate the monthly savings needed to afford your wedding budget by the big day, based on your timeline and current savings.',
            short_answer: 'This calculator computes the monthly amount you need to save to cover your wedding budget by the big day, factoring in any savings you already have set aside.',
            intro_text: '<p>Wedding costs are typically a fixed target with a firm deadline — the wedding date — which makes this a clean application of goal-based savings math. This calculator takes your total budget, existing savings, and time remaining to compute an exact monthly savings figure.</p><p><b>Engaged couples</b> use this to build a realistic savings plan early, well before vendor deposits and final payments come due, and to see how adjusting the budget or timeline changes the monthly commitment.</p>',
            key_points: [
                '<b>Firm Deadline, Clear Math:</b> A fixed wedding date makes this one of the most precise applications of savings-goal calculations.',
                '<b>Existing Savings Reduce the Monthly Burden:</b> Any wedding fund already started lowers the amount still needed each month.',
                '<b>Short-Term Goal, Safer Savings Vehicle:</b> With only a year or two typically, a high-yield savings account is generally more appropriate than market investments for wedding funds.',
            ],
            howto: [
                { question: 'Should we build in a buffer above our target budget?', answer: '<p>Many wedding planners suggest budgeting an extra 10-15% for unexpected costs — consider entering a slightly higher target budget to build that cushion in automatically.</p>' },
                { question: 'What if our wedding budget changes?', answer: '<p>Recalculate with the updated figure — wedding budgets commonly shift as vendor quotes come in, so revisiting this every few months keeps your monthly savings target accurate.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Wedding Budget', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Current Wedding Savings', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Years Until Wedding', type: 'number', unit: 'years', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Required Monthly Savings', unit: '$', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-nakopleniy-na-svadbu',
            title: 'Калькулятор накоплений на свадьбу',
            h1: 'Калькулятор накоплений на свадьбу',
            meta_title: 'Калькулятор накоплений на свадьбу | Необходимые ежемесячные накопления',
            meta_description: 'Рассчитайте ежемесячные накопления, необходимые для покрытия бюджета свадьбы к нужной дате, с учётом текущих сбережений.',
            short_answer: 'Этот калькулятор вычисляет ежемесячную сумму, необходимую для накопления на бюджет свадьбы к нужной дате, учитывая уже отложенные средства.',
            intro_text: '<p>Расходы на свадьбу обычно имеют фиксированную цель с чёткой датой — датой свадьбы, что делает это чистым применением математики накоплений на цель. Калькулятор берёт общий бюджет, существующие накопления и оставшееся время, чтобы вычислить точную ежемесячную сумму.</p><p><b>Помолвленные пары</b> используют это, чтобы заранее выстроить реалистичный план накоплений.</p>',
            key_points: [
                '<b>Чёткий срок, ясная математика:</b> Фиксированная дата свадьбы делает это одним из самых точных применений расчёта цели накоплений.',
                '<b>Существующие накопления снижают нагрузку:</b> Любой уже начатый свадебный фонд снижает необходимую ежемесячную сумму.',
                '<b>Краткосрочная цель, более безопасный инструмент:</b> Обычно на год-два подходит высокодоходный сберегательный счёт, а не рыночные инвестиции.',
            ],
            howto: [
                { question: 'Стоит ли закладывать запас сверх целевого бюджета?', answer: '<p>Многие свадебные организаторы советуют закладывать дополнительные 10-15% на непредвиденные расходы — рассмотрите чуть более высокий целевой бюджет для автоматического запаса.</p>' },
                { question: 'Что если бюджет свадьбы изменится?', answer: '<p>Пересчитайте с обновлённой цифрой — бюджеты свадеб часто меняются по мере поступления предложений от подрядчиков.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Бюджет свадьбы', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Текущие накопления на свадьбу', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Лет до свадьбы', type: 'number', unit: 'лет', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Необходимые ежемесячные накопления', unit: '$', precision: 2 }],
        },
        lv: {
            slug: 'kazu-uzkrajumu-kalkulators',
            title: 'Kāzu Uzkrājumu Kalkulators',
            h1: 'Kāzu Uzkrājumu Kalkulators',
            meta_title: 'Kāzu Uzkrājumu Kalkulators | Nepieciešamie Ikmēneša Uzkrājumi',
            meta_description: 'Aprēķiniet ikmēneša uzkrājumus, kas nepieciešami, lai atļautos kāzu budžetu līdz svarīgajai dienai, balstoties uz termiņu un pašreizējiem uzkrājumiem.',
            short_answer: 'Šis kalkulators aprēķina ikmēneša summu, kas nepieciešama, lai uzkrātu kāzu budžetu līdz svarīgajai dienai, ņemot vērā jau atliktos līdzekļus.',
            intro_text: '<p>Kāzu izmaksas parasti ir fiksēts mērķis ar skaidru termiņu — kāzu datumu, kas padara šo par tīru uzkrājumu mērķa matemātikas pielietojumu. Kalkulators ņem kopējo budžetu, esošos uzkrājumus un atlikušo laiku, lai aprēķinātu precīzu ikmēneša summu.</p><p><b>Saderinātie pāri</b> to izmanto, lai savlaicīgi izveidotu reālistisku uzkrājumu plānu.</p>',
            key_points: [
                '<b>Skaidrs termiņš, skaidra matemātika:</b> Fiksēts kāzu datums padara šo par vienu no precīzākajiem uzkrājumu mērķa aprēķina pielietojumiem.',
                '<b>Esošie uzkrājumi samazina slogu:</b> Jebkurš jau sāktais kāzu fonds samazina nepieciešamo ikmēneša summu.',
                '<b>Īstermiņa mērķis, drošāks instruments:</b> Parasti uz gadu vai diviem, augsta ienesīguma krājkonts ir piemērotāks nekā tirgus investīcijas.',
            ],
            howto: [
                { question: 'Vai vajadzētu iekļaut rezervi virs mērķa budžeta?', answer: '<p>Daudzi kāzu plānotāji iesaka rezervēt papildu 10-15% neparedzētiem izdevumiem — apsveriet nedaudz augstāku mērķa budžetu, lai automātiski iekļautu šo rezervi.</p>' },
                { question: 'Ko darīt, ja kāzu budžets mainās?', answer: '<p>Pārrēķiniet ar atjaunināto summu — kāzu budžeti bieži mainās, ienākot piegādātāju piedāvājumiem.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Kāzu Budžets', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Pašreizējie Kāzu Uzkrājumi', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Gadi Līdz Kāzām', type: 'number', unit: 'gadi', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Nepieciešamie Ikmēneša Uzkrājumi', unit: '$', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-na-slub',
            title: 'Kalkulator Oszczędności na Ślub',
            h1: 'Kalkulator Oszczędności na Ślub',
            meta_title: 'Kalkulator Oszczędności na Ślub | Wymagane Miesięczne Oszczędności',
            meta_description: 'Oblicz miesięczne oszczędności potrzebne, aby pokryć budżet ślubny do wielkiego dnia, na podstawie harmonogramu i obecnych oszczędności.',
            short_answer: 'Ten kalkulator oblicza miesięczną kwotę potrzebną do zaoszczędzenia na budżet ślubny do wielkiego dnia, uwzględniając wszelkie już odłożone środki.',
            intro_text: '<p>Koszty ślubu to zazwyczaj stały cel z konkretnym terminem — datą ślubu, co czyni to czystym zastosowaniem matematyki oszczędzania celowego. Kalkulator bierze całkowity budżet, istniejące oszczędności i pozostały czas, aby obliczyć dokładną miesięczną kwotę.</p><p><b>Zaręczone pary</b> używają tego, aby wcześnie zbudować realistyczny plan oszczędnościowy.</p>',
            key_points: [
                '<b>Stały termin, jasna matematyka:</b> Ustalona data ślubu czyni to jednym z najbardziej precyzyjnych zastosowań obliczeń celu oszczędnościowego.',
                '<b>Istniejące oszczędności zmniejszają obciążenie:</b> Każdy już rozpoczęty fundusz ślubny obniża wymaganą miesięczną kwotę.',
                '<b>Cel krótkoterminowy, bezpieczniejszy instrument:</b> Zwykle na rok lub dwa, konto oszczędnościowe o wysokim oprocentowaniu jest bardziej odpowiednie niż inwestycje rynkowe.',
            ],
            howto: [
                { question: 'Czy powinniśmy wliczyć bufor ponad docelowy budżet?', answer: '<p>Wielu organizatorów ślubów sugeruje zaplanowanie dodatkowych 10-15% na nieprzewidziane wydatki — rozważ wprowadzenie nieco wyższego budżetu docelowego, aby automatycznie zbudować ten bufor.</p>' },
                { question: 'Co jeśli nasz budżet ślubny się zmieni?', answer: '<p>Przelicz z zaktualizowaną kwotą — budżety ślubne często się zmieniają w miarę napływania ofert dostawców.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Budżet Ślubny', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Obecne Oszczędności na Ślub', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Lata do Ślubu', type: 'number', unit: 'lat', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Wymagane Miesięczne Oszczędności', unit: '$', precision: 2 }],
        },
        es: {
            slug: 'calculadora-ahorro-boda',
            title: 'Calculadora de Ahorro para la Boda',
            h1: 'Calculadora de Ahorro para la Boda',
            meta_title: 'Calculadora de Ahorro para Boda | Ahorro Mensual Necesario',
            meta_description: 'Calcula el ahorro mensual necesario para cubrir el presupuesto de tu boda para el gran día, según tu plazo y ahorros actuales.',
            short_answer: 'Esta calculadora calcula el monto mensual que necesitas ahorrar para cubrir el presupuesto de tu boda para el gran día, considerando cualquier ahorro que ya tengas apartado.',
            intro_text: '<p>Los costos de boda suelen ser un objetivo fijo con una fecha límite firme —la fecha de la boda— lo que hace de esto una aplicación limpia de la matemática de ahorro basado en metas. Esta calculadora toma tu presupuesto total, ahorros existentes y tiempo restante para calcular una cifra mensual exacta.</p><p><b>Las parejas comprometidas</b> usan esto para construir un plan de ahorro realista con anticipación.</p>',
            key_points: [
                '<b>Plazo firme, matemática clara:</b> Una fecha de boda fija hace de esto una de las aplicaciones más precisas de los cálculos de meta de ahorro.',
                '<b>Los ahorros existentes reducen la carga mensual:</b> Cualquier fondo de boda ya iniciado reduce el monto mensual aún necesario.',
                '<b>Meta a corto plazo, vehículo de ahorro más seguro:</b> Con típicamente solo uno o dos años, una cuenta de ahorro de alto rendimiento suele ser más apropiada que las inversiones de mercado.',
            ],
            howto: [
                { question: '¿Deberíamos incluir un margen sobre nuestro presupuesto objetivo?', answer: '<p>Muchos organizadores de bodas sugieren presupuestar un 10-15% extra para gastos inesperados — considera ingresar un presupuesto objetivo ligeramente más alto para incluir ese colchón automáticamente.</p>' },
                { question: '¿Qué pasa si nuestro presupuesto de boda cambia?', answer: '<p>Recalcula con la cifra actualizada — los presupuestos de boda comúnmente cambian a medida que llegan las cotizaciones de proveedores.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Presupuesto de Boda', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Ahorros Actuales para la Boda', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Años Hasta la Boda', type: 'number', unit: 'años', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Ahorro Mensual Requerido', unit: '$', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-epargne-mariage',
            title: 'Calculateur d’Épargne Mariage',
            h1: 'Calculateur d’Épargne Mariage',
            meta_title: 'Calculateur d’Épargne Mariage | Épargne Mensuelle Nécessaire',
            meta_description: 'Calculez l’épargne mensuelle nécessaire pour couvrir votre budget mariage d’ici le grand jour, selon votre échéance et votre épargne actuelle.',
            short_answer: 'Ce calculateur calcule le montant mensuel que vous devez épargner pour couvrir votre budget mariage d’ici le grand jour, en tenant compte de toute épargne déjà mise de côté.',
            intro_text: '<p>Les coûts de mariage sont généralement un objectif fixe avec une échéance ferme — la date du mariage — ce qui en fait une application nette des mathématiques d’épargne basée sur des objectifs. Ce calculateur prend votre budget total, votre épargne existante et le temps restant pour calculer un chiffre mensuel exact.</p><p><b>Les couples fiancés</b> utilisent cela pour établir un plan d’épargne réaliste tôt.</p>',
            key_points: [
                '<b>Échéance ferme, mathématiques claires :</b> Une date de mariage fixe fait de cela l’une des applications les plus précises des calculs d’objectif d’épargne.',
                '<b>L’épargne existante réduit la charge mensuelle :</b> Tout fonds mariage déjà commencé réduit le montant encore nécessaire chaque mois.',
                '<b>Objectif à court terme, véhicule d’épargne plus sûr :</b> Avec généralement seulement un an ou deux, un compte épargne à haut rendement est généralement plus approprié que les investissements boursiers.',
            ],
            howto: [
                { question: 'Devrions-nous prévoir une marge au-dessus de notre budget cible ?', answer: '<p>De nombreux organisateurs de mariage suggèrent de prévoir 10-15 % supplémentaires pour les coûts imprévus — envisagez d’entrer un budget cible légèrement plus élevé pour intégrer automatiquement ce coussin.</p>' },
                { question: 'Que faire si notre budget mariage change ?', answer: '<p>Recalculez avec le chiffre mis à jour — les budgets mariage changent souvent à mesure que les devis des prestataires arrivent.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Budget Mariage', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Épargne Mariage Actuelle', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Années Avant le Mariage', type: 'number', unit: 'ans', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Épargne Mensuelle Requise', unit: '$', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-risparmio-matrimonio',
            title: 'Calcolatore Risparmio per il Matrimonio',
            h1: 'Calcolatore Risparmio per il Matrimonio',
            meta_title: 'Calcolatore Risparmio Matrimonio | Risparmio Mensile Necessario',
            meta_description: 'Calcola il risparmio mensile necessario per coprire il budget del matrimonio entro il grande giorno, in base ai tempi e ai risparmi attuali.',
            short_answer: 'Questo calcolatore calcola l’importo mensile che devi risparmiare per coprire il budget del tuo matrimonio entro il grande giorno, considerando eventuali risparmi già accantonati.',
            intro_text: '<p>I costi del matrimonio sono tipicamente un obiettivo fisso con una scadenza precisa — la data del matrimonio — il che rende questa un’applicazione pulita della matematica del risparmio basato su obiettivi. Questo calcolatore prende il tuo budget totale, i risparmi esistenti e il tempo rimanente per calcolare una cifra mensile esatta.</p><p><b>Le coppie fidanzate</b> usano questo per costruire un piano di risparmio realistico in anticipo.</p>',
            key_points: [
                '<b>Scadenza fissa, matematica chiara:</b> Una data di matrimonio fissa rende questa una delle applicazioni più precise dei calcoli di obiettivo di risparmio.',
                '<b>I risparmi esistenti riducono il carico mensile:</b> Qualsiasi fondo matrimonio già avviato riduce l’importo ancora necessario ogni mese.',
                '<b>Obiettivo a breve termine, strumento più sicuro:</b> Con tipicamente solo uno o due anni, un conto di risparmio ad alto rendimento è generalmente più appropriato degli investimenti di mercato.',
            ],
            howto: [
                { question: 'Dovremmo includere un margine sopra il nostro budget obiettivo?', answer: '<p>Molti organizzatori di matrimoni suggeriscono di prevedere un extra del 10-15% per costi imprevisti — considera di inserire un budget obiettivo leggermente più alto per costruire automaticamente quel cuscinetto.</p>' },
                { question: 'Cosa succede se il nostro budget matrimonio cambia?', answer: '<p>Ricalcola con la cifra aggiornata — i budget matrimoniali cambiano comunemente man mano che arrivano i preventivi dei fornitori.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Budget Matrimonio', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Risparmi Attuali per il Matrimonio', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Anni al Matrimonio', type: 'number', unit: 'anni', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Risparmio Mensile Richiesto', unit: '$', precision: 2 }],
        },
        de: {
            slug: 'hochzeit-sparrechner',
            title: 'Hochzeit-Sparrechner',
            h1: 'Hochzeit-Sparrechner',
            meta_title: 'Hochzeit-Sparrechner | Erforderliche Monatliche Ersparnisse',
            meta_description: 'Berechnen Sie die monatlichen Ersparnisse, die nötig sind, um Ihr Hochzeitsbudget bis zum großen Tag zu decken, basierend auf Zeitrahmen und aktuellen Ersparnissen.',
            short_answer: 'Dieser Rechner berechnet den monatlichen Betrag, den Sie sparen müssen, um Ihr Hochzeitsbudget bis zum großen Tag zu decken, unter Berücksichtigung bereits vorhandener Ersparnisse.',
            intro_text: '<p>Hochzeitskosten sind typischerweise ein festes Ziel mit einer festen Frist — dem Hochzeitsdatum — was dies zu einer sauberen Anwendung der zielbasierten Spar-Mathematik macht. Dieser Rechner nimmt Ihr Gesamtbudget, vorhandene Ersparnisse und verbleibende Zeit, um eine genaue monatliche Zahl zu berechnen.</p><p><b>Verlobte Paare</b> nutzen dies, um frühzeitig einen realistischen Sparplan zu erstellen.</p>',
            key_points: [
                '<b>Feste Frist, klare Mathematik:</b> Ein festes Hochzeitsdatum macht dies zu einer der präzisesten Anwendungen von Sparziel-Berechnungen.',
                '<b>Bestehende Ersparnisse senken die monatliche Belastung:</b> Jeder bereits begonnene Hochzeitsfonds senkt den monatlich noch benötigten Betrag.',
                '<b>Kurzfristiges Ziel, sicherere Sparanlage:</b> Bei typischerweise nur ein bis zwei Jahren ist ein hochverzinsliches Sparkonto in der Regel besser geeignet als Marktanlagen.',
            ],
            howto: [
                { question: 'Sollten wir einen Puffer über unser Zielbudget einplanen?', answer: '<p>Viele Hochzeitsplaner empfehlen, zusätzliche 10-15 % für unerwartete Kosten einzuplanen — erwägen Sie ein etwas höheres Zielbudget, um diesen Puffer automatisch einzubauen.</p>' },
                { question: 'Was, wenn sich unser Hochzeitsbudget ändert?', answer: '<p>Berechnen Sie mit der aktualisierten Zahl neu — Hochzeitsbudgets ändern sich häufig, sobald Angebote von Anbietern eingehen.</p>' },
            ],
            inputs: [
                { name: 'wedding_budget', label: 'Hochzeitsbudget', type: 'number', unit: '$', min: 100, max: 10000000, placeholder: '30000' },
                { name: 'current_savings', label: 'Aktuelle Hochzeitsersparnisse', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '5000' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Jahre Bis zur Hochzeit', type: 'number', unit: 'Jahre', min: 0.1, max: 10, placeholder: '2' },
            ],
            outputs: [{ name: 'monthly_deposit', label: 'Erforderliche Monatliche Ersparnisse', unit: '$', precision: 2 }],
        },
    },
}

// ============================================================
// 1039: Car Down Payment Savings Calculator
// ============================================================
const carSavings: ToolDef = {
    id: '1039',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'car_price', default: 30000 },
            { key: 'down_payment_pct', default: 15 },
            { key: 'current_savings', default: 2000 },
            { key: 'annual_rate', default: 3 },
            { key: 'years', default: 1.5 },
        ],
        formulas: {
            down_payment_goal: 'car_price*down_payment_pct/100',
            monthly_deposit: `(car_price*down_payment_pct/100 - current_savings*(1+${R})^${N}) * ${R} / ((1+${R})^${N} - 1)`,
        },
        outputs: [
            { key: 'down_payment_goal', precision: 2 },
            { key: 'monthly_deposit', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'car-down-payment-savings-calculator',
            title: 'Car Down Payment Savings Calculator',
            h1: 'Car Down Payment Savings Calculator',
            meta_title: 'Car Down Payment Calculator | Monthly Savings Needed',
            meta_description: 'Calculate how much to save monthly for your car down payment, based on the vehicle price, down payment percentage, and your timeline.',
            short_answer: 'This calculator computes your car down payment target based on the vehicle price and down payment percentage, then works out the monthly savings needed given your current savings and timeline.',
            intro_text: '<p>A bigger down payment on a car loan means a smaller loan amount, lower monthly payment, and less total interest — this calculator helps you plan the savings needed to hit a specific down payment target before you go car shopping.</p><p><b>Car buyers</b> use this to set a savings timeline that avoids financing more than necessary, since a larger upfront down payment directly reduces the loan (see our Auto Loan Calculator for the resulting monthly payment).</p>',
            key_points: [
                '<b>Bigger Down Payment, Smaller Loan:</b> Every dollar saved toward the down payment is a dollar not financed at interest.',
                '<b>Short Timeline, Safer Vehicle:</b> For a savings goal under 1-2 years, a savings account is generally more appropriate than market investments.',
                '<b>Pairs With the Auto Loan Calculator:</b> Once you know your down payment, use it alongside vehicle price and loan terms to see your resulting monthly payment.',
            ],
            howto: [
                { question: 'What\'s a typical down payment percentage for a car?', answer: '<p>20% is a commonly cited target for new cars, though many buyers put down less — the key trade-off is a smaller down payment means a larger loan and more total interest paid.</p>' },
                { question: 'Should I include my trade-in value in current savings?', answer: '<p>You can, if you know its approximate value — but check current market values rather than assuming a dealership\'s initial offer, since trade-in valuations vary.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Target Car Price', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Down Payment Percentage', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Current Savings', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Years Until Purchase', type: 'number', unit: 'years', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Down Payment Goal', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Required Monthly Savings', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-nakopleniy-na-avto',
            title: 'Калькулятор накоплений на первый взнос за авто',
            h1: 'Калькулятор накоплений на первый взнос за авто',
            meta_title: 'Калькулятор первого взноса за авто | Необходимые ежемесячные накопления',
            meta_description: 'Рассчитайте, сколько копить в месяц на первый взнос за автомобиль, исходя из цены авто, процента взноса и срока.',
            short_answer: 'Этот калькулятор вычисляет цель по первому взносу за автомобиль на основе цены и процента взноса, затем рассчитывает необходимые ежемесячные накопления.',
            intro_text: '<p>Больший первый взнос по автокредиту означает меньшую сумму кредита, меньший ежемесячный платёж и меньшую переплату — этот калькулятор помогает спланировать необходимые накопления перед покупкой авто.</p><p><b>Покупатели авто</b> используют это, чтобы установить график накоплений, избегая избыточного финансирования.</p>',
            key_points: [
                '<b>Больший взнос, меньший кредит:</b> Каждый доллар, отложенный на взнос — это доллар, не финансируемый под проценты.',
                '<b>Короткий срок, более безопасный инструмент:</b> Для цели менее чем на 1-2 года сберегательный счёт обычно подходит лучше рыночных инвестиций.',
                '<b>Сочетается с калькулятором автокредита:</b> Зная взнос, используйте его вместе с ценой авто и условиями кредита, чтобы увидеть итоговый платёж.',
            ],
            howto: [
                { question: 'Какой типичный процент первого взноса за авто?', answer: '<p>20% часто упоминается как цель для новых авто, хотя многие покупатели вносят меньше — компромисс в том, что меньший взнос означает больший кредит и переплату.</p>' },
                { question: 'Стоит ли включать стоимость trade-in в текущие накопления?', answer: '<p>Можно, если вы знаете примерную стоимость — но проверяйте текущие рыночные цены, а не полагайтесь на первое предложение автосалона.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Целевая цена авто', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Процент первого взноса', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Текущие накопления', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Лет до покупки', type: 'number', unit: 'лет', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Цель по первому взносу', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Необходимые ежемесячные накопления', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'auto-sakotnejas-iemaksas-uzkrajumu-kalkulators',
            title: 'Auto Sākotnējās Iemaksas Uzkrājumu Kalkulators',
            h1: 'Auto Sākotnējās Iemaksas Uzkrājumu Kalkulators',
            meta_title: 'Auto Iemaksas Kalkulators | Nepieciešamie Ikmēneša Uzkrājumi',
            meta_description: 'Aprēķiniet, cik krāt katru mēnesi auto sākotnējai iemaksai, balstoties uz auto cenu, iemaksas procentu un termiņu.',
            short_answer: 'Šis kalkulators aprēķina jūsu auto sākotnējās iemaksas mērķi, balstoties uz cenu un iemaksas procentu, tad aprēķina nepieciešamos ikmēneša uzkrājumus.',
            intro_text: '<p>Lielāka sākotnējā iemaksa auto kredītam nozīmē mazāku aizdevuma summu, mazāku ikmēneša maksājumu un mazāku pārmaksu — šis kalkulators palīdz plānot nepieciešamos uzkrājumus pirms auto iegādes.</p><p><b>Auto pircēji</b> to izmanto, lai noteiktu uzkrājumu grafiku, izvairoties no pārmērīga finansējuma.</p>',
            key_points: [
                '<b>Lielāka iemaksa, mazāks aizdevums:</b> Katrs uzkrātais dolārs iemaksai ir dolārs, kas netiek finansēts ar procentiem.',
                '<b>Īss termiņš, drošāks instruments:</b> Mērķim zem 1-2 gadiem krājkonts parasti ir piemērotāks nekā tirgus investīcijas.',
                '<b>Sader ar Auto Kredīta Kalkulatoru:</b> Zinot iemaksu, izmantojiet to kopā ar auto cenu un kredīta nosacījumiem, lai redzētu gala maksājumu.',
            ],
            howto: [
                { question: 'Kāds ir tipisks sākotnējās iemaksas procents auto?', answer: '<p>20% bieži tiek minēts kā mērķis jauniem auto, lai gan daudzi pircēji iemaksā mazāk — kompromiss ir tāds, ka mazāka iemaksa nozīmē lielāku aizdevumu un pārmaksu.</p>' },
                { question: 'Vai iekļaut maiņas auto vērtību pašreizējos uzkrājumos?', answer: '<p>Var, ja zināt aptuveno vērtību — bet pārbaudiet reālās tirgus cenas, nevis paļaujieties uz autosalona sākotnējo piedāvājumu.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Mērķa Auto Cena', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Sākotnējās Iemaksas Procents', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Pašreizējie Uzkrājumi', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Gadi Līdz Pirkumam', type: 'number', unit: 'gadi', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Sākotnējās Iemaksas Mērķis', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Nepieciešamie Ikmēneša Uzkrājumi', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-na-wklad-samochodowy',
            title: 'Kalkulator Oszczędności na Wkład Samochodowy',
            h1: 'Kalkulator Oszczędności na Wkład Samochodowy',
            meta_title: 'Kalkulator Wkładu na Samochód | Wymagane Miesięczne Oszczędności',
            meta_description: 'Oblicz, ile oszczędzać miesięcznie na wkład własny na samochód, na podstawie ceny pojazdu, procentu wkładu i harmonogramu.',
            short_answer: 'Ten kalkulator oblicza cel wkładu własnego na samochód na podstawie ceny pojazdu i procentu wkładu, a następnie wylicza wymagane miesięczne oszczędności.',
            intro_text: '<p>Większy wkład własny w kredycie samochodowym oznacza mniejszą kwotę kredytu, niższą ratę miesięczną i mniejszą sumę odsetek — ten kalkulator pomaga zaplanować oszczędności potrzebne przed zakupem samochodu.</p><p><b>Kupujący samochody</b> używają tego, aby ustalić harmonogram oszczędzania unikający nadmiernego finansowania.</p>',
            key_points: [
                '<b>Większy wkład, mniejszy kredyt:</b> Każdy dolar zaoszczędzony na wkład to dolar niefinansowany z odsetkami.',
                '<b>Krótki termin, bezpieczniejszy instrument:</b> Dla celu poniżej 1-2 lat konto oszczędnościowe jest zazwyczaj bardziej odpowiednie niż inwestycje rynkowe.',
                '<b>Współpracuje z Kalkulatorem Kredytu Samochodowego:</b> Znając wkład, użyj go razem z ceną pojazdu i warunkami kredytu, aby zobaczyć wynikową ratę.',
            ],
            howto: [
                { question: 'Jaki jest typowy procent wkładu na samochód?', answer: '<p>20% jest powszechnie wymienianym celem dla nowych samochodów, choć wielu kupujących wpłaca mniej — kompromis polega na tym, że mniejszy wkład oznacza większy kredyt i sumę odsetek.</p>' },
                { question: 'Czy powinienem uwzględnić wartość rozliczenia starego auta w obecnych oszczędnościach?', answer: '<p>Możesz, jeśli znasz przybliżoną wartość — ale sprawdź aktualne wartości rynkowe zamiast zakładać wstępną ofertę dealera.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Docelowa Cena Samochodu', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Procent Wkładu Własnego', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Obecne Oszczędności', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Lata do Zakupu', type: 'number', unit: 'lat', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Cel Wkładu Własnego', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Wymagane Miesięczne Oszczędności', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-ahorro-enganche-auto',
            title: 'Calculadora de Ahorro para el Enganche del Auto',
            h1: 'Calculadora de Ahorro para el Enganche del Auto',
            meta_title: 'Calculadora de Enganche de Auto | Ahorro Mensual Necesario',
            meta_description: 'Calcula cuánto ahorrar al mes para el enganche de tu auto, según el precio del vehículo, el porcentaje de enganche y tu plazo.',
            short_answer: 'Esta calculadora calcula tu meta de enganche de auto según el precio del vehículo y el porcentaje de enganche, luego determina el ahorro mensual necesario.',
            intro_text: '<p>Un enganche mayor en un préstamo de auto significa un monto de préstamo menor, una cuota mensual más baja y menos interés total — esta calculadora te ayuda a planificar el ahorro necesario antes de ir a comprar un auto.</p><p><b>Los compradores de autos</b> usan esto para establecer un cronograma de ahorro que evite financiar más de lo necesario.</p>',
            key_points: [
                '<b>Mayor enganche, préstamo menor:</b> Cada dólar ahorrado hacia el enganche es un dólar no financiado con intereses.',
                '<b>Plazo corto, vehículo más seguro:</b> Para una meta de menos de 1-2 años, una cuenta de ahorro es generalmente más apropiada que las inversiones de mercado.',
                '<b>Se combina con la Calculadora de Préstamo de Auto:</b> Una vez que conozcas tu enganche, úsalo junto con el precio del vehículo y los términos del préstamo para ver tu cuota mensual resultante.',
            ],
            howto: [
                { question: '¿Cuál es un porcentaje típico de enganche para un auto?', answer: '<p>El 20% es un objetivo comúnmente citado para autos nuevos, aunque muchos compradores dan menos — el compromiso es que un enganche menor significa un préstamo mayor y más interés total pagado.</p>' },
                { question: '¿Debo incluir el valor de mi auto de cambio en los ahorros actuales?', answer: '<p>Puedes, si conoces su valor aproximado — pero verifica los valores de mercado actuales en lugar de asumir la oferta inicial de un concesionario.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Precio Objetivo del Auto', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Porcentaje de Enganche', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Ahorros Actuales', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Años Hasta la Compra', type: 'number', unit: 'años', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Meta de Enganche', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Ahorro Mensual Requerido', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-epargne-apport-auto',
            title: 'Calculateur d’Épargne pour Apport Auto',
            h1: 'Calculateur d’Épargne pour Apport Auto',
            meta_title: 'Calculateur d’Apport Auto | Épargne Mensuelle Nécessaire',
            meta_description: 'Calculez combien épargner par mois pour l’apport de votre voiture, selon le prix du véhicule, le pourcentage d’apport et votre échéance.',
            short_answer: 'Ce calculateur détermine votre objectif d’apport auto selon le prix du véhicule et le pourcentage d’apport, puis calcule l’épargne mensuelle nécessaire.',
            intro_text: '<p>Un apport plus important sur un prêt auto signifie un montant de prêt plus faible, une mensualité plus basse et moins d’intérêts totaux — ce calculateur vous aide à planifier l’épargne nécessaire avant d’aller acheter une voiture.</p><p><b>Les acheteurs de voitures</b> utilisent cela pour établir un calendrier d’épargne évitant de financer plus que nécessaire.</p>',
            key_points: [
                '<b>Apport plus important, prêt plus faible :</b> Chaque dollar épargné pour l’apport est un dollar non financé à intérêt.',
                '<b>Échéance courte, véhicule plus sûr :</b> Pour un objectif de moins de 1-2 ans, un compte épargne est généralement plus approprié que les investissements boursiers.',
                '<b>Se combine avec le Calculateur de Prêt Auto :</b> Une fois votre apport connu, utilisez-le avec le prix du véhicule et les conditions du prêt pour voir votre mensualité résultante.',
            ],
            howto: [
                { question: 'Quel est un pourcentage d’apport typique pour une voiture ?', answer: '<p>20 % est un objectif couramment cité pour les voitures neuves, bien que de nombreux acheteurs versent moins — le compromis est qu’un apport plus faible signifie un prêt plus important et plus d’intérêts totaux payés.</p>' },
                { question: 'Dois-je inclure la valeur de ma reprise dans l’épargne actuelle ?', answer: '<p>Vous pouvez, si vous connaissez sa valeur approximative — mais vérifiez les valeurs de marché actuelles plutôt que de supposer l’offre initiale d’un concessionnaire.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Prix Cible de la Voiture', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Pourcentage d’Apport', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Épargne Actuelle', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Années Avant l’Achat', type: 'number', unit: 'ans', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Objectif d’Apport', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Épargne Mensuelle Requise', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-risparmio-anticipo-auto',
            title: 'Calcolatore Risparmio per Anticipo Auto',
            h1: 'Calcolatore Risparmio per Anticipo Auto',
            meta_title: 'Calcolatore Anticipo Auto | Risparmio Mensile Necessario',
            meta_description: 'Calcola quanto risparmiare al mese per l’anticipo della tua auto, in base al prezzo del veicolo, alla percentuale di anticipo e alla tua tempistica.',
            short_answer: 'Questo calcolatore calcola il tuo obiettivo di anticipo auto in base al prezzo del veicolo e alla percentuale di anticipo, poi determina il risparmio mensile necessario.',
            intro_text: '<p>Un anticipo maggiore su un prestito auto significa un importo di prestito minore, una rata mensile più bassa e meno interessi totali — questo calcolatore ti aiuta a pianificare il risparmio necessario prima di andare a comprare un’auto.</p><p><b>Gli acquirenti di auto</b> usano questo per stabilire una tempistica di risparmio che eviti di finanziare più del necessario.</p>',
            key_points: [
                '<b>Anticipo maggiore, prestito minore:</b> Ogni dollaro risparmiato per l’anticipo è un dollaro non finanziato a interesse.',
                '<b>Tempistica breve, strumento più sicuro:</b> Per un obiettivo inferiore a 1-2 anni, un conto di risparmio è generalmente più appropriato degli investimenti di mercato.',
                '<b>Si abbina al Calcolatore Prestito Auto:</b> Una volta noto il tuo anticipo, usalo insieme al prezzo del veicolo e ai termini del prestito per vedere la rata risultante.',
            ],
            howto: [
                { question: 'Qual è una percentuale tipica di anticipo per un’auto?', answer: '<p>Il 20% è un obiettivo comunemente citato per le auto nuove, sebbene molti acquirenti versino meno — il compromesso è che un anticipo minore significa un prestito maggiore e più interessi totali pagati.</p>' },
                { question: 'Dovrei includere il valore della mia permuta nei risparmi attuali?', answer: '<p>Puoi, se conosci il suo valore approssimativo — ma controlla i valori di mercato attuali invece di assumere l’offerta iniziale di un concessionario.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Prezzo Obiettivo dell’Auto', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Percentuale di Anticipo', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Risparmi Attuali', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Anni All’Acquisto', type: 'number', unit: 'anni', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Obiettivo di Anticipo', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Risparmio Mensile Richiesto', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'auto-anzahlung-sparrechner',
            title: 'Auto-Anzahlung-Sparrechner',
            h1: 'Auto-Anzahlung-Sparrechner',
            meta_title: 'Auto-Anzahlungs-Rechner | Erforderliche Monatliche Ersparnisse',
            meta_description: 'Berechnen Sie, wie viel Sie monatlich für Ihre Autoanzahlung sparen müssen, basierend auf Fahrzeugpreis, Anzahlungsprozentsatz und Ihrem Zeitrahmen.',
            short_answer: 'Dieser Rechner berechnet Ihr Autoanzahlungsziel basierend auf Fahrzeugpreis und Anzahlungsprozentsatz und ermittelt dann die erforderlichen monatlichen Ersparnisse.',
            intro_text: '<p>Eine größere Anzahlung bei einem Autokredit bedeutet einen kleineren Kreditbetrag, eine niedrigere monatliche Rate und weniger Gesamtzinsen — dieser Rechner hilft Ihnen, die nötigen Ersparnisse vor dem Autokauf zu planen.</p><p><b>Autokäufer</b> nutzen dies, um einen Sparzeitplan festzulegen, der eine übermäßige Finanzierung vermeidet.</p>',
            key_points: [
                '<b>Größere Anzahlung, kleinerer Kredit:</b> Jeder für die Anzahlung gesparte Dollar ist ein nicht verzinslich finanzierter Dollar.',
                '<b>Kurzer Zeitrahmen, sicherere Anlage:</b> Für ein Ziel unter 1-2 Jahren ist ein Sparkonto in der Regel geeigneter als Marktanlagen.',
                '<b>Passt zum Autokredit-Rechner:</b> Sobald Sie Ihre Anzahlung kennen, nutzen Sie sie zusammen mit Fahrzeugpreis und Kreditbedingungen, um Ihre resultierende monatliche Rate zu sehen.',
            ],
            howto: [
                { question: 'Was ist ein typischer Anzahlungsprozentsatz für ein Auto?', answer: '<p>20 % ist ein häufig genanntes Ziel für Neuwagen, obwohl viele Käufer weniger anzahlen — der Kompromiss ist, dass eine kleinere Anzahlung einen größeren Kredit und mehr Gesamtzinsen bedeutet.</p>' },
                { question: 'Sollte ich den Wert meiner Inzahlungnahme in die aktuellen Ersparnisse einbeziehen?', answer: '<p>Sie können es, wenn Sie den ungefähren Wert kennen — prüfen Sie aber aktuelle Marktwerte, statt das erste Angebot eines Händlers anzunehmen.</p>' },
            ],
            inputs: [
                { name: 'car_price', label: 'Ziel-Fahrzeugpreis', type: 'number', unit: '$', min: 500, max: 500000, placeholder: '30000' },
                { name: 'down_payment_pct', label: 'Anzahlungsprozentsatz', type: 'number', unit: '%', min: 1, max: 100, placeholder: '15' },
                { name: 'current_savings', label: 'Aktuelle Ersparnisse', type: 'number', unit: '$', min: 0, max: 500000, placeholder: '2000' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 20, placeholder: '3' },
                { name: 'years', label: 'Jahre Bis zum Kauf', type: 'number', unit: 'Jahre', min: 0.1, max: 10, placeholder: '1.5' },
            ],
            outputs: [
                { name: 'down_payment_goal', label: 'Anzahlungsziel', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Erforderliche Monatliche Ersparnisse', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1040: Emergency Fund Calculator
// ============================================================
const emergencyFund: ToolDef = {
    id: '1040',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'monthly_expenses', default: 3000 },
            { key: 'months_coverage', default: 6 },
            { key: 'current_savings', default: 2000 },
            { key: 'monthly_savings', default: 500 },
        ],
        formulas: {
            target_amount: 'monthly_expenses*months_coverage',
            months_to_reach: '(monthly_expenses*months_coverage - current_savings)/monthly_savings',
        },
        outputs: [
            { key: 'target_amount', precision: 2 },
            { key: 'months_to_reach', precision: 1 },
        ],
    },
    locales: {
        en: {
            slug: 'emergency-fund-calculator',
            title: 'Emergency Fund Calculator',
            h1: 'Emergency Fund Calculator',
            meta_title: 'Emergency Fund Calculator | Target Amount & Time to Reach It',
            meta_description: 'Calculate your ideal emergency fund size based on monthly expenses and desired months of coverage, plus how long it will take to reach that target.',
            short_answer: 'This calculator determines your ideal emergency fund size based on your monthly expenses and how many months of coverage you want, then shows how many months it will take to reach that target given your current savings rate.',
            intro_text: '<p>An emergency fund is a cash cushion for unplanned expenses or income loss — commonly sized as a multiple of monthly essential expenses rather than a fixed dollar amount, so it scales naturally to your actual cost of living.</p><p><b>Financial planners commonly recommend</b> 3-6 months of expenses as a starting target, with more conservative amounts (6-12 months) suggested for variable income, single-income households, or higher job-loss risk.</p>',
            key_points: [
                '<b>Sized by Expenses, Not Income:</b> The target is based on what you\'d need to spend to get by, not your salary — focus on essential expenses (housing, food, utilities, debt payments).',
                '<b>3-6 Months Is a Common Starting Point:</b> Adjust upward for single-income households, variable income, or higher perceived job security risk.',
                '<b>Keep It Liquid, Not Invested:</b> Emergency funds belong in easily accessible, low-risk accounts (high-yield savings), not the stock market, since you may need it on short notice.',
            ],
            howto: [
                { question: 'How many months of coverage should I target?', answer: '<p>3 months is a common minimum for stable dual-income households; 6+ months is often recommended for single-income households, freelancers, or less job security.</p>' },
                { question: 'Should my emergency fund be invested for growth?', answer: '<p>Generally no — emergency funds should prioritize accessibility and stability over growth, since you may need to withdraw it exactly when markets are down.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Monthly Essential Expenses', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Months of Coverage Desired', type: 'number', unit: 'months', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Current Emergency Savings', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Monthly Amount You Can Save', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Emergency Fund Target', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Months to Reach Target', unit: 'months', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-rezervnogo-fonda',
            title: 'Калькулятор резервного фонда (подушки безопасности)',
            h1: 'Калькулятор резервного фонда',
            meta_title: 'Калькулятор резервного фонда | Целевая сумма и время накопления',
            meta_description: 'Рассчитайте идеальный размер резервного фонда на основе ежемесячных расходов и желаемого числа месяцев покрытия, а также время до его накопления.',
            short_answer: 'Этот калькулятор определяет идеальный размер резервного фонда на основе ежемесячных расходов и желаемого числа месяцев покрытия, а также показывает, сколько времени потребуется на его накопление.',
            intro_text: '<p>Резервный фонд — это денежная подушка на случай непредвиденных расходов или потери дохода — обычно рассчитывается как кратное ежемесячным необходимым расходам, а не фиксированная сумма.</p><p><b>Финансовые консультанты обычно рекомендуют</b> 3-6 месяцев расходов как стартовую цель, с более консервативными суммами (6-12 месяцев) для нестабильного дохода или домохозяйств с одним доходом.</p>',
            key_points: [
                '<b>Рассчитывается по расходам, не по доходу:</b> Цель основана на том, что нужно потратить, чтобы продержаться, а не на зарплате.',
                '<b>3-6 месяцев — распространённая отправная точка:</b> Увеличивайте для домохозяйств с одним доходом, нестабильным доходом или высоким риском потери работы.',
                '<b>Держите ликвидным, не инвестируйте:</b> Резервный фонд должен быть на легкодоступном, низкорисковом счёте, а не на фондовом рынке.',
            ],
            howto: [
                { question: 'Сколько месяцев покрытия выбрать целью?', answer: '<p>3 месяца — распространённый минимум для стабильных домохозяйств с двумя доходами; 6+ месяцев часто рекомендуется для домохозяйств с одним доходом или фрилансеров.</p>' },
                { question: 'Стоит ли инвестировать резервный фонд для роста?', answer: '<p>Как правило нет — резервный фонд должен приоритизировать доступность и стабильность над ростом, так как может понадобиться именно когда рынки падают.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Ежемесячные необходимые расходы', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Желаемое число месяцев покрытия', type: 'number', unit: 'мес.', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Текущие резервные накопления', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Сумма, которую можете откладывать в месяц', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Цель резервного фонда', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Месяцев до достижения цели', unit: 'мес.', precision: 1 },
            ],
        },
        lv: {
            slug: 'ietaupijumu-rezerves-fonda-kalkulators',
            title: 'Ārkārtas Fonda Kalkulators',
            h1: 'Ārkārtas Fonda Kalkulators',
            meta_title: 'Ārkārtas Fonda Kalkulators | Mērķa Summa un Laiks Tās Sasniegšanai',
            meta_description: 'Aprēķiniet ideālo ārkārtas fonda apjomu, balstoties uz ikmēneša izdevumiem un vēlamo mēnešu skaitu, kā arī cik ilgs laiks nepieciešams mērķa sasniegšanai.',
            short_answer: 'Šis kalkulators nosaka ideālo ārkārtas fonda apjomu, balstoties uz ikmēneša izdevumiem un vēlamo pārklājuma mēnešu skaitu, tad parāda, cik mēnešu nepieciešams mērķa sasniegšanai.',
            intro_text: '<p>Ārkārtas fonds ir naudas rezerve neplānotiem izdevumiem vai ienākumu zaudēšanai — parasti aprēķināts kā ikmēneša pamata izdevumu reizinājums, nevis fiksēta summa.</p><p><b>Finanšu plānotāji parasti iesaka</b> 3-6 mēnešu izdevumus kā sākuma mērķi, ar konservatīvākām summām (6-12 mēneši) mainīgiem ienākumiem vai vienas algas mājsaimniecībām.</p>',
            key_points: [
                '<b>Balstīts uz izdevumiem, ne ienākumiem:</b> Mērķis balstīts uz to, cik nepieciešams iztrūkumam, nevis uz algu.',
                '<b>3-6 mēneši ir izplatīts sākumpunkts:</b> Palieliniet vienas algas mājsaimniecībām, mainīgiem ienākumiem vai lielākam darba zaudēšanas riskam.',
                '<b>Turiet likvīdu, neieguldiet:</b> Ārkārtas fondam jābūt viegli pieejamā, zema riska kontā, nevis akciju tirgū.',
            ],
            howto: [
                { question: 'Cik mēnešu pārklājumu izvēlēties?', answer: '<p>3 mēneši ir izplatīts minimums stabilām divu ienākumu mājsaimniecībām; 6+ mēneši bieži tiek ieteikti vienas algas mājsaimniecībām vai pašnodarbinātajiem.</p>' },
                { question: 'Vai ārkārtas fonds jāiegulda izaugsmei?', answer: '<p>Parasti nē — ārkārtas fondam jāprioretizē pieejamība un stabilitāte pār izaugsmi, jo var būt nepieciešams tieši tad, kad tirgi krīt.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Ikmēneša Pamata Izdevumi', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Vēlamais Pārklājuma Mēnešu Skaits', type: 'number', unit: 'mēn.', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Pašreizējie Ārkārtas Uzkrājumi', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Summa, Ko Varat Uzkrāt Mēnesī', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Ārkārtas Fonda Mērķis', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Mēneši Līdz Mērķim', unit: 'mēn.', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-funduszu-awaryjnego',
            title: 'Kalkulator Funduszu Awaryjnego',
            h1: 'Kalkulator Funduszu Awaryjnego',
            meta_title: 'Kalkulator Funduszu Awaryjnego | Kwota Docelowa i Czas Osiągnięcia',
            meta_description: 'Oblicz idealny rozmiar funduszu awaryjnego na podstawie miesięcznych wydatków i pożądanej liczby miesięcy pokrycia, oraz czas potrzebny na jego osiągnięcie.',
            short_answer: 'Ten kalkulator określa idealny rozmiar funduszu awaryjnego na podstawie miesięcznych wydatków i pożądanej liczby miesięcy pokrycia, a następnie pokazuje, ile miesięcy zajmie osiągnięcie tego celu.',
            intro_text: '<p>Fundusz awaryjny to poduszka finansowa na nieplanowane wydatki lub utratę dochodu — zwykle wyliczana jako wielokrotność miesięcznych niezbędnych wydatków, a nie stała kwota.</p><p><b>Doradcy finansowi zazwyczaj zalecają</b> 3-6 miesięcy wydatków jako cel wyjściowy, z bardziej konserwatywnymi kwotami (6-12 miesięcy) dla zmiennego dochodu lub gospodarstw z jednym źródłem dochodu.</p>',
            key_points: [
                '<b>Wielkość według wydatków, nie dochodu:</b> Cel opiera się na tym, ile potrzeba, aby przetrwać, a nie na pensji.',
                '<b>3-6 Miesięcy to powszechny punkt wyjścia:</b> Zwiększ dla gospodarstw z jednym dochodem, zmiennym dochodem lub wyższym ryzykiem utraty pracy.',
                '<b>Trzymaj płynne, nie inwestuj:</b> Fundusz awaryjny powinien znajdować się na łatwo dostępnym koncie niskiego ryzyka, a nie na giełdzie.',
            ],
            howto: [
                { question: 'Ile miesięcy pokrycia powinienem założyć?', answer: '<p>3 miesiące to powszechne minimum dla stabilnych gospodarstw z dwoma dochodami; 6+ miesięcy jest często zalecane dla gospodarstw z jednym dochodem lub freelancerów.</p>' },
                { question: 'Czy mój fundusz awaryjny powinien być inwestowany dla wzrostu?', answer: '<p>Zazwyczaj nie — fundusz awaryjny powinien priorytetyzować dostępność i stabilność nad wzrostem, ponieważ możesz potrzebować go dokładnie wtedy, gdy rynki spadają.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Miesięczne Niezbędne Wydatki', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Pożądana Liczba Miesięcy Pokrycia', type: 'number', unit: 'mies.', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Obecne Oszczędności Awaryjne', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Miesięczna Kwota, Którą Możesz Oszczędzić', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Cel Funduszu Awaryjnego', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Miesiące do Osiągnięcia Celu', unit: 'mies.', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-fondo-de-emergencia',
            title: 'Calculadora de Fondo de Emergencia',
            h1: 'Calculadora de Fondo de Emergencia',
            meta_title: 'Calculadora de Fondo de Emergencia | Monto Objetivo y Tiempo para Alcanzarlo',
            meta_description: 'Calcula el tamaño ideal de tu fondo de emergencia según tus gastos mensuales y meses de cobertura deseados, más el tiempo para alcanzarlo.',
            short_answer: 'Esta calculadora determina el tamaño ideal de tu fondo de emergencia según tus gastos mensuales y cuántos meses de cobertura deseas, luego muestra cuántos meses tomará alcanzar esa meta.',
            intro_text: '<p>Un fondo de emergencia es un colchón de efectivo para gastos imprevistos o pérdida de ingresos —comúnmente dimensionado como un múltiplo de los gastos esenciales mensuales en lugar de un monto fijo.</p><p><b>Los planificadores financieros comúnmente recomiendan</b> 3-6 meses de gastos como meta inicial, con montos más conservadores (6-12 meses) sugeridos para ingresos variables u hogares de un solo ingreso.</p>',
            key_points: [
                '<b>Dimensionado por gastos, no por ingresos:</b> La meta se basa en lo que necesitarías gastar para sobrevivir, no en tu salario.',
                '<b>3-6 meses es un punto de partida común:</b> Ajusta hacia arriba para hogares de un solo ingreso, ingresos variables o mayor riesgo de pérdida de empleo.',
                '<b>Mantenlo líquido, no invertido:</b> Los fondos de emergencia deben estar en cuentas de fácil acceso y bajo riesgo, no en el mercado de valores.',
            ],
            howto: [
                { question: '¿Cuántos meses de cobertura debo tener como meta?', answer: '<p>3 meses es un mínimo común para hogares estables con doble ingreso; 6+ meses se recomienda a menudo para hogares de un solo ingreso o freelancers.</p>' },
                { question: '¿Debo invertir mi fondo de emergencia para que crezca?', answer: '<p>Generalmente no — los fondos de emergencia deben priorizar la accesibilidad y estabilidad sobre el crecimiento, ya que podrías necesitarlo justo cuando los mercados están a la baja.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Gastos Esenciales Mensuales', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Meses de Cobertura Deseados', type: 'number', unit: 'meses', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Ahorros de Emergencia Actuales', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Monto Mensual que Puedes Ahorrar', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Meta del Fondo de Emergencia', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Meses para Alcanzar la Meta', unit: 'meses', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-fonds-urgence',
            title: 'Calculateur de Fonds d’Urgence',
            h1: 'Calculateur de Fonds d’Urgence',
            meta_title: 'Calculateur de Fonds d’Urgence | Montant Cible et Temps pour l’Atteindre',
            meta_description: 'Calculez la taille idéale de votre fonds d’urgence selon vos dépenses mensuelles et le nombre de mois de couverture souhaités, plus le temps pour l’atteindre.',
            short_answer: 'Ce calculateur détermine la taille idéale de votre fonds d’urgence selon vos dépenses mensuelles et le nombre de mois de couverture souhaités, puis montre combien de mois il faudra pour atteindre cet objectif.',
            intro_text: '<p>Un fonds d’urgence est un coussin de trésorerie pour les dépenses imprévues ou la perte de revenu — généralement dimensionné comme un multiple des dépenses essentielles mensuelles plutôt qu’un montant fixe.</p><p><b>Les planificateurs financiers recommandent couramment</b> 3-6 mois de dépenses comme objectif de départ, avec des montants plus prudents (6-12 mois) suggérés pour un revenu variable ou des foyers à revenu unique.</p>',
            key_points: [
                '<b>Dimensionné par les dépenses, pas le revenu :</b> L’objectif est basé sur ce dont vous auriez besoin pour subvenir à vos besoins, pas sur votre salaire.',
                '<b>3-6 mois est un point de départ courant :</b> Ajustez à la hausse pour les foyers à revenu unique, le revenu variable, ou un risque plus élevé de perte d’emploi.',
                '<b>Gardez-le liquide, pas investi :</b> Les fonds d’urgence doivent être sur des comptes facilement accessibles et à faible risque, pas en bourse.',
            ],
            howto: [
                { question: 'Combien de mois de couverture devrais-je viser ?', answer: '<p>3 mois est un minimum courant pour les foyers stables à double revenu ; 6+ mois est souvent recommandé pour les foyers à revenu unique ou les indépendants.</p>' },
                { question: 'Mon fonds d’urgence devrait-il être investi pour croître ?', answer: '<p>Généralement non — les fonds d’urgence doivent privilégier l’accessibilité et la stabilité plutôt que la croissance, car vous pourriez en avoir besoin exactement quand les marchés baissent.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Dépenses Essentielles Mensuelles', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Mois de Couverture Souhaités', type: 'number', unit: 'mois', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Épargne d’Urgence Actuelle', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Montant Mensuel que Vous Pouvez Épargner', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Objectif du Fonds d’Urgence', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Mois pour Atteindre l’Objectif', unit: 'mois', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-fondo-di-emergenza',
            title: 'Calcolatore Fondo di Emergenza',
            h1: 'Calcolatore Fondo di Emergenza',
            meta_title: 'Calcolatore Fondo di Emergenza | Importo Obiettivo e Tempo per Raggiungerlo',
            meta_description: 'Calcola la dimensione ideale del tuo fondo di emergenza in base alle spese mensili e ai mesi di copertura desiderati, più il tempo per raggiungerlo.',
            short_answer: 'Questo calcolatore determina la dimensione ideale del tuo fondo di emergenza in base alle tue spese mensili e a quanti mesi di copertura desideri, poi mostra quanti mesi ci vorranno per raggiungere quell’obiettivo.',
            intro_text: '<p>Un fondo di emergenza è un cuscinetto di liquidità per spese impreviste o perdita di reddito — solitamente dimensionato come multiplo delle spese essenziali mensili anziché un importo fisso.</p><p><b>I consulenti finanziari raccomandano comunemente</b> 3-6 mesi di spese come obiettivo iniziale, con importi più conservativi (6-12 mesi) suggeriti per reddito variabile o famiglie a reddito singolo.</p>',
            key_points: [
                '<b>Dimensionato in base alle spese, non al reddito:</b> L’obiettivo si basa su quanto ti servirebbe per sopravvivere, non sul tuo stipendio.',
                '<b>3-6 mesi è un punto di partenza comune:</b> Aumenta per famiglie a reddito singolo, reddito variabile o maggior rischio di perdita del lavoro.',
                '<b>Tienilo liquido, non investito:</b> I fondi di emergenza dovrebbero stare in conti facilmente accessibili e a basso rischio, non in borsa.',
            ],
            howto: [
                { question: 'Quanti mesi di copertura dovrei avere come obiettivo?', answer: '<p>3 mesi è un minimo comune per famiglie stabili a doppio reddito; 6+ mesi è spesso consigliato per famiglie a reddito singolo o freelance.</p>' },
                { question: 'Il mio fondo di emergenza dovrebbe essere investito per crescere?', answer: '<p>Generalmente no — i fondi di emergenza dovrebbero dare priorità all’accessibilità e alla stabilità rispetto alla crescita, poiché potresti averne bisogno proprio quando i mercati scendono.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Spese Essenziali Mensili', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Mesi di Copertura Desiderati', type: 'number', unit: 'mesi', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Risparmi di Emergenza Attuali', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Importo Mensile che Puoi Risparmiare', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Obiettivo Fondo di Emergenza', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Mesi per Raggiungere l’Obiettivo', unit: 'mesi', precision: 1 },
            ],
        },
        de: {
            slug: 'notfallfonds-rechner',
            title: 'Notfallfonds-Rechner',
            h1: 'Notfallfonds-Rechner',
            meta_title: 'Notfallfonds-Rechner | Zielbetrag und Zeit zum Erreichen',
            meta_description: 'Berechnen Sie die ideale Größe Ihres Notfallfonds basierend auf monatlichen Ausgaben und gewünschten Monaten der Abdeckung, plus die Zeit bis zum Erreichen.',
            short_answer: 'Dieser Rechner bestimmt die ideale Größe Ihres Notfallfonds basierend auf Ihren monatlichen Ausgaben und wie viele Monate Abdeckung Sie wünschen, und zeigt dann, wie viele Monate es dauert, dieses Ziel zu erreichen.',
            intro_text: '<p>Ein Notfallfonds ist ein Bargeldpuffer für ungeplante Ausgaben oder Einkommensverlust — üblicherweise als Vielfaches der monatlichen wesentlichen Ausgaben bemessen statt als fester Dollarbetrag.</p><p><b>Finanzplaner empfehlen häufig</b> 3-6 Monatsausgaben als Ausgangsziel, mit konservativeren Beträgen (6-12 Monate) für variables Einkommen oder Einzelverdiener-Haushalte.</p>',
            key_points: [
                '<b>Bemessen nach Ausgaben, nicht Einkommen:</b> Das Ziel basiert darauf, was Sie zum Überleben ausgeben müssten, nicht auf Ihrem Gehalt.',
                '<b>3-6 Monate sind ein üblicher Ausgangspunkt:</b> Erhöhen Sie für Einzelverdiener-Haushalte, variables Einkommen oder höheres wahrgenommenes Jobverlustrisiko.',
                '<b>Liquide halten, nicht investieren:</b> Notfallfonds gehören auf leicht zugängliche, risikoarme Konten, nicht in den Aktienmarkt.',
            ],
            howto: [
                { question: 'Wie viele Monate Abdeckung sollte ich anstreben?', answer: '<p>3 Monate sind ein übliches Minimum für stabile Doppelverdiener-Haushalte; 6+ Monate werden oft für Einzelverdiener-Haushalte oder Freiberufler empfohlen.</p>' },
                { question: 'Sollte mein Notfallfonds für Wachstum investiert werden?', answer: '<p>Im Allgemeinen nein — Notfallfonds sollten Zugänglichkeit und Stabilität über Wachstum priorisieren, da Sie ihn möglicherweise genau dann brauchen, wenn die Märkte fallen.</p>' },
            ],
            inputs: [
                { name: 'monthly_expenses', label: 'Monatliche Wesentliche Ausgaben', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '3000' },
                { name: 'months_coverage', label: 'Gewünschte Monate der Abdeckung', type: 'number', unit: 'Monate', min: 1, max: 24, placeholder: '6' },
                { name: 'current_savings', label: 'Aktuelle Notfallersparnisse', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '2000' },
                { name: 'monthly_savings', label: 'Monatlicher Betrag, den Sie Sparen Können', type: 'number', unit: '$', min: 1, max: 1000000, placeholder: '500' },
            ],
            outputs: [
                { name: 'target_amount', label: 'Notfallfonds-Ziel', unit: '$', precision: 2 },
                { name: 'months_to_reach', label: 'Monate Bis zum Ziel', unit: 'Monate', precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1041: CD (Certificate of Deposit) Calculator
// ============================================================
const cdCalculator: ToolDef = {
    id: '1041',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'principal', default: 5000 },
            { key: 'apy_pct', default: 4.5 },
            { key: 'term_months', default: 12 },
        ],
        formulas: {
            final_value: 'principal*(1+apy_pct/100)^(term_months/12)',
            interest_earned: 'principal*(1+apy_pct/100)^(term_months/12) - principal',
        },
        outputs: [
            { key: 'final_value', precision: 2 },
            { key: 'interest_earned', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'cd-certificate-of-deposit-calculator',
            title: 'CD (Certificate of Deposit) Calculator',
            h1: 'CD Calculator',
            meta_title: 'CD Calculator | Certificate of Deposit Interest Earned',
            meta_description: 'Calculate how much a Certificate of Deposit (CD) will earn, based on your deposit amount, APY, and term length.',
            short_answer: 'This calculator computes how much your Certificate of Deposit (CD) will be worth at maturity and how much interest it will earn, based on your deposit amount, the APY, and the term length.',
            intro_text: '<p>A CD is a fixed-term deposit that pays a guaranteed interest rate in exchange for locking your money away for a set period, typically offering a higher rate than a standard savings account. Since the APY already reflects the effective annual yield, calculating the maturity value is straightforward.</p><p><b>Savers looking for a safe, predictable return</b> use CDs for money they won\'t need during the term, since early withdrawal typically triggers a penalty that can eat into or even exceed the interest earned.</p>',
            key_points: [
                '<b>Fixed Rate, Fixed Term:</b> Unlike a savings account, the rate and term are locked in when you open the CD.',
                '<b>Early Withdrawal Penalties:</b> Taking money out before maturity typically costs several months of interest — CDs are best for money you\'re sure you won\'t need.',
                '<b>APY Already Accounts for Compounding:</b> Since APY is the effective annual rate, this calculator simply scales it to your actual term length.',
            ],
            howto: [
                { question: 'What happens if I withdraw money early from a CD?', answer: '<p>Most CDs charge an early withdrawal penalty, often equal to a few months of interest — check your specific CD\'s terms, since penalties vary by term length and institution.</p>' },
                { question: 'Is a CD better than a regular savings account?', answer: '<p>CDs often offer higher rates in exchange for locking up your money, making them a good fit for funds you won\'t need during the term — a savings account offers more flexibility but often a lower rate.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Deposit Amount', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Term Length', type: 'number', unit: 'months', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Value at Maturity', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interest Earned', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-depozitnogo-sertifikata',
            title: 'Калькулятор депозитного сертификата (CD)',
            h1: 'Калькулятор депозитного сертификата',
            meta_title: 'Калькулятор CD | Доход по депозитному сертификату',
            meta_description: 'Рассчитайте, сколько принесёт депозитный сертификат (CD), исходя из суммы вклада, APY и срока.',
            short_answer: 'Этот калькулятор вычисляет, сколько будет стоить ваш депозитный сертификат (CD) к погашению и сколько процентов он принесёт, исходя из суммы вклада, APY и срока.',
            intro_text: '<p>CD — это срочный вклад, выплачивающий гарантированную ставку в обмен на блокировку денег на определённый период, обычно предлагая более высокую ставку, чем обычный сберегательный счёт.</p><p><b>Вкладчики, ищущие безопасную предсказуемую доходность</b>, используют CD для денег, которые не понадобятся в течение срока, так как досрочное снятие обычно влечёт штраф.</p>',
            key_points: [
                '<b>Фиксированная ставка, фиксированный срок:</b> В отличие от сберегательного счёта, ставка и срок фиксируются при открытии CD.',
                '<b>Штрафы за досрочное снятие:</b> Снятие денег до погашения обычно стоит несколько месяцев процентов.',
                '<b>APY уже учитывает капитализацию:</b> Поскольку APY — это эффективная годовая ставка, калькулятор просто масштабирует её на реальный срок.',
            ],
            howto: [
                { question: 'Что будет, если снять деньги с CD досрочно?', answer: '<p>Большинство CD взимают штраф за досрочное снятие, часто равный нескольким месяцам процентов — проверьте условия конкретного CD.</p>' },
                { question: 'CD лучше обычного сберегательного счёта?', answer: '<p>CD часто предлагают более высокие ставки в обмен на блокировку денег, что делает их хорошим выбором для средств, не нужных в течение срока.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Сумма вклада', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Срок вклада', type: 'number', unit: 'мес.', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Стоимость к погашению', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Полученный доход', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'noguldijuma-sertifikata-kalkulators',
            title: 'Noguldījuma Sertifikāta (CD) Kalkulators',
            h1: 'CD Kalkulators',
            meta_title: 'CD Kalkulators | Noguldījuma Sertifikāta Nopelnītie Procenti',
            meta_description: 'Aprēķiniet, cik daudz nopelnīs noguldījuma sertifikāts (CD), balstoties uz iemaksas summu, APY un termiņu.',
            short_answer: 'Šis kalkulators aprēķina, cik jūsu noguldījuma sertifikāts (CD) būs vērts termiņa beigās un cik daudz procentu tas nopelnīs, balstoties uz iemaksas summu, APY un termiņa garumu.',
            intro_text: '<p>CD ir fiksēta termiņa noguldījums, kas maksā garantētu procentu likmi apmaiņā pret naudas bloķēšanu noteiktam periodam, parasti piedāvājot augstāku likmi nekā standarta krājkonts.</p><p><b>Krājēji, kas meklē drošu, paredzamu ienesīgumu</b>, izmanto CD naudai, kas nebūs nepieciešama termiņa laikā, jo priekšlaicīga izņemšana parasti izraisa sodu.</p>',
            key_points: [
                '<b>Fiksēta likme, fiksēts termiņš:</b> Atšķirībā no krājkonta, likme un termiņš tiek fiksēti, atverot CD.',
                '<b>Sodi par priekšlaicīgu izņemšanu:</b> Naudas izņemšana pirms termiņa beigām parasti maksā vairākus mēnešus procentu.',
                '<b>APY jau ņem vērā kapitalizāciju:</b> Tā kā APY ir efektīvā gada likme, kalkulators to vienkārši mērogo uz jūsu reālo termiņu.',
            ],
            howto: [
                { question: 'Kas notiek, ja izņemu naudu no CD priekšlaicīgi?', answer: '<p>Lielākā daļa CD iekasē sodu par priekšlaicīgu izņemšanu, bieži vienādu ar vairāku mēnešu procentiem — pārbaudiet konkrētā CD noteikumus.</p>' },
                { question: 'Vai CD ir labāks par parastu krājkontu?', answer: '<p>CD bieži piedāvā augstākas likmes apmaiņā pret naudas bloķēšanu, padarot tos par labu izvēli līdzekļiem, kas nebūs nepieciešami termiņa laikā.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Iemaksas Summa', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Termiņa Garums', type: 'number', unit: 'mēn.', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Vērtība Termiņa Beigās', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Nopelnītie Procenti', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-lokaty-terminowej-cd',
            title: 'Kalkulator Lokaty Terminowej (CD)',
            h1: 'Kalkulator Lokaty Terminowej',
            meta_title: 'Kalkulator CD | Odsetki z Lokaty Terminowej',
            meta_description: 'Oblicz, ile zarobi lokata terminowa (CD), na podstawie kwoty wpłaty, APY i długości okresu.',
            short_answer: 'Ten kalkulator oblicza, ile będzie warta twoja lokata terminowa (CD) w momencie zapadalności i ile odsetek zarobi, na podstawie kwoty wpłaty, APY i długości okresu.',
            intro_text: '<p>CD to depozyt terminowy, który wypłaca gwarantowaną stopę procentową w zamian za zablokowanie pieniędzy na określony czas, zwykle oferując wyższą stopę niż standardowe konto oszczędnościowe.</p><p><b>Oszczędzający szukający bezpiecznego, przewidywalnego zwrotu</b> używają lokat dla pieniędzy, których nie potrzebują w trakcie okresu, ponieważ wcześniejsza wypłata zazwyczaj wiąże się z karą.</p>',
            key_points: [
                '<b>Stała stopa, stały okres:</b> W przeciwieństwie do konta oszczędnościowego, stopa i okres są ustalane przy otwarciu lokaty.',
                '<b>Kary za wcześniejszą wypłatę:</b> Wypłacenie pieniędzy przed terminem zwykle kosztuje kilka miesięcy odsetek.',
                '<b>APY już uwzględnia kapitalizację:</b> Ponieważ APY to efektywna stopa roczna, kalkulator po prostu skaluje ją do rzeczywistej długości okresu.',
            ],
            howto: [
                { question: 'Co się stanie, jeśli wypłacę pieniądze z lokaty wcześniej?', answer: '<p>Większość lokat pobiera karę za wcześniejszą wypłatę, często równą kilku miesiącom odsetek — sprawdź warunki konkretnej lokaty.</p>' },
                { question: 'Czy lokata jest lepsza niż zwykłe konto oszczędnościowe?', answer: '<p>Lokaty często oferują wyższe stopy w zamian za zablokowanie pieniędzy, co czyni je dobrym wyborem dla środków niepotrzebnych w trakcie okresu.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Kwota Wpłaty', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Długość Okresu', type: 'number', unit: 'mies.', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Wartość w Momencie Zapadalności', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Zarobione Odsetki', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-certificado-de-deposito',
            title: 'Calculadora de Certificado de Depósito (CD)',
            h1: 'Calculadora de CD',
            meta_title: 'Calculadora de CD | Interés Ganado en un Certificado de Depósito',
            meta_description: 'Calcula cuánto ganará un Certificado de Depósito (CD), según el monto depositado, la TAE y la duración del plazo.',
            short_answer: 'Esta calculadora calcula cuánto valdrá tu Certificado de Depósito (CD) al vencimiento y cuánto interés ganará, según el monto depositado, la TAE y la duración del plazo.',
            intro_text: '<p>Un CD es un depósito a plazo fijo que paga una tasa de interés garantizada a cambio de inmovilizar tu dinero durante un período determinado, típicamente ofreciendo una tasa más alta que una cuenta de ahorro estándar.</p><p><b>Los ahorradores que buscan un rendimiento seguro y predecible</b> usan CDs para dinero que no necesitarán durante el plazo, ya que el retiro anticipado suele generar una penalización.</p>',
            key_points: [
                '<b>Tasa fija, plazo fijo:</b> A diferencia de una cuenta de ahorro, la tasa y el plazo se fijan al abrir el CD.',
                '<b>Penalizaciones por retiro anticipado:</b> Retirar dinero antes del vencimiento suele costar varios meses de interés.',
                '<b>La TAE ya considera la capitalización:</b> Como la TAE es la tasa anual efectiva, esta calculadora simplemente la escala a tu plazo real.',
            ],
            howto: [
                { question: '¿Qué pasa si retiro dinero de un CD anticipadamente?', answer: '<p>La mayoría de los CDs cobran una penalización por retiro anticipado, a menudo igual a varios meses de interés — revisa los términos de tu CD específico.</p>' },
                { question: '¿Es un CD mejor que una cuenta de ahorro regular?', answer: '<p>Los CDs suelen ofrecer tasas más altas a cambio de inmovilizar tu dinero, siendo una buena opción para fondos que no necesitarás durante el plazo.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Monto del Depósito', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'TAE', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Duración del Plazo', type: 'number', unit: 'meses', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valor al Vencimiento', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interés Ganado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-certificat-de-depot',
            title: 'Calculateur de Certificat de Dépôt (CD)',
            h1: 'Calculateur de CD',
            meta_title: 'Calculateur de CD | Intérêts Gagnés sur un Certificat de Dépôt',
            meta_description: 'Calculez combien rapportera un Certificat de Dépôt (CD), selon le montant déposé, l’APY et la durée.',
            short_answer: 'Ce calculateur calcule combien vaudra votre Certificat de Dépôt (CD) à échéance et combien d’intérêts il rapportera, selon le montant déposé, l’APY et la durée.',
            intro_text: '<p>Un CD est un dépôt à terme fixe qui verse un taux d’intérêt garanti en échange du blocage de votre argent pendant une période déterminée, offrant généralement un taux plus élevé qu’un compte épargne standard.</p><p><b>Les épargnants recherchant un rendement sûr et prévisible</b> utilisent les CD pour de l’argent dont ils n’auront pas besoin pendant la durée, car un retrait anticipé entraîne généralement une pénalité.</p>',
            key_points: [
                '<b>Taux fixe, durée fixe :</b> Contrairement à un compte épargne, le taux et la durée sont fixés à l’ouverture du CD.',
                '<b>Pénalités de retrait anticipé :</b> Retirer de l’argent avant l’échéance coûte généralement plusieurs mois d’intérêts.',
                '<b>L’APY tient déjà compte de la capitalisation :</b> Comme l’APY est le taux annuel effectif, ce calculateur l’adapte simplement à votre durée réelle.',
            ],
            howto: [
                { question: 'Que se passe-t-il si je retire de l’argent d’un CD tôt ?', answer: '<p>La plupart des CD facturent une pénalité de retrait anticipé, souvent égale à plusieurs mois d’intérêts — vérifiez les conditions de votre CD spécifique.</p>' },
                { question: 'Un CD est-il meilleur qu’un compte épargne classique ?', answer: '<p>Les CD offrent souvent des taux plus élevés en échange du blocage de votre argent, ce qui en fait un bon choix pour des fonds dont vous n’aurez pas besoin pendant la durée.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Montant du Dépôt', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Durée', type: 'number', unit: 'mois', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valeur à l’Échéance', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Intérêts Gagnés', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-certificato-di-deposito',
            title: 'Calcolatore Certificato di Deposito (CD)',
            h1: 'Calcolatore CD',
            meta_title: 'Calcolatore CD | Interessi Maturati su un Certificato di Deposito',
            meta_description: 'Calcola quanto renderà un Certificato di Deposito (CD), in base all’importo depositato, all’APY e alla durata del termine.',
            short_answer: 'Questo calcolatore calcola quanto varrà il tuo Certificato di Deposito (CD) a scadenza e quanti interessi maturerà, in base all’importo depositato, all’APY e alla durata del termine.',
            intro_text: '<p>Un CD è un deposito a termine fisso che paga un tasso di interesse garantito in cambio del blocco del tuo denaro per un periodo stabilito, tipicamente offrendo un tasso più alto di un conto di risparmio standard.</p><p><b>I risparmiatori che cercano un rendimento sicuro e prevedibile</b> usano i CD per denaro di cui non avranno bisogno durante il termine, poiché il prelievo anticipato comporta solitamente una penale.</p>',
            key_points: [
                '<b>Tasso fisso, termine fisso:</b> A differenza di un conto di risparmio, il tasso e il termine sono bloccati all’apertura del CD.',
                '<b>Penali per prelievo anticipato:</b> Prelevare denaro prima della scadenza costa solitamente diversi mesi di interessi.',
                '<b>L’APY tiene già conto della capitalizzazione:</b> Poiché l’APY è il tasso annuo effettivo, questo calcolatore lo scala semplicemente alla tua durata reale.',
            ],
            howto: [
                { question: 'Cosa succede se prelevo denaro da un CD in anticipo?', answer: '<p>La maggior parte dei CD addebita una penale per prelievo anticipato, spesso pari a diversi mesi di interessi — controlla i termini del tuo CD specifico.</p>' },
                { question: 'Un CD è meglio di un normale conto di risparmio?', answer: '<p>I CD offrono spesso tassi più alti in cambio del blocco del tuo denaro, rendendoli una buona scelta per fondi di cui non avrai bisogno durante il termine.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Importo del Deposito', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Durata del Termine', type: 'number', unit: 'mesi', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valore a Scadenza', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Interessi Maturati', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'festgeld-rechner',
            title: 'Festgeld-Rechner (CD)',
            h1: 'Festgeld-Rechner',
            meta_title: 'Festgeld-Rechner | Verdiente Zinsen aus Festgeld',
            meta_description: 'Berechnen Sie, wie viel ein Festgeldkonto (CD) einbringt, basierend auf Einzahlungsbetrag, APY und Laufzeit.',
            short_answer: 'Dieser Rechner berechnet, wie viel Ihr Festgeldkonto (CD) bei Fälligkeit wert sein wird und wie viele Zinsen es einbringt, basierend auf Einzahlungsbetrag, APY und Laufzeit.',
            intro_text: '<p>Ein CD (Festgeldkonto) ist eine Einlage mit fester Laufzeit, die einen garantierten Zinssatz zahlt, im Austausch dafür, dass Ihr Geld für einen bestimmten Zeitraum gebunden wird, üblicherweise mit einem höheren Zinssatz als ein Standard-Sparkonto.</p><p><b>Sparer, die eine sichere, vorhersehbare Rendite suchen</b>, nutzen Festgeld für Geld, das sie während der Laufzeit nicht benötigen, da eine vorzeitige Abhebung normalerweise eine Strafe auslöst.</p>',
            key_points: [
                '<b>Fester Zinssatz, feste Laufzeit:</b> Anders als bei einem Sparkonto werden Zinssatz und Laufzeit bei Eröffnung des Festgelds festgelegt.',
                '<b>Strafen für vorzeitige Abhebung:</b> Geld vor Fälligkeit abzuheben kostet in der Regel mehrere Monate Zinsen.',
                '<b>APY berücksichtigt bereits Zinseszins:</b> Da APY der effektive Jahreszins ist, skaliert dieser Rechner ihn einfach auf Ihre tatsächliche Laufzeit.',
            ],
            howto: [
                { question: 'Was passiert, wenn ich Geld vorzeitig von einem Festgeldkonto abhebe?', answer: '<p>Die meisten Festgeldkonten berechnen eine Vorabhebungsstrafe, oft gleich mehreren Monaten Zinsen — prüfen Sie die Bedingungen Ihres spezifischen Festgeldkontos.</p>' },
                { question: 'Ist ein Festgeldkonto besser als ein normales Sparkonto?', answer: '<p>Festgeldkonten bieten oft höhere Zinssätze im Austausch für die Bindung Ihres Geldes, was sie zu einer guten Wahl für Geld macht, das Sie während der Laufzeit nicht benötigen.</p>' },
            ],
            inputs: [
                { name: 'principal', label: 'Einzahlungsbetrag', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '5000' },
                { name: 'apy_pct', label: 'APY', type: 'number', unit: '%', min: 0, max: 30, placeholder: '4.5' },
                { name: 'term_months', label: 'Laufzeit', type: 'number', unit: 'Monate', min: 1, max: 240, placeholder: '12' },
            ],
            outputs: [
                { name: 'final_value', label: 'Wert bei Fälligkeit', unit: '$', precision: 2 },
                { name: 'interest_earned', label: 'Verdiente Zinsen', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1042: Annual Contribution Investment Growth Calculator
// ============================================================
const annualContribution: ToolDef = {
    id: '1042',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'initial_investment', default: 5000 },
            { key: 'annual_contribution', default: 6000 },
            { key: 'rate_pct', default: 7 },
            { key: 'years', default: 20 },
        ],
        formulas: {
            final_value: 'initial_investment*(1+rate_pct/100)^years + annual_contribution*(((1+rate_pct/100)^years-1)/(rate_pct/100))',
            total_contributed: 'initial_investment + annual_contribution*years',
        },
        outputs: [
            { key: 'final_value', precision: 2 },
            { key: 'total_contributed', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'annual-contribution-investment-growth-calculator',
            title: 'Annual Contribution Investment Growth Calculator',
            h1: 'Annual Contribution Growth Calculator',
            meta_title: 'Annual Investment Growth Calculator | Yearly Contribution Plan',
            meta_description: 'Calculate investment growth with annual (rather than monthly) contributions, based on an initial investment, yearly contribution amount, rate of return, and time.',
            short_answer: 'This calculator projects investment growth when contributions are made once a year rather than monthly — common for annual bonus investing, lump-sum IRA contributions, or once-a-year investment habits.',
            intro_text: '<p>Not everyone contributes monthly — some investors add a lump sum once a year, from a bonus, tax refund, or annual review of finances. This calculator uses the same future-value-of-annuity math as monthly calculators, but with an annual compounding and contribution cadence.</p><p><b>Investors who fund accounts annually</b> — maxing out an IRA in one deposit, investing a yearly bonus — use this to project long-term growth using their actual contribution pattern rather than approximating with monthly figures.</p>',
            key_points: [
                '<b>Annual Cadence:</b> Both compounding and contributions happen once per year, matching how some investors actually fund their accounts.',
                '<b>Same Formula Family, Different Period:</b> Uses the identical future-value-of-annuity structure as monthly savings calculators, just with annual instead of monthly periods.',
                '<b>Good Fit for IRA/Lump-Sum Investors:</b> Especially useful for anyone who contributes a single lump sum per year rather than spreading it across months.',
            ],
            howto: [
                { question: 'Does it matter if I contribute monthly instead of annually?', answer: '<p>Contributing the same total amount more frequently (monthly vs. annually) generally produces slightly higher growth, since money is invested earlier on average — but the difference is usually modest compared to the impact of the total amount and rate of return.</p>' },
                { question: 'What return should I assume for a diversified investment account?', answer: '<p>A common long-term conservative assumption for a diversified stock/bond portfolio is 5-8% annually, though actual returns vary significantly year to year.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Initial Investment', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Annual Contribution', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Time Period', type: 'number', unit: 'years', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Final Value', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total Contributed', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-rosta-investiciy-s-godovymi-vznosami',
            title: 'Калькулятор роста инвестиций с годовыми взносами',
            h1: 'Калькулятор роста с годовыми взносами',
            meta_title: 'Калькулятор годового роста инвестиций | План с ежегодным взносом',
            meta_description: 'Рассчитайте рост инвестиций с ежегодными (а не ежемесячными) взносами, на основе начальной суммы, годового взноса, доходности и времени.',
            short_answer: 'Этот калькулятор прогнозирует рост инвестиций, когда взносы делаются раз в год, а не ежемесячно — распространено для инвестирования годового бонуса, единовременных взносов в ИИС или привычки инвестировать раз в год.',
            intro_text: '<p>Не все вносят деньги ежемесячно — некоторые инвесторы добавляют единовременную сумму раз в год, из бонуса, налогового возврата или ежегодного пересмотра финансов. Калькулятор использует ту же математику будущей стоимости аннуитета, что и ежемесячные калькуляторы, но с годовой периодичностью.</p><p><b>Инвесторы, пополняющие счета раз в год</b>, используют это для прогноза долгосрочного роста по реальному паттерну взносов.</p>',
            key_points: [
                '<b>Годовая периодичность:</b> И капитализация, и взносы происходят раз в год.',
                '<b>Та же формула, другой период:</b> Использует идентичную структуру будущей стоимости аннуитета, что и ежемесячные калькуляторы, но с годовыми периодами.',
                '<b>Хорошо подходит для ИИС/единовременных инвесторов:</b> Особенно полезно для тех, кто вносит единую сумму раз в год.',
            ],
            howto: [
                { question: 'Важно ли вносить ежемесячно, а не ежегодно?', answer: '<p>Внесение той же общей суммы чаще (ежемесячно против ежегодно) обычно даёт немного больший рост, так как деньги инвестируются раньше в среднем — но разница обычно скромная по сравнению с влиянием общей суммы и доходности.</p>' },
                { question: 'Какую доходность предполагать для диверсифицированного инвестиционного счёта?', answer: '<p>Распространённое консервативное долгосрочное предположение для диверсифицированного портфеля акций/облигаций — 5-8% годовых.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Начальная инвестиция', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Годовой взнос', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Период', type: 'number', unit: 'лет', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Итоговая стоимость', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Всего внесено', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'gada-iemaksu-investiciju-izaugsmes-kalkulators',
            title: 'Gada Iemaksu Investīciju Izaugsmes Kalkulators',
            h1: 'Gada Iemaksu Izaugsmes Kalkulators',
            meta_title: 'Gada Investīciju Izaugsmes Kalkulators | Ikgadēju Iemaksu Plāns',
            meta_description: 'Aprēķiniet investīciju izaugsmi ar gada (nevis ikmēneša) iemaksām, balstoties uz sākuma investīciju, gada iemaksas summu, ienesīgumu un laiku.',
            short_answer: 'Šis kalkulators prognozē investīciju izaugsmi, kad iemaksas tiek veiktas reizi gadā, nevis ikmēneša — izplatīts gada prēmijas investēšanai vai vienreizējām IRA iemaksām.',
            intro_text: '<p>Ne visi iemaksā ikmēneša — daži investori pievieno vienreizēju summu reizi gadā, no prēmijas, nodokļu atmaksas vai ikgadējas finanšu pārskatīšanas. Kalkulators izmanto to pašu annuitātes nākotnes vērtības matemātiku, bet ar gada kapitalizāciju.</p><p><b>Investori, kas finansē kontus ik gadu</b>, izmanto to, lai prognozētu ilgtermiņa izaugsmi pēc reālā iemaksu modeļa.</p>',
            key_points: [
                '<b>Gada periodiskums:</b> Gan kapitalizācija, gan iemaksas notiek reizi gadā.',
                '<b>Tā pati formula, cits periods:</b> Izmanto identisku annuitātes nākotnes vērtības struktūru kā ikmēneša kalkulatori, bet ar gada periodiem.',
                '<b>Labi piemērots IRA/vienreizējiem investoriem:</b> Īpaši noderīgi tiem, kas iemaksā vienu summu reizi gadā.',
            ],
            howto: [
                { question: 'Vai ir svarīgi iemaksāt ikmēneša, nevis ik gadu?', answer: '<p>Tās pašas kopējās summas iemaksāšana biežāk (ikmēneša pret ik gadu) parasti dod nedaudz lielāku izaugsmi, jo nauda vidēji tiek ieguldīta agrāk.</p>' },
                { question: 'Kādu ienesīgumu pieņemt diversificētam investīciju kontam?', answer: '<p>Izplatīts konservatīvs ilgtermiņa pieņēmums diversificētam akciju/obligāciju portfelim ir 5-8% gadā.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Sākuma Investīcija', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Gada Iemaksa', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Laika Periods', type: 'number', unit: 'gadi', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Gala Vērtība', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Kopā Iemaksāts', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-wzrostu-inwestycji-roczne-wplaty',
            title: 'Kalkulator Wzrostu Inwestycji z Rocznymi Wpłatami',
            h1: 'Kalkulator Wzrostu z Rocznymi Wpłatami',
            meta_title: 'Kalkulator Rocznego Wzrostu Inwestycji | Plan Rocznych Wpłat',
            meta_description: 'Oblicz wzrost inwestycji z rocznymi (a nie miesięcznymi) wpłatami, na podstawie inwestycji początkowej, rocznej kwoty wpłaty, stopy zwrotu i czasu.',
            short_answer: 'Ten kalkulator prognozuje wzrost inwestycji, gdy wpłaty są dokonywane raz w roku, a nie co miesiąc — powszechne przy inwestowaniu rocznej premii lub jednorazowych wpłatach na IKE.',
            intro_text: '<p>Nie wszyscy wpłacają co miesiąc — niektórzy inwestorzy dodają jednorazową sumę raz w roku, z premii, zwrotu podatku lub corocznego przeglądu finansów. Kalkulator wykorzystuje tę samą matematykę przyszłej wartości renty, ale z roczną kapitalizacją.</p><p><b>Inwestorzy finansujący konta rocznie</b> używają tego, aby prognozować długoterminowy wzrost według rzeczywistego wzorca wpłat.</p>',
            key_points: [
                '<b>Roczna częstotliwość:</b> Zarówno kapitalizacja, jak i wpłaty następują raz w roku.',
                '<b>Ta sama formuła, inny okres:</b> Wykorzystuje identyczną strukturę przyszłej wartości renty co miesięczne kalkulatory, ale z rocznymi okresami.',
                '<b>Dobrze pasuje do inwestorów IKE/jednorazowych:</b> Szczególnie przydatne dla osób wpłacających jedną sumę raz w roku.',
            ],
            howto: [
                { question: 'Czy ma znaczenie, czy wpłacam miesięcznie zamiast rocznie?', answer: '<p>Wpłacanie tej samej łącznej kwoty częściej (miesięcznie vs rocznie) zwykle daje nieco wyższy wzrost, ponieważ pieniądze są średnio inwestowane wcześniej.</p>' },
                { question: 'Jaką stopę zwrotu założyć dla zdywersyfikowanego konta inwestycyjnego?', answer: '<p>Powszechne konserwatywne długoterminowe założenie dla zdywersyfikowanego portfela akcji/obligacji to 5-8% rocznie.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Inwestycja Początkowa', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Roczna Wpłata', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Okres Czasu', type: 'number', unit: 'lat', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Wartość Końcowa', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Łącznie Wpłacono', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-crecimiento-inversion-aportacion-anual',
            title: 'Calculadora de Crecimiento de Inversión con Aportación Anual',
            h1: 'Calculadora de Crecimiento con Aportación Anual',
            meta_title: 'Calculadora de Crecimiento Anual de Inversión | Plan de Aportación Anual',
            meta_description: 'Calcula el crecimiento de una inversión con aportaciones anuales (en lugar de mensuales), según una inversión inicial, monto de aportación anual, rendimiento y tiempo.',
            short_answer: 'Esta calculadora proyecta el crecimiento de una inversión cuando las aportaciones se hacen una vez al año en lugar de mensualmente — común para invertir un bono anual o aportaciones únicas a una cuenta de retiro.',
            intro_text: '<p>No todos aportan mensualmente — algunos inversores añaden una suma única una vez al año, de un bono, devolución de impuestos, o revisión anual de finanzas. Esta calculadora usa la misma matemática del valor futuro de una anualidad, pero con capitalización anual.</p><p><b>Los inversores que financian cuentas anualmente</b> usan esto para proyectar el crecimiento a largo plazo según su patrón real de aportación.</p>',
            key_points: [
                '<b>Cadencia anual:</b> Tanto la capitalización como las aportaciones ocurren una vez al año.',
                '<b>Misma fórmula, período diferente:</b> Usa la estructura idéntica del valor futuro de una anualidad que las calculadoras mensuales, pero con períodos anuales.',
                '<b>Buena opción para inversores de cuenta de retiro/suma única:</b> Especialmente útil para quienes aportan una sola suma al año.',
            ],
            howto: [
                { question: '¿Importa si aporto mensualmente en lugar de anualmente?', answer: '<p>Aportar la misma cantidad total con más frecuencia (mensual vs. anual) generalmente produce un crecimiento ligeramente mayor, ya que el dinero se invierte antes en promedio.</p>' },
                { question: '¿Qué rendimiento debo asumir para una cuenta de inversión diversificada?', answer: '<p>Una suposición conservadora común a largo plazo para una cartera diversificada de acciones/bonos es 5-8% anual.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Inversión Inicial', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Aportación Anual', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Período de Tiempo', type: 'number', unit: 'años', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valor Final', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total Aportado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-croissance-investissement-contribution-annuelle',
            title: 'Calculateur de Croissance d’Investissement avec Contribution Annuelle',
            h1: 'Calculateur de Croissance avec Contribution Annuelle',
            meta_title: 'Calculateur de Croissance Annuelle d’Investissement | Plan de Contribution Annuelle',
            meta_description: 'Calculez la croissance d’un investissement avec des contributions annuelles (plutôt que mensuelles), selon un investissement initial, un montant de contribution annuel, un taux de rendement et une durée.',
            short_answer: 'Ce calculateur projette la croissance d’un investissement lorsque les contributions sont effectuées une fois par an plutôt que mensuellement — courant pour investir un bonus annuel ou des contributions forfaitaires à un compte de retraite.',
            intro_text: '<p>Tout le monde ne contribue pas mensuellement — certains investisseurs ajoutent une somme forfaitaire une fois par an, provenant d’un bonus, d’un remboursement d’impôt, ou d’une révision annuelle des finances. Ce calculateur utilise les mêmes mathématiques de valeur future d’une rente, mais avec une capitalisation annuelle.</p><p><b>Les investisseurs qui financent des comptes annuellement</b> utilisent cela pour projeter la croissance à long terme selon leur schéma réel de contribution.</p>',
            key_points: [
                '<b>Cadence annuelle :</b> La capitalisation et les contributions ont lieu une fois par an.',
                '<b>Même formule, période différente :</b> Utilise la structure identique de valeur future d’une rente que les calculateurs mensuels, mais avec des périodes annuelles.',
                '<b>Bon choix pour les investisseurs de compte retraite/somme forfaitaire :</b> Particulièrement utile pour ceux qui contribuent une seule somme par an.',
            ],
            howto: [
                { question: 'Est-ce important de contribuer mensuellement plutôt qu’annuellement ?', answer: '<p>Contribuer le même montant total plus fréquemment (mensuel vs annuel) produit généralement une croissance légèrement plus élevée, car l’argent est investi plus tôt en moyenne.</p>' },
                { question: 'Quel rendement dois-je supposer pour un compte d’investissement diversifié ?', answer: '<p>Une hypothèse conservatrice courante à long terme pour un portefeuille diversifié d’actions/obligations est de 5-8 % par an.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Investissement Initial', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Contribution Annuelle', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Période', type: 'number', unit: 'ans', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valeur Finale', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Total Versé', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-crescita-investimento-contributo-annuale',
            title: 'Calcolatore Crescita Investimento con Contributo Annuale',
            h1: 'Calcolatore Crescita con Contributo Annuale',
            meta_title: 'Calcolatore Crescita Annuale Investimento | Piano Contributo Annuale',
            meta_description: 'Calcola la crescita di un investimento con contributi annuali (anziché mensili), in base a un investimento iniziale, importo del contributo annuale, rendimento e tempo.',
            short_answer: 'Questo calcolatore proietta la crescita di un investimento quando i contributi vengono effettuati una volta all’anno anziché mensilmente — comune per investire un bonus annuale o contributi forfettari a un conto pensionistico.',
            intro_text: '<p>Non tutti contribuiscono mensilmente — alcuni investitori aggiungono una somma forfettaria una volta all’anno, da un bonus, un rimborso fiscale, o una revisione annuale delle finanze. Questo calcolatore usa la stessa matematica del valore futuro di una rendita, ma con capitalizzazione annuale.</p><p><b>Gli investitori che finanziano i conti annualmente</b> usano questo per proiettare la crescita a lungo termine secondo il loro schema reale di contributo.</p>',
            key_points: [
                '<b>Cadenza annuale:</b> Sia la capitalizzazione che i contributi avvengono una volta all’anno.',
                '<b>Stessa formula, periodo diverso:</b> Usa la struttura identica del valore futuro di una rendita dei calcolatori mensili, ma con periodi annuali.',
                '<b>Adatto per investitori di conti pensionistici/somma forfettaria:</b> Particolarmente utile per chi contribuisce con un’unica somma all’anno.',
            ],
            howto: [
                { question: 'Importa se contribuisco mensilmente invece che annualmente?', answer: '<p>Contribuire con lo stesso importo totale più frequentemente (mensile vs annuale) generalmente produce una crescita leggermente maggiore, poiché il denaro viene investito prima in media.</p>' },
                { question: 'Quale rendimento dovrei ipotizzare per un conto di investimento diversificato?', answer: '<p>Un’ipotesi conservativa comune a lungo termine per un portafoglio diversificato di azioni/obbligazioni è del 5-8% annuo.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Investimento Iniziale', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Contributo Annuale', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Periodo di Tempo', type: 'number', unit: 'anni', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Valore Finale', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Totale Contribuito', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'jaehrliche-beitrag-anlagewachstum-rechner',
            title: 'Anlagewachstum-Rechner mit Jährlichem Beitrag',
            h1: 'Wachstumsrechner mit Jährlichem Beitrag',
            meta_title: 'Jährlicher Anlagewachstum-Rechner | Jährlicher Beitragsplan',
            meta_description: 'Berechnen Sie das Anlagewachstum mit jährlichen (statt monatlichen) Beiträgen, basierend auf einer Anfangsanlage, jährlichem Beitragsbetrag, Rendite und Zeit.',
            short_answer: 'Dieser Rechner prognostiziert das Anlagewachstum, wenn Beiträge einmal jährlich statt monatlich geleistet werden — üblich bei der Investition eines Jahresbonus oder Pauschalbeiträgen zu einem Altersvorsorgekonto.',
            intro_text: '<p>Nicht jeder zahlt monatlich ein — manche Anleger fügen einmal im Jahr eine Pauschalsumme hinzu, aus einem Bonus, einer Steuerrückerstattung oder einer jährlichen Finanzüberprüfung. Dieser Rechner verwendet dieselbe Rentenendwert-Mathematik, jedoch mit jährlicher Verzinsung.</p><p><b>Anleger, die Konten jährlich finanzieren</b>, nutzen dies, um das langfristige Wachstum gemäß ihrem tatsächlichen Beitragsmuster zu prognostizieren.</p>',
            key_points: [
                '<b>Jährlicher Rhythmus:</b> Sowohl Verzinsung als auch Beiträge erfolgen einmal im Jahr.',
                '<b>Gleiche Formel, anderer Zeitraum:</b> Verwendet dieselbe Rentenendwert-Struktur wie monatliche Sparrechner, jedoch mit jährlichen Perioden.',
                '<b>Gut geeignet für Altersvorsorge-/Pauschalbetrag-Anleger:</b> Besonders nützlich für alle, die einen einzigen Pauschalbetrag pro Jahr einzahlen.',
            ],
            howto: [
                { question: 'Spielt es eine Rolle, ob ich monatlich statt jährlich einzahle?', answer: '<p>Die gleiche Gesamtsumme häufiger einzuzahlen (monatlich vs. jährlich) erzeugt im Allgemeinen ein etwas höheres Wachstum, da das Geld im Durchschnitt früher investiert wird.</p>' },
                { question: 'Welche Rendite sollte ich für ein diversifiziertes Anlagekonto annehmen?', answer: '<p>Eine übliche konservative langfristige Annahme für ein diversifiziertes Aktien-/Anleihenportfolio sind 5-8 % jährlich.</p>' },
            ],
            inputs: [
                { name: 'initial_investment', label: 'Anfangsanlage', type: 'number', unit: '$', min: 0, max: 100000000, placeholder: '5000' },
                { name: 'annual_contribution', label: 'Jährlicher Beitrag', type: 'number', unit: '$', min: 0, max: 10000000, placeholder: '6000' },
                { name: 'rate_pct', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 30, placeholder: '7' },
                { name: 'years', label: 'Zeitraum', type: 'number', unit: 'Jahre', min: 0.1, max: 60, placeholder: '20' },
            ],
            outputs: [
                { name: 'final_value', label: 'Endwert', unit: '$', precision: 2 },
                { name: 'total_contributed', label: 'Gesamt Eingezahlt', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1043: Inflation-Adjusted Savings Goal Calculator
// ============================================================
const inflationAdjustedGoal: ToolDef = {
    id: '1043',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'goal_today', default: 50000 },
            { key: 'inflation_pct', default: 3 },
            { key: 'annual_rate', default: 6 },
            { key: 'years', default: 10 },
        ],
        formulas: {
            inflated_goal: 'goal_today*(1+inflation_pct/100)^years',
            monthly_deposit: `(goal_today*(1+inflation_pct/100)^years)*${R} / ((1+${R})^${N} - 1)`,
        },
        outputs: [
            { key: 'inflated_goal', precision: 2 },
            { key: 'monthly_deposit', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'inflation-adjusted-savings-goal-calculator',
            title: 'Inflation-Adjusted Savings Goal Calculator',
            h1: 'Inflation-Adjusted Savings Goal Calculator',
            meta_title: 'Inflation-Adjusted Savings Calculator | Real Future Cost & Monthly Savings',
            meta_description: 'Calculate the true future cost of a savings goal after inflation, and the monthly savings needed to reach that inflated target.',
            short_answer: 'This calculator adjusts a savings goal expressed in today\'s dollars for expected inflation, showing the actual future cost, then calculates the monthly savings needed to reach that inflated target.',
            intro_text: '<p>A goal priced in today\'s dollars will cost more by the time you reach it, because prices generally rise over time. This calculator inflates your target amount forward using an assumed inflation rate, then applies the standard savings-goal formula to the larger, more realistic future number.</p><p><b>Anyone setting a savings goal years in advance</b> — a future purchase, a long-term project, a distant life event — benefits from this adjustment, since planning around today\'s price tag alone tends to leave savers short by the time they actually need the money.</p>',
            key_points: [
                '<b>Two-Step Adjustment:</b> First inflates the goal amount using expected inflation, then solves for the monthly savings needed to hit that larger number.',
                '<b>Long Horizons Matter More:</b> Inflation\'s effect compounds over time — a goal 20 years out is affected far more than one just 2 years away.',
                '<b>Choose a Reasonable Inflation Estimate:</b> Long-term historical averages (roughly 2-3% in many developed economies) are a common starting assumption, though actual rates vary by period and country.',
            ],
            howto: [
                { question: 'Why not just save for today\'s price and add a buffer?', answer: '<p>You can, but this calculator gives a mathematically grounded adjustment based on a specific inflation rate rather than an arbitrary guess, making the plan more defensible and adjustable.</p>' },
                { question: 'What inflation rate should I use?', answer: '<p>A common approach is to use the long-term historical average for your country/currency, or your central bank\'s official target rate, as a reasonable planning assumption.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Goal Amount (Today\'s Dollars)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Expected Inflation Rate', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Expected Annual Return', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Years Until Goal', type: 'number', unit: 'years', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Inflation-Adjusted Goal', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Required Monthly Savings', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-celi-nakopleniy-s-uchetom-inflyacii',
            title: 'Калькулятор цели накоплений с учётом инфляции',
            h1: 'Калькулятор цели накоплений с учётом инфляции',
            meta_title: 'Калькулятор накоплений с инфляцией | Реальная будущая стоимость и взнос',
            meta_description: 'Рассчитайте реальную будущую стоимость цели накоплений с учётом инфляции и необходимые ежемесячные накопления для её достижения.',
            short_answer: 'Этот калькулятор корректирует цель накоплений, выраженную в сегодняшних деньгах, на ожидаемую инфляцию, показывая реальную будущую стоимость, затем рассчитывает необходимые ежемесячные накопления.',
            intro_text: '<p>Цель, оценённая в сегодняшних деньгах, будет стоить дороже к моменту достижения, так как цены обычно растут со временем. Калькулятор индексирует целевую сумму вперёд по предполагаемой инфляции, затем применяет стандартную формулу цели накоплений к большей, более реалистичной будущей сумме.</p><p><b>Любой, кто ставит цель накоплений на годы вперёд</b>, выигрывает от этой корректировки.</p>',
            key_points: [
                '<b>Двухшаговая корректировка:</b> Сначала индексирует целевую сумму по ожидаемой инфляции, затем рассчитывает необходимые ежемесячные накопления для этой большей суммы.',
                '<b>Долгий горизонт важнее:</b> Эффект инфляции накапливается со временем — цель через 20 лет затронута гораздо сильнее, чем через 2 года.',
                '<b>Выбирайте разумную оценку инфляции:</b> Долгосрочные исторические средние (примерно 2-3% во многих развитых экономиках) — распространённое стартовое предположение.',
            ],
            howto: [
                { question: 'Почему бы просто не копить на сегодняшнюю цену с запасом?', answer: '<p>Можно, но этот калькулятор даёт математически обоснованную корректировку на основе конкретной ставки инфляции, а не произвольной догадки.</p>' },
                { question: 'Какую ставку инфляции использовать?', answer: '<p>Распространённый подход — использовать долгосрочное историческое среднее для вашей страны/валюты или официальную целевую ставку центробанка.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Целевая сумма (в сегодняшних деньгах)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Ожидаемая инфляция', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Ожидаемая годовая доходность', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Лет до цели', type: 'number', unit: 'лет', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Цель с учётом инфляции', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Необходимые ежемесячные накопления', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'inflacijas-koriges-uzkrajumu-merka-kalkulators',
            title: 'Inflācijas Koriģēta Uzkrājumu Mērķa Kalkulators',
            h1: 'Inflācijas Koriģēta Uzkrājumu Mērķa Kalkulators',
            meta_title: 'Inflācijas Uzkrājumu Kalkulators | Reālās Nākotnes Izmaksas un Iemaksa',
            meta_description: 'Aprēķiniet uzkrājumu mērķa reālās nākotnes izmaksas pēc inflācijas un nepieciešamos ikmēneša uzkrājumus šī mērķa sasniegšanai.',
            short_answer: 'Šis kalkulators koriģē uzkrājumu mērķi, kas izteikts šodienas naudā, ar gaidīto inflāciju, parādot reālās nākotnes izmaksas, tad aprēķina nepieciešamos ikmēneša uzkrājumus.',
            intro_text: '<p>Mērķis, kas novērtēts šodienas naudā, maksās vairāk līdz brīdim, kad to sasniegsiet, jo cenas parasti laika gaitā pieaug. Kalkulators indeksē mērķa summu uz priekšu pēc pieņemtās inflācijas, tad piemēro standarta uzkrājumu mērķa formulu lielākai, reālistiskākai nākotnes summai.</p><p><b>Ikviens, kas izvirza uzkrājumu mērķi gadiem uz priekšu</b>, gūst labumu no šīs korekcijas.</p>',
            key_points: [
                '<b>Divu soļu korekcija:</b> Vispirms indeksē mērķa summu pēc gaidītās inflācijas, tad aprēķina nepieciešamos ikmēneša uzkrājumus šai lielākai summai.',
                '<b>Garāks horizonts ir svarīgāks:</b> Inflācijas efekts uzkrājas laika gaitā — mērķis pēc 20 gadiem ir ietekmēts daudz vairāk nekā pēc 2 gadiem.',
                '<b>Izvēlieties saprātīgu inflācijas novērtējumu:</b> Ilgtermiņa vēsturiskie vidējie rādītāji (aptuveni 2-3% daudzās attīstītajās ekonomikās) ir izplatīts sākuma pieņēmums.',
            ],
            howto: [
                { question: 'Kāpēc gan vienkārši nekrāt šodienas cenai ar rezervi?', answer: '<p>Var, bet šis kalkulators dod matemātiski pamatotu korekciju, balstoties uz konkrētu inflācijas likmi, nevis patvaļīgu minējumu.</p>' },
                { question: 'Kādu inflācijas likmi izmantot?', answer: '<p>Izplatīta pieeja ir izmantot ilgtermiņa vēsturisko vidējo jūsu valstij/valūtai, vai centrālās bankas oficiālo mērķa likmi.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Mērķa Summa (Šodienas Naudā)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Gaidītā Inflācija', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Gaidītais Gada Ienesīgums', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Gadi Līdz Mērķim', type: 'number', unit: 'gadi', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Inflācijas Koriģētais Mērķis', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Nepieciešamie Ikmēneša Uzkrājumi', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-celu-oszczednosciowego-skorygowany-o-inflacje',
            title: 'Kalkulator Celu Oszczędnościowego Skorygowanego o Inflację',
            h1: 'Kalkulator Celu z Korektą o Inflację',
            meta_title: 'Kalkulator Oszczędności z Inflacją | Realny Koszt Przyszły i Wpłata',
            meta_description: 'Oblicz rzeczywisty przyszły koszt celu oszczędnościowego po uwzględnieniu inflacji oraz wymagane miesięczne oszczędności.',
            short_answer: 'Ten kalkulator koryguje cel oszczędnościowy wyrażony w dzisiejszych pieniądzach o oczekiwaną inflację, pokazując rzeczywisty przyszły koszt, a następnie oblicza wymagane miesięczne oszczędności.',
            intro_text: '<p>Cel wyceniony w dzisiejszych pieniądzach będzie kosztował więcej, zanim go osiągniesz, ponieważ ceny generalnie rosną w czasie. Kalkulator indeksuje kwotę docelową naprzód przy założonej stopie inflacji, a następnie stosuje standardowy wzór celu oszczędnościowego do większej, bardziej realistycznej przyszłej kwoty.</p><p><b>Każdy, kto ustala cel oszczędnościowy na lata naprzód</b>, korzysta z tej korekty.</p>',
            key_points: [
                '<b>Dwustopniowa korekta:</b> Najpierw indeksuje kwotę celu przy oczekiwanej inflacji, następnie oblicza wymagane miesięczne oszczędności dla tej większej kwoty.',
                '<b>Dłuższy horyzont ma większe znaczenie:</b> Efekt inflacji kumuluje się w czasie — cel za 20 lat jest znacznie bardziej dotknięty niż cel za 2 lata.',
                '<b>Wybierz rozsądne oszacowanie inflacji:</b> Długoterminowe średnie historyczne (około 2-3% w wielu rozwiniętych gospodarkach) to powszechne założenie wyjściowe.',
            ],
            howto: [
                { question: 'Dlaczego nie oszczędzać po prostu na dzisiejszą cenę z zapasem?', answer: '<p>Możesz, ale ten kalkulator daje matematycznie uzasadnioną korektę opartą na konkretnej stopie inflacji, a nie dowolnym przypuszczeniu.</p>' },
                { question: 'Jaką stopę inflacji użyć?', answer: '<p>Powszechnym podejściem jest użycie długoterminowej średniej historycznej dla twojego kraju/waluty, lub oficjalnej docelowej stopy banku centralnego.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Kwota Celu (Dzisiejsze Pieniądze)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Oczekiwana Inflacja', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Oczekiwana Roczna Stopa Zwrotu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Lata do Celu', type: 'number', unit: 'lat', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Cel Skorygowany o Inflację', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Wymagane Miesięczne Oszczędności', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-meta-ahorro-ajustada-inflacion',
            title: 'Calculadora de Meta de Ahorro Ajustada por Inflación',
            h1: 'Calculadora de Meta Ajustada por Inflación',
            meta_title: 'Calculadora de Ahorro con Inflación | Costo Futuro Real y Aportación',
            meta_description: 'Calcula el costo futuro real de una meta de ahorro después de la inflación, y el ahorro mensual necesario para alcanzar esa meta ajustada.',
            short_answer: 'Esta calculadora ajusta una meta de ahorro expresada en dólares de hoy según la inflación esperada, mostrando el costo futuro real, y luego calcula el ahorro mensual necesario para alcanzar esa meta ajustada.',
            intro_text: '<p>Una meta cotizada en dólares de hoy costará más para cuando la alcances, porque los precios generalmente suben con el tiempo. Esta calculadora infla tu monto objetivo hacia adelante usando una tasa de inflación asumida, luego aplica la fórmula estándar de meta de ahorro al número futuro más grande y realista.</p><p><b>Cualquiera que fije una meta de ahorro años por adelantado</b> se beneficia de este ajuste.</p>',
            key_points: [
                '<b>Ajuste en dos pasos:</b> Primero infla el monto de la meta usando la inflación esperada, luego calcula el ahorro mensual necesario para ese número más grande.',
                '<b>Los horizontes largos importan más:</b> El efecto de la inflación se acumula con el tiempo — una meta a 20 años se ve mucho más afectada que una a solo 2 años.',
                '<b>Elige una estimación de inflación razonable:</b> Los promedios históricos a largo plazo (aproximadamente 2-3% en muchas economías desarrolladas) son una suposición inicial común.',
            ],
            howto: [
                { question: '¿Por qué no simplemente ahorrar para el precio de hoy y añadir un margen?', answer: '<p>Puedes, pero esta calculadora da un ajuste matemáticamente fundamentado basado en una tasa de inflación específica en lugar de una suposición arbitraria.</p>' },
                { question: '¿Qué tasa de inflación debo usar?', answer: '<p>Un enfoque común es usar el promedio histórico a largo plazo de tu país/moneda, o la tasa objetivo oficial de tu banco central.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Monto de la Meta (Dólares de Hoy)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Inflación Esperada', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Rendimiento Anual Esperado', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Años Hasta la Meta', type: 'number', unit: 'años', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Meta Ajustada por Inflación', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Ahorro Mensual Requerido', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-objectif-epargne-ajuste-inflation',
            title: 'Calculateur d’Objectif d’Épargne Ajusté à l’Inflation',
            h1: 'Calculateur d’Objectif Ajusté à l’Inflation',
            meta_title: 'Calculateur d’Épargne avec Inflation | Coût Futur Réel et Épargne',
            meta_description: 'Calculez le coût futur réel d’un objectif d’épargne après inflation, et l’épargne mensuelle nécessaire pour atteindre cet objectif ajusté.',
            short_answer: 'Ce calculateur ajuste un objectif d’épargne exprimé en dollars d’aujourd’hui selon l’inflation attendue, montrant le coût futur réel, puis calcule l’épargne mensuelle nécessaire pour atteindre cet objectif ajusté.',
            intro_text: '<p>Un objectif chiffré en dollars d’aujourd’hui coûtera plus cher lorsque vous l’atteindrez, car les prix augmentent généralement avec le temps. Ce calculateur augmente votre montant cible en utilisant un taux d’inflation supposé, puis applique la formule standard d’objectif d’épargne au chiffre futur plus important et réaliste.</p><p><b>Quiconque fixe un objectif d’épargne des années à l’avance</b> bénéficie de cet ajustement.</p>',
            key_points: [
                '<b>Ajustement en deux étapes :</b> Augmente d’abord le montant de l’objectif selon l’inflation attendue, puis résout l’épargne mensuelle nécessaire pour ce chiffre plus important.',
                '<b>Les horizons longs comptent plus :</b> L’effet de l’inflation se cumule dans le temps — un objectif à 20 ans est bien plus affecté qu’un objectif à seulement 2 ans.',
                '<b>Choisissez une estimation d’inflation raisonnable :</b> Les moyennes historiques à long terme (environ 2-3 % dans de nombreuses économies développées) sont une hypothèse de départ courante.',
            ],
            howto: [
                { question: 'Pourquoi ne pas simplement épargner pour le prix d’aujourd’hui avec une marge ?', answer: '<p>Vous pouvez, mais ce calculateur donne un ajustement mathématiquement fondé sur un taux d’inflation spécifique plutôt qu’une supposition arbitraire.</p>' },
                { question: 'Quel taux d’inflation dois-je utiliser ?', answer: '<p>Une approche courante consiste à utiliser la moyenne historique à long terme de votre pays/devise, ou le taux cible officiel de votre banque centrale.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Montant de l’Objectif (Dollars d’Aujourd’hui)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Inflation Attendue', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Rendement Annuel Attendu', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Années Avant l’Objectif', type: 'number', unit: 'ans', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Objectif Ajusté à l’Inflation', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Épargne Mensuelle Requise', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-obiettivo-risparmio-corretto-inflazione',
            title: 'Calcolatore Obiettivo di Risparmio Corretto per l’Inflazione',
            h1: 'Calcolatore Obiettivo Corretto per l’Inflazione',
            meta_title: 'Calcolatore Risparmio con Inflazione | Costo Futuro Reale e Deposito',
            meta_description: 'Calcola il vero costo futuro di un obiettivo di risparmio dopo l’inflazione, e il risparmio mensile necessario per raggiungere quell’obiettivo corretto.',
            short_answer: 'Questo calcolatore corregge un obiettivo di risparmio espresso in dollari odierni per l’inflazione attesa, mostrando il costo futuro reale, poi calcola il risparmio mensile necessario per raggiungere quell’obiettivo corretto.',
            intro_text: '<p>Un obiettivo valutato in dollari odierni costerà di più quando lo raggiungerai, perché i prezzi generalmente aumentano nel tempo. Questo calcolatore aumenta il tuo importo obiettivo usando un tasso di inflazione ipotizzato, poi applica la formula standard di obiettivo di risparmio al numero futuro più grande e realistico.</p><p><b>Chiunque fissi un obiettivo di risparmio anni in anticipo</b> beneficia di questa correzione.</p>',
            key_points: [
                '<b>Correzione in due fasi:</b> Prima aumenta l’importo dell’obiettivo usando l’inflazione attesa, poi calcola il risparmio mensile necessario per quel numero maggiore.',
                '<b>Gli orizzonti lunghi contano di più:</b> L’effetto dell’inflazione si accumula nel tempo — un obiettivo tra 20 anni è influenzato molto più di uno tra soli 2 anni.',
                '<b>Scegli una stima di inflazione ragionevole:</b> Le medie storiche a lungo termine (circa 2-3% in molte economie sviluppate) sono un’ipotesi di partenza comune.',
            ],
            howto: [
                { question: 'Perché non risparmiare semplicemente per il prezzo di oggi con un margine?', answer: '<p>Puoi, ma questo calcolatore offre una correzione matematicamente fondata basata su un tasso di inflazione specifico anziché una supposizione arbitraria.</p>' },
                { question: 'Quale tasso di inflazione dovrei usare?', answer: '<p>Un approccio comune è usare la media storica a lungo termine per il tuo paese/valuta, o il tasso obiettivo ufficiale della tua banca centrale.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Importo Obiettivo (Dollari Odierni)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Inflazione Attesa', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Rendimento Annuo Atteso', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Anni All’Obiettivo', type: 'number', unit: 'anni', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Obiettivo Corretto per l’Inflazione', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Risparmio Mensile Richiesto', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'inflationsbereinigtes-sparziel-rechner',
            title: 'Inflationsbereinigter Sparziel-Rechner',
            h1: 'Inflationsbereinigter Sparziel-Rechner',
            meta_title: 'Sparrechner mit Inflation | Reale Zukünftige Kosten und Monatliche Ersparnisse',
            meta_description: 'Berechnen Sie die tatsächlichen zukünftigen Kosten eines Sparziels nach Inflation und die erforderlichen monatlichen Ersparnisse.',
            short_answer: 'Dieser Rechner passt ein in heutigen Dollar ausgedrücktes Sparziel an die erwartete Inflation an, zeigt die tatsächlichen zukünftigen Kosten und berechnet dann die erforderlichen monatlichen Ersparnisse für dieses inflationsbereinigte Ziel.',
            intro_text: '<p>Ein in heutigen Dollar bepreistes Ziel wird bis zum Erreichen mehr kosten, da die Preise im Laufe der Zeit im Allgemeinen steigen. Dieser Rechner erhöht Ihren Zielbetrag anhand einer angenommenen Inflationsrate und wendet dann die Standard-Sparziel-Formel auf die größere, realistischere zukünftige Zahl an.</p><p><b>Jeder, der ein Sparziel Jahre im Voraus festlegt</b>, profitiert von dieser Anpassung.</p>',
            key_points: [
                '<b>Zweistufige Anpassung:</b> Erhöht zunächst den Zielbetrag anhand der erwarteten Inflation, löst dann nach den erforderlichen monatlichen Ersparnissen für diese größere Zahl auf.',
                '<b>Lange Horizonte sind wichtiger:</b> Der Inflationseffekt summiert sich über die Zeit — ein Ziel in 20 Jahren ist weit stärker betroffen als eines in nur 2 Jahren.',
                '<b>Wählen Sie eine vernünftige Inflationsschätzung:</b> Langfristige historische Durchschnittswerte (etwa 2-3 % in vielen entwickelten Volkswirtschaften) sind eine übliche Ausgangsannahme.',
            ],
            howto: [
                { question: 'Warum nicht einfach für den heutigen Preis sparen und einen Puffer hinzufügen?', answer: '<p>Sie können, aber dieser Rechner bietet eine mathematisch fundierte Anpassung basierend auf einer bestimmten Inflationsrate statt einer willkürlichen Schätzung.</p>' },
                { question: 'Welche Inflationsrate sollte ich verwenden?', answer: '<p>Ein üblicher Ansatz ist die Verwendung des langfristigen historischen Durchschnitts für Ihr Land/Ihre Währung oder der offiziellen Zielrate Ihrer Zentralbank.</p>' },
            ],
            inputs: [
                { name: 'goal_today', label: 'Zielbetrag (Heutige Dollar)', type: 'number', unit: '$', min: 1, max: 100000000, placeholder: '50000' },
                { name: 'inflation_pct', label: 'Erwartete Inflation', type: 'number', unit: '%', min: 0, max: 30, placeholder: '3' },
                { name: 'annual_rate', label: 'Erwartete Jährliche Rendite', type: 'number', unit: '%', min: 0, max: 30, placeholder: '6' },
                { name: 'years', label: 'Jahre Bis zum Ziel', type: 'number', unit: 'Jahre', min: 0.1, max: 60, placeholder: '10' },
            ],
            outputs: [
                { name: 'inflated_goal', label: 'Inflationsbereinigtes Ziel', unit: '$', precision: 2 },
                { name: 'monthly_deposit', label: 'Erforderliche Monatliche Ersparnisse', unit: '$', precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1044: Round-Up Savings Calculator
// ============================================================
const roundUpSavings: ToolDef = {
    id: '1044',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'transactions_per_month', default: 60 },
            { key: 'avg_roundup', default: 0.45 },
        ],
        formulas: {
            monthly_savings: 'transactions_per_month*avg_roundup',
            annual_savings: 'transactions_per_month*avg_roundup*12',
        },
        outputs: [
            { key: 'monthly_savings', precision: 2 },
            { key: 'annual_savings', precision: 2 },
        ],
    },
    locales: {
        en: {
            slug: 'round-up-savings-calculator',
            title: 'Round-Up Savings Calculator',
            h1: 'Round-Up Savings Calculator',
            meta_title: 'Round-Up Savings Calculator | Spare Change Savings Estimate',
            meta_description: 'Estimate how much you could save automatically using a "round up to the nearest dollar" spare-change savings app, based on your typical transaction habits.',
            short_answer: 'This calculator estimates how much you could accumulate using a round-up savings app — one that rounds each purchase up to the nearest dollar and saves the difference — based on your typical number of transactions and average round-up amount.',
            intro_text: '<p>Round-up savings apps (like Acorns or bank-provided round-up features) automatically round each debit card purchase up to the nearest dollar and move the difference into savings — a "set it and forget it" way to save small amounts painlessly.</p><p><b>People who struggle to save manually</b> often find round-up programs effective precisely because the amounts are small and automatic — no monthly decision required, just steady accumulation from everyday spending.</p>',
            key_points: [
                '<b>Painless Automatic Savings:</b> Small amounts (typically $0.01-$0.99 per purchase) add up without requiring active decisions each month.',
                '<b>Depends on Spending Frequency:</b> More frequent small purchases (coffee, lunch, groceries) generate more round-up savings than occasional large purchases.',
                '<b>A Supplement, Not a Strategy:</b> Round-up savings work well alongside a dedicated savings plan, but rarely generate enough alone to meet larger goals like retirement or a home down payment.',
            ],
            howto: [
                { question: 'What\'s a realistic average round-up amount?', answer: '<p>Since round-ups range randomly from $0.01 to $0.99, the mathematical average is $0.50 — many people use $0.40-$0.50 as a reasonable estimate for typical spending patterns.</p>' },
                { question: 'Should I rely on round-ups for a specific savings goal?', answer: '<p>Round-ups work best as a supplement to intentional saving — for a specific target with a deadline, use a dedicated savings-goal calculator to plan the required monthly amount directly.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Card Transactions per Month', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Average Round-Up Amount', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Estimated Monthly Savings', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Estimated Annual Savings', unit: '$', precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-nakopleniy-na-okruglenii',
            title: 'Калькулятор накоплений на округлении покупок',
            h1: 'Калькулятор накоплений на округлении',
            meta_title: 'Калькулятор округления | Оценка накоплений на мелочи',
            meta_description: 'Оцените, сколько можно накопить автоматически с помощью приложения «округление до целого доллара», исходя из ваших привычек трат.',
            short_answer: 'Этот калькулятор оценивает, сколько можно накопить с помощью приложения округления — округляющего каждую покупку до целого доллара и сохраняющего разницу — исходя из числа транзакций и средней суммы округления.',
            intro_text: '<p>Приложения округления (как Acorns или банковские функции округления) автоматически округляют каждую покупку по дебетовой карте до целого доллара и переводят разницу в накопления.</p><p><b>Люди, которым трудно копить вручную</b>, часто находят программы округления эффективными именно потому, что суммы малы и автоматичны.</p>',
            key_points: [
                '<b>Безболезненные автоматические накопления:</b> Малые суммы (обычно $0.01-$0.99 за покупку) складываются без необходимости ежемесячных решений.',
                '<b>Зависит от частоты трат:</b> Более частые мелкие покупки (кофе, обед, продукты) дают больше накоплений на округлении, чем редкие крупные покупки.',
                '<b>Дополнение, не стратегия:</b> Округление хорошо работает вместе с целевым планом накоплений, но редко даёт достаточно для больших целей вроде пенсии.',
            ],
            howto: [
                { question: 'Какая реалистичная средняя сумма округления?', answer: '<p>Так как округления случайно варьируются от $0.01 до $0.99, математическое среднее — $0.50 — многие используют $0.40-$0.50 как разумную оценку.</p>' },
                { question: 'Стоит ли полагаться на округление для конкретной цели?', answer: '<p>Округление лучше всего работает как дополнение к осознанным накоплениям — для конкретной цели со сроком используйте специальный калькулятор цели накоплений.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Транзакций по карте в месяц', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Средняя сумма округления', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Оценка ежемесячных накоплений', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Оценка годовых накоплений', unit: '$', precision: 2 },
            ],
        },
        lv: {
            slug: 'noapalosanas-uzkrajumu-kalkulators',
            title: 'Noapaļošanas Uzkrājumu Kalkulators',
            h1: 'Noapaļošanas Uzkrājumu Kalkulators',
            meta_title: 'Noapaļošanas Kalkulators | Sīknaudas Uzkrājumu Novērtējums',
            meta_description: 'Novērtējiet, cik daudz varētu automātiski uzkrāt, izmantojot "noapaļo līdz tuvākajam dolāram" lietotni, balstoties uz jūsu tēriņu paradumiem.',
            short_answer: 'Šis kalkulators novērtē, cik daudz varētu uzkrāt, izmantojot noapaļošanas uzkrājumu lietotni — kas katru pirkumu noapaļo līdz tuvākajam dolāram un uzkrāj starpību — balstoties uz darījumu skaitu un vidējo noapaļošanas summu.',
            intro_text: '<p>Noapaļošanas uzkrājumu lietotnes (kā Acorns vai bankas noapaļošanas funkcijas) automātiski noapaļo katru debetkartes pirkumu līdz tuvākajam dolāram un pārskaita starpību uzkrājumos.</p><p><b>Cilvēki, kam grūti krāt manuāli</b>, bieži atklāj, ka noapaļošanas programmas ir efektīvas tieši tāpēc, ka summas ir mazas un automātiskas.</p>',
            key_points: [
                '<b>Nesāpīgi automātiski uzkrājumi:</b> Mazas summas (parasti $0.01-$0.99 par pirkumu) uzkrājas bez nepieciešamības pieņemt lēmumus katru mēnesi.',
                '<b>Atkarīgs no tēriņu biežuma:</b> Biežāki mazi pirkumi (kafija, pusdienas, pārtika) rada vairāk noapaļošanas uzkrājumu nekā reti lieli pirkumi.',
                '<b>Papildinājums, ne stratēģija:</b> Noapaļošana labi darbojas kopā ar mērķtiecīgu uzkrājumu plānu, taču reti dod pietiekami lielākiem mērķiem, piemēram, pensijai.',
            ],
            howto: [
                { question: 'Kāda ir reālistiska vidējā noapaļošanas summa?', answer: '<p>Tā kā noapaļojumi nejauši svārstās no $0.01 līdz $0.99, matemātiskais vidējais ir $0.50 — daudzi izmanto $0.40-$0.50 kā saprātīgu novērtējumu.</p>' },
                { question: 'Vai paļauties uz noapaļošanu konkrētam mērķim?', answer: '<p>Noapaļošana vislabāk darbojas kā papildinājums apzinātiem uzkrājumiem — konkrētam mērķim ar termiņu izmantojiet specializētu uzkrājumu mērķa kalkulatoru.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Kartes Darījumi Mēnesī', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Vidējā Noapaļošanas Summa', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Novērtētie Ikmēneša Uzkrājumi', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Novērtētie Gada Uzkrājumi', unit: '$', precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-oszczednosci-z-zaokraglenia',
            title: 'Kalkulator Oszczędności z Zaokrąglenia',
            h1: 'Kalkulator Oszczędności z Zaokrąglenia',
            meta_title: 'Kalkulator Zaokrąglenia | Oszacowanie Oszczędności z Drobnych',
            meta_description: 'Oszacuj, ile mógłbyś automatycznie zaoszczędzić za pomocą aplikacji "zaokrąglaj do najbliższego dolara", na podstawie swoich nawyków zakupowych.',
            short_answer: 'Ten kalkulator szacuje, ile mógłbyś zgromadzić za pomocą aplikacji do oszczędzania z zaokrąglenia — która zaokrągla każdy zakup do najbliższego dolara i oszczędza różnicę — na podstawie liczby transakcji i średniej kwoty zaokrąglenia.',
            intro_text: '<p>Aplikacje oszczędnościowe z zaokrągleniem (jak Acorns lub funkcje bankowe) automatycznie zaokrąglają każdy zakup kartą debetową do najbliższego dolara i przenoszą różnicę na oszczędności.</p><p><b>Osoby, którym trudno oszczędzać ręcznie</b>, często uważają programy zaokrąglania za skuteczne właśnie dlatego, że kwoty są małe i automatyczne.</p>',
            key_points: [
                '<b>Bezbolesne automatyczne oszczędności:</b> Małe kwoty (zwykle $0.01-$0.99 za zakup) sumują się bez konieczności podejmowania decyzji co miesiąc.',
                '<b>Zależy od częstotliwości wydatków:</b> Częstsze małe zakupy (kawa, lunch, zakupy spożywcze) generują więcej oszczędności z zaokrąglenia niż rzadkie duże zakupy.',
                '<b>Uzupełnienie, nie strategia:</b> Zaokrąglanie dobrze działa razem z celowym planem oszczędnościowym, ale rzadko generuje wystarczająco na większe cele, jak emerytura.',
            ],
            howto: [
                { question: 'Jaka jest realistyczna średnia kwota zaokrąglenia?', answer: '<p>Ponieważ zaokrąglenia losowo wahają się od $0.01 do $0.99, matematyczna średnia to $0.50 — wiele osób używa $0.40-$0.50 jako rozsądnego oszacowania.</p>' },
                { question: 'Czy powinienem polegać na zaokrągleniu dla konkretnego celu?', answer: '<p>Zaokrąglanie działa najlepiej jako uzupełnienie świadomego oszczędzania — dla konkretnego celu z terminem użyj dedykowanego kalkulatora celu oszczędnościowego.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Transakcje Kartą na Miesiąc', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Średnia Kwota Zaokrąglenia', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Szacowane Miesięczne Oszczędności', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Szacowane Roczne Oszczędności', unit: '$', precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-ahorro-redondeo',
            title: 'Calculadora de Ahorro por Redondeo',
            h1: 'Calculadora de Ahorro por Redondeo',
            meta_title: 'Calculadora de Redondeo | Estimación de Ahorro de Cambio Suelto',
            meta_description: 'Estima cuánto podrías ahorrar automáticamente usando una app de ahorro de "redondeo al dólar más cercano", según tus hábitos de compra.',
            short_answer: 'Esta calculadora estima cuánto podrías acumular usando una app de ahorro por redondeo — que redondea cada compra al dólar más cercano y ahorra la diferencia — según tu número típico de transacciones y monto promedio de redondeo.',
            intro_text: '<p>Las apps de ahorro por redondeo (como Acorns o funciones bancarias de redondeo) redondean automáticamente cada compra con tarjeta de débito al dólar más cercano y mueven la diferencia a ahorros.</p><p><b>Las personas que tienen dificultad para ahorrar manualmente</b> a menudo encuentran que los programas de redondeo son efectivos precisamente porque las cantidades son pequeñas y automáticas.</p>',
            key_points: [
                '<b>Ahorro automático sin esfuerzo:</b> Pequeñas cantidades (típicamente $0.01-$0.99 por compra) se suman sin requerir decisiones activas cada mes.',
                '<b>Depende de la frecuencia de gasto:</b> Compras pequeñas más frecuentes (café, almuerzo, comestibles) generan más ahorro por redondeo que compras grandes ocasionales.',
                '<b>Un complemento, no una estrategia:</b> El ahorro por redondeo funciona bien junto a un plan de ahorro dedicado, pero rara vez genera suficiente por sí solo para metas mayores como la jubilación.',
            ],
            howto: [
                { question: '¿Cuál es un monto promedio realista de redondeo?', answer: '<p>Como los redondeos varían aleatoriamente de $0.01 a $0.99, el promedio matemático es $0.50 — muchos usan $0.40-$0.50 como estimación razonable.</p>' },
                { question: '¿Debo confiar en el redondeo para una meta específica?', answer: '<p>El redondeo funciona mejor como complemento al ahorro intencional — para una meta específica con plazo, usa una calculadora dedicada de meta de ahorro.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Transacciones con Tarjeta al Mes', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Monto Promedio de Redondeo', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Ahorro Mensual Estimado', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Ahorro Anual Estimado', unit: '$', precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-epargne-arrondi',
            title: 'Calculateur d’Épargne par Arrondi',
            h1: 'Calculateur d’Épargne par Arrondi',
            meta_title: 'Calculateur d’Arrondi | Estimation d’Épargne de Petite Monnaie',
            meta_description: 'Estimez combien vous pourriez épargner automatiquement grâce à une application d’épargne "arrondi au dollar le plus proche", selon vos habitudes d’achat.',
            short_answer: 'Ce calculateur estime combien vous pourriez accumuler grâce à une application d’épargne par arrondi — qui arrondit chaque achat au dollar le plus proche et épargne la différence — selon votre nombre habituel de transactions et le montant moyen d’arrondi.',
            intro_text: '<p>Les applications d’épargne par arrondi (comme Acorns ou les fonctionnalités bancaires d’arrondi) arrondissent automatiquement chaque achat par carte de débit au dollar le plus proche et transfèrent la différence vers l’épargne.</p><p><b>Les personnes qui ont du mal à épargner manuellement</b> trouvent souvent les programmes d’arrondi efficaces précisément parce que les montants sont petits et automatiques.</p>',
            key_points: [
                '<b>Épargne automatique indolore :</b> De petits montants (généralement 0,01 $ à 0,99 $ par achat) s’additionnent sans nécessiter de décisions actives chaque mois.',
                '<b>Dépend de la fréquence des dépenses :</b> Des petits achats plus fréquents (café, déjeuner, épicerie) génèrent plus d’épargne par arrondi que des achats importants occasionnels.',
                '<b>Un complément, pas une stratégie :</b> L’épargne par arrondi fonctionne bien aux côtés d’un plan d’épargne dédié, mais génère rarement assez à elle seule pour des objectifs plus importants comme la retraite.',
            ],
            howto: [
                { question: 'Quel est un montant moyen d’arrondi réaliste ?', answer: '<p>Comme les arrondis varient aléatoirement de 0,01 $ à 0,99 $, la moyenne mathématique est de 0,50 $ — beaucoup utilisent 0,40-0,50 $ comme estimation raisonnable.</p>' },
                { question: 'Dois-je compter sur les arrondis pour un objectif spécifique ?', answer: '<p>Les arrondis fonctionnent mieux comme complément à une épargne intentionnelle — pour un objectif spécifique avec une échéance, utilisez un calculateur d’objectif d’épargne dédié.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Transactions par Carte par Mois', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Montant Moyen d’Arrondi', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Épargne Mensuelle Estimée', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Épargne Annuelle Estimée', unit: '$', precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-risparmio-arrotondamento',
            title: 'Calcolatore Risparmio da Arrotondamento',
            h1: 'Calcolatore Risparmio da Arrotondamento',
            meta_title: 'Calcolatore Arrotondamento | Stima Risparmio Spiccioli',
            meta_description: 'Stima quanto potresti risparmiare automaticamente con un\'app di risparmio "arrotonda al dollaro più vicino", in base alle tue abitudini di spesa.',
            short_answer: 'Questo calcolatore stima quanto potresti accumulare usando un\'app di risparmio con arrotondamento — che arrotonda ogni acquisto al dollaro più vicino e risparmia la differenza — in base al tuo numero tipico di transazioni e importo medio di arrotondamento.',
            intro_text: '<p>Le app di risparmio con arrotondamento (come Acorns o funzionalità bancarie di arrotondamento) arrotondano automaticamente ogni acquisto con carta di debito al dollaro più vicino e spostano la differenza nei risparmi.</p><p><b>Le persone che faticano a risparmiare manualmente</b> trovano spesso i programmi di arrotondamento efficaci proprio perché gli importi sono piccoli e automatici.</p>',
            key_points: [
                '<b>Risparmio automatico indolore:</b> Piccoli importi (tipicamente $0.01-$0.99 per acquisto) si sommano senza richiedere decisioni attive ogni mese.',
                '<b>Dipende dalla frequenza di spesa:</b> Acquisti piccoli più frequenti (caffè, pranzo, spesa) generano più risparmio da arrotondamento rispetto ad acquisti grandi occasionali.',
                '<b>Un complemento, non una strategia:</b> Il risparmio da arrotondamento funziona bene insieme a un piano di risparmio dedicato, ma raramente genera abbastanza da solo per obiettivi più grandi come la pensione.',
            ],
            howto: [
                { question: 'Qual è un importo medio realistico di arrotondamento?', answer: '<p>Poiché gli arrotondamenti variano casualmente da $0.01 a $0.99, la media matematica è $0.50 — molti usano $0.40-$0.50 come stima ragionevole.</p>' },
                { question: 'Dovrei fare affidamento sull’arrotondamento per un obiettivo specifico?', answer: '<p>L’arrotondamento funziona meglio come complemento al risparmio intenzionale — per un obiettivo specifico con scadenza, usa un calcolatore di obiettivo di risparmio dedicato.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Transazioni con Carta al Mese', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Importo Medio di Arrotondamento', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Risparmio Mensile Stimato', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Risparmio Annuo Stimato', unit: '$', precision: 2 },
            ],
        },
        de: {
            slug: 'aufrundungs-sparrechner',
            title: 'Aufrundungs-Sparrechner',
            h1: 'Aufrundungs-Sparrechner',
            meta_title: 'Aufrundungs-Rechner | Kleingeld-Sparschätzung',
            meta_description: 'Schätzen Sie, wie viel Sie automatisch mit einer "auf den nächsten Dollar aufrunden"-Spar-App sparen könnten, basierend auf Ihren typischen Ausgabegewohnheiten.',
            short_answer: 'Dieser Rechner schätzt, wie viel Sie mit einer Aufrundungs-Spar-App ansammeln könnten — die jeden Kauf auf den nächsten Dollar aufrundet und die Differenz spart — basierend auf Ihrer typischen Anzahl von Transaktionen und dem durchschnittlichen Aufrundungsbetrag.',
            intro_text: '<p>Aufrundungs-Spar-Apps (wie Acorns oder bankseitige Aufrundungsfunktionen) runden automatisch jeden Debitkarteneinkauf auf den nächsten Dollar auf und verschieben die Differenz in die Ersparnisse.</p><p><b>Menschen, die Schwierigkeiten haben, manuell zu sparen</b>, finden Aufrundungsprogramme oft gerade deshalb effektiv, weil die Beträge klein und automatisch sind.</p>',
            key_points: [
                '<b>Schmerzloses automatisches Sparen:</b> Kleine Beträge (typischerweise 0,01-0,99 $ pro Kauf) summieren sich, ohne dass monatlich aktive Entscheidungen nötig sind.',
                '<b>Abhängig von der Ausgabenhäufigkeit:</b> Häufigere kleine Einkäufe (Kaffee, Mittagessen, Lebensmittel) erzeugen mehr Aufrundungsersparnisse als gelegentliche große Einkäufe.',
                '<b>Eine Ergänzung, keine Strategie:</b> Aufrundungssparen funktioniert gut neben einem gezielten Sparplan, erzeugt aber selten allein genug für größere Ziele wie die Altersvorsorge.',
            ],
            howto: [
                { question: 'Was ist ein realistischer durchschnittlicher Aufrundungsbetrag?', answer: '<p>Da Aufrundungen zufällig zwischen 0,01 $ und 0,99 $ liegen, beträgt der mathematische Durchschnitt 0,50 $ — viele verwenden 0,40-0,50 $ als vernünftige Schätzung.</p>' },
                { question: 'Sollte ich mich für ein bestimmtes Sparziel auf Aufrundungen verlassen?', answer: '<p>Aufrundungen funktionieren am besten als Ergänzung zu bewusstem Sparen — für ein bestimmtes Ziel mit Frist nutzen Sie einen speziellen Sparziel-Rechner.</p>' },
            ],
            inputs: [
                { name: 'transactions_per_month', label: 'Kartentransaktionen pro Monat', type: 'number', min: 0, max: 1000, placeholder: '60' },
                { name: 'avg_roundup', label: 'Durchschnittlicher Aufrundungsbetrag', type: 'number', unit: '$', min: 0, max: 1, placeholder: '0.45' },
            ],
            outputs: [
                { name: 'monthly_savings', label: 'Geschätzte Monatliche Ersparnisse', unit: '$', precision: 2 },
                { name: 'annual_savings', label: 'Geschätzte Jährliche Ersparnisse', unit: '$', precision: 2 },
            ],
        },
    },
}

export const tools: ToolDef[] = [savingsGoal, futureValueSavings, retirementSavings, collegeSavings, houseDownPayment, weddingSavings, carSavings, emergencyFund, cdCalculator, annualContribution, inflationAdjustedGoal, roundUpSavings]

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
        where: { tool_id_category_id: { tool_id: def.id, category_id: SAVING_INVESTING_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: SAVING_INVESTING_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} saving & investing calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
