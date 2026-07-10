'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Tournament, MatchResult } from '@/app/types'
import { MatchCard } from './MatchCard'
import { ScoreBoard } from '../scores/ScoreBoard'
import { computeTournamentRankings } from '@/lib/tournament'

interface Props {
  tournament: Tournament
  onSubmitResult: (roundNum: number, matchId: string, result: MatchResult) => void
  onNextRound: () => void
  onFinish: () => void
}

export function RoundView({ tournament, onSubmitResult, onNextRound, onFinish }: Props) {
  const currentRound = tournament.rounds[tournament.rounds.length - 1]
  const allDone = currentRound.matches.every((m) => m.status === 'finished')
  const rankings = computeTournamentRankings(tournament)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-green-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
            <p className="text-green-400 text-sm">
              Ronda {currentRound.number} • {tournament.courts} cancha{tournament.courts > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {tournament.rounds.map((r) => (
              <div
                key={r.number}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  r.number < currentRound.number
                    ? 'bg-green-600 text-white'
                    : r.number === currentRound.number
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {r.number}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Matches */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-yellow-400 mb-3">
              🎾 Partidos — Ronda {currentRound.number}
            </h2>
            {currentRound.matches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                players={tournament.players}
                index={i}
                onSubmit={(result) => onSubmitResult(currentRound.number, match.id, result)}
              />
            ))}

            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 pt-2"
                >
                  <button
                    onClick={onNextRound}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition text-lg"
                  >
                    ➡ Siguiente ronda
                  </button>
                  <button
                    onClick={onFinish}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition text-lg"
                  >
                    🏁 Finalizar torneo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scoreboard */}
          <div>
            <ScoreBoard rankings={rankings} players={tournament.players} />
          </div>
        </div>
      </div>
    </div>
  )
}
