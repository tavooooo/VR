'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tournament } from '@/app/types'
import { PokerCardFace, PokerCardBack } from './PokerCardFace'
import { PlayerAvatar } from '../ui/PlayerAvatar'
import { suitSymbol } from '@/lib/cards'

interface Props {
  tournament: Tournament
  onStart: () => void
}

export function CardDrawScreen({ tournament, onStart }: Props) {
  const [phase, setPhase] = useState<'deck' | 'dealing' | 'revealing' | 'pairs' | 'matches'>('deck')
  const [revealedCount, setRevealedCount] = useState(0)

  const { players, cardAssignments } = tournament

  useEffect(() => {
    if (phase === 'deck') {
      setTimeout(() => setPhase('dealing'), 1000)
    }
    if (phase === 'dealing') {
      setTimeout(() => setPhase('revealing'), 1500)
    }
    if (phase === 'revealing') {
      let count = 0
      const interval = setInterval(() => {
        count++
        setRevealedCount(count)
        if (count >= players.length) {
          clearInterval(interval)
          setTimeout(() => setPhase('pairs'), 800)
        }
      }, 300)
      return () => clearInterval(interval)
    }
  }, [phase, players.length])

  const getPlayerCard = (playerId: string) =>
    cardAssignments.find((a) => a.playerId === playerId)

  const getPairs = () => {
    const seen = new Set<string>()
    const pairs: { playerA: typeof players[0]; playerB: typeof players[0] }[] = []
    for (const a of cardAssignments) {
      if (seen.has(a.playerId)) continue
      seen.add(a.playerId)
      seen.add(a.partnerId)
      const playerA = players.find((p) => p.id === a.playerId)!
      const playerB = players.find((p) => p.id === a.partnerId)!
      pairs.push({ playerA, playerB })
    }
    return pairs
  }

  const getMatches = () => {
    const round = tournament.rounds[0]
    return round.matches.map((match) => ({
      match,
      teamA: match.teamA.map((id) => players.find((p) => p.id === id)!),
      teamB: match.teamB.map((id) => players.find((p) => p.id === id)!),
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-green-400 mb-2"
        >
          {tournament.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-400 mb-8"
        >
          {phase === 'deck' && '¡Preparando el mazo...'}
          {phase === 'dealing' && '¡Repartiendo cartas!'}
          {phase === 'revealing' && '¡Revelando cartas!'}
          {phase === 'pairs' && '¡Parejas formadas!'}
          {phase === 'matches' && '¡Cuadro de partidos listo!'}
        </motion.p>

        {/* Dealing phase — show player cards being revealed */}
        {(phase === 'revealing' || phase === 'pairs' || phase === 'matches') && phase !== 'matches' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {players.map((player, i) => {
              const assignment = getPlayerCard(player.id)
              const revealed = i < revealedCount
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <PlayerAvatar name={player.name} color={player.color} size="md" />
                  <p className="text-white font-semibold text-sm text-center">{player.name}</p>
                  {assignment && revealed ? (
                    <PokerCardFace card={assignment.card} revealed delay={0} />
                  ) : (
                    <PokerCardBack />
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pairs phase */}
        {phase === 'pairs' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h2 className="text-xl font-bold text-yellow-400 text-center mb-4">
              🎴 Parejas del sorteo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getPairs().map(({ playerA, playerB }, i) => {
                const cardA = getPlayerCard(playerA.id)?.card
                const cardB = getPlayerCard(playerB.id)?.card
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="bg-green-900/40 border border-green-700 rounded-xl p-4 flex items-center gap-3"
                  >
                    <span className="text-yellow-400 font-bold text-lg w-6">P{i + 1}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <PlayerAvatar name={playerA.name} color={playerA.color} size="sm" />
                      <span className="text-white text-sm font-medium">{playerA.name}</span>
                      {cardA && (
                        <PokerCardFace card={cardA} revealed small />
                      )}
                    </div>
                    <span className="text-green-400 font-bold">+</span>
                    <div className="flex items-center gap-2 flex-1">
                      <PlayerAvatar name={playerB.name} color={playerB.color} size="sm" />
                      <span className="text-white text-sm font-medium">{playerB.name}</span>
                      {cardB && (
                        <PokerCardFace card={cardB} revealed small />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPhase('matches')}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-lg transition"
              >
                Ver partidos de la Ronda 1 →
              </button>
            </div>
          </motion.div>
        )}

        {/* Matches phase */}
        {phase === 'matches' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
          >
            <h2 className="text-xl font-bold text-yellow-400 text-center mb-6">
              🎾 Ronda 1 — Partidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {getMatches().map(({ match, teamA, teamB }, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-900 border border-green-800 rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Cancha {match.court}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      {teamA.map((p) => (
                        <div key={p.id} className="flex items-center gap-1">
                          <PlayerAvatar name={p.name} color={p.color} size="sm" />
                          <span className="text-white text-sm">{p.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-yellow-400 font-bold text-lg">VS</div>
                    <div className="flex items-center gap-2">
                      {teamB.map((p) => (
                        <div key={p.id} className="flex items-center gap-1">
                          <PlayerAvatar name={p.name} color={p.color} size="sm" />
                          <span className="text-white text-sm">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={onStart}
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-4 rounded-xl text-xl transition shadow-lg shadow-green-900/40"
              >
                🎾 ¡Comenzar Torneo!
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
