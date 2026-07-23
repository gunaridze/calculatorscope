// One-off script: seeds 12 new Construction Calculators
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-construction-calculators.ts
//
// Tool IDs 1169-1180, category_id '6' (Construction Calculators, top-level,
// no parent). No explicit tool list was given, only 7 themes (concrete
// volume, cubic yards, square footage, tank capacity, mulch, gravel,
// roadway fill) for 12 tools; the concrete list was proposed and confirmed
// with the user before writing content.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CONSTRUCTION_CATEGORY_ID = '6'

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
const LENGTH_FT_LABEL: Record<string, string> = { en: 'Length (feet)', ru: 'Длина (футы)', de: 'Länge (Fuß)', es: 'Longitud (pies)', fr: 'Longueur (pieds)', it: 'Lunghezza (piedi)', pl: 'Długość (stopy)', lv: 'Garums (pēdas)' }
const WIDTH_FT_LABEL: Record<string, string> = { en: 'Width (feet)', ru: 'Ширина (футы)', de: 'Breite (Fuß)', es: 'Ancho (pies)', fr: 'Largeur (pieds)', it: 'Larghezza (piedi)', pl: 'Szerokość (stopy)', lv: 'Platums (pēdas)' }
const DEPTH_IN_LABEL: Record<string, string> = { en: 'Depth (inches)', ru: 'Глубина (дюймы)', de: 'Tiefe (Zoll)', es: 'Profundidad (pulgadas)', fr: 'Profondeur (pouces)', it: 'Profondità (pollici)', pl: 'Głębokość (cale)', lv: 'Dziļums (collas)' }
const CUFT_LABEL: Record<string, string> = { en: 'Cubic Feet', ru: 'Кубические футы', de: 'Kubikfuß', es: 'Pies Cúbicos', fr: 'Pieds Cubes', it: 'Piedi Cubi', pl: 'Stopy Sześcienne', lv: 'Kubikpēdas' }
const CUYD_LABEL: Record<string, string> = { en: 'Cubic Yards', ru: 'Кубические ярды', de: 'Kubikyards', es: 'Yardas Cúbicas', fr: 'Verges Cubes', it: 'Iarde Cubiche', pl: 'Jardy Sześcienne', lv: 'Kubikjardas' }
const TONS_LABEL: Record<string, string> = { en: 'Tons', ru: 'Тонны', de: 'Tonnen', es: 'Toneladas', fr: 'Tonnes', it: 'Tonnellate', pl: 'Tony', lv: 'Tonnas' }

const THICKNESS_LABEL: Record<string, string> = { en: 'Thickness (inches)', ru: 'Толщина (дюймы)', de: 'Dicke (Zoll)', es: 'Espesor (pulgadas)', fr: 'Épaisseur (pouces)', it: 'Spessore (pollici)', pl: 'Grubość (cale)', lv: 'Biezums (collas)' }
const BAGS_80LB_LABEL: Record<string, string> = { en: 'Bags Needed (80 lb)', ru: 'Нужно мешков (80 фунтов)', de: 'Benötigte Säcke (80 lb)', es: 'Bolsas Necesarias (80 lb)', fr: 'Sacs Nécessaires (80 lb)', it: 'Sacchi Necessari (80 lb)', pl: 'Potrzebne Worki (80 funtów)', lv: 'Nepieciešamie Maisi (80 mārciņas)' }

