import * as Yup from 'yup';
// utils
import { fillData, formatDate } from '@/utils/formatTime';
// form
import { shapeText } from '@/components/hook-form/yup-shape';

// ── Helpers base -----------------------------------------------------------------------------------------------------

export function fromPrecario(precario, key, fallback = '') {
  const val = precario?.[key]?.default;
  return val !== undefined && val !== null && val !== '' ? val : fallback;
}

export function resolveField(key, { dadosStepper, dados, precario, fallback = '' }) {
  return dadosStepper?.[key] ?? dados?.[key] ?? fromPrecario(precario, key, fallback);
}

// ── Default values ---------------------------------------------------------------------------------------------------

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
    entidades_patronais: normalizarEntidadesPatronais(dadosStepper?.entidades_patronais ?? dados?.entidades_patronais),
  };
}

function normalizarEntidadesPatronais(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return [];
  return lista.map((row) => ({
    numero_entidade_mutuario: row?.numero_entidade_mutuario ?? '',
    numero_entidade_patronal: row?.numero_entidade_patronal ?? '',
  }));
}

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

  const comissaoOrig = (key) => dadosStepper?.[key] ?? dados?.[key] ?? null;

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
    comissao_avaliacao_ativa: !!comissaoOrig('comissao_avaliacao'),
    comissao_avaliacao: normalizarComissao(comissaoOrig('comissao_avaliacao')),
    comissao_vistoria_ativa: !!comissaoOrig('comissao_vistoria'),
    comissao_vistoria: normalizarComissao(comissaoOrig('comissao_vistoria')),
  };
}

export const PERIODICIDADES_COMISSAO = ['mensal', 'trimestral', 'semestral', 'anual'];

function normalizarComissao(comissao) {
  return {
    valor: comissao?.valor ?? '',
    prazo: comissao?.prazo ?? '',
    periodicidade: comissao?.periodicidade ?? '',
  };
}

export function getDefaultsObjeto({ dadosStepper, dados, imoveisList }) {
  return {
    bem_servico_financiado: dadosStepper?.bem_servico_financiado || dados?.bem_servico_financiado || '',
    finalidade_credito_habitacao:
      dadosStepper?.finalidade_credito_habitacao || dados?.finalidade_credito_habitacao || '',
    tipo_imovel_id: dadosStepper?.tipo_imovel_id || imoveisList?.find((i) => i.id === dados?.tipo_imovel_id) || null,
    bens_financiados: normalizarBensFinanciados(dadosStepper?.bens_financiados ?? dados?.bens_financiados),
  };
}

export const TIPOS_BEM_FINANCIADO = [
  { id: 'apartamento', label: 'Apartamento' },
  { id: 'predio', label: 'Prédio' },
  { id: 'terreno', label: 'Terreno' },
  { id: 'veiculo', label: 'Veículo' },
  { id: 'equipamento', label: 'Equipamento' },
  { id: 'outro', label: 'Outro' },
];

export const bemFinanciadoSchema = {
  tipo: null,
  nip: '',
  numero_descricao_predial: '',
  numero_matriz: '',
  tipo_matriz: '',
  identificacao_fracao: '',
  numero_andar: '',
  area: '',
  numero_inscricao_hipoteca: '',
  localizacao_conservatoria: '',
  ilha: '',
  concelho: '',
  freguesia: '',
  zona: '',
  rua: '',
  numero_porta: '',
  matricula: '',
  marca: '',
  modelo: '',
  ano_fabrico: '',
  nura: '',
  valor: '',
  valor_avaliacao: '',
  descritivo: '',
};

function normalizarBensFinanciados(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return [];
  return lista.map((row) => ({
    ...bemFinanciadoSchema,
    ...row,
    tipo: row?.tipo ? TIPOS_BEM_FINANCIADO.find((t) => t.id === row.tipo) || null : null,
  }));
}

