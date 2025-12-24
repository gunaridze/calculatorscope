// prisma/seeds/types.ts

export type Lang =
    | 'en'
    | 'de'
    | 'es'
    | 'fr'
    | 'it'
    | 'pl'
    | 'ru'
    | 'lv';

export interface ToolI18nSeed {
    title: string;
    intro_text?: string;
    short_answer?: string;
}

export interface ToolSeedData {
    slug: string;
    type?: string;           // calculator | converter | etc
    engine?: 'json' | 'custom';

    i18n: Record<Lang, ToolI18nSeed>;

    config?: Record<string, any>;
}

export interface CategorySeed {
    slug: string;
    name: Record<Lang, string>;
    sort_order: number;
}
