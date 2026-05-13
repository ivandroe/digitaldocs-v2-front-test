import * as Yup from 'yup';
//
import { validacao, shapeNumberStd, shapePercentagem } from '@/components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

export const shapeGarantia = () =>
  Yup.object({
    percentagem_cobertura: shapePercentagem('Cobertura'),
    tipo_garantia: Yup.mixed().required().label('Garantia'),
    bem_financiado: Yup.boolean(),
    subtipo_garantia: Yup.mixed().when('tipo_garantia', {
      is: (tipo) => Boolean(tipo?.subtipos),
      then: (schema) => schema.required().label('Subtipo'),
      otherwise: (schema) => schema.nullable(),
    }),
    livrancas: Yup.array(
      Yup.object({ numero_livranca: Yup.string().required().label('Nº de livrança'), avalistas: shapeEntidades() })
    ),
    conta: Yup.object()
      .nullable()
      .shape({
        numero_conta: Yup.string().required().label('Nº de conta'),
      }),
    fiadores: shapeEntidades(),
    seguro: shapeSeguro(false),
    predio: shapeImovel('Prédio'),
    terreno: shapeImovel('Terreno'),
    apartamento: shapeImovel('Apartamento'),
    titulo: Yup.object()
      .nullable()
      .shape({
        seguros: shapeSegurosLista(true),
        codigo: Yup.string().required().label('Código'),
        numero_cliente: shapeNumberStd('Nº de cliente'),
      }),
    veiculo: Yup.object()
      .nullable()
      .shape({
        bem_financiado: Yup.boolean(),
        donos: Yup.array().when('bem_financiado', {
          is: true,
          then: () => Yup.array().notRequired(),
          otherwise: () => shapeEntidades(),
        }),
        seguros: shapeSegurosLista(true),
        valor: Yup.mixed().when('bem_financiado', {
          is: true,
          then: () => Yup.mixed().notRequired(),
          otherwise: () => shapeNumberStd('Valor'),
        }),
        valor_pvt: Yup.mixed().when('bem_financiado', {
          is: true,
          then: () => Yup.mixed().notRequired(),
          otherwise: () => shapeNumberStd('Valor PVT'),
        }),
        marca: Yup.string().when('bem_financiado', {
          is: true,
          then: (s) => s.notRequired(),
          otherwise: (s) => s.required().label('Marca'),
        }),
        modelo: Yup.string().when('bem_financiado', {
          is: true,
          then: (s) => s.notRequired(),
          otherwise: (s) => s.required().label('Modelo'),
        }),
        matricula: Yup.string()
          .nullable()
          .test('matricula-ou-nura', 'Indique a matrícula ou o NURA', function (value) {
            return Boolean(value) || Boolean(this.parent?.nura);
          }),
        nura: Yup.string()
          .nullable()
          .test('nura-ou-matricula', 'Indique a matrícula ou o NURA', function (value) {
            return Boolean(value) || Boolean(this.parent?.matricula);
          }),
      }),
  });

// ---------------------------------------------------------------------------------------------------------------------

const shapeEntidades = () => Yup.array(Yup.object({ numero_entidade: shapeNumberStd('Nº de entidade') }));

const shapeSegurosLista = (tipo) =>
  Yup.array(
    Yup.object({
      valor: shapeNumberStd('Valor'),
      premio: shapeNumberStd('Prémio'),
      apolice: Yup.string().required().label('Apólice'),
      percentagem_cobertura: shapePercentagem('Cobertura'),
      seguradora: Yup.mixed().required().label('Seguradora'),
      tipo: validacao(tipo, Yup.mixed().required().label('Tipo')),
      periodicidade: Yup.mixed().required().label('Periodicidade'),
    })
  );

const shapeSeguro = (tipo) =>
  Yup.object()
    .nullable()
    .shape({
      valor: shapeNumberStd('Valor'),
      premio: shapeNumberStd('Prémio'),
      apolice: Yup.string().required().label('Apólice'),
      seguradora: Yup.mixed().required().label('Seguradora'),
      tipo: validacao(tipo, Yup.mixed().required().label('Tipo')),
      periodicidade: Yup.mixed().required().label('Periodicidade'),
    });

const shapeImovel = (tipo) =>
  Yup.object()
    .nullable()
    .shape({
      bem_financiado: Yup.boolean(),
      donos: Yup.array().when('bem_financiado', {
        is: true,
        then: () => Yup.array().notRequired(),
        otherwise: () => shapeEntidades(),
      }),
      seguros: shapeSegurosLista(true),
      valor_pvt: Yup.mixed().when('bem_financiado', {
        is: true,
        then: () => Yup.mixed().notRequired(),
        otherwise: () => shapeNumberStd('Valor PVT'),
      }),
      zona: Yup.string().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: (s) => s.required().label('Zona'),
      }),
      freguesia: Yup.mixed().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: (s) => s.required().label('Freguesia'),
      }),
      tipo_matriz: Yup.mixed().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: (s) => s.required().label('Tipo de matriz'),
      }),
      area: Yup.mixed().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: () => validacao(tipo === 'Terreno', Yup.string().required().label('Área')),
      }),
      localizacao_conservatoria: Yup.mixed().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: (s) => s.required().label('Localização da conservatória'),
      }),
      identificacao_fracao: Yup.mixed().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: () =>
          validacao(tipo === 'Apartamento', Yup.string().required().label('Identificação fração')),
      }),
      numero_inscricao_hipoteca: Yup.string().when('bem_financiado', {
        is: true,
        then: (s) => s.notRequired(),
        otherwise: (s) => s.required().label('Nº inscrição hipoteca'),
      }),

      nip: Yup.string()
        .nullable()
        .test(
          'nip-ou-descricao-predial',
          'Preencha o NIP ou o Nº de matriz + Nº de descrição predial',
          function (value) {
            const { numero_matriz, numero_descricao_predial } = this.parent;
            const temNip = Boolean(value);
            const temDescricaoPredial = Boolean(numero_matriz) && Boolean(numero_descricao_predial);
            return temNip || temDescricaoPredial;
          }
        ),

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
