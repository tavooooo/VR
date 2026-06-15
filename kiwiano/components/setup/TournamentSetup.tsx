'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onCreate: (name: string, players: string[], courts: number) => void
}

export function TournamentSetup({ onCreate }: Props) {
  const [step, setStep] = useState<'config' | 'players'>('config')
  const [name, setName] = useState(`Torneo Kiwiano ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`)
  const [numPlayers, setNumPlayers] = useState(8)
  const [courts, setCourts] = useState(2)
  const [playerNames, setPlayerNames] = useState<string[]>(Array(8).fill(''))

  const handleNumChange = (n: number) => {
    if (n < 4 || n % 2 !== 0) return
    setNumPlayers(n)
    setPlayerNames((prev) => {
      const next = [...prev]
      while (next.length < n) next.push('')
      return next.slice(0, n)
    })
  }

  const handlePlayerName = (i: number, val: string) => {
    setPlayerNames((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  const canProceed = playerNames.slice(0, numPlayers).every((n) => n.trim().length > 0)

  const handleCreate = () => {
    if (!canProceed) return
    onCreate(name, playerNames.slice(0, numPlayers), courts)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">🥝</div>
          <h1 className="text-4xl font-bold text-green-400 tracking-tight">KIWIANO</h1>
          <p className="text-gray-400 mt-1">Torneos de Pádel</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-5"
        >
          {step === 'config' && (
            <>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1">Nombre del torneo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium block mb-2">
                  Número de participantes
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNumChange(numPlayers - 2)}
                    disabled={numPlayers <= 4}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-lg font-bold text-lg transition"
                  >
                    −
                  </button>
                  <span className="text-white text-2xl font-bold w-12 text-center">{numPlayers}</span>
                  <button
                    onClick={() => handleNumChange(numPlayers + 2)}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-lg transition"
                  >
                    +
                  </button>
                  <span className="text-gray-500 text-sm ml-1">jugadores (mínimo 4, múltiplos de 2)</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium block mb-2">
                  Número de canchas
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCourts(n)}
                      className={`flex-1 py-2 rounded-lg font-bold transition ${
                        courts === n
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('players')}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition text-lg mt-2"
              >
                Ingresar jugadores →
              </button>
            </>
          )}

          {step === 'players' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setStep('config')}
                  className="text-gray-400 hover:text-white text-sm transition"
                >
                  ← Volver
                </button>
                <h2 className="text-white font-bold">Nombres de los {numPlayers} jugadores</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        background: [
                          '#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6',
                          '#06b6d4','#f97316','#ec4899','#10b981','#6366f1',
                          '#84cc16','#14b8a6','#a855f7','#0ea5e9','#fb923c','#e11d48',
                        ][i % 16],
                      }}
                    >
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={playerNames[i] ?? ''}
                      onChange={(e) => handlePlayerName(i, e.target.value)}
                      placeholder={`Jugador ${i + 1}`}
                      className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleCreate}
                disabled={!canProceed}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition text-lg mt-2"
              >
                🎴 ¡Sortear parejas!
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
