import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ---------------------------------------------------------------------------------------------------------------------

export function usePromptStep(schema, dados, onSubmit) {
  const methods = useForm({ resolver: yupResolver(schema), defaultValues: dados });

  const handle = methods.handleSubmit((formValues) => {
    onSubmit(formValues);
  });

  return { methods, handle };
}

// ---------------------------------------------------------------------------------------------------------------------

export const schemaContexto = Yup.object({
  preset_name: Yup.string().required().label('Nome'),
  prompt_context: Yup.string().required().label('Contexto'),
  keywords: Yup.string().required().label('Palavras-chave'),
});

export const schemaInstrucoes = Yup.object({ prompt_instructions: Yup.string().required().label('Instruções') });

export const schemaResposta = Yup.object({
  prompt_response_example: Yup.string().required().label('Exemplo de resposta'),
});

// ---------------------------------------------------------------------------------------------------------------------

export const concelhoToEnum = [
  { label: 'Boa Vista', id: 'BOA_VISTA' },
  { label: 'Brava', id: 'BRAVA' },
  { label: 'Maio', id: 'MAIO' },
  { label: 'Mosteiros', id: 'MOSTEIROS' },
  { label: 'Paul', id: 'PAUL' },
  { label: 'Porto Novo', id: 'PORTO_NOVO' },
  { label: 'Praia', id: 'PRAIA' },
  { label: 'Ribeira Brava', id: 'RIBEIRA_BRAVA' },
  { label: 'Ribeira Grande', id: 'RIBEIRA_GRANDE_SANTO_ANTAO' },
  { label: 'Ribeira Grande de Santiago', id: 'RIBEIRA_GRANDE_SANTIAGO' },
  { label: 'Sal', id: 'SAL' },
  { label: 'Santa Catarina', id: 'SANTA_CATARINA_SANTIAGO' },
  { label: 'Santa Catarina do Fogo', id: 'SANTA_CATARINA_FOGO' },
  { label: 'Santa Cruz', id: 'SANTA_CRUZ' },
  { label: 'São Domingos', id: 'SAO_DOMINGOS' },
  { label: 'São Filipe', id: 'SAO_FILIPE' },
  { label: 'São Lourenço dos Orgãos', id: 'SAO_LOURENCO_DOS_ORGAOS' },
  { label: 'São Miguel', id: 'SAO_MIGUEL' },
  { label: 'São Salvador do Mundo', id: 'SAO_SALVADOR_DO_MUNDO' },
  { label: 'São Vicente', id: 'SAO_VICENTE' },
  { label: 'Tarrafal', id: 'TARRAFAL_SANTIAGO' },
  { label: 'Tarrafal de São Nicolau', id: 'TARRAFAL_SAO_NICOLAU' },
];

const ilhaToEnum = {
  Sal: 'SAL',
  Fogo: 'FOGO',
  Maio: 'MAIO',
  Brava: 'BRAVA',
  Santiago: 'SANTIAGO',
  'Boa Vista': 'BOA_VISTA',
  'São Nicolau': 'SAO_NICOLAU',
  'São Vicente': 'SAO_VICENTE',
  'Santo Antão': 'SANTO_ANTAO',
};

const tipoUOToEnum = { Agências: 'AGENCY', 'Serviços Centrais': 'CENTRAL_SERVICES' };

export function mapConcelhoToBackend(concelho) {
  return concelhoToEnum?.find(({ label }) => label === concelho)?.id ?? '';
}

export function mapIlhaToBackend(ilha) {
  return ilhaToEnum[ilha] ?? '';
}

export function mapTipoUoToBackend(tipo) {
  return tipoUOToEnum[tipo] ?? 'OTHER';
}

// ---------------------------------------------------------------------------------------------------------------------

export function headerTable(item) {
  return [
    ...((item === 'assuntos' && [
      { id: 'name', label: 'Assunto' },
      { id: 'department_name', label: 'Departamento' },
      { id: 'sla_name', label: 'SLA' },
      { id: 'applicability', label: 'Aplicabilidade', align: 'center' },
    ]) ||
      (item === 'utilizadores' && [
        { id: 'nome', label: 'Colaborador' },
        { id: 'department', label: 'Departamento' },
        { id: 'role', label: 'Função', align: 'center' },
      ]) ||
      (item === 'departamentos' && [
        { id: 'name', label: 'Nome' },
        { id: 'abreviation', label: 'Abreviação' },
        { id: 'code', label: 'Fila espera', align: 'center' },
        { id: 'type', label: 'Tipo', align: 'center' },
      ]) ||
      (item === 'slas' && [
        { id: 'nome', label: 'Nome' },
        { id: 'descricao', label: 'Descrição' },
        { id: 'tempo_resposta', label: 'Resposta' },
        { id: 'tempo_resolucao', label: 'Resolução' },
      ]) ||
      (item === 'slasUo' && [
        { id: 'nome', label: 'Nome' },
        { id: 'department_name', label: 'Departamento' },
        { id: 'subject_name', label: 'Assunto' },
        { id: 'tempo_resolucao', label: 'Resolução' },
      ]) ||
      (item === 'respostas' && [
        { id: 'subject', label: 'Assunto' },
        { id: 'phase', label: 'Fase', align: 'center' },
      ]) ||
      (item === 'faq' && [
        { id: 'sequence', label: 'Ordem', align: 'center', width: 10 },
        { id: 'category', label: 'Categoria' },
        { id: 'question', label: 'Questão' },
        { id: 'highlighted', label: 'Destaque', align: 'center' },
      ]) ||
      (item === 'conteudos' && [
        { id: 'reference', label: 'Referência' },
        { id: 'content', label: 'Conteúdo' },
      ]) ||
      (item === 'prompts' && [{ id: 'preset_name', label: 'Nome' }]) ||
      []),
    ...(item === 'prompts' || item === 'utilizadores' || item === 'respostas' || item === 'faq'
      ? [{ id: 'active', label: 'Estado', align: 'center' }]
      : []),
    { id: '', width: 10 },
  ];
}
