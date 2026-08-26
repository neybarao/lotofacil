import { calculateAggregateStats, calculateNumberStats, drawMetrics } from './statistics'
import type { BacktestResult, Draw, GeneratedGame } from './types'

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function sampleGame(random: () => number): number[] {
  const pool = Array.from({ length: 25 }, (_, index) => index + 1)
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[pool[index], pool[target]] = [pool[target], pool[index]]
  }
  return pool.slice(0, 15).sort((a, b) => a - b)
}

export function generateGames(draws: Draw[], count = 5, seed = Date.now()): GeneratedGame[] {
  if (!draws.length) return []
  const numberStats = calculateNumberStats(draws)
  const aggregate = calculateAggregateStats(draws)
  const previous = draws.at(-1)?.b
  const random = seededRandom(seed)
  const candidates = new Map<string, GeneratedGame>()
  const targetPool = Math.max(2500, count * 800)

  for (let index = 0; index < targetPool; index += 1) {
    const numbers = sampleGame(random)
    const metrics = drawMetrics(numbers, previous)
    const rowSpread = metrics.rows.every((value) => value >= 2 && value <= 4)
    const columnSpread = metrics.columns.every((value) => value >= 2 && value <= 4)

    if (![7, 8].includes(metrics.odd) || metrics.longestSequence > 5 || !rowSpread || !columnSpread) continue

    const frequencyScore = numbers.reduce((total, number) => total + numberStats[number - 1].percentage, 0) / 15
    const delayPenalty = numbers.reduce((total, number) => total + Math.max(0, numberStats[number - 1].delay - 8), 0)
    const balancePenalty =
      Math.abs(metrics.sum - aggregate.meanSum) * 0.65 +
      Math.abs(metrics.frame - aggregate.meanFrame) * 5 +
      Math.abs(metrics.repeated - aggregate.meanRepeated) * 4 +
      delayPenalty * 0.8
    const score = frequencyScore - balancePenalty
    candidates.set(numbers.join('-'), { numbers, metrics, score })
  }

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

export function runBacktest(draws: Draw[], targetContest: number): BacktestResult | null {
  const targetIndex = draws.findIndex((draw) => draw.n === targetContest)
  if (targetIndex < 1) return null
  const history = draws.slice(0, targetIndex)
  const target = draws[targetIndex]
  const targetSet = new Set(target.b)
  const games = generateGames(history, 5, target.n * 7919).map((game) => ({
    ...game,
    hits: game.numbers.filter((number) => targetSet.has(number)).length,
  }))
  return { target, games, analysisSize: history.length }
}
