// One-off script: adds a full 24-hour military-time <-> 12-hour regular-time
// reference table to tool_id 1111 (Military Time Chart) via content_blocks_json,
// across all 8 locales. Matches the reference-table pattern seen on competitor
// sites (e.g. CalculatorSoup) for this exact tool name/intent, which our
// original seed only covered with a single-value converter, not a lookup table.
// Run with: npx tsx scripts/update-military-time-chart-content.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TOOL_ID = '1111'

const MILITARY_HEADER: Record<string, string> = { en: 'Military Time', ru: 'Военное время', de: 'Militärzeit', es: 'Hora Militar', fr: 'Heure Militaire', it: 'Ora Militare', pl: 'Czas Wojskowy', lv: 'Karaspēka Laiks' }
const REGULAR_HEADER: Record<string, string> = { en: 'Regular Time', ru: 'Обычное время', de: 'Normale Zeit', es: 'Hora Normal', fr: 'Heure Normale', it: 'Ora Normale', pl: 'Czas Zwykły', lv: 'Parastais Laiks' }
const MIDNIGHT_LABEL: Record<string, string> = { en: '12 midnight', ru: '12 полночь', de: '12 Mitternacht', es: '12 medianoche', fr: '12 minuit', it: '12 mezzanotte', pl: '12 północ', lv: '12 pusnakts' }
const NOON_LABEL: Record<string, string> = { en: '12 noon', ru: '12 полдень', de: '12 Mittag', es: '12 mediodía', fr: '12 midi', it: '12 mezzogiorno', pl: '12 południe', lv: '12 pusdienlaiks' }
const CHART_TITLE: Record<string, string> = {
    en: 'Military Time Chart', ru: 'Таблица военного времени', de: 'Militärzeit-Tabelle', es: 'Tabla de Hora Militar',
    fr: 'Tableau d’Heure Militaire', it: 'Tabella Ora Militare', pl: 'Tabela Czasu Wojskowego', lv: 'Karaspēka Laika Tabula',
}

function formatRegular12h(h: number, m: number): string {
    const ampm = h < 12 ? 'am' : 'pm'
    let h12 = h % 12
    if (h12 === 0) h12 = 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}
