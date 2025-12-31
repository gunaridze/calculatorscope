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
      // h-[140px] - fixed height
      // relative - establishes context for absolute children
      className="group relative block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-[140px]"
    >
      {/* 1. ICON */}
      {/* Strictly Top-Left: Top 10px, Left 10px */}
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

      {/* 2. TITLE */}
      {/* px-[40px] is critical to prevent overlap with the 34px icon space. */}
      <h3 className="mt-[10px] font-bold text-center px-[40px] text-lg leading-tight text-gray-900">
        {name}
      </h3>

      {/* 3. DESCRIPTION */}
      {/* Content Zone: Top 49px to Bottom 15px */}
      {/* Text is centered horizontally and vertically within this rigid zone */}
      {shortDescription && (
        <div className="absolute top-[49px] bottom-[15px] left-0 right-0 flex items-center justify-center px-[10px]">
          <p className="text-center text-sm text-gray-600 line-clamp-3 leading-snug">
            {shortDescription}
          </p>
        </div>
      )}
    </Link>
  )
}