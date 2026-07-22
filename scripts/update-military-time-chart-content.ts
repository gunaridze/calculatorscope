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

async function main() {
    const langs = ['en', 'ru', 'de', 'es', 'fr', 'it', 'pl', 'lv']

    for (const lang of langs) {
        const row = await prisma.toolI18n.findFirst({ where: { tool_id: TOOL_ID, lang } })
        if (!row) {
            console.log(`⚠️  No ToolI18n row for tool ${TOOL_ID} lang ${lang}, skipping`)
            continue
        }

        const title = CHART_TITLE[lang] || CHART_TITLE.en
        const contentBlocks = [
            { type: 'h2', content: title, id: 'military-time-chart' },
            { type: 'html', content: buildTableHtml(lang) },
        ]

        await prisma.toolI18n.update({
            where: { id: row.id },
            data: {
                // @ts-ignore - Prisma JSON field typing
                content_blocks_json: contentBlocks,
            },
        })
        console.log(`✅ Updated content_blocks_json for tool ${TOOL_ID} (${lang})`)
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
