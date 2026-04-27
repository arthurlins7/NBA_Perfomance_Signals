import { Suspense } from 'react'
import { getGlobalAlerts, getIsolatedAlerts } from './lib/api'
import AlertCard from './components/AlertCard'
import TeamFilter from './components/TeamFilter'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>
}) {
  const { team: teamFilter } = await searchParams

  let globalAlerts = []
  let isolatedAlerts = []

  try {
    [globalAlerts, isolatedAlerts] = await Promise.all([
      getGlobalAlerts(50),
      getIsolatedAlerts(50),
    ])
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 mb-6 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full"
            style={{color: '#C8102E', background: '#C8102E12', border: '1px solid #C8102E22'}}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{background: '#C8102E'}} />
            Sem conexão
          </div>
          <p className="text-white font-black text-3xl mb-2 tracking-tighter">Servidor offline</p>
          <p className="text-sm mb-8" style={{color: 'rgba(255,255,255,0.35)'}}>Certifique-se que a API está rodando em :8000</p>
          <a
            href="/"
            className="text-[11px] font-black tracking-[0.15em] uppercase px-5 py-2.5 rounded-md"
            style={{color: '#C8102E', border: '1px solid #C8102E30', background: '#C8102E10'}}
          >
            Tentar novamente
          </a>
        </div>
      </main>
    )
  }

  // Sorted unique teams across all alerts
  const allTeams = Array.from(
    new Set([...globalAlerts, ...isolatedAlerts].map(a => a.team_abbreviation))
  ).sort()

  // Apply team filter
  const filteredGlobal   = teamFilter ? globalAlerts.filter(a => a.team_abbreviation === teamFilter)   : globalAlerts
  const filteredIsolated = teamFilter ? isolatedAlerts.filter(a => a.team_abbreviation === teamFilter) : isolatedAlerts

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
  const teamsAffected = new Set([...globalAlerts, ...isolatedAlerts].map(a => a.team_abbreviation)).size
  const totalAlerts = globalAlerts.length + isolatedAlerts.length

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 pb-20">

      {/* ── Hero ─────────────────────────────────────── */}
      <div className="pt-6 pb-5 flex items-center justify-between gap-6 flex-wrap" style={{borderBottom: '1px solid rgba(255,255,255,0.04)'}}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: '#C8102E', boxShadow: '0 0 6px rgba(200,16,46,0.6)'}} />
            <span className="text-[9px] font-black tracking-[0.22em] uppercase" style={{color: '#C8102E'}}>Live</span>
          </div>
          <h1 className="font-black text-white tracking-tighter leading-none text-3xl">
            Anomaly <span style={{color: 'rgba(255,255,255,0.2)'}}>Feed</span>
          </h1>
          <p className="mt-1 text-[10px] capitalize" style={{color: 'rgba(255,255,255,0.25)'}}>{today}</p>
        </div>

        {/* Scoreboard */}
        <div
          className="flex items-stretch gap-px rounded-lg overflow-hidden shrink-0"
          style={{border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)'}}
        >
          {[
            { label: 'Alertas', value: totalAlerts,           color: 'rgba(255,255,255,0.8)' },
            { label: 'Global',  value: globalAlerts.length,   color: '#C8102E' },
            { label: 'Isolado', value: isolatedAlerts.length, color: '#F05A23' },
            { label: 'Times',   value: teamsAffected,         color: '#1D428A' },
          ].map(({ label, value, color }, i) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center px-4 py-3"
              style={{background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}}
            >
              <span className="font-black tabular-nums leading-none text-2xl" style={{color}}>{value}</span>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase mt-1" style={{color: 'rgba(255,255,255,0.25)'}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Team filter ──────────────────────────────── */}
      <div className="mt-5 pb-5" style={{borderBottom: '1px solid rgba(255,255,255,0.04)'}}>
        <Suspense>
          <TeamFilter teams={allTeams} />
        </Suspense>
      </div>

      {/* ── Feed grid ────────────────────────────────── */}
      <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Global alerts */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-4 h-[2px] rounded-full" style={{background: '#C8102E'}} />
            <span className="text-[9px] font-black tracking-[0.22em] uppercase" style={{color: 'rgba(255,255,255,0.35)'}}>
              Queda Global
            </span>
            <span
              className="text-[9px] font-black tabular-nums px-1.5 py-0.5 rounded-sm"
              style={{color: '#C8102E', background: '#C8102E16'}}
            >
              {filteredGlobal.length}
            </span>
          </div>
          <div className="space-y-2">
            {filteredGlobal.map((alert, i) => (
              <AlertCard key={`${alert.player_id}-${i}`} alert={alert} />
            ))}
            {filteredGlobal.length === 0 && (
              <p className="text-[11px] py-8 text-center" style={{color: 'rgba(255,255,255,0.2)'}}>
                Nenhum alerta global{teamFilter ? ` para ${teamFilter}` : ' hoje'}
              </p>
            )}
          </div>
        </div>

        {/* Isolated alerts */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-4 h-[2px] rounded-full" style={{background: '#F05A23'}} />
            <span className="text-[9px] font-black tracking-[0.22em] uppercase" style={{color: 'rgba(255,255,255,0.35)'}}>
              Queda Isolada
            </span>
            <span
              className="text-[9px] font-black tabular-nums px-1.5 py-0.5 rounded-sm"
              style={{color: '#F05A23', background: '#F05A2316'}}
            >
              {filteredIsolated.length}
            </span>
          </div>
          <div className="space-y-2">
            {filteredIsolated.map((alert, i) => (
              <AlertCard key={`${alert.player_id}-${i}`} alert={alert} />
            ))}
            {filteredIsolated.length === 0 && (
              <p className="text-[11px] py-8 text-center" style={{color: 'rgba(255,255,255,0.2)'}}>
                Nenhum alerta isolado{teamFilter ? ` para ${teamFilter}` : ' hoje'}
              </p>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
