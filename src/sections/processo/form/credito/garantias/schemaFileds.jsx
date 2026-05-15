import { listaFreguesias } from '@/_mock';

// ---------------------------------------------------------------------------------------------------------------------

export const seguroSchema = {
  tipo: null,
  seguradora: null,
  valor: '',
  premio: '',
  apolice: '',
  periodicidade: null,
  percentagem_cobertura: '',
}; // mantém-se cobertura para seguros nested (apólices sobre o bem)

// ---------------------------------------------------------------------------------------------------------------------

export const tituloSchema = { codigo: '', numero_cliente: '', seguros: [] };

// ---------------------------------------------------------------------------------------------------------------------

export const imovelSchema = {
  zona: '',
  rua: '',
  descritivo: '',
  numero_porta: '',
  nip: '',
  area: '',
  valor_avaliacao: '',
  numero_andar: '',
  numero_matriz: '',
  numero_inscricao_hipoteca: '',
  identificacao_fracao: '',
  numero_descricao_predial: '',
  localizacao_conservatoria: '',
  ilha: '',
  concelho: '',
  freguesia: null,
  tipo_matriz: null,
  bem_financiado: false,
  donos: [],
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export const veiculoSchema = {
  nura: '',
  marca: '',
  valor: '',
  modelo: '',
  valor_avaliacao: '',
  matricula: '',
  ano_fabrico: '',
  localizacao_conservatoria: '',
  bem_financiado: false,
  donos: [],
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export function construirSchemaImovel(row, tiposSeguros = []) {
  if (!row) return null;
  const seguros = (rows) =>
    rows?.map((s) => {
      const id = s?.tipo?.id ?? s?.tipo_seguro_id;
      const label =
        s?.tipo?.label ||
        s?.tipo_seguro ||
        (tiposSeguros ?? []).find((t) => t?.id === id)?.designacao ||
        '';
      return { ...s, tipo: id ? { id, label } : null };
    });

  const morada = row?.morada ?? row;
  const freg = listaFreguesias?.find(
    ({ ilha, freguesia }) => ilha === morada?.ilha && freguesia === morada?.freguesia
  );

  return {
    ...row,
    numero_inscricao_hipoteca: row?.numero_inscricao_hipoteca ?? '',
    rua: morada?.rua ?? '',
    zona: morada?.zona ?? '',
    descritivo: morada?.descritivo ?? '',
    numero_porta: morada?.numero_porta ?? '',
    ilha: morada?.ilha ?? row?.ilha ?? freg?.ilha ?? '',
    concelho: morada?.concelho ?? row?.concelho ?? freg?.concelho ?? '',
    freguesia: freg ? { ...freg, label: freg.freguesia } : null,
    valor_avaliacao: row?.valor_avaliacao ?? '',
    bem_financiado: Boolean(row?.bem_financiado),
    seguros: Array.isArray(row?.seguros) ? seguros(row.seguros) : [],
    donos: Array.isArray(row?.donos)
      ? row.donos.map((d) => ({ numero_entidade: d.numero ?? d.numero_entidade ?? '' }))
      : [],
  };
}
