'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * Full-bleed looping hero. The poster is frame 0 of the video, so the hand-off from still to
 * motion is invisible. The video is only requested after mount, which lets us pick the smaller
 * 720p file on phones and skip it entirely for visitors who prefer reduced motion (they keep
 * the still).
 */
export function HeroVideo() {
  const [src, setSrc] = useState<string>()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setSrc(window.matchMedia('(max-width: 767px)').matches ? '/home/hero-720.mp4' : '/home/hero-1080.mp4')
  }, [])

  // The vials sit in the right third of the frame, so crop toward the right.
  const fit = 'object-cover object-[78%_center] lg:object-[70%_center]'

  // Below lg the footage is a band across the top and the text sits on solid dark beneath it.
  return (
    <div className="absolute inset-x-0 top-0 -z-10 h-[340px] overflow-hidden lg:inset-0 lg:h-auto" aria-hidden="true">
      <Image src="/home/hero-poster.webp" alt="" fill priority sizes="100vw" className={fit} />
      {src && (
        <video
          key={src}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${fit} ${playing ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {/* Flat tint (the brand kit has no gradients): keeps the headline readable over the footage. */}
      <div className="absolute inset-0 bg-pine-ink/20 lg:bg-pine-ink/35" />
    </div>
  )
}
