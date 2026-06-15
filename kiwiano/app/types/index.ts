export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'A'

export interface PokerCard {
  suit: Suit
  value: CardValue
  pairSuit: Suit // the matching suit that forms a pair
}

export interface PlayerStats {
  totalPoints: number
  tournamentsPlayed: number
  matchesWon: number
  matchesLost: number
  gamesWon: number
  gamesLost: number
}

export interface Player {
  id: string
  name: string
  color: string // avatar color
  stats: PlayerStats
}

export interface CardAssignment {
  playerId: string
  card: PokerCard
  partnerId: string
}

export interface MatchResult {
  scoreA: number
  scoreB: number
  winner: 'A' | 'B'
}

export interface Match {
  id: string
  court: number
  teamA: [string, string] // Player IDs
  teamB: [string, string] // Player IDs
  result?: MatchResult
  status: 'pending' | 'finished'
}

export type RoundType = 'initial' | 'winners' | 'losers' | 'final'

export interface Round {
  number: number
  type: RoundType
  matches: Match[]
  status: 'pending' | 'in_progress' | 'finished'
}

export interface Tournament {
  id: string
  name: string
  date: string
  courts: number
  players: Player[]
  cardAssignments: CardAssignment[]
  rounds: Round[]
  status: 'setup' | 'draw' | 'in_progress' | 'finished'
  finalRankings?: { playerId: string; points: number; position: number }[]
}

export interface GlobalPlayer {
  id: string
  name: string
  color: string
  stats: PlayerStats
  tournamentHistory: { tournamentId: string; points: number; position: number }[]
}

export interface AppState {
  tournaments: Tournament[]
  globalPlayers: GlobalPlayer[]
}