export function getDefaultsEntidade({ dadosStepper, dados }) {
  return {
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

// ── Form schemas -----------------------------------------------------------------------------------------------------

export const schemaRegime = Yup.object().shape({
  nivel_formacao: shapeText('credibolsa', [true], 'Nível de formação'),
  designacao_curso: shapeText('credibolsa', [true], 'Designação do curso'),
  localizacao_estabelecimento_ensino: shapeText('credibolsa', [true], 'Localização'),
  estabelecimento_ensino: shapeText('credibolsa', [true], 'Estabelecimento de ensino'),
  montante_tranches_credibolsa: shapeText('credibolsa', [true], 'Montante das tranches'),
  entidades_patronais: Yup.array().when('colaborador_empresa_parceira', {
    is: true,
    then: (s) =>
      s.min(1, 'Indique pelo menos uma entidade patronal').of(
        Yup.object({
          numero_entidade_mutuario: Yup.number()
            .transform((v, o) => (o === '' ? undefined : v))
            .positive()
            .integer()
            .required()
            .label('Nº entidade mutuário'),
          numero_entidade_patronal: Yup.number()
            .transform((v, o) => (o === '' ? undefined : v))
            .positive()
            .integer()
            .required()
            .label('Nº entidade patronal'),
        })
      ),
    otherwise: (s) => s.notRequired(),
  }),
});

const shapeComissao = (ativaKey) =>
  Yup.object({
    valor: Yup.number()
      .transform((v, o) => (o === '' ? undefined : v))
      .positive()
      .required()
      .label('Valor'),
    prazo: Yup.number()
      .transform((v, o) => (o === '' ? undefined : v))
      .positive()
      .integer()
      .required()
      .label('Prazo (meses)'),
    periodicidade: Yup.string()
      .oneOf(PERIODICIDADES_COMISSAO, 'Periodicidade inválida')
      .required()
      .label('Periodicidade'),
  }).when(ativaKey, {
    is: false,
    then: (s) => s.strip(),
  });

export const schemaTaxas = Yup.object().shape({
  taxa_mora: Yup.number().min(0).max(100).required().label('Taxa de mora'),
  taxa_juro_desconto: Yup.number().min(0).max(100).required().label('Spread'),
  taxa_imposto_selo: Yup.number().positive().max(100).required().label('Taxa de imposto selo'),
  taxa_juro_precario: Yup.number().positive().max(100).required().label('Taxa de juros precário'),
  taxa_comissao_abertura: Yup.number().min(0).max(100).required().label('Taxa de comissão abertura'),
  taxa_imposto_selo_utilizacao: Yup.number().min(0).max(100).required().label('Taxa imp. selo utilização'),
  taxa_comissao_imobilizacao: Yup.number().min(0).max(100).required().label('Taxa de comissão imobilização'),
  comissao_avaliacao: Yup.mixed().when('comissao_avaliacao_ativa', {
    is: true,
    then: () => shapeComissao('comissao_avaliacao_ativa'),
    otherwise: () => Yup.mixed().notRequired(),
  }),
  comissao_vistoria: Yup.mixed().when('comissao_vistoria_ativa', {
    is: true,
    then: () => shapeComissao('comissao_vistoria_ativa'),
    otherwise: () => Yup.mixed().notRequired(),
  }),
});

// schemaCondicoes depende de dadosStepper em runtime, por isso é uma função
export const getSchemaCondicoes = (dadosStepper) =>
  Yup.object().shape({
    numero_prestacao: Yup.number().positive().integer().required().label('Nº de prestações'),
    capital_max_isento_imposto_selo: dadosStepper?.tem_isencao_imposto_selo
      ? Yup.number().positive().required().label('Capital máx. isento imp. selo')
      : Yup.mixed().notRequired(),
  });

const tiposImovel = ['apartamento', 'predio', 'terreno'];

const bemFinanciadoShape = Yup.object({
  tipo: Yup.mixed().required().label('Tipo do bem'),
  matricula: Yup.string()
    .nullable()
    .test('matricula-veiculo', 'Matrícula é obrigatória para veículo', function (value) {
      const tipoId = this.parent?.tipo?.id ?? this.parent?.tipo;
      return tipoId === 'veiculo' ? Boolean(value) : true;
    }),
  nip: Yup.string()
    .nullable()
    .test('identificador-imovel', 'Indique NIP ou Nº matriz + descrição predial', function (value) {
      const tipoId = this.parent?.tipo?.id ?? this.parent?.tipo;
      if (!tiposImovel.includes(tipoId)) return true;
      const { numero_matriz, numero_descricao_predial } = this.parent;
      return Boolean(value) || (Boolean(numero_matriz) && Boolean(numero_descricao_predial));
    }),
  descritivo: Yup.string()
    .nullable()
    .test('descritivo-outro', 'Descritivo é obrigatório', function (value) {
      const tipoId = this.parent?.tipo?.id ?? this.parent?.tipo;
      return tipoId === 'equipamento' || tipoId === 'outro' ? Boolean(value) : true;
    }),
});

export const schemaObjeto = Yup.object().shape({
  bens_financiados: Yup.array().of(bemFinanciadoShape),
});

// ── Payload final (onSubmit do step Entidade) ------------------------------------------------------------------------

export function buildPayload(rawData) {
  const dataFormatted = {
    // Valores calculados
    taxa_taeg: '0',
    valor_juro: '0',
    custo_total: '0',
    valor_comissao: '0',
    valor_prestacao: '0',
    valor_imposto_selo: '0',
    valor_prestacao_sem_desconto: '0',
    // Numéricos
    numero_prestacao: Number(rawData.numero_prestacao || 0),
    conta_do_renda: rawData.conta_do_renda ? Number(rawData.conta_do_renda) : undefined,
    meses_vencimento: rawData.meses_vencimento ? Number(rawData.meses_vencimento) : undefined,
    periodo_carencia: rawData.periodo_carencia ? Number(rawData.periodo_carencia) : undefined,
    prazo_utilizacao: rawData.prazo_utilizacao ? Number(rawData.prazo_utilizacao) : undefined,
    tipo_imovel_id: rawData.tipo_imovel_id?.id ? Number(rawData.tipo_imovel_id?.id) : undefined,
    // Taxas
    taxa_mora: String(rawData.taxa_mora || '0'),
    taxa_imposto_selo: String(rawData.taxa_imposto_selo || '0'),
    taxa_juro_precario: String(rawData.taxa_juro_precario || '0'),
    taxa_juro_desconto: String(rawData.taxa_juro_desconto || '0'),
    modo_taxa_equivalente: Boolean(rawData.modo_taxa_equivalente),
    taxa_comissao_abertura: String(rawData.taxa_comissao_abertura || '0'),
    taxa_imposto_selo_utilizacao: String(rawData.taxa_imposto_selo_utilizacao || '0'),
    taxa_comissao_imobilizacao: rawData.taxa_comissao_imobilizacao
      ? String(rawData.taxa_comissao_imobilizacao)
      : undefined,
    // Opcionais
    capital_max_isento_imposto_selo: rawData.capital_max_isento_imposto_selo
      ? String(rawData.capital_max_isento_imposto_selo)
      : undefined,
    valor_transferir_conta_vendedor_ou_fornecedor: rawData.valor_transferir_conta_vendedor_ou_fornecedor
      ? String(rawData.valor_transferir_conta_vendedor_ou_fornecedor)
      : undefined,
    // Booleanos
    revolving: Boolean(rawData.revolving),
    bonificado: Boolean(rawData.bonificado),
    isento_comissao: Boolean(rawData.isento_comissao),
    jovem_bonificado: Boolean(rawData.jovem_bonificado),
    habitacao_propria_1: Boolean(rawData.habitacao_propria_1),
    tem_isencao_imposto_selo: Boolean(rawData.tem_isencao_imposto_selo),
    colaborador_empresa_parceira: Boolean(rawData.colaborador_empresa_parceira),
    // Datas
    data_utilizacao: rawData.data_utilizacao ? formatDate(rawData.data_utilizacao, 'yyyy-MM-dd') : '',
    data_vencimento_prestacao1: rawData.data_vencimento_prestacao1
      ? formatDate(rawData.data_vencimento_prestacao1, 'yyyy-MM-dd')
      : '',
    // Strings
    bem_servico_financiado: String(rawData.bem_servico_financiado || ''),
    nome_empresa_fornecedora: String(rawData.nome_empresa_fornecedora || ''),
    nib_vendedor_ou_fornecedor: String(rawData.nib_vendedor_ou_fornecedor || ''),
    finalidade_credito_habitacao: String(rawData.finalidade_credito_habitacao || ''),
    instituicao_credito_conta_vendedor_ou_fornecedor: String(
      rawData.instituicao_credito_conta_vendedor_ou_fornecedor || ''
    ),
    // Credibolsa
    nivel_formacao: rawData?.credibolsa ? String(rawData.nivel_formacao) : '',
    designacao_curso: rawData?.credibolsa ? String(rawData.designacao_curso) : '',
    estabelecimento_ensino: rawData?.credibolsa ? String(rawData.estabelecimento_ensino) : '',
    localizacao_estabelecimento_ensino: rawData?.credibolsa ? rawData.localizacao_estabelecimento_ensino : '',
    montante_tranches_credibolsa: rawData?.credibolsa ? String(rawData.montante_tranches_credibolsa) : undefined,
    // v2 — entidades patronais (obrigatório se colaborador_empresa_parceira)
    entidades_patronais: rawData?.colaborador_empresa_parceira
      ? mapEntidadesPatronais(rawData?.entidades_patronais)
      : undefined,
    // v2 — comissões adicionais (opcionais, entram no cálculo de TAEG)
    comissao_avaliacao: rawData?.comissao_avaliacao_ativa ? mapComissao(rawData?.comissao_avaliacao) : undefined,
    comissao_vistoria: rawData?.comissao_vistoria_ativa ? mapComissao(rawData?.comissao_vistoria) : undefined,
    // v2 — bens financiados
    bens_financiados: mapBensFinanciados(rawData?.bens_financiados),
  };

  return Object.fromEntries(Object.entries(dataFormatted).filter(([, value]) => value !== undefined && value !== ''));
}

function mapEntidadesPatronais(lista) {
  const valid = (lista ?? []).filter((row) => row?.numero_entidade_mutuario && row?.numero_entidade_patronal);
  if (valid.length === 0) return undefined;
  return valid.map((row) => ({
    numero_entidade_mutuario: Number(row.numero_entidade_mutuario),
    numero_entidade_patronal: Number(row.numero_entidade_patronal),
  }));
}

function mapComissao(comissao) {
  if (!comissao?.valor || !comissao?.prazo || !comissao?.periodicidade) return undefined;
  return {
    valor: String(comissao.valor),
    prazo: Number(comissao.prazo),
    periodicidade: comissao.periodicidade,
  };
}

function mapBensFinanciados(lista) {
  const valid = (lista ?? []).filter((bem) => bem?.tipo?.id || bem?.tipo);
  if (valid.length === 0) return undefined;
  return valid.map((bem) => {
    const tipo = bem?.tipo?.id ?? bem?.tipo;
    const out = { tipo };
    [
      'nip',
      'numero_descricao_predial',
      'numero_matriz',
      'tipo_matriz',
      'identificacao_fracao',
      'numero_andar',
      'area',
      'numero_inscricao_hipoteca',
      'localizacao_conservatoria',
      'ilha',
      'concelho',
      'freguesia',
      'zona',
      'rua',
      'numero_porta',
      'matricula',
      'marca',
      'modelo',
      'ano_fabrico',
      'nura',
      'descritivo',
    ].forEach((key) => {
      if (bem?.[key] !== undefined && bem?.[key] !== '' && bem?.[key] !== null) out[key] = String(bem[key]);
    });
    if (bem?.valor !== undefined && bem?.valor !== '' && bem?.valor !== null) out.valor = String(bem.valor);
    if (bem?.valor_avaliacao !== undefined && bem?.valor_avaliacao !== '' && bem?.valor_avaliacao !== null)
      out.valor_avaliacao = String(bem.valor_avaliacao);
    return out;
  });
}
