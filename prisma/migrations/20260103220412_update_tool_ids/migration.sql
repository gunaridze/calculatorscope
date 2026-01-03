-- Изменяем тип tools.id с UUID на TEXT (для кастомных ID)
-- Сначала нужно удалить все внешние ключи, которые ссылаются на tools.id
ALTER TABLE "tool_config" DROP CONSTRAINT IF EXISTS "tool_config_tool_id_fkey";
ALTER TABLE "tool_categories" DROP CONSTRAINT IF EXISTS "tool_categories_tool_id_fkey";
ALTER TABLE "tool_i18n" DROP CONSTRAINT IF EXISTS "tool_i18n_tool_id_fkey";

-- Изменяем тип tools.id
ALTER TABLE "tools" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "tools" ALTER COLUMN "id" DROP DEFAULT;

-- Изменяем тип tool_i18n.id с String (UUID) на Integer (автоинкремент)
-- Удаляем старую первичную колонку
ALTER TABLE "tool_i18n" DROP CONSTRAINT IF EXISTS "tool_i18n_pkey";
ALTER TABLE "tool_i18n" DROP COLUMN IF EXISTS "id";

-- Добавляем новую колонку id как INTEGER
ALTER TABLE "tool_i18n" ADD COLUMN "id" INTEGER;

-- Если есть данные, генерируем временные ID начиная с 1000
DO $$
DECLARE
    counter INTEGER := 1000;
    rec RECORD;
BEGIN
    FOR rec IN SELECT ctid FROM "tool_i18n" ORDER BY ctid LOOP
        UPDATE "tool_i18n" SET "id" = counter WHERE ctid = rec.ctid;
        counter := counter + 1;
    END LOOP;
END $$;

-- Делаем колонку NOT NULL
ALTER TABLE "tool_i18n" ALTER COLUMN "id" SET NOT NULL;

-- Создаем последовательность для автоинкремента, начиная с 1000
CREATE SEQUENCE IF NOT EXISTS "tool_i18n_id_seq" START WITH 1000;
-- Устанавливаем текущее значение последовательности на максимальный ID + 1
DO $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT COALESCE(MAX("id"), 999) INTO max_id FROM "tool_i18n";
    PERFORM setval('tool_i18n_id_seq', GREATEST(max_id + 1, 1000));
END $$;

ALTER TABLE "tool_i18n" ALTER COLUMN "id" SET DEFAULT nextval('tool_i18n_id_seq');
ALTER SEQUENCE "tool_i18n_id_seq" OWNED BY "tool_i18n"."id";

-- Восстанавливаем первичный ключ
ALTER TABLE "tool_i18n" ADD PRIMARY KEY ("id");

-- Восстанавливаем внешние ключи
ALTER TABLE "tool_config" ADD CONSTRAINT "tool_config_tool_id_fkey" 
    FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE;
ALTER TABLE "tool_categories" ADD CONSTRAINT "tool_categories_tool_id_fkey" 
    FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE;
ALTER TABLE "tool_i18n" ADD CONSTRAINT "tool_i18n_tool_id_fkey" 
    FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE;

