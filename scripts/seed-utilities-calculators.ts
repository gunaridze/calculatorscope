// One-off script: seeds 12 new Utilities tools
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-utilities-calculators.ts
//
// Tool IDs 1181-1192, category_id '7' (Utilities, top-level, no parent,
// pre-seeded in all 8 locales with 0 tools). No explicit tool list was
// given, only 5 themes (SERP titles, clean URLs, text readability,
// brackets, formatting limits) for 12 tools; the concrete list was
// proposed and confirmed with the user before writing content.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const UTILITIES_CATEGORY_ID = '7'

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
// 1181: SERP Title & Meta Description Checker
// ============================================================
const TITLE_INPUT_LABEL: Record<string, string> = {
    en: 'Page Title', ru: 'Заголовок страницы', lv: 'Lapas Nosaukums', pl: 'Tytuł Strony',
    es: 'Título de Página', fr: 'Titre de Page', it: 'Titolo Pagina', de: 'Seitentitel',
}
const META_DESCRIPTION_INPUT_LABEL: Record<string, string> = {
    en: 'Meta Description', ru: 'Мета-описание', lv: 'Meta Apraksts', pl: 'Meta Opis',
    es: 'Meta Descripción', fr: 'Méta Description', it: 'Meta Descrizione', de: 'Meta-Beschreibung',
}
const TITLE_LENGTH_LABEL: Record<string, string> = {
    en: 'Title Length (characters)', ru: 'Длина заголовка (символы)', lv: 'Nosaukuma Garums (rakstzīmes)', pl: 'Długość Tytułu (znaki)',
    es: 'Longitud del Título (caracteres)', fr: 'Longueur du Titre (caractères)', it: 'Lunghezza Titolo (caratteri)', de: 'Titellänge (Zeichen)',
}
const TITLE_STATUS_LABEL: Record<string, string> = {
    en: 'Title Status', ru: 'Статус заголовка', lv: 'Nosaukuma Statuss', pl: 'Status Tytułu',
    es: 'Estado del Título', fr: 'Statut du Titre', it: 'Stato Titolo', de: 'Titel-Status',
}
const META_LENGTH_LABEL: Record<string, string> = {
    en: 'Meta Description Length (characters)', ru: 'Длина мета-описания (символы)', lv: 'Meta Apraksta Garums (rakstzīmes)', pl: 'Długość Meta Opisu (znaki)',
    es: 'Longitud de Meta Descripción (caracteres)', fr: 'Longueur de la Méta Description (caractères)', it: 'Lunghezza Meta Descrizione (caratteri)', de: 'Meta-Beschreibungslänge (Zeichen)',
}
const META_STATUS_LABEL: Record<string, string> = {
    en: 'Meta Description Status', ru: 'Статус мета-описания', lv: 'Meta Apraksta Statuss', pl: 'Status Meta Opisu',
    es: 'Estado de Meta Descripción', fr: 'Statut de la Méta Description', it: 'Stato Meta Descrizione', de: 'Meta-Beschreibungsstatus',
}

