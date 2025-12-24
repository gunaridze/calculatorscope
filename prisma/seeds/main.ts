// prisma/seeds/main.ts
import { PrismaClient } from '@prisma/client';
import { discreteMathCategory, allFinanceTools } from './data/finance';
import { financeCategory, allFinanceTools } from './data/finance';
import { statisticsCategory, allStatisticsTools } from './data/statistics';
import { mathCategory, allMathTools } from './data/math';

import { healthFitnessCategory, healthFitnessTools } from './data/_health-fitness';
import { currencyConverterCategory, currencyConverterTools } from './data/_currency-converter';
// + остальные _xxx

const prisma = new PrismaClient();

async function seedCategory(category: any, tools: any[]) {
    console.log(`🚀 ${category.slug} — ${tools.length} tools`);

    const createdCategory = await prisma.category.create({
        data: {
            sort_order: category.sort_order,
            i18n: {
                create: Object.entries(category.name).map(([lang, name]) => ({
                    lang,
                    slug: category.slug,
                    name
                }))
            }
        }
    });

    for (const tool of tools) {
        const createdTool = await prisma.tool.create({
            data: {
                type: tool.type ?? 'calculator',
                engine: tool.engine ?? 'json',
                i18n: {
                    create: Object.entries(tool.i18n).map(([lang, data]: any) => ({
                        lang,
                        slug: tool.slug,
                        title: data.title,
                        intro_text: data.intro_text,
                        short_answer: data.short_answer
                    }))
                },
                config: tool.config
                    ? { create: { config_json: tool.config } }
                    : undefined
            }
        });

        await prisma.toolCategory.create({
            data: {
                tool_id: createdTool.id,
                category_id: createdCategory.id
            }
        });
    }
}

async function main() {
    await seedCategory(financeCategory, allFinanceTools);
    await seedCategory(statisticsCategory, allStatisticsTools);
    await seedCategory(mathCategory, allMathTools);

    await seedCategory(healthFitnessCategory, healthFitnessTools);
    await seedCategory(currencyConverterCategory, currencyConverterTools);

    console.log('✅ SEED COMPLETE');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
