// One-off script: seeds 9 new Health & Fitness calculators (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-health-fitness-calculators.ts
//
// Tool IDs 1004-1012, category_id '2' (Health & Fitness). All formulas are pure
// mathjs expressions via the shared JSON engine (core/engines/json.ts) - no
// custom engine code needed. Formulas: Mifflin-St Jeor (BMR), Navy method (body
// fat), Devine formula (ideal body weight), Karvonen formula (target heart
// rate), Epley formula (one-rep max) - all standard, well-known estimates.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HEALTH_FITNESS_CATEGORY_ID = '2'
const LOCALES = ['en', 'ru', 'lv', 'pl', 'es', 'fr', 'it', 'de']

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
// 1004: BMR Calculator (Mifflin-St Jeor formula)
// ============================================================
const bmr: ToolDef = {
    id: '1004',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'is_male', default: 1 },
            { key: 'weight_kg', default: 70 },
            { key: 'height_cm', default: 170 },
            { key: 'age', default: 30 },
        ],
        formulas: {
            bmr: '10*weight_kg + 6.25*height_cm - 5*age + (is_male == 1 ? 5 : -161)',
        },
        outputs: [{ key: 'bmr', precision: 0 }],
    },
    locales: {
        en: {
            slug: 'bmr-calculator-basal-metabolic-rate',
            title: 'BMR Calculator - Basal Metabolic Rate (Mifflin-St Jeor)',
            h1: 'BMR Calculator',
            meta_title: 'BMR Calculator | Basal Metabolic Rate (Mifflin-St Jeor)',
            meta_description: 'Calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation. Find out how many calories your body burns at rest based on weight, height, age, and sex.',
            short_answer: 'This BMR Calculator estimates the number of calories your body burns at complete rest each day, using the Mifflin-St Jeor equation — the formula most widely recommended by dietitians for its accuracy across body types.',
            intro_text: '<p>Basal Metabolic Rate (BMR) is the amount of energy your body needs to maintain basic physiological functions — breathing, circulation, cell production — while completely at rest. It typically accounts for 60-75% of total daily energy expenditure, making it the foundation of any calorie or weight-management plan.</p><p>This calculator applies the <b>Mifflin-St Jeor equation</b>, published in 1990 and now considered the most accurate widely-used BMR formula for the general population, replacing the older Harris-Benedict equation. It combines weight, height, age, and sex into a single linear formula, with a fixed offset depending on biological sex to account for differences in average body composition.</p><p><b>Dietitians and personal trainers</b> use BMR as the starting point before applying an activity multiplier to estimate total daily calorie needs. <b>Individuals tracking weight loss or gain</b> use it to set a realistic calorie floor, since eating consistently below BMR for extended periods can slow metabolism and is generally discouraged without medical supervision.</p>',
            key_points: [
                '<b>Mifflin-St Jeor Formula:</b> Considered more accurate than the older Harris-Benedict equation for most modern populations.',
                '<b>Rest-Only Estimate:</b> BMR reflects calories burned with zero activity — it does not include exercise or daily movement.',
                '<b>Foundation for TDEE:</b> BMR is multiplied by an activity factor to estimate Total Daily Energy Expenditure (see our TDEE Calculator).',
                '<b>Sex-Specific Offset:</b> The formula adds +5 for men and -161 for women to reflect average differences in muscle mass and body fat percentage.',
            ],
            howto: [
                { question: 'What is a normal BMR?', answer: '<p>Most adults have a BMR between 1,300 and 2,000 calories per day, depending on weight, height, age, and sex. Larger, younger, and more muscular individuals typically have a higher BMR.</p>' },
                { question: 'Should I eat exactly my BMR in calories?', answer: '<p>No. BMR represents calories burned at total rest. Your actual daily calorie needs (TDEE) are higher once activity is factored in — use our TDEE Calculator to get that number.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sex', type: 'select', description: 'Biological sex affects the formula offset.', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
                { name: 'weight_kg', label: 'Weight', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Height', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Age', type: 'number', unit: 'years', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Basal Metabolic Rate', unit: 'kcal/day', precision: 0 }],
        },
        ru: {
            slug: 'kalkulyator-bmr-bazovyy-obmen-veshchestv',
            title: 'Калькулятор BMR - Базовый обмен веществ (формула Миффлина-Сан Жеора)',
            h1: 'Калькулятор BMR (базового обмена веществ)',
            meta_title: 'Калькулятор BMR | Базовый обмен веществ (Миффлин-Сан Жеор)',
            meta_description: 'Рассчитайте свой базовый обмен веществ (BMR) по формуле Миффлина-Сан Жеора. Узнайте, сколько калорий сжигает организм в состоянии полного покоя.',
            short_answer: 'Этот калькулятор BMR оценивает количество калорий, которое ваш организм сжигает в состоянии полного покоя за день, используя формулу Миффлина-Сан Жеора — наиболее рекомендуемую диетологами благодаря точности для разных типов телосложения.',
            intro_text: '<p>Базовый обмен веществ (BMR) — это количество энергии, необходимое организму для поддержания основных физиологических функций (дыхание, кровообращение, обновление клеток) в состоянии полного покоя. Обычно он составляет 60-75% от общего суточного расхода энергии, что делает его основой любого плана по управлению весом.</p><p>Калькулятор использует <b>формулу Миффлина-Сан Жеора</b>, опубликованную в 1990 году и признанную сегодня наиболее точной для широкого населения, заменившую более старую формулу Харриса-Бенедикта. Она объединяет вес, рост, возраст и пол в одну линейную формулу с фиксированной поправкой в зависимости от пола.</p><p><b>Диетологи и тренеры</b> используют BMR как отправную точку перед применением коэффициента активности для оценки общего суточного расхода калорий. <b>Люди, следящие за весом</b>, используют это значение, чтобы не опускаться ниже разумного минимума калорий без медицинского наблюдения.</p>',
            key_points: [
                '<b>Формула Миффлина-Сан Жеора:</b> Считается более точной, чем устаревшая формула Харриса-Бенедикта, для большинства современных людей.',
                '<b>Оценка только в покое:</b> BMR отражает калории, сжигаемые без какой-либо активности — без учёта тренировок и повседневных движений.',
                '<b>Основа для TDEE:</b> BMR умножается на коэффициент активности для оценки общего суточного расхода энергии (см. наш калькулятор TDEE).',
                '<b>Поправка по полу:</b> Формула добавляет +5 для мужчин и -161 для женщин, отражая различия в мышечной массе и проценте жира.',
            ],
            howto: [
                { question: 'Какой BMR считается нормальным?', answer: '<p>У большинства взрослых BMR находится в диапазоне 1300-2000 калорий в день, в зависимости от веса, роста, возраста и пола.</p>' },
                { question: 'Нужно ли есть ровно столько калорий, сколько составляет BMR?', answer: '<p>Нет. BMR отражает расход калорий в полном покое. Реальная суточная потребность (TDEE) выше с учётом активности — используйте наш калькулятор TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Пол', type: 'select', description: 'Биологический пол влияет на поправку в формуле.', options: [{ value: '1', label: 'Мужской' }, { value: '0', label: 'Женский' }] },
                { name: 'weight_kg', label: 'Вес', type: 'number', unit: 'кг', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Рост', type: 'number', unit: 'см', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Базовый обмен веществ', unit: 'ккал/день', precision: 0 }],
        },
        lv: {
            slug: 'bmr-kalkulators-bazes-vielmaina',
            title: 'BMR kalkulators - Bazes metaboliskais rādītājs (Mifflin-St Jeor)',
            h1: 'BMR kalkulators',
            meta_title: 'BMR kalkulators | Bazes vielmaiņa (Mifflin-St Jeor)',
            meta_description: 'Aprēķiniet savu bazes metabolisko rādītāju (BMR), izmantojot Mifflin-St Jeor formulu. Uzziniet, cik kaloriju jūsu ķermenis sadedzina pilnīgā mierā.',
            short_answer: 'Šis BMR kalkulators novērtē kaloriju daudzumu, ko jūsu ķermenis sadedzina pilnīgā mierā dienā, izmantojot Mifflin-St Jeor formulu — dietologu visbiežāk ieteikto formulu tās precizitātes dēļ dažādiem ķermeņa tipiem.',
            intro_text: '<p>Bazes metaboliskais rādītājs (BMR) ir enerģijas daudzums, kas nepieciešams ķermenim, lai uzturētu pamata fizioloģiskās funkcijas — elpošanu, asinsriti, šūnu atjaunošanos — pilnīgā mierā. Tas parasti veido 60-75% no kopējā dienas enerģijas patēriņa, padarot to par jebkura svara pārvaldības plāna pamatu.</p><p>Kalkulators izmanto <b>Mifflin-St Jeor formulu</b>, kas publicēta 1990. gadā un tagad tiek uzskatīta par precīzāko plaši izmantoto BMR formulu, aizstājot vecāko Harris-Benedict formulu. Tā apvieno svaru, augumu, vecumu un dzimumu vienā lineārā formulā ar fiksētu korekciju atkarībā no dzimuma.</p><p><b>Dietologi un treneri</b> izmanto BMR kā sākumpunktu pirms aktivitātes koeficienta piemērošanas, lai novērtētu kopējo dienas kaloriju patēriņu. <b>Cilvēki, kas seko līdzi svaram</b>, izmanto šo vērtību, lai neietu zem saprātīga minimuma bez medicīniskas uzraudzības.</p>',
            key_points: [
                '<b>Mifflin-St Jeor formula:</b> Tiek uzskatīta par precīzāku nekā vecākā Harris-Benedict formula lielākajai daļai mūsdienu cilvēku.',
                '<b>Novērtējums tikai mierā:</b> BMR atspoguļo kalorijas, kas sadedzinātas bez jebkādas aktivitātes — neietverot treniņus vai ikdienas kustības.',
                '<b>Pamats TDEE:</b> BMR tiek reizināts ar aktivitātes koeficientu, lai novērtētu kopējo dienas enerģijas patēriņu (skatiet mūsu TDEE kalkulatoru).',
                '<b>Korekcija pēc dzimuma:</b> Formula pievieno +5 vīriešiem un -161 sievietēm, atspoguļojot atšķirības muskuļu masā un tauku procentā.',
            ],
            howto: [
                { question: 'Kāds BMR tiek uzskatīts par normālu?', answer: '<p>Lielākajai daļai pieaugušo BMR ir robežās no 1300 līdz 2000 kalorijām dienā, atkarībā no svara, auguma, vecuma un dzimuma.</p>' },
                { question: 'Vai jāēd tieši tik kaloriju, cik ir BMR?', answer: '<p>Nē. BMR atspoguļo kaloriju patēriņu pilnīgā mierā. Reālā dienas vajadzība (TDEE) ir augstāka, ņemot vērā aktivitāti — izmantojiet mūsu TDEE kalkulatoru.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Dzimums', type: 'select', description: 'Bioloģiskais dzimums ietekmē formulas korekciju.', options: [{ value: '1', label: 'Vīrietis' }, { value: '0', label: 'Sieviete' }] },
                { name: 'weight_kg', label: 'Svars', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Augums', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Vecums', type: 'number', unit: 'gadi', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Bazes metaboliskais rādītājs', unit: 'kcal/dienā', precision: 0 }],
        },
        pl: {
            slug: 'kalkulator-bmr-podstawowa-przemiana-materii',
            title: 'Kalkulator BMR - Podstawowa Przemiana Materii (Mifflin-St Jeor)',
            h1: 'Kalkulator BMR',
            meta_title: 'Kalkulator BMR | Podstawowa przemiana materii (Mifflin-St Jeor)',
            meta_description: 'Oblicz swoją podstawową przemianę materii (BMR) za pomocą wzoru Mifflina-St Jeora. Sprawdź, ile kalorii spala twój organizm w pełnym spoczynku.',
            short_answer: 'Ten kalkulator BMR szacuje liczbę kalorii, które twój organizm spala w pełnym spoczynku w ciągu dnia, wykorzystując wzór Mifflina-St Jeora — najczęściej zalecany przez dietetyków ze względu na dokładność dla różnych typów sylwetki.',
            intro_text: '<p>Podstawowa przemiana materii (BMR) to ilość energii potrzebnej organizmowi do utrzymania podstawowych funkcji fizjologicznych — oddychania, krążenia, odnowy komórek — w pełnym spoczynku. Zwykle stanowi 60-75% całkowitego dziennego wydatku energetycznego, co czyni ją podstawą każdego planu zarządzania wagą.</p><p>Kalkulator wykorzystuje <b>wzór Mifflina-St Jeora</b>, opublikowany w 1990 roku i uznawany obecnie za najdokładniejszy powszechnie stosowany wzór BMR, zastępujący starszy wzór Harrisa-Benedicta. Łączy on wagę, wzrost, wiek i płeć w jednym liniowym wzorze ze stałą korektą zależną od płci.</p><p><b>Dietetycy i trenerzy</b> używają BMR jako punktu wyjścia przed zastosowaniem mnożnika aktywności do oszacowania całkowitego dziennego zapotrzebowania kalorycznego. <b>Osoby monitorujące wagę</b> wykorzystują tę wartość, aby nie schodzić poniżej rozsądnego minimum bez nadzoru medycznego.</p>',
            key_points: [
                '<b>Wzór Mifflina-St Jeora:</b> Uznawany za dokładniejszy niż starszy wzór Harrisa-Benedicta dla większości współczesnych ludzi.',
                '<b>Szacunek tylko w spoczynku:</b> BMR odzwierciedla kalorie spalane bez żadnej aktywności — nie uwzględnia ćwiczeń ani codziennego ruchu.',
                '<b>Podstawa dla TDEE:</b> BMR jest mnożone przez współczynnik aktywności, aby oszacować całkowity dzienny wydatek energetyczny (zobacz nasz kalkulator TDEE).',
                '<b>Korekta zależna od płci:</b> Wzór dodaje +5 dla mężczyzn i -161 dla kobiet, odzwierciedlając różnice w masie mięśniowej i procencie tkanki tłuszczowej.',
            ],
            howto: [
                { question: 'Jakie BMR jest uważane za normalne?', answer: '<p>Większość dorosłych ma BMR między 1300 a 2000 kalorii dziennie, w zależności od wagi, wzrostu, wieku i płci.</p>' },
                { question: 'Czy powinienem jeść dokładnie tyle kalorii, ile wynosi BMR?', answer: '<p>Nie. BMR odzwierciedla spalanie kalorii w pełnym spoczynku. Rzeczywiste dzienne zapotrzebowanie (TDEE) jest wyższe po uwzględnieniu aktywności — użyj naszego kalkulatora TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Płeć', type: 'select', description: 'Płeć biologiczna wpływa na korektę we wzorze.', options: [{ value: '1', label: 'Mężczyzna' }, { value: '0', label: 'Kobieta' }] },
                { name: 'weight_kg', label: 'Waga', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Wzrost', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Wiek', type: 'number', unit: 'lat', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Podstawowa przemiana materii', unit: 'kcal/dzień', precision: 0 }],
        },
        es: {
            slug: 'calculadora-tmb-tasa-metabolica-basal',
            title: 'Calculadora de TMB - Tasa Metabólica Basal (Mifflin-St Jeor)',
            h1: 'Calculadora de TMB',
            meta_title: 'Calculadora de TMB | Tasa Metabólica Basal (Mifflin-St Jeor)',
            meta_description: 'Calcula tu Tasa Metabólica Basal (TMB) usando la ecuación de Mifflin-St Jeor. Descubre cuántas calorías quema tu cuerpo en reposo total.',
            short_answer: 'Esta calculadora de TMB estima el número de calorías que tu cuerpo quema en reposo total cada día, usando la ecuación de Mifflin-St Jeor — la fórmula más recomendada por nutricionistas por su precisión en distintos tipos de cuerpo.',
            intro_text: '<p>La Tasa Metabólica Basal (TMB) es la cantidad de energía que tu cuerpo necesita para mantener las funciones fisiológicas básicas —respiración, circulación, renovación celular— en reposo total. Normalmente representa el 60-75% del gasto energético diario total, lo que la convierte en la base de cualquier plan de control de peso.</p><p>Esta calculadora aplica la <b>ecuación de Mifflin-St Jeor</b>, publicada en 1990 y considerada hoy la fórmula de TMB más precisa para la población general, reemplazando a la antigua ecuación de Harris-Benedict. Combina peso, altura, edad y sexo en una única fórmula lineal, con un ajuste fijo según el sexo biológico.</p><p><b>Nutricionistas y entrenadores personales</b> usan la TMB como punto de partida antes de aplicar un multiplicador de actividad para estimar las necesidades calóricas diarias totales. <b>Quienes controlan su peso</b> usan este valor para no bajar de un mínimo razonable sin supervisión médica.</p>',
            key_points: [
                '<b>Ecuación de Mifflin-St Jeor:</b> Considerada más precisa que la antigua ecuación de Harris-Benedict para la mayoría de la población actual.',
                '<b>Estimación solo en reposo:</b> La TMB refleja las calorías quemadas sin actividad alguna — no incluye ejercicio ni movimiento diario.',
                '<b>Base para el GET:</b> La TMB se multiplica por un factor de actividad para estimar el Gasto Energético Total diario (ver nuestra Calculadora de GET).',
                '<b>Ajuste según sexo:</b> La fórmula añade +5 para hombres y -161 para mujeres, reflejando diferencias en masa muscular y porcentaje de grasa.',
            ],
            howto: [
                { question: '¿Qué TMB se considera normal?', answer: '<p>La mayoría de los adultos tienen una TMB entre 1300 y 2000 calorías al día, dependiendo del peso, altura, edad y sexo.</p>' },
                { question: '¿Debo comer exactamente las calorías de mi TMB?', answer: '<p>No. La TMB refleja el gasto calórico en reposo total. Tu necesidad diaria real (GET) es mayor una vez considerada la actividad — usa nuestra Calculadora de GET.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexo', type: 'select', description: 'El sexo biológico afecta el ajuste de la fórmula.', options: [{ value: '1', label: 'Hombre' }, { value: '0', label: 'Mujer' }] },
                { name: 'weight_kg', label: 'Peso', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Altura', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Edad', type: 'number', unit: 'años', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Tasa Metabólica Basal', unit: 'kcal/día', precision: 0 }],
        },
        fr: {
            slug: 'calculateur-mb-metabolisme-de-base',
            title: 'Calculateur de Métabolisme de Base (MB) - Formule Mifflin-St Jeor',
            h1: 'Calculateur de Métabolisme de Base',
            meta_title: 'Calculateur MB | Métabolisme de Base (Mifflin-St Jeor)',
            meta_description: 'Calculez votre métabolisme de base (MB) avec l’équation de Mifflin-St Jeor. Découvrez combien de calories votre corps brûle au repos complet.',
            short_answer: 'Ce calculateur estime le nombre de calories que votre corps brûle au repos complet chaque jour, en utilisant l’équation de Mifflin-St Jeor — la formule la plus recommandée par les diététiciens pour sa précision selon les morphologies.',
            intro_text: '<p>Le métabolisme de base (MB) est la quantité d’énergie dont votre corps a besoin pour maintenir les fonctions physiologiques essentielles — respiration, circulation, renouvellement cellulaire — au repos complet. Il représente généralement 60 à 75 % de la dépense énergétique quotidienne totale, ce qui en fait la base de tout plan de gestion du poids.</p><p>Ce calculateur applique l’<b>équation de Mifflin-St Jeor</b>, publiée en 1990 et considérée aujourd’hui comme la formule de MB la plus précise pour la population générale, remplaçant l’ancienne équation de Harris-Benedict. Elle combine le poids, la taille, l’âge et le sexe en une seule formule linéaire, avec un ajustement fixe selon le sexe biologique.</p><p><b>Diététiciens et entraîneurs</b> utilisent le MB comme point de départ avant d’appliquer un facteur d’activité pour estimer les besoins caloriques quotidiens totaux. <b>Les personnes suivant leur poids</b> utilisent cette valeur pour ne pas descendre sous un minimum raisonnable sans suivi médical.</p>',
            key_points: [
                '<b>Équation de Mifflin-St Jeor :</b> Considérée plus précise que l’ancienne équation de Harris-Benedict pour la plupart des populations actuelles.',
                '<b>Estimation au repos uniquement :</b> Le MB reflète les calories brûlées sans aucune activité — il n’inclut ni l’exercice ni le mouvement quotidien.',
                '<b>Base du DEET :</b> Le MB est multiplié par un facteur d’activité pour estimer la dépense énergétique totale quotidienne (voir notre calculateur DEET).',
                '<b>Ajustement selon le sexe :</b> La formule ajoute +5 pour les hommes et -161 pour les femmes, reflétant les différences de masse musculaire et de taux de graisse.',
            ],
            howto: [
                { question: 'Quel MB est considéré comme normal ?', answer: '<p>La plupart des adultes ont un MB compris entre 1300 et 2000 calories par jour, selon le poids, la taille, l’âge et le sexe.</p>' },
                { question: 'Dois-je manger exactement mon MB en calories ?', answer: '<p>Non. Le MB reflète la dépense calorique au repos complet. Votre besoin quotidien réel (DEET) est plus élevé une fois l’activité prise en compte — utilisez notre calculateur DEET.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexe', type: 'select', description: 'Le sexe biologique affecte l’ajustement de la formule.', options: [{ value: '1', label: 'Homme' }, { value: '0', label: 'Femme' }] },
                { name: 'weight_kg', label: 'Poids', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Taille', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Âge', type: 'number', unit: 'ans', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Métabolisme de base', unit: 'kcal/jour', precision: 0 }],
        },
        it: {
            slug: 'calcolatore-mb-metabolismo-basale',
            title: 'Calcolatore del Metabolismo Basale (MB) - Formula Mifflin-St Jeor',
            h1: 'Calcolatore del Metabolismo Basale',
            meta_title: 'Calcolatore MB | Metabolismo Basale (Mifflin-St Jeor)',
            meta_description: 'Calcola il tuo metabolismo basale (MB) con l’equazione di Mifflin-St Jeor. Scopri quante calorie brucia il tuo corpo a riposo completo.',
            short_answer: 'Questo calcolatore stima il numero di calorie che il tuo corpo brucia a riposo completo ogni giorno, usando l’equazione di Mifflin-St Jeor — la formula più raccomandata dai dietologi per la sua precisione su diverse corporature.',
            intro_text: '<p>Il metabolismo basale (MB) è la quantità di energia necessaria al corpo per mantenere le funzioni fisiologiche essenziali — respirazione, circolazione, rinnovamento cellulare — a riposo completo. In genere rappresenta il 60-75% della spesa energetica giornaliera totale, rendendolo la base di qualsiasi piano di gestione del peso.</p><p>Questo calcolatore applica l’<b>equazione di Mifflin-St Jeor</b>, pubblicata nel 1990 e oggi considerata la formula MB più accurata per la popolazione generale, sostituendo la precedente equazione di Harris-Benedict. Combina peso, altezza, età e sesso in un’unica formula lineare, con una correzione fissa in base al sesso biologico.</p><p><b>Dietologi e personal trainer</b> usano il MB come punto di partenza prima di applicare un fattore di attività per stimare il fabbisogno calorico giornaliero totale. <b>Chi monitora il proprio peso</b> usa questo valore per non scendere sotto un minimo ragionevole senza supervisione medica.</p>',
            key_points: [
                '<b>Equazione di Mifflin-St Jeor:</b> Considerata più accurata della precedente equazione di Harris-Benedict per la maggior parte delle persone oggi.',
                '<b>Stima solo a riposo:</b> Il MB riflette le calorie bruciate senza alcuna attività — non include esercizio o movimento quotidiano.',
                '<b>Base per il TDEE:</b> Il MB viene moltiplicato per un fattore di attività per stimare la spesa energetica totale giornaliera (vedi il nostro Calcolatore TDEE).',
                '<b>Correzione per sesso:</b> La formula aggiunge +5 per gli uomini e -161 per le donne, riflettendo le differenze nella massa muscolare e nella percentuale di grasso.',
            ],
            howto: [
                { question: 'Quale MB è considerato normale?', answer: '<p>La maggior parte degli adulti ha un MB tra 1300 e 2000 calorie al giorno, a seconda di peso, altezza, età e sesso.</p>' },
                { question: 'Devo mangiare esattamente le calorie del mio MB?', answer: '<p>No. Il MB riflette il dispendio calorico a riposo completo. Il tuo reale fabbisogno giornaliero (TDEE) è più alto una volta considerata l’attività — usa il nostro Calcolatore TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sesso', type: 'select', description: 'Il sesso biologico influisce sulla correzione della formula.', options: [{ value: '1', label: 'Uomo' }, { value: '0', label: 'Donna' }] },
                { name: 'weight_kg', label: 'Peso', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Altezza', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Età', type: 'number', unit: 'anni', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Metabolismo Basale', unit: 'kcal/giorno', precision: 0 }],
        },
        de: {
            slug: 'grundumsatz-rechner-bmr',
            title: 'Grundumsatz-Rechner (BMR) - Mifflin-St Jeor Formel',
            h1: 'Grundumsatz-Rechner',
            meta_title: 'Grundumsatz-Rechner | BMR nach Mifflin-St Jeor',
            meta_description: 'Berechnen Sie Ihren Grundumsatz (BMR) mit der Mifflin-St-Jeor-Gleichung. Finden Sie heraus, wie viele Kalorien Ihr Körper in völliger Ruhe verbrennt.',
            short_answer: 'Dieser Grundumsatz-Rechner schätzt, wie viele Kalorien Ihr Körper täglich in völliger Ruhe verbrennt, mit der Mifflin-St-Jeor-Gleichung — der von Ernährungsberatern am häufigsten empfohlenen Formel wegen ihrer Genauigkeit über verschiedene Körpertypen hinweg.',
            intro_text: '<p>Der Grundumsatz (BMR) ist die Energiemenge, die Ihr Körper benötigt, um grundlegende physiologische Funktionen — Atmung, Kreislauf, Zellerneuerung — in völliger Ruhe aufrechtzuerhalten. Er macht in der Regel 60-75 % des gesamten täglichen Energieverbrauchs aus und bildet damit die Grundlage jedes Kalorien- oder Gewichtsmanagementplans.</p><p>Dieser Rechner verwendet die <b>Mifflin-St-Jeor-Gleichung</b>, die 1990 veröffentlicht wurde und heute als die genaueste weit verbreitete BMR-Formel für die Allgemeinbevölkerung gilt und die ältere Harris-Benedict-Gleichung ersetzt. Sie kombiniert Gewicht, Größe, Alter und Geschlecht in einer linearen Formel mit einem festen Ausgleich je nach biologischem Geschlecht.</p><p><b>Ernährungsberater und Personal Trainer</b> nutzen den BMR als Ausgangspunkt, bevor ein Aktivitätsfaktor angewendet wird, um den gesamten täglichen Kalorienbedarf zu schätzen. <b>Personen, die ihr Gewicht überwachen</b>, nutzen diesen Wert, um ohne ärztliche Begleitung nicht unter ein sinnvolles Minimum zu fallen.</p>',
            key_points: [
                '<b>Mifflin-St-Jeor-Gleichung:</b> Gilt als genauer als die ältere Harris-Benedict-Gleichung für die meisten Menschen heute.',
                '<b>Nur Ruheschätzung:</b> Der BMR spiegelt Kalorien wider, die ohne jegliche Aktivität verbrannt werden — Sport und alltägliche Bewegung sind nicht enthalten.',
                '<b>Grundlage für den Gesamtumsatz:</b> Der BMR wird mit einem Aktivitätsfaktor multipliziert, um den gesamten täglichen Energieverbrauch zu schätzen (siehe unseren Gesamtumsatz-Rechner).',
                '<b>Geschlechtsspezifischer Ausgleich:</b> Die Formel addiert +5 für Männer und -161 für Frauen, was Unterschiede in Muskelmasse und Körperfettanteil widerspiegelt.',
            ],
            howto: [
                { question: 'Welcher BMR gilt als normal?', answer: '<p>Die meisten Erwachsenen haben einen BMR zwischen 1300 und 2000 Kalorien pro Tag, abhängig von Gewicht, Größe, Alter und Geschlecht.</p>' },
                { question: 'Sollte ich genau meinen BMR an Kalorien essen?', answer: '<p>Nein. Der BMR spiegelt den Kalorienverbrauch in völliger Ruhe wider. Ihr tatsächlicher täglicher Bedarf (Gesamtumsatz) ist höher, sobald Aktivität berücksichtigt wird — nutzen Sie unseren Gesamtumsatz-Rechner.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Geschlecht', type: 'select', description: 'Das biologische Geschlecht beeinflusst den Ausgleich in der Formel.', options: [{ value: '1', label: 'Männlich' }, { value: '0', label: 'Weiblich' }] },
                { name: 'weight_kg', label: 'Gewicht', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Größe', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Alter', type: 'number', unit: 'Jahre', min: 1, max: 120, placeholder: '30' },
            ],
            outputs: [{ name: 'bmr', label: 'Grundumsatz', unit: 'kcal/Tag', precision: 0 }],
        },
    },
}

// ============================================================
// 1005: TDEE Calculator (Total Daily Energy Expenditure)
// ============================================================
const tdee: ToolDef = {
    id: '1005',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'is_male', default: 1 },
            { key: 'weight_kg', default: 70 },
            { key: 'height_cm', default: 170 },
            { key: 'age', default: 30 },
            { key: 'activity_multiplier', default: 1.2 },
        ],
        formulas: {
            bmr: '10*weight_kg + 6.25*height_cm - 5*age + (is_male == 1 ? 5 : -161)',
            tdee: '(10*weight_kg + 6.25*height_cm - 5*age + (is_male == 1 ? 5 : -161)) * activity_multiplier',
        },
        outputs: [
            { key: 'bmr', precision: 0 },
            { key: 'tdee', precision: 0 },
        ],
    },
    locales: {
        en: {
            slug: 'tdee-calculator-total-daily-energy-expenditure',
            title: 'TDEE Calculator - Total Daily Energy Expenditure',
            h1: 'TDEE Calculator',
            meta_title: 'TDEE Calculator | Total Daily Energy Expenditure',
            meta_description: 'Calculate your Total Daily Energy Expenditure (TDEE) — the calories you burn per day including activity. Based on the Mifflin-St Jeor BMR formula and standard activity multipliers.',
            short_answer: 'This TDEE Calculator estimates the total number of calories you burn in a day, including your activity level — the number to use for setting a calorie target for weight loss, maintenance, or gain.',
            intro_text: '<p>Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns in a day, combining your Basal Metabolic Rate (BMR) with the energy spent on physical activity, digestion, and daily movement. It is the single most useful number for planning a calorie intake target.</p><p>This calculator first computes BMR using the <b>Mifflin-St Jeor equation</b>, then multiplies it by an <b>activity multiplier</b> ranging from 1.2 (sedentary, little or no exercise) to 1.9 (very active, physical job or twice-daily training) — a method popularized by fitness researchers and widely used in nutrition coaching.</p><p><b>Anyone planning a diet</b> starts here: eating below TDEE creates a calorie deficit for weight loss, eating at TDEE maintains weight, and eating above it supports muscle gain. <b>Coaches and nutritionists</b> use TDEE as the baseline before adjusting for individual response over time.</p>',
            key_points: [
                '<b>Combines BMR + Activity:</b> Multiplies your Basal Metabolic Rate by an activity factor to estimate real-world daily calorie burn.',
                '<b>Five Activity Levels:</b> From sedentary (1.2x) to very active (1.9x), covering desk jobs through twice-daily athletic training.',
                '<b>Basis for Diet Planning:</b> Subtract ~500 kcal/day from TDEE for roughly 0.5 kg/week of fat loss; add ~300-500 kcal/day for lean gain.',
                '<b>Estimate, Not Exact:</b> Individual metabolism varies — treat the result as a starting point to adjust based on real-world weight trends.',
            ],
            howto: [
                { question: 'How many calories should I eat to lose weight?', answer: '<p>Start by subtracting roughly 500 calories/day from your TDEE for sustainable fat loss of about 0.5 kg (1 lb) per week, then adjust based on your actual progress over 2-3 weeks.</p>' },
                { question: 'Which activity level should I choose?', answer: '<p>Be honest — "sedentary" means a desk job with little to no exercise. Most people overestimate their activity level, which leads to overeating relative to their real TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sex', type: 'select', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
                { name: 'weight_kg', label: 'Weight', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Height', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Age', type: 'number', unit: 'years', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Activity Level', type: 'select', options: [
                    { value: '1.2', label: 'Sedentary (little/no exercise)' },
                    { value: '1.375', label: 'Light (1-3 days/week)' },
                    { value: '1.55', label: 'Moderate (3-5 days/week)' },
                    { value: '1.725', label: 'Active (6-7 days/week)' },
                    { value: '1.9', label: 'Very Active (physical job or 2x/day)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'BMR (rest only)', unit: 'kcal/day', precision: 0 },
                { name: 'tdee', label: 'TDEE (total daily burn)', unit: 'kcal/day', precision: 0 },
            ],
        },
        ru: {
            slug: 'kalkulyator-tdee-obshchiy-raskhod-energii',
            title: 'Калькулятор TDEE - Общий суточный расход энергии',
            h1: 'Калькулятор TDEE',
            meta_title: 'Калькулятор TDEE | Общий суточный расход энергии',
            meta_description: 'Рассчитайте свой общий суточный расход энергии (TDEE) — калории, сжигаемые за день с учётом активности. На основе формулы BMR Миффлина-Сан Жеора.',
            short_answer: 'Этот калькулятор TDEE оценивает общее количество калорий, которое вы сжигаете за день с учётом уровня активности — число, которое используется для расчёта нормы калорий при похудении, поддержании веса или наборе массы.',
            intro_text: '<p>Общий суточный расход энергии (TDEE) — это общее количество калорий, которое ваш организм сжигает за день, объединяя базовый обмен веществ (BMR) с энергией, затрачиваемой на физическую активность, пищеварение и повседневные движения. Это самое полезное число для планирования нормы калорий.</p><p>Калькулятор сначала вычисляет BMR по <b>формуле Миффлина-Сан Жеора</b>, затем умножает его на <b>коэффициент активности</b> — от 1.2 (сидячий образ жизни) до 1.9 (очень высокая активность, физическая работа или тренировки дважды в день).</p><p><b>Любой, кто планирует диету</b>, начинает отсюда: калории ниже TDEE создают дефицит для похудения, на уровне TDEE — вес поддерживается, выше — способствует набору массы. <b>Тренеры и нутрициологи</b> используют TDEE как базовое значение перед корректировкой.</p>',
            key_points: [
                '<b>BMR + Активность:</b> Умножает базовый обмен веществ на коэффициент активности для оценки реального суточного расхода калорий.',
                '<b>Пять уровней активности:</b> От сидячего (1.2x) до очень активного (1.9x), охватывая офисную работу и тренировки дважды в день.',
                '<b>Основа для планирования диеты:</b> Вычтите ~500 ккал/день из TDEE для потери ~0.5 кг жира в неделю; добавьте ~300-500 ккал/день для набора массы.',
                '<b>Оценка, не точное значение:</b> Индивидуальный обмен веществ отличается — используйте результат как отправную точку и корректируйте по реальной динамике веса.',
            ],
            howto: [
                { question: 'Сколько калорий нужно есть для похудения?', answer: '<p>Начните с вычитания ~500 калорий в день из вашего TDEE для устойчивого похудения на ~0.5 кг в неделю, затем корректируйте по прогрессу за 2-3 недели.</p>' },
                { question: 'Какой уровень активности выбрать?', answer: '<p>Будьте честны — «сидячий» означает офисную работу почти без тренировок. Большинство людей переоценивают свою активность, что приводит к перееданию относительно реального TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Пол', type: 'select', options: [{ value: '1', label: 'Мужской' }, { value: '0', label: 'Женский' }] },
                { name: 'weight_kg', label: 'Вес', type: 'number', unit: 'кг', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Рост', type: 'number', unit: 'см', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Уровень активности', type: 'select', options: [
                    { value: '1.2', label: 'Сидячий (мало/нет тренировок)' },
                    { value: '1.375', label: 'Лёгкий (1-3 дня/неделю)' },
                    { value: '1.55', label: 'Умеренный (3-5 дней/неделю)' },
                    { value: '1.725', label: 'Активный (6-7 дней/неделю)' },
                    { value: '1.9', label: 'Очень активный (физ. работа или 2 раза в день)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'BMR (только покой)', unit: 'ккал/день', precision: 0 },
                { name: 'tdee', label: 'TDEE (общий расход)', unit: 'ккал/день', precision: 0 },
            ],
        },
        lv: {
            slug: 'tdee-kalkulators-kopejais-energijas-paterins',
            title: 'TDEE kalkulators - Kopējais dienas enerģijas patēriņš',
            h1: 'TDEE kalkulators',
            meta_title: 'TDEE kalkulators | Kopējais dienas enerģijas patēriņš',
            meta_description: 'Aprēķiniet savu kopējo dienas enerģijas patēriņu (TDEE) — kalorijas, ko sadedzināt dienā, ieskaitot aktivitāti. Balstīts uz Mifflin-St Jeor BMR formulu.',
            short_answer: 'Šis TDEE kalkulators novērtē kopējo kaloriju skaitu, ko sadedzināt dienā, ieskaitot aktivitātes līmeni — skaitli, ko izmantot kaloriju normas noteikšanai svara zaudēšanai, uzturēšanai vai palielināšanai.',
            intro_text: '<p>Kopējais dienas enerģijas patēriņš (TDEE) ir kopējais kaloriju skaits, ko jūsu ķermenis sadedzina dienā, apvienojot bazes metabolismu (BMR) ar enerģiju, kas tērēta fiziskajai aktivitātei, gremošanai un ikdienas kustībām. Tas ir noderīgākais skaitlis kaloriju normas plānošanai.</p><p>Kalkulators vispirms aprēķina BMR, izmantojot <b>Mifflin-St Jeor formulu</b>, tad reizina to ar <b>aktivitātes koeficientu</b> no 1.2 (mazkustīgs dzīvesveids) līdz 1.9 (ļoti aktīvs, fizisks darbs vai treniņi divreiz dienā).</p><p><b>Ikviens, kas plāno diētu</b>, sāk no šejienes: kalorijas zem TDEE rada deficītu svara zaudēšanai, TDEE līmenī svars tiek uzturēts, virs tā — veicina masas pieaugumu. <b>Treneri un uztura speciālisti</b> izmanto TDEE kā bāzes vērtību pirms korekcijas.</p>',
            key_points: [
                '<b>BMR + Aktivitāte:</b> Reizina bazes metabolismu ar aktivitātes koeficientu, lai novērtētu reālo dienas kaloriju patēriņu.',
                '<b>Pieci aktivitātes līmeņi:</b> No mazkustīga (1.2x) līdz ļoti aktīvam (1.9x), aptverot biroja darbu un treniņus divreiz dienā.',
                '<b>Diētas plānošanas pamats:</b> Atņemiet ~500 kcal/dienā no TDEE, lai zaudētu ~0.5 kg tauku nedēļā; pievienojiet ~300-500 kcal/dienā masas pieaugumam.',
                '<b>Novērtējums, ne precīza vērtība:</b> Individuālais metabolisms atšķiras — izmantojiet rezultātu kā sākumpunktu un koriģējiet pēc reālās svara dinamikas.',
            ],
            howto: [
                { question: 'Cik kaloriju jāēd, lai zaudētu svaru?', answer: '<p>Sāciet, atņemot ~500 kalorijas dienā no TDEE ilgtspējīgai ~0.5 kg tauku zaudēšanai nedēļā, tad koriģējiet pēc progresa 2-3 nedēļu laikā.</p>' },
                { question: 'Kādu aktivitātes līmeni izvēlēties?', answer: '<p>Esiet godīgi — "mazkustīgs" nozīmē biroja darbu ar maz vai bez treniņiem. Lielākā daļa cilvēku pārvērtē savu aktivitāti, kas noved pie pārēšanās attiecībā pret reālo TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Dzimums', type: 'select', options: [{ value: '1', label: 'Vīrietis' }, { value: '0', label: 'Sieviete' }] },
                { name: 'weight_kg', label: 'Svars', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Augums', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Vecums', type: 'number', unit: 'gadi', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Aktivitātes līmenis', type: 'select', options: [
                    { value: '1.2', label: 'Mazkustīgs (maz/nav treniņu)' },
                    { value: '1.375', label: 'Viegls (1-3 dienas/nedēļā)' },
                    { value: '1.55', label: 'Mērens (3-5 dienas/nedēļā)' },
                    { value: '1.725', label: 'Aktīvs (6-7 dienas/nedēļā)' },
                    { value: '1.9', label: 'Ļoti aktīvs (fizisks darbs vai 2x/dienā)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'BMR (tikai miers)', unit: 'kcal/dienā', precision: 0 },
                { name: 'tdee', label: 'TDEE (kopējais patēriņš)', unit: 'kcal/dienā', precision: 0 },
            ],
        },
        pl: {
            slug: 'kalkulator-tdee-calkowita-przemiana-materii',
            title: 'Kalkulator TDEE - Całkowita Dzienna Przemiana Materii',
            h1: 'Kalkulator TDEE',
            meta_title: 'Kalkulator TDEE | Całkowita dzienna przemiana materii',
            meta_description: 'Oblicz swoje całkowite dzienne zapotrzebowanie energetyczne (TDEE) — kalorie spalane dziennie z uwzględnieniem aktywności. Na podstawie wzoru BMR Mifflina-St Jeora.',
            short_answer: 'Ten kalkulator TDEE szacuje całkowitą liczbę kalorii spalanych w ciągu dnia, uwzględniając poziom aktywności — liczbę używaną do ustalenia celu kalorycznego przy odchudzaniu, utrzymaniu wagi lub budowaniu masy.',
            intro_text: '<p>Całkowita dzienna przemiana materii (TDEE) to łączna liczba kalorii, które organizm spala w ciągu dnia, łącząc podstawową przemianę materii (BMR) z energią wydatkowaną na aktywność fizyczną, trawienie i codzienny ruch. To najbardziej użyteczna liczba do planowania celu kalorycznego.</p><p>Kalkulator najpierw oblicza BMR za pomocą <b>wzoru Mifflina-St Jeora</b>, a następnie mnoży go przez <b>współczynnik aktywności</b> od 1,2 (siedzący tryb życia) do 1,9 (bardzo aktywny, praca fizyczna lub treningi dwa razy dziennie).</p><p><b>Każdy planujący dietę</b> zaczyna właśnie tutaj: kalorie poniżej TDEE tworzą deficyt do odchudzania, na poziomie TDEE waga jest utrzymywana, powyżej — sprzyja budowaniu masy. <b>Trenerzy i dietetycy</b> używają TDEE jako wartości bazowej przed korektą.</p>',
            key_points: [
                '<b>BMR + Aktywność:</b> Mnoży podstawową przemianę materii przez współczynnik aktywności, aby oszacować rzeczywiste dzienne spalanie kalorii.',
                '<b>Pięć poziomów aktywności:</b> Od siedzącego (1,2x) do bardzo aktywnego (1,9x), obejmując pracę biurową i treningi dwa razy dziennie.',
                '<b>Podstawa planowania diety:</b> Odejmij ~500 kcal/dzień od TDEE dla ~0,5 kg utraty tłuszczu tygodniowo; dodaj ~300-500 kcal/dzień dla budowy masy.',
                '<b>Szacunek, nie dokładna wartość:</b> Indywidualny metabolizm się różni — traktuj wynik jako punkt wyjścia do korekty na podstawie rzeczywistych trendów wagi.',
            ],
            howto: [
                { question: 'Ile kalorii jeść, aby schudnąć?', answer: '<p>Zacznij od odjęcia ~500 kalorii dziennie od TDEE dla zrównoważonej utraty ~0,5 kg tygodniowo, następnie koryguj na podstawie postępów po 2-3 tygodniach.</p>' },
                { question: 'Jaki poziom aktywności wybrać?', answer: '<p>Bądź szczery — "siedzący" oznacza pracę biurową z małą lub żadną aktywnością fizyczną. Większość ludzi zawyża swój poziom aktywności, co prowadzi do przejadania się względem rzeczywistego TDEE.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Płeć', type: 'select', options: [{ value: '1', label: 'Mężczyzna' }, { value: '0', label: 'Kobieta' }] },
                { name: 'weight_kg', label: 'Waga', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Wzrost', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Wiek', type: 'number', unit: 'lat', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Poziom aktywności', type: 'select', options: [
                    { value: '1.2', label: 'Siedzący (mało/brak ćwiczeń)' },
                    { value: '1.375', label: 'Lekki (1-3 dni/tydzień)' },
                    { value: '1.55', label: 'Umiarkowany (3-5 dni/tydzień)' },
                    { value: '1.725', label: 'Aktywny (6-7 dni/tydzień)' },
                    { value: '1.9', label: 'Bardzo aktywny (praca fizyczna lub 2x/dzień)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'BMR (tylko spoczynek)', unit: 'kcal/dzień', precision: 0 },
                { name: 'tdee', label: 'TDEE (całkowite spalanie)', unit: 'kcal/dzień', precision: 0 },
            ],
        },
        es: {
            slug: 'calculadora-get-gasto-energetico-total',
            title: 'Calculadora de GET - Gasto Energético Total Diario',
            h1: 'Calculadora de GET (TDEE)',
            meta_title: 'Calculadora de GET | Gasto Energético Total Diario',
            meta_description: 'Calcula tu Gasto Energético Total Diario (GET/TDEE) — las calorías que quemas al día incluyendo actividad. Basado en la fórmula TMB de Mifflin-St Jeor.',
            short_answer: 'Esta calculadora de GET estima el número total de calorías que quemas en un día, incluyendo tu nivel de actividad — el número a usar para fijar un objetivo calórico de pérdida, mantenimiento o aumento de peso.',
            intro_text: '<p>El Gasto Energético Total Diario (GET o TDEE) es el número total de calorías que tu cuerpo quema en un día, combinando tu Tasa Metabólica Basal (TMB) con la energía gastada en actividad física, digestión y movimiento diario. Es el número más útil para planificar un objetivo de ingesta calórica.</p><p>Esta calculadora primero calcula la TMB usando la <b>ecuación de Mifflin-St Jeor</b>, luego la multiplica por un <b>factor de actividad</b> que va de 1,2 (sedentario) a 1,9 (muy activo, trabajo físico o entrenamiento dos veces al día).</p><p><b>Cualquiera que planifique una dieta</b> empieza aquí: comer por debajo del GET crea un déficit para perder peso, comer al nivel del GET mantiene el peso, y comer por encima favorece la ganancia muscular. <b>Entrenadores y nutricionistas</b> usan el GET como base antes de ajustar.</p>',
            key_points: [
                '<b>TMB + Actividad:</b> Multiplica tu Tasa Metabólica Basal por un factor de actividad para estimar el gasto calórico diario real.',
                '<b>Cinco niveles de actividad:</b> Desde sedentario (1,2x) hasta muy activo (1,9x), cubriendo trabajos de oficina y entrenamientos dos veces al día.',
                '<b>Base para planificar la dieta:</b> Resta ~500 kcal/día del GET para perder ~0,5 kg de grasa por semana; suma ~300-500 kcal/día para ganancia magra.',
                '<b>Estimación, no exacta:</b> El metabolismo individual varía — usa el resultado como punto de partida y ajusta según tu progreso real de peso.',
            ],
            howto: [
                { question: '¿Cuántas calorías debo comer para perder peso?', answer: '<p>Empieza restando ~500 calorías/día de tu GET para una pérdida sostenible de ~0,5 kg por semana, luego ajusta según tu progreso real en 2-3 semanas.</p>' },
                { question: '¿Qué nivel de actividad debo elegir?', answer: '<p>Sé honesto — "sedentario" significa un trabajo de oficina con poco o ningún ejercicio. La mayoría sobrestima su nivel de actividad, lo que lleva a comer de más respecto a su GET real.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexo', type: 'select', options: [{ value: '1', label: 'Hombre' }, { value: '0', label: 'Mujer' }] },
                { name: 'weight_kg', label: 'Peso', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Altura', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Edad', type: 'number', unit: 'años', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Nivel de Actividad', type: 'select', options: [
                    { value: '1.2', label: 'Sedentario (poco/nada de ejercicio)' },
                    { value: '1.375', label: 'Ligero (1-3 días/semana)' },
                    { value: '1.55', label: 'Moderado (3-5 días/semana)' },
                    { value: '1.725', label: 'Activo (6-7 días/semana)' },
                    { value: '1.9', label: 'Muy Activo (trabajo físico o 2x/día)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'TMB (solo reposo)', unit: 'kcal/día', precision: 0 },
                { name: 'tdee', label: 'GET (gasto total diario)', unit: 'kcal/día', precision: 0 },
            ],
        },
        fr: {
            slug: 'calculateur-deet-depense-energetique-totale',
            title: 'Calculateur DEET - Dépense Énergétique Totale Quotidienne',
            h1: 'Calculateur DEET (TDEE)',
            meta_title: 'Calculateur DEET | Dépense Énergétique Totale Quotidienne',
            meta_description: 'Calculez votre dépense énergétique totale quotidienne (DEET/TDEE) — les calories brûlées par jour, activité incluse. Basé sur la formule MB de Mifflin-St Jeor.',
            short_answer: 'Ce calculateur DEET estime le nombre total de calories que vous brûlez en une journée, activité incluse — le chiffre à utiliser pour fixer un objectif calorique de perte, maintien ou prise de poids.',
            intro_text: '<p>La dépense énergétique totale quotidienne (DEET ou TDEE) est le nombre total de calories que votre corps brûle en une journée, combinant votre métabolisme de base (MB) avec l’énergie dépensée pour l’activité physique, la digestion et le mouvement quotidien. C’est le chiffre le plus utile pour planifier un objectif d’apport calorique.</p><p>Ce calculateur calcule d’abord le MB via l’<b>équation de Mifflin-St Jeor</b>, puis le multiplie par un <b>facteur d’activité</b> allant de 1,2 (sédentaire) à 1,9 (très actif, travail physique ou entraînement deux fois par jour).</p><p><b>Quiconque planifie un régime</b> commence ici : manger en dessous du DEET crée un déficit pour perdre du poids, manger au niveau du DEET maintient le poids, et manger au-dessus favorise la prise de muscle. <b>Coachs et nutritionnistes</b> utilisent le DEET comme référence avant ajustement.</p>',
            key_points: [
                '<b>MB + Activité :</b> Multiplie votre métabolisme de base par un facteur d’activité pour estimer la dépense calorique quotidienne réelle.',
                '<b>Cinq niveaux d’activité :</b> De sédentaire (1,2x) à très actif (1,9x), couvrant travail de bureau et entraînements deux fois par jour.',
                '<b>Base de planification alimentaire :</b> Soustrayez ~500 kcal/jour du DEET pour perdre ~0,5 kg de graisse par semaine ; ajoutez ~300-500 kcal/jour pour une prise de muscle.',
                '<b>Estimation, pas une valeur exacte :</b> Le métabolisme individuel varie — utilisez le résultat comme point de départ à ajuster selon votre évolution réelle de poids.',
            ],
            howto: [
                { question: 'Combien de calories dois-je manger pour perdre du poids ?', answer: '<p>Commencez par soustraire ~500 calories/jour de votre DEET pour une perte durable d’environ 0,5 kg par semaine, puis ajustez selon vos progrès réels sur 2-3 semaines.</p>' },
                { question: 'Quel niveau d’activité choisir ?', answer: '<p>Soyez honnête — "sédentaire" signifie un travail de bureau avec peu ou pas d’exercice. La plupart des gens surestiment leur niveau d’activité, ce qui conduit à manger plus que leur DEET réel.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexe', type: 'select', options: [{ value: '1', label: 'Homme' }, { value: '0', label: 'Femme' }] },
                { name: 'weight_kg', label: 'Poids', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Taille', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Âge', type: 'number', unit: 'ans', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Niveau d’Activité', type: 'select', options: [
                    { value: '1.2', label: 'Sédentaire (peu/pas d’exercice)' },
                    { value: '1.375', label: 'Léger (1-3 jours/semaine)' },
                    { value: '1.55', label: 'Modéré (3-5 jours/semaine)' },
                    { value: '1.725', label: 'Actif (6-7 jours/semaine)' },
                    { value: '1.9', label: 'Très Actif (travail physique ou 2x/jour)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'MB (repos seul)', unit: 'kcal/jour', precision: 0 },
                { name: 'tdee', label: 'DEET (dépense totale)', unit: 'kcal/jour', precision: 0 },
            ],
        },
        it: {
            slug: 'calcolatore-tdee-dispendio-energetico-totale',
            title: 'Calcolatore TDEE - Dispendio Energetico Totale Giornaliero',
            h1: 'Calcolatore TDEE',
            meta_title: 'Calcolatore TDEE | Dispendio Energetico Totale Giornaliero',
            meta_description: 'Calcola il tuo dispendio energetico totale giornaliero (TDEE) — le calorie che bruci al giorno, inclusa l’attività. Basato sulla formula MB di Mifflin-St Jeor.',
            short_answer: 'Questo calcolatore TDEE stima il numero totale di calorie che bruci in un giorno, incluso il tuo livello di attività — il numero da usare per impostare un obiettivo calorico di perdita, mantenimento o aumento di peso.',
            intro_text: '<p>Il dispendio energetico totale giornaliero (TDEE) è il numero totale di calorie che il tuo corpo brucia in un giorno, combinando il metabolismo basale (MB) con l’energia spesa per l’attività fisica, la digestione e il movimento quotidiano. È il numero più utile per pianificare un obiettivo di apporto calorico.</p><p>Questo calcolatore calcola prima il MB usando l’<b>equazione di Mifflin-St Jeor</b>, poi lo moltiplica per un <b>fattore di attività</b> che va da 1,2 (sedentario) a 1,9 (molto attivo, lavoro fisico o allenamento due volte al giorno).</p><p><b>Chiunque pianifichi una dieta</b> parte da qui: mangiare sotto il TDEE crea un deficit per perdere peso, mangiare al livello del TDEE mantiene il peso, mangiare sopra favorisce l’aumento muscolare. <b>Coach e nutrizionisti</b> usano il TDEE come base prima di apportare aggiustamenti.</p>',
            key_points: [
                '<b>MB + Attività:</b> Moltiplica il metabolismo basale per un fattore di attività per stimare il reale dispendio calorico giornaliero.',
                '<b>Cinque livelli di attività:</b> Da sedentario (1,2x) a molto attivo (1,9x), coprendo lavoro d’ufficio e allenamenti due volte al giorno.',
                '<b>Base per la pianificazione della dieta:</b> Sottrai ~500 kcal/giorno dal TDEE per perdere ~0,5 kg di grasso a settimana; aggiungi ~300-500 kcal/giorno per aumento muscolare.',
                '<b>Stima, non valore esatto:</b> Il metabolismo individuale varia — usa il risultato come punto di partenza da correggere in base all’andamento reale del peso.',
            ],
            howto: [
                { question: 'Quante calorie devo mangiare per perdere peso?', answer: '<p>Inizia sottraendo ~500 calorie/giorno dal tuo TDEE per una perdita sostenibile di ~0,5 kg a settimana, poi correggi in base ai progressi reali dopo 2-3 settimane.</p>' },
                { question: 'Quale livello di attività dovrei scegliere?', answer: '<p>Sii onesto — "sedentario" significa un lavoro d’ufficio con poco o nessun esercizio. La maggior parte delle persone sovrastima il proprio livello di attività, portando a mangiare più del proprio TDEE reale.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sesso', type: 'select', options: [{ value: '1', label: 'Uomo' }, { value: '0', label: 'Donna' }] },
                { name: 'weight_kg', label: 'Peso', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Altezza', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Età', type: 'number', unit: 'anni', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Livello di Attività', type: 'select', options: [
                    { value: '1.2', label: 'Sedentario (poco/nessun esercizio)' },
                    { value: '1.375', label: 'Leggero (1-3 giorni/settimana)' },
                    { value: '1.55', label: 'Moderato (3-5 giorni/settimana)' },
                    { value: '1.725', label: 'Attivo (6-7 giorni/settimana)' },
                    { value: '1.9', label: 'Molto Attivo (lavoro fisico o 2x/giorno)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'MB (solo riposo)', unit: 'kcal/giorno', precision: 0 },
                { name: 'tdee', label: 'TDEE (dispendio totale)', unit: 'kcal/giorno', precision: 0 },
            ],
        },
        de: {
            slug: 'gesamtumsatz-rechner-tdee',
            title: 'Gesamtumsatz-Rechner (TDEE) - Gesamter Täglicher Energieverbrauch',
            h1: 'Gesamtumsatz-Rechner',
            meta_title: 'Gesamtumsatz-Rechner | TDEE Gesamter Täglicher Energieverbrauch',
            meta_description: 'Berechnen Sie Ihren gesamten täglichen Energieverbrauch (TDEE) — die Kalorien, die Sie inklusive Aktivität pro Tag verbrennen. Basierend auf der Mifflin-St-Jeor-BMR-Formel.',
            short_answer: 'Dieser TDEE-Rechner schätzt die Gesamtzahl der Kalorien, die Sie an einem Tag verbrennen, einschließlich Ihres Aktivitätsniveaus — die Zahl, die Sie zur Festlegung eines Kalorienziels für Abnehmen, Gewichtserhalt oder Zunahme verwenden.',
            intro_text: '<p>Der gesamte tägliche Energieverbrauch (TDEE) ist die Gesamtzahl der Kalorien, die Ihr Körper an einem Tag verbrennt, indem er den Grundumsatz (BMR) mit der für körperliche Aktivität, Verdauung und alltägliche Bewegung aufgewendeten Energie kombiniert. Es ist die nützlichste Zahl zur Planung eines Kalorienziels.</p><p>Dieser Rechner berechnet zunächst den BMR mit der <b>Mifflin-St-Jeor-Gleichung</b> und multipliziert ihn dann mit einem <b>Aktivitätsfaktor</b> von 1,2 (sitzend) bis 1,9 (sehr aktiv, körperliche Arbeit oder zweimal tägliches Training).</p><p><b>Jeder, der eine Diät plant</b>, beginnt hier: Essen unterhalb des TDEE erzeugt ein Kaloriendefizit zum Abnehmen, Essen auf TDEE-Niveau erhält das Gewicht, und Essen darüber unterstützt den Muskelaufbau. <b>Trainer und Ernährungsberater</b> nutzen den TDEE als Ausgangswert vor individuellen Anpassungen.</p>',
            key_points: [
                '<b>BMR + Aktivität:</b> Multipliziert Ihren Grundumsatz mit einem Aktivitätsfaktor, um den tatsächlichen täglichen Kalorienverbrauch zu schätzen.',
                '<b>Fünf Aktivitätsstufen:</b> Von sitzend (1,2x) bis sehr aktiv (1,9x), von Schreibtischarbeit bis zweimal täglichem Training.',
                '<b>Grundlage der Diätplanung:</b> Ziehen Sie ~500 kcal/Tag vom TDEE ab für ~0,5 kg Fettverlust pro Woche; addieren Sie ~300-500 kcal/Tag für Muskelaufbau.',
                '<b>Schätzung, kein exakter Wert:</b> Der individuelle Stoffwechsel variiert — nutzen Sie das Ergebnis als Ausgangspunkt und passen Sie es anhand der realen Gewichtsentwicklung an.',
            ],
            howto: [
                { question: 'Wie viele Kalorien sollte ich zum Abnehmen essen?', answer: '<p>Ziehen Sie zunächst etwa 500 Kalorien/Tag von Ihrem TDEE ab für einen nachhaltigen Fettverlust von etwa 0,5 kg pro Woche, und passen Sie dies dann anhand Ihres tatsächlichen Fortschritts über 2-3 Wochen an.</p>' },
                { question: 'Welches Aktivitätsniveau sollte ich wählen?', answer: '<p>Seien Sie ehrlich — "sitzend" bedeutet ein Schreibtischjob mit wenig bis keinem Sport. Die meisten Menschen überschätzen ihr Aktivitätsniveau, was zu einem Essen über ihrem tatsächlichen TDEE führt.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Geschlecht', type: 'select', options: [{ value: '1', label: 'Männlich' }, { value: '0', label: 'Weiblich' }] },
                { name: 'weight_kg', label: 'Gewicht', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'height_cm', label: 'Größe', type: 'number', unit: 'cm', min: 50, max: 250, placeholder: '170' },
                { name: 'age', label: 'Alter', type: 'number', unit: 'Jahre', min: 1, max: 120, placeholder: '30' },
                { name: 'activity_multiplier', label: 'Aktivitätsniveau', type: 'select', options: [
                    { value: '1.2', label: 'Sitzend (wenig/kein Sport)' },
                    { value: '1.375', label: 'Leicht (1-3 Tage/Woche)' },
                    { value: '1.55', label: 'Moderat (3-5 Tage/Woche)' },
                    { value: '1.725', label: 'Aktiv (6-7 Tage/Woche)' },
                    { value: '1.9', label: 'Sehr Aktiv (körperliche Arbeit oder 2x/Tag)' },
                ] },
            ],
            outputs: [
                { name: 'bmr', label: 'BMR (nur Ruhe)', unit: 'kcal/Tag', precision: 0 },
                { name: 'tdee', label: 'TDEE (Gesamtverbrauch)', unit: 'kcal/Tag', precision: 0 },
            ],
        },
    },
}

// ============================================================
// 1006: Body Fat Percentage Calculator (US Navy method)
// ============================================================
const bodyFat: ToolDef = {
    id: '1006',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'is_male', default: 1 },
            { key: 'height_cm', default: 170 },
            { key: 'waist_cm', default: 85 },
            { key: 'neck_cm', default: 38 },
            { key: 'hip_cm', default: 0 },
        ],
        formulas: {
            body_fat: 'is_male == 1 ? (495 / (1.0324 - 0.19077*log10(waist_cm - neck_cm) + 0.15456*log10(height_cm)) - 450) : (495 / (1.29579 - 0.35004*log10(waist_cm + hip_cm - neck_cm) + 0.22100*log10(height_cm)) - 450)',
        },
        outputs: [{ key: 'body_fat', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'body-fat-percentage-calculator-navy-method',
            title: 'Body Fat Percentage Calculator - US Navy Method',
            h1: 'Body Fat Percentage Calculator',
            meta_title: 'Body Fat Percentage Calculator | US Navy Method',
            meta_description: 'Estimate your body fat percentage using the US Navy circumference method — just tape-measure waist, neck, height, and (for women) hip measurements, no calipers needed.',
            short_answer: 'This calculator estimates your body fat percentage using the US Navy method, a circumference-based formula that only requires a tape measure — no skinfold calipers or scans required.',
            intro_text: '<p>The US Navy method estimates body fat percentage from simple circumference measurements — waist, neck, height, and (for women) hips — using a logarithmic formula developed and validated for military fitness testing. It is one of the most accessible body composition estimates, requiring only a flexible tape measure.</p><p><b>Athletes and general fitness trackers</b> use it as a free, repeatable alternative to DEXA scans or skinfold calipers, ideal for tracking body composition trends over weeks and months rather than getting a single lab-grade reading.</p>',
            key_points: [
                '<b>No Special Equipment:</b> Only needs a flexible tape measure — no calipers, scales, or scanning equipment required.',
                '<b>Different Formula by Sex:</b> Men\'s formula uses waist and neck; women\'s formula adds hip circumference for accuracy.',
                '<b>Best for Tracking Trends:</b> More useful for monitoring change over time than for a single precise reading — measure consistently at the same time of day.',
            ],
            howto: [
                { question: 'Where exactly do I measure my waist and neck?', answer: '<p>Measure your waist at the navel level, and your neck just below the larynx (Adam\'s apple), keeping the tape measure horizontal and snug but not compressing the skin.</p>' },
                { question: 'Is the Navy method accurate?', answer: '<p>It has a margin of error of roughly ±3-4% compared to DEXA scans, which is accurate enough for tracking progress over time, though not for clinical diagnosis.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sex', type: 'select', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
                { name: 'height_cm', label: 'Height', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Waist Circumference', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Measured at navel level.' },
                { name: 'neck_cm', label: 'Neck Circumference', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Measured just below the larynx.' },
                { name: 'hip_cm', label: 'Hip Circumference (women only)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Estimated Body Fat', unit: '%', precision: 1 }],
        },
        ru: {
            slug: 'kalkulyator-procenta-zhira-metod-vmf-ssha',
            title: 'Калькулятор процента жира - метод ВМФ США',
            h1: 'Калькулятор процента жира в организме',
            meta_title: 'Калькулятор процента жира | Метод ВМФ США',
            meta_description: 'Оцените процент жира в организме по методу ВМФ США — по обхвату талии, шеи, роста и (для женщин) бёдер, без калиперов.',
            short_answer: 'Этот калькулятор оценивает процент жира в организме по методу ВМФ США — формуле на основе обхватов тела, требующей только сантиметровую ленту.',
            intro_text: '<p>Метод ВМФ США оценивает процент жира по простым замерам обхвата — талии, шеи, роста и (для женщин) бёдер — используя логарифмическую формулу, разработанную для военного фитнес-тестирования. Это один из самых доступных способов оценки состава тела, требующий лишь гибкой сантиметровой ленты.</p><p><b>Спортсмены и любители фитнеса</b> используют его как бесплатную, повторяемую альтернативу DEXA-сканированию или калиперам, идеальную для отслеживания динамики состава тела за недели и месяцы.</p>',
            key_points: [
                '<b>Без специального оборудования:</b> Нужна только гибкая сантиметровая лента — без калиперов, весов или сканеров.',
                '<b>Разные формулы по полу:</b> Мужская формула использует талию и шею; женская добавляет обхват бёдер для точности.',
                '<b>Лучше для отслеживания динамики:</b> Полезнее для мониторинга изменений со временем, чем для единичного точного измерения.',
            ],
            howto: [
                { question: 'Где именно измерять талию и шею?', answer: '<p>Измеряйте талию на уровне пупка, а шею — чуть ниже гортани, держа ленту горизонтально и плотно, но не сдавливая кожу.</p>' },
                { question: 'Насколько точен метод ВМФ?', answer: '<p>Погрешность составляет примерно ±3-4% по сравнению с DEXA-сканированием — этого достаточно для отслеживания прогресса, но не для клинической диагностики.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Пол', type: 'select', options: [{ value: '1', label: 'Мужской' }, { value: '0', label: 'Женский' }] },
                { name: 'height_cm', label: 'Рост', type: 'number', unit: 'см', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Обхват талии', type: 'number', unit: 'см', min: 40, max: 200, placeholder: '85', description: 'Измеряется на уровне пупка.' },
                { name: 'neck_cm', label: 'Обхват шеи', type: 'number', unit: 'см', min: 20, max: 70, placeholder: '38', description: 'Измеряется чуть ниже гортани.' },
                { name: 'hip_cm', label: 'Обхват бёдер (только для женщин)', type: 'number', unit: 'см', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Оценка процента жира', unit: '%', precision: 1 }],
        },
        lv: {
            slug: 'kermena-tauku-procenta-kalkulators-navy-metode',
            title: 'Ķermeņa tauku procenta kalkulators - ASV Jūras spēku metode',
            h1: 'Ķermeņa tauku procenta kalkulators',
            meta_title: 'Ķermeņa tauku procenta kalkulators | ASV Jūras spēku metode',
            meta_description: 'Novērtējiet ķermeņa tauku procentu, izmantojot ASV Jūras spēku metodi — pēc vidukļa, kakla, auguma un (sievietēm) gurnu apkārtmēra, bez kaliperiem.',
            short_answer: 'Šis kalkulators novērtē ķermeņa tauku procentu, izmantojot ASV Jūras spēku metodi — apkārtmēra formulu, kurai nepieciešama tikai mērlente.',
            intro_text: '<p>ASV Jūras spēku metode novērtē tauku procentu no vienkāršiem apkārtmēra mērījumiem — vidukļa, kakla, auguma un (sievietēm) gurnu — izmantojot logaritmisku formulu, kas izstrādāta militārajai fitnesa pārbaudei. Tā ir viena no pieejamākajām ķermeņa sastāva novērtēšanas metodēm, kam nepieciešama tikai elastīga mērlente.</p><p><b>Sportisti un fitnesa entuziasti</b> to izmanto kā bezmaksas, atkārtojamu alternatīvu DEXA skenēšanai vai kaliperiem, ideāli piemērotu ķermeņa sastāva tendenču izsekošanai nedēļu un mēnešu garumā.</p>',
            key_points: [
                '<b>Bez īpaša aprīkojuma:</b> Nepieciešama tikai elastīga mērlente — bez kaliperiem, svariem vai skenēšanas iekārtām.',
                '<b>Atšķirīga formula pēc dzimuma:</b> Vīriešu formula izmanto vidukli un kaklu; sieviešu formula pievieno gurnu apkārtmēru precizitātei.',
                '<b>Vislabāk tendenču izsekošanai:</b> Noderīgāk izmaiņu uzraudzībai laika gaitā nekā vienam precīzam mērījumam.',
            ],
            howto: [
                { question: 'Kur tieši mērīt vidukli un kaklu?', answer: '<p>Mēriet vidukli nabas līmenī, bet kaklu — tieši zem balsenes, turot mērlenti horizontāli un cieši, bet nesaspiežot ādu.</p>' },
                { question: 'Cik precīza ir Jūras spēku metode?', answer: '<p>Kļūdas robeža ir aptuveni ±3-4% salīdzinājumā ar DEXA skenēšanu — tas ir pietiekami precīzi progresa izsekošanai, bet ne klīniskai diagnostikai.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Dzimums', type: 'select', options: [{ value: '1', label: 'Vīrietis' }, { value: '0', label: 'Sieviete' }] },
                { name: 'height_cm', label: 'Augums', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Vidukļa apkārtmērs', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Mērīts nabas līmenī.' },
                { name: 'neck_cm', label: 'Kakla apkārtmērs', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Mērīts tieši zem balsenes.' },
                { name: 'hip_cm', label: 'Gurnu apkārtmērs (tikai sievietēm)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Novērtētais tauku procents', unit: '%', precision: 1 }],
        },
        pl: {
            slug: 'kalkulator-procentu-tkanki-tluszczowej-metoda-navy',
            title: 'Kalkulator Procentu Tkanki Tłuszczowej - Metoda US Navy',
            h1: 'Kalkulator Procentu Tkanki Tłuszczowej',
            meta_title: 'Kalkulator Tkanki Tłuszczowej | Metoda US Navy',
            meta_description: 'Oszacuj procent tkanki tłuszczowej metodą US Navy — na podstawie obwodu talii, szyi, wzrostu i (dla kobiet) bioder, bez fałdomierza.',
            short_answer: 'Ten kalkulator szacuje procent tkanki tłuszczowej metodą US Navy — formułą opartą na obwodach ciała, wymagającą jedynie centymetra krawieckiego.',
            intro_text: '<p>Metoda US Navy szacuje procent tkanki tłuszczowej na podstawie prostych pomiarów obwodu — talii, szyi, wzrostu i (dla kobiet) bioder — wykorzystując formułę logarytmiczną opracowaną do wojskowych testów sprawności. To jedna z najbardziej dostępnych metod oceny składu ciała, wymagająca jedynie elastycznej miarki.</p><p><b>Sportowcy i entuzjaści fitnessu</b> używają jej jako darmowej, powtarzalnej alternatywy dla skanów DEXA lub fałdomierza, idealnej do śledzenia trendów składu ciała na przestrzeni tygodni i miesięcy.</p>',
            key_points: [
                '<b>Bez specjalnego sprzętu:</b> Wymaga jedynie elastycznej miarki — bez fałdomierzy, wag czy urządzeń skanujących.',
                '<b>Inna formuła dla każdej płci:</b> Formuła męska używa talii i szyi; formuła żeńska dodaje obwód bioder dla dokładności.',
                '<b>Najlepsze do śledzenia trendów:</b> Bardziej użyteczne do monitorowania zmian w czasie niż do jednego precyzyjnego pomiaru.',
            ],
            howto: [
                { question: 'Gdzie dokładnie mierzyć talię i szyję?', answer: '<p>Mierz talię na wysokości pępka, a szyję tuż poniżej krtani, trzymając miarkę poziomo i ściśle, ale nie uciskając skóry.</p>' },
                { question: 'Czy metoda US Navy jest dokładna?', answer: '<p>Margines błędu wynosi około ±3-4% w porównaniu do skanów DEXA — wystarczająco dokładne do śledzenia postępów, choć nie do diagnostyki klinicznej.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Płeć', type: 'select', options: [{ value: '1', label: 'Mężczyzna' }, { value: '0', label: 'Kobieta' }] },
                { name: 'height_cm', label: 'Wzrost', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Obwód talii', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Mierzony na wysokości pępka.' },
                { name: 'neck_cm', label: 'Obwód szyi', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Mierzony tuż poniżej krtani.' },
                { name: 'hip_cm', label: 'Obwód bioder (tylko dla kobiet)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Szacowany procent tkanki tłuszczowej', unit: '%', precision: 1 }],
        },
        es: {
            slug: 'calculadora-grasa-corporal-metodo-marina-eeuu',
            title: 'Calculadora de Grasa Corporal - Método de la Marina de EE.UU.',
            h1: 'Calculadora de Porcentaje de Grasa Corporal',
            meta_title: 'Calculadora de Grasa Corporal | Método de la Marina de EE.UU.',
            meta_description: 'Estima tu porcentaje de grasa corporal con el método de la Marina de EE.UU. — solo cintura, cuello, altura y (para mujeres) cadera, sin plicómetro.',
            short_answer: 'Esta calculadora estima tu porcentaje de grasa corporal usando el método de la Marina de EE.UU., una fórmula basada en circunferencias que solo requiere una cinta métrica.',
            intro_text: '<p>El método de la Marina de EE.UU. estima el porcentaje de grasa corporal a partir de medidas simples de circunferencia —cintura, cuello, altura y (para mujeres) cadera— usando una fórmula logarítmica desarrollada para pruebas físicas militares. Es una de las estimaciones de composición corporal más accesibles, ya que solo requiere una cinta métrica flexible.</p><p><b>Deportistas y aficionados al fitness</b> lo usan como alternativa gratuita y repetible a los escáneres DEXA o el plicómetro, ideal para seguir tendencias de composición corporal durante semanas y meses.</p>',
            key_points: [
                '<b>Sin equipo especial:</b> Solo necesita una cinta métrica flexible — sin plicómetros, básculas ni equipos de escaneo.',
                '<b>Fórmula distinta según el sexo:</b> La fórmula masculina usa cintura y cuello; la femenina añade la circunferencia de cadera para mayor precisión.',
                '<b>Mejor para seguir tendencias:</b> Más útil para monitorear cambios con el tiempo que para una única lectura precisa.',
            ],
            howto: [
                { question: '¿Dónde exactamente mido cintura y cuello?', answer: '<p>Mide la cintura a la altura del ombligo, y el cuello justo debajo de la laringe (nuez), manteniendo la cinta horizontal y ajustada sin comprimir la piel.</p>' },
                { question: '¿Es preciso el método de la Marina?', answer: '<p>Tiene un margen de error de aproximadamente ±3-4% comparado con escáneres DEXA, suficientemente preciso para seguir el progreso, aunque no para diagnóstico clínico.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexo', type: 'select', options: [{ value: '1', label: 'Hombre' }, { value: '0', label: 'Mujer' }] },
                { name: 'height_cm', label: 'Altura', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Circunferencia de Cintura', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Medida a la altura del ombligo.' },
                { name: 'neck_cm', label: 'Circunferencia de Cuello', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Medida justo debajo de la laringe.' },
                { name: 'hip_cm', label: 'Circunferencia de Cadera (solo mujeres)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Grasa Corporal Estimada', unit: '%', precision: 1 }],
        },
        fr: {
            slug: 'calculateur-masse-grasse-methode-marine-americaine',
            title: 'Calculateur de Masse Grasse - Méthode de la Marine Américaine',
            h1: 'Calculateur de Pourcentage de Masse Grasse',
            meta_title: 'Calculateur de Masse Grasse | Méthode de la Marine Américaine',
            meta_description: 'Estimez votre pourcentage de masse grasse avec la méthode de la marine américaine — taille, cou, taille et (pour les femmes) hanches, sans pince à plis cutanés.',
            short_answer: 'Ce calculateur estime votre pourcentage de masse grasse avec la méthode de la marine américaine, une formule basée sur les circonférences ne nécessitant qu’un mètre ruban.',
            intro_text: '<p>La méthode de la marine américaine estime le pourcentage de masse grasse à partir de simples mesures de circonférence — tour de taille, de cou, taille et (pour les femmes) de hanches — via une formule logarithmique développée pour les tests de condition physique militaire. C’est l’une des estimations de composition corporelle les plus accessibles, ne nécessitant qu’un mètre ruban souple.</p><p><b>Sportifs et amateurs de fitness</b> l’utilisent comme alternative gratuite et répétable aux scanners DEXA ou à la pince à plis cutanés, idéale pour suivre les tendances de composition corporelle sur des semaines et des mois.</p>',
            key_points: [
                '<b>Aucun équipement spécial :</b> Nécessite seulement un mètre ruban souple — pas de pince, de balance ni d’appareil de scan.',
                '<b>Formule différente selon le sexe :</b> La formule masculine utilise la taille et le cou ; la formule féminine ajoute le tour de hanches pour plus de précision.',
                '<b>Idéal pour suivre les tendances :</b> Plus utile pour surveiller l’évolution dans le temps que pour une seule mesure précise.',
            ],
            howto: [
                { question: 'Où mesurer exactement la taille et le cou ?', answer: '<p>Mesurez votre taille au niveau du nombril, et votre cou juste sous le larynx (pomme d’Adam), en gardant le mètre ruban horizontal et ajusté sans comprimer la peau.</p>' },
                { question: 'La méthode de la marine est-elle précise ?', answer: '<p>Elle a une marge d’erreur d’environ ±3-4 % par rapport aux scanners DEXA, ce qui est suffisamment précis pour suivre les progrès, mais pas pour un diagnostic clinique.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexe', type: 'select', options: [{ value: '1', label: 'Homme' }, { value: '0', label: 'Femme' }] },
                { name: 'height_cm', label: 'Taille', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Tour de Taille', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Mesuré au niveau du nombril.' },
                { name: 'neck_cm', label: 'Tour de Cou', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Mesuré juste sous le larynx.' },
                { name: 'hip_cm', label: 'Tour de Hanches (femmes uniquement)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Masse Grasse Estimée', unit: '%', precision: 1 }],
        },
        it: {
            slug: 'calcolatore-massa-grassa-metodo-marina-usa',
            title: 'Calcolatore Massa Grassa - Metodo della Marina USA',
            h1: 'Calcolatore Percentuale Massa Grassa',
            meta_title: 'Calcolatore Massa Grassa | Metodo della Marina USA',
            meta_description: 'Stima la tua percentuale di massa grassa con il metodo della Marina USA — vita, collo, altezza e (per le donne) fianchi, senza plicometro.',
            short_answer: 'Questo calcolatore stima la tua percentuale di massa grassa usando il metodo della Marina USA, una formula basata sulle circonferenze che richiede solo un metro da sarta.',
            intro_text: '<p>Il metodo della Marina USA stima la percentuale di massa grassa da semplici misurazioni di circonferenza — vita, collo, altezza e (per le donne) fianchi — usando una formula logaritmica sviluppata per i test di forma fisica militare. È una delle stime di composizione corporea più accessibili, richiedendo solo un metro da sarta flessibile.</p><p><b>Atleti e appassionati di fitness</b> lo usano come alternativa gratuita e ripetibile alle scansioni DEXA o al plicometro, ideale per monitorare le tendenze della composizione corporea nel corso di settimane e mesi.</p>',
            key_points: [
                '<b>Nessuna attrezzatura speciale:</b> Serve solo un metro da sarta flessibile — niente plicometri, bilance o scanner.',
                '<b>Formula diversa per sesso:</b> La formula maschile usa vita e collo; quella femminile aggiunge la circonferenza dei fianchi per maggiore precisione.',
                '<b>Ideale per monitorare le tendenze:</b> Più utile per osservare i cambiamenti nel tempo che per una singola lettura precisa.',
            ],
            howto: [
                { question: 'Dove misuro esattamente vita e collo?', answer: '<p>Misura la vita all’altezza dell’ombelico e il collo appena sotto la laringe, tenendo il metro orizzontale e aderente senza comprimere la pelle.</p>' },
                { question: 'Il metodo della Marina è accurato?', answer: '<p>Ha un margine di errore di circa ±3-4% rispetto alle scansioni DEXA, sufficientemente accurato per monitorare i progressi, ma non per la diagnosi clinica.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sesso', type: 'select', options: [{ value: '1', label: 'Uomo' }, { value: '0', label: 'Donna' }] },
                { name: 'height_cm', label: 'Altezza', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Circonferenza Vita', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Misurata all’altezza dell’ombelico.' },
                { name: 'neck_cm', label: 'Circonferenza Collo', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Misurata appena sotto la laringe.' },
                { name: 'hip_cm', label: 'Circonferenza Fianchi (solo donne)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Massa Grassa Stimata', unit: '%', precision: 1 }],
        },
        de: {
            slug: 'koerperfettanteil-rechner-navy-methode',
            title: 'Körperfettanteil-Rechner - US Navy Methode',
            h1: 'Körperfettanteil-Rechner',
            meta_title: 'Körperfettanteil-Rechner | US Navy Methode',
            meta_description: 'Schätzen Sie Ihren Körperfettanteil mit der US-Navy-Methode — nur Taille, Hals, Größe und (bei Frauen) Hüfte messen, keine Fettzange nötig.',
            short_answer: 'Dieser Rechner schätzt Ihren Körperfettanteil mit der US-Navy-Methode, einer auf Umfangmessungen basierenden Formel, für die nur ein Maßband nötig ist.',
            intro_text: '<p>Die US-Navy-Methode schätzt den Körperfettanteil anhand einfacher Umfangmessungen — Taille, Hals, Größe und (bei Frauen) Hüfte — mit einer logarithmischen Formel, die für militärische Fitnesstests entwickelt wurde. Sie ist eine der zugänglichsten Methoden zur Schätzung der Körperzusammensetzung und benötigt nur ein flexibles Maßband.</p><p><b>Sportler und Fitness-Enthusiasten</b> nutzen sie als kostenlose, wiederholbare Alternative zu DEXA-Scans oder Fettzangen, ideal um Trends der Körperzusammensetzung über Wochen und Monate zu verfolgen.</p>',
            key_points: [
                '<b>Keine Spezialausrüstung:</b> Nur ein flexibles Maßband nötig — keine Fettzangen, Waagen oder Scangeräte.',
                '<b>Unterschiedliche Formel je nach Geschlecht:</b> Die Männerformel nutzt Taille und Hals; die Frauenformel fügt den Hüftumfang für mehr Genauigkeit hinzu.',
                '<b>Am besten für Trendverfolgung:</b> Nützlicher zur Beobachtung von Veränderungen über Zeit als für eine einzelne präzise Messung.',
            ],
            howto: [
                { question: 'Wo genau messe ich Taille und Hals?', answer: '<p>Messen Sie die Taille auf Höhe des Bauchnabels und den Hals direkt unterhalb des Kehlkopfs, wobei das Maßband horizontal und eng anliegt, ohne die Haut einzudrücken.</p>' },
                { question: 'Ist die Navy-Methode genau?', answer: '<p>Sie hat eine Fehlermarge von etwa ±3-4 % im Vergleich zu DEXA-Scans — genau genug, um Fortschritte zu verfolgen, aber nicht für klinische Diagnosen.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Geschlecht', type: 'select', options: [{ value: '1', label: 'Männlich' }, { value: '0', label: 'Weiblich' }] },
                { name: 'height_cm', label: 'Größe', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
                { name: 'waist_cm', label: 'Taillenumfang', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Gemessen auf Nabelhöhe.' },
                { name: 'neck_cm', label: 'Halsumfang', type: 'number', unit: 'cm', min: 20, max: 70, placeholder: '38', description: 'Gemessen direkt unterhalb des Kehlkopfs.' },
                { name: 'hip_cm', label: 'Hüftumfang (nur Frauen)', type: 'number', unit: 'cm', min: 0, max: 200, placeholder: '0' },
            ],
            outputs: [{ name: 'body_fat', label: 'Geschätzter Körperfettanteil', unit: '%', precision: 1 }],
        },
    },
}

// ============================================================
// 1007: Ideal Body Weight Calculator (Devine formula)
// ============================================================
const idealBodyWeight: ToolDef = {
    id: '1007',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'is_male', default: 1 },
            { key: 'height_cm', default: 170 },
        ],
        formulas: {
            ibw_kg: 'is_male == 1 ? (50 + 2.3*(height_cm/2.54 - 60)) : (45.5 + 2.3*(height_cm/2.54 - 60))',
            ibw_lbs: '(is_male == 1 ? (50 + 2.3*(height_cm/2.54 - 60)) : (45.5 + 2.3*(height_cm/2.54 - 60))) * 2.20462',
        },
        outputs: [
            { key: 'ibw_kg', precision: 1 },
            { key: 'ibw_lbs', precision: 1 },
        ],
    },
    locales: {
        en: {
            slug: 'ideal-body-weight-calculator-devine-formula',
            title: 'Ideal Body Weight Calculator - Devine Formula',
            h1: 'Ideal Body Weight Calculator',
            meta_title: 'Ideal Body Weight Calculator | Devine Formula',
            meta_description: 'Calculate your ideal body weight using the Devine formula — the standard reference formula used in clinical medicine, based on height and sex.',
            short_answer: 'This calculator estimates your ideal body weight using the Devine formula, originally created to help clinicians calculate medication dosages, and now widely used as a general reference weight range.',
            intro_text: '<p>The Devine formula, published in 1974, estimates ideal body weight from height alone, with a fixed starting weight at 60 inches (152 cm) and a linear addition per inch above that. It was originally designed for drug-dosage calculations in medicine, where a consistent reference weight was needed regardless of a patient\'s actual body composition.</p><p><b>It is now commonly cited</b> alongside BMI as a general weight reference, though it does not account for muscle mass, frame size, or body composition — an athletic person will often exceed their "ideal" weight on this formula while being perfectly healthy.</p>',
            key_points: [
                '<b>Devine Formula (1974):</b> Originally developed for medical dosing calculations, now used as a general weight reference.',
                '<b>Height-Based Only:</b> Unlike BMI, it does not use current weight as an input — only height and sex.',
                '<b>Not for Athletes:</b> Muscular individuals will often show as "overweight" by this formula despite healthy body composition — treat it as a rough reference, not a target.',
            ],
            howto: [
                { question: 'Is the Devine formula the same as a healthy weight?', answer: '<p>Not exactly — it is a reference weight originally built for medical dosing, not a personalized healthy weight target. Use it alongside BMI and body fat percentage for a fuller picture.</p>' },
                { question: 'Why does the formula only use height?', answer: '<p>It was designed to give clinicians a consistent baseline weight regardless of a patient\'s actual build, which is why it ignores body composition entirely.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sex', type: 'select', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
                { name: 'height_cm', label: 'Height', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Ideal Body Weight', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Ideal Body Weight', unit: 'lb', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-idealnogo-vesa-formula-devine',
            title: 'Калькулятор идеального веса - формула Devine',
            h1: 'Калькулятор идеального веса',
            meta_title: 'Калькулятор идеального веса | Формула Devine',
            meta_description: 'Рассчитайте идеальный вес тела по формуле Devine — стандартной формуле, используемой в клинической медицине, на основе роста и пола.',
            short_answer: 'Этот калькулятор оценивает идеальный вес тела по формуле Devine, изначально созданной для расчёта дозировок лекарств, а теперь широко используемой как общий ориентир веса.',
            intro_text: '<p>Формула Devine, опубликованная в 1974 году, оценивает идеальный вес только на основе роста, с фиксированным начальным весом при 152 см и линейным добавлением за каждый дюйм сверх этого. Изначально она была разработана для расчёта дозировок лекарств в медицине.</p><p><b>Сейчас она часто упоминается</b> наряду с ИМТ как общий ориентир веса, хотя не учитывает мышечную массу, тип телосложения или состав тела — спортивный человек часто будет превышать «идеальный» вес по этой формуле, оставаясь при этом полностью здоровым.</p>',
            key_points: [
                '<b>Формула Devine (1974):</b> Изначально разработана для медицинских расчётов дозировок, теперь используется как общий ориентир веса.',
                '<b>Только на основе роста:</b> В отличие от ИМТ, не использует текущий вес — только рост и пол.',
                '<b>Не для спортсменов:</b> Мускулистые люди часто будут «превышать норму» по этой формуле, несмотря на здоровый состав тела.',
            ],
            howto: [
                { question: 'Идеальный вес по Devine — это здоровый вес?', answer: '<p>Не совсем — это ориентировочный вес, изначально созданный для медицинских дозировок, а не персонализированная цель. Используйте его вместе с ИМТ и процентом жира.</p>' },
                { question: 'Почему формула учитывает только рост?', answer: '<p>Она была разработана, чтобы дать врачам стабильный базовый вес независимо от телосложения пациента, поэтому полностью игнорирует состав тела.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Пол', type: 'select', options: [{ value: '1', label: 'Мужской' }, { value: '0', label: 'Женский' }] },
                { name: 'height_cm', label: 'Рост', type: 'number', unit: 'см', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Идеальный вес', unit: 'кг', precision: 1 },
                { name: 'ibw_lbs', label: 'Идеальный вес', unit: 'фунт', precision: 1 },
            ],
        },
        lv: {
            slug: 'idealais-svara-kalkulators-devine-formula',
            title: 'Ideālā svara kalkulators - Devine formula',
            h1: 'Ideālā svara kalkulators',
            meta_title: 'Ideālā svara kalkulators | Devine formula',
            meta_description: 'Aprēķiniet savu ideālo ķermeņa svaru, izmantojot Devine formulu — standarta formulu, ko izmanto klīniskajā medicīnā, balstoties uz augumu un dzimumu.',
            short_answer: 'Šis kalkulators novērtē ideālo ķermeņa svaru, izmantojot Devine formulu, kas sākotnēji izveidota medikamentu devu aprēķiniem, un tagad plaši izmantota kā vispārējs svara atskaites punkts.',
            intro_text: '<p>Devine formula, publicēta 1974. gadā, novērtē ideālo svaru tikai no auguma, ar fiksētu sākuma svaru pie 152 cm un lineāru pieaugumu par katru collu virs tā. Tā sākotnēji tika izstrādāta medikamentu devu aprēķiniem medicīnā.</p><p><b>Tagad to bieži min</b> līdzās ĶMI kā vispārēju svara atskaites punktu, lai gan tā neņem vērā muskuļu masu, ķermeņa uzbūvi vai sastāvu — sportisks cilvēks bieži pārsniegs "ideālo" svaru pēc šīs formulas, tomēr būdams pilnīgi vesels.</p>',
            key_points: [
                '<b>Devine formula (1974):</b> Sākotnēji izstrādāta medicīnisku devu aprēķiniem, tagad izmantota kā vispārējs svara atskaites punkts.',
                '<b>Balstīta tikai uz augumu:</b> Atšķirībā no ĶMI, neizmanto pašreizējo svaru — tikai augumu un dzimumu.',
                '<b>Nav domāta sportistiem:</b> Muskuļoti cilvēki bieži pēc šīs formulas šķitīs "ar liekaru svaru", neskatoties uz veselīgu ķermeņa sastāvu.',
            ],
            howto: [
                { question: 'Vai Devine ideālais svars ir veselīgs svars?', answer: '<p>Ne gluži — tas ir atskaites svars, sākotnēji izveidots medicīniskām devām, nevis personalizēts mērķis. Izmantojiet to kopā ar ĶMI un tauku procentu.</p>' },
                { question: 'Kāpēc formula ņem vērā tikai augumu?', answer: '<p>Tā tika izstrādāta, lai dotu ārstiem stabilu bāzes svaru neatkarīgi no pacienta uzbūves, tāpēc pilnībā ignorē ķermeņa sastāvu.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Dzimums', type: 'select', options: [{ value: '1', label: 'Vīrietis' }, { value: '0', label: 'Sieviete' }] },
                { name: 'height_cm', label: 'Augums', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Ideālais svars', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Ideālais svars', unit: 'mārciņas', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-idealnej-wagi-formula-devine',
            title: 'Kalkulator Idealnej Wagi - Formuła Devine\'a',
            h1: 'Kalkulator Idealnej Wagi Ciała',
            meta_title: 'Kalkulator Idealnej Wagi | Formuła Devine\'a',
            meta_description: 'Oblicz swoją idealną wagę ciała za pomocą formuły Devine\'a — standardowej formuły stosowanej w medycynie klinicznej, opartej na wzroście i płci.',
            short_answer: 'Ten kalkulator szacuje idealną wagę ciała za pomocą formuły Devine\'a, pierwotnie stworzonej do obliczania dawek leków, a obecnie szeroko stosowanej jako ogólny punkt odniesienia wagi.',
            intro_text: '<p>Formuła Devine\'a, opublikowana w 1974 roku, szacuje idealną wagę wyłącznie na podstawie wzrostu, z ustaloną wagą początkową przy 152 cm i liniowym dodatkiem za każdy cal powyżej. Pierwotnie zaprojektowano ją do obliczania dawek leków w medycynie.</p><p><b>Obecnie jest często przywoływana</b> obok BMI jako ogólny punkt odniesienia wagi, choć nie uwzględnia masy mięśniowej, budowy ciała ani składu ciała — osoba wysportowana często przekroczy swoją "idealną" wagę według tej formuły, pozostając przy tym całkowicie zdrową.</p>',
            key_points: [
                '<b>Formuła Devine\'a (1974):</b> Pierwotnie opracowana do obliczeń dawek leków, teraz używana jako ogólny punkt odniesienia wagi.',
                '<b>Oparta tylko na wzroście:</b> W przeciwieństwie do BMI, nie wykorzystuje aktualnej wagi — tylko wzrost i płeć.',
                '<b>Nie dla sportowców:</b> Umięśnione osoby często będą wykazywać "nadwagę" według tej formuły, mimo zdrowego składu ciała.',
            ],
            howto: [
                { question: 'Czy idealna waga Devine\'a to zdrowa waga?', answer: '<p>Niezupełnie — to waga referencyjna, pierwotnie stworzona do dawkowania leków, a nie spersonalizowany cel. Używaj jej razem z BMI i procentem tkanki tłuszczowej.</p>' },
                { question: 'Dlaczego formuła uwzględnia tylko wzrost?', answer: '<p>Została zaprojektowana, by dać lekarzom stabilną wagę bazową niezależnie od budowy pacjenta, dlatego całkowicie ignoruje skład ciała.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Płeć', type: 'select', options: [{ value: '1', label: 'Mężczyzna' }, { value: '0', label: 'Kobieta' }] },
                { name: 'height_cm', label: 'Wzrost', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Idealna Waga', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Idealna Waga', unit: 'funty', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-peso-ideal-formula-devine',
            title: 'Calculadora de Peso Ideal - Fórmula de Devine',
            h1: 'Calculadora de Peso Corporal Ideal',
            meta_title: 'Calculadora de Peso Ideal | Fórmula de Devine',
            meta_description: 'Calcula tu peso corporal ideal usando la fórmula de Devine — la fórmula de referencia estándar en medicina clínica, basada en altura y sexo.',
            short_answer: 'Esta calculadora estima tu peso corporal ideal usando la fórmula de Devine, creada originalmente para ayudar a calcular dosis de medicamentos y ahora ampliamente usada como referencia general de peso.',
            intro_text: '<p>La fórmula de Devine, publicada en 1974, estima el peso ideal solo a partir de la altura, con un peso inicial fijo a 152 cm y una suma lineal por cada pulgada adicional. Fue diseñada originalmente para cálculos de dosificación de medicamentos.</p><p><b>Ahora se cita comúnmente</b> junto al IMC como referencia general de peso, aunque no considera la masa muscular, la complexión ni la composición corporal — una persona atlética a menudo superará su peso "ideal" según esta fórmula estando perfectamente sana.</p>',
            key_points: [
                '<b>Fórmula de Devine (1974):</b> Desarrollada originalmente para cálculos de dosis médicas, ahora usada como referencia general de peso.',
                '<b>Basada solo en altura:</b> A diferencia del IMC, no usa el peso actual como dato — solo altura y sexo.',
                '<b>No para deportistas:</b> Las personas musculosas a menudo aparecerán con "sobrepeso" según esta fórmula pese a tener una composición corporal saludable.',
            ],
            howto: [
                { question: '¿El peso ideal de Devine es un peso saludable?', answer: '<p>No exactamente — es un peso de referencia creado originalmente para dosificación médica, no un objetivo personalizado. Úsalo junto al IMC y el porcentaje de grasa corporal.</p>' },
                { question: '¿Por qué la fórmula solo usa la altura?', answer: '<p>Fue diseñada para dar a los médicos un peso base consistente sin importar la complexión real del paciente, por eso ignora completamente la composición corporal.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexo', type: 'select', options: [{ value: '1', label: 'Hombre' }, { value: '0', label: 'Mujer' }] },
                { name: 'height_cm', label: 'Altura', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Peso Ideal', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Peso Ideal', unit: 'lb', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-poids-ideal-formule-devine',
            title: 'Calculateur de Poids Idéal - Formule de Devine',
            h1: 'Calculateur de Poids Corporel Idéal',
            meta_title: 'Calculateur de Poids Idéal | Formule de Devine',
            meta_description: 'Calculez votre poids corporel idéal avec la formule de Devine — la formule de référence standard en médecine clinique, basée sur la taille et le sexe.',
            short_answer: 'Ce calculateur estime votre poids corporel idéal avec la formule de Devine, créée à l’origine pour aider au calcul des doses de médicaments, aujourd’hui largement utilisée comme référence générale de poids.',
            intro_text: '<p>La formule de Devine, publiée en 1974, estime le poids idéal uniquement à partir de la taille, avec un poids de départ fixe à 152 cm et un ajout linéaire par pouce supplémentaire. Elle a été conçue à l’origine pour les calculs de dosage médicamenteux.</p><p><b>Elle est aujourd’hui souvent citée</b> aux côtés de l’IMC comme référence générale de poids, bien qu’elle ne tienne pas compte de la masse musculaire, de la carrure ou de la composition corporelle — une personne athlétique dépassera souvent son poids "idéal" selon cette formule tout en étant parfaitement en bonne santé.</p>',
            key_points: [
                '<b>Formule de Devine (1974) :</b> Développée à l’origine pour les calculs de dosage médical, aujourd’hui utilisée comme référence générale de poids.',
                '<b>Basée uniquement sur la taille :</b> Contrairement à l’IMC, elle n’utilise pas le poids actuel — seulement la taille et le sexe.',
                '<b>Pas pour les athlètes :</b> Les personnes musclées apparaîtront souvent en "surpoids" selon cette formule malgré une composition corporelle saine.',
            ],
            howto: [
                { question: 'Le poids idéal de Devine est-il un poids sain ?', answer: '<p>Pas exactement — c’est un poids de référence créé à l’origine pour le dosage médical, pas un objectif personnalisé. Utilisez-le avec l’IMC et le pourcentage de masse grasse.</p>' },
                { question: 'Pourquoi la formule n’utilise-t-elle que la taille ?', answer: '<p>Elle a été conçue pour donner aux cliniciens un poids de base cohérent quelle que soit la carrure réelle du patient, d’où l’absence totale de prise en compte de la composition corporelle.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sexe', type: 'select', options: [{ value: '1', label: 'Homme' }, { value: '0', label: 'Femme' }] },
                { name: 'height_cm', label: 'Taille', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Poids Idéal', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Poids Idéal', unit: 'lb', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-peso-ideale-formula-devine',
            title: 'Calcolatore del Peso Ideale - Formula di Devine',
            h1: 'Calcolatore del Peso Corporeo Ideale',
            meta_title: 'Calcolatore Peso Ideale | Formula di Devine',
            meta_description: 'Calcola il tuo peso corporeo ideale con la formula di Devine — la formula di riferimento standard in medicina clinica, basata su altezza e sesso.',
            short_answer: 'Questo calcolatore stima il tuo peso corporeo ideale con la formula di Devine, creata originariamente per aiutare a calcolare i dosaggi dei farmaci, oggi ampiamente usata come riferimento generale di peso.',
            intro_text: '<p>La formula di Devine, pubblicata nel 1974, stima il peso ideale solo in base all’altezza, con un peso iniziale fisso a 152 cm e un\'aggiunta lineare per ogni pollice in più. Fu originariamente progettata per i calcoli del dosaggio farmacologico.</p><p><b>Oggi viene spesso citata</b> insieme al BMI come riferimento generale di peso, sebbene non consideri la massa muscolare, la corporatura o la composizione corporea — una persona atletica supererà spesso il proprio peso "ideale" secondo questa formula pur essendo perfettamente sana.</p>',
            key_points: [
                '<b>Formula di Devine (1974):</b> Originariamente sviluppata per calcoli di dosaggio medico, ora usata come riferimento generale di peso.',
                '<b>Basata solo sull’altezza:</b> A differenza del BMI, non usa il peso attuale come input — solo altezza e sesso.',
                '<b>Non per gli atleti:</b> Le persone muscolose spesso risulteranno "in sovrappeso" secondo questa formula nonostante una composizione corporea sana.',
            ],
            howto: [
                { question: 'Il peso ideale di Devine è un peso sano?', answer: '<p>Non esattamente — è un peso di riferimento creato originariamente per il dosaggio medico, non un obiettivo personalizzato. Usalo insieme al BMI e alla percentuale di massa grassa.</p>' },
                { question: 'Perché la formula usa solo l’altezza?', answer: '<p>È stata progettata per dare ai medici un peso di base coerente indipendentemente dalla corporatura reale del paziente, per questo ignora completamente la composizione corporea.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Sesso', type: 'select', options: [{ value: '1', label: 'Uomo' }, { value: '0', label: 'Donna' }] },
                { name: 'height_cm', label: 'Altezza', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Peso Ideale', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Peso Ideale', unit: 'lb', precision: 1 },
            ],
        },
        de: {
            slug: 'idealgewicht-rechner-devine-formel',
            title: 'Idealgewicht-Rechner - Devine-Formel',
            h1: 'Idealgewicht-Rechner',
            meta_title: 'Idealgewicht-Rechner | Devine-Formel',
            meta_description: 'Berechnen Sie Ihr Idealgewicht mit der Devine-Formel — der klinischen Standardformel, basierend auf Größe und Geschlecht.',
            short_answer: 'Dieser Rechner schätzt Ihr Idealgewicht mit der Devine-Formel, die ursprünglich zur Berechnung von Medikamentendosierungen entwickelt wurde und heute weit verbreitet als allgemeiner Gewichtsreferenzwert dient.',
            intro_text: '<p>Die Devine-Formel, veröffentlicht 1974, schätzt das Idealgewicht allein anhand der Körpergröße, mit einem festen Startgewicht bei 152 cm und einer linearen Zunahme pro Zoll darüber. Sie wurde ursprünglich für Dosierungsberechnungen in der Medizin entwickelt.</p><p><b>Sie wird heute häufig</b> neben dem BMI als allgemeiner Gewichtsreferenzwert genannt, berücksichtigt jedoch weder Muskelmasse noch Körperbau oder Körperzusammensetzung — eine athletische Person wird ihr "Idealgewicht" nach dieser Formel oft überschreiten und dabei völlig gesund sein.</p>',
            key_points: [
                '<b>Devine-Formel (1974):</b> Ursprünglich für medizinische Dosierungsberechnungen entwickelt, heute als allgemeiner Gewichtsreferenzwert genutzt.',
                '<b>Nur größenbasiert:</b> Im Gegensatz zum BMI wird das aktuelle Gewicht nicht einbezogen — nur Größe und Geschlecht.',
                '<b>Nicht für Sportler:</b> Muskulöse Personen werden nach dieser Formel oft als "übergewichtig" eingestuft, trotz gesunder Körperzusammensetzung.',
            ],
            howto: [
                { question: 'Ist das Devine-Idealgewicht ein gesundes Gewicht?', answer: '<p>Nicht ganz — es ist ein Referenzgewicht, das ursprünglich für die medizinische Dosierung entwickelt wurde, kein persönliches Zielgewicht. Nutzen Sie es zusammen mit BMI und Körperfettanteil.</p>' },
                { question: 'Warum verwendet die Formel nur die Größe?', answer: '<p>Sie wurde entwickelt, um Ärzten ein konsistentes Basisgewicht unabhängig vom tatsächlichen Körperbau des Patienten zu geben, weshalb die Körperzusammensetzung völlig ignoriert wird.</p>' },
            ],
            inputs: [
                { name: 'is_male', label: 'Geschlecht', type: 'select', options: [{ value: '1', label: 'Männlich' }, { value: '0', label: 'Weiblich' }] },
                { name: 'height_cm', label: 'Größe', type: 'number', unit: 'cm', min: 140, max: 220, placeholder: '170' },
            ],
            outputs: [
                { name: 'ibw_kg', label: 'Idealgewicht', unit: 'kg', precision: 1 },
                { name: 'ibw_lbs', label: 'Idealgewicht', unit: 'lb', precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1008: Waist-to-Hip Ratio Calculator
// ============================================================
const waistToHip: ToolDef = {
    id: '1008',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'waist_cm', default: 85 },
            { key: 'hip_cm', default: 100 },
        ],
        formulas: {
            whr: 'waist_cm / hip_cm',
        },
        outputs: [{ key: 'whr', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'waist-to-hip-ratio-calculator',
            title: 'Waist-to-Hip Ratio Calculator',
            h1: 'Waist-to-Hip Ratio Calculator',
            meta_title: 'Waist-to-Hip Ratio Calculator | WHR',
            meta_description: 'Calculate your waist-to-hip ratio (WHR), a simple measurement the WHO uses to assess health risk related to fat distribution.',
            short_answer: 'This calculator divides your waist circumference by your hip circumference to give your Waist-to-Hip Ratio (WHR) — a simple indicator the World Health Organization uses alongside BMI to assess fat distribution risk.',
            intro_text: '<p>Waist-to-Hip Ratio (WHR) compares the circumference of your waist to your hips. Unlike BMI, which only considers total body mass, WHR reflects where fat is distributed — abdominal ("apple-shaped") fat carries more cardiovascular risk than fat stored around the hips ("pear-shaped"), even at the same body weight.</p><p><b>The WHO classifies risk</b> using WHR thresholds: for men, a ratio above 0.90 indicates increased risk; for women, above 0.85. It takes only two tape-measure readings, making it one of the fastest health screening tools available.</p>',
            key_points: [
                '<b>Two Measurements Only:</b> Just waist and hip circumference — no scale, height, or age needed.',
                '<b>WHO Risk Thresholds:</b> Above 0.90 (men) or 0.85 (women) is associated with increased cardiovascular risk.',
                '<b>Complements BMI:</b> Two people with the same BMI can have very different health risk depending on fat distribution — WHR captures that difference.',
            ],
            howto: [
                { question: 'How do I measure my hips correctly?', answer: '<p>Measure around the widest part of your hips/buttocks, keeping the tape horizontal and snug but not compressing the skin.</p>' },
                { question: 'What WHR is considered healthy?', answer: '<p>The WHO considers below 0.90 for men and below 0.85 for women to be in the lower-risk range, though this should be considered alongside other health markers.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Waist Circumference', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Measured at navel level.' },
                { name: 'hip_cm', label: 'Hip Circumference', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Measured at the widest point.' },
            ],
            outputs: [{ name: 'whr', label: 'Waist-to-Hip Ratio', precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-otnosheniya-taliya-bedra',
            title: 'Калькулятор отношения талии к бёдрам (WHR)',
            h1: 'Калькулятор отношения талии к бёдрам',
            meta_title: 'Калькулятор WHR | Отношение талии к бёдрам',
            meta_description: 'Рассчитайте отношение талии к бёдрам (WHR) — простой показатель, который ВОЗ использует для оценки риска, связанного с распределением жира.',
            short_answer: 'Этот калькулятор делит обхват талии на обхват бёдер, чтобы получить отношение талии к бёдрам (WHR) — простой показатель, который ВОЗ использует наряду с ИМТ для оценки риска распределения жира.',
            intro_text: '<p>Отношение талии к бёдрам (WHR) сравнивает обхват талии с обхватом бёдер. В отличие от ИМТ, который учитывает только общую массу тела, WHR отражает, где распределён жир — абдоминальный жир («яблоко») несёт больший сердечно-сосудистый риск, чем жир вокруг бёдер («груша»), даже при одинаковом весе.</p><p><b>ВОЗ классифицирует риск</b>, используя пороги WHR: для мужчин показатель выше 0.90 указывает на повышенный риск; для женщин — выше 0.85. Требуется всего два замера сантиметровой лентой.</p>',
            key_points: [
                '<b>Всего два измерения:</b> Только обхват талии и бёдер — не нужны весы, рост или возраст.',
                '<b>Пороги риска по ВОЗ:</b> Выше 0.90 (мужчины) или 0.85 (женщины) связано с повышенным сердечно-сосудистым риском.',
                '<b>Дополняет ИМТ:</b> Два человека с одинаковым ИМТ могут иметь разный риск в зависимости от распределения жира — WHR отражает эту разницу.',
            ],
            howto: [
                { question: 'Как правильно измерить бёдра?', answer: '<p>Измеряйте по самой широкой части бёдер/ягодиц, держа ленту горизонтально и плотно, но не сдавливая кожу.</p>' },
                { question: 'Какой WHR считается здоровым?', answer: '<p>ВОЗ считает показатель ниже 0.90 для мужчин и ниже 0.85 для женщин зоной пониженного риска, но это стоит рассматривать вместе с другими показателями здоровья.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Обхват талии', type: 'number', unit: 'см', min: 40, max: 200, placeholder: '85', description: 'Измеряется на уровне пупка.' },
                { name: 'hip_cm', label: 'Обхват бёдер', type: 'number', unit: 'см', min: 50, max: 200, placeholder: '100', description: 'Измеряется в самой широкой точке.' },
            ],
            outputs: [{ name: 'whr', label: 'Отношение талии к бёдрам', precision: 2 }],
        },
        lv: {
            slug: 'vidukla-un-gurnu-attieciba-kalkulators',
            title: 'Vidukļa un gurnu attiecības kalkulators (WHR)',
            h1: 'Vidukļa un Gurnu Attiecības Kalkulators',
            meta_title: 'WHR kalkulators | Vidukļa un gurnu attiecība',
            meta_description: 'Aprēķiniet vidukļa un gurnu attiecību (WHR) — vienkāršu rādītāju, ko PVO izmanto, lai novērtētu ar tauku sadalījumu saistīto risku.',
            short_answer: 'Šis kalkulators dala vidukļa apkārtmēru ar gurnu apkārtmēru, lai iegūtu vidukļa un gurnu attiecību (WHR) — vienkāršu rādītāju, ko PVO izmanto līdzās ĶMI, lai novērtētu tauku sadalījuma risku.',
            intro_text: '<p>Vidukļa un gurnu attiecība (WHR) salīdzina vidukļa apkārtmēru ar gurnu apkārtmēru. Atšķirībā no ĶMI, kas ņem vērā tikai kopējo ķermeņa masu, WHR atspoguļo, kur tauki ir sadalīti — vēdera tauki ("ābola forma") nes lielāku sirds un asinsvadu risku nekā tauki ap gurniem ("bumbiera forma"), pat pie vienāda svara.</p><p><b>PVO klasificē risku</b>, izmantojot WHR robežvērtības: vīriešiem attiecība virs 0.90 norāda uz paaugstinātu risku; sievietēm — virs 0.85. Nepieciešami tikai divi mērījumi ar mērlenti.</p>',
            key_points: [
                '<b>Tikai divi mērījumi:</b> Vidukļa un gurnu apkārtmērs — nav nepieciešami svari, augums vai vecums.',
                '<b>PVO riska robežas:</b> Virs 0.90 (vīriešiem) vai 0.85 (sievietēm) saistīts ar paaugstinātu sirds un asinsvadu risku.',
                '<b>Papildina ĶMI:</b> Diviem cilvēkiem ar vienādu ĶMI var būt atšķirīgs risks atkarībā no tauku sadalījuma — WHR atspoguļo šo atšķirību.',
            ],
            howto: [
                { question: 'Kā pareizi izmērīt gurnus?', answer: '<p>Mēriet vispētjākajā gurnu/sēžamvietas daļā, turot lenti horizontāli un cieši, bet nesaspiežot ādu.</p>' },
                { question: 'Kāda WHR tiek uzskatīta par veselīgu?', answer: '<p>PVO uzskata, ka zem 0.90 vīriešiem un zem 0.85 sievietēm ir zemāka riska zona, taču tas jāskata kopā ar citiem veselības rādītājiem.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Vidukļa apkārtmērs', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Mērīts nabas līmenī.' },
                { name: 'hip_cm', label: 'Gurnu apkārtmērs', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Mērīts platākajā vietā.' },
            ],
            outputs: [{ name: 'whr', label: 'Vidukļa un gurnu attiecība', precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-stosunku-talii-do-bioder',
            title: 'Kalkulator Stosunku Talii do Bioder (WHR)',
            h1: 'Kalkulator Stosunku Talii do Bioder',
            meta_title: 'Kalkulator WHR | Stosunek talii do bioder',
            meta_description: 'Oblicz stosunek talii do bioder (WHR) — prosty wskaźnik, który WHO wykorzystuje do oceny ryzyka związanego z rozkładem tkanki tłuszczowej.',
            short_answer: 'Ten kalkulator dzieli obwód talii przez obwód bioder, aby uzyskać stosunek talii do bioder (WHR) — prosty wskaźnik, który WHO stosuje obok BMI do oceny ryzyka rozkładu tłuszczu.',
            intro_text: '<p>Stosunek talii do bioder (WHR) porównuje obwód talii z obwodem bioder. W przeciwieństwie do BMI, które uwzględnia tylko całkowitą masę ciała, WHR odzwierciedla, gdzie rozłożony jest tłuszcz — tłuszcz brzuszny ("kształt jabłka") niesie większe ryzyko sercowo-naczyniowe niż tłuszcz wokół bioder ("kształt gruszki"), nawet przy tej samej wadze.</p><p><b>WHO klasyfikuje ryzyko</b>, używając progów WHR: dla mężczyzn wskaźnik powyżej 0,90 oznacza zwiększone ryzyko; dla kobiet — powyżej 0,85. Wystarczą tylko dwa pomiary miarką.</p>',
            key_points: [
                '<b>Tylko dwa pomiary:</b> Obwód talii i bioder — nie są potrzebne waga, wzrost ani wiek.',
                '<b>Progi ryzyka WHO:</b> Powyżej 0,90 (mężczyźni) lub 0,85 (kobiety) wiąże się ze zwiększonym ryzykiem sercowo-naczyniowym.',
                '<b>Uzupełnia BMI:</b> Dwie osoby o tym samym BMI mogą mieć bardzo różne ryzyko zdrowotne w zależności od rozkładu tłuszczu — WHR uchwytuje tę różnicę.',
            ],
            howto: [
                { question: 'Jak poprawnie zmierzyć biodra?', answer: '<p>Mierz w najszerszym miejscu bioder/pośladków, trzymając miarkę poziomo i ściśle, ale nie uciskając skóry.</p>' },
                { question: 'Jaki WHR jest uważany za zdrowy?', answer: '<p>WHO uważa wartości poniżej 0,90 dla mężczyzn i poniżej 0,85 dla kobiet za strefę niższego ryzyka, choć należy to rozpatrywać razem z innymi wskaźnikami zdrowia.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Obwód talii', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Mierzony na wysokości pępka.' },
                { name: 'hip_cm', label: 'Obwód bioder', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Mierzony w najszerszym punkcie.' },
            ],
            outputs: [{ name: 'whr', label: 'Stosunek talii do bioder', precision: 2 }],
        },
        es: {
            slug: 'calculadora-relacion-cintura-cadera',
            title: 'Calculadora de Relación Cintura-Cadera (WHR)',
            h1: 'Calculadora de Relación Cintura-Cadera',
            meta_title: 'Calculadora WHR | Relación Cintura-Cadera',
            meta_description: 'Calcula tu relación cintura-cadera (WHR), un indicador simple que la OMS usa para evaluar el riesgo relacionado con la distribución de grasa.',
            short_answer: 'Esta calculadora divide tu circunferencia de cintura entre tu circunferencia de cadera para dar tu relación cintura-cadera (WHR) — un indicador simple que la OMS usa junto al IMC para evaluar el riesgo de distribución de grasa.',
            intro_text: '<p>La relación cintura-cadera (WHR) compara la circunferencia de tu cintura con la de tus caderas. A diferencia del IMC, que solo considera la masa corporal total, el WHR refleja dónde se distribuye la grasa — la grasa abdominal ("forma de manzana") conlleva más riesgo cardiovascular que la grasa alrededor de las caderas ("forma de pera"), incluso con el mismo peso corporal.</p><p><b>La OMS clasifica el riesgo</b> usando umbrales de WHR: para hombres, una relación superior a 0,90 indica mayor riesgo; para mujeres, superior a 0,85. Solo requiere dos medidas con cinta métrica.</p>',
            key_points: [
                '<b>Solo dos medidas:</b> Circunferencia de cintura y cadera — no se necesita báscula, altura ni edad.',
                '<b>Umbrales de riesgo de la OMS:</b> Por encima de 0,90 (hombres) o 0,85 (mujeres) se asocia con mayor riesgo cardiovascular.',
                '<b>Complementa el IMC:</b> Dos personas con el mismo IMC pueden tener un riesgo muy diferente según la distribución de grasa — el WHR capta esa diferencia.',
            ],
            howto: [
                { question: '¿Cómo mido correctamente mis caderas?', answer: '<p>Mide alrededor de la parte más ancha de tus caderas/glúteos, manteniendo la cinta horizontal y ajustada sin comprimir la piel.</p>' },
                { question: '¿Qué WHR se considera saludable?', answer: '<p>La OMS considera saludable un valor por debajo de 0,90 en hombres y 0,85 en mujeres, aunque debe evaluarse junto a otros indicadores de salud.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Circunferencia de Cintura', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Medida a la altura del ombligo.' },
                { name: 'hip_cm', label: 'Circunferencia de Cadera', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Medida en el punto más ancho.' },
            ],
            outputs: [{ name: 'whr', label: 'Relación Cintura-Cadera', precision: 2 }],
        },
        fr: {
            slug: 'calculateur-rapport-taille-hanches',
            title: 'Calculateur du Rapport Taille-Hanches (WHR)',
            h1: 'Calculateur du Rapport Taille-Hanches',
            meta_title: 'Calculateur WHR | Rapport Taille-Hanches',
            meta_description: 'Calculez votre rapport taille-hanches (WHR), un indicateur simple utilisé par l’OMS pour évaluer le risque lié à la répartition des graisses.',
            short_answer: 'Ce calculateur divise votre tour de taille par votre tour de hanches pour donner votre rapport taille-hanches (WHR) — un indicateur simple que l’OMS utilise avec l’IMC pour évaluer le risque de répartition des graisses.',
            intro_text: '<p>Le rapport taille-hanches (WHR) compare le tour de taille au tour de hanches. Contrairement à l’IMC, qui ne considère que la masse corporelle totale, le WHR reflète où la graisse est répartie — la graisse abdominale ("forme pomme") comporte plus de risque cardiovasculaire que la graisse autour des hanches ("forme poire"), même à poids égal.</p><p><b>L’OMS classe le risque</b> selon des seuils de WHR : pour les hommes, un rapport supérieur à 0,90 indique un risque accru ; pour les femmes, supérieur à 0,85. Seules deux mesures au mètre ruban sont nécessaires.</p>',
            key_points: [
                '<b>Seulement deux mesures :</b> Tour de taille et de hanches — pas besoin de balance, taille ni âge.',
                '<b>Seuils de risque de l’OMS :</b> Au-dessus de 0,90 (hommes) ou 0,85 (femmes), le risque cardiovasculaire est accru.',
                '<b>Complète l’IMC :</b> Deux personnes avec le même IMC peuvent avoir un risque très différent selon la répartition des graisses — le WHR capture cette différence.',
            ],
            howto: [
                { question: 'Comment mesurer correctement mes hanches ?', answer: '<p>Mesurez autour de la partie la plus large de vos hanches/fessiers, en gardant le mètre ruban horizontal et ajusté sans comprimer la peau.</p>' },
                { question: 'Quel WHR est considéré comme sain ?', answer: '<p>L’OMS considère qu’en dessous de 0,90 pour les hommes et 0,85 pour les femmes se situe la zone à moindre risque, à évaluer avec d’autres indicateurs de santé.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Tour de Taille', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Mesuré au niveau du nombril.' },
                { name: 'hip_cm', label: 'Tour de Hanches', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Mesuré au point le plus large.' },
            ],
            outputs: [{ name: 'whr', label: 'Rapport Taille-Hanches', precision: 2 }],
        },
        it: {
            slug: 'calcolatore-rapporto-vita-fianchi',
            title: 'Calcolatore del Rapporto Vita-Fianchi (WHR)',
            h1: 'Calcolatore del Rapporto Vita-Fianchi',
            meta_title: 'Calcolatore WHR | Rapporto Vita-Fianchi',
            meta_description: 'Calcola il tuo rapporto vita-fianchi (WHR), un indicatore semplice usato dall’OMS per valutare il rischio legato alla distribuzione del grasso.',
            short_answer: 'Questo calcolatore divide la circonferenza vita per la circonferenza fianchi per dare il tuo rapporto vita-fianchi (WHR) — un indicatore semplice che l’OMS usa insieme al BMI per valutare il rischio di distribuzione del grasso.',
            intro_text: '<p>Il rapporto vita-fianchi (WHR) confronta la circonferenza della vita con quella dei fianchi. A differenza del BMI, che considera solo la massa corporea totale, il WHR riflette dove è distribuito il grasso — il grasso addominale ("a mela") comporta più rischio cardiovascolare del grasso attorno ai fianchi ("a pera"), anche a parità di peso corporeo.</p><p><b>L’OMS classifica il rischio</b> usando soglie WHR: per gli uomini, un rapporto superiore a 0,90 indica rischio aumentato; per le donne, superiore a 0,85. Servono solo due misurazioni con il metro da sarta.</p>',
            key_points: [
                '<b>Solo due misurazioni:</b> Circonferenza vita e fianchi — non servono bilancia, altezza o età.',
                '<b>Soglie di rischio OMS:</b> Sopra 0,90 (uomini) o 0,85 (donne) è associato a maggior rischio cardiovascolare.',
                '<b>Completa il BMI:</b> Due persone con lo stesso BMI possono avere un rischio molto diverso a seconda della distribuzione del grasso — il WHR coglie questa differenza.',
            ],
            howto: [
                { question: 'Come misuro correttamente i fianchi?', answer: '<p>Misura nel punto più largo di fianchi/glutei, tenendo il metro orizzontale e aderente senza comprimere la pelle.</p>' },
                { question: 'Quale WHR è considerato sano?', answer: '<p>L’OMS considera sotto 0,90 per gli uomini e sotto 0,85 per le donne come zona a rischio più basso, da valutare insieme ad altri indicatori di salute.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Circonferenza Vita', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Misurata all’altezza dell’ombelico.' },
                { name: 'hip_cm', label: 'Circonferenza Fianchi', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Misurata nel punto più largo.' },
            ],
            outputs: [{ name: 'whr', label: 'Rapporto Vita-Fianchi', precision: 2 }],
        },
        de: {
            slug: 'taille-hueft-verhaeltnis-rechner',
            title: 'Taille-Hüft-Verhältnis-Rechner (WHR)',
            h1: 'Taille-Hüft-Verhältnis-Rechner',
            meta_title: 'WHR-Rechner | Taille-Hüft-Verhältnis',
            meta_description: 'Berechnen Sie Ihr Taille-Hüft-Verhältnis (WHR), einen einfachen Messwert, den die WHO zur Risikobewertung der Fettverteilung nutzt.',
            short_answer: 'Dieser Rechner teilt Ihren Taillenumfang durch Ihren Hüftumfang, um Ihr Taille-Hüft-Verhältnis (WHR) zu ermitteln — einen einfachen Indikator, den die WHO neben dem BMI zur Bewertung des Fettverteilungsrisikos nutzt.',
            intro_text: '<p>Das Taille-Hüft-Verhältnis (WHR) vergleicht den Umfang Ihrer Taille mit dem Ihrer Hüfte. Anders als der BMI, der nur die Gesamtkörpermasse berücksichtigt, spiegelt WHR wider, wo Fett verteilt ist — Bauchfett ("Apfelform") birgt ein höheres Herz-Kreislauf-Risiko als Fett um die Hüfte ("Birnenform"), selbst bei gleichem Körpergewicht.</p><p><b>Die WHO klassifiziert das Risiko</b> anhand von WHR-Schwellenwerten: Bei Männern zeigt ein Verhältnis über 0,90 erhöhtes Risiko an; bei Frauen über 0,85. Es sind nur zwei Maßband-Messungen nötig.</p>',
            key_points: [
                '<b>Nur zwei Messungen:</b> Taillen- und Hüftumfang — keine Waage, Größe oder Alter nötig.',
                '<b>WHO-Risikoschwellen:</b> Über 0,90 (Männer) oder 0,85 (Frauen) ist mit erhöhtem Herz-Kreislauf-Risiko verbunden.',
                '<b>Ergänzt den BMI:</b> Zwei Personen mit demselben BMI können je nach Fettverteilung ein sehr unterschiedliches Gesundheitsrisiko haben — WHR erfasst diesen Unterschied.',
            ],
            howto: [
                { question: 'Wie messe ich meine Hüfte richtig?', answer: '<p>Messen Sie um die breiteste Stelle von Hüfte/Gesäß, wobei das Maßband horizontal und eng anliegt, ohne die Haut einzudrücken.</p>' },
                { question: 'Welcher WHR gilt als gesund?', answer: '<p>Die WHO betrachtet Werte unter 0,90 bei Männern und unter 0,85 bei Frauen als risikoärmeren Bereich, was jedoch zusammen mit anderen Gesundheitsmarkern betrachtet werden sollte.</p>' },
            ],
            inputs: [
                { name: 'waist_cm', label: 'Taillenumfang', type: 'number', unit: 'cm', min: 40, max: 200, placeholder: '85', description: 'Gemessen auf Nabelhöhe.' },
                { name: 'hip_cm', label: 'Hüftumfang', type: 'number', unit: 'cm', min: 50, max: 200, placeholder: '100', description: 'Gemessen an der breitesten Stelle.' },
            ],
            outputs: [{ name: 'whr', label: 'Taille-Hüft-Verhältnis', precision: 2 }],
        },
    },
}

// ============================================================
// 1009: Daily Water Intake Calculator
// ============================================================
const waterIntake: ToolDef = {
    id: '1009',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'weight_kg', default: 70 },
            { key: 'activity_minutes', default: 0 },
        ],
        formulas: {
            water_liters: 'weight_kg*0.033 + (activity_minutes/30)*0.35',
            water_cups: '(weight_kg*0.033 + (activity_minutes/30)*0.35) * 4.22675',
        },
        outputs: [
            { key: 'water_liters', precision: 2 },
            { key: 'water_cups', precision: 1 },
        ],
    },
    locales: {
        en: {
            slug: 'daily-water-intake-calculator',
            title: 'Daily Water Intake Calculator',
            h1: 'Daily Water Intake Calculator',
            meta_title: 'Water Intake Calculator | How Much Water Should I Drink',
            meta_description: 'Calculate how much water you should drink daily based on your body weight and activity level, using a standard hydration formula.',
            short_answer: 'This calculator estimates your recommended daily water intake based on your body weight, plus an extra allowance for physical activity — a practical starting point for staying properly hydrated.',
            intro_text: '<p>Daily water needs scale with body size: a common clinical guideline is roughly 33 ml of water per kilogram of body weight per day as a baseline, before accounting for exercise, climate, or other fluid losses. This calculator uses that baseline and adds an activity adjustment for time spent exercising.</p><p><b>This is a starting estimate</b>, not a strict medical prescription — individual needs vary with climate, diet (fruits and vegetables contribute water too), and health conditions. Thirst, urine color, and how you feel remain the most reliable everyday indicators.</p>',
            key_points: [
                '<b>Weight-Based Baseline:</b> Uses ~33 ml per kg of body weight as the resting daily water need.',
                '<b>Activity Adjustment:</b> Adds extra fluid for each 30 minutes of exercise to account for sweat loss.',
                '<b>General Guideline Only:</b> Climate, diet, and individual health conditions can shift actual needs — this is a practical starting point, not a medical prescription.',
            ],
            howto: [
                { question: 'Does coffee or tea count toward water intake?', answer: '<p>Yes, in moderation — while caffeine has a mild diuretic effect, normal coffee/tea consumption still contributes net positive fluid intake for most people.</p>' },
                { question: 'Should I drink more water in hot weather?', answer: '<p>Yes — this calculator gives a baseline; add more fluid on hot days or during intense sweating beyond what the activity field already accounts for.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Body Weight', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Daily Exercise', type: 'number', unit: 'minutes/day', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Recommended Water Intake', unit: 'L/day', precision: 2 },
                { name: 'water_cups', label: 'Recommended Water Intake', unit: 'cups/day', precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-normy-vody-v-den',
            title: 'Калькулятор суточной нормы воды',
            h1: 'Калькулятор суточной нормы воды',
            meta_title: 'Калькулятор воды | Сколько воды пить в день',
            meta_description: 'Рассчитайте, сколько воды нужно пить в день, исходя из веса тела и уровня активности, по стандартной формуле гидратации.',
            short_answer: 'Этот калькулятор оценивает рекомендуемую суточную норму воды на основе веса тела плюс дополнительный объём для физической активности.',
            intro_text: '<p>Суточная потребность в воде зависит от размера тела: распространённый ориентир — около 33 мл воды на килограмм веса в день как базовый уровень, до учёта тренировок, климата или других потерь жидкости. Калькулятор использует этот базовый уровень и добавляет поправку на время тренировок.</p><p><b>Это отправная оценка</b>, а не строгий медицинский рецепт — индивидуальные потребности зависят от климата, питания (овощи и фрукты тоже содержат воду) и состояния здоровья. Жажда, цвет мочи и самочувствие остаются самыми надёжными повседневными индикаторами.</p>',
            key_points: [
                '<b>Базовый уровень по весу:</b> Использует ~33 мл на кг веса как суточную потребность в покое.',
                '<b>Поправка на активность:</b> Добавляет жидкость за каждые 30 минут тренировки для компенсации потоотделения.',
                '<b>Только общий ориентир:</b> Климат, питание и здоровье могут менять реальную потребность — это практическая отправная точка, не медицинский рецепт.',
            ],
            howto: [
                { question: 'Считается ли кофе или чай водой?', answer: '<p>Да, в умеренных количествах — хотя кофеин обладает лёгким мочегонным эффектом, обычное потребление кофе/чая всё равно даёт положительный баланс жидкости для большинства людей.</p>' },
                { question: 'Нужно ли пить больше воды в жару?', answer: '<p>Да — этот калькулятор даёт базовый уровень; добавляйте больше жидкости в жаркие дни или при сильном потоотделении сверх того, что уже учтено в поле активности.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Вес тела', type: 'number', unit: 'кг', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Ежедневная тренировка', type: 'number', unit: 'мин/день', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Рекомендуемая норма воды', unit: 'л/день', precision: 2 },
                { name: 'water_cups', label: 'Рекомендуемая норма воды', unit: 'стаканов/день', precision: 1 },
            ],
        },
        lv: {
            slug: 'udens-normas-kalkulators-dienai',
            title: 'Ūdens Normas Kalkulators Dienai',
            h1: 'Dienas Ūdens Normas Kalkulators',
            meta_title: 'Ūdens Kalkulators | Cik Daudz Ūdens Dzert Dienā',
            meta_description: 'Aprēķiniet, cik daudz ūdens jādzer dienā, balstoties uz ķermeņa svaru un aktivitātes līmeni, izmantojot standarta hidratācijas formulu.',
            short_answer: 'Šis kalkulators novērtē ieteicamo dienas ūdens normu, balstoties uz ķermeņa svaru, plus papildu daudzumu fiziskajai aktivitātei.',
            intro_text: '<p>Dienas ūdens vajadzība ir saistīta ar ķermeņa lielumu: izplatīta vadlīnija ir aptuveni 33 ml ūdens uz kilogramu svara dienā kā bāzes līmenis, pirms ņemt vērā treniņus, klimatu vai citus šķidruma zudumus. Kalkulators izmanto šo bāzes līmeni un pievieno korekciju par treniņu laiku.</p><p><b>Šī ir sākotnēja novērtēšana</b>, nevis stingra medicīniska recepte — individuālās vajadzības atšķiras atkarībā no klimata, uztura un veselības stāvokļa. Slāpes, urīna krāsa un pašsajūta joprojām ir uzticamākie ikdienas rādītāji.</p>',
            key_points: [
                '<b>Bāzes līmenis pēc svara:</b> Izmanto ~33 ml uz kg svara kā dienas vajadzību miera stāvoklī.',
                '<b>Aktivitātes korekcija:</b> Pievieno papildu šķidrumu par katrām 30 treniņu minūtēm, lai kompensētu sviedru zudumu.',
                '<b>Tikai vispārīga vadlīnija:</b> Klimats, uzturs un veselības stāvoklis var mainīt reālo vajadzību — tas ir praktisks sākumpunkts, nevis medicīniska recepte.',
            ],
            howto: [
                { question: 'Vai kafija vai tēja skaitās kā ūdens?', answer: '<p>Jā, mērenā daudzumā — lai gan kofeīnam ir viegla diurētiska iedarbība, parasts kafijas/tējas patēriņš joprojām dod pozitīvu šķidruma bilanci lielākajai daļai cilvēku.</p>' },
                { question: 'Vai karstā laikā jādzer vairāk ūdens?', answer: '<p>Jā — šis kalkulators dod bāzes līmeni; pievienojiet vairāk šķidruma karstās dienās vai spēcīgas svīšanas gadījumā papildus tam, kas jau ņemts vērā aktivitātes laukā.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Ķermeņa svars', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Dienas treniņš', type: 'number', unit: 'min/dienā', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Ieteicamā ūdens norma', unit: 'l/dienā', precision: 2 },
                { name: 'water_cups', label: 'Ieteicamā ūdens norma', unit: 'glāzes/dienā', precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-dziennego-zapotrzebowania-na-wode',
            title: 'Kalkulator Dziennego Zapotrzebowania na Wodę',
            h1: 'Kalkulator Dziennego Zapotrzebowania na Wodę',
            meta_title: 'Kalkulator Wody | Ile Wody Pić Dziennie',
            meta_description: 'Oblicz, ile wody powinieneś pić dziennie na podstawie wagi ciała i poziomu aktywności, korzystając ze standardowej formuły nawodnienia.',
            short_answer: 'Ten kalkulator szacuje zalecane dzienne spożycie wody na podstawie wagi ciała, plus dodatkową ilość na aktywność fizyczną.',
            intro_text: '<p>Dzienne zapotrzebowanie na wodę zależy od wielkości ciała: powszechną wytyczną jest około 33 ml wody na kilogram wagi dziennie jako poziom bazowy, przed uwzględnieniem ćwiczeń, klimatu czy innych strat płynów. Kalkulator wykorzystuje ten poziom bazowy i dodaje korektę za czas spędzony na ćwiczeniach.</p><p><b>To wstępne oszacowanie</b>, a nie ścisła recepta medyczna — indywidualne potrzeby różnią się w zależności od klimatu, diety i stanu zdrowia. Pragnienie, kolor moczu i samopoczucie pozostają najbardziej wiarygodnymi codziennymi wskaźnikami.</p>',
            key_points: [
                '<b>Poziom bazowy według wagi:</b> Używa ~33 ml na kg wagi jako dziennego zapotrzebowania w spoczynku.',
                '<b>Korekta aktywności:</b> Dodaje dodatkowy płyn za każde 30 minut ćwiczeń, aby zrekompensować utratę potu.',
                '<b>Tylko ogólna wytyczna:</b> Klimat, dieta i stan zdrowia mogą zmieniać rzeczywiste zapotrzebowanie — to praktyczny punkt wyjścia, nie recepta medyczna.',
            ],
            howto: [
                { question: 'Czy kawa lub herbata liczą się jako woda?', answer: '<p>Tak, w umiarkowanych ilościach — choć kofeina ma łagodne działanie moczopędne, normalne spożycie kawy/herbaty nadal daje dodatni bilans płynów dla większości ludzi.</p>' },
                { question: 'Czy w upale trzeba pić więcej wody?', answer: '<p>Tak — ten kalkulator podaje poziom bazowy; dodaj więcej płynów w upalne dni lub przy intensywnym poceniu ponad to, co już uwzględnia pole aktywności.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Waga ciała', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Dzienne ćwiczenia', type: 'number', unit: 'min/dzień', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Zalecane spożycie wody', unit: 'l/dzień', precision: 2 },
                { name: 'water_cups', label: 'Zalecane spożycie wody', unit: 'szklanek/dzień', precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-consumo-diario-de-agua',
            title: 'Calculadora de Consumo Diario de Agua',
            h1: 'Calculadora de Consumo Diario de Agua',
            meta_title: 'Calculadora de Agua | Cuánta Agua Debo Beber al Día',
            meta_description: 'Calcula cuánta agua deberías beber al día según tu peso corporal y nivel de actividad, usando una fórmula de hidratación estándar.',
            short_answer: 'Esta calculadora estima tu consumo diario de agua recomendado según tu peso corporal, más una cantidad adicional para la actividad física.',
            intro_text: '<p>Las necesidades diarias de agua escalan con el tamaño corporal: una guía común es aproximadamente 33 ml de agua por kilogramo de peso al día como base, antes de considerar ejercicio, clima u otras pérdidas de líquido. Esta calculadora usa esa base y añade un ajuste por el tiempo dedicado al ejercicio.</p><p><b>Esta es una estimación inicial</b>, no una prescripción médica estricta — las necesidades individuales varían según el clima, la dieta y las condiciones de salud. La sed, el color de la orina y cómo te sientes siguen siendo los indicadores diarios más fiables.</p>',
            key_points: [
                '<b>Base según el peso:</b> Usa ~33 ml por kg de peso como necesidad diaria en reposo.',
                '<b>Ajuste por actividad:</b> Añade líquido extra por cada 30 minutos de ejercicio para compensar la pérdida por sudor.',
                '<b>Solo una guía general:</b> El clima, la dieta y la salud individual pueden cambiar la necesidad real — es un punto de partida práctico, no una prescripción médica.',
            ],
            howto: [
                { question: '¿El café o el té cuentan como consumo de agua?', answer: '<p>Sí, con moderación — aunque la cafeína tiene un ligero efecto diurético, el consumo normal de café/té sigue aportando un balance neto positivo de líquidos para la mayoría de las personas.</p>' },
                { question: '¿Debo beber más agua en clima cálido?', answer: '<p>Sí — esta calculadora da una base; añade más líquido en días calurosos o con sudoración intensa más allá de lo que ya considera el campo de actividad.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Peso Corporal', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Ejercicio Diario', type: 'number', unit: 'min/día', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Consumo de Agua Recomendado', unit: 'L/día', precision: 2 },
                { name: 'water_cups', label: 'Consumo de Agua Recomendado', unit: 'tazas/día', precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-apport-quotidien-en-eau',
            title: 'Calculateur d’Apport Quotidien en Eau',
            h1: 'Calculateur d’Apport Quotidien en Eau',
            meta_title: 'Calculateur d’Eau | Combien d’Eau Boire par Jour',
            meta_description: 'Calculez combien d’eau vous devriez boire par jour selon votre poids corporel et votre niveau d’activité, avec une formule d’hydratation standard.',
            short_answer: 'Ce calculateur estime votre apport quotidien en eau recommandé selon votre poids corporel, plus une quantité supplémentaire pour l’activité physique.',
            intro_text: '<p>Les besoins quotidiens en eau évoluent avec la taille corporelle : une référence courante est d’environ 33 ml d’eau par kilogramme de poids et par jour comme base, avant de prendre en compte l’exercice, le climat ou d’autres pertes de liquide. Ce calculateur utilise cette base et ajoute un ajustement pour le temps passé à faire de l’exercice.</p><p><b>Ceci est une estimation de départ</b>, non une prescription médicale stricte — les besoins individuels varient selon le climat, l’alimentation et l’état de santé. La soif, la couleur des urines et votre ressenti restent les indicateurs quotidiens les plus fiables.</p>',
            key_points: [
                '<b>Base selon le poids :</b> Utilise ~33 ml par kg de poids comme besoin quotidien au repos.',
                '<b>Ajustement d’activité :</b> Ajoute du liquide supplémentaire pour chaque tranche de 30 minutes d’exercice afin de compenser la perte de sueur.',
                '<b>Simple référence générale :</b> Le climat, l’alimentation et la santé individuelle peuvent modifier le besoin réel — c’est un point de départ pratique, non une prescription médicale.',
            ],
            howto: [
                { question: 'Le café ou le thé comptent-ils dans l’apport en eau ?', answer: '<p>Oui, avec modération — bien que la caféine ait un léger effet diurétique, une consommation normale de café/thé apporte tout de même un bilan hydrique net positif pour la plupart des gens.</p>' },
                { question: 'Dois-je boire plus d’eau par temps chaud ?', answer: '<p>Oui — ce calculateur donne une base ; ajoutez plus de liquide les jours chauds ou en cas de transpiration intense au-delà de ce que le champ d’activité prend déjà en compte.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Poids Corporel', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Exercice Quotidien', type: 'number', unit: 'min/jour', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Apport en Eau Recommandé', unit: 'L/jour', precision: 2 },
                { name: 'water_cups', label: 'Apport en Eau Recommandé', unit: 'verres/jour', precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-assunzione-giornaliera-acqua',
            title: 'Calcolatore di Assunzione Giornaliera di Acqua',
            h1: 'Calcolatore di Assunzione Giornaliera di Acqua',
            meta_title: 'Calcolatore Acqua | Quanta Acqua Bere al Giorno',
            meta_description: 'Calcola quanta acqua dovresti bere ogni giorno in base al tuo peso corporeo e livello di attività, usando una formula di idratazione standard.',
            short_answer: 'Questo calcolatore stima la tua assunzione giornaliera di acqua raccomandata in base al peso corporeo, più una quantità extra per l’attività fisica.',
            intro_text: '<p>Il fabbisogno idrico giornaliero è proporzionale alla taglia corporea: una linea guida comune è circa 33 ml di acqua per chilogrammo di peso al giorno come base, prima di considerare esercizio, clima o altre perdite di liquidi. Questo calcolatore usa questa base e aggiunge una correzione per il tempo dedicato all’esercizio.</p><p><b>Questa è una stima di partenza</b>, non una prescrizione medica rigorosa — le esigenze individuali variano in base a clima, dieta e condizioni di salute. Sete, colore delle urine e come ti senti restano gli indicatori quotidiani più affidabili.</p>',
            key_points: [
                '<b>Base in base al peso:</b> Usa ~33 ml per kg di peso come fabbisogno giornaliero a riposo.',
                '<b>Correzione per attività:</b> Aggiunge liquido extra ogni 30 minuti di esercizio per compensare la perdita di sudore.',
                '<b>Solo linea guida generale:</b> Clima, dieta e salute individuale possono modificare il fabbisogno reale — è un punto di partenza pratico, non una prescrizione medica.',
            ],
            howto: [
                { question: 'Caffè o tè contano come assunzione di acqua?', answer: '<p>Sì, con moderazione — sebbene la caffeina abbia un lieve effetto diuretico, il normale consumo di caffè/tè fornisce comunque un bilancio idrico netto positivo per la maggior parte delle persone.</p>' },
                { question: 'Devo bere più acqua quando fa caldo?', answer: '<p>Sì — questo calcolatore fornisce una base; aggiungi più liquidi nei giorni caldi o con sudorazione intensa oltre a quanto già considerato nel campo attività.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Peso Corporeo', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Esercizio Giornaliero', type: 'number', unit: 'min/giorno', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Assunzione di Acqua Raccomandata', unit: 'L/giorno', precision: 2 },
                { name: 'water_cups', label: 'Assunzione di Acqua Raccomandata', unit: 'tazze/giorno', precision: 1 },
            ],
        },
        de: {
            slug: 'taeglicher-wasserbedarf-rechner',
            title: 'Rechner für Täglichen Wasserbedarf',
            h1: 'Rechner für Täglichen Wasserbedarf',
            meta_title: 'Wasser-Rechner | Wie Viel Wasser Sollte Ich Trinken',
            meta_description: 'Berechnen Sie, wie viel Wasser Sie täglich trinken sollten, basierend auf Körpergewicht und Aktivitätsniveau, mit einer Standard-Hydratationsformel.',
            short_answer: 'Dieser Rechner schätzt Ihren empfohlenen täglichen Wasserbedarf basierend auf Ihrem Körpergewicht, zuzüglich eines Extrabetrags für körperliche Aktivität.',
            intro_text: '<p>Der tägliche Wasserbedarf skaliert mit der Körpergröße: eine gängige Richtlinie sind etwa 33 ml Wasser pro Kilogramm Körpergewicht täglich als Basiswert, bevor Sport, Klima oder andere Flüssigkeitsverluste berücksichtigt werden. Dieser Rechner nutzt diesen Basiswert und fügt eine Anpassung für die mit Sport verbrachte Zeit hinzu.</p><p><b>Dies ist eine erste Schätzung</b>, keine strenge medizinische Verschreibung — individuelle Bedürfnisse variieren je nach Klima, Ernährung und Gesundheitszustand. Durst, Urinfarbe und Ihr Wohlbefinden bleiben die zuverlässigsten alltäglichen Indikatoren.</p>',
            key_points: [
                '<b>Basiswert nach Gewicht:</b> Verwendet ~33 ml pro kg Körpergewicht als täglichen Ruhebedarf.',
                '<b>Aktivitätsanpassung:</b> Fügt zusätzliche Flüssigkeit für je 30 Minuten Sport hinzu, um Schweißverlust auszugleichen.',
                '<b>Nur allgemeine Richtlinie:</b> Klima, Ernährung und individuelle Gesundheit können den tatsächlichen Bedarf verändern — dies ist ein praktischer Ausgangspunkt, keine medizinische Verschreibung.',
            ],
            howto: [
                { question: 'Zählen Kaffee oder Tee zur Wasseraufnahme?', answer: '<p>Ja, in Maßen — obwohl Koffein eine leicht harntreibende Wirkung hat, trägt normaler Kaffee-/Teekonsum für die meisten Menschen dennoch netto positiv zur Flüssigkeitsaufnahme bei.</p>' },
                { question: 'Sollte ich bei heißem Wetter mehr Wasser trinken?', answer: '<p>Ja — dieser Rechner gibt einen Basiswert; fügen Sie an heißen Tagen oder bei starkem Schwitzen zusätzliche Flüssigkeit hinzu, über das hinaus, was das Aktivitätsfeld bereits berücksichtigt.</p>' },
            ],
            inputs: [
                { name: 'weight_kg', label: 'Körpergewicht', type: 'number', unit: 'kg', min: 20, max: 300, placeholder: '70' },
                { name: 'activity_minutes', label: 'Tägliches Training', type: 'number', unit: 'Min/Tag', min: 0, max: 600, placeholder: '0' },
            ],
            outputs: [
                { name: 'water_liters', label: 'Empfohlene Wasseraufnahme', unit: 'L/Tag', precision: 2 },
                { name: 'water_cups', label: 'Empfohlene Wasseraufnahme', unit: 'Tassen/Tag', precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1010: Macronutrient (Macro) Calculator
// ============================================================
const macros: ToolDef = {
    id: '1010',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'daily_calories', default: 2000 },
            { key: 'protein_pct', default: 30 },
            { key: 'carbs_pct', default: 40 },
            { key: 'fat_pct', default: 30 },
        ],
        formulas: {
            protein_g: 'daily_calories*protein_pct/100/4',
            carbs_g: 'daily_calories*carbs_pct/100/4',
            fat_g: 'daily_calories*fat_pct/100/9',
        },
        outputs: [
            { key: 'protein_g', precision: 0 },
            { key: 'carbs_g', precision: 0 },
            { key: 'fat_g', precision: 0 },
        ],
    },
    locales: {
        en: {
            slug: 'macro-calculator-protein-carbs-fat',
            title: 'Macro Calculator - Protein, Carbs & Fat Split',
            h1: 'Macronutrient (Macro) Calculator',
            meta_title: 'Macro Calculator | Protein, Carbs & Fat from Daily Calories',
            meta_description: 'Split your daily calorie target into grams of protein, carbohydrates, and fat based on a percentage ratio — the standard approach used in flexible dieting (IIFYM).',
            short_answer: 'This calculator converts your daily calorie target into grams of protein, carbohydrates, and fat, based on percentage splits you choose — the method used by flexible dieting (IIFYM) approaches.',
            intro_text: '<p>Once you know your daily calorie target (see our TDEE Calculator), the next step in structured nutrition planning is deciding how those calories are split across protein, carbohydrates, and fat. Each gram of protein and carbohydrate provides 4 calories, while each gram of fat provides 9 — this calculator applies those conversion factors to your chosen percentage split.</p><p><b>A common starting split</b> is 30% protein / 40% carbs / 30% fat, though ratios are commonly adjusted for specific goals — higher protein for muscle preservation during a cut, higher carbs for endurance training, or higher fat for ketogenic approaches.</p>',
            key_points: [
                '<b>Standard Conversion Factors:</b> 4 kcal/g for protein and carbs, 9 kcal/g for fat — the basis of all macro calculations.',
                '<b>Fully Customizable Split:</b> Adjust the three percentages to match your specific diet approach (balanced, high-protein, low-carb, etc.).',
                '<b>Pairs with TDEE:</b> Use our TDEE Calculator first to get your daily calorie target, then split it here.',
            ],
            howto: [
                { question: 'What macro split should I use?', answer: '<p>30/40/30 (protein/carbs/fat) is a reasonable general starting point; higher protein (35-40%) is often recommended during a calorie deficit to preserve muscle mass.</p>' },
                { question: 'Do the percentages need to add up to 100?', answer: '<p>Yes — for the grams to correctly reflect your total daily calories, protein_pct + carbs_pct + fat_pct should sum to 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Daily Calorie Target', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Protein', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Carbohydrates', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Fat', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Protein', unit: 'g/day', precision: 0 },
                { name: 'carbs_g', label: 'Carbohydrates', unit: 'g/day', precision: 0 },
                { name: 'fat_g', label: 'Fat', unit: 'g/day', precision: 0 },
            ],
        },
        ru: {
            slug: 'kalkulyator-makronutrientov-belki-uglevody-zhiry',
            title: 'Калькулятор макронутриентов - Белки, углеводы, жиры',
            h1: 'Калькулятор макронутриентов',
            meta_title: 'Калькулятор макро | Белки, углеводы и жиры из суточных калорий',
            meta_description: 'Разбейте суточную норму калорий на граммы белков, углеводов и жиров по процентному соотношению — стандартный подход гибкой диеты (IIFYM).',
            short_answer: 'Этот калькулятор преобразует вашу суточную норму калорий в граммы белков, углеводов и жиров на основе выбранного процентного соотношения.',
            intro_text: '<p>Как только вы знаете суточную норму калорий (см. наш калькулятор TDEE), следующий шаг в планировании питания — определить, как эти калории распределяются между белками, углеводами и жирами. Каждый грамм белка и углеводов даёт 4 калории, а каждый грамм жира — 9 калорий.</p><p><b>Распространённое начальное соотношение</b> — 30% белки / 40% углеводы / 30% жиры, но пропорции часто корректируются под конкретные цели — больше белка для сохранения мышц при похудении, больше углеводов для выносливости, больше жира для кето-подходов.</p>',
            key_points: [
                '<b>Стандартные коэффициенты:</b> 4 ккал/г для белков и углеводов, 9 ккал/г для жиров — основа всех расчётов макро.',
                '<b>Полностью настраиваемое соотношение:</b> Настройте три процента под ваш подход к питанию (сбалансированный, высокобелковый, низкоуглеводный и т.д.).',
                '<b>Сочетается с TDEE:</b> Сначала используйте наш калькулятор TDEE, чтобы получить суточную норму калорий, затем разбейте её здесь.',
            ],
            howto: [
                { question: 'Какое соотношение макро использовать?', answer: '<p>30/40/30 (белки/углеводы/жиры) — разумная отправная точка; более высокий белок (35-40%) часто рекомендуется при дефиците калорий для сохранения мышечной массы.</p>' },
                { question: 'Должны ли проценты в сумме давать 100?', answer: '<p>Да — чтобы граммы правильно отражали общую суточную калорийность, сумма процентов белков, углеводов и жиров должна быть равна 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Суточная норма калорий', type: 'number', unit: 'ккал', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Белки', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Углеводы', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Жиры', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Белки', unit: 'г/день', precision: 0 },
                { name: 'carbs_g', label: 'Углеводы', unit: 'г/день', precision: 0 },
                { name: 'fat_g', label: 'Жиры', unit: 'г/день', precision: 0 },
            ],
        },
        lv: {
            slug: 'makronutrientu-kalkulators-olbaltumvielas-oglhidrati-tauki',
            title: 'Makronutrientu Kalkulators - Olbaltumvielas, Ogļhidrāti, Tauki',
            h1: 'Makronutrientu (Makro) Kalkulators',
            meta_title: 'Makro Kalkulators | Olbaltumvielas, Ogļhidrāti un Tauki no Dienas Kalorijām',
            meta_description: 'Sadaliet dienas kaloriju normu olbaltumvielu, ogļhidrātu un tauku gramos pēc procentuālas attiecības — standarta elastīgās diētas (IIFYM) pieeja.',
            short_answer: 'Šis kalkulators pārvērš jūsu dienas kaloriju normu olbaltumvielu, ogļhidrātu un tauku gramos, balstoties uz izvēlēto procentuālo sadalījumu.',
            intro_text: '<p>Kad zināt savu dienas kaloriju normu (skatiet mūsu TDEE kalkulatoru), nākamais solis strukturētā uztura plānošanā ir izlemt, kā šīs kalorijas sadalās starp olbaltumvielām, ogļhidrātiem un taukiem. Katrs olbaltumvielu un ogļhidrātu grams dod 4 kalorijas, bet katrs tauku grams — 9 kalorijas.</p><p><b>Bieža sākotnējā attiecība</b> ir 30% olbaltumvielas / 40% ogļhidrāti / 30% tauki, taču proporcijas bieži tiek pielāgotas konkrētiem mērķiem — vairāk olbaltumvielu muskuļu saglabāšanai diētas laikā, vairāk ogļhidrātu izturībai, vairāk tauku keto pieejām.</p>',
            key_points: [
                '<b>Standarta pārrēķina koeficienti:</b> 4 kcal/g olbaltumvielām un ogļhidrātiem, 9 kcal/g taukiem — visu makro aprēķinu pamats.',
                '<b>Pilnībā pielāgojama attiecība:</b> Pielāgojiet trīs procentus savai uztura pieejai (līdzsvarota, augsts olbaltumvielu saturs, zems ogļhidrātu saturs u.c.).',
                '<b>Sader ar TDEE:</b> Vispirms izmantojiet mūsu TDEE kalkulatoru, lai iegūtu dienas kaloriju normu, tad sadaliet to šeit.',
            ],
            howto: [
                { question: 'Kādu makro attiecību izmantot?', answer: '<p>30/40/30 (olbaltumvielas/ogļhidrāti/tauki) ir saprātīgs sākuma punkts; augstāks olbaltumvielu daudzums (35-40%) bieži tiek ieteikts kaloriju deficīta laikā muskuļu masas saglabāšanai.</p>' },
                { question: 'Vai procentiem jāsummē līdz 100?', answer: '<p>Jā — lai grami pareizi atspoguļotu kopējo dienas kaloriju daudzumu, olbaltumvielu, ogļhidrātu un tauku procentiem summai jābūt 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Dienas kaloriju norma', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Olbaltumvielas', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Ogļhidrāti', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Tauki', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Olbaltumvielas', unit: 'g/dienā', precision: 0 },
                { name: 'carbs_g', label: 'Ogļhidrāti', unit: 'g/dienā', precision: 0 },
                { name: 'fat_g', label: 'Tauki', unit: 'g/dienā', precision: 0 },
            ],
        },
        pl: {
            slug: 'kalkulator-makroskladnikow-bialko-wegle-tluszcze',
            title: 'Kalkulator Makroskładników - Białko, Węglowodany, Tłuszcze',
            h1: 'Kalkulator Makroskładników (Makro)',
            meta_title: 'Kalkulator Makro | Białko, Węglowodany i Tłuszcze z Dziennych Kalorii',
            meta_description: 'Podziel swój dzienny cel kaloryczny na gramy białka, węglowodanów i tłuszczu na podstawie proporcji procentowych — standardowe podejście elastycznej diety (IIFYM).',
            short_answer: 'Ten kalkulator przelicza twój dzienny cel kaloryczny na gramy białka, węglowodanów i tłuszczu na podstawie wybranego podziału procentowego.',
            intro_text: '<p>Gdy znasz już swój dzienny cel kaloryczny (zobacz nasz kalkulator TDEE), kolejnym krokiem w planowaniu odżywiania jest ustalenie, jak te kalorie rozkładają się na białko, węglowodany i tłuszcz. Każdy gram białka i węglowodanów dostarcza 4 kalorie, a każdy gram tłuszczu — 9 kalorii.</p><p><b>Popularny podział wyjściowy</b> to 30% białka / 40% węglowodanów / 30% tłuszczu, choć proporcje są często dostosowywane do konkretnych celów — więcej białka dla zachowania mięśni podczas redukcji, więcej węglowodanów dla wytrzymałości, więcej tłuszczu dla podejść ketogenicznych.</p>',
            key_points: [
                '<b>Standardowe współczynniki:</b> 4 kcal/g dla białka i węglowodanów, 9 kcal/g dla tłuszczu — podstawa wszystkich obliczeń makro.',
                '<b>W pełni dostosowywalny podział:</b> Dostosuj trzy wartości procentowe do swojego podejścia dietetycznego (zbilansowana, wysokobiałkowa, niskowęglowodanowa itd.).',
                '<b>Współpracuje z TDEE:</b> Najpierw użyj naszego kalkulatora TDEE, aby uzyskać dzienny cel kaloryczny, a następnie podziel go tutaj.',
            ],
            howto: [
                { question: 'Jaki podział makro powinienem stosować?', answer: '<p>30/40/30 (białko/węglowodany/tłuszcz) to rozsądny punkt wyjścia; wyższe białko (35-40%) jest często zalecane podczas deficytu kalorycznego dla zachowania masy mięśniowej.</p>' },
                { question: 'Czy procenty muszą sumować się do 100?', answer: '<p>Tak — aby gramy poprawnie odzwierciedlały całkowitą dzienną kaloryczność, suma procentów białka, węglowodanów i tłuszczu powinna wynosić 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Dzienny Cel Kaloryczny', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Białko', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Węglowodany', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Tłuszcz', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Białko', unit: 'g/dzień', precision: 0 },
                { name: 'carbs_g', label: 'Węglowodany', unit: 'g/dzień', precision: 0 },
                { name: 'fat_g', label: 'Tłuszcz', unit: 'g/dzień', precision: 0 },
            ],
        },
        es: {
            slug: 'calculadora-macros-proteinas-carbohidratos-grasas',
            title: 'Calculadora de Macros - Proteínas, Carbohidratos y Grasas',
            h1: 'Calculadora de Macronutrientes (Macros)',
            meta_title: 'Calculadora de Macros | Proteínas, Carbohidratos y Grasas desde Calorías Diarias',
            meta_description: 'Divide tu objetivo calórico diario en gramos de proteínas, carbohidratos y grasas según un porcentaje — el enfoque estándar de la dieta flexible (IIFYM).',
            short_answer: 'Esta calculadora convierte tu objetivo calórico diario en gramos de proteínas, carbohidratos y grasas, según los porcentajes que elijas.',
            intro_text: '<p>Una vez que conoces tu objetivo calórico diario (ver nuestra Calculadora de GET), el siguiente paso en la planificación nutricional es decidir cómo se distribuyen esas calorías entre proteínas, carbohidratos y grasas. Cada gramo de proteína y carbohidrato aporta 4 calorías, mientras que cada gramo de grasa aporta 9.</p><p><b>Una división inicial común</b> es 30% proteína / 40% carbohidratos / 30% grasa, aunque las proporciones suelen ajustarse según objetivos específicos — más proteína para preservar músculo en un déficit, más carbohidratos para resistencia, o más grasa para enfoques cetogénicos.</p>',
            key_points: [
                '<b>Factores de conversión estándar:</b> 4 kcal/g para proteínas y carbohidratos, 9 kcal/g para grasas — la base de todos los cálculos de macros.',
                '<b>División totalmente personalizable:</b> Ajusta los tres porcentajes según tu enfoque dietético (equilibrado, alto en proteína, bajo en carbohidratos, etc.).',
                '<b>Se combina con el GET:</b> Usa primero nuestra Calculadora de GET para obtener tu objetivo calórico diario, luego divídelo aquí.',
            ],
            howto: [
                { question: '¿Qué división de macros debo usar?', answer: '<p>30/40/30 (proteína/carbohidratos/grasa) es un punto de partida razonable; una proteína más alta (35-40%) suele recomendarse durante un déficit calórico para preservar masa muscular.</p>' },
                { question: '¿Los porcentajes deben sumar 100?', answer: '<p>Sí — para que los gramos reflejen correctamente tu total calórico diario, la suma de proteína, carbohidratos y grasa debe ser 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Objetivo Calórico Diario', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Proteína', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Carbohidratos', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Grasa', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Proteína', unit: 'g/día', precision: 0 },
                { name: 'carbs_g', label: 'Carbohidratos', unit: 'g/día', precision: 0 },
                { name: 'fat_g', label: 'Grasa', unit: 'g/día', precision: 0 },
            ],
        },
        fr: {
            slug: 'calculateur-macros-proteines-glucides-lipides',
            title: 'Calculateur de Macros - Protéines, Glucides et Lipides',
            h1: 'Calculateur de Macronutriments (Macros)',
            meta_title: 'Calculateur de Macros | Protéines, Glucides et Lipides à Partir des Calories',
            meta_description: 'Répartissez votre objectif calorique quotidien en grammes de protéines, glucides et lipides selon un pourcentage — l’approche standard du flexible dieting (IIFYM).',
            short_answer: 'Ce calculateur convertit votre objectif calorique quotidien en grammes de protéines, glucides et lipides, selon les pourcentages que vous choisissez.',
            intro_text: '<p>Une fois que vous connaissez votre objectif calorique quotidien (voir notre calculateur DEET), l’étape suivante de la planification nutritionnelle consiste à décider comment ces calories se répartissent entre protéines, glucides et lipides. Chaque gramme de protéine et de glucide apporte 4 calories, tandis que chaque gramme de lipide en apporte 9.</p><p><b>Une répartition de départ courante</b> est 30 % protéines / 40 % glucides / 30 % lipides, bien que les ratios soient souvent ajustés selon des objectifs spécifiques — plus de protéines pour préserver le muscle en déficit, plus de glucides pour l’endurance, ou plus de lipides pour les approches cétogènes.</p>',
            key_points: [
                '<b>Facteurs de conversion standards :</b> 4 kcal/g pour protéines et glucides, 9 kcal/g pour les lipides — la base de tous les calculs de macros.',
                '<b>Répartition entièrement personnalisable :</b> Ajustez les trois pourcentages selon votre approche alimentaire (équilibrée, riche en protéines, pauvre en glucides, etc.).',
                '<b>Se combine avec le DEET :</b> Utilisez d’abord notre calculateur DEET pour obtenir votre objectif calorique quotidien, puis répartissez-le ici.',
            ],
            howto: [
                { question: 'Quelle répartition de macros utiliser ?', answer: '<p>30/40/30 (protéines/glucides/lipides) est un bon point de départ ; une protéine plus élevée (35-40 %) est souvent recommandée en déficit calorique pour préserver la masse musculaire.</p>' },
                { question: 'Les pourcentages doivent-ils totaliser 100 ?', answer: '<p>Oui — pour que les grammes reflètent correctement votre total calorique quotidien, la somme des pourcentages de protéines, glucides et lipides doit être 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Objectif Calorique Quotidien', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Protéines', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Glucides', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Lipides', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Protéines', unit: 'g/jour', precision: 0 },
                { name: 'carbs_g', label: 'Glucides', unit: 'g/jour', precision: 0 },
                { name: 'fat_g', label: 'Lipides', unit: 'g/jour', precision: 0 },
            ],
        },
        it: {
            slug: 'calcolatore-macro-proteine-carboidrati-grassi',
            title: 'Calcolatore Macro - Proteine, Carboidrati e Grassi',
            h1: 'Calcolatore di Macronutrienti (Macro)',
            meta_title: 'Calcolatore Macro | Proteine, Carboidrati e Grassi dalle Calorie Giornaliere',
            meta_description: 'Suddividi il tuo obiettivo calorico giornaliero in grammi di proteine, carboidrati e grassi in base a una percentuale — l’approccio standard della dieta flessibile (IIFYM).',
            short_answer: 'Questo calcolatore converte il tuo obiettivo calorico giornaliero in grammi di proteine, carboidrati e grassi, in base alle percentuali che scegli.',
            intro_text: '<p>Una volta noto il tuo obiettivo calorico giornaliero (vedi il nostro Calcolatore TDEE), il passo successivo nella pianificazione nutrizionale è decidere come queste calorie si suddividono tra proteine, carboidrati e grassi. Ogni grammo di proteine e carboidrati fornisce 4 calorie, mentre ogni grammo di grassi ne fornisce 9.</p><p><b>Una suddivisione iniziale comune</b> è 30% proteine / 40% carboidrati / 30% grassi, anche se i rapporti vengono spesso adattati a obiettivi specifici — più proteine per preservare i muscoli durante un deficit, più carboidrati per la resistenza, o più grassi per approcci chetogenici.</p>',
            key_points: [
                '<b>Fattori di conversione standard:</b> 4 kcal/g per proteine e carboidrati, 9 kcal/g per i grassi — la base di tutti i calcoli macro.',
                '<b>Suddivisione completamente personalizzabile:</b> Regola le tre percentuali in base al tuo approccio alimentare (bilanciato, ad alto contenuto proteico, a basso contenuto di carboidrati, ecc.).',
                '<b>Si abbina al TDEE:</b> Usa prima il nostro Calcolatore TDEE per ottenere il tuo obiettivo calorico giornaliero, poi suddividilo qui.',
            ],
            howto: [
                { question: 'Quale suddivisione macro dovrei usare?', answer: '<p>30/40/30 (proteine/carboidrati/grassi) è un punto di partenza ragionevole; proteine più alte (35-40%) sono spesso consigliate durante un deficit calorico per preservare la massa muscolare.</p>' },
                { question: 'Le percentuali devono sommare a 100?', answer: '<p>Sì — affinché i grammi riflettano correttamente il totale calorico giornaliero, la somma di proteine, carboidrati e grassi in percentuale deve essere 100.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Obiettivo Calorico Giornaliero', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Proteine', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Carboidrati', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Grassi', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Proteine', unit: 'g/giorno', precision: 0 },
                { name: 'carbs_g', label: 'Carboidrati', unit: 'g/giorno', precision: 0 },
                { name: 'fat_g', label: 'Grassi', unit: 'g/giorno', precision: 0 },
            ],
        },
        de: {
            slug: 'makronaehrstoff-rechner-protein-kohlenhydrate-fett',
            title: 'Makronährstoff-Rechner - Protein, Kohlenhydrate und Fett',
            h1: 'Makronährstoff-Rechner (Makros)',
            meta_title: 'Makro-Rechner | Protein, Kohlenhydrate und Fett aus Tageskalorien',
            meta_description: 'Teilen Sie Ihr tägliches Kalorienziel in Gramm Protein, Kohlenhydrate und Fett auf, basierend auf einem Prozentverhältnis — der Standardansatz beim flexiblen Diäten (IIFYM).',
            short_answer: 'Dieser Rechner wandelt Ihr tägliches Kalorienziel in Gramm Protein, Kohlenhydrate und Fett um, basierend auf den von Ihnen gewählten Prozentsätzen.',
            intro_text: '<p>Sobald Sie Ihr tägliches Kalorienziel kennen (siehe unseren Gesamtumsatz-Rechner), besteht der nächste Schritt in der strukturierten Ernährungsplanung darin, festzulegen, wie sich diese Kalorien auf Protein, Kohlenhydrate und Fett verteilen. Jedes Gramm Protein und Kohlenhydrat liefert 4 Kalorien, während jedes Gramm Fett 9 Kalorien liefert.</p><p><b>Eine übliche Ausgangsverteilung</b> ist 30 % Protein / 40 % Kohlenhydrate / 30 % Fett, wobei die Verhältnisse oft an spezifische Ziele angepasst werden — mehr Protein zum Muskelerhalt bei einem Kaloriendefizit, mehr Kohlenhydrate für Ausdauertraining oder mehr Fett bei ketogenen Ansätzen.</p>',
            key_points: [
                '<b>Standard-Umrechnungsfaktoren:</b> 4 kcal/g für Protein und Kohlenhydrate, 9 kcal/g für Fett — die Grundlage aller Makroberechnungen.',
                '<b>Vollständig anpassbare Verteilung:</b> Passen Sie die drei Prozentsätze an Ihren spezifischen Ernährungsansatz an (ausgewogen, proteinreich, kohlenhydratarm usw.).',
                '<b>Passt zum Gesamtumsatz:</b> Nutzen Sie zunächst unseren Gesamtumsatz-Rechner, um Ihr tägliches Kalorienziel zu erhalten, und teilen Sie es dann hier auf.',
            ],
            howto: [
                { question: 'Welche Makro-Verteilung sollte ich verwenden?', answer: '<p>30/40/30 (Protein/Kohlenhydrate/Fett) ist ein vernünftiger Ausgangspunkt; ein höherer Proteinanteil (35-40 %) wird bei einem Kaloriendefizit oft zum Muskelerhalt empfohlen.</p>' },
                { question: 'Müssen sich die Prozentsätze zu 100 summieren?', answer: '<p>Ja — damit die Gramm-Werte Ihre gesamten Tageskalorien korrekt widerspiegeln, sollte die Summe aus Protein-, Kohlenhydrat- und Fettanteil 100 ergeben.</p>' },
            ],
            inputs: [
                { name: 'daily_calories', label: 'Tägliches Kalorienziel', type: 'number', unit: 'kcal', min: 800, max: 6000, placeholder: '2000' },
                { name: 'protein_pct', label: 'Protein', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
                { name: 'carbs_pct', label: 'Kohlenhydrate', type: 'number', unit: '%', min: 0, max: 100, placeholder: '40' },
                { name: 'fat_pct', label: 'Fett', type: 'number', unit: '%', min: 0, max: 100, placeholder: '30' },
            ],
            outputs: [
                { name: 'protein_g', label: 'Protein', unit: 'g/Tag', precision: 0 },
                { name: 'carbs_g', label: 'Kohlenhydrate', unit: 'g/Tag', precision: 0 },
                { name: 'fat_g', label: 'Fett', unit: 'g/Tag', precision: 0 },
            ],
        },
    },
}

// ============================================================
// 1011: Target Heart Rate Calculator (Karvonen formula)
// ============================================================
const targetHeartRate: ToolDef = {
    id: '1011',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'age', default: 30 },
            { key: 'resting_hr', default: 70 },
        ],
        formulas: {
            target_low: 'resting_hr + (220 - age - resting_hr)*0.5',
            target_high: 'resting_hr + (220 - age - resting_hr)*0.85',
        },
        outputs: [
            { key: 'target_low', precision: 0 },
            { key: 'target_high', precision: 0 },
        ],
    },
    locales: {
        en: {
            slug: 'target-heart-rate-calculator-karvonen',
            title: 'Target Heart Rate Calculator - Karvonen Formula',
            h1: 'Target Heart Rate Calculator',
            meta_title: 'Target Heart Rate Calculator | Karvonen Formula',
            meta_description: 'Calculate your target heart rate training zone using the Karvonen formula, based on age and resting heart rate — more personalized than a simple age-based estimate.',
            short_answer: 'This calculator gives your target heart rate training zone using the Karvonen formula, which factors in your resting heart rate for a more personalized range than simple age-based estimates.',
            intro_text: '<p>Training within a target heart rate zone helps ensure workouts are intense enough to build fitness without overexertion. The Karvonen formula improves on the basic "220 minus age" method by incorporating your resting heart rate — a proxy for cardiovascular fitness — into the calculation via the Heart Rate Reserve (HRR).</p><p><b>Fitter individuals</b> with lower resting heart rates get a target zone that better reflects their actual cardiovascular capacity, making this formula popular among runners, cyclists, and personal trainers designing structured cardio programs.</p>',
            key_points: [
                '<b>Karvonen Formula:</b> More personalized than age-only formulas because it accounts for your resting heart rate (fitness level).',
                '<b>Moderate-to-Vigorous Zone:</b> This calculator shows the 50-85% Heart Rate Reserve range, commonly recommended for cardiovascular training.',
                '<b>Resting HR Matters:</b> Measure resting heart rate first thing in the morning, before getting out of bed, for the most accurate reading.',
            ],
            howto: [
                { question: 'How do I measure my resting heart rate?', answer: '<p>Take your pulse for 60 seconds immediately after waking up, while still lying down, before any caffeine or activity — this gives the most accurate resting value.</p>' },
                { question: 'What zone should I train in for fat loss vs endurance?', answer: '<p>Lower intensity (closer to 50%) supports longer, fat-burning-focused sessions, while higher intensity (closer to 85%) builds cardiovascular capacity faster in shorter sessions.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Age', type: 'number', unit: 'years', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Resting Heart Rate', type: 'number', unit: 'bpm', min: 30, max: 120, placeholder: '70', description: 'Measured first thing in the morning at rest.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Target Zone (Low, 50%)', unit: 'bpm', precision: 0 },
                { name: 'target_high', label: 'Target Zone (High, 85%)', unit: 'bpm', precision: 0 },
            ],
        },
        ru: {
            slug: 'kalkulyator-celevogo-pulsa-formula-karvonena',
            title: 'Калькулятор целевого пульса - формула Карвонена',
            h1: 'Калькулятор целевого пульса',
            meta_title: 'Калькулятор целевого пульса | Формула Карвонена',
            meta_description: 'Рассчитайте зону целевого пульса для тренировок по формуле Карвонена, основанной на возрасте и пульсе покоя.',
            short_answer: 'Этот калькулятор даёт зону целевого пульса для тренировок по формуле Карвонена, которая учитывает пульс покоя для более персонализированного диапазона.',
            intro_text: '<p>Тренировки в зоне целевого пульса помогают убедиться, что нагрузка достаточно интенсивна для развития формы без перенапряжения. Формула Карвонена улучшает базовый метод «220 минус возраст», добавляя пульс покоя — показатель кардиотренированности — в расчёт через резерв пульса (HRR).</p><p><b>Более тренированные люди</b> с более низким пульсом покоя получают целевую зону, лучше отражающую их реальные кардиовозможности, поэтому формула популярна среди бегунов, велосипедистов и тренеров.</p>',
            key_points: [
                '<b>Формула Карвонена:</b> Более персонализирована, чем формулы только по возрасту, так как учитывает пульс покоя (уровень тренированности).',
                '<b>Зона умеренной-высокой интенсивности:</b> Калькулятор показывает диапазон 50-85% резерва пульса, рекомендуемый для кардиотренировок.',
                '<b>Важен пульс покоя:</b> Измеряйте его сразу после пробуждения, не вставая с кровати, для наиболее точного значения.',
            ],
            howto: [
                { question: 'Как измерить пульс покоя?', answer: '<p>Измеряйте пульс в течение 60 секунд сразу после пробуждения, лёжа, до кофе и любой активности — это даёт наиболее точное значение.</p>' },
                { question: 'В какой зоне тренироваться для жиросжигания или выносливости?', answer: '<p>Более низкая интенсивность (ближе к 50%) поддерживает длительные тренировки на жиросжигание, а более высокая (ближе к 85%) быстрее развивает кардиовозможности за короткое время.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Пульс покоя', type: 'number', unit: 'уд/мин', min: 30, max: 120, placeholder: '70', description: 'Измеряется утром в состоянии покоя.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Целевая зона (нижняя, 50%)', unit: 'уд/мин', precision: 0 },
                { name: 'target_high', label: 'Целевая зона (верхняя, 85%)', unit: 'уд/мин', precision: 0 },
            ],
        },
        lv: {
            slug: 'merka-pulsa-kalkulators-karvonena-formula',
            title: 'Mērķa Pulsa Kalkulators - Karvonena Formula',
            h1: 'Mērķa Pulsa Kalkulators',
            meta_title: 'Mērķa Pulsa Kalkulators | Karvonena Formula',
            meta_description: 'Aprēķiniet savu mērķa pulsa treniņu zonu, izmantojot Karvonena formulu, kas balstīta uz vecumu un miera pulsu.',
            short_answer: 'Šis kalkulators dod jūsu mērķa pulsa treniņu zonu, izmantojot Karvonena formulu, kas ņem vērā miera pulsu personalizētākam diapazonam.',
            intro_text: '<p>Treniņi mērķa pulsa zonā palīdz nodrošināt, ka slodze ir pietiekami intensīva formas attīstībai bez pārslodzes. Karvonena formula uzlabo pamata "220 mīnus vecums" metodi, iekļaujot aprēķinā miera pulsu — kardio sagatavotības rādītāju — caur pulsa rezervi (HRR).</p><p><b>Labāk trenēti cilvēki</b> ar zemāku miera pulsu iegūst mērķa zonu, kas labāk atspoguļo viņu reālās kardio spējas, tāpēc formula ir populāra skrējēju, riteņbraucēju un treneru vidū.</p>',
            key_points: [
                '<b>Karvonena formula:</b> Personalizētāka nekā formulas, kas balstās tikai uz vecumu, jo ņem vērā miera pulsu (sagatavotības līmeni).',
                '<b>Mērena-augsta intensitāte:</b> Kalkulators rāda 50-85% pulsa rezerves diapazonu, ko parasti iesaka kardio treniņiem.',
                '<b>Svarīgs miera pulss:</b> Mēriet to uzreiz pēc pamošanās, neceļoties no gultas, precīzākajam rezultātam.',
            ],
            howto: [
                { question: 'Kā izmērīt miera pulsu?', answer: '<p>Mēriet pulsu 60 sekundes uzreiz pēc pamošanās, guļot, pirms kafijas un jebkuras aktivitātes — tas dod precīzāko vērtību.</p>' },
                { question: 'Kurā zonā trenēties tauku zaudēšanai vai izturībai?', answer: '<p>Zemāka intensitāte (tuvāk 50%) atbalsta ilgākus, tauku dedzināšanai vērstus treniņus, bet augstāka (tuvāk 85%) ātrāk attīsta kardio spējas īsākā laikā.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Vecums', type: 'number', unit: 'gadi', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Miera Pulss', type: 'number', unit: 'sitieni/min', min: 30, max: 120, placeholder: '70', description: 'Mērīts no rīta miera stāvoklī.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Mērķa zona (zemākā, 50%)', unit: 'sitieni/min', precision: 0 },
                { name: 'target_high', label: 'Mērķa zona (augstākā, 85%)', unit: 'sitieni/min', precision: 0 },
            ],
        },
        pl: {
            slug: 'kalkulator-tetna-treningowego-formula-karvonena',
            title: 'Kalkulator Tętna Treningowego - Formuła Karvonena',
            h1: 'Kalkulator Tętna Treningowego',
            meta_title: 'Kalkulator Tętna Treningowego | Formuła Karvonena',
            meta_description: 'Oblicz swoją strefę tętna treningowego za pomocą formuły Karvonena, opartej na wieku i tętnie spoczynkowym.',
            short_answer: 'Ten kalkulator podaje strefę tętna treningowego za pomocą formuły Karvonena, która uwzględnia tętno spoczynkowe dla bardziej spersonalizowanego zakresu.',
            intro_text: '<p>Trening w strefie tętna docelowego pomaga zapewnić, że wysiłek jest wystarczająco intensywny, aby rozwijać kondycję bez przeciążenia. Formuła Karvonena ulepsza podstawową metodę "220 minus wiek", włączając do obliczeń tętno spoczynkowe — wskaźnik kondycji sercowo-naczyniowej — poprzez rezerwę tętna (HRR).</p><p><b>Osoby lepiej wytrenowane</b> z niższym tętnem spoczynkowym otrzymują strefę docelową lepiej odzwierciedlającą ich rzeczywiste możliwości sercowo-naczyniowe, dlatego formuła jest popularna wśród biegaczy, kolarzy i trenerów.</p>',
            key_points: [
                '<b>Formuła Karvonena:</b> Bardziej spersonalizowana niż formuły oparte tylko na wieku, ponieważ uwzględnia tętno spoczynkowe (poziom wytrenowania).',
                '<b>Strefa umiarkowanej-wysokiej intensywności:</b> Kalkulator pokazuje zakres 50-85% rezerwy tętna, powszechnie zalecany dla treningu kardio.',
                '<b>Ważne tętno spoczynkowe:</b> Mierz je zaraz po przebudzeniu, nie wstając z łóżka, dla najdokładniejszego wyniku.',
            ],
            howto: [
                { question: 'Jak zmierzyć tętno spoczynkowe?', answer: '<p>Mierz tętno przez 60 sekund zaraz po przebudzeniu, leżąc, przed kawą i jakąkolwiek aktywnością — to daje najdokładniejszą wartość.</p>' },
                { question: 'W jakiej strefie trenować dla spalania tłuszczu lub wytrzymałości?', answer: '<p>Niższa intensywność (bliżej 50%) wspiera dłuższe treningi nastawione na spalanie tłuszczu, a wyższa (bliżej 85%) szybciej rozwija wydolność sercowo-naczyniową w krótszym czasie.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Wiek', type: 'number', unit: 'lat', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Tętno Spoczynkowe', type: 'number', unit: 'ud/min', min: 30, max: 120, placeholder: '70', description: 'Mierzone rano w spoczynku.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Strefa docelowa (dolna, 50%)', unit: 'ud/min', precision: 0 },
                { name: 'target_high', label: 'Strefa docelowa (górna, 85%)', unit: 'ud/min', precision: 0 },
            ],
        },
        es: {
            slug: 'calculadora-frecuencia-cardiaca-objetivo-karvonen',
            title: 'Calculadora de Frecuencia Cardíaca Objetivo - Fórmula de Karvonen',
            h1: 'Calculadora de Frecuencia Cardíaca Objetivo',
            meta_title: 'Calculadora de FC Objetivo | Fórmula de Karvonen',
            meta_description: 'Calcula tu zona de frecuencia cardíaca objetivo para entrenar usando la fórmula de Karvonen, basada en edad y frecuencia cardíaca en reposo.',
            short_answer: 'Esta calculadora da tu zona de frecuencia cardíaca objetivo usando la fórmula de Karvonen, que considera tu frecuencia cardíaca en reposo para un rango más personalizado.',
            intro_text: '<p>Entrenar dentro de una zona de frecuencia cardíaca objetivo ayuda a asegurar que el esfuerzo sea lo suficientemente intenso para mejorar la condición física sin excederse. La fórmula de Karvonen mejora el método básico "220 menos edad" al incorporar tu frecuencia cardíaca en reposo —un indicador de tu condición cardiovascular— mediante la Reserva de Frecuencia Cardíaca (RFC).</p><p><b>Las personas más entrenadas</b> con frecuencias en reposo más bajas obtienen una zona objetivo que refleja mejor su capacidad cardiovascular real, por lo que esta fórmula es popular entre corredores, ciclistas y entrenadores.</p>',
            key_points: [
                '<b>Fórmula de Karvonen:</b> Más personalizada que las fórmulas basadas solo en la edad, ya que considera tu frecuencia cardíaca en reposo (nivel de condición física).',
                '<b>Zona de intensidad moderada-alta:</b> Esta calculadora muestra el rango de 50-85% de la Reserva de Frecuencia Cardíaca, comúnmente recomendado para entrenamiento cardiovascular.',
                '<b>La frecuencia en reposo importa:</b> Mídela justo al despertar, antes de levantarte, para la lectura más precisa.',
            ],
            howto: [
                { question: '¿Cómo mido mi frecuencia cardíaca en reposo?', answer: '<p>Toma tu pulso durante 60 segundos justo al despertar, aún acostado, antes de cafeína o actividad — esto da el valor en reposo más preciso.</p>' },
                { question: '¿En qué zona debo entrenar para perder grasa o mejorar resistencia?', answer: '<p>Una intensidad más baja (cerca del 50%) favorece sesiones más largas enfocadas en quemar grasa, mientras que una más alta (cerca del 85%) mejora la capacidad cardiovascular más rápido en sesiones cortas.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Edad', type: 'number', unit: 'años', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Frecuencia Cardíaca en Reposo', type: 'number', unit: 'lpm', min: 30, max: 120, placeholder: '70', description: 'Medida a primera hora de la mañana en reposo.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Zona Objetivo (Baja, 50%)', unit: 'lpm', precision: 0 },
                { name: 'target_high', label: 'Zona Objetivo (Alta, 85%)', unit: 'lpm', precision: 0 },
            ],
        },
        fr: {
            slug: 'calculateur-frequence-cardiaque-cible-karvonen',
            title: 'Calculateur de Fréquence Cardiaque Cible - Formule de Karvonen',
            h1: 'Calculateur de Fréquence Cardiaque Cible',
            meta_title: 'Calculateur de FC Cible | Formule de Karvonen',
            meta_description: 'Calculez votre zone de fréquence cardiaque cible pour l’entraînement avec la formule de Karvonen, basée sur l’âge et la fréquence cardiaque au repos.',
            short_answer: 'Ce calculateur donne votre zone de fréquence cardiaque cible avec la formule de Karvonen, qui intègre votre fréquence cardiaque au repos pour une plage plus personnalisée.',
            intro_text: '<p>S’entraîner dans une zone de fréquence cardiaque cible aide à garantir que l’effort est assez intense pour améliorer la condition physique sans excès. La formule de Karvonen améliore la méthode de base "220 moins l’âge" en intégrant votre fréquence cardiaque au repos — un indicateur de forme cardiovasculaire — via la Réserve de Fréquence Cardiaque (RFC).</p><p><b>Les personnes mieux entraînées</b> avec une fréquence au repos plus basse obtiennent une zone cible reflétant mieux leur capacité cardiovasculaire réelle, ce qui rend cette formule populaire chez les coureurs, cyclistes et entraîneurs.</p>',
            key_points: [
                '<b>Formule de Karvonen :</b> Plus personnalisée que les formules basées uniquement sur l’âge, car elle intègre votre fréquence cardiaque au repos (niveau de forme).',
                '<b>Zone d’intensité modérée à élevée :</b> Ce calculateur affiche la plage de 50-85 % de la Réserve de Fréquence Cardiaque, couramment recommandée pour l’entraînement cardiovasculaire.',
                '<b>La fréquence au repos compte :</b> Mesurez-la dès le réveil, avant de vous lever, pour la lecture la plus précise.',
            ],
            howto: [
                { question: 'Comment mesurer ma fréquence cardiaque au repos ?', answer: '<p>Prenez votre pouls pendant 60 secondes juste au réveil, encore allongé, avant caféine ou activité — cela donne la valeur au repos la plus précise.</p>' },
                { question: 'Dans quelle zone m’entraîner pour perdre du gras ou améliorer l’endurance ?', answer: '<p>Une intensité plus faible (proche de 50 %) favorise des séances plus longues axées sur la combustion des graisses, tandis qu’une intensité plus élevée (proche de 85 %) développe la capacité cardiovasculaire plus rapidement en séances courtes.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Âge', type: 'number', unit: 'ans', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Fréquence Cardiaque au Repos', type: 'number', unit: 'bpm', min: 30, max: 120, placeholder: '70', description: 'Mesurée au réveil, au repos.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Zone Cible (Basse, 50%)', unit: 'bpm', precision: 0 },
                { name: 'target_high', label: 'Zone Cible (Haute, 85%)', unit: 'bpm', precision: 0 },
            ],
        },
        it: {
            slug: 'calcolatore-frequenza-cardiaca-target-karvonen',
            title: 'Calcolatore Frequenza Cardiaca Target - Formula di Karvonen',
            h1: 'Calcolatore Frequenza Cardiaca Target',
            meta_title: 'Calcolatore FC Target | Formula di Karvonen',
            meta_description: 'Calcola la tua zona di frequenza cardiaca target per l’allenamento con la formula di Karvonen, basata su età e frequenza cardiaca a riposo.',
            short_answer: 'Questo calcolatore fornisce la tua zona di frequenza cardiaca target usando la formula di Karvonen, che considera la frequenza a riposo per un intervallo più personalizzato.',
            intro_text: '<p>Allenarsi in una zona di frequenza cardiaca target aiuta a garantire che lo sforzo sia abbastanza intenso da migliorare la forma fisica senza eccessi. La formula di Karvonen migliora il metodo base "220 meno età" incorporando la frequenza cardiaca a riposo — un indicatore della forma cardiovascolare — tramite la Riserva di Frequenza Cardiaca (HRR).</p><p><b>Le persone più allenate</b> con una frequenza a riposo più bassa ottengono una zona target che riflette meglio la loro reale capacità cardiovascolare, motivo per cui questa formula è popolare tra runner, ciclisti e personal trainer.</p>',
            key_points: [
                '<b>Formula di Karvonen:</b> Più personalizzata delle formule basate solo sull’età, poiché considera la frequenza a riposo (livello di allenamento).',
                '<b>Zona di intensità moderata-alta:</b> Questo calcolatore mostra l’intervallo 50-85% della Riserva di Frequenza Cardiaca, comunemente consigliato per l’allenamento cardiovascolare.',
                '<b>La frequenza a riposo conta:</b> Misurala appena sveglio, prima di alzarti dal letto, per la lettura più accurata.',
            ],
            howto: [
                { question: 'Come misuro la mia frequenza cardiaca a riposo?', answer: '<p>Misura il polso per 60 secondi appena sveglio, ancora sdraiato, prima di caffeina o attività — questo fornisce il valore a riposo più accurato.</p>' },
                { question: 'In quale zona allenarmi per bruciare grassi o migliorare la resistenza?', answer: '<p>Un’intensità più bassa (vicino al 50%) favorisce sessioni più lunghe orientate a bruciare grassi, mentre una più alta (vicino all’85%) sviluppa più rapidamente la capacità cardiovascolare in sessioni brevi.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Età', type: 'number', unit: 'anni', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Frequenza Cardiaca a Riposo', type: 'number', unit: 'bpm', min: 30, max: 120, placeholder: '70', description: 'Misurata al risveglio, a riposo.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Zona Target (Bassa, 50%)', unit: 'bpm', precision: 0 },
                { name: 'target_high', label: 'Zona Target (Alta, 85%)', unit: 'bpm', precision: 0 },
            ],
        },
        de: {
            slug: 'ziel-herzfrequenz-rechner-karvonen',
            title: 'Ziel-Herzfrequenz-Rechner - Karvonen-Formel',
            h1: 'Ziel-Herzfrequenz-Rechner',
            meta_title: 'Ziel-Herzfrequenz-Rechner | Karvonen-Formel',
            meta_description: 'Berechnen Sie Ihre Ziel-Herzfrequenzzone für das Training mit der Karvonen-Formel, basierend auf Alter und Ruheherzfrequenz.',
            short_answer: 'Dieser Rechner gibt Ihre Ziel-Herzfrequenzzone mit der Karvonen-Formel an, die Ihre Ruheherzfrequenz für einen persönlicheren Bereich berücksichtigt.',
            intro_text: '<p>Das Training in einer Ziel-Herzfrequenzzone hilft sicherzustellen, dass die Belastung intensiv genug ist, um die Fitness zu verbessern, ohne zu überanstrengen. Die Karvonen-Formel verbessert die einfache "220 minus Alter"-Methode, indem sie Ihre Ruheherzfrequenz — ein Indikator für kardiovaskuläre Fitness — über die Herzfrequenzreserve (HFR) in die Berechnung einbezieht.</p><p><b>Fittere Personen</b> mit niedrigerer Ruheherzfrequenz erhalten eine Zielzone, die ihre tatsächliche kardiovaskuläre Kapazität besser widerspiegelt, weshalb diese Formel bei Läufern, Radfahrern und Personal Trainern beliebt ist.</p>',
            key_points: [
                '<b>Karvonen-Formel:</b> Persönlicher als reine Altersformeln, da sie Ihre Ruheherzfrequenz (Fitnesslevel) berücksichtigt.',
                '<b>Moderate bis intensive Zone:</b> Dieser Rechner zeigt den Bereich von 50-85 % der Herzfrequenzreserve, der üblicherweise für Herz-Kreislauf-Training empfohlen wird.',
                '<b>Ruheherzfrequenz ist wichtig:</b> Messen Sie sie direkt nach dem Aufwachen, bevor Sie aufstehen, für den genauesten Wert.',
            ],
            howto: [
                { question: 'Wie messe ich meine Ruheherzfrequenz?', answer: '<p>Messen Sie Ihren Puls 60 Sekunden lang direkt nach dem Aufwachen, noch im Liegen, vor Koffein oder Aktivität — das ergibt den genauesten Ruhewert.</p>' },
                { question: 'In welcher Zone sollte ich für Fettabbau oder Ausdauer trainieren?', answer: '<p>Niedrigere Intensität (näher an 50 %) unterstützt längere, fettverbrennungsorientierte Einheiten, während höhere Intensität (näher an 85 %) die kardiovaskuläre Kapazität in kürzeren Einheiten schneller aufbaut.</p>' },
            ],
            inputs: [
                { name: 'age', label: 'Alter', type: 'number', unit: 'Jahre', min: 10, max: 100, placeholder: '30' },
                { name: 'resting_hr', label: 'Ruheherzfrequenz', type: 'number', unit: 'Schläge/min', min: 30, max: 120, placeholder: '70', description: 'Direkt am Morgen in Ruhe gemessen.' },
            ],
            outputs: [
                { name: 'target_low', label: 'Zielzone (Niedrig, 50%)', unit: 'Schläge/min', precision: 0 },
                { name: 'target_high', label: 'Zielzone (Hoch, 85%)', unit: 'Schläge/min', precision: 0 },
            ],
        },
    },
}

// ============================================================
// 1012: One-Rep Max Calculator (Epley formula)
// ============================================================
const oneRepMax: ToolDef = {
    id: '1012',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'weight_lifted', default: 100 },
            { key: 'reps', default: 5 },
        ],
        formulas: {
            one_rep_max: 'weight_lifted * (1 + reps/30)',
        },
        outputs: [{ key: 'one_rep_max', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'one-rep-max-calculator-epley-formula',
            title: 'One-Rep Max Calculator - Epley Formula',
            h1: 'One-Rep Max (1RM) Calculator',
            meta_title: 'One-Rep Max Calculator | Epley Formula',
            meta_description: 'Estimate your one-rep max (1RM) for any lift using the Epley formula, based on the weight you lifted and the number of reps completed.',
            short_answer: 'This calculator estimates your one-rep max (1RM) — the maximum weight you could lift for a single repetition — using the Epley formula, based on a lighter weight lifted for multiple reps.',
            intro_text: '<p>One-Rep Max (1RM) is the maximum amount of weight you can lift for a single repetition of an exercise, commonly used to set training percentages (e.g., "work at 80% of 1RM"). Testing a true 1RM directly carries injury risk, so most lifters estimate it from a set of multiple reps at a lighter, safer weight.</p><p><b>The Epley formula</b>, one of the most widely used estimation methods, extrapolates your 1RM from the weight and rep count of a recent set — most accurate for sets of 10 reps or fewer, since higher-rep estimates become less reliable.</p>',
            key_points: [
                '<b>Epley Formula:</b> Estimates 1RM as weight × (1 + reps/30) — simple, widely used, and reasonably accurate for sets under 10 reps.',
                '<b>Safer Than Direct Testing:</b> Avoids the injury risk of attempting a true maximal single lift.',
                '<b>Basis for Training Percentages:</b> Programs often prescribe work at specific 1RM percentages (e.g., 70%, 80%, 90%) for strength or hypertrophy phases.',
            ],
            howto: [
                { question: 'How accurate is the Epley formula?', answer: '<p>It is most accurate for sets of 1-10 reps performed close to failure. Estimates from very high-rep sets (15+) tend to be less reliable.</p>' },
                { question: 'Should I actually attempt my calculated 1RM?', answer: '<p>Not necessarily — the estimate is most useful for calculating training percentages. Attempting a true maximal lift should only be done with proper form, warm-up, and ideally a spotter.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Weight Lifted', type: 'number', unit: 'kg or lb', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Reps Completed', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Estimated One-Rep Max', precision: 1 }],
        },
        ru: {
            slug: 'kalkulyator-odnogo-povtoreniya-formula-epli',
            title: 'Калькулятор одного повторения (1ПМ) - формула Эпли',
            h1: 'Калькулятор одного повторения (1ПМ)',
            meta_title: 'Калькулятор 1ПМ | Формула Эпли',
            meta_description: 'Оцените ваш максимум на одно повторение (1ПМ) для любого упражнения по формуле Эпли, на основе поднятого веса и количества повторений.',
            short_answer: 'Этот калькулятор оценивает ваш максимум на одно повторение (1ПМ) — максимальный вес, который вы могли бы поднять один раз — по формуле Эпли, на основе более лёгкого веса на несколько повторений.',
            intro_text: '<p>Максимум на одно повторение (1ПМ) — это максимальный вес, который можно поднять за одно повторение упражнения, обычно используется для установки тренировочных процентов (например, «работать на 80% от 1ПМ»). Прямое тестирование истинного 1ПМ несёт риск травмы, поэтому большинство атлетов оценивают его по подходу с несколькими повторениями на более лёгком весе.</p><p><b>Формула Эпли</b>, один из самых распространённых методов оценки, экстраполирует 1ПМ по весу и числу повторений недавнего подхода — наиболее точна для подходов до 10 повторений.</p>',
            key_points: [
                '<b>Формула Эпли:</b> Оценивает 1ПМ как вес × (1 + повторения/30) — простая, широко используемая и достаточно точная для подходов до 10 повторений.',
                '<b>Безопаснее прямого теста:</b> Избегает риска травмы при попытке настоящего максимального подъёма.',
                '<b>Основа тренировочных процентов:</b> Программы часто предписывают работу на определённых процентах от 1ПМ (например, 70%, 80%, 90%) для фаз силы или гипертрофии.',
            ],
            howto: [
                { question: 'Насколько точна формула Эпли?', answer: '<p>Наиболее точна для подходов 1-10 повторений, выполненных близко к отказу. Оценки по подходам с очень большим числом повторений (15+) менее надёжны.</p>' },
                { question: 'Стоит ли пытаться поднять рассчитанный 1ПМ?', answer: '<p>Не обязательно — оценка наиболее полезна для расчёта тренировочных процентов. Попытку истинного максимального подъёма стоит делать только с правильной техникой, разминкой и, желательно, страхующим.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Поднятый вес', type: 'number', unit: 'кг или фунты', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Выполнено повторений', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Оценка максимума на одно повторение', precision: 1 }],
        },
        lv: {
            slug: 'viena-atkartojuma-maksimuma-kalkulators-epley',
            title: 'Viena Atkārtojuma Maksimuma (1ARM) Kalkulators - Epley Formula',
            h1: 'Viena Atkārtojuma Maksimuma (1ARM) Kalkulators',
            meta_title: 'Viena Atkārtojuma Maksimuma Kalkulators | Epley Formula',
            meta_description: 'Novērtējiet savu viena atkārtojuma maksimumu (1ARM) jebkuram vingrinājumam, izmantojot Epley formulu, balstoties uz celto svaru un atkārtojumu skaitu.',
            short_answer: 'Šis kalkulators novērtē jūsu viena atkārtojuma maksimumu (1ARM) — maksimālo svaru, ko varētu pacelt vienu reizi — izmantojot Epley formulu, balstoties uz vieglāku svaru vairākos atkārtojumos.',
            intro_text: '<p>Viena atkārtojuma maksimums (1ARM) ir maksimālais svars, ko var pacelt vienā vingrinājuma atkārtojumā, parasti izmanto, lai noteiktu treniņu procentus (piemēram, "strādāt pie 80% no 1ARM"). Tiešs īstā 1ARM tests nes traumu risku, tāpēc lielākā daļa sportistu to novērtē no vairāku atkārtojumu kopas ar vieglāku, drošāku svaru.</p><p><b>Epley formula</b>, viena no visplašāk izmantotajām novērtēšanas metodēm, ekstrapolē 1ARM no nesenā treniņa svara un atkārtojumu skaita — visprecīzākā kopām līdz 10 atkārtojumiem.</p>',
            key_points: [
                '<b>Epley formula:</b> Novērtē 1ARM kā svars × (1 + atkārtojumi/30) — vienkārša, plaši izmantota un samērā precīza kopām zem 10 atkārtojumiem.',
                '<b>Drošāka nekā tiešs tests:</b> Izvairās no traumu riska, mēģinot īstu maksimālu vienu pacēlumu.',
                '<b>Treniņu procentu pamats:</b> Programmas bieži paredz darbu pie noteiktiem 1ARM procentiem (piem., 70%, 80%, 90%) spēka vai hipertrofijas fāzēm.',
            ],
            howto: [
                { question: 'Cik precīza ir Epley formula?', answer: '<p>Visprecīzākā kopām ar 1-10 atkārtojumiem, kas veiktas tuvu atteikumam. Novērtējumi no ļoti daudzu atkārtojumu kopām (15+) ir mazāk uzticami.</p>' },
                { question: 'Vai jāmēģina pacelt aprēķinātais 1ARM?', answer: '<p>Ne obligāti — novērtējums visnoderīgākais treniņu procentu aprēķināšanai. Īsta maksimāla pacēluma mēģinājums jāveic tikai ar pareizu tehniku, iesildīšanos un, vēlams, apdrošinātāju.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Celtais svars', type: 'number', unit: 'kg vai mārciņas', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Veiktie atkārtojumi', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Novērtētais viena atkārtojuma maksimums', precision: 1 }],
        },
        pl: {
            slug: 'kalkulator-ciezaru-maksymalnego-formula-epley',
            title: 'Kalkulator Ciężaru Maksymalnego (1RM) - Formuła Epleya',
            h1: 'Kalkulator Ciężaru Maksymalnego (1RM)',
            meta_title: 'Kalkulator 1RM | Formuła Epleya',
            meta_description: 'Oszacuj swój ciężar maksymalny na jedno powtórzenie (1RM) dla dowolnego ćwiczenia za pomocą formuły Epleya, na podstawie podniesionego ciężaru i liczby powtórzeń.',
            short_answer: 'Ten kalkulator szacuje twój ciężar maksymalny na jedno powtórzenie (1RM) — maksymalny ciężar, jaki mógłbyś podnieść jednorazowo — za pomocą formuły Epleya, na podstawie lżejszego ciężaru na kilka powtórzeń.',
            intro_text: '<p>Ciężar maksymalny na jedno powtórzenie (1RM) to maksymalny ciężar, jaki można podnieść w jednym powtórzeniu ćwiczenia, powszechnie używany do ustalania procentów treningowych (np. "pracuj na 80% 1RM"). Bezpośredni test prawdziwego 1RM niesie ryzyko kontuzji, dlatego większość sportowców szacuje go na podstawie serii kilku powtórzeń z lżejszym, bezpieczniejszym ciężarem.</p><p><b>Formuła Epleya</b>, jedna z najpowszechniej stosowanych metod szacowania, ekstrapoluje 1RM na podstawie ciężaru i liczby powtórzeń ostatniej serii — najdokładniejsza dla serii do 10 powtórzeń.</p>',
            key_points: [
                '<b>Formuła Epleya:</b> Szacuje 1RM jako ciężar × (1 + powtórzenia/30) — prosta, powszechnie stosowana i dość dokładna dla serii poniżej 10 powtórzeń.',
                '<b>Bezpieczniejsza niż bezpośredni test:</b> Unika ryzyka kontuzji związanego z próbą prawdziwego maksymalnego podniesienia.',
                '<b>Podstawa procentów treningowych:</b> Programy często zalecają pracę przy określonych procentach 1RM (np. 70%, 80%, 90%) w fazach siły lub hipertrofii.',
            ],
            howto: [
                { question: 'Jak dokładna jest formuła Epleya?', answer: '<p>Najdokładniejsza dla serii 1-10 powtórzeń wykonanych blisko odmowy. Szacunki z serii o bardzo dużej liczbie powtórzeń (15+) są mniej wiarygodne.</p>' },
                { question: 'Czy powinienem faktycznie próbować podnieść obliczony 1RM?', answer: '<p>Niekoniecznie — oszacowanie jest najbardziej przydatne do obliczania procentów treningowych. Próbę prawdziwego maksymalnego podniesienia należy wykonywać tylko z prawidłową techniką, rozgrzewką i najlepiej z asekuracją.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Podniesiony Ciężar', type: 'number', unit: 'kg lub funty', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Wykonane Powtórzenia', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Szacowany Ciężar Maksymalny', precision: 1 }],
        },
        es: {
            slug: 'calculadora-una-repeticion-maxima-formula-epley',
            title: 'Calculadora de Una Repetición Máxima (1RM) - Fórmula de Epley',
            h1: 'Calculadora de Una Repetición Máxima (1RM)',
            meta_title: 'Calculadora de 1RM | Fórmula de Epley',
            meta_description: 'Estima tu máximo de una repetición (1RM) para cualquier ejercicio usando la fórmula de Epley, según el peso levantado y el número de repeticiones.',
            short_answer: 'Esta calculadora estima tu máximo de una repetición (1RM) — el peso máximo que podrías levantar una sola vez — usando la fórmula de Epley, a partir de un peso más ligero levantado varias repeticiones.',
            intro_text: '<p>El máximo de una repetición (1RM) es el peso máximo que puedes levantar en una sola repetición de un ejercicio, comúnmente usado para establecer porcentajes de entrenamiento (por ejemplo, "trabajar al 80% del 1RM"). Probar directamente un 1RM real conlleva riesgo de lesión, por lo que la mayoría de los atletas lo estiman a partir de una serie de varias repeticiones con un peso más ligero y seguro.</p><p><b>La fórmula de Epley</b>, uno de los métodos de estimación más utilizados, extrapola tu 1RM a partir del peso y las repeticiones de una serie reciente — más precisa para series de 10 repeticiones o menos.</p>',
            key_points: [
                '<b>Fórmula de Epley:</b> Estima el 1RM como peso × (1 + repeticiones/30) — simple, ampliamente usada y razonablemente precisa para series de menos de 10 repeticiones.',
                '<b>Más segura que la prueba directa:</b> Evita el riesgo de lesión de intentar un levantamiento máximo real.',
                '<b>Base para porcentajes de entrenamiento:</b> Los programas suelen prescribir trabajo a porcentajes específicos del 1RM (ej. 70%, 80%, 90%) para fases de fuerza o hipertrofia.',
            ],
            howto: [
                { question: '¿Qué tan precisa es la fórmula de Epley?', answer: '<p>Es más precisa para series de 1 a 10 repeticiones realizadas cerca del fallo. Las estimaciones de series con muchas repeticiones (15+) tienden a ser menos fiables.</p>' },
                { question: '¿Debo intentar realmente mi 1RM calculado?', answer: '<p>No necesariamente — la estimación es más útil para calcular porcentajes de entrenamiento. Un intento de levantamiento máximo real solo debe hacerse con buena técnica, calentamiento y, idealmente, un ayudante.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Peso Levantado', type: 'number', unit: 'kg o lb', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Repeticiones Completadas', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Máximo de Una Repetición Estimado', precision: 1 }],
        },
        fr: {
            slug: 'calculateur-repetition-maximale-formule-epley',
            title: 'Calculateur de Répétition Maximale (1RM) - Formule d’Epley',
            h1: 'Calculateur de Répétition Maximale (1RM)',
            meta_title: 'Calculateur de 1RM | Formule d’Epley',
            meta_description: 'Estimez votre maximum sur une répétition (1RM) pour n’importe quel mouvement avec la formule d’Epley, selon le poids soulevé et le nombre de répétitions.',
            short_answer: 'Ce calculateur estime votre maximum sur une répétition (1RM) — le poids maximal que vous pourriez soulever une seule fois — avec la formule d’Epley, à partir d’un poids plus léger soulevé sur plusieurs répétitions.',
            intro_text: '<p>Le maximum sur une répétition (1RM) est le poids maximal que vous pouvez soulever pour une seule répétition d’un exercice, couramment utilisé pour définir des pourcentages d’entraînement (par ex. "travailler à 80 % du 1RM"). Tester directement un vrai 1RM comporte un risque de blessure, la plupart des pratiquants l’estiment donc à partir d’une série de plusieurs répétitions avec un poids plus léger et plus sûr.</p><p><b>La formule d’Epley</b>, l’une des méthodes d’estimation les plus utilisées, extrapole votre 1RM à partir du poids et du nombre de répétitions d’une série récente — plus précise pour des séries de 10 répétitions ou moins.</p>',
            key_points: [
                '<b>Formule d’Epley :</b> Estime le 1RM comme poids × (1 + répétitions/30) — simple, largement utilisée et raisonnablement précise pour des séries de moins de 10 répétitions.',
                '<b>Plus sûre qu’un test direct :</b> Évite le risque de blessure lié à une tentative de levée maximale réelle.',
                '<b>Base des pourcentages d’entraînement :</b> Les programmes prescrivent souvent un travail à des pourcentages précis du 1RM (ex. 70 %, 80 %, 90 %) pour les phases de force ou d’hypertrophie.',
            ],
            howto: [
                { question: 'Quelle est la précision de la formule d’Epley ?', answer: '<p>Elle est plus précise pour des séries de 1 à 10 répétitions effectuées proche de l’échec. Les estimations issues de séries à très hautes répétitions (15+) sont moins fiables.</p>' },
                { question: 'Dois-je vraiment tenter mon 1RM calculé ?', answer: '<p>Pas nécessairement — l’estimation est surtout utile pour calculer des pourcentages d’entraînement. Une tentative de levée maximale réelle ne doit se faire qu’avec une bonne technique, un échauffement et idéalement un pareur.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Poids Soulevé', type: 'number', unit: 'kg ou lb', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Répétitions Effectuées', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Maximum Estimé sur Une Répétition', precision: 1 }],
        },
        it: {
            slug: 'calcolatore-massimale-una-ripetizione-epley',
            title: 'Calcolatore Massimale su Una Ripetizione (1RM) - Formula di Epley',
            h1: 'Calcolatore Massimale su Una Ripetizione (1RM)',
            meta_title: 'Calcolatore 1RM | Formula di Epley',
            meta_description: 'Stima il tuo massimale su una ripetizione (1RM) per qualsiasi esercizio con la formula di Epley, in base al peso sollevato e al numero di ripetizioni.',
            short_answer: 'Questo calcolatore stima il tuo massimale su una ripetizione (1RM) — il peso massimo che potresti sollevare una sola volta — con la formula di Epley, partendo da un peso più leggero sollevato per più ripetizioni.',
            intro_text: '<p>Il massimale su una ripetizione (1RM) è il peso massimo che puoi sollevare per una singola ripetizione di un esercizio, comunemente usato per impostare le percentuali di allenamento (es. "lavorare all’80% del 1RM"). Testare direttamente un vero 1RM comporta rischio di infortunio, quindi la maggior parte degli atleti lo stima da una serie di più ripetizioni con un peso più leggero e sicuro.</p><p><b>La formula di Epley</b>, uno dei metodi di stima più diffusi, estrapola il tuo 1RM dal peso e dal numero di ripetizioni di una serie recente — più accurata per serie fino a 10 ripetizioni.</p>',
            key_points: [
                '<b>Formula di Epley:</b> Stima il 1RM come peso × (1 + ripetizioni/30) — semplice, ampiamente utilizzata e ragionevolmente accurata per serie sotto le 10 ripetizioni.',
                '<b>Più sicura del test diretto:</b> Evita il rischio di infortunio nel tentare un vero sollevamento massimale.',
                '<b>Base per le percentuali di allenamento:</b> I programmi spesso prescrivono lavoro a percentuali specifiche del 1RM (es. 70%, 80%, 90%) per fasi di forza o ipertrofia.',
            ],
            howto: [
                { question: 'Quanto è accurata la formula di Epley?', answer: '<p>È più accurata per serie da 1 a 10 ripetizioni eseguite vicino al cedimento. Le stime da serie con moltissime ripetizioni (15+) tendono a essere meno affidabili.</p>' },
                { question: 'Dovrei davvero provare il mio 1RM calcolato?', answer: '<p>Non necessariamente — la stima è più utile per calcolare le percentuali di allenamento. Un tentativo di sollevamento massimale reale andrebbe fatto solo con tecnica corretta, riscaldamento e idealmente uno spotter.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Peso Sollevato', type: 'number', unit: 'kg o lb', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Ripetizioni Completate', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Massimale su Una Ripetizione Stimato', precision: 1 }],
        },
        de: {
            slug: 'einer-wiederholungs-maximum-rechner-epley',
            title: 'Ein-Wiederholungs-Maximum (1RM) Rechner - Epley-Formel',
            h1: 'Ein-Wiederholungs-Maximum (1RM) Rechner',
            meta_title: '1RM-Rechner | Epley-Formel',
            meta_description: 'Schätzen Sie Ihr Ein-Wiederholungs-Maximum (1RM) für jede Übung mit der Epley-Formel, basierend auf dem gehobenen Gewicht und der Anzahl der Wiederholungen.',
            short_answer: 'Dieser Rechner schätzt Ihr Ein-Wiederholungs-Maximum (1RM) — das maximale Gewicht, das Sie für eine einzelne Wiederholung heben könnten — mit der Epley-Formel, basierend auf einem leichteren Gewicht über mehrere Wiederholungen.',
            intro_text: '<p>Das Ein-Wiederholungs-Maximum (1RM) ist das maximale Gewicht, das Sie für eine einzelne Wiederholung einer Übung heben können, häufig verwendet, um Trainingsprozentsätze festzulegen (z. B. "bei 80 % des 1RM arbeiten"). Ein echtes 1RM direkt zu testen birgt Verletzungsrisiko, weshalb die meisten Sportler es anhand eines Satzes mit mehreren Wiederholungen bei einem leichteren, sichereren Gewicht schätzen.</p><p><b>Die Epley-Formel</b>, eine der am weitesten verbreiteten Schätzmethoden, extrapoliert Ihr 1RM aus Gewicht und Wiederholungszahl eines aktuellen Satzes — am genauesten für Sätze mit 10 oder weniger Wiederholungen.</p>',
            key_points: [
                '<b>Epley-Formel:</b> Schätzt das 1RM als Gewicht × (1 + Wiederholungen/30) — einfach, weit verbreitet und für Sätze unter 10 Wiederholungen recht genau.',
                '<b>Sicherer als direktes Testen:</b> Vermeidet das Verletzungsrisiko eines Versuchs eines echten maximalen Einzelhebens.',
                '<b>Grundlage für Trainingsprozentsätze:</b> Programme schreiben oft Arbeit bei bestimmten 1RM-Prozentsätzen vor (z. B. 70 %, 80 %, 90 %) für Kraft- oder Hypertrophiephasen.',
            ],
            howto: [
                { question: 'Wie genau ist die Epley-Formel?', answer: '<p>Am genauesten für Sätze mit 1-10 Wiederholungen nahe am Muskelversagen. Schätzungen aus Sätzen mit sehr vielen Wiederholungen (15+) sind weniger zuverlässig.</p>' },
                { question: 'Sollte ich mein berechnetes 1RM tatsächlich versuchen?', answer: '<p>Nicht unbedingt — die Schätzung ist vor allem für die Berechnung von Trainingsprozentsätzen nützlich. Ein Versuch eines echten maximalen Hebens sollte nur mit korrekter Technik, Aufwärmen und idealerweise einem Spotter erfolgen.</p>' },
            ],
            inputs: [
                { name: 'weight_lifted', label: 'Gehobenes Gewicht', type: 'number', unit: 'kg oder lb', min: 1, max: 500, placeholder: '100' },
                { name: 'reps', label: 'Ausgeführte Wiederholungen', type: 'number', min: 1, max: 15, placeholder: '5' },
            ],
            outputs: [{ name: 'one_rep_max', label: 'Geschätztes Ein-Wiederholungs-Maximum', precision: 1 }],
        },
    },
}

export const tools: ToolDef[] = [bmr, tdee, bodyFat, idealBodyWeight, waistToHip, waterIntake, macros, targetHeartRate, oneRepMax]

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

    // Привязка к категории Health & Fitness (idempotent)
    const existingLink = await prisma.toolCategory.findUnique({
        where: { tool_id_category_id: { tool_id: def.id, category_id: HEALTH_FITNESS_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: HEALTH_FITNESS_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} health & fitness calculators across ${LOCALES.length} locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
