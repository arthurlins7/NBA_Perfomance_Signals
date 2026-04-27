'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function TeamLogo({ teamId, teamAbbr }: { teamId?: string; teamAbbr: string }) {
  const [error, setError] = useState(false)

  if (!teamId || error) {
    return (
      <span className="text-[9px] font-black tracking-widest" style={{color: 'rgba(255,255,255,0.3)'}}>
        {teamAbbr}
      </span>
    )
  }

  return (
    <div className="relative w-6 h-6 shrink-0">
      <Image
        src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
        alt={teamAbbr}
        fill
        className="object-contain"
        unoptimized
        onError={() => setError(true)}
      />
    </div>
  )
}
