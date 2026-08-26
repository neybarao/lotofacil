import type { AggregateStats, Draw, DrawMetrics, HistogramBin, NumberStat } from './types'

export const FRAME_NUMBERS = new Set([
  1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25,
])

export const CENTER_NUMBERS = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19])

export function getSequences(numbers: number[]): number[][] {
  const sorted = [...numbers].sort((a, b) => a - b)
  const sequences: number[][] = []
  let current = [sorted[0]]

  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === sorted[index - 1] + 1) current.push(sorted[index])
    else {
      if (current.length > 1) sequences.push(current)
      current = [sorted[index]]
    }
  }
  if (current.length > 1) sequences.push(current)
  return sequences
}

export function drawMetrics(numbers: number[], previous?: number[]): DrawMetrics {
  const rows = Array(5).fill(0) as number[]
  const columns = Array(5).fill(0) as number[]
  const previousSet = new Set(previous ?? [])

  numbers.forEach((number) => {
    rows[Math.floor((number - 1) / 5)] += 1
    columns[(number - 1) % 5] += 1
  })

  const sequences = getSequences(numbers)
  const odd = numbers.filter((number) => number % 2 !== 0).length
  const frame = numbers.filter((number) => FRAME_NUMBERS.has(number)).length

  return {
    odd,
    even: numbers.length - odd,
    sum: numbers.reduce((total, number) => total + number, 0),
    frame,
    center: numbers.length - frame,
    rows,
    columns,
    repeated: numbers.filter((number) => previousSet.has(number)).length,
    longestSequence: Math.max(1, ...sequences.map((sequence) => sequence.length)),
    sequences,
  }
}

export function calculateNumberStats(draws: Draw[]): NumberStat[] {
  const latestFirst = [...draws].reverse()
  return Array.from({ length: 25 }, (_, index) => {
    const number = index + 1
    const appearances: number[] = []
    draws.forEach((draw, drawIndex) => {
      if (draw.b.includes(number)) appearances.push(drawIndex)
    })

    const latestAppearance = latestFirst.findIndex((draw) => draw.b.includes(number))
    let maxDelay = appearances[0] ?? 0
    for (let i = 1; i < appearances.length; i += 1) {
      maxDelay = Math.max(maxDelay, appearances[i] - appearances[i - 1] - 1)
    }
    if (appearances.length) {
      maxDelay = Math.max(maxDelay, draws.length - 1 - appearances.at(-1)!)
    }

    return {
      number,
      frequency: appearances.length,
      percentage: draws.length ? (appearances.length / draws.length) * 100 : 0,
      delay: latestAppearance < 0 ? draws.length : latestAppearance,
      maxDelay,
    }
  })
}

function histogram(values: number[], start: number, end: number, step = 1): HistogramBin[] {
  const bins: HistogramBin[] = []
  for (let low = start; low <= end; low += step) {
    const high = Math.min(end, low + step - 1)
    bins.push({
      label: low === high ? String(low) : `${low}–${high}`,
      value: values.filter((value) => value >= low && value <= high).length,
    })
  }
  return bins
}

export function calculateAggregateStats(draws: Draw[]): AggregateStats {
  if (!draws.length) {
    return {
      meanSum: 0, minSum: 0, maxSum: 0, meanOdd: 0, meanFrame: 0, meanRepeated: 0,
      sumHistogram: [], oddHistogram: [], repeatedHistogram: [],
    }
  }

  const metrics = draws.map((draw, index) => drawMetrics(draw.b, draws[index - 1]?.b))
  const sums = metrics.map((metric) => metric.sum)
  const odds = metrics.map((metric) => metric.odd)
  const frames = metrics.map((metric) => metric.frame)
  const repeated = metrics.slice(1).map((metric) => metric.repeated)
  const mean = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length

  return {
    meanSum: mean(sums),
    minSum: Math.min(...sums),
    maxSum: Math.max(...sums),
    meanOdd: mean(odds),
    meanFrame: mean(frames),
    meanRepeated: repeated.length ? mean(repeated) : 0,
    sumHistogram: histogram(sums, 90, 240, 10),
    oddHistogram: histogram(odds, 3, 12),
    repeatedHistogram: histogram(repeated, 5, 14),
  }
}

export function selectWindow(draws: Draw[], size: number | 'all'): Draw[] {
  return size === 'all' ? draws : draws.slice(-size)
}

export function formatDrawDate(value: string): string {
  const [day, month, year] = value.split('/')
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(Number(year), Number(month) - 1, Number(day)))
    .replace('.', '')
}
