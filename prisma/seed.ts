// prisma/seeds/seed.ts
import { PrismaClient } from '@prisma/client'
import { categoriesSeed } from './data/categoriesSeed'

const prisma = new PrismaClient()

async function createCategoryRecursive(categoryNode: typeof categoriesSeed[0], parentId?: number) {
    // 1. Создаем категорию
    const category = await prisma.category.create({
        data: {
            sort_order: categoryNode.sort_order,
            parent_id: parentId,
            i18n: {
                create: Object.entries(categoryNode.name).map(([lang, name]) => ({
                    lang,
                    slug: categoryNode.slug, // можно потом кастомизировать per language
                    name
                })),
            },
        },
    })

    // 2. Если есть дочерние, рекурсивно создаем их
    if (categoryNode.children && categoryNode.children.length > 0) {
        for (const child of categoryNode.children) {
            await createCategoryRecursive(child, category.id)
        }
    }
}

async function main() {
    console.log('🌱 Начинаем посев категорий...')

    for (const cat of categoriesSeed) {
        await createCategoryRecursive(cat)
    }

    console.log('✅ Все категории созданы!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })