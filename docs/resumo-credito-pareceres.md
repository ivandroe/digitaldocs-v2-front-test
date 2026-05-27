# Resumo estratégico do crédito nos Pareceres

> Comunicação para a equipa técnica do projeto e equipa de frontend.
> Branch: `feat/gaji9-metadados-v2`

## 1. Contexto e objetivo

O DigitalDocs assume-se cada vez mais como **sistema de apoio à decisão**. Nos pareceres de um
processo de crédito, o interveniente nem sempre tem visível, de forma consolidada, o conjunto de
condições do crédito sobre o qual está a emitir parecer.

Foi adicionado um **resumo compreensivo e estratégico das condições do crédito** (taxas, isenções e
garantias, com indicadores derivados) ao topo da vista de **Pareceres**. O objetivo é:

- manter o parecer o mais informado possível e evitar mal-entendidos;
- acelerar a avaliação dos processos pelos intervenientes antes de decidirem;
- agregar valor para os decisores/comités.

### Princípios respeitados

- **Sempre visível** — o resumo aparece mesmo quando o estado **não** é decisor.
- **Complementar, nunca duplicado** — as **Condições de aprovação** (montante, taxa de juro, prazo)
  continuam a ser uma **entidade separada e editável**. O resumo **não** as exibe nem as afeta; o
  montante é usado apenas internamente como denominador do rácio de cobertura.
- **Apenas no modal de pareceres** — o resumo é mostrado no modal de pareceres, não no separador
  "Pareceres" (ver secção 3).

## 2. Ficheiros alterados

| Ficheiro | Tipo | Descrição |
|----------|------|-----------|
| `src/sections/processo/info-credito/resumo-credito.jsx` | **Novo** | Componente `ResumoCredito` + hook `useResumoCredito`. |
| `src/sections/processo/info-credito/pareceres.jsx` | Alterado | Import e render do `ResumoCredito` no topo de `PareceresCredito`, apenas no modal. |

Nenhum outro componente foi alterado. Não há alterações de API/backend (consome dados já existentes —
ver secção 5).

## 3. Onde aparece

O `ResumoCredito` é renderizado no topo do `<Stack>` de `PareceresCredito`, **apenas quando não é o
separador** (a prop `infoCredito` distingue os dois contextos):

```jsx
{!infoCredito && <ResumoCredito credito={processo?.credito} mutuarios={processo?.titular} />}
```

- Separador "Pareceres" (`info-credito/index.jsx`): `<PareceresCredito infoCredito />` → resumo **não**
  aparece.
- Modal de pareceres (`dialog-pareceres.jsx`): `<PareceresCredito />` (sem `infoCredito`) → resumo
  aparece.

## 4. Estrutura visual

`Card` "RESUMO DO CRÉDITO" com:

1. **Identificação** (grelha 2 colunas):
   - **Mutuário(s)** · **Linha de crédito**
   - **Finalidade** · **Componente**
   - (a negrito: Mutuário(s), Linha de crédito, Componente. Finalidade em peso normal.)

2. **Crédito em dívida** (destaque condicional) — só aparece quando o mutuário/entidade tem crédito
   em dívida. Etiqueta `Mutuário com crédito em dívida` (cor warning) + valor + data.

3. **KPIs** (4 cartões): **TAEG** · **Prestação** · **Custo total** · **Taxa de mora**.
   - Sob a Prestação aparece `s/ desconto: …` **apenas quando difere** da prestação efetiva.

4. **Três blocos** (grelha 3 colunas):
   - **Composição da taxa & encargos** — modo da taxa, juro precário, spread (sempre visível),
     comissões (abertura, imobilização, avaliação, vistoria), imposto de selo e selo de utilização.
   - **Regime & Isenções** — todos os regimes listados com `Sim/Não` (ver secção 6), e capital
     máximo isento quando aplicável.
   - **Garantias & Cobertura** — rácio de cobertura, total garantido e lista de garantias ativas.

## 5. Dados consumidos

Tudo a partir do estado Redux `state.digitaldocs.processo`:

- `processo.credito` → `linha`, `finalidade`, `componente`, montantes
  (`montante_aprovado` / `montante_contratado` / `montante_solicitado`), `valor_divida` + `periodo`
  (crédito em dívida), `garantias[]` e `gaji9_metadados`.
