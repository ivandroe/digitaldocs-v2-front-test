import * as Yup from 'yup';
//
import {
  validacao,
  shapeDate,
  shapeText,
  shapeMixed,
  shapeNumberStd,
  shapePercentagem,
} from '@/components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

export const shapeGarantia = () =>
  Yup.object({
    percentagem_cobertura: shapePercentagem('Cobertura'),
    tipo_garantia: Yup.mixed().required().label('Garantia'),
    subtipo_garantia: Yup.mixed().when('tipo_garantia', {
      is: (tipo) => Boolean(tipo?.subtipos),
      then: (schema) => schema.required().label('Subtipo'),
      otherwise: (schema) => schema.nullable(),
    }),
  });

// ---------------------------------------------------------------------------------------------------------------------

const shapeEntidades = () => Yup.array(Yup.object({ numero_entidade: shapeNumberStd('Nº entidade') }));

const shapeSeguros = () =>
  Yup.array(Yup.object({ ...shapeSeguro(), percentagem_cobertura: shapePercentagem('Cobertura') }));

const shapeSeguro = () => ({
  valor: shapeNumberStd('Valor'),
  premio: shapeNumberStd('Prémio'),
  tipo_seguro: Yup.mixed().required().label('Tipo'),
  apolice: Yup.string().required().label('Apólice'),
  seguradora: Yup.mixed().required().label('Seguradora'),
  periodicidade: Yup.mixed().required().label('Periodicidade'),
});

const shapeTitulo = () => ({
  codigo: Yup.string().required().label('Código'),
  numero_cliente: shapeNumberStd('Nº de cliente'),
});

export const shapeVeiculo = () => ({
  valor: shapeNumberStd('Valor'),
  marca: Yup.string().required().label('Marca'),
  modelo: Yup.string().required().label('Modelo'),
  valor_avaliacao: shapeNumberStd('Valor avaliação'),
  //
  nura: shapeText('bem_sem_registo', [false], 'NURA'),
  matricula: shapeText('bem_sem_registo', [false], 'Matrícula'),
  localizacao_conservatoria: shapeMixed('bem_sem_registo', [false], 'Conservatória'),
  //
  emissora_fatura_proforma: shapeText('bem_sem_registo', [true], 'Entidade emissora'),
  numero_fatura_proforma: shapeText('bem_sem_registo', [true], 'Nº da fatura proforma'),
  data_emissao_fatura_proforma: shapeDate('bem_sem_registo', [true], 'Data da fatura proforma'),
});

export const shapeImovel = (tipo) => ({
  zona: Yup.string().required().label('Zona'),
  valor_avaliacao: shapeNumberStd('Valor avaliação'),
  freguesia: Yup.mixed().required().label('Freguesia'),
  tipo_matriz: Yup.mixed().required().label('Tipo de matriz'),
  localizacao_conservatoria: Yup.mixed().required().label('Conservatória'),
  area: validacao(tipo === 'terreno', Yup.string().required().label('Área')),
  numero_inscricao_hipoteca: shapeText('bem_sem_registo', [false], 'Nº inscrição da hipoteca'),
  identificacao_fracao: validacao(tipo === 'apartamento', Yup.string().required().label('Identificação fração')),

  nip: Yup.string()
    .nullable()
    .test('nip-ou-descricao-predial', 'Preencha o NIP ou o Nº de matriz + Nº de descrição predial', function (value) {
      const { numero_matriz, numero_descricao_predial } = this.parent;
      const temNip = Boolean(value);
      const temDescricaoPredial = Boolean(numero_matriz) && Boolean(numero_descricao_predial);
      return temNip || temDescricaoPredial;
    }),

  numero_matriz: Yup.string()
    .nullable()
    .test(
      'matriz-coexistencia',
      'Nº de matriz é obrigatório quando Nº de descrição predial está preenchido',
      function (value) {
        const { nip, numero_descricao_predial } = this.parent;
        if (nip) return true;
        if (numero_descricao_predial) return Boolean(value);
        return true;
      }
    ),

  numero_descricao_predial: Yup.string()
    .nullable()
    .test(
      'descricao-coexistencia',
      'Nº de descrição predial é obrigatório quando Nº de matriz está preenchido',
      function (value) {
        const { nip, numero_matriz } = this.parent;
        if (nip) return true;
        if (numero_matriz) return Boolean(value);
        return true;
      }
    ),
});

const shapeMetadadosBase = () => ({
  donos: shapeEntidades(),
  seguros: shapeSeguros(),
  garantidores: shapeEntidades(),
});

const SCHEMAS_MAP = {
  seguro: shapeSeguro(),
  fianca: { garantidores: shapeEntidades() },
  titulo: { ...shapeTitulo(), seguros: shapeSeguros() },
  predio: { ...shapeImovel('predio'), ...shapeMetadadosBase() },
  terreno: { ...shapeImovel('terreno'), ...shapeMetadadosBase() },
  apartamento: { ...shapeImovel('apartamento'), ...shapeMetadadosBase() },
  dp: { numero_conta: Yup.string().required().label('Nº de conta') },
  veiculo: { ...shapeVeiculo(), donos: shapeEntidades(), seguros: shapeSeguros() },
  livranca: { numero_livranca: Yup.string().required().label('Nº de livrança'), garantidores: shapeEntidades() },
};

// ---------------------------------------------------------------------------------------------------------------------

export const shapeMetadaosGarantias = (chave) => {
  const schema = SCHEMAS_MAP[chave];
  return Yup.object(schema || {});
};

export const shapeBemFinanciado = () =>
  Yup.object({
    seguros: shapeSeguros(),
    bem: Yup.mixed().required().label('Bem Financiado'),
  });
