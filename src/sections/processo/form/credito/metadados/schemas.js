import * as Yup from 'yup';
// utils
import { shapeImovel, shapeVeiculo } from '../garantias/validationFields';
import { shapeText, shapeNumber, shapeMixed } from '@/components/hook-form/yup-shape';

// ── Form schemas -----------------------------------------------------------------------------------------------------

export const schemaRegime = Yup.object().shape({
  nivel_formacao: shapeText('credibolsa', [true], 'Nível de formação'),
  designacao_curso: shapeText('credibolsa', [true], 'Designação do curso'),
  localizacao_estabelecimento_ensino: shapeText('credibolsa', [true], 'Localização'),
  estabelecimento_ensino: shapeText('credibolsa', [true], 'Estabelecimento de ensino'),
  montante_tranches_credibolsa: shapeText('credibolsa', [true], 'Montante das tranches'),
});

export const schemaTaxas = Yup.object().shape({
  taxa_mora: Yup.number().min(0).max(100).required().label('Taxa de mora'),
  taxa_juro_desconto: Yup.number().min(0).max(100).required().label('Spread'),
  taxa_imposto_selo: Yup.number().positive().max(100).required().label('Taxa de imposto selo'),
  taxa_juro_precario: Yup.number().positive().max(100).required().label('Taxa de juros precário'),
  taxa_comissao_abertura: Yup.number().min(0).max(100).required().label('Taxa de comissão abertura'),
  taxa_imposto_selo_utilizacao: Yup.number().min(0).max(100).required().label('Taxa imp. selo utilização'),
  taxa_comissao_imobilizacao: Yup.number().min(0).max(100).required().label('Taxa de comissão imobilização'),
});

export const getSchemaCondicoes = (dadosStepper) =>
  Yup.object().shape({
    numero_prestacao: Yup.number().positive().integer().required().label('Nº de prestações'),
    capital_max_isento_imposto_selo: dadosStepper?.tem_isencao_imposto_selo
      ? Yup.number().positive().required().label('Capital máx. isento imp. selo')
      : Yup.mixed().notRequired(),
  });

export const schemaComissoes = Yup.object().shape({
  comissao_avaliacao_prazo: shapeNumber('Prazo', true, '', 'comissao_avaliacao'),
  comissao_avaliacao_valor: shapeNumber('Valor', true, '', 'comissao_avaliacao'),
  comissao_avaliacao_periodicidade: shapeMixed('comissao_avaliacao', [true], 'Periodicidade'),
  //
  comissao_vistoria_prazo: shapeNumber('Prazo', true, '', 'comissao_vistoria'),
  comissao_vistoria_valor: shapeNumber('Valor', true, '', 'comissao_vistoria'),
  comissao_vistoria_periodicidade: shapeMixed('comissao_vistoria', [true], 'Periodicidade'),
});

export const shapeBensFinanciados = Yup.object().shape({
  bens_financiados: Yup.array().of(
    Yup.lazy((bem) => {
      const tipoId = bem?.tipo?.id;
      const isVeiculo = tipoId === 'veiculo';
      const isOutroOuEquip = tipoId === 'equipamento' || tipoId === 'outro';
      const isImovel = ['apartamento', 'predio', 'terreno'].includes(tipoId);

      return Yup.object().shape({
        tipo: Yup.mixed().required().label('Tipo do bem'),
        ...(isVeiculo && shapeVeiculo()),
        ...(isImovel && shapeImovel(tipoId)),
        ...(isOutroOuEquip && { descritivo: Yup.string().required().label('Descritivo') }),
      });
    })
  ),
});

export const schemaEntidades = Yup.object().shape({
  entidades_patronais: Yup.array(
    Yup.object({
      numero_entidade_mutuario: Yup.mixed().required().label('Mutuário'),
      numero_entidade_patronal: Yup.string().required().label('Entidade patronal'),
    })
  ),
});

export const bemFinanciadoSchema = {
  tipo: null,
  nip: '',
  area: '',
  tipo_matriz: '',
  numero_andar: '',
  numero_matriz: '',
  identificacao_fracao: '',
  numero_descricao_predial: '',
  numero_inscricao_hipoteca: '',
  localizacao_conservatoria: '',
  //
  rua: '',
  zona: '',
  ilha: '',
  concelho: '',
  freguesia: null,
  numero_porta: '',
  //
  nura: '',
  valor: '',
  marca: '',
  modelo: '',
  matricula: '',
  ano_fabrico: '',
  valor_avaliacao: '',
  descritivo: '',
  //
  bem_sem_registo: false,
  numero_fatura_proforma: '',
  emissora_fatura_proforma: '',
  data_emissao_fatura_proforma: null,
};

// ---------------------------------------------------------------------------------------------------------------------

export const TIPOS_BEM_FINANCIADO = [
  { id: 'apartamento', label: 'Apartamento' },
  { id: 'predio', label: 'Prédio' },
  { id: 'terreno', label: 'Terreno' },
  { id: 'veiculo', label: 'Veículo' },
  { id: 'equipamento', label: 'Equipamento' },
  { id: 'outro', label: 'Outro' },
];
