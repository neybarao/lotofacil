import { execFileSync } from 'node:child_process'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync, strFromU8 } from 'fflate'
import { XMLParser } from 'fast-xml-parser'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const xlsxPath = resolve(root, 'public/data/lotofacil.xlsx')
const resultsPath = resolve(root, 'public/data/results.json')
const metadataPath = resolve(root, 'public/data/metadata.json')

const bytes = new Uint8Array(await readFile(xlsxPath))
const archive = unzipSync(bytes)
const sheetXml = archive['xl/worksheets/sheet1.xml']

if (!sheetXml) throw new Error('Planilha LOTOFÁCIL não encontrada no XLSX.')

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: false,
})
const parsed = parser.parse(strFromU8(sheetXml))
const rawRows = parsed?.worksheet?.sheetData?.row
const rows = Array.isArray(rawRows) ? rawRows : [rawRows]

if (rows.length < 2) throw new Error('O XLSX não contém concursos.')

function cellsOf(row) {
  const cells = Array.isArray(row.c) ? row.c : [row.c]
  return cells.map((cell) => String(cell?.v ?? '').trim())
}

const results = rows.slice(1).map((row, index) => {
  const values = cellsOf(row)
  const contest = Number(values[0])
  const date = values[1]
  const balls = values.slice(2, 17).map(Number)

  if (!Number.isInteger(contest) || contest !== index + 1) {
    throw new Error(`Sequência inválida no concurso ${values[0] || index + 1}.`)
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    throw new Error(`Data inválida no concurso ${contest}: ${date}.`)
  }
  if (balls.length !== 15 || new Set(balls).size !== 15 || balls.some((ball) => ball < 1 || ball > 25)) {
    throw new Error(`Dezenas inválidas no concurso ${contest}.`)
  }

  return { n: contest, d: date, b: balls.sort((a, b) => a - b) }
})

function sourceUpdatedAt() {
  if (process.env.SOURCE_UPDATED_AT) return process.env.SOURCE_UPDATED_AT
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', 'public/data/lotofacil.xlsx'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const fileStats = await stat(xlsxPath)
const latest = results.at(-1)
const metadata = {
  source: 'https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx',
  sourceLabel: 'Loterias CAIXA — Lotofácil',
  sourceUpdatedAt: sourceUpdatedAt() || fileStats.mtime.toISOString(),
  latestContest: latest.n,
  latestDrawDate: latest.d,
  contestCount: results.length,
  generatedAt: new Date().toISOString(),
}

await writeFile(resultsPath, `${JSON.stringify(results)}\n`)
await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`)
console.log(`Base validada: ${results.length} concursos, até o nº ${latest.n} (${latest.d}).`)
