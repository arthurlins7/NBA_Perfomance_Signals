export function getSeverity(zscore: number): {
  label: string
  color: string
  bg: string
  border: string
  badge: string
} {
  if (zscore <= -5) return {
    label: 'Crítico',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    badge: 'bg-red-400/20 text-red-300',
  }
  if (zscore <= -3) return {
    label: 'Alto',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    badge: 'bg-orange-400/20 text-orange-300',
  }
  return {
    label: 'Moderado',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    badge: 'bg-yellow-400/20 text-yellow-300',
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function getAlertTypeLabel(type: string): string {
  const map: Record<string, string> = {
    queda_global: 'Queda Global',
    queda_pontos: 'Queda em Pontos',
    queda_rebotes: 'Queda em Rebotes',
    queda_assistencias: 'Queda em Assistências',
    queda_minutos: 'Queda em Minutos',
  }
  return map[type] ?? type
}
