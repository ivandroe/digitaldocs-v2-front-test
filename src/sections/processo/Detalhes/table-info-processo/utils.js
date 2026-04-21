// utils
import { applySort } from '@/hooks/useTable';
import { normalizeText } from '@/utils/formatText';

// ---------------------------------------------------------------------------------------------------------------------

export function headerTable(item) {
  return [
    ...((item === 'enquadramentos' && [
      { id: 'fluxo', label: 'Fluxo' },
      { id: 'criado_em', label: 'Criado em' },
      { id: 'criador', label: 'Criado por' },
      { id: 'ativo', label: 'Ativo', align: 'center' },
      { id: '', width: 10 },
    ]) ||
      (item === 'hretencoes' && [
        { id: 'nome', label: 'Colaborador' },
        { id: 'preso_em', label: 'Retido em', align: 'center' },
        { id: '', label: 'Duração', align: 'center' },
        { id: 'solto_em', label: 'Solto em', align: 'center', minWidth: 100, width: 10 },
      ]) ||
      (item === 'hatribuicoes' && [
        { id: 'nome', label: 'Colaborador' },
        { id: 'estado', label: 'Estado' },
        { id: 'atribuido_em', label: 'Atribuido em', align: 'center', minWidth: 130, width: 10 },
      ]) ||
      (item === 'hpendencias' && [
        { id: 'motivo', label: 'Motivo' },
        { id: 'observacao', label: 'Observação' },
        { id: '', label: 'Duração' },
        { id: 'data_pendente', label: 'Registo', align: 'center', minWidth: 130, width: 10 },
      ]) ||
      (item === 'confidencialidades' && [
        { id: '', label: 'Critérios' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
        { id: 'criador', label: 'Criado' },
        { id: '', width: 10 },
      ]) ||
      []),
  ];
}

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ nome, fluxo, estado, motivo, observacao }) =>
        (nome && normalizeText(nome).indexOf(normalizedFilter) !== -1) ||
        (fluxo && normalizeText(fluxo).indexOf(normalizedFilter) !== -1) ||
        (estado && normalizeText(estado).indexOf(normalizedFilter) !== -1) ||
        (motivo && normalizeText(motivo).indexOf(normalizedFilter) !== -1) ||
        (observacao && normalizeText(observacao).indexOf(normalizedFilter) !== -1)
    );
  }
  return dados;
}

// ---------------------------------------------------------------------------------------------------------------------

export function dadosComColaboradores(dados, colaboradores) {
  const dadosList = [];
  dados?.forEach((row) => {
    const colaborador = colaboradores.find(({ perfil_id: pid }) => Number(pid) === Number(row?.perfil_id));
    dadosList.push({
      ...row,
      idColab: colaborador?.id,
      mail: colaborador?.email,
      uo: colaborador?.uo_label,
      foto: colaborador?.foto_anexo,
      presence: colaborador?.presence,
      nome: colaborador?.nome || `Perfil: ${row.perfil_id}`,
    });
  });
  return dadosList;
}
