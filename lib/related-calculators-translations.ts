// Title for the "Related Calculators" sidebar widget shown on tool pages.

export const RELATED_CALCULATORS_TITLE: Record<string, string> = {
    en: 'Related Calculators',
    ru: 'Похожие калькуляторы',
    de: 'Ähnliche Rechner',
    es: 'Calculadoras Relacionadas',
    fr: 'Calculateurs Associés',
    it: 'Calcolatori Correlati',
    pl: 'Powiązane Kalkulatory',
    lv: 'Saistītie Kalkulatori',
}

export function getRelatedCalculatorsTitle(lang: string): string {
    return RELATED_CALCULATORS_TITLE[lang] || RELATED_CALCULATORS_TITLE.en
}
