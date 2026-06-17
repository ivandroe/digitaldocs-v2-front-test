// utils
import { fillData } from '@/utils/formatTime';
import { TIPOS_BEM_FINANCIADO } from './schemas';
import { getFreguesia } from '../garantias/schemaFileds';
import { listaFreguesias, periodicidadesList } from '@/_mock';

// ── Helpers base -----------------------------------------------------------------------------------------------------

function fromPrecario(precario, key, fallback = '') {
  const val = precario?.[key]?.default;
  return val !== undefined && val !== null && val !== '' ? val : fallback;
}

function resolveField(key, { dadosStepper, dados, precario, fallback = '' }) {
  return dadosStepper?.[key] ?? dados?.[key] ?? fromPrecario(precario, key, fallback);
}

// ---------------------------------------------------------------------------------------------------------------------

export function getDefaultsRegime({ dadosStepper, dados, precario }) {
  const resolveBool = (key) => resolveField(key, { dadosStepper, dados, precario, fallback: false });
  return {
    revolving: resolveBool('revolving'),
    bonificado: resolveBool('bonificado'),
    isento_comissao: resolveBool('isento_comissao'),
    jovem_bonificado: resolveBool('jovem_bonificado'),
    habitacao_propria_1: resolveBool('habitacao_propria_1'),
    tem_isencao_imposto_selo: resolveBool('tem_isencao_imposto_selo'),
    colaborador_empresa_parceira: resolveBool('colaborador_empresa_parceira'),
    credibolsa: dadosStepper?.credibolsa || Number(dados?.montante_tranches_credibolsa) > 0,
    nivel_formacao: dadosStepper?.nivel_formacao || dados?.nivel_formacao || '',
    designacao_curso: dadosStepper?.designacao_curso || dados?.designacao_curso || '',
    estabelecimento_ensino: dadosStepper?.estabelecimento_ensino || dados?.estabelecimento_ensino || '',
    montante_tranches_credibolsa:
      dadosStepper?.montante_tranches_credibolsa || dados?.montante_tranches_credibolsa || '',
    localizacao_estabelecimento_ensino:
      dadosStepper?.localizacao_estabelecimento_ensino || dados?.localizacao_estabelecimento_ensino || '',
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function getDefaultsCondicoes({ dadosStepper, dados, precario }) {
  const resolve = (key, fallback = '') => resolveField(key, { dadosStepper, dados, precario, fallback });
  return {
    conta_do_renda: resolve('conta_do_renda'),
    periodo_carencia: resolve('periodo_carencia'),
    meses_vencimento: resolve('meses_vencimento'),
    prazo_utilizacao: resolve('prazo_utilizacao'),
    numero_prestacao: resolve('numero_prestacao', resolve('prazo')),
    capital_max_isento_imposto_selo: resolve('capital_max_isento_imposto_selo'),
    data_utilizacao: dadosStepper?.data_utilizacao || fillData(dados?.data_utilizacao, null),
    data_vencimento_prestacao1:
      dadosStepper?.data_vencimento_prestacao1 || fillData(dados?.data_vencimento_prestacao1, null),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function getDefaultsComissoes({ dadosStepper, dados, precario }) {
  const resolveBool = (key) => resolveField(key, { dadosStepper, dados, precario, fallback: false });

  return {
    comissao_avaliacao: resolveBool('comissao_avaliacao'),
    comissao_avaliacao_valor: dadosStepper?.comissao_avaliacao_valor || dados?.comissao_avaliacao?.valor || '',
    comissao_avaliacao_prazo: dadosStepper?.comissao_avaliacao_prazo || dados?.comissao_avaliacao?.prazo || '',
    comissao_avaliacao_periodicidade:
      dadosStepper?.comissao_avaliacao_periodicidade ||
      periodicidadesList?.find(({ id }) => id === dados?.comissao_avaliacao?.periodicidade) ||
      null,
    comissao_vistoria: resolveBool('comissao_vistoria'),
    comissao_vistoria_valor: dadosStepper?.comissao_vistoria_valor || dados?.comissao_vistoria?.valor || '',
    comissao_vistoria_prazo: dadosStepper?.comissao_vistoria_prazo || dados?.comissao_vistoria?.prazo || '',
    comissao_vistoria_periodicidade:
      dadosStepper?.comissao_vistoria_periodicidade ||
      periodicidadesList?.find(({ id }) => id === dados?.comissao_vistoria?.periodicidade) ||
      null,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function getDefaultsTaxas({ dadosStepper, dados, precario }) {
  const resolve = (key, fallback = '') => resolveField(key, { dadosStepper, dados, precario, fallback });

  let taxaJuroDesconto = resolveField('taxa_juro_desconto', { dadosStepper, dados, precario, fallback: null });

  if (taxaJuroDesconto === null) {
    const taxaDados = dados?.taxa_juro;
    const taxaPrecario = precario?.taxa_juro_precario?.default;

    if (taxaPrecario !== undefined && taxaPrecario !== null && taxaDados !== undefined && taxaDados !== null) {
      taxaJuroDesconto = taxaPrecario - taxaDados;
    } else {
      taxaJuroDesconto = '';
    }
  }

  return {
    modo_taxa_equivalente: resolveField('modo_taxa_equivalente', {
      dadosStepper,
      dados,
      precario,
      fallback: dadosStepper?.habitacao_propria_1,
    }),
    taxa_mora: resolve('taxa_mora', 2),
    taxa_juro_desconto: taxaJuroDesconto,
    taxa_imposto_selo: resolve('taxa_imposto_selo', 3.5),
    taxa_juro_precario: resolve('taxa_juro_precario', ''),
    taxa_comissao_abertura: resolve('taxa_comissao_abertura', 1.75),
    taxa_comissao_imobilizacao: resolve('taxa_comissao_imobilizacao', 0),
    taxa_imposto_selo_utilizacao: resolve('taxa_imposto_selo_utilizacao', 0.5),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function getDefaultsBens({ dadosStepper, dados }) {
  return {
    bens_financiados: normalizarBensFinanciados(dadosStepper?.bens_financiados ?? dados?.bens_financiados),
  };
}

function normalizarBensFinanciados(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return [];
  return lista.map((row) => {
    const tipoId = row?.tipo?.id ?? row?.tipo;
    const freguesia =
      row?.freguesia && typeof row.freguesia === 'object'
        ? row.freguesia
        : getFreguesia({ ilha: row?.ilha, freguesia: row?.freguesia }, listaFreguesias);
    return {
      ...row,
      freguesia,
      tipo: tipoId ? TIPOS_BEM_FINANCIADO.find((t) => t.id === tipoId) || null : null,
      data_emissao_fatura_proforma: fillData(row?.data_emissao_fatura_proforma, null),
    };
  });
}

// ---------------------------------------------------------------------------------------------------------------------

export function getDefaultsEntidade({ dadosStepper, dados }) {
  return {
    entidades_patronais: dadosStepper?.entidades_patronais || dados?.entidades_patronais || [],
    nome_empresa_fornecedora: dadosStepper?.nome_empresa_fornecedora || dados?.nome_empresa_fornecedora || '',
    nib_vendedor_ou_fornecedor: dadosStepper?.nib_vendedor_ou_fornecedor || dados?.nib_vendedor_ou_fornecedor || '',
    instituicao_credito_conta_vendedor_ou_fornecedor:
      dadosStepper?.instituicao_credito_conta_vendedor_ou_fornecedor ||
      dados?.instituicao_credito_conta_vendedor_ou_fornecedor ||
      '',
    valor_transferir_conta_vendedor_ou_fornecedor:
      dadosStepper?.valor_transferir_conta_vendedor_ou_fornecedor ||
      dados?.valor_transferir_conta_vendedor_ou_fornecedor ||
      '',
  };
}
