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
  const iconPath = iconUrl 
    ? `/assets/icons/${iconUrl}`
    : '/assets/icons/default.svg'

  return (
    <Link
      href={`/${lang}/${slug}`}
      className="group relative block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      style={{ minHeight: '140px', width: '100%', maxWidth: '273px' }}
    >
      {/* Иконка - сверху справа, отступ 10px */}
      {iconUrl && (
        <div className="absolute top-[10px] right-[10px]">
          <Image
            src={iconPath}
            alt={name}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      )}

      {/* Заголовок - по центру, mt-10px, отступы от иконки минимум 20px */}
      <h3 
        className="font-bold text-center mt-[10px] text-lg"
        style={{ 
          paddingLeft: iconUrl ? '20px' : '0',
          paddingRight: iconUrl ? '60px' : '0'
        }}
      >
        {name}
      </h3>

      {/* Описание - под заголовком, отступ от низа иконки 15px, по центру, px-10px */}
      {shortDescription && (
        <p 
          className="text-sm text-gray-600 text-center px-[10px]"
          style={{ marginTop: iconUrl ? '15px' : '10px' }}
        >
          {shortDescription}
        </p>
      )}
    </Link>
  )
}