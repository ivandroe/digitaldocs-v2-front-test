import { useMemo, useEffect, useCallback } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import {
  schemaTaxas,
  buildPayload,
  schemaRegime,
  schemaEntidades,
  schemaComissoes,
  getDefaultsTaxas,
  getDefaultsObjeto,
  getDefaultsRegime,
  getSchemaCondicoes,
  getDefaultsEntidade,
  getDefaultsCondicoes,
  getDefaultsComissoes,
} from './metadados-utils';
// redux
import { updateItem } from '@/redux/slices/digitaldocs';
import { useSelector, useDispatch } from '@/redux/store';
import { getSuccess } from '@/redux/slices/parametrizacao';
import { updateDados, resetDados, backStep } from '@/redux/slices/stepper';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '@/components/hook-form';
import Steps from '@/components/Steps';
import GridItem from '@/components/GridItem';
import { FormLoading } from '@/components/skeleton';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { DefaultAction, ButtonsStepper } from '@/components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCreditoForm({ onClose, dados = null, outros, ids }) {
  const dispatch = useDispatch();
  const { activeStep, dadosStepper } = useSelector((state) => state.stepper);
  const { precario, isLoading } = useSelector((state) => state.parametrizacao);

  const handleClose = useCallback(() => {
    onClose();
    dispatch(resetDados());
    dispatch(getSuccess({ item: 'precario', dados: null }));
  }, [onClose, dispatch]);

  const commonProps = {
    dispatch,
    dadosStepper,
    dados: { ...dados, ...outros },
    precario: dados ? null : precario?.precario,
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={handleClose}
        title="Outras informações do crédito"
        content={
          <Steps
            sx={{ mt: 3, mb: 0 }}
            activeStep={activeStep}
            steps={['Regime', 'Condições', 'Taxas', 'Comissões', 'Objeto', 'Entidade']}
          />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {isLoading ? (
          <FormLoading rows={1} />
        ) : (
          <>
            {activeStep === 0 && <RegimeEspecial {...commonProps} onClose={handleClose} />}
            {activeStep === 1 && <Condicoes {...commonProps} />}
            {activeStep === 2 && <Taxas {...commonProps} />}
            {activeStep === 3 && <Comissoes {...commonProps} />}
            {activeStep === 4 && <Objeto {...commonProps} />}
            {activeStep === 5 && <Entidade {...commonProps} ids={ids} onClose={handleClose} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function RegimeEspecial({ onClose, dados, dispatch, dadosStepper, precario }) {
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

function Condicoes({ dados, dispatch, dadosStepper, precario }) {
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

function Comissoes({ dados, dispatch, dadosStepper, precario }) {
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

function Taxas({ dados, dadosStepper, precario }) {
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
      <Grid container spacing={3} sx={{ mt: 2 }}>
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

// ---------------------------------------------------------------------------------------------------------------------

function Objeto({ dados, dispatch, dadosStepper }) {
  const { tiposImoveis } = useSelector((state) => state.gaji9);
  const imoveisList = useMemo(() => tiposImoveis.map((i) => ({ id: i?.id, label: i?.tipo })), [tiposImoveis]);

  const defaultValues = getDefaultsObjeto({ dadosStepper, dados, imoveisList });
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Objeto do Financiamento" />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <GridItem sm={6}>
          <RHFAutocompleteObj name="tipo_imovel_id" label="Tipo de imóvel" options={imoveisList} />
        </GridItem>
        <GridItem sm={6}>
          <RHFTextField name="bem_servico_financiado" label="Bem/Serviço financiado" />
        </GridItem>
        <GridItem>
          <RHFTextField name="finalidade_credito_habitacao" label="Finalidade cred. habitação" />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Entidade({ dados, ids, onClose, dispatch, dadosStepper }) {
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
      {/* {dadosStepper?.colaborador_empresa_parceira && ( */}
      <EntidadesPatronais control={control} entidades={dados?.entidades} values={values} />
      {/* )} */}
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

function Title({ title, action = null }) {
  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="flex-end"
      justifyContent="space-between"
      sx={{ pt: 1, py: 0.5, borderBottom: 1, textAlign: 'center', borderColor: 'divider' }}
    >
      <Box sx={{ typography: 'overline', color: 'text.secondary' }}>{title}</Box>
      {action}
    </Stack>
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
            <RHFAutocompleteSmp
              label="Periodicidade"
              name={`${label}_periodicidade`}
              options={['Mensal', 'Trimestral', 'Semestral', 'Anual']}
            />
          </GridItem>
        </Grid>
      )}
    </Stack>
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
