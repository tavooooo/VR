import { Tournament, Round, Match, Player, CardAssignment, MatchResult } from '@/app/types'
import { assignCards, shuffle } from './cards'

const AVATAR_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#10b981', '#6366f1',
  '#84cc16', '#14b8a6', '#a855f7', '#0ea5e9', '#fb923c',
  '#e11d48',
]

export function createPlayer(name: string, index: number): Player {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    stats: {
      totalPoints: 0,
      tournamentsPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesWon: 0,
      gamesLost: 0,
    },
  }
}

export function createTournament(
  name: string,
  playerNames: string[],
  courts: number
): Tournament {
  const players = playerNames.map((n, i) => createPlayer(n, i))
  const cardAssignments = assignCards(players.map((p) => p.id))
  const firstRound = buildFirstRound(players, cardAssignments, courts)

  return {
    id: crypto.randomUUID(),
    name,
    date: new Date().toISOString(),
    courts,
    players,
    cardAssignments,
    rounds: [firstRound],
    status: 'draw',
  }
}

function buildFirstRound(
  players: Player[],
  assignments: CardAssignment[],
  courts: number
): Round {
  // Group players into pairs by card pairing
  const pairs: [string, string][] = []
  const seen = new Set<string>()
  for (const a of assignments) {
    if (!seen.has(a.playerId)) {
      seen.add(a.playerId)
      seen.add(a.partnerId)
      pairs.push([a.playerId, a.partnerId])
    }
  }

  // Shuffle pairs to randomize match order
  const shuffledPairs = shuffle(pairs)
  const matches = buildMatches(shuffledPairs, courts)

  return {
    number: 1,
    type: 'initial',
    matches,
    status: 'in_progress',
  }
}

function buildMatches(pairs: [string, string][], courts: number): Match[] {
  const matches: Match[] = []
  // Every two pairs form one match
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const court = (matches.length % courts) + 1
    matches.push({
      id: crypto.randomUUID(),
      court,
      teamA: pairs[i],
      teamB: pairs[i + 1],
      status: 'pending',
    })
  }
  return matches
}

// After all matches in a round are done, compute next round
// Winners play winners (new random pairs from the 4 winners)
// Losers play losers (new random pairs from the 4 losers)
export function buildNextRound(tournament: Tournament): Round | null {
  const currentRound = tournament.rounds[tournament.rounds.length - 1]
  if (currentRound.status !== 'finished') return null
  if (!currentRound.matches.every((m) => m.result)) return null

  // Group matches into clusters of 2 (each cluster produces a winners match + losers match)
  // For general N courts, group matches in pairs
  const matches = currentRound.matches
  const newMatches: Match[] = []

  for (let i = 0; i + 1 < matches.length; i += 2) {
    const matchA = matches[i]
    const matchB = matches[i + 1]

    const winnersA = getWinners(matchA)
    const losersA = getLosers(matchA)
    const winnersB = getWinners(matchB)
    const losersB = getLosers(matchB)

    // Pool the 4 winners and randomly form 2 new pairs
    const winnerPairs = randomPairs([...winnersA, ...winnersB])
    // Pool the 4 losers and randomly form 2 new pairs
    const loserPairs = randomPairs([...losersA, ...losersB])

    const courtBase = newMatches.length % tournament.courts
    newMatches.push({
      id: crypto.randomUUID(),
      court: courtBase + 1,
      teamA: winnerPairs[0],
      teamB: winnerPairs[1],
      status: 'pending',
    })
    newMatches.push({
      id: crypto.randomUUID(),
      court: ((courtBase + 1) % tournament.courts) + 1,
      teamA: loserPairs[0],
      teamB: loserPairs[1],
      status: 'pending',
    })
  }

  const roundNum = currentRound.number + 1
  return {
    number: roundNum,
    type: 'winners',
    matches: newMatches,
    status: 'in_progress',
  }
}

// From 4 players, randomly form 2 pairs that play against each other
function randomPairs(players: string[]): [[string, string], [string, string]] {
  const [p1, p2, p3, p4] = shuffle(players)
  // One valid random shuffle is enough; prevent same partners repeating if possible
  return [[p1, p2], [p3, p4]]
}

function getWinners(match: Match): [string, string] {
  if (!match.result) return match.teamA
  return match.result.winner === 'A' ? match.teamA : match.teamB
}

function getLosers(match: Match): [string, string] {
  if (!match.result) return match.teamB
  return match.result.winner === 'A' ? match.teamB : match.teamA
}

// Points: +1 per game won, +3 bonus for match win
export function computePointsForResult(result: MatchResult): {
  teamAPoints: number
  teamBPoints: number
} {
  const WIN_BONUS = 3
  const teamAPoints = result.scoreA + (result.winner === 'A' ? WIN_BONUS : 0)
  const teamBPoints = result.scoreB + (result.winner === 'B' ? WIN_BONUS : 0)
  return { teamAPoints, teamBPoints }
}

// Compute individual point totals for a tournament
export function computeTournamentRankings(
  tournament: Tournament
): { playerId: string; points: number; position: number }[] {
  const pointsMap = new Map<string, number>()
  tournament.players.forEach((p) => pointsMap.set(p.id, 0))

  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if (!match.result) continue
      const { teamAPoints, teamBPoints } = computePointsForResult(match.result)
      match.teamA.forEach((id) => pointsMap.set(id, (pointsMap.get(id) ?? 0) + teamAPoints))
      match.teamB.forEach((id) => pointsMap.set(id, (pointsMap.get(id) ?? 0) + teamBPoints))
    }
  }

  const sorted = Array.from(pointsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([playerId, points], i) => ({ playerId, points, position: i + 1 }))

  return sorted
}

export function isRoundComplete(round: Round): boolean {
  return round.matches.every((m) => m.status === 'finished')
}
