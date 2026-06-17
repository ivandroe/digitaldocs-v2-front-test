// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// utils
import { schemaEntidades } from './schemas';
import { buildPayload } from './build-payload';
import { getDefaultsEntidade } from './default-values';
// redux
import { useSelector } from '@/redux/store';
import { backStep } from '@/redux/slices/stepper';
import { updateItem } from '@/redux/slices/digitaldocs';
// components
import { Title } from '.';
import GridItem from '@/components/GridItem';
import { DefaultAction, ButtonsStepper } from '@/components/Actions';
import { FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteSmp } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export function Entidades({ dados, ids, onClose, dispatch, dadosStepper }) {
  const isSaving = useSelector((state) => state.digitaldocs.isSaving);

  const defaultValues = getDefaultsEntidade({ dadosStepper, dados });
  const methods = useForm({ resolver: yupResolver(schemaEntidades), defaultValues });
  const { handleSubmit, control } = methods;
  const values = useWatch({ control });

  const onSubmit = async (values) => {
    try {
      const payload = buildPayload({ ...dadosStepper, ...values });
      const params = { ...ids, msg: 'Informações atualizadas', fillCredito: true };
      dispatch(updateItem('metadados-credito', JSON.stringify(payload), { ...params, onClose }));
    } catch (error) {
      console.error('Erro ao processar dados para o backend:', error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {dadosStepper?.colaborador_empresa_parceira && (
        <EntidadesPatronais control={control} entidades={dados?.entidades} values={values} />
      )}
      <Box>
        <Title title="Entidade Vendedora / Fornecedora" />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <GridItem sm={8}>
            <RHFTextField name="nome_empresa_fornecedora" label="Empresa fornecedora" />
          </GridItem>
          <GridItem sm={4}>
            <RHFNumberField name="nib_vendedor_ou_fornecedor" label="NIB vendedor/fornecedor" noFormat />
          </GridItem>
          <GridItem sm={8}>
            <RHFTextField label="Instituição de crédito" name="instituicao_credito_conta_vendedor_ou_fornecedor" />
          </GridItem>
          <GridItem sm={4}>
            <RHFNumberField
              tipo="CVE"
              label="Valor a transferir"
              name="valor_transferir_conta_vendedor_ou_fornecedor"
            />
          </GridItem>
        </Grid>
      </Box>
      <ButtonsStepper label="Guardar" isSaving={isSaving} onClose={() => dispatch(backStep())} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function EntidadesPatronais({ control, entidades, values }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades_patronais' });

  return (
    <Box sx={{ mb: 3 }}>
      <Title
        title="Entidades patronais"
        action={
          <DefaultAction
            small
            button
            label="Adicionar"
            onClick={() => append({ numero_entidade_mutuario: null, numero_entidade_patronal: '' })}
          />
        }
      />
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((item, index) => (
          <Stack key={`variavel_${index}`} spacing={1} direction="row" alignItems="center">
            <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
              <RHFAutocompleteSmp
                label="Mutuário"
                options={entidades}
                name={`entidades_patronais[${index}].numero_entidade_mutuario`}
                getOptionDisabled={(option) =>
                  values.entidades_patronais.some(({ numero_entidade_mutuario: nem }) => Number(nem) === Number(option))
                }
              />
              <RHFNumberField
                noFormat
                label="Entidade patronal"
                name={`entidades_patronais[${index}].numero_entidade_patronal`}
              />
            </Stack>
            <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
