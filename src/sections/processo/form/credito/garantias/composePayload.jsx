// Composição/unpacking de metadados de garantia (formato v2 — { bem, garantidores[], numero_livranca? })
// Backend agora aceita no máximo 1 bem por garantia (campo singular `bem`).

const TIPO_IMOVEL = { predios: 'predio', terrenos: 'terreno', apartamentos: 'apartamento' };
const CHAVE_TO_FIELD = {
  predios: 'predio',
  terrenos: 'terreno',
  apartamentos: 'apartamento',
  veiculos: 'veiculo',
  contas: 'conta',
  titulos: 'titulo',
  seguros: 'seguro',
};

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
  const meta = { garantidores: [] };

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
    case 'contas': {
      const row = form?.conta;
      if (row) meta.bem = { tipo: 'dp', ...mapContaDp(row) };
      break;
    }
    case 'titulos': {
      const row = form?.titulo;
      if (row) meta.bem = { tipo: 'titulo', ...mapTitulo(row) };
      break;
    }
    case 'seguros': {
      const row = form?.seguro;
      if (row) meta.bem = { tipo: 'seguro', ...mapSeguroComoBem(row) };
      break;
    }
    case 'predios':
    case 'terrenos':
    case 'apartamentos': {
      const field = CHAVE_TO_FIELD[chaveMeta];
      const row = form?.[field];
      if (row) meta.bem = { tipo: TIPO_IMOVEL[chaveMeta], ...mapImovel(row) };
      break;
    }
    case 'veiculos': {
      const row = form?.veiculo;
      if (row) meta.bem = { tipo: 'veiculo', ...mapVeiculo(row) };
      break;
    }
    default:
      break;
  }

  return meta;
}

// ── Unpack (carregar do backend para o form) -------------------------------------------------------------------------

export function unpackGarantiaMetadados(metadados, chaveMeta) {
  const empty = {
    conta: null,
    titulo: null,
    seguro: null,
    predio: null,
    terreno: null,
    veiculo: null,
    apartamento: null,
    fiadores: [],
    livrancas: [],
  };
  if (!metadados) return empty;

  // Compatibilidade: formato antigo (imoveis aninhado)
  if (metadados?.imoveis) {
    return {
      ...empty,
      conta: metadados?.contas?.[0] ?? null,
      titulo: metadados?.titulos?.[0] ?? null,
      seguro: metadados?.seguros?.[0] ?? null,
      predio: metadados?.imoveis?.predios?.[0] ?? null,
      terreno: metadados?.imoveis?.terrenos?.[0] ?? null,
      apartamento: metadados?.imoveis?.apartamentos?.[0] ?? null,
      veiculo: metadados?.imoveis?.veiculos?.[0] ?? null,
      fiadores: metadados?.fiadores ?? [],
      livrancas: metadados?.livrancas ?? [],
    };
  }

  // Formato v2 — { numero_livranca?, bem?, bens?[], garantidores[] }
  // Aceita também o formato intermédio com `bens[]` (legacy)
  const bem = metadados?.bem ?? metadados?.bens?.[0] ?? null;

  const out = { ...empty };
  if (bem?.tipo) {
    switch (bem.tipo) {
      case 'apartamento':
        out.apartamento = bem;
        break;
      case 'predio':
        out.predio = bem;
        break;
      case 'terreno':
        out.terreno = bem;
        break;
      case 'veiculo':
        out.veiculo = bem;
        break;
      case 'dp':
        out.conta = bem;
        break;
      case 'titulo':
        out.titulo = bem;
        break;
      case 'seguro':
        out.seguro = bem;
        break;
      default:
        break;
    }
  }

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
  };
}

function mapTitulo(row) {
  return {
    codigo: row?.codigo ?? '',
    numero_cliente: row?.numero_cliente ? Number(row.numero_cliente) : undefined,
    seguros: (row?.seguros ?? []).map(mapSeguroDoBem),
  };
}

function mapVeiculo(row) {
  const bemFinanciado = Boolean(row?.bem_financiado);
  const base = {
    nura: row?.nura ?? '',
    marca: row?.marca ?? '',
    modelo: row?.modelo ?? '',
    matricula: row?.matricula ?? '',
    ano_fabrico: row?.ano_fabrico ? String(row.ano_fabrico) : '',
    valor: row?.valor ? String(row.valor) : '',
    valor_avaliacao: row?.valor_avaliacao ? String(row.valor_avaliacao) : '',
    localizacao_conservatoria: row?.localizacao_conservatoria ?? '',
    seguros: (row?.seguros ?? []).map(mapSeguroDoBem),
  };
  if (bemFinanciado) return { ...base, bem_financiado: true };
  return { ...base, donos: (row?.donos ?? []).map(mapDono) };
}

function mapImovel(row) {
  const bemFinanciado = Boolean(row?.bem_financiado);
  const morada = mapMorada(row);
  const base = {
    nip: row?.nip ?? '',
    tipo_matriz: row?.tipo_matriz ?? '',
    numero_matriz: row?.numero_matriz ?? '',
    numero_descricao_predial: row?.numero_descricao_predial ?? '',
    numero_inscricao_hipoteca: row?.numero_inscricao_hipoteca ?? '',
    localizacao_conservatoria: row?.localizacao_conservatoria ?? '',
    identificacao_fracao: row?.identificacao_fracao ?? '',
    numero_andar: row?.numero_andar ?? '',
    area: row?.area ?? '',
    valor_avaliacao: row?.valor_avaliacao ? String(row.valor_avaliacao) : '',
    ...morada,
    seguros: (row?.seguros ?? []).map(mapSeguroDoBem),
  };
  if (bemFinanciado) return { ...base, bem_financiado: true };
  return { ...base, donos: (row?.donos ?? []).map(mapDono) };
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
  return {
    apolice: seguro?.apolice ?? '',
    seguradora: seguro?.seguradora ?? '',
    tipo_seguro_id: seguro?.tipo?.id ?? seguro?.tipo_seguro_id ?? null,
    premio: String(seguro?.premio ?? ''),
    periodicidade: seguro?.periodicidade ?? '',
    valor: String(seguro?.valor ?? ''),
  };
}

function mapMorada(row) {
  const morada = row?.morada ?? row;
  const freguesia = morada?.freguesia ?? row?.freguesia;
  const freguesiaObj = freguesia && typeof freguesia === 'object' ? freguesia : null;
  return {
    rua: morada?.rua ?? '',
    zona: morada?.zona ?? '',
    ilha: morada?.ilha ?? freguesiaObj?.ilha ?? '',
    concelho: morada?.concelho ?? freguesiaObj?.concelho ?? '',
    freguesia: (freguesiaObj ? freguesiaObj.freguesia : freguesia) ?? '',
    numero_porta: morada?.numero_porta ?? '',
  };
}

function mapDono(dono) {
  return { numero_entidade: dono?.numero_entidade ?? dono?.numero ?? '' };
}
