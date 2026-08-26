export type Draw = {
  n: number
  d: string
  b: number[]
}

export type Metadata = {
  source: string
  sourceLabel: string
  sourceUpdatedAt: string
  latestContest: number
  latestDrawDate: string
  contestCount: number
  generatedAt: string
}

export type NumberStat = {
  number: number
  frequency: number
  percentage: number
  delay: number
  maxDelay: number
}

export type DrawMetrics = {
  odd: number
  even: number
  sum: number
  frame: number
  center: number
  rows: number[]
  columns: number[]
  repeated: number
  longestSequence: number
  sequences: number[][]
}

export type HistogramBin = {
  label: string
  value: number
}

export type AggregateStats = {
  meanSum: number
  minSum: number
  maxSum: number
  meanOdd: number
  meanFrame: number
  meanRepeated: number
  sumHistogram: HistogramBin[]
  oddHistogram: HistogramBin[]
  repeatedHistogram: HistogramBin[]
}

export type GeneratedGame = {
  numbers: number[]
  metrics: DrawMetrics
  score: number
}

export type BacktestResult = {
  target: Draw
  games: Array<GeneratedGame & { hits: number }>
  analysisSize: number
}
