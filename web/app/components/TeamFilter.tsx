'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  teams: string[]
}

export default function TeamFilter({ teams }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('team') ?? 'all'

  const select = useCallback((team: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (team === 'all') {
      params.delete('team')
    } else {
      params.set('team', team)
    }
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => select('all')}
        className="text-[9px] font-black tracking-[0.15em] uppercase px-2.5 py-1 rounded-sm transition-all duration-100"
        style={{
          background: active === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: active === 'all' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
          border: `1px solid ${active === 'all' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        }}
      >
        Todos
      </button>
      {teams.map(team => (
        <button
          key={team}
          onClick={() => select(team)}
          className="text-[9px] font-black tracking-[0.15em] uppercase px-2.5 py-1 rounded-sm transition-all duration-100"
          style={{
            background: active === team ? 'rgba(200,16,46,0.15)' : 'transparent',
            color: active === team ? '#C8102E' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${active === team ? 'rgba(200,16,46,0.3)' : 'rgba(255,255,255,0.05)'}`,
          }}
        >
          {team}
        </button>
      ))}
    </div>
  )
}
