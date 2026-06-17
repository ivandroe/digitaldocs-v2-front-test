import { useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
// utils
import { periodicidadesList } from '@/_mock';
import { fillData } from '@/utils/formatTime';
import { backStep } from '@/redux/slices/stepper';
import { useSelector, useDispatch } from '@/redux/store';
import { createItem, updateItem } from '@/redux/slices/digitaldocs';
//
import { listaFreguesias } from '@/_mock';
import { extrairCamposBem } from './schemaFileds';
import composeGarantiaPayload from './composePayload';
import { shapeMetadaosGarantias } from './validationFields';
// components
import { ButtonsStepper } from '@/components/Actions';
import { FormProvider } from '@/components/hook-form';
//
import FormImovel from './form-imovel';
import FormVeiculo from './form-veiculo';
import { SeguroForm } from './form-seguros';
import FormEntidades from './form-entidades';
import { GarantiaLabel } from './form-bem-financiado';
import { FormTitulo, FormLivranca, FormConta } from './form-titulo-conta-livranca.jsx';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormMetadadosGarantias({ onClose, dados, processoId, chaveMeta }) {
  const dispatch = useDispatch();
  const { tiposSeguros } = useSelector((state) => state.gaji9);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { dadosStepper } = useSelector((state) => state.stepper);

  const segurosList = useMemo(() => tiposSeguros.map((s) => ({ id: s?.id, label: s?.designacao })), [tiposSeguros]);

  const isEdit = dados?.modal === 'update';
  const registado = !dadosStepper?.bem_sem_registo;
  const bem = useMemo(() => dados?.metadados?.bem || null, [dados?.metadados?.bem]);
  const livranca = useMemo(() => dados?.metadados?.numero_livranca || '', [dados?.metadados?.numero_livranca]);
  const garantidores = useMemo(
    () => dados?.metadados?.garantidores || (chaveMeta?.chave === 'fianca' && [{ numero_entidade: '' }]) || [],
    [chaveMeta?.chave, dados?.metadados?.garantidores]
  );

  const formSchema = shapeMetadaosGarantias(chaveMeta?.chave);
  const defaultValues = useMemo(
    () => ({
      tipo: chaveMeta?.chave,
      numero_livranca: livranca,
      garantidores: garantidores,
      // dp
      numero_conta: bem?.numero_conta || '',
      // titulos
      codigo: bem?.codigo || '',
      numero_cliente: bem?.numero_cliente || '',
      // veiculos
      nura: bem?.nura || '',
      marca: bem?.marca || '',
      valor: bem?.valor || '',
      modelo: bem?.modelo || '',
      matricula: bem?.matricula || '',
      ano_fabrico: bem?.ano_fabrico || '',
      // imovel
      nip: bem?.nip || '',
      area: bem?.area || '',
      tipo_matriz: bem?.tipo_matriz || null,
      numero_andar: bem?.numero_andar || '',
      numero_matriz: bem?.numero_matriz || '',
      identificacao_fracao: bem?.identificacao_fracao || '',
      numero_descricao_predial: bem?.numero_descricao_predial || '',
      numero_inscricao_hipoteca: bem?.numero_inscricao_hipoteca || '',
      localizacao_conservatoria: bem?.localizacao_conservatoria || null,
      rua: bem?.rua || '',
      zona: bem?.zona || '',
      freguesia: bem?.freguesia || null,
      numero_porta: bem?.numero_porta || '',
      // seguro
      premio: bem?.premio || '',
      apolice: bem?.apolice || '',
      seguradora: bem?.seguradora || null,
      tipo_seguro: segurosList?.find((s) => s.id === bem?.tipo_seguro_id) || null,
      periodicidade: periodicidadesList?.find(({ id }) => id === bem?.periodicidade) || null,
      //
      bem_sem_registo: dadosStepper?.bem_sem_registo,
      numero_fatura_proforma: bem?.numero_fatura_proforma || '',
      emissora_fatura_proforma: bem?.emissora_fatura_proforma || '',
      data_emissao_fatura_proforma: fillData(bem?.data_emissao_fatura_proforma, null),
      //
      valor_avaliacao: bem?.valor_avaliacao || '',
      ...extrairCamposBem(bem, listaFreguesias),
    }),
    [livranca, bem, garantidores, chaveMeta, segurosList, dadosStepper?.bem_sem_registo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    const msg = isEdit ? 'Garantia atualizada' : 'Garantia adicionada';
    const payload = composeGarantiaPayload(dadosStepper, values, chaveMeta?.chave);
    const params = { id: dados?.id || '', fillCredito: true, processoId, msg, put: true, onClose };
    dispatch((isEdit ? updateItem : createItem)('garantias', JSON.stringify(isEdit ? payload : [payload]), params));
  };

  return (
    <Box>
      <GarantiaLabel dadosStepper={dadosStepper} />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {chaveMeta?.chave === 'dp' && <FormConta />}
        {chaveMeta?.chave === 'seguro' && <SeguroForm />}
        {chaveMeta?.chave === 'veiculo' && <FormVeiculo registado={registado} />}
        {chaveMeta?.chave === 'livranca' && <FormLivranca />}
        {chaveMeta?.chave === 'fianca' && <FormEntidades label="Fiador" name="garantidores" />}
        {/*  */}
        {chaveMeta?.value === 'titulos' && <FormTitulo />}
        {chaveMeta?.value === 'terrenos' && <FormImovel registado={registado} tipo="Terreno" />}
        {chaveMeta?.value === 'predios' && <FormImovel registado={registado} tipo="Prédio" />}
        {chaveMeta?.value === 'apartamentos' && <FormImovel registado={registado} tipo="Apartamento" />}

        <ButtonsStepper label="Guardar" isSaving={isSaving} onClose={() => dispatch(backStep())} />
      </FormProvider>
    </Box>
  );
}
