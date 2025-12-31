import Link from 'next/link'
import Image from 'next/image'

type CategoryCardProps = {
  lang: string
  categoryId: string
  slug: string
  name: string
  shortDescription?: string | null
  iconUrl?: string | null
}

export default function CategoryCard({
  lang,
  categoryId,
  slug,
  name,
  shortDescription,
  iconUrl,
}: CategoryCardProps) {
  // Path to icon
  const iconPath = iconUrl 
    ? `/assets/icons/${iconUrl}`
    : '/assets/icons/default.svg'

  return (
    <Link
      href={`/${lang}/${slug}`}
      // ДОБАВЛЕНО: overflow-hidden
      // Это критически важно! Это скажет Grid-сетке: "Мой размер ровно 140px, игнорируй всё, что торчит внутри".
      className="group relative flex flex-col bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-[140px] overflow-hidden"
    >
      {/* ИКОНКА */}
      {iconUrl && (
        <div className="absolute top-[10px] left-[10px] w-[24px] h-[24px] flex items-center justify-center z-10">
          <Image
            src={iconPath}
            alt={name}
            width={24}
            height={24}
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {/* ЗАГОЛОВОК */}
      {/* Добавил leading-tight, чтобы длинные заголовки занимали меньше места по вертикали */}
      {/* line-clamp-2 ограничивает заголовок максимум 2 строками */}
      {/* mb-2 добавляет отступ снизу, чтобы не перекрывать описание */}
      <h3 className="mt-[10px] mb-2 font-bold text-center px-[40px] text-lg leading-tight text-gray-900 z-20 line-clamp-2">
        {name}
      </h3>

      {/* ОПИСАНИЕ */}
      {/* ДОБАВЛЕНО: min-h-0 */}
      {/* Это позволяет флекс-элементу сжиматься, даже если текст внутри хочет больше места */}
      {shortDescription && (
        <div className="flex-1 flex items-center justify-center px-[10px] pb-2 min-h-0">
          <p className="text-center text-sm text-gray-600 line-clamp-3 leading-snug">
            {shortDescription}
          </p>
        </div>
      )}
    </Link>
  )
}