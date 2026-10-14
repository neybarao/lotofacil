import { CheckCircle, Copy } from '@phosphor-icons/react'
import { useState } from 'react'
import type { GeneratedGame } from '../analysis/types'
import { NumberBall } from './NumberBall'

export function GameRow({ game, index, hits }: { game: GeneratedGame; index: number; hits?: number }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function copyGame() {
    try {
      const text = game.numbers.map((number) => String(number).padStart(2, '0')).join(' ')
      await navigator.clipboard.writeText(text)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

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
        <button className="copy-button" type="button" onClick={() => void copyGame()}
          aria-label={`Copiar jogo ${index + 1}`} title={copyStatus === 'copied' ? 'Copiado!' : 'Copiar dezenas'}>
          {copyStatus === 'copied' ? <CheckCircle size={18} weight="fill" /> : <Copy size={18} />}
        </button>
      </div>
      <p className={copyStatus === 'error' ? 'copy-error' : 'sr-only'} role="status">
        {copyStatus === 'copied' ? `Jogo ${index + 1} copiado.` : copyStatus === 'error' ? 'Não foi possível copiar. Tente novamente.' : ''}
      </p>
      <div className="ball-line">
        {game.numbers.map((number) => <NumberBall key={number} number={number} size="small" />)}
      </div>
    </article>
  )
}
