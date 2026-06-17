// utils
import { formatDate } from '@/utils/formatTime';

const IMOVEIS = ['apartamento', 'predio', 'terreno'];

// ---------------------------------------------------------------------------------------------------------------------

export default function composeGarantiaPayload(form, meta, chaveMeta) {
  const registado = !meta?.bem_sem_registo;
  const isImovel = IMOVEIS.includes(chaveMeta);

  const limpar = {
    ...(isImovel && !registado && { numero_inscricao_hipoteca: '' }),
    ...(isImovel && meta?.nip && { numero_matriz: '', numero_descricao_predial: '' }),
    ...(isImovel && !meta?.nip && (meta?.numero_matriz || meta?.numero_descricao_predial) && { nip: '' }),
    ...(chaveMeta === 'veiculo' &&
      registado && { numero_fatura_proforma: '', emissora_fatura_proforma: '', data_emissao_fatura_proforma: '' }),
    ...(chaveMeta === 'veiculo' && !registado && { nura: '', matricula: '', localizacao_conservatoria: '' }),
  };

  const derivados = isImovel
    ? { ilha: meta?.freguesia?.ilha, concelho: meta?.freguesia?.concelho, freguesia: meta?.freguesia?.freguesia }
    : {};

  return {
    valor_garantia: '',
    tipo_garantia_id: form?.tipo_garantia?.id ?? null,
    subtipo_garantia_id: form?.subtipo_garantia?.id ?? null,
    percentagem_cobertura: String(form?.percentagem_cobertura ?? ''),
    metadados: (chaveMeta === 'fianca' && { garantidores: (meta?.garantidores ?? []).map(mapGarante) }) ||
      (chaveMeta === 'livranca' && {
        numero_livranca: meta?.numero_livranca ?? '',
        ...(meta.garantidores?.length ? { garantidores: meta.garantidores.map(mapGarante) } : {}),
      }) || {
        bem: {
          ...meta,
          tipo: chaveMeta,
          bem_financiado: !!meta?.bem_financiado,
          donos: (meta?.donos ?? []).map(mapDono),
          seguros: (meta?.seguros ?? []).map(mapSeguro),
          //
          montante_empenhado: '', //??????????????????
          //
          bem_sem_registo: !!meta?.bem_sem_registo,
          data_emissao_fatura_proforma:
            !registado && meta.data_emissao_fatura_proforma
              ? formatDate(meta.data_emissao_fatura_proforma, 'yyyy-MM-dd')
              : '',
          ...limpar,
          ...derivados,
        },
      },
  };
}

// Mapeadores  ---------------------------------------------------------------------------------------------------------

function mapGarante(fiador) {
  return { numero_entidade: fiador?.numero_entidade ?? '' };
}

function mapSeguro(seguro) {
  return {
    apolice: seguro?.apolice ?? '',
    valor: String(seguro?.valor ?? ''),
    seguradora: seguro?.seguradora ?? '',
    premio: String(seguro?.premio ?? ''),
    periodicidade: seguro?.periodicidade?.id ?? '',
    tipo_seguro_id: seguro?.tipo_seguro?.id ?? null,
    percentagem_cobertura: String(seguro?.percentagem_cobertura ?? ''),
  };
}

function mapDono(dono) {
  return { numero: dono?.numero_entidade ?? '' };
}
