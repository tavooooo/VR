import { PokerCard, Suit, CardValue } from '@/app/types'

// Pairs: hearts<->diamonds (red), clubs<->spades (black)
const PAIR_MAP: Record<Suit, Suit> = {
  hearts: 'diamonds',
  diamonds: 'hearts',
  clubs: 'spades',
  spades: 'clubs',
}

const VALUES: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A']

export function buildDeck(): PokerCard[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const deck: PokerCard[] = []
  for (const suit of suits) {
    for (const value of VALUES) {
      deck.push({ suit, value, pairSuit: PAIR_MAP[suit] })
    }
  }
  return deck
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Returns pairs of cards [cardA, cardB] where cardA.pairSuit === cardB.suit
// Number of pairs needed = numPlayers / 2
export function drawCardPairs(numPlayers: number): [PokerCard, PokerCard][] {
  const numPairs = numPlayers / 2
  const deck = buildDeck()

  // Pick `numPairs` values to use
  const values = shuffle(VALUES).slice(0, numPairs)

  const pairs: [PokerCard, PokerCard][] = values.map((value) => {
    // Use hearts + diamonds as the pairing suits (red pair)
    // For more than 13 pairs we'd need black suits too, but 13 covers up to 26 players
    const cardA: PokerCard = { suit: 'hearts', value, pairSuit: 'diamonds' }
    const cardB: PokerCard = { suit: 'diamonds', value, pairSuit: 'hearts' }
    return [cardA, cardB]
  })

  return pairs
}

// Assigns cards to players and returns card assignments with partner info
export function assignCards(playerIds: string[]): {
  playerId: string
  card: PokerCard
  partnerId: string
}[] {
  const numPlayers = playerIds.length
  const shuffledPlayers = shuffle(playerIds)
  const pairs = drawCardPairs(numPlayers)

  const assignments: { playerId: string; card: PokerCard; partnerId: string }[] = []

  pairs.forEach(([cardA, cardB], i) => {
    const playerA = shuffledPlayers[i * 2]
    const playerB = shuffledPlayers[i * 2 + 1]
    assignments.push({ playerId: playerA, card: cardA, partnerId: playerB })
    assignments.push({ playerId: playerB, card: cardB, partnerId: playerA })
  })

  return assignments
}

export function cardLabel(card: PokerCard): string {
  return `${card.value}${suitSymbol(card.suit)}`
}

export function suitSymbol(suit: Suit): string {
  return { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[suit]
}

export function suitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? '#ef4444' : '#1f2937'
}
