// UI strings for the bespoke live-rate Currency Converter widget.

export const currencyConverterTranslations: Record<string, {
    amountLabel: string
    fromLabel: string
    toLabel: string
    swapLabel: string
    loadingRates: string
    errorLoadingRates: string
    lastUpdated: string
    ratesSource: string
}> = {
    en: { amountLabel: 'Amount', fromLabel: 'From', toLabel: 'To', swapLabel: 'Swap currencies', loadingRates: 'Loading live rates...', errorLoadingRates: 'Could not load exchange rates. Please try again shortly.', lastUpdated: 'Rates last updated', ratesSource: 'Source: European Central Bank reference rates (via Frankfurter.app)' },
    ru: { amountLabel: 'Сумма', fromLabel: 'Из', toLabel: 'В', swapLabel: 'Поменять валюты местами', loadingRates: 'Загрузка актуальных курсов...', errorLoadingRates: 'Не удалось загрузить курсы валют. Попробуйте немного позже.', lastUpdated: 'Курсы обновлены', ratesSource: 'Источник: справочные курсы Европейского центрального банка (через Frankfurter.app)' },
    lv: { amountLabel: 'Summa', fromLabel: 'No', toLabel: 'Uz', swapLabel: 'Samainīt valūtas', loadingRates: 'Notiek aktuālo kursu ielāde...', errorLoadingRates: 'Neizdevās ielādēt valūtas kursus. Lūdzu, mēģiniet vēlreiz drīzumā.', lastUpdated: 'Kursi atjaunināti', ratesSource: 'Avots: Eiropas Centrālās bankas atsauces kursi (ar Frankfurter.app starpniecību)' },
    pl: { amountLabel: 'Kwota', fromLabel: 'Z', toLabel: 'Na', swapLabel: 'Zamień waluty', loadingRates: 'Wczytywanie aktualnych kursów...', errorLoadingRates: 'Nie udało się wczytać kursów walut. Spróbuj ponownie za chwilę.', lastUpdated: 'Kursy zaktualizowano', ratesSource: 'Źródło: kursy referencyjne Europejskiego Banku Centralnego (za pośrednictwem Frankfurter.app)' },
    es: { amountLabel: 'Cantidad', fromLabel: 'De', toLabel: 'A', swapLabel: 'Intercambiar monedas', loadingRates: 'Cargando tipos de cambio actuales...', errorLoadingRates: 'No se pudieron cargar los tipos de cambio. Inténtalo de nuevo en breve.', lastUpdated: 'Tipos actualizados', ratesSource: 'Fuente: tipos de referencia del Banco Central Europeo (a través de Frankfurter.app)' },
    fr: { amountLabel: 'Montant', fromLabel: 'De', toLabel: 'Vers', swapLabel: 'Échanger les devises', loadingRates: 'Chargement des taux en direct...', errorLoadingRates: 'Impossible de charger les taux de change. Veuillez réessayer sous peu.', lastUpdated: 'Taux mis à jour', ratesSource: 'Source : taux de référence de la Banque Centrale Européenne (via Frankfurter.app)' },
    it: { amountLabel: 'Importo', fromLabel: 'Da', toLabel: 'A', swapLabel: 'Scambia valute', loadingRates: 'Caricamento tassi in tempo reale...', errorLoadingRates: 'Impossibile caricare i tassi di cambio. Riprova a breve.', lastUpdated: 'Tassi aggiornati', ratesSource: 'Fonte: tassi di riferimento della Banca Centrale Europea (tramite Frankfurter.app)' },
    de: { amountLabel: 'Betrag', fromLabel: 'Von', toLabel: 'Nach', swapLabel: 'Währungen tauschen', loadingRates: 'Aktuelle Kurse werden geladen...', errorLoadingRates: 'Wechselkurse konnten nicht geladen werden. Bitte versuchen Sie es in Kürze erneut.', lastUpdated: 'Kurse aktualisiert', ratesSource: 'Quelle: Referenzkurse der Europäischen Zentralbank (über Frankfurter.app)' },
}

export function getCurrencyConverterTranslations(lang: string) {
    return currencyConverterTranslations[lang] || currencyConverterTranslations.en
}
