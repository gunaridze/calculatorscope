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
  // Путь к иконке - файлы должны быть в /public/assets/icons/
  const iconPath = iconUrl 
    ? `/assets/icons/${iconUrl}`
    : '/assets/icons/default.svg'

  return (
    <Link
      href={`/${lang}/${slug}`}
      className="group relative block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-[140px] flex flex-col items-center justify-start"
    >
      {/* Иконка - абсолютное позиционирование сверху справа */}
      {iconUrl && (
        <div className="absolute top-[10px] right-[10px] w-[24px] h-[24px] flex items-center justify-center">
          <Image
            src={iconPath}
            alt={name}
            width={24}
            height={24}
            className="object-contain"
            unoptimized // Если изображения не оптимизируются, используйте unoptimized
          />
        </div>
      )}

      {/* Заголовок - по центру с отступами */}
      <h3 className="mt-[10px] font-bold text-center px-[30px] text-lg flex-1 flex items-start justify-center">
        {name}
      </h3>

      {/* Описание - под заголовком */}
      {shortDescription && (
        <p className="mt-[15px] text-center text-sm px-[10px] text-gray-600 line-clamp-2">
          {shortDescription}
        </p>
      )}
    </Link>
  )
}