// ============================================================
// 1169: Concrete Calculator
// ============================================================
const concreteCalculatorTool: ToolDef = {
    id: '1169',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 10 }, { key: 'width', default: 10 }, { key: 'thickness', default: 4 }],
        functions: { result: { type: 'function', functionName: 'concreteCalculator', params: { length: 'length', width: 'width', thickness: 'thickness' } } },
        outputs: [{ key: 'volume_cuft', precision: 2 }, { key: 'volume_cuyd', precision: 2 }, { key: 'bags_80lb' }],
    },
    locales: {
        en: {
            slug: 'concrete-calculator', title: 'Concrete Calculator', h1: 'Concrete Calculator',
            meta_title: 'Concrete Calculator | Slab Volume in Cubic Yards and Bags Needed',
            meta_description: 'Calculate concrete volume for a slab or footing in cubic feet, cubic yards, and 80 lb bags needed.',
            short_answer: 'This calculator finds the concrete volume for a slab, e.g. a 10×10 ft slab at 4 inches thick = 1.23 cubic yards, about 56 bags of 80 lb pre-mix.',
            intro_text: '<p>Enter the length and width of your slab or footing, plus its thickness in inches, to find the volume of concrete needed — shown in cubic feet, cubic yards (how ready-mix is typically ordered), and the number of 80 lb pre-mixed bags if you\'re buying bagged concrete instead.</p>',
            key_points: [
                '<b>Formula:</b> Volume = Length × Width × (Thickness ÷ 12), converted to cubic yards by dividing by 27.',
                '<b>Example:</b> a 10×10 ft slab at 4 inches = 10 × 10 × (4÷12) = 33.3 cubic feet = 1.23 cubic yards.',
                '<b>Bag count:</b> based on the standard yield of an 80 lb bag (about 0.6 cubic feet) — always round up and buy a few extra bags for waste and uneven subgrade.',
            ],
            howto: [
                { question: 'Should I order ready-mix or use bagged concrete?', answer: '<p>Ready-mix (ordered by the cubic yard) is usually more economical and consistent for anything over about 1 cubic yard; bagged concrete is more practical for small jobs.</p>' },
                { question: 'Does this account for waste?', answer: '<p>No — it\'s the exact geometric volume. Most contractors add 5-10% extra to cover spillage, uneven excavation, and minor form movement.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.en, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.en, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.en },
            ],
        },
        ru: {
            slug: 'kalkulyator-betona', title: 'Калькулятор бетона', h1: 'Калькулятор бетона',
            meta_title: 'Калькулятор бетона | Объём плиты в кубических ярдах и мешках',
            meta_description: 'Рассчитайте объём бетона для плиты или фундамента в кубических футах, ярдах и количестве мешков по 80 фунтов.',
            short_answer: 'Этот калькулятор находит объём бетона для плиты, например плита 10×10 футов толщиной 4 дюйма = 1,23 кубического ярда, около 56 мешков по 80 фунтов готовой смеси.',
            intro_text: '<p>Введите длину и ширину вашей плиты или фундамента, плюс толщину в дюймах, чтобы найти необходимый объём бетона — в кубических футах, кубических ярдах и количестве мешков по 80 фунтов.</p>',
            key_points: [
                '<b>Формула:</b> Объём = Длина × Ширина × (Толщина ÷ 12), переводится в кубические ярды делением на 27.',
                '<b>Пример:</b> плита 10×10 футов толщиной 4 дюйма = 33,3 куб. фута = 1,23 куб. ярда.',
                '<b>Количество мешков:</b> на основе стандартного выхода мешка 80 фунтов (около 0,6 куб. футов) — всегда округляйте вверх и покупайте немного запасных мешков.',
            ],
            howto: [
                { question: 'Заказывать готовую смесь или использовать мешки?', answer: '<p>Готовая смесь (заказывается по кубическим ярдам) обычно экономичнее для объёма более 1 куб. ярда; мешки практичнее для небольших работ.</p>' },
                { question: 'Учитывается ли отход материала?', answer: '<p>Нет — это точный геометрический объём. Большинство подрядчиков добавляют 5-10% сверху на разлив и неровности.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.ru, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.ru, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.ru },
            ],
        },
        lv: {
            slug: 'betona-kalkulators', title: 'Betona Kalkulators', h1: 'Betona Kalkulators',
            meta_title: 'Betona Kalkulators | Plātnes Tilpums Kubikjardās un Nepieciešamie Maisi',
            meta_description: 'Aprēķiniet betona tilpumu plātnei vai pamatam kubikpēdās, kubikjardās un nepieciešamo 80 mārciņu maisu skaitu.',
            short_answer: 'Šis kalkulators atrod betona tilpumu plātnei, piemēram, 10×10 pēdu plātne 4 collu biezumā = 1,23 kubikjardas, apmēram 56 maisi 80 mārciņu gatavā maisījuma.',
            intro_text: '<p>Ievadiet plātnes vai pamata garumu un platumu, plus biezumu collās, lai atrastu nepieciešamo betona tilpumu — kubikpēdās, kubikjardās un 80 mārciņu maisu skaitā.</p>',
            key_points: [
                '<b>Formula:</b> Tilpums = Garums × Platums × (Biezums ÷ 12), pārvērsts kubikjardās, dalot ar 27.',
                '<b>Piemērs:</b> 10×10 pēdu plātne 4 collu biezumā = 33,3 kubikpēdas = 1,23 kubikjardas.',
                '<b>Maisu skaits:</b> balstīts uz standarta 80 mārciņu maisa iznākumu (apmēram 0,6 kubikpēdas) — vienmēr noapaļojiet uz augšu un pērciet dažus rezerves maisus.',
            ],
            howto: [
                { question: 'Vai pasūtīt gatavo maisījumu vai izmantot maisus?', answer: '<p>Gatavais maisījums (pasūtīts pa kubikjardām) parasti ir ekonomiskāks apjomiem virs 1 kubikjardas; maisi ir praktiskāki mazākiem darbiem.</p>' },
                { question: 'Vai tas ņem vērā materiāla zudumus?', answer: '<p>Nē — tas ir precīzs ģeometriskais tilpums. Lielākā daļa darbuzņēmēju pievieno 5-10% papildu izliešanai un nelīdzenumiem.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.lv, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.lv, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.lv },
            ],
        },
        pl: {
            slug: 'kalkulator-betonu', title: 'Kalkulator Betonu', h1: 'Kalkulator Betonu',
            meta_title: 'Kalkulator Betonu | Objętość Płyty w Jardach Sześciennych i Potrzebne Worki',
            meta_description: 'Oblicz objętość betonu dla płyty lub fundamentu w stopach sześciennych, jardach sześciennych i liczbie worków po 80 funtów.',
            short_answer: 'Ten kalkulator znajduje objętość betonu dla płyty, np. płyta 10×10 stóp o grubości 4 cali = 1,23 jarda sześciennego, około 56 worków 80-funtowej gotowej mieszanki.',
            intro_text: '<p>Wpisz długość i szerokość swojej płyty lub fundamentu, plus grubość w calach, aby znaleźć potrzebną objętość betonu — w stopach sześciennych, jardach sześciennych i liczbie worków po 80 funtów.</p>',
            key_points: [
                '<b>Wzór:</b> Objętość = Długość × Szerokość × (Grubość ÷ 12), przeliczona na jardy sześcienne przez podzielenie przez 27.',
                '<b>Przykład:</b> płyta 10×10 stóp o grubości 4 cali = 33,3 stopy sześcienne = 1,23 jarda sześciennego.',
                '<b>Liczba worków:</b> na podstawie standardowej wydajności worka 80 funtów (około 0,6 stopy sześciennej) — zawsze zaokrąglaj w górę i kupuj kilka zapasowych worków.',
            ],
            howto: [
                { question: 'Czy zamawiać gotową mieszankę czy używać worków?', answer: '<p>Gotowa mieszanka (zamawiana na jardy sześcienne) jest zwykle bardziej ekonomiczna dla objętości powyżej 1 jarda sześciennego; worki są praktyczniejsze do małych prac.</p>' },
                { question: 'Czy to uwzględnia odpady?', answer: '<p>Nie — to dokładna objętość geometryczna. Większość wykonawców dodaje 5-10% na rozlanie i nierówności.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.pl, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.pl, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.pl },
            ],
        },
        es: {
            slug: 'calculadora-de-concreto', title: 'Calculadora de Concreto', h1: 'Calculadora de Concreto',
            meta_title: 'Calculadora de Concreto | Volumen de Losa en Yardas Cúbicas y Bolsas Necesarias',
            meta_description: 'Calcula el volumen de concreto para una losa o zapata en pies cúbicos, yardas cúbicas y bolsas de 80 lb necesarias.',
            short_answer: 'Esta calculadora encuentra el volumen de concreto para una losa, p. ej. una losa de 10×10 pies a 4 pulgadas de espesor = 1.23 yardas cúbicas, unas 56 bolsas de 80 lb de premezcla.',
            intro_text: '<p>Introduce el largo y ancho de tu losa o zapata, más el espesor en pulgadas, para encontrar el volumen de concreto necesario — en pies cúbicos, yardas cúbicas y número de bolsas de 80 lb premezcladas.</p>',
            key_points: [
                '<b>Fórmula:</b> Volumen = Largo × Ancho × (Espesor ÷ 12), convertido a yardas cúbicas dividiendo entre 27.',
                '<b>Ejemplo:</b> una losa de 10×10 pies a 4 pulgadas = 33.3 pies cúbicos = 1.23 yardas cúbicas.',
                '<b>Número de bolsas:</b> basado en el rendimiento estándar de una bolsa de 80 lb (unos 0.6 pies cúbicos) — siempre redondea hacia arriba y compra bolsas extra.',
            ],
            howto: [
                { question: '¿Debería pedir concreto premezclado o usar bolsas?', answer: '<p>El premezclado (pedido por yarda cúbica) suele ser más económico para más de 1 yarda cúbica; las bolsas son más prácticas para trabajos pequeños.</p>' },
                { question: '¿Esto tiene en cuenta el desperdicio?', answer: '<p>No — es el volumen geométrico exacto. La mayoría de contratistas añaden 5-10% extra para derrames e irregularidades.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.es, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.es, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.es },
            ],
        },
        fr: {
            slug: 'calculateur-de-beton', title: 'Calculateur de Béton', h1: 'Calculateur de Béton',
            meta_title: 'Calculateur de Béton | Volume de Dalle en Verges Cubes et Sacs Nécessaires',
            meta_description: 'Calculez le volume de béton pour une dalle ou une semelle en pieds cubes, verges cubes et sacs de 80 lb nécessaires.',
            short_answer: 'Ce calculateur trouve le volume de béton pour une dalle, ex. une dalle de 10×10 pieds à 4 pouces d\'épaisseur = 1,23 verge cube, environ 56 sacs de 80 lb de prémélange.',
            intro_text: '<p>Entrez la longueur et la largeur de votre dalle ou semelle, plus l\'épaisseur en pouces, pour trouver le volume de béton nécessaire — en pieds cubes, verges cubes et nombre de sacs de 80 lb prémélangés.</p>',
            key_points: [
                '<b>Formule :</b> Volume = Longueur × Largeur × (Épaisseur ÷ 12), converti en verges cubes en divisant par 27.',
                '<b>Exemple :</b> une dalle de 10×10 pieds à 4 pouces = 33,3 pieds cubes = 1,23 verge cube.',
                '<b>Nombre de sacs :</b> basé sur le rendement standard d\'un sac de 80 lb (environ 0,6 pied cube) — arrondissez toujours vers le haut et achetez quelques sacs supplémentaires.',
            ],
            howto: [
                { question: 'Dois-je commander du béton prémélangé ou utiliser des sacs ?', answer: '<p>Le prémélangé (commandé à la verge cube) est généralement plus économique pour plus d\'1 verge cube ; les sacs sont plus pratiques pour les petits travaux.</p>' },
                { question: 'Cela tient-il compte du gaspillage ?', answer: '<p>Non — c\'est le volume géométrique exact. La plupart des entrepreneurs ajoutent 5-10% supplémentaires pour les déversements et irrégularités.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.fr, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.fr, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.fr },
            ],
        },
        it: {
            slug: 'calcolatore-di-calcestruzzo', title: 'Calcolatore di Calcestruzzo', h1: 'Calcolatore di Calcestruzzo',
            meta_title: 'Calcolatore di Calcestruzzo | Volume Lastra in Iarde Cubiche e Sacchi Necessari',
            meta_description: 'Calcola il volume di calcestruzzo per una lastra o fondazione in piedi cubici, iarde cubiche e sacchi da 80 lb necessari.',
            short_answer: 'Questo calcolatore trova il volume di calcestruzzo per una lastra, es. una lastra 10×10 piedi spessa 4 pollici = 1,23 iarde cubiche, circa 56 sacchi da 80 lb di premiscelato.',
            intro_text: '<p>Inserisci la lunghezza e larghezza della tua lastra o fondazione, più lo spessore in pollici, per trovare il volume di calcestruzzo necessario — in piedi cubici, iarde cubiche e numero di sacchi premiscelati da 80 lb.</p>',
            key_points: [
                '<b>Formula:</b> Volume = Lunghezza × Larghezza × (Spessore ÷ 12), convertito in iarde cubiche dividendo per 27.',
                '<b>Esempio:</b> una lastra 10×10 piedi spessa 4 pollici = 33,3 piedi cubici = 1,23 iarde cubiche.',
                '<b>Numero di sacchi:</b> basato sulla resa standard di un sacco da 80 lb (circa 0,6 piedi cubici) — arrotonda sempre per eccesso e compra qualche sacco extra.',
            ],
            howto: [
                { question: 'Dovrei ordinare calcestruzzo premiscelato o usare sacchi?', answer: '<p>Il premiscelato (ordinato per iarda cubica) è solitamente più economico per oltre 1 iarda cubica; i sacchi sono più pratici per piccoli lavori.</p>' },
                { question: 'Questo tiene conto degli scarti?', answer: '<p>No — è il volume geometrico esatto. La maggior parte degli appaltatori aggiunge il 5-10% extra per fuoriuscite e irregolarità.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.it, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.it, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.it },
            ],
        },
        de: {
            slug: 'beton-rechner', title: 'Beton-Rechner', h1: 'Beton-Rechner',
            meta_title: 'Beton-Rechner | Plattenvolumen in Kubikyards und Benötigte Säcke',
            meta_description: 'Berechnen Sie das Betonvolumen für eine Platte oder ein Fundament in Kubikfuß, Kubikyards und benötigten 80-lb-Säcken.',
            short_answer: 'Dieser Rechner findet das Betonvolumen für eine Platte, z.B. eine 10×10 Fuß Platte bei 4 Zoll Dicke = 1,23 Kubikyards, etwa 56 Säcke à 80 lb Fertigmischung.',
            intro_text: '<p>Geben Sie Länge und Breite Ihrer Platte oder Ihres Fundaments ein, plus die Dicke in Zoll, um das benötigte Betonvolumen zu finden — in Kubikfuß, Kubikyards und der Anzahl der 80-lb-Fertigmischsäcke.</p>',
            key_points: [
                '<b>Formel:</b> Volumen = Länge × Breite × (Dicke ÷ 12), umgerechnet in Kubikyards durch Division durch 27.',
                '<b>Beispiel:</b> eine 10×10 Fuß Platte bei 4 Zoll = 33,3 Kubikfuß = 1,23 Kubikyards.',
                '<b>Sackanzahl:</b> basierend auf der Standardausbeute eines 80-lb-Sacks (etwa 0,6 Kubikfuß) — immer aufrunden und ein paar zusätzliche Säcke kaufen.',
            ],
            howto: [
                { question: 'Sollte ich Fertigbeton bestellen oder Sackware verwenden?', answer: '<p>Fertigbeton (pro Kubikyard bestellt) ist normalerweise wirtschaftlicher für mehr als 1 Kubikyard; Sackware ist praktischer für kleine Arbeiten.</p>' },
                { question: 'Wird Verschnitt berücksichtigt?', answer: '<p>Nein — es ist das exakte geometrische Volumen. Die meisten Auftragnehmer fügen 5-10% zusätzlich für Verschütten und Unebenheiten hinzu.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '10' },
                { name: 'thickness', label: THICKNESS_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [
                { name: 'volume_cuft', label: CUFT_LABEL.de, precision: 2 },
                { name: 'volume_cuyd', label: CUYD_LABEL.de, precision: 2 },
                { name: 'bags_80lb', label: BAGS_80LB_LABEL.de },
            ],
        },
    },
}

const VOLUME_CUFT_INPUT_LABEL: Record<string, string> = { en: 'Required Volume (cubic feet)', ru: 'Требуемый объём (куб. футы)', de: 'Benötigtes Volumen (Kubikfuß)', es: 'Volumen Requerido (pies cúbicos)', fr: 'Volume Requis (pieds cubes)', it: 'Volume Richiesto (piedi cubici)', pl: 'Wymagana Objętość (stopy sześcienne)', lv: 'Nepieciešamais Tilpums (kubikpēdas)' }
const BAGS_40LB_LABEL: Record<string, string> = { en: 'Bags (40 lb)', ru: 'Мешков (40 фунтов)', de: 'Säcke (40 lb)', es: 'Bolsas (40 lb)', fr: 'Sacs (40 lb)', it: 'Sacchi (40 lb)', pl: 'Worki (40 funtów)', lv: 'Maisi (40 mārciņas)' }
const BAGS_60LB_LABEL: Record<string, string> = { en: 'Bags (60 lb)', ru: 'Мешков (60 фунтов)', de: 'Säcke (60 lb)', es: 'Bolsas (60 lb)', fr: 'Sacs (60 lb)', it: 'Sacchi (60 lb)', pl: 'Worki (60 funtów)', lv: 'Maisi (60 mārciņas)' }
const BAGS_80LB2_LABEL: Record<string, string> = { en: 'Bags (80 lb)', ru: 'Мешков (80 фунтов)', de: 'Säcke (80 lb)', es: 'Bolsas (80 lb)', fr: 'Sacs (80 lb)', it: 'Sacchi (80 lb)', pl: 'Worki (80 funtów)', lv: 'Maisi (80 mārciņas)' }

// ============================================================
// 1170: Concrete Bags Calculator
// ============================================================
const concreteBagsCalculatorTool: ToolDef = {
    id: '1170',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'volume_cuft', default: 10 }],
        functions: { result: { type: 'function', functionName: 'concreteBagsCalculator', params: { volume_cuft: 'volume_cuft' } } },
        outputs: [{ key: 'bags_40lb' }, { key: 'bags_60lb' }, { key: 'bags_80lb' }],
    },
    locales: {
        en: {
            slug: 'concrete-bags-calculator', title: 'Concrete Bags Calculator', h1: 'Concrete Bags Calculator',
            meta_title: 'Concrete Bags Calculator | 40 lb, 60 lb, and 80 lb Bag Counts',
            meta_description: 'Find how many 40 lb, 60 lb, or 80 lb bags of concrete you need for a given volume.',
            short_answer: 'This calculator finds how many bags of concrete you need for a known volume, e.g. 10 cubic feet needs 17 bags of 80 lb mix.',
            intro_text: '<p>If you already know the volume of concrete you need (in cubic feet), this tool tells you how many bags to buy at each common bag size — handy for comparing which size is most cost-effective or available at your local supplier.</p>',
            key_points: [
                '<b>Standard yields:</b> a 40 lb bag yields about 0.30 cubic feet, a 60 lb bag about 0.45 cubic feet, and an 80 lb bag about 0.60 cubic feet.',
                '<b>Example:</b> for 10 cubic feet, you\'d need 34 bags at 40 lb, 23 bags at 60 lb, or 17 bags at 80 lb.',
                '<b>Don\'t know your volume yet?</b> Use the Concrete Calculator on this site first to find the cubic feet from your slab or footing dimensions.',
            ],
            howto: [
                { question: 'Which bag size should I choose?', answer: '<p>Larger bags (80 lb) are usually more cost-effective per cubic foot but heavier to carry — 40 lb bags are easier to handle alone for smaller DIY jobs.</p>' },
                { question: 'Should I buy extra bags beyond the calculated amount?', answer: '<p>Yes — buying a few extra bags is standard practice to cover spillage, mixing losses, and minor measurement error.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.en },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.en },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.en },
            ],
        },
        ru: {
            slug: 'kalkulyator-meshkov-betona', title: 'Калькулятор мешков бетона', h1: 'Калькулятор мешков бетона',
            meta_title: 'Калькулятор мешков бетона | Количество мешков 40, 60 и 80 фунтов',
            meta_description: 'Узнайте, сколько мешков бетона по 40, 60 или 80 фунтов вам нужно для заданного объёма.',
            short_answer: 'Этот калькулятор находит, сколько мешков бетона нужно для известного объёма, например 10 куб. футов требует 17 мешков смеси по 80 фунтов.',
            intro_text: '<p>Если вы уже знаете необходимый объём бетона (в кубических футах), этот инструмент покажет, сколько мешков купить для каждого распространённого размера.</p>',
            key_points: [
                '<b>Стандартные выходы:</b> мешок 40 фунтов даёт около 0,30 куб. футов, 60 фунтов — около 0,45, 80 фунтов — около 0,60.',
                '<b>Пример:</b> для 10 куб. футов нужно 34 мешка по 40 фунтов, 23 по 60 фунтов или 17 по 80 фунтов.',
                '<b>Не знаете объём?</b> Сначала используйте Калькулятор бетона на этом сайте.',
            ],
            howto: [
                { question: 'Какой размер мешка выбрать?', answer: '<p>Большие мешки (80 фунтов) обычно экономичнее на кубический фут, но тяжелее носить.</p>' },
                { question: 'Нужно ли покупать мешки с запасом?', answer: '<p>Да — покупка нескольких запасных мешков — стандартная практика для покрытия разлива и потерь при смешивании.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.ru },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.ru },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.ru },
            ],
        },
        lv: {
            slug: 'betona-maisu-kalkulators', title: 'Betona Maisu Kalkulators', h1: 'Betona Maisu Kalkulators',
            meta_title: 'Betona Maisu Kalkulators | 40, 60 un 80 Mārciņu Maisu Skaits',
            meta_description: 'Uzziniet, cik 40, 60 vai 80 mārciņu betona maisu jums nepieciešams noteiktam tilpumam.',
            short_answer: 'Šis kalkulators atrod, cik betona maisu nepieciešams zināmam tilpumam, piemēram, 10 kubikpēdām nepieciešami 17 maisi 80 mārciņu maisījuma.',
            intro_text: '<p>Ja jūs jau zināt nepieciešamo betona tilpumu (kubikpēdās), šis rīks parāda, cik maisu iegādāties katram izplatītajam izmēram.</p>',
            key_points: [
                '<b>Standarta iznākumi:</b> 40 mārciņu maiss dod apmēram 0,30 kubikpēdas, 60 mārciņu — apmēram 0,45, 80 mārciņu — apmēram 0,60.',
                '<b>Piemērs:</b> 10 kubikpēdām nepieciešami 34 maisi pa 40 mārciņām, 23 pa 60 mārciņām vai 17 pa 80 mārciņām.',
                '<b>Nezināt tilpumu?</b> Vispirms izmantojiet Betona Kalkulatoru šajā vietnē.',
            ],
            howto: [
                { question: 'Kādu maisa izmēru izvēlēties?', answer: '<p>Lielāki maisi (80 mārciņas) parasti ir ekonomiskāki uz kubikpēdu, bet smagāki nešanai.</p>' },
                { question: 'Vai jāpērk maisi ar rezervi?', answer: '<p>Jā — dažu rezerves maisu iegāde ir standarta prakse, lai segtu izliešanu un jaukšanas zudumus.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.lv },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.lv },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.lv },
            ],
        },
        pl: {
            slug: 'kalkulator-workow-betonu', title: 'Kalkulator Worków Betonu', h1: 'Kalkulator Worków Betonu',
            meta_title: 'Kalkulator Worków Betonu | Liczba Worków 40, 60 i 80 Funtów',
            meta_description: 'Sprawdź, ile worków betonu po 40, 60 lub 80 funtów potrzebujesz na daną objętość.',
            short_answer: 'Ten kalkulator znajduje, ile worków betonu potrzebujesz dla znanej objętości, np. 10 stóp sześciennych wymaga 17 worków mieszanki 80 funtów.',
            intro_text: '<p>Jeśli już znasz potrzebną objętość betonu (w stopach sześciennych), to narzędzie pokazuje, ile worków kupić dla każdego popularnego rozmiaru.</p>',
            key_points: [
                '<b>Standardowe wydajności:</b> worek 40 funtów daje około 0,30 stopy sześciennej, 60 funtów — około 0,45, 80 funtów — około 0,60.',
                '<b>Przykład:</b> dla 10 stóp sześciennych potrzeba 34 worków po 40 funtów, 23 po 60 funtów lub 17 po 80 funtów.',
                '<b>Nie znasz objętości?</b> Najpierw użyj Kalkulatora Betonu na tej stronie.',
            ],
            howto: [
                { question: 'Który rozmiar worka wybrać?', answer: '<p>Większe worki (80 funtów) są zwykle bardziej ekonomiczne na stopę sześcienną, ale cięższe do noszenia.</p>' },
                { question: 'Czy kupować worki z zapasem?', answer: '<p>Tak — zakup kilku zapasowych worków to standardowa praktyka.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.pl },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.pl },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.pl },
            ],
        },
        es: {
            slug: 'calculadora-de-bolsas-de-concreto', title: 'Calculadora de Bolsas de Concreto', h1: 'Calculadora de Bolsas de Concreto',
            meta_title: 'Calculadora de Bolsas de Concreto | Cantidad de Bolsas de 40, 60 y 80 lb',
            meta_description: 'Encuentra cuántas bolsas de concreto de 40, 60 u 80 lb necesitas para un volumen dado.',
            short_answer: 'Esta calculadora encuentra cuántas bolsas de concreto necesitas para un volumen conocido, p. ej. 10 pies cúbicos necesitan 17 bolsas de mezcla de 80 lb.',
            intro_text: '<p>Si ya sabes el volumen de concreto que necesitas (en pies cúbicos), esta herramienta te dice cuántas bolsas comprar para cada tamaño común.</p>',
            key_points: [
                '<b>Rendimientos estándar:</b> una bolsa de 40 lb rinde unos 0.30 pies cúbicos, una de 60 lb unos 0.45, y una de 80 lb unos 0.60.',
                '<b>Ejemplo:</b> para 10 pies cúbicos, necesitarías 34 bolsas de 40 lb, 23 de 60 lb, o 17 de 80 lb.',
                '<b>¿No sabes tu volumen?</b> Usa primero la Calculadora de Concreto en este sitio.',
            ],
            howto: [
                { question: '¿Qué tamaño de bolsa debería elegir?', answer: '<p>Las bolsas más grandes (80 lb) suelen ser más económicas por pie cúbico pero más pesadas de cargar.</p>' },
                { question: '¿Debería comprar bolsas extra?', answer: '<p>Sí — comprar algunas bolsas extra es práctica estándar para cubrir derrames y pérdidas de mezcla.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.es },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.es },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.es },
            ],
        },
        fr: {
            slug: 'calculateur-de-sacs-de-beton', title: 'Calculateur de Sacs de Béton', h1: 'Calculateur de Sacs de Béton',
            meta_title: 'Calculateur de Sacs de Béton | Nombre de Sacs de 40, 60 et 80 lb',
            meta_description: 'Trouvez combien de sacs de béton de 40, 60 ou 80 lb vous avez besoin pour un volume donné.',
            short_answer: 'Ce calculateur trouve combien de sacs de béton il vous faut pour un volume connu, ex. 10 pieds cubes nécessitent 17 sacs de mélange de 80 lb.',
            intro_text: '<p>Si vous connaissez déjà le volume de béton nécessaire (en pieds cubes), cet outil vous indique combien de sacs acheter pour chaque taille courante.</p>',
            key_points: [
                '<b>Rendements standards :</b> un sac de 40 lb donne environ 0,30 pied cube, un de 60 lb environ 0,45, et un de 80 lb environ 0,60.',
                '<b>Exemple :</b> pour 10 pieds cubes, il vous faudrait 34 sacs de 40 lb, 23 de 60 lb, ou 17 de 80 lb.',
                '<b>Vous ne connaissez pas votre volume ?</b> Utilisez d\'abord le Calculateur de Béton sur ce site.',
            ],
            howto: [
                { question: 'Quelle taille de sac choisir ?', answer: '<p>Les sacs plus grands (80 lb) sont généralement plus économiques par pied cube mais plus lourds à porter.</p>' },
                { question: 'Devrais-je acheter des sacs supplémentaires ?', answer: '<p>Oui — acheter quelques sacs supplémentaires est une pratique standard.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.fr },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.fr },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.fr },
            ],
        },
        it: {
            slug: 'calcolatore-di-sacchi-di-calcestruzzo', title: 'Calcolatore di Sacchi di Calcestruzzo', h1: 'Calcolatore di Sacchi di Calcestruzzo',
            meta_title: 'Calcolatore Sacchi Calcestruzzo | Numero di Sacchi da 40, 60 e 80 lb',
            meta_description: 'Trova quanti sacchi di calcestruzzo da 40, 60 o 80 lb ti servono per un dato volume.',
            short_answer: 'Questo calcolatore trova quanti sacchi di calcestruzzo servono per un volume noto, es. 10 piedi cubici richiedono 17 sacchi di miscela da 80 lb.',
            intro_text: '<p>Se conosci già il volume di calcestruzzo necessario (in piedi cubici), questo strumento ti dice quanti sacchi comprare per ogni formato comune.</p>',
            key_points: [
                '<b>Rese standard:</b> un sacco da 40 lb rende circa 0,30 piedi cubici, uno da 60 lb circa 0,45, e uno da 80 lb circa 0,60.',
                '<b>Esempio:</b> per 10 piedi cubici, servirebbero 34 sacchi da 40 lb, 23 da 60 lb, o 17 da 80 lb.',
                '<b>Non conosci il volume?</b> Usa prima il Calcolatore di Calcestruzzo su questo sito.',
            ],
            howto: [
                { question: 'Quale formato di sacco dovrei scegliere?', answer: '<p>I sacchi più grandi (80 lb) sono di solito più economici per piede cubico ma più pesanti da trasportare.</p>' },
                { question: 'Dovrei comprare sacchi extra?', answer: '<p>Sì — comprare qualche sacco extra è pratica standard.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.it },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.it },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.it },
            ],
        },
        de: {
            slug: 'betonsaecke-rechner', title: 'Betonsäcke-Rechner', h1: 'Betonsäcke-Rechner',
            meta_title: 'Betonsäcke-Rechner | Anzahl der Säcke bei 40, 60 und 80 lb',
            meta_description: 'Finden Sie heraus, wie viele 40-lb-, 60-lb- oder 80-lb-Säcke Beton Sie für ein bestimmtes Volumen benötigen.',
            short_answer: 'Dieser Rechner findet, wie viele Betonsäcke Sie für ein bekanntes Volumen benötigen, z.B. 10 Kubikfuß benötigen 17 Säcke à 80 lb Mischung.',
            intro_text: '<p>Wenn Sie bereits das benötigte Betonvolumen kennen (in Kubikfuß), zeigt Ihnen dieses Tool, wie viele Säcke Sie für jede gängige Sackgröße kaufen sollten.</p>',
            key_points: [
                '<b>Standardausbeuten:</b> ein 40-lb-Sack ergibt etwa 0,30 Kubikfuß, ein 60-lb-Sack etwa 0,45, und ein 80-lb-Sack etwa 0,60.',
                '<b>Beispiel:</b> für 10 Kubikfuß bräuchten Sie 34 Säcke à 40 lb, 23 Säcke à 60 lb, oder 17 Säcke à 80 lb.',
                '<b>Kennen Sie Ihr Volumen noch nicht?</b> Verwenden Sie zuerst den Beton-Rechner auf dieser Website.',
            ],
            howto: [
                { question: 'Welche Sackgröße sollte ich wählen?', answer: '<p>Größere Säcke (80 lb) sind meist wirtschaftlicher pro Kubikfuß, aber schwerer zu tragen.</p>' },
                { question: 'Sollte ich zusätzliche Säcke kaufen?', answer: '<p>Ja — der Kauf einiger zusätzlicher Säcke ist gängige Praxis.</p>' },
            ],
            inputs: [{ name: 'volume_cuft', label: VOLUME_CUFT_INPUT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '10' }],
            outputs: [
                { name: 'bags_40lb', label: BAGS_40LB_LABEL.de },
                { name: 'bags_60lb', label: BAGS_60LB_LABEL.de },
                { name: 'bags_80lb', label: BAGS_80LB2_LABEL.de },
            ],
        },
    },
}

const DEPTH_FT_LABEL: Record<string, string> = { en: 'Depth (feet)', ru: 'Глубина (футы)', de: 'Tiefe (Fuß)', es: 'Profundidad (pies)', fr: 'Profondeur (pieds)', it: 'Profondità (piedi)', pl: 'Głębokość (stopy)', lv: 'Dziļums (pēdas)' }

// ============================================================
// 1171: Cubic Yards Calculator (general bulk material)
// ============================================================
const cubicYardsCalculatorTool: ToolDef = {
    id: '1171',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 10 }, { key: 'width', default: 10 }, { key: 'depth', default: 1 }],
        functions: { result: { type: 'function', functionName: 'cubicYardsCalculator', params: { length: 'length', width: 'width', depth: 'depth' } } },
        outputs: [{ key: 'result', precision: 3 }],
    },
    locales: {
        en: {
            slug: 'cubic-yards-calculator', title: 'Cubic Yards Calculator', h1: 'Cubic Yards Calculator',
            meta_title: 'Cubic Yards Calculator | General Bulk Material Volume',
            meta_description: 'Calculate cubic yards for any bulk material (dirt, gravel, mulch, sand, concrete) from length, width, and depth in feet.',
            short_answer: 'This calculator finds the cubic yards for any area, e.g. 10×10 ft at 1 ft deep = 3.70 cubic yards.',
            intro_text: '<p>Enter length, width, and depth in feet to find the volume in cubic yards — the standard unit most bulk materials (dirt, gravel, mulch, sand, concrete) are bought and delivered in.</p>',
            key_points: [
                '<b>Formula:</b> Cubic Yards = (Length × Width × Depth) ÷ 27.',
                '<b>Example:</b> a 10×10 ft area at 1 ft deep = 100 cubic feet ÷ 27 = 3.70 cubic yards.',
                '<b>General purpose:</b> unlike the material-specific calculators on this site, this tool gives the raw geometric volume without applying any material density — useful when you just need the cubic yardage figure itself.',
            ],
            howto: [
                { question: 'My depth is in inches, not feet — what do I do?', answer: '<p>Divide the inches by 12 first to convert to feet (e.g. 4 inches = 0.33 ft), or use one of the material-specific calculators on this site, which accept depth directly in inches.</p>' },
                { question: 'Why do suppliers sell by the cubic yard?', answer: '<p>It\'s the standard bulk delivery unit in the US for materials like soil, gravel, and mulch — a dump truck load is typically quoted and billed in cubic yards.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.en, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.en, precision: 3 }],
        },
        ru: {
            slug: 'kalkulyator-kubicheskih-yardov', title: 'Калькулятор кубических ярдов', h1: 'Калькулятор кубических ярдов',
            meta_title: 'Калькулятор кубических ярдов | Объём сыпучих материалов',
            meta_description: 'Рассчитайте кубические ярды для любого сыпучего материала (грунт, гравий, мульча, песок, бетон) по длине, ширине и глубине в футах.',
            short_answer: 'Этот калькулятор находит кубические ярды для любой площади, например 10×10 футов при глубине 1 фут = 3,70 кубического ярда.',
            intro_text: '<p>Введите длину, ширину и глубину в футах, чтобы найти объём в кубических ярдах — стандартную единицу, в которой продаются и доставляются большинство сыпучих материалов.</p>',
            key_points: [
                '<b>Формула:</b> Кубические ярды = (Длина × Ширина × Глубина) ÷ 27.',
                '<b>Пример:</b> площадь 10×10 футов глубиной 1 фут = 100 куб. футов ÷ 27 = 3,70 куб. ярда.',
                '<b>Универсальность:</b> в отличие от специализированных калькуляторов на этом сайте, этот инструмент даёт чистый геометрический объём без применения плотности материала.',
            ],
            howto: [
                { question: 'Моя глубина в дюймах, а не футах — что делать?', answer: '<p>Сначала разделите дюймы на 12, чтобы перевести в футы, или используйте специализированный калькулятор материала на этом сайте.</p>' },
                { question: 'Почему поставщики продают кубическими ярдами?', answer: '<p>Это стандартная единица оптовой доставки в США для материалов вроде грунта, гравия и мульчи.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.ru, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.ru, precision: 3 }],
        },
        lv: {
            slug: 'kubikjardu-kalkulators', title: 'Kubikjardu Kalkulators', h1: 'Kubikjardu Kalkulators',
            meta_title: 'Kubikjardu Kalkulators | Beramo Materiālu Tilpums',
            meta_description: 'Aprēķiniet kubikjardas jebkuram beramajam materiālam (zeme, grants, mulča, smiltis, betons) no garuma, platuma un dziļuma pēdās.',
            short_answer: 'Šis kalkulators atrod kubikjardas jebkurai platībai, piemēram, 10×10 pēdas ar 1 pēdas dziļumu = 3,70 kubikjardas.',
            intro_text: '<p>Ievadiet garumu, platumu un dziļumu pēdās, lai atrastu tilpumu kubikjardās — standarta vienību, kurā tiek pirkti un piegādāti lielākā daļa beramo materiālu.</p>',
            key_points: [
                '<b>Formula:</b> Kubikjardas = (Garums × Platums × Dziļums) ÷ 27.',
                '<b>Piemērs:</b> 10×10 pēdu platība ar 1 pēdas dziļumu = 100 kubikpēdas ÷ 27 = 3,70 kubikjardas.',
                '<b>Vispārējs pielietojums:</b> atšķirībā no materiālu specifiskajiem kalkulatoriem šajā vietnē, šis rīks dod tīro ģeometrisko tilpumu bez materiāla blīvuma pielietošanas.',
            ],
            howto: [
                { question: 'Mans dziļums ir collās, ne pēdās — ko darīt?', answer: '<p>Vispirms sadaliet collas ar 12, lai pārvērstu pēdās, vai izmantojiet materiāla specifisko kalkulatoru šajā vietnē.</p>' },
                { question: 'Kāpēc piegādātāji pārdod pa kubikjardām?', answer: '<p>Tā ir standarta lielapjoma piegādes vienība ASV materiāliem, piemēram, augsnei, grantij un mulčai.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.lv, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.lv, precision: 3 }],
        },
        pl: {
            slug: 'kalkulator-jardow-szesciennych', title: 'Kalkulator Jardów Sześciennych', h1: 'Kalkulator Jardów Sześciennych',
            meta_title: 'Kalkulator Jardów Sześciennych | Objętość Materiałów Sypkich',
            meta_description: 'Oblicz jardy sześcienne dla dowolnego materiału sypkiego (ziemia, żwir, ściółka, piasek, beton) na podstawie długości, szerokości i głębokości w stopach.',
            short_answer: 'Ten kalkulator znajduje jardy sześcienne dla dowolnego obszaru, np. 10×10 stóp przy głębokości 1 stopy = 3,70 jarda sześciennego.',
            intro_text: '<p>Wpisz długość, szerokość i głębokość w stopach, aby znaleźć objętość w jardach sześciennych — standardowej jednostce, w której kupuje się i dostarcza większość materiałów sypkich.</p>',
            key_points: [
                '<b>Wzór:</b> Jardy Sześcienne = (Długość × Szerokość × Głębokość) ÷ 27.',
                '<b>Przykład:</b> obszar 10×10 stóp przy głębokości 1 stopy = 100 stóp sześciennych ÷ 27 = 3,70 jarda sześciennego.',
                '<b>Ogólne zastosowanie:</b> w przeciwieństwie do kalkulatorów specyficznych dla materiału na tej stronie, to narzędzie daje surową objętość geometryczną bez stosowania gęstości materiału.',
            ],
            howto: [
                { question: 'Moja głębokość jest w calach, nie stopach — co robić?', answer: '<p>Najpierw podziel cale przez 12, aby przeliczyć na stopy, lub użyj kalkulatora specyficznego dla materiału na tej stronie.</p>' },
                { question: 'Dlaczego dostawcy sprzedają na jardy sześcienne?', answer: '<p>To standardowa jednostka dostawy hurtowej w USA dla materiałów takich jak gleba, żwir i ściółka.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.pl, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.pl, precision: 3 }],
        },
        es: {
            slug: 'calculadora-de-yardas-cubicas', title: 'Calculadora de Yardas Cúbicas', h1: 'Calculadora de Yardas Cúbicas',
            meta_title: 'Calculadora de Yardas Cúbicas | Volumen de Materiales a Granel',
            meta_description: 'Calcula yardas cúbicas para cualquier material a granel (tierra, grava, mantillo, arena, concreto) a partir de largo, ancho y profundidad en pies.',
            short_answer: 'Esta calculadora encuentra las yardas cúbicas para cualquier área, p. ej. 10×10 pies a 1 pie de profundidad = 3.70 yardas cúbicas.',
            intro_text: '<p>Introduce largo, ancho y profundidad en pies para encontrar el volumen en yardas cúbicas — la unidad estándar en que se compran y entregan la mayoría de materiales a granel.</p>',
            key_points: [
                '<b>Fórmula:</b> Yardas Cúbicas = (Largo × Ancho × Profundidad) ÷ 27.',
                '<b>Ejemplo:</b> un área de 10×10 pies a 1 pie de profundidad = 100 pies cúbicos ÷ 27 = 3.70 yardas cúbicas.',
                '<b>Propósito general:</b> a diferencia de las calculadoras específicas de material en este sitio, esta herramienta da el volumen geométrico bruto sin aplicar densidad de material.',
            ],
            howto: [
                { question: 'Mi profundidad está en pulgadas, no pies — ¿qué hago?', answer: '<p>Primero divide las pulgadas entre 12 para convertir a pies, o usa una de las calculadoras específicas de material en este sitio.</p>' },
                { question: '¿Por qué los proveedores venden por yarda cúbica?', answer: '<p>Es la unidad estándar de entrega a granel en EE. UU. para materiales como tierra, grava y mantillo.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.es, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.es, precision: 3 }],
        },
        fr: {
            slug: 'calculateur-de-verges-cubes', title: 'Calculateur de Verges Cubes', h1: 'Calculateur de Verges Cubes',
            meta_title: 'Calculateur de Verges Cubes | Volume de Matériaux en Vrac',
            meta_description: 'Calculez les verges cubes pour tout matériau en vrac (terre, gravier, paillis, sable, béton) à partir de la longueur, largeur et profondeur en pieds.',
            short_answer: 'Ce calculateur trouve les verges cubes pour toute zone, ex. 10×10 pieds à 1 pied de profondeur = 3,70 verges cubes.',
            intro_text: '<p>Entrez la longueur, largeur et profondeur en pieds pour trouver le volume en verges cubes — l\'unité standard dans laquelle la plupart des matériaux en vrac sont achetés et livrés.</p>',
            key_points: [
                '<b>Formule :</b> Verges Cubes = (Longueur × Largeur × Profondeur) ÷ 27.',
                '<b>Exemple :</b> une zone de 10×10 pieds à 1 pied de profondeur = 100 pieds cubes ÷ 27 = 3,70 verges cubes.',
                '<b>Usage général :</b> contrairement aux calculateurs spécifiques aux matériaux de ce site, cet outil donne le volume géométrique brut sans appliquer de densité de matériau.',
            ],
            howto: [
                { question: 'Ma profondeur est en pouces, pas en pieds — que faire ?', answer: '<p>Divisez d\'abord les pouces par 12 pour convertir en pieds, ou utilisez un des calculateurs spécifiques aux matériaux de ce site.</p>' },
                { question: 'Pourquoi les fournisseurs vendent-ils à la verge cube ?', answer: '<p>C\'est l\'unité standard de livraison en vrac aux États-Unis pour des matériaux comme la terre, le gravier et le paillis.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.fr, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.fr, precision: 3 }],
        },
        it: {
            slug: 'calcolatore-di-iarde-cubiche', title: 'Calcolatore di Iarde Cubiche', h1: 'Calcolatore di Iarde Cubiche',
            meta_title: 'Calcolatore di Iarde Cubiche | Volume di Materiali Sfusi',
            meta_description: 'Calcola le iarde cubiche per qualsiasi materiale sfuso (terra, ghiaia, pacciame, sabbia, calcestruzzo) da lunghezza, larghezza e profondità in piedi.',
            short_answer: 'Questo calcolatore trova le iarde cubiche per qualsiasi area, es. 10×10 piedi a 1 piede di profondità = 3,70 iarde cubiche.',
            intro_text: '<p>Inserisci lunghezza, larghezza e profondità in piedi per trovare il volume in iarde cubiche — l\'unità standard in cui la maggior parte dei materiali sfusi vengono acquistati e consegnati.</p>',
            key_points: [
                '<b>Formula:</b> Iarde Cubiche = (Lunghezza × Larghezza × Profondità) ÷ 27.',
                '<b>Esempio:</b> un\'area 10×10 piedi a 1 piede di profondità = 100 piedi cubici ÷ 27 = 3,70 iarde cubiche.',
                '<b>Uso generale:</b> a differenza dei calcolatori specifici per materiale su questo sito, questo strumento fornisce il volume geometrico grezzo senza applicare la densità del materiale.',
            ],
            howto: [
                { question: 'La mia profondità è in pollici, non piedi — cosa faccio?', answer: '<p>Dividi prima i pollici per 12 per convertire in piedi, oppure usa uno dei calcolatori specifici per materiale su questo sito.</p>' },
                { question: 'Perché i fornitori vendono per iarda cubica?', answer: '<p>È l\'unità standard di consegna sfusa negli USA per materiali come terra, ghiaia e pacciame.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.it, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.it, precision: 3 }],
        },
        de: {
            slug: 'kubikyards-rechner', title: 'Kubikyards-Rechner', h1: 'Kubikyards-Rechner',
            meta_title: 'Kubikyards-Rechner | Volumen für Schüttgut',
            meta_description: 'Berechnen Sie Kubikyards für jedes Schüttgut (Erde, Kies, Mulch, Sand, Beton) aus Länge, Breite und Tiefe in Fuß.',
            short_answer: 'Dieser Rechner findet die Kubikyards für jede Fläche, z.B. 10×10 Fuß bei 1 Fuß Tiefe = 3,70 Kubikyards.',
            intro_text: '<p>Geben Sie Länge, Breite und Tiefe in Fuß ein, um das Volumen in Kubikyards zu finden — die Standardeinheit, in der die meisten Schüttgüter gekauft und geliefert werden.</p>',
            key_points: [
                '<b>Formel:</b> Kubikyards = (Länge × Breite × Tiefe) ÷ 27.',
                '<b>Beispiel:</b> eine Fläche von 10×10 Fuß bei 1 Fuß Tiefe = 100 Kubikfuß ÷ 27 = 3,70 Kubikyards.',
                '<b>Allgemeiner Zweck:</b> im Gegensatz zu den materialspezifischen Rechnern auf dieser Website liefert dieses Tool das rohe geometrische Volumen ohne Anwendung einer Materialdichte.',
            ],
            howto: [
                { question: 'Meine Tiefe ist in Zoll, nicht Fuß — was tun?', answer: '<p>Teilen Sie zuerst die Zoll durch 12, um in Fuß umzurechnen, oder verwenden Sie einen der materialspezifischen Rechner auf dieser Website.</p>' },
                { question: 'Warum verkaufen Lieferanten nach Kubikyard?', answer: '<p>Es ist die Standard-Schüttguteinheit in den USA für Materialien wie Erde, Kies und Mulch.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_FT_LABEL.de, type: 'number', min: 0.01, max: 1000, placeholder: '1' },
            ],
            outputs: [{ name: 'result', label: CUYD_LABEL.de, precision: 3 }],
        },
    },
}

const SQFT_LABEL: Record<string, string> = { en: 'Square Feet', ru: 'Квадратные футы', de: 'Quadratfuß', es: 'Pies Cuadrados', fr: 'Pieds Carrés', it: 'Piedi Quadrati', pl: 'Stopy Kwadratowe', lv: 'Kvadrātpēdas' }
const SQYD_LABEL: Record<string, string> = { en: 'Square Yards', ru: 'Квадратные ярды', de: 'Quadratyards', es: 'Yardas Cuadradas', fr: 'Verges Carrées', it: 'Iarde Quadrate', pl: 'Jardy Kwadratowe', lv: 'Kvadrātjardas' }
const SQM_LABEL: Record<string, string> = { en: 'Square Meters', ru: 'Квадратные метры', de: 'Quadratmeter', es: 'Metros Cuadrados', fr: 'Mètres Carrés', it: 'Metri Quadrati', pl: 'Metry Kwadratowe', lv: 'Kvadrātmetri' }

// ============================================================
// 1172: Square Footage Calculator
// ============================================================
const squareFootageCalculatorTool: ToolDef = {
    id: '1172',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 12 }, { key: 'width', default: 15 }],
        functions: { result: { type: 'function', functionName: 'squareFootageCalculator', params: { length: 'length', width: 'width' } } },
        outputs: [{ key: 'sqft', precision: 2 }, { key: 'sqyd', precision: 2 }, { key: 'sqm', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'square-footage-calculator', title: 'Square Footage Calculator', h1: 'Square Footage Calculator',
            meta_title: 'Square Footage Calculator | Area in Square Feet, Yards, and Meters',
            meta_description: 'Calculate the square footage of a room or space instantly, with results in square feet, square yards, and square meters.',
            short_answer: 'This calculator finds the area of a space, e.g. a 12×15 ft room = 180 square feet (20 square yards).',
            intro_text: '<p>Enter the length and width of a room, yard, or any rectangular space to find its area — shown in square feet, square yards (how flooring and carpet are often priced), and square meters.</p>',
            key_points: [
                '<b>Formula:</b> Area = Length × Width.',
                '<b>Example:</b> a 12×15 ft room = 180 sq ft = 20 sq yd ≈ 16.72 sq m.',
                '<b>For irregular spaces:</b> split the space into separate rectangles, calculate each one\'s area here, then add the results together.',
            ],
            howto: [
                { question: 'Why do flooring stores quote prices per square yard?', answer: '<p>Carpet and some flooring materials are manufactured and sold in rolls, and square yards is the traditional unit for that trade — divide square feet by 9 to convert.</p>' },
                { question: 'How do I handle an L-shaped room?', answer: '<p>Divide it into two rectangles, calculate the square footage of each separately, and add the two results together for the total.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.en, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.en, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-ploshchadi-v-kvadratnyh-futah', title: 'Калькулятор площади в квадратных футах', h1: 'Калькулятор площади в квадратных футах',
            meta_title: 'Калькулятор площади | Площадь в квадратных футах, ярдах и метрах',
            meta_description: 'Рассчитайте площадь комнаты или помещения мгновенно, с результатами в квадратных футах, ярдах и метрах.',
            short_answer: 'Этот калькулятор находит площадь помещения, например комната 12×15 футов = 180 кв. футов (20 кв. ярдов).',
            intro_text: '<p>Введите длину и ширину комнаты, двора или любого прямоугольного пространства, чтобы найти его площадь — в квадратных футах, квадратных ярдах и квадратных метрах.</p>',
            key_points: [
                '<b>Формула:</b> Площадь = Длина × Ширина.',
                '<b>Пример:</b> комната 12×15 футов = 180 кв. футов = 20 кв. ярдов ≈ 16,72 кв. м.',
                '<b>Для неправильных пространств:</b> разделите пространство на отдельные прямоугольники, рассчитайте площадь каждого здесь, затем сложите результаты.',
            ],
            howto: [
                { question: 'Почему магазины напольных покрытий указывают цену за квадратный ярд?', answer: '<p>Ковры и некоторые напольные покрытия производятся и продаются в рулонах, и квадратный ярд — традиционная единица для этой отрасли.</p>' },
                { question: 'Как посчитать Г-образную комнату?', answer: '<p>Разделите её на два прямоугольника, рассчитайте площадь каждого отдельно и сложите результаты.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.ru, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.ru, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'kvadratpedu-kalkulators', title: 'Kvadrātpēdu Kalkulators', h1: 'Kvadrātpēdu Kalkulators',
            meta_title: 'Kvadrātpēdu Kalkulators | Platība Kvadrātpēdās, Jardās un Metros',
            meta_description: 'Aprēķiniet istabas vai telpas platību acumirklī, ar rezultātiem kvadrātpēdās, kvadrātjardās un kvadrātmetros.',
            short_answer: 'Šis kalkulators atrod telpas platību, piemēram, 12×15 pēdu istaba = 180 kvadrātpēdas (20 kvadrātjardas).',
            intro_text: '<p>Ievadiet istabas, pagalma vai jebkuras taisnstūra telpas garumu un platumu, lai atrastu tās platību — kvadrātpēdās, kvadrātjardās un kvadrātmetros.</p>',
            key_points: [
                '<b>Formula:</b> Platība = Garums × Platums.',
                '<b>Piemērs:</b> 12×15 pēdu istaba = 180 kvadrātpēdas = 20 kvadrātjardas ≈ 16,72 kvadrātmetri.',
                '<b>Neregulārām telpām:</b> sadaliet telpu atsevišķos taisnstūros, aprēķiniet katra platību šeit, tad saskaitiet rezultātus.',
            ],
            howto: [
                { question: 'Kāpēc grīdas segumu veikali norāda cenu par kvadrātjardu?', answer: '<p>Paklāji un daži grīdas materiāli tiek ražoti un pārdoti ruļļos, un kvadrātjarda ir tradicionālā vienība šai nozarei.</p>' },
                { question: 'Kā aprēķināt L-veida istabu?', answer: '<p>Sadaliet to divos taisnstūros, aprēķiniet katra platību atsevišķi un saskaitiet abus rezultātus.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.lv, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.lv, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-powierzchni-w-stopach-kwadratowych', title: 'Kalkulator Powierzchni w Stopach Kwadratowych', h1: 'Kalkulator Powierzchni w Stopach Kwadratowych',
            meta_title: 'Kalkulator Powierzchni | Powierzchnia w Stopach, Jardach i Metrach Kwadratowych',
            meta_description: 'Oblicz powierzchnię pokoju lub przestrzeni natychmiast, z wynikami w stopach, jardach i metrach kwadratowych.',
            short_answer: 'Ten kalkulator znajduje powierzchnię przestrzeni, np. pokój 12×15 stóp = 180 stóp kwadratowych (20 jardów kwadratowych).',
            intro_text: '<p>Wpisz długość i szerokość pokoju, podwórka lub dowolnej prostokątnej przestrzeni, aby znaleźć jej powierzchnię — w stopach kwadratowych, jardach kwadratowych i metrach kwadratowych.</p>',
            key_points: [
                '<b>Wzór:</b> Powierzchnia = Długość × Szerokość.',
                '<b>Przykład:</b> pokój 12×15 stóp = 180 stóp kwadratowych = 20 jardów kwadratowych ≈ 16,72 metra kwadratowego.',
                '<b>Dla nieregularnych przestrzeni:</b> podziel przestrzeń na osobne prostokąty, oblicz powierzchnię każdego tutaj, a następnie zsumuj wyniki.',
            ],
            howto: [
                { question: 'Dlaczego sklepy z podłogami podają ceny za jard kwadratowy?', answer: '<p>Dywany i niektóre materiały podłogowe są produkowane i sprzedawane w rolkach, a jard kwadratowy to tradycyjna jednostka w tej branży.</p>' },
                { question: 'Jak obliczyć pokój w kształcie L?', answer: '<p>Podziel go na dwa prostokąty, oblicz powierzchnię każdego osobno i zsumuj oba wyniki.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.pl, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.pl, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-pies-cuadrados', title: 'Calculadora de Pies Cuadrados', h1: 'Calculadora de Pies Cuadrados',
            meta_title: 'Calculadora de Metraje Cuadrado | Área en Pies, Yardas y Metros Cuadrados',
            meta_description: 'Calcula el metraje cuadrado de una habitación o espacio al instante, con resultados en pies, yardas y metros cuadrados.',
            short_answer: 'Esta calculadora encuentra el área de un espacio, p. ej. una habitación de 12×15 pies = 180 pies cuadrados (20 yardas cuadradas).',
            intro_text: '<p>Introduce el largo y ancho de una habitación, patio o cualquier espacio rectangular para encontrar su área — en pies cuadrados, yardas cuadradas y metros cuadrados.</p>',
            key_points: [
                '<b>Fórmula:</b> Área = Largo × Ancho.',
                '<b>Ejemplo:</b> una habitación de 12×15 pies = 180 pies cuadrados = 20 yardas cuadradas ≈ 16.72 metros cuadrados.',
                '<b>Para espacios irregulares:</b> divide el espacio en rectángulos separados, calcula el área de cada uno aquí, y luego suma los resultados.',
            ],
            howto: [
                { question: '¿Por qué las tiendas de pisos cotizan precios por yarda cuadrada?', answer: '<p>La alfombra y algunos materiales de piso se fabrican y venden en rollos, y la yarda cuadrada es la unidad tradicional para ese comercio.</p>' },
                { question: '¿Cómo manejo una habitación en forma de L?', answer: '<p>Divídela en dos rectángulos, calcula el área de cada uno por separado, y suma los dos resultados.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.es, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.es, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-surface-en-pieds-carres', title: 'Calculateur de Surface en Pieds Carrés', h1: 'Calculateur de Surface en Pieds Carrés',
            meta_title: 'Calculateur de Surface | Surface en Pieds, Verges et Mètres Carrés',
            meta_description: 'Calculez la surface d\'une pièce ou d\'un espace instantanément, avec des résultats en pieds, verges et mètres carrés.',
            short_answer: 'Ce calculateur trouve la surface d\'un espace, ex. une pièce de 12×15 pieds = 180 pieds carrés (20 verges carrées).',
            intro_text: '<p>Entrez la longueur et la largeur d\'une pièce, d\'un jardin ou de tout espace rectangulaire pour trouver sa surface — en pieds carrés, verges carrées et mètres carrés.</p>',
            key_points: [
                '<b>Formule :</b> Surface = Longueur × Largeur.',
                '<b>Exemple :</b> une pièce de 12×15 pieds = 180 pieds carrés = 20 verges carrées ≈ 16,72 mètres carrés.',
                '<b>Pour les espaces irréguliers :</b> divisez l\'espace en rectangles séparés, calculez la surface de chacun ici, puis additionnez les résultats.',
            ],
            howto: [
                { question: 'Pourquoi les magasins de revêtements de sol indiquent-ils les prix par verge carrée ?', answer: '<p>La moquette et certains matériaux de sol sont fabriqués et vendus en rouleaux, et la verge carrée est l\'unité traditionnelle pour ce commerce.</p>' },
                { question: 'Comment gérer une pièce en forme de L ?', answer: '<p>Divisez-la en deux rectangles, calculez la surface de chacun séparément, et additionnez les deux résultats.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.fr, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.fr, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-metratura-quadrata', title: 'Calcolatore di Metratura Quadrata', h1: 'Calcolatore di Metratura Quadrata',
            meta_title: 'Calcolatore di Metratura | Area in Piedi, Iarde e Metri Quadrati',
            meta_description: 'Calcola la metratura quadrata di una stanza o spazio istantaneamente, con risultati in piedi, iarde e metri quadrati.',
            short_answer: 'Questo calcolatore trova l\'area di uno spazio, es. una stanza 12×15 piedi = 180 piedi quadrati (20 iarde quadrate).',
            intro_text: '<p>Inserisci la lunghezza e larghezza di una stanza, giardino o qualsiasi spazio rettangolare per trovare la sua area — in piedi quadrati, iarde quadrate e metri quadrati.</p>',
            key_points: [
                '<b>Formula:</b> Area = Lunghezza × Larghezza.',
                '<b>Esempio:</b> una stanza 12×15 piedi = 180 piedi quadrati = 20 iarde quadrate ≈ 16,72 metri quadrati.',
                '<b>Per spazi irregolari:</b> dividi lo spazio in rettangoli separati, calcola l\'area di ciascuno qui, poi somma i risultati.',
            ],
            howto: [
                { question: 'Perché i negozi di pavimenti indicano i prezzi per iarda quadrata?', answer: '<p>La moquette e alcuni materiali per pavimenti vengono prodotti e venduti in rotoli, e l\'iarda quadrata è l\'unità tradizionale per questo commercio.</p>' },
                { question: 'Come gestisco una stanza a forma di L?', answer: '<p>Dividila in due rettangoli, calcola l\'area di ciascuno separatamente, e somma i due risultati.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.it, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.it, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'quadratfuss-rechner', title: 'Quadratfuß-Rechner', h1: 'Quadratfuß-Rechner',
            meta_title: 'Flächenrechner | Fläche in Quadratfuß, Quadratyards und Quadratmetern',
            meta_description: 'Berechnen Sie die Quadratfuß eines Raums oder einer Fläche sofort, mit Ergebnissen in Quadratfuß, Quadratyards und Quadratmetern.',
            short_answer: 'Dieser Rechner findet die Fläche eines Raums, z.B. ein 12×15 Fuß Raum = 180 Quadratfuß (20 Quadratyards).',
            intro_text: '<p>Geben Sie Länge und Breite eines Raums, Gartens oder einer beliebigen rechteckigen Fläche ein, um deren Fläche zu finden — in Quadratfuß, Quadratyards und Quadratmetern.</p>',
            key_points: [
                '<b>Formel:</b> Fläche = Länge × Breite.',
                '<b>Beispiel:</b> ein 12×15 Fuß Raum = 180 Quadratfuß = 20 Quadratyards ≈ 16,72 Quadratmeter.',
                '<b>Für unregelmäßige Flächen:</b> teilen Sie die Fläche in separate Rechtecke auf, berechnen Sie jede Fläche hier, und addieren Sie die Ergebnisse.',
            ],
            howto: [
                { question: 'Warum geben Bodenbelagsgeschäfte Preise pro Quadratyard an?', answer: '<p>Teppich und einige Bodenbelagsmaterialien werden in Rollen hergestellt und verkauft, und Quadratyard ist die traditionelle Einheit für diesen Handel.</p>' },
                { question: 'Wie gehe ich mit einem L-förmigen Raum um?', answer: '<p>Teilen Sie ihn in zwei Rechtecke auf, berechnen Sie die Fläche jedes einzeln, und addieren Sie die beiden Ergebnisse.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '12' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
            ],
            outputs: [
                { name: 'sqft', label: SQFT_LABEL.de, precision: 2 },
                { name: 'sqyd', label: SQYD_LABEL.de, precision: 2 },
                { name: 'sqm', label: SQM_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1173: Gravel Calculator
// ============================================================
const gravelCalculatorTool: ToolDef = {
    id: '1173',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 20 }, { key: 'width', default: 10 }, { key: 'depth', default: 4 }],
        functions: { result: { type: 'function', functionName: 'gravelCalculator', params: { length: 'length', width: 'width', depth: 'depth' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'gravel-calculator', title: 'Gravel Calculator', h1: 'Gravel Calculator',
            meta_title: 'Gravel Calculator | Cubic Yards and Tons for Driveways and Paths',
            meta_description: 'Calculate how much gravel you need for a driveway, path, or base in cubic yards and tons.',
            short_answer: 'This calculator finds how much gravel you need, e.g. a 20×10 ft area at 4 inches deep = 2.47 cubic yards, about 3.46 tons.',
            intro_text: '<p>Enter the length, width, and depth of the area you\'re covering to find how much gravel to order — shown in both cubic yards (how it\'s typically ordered) and tons (how it\'s often priced by suppliers).</p>',
            key_points: [
                '<b>Formula:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.4.',
                '<b>Example:</b> a 20×10 ft driveway at 4 inches deep = 2.47 cubic yards ≈ 3.46 tons.',
                '<b>Density assumption:</b> this uses ~1.4 tons per cubic yard, a standard estimate for compacted gravel — actual weight varies by gravel type and moisture content, so treat this as an estimate and confirm with your supplier for large orders.',
            ],
            howto: [
                { question: 'How deep should a gravel driveway be?', answer: '<p>A common range is 4-6 inches for a base layer, sometimes with additional layers for heavier vehicle traffic — check local guidance for your specific use case.</p>' },
                { question: 'Should I order extra gravel?', answer: '<p>Yes — adding 5-10% extra is common practice to account for compaction settling and uneven ground.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.en, precision: 2 }, { name: 'tons', label: TONS_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-shcheben', title: 'Калькулятор щебня', h1: 'Калькулятор щебня',
            meta_title: 'Калькулятор щебня | Кубические ярды и тонны для подъездных дорог',
            meta_description: 'Рассчитайте, сколько щебня нужно для подъездной дороги, дорожки или основания, в кубических ярдах и тоннах.',
            short_answer: 'Этот калькулятор находит, сколько щебня нужно, например площадь 20×10 футов при глубине 4 дюйма = 2,47 куб. ярда, около 3,46 тонны.',
            intro_text: '<p>Введите длину, ширину и глубину покрываемой области, чтобы узнать, сколько щебня заказать — в кубических ярдах и тоннах.</p>',
            key_points: [
                '<b>Формула:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,4.',
                '<b>Пример:</b> подъездная дорога 20×10 футов глубиной 4 дюйма = 2,47 куб. ярда ≈ 3,46 тонны.',
                '<b>Допущение о плотности:</b> используется ~1,4 тонны на куб. ярд, стандартная оценка для утрамбованного щебня — фактический вес зависит от типа щебня и влажности.',
            ],
            howto: [
                { question: 'Какой глубины должна быть гравийная подъездная дорога?', answer: '<p>Обычный диапазон — 4-6 дюймов для базового слоя, иногда с дополнительными слоями для более тяжёлого движения.</p>' },
                { question: 'Стоит ли заказывать щебень с запасом?', answer: '<p>Да — добавление 5-10% сверху является обычной практикой для учёта усадки при трамбовке.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.ru, precision: 2 }, { name: 'tons', label: TONS_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'skerbla-kalkulators', title: 'Šķembu Kalkulators', h1: 'Šķembu Kalkulators',
            meta_title: 'Šķembu Kalkulators | Kubikjardas un Tonnas Piebraucamajiem Ceļiem',
            meta_description: 'Aprēķiniet, cik šķembu nepieciešams piebraucamajam ceļam, celiņam vai pamatnei, kubikjardās un tonnās.',
            short_answer: 'Šis kalkulators atrod, cik šķembu nepieciešams, piemēram, 20×10 pēdu platība ar 4 collu dziļumu = 2,47 kubikjardas, apmēram 3,46 tonnas.',
            intro_text: '<p>Ievadiet segtās teritorijas garumu, platumu un dziļumu, lai uzzinātu, cik šķembu pasūtīt — kubikjardās un tonnās.</p>',
            key_points: [
                '<b>Formula:</b> Kubikjardas = (Garums × Platums × Dziļums collās ÷ 12) ÷ 27; Tonnas = Kubikjardas × 1,4.',
                '<b>Piemērs:</b> 20×10 pēdu piebraucamais ceļš ar 4 collu dziļumu = 2,47 kubikjardas ≈ 3,46 tonnas.',
                '<b>Blīvuma pieņēmums:</b> tiek izmantotas ~1,4 tonnas uz kubikjardu, standarta novērtējums sablīvētām šķembām.',
            ],
            howto: [
                { question: 'Cik dziļam jābūt šķembu piebraucamajam ceļam?', answer: '<p>Bieži izmantotais diapazons ir 4-6 collas pamatslānim, dažreiz ar papildu slāņiem smagākai satiksmei.</p>' },
                { question: 'Vai jāpasūta šķembas ar rezervi?', answer: '<p>Jā — 5-10% papildu ir izplatīta prakse, lai ņemtu vērā sablīvēšanās sēšanos.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.lv, precision: 2 }, { name: 'tons', label: TONS_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-zwiru', title: 'Kalkulator Żwiru', h1: 'Kalkulator Żwiru',
            meta_title: 'Kalkulator Żwiru | Jardy Sześcienne i Tony dla Podjazdów',
            meta_description: 'Oblicz, ile żwiru potrzebujesz na podjazd, ścieżkę lub podbudowę, w jardach sześciennych i tonach.',
            short_answer: 'Ten kalkulator znajduje, ile żwiru potrzebujesz, np. obszar 20×10 stóp przy głębokości 4 cali = 2,47 jarda sześciennego, około 3,46 tony.',
            intro_text: '<p>Wpisz długość, szerokość i głębokość pokrywanego obszaru, aby dowiedzieć się, ile żwiru zamówić — w jardach sześciennych i tonach.</p>',
            key_points: [
                '<b>Wzór:</b> Jardy Sześcienne = (Długość × Szerokość × Głębokość w calach ÷ 12) ÷ 27; Tony = Jardy Sześcienne × 1,4.',
                '<b>Przykład:</b> podjazd 20×10 stóp o głębokości 4 cali = 2,47 jarda sześciennego ≈ 3,46 tony.',
                '<b>Założenie gęstości:</b> używa się ~1,4 tony na jard sześcienny, standardowego oszacowania dla zagęszczonego żwiru.',
            ],
            howto: [
                { question: 'Jak głęboki powinien być żwirowy podjazd?', answer: '<p>Typowy zakres to 4-6 cali dla warstwy podstawowej, czasem z dodatkowymi warstwami dla cięższego ruchu.</p>' },
                { question: 'Czy zamawiać żwir z zapasem?', answer: '<p>Tak — dodanie 5-10% jest powszechną praktyką, aby uwzględnić osiadanie po zagęszczeniu.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.pl, precision: 2 }, { name: 'tons', label: TONS_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-grava', title: 'Calculadora de Grava', h1: 'Calculadora de Grava',
            meta_title: 'Calculadora de Grava | Yardas Cúbicas y Toneladas para Entradas',
            meta_description: 'Calcula cuánta grava necesitas para una entrada, camino o base en yardas cúbicas y toneladas.',
            short_answer: 'Esta calculadora encuentra cuánta grava necesitas, p. ej. un área de 20×10 pies a 4 pulgadas de profundidad = 2.47 yardas cúbicas, unas 3.46 toneladas.',
            intro_text: '<p>Introduce el largo, ancho y profundidad del área que estás cubriendo para saber cuánta grava pedir — en yardas cúbicas y toneladas.</p>',
            key_points: [
                '<b>Fórmula:</b> Yardas Cúbicas = (Largo × Ancho × Profundidad en pulgadas ÷ 12) ÷ 27; Toneladas = Yardas Cúbicas × 1.4.',
                '<b>Ejemplo:</b> una entrada de 20×10 pies a 4 pulgadas de profundidad = 2.47 yardas cúbicas ≈ 3.46 toneladas.',
                '<b>Suposición de densidad:</b> usa ~1.4 toneladas por yarda cúbica, una estimación estándar para grava compactada.',
            ],
            howto: [
                { question: '¿Qué tan profunda debe ser una entrada de grava?', answer: '<p>Un rango común es 4-6 pulgadas para una capa base, a veces con capas adicionales para tráfico vehicular más pesado.</p>' },
                { question: '¿Debería pedir grava extra?', answer: '<p>Sí — añadir 5-10% extra es práctica común para tener en cuenta el asentamiento por compactación.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.es, precision: 2 }, { name: 'tons', label: TONS_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-gravier', title: 'Calculateur de Gravier', h1: 'Calculateur de Gravier',
            meta_title: 'Calculateur de Gravier | Verges Cubes et Tonnes pour Allées',
            meta_description: 'Calculez combien de gravier vous avez besoin pour une allée, un chemin ou une base en verges cubes et tonnes.',
            short_answer: 'Ce calculateur trouve combien de gravier vous avez besoin, ex. une zone de 20×10 pieds à 4 pouces de profondeur = 2,47 verges cubes, environ 3,46 tonnes.',
            intro_text: '<p>Entrez la longueur, largeur et profondeur de la zone que vous couvrez pour savoir combien de gravier commander — en verges cubes et tonnes.</p>',
            key_points: [
                '<b>Formule :</b> Verges Cubes = (Longueur × Largeur × Profondeur en pouces ÷ 12) ÷ 27 ; Tonnes = Verges Cubes × 1,4.',
                '<b>Exemple :</b> une allée de 20×10 pieds à 4 pouces de profondeur = 2,47 verges cubes ≈ 3,46 tonnes.',
                '<b>Hypothèse de densité :</b> utilise ~1,4 tonne par verge cube, une estimation standard pour le gravier compacté.',
            ],
            howto: [
                { question: 'Quelle profondeur doit avoir une allée de gravier ?', answer: '<p>Une plage courante est de 4-6 pouces pour une couche de base, parfois avec des couches supplémentaires pour un trafic plus lourd.</p>' },
                { question: 'Devrais-je commander du gravier supplémentaire ?', answer: '<p>Oui — ajouter 5-10% supplémentaire est une pratique courante pour tenir compte du tassement par compactage.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.fr, precision: 2 }, { name: 'tons', label: TONS_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-ghiaia', title: 'Calcolatore di Ghiaia', h1: 'Calcolatore di Ghiaia',
            meta_title: 'Calcolatore di Ghiaia | Iarde Cubiche e Tonnellate per Vialetti',
            meta_description: 'Calcola quanta ghiaia ti serve per un vialetto, sentiero o base in iarde cubiche e tonnellate.',
            short_answer: 'Questo calcolatore trova quanta ghiaia ti serve, es. un\'area 20×10 piedi a 4 pollici di profondità = 2,47 iarde cubiche, circa 3,46 tonnellate.',
            intro_text: '<p>Inserisci lunghezza, larghezza e profondità dell\'area che stai coprendo per sapere quanta ghiaia ordinare — in iarde cubiche e tonnellate.</p>',
            key_points: [
                '<b>Formula:</b> Iarde Cubiche = (Lunghezza × Larghezza × Profondità in pollici ÷ 12) ÷ 27; Tonnellate = Iarde Cubiche × 1,4.',
                '<b>Esempio:</b> un vialetto 20×10 piedi a 4 pollici di profondità = 2,47 iarde cubiche ≈ 3,46 tonnellate.',
                '<b>Ipotesi di densità:</b> usa ~1,4 tonnellate per iarda cubica, una stima standard per ghiaia compattata.',
            ],
            howto: [
                { question: 'Quanto dovrebbe essere profondo un vialetto di ghiaia?', answer: '<p>Un intervallo comune è 4-6 pollici per uno strato di base, a volte con strati aggiuntivi per traffico veicolare più pesante.</p>' },
                { question: 'Dovrei ordinare ghiaia extra?', answer: '<p>Sì — aggiungere il 5-10% extra è pratica comune per tenere conto dell\'assestamento da compattazione.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.it, precision: 2 }, { name: 'tons', label: TONS_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'kies-rechner', title: 'Kies-Rechner', h1: 'Kies-Rechner',
            meta_title: 'Kies-Rechner | Kubikyards und Tonnen für Einfahrten',
            meta_description: 'Berechnen Sie, wie viel Kies Sie für eine Einfahrt, einen Weg oder eine Basis benötigen, in Kubikyards und Tonnen.',
            short_answer: 'Dieser Rechner findet, wie viel Kies Sie benötigen, z.B. eine Fläche von 20×10 Fuß bei 4 Zoll Tiefe = 2,47 Kubikyards, etwa 3,46 Tonnen.',
            intro_text: '<p>Geben Sie Länge, Breite und Tiefe der zu bedeckenden Fläche ein, um herauszufinden, wie viel Kies Sie bestellen sollten — in Kubikyards und Tonnen.</p>',
            key_points: [
                '<b>Formel:</b> Kubikyards = (Länge × Breite × Tiefe in Zoll ÷ 12) ÷ 27; Tonnen = Kubikyards × 1,4.',
                '<b>Beispiel:</b> eine Einfahrt von 20×10 Fuß bei 4 Zoll Tiefe = 2,47 Kubikyards ≈ 3,46 Tonnen.',
                '<b>Dichteannahme:</b> verwendet ~1,4 Tonnen pro Kubikyard, eine Standardschätzung für verdichteten Kies.',
            ],
            howto: [
                { question: 'Wie tief sollte eine Kieseinfahrt sein?', answer: '<p>Ein üblicher Bereich sind 4-6 Zoll für eine Basisschicht, manchmal mit zusätzlichen Schichten für stärkeren Fahrzeugverkehr.</p>' },
                { question: 'Sollte ich zusätzlichen Kies bestellen?', answer: '<p>Ja — 5-10% zusätzlich hinzuzufügen ist gängige Praxis, um Verdichtungssetzung zu berücksichtigen.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.de, precision: 2 }, { name: 'tons', label: TONS_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1174: Mulch Calculator
// ============================================================
const mulchCalculatorTool: ToolDef = {
    id: '1174',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 20 }, { key: 'width', default: 10 }, { key: 'depth', default: 3 }],
        functions: { result: { type: 'function', functionName: 'mulchCalculator', params: { length: 'length', width: 'width', depth: 'depth' } } },
        outputs: [{ key: 'cuft', precision: 2 }, { key: 'cuyd', precision: 2 }, { key: 'bags', precision: 0 }],
    },
    locales: {
        en: {
            slug: 'mulch-calculator', title: 'Mulch Calculator', h1: 'Mulch Calculator',
            meta_title: 'Mulch Calculator | Cubic Feet, Cubic Yards, and Bags Needed',
            meta_description: 'Calculate how much mulch you need for a garden bed in cubic feet, cubic yards, and standard 2-cubic-foot bags.',
            short_answer: 'This calculator finds how much mulch you need, e.g. a 20×10 ft bed at 3 inches deep = 50 cubic feet, about 25 standard 2-cu-ft bags.',
            intro_text: '<p>Enter the length, width, and depth of your garden bed to find how much mulch to buy — in cubic feet, cubic yards, and standard 2-cubic-foot bags (the most common retail bag size).</p>',
            key_points: [
                '<b>Formula:</b> Cubic Feet = Length × Width × Depth in inches ÷ 12; Bags = Cubic Feet ÷ 2 (rounded up).',
                '<b>Example:</b> a 20×10 ft bed at 3 inches deep = 50 cubic feet ≈ 25 bags (2 cu ft each).',
                '<b>Depth guidance:</b> 2-3 inches is typical for refreshing existing mulch; 3-4 inches for a new bed.',
            ],
            howto: [
                { question: 'How often should I re-mulch?', answer: '<p>Most organic mulches break down over 1-2 years, so an annual or biannual top-up of 1-2 inches is common.</p>' },
                { question: 'Is bagged or bulk mulch cheaper?', answer: '<p>For large areas, bulk (delivered by the cubic yard) is usually cheaper than buying many individual bags.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.en, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.en, precision: 2 },
                { name: 'bags', label: 'Bags Needed (2 cu ft each)', precision: 0 },
            ],
        },
        ru: {
            slug: 'kalkulyator-mulchi', title: 'Калькулятор мульчи', h1: 'Калькулятор мульчи',
            meta_title: 'Калькулятор мульчи | Кубические футы, ярды и мешки',
            meta_description: 'Рассчитайте, сколько мульчи нужно для клумбы, в кубических футах, ярдах и стандартных мешках по 2 куб. фута.',
            short_answer: 'Этот калькулятор находит, сколько мульчи нужно, например клумба 20×10 футов при глубине 3 дюйма = 50 куб. футов, около 25 мешков.',
            intro_text: '<p>Введите длину, ширину и глубину клумбы, чтобы узнать, сколько мульчи купить — в куб. футах, куб. ярдах и стандартных мешках по 2 куб. фута.</p>',
            key_points: [
                '<b>Формула:</b> Куб. футы = Длина × Ширина × Глубина в дюймах ÷ 12; Мешки = Куб. футы ÷ 2 (округление вверх).',
                '<b>Пример:</b> клумба 20×10 футов глубиной 3 дюйма = 50 куб. футов ≈ 25 мешков.',
                '<b>Рекомендация по глубине:</b> 2-3 дюйма типично для обновления существующей мульчи; 3-4 дюйма для новой клумбы.',
            ],
            howto: [
                { question: 'Как часто нужно обновлять мульчу?', answer: '<p>Большинство органических мульч разлагаются за 1-2 года, поэтому обновление на 1-2 дюйма раз в год или два — обычная практика.</p>' },
                { question: 'Что дешевле — мешки или насыпью?', answer: '<p>Для больших площадей насыпная мульча (доставка по кубическим ярдам) обычно дешевле множества отдельных мешков.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.ru, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.ru, precision: 2 },
                { name: 'bags', label: 'Нужно мешков (по 2 куб. фута)', precision: 0 },
            ],
        },
        lv: {
            slug: 'mulcas-kalkulators', title: 'Mulčas Kalkulators', h1: 'Mulčas Kalkulators',
            meta_title: 'Mulčas Kalkulators | Kubikpēdas, Kubikjardas un Maisi',
            meta_description: 'Aprēķiniet, cik mulčas nepieciešams dobei, kubikpēdās, kubikjardās un standarta 2 kubikpēdu maisos.',
            short_answer: 'Šis kalkulators atrod, cik mulčas nepieciešams, piemēram, 20×10 pēdu dobe ar 3 collu dziļumu = 50 kubikpēdas, apmēram 25 maisi.',
            intro_text: '<p>Ievadiet dobes garumu, platumu un dziļumu, lai uzzinātu, cik mulčas pirkt — kubikpēdās, kubikjardās un standarta 2 kubikpēdu maisos.</p>',
            key_points: [
                '<b>Formula:</b> Kubikpēdas = Garums × Platums × Dziļums collās ÷ 12; Maisi = Kubikpēdas ÷ 2 (noapaļo uz augšu).',
                '<b>Piemērs:</b> 20×10 pēdu dobe ar 3 collu dziļumu = 50 kubikpēdas ≈ 25 maisi.',
                '<b>Dziļuma ieteikums:</b> 2-3 collas ir tipiskas esošas mulčas atjaunošanai; 3-4 collas jaunai dobei.',
            ],
            howto: [
                { question: 'Cik bieži jāatjauno mulča?', answer: '<p>Lielākā daļa organisko mulču sadalās 1-2 gadu laikā, tāpēc ikgadēja vai divreiz gadā 1-2 collu papildināšana ir izplatīta.</p>' },
                { question: 'Kas lētāk — maisi vai berama?', answer: '<p>Lielām platībām berama mulča (piegāde pa kubikjardām) parasti ir lētāka nekā daudzi atsevišķi maisi.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.lv, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.lv, precision: 2 },
                { name: 'bags', label: 'Nepieciešami maisi (2 kubikpēdas katrs)', precision: 0 },
            ],
        },
        pl: {
            slug: 'kalkulator-sciolki', title: 'Kalkulator Ściółki', h1: 'Kalkulator Ściółki',
            meta_title: 'Kalkulator Ściółki | Stopy Sześcienne, Jardy Sześcienne i Worki',
            meta_description: 'Oblicz, ile ściółki potrzebujesz na rabatę, w stopach sześciennych, jardach sześciennych i standardowych workach 2 stopy sześcienne.',
            short_answer: 'Ten kalkulator znajduje, ile ściółki potrzebujesz, np. rabata 20×10 stóp przy głębokości 3 cali = 50 stóp sześciennych, około 25 worków.',
            intro_text: '<p>Wpisz długość, szerokość i głębokość rabaty, aby dowiedzieć się, ile ściółki kupić — w stopach sześciennych, jardach sześciennych i standardowych workach 2 stopy sześcienne.</p>',
            key_points: [
                '<b>Wzór:</b> Stopy Sześcienne = Długość × Szerokość × Głębokość w calach ÷ 12; Worki = Stopy Sześcienne ÷ 2 (zaokrąglone w górę).',
                '<b>Przykład:</b> rabata 20×10 stóp o głębokości 3 cali = 50 stóp sześciennych ≈ 25 worków.',
                '<b>Wskazówka głębokości:</b> 2-3 cale to typowa wartość dla odświeżenia istniejącej ściółki; 3-4 cale dla nowej rabaty.',
            ],
            howto: [
                { question: 'Jak często odnawiać ściółkę?', answer: '<p>Większość organicznych ściółek rozkłada się w ciągu 1-2 lat, więc coroczne lub co dwa lata uzupełnienie o 1-2 cale jest powszechne.</p>' },
                { question: 'Co jest tańsze — worki czy luzem?', answer: '<p>Dla dużych powierzchni ściółka luzem (dostarczana w jardach sześciennych) jest zwykle tańsza niż wiele pojedynczych worków.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.pl, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.pl, precision: 2 },
                { name: 'bags', label: 'Potrzebne worki (po 2 stopy sześcienne)', precision: 0 },
            ],
        },
        es: {
            slug: 'calculadora-de-mantillo', title: 'Calculadora de Mantillo', h1: 'Calculadora de Mantillo',
            meta_title: 'Calculadora de Mantillo | Pies Cúbicos, Yardas Cúbicas y Bolsas',
            meta_description: 'Calcula cuánto mantillo necesitas para un macizo de jardín en pies cúbicos, yardas cúbicas y bolsas estándar de 2 pies cúbicos.',
            short_answer: 'Esta calculadora encuentra cuánto mantillo necesitas, p. ej. un macizo de 20×10 pies a 3 pulgadas de profundidad = 50 pies cúbicos, unas 25 bolsas.',
            intro_text: '<p>Introduce el largo, ancho y profundidad de tu macizo para saber cuánto mantillo comprar — en pies cúbicos, yardas cúbicas y bolsas estándar de 2 pies cúbicos.</p>',
            key_points: [
                '<b>Fórmula:</b> Pies Cúbicos = Largo × Ancho × Profundidad en pulgadas ÷ 12; Bolsas = Pies Cúbicos ÷ 2 (redondeado hacia arriba).',
                '<b>Ejemplo:</b> un macizo de 20×10 pies a 3 pulgadas de profundidad = 50 pies cúbicos ≈ 25 bolsas.',
                '<b>Guía de profundidad:</b> 2-3 pulgadas es típico para renovar mantillo existente; 3-4 pulgadas para un macizo nuevo.',
            ],
            howto: [
                { question: '¿Con qué frecuencia debo renovar el mantillo?', answer: '<p>La mayoría de los mantillos orgánicos se descomponen en 1-2 años, así que una renovación anual o bianual de 1-2 pulgadas es común.</p>' },
                { question: '¿Es más barato en bolsas o a granel?', answer: '<p>Para áreas grandes, el mantillo a granel (entregado por yarda cúbica) suele ser más barato que comprar muchas bolsas individuales.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.es, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.es, precision: 2 },
                { name: 'bags', label: 'Bolsas necesarias (2 pies cúbicos cada una)', precision: 0 },
            ],
        },
        fr: {
            slug: 'calculateur-de-paillis', title: 'Calculateur de Paillis', h1: 'Calculateur de Paillis',
            meta_title: 'Calculateur de Paillis | Pieds Cubes, Verges Cubes et Sacs',
            meta_description: 'Calculez combien de paillis vous avez besoin pour un massif en pieds cubes, verges cubes et sacs standard de 2 pieds cubes.',
            short_answer: 'Ce calculateur trouve combien de paillis vous avez besoin, ex. un massif de 20×10 pieds à 3 pouces de profondeur = 50 pieds cubes, environ 25 sacs.',
            intro_text: '<p>Entrez la longueur, largeur et profondeur de votre massif pour savoir combien de paillis acheter — en pieds cubes, verges cubes et sacs standard de 2 pieds cubes.</p>',
            key_points: [
                '<b>Formule :</b> Pieds Cubes = Longueur × Largeur × Profondeur en pouces ÷ 12 ; Sacs = Pieds Cubes ÷ 2 (arrondi au supérieur).',
                '<b>Exemple :</b> un massif de 20×10 pieds à 3 pouces de profondeur = 50 pieds cubes ≈ 25 sacs.',
                '<b>Conseil de profondeur :</b> 2-3 pouces est typique pour rafraîchir un paillis existant ; 3-4 pouces pour un nouveau massif.',
            ],
            howto: [
                { question: 'À quelle fréquence dois-je renouveler le paillis ?', answer: '<p>La plupart des paillis organiques se décomposent en 1-2 ans, donc un ajout annuel ou biannuel de 1-2 pouces est courant.</p>' },
                { question: 'Est-ce moins cher en sacs ou en vrac ?', answer: '<p>Pour de grandes surfaces, le paillis en vrac (livré à la verge cube) est généralement moins cher que d\'acheter de nombreux sacs individuels.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.fr, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.fr, precision: 2 },
                { name: 'bags', label: 'Sacs nécessaires (2 pieds cubes chacun)', precision: 0 },
            ],
        },
        it: {
            slug: 'calcolatore-di-pacciame', title: 'Calcolatore di Pacciame', h1: 'Calcolatore di Pacciame',
            meta_title: 'Calcolatore di Pacciame | Piedi Cubici, Iarde Cubiche e Sacchi',
            meta_description: 'Calcola quanto pacciame ti serve per un\'aiuola in piedi cubici, iarde cubiche e sacchi standard da 2 piedi cubici.',
            short_answer: 'Questo calcolatore trova quanto pacciame ti serve, es. un\'aiuola 20×10 piedi a 3 pollici di profondità = 50 piedi cubici, circa 25 sacchi.',
            intro_text: '<p>Inserisci lunghezza, larghezza e profondità della tua aiuola per sapere quanto pacciame comprare — in piedi cubici, iarde cubiche e sacchi standard da 2 piedi cubici.</p>',
            key_points: [
                '<b>Formula:</b> Piedi Cubici = Lunghezza × Larghezza × Profondità in pollici ÷ 12; Sacchi = Piedi Cubici ÷ 2 (arrotondato per eccesso).',
                '<b>Esempio:</b> un\'aiuola 20×10 piedi a 3 pollici di profondità = 50 piedi cubici ≈ 25 sacchi.',
                '<b>Guida profondità:</b> 2-3 pollici è tipico per rinnovare pacciame esistente; 3-4 pollici per una nuova aiuola.',
            ],
            howto: [
                { question: 'Quanto spesso dovrei rinnovare il pacciame?', answer: '<p>La maggior parte dei pacciami organici si decompone in 1-2 anni, quindi un rinnovo annuale o biennale di 1-2 pollici è comune.</p>' },
                { question: 'Conviene di più a sacchi o sfuso?', answer: '<p>Per grandi aree, il pacciame sfuso (consegnato per iarda cubica) è solitamente più economico di molti sacchi individuali.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.it, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.it, precision: 2 },
                { name: 'bags', label: 'Sacchi necessari (2 piedi cubici ciascuno)', precision: 0 },
            ],
        },
        de: {
            slug: 'mulch-rechner', title: 'Mulch-Rechner', h1: 'Mulch-Rechner',
            meta_title: 'Mulch-Rechner | Kubikfuß, Kubikyards und Säcke',
            meta_description: 'Berechnen Sie, wie viel Mulch Sie für ein Gartenbeet benötigen, in Kubikfuß, Kubikyards und Standardsäcken zu 2 Kubikfuß.',
            short_answer: 'Dieser Rechner findet, wie viel Mulch Sie benötigen, z.B. ein Beet von 20×10 Fuß bei 3 Zoll Tiefe = 50 Kubikfuß, etwa 25 Säcke.',
            intro_text: '<p>Geben Sie Länge, Breite und Tiefe Ihres Gartenbeets ein, um herauszufinden, wie viel Mulch Sie kaufen sollten — in Kubikfuß, Kubikyards und Standardsäcken zu 2 Kubikfuß.</p>',
            key_points: [
                '<b>Formel:</b> Kubikfuß = Länge × Breite × Tiefe in Zoll ÷ 12; Säcke = Kubikfuß ÷ 2 (aufgerundet).',
                '<b>Beispiel:</b> ein Beet von 20×10 Fuß bei 3 Zoll Tiefe = 50 Kubikfuß ≈ 25 Säcke.',
                '<b>Tiefenempfehlung:</b> 2-3 Zoll ist typisch zum Auffrischen von vorhandenem Mulch; 3-4 Zoll für ein neues Beet.',
            ],
            howto: [
                { question: 'Wie oft sollte ich neu mulchen?', answer: '<p>Die meisten organischen Mulcharten zersetzen sich über 1-2 Jahre, daher ist eine jährliche oder zweijährliche Auffrischung von 1-2 Zoll üblich.</p>' },
                { question: 'Ist gesackter oder loser Mulch günstiger?', answer: '<p>Für große Flächen ist loser Mulch (geliefert pro Kubikyard) normalerweise günstiger als viele einzelne Säcke.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '3' },
            ],
            outputs: [
                { name: 'cuft', label: CUFT_LABEL.de, precision: 2 },
                { name: 'cuyd', label: CUYD_LABEL.de, precision: 2 },
                { name: 'bags', label: 'Benötigte Säcke (je 2 Kubikfuß)', precision: 0 },
            ],
        },
    },
}

// ============================================================
// 1175: Tank Capacity Calculator
// ============================================================
const SHAPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
    en: [{ value: 'cylindrical', label: 'Cylindrical' }, { value: 'rectangular', label: 'Rectangular' }],
    ru: [{ value: 'cylindrical', label: 'Цилиндрическая' }, { value: 'rectangular', label: 'Прямоугольная' }],
    lv: [{ value: 'cylindrical', label: 'Cilindriska' }, { value: 'rectangular', label: 'Taisnstūra' }],
    pl: [{ value: 'cylindrical', label: 'Cylindryczny' }, { value: 'rectangular', label: 'Prostokątny' }],
    es: [{ value: 'cylindrical', label: 'Cilíndrico' }, { value: 'rectangular', label: 'Rectangular' }],
    fr: [{ value: 'cylindrical', label: 'Cylindrique' }, { value: 'rectangular', label: 'Rectangulaire' }],
    it: [{ value: 'cylindrical', label: 'Cilindrico' }, { value: 'rectangular', label: 'Rettangolare' }],
    de: [{ value: 'cylindrical', label: 'Zylindrisch' }, { value: 'rectangular', label: 'Rechteckig' }],
}
const SHAPE_LABEL: Record<string, string> = {
    en: 'Tank Shape', ru: 'Форма резервуара', lv: 'Tvertnes Forma', pl: 'Kształt Zbiornika',
    es: 'Forma del Tanque', fr: 'Forme du Réservoir', it: 'Forma del Serbatoio', de: 'Tankform',
}
const DIAMETER_FT_LABEL: Record<string, string> = {
    en: 'Diameter (ft)', ru: 'Диаметр (футы)', lv: 'Diametrs (pēdas)', pl: 'Średnica (stopy)',
    es: 'Diámetro (pies)', fr: 'Diamètre (pieds)', it: 'Diametro (piedi)', de: 'Durchmesser (Fuß)',
}
const HEIGHT_FT_LABEL: Record<string, string> = {
    en: 'Height (ft)', ru: 'Высота (футы)', lv: 'Augstums (pēdas)', pl: 'Wysokość (stopy)',
    es: 'Altura (pies)', fr: 'Hauteur (pieds)', it: 'Altezza (piedi)', de: 'Höhe (Fuß)',
}
const VOLUME_CUFT_LABEL: Record<string, string> = {
    en: 'Volume (cubic feet)', ru: 'Объём (куб. футы)', lv: 'Tilpums (kubikpēdas)', pl: 'Objętość (stopy sześcienne)',
    es: 'Volumen (pies cúbicos)', fr: 'Volume (pieds cubes)', it: 'Volume (piedi cubici)', de: 'Volumen (Kubikfuß)',
}
const GALLONS_LABEL: Record<string, string> = {
    en: 'Volume (US gallons)', ru: 'Объём (галлоны США)', lv: 'Tilpums (ASV galoni)', pl: 'Objętość (galony USA)',
    es: 'Volumen (galones EE. UU.)', fr: 'Volume (gallons US)', it: 'Volume (galloni US)', de: 'Volumen (US-Gallonen)',
}
const LITERS_LABEL: Record<string, string> = {
    en: 'Volume (liters)', ru: 'Объём (литры)', lv: 'Tilpums (litri)', pl: 'Objętość (litry)',
    es: 'Volumen (litros)', fr: 'Volume (litres)', it: 'Volume (litri)', de: 'Volumen (Liter)',
}

const tankCapacityCalculatorTool: ToolDef = {
    id: '1175',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'shape', default: 'cylindrical' }, { key: 'diameter', default: 4 },
            { key: 'length', default: 6 }, { key: 'width', default: 3 }, { key: 'height', default: 5 },
        ],
        functions: { result: { type: 'function', functionName: 'tankCapacityCalculator', params: { shape: 'shape', diameter: 'diameter', length: 'length', width: 'width', height: 'height' } } },
        outputs: [{ key: 'volume_cuft', precision: 2 }, { key: 'gallons', precision: 2 }, { key: 'liters', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'tank-capacity-calculator', title: 'Tank Capacity Calculator', h1: 'Tank Capacity Calculator',
            meta_title: 'Tank Capacity Calculator | Cubic Feet, Gallons, and Liters',
            meta_description: 'Calculate the volume of a cylindrical or rectangular tank in cubic feet, US gallons, and liters.',
            short_answer: 'This calculator finds tank volume, e.g. a cylindrical tank 4 ft diameter × 5 ft tall = 62.83 cubic feet ≈ 470.1 gallons.',
            intro_text: '<p>Select your tank shape and enter its dimensions to find the volume in cubic feet, US gallons, and liters — useful for water tanks, septic tanks, and storage containers.</p>',
            key_points: [
                '<b>Cylindrical formula:</b> Volume = π × (Diameter ÷ 2)² × Height.',
                '<b>Rectangular formula:</b> Volume = Length × Width × Height.',
                '<b>Conversion:</b> 1 cubic foot = 7.48052 US gallons = 28.3168 liters.',
            ],
            howto: [
                { question: 'Does this account for wall thickness?', answer: '<p>No — this calculates the interior volume based on the dimensions you enter; measure interior dimensions for the most accurate result.</p>' },
                { question: 'Can I use this for a septic or water storage tank?', answer: '<p>Yes — enter the tank\'s interior shape and dimensions to estimate its holding capacity.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.en, type: 'select', options: SHAPE_OPTIONS.en },
                { name: 'diameter', label: DIAMETER_FT_LABEL.en, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.en, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.en, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.en, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.en, precision: 2 },
            ],
        },
        ru: {
            slug: 'kalkulyator-obyoma-rezervuara', title: 'Калькулятор объёма резервуара', h1: 'Калькулятор объёма резервуара',
            meta_title: 'Калькулятор объёма резервуара | Куб. футы, галлоны и литры',
            meta_description: 'Рассчитайте объём цилиндрического или прямоугольного резервуара в куб. футах, галлонах США и литрах.',
            short_answer: 'Этот калькулятор находит объём резервуара, например цилиндрический резервуар диаметром 4 фута × 5 футов высотой = 62,83 куб. фута ≈ 470,1 галлона.',
            intro_text: '<p>Выберите форму резервуара и введите его размеры, чтобы узнать объём в куб. футах, галлонах США и литрах.</p>',
            key_points: [
                '<b>Формула для цилиндра:</b> Объём = π × (Диаметр ÷ 2)² × Высота.',
                '<b>Формула для прямоугольника:</b> Объём = Длина × Ширина × Высота.',
                '<b>Пересчёт:</b> 1 куб. фут = 7,48052 галлона США = 28,3168 литра.',
            ],
            howto: [
                { question: 'Учитывается ли толщина стенок?', answer: '<p>Нет — рассчитывается внутренний объём на основе введённых размеров; для точного результата измеряйте внутренние размеры.</p>' },
                { question: 'Можно ли использовать для септика или ёмкости для воды?', answer: '<p>Да — введите форму и размеры внутренней полости резервуара, чтобы оценить его вместимость.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.ru, type: 'select', options: SHAPE_OPTIONS.ru },
                { name: 'diameter', label: DIAMETER_FT_LABEL.ru, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.ru, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.ru, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.ru, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.ru, precision: 2 },
            ],
        },
        lv: {
            slug: 'tvertnes-tilpuma-kalkulators', title: 'Tvertnes Tilpuma Kalkulators', h1: 'Tvertnes Tilpuma Kalkulators',
            meta_title: 'Tvertnes Tilpuma Kalkulators | Kubikpēdas, Galoni un Litri',
            meta_description: 'Aprēķiniet cilindriskas vai taisnstūra tvertnes tilpumu kubikpēdās, ASV galonos un litros.',
            short_answer: 'Šis kalkulators atrod tvertnes tilpumu, piemēram, cilindriska tvertne ar 4 pēdu diametru × 5 pēdu augstumu = 62,83 kubikpēdas ≈ 470,1 galons.',
            intro_text: '<p>Izvēlieties tvertnes formu un ievadiet tās izmērus, lai uzzinātu tilpumu kubikpēdās, ASV galonos un litros.</p>',
            key_points: [
                '<b>Cilindra formula:</b> Tilpums = π × (Diametrs ÷ 2)² × Augstums.',
                '<b>Taisnstūra formula:</b> Tilpums = Garums × Platums × Augstums.',
                '<b>Pārrēķins:</b> 1 kubikpēda = 7,48052 ASV galoni = 28,3168 litri.',
            ],
            howto: [
                { question: 'Vai tiek ņemts vērā sienas biezums?', answer: '<p>Nē — tiek aprēķināts iekšējais tilpums, pamatojoties uz jūsu ievadītajiem izmēriem; precīzākam rezultātam mēriet iekšējos izmērus.</p>' },
                { question: 'Vai to var izmantot septikam vai ūdens tvertnei?', answer: '<p>Jā — ievadiet tvertnes iekšējo formu un izmērus, lai novērtētu tās ietilpību.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.lv, type: 'select', options: SHAPE_OPTIONS.lv },
                { name: 'diameter', label: DIAMETER_FT_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.lv, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.lv, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.lv, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.lv, precision: 2 },
            ],
        },
        pl: {
            slug: 'kalkulator-pojemnosci-zbiornika', title: 'Kalkulator Pojemności Zbiornika', h1: 'Kalkulator Pojemności Zbiornika',
            meta_title: 'Kalkulator Pojemności Zbiornika | Stopy Sześcienne, Galony i Litry',
            meta_description: 'Oblicz objętość zbiornika cylindrycznego lub prostokątnego w stopach sześciennych, galonach USA i litrach.',
            short_answer: 'Ten kalkulator znajduje objętość zbiornika, np. zbiornik cylindryczny o średnicy 4 stopy × 5 stóp wysokości = 62,83 stopy sześcienne ≈ 470,1 galona.',
            intro_text: '<p>Wybierz kształt zbiornika i wprowadź jego wymiary, aby poznać objętość w stopach sześciennych, galonach USA i litrach.</p>',
            key_points: [
                '<b>Wzór dla cylindra:</b> Objętość = π × (Średnica ÷ 2)² × Wysokość.',
                '<b>Wzór dla prostokąta:</b> Objętość = Długość × Szerokość × Wysokość.',
                '<b>Przelicznik:</b> 1 stopa sześcienna = 7,48052 galona USA = 28,3168 litra.',
            ],
            howto: [
                { question: 'Czy uwzględnia grubość ścian?', answer: '<p>Nie — oblicza objętość wewnętrzną na podstawie wprowadzonych wymiarów; dla dokładnego wyniku mierz wymiary wewnętrzne.</p>' },
                { question: 'Czy mogę użyć tego dla szamba lub zbiornika na wodę?', answer: '<p>Tak — wprowadź kształt i wymiary wnętrza zbiornika, aby oszacować jego pojemność.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.pl, type: 'select', options: SHAPE_OPTIONS.pl },
                { name: 'diameter', label: DIAMETER_FT_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.pl, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.pl, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.pl, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.pl, precision: 2 },
            ],
        },
        es: {
            slug: 'calculadora-de-capacidad-de-tanque', title: 'Calculadora de Capacidad de Tanque', h1: 'Calculadora de Capacidad de Tanque',
            meta_title: 'Calculadora de Capacidad de Tanque | Pies Cúbicos, Galones y Litros',
            meta_description: 'Calcula el volumen de un tanque cilíndrico o rectangular en pies cúbicos, galones estadounidenses y litros.',
            short_answer: 'Esta calculadora encuentra el volumen del tanque, p. ej. un tanque cilíndrico de 4 pies de diámetro × 5 pies de alto = 62.83 pies cúbicos ≈ 470.1 galones.',
            intro_text: '<p>Selecciona la forma de tu tanque e introduce sus dimensiones para conocer el volumen en pies cúbicos, galones estadounidenses y litros.</p>',
            key_points: [
                '<b>Fórmula cilíndrica:</b> Volumen = π × (Diámetro ÷ 2)² × Altura.',
                '<b>Fórmula rectangular:</b> Volumen = Largo × Ancho × Altura.',
                '<b>Conversión:</b> 1 pie cúbico = 7.48052 galones EE. UU. = 28.3168 litros.',
            ],
            howto: [
                { question: '¿Esto considera el grosor de las paredes?', answer: '<p>No — calcula el volumen interior según las dimensiones que introduces; mide las dimensiones interiores para el resultado más preciso.</p>' },
                { question: '¿Puedo usarlo para un tanque séptico o de agua?', answer: '<p>Sí — introduce la forma y dimensiones interiores del tanque para estimar su capacidad.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.es, type: 'select', options: SHAPE_OPTIONS.es },
                { name: 'diameter', label: DIAMETER_FT_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.es, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.es, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.es, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.es, precision: 2 },
            ],
        },
        fr: {
            slug: 'calculateur-de-capacite-de-reservoir', title: 'Calculateur de Capacité de Réservoir', h1: 'Calculateur de Capacité de Réservoir',
            meta_title: 'Calculateur de Capacité de Réservoir | Pieds Cubes, Gallons et Litres',
            meta_description: 'Calculez le volume d\'un réservoir cylindrique ou rectangulaire en pieds cubes, gallons US et litres.',
            short_answer: 'Ce calculateur trouve le volume du réservoir, ex. un réservoir cylindrique de 4 pieds de diamètre × 5 pieds de haut = 62,83 pieds cubes ≈ 470,1 gallons.',
            intro_text: '<p>Sélectionnez la forme de votre réservoir et entrez ses dimensions pour connaître le volume en pieds cubes, gallons US et litres.</p>',
            key_points: [
                '<b>Formule cylindrique :</b> Volume = π × (Diamètre ÷ 2)² × Hauteur.',
                '<b>Formule rectangulaire :</b> Volume = Longueur × Largeur × Hauteur.',
                '<b>Conversion :</b> 1 pied cube = 7,48052 gallons US = 28,3168 litres.',
            ],
            howto: [
                { question: 'Cela prend-il en compte l\'épaisseur des parois ?', answer: '<p>Non — cela calcule le volume intérieur basé sur les dimensions que vous entrez ; mesurez les dimensions intérieures pour le résultat le plus précis.</p>' },
                { question: 'Puis-je l\'utiliser pour une fosse septique ou un réservoir d\'eau ?', answer: '<p>Oui — entrez la forme et les dimensions intérieures du réservoir pour estimer sa capacité.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.fr, type: 'select', options: SHAPE_OPTIONS.fr },
                { name: 'diameter', label: DIAMETER_FT_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.fr, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.fr, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.fr, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.fr, precision: 2 },
            ],
        },
        it: {
            slug: 'calcolatore-di-capacita-serbatoio', title: 'Calcolatore di Capacità Serbatoio', h1: 'Calcolatore di Capacità Serbatoio',
            meta_title: 'Calcolatore di Capacità Serbatoio | Piedi Cubici, Galloni e Litri',
            meta_description: 'Calcola il volume di un serbatoio cilindrico o rettangolare in piedi cubici, galloni USA e litri.',
            short_answer: 'Questo calcolatore trova il volume del serbatoio, es. un serbatoio cilindrico con diametro 4 piedi × 5 piedi di altezza = 62,83 piedi cubici ≈ 470,1 galloni.',
            intro_text: '<p>Seleziona la forma del tuo serbatoio e inserisci le sue dimensioni per conoscere il volume in piedi cubici, galloni USA e litri.</p>',
            key_points: [
                '<b>Formula cilindrica:</b> Volume = π × (Diametro ÷ 2)² × Altezza.',
                '<b>Formula rettangolare:</b> Volume = Lunghezza × Larghezza × Altezza.',
                '<b>Conversione:</b> 1 piede cubico = 7,48052 galloni USA = 28,3168 litri.',
            ],
            howto: [
                { question: 'Questo considera lo spessore delle pareti?', answer: '<p>No — calcola il volume interno in base alle dimensioni inserite; misura le dimensioni interne per il risultato più accurato.</p>' },
                { question: 'Posso usarlo per un serbatoio settico o dell\'acqua?', answer: '<p>Sì — inserisci la forma e le dimensioni interne del serbatoio per stimare la sua capacità.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.it, type: 'select', options: SHAPE_OPTIONS.it },
                { name: 'diameter', label: DIAMETER_FT_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.it, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.it, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.it, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.it, precision: 2 },
            ],
        },
        de: {
            slug: 'tank-kapazitaets-rechner', title: 'Tank-Kapazitätsrechner', h1: 'Tank-Kapazitätsrechner',
            meta_title: 'Tank-Kapazitätsrechner | Kubikfuß, Gallonen und Liter',
            meta_description: 'Berechnen Sie das Volumen eines zylindrischen oder rechteckigen Tanks in Kubikfuß, US-Gallonen und Litern.',
            short_answer: 'Dieser Rechner findet das Tankvolumen, z.B. ein zylindrischer Tank mit 4 Fuß Durchmesser × 5 Fuß Höhe = 62,83 Kubikfuß ≈ 470,1 Gallonen.',
            intro_text: '<p>Wählen Sie Ihre Tankform und geben Sie die Abmessungen ein, um das Volumen in Kubikfuß, US-Gallonen und Litern zu erfahren.</p>',
            key_points: [
                '<b>Zylindrische Formel:</b> Volumen = π × (Durchmesser ÷ 2)² × Höhe.',
                '<b>Rechteckige Formel:</b> Volumen = Länge × Breite × Höhe.',
                '<b>Umrechnung:</b> 1 Kubikfuß = 7,48052 US-Gallonen = 28,3168 Liter.',
            ],
            howto: [
                { question: 'Wird die Wanddicke berücksichtigt?', answer: '<p>Nein — berechnet wird das Innenvolumen anhand der eingegebenen Abmessungen; messen Sie Innenabmessungen für das genaueste Ergebnis.</p>' },
                { question: 'Kann ich das für einen Sickertank oder Wasserspeicher verwenden?', answer: '<p>Ja — geben Sie die Innenform und Abmessungen des Tanks ein, um seine Fassungskapazität zu schätzen.</p>' },
            ],
            inputs: [
                { name: 'shape', label: SHAPE_LABEL.de, type: 'select', options: SHAPE_OPTIONS.de },
                { name: 'diameter', label: DIAMETER_FT_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '4' },
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '6' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '3' },
                { name: 'height', label: HEIGHT_FT_LABEL.de, type: 'number', min: 0.1, max: 10000, placeholder: '5' },
            ],
            outputs: [
                { name: 'volume_cuft', label: VOLUME_CUFT_LABEL.de, precision: 2 },
                { name: 'gallons', label: GALLONS_LABEL.de, precision: 2 },
                { name: 'liters', label: LITERS_LABEL.de, precision: 2 },
            ],
        },
    },
}

// ============================================================
// 1176: Roadway Fill Calculator
// ============================================================
const roadwayFillCalculatorTool: ToolDef = {
    id: '1176',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 100 }, { key: 'width', default: 20 }, { key: 'depth', default: 6 }],
        functions: { result: { type: 'function', functionName: 'roadwayFillCalculator', params: { length: 'length', width: 'width', depth: 'depth' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'roadway-fill-calculator', title: 'Roadway Fill Calculator', h1: 'Roadway Fill Calculator',
            meta_title: 'Roadway Fill Calculator | Cubic Yards and Tons for Road Base',
            meta_description: 'Calculate how much fill material you need for a roadway or driveway base in cubic yards and tons.',
            short_answer: 'This calculator finds how much roadway fill you need, e.g. a 100×20 ft stretch at 6 inches deep = 37.04 cubic yards, about 51.85 tons.',
            intro_text: '<p>Enter the length, width, and depth of the roadway or driveway base you\'re building to find how much fill material to order — in cubic yards and tons.</p>',
            key_points: [
                '<b>Formula:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.4.',
                '<b>Example:</b> a 100×20 ft roadway base at 6 inches deep = 37.04 cubic yards ≈ 51.85 tons.',
                '<b>Density assumption:</b> uses ~1.4 tons per cubic yard, a standard estimate for compacted road base fill.',
            ],
            howto: [
                { question: 'What depth of fill do roads typically need?', answer: '<p>Base depth varies widely by traffic load and soil conditions, commonly 4-12 inches — check local engineering guidance for your project.</p>' },
                { question: 'Should I compact the fill in layers?', answer: '<p>Yes — compacting in lifts (layers) of a few inches at a time gives better stability than compacting one thick layer at once.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.en, precision: 2 }, { name: 'tons', label: TONS_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-dorozhnoy-podsypki', title: 'Калькулятор дорожной подсыпки', h1: 'Калькулятор дорожной подсыпки',
            meta_title: 'Калькулятор дорожной подсыпки | Куб. ярды и тонны для основания дороги',
            meta_description: 'Рассчитайте, сколько материала подсыпки нужно для основания дороги или подъездной дороги, в куб. ярдах и тоннах.',
            short_answer: 'Этот калькулятор находит, сколько дорожной подсыпки нужно, например участок 100×20 футов при глубине 6 дюймов = 37,04 куб. ярда, около 51,85 тонны.',
            intro_text: '<p>Введите длину, ширину и глубину основания дороги или подъездной дороги, чтобы узнать, сколько материала подсыпки заказать.</p>',
            key_points: [
                '<b>Формула:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,4.',
                '<b>Пример:</b> основание дороги 100×20 футов глубиной 6 дюймов = 37,04 куб. ярда ≈ 51,85 тонны.',
                '<b>Допущение о плотности:</b> используется ~1,4 тонны на куб. ярд, стандартная оценка для утрамбованного дорожного основания.',
            ],
            howto: [
                { question: 'Какая глубина подсыпки обычно нужна для дорог?', answer: '<p>Глубина основания сильно варьируется в зависимости от нагрузки и грунта, обычно 4-12 дюймов.</p>' },
                { question: 'Нужно ли трамбовать подсыпку слоями?', answer: '<p>Да — трамбовка слоями по несколько дюймов даёт лучшую устойчивость, чем трамбовка одного толстого слоя сразу.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.ru, precision: 2 }, { name: 'tons', label: TONS_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'celu-uzbēruma-kalkulators', title: 'Ceļu Uzbēruma Kalkulators', h1: 'Ceļu Uzbēruma Kalkulators',
            meta_title: 'Ceļu Uzbēruma Kalkulators | Kubikjardas un Tonnas Ceļa Pamatnei',
            meta_description: 'Aprēķiniet, cik uzbēruma materiāla nepieciešams ceļa vai piebraucamā ceļa pamatnei, kubikjardās un tonnās.',
            short_answer: 'Šis kalkulators atrod, cik ceļu uzbēruma nepieciešams, piemēram, 100×20 pēdu posms ar 6 collu dziļumu = 37,04 kubikjardas, apmēram 51,85 tonnas.',
            intro_text: '<p>Ievadiet ceļa vai piebraucamā ceļa pamatnes garumu, platumu un dziļumu, lai uzzinātu, cik uzbēruma materiāla pasūtīt.</p>',
            key_points: [
                '<b>Formula:</b> Kubikjardas = (Garums × Platums × Dziļums collās ÷ 12) ÷ 27; Tonnas = Kubikjardas × 1,4.',
                '<b>Piemērs:</b> ceļa pamatne 100×20 pēdas ar 6 collu dziļumu = 37,04 kubikjardas ≈ 51,85 tonnas.',
                '<b>Blīvuma pieņēmums:</b> tiek izmantotas ~1,4 tonnas uz kubikjardu, standarta novērtējums sablīvētai ceļa pamatnei.',
            ],
            howto: [
                { question: 'Cik dziļš uzbērums parasti nepieciešams ceļiem?', answer: '<p>Pamatnes dziļums ļoti atšķiras atkarībā no satiksmes slodzes un augsnes, parasti 4-12 collas.</p>' },
                { question: 'Vai uzbērums jāsablīvē slāņos?', answer: '<p>Jā — sablīvēšana pa dažu collu slāņiem dod labāku stabilitāti nekā viena bieza slāņa sablīvēšana uzreiz.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.lv, precision: 2 }, { name: 'tons', label: TONS_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-podsypki-drogowej', title: 'Kalkulator Podsypki Drogowej', h1: 'Kalkulator Podsypki Drogowej',
            meta_title: 'Kalkulator Podsypki Drogowej | Jardy Sześcienne i Tony dla Podbudowy Drogi',
            meta_description: 'Oblicz, ile materiału podsypki potrzebujesz do podbudowy drogi lub podjazdu, w jardach sześciennych i tonach.',
            short_answer: 'Ten kalkulator znajduje, ile podsypki drogowej potrzebujesz, np. odcinek 100×20 stóp przy głębokości 6 cali = 37,04 jarda sześciennego, około 51,85 tony.',
            intro_text: '<p>Wpisz długość, szerokość i głębokość podbudowy drogi lub podjazdu, aby dowiedzieć się, ile materiału podsypki zamówić.</p>',
            key_points: [
                '<b>Wzór:</b> Jardy Sześcienne = (Długość × Szerokość × Głębokość w calach ÷ 12) ÷ 27; Tony = Jardy Sześcienne × 1,4.',
                '<b>Przykład:</b> podbudowa drogi 100×20 stóp o głębokości 6 cali = 37,04 jarda sześciennego ≈ 51,85 tony.',
                '<b>Założenie gęstości:</b> używa ~1,4 tony na jard sześcienny, standardowego oszacowania dla zagęszczonej podbudowy drogowej.',
            ],
            howto: [
                { question: 'Jakiej głębokości podsypki zwykle potrzebują drogi?', answer: '<p>Głębokość podbudowy różni się znacznie w zależności od obciążenia ruchem i gruntu, zwykle 4-12 cali.</p>' },
                { question: 'Czy podsypkę należy zagęszczać warstwami?', answer: '<p>Tak — zagęszczanie warstwami po kilka cali daje lepszą stabilność niż zagęszczanie jednej grubej warstwy naraz.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.pl, precision: 2 }, { name: 'tons', label: TONS_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-relleno-vial', title: 'Calculadora de Relleno Vial', h1: 'Calculadora de Relleno Vial',
            meta_title: 'Calculadora de Relleno Vial | Yardas Cúbicas y Toneladas para Base de Carretera',
            meta_description: 'Calcula cuánto material de relleno necesitas para una base de carretera o entrada en yardas cúbicas y toneladas.',
            short_answer: 'Esta calculadora encuentra cuánto relleno vial necesitas, p. ej. un tramo de 100×20 pies a 6 pulgadas de profundidad = 37.04 yardas cúbicas, unas 51.85 toneladas.',
            intro_text: '<p>Introduce el largo, ancho y profundidad de la base de carretera o entrada que estás construyendo para saber cuánto material de relleno pedir.</p>',
            key_points: [
                '<b>Fórmula:</b> Yardas Cúbicas = (Largo × Ancho × Profundidad en pulgadas ÷ 12) ÷ 27; Toneladas = Yardas Cúbicas × 1.4.',
                '<b>Ejemplo:</b> una base de carretera de 100×20 pies a 6 pulgadas de profundidad = 37.04 yardas cúbicas ≈ 51.85 toneladas.',
                '<b>Suposición de densidad:</b> usa ~1.4 toneladas por yarda cúbica, una estimación estándar para base de carretera compactada.',
            ],
            howto: [
                { question: '¿Qué profundidad de relleno necesitan típicamente las carreteras?', answer: '<p>La profundidad de la base varía mucho según la carga de tráfico y el suelo, comúnmente 4-12 pulgadas.</p>' },
                { question: '¿Debo compactar el relleno en capas?', answer: '<p>Sí — compactar en capas de unas pocas pulgadas a la vez da mejor estabilidad que compactar una capa gruesa de una vez.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.es, precision: 2 }, { name: 'tons', label: TONS_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-remblai-routier', title: 'Calculateur de Remblai Routier', h1: 'Calculateur de Remblai Routier',
            meta_title: 'Calculateur de Remblai Routier | Verges Cubes et Tonnes pour Base de Route',
            meta_description: 'Calculez combien de matériau de remblai vous avez besoin pour une base de route ou d\'allée en verges cubes et tonnes.',
            short_answer: 'Ce calculateur trouve combien de remblai routier vous avez besoin, ex. un tronçon de 100×20 pieds à 6 pouces de profondeur = 37,04 verges cubes, environ 51,85 tonnes.',
            intro_text: '<p>Entrez la longueur, largeur et profondeur de la base de route ou d\'allée que vous construisez pour savoir combien de matériau de remblai commander.</p>',
            key_points: [
                '<b>Formule :</b> Verges Cubes = (Longueur × Largeur × Profondeur en pouces ÷ 12) ÷ 27 ; Tonnes = Verges Cubes × 1,4.',
                '<b>Exemple :</b> une base de route de 100×20 pieds à 6 pouces de profondeur = 37,04 verges cubes ≈ 51,85 tonnes.',
                '<b>Hypothèse de densité :</b> utilise ~1,4 tonne par verge cube, une estimation standard pour base de route compactée.',
            ],
            howto: [
                { question: 'Quelle profondeur de remblai les routes nécessitent-elles généralement ?', answer: '<p>La profondeur de base varie considérablement selon la charge de trafic et le sol, généralement 4-12 pouces.</p>' },
                { question: 'Dois-je compacter le remblai en couches ?', answer: '<p>Oui — compacter en couches de quelques pouces à la fois donne une meilleure stabilité que compacter une couche épaisse d\'un coup.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.fr, precision: 2 }, { name: 'tons', label: TONS_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-riempimento-stradale', title: 'Calcolatore di Riempimento Stradale', h1: 'Calcolatore di Riempimento Stradale',
            meta_title: 'Calcolatore di Riempimento Stradale | Iarde Cubiche e Tonnellate per Base Stradale',
            meta_description: 'Calcola quanto materiale di riempimento ti serve per una base stradale o vialetto in iarde cubiche e tonnellate.',
            short_answer: 'Questo calcolatore trova quanto riempimento stradale ti serve, es. un tratto 100×20 piedi a 6 pollici di profondità = 37,04 iarde cubiche, circa 51,85 tonnellate.',
            intro_text: '<p>Inserisci lunghezza, larghezza e profondità della base stradale o vialetto che stai costruendo per sapere quanto materiale di riempimento ordinare.</p>',
            key_points: [
                '<b>Formula:</b> Iarde Cubiche = (Lunghezza × Larghezza × Profondità in pollici ÷ 12) ÷ 27; Tonnellate = Iarde Cubiche × 1,4.',
                '<b>Esempio:</b> una base stradale 100×20 piedi a 6 pollici di profondità = 37,04 iarde cubiche ≈ 51,85 tonnellate.',
                '<b>Ipotesi di densità:</b> usa ~1,4 tonnellate per iarda cubica, una stima standard per base stradale compattata.',
            ],
            howto: [
                { question: 'Che profondità di riempimento serve tipicamente alle strade?', answer: '<p>La profondità della base varia molto in base al carico di traffico e al terreno, comunemente 4-12 pollici.</p>' },
                { question: 'Dovrei compattare il riempimento a strati?', answer: '<p>Sì — compattare a strati di alcuni pollici alla volta dà maggiore stabilità rispetto a compattare uno strato spesso in una volta.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.it, precision: 2 }, { name: 'tons', label: TONS_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'strassenauffuellung-rechner', title: 'Straßenauffüllung-Rechner', h1: 'Straßenauffüllung-Rechner',
            meta_title: 'Straßenauffüllung-Rechner | Kubikyards und Tonnen für Straßenunterbau',
            meta_description: 'Berechnen Sie, wie viel Füllmaterial Sie für einen Straßen- oder Einfahrtsunterbau benötigen, in Kubikyards und Tonnen.',
            short_answer: 'Dieser Rechner findet, wie viel Straßenauffüllung Sie benötigen, z.B. ein 100×20 Fuß Abschnitt bei 6 Zoll Tiefe = 37,04 Kubikyards, etwa 51,85 Tonnen.',
            intro_text: '<p>Geben Sie Länge, Breite und Tiefe des Straßen- oder Einfahrtsunterbaus ein, den Sie bauen, um herauszufinden, wie viel Füllmaterial Sie bestellen sollten.</p>',
            key_points: [
                '<b>Formel:</b> Kubikyards = (Länge × Breite × Tiefe in Zoll ÷ 12) ÷ 27; Tonnen = Kubikyards × 1,4.',
                '<b>Beispiel:</b> ein Straßenunterbau von 100×20 Fuß bei 6 Zoll Tiefe = 37,04 Kubikyards ≈ 51,85 Tonnen.',
                '<b>Dichteannahme:</b> verwendet ~1,4 Tonnen pro Kubikyard, eine Standardschätzung für verdichteten Straßenunterbau.',
            ],
            howto: [
                { question: 'Welche Auffülltiefe benötigen Straßen typischerweise?', answer: '<p>Die Unterbautiefe variiert stark je nach Verkehrslast und Bodenbeschaffenheit, üblicherweise 4-12 Zoll.</p>' },
                { question: 'Sollte ich die Auffüllung in Schichten verdichten?', answer: '<p>Ja — das Verdichten in Lagen von wenigen Zoll auf einmal gibt bessere Stabilität als eine dicke Schicht auf einmal zu verdichten.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 1000000, placeholder: '100' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'depth', label: DEPTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.de, precision: 2 }, { name: 'tons', label: TONS_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1177: Sand Calculator
// ============================================================
const sandCalculatorTool: ToolDef = {
    id: '1177',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 15 }, { key: 'width', default: 10 }, { key: 'depth', default: 2 }],
        functions: { result: { type: 'function', functionName: 'sandCalculator', params: { length: 'length', width: 'width', depth: 'depth' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'sand-calculator', title: 'Sand Calculator', h1: 'Sand Calculator',
            meta_title: 'Sand Calculator | Cubic Yards and Tons for Sandboxes and Paver Base',
            meta_description: 'Calculate how much sand you need for a sandbox, paver base, or leveling layer in cubic yards and tons.',
            short_answer: 'This calculator finds how much sand you need, e.g. a 15×10 ft area at 2 inches deep = 0.93 cubic yards, about 1.25 tons.',
            intro_text: '<p>Enter the length, width, and depth of the area you\'re covering to find how much sand to order — in cubic yards and tons.</p>',
            key_points: [
                '<b>Formula:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.35.',
                '<b>Example:</b> a 15×10 ft area at 2 inches deep = 0.93 cubic yards ≈ 1.25 tons.',
                '<b>Density assumption:</b> uses ~1.35 tons per cubic yard, a standard estimate for typical construction sand.',
            ],
            howto: [
                { question: 'How deep should paver base sand be?', answer: '<p>A common bedding layer is about 1 inch, in addition to a separate compacted gravel base underneath.</p>' },
                { question: 'Does wet sand weigh more?', answer: '<p>Yes — moisture content can noticeably increase sand\'s weight per cubic yard, so treat this as an estimate.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.en, precision: 2 }, { name: 'tons', label: TONS_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-peska', title: 'Калькулятор песка', h1: 'Калькулятор песка',
            meta_title: 'Калькулятор песка | Куб. ярды и тонны для песочниц и основания под плитку',
            meta_description: 'Рассчитайте, сколько песка нужно для песочницы, основания под тротуарную плитку или выравнивающего слоя, в куб. ярдах и тоннах.',
            short_answer: 'Этот калькулятор находит, сколько песка нужно, например площадь 15×10 футов при глубине 2 дюйма = 0,93 куб. ярда, около 1,25 тонны.',
            intro_text: '<p>Введите длину, ширину и глубину покрываемой области, чтобы узнать, сколько песка заказать — в куб. ярдах и тоннах.</p>',
            key_points: [
                '<b>Формула:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,35.',
                '<b>Пример:</b> площадь 15×10 футов глубиной 2 дюйма = 0,93 куб. ярда ≈ 1,25 тонны.',
                '<b>Допущение о плотности:</b> используется ~1,35 тонны на куб. ярд, стандартная оценка для обычного строительного песка.',
            ],
            howto: [
                { question: 'Какой глубины должен быть песок под тротуарной плиткой?', answer: '<p>Обычный слой подстилки — около 1 дюйма, в дополнение к отдельному утрамбованному щебневому основанию под ним.</p>' },
                { question: 'Весит ли мокрый песок больше?', answer: '<p>Да — влажность может заметно увеличить вес песка на кубический ярд, так что считайте это оценкой.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.ru, precision: 2 }, { name: 'tons', label: TONS_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'smilts-kalkulators', title: 'Smilts Kalkulators', h1: 'Smilts Kalkulators',
            meta_title: 'Smilts Kalkulators | Kubikjardas un Tonnas Smilšu Kastēm un Bruģa Pamatnei',
            meta_description: 'Aprēķiniet, cik smilts nepieciešams smilšu kastei, bruģa pamatnei vai izlīdzinošam slānim, kubikjardās un tonnās.',
            short_answer: 'Šis kalkulators atrod, cik smilts nepieciešams, piemēram, 15×10 pēdu platība ar 2 collu dziļumu = 0,93 kubikjardas, apmēram 1,25 tonnas.',
            intro_text: '<p>Ievadiet segtās teritorijas garumu, platumu un dziļumu, lai uzzinātu, cik smilts pasūtīt — kubikjardās un tonnās.</p>',
            key_points: [
                '<b>Formula:</b> Kubikjardas = (Garums × Platums × Dziļums collās ÷ 12) ÷ 27; Tonnas = Kubikjardas × 1,35.',
                '<b>Piemērs:</b> 15×10 pēdu platība ar 2 collu dziļumu = 0,93 kubikjardas ≈ 1,25 tonnas.',
                '<b>Blīvuma pieņēmums:</b> tiek izmantotas ~1,35 tonnas uz kubikjardu, standarta novērtējums parastai būvniecības smiltij.',
            ],
            howto: [
                { question: 'Cik dziļai jābūt smilšu kārtai zem bruģa?', answer: '<p>Izplatīts gultnes slānis ir apmēram 1 colla, papildus atsevišķai sablīvētai šķembu pamatnei zem tās.</p>' },
                { question: 'Vai mitra smilts sver vairāk?', answer: '<p>Jā — mitrums var manāmi palielināt smilts svaru uz kubikjardu, tāpēc uzskatiet to par novērtējumu.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.lv, precision: 2 }, { name: 'tons', label: TONS_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-piasku', title: 'Kalkulator Piasku', h1: 'Kalkulator Piasku',
            meta_title: 'Kalkulator Piasku | Jardy Sześcienne i Tony na Piaskownice i Podsypkę pod Kostkę',
            meta_description: 'Oblicz, ile piasku potrzebujesz na piaskownicę, podsypkę pod kostkę brukową lub warstwę wyrównawczą, w jardach sześciennych i tonach.',
            short_answer: 'Ten kalkulator znajduje, ile piasku potrzebujesz, np. obszar 15×10 stóp przy głębokości 2 cali = 0,93 jarda sześciennego, około 1,25 tony.',
            intro_text: '<p>Wpisz długość, szerokość i głębokość pokrywanego obszaru, aby dowiedzieć się, ile piasku zamówić — w jardach sześciennych i tonach.</p>',
            key_points: [
                '<b>Wzór:</b> Jardy Sześcienne = (Długość × Szerokość × Głębokość w calach ÷ 12) ÷ 27; Tony = Jardy Sześcienne × 1,35.',
                '<b>Przykład:</b> obszar 15×10 stóp o głębokości 2 cali = 0,93 jarda sześciennego ≈ 1,25 tony.',
                '<b>Założenie gęstości:</b> używa ~1,35 tony na jard sześcienny, standardowego oszacowania dla typowego piasku budowlanego.',
            ],
            howto: [
                { question: 'Jak głęboka powinna być podsypka piaskowa pod kostkę?', answer: '<p>Typowa warstwa podsypki to około 1 cala, dodatkowo do osobnej zagęszczonej podbudowy żwirowej pod nią.</p>' },
                { question: 'Czy mokry piasek waży więcej?', answer: '<p>Tak — wilgotność może zauważalnie zwiększyć wagę piasku na jard sześcienny, więc traktuj to jako szacunek.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.pl, precision: 2 }, { name: 'tons', label: TONS_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-arena', title: 'Calculadora de Arena', h1: 'Calculadora de Arena',
            meta_title: 'Calculadora de Arena | Yardas Cúbicas y Toneladas para Areneros y Base de Adoquines',
            meta_description: 'Calcula cuánta arena necesitas para un arenero, base de adoquines o capa de nivelación en yardas cúbicas y toneladas.',
            short_answer: 'Esta calculadora encuentra cuánta arena necesitas, p. ej. un área de 15×10 pies a 2 pulgadas de profundidad = 0.93 yardas cúbicas, unas 1.25 toneladas.',
            intro_text: '<p>Introduce el largo, ancho y profundidad del área que estás cubriendo para saber cuánta arena pedir — en yardas cúbicas y toneladas.</p>',
            key_points: [
                '<b>Fórmula:</b> Yardas Cúbicas = (Largo × Ancho × Profundidad en pulgadas ÷ 12) ÷ 27; Toneladas = Yardas Cúbicas × 1.35.',
                '<b>Ejemplo:</b> un área de 15×10 pies a 2 pulgadas de profundidad = 0.93 yardas cúbicas ≈ 1.25 toneladas.',
                '<b>Suposición de densidad:</b> usa ~1.35 toneladas por yarda cúbica, una estimación estándar para arena de construcción típica.',
            ],
            howto: [
                { question: '¿Qué tan profunda debe ser la arena de base para adoquines?', answer: '<p>Una capa de asiento común es de aproximadamente 1 pulgada, además de una base de grava compactada separada debajo.</p>' },
                { question: '¿Pesa más la arena mojada?', answer: '<p>Sí — el contenido de humedad puede aumentar notablemente el peso de la arena por yarda cúbica, así que trata esto como una estimación.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.es, precision: 2 }, { name: 'tons', label: TONS_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-sable', title: 'Calculateur de Sable', h1: 'Calculateur de Sable',
            meta_title: 'Calculateur de Sable | Verges Cubes et Tonnes pour Bacs à Sable et Base de Pavés',
            meta_description: 'Calculez combien de sable vous avez besoin pour un bac à sable, une base de pavés ou une couche de nivellement en verges cubes et tonnes.',
            short_answer: 'Ce calculateur trouve combien de sable vous avez besoin, ex. une zone de 15×10 pieds à 2 pouces de profondeur = 0,93 verge cube, environ 1,25 tonne.',
            intro_text: '<p>Entrez la longueur, largeur et profondeur de la zone que vous couvrez pour savoir combien de sable commander — en verges cubes et tonnes.</p>',
            key_points: [
                '<b>Formule :</b> Verges Cubes = (Longueur × Largeur × Profondeur en pouces ÷ 12) ÷ 27 ; Tonnes = Verges Cubes × 1,35.',
                '<b>Exemple :</b> une zone de 15×10 pieds à 2 pouces de profondeur = 0,93 verge cube ≈ 1,25 tonne.',
                '<b>Hypothèse de densité :</b> utilise ~1,35 tonne par verge cube, une estimation standard pour du sable de construction typique.',
            ],
            howto: [
                { question: 'Quelle profondeur de sable de base pour pavés faut-il ?', answer: '<p>Une couche de pose courante est d\'environ 1 pouce, en plus d\'une base de gravier compacté séparée en dessous.</p>' },
                { question: 'Le sable mouillé pèse-t-il plus lourd ?', answer: '<p>Oui — la teneur en humidité peut augmenter sensiblement le poids du sable par verge cube, alors considérez ceci comme une estimation.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.fr, precision: 2 }, { name: 'tons', label: TONS_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-sabbia', title: 'Calcolatore di Sabbia', h1: 'Calcolatore di Sabbia',
            meta_title: 'Calcolatore di Sabbia | Iarde Cubiche e Tonnellate per Sabbiere e Base per Pavimentazione',
            meta_description: 'Calcola quanta sabbia ti serve per una sabbiera, base per pavimentazione o strato di livellamento in iarde cubiche e tonnellate.',
            short_answer: 'Questo calcolatore trova quanta sabbia ti serve, es. un\'area 15×10 piedi a 2 pollici di profondità = 0,93 iarde cubiche, circa 1,25 tonnellate.',
            intro_text: '<p>Inserisci lunghezza, larghezza e profondità dell\'area che stai coprendo per sapere quanta sabbia ordinare — in iarde cubiche e tonnellate.</p>',
            key_points: [
                '<b>Formula:</b> Iarde Cubiche = (Lunghezza × Larghezza × Profondità in pollici ÷ 12) ÷ 27; Tonnellate = Iarde Cubiche × 1,35.',
                '<b>Esempio:</b> un\'area 15×10 piedi a 2 pollici di profondità = 0,93 iarde cubiche ≈ 1,25 tonnellate.',
                '<b>Ipotesi di densità:</b> usa ~1,35 tonnellate per iarda cubica, una stima standard per la tipica sabbia da costruzione.',
            ],
            howto: [
                { question: 'Quanto dovrebbe essere profonda la sabbia di base per pavimentazione?', answer: '<p>Uno strato di posa comune è di circa 1 pollice, in aggiunta a una base di ghiaia compattata separata sottostante.</p>' },
                { question: 'La sabbia bagnata pesa di più?', answer: '<p>Sì — il contenuto di umidità può aumentare notevolmente il peso della sabbia per iarda cubica, quindi considera questa una stima.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.it, precision: 2 }, { name: 'tons', label: TONS_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'sand-rechner', title: 'Sand-Rechner', h1: 'Sand-Rechner',
            meta_title: 'Sand-Rechner | Kubikyards und Tonnen für Sandkästen und Pflasterbett',
            meta_description: 'Berechnen Sie, wie viel Sand Sie für einen Sandkasten, ein Pflasterbett oder eine Ausgleichsschicht benötigen, in Kubikyards und Tonnen.',
            short_answer: 'Dieser Rechner findet, wie viel Sand Sie benötigen, z.B. eine Fläche von 15×10 Fuß bei 2 Zoll Tiefe = 0,93 Kubikyards, etwa 1,25 Tonnen.',
            intro_text: '<p>Geben Sie Länge, Breite und Tiefe der zu bedeckenden Fläche ein, um herauszufinden, wie viel Sand Sie bestellen sollten — in Kubikyards und Tonnen.</p>',
            key_points: [
                '<b>Formel:</b> Kubikyards = (Länge × Breite × Tiefe in Zoll ÷ 12) ÷ 27; Tonnen = Kubikyards × 1,35.',
                '<b>Beispiel:</b> eine Fläche von 15×10 Fuß bei 2 Zoll Tiefe = 0,93 Kubikyards ≈ 1,25 Tonnen.',
                '<b>Dichteannahme:</b> verwendet ~1,35 Tonnen pro Kubikyard, eine Standardschätzung für typischen Bausand.',
            ],
            howto: [
                { question: 'Wie tief sollte das Sandbett für Pflastersteine sein?', answer: '<p>Eine übliche Bettungsschicht beträgt etwa 1 Zoll, zusätzlich zu einer separaten verdichteten Kiesbasis darunter.</p>' },
                { question: 'Wiegt nasser Sand mehr?', answer: '<p>Ja — der Feuchtigkeitsgehalt kann das Gewicht des Sands pro Kubikyard spürbar erhöhen, betrachten Sie dies also als Schätzung.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '10' },
                { name: 'depth', label: DEPTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '2' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.de, precision: 2 }, { name: 'tons', label: TONS_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1178: Topsoil Calculator
// ============================================================
const topsoilCalculatorTool: ToolDef = {
    id: '1178',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'length', default: 20 }, { key: 'width', default: 15 }, { key: 'depth', default: 4 }],
        functions: { result: { type: 'function', functionName: 'topsoilCalculator', params: { length: 'length', width: 'width', depth: 'depth' } } },
        outputs: [{ key: 'cuyd', precision: 2 }, { key: 'tons', precision: 2 }],
    },
    locales: {
        en: {
            slug: 'topsoil-calculator', title: 'Topsoil Calculator', h1: 'Topsoil Calculator',
            meta_title: 'Topsoil Calculator | Cubic Yards and Tons for Lawns and Gardens',
            meta_description: 'Calculate how much topsoil you need for a lawn, garden bed, or grading project in cubic yards and tons.',
            short_answer: 'This calculator finds how much topsoil you need, e.g. a 20×15 ft area at 4 inches deep = 3.70 cubic yards, about 3.70 tons.',
            intro_text: '<p>Enter the length, width, and depth of the area you\'re covering to find how much topsoil to order — in cubic yards and tons.</p>',
            key_points: [
                '<b>Formula:</b> Cubic Yards = (Length × Width × Depth in inches ÷ 12) ÷ 27; Tons = Cubic Yards × 1.0.',
                '<b>Example:</b> a 20×15 ft area at 4 inches deep = 3.70 cubic yards ≈ 3.70 tons.',
                '<b>Density assumption:</b> uses ~1.0 ton per cubic yard, a common estimate for loose topsoil — lighter than sand or gravel since it contains organic material.',
            ],
            howto: [
                { question: 'How deep should topsoil be for a new lawn?', answer: '<p>4-6 inches is a common depth for establishing a new lawn from seed or sod.</p>' },
                { question: 'Will topsoil settle after spreading?', answer: '<p>Yes — loose topsoil typically settles by 10-20% after rain and time, so some ordering extra is common practice.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.en, precision: 2 }, { name: 'tons', label: TONS_LABEL.en, precision: 2 }],
        },
        ru: {
            slug: 'kalkulyator-plodorodnogo-grunta', title: 'Калькулятор плодородного грунта', h1: 'Калькулятор плодородного грунта',
            meta_title: 'Калькулятор плодородного грунта | Куб. ярды и тонны для газонов и садов',
            meta_description: 'Рассчитайте, сколько плодородного грунта нужно для газона, клумбы или выравнивания участка, в куб. ярдах и тоннах.',
            short_answer: 'Этот калькулятор находит, сколько грунта нужно, например площадь 20×15 футов при глубине 4 дюйма = 3,70 куб. ярда, около 3,70 тонны.',
            intro_text: '<p>Введите длину, ширину и глубину покрываемой области, чтобы узнать, сколько грунта заказать — в куб. ярдах и тоннах.</p>',
            key_points: [
                '<b>Формула:</b> Куб. ярды = (Длина × Ширина × Глубина в дюймах ÷ 12) ÷ 27; Тонны = Куб. ярды × 1,0.',
                '<b>Пример:</b> площадь 20×15 футов глубиной 4 дюйма = 3,70 куб. ярда ≈ 3,70 тонны.',
                '<b>Допущение о плотности:</b> используется ~1,0 тонна на куб. ярд, обычная оценка для рыхлого грунта — легче песка или щебня из-за органики.',
            ],
            howto: [
                { question: 'Какой глубины должен быть грунт для нового газона?', answer: '<p>4-6 дюймов — обычная глубина для создания нового газона из семян или рулонного дёрна.</p>' },
                { question: 'Осядет ли грунт после укладки?', answer: '<p>Да — рыхлый грунт обычно оседает на 10-20% после дождей и времени, поэтому обычно заказывают с запасом.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.ru, precision: 2 }, { name: 'tons', label: TONS_LABEL.ru, precision: 2 }],
        },
        lv: {
            slug: 'augsnes-kalkulators', title: 'Augsnes Kalkulators', h1: 'Augsnes Kalkulators',
            meta_title: 'Augsnes Kalkulators | Kubikjardas un Tonnas Zālieniem un Dārziem',
            meta_description: 'Aprēķiniet, cik auglīgās augsnes nepieciešams zālienam, dārza dobei vai teritorijas izlīdzināšanai, kubikjardās un tonnās.',
            short_answer: 'Šis kalkulators atrod, cik augsnes nepieciešams, piemēram, 20×15 pēdu platība ar 4 collu dziļumu = 3,70 kubikjardas, apmēram 3,70 tonnas.',
            intro_text: '<p>Ievadiet segtās teritorijas garumu, platumu un dziļumu, lai uzzinātu, cik augsnes pasūtīt — kubikjardās un tonnās.</p>',
            key_points: [
                '<b>Formula:</b> Kubikjardas = (Garums × Platums × Dziļums collās ÷ 12) ÷ 27; Tonnas = Kubikjardas × 1,0.',
                '<b>Piemērs:</b> 20×15 pēdu platība ar 4 collu dziļumu = 3,70 kubikjardas ≈ 3,70 tonnas.',
                '<b>Blīvuma pieņēmums:</b> tiek izmantota ~1,0 tonna uz kubikjardu, izplatīts novērtējums irdenai augsnei — vieglāka par smilti vai šķembām organisko vielu dēļ.',
            ],
            howto: [
                { question: 'Cik dziļai jābūt augsnei jaunam zālienam?', answer: '<p>4-6 collas ir izplatīts dziļums jauna zāliena izveidei no sēklas vai velēnas.</p>' },
                { question: 'Vai augsne pēc izklāšanas sēžas?', answer: '<p>Jā — irdena augsne parasti sēžas par 10-20% pēc lietus un laika, tāpēc pasūtīšana ar rezervi ir izplatīta prakse.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.lv, precision: 2 }, { name: 'tons', label: TONS_LABEL.lv, precision: 2 }],
        },
        pl: {
            slug: 'kalkulator-ziemi-urodzajnej', title: 'Kalkulator Ziemi Urodzajnej', h1: 'Kalkulator Ziemi Urodzajnej',
            meta_title: 'Kalkulator Ziemi Urodzajnej | Jardy Sześcienne i Tony dla Trawników i Ogrodów',
            meta_description: 'Oblicz, ile ziemi urodzajnej potrzebujesz na trawnik, rabatę lub wyrównanie terenu, w jardach sześciennych i tonach.',
            short_answer: 'Ten kalkulator znajduje, ile ziemi urodzajnej potrzebujesz, np. obszar 20×15 stóp przy głębokości 4 cali = 3,70 jarda sześciennego, około 3,70 tony.',
            intro_text: '<p>Wpisz długość, szerokość i głębokość pokrywanego obszaru, aby dowiedzieć się, ile ziemi urodzajnej zamówić — w jardach sześciennych i tonach.</p>',
            key_points: [
                '<b>Wzór:</b> Jardy Sześcienne = (Długość × Szerokość × Głębokość w calach ÷ 12) ÷ 27; Tony = Jardy Sześcienne × 1,0.',
                '<b>Przykład:</b> obszar 20×15 stóp o głębokości 4 cali = 3,70 jarda sześciennego ≈ 3,70 tony.',
                '<b>Założenie gęstości:</b> używa ~1,0 tony na jard sześcienny, powszechne oszacowanie dla luźnej ziemi — lżejszej niż piasek czy żwir ze względu na materię organiczną.',
            ],
            howto: [
                { question: 'Jak głęboka powinna być ziemia dla nowego trawnika?', answer: '<p>4-6 cali to typowa głębokość dla zakładania nowego trawnika z nasion lub darni.</p>' },
                { question: 'Czy ziemia osiądzie po rozłożeniu?', answer: '<p>Tak — luźna ziemia zwykle osiada o 10-20% po deszczu i czasie, więc zamawianie z zapasem jest powszechną praktyką.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.pl, precision: 2 }, { name: 'tons', label: TONS_LABEL.pl, precision: 2 }],
        },
        es: {
            slug: 'calculadora-de-tierra-vegetal', title: 'Calculadora de Tierra Vegetal', h1: 'Calculadora de Tierra Vegetal',
            meta_title: 'Calculadora de Tierra Vegetal | Yardas Cúbicas y Toneladas para Céspedes y Jardines',
            meta_description: 'Calcula cuánta tierra vegetal necesitas para un césped, macizo de jardín o proyecto de nivelación en yardas cúbicas y toneladas.',
            short_answer: 'Esta calculadora encuentra cuánta tierra vegetal necesitas, p. ej. un área de 20×15 pies a 4 pulgadas de profundidad = 3.70 yardas cúbicas, unas 3.70 toneladas.',
            intro_text: '<p>Introduce el largo, ancho y profundidad del área que estás cubriendo para saber cuánta tierra vegetal pedir — en yardas cúbicas y toneladas.</p>',
            key_points: [
                '<b>Fórmula:</b> Yardas Cúbicas = (Largo × Ancho × Profundidad en pulgadas ÷ 12) ÷ 27; Toneladas = Yardas Cúbicas × 1.0.',
                '<b>Ejemplo:</b> un área de 20×15 pies a 4 pulgadas de profundidad = 3.70 yardas cúbicas ≈ 3.70 toneladas.',
                '<b>Suposición de densidad:</b> usa ~1.0 tonelada por yarda cúbica, una estimación común para tierra vegetal suelta — más ligera que la arena o grava por su contenido orgánico.',
            ],
            howto: [
                { question: '¿Qué tan profunda debe ser la tierra vegetal para un césped nuevo?', answer: '<p>4-6 pulgadas es una profundidad común para establecer un césped nuevo a partir de semilla o tepe.</p>' },
                { question: '¿Se asentará la tierra vegetal después de esparcirla?', answer: '<p>Sí — la tierra vegetal suelta típicamente se asienta un 10-20% después de la lluvia y el tiempo, así que pedir algo extra es práctica común.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.es, precision: 2 }, { name: 'tons', label: TONS_LABEL.es, precision: 2 }],
        },
        fr: {
            slug: 'calculateur-de-terre-vegetale', title: 'Calculateur de Terre Végétale', h1: 'Calculateur de Terre Végétale',
            meta_title: 'Calculateur de Terre Végétale | Verges Cubes et Tonnes pour Pelouses et Jardins',
            meta_description: 'Calculez combien de terre végétale vous avez besoin pour une pelouse, un massif ou un projet de nivellement en verges cubes et tonnes.',
            short_answer: 'Ce calculateur trouve combien de terre végétale vous avez besoin, ex. une zone de 20×15 pieds à 4 pouces de profondeur = 3,70 verges cubes, environ 3,70 tonnes.',
            intro_text: '<p>Entrez la longueur, largeur et profondeur de la zone que vous couvrez pour savoir combien de terre végétale commander — en verges cubes et tonnes.</p>',
            key_points: [
                '<b>Formule :</b> Verges Cubes = (Longueur × Largeur × Profondeur en pouces ÷ 12) ÷ 27 ; Tonnes = Verges Cubes × 1,0.',
                '<b>Exemple :</b> une zone de 20×15 pieds à 4 pouces de profondeur = 3,70 verges cubes ≈ 3,70 tonnes.',
                '<b>Hypothèse de densité :</b> utilise ~1,0 tonne par verge cube, une estimation courante pour la terre végétale meuble — plus légère que le sable ou le gravier en raison de sa matière organique.',
            ],
            howto: [
                { question: 'Quelle profondeur de terre végétale faut-il pour une nouvelle pelouse ?', answer: '<p>4-6 pouces est une profondeur courante pour établir une nouvelle pelouse à partir de graines ou de gazon en plaques.</p>' },
                { question: 'La terre végétale va-t-elle se tasser après l\'épandage ?', answer: '<p>Oui — la terre végétale meuble se tasse généralement de 10-20% après la pluie et le temps, donc commander un peu plus est une pratique courante.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.fr, precision: 2 }, { name: 'tons', label: TONS_LABEL.fr, precision: 2 }],
        },
        it: {
            slug: 'calcolatore-di-terriccio', title: 'Calcolatore di Terriccio', h1: 'Calcolatore di Terriccio',
            meta_title: 'Calcolatore di Terriccio | Iarde Cubiche e Tonnellate per Prati e Giardini',
            meta_description: 'Calcola quanto terriccio ti serve per un prato, un\'aiuola o un progetto di livellamento in iarde cubiche e tonnellate.',
            short_answer: 'Questo calcolatore trova quanto terriccio ti serve, es. un\'area 20×15 piedi a 4 pollici di profondità = 3,70 iarde cubiche, circa 3,70 tonnellate.',
            intro_text: '<p>Inserisci lunghezza, larghezza e profondità dell\'area che stai coprendo per sapere quanto terriccio ordinare — in iarde cubiche e tonnellate.</p>',
            key_points: [
                '<b>Formula:</b> Iarde Cubiche = (Lunghezza × Larghezza × Profondità in pollici ÷ 12) ÷ 27; Tonnellate = Iarde Cubiche × 1,0.',
                '<b>Esempio:</b> un\'area 20×15 piedi a 4 pollici di profondità = 3,70 iarde cubiche ≈ 3,70 tonnellate.',
                '<b>Ipotesi di densità:</b> usa ~1,0 tonnellata per iarda cubica, una stima comune per terriccio sciolto — più leggero di sabbia o ghiaia per il suo contenuto organico.',
            ],
            howto: [
                { question: 'Quanto dovrebbe essere profondo il terriccio per un prato nuovo?', answer: '<p>4-6 pollici è una profondità comune per avviare un nuovo prato da seme o zolle.</p>' },
                { question: 'Il terriccio si assesterà dopo la stesura?', answer: '<p>Sì — il terriccio sciolto si assesta tipicamente del 10-20% dopo la pioggia e il tempo, quindi ordinarne un po\' in più è pratica comune.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.it, precision: 2 }, { name: 'tons', label: TONS_LABEL.it, precision: 2 }],
        },
        de: {
            slug: 'mutterboden-rechner', title: 'Mutterboden-Rechner', h1: 'Mutterboden-Rechner',
            meta_title: 'Mutterboden-Rechner | Kubikyards und Tonnen für Rasenflächen und Gärten',
            meta_description: 'Berechnen Sie, wie viel Mutterboden Sie für einen Rasen, ein Gartenbeet oder ein Nivellierungsprojekt benötigen, in Kubikyards und Tonnen.',
            short_answer: 'Dieser Rechner findet, wie viel Mutterboden Sie benötigen, z.B. eine Fläche von 20×15 Fuß bei 4 Zoll Tiefe = 3,70 Kubikyards, etwa 3,70 Tonnen.',
            intro_text: '<p>Geben Sie Länge, Breite und Tiefe der zu bedeckenden Fläche ein, um herauszufinden, wie viel Mutterboden Sie bestellen sollten — in Kubikyards und Tonnen.</p>',
            key_points: [
                '<b>Formel:</b> Kubikyards = (Länge × Breite × Tiefe in Zoll ÷ 12) ÷ 27; Tonnen = Kubikyards × 1,0.',
                '<b>Beispiel:</b> eine Fläche von 20×15 Fuß bei 4 Zoll Tiefe = 3,70 Kubikyards ≈ 3,70 Tonnen.',
                '<b>Dichteannahme:</b> verwendet ~1,0 Tonne pro Kubikyard, eine gängige Schätzung für losen Mutterboden — leichter als Sand oder Kies wegen des organischen Materials.',
            ],
            howto: [
                { question: 'Wie tief sollte Mutterboden für einen neuen Rasen sein?', answer: '<p>4-6 Zoll sind eine übliche Tiefe für die Anlage eines neuen Rasens aus Samen oder Rollrasen.</p>' },
                { question: 'Setzt sich Mutterboden nach dem Verteilen?', answer: '<p>Ja — loser Mutterboden setzt sich typischerweise um 10-20% nach Regen und Zeit, daher ist es üblich, etwas mehr zu bestellen.</p>' },
            ],
            inputs: [
                { name: 'length', label: LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'width', label: WIDTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '15' },
                { name: 'depth', label: DEPTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '4' },
            ],
            outputs: [{ name: 'cuyd', label: CUYD_LABEL.de, precision: 2 }, { name: 'tons', label: TONS_LABEL.de, precision: 2 }],
        },
    },
}

// ============================================================
// 1179: Paver Calculator
// ============================================================
const AREA_SQFT_INPUT_LABEL: Record<string, string> = {
    en: 'Area to Cover (sq ft)', ru: 'Площадь покрытия (кв. футы)', lv: 'Segjamā Platība (kv. pēdas)', pl: 'Powierzchnia do Pokrycia (stopy kw.)',
    es: 'Área a Cubrir (pies cuad.)', fr: 'Surface à Couvrir (pieds carrés)', it: 'Area da Coprire (piedi quad.)', de: 'Zu Bedeckende Fläche (Quadratfuß)',
}
const PAVER_LENGTH_IN_LABEL: Record<string, string> = {
    en: 'Paver Length (in)', ru: 'Длина плитки (дюймы)', lv: 'Bruģakmens Garums (collas)', pl: 'Długość Kostki (cale)',
    es: 'Largo del Adoquín (pulg.)', fr: 'Longueur du Pavé (pouces)', it: 'Lunghezza della Pavimentazione (pollici)', de: 'Pflasterstein-Länge (Zoll)',
}
const PAVER_WIDTH_IN_LABEL: Record<string, string> = {
    en: 'Paver Width (in)', ru: 'Ширина плитки (дюймы)', lv: 'Bruģakmens Platums (collas)', pl: 'Szerokość Kostki (cale)',
    es: 'Ancho del Adoquín (pulg.)', fr: 'Largeur du Pavé (pouces)', it: 'Larghezza della Pavimentazione (pollici)', de: 'Pflasterstein-Breite (Zoll)',
}
const PAVER_AREA_SQFT_LABEL: Record<string, string> = {
    en: 'Area per Paver (sq ft)', ru: 'Площадь одной плитки (кв. футы)', lv: 'Platība uz Bruģakmeni (kv. pēdas)', pl: 'Powierzchnia na Kostkę (stopy kw.)',
    es: 'Área por Adoquín (pies cuad.)', fr: 'Surface par Pavé (pieds carrés)', it: 'Area per Pavimentazione (piedi quad.)', de: 'Fläche pro Pflasterstein (Quadratfuß)',
}
const PAVERS_NEEDED_LABEL: Record<string, string> = {
    en: 'Pavers Needed (incl. 10% waste)', ru: 'Нужно плиток (с запасом 10%)', lv: 'Nepieciešami Bruģakmeņi (ar 10% rezervi)', pl: 'Potrzebne Kostki (z 10% zapasem)',
    es: 'Adoquines Necesarios (con 10% de margen)', fr: 'Pavés Nécessaires (avec 10% de marge)', it: 'Pavimentazione Necessaria (con 10% di scarto)', de: 'Benötigte Pflastersteine (inkl. 10% Verschnitt)',
}

const paverCalculatorTool: ToolDef = {
    id: '1179',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'area', default: 200 }, { key: 'paver_length', default: 12 }, { key: 'paver_width', default: 6 }],
        functions: { result: { type: 'function', functionName: 'paverCalculator', params: { area: 'area', paver_length: 'paver_length', paver_width: 'paver_width' } } },
        outputs: [{ key: 'paver_area_sqft', precision: 3 }, { key: 'pavers_needed', precision: 0 }],
    },
    locales: {
        en: {
            slug: 'paver-calculator', title: 'Paver Calculator', h1: 'Paver Calculator',
            meta_title: 'Paver Calculator | How Many Pavers Do I Need?',
            meta_description: 'Calculate how many pavers you need for a patio or walkway based on the area and paver size, including a 10% waste allowance.',
            short_answer: 'This calculator finds how many pavers you need, e.g. 200 sq ft covered with 12×6 in pavers = 440 pavers (including 10% waste).',
            intro_text: '<p>Enter the total area you\'re covering and the size of a single paver to find how many pavers to buy — the result includes a standard 10% allowance for cuts and waste.</p>',
            key_points: [
                '<b>Formula:</b> Area per Paver = (Paver Length × Paver Width in inches) ÷ 144; Pavers Needed = (Area × 1.10) ÷ Area per Paver, rounded up.',
                '<b>Example:</b> a 200 sq ft patio with 12×6 in pavers (0.5 sq ft each) needs 440 pavers with the 10% waste allowance.',
                '<b>Why add 10%?</b> cutting pavers around edges and curves always creates some waste, so ordering extra avoids running short mid-project.',
            ],
            howto: [
                { question: 'Why include a waste allowance?', answer: '<p>Real-world layouts rarely use every paver whole — cuts around borders, corners, and obstacles waste material, so a 10% buffer is standard practice.</p>' },
                { question: 'Does this account for the gaps between pavers (joints)?', answer: '<p>No — this estimate assumes pavers are laid edge-to-edge; if you use wide sand joints, you may need slightly fewer pavers than calculated.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.en, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.en, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.en, precision: 0 }],
        },
        ru: {
            slug: 'kalkulyator-trotuarnoy-plitki', title: 'Калькулятор тротуарной плитки', h1: 'Калькулятор тротуарной плитки',
            meta_title: 'Калькулятор тротуарной плитки | Сколько плитки мне нужно?',
            meta_description: 'Рассчитайте, сколько тротуарной плитки нужно для патио или дорожки, исходя из площади и размера плитки, с учётом запаса 10%.',
            short_answer: 'Этот калькулятор находит, сколько плитки нужно, например 200 кв. футов покрытия плиткой 12×6 дюймов = 440 плиток (с запасом 10%).',
            intro_text: '<p>Введите общую площадь покрытия и размер одной плитки, чтобы узнать, сколько плитки купить — результат включает стандартный запас 10% на подрезку и отходы.</p>',
            key_points: [
                '<b>Формула:</b> Площадь плитки = (Длина × Ширина плитки в дюймах) ÷ 144; Нужно плиток = (Площадь × 1,10) ÷ Площадь плитки, округление вверх.',
                '<b>Пример:</b> патио 200 кв. футов плиткой 12×6 дюймов (0,5 кв. фута каждая) требует 440 плиток с запасом 10%.',
                '<b>Зачем добавлять 10%?</b> подрезка плитки по краям и изгибам всегда создаёт отходы, поэтому запас позволяет избежать нехватки в процессе укладки.',
            ],
            howto: [
                { question: 'Зачем нужен запас на отходы?', answer: '<p>На практике редко используется каждая плитка целиком — подрезка по границам, углам и препятствиям тратит материал, поэтому запас 10% — стандартная практика.</p>' },
                { question: 'Учитываются ли швы между плитками?', answer: '<p>Нет — расчёт предполагает укладку плиток вплотную; при широких швах с песком может понадобиться немного меньше плитки.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.ru, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.ru, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.ru, precision: 0 }],
        },
        lv: {
            slug: 'brugakmens-kalkulators', title: 'Bruģakmens Kalkulators', h1: 'Bruģakmens Kalkulators',
            meta_title: 'Bruģakmens Kalkulators | Cik Bruģakmeņu Man Nepieciešams?',
            meta_description: 'Aprēķiniet, cik bruģakmeņu nepieciešams terasei vai celiņam, pamatojoties uz platību un bruģakmens izmēru, ieskaitot 10% rezervi.',
            short_answer: 'Šis kalkulators atrod, cik bruģakmeņu nepieciešams, piemēram, 200 kv. pēdu segtas ar 12×6 collu bruģakmeņiem = 440 bruģakmeņi (ieskaitot 10% rezervi).',
            intro_text: '<p>Ievadiet kopējo segjamo platību un viena bruģakmens izmēru, lai uzzinātu, cik bruģakmeņu pirkt — rezultāts ietver standarta 10% rezervi griezumiem un atkritumiem.</p>',
            key_points: [
                '<b>Formula:</b> Platība uz Bruģakmeni = (Bruģakmens Garums × Platums collās) ÷ 144; Nepieciešami Bruģakmeņi = (Platība × 1,10) ÷ Platība uz Bruģakmeni, noapaļo uz augšu.',
                '<b>Piemērs:</b> 200 kv. pēdu terase ar 12×6 collu bruģakmeņiem (0,5 kv. pēdas katrs) prasa 440 bruģakmeņus ar 10% rezervi.',
                '<b>Kāpēc pievienot 10%?</b> bruģakmeņu griešana ap malām un līkumiem vienmēr rada atkritumus, tāpēc rezerves pasūtīšana novērš trūkumu projekta vidū.',
            ],
            howto: [
                { question: 'Kāpēc iekļaut atkritumu rezervi?', answer: '<p>Reālos izkārtojumos reti tiek izmantots katrs bruģakmens vesels — griezumi ap robežām, stūriem un šķēršļiem tērē materiālu, tāpēc 10% rezerve ir standarta prakse.</p>' },
                { question: 'Vai tas ņem vērā spraugas starp bruģakmeņiem?', answer: '<p>Nē — šis novērtējums pieņem, ka bruģakmeņi tiek likti malu pie malas; ar platām smilšu spraugām var būt nepieciešams nedaudz mazāk bruģakmeņu.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.lv, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.lv, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.lv, precision: 0 }],
        },
        pl: {
            slug: 'kalkulator-kostki-brukowej', title: 'Kalkulator Kostki Brukowej', h1: 'Kalkulator Kostki Brukowej',
            meta_title: 'Kalkulator Kostki Brukowej | Ile Kostki Potrzebuję?',
            meta_description: 'Oblicz, ile kostki brukowej potrzebujesz na taras lub chodnik na podstawie powierzchni i rozmiaru kostki, wraz z 10% zapasem.',
            short_answer: 'Ten kalkulator znajduje, ile kostki potrzebujesz, np. 200 stóp kw. pokrytych kostką 12×6 cali = 440 kostek (z 10% zapasem).',
            intro_text: '<p>Wpisz całkowitą powierzchnię do pokrycia i rozmiar pojedynczej kostki, aby dowiedzieć się, ile kostki kupić — wynik zawiera standardowy 10% zapas na cięcia i odpady.</p>',
            key_points: [
                '<b>Wzór:</b> Powierzchnia na Kostkę = (Długość × Szerokość Kostki w calach) ÷ 144; Potrzebne Kostki = (Powierzchnia × 1,10) ÷ Powierzchnia na Kostkę, zaokrąglone w górę.',
                '<b>Przykład:</b> taras 200 stóp kw. z kostką 12×6 cali (0,5 stopy kw. każda) wymaga 440 kostek z 10% zapasem.',
                '<b>Dlaczego dodać 10%?</b> cięcie kostki wokół krawędzi i zakrętów zawsze tworzy odpady, więc zamówienie zapasu zapobiega brakom w trakcie projektu.',
            ],
            howto: [
                { question: 'Dlaczego uwzględnić zapas na odpady?', answer: '<p>W rzeczywistych układach rzadko wykorzystuje się każdą kostkę w całości — cięcia wokół granic, narożników i przeszkód marnują materiał, dlatego 10% zapas to standardowa praktyka.</p>' },
                { question: 'Czy to uwzględnia szczeliny między kostkami?', answer: '<p>Nie — ten szacunek zakłada układanie kostki krawędź do krawędzi; przy szerokich piaskowych fugach może być potrzebne nieco mniej kostki.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.pl, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.pl, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.pl, precision: 0 }],
        },
        es: {
            slug: 'calculadora-de-adoquines', title: 'Calculadora de Adoquines', h1: 'Calculadora de Adoquines',
            meta_title: 'Calculadora de Adoquines | ¿Cuántos Adoquines Necesito?',
            meta_description: 'Calcula cuántos adoquines necesitas para una terraza o camino según el área y el tamaño del adoquín, incluyendo un margen del 10% de desperdicio.',
            short_answer: 'Esta calculadora encuentra cuántos adoquines necesitas, p. ej. 200 pies cuad. cubiertos con adoquines de 12×6 pulg. = 440 adoquines (incluyendo 10% de margen).',
            intro_text: '<p>Introduce el área total que estás cubriendo y el tamaño de un solo adoquín para saber cuántos adoquines comprar — el resultado incluye un margen estándar del 10% para cortes y desperdicio.</p>',
            key_points: [
                '<b>Fórmula:</b> Área por Adoquín = (Largo × Ancho del Adoquín en pulgadas) ÷ 144; Adoquines Necesarios = (Área × 1.10) ÷ Área por Adoquín, redondeado hacia arriba.',
                '<b>Ejemplo:</b> una terraza de 200 pies cuad. con adoquines de 12×6 pulg. (0.5 pies cuad. cada uno) necesita 440 adoquines con el margen del 10%.',
                '<b>¿Por qué añadir 10%?</b> cortar adoquines alrededor de bordes y curvas siempre genera desperdicio, así que pedir extra evita quedarse corto a mitad del proyecto.',
            ],
            howto: [
                { question: '¿Por qué incluir un margen de desperdicio?', answer: '<p>Los diseños reales rara vez usan cada adoquín entero — los cortes alrededor de bordes, esquinas y obstáculos desperdician material, así que un margen del 10% es práctica estándar.</p>' },
                { question: '¿Esto considera las juntas entre adoquines?', answer: '<p>No — esta estimación asume que los adoquines se colocan borde con borde; si usas juntas anchas de arena, puede que necesites ligeramente menos adoquines.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.es, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.es, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.es, precision: 0 }],
        },
        fr: {
            slug: 'calculateur-de-paves', title: 'Calculateur de Pavés', h1: 'Calculateur de Pavés',
            meta_title: 'Calculateur de Pavés | Combien de Pavés Me Faut-il ?',
            meta_description: 'Calculez combien de pavés vous avez besoin pour une terrasse ou une allée selon la surface et la taille du pavé, avec une marge de 10% de perte.',
            short_answer: 'Ce calculateur trouve combien de pavés vous avez besoin, ex. 200 pieds carrés couverts avec des pavés de 12×6 pouces = 440 pavés (avec 10% de marge).',
            intro_text: '<p>Entrez la surface totale que vous couvrez et la taille d\'un seul pavé pour savoir combien de pavés acheter — le résultat inclut une marge standard de 10% pour les coupes et pertes.</p>',
            key_points: [
                '<b>Formule :</b> Surface par Pavé = (Longueur × Largeur du Pavé en pouces) ÷ 144 ; Pavés Nécessaires = (Surface × 1,10) ÷ Surface par Pavé, arrondi au supérieur.',
                '<b>Exemple :</b> une terrasse de 200 pieds carrés avec des pavés de 12×6 pouces (0,5 pied carré chacun) nécessite 440 pavés avec la marge de 10%.',
                '<b>Pourquoi ajouter 10% ?</b> couper des pavés autour des bords et des courbes crée toujours des pertes, donc commander en plus évite d\'en manquer en cours de projet.',
            ],
            howto: [
                { question: 'Pourquoi inclure une marge de perte ?', answer: '<p>Les agencements réels utilisent rarement chaque pavé entier — les coupes autour des bordures, coins et obstacles gaspillent du matériau, donc une marge de 10% est une pratique standard.</p>' },
                { question: 'Cela prend-il en compte les joints entre les pavés ?', answer: '<p>Non — cette estimation suppose que les pavés sont posés bord à bord ; avec des joints de sable larges, vous pourriez avoir besoin de légèrement moins de pavés.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.fr, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.fr, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.fr, precision: 0 }],
        },
        it: {
            slug: 'calcolatore-di-pavimentazione', title: 'Calcolatore di Pavimentazione', h1: 'Calcolatore di Pavimentazione',
            meta_title: 'Calcolatore di Pavimentazione | Quanta Pavimentazione mi Serve?',
            meta_description: 'Calcola quanta pavimentazione ti serve per un patio o un vialetto in base all\'area e alla dimensione della piastrella, includendo un margine di scarto del 10%.',
            short_answer: 'Questo calcolatore trova quanta pavimentazione ti serve, es. 200 piedi quad. coperti con piastrelle 12×6 pollici = 440 piastrelle (incluso 10% di scarto).',
            intro_text: '<p>Inserisci l\'area totale che stai coprendo e la dimensione di una singola piastrella per sapere quante piastrelle comprare — il risultato include un margine standard del 10% per tagli e scarti.</p>',
            key_points: [
                '<b>Formula:</b> Area per Piastrella = (Lunghezza × Larghezza della Piastrella in pollici) ÷ 144; Piastrelle Necessarie = (Area × 1,10) ÷ Area per Piastrella, arrotondato per eccesso.',
                '<b>Esempio:</b> un patio di 200 piedi quad. con piastrelle 12×6 pollici (0,5 piedi quad. ciascuna) richiede 440 piastrelle con il margine del 10%.',
                '<b>Perché aggiungere il 10%?</b> tagliare le piastrelle intorno a bordi e curve crea sempre scarto, quindi ordinarne di più evita di rimanere a corto a metà progetto.',
            ],
            howto: [
                { question: 'Perché includere un margine di scarto?', answer: '<p>I layout reali raramente usano ogni piastrella intera — i tagli intorno a bordi, angoli e ostacoli sprecano materiale, quindi un margine del 10% è pratica standard.</p>' },
                { question: 'Questo tiene conto delle fughe tra le piastrelle?', answer: '<p>No — questa stima presume che le piastrelle siano posate bordo a bordo; con fughe di sabbia larghe potresti aver bisogno di leggermente meno piastrelle.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.it, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.it, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.it, precision: 0 }],
        },
        de: {
            slug: 'pflaster-rechner', title: 'Pflaster-Rechner', h1: 'Pflaster-Rechner',
            meta_title: 'Pflaster-Rechner | Wie Viele Pflastersteine Brauche Ich?',
            meta_description: 'Berechnen Sie, wie viele Pflastersteine Sie für eine Terrasse oder einen Gehweg benötigen, basierend auf Fläche und Steingröße, inklusive 10% Verschnitt.',
            short_answer: 'Dieser Rechner findet, wie viele Pflastersteine Sie benötigen, z.B. 200 Quadratfuß bedeckt mit 12×6 Zoll Steinen = 440 Steine (inklusive 10% Verschnitt).',
            intro_text: '<p>Geben Sie die zu bedeckende Gesamtfläche und die Größe eines einzelnen Pflastersteins ein, um herauszufinden, wie viele Steine Sie kaufen sollten — das Ergebnis enthält einen Standardzuschlag von 10% für Schnitte und Verschnitt.</p>',
            key_points: [
                '<b>Formel:</b> Fläche pro Pflasterstein = (Länge × Breite des Steins in Zoll) ÷ 144; Benötigte Pflastersteine = (Fläche × 1,10) ÷ Fläche pro Stein, aufgerundet.',
                '<b>Beispiel:</b> eine Terrasse von 200 Quadratfuß mit 12×6 Zoll Steinen (0,5 Quadratfuß je Stein) benötigt 440 Steine mit dem 10%-Zuschlag.',
                '<b>Warum 10% hinzufügen?</b> das Schneiden von Steinen an Rändern und Kurven erzeugt immer etwas Verschnitt, daher vermeidet eine Mehrbestellung einen Engpass mitten im Projekt.',
            ],
            howto: [
                { question: 'Warum einen Verschnittzuschlag einbeziehen?', answer: '<p>Reale Verlegemuster nutzen selten jeden Stein vollständig — Schnitte an Rändern, Ecken und Hindernissen verschwenden Material, daher ist ein 10%-Puffer Standardpraxis.</p>' },
                { question: 'Berücksichtigt dies die Fugen zwischen den Steinen?', answer: '<p>Nein — diese Schätzung geht davon aus, dass die Steine Kante an Kante verlegt werden; bei breiten Sandfugen benötigen Sie möglicherweise etwas weniger Steine.</p>' },
            ],
            inputs: [
                { name: 'area', label: AREA_SQFT_INPUT_LABEL.de, type: 'number', min: 0.1, max: 1000000, placeholder: '200' },
                { name: 'paver_length', label: PAVER_LENGTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '12' },
                { name: 'paver_width', label: PAVER_WIDTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [{ name: 'paver_area_sqft', label: PAVER_AREA_SQFT_LABEL.de, precision: 3 }, { name: 'pavers_needed', label: PAVERS_NEEDED_LABEL.de, precision: 0 }],
        },
    },
}

// ============================================================
// 1180: Retaining Wall Block Calculator
// ============================================================
const WALL_LENGTH_FT_LABEL: Record<string, string> = {
    en: 'Wall Length (ft)', ru: 'Длина стены (футы)', lv: 'Sienas Garums (pēdas)', pl: 'Długość Ściany (stopy)',
    es: 'Largo del Muro (pies)', fr: 'Longueur du Mur (pieds)', it: 'Lunghezza del Muro (piedi)', de: 'Wandlänge (Fuß)',
}
const WALL_HEIGHT_FT_LABEL: Record<string, string> = {
    en: 'Wall Height (ft)', ru: 'Высота стены (футы)', lv: 'Sienas Augstums (pēdas)', pl: 'Wysokość Ściany (stopy)',
    es: 'Altura del Muro (pies)', fr: 'Hauteur du Mur (pieds)', it: 'Altezza del Muro (piedi)', de: 'Wandhöhe (Fuß)',
}
const BLOCK_LENGTH_IN_LABEL: Record<string, string> = {
    en: 'Block Length (in)', ru: 'Длина блока (дюймы)', lv: 'Bloka Garums (collas)', pl: 'Długość Bloku (cale)',
    es: 'Largo del Bloque (pulg.)', fr: 'Longueur du Bloc (pouces)', it: 'Lunghezza del Blocco (pollici)', de: 'Blocklänge (Zoll)',
}
const BLOCK_HEIGHT_IN_LABEL: Record<string, string> = {
    en: 'Block Height (in)', ru: 'Высота блока (дюймы)', lv: 'Bloka Augstums (collas)', pl: 'Wysokość Bloku (cale)',
    es: 'Altura del Bloque (pulg.)', fr: 'Hauteur du Bloc (pouces)', it: 'Altezza del Blocco (pollici)', de: 'Blockhöhe (Zoll)',
}
const WALL_AREA_SQFT_LABEL: Record<string, string> = {
    en: 'Wall Area (sq ft)', ru: 'Площадь стены (кв. футы)', lv: 'Sienas Platība (kv. pēdas)', pl: 'Powierzchnia Ściany (stopy kw.)',
    es: 'Área del Muro (pies cuad.)', fr: 'Surface du Mur (pieds carrés)', it: 'Area del Muro (piedi quad.)', de: 'Wandfläche (Quadratfuß)',
}
const BLOCK_AREA_SQFT_LABEL: Record<string, string> = {
    en: 'Area per Block (sq ft)', ru: 'Площадь одного блока (кв. футы)', lv: 'Platība uz Bloku (kv. pēdas)', pl: 'Powierzchnia na Blok (stopy kw.)',
    es: 'Área por Bloque (pies cuad.)', fr: 'Surface par Bloc (pieds carrés)', it: 'Area per Blocco (piedi quad.)', de: 'Fläche pro Block (Quadratfuß)',
}
const BLOCKS_NEEDED_LABEL: Record<string, string> = {
    en: 'Blocks Needed (incl. 5% waste)', ru: 'Нужно блоков (с запасом 5%)', lv: 'Nepieciešami Bloki (ar 5% rezervi)', pl: 'Potrzebne Bloki (z 5% zapasem)',
    es: 'Bloques Necesarios (con 5% de margen)', fr: 'Blocs Nécessaires (avec 5% de marge)', it: 'Blocchi Necessari (con 5% di scarto)', de: 'Benötigte Blöcke (inkl. 5% Verschnitt)',
}

const retainingWallBlockCalculatorTool: ToolDef = {
    id: '1180',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'wall_length', default: 20 }, { key: 'wall_height', default: 3 }, { key: 'block_length', default: 18 }, { key: 'block_height', default: 6 }],
        functions: { result: { type: 'function', functionName: 'retainingWallBlockCalculator', params: { wall_length: 'wall_length', wall_height: 'wall_height', block_length: 'block_length', block_height: 'block_height' } } },
        outputs: [{ key: 'wall_area_sqft', precision: 2 }, { key: 'block_area_sqft', precision: 3 }, { key: 'blocks_needed', precision: 0 }],
    },
    locales: {
        en: {
            slug: 'retaining-wall-block-calculator', title: 'Retaining Wall Block Calculator', h1: 'Retaining Wall Block Calculator',
            meta_title: 'Retaining Wall Block Calculator | How Many Blocks Do I Need?',
            meta_description: 'Calculate how many retaining wall blocks you need based on wall length, height, and block size, including a 5% waste allowance.',
            short_answer: 'This calculator finds how many blocks you need, e.g. a 20 ft long, 3 ft tall wall with 18×6 in blocks = 141 blocks (including 5% waste).',
            intro_text: '<p>Enter your wall\'s length and height and the size of a single block to find how many blocks to buy — the result includes a standard 5% allowance for cuts and waste.</p>',
            key_points: [
                '<b>Formula:</b> Area per Block = (Block Length × Block Height in inches) ÷ 144; Blocks Needed = (Wall Area × 1.05) ÷ Area per Block, rounded up.',
                '<b>Example:</b> a 20 ft × 3 ft wall (60 sq ft) with 18×6 in blocks (0.75 sq ft each) needs 84 blocks with the 5% waste allowance.',
                '<b>Note:</b> this estimates the visible face blocks only — it does not include base/foundation blocks, capstones, or drainage gravel behind the wall.',
            ],
            howto: [
                { question: 'Does this include the base row or capstones?', answer: '<p>No — this counts standard face blocks for the wall area only; add base course and capstones separately based on your specific block system.</p>' },
                { question: 'Why is the waste allowance smaller than for pavers?', answer: '<p>Retaining wall blocks are usually cut less often than pavers (fewer curves/edges in a typical straight or gently curved wall), so 5% is a common allowance versus 10% for pavers.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.en, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.en, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.en, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.en, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.en, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.en, precision: 0 },
            ],
        },
        ru: {
            slug: 'kalkulyator-blokov-podpornoy-steny', title: 'Калькулятор блоков подпорной стены', h1: 'Калькулятор блоков подпорной стены',
            meta_title: 'Калькулятор блоков подпорной стены | Сколько блоков мне нужно?',
            meta_description: 'Рассчитайте, сколько блоков подпорной стены нужно, исходя из длины, высоты стены и размера блока, с учётом запаса 5%.',
            short_answer: 'Этот калькулятор находит, сколько блоков нужно, например стена 20 футов длиной, 3 фута высотой с блоками 18×6 дюймов = 84 блока (с запасом 5%).',
            intro_text: '<p>Введите длину и высоту стены и размер одного блока, чтобы узнать, сколько блоков купить — результат включает стандартный запас 5% на подрезку и отходы.</p>',
            key_points: [
                '<b>Формула:</b> Площадь блока = (Длина × Высота блока в дюймах) ÷ 144; Нужно блоков = (Площадь стены × 1,05) ÷ Площадь блока, округление вверх.',
                '<b>Пример:</b> стена 20×3 фута (60 кв. футов) с блоками 18×6 дюймов (0,75 кв. фута каждый) требует 84 блока с запасом 5%.',
                '<b>Примечание:</b> это оценка только лицевых блоков — не включает базовые/фундаментные блоки, крышки или дренажный щебень за стеной.',
            ],
            howto: [
                { question: 'Учитывается ли базовый ряд или крышки?', answer: '<p>Нет — считаются только стандартные лицевые блоки для площади стены; базовый ряд и крышки добавляйте отдельно согласно вашей конкретной системе блоков.</p>' },
                { question: 'Почему запас меньше, чем для тротуарной плитки?', answer: '<p>Блоки подпорной стены обычно режут реже, чем плитку (меньше кривых/краёв в типичной прямой или слегка изогнутой стене), поэтому 5% — обычный запас против 10% для плитки.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.ru, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.ru, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.ru, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.ru, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.ru, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.ru, precision: 0 },
            ],
        },
        lv: {
            slug: 'atbalsta-sienas-bloku-kalkulators', title: 'Atbalsta Sienas Bloku Kalkulators', h1: 'Atbalsta Sienas Bloku Kalkulators',
            meta_title: 'Atbalsta Sienas Bloku Kalkulators | Cik Bloku Man Nepieciešams?',
            meta_description: 'Aprēķiniet, cik atbalsta sienas bloku nepieciešams, pamatojoties uz sienas garumu, augstumu un bloka izmēru, ieskaitot 5% rezervi.',
            short_answer: 'Šis kalkulators atrod, cik bloku nepieciešams, piemēram, 20 pēdu garai, 3 pēdu augstai sienai ar 18×6 collu blokiem = 84 bloki (ieskaitot 5% rezervi).',
            intro_text: '<p>Ievadiet sienas garumu un augstumu un viena bloka izmēru, lai uzzinātu, cik bloku pirkt — rezultāts ietver standarta 5% rezervi griezumiem un atkritumiem.</p>',
            key_points: [
                '<b>Formula:</b> Platība uz Bloku = (Bloka Garums × Augstums collās) ÷ 144; Nepieciešami Bloki = (Sienas Platība × 1,05) ÷ Platība uz Bloku, noapaļo uz augšu.',
                '<b>Piemērs:</b> 20×3 pēdu siena (60 kv. pēdas) ar 18×6 collu blokiem (0,75 kv. pēdas katrs) prasa 84 blokus ar 5% rezervi.',
                '<b>Piezīme:</b> šis novērtē tikai redzamos priekšpuses blokus — neietver pamata blokus, virsakmeņus vai drenāžas šķembas aiz sienas.',
            ],
            howto: [
                { question: 'Vai tas ietver pamata rindu vai virsakmeņus?', answer: '<p>Nē — šis skaita tikai standarta priekšpuses blokus sienas platībai; pamata rindu un virsakmeņus pievienojiet atsevišķi atbilstoši jūsu konkrētajai bloku sistēmai.</p>' },
                { question: 'Kāpēc rezerve mazāka nekā bruģakmeņiem?', answer: '<p>Atbalsta sienas blokus parasti griež retāk nekā bruģakmeņus (mazāk līkumu/malu tipiskā taisnā vai viegli izliektā sienā), tāpēc 5% ir izplatīta rezerve pretstatā 10% bruģakmeņiem.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.lv, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.lv, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.lv, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.lv, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.lv, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.lv, precision: 0 },
            ],
        },
        pl: {
            slug: 'kalkulator-blokow-muru-oporowego', title: 'Kalkulator Bloków Muru Oporowego', h1: 'Kalkulator Bloków Muru Oporowego',
            meta_title: 'Kalkulator Bloków Muru Oporowego | Ile Bloków Potrzebuję?',
            meta_description: 'Oblicz, ile bloków muru oporowego potrzebujesz na podstawie długości, wysokości ściany i rozmiaru bloku, wraz z 5% zapasem.',
            short_answer: 'Ten kalkulator znajduje, ile bloków potrzebujesz, np. ściana 20 stóp długości, 3 stopy wysokości z blokami 18×6 cali = 84 bloki (z 5% zapasem).',
            intro_text: '<p>Wpisz długość i wysokość ściany oraz rozmiar pojedynczego bloku, aby dowiedzieć się, ile bloków kupić — wynik zawiera standardowy 5% zapas na cięcia i odpady.</p>',
            key_points: [
                '<b>Wzór:</b> Powierzchnia na Blok = (Długość × Wysokość Bloku w calach) ÷ 144; Potrzebne Bloki = (Powierzchnia Ściany × 1,05) ÷ Powierzchnia na Blok, zaokrąglone w górę.',
                '<b>Przykład:</b> ściana 20×3 stopy (60 stóp kw.) z blokami 18×6 cali (0,75 stopy kw. każdy) wymaga 84 bloki z 5% zapasem.',
                '<b>Uwaga:</b> to szacuje tylko widoczne bloki licowe — nie obejmuje bloków podstawy/fundamentu, nakryw ani żwiru drenażowego za ścianą.',
            ],
            howto: [
                { question: 'Czy to obejmuje rząd podstawy lub nakrywy?', answer: '<p>Nie — to liczy tylko standardowe bloki licowe dla powierzchni ściany; rząd podstawy i nakrywy dodaj osobno zgodnie z konkretnym systemem bloków.</p>' },
                { question: 'Dlaczego zapas jest mniejszy niż dla kostki brukowej?', answer: '<p>Bloki muru oporowego zwykle tnie się rzadziej niż kostkę (mniej krzywizn/krawędzi w typowej prostej lub lekko zakrzywionej ścianie), więc 5% to powszechny zapas w porównaniu z 10% dla kostki.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.pl, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.pl, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.pl, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.pl, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.pl, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.pl, precision: 0 },
            ],
        },
        es: {
            slug: 'calculadora-de-bloques-de-muro-de-contencion', title: 'Calculadora de Bloques de Muro de Contención', h1: 'Calculadora de Bloques de Muro de Contención',
            meta_title: 'Calculadora de Bloques de Muro de Contención | ¿Cuántos Bloques Necesito?',
            meta_description: 'Calcula cuántos bloques de muro de contención necesitas según el largo, alto del muro y tamaño del bloque, incluyendo un margen del 5% de desperdicio.',
            short_answer: 'Esta calculadora encuentra cuántos bloques necesitas, p. ej. un muro de 20 pies de largo, 3 pies de alto con bloques de 18×6 pulg. = 84 bloques (incluyendo 5% de margen).',
            intro_text: '<p>Introduce el largo y alto de tu muro y el tamaño de un solo bloque para saber cuántos bloques comprar — el resultado incluye un margen estándar del 5% para cortes y desperdicio.</p>',
            key_points: [
                '<b>Fórmula:</b> Área por Bloque = (Largo × Alto del Bloque en pulgadas) ÷ 144; Bloques Necesarios = (Área del Muro × 1.05) ÷ Área por Bloque, redondeado hacia arriba.',
                '<b>Ejemplo:</b> un muro de 20×3 pies (60 pies cuad.) con bloques de 18×6 pulg. (0.75 pies cuad. cada uno) necesita 84 bloques con el margen del 5%.',
                '<b>Nota:</b> esto estima solo los bloques de cara visible — no incluye bloques base/fundación, remates, o grava de drenaje detrás del muro.',
            ],
            howto: [
                { question: '¿Esto incluye la fila base o los remates?', answer: '<p>No — esto cuenta solo los bloques de cara estándar para el área del muro; añade la hilada base y remates por separado según tu sistema de bloques específico.</p>' },
                { question: '¿Por qué el margen de desperdicio es menor que para adoquines?', answer: '<p>Los bloques de muro de contención generalmente se cortan menos que los adoquines (menos curvas/bordes en un muro típico recto o ligeramente curvado), así que 5% es un margen común frente al 10% de los adoquines.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.es, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.es, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.es, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.es, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.es, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.es, precision: 0 },
            ],
        },
        fr: {
            slug: 'calculateur-de-blocs-de-mur-de-soutenement', title: 'Calculateur de Blocs de Mur de Soutènement', h1: 'Calculateur de Blocs de Mur de Soutènement',
            meta_title: 'Calculateur de Blocs de Mur de Soutènement | Combien de Blocs Me Faut-il ?',
            meta_description: 'Calculez combien de blocs de mur de soutènement vous avez besoin selon la longueur, hauteur du mur et taille du bloc, avec une marge de 5% de perte.',
            short_answer: 'Ce calculateur trouve combien de blocs vous avez besoin, ex. un mur de 20 pieds de long, 3 pieds de haut avec des blocs de 18×6 pouces = 84 blocs (avec 5% de marge).',
            intro_text: '<p>Entrez la longueur et la hauteur de votre mur et la taille d\'un seul bloc pour savoir combien de blocs acheter — le résultat inclut une marge standard de 5% pour les coupes et pertes.</p>',
            key_points: [
                '<b>Formule :</b> Surface par Bloc = (Longueur × Hauteur du Bloc en pouces) ÷ 144 ; Blocs Nécessaires = (Surface du Mur × 1,05) ÷ Surface par Bloc, arrondi au supérieur.',
                '<b>Exemple :</b> un mur de 20×3 pieds (60 pieds carrés) avec des blocs de 18×6 pouces (0,75 pied carré chacun) nécessite 84 blocs avec la marge de 5%.',
                '<b>Remarque :</b> ceci estime uniquement les blocs de face visibles — cela n\'inclut pas les blocs de base/fondation, les couronnements, ou le gravier de drainage derrière le mur.',
            ],
            howto: [
                { question: 'Cela inclut-il la rangée de base ou les couronnements ?', answer: '<p>Non — ceci compte uniquement les blocs de face standard pour la surface du mur ; ajoutez la rangée de base et les couronnements séparément selon votre système de blocs spécifique.</p>' },
                { question: 'Pourquoi la marge de perte est-elle plus petite que pour les pavés ?', answer: '<p>Les blocs de mur de soutènement sont généralement coupés moins souvent que les pavés (moins de courbes/bords dans un mur typique droit ou légèrement courbé), donc 5% est une marge courante contre 10% pour les pavés.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.fr, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.fr, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.fr, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.fr, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.fr, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.fr, precision: 0 },
            ],
        },
        it: {
            slug: 'calcolatore-di-blocchi-per-muro-di-sostegno', title: 'Calcolatore di Blocchi per Muro di Sostegno', h1: 'Calcolatore di Blocchi per Muro di Sostegno',
            meta_title: 'Calcolatore di Blocchi per Muro di Sostegno | Quanti Blocchi mi Servono?',
            meta_description: 'Calcola quanti blocchi per muro di sostegno ti servono in base a lunghezza, altezza del muro e dimensione del blocco, includendo un margine di scarto del 5%.',
            short_answer: 'Questo calcolatore trova quanti blocchi ti servono, es. un muro lungo 20 piedi, alto 3 piedi con blocchi 18×6 pollici = 84 blocchi (incluso 5% di scarto).',
            intro_text: '<p>Inserisci lunghezza e altezza del tuo muro e la dimensione di un singolo blocco per sapere quanti blocchi comprare — il risultato include un margine standard del 5% per tagli e scarti.</p>',
            key_points: [
                '<b>Formula:</b> Area per Blocco = (Lunghezza × Altezza del Blocco in pollici) ÷ 144; Blocchi Necessari = (Area del Muro × 1,05) ÷ Area per Blocco, arrotondato per eccesso.',
                '<b>Esempio:</b> un muro 20×3 piedi (60 piedi quad.) con blocchi 18×6 pollici (0,75 piedi quad. ciascuno) richiede 84 blocchi con il margine del 5%.',
                '<b>Nota:</b> questo stima solo i blocchi della faccia visibile — non include blocchi di base/fondazione, coronamenti o ghiaia di drenaggio dietro il muro.',
            ],
            howto: [
                { question: 'Questo include la fila di base o i coronamenti?', answer: '<p>No — questo conta solo i blocchi di faccia standard per l\'area del muro; aggiungi la fila di base e i coronamenti separatamente in base al tuo specifico sistema di blocchi.</p>' },
                { question: 'Perché il margine di scarto è minore rispetto alla pavimentazione?', answer: '<p>I blocchi per muro di sostegno vengono solitamente tagliati meno spesso della pavimentazione (meno curve/bordi in un muro tipico dritto o leggermente curvo), quindi il 5% è un margine comune contro il 10% della pavimentazione.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.it, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.it, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.it, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.it, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.it, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.it, precision: 0 },
            ],
        },
        de: {
            slug: 'stuetzmauer-block-rechner', title: 'Stützmauer-Block-Rechner', h1: 'Stützmauer-Block-Rechner',
            meta_title: 'Stützmauer-Block-Rechner | Wie Viele Blöcke Brauche Ich?',
            meta_description: 'Berechnen Sie, wie viele Stützmauerblöcke Sie basierend auf Wandlänge, -höhe und Blockgröße benötigen, inklusive 5% Verschnitt.',
            short_answer: 'Dieser Rechner findet, wie viele Blöcke Sie benötigen, z.B. eine 20 Fuß lange, 3 Fuß hohe Wand mit 18×6 Zoll Blöcken = 84 Blöcke (inklusive 5% Verschnitt).',
            intro_text: '<p>Geben Sie die Länge und Höhe Ihrer Wand und die Größe eines einzelnen Blocks ein, um herauszufinden, wie viele Blöcke Sie kaufen sollten — das Ergebnis enthält einen Standardzuschlag von 5% für Schnitte und Verschnitt.</p>',
            key_points: [
                '<b>Formel:</b> Fläche pro Block = (Länge × Höhe des Blocks in Zoll) ÷ 144; Benötigte Blöcke = (Wandfläche × 1,05) ÷ Fläche pro Block, aufgerundet.',
                '<b>Beispiel:</b> eine 20×3 Fuß Wand (60 Quadratfuß) mit 18×6 Zoll Blöcken (0,75 Quadratfuß je Block) benötigt 84 Blöcke mit dem 5%-Zuschlag.',
                '<b>Hinweis:</b> dies schätzt nur die sichtbaren Frontblöcke — es enthält keine Basis-/Fundamentblöcke, Abdecksteine oder Dränagekies hinter der Wand.',
            ],
            howto: [
                { question: 'Ist die Grundreihe oder Abdecksteine enthalten?', answer: '<p>Nein — dies zählt nur Standard-Frontblöcke für die Wandfläche; fügen Sie Grundreihe und Abdecksteine separat je nach Ihrem spezifischen Blocksystem hinzu.</p>' },
                { question: 'Warum ist der Verschnittzuschlag kleiner als bei Pflastersteinen?', answer: '<p>Stützmauerblöcke werden normalerweise seltener geschnitten als Pflastersteine (weniger Kurven/Kanten bei einer typischen geraden oder leicht gebogenen Wand), daher ist 5% ein üblicher Zuschlag gegenüber 10% bei Pflastersteinen.</p>' },
            ],
            inputs: [
                { name: 'wall_length', label: WALL_LENGTH_FT_LABEL.de, type: 'number', min: 0.1, max: 100000, placeholder: '20' },
                { name: 'wall_height', label: WALL_HEIGHT_FT_LABEL.de, type: 'number', min: 0.1, max: 1000, placeholder: '3' },
                { name: 'block_length', label: BLOCK_LENGTH_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '18' },
                { name: 'block_height', label: BLOCK_HEIGHT_IN_LABEL.de, type: 'number', min: 0.1, max: 120, placeholder: '6' },
            ],
            outputs: [
                { name: 'wall_area_sqft', label: WALL_AREA_SQFT_LABEL.de, precision: 2 },
                { name: 'block_area_sqft', label: BLOCK_AREA_SQFT_LABEL.de, precision: 3 },
                { name: 'blocks_needed', label: BLOCKS_NEEDED_LABEL.de, precision: 0 },
            ],
        },
    },
}

export const tools: ToolDef[] = [
    concreteCalculatorTool, concreteBagsCalculatorTool, cubicYardsCalculatorTool, squareFootageCalculatorTool,
    gravelCalculatorTool, mulchCalculatorTool, tankCapacityCalculatorTool, roadwayFillCalculatorTool,
    sandCalculatorTool, topsoilCalculatorTool, paverCalculatorTool, retainingWallBlockCalculatorTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: CONSTRUCTION_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: CONSTRUCTION_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} construction calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
