// utils
import { formatDate } from '@/utils/formatTime';

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
    taxa_comissao_imobilizacao: String(rawData.taxa_comissao_imobilizacao) || undefined,
    // Comissões
    comissao_avaliacao: rawData.comissao_avaliacao
      ? {
          valor: rawData.comissao_avaliacao_valor,
          prazo: rawData.comissao_avaliacao_prazo,
          periodicidade: rawData?.comissao_avaliacao_periodicidade?.id,
        }
      : undefined,
    comissao_vistoria: rawData.comissao_vistoria
      ? {
          valor: rawData.comissao_vistoria_valor,
          prazo: rawData.comissao_vistoria_prazo,
          periodicidade: rawData?.comissao_vistoria_periodicidade?.id,
        }
      : undefined,
    // Opcionais
    capital_max_isento_imposto_selo: String(rawData.capital_max_isento_imposto_selo) || undefined,
    valor_transferir_conta_vendedor_ou_fornecedor:
      String(rawData.valor_transferir_conta_vendedor_ou_fornecedor) || undefined,
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
    nome_empresa_fornecedora: rawData.nome_empresa_fornecedora || '',
    nib_vendedor_ou_fornecedor: String(rawData.nib_vendedor_ou_fornecedor || ''),
    instituicao_credito_conta_vendedor_ou_fornecedor: rawData.instituicao_credito_conta_vendedor_ou_fornecedor || '',
    // Credibolsa
    nivel_formacao: rawData?.credibolsa ? String(rawData.nivel_formacao) : '',
    designacao_curso: rawData?.credibolsa ? String(rawData.designacao_curso) : '',
    estabelecimento_ensino: rawData?.credibolsa ? String(rawData.estabelecimento_ensino) : '',
    localizacao_estabelecimento_ensino: rawData?.credibolsa ? rawData.localizacao_estabelecimento_ensino : '',
    montante_tranches_credibolsa: rawData?.credibolsa ? String(rawData.montante_tranches_credibolsa) : undefined,
    // Entidades patronais
    entidades_patronais: rawData.entidades_patronais?.length > 0 ? rawData.entidades_patronais : undefined,
    // bens financiados
    bens_financiados: mapBensFinanciados(rawData?.bens_financiados),
  };

  return Object.fromEntries(Object.entries(dataFormatted).filter(([, value]) => value !== undefined && value !== ''));
}

// ── Bens financiados -------------------------------------------------------------------------------------------------

const IMOVEIS = ['apartamento', 'predio', 'terreno'];

function mapBensFinanciados(dados = []) {
  if (!dados?.length) return undefined;

  return dados.map((bem) => {
    const tipo = bem?.tipo?.id;
    const isImovel = IMOVEIS.includes(tipo);
    const registado = !bem?.bem_sem_registo;
    const data_emissao_fatura_proforma =
      !registado && bem.data_emissao_fatura_proforma ? formatDate(bem.data_emissao_fatura_proforma, 'yyyy-MM-dd') : '';

    const limpar = {
      ...(isImovel && !registado && { numero_inscricao_hipoteca: '' }),
      ...(isImovel && bem?.nip && { numero_matriz: '', numero_descricao_predial: '' }),
      ...(isImovel && !bem?.nip && (bem?.numero_matriz || bem?.numero_descricao_predial) && { nip: '' }),
      ...(tipo === 'veiculo' &&
        registado && { numero_fatura_proforma: '', emissora_fatura_proforma: '', data_emissao_fatura_proforma: '' }),
      ...(tipo === 'veiculo' && !registado && { nura: '', matricula: '', localizacao_conservatoria: '' }),
    };

    const derivados = isImovel
      ? { ilha: bem?.freguesia?.ilha, concelho: bem?.freguesia?.concelho, freguesia: bem?.freguesia?.freguesia }
      : {};

    return { ...bem, ...limpar, ...derivados, data_emissao_fatura_proforma, tipo };
  });
}
