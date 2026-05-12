// Composição/unpacking de metadados de garantia (formato v2 — bens[]/garantidores[]/numero_livranca)
// O estado interno do formulário mantém a forma antiga (predios, terrenos, contas, ...) para minimizar
// disrupção nos componentes; a conversão acontece apenas nas fronteiras (submit / load).

const TIPO_IMOVEL = { predios: 'predio', terrenos: 'terreno', apartamentos: 'apartamento' };

// ── Submit -----------------------------------------------------------------------------------------------------------

export default function composeGarantiaPayload(form, chaveMeta) {
  const metadados = buildMetadados(form, chaveMeta);

  return {
    tipo_garantia_id: form?.tipo_garantia?.id ?? null,
    subtipo_garantia_id: form?.subtipo_garantia?.id ?? null,
    percentagem_cobertura: String(form?.percentagem_cobertura ?? ''),
    metadados,
  };
}

function buildMetadados(form, chaveMeta) {
  const meta = { bens: [], garantidores: [] };

  switch (chaveMeta) {
    case 'fiadores':
      meta.garantidores = (form?.fiadores ?? []).map(mapGarantidor);
      break;
    case 'livrancas': {
      const primeira = (form?.livrancas ?? [])[0];
      if (primeira?.numero_livranca) meta.numero_livranca = String(primeira.numero_livranca);
      meta.garantidores = (primeira?.avalistas ?? []).map(mapGarantidor);
      break;
    }
    case 'contas':
      meta.bens = (form?.contas ?? []).map((row) => ({ tipo: 'dp', ...mapContaDp(row) }));
      break;
    case 'titulos':
      meta.bens = (form?.titulos ?? []).map((row) => ({ tipo: 'titulo', ...mapTitulo(row) }));
      break;
    case 'seguros':
      // Quando o seguro é o próprio bem dado em garantia
      meta.bens = (form?.seguros ?? []).map((row) => ({ tipo: 'seguro', ...mapSeguroComoBem(row) }));
      break;
    case 'predios':
    case 'terrenos':
    case 'apartamentos':
      meta.bens = (form?.[chaveMeta] ?? []).map((row) => ({ tipo: TIPO_IMOVEL[chaveMeta], ...mapImovel(row) }));
      break;
    case 'veiculos':
      meta.bens = (form?.veiculos ?? []).map((row) => ({ tipo: 'veiculo', ...mapVeiculo(row) }));
      break;
    default:
      break;
  }

  return meta;
}

// ── Unpack (carregar do backend para o form) -------------------------------------------------------------------------

export function unpackGarantiaMetadados(metadados, chaveMeta) {
  const empty = {
    contas: [],
    titulos: [],
    seguros: [],
    fiadores: [],
    livrancas: [],
    predios: [],
    terrenos: [],
    veiculos: [],
    apartamentos: [],
  };
  if (!metadados) return empty;

  // Compatibilidade: se vier no formato antigo, devolve directamente os arrays existentes
  if (metadados?.imoveis || metadados?.fiadores || metadados?.livrancas) {
    return {
      ...empty,
      contas: metadados?.contas ?? [],
      titulos: metadados?.titulos ?? [],
      seguros: metadados?.seguros ?? [],
      fiadores: metadados?.fiadores ?? [],
      livrancas: metadados?.livrancas ?? [],
      predios: metadados?.imoveis?.predios ?? [],
      terrenos: metadados?.imoveis?.terrenos ?? [],
      veiculos: metadados?.imoveis?.veiculos ?? [],
      apartamentos: metadados?.imoveis?.apartamentos ?? [],
    };
  }

  // Formato v2 — { numero_livranca, bens[], garantidores[] }
  const bens = metadados?.bens ?? [];
  const grupos = {
    apartamento: [],
    predio: [],
    terreno: [],
    veiculo: [],
    dp: [],
    titulo: [],
    seguro: [],
  };
  bens.forEach((bem) => {
    if (bem?.tipo && grupos[bem.tipo]) grupos[bem.tipo].push(bem);
  });

  const out = {
    ...empty,
    predios: grupos.predio,
    terrenos: grupos.terreno,
    apartamentos: grupos.apartamento,
    veiculos: grupos.veiculo,
    contas: grupos.dp,
    titulos: grupos.titulo,
    seguros: grupos.seguro,
  };

  if (chaveMeta === 'livrancas' && metadados?.numero_livranca) {
    out.livrancas = [{ numero_livranca: metadados.numero_livranca, avalistas: metadados?.garantidores ?? [] }];
  } else {
    out.fiadores = metadados?.garantidores ?? [];
  }
  return out;
}

