import Link from 'next/link'
import { getPlayerHistory, getPlayerAlerts } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import { notFound } from 'next/navigation'
import PlayerAvatar from '../../components/PlayerAvatar'
import TeamLogo from '../../components/TeamLogo'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function zColor(z: number) {
  if (z <= -3) return '#C8102E'
  if (z <= -1) return '#F05A23'
  if (z >= 2)  return '#22c55e'
  if (z >= 1)  return '#4ade80'
  return '#64748b'
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let history = []
  let alerts = []

  try {
    ;[history, alerts] = await Promise.all([
      getPlayerHistory(id, 20),
      getPlayerAlerts(id),
    ])
  } catch {
    notFound()
  }

  if (!history.length) notFound()

  const g0 = history[0] as any
  const playerName: string = g0.player_name ?? 'Jogador'
  const teamAbbr: string = g0.team_abbreviation ?? ''
  const teamId: string | undefined = (alerts[0] as any)?.team_id ?? undefined

  const avgGlobalZ = (history.reduce((s, g) => s + (g.global_zscore ?? 0), 0) / history.length)
  const avgZStr = avgGlobalZ.toFixed(2)
  const avgZColor = zColor(avgGlobalZ)

  const avgPts = (history.reduce((s, g) => s + (g.pts ?? 0), 0) / history.length).toFixed(1)
  const avgAst = (history.reduce((s, g) => s + (g.ast ?? 0), 0) / history.length).toFixed(1)
  const avgReb = (history.reduce((s, g) => s + (g.reb ?? 0), 0) / history.length).toFixed(1)
  const avgBlk = (history.reduce((s, g) => s + (g.blk ?? 0), 0) / history.length).toFixed(1)
  const avgMin = (history.reduce((s, g) => s + (g.min ?? 0), 0) / history.length).toFixed(1)

  // First name for watermark
  const firstName = playerName.split(' ')[0]

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 pb-20">

      {/* ── Back nav ─────────────────────────────────── */}
      <div className="pt-8 pb-6" style={{borderBottom: '1px solid rgba(255,255,255,0.04)'}}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase transition-colors hover:text-white"
          style={{color: 'rgba(255,255,255,0.25)'}}
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M11 2L5 8l6 6" />
          </svg>
          Feed
        </Link>
      </div>

      {/* ── Player banner ────────────────────────────── */}
      <div className="relative py-10 overflow-hidden">
        {/* Watermark name */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 font-black leading-none pointer-events-none select-none"
          style={{
            fontSize: 'clamp(80px, 14vw, 160px)',
            color: 'rgba(255,255,255,0.025)',
            letterSpacing: '-0.04em',
            userSelect: 'none',
          }}
        >
          {firstName}
        </div>

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <PlayerAvatar playerId={id} name={playerName} size="lg" />

            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <TeamLogo teamId={teamId} teamAbbr={teamAbbr} />
                <span
                  className="text-[9px] font-black tracking-[0.2em] px-2 py-1 rounded-sm"
                  style={{color: 'rgba(29,66,138,0.9)', background: 'rgba(29,66,138,0.15)', border: '1px solid rgba(29,66,138,0.3)'}}
                >
                  {teamAbbr}
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{color: 'rgba(255,255,255,0.18)'}}>
                  Perfil do Jogador
                </span>
              </div>
              <h1
                className="text-white font-black tracking-tighter leading-[0.92]"
                style={{fontSize: 'clamp(36px, 5vw, 56px)'}}
              >
                {playerName}
              </h1>
              {alerts.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-[9px] font-black tracking-[0.15em] uppercase px-2 py-1 rounded-sm"
                    style={{color: '#C8102E', background: '#C8102E14', border: '1px solid #C8102E28'}}
                  >
                    {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'} recentes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stat strip */}
          <div
            className="flex items-stretch gap-px rounded-xl overflow-hidden shrink-0"
            style={{border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)'}}
          >
            {[
              { label: 'MÉD MIN', value: avgMin,  color: 'rgba(255,255,255,0.8)' },
              { label: 'MÉD PTS', value: avgPts,  color: 'rgba(255,255,255,0.8)' },
              { label: 'MÉD AST', value: avgAst,  color: 'rgba(255,255,255,0.8)' },
              { label: 'MÉD REB', value: avgReb,  color: 'rgba(255,255,255,0.8)' },
              { label: 'MÉD BLK', value: avgBlk,  color: 'rgba(255,255,255,0.8)' },
              { label: 'Z MÉDIO', value: avgZStr,  color: avgZColor },
            ].map(({ label, value, color }, i) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center px-5 py-4"
                style={{background: i % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'transparent'}}
              >
                <span className="font-black tabular-nums leading-none" style={{color, fontSize: '22px'}}>{value}</span>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase mt-1.5" style={{color: 'rgba(255,255,255,0.22)'}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alert history ────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-4 h-[2px] rounded-full" style={{background: '#C8102E'}} />
            <span className="text-[9px] font-black tracking-[0.22em] uppercase" style={{color: 'rgba(255,255,255,0.35)'}}>
              Histórico de Alertas
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm" style={{color: '#C8102E', background: '#C8102E16'}}>
              {alerts.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {alerts.slice(0, 6).map((a, i) => {
              const c = zColor(a.global_zscore)
              return (
                <div
                  key={i}
                  className="relative overflow-hidden px-4 py-3 rounded-md"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderLeft: `3px solid ${c}`,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-8 pointer-events-none"
                    style={{background: `linear-gradient(180deg, ${c}08 0%, transparent 100%)`}}
                  />
                  <div className="relative flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold" style={{color: 'rgba(255,255,255,0.3)'}}>
                      {formatDate(a.game_date)}
                    </span>
                    <span className="font-black tabular-nums text-sm" style={{color: c}}>
                      Z {a.global_zscore}
                    </span>
                  </div>
                  <div className="relative flex gap-4">
                    {[{l:'PTS',v:a.pts},{l:'REB',v:a.reb},{l:'AST',v:a.ast}].map(({l,v}) => (
                      <div key={l}>
                        <p className="text-[8px] font-bold tracking-widest" style={{color: 'rgba(255,255,255,0.2)'}}>{l}</p>
                        <p className="text-white font-black text-sm tabular-nums">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Game log ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-4 h-[2px] rounded-full" style={{background: '#1D428A'}} />
          <span className="text-[9px] font-black tracking-[0.22em] uppercase" style={{color: 'rgba(255,255,255,0.35)'}}>
            Últimos 20 Jogos
          </span>
        </div>

        <div className="rounded-xl overflow-hidden" style={{border: '1px solid rgba(255,255,255,0.05)'}}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{background: 'rgba(29,66,138,0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                  {['Data', 'Adv', 'W/L', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'FG%', '+/-', 'Z'].map(h => (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 whitespace-nowrap"
                      style={{fontSize: '8px', fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)'}}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((g, i) => {
                  const z = g.global_zscore ?? 0
                  const isAlert = z <= -2
                  const zc = zColor(z)
                  return (
                    <tr
                      key={i}
                      className="game-row"
                      style={{
                        background: isAlert
                          ? 'rgba(200,16,46,0.04)'
                          : i % 2 === 0 ? 'rgba(255,255,255,0.008)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        borderLeft: isAlert ? '2px solid rgba(200,16,46,0.35)' : '2px solid transparent',
                      }}
                    >
                      <td className="px-3 py-2 text-xs whitespace-nowrap tabular-nums" style={{color: 'rgba(255,255,255,0.3)'}}>{formatDate(g.game_date)}</td>
                      <td className="px-3 py-2 text-xs font-bold text-white whitespace-nowrap">{g.against}</td>
                      <td className="px-3 py-2 text-xs font-black" style={{color: g.wl === 'W' ? '#22c55e' : '#f87171'}}>{g.wl}</td>
                      <td className="px-3 py-2 text-xs tabular-nums" style={{color: 'rgba(255,255,255,0.5)'}}>{g.min?.toFixed(0)}</td>
                      <td className="px-3 py-2 text-sm font-black text-white tabular-nums">{g.pts}</td>
                      <td className="px-3 py-2 text-xs text-white tabular-nums">{g.reb}</td>
                      <td className="px-3 py-2 text-xs text-white tabular-nums">{g.ast}</td>
                      <td className="px-3 py-2 text-xs tabular-nums" style={{color: 'rgba(255,255,255,0.5)'}}>{g.stl}</td>
                      <td className="px-3 py-2 text-xs tabular-nums" style={{color: 'rgba(255,255,255,0.5)'}}>{g.blk}</td>
                      <td className="px-3 py-2 text-xs tabular-nums" style={{color: 'rgba(255,255,255,0.5)'}}>{g.tov}</td>
                      <td className="px-3 py-2 text-xs tabular-nums" style={{color: 'rgba(255,255,255,0.5)'}}>{g.fg_pct ? (g.fg_pct * 100).toFixed(0) + '%' : '—'}</td>
                      <td className="px-3 py-2 text-xs font-bold tabular-nums" style={{color: g.plus_minus > 0 ? '#4ade80' : g.plus_minus < 0 ? '#f87171' : '#64748b'}}>
                        {g.plus_minus > 0 ? `+${g.plus_minus}` : g.plus_minus}
                      </td>
                      <td className="px-3 py-2 text-xs font-black tabular-nums" style={{color: zc}}>{z.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
