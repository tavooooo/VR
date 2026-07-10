'use client'
import { motion } from 'framer-motion'
import { Player } from '@/app/types'
import { PlayerAvatar } from '../ui/PlayerAvatar'

interface Props {
  rankings: { playerId: string; points: number; position: number }[]
  players: Player[]
}

export function ScoreBoard({ rankings, players }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wide mb-3">
        🏅 Puntaje actual
      </h3>
      <div className="space-y-2">
        {rankings.map(({ playerId, points, position }, i) => {
          const player = players.find((p) => p.id === playerId)
          if (!player) return null
          const medals = ['🥇', '🥈', '🥉']
          return (
            <motion.div
              key={playerId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-base w-6 text-center">
                {medals[position - 1] || <span className="text-gray-500 text-sm">{position}</span>}
              </span>
              <PlayerAvatar name={player.name} color={player.color} size="sm" />
              <span className="text-white text-sm flex-1 truncate">{player.name}</span>
              <span className="text-green-400 font-bold text-sm">{points} pts</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
