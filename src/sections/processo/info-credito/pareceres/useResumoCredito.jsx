import { useMemo } from 'react';
// utils
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { sn } from '@/modules/gaji9/components/detalhes-credito/credito-rows';
import { StatusBadge } from '@/modules/gaji9/components/detalhes-credito/shared';

// ---------------------------------------------------------------------------------------------------------------------

export function useResumoCredito(credito, mutuarios) {
  return useMemo(() => {
    const meta = credito?.gaji9_metadados || {};

    const identificacao = [
      { title: 'Mutuário(s)', value: mutuarios },
      { title: 'Linha de crédito', value: credito?.linha },
      { title: 'Componente', value: credito?.componente },
      { title: 'Finalidade', value: credito?.finalidade },
    ];

    // diferença entre prestação efetiva e prestação sem desconto — sinaliza se há (ou não) desconto aplicado
    const prestacao = Number(meta?.valor_prestacao || 0);
    const prestacaoSemDesconto = Number(meta?.valor_prestacao_sem_desconto || 0);
    const hintSemDesconto =
      prestacaoSemDesconto !== prestacao
        ? { text: `− ${fCurrency(Math.abs(prestacaoSemDesconto - prestacao))}`, color: 'success.dark' }
        : null;

    const kpis = [
      { label: 'TAEG', color: 'info', value: fPercent(meta?.taxa_taeg, 3) },
      { label: 'Custo total', color: 'warning', value: fCurrency(meta?.custo_total) },
      { label: 'Prestação', color: 'primary', value: fCurrency(meta?.valor_prestacao) },
      {
        color: 'secondary',
        hint: hintSemDesconto,
        label: 'Prestação s/ desconto',
        value: fCurrency(meta?.valor_prestacao_sem_desconto),
      },
    ];

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

    return { kpis, identificacao, cards: [cardTaxas, cardRegime] };
  }, [credito, mutuarios]);
}
