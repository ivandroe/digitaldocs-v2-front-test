export default function composeGarantiaPayload(form, chaveMeta) {
  const metadados = chaveMeta && metaBuilders[chaveMeta] ? metaBuilders[chaveMeta](form) : {};

  return {
    tipo_garantia_id: form?.tipo_garantia?.id ?? null,
    subtipo_garantia_id: form?.subtipo_garantia?.id ?? null,
    percentagem_cobertura: String(form?.percentagem_cobertura ?? ''),
    metadados,
  };
}

const metaBuilders = {
  fiadores: (form) => ({ fiadores: (form?.fiadores ?? []).map(mapFiador) }),
  livrancas: (form) => ({ livrancas: (form?.livrancas ?? []).map(mapLivranca) }),
  seguros: (form) => ({ seguros: (form?.seguros ?? []).map(mapSeguro) }),
  contas: (form) => ({ contas: (form?.contas ?? []).map(mapContas) }),
  titulos: (form) => ({ titulos: (form?.titulos ?? []).map(mapTitulo) }),
  veiculos: (form) => ({ imoveis: { veiculos: (form?.veiculos ?? []).map(mapVeiculo) } }),
  predios: (form) => ({ imoveis: { predios: (form?.predios ?? []).map((p) => mapImovel('predio', p)) } }),
  terrenos: (form) => ({ imoveis: { terrenos: (form?.terrenos ?? []).map((t) => mapImovel('terreno', t)) } }),
  apartamentos: (form) => ({
    imoveis: { apartamentos: (form?.apartamentos ?? []).map((a) => mapImovel('apartamento', a)) },
  }),
};

// Mapeadores principais -----------------------------------------------------------------------------------------------

function mapFiador(fiador) {
  return { numero_entidade: fiador?.numero_entidade ?? '' };
}

function mapLivranca(livranca) {
  return livranca;
}

function mapSeguro(seguro) {
  return {
    apolice: seguro?.apolice ?? '',
    valor: String(seguro?.valor ?? ''),
    seguradora: seguro?.seguradora ?? '',
    premio: String(seguro?.premio ?? ''),
    tipo_seguro_id: seguro?.tipo?.id ?? null,
    periodicidade: seguro?.periodicidade ?? '',
    percentagem_cobertura: String(seguro?.percentagem_cobertura ?? ''),
  };
}

function mapContas(contas) {
  return {
    numero_conta: contas?.numero_conta ?? '',
    percentagem_cobertura: String(contas?.percentagem_cobertura ?? ''),
  };
}

// Veículos ------------------------------------------------------------------------------------------------------------

function mapVeiculo(veiculo) {
  return {
    nura: veiculo?.nura,
    marca: veiculo?.marca,
    modelo: veiculo?.modelo,
    matricula: veiculo?.matricula,
    valor: String(veiculo?.valor ?? ''),
    ano_fabrico: String(veiculo?.ano_fabrico),
    valor_pvt: String(veiculo?.valor_pvt ?? ''),
    donos: (veiculo?.donos ?? []).map(mapDono),
    seguros: (veiculo?.seguros ?? []).map(mapSeguro),
    percentagem_cobertura: String(veiculo?.percentagem_cobertura ?? ''),
  };
}

// Imóveis -------------------------------------------------------------------------------------------------------------

// Campos específicos por tipo de imóvel
const IMOVEL_EXTRA_FIELDS = {
  apartamento: (src) => ({
    numero_andar: src?.numero_andar ?? '',
    identificacao_fracao: src?.identificacao_fracao ?? '',
  }),
  terreno: (src) => ({ area: src?.area ?? '' }),
  predio: () => ({}),
};

function mapImovel(tipo, src) {
  const extraFields = IMOVEL_EXTRA_FIELDS[tipo];

  return {
    nip: src?.nip ?? '',
    tipo_matriz: src?.tipo_matriz ?? '',
    valor_pvt: String(src?.valor_pvt ?? ''),
    numero_matriz: src?.numero_matriz ?? '',
    numero_descricao_predial: src?.numero_descricao_predial ?? '',
    numero_inscricao_hipoteca: src?.numero_inscricao_hipoteca ?? '',
    localizacao_conservatoria: src?.localizacao_conservatoria ?? '',
    percentagem_cobertura: String(src?.percentagem_cobertura ?? ''),
    morada: mapMorada(src),
    donos: (src?.donos ?? []).map(mapDono),
    seguros: (src?.seguros ?? []).map(mapSeguro),
    ...extraFields(src),
  };
}

// Títulos -------------------------------------------------------------------------------------------------------------

function mapTitulo(titulo) {
  return {
    codigo: titulo?.codigo ?? '',
    numero_cliente: titulo?.numero_cliente ?? '',
    percentagem_cobertura: String(titulo?.percentagem_cobertura ?? ''),
    seguros: (titulo?.seguros ?? []).map(mapSeguro),
  };
}

// Utilitários ---------------------------------------------------------------------------------------------------------

function mapMorada(morada) {
  return {
    rua: morada?.rua ?? '',
    zona: morada?.zona ?? '',
    ilha: morada?.freguesia?.ilha ?? '',
    descritivo: morada?.descritivo ?? '',
    numero_porta: morada?.numero_porta ?? '',
    concelho: morada?.freguesia?.concelho ?? '',
    freguesia: morada?.freguesia?.freguesia ?? '',
  };
}

function mapDono(dono) {
  return { numero: dono?.numero_entidade ?? '' };
}
