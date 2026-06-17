import { useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { backStep } from '@/redux/slices/stepper';
import { useSelector, useDispatch } from '@/redux/store';
import { createItem, updateItem } from '@/redux/slices/digitaldocs';
//
import composeGarantiaPayload from './composePayload';
import { shapeBemFinanciado } from './validationFields';
import { transformarSeguros, descreverBem } from './schemaFileds';
// components
import { ButtonsStepper } from '@/components/Actions';
import { FormProvider, RHFAutocompleteObj } from '@/components/hook-form';
//
import FormSeguros from './form-seguros';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormBemFinanciado({ onClose, dados, processoId, bens = [] }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { dadosStepper } = useSelector((state) => state.stepper);

  const isEdit = dados?.modal === 'update';
  const bem = useMemo(() => dados?.metadados?.bem || null, [dados?.metadados?.bem]);

  const defaultValues = useMemo(
    () => ({
      bem:
        bens?.find((row) => row?.nip === bem?.nip) ||
        (bem && { ...bem, id: descreverBem(bem), label: descreverBem(bem) }) ||
        null,
      seguros: transformarSeguros(bem?.seguros),
    }),
    [bem, bens]
  );

  const methods = useForm({ resolver: yupResolver(shapeBemFinanciado()), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    const msg = isEdit ? 'Garantia atualizada' : 'Garantia adicionada';
    const params = { id: dados?.id || '', fillCredito: true, processoId, msg, put: true, onClose };
    const payload = composeGarantiaPayload(
      dadosStepper,
      { ...values?.bem, seguros: values?.seguros, bem_financiado: true },
      values?.bem?.tipo
    );
    dispatch((isEdit ? updateItem : createItem)('garantias', JSON.stringify(isEdit ? payload : [payload]), params));
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <GarantiaLabel dadosStepper={dadosStepper} />
        <RHFAutocompleteObj dc label="Bem financiado" name="bem" options={bens} />
        <FormSeguros prefixo="seguros" tipo pt={0} />
      </Stack>
      <ButtonsStepper label="Guardar" isSaving={isSaving} onClose={() => dispatch(backStep())} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiaLabel({ dadosStepper }) {
  return (
    <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', mb: 2 }}>
      Garantia:{' '}
      <Typography component="span" variant="overline">
        {dadosStepper?.tipo_garantia?.label}{' '}
        {dadosStepper?.subtipo_garantia?.subtipo ? `- ${dadosStepper.subtipo_garantia.subtipo}` : ''}
      </Typography>
    </Typography>
  );
}
