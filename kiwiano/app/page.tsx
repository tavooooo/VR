'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TournamentSetup } from '@/components/setup/TournamentSetup'
import { useKiwianoStore } from '@/lib/store'
import Link from 'next/link'

export default function Home() {
  const [creating, setCreating] = useState(false)
  const { createTournament, tournaments } = useKiwianoStore()
  const router = useRouter()

  const handleCreate = (name: string, players: string[], courts: number) => {
    const tournament = createTournament(name, players, courts)
    router.push(`/torneo/${tournament.id}`)
  }

  if (creating) {
    return <TournamentSetup onCreate={handleCreate} />
  }

  const recentTournaments = [...tournaments].reverse().slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="text-7xl mb-4">🥝</div>
        <h1 className="text-5xl font-black text-green-400 tracking-tight">KIWIANO</h1>
        <p className="text-gray-400 mt-2 text-lg">Torneos de Pádel Mexicano</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-4"
      >
        <button
          onClick={() => setCreating(true)}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl text-xl transition shadow-lg shadow-green-900/40"
        >
          🎾 Nuevo Torneo
        </button>

        <Link
          href="/historial"
          className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-2xl text-xl transition text-center"
        >
          📋 Historial
        </Link>

        <Link
          href="/ranking"
          className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-2xl text-xl transition text-center"
        >
          🏆 Ranking Global
        </Link>
      </motion.div>

      {recentTournaments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 w-full max-w-sm"
        >
          <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">
            Torneos recientes
          </h2>
          <div className="space-y-2">
            {recentTournaments.map((t) => (
              <Link
                key={t.id}
                href={`/torneo/${t.id}`}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 transition"
              >
                <div>
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(t.date).toLocaleDateString('es-ES')} • {t.players.length} jugadores
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    t.status === 'finished'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-green-900 text-green-400'
                  }`}
                >
                  {t.status === 'finished' ? 'Finalizado' : 'En curso'}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
