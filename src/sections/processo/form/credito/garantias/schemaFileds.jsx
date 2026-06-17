// utils
import { periodicidadesList } from '@/_mock';

// ---------------------------------------------------------------------------------------------------------------------

export const seguroSchema = {
  tipo_seguro: null,
  seguradora: null,
  valor: '',
  premio: '',
  apolice: '',
  periodicidade: null,
  percentagem_cobertura: '',
};

// ---------------------------------------------------------------------------------------------------------------------

export const extrairCamposBem = (bem, listaFreguesias = []) => ({
  donos: transformarDonos(bem?.donos),
  seguros: transformarSeguros(bem?.seguros),
  freguesia: getFreguesia({ freguesia: bem?.freguesia, ilha: bem?.ilha }, listaFreguesias),
});

export const transformarSeguros = (seguros = []) =>
  Array.isArray(seguros)
    ? seguros.map((row) => ({
        ...row,
        tipo_seguro: { id: row?.tipo_seguro_id, label: row?.tipo_seguro },
        periodicidade: periodicidadesList?.find(({ id }) => id === row?.periodicidade) || null,
      }))
    : [];

const transformarDonos = (donos = []) =>
  Array.isArray(donos) ? donos.map((d) => ({ numero_entidade: d.numero ?? d.numero_entidade ?? '' })) : [];

export const getFreguesia = (morada, listaFreguesias = []) => {
  const freg = listaFreguesias.find(({ ilha, freguesia }) => ilha === morada?.ilha && freguesia === morada?.freguesia);
  return freg ? { ...freg, label: freg.freguesia } : null;
};

// ---------------------------------------------------------------------------------------------------------------------

export const descreverBem = (bem) => {
  if (bem?.tipo === 'veiculo') {
    return (
      bem?.matricula || bem?.nura || [bem?.marca, bem?.modelo].filter(Boolean).join(' ') || 'Veículo sem identificador'
    );
  }

  const partes = [];
  if (bem?.nip) partes.push(`NIP ${bem.nip}`);
  else {
    if (bem?.numero_matriz && bem?.numero_descricao_predial)
      partes.push(`${bem.numero_matriz} / ${bem.numero_descricao_predial}`);
    else if (bem?.numero_matriz) partes.push(`Mtz ${bem.numero_matriz}`);
  }

  return partes.length ? partes.join(' · ') : 'Bem sem identificador';
};

export const extrairBens = (bens = [], chave) =>
  Array.isArray(bens)
    ? bens
        .filter(({ tipo }) => tipo === chave)
        .map((bem) => ({ ...bem, id: descreverBem(bem), label: descreverBem(bem) }))
    : [];
