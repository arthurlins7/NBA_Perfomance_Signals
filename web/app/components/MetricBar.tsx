type MetricBarProps = {
  label: string
  value: number
  avg: number
  zscore: number
}

function getConfig(zscore: number) {
  if (zscore <= -2.0) return { color: '#C8102E', glow: 'rgba(200,16,46,0.3)', dim: '#3a000d', tag: 'MUITO ABAIXO' }
  if (zscore <= -1.0) return { color: '#F05A23', glow: 'rgba(240,90,35,0.25)', dim: '#4a1800', tag: 'ABAIXO' }
  if (zscore >= 2.0)  return { color: '#22c55e', glow: 'rgba(34,197,94,0.25)', dim: '#052e16', tag: 'MUITO ACIMA' }
  if (zscore >= 1.0)  return { color: '#4ade80', glow: 'rgba(74,222,128,0.2)', dim: '#052e16', tag: 'ACIMA' }
  return { color: '#475569', glow: 'transparent', dim: '#1e293b', tag: 'NORMAL' }
}

export default function MetricBar({ label, value, avg, zscore }: MetricBarProps) {
  const cfg = getConfig(zscore)
  const pct = Math.min(Math.max((value / (avg * 2)) * 100, 0), 100)
  const drop = avg > 0 ? Math.round(((avg - value) / avg) * 100) : 0

  return (
    <div className="grid items-center gap-x-4" style={{gridTemplateColumns: '72px 1fr 72px'}}>
      <span className="text-[9px] font-black tracking-[0.18em] uppercase text-right" style={{color: 'rgba(255,255,255,0.3)'}}>{label}</span>

      <div className="relative h-[6px] rounded-full" style={{background: 'rgba(255,255,255,0.05)'}}>
        {/* avg marker */}
        <div
          className="absolute top-[-3px] w-[1px] h-[12px] z-10"
          style={{left: '50%', background: 'rgba(255,255,255,0.18)'}}
        />
        {/* fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${cfg.dim}, ${cfg.color})`,
            boxShadow: `0 0 8px ${cfg.glow}`,
          }}
        />
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-black text-sm tabular-nums text-white leading-none">{value}</span>
        <span className="text-[9px] tabular-nums" style={{color: 'rgba(255,255,255,0.25)'}}>
          /{avg > 0 ? avg.toFixed(1) : '—'}
        </span>
        {zscore <= -1.0 && drop > 0 && (
          <span className="text-[9px] font-black tabular-nums" style={{color: cfg.color}}>-{drop}%</span>
        )}
      </div>
    </div>
  )
}
