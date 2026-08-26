# Lotofácil — Análise Estatística

Aplicação estática e instalável para explorar os resultados históricos da Lotofácil. Todos os cálculos são feitos no navegador, sem API, banco de dados ou servidor próprio.

> A análise descreve resultados passados. Ela não prevê sorteios nem aumenta a probabilidade matemática de uma aposta.

## Base de dados

O arquivo `public/data/lotofacil.xlsx` foi baixado da página oficial da Lotofácil nas [Loterias CAIXA](https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx).

Antes de cada build, `scripts/build-data.mjs` lê e valida o XLSX. A publicação é interrompida se houver:

- lacunas na sequência dos concursos;
- datas fora do formato esperado;
- quantidade diferente de 15 dezenas;
- dezenas repetidas ou fora do intervalo de 1 a 25.

Depois da validação, o script gera `results.json` e `metadata.json`, usados pela aplicação. A interface mostra o último concurso, a data do último sorteio, a quantidade de concursos e a data da atualização do XLSX no repositório.

## Funcionalidades

- painel geral da base;
- recortes dos últimos 50, 100 e 500 concursos ou da base completa;
- frequência, percentual, atraso atual e maior atraso histórico das dezenas;
- pares e ímpares, soma, linhas, colunas, moldura e centro;
- sequências e repetição em relação ao concurso anterior;
- cinco jogos de 15 dezenas filtrados por critérios estatísticos;
- teste retroativo sem usar o resultado do concurso analisado;
- instalação como PWA e funcionamento offline após o primeiro acesso.

## Atualizar os concursos

1. Baixe o XLSX atualizado na página oficial da CAIXA.
2. Substitua `public/data/lotofacil.xlsx` mantendo exatamente esse nome.
3. Faça commit e push para a branch `main`.
4. A Action valida a base e publica uma nova versão no GitHub Pages.

Não é necessário gerar manualmente os arquivos JSON.

## Desenvolvimento local

Requer Node.js 22 ou versão compatível.

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm test
npm run lint
npm run build
```

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente a branch `main` no GitHub Pages. No repositório, a origem do Pages deve estar configurada como **GitHub Actions**.
