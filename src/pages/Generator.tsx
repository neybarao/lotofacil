import { ArrowClockwise, BookmarkSimple, Info } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { generateGames } from '../analysis/generator'
import { selectWindow } from '../analysis/statistics'
import type { Draw, GeneratedGame } from '../analysis/types'
import { GameRow } from '../components/GameRow'
import type { WindowSize } from '../components/WindowControl'
import { WindowControl } from '../components/WindowControl'

export function Generator({ draws }: { draws: Draw[] }) {
  const [windowSize, setWindowSize] = useState<WindowSize>(100)
  const [seed, setSeed] = useState(() => Date.now())
  const games = useMemo(() => generateGames(selectWindow(draws, windowSize), 5, seed), [draws, seed, windowSize])

  function saveGames() {
    const stored = JSON.parse(localStorage.getItem('lotofacil-saved-games') ?? '[]') as unknown[]
    const entry = { createdAt: new Date().toISOString(), windowSize, games: games.map((game) => game.numbers) }
    localStorage.setItem('lotofacil-saved-games', JSON.stringify([entry, ...stored].slice(0, 20)))
  }

  return (
    <div className="page-stack">
      <section className="page-intro page-intro--split">
        <div><p className="eyebrow">Gerador</p><h1>Cinco jogos equilibrados</h1><p className="intro-copy">Combinações de 15 dezenas filtradas pelos padrões da janela escolhida.</p></div>
        <WindowControl value={windowSize} onChange={setWindowSize} />
      </section>

      <div className="notice"><Info size={20} /><p>Equilíbrio estatístico não aumenta a probabilidade matemática de uma combinação ser sorteada.</p></div>

      <section className="games-list">
        {games.map((game: GeneratedGame, index) => <GameRow key={game.numbers.join('-')} game={game} index={index} />)}
      </section>

      <div className="action-row">
        <button className="button button--primary" type="button" onClick={() => setSeed(Date.now())}><ArrowClockwise size={19} />Gerar novamente</button>
        <button className="button button--secondary" type="button" onClick={saveGames}><BookmarkSimple size={19} />Salvar no aparelho</button>
      </div>

      <section className="method-section">
        <p className="eyebrow">Critérios aplicados</p>
        <div className="criteria-grid">
          <span>7 ou 8 ímpares</span><span>2 a 4 por linha</span><span>2 a 4 por coluna</span>
          <span>Até 5 consecutivas</span><span>Soma próxima da média</span><span>Frequência e atraso</span>
        </div>
      </section>
    </div>
  )
}
