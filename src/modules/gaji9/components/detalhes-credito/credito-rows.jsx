// utils
import { periodicidadesList } from '@/_mock';
import { labelMeses } from '@/utils/formatText';
import { fCurrency } from '@/utils/formatNumber';
// component
import { StatusBadge } from './shared';

const LABEL_BEM = {
  predio: 'Prédio',
  terreno: 'Terreno',
  veiculo: 'Veículo',
  outros: 'Outro bem',
  apartamento: 'Apartamento',
};

export const sn = (v) => <StatusBadge label={v ? 'Sim' : 'Não'} variant={v ? 'active' : ''} />;

// ---------------------------------------------------------------------------------------------------------------------

export function comissaoRows(label, obj) {
  if (!obj || !(Number(obj.valor) > 0)) return [];
  return [
    { title: label, isHeader: true },
    { title: 'Valor', value: fCurrency(obj.valor) },
    { title: 'Prazo', value: obj.prazo ? labelMeses(obj.prazo) : '' },
    {
      title: 'Periodicidade',
      value: periodicidadesList.find(({ id }) => id === obj?.periodicidade)?.label || obj?.periodicidade || '',
    },
  ];
}

export function entidadesRows(list) {
  if (!list?.length) return [];
  return list.flatMap((e) => [
    { title: `Mutuário: ${e.numero_entidade_mutuario}`, isHeader: true },
    { title: 'Entidade patronal', value: e.nome_entidade_patronal || '' },
    { title: 'Nº de entidade', value: e.numero_entidade_patronal || '' },
  ]);
}

export function bensFinanciadosRows(list) {
  if (!list?.length) return [];
  return list.flatMap((e) => [{ bem: true, label: LABEL_BEM[e?.tipo], ...e }]);
}
