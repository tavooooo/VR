'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tournament, Match, MatchResult, GlobalPlayer } from '@/app/types'
import {
  createTournament,
  buildNextRound,
  computeTournamentRankings,
  isRoundComplete,
} from './tournament'

interface KiwianoStore {
  tournaments: Tournament[]
  globalPlayers: GlobalPlayer[]

  createTournament: (name: string, playerNames: string[], courts: number) => Tournament
  startTournament: (id: string) => void
  submitResult: (tournamentId: string, roundNum: number, matchId: string, result: MatchResult) => void
  advanceRound: (tournamentId: string) => void
  finishTournament: (tournamentId: string) => void
  getTournament: (id: string) => Tournament | undefined
}

export const useKiwianoStore = create<KiwianoStore>()(
  persist(
    (set, get) => ({
      tournaments: [],
      globalPlayers: [],

      createTournament: (name, playerNames, courts) => {
        const tournament = createTournament(name, playerNames, courts)
        set((s) => ({ tournaments: [...s.tournaments, tournament] }))
        return tournament
      },

      startTournament: (id) => {
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === id ? { ...t, status: 'in_progress' } : t
          ),
        }))
      },

      submitResult: (tournamentId, roundNum, matchId, result) => {
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tournamentId) return t
            const rounds = t.rounds.map((r) => {
              if (r.number !== roundNum) return r
              const matches = r.matches.map((m) => {
                if (m.id !== matchId) return m
                return { ...m, result, status: 'finished' as const }
              })
              const allDone = matches.every((m) => m.status === 'finished')
              return { ...r, matches, status: allDone ? ('finished' as const) : r.status }
            })
            return { ...t, rounds }
          }),
        }))
      },

      advanceRound: (tournamentId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId)
        if (!tournament) return
        const nextRound = buildNextRound(tournament)
        if (!nextRound) return
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id !== tournamentId ? t : { ...t, rounds: [...t.rounds, nextRound] }
          ),
        }))
      },

      finishTournament: (tournamentId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId)
        if (!tournament) return
        const rankings = computeTournamentRankings(tournament)

        // Update global players
        const updatedGlobalPlayers = [...get().globalPlayers]
        for (const { playerId, points, position } of rankings) {
          const player = tournament.players.find((p) => p.id === playerId)
          if (!player) continue

          // Find or compute per-player game stats from tournament
          let gamesWon = 0
          let gamesLost = 0
          let matchesWon = 0
          let matchesLost = 0
          for (const round of tournament.rounds) {
            for (const match of round.matches) {
              if (!match.result) continue
              const inA = match.teamA.includes(playerId)
              const inB = match.teamB.includes(playerId)
              if (inA) {
                gamesWon += match.result.scoreA
                gamesLost += match.result.scoreB
                if (match.result.winner === 'A') matchesWon++
                else matchesLost++
              } else if (inB) {
                gamesWon += match.result.scoreB
                gamesLost += match.result.scoreA
                if (match.result.winner === 'B') matchesWon++
                else matchesLost++
              }
            }
          }

          const existingIdx = updatedGlobalPlayers.findIndex((gp) => gp.name === player.name)
          if (existingIdx >= 0) {
            const existing = updatedGlobalPlayers[existingIdx]
            updatedGlobalPlayers[existingIdx] = {
              ...existing,
              stats: {
                totalPoints: existing.stats.totalPoints + points,
                tournamentsPlayed: existing.stats.tournamentsPlayed + 1,
                matchesWon: existing.stats.matchesWon + matchesWon,
                matchesLost: existing.stats.matchesLost + matchesLost,
                gamesWon: existing.stats.gamesWon + gamesWon,
                gamesLost: existing.stats.gamesLost + gamesLost,
              },
              tournamentHistory: [
                ...existing.tournamentHistory,
                { tournamentId, points, position },
              ],
            }
          } else {
            updatedGlobalPlayers.push({
              id: player.id,
              name: player.name,
              color: player.color,
              stats: {
                totalPoints: points,
                tournamentsPlayed: 1,
                matchesWon,
                matchesLost,
                gamesWon,
                gamesLost,
              },
              tournamentHistory: [{ tournamentId, points, position }],
            })
          }
        }

        set((s) => ({
          globalPlayers: updatedGlobalPlayers,
          tournaments: s.tournaments.map((t) =>
            t.id !== tournamentId
              ? t
              : { ...t, status: 'finished', finalRankings: rankings }
          ),
        }))
      },

      getTournament: (id) => get().tournaments.find((t) => t.id === id),
    }),
    { name: 'kiwiano-storage' }
  )
)
