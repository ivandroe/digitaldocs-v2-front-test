import { useMemo } from 'react';
// utils
import { ptDate } from '@/utils/formatTime';
import { labelMeses } from '@/utils/formatText';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import {
  sn,
  comissaoRows,
  entidadesRows,
  bensFinanciadosRows,
} from '@/modules/gaji9/components/detalhes-credito/credito-rows';
import { StatusBadge } from '@/modules/gaji9/components/detalhes-credito/shared';

// ---------------------------------------------------------------------------------------------------------------------

export function useMetadadosCreditoData(dados) {
  return useMemo(() => {
    if (!dados) return { financeiroPrincipal: [], cards: [] };

    const financeiroPrincipal = [
      { label: 'Valor da prestação', value: fCurrency(dados?.valor_prestacao), color: 'primary' },
      { label: 'TAEG', value: fPercent(dados?.taxa_taeg, 3), color: 'info' },
      { label: 'Custo total', value: fCurrency(dados?.custo_total), color: 'warning' },
      { label: 'Taxa de Mora', value: fPercent(Number(dados?.taxa_mora), 2), color: 'error' },
    ];

    const rowsComissoes = [
      ...comissaoRows('Comissão de avaliação', dados?.comissao_avaliacao),
      ...comissaoRows('Comissão de vistoria', dados?.comissao_vistoria),
    ];
    const rowsEntidades = entidadesRows(dados?.entidades_patronais);
    const rowsBensFinanciados = bensFinanciadosRows(dados?.bens_financiados);

    const cards = [
      // base (sempre presentes)
      {
        titulo: 'Taxas',
        dados: [
          {
            title: 'Juro precário',
            value: fPercent(dados?.taxa_juro_precario),
            tooltip: 'Taxa base constante no precário',
          },
          { title: 'Desconto', value: fPercent(dados?.taxa_juro_desconto) },
          { title: 'Taxa negociada', value: fPercent(dados?.taxa_juro_negociado), color: 'success.main' },
          {
            title: 'TAEG',
            value: fPercent(dados?.taxa_taeg),
            color: 'warning.main',
            tooltip: 'Taxa Anual Efetiva Global',
          },
          { title: 'Imposto de selo', value: fPercent(dados?.taxa_imposto_selo) },
          { title: 'Comissão abertura', value: fPercent(dados?.taxa_comissao_abertura) },
          { title: 'Imp. selo utilização', value: fPercent(Number(dados?.taxa_imposto_selo_utilizacao), 2) },
          { title: 'Comissão imobilização', value: fPercent(Number(dados?.taxa_comissao_imobilizacao), 2) },
          { title: 'Taxa de mora', value: fPercent(Number(dados?.taxa_mora), 2), color: 'error.main' },
        ],
      },

      {
        id: 'regime_isencoes',
        titulo: 'Regime & Isenções',
        dados: [
          {
            title: 'Modo da taxa',
            value: <StatusBadge label={dados?.modo_taxa_equivalente ? 'Equivalente' : 'Proporcional'} variant="info" />,
          },
          { title: 'Revolving', value: sn(dados?.revolving) },
          { title: 'Bonificado', value: sn(dados?.bonificado) },
          { title: 'Jovem Bonificado', value: sn(dados?.jovem_bonificado) },
          { title: 'Colaborador emp. parceiro', value: sn(dados?.colaborador_empresa_parceira) },
          { title: '1ª habitação própria', value: sn(dados?.habitacao_propria_1) },
          { title: 'Isento comissão', value: sn(dados?.isento_comissao) },
          { title: 'Isento de imposto de selo', value: sn(dados?.tem_isencao_imposto_selo) },
          { title: 'Capital Máx. Isento Selo', value: fCurrency(dados?.capital_max_isento_imposto_selo) },
        ],
      },
      {
        titulo: 'Prestação',
        dados: [
          { title: 'Nº prestações', value: labelMeses(dados?.numero_prestacao) },
          { title: 'Valor prestação', value: fCurrency(dados?.valor_prestacao), color: 'success.main' },
          {
            title: 'Valor s/ desconto',
            value: fCurrency(dados?.valor_prestacao_sem_desconto),
            tooltip: 'Prestação sem desconto de taxa',
          },
          { title: 'Data 1.ª prestação', value: ptDate(dados?.data_vencimento_prestacao1) },
          { title: 'Meses vencimento', value: labelMeses(dados?.meses_vencimento) },
          { title: 'Conta DO Renda', value: dados?.conta_do_renda, bold: true },
        ],
      },
      {
        titulo: 'Encargos',
        dados: [
          { title: 'Valor do juro', value: fCurrency(dados?.valor_juro) },
          { title: 'Imposto de selo', value: fCurrency(dados?.valor_imposto_selo) },
          { title: 'Comissão', value: fCurrency(dados?.valor_comissao) },
          { title: 'Prémio seguro', value: fCurrency(dados?.valor_premio_seguro) },
        ],
      },

      // Ciclo & Prazos (condicional)
      ...(dados?.data_utilizacao || dados?.prazo_utilizacao || dados?.periodo_carencia
        ? [
            {
              id: 'ciclo_prazos',
              titulo: 'Ciclo & Prazos',
              dados: [
                { title: 'Data de utilização', value: ptDate(dados?.data_utilizacao) },
                { title: 'Período de carência', value: labelMeses(dados?.periodo_carencia) },
                { title: 'Prazo de utilização', value: labelMeses(dados?.prazo_utilizacao) },
              ],
            },
          ]
        : []),

      // Credibolsa (condicional)
      ...(dados?.nivel_formacao && dados?.designacao_curso
        ? [
            {
              id: 'credibolsa',
              titulo: 'Credibolsa',
              dados: [
                { title: 'Nível de formação', value: dados?.nivel_formacao },
                { title: 'Curso', value: dados?.designacao_curso, noWrap: true },
                { title: 'Tranches da credibolsa', value: fCurrency(dados?.montante_tranches_credibolsa) },
                { title: 'Estabelecimento de ensino', value: dados?.estabelecimento_ensino, noWrap: true },
                { title: 'Localização', value: dados?.localizacao_estabelecimento_ensino, noWrap: true },
              ],
            },
          ]
        : []),

      // Entidade & Transferência (condicional)
      ...(dados?.nome_empresa_fornecedora || dados?.nib_vendedor_ou_fornecedor
        ? [
            {
              id: 'entidade_transferencia',
              titulo: 'Entidade & Transferência',
              dados: [
                { title: 'Empresa fornecedora', value: dados?.nome_empresa_fornecedora, noWrap: true },
                { title: 'NIB', value: dados?.nib_vendedor_ou_fornecedor },
                { title: 'Banco/Instituição', value: dados?.instituicao_credito_conta_vendedor_ou_fornecedor },
                {
                  title: 'Valor a transferir',
                  value: fCurrency(dados?.valor_transferir_conta_vendedor_ou_fornecedor),
                  bold: true,
                  color: 'primary.main',
                },
              ],
            },
          ]
        : []),

      // listas (condicionais)
      ...(rowsComissoes?.length ? [{ id: 'comissoes', titulo: 'Comissões', dados: rowsComissoes }] : []),
      ...(rowsBensFinanciados.length > 0
        ? [{ id: 'bens_financiados', titulo: 'Bens financiados', dados: rowsBensFinanciados }]
        : []),
      ...(rowsEntidades.length > 0
        ? [{ id: 'entidades_patronais', titulo: 'Entidades Patronais', dados: rowsEntidades }]
        : []),
    ];

    return { financeiroPrincipal, cards };
  }, [dados]);
}
