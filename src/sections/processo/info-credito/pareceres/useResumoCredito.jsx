import { useMemo } from 'react';
// utils
import { ptDate } from '@/utils/formatTime';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { sn } from '@/modules/gaji9/components/detalhes-credito/credito-rows';
import { StatusBadge } from '@/modules/gaji9/components/detalhes-credito/shared';

// ---------------------------------------------------------------------------------------------------------------------

function racioToColor(pct) {
  if (pct === null) return 'default';
  if (pct >= 100) return 'success';
  if (pct >= 75) return 'info';
  if (pct >= 50) return 'warning';
  return 'error';
}

function racioToLabel(pct) {
  if (pct === null) return 'Sem referência';
  if (pct >= 100) return 'Totalmente coberto';
  if (pct >= 75) return 'Cobertura elevada';
  if (pct >= 50) return 'Cobertura parcial';
  return 'Cobertura baixa';
}

// ---------------------------------------------------------------------------------------------------------------------

export function useResumoCredito(credito, mutuarios) {
  return useMemo(() => {
    const meta = credito?.gaji9_metadados || {};

    const identificacao = [
      { title: 'Mutuário(s)', value: mutuarios, bold: true },
      { title: 'Linha de crédito', value: credito?.linha, bold: true },
      { title: 'Finalidade', value: credito?.finalidade },
      { title: 'Componente', value: credito?.componente, bold: true },
    ];

    // dívida do mutuário/entidade (quando exista) — sinal relevante para a decisão
    const divida = credito?.valor_divida
      ? { valor: fCurrency(credito?.valor_divida), data: credito?.periodo ? ptDate(credito?.periodo) : '' }
      : null;

    // montante usado apenas para o rácio de cobertura (não é exibido — pertence às condições de aprovação)
    const montante = Number(
      credito?.montante_aprovado || credito?.montante_contratado || credito?.montante_solicitado || 0
    );

    // valor da garantia vem expresso em negativo — normalizar para positivo
    const valorGarantia = (g) => Math.abs(Number(g?.valor_garantia || g?.valor || 0));
    const ativas = (Array.isArray(credito?.garantias) ? credito.garantias : []).filter((g) => g?.ativo);
    const total = ativas.reduce((acc, g) => acc + valorGarantia(g), 0);
    const racio = montante > 0 ? (total / montante) * 100 : null;

    // diferença entre prestação efetiva e prestação sem desconto — sinaliza se há (ou não) desconto aplicado
    const prestacao = Number(meta?.valor_prestacao);
    const prestacaoSemDesconto = Number(meta?.valor_prestacao_sem_desconto);
    const hintSemDesconto =
      prestacaoSemDesconto > 0 && prestacao > 0
        ? prestacaoSemDesconto !== prestacao
          ? { text: `− ${fCurrency(Math.abs(prestacaoSemDesconto - prestacao))}`, color: 'success.dark' }
          : { text: '= prestação', color: 'text.secondary' }
        : null;

    const kpis = [
      { label: 'TAEG', color: 'info', value: fPercent(meta?.taxa_taeg, 3) },
      { label: 'Custo total', color: 'warning', value: fCurrency(meta?.custo_total) },
      { label: 'Prestação', color: 'primary', value: fCurrency(meta?.valor_prestacao) },
      {
        label: 'Prestação s/ desconto',
        color: 'secondary',
        value: fCurrency(meta?.valor_prestacao_sem_desconto),
        hint: hintSemDesconto,
      },
    ];

    // ── card no formato CardsGrid: { titulo, dados: [{ title, value, ... }] } ──
    const capitalMaxIsentoRow =
      meta?.tem_isencao_imposto_selo && Number(meta?.capital_max_isento_imposto_selo) > 0
        ? [{ title: 'Capital máx. isento', value: fCurrency(meta?.capital_max_isento_imposto_selo), bold: true }]
        : [];

    const cardTaxas = {
      id: 'taxas',
      titulo: 'Composição da taxa & encargos',
      dados: [
        {
          title: 'Modo da taxa',
          value: <StatusBadge label={meta?.modo_taxa_equivalente ? 'Equivalente' : 'Proporcional'} variant="info" />,
        },
        { title: 'Juro precário', value: fPercent(meta?.taxa_juro_precario) },
        // spread mostrado sempre (pode ser zero ou negativo)
        { title: 'Spread', value: fPercent(meta?.taxa_juro_desconto), bold: true },
        { title: 'Comissão de abertura', value: fPercent(meta?.taxa_comissao_abertura) },
        { title: 'Comissão de imobilização', value: fPercent(meta?.taxa_comissao_imobilizacao) },
        { title: 'Comissão de avaliação', value: fCurrency(meta?.comissao_avaliacao?.valor) },
        { title: 'Comissão de vistoria', value: fCurrency(meta?.comissao_vistoria?.valor) },
        { title: 'Imposto selo', value: fPercent(meta?.taxa_imposto_selo) },
        { title: 'Imp. selo utilização', value: fPercent(meta?.taxa_imposto_selo_utilizacao) },
      ],
    };

    // todos os regimes/isenções são listados (mesmo quando não se aplicam) para tornar explícito o que não aplica
    const cardRegime = {
      id: 'regime_isencoes',
      titulo: 'Regime & Isenções',
      dados: [
        { title: 'Bonificado', value: sn(meta?.bonificado) },
        { title: 'Jovem bonificado', value: sn(meta?.jovem_bonificado) },
        { title: 'Revolving', value: sn(meta?.revolving) },
        { title: 'Empresa parceira', value: sn(meta?.colaborador_empresa_parceira) },
        { title: '1ª habitação própria', value: sn(meta?.habitacao_propria_1) },
        { title: 'Isento comissão', value: sn(meta?.isento_comissao) },
        { title: 'Isento imposto selo', value: sn(meta?.tem_isencao_imposto_selo) },
        ...capitalMaxIsentoRow,
      ],
    };

    const lista = ativas.map((g) => ({
      id: g?.id,
      reais: g?.reais,
      valor: valorGarantia(g),
      nome: [g?.tipo_garantia, g?.subtipo_garantia].filter(Boolean).join(' - ') || 'Garantia',
    }));

    return {
      kpis,
      divida,
      identificacao,
      cards: [cardTaxas, cardRegime],
      garantias: { lista, total, racio, racioColor: racioToColor(racio), racioLabel: racioToLabel(racio) },
    };
  }, [credito, mutuarios]);
}
