// One-off script: seeds 11 new Word & Text Tools
// (Tool + ToolConfig + ToolI18n x8 + ToolCategory).
// Run with: npx tsx scripts/seed-word-text-tools.ts
//
// Tool IDs 1193-1203, category_id '8' (Word & Text Tools, top-level,
// already has 1 tool - Case Converter, id 1002). No explicit tool list was
// given, only 4 themes (word counting, SEO analysis, random name picking,
// spell checking) for 11 tools; the concrete list was proposed and
// confirmed with the user before writing content.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const WORD_TEXT_CATEGORY_ID = '8'

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
// 1193: Word & Character Counter
// ============================================================
const TEXT_TO_ANALYZE_LABEL: Record<string, string> = {
    en: 'Text to Analyze', ru: 'Текст для анализа', lv: 'Analizējamais Teksts', pl: 'Tekst do Analizy',
    es: 'Texto a Analizar', fr: 'Texte à Analyser', it: 'Testo da Analizzare', de: 'Zu Analysierender Text',
}
const WORD_COUNT_LABEL: Record<string, string> = {
    en: 'Word Count', ru: 'Количество слов', lv: 'Vārdu Skaits', pl: 'Liczba Słów',
    es: 'Recuento de Palabras', fr: 'Nombre de Mots', it: 'Conteggio Parole', de: 'Wortanzahl',
}
const CHAR_WITH_SPACES_LABEL: Record<string, string> = {
    en: 'Characters (with spaces)', ru: 'Символы (с пробелами)', lv: 'Rakstzīmes (ar atstarpēm)', pl: 'Znaki (ze spacjami)',
    es: 'Caracteres (con espacios)', fr: 'Caractères (avec espaces)', it: 'Caratteri (con spazi)', de: 'Zeichen (mit Leerzeichen)',
}
const CHAR_NO_SPACES_LABEL: Record<string, string> = {
    en: 'Characters (no spaces)', ru: 'Символы (без пробелов)', lv: 'Rakstzīmes (bez atstarpēm)', pl: 'Znaki (bez spacji)',
    es: 'Caracteres (sin espacios)', fr: 'Caractères (sans espaces)', it: 'Caratteri (senza spazi)', de: 'Zeichen (ohne Leerzeichen)',
}
const SENTENCE_COUNT_LABEL: Record<string, string> = {
    en: 'Sentence Count', ru: 'Количество предложений', lv: 'Teikumu Skaits', pl: 'Liczba Zdań',
    es: 'Recuento de Oraciones', fr: 'Nombre de Phrases', it: 'Conteggio Frasi', de: 'Satzanzahl',
}
const PARAGRAPH_COUNT_LABEL: Record<string, string> = {
    en: 'Paragraph Count', ru: 'Количество абзацев', lv: 'Rindkopu Skaits', pl: 'Liczba Akapitów',
    es: 'Recuento de Párrafos', fr: 'Nombre de Paragraphes', it: 'Conteggio Paragrafi', de: 'Absatzanzahl',
}
const AVG_WORD_LENGTH_LABEL: Record<string, string> = {
    en: 'Average Word Length', ru: 'Средняя длина слова', lv: 'Vidējais Vārda Garums', pl: 'Średnia Długość Słowa',
    es: 'Longitud Media de Palabra', fr: 'Longueur Moyenne des Mots', it: 'Lunghezza Media Parola', de: 'Durchschnittliche Wortlänge',
}

