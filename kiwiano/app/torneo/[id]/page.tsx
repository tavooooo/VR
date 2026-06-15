'use client'
import { useParams } from 'next/navigation'
import { useKiwianoStore } from '@/lib/store'
import { CardDrawScreen } from '@/components/draw/CardDrawScreen'
import { RoundView } from '@/components/round/RoundView'
import { FinalResults } from '@/components/results/FinalResults'
import { MatchResult } from '@/app/types'
import Link from 'next/link'

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>()
  const { getTournament, startTournament, submitResult, advanceRound, finishTournament } = useKiwianoStore()
  const tournament = getTournament(id)

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Torneo no encontrado</p>
          <Link href="/" className="text-green-400 hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    )
  }

  if (tournament.status === 'draw') {
    return (
      <CardDrawScreen
        tournament={tournament}
        onStart={() => startTournament(tournament.id)}
      />
    )
  }

  if (tournament.status === 'finished') {
    return <FinalResults tournament={tournament} />
  }

  const handleSubmitResult = (roundNum: number, matchId: string, result: MatchResult) => {
    submitResult(tournament.id, roundNum, matchId, result)
  }

  const handleNextRound = () => {
    advanceRound(tournament.id)
  }

  const handleFinish = () => {
    finishTournament(tournament.id)
  }

  return (
    <RoundView
      tournament={tournament}
      onSubmitResult={handleSubmitResult}
      onNextRound={handleNextRound}
      onFinish={handleFinish}
    />
  )
}
