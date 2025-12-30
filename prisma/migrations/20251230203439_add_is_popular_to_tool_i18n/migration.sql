-- AlterTable
ALTER TABLE "category_i18n" ADD COLUMN     "is_popular" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "og_image_alt" TEXT,
ADD COLUMN     "short_description" TEXT;

-- AlterTable
ALTER TABLE "tool_i18n" ADD COLUMN     "is_popular" INTEGER NOT NULL DEFAULT 0;
