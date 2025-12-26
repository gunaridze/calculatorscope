-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ToolEngine" AS ENUM ('json', 'custom');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ToolStatus" NOT NULL DEFAULT 'draft',
    "engine" "ToolEngine" NOT NULL DEFAULT 'json',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_i18n" (
    "id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "h1" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_robots" TEXT DEFAULT 'index,follow',
    "canonical_path" TEXT,
    "short_answer" TEXT,
    "intro_text" TEXT,
    "key_points_json" JSONB,
    "inputs_json" JSONB,
    "outputs_json" JSONB,
    "examples_json" JSONB,
    "formula_md" TEXT,
    "assumptions_md" TEXT,
    "faq_json" JSONB,
    "howto_json" JSONB,
    "schema_json" JSONB,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image_url" TEXT,
    "twitter_title" TEXT,
    "twitter_description" TEXT,
    "twitter_image_url" TEXT,
    "last_reviewed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_i18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_config" (
    "tool_id" TEXT NOT NULL,
    "config_json" JSONB NOT NULL,
    "custom_component_key" TEXT,

    CONSTRAINT "tool_config_pkey" PRIMARY KEY ("tool_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_i18n" (
    "category_id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "intro_text" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image_url" TEXT,
    "content_blocks_json" JSONB
);

-- CreateTable
CREATE TABLE "tool_categories" (
    "tool_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "tool_categories_pkey" PRIMARY KEY ("tool_id","category_id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_i18n" (
    "page_id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_robots" TEXT,
    "h1" TEXT NOT NULL,
    "short_answer" TEXT,
    "body_blocks_json" JSONB,
    "schema_json" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_reviewed_at" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "tool_i18n_lang_slug_key" ON "tool_i18n"("lang", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tool_i18n_tool_id_lang_key" ON "tool_i18n"("tool_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "category_i18n_category_id_lang_key" ON "category_i18n"("category_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "category_i18n_lang_slug_key" ON "category_i18n"("lang", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_code_key" ON "pages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "page_i18n_page_id_lang_key" ON "page_i18n"("page_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "page_i18n_lang_slug_key" ON "page_i18n"("lang", "slug");

-- AddForeignKey
ALTER TABLE "tool_i18n" ADD CONSTRAINT "tool_i18n_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_config" ADD CONSTRAINT "tool_config_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_i18n" ADD CONSTRAINT "category_i18n_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_categories" ADD CONSTRAINT "tool_categories_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_categories" ADD CONSTRAINT "tool_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_i18n" ADD CONSTRAINT "page_i18n_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
