import Link from 'next/link'
import { Alert } from '../lib/api'
import { formatDate, getAlertTypeLabel } from '../lib/utils'
import MetricBar from './MetricBar'
import PlayerAvatar from './PlayerAvatar'
import TeamLogo from './TeamLogo'

function getSeverityColor(zscore: number) {
  if (zscore <= -5) return '#C8102E'
  if (zscore <= -3) return '#F05A23'
  return '#eab308'
}

const alertTypeConfig: Record<string, { icon: string; label: string; color: string }> = {
  queda_pontos:       { icon: '🏀', label: 'Queda em Pontos',      color: '#C8102E' },
  queda_rebotes:      { icon: '📉', label: 'Queda em Rebotes',     color: '#F05A23' },
  queda_assistencias: { icon: '🎯', label: 'Queda em Assistências', color: '#eab308' },
  queda_minutos:      { icon: '⏱',  label: 'Queda em Minutos',     color: '#64748b' },
}

function getSeverityLabel(zscore: number) {
  if (zscore <= -5) return 'CRÍTICO'
  if (zscore <= -3) return 'ALTO'
  return 'MODERADO'
}

function getSeverityKey(zscore: number): string {
  if (zscore <= -5) return 'critical'
  if (zscore <= -3) return 'high'
  return 'moderate'
}

export default function AlertCard({ alert }: { alert: Alert }) {
  const isIsolated = alert.alert_type !== 'queda_global'
  const color = getSeverityColor(alert.global_zscore)
  const severityLabel = getSeverityLabel(alert.global_zscore)
  const severityKey = getSeverityKey(alert.global_zscore)

  return (
    <Link href={`/player/${alert.player_id}`} className="block group">
      <div
        className="alert-card relative overflow-hidden"
        data-sev={severityKey}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: `3px solid ${color}`,
          borderRadius: '6px',
        }}
      >
        {/* Subtle top gradient tint */}
        <div
          className="absolute inset-x-0 top-0 h-10 pointer-events-none"
          style={{background: `linear-gradient(180deg, ${color}08 0%, transparent 100%)`}}
        />

        <div className="relative px-4 py-3">
          {/* Top row */}
          <div className="flex items-center gap-3">
            {/* Player avatar */}
            <PlayerAvatar playerId={alert.player_id} name={alert.player_name} />

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TeamLogo teamId={alert.team_id} teamAbbr={alert.team_abbreviation} />
                <span
                  className="text-[8px] font-black tracking-[0.18em]"
                  style={{color: 'rgba(255,255,255,0.28)'}}
                >
                  {alert.team_abbreviation}
                </span>
                <span style={{color: 'rgba(255,255,255,0.1)'}}>·</span>
                <span className="text-[9px] mt-0.5" style={{color: 'rgba(255,255,255,0.25)'}}>
                  {formatDate(alert.game_date)}
                </span>
              </div>
              <p className="text-white font-black text-[14px] leading-tight truncate tracking-tight">
                {alert.player_name}
              </p>

              {/* Isolated alert reason badge */}
              {isIsolated && alertTypeConfig[alert.alert_type] && (() => {
                const cfg = alertTypeConfig[alert.alert_type]
                return (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm"
                      style={{
                        background: `${cfg.color}18`,
                        border: `1px solid ${cfg.color}35`,
                      }}
                    >
                      <svg viewBox="0 0 10 10" width="8" height="8" fill="none">
                        <path d="M5 1v8M2 6l3 3 3-3" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[9px] font-black tracking-[0.1em] uppercase" style={{color: cfg.color}}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Stats — global alerts */}
            {!isIsolated && (
              <div className="flex items-center gap-2.5 shrink-0">
                {([
                  { l: 'PTS', v: alert.pts },
                  { l: 'REB', v: alert.reb },
                  { l: 'AST', v: alert.ast },
                ] as const).map(({ l, v }) => (
                  <div key={l} className="text-center">
                    <p className="text-[8px] font-bold tracking-widest" style={{color: 'rgba(255,255,255,0.2)'}}>{l}</p>
                    <p className="text-white font-black text-[15px] tabular-nums leading-none mt-0.5">{v}</p>
                  </div>
                ))}
                <div
                  className="text-center px-2.5 ml-0.5"
                  style={{borderLeft: '1px solid rgba(255,255,255,0.06)'}}
                >
                  <p className="text-[8px] font-bold tracking-widest" style={{color: 'rgba(255,255,255,0.2)'}}>Z</p>
                  <p className="font-black text-[15px] tabular-nums leading-none mt-0.5" style={{color}}>{alert.global_zscore}</p>
                </div>
                <div
                  className="text-[8px] font-black tracking-[0.15em] px-2 py-1 rounded-sm shrink-0 self-center"
                  style={{color, background: `${color}14`, border: `1px solid ${color}28`}}
                >
                  {severityLabel}
                </div>
              </div>
            )}
          </div>

          {/* Metric bars — isolated alerts */}
          {isIsolated && alert.avg_pts !== undefined && (
            <div className="mt-3 space-y-2.5 pt-3" style={{borderTop: '1px solid rgba(255,255,255,0.04)'}}>
              <MetricBar label="Pontos"   value={alert.pts} avg={alert.avg_pts!} zscore={alert.pts_zscore ?? 0} />
              <MetricBar label="Rebotes"  value={alert.reb} avg={alert.avg_reb!} zscore={alert.reb_zscore ?? 0} />
              <MetricBar label="Assists"  value={alert.ast} avg={alert.avg_ast!} zscore={alert.ast_zscore ?? 0} />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
