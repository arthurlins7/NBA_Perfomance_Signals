'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  playerId: string
  name: string
  size?: 'sm' | 'lg'
}

export default function PlayerAvatar({ playerId, name, size = 'sm' }: Props) {
  const [error, setError] = useState(false)

  const dim = size === 'lg' ? 'w-20 h-20' : 'w-11 h-11'
  const fontSize = size === 'lg' ? 'text-2xl' : 'text-[10px]'

  return (
    <div
      className={`relative ${dim} rounded-full overflow-hidden shrink-0`}
      style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}
    >
      {!error && (
        <Image
          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`}
          alt={name}
          fill
          className="object-cover object-top scale-110"
          unoptimized
          onError={() => setError(true)}
        />
      )}
      {error && (
        <span className={`absolute inset-0 flex items-center justify-center font-black ${fontSize}`} style={{color: 'rgba(255,255,255,0.2)'}}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  )
}