function militaryCode(h: number, m: number): string {
    return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`
}

function buildTableHtml(lang: string): string {
    const milHeader = MILITARY_HEADER[lang] || MILITARY_HEADER.en
    const regHeader = REGULAR_HEADER[lang] || REGULAR_HEADER.en
    const midnight = MIDNIGHT_LABEL[lang] || MIDNIGHT_LABEL.en
    const noon = NOON_LABEL[lang] || NOON_LABEL.en
    const title = CHART_TITLE[lang] || CHART_TITLE.en

    const rows: string[] = []
    // 24 half-hour-aligned rows: left = 00:00-11:30 (AM), right = 12:00-23:30 (PM)
    for (let i = 0; i < 24; i++) {
        const leftH = Math.floor(i / 2)
        const leftM = i % 2 === 0 ? 0 : 30
        const rightH = leftH + 12
        const rightM = leftM

        const leftMil = militaryCode(leftH, leftM)
        const leftReg = i === 0 ? `${formatRegular12h(leftH, leftM)}<br>${midnight}` : formatRegular12h(leftH, leftM)
        const rightMil = militaryCode(rightH, rightM)
        const rightReg = formatRegular12h(rightH, rightM)

        rows.push(
            `<tr><td>${leftMil}</td><td>${leftReg}</td><td></td><td>${rightMil}</td><td>${rightReg}</td></tr>`
        )
    }
    // Final boundary row: 1200 (noon) vs 2400 (midnight at end of day)
    rows.push(
        `<tr><td>1200</td><td>${formatRegular12h(12, 0)}<br>${noon}</td><td></td><td>2400</td><td>${formatRegular12h(0, 0)}<br>${midnight}</td></tr>`
    )

    return `<div class="table-scroll"><table>
<thead>
<tr><th>${milHeader}</th><th>${regHeader}</th><th></th><th>${milHeader}</th><th>${regHeader}</th></tr>
</thead>
<tbody>
${rows.join('\n')}
</tbody>
</table></div>`
}

// ============================================================
// Military Minutes Chart (regular minutes 1-60 -> decimal/military minutes)
// ============================================================
const MINUTES_CHART_TITLE: Record<string, string> = {
    en: 'Military Minutes Chart', ru: 'Таблица военных минут', de: 'Militärminuten-Tabelle', es: 'Tabla de Minutos Militares',
    fr: 'Tableau des Minutes Militaires', it: 'Tabella dei Minuti Militari', pl: 'Tabela Minut Wojskowych', lv: 'Karaspēka Minūšu Tabula',
}
const REGULAR_MINUTES_HEADER: Record<string, string> = { en: 'Regular Minutes', ru: 'Обычные минуты', de: 'Normale Minuten', es: 'Minutos Normales', fr: 'Minutes Normales', it: 'Minuti Normali', pl: 'Zwykłe Minuty', lv: 'Parastās Minūtes' }
const MILITARY_MINUTES_HEADER: Record<string, string> = { en: 'Military Minutes', ru: 'Военные минуты', de: 'Militärminuten', es: 'Minutos Militares', fr: 'Minutes Militaires', it: 'Minuti Militari', pl: 'Minuty Wojskowe', lv: 'Karaspēka Minūtes' }
const MINUTES_CHART_INTRO: Record<string, string> = {
    en: 'Military (decimal) minutes are simply regular minutes divided by 60, rounded to 2 decimal places.',
    ru: 'Военные (десятичные) минуты — это обычные минуты, делённые на 60, округлённые до 2 знаков после запятой.',
    de: 'Militärische (dezimale) Minuten sind einfach normale Minuten geteilt durch 60, auf 2 Dezimalstellen gerundet.',
    es: 'Los minutos militares (decimales) son simplemente los minutos normales divididos entre 60, redondeados a 2 decimales.',
    fr: 'Les minutes militaires (décimales) sont simplement les minutes normales divisées par 60, arrondies à 2 décimales.',
    it: 'I minuti militari (decimali) sono semplicemente i minuti normali divisi per 60, arrotondati a 2 decimali.',
    pl: 'Minuty wojskowe (dziesiętne) to po prostu zwykłe minuty podzielone przez 60, zaokrąglone do 2 miejsc po przecinku.',
    lv: 'Karaspēka (decimālās) minūtes ir vienkārši parastās minūtes dalītas ar 60, noapaļotas līdz 2 zīmēm aiz komata.',
}

function buildMinutesChartHtml(lang: string): string {
    const regHeader = REGULAR_MINUTES_HEADER[lang] || REGULAR_MINUTES_HEADER.en
    const milHeader = MILITARY_MINUTES_HEADER[lang] || MILITARY_MINUTES_HEADER.en

    const cols = 4
    const rowsCount = 15 // 60 minutes / 4 columns
    const rows: string[] = []
    for (let r = 0; r < rowsCount; r++) {
        const cells: string[] = []
        for (let c = 0; c < cols; c++) {
            const minute = r + 1 + c * rowsCount
            const decimal = (minute / 60).toFixed(2)
            cells.push(`<td>${minute}</td><td>${decimal}</td>`, c < cols - 1 ? '<td></td>' : '')
        }
        rows.push(`<tr>${cells.join('')}</tr>`)
    }

    const headerCells: string[] = []
    for (let c = 0; c < cols; c++) {
        headerCells.push(`<th>${regHeader}</th><th>${milHeader}</th>`, c < cols - 1 ? '<th></th>' : '')
    }

    return `<div class="table-scroll"><table>
<thead>
<tr>${headerCells.join('')}</tr>
</thead>
<tbody>
${rows.join('\n')}
</tbody>
</table></div>`
}

// ============================================================
// Clock diagram (SVG): regular 12-hour time around the outside,
// military 24-hour time around the inside
// ============================================================
const CLOCK_TITLE: Record<string, string> = {
    en: 'Military Time Clock', ru: 'Циферблат военного времени', de: 'Militärzeit-Uhr', es: 'Reloj de Hora Militar',
    fr: 'Horloge d’Heure Militaire', it: 'Orologio dell’Ora Militare', pl: 'Zegar Czasu Wojskowego', lv: 'Karaspēka Laika Pulkstenis',
}
const CLOCK_CAPTION: Record<string, string> = {
    en: 'Regular time on the outside, military time on the inside.',
    ru: 'Обычное время снаружи, военное время внутри.',
    de: 'Normale Zeit außen, Militärzeit innen.',
    es: 'Hora normal por fuera, hora militar por dentro.',
    fr: 'Heure normale à l’extérieur, heure militaire à l’intérieur.',
    it: 'Ora normale all’esterno, ora militare all’interno.',
    pl: 'Czas zwykły na zewnątrz, czas wojskowy wewnątrz.',
    lv: 'Parastais laiks ārpusē, karaspēka laiks iekšpusē.',
}

function buildClockSvg(lang: string): string {
    const milLabel = MILITARY_HEADER[lang] || MILITARY_HEADER.en
    const regLabel = REGULAR_HEADER[lang] || REGULAR_HEADER.en
    const caption = CLOCK_CAPTION[lang] || CLOCK_CAPTION.en

    const cx = 260
    const cy = 260
    const outerLabelR = 210 // regular time (AM, bold)
    const outerPmLabelR = 227 // regular time (PM, dim, below AM)
    const innerLabelR = 141 // military time AM
    const innerPmLabelR = 158 // military time PM (dim, below)
    const circleR = 170

    const outerTexts: string[] = []
    const innerTexts: string[] = []
    for (let h = 0; h < 12; h++) {
        // 0 = 12 o'clock position (top), going clockwise
        const angleDeg = h * 30 - 90
        const angleRad = (angleDeg * Math.PI) / 180
        const cos = Math.cos(angleRad)
        const sin = Math.sin(angleRad)

        const amHour = h === 0 ? 12 : h
        const pmHour = h === 0 ? 12 : h
        const militaryAm = `${String(h).padStart(2, '0')}00`
        const militaryPm = `${String(h + 12).padStart(2, '0')}00`

        const ox = (cx + outerLabelR * cos).toFixed(1)
        const oy = (cy + outerLabelR * sin).toFixed(1)
        const opx = (cx + outerPmLabelR * cos).toFixed(1)
        const opy = (cy + outerPmLabelR * sin).toFixed(1)
        const ix = (cx + innerLabelR * cos).toFixed(1)
        const iy = (cy + innerLabelR * sin).toFixed(1)
        const ipx = (cx + innerPmLabelR * cos).toFixed(1)
        const ipy = (cy + innerPmLabelR * sin).toFixed(1)

        outerTexts.push(`<text x="${ox}" y="${oy}" text-anchor="middle" font-size="18" font-weight="bold" fill="#1f2937">${amHour} AM</text>`)
        outerTexts.push(`<text x="${opx}" y="${opy}" text-anchor="middle" font-size="13" fill="#9ca3af">(${pmHour} PM)</text>`)
        innerTexts.push(`<text x="${ix}" y="${iy}" text-anchor="middle" font-size="17" font-weight="bold" fill="#b64b39">${militaryAm}</text>`)
        innerTexts.push(`<text x="${ipx}" y="${ipy}" text-anchor="middle" font-size="12" fill="#9ca3af">(${militaryPm})</text>`)
    }

    return `<figure style="text-align:center">
<svg viewBox="0 0 520 520" style="width:100%;max-width:480px;height:auto" role="img" aria-label="${milLabel} / ${regLabel}">
<rect width="520" height="520" fill="#f8f9fa"></rect>
<circle cx="${cx}" cy="${cy}" r="${circleR}" fill="#f0f0f0" stroke="#333" stroke-width="2"></circle>
<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">${milLabel.toUpperCase()}</text>
<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">${regLabel.toUpperCase()}</text>
${outerTexts.join('\n')}
${innerTexts.join('\n')}
</svg>
<figcaption style="font-size:0.85em;color:#6b7280;margin-top:0.5em">${caption}</figcaption>
</figure>`
}

// ============================================================
// FAQ content (faq_json)
// ============================================================
type FaqItem = { question: Record<string, string>; answer: Record<string, string> }

const FAQ_ITEMS: FaqItem[] = [
    {
        question: {
            en: 'Why doesn’t military time use a colon?',
            ru: 'Почему в военном времени нет двоеточия?',
            de: 'Warum verwendet die Militärzeit keinen Doppelpunkt?',
            es: '¿Por qué la hora militar no usa dos puntos?',
            fr: 'Pourquoi l’heure militaire n’utilise-t-elle pas de deux-points ?',
            it: 'Perché l’ora militare non usa i due punti?',
            pl: 'Dlaczego czas wojskowy nie używa dwukropka?',
            lv: 'Kāpēc karaspēka laikā netiek lietots kols?',
        },
        answer: {
            en: '<p>Writing it as four plain digits (1430, not 14:30) is faster to write and read at a glance, and avoids any ambiguity in written or radio communication.</p>',
            ru: '<p>Запись в виде четырёх обычных цифр (1430, а не 14:30) быстрее пишется и читается с первого взгляда, а также исключает двусмысленность в письменной или радиосвязи.</p>',
            de: '<p>Die Schreibweise als vier einfache Ziffern (1430, nicht 14:30) lässt sich schneller schreiben und auf einen Blick lesen und vermeidet jede Mehrdeutigkeit in schriftlicher oder Funkkommunikation.</p>',
            es: '<p>Escribirlo como cuatro dígitos simples (1430, no 14:30) es más rápido de escribir y leer de un vistazo, y evita cualquier ambigüedad en la comunicación escrita o por radio.</p>',
            fr: '<p>L’écrire sous forme de quatre chiffres simples (1430, et non 14:30) est plus rapide à écrire et à lire d’un coup d’œil, et évite toute ambiguïté dans la communication écrite ou radio.</p>',
            it: '<p>Scriverlo come quattro semplici cifre (1430, non 14:30) è più veloce da scrivere e leggere a colpo d’occhio, ed evita ogni ambiguità nella comunicazione scritta o radio.</p>',
            pl: '<p>Zapis jako cztery zwykłe cyfry (1430, nie 14:30) jest szybszy do napisania i odczytania na pierwszy rzut oka oraz eliminuje wszelkie niejednoznaczności w komunikacji pisemnej lub radiowej.</p>',
            lv: '<p>Pieraksts kā četri vienkārši cipari (1430, nevis 14:30) ir ātrāk uzrakstāms un uztverams no pirmā acu uzmetiena, un novērš jebkādu neskaidrību rakstiskā vai radio saziņā.</p>',
        },
    },
    {
        question: {
            en: 'What’s the difference between military time and 24-hour time?',
            ru: 'В чём разница между военным временем и 24-часовым форматом?',
            de: 'Was ist der Unterschied zwischen Militärzeit und dem 24-Stunden-Format?',
            es: '¿Cuál es la diferencia entre la hora militar y el formato de 24 horas?',
            fr: 'Quelle est la différence entre l’heure militaire et le format 24 heures ?',
            it: 'Qual è la differenza tra l’ora militare e il formato a 24 ore?',
            pl: 'Jaka jest różnica między czasem wojskowym a formatem 24-godzinnym?',
            lv: 'Kāda ir atšķirība starp karaspēka laiku un 24 stundu formātu?',
        },
        answer: {
            en: '<p>Both cover the same 0000-2359 range, but civilian 24-hour time keeps the colon (14:30) while military time drops it (1430) and is typically read aloud digit by digit.</p>',
            ru: '<p>Оба формата охватывают один и тот же диапазон 0000-2359, но гражданский 24-часовой формат сохраняет двоеточие (14:30), а военное время его опускает (1430) и обычно произносится по цифрам.</p>',
            de: '<p>Beide decken denselben Bereich 0000-2359 ab, aber das zivile 24-Stunden-Format behält den Doppelpunkt (14:30), während die Militärzeit ihn weglässt (1430) und typischerweise Ziffer für Ziffer vorgelesen wird.</p>',
            es: '<p>Ambos cubren el mismo rango 0000-2359, pero el formato civil de 24 horas mantiene los dos puntos (14:30) mientras que la hora militar los omite (1430) y suele leerse dígito por dígito.</p>',
            fr: '<p>Les deux couvrent la même plage 0000-2359, mais le format civil 24 heures conserve les deux-points (14:30) tandis que l’heure militaire les omet (1430) et se lit généralement chiffre par chiffre.</p>',
            it: '<p>Entrambi coprono lo stesso intervallo 0000-2359, ma il formato civile a 24 ore mantiene i due punti (14:30) mentre l’ora militare li omette (1430) e viene tipicamente letta cifra per cifra.</p>',
            pl: '<p>Oba obejmują ten sam zakres 0000-2359, ale cywilny format 24-godzinny zachowuje dwukropek (14:30), podczas gdy czas wojskowy go pomija (1430) i zwykle jest odczytywany cyfra po cyfrze.</p>',
            lv: '<p>Abi aptver to pašu diapazonu 0000-2359, taču civilais 24 stundu formāts saglabā kolu (14:30), bet karaspēka laikā tas tiek izlaists (1430), un to parasti izrunā cipariem pa vienam.</p>',
        },
    },
    {
        question: {
            en: 'How do I say military time out loud?',
            ru: 'Как произносить военное время вслух?',
            de: 'Wie spricht man die Militärzeit laut aus?',
            es: '¿Cómo se dice la hora militar en voz alta?',
            fr: 'Comment prononce-t-on l’heure militaire à voix haute ?',
            it: 'Come si pronuncia l’ora militare ad alta voce?',
            pl: 'Jak wymawia się czas wojskowy na głos?',
            lv: 'Kā izrunāt karaspēka laiku skaļi?',
        },
        answer: {
            en: '<p>Common examples: 0000 = "zero hundred hours" (midnight), 0700 = "zero seven hundred", 0915 = "zero nine fifteen", 1200 = "twelve hundred" (noon), 1430 = "fourteen thirty", 2359 = "twenty-three fifty-nine". A time like 1000 is read as "ten hundred", never "one thousand".</p>',
            ru: '<p>Примеры: 0000 = «ноль часов» (полночь), 0700 = «семь ноль-ноль», 0915 = «девять пятнадцать», 1200 = «двенадцать ноль-ноль» (полдень), 1430 = «четырнадцать тридцать», 2359 = «двадцать три пятьдесят девять».</p>',
            de: '<p>Beispiele: 0000 = „null Uhr“ (Mitternacht), 0700 = „sieben Uhr“, 0915 = „neun Uhr fünfzehn“, 1200 = „zwölf Uhr“ (Mittag), 1430 = „vierzehn Uhr dreißig“, 2359 = „dreiundzwanzig Uhr neunundfünfzig“.</p>',
            es: '<p>Ejemplos: 0000 = "cero horas" (medianoche), 0700 = "siete horas", 0915 = "nueve quince", 1200 = "doce horas" (mediodía), 1430 = "catorce treinta", 2359 = "veintitrés cincuenta y nueve".</p>',
            fr: '<p>Exemples : 0000 = « zéro heure » (minuit), 0700 = « sept heures », 0915 = « neuf heures quinze », 1200 = « douze heures » (midi), 1430 = « quatorze heures trente », 2359 = « vingt-trois heures cinquante-neuf ».</p>',
            it: '<p>Esempi: 0000 = "zero ore" (mezzanotte), 0700 = "sette ore", 0915 = "nove e quindici", 1200 = "dodici ore" (mezzogiorno), 1430 = "quattordici e trenta", 2359 = "ventitré e cinquantanove".</p>',
            pl: '<p>Przykłady: 0000 = "zero zero zero zero" (północ), 0700 = "siódma zero zero", 0915 = "dziewiąta piętnaście", 1200 = "dwunasta zero zero" (południe), 1430 = "czternasta trzydzieści", 2359 = "dwudziesta trzecia pięćdziesiąt dziewięć".</p>',
            lv: '<p>Piemēri: 0000 = "nulle nulle" (pusnakts), 0700 = "septiņi nulle nulle", 0915 = "deviņi piecpadsmit", 1200 = "divpadsmit nulle nulle" (pusdienlaiks), 1430 = "četrpadsmit trīsdesmit", 2359 = "divdesmit trīs piecdesmit deviņi".</p>',
        },
    },
    {
        question: {
            en: 'Is midnight 0000 or 2400?',
            ru: 'Полночь — это 0000 или 2400?',
            de: 'Ist Mitternacht 0000 oder 2400?',
            es: '¿La medianoche es 0000 o 2400?',
            fr: 'Minuit est-il 0000 ou 2400 ?',
            it: 'La mezzanotte è 0000 o 2400?',
            pl: 'Czy północ to 0000 czy 2400?',
            lv: 'Vai pusnakts ir 0000 vai 2400?',
        },
        answer: {
            en: '<p>0000 marks the start of a new day (standard usage). 2400 is sometimes used to mark the very end of the day just finishing, but 0000 is the correct start-of-day convention.</p>',
            ru: '<p>0000 обозначает начало нового дня (стандартное использование). 2400 иногда используется для обозначения самого конца завершающегося дня, но правильным началом дня считается 0000.</p>',
            de: '<p>0000 markiert den Beginn eines neuen Tages (Standardgebrauch). 2400 wird manchmal verwendet, um das ganz Ende des gerade endenden Tages zu kennzeichnen, aber 0000 ist die korrekte Konvention für den Tagesbeginn.</p>',
            es: '<p>0000 marca el inicio de un nuevo día (uso estándar). 2400 se usa a veces para marcar el final del día que termina, pero 0000 es la convención correcta para el inicio del día.</p>',
            fr: '<p>0000 marque le début d’un nouveau jour (usage standard). 2400 est parfois utilisé pour marquer la toute fin du jour qui se termine, mais 0000 est la convention correcte pour le début de journée.</p>',
            it: '<p>0000 segna l’inizio di un nuovo giorno (uso standard). 2400 è talvolta usato per indicare la fine esatta del giorno che si sta concludendo, ma 0000 è la convenzione corretta per l’inizio giornata.</p>',
            pl: '<p>0000 oznacza początek nowego dnia (standardowe użycie). 2400 jest czasem używane do oznaczenia samego końca kończącego się dnia, ale 0000 to poprawna konwencja początku dnia.</p>',
            lv: '<p>0000 apzīmē jaunas dienas sākumu (standarta lietojums). 2400 dažreiz izmanto, lai apzīmētu tikko beigušās dienas pašas beigas, taču 0000 ir pareizā dienas sākuma konvencija.</p>',
        },
    },
    {
        question: {
            en: 'How are seconds written in military time?',
            ru: 'Как записываются секунды в военном времени?',
            de: 'Wie werden Sekunden in der Militärzeit geschrieben?',
            es: '¿Cómo se escriben los segundos en la hora militar?',
            fr: 'Comment les secondes s’écrivent-elles en heure militaire ?',
            it: 'Come si scrivono i secondi nell’ora militare?',
            pl: 'Jak zapisuje się sekundy w czasie wojskowym?',
            lv: 'Kā karaspēka laikā tiek rakstītas sekundes?',
        },
        answer: {
            en: '<p>Seconds are simply appended after the minutes: 143052 means 14 hours, 30 minutes, 52 seconds (2:30:52 PM in regular time).</p>',
            ru: '<p>Секунды просто добавляются после минут: 143052 означает 14 часов 30 минут 52 секунды (14:30:52).</p>',
            de: '<p>Sekunden werden einfach nach den Minuten angehängt: 143052 bedeutet 14 Stunden, 30 Minuten, 52 Sekunden (14:30:52).</p>',
            es: '<p>Los segundos simplemente se añaden después de los minutos: 143052 significa 14 horas, 30 minutos, 52 segundos (2:30:52 PM en hora normal).</p>',
            fr: '<p>Les secondes sont simplement ajoutées après les minutes : 143052 signifie 14 heures, 30 minutes, 52 secondes (14 h 30 min 52 s).</p>',
            it: '<p>I secondi vengono semplicemente aggiunti dopo i minuti: 143052 significa 14 ore, 30 minuti, 52 secondi (14:30:52).</p>',
            pl: '<p>Sekundy są po prostu dodawane po minutach: 143052 oznacza 14 godzin, 30 minut, 52 sekundy (14:30:52).</p>',
            lv: '<p>Sekundes vienkārši tiek pievienotas aiz minūtēm: 143052 nozīmē 14 stundas, 30 minūtes, 52 sekundes (14:30:52).</p>',
        },
    },
    {
        question: {
            en: 'Do I always need to write all four digits?',
            ru: 'Нужно ли всегда писать все четыре цифры?',
            de: 'Muss ich immer alle vier Ziffern schreiben?',
            es: '¿Siempre debo escribir los cuatro dígitos?',
            fr: 'Dois-je toujours écrire les quatre chiffres ?',
            it: 'Devo sempre scrivere tutte e quattro le cifre?',
            pl: 'Czy zawsze muszę pisać wszystkie cztery cyfry?',
            lv: 'Vai man vienmēr jāraksta visi četri cipari?',
        },
        answer: {
            en: '<p>Yes — military time always uses four digits, with leading zeros for times before 1000. Write 0800, not 800.</p>',
            ru: '<p>Да — военное время всегда состоит из четырёх цифр, с ведущими нулями для времени до 1000. Пишите 0800, а не 800.</p>',
            de: '<p>Ja — die Militärzeit verwendet immer vier Ziffern, mit führenden Nullen für Zeiten vor 1000. Schreiben Sie 0800, nicht 800.</p>',
            es: '<p>Sí — la hora militar siempre usa cuatro dígitos, con ceros a la izquierda para horas anteriores a las 1000. Escribe 0800, no 800.</p>',
            fr: '<p>Oui — l’heure militaire utilise toujours quatre chiffres, avec des zéros au début pour les heures avant 1000. Écrivez 0800, pas 800.</p>',
            it: '<p>Sì — l’ora militare usa sempre quattro cifre, con zeri iniziali per gli orari prima delle 1000. Scrivi 0800, non 800.</p>',
            pl: '<p>Tak — czas wojskowy zawsze używa czterech cyfr, z zerami wiodącymi dla godzin przed 1000. Pisz 0800, nie 800.</p>',
            lv: '<p>Jā — karaspēka laikā vienmēr izmanto četrus ciparus, ar nullēm priekšā laikiem pirms 1000. Rakstiet 0800, nevis 800.</p>',
        },
    },
    {
        question: {
            en: 'What’s a quick way to convert military time to PM hours?',
            ru: 'Как быстро перевести военное время в часы PM?',
            de: 'Wie kann ich Militärzeit schnell in PM-Stunden umrechnen?',
            es: '¿Cuál es una forma rápida de convertir la hora militar a horas PM?',
            fr: 'Quelle est une façon rapide de convertir l’heure militaire en heures PM ?',
            it: 'Qual è un modo rapido per convertire l’ora militare in ore PM?',
            pl: 'Jaki jest szybki sposób na przeliczenie czasu wojskowego na godziny PM?',
            lv: 'Kāds ir ātrs veids, kā pārvērst karaspēka laiku PM stundās?',
        },
        answer: {
            en: '<p>For any time above 1259, subtract 1200 and add "PM": 1325 - 1200 = 1:25 PM, and 1900 - 1200 = 7:00 PM. Our {{LINK}} does this automatically.</p>',
            ru: '<p>Для любого времени выше 1259 вычтите 1200 и добавьте «PM»: 1325 - 1200 = 1:25 PM, а 1900 - 1200 = 7:00 PM. Наш {{LINK}} делает это автоматически.</p>',
            de: '<p>Für jede Zeit über 1259 ziehen Sie 1200 ab und fügen "PM" hinzu: 1325 - 1200 = 1:25 PM, und 1900 - 1200 = 7:00 PM. Unser {{LINK}} erledigt dies automatisch.</p>',
            es: '<p>Para cualquier hora superior a 1259, resta 1200 y añade "PM": 1325 - 1200 = 1:25 PM, y 1900 - 1200 = 7:00 PM. Nuestro {{LINK}} lo hace automáticamente.</p>',
            fr: '<p>Pour toute heure supérieure à 1259, soustrayez 1200 et ajoutez "PM" : 1325 - 1200 = 1:25 PM, et 1900 - 1200 = 7:00 PM. Notre {{LINK}} le fait automatiquement.</p>',
            it: '<p>Per qualsiasi orario superiore a 1259, sottrai 1200 e aggiungi "PM": 1325 - 1200 = 1:25 PM, e 1900 - 1200 = 7:00 PM. Il nostro {{LINK}} lo fa automaticamente.</p>',
            pl: '<p>Dla dowolnej godziny powyżej 1259 odejmij 1200 i dodaj "PM": 1325 - 1200 = 1:25 PM, a 1900 - 1200 = 7:00 PM. Nasz {{LINK}} robi to automatycznie.</p>',
            lv: '<p>Jebkuram laikam virs 1259 atņemiet 1200 un pievienojiet "PM": 1325 - 1200 = 1:25 PM, un 1900 - 1200 = 7:00 PM. Mūsu {{LINK}} to dara automātiski.</p>',
        },
    },
    {
        question: {
            en: 'Is military time used the same way internationally?',
            ru: 'Используется ли военное время одинаково во всём мире?',
            de: 'Wird die Militärzeit weltweit gleich verwendet?',
            es: '¿La hora militar se usa igual en todo el mundo?',
            fr: 'L’heure militaire est-elle utilisée de la même façon partout dans le monde ?',
            it: 'L’ora militare viene usata allo stesso modo a livello internazionale?',
            pl: 'Czy czas wojskowy jest używany tak samo na całym świecie?',
            lv: 'Vai karaspēka laiks tiek lietots vienādi visā pasaulē?',
        },
        answer: {
            en: '<p>The underlying 24-hour system is the international standard used by most countries in everyday civilian life. The specific "military time" naming and no-colon convention is most associated with US military, aviation, and emergency-services usage.</p>',
            ru: '<p>Базовая 24-часовая система является международным стандартом, используемым в повседневной гражданской жизни большинства стран. Конкретное название «военное время» и отсутствие двоеточия чаще всего связаны с использованием в армии США, авиации и экстренных службах.</p>',
            de: '<p>Das zugrunde liegende 24-Stunden-System ist der internationale Standard, der im Alltag der meisten Länder verwendet wird. Die spezifische Bezeichnung „Militärzeit“ und die Konvention ohne Doppelpunkt sind am ehesten mit dem US-Militär, der Luftfahrt und Rettungsdiensten verbunden.</p>',
            es: '<p>El sistema de 24 horas subyacente es el estándar internacional utilizado en la vida civil cotidiana de la mayoría de los países. El nombre específico "hora militar" y la convención sin dos puntos se asocian principalmente con el uso militar, de aviación y servicios de emergencia de EE. UU.</p>',
            fr: '<p>Le système sous-jacent de 24 heures est la norme internationale utilisée dans la vie civile quotidienne de la plupart des pays. Le nom spécifique « heure militaire » et la convention sans deux-points sont surtout associés à l’usage militaire, aéronautique et des services d’urgence aux États-Unis.</p>',
            it: '<p>Il sistema sottostante a 24 ore è lo standard internazionale usato nella vita civile quotidiana della maggior parte dei paesi. Il nome specifico "ora militare" e la convenzione senza due punti sono più associati all’uso militare, aeronautico e dei servizi di emergenza statunitensi.</p>',
            pl: '<p>Podstawowy system 24-godzinny jest międzynarodowym standardem używanym w codziennym życiu cywilnym większości krajów. Konkretna nazwa "czas wojskowy" i konwencja bez dwukropka są najbardziej kojarzone z użyciem w wojsku USA, lotnictwie i służbach ratunkowych.</p>',
            lv: '<p>Pamatā esošā 24 stundu sistēma ir starptautiskais standarts, ko lielākā daļa valstu izmanto ikdienas civilajā dzīvē. Konkrētais nosaukums "karaspēka laiks" un pieraksts bez kola visbiežāk tiek saistīts ar ASV militāro, aviācijas un ārkārtas dienestu lietojumu.</p>',
        },
    },
]

// Localized path + link text to the sibling "Military Time Converter" tool (1110),
// referenced from the FAQ answer above.
const CONVERTER_CATEGORY_SLUG: Record<string, string> = { en: 'time-speed', ru: 'vremya-skorost', de: 'zeit-geschwindigkeit', es: 'tiempo-velocidad', fr: 'temps-vitesse', it: 'tempo-velocita', pl: 'czas-predkosc', lv: 'laiks-atrums' }
const CONVERTER_TOOL_SLUG: Record<string, string> = { en: 'military-time-converter', ru: 'konverter-voennogo-vremeni', de: 'militaerzeit-umrechner', es: 'convertidor-de-hora-militar', fr: 'convertisseur-heure-militaire', it: 'convertitore-ora-militare', pl: 'konwerter-czasu-wojskowego', lv: 'karaspeka-laika-konvertetajs' }
const CONVERTER_LINK_TEXT: Record<string, string> = {
    en: 'Military Time Converter', ru: 'Конвертер военного времени', de: 'Militärzeit-Umrechner', es: 'Convertidor de Hora Militar',
    fr: 'Convertisseur d’Heure Militaire', it: 'Convertitore Ora Militare', pl: 'Konwerter Czasu Wojskowego', lv: 'Karaspēka Laika Konvertētājs',
}

function buildFaqJson(lang: string): Array<{ question: string; answer: string }> {
    const categorySlug = CONVERTER_CATEGORY_SLUG[lang] || CONVERTER_CATEGORY_SLUG.en
    const toolSlug = CONVERTER_TOOL_SLUG[lang] || CONVERTER_TOOL_SLUG.en
    const linkHtml = `<a href="/${lang}/${categorySlug}/${toolSlug}">${CONVERTER_LINK_TEXT[lang] || CONVERTER_LINK_TEXT.en}</a>`

    return FAQ_ITEMS.map((item) => ({
        question: item.question[lang] || item.question.en,
        answer: (item.answer[lang] || item.answer.en).replace('{{LINK}}', linkHtml),
    }))
}

async function main() {
    const langs = ['en', 'ru', 'de', 'es', 'fr', 'it', 'pl', 'lv']

    for (const lang of langs) {
        const row = await prisma.toolI18n.findFirst({ where: { tool_id: TOOL_ID, lang } })
        if (!row) {
            console.log(`⚠️  No ToolI18n row for tool ${TOOL_ID} lang ${lang}, skipping`)
            continue
        }

        const title = CHART_TITLE[lang] || CHART_TITLE.en
        const minutesTitle = MINUTES_CHART_TITLE[lang] || MINUTES_CHART_TITLE.en
        const minutesIntro = MINUTES_CHART_INTRO[lang] || MINUTES_CHART_INTRO.en
        const clockTitle = CLOCK_TITLE[lang] || CLOCK_TITLE.en

        const contentBlocks = [
            { type: 'h2', content: title, id: 'military-time-chart' },
            { type: 'html', content: buildTableHtml(lang) },
            { type: 'h2', content: clockTitle, id: 'military-time-clock' },
            { type: 'html', content: buildClockSvg(lang) },
            { type: 'h2', content: minutesTitle, id: 'military-minutes-chart' },
            { type: 'paragraph', content: minutesIntro },
            { type: 'html', content: buildMinutesChartHtml(lang) },
        ]

        await prisma.toolI18n.update({
            where: { id: row.id },
            data: {
                // @ts-ignore - Prisma JSON field typing
                content_blocks_json: contentBlocks,
                // @ts-ignore
                faq_json: buildFaqJson(lang),
            },
        })
        console.log(`✅ Updated content_blocks_json + faq_json for tool ${TOOL_ID} (${lang})`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
