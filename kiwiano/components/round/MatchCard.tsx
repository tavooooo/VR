'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Match, Player, MatchResult } from '@/app/types'
import { PlayerAvatar } from '../ui/PlayerAvatar'

interface Props {
  match: Match
  players: Player[]
  onSubmit: (result: MatchResult) => void
  index: number
}

export function MatchCard({ match, players, onSubmit, index }: Props) {
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [submitted, setSubmitted] = useState(!!match.result)

  const getPlayer = (id: string) => players.find((p) => p.id === id)!

  const teamA = match.teamA.map(getPlayer)
  const teamB = match.teamB.map(getPlayer)

  const handleSubmit = () => {
    const sA = parseInt(scoreA)
    const sB = parseInt(scoreB)
    if (isNaN(sA) || isNaN(sB) || sA === sB) return
    const result: MatchResult = {
      scoreA: sA,
      scoreB: sB,
      winner: sA > sB ? 'A' : 'B',
    }
    onSubmit(result)
    setSubmitted(true)
  }

  const result = match.result

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-gray-900 border rounded-xl p-5 ${
        submitted ? 'border-green-700' : 'border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="bg-green-800 text-green-300 text-xs font-bold px-2 py-1 rounded-full">
          Cancha {match.court}
        </span>
        {submitted && (
          <span className="text-xs text-green-400 font-semibold">✓ Resultado registrado</span>
        )}
      </div>

      <div className="flex items-stretch gap-3">
        {/* Team A */}
        <div className="flex-1">
          <div className="flex flex-col gap-2">
            {teamA.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <PlayerAvatar name={p.name} color={p.color} size="sm" />
                <span className="text-white text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
          {result && (
            <div className={`mt-3 text-3xl font-bold ${result.winner === 'A' ? 'text-yellow-400' : 'text-gray-500'}`}>
              {result.scoreA}
              {result.winner === 'A' && <span className="ml-1 text-base">🏆</span>}
            </div>
          )}
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center w-8">
          <span className="text-gray-600 font-bold text-sm">VS</span>
        </div>

        {/* Team B */}
        <div className="flex-1 text-right">
          <div className="flex flex-col gap-2 items-end">
            {teamB.map((p) => (
              <div key={p.id} className="flex items-center gap-2 flex-row-reverse">
                <PlayerAvatar name={p.name} color={p.color} size="sm" />
                <span className="text-white text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
          {result && (
            <div className={`mt-3 text-3xl font-bold ${result.winner === 'B' ? 'text-yellow-400' : 'text-gray-500'}`}>
              {result.scoreB}
              {result.winner === 'B' && <span className="mr-1 text-base">🏆</span>}
            </div>
          )}
        </div>
      </div>

      {/* Score input */}
      {!submitted && (
        <div className="mt-5 flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={99}
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            placeholder="Games A"
            className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none focus:border-green-500"
          />
          <span className="text-gray-500 font-bold">-</span>
          <input
            type="number"
            min={0}
            max={99}
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            placeholder="Games B"
            className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!scoreA || !scoreB || scoreA === scoreB}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-lg transition"
          >
            OK
          </button>
        </div>
      )}
      {!submitted && scoreA === scoreB && scoreA !== '' && (
        <p className="text-red-400 text-xs mt-1">El resultado no puede ser empate</p>
      )}
    </motion.div>
  )
}
