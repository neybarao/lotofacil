import { CheckCircle } from '@phosphor-icons/react'
import type { GeneratedGame } from '../analysis/types'
import { NumberBall } from './NumberBall'

export function GameRow({ game, index, hits }: { game: GeneratedGame; index: number; hits?: number }) {
  return (
    <article className="game-row">
      <div className="game-row__heading">
        <span>Jogo {String(index + 1).padStart(2, '0')}</span>
        {hits === undefined ? (
          <span className="game-row__metrics">
            {game.metrics.odd} ímpares · soma {game.metrics.sum} · {game.metrics.frame} moldura
          </span>
        ) : (
          <strong className={`hit-count hit-count--${hits >= 11 ? 'good' : 'neutral'}`}>
            <CheckCircle size={16} weight="fill" /> {hits} acertos
          </strong>
        )}
      </div>
      <div className="ball-line">
        {game.numbers.map((number) => <NumberBall key={number} number={number} size="small" />)}
      </div>
    </article>
  )
}
