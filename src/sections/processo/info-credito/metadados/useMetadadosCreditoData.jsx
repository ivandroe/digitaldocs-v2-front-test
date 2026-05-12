import { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { ptDate } from '@/utils/formatTime';
import { labelMeses } from '@/utils/formatText';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import Label from '@/components/Label';
import { LabelSN } from '../../../parametrizacao/details';

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

    const cards = [
      {
        titulo: 'Regime & Isenções',
        dados: [
          ...(dados?.bonificado ||
          dados?.revolving ||
          dados?.jovem_bonificado ||
          dados?.habitacao_propria_1 ||
          dados?.colaborador_empresa_parceira
            ? [
                {
                  title: 'Regime',
                  value: (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                      {dados?.bonificado && <Label color="info">Bonificado</Label>}
                      {dados?.jovem_bonificado && <Label color="info">Jovem Bonificado</Label>}
                      {dados?.revolving && <Label color="info">Revolving</Label>}
                      {dados?.colaborador_empresa_parceira && <Label color="info">Parceiro</Label>}
                      {dados?.habitacao_propria_1 && <Label color="info">1ª habitação própria</Label>}
                    </Stack>
                  ),
                },
              ]
            : []),
          { title: 'Isento Comissão', value: <LabelSN item={dados?.isento_comissao} /> },
          { title: 'Isento Imposto Selo', value: <LabelSN item={dados?.tem_isencao_imposto_selo} /> },
          {
            title: 'Capital Máx. Isento Selo',
            value:
              Number(dados?.capital_max_isento_imposto_selo) > 0
                ? fCurrency(dados?.capital_max_isento_imposto_selo)
                : '',
          },
          { title: 'Conta DO Renda', value: dados?.conta_do_renda, bold: true },
        ],
      },
      {
        titulo: 'Ciclo & Prazos',
        dados: [
          { title: 'Data da 1ª prestação', value: ptDate(dados?.data_vencimento_prestacao1) },
          { title: 'Data de utilização', value: ptDate(dados?.data_utilizacao) },
          { title: 'Nº de prestações', value: labelMeses(dados?.numero_prestacao), bold: true },
          { title: 'Meses de vencimento', value: labelMeses(dados?.meses_vencimento) },
          { title: 'Período de carência', value: labelMeses(dados?.periodo_carencia) },
          { title: 'Prazo de utilização', value: labelMeses(dados?.prazo_utilizacao) },
        ],
      },
      {
        titulo: 'Taxas Detalhadas',
        dados: [
          {
            title: 'Modo da taxa',
            value: <Label color="info">{dados?.modo_taxa_equivalente ? 'Equivalente' : 'Proporcional'}</Label>,
          },
          { title: 'Juro precário', value: fPercent(dados?.taxa_juro_precario) },
          ...(dados?.taxa_juro_desconto && Number(dados?.taxa_juro_desconto) > 0
            ? [{ title: 'Spread', value: fPercent(dados?.taxa_juro_desconto), bold: true }]
            : []),

          { title: 'Comissão de abertura', value: fPercent(dados?.taxa_comissao_abertura) },
          {
            title: 'Comissão de imobilização',
            value: Number(dados?.taxa_comissao_imobilizacao) > 0 ? fPercent(dados?.taxa_comissao_imobilizacao) : '',
          },
          { title: 'Taxa de imposto selo', value: fPercent(dados?.taxa_imposto_selo) },
          {
            title: 'Taxa imp. selo utilização',
            value: Number(dados?.taxa_imposto_selo_utilizacao) > 0 ? fPercent(dados?.taxa_imposto_selo_utilizacao) : '',
          },
        ],
      },
      {
        titulo: 'Cálculos (Valores)',
        dados: [
          { title: 'Valor do juro', value: fCurrency(dados?.valor_juro) },
          { title: 'Comissões', value: fCurrency(dados?.valor_comissao) },
          { title: 'Imposto selo', value: fCurrency(dados?.valor_imposto_selo) },
          { title: 'Prestação s/ desconto', value: fCurrency(dados?.valor_prestacao_sem_desconto) },
        ],
      },
      {
        id: 'objeto_ensino',
        titulo: 'Objeto & Ensino/Credibolsa',
        dados: [
          { title: 'Tipo de imóvel', value: dados?.tipo_imovel?.label || dados?.tipo_imovel || dados?.tipo_imovel_id },
          { title: 'Bem/Serviço', value: dados?.bem_servico_financiado, noWrap: false },
          { title: 'Finalidade', value: dados?.finalidade_credito_habitacao, noWrap: false },
          { title: 'Nível de formação', value: dados?.nivel_formacao },
          { title: 'Curso', value: dados?.designacao_curso, noWrap: false },
          {
            title: 'Tranches da credibolsa',
            value:
              Number(dados?.montante_tranches_credibolsa) > 0 ? fCurrency(dados?.montante_tranches_credibolsa) : '',
          },
          { title: 'Estabelecimento de ensino', value: dados?.estabelecimento_ensino, noWrap: false },
          { title: 'Localização', value: dados?.localizacao_estabelecimento_ensino, noWrap: false },
        ],
      },
      {
        id: 'entidade_transferencia',
        titulo: 'Entidade & Transferência',
        dados: [
          { title: 'Empresa fornecedora', value: dados?.nome_empresa_fornecedora, noWrap: false },
          { title: 'NIB', value: dados?.nib_vendedor_ou_fornecedor },
          { title: 'Banco/Instituição', value: dados?.instituicao_credito_conta_vendedor_ou_fornecedor },
          {
            title: 'Valor a transferir',
            value:
              Number(dados?.valor_transferir_conta_vendedor_ou_fornecedor) > 0
                ? fCurrency(dados?.valor_transferir_conta_vendedor_ou_fornecedor)
                : '',
            bold: true,
            color: 'primary.main',
          },
        ],
      },
      ...buildComissoesCard(dados),
      ...buildEntidadesPatronaisCard(dados),
      ...buildBensFinanciadosCard(dados),
    ];

    return { financeiroPrincipal, cards };
  }, [dados]);
}

