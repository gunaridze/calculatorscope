// Переводы для поиска в хедере и на странице результатов поиска
export const searchTranslations: Record<string, {
    noResults: string
    searching: string
    viewAllResults: string
    resultsFor: string
    calculatorLabel: string
    categoryLabel: string
    typeToSearch: string
}> = {
    en: {
        noResults: 'No calculators found',
        searching: 'Searching…',
        viewAllResults: 'View all results',
        resultsFor: 'Search results for',
        calculatorLabel: 'Calculator',
        categoryLabel: 'Category',
        typeToSearch: 'Keep typing to search…',
    },
    ru: {
        noResults: 'Калькуляторы не найдены',
        searching: 'Поиск…',
        viewAllResults: 'Показать все результаты',
        resultsFor: 'Результаты поиска по запросу',
        calculatorLabel: 'Калькулятор',
        categoryLabel: 'Категория',
        typeToSearch: 'Продолжайте вводить запрос…',
    },
    lv: {
        noResults: 'Kalkulatori nav atrasti',
        searching: 'Meklē…',
        viewAllResults: 'Skatīt visus rezultātus',
        resultsFor: 'Meklēšanas rezultāti par',
        calculatorLabel: 'Kalkulators',
        categoryLabel: 'Kategorija',
        typeToSearch: 'Turpiniet rakstīt, lai meklētu…',
    },
    pl: {
        noResults: 'Nie znaleziono kalkulatorów',
        searching: 'Szukam…',
        viewAllResults: 'Zobacz wszystkie wyniki',
        resultsFor: 'Wyniki wyszukiwania dla',
        calculatorLabel: 'Kalkulator',
        categoryLabel: 'Kategoria',
        typeToSearch: 'Wpisz więcej, aby wyszukać…',
    },
    es: {
        noResults: 'No se encontraron calculadoras',
        searching: 'Buscando…',
        viewAllResults: 'Ver todos los resultados',
        resultsFor: 'Resultados de búsqueda para',
        calculatorLabel: 'Calculadora',
        categoryLabel: 'Categoría',
        typeToSearch: 'Sigue escribiendo para buscar…',
    },
    fr: {
        noResults: 'Aucun calculateur trouvé',
        searching: 'Recherche…',
        viewAllResults: 'Voir tous les résultats',
        resultsFor: 'Résultats de recherche pour',
        calculatorLabel: 'Calculateur',
        categoryLabel: 'Catégorie',
        typeToSearch: 'Continuez à taper pour rechercher…',
    },
    it: {
        noResults: 'Nessun calcolatore trovato',
        searching: 'Ricerca…',
        viewAllResults: 'Vedi tutti i risultati',
        resultsFor: 'Risultati di ricerca per',
        calculatorLabel: 'Calcolatore',
        categoryLabel: 'Categoria',
        typeToSearch: 'Continua a digitare per cercare…',
    },
    de: {
        noResults: 'Keine Rechner gefunden',
        searching: 'Suche…',
        viewAllResults: 'Alle Ergebnisse anzeigen',
        resultsFor: 'Suchergebnisse für',
        calculatorLabel: 'Rechner',
        categoryLabel: 'Kategorie',
        typeToSearch: 'Weiter tippen, um zu suchen…',
    },
}

export function getSearchTranslations(lang: string) {
    return searchTranslations[lang as keyof typeof searchTranslations] || searchTranslations.en
}
