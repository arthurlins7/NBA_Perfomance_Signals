const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export interface Alert {
  player_id: string
  player_name: string
  team_id?: string
  team_abbreviation: string
  game_date: string
  pts: number
  reb: number
  ast: number
  global_zscore: number
  alert_type: string
  pts_zscore?: number
  reb_zscore?: number
  ast_zscore?: number
  min_zscore?: number
  avg_pts?: number
  avg_reb?: number
  avg_ast?: number
  avg_min?: number
}

export interface GameLog {
  id: number
  game_date: string
  wl: string
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
  fg_pct: number
  min: number
  plus_minus: number
  global_zscore: number
  team_abbreviation: string
  against: string
  home_game: boolean
}

export interface Player {
  player_id: string
  player_name: string
  team_abbreviation: string
}

export async function getGlobalAlerts(limit = 50): Promise<Alert[]> {
  const res = await fetch(`${API_URL}/players/alerts?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar alertas globais')
  return res.json()
}

export async function getIsolatedAlerts(limit = 50): Promise<Alert[]> {
  const res = await fetch(`${API_URL}/players/alerts/isolated?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar alertas isolados')
  return res.json()
}

export async function getPlayerHistory(playerId: string, limit = 20): Promise<GameLog[]> {
  const res = await fetch(`${API_URL}/players/${playerId}/history?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar histórico')
  return res.json()
}

export async function getPlayerAlerts(playerId: string): Promise<Alert[]> {
  const res = await fetch(`${API_URL}/players/${playerId}/alerts`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar alertas do jogador')
  return res.json()
}

export async function getTeamAlerts(teamAbbr: string): Promise<Alert[]> {
  const res = await fetch(`${API_URL}/teams/${teamAbbr}/alerts`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar alertas do time')
  return res.json()
}

export async function getPlayers(): Promise<Player[]> {
  const res = await fetch(`${API_URL}/players/`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar jogadores')
  return res.json()
}
