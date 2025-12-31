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
      className="group relative block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-[140px] flex flex-col"
    >
      {/* Иконка - абсолютное позиционирование слева сверху */}
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

      {/* Заголовок - по центру с отступом сверху */}
      <h3 className="mt-[10px] font-bold text-center px-[20px] text-lg">
        {name}
      </h3>

      {/* Описание - посередине между (нижний край иконки + 15px) и (нижняя граница - 15px) */}
      {shortDescription && (
        <div className="flex-1 flex items-center justify-center pb-[15px]">
          <p 
            className="text-center text-sm px-[10px] text-gray-600 line-clamp-2"
            style={{
              marginTop: iconUrl ? '15px' : '0'
            }}
          >
            {shortDescription}
          </p>
        </div>
      )}
    </Link>
  )
}