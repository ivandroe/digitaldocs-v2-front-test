// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// utils
import { schemaComissoes } from './schemas';
import { periodicidadesList } from '@/_mock';
import { updateDados } from '@/redux/slices/stepper';
import { getDefaultsComissoes } from './default-values';
// components
import { Title } from '.';
import GridItem from '@/components/GridItem';
import { ButtonsStepper } from '@/components/Actions';
import { RHFSwitch, FormProvider, RHFNumberField, RHFAutocompleteObj } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export function Comissoes({ dados, dispatch, dadosStepper, precario }) {
  const defaultValues = getDefaultsComissoes({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(schemaComissoes), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3}>
        <Title title="Comições aplicadas" />
        <Comissao title="avaliação" label="comissao_avaliacao" open={values?.comissao_avaliacao} />
        <Comissao title="vistoria" label="comissao_vistoria" open={values?.comissao_vistoria} />
      </Stack>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Comissao({ title, label, open = false }) {
  return (
    <Stack>
      <RHFSwitch name={label} label={`Comissão de ${title}`} />
      {open && (
        <Grid container spacing={3} sx={{ mt: 1 }} justifyContent="center">
          <GridItem xs={6} sm={4}>
            <RHFNumberField name={`${label}_valor`} label="Valor" tipo="CVE" />
          </GridItem>
          <GridItem xs={6} sm={4}>
            <RHFNumberField name={`${label}_prazo`} label="Prazo" tipo="meses" />
          </GridItem>
          <GridItem sm={4}>
            <RHFAutocompleteObj label="Periodicidade" name={`${label}_periodicidade`} options={periodicidadesList} />
          </GridItem>
        </Grid>
      )}
    </Stack>
  );
}
