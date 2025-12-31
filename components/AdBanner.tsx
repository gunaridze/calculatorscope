import Image from 'next/image'
import Link from 'next/link'

type AdBannerProps = {
  lang: string
  adNumber: 1 | 2 | 3 | 4
  className?: string
  href?: string | null // Ссылка для баннера
}

export default function AdBanner({ lang, adNumber, className = '', href }: AdBannerProps) {
  const isOwnAd = adNumber === 3
  const dimensions = adNumber === 4 ? '300x600' : isOwnAd ? '300x302' : '300x250'
  const [width, height] = dimensions.split('x').map(Number)

  // Для Ad 3 всегда свой баннер
  const imagePath = isOwnAd
    ? `/assets/banners/${lang}-own-ads.png`
    : `/assets/banners/${lang}-google-ads-${adNumber === 4 ? 3 : adNumber}.png`

const imageElement = (
  <Image
    src={imagePath}
    alt={`Advertisement ${adNumber}`}
    width={width}
    height={height}
    className="object-contain"
    onError={(e) => {
      // Предотвращаем бесконечный цикл
      const target = e.target as HTMLImageElement
      if (!target.dataset.fallbackUsed) {
        target.dataset.fallbackUsed = 'true'
        // Можно установить placeholder или скрыть изображение
        target.style.display = 'none'
      }
    }}
  />
)

  // Если есть ссылка, оборачиваем в Link, иначе просто div
  if (href) {
    return (
      <Link 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex justify-center items-center bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity ${className}`}
      >
        {imageElement}
      </Link>
    )
  }

  return (
    <div className={`flex justify-center items-center bg-gray-100 border border-gray-200 ${className}`}>
      {imageElement}
    </div>
  )
}