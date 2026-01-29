import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8283226595:AAGMIlGb2uTA_6DYLNcR1Z4xIa9eYDvpPB0'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '531181152'
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, message } = body

        // Валидация
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Формируем сообщение для Telegram
        const text = `<b>Новая заявка с сайта</b>\n` +
            `<b>Имя:</b> ${escapeHtml(name)}\n` +
            `<b>Email:</b> ${escapeHtml(email)}\n` +
            `<b>Сообщение:</b> ${escapeHtml(message)}`

        // Отправляем в Telegram
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                parse_mode: 'HTML',
                text: text,
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Telegram API error:', errorData)
            return NextResponse.json(
                { error: 'Failed to send message' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending feedback:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Функция для экранирования HTML
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}
