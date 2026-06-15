'use client'
import { motion } from 'framer-motion'
import { Tournament } from '@/app/types'
import { PlayerAvatar } from '../ui/PlayerAvatar'
import Link from 'next/link'

interface Props {
  tournament: Tournament
}

export function FinalResults({ tournament }: Props) {
  const { finalRankings, players } = tournament
  if (!finalRankings) return null

  const top3 = finalRankings.slice(0, 3)
  const rest = finalRankings.slice(3)

  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumHeights = [top3[1] ? 'h-28' : '', 'h-36', top3[2] ? 'h-20' : '']
  const podiumPositions = [2, 1, 3]

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-950 to-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-yellow-400 mb-1">¡Torneo Finalizado!</h1>
          <p className="text-gray-400">{tournament.name}</p>
        </motion.div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {podiumOrder.map((r, i) => {
            if (!r) return <div key={i} className="w-24" />
            const player = players.find((p) => p.id === r.playerId)!
            const heights = [podiumHeights[0], podiumHeights[1], podiumHeights[2]]
            const pos = podiumPositions[i]
            const medals = ['🥈', '🥇', '🥉']
            return (
              <motion.div
                key={r.playerId}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 + 0.3, type: 'spring' }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl mb-1">{medals[i]}</span>
                <PlayerAvatar name={player.name} color={player.color} size="lg" />
                <p className="text-white font-bold text-sm mt-2 text-center max-w-[80px] truncate">
                  {player.name}
                </p>
                <p className="text-green-400 text-xs font-bold">{r.points} pts</p>
                <div
                  className={`w-24 ${heights[i]} rounded-t-lg mt-2 flex items-center justify-center`}
                  style={{
                    background: pos === 1 ? '#b45309' : pos === 2 ? '#6b7280' : '#92400e',
                  }}
                >
                  <span className="text-white font-bold text-2xl">{pos}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Full table */}
        <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-white font-bold">Clasificación final</h2>
          </div>
          {finalRankings.map(({ playerId, points, position }, i) => {
            const player = players.find((p) => p.id === playerId)!
            return (
              <motion.div
                key={playerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.6 }}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 last:border-0"
              >
                <span className="text-gray-400 font-bold w-6 text-sm">{position}</span>
                <PlayerAvatar name={player.name} color={player.color} size="sm" />
                <span className="text-white flex-1">{player.name}</span>
                <span className="text-green-400 font-bold">{points} pts</span>
              </motion.div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-center transition"
          >
            Nuevo torneo
          </Link>
          <Link
            href="/historial"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl text-center transition"
          >
            Ver historial
          </Link>
        </div>
      </div>
    </div>
  )
}
