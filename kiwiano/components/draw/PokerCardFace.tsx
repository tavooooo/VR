'use client'
import { motion } from 'framer-motion'
import { PokerCard } from '@/app/types'
import { suitSymbol, suitColor } from '@/lib/cards'

interface Props {
  card: PokerCard
  revealed?: boolean
  delay?: number
  small?: boolean
}

export function PokerCardFace({ card, revealed = true, delay = 0, small = false }: Props) {
  const color = suitColor(card.suit)
  const symbol = suitSymbol(card.suit)
  const value = String(card.value)
  const size = small ? 'w-16 h-24' : 'w-24 h-36'
  const textSize = small ? 'text-sm' : 'text-lg'
  const bigSize = small ? 'text-2xl' : 'text-4xl'

  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0, scale: 0.5 }}
      animate={revealed ? { rotateY: 0, opacity: 1, scale: 1 } : { rotateY: 180, opacity: 0.5, scale: 0.8 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 120 }}
      className={`${size} bg-white rounded-xl shadow-2xl border-2 border-gray-200 flex flex-col justify-between p-2 select-none`}
      style={{ perspective: 800 }}
    >
      <div className={`${textSize} font-bold leading-none`} style={{ color }}>
        <div>{value}</div>
        <div>{symbol}</div>
      </div>
      <div className={`${bigSize} text-center font-bold`} style={{ color }}>
        {symbol}
      </div>
      <div className={`${textSize} font-bold leading-none text-right rotate-180`} style={{ color }}>
        <div>{value}</div>
        <div>{symbol}</div>
      </div>
    </motion.div>
  )
}

export function PokerCardBack({ small = false }: { small?: boolean }) {
  const size = small ? 'w-16 h-24' : 'w-24 h-36'
  return (
    <div
      className={`${size} rounded-xl shadow-2xl border-2 border-green-700 flex items-center justify-center`}
      style={{
        background: 'repeating-linear-gradient(45deg, #166534 0px, #166534 4px, #15803d 4px, #15803d 8px)',
      }}
    >
      <div className="w-3/4 h-3/4 border-2 border-green-400 rounded-lg opacity-50" />
    </div>
  )
}
