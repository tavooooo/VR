'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useKiwianoStore } from '@/lib/store'

export default function HistorialPage() {
  const { tournaments } = useKiwianoStore()
  const sorted = [...tournaments].reverse()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-green-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition">←</Link>
          <h1 className="text-2xl font-bold text-white">Historial de Torneos</h1>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎾</div>
            <p className="text-gray-400">No hay torneos aún. ¡Crea el primero!</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Nuevo Torneo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((t, i) => {
              const topPlayer = t.finalRankings?.[0]
                ? t.players.find((p) => p.id === t.finalRankings![0].playerId)
                : null
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/torneo/${t.id}`}
                    className="block bg-gray-900 border border-gray-700 hover:border-green-700 rounded-xl p-5 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-white font-bold">{t.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(t.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                          <span>👤 {t.players.length} jugadores</span>
                          <span>🎾 {t.courts} cancha{t.courts > 1 ? 's' : ''}</span>
                          <span>📋 {t.rounds.length} rondas</span>
                        </div>
                        {topPlayer && (
                          <p className="mt-2 text-yellow-400 text-sm">
                            🥇 Ganador: {topPlayer.name} ({t.finalRankings![0].points} pts)
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                          t.status === 'finished'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-green-900 text-green-400'
                        }`}
                      >
                        {t.status === 'finished' ? 'Finalizado' : 'En curso'}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
