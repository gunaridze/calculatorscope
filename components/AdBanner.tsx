'use client'

import Image from 'next/image'
import Link from 'next/link'

type AdBannerProps = {
  lang: string
  adNumber: 1 | 2 | 3 | 4
  className?: string
  href?: string | null
}

export default function AdBanner({ lang, adNumber, className = '', href }: AdBannerProps) {
  const isOwnAd = adNumber === 3
  const dimensions = adNumber === 4 ? '300x600' : isOwnAd ? '300x302' : '300x250'
  const [width, height] = dimensions.split('x').map(Number)

  // Путь к баннеру - файлы должны быть в /public/assets/banners/
  const imagePath = isOwnAd
    ? `/assets/banners/${lang}-own-ads.png`
    : `/assets/banners/${lang}-google-ads-${adNumber === 4 ? 3 : adNumber}.png`

  const imageElement = (
    <Image
      src={imagePath}
      alt={`Advertisement ${adNumber}`}
      width={width}
      height={height}
      className="object-contain w-full h-auto"
      unoptimized // Если изображения не оптимизируются
      onError={(e) => {
        const target = e.target as HTMLImageElement
        if (!target.dataset.fallbackUsed) {
          target.dataset.fallbackUsed = 'true'
          target.style.display = 'none'
        }
      }}
    />
  )

  const containerClass = `flex justify-center items-center bg-gray-100 border border-gray-200 min-h-[${height}px] ${className}`

  if (href) {
    return (
      <Link 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`${containerClass} hover:opacity-90 transition-opacity`}
      >
        {imageElement}
      </Link>
    )
  }

  return (
    <div className={containerClass}>
      {imageElement}
    </div>
  )
}