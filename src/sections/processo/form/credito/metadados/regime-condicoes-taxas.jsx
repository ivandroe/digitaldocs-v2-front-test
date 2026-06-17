import { useEffect } from 'react';
// @mui
import Grid from '@mui/material/Grid';
// utils
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schemaTaxas, schemaRegime, getSchemaCondicoes } from './schemas';
import { getDefaultsTaxas, getDefaultsRegime, getDefaultsCondicoes } from './default-values';
// redux
import { useDispatch } from '@/redux/store';
import { updateDados } from '@/redux/slices/stepper';
// components
import { Title } from '.';
import GridItem from '@/components/GridItem';
import { ButtonsStepper } from '@/components/Actions';
import { RHFSwitch, FormProvider, RHFTextField, RHFDatePicker, RHFNumberField } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export function RegimeEspecial({ onClose, dados, dispatch, dadosStepper, precario }) {
  const defaultValues = getDefaultsRegime({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(schemaRegime), defaultValues });
  const { control, reset, handleSubmit } = methods;
  const values = useWatch({ control });

  useEffect(() => {
    if (precario) reset(getDefaultsRegime({ dadosStepper, dados, precario }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precario]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Regime especial" />
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <GridItem xs={6} md={4} children={<RHFSwitch name="bonificado" label="Bonificado" mt />} />
        <GridItem xs={6} md={4} children={<RHFSwitch name="jovem_bonificado" label="Jovem bonificado" mt />} />
        <GridItem xs={6} md={4} children={<RHFSwitch name="revolving" label="Revolving" mt />} />
        <GridItem xs={6} md={4} children={<RHFSwitch name="credibolsa" label="Credibolsa" mt />} />
        <GridItem sm={6} md={4}>
          <RHFSwitch name="colaborador_empresa_parceira" label="Colaborador de empresa parceira" mt />
        </GridItem>
        <GridItem sm={6} md={4} children={<RHFSwitch name="habitacao_propria_1" label="1ª habitação própria" mt />} />
        <GridItem sm={6} children={<RHFSwitch name="isento_comissao" label="Isento de comissão" mt />} />
        <GridItem sm={6}>
          <RHFSwitch name="tem_isencao_imposto_selo" label="Isento de imposto de selo" mt />
        </GridItem>
        {values?.credibolsa && (
          <>
            <GridItem sm={6} md={3}>
              <RHFTextField name="montante_tranches_credibolsa" label="Montante das tranches" />
            </GridItem>
            <GridItem sm={6} md={3} children={<RHFTextField name="nivel_formacao" label="Nível de formação" />} />
            <GridItem sm={6} children={<RHFTextField name="designacao_curso" label="Designação do curso" />} />
            <GridItem sm={6}>
              <RHFTextField name="estabelecimento_ensino" label="Estabelecimento de ensino" />
            </GridItem>
            <GridItem sm={6}>
              <RHFTextField name="localizacao_estabelecimento_ensino" label="Localização" />
            </GridItem>
          </>
        )}
      </Grid>
      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Condicoes({ dados, dispatch, dadosStepper, precario }) {
  const defaultValues = getDefaultsCondicoes({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(getSchemaCondicoes(dadosStepper)), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Condições & Ciclo do Crédito" />
      <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center">
        <GridItem xs={6} md={4}>
          <RHFNumberField name="conta_do_renda" label="Conta DO renda" noFormat />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="capital_max_isento_imposto_selo" label="Cap. máx. isento imp. selo" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="numero_prestacao" label="Nº prestações" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="meses_vencimento" label="Meses vencimento" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="periodo_carencia" label="Período carência" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="prazo_utilizacao" label="Prazo utilização" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFDatePicker name="data_utilizacao" label="Data de utilização" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFDatePicker name="data_vencimento_prestacao1" label="Data 1ª prestação" />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Taxas({ dados, dadosStepper, precario }) {
  const dispatch = useDispatch();
  const defaultValues = getDefaultsTaxas({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(schemaTaxas), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Taxas" />
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <GridItem children={<RHFSwitch name="modo_taxa_equivalente" label="Taxa equivalente" />} />
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_juro_precario" label="Taxa juros precário" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_juro_desconto" label="Spread" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_mora" label="Taxa de mora" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_imposto_selo" label="Taxa de imposto selo" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="taxa_comissao_abertura" label="Taxa comissão abertura" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="taxa_imposto_selo_utilizacao" label="Taxa imp. selo utlização" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="taxa_comissao_imobilizacao" label="Taxa comissão imobilização" tipo="%" />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}
