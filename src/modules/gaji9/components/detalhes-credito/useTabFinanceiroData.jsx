import { useMemo } from 'react';
// utils
import { ptDate } from '@/utils/formatTime';
import { labelMeses } from '@/utils/formatText';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { StatusBadge } from '@/modules/gaji9/components/detalhes-credito/shared';
import { sn, comissaoRows, entidadesRows, bensFinanciadosRows } from './credito-rows';

// ---------------------------------------------------------------------------------------------------------------------

export function useTabFinanceiroData(credito) {
  return useMemo(() => {
    if (!credito) return { financeiroPrincipal: [], cards: [] };

    const extra = credito?.info_extra_v2 || {};
    const d = { ...extra, ...credito };

    const rowsComissoes = [
      ...comissaoRows('Comissão de avaliação', extra?.comissao_avaliacao),
      ...comissaoRows('Comissão de vistoria', extra?.comissao_vistoria),
    ];
    const rowsEntidades = entidadesRows(extra?.entidades_patronais);
    const rowsBensFinanciados = bensFinanciadosRows(extra?.bens_financiados);

    const cards = [
      // base (sempre presentes)
      {
        titulo: 'Taxas',
        dados: [
          {
            title: 'Juro precário',
            value: fPercent(d?.taxa_juro_precario),
            tooltip: 'Taxa base constante no precário',
          },
          { title: 'Desconto', value: fPercent(d?.taxa_juro_desconto) },
          { title: 'Taxa negociada', value: fPercent(d?.taxa_juro_negociado || d?.taxa_juro), color: 'success.main' },
          { title: 'TAEG', value: fPercent(d?.taxa_taeg), color: 'warning.main', tooltip: 'Taxa Anual Efetiva Global' },
          { title: 'Imposto de selo', value: fPercent(d?.taxa_imposto_selo) },
          { title: 'Comissão abertura', value: fPercent(d?.taxa_comissao_abertura) },
          { title: 'Imp. selo utilização', value: fPercent(extra?.taxa_imposto_selo_utilizacao) },
          { title: 'Comissão imobilização', value: fPercent(extra?.taxa_comissao_imobilizacao) },
          { title: 'Taxa de mora', value: fPercent(extra?.taxa_mora), color: 'error.main' },
        ],
      },

      {
        id: 'regime_isencoes',
        titulo: 'Regime & Isenções',
        dados: [
          {
            title: 'Modo da taxa',
            value: <StatusBadge label={extra?.modo_taxa_equivalente ? 'Equivalente' : 'Proporcional'} variant="info" />,
          },
          { title: 'Revolving', value: sn(extra?.revolving) },
          { title: 'Bonificado', value: sn(extra?.bonificado) },
          { title: 'Jovem Bonificado', value: sn(extra?.jovem_bonificado) },
          { title: 'Colaborador emp. parceiro', value: sn(extra?.colaborador_empresa_parceira) },
          { title: '1ª habitação própria', value: sn(extra?.habitacao_propria_1) },
          { title: 'Isento comissão', value: sn(d?.isento_comissao) },
          { title: 'Isento de imposto de selo', value: sn(extra?.tem_isencao_imposto_selo) },
          { title: 'Capital Máx. Isento Selo', value: fCurrency(extra?.capital_max_isento_imposto_selo) },
        ],
      },
      {
        titulo: 'Prestação',
        dados: [
          { title: 'Nº prestações', value: labelMeses(d?.numero_prestacao) },
          { title: 'Valor prestação', value: fCurrency(d?.valor_prestacao), color: 'success.main' },
          {
            title: 'Valor s/ desconto',
            value: fCurrency(d?.valor_prestacao_sem_desconto),
            tooltip: 'Prestação sem desconto de taxa',
          },
          { title: 'Data 1.ª prestação', value: ptDate(d?.data_vencimento_prestacao1) },
          { title: 'Meses vencimento', value: d?.meses_vencimento },
          { title: 'Conta DO Renda', value: d?.conta_do_renda, bold: true },
        ],
      },
      {
        titulo: 'Encargos',
        dados: [
          { title: 'Custo total', value: fCurrency(d?.custo_total), color: 'warning.main' },
          { title: 'Valor de juro', value: fCurrency(d?.valor_juro) },
          { title: 'Imposto de selo', value: fCurrency(d?.valor_imposto_selo) },
          { title: 'Comissão', value: fCurrency(d?.valor_comissao) },
          { title: 'Prémio seguro', value: fCurrency(d?.valor_premio_seguro) },
        ],
      },
      {
        titulo: 'Produto',
        dados: [
          { title: 'Componente', value: d?.rotulo || d?.componente },
          { title: 'Segmento', value: d?.segmento },
          { title: 'Tipo titular', value: `${d?.tipo_titular}${d?.consumidor ? ' - Consumidor' : ''}` },
        ],
      },

      // V2: Ciclo & Prazos (condicional)
      ...(extra?.data_utilizacao || extra?.prazo_utilizacao || extra?.periodo_carencia
        ? [
            {
              id: 'ciclo_prazos',
              titulo: 'Ciclo & Prazos',
              dados: [
                { title: 'Data de utilização', value: ptDate(extra?.data_utilizacao) },
                { title: 'Período de carência', value: labelMeses(extra?.periodo_carencia) },
                { title: 'Prazo de utilização', value: labelMeses(extra?.prazo_utilizacao) },
              ],
            },
          ]
        : []),

      // V2: Credibolsa (condicional)
      ...(extra?.nivel_formacao && extra?.designacao_curso
        ? [
            {
              id: 'credibolsa',
              titulo: 'Credibolsa',
              dados: [
                { title: 'Nível de formação', value: extra?.nivel_formacao },
                { title: 'Curso', value: extra?.designacao_curso, noWrap: true },
                { title: 'Tranches da credibolsa', value: fCurrency(extra?.montante_tranches_credibolsa) },
                { title: 'Estabelecimento de ensino', value: extra?.estabelecimento_ensino, noWrap: true },
                { title: 'Localização', value: extra?.localizacao_estabelecimento_ensino, noWrap: true },
              ],
            },
          ]
        : []),

      // V2: Entidade & Transferência (condicional)
      ...(extra?.nome_empresa_fornecedora || extra?.nib_vendedor_ou_fornecedor
        ? [
            {
              id: 'entidade_transferencia',
              titulo: 'Entidade & Transferência',
              dados: [
                { title: 'Empresa fornecedora', value: extra?.nome_empresa_fornecedora, noWrap: true },
                { title: 'NIB', value: extra?.nib_vendedor_ou_fornecedor },
                { title: 'Banco/Instituição', value: extra?.instituicao_credito_conta_vendedor_ou_fornecedor },
                {
                  title: 'Valor a transferir',
                  value: fCurrency(extra?.valor_transferir_conta_vendedor_ou_fornecedor),
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

    return cards;
  }, [credito]);
}