const serpSnippetCheckerTool: ToolDef = {
    id: '1181',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'title', default: 'Best Pizza Recipes for Beginners in 2026' },
            { key: 'meta_description', default: 'Learn how to make delicious homemade pizza with our step-by-step guide covering dough, sauce, toppings, and baking tips.' },
        ],
        functions: { result: { type: 'function', functionName: 'serpSnippetChecker', params: { title: 'title', meta_description: 'meta_description' } } },
        outputs: [{ key: 'title_length' }, { key: 'title_status' }, { key: 'meta_length' }, { key: 'meta_status' }],
    },
    locales: {
        en: {
            slug: 'serp-title-meta-description-checker', title: 'SERP Title & Meta Description Checker', h1: 'SERP Title & Meta Description Checker',
            meta_title: 'SERP Title & Meta Description Checker | Character Length Validator',
            meta_description: 'Check whether your page title and meta description fall within the character-length ranges Google typically displays in full on search results.',
            short_answer: 'This tool checks your title and meta description length against common SEO guidance, e.g. a 40-character title and 134-character description are both flagged "Good".',
            intro_text: '<p>Paste your page title and meta description to check their character lengths against widely-used SEO guidance for how much text Google typically displays without truncating it in search results.</p>',
            key_points: [
                '<b>Title guidance:</b> under 30 characters is flagged "Too Short", 30-60 is "Good", over 60 is "Too Long" (titles beyond ~60 characters are commonly truncated in search results).',
                '<b>Meta description guidance:</b> under 70 characters is "Too Short", 70-158 is "Good", over 158 is "Too Long".',
                '<b>Note:</b> this checks character count, not rendered pixel width — Google\'s actual truncation point varies slightly by character width and device, so treat these ranges as a helpful guideline rather than an exact cutoff.',
            ],
            howto: [
                { question: 'Why character count instead of pixel width?', answer: '<p>Pixel width varies by font and device, so character-count ranges are a simpler, widely-used approximation that works well as a general guideline.</p>' },
                { question: 'Does Google always truncate titles over 60 characters?', answer: '<p>Not always — the exact cutoff depends on the characters used and the device, but staying under ~60 characters greatly reduces the risk of truncation.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.en, type: 'text', placeholder: 'Best Pizza Recipes for Beginners in 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.en, type: 'text', placeholder: 'Learn how to make delicious homemade pizza...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.en },
                { name: 'title_status', label: TITLE_STATUS_LABEL.en },
                { name: 'meta_length', label: META_LENGTH_LABEL.en },
                { name: 'meta_status', label: META_STATUS_LABEL.en },
            ],
        },
        ru: {
            slug: 'proverka-title-i-meta-opisaniya', title: 'Проверка Title и Meta-описания', h1: 'Проверка Title и Meta-описания',
            meta_title: 'Проверка Title и Meta-описания | Валидатор длины символов',
            meta_description: 'Проверьте, укладываются ли заголовок страницы и мета-описание в диапазоны длины символов, которые Google обычно показывает полностью в результатах поиска.',
            short_answer: 'Этот инструмент проверяет длину заголовка и описания по распространённым рекомендациям SEO, например заголовок из 40 символов и описание из 134 символов помечаются как "Хорошо".',
            intro_text: '<p>Вставьте заголовок страницы и мета-описание, чтобы проверить их длину в символах по распространённым рекомендациям SEO о том, сколько текста Google обычно показывает без обрезки в результатах поиска.</p>',
            key_points: [
                '<b>Рекомендация для заголовка:</b> менее 30 символов — "Слишком короткий", 30-60 — "Хорошо", более 60 — "Слишком длинный" (заголовки длиннее ~60 символов часто обрезаются в результатах поиска).',
                '<b>Рекомендация для мета-описания:</b> менее 70 символов — "Слишком короткое", 70-158 — "Хорошо", более 158 — "Слишком длинное".',
                '<b>Примечание:</b> проверяется количество символов, а не отображаемая ширина в пикселях — фактическая точка обрезки Google немного варьируется в зависимости от ширины символов и устройства.',
            ],
            howto: [
                { question: 'Почему количество символов, а не ширина в пикселях?', answer: '<p>Ширина в пикселях зависит от шрифта и устройства, поэтому диапазоны по количеству символов — более простое и широко используемое приближение.</p>' },
                { question: 'Всегда ли Google обрезает заголовки длиннее 60 символов?', answer: '<p>Не всегда — точная граница зависит от используемых символов и устройства, но длина менее ~60 символов значительно снижает риск обрезки.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.ru, type: 'text', placeholder: 'Лучшие рецепты пиццы для начинающих в 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.ru, type: 'text', placeholder: 'Узнайте, как приготовить вкусную домашнюю пиццу...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.ru },
                { name: 'title_status', label: TITLE_STATUS_LABEL.ru },
                { name: 'meta_length', label: META_LENGTH_LABEL.ru },
                { name: 'meta_status', label: META_STATUS_LABEL.ru },
            ],
        },
        lv: {
            slug: 'serp-nosaukuma-meta-apraksta-parbaudes-riks', title: 'SERP Nosaukuma un Meta Apraksta Pārbaudes Rīks', h1: 'SERP Nosaukuma un Meta Apraksta Pārbaudes Rīks',
            meta_title: 'SERP Nosaukuma un Meta Apraksta Pārbaudes Rīks | Rakstzīmju Garuma Validators',
            meta_description: 'Pārbaudiet, vai jūsu lapas nosaukums un meta apraksts iekļaujas rakstzīmju garuma diapazonos, ko Google parasti pilnībā parāda meklēšanas rezultātos.',
            short_answer: 'Šis rīks pārbauda nosaukuma un apraksta garumu pēc izplatītām SEO vadlīnijām, piemēram, 40 rakstzīmju nosaukums un 134 rakstzīmju apraksts abi tiek atzīmēti kā "Labi".',
            intro_text: '<p>Ielīmējiet lapas nosaukumu un meta aprakstu, lai pārbaudītu to garumu rakstzīmēs pēc plaši izmantotām SEO vadlīnijām par to, cik daudz teksta Google parasti parāda bez saīsināšanas meklēšanas rezultātos.</p>',
            key_points: [
                '<b>Nosaukuma vadlīnijas:</b> mazāk par 30 rakstzīmēm ir "Par īsu", 30-60 ir "Labi", vairāk par 60 ir "Par garu" (nosaukumi virs ~60 rakstzīmēm bieži tiek saīsināti meklēšanas rezultātos).',
                '<b>Meta apraksta vadlīnijas:</b> mazāk par 70 rakstzīmēm ir "Par īsu", 70-158 ir "Labi", vairāk par 158 ir "Par garu".',
                '<b>Piezīme:</b> tiek pārbaudīts rakstzīmju skaits, nevis attēlotais platums pikseļos — Google faktiskā saīsināšanas robeža nedaudz atšķiras atkarībā no rakstzīmju platuma un ierīces.',
            ],
            howto: [
                { question: 'Kāpēc rakstzīmju skaits, nevis platums pikseļos?', answer: '<p>Platums pikseļos atšķiras atkarībā no fonta un ierīces, tāpēc rakstzīmju skaita diapazoni ir vienkāršāka, plaši izmantota aptuvena vērtība.</p>' },
                { question: 'Vai Google vienmēr saīsina nosaukumus virs 60 rakstzīmēm?', answer: '<p>Ne vienmēr — precīza robeža atkarīga no izmantotajām rakstzīmēm un ierīces, bet paliekot zem ~60 rakstzīmēm, ievērojami samazina saīsināšanas risku.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.lv, type: 'text', placeholder: 'Labākās picas receptes iesācējiem 2026. gadā' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.lv, type: 'text', placeholder: 'Uzziniet, kā pagatavot garšīgu picu mājās...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.lv },
                { name: 'title_status', label: TITLE_STATUS_LABEL.lv },
                { name: 'meta_length', label: META_LENGTH_LABEL.lv },
                { name: 'meta_status', label: META_STATUS_LABEL.lv },
            ],
        },
        pl: {
            slug: 'sprawdzanie-title-i-meta-opisu-serp', title: 'Sprawdzanie Title i Meta Opisu SERP', h1: 'Sprawdzanie Title i Meta Opisu SERP',
            meta_title: 'Sprawdzanie Title i Meta Opisu SERP | Walidator Długości Znaków',
            meta_description: 'Sprawdź, czy tytuł strony i meta opis mieszczą się w zakresach długości znaków, które Google zazwyczaj wyświetla w całości w wynikach wyszukiwania.',
            short_answer: 'To narzędzie sprawdza długość tytułu i opisu według popularnych wytycznych SEO, np. tytuł o długości 40 znaków i opis o długości 134 znaków oba są oznaczone jako "Dobrze".',
            intro_text: '<p>Wklej tytuł strony i meta opis, aby sprawdzić ich długość w znakach według powszechnie stosowanych wytycznych SEO dotyczących tego, ile tekstu Google zazwyczaj wyświetla bez obcinania w wynikach wyszukiwania.</p>',
            key_points: [
                '<b>Wytyczne dla tytułu:</b> poniżej 30 znaków to "Za Krótki", 30-60 to "Dobrze", powyżej 60 to "Za Długi" (tytuły powyżej ~60 znaków są często obcinane w wynikach wyszukiwania).',
                '<b>Wytyczne dla meta opisu:</b> poniżej 70 znaków to "Za Krótki", 70-158 to "Dobrze", powyżej 158 to "Za Długi".',
                '<b>Uwaga:</b> sprawdzana jest liczba znaków, a nie renderowana szerokość w pikselach — rzeczywisty punkt obcięcia Google nieznacznie się różni w zależności od szerokości znaków i urządzenia.',
            ],
            howto: [
                { question: 'Dlaczego liczba znaków zamiast szerokości w pikselach?', answer: '<p>Szerokość w pikselach zależy od czcionki i urządzenia, więc zakresy liczby znaków to prostsze, powszechnie stosowane przybliżenie.</p>' },
                { question: 'Czy Google zawsze obcina tytuły powyżej 60 znaków?', answer: '<p>Nie zawsze — dokładna granica zależy od użytych znaków i urządzenia, ale pozostanie poniżej ~60 znaków znacznie zmniejsza ryzyko obcięcia.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.pl, type: 'text', placeholder: 'Najlepsze przepisy na pizzę dla początkujących w 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.pl, type: 'text', placeholder: 'Dowiedz się, jak zrobić pyszną domową pizzę...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.pl },
                { name: 'title_status', label: TITLE_STATUS_LABEL.pl },
                { name: 'meta_length', label: META_LENGTH_LABEL.pl },
                { name: 'meta_status', label: META_STATUS_LABEL.pl },
            ],
        },
        es: {
            slug: 'verificador-de-titulo-y-meta-descripcion-serp', title: 'Verificador de Título y Meta Descripción SERP', h1: 'Verificador de Título y Meta Descripción SERP',
            meta_title: 'Verificador de Título y Meta Descripción SERP | Validador de Longitud de Caracteres',
            meta_description: 'Comprueba si el título de tu página y la meta descripción se ajustan a los rangos de longitud de caracteres que Google suele mostrar completos en los resultados de búsqueda.',
            short_answer: 'Esta herramienta comprueba la longitud del título y la descripción según las guías SEO comunes, p. ej. un título de 40 caracteres y una descripción de 134 caracteres se marcan ambos como "Bien".',
            intro_text: '<p>Pega el título de tu página y la meta descripción para comprobar su longitud en caracteres según las guías SEO ampliamente utilizadas sobre cuánto texto muestra Google normalmente sin truncar en los resultados de búsqueda.</p>',
            key_points: [
                '<b>Guía para el título:</b> menos de 30 caracteres es "Demasiado Corto", 30-60 es "Bien", más de 60 es "Demasiado Largo" (los títulos de más de ~60 caracteres suelen truncarse en los resultados de búsqueda).',
                '<b>Guía para la meta descripción:</b> menos de 70 caracteres es "Demasiado Corta", 70-158 es "Bien", más de 158 es "Demasiado Larga".',
                '<b>Nota:</b> esto comprueba el conteo de caracteres, no el ancho renderizado en píxeles — el punto de truncamiento real de Google varía ligeramente según el ancho de los caracteres y el dispositivo.',
            ],
            howto: [
                { question: '¿Por qué conteo de caracteres en lugar de ancho en píxeles?', answer: '<p>El ancho en píxeles varía según la fuente y el dispositivo, así que los rangos de conteo de caracteres son una aproximación más simple y ampliamente usada.</p>' },
                { question: '¿Google siempre trunca títulos de más de 60 caracteres?', answer: '<p>No siempre — el punto de corte exacto depende de los caracteres usados y el dispositivo, pero mantenerse bajo ~60 caracteres reduce mucho el riesgo de truncamiento.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.es, type: 'text', placeholder: 'Las Mejores Recetas de Pizza para Principiantes en 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.es, type: 'text', placeholder: 'Aprende a hacer una deliciosa pizza casera...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.es },
                { name: 'title_status', label: TITLE_STATUS_LABEL.es },
                { name: 'meta_length', label: META_LENGTH_LABEL.es },
                { name: 'meta_status', label: META_STATUS_LABEL.es },
            ],
        },
        fr: {
            slug: 'verificateur-de-titre-et-meta-description-serp', title: 'Vérificateur de Titre et Méta Description SERP', h1: 'Vérificateur de Titre et Méta Description SERP',
            meta_title: 'Vérificateur de Titre et Méta Description SERP | Validateur de Longueur de Caractères',
            meta_description: 'Vérifiez si le titre de votre page et la méta description respectent les plages de longueur de caractères que Google affiche généralement en entier dans les résultats de recherche.',
            short_answer: 'Cet outil vérifie la longueur du titre et de la description selon les recommandations SEO courantes, ex. un titre de 40 caractères et une description de 134 caractères sont tous deux marqués "Bien".',
            intro_text: '<p>Collez le titre de votre page et la méta description pour vérifier leur longueur en caractères selon les recommandations SEO largement utilisées sur la quantité de texte que Google affiche généralement sans troncature dans les résultats de recherche.</p>',
            key_points: [
                '<b>Recommandation pour le titre :</b> moins de 30 caractères est "Trop Court", 30-60 est "Bien", plus de 60 est "Trop Long" (les titres de plus de ~60 caractères sont souvent tronqués dans les résultats de recherche).',
                '<b>Recommandation pour la méta description :</b> moins de 70 caractères est "Trop Courte", 70-158 est "Bien", plus de 158 est "Trop Longue".',
                '<b>Remarque :</b> ceci vérifie le nombre de caractères, pas la largeur rendue en pixels — le point de troncature réel de Google varie légèrement selon la largeur des caractères et l\'appareil.',
            ],
            howto: [
                { question: 'Pourquoi le nombre de caractères plutôt que la largeur en pixels ?', answer: '<p>La largeur en pixels varie selon la police et l\'appareil, donc les plages de nombre de caractères sont une approximation plus simple et largement utilisée.</p>' },
                { question: 'Google tronque-t-il toujours les titres de plus de 60 caractères ?', answer: '<p>Pas toujours — le point de coupure exact dépend des caractères utilisés et de l\'appareil, mais rester sous ~60 caractères réduit fortement le risque de troncature.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.fr, type: 'text', placeholder: 'Meilleures Recettes de Pizza pour Débutants en 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.fr, type: 'text', placeholder: 'Apprenez à préparer une délicieuse pizza maison...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.fr },
                { name: 'title_status', label: TITLE_STATUS_LABEL.fr },
                { name: 'meta_length', label: META_LENGTH_LABEL.fr },
                { name: 'meta_status', label: META_STATUS_LABEL.fr },
            ],
        },
        it: {
            slug: 'verificatore-di-titolo-e-meta-descrizione-serp', title: 'Verificatore di Titolo e Meta Descrizione SERP', h1: 'Verificatore di Titolo e Meta Descrizione SERP',
            meta_title: 'Verificatore di Titolo e Meta Descrizione SERP | Validatore Lunghezza Caratteri',
            meta_description: 'Controlla se il titolo della tua pagina e la meta descrizione rientrano negli intervalli di lunghezza dei caratteri che Google in genere mostra per intero nei risultati di ricerca.',
            short_answer: 'Questo strumento controlla la lunghezza di titolo e descrizione secondo le linee guida SEO comuni, es. un titolo di 40 caratteri e una descrizione di 134 caratteri sono entrambi contrassegnati "Buono".',
            intro_text: '<p>Incolla il titolo della tua pagina e la meta descrizione per controllare la loro lunghezza in caratteri secondo le linee guida SEO ampiamente usate su quanto testo Google in genere mostra senza troncarlo nei risultati di ricerca.</p>',
            key_points: [
                '<b>Linee guida per il titolo:</b> meno di 30 caratteri è "Troppo Corto", 30-60 è "Buono", oltre 60 è "Troppo Lungo" (i titoli oltre ~60 caratteri sono spesso troncati nei risultati di ricerca).',
                '<b>Linee guida per la meta descrizione:</b> meno di 70 caratteri è "Troppo Corta", 70-158 è "Buono", oltre 158 è "Troppo Lunga".',
                '<b>Nota:</b> questo controlla il conteggio dei caratteri, non la larghezza renderizzata in pixel — il punto di troncamento effettivo di Google varia leggermente in base alla larghezza dei caratteri e al dispositivo.',
            ],
            howto: [
                { question: 'Perché il conteggio dei caratteri invece della larghezza in pixel?', answer: '<p>La larghezza in pixel varia in base al font e al dispositivo, quindi gli intervalli di conteggio dei caratteri sono un\'approssimazione più semplice e ampiamente usata.</p>' },
                { question: 'Google tronca sempre i titoli oltre 60 caratteri?', answer: '<p>Non sempre — il punto di taglio esatto dipende dai caratteri usati e dal dispositivo, ma rimanere sotto ~60 caratteri riduce molto il rischio di troncamento.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.it, type: 'text', placeholder: 'Le Migliori Ricette di Pizza per Principianti nel 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.it, type: 'text', placeholder: 'Scopri come preparare una deliziosa pizza fatta in casa...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.it },
                { name: 'title_status', label: TITLE_STATUS_LABEL.it },
                { name: 'meta_length', label: META_LENGTH_LABEL.it },
                { name: 'meta_status', label: META_STATUS_LABEL.it },
            ],
        },
        de: {
            slug: 'serp-title-meta-beschreibung-check', title: 'SERP-Titel & Meta-Beschreibung Prüfer', h1: 'SERP-Titel & Meta-Beschreibung Prüfer',
            meta_title: 'SERP-Titel & Meta-Beschreibung Prüfer | Zeichenlängen-Validator',
            meta_description: 'Prüfen Sie, ob Ihr Seitentitel und Ihre Meta-Beschreibung innerhalb der Zeichenlängen-Bereiche liegen, die Google in Suchergebnissen typischerweise vollständig anzeigt.',
            short_answer: 'Dieses Tool prüft die Länge von Titel und Beschreibung anhand gängiger SEO-Richtlinien, z.B. werden ein 40-Zeichen-Titel und eine 134-Zeichen-Beschreibung beide als "Gut" markiert.',
            intro_text: '<p>Fügen Sie Ihren Seitentitel und Ihre Meta-Beschreibung ein, um deren Zeichenlänge anhand weit verbreiteter SEO-Richtlinien zu prüfen, wie viel Text Google typischerweise ohne Kürzung in Suchergebnissen anzeigt.</p>',
            key_points: [
                '<b>Titel-Richtlinie:</b> unter 30 Zeichen ist "Zu Kurz", 30-60 ist "Gut", über 60 ist "Zu Lang" (Titel über ~60 Zeichen werden in Suchergebnissen häufig abgeschnitten).',
                '<b>Meta-Beschreibung-Richtlinie:</b> unter 70 Zeichen ist "Zu Kurz", 70-158 ist "Gut", über 158 ist "Zu Lang".',
                '<b>Hinweis:</b> geprüft wird die Zeichenanzahl, nicht die gerenderte Pixelbreite — der tatsächliche Abschneidepunkt von Google variiert leicht je nach Zeichenbreite und Gerät.',
            ],
            howto: [
                { question: 'Warum Zeichenanzahl statt Pixelbreite?', answer: '<p>Die Pixelbreite variiert je nach Schriftart und Gerät, daher sind Zeichenanzahl-Bereiche eine einfachere, weit verbreitete Näherung.</p>' },
                { question: 'Kürzt Google Titel über 60 Zeichen immer?', answer: '<p>Nicht immer — der genaue Abschneidepunkt hängt von den verwendeten Zeichen und dem Gerät ab, aber unter ~60 Zeichen zu bleiben verringert das Risiko deutlich.</p>' },
            ],
            inputs: [
                { name: 'title', label: TITLE_INPUT_LABEL.de, type: 'text', placeholder: 'Die Besten Pizza-Rezepte für Anfänger 2026' },
                { name: 'meta_description', label: META_DESCRIPTION_INPUT_LABEL.de, type: 'text', placeholder: 'Lernen Sie, wie man köstliche hausgemachte Pizza macht...' },
            ],
            outputs: [
                { name: 'title_length', label: TITLE_LENGTH_LABEL.de },
                { name: 'title_status', label: TITLE_STATUS_LABEL.de },
                { name: 'meta_length', label: META_LENGTH_LABEL.de },
                { name: 'meta_status', label: META_STATUS_LABEL.de },
            ],
        },
    },
}

// ============================================================
// 1182: URL Cleaner
// ============================================================
const URL_INPUT_LABEL: Record<string, string> = {
    en: 'URL to Clean', ru: 'URL для очистки', lv: 'Tīrāmais URL', pl: 'Adres URL do Wyczyszczenia',
    es: 'URL a Limpiar', fr: 'URL à Nettoyer', it: 'URL da Pulire', de: 'Zu Bereinigende URL',
}
const CLEANED_URL_LABEL: Record<string, string> = {
    en: 'Cleaned URL', ru: 'Очищенный URL', lv: 'Iztīrītais URL', pl: 'Wyczyszczony URL',
    es: 'URL Limpia', fr: 'URL Nettoyée', it: 'URL Pulito', de: 'Bereinigte URL',
}
const REMOVED_COUNT_LABEL: Record<string, string> = {
    en: 'Parameters Removed', ru: 'Удалено параметров', lv: 'Noņemtie Parametri', pl: 'Usunięte Parametry',
    es: 'Parámetros Eliminados', fr: 'Paramètres Supprimés', it: 'Parametri Rimossi', de: 'Entfernte Parameter',
}

const removeTrackingParamsTool: ToolDef = {
    id: '1182',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'url', default: 'https://example.com/page?utm_source=newsletter&utm_medium=email&id=42' }],
        functions: { result: { type: 'function', functionName: 'removeTrackingParams', params: { url: 'url' } } },
        outputs: [{ key: 'cleaned_url' }, { key: 'removed_count' }],
    },
    locales: {
        en: {
            slug: 'url-cleaner', title: 'URL Cleaner', h1: 'URL Cleaner',
            meta_title: 'URL Cleaner | Remove UTM & Tracking Parameters from a Link',
            meta_description: 'Strip UTM, click ID, and other tracking parameters from any URL to get a clean link for sharing.',
            short_answer: 'This tool strips tracking parameters from a URL, e.g. removing utm_source, utm_medium, and fbclid leaves just the clean base link.',
            intro_text: '<p>Paste any URL to strip common analytics and ad-tracking query parameters (UTM tags, click IDs, and more), leaving a clean link that\'s easier to share or read.</p>',
            key_points: [
                '<b>Removed parameters include:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid, and ref.',
                '<b>Non-tracking parameters are preserved</b> — only the known tracking parameter names above are stripped; the rest of the URL (including other query parameters) stays intact.',
                '<b>Invalid URLs:</b> if the text entered isn\'t a valid, complete URL (including the protocol, e.g. https://), the tool reports it as invalid rather than guessing.',
            ],
            howto: [
                { question: 'Why remove tracking parameters before sharing a link?', answer: '<p>Tracking parameters reveal where a link was shared from and can make URLs longer and less readable — removing them gives a cleaner link with the same destination.</p>' },
                { question: 'Will this change where the link goes?', answer: '<p>No — only tracking query parameters are removed; the destination page (the URL path) stays exactly the same.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.en, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.en }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.en }],
        },
        ru: {
            slug: 'ochistka-url', title: 'Очистка URL', h1: 'Очистка URL',
            meta_title: 'Очистка URL | Удаление UTM-меток и трекинговых параметров из ссылки',
            meta_description: 'Удалите UTM-метки, click ID и другие трекинговые параметры из любого URL, чтобы получить чистую ссылку для публикации.',
            short_answer: 'Этот инструмент удаляет трекинговые параметры из URL, например удаление utm_source, utm_medium и fbclid оставляет только чистую базовую ссылку.',
            intro_text: '<p>Вставьте любой URL, чтобы удалить распространённые аналитические и рекламные трекинговые параметры (UTM-метки, click ID и другие), оставив чистую ссылку, которую легче публиковать и читать.</p>',
            key_points: [
                '<b>Удаляемые параметры:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid и ref.',
                '<b>Не-трекинговые параметры сохраняются</b> — удаляются только известные трекинговые параметры выше; остальная часть URL (включая другие query-параметры) остаётся нетронутой.',
                '<b>Некорректные URL:</b> если введённый текст не является полным корректным URL (включая протокол, например https://), инструмент сообщает об этом, а не догадывается.',
            ],
            howto: [
                { question: 'Зачем удалять трекинговые параметры перед публикацией ссылки?', answer: '<p>Трекинговые параметры раскрывают, откуда была опубликована ссылка, и делают URL длиннее и менее читаемым — удаление даёт более чистую ссылку с тем же назначением.</p>' },
                { question: 'Изменится ли адрес перехода?', answer: '<p>Нет — удаляются только трекинговые query-параметры; страница назначения (путь URL) остаётся точно такой же.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.ru, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.ru }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.ru }],
        },
        lv: {
            slug: 'url-tiritanas-riks', title: 'URL Tīrīšanas Rīks', h1: 'URL Tīrīšanas Rīks',
            meta_title: 'URL Tīrīšanas Rīks | Noņemiet UTM un Izsekošanas Parametrus no Saites',
            meta_description: 'Noņemiet UTM, click ID un citus izsekošanas parametrus no jebkura URL, lai iegūtu tīru saiti kopīgošanai.',
            short_answer: 'Šis rīks noņem izsekošanas parametrus no URL, piemēram, noņemot utm_source, utm_medium un fbclid paliek tikai tīra pamata saite.',
            intro_text: '<p>Ielīmējiet jebkuru URL, lai noņemtu izplatītus analītikas un reklāmu izsekošanas parametrus (UTM birkas, click ID un citus), atstājot tīru saiti, ko vieglāk kopīgot un lasīt.</p>',
            key_points: [
                '<b>Noņemtie parametri ietver:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid un ref.',
                '<b>Ne-izsekošanas parametri tiek saglabāti</b> — tiek noņemti tikai iepriekš minētie zināmie izsekošanas parametru nosaukumi; pārējā URL daļa (ieskaitot citus query parametrus) paliek neskarta.',
                '<b>Nederīgi URL:</b> ja ievadītais teksts nav derīgs, pilnīgs URL (ieskaitot protokolu, piemēram, https://), rīks to atzīmē kā nederīgu, nevis mēģina uzminēt.',
            ],
            howto: [
                { question: 'Kāpēc noņemt izsekošanas parametrus pirms saites kopīgošanas?', answer: '<p>Izsekošanas parametri atklāj, no kurienes saite tika kopīgota, un padara URL garāku un mazāk lasāmu — to noņemšana dod tīrāku saiti ar to pašu galamērķi.</p>' },
                { question: 'Vai tas mainīs, kur saite ved?', answer: '<p>Nē — tiek noņemti tikai izsekošanas query parametri; galamērķa lapa (URL ceļš) paliek tieši tāda pati.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.lv, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.lv }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.lv }],
        },
        pl: {
            slug: 'czyszczenie-url', title: 'Czyszczenie URL', h1: 'Czyszczenie URL',
            meta_title: 'Czyszczenie URL | Usuń Parametry UTM i Śledzące z Linku',
            meta_description: 'Usuń parametry UTM, click ID i inne parametry śledzące z dowolnego adresu URL, aby uzyskać czysty link do udostępnienia.',
            short_answer: 'To narzędzie usuwa parametry śledzące z adresu URL, np. usunięcie utm_source, utm_medium i fbclid pozostawia tylko czysty podstawowy link.',
            intro_text: '<p>Wklej dowolny adres URL, aby usunąć popularne parametry analityczne i śledzące reklam (znaczniki UTM, click ID i inne), pozostawiając czysty link, który jest łatwiejszy do udostępnienia i odczytania.</p>',
            key_points: [
                '<b>Usuwane parametry obejmują:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid i ref.',
                '<b>Parametry inne niż śledzące są zachowywane</b> — usuwane są tylko wyżej wymienione znane nazwy parametrów śledzących; reszta adresu URL (w tym inne parametry zapytania) pozostaje nienaruszona.',
                '<b>Nieprawidłowe adresy URL:</b> jeśli wprowadzony tekst nie jest prawidłowym, pełnym adresem URL (włącznie z protokołem, np. https://), narzędzie zgłasza go jako nieprawidłowy zamiast zgadywać.',
            ],
            howto: [
                { question: 'Dlaczego usuwać parametry śledzące przed udostępnieniem linku?', answer: '<p>Parametry śledzące ujawniają, skąd link został udostępniony, i sprawiają, że adresy URL są dłuższe i mniej czytelne — ich usunięcie daje czystszy link z tym samym celem.</p>' },
                { question: 'Czy to zmieni miejsce docelowe linku?', answer: '<p>Nie — usuwane są tylko śledzące parametry zapytania; strona docelowa (ścieżka URL) pozostaje dokładnie taka sama.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.pl, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.pl }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.pl }],
        },
        es: {
            slug: 'limpiador-de-url', title: 'Limpiador de URL', h1: 'Limpiador de URL',
            meta_title: 'Limpiador de URL | Elimina Parámetros UTM y de Seguimiento de un Enlace',
            meta_description: 'Elimina parámetros UTM, ID de clic y otros parámetros de seguimiento de cualquier URL para obtener un enlace limpio para compartir.',
            short_answer: 'Esta herramienta elimina parámetros de seguimiento de una URL, p. ej. eliminar utm_source, utm_medium y fbclid deja solo el enlace base limpio.',
            intro_text: '<p>Pega cualquier URL para eliminar parámetros comunes de análisis y seguimiento de anuncios (etiquetas UTM, ID de clic y más), dejando un enlace limpio más fácil de compartir o leer.</p>',
            key_points: [
                '<b>Parámetros eliminados incluyen:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid y ref.',
                '<b>Los parámetros que no son de seguimiento se conservan</b> — solo se eliminan los nombres de parámetros de seguimiento conocidos anteriores; el resto de la URL (incluidos otros parámetros de consulta) permanece intacto.',
                '<b>URLs inválidas:</b> si el texto introducido no es una URL completa y válida (incluyendo el protocolo, p. ej. https://), la herramienta lo reporta como inválido en lugar de adivinar.',
            ],
            howto: [
                { question: '¿Por qué eliminar los parámetros de seguimiento antes de compartir un enlace?', answer: '<p>Los parámetros de seguimiento revelan desde dónde se compartió un enlace y pueden hacer que las URL sean más largas y menos legibles — eliminarlos da un enlace más limpio con el mismo destino.</p>' },
                { question: '¿Esto cambiará a dónde lleva el enlace?', answer: '<p>No — solo se eliminan los parámetros de consulta de seguimiento; la página de destino (la ruta de la URL) permanece exactamente igual.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.es, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.es }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.es }],
        },
        fr: {
            slug: 'nettoyeur-durl', title: 'Nettoyeur d\'URL', h1: 'Nettoyeur d\'URL',
            meta_title: 'Nettoyeur d\'URL | Supprimer les Paramètres UTM et de Suivi d\'un Lien',
            meta_description: 'Supprimez les paramètres UTM, ID de clic et autres paramètres de suivi de n\'importe quelle URL pour obtenir un lien propre à partager.',
            short_answer: 'Cet outil supprime les paramètres de suivi d\'une URL, ex. supprimer utm_source, utm_medium et fbclid laisse uniquement le lien de base propre.',
            intro_text: '<p>Collez n\'importe quelle URL pour supprimer les paramètres d\'analyse et de suivi publicitaire courants (balises UTM, ID de clic et plus), laissant un lien propre plus facile à partager ou à lire.</p>',
            key_points: [
                '<b>Paramètres supprimés incluent :</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid et ref.',
                '<b>Les paramètres non liés au suivi sont conservés</b> — seuls les noms de paramètres de suivi connus ci-dessus sont supprimés ; le reste de l\'URL (y compris les autres paramètres de requête) reste intact.',
                '<b>URLs invalides :</b> si le texte saisi n\'est pas une URL complète et valide (incluant le protocole, ex. https://), l\'outil le signale comme invalide plutôt que de deviner.',
            ],
            howto: [
                { question: 'Pourquoi supprimer les paramètres de suivi avant de partager un lien ?', answer: '<p>Les paramètres de suivi révèlent d\'où un lien a été partagé et peuvent rendre les URL plus longues et moins lisibles — les supprimer donne un lien plus propre avec la même destination.</p>' },
                { question: 'Cela changera-t-il la destination du lien ?', answer: '<p>Non — seuls les paramètres de requête de suivi sont supprimés ; la page de destination (le chemin de l\'URL) reste exactement la même.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.fr, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.fr }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.fr }],
        },
        it: {
            slug: 'pulitore-di-url', title: 'Pulitore di URL', h1: 'Pulitore di URL',
            meta_title: 'Pulitore di URL | Rimuovi Parametri UTM e di Tracciamento da un Link',
            meta_description: 'Rimuovi i parametri UTM, click ID e altri parametri di tracciamento da qualsiasi URL per ottenere un link pulito da condividere.',
            short_answer: 'Questo strumento rimuove i parametri di tracciamento da un URL, es. rimuovere utm_source, utm_medium e fbclid lascia solo il link base pulito.',
            intro_text: '<p>Incolla qualsiasi URL per rimuovere i comuni parametri di analisi e tracciamento pubblicitario (tag UTM, click ID e altro), lasciando un link pulito più facile da condividere o leggere.</p>',
            key_points: [
                '<b>I parametri rimossi includono:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid e ref.',
                '<b>I parametri non di tracciamento vengono preservati</b> — vengono rimossi solo i nomi dei parametri di tracciamento noti sopra elencati; il resto dell\'URL (inclusi altri parametri di query) rimane intatto.',
                '<b>URL non validi:</b> se il testo inserito non è un URL completo e valido (incluso il protocollo, es. https://), lo strumento lo segnala come non valido invece di indovinare.',
            ],
            howto: [
                { question: 'Perché rimuovere i parametri di tracciamento prima di condividere un link?', answer: '<p>I parametri di tracciamento rivelano da dove è stato condiviso un link e possono rendere gli URL più lunghi e meno leggibili — rimuoverli dà un link più pulito con la stessa destinazione.</p>' },
                { question: 'Questo cambierà dove porta il link?', answer: '<p>No — vengono rimossi solo i parametri di query di tracciamento; la pagina di destinazione (il percorso dell\'URL) rimane esattamente la stessa.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.it, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.it }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.it }],
        },
        de: {
            slug: 'url-bereiniger', title: 'URL-Bereiniger', h1: 'URL-Bereiniger',
            meta_title: 'URL-Bereiniger | UTM- und Tracking-Parameter aus einem Link Entfernen',
            meta_description: 'Entfernen Sie UTM-, Click-ID- und andere Tracking-Parameter aus einer beliebigen URL, um einen sauberen Link zum Teilen zu erhalten.',
            short_answer: 'Dieses Tool entfernt Tracking-Parameter aus einer URL, z.B. bleibt nach Entfernen von utm_source, utm_medium und fbclid nur der saubere Basislink übrig.',
            intro_text: '<p>Fügen Sie eine beliebige URL ein, um gängige Analyse- und Werbe-Tracking-Parameter (UTM-Tags, Click-IDs und mehr) zu entfernen und einen sauberen Link zu erhalten, der einfacher zu teilen oder zu lesen ist.</p>',
            key_points: [
                '<b>Entfernte Parameter umfassen:</b> utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, mc_cid, mc_eid, igshid, yclid, dclid, twclid und ref.',
                '<b>Nicht-Tracking-Parameter bleiben erhalten</b> — nur die oben genannten bekannten Tracking-Parameternamen werden entfernt; der Rest der URL (einschließlich anderer Abfrageparameter) bleibt unverändert.',
                '<b>Ungültige URLs:</b> wenn der eingegebene Text keine gültige, vollständige URL ist (einschließlich Protokoll, z.B. https://), meldet das Tool dies als ungültig, statt zu raten.',
            ],
            howto: [
                { question: 'Warum Tracking-Parameter vor dem Teilen eines Links entfernen?', answer: '<p>Tracking-Parameter verraten, woher ein Link geteilt wurde, und machen URLs länger und weniger lesbar — ihr Entfernen ergibt einen saubereren Link mit demselben Ziel.</p>' },
                { question: 'Ändert das, wohin der Link führt?', answer: '<p>Nein — es werden nur Tracking-Abfrageparameter entfernt; die Zielseite (der URL-Pfad) bleibt genau gleich.</p>' },
            ],
            inputs: [{ name: 'url', label: URL_INPUT_LABEL.de, type: 'text', placeholder: 'https://example.com/page?utm_source=newsletter&id=42' }],
            outputs: [{ name: 'cleaned_url', label: CLEANED_URL_LABEL.de }, { name: 'removed_count', label: REMOVED_COUNT_LABEL.de }],
        },
    },
}

// ============================================================
// 1183: UTM Campaign URL Builder
// ============================================================
const BASE_URL_LABEL: Record<string, string> = {
    en: 'Website URL', ru: 'URL сайта', lv: 'Vietnes URL', pl: 'Adres URL Strony',
    es: 'URL del Sitio Web', fr: 'URL du Site Web', it: 'URL del Sito Web', de: 'Website-URL',
}
const UTM_SOURCE_LABEL: Record<string, string> = {
    en: 'Campaign Source (e.g. newsletter)', ru: 'Источник кампании (например, newsletter)', lv: 'Kampaņas Avots (piem., newsletter)', pl: 'Źródło Kampanii (np. newsletter)',
    es: 'Fuente de Campaña (p. ej. newsletter)', fr: 'Source de Campagne (ex. newsletter)', it: 'Fonte Campagna (es. newsletter)', de: 'Kampagnenquelle (z.B. newsletter)',
}
const UTM_MEDIUM_LABEL: Record<string, string> = {
    en: 'Campaign Medium (e.g. email)', ru: 'Канал кампании (например, email)', lv: 'Kampaņas Kanāls (piem., email)', pl: 'Medium Kampanii (np. email)',
    es: 'Medio de Campaña (p. ej. email)', fr: 'Support de Campagne (ex. email)', it: 'Mezzo Campagna (es. email)', de: 'Kampagnenmedium (z.B. email)',
}
const UTM_CAMPAIGN_LABEL: Record<string, string> = {
    en: 'Campaign Name (e.g. spring_sale)', ru: 'Название кампании (например, spring_sale)', lv: 'Kampaņas Nosaukums (piem., spring_sale)', pl: 'Nazwa Kampanii (np. spring_sale)',
    es: 'Nombre de Campaña (p. ej. spring_sale)', fr: 'Nom de Campagne (ex. spring_sale)', it: 'Nome Campagna (es. spring_sale)', de: 'Kampagnenname (z.B. spring_sale)',
}
const UTM_TERM_LABEL: Record<string, string> = {
    en: 'Campaign Term (optional)', ru: 'Ключевое слово кампании (необязательно)', lv: 'Kampaņas Termins (nav obligāts)', pl: 'Termin Kampanii (opcjonalnie)',
    es: 'Término de Campaña (opcional)', fr: 'Terme de Campagne (facultatif)', it: 'Termine Campagna (opzionale)', de: 'Kampagnenbegriff (optional)',
}
const UTM_CONTENT_LABEL: Record<string, string> = {
    en: 'Campaign Content (optional)', ru: 'Содержание кампании (необязательно)', lv: 'Kampaņas Saturs (nav obligāts)', pl: 'Treść Kampanii (opcjonalnie)',
    es: 'Contenido de Campaña (opcional)', fr: 'Contenu de Campagne (facultatif)', it: 'Contenuto Campagna (opzionale)', de: 'Kampagneninhalt (optional)',
}
const GENERATED_URL_LABEL: Record<string, string> = {
    en: 'Generated URL', ru: 'Сгенерированный URL', lv: 'Ģenerētais URL', pl: 'Wygenerowany URL',
    es: 'URL Generada', fr: 'URL Générée', it: 'URL Generato', de: 'Generierte URL',
}

const utmUrlBuilderTool: ToolDef = {
    id: '1183',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'base_url', default: 'https://example.com/landing' },
            { key: 'source', default: 'newsletter' },
            { key: 'medium', default: 'email' },
            { key: 'campaign', default: 'spring_sale' },
            { key: 'term', default: '' },
            { key: 'content', default: '' },
        ],
        functions: { result: { type: 'function', functionName: 'utmUrlBuilder', params: { base_url: 'base_url', source: 'source', medium: 'medium', campaign: 'campaign', term: 'term', content: 'content' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'utm-campaign-url-builder', title: 'UTM Campaign URL Builder', h1: 'UTM Campaign URL Builder',
            meta_title: 'UTM Campaign URL Builder | Generate Trackable Campaign Links',
            meta_description: 'Build a UTM-tagged campaign URL for email, social, or ad campaigns so you can track traffic sources in your analytics.',
            short_answer: 'This tool builds a UTM-tagged URL, e.g. a base URL plus source "newsletter", medium "email", and campaign "spring_sale" produces a fully tagged tracking link.',
            intro_text: '<p>Enter your website URL along with campaign source, medium, and name to generate a UTM-tagged link — the standard way to track which campaigns and channels drive traffic in tools like Google Analytics.</p>',
            key_points: [
                '<b>Required fields:</b> source (utm_source), medium (utm_medium), and campaign (utm_campaign) — these three are the core tags most analytics tools rely on.',
                '<b>Optional fields:</b> term (utm_term, often used for paid search keywords) and content (utm_content, useful for A/B testing different links in the same campaign) are only added if filled in.',
                '<b>Tip:</b> keep source/medium/campaign values consistent (e.g. always lowercase, no spaces) across your campaigns so your analytics reports group them correctly.',
            ],
            howto: [
                { question: 'What\'s the difference between source and medium?', answer: '<p>Source identifies where the traffic comes from (e.g. "newsletter", "facebook"), while medium identifies the marketing channel type (e.g. "email", "cpc", "social").</p>' },
                { question: 'Do I need to fill in term and content?', answer: '<p>No — they\'re optional and mainly useful for paid search keyword tracking (term) or distinguishing multiple links/creatives within one campaign (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.en, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.en, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.en, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.en, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.en, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.en, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.en }],
        },
        ru: {
            slug: 'konstruktor-utm-ssylok', title: 'Конструктор UTM-ссылок', h1: 'Конструктор UTM-ссылок',
            meta_title: 'Конструктор UTM-ссылок | Генерация отслеживаемых ссылок для кампаний',
            meta_description: 'Постройте URL с UTM-метками для email, соцсетей или рекламных кампаний, чтобы отслеживать источники трафика в аналитике.',
            short_answer: 'Этот инструмент создаёт URL с UTM-метками, например базовый URL плюс источник "newsletter", канал "email" и кампания "spring_sale" дают полностью размеченную ссылку.',
            intro_text: '<p>Введите URL вашего сайта вместе с источником, каналом и названием кампании, чтобы сгенерировать ссылку с UTM-метками — стандартный способ отслеживать, какие кампании и каналы приводят трафик, например в Google Analytics.</p>',
            key_points: [
                '<b>Обязательные поля:</b> источник (utm_source), канал (utm_medium) и кампания (utm_campaign) — эти три основные метки, на которые опираются большинство инструментов аналитики.',
                '<b>Необязательные поля:</b> ключевое слово (utm_term, часто используется для платного поиска) и содержание (utm_content, полезно для A/B-тестирования разных ссылок в одной кампании) добавляются только если заполнены.',
                '<b>Совет:</b> сохраняйте единообразие значений источник/канал/кампания (например, всегда в нижнем регистре, без пробелов) во всех кампаниях, чтобы отчёты аналитики группировали их правильно.',
            ],
            howto: [
                { question: 'В чём разница между источником и каналом?', answer: '<p>Источник определяет, откуда пришёл трафик (например, "newsletter", "facebook"), а канал определяет тип маркетингового канала (например, "email", "cpc", "social").</p>' },
                { question: 'Нужно ли заполнять ключевое слово и содержание?', answer: '<p>Нет — они необязательны и в основном полезны для отслеживания ключевых слов платного поиска (term) или различения нескольких ссылок/креативов в одной кампании (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.ru, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.ru, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.ru, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.ru, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.ru, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.ru, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.ru }],
        },
        lv: {
            slug: 'utm-kampanas-url-veidotajs', title: 'UTM Kampaņas URL Veidotājs', h1: 'UTM Kampaņas URL Veidotājs',
            meta_title: 'UTM Kampaņas URL Veidotājs | Ģenerējiet Izsekojamas Kampaņas Saites',
            meta_description: 'Izveidojiet UTM marķētu kampaņas URL e-pastam, sociālajiem tīkliem vai reklāmas kampaņām, lai izsekotu trafika avotus jūsu analītikā.',
            short_answer: 'Šis rīks izveido UTM marķētu URL, piemēram, bāzes URL plus avots "newsletter", kanāls "email" un kampaņa "spring_sale" veido pilnībā marķētu izsekošanas saiti.',
            intro_text: '<p>Ievadiet savas vietnes URL kopā ar kampaņas avotu, kanālu un nosaukumu, lai ģenerētu UTM marķētu saiti — standarta veidu, kā izsekot, kuras kampaņas un kanāli rada trafiku tādos rīkos kā Google Analytics.</p>',
            key_points: [
                '<b>Obligātie lauki:</b> avots (utm_source), kanāls (utm_medium) un kampaņa (utm_campaign) — šīs trīs ir galvenās birkas, uz kurām paļaujas lielākā daļa analītikas rīku.',
                '<b>Neobligātie lauki:</b> termins (utm_term, bieži izmantots apmaksātās meklēšanas atslēgvārdiem) un saturs (utm_content, noderīgs dažādu saišu A/B testēšanai vienā kampaņā) tiek pievienoti tikai tad, ja aizpildīti.',
                '<b>Padoms:</b> saglabājiet avots/kanāls/kampaņa vērtības konsekventas (piem., vienmēr mazie burti, bez atstarpēm) visās kampaņās, lai analītikas atskaites tos pareizi grupētu.',
            ],
            howto: [
                { question: 'Kāda ir atšķirība starp avotu un kanālu?', answer: '<p>Avots identificē, no kurienes nāk trafiks (piem., "newsletter", "facebook"), bet kanāls identificē mārketinga kanāla veidu (piem., "email", "cpc", "social").</p>' },
                { question: 'Vai man jāaizpilda termins un saturs?', answer: '<p>Nē — tie ir neobligāti un galvenokārt noderīgi apmaksātās meklēšanas atslēgvārdu izsekošanai (term) vai vairāku saišu/kreatīvu atšķiršanai vienā kampaņā (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.lv, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.lv, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.lv, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.lv, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.lv, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.lv, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.lv }],
        },
        pl: {
            slug: 'kreator-adresow-url-utm', title: 'Kreator Adresów URL UTM', h1: 'Kreator Adresów URL UTM',
            meta_title: 'Kreator Adresów URL UTM | Generuj Śledzalne Linki Kampanii',
            meta_description: 'Zbuduj adres URL kampanii ze znacznikami UTM dla e-mail, social media lub kampanii reklamowych, aby śledzić źródła ruchu w analityce.',
            short_answer: 'To narzędzie tworzy adres URL ze znacznikami UTM, np. podstawowy URL plus źródło "newsletter", medium "email" i kampania "spring_sale" tworzą w pełni oznaczony link śledzący.',
            intro_text: '<p>Wprowadź adres URL swojej strony wraz ze źródłem, medium i nazwą kampanii, aby wygenerować link ze znacznikami UTM — standardowy sposób śledzenia, które kampanie i kanały generują ruch w narzędziach takich jak Google Analytics.</p>',
            key_points: [
                '<b>Pola wymagane:</b> źródło (utm_source), medium (utm_medium) i kampania (utm_campaign) — te trzy to podstawowe znaczniki, na których polega większość narzędzi analitycznych.',
                '<b>Pola opcjonalne:</b> termin (utm_term, często używany dla słów kluczowych płatnego wyszukiwania) i treść (utm_content, przydatna do testów A/B różnych linków w tej samej kampanii) są dodawane tylko jeśli wypełnione.',
                '<b>Wskazówka:</b> zachowuj spójność wartości źródło/medium/kampania (np. zawsze małe litery, bez spacji) we wszystkich kampaniach, aby raporty analityczne poprawnie je grupowały.',
            ],
            howto: [
                { question: 'Jaka jest różnica między źródłem a medium?', answer: '<p>Źródło identyfikuje, skąd pochodzi ruch (np. "newsletter", "facebook"), a medium identyfikuje typ kanału marketingowego (np. "email", "cpc", "social").</p>' },
                { question: 'Czy muszę wypełnić termin i treść?', answer: '<p>Nie — są opcjonalne i głównie przydatne do śledzenia słów kluczowych płatnego wyszukiwania (term) lub rozróżniania wielu linków/kreacji w jednej kampanii (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.pl, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.pl, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.pl, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.pl, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.pl, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.pl, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.pl }],
        },
        es: {
            slug: 'creador-de-urls-utm', title: 'Creador de URLs UTM', h1: 'Creador de URLs UTM',
            meta_title: 'Creador de URLs UTM | Genera Enlaces de Campaña Rastreables',
            meta_description: 'Crea una URL de campaña con etiquetas UTM para email, redes sociales o campañas publicitarias para rastrear fuentes de tráfico en tu analítica.',
            short_answer: 'Esta herramienta crea una URL con etiquetas UTM, p. ej. una URL base más fuente "newsletter", medio "email" y campaña "spring_sale" produce un enlace de seguimiento totalmente etiquetado.',
            intro_text: '<p>Introduce la URL de tu sitio web junto con la fuente, medio y nombre de campaña para generar un enlace con etiquetas UTM — la forma estándar de rastrear qué campañas y canales generan tráfico en herramientas como Google Analytics.</p>',
            key_points: [
                '<b>Campos requeridos:</b> fuente (utm_source), medio (utm_medium) y campaña (utm_campaign) — estas tres son las etiquetas principales en las que se basan la mayoría de las herramientas de análisis.',
                '<b>Campos opcionales:</b> término (utm_term, usado a menudo para palabras clave de búsqueda de pago) y contenido (utm_content, útil para pruebas A/B de diferentes enlaces en la misma campaña) solo se añaden si se completan.',
                '<b>Consejo:</b> mantén los valores fuente/medio/campaña consistentes (p. ej. siempre en minúsculas, sin espacios) en todas tus campañas para que tus informes de análisis los agrupen correctamente.',
            ],
            howto: [
                { question: '¿Cuál es la diferencia entre fuente y medio?', answer: '<p>La fuente identifica de dónde proviene el tráfico (p. ej. "newsletter", "facebook"), mientras que el medio identifica el tipo de canal de marketing (p. ej. "email", "cpc", "social").</p>' },
                { question: '¿Necesito rellenar término y contenido?', answer: '<p>No — son opcionales y principalmente útiles para el seguimiento de palabras clave de búsqueda de pago (term) o para distinguir varios enlaces/creatividades dentro de una campaña (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.es, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.es, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.es, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.es, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.es, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.es, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.es }],
        },
        fr: {
            slug: 'createur-durl-utm', title: 'Créateur d\'URL UTM', h1: 'Créateur d\'URL UTM',
            meta_title: 'Créateur d\'URL UTM | Générez des Liens de Campagne Traçables',
            meta_description: 'Créez une URL de campagne avec des balises UTM pour l\'email, les réseaux sociaux ou les campagnes publicitaires afin de suivre les sources de trafic dans vos analyses.',
            short_answer: 'Cet outil crée une URL avec des balises UTM, ex. une URL de base plus source "newsletter", support "email" et campagne "spring_sale" produit un lien de suivi entièrement balisé.',
            intro_text: '<p>Entrez l\'URL de votre site web avec la source, le support et le nom de la campagne pour générer un lien balisé UTM — la méthode standard pour suivre quelles campagnes et canaux génèrent du trafic dans des outils comme Google Analytics.</p>',
            key_points: [
                '<b>Champs requis :</b> source (utm_source), support (utm_medium) et campagne (utm_campaign) — ces trois balises principales sont utilisées par la plupart des outils d\'analyse.',
                '<b>Champs optionnels :</b> terme (utm_term, souvent utilisé pour les mots-clés de recherche payante) et contenu (utm_content, utile pour les tests A/B de différents liens dans la même campagne) ne sont ajoutés que s\'ils sont remplis.',
                '<b>Astuce :</b> gardez les valeurs source/support/campagne cohérentes (ex. toujours en minuscules, sans espaces) dans toutes vos campagnes pour que vos rapports d\'analyse les regroupent correctement.',
            ],
            howto: [
                { question: 'Quelle est la différence entre source et support ?', answer: '<p>La source identifie d\'où vient le trafic (ex. "newsletter", "facebook"), tandis que le support identifie le type de canal marketing (ex. "email", "cpc", "social").</p>' },
                { question: 'Dois-je remplir le terme et le contenu ?', answer: '<p>Non — ils sont facultatifs et principalement utiles pour le suivi des mots-clés de recherche payante (term) ou pour distinguer plusieurs liens/créations dans une même campagne (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.fr, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.fr, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.fr, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.fr, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.fr, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.fr, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.fr }],
        },
        it: {
            slug: 'costruttore-di-url-utm', title: 'Costruttore di URL UTM', h1: 'Costruttore di URL UTM',
            meta_title: 'Costruttore di URL UTM | Genera Link di Campagna Tracciabili',
            meta_description: 'Crea un URL di campagna con tag UTM per email, social o campagne pubblicitarie per tracciare le fonti di traffico nella tua analitica.',
            short_answer: 'Questo strumento crea un URL con tag UTM, es. un URL base più fonte "newsletter", mezzo "email" e campagna "spring_sale" produce un link di tracciamento completamente taggato.',
            intro_text: '<p>Inserisci l\'URL del tuo sito web insieme a fonte, mezzo e nome della campagna per generare un link con tag UTM — il modo standard per tracciare quali campagne e canali generano traffico in strumenti come Google Analytics.</p>',
            key_points: [
                '<b>Campi obbligatori:</b> fonte (utm_source), mezzo (utm_medium) e campagna (utm_campaign) — questi tre sono i tag principali su cui si basano la maggior parte degli strumenti di analisi.',
                '<b>Campi opzionali:</b> termine (utm_term, spesso usato per le parole chiave della ricerca a pagamento) e contenuto (utm_content, utile per test A/B di diversi link nella stessa campagna) vengono aggiunti solo se compilati.',
                '<b>Suggerimento:</b> mantieni i valori fonte/mezzo/campagna coerenti (es. sempre minuscolo, senza spazi) in tutte le tue campagne in modo che i tuoi report di analisi li raggruppino correttamente.',
            ],
            howto: [
                { question: 'Qual è la differenza tra fonte e mezzo?', answer: '<p>La fonte identifica da dove proviene il traffico (es. "newsletter", "facebook"), mentre il mezzo identifica il tipo di canale di marketing (es. "email", "cpc", "social").</p>' },
                { question: 'Devo compilare termine e contenuto?', answer: '<p>No — sono opzionali e principalmente utili per il tracciamento delle parole chiave di ricerca a pagamento (term) o per distinguere più link/creatività all\'interno di una campagna (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.it, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.it, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.it, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.it, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.it, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.it, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.it }],
        },
        de: {
            slug: 'utm-kampagnen-url-generator', title: 'UTM-Kampagnen-URL-Generator', h1: 'UTM-Kampagnen-URL-Generator',
            meta_title: 'UTM-Kampagnen-URL-Generator | Nachverfolgbare Kampagnen-Links Erstellen',
            meta_description: 'Erstellen Sie eine UTM-markierte Kampagnen-URL für E-Mail-, Social-Media- oder Werbekampagnen, um Traffic-Quellen in Ihrer Analyse zu verfolgen.',
            short_answer: 'Dieses Tool erstellt eine UTM-markierte URL, z.B. ergibt eine Basis-URL plus Quelle "newsletter", Medium "email" und Kampagne "spring_sale" einen vollständig markierten Tracking-Link.',
            intro_text: '<p>Geben Sie Ihre Website-URL zusammen mit Kampagnenquelle, -medium und -name ein, um einen UTM-markierten Link zu generieren — die Standardmethode, um zu verfolgen, welche Kampagnen und Kanäle Traffic in Tools wie Google Analytics erzeugen.</p>',
            key_points: [
                '<b>Pflichtfelder:</b> Quelle (utm_source), Medium (utm_medium) und Kampagne (utm_campaign) — diese drei sind die Kern-Tags, auf die sich die meisten Analyse-Tools verlassen.',
                '<b>Optionale Felder:</b> Begriff (utm_term, oft für bezahlte Suchbegriffe verwendet) und Inhalt (utm_content, nützlich zum A/B-Testen verschiedener Links innerhalb derselben Kampagne) werden nur hinzugefügt, wenn sie ausgefüllt sind.',
                '<b>Tipp:</b> halten Sie Quelle/Medium/Kampagne-Werte über alle Kampagnen hinweg konsistent (z.B. immer Kleinbuchstaben, keine Leerzeichen), damit Ihre Analyseberichte sie korrekt gruppieren.',
            ],
            howto: [
                { question: 'Was ist der Unterschied zwischen Quelle und Medium?', answer: '<p>Die Quelle identifiziert, woher der Traffic kommt (z.B. "newsletter", "facebook"), während das Medium den Marketingkanaltyp identifiziert (z.B. "email", "cpc", "social").</p>' },
                { question: 'Muss ich Begriff und Inhalt ausfüllen?', answer: '<p>Nein — sie sind optional und hauptsächlich nützlich für die Verfolgung von bezahlten Suchbegriffen (term) oder zur Unterscheidung mehrerer Links/Creatives innerhalb einer Kampagne (content).</p>' },
            ],
            inputs: [
                { name: 'base_url', label: BASE_URL_LABEL.de, type: 'text', placeholder: 'https://example.com/landing' },
                { name: 'source', label: UTM_SOURCE_LABEL.de, type: 'text', placeholder: 'newsletter' },
                { name: 'medium', label: UTM_MEDIUM_LABEL.de, type: 'text', placeholder: 'email' },
                { name: 'campaign', label: UTM_CAMPAIGN_LABEL.de, type: 'text', placeholder: 'spring_sale' },
                { name: 'term', label: UTM_TERM_LABEL.de, type: 'text', placeholder: '' },
                { name: 'content', label: UTM_CONTENT_LABEL.de, type: 'text', placeholder: '' },
            ],
            outputs: [{ name: 'result', label: GENERATED_URL_LABEL.de }],
        },
    },
}

// ============================================================
// 1184: Text Readability Score Calculator
// ============================================================
const TEXT_TO_ANALYZE_LABEL: Record<string, string> = {
    en: 'Text to Analyze', ru: 'Текст для анализа', lv: 'Analizējamais Teksts', pl: 'Tekst do Analizy',
    es: 'Texto a Analizar', fr: 'Texte à Analyser', it: 'Testo da Analizzare', de: 'Zu Analysierender Text',
}
const WORD_COUNT_LABEL: Record<string, string> = {
    en: 'Word Count', ru: 'Количество слов', lv: 'Vārdu Skaits', pl: 'Liczba Słów',
    es: 'Recuento de Palabras', fr: 'Nombre de Mots', it: 'Conteggio Parole', de: 'Wortanzahl',
}
const SENTENCE_COUNT_LABEL: Record<string, string> = {
    en: 'Sentence Count', ru: 'Количество предложений', lv: 'Teikumu Skaits', pl: 'Liczba Zdań',
    es: 'Recuento de Oraciones', fr: 'Nombre de Phrases', it: 'Conteggio Frasi', de: 'Satzanzahl',
}
const FLESCH_SCORE_LABEL: Record<string, string> = {
    en: 'Flesch Reading Ease Score', ru: 'Индекс удобочитаемости Флеша', lv: 'Flesch Lasāmības Indekss', pl: 'Wskaźnik Łatwości Czytania Flescha',
    es: 'Puntuación Flesch de Facilidad de Lectura', fr: 'Score de Facilité de Lecture Flesch', it: 'Punteggio Flesch di Facilità di Lettura', de: 'Flesch-Lesbarkeitsindex',
}
const READING_LEVEL_LABEL: Record<string, string> = {
    en: 'Reading Level', ru: 'Уровень чтения', lv: 'Lasīšanas Līmenis', pl: 'Poziom Czytelności',
    es: 'Nivel de Lectura', fr: 'Niveau de Lecture', it: 'Livello di Lettura', de: 'Lesestufe',
}

const readabilityScoreCalculatorTool: ToolDef = {
    id: '1184',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'The cat sat on the mat. It was a sunny day. Birds were singing in the trees.' }],
        functions: { result: { type: 'function', functionName: 'readabilityScoreCalculator', params: { text: 'text' } } },
        outputs: [{ key: 'word_count' }, { key: 'sentence_count' }, { key: 'flesch_reading_ease', precision: 1 }, { key: 'reading_level' }],
    },
    locales: {
        en: {
            slug: 'text-readability-score-calculator', title: 'Text Readability Score Calculator', h1: 'Text Readability Score Calculator',
            meta_title: 'Text Readability Score Calculator | Flesch Reading Ease',
            meta_description: 'Paste any text to calculate its Flesch Reading Ease score and see an estimated reading difficulty level.',
            short_answer: 'This tool calculates a Flesch Reading Ease score, e.g. simple, short sentences typically score 90-100 ("Very Easy"), while long, complex sentences score much lower.',
            intro_text: '<p>Paste a paragraph or block of text to calculate its Flesch Reading Ease score — a widely used readability metric based on average sentence length and syllables per word.</p>',
            key_points: [
                '<b>Formula:</b> 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words).',
                '<b>Score ranges:</b> 90-100 Very Easy, 80-89 Easy, 70-79 Fairly Easy, 60-69 Standard, 50-59 Fairly Difficult, 30-49 Difficult, 0-29 Very Confusing.',
                '<b>Syllable counting:</b> uses a standard vowel-group heuristic (not a dictionary lookup), so results are a close estimate rather than a phonetically perfect count.',
            ],
            howto: [
                { question: 'What reading level should I aim for?', answer: '<p>General audience web content is often written to land around "Standard" to "Fairly Easy" (roughly 60-79), though the right target depends on your specific audience.</p>' },
                { question: 'Why does the score change if I add more sentences?', answer: '<p>The score is sensitive to average sentence length and word complexity — shorter sentences and simpler (fewer-syllable) words raise the score, making text easier to read.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Paste your text here...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.en },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.en },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.en, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.en },
            ],
        },
        ru: {
            slug: 'kalkulyator-chitabelnosti-teksta', title: 'Калькулятор читабельности текста', h1: 'Калькулятор читабельности текста',
            meta_title: 'Калькулятор читабельности текста | Индекс Флеша',
            meta_description: 'Вставьте любой текст, чтобы рассчитать его индекс удобочитаемости Флеша и увидеть примерный уровень сложности чтения.',
            short_answer: 'Этот инструмент рассчитывает индекс удобочитаемости Флеша, например простые короткие предложения обычно получают 90-100 баллов ("Очень легко"), а длинные сложные предложения — намного меньше.',
            intro_text: '<p>Вставьте абзац или блок текста, чтобы рассчитать его индекс удобочитаемости Флеша — широко используемую метрику читабельности на основе средней длины предложений и количества слогов на слово.</p>',
            key_points: [
                '<b>Формула:</b> 206,835 − 1,015 × (слова ÷ предложения) − 84,6 × (слоги ÷ слова).',
                '<b>Диапазоны баллов:</b> 90-100 Очень легко, 80-89 Легко, 70-79 Довольно легко, 60-69 Стандартно, 50-59 Довольно сложно, 30-49 Сложно, 0-29 Очень запутанно.',
                '<b>Подсчёт слогов:</b> используется стандартная эвристика по группам гласных (не поиск по словарю), поэтому результат — приблизительная оценка, а не фонетически точный подсчёт.',
            ],
            howto: [
                { question: 'На какой уровень чтения стоит ориентироваться?', answer: '<p>Контент для широкой аудитории часто пишется в диапазоне "Стандартно" — "Довольно легко" (примерно 60-79), хотя правильная цель зависит от вашей конкретной аудитории.</p>' },
                { question: 'Почему балл меняется, если я добавляю больше предложений?', answer: '<p>Балл чувствителен к средней длине предложений и сложности слов — более короткие предложения и более простые (менее слоговые) слова повышают балл, делая текст легче для чтения.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Вставьте ваш текст сюда...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.ru },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.ru },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.ru, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.ru },
            ],
        },
        lv: {
            slug: 'teksta-lasamibas-kalkulators', title: 'Teksta Lasāmības Kalkulators', h1: 'Teksta Lasāmības Kalkulators',
            meta_title: 'Teksta Lasāmības Kalkulators | Flesch Lasāmības Indekss',
            meta_description: 'Ielīmējiet jebkuru tekstu, lai aprēķinātu tā Flesch lasāmības indeksu un redzētu novērtēto lasīšanas grūtības pakāpi.',
            short_answer: 'Šis rīks aprēķina Flesch lasāmības indeksu, piemēram, vienkārši, īsi teikumi parasti iegūst 90-100 punktus ("Ļoti viegli"), bet gari, sarežģīti teikumi iegūst daudz mazāk.',
            intro_text: '<p>Ielīmējiet rindkopu vai teksta bloku, lai aprēķinātu tā Flesch lasāmības indeksu — plaši izmantotu lasāmības metriku, kas balstīta uz vidējo teikuma garumu un zilbēm uz vārdu.</p>',
            key_points: [
                '<b>Formula:</b> 206,835 − 1,015 × (vārdi ÷ teikumi) − 84,6 × (zilbes ÷ vārdi).',
                '<b>Punktu diapazoni:</b> 90-100 Ļoti viegli, 80-89 Viegli, 70-79 Diezgan viegli, 60-69 Standarta, 50-59 Diezgan grūti, 30-49 Grūti, 0-29 Ļoti sarežģīti.',
                '<b>Zilbju skaitīšana:</b> izmanto standarta patskaņu grupu heiristiku (nevis vārdnīcas meklēšanu), tāpēc rezultāts ir tuvs novērtējums, nevis fonētiski precīzs skaits.',
            ],
            howto: [
                { question: 'Uz kādu lasīšanas līmeni jātiecas?', answer: '<p>Plašai auditorijai paredzēts tīmekļa saturs bieži tiek rakstīts diapazonā "Standarta" līdz "Diezgan viegli" (aptuveni 60-79), lai gan pareizais mērķis atkarīgs no jūsu konkrētās auditorijas.</p>' },
                { question: 'Kāpēc rezultāts mainās, ja pievienoju vairāk teikumu?', answer: '<p>Rezultāts ir jutīgs pret vidējo teikuma garumu un vārdu sarežģītību — īsāki teikumi un vienkāršāki (mazāk zilbju) vārdi paaugstina rezultātu, padarot tekstu vieglāk lasāmu.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ielīmējiet savu tekstu šeit...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.lv },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.lv },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.lv, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.lv },
            ],
        },
        pl: {
            slug: 'kalkulator-czytelnosci-tekstu', title: 'Kalkulator Czytelności Tekstu', h1: 'Kalkulator Czytelności Tekstu',
            meta_title: 'Kalkulator Czytelności Tekstu | Wskaźnik Flescha',
            meta_description: 'Wklej dowolny tekst, aby obliczyć jego wskaźnik łatwości czytania Flescha i zobaczyć szacowany poziom trudności czytania.',
            short_answer: 'To narzędzie oblicza wskaźnik łatwości czytania Flescha, np. proste, krótkie zdania zwykle uzyskują 90-100 punktów ("Bardzo łatwe"), podczas gdy długie, złożone zdania uzyskują znacznie mniej.',
            intro_text: '<p>Wklej akapit lub blok tekstu, aby obliczyć jego wskaźnik łatwości czytania Flescha — powszechnie stosowaną miarę czytelności opartą na średniej długości zdania i liczbie sylab na słowo.</p>',
            key_points: [
                '<b>Wzór:</b> 206,835 − 1,015 × (słowa ÷ zdania) − 84,6 × (sylaby ÷ słowa).',
                '<b>Zakresy wyników:</b> 90-100 Bardzo łatwy, 80-89 Łatwy, 70-79 Dość łatwy, 60-69 Standardowy, 50-59 Dość trudny, 30-49 Trudny, 0-29 Bardzo trudny.',
                '<b>Liczenie sylab:</b> wykorzystuje standardową heurystykę grup samogłosek (nie wyszukiwanie w słowniku), więc wynik jest przybliżeniem, a nie fonetycznie dokładnym zliczeniem.',
            ],
            howto: [
                { question: 'Do jakiego poziomu czytelności powinienem dążyć?', answer: '<p>Treści internetowe dla szerokiej publiczności są często pisane w zakresie od "Standardowy" do "Dość łatwy" (mniej więcej 60-79), choć właściwy cel zależy od konkretnej grupy odbiorców.</p>' },
                { question: 'Dlaczego wynik zmienia się, gdy dodaję więcej zdań?', answer: '<p>Wynik jest wrażliwy na średnią długość zdania i złożoność słów — krótsze zdania i prostsze (mniej sylab) słowa podnoszą wynik, czyniąc tekst łatwiejszym do czytania.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wklej tutaj swój tekst...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.pl },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.pl },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.pl, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.pl },
            ],
        },
        es: {
            slug: 'calculadora-de-legibilidad-de-texto', title: 'Calculadora de Legibilidad de Texto', h1: 'Calculadora de Legibilidad de Texto',
            meta_title: 'Calculadora de Legibilidad de Texto | Facilidad de Lectura Flesch',
            meta_description: 'Pega cualquier texto para calcular su puntuación Flesch de facilidad de lectura y ver un nivel de dificultad de lectura estimado.',
            short_answer: 'Esta herramienta calcula una puntuación Flesch de facilidad de lectura, p. ej. las oraciones simples y cortas suelen puntuar 90-100 ("Muy fácil"), mientras que las oraciones largas y complejas puntúan mucho más bajo.',
            intro_text: '<p>Pega un párrafo o bloque de texto para calcular su puntuación Flesch de facilidad de lectura — una métrica de legibilidad ampliamente utilizada basada en la longitud media de las oraciones y las sílabas por palabra.</p>',
            key_points: [
                '<b>Fórmula:</b> 206.835 − 1.015 × (palabras ÷ oraciones) − 84.6 × (sílabas ÷ palabras).',
                '<b>Rangos de puntuación:</b> 90-100 Muy Fácil, 80-89 Fácil, 70-79 Bastante Fácil, 60-69 Estándar, 50-59 Bastante Difícil, 30-49 Difícil, 0-29 Muy Confuso.',
                '<b>Conteo de sílabas:</b> usa una heurística estándar de grupos de vocales (no una búsqueda en diccionario), así que el resultado es una estimación cercana, no un conteo fonéticamente perfecto.',
            ],
            howto: [
                { question: '¿A qué nivel de lectura debo apuntar?', answer: '<p>El contenido web para audiencia general a menudo se escribe en el rango "Estándar" a "Bastante Fácil" (aproximadamente 60-79), aunque el objetivo correcto depende de tu audiencia específica.</p>' },
                { question: '¿Por qué cambia la puntuación si añado más oraciones?', answer: '<p>La puntuación es sensible a la longitud media de las oraciones y la complejidad de las palabras — oraciones más cortas y palabras más simples (menos sílabas) aumentan la puntuación, haciendo el texto más fácil de leer.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Pega tu texto aquí...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.es },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.es },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.es, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.es },
            ],
        },
        fr: {
            slug: 'calculateur-de-lisibilite-de-texte', title: 'Calculateur de Lisibilité de Texte', h1: 'Calculateur de Lisibilité de Texte',
            meta_title: 'Calculateur de Lisibilité de Texte | Facilité de Lecture Flesch',
            meta_description: 'Collez n\'importe quel texte pour calculer son score de facilité de lecture Flesch et voir un niveau de difficulté de lecture estimé.',
            short_answer: 'Cet outil calcule un score de facilité de lecture Flesch, ex. les phrases simples et courtes obtiennent généralement 90-100 ("Très facile"), tandis que les phrases longues et complexes obtiennent un score bien plus bas.',
            intro_text: '<p>Collez un paragraphe ou un bloc de texte pour calculer son score de facilité de lecture Flesch — une métrique de lisibilité largement utilisée basée sur la longueur moyenne des phrases et les syllabes par mot.</p>',
            key_points: [
                '<b>Formule :</b> 206,835 − 1,015 × (mots ÷ phrases) − 84,6 × (syllabes ÷ mots).',
                '<b>Plages de score :</b> 90-100 Très Facile, 80-89 Facile, 70-79 Assez Facile, 60-69 Standard, 50-59 Assez Difficile, 30-49 Difficile, 0-29 Très Confus.',
                '<b>Comptage des syllabes :</b> utilise une heuristique standard de groupes de voyelles (pas une recherche dans un dictionnaire), donc le résultat est une estimation proche, pas un comptage phonétiquement parfait.',
            ],
            howto: [
                { question: 'À quel niveau de lecture devrais-je viser ?', answer: '<p>Le contenu web pour un public général est souvent écrit dans la plage "Standard" à "Assez Facile" (environ 60-79), bien que la cible correcte dépende de votre public spécifique.</p>' },
                { question: 'Pourquoi le score change-t-il si j\'ajoute plus de phrases ?', answer: '<p>Le score est sensible à la longueur moyenne des phrases et à la complexité des mots — des phrases plus courtes et des mots plus simples (moins de syllabes) augmentent le score, rendant le texte plus facile à lire.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Collez votre texte ici...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.fr },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.fr },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.fr, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.fr },
            ],
        },
        it: {
            slug: 'calcolatore-di-leggibilita-del-testo', title: 'Calcolatore di Leggibilità del Testo', h1: 'Calcolatore di Leggibilità del Testo',
            meta_title: 'Calcolatore di Leggibilità del Testo | Facilità di Lettura Flesch',
            meta_description: 'Incolla qualsiasi testo per calcolare il suo punteggio Flesch di facilità di lettura e vedere un livello di difficoltà di lettura stimato.',
            short_answer: 'Questo strumento calcola un punteggio Flesch di facilità di lettura, es. frasi semplici e brevi ottengono tipicamente 90-100 punti ("Molto facile"), mentre frasi lunghe e complesse ottengono un punteggio molto più basso.',
            intro_text: '<p>Incolla un paragrafo o un blocco di testo per calcolare il suo punteggio Flesch di facilità di lettura — una metrica di leggibilità ampiamente usata basata sulla lunghezza media delle frasi e sulle sillabe per parola.</p>',
            key_points: [
                '<b>Formula:</b> 206,835 − 1,015 × (parole ÷ frasi) − 84,6 × (sillabe ÷ parole).',
                '<b>Intervalli di punteggio:</b> 90-100 Molto Facile, 80-89 Facile, 70-79 Abbastanza Facile, 60-69 Standard, 50-59 Abbastanza Difficile, 30-49 Difficile, 0-29 Molto Confuso.',
                '<b>Conteggio delle sillabe:</b> usa un\'euristica standard di gruppi vocalici (non una ricerca nel dizionario), quindi il risultato è una stima approssimativa, non un conteggio foneticamente perfetto.',
            ],
            howto: [
                { question: 'A quale livello di lettura dovrei puntare?', answer: '<p>I contenuti web per un pubblico generale sono spesso scritti nell\'intervallo "Standard" a "Abbastanza Facile" (circa 60-79), anche se l\'obiettivo corretto dipende dal tuo pubblico specifico.</p>' },
                { question: 'Perché il punteggio cambia se aggiungo più frasi?', answer: '<p>Il punteggio è sensibile alla lunghezza media delle frasi e alla complessità delle parole — frasi più brevi e parole più semplici (meno sillabe) aumentano il punteggio, rendendo il testo più facile da leggere.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Incolla qui il tuo testo...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.it },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.it },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.it, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.it },
            ],
        },
        de: {
            slug: 'textlesbarkeits-rechner', title: 'Textlesbarkeits-Rechner', h1: 'Textlesbarkeits-Rechner',
            meta_title: 'Textlesbarkeits-Rechner | Flesch-Lesbarkeitsindex',
            meta_description: 'Fügen Sie beliebigen Text ein, um seinen Flesch-Lesbarkeitsindex zu berechnen und eine geschätzte Lese-Schwierigkeitsstufe zu sehen.',
            short_answer: 'Dieses Tool berechnet einen Flesch-Lesbarkeitsindex, z.B. erzielen einfache, kurze Sätze typischerweise 90-100 Punkte ("Sehr leicht"), während lange, komplexe Sätze viel niedriger abschneiden.',
            intro_text: '<p>Fügen Sie einen Absatz oder Textblock ein, um seinen Flesch-Lesbarkeitsindex zu berechnen — eine weit verbreitete Lesbarkeitsmetrik basierend auf durchschnittlicher Satzlänge und Silben pro Wort.</p>',
            key_points: [
                '<b>Formel:</b> 206,835 − 1,015 × (Wörter ÷ Sätze) − 84,6 × (Silben ÷ Wörter).',
                '<b>Punktebereiche:</b> 90-100 Sehr Leicht, 80-89 Leicht, 70-79 Ziemlich Leicht, 60-69 Standard, 50-59 Ziemlich Schwer, 30-49 Schwer, 0-29 Sehr Verwirrend.',
                '<b>Silbenzählung:</b> verwendet eine standardmäßige Vokalgruppen-Heuristik (keine Wörterbuchsuche), daher ist das Ergebnis eine nahe Schätzung, keine phonetisch perfekte Zählung.',
            ],
            howto: [
                { question: 'Auf welche Lesestufe sollte ich abzielen?', answer: '<p>Webinhalte für ein allgemeines Publikum werden oft im Bereich "Standard" bis "Ziemlich Leicht" (etwa 60-79) geschrieben, obwohl das richtige Ziel von Ihrem spezifischen Publikum abhängt.</p>' },
                { question: 'Warum ändert sich der Wert, wenn ich mehr Sätze hinzufüge?', answer: '<p>Der Wert reagiert empfindlich auf die durchschnittliche Satzlänge und Wortkomplexität — kürzere Sätze und einfachere (silbenärmere) Wörter erhöhen den Wert und machen den Text leichter lesbar.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Fügen Sie hier Ihren Text ein...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.de },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.de },
                { name: 'flesch_reading_ease', label: FLESCH_SCORE_LABEL.de, precision: 1 },
                { name: 'reading_level', label: READING_LEVEL_LABEL.de },
            ],
        },
    },
}

// ============================================================
// 1185: Tournament Bracket Generator
// ============================================================
const TEAM_NAMES_LABEL: Record<string, string> = {
    en: 'Team Names (one per line)', ru: 'Названия команд (по одному на строку)', lv: 'Komandu Nosaukumi (viens rindā)', pl: 'Nazwy Drużyn (jedna na linię)',
    es: 'Nombres de Equipos (uno por línea)', fr: 'Noms des Équipes (un par ligne)', it: 'Nomi delle Squadre (uno per riga)', de: 'Teamnamen (einer pro Zeile)',
}
const BRACKET_RESULT_LABEL: Record<string, string> = {
    en: 'Bracket', ru: 'Турнирная сетка', lv: 'Turnīra Tabula', pl: 'Drabinka Turniejowa',
    es: 'Cuadro del Torneo', fr: 'Tableau du Tournoi', it: 'Tabellone del Torneo', de: 'Turnierbaum',
}

const tournamentBracketGeneratorTool: ToolDef = {
    id: '1185',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'team_names', default: 'Team A\nTeam B\nTeam C\nTeam D' }],
        functions: { result: { type: 'function', functionName: 'tournamentBracketGenerator', params: { team_names: 'team_names' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'tournament-bracket-generator', title: 'Tournament Bracket Generator', h1: 'Tournament Bracket Generator',
            meta_title: 'Tournament Bracket Generator | Single-Elimination Bracket Maker',
            meta_description: 'Enter a list of team names to instantly generate a single-elimination tournament bracket with all rounds and matchups.',
            short_answer: 'This tool generates a single-elimination bracket, e.g. 4 teams produce a Semifinals round followed by a Final.',
            intro_text: '<p>Type one team (or player) name per line to generate a single-elimination tournament bracket — perfect for office pools, game nights, and small competitions.</p>',
            key_points: [
                '<b>Any team count works:</b> if your count isn\'t a power of two (2, 4, 8, 16, 32...), the bracket is padded with byes, placed using standard tournament seeding so a bye is always paired against a real team rather than another bye.',
                '<b>Up to 64 teams</b> are supported per bracket.',
                '<b>Later rounds</b> reference the previous round\'s match numbers (e.g. "Winner of Round 1 Match 1") since the actual winners aren\'t known until each round is played.',
            ],
            howto: [
                { question: 'What happens if I don\'t have a power-of-two number of teams?', answer: '<p>The bracket automatically adds "bye" slots so every team is included — teams with a bye automatically advance to the next round.</p>' },
                { question: 'Does this randomize or seed the teams?', answer: '<p>Teams are placed in the order you list them, spread across the bracket using a standard seeding pattern (not randomized) so byes are distributed fairly.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.en, type: 'textarea', placeholder: 'Team A\nTeam B\nTeam C\nTeam D' }],
            outputs: [],
        },
        ru: {
            slug: 'generator-turnirnoy-setki', title: 'Генератор турнирной сетки', h1: 'Генератор турнирной сетки',
            meta_title: 'Генератор турнирной сетки | Сетка на выбывание',
            meta_description: 'Введите список названий команд, чтобы мгновенно создать турнирную сетку на выбывание со всеми раундами и парами.',
            short_answer: 'Этот инструмент создаёт турнирную сетку на выбывание, например 4 команды дают раунд полуфиналов, за которым следует финал.',
            intro_text: '<p>Введите по одной команде (или игроку) на строку, чтобы создать турнирную сетку на выбывание — идеально для офисных пулов, игровых вечеров и небольших соревнований.</p>',
            key_points: [
                '<b>Подходит любое количество команд:</b> если число не является степенью двойки (2, 4, 8, 16, 32...), сетка дополняется "пропусками" (bye), размещёнными по стандартному турнирному посеву, чтобы пропуск всегда был в паре с реальной командой, а не с другим пропуском.',
                '<b>Поддерживается до 64 команд</b> на одну сетку.',
                '<b>Последующие раунды</b> ссылаются на номера матчей предыдущего раунда (например, "Победитель Раунда 1 Матча 1"), поскольку реальные победители неизвестны до окончания раунда.',
            ],
            howto: [
                { question: 'Что будет, если число команд не является степенью двойки?', answer: '<p>Сетка автоматически добавляет слоты "bye", чтобы включить все команды — команды с "bye" автоматически проходят в следующий раунд.</p>' },
                { question: 'Рандомизирует ли это команды или производит посев?', answer: '<p>Команды размещаются в порядке, в котором вы их перечислили, распределённые по сетке по стандартному шаблону посева (не случайно), чтобы пропуски распределялись справедливо.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.ru, type: 'textarea', placeholder: 'Команда А\nКоманда Б\nКоманда В\nКоманда Г' }],
            outputs: [],
        },
        lv: {
            slug: 'turnira-tabulas-generators', title: 'Turnīra Tabulas Ģenerators', h1: 'Turnīra Tabulas Ģenerators',
            meta_title: 'Turnīra Tabulas Ģenerators | Vienas Izslēgšanas Tabulas Veidotājs',
            meta_description: 'Ievadiet komandu nosaukumu sarakstu, lai uzreiz izveidotu vienas izslēgšanas turnīra tabulu ar visiem raundiem un pāriem.',
            short_answer: 'Šis rīks ģenerē vienas izslēgšanas tabulu, piemēram, 4 komandas rada pusfinālu raundu, kam seko fināls.',
            intro_text: '<p>Ierakstiet vienu komandu (vai spēlētāju) katrā rindā, lai izveidotu vienas izslēgšanas turnīra tabulu — ideāli piemērots biroja pūliem, spēļu vakariem un mazām sacensībām.</p>',
            key_points: [
                '<b>Darbojas jebkurš komandu skaits:</b> ja skaits nav divnieka pakāpe (2, 4, 8, 16, 32...), tabula tiek papildināta ar "bye" vietām, izvietotām pēc standarta turnīra sēšanas, lai "bye" vienmēr būtu pāri ar reālu komandu, nevis citu "bye".',
                '<b>Atbalstītas līdz 64 komandām</b> vienā tabulā.',
                '<b>Vēlākie raundi</b> atsaucas uz iepriekšējā raunda spēļu numuriem (piem., "1. raunda 1. spēles uzvarētājs"), jo reālie uzvarētāji nav zināmi, kamēr raunds nav aizspēlēts.',
            ],
            howto: [
                { question: 'Kas notiek, ja man nav divnieka pakāpes skaita komandu?', answer: '<p>Tabula automātiski pievieno "bye" vietas, lai iekļautu visas komandas — komandas ar "bye" automātiski virzās uz nākamo raundu.</p>' },
                { question: 'Vai tas randomizē vai sēj komandas?', answer: '<p>Komandas tiek izvietotas sarakstā norādītajā secībā, izkliedētas pa tabulu, izmantojot standarta sēšanas modeli (nevis nejauši), lai "bye" tiktu godīgi sadalīti.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.lv, type: 'textarea', placeholder: 'Komanda A\nKomanda B\nKomanda C\nKomanda D' }],
            outputs: [],
        },
        pl: {
            slug: 'generator-drabinki-turniejowej', title: 'Generator Drabinki Turniejowej', h1: 'Generator Drabinki Turniejowej',
            meta_title: 'Generator Drabinki Turniejowej | Kreator Drabinki Pojedynczej Eliminacji',
            meta_description: 'Wprowadź listę nazw drużyn, aby natychmiast wygenerować drabinkę turniejową pojedynczej eliminacji ze wszystkimi rundami i parami.',
            short_answer: 'To narzędzie generuje drabinkę pojedynczej eliminacji, np. 4 drużyny tworzą rundę półfinałową, po której następuje finał.',
            intro_text: '<p>Wpisz jedną drużynę (lub gracza) na linię, aby wygenerować drabinkę turniejową pojedynczej eliminacji — idealną do pul biurowych, wieczorów gier i małych zawodów.</p>',
            key_points: [
                '<b>Działa dla dowolnej liczby drużyn:</b> jeśli liczba nie jest potęgą dwójki (2, 4, 8, 16, 32...), drabinka jest uzupełniana wolnymi losami, umieszczonymi zgodnie ze standardowym rozstawieniem turniejowym, tak aby wolny los zawsze był sparowany z prawdziwą drużyną, a nie innym wolnym losem.',
                '<b>Obsługiwane jest do 64 drużyn</b> na drabinkę.',
                '<b>Kolejne rundy</b> odwołują się do numerów meczów z poprzedniej rundy (np. "Zwycięzca Rundy 1 Meczu 1"), ponieważ rzeczywiści zwycięzcy nie są znani do rozegrania danej rundy.',
            ],
            howto: [
                { question: 'Co się stanie, jeśli liczba drużyn nie jest potęgą dwójki?', answer: '<p>Drabinka automatycznie dodaje wolne losy, aby uwzględnić wszystkie drużyny — drużyny z wolnym losem automatycznie awansują do następnej rundy.</p>' },
                { question: 'Czy to losuje lub rozstawia drużyny?', answer: '<p>Drużyny są umieszczane w kolejności, w jakiej je wymieniono, rozłożone po drabince przy użyciu standardowego wzorca rozstawienia (nie losowo), aby wolne losy były sprawiedliwie rozłożone.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.pl, type: 'textarea', placeholder: 'Drużyna A\nDrużyna B\nDrużyna C\nDrużyna D' }],
            outputs: [],
        },
        es: {
            slug: 'generador-de-cuadro-de-torneo', title: 'Generador de Cuadro de Torneo', h1: 'Generador de Cuadro de Torneo',
            meta_title: 'Generador de Cuadro de Torneo | Creador de Cuadro de Eliminación Simple',
            meta_description: 'Introduce una lista de nombres de equipos para generar instantáneamente un cuadro de torneo de eliminación simple con todas las rondas y enfrentamientos.',
            short_answer: 'Esta herramienta genera un cuadro de eliminación simple, p. ej. 4 equipos producen una ronda de semifinales seguida de una final.',
            intro_text: '<p>Escribe un equipo (o jugador) por línea para generar un cuadro de torneo de eliminación simple — perfecto para quinielas de oficina, noches de juegos y competiciones pequeñas.</p>',
            key_points: [
                '<b>Funciona con cualquier número de equipos:</b> si tu número no es una potencia de dos (2, 4, 8, 16, 32...), el cuadro se rellena con pases (byes), colocados usando la siembra estándar de torneo para que un pase siempre esté emparejado con un equipo real y no con otro pase.',
                '<b>Se admiten hasta 64 equipos</b> por cuadro.',
                '<b>Las rondas posteriores</b> hacen referencia a los números de partido de la ronda anterior (p. ej. "Ganador de la Ronda 1 Partido 1") ya que los ganadores reales no se conocen hasta que se juega cada ronda.',
            ],
            howto: [
                { question: '¿Qué pasa si no tengo un número de equipos que sea potencia de dos?', answer: '<p>El cuadro añade automáticamente espacios de "pase" para incluir a todos los equipos — los equipos con pase avanzan automáticamente a la siguiente ronda.</p>' },
                { question: '¿Esto aleatoriza o siembra a los equipos?', answer: '<p>Los equipos se colocan en el orden en que los listas, distribuidos por el cuadro usando un patrón de siembra estándar (no aleatorio) para que los pases se distribuyan de forma justa.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.es, type: 'textarea', placeholder: 'Equipo A\nEquipo B\nEquipo C\nEquipo D' }],
            outputs: [],
        },
        fr: {
            slug: 'generateur-de-tableau-de-tournoi', title: 'Générateur de Tableau de Tournoi', h1: 'Générateur de Tableau de Tournoi',
            meta_title: 'Générateur de Tableau de Tournoi | Créateur de Tableau à Élimination Simple',
            meta_description: 'Entrez une liste de noms d\'équipes pour générer instantanément un tableau de tournoi à élimination simple avec tous les tours et affrontements.',
            short_answer: 'Cet outil génère un tableau à élimination simple, ex. 4 équipes produisent un tour de demi-finales suivi d\'une finale.',
            intro_text: '<p>Tapez une équipe (ou un joueur) par ligne pour générer un tableau de tournoi à élimination simple — parfait pour les pronostics de bureau, les soirées jeux et les petites compétitions.</p>',
            key_points: [
                '<b>Fonctionne avec n\'importe quel nombre d\'équipes :</b> si votre nombre n\'est pas une puissance de deux (2, 4, 8, 16, 32...), le tableau est complété avec des exemptions (byes), placées selon le placement standard des tournois afin qu\'une exemption soit toujours associée à une véritable équipe plutôt qu\'à une autre exemption.',
                '<b>Jusqu\'à 64 équipes</b> sont prises en charge par tableau.',
                '<b>Les tours suivants</b> font référence aux numéros de match du tour précédent (ex. "Vainqueur du Tour 1 Match 1") car les vainqueurs réels ne sont pas connus avant que chaque tour ne soit joué.',
            ],
            howto: [
                { question: 'Que se passe-t-il si je n\'ai pas un nombre d\'équipes en puissance de deux ?', answer: '<p>Le tableau ajoute automatiquement des emplacements d\'exemption pour inclure toutes les équipes — les équipes avec une exemption avancent automatiquement au tour suivant.</p>' },
                { question: 'Cela randomise-t-il ou place-t-il les équipes ?', answer: '<p>Les équipes sont placées dans l\'ordre où vous les listez, réparties dans le tableau selon un modèle de placement standard (pas aléatoire) afin que les exemptions soient distribuées équitablement.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.fr, type: 'textarea', placeholder: 'Équipe A\nÉquipe B\nÉquipe C\nÉquipe D' }],
            outputs: [],
        },
        it: {
            slug: 'generatore-di-tabellone-torneo', title: 'Generatore di Tabellone Torneo', h1: 'Generatore di Tabellone Torneo',
            meta_title: 'Generatore di Tabellone Torneo | Creatore di Tabellone a Eliminazione Diretta',
            meta_description: 'Inserisci un elenco di nomi di squadre per generare istantaneamente un tabellone a eliminazione diretta con tutti i turni e gli scontri.',
            short_answer: 'Questo strumento genera un tabellone a eliminazione diretta, es. 4 squadre producono un turno di semifinali seguito da una finale.',
            intro_text: '<p>Digita una squadra (o giocatore) per riga per generare un tabellone a eliminazione diretta — perfetto per i pronostici in ufficio, le serate di gioco e le piccole competizioni.</p>',
            key_points: [
                '<b>Funziona con qualsiasi numero di squadre:</b> se il numero non è una potenza di due (2, 4, 8, 16, 32...), il tabellone viene riempito con dei bye, posizionati secondo la semina standard dei tornei in modo che un bye sia sempre abbinato a una squadra reale e non a un altro bye.',
                '<b>Sono supportate fino a 64 squadre</b> per tabellone.',
                '<b>I turni successivi</b> fanno riferimento ai numeri delle partite del turno precedente (es. "Vincitore del Turno 1 Partita 1") poiché i vincitori reali non sono noti finché ogni turno non viene giocato.',
            ],
            howto: [
                { question: 'Cosa succede se non ho un numero di squadre potenza di due?', answer: '<p>Il tabellone aggiunge automaticamente degli slot bye per includere tutte le squadre — le squadre con un bye avanzano automaticamente al turno successivo.</p>' },
                { question: 'Questo randomizza o semina le squadre?', answer: '<p>Le squadre vengono posizionate nell\'ordine in cui le elenchi, distribuite nel tabellone usando uno schema di semina standard (non casuale) in modo che i bye siano distribuiti equamente.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.it, type: 'textarea', placeholder: 'Squadra A\nSquadra B\nSquadra C\nSquadra D' }],
            outputs: [],
        },
        de: {
            slug: 'turnierbaum-generator', title: 'Turnierbaum-Generator', h1: 'Turnierbaum-Generator',
            meta_title: 'Turnierbaum-Generator | K.-o.-System Turnierplan Erstellen',
            meta_description: 'Geben Sie eine Liste von Teamnamen ein, um sofort einen K.-o.-System-Turnierbaum mit allen Runden und Paarungen zu erstellen.',
            short_answer: 'Dieses Tool erstellt einen K.-o.-System-Turnierbaum, z.B. ergeben 4 Teams eine Halbfinalrunde gefolgt von einem Finale.',
            intro_text: '<p>Geben Sie ein Team (oder einen Spieler) pro Zeile ein, um einen K.-o.-System-Turnierbaum zu erstellen — perfekt für Büro-Tippspiele, Spieleabende und kleine Wettbewerbe.</p>',
            key_points: [
                '<b>Jede Teamanzahl funktioniert:</b> wenn Ihre Anzahl keine Zweierpotenz ist (2, 4, 8, 16, 32...), wird der Turnierbaum mit Freilosen aufgefüllt, platziert nach standardmäßiger Turniersetzung, sodass ein Freilos immer gegen ein echtes Team und nicht gegen ein anderes Freilos gesetzt wird.',
                '<b>Bis zu 64 Teams</b> werden pro Turnierbaum unterstützt.',
                '<b>Spätere Runden</b> beziehen sich auf die Spielnummern der vorherigen Runde (z.B. "Sieger von Runde 1 Spiel 1"), da die tatsächlichen Sieger erst nach dem Austragen jeder Runde bekannt sind.',
            ],
            howto: [
                { question: 'Was passiert, wenn meine Teamanzahl keine Zweierpotenz ist?', answer: '<p>Der Turnierbaum fügt automatisch Freilos-Plätze hinzu, damit alle Teams enthalten sind — Teams mit einem Freilos rücken automatisch in die nächste Runde vor.</p>' },
                { question: 'Werden die Teams zufällig zugeordnet oder gesetzt?', answer: '<p>Die Teams werden in der von Ihnen aufgelisteten Reihenfolge platziert, verteilt über den Turnierbaum nach einem Standard-Setzmuster (nicht zufällig), sodass Freilose fair verteilt werden.</p>' },
            ],
            inputs: [{ name: 'team_names', label: TEAM_NAMES_LABEL.de, type: 'textarea', placeholder: 'Team A\nTeam B\nTeam C\nTeam D' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1186: Platform Character Limit Validator
// ============================================================
const PLATFORM_OPTIONS: Record<string, { value: string; label: string }[]> = {
    en: [
        { value: 'x_twitter', label: 'X (Twitter) Post — 280' },
        { value: 'instagram_caption', label: 'Instagram Caption — 2200' },
        { value: 'meta_description', label: 'Meta Description — 158' },
        { value: 'title_tag', label: 'Title Tag — 60' },
        { value: 'sms', label: 'SMS Text Message — 160' },
        { value: 'meta_ads_primary_text', label: 'Meta Ads Primary Text — 125' },
        { value: 'youtube_title', label: 'YouTube Title — 100' },
    ],
    ru: [
        { value: 'x_twitter', label: 'Пост в X (Twitter) — 280' },
        { value: 'instagram_caption', label: 'Подпись в Instagram — 2200' },
        { value: 'meta_description', label: 'Мета-описание — 158' },
        { value: 'title_tag', label: 'Тег Title — 60' },
        { value: 'sms', label: 'SMS-сообщение — 160' },
        { value: 'meta_ads_primary_text', label: 'Основной текст рекламы Meta — 125' },
        { value: 'youtube_title', label: 'Название видео YouTube — 100' },
    ],
    lv: [
        { value: 'x_twitter', label: 'X (Twitter) ziņa — 280' },
        { value: 'instagram_caption', label: 'Instagram paraksts — 2200' },
        { value: 'meta_description', label: 'Meta apraksts — 158' },
        { value: 'title_tag', label: 'Title birka — 60' },
        { value: 'sms', label: 'SMS ziņa — 160' },
        { value: 'meta_ads_primary_text', label: 'Meta reklāmas galvenais teksts — 125' },
        { value: 'youtube_title', label: 'YouTube nosaukums — 100' },
    ],
    pl: [
        { value: 'x_twitter', label: 'Post na X (Twitter) — 280' },
        { value: 'instagram_caption', label: 'Opis na Instagramie — 2200' },
        { value: 'meta_description', label: 'Meta Opis — 158' },
        { value: 'title_tag', label: 'Znacznik Title — 60' },
        { value: 'sms', label: 'Wiadomość SMS — 160' },
        { value: 'meta_ads_primary_text', label: 'Główny Tekst Reklamy Meta — 125' },
        { value: 'youtube_title', label: 'Tytuł YouTube — 100' },
    ],
    es: [
        { value: 'x_twitter', label: 'Publicación en X (Twitter) — 280' },
        { value: 'instagram_caption', label: 'Pie de Foto de Instagram — 2200' },
        { value: 'meta_description', label: 'Meta Descripción — 158' },
        { value: 'title_tag', label: 'Etiqueta Title — 60' },
        { value: 'sms', label: 'Mensaje SMS — 160' },
        { value: 'meta_ads_primary_text', label: 'Texto Principal de Anuncios Meta — 125' },
        { value: 'youtube_title', label: 'Título de YouTube — 100' },
    ],
    fr: [
        { value: 'x_twitter', label: 'Publication X (Twitter) — 280' },
        { value: 'instagram_caption', label: 'Légende Instagram — 2200' },
        { value: 'meta_description', label: 'Méta Description — 158' },
        { value: 'title_tag', label: 'Balise Title — 60' },
        { value: 'sms', label: 'Message SMS — 160' },
        { value: 'meta_ads_primary_text', label: 'Texte Principal Publicité Meta — 125' },
        { value: 'youtube_title', label: 'Titre YouTube — 100' },
    ],
    it: [
        { value: 'x_twitter', label: 'Post su X (Twitter) — 280' },
        { value: 'instagram_caption', label: 'Didascalia Instagram — 2200' },
        { value: 'meta_description', label: 'Meta Descrizione — 158' },
        { value: 'title_tag', label: 'Tag Title — 60' },
        { value: 'sms', label: 'Messaggio SMS — 160' },
        { value: 'meta_ads_primary_text', label: 'Testo Principale Annunci Meta — 125' },
        { value: 'youtube_title', label: 'Titolo YouTube — 100' },
    ],
    de: [
        { value: 'x_twitter', label: 'X (Twitter) Beitrag — 280' },
        { value: 'instagram_caption', label: 'Instagram-Bildunterschrift — 2200' },
        { value: 'meta_description', label: 'Meta-Beschreibung — 158' },
        { value: 'title_tag', label: 'Title-Tag — 60' },
        { value: 'sms', label: 'SMS-Nachricht — 160' },
        { value: 'meta_ads_primary_text', label: 'Meta-Anzeigen Haupttext — 125' },
        { value: 'youtube_title', label: 'YouTube-Titel — 100' },
    ],
}
const PLATFORM_SELECT_LABEL: Record<string, string> = {
    en: 'Platform', ru: 'Платформа', lv: 'Platforma', pl: 'Platforma',
    es: 'Plataforma', fr: 'Plateforme', it: 'Piattaforma', de: 'Plattform',
}
const CHAR_COUNT_LABEL: Record<string, string> = {
    en: 'Character Count', ru: 'Количество символов', lv: 'Rakstzīmju Skaits', pl: 'Liczba Znaków',
    es: 'Recuento de Caracteres', fr: 'Nombre de Caractères', it: 'Conteggio Caratteri', de: 'Zeichenanzahl',
}
const LIMIT_LABEL: Record<string, string> = {
    en: 'Platform Limit', ru: 'Лимит платформы', lv: 'Platformas Limits', pl: 'Limit Platformy',
    es: 'Límite de la Plataforma', fr: 'Limite de la Plateforme', it: 'Limite Piattaforma', de: 'Plattform-Limit',
}
const REMAINING_LABEL: Record<string, string> = {
    en: 'Characters Remaining', ru: 'Осталось символов', lv: 'Atlikušās Rakstzīmes', pl: 'Pozostałe Znaki',
    es: 'Caracteres Restantes', fr: 'Caractères Restants', it: 'Caratteri Rimanenti', de: 'Verbleibende Zeichen',
}
const LIMIT_STATUS_LABEL: Record<string, string> = {
    en: 'Status', ru: 'Статус', lv: 'Statuss', pl: 'Status',
    es: 'Estado', fr: 'Statut', it: 'Stato', de: 'Status',
}

const platformLimitValidatorTool: ToolDef = {
    id: '1186',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'Check out our new product launch happening this week!' }, { key: 'platform', default: 'x_twitter' }],
        functions: { result: { type: 'function', functionName: 'platformLimitValidator', params: { text: 'text', platform: 'platform' } } },
        outputs: [{ key: 'char_count' }, { key: 'limit' }, { key: 'remaining' }, { key: 'status' }],
    },
    locales: {
        en: {
            slug: 'platform-character-limit-validator', title: 'Platform Character Limit Validator', h1: 'Platform Character Limit Validator',
            meta_title: 'Platform Character Limit Validator | X, SMS, Meta Description & More',
            meta_description: 'Check your text against character limits for X (Twitter), SMS, meta descriptions, title tags, Instagram, and more.',
            short_answer: 'This tool checks your text against a platform\'s character limit, e.g. an 11-character message against the 280-character X limit leaves 269 characters remaining.',
            intro_text: '<p>Paste your text and pick a platform to instantly check its character count against that platform\'s common limit — useful before posting a tweet, sending an SMS, or publishing a meta description.</p>',
            key_points: [
                '<b>Covers 7 common limits:</b> X (Twitter) posts (280), Instagram captions (2200), meta descriptions (158), title tags (60), SMS messages (160), Meta Ads primary text (125), and YouTube titles (100).',
                '<b>Remaining characters</b> can go negative if your text is over the limit, showing exactly how much to trim.',
                '<b>Note:</b> some platforms (like X) count certain characters or URLs differently in practice — this tool uses a straightforward character count as a close, general-purpose estimate.',
            ],
            howto: [
                { question: 'Why do different platforms have different limits?', answer: '<p>Each platform sets its own limit based on its interface and use case — short-form platforms like SMS and X favor brevity, while captions and descriptions allow more room.</p>' },
                { question: 'Does this count spaces and punctuation?', answer: '<p>Yes — every character, including spaces and punctuation, counts toward the total.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Type or paste your text here...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.en, type: 'select', options: PLATFORM_OPTIONS.en },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.en },
                { name: 'limit', label: LIMIT_LABEL.en },
                { name: 'remaining', label: REMAINING_LABEL.en },
                { name: 'status', label: LIMIT_STATUS_LABEL.en },
            ],
        },
        ru: {
            slug: 'validator-limita-simvolov-platformy', title: 'Валидатор лимита символов платформы', h1: 'Валидатор лимита символов платформы',
            meta_title: 'Валидатор лимита символов | X, SMS, мета-описание и другие',
            meta_description: 'Проверьте свой текст на соответствие лимиту символов для X (Twitter), SMS, мета-описаний, тегов title, Instagram и других.',
            short_answer: 'Этот инструмент проверяет текст на соответствие лимиту символов платформы, например сообщение из 11 символов при лимите X в 280 символов оставляет 269 символов.',
            intro_text: '<p>Вставьте текст и выберите платформу, чтобы мгновенно проверить количество символов относительно распространённого лимита этой платформы — полезно перед публикацией твита, отправкой SMS или публикацией мета-описания.</p>',
            key_points: [
                '<b>Охватывает 7 распространённых лимитов:</b> посты X (Twitter) (280), подписи Instagram (2200), мета-описания (158), теги title (60), SMS-сообщения (160), основной текст рекламы Meta (125) и названия видео YouTube (100).',
                '<b>Оставшиеся символы</b> могут стать отрицательными, если текст превышает лимит, показывая, сколько именно нужно сократить.',
                '<b>Примечание:</b> некоторые платформы (например X) на практике по-разному считают отдельные символы или URL — этот инструмент использует прямой подсчёт символов как близкую общую оценку.',
            ],
            howto: [
                { question: 'Почему у разных платформ разные лимиты?', answer: '<p>Каждая платформа устанавливает свой лимит исходя из своего интерфейса и сценария использования — короткие форматы вроде SMS и X предпочитают краткость, а подписи и описания допускают больше места.</p>' },
                { question: 'Учитываются ли пробелы и пунктуация?', answer: '<p>Да — каждый символ, включая пробелы и пунктуацию, учитывается в общем количестве.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Введите или вставьте текст сюда...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.ru, type: 'select', options: PLATFORM_OPTIONS.ru },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.ru },
                { name: 'limit', label: LIMIT_LABEL.ru },
                { name: 'remaining', label: REMAINING_LABEL.ru },
                { name: 'status', label: LIMIT_STATUS_LABEL.ru },
            ],
        },
        lv: {
            slug: 'platformas-rakstzimju-limita-validators', title: 'Platformas Rakstzīmju Limita Validators', h1: 'Platformas Rakstzīmju Limita Validators',
            meta_title: 'Platformas Rakstzīmju Limita Validators | X, SMS, Meta Apraksts un Vairāk',
            meta_description: 'Pārbaudiet savu tekstu pret rakstzīmju limitiem X (Twitter), SMS, meta aprakstiem, title birkām, Instagram un citiem.',
            short_answer: 'Šis rīks pārbauda tekstu pret platformas rakstzīmju limitu, piemēram, 11 rakstzīmju ziņa pret X 280 rakstzīmju limitu atstāj 269 rakstzīmes.',
            intro_text: '<p>Ielīmējiet tekstu un izvēlieties platformu, lai uzreiz pārbaudītu tā rakstzīmju skaitu pret šīs platformas izplatīto limitu — noderīgi pirms tvīta publicēšanas, SMS sūtīšanas vai meta apraksta publicēšanas.</p>',
            key_points: [
                '<b>Aptver 7 izplatītus limitus:</b> X (Twitter) ziņas (280), Instagram parakstus (2200), meta aprakstus (158), title birkas (60), SMS ziņas (160), Meta reklāmu galveno tekstu (125) un YouTube nosaukumus (100).',
                '<b>Atlikušās rakstzīmes</b> var kļūt negatīvas, ja teksts pārsniedz limitu, parādot, cik precīzi jāsaīsina.',
                '<b>Piezīme:</b> dažas platformas (piemēram, X) praksē skaita atsevišķas rakstzīmes vai URL atšķirīgi — šis rīks izmanto vienkāršu rakstzīmju skaitīšanu kā tuvu, vispārīgu novērtējumu.',
            ],
            howto: [
                { question: 'Kāpēc dažādām platformām ir dažādi limiti?', answer: '<p>Katra platforma nosaka savu limitu, pamatojoties uz savu interfeisu un lietojuma gadījumu — īsformāta platformas kā SMS un X dod priekšroku kodolīgumam, bet paraksti un apraksti pieļauj vairāk vietas.</p>' },
                { question: 'Vai tas skaita atstarpes un pieturzīmes?', answer: '<p>Jā — katra rakstzīme, ieskaitot atstarpes un pieturzīmes, tiek ieskaitīta kopējā summā.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ierakstiet vai ielīmējiet tekstu šeit...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.lv, type: 'select', options: PLATFORM_OPTIONS.lv },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.lv },
                { name: 'limit', label: LIMIT_LABEL.lv },
                { name: 'remaining', label: REMAINING_LABEL.lv },
                { name: 'status', label: LIMIT_STATUS_LABEL.lv },
            ],
        },
        pl: {
            slug: 'walidator-limitu-znakow-platformy', title: 'Walidator Limitu Znaków Platformy', h1: 'Walidator Limitu Znaków Platformy',
            meta_title: 'Walidator Limitu Znaków Platformy | X, SMS, Meta Opis i Więcej',
            meta_description: 'Sprawdź swój tekst pod kątem limitów znaków dla X (Twitter), SMS, meta opisów, znaczników title, Instagram i innych.',
            short_answer: 'To narzędzie sprawdza tekst pod kątem limitu znaków platformy, np. 11-znakowa wiadomość przy limicie X wynoszącym 280 znaków pozostawia 269 znaków.',
            intro_text: '<p>Wklej tekst i wybierz platformę, aby natychmiast sprawdzić liczbę znaków względem popularnego limitu tej platformy — przydatne przed opublikowaniem tweeta, wysłaniem SMS-a lub opublikowaniem meta opisu.</p>',
            key_points: [
                '<b>Obejmuje 7 popularnych limitów:</b> posty X (Twitter) (280), opisy na Instagramie (2200), meta opisy (158), znaczniki title (60), wiadomości SMS (160), główny tekst reklam Meta (125) i tytuły YouTube (100).',
                '<b>Pozostałe znaki</b> mogą być ujemne, jeśli tekst przekracza limit, pokazując dokładnie, ile trzeba skrócić.',
                '<b>Uwaga:</b> niektóre platformy (np. X) w praktyce liczą niektóre znaki lub adresy URL inaczej — to narzędzie wykorzystuje prostą liczbę znaków jako bliskie, ogólne oszacowanie.',
            ],
            howto: [
                { question: 'Dlaczego różne platformy mają różne limity?', answer: '<p>Każda platforma ustala własny limit na podstawie swojego interfejsu i przypadku użycia — krótkie formaty jak SMS i X preferują zwięzłość, a opisy i podpisy pozwalają na więcej miejsca.</p>' },
                { question: 'Czy to liczy spacje i interpunkcję?', answer: '<p>Tak — każdy znak, w tym spacje i interpunkcja, liczy się do sumy.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wpisz lub wklej tutaj swój tekst...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.pl, type: 'select', options: PLATFORM_OPTIONS.pl },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.pl },
                { name: 'limit', label: LIMIT_LABEL.pl },
                { name: 'remaining', label: REMAINING_LABEL.pl },
                { name: 'status', label: LIMIT_STATUS_LABEL.pl },
            ],
        },
        es: {
            slug: 'validador-de-limite-de-caracteres-de-plataforma', title: 'Validador de Límite de Caracteres de Plataforma', h1: 'Validador de Límite de Caracteres de Plataforma',
            meta_title: 'Validador de Límite de Caracteres | X, SMS, Meta Descripción y Más',
            meta_description: 'Comprueba tu texto contra los límites de caracteres para X (Twitter), SMS, meta descripciones, etiquetas title, Instagram y más.',
            short_answer: 'Esta herramienta comprueba tu texto contra el límite de caracteres de una plataforma, p. ej. un mensaje de 11 caracteres contra el límite de 280 de X deja 269 caracteres restantes.',
            intro_text: '<p>Pega tu texto y elige una plataforma para comprobar instantáneamente su recuento de caracteres contra el límite común de esa plataforma — útil antes de publicar un tuit, enviar un SMS o publicar una meta descripción.</p>',
            key_points: [
                '<b>Cubre 7 límites comunes:</b> publicaciones de X (Twitter) (280), pies de foto de Instagram (2200), meta descripciones (158), etiquetas title (60), mensajes SMS (160), texto principal de anuncios de Meta (125) y títulos de YouTube (100).',
                '<b>Los caracteres restantes</b> pueden volverse negativos si tu texto supera el límite, mostrando exactamente cuánto recortar.',
                '<b>Nota:</b> algunas plataformas (como X) en la práctica cuentan ciertos caracteres o URLs de forma diferente — esta herramienta usa un recuento de caracteres directo como una estimación general cercana.',
            ],
            howto: [
                { question: '¿Por qué diferentes plataformas tienen diferentes límites?', answer: '<p>Cada plataforma establece su propio límite según su interfaz y caso de uso — las plataformas cortas como SMS y X favorecen la brevedad, mientras que los pies de foto y descripciones permiten más espacio.</p>' },
                { question: '¿Esto cuenta espacios y puntuación?', answer: '<p>Sí — cada carácter, incluyendo espacios y puntuación, cuenta hacia el total.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Escribe o pega tu texto aquí...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.es, type: 'select', options: PLATFORM_OPTIONS.es },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.es },
                { name: 'limit', label: LIMIT_LABEL.es },
                { name: 'remaining', label: REMAINING_LABEL.es },
                { name: 'status', label: LIMIT_STATUS_LABEL.es },
            ],
        },
        fr: {
            slug: 'validateur-de-limite-de-caracteres-de-plateforme', title: 'Validateur de Limite de Caractères de Plateforme', h1: 'Validateur de Limite de Caractères de Plateforme',
            meta_title: 'Validateur de Limite de Caractères | X, SMS, Méta Description et Plus',
            meta_description: 'Vérifiez votre texte par rapport aux limites de caractères pour X (Twitter), SMS, méta descriptions, balises title, Instagram et plus.',
            short_answer: 'Cet outil vérifie votre texte par rapport à la limite de caractères d\'une plateforme, ex. un message de 11 caractères par rapport à la limite de 280 de X laisse 269 caractères restants.',
            intro_text: '<p>Collez votre texte et choisissez une plateforme pour vérifier instantanément son nombre de caractères par rapport à la limite courante de cette plateforme — utile avant de publier un tweet, d\'envoyer un SMS ou de publier une méta description.</p>',
            key_points: [
                '<b>Couvre 7 limites courantes :</b> publications X (Twitter) (280), légendes Instagram (2200), méta descriptions (158), balises title (60), messages SMS (160), texte principal des publicités Meta (125) et titres YouTube (100).',
                '<b>Les caractères restants</b> peuvent devenir négatifs si votre texte dépasse la limite, montrant exactement combien réduire.',
                '<b>Remarque :</b> certaines plateformes (comme X) comptent en pratique certains caractères ou URL différemment — cet outil utilise un simple comptage de caractères comme estimation générale proche.',
            ],
            howto: [
                { question: 'Pourquoi différentes plateformes ont-elles des limites différentes ?', answer: '<p>Chaque plateforme fixe sa propre limite selon son interface et son cas d\'usage — les formats courts comme SMS et X favorisent la brièveté, tandis que les légendes et descriptions permettent plus d\'espace.</p>' },
                { question: 'Cela compte-t-il les espaces et la ponctuation ?', answer: '<p>Oui — chaque caractère, y compris les espaces et la ponctuation, compte dans le total.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Tapez ou collez votre texte ici...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.fr, type: 'select', options: PLATFORM_OPTIONS.fr },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.fr },
                { name: 'limit', label: LIMIT_LABEL.fr },
                { name: 'remaining', label: REMAINING_LABEL.fr },
                { name: 'status', label: LIMIT_STATUS_LABEL.fr },
            ],
        },
        it: {
            slug: 'validatore-limite-caratteri-piattaforma', title: 'Validatore Limite Caratteri Piattaforma', h1: 'Validatore Limite Caratteri Piattaforma',
            meta_title: 'Validatore Limite Caratteri | X, SMS, Meta Descrizione e Altro',
            meta_description: 'Controlla il tuo testo rispetto ai limiti di caratteri per X (Twitter), SMS, meta descrizioni, tag title, Instagram e altro.',
            short_answer: 'Questo strumento controlla il tuo testo rispetto al limite di caratteri di una piattaforma, es. un messaggio di 11 caratteri rispetto al limite di 280 di X lascia 269 caratteri rimanenti.',
            intro_text: '<p>Incolla il tuo testo e scegli una piattaforma per controllare istantaneamente il conteggio dei caratteri rispetto al limite comune di quella piattaforma — utile prima di pubblicare un tweet, inviare un SMS o pubblicare una meta descrizione.</p>',
            key_points: [
                '<b>Copre 7 limiti comuni:</b> post X (Twitter) (280), didascalie Instagram (2200), meta descrizioni (158), tag title (60), messaggi SMS (160), testo principale annunci Meta (125) e titoli YouTube (100).',
                '<b>I caratteri rimanenti</b> possono diventare negativi se il testo supera il limite, mostrando esattamente quanto accorciare.',
                '<b>Nota:</b> alcune piattaforme (come X) in pratica contano alcuni caratteri o URL in modo diverso — questo strumento usa un conteggio diretto dei caratteri come stima generale approssimativa.',
            ],
            howto: [
                { question: 'Perché piattaforme diverse hanno limiti diversi?', answer: '<p>Ogni piattaforma imposta il proprio limite in base alla propria interfaccia e caso d\'uso — i formati brevi come SMS e X favoriscono la concisione, mentre didascalie e descrizioni consentono più spazio.</p>' },
                { question: 'Questo conta spazi e punteggiatura?', answer: '<p>Sì — ogni carattere, inclusi spazi e punteggiatura, conta nel totale.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Digita o incolla qui il tuo testo...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.it, type: 'select', options: PLATFORM_OPTIONS.it },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.it },
                { name: 'limit', label: LIMIT_LABEL.it },
                { name: 'remaining', label: REMAINING_LABEL.it },
                { name: 'status', label: LIMIT_STATUS_LABEL.it },
            ],
        },
        de: {
            slug: 'plattform-zeichenlimit-validator', title: 'Plattform-Zeichenlimit-Validator', h1: 'Plattform-Zeichenlimit-Validator',
            meta_title: 'Plattform-Zeichenlimit-Validator | X, SMS, Meta-Beschreibung und Mehr',
            meta_description: 'Prüfen Sie Ihren Text gegen Zeichenlimits für X (Twitter), SMS, Meta-Beschreibungen, Title-Tags, Instagram und mehr.',
            short_answer: 'Dieses Tool prüft Ihren Text gegen das Zeichenlimit einer Plattform, z.B. hinterlässt eine 11-Zeichen-Nachricht gegen das 280-Zeichen-Limit von X 269 verbleibende Zeichen.',
            intro_text: '<p>Fügen Sie Ihren Text ein und wählen Sie eine Plattform, um sofort die Zeichenanzahl gegen das gängige Limit dieser Plattform zu prüfen — nützlich vor dem Posten eines Tweets, dem Senden einer SMS oder der Veröffentlichung einer Meta-Beschreibung.</p>',
            key_points: [
                '<b>Deckt 7 gängige Limits ab:</b> X (Twitter) Beiträge (280), Instagram-Bildunterschriften (2200), Meta-Beschreibungen (158), Title-Tags (60), SMS-Nachrichten (160), Meta-Anzeigen Haupttext (125) und YouTube-Titel (100).',
                '<b>Verbleibende Zeichen</b> können negativ werden, wenn Ihr Text das Limit überschreitet, und zeigen genau, wie viel gekürzt werden muss.',
                '<b>Hinweis:</b> manche Plattformen (wie X) zählen bestimmte Zeichen oder URLs in der Praxis anders — dieses Tool verwendet eine einfache Zeichenzählung als nahe, allgemeine Schätzung.',
            ],
            howto: [
                { question: 'Warum haben verschiedene Plattformen unterschiedliche Limits?', answer: '<p>Jede Plattform legt ihr eigenes Limit basierend auf ihrer Oberfläche und ihrem Anwendungsfall fest — Kurzformate wie SMS und X bevorzugen Kürze, während Bildunterschriften und Beschreibungen mehr Platz erlauben.</p>' },
                { question: 'Werden Leerzeichen und Satzzeichen mitgezählt?', answer: '<p>Ja — jedes Zeichen, einschließlich Leerzeichen und Satzzeichen, zählt zur Gesamtsumme.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Geben Sie hier Ihren Text ein oder fügen Sie ihn ein...' },
                { name: 'platform', label: PLATFORM_SELECT_LABEL.de, type: 'select', options: PLATFORM_OPTIONS.de },
            ],
            outputs: [
                { name: 'char_count', label: CHAR_COUNT_LABEL.de },
                { name: 'limit', label: LIMIT_LABEL.de },
                { name: 'remaining', label: REMAINING_LABEL.de },
                { name: 'status', label: LIMIT_STATUS_LABEL.de },
            ],
        },
    },
}

// ============================================================
// 1187: Slug Generator
// ============================================================
const TEXT_TO_CONVERT_LABEL: Record<string, string> = {
    en: 'Text to Convert', ru: 'Текст для преобразования', lv: 'Konvertējamais Teksts', pl: 'Tekst do Konwersji',
    es: 'Texto a Convertir', fr: 'Texte à Convertir', it: 'Testo da Convertire', de: 'Zu Konvertierender Text',
}
const SLUG_RESULT_LABEL: Record<string, string> = {
    en: 'URL Slug', ru: 'URL-слаг', lv: 'URL Slug', pl: 'Slug URL',
    es: 'Slug de URL', fr: 'Slug d\'URL', it: 'Slug URL', de: 'URL-Slug',
}

const slugGeneratorTool: ToolDef = {
    id: '1187',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: '10 Best Café Recipes for Beginners (2026)!' }],
        functions: { result: { type: 'function', functionName: 'slugGenerator', params: { text: 'text' } } },
        outputs: [{ key: 'result' }],
    },
    locales: {
        en: {
            slug: 'slug-generator', title: 'Slug Generator', h1: 'Slug Generator',
            meta_title: 'Slug Generator | Convert Text to a URL-Friendly Slug',
            meta_description: 'Convert any title or phrase into a clean, lowercase, hyphen-separated URL slug.',
            short_answer: 'This tool converts text to a URL slug, e.g. "10 Best Café Recipes for Beginners (2026)!" becomes "10-best-cafe-recipes-for-beginners-2026".',
            intro_text: '<p>Paste a title, heading, or phrase to convert it into a clean URL slug — lowercase, hyphen-separated, with accented characters simplified and special characters removed.</p>',
            key_points: [
                '<b>Lowercased</b> and spaces (or any run of non-alphanumeric characters) become a single hyphen.',
                '<b>Accented characters are simplified</b> — e.g. "é" becomes "e", "ñ" becomes "n" — since standard URL slugs are typically restricted to plain ASCII letters and numbers.',
                '<b>Leading/trailing hyphens are trimmed</b> and repeated hyphens are collapsed into one.',
            ],
            howto: [
                { question: 'Why use hyphens instead of underscores?', answer: '<p>Search engines generally treat hyphens as word separators but not underscores, making hyphens the standard choice for readable, SEO-friendly URLs.</p>' },
                { question: 'Does this preserve numbers?', answer: '<p>Yes — digits are kept as-is; only letters are lowercased and non-alphanumeric characters are replaced with hyphens.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.en, type: 'text', placeholder: '10 Best Café Recipes for Beginners (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.en }],
        },
        ru: {
            slug: 'generator-slagov', title: 'Генератор слагов', h1: 'Генератор слагов',
            meta_title: 'Генератор слагов | Преобразование текста в URL-совместимый слаг',
            meta_description: 'Преобразуйте любой заголовок или фразу в чистый, строчный, разделённый дефисами URL-слаг.',
            short_answer: 'Этот инструмент преобразует текст в URL-слаг, например "10 лучших рецептов кафе для начинающих (2026)!" становится "10-luchshih-receptov-kafe-dlya-nachinayushchih-2026".',
            intro_text: '<p>Вставьте заголовок или фразу, чтобы преобразовать её в чистый URL-слаг — в нижнем регистре, разделённый дефисами, с упрощёнными акцентированными символами и удалёнными спецсимволами.</p>',
            key_points: [
                '<b>Переводится в нижний регистр</b>, а пробелы (или любая последовательность не буквенно-цифровых символов) становятся одним дефисом.',
                '<b>Акцентированные символы упрощаются</b> — например "é" становится "e", "ñ" становится "n" — поскольку стандартные URL-слаги обычно ограничены простыми латинскими буквами и цифрами.',
                '<b>Начальные/конечные дефисы обрезаются</b>, а повторяющиеся дефисы объединяются в один.',
            ],
            howto: [
                { question: 'Почему используются дефисы, а не подчёркивания?', answer: '<p>Поисковые системы обычно рассматривают дефисы как разделители слов, а подчёркивания — нет, что делает дефисы стандартным выбором для читаемых, SEO-дружественных URL.</p>' },
                { question: 'Сохраняются ли цифры?', answer: '<p>Да — цифры остаются как есть; только буквы переводятся в нижний регистр, а не буквенно-цифровые символы заменяются дефисами.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.ru, type: 'text', placeholder: '10 лучших рецептов кафе для начинающих (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.ru }],
        },
        lv: {
            slug: 'slug-generators', title: 'Slug Ģenerators', h1: 'Slug Ģenerators',
            meta_title: 'Slug Ģenerators | Konvertējiet Tekstu URL Draudzīgā Slug',
            meta_description: 'Konvertējiet jebkuru virsrakstu vai frāzi tīrā, mazo burtu, ar defisēm atdalītā URL slug.',
            short_answer: 'Šis rīks konvertē tekstu URL slug, piemēram, "10 Labākās Kafejnīcu Receptes Iesācējiem (2026)!" kļūst par "10-labakas-kafejnicu-receptes-iesacejiem-2026".',
            intro_text: '<p>Ielīmējiet virsrakstu vai frāzi, lai konvertētu to tīrā URL slug — mazie burti, ar defisēm atdalīti, ar vienkāršotām akcentētām rakstzīmēm un noņemtām speciālajām rakstzīmēm.</p>',
            key_points: [
                '<b>Tiek pārveidots mazajos burtos,</b> un atstarpes (vai jebkura ne burtciparu rakstzīmju virkne) kļūst par vienu defisi.',
                '<b>Akcentētās rakstzīmes tiek vienkāršotas</b> — piem., "é" kļūst par "e", "ñ" kļūst par "n" — jo standarta URL slug parasti ir ierobežoti ar vienkāršiem ASCII burtiem un cipariem.',
                '<b>Sākuma/beigu defises tiek apgrieztas,</b> un atkārtotas defises tiek apvienotas vienā.',
            ],
            howto: [
                { question: 'Kāpēc izmantot defises, nevis pasvītrojumus?', answer: '<p>Meklētājprogrammas parasti uzskata defises par vārdu atdalītājiem, bet pasvītrojumus ne, tāpēc defises ir standarta izvēle lasāmiem, SEO draudzīgiem URL.</p>' },
                { question: 'Vai tas saglabā ciparus?', answer: '<p>Jā — cipari tiek saglabāti nemainīti; tikai burti tiek pārveidoti mazajos burtos, un ne burtciparu rakstzīmes tiek aizstātas ar defisēm.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.lv, type: 'text', placeholder: '10 Labākās Kafejnīcu Receptes Iesācējiem (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.lv }],
        },
        pl: {
            slug: 'generator-slugow', title: 'Generator Slugów', h1: 'Generator Slugów',
            meta_title: 'Generator Slugów | Konwertuj Tekst na Przyjazny dla URL Slug',
            meta_description: 'Przekonwertuj dowolny tytuł lub frazę na czysty, pisany małymi literami slug URL oddzielony myślnikami.',
            short_answer: 'To narzędzie konwertuje tekst na slug URL, np. "10 Najlepszych Przepisów Kawiarnianych dla Początkujących (2026)!" staje się "10-najlepszych-przepisow-kawiarnianych-dla-poczatkujacych-2026".',
            intro_text: '<p>Wklej tytuł, nagłówek lub frazę, aby przekonwertować ją na czysty slug URL — pisany małymi literami, oddzielony myślnikami, z uproszczonymi znakami akcentowanymi i usuniętymi znakami specjalnymi.</p>',
            key_points: [
                '<b>Zamieniane na małe litery,</b> a spacje (lub dowolny ciąg znaków niealfanumerycznych) stają się pojedynczym myślnikiem.',
                '<b>Znaki akcentowane są upraszczane</b> — np. "é" staje się "e", "ñ" staje się "n" — ponieważ standardowe slugi URL są zwykle ograniczone do zwykłych liter ASCII i cyfr.',
                '<b>Wiodące/końcowe myślniki są przycinane,</b> a powtarzające się myślniki są łączone w jeden.',
            ],
            howto: [
                { question: 'Dlaczego używać myślników zamiast podkreśleń?', answer: '<p>Wyszukiwarki zazwyczaj traktują myślniki jako separatory słów, a podkreślenia nie, co czyni myślniki standardowym wyborem dla czytelnych, przyjaznych dla SEO adresów URL.</p>' },
                { question: 'Czy to zachowuje liczby?', answer: '<p>Tak — cyfry pozostają bez zmian; tylko litery są zamieniane na małe, a znaki niealfanumeryczne są zastępowane myślnikami.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.pl, type: 'text', placeholder: '10 Najlepszych Przepisów Kawiarnianych dla Początkujących (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.pl }],
        },
        es: {
            slug: 'generador-de-slug', title: 'Generador de Slug', h1: 'Generador de Slug',
            meta_title: 'Generador de Slug | Convierte Texto en un Slug Amigable para URL',
            meta_description: 'Convierte cualquier título o frase en un slug de URL limpio, en minúsculas y separado por guiones.',
            short_answer: 'Esta herramienta convierte texto en un slug de URL, p. ej. "10 Mejores Recetas de Café para Principiantes (2026)!" se convierte en "10-mejores-recetas-de-cafe-para-principiantes-2026".',
            intro_text: '<p>Pega un título, encabezado o frase para convertirlo en un slug de URL limpio — en minúsculas, separado por guiones, con caracteres acentuados simplificados y caracteres especiales eliminados.</p>',
            key_points: [
                '<b>Se convierte a minúsculas</b> y los espacios (o cualquier secuencia de caracteres no alfanuméricos) se convierten en un solo guion.',
                '<b>Los caracteres acentuados se simplifican</b> — p. ej. "é" se convierte en "e", "ñ" se convierte en "n" — ya que los slugs de URL estándar suelen estar restringidos a letras ASCII simples y números.',
                '<b>Los guiones iniciales/finales se recortan</b> y los guiones repetidos se combinan en uno.',
            ],
            howto: [
                { question: '¿Por qué usar guiones en lugar de guiones bajos?', answer: '<p>Los motores de búsqueda generalmente tratan los guiones como separadores de palabras, pero no los guiones bajos, lo que hace de los guiones la elección estándar para URLs legibles y amigables para SEO.</p>' },
                { question: '¿Esto conserva los números?', answer: '<p>Sí — los dígitos se mantienen tal cual; solo las letras se convierten a minúsculas y los caracteres no alfanuméricos se reemplazan con guiones.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.es, type: 'text', placeholder: '10 Mejores Recetas de Café para Principiantes (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.es }],
        },
        fr: {
            slug: 'generateur-de-slug', title: 'Générateur de Slug', h1: 'Générateur de Slug',
            meta_title: 'Générateur de Slug | Convertir du Texte en Slug Compatible URL',
            meta_description: 'Convertissez n\'importe quel titre ou phrase en un slug d\'URL propre, en minuscules, séparé par des tirets.',
            short_answer: 'Cet outil convertit du texte en slug d\'URL, ex. "10 Meilleures Recettes de Café pour Débutants (2026)!" devient "10-meilleures-recettes-de-cafe-pour-debutants-2026".',
            intro_text: '<p>Collez un titre, un en-tête ou une phrase pour le convertir en un slug d\'URL propre — en minuscules, séparé par des tirets, avec les caractères accentués simplifiés et les caractères spéciaux supprimés.</p>',
            key_points: [
                '<b>Converti en minuscules</b> et les espaces (ou toute séquence de caractères non alphanumériques) deviennent un seul tiret.',
                '<b>Les caractères accentués sont simplifiés</b> — ex. "é" devient "e", "ñ" devient "n" — car les slugs d\'URL standard sont généralement limités aux lettres ASCII simples et aux chiffres.',
                '<b>Les tirets en début/fin sont supprimés</b> et les tirets répétés sont fusionnés en un seul.',
            ],
            howto: [
                { question: 'Pourquoi utiliser des tirets plutôt que des underscores ?', answer: '<p>Les moteurs de recherche traitent généralement les tirets comme des séparateurs de mots mais pas les underscores, ce qui fait des tirets le choix standard pour des URL lisibles et adaptées au SEO.</p>' },
                { question: 'Cela conserve-t-il les nombres ?', answer: '<p>Oui — les chiffres restent tels quels ; seules les lettres sont mises en minuscules et les caractères non alphanumériques sont remplacés par des tirets.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.fr, type: 'text', placeholder: '10 Meilleures Recettes de Café pour Débutants (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.fr }],
        },
        it: {
            slug: 'generatore-di-slug', title: 'Generatore di Slug', h1: 'Generatore di Slug',
            meta_title: 'Generatore di Slug | Converti Testo in uno Slug Adatto agli URL',
            meta_description: 'Converti qualsiasi titolo o frase in uno slug URL pulito, minuscolo, separato da trattini.',
            short_answer: 'Questo strumento converte il testo in uno slug URL, es. "10 Migliori Ricette da Caffetteria per Principianti (2026)!" diventa "10-migliori-ricette-da-caffetteria-per-principianti-2026".',
            intro_text: '<p>Incolla un titolo, un\'intestazione o una frase per convertirla in uno slug URL pulito — minuscolo, separato da trattini, con caratteri accentati semplificati e caratteri speciali rimossi.</p>',
            key_points: [
                '<b>Convertito in minuscolo</b> e gli spazi (o qualsiasi sequenza di caratteri non alfanumerici) diventano un singolo trattino.',
                '<b>I caratteri accentati sono semplificati</b> — es. "é" diventa "e", "ñ" diventa "n" — poiché gli slug URL standard sono generalmente limitati a lettere ASCII semplici e numeri.',
                '<b>I trattini iniziali/finali vengono rimossi</b> e i trattini ripetuti vengono uniti in uno solo.',
            ],
            howto: [
                { question: 'Perché usare trattini invece di underscore?', answer: '<p>I motori di ricerca generalmente trattano i trattini come separatori di parole ma non gli underscore, rendendo i trattini la scelta standard per URL leggibili e ottimizzati per SEO.</p>' },
                { question: 'Questo conserva i numeri?', answer: '<p>Sì — le cifre rimangono invariate; solo le lettere vengono convertite in minuscolo e i caratteri non alfanumerici vengono sostituiti con trattini.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.it, type: 'text', placeholder: '10 Migliori Ricette da Caffetteria per Principianti (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.it }],
        },
        de: {
            slug: 'slug-generator', title: 'Slug-Generator', h1: 'Slug-Generator',
            meta_title: 'Slug-Generator | Text in einen URL-freundlichen Slug Umwandeln',
            meta_description: 'Wandeln Sie jeden Titel oder Satz in einen sauberen, kleingeschriebenen, mit Bindestrichen getrennten URL-Slug um.',
            short_answer: 'Dieses Tool wandelt Text in einen URL-Slug um, z.B. wird "10 Beste Café-Rezepte für Anfänger (2026)!" zu "10-beste-cafe-rezepte-fur-anfanger-2026".',
            intro_text: '<p>Fügen Sie einen Titel, eine Überschrift oder einen Satz ein, um ihn in einen sauberen URL-Slug umzuwandeln — kleingeschrieben, mit Bindestrichen getrennt, mit vereinfachten Akzentzeichen und entfernten Sonderzeichen.</p>',
            key_points: [
                '<b>Kleingeschrieben,</b> und Leerzeichen (oder jede Folge nicht-alphanumerischer Zeichen) werden zu einem einzelnen Bindestrich.',
                '<b>Akzentzeichen werden vereinfacht</b> — z.B. wird "é" zu "e", "ñ" wird zu "n" — da Standard-URL-Slugs typischerweise auf einfache ASCII-Buchstaben und Zahlen beschränkt sind.',
                '<b>Führende/abschließende Bindestriche werden entfernt,</b> und wiederholte Bindestriche werden zu einem zusammengefasst.',
            ],
            howto: [
                { question: 'Warum Bindestriche statt Unterstriche verwenden?', answer: '<p>Suchmaschinen behandeln Bindestriche im Allgemeinen als Worttrenner, Unterstriche jedoch nicht, was Bindestriche zur Standardwahl für lesbare, SEO-freundliche URLs macht.</p>' },
                { question: 'Bleiben Zahlen erhalten?', answer: '<p>Ja — Ziffern bleiben unverändert; nur Buchstaben werden kleingeschrieben, und nicht-alphanumerische Zeichen werden durch Bindestriche ersetzt.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CONVERT_LABEL.de, type: 'text', placeholder: '10 Beste Café-Rezepte für Anfänger (2026)!' }],
            outputs: [{ name: 'result', label: SLUG_RESULT_LABEL.de }],
        },
    },
}

// ============================================================
// 1188: Duplicate Line Remover
// ============================================================
const TEXT_LINES_INPUT_LABEL: Record<string, string> = {
    en: 'Text (one item per line)', ru: 'Текст (по одному элементу на строку)', lv: 'Teksts (viens vienums rindā)', pl: 'Tekst (jeden element na linię)',
    es: 'Texto (un elemento por línea)', fr: 'Texte (un élément par ligne)', it: 'Testo (un elemento per riga)', de: 'Text (ein Element pro Zeile)',
}

const duplicateLineRemoverTool: ToolDef = {
    id: '1188',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'apple\nbanana\napple\ncherry\nbanana\napple' }],
        functions: { result: { type: 'function', functionName: 'duplicateLineRemover', params: { text: 'text' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'duplicate-line-remover', title: 'Duplicate Line Remover', h1: 'Duplicate Line Remover',
            meta_title: 'Duplicate Line Remover | Remove Repeated Lines from a List',
            meta_description: 'Paste a list of lines to instantly remove duplicates while preserving the original order.',
            short_answer: 'This tool removes duplicate lines, e.g. a 6-line list with 3 repeats becomes a 3-line list with the duplicates removed.',
            intro_text: '<p>Paste a list with one item per line — email addresses, keywords, product SKUs, or anything similar — to remove duplicate lines while keeping the first occurrence in its original position.</p>',
            key_points: [
                '<b>Case-sensitive matching:</b> "Apple" and "apple" are treated as different lines, since capitalization often matters for the kind of data pasted into a tool like this (codes, IDs, etc.).',
                '<b>Preserves order:</b> the first occurrence of each line is kept in its original position; later duplicates are simply dropped.',
                '<b>Whitespace matters:</b> lines are compared exactly as entered — trailing spaces or different indentation will be treated as different lines.',
            ],
            howto: [
                { question: 'Does this sort my list?', answer: '<p>No — the original order is preserved; only exact duplicate lines are removed.</p>' },
                { question: 'Can I use this for email lists or keyword lists?', answer: '<p>Yes — it works on any plain-text list where each item is on its own line.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.en, type: 'textarea', placeholder: 'apple\nbanana\napple\ncherry' }],
            outputs: [],
        },
        ru: {
            slug: 'udalenie-dublikatov-strok', title: 'Удаление дубликатов строк', h1: 'Удаление дубликатов строк',
            meta_title: 'Удаление дубликатов строк | Удалить повторяющиеся строки из списка',
            meta_description: 'Вставьте список строк, чтобы мгновенно удалить дубликаты, сохранив исходный порядок.',
            short_answer: 'Этот инструмент удаляет дублирующиеся строки, например список из 6 строк с 3 повторами становится списком из 3 строк без дубликатов.',
            intro_text: '<p>Вставьте список с одним элементом на строку — адреса электронной почты, ключевые слова, артикулы товаров или что-то похожее — чтобы удалить дублирующиеся строки, сохранив первое вхождение в исходной позиции.</p>',
            key_points: [
                '<b>Сравнение с учётом регистра:</b> "Apple" и "apple" считаются разными строками, поскольку регистр часто имеет значение для данных, вставляемых в подобный инструмент (коды, ID и т.д.).',
                '<b>Сохраняет порядок:</b> первое вхождение каждой строки сохраняется в исходной позиции; последующие дубликаты просто удаляются.',
                '<b>Пробелы имеют значение:</b> строки сравниваются точно так, как введены — конечные пробелы или другие отступы будут считаться разными строками.',
            ],
            howto: [
                { question: 'Сортирует ли это мой список?', answer: '<p>Нет — исходный порядок сохраняется; удаляются только точные дублирующиеся строки.</p>' },
                { question: 'Можно ли использовать это для списков email или ключевых слов?', answer: '<p>Да — это работает с любым текстовым списком, где каждый элемент находится на своей строке.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.ru, type: 'textarea', placeholder: 'яблоко\nбанан\nяблоко\nвишня' }],
            outputs: [],
        },
        lv: {
            slug: 'dublikatu-rindu-noversana', title: 'Dublikātu Rindu Noņemšana', h1: 'Dublikātu Rindu Noņemšana',
            meta_title: 'Dublikātu Rindu Noņemšana | Noņemiet Atkārtotas Rindas no Saraksta',
            meta_description: 'Ielīmējiet rindu sarakstu, lai uzreiz noņemtu dublikātus, saglabājot sākotnējo secību.',
            short_answer: 'Šis rīks noņem dublikātu rindas, piemēram, 6 rindu saraksts ar 3 atkārtojumiem kļūst par 3 rindu sarakstu bez dublikātiem.',
            intro_text: '<p>Ielīmējiet sarakstu ar vienu vienumu katrā rindā — e-pasta adreses, atslēgvārdus, produktu SKU vai kaut ko līdzīgu — lai noņemtu dublikātu rindas, saglabājot pirmo parādīšanos sākotnējā pozīcijā.</p>',
            key_points: [
                '<b>Reģistrjutīga salīdzināšana:</b> "Apple" un "apple" tiek uzskatītas par dažādām rindām, jo reģistrs bieži ir svarīgs datiem, kas tiek ielīmēti šādā rīkā (kodi, ID utt.).',
                '<b>Saglabā secību:</b> katras rindas pirmā parādīšanās tiek saglabāta sākotnējā pozīcijā; vēlākie dublikāti tiek vienkārši izmesti.',
                '<b>Atstarpēm ir nozīme:</b> rindas tiek salīdzinātas tieši tā, kā ievadītas — beigu atstarpes vai atšķirīga atkāpe tiks uzskatītas par dažādām rindām.',
            ],
            howto: [
                { question: 'Vai tas kārto manu sarakstu?', answer: '<p>Nē — sākotnējā secība tiek saglabāta; tiek noņemtas tikai precīzas dublikātu rindas.</p>' },
                { question: 'Vai to var izmantot e-pasta vai atslēgvārdu sarakstiem?', answer: '<p>Jā — tas darbojas ar jebkuru vienkāršu teksta sarakstu, kur katrs vienums atrodas savā rindā.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.lv, type: 'textarea', placeholder: 'ābols\nbanāns\nābols\nķirsis' }],
            outputs: [],
        },
        pl: {
            slug: 'usuwanie-duplikatow-linii', title: 'Usuwanie Duplikatów Linii', h1: 'Usuwanie Duplikatów Linii',
            meta_title: 'Usuwanie Duplikatów Linii | Usuń Powtarzające się Linie z Listy',
            meta_description: 'Wklej listę linii, aby natychmiast usunąć duplikaty przy zachowaniu oryginalnej kolejności.',
            short_answer: 'To narzędzie usuwa duplikaty linii, np. 6-liniowa lista z 3 powtórzeniami staje się 3-liniową listą bez duplikatów.',
            intro_text: '<p>Wklej listę z jednym elementem w linii — adresami e-mail, słowami kluczowymi, kodami SKU produktów lub czymś podobnym — aby usunąć zduplikowane linie, zachowując pierwsze wystąpienie w oryginalnej pozycji.</p>',
            key_points: [
                '<b>Dopasowanie uwzględniające wielkość liter:</b> "Apple" i "apple" są traktowane jako różne linie, ponieważ wielkość liter często ma znaczenie dla danych wklejanych do takiego narzędzia (kody, ID itp.).',
                '<b>Zachowuje kolejność:</b> pierwsze wystąpienie każdej linii jest zachowywane w oryginalnej pozycji; późniejsze duplikaty są po prostu usuwane.',
                '<b>Białe znaki mają znaczenie:</b> linie są porównywane dokładnie tak, jak zostały wprowadzone — końcowe spacje lub inne wcięcia będą traktowane jako różne linie.',
            ],
            howto: [
                { question: 'Czy to sortuje moją listę?', answer: '<p>Nie — oryginalna kolejność jest zachowywana; usuwane są tylko dokładne zduplikowane linie.</p>' },
                { question: 'Czy mogę tego użyć do list e-mail lub słów kluczowych?', answer: '<p>Tak — działa na dowolnej liście tekstowej, gdzie każdy element znajduje się w osobnej linii.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.pl, type: 'textarea', placeholder: 'jabłko\nbanan\njabłko\nwiśnia' }],
            outputs: [],
        },
        es: {
            slug: 'eliminador-de-lineas-duplicadas', title: 'Eliminador de Líneas Duplicadas', h1: 'Eliminador de Líneas Duplicadas',
            meta_title: 'Eliminador de Líneas Duplicadas | Elimina Líneas Repetidas de una Lista',
            meta_description: 'Pega una lista de líneas para eliminar instantáneamente los duplicados mientras conservas el orden original.',
            short_answer: 'Esta herramienta elimina líneas duplicadas, p. ej. una lista de 6 líneas con 3 repeticiones se convierte en una lista de 3 líneas sin duplicados.',
            intro_text: '<p>Pega una lista con un elemento por línea — direcciones de correo, palabras clave, SKU de productos o algo similar — para eliminar líneas duplicadas manteniendo la primera aparición en su posición original.</p>',
            key_points: [
                '<b>Coincidencia sensible a mayúsculas:</b> "Apple" y "apple" se tratan como líneas diferentes, ya que las mayúsculas a menudo importan para el tipo de datos pegados en una herramienta como esta (códigos, ID, etc.).',
                '<b>Conserva el orden:</b> la primera aparición de cada línea se mantiene en su posición original; los duplicados posteriores simplemente se eliminan.',
                '<b>Los espacios importan:</b> las líneas se comparan exactamente como se ingresaron — los espacios finales o la indentación diferente se tratarán como líneas diferentes.',
            ],
            howto: [
                { question: '¿Esto ordena mi lista?', answer: '<p>No — se conserva el orden original; solo se eliminan las líneas duplicadas exactas.</p>' },
                { question: '¿Puedo usar esto para listas de correo o palabras clave?', answer: '<p>Sí — funciona con cualquier lista de texto plano donde cada elemento está en su propia línea.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.es, type: 'textarea', placeholder: 'manzana\nplátano\nmanzana\ncereza' }],
            outputs: [],
        },
        fr: {
            slug: 'suppresseur-de-lignes-dupliquees', title: 'Suppresseur de Lignes Dupliquées', h1: 'Suppresseur de Lignes Dupliquées',
            meta_title: 'Suppresseur de Lignes Dupliquées | Supprimer les Lignes Répétées d\'une Liste',
            meta_description: 'Collez une liste de lignes pour supprimer instantanément les doublons tout en conservant l\'ordre d\'origine.',
            short_answer: 'Cet outil supprime les lignes dupliquées, ex. une liste de 6 lignes avec 3 répétitions devient une liste de 3 lignes sans doublons.',
            intro_text: '<p>Collez une liste avec un élément par ligne — adresses e-mail, mots-clés, références produits ou similaire — pour supprimer les lignes dupliquées tout en conservant la première occurrence à sa position d\'origine.</p>',
            key_points: [
                '<b>Correspondance sensible à la casse :</b> "Apple" et "apple" sont traités comme des lignes différentes, car la casse compte souvent pour le type de données collées dans un tel outil (codes, ID, etc.).',
                '<b>Conserve l\'ordre :</b> la première occurrence de chaque ligne est conservée à sa position d\'origine ; les doublons ultérieurs sont simplement supprimés.',
                '<b>Les espaces comptent :</b> les lignes sont comparées exactement telles qu\'entrées — les espaces de fin ou une indentation différente seront traités comme des lignes différentes.',
            ],
            howto: [
                { question: 'Cela trie-t-il ma liste ?', answer: '<p>Non — l\'ordre d\'origine est conservé ; seules les lignes dupliquées exactes sont supprimées.</p>' },
                { question: 'Puis-je utiliser cela pour des listes d\'e-mails ou de mots-clés ?', answer: '<p>Oui — cela fonctionne sur n\'importe quelle liste de texte brut où chaque élément est sur sa propre ligne.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.fr, type: 'textarea', placeholder: 'pomme\nbanane\npomme\ncerise' }],
            outputs: [],
        },
        it: {
            slug: 'rimozione-righe-duplicate', title: 'Rimozione Righe Duplicate', h1: 'Rimozione Righe Duplicate',
            meta_title: 'Rimozione Righe Duplicate | Rimuovi Righe Ripetute da un Elenco',
            meta_description: 'Incolla un elenco di righe per rimuovere istantaneamente i duplicati mantenendo l\'ordine originale.',
            short_answer: 'Questo strumento rimuove le righe duplicate, es. un elenco di 6 righe con 3 ripetizioni diventa un elenco di 3 righe senza duplicati.',
            intro_text: '<p>Incolla un elenco con un elemento per riga — indirizzi email, parole chiave, SKU di prodotti o simili — per rimuovere le righe duplicate mantenendo la prima occorrenza nella sua posizione originale.</p>',
            key_points: [
                '<b>Corrispondenza sensibile alle maiuscole:</b> "Apple" e "apple" sono trattate come righe diverse, poiché le maiuscole spesso contano per il tipo di dati incollati in uno strumento come questo (codici, ID, ecc.).',
                '<b>Preserva l\'ordine:</b> la prima occorrenza di ogni riga viene mantenuta nella sua posizione originale; i duplicati successivi vengono semplicemente eliminati.',
                '<b>Gli spazi contano:</b> le righe vengono confrontate esattamente come inserite — spazi finali o rientri diversi verranno trattati come righe diverse.',
            ],
            howto: [
                { question: 'Questo ordina il mio elenco?', answer: '<p>No — l\'ordine originale viene mantenuto; vengono rimosse solo le righe duplicate esatte.</p>' },
                { question: 'Posso usarlo per elenchi email o parole chiave?', answer: '<p>Sì — funziona su qualsiasi elenco di testo semplice in cui ogni elemento è su una propria riga.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.it, type: 'textarea', placeholder: 'mela\nbanana\nmela\nciliegia' }],
            outputs: [],
        },
        de: {
            slug: 'duplikatzeilen-entferner', title: 'Duplikatzeilen-Entferner', h1: 'Duplikatzeilen-Entferner',
            meta_title: 'Duplikatzeilen-Entferner | Wiederholte Zeilen aus einer Liste Entfernen',
            meta_description: 'Fügen Sie eine Liste von Zeilen ein, um sofort Duplikate zu entfernen und dabei die ursprüngliche Reihenfolge beizubehalten.',
            short_answer: 'Dieses Tool entfernt doppelte Zeilen, z.B. wird aus einer 6-zeiligen Liste mit 3 Wiederholungen eine 3-zeilige Liste ohne Duplikate.',
            intro_text: '<p>Fügen Sie eine Liste mit einem Element pro Zeile ein — E-Mail-Adressen, Schlüsselwörter, Produkt-SKUs oder Ähnliches — um doppelte Zeilen zu entfernen und dabei das erste Vorkommen an seiner ursprünglichen Position zu behalten.</p>',
            key_points: [
                '<b>Groß-/Kleinschreibung wird beachtet:</b> "Apple" und "apple" werden als unterschiedliche Zeilen behandelt, da die Groß-/Kleinschreibung bei der Art von Daten, die in ein solches Tool eingefügt werden (Codes, IDs usw.), oft wichtig ist.',
                '<b>Behält die Reihenfolge bei:</b> das erste Vorkommen jeder Zeile bleibt an seiner ursprünglichen Position; spätere Duplikate werden einfach entfernt.',
                '<b>Leerzeichen spielen eine Rolle:</b> Zeilen werden genau so verglichen, wie sie eingegeben wurden — nachgestellte Leerzeichen oder unterschiedliche Einrückungen werden als unterschiedliche Zeilen behandelt.',
            ],
            howto: [
                { question: 'Wird meine Liste dadurch sortiert?', answer: '<p>Nein — die ursprüngliche Reihenfolge bleibt erhalten; es werden nur exakte doppelte Zeilen entfernt.</p>' },
                { question: 'Kann ich dies für E-Mail- oder Schlüsselwortlisten verwenden?', answer: '<p>Ja — es funktioniert mit jeder reinen Textliste, bei der sich jedes Element in einer eigenen Zeile befindet.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_LINES_INPUT_LABEL.de, type: 'textarea', placeholder: 'Apfel\nBanane\nApfel\nKirsche' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1189: Text Diff Checker
// ============================================================
const TEXT_A_LABEL: Record<string, string> = {
    en: 'Text A (Original)', ru: 'Текст A (исходный)', lv: 'Teksts A (Oriģināls)', pl: 'Tekst A (Oryginalny)',
    es: 'Texto A (Original)', fr: 'Texte A (Original)', it: 'Testo A (Originale)', de: 'Text A (Original)',
}
const TEXT_B_LABEL: Record<string, string> = {
    en: 'Text B (Changed)', ru: 'Текст B (изменённый)', lv: 'Teksts B (Mainīts)', pl: 'Tekst B (Zmieniony)',
    es: 'Texto B (Modificado)', fr: 'Texte B (Modifié)', it: 'Testo B (Modificato)', de: 'Text B (Geändert)',
}

const textDiffCheckerTool: ToolDef = {
    id: '1189',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text_a', default: 'apple\nbanana\ncherry' }, { key: 'text_b', default: 'apple\ncherry\ndate' }],
        functions: { result: { type: 'function', functionName: 'textDiffChecker', params: { text_a: 'text_a', text_b: 'text_b' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'text-diff-checker', title: 'Text Diff Checker', h1: 'Text Diff Checker',
            meta_title: 'Text Diff Checker | Compare Two Blocks of Text Line by Line',
            meta_description: 'Paste two blocks of text to see which lines were added, removed, or stayed the same between them.',
            short_answer: 'This tool compares two texts line by line, e.g. one line removed and one line added between two 3-line lists are both clearly flagged.',
            intro_text: '<p>Paste an original text in Text A and a revised version in Text B to see which lines only appear in A (removed), only appear in B (added), and which are unchanged.</p>',
            key_points: [
                '<b>Line-based comparison:</b> this compares whole lines as a set, not word-by-word or character-by-character — it\'s best suited to comparing lists, config files, or short text blocks rather than long-form prose.',
                '<b>Not a positional diff:</b> unlike tools like git diff, this doesn\'t track which specific line moved where — it only reports which lines exist in one text but not the other.',
                '<b>Leading/trailing whitespace is trimmed</b> from each line before comparing, so indentation differences alone won\'t cause false mismatches.',
            ],
            howto: [
                { question: 'Can I use this to compare paragraphs of prose?', answer: '<p>It works best on line-oriented content (lists, code, config) — for flowing prose, consider comparing sentence by sentence instead.</p>' },
                { question: 'Does the order of lines matter?', answer: '<p>No — this checks set membership (which lines exist in each text), not their order or position.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.en, type: 'textarea', placeholder: 'apple\nbanana\ncherry' },
                { name: 'text_b', label: TEXT_B_LABEL.en, type: 'textarea', placeholder: 'apple\ncherry\ndate' },
            ],
            outputs: [],
        },
        ru: {
            slug: 'sravnenie-tekstov', title: 'Сравнение текстов', h1: 'Сравнение текстов',
            meta_title: 'Сравнение текстов | Сравните два блока текста построчно',
            meta_description: 'Вставьте два блока текста, чтобы увидеть, какие строки были добавлены, удалены или остались без изменений.',
            short_answer: 'Этот инструмент сравнивает два текста построчно, например одна удалённая строка и одна добавленная строка между двумя списками из 3 строк чётко помечаются.',
            intro_text: '<p>Вставьте исходный текст в Текст A и изменённую версию в Текст B, чтобы увидеть, какие строки есть только в A (удалены), только в B (добавлены), и какие не изменились.</p>',
            key_points: [
                '<b>Построчное сравнение:</b> сравниваются целые строки как множество, а не слово за словом или посимвольно — лучше всего подходит для сравнения списков, конфигурационных файлов или коротких текстовых блоков, а не связного текста.',
                '<b>Не позиционное сравнение:</b> в отличие от инструментов вроде git diff, это не отслеживает, какая конкретная строка куда переместилась — сообщается только, какие строки есть в одном тексте, но нет в другом.',
                '<b>Начальные/конечные пробелы обрезаются</b> в каждой строке перед сравнением, поэтому только различие в отступах не вызовет ложных несовпадений.',
            ],
            howto: [
                { question: 'Можно ли использовать это для сравнения абзацев связного текста?', answer: '<p>Лучше всего работает с построчным контентом (списки, код, конфигурация) — для связного текста лучше сравнивать предложение за предложением.</p>' },
                { question: 'Имеет ли значение порядок строк?', answer: '<p>Нет — проверяется принадлежность к множеству (какие строки есть в каждом тексте), а не их порядок или позиция.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.ru, type: 'textarea', placeholder: 'яблоко\nбанан\nвишня' },
                { name: 'text_b', label: TEXT_B_LABEL.ru, type: 'textarea', placeholder: 'яблоко\nвишня\nфиник' },
            ],
            outputs: [],
        },
        lv: {
            slug: 'teksta-atskirbibas-parbaudes-riks', title: 'Teksta Atšķirību Pārbaudes Rīks', h1: 'Teksta Atšķirību Pārbaudes Rīks',
            meta_title: 'Teksta Atšķirību Pārbaudes Rīks | Salīdziniet Divus Teksta Blokus Rindu pa Rindai',
            meta_description: 'Ielīmējiet divus teksta blokus, lai redzētu, kuras rindas tika pievienotas, noņemtas vai palika nemainīgas.',
            short_answer: 'Šis rīks salīdzina divus tekstus rindu pa rindai, piemēram, viena noņemta rinda un viena pievienota rinda starp diviem 3 rindu sarakstiem abas tiek skaidri atzīmētas.',
            intro_text: '<p>Ielīmējiet oriģinālo tekstu Tekstā A un pārskatīto versiju Tekstā B, lai redzētu, kuras rindas parādās tikai A (noņemtas), tikai B (pievienotas), un kuras ir nemainīgas.</p>',
            key_points: [
                '<b>Uz rindām balstīta salīdzināšana:</b> tas salīdzina veselas rindas kā kopu, nevis vārdu pa vārdam vai rakstzīmi pa rakstzīmei — vislabāk piemērots sarakstu, konfigurācijas failu vai īsu teksta bloku salīdzināšanai, nevis garam saistītam tekstam.',
                '<b>Nav pozicionāla atšķirība:</b> atšķirībā no rīkiem kā git diff, tas neizseko, kura konkrētā rinda kur pārvietojās — tas tikai ziņo, kuras rindas eksistē vienā tekstā, bet ne otrā.',
                '<b>Sākuma/beigu atstarpes tiek apgrieztas</b> katrā rindā pirms salīdzināšanas, tāpēc atkāpju atšķirības vien neradīs kļūdainas neatbilstības.',
            ],
            howto: [
                { question: 'Vai to var izmantot, lai salīdzinātu saistīta teksta rindkopas?', answer: '<p>Vislabāk darbojas ar rindu orientētu saturu (sarakstiem, kodu, konfigurāciju) — plūstošam tekstam apsveriet salīdzināšanu teikumu pa teikumam.</p>' },
                { question: 'Vai rindu secība ir svarīga?', answer: '<p>Nē — tiek pārbaudīta piederība kopai (kuras rindas eksistē katrā tekstā), nevis to secība vai pozīcija.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.lv, type: 'textarea', placeholder: 'ābols\nbanāns\nķirsis' },
                { name: 'text_b', label: TEXT_B_LABEL.lv, type: 'textarea', placeholder: 'ābols\nķirsis\ndateles' },
            ],
            outputs: [],
        },
        pl: {
            slug: 'sprawdzanie-roznic-w-tekscie', title: 'Sprawdzanie Różnic w Tekście', h1: 'Sprawdzanie Różnic w Tekście',
            meta_title: 'Sprawdzanie Różnic w Tekście | Porównaj Dwa Bloki Tekstu Linia po Linii',
            meta_description: 'Wklej dwa bloki tekstu, aby zobaczyć, które linie zostały dodane, usunięte lub pozostały bez zmian.',
            short_answer: 'To narzędzie porównuje dwa teksty linia po linii, np. jedna usunięta linia i jedna dodana linia między dwiema 3-liniowymi listami są wyraźnie oznaczone.',
            intro_text: '<p>Wklej oryginalny tekst w Tekście A i poprawioną wersję w Tekście B, aby zobaczyć, które linie występują tylko w A (usunięte), tylko w B (dodane), a które są niezmienione.</p>',
            key_points: [
                '<b>Porównanie oparte na liniach:</b> to porównuje całe linie jako zbiór, a nie słowo po słowie lub znak po znaku — najlepiej nadaje się do porównywania list, plików konfiguracyjnych lub krótkich bloków tekstu, a nie długiej prozy.',
                '<b>To nie jest różnica pozycyjna:</b> w przeciwieństwie do narzędzi takich jak git diff, to nie śledzi, która konkretna linia się przeniosła — zgłasza tylko, które linie istnieją w jednym tekście, ale nie w drugim.',
                '<b>Wiodące/końcowe białe znaki są przycinane</b> w każdej linii przed porównaniem, więc same różnice w wcięciach nie spowodują fałszywych niezgodności.',
            ],
            howto: [
                { question: 'Czy mogę użyć tego do porównywania akapitów prozy?', answer: '<p>Najlepiej działa na treści zorientowanej liniowo (listy, kod, konfiguracja) — dla płynnej prozy rozważ porównywanie zdanie po zdaniu.</p>' },
                { question: 'Czy kolejność linii ma znaczenie?', answer: '<p>Nie — sprawdzana jest przynależność do zbioru (które linie istnieją w każdym tekście), a nie ich kolejność lub pozycja.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.pl, type: 'textarea', placeholder: 'jabłko\nbanan\nwiśnia' },
                { name: 'text_b', label: TEXT_B_LABEL.pl, type: 'textarea', placeholder: 'jabłko\nwiśnia\ndatek' },
            ],
            outputs: [],
        },
        es: {
            slug: 'comparador-de-diferencias-de-texto', title: 'Comparador de Diferencias de Texto', h1: 'Comparador de Diferencias de Texto',
            meta_title: 'Comparador de Diferencias de Texto | Compara Dos Bloques de Texto Línea por Línea',
            meta_description: 'Pega dos bloques de texto para ver qué líneas se añadieron, eliminaron o se mantuvieron iguales entre ellos.',
            short_answer: 'Esta herramienta compara dos textos línea por línea, p. ej. una línea eliminada y una línea añadida entre dos listas de 3 líneas se marcan claramente.',
            intro_text: '<p>Pega un texto original en Texto A y una versión revisada en Texto B para ver qué líneas solo aparecen en A (eliminadas), solo aparecen en B (añadidas), y cuáles no cambiaron.</p>',
            key_points: [
                '<b>Comparación basada en líneas:</b> esto compara líneas completas como un conjunto, no palabra por palabra o carácter por carácter — es más adecuado para comparar listas, archivos de configuración o bloques cortos de texto en lugar de prosa extensa.',
                '<b>No es una diferencia posicional:</b> a diferencia de herramientas como git diff, esto no rastrea qué línea específica se movió a dónde — solo informa qué líneas existen en un texto pero no en el otro.',
                '<b>Los espacios iniciales/finales se recortan</b> de cada línea antes de comparar, así que las diferencias de sangría por sí solas no causarán falsas discrepancias.',
            ],
            howto: [
                { question: '¿Puedo usar esto para comparar párrafos de prosa?', answer: '<p>Funciona mejor con contenido orientado a líneas (listas, código, configuración) — para prosa fluida, considera comparar oración por oración en su lugar.</p>' },
                { question: '¿Importa el orden de las líneas?', answer: '<p>No — esto verifica la pertenencia al conjunto (qué líneas existen en cada texto), no su orden o posición.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.es, type: 'textarea', placeholder: 'manzana\nplátano\ncereza' },
                { name: 'text_b', label: TEXT_B_LABEL.es, type: 'textarea', placeholder: 'manzana\ncereza\ndátil' },
            ],
            outputs: [],
        },
        fr: {
            slug: 'verificateur-de-differences-de-texte', title: 'Vérificateur de Différences de Texte', h1: 'Vérificateur de Différences de Texte',
            meta_title: 'Vérificateur de Différences de Texte | Comparez Deux Blocs de Texte Ligne par Ligne',
            meta_description: 'Collez deux blocs de texte pour voir quelles lignes ont été ajoutées, supprimées ou sont restées identiques entre eux.',
            short_answer: 'Cet outil compare deux textes ligne par ligne, ex. une ligne supprimée et une ligne ajoutée entre deux listes de 3 lignes sont toutes deux clairement signalées.',
            intro_text: '<p>Collez un texte original dans le Texte A et une version révisée dans le Texte B pour voir quelles lignes n\'apparaissent que dans A (supprimées), n\'apparaissent que dans B (ajoutées), et lesquelles sont inchangées.</p>',
            key_points: [
                '<b>Comparaison basée sur les lignes :</b> ceci compare des lignes entières comme un ensemble, pas mot par mot ou caractère par caractère — c\'est mieux adapté pour comparer des listes, des fichiers de configuration ou de courts blocs de texte plutôt que de la prose longue.',
                '<b>Ce n\'est pas une différence positionnelle :</b> contrairement à des outils comme git diff, cela ne suit pas quelle ligne spécifique s\'est déplacée où — cela signale seulement quelles lignes existent dans un texte mais pas dans l\'autre.',
                '<b>Les espaces en début/fin sont supprimés</b> de chaque ligne avant la comparaison, donc les différences d\'indentation seules ne causeront pas de fausses discordances.',
            ],
            howto: [
                { question: 'Puis-je utiliser cela pour comparer des paragraphes de prose ?', answer: '<p>Cela fonctionne mieux sur du contenu orienté ligne (listes, code, configuration) — pour de la prose fluide, envisagez plutôt de comparer phrase par phrase.</p>' },
                { question: 'L\'ordre des lignes a-t-il de l\'importance ?', answer: '<p>Non — ceci vérifie l\'appartenance à un ensemble (quelles lignes existent dans chaque texte), pas leur ordre ou position.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.fr, type: 'textarea', placeholder: 'pomme\nbanane\ncerise' },
                { name: 'text_b', label: TEXT_B_LABEL.fr, type: 'textarea', placeholder: 'pomme\ncerise\ndatte' },
            ],
            outputs: [],
        },
        it: {
            slug: 'verificatore-di-differenze-di-testo', title: 'Verificatore di Differenze di Testo', h1: 'Verificatore di Differenze di Testo',
            meta_title: 'Verificatore di Differenze di Testo | Confronta Due Blocchi di Testo Riga per Riga',
            meta_description: 'Incolla due blocchi di testo per vedere quali righe sono state aggiunte, rimosse o sono rimaste invariate.',
            short_answer: 'Questo strumento confronta due testi riga per riga, es. una riga rimossa e una riga aggiunta tra due elenchi di 3 righe sono entrambe chiaramente segnalate.',
            intro_text: '<p>Incolla un testo originale nel Testo A e una versione rivista nel Testo B per vedere quali righe appaiono solo in A (rimosse), solo in B (aggiunte), e quali sono invariate.</p>',
            key_points: [
                '<b>Confronto basato su righe:</b> questo confronta intere righe come un insieme, non parola per parola o carattere per carattere — è più adatto a confrontare elenchi, file di configurazione o brevi blocchi di testo piuttosto che prosa lunga.',
                '<b>Non è una differenza posizionale:</b> a differenza di strumenti come git diff, questo non traccia quale riga specifica si è spostata dove — riporta solo quali righe esistono in un testo ma non nell\'altro.',
                '<b>Gli spazi iniziali/finali vengono rimossi</b> da ogni riga prima del confronto, quindi le sole differenze di rientro non causeranno false discrepanze.',
            ],
            howto: [
                { question: 'Posso usarlo per confrontare paragrafi di prosa?', answer: '<p>Funziona meglio con contenuti orientati alle righe (elenchi, codice, configurazione) — per prosa scorrevole, considera invece di confrontare frase per frase.</p>' },
                { question: 'L\'ordine delle righe è importante?', answer: '<p>No — questo verifica l\'appartenenza all\'insieme (quali righe esistono in ciascun testo), non il loro ordine o posizione.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.it, type: 'textarea', placeholder: 'mela\nbanana\nciliegia' },
                { name: 'text_b', label: TEXT_B_LABEL.it, type: 'textarea', placeholder: 'mela\nciliegia\ndattero' },
            ],
            outputs: [],
        },
        de: {
            slug: 'text-diff-prufer', title: 'Text-Diff-Prüfer', h1: 'Text-Diff-Prüfer',
            meta_title: 'Text-Diff-Prüfer | Vergleichen Sie Zwei Textblöcke Zeile für Zeile',
            meta_description: 'Fügen Sie zwei Textblöcke ein, um zu sehen, welche Zeilen hinzugefügt, entfernt oder unverändert geblieben sind.',
            short_answer: 'Dieses Tool vergleicht zwei Texte zeilenweise, z.B. werden eine entfernte Zeile und eine hinzugefügte Zeile zwischen zwei 3-zeiligen Listen beide klar markiert.',
            intro_text: '<p>Fügen Sie einen Originaltext in Text A und eine überarbeitete Version in Text B ein, um zu sehen, welche Zeilen nur in A vorkommen (entfernt), nur in B vorkommen (hinzugefügt) und welche unverändert sind.</p>',
            key_points: [
                '<b>Zeilenbasierter Vergleich:</b> dies vergleicht ganze Zeilen als Menge, nicht Wort für Wort oder Zeichen für Zeichen — am besten geeignet für den Vergleich von Listen, Konfigurationsdateien oder kurzen Textblöcken statt langer Prosa.',
                '<b>Kein positionsbasierter Diff:</b> im Gegensatz zu Tools wie git diff wird nicht verfolgt, welche bestimmte Zeile wohin verschoben wurde — es wird nur gemeldet, welche Zeilen in einem Text existieren, aber nicht im anderen.',
                '<b>Führende/abschließende Leerzeichen werden entfernt</b> aus jeder Zeile vor dem Vergleich, sodass reine Einrückungsunterschiede keine falschen Abweichungen verursachen.',
            ],
            howto: [
                { question: 'Kann ich dies verwenden, um Prosa-Absätze zu vergleichen?', answer: '<p>Es funktioniert am besten mit zeilenorientiertem Inhalt (Listen, Code, Konfiguration) — für fließenden Text ist ein Satz-für-Satz-Vergleich besser geeignet.</p>' },
                { question: 'Spielt die Reihenfolge der Zeilen eine Rolle?', answer: '<p>Nein — dies prüft die Mengenzugehörigkeit (welche Zeilen in jedem Text existieren), nicht ihre Reihenfolge oder Position.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: TEXT_A_LABEL.de, type: 'textarea', placeholder: 'Apfel\nBanane\nKirsche' },
                { name: 'text_b', label: TEXT_B_LABEL.de, type: 'textarea', placeholder: 'Apfel\nKirsche\nDattel' },
            ],
            outputs: [],
        },
    },
}

// ============================================================
// 1190: Meta Tag / Open Graph Generator
// ============================================================
const PAGE_TITLE_INPUT_LABEL: Record<string, string> = {
    en: 'Page Title', ru: 'Заголовок страницы', lv: 'Lapas Nosaukums', pl: 'Tytuł Strony',
    es: 'Título de Página', fr: 'Titre de Page', it: 'Titolo Pagina', de: 'Seitentitel',
}
const PAGE_DESCRIPTION_INPUT_LABEL: Record<string, string> = {
    en: 'Page Description', ru: 'Описание страницы', lv: 'Lapas Apraksts', pl: 'Opis Strony',
    es: 'Descripción de Página', fr: 'Description de Page', it: 'Descrizione Pagina', de: 'Seitenbeschreibung',
}
const PAGE_URL_LABEL: Record<string, string> = {
    en: 'Page URL', ru: 'URL страницы', lv: 'Lapas URL', pl: 'Adres URL Strony',
    es: 'URL de la Página', fr: 'URL de la Page', it: 'URL della Pagina', de: 'Seiten-URL',
}
const IMAGE_URL_INPUT_LABEL: Record<string, string> = {
    en: 'Image URL (optional)', ru: 'URL изображения (необязательно)', lv: 'Attēla URL (nav obligāts)', pl: 'Adres URL Obrazu (opcjonalnie)',
    es: 'URL de Imagen (opcional)', fr: 'URL de l\'Image (facultatif)', it: 'URL Immagine (opzionale)', de: 'Bild-URL (optional)',
}
const SITE_NAME_INPUT_LABEL: Record<string, string> = {
    en: 'Site Name (optional)', ru: 'Название сайта (необязательно)', lv: 'Vietnes Nosaukums (nav obligāts)', pl: 'Nazwa Strony (opcjonalnie)',
    es: 'Nombre del Sitio (opcional)', fr: 'Nom du Site (facultatif)', it: 'Nome del Sito (opzionale)', de: 'Website-Name (optional)',
}
const META_TAGS_RESULT_LABEL: Record<string, string> = {
    en: 'Meta Tags', ru: 'Мета-теги', lv: 'Meta Birkas', pl: 'Znaczniki Meta',
    es: 'Meta Etiquetas', fr: 'Balises Méta', it: 'Meta Tag', de: 'Meta-Tags',
}

const metaTagGeneratorTool: ToolDef = {
    id: '1190',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'title', default: 'My Awesome Page' },
            { key: 'description', default: 'A short, compelling description of this page.' },
            { key: 'url', default: 'https://example.com/page' },
            { key: 'image_url', default: '' },
            { key: 'site_name', default: '' },
        ],
        functions: { result: { type: 'function', functionName: 'metaTagGenerator', params: { title: 'title', description: 'description', url: 'url', image_url: 'image_url', site_name: 'site_name' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'meta-tag-open-graph-generator', title: 'Meta Tag & Open Graph Generator', h1: 'Meta Tag & Open Graph Generator',
            meta_title: 'Meta Tag & Open Graph Generator | Create HTML Meta and OG Tags',
            meta_description: 'Generate a ready-to-paste block of title, meta description, Open Graph, and Twitter Card tags for any page.',
            short_answer: 'This tool generates a full block of HTML meta tags, e.g. filling in a title, description, and URL produces title, meta description, Open Graph, and Twitter Card tags ready to paste into your page\'s head.',
            intro_text: '<p>Fill in your page\'s title, description, URL, and optionally an image and site name to generate a ready-to-paste block of meta tags — covering the standard title/description tags, Open Graph (used by Facebook, LinkedIn, and others), and Twitter Card tags.</p>',
            key_points: [
                '<b>Always included:</b> title tag, meta description, and the core Open Graph tags (og:title, og:description, og:url, og:type).',
                '<b>Included if provided:</b> og:image and twitter:image (if an image URL is given), and og:site_name (if a site name is given).',
                '<b>Where to paste:</b> these tags belong inside your page\'s HTML &lt;head&gt; section.',
            ],
            howto: [
                { question: 'What is Open Graph used for?', answer: '<p>Open Graph tags control how your page looks when shared on social platforms like Facebook and LinkedIn — the title, description, and image shown in the link preview.</p>' },
                { question: 'Do I need the Twitter Card tags separately from Open Graph?', answer: '<p>X (Twitter) primarily reads its own twitter: tags, though it will fall back to Open Graph tags if Twitter Card tags are missing — including both covers more platforms reliably.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.en, type: 'text', placeholder: 'My Awesome Page' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.en, type: 'text', placeholder: 'A short, compelling description of this page.' },
                { name: 'url', label: PAGE_URL_LABEL.en, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.en, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.en, type: 'text', placeholder: 'My Website' },
            ],
            outputs: [],
        },
        ru: {
            slug: 'generator-meta-tegov-i-open-graph', title: 'Генератор мета-тегов и Open Graph', h1: 'Генератор мета-тегов и Open Graph',
            meta_title: 'Генератор мета-тегов и Open Graph | Создание HTML meta и OG тегов',
            meta_description: 'Сгенерируйте готовый к вставке блок title, meta description, Open Graph и Twitter Card тегов для любой страницы.',
            short_answer: 'Этот инструмент генерирует полный блок HTML мета-тегов, например заполнение title, описания и URL создаёт теги title, meta description, Open Graph и Twitter Card, готовые для вставки в head страницы.',
            intro_text: '<p>Заполните title, описание, URL страницы и, при желании, изображение и название сайта, чтобы сгенерировать готовый к вставке блок мета-тегов — включая стандартные теги title/description, Open Graph (используется Facebook, LinkedIn и другими) и теги Twitter Card.</p>',
            key_points: [
                '<b>Всегда включается:</b> тег title, meta description и основные теги Open Graph (og:title, og:description, og:url, og:type).',
                '<b>Включается при наличии:</b> og:image и twitter:image (если указан URL изображения) и og:site_name (если указано название сайта).',
                '<b>Куда вставлять:</b> эти теги должны находиться внутри секции &lt;head&gt; HTML вашей страницы.',
            ],
            howto: [
                { question: 'Для чего используется Open Graph?', answer: '<p>Теги Open Graph управляют тем, как выглядит ваша страница при публикации в соцсетях, таких как Facebook и LinkedIn — заголовок, описание и изображение, показываемые в превью ссылки.</p>' },
                { question: 'Нужны ли теги Twitter Card отдельно от Open Graph?', answer: '<p>X (Twitter) в первую очередь читает свои собственные теги twitter:, хотя он вернётся к тегам Open Graph, если теги Twitter Card отсутствуют — включение обоих надёжнее охватывает больше платформ.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.ru, type: 'text', placeholder: 'Моя отличная страница' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.ru, type: 'text', placeholder: 'Короткое, привлекательное описание этой страницы.' },
                { name: 'url', label: PAGE_URL_LABEL.ru, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.ru, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.ru, type: 'text', placeholder: 'Мой сайт' },
            ],
            outputs: [],
        },
        lv: {
            slug: 'meta-birku-un-open-graph-generators', title: 'Meta Birku un Open Graph Ģenerators', h1: 'Meta Birku un Open Graph Ģenerators',
            meta_title: 'Meta Birku un Open Graph Ģenerators | Izveidojiet HTML Meta un OG Birkas',
            meta_description: 'Ģenerējiet gatavu ielīmēšanai title, meta apraksta, Open Graph un Twitter Card birku bloku jebkurai lapai.',
            short_answer: 'Šis rīks ģenerē pilnu HTML meta birku bloku, piemēram, aizpildot nosaukumu, aprakstu un URL, tiek izveidotas title, meta apraksta, Open Graph un Twitter Card birkas, gatavas ielīmēšanai lapas head sadaļā.',
            intro_text: '<p>Aizpildiet savas lapas nosaukumu, aprakstu, URL un pēc izvēles attēlu un vietnes nosaukumu, lai ģenerētu gatavu ielīmēšanai meta birku bloku — ietverot standarta title/apraksta birkas, Open Graph (izmanto Facebook, LinkedIn un citi) un Twitter Card birkas.</p>',
            key_points: [
                '<b>Vienmēr iekļauts:</b> title birka, meta apraksts un galvenās Open Graph birkas (og:title, og:description, og:url, og:type).',
                '<b>Iekļauts, ja norādīts:</b> og:image un twitter:image (ja norādīts attēla URL) un og:site_name (ja norādīts vietnes nosaukums).',
                '<b>Kur ielīmēt:</b> šīm birkām jāatrodas jūsu lapas HTML &lt;head&gt; sadaļā.',
            ],
            howto: [
                { question: 'Kam tiek izmantots Open Graph?', answer: '<p>Open Graph birkas kontrolē, kā jūsu lapa izskatās, kopīgojot sociālajās platformās, piemēram, Facebook un LinkedIn — nosaukumu, aprakstu un attēlu, kas parādās saites priekšskatījumā.</p>' },
                { question: 'Vai man vajag Twitter Card birkas atsevišķi no Open Graph?', answer: '<p>X (Twitter) galvenokārt lasa savas twitter: birkas, lai gan tas izmantos Open Graph birkas, ja Twitter Card birkas trūkst — abu iekļaušana uzticamāk aptver vairāk platformu.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.lv, type: 'text', placeholder: 'Mana Lieliskā Lapa' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.lv, type: 'text', placeholder: 'Īss, pārliecinošs šīs lapas apraksts.' },
                { name: 'url', label: PAGE_URL_LABEL.lv, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.lv, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.lv, type: 'text', placeholder: 'Mana Vietne' },
            ],
            outputs: [],
        },
        pl: {
            slug: 'generator-znacznikow-meta-i-open-graph', title: 'Generator Znaczników Meta i Open Graph', h1: 'Generator Znaczników Meta i Open Graph',
            meta_title: 'Generator Znaczników Meta i Open Graph | Twórz Znaczniki HTML Meta i OG',
            meta_description: 'Wygeneruj gotowy do wklejenia blok znaczników title, meta opis, Open Graph i Twitter Card dla dowolnej strony.',
            short_answer: 'To narzędzie generuje pełny blok znaczników meta HTML, np. wypełnienie tytułu, opisu i adresu URL tworzy znaczniki title, meta opis, Open Graph i Twitter Card gotowe do wklejenia do sekcji head strony.',
            intro_text: '<p>Wypełnij tytuł, opis, adres URL strony oraz opcjonalnie obraz i nazwę strony, aby wygenerować gotowy do wklejenia blok znaczników meta — obejmujący standardowe znaczniki title/opis, Open Graph (używane przez Facebook, LinkedIn i inne) oraz znaczniki Twitter Card.</p>',
            key_points: [
                '<b>Zawsze dołączone:</b> znacznik title, meta opis oraz podstawowe znaczniki Open Graph (og:title, og:description, og:url, og:type).',
                '<b>Dołączone, jeśli podane:</b> og:image i twitter:image (jeśli podano adres URL obrazu) oraz og:site_name (jeśli podano nazwę strony).',
                '<b>Gdzie wkleić:</b> te znaczniki powinny znajdować się w sekcji &lt;head&gt; HTML twojej strony.',
            ],
            howto: [
                { question: 'Do czego służy Open Graph?', answer: '<p>Znaczniki Open Graph kontrolują, jak wygląda twoja strona po udostępnieniu na platformach społecznościowych takich jak Facebook i LinkedIn — tytuł, opis i obraz pokazywane w podglądzie linku.</p>' },
                { question: 'Czy potrzebuję znaczników Twitter Card osobno od Open Graph?', answer: '<p>X (Twitter) głównie odczytuje własne znaczniki twitter:, choć wróci do znaczników Open Graph, jeśli znaczniki Twitter Card są nieobecne — dołączenie obu bardziej niezawodnie obejmuje więcej platform.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.pl, type: 'text', placeholder: 'Moja Świetna Strona' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.pl, type: 'text', placeholder: 'Krótki, przekonujący opis tej strony.' },
                { name: 'url', label: PAGE_URL_LABEL.pl, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.pl, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.pl, type: 'text', placeholder: 'Moja Strona' },
            ],
            outputs: [],
        },
        es: {
            slug: 'generador-de-meta-etiquetas-y-open-graph', title: 'Generador de Meta Etiquetas y Open Graph', h1: 'Generador de Meta Etiquetas y Open Graph',
            meta_title: 'Generador de Meta Etiquetas y Open Graph | Crea Etiquetas HTML Meta y OG',
            meta_description: 'Genera un bloque listo para pegar de etiquetas title, meta descripción, Open Graph y Twitter Card para cualquier página.',
            short_answer: 'Esta herramienta genera un bloque completo de meta etiquetas HTML, p. ej. completar un título, descripción y URL produce etiquetas title, meta descripción, Open Graph y Twitter Card listas para pegar en el head de tu página.',
            intro_text: '<p>Completa el título, descripción, URL de tu página y opcionalmente una imagen y nombre del sitio para generar un bloque listo para pegar de meta etiquetas — cubriendo las etiquetas estándar title/descripción, Open Graph (usado por Facebook, LinkedIn y otros) y etiquetas Twitter Card.</p>',
            key_points: [
                '<b>Siempre incluido:</b> etiqueta title, meta descripción y las etiquetas principales de Open Graph (og:title, og:description, og:url, og:type).',
                '<b>Incluido si se proporciona:</b> og:image y twitter:image (si se da una URL de imagen), y og:site_name (si se da un nombre de sitio).',
                '<b>Dónde pegar:</b> estas etiquetas pertenecen dentro de la sección &lt;head&gt; del HTML de tu página.',
            ],
            howto: [
                { question: '¿Para qué se usa Open Graph?', answer: '<p>Las etiquetas Open Graph controlan cómo se ve tu página cuando se comparte en plataformas sociales como Facebook y LinkedIn — el título, descripción e imagen mostrados en la vista previa del enlace.</p>' },
                { question: '¿Necesito las etiquetas Twitter Card por separado de Open Graph?', answer: '<p>X (Twitter) lee principalmente sus propias etiquetas twitter:, aunque recurrirá a las etiquetas Open Graph si faltan las de Twitter Card — incluir ambas cubre más plataformas de forma más fiable.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.es, type: 'text', placeholder: 'Mi Página Increíble' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.es, type: 'text', placeholder: 'Una descripción corta y atractiva de esta página.' },
                { name: 'url', label: PAGE_URL_LABEL.es, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.es, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.es, type: 'text', placeholder: 'Mi Sitio Web' },
            ],
            outputs: [],
        },
        fr: {
            slug: 'generateur-de-balises-meta-et-open-graph', title: 'Générateur de Balises Méta et Open Graph', h1: 'Générateur de Balises Méta et Open Graph',
            meta_title: 'Générateur de Balises Méta et Open Graph | Créez des Balises HTML Meta et OG',
            meta_description: 'Générez un bloc prêt à coller de balises title, méta description, Open Graph et Twitter Card pour n\'importe quelle page.',
            short_answer: 'Cet outil génère un bloc complet de balises méta HTML, ex. remplir un titre, une description et une URL produit des balises title, méta description, Open Graph et Twitter Card prêtes à coller dans le head de votre page.',
            intro_text: '<p>Remplissez le titre, la description, l\'URL de votre page et, en option, une image et un nom de site pour générer un bloc prêt à coller de balises méta — couvrant les balises title/description standard, Open Graph (utilisé par Facebook, LinkedIn et d\'autres) et les balises Twitter Card.</p>',
            key_points: [
                '<b>Toujours inclus :</b> balise title, méta description et les balises Open Graph principales (og:title, og:description, og:url, og:type).',
                '<b>Inclus si fourni :</b> og:image et twitter:image (si une URL d\'image est donnée), et og:site_name (si un nom de site est donné).',
                '<b>Où coller :</b> ces balises appartiennent à la section &lt;head&gt; HTML de votre page.',
            ],
            howto: [
                { question: 'À quoi sert Open Graph ?', answer: '<p>Les balises Open Graph contrôlent l\'apparence de votre page lorsqu\'elle est partagée sur des plateformes sociales comme Facebook et LinkedIn — le titre, la description et l\'image affichés dans l\'aperçu du lien.</p>' },
                { question: 'Ai-je besoin des balises Twitter Card séparément d\'Open Graph ?', answer: '<p>X (Twitter) lit principalement ses propres balises twitter:, bien qu\'il se rabatte sur les balises Open Graph si les balises Twitter Card sont manquantes — inclure les deux couvre plus de plateformes de manière plus fiable.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.fr, type: 'text', placeholder: 'Ma Page Géniale' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.fr, type: 'text', placeholder: 'Une description courte et convaincante de cette page.' },
                { name: 'url', label: PAGE_URL_LABEL.fr, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.fr, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.fr, type: 'text', placeholder: 'Mon Site Web' },
            ],
            outputs: [],
        },
        it: {
            slug: 'generatore-di-meta-tag-e-open-graph', title: 'Generatore di Meta Tag e Open Graph', h1: 'Generatore di Meta Tag e Open Graph',
            meta_title: 'Generatore di Meta Tag e Open Graph | Crea Tag HTML Meta e OG',
            meta_description: 'Genera un blocco pronto da incollare di tag title, meta descrizione, Open Graph e Twitter Card per qualsiasi pagina.',
            short_answer: 'Questo strumento genera un blocco completo di meta tag HTML, es. compilare un titolo, una descrizione e un URL produce tag title, meta descrizione, Open Graph e Twitter Card pronti da incollare nell\'head della tua pagina.',
            intro_text: '<p>Compila il titolo, la descrizione, l\'URL della tua pagina e opzionalmente un\'immagine e un nome del sito per generare un blocco pronto da incollare di meta tag — coprendo i tag standard title/descrizione, Open Graph (usato da Facebook, LinkedIn e altri) e i tag Twitter Card.</p>',
            key_points: [
                '<b>Sempre incluso:</b> tag title, meta descrizione e i tag Open Graph principali (og:title, og:description, og:url, og:type).',
                '<b>Incluso se fornito:</b> og:image e twitter:image (se viene fornito un URL immagine), e og:site_name (se viene fornito un nome del sito).',
                '<b>Dove incollare:</b> questi tag appartengono alla sezione &lt;head&gt; HTML della tua pagina.',
            ],
            howto: [
                { question: 'A cosa serve Open Graph?', answer: '<p>I tag Open Graph controllano come appare la tua pagina quando viene condivisa su piattaforme social come Facebook e LinkedIn — il titolo, la descrizione e l\'immagine mostrati nell\'anteprima del link.</p>' },
                { question: 'Ho bisogno dei tag Twitter Card separatamente da Open Graph?', answer: '<p>X (Twitter) legge principalmente i propri tag twitter:, anche se ricorrerà ai tag Open Graph se i tag Twitter Card mancano — includere entrambi copre più piattaforme in modo più affidabile.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.it, type: 'text', placeholder: 'La Mia Fantastica Pagina' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.it, type: 'text', placeholder: 'Una descrizione breve e convincente di questa pagina.' },
                { name: 'url', label: PAGE_URL_LABEL.it, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.it, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.it, type: 'text', placeholder: 'Il Mio Sito Web' },
            ],
            outputs: [],
        },
        de: {
            slug: 'meta-tag-open-graph-generator', title: 'Meta-Tag & Open-Graph-Generator', h1: 'Meta-Tag & Open-Graph-Generator',
            meta_title: 'Meta-Tag & Open-Graph-Generator | HTML Meta- und OG-Tags Erstellen',
            meta_description: 'Generieren Sie einen einfügbereiten Block aus Title-, Meta-Beschreibungs-, Open-Graph- und Twitter-Card-Tags für jede Seite.',
            short_answer: 'Dieses Tool generiert einen vollständigen Block von HTML-Meta-Tags, z.B. ergibt das Ausfüllen von Titel, Beschreibung und URL fertige Title-, Meta-Beschreibungs-, Open-Graph- und Twitter-Card-Tags zum Einfügen in den Head Ihrer Seite.',
            intro_text: '<p>Füllen Sie Titel, Beschreibung, URL Ihrer Seite und optional ein Bild und einen Site-Namen aus, um einen einfügebereiten Block von Meta-Tags zu generieren — einschließlich der Standard-Title-/Beschreibungs-Tags, Open Graph (verwendet von Facebook, LinkedIn und anderen) und Twitter-Card-Tags.</p>',
            key_points: [
                '<b>Immer enthalten:</b> Title-Tag, Meta-Beschreibung und die Kern-Open-Graph-Tags (og:title, og:description, og:url, og:type).',
                '<b>Enthalten, falls angegeben:</b> og:image und twitter:image (falls eine Bild-URL angegeben ist) und og:site_name (falls ein Site-Name angegeben ist).',
                '<b>Wo einfügen:</b> diese Tags gehören in den &lt;head&gt;-Bereich des HTML Ihrer Seite.',
            ],
            howto: [
                { question: 'Wofür wird Open Graph verwendet?', answer: '<p>Open-Graph-Tags steuern, wie Ihre Seite aussieht, wenn sie auf sozialen Plattformen wie Facebook und LinkedIn geteilt wird — Titel, Beschreibung und Bild, die in der Link-Vorschau angezeigt werden.</p>' },
                { question: 'Benötige ich Twitter-Card-Tags getrennt von Open Graph?', answer: '<p>X (Twitter) liest hauptsächlich seine eigenen twitter:-Tags, greift aber auf Open-Graph-Tags zurück, wenn Twitter-Card-Tags fehlen — beide einzuschließen deckt zuverlässiger mehr Plattformen ab.</p>' },
            ],
            inputs: [
                { name: 'title', label: PAGE_TITLE_INPUT_LABEL.de, type: 'text', placeholder: 'Meine Tolle Seite' },
                { name: 'description', label: PAGE_DESCRIPTION_INPUT_LABEL.de, type: 'text', placeholder: 'Eine kurze, überzeugende Beschreibung dieser Seite.' },
                { name: 'url', label: PAGE_URL_LABEL.de, type: 'text', placeholder: 'https://example.com/page' },
                { name: 'image_url', label: IMAGE_URL_INPUT_LABEL.de, type: 'text', placeholder: 'https://example.com/image.jpg' },
                { name: 'site_name', label: SITE_NAME_INPUT_LABEL.de, type: 'text', placeholder: 'Meine Website' },
            ],
            outputs: [],
        },
    },
}

// ============================================================
// 1191: Robots.txt Generator
// ============================================================
const ALLOW_ALL_OPTIONS: Record<string, { value: string; label: string }[]> = {
    en: [{ value: 'yes', label: 'Allow all crawlers everywhere' }, { value: 'no', label: 'Disallow specific paths (set below)' }],
    ru: [{ value: 'yes', label: 'Разрешить всем краулерам всё' }, { value: 'no', label: 'Запретить конкретные пути (указать ниже)' }],
    lv: [{ value: 'yes', label: 'Atļaut visiem robotiem visur' }, { value: 'no', label: 'Aizliegt konkrētus ceļus (norādīt zemāk)' }],
    pl: [{ value: 'yes', label: 'Zezwól wszystkim robotom wszędzie' }, { value: 'no', label: 'Zablokuj konkretne ścieżki (podaj poniżej)' }],
    es: [{ value: 'yes', label: 'Permitir todos los rastreadores en todas partes' }, { value: 'no', label: 'Bloquear rutas específicas (definir abajo)' }],
    fr: [{ value: 'yes', label: 'Autoriser tous les robots partout' }, { value: 'no', label: 'Interdire des chemins spécifiques (ci-dessous)' }],
    it: [{ value: 'yes', label: 'Consenti tutti i crawler ovunque' }, { value: 'no', label: 'Blocca percorsi specifici (sotto)' }],
    de: [{ value: 'yes', label: 'Alle Crawler überall erlauben' }, { value: 'no', label: 'Bestimmte Pfade sperren (unten festlegen)' }],
}
const ALLOW_ALL_SELECT_LABEL: Record<string, string> = {
    en: 'Crawling Policy', ru: 'Политика сканирования', lv: 'Skenēšanas Politika', pl: 'Polityka Indeksowania',
    es: 'Política de Rastreo', fr: 'Politique de Crawl', it: 'Politica di Scansione', de: 'Crawling-Richtlinie',
}
const DISALLOW_PATHS_LABEL: Record<string, string> = {
    en: 'Paths to Disallow (comma-separated)', ru: 'Пути для запрета (через запятую)', lv: 'Aizliedzamie Ceļi (atdalīti ar komatu)', pl: 'Ścieżki do Zablokowania (oddzielone przecinkami)',
    es: 'Rutas a Bloquear (separadas por comas)', fr: 'Chemins à Interdire (séparés par des virgules)', it: 'Percorsi da Bloccare (separati da virgole)', de: 'Zu Sperrende Pfade (kommagetrennt)',
}
const SITEMAP_URL_LABEL: Record<string, string> = {
    en: 'Sitemap URL (optional)', ru: 'URL карты сайта (необязательно)', lv: 'Vietnes Kartes URL (nav obligāts)', pl: 'Adres URL Mapy Strony (opcjonalnie)',
    es: 'URL del Sitemap (opcional)', fr: 'URL du Sitemap (facultatif)', it: 'URL della Sitemap (opzionale)', de: 'Sitemap-URL (optional)',
}
const USER_AGENT_LABEL: Record<string, string> = {
    en: 'User-agent (default: *)', ru: 'User-agent (по умолчанию: *)', lv: 'User-agent (noklusējums: *)', pl: 'User-agent (domyślnie: *)',
    es: 'User-agent (predeterminado: *)', fr: 'User-agent (par défaut : *)', it: 'User-agent (predefinito: *)', de: 'User-agent (Standard: *)',
}

const robotsTxtGeneratorTool: ToolDef = {
    id: '1191',
    type: 'calculator',
    config_json: {
        inputs: [
            { key: 'allow_all', default: 'no' },
            { key: 'disallow_paths', default: '/admin, /private' },
            { key: 'sitemap_url', default: 'https://example.com/sitemap.xml' },
            { key: 'user_agent', default: '*' },
        ],
        functions: { result: { type: 'function', functionName: 'robotsTxtGenerator', params: { allow_all: 'allow_all', disallow_paths: 'disallow_paths', sitemap_url: 'sitemap_url', user_agent: 'user_agent' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'robots-txt-generator', title: 'Robots.txt Generator', h1: 'Robots.txt Generator',
            meta_title: 'Robots.txt Generator | Create a robots.txt File for Your Site',
            meta_description: 'Generate a valid robots.txt file to control which pages search engine crawlers can access, plus an optional sitemap reference.',
            short_answer: 'This tool generates a robots.txt file, e.g. disallowing /admin and /private produces a file that blocks those paths while allowing everything else.',
            intro_text: '<p>Choose whether to allow all crawling or block specific paths, optionally add your sitemap URL, and generate a ready-to-use robots.txt file for your website\'s root directory.</p>',
            key_points: [
                '<b>File location:</b> robots.txt must be placed at the root of your domain (e.g. https://example.com/robots.txt) to be recognized by search engines.',
                '<b>Disallow paths</b> should start with a forward slash (e.g. /admin) — the tool adds one automatically if you forget.',
                '<b>Important:</b> robots.txt is a voluntary standard — well-behaved crawlers (like Googlebot) respect it, but it doesn\'t prevent access outright and isn\'t a security measure for sensitive content.',
            ],
            howto: [
                { question: 'Should I block my whole site from crawlers?', answer: '<p>Usually not — blocking everything (Disallow: /) prevents search engines from indexing your site at all, which is rarely what you want except for staging/development sites.</p>' },
                { question: 'Why include a sitemap reference?', answer: '<p>Pointing to your sitemap in robots.txt helps search engines discover all your important pages more efficiently.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.en, type: 'select', options: ALLOW_ALL_OPTIONS.en },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.en, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.en, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.en, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        ru: {
            slug: 'generator-robots-txt', title: 'Генератор robots.txt', h1: 'Генератор robots.txt',
            meta_title: 'Генератор robots.txt | Создание файла robots.txt для вашего сайта',
            meta_description: 'Сгенерируйте корректный файл robots.txt, чтобы контролировать доступ поисковых краулеров к страницам, плюс необязательная ссылка на карту сайта.',
            short_answer: 'Этот инструмент генерирует файл robots.txt, например запрет /admin и /private создаёт файл, блокирующий эти пути и разрешающий всё остальное.',
            intro_text: '<p>Выберите, разрешить ли полное сканирование или заблокировать конкретные пути, при желании добавьте URL карты сайта, и сгенерируйте готовый к использованию файл robots.txt для корневого каталога вашего сайта.</p>',
            key_points: [
                '<b>Расположение файла:</b> robots.txt должен находиться в корне вашего домена (например, https://example.com/robots.txt), чтобы его распознавали поисковые системы.',
                '<b>Запрещённые пути</b> должны начинаться с косой черты (например, /admin) — инструмент добавит её автоматически, если вы забудете.',
                '<b>Важно:</b> robots.txt — это добровольный стандарт — добросовестные краулеры (например, Googlebot) его соблюдают, но он не блокирует доступ полностью и не является мерой безопасности для конфиденциального контента.',
            ],
            howto: [
                { question: 'Стоит ли блокировать весь сайт от краулеров?', answer: '<p>Обычно нет — блокировка всего (Disallow: /) не даёт поисковым системам индексировать сайт вообще, что редко нужно, кроме тестовых/разрабатываемых сайтов.</p>' },
                { question: 'Зачем включать ссылку на карту сайта?', answer: '<p>Указание на карту сайта в robots.txt помогает поисковым системам эффективнее находить все важные страницы.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.ru, type: 'select', options: ALLOW_ALL_OPTIONS.ru },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.ru, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.ru, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.ru, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        lv: {
            slug: 'robots-txt-generators', title: 'Robots.txt Ģenerators', h1: 'Robots.txt Ģenerators',
            meta_title: 'Robots.txt Ģenerators | Izveidojiet robots.txt Failu Savai Vietnei',
            meta_description: 'Ģenerējiet derīgu robots.txt failu, lai kontrolētu, kuras lapas meklētājprogrammu roboti var piekļūt, plus neobligāta vietnes kartes atsauce.',
            short_answer: 'Šis rīks ģenerē robots.txt failu, piemēram, aizliedzot /admin un /private tiek izveidots fails, kas bloķē šos ceļus, atļaujot visu pārējo.',
            intro_text: '<p>Izvēlieties, vai atļaut pilnīgu skenēšanu vai bloķēt konkrētus ceļus, pēc izvēles pievienojiet vietnes kartes URL, un ģenerējiet gatavu lietošanai robots.txt failu jūsu vietnes saknes direktorijai.</p>',
            key_points: [
                '<b>Faila atrašanās vieta:</b> robots.txt jāievieto jūsu domēna saknē (piem., https://example.com/robots.txt), lai meklētājprogrammas to atpazītu.',
                '<b>Aizliegtajiem ceļiem</b> jāsākas ar slīpsvītru (piem., /admin) — rīks to pievieno automātiski, ja aizmirstat.',
                '<b>Svarīgi:</b> robots.txt ir brīvprātīgs standarts — labi uzvedušies roboti (piem., Googlebot) to ievēro, bet tas pilnībā nebloķē piekļuvi un nav drošības pasākums sensitīvam saturam.',
            ],
            howto: [
                { question: 'Vai man jābloķē visa vietne no robotiem?', answer: '<p>Parasti nē — visu bloķēšana (Disallow: /) neļauj meklētājprogrammām jūsu vietni vispār indeksēt, kas reti ir vēlams, izņemot testa/izstrādes vietnes.</p>' },
                { question: 'Kāpēc iekļaut vietnes kartes atsauci?', answer: '<p>Norāde uz vietnes karti robots.txt palīdz meklētājprogrammām efektīvāk atklāt visas svarīgās lapas.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.lv, type: 'select', options: ALLOW_ALL_OPTIONS.lv },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.lv, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.lv, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.lv, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        pl: {
            slug: 'generator-robots-txt', title: 'Generator Robots.txt', h1: 'Generator Robots.txt',
            meta_title: 'Generator Robots.txt | Utwórz Plik robots.txt dla Swojej Strony',
            meta_description: 'Wygeneruj prawidłowy plik robots.txt, aby kontrolować, do których stron mają dostęp roboty wyszukiwarek, plus opcjonalne odniesienie do mapy strony.',
            short_answer: 'To narzędzie generuje plik robots.txt, np. zablokowanie /admin i /private tworzy plik blokujący te ścieżki i zezwalający na resztę.',
            intro_text: '<p>Wybierz, czy zezwolić na pełne indeksowanie, czy zablokować konkretne ścieżki, opcjonalnie dodaj adres URL mapy strony i wygeneruj gotowy do użycia plik robots.txt dla katalogu głównego swojej witryny.</p>',
            key_points: [
                '<b>Lokalizacja pliku:</b> robots.txt musi znajdować się w katalogu głównym twojej domeny (np. https://example.com/robots.txt), aby był rozpoznawany przez wyszukiwarki.',
                '<b>Blokowane ścieżki</b> powinny zaczynać się od ukośnika (np. /admin) — narzędzie doda go automatycznie, jeśli zapomnisz.',
                '<b>Ważne:</b> robots.txt to dobrowolny standard — dobrze zachowujące się roboty (jak Googlebot) go przestrzegają, ale nie blokuje on całkowicie dostępu i nie jest środkiem bezpieczeństwa dla wrażliwych treści.',
            ],
            howto: [
                { question: 'Czy powinienem zablokować całą swoją stronę przed robotami?', answer: '<p>Zwykle nie — zablokowanie wszystkiego (Disallow: /) uniemożliwia wyszukiwarkom indeksowanie strony w ogóle, co rzadko jest pożądane poza stronami testowymi/deweloperskimi.</p>' },
                { question: 'Dlaczego dołączać odniesienie do mapy strony?', answer: '<p>Wskazanie mapy strony w robots.txt pomaga wyszukiwarkom efektywniej odkrywać wszystkie ważne strony.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.pl, type: 'select', options: ALLOW_ALL_OPTIONS.pl },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.pl, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.pl, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.pl, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        es: {
            slug: 'generador-de-robots-txt', title: 'Generador de Robots.txt', h1: 'Generador de Robots.txt',
            meta_title: 'Generador de Robots.txt | Crea un Archivo robots.txt para tu Sitio',
            meta_description: 'Genera un archivo robots.txt válido para controlar a qué páginas pueden acceder los rastreadores de motores de búsqueda, más una referencia opcional al sitemap.',
            short_answer: 'Esta herramienta genera un archivo robots.txt, p. ej. bloquear /admin y /private produce un archivo que bloquea esas rutas mientras permite todo lo demás.',
            intro_text: '<p>Elige si permitir el rastreo completo o bloquear rutas específicas, opcionalmente añade la URL de tu sitemap, y genera un archivo robots.txt listo para usar en el directorio raíz de tu sitio web.</p>',
            key_points: [
                '<b>Ubicación del archivo:</b> robots.txt debe colocarse en la raíz de tu dominio (p. ej. https://example.com/robots.txt) para que los motores de búsqueda lo reconozcan.',
                '<b>Las rutas bloqueadas</b> deben comenzar con una barra diagonal (p. ej. /admin) — la herramienta añade una automáticamente si la olvidas.',
                '<b>Importante:</b> robots.txt es un estándar voluntario — los rastreadores bien portados (como Googlebot) lo respetan, pero no impide el acceso por completo y no es una medida de seguridad para contenido sensible.',
            ],
            howto: [
                { question: '¿Debería bloquear todo mi sitio de los rastreadores?', answer: '<p>Generalmente no — bloquear todo (Disallow: /) impide que los motores de búsqueda indexen tu sitio por completo, lo cual raramente es deseable excepto en sitios de pruebas/desarrollo.</p>' },
                { question: '¿Por qué incluir una referencia al sitemap?', answer: '<p>Apuntar a tu sitemap en robots.txt ayuda a los motores de búsqueda a descubrir todas tus páginas importantes de forma más eficiente.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.es, type: 'select', options: ALLOW_ALL_OPTIONS.es },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.es, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.es, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.es, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        fr: {
            slug: 'generateur-de-robots-txt', title: 'Générateur de Robots.txt', h1: 'Générateur de Robots.txt',
            meta_title: 'Générateur de Robots.txt | Créez un Fichier robots.txt pour Votre Site',
            meta_description: 'Générez un fichier robots.txt valide pour contrôler quelles pages les robots des moteurs de recherche peuvent explorer, plus une référence optionnelle au sitemap.',
            short_answer: 'Cet outil génère un fichier robots.txt, ex. interdire /admin et /private produit un fichier qui bloque ces chemins tout en autorisant tout le reste.',
            intro_text: '<p>Choisissez d\'autoriser l\'exploration complète ou de bloquer des chemins spécifiques, ajoutez éventuellement l\'URL de votre sitemap, et générez un fichier robots.txt prêt à l\'emploi pour le répertoire racine de votre site web.</p>',
            key_points: [
                '<b>Emplacement du fichier :</b> robots.txt doit être placé à la racine de votre domaine (ex. https://example.com/robots.txt) pour être reconnu par les moteurs de recherche.',
                '<b>Les chemins interdits</b> doivent commencer par une barre oblique (ex. /admin) — l\'outil en ajoute une automatiquement si vous l\'oubliez.',
                '<b>Important :</b> robots.txt est une norme volontaire — les robots bien élevés (comme Googlebot) le respectent, mais cela n\'empêche pas l\'accès de manière absolue et ce n\'est pas une mesure de sécurité pour le contenu sensible.',
            ],
            howto: [
                { question: 'Devrais-je bloquer tout mon site aux robots ?', answer: '<p>Généralement non — bloquer tout (Disallow: /) empêche les moteurs de recherche d\'indexer votre site du tout, ce qui est rarement souhaité sauf pour les sites de test/développement.</p>' },
                { question: 'Pourquoi inclure une référence au sitemap ?', answer: '<p>Pointer vers votre sitemap dans robots.txt aide les moteurs de recherche à découvrir plus efficacement toutes vos pages importantes.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.fr, type: 'select', options: ALLOW_ALL_OPTIONS.fr },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.fr, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.fr, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.fr, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        it: {
            slug: 'generatore-di-robots-txt', title: 'Generatore di Robots.txt', h1: 'Generatore di Robots.txt',
            meta_title: 'Generatore di Robots.txt | Crea un File robots.txt per il Tuo Sito',
            meta_description: 'Genera un file robots.txt valido per controllare quali pagine i crawler dei motori di ricerca possono accedere, più un riferimento opzionale alla sitemap.',
            short_answer: 'Questo strumento genera un file robots.txt, es. bloccare /admin e /private produce un file che blocca questi percorsi permettendo tutto il resto.',
            intro_text: '<p>Scegli se consentire la scansione completa o bloccare percorsi specifici, aggiungi opzionalmente l\'URL della tua sitemap, e genera un file robots.txt pronto all\'uso per la directory principale del tuo sito web.</p>',
            key_points: [
                '<b>Posizione del file:</b> robots.txt deve essere posizionato nella radice del tuo dominio (es. https://example.com/robots.txt) per essere riconosciuto dai motori di ricerca.',
                '<b>I percorsi bloccati</b> dovrebbero iniziare con una barra (es. /admin) — lo strumento ne aggiunge una automaticamente se te ne dimentichi.',
                '<b>Importante:</b> robots.txt è uno standard volontario — i crawler ben educati (come Googlebot) lo rispettano, ma non impedisce l\'accesso in modo assoluto e non è una misura di sicurezza per contenuti sensibili.',
            ],
            howto: [
                { question: 'Dovrei bloccare l\'intero sito dai crawler?', answer: '<p>Di solito no — bloccare tutto (Disallow: /) impedisce ai motori di ricerca di indicizzare completamente il tuo sito, cosa raramente desiderata tranne che per siti di staging/sviluppo.</p>' },
                { question: 'Perché includere un riferimento alla sitemap?', answer: '<p>Puntare alla tua sitemap in robots.txt aiuta i motori di ricerca a scoprire tutte le tue pagine importanti in modo più efficiente.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.it, type: 'select', options: ALLOW_ALL_OPTIONS.it },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.it, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.it, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.it, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
        de: {
            slug: 'robots-txt-generator', title: 'Robots.txt-Generator', h1: 'Robots.txt-Generator',
            meta_title: 'Robots.txt-Generator | Erstellen Sie eine robots.txt-Datei für Ihre Website',
            meta_description: 'Generieren Sie eine gültige robots.txt-Datei, um zu steuern, auf welche Seiten Suchmaschinen-Crawler zugreifen können, plus eine optionale Sitemap-Referenz.',
            short_answer: 'Dieses Tool generiert eine robots.txt-Datei, z.B. erzeugt das Sperren von /admin und /private eine Datei, die diese Pfade blockiert und alles andere erlaubt.',
            intro_text: '<p>Wählen Sie, ob vollständiges Crawling erlaubt oder bestimmte Pfade gesperrt werden sollen, fügen Sie optional Ihre Sitemap-URL hinzu und generieren Sie eine einsatzbereite robots.txt-Datei für das Stammverzeichnis Ihrer Website.</p>',
            key_points: [
                '<b>Dateispeicherort:</b> robots.txt muss im Stammverzeichnis Ihrer Domain abgelegt werden (z.B. https://example.com/robots.txt), um von Suchmaschinen erkannt zu werden.',
                '<b>Gesperrte Pfade</b> sollten mit einem Schrägstrich beginnen (z.B. /admin) — das Tool fügt automatisch einen hinzu, falls Sie es vergessen.',
                '<b>Wichtig:</b> robots.txt ist ein freiwilliger Standard — wohlerzogene Crawler (wie Googlebot) respektieren ihn, aber er verhindert den Zugriff nicht vollständig und ist keine Sicherheitsmaßnahme für sensible Inhalte.',
            ],
            howto: [
                { question: 'Sollte ich meine gesamte Website vor Crawlern sperren?', answer: '<p>Normalerweise nicht — das Sperren von allem (Disallow: /) verhindert, dass Suchmaschinen Ihre Website überhaupt indexieren, was außer bei Staging-/Entwicklungsseiten selten gewünscht ist.</p>' },
                { question: 'Warum eine Sitemap-Referenz einschließen?', answer: '<p>Der Verweis auf Ihre Sitemap in robots.txt hilft Suchmaschinen, alle Ihre wichtigen Seiten effizienter zu entdecken.</p>' },
            ],
            inputs: [
                { name: 'allow_all', label: ALLOW_ALL_SELECT_LABEL.de, type: 'select', options: ALLOW_ALL_OPTIONS.de },
                { name: 'disallow_paths', label: DISALLOW_PATHS_LABEL.de, type: 'text', placeholder: '/admin, /private' },
                { name: 'sitemap_url', label: SITEMAP_URL_LABEL.de, type: 'text', placeholder: 'https://example.com/sitemap.xml' },
                { name: 'user_agent', label: USER_AGENT_LABEL.de, type: 'text', placeholder: '*' },
            ],
            outputs: [],
        },
    },
}

// ============================================================
// 1192: Lorem Ipsum Generator
// ============================================================
const PARAGRAPHS_INPUT_LABEL: Record<string, string> = {
    en: 'Number of Paragraphs', ru: 'Количество абзацев', lv: 'Rindkopu Skaits', pl: 'Liczba Akapitów',
    es: 'Número de Párrafos', fr: 'Nombre de Paragraphes', it: 'Numero di Paragrafi', de: 'Anzahl der Absätze',
}

const loremIpsumGeneratorTool: ToolDef = {
    id: '1192',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'paragraphs', default: 3 }],
        functions: { result: { type: 'function', functionName: 'loremIpsumGenerator', params: { paragraphs: 'paragraphs' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'lorem-ipsum-generator', title: 'Lorem Ipsum Generator', h1: 'Lorem Ipsum Generator',
            meta_title: 'Lorem Ipsum Generator | Placeholder Text for Mockups and Designs',
            meta_description: 'Generate classic Lorem Ipsum placeholder text in any number of paragraphs for mockups, designs, and layout testing.',
            short_answer: 'This tool generates placeholder text, e.g. requesting 3 paragraphs produces 3 blocks of classic-style Lorem Ipsum text.',
            intro_text: '<p>Choose how many paragraphs you need and generate classic-style Lorem Ipsum placeholder text — useful for filling mockups, wireframes, and designs before real content is ready.</p>',
            key_points: [
                '<b>Up to 20 paragraphs</b> can be generated at once.',
                '<b>The first paragraph always starts</b> with the traditional "Lorem ipsum dolor sit amet, consectetur adipiscing elit" opening that\'s instantly recognizable as placeholder text.',
                '<b>Deterministic output:</b> the same paragraph count always produces the same text, making it easy to reference or reproduce a layout test.',
            ],
            howto: [
                { question: 'Why use Lorem Ipsum instead of real text?', answer: '<p>Lorem Ipsum has a natural-looking distribution of letters and word lengths without being distracting or meaningful, so it doesn\'t bias how a design or layout is judged.</p>' },
                { question: 'Can I use this text commercially?', answer: '<p>Lorem Ipsum is placeholder/dummy text with no copyright concerns — it\'s freely used across the design and publishing industry for mockups.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.en, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        ru: {
            slug: 'generator-lorem-ipsum', title: 'Генератор Lorem Ipsum', h1: 'Генератор Lorem Ipsum',
            meta_title: 'Генератор Lorem Ipsum | Текст-заполнитель для макетов и дизайна',
            meta_description: 'Сгенерируйте классический текст-заполнитель Lorem Ipsum в любом количестве абзацев для макетов, дизайна и тестирования вёрстки.',
            short_answer: 'Этот инструмент генерирует текст-заполнитель, например запрос 3 абзацев создаёт 3 блока классического текста Lorem Ipsum.',
            intro_text: '<p>Выберите, сколько абзацев вам нужно, и сгенерируйте классический текст-заполнитель Lorem Ipsum — полезно для заполнения макетов, вайрфреймов и дизайнов до готовности реального контента.</p>',
            key_points: [
                '<b>Можно сгенерировать до 20 абзацев</b> за раз.',
                '<b>Первый абзац всегда начинается</b> с традиционного вступления "Lorem ipsum dolor sit amet, consectetur adipiscing elit", мгновенно узнаваемого как текст-заполнитель.',
                '<b>Детерминированный вывод:</b> одинаковое количество абзацев всегда даёт одинаковый текст, что упрощает ссылку на макет или его воспроизведение.',
            ],
            howto: [
                { question: 'Зачем использовать Lorem Ipsum вместо реального текста?', answer: '<p>Lorem Ipsum имеет естественное распределение букв и длин слов, не отвлекая и не неся смысла, поэтому не влияет на восприятие дизайна или вёрстки.</p>' },
                { question: 'Можно ли использовать этот текст коммерчески?', answer: '<p>Lorem Ipsum — это текст-заполнитель без проблем с авторским правом — он свободно используется в индустрии дизайна и издательского дела для макетов.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.ru, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        lv: {
            slug: 'lorem-ipsum-generators', title: 'Lorem Ipsum Ģenerators', h1: 'Lorem Ipsum Ģenerators',
            meta_title: 'Lorem Ipsum Ģenerators | Aizpildījuma Teksts Maketiem un Dizainam',
            meta_description: 'Ģenerējiet klasisko Lorem Ipsum aizpildījuma tekstu jebkādā rindkopu skaitā maketiem, dizainam un izkārtojuma testēšanai.',
            short_answer: 'Šis rīks ģenerē aizpildījuma tekstu, piemēram, pieprasot 3 rindkopas tiek izveidoti 3 klasiskā stila Lorem Ipsum teksta bloki.',
            intro_text: '<p>Izvēlieties, cik rindkopu jums nepieciešams, un ģenerējiet klasiskā stila Lorem Ipsum aizpildījuma tekstu — noderīgi maketu, karkasu un dizainu aizpildīšanai, pirms reālais saturs ir gatavs.</p>',
            key_points: [
                '<b>Vienlaicīgi var ģenerēt līdz 20 rindkopām.</b>',
                '<b>Pirmā rindkopa vienmēr sākas</b> ar tradicionālo "Lorem ipsum dolor sit amet, consectetur adipiscing elit" ievadu, kas ir uzreiz atpazīstams kā aizpildījuma teksts.',
                '<b>Determinēts rezultāts:</b> vienāds rindkopu skaits vienmēr rada vienādu tekstu, atvieglojot izkārtojuma testa atsauci vai reproducēšanu.',
            ],
            howto: [
                { question: 'Kāpēc izmantot Lorem Ipsum, nevis reālu tekstu?', answer: '<p>Lorem Ipsum ir dabiski izskatošos burtu un vārdu garumu sadalījums, nebūdams uzmanību novēršošs vai jēgpilns, tāpēc tas neietekmē dizaina vai izkārtojuma vērtējumu.</p>' },
                { question: 'Vai varu izmantot šo tekstu komerciāli?', answer: '<p>Lorem Ipsum ir aizpildījuma teksts bez autortiesību problēmām — tas tiek brīvi izmantots dizaina un izdevniecības nozarē maketiem.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.lv, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        pl: {
            slug: 'generator-lorem-ipsum', title: 'Generator Lorem Ipsum', h1: 'Generator Lorem Ipsum',
            meta_title: 'Generator Lorem Ipsum | Tekst Zastępczy do Makiet i Projektów',
            meta_description: 'Wygeneruj klasyczny tekst zastępczy Lorem Ipsum w dowolnej liczbie akapitów do makiet, projektów i testowania układu.',
            short_answer: 'To narzędzie generuje tekst zastępczy, np. żądanie 3 akapitów tworzy 3 bloki klasycznego tekstu Lorem Ipsum.',
            intro_text: '<p>Wybierz, ile akapitów potrzebujesz, i wygeneruj klasyczny tekst zastępczy Lorem Ipsum — przydatny do wypełniania makiet, szkieletów i projektów przed przygotowaniem prawdziwej treści.</p>',
            key_points: [
                '<b>Można wygenerować do 20 akapitów</b> jednocześnie.',
                '<b>Pierwszy akapit zawsze zaczyna się</b> od tradycyjnego wstępu "Lorem ipsum dolor sit amet, consectetur adipiscing elit", natychmiast rozpoznawalnego jako tekst zastępczy.',
                '<b>Deterministyczny wynik:</b> ta sama liczba akapitów zawsze daje ten sam tekst, ułatwiając odniesienie się do testu układu lub jego odtworzenie.',
            ],
            howto: [
                { question: 'Dlaczego używać Lorem Ipsum zamiast prawdziwego tekstu?', answer: '<p>Lorem Ipsum ma naturalnie wyglądający rozkład liter i długości słów, nie rozpraszając uwagi ani nie niosąc znaczenia, więc nie wpływa na ocenę projektu czy układu.</p>' },
                { question: 'Czy mogę używać tego tekstu komercyjnie?', answer: '<p>Lorem Ipsum to tekst zastępczy bez problemów z prawami autorskimi — jest swobodnie używany w branży projektowej i wydawniczej do makiet.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.pl, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        es: {
            slug: 'generador-de-lorem-ipsum', title: 'Generador de Lorem Ipsum', h1: 'Generador de Lorem Ipsum',
            meta_title: 'Generador de Lorem Ipsum | Texto de Relleno para Maquetas y Diseños',
            meta_description: 'Genera texto de relleno Lorem Ipsum clásico en cualquier número de párrafos para maquetas, diseños y pruebas de diseño.',
            short_answer: 'Esta herramienta genera texto de relleno, p. ej. solicitar 3 párrafos produce 3 bloques de texto Lorem Ipsum de estilo clásico.',
            intro_text: '<p>Elige cuántos párrafos necesitas y genera texto de relleno Lorem Ipsum de estilo clásico — útil para rellenar maquetas, wireframes y diseños antes de que el contenido real esté listo.</p>',
            key_points: [
                '<b>Se pueden generar hasta 20 párrafos</b> a la vez.',
                '<b>El primer párrafo siempre comienza</b> con la apertura tradicional "Lorem ipsum dolor sit amet, consectetur adipiscing elit", instantáneamente reconocible como texto de relleno.',
                '<b>Salida determinista:</b> el mismo número de párrafos siempre produce el mismo texto, facilitando referenciar o reproducir una prueba de diseño.',
            ],
            howto: [
                { question: '¿Por qué usar Lorem Ipsum en lugar de texto real?', answer: '<p>Lorem Ipsum tiene una distribución de letras y longitudes de palabras de aspecto natural sin ser distractora o significativa, por lo que no sesga cómo se juzga un diseño o maqueta.</p>' },
                { question: '¿Puedo usar este texto comercialmente?', answer: '<p>Lorem Ipsum es texto de relleno/ficticio sin problemas de derechos de autor — se usa libremente en toda la industria del diseño y la publicación para maquetas.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.es, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        fr: {
            slug: 'generateur-de-lorem-ipsum', title: 'Générateur de Lorem Ipsum', h1: 'Générateur de Lorem Ipsum',
            meta_title: 'Générateur de Lorem Ipsum | Texte de Substitution pour Maquettes et Designs',
            meta_description: 'Générez du texte de substitution Lorem Ipsum classique en n\'importe quel nombre de paragraphes pour maquettes, designs et tests de mise en page.',
            short_answer: 'Cet outil génère du texte de substitution, ex. demander 3 paragraphes produit 3 blocs de texte Lorem Ipsum de style classique.',
            intro_text: '<p>Choisissez combien de paragraphes vous avez besoin et générez du texte de substitution Lorem Ipsum de style classique — utile pour remplir des maquettes, wireframes et designs avant que le vrai contenu soit prêt.</p>',
            key_points: [
                '<b>Jusqu\'à 20 paragraphes</b> peuvent être générés à la fois.',
                '<b>Le premier paragraphe commence toujours</b> par l\'ouverture traditionnelle "Lorem ipsum dolor sit amet, consectetur adipiscing elit", instantanément reconnaissable comme texte de substitution.',
                '<b>Sortie déterministe :</b> le même nombre de paragraphes produit toujours le même texte, facilitant la référence ou la reproduction d\'un test de mise en page.',
            ],
            howto: [
                { question: 'Pourquoi utiliser Lorem Ipsum plutôt que du vrai texte ?', answer: '<p>Lorem Ipsum a une distribution naturelle de lettres et de longueurs de mots sans être distrayant ou significatif, donc cela ne biaise pas l\'évaluation d\'un design ou d\'une mise en page.</p>' },
                { question: 'Puis-je utiliser ce texte commercialement ?', answer: '<p>Lorem Ipsum est un texte factice sans problème de droit d\'auteur — il est utilisé librement dans toute l\'industrie du design et de l\'édition pour les maquettes.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.fr, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        it: {
            slug: 'generatore-di-lorem-ipsum', title: 'Generatore di Lorem Ipsum', h1: 'Generatore di Lorem Ipsum',
            meta_title: 'Generatore di Lorem Ipsum | Testo Segnaposto per Mockup e Design',
            meta_description: 'Genera testo segnaposto Lorem Ipsum classico in qualsiasi numero di paragrafi per mockup, design e test di layout.',
            short_answer: 'Questo strumento genera testo segnaposto, es. richiedere 3 paragrafi produce 3 blocchi di testo Lorem Ipsum in stile classico.',
            intro_text: '<p>Scegli quanti paragrafi ti servono e genera testo segnaposto Lorem Ipsum in stile classico — utile per riempire mockup, wireframe e design prima che il contenuto reale sia pronto.</p>',
            key_points: [
                '<b>È possibile generare fino a 20 paragrafi</b> alla volta.',
                '<b>Il primo paragrafo inizia sempre</b> con l\'apertura tradizionale "Lorem ipsum dolor sit amet, consectetur adipiscing elit", immediatamente riconoscibile come testo segnaposto.',
                '<b>Output deterministico:</b> lo stesso numero di paragrafi produce sempre lo stesso testo, rendendo facile fare riferimento o riprodurre un test di layout.',
            ],
            howto: [
                { question: 'Perché usare Lorem Ipsum invece di testo reale?', answer: '<p>Lorem Ipsum ha una distribuzione naturale di lettere e lunghezze di parole senza essere distraente o significativo, quindi non influenza il giudizio su un design o layout.</p>' },
                { question: 'Posso usare questo testo commercialmente?', answer: '<p>Lorem Ipsum è testo segnaposto/fittizio senza problemi di copyright — è usato liberamente in tutto il settore del design e dell\'editoria per i mockup.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.it, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
        de: {
            slug: 'lorem-ipsum-generator', title: 'Lorem-Ipsum-Generator', h1: 'Lorem-Ipsum-Generator',
            meta_title: 'Lorem-Ipsum-Generator | Platzhaltertext für Mockups und Designs',
            meta_description: 'Generieren Sie klassischen Lorem-Ipsum-Platzhaltertext in beliebiger Absatzanzahl für Mockups, Designs und Layout-Tests.',
            short_answer: 'Dieses Tool generiert Platzhaltertext, z.B. erzeugt eine Anfrage von 3 Absätzen 3 Blöcke klassischen Lorem-Ipsum-Textes.',
            intro_text: '<p>Wählen Sie, wie viele Absätze Sie benötigen, und generieren Sie klassischen Lorem-Ipsum-Platzhaltertext — nützlich zum Füllen von Mockups, Wireframes und Designs, bevor echter Inhalt bereit ist.</p>',
            key_points: [
                '<b>Bis zu 20 Absätze</b> können auf einmal generiert werden.',
                '<b>Der erste Absatz beginnt immer</b> mit der traditionellen Eröffnung "Lorem ipsum dolor sit amet, consectetur adipiscing elit", die sofort als Platzhaltertext erkennbar ist.',
                '<b>Deterministische Ausgabe:</b> die gleiche Absatzanzahl erzeugt immer denselben Text, was es einfach macht, einen Layout-Test zu referenzieren oder zu reproduzieren.',
            ],
            howto: [
                { question: 'Warum Lorem Ipsum statt echtem Text verwenden?', answer: '<p>Lorem Ipsum hat eine natürlich aussehende Verteilung von Buchstaben und Wortlängen, ohne ablenkend oder bedeutungsvoll zu sein, sodass es die Beurteilung eines Designs oder Layouts nicht verfälscht.</p>' },
                { question: 'Kann ich diesen Text kommerziell verwenden?', answer: '<p>Lorem Ipsum ist Platzhalter-/Blindtext ohne Urheberrechtsbedenken — er wird in der gesamten Design- und Verlagsbranche frei für Mockups verwendet.</p>' },
            ],
            inputs: [{ name: 'paragraphs', label: PARAGRAPHS_INPUT_LABEL.de, type: 'number', min: 1, max: 20, placeholder: '3' }],
            outputs: [],
        },
    },
}

export const tools: ToolDef[] = [
    serpSnippetCheckerTool, removeTrackingParamsTool, utmUrlBuilderTool, readabilityScoreCalculatorTool,
    tournamentBracketGeneratorTool, platformLimitValidatorTool, slugGeneratorTool, duplicateLineRemoverTool,
    textDiffCheckerTool, metaTagGeneratorTool, robotsTxtGeneratorTool, loremIpsumGeneratorTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: UTILITIES_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: UTILITIES_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} utilities calculators across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
