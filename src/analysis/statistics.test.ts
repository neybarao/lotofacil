import { describe, expect, it } from 'vitest'
import { CENTER_NUMBERS, FRAME_NUMBERS, calculateNumberStats, drawMetrics, getSequences } from './statistics'
import type { Draw } from './types'

describe('estatísticas da Lotofácil', () => {
  it('define a grade 5x5 em 16 dezenas de moldura e 9 de centro', () => {
    expect(FRAME_NUMBERS.size).toBe(16)
    expect(CENTER_NUMBERS.size).toBe(9)
  })

  it('calcula distribuições e sequências', () => {
    const numbers = [1, 2, 3, 6, 7, 9, 11, 12, 15, 16, 18, 20, 21, 24, 25]
    const metrics = drawMetrics(numbers, [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 22, 23, 24, 25])
    expect(metrics.odd + metrics.even).toBe(15)
    expect(metrics.rows).toEqual([3, 3, 3, 3, 3])
    expect(metrics.columns.reduce((total, value) => total + value, 0)).toBe(15)
    expect(metrics.repeated).toBe(9)
    expect(metrics.frame + metrics.center).toBe(15)
    expect(getSequences(numbers)).toContainEqual([1, 2, 3])
  })

  it('calcula frequência e atraso atual', () => {
    const draws: Draw[] = [
      { n: 1, d: '01/01/2026', b: [1, 2, 3] },
      { n: 2, d: '02/01/2026', b: [2, 3, 4] },
      { n: 3, d: '03/01/2026', b: [3, 4, 5] },
    ]
    const stats = calculateNumberStats(draws)
    expect(stats[0]).toMatchObject({ frequency: 1, delay: 2 })
    expect(stats[2]).toMatchObject({ frequency: 3, delay: 0 })
  })
})
