'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { readConsentCookie } from '@/lib/consent'

type AdBannerProps = {
  lang: string
  adNumber: 1 | 2 | 3 | 4
  className?: string
  href?: string | null
}

// AdSense client ID + per-slot ad unit IDs — unset by default, so this component
// keeps rendering today's placeholder images until both are configured post-approval.
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
const ADSENSE_SLOT_IDS: Record<1 | 2 | 3 | 4, string | undefined> = {
  1: process.env.NEXT_PUBLIC_ADSENSE_SLOT_1,
  2: process.env.NEXT_PUBLIC_ADSENSE_SLOT_2,
  3: process.env.NEXT_PUBLIC_ADSENSE_SLOT_3,
  4: process.env.NEXT_PUBLIC_ADSENSE_SLOT_4,
}

export default function AdBanner({ lang, adNumber, className = '', href }: AdBannerProps) {
  const isOwnAd = adNumber === 3
  const dimensions = adNumber === 4 ? '300x600' : isOwnAd ? '300x302' : '300x250'
  const [width, height] = dimensions.split('x').map(Number)
  const [adsEnabled, setAdsEnabled] = useState(false)

  const slotId = ADSENSE_SLOT_IDS[adNumber]
  const canUseRealAd = !isOwnAd && Boolean(ADSENSE_CLIENT_ID) && Boolean(slotId)

  useEffect(() => {
    if (!canUseRealAd) return
    setAdsEnabled(readConsentCookie() === 'granted')
  }, [canUseRealAd])

  useEffect(() => {
    if (!adsEnabled) return
    try {
      // @ts-ignore - adsbygoogle is injected by the Google-hosted script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('AdSense push failed:', e)
    }
  }, [adsEnabled])

  if (adsEnabled) {
    return (
      <ins
        className={`adsbygoogle block ${className}`}
        style={{ display: 'inline-block', width, height }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
      />
    )
  }

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