// ── Mapeadores --------------------------------------------------------------------------------------------------------

function mapGarantidor(row) {
  return {
    numero_entidade: row?.numero_entidade ? Number(row.numero_entidade) : undefined,
  };
}

function mapContaDp(row) {
  return {
    numero_conta: row?.numero_conta ?? '',
    percentagem_cobertura: String(row?.percentagem_cobertura ?? ''),
  };
}

function mapTitulo(row) {
  return {
    codigo: row?.codigo ?? '',
    numero_cliente: row?.numero_cliente ? Number(row.numero_cliente) : undefined,
    percentagem_cobertura: String(row?.percentagem_cobertura ?? ''),
    seguros: (row?.seguros ?? []).map(mapSeguroDoBem),
  };
}

function mapVeiculo(row) {
  return {
    nura: row?.nura ?? '',
    marca: row?.marca ?? '',
    modelo: row?.modelo ?? '',
    matricula: row?.matricula ?? '',
    ano_fabrico: row?.ano_fabrico ? String(row.ano_fabrico) : '',
    valor: row?.valor ? String(row.valor) : '',
    valor_avaliacao: row?.valor_pvt ? String(row.valor_pvt) : '',
    percentagem_cobertura: String(row?.percentagem_cobertura ?? ''),
    donos: (row?.donos ?? []).map(mapDono),
    seguros: (row?.seguros ?? []).map(mapSeguroDoBem),
  };
}

function mapImovel(row) {
  const morada = mapMorada(row);
  return {
    nip: row?.nip ?? '',
    tipo_matriz: row?.tipo_matriz ?? '',
    numero_matriz: row?.numero_matriz ?? '',
    numero_descricao_predial: row?.numero_descricao_predial ?? '',
    numero_inscricao_hipoteca: row?.numero_inscricao_hipoteca ?? '',
    localizacao_conservatoria: row?.localizacao_conservatoria ?? '',
    identificacao_fracao: row?.identificacao_fracao ?? '',
    numero_andar: row?.numero_andar ?? '',
    area: row?.area ?? '',
    valor_avaliacao: row?.valor_pvt ? String(row.valor_pvt) : '',
    percentagem_cobertura: String(row?.percentagem_cobertura ?? ''),
    ...morada,
    donos: (row?.donos ?? []).map(mapDono),
    seguros: (row?.seguros ?? []).map(mapSeguroDoBem),
  };
}

function mapSeguroDoBem(seguro) {
  return {
    apolice: seguro?.apolice ?? '',
    valor: String(seguro?.valor ?? ''),
    seguradora: seguro?.seguradora ?? '',
    premio: String(seguro?.premio ?? ''),
    tipo_seguro_id: seguro?.tipo?.id ?? seguro?.tipo_seguro_id ?? null,
    periodicidade: seguro?.periodicidade ?? '',
    percentagem_cobertura: String(seguro?.percentagem_cobertura ?? ''),
  };
}

function mapSeguroComoBem(seguro) {
  // O seguro é o próprio bem em garantia (tipo='seguro' no DTO v2)
  return {
    apolice: seguro?.apolice ?? '',
    seguradora: seguro?.seguradora ?? '',
    tipo_seguro_id: seguro?.tipo?.id ?? seguro?.tipo_seguro_id ?? null,
    premio: String(seguro?.premio ?? ''),
    periodicidade: seguro?.periodicidade ?? '',
    valor: String(seguro?.valor ?? ''),
    percentagem_cobertura: String(seguro?.percentagem_cobertura ?? ''),
  };
}

function mapMorada(row) {
  // Aceita morada nested (formato antigo) ou flat (formato v2 já normalizado)
  const morada = row?.morada ?? row;
  return {
    rua: morada?.rua ?? '',
    zona: morada?.zona ?? '',
    ilha: morada?.ilha ?? row?.freguesia?.ilha ?? '',
    concelho: morada?.concelho ?? row?.freguesia?.concelho ?? '',
    freguesia: morada?.freguesia ?? row?.freguesia?.freguesia ?? '',
    numero_porta: morada?.numero_porta ?? '',
  };
}

function mapDono(dono) {
  return { numero_entidade: dono?.numero_entidade ?? dono?.numero ?? '' };
}