const wordCharacterCounterTool: ToolDef = {
    id: '1193',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'The quick brown fox jumps over the lazy dog.' }],
        functions: { result: { type: 'function', functionName: 'wordCharacterCounter', params: { text: 'text' } } },
        outputs: [{ key: 'word_count' }, { key: 'char_count_with_spaces' }, { key: 'char_count_no_spaces' }, { key: 'sentence_count' }, { key: 'paragraph_count' }, { key: 'avg_word_length', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'word-character-counter', title: 'Word & Character Counter', h1: 'Word & Character Counter',
            meta_title: 'Word & Character Counter | Count Words, Characters, Sentences & Paragraphs',
            meta_description: 'Instantly count words, characters, sentences, and paragraphs in any text, plus see average word length.',
            short_answer: 'This tool counts words and characters in text, e.g. a short paragraph might show 16 words, 77 characters, 3 sentences, and 2 paragraphs.',
            intro_text: '<p>Paste or type any text to instantly see its word count, character count (with and without spaces), sentence count, paragraph count, and average word length — useful for essays, social posts, and word-limited submissions.</p>',
            key_points: [
                '<b>Word count</b> splits on whitespace after trimming, so extra spaces between words don\'t inflate the count.',
                '<b>Sentence count</b> splits on periods, exclamation points, and question marks.',
                '<b>Paragraph count</b> is based on blank-line breaks (a double line break separates paragraphs).',
            ],
            howto: [
                { question: 'Does this count spaces as characters?', answer: '<p>The "with spaces" figure includes every character including spaces; the "no spaces" figure removes all whitespace before counting.</p>' },
                { question: 'Why might sentence count be slightly off?', answer: '<p>Abbreviations like "Dr." or "e.g." contain periods that aren\'t sentence endings, which can occasionally inflate the sentence count — a known limitation of simple punctuation-based splitting.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Paste your text here...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.en },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.en },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.en },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.en },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.en },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.en, precision: 1 },
            ],
        },
        ru: {
            slug: 'schetchik-slov-i-simvolov', title: 'Счётчик слов и символов', h1: 'Счётчик слов и символов',
            meta_title: 'Счётчик слов и символов | Подсчёт слов, символов, предложений и абзацев',
            meta_description: 'Мгновенно подсчитайте слова, символы, предложения и абзацы в любом тексте, а также среднюю длину слова.',
            short_answer: 'Этот инструмент подсчитывает слова и символы в тексте, например короткий абзац может показать 16 слов, 77 символов, 3 предложения и 2 абзаца.',
            intro_text: '<p>Вставьте или введите любой текст, чтобы мгновенно увидеть количество слов, символов (с пробелами и без), предложений, абзацев и среднюю длину слова — полезно для эссе, постов в соцсетях и заявок с ограничением по объёму.</p>',
            key_points: [
                '<b>Подсчёт слов</b> разделяет текст по пробелам после обрезки, так что лишние пробелы между словами не завышают счёт.',
                '<b>Подсчёт предложений</b> разделяет текст по точкам, восклицательным и вопросительным знакам.',
                '<b>Подсчёт абзацев</b> основан на разрывах с пустой строкой (двойной перевод строки разделяет абзацы).',
            ],
            howto: [
                { question: 'Считаются ли пробелы как символы?', answer: '<p>Показатель "с пробелами" включает каждый символ, включая пробелы; показатель "без пробелов" удаляет все пробельные символы перед подсчётом.</p>' },
                { question: 'Почему количество предложений может быть немного неточным?', answer: '<p>Сокращения вроде "т.е." содержат точки, которые не являются концом предложения, что иногда завышает счёт предложений — известное ограничение простого разделения по пунктуации.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Вставьте ваш текст сюда...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.ru },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.ru },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.ru },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.ru },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.ru },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.ru, precision: 1 },
            ],
        },
        lv: {
            slug: 'vardu-un-rakstzimju-skaititajs', title: 'Vārdu un Rakstzīmju Skaitītājs', h1: 'Vārdu un Rakstzīmju Skaitītājs',
            meta_title: 'Vārdu un Rakstzīmju Skaitītājs | Skaitiet Vārdus, Rakstzīmes, Teikumus un Rindkopas',
            meta_description: 'Uzreiz saskaitiet vārdus, rakstzīmes, teikumus un rindkopas jebkurā tekstā, kā arī redziet vidējo vārda garumu.',
            short_answer: 'Šis rīks saskaita vārdus un rakstzīmes tekstā, piemēram, īsa rindkopa var rādīt 16 vārdus, 77 rakstzīmes, 3 teikumus un 2 rindkopas.',
            intro_text: '<p>Ielīmējiet vai ierakstiet jebkuru tekstu, lai uzreiz redzētu tā vārdu skaitu, rakstzīmju skaitu (ar atstarpēm un bez tām), teikumu skaitu, rindkopu skaitu un vidējo vārda garumu — noderīgi eseju, sociālo mediju ierakstu un apjoma ierobežotu iesniegumu vajadzībām.</p>',
            key_points: [
                '<b>Vārdu skaits</b> sadala pēc atstarpēm pēc apgriešanas, tāpēc liekas atstarpes starp vārdiem nepalielina skaitu.',
                '<b>Teikumu skaits</b> sadala pēc punktiem, izsaukuma un jautājuma zīmēm.',
                '<b>Rindkopu skaits</b> balstās uz tukšas rindas pārtraukumiem (dubults rindas pārtraukums atdala rindkopas).',
            ],
            howto: [
                { question: 'Vai atstarpes tiek skaitītas kā rakstzīmes?', answer: '<p>Rādītājs "ar atstarpēm" ietver katru rakstzīmi, ieskaitot atstarpes; rādītājs "bez atstarpēm" noņem visas atstarpes pirms skaitīšanas.</p>' },
                { question: 'Kāpēc teikumu skaits var būt nedaudz neprecīzs?', answer: '<p>Saīsinājumi satur punktus, kas nav teikuma beigas, kas dažkārt var palielināt teikumu skaitu — zināms vienkāršas pieturzīmju sadalīšanas ierobežojums.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ielīmējiet savu tekstu šeit...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.lv },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.lv },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.lv },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.lv },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.lv },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.lv, precision: 1 },
            ],
        },
        pl: {
            slug: 'licznik-slow-i-znakow', title: 'Licznik Słów i Znaków', h1: 'Licznik Słów i Znaków',
            meta_title: 'Licznik Słów i Znaków | Policz Słowa, Znaki, Zdania i Akapity',
            meta_description: 'Natychmiast policz słowa, znaki, zdania i akapity w dowolnym tekście, a także zobacz średnią długość słowa.',
            short_answer: 'To narzędzie liczy słowa i znaki w tekście, np. krótki akapit może pokazać 16 słów, 77 znaków, 3 zdania i 2 akapity.',
            intro_text: '<p>Wklej lub wpisz dowolny tekst, aby natychmiast zobaczyć liczbę słów, znaków (ze spacjami i bez), zdań, akapitów oraz średnią długość słowa — przydatne do esejów, postów w mediach społecznościowych i zgłoszeń z limitem objętości.</p>',
            key_points: [
                '<b>Liczba słów</b> dzieli tekst po spacjach po przycięciu, więc dodatkowe spacje między słowami nie zawyżają liczby.',
                '<b>Liczba zdań</b> dzieli tekst po kropkach, wykrzyknikach i znakach zapytania.',
                '<b>Liczba akapitów</b> opiera się na przerwach z pustą linią (podwójne przejście do nowej linii oddziela akapity).',
            ],
            howto: [
                { question: 'Czy spacje są liczone jako znaki?', answer: '<p>Wskaźnik "ze spacjami" obejmuje każdy znak, w tym spacje; wskaźnik "bez spacji" usuwa wszystkie białe znaki przed liczeniem.</p>' },
                { question: 'Dlaczego liczba zdań może być lekko niedokładna?', answer: '<p>Skróty zawierają kropki, które nie są końcem zdania, co czasami może zawyżać liczbę zdań — znane ograniczenie prostego dzielenia po interpunkcji.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wklej tutaj swój tekst...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.pl },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.pl },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.pl },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.pl },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.pl },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.pl, precision: 1 },
            ],
        },
        es: {
            slug: 'contador-de-palabras-y-caracteres', title: 'Contador de Palabras y Caracteres', h1: 'Contador de Palabras y Caracteres',
            meta_title: 'Contador de Palabras y Caracteres | Cuenta Palabras, Caracteres, Oraciones y Párrafos',
            meta_description: 'Cuenta instantáneamente palabras, caracteres, oraciones y párrafos en cualquier texto, además de ver la longitud media de palabra.',
            short_answer: 'Esta herramienta cuenta palabras y caracteres en un texto, p. ej. un párrafo corto puede mostrar 16 palabras, 77 caracteres, 3 oraciones y 2 párrafos.',
            intro_text: '<p>Pega o escribe cualquier texto para ver instantáneamente su recuento de palabras, caracteres (con y sin espacios), oraciones, párrafos y longitud media de palabra — útil para ensayos, publicaciones sociales y envíos con límite de palabras.</p>',
            key_points: [
                '<b>El recuento de palabras</b> divide por espacios después de recortar, así que los espacios extra entre palabras no inflan el conteo.',
                '<b>El recuento de oraciones</b> divide por puntos, signos de exclamación y de interrogación.',
                '<b>El recuento de párrafos</b> se basa en saltos de línea en blanco (un doble salto de línea separa párrafos).',
            ],
            howto: [
                { question: '¿Esto cuenta los espacios como caracteres?', answer: '<p>La cifra "con espacios" incluye cada carácter incluyendo espacios; la cifra "sin espacios" elimina todos los espacios en blanco antes de contar.</p>' },
                { question: '¿Por qué el recuento de oraciones puede ser ligeramente impreciso?', answer: '<p>Las abreviaturas contienen puntos que no son finales de oración, lo que ocasionalmente puede inflar el recuento — una limitación conocida de la división simple basada en puntuación.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Pega tu texto aquí...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.es },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.es },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.es },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.es },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.es },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.es, precision: 1 },
            ],
        },
        fr: {
            slug: 'compteur-de-mots-et-caracteres', title: 'Compteur de Mots et Caractères', h1: 'Compteur de Mots et Caractères',
            meta_title: 'Compteur de Mots et Caractères | Comptez Mots, Caractères, Phrases et Paragraphes',
            meta_description: 'Comptez instantanément les mots, caractères, phrases et paragraphes de n\'importe quel texte, ainsi que la longueur moyenne des mots.',
            short_answer: 'Cet outil compte les mots et caractères dans un texte, ex. un court paragraphe peut afficher 16 mots, 77 caractères, 3 phrases et 2 paragraphes.',
            intro_text: '<p>Collez ou tapez n\'importe quel texte pour voir instantanément son nombre de mots, de caractères (avec et sans espaces), de phrases, de paragraphes et la longueur moyenne des mots — utile pour les essais, publications sociales et soumissions à limite de mots.</p>',
            key_points: [
                '<b>Le nombre de mots</b> se divise sur les espaces après suppression des espaces superflus, donc les espaces supplémentaires entre les mots ne gonflent pas le compte.',
                '<b>Le nombre de phrases</b> se divise sur les points, points d\'exclamation et points d\'interrogation.',
                '<b>Le nombre de paragraphes</b> est basé sur les sauts de ligne vides (un double saut de ligne sépare les paragraphes).',
            ],
            howto: [
                { question: 'Cela compte-t-il les espaces comme des caractères ?', answer: '<p>Le chiffre "avec espaces" inclut chaque caractère y compris les espaces ; le chiffre "sans espaces" supprime tous les espaces avant de compter.</p>' },
                { question: 'Pourquoi le nombre de phrases peut-il être légèrement inexact ?', answer: '<p>Les abréviations contiennent des points qui ne sont pas des fins de phrase, ce qui peut occasionnellement gonfler le compte — une limitation connue de la division simple basée sur la ponctuation.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Collez votre texte ici...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.fr },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.fr },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.fr },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.fr },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.fr },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.fr, precision: 1 },
            ],
        },
        it: {
            slug: 'contatore-di-parole-e-caratteri', title: 'Contatore di Parole e Caratteri', h1: 'Contatore di Parole e Caratteri',
            meta_title: 'Contatore di Parole e Caratteri | Conta Parole, Caratteri, Frasi e Paragrafi',
            meta_description: 'Conta istantaneamente parole, caratteri, frasi e paragrafi in qualsiasi testo, oltre a vedere la lunghezza media delle parole.',
            short_answer: 'Questo strumento conta parole e caratteri in un testo, es. un breve paragrafo potrebbe mostrare 16 parole, 77 caratteri, 3 frasi e 2 paragrafi.',
            intro_text: '<p>Incolla o digita qualsiasi testo per vedere istantaneamente il conteggio di parole, caratteri (con e senza spazi), frasi, paragrafi e la lunghezza media delle parole — utile per saggi, post sui social e invii con limite di parole.</p>',
            key_points: [
                '<b>Il conteggio delle parole</b> divide per spazi dopo il taglio, quindi gli spazi extra tra le parole non gonfiano il conteggio.',
                '<b>Il conteggio delle frasi</b> divide per punti, punti esclamativi e punti interrogativi.',
                '<b>Il conteggio dei paragrafi</b> si basa sulle interruzioni di riga vuote (una doppia interruzione di riga separa i paragrafi).',
            ],
            howto: [
                { question: 'Questo conta gli spazi come caratteri?', answer: '<p>La cifra "con spazi" include ogni carattere inclusi gli spazi; la cifra "senza spazi" rimuove tutti gli spazi bianchi prima di contare.</p>' },
                { question: 'Perché il conteggio delle frasi potrebbe essere leggermente impreciso?', answer: '<p>Le abbreviazioni contengono punti che non sono fine frase, il che può occasionalmente gonfiare il conteggio — una limitazione nota della semplice divisione basata sulla punteggiatura.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Incolla qui il tuo testo...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.it },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.it },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.it },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.it },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.it },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.it, precision: 1 },
            ],
        },
        de: {
            slug: 'wort-und-zeichenzaehler', title: 'Wort- und Zeichenzähler', h1: 'Wort- und Zeichenzähler',
            meta_title: 'Wort- und Zeichenzähler | Wörter, Zeichen, Sätze und Absätze Zählen',
            meta_description: 'Zählen Sie sofort Wörter, Zeichen, Sätze und Absätze in jedem Text und sehen Sie die durchschnittliche Wortlänge.',
            short_answer: 'Dieses Tool zählt Wörter und Zeichen in Text, z.B. könnte ein kurzer Absatz 16 Wörter, 77 Zeichen, 3 Sätze und 2 Absätze anzeigen.',
            intro_text: '<p>Fügen Sie beliebigen Text ein oder tippen Sie ihn, um sofort die Wortanzahl, Zeichenanzahl (mit und ohne Leerzeichen), Satzanzahl, Absatzanzahl und durchschnittliche Wortlänge zu sehen — nützlich für Aufsätze, Social-Media-Beiträge und wortlimitierte Einreichungen.</p>',
            key_points: [
                '<b>Die Wortanzahl</b> teilt nach Leerzeichen nach dem Trimmen, sodass zusätzliche Leerzeichen zwischen Wörtern die Zählung nicht aufblähen.',
                '<b>Die Satzanzahl</b> teilt nach Punkten, Ausrufezeichen und Fragezeichen.',
                '<b>Die Absatzanzahl</b> basiert auf Leerzeilen-Umbrüchen (ein doppelter Zeilenumbruch trennt Absätze).',
            ],
            howto: [
                { question: 'Werden Leerzeichen als Zeichen gezählt?', answer: '<p>Der Wert "mit Leerzeichen" umfasst jedes Zeichen einschließlich Leerzeichen; der Wert "ohne Leerzeichen" entfernt alle Leerzeichen vor dem Zählen.</p>' },
                { question: 'Warum könnte die Satzanzahl leicht ungenau sein?', answer: '<p>Abkürzungen enthalten Punkte, die kein Satzende sind, was die Satzzahl gelegentlich aufblähen kann — eine bekannte Einschränkung der einfachen satzzeichenbasierten Trennung.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Fügen Sie hier Ihren Text ein...' }],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.de },
                { name: 'char_count_with_spaces', label: CHAR_WITH_SPACES_LABEL.de },
                { name: 'char_count_no_spaces', label: CHAR_NO_SPACES_LABEL.de },
                { name: 'sentence_count', label: SENTENCE_COUNT_LABEL.de },
                { name: 'paragraph_count', label: PARAGRAPH_COUNT_LABEL.de },
                { name: 'avg_word_length', label: AVG_WORD_LENGTH_LABEL.de, precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1194: Reading Time Calculator
// ============================================================
const WPM_INPUT_LABEL: Record<string, string> = {
    en: 'Your Reading Speed (words per minute)', ru: 'Скорость чтения (слов в минуту)', lv: 'Jūsu Lasīšanas Ātrums (vārdi minūtē)', pl: 'Twoja Prędkość Czytania (słów na minutę)',
    es: 'Tu Velocidad de Lectura (palabras por minuto)', fr: 'Votre Vitesse de Lecture (mots par minute)', it: 'La Tua Velocità di Lettura (parole al minuto)', de: 'Ihre Lesegeschwindigkeit (Wörter pro Minute)',
}
const READING_TIME_LABEL: Record<string, string> = {
    en: 'Reading Time (minutes)', ru: 'Время чтения (минуты)', lv: 'Lasīšanas Laiks (minūtes)', pl: 'Czas Czytania (minuty)',
    es: 'Tiempo de Lectura (minutos)', fr: 'Temps de Lecture (minutes)', it: 'Tempo di Lettura (minuti)', de: 'Lesezeit (Minuten)',
}
const SPEAKING_TIME_LABEL: Record<string, string> = {
    en: 'Speaking Time (minutes)', ru: 'Время произнесения вслух (минуты)', lv: 'Runāšanas Laiks (minūtes)', pl: 'Czas Mówienia (minuty)',
    es: 'Tiempo de Habla (minutos)', fr: 'Temps de Parole (minutes)', it: 'Tempo di Lettura ad Alta Voce (minuti)', de: 'Sprechzeit (Minuten)',
}

const readingTimeCalculatorTool: ToolDef = {
    id: '1194',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'The quick brown fox jumps over the lazy dog.' }, { key: 'wpm', default: 200 }],
        functions: { result: { type: 'function', functionName: 'readingTimeCalculator', params: { text: 'text', wpm: 'wpm' } } },
        outputs: [{ key: 'word_count' }, { key: 'reading_time_minutes', precision: 1 }, { key: 'speaking_time_minutes', precision: 1 }],
    },
    locales: {
        en: {
            slug: 'reading-time-calculator', title: 'Reading Time Calculator', h1: 'Reading Time Calculator',
            meta_title: 'Reading Time Calculator | Estimate How Long Your Text Takes to Read',
            meta_description: 'Paste any text to estimate its reading time and speaking time, based on your chosen words-per-minute pace.',
            short_answer: 'This tool estimates reading time from word count, e.g. 400 words at 200 wpm takes about 2 minutes to read.',
            intro_text: '<p>Paste an article, script, or speech to estimate how long it takes to read silently (at your chosen words-per-minute pace) and how long it takes to read aloud (at an average speaking pace).</p>',
            key_points: [
                '<b>Reading time</b> = Word Count ÷ Your Reading Speed (default 200 wpm, a commonly cited average adult silent-reading pace).',
                '<b>Speaking time</b> = Word Count ÷ 130 wpm, a standard average speech pace used for presentations and scripts.',
                '<b>Adjust your reading speed</b> if you know your own pace differs — fast readers may exceed 300 wpm, slower or more careful readers may be closer to 150 wpm.',
            ],
            howto: [
                { question: 'Why is speaking time fixed at 130 wpm?', answer: '<p>Average speech delivery is commonly cited around 130 words per minute for clear, paced speaking — much slower than silent reading, which is why speaking time is usually longer than reading time for the same text.</p>' },
                { question: 'Is this useful for blog posts?', answer: '<p>Yes — many blogs display an estimated reading time using exactly this kind of word-count-based calculation.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Paste your text here...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.en, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.en },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.en, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.en, precision: 1 },
            ],
        },
        ru: {
            slug: 'kalkulyator-vremeni-chteniya', title: 'Калькулятор времени чтения', h1: 'Калькулятор времени чтения',
            meta_title: 'Калькулятор времени чтения | Оцените, сколько времени займёт чтение текста',
            meta_description: 'Вставьте любой текст, чтобы оценить время чтения и время произнесения вслух на основе выбранного темпа в словах в минуту.',
            short_answer: 'Этот инструмент оценивает время чтения по количеству слов, например 400 слов при 200 словах в минуту занимает около 2 минут.',
            intro_text: '<p>Вставьте статью, сценарий или речь, чтобы оценить, сколько времени займёт молчаливое чтение (в выбранном темпе слов в минуту) и сколько — чтение вслух (в среднем темпе речи).</p>',
            key_points: [
                '<b>Время чтения</b> = Количество слов ÷ Ваша скорость чтения (по умолчанию 200 слов/мин, часто упоминаемый средний темп молчаливого чтения взрослого человека).',
                '<b>Время произнесения вслух</b> = Количество слов ÷ 130 слов/мин, стандартный средний темп речи для презентаций и сценариев.',
                '<b>Настройте скорость чтения</b>, если знаете, что ваш темп отличается — быстрые читатели могут превышать 300 слов/мин, более медленные — быть ближе к 150 слов/мин.',
            ],
            howto: [
                { question: 'Почему время произнесения вслух фиксировано на 130 словах/мин?', answer: '<p>Средний темп речи обычно указывается около 130 слов в минуту для чёткой, размеренной речи — намного медленнее молчаливого чтения.</p>' },
                { question: 'Полезно ли это для постов в блоге?', answer: '<p>Да — многие блоги показывают примерное время чтения именно на основе такого расчёта по количеству слов.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Вставьте ваш текст сюда...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.ru, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.ru },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.ru, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.ru, precision: 1 },
            ],
        },
        lv: {
            slug: 'lasisanas-laika-kalkulators', title: 'Lasīšanas Laika Kalkulators', h1: 'Lasīšanas Laika Kalkulators',
            meta_title: 'Lasīšanas Laika Kalkulators | Novērtējiet, Cik Ilgi Aizņem Teksta Izlasīšana',
            meta_description: 'Ielīmējiet jebkuru tekstu, lai novērtētu lasīšanas un skaļas lasīšanas laiku, pamatojoties uz izvēlēto vārdu ātrumu minūtē.',
            short_answer: 'Šis rīks novērtē lasīšanas laiku pēc vārdu skaita, piemēram, 400 vārdi pie 200 vārdiem minūtē aizņem apmēram 2 minūtes.',
            intro_text: '<p>Ielīmējiet rakstu, scenāriju vai runu, lai novērtētu, cik ilgi aizņem klusa lasīšana (izvēlētajā vārdu ātrumā minūtē) un skaļa lasīšana (vidējā runāšanas tempā).</p>',
            key_points: [
                '<b>Lasīšanas laiks</b> = Vārdu skaits ÷ Jūsu lasīšanas ātrums (noklusējums 200 vārdi/min, bieži minēts vidējais pieaugušā klusas lasīšanas temps).',
                '<b>Skaļas lasīšanas laiks</b> = Vārdu skaits ÷ 130 vārdi/min, standarta vidējais runāšanas temps prezentācijām un scenārijiem.',
                '<b>Pielāgojiet lasīšanas ātrumu</b>, ja zināt, ka jūsu temps atšķiras — ātri lasītāji var pārsniegt 300 vārdi/min, lēnāki var būt tuvāk 150 vārdi/min.',
            ],
            howto: [
                { question: 'Kāpēc skaļas lasīšanas laiks ir fiksēts pie 130 vārdiem/min?', answer: '<p>Vidējais runas temps parasti tiek minēts ap 130 vārdiem minūtē skaidrai, mērenai runai — daudz lēnāk nekā klusa lasīšana.</p>' },
                { question: 'Vai tas noder emuāra ierakstiem?', answer: '<p>Jā — daudzi emuāri rāda aptuveno lasīšanas laiku, izmantojot tieši šādu uz vārdu skaitu balstītu aprēķinu.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ielīmējiet savu tekstu šeit...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.lv, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.lv },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.lv, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.lv, precision: 1 },
            ],
        },
        pl: {
            slug: 'kalkulator-czasu-czytania', title: 'Kalkulator Czasu Czytania', h1: 'Kalkulator Czasu Czytania',
            meta_title: 'Kalkulator Czasu Czytania | Oszacuj, Jak Długo Zajmie Przeczytanie Tekstu',
            meta_description: 'Wklej dowolny tekst, aby oszacować czas czytania i czas czytania na głos, na podstawie wybranego tempa słów na minutę.',
            short_answer: 'To narzędzie szacuje czas czytania na podstawie liczby słów, np. 400 słów przy 200 słowach na minutę zajmuje około 2 minut.',
            intro_text: '<p>Wklej artykuł, scenariusz lub przemówienie, aby oszacować, ile czasu zajmuje ciche czytanie (w wybranym tempie słów na minutę) i ile zajmuje czytanie na głos (w przeciętnym tempie mówienia).</p>',
            key_points: [
                '<b>Czas czytania</b> = Liczba słów ÷ Twoja prędkość czytania (domyślnie 200 słów/min, powszechnie cytowane średnie tempo cichego czytania dorosłego).',
                '<b>Czas mówienia</b> = Liczba słów ÷ 130 słów/min, standardowe średnie tempo mówienia dla prezentacji i scenariuszy.',
                '<b>Dostosuj prędkość czytania</b>, jeśli wiesz, że twoje tempo się różni — szybcy czytelnicy mogą przekraczać 300 słów/min, wolniejsi mogą być bliżej 150 słów/min.',
            ],
            howto: [
                { question: 'Dlaczego czas mówienia jest ustalony na 130 słów/min?', answer: '<p>Przeciętne tempo mówienia jest powszechnie cytowane na poziomie około 130 słów na minutę dla wyraźnej, spokojnej mowy.</p>' },
                { question: 'Czy to przydatne dla postów na blogu?', answer: '<p>Tak — wiele blogów wyświetla szacowany czas czytania, korzystając dokładnie z takiego obliczenia opartego na liczbie słów.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wklej tutaj swój tekst...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.pl, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.pl },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.pl, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.pl, precision: 1 },
            ],
        },
        es: {
            slug: 'calculadora-de-tiempo-de-lectura', title: 'Calculadora de Tiempo de Lectura', h1: 'Calculadora de Tiempo de Lectura',
            meta_title: 'Calculadora de Tiempo de Lectura | Estima Cuánto Tiempo Toma Leer tu Texto',
            meta_description: 'Pega cualquier texto para estimar su tiempo de lectura y tiempo de habla, según tu ritmo de palabras por minuto elegido.',
            short_answer: 'Esta herramienta estima el tiempo de lectura a partir del recuento de palabras, p. ej. 400 palabras a 200 ppm toma unos 2 minutos.',
            intro_text: '<p>Pega un artículo, guion o discurso para estimar cuánto tiempo toma leerlo en silencio (a tu ritmo de palabras por minuto elegido) y cuánto toma leerlo en voz alta (a un ritmo promedio de habla).</p>',
            key_points: [
                '<b>Tiempo de lectura</b> = Recuento de Palabras ÷ Tu Velocidad de Lectura (por defecto 200 ppm, un ritmo promedio comúnmente citado de lectura silenciosa adulta).',
                '<b>Tiempo de habla</b> = Recuento de Palabras ÷ 130 ppm, un ritmo promedio estándar de habla usado para presentaciones y guiones.',
                '<b>Ajusta tu velocidad de lectura</b> si sabes que tu ritmo difiere — los lectores rápidos pueden superar 300 ppm, los más lentos pueden estar más cerca de 150 ppm.',
            ],
            howto: [
                { question: '¿Por qué el tiempo de habla está fijado en 130 ppm?', answer: '<p>El ritmo promedio de habla se cita comúnmente en torno a 130 palabras por minuto para un habla clara y pausada.</p>' },
                { question: '¿Es útil para publicaciones de blog?', answer: '<p>Sí — muchos blogs muestran un tiempo de lectura estimado usando exactamente este tipo de cálculo basado en el recuento de palabras.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Pega tu texto aquí...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.es, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.es },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.es, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.es, precision: 1 },
            ],
        },
        fr: {
            slug: 'calculateur-de-temps-de-lecture', title: 'Calculateur de Temps de Lecture', h1: 'Calculateur de Temps de Lecture',
            meta_title: 'Calculateur de Temps de Lecture | Estimez le Temps de Lecture de Votre Texte',
            meta_description: 'Collez n\'importe quel texte pour estimer son temps de lecture et son temps de parole, selon votre rythme de mots par minute choisi.',
            short_answer: 'Cet outil estime le temps de lecture à partir du nombre de mots, ex. 400 mots à 200 mpm prend environ 2 minutes.',
            intro_text: '<p>Collez un article, un script ou un discours pour estimer combien de temps il faut pour le lire silencieusement (à votre rythme de mots par minute choisi) et combien de temps pour le lire à voix haute (à un rythme de parole moyen).</p>',
            key_points: [
                '<b>Temps de lecture</b> = Nombre de Mots ÷ Votre Vitesse de Lecture (par défaut 200 mpm, un rythme moyen couramment cité pour la lecture silencieuse adulte).',
                '<b>Temps de parole</b> = Nombre de Mots ÷ 130 mpm, un rythme de parole moyen standard utilisé pour les présentations et scripts.',
                '<b>Ajustez votre vitesse de lecture</b> si vous savez que votre rythme diffère — les lecteurs rapides peuvent dépasser 300 mpm, les plus lents peuvent être plus proches de 150 mpm.',
            ],
            howto: [
                { question: 'Pourquoi le temps de parole est-il fixé à 130 mpm ?', answer: '<p>Le rythme de parole moyen est couramment cité autour de 130 mots par minute pour une élocution claire et posée.</p>' },
                { question: 'Est-ce utile pour les articles de blog ?', answer: '<p>Oui — de nombreux blogs affichent un temps de lecture estimé en utilisant exactement ce type de calcul basé sur le nombre de mots.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Collez votre texte ici...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.fr, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.fr },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.fr, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.fr, precision: 1 },
            ],
        },
        it: {
            slug: 'calcolatore-di-tempo-di-lettura', title: 'Calcolatore di Tempo di Lettura', h1: 'Calcolatore di Tempo di Lettura',
            meta_title: 'Calcolatore di Tempo di Lettura | Stima Quanto Tempo Richiede la Lettura del Tuo Testo',
            meta_description: 'Incolla qualsiasi testo per stimare il tempo di lettura e il tempo di lettura ad alta voce, in base al ritmo di parole al minuto scelto.',
            short_answer: 'Questo strumento stima il tempo di lettura dal conteggio delle parole, es. 400 parole a 200 ppm richiede circa 2 minuti.',
            intro_text: '<p>Incolla un articolo, uno script o un discorso per stimare quanto tempo richiede leggerlo silenziosamente (al ritmo di parole al minuto scelto) e quanto richiede leggerlo ad alta voce (a un ritmo medio di parlato).</p>',
            key_points: [
                '<b>Tempo di lettura</b> = Conteggio Parole ÷ La Tua Velocità di Lettura (predefinito 200 ppm, un ritmo medio comunemente citato per la lettura silenziosa di un adulto).',
                '<b>Tempo di lettura ad alta voce</b> = Conteggio Parole ÷ 130 ppm, un ritmo medio standard di parlato usato per presentazioni e script.',
                '<b>Regola la tua velocità di lettura</b> se sai che il tuo ritmo è diverso — i lettori veloci possono superare 300 ppm, quelli più lenti possono essere più vicini a 150 ppm.',
            ],
            howto: [
                { question: 'Perché il tempo di lettura ad alta voce è fissato a 130 ppm?', answer: '<p>Il ritmo medio del parlato è comunemente citato intorno a 130 parole al minuto per un discorso chiaro e misurato.</p>' },
                { question: 'È utile per i post del blog?', answer: '<p>Sì — molti blog mostrano un tempo di lettura stimato usando esattamente questo tipo di calcolo basato sul conteggio delle parole.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Incolla qui il tuo testo...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.it, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.it },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.it, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.it, precision: 1 },
            ],
        },
        de: {
            slug: 'lesezeit-rechner', title: 'Lesezeit-Rechner', h1: 'Lesezeit-Rechner',
            meta_title: 'Lesezeit-Rechner | Schätzen Sie, Wie Lange das Lesen Ihres Textes Dauert',
            meta_description: 'Fügen Sie beliebigen Text ein, um Lesezeit und Sprechzeit basierend auf Ihrem gewählten Wörter-pro-Minute-Tempo zu schätzen.',
            short_answer: 'Dieses Tool schätzt die Lesezeit aus der Wortanzahl, z.B. dauern 400 Wörter bei 200 Wörtern/Min etwa 2 Minuten.',
            intro_text: '<p>Fügen Sie einen Artikel, ein Skript oder eine Rede ein, um zu schätzen, wie lange das stille Lesen (in Ihrem gewählten Wörter-pro-Minute-Tempo) und das laute Vorlesen (in einem durchschnittlichen Sprechtempo) dauert.</p>',
            key_points: [
                '<b>Lesezeit</b> = Wortanzahl ÷ Ihre Lesegeschwindigkeit (Standard 200 Wörter/Min, ein häufig zitiertes durchschnittliches Tempo für stilles Lesen bei Erwachsenen).',
                '<b>Sprechzeit</b> = Wortanzahl ÷ 130 Wörter/Min, ein Standard-Durchschnittstempo für Präsentationen und Skripte.',
                '<b>Passen Sie Ihre Lesegeschwindigkeit an</b>, wenn Sie wissen, dass Ihr Tempo abweicht — schnelle Leser können 300 Wörter/Min überschreiten, langsamere liegen eher bei 150 Wörter/Min.',
            ],
            howto: [
                { question: 'Warum ist die Sprechzeit auf 130 Wörter/Min festgelegt?', answer: '<p>Das durchschnittliche Sprechtempo wird üblicherweise mit etwa 130 Wörtern pro Minute für klares, gemessenes Sprechen angegeben.</p>' },
                { question: 'Ist das nützlich für Blogbeiträge?', answer: '<p>Ja — viele Blogs zeigen eine geschätzte Lesezeit genau anhand dieser Art von wortanzahlbasierter Berechnung an.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Fügen Sie hier Ihren Text ein...' },
                { name: 'wpm', label: WPM_INPUT_LABEL.de, type: 'number', min: 50, max: 1000, placeholder: '200' },
            ],
            outputs: [
                { name: 'word_count', label: WORD_COUNT_LABEL.de },
                { name: 'reading_time_minutes', label: READING_TIME_LABEL.de, precision: 1 },
                { name: 'speaking_time_minutes', label: SPEAKING_TIME_LABEL.de, precision: 1 },
            ],
        },
    },
}

// ============================================================
// 1195: Random Name Picker
// ============================================================
const NAMES_INPUT_LABEL: Record<string, string> = {
    en: 'Names (one per line)', ru: 'Имена (по одному на строку)', lv: 'Vārdi (viens rindā)', pl: 'Imiona (jedno na linię)',
    es: 'Nombres (uno por línea)', fr: 'Noms (un par ligne)', it: 'Nomi (uno per riga)', de: 'Namen (einer pro Zeile)',
}
const COUNT_TO_PICK_LABEL: Record<string, string> = {
    en: 'How Many to Pick', ru: 'Сколько выбрать', lv: 'Cik Izvēlēties', pl: 'Ile Wybrać',
    es: 'Cuántos Elegir', fr: 'Combien Choisir', it: 'Quanti Scegliere', de: 'Wie Viele Auswählen',
}

const randomNamePickerTool: ToolDef = {
    id: '1195',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'names', default: 'Alice\nBob\nCharlie\nDiana' }, { key: 'count', default: 1 }],
        functions: { result: { type: 'function', functionName: 'randomNamePicker', params: { names: 'names', count: 'count' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'random-name-picker', title: 'Random Name Picker', h1: 'Random Name Picker',
            meta_title: 'Random Name Picker | Pick a Random Name from a List',
            meta_description: 'Enter a list of names to instantly pick one or more at random — perfect for raffles, team assignments, and giveaways.',
            short_answer: 'This tool picks names at random from your list, e.g. 4 names with "pick 2" selected returns 2 random unique names each time.',
            intro_text: '<p>Type one name per line and choose how many to pick — great for raffles, choosing a volunteer, random team assignments, or picking a giveaway winner fairly.</p>',
            key_points: [
                '<b>Fair randomness:</b> uses a proper Fisher-Yates shuffle so every name has an equal chance of being picked.',
                '<b>No repeats:</b> when picking more than one name, each pick is unique (drawn without replacement) unless you request more names than you\'ve listed.',
                '<b>Click Calculate again</b> for a fresh random selection — each run is independent.',
            ],
            howto: [
                { question: 'Can the same name be picked twice in one run?', answer: '<p>No — if you request multiple picks, each selection is unique within that single result (no replacement), though you can list the same name multiple times if you want it weighted more heavily.</p>' },
                { question: 'Is this good for a raffle or giveaway?', answer: '<p>Yes — enter all eligible entries as separate lines and pick the number of winners you need.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.en, type: 'textarea', placeholder: 'Alice\nBob\nCharlie\nDiana' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.en, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        ru: {
            slug: 'sluchaynyy-vybor-imeni', title: 'Случайный выбор имени', h1: 'Случайный выбор имени',
            meta_title: 'Случайный выбор имени | Выберите случайное имя из списка',
            meta_description: 'Введите список имён, чтобы мгновенно выбрать одно или несколько случайным образом — идеально для розыгрышей и распределения по командам.',
            short_answer: 'Этот инструмент выбирает имена случайным образом из вашего списка, например 4 имени с выбором "2" каждый раз возвращают 2 случайных уникальных имени.',
            intro_text: '<p>Введите по одному имени на строку и выберите, сколько выбрать — отлично подходит для розыгрышей, выбора добровольца, случайного распределения по командам или честного выбора победителя розыгрыша.</p>',
            key_points: [
                '<b>Честная случайность:</b> используется настоящая перетасовка Фишера-Йейтса, поэтому у каждого имени равный шанс быть выбранным.',
                '<b>Без повторов:</b> при выборе более одного имени каждый выбор уникален (без повторного участия), если вы не запросите больше имён, чем указано в списке.',
                '<b>Нажмите "Рассчитать" снова</b> для нового случайного выбора — каждый запуск независим.',
            ],
            howto: [
                { question: 'Может ли одно имя быть выбрано дважды за один запуск?', answer: '<p>Нет — если вы запрашиваете несколько выборов, каждый выбор уникален в рамках одного результата, хотя вы можете указать одно имя несколько раз, если хотите придать ему больший вес.</p>' },
                { question: 'Подходит ли это для розыгрыша?', answer: '<p>Да — введите все допустимые заявки как отдельные строки и выберите нужное количество победителей.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.ru, type: 'textarea', placeholder: 'Алиса\nБорис\nВиктор\nГалина' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.ru, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        lv: {
            slug: 'nejausa-varda-izveletajs', title: 'Nejauša Vārda Izvēlētājs', h1: 'Nejauša Vārda Izvēlētājs',
            meta_title: 'Nejauša Vārda Izvēlētājs | Izvēlieties Nejaušu Vārdu no Saraksta',
            meta_description: 'Ievadiet vārdu sarakstu, lai uzreiz nejauši izvēlētos vienu vai vairākus — ideāli izlozēm un komandu iedalījumiem.',
            short_answer: 'Šis rīks izvēlas vārdus nejauši no jūsu saraksta, piemēram, 4 vārdi ar izvēli "2" katru reizi atgriež 2 nejaušus unikālus vārdus.',
            intro_text: '<p>Ierakstiet vienu vārdu katrā rindā un izvēlieties, cik izvēlēties — noder izlozēm, brīvprātīgā izvēlei, nejaušam komandu iedalījumam vai godīgai izlozes uzvarētāja izvēlei.</p>',
            key_points: [
                '<b>Godīga nejaušība:</b> izmanto pareizu Fišera-Jeitsa sajaukšanu, tāpēc katram vārdam ir vienādas izredzes tikt izvēlētam.',
                '<b>Bez atkārtojumiem:</b> izvēloties vairāk par vienu vārdu, katra izvēle ir unikāla (bez atkārtotas izvēles), ja vien nepieprasāt vairāk vārdu, nekā esat uzskaitījis.',
                '<b>Nospiediet "Aprēķināt" vēlreiz</b>, lai iegūtu jaunu nejaušu izvēli — katrs palaišanas reizinājums ir neatkarīgs.',
            ],
            howto: [
                { question: 'Vai vienu vārdu var izvēlēties divreiz vienā palaišanas reizē?', answer: '<p>Nē — ja pieprasāt vairākas izvēles, katra izvēle ir unikāla vienā rezultātā, lai gan varat uzskaitīt vienu vārdu vairākas reizes, ja vēlaties tam lielāku svaru.</p>' },
                { question: 'Vai tas der izlozei?', answer: '<p>Jā — ievadiet visus derīgos dalībniekus kā atsevišķas rindas un izvēlieties nepieciešamo uzvarētāju skaitu.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.lv, type: 'textarea', placeholder: 'Anna\nBruno\nCintija\nDavis' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.lv, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        pl: {
            slug: 'losowy-wybor-imienia', title: 'Losowy Wybór Imienia', h1: 'Losowy Wybór Imienia',
            meta_title: 'Losowy Wybór Imienia | Wybierz Losowe Imię z Listy',
            meta_description: 'Wprowadź listę imion, aby natychmiast losowo wybrać jedno lub więcej — idealne do losowań i przydziałów zespołowych.',
            short_answer: 'To narzędzie losowo wybiera imiona z twojej listy, np. 4 imiona z wybraną opcją "2" za każdym razem zwracają 2 losowe unikalne imiona.',
            intro_text: '<p>Wpisz jedno imię na linię i wybierz, ile wybrać — świetne do losowań, wyboru ochotnika, losowych przydziałów zespołowych lub uczciwego wyboru zwycięzcy konkursu.</p>',
            key_points: [
                '<b>Sprawiedliwa losowość:</b> wykorzystuje prawdziwe tasowanie Fishera-Yatesa, więc każde imię ma równe szanse na wybór.',
                '<b>Bez powtórzeń:</b> przy wyborze więcej niż jednego imienia, każdy wybór jest unikalny (bez zwracania), chyba że poprosisz o więcej imion niż wymieniłeś.',
                '<b>Kliknij ponownie "Oblicz"</b>, aby uzyskać nowy losowy wybór — każde uruchomienie jest niezależne.',
            ],
            howto: [
                { question: 'Czy to samo imię może zostać wybrane dwukrotnie w jednym uruchomieniu?', answer: '<p>Nie — jeśli prosisz o wiele wyborów, każdy wybór jest unikalny w ramach jednego wyniku, chociaż możesz wymienić to samo imię wielokrotnie, jeśli chcesz nadać mu większą wagę.</p>' },
                { question: 'Czy to dobre do losowania nagród?', answer: '<p>Tak — wprowadź wszystkie uprawnione zgłoszenia jako osobne linie i wybierz potrzebną liczbę zwycięzców.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.pl, type: 'textarea', placeholder: 'Anna\nBartek\nCelina\nDamian' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.pl, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        es: {
            slug: 'selector-de-nombre-aleatorio', title: 'Selector de Nombre Aleatorio', h1: 'Selector de Nombre Aleatorio',
            meta_title: 'Selector de Nombre Aleatorio | Elige un Nombre al Azar de una Lista',
            meta_description: 'Introduce una lista de nombres para elegir instantáneamente uno o más al azar — perfecto para rifas y asignaciones de equipo.',
            short_answer: 'Esta herramienta elige nombres al azar de tu lista, p. ej. 4 nombres con "elegir 2" devuelve 2 nombres únicos aleatorios cada vez.',
            intro_text: '<p>Escribe un nombre por línea y elige cuántos seleccionar — genial para rifas, elegir un voluntario, asignaciones de equipo aleatorias o elegir un ganador de sorteo de forma justa.</p>',
            key_points: [
                '<b>Aleatoriedad justa:</b> usa un barajado Fisher-Yates adecuado para que cada nombre tenga la misma probabilidad de ser elegido.',
                '<b>Sin repeticiones:</b> al elegir más de un nombre, cada selección es única (sin reemplazo) a menos que solicites más nombres de los que has listado.',
                '<b>Haz clic en Calcular de nuevo</b> para una nueva selección aleatoria — cada ejecución es independiente.',
            ],
            howto: [
                { question: '¿Puede elegirse el mismo nombre dos veces en una ejecución?', answer: '<p>No — si solicitas múltiples selecciones, cada una es única dentro de ese resultado, aunque puedes listar el mismo nombre varias veces si quieres darle más peso.</p>' },
                { question: '¿Es bueno para una rifa?', answer: '<p>Sí — introduce todas las entradas elegibles como líneas separadas y elige el número de ganadores que necesitas.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.es, type: 'textarea', placeholder: 'Ana\nBruno\nCarla\nDiego' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.es, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        fr: {
            slug: 'selecteur-de-nom-aleatoire', title: 'Sélecteur de Nom Aléatoire', h1: 'Sélecteur de Nom Aléatoire',
            meta_title: 'Sélecteur de Nom Aléatoire | Choisissez un Nom au Hasard dans une Liste',
            meta_description: 'Entrez une liste de noms pour en choisir instantanément un ou plusieurs au hasard — parfait pour les tirages au sort et les répartitions d\'équipe.',
            short_answer: 'Cet outil choisit des noms au hasard dans votre liste, ex. 4 noms avec "choisir 2" renvoie 2 noms uniques aléatoires à chaque fois.',
            intro_text: '<p>Tapez un nom par ligne et choisissez combien en sélectionner — parfait pour les tirages au sort, choisir un volontaire, des répartitions d\'équipe aléatoires ou choisir équitablement un gagnant de concours.</p>',
            key_points: [
                '<b>Hasard équitable :</b> utilise un véritable mélange de Fisher-Yates afin que chaque nom ait une chance égale d\'être choisi.',
                '<b>Pas de répétitions :</b> lors du choix de plusieurs noms, chaque sélection est unique (sans remise) sauf si vous demandez plus de noms que vous n\'en avez listés.',
                '<b>Cliquez à nouveau sur Calculer</b> pour une nouvelle sélection aléatoire — chaque exécution est indépendante.',
            ],
            howto: [
                { question: 'Le même nom peut-il être choisi deux fois dans une exécution ?', answer: '<p>Non — si vous demandez plusieurs sélections, chacune est unique dans ce résultat, bien que vous puissiez lister le même nom plusieurs fois si vous voulez lui donner plus de poids.</p>' },
                { question: 'Est-ce bon pour un tirage au sort ?', answer: '<p>Oui — entrez toutes les participations éligibles comme des lignes séparées et choisissez le nombre de gagnants dont vous avez besoin.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.fr, type: 'textarea', placeholder: 'Alice\nBruno\nCamille\nDavid' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.fr, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        it: {
            slug: 'selettore-di-nome-casuale', title: 'Selettore di Nome Casuale', h1: 'Selettore di Nome Casuale',
            meta_title: 'Selettore di Nome Casuale | Scegli un Nome a Caso da una Lista',
            meta_description: 'Inserisci un elenco di nomi per sceglierne istantaneamente uno o più a caso — perfetto per estrazioni e assegnazioni di squadra.',
            short_answer: 'Questo strumento sceglie nomi a caso dal tuo elenco, es. 4 nomi con "scegli 2" restituisce 2 nomi unici casuali ogni volta.',
            intro_text: '<p>Digita un nome per riga e scegli quanti selezionarne — ottimo per estrazioni, scegliere un volontario, assegnazioni di squadra casuali o scegliere equamente un vincitore di un\'estrazione.</p>',
            key_points: [
                '<b>Casualità equa:</b> usa un vero mescolamento Fisher-Yates in modo che ogni nome abbia pari probabilità di essere scelto.',
                '<b>Nessuna ripetizione:</b> scegliendo più di un nome, ogni selezione è unica (senza reinserimento) a meno che tu non richieda più nomi di quelli elencati.',
                '<b>Clicca di nuovo su Calcola</b> per una nuova selezione casuale — ogni esecuzione è indipendente.',
            ],
            howto: [
                { question: 'Lo stesso nome può essere scelto due volte in una esecuzione?', answer: '<p>No — se richiedi più selezioni, ognuna è unica all\'interno di quel risultato, anche se puoi elencare lo stesso nome più volte se vuoi dargli più peso.</p>' },
                { question: 'È adatto per un\'estrazione a premi?', answer: '<p>Sì — inserisci tutte le partecipazioni idonee come righe separate e scegli il numero di vincitori di cui hai bisogno.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.it, type: 'textarea', placeholder: 'Anna\nBruno\nChiara\nDavide' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.it, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
        de: {
            slug: 'zufaelliger-namensauswahler', title: 'Zufälliger Namensauswähler', h1: 'Zufälliger Namensauswähler',
            meta_title: 'Zufälliger Namensauswähler | Wählen Sie Einen Zufälligen Namen aus Einer Liste',
            meta_description: 'Geben Sie eine Liste von Namen ein, um sofort einen oder mehrere zufällig auszuwählen — perfekt für Verlosungen und Teamzuteilungen.',
            short_answer: 'Dieses Tool wählt Namen zufällig aus Ihrer Liste, z.B. liefern 4 Namen mit "2 auswählen" jedes Mal 2 zufällige eindeutige Namen.',
            intro_text: '<p>Geben Sie einen Namen pro Zeile ein und wählen Sie, wie viele ausgewählt werden sollen — praktisch für Verlosungen, die Wahl eines Freiwilligen, zufällige Teamzuteilungen oder die faire Wahl eines Gewinners.</p>',
            key_points: [
                '<b>Faire Zufälligkeit:</b> verwendet ein echtes Fisher-Yates-Shuffle, sodass jeder Name die gleiche Chance hat, ausgewählt zu werden.',
                '<b>Keine Wiederholungen:</b> bei der Auswahl mehrerer Namen ist jede Auswahl eindeutig (ohne Zurücklegen), es sei denn, Sie fordern mehr Namen an, als Sie aufgelistet haben.',
                '<b>Klicken Sie erneut auf Berechnen</b> für eine neue Zufallsauswahl — jeder Durchlauf ist unabhängig.',
            ],
            howto: [
                { question: 'Kann derselbe Name zweimal in einem Durchlauf ausgewählt werden?', answer: '<p>Nein — wenn Sie mehrere Auswahlen anfordern, ist jede innerhalb dieses Ergebnisses eindeutig, obwohl Sie denselben Namen mehrmals auflisten können, wenn Sie ihm mehr Gewicht geben möchten.</p>' },
                { question: 'Ist das gut für eine Verlosung?', answer: '<p>Ja — geben Sie alle berechtigten Teilnehmer als separate Zeilen ein und wählen Sie die benötigte Anzahl an Gewinnern.</p>' },
            ],
            inputs: [
                { name: 'names', label: NAMES_INPUT_LABEL.de, type: 'textarea', placeholder: 'Anna\nBen\nClara\nDavid' },
                { name: 'count', label: COUNT_TO_PICK_LABEL.de, type: 'number', min: 1, max: 100, placeholder: '1' },
            ],
            outputs: [],
        },
    },
}

// ============================================================
// 1196: Keyword Density Analyzer
// ============================================================
const keywordDensityAnalyzerTool: ToolDef = {
    id: '1196',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'SEO is important. Good SEO means better rankings. SEO tools help with SEO analysis and SEO strategy.' }],
        functions: { result: { type: 'function', functionName: 'keywordDensityAnalyzer', params: { text: 'text' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'keyword-density-analyzer', title: 'Keyword Density Analyzer', h1: 'Keyword Density Analyzer',
            meta_title: 'Keyword Density Analyzer | Find Top Keywords & Density % in Your Content',
            meta_description: 'Paste your content to see its top keywords ranked by frequency and density percentage — useful for SEO content review.',
            short_answer: 'This tool analyzes keyword density, e.g. a short SEO paragraph mentioning "SEO" 5 times out of 14 significant words shows a 35.7% density for that keyword.',
            intro_text: '<p>Paste an article, blog post, or product description to see which words appear most often (excluding common stopwords like "the" and "and") and their density as a percentage of all significant words — a quick sanity check for SEO content review.</p>',
            key_points: [
                '<b>Stopwords excluded:</b> common words like "the", "a", "and", "is" are filtered out so the analysis focuses on meaningful keywords.',
                '<b>Density formula:</b> (keyword occurrences ÷ total significant words) × 100.',
                '<b>Watch for keyword stuffing:</b> very high density (often cited as above ~3-5%) for a single keyword can look unnatural to search engines and readers alike.',
            ],
            howto: [
                { question: 'What keyword density is considered healthy?', answer: '<p>There\'s no strict rule, but many SEO guides suggest keeping a primary keyword\'s density under roughly 2-3% to avoid appearing over-optimized.</p>' },
                { question: 'Does this analyze multi-word phrases?', answer: '<p>No — this analyzes single words only; phrase-level (2-3 word) density analysis is a more advanced feature not covered by this simple tool.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Paste your content here...' }],
            outputs: [],
        },
        ru: {
            slug: 'analizator-plotnosti-klyuchevyh-slov', title: 'Анализатор плотности ключевых слов', h1: 'Анализатор плотности ключевых слов',
            meta_title: 'Анализатор плотности ключевых слов | Топ ключевых слов и % плотности в контенте',
            meta_description: 'Вставьте свой контент, чтобы увидеть топ ключевых слов по частоте и проценту плотности — полезно для проверки SEO-контента.',
            short_answer: 'Этот инструмент анализирует плотность ключевых слов, например короткий SEO-абзац с упоминанием "SEO" 5 раз из 14 значимых слов показывает плотность 35,7% для этого слова.',
            intro_text: '<p>Вставьте статью, пост в блоге или описание товара, чтобы увидеть, какие слова встречаются чаще всего (исключая стоп-слова вроде "и", "в"), и их плотность в процентах от всех значимых слов — быстрая проверка для SEO-контента.</p>',
            key_points: [
                '<b>Стоп-слова исключены:</b> распространённые слова вроде "и", "в", "на" отфильтровываются, чтобы анализ фокусировался на значимых ключевых словах.',
                '<b>Формула плотности:</b> (количество вхождений ключевого слова ÷ общее число значимых слов) × 100.',
                '<b>Остерегайтесь переспама ключевыми словами:</b> очень высокая плотность (часто упоминается выше ~3-5%) для одного слова может выглядеть неестественно.',
            ],
            howto: [
                { question: 'Какая плотность ключевых слов считается здоровой?', answer: '<p>Строгого правила нет, но многие SEO-гайды рекомендуют держать плотность основного ключевого слова примерно до 2-3%, чтобы не выглядеть переоптимизированным.</p>' },
                { question: 'Анализирует ли это словосочетания?', answer: '<p>Нет — анализируются только отдельные слова; анализ плотности словосочетаний (2-3 слова) — более сложная функция, не охваченная этим простым инструментом.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Вставьте ваш контент сюда...' }],
            outputs: [],
        },
        lv: {
            slug: 'atslegvardu-blivuma-analizators', title: 'Atslēgvārdu Blīvuma Analizators', h1: 'Atslēgvārdu Blīvuma Analizators',
            meta_title: 'Atslēgvārdu Blīvuma Analizators | Atrodiet Populārākos Atslēgvārdus un Blīvuma %',
            meta_description: 'Ielīmējiet savu saturu, lai redzētu tā populārākos atslēgvārdus pēc biežuma un blīvuma procentiem — noderīgi SEO satura pārskatīšanai.',
            short_answer: 'Šis rīks analizē atslēgvārdu blīvumu, piemēram, īsa SEO rindkopa ar "SEO" pieminēšanu 5 reizes no 14 nozīmīgiem vārdiem rāda 35,7% blīvumu šim vārdam.',
            intro_text: '<p>Ielīmējiet rakstu, emuāra ierakstu vai produkta aprakstu, lai redzētu, kuri vārdi parādās visbiežāk (izņemot bieži lietotus vārdus, piemēram, "un", "ir") un to blīvumu procentos no visiem nozīmīgajiem vārdiem — ātra pārbaude SEO satura pārskatam.</p>',
            key_points: [
                '<b>Bieži lietotie vārdi izslēgti:</b> tādi vārdi kā "un", "ir", "tas" tiek atfiltrēti, lai analīze koncentrētos uz nozīmīgiem atslēgvārdiem.',
                '<b>Blīvuma formula:</b> (atslēgvārda parādīšanās reizes ÷ kopējais nozīmīgo vārdu skaits) × 100.',
                '<b>Uzmanieties no atslēgvārdu pārbāzēšanas:</b> ļoti augsts blīvums (bieži minēts virs ~3-5%) vienam atslēgvārdam var izskatīties nedabiski.',
            ],
            howto: [
                { question: 'Kāds atslēgvārdu blīvums tiek uzskatīts par veselīgu?', answer: '<p>Stingra noteikuma nav, bet daudzas SEO rokasgrāmatas iesaka uzturēt galvenā atslēgvārda blīvumu zem apmēram 2-3%.</p>' },
                { question: 'Vai tas analizē vairāku vārdu frāzes?', answer: '<p>Nē — tiek analizēti tikai atsevišķi vārdi; frāžu līmeņa (2-3 vārdu) blīvuma analīze ir progresīvāka funkcija, ko šis vienkāršais rīks neaptver.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ielīmējiet savu saturu šeit...' }],
            outputs: [],
        },
        pl: {
            slug: 'analizator-gestosci-slow-kluczowych', title: 'Analizator Gęstości Słów Kluczowych', h1: 'Analizator Gęstości Słów Kluczowych',
            meta_title: 'Analizator Gęstości Słów Kluczowych | Znajdź Najlepsze Słowa Kluczowe i % Gęstości',
            meta_description: 'Wklej swoją treść, aby zobaczyć jej najlepsze słowa kluczowe uszeregowane według częstotliwości i procentu gęstości.',
            short_answer: 'To narzędzie analizuje gęstość słów kluczowych, np. krótki akapit SEO wspominający "SEO" 5 razy na 14 znaczących słów pokazuje 35,7% gęstości dla tego słowa.',
            intro_text: '<p>Wklej artykuł, post na blogu lub opis produktu, aby zobaczyć, które słowa pojawiają się najczęściej (z wyłączeniem popularnych słów jak "i", "w") oraz ich gęstość jako procent wszystkich znaczących słów.</p>',
            key_points: [
                '<b>Słowa pomijane:</b> popularne słowa jak "i", "w", "na" są odfiltrowywane, aby analiza skupiała się na znaczących słowach kluczowych.',
                '<b>Wzór gęstości:</b> (liczba wystąpień słowa kluczowego ÷ całkowita liczba znaczących słów) × 100.',
                '<b>Uważaj na upychanie słów kluczowych:</b> bardzo wysoka gęstość (często cytowana powyżej ~3-5%) dla jednego słowa może wyglądać nienaturalnie.',
            ],
            howto: [
                { question: 'Jaka gęstość słów kluczowych jest uważana za zdrową?', answer: '<p>Nie ma ścisłej reguły, ale wiele przewodników SEO sugeruje utrzymanie gęstości głównego słowa kluczowego poniżej około 2-3%.</p>' },
                { question: 'Czy to analizuje frazy wielowyrazowe?', answer: '<p>Nie — analizowane są tylko pojedyncze słowa; analiza gęstości fraz (2-3 słowa) to bardziej zaawansowana funkcja.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wklej tutaj swoją treść...' }],
            outputs: [],
        },
        es: {
            slug: 'analizador-de-densidad-de-palabras-clave', title: 'Analizador de Densidad de Palabras Clave', h1: 'Analizador de Densidad de Palabras Clave',
            meta_title: 'Analizador de Densidad de Palabras Clave | Encuentra las Mejores Palabras Clave y % de Densidad',
            meta_description: 'Pega tu contenido para ver sus principales palabras clave clasificadas por frecuencia y porcentaje de densidad.',
            short_answer: 'Esta herramienta analiza la densidad de palabras clave, p. ej. un párrafo SEO corto que menciona "SEO" 5 veces de 14 palabras significativas muestra una densidad del 35.7% para esa palabra.',
            intro_text: '<p>Pega un artículo, entrada de blog o descripción de producto para ver qué palabras aparecen con más frecuencia (excluyendo palabras vacías comunes como "el" y "y") y su densidad como porcentaje de todas las palabras significativas.</p>',
            key_points: [
                '<b>Palabras vacías excluidas:</b> palabras comunes como "el", "un", "y" se filtran para que el análisis se centre en palabras clave significativas.',
                '<b>Fórmula de densidad:</b> (ocurrencias de la palabra clave ÷ total de palabras significativas) × 100.',
                '<b>Cuidado con el keyword stuffing:</b> una densidad muy alta (a menudo citada por encima de ~3-5%) para una sola palabra clave puede parecer poco natural.',
            ],
            howto: [
                { question: '¿Qué densidad de palabras clave se considera saludable?', answer: '<p>No hay una regla estricta, pero muchas guías SEO sugieren mantener la densidad de una palabra clave principal por debajo de aproximadamente 2-3%.</p>' },
                { question: '¿Esto analiza frases de varias palabras?', answer: '<p>No — esto analiza solo palabras individuales; el análisis de densidad a nivel de frase (2-3 palabras) es una función más avanzada.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Pega tu contenido aquí...' }],
            outputs: [],
        },
        fr: {
            slug: 'analyseur-de-densite-de-mots-cles', title: 'Analyseur de Densité de Mots-Clés', h1: 'Analyseur de Densité de Mots-Clés',
            meta_title: 'Analyseur de Densité de Mots-Clés | Trouvez les Meilleurs Mots-Clés et % de Densité',
            meta_description: 'Collez votre contenu pour voir ses mots-clés principaux classés par fréquence et pourcentage de densité.',
            short_answer: 'Cet outil analyse la densité des mots-clés, ex. un court paragraphe SEO mentionnant "SEO" 5 fois sur 14 mots significatifs montre une densité de 35,7% pour ce mot.',
            intro_text: '<p>Collez un article, un billet de blog ou une description de produit pour voir quels mots apparaissent le plus souvent (à l\'exclusion des mots vides courants comme "le" et "et") et leur densité en pourcentage de tous les mots significatifs.</p>',
            key_points: [
                '<b>Mots vides exclus :</b> les mots courants comme "le", "un", "et" sont filtrés afin que l\'analyse se concentre sur les mots-clés significatifs.',
                '<b>Formule de densité :</b> (occurrences du mot-clé ÷ total des mots significatifs) × 100.',
                '<b>Attention au bourrage de mots-clés :</b> une densité très élevée (souvent citée au-dessus de ~3-5%) pour un seul mot-clé peut paraître non naturelle.',
            ],
            howto: [
                { question: 'Quelle densité de mots-clés est considérée comme saine ?', answer: '<p>Il n\'y a pas de règle stricte, mais de nombreux guides SEO suggèrent de maintenir la densité d\'un mot-clé principal en dessous d\'environ 2-3%.</p>' },
                { question: 'Cela analyse-t-il les expressions de plusieurs mots ?', answer: '<p>Non — cela analyse uniquement des mots simples ; l\'analyse de densité au niveau des expressions (2-3 mots) est une fonctionnalité plus avancée.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Collez votre contenu ici...' }],
            outputs: [],
        },
        it: {
            slug: 'analizzatore-di-densita-delle-parole-chiave', title: 'Analizzatore di Densità delle Parole Chiave', h1: 'Analizzatore di Densità delle Parole Chiave',
            meta_title: 'Analizzatore di Densità delle Parole Chiave | Trova le Migliori Parole Chiave e % di Densità',
            meta_description: 'Incolla i tuoi contenuti per vedere le parole chiave principali classificate per frequenza e percentuale di densità.',
            short_answer: 'Questo strumento analizza la densità delle parole chiave, es. un breve paragrafo SEO che menziona "SEO" 5 volte su 14 parole significative mostra una densità del 35,7% per quella parola.',
            intro_text: '<p>Incolla un articolo, un post del blog o una descrizione di prodotto per vedere quali parole appaiono più spesso (escludendo le stop word comuni come "il" e "e") e la loro densità come percentuale di tutte le parole significative.</p>',
            key_points: [
                '<b>Stop word escluse:</b> parole comuni come "il", "un", "e" vengono filtrate in modo che l\'analisi si concentri su parole chiave significative.',
                '<b>Formula di densità:</b> (occorrenze della parola chiave ÷ totale parole significative) × 100.',
                '<b>Attenzione al keyword stuffing:</b> una densità molto alta (spesso citata sopra il ~3-5%) per una singola parola chiave può sembrare innaturale.',
            ],
            howto: [
                { question: 'Quale densità di parole chiave è considerata sana?', answer: '<p>Non esiste una regola rigida, ma molte guide SEO suggeriscono di mantenere la densità di una parola chiave principale sotto circa il 2-3%.</p>' },
                { question: 'Questo analizza frasi di più parole?', answer: '<p>No — vengono analizzate solo singole parole; l\'analisi della densità a livello di frase (2-3 parole) è una funzione più avanzata.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Incolla qui il tuo contenuto...' }],
            outputs: [],
        },
        de: {
            slug: 'keyword-dichte-analysator', title: 'Keyword-Dichte-Analysator', h1: 'Keyword-Dichte-Analysator',
            meta_title: 'Keyword-Dichte-Analysator | Finden Sie Top-Keywords und Dichte-% in Ihrem Inhalt',
            meta_description: 'Fügen Sie Ihren Inhalt ein, um die wichtigsten Keywords nach Häufigkeit und Dichteprozentsatz zu sehen.',
            short_answer: 'Dieses Tool analysiert die Keyword-Dichte, z.B. zeigt ein kurzer SEO-Absatz mit "SEO" 5 Mal von 14 bedeutsamen Wörtern eine Dichte von 35,7% für dieses Wort.',
            intro_text: '<p>Fügen Sie einen Artikel, Blogbeitrag oder eine Produktbeschreibung ein, um zu sehen, welche Wörter am häufigsten vorkommen (ohne gängige Füllwörter wie "der" und "und") und ihre Dichte als Prozentsatz aller bedeutsamen Wörter.</p>',
            key_points: [
                '<b>Füllwörter ausgeschlossen:</b> gängige Wörter wie "der", "ein", "und" werden herausgefiltert, damit sich die Analyse auf bedeutsame Keywords konzentriert.',
                '<b>Dichteformel:</b> (Keyword-Vorkommen ÷ Gesamtzahl bedeutsamer Wörter) × 100.',
                '<b>Achten Sie auf Keyword-Stuffing:</b> eine sehr hohe Dichte (oft über ~3-5% genannt) für ein einzelnes Keyword kann unnatürlich wirken.',
            ],
            howto: [
                { question: 'Welche Keyword-Dichte gilt als gesund?', answer: '<p>Es gibt keine feste Regel, aber viele SEO-Leitfäden empfehlen, die Dichte eines Haupt-Keywords unter etwa 2-3% zu halten.</p>' },
                { question: 'Analysiert dies mehrwortige Phrasen?', answer: '<p>Nein — es werden nur einzelne Wörter analysiert; die Dichteanalyse auf Phrasenebene (2-3 Wörter) ist eine fortgeschrittenere Funktion.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Fügen Sie hier Ihren Inhalt ein...' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1197: Common Misspellings Checker
// ============================================================
const commonMisspellingsCheckerTool: ToolDef = {
    id: '1197',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'I recieve teh package tommorow, seperate from the rest.' }],
        functions: { result: { type: 'function', functionName: 'commonMisspellingsChecker', params: { text: 'text' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'common-misspellings-checker', title: 'Common Misspellings Checker', h1: 'Common Misspellings Checker',
            meta_title: 'Common Misspellings Checker | Find Frequently Misspelled Words in Your Text',
            meta_description: 'Paste your text to check it against a curated list of commonly misspelled English words like "recieve", "definately", and "seperate".',
            short_answer: 'This tool flags common misspellings, e.g. "recieve" and "teh" in a sentence are flagged with their correct spellings "receive" and "the".',
            intro_text: '<p>Paste your text to check it against a curated list of frequently misspelled English words — a quick pass to catch common typos before publishing, without needing a full spell-check dictionary.</p>',
            key_points: [
                '<b>Curated list, not a full dictionary:</b> this checks against roughly 60 of the most commonly cited English misspellings (like "recieve", "definately", "seperate", "wierd"), not every possible spelling error.',
                '<b>Case-insensitive matching:</b> "Teh" and "teh" are both caught, and the suggestion is shown in lowercase.',
                '<b>Not a grammar checker:</b> this only flags known misspelled words, not grammar issues, homophones (e.g. "their/there"), or context-dependent errors.',
            ],
            howto: [
                { question: 'Does this catch every typo?', answer: '<p>No — it only checks against a curated list of well-known common misspellings, so it will miss rare typos or words not on the list.</p>' },
                { question: 'Does this replace a full spell-checker?', answer: '<p>No — for comprehensive spell-checking, use your word processor or browser\'s built-in spell-check; this tool is a fast, focused pass for the most frequent mistakes.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Paste your text here...' }],
            outputs: [],
        },
        ru: {
            slug: 'proverka-chastyh-oshibok', title: 'Проверка частых ошибок', h1: 'Проверка частых ошибок',
            meta_title: 'Проверка частых ошибок | Найдите часто допускаемые опечатки в английском тексте',
            meta_description: 'Вставьте текст, чтобы проверить его по подобранному списку часто допускаемых ошибок в английских словах, таких как "recieve", "definately" и "seperate".',
            short_answer: 'Этот инструмент отмечает частые ошибки, например "recieve" и "teh" в предложении помечаются с правильным написанием "receive" и "the".',
            intro_text: '<p>Вставьте английский текст, чтобы проверить его по подобранному списку часто допускаемых ошибок — быстрая проверка для выявления типичных опечаток перед публикацией, без необходимости полного словаря проверки орфографии.</p>',
            key_points: [
                '<b>Подобранный список, а не полный словарь:</b> проверка идёт по примерно 60 наиболее часто упоминаемым английским ошибкам (например "recieve", "definately", "seperate", "wierd"), а не по всем возможным опечаткам.',
                '<b>Без учёта регистра:</b> "Teh" и "teh" оба будут пойманы, а предложение показывается в нижнем регистре.',
                '<b>Не проверка грамматики:</b> отмечаются только известные орфографические ошибки, а не грамматика, омофоны или контекстно-зависимые ошибки.',
            ],
            howto: [
                { question: 'Ловит ли это каждую опечатку?', answer: '<p>Нет — проверка идёт только по подобранному списку известных частых ошибок, поэтому редкие опечатки или слова вне списка будут пропущены.</p>' },
                { question: 'Заменяет ли это полную проверку орфографии?', answer: '<p>Нет — для полной проверки орфографии используйте текстовый редактор или встроенную проверку браузера; этот инструмент — быстрая проверка самых частых ошибок.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Вставьте ваш текст сюда...' }],
            outputs: [],
        },
        lv: {
            slug: 'biezu-pareizrakstibas-kludu-parbaude', title: 'Biežu Pareizrakstības Kļūdu Pārbaude', h1: 'Biežu Pareizrakstības Kļūdu Pārbaude',
            meta_title: 'Biežu Pareizrakstības Kļūdu Pārbaude | Atrodiet Bieži Sastopamas Kļūdas Angļu Tekstā',
            meta_description: 'Ielīmējiet tekstu, lai pārbaudītu to pret atlasītu bieži sastopamu angļu valodas pareizrakstības kļūdu sarakstu.',
            short_answer: 'Šis rīks atzīmē biežas pareizrakstības kļūdas, piemēram, "recieve" un "teh" teikumā tiek atzīmēti ar pareizo rakstību "receive" un "the".',
            intro_text: '<p>Ielīmējiet angļu tekstu, lai pārbaudītu to pret atlasītu bieži sastopamu pareizrakstības kļūdu sarakstu — ātra pārbaude, lai atklātu tipiskas kļūdas pirms publicēšanas.</p>',
            key_points: [
                '<b>Atlasīts saraksts, nevis pilna vārdnīca:</b> tiek pārbaudīti aptuveni 60 no visbiežāk minētajām angļu valodas pareizrakstības kļūdām.',
                '<b>Nav jutīgs pret reģistru:</b> gan "Teh", gan "teh" tiek uztverti, un ieteikums tiek parādīts mazajos burtos.',
                '<b>Nav gramatikas pārbaudītājs:</b> tiek atzīmēti tikai zināmi pareizrakstības kļūdaini vārdi, nevis gramatikas problēmas vai kontekstatkarīgas kļūdas.',
            ],
            howto: [
                { question: 'Vai tas noķer katru drukas kļūdu?', answer: '<p>Nē — tas pārbauda tikai pret atlasītu labi zināmu biežu kļūdu sarakstu, tāpēc retas drukas kļūdas vai vārdi ārpus saraksta tiks palaisti garām.</p>' },
                { question: 'Vai tas aizstāj pilnu pareizrakstības pārbaudītāju?', answer: '<p>Nē — pilnīgai pareizrakstības pārbaudei izmantojiet teksta redaktoru vai pārlūkprogrammas iebūvēto pārbaudi; šis rīks ir ātra pārbaude biežākajām kļūdām.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ielīmējiet savu tekstu šeit...' }],
            outputs: [],
        },
        pl: {
            slug: 'sprawdzanie-czestych-bledow-pisowni', title: 'Sprawdzanie Częstych Błędów Pisowni', h1: 'Sprawdzanie Częstych Błędów Pisowni',
            meta_title: 'Sprawdzanie Częstych Błędów Pisowni | Znajdź Często Popełniane Błędy w Angielskim Tekście',
            meta_description: 'Wklej swój tekst, aby sprawdzić go pod kątem wyselekcjonowanej listy często popełnianych błędów pisowni w języku angielskim.',
            short_answer: 'To narzędzie oznacza częste błędy pisowni, np. "recieve" i "teh" w zdaniu są oznaczone poprawną pisownią "receive" i "the".',
            intro_text: '<p>Wklej angielski tekst, aby sprawdzić go pod kątem wyselekcjonowanej listy często popełnianych błędów pisowni — szybki sposób na wychwycenie typowych literówek przed publikacją.</p>',
            key_points: [
                '<b>Wyselekcjonowana lista, nie pełny słownik:</b> sprawdzane jest około 60 najczęściej cytowanych angielskich błędów pisowni.',
                '<b>Niewrażliwe na wielkość liter:</b> zarówno "Teh", jak i "teh" są wykrywane, a sugestia jest pokazywana małymi literami.',
                '<b>To nie sprawdzanie gramatyki:</b> oznaczane są tylko znane błędnie napisane słowa, nie problemy gramatyczne czy błędy zależne od kontekstu.',
            ],
            howto: [
                { question: 'Czy to wykrywa każdą literówkę?', answer: '<p>Nie — sprawdza tylko wyselekcjonowaną listę dobrze znanych częstych błędów, więc rzadkie literówki lub słowa spoza listy zostaną pominięte.</p>' },
                { question: 'Czy to zastępuje pełny sprawdzanie pisowni?', answer: '<p>Nie — do pełnego sprawdzania pisowni użyj edytora tekstu lub wbudowanego sprawdzania w przeglądarce; to narzędzie to szybki przegląd najczęstszych błędów.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wklej tutaj swój tekst...' }],
            outputs: [],
        },
        es: {
            slug: 'verificador-de-errores-ortograficos-comunes', title: 'Verificador de Errores Ortográficos Comunes', h1: 'Verificador de Errores Ortográficos Comunes',
            meta_title: 'Verificador de Errores Ortográficos Comunes | Encuentra Palabras Mal Escritas Frecuentemente',
            meta_description: 'Pega tu texto para verificarlo contra una lista seleccionada de palabras en inglés comúnmente mal escritas.',
            short_answer: 'Esta herramienta marca errores ortográficos comunes, p. ej. "recieve" y "teh" en una oración se marcan con su ortografía correcta "receive" y "the".',
            intro_text: '<p>Pega tu texto en inglés para verificarlo contra una lista seleccionada de palabras frecuentemente mal escritas — una revisión rápida para detectar errores tipográficos comunes antes de publicar.</p>',
            key_points: [
                '<b>Lista seleccionada, no un diccionario completo:</b> esto verifica contra aproximadamente 60 de los errores ortográficos en inglés más comúnmente citados.',
                '<b>Coincidencia sin distinción de mayúsculas:</b> tanto "Teh" como "teh" se detectan, y la sugerencia se muestra en minúsculas.',
                '<b>No es un corrector gramatical:</b> solo se marcan palabras mal escritas conocidas, no problemas de gramática ni errores dependientes del contexto.',
            ],
            howto: [
                { question: '¿Esto detecta cada error tipográfico?', answer: '<p>No — solo verifica contra una lista seleccionada de errores comunes conocidos, así que se perderá errores raros o palabras que no están en la lista.</p>' },
                { question: '¿Esto reemplaza un corrector ortográfico completo?', answer: '<p>No — para una revisión ortográfica completa, usa tu procesador de texto o el corrector integrado del navegador; esta herramienta es una revisión rápida de los errores más frecuentes.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Pega tu texto aquí...' }],
            outputs: [],
        },
        fr: {
            slug: 'verificateur-de-fautes-dorthographe-courantes', title: 'Vérificateur de Fautes d\'Orthographe Courantes', h1: 'Vérificateur de Fautes d\'Orthographe Courantes',
            meta_title: 'Vérificateur de Fautes d\'Orthographe Courantes | Trouvez les Mots Fréquemment Mal Orthographiés',
            meta_description: 'Collez votre texte pour le vérifier par rapport à une liste sélectionnée de mots anglais fréquemment mal orthographiés.',
            short_answer: 'Cet outil signale les fautes d\'orthographe courantes, ex. "recieve" et "teh" dans une phrase sont signalés avec leur orthographe correcte "receive" et "the".',
            intro_text: '<p>Collez votre texte en anglais pour le vérifier par rapport à une liste sélectionnée de mots fréquemment mal orthographiés — un passage rapide pour repérer les fautes de frappe courantes avant publication.</p>',
            key_points: [
                '<b>Liste sélectionnée, pas un dictionnaire complet :</b> ceci vérifie par rapport à environ 60 des fautes d\'orthographe anglaises les plus couramment citées.',
                '<b>Correspondance insensible à la casse :</b> "Teh" et "teh" sont tous deux détectés, et la suggestion est affichée en minuscules.',
                '<b>Ce n\'est pas un correcteur grammatical :</b> seuls les mots mal orthographiés connus sont signalés, pas les problèmes de grammaire ni les erreurs dépendantes du contexte.',
            ],
            howto: [
                { question: 'Cela détecte-t-il toutes les fautes de frappe ?', answer: '<p>Non — cela ne vérifie que par rapport à une liste sélectionnée de fautes courantes bien connues, donc les fautes rares ou les mots absents de la liste seront manqués.</p>' },
                { question: 'Cela remplace-t-il un correcteur orthographique complet ?', answer: '<p>Non — pour une vérification orthographique complète, utilisez votre traitement de texte ou le correcteur intégré de votre navigateur ; cet outil est un passage rapide pour les erreurs les plus fréquentes.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Collez votre texte ici...' }],
            outputs: [],
        },
        it: {
            slug: 'verificatore-di-errori-ortografici-comuni', title: 'Verificatore di Errori Ortografici Comuni', h1: 'Verificatore di Errori Ortografici Comuni',
            meta_title: 'Verificatore di Errori Ortografici Comuni | Trova Parole Frequentemente Scritte Male',
            meta_description: 'Incolla il tuo testo per controllarlo rispetto a un elenco selezionato di parole inglesi comunemente scritte in modo errato.',
            short_answer: 'Questo strumento segnala errori ortografici comuni, es. "recieve" e "teh" in una frase vengono segnalati con la loro ortografia corretta "receive" e "the".',
            intro_text: '<p>Incolla il tuo testo in inglese per controllarlo rispetto a un elenco selezionato di parole frequentemente scritte in modo errato — un rapido controllo per individuare errori di battitura comuni prima della pubblicazione.</p>',
            key_points: [
                '<b>Elenco selezionato, non un dizionario completo:</b> questo controlla rispetto a circa 60 dei più comuni errori ortografici inglesi citati.',
                '<b>Corrispondenza senza distinzione tra maiuscole e minuscole:</b> sia "Teh" che "teh" vengono rilevati, e il suggerimento viene mostrato in minuscolo.',
                '<b>Non è un correttore grammaticale:</b> vengono segnalate solo parole scritte in modo errato conosciute, non problemi grammaticali o errori dipendenti dal contesto.',
            ],
            howto: [
                { question: 'Questo rileva ogni errore di battitura?', answer: '<p>No — controlla solo rispetto a un elenco selezionato di errori comuni ben noti, quindi errori rari o parole non presenti nell\'elenco verranno persi.</p>' },
                { question: 'Questo sostituisce un correttore ortografico completo?', answer: '<p>No — per un controllo ortografico completo, usa il tuo elaboratore di testi o il correttore integrato del browser; questo strumento è un controllo rapido per gli errori più frequenti.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Incolla qui il tuo testo...' }],
            outputs: [],
        },
        de: {
            slug: 'haeufige-rechtschreibfehler-prufer', title: 'Häufige-Rechtschreibfehler-Prüfer', h1: 'Häufige-Rechtschreibfehler-Prüfer',
            meta_title: 'Häufige-Rechtschreibfehler-Prüfer | Finden Sie Oft Falsch Geschriebene Wörter',
            meta_description: 'Fügen Sie Ihren Text ein, um ihn gegen eine kuratierte Liste häufig falsch geschriebener englischer Wörter zu prüfen.',
            short_answer: 'Dieses Tool markiert häufige Rechtschreibfehler, z.B. werden "recieve" und "teh" in einem Satz mit ihrer korrekten Schreibweise "receive" und "the" markiert.',
            intro_text: '<p>Fügen Sie Ihren englischen Text ein, um ihn gegen eine kuratierte Liste häufig falsch geschriebener Wörter zu prüfen — ein schneller Durchgang, um typische Tippfehler vor der Veröffentlichung zu erkennen.</p>',
            key_points: [
                '<b>Kuratierte Liste, kein vollständiges Wörterbuch:</b> geprüft wird gegen etwa 60 der am häufigsten genannten englischen Rechtschreibfehler.',
                '<b>Groß-/Kleinschreibung wird ignoriert:</b> sowohl "Teh" als auch "teh" werden erkannt, und der Vorschlag wird in Kleinbuchstaben angezeigt.',
                '<b>Kein Grammatikprüfer:</b> es werden nur bekannte falsch geschriebene Wörter markiert, keine Grammatikprobleme oder kontextabhängigen Fehler.',
            ],
            howto: [
                { question: 'Erkennt dies jeden Tippfehler?', answer: '<p>Nein — es prüft nur gegen eine kuratierte Liste bekannter häufiger Fehler, sodass seltene Tippfehler oder nicht gelistete Wörter übersehen werden.</p>' },
                { question: 'Ersetzt dies eine vollständige Rechtschreibprüfung?', answer: '<p>Nein — für eine umfassende Rechtschreibprüfung nutzen Sie Ihre Textverarbeitung oder die integrierte Prüfung Ihres Browsers; dieses Tool ist ein schneller Durchgang für die häufigsten Fehler.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Fügen Sie hier Ihren Text ein...' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1198: Anagram Checker
// ============================================================
const FIRST_WORD_LABEL: Record<string, string> = {
    en: 'First Word or Phrase', ru: 'Первое слово или фраза', lv: 'Pirmais Vārds vai Frāze', pl: 'Pierwsze Słowo lub Fraza',
    es: 'Primera Palabra o Frase', fr: 'Premier Mot ou Phrase', it: 'Prima Parola o Frase', de: 'Erstes Wort oder Phrase',
}
const SECOND_WORD_LABEL: Record<string, string> = {
    en: 'Second Word or Phrase', ru: 'Второе слово или фраза', lv: 'Otrais Vārds vai Frāze', pl: 'Drugie Słowo lub Fraza',
    es: 'Segunda Palabra o Frase', fr: 'Deuxième Mot ou Phrase', it: 'Seconda Parola o Frase', de: 'Zweites Wort oder Phrase',
}

const anagramCheckerTool: ToolDef = {
    id: '1198',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text_a', default: 'listen' }, { key: 'text_b', default: 'silent' }],
        functions: { result: { type: 'function', functionName: 'anagramChecker', params: { text_a: 'text_a', text_b: 'text_b' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'anagram-checker', title: 'Anagram Checker', h1: 'Anagram Checker',
            meta_title: 'Anagram Checker | Check if Two Words are Anagrams',
            meta_description: 'Enter two words or phrases to instantly check whether they are anagrams of each other.',
            short_answer: 'This tool checks if two words are anagrams, e.g. "listen" and "silent" are confirmed as anagrams since they contain exactly the same letters.',
            intro_text: '<p>Enter two words or phrases to check whether one is an anagram of the other — meaning both contain exactly the same letters, just rearranged.</p>',
            key_points: [
                '<b>How it works:</b> both inputs are lowercased, non-letter/number characters are stripped, and the remaining letters are sorted — if the sorted results match, they\'re anagrams.',
                '<b>Spaces and punctuation are ignored,</b> so multi-word phrases can be checked too (e.g. "dormitory" and "dirty room" are a classic anagram pair).',
                '<b>Case doesn\'t matter</b> — "Listen" and "SILENT" are still correctly identified as anagrams.',
            ],
            howto: [
                { question: 'Can I check phrases, not just single words?', answer: '<p>Yes — spaces and punctuation are ignored, so full phrases work just as well as single words.</p>' },
                { question: 'What counts as "the same letters"?', answer: '<p>Every letter must appear the same number of times in both — an anagram is a true rearrangement, not just sharing some letters.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.en, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.en, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        ru: {
            slug: 'proverka-anagramm', title: 'Проверка анаграмм', h1: 'Проверка анаграмм',
            meta_title: 'Проверка анаграмм | Проверьте, являются ли два слова анаграммами',
            meta_description: 'Введите два слова или фразы, чтобы мгновенно проверить, являются ли они анаграммами друг друга.',
            short_answer: 'Этот инструмент проверяет, являются ли два слова анаграммами, например "listen" и "silent" подтверждаются как анаграммы, так как содержат одинаковые буквы.',
            intro_text: '<p>Введите два слова или фразы, чтобы проверить, является ли одно анаграммой другого — то есть оба содержат абсолютно одинаковые буквы, просто в другом порядке.</p>',
            key_points: [
                '<b>Как это работает:</b> оба ввода приводятся к нижнему регистру, не-буквенные символы удаляются, а оставшиеся буквы сортируются — если отсортированные результаты совпадают, это анаграммы.',
                '<b>Пробелы и пунктуация игнорируются,</b> так что можно проверять и фразы из нескольких слов.',
                '<b>Регистр не имеет значения</b> — "Listen" и "SILENT" всё равно правильно определяются как анаграммы.',
            ],
            howto: [
                { question: 'Можно ли проверять фразы, а не только отдельные слова?', answer: '<p>Да — пробелы и пунктуация игнорируются, так что целые фразы работают так же хорошо, как и отдельные слова.</p>' },
                { question: 'Что считается "одинаковыми буквами"?', answer: '<p>Каждая буква должна встречаться одинаковое количество раз в обоих — анаграмма это настоящая перестановка, а не просто общие буквы.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.ru, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.ru, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        lv: {
            slug: 'anagrammu-parbaudes-riks', title: 'Anagrammu Pārbaudes Rīks', h1: 'Anagrammu Pārbaudes Rīks',
            meta_title: 'Anagrammu Pārbaudes Rīks | Pārbaudiet, Vai Divi Vārdi ir Anagrammas',
            meta_description: 'Ievadiet divus vārdus vai frāzes, lai uzreiz pārbaudītu, vai tās ir savstarpējas anagrammas.',
            short_answer: 'Šis rīks pārbauda, vai divi vārdi ir anagrammas, piemēram, "listen" un "silent" tiek apstiprināti kā anagrammas, jo satur tieši tos pašus burtus.',
            intro_text: '<p>Ievadiet divus vārdus vai frāzes, lai pārbaudītu, vai viens ir otra anagramma — nozīmē, ka abi satur tieši tos pašus burtus, tikai pārkārtotus.</p>',
            key_points: [
                '<b>Kā tas darbojas:</b> abi ievadi tiek pārveidoti mazajos burtos, ne-burtu rakstzīmes tiek noņemtas, un atlikušie burti tiek sakārtoti — ja sakārtotie rezultāti sakrīt, tās ir anagrammas.',
                '<b>Atstarpes un pieturzīmes tiek ignorētas,</b> tāpēc var pārbaudīt arī daudzvārdu frāzes.',
                '<b>Reģistram nav nozīmes</b> — "Listen" un "SILENT" joprojām tiek pareizi identificēti kā anagrammas.',
            ],
            howto: [
                { question: 'Vai varu pārbaudīt frāzes, ne tikai atsevišķus vārdus?', answer: '<p>Jā — atstarpes un pieturzīmes tiek ignorētas, tāpēc pilnas frāzes darbojas tikpat labi kā atsevišķi vārdi.</p>' },
                { question: 'Kas tiek uzskatīts par "tiem pašiem burtiem"?', answer: '<p>Katram burtam abos jāparādās vienādu reižu skaitu — anagramma ir īsta pārkārtošana, ne tikai daļēja burtu kopība.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.lv, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.lv, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        pl: {
            slug: 'sprawdzanie-anagramow', title: 'Sprawdzanie Anagramów', h1: 'Sprawdzanie Anagramów',
            meta_title: 'Sprawdzanie Anagramów | Sprawdź, Czy Dwa Słowa są Anagramami',
            meta_description: 'Wprowadź dwa słowa lub frazy, aby natychmiast sprawdzić, czy są wzajemnymi anagramami.',
            short_answer: 'To narzędzie sprawdza, czy dwa słowa są anagramami, np. "listen" i "silent" są potwierdzone jako anagramy, ponieważ zawierają dokładnie te same litery.',
            intro_text: '<p>Wprowadź dwa słowa lub frazy, aby sprawdzić, czy jedno jest anagramem drugiego — co oznacza, że oba zawierają dokładnie te same litery, tylko przestawione.</p>',
            key_points: [
                '<b>Jak to działa:</b> oba wejścia są zamieniane na małe litery, znaki niebędące literami są usuwane, a pozostałe litery są sortowane — jeśli posortowane wyniki się zgadzają, są anagramami.',
                '<b>Spacje i interpunkcja są ignorowane,</b> więc można sprawdzać także frazy wielowyrazowe.',
                '<b>Wielkość liter nie ma znaczenia</b> — "Listen" i "SILENT" nadal są poprawnie identyfikowane jako anagramy.',
            ],
            howto: [
                { question: 'Czy mogę sprawdzać frazy, a nie tylko pojedyncze słowa?', answer: '<p>Tak — spacje i interpunkcja są ignorowane, więc pełne frazy działają tak samo dobrze jak pojedyncze słowa.</p>' },
                { question: 'Co liczy się jako "te same litery"?', answer: '<p>Każda litera musi występować tyle samo razy w obu — anagram to prawdziwe przestawienie, nie tylko współdzielenie niektórych liter.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.pl, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.pl, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        es: {
            slug: 'verificador-de-anagramas', title: 'Verificador de Anagramas', h1: 'Verificador de Anagramas',
            meta_title: 'Verificador de Anagramas | Comprueba si Dos Palabras son Anagramas',
            meta_description: 'Introduce dos palabras o frases para comprobar instantáneamente si son anagramas entre sí.',
            short_answer: 'Esta herramienta comprueba si dos palabras son anagramas, p. ej. "listen" y "silent" se confirman como anagramas ya que contienen exactamente las mismas letras.',
            intro_text: '<p>Introduce dos palabras o frases para comprobar si una es un anagrama de la otra — es decir, ambas contienen exactamente las mismas letras, solo reordenadas.</p>',
            key_points: [
                '<b>Cómo funciona:</b> ambas entradas se convierten a minúsculas, se eliminan los caracteres no alfanuméricos, y las letras restantes se ordenan — si los resultados ordenados coinciden, son anagramas.',
                '<b>Los espacios y la puntuación se ignoran,</b> así que también se pueden comprobar frases de varias palabras.',
                '<b>Las mayúsculas no importan</b> — "Listen" y "SILENT" se identifican correctamente como anagramas.',
            ],
            howto: [
                { question: '¿Puedo comprobar frases, no solo palabras individuales?', answer: '<p>Sí — los espacios y la puntuación se ignoran, así que las frases completas funcionan igual de bien que las palabras individuales.</p>' },
                { question: '¿Qué cuenta como "las mismas letras"?', answer: '<p>Cada letra debe aparecer el mismo número de veces en ambas — un anagrama es una verdadera reordenación, no solo compartir algunas letras.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.es, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.es, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        fr: {
            slug: 'verificateur-danagrammes', title: 'Vérificateur d\'Anagrammes', h1: 'Vérificateur d\'Anagrammes',
            meta_title: 'Vérificateur d\'Anagrammes | Vérifiez si Deux Mots sont des Anagrammes',
            meta_description: 'Entrez deux mots ou phrases pour vérifier instantanément s\'ils sont des anagrammes l\'un de l\'autre.',
            short_answer: 'Cet outil vérifie si deux mots sont des anagrammes, ex. "listen" et "silent" sont confirmés comme des anagrammes car ils contiennent exactement les mêmes lettres.',
            intro_text: '<p>Entrez deux mots ou phrases pour vérifier si l\'un est une anagramme de l\'autre — c\'est-à-dire que les deux contiennent exactement les mêmes lettres, simplement réarrangées.</p>',
            key_points: [
                '<b>Comment ça marche :</b> les deux entrées sont mises en minuscules, les caractères non alphanumériques sont supprimés, et les lettres restantes sont triées — si les résultats triés correspondent, ce sont des anagrammes.',
                '<b>Les espaces et la ponctuation sont ignorés,</b> donc les expressions de plusieurs mots peuvent aussi être vérifiées.',
                '<b>La casse n\'a pas d\'importance</b> — "Listen" et "SILENT" sont toujours correctement identifiés comme des anagrammes.',
            ],
            howto: [
                { question: 'Puis-je vérifier des phrases, pas seulement des mots seuls ?', answer: '<p>Oui — les espaces et la ponctuation sont ignorés, donc les phrases complètes fonctionnent aussi bien que les mots seuls.</p>' },
                { question: 'Qu\'est-ce qui compte comme "les mêmes lettres" ?', answer: '<p>Chaque lettre doit apparaître le même nombre de fois dans les deux — une anagramme est un véritable réarrangement, pas seulement le partage de quelques lettres.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.fr, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.fr, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        it: {
            slug: 'verificatore-di-anagrammi', title: 'Verificatore di Anagrammi', h1: 'Verificatore di Anagrammi',
            meta_title: 'Verificatore di Anagrammi | Verifica se Due Parole sono Anagrammi',
            meta_description: 'Inserisci due parole o frasi per verificare istantaneamente se sono anagrammi l\'una dell\'altra.',
            short_answer: 'Questo strumento verifica se due parole sono anagrammi, es. "listen" e "silent" sono confermate come anagrammi poiché contengono esattamente le stesse lettere.',
            intro_text: '<p>Inserisci due parole o frasi per verificare se una è un anagramma dell\'altra — cioè entrambe contengono esattamente le stesse lettere, solo riorganizzate.</p>',
            key_points: [
                '<b>Come funziona:</b> entrambi gli input vengono resi minuscoli, i caratteri non alfanumerici vengono rimossi, e le lettere rimanenti vengono ordinate — se i risultati ordinati corrispondono, sono anagrammi.',
                '<b>Spazi e punteggiatura vengono ignorati,</b> quindi si possono verificare anche frasi con più parole.',
                '<b>Le maiuscole non contano</b> — "Listen" e "SILENT" vengono comunque identificati correttamente come anagrammi.',
            ],
            howto: [
                { question: 'Posso verificare frasi, non solo singole parole?', answer: '<p>Sì — spazi e punteggiatura vengono ignorati, quindi frasi complete funzionano bene quanto singole parole.</p>' },
                { question: 'Cosa conta come "le stesse lettere"?', answer: '<p>Ogni lettera deve apparire lo stesso numero di volte in entrambe — un anagramma è una vera riorganizzazione, non solo la condivisione di alcune lettere.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.it, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.it, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
        de: {
            slug: 'anagramm-prufer', title: 'Anagramm-Prüfer', h1: 'Anagramm-Prüfer',
            meta_title: 'Anagramm-Prüfer | Prüfen Sie, ob Zwei Wörter Anagramme Sind',
            meta_description: 'Geben Sie zwei Wörter oder Phrasen ein, um sofort zu prüfen, ob sie Anagramme voneinander sind.',
            short_answer: 'Dieses Tool prüft, ob zwei Wörter Anagramme sind, z.B. werden "listen" und "silent" als Anagramme bestätigt, da sie genau dieselben Buchstaben enthalten.',
            intro_text: '<p>Geben Sie zwei Wörter oder Phrasen ein, um zu prüfen, ob eines ein Anagramm des anderen ist — das heißt, beide enthalten genau dieselben Buchstaben, nur umgeordnet.</p>',
            key_points: [
                '<b>So funktioniert es:</b> beide Eingaben werden kleingeschrieben, Nicht-Buchstaben-Zeichen entfernt und die verbleibenden Buchstaben sortiert — stimmen die sortierten Ergebnisse überein, sind es Anagramme.',
                '<b>Leerzeichen und Satzzeichen werden ignoriert,</b> sodass auch mehrwortige Phrasen geprüft werden können.',
                '<b>Groß-/Kleinschreibung spielt keine Rolle</b> — "Listen" und "SILENT" werden weiterhin korrekt als Anagramme erkannt.',
            ],
            howto: [
                { question: 'Kann ich Phrasen prüfen, nicht nur einzelne Wörter?', answer: '<p>Ja — Leerzeichen und Satzzeichen werden ignoriert, sodass ganze Phrasen genauso gut funktionieren wie einzelne Wörter.</p>' },
                { question: 'Was zählt als "dieselben Buchstaben"?', answer: '<p>Jeder Buchstabe muss in beiden gleich oft vorkommen — ein Anagramm ist eine echte Umordnung, nicht nur das Teilen einiger Buchstaben.</p>' },
            ],
            inputs: [
                { name: 'text_a', label: FIRST_WORD_LABEL.de, type: 'text', placeholder: 'listen' },
                { name: 'text_b', label: SECOND_WORD_LABEL.de, type: 'text', placeholder: 'silent' },
            ],
            outputs: [],
        },
    },
}

// ============================================================
// 1199: Palindrome Checker
// ============================================================
const TEXT_TO_CHECK_LABEL: Record<string, string> = {
    en: 'Text to Check', ru: 'Текст для проверки', lv: 'Pārbaudāmais Teksts', pl: 'Tekst do Sprawdzenia',
    es: 'Texto a Comprobar', fr: 'Texte à Vérifier', it: 'Testo da Verificare', de: 'Zu Prüfender Text',
}

const palindromeCheckerTool: ToolDef = {
    id: '1199',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'A man, a plan, a canal: Panama' }],
        functions: { result: { type: 'function', functionName: 'palindromeChecker', params: { text: 'text' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'palindrome-checker', title: 'Palindrome Checker', h1: 'Palindrome Checker',
            meta_title: 'Palindrome Checker | Check if a Word or Phrase Reads the Same Backwards',
            meta_description: 'Enter a word or phrase to instantly check whether it\'s a palindrome — reading the same forwards and backwards.',
            short_answer: 'This tool checks for palindromes, e.g. "A man, a plan, a canal: Panama" is confirmed as a palindrome once spaces and punctuation are ignored.',
            intro_text: '<p>Enter a word, name, or phrase to check whether it\'s a palindrome — text that reads the same forwards and backwards once spaces, punctuation, and capitalization are ignored.</p>',
            key_points: [
                '<b>How it works:</b> the text is lowercased and stripped of anything that isn\'t a letter or number, then compared to its own reverse.',
                '<b>Classic examples:</b> "racecar", "level", "A man, a plan, a canal: Panama", and "12321" are all palindromes.',
                '<b>Spaces and punctuation don\'t break a palindrome</b> — only the letters and numbers matter.',
            ],
            howto: [
                { question: 'Does capitalization matter?', answer: '<p>No — "Racecar" and "RACECAR" are both correctly identified as palindromes since the check is case-insensitive.</p>' },
                { question: 'Can numbers be palindromes too?', answer: '<p>Yes — a sequence like "12321" is checked the same way as text, since digits are included in the comparison.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.en, type: 'text', placeholder: 'A man, a plan, a canal: Panama' }],
            outputs: [],
        },
        ru: {
            slug: 'proverka-palindromov', title: 'Проверка палиндромов', h1: 'Проверка палиндромов',
            meta_title: 'Проверка палиндромов | Проверьте, читается ли слово или фраза одинаково в обе стороны',
            meta_description: 'Введите слово или фразу, чтобы мгновенно проверить, является ли она палиндромом.',
            short_answer: 'Этот инструмент проверяет палиндромы, например "A man, a plan, a canal: Panama" подтверждается как палиндром после удаления пробелов и пунктуации.',
            intro_text: '<p>Введите слово, имя или фразу, чтобы проверить, является ли она палиндромом — текстом, который читается одинаково вперёд и назад после удаления пробелов, пунктуации и без учёта регистра.</p>',
            key_points: [
                '<b>Как это работает:</b> текст приводится к нижнему регистру и очищается от всего, что не является буквой или цифрой, затем сравнивается с самим собой в обратном порядке.',
                '<b>Классические примеры:</b> "шалаш", "довод", "12321" — все являются палиндромами.',
                '<b>Пробелы и пунктуация не нарушают палиндром</b> — важны только буквы и цифры.',
            ],
            howto: [
                { question: 'Важен ли регистр?', answer: '<p>Нет — "Шалаш" и "ШАЛАШ" оба правильно определяются как палиндромы, так как проверка не чувствительна к регистру.</p>' },
                { question: 'Могут ли числа быть палиндромами?', answer: '<p>Да — последовательность вроде "12321" проверяется так же, как текст, поскольку цифры включены в сравнение.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.ru, type: 'text', placeholder: 'А роза упала на лапу Азора' }],
            outputs: [],
        },
        lv: {
            slug: 'palindromu-parbaudes-riks', title: 'Palindromu Pārbaudes Rīks', h1: 'Palindromu Pārbaudes Rīks',
            meta_title: 'Palindromu Pārbaudes Rīks | Pārbaudiet, Vai Vārds vai Frāze Lasās Vienādi Abos Virzienos',
            meta_description: 'Ievadiet vārdu vai frāzi, lai uzreiz pārbaudītu, vai tas ir palindroms.',
            short_answer: 'Šis rīks pārbauda palindromus, piemēram, "A man, a plan, a canal: Panama" tiek apstiprināts kā palindroms, kad atstarpes un pieturzīmes tiek ignorētas.',
            intro_text: '<p>Ievadiet vārdu, vārdu (nosaukumu) vai frāzi, lai pārbaudītu, vai tas ir palindroms — teksts, kas lasās vienādi abos virzienos, kad atstarpes, pieturzīmes un lielie/mazie burti tiek ignorēti.</p>',
            key_points: [
                '<b>Kā tas darbojas:</b> teksts tiek pārveidots mazajos burtos un attīrīts no visa, kas nav burts vai cipars, tad salīdzināts ar savu apgriezto versiju.',
                '<b>Klasiski piemēri:</b> "racecar", "level", "12321" — visi ir palindromi.',
                '<b>Atstarpes un pieturzīmes nesabojā palindromu</b> — nozīme ir tikai burtiem un cipariem.',
            ],
            howto: [
                { question: 'Vai lielie/mazie burti ir svarīgi?', answer: '<p>Nē — "Racecar" un "RACECAR" abi tiek pareizi identificēti kā palindromi, jo pārbaude neatšķir burtu reģistru.</p>' },
                { question: 'Vai skaitļi arī var būt palindromi?', answer: '<p>Jā — virkne, piemēram, "12321" tiek pārbaudīta tāpat kā teksts, jo cipari tiek iekļauti salīdzinājumā.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.lv, type: 'text', placeholder: 'A man, a plan, a canal: Panama' }],
            outputs: [],
        },
        pl: {
            slug: 'sprawdzanie-palindromow', title: 'Sprawdzanie Palindromów', h1: 'Sprawdzanie Palindromów',
            meta_title: 'Sprawdzanie Palindromów | Sprawdź, Czy Słowo lub Fraza Czyta się Tak Samo Wspak',
            meta_description: 'Wprowadź słowo lub frazę, aby natychmiast sprawdzić, czy jest palindromem.',
            short_answer: 'To narzędzie sprawdza palindromy, np. "A man, a plan, a canal: Panama" jest potwierdzone jako palindrom po pominięciu spacji i interpunkcji.',
            intro_text: '<p>Wprowadź słowo, imię lub frazę, aby sprawdzić, czy jest palindromem — tekstem, który czyta się tak samo do przodu i wspak po pominięciu spacji, interpunkcji i wielkości liter.</p>',
            key_points: [
                '<b>Jak to działa:</b> tekst jest zamieniany na małe litery i oczyszczany ze wszystkiego, co nie jest literą ani cyfrą, a następnie porównywany ze swoją odwróconą wersją.',
                '<b>Klasyczne przykłady:</b> "kajak", "oko", "12321" — wszystkie są palindromami.',
                '<b>Spacje i interpunkcja nie psują palindromu</b> — liczą się tylko litery i cyfry.',
            ],
            howto: [
                { question: 'Czy wielkość liter ma znaczenie?', answer: '<p>Nie — "Kajak" i "KAJAK" oba są poprawnie identyfikowane jako palindromy, ponieważ sprawdzanie nie uwzględnia wielkości liter.</p>' },
                { question: 'Czy liczby też mogą być palindromami?', answer: '<p>Tak — sekwencja taka jak "12321" jest sprawdzana tak samo jak tekst, ponieważ cyfry są uwzględniane w porównaniu.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.pl, type: 'text', placeholder: 'Kajak' }],
            outputs: [],
        },
        es: {
            slug: 'verificador-de-palindromos', title: 'Verificador de Palíndromos', h1: 'Verificador de Palíndromos',
            meta_title: 'Verificador de Palíndromos | Comprueba si una Palabra o Frase se Lee Igual al Revés',
            meta_description: 'Introduce una palabra o frase para comprobar instantáneamente si es un palíndromo.',
            short_answer: 'Esta herramienta comprueba palíndromos, p. ej. "A man, a plan, a canal: Panama" se confirma como palíndromo una vez que se ignoran espacios y puntuación.',
            intro_text: '<p>Introduce una palabra, nombre o frase para comprobar si es un palíndromo — texto que se lee igual hacia adelante y hacia atrás una vez que se ignoran espacios, puntuación y mayúsculas.</p>',
            key_points: [
                '<b>Cómo funciona:</b> el texto se convierte a minúsculas y se elimina todo lo que no sea letra o número, luego se compara con su propia versión invertida.',
                '<b>Ejemplos clásicos:</b> "reconocer", "anilina", "12321" son todos palíndromos.',
                '<b>Los espacios y la puntuación no rompen un palíndromo</b> — solo importan las letras y números.',
            ],
            howto: [
                { question: '¿Importan las mayúsculas?', answer: '<p>No — "Reconocer" y "RECONOCER" se identifican correctamente como palíndromos, ya que la comprobación no distingue mayúsculas.</p>' },
                { question: '¿Los números también pueden ser palíndromos?', answer: '<p>Sí — una secuencia como "12321" se comprueba de la misma manera que el texto, ya que los dígitos se incluyen en la comparación.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.es, type: 'text', placeholder: 'Anilina' }],
            outputs: [],
        },
        fr: {
            slug: 'verificateur-de-palindromes', title: 'Vérificateur de Palindromes', h1: 'Vérificateur de Palindromes',
            meta_title: 'Vérificateur de Palindromes | Vérifiez si un Mot ou une Phrase se Lit de la Même Façon à l\'Envers',
            meta_description: 'Entrez un mot ou une phrase pour vérifier instantanément s\'il s\'agit d\'un palindrome.',
            short_answer: 'Cet outil vérifie les palindromes, ex. "A man, a plan, a canal: Panama" est confirmé comme palindrome une fois les espaces et la ponctuation ignorés.',
            intro_text: '<p>Entrez un mot, un nom ou une phrase pour vérifier s\'il s\'agit d\'un palindrome — un texte qui se lit de la même façon à l\'endroit et à l\'envers une fois les espaces, la ponctuation et la casse ignorés.</p>',
            key_points: [
                '<b>Comment ça marche :</b> le texte est mis en minuscules et débarrassé de tout ce qui n\'est pas une lettre ou un chiffre, puis comparé à sa propre version inversée.',
                '<b>Exemples classiques :</b> "kayak", "ressasser", "12321" sont tous des palindromes.',
                '<b>Les espaces et la ponctuation ne cassent pas un palindrome</b> — seules les lettres et les chiffres comptent.',
            ],
            howto: [
                { question: 'La casse compte-t-elle ?', answer: '<p>Non — "Kayak" et "KAYAK" sont tous deux correctement identifiés comme des palindromes, car la vérification est insensible à la casse.</p>' },
                { question: 'Les nombres peuvent-ils aussi être des palindromes ?', answer: '<p>Oui — une séquence comme "12321" est vérifiée de la même manière qu\'un texte, car les chiffres sont inclus dans la comparaison.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.fr, type: 'text', placeholder: 'Kayak' }],
            outputs: [],
        },
        it: {
            slug: 'verificatore-di-palindromi', title: 'Verificatore di Palindromi', h1: 'Verificatore di Palindromi',
            meta_title: 'Verificatore di Palindromi | Verifica se una Parola o Frase si Legge Uguale al Contrario',
            meta_description: 'Inserisci una parola o frase per verificare istantaneamente se è un palindromo.',
            short_answer: 'Questo strumento verifica i palindromi, es. "A man, a plan, a canal: Panama" è confermato come palindromo una volta ignorati spazi e punteggiatura.',
            intro_text: '<p>Inserisci una parola, un nome o una frase per verificare se è un palindromo — testo che si legge allo stesso modo in avanti e all\'indietro una volta ignorati spazi, punteggiatura e maiuscole.</p>',
            key_points: [
                '<b>Come funziona:</b> il testo viene reso minuscolo e ripulito da tutto ciò che non è una lettera o un numero, quindi confrontato con la propria versione invertita.',
                '<b>Esempi classici:</b> "anna", "ossesso", "12321" sono tutti palindromi.',
                '<b>Spazi e punteggiatura non rompono un palindromo</b> — contano solo lettere e numeri.',
            ],
            howto: [
                { question: 'Le maiuscole contano?', answer: '<p>No — "Anna" e "ANNA" vengono entrambi correttamente identificati come palindromi, poiché il controllo non distingue maiuscole e minuscole.</p>' },
                { question: 'Anche i numeri possono essere palindromi?', answer: '<p>Sì — una sequenza come "12321" viene verificata allo stesso modo del testo, poiché le cifre sono incluse nel confronto.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.it, type: 'text', placeholder: 'Anna' }],
            outputs: [],
        },
        de: {
            slug: 'palindrom-prufer', title: 'Palindrom-Prüfer', h1: 'Palindrom-Prüfer',
            meta_title: 'Palindrom-Prüfer | Prüfen Sie, ob ein Wort oder eine Phrase Rückwärts Gleich Gelesen Wird',
            meta_description: 'Geben Sie ein Wort oder eine Phrase ein, um sofort zu prüfen, ob es sich um ein Palindrom handelt.',
            short_answer: 'Dieses Tool prüft auf Palindrome, z.B. wird "A man, a plan, a canal: Panama" als Palindrom bestätigt, sobald Leerzeichen und Satzzeichen ignoriert werden.',
            intro_text: '<p>Geben Sie ein Wort, einen Namen oder eine Phrase ein, um zu prüfen, ob es sich um ein Palindrom handelt — Text, der vorwärts und rückwärts gleich gelesen wird, sobald Leerzeichen, Satzzeichen und Groß-/Kleinschreibung ignoriert werden.</p>',
            key_points: [
                '<b>So funktioniert es:</b> der Text wird kleingeschrieben und von allem befreit, was kein Buchstabe oder keine Zahl ist, dann mit seiner eigenen umgekehrten Version verglichen.',
                '<b>Klassische Beispiele:</b> "Rentner", "Reittier", "12321" sind alle Palindrome.',
                '<b>Leerzeichen und Satzzeichen zerstören kein Palindrom</b> — nur Buchstaben und Zahlen zählen.',
            ],
            howto: [
                { question: 'Spielt die Groß-/Kleinschreibung eine Rolle?', answer: '<p>Nein — "Rentner" und "RENTNER" werden beide korrekt als Palindrome erkannt, da die Prüfung nicht zwischen Groß- und Kleinschreibung unterscheidet.</p>' },
                { question: 'Können auch Zahlen Palindrome sein?', answer: '<p>Ja — eine Folge wie "12321" wird genauso geprüft wie Text, da Ziffern in den Vergleich einbezogen werden.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_CHECK_LABEL.de, type: 'text', placeholder: 'Reittier' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1200: Pig Latin Translator
// ============================================================
const pigLatinTranslatorTool: ToolDef = {
    id: '1200',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'Hello world, this is fun!' }],
        functions: { result: { type: 'function', functionName: 'pigLatinTranslator', params: { text: 'text' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'pig-latin-translator', title: 'Pig Latin Translator', h1: 'Pig Latin Translator',
            meta_title: 'Pig Latin Translator | Convert English Text to Pig Latin',
            meta_description: 'Type any English text to instantly translate it into Pig Latin, following the classic consonant-shift word game rules.',
            short_answer: 'This tool converts text to Pig Latin, e.g. "Hello world" becomes "Ellohay orldway".',
            intro_text: '<p>Type any English text to translate it into Pig Latin — the classic word game where consonant-initial words move their leading consonants to the end and add "ay", while vowel-initial words just add "way".</p>',
            key_points: [
                '<b>Consonant-initial words:</b> move the leading consonant cluster to the end and add "ay" — e.g. "hello" → "ellohay", "fun" → "unfay".',
                '<b>Vowel-initial words:</b> just add "way" — e.g. "apple" → "appleway".',
                '<b>Capitalization and punctuation are preserved</b> — a capitalized word stays capitalized in its translated form, and trailing punctuation stays attached.',
            ],
            howto: [
                { question: 'Is Pig Latin a real language?', answer: '<p>No — it\'s a playful, informal word game/language game popular in English-speaking countries, not a real constructed or natural language.</p>' },
                { question: 'Does this handle punctuation correctly?', answer: '<p>Yes — trailing punctuation like commas, periods, and exclamation marks stay attached to the translated word.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Type your text here...' }],
            outputs: [],
        },
        ru: {
            slug: 'perevodchik-svinyachey-latyni', title: 'Переводчик на свинячью латынь', h1: 'Переводчик на свинячью латынь',
            meta_title: 'Переводчик на свинячью латынь | Преобразуйте английский текст в Pig Latin',
            meta_description: 'Введите любой английский текст, чтобы мгновенно перевести его на Pig Latin по классическим правилам этой словесной игры.',
            short_answer: 'Этот инструмент преобразует текст в Pig Latin, например "Hello world" становится "Ellohay orldway".',
            intro_text: '<p>Введите любой английский текст, чтобы перевести его на Pig Latin — классическую словесную игру, где слова, начинающиеся с согласной, переносят начальные согласные в конец и добавляют "ay", а слова с гласной в начале просто добавляют "way".</p>',
            key_points: [
                '<b>Слова с согласной в начале:</b> начальный кластер согласных переносится в конец с добавлением "ay" — например "hello" → "ellohay".',
                '<b>Слова с гласной в начале:</b> просто добавляется "way" — например "apple" → "appleway".',
                '<b>Регистр и пунктуация сохраняются</b> — слово с заглавной буквы остаётся с заглавной буквы в переводе.',
            ],
            howto: [
                { question: 'Pig Latin — это настоящий язык?', answer: '<p>Нет — это шутливая, неформальная словесная игра, популярная в англоязычных странах, а не настоящий естественный или сконструированный язык.</p>' },
                { question: 'Правильно ли обрабатывается пунктуация?', answer: '<p>Да — знаки препинания в конце слова, такие как запятые, точки и восклицательные знаки, остаются присоединёнными к переведённому слову.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Введите ваш текст сюда...' }],
            outputs: [],
        },
        lv: {
            slug: 'sivenu-latinu-tulkotajs', title: 'Sivēnu Latīņu Tulkotājs', h1: 'Sivēnu Latīņu Tulkotājs',
            meta_title: 'Sivēnu Latīņu Tulkotājs | Pārveidojiet Angļu Tekstu Sivēnu Latīņu Valodā',
            meta_description: 'Ierakstiet jebkuru angļu tekstu, lai uzreiz to pārtulkotu Sivēnu latīņu valodā pēc klasiskajiem šīs vārdu spēles noteikumiem.',
            short_answer: 'Šis rīks pārveido tekstu Sivēnu latīņu valodā, piemēram, "Hello world" kļūst par "Ellohay orldway".',
            intro_text: '<p>Ierakstiet jebkuru angļu tekstu, lai to pārtulkotu Sivēnu latīņu valodā — klasisko vārdu spēli, kurā vārdi, kas sākas ar līdzskani, pārvieto sākuma līdzskaņus uz beigām un pievieno "ay", bet vārdi, kas sākas ar patskani, vienkārši pievieno "way".</p>',
            key_points: [
                '<b>Vārdi ar līdzskani sākumā:</b> sākuma līdzskaņu kopa tiek pārvietota uz beigām un pievienots "ay" — piem., "hello" → "ellohay".',
                '<b>Vārdi ar patskani sākumā:</b> vienkārši pievieno "way" — piem., "apple" → "appleway".',
                '<b>Lielie/mazie burti un pieturzīmes tiek saglabāti</b> — ar lielo burtu rakstīts vārds paliek ar lielo burtu arī tulkotajā formā.',
            ],
            howto: [
                { question: 'Vai Sivēnu latīņu ir īsta valoda?', answer: '<p>Nē — tā ir rotaļīga, neformāla vārdu spēle, populāra angliski runājošajās valstīs, nevis īsta konstruēta vai dabiska valoda.</p>' },
                { question: 'Vai tas pareizi apstrādā pieturzīmes?', answer: '<p>Jā — beigu pieturzīmes, piemēram, komati, punkti un izsaukuma zīmes, paliek pievienotas tulkotajam vārdam.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ierakstiet savu tekstu šeit...' }],
            outputs: [],
        },
        pl: {
            slug: 'tlumacz-swinskiej-laciny', title: 'Tłumacz Świńskiej Łaciny', h1: 'Tłumacz Świńskiej Łaciny',
            meta_title: 'Tłumacz Świńskiej Łaciny | Przekonwertuj Angielski Tekst na Pig Latin',
            meta_description: 'Wpisz dowolny angielski tekst, aby natychmiast przetłumaczyć go na Pig Latin, według klasycznych zasad tej gry słownej.',
            short_answer: 'To narzędzie konwertuje tekst na Pig Latin, np. "Hello world" staje się "Ellohay orldway".',
            intro_text: '<p>Wpisz dowolny angielski tekst, aby przetłumaczyć go na Pig Latin — klasyczną grę słowną, w której słowa zaczynające się od spółgłoski przenoszą początkowe spółgłoski na koniec i dodają "ay", a słowa zaczynające się od samogłoski po prostu dodają "way".</p>',
            key_points: [
                '<b>Słowa zaczynające się od spółgłoski:</b> początkowa grupa spółgłosek jest przenoszona na koniec z dodaniem "ay" — np. "hello" → "ellohay".',
                '<b>Słowa zaczynające się od samogłoski:</b> po prostu dodawane jest "way" — np. "apple" → "appleway".',
                '<b>Wielkość liter i interpunkcja są zachowywane</b> — słowo pisane wielką literą pozostaje takie w przetłumaczonej formie.',
            ],
            howto: [
                { question: 'Czy Pig Latin to prawdziwy język?', answer: '<p>Nie — to żartobliwa, nieformalna gra słowna popularna w krajach anglojęzycznych, a nie prawdziwy skonstruowany czy naturalny język.</p>' },
                { question: 'Czy to poprawnie obsługuje interpunkcję?', answer: '<p>Tak — końcowa interpunkcja, jak przecinki, kropki i wykrzykniki, pozostaje dołączona do przetłumaczonego słowa.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wpisz tutaj swój tekst...' }],
            outputs: [],
        },
        es: {
            slug: 'traductor-de-pig-latin', title: 'Traductor de Pig Latin', h1: 'Traductor de Pig Latin',
            meta_title: 'Traductor de Pig Latin | Convierte Texto en Inglés a Pig Latin',
            meta_description: 'Escribe cualquier texto en inglés para traducirlo instantáneamente a Pig Latin, siguiendo las reglas clásicas de este juego de palabras.',
            short_answer: 'Esta herramienta convierte texto a Pig Latin, p. ej. "Hello world" se convierte en "Ellohay orldway".',
            intro_text: '<p>Escribe cualquier texto en inglés para traducirlo a Pig Latin — el clásico juego de palabras donde las palabras que comienzan con consonante mueven sus consonantes iniciales al final y añaden "ay", mientras que las que comienzan con vocal solo añaden "way".</p>',
            key_points: [
                '<b>Palabras que empiezan con consonante:</b> el grupo consonántico inicial se mueve al final y se añade "ay" — p. ej. "hello" → "ellohay".',
                '<b>Palabras que empiezan con vocal:</b> simplemente se añade "way" — p. ej. "apple" → "appleway".',
                '<b>Las mayúsculas y la puntuación se conservan</b> — una palabra en mayúscula sigue en mayúscula en su forma traducida.',
            ],
            howto: [
                { question: '¿Es el Pig Latin un idioma real?', answer: '<p>No — es un juego de palabras informal y lúdico popular en países de habla inglesa, no un idioma real construido o natural.</p>' },
                { question: '¿Maneja esto correctamente la puntuación?', answer: '<p>Sí — la puntuación final como comas, puntos y signos de exclamación permanece adjunta a la palabra traducida.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Escribe tu texto aquí...' }],
            outputs: [],
        },
        fr: {
            slug: 'traducteur-de-pig-latin', title: 'Traducteur de Pig Latin', h1: 'Traducteur de Pig Latin',
            meta_title: 'Traducteur de Pig Latin | Convertissez un Texte Anglais en Pig Latin',
            meta_description: 'Tapez n\'importe quel texte anglais pour le traduire instantanément en Pig Latin, selon les règles classiques de ce jeu de mots.',
            short_answer: 'Cet outil convertit le texte en Pig Latin, ex. "Hello world" devient "Ellohay orldway".',
            intro_text: '<p>Tapez n\'importe quel texte anglais pour le traduire en Pig Latin — le jeu de mots classique où les mots commençant par une consonne déplacent leurs consonnes initiales à la fin et ajoutent "ay", tandis que les mots commençant par une voyelle ajoutent simplement "way".</p>',
            key_points: [
                '<b>Mots commençant par une consonne :</b> le groupe consonantique initial est déplacé à la fin avec ajout de "ay" — ex. "hello" → "ellohay".',
                '<b>Mots commençant par une voyelle :</b> on ajoute simplement "way" — ex. "apple" → "appleway".',
                '<b>La casse et la ponctuation sont préservées</b> — un mot en majuscule reste en majuscule dans sa forme traduite.',
            ],
            howto: [
                { question: 'Le Pig Latin est-il une vraie langue ?', answer: '<p>Non — c\'est un jeu de mots informel et ludique populaire dans les pays anglophones, pas une vraie langue construite ou naturelle.</p>' },
                { question: 'Cela gère-t-il correctement la ponctuation ?', answer: '<p>Oui — la ponctuation finale comme les virgules, points et points d\'exclamation reste attachée au mot traduit.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Tapez votre texte ici...' }],
            outputs: [],
        },
        it: {
            slug: 'traduttore-pig-latin', title: 'Traduttore Pig Latin', h1: 'Traduttore Pig Latin',
            meta_title: 'Traduttore Pig Latin | Converti Testo Inglese in Pig Latin',
            meta_description: 'Digita qualsiasi testo inglese per tradurlo istantaneamente in Pig Latin, seguendo le regole classiche di questo gioco di parole.',
            short_answer: 'Questo strumento converte il testo in Pig Latin, es. "Hello world" diventa "Ellohay orldway".',
            intro_text: '<p>Digita qualsiasi testo inglese per tradurlo in Pig Latin — il classico gioco di parole in cui le parole che iniziano con una consonante spostano le consonanti iniziali alla fine e aggiungono "ay", mentre quelle che iniziano con una vocale aggiungono semplicemente "way".</p>',
            key_points: [
                '<b>Parole che iniziano con consonante:</b> il gruppo consonantico iniziale viene spostato alla fine con l\'aggiunta di "ay" — es. "hello" → "ellohay".',
                '<b>Parole che iniziano con vocale:</b> si aggiunge semplicemente "way" — es. "apple" → "appleway".',
                '<b>Maiuscole e punteggiatura vengono preservate</b> — una parola con la maiuscola resta con la maiuscola nella forma tradotta.',
            ],
            howto: [
                { question: 'Il Pig Latin è una lingua reale?', answer: '<p>No — è un gioco di parole informale e giocoso popolare nei paesi di lingua inglese, non una vera lingua costruita o naturale.</p>' },
                { question: 'Questo gestisce correttamente la punteggiatura?', answer: '<p>Sì — la punteggiatura finale come virgole, punti ed esclamativi resta attaccata alla parola tradotta.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Digita qui il tuo testo...' }],
            outputs: [],
        },
        de: {
            slug: 'pig-latin-ubersetzer', title: 'Pig-Latin-Übersetzer', h1: 'Pig-Latin-Übersetzer',
            meta_title: 'Pig-Latin-Übersetzer | Englischen Text in Pig Latin Umwandeln',
            meta_description: 'Geben Sie beliebigen englischen Text ein, um ihn sofort nach den klassischen Regeln dieses Wortspiels in Pig Latin zu übersetzen.',
            short_answer: 'Dieses Tool wandelt Text in Pig Latin um, z.B. wird "Hello world" zu "Ellohay orldway".',
            intro_text: '<p>Geben Sie beliebigen englischen Text ein, um ihn in Pig Latin zu übersetzen — das klassische Wortspiel, bei dem Wörter, die mit einem Konsonanten beginnen, ihre führenden Konsonanten ans Ende verschieben und "ay" anhängen, während Wörter, die mit einem Vokal beginnen, einfach "way" anhängen.</p>',
            key_points: [
                '<b>Wörter mit Konsonant am Anfang:</b> die führende Konsonantengruppe wird ans Ende verschoben und "ay" angehängt — z.B. "hello" → "ellohay".',
                '<b>Wörter mit Vokal am Anfang:</b> es wird einfach "way" angehängt — z.B. "apple" → "appleway".',
                '<b>Groß-/Kleinschreibung und Satzzeichen bleiben erhalten</b> — ein großgeschriebenes Wort bleibt in seiner übersetzten Form großgeschrieben.',
            ],
            howto: [
                { question: 'Ist Pig Latin eine echte Sprache?', answer: '<p>Nein — es ist ein spielerisches, informelles Wortspiel, das in englischsprachigen Ländern beliebt ist, keine echte konstruierte oder natürliche Sprache.</p>' },
                { question: 'Wird Satzzeichen korrekt behandelt?', answer: '<p>Ja — nachgestellte Satzzeichen wie Kommas, Punkte und Ausrufezeichen bleiben am übersetzten Wort hängen.</p>' },
            ],
            inputs: [{ name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Geben Sie hier Ihren Text ein...' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1201: Acronym Generator
// ============================================================
const PHRASE_INPUT_LABEL: Record<string, string> = {
    en: 'Phrase', ru: 'Фраза', lv: 'Frāze', pl: 'Fraza',
    es: 'Frase', fr: 'Phrase', it: 'Frase', de: 'Phrase',
}

const acronymGeneratorTool: ToolDef = {
    id: '1201',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'As Soon As Possible' }],
        functions: { result: { type: 'function', functionName: 'acronymGenerator', params: { text: 'text' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'acronym-generator', title: 'Acronym Generator', h1: 'Acronym Generator',
            meta_title: 'Acronym Generator | Turn a Phrase into an Acronym',
            meta_description: 'Type any phrase to instantly generate its acronym from the first letter of each word.',
            short_answer: 'This tool generates an acronym, e.g. "As Soon As Possible" becomes "ASAP".',
            intro_text: '<p>Type any multi-word phrase to generate its acronym — the first letter of each word, capitalized, exactly how well-known acronyms like NATO or ASAP are formed.</p>',
            key_points: [
                '<b>Formula:</b> takes the first letter of every word in the phrase and uppercases it.',
                '<b>Example:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Note:</b> this includes every word\'s first letter, including short connector words like "of" or "the" — some real-world acronyms deliberately skip these, so you may want to remove such words from your input first if you want a shorter result.',
            ],
            howto: [
                { question: 'Does this skip small words like "the" or "of"?', answer: '<p>No — every word\'s first letter is included; if you want to exclude connector words, remove them from your input phrase before generating.</p>' },
                { question: 'Can I use this for company or project names?', answer: '<p>Yes — it works for any phrase, making it a quick way to brainstorm potential acronyms for project or product names.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.en, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        ru: {
            slug: 'generator-akronimov', title: 'Генератор акронимов', h1: 'Генератор акронимов',
            meta_title: 'Генератор акронимов | Превратите фразу в акроним',
            meta_description: 'Введите любую фразу, чтобы мгновенно сгенерировать её акроним из первых букв каждого слова.',
            short_answer: 'Этот инструмент генерирует акроним, например "As Soon As Possible" становится "ASAP".',
            intro_text: '<p>Введите любую многословную фразу, чтобы сгенерировать её акроним — первую букву каждого слова, в верхнем регистре, именно так, как формируются известные акронимы вроде NATO или ASAP.</p>',
            key_points: [
                '<b>Формула:</b> берётся первая буква каждого слова во фразе и переводится в верхний регистр.',
                '<b>Пример:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Примечание:</b> включается первая буква каждого слова, включая короткие связующие слова вроде "of" или "the" — некоторые реальные акронимы намеренно их пропускают.',
            ],
            howto: [
                { question: 'Пропускаются ли короткие слова вроде "the" или "of"?', answer: '<p>Нет — включается первая буква каждого слова; если хотите исключить связующие слова, удалите их из фразы перед генерацией.</p>' },
                { question: 'Можно ли использовать это для названий компаний или проектов?', answer: '<p>Да — это работает с любой фразой, что делает это быстрым способом придумать потенциальные акронимы для названий проектов или продуктов.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.ru, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        lv: {
            slug: 'akronimu-generators', title: 'Akronīmu Ģenerators', h1: 'Akronīmu Ģenerators',
            meta_title: 'Akronīmu Ģenerators | Pārvērtiet Frāzi Akronīmā',
            meta_description: 'Ierakstiet jebkuru frāzi, lai uzreiz ģenerētu tās akronīmu no katra vārda pirmā burta.',
            short_answer: 'Šis rīks ģenerē akronīmu, piemēram, "As Soon As Possible" kļūst par "ASAP".',
            intro_text: '<p>Ierakstiet jebkuru daudzvārdu frāzi, lai ģenerētu tās akronīmu — katra vārda pirmo burtu, lielo, tieši tā, kā veidojas zināmi akronīmi kā NATO vai ASAP.</p>',
            key_points: [
                '<b>Formula:</b> tiek ņemts katra vārda pirmais burts frāzē un pārveidots lielajā burtā.',
                '<b>Piemērs:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Piezīme:</b> tiek iekļauts katra vārda pirmais burts, ieskaitot īsus saikļa vārdus kā "of" vai "the".',
            ],
            howto: [
                { question: 'Vai tas izlaiž mazus vārdus kā "the" vai "of"?', answer: '<p>Nē — tiek iekļauts katra vārda pirmais burts; ja vēlaties izslēgt saikļa vārdus, noņemiet tos no ievadītās frāzes pirms ģenerēšanas.</p>' },
                { question: 'Vai varu to izmantot uzņēmumu vai projektu nosaukumiem?', answer: '<p>Jā — tas darbojas ar jebkuru frāzi, padarot to par ātru veidu, kā izdomāt iespējamos akronīmus projektu vai produktu nosaukumiem.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.lv, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        pl: {
            slug: 'generator-akronimow', title: 'Generator Akronimów', h1: 'Generator Akronimów',
            meta_title: 'Generator Akronimów | Zamień Frazę w Akronim',
            meta_description: 'Wpisz dowolną frazę, aby natychmiast wygenerować jej akronim z pierwszej litery każdego słowa.',
            short_answer: 'To narzędzie generuje akronim, np. "As Soon As Possible" staje się "ASAP".',
            intro_text: '<p>Wpisz dowolną wielowyrazową frazę, aby wygenerować jej akronim — pierwszą literę każdego słowa, wielką, dokładnie tak jak tworzone są znane akronimy jak NATO czy ASAP.</p>',
            key_points: [
                '<b>Wzór:</b> pobiera pierwszą literę każdego słowa we frazie i zamienia ją na wielką.',
                '<b>Przykład:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Uwaga:</b> obejmuje pierwszą literę każdego słowa, w tym krótkie słowa łączące jak "of" czy "the".',
            ],
            howto: [
                { question: 'Czy to pomija małe słowa jak "the" czy "of"?', answer: '<p>Nie — uwzględniana jest pierwsza litera każdego słowa; jeśli chcesz wykluczyć słowa łączące, usuń je z frazy wejściowej przed generowaniem.</p>' },
                { question: 'Czy mogę użyć tego do nazw firm lub projektów?', answer: '<p>Tak — działa z dowolną frazą, dzięki czemu to szybki sposób na wymyślenie potencjalnych akronimów dla nazw projektów lub produktów.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.pl, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        es: {
            slug: 'generador-de-acronimos', title: 'Generador de Acrónimos', h1: 'Generador de Acrónimos',
            meta_title: 'Generador de Acrónimos | Convierte una Frase en un Acrónimo',
            meta_description: 'Escribe cualquier frase para generar instantáneamente su acrónimo a partir de la primera letra de cada palabra.',
            short_answer: 'Esta herramienta genera un acrónimo, p. ej. "As Soon As Possible" se convierte en "ASAP".',
            intro_text: '<p>Escribe cualquier frase de varias palabras para generar su acrónimo — la primera letra de cada palabra, en mayúscula, exactamente como se forman acrónimos conocidos como NATO o ASAP.</p>',
            key_points: [
                '<b>Fórmula:</b> toma la primera letra de cada palabra en la frase y la pone en mayúscula.',
                '<b>Ejemplo:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Nota:</b> esto incluye la primera letra de cada palabra, incluyendo palabras conectoras cortas como "de" o "el".',
            ],
            howto: [
                { question: '¿Esto omite palabras pequeñas como "el" o "de"?', answer: '<p>No — se incluye la primera letra de cada palabra; si quieres excluir palabras conectoras, elimínalas de tu frase antes de generar.</p>' },
                { question: '¿Puedo usar esto para nombres de empresas o proyectos?', answer: '<p>Sí — funciona con cualquier frase, lo que lo convierte en una forma rápida de generar ideas de acrónimos potenciales para nombres de proyectos o productos.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.es, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        fr: {
            slug: 'generateur-dacronymes', title: 'Générateur d\'Acronymes', h1: 'Générateur d\'Acronymes',
            meta_title: 'Générateur d\'Acronymes | Transformez une Phrase en Acronyme',
            meta_description: 'Tapez n\'importe quelle phrase pour générer instantanément son acronyme à partir de la première lettre de chaque mot.',
            short_answer: 'Cet outil génère un acronyme, ex. "As Soon As Possible" devient "ASAP".',
            intro_text: '<p>Tapez n\'importe quelle phrase de plusieurs mots pour générer son acronyme — la première lettre de chaque mot, en majuscule, exactement comme se forment des acronymes connus comme OTAN ou ASAP.</p>',
            key_points: [
                '<b>Formule :</b> prend la première lettre de chaque mot de la phrase et la met en majuscule.',
                '<b>Exemple :</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Remarque :</b> ceci inclut la première lettre de chaque mot, y compris les petits mots de liaison comme "de" ou "le".',
            ],
            howto: [
                { question: 'Cela ignore-t-il les petits mots comme "le" ou "de" ?', answer: '<p>Non — la première lettre de chaque mot est incluse ; si vous voulez exclure les mots de liaison, retirez-les de votre phrase avant de générer.</p>' },
                { question: 'Puis-je utiliser cela pour des noms d\'entreprise ou de projet ?', answer: '<p>Oui — cela fonctionne avec n\'importe quelle phrase, ce qui en fait un moyen rapide de trouver des acronymes potentiels pour des noms de projets ou de produits.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.fr, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        it: {
            slug: 'generatore-di-acronimi', title: 'Generatore di Acronimi', h1: 'Generatore di Acronimi',
            meta_title: 'Generatore di Acronimi | Trasforma una Frase in un Acronimo',
            meta_description: 'Digita qualsiasi frase per generare istantaneamente il suo acronimo dalla prima lettera di ogni parola.',
            short_answer: 'Questo strumento genera un acronimo, es. "As Soon As Possible" diventa "ASAP".',
            intro_text: '<p>Digita qualsiasi frase con più parole per generare il suo acronimo — la prima lettera di ogni parola, maiuscola, esattamente come si formano acronimi noti come NATO o ASAP.</p>',
            key_points: [
                '<b>Formula:</b> prende la prima lettera di ogni parola nella frase e la rende maiuscola.',
                '<b>Esempio:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Nota:</b> questo include la prima lettera di ogni parola, incluse brevi parole connettive come "di" o "il".',
            ],
            howto: [
                { question: 'Questo salta le parole piccole come "il" o "di"?', answer: '<p>No — viene inclusa la prima lettera di ogni parola; se vuoi escludere le parole connettive, rimuovile dalla tua frase prima di generare.</p>' },
                { question: 'Posso usarlo per nomi di aziende o progetti?', answer: '<p>Sì — funziona con qualsiasi frase, rendendolo un modo rapido per fare brainstorming di potenziali acronimi per nomi di progetti o prodotti.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.it, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
        de: {
            slug: 'akronym-generator', title: 'Akronym-Generator', h1: 'Akronym-Generator',
            meta_title: 'Akronym-Generator | Verwandeln Sie eine Phrase in ein Akronym',
            meta_description: 'Geben Sie eine beliebige Phrase ein, um sofort ihr Akronym aus dem ersten Buchstaben jedes Wortes zu generieren.',
            short_answer: 'Dieses Tool generiert ein Akronym, z.B. wird "As Soon As Possible" zu "ASAP".',
            intro_text: '<p>Geben Sie eine mehrwortige Phrase ein, um ihr Akronym zu generieren — den ersten Buchstaben jedes Wortes, großgeschrieben, genau wie bekannte Akronyme wie NATO oder ASAP gebildet werden.</p>',
            key_points: [
                '<b>Formel:</b> nimmt den ersten Buchstaben jedes Wortes in der Phrase und schreibt ihn groß.',
                '<b>Beispiel:</b> "North Atlantic Treaty Organization" → "NATO".',
                '<b>Hinweis:</b> dies umfasst den ersten Buchstaben jedes Wortes, einschließlich kurzer Verbindungswörter wie "von" oder "der".',
            ],
            howto: [
                { question: 'Werden kleine Wörter wie "der" oder "von" übersprungen?', answer: '<p>Nein — der erste Buchstabe jedes Wortes wird einbezogen; wenn Sie Verbindungswörter ausschließen möchten, entfernen Sie sie vor dem Generieren aus Ihrer Phrase.</p>' },
                { question: 'Kann ich das für Firmen- oder Projektnamen verwenden?', answer: '<p>Ja — es funktioniert mit jeder Phrase und ist damit eine schnelle Möglichkeit, potenzielle Akronyme für Projekt- oder Produktnamen zu finden.</p>' },
            ],
            inputs: [{ name: 'text', label: PHRASE_INPUT_LABEL.de, type: 'text', placeholder: 'As Soon As Possible' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1202: Random Word Generator
// ============================================================
const NUMBER_OF_WORDS_LABEL: Record<string, string> = {
    en: 'Number of Words', ru: 'Количество слов', lv: 'Vārdu Skaits', pl: 'Liczba Słów',
    es: 'Número de Palabras', fr: 'Nombre de Mots', it: 'Numero di Parole', de: 'Anzahl der Wörter',
}

const randomWordGeneratorTool: ToolDef = {
    id: '1202',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'count', default: 5 }],
        functions: { result: { type: 'function', functionName: 'randomWordGenerator', params: { count: 'count' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'random-word-generator', title: 'Random Word Generator', h1: 'Random Word Generator',
            meta_title: 'Random Word Generator | Generate Random English Words',
            meta_description: 'Generate a set number of random English words — useful for writing prompts, word games, and warm-up exercises.',
            short_answer: 'This tool generates random words, e.g. requesting 5 words might return "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Choose how many random words you need and generate them instantly — useful for writing prompts, brainstorming, word association games, and classroom warm-up exercises.</p>',
            key_points: [
                '<b>Up to 20 words</b> can be generated at once.',
                '<b>Words are drawn from a curated bank</b> of common, everyday English nouns — not filtered by difficulty or theme.',
                '<b>Each click gives a fresh set</b> — words are chosen independently each time you calculate, so repeats within a set are possible just as they would be with real random drawing.',
            ],
            howto: [
                { question: 'Can the same word appear twice in one result?', answer: '<p>Yes — each word is picked independently, so with a small word bank it\'s possible (though not guaranteed) for a word to repeat within a single set.</p>' },
                { question: 'What are these words useful for?', answer: '<p>Common uses include creative writing prompts, "describe this word" games, vocabulary warm-ups, and Pictionary-style party games.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.en, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        ru: {
            slug: 'generator-sluchaynyh-slov', title: 'Генератор случайных слов', h1: 'Генератор случайных слов',
            meta_title: 'Генератор случайных слов | Генерируйте случайные английские слова',
            meta_description: 'Сгенерируйте заданное количество случайных английских слов — полезно для творческих заданий, словесных игр и разминок.',
            short_answer: 'Этот инструмент генерирует случайные слова, например запрос 5 слов может вернуть "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Выберите, сколько случайных слов вам нужно, и сгенерируйте их мгновенно — полезно для творческих заданий, мозгового штурма, игр на ассоциации и разминок на занятиях.</p>',
            key_points: [
                '<b>Можно сгенерировать до 20 слов</b> за раз.',
                '<b>Слова берутся из подобранного банка</b> обычных повседневных английских существительных — без фильтрации по сложности или теме.',
                '<b>Каждый клик даёт новый набор</b> — слова выбираются независимо при каждом расчёте, поэтому повторы внутри набора возможны.',
            ],
            howto: [
                { question: 'Может ли одно слово появиться дважды в одном результате?', answer: '<p>Да — каждое слово выбирается независимо, поэтому при небольшом банке слов возможен (хотя не гарантирован) повтор в рамках одного набора.</p>' },
                { question: 'Для чего полезны эти слова?', answer: '<p>Обычное применение — творческие задания, игры "опиши это слово", разминки словарного запаса и вечеринки в стиле Pictionary.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.ru, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        lv: {
            slug: 'nejausu-vardu-generators', title: 'Nejaušu Vārdu Ģenerators', h1: 'Nejaušu Vārdu Ģenerators',
            meta_title: 'Nejaušu Vārdu Ģenerators | Ģenerējiet Nejaušus Angļu Vārdus',
            meta_description: 'Ģenerējiet noteiktu skaitu nejaušu angļu vārdu — noderīgi rakstīšanas uzdevumiem, vārdu spēlēm un iesildīšanās vingrinājumiem.',
            short_answer: 'Šis rīks ģenerē nejaušus vārdus, piemēram, pieprasot 5 vārdus var atgriezt "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Izvēlieties, cik nejaušu vārdu jums nepieciešams, un ģenerējiet tos uzreiz — noderīgi rakstīšanas uzdevumiem, prāta vētrai, vārdu asociāciju spēlēm un klases iesildīšanās vingrinājumiem.</p>',
            key_points: [
                '<b>Vienlaicīgi var ģenerēt līdz 20 vārdiem.</b>',
                '<b>Vārdi tiek ņemti no atlasīta krājuma</b> ar parastiem, ikdienas angļu valodas lietvārdiem — bez filtrēšanas pēc grūtības vai tēmas.',
                '<b>Katrs klikšķis dod jaunu komplektu</b> — vārdi tiek izvēlēti neatkarīgi katru reizi, kad aprēķināt, tāpēc atkārtojumi vienā komplektā ir iespējami.',
            ],
            howto: [
                { question: 'Vai viens vārds var parādīties divreiz vienā rezultātā?', answer: '<p>Jā — katrs vārds tiek izvēlēts neatkarīgi, tāpēc ar nelielu vārdu krājumu ir iespējams (kaut arī negarantēts), ka vārds atkārtojas vienā komplektā.</p>' },
                { question: 'Kam noder šie vārdi?', answer: '<p>Bieži izmantoti radošai rakstīšanai, spēlēm "aprakstiet šo vārdu", vārdu krājuma iesildīšanai un Pictionary stila ballīšu spēlēm.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.lv, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        pl: {
            slug: 'generator-losowych-slow', title: 'Generator Losowych Słów', h1: 'Generator Losowych Słów',
            meta_title: 'Generator Losowych Słów | Generuj Losowe Angielskie Słowa',
            meta_description: 'Wygeneruj określoną liczbę losowych angielskich słów — przydatne do zadań pisemnych, gier słownych i rozgrzewek.',
            short_answer: 'To narzędzie generuje losowe słowa, np. żądanie 5 słów może zwrócić "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Wybierz, ile losowych słów potrzebujesz, i wygeneruj je natychmiast — przydatne do zadań pisemnych, burzy mózgów, gier skojarzeniowych i rozgrzewek na zajęciach.</p>',
            key_points: [
                '<b>Można wygenerować do 20 słów</b> jednocześnie.',
                '<b>Słowa pochodzą z wyselekcjonowanego banku</b> popularnych, codziennych angielskich rzeczowników — bez filtrowania według trudności czy tematu.',
                '<b>Każde kliknięcie daje nowy zestaw</b> — słowa są wybierane niezależnie za każdym razem, więc powtórzenia w zestawie są możliwe.',
            ],
            howto: [
                { question: 'Czy to samo słowo może pojawić się dwukrotnie w jednym wyniku?', answer: '<p>Tak — każde słowo jest wybierane niezależnie, więc przy małym banku słów możliwe (choć niegwarantowane) jest powtórzenie w ramach jednego zestawu.</p>' },
                { question: 'Do czego przydatne są te słowa?', answer: '<p>Typowe zastosowania to zadania kreatywnego pisania, gry "opisz to słowo", rozgrzewki słownictwa i gry imprezowe w stylu Pictionary.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.pl, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        es: {
            slug: 'generador-de-palabras-aleatorias', title: 'Generador de Palabras Aleatorias', h1: 'Generador de Palabras Aleatorias',
            meta_title: 'Generador de Palabras Aleatorias | Genera Palabras Aleatorias en Inglés',
            meta_description: 'Genera un número determinado de palabras aleatorias en inglés — útil para ejercicios de escritura, juegos de palabras y calentamientos.',
            short_answer: 'Esta herramienta genera palabras aleatorias, p. ej. solicitar 5 palabras podría devolver "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Elige cuántas palabras aleatorias necesitas y genéralas al instante — útil para ejercicios de escritura, lluvia de ideas, juegos de asociación de palabras y calentamientos en clase.</p>',
            key_points: [
                '<b>Se pueden generar hasta 20 palabras</b> a la vez.',
                '<b>Las palabras provienen de un banco seleccionado</b> de sustantivos ingleses comunes y cotidianos — sin filtrar por dificultad o tema.',
                '<b>Cada clic da un conjunto nuevo</b> — las palabras se eligen independientemente cada vez, por lo que las repeticiones dentro de un conjunto son posibles.',
            ],
            howto: [
                { question: '¿Puede aparecer la misma palabra dos veces en un resultado?', answer: '<p>Sí — cada palabra se elige de forma independiente, así que con un banco de palabras pequeño es posible (aunque no garantizado) que una palabra se repita.</p>' },
                { question: '¿Para qué sirven estas palabras?', answer: '<p>Usos comunes incluyen ejercicios de escritura creativa, juegos de "describe esta palabra", calentamientos de vocabulario y juegos de fiesta tipo Pictionary.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.es, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        fr: {
            slug: 'generateur-de-mots-aleatoires', title: 'Générateur de Mots Aléatoires', h1: 'Générateur de Mots Aléatoires',
            meta_title: 'Générateur de Mots Aléatoires | Générez des Mots Anglais Aléatoires',
            meta_description: 'Générez un nombre défini de mots anglais aléatoires — utile pour les exercices d\'écriture, jeux de mots et échauffements.',
            short_answer: 'Cet outil génère des mots aléatoires, ex. demander 5 mots pourrait retourner "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Choisissez combien de mots aléatoires vous avez besoin et générez-les instantanément — utile pour les invites d\'écriture, le brainstorming, les jeux d\'association de mots et les échauffements en classe.</p>',
            key_points: [
                '<b>Jusqu\'à 20 mots</b> peuvent être générés à la fois.',
                '<b>Les mots proviennent d\'une banque sélectionnée</b> de noms anglais courants et quotidiens — non filtrés par difficulté ou thème.',
                '<b>Chaque clic donne un nouvel ensemble</b> — les mots sont choisis indépendamment à chaque calcul, donc des répétitions au sein d\'un ensemble sont possibles.',
            ],
            howto: [
                { question: 'Le même mot peut-il apparaître deux fois dans un résultat ?', answer: '<p>Oui — chaque mot est choisi indépendamment, donc avec une petite banque de mots, il est possible (bien que non garanti) qu\'un mot se répète.</p>' },
                { question: 'À quoi servent ces mots ?', answer: '<p>Les usages courants incluent les invites d\'écriture créative, les jeux "décris ce mot", les échauffements de vocabulaire et les jeux de soirée type Pictionary.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.fr, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        it: {
            slug: 'generatore-di-parole-casuali', title: 'Generatore di Parole Casuali', h1: 'Generatore di Parole Casuali',
            meta_title: 'Generatore di Parole Casuali | Genera Parole Inglesi Casuali',
            meta_description: 'Genera un numero prestabilito di parole inglesi casuali — utile per esercizi di scrittura, giochi di parole e riscaldamenti.',
            short_answer: 'Questo strumento genera parole casuali, es. richiedere 5 parole potrebbe restituire "river, eagle, echo, glacier, harbor".',
            intro_text: '<p>Scegli quante parole casuali ti servono e generale istantaneamente — utile per spunti di scrittura, brainstorming, giochi di associazione di parole e riscaldamenti in classe.</p>',
            key_points: [
                '<b>È possibile generare fino a 20 parole</b> alla volta.',
                '<b>Le parole provengono da un elenco selezionato</b> di sostantivi inglesi comuni e quotidiani — non filtrati per difficoltà o tema.',
                '<b>Ogni clic dà un nuovo set</b> — le parole vengono scelte indipendentemente ogni volta, quindi le ripetizioni all\'interno di un set sono possibili.',
            ],
            howto: [
                { question: 'La stessa parola può apparire due volte in un risultato?', answer: '<p>Sì — ogni parola viene scelta indipendentemente, quindi con un piccolo elenco di parole è possibile (anche se non garantito) che una parola si ripeta.</p>' },
                { question: 'A cosa servono queste parole?', answer: '<p>Usi comuni includono spunti di scrittura creativa, giochi "descrivi questa parola", riscaldamenti di vocabolario e giochi di società in stile Pictionary.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.it, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
        de: {
            slug: 'zufaelliger-wortgenerator', title: 'Zufälliger Wortgenerator', h1: 'Zufälliger Wortgenerator',
            meta_title: 'Zufälliger Wortgenerator | Generieren Sie Zufällige Englische Wörter',
            meta_description: 'Generieren Sie eine festgelegte Anzahl zufälliger englischer Wörter — nützlich für Schreibanregungen, Wortspiele und Aufwärmübungen.',
            short_answer: 'Dieses Tool generiert zufällige Wörter, z.B. könnte eine Anfrage von 5 Wörtern "river, eagle, echo, glacier, harbor" zurückgeben.',
            intro_text: '<p>Wählen Sie, wie viele zufällige Wörter Sie benötigen, und generieren Sie sie sofort — nützlich für Schreibanregungen, Brainstorming, Wortassoziationsspiele und Aufwärmübungen im Unterricht.</p>',
            key_points: [
                '<b>Bis zu 20 Wörter</b> können auf einmal generiert werden.',
                '<b>Wörter stammen aus einer kuratierten Sammlung</b> gängiger, alltäglicher englischer Substantive — nicht nach Schwierigkeit oder Thema gefiltert.',
                '<b>Jeder Klick liefert eine neue Auswahl</b> — Wörter werden bei jeder Berechnung unabhängig gewählt, sodass Wiederholungen innerhalb einer Auswahl möglich sind.',
            ],
            howto: [
                { question: 'Kann dasselbe Wort zweimal in einem Ergebnis erscheinen?', answer: '<p>Ja — jedes Wort wird unabhängig ausgewählt, sodass bei einer kleinen Wortsammlung eine Wiederholung innerhalb einer Auswahl möglich (wenn auch nicht garantiert) ist.</p>' },
                { question: 'Wofür sind diese Wörter nützlich?', answer: '<p>Übliche Verwendungen sind kreative Schreibanregungen, "Beschreibe dieses Wort"-Spiele, Vokabel-Aufwärmübungen und Pictionary-ähnliche Partyspiele.</p>' },
            ],
            inputs: [{ name: 'count', label: NUMBER_OF_WORDS_LABEL.de, type: 'number', min: 1, max: 20, placeholder: '5' }],
            outputs: [],
        },
    },
}

// ============================================================
// 1203: Text Reverser
// ============================================================
const REVERSE_MODE_LABEL: Record<string, string> = {
    en: 'Reverse By', ru: 'Обратить по', lv: 'Apgriezt Pēc', pl: 'Odwróć Według',
    es: 'Invertir Por', fr: 'Inverser Par', it: 'Inverti Per', de: 'Umkehren Nach',
}
const REVERSE_MODE_OPTIONS: Record<string, { value: string; label: string }[]> = {
    en: [{ value: 'characters', label: 'Characters' }, { value: 'words', label: 'Words' }, { value: 'lines', label: 'Lines' }],
    ru: [{ value: 'characters', label: 'Символы' }, { value: 'words', label: 'Слова' }, { value: 'lines', label: 'Строки' }],
    lv: [{ value: 'characters', label: 'Rakstzīmes' }, { value: 'words', label: 'Vārdi' }, { value: 'lines', label: 'Rindas' }],
    pl: [{ value: 'characters', label: 'Znaki' }, { value: 'words', label: 'Słowa' }, { value: 'lines', label: 'Linie' }],
    es: [{ value: 'characters', label: 'Caracteres' }, { value: 'words', label: 'Palabras' }, { value: 'lines', label: 'Líneas' }],
    fr: [{ value: 'characters', label: 'Caractères' }, { value: 'words', label: 'Mots' }, { value: 'lines', label: 'Lignes' }],
    it: [{ value: 'characters', label: 'Caratteri' }, { value: 'words', label: 'Parole' }, { value: 'lines', label: 'Righe' }],
    de: [{ value: 'characters', label: 'Zeichen' }, { value: 'words', label: 'Wörter' }, { value: 'lines', label: 'Zeilen' }],
}

const textReverserTool: ToolDef = {
    id: '1203',
    type: 'calculator',
    config_json: {
        inputs: [{ key: 'text', default: 'Hello World' }, { key: 'mode', default: 'characters' }],
        functions: { result: { type: 'function', functionName: 'textReverser', params: { text: 'text', mode: 'mode' } } },
        outputs: [],
    },
    locales: {
        en: {
            slug: 'text-reverser', title: 'Text Reverser', h1: 'Text Reverser',
            meta_title: 'Text Reverser | Reverse Text by Character, Word, or Line',
            meta_description: 'Instantly reverse any text by character, word order, or line order.',
            short_answer: 'This tool reverses text, e.g. "Hello World" reversed by character becomes "dlroW olleH".',
            intro_text: '<p>Paste any text and choose whether to reverse it character-by-character, word-by-word, or line-by-line — useful for word games, puzzles, and quick text tricks.</p>',
            key_points: [
                '<b>Characters:</b> reverses every individual character, e.g. "Hello" → "olleH".',
                '<b>Words:</b> keeps each word intact but reverses their order, e.g. "The quick fox" → "fox quick The".',
                '<b>Lines:</b> keeps each line intact but reverses the order of the lines.',
            ],
            howto: [
                { question: 'Why would I reverse text by character?', answer: '<p>Character reversal is a classic word game/puzzle trick — some words and phrases (palindromes) even read the same way, which this can help explore.</p>' },
                { question: 'Does reversing by word change the words themselves?', answer: '<p>No — each word stays exactly as typed; only the order in which the words appear is reversed.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.en, type: 'textarea', placeholder: 'Type or paste your text here...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.en, type: 'select', options: REVERSE_MODE_OPTIONS.en },
            ],
            outputs: [],
        },
        ru: {
            slug: 'obraschenie-teksta', title: 'Обращение текста', h1: 'Обращение текста',
            meta_title: 'Обращение текста | Обратите текст по символам, словам или строкам',
            meta_description: 'Мгновенно обратите любой текст по символам, порядку слов или порядку строк.',
            short_answer: 'Этот инструмент обращает текст, например "Hello World" по символам становится "dlroW olleH".',
            intro_text: '<p>Вставьте любой текст и выберите, обратить ли его по символам, по словам или по строкам — полезно для словесных игр, головоломок и быстрых текстовых трюков.</p>',
            key_points: [
                '<b>Символы:</b> обращает каждый отдельный символ, например "Hello" → "olleH".',
                '<b>Слова:</b> сохраняет каждое слово целым, но меняет их порядок, например "The quick fox" → "fox quick The".',
                '<b>Строки:</b> сохраняет каждую строку целой, но меняет порядок строк.',
            ],
            howto: [
                { question: 'Зачем обращать текст по символам?', answer: '<p>Обращение по символам — классический трюк словесных игр и головоломок — некоторые слова и фразы (палиндромы) даже читаются одинаково.</p>' },
                { question: 'Меняет ли обращение по словам сами слова?', answer: '<p>Нет — каждое слово остаётся точно таким, как введено; меняется только порядок, в котором слова появляются.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.ru, type: 'textarea', placeholder: 'Введите или вставьте текст сюда...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.ru, type: 'select', options: REVERSE_MODE_OPTIONS.ru },
            ],
            outputs: [],
        },
        lv: {
            slug: 'teksta-apgriezejs', title: 'Teksta Apgriezējs', h1: 'Teksta Apgriezējs',
            meta_title: 'Teksta Apgriezējs | Apgrieziet Tekstu pēc Rakstzīmes, Vārda vai Rindas',
            meta_description: 'Uzreiz apgrieziet jebkuru tekstu pēc rakstzīmēm, vārdu secības vai rindu secības.',
            short_answer: 'Šis rīks apgriež tekstu, piemēram, "Hello World" apgriezts pēc rakstzīmēm kļūst par "dlroW olleH".',
            intro_text: '<p>Ielīmējiet jebkuru tekstu un izvēlieties, vai apgriezt to pēc rakstzīmes, pēc vārda vai pēc rindas — noderīgi vārdu spēlēm, mīklām un ātriem teksta trikiem.</p>',
            key_points: [
                '<b>Rakstzīmes:</b> apgriež katru atsevišķu rakstzīmi, piem., "Hello" → "olleH".',
                '<b>Vārdi:</b> saglabā katru vārdu neskartu, bet apgriež to secību, piem., "The quick fox" → "fox quick The".',
                '<b>Rindas:</b> saglabā katru rindu neskartu, bet apgriež rindu secību.',
            ],
            howto: [
                { question: 'Kāpēc apgriezt tekstu pēc rakstzīmes?', answer: '<p>Rakstzīmju apgriešana ir klasisks vārdu spēles/mīklas triks — daži vārdi un frāzes (palindromi) pat lasās vienādi.</p>' },
                { question: 'Vai apgriešana pēc vārda maina pašus vārdus?', answer: '<p>Nē — katrs vārds paliek tieši tāds, kā ievadīts; mainās tikai secība, kādā vārdi parādās.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.lv, type: 'textarea', placeholder: 'Ierakstiet vai ielīmējiet tekstu šeit...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.lv, type: 'select', options: REVERSE_MODE_OPTIONS.lv },
            ],
            outputs: [],
        },
        pl: {
            slug: 'odwracacz-tekstu', title: 'Odwracacz Tekstu', h1: 'Odwracacz Tekstu',
            meta_title: 'Odwracacz Tekstu | Odwróć Tekst według Znaku, Słowa lub Linii',
            meta_description: 'Natychmiast odwróć dowolny tekst według znaków, kolejności słów lub kolejności linii.',
            short_answer: 'To narzędzie odwraca tekst, np. "Hello World" odwrócony według znaków staje się "dlroW olleH".',
            intro_text: '<p>Wklej dowolny tekst i wybierz, czy odwrócić go znak po znaku, słowo po słowie, czy linia po linii — przydatne do gier słownych, łamigłówek i szybkich sztuczek tekstowych.</p>',
            key_points: [
                '<b>Znaki:</b> odwraca każdy pojedynczy znak, np. "Hello" → "olleH".',
                '<b>Słowa:</b> zachowuje każde słowo nienaruszone, ale odwraca ich kolejność, np. "The quick fox" → "fox quick The".',
                '<b>Linie:</b> zachowuje każdą linię nienaruszoną, ale odwraca kolejność linii.',
            ],
            howto: [
                { question: 'Dlaczego miałbym odwracać tekst według znaków?', answer: '<p>Odwracanie znaków to klasyczna sztuczka gier słownych/łamigłówek — niektóre słowa i frazy (palindromy) czytają się tak samo.</p>' },
                { question: 'Czy odwracanie według słów zmienia same słowa?', answer: '<p>Nie — każde słowo pozostaje dokładnie takie, jak zostało wpisane; zmienia się tylko kolejność, w jakiej słowa się pojawiają.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.pl, type: 'textarea', placeholder: 'Wpisz lub wklej tutaj swój tekst...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.pl, type: 'select', options: REVERSE_MODE_OPTIONS.pl },
            ],
            outputs: [],
        },
        es: {
            slug: 'inversor-de-texto', title: 'Inversor de Texto', h1: 'Inversor de Texto',
            meta_title: 'Inversor de Texto | Invierte Texto por Carácter, Palabra o Línea',
            meta_description: 'Invierte instantáneamente cualquier texto por carácter, orden de palabras u orden de líneas.',
            short_answer: 'Esta herramienta invierte texto, p. ej. "Hello World" invertido por carácter se convierte en "dlroW olleH".',
            intro_text: '<p>Pega cualquier texto y elige si invertirlo carácter por carácter, palabra por palabra, o línea por línea — útil para juegos de palabras, acertijos y trucos rápidos de texto.</p>',
            key_points: [
                '<b>Caracteres:</b> invierte cada carácter individual, p. ej. "Hello" → "olleH".',
                '<b>Palabras:</b> mantiene cada palabra intacta pero invierte su orden, p. ej. "The quick fox" → "fox quick The".',
                '<b>Líneas:</b> mantiene cada línea intacta pero invierte el orden de las líneas.',
            ],
            howto: [
                { question: '¿Por qué invertiría texto por carácter?', answer: '<p>La inversión de caracteres es un truco clásico de juegos de palabras/acertijos — algunas palabras y frases (palíndromos) incluso se leen igual.</p>' },
                { question: '¿Invertir por palabra cambia las palabras en sí?', answer: '<p>No — cada palabra permanece exactamente como se escribió; solo se invierte el orden en que aparecen las palabras.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.es, type: 'textarea', placeholder: 'Escribe o pega tu texto aquí...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.es, type: 'select', options: REVERSE_MODE_OPTIONS.es },
            ],
            outputs: [],
        },
        fr: {
            slug: 'inverseur-de-texte', title: 'Inverseur de Texte', h1: 'Inverseur de Texte',
            meta_title: 'Inverseur de Texte | Inversez le Texte par Caractère, Mot ou Ligne',
            meta_description: 'Inversez instantanément n\'importe quel texte par caractère, ordre des mots ou ordre des lignes.',
            short_answer: 'Cet outil inverse le texte, ex. "Hello World" inversé par caractère devient "dlroW olleH".',
            intro_text: '<p>Collez n\'importe quel texte et choisissez de l\'inverser caractère par caractère, mot par mot, ou ligne par ligne — utile pour les jeux de mots, énigmes et astuces textuelles rapides.</p>',
            key_points: [
                '<b>Caractères :</b> inverse chaque caractère individuel, ex. "Hello" → "olleH".',
                '<b>Mots :</b> garde chaque mot intact mais inverse leur ordre, ex. "The quick fox" → "fox quick The".',
                '<b>Lignes :</b> garde chaque ligne intacte mais inverse l\'ordre des lignes.',
            ],
            howto: [
                { question: 'Pourquoi inverserais-je du texte par caractère ?', answer: '<p>L\'inversion de caractères est une astuce classique de jeux de mots/énigmes — certains mots et phrases (palindromes) se lisent même de la même façon.</p>' },
                { question: 'L\'inversion par mot change-t-elle les mots eux-mêmes ?', answer: '<p>Non — chaque mot reste exactement tel que tapé ; seul l\'ordre d\'apparition des mots est inversé.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.fr, type: 'textarea', placeholder: 'Tapez ou collez votre texte ici...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.fr, type: 'select', options: REVERSE_MODE_OPTIONS.fr },
            ],
            outputs: [],
        },
        it: {
            slug: 'inversore-di-testo', title: 'Inversore di Testo', h1: 'Inversore di Testo',
            meta_title: 'Inversore di Testo | Inverti il Testo per Carattere, Parola o Riga',
            meta_description: 'Inverti istantaneamente qualsiasi testo per carattere, ordine delle parole o ordine delle righe.',
            short_answer: 'Questo strumento inverte il testo, es. "Hello World" invertito per carattere diventa "dlroW olleH".',
            intro_text: '<p>Incolla qualsiasi testo e scegli se invertirlo carattere per carattere, parola per parola o riga per riga — utile per giochi di parole, enigmi e trucchi testuali rapidi.</p>',
            key_points: [
                '<b>Caratteri:</b> inverte ogni singolo carattere, es. "Hello" → "olleH".',
                '<b>Parole:</b> mantiene ogni parola intatta ma inverte il loro ordine, es. "The quick fox" → "fox quick The".',
                '<b>Righe:</b> mantiene ogni riga intatta ma inverte l\'ordine delle righe.',
            ],
            howto: [
                { question: 'Perché dovrei invertire il testo per carattere?', answer: '<p>L\'inversione dei caratteri è un classico trucco di giochi di parole/enigmi — alcune parole e frasi (palindromi) si leggono persino allo stesso modo.</p>' },
                { question: 'Invertire per parola cambia le parole stesse?', answer: '<p>No — ogni parola rimane esattamente come digitata; viene invertito solo l\'ordine in cui appaiono le parole.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.it, type: 'textarea', placeholder: 'Digita o incolla qui il tuo testo...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.it, type: 'select', options: REVERSE_MODE_OPTIONS.it },
            ],
            outputs: [],
        },
        de: {
            slug: 'text-umkehrer', title: 'Text-Umkehrer', h1: 'Text-Umkehrer',
            meta_title: 'Text-Umkehrer | Text nach Zeichen, Wort oder Zeile Umkehren',
            meta_description: 'Kehren Sie sofort beliebigen Text nach Zeichen, Wortreihenfolge oder Zeilenreihenfolge um.',
            short_answer: 'Dieses Tool kehrt Text um, z.B. wird "Hello World" nach Zeichen umgekehrt zu "dlroW olleH".',
            intro_text: '<p>Fügen Sie beliebigen Text ein und wählen Sie, ob er Zeichen für Zeichen, Wort für Wort oder Zeile für Zeile umgekehrt werden soll — nützlich für Wortspiele, Rätsel und schnelle Texttricks.</p>',
            key_points: [
                '<b>Zeichen:</b> kehrt jedes einzelne Zeichen um, z.B. "Hello" → "olleH".',
                '<b>Wörter:</b> hält jedes Wort intakt, kehrt aber ihre Reihenfolge um, z.B. "The quick fox" → "fox quick The".',
                '<b>Zeilen:</b> hält jede Zeile intakt, kehrt aber die Reihenfolge der Zeilen um.',
            ],
            howto: [
                { question: 'Warum sollte ich Text nach Zeichen umkehren?', answer: '<p>Die Zeichenumkehrung ist ein klassischer Wortspiel-/Rätseltrick — manche Wörter und Phrasen (Palindrome) lesen sich sogar gleich.</p>' },
                { question: 'Ändert die Umkehrung nach Wort die Wörter selbst?', answer: '<p>Nein — jedes Wort bleibt genau wie eingegeben; nur die Reihenfolge, in der die Wörter erscheinen, wird umgekehrt.</p>' },
            ],
            inputs: [
                { name: 'text', label: TEXT_TO_ANALYZE_LABEL.de, type: 'textarea', placeholder: 'Geben Sie hier Ihren Text ein oder fügen Sie ihn ein...' },
                { name: 'mode', label: REVERSE_MODE_LABEL.de, type: 'select', options: REVERSE_MODE_OPTIONS.de },
            ],
            outputs: [],
        },
    },
}

export const tools: ToolDef[] = [
    wordCharacterCounterTool, readingTimeCalculatorTool, randomNamePickerTool, keywordDensityAnalyzerTool,
    commonMisspellingsCheckerTool, anagramCheckerTool, palindromeCheckerTool, pigLatinTranslatorTool,
    acronymGeneratorTool, randomWordGeneratorTool, textReverserTool,
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
        where: { tool_id_category_id: { tool_id: def.id, category_id: WORD_TEXT_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: def.id, category_id: WORD_TEXT_CATEGORY_ID },
        })
    }
}

async function main() {
    for (const tool of tools) {
        await seedTool(tool)
    }
    console.log(`\n✅ Seeded ${tools.length} word & text tools across 8 locales`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
