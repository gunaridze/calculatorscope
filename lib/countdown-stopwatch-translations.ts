// UI strings for the bespoke live-ticking Countdown Timer and Stopwatch widgets

export const countdownTranslations: Record<string, {
    eventNameLabel: string
    eventNamePlaceholder: string
    dateLabel: string
    hourLabel: string
    minuteLabel: string
    days: string
    hours: string
    minutes: string
    seconds: string
    eventPassed: string
}> = {
    en: { eventNameLabel: 'Event Name (optional)', eventNamePlaceholder: 'e.g. Product Launch', dateLabel: 'Target Date', hourLabel: 'Hour (0-23)', minuteLabel: 'Minute', days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', eventPassed: 'This event has passed' },
    ru: { eventNameLabel: 'Название события (необязательно)', eventNamePlaceholder: 'например, запуск продукта', dateLabel: 'Целевая дата', hourLabel: 'Час (0-23)', minuteLabel: 'Минута', days: 'Дней', hours: 'Часов', minutes: 'Минут', seconds: 'Секунд', eventPassed: 'Это событие уже прошло' },
    lv: { eventNameLabel: 'Notikuma nosaukums (nav obligāts)', eventNamePlaceholder: 'piem., produkta laidiens', dateLabel: 'Mērķa datums', hourLabel: 'Stunda (0-23)', minuteLabel: 'Minūte', days: 'Dienas', hours: 'Stundas', minutes: 'Minūtes', seconds: 'Sekundes', eventPassed: 'Šis notikums jau ir pagājis' },
    pl: { eventNameLabel: 'Nazwa wydarzenia (opcjonalnie)', eventNamePlaceholder: 'np. premiera produktu', dateLabel: 'Data docelowa', hourLabel: 'Godzina (0-23)', minuteLabel: 'Minuta', days: 'Dni', hours: 'Godziny', minutes: 'Minuty', seconds: 'Sekundy', eventPassed: 'To wydarzenie już minęło' },
    es: { eventNameLabel: 'Nombre del Evento (opcional)', eventNamePlaceholder: 'p. ej. lanzamiento de producto', dateLabel: 'Fecha Objetivo', hourLabel: 'Hora (0-23)', minuteLabel: 'Minuto', days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos', eventPassed: 'Este evento ya ha pasado' },
    fr: { eventNameLabel: 'Nom de l’Événement (facultatif)', eventNamePlaceholder: 'ex. lancement de produit', dateLabel: 'Date Cible', hourLabel: 'Heure (0-23)', minuteLabel: 'Minute', days: 'Jours', hours: 'Heures', minutes: 'Minutes', seconds: 'Secondes', eventPassed: 'Cet événement est déjà passé' },
    it: { eventNameLabel: 'Nome Evento (opzionale)', eventNamePlaceholder: 'es. lancio prodotto', dateLabel: 'Data Obiettivo', hourLabel: 'Ora (0-23)', minuteLabel: 'Minuto', days: 'Giorni', hours: 'Ore', minutes: 'Minuti', seconds: 'Secondi', eventPassed: 'Questo evento è già passato' },
    de: { eventNameLabel: 'Ereignisname (optional)', eventNamePlaceholder: 'z. B. Produktstart', dateLabel: 'Zieldatum', hourLabel: 'Stunde (0-23)', minuteLabel: 'Minute', days: 'Tage', hours: 'Stunden', minutes: 'Minuten', seconds: 'Sekunden', eventPassed: 'Dieses Ereignis liegt bereits in der Vergangenheit' },
}

export const stopwatchTranslations: Record<string, {
    start: string
    resume: string
    stop: string
    lap: string
    reset: string
}> = {
    en: { start: 'Start', resume: 'Resume', stop: 'Stop', lap: 'Lap', reset: 'Reset' },
    ru: { start: 'Старт', resume: 'Продолжить', stop: 'Стоп', lap: 'Круг', reset: 'Сброс' },
    lv: { start: 'Sākt', resume: 'Turpināt', stop: 'Apturēt', lap: 'Aplis', reset: 'Atiestatīt' },
    pl: { start: 'Start', resume: 'Wznów', stop: 'Stop', lap: 'Okrążenie', reset: 'Reset' },
    es: { start: 'Iniciar', resume: 'Reanudar', stop: 'Detener', lap: 'Vuelta', reset: 'Reiniciar' },
    fr: { start: 'Démarrer', resume: 'Reprendre', stop: 'Arrêter', lap: 'Tour', reset: 'Réinitialiser' },
    it: { start: 'Avvia', resume: 'Riprendi', stop: 'Ferma', lap: 'Giro', reset: 'Reimposta' },
    de: { start: 'Start', resume: 'Fortsetzen', stop: 'Stopp', lap: 'Runde', reset: 'Zurücksetzen' },
}

export function getCountdownTranslations(lang: string) {
    return countdownTranslations[lang] || countdownTranslations.en
}

export function getStopwatchTranslations(lang: string) {
    return stopwatchTranslations[lang] || stopwatchTranslations.en
}
