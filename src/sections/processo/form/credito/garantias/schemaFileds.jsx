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
};

// ---------------------------------------------------------------------------------------------------------------------

export const tituloSchema = { codigo: '', numero_cliente: '', percentagem_cobertura: '', seguros: [] };

// ---------------------------------------------------------------------------------------------------------------------

export const imovelSchema = {
  zona: '',
  rua: '',
  descritivo: '',
  numero_porta: '',
  nip: '',
  area: '',
  valor_pvt: '',
  numero_andar: '',
  numero_matriz: '',
  numero_inscricao_hipoteca: '',
  identificacao_fracao: '',
  percentagem_cobertura: '',
  numero_descricao_predial: '',
  localizacao_conservatoria: '',
  freguesia: null,
  tipo_matriz: null,
  donos: [],
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export const veiculoSchema = {
  nura: '',
  marca: '',
  valor: '',
  modelo: '',
  valor_pvt: '',
  matricula: '',
  ano_fabrico: '',
  percentagem_cobertura: '',
  donos: [],
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export function construirSchemaImoveis(dados = []) {
  const seguros = (rows) =>
    rows?.map((row) => ({ ...row, tipo: { id: row?.tipo_seguro_id, label: row?.tipo_seguro } }));

  return dados?.map((row) => {
    // Aceita morada nested (formato antigo) ou flat (formato v2)
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
      freguesia: freg ? { ...freg, label: freg.freguesia } : null,
      // valor_pvt mantém-se como campo da UI; em v2 chega como valor_avaliacao
      valor_pvt: row?.valor_pvt ?? row?.valor_avaliacao ?? '',
      seguros: Array.isArray(row?.seguros) ? seguros(row.seguros) : [],
      donos: Array.isArray(row?.donos)
        ? row.donos.map((d) => ({ numero_entidade: d.numero ?? d.numero_entidade ?? '' }))
        : [],
    };
  });
}