- `processo.titular` → nome(s) do(s) mutuário(s).

Campos de `gaji9_metadados` usados: `taxa_taeg`, `valor_prestacao`, `valor_prestacao_sem_desconto`,
`custo_total`, `taxa_mora`, `modo_taxa_equivalente`, `taxa_juro_precario`, `taxa_juro_desconto`
(spread), `taxa_comissao_abertura`, `taxa_comissao_imobilizacao`, `comissao_avaliacao.valor`,
`comissao_vistoria.valor`, `taxa_imposto_selo`, `taxa_imposto_selo_utilizacao`, `bonificado`,
`jovem_bonificado`, `revolving`, `colaborador_empresa_parceira`, `habitacao_propria_1`,
`isento_comissao`, `tem_isencao_imposto_selo`, `capital_max_isento_imposto_selo`.

Campos de cada garantia (`credito.garantias[]`): `ativo`, `valor_garantia` (ou `valor`), `reais`,
`tipo_garantia`, `subtipo_garantia`, `id`.

## 6. Regras de negócio

- **Rácio de cobertura** = `Σ |valor das garantias ativas| / montante × 100`.
  - Considera apenas garantias com `ativo = true`.
  - Cores/etiquetas por escalão:
    | Rácio | Cor | Etiqueta |
    |-------|-----|----------|
    | sem montante | default | Sem referência |
    | ≥ 100% | success | Totalmente coberto |
    | ≥ 75% | info | Cobertura elevada |
    | ≥ 50% | warning | Cobertura parcial |
    | < 50% | error | Cobertura baixa |

- **Valores de garantia negativos** — os valores vêm expressos em negativo; são normalizados com
  `Math.abs` antes de somar e de exibir.

- **Spread (`taxa_juro_desconto`)** — mostrado **sempre**, incluindo quando é **zero** ou
  **negativo**. `fPercent(0)` devolve `"0.00%"`; só valores ausentes (`null`/`undefined`/`''`) caem
  em `(N/D)`.

- **Prestação sem desconto** — só é apresentada quando `valor_prestacao_sem_desconto > 0` **e**
  difere de `valor_prestacao`.

- **Regime & Isenções sempre completo** — todos os regimes/isenções são listados com `Sim/Não`,
  **mesmo quando não se aplicam**, para tornar explícito o que **não** se aplica.

- **Crédito em dívida** — o destaque só é renderizado quando `credito.valor_divida` é truthy; mostra
  o valor (`fCurrency`) e a data (`periodo`, via `ptDate`) quando existir. Usa apenas o que está em
  `processo.credito` — o detalhe rico de responsabilidades (saldos, prestações, situações da CIRC)
  vive na **ficha de parecer** (slice `intranet`, `ficha.clientes[].responsabilidades`), fora do
  contexto do resumo, e **não** é consumido aqui.

## 7. O que NÃO mudou (importante)

- As **Condições de aprovação** (montante, taxa de juro, prazo) mantêm-se intactas: continuam a ser
  mostradas/editadas pela entidade separada `condicao_aprovacao`, apenas quando o estado é decisor.
- O resumo **não** duplica nem edita essas condições.

## 8. Notas de QA / como testar

- Abrir um processo de crédito com `gaji9_metadados` e garantias preenchidos.
- Confirmar o resumo no **separador Pareceres** e no **modal de pareceres**.
- Confirmar que aparece **com estado não-decisor**.
- Validar casos limite: sem garantias ("Sem garantias registadas"), garantias com valor negativo
  (rácio positivo), spread negativo (visível), prestação com e sem desconto, regimes que não se
  aplicam (a mostrar "Não").
- Lint: `npx eslint src/sections/processo/info-credito/resumo-credito.jsx`.

## 9. Dependências de componentes/utils reutilizados

- `@/utils/formatNumber` → `fCurrency`, `fPercent(value, cd)`.
- `@/components/Label` → `Label`, `LabelSN({ val })`.
- `@/components/GridItem`, `@/components/Panel` → `noDados`.
- MUI: `Card`, `CardHeader`, `CardContent`, `Box` (grid), `Grid`, `Stack`, `Divider`, `Tooltip`,
  `Typography`, `alpha`, `useTheme`.
