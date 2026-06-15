'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useKiwianoStore } from '@/lib/store'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

export default function RankingPage() {
  const { globalPlayers } = useKiwianoStore()
  const sorted = [...globalPlayers].sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-green-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition">←</Link>
          <h1 className="text-2xl font-bold text-white">🏆 Ranking Global</h1>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-gray-400">Juega torneos para aparecer en el ranking.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((player, i) => {
              const position = i + 1
              const medals = ['🥇', '🥈', '🥉']
              const winRate = player.stats.matchesWon + player.stats.matchesLost > 0
                ? Math.round((player.stats.matchesWon / (player.stats.matchesWon + player.stats.matchesLost)) * 100)
                : 0
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4"
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">
                    {medals[position - 1] ?? <span className="text-gray-500 text-sm font-bold">{position}</span>}
                  </span>
                  <PlayerAvatar name={player.name} color={player.color} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{player.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {player.stats.tournamentsPlayed} torneo{player.stats.tournamentsPlayed !== 1 ? 's' : ''} •{' '}
                      {player.stats.matchesWon}W/{player.stats.matchesLost}L •{' '}
                      {winRate}% victorias
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 font-bold text-lg">{player.stats.totalPoints}</p>
                    <p className="text-gray-500 text-xs">puntos</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