// ---------------------------------------------------------------------------------------------------------------------

function buildComissoesCard(dados) {
  const ca = dados?.comissao_avaliacao;
  const cv = dados?.comissao_vistoria;
  if (!ca && !cv) return [];

  const linhasComissao = (label, c) =>
    c
      ? [
          { title: `${label} - Valor`, value: fCurrency(c?.valor) },
          { title: `${label} - Prazo`, value: labelMeses(c?.prazo) },
          { title: `${label} - Periodicidade`, value: c?.periodicidade },
        ]
      : [];

  return [
    {
      id: 'comissoes_adicionais',
      titulo: 'Comissões adicionais (TAEG)',
      dados: [...linhasComissao('Avaliação', ca), ...linhasComissao('Vistoria', cv)],
    },
  ];
}

function buildEntidadesPatronaisCard(dados) {
  const lista = Array.isArray(dados?.entidades_patronais) ? dados.entidades_patronais : [];
  if (!lista.length) return [];

  return [
    {
      id: 'entidades_patronais',
      titulo: 'Entidades patronais',
      dados: lista.map((row) => ({
        title: `Mutuário ${row?.numero_entidade_mutuario}`,
        value: `${row?.numero_entidade_patronal}${row?.nome_entidade_patronal ? ` - ${row.nome_entidade_patronal}` : ''}`,
        noWrap: false,
      })),
    },
  ];
}

function buildBensFinanciadosCard(dados) {
  const lista = Array.isArray(dados?.bens_financiados) ? dados.bens_financiados : [];
  if (!lista.length) return [];

  return [
    {
      id: 'bens_financiados',
      titulo: 'Bens financiados',
      dados: lista.map((bem, i) => ({
        title: `${i + 1}. ${bem?.tipo || '—'}`,
        value: descreverBemFinanciado(bem),
        noWrap: false,
      })),
    },
  ];
}

function descreverBemFinanciado(bem) {
  const partes = [];
  if (bem?.marca || bem?.modelo) partes.push([bem?.marca, bem?.modelo].filter(Boolean).join(' '));
  if (bem?.matricula) partes.push(`Matr. ${bem.matricula}`);
  if (bem?.nip) partes.push(`NIP ${bem.nip}`);
  if (bem?.numero_matriz) partes.push(`Mtz ${bem.numero_matriz}`);
  if (bem?.identificacao_fracao) partes.push(`Frac. ${bem.identificacao_fracao}`);
  if (bem?.area) partes.push(`${bem.area} m²`);
  if (bem?.descritivo) partes.push(bem.descritivo);
  if (bem?.valor) partes.push(fCurrency(bem.valor));
  return partes.length ? partes.join(' · ') : '—';
}
