import { useMemo, useEffect, useCallback } from 'react';
// form
import { useForm, useWatch, useFormContext, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { listaFreguesias, listaConservatorias } from '@/_mock';
import { applySort, getComparator } from '@/hooks/useTable';
import {
  schemaTaxas,
  schemaObjeto,
  buildPayload,
  schemaRegime,
  getDefaultsTaxas,
  getDefaultsObjeto,
  getDefaultsRegime,
  getSchemaCondicoes,
  getDefaultsEntidade,
  getDefaultsCondicoes,
  bemFinanciadoSchema,
  TIPOS_BEM_FINANCIADO,
  PERIODICIDADES_COMISSAO,
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
  RHFAutocompleteObj,
  RHFAutocompleteSmp,
} from '@/components/hook-form';
import Steps from '@/components/Steps';
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { FormLoading } from '@/components/skeleton';
import { AddItem, DefaultAction, ButtonsStepper } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';

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
            sx={{ mt: 4, mb: 3 }}
            activeStep={activeStep}
            steps={['Regime', 'Condições', 'Taxas', 'Bens', 'Entidade']}
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
            {activeStep === 3 && <Objeto {...commonProps} />}
            {activeStep === 4 && <Entidade {...commonProps} ids={ids} onClose={handleClose} />}
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
        {values?.colaborador_empresa_parceira && <GridItem children={<EntidadesPatronaisField />} />}
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
      <Grid container spacing={3} sx={{ mt: 3 }} justifyContent="center">
        <GridItem xs={6} md={4}>
          <RHFNumberField name="conta_do_renda" label="Conta DO renda" noFormat />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="capital_max_isento_imposto_selo" label="Capital máx. isento imp. selo" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="numero_prestacao" label="Nº de prestações" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="meses_vencimento" label="Meses de vencimento" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="periodo_carencia" label="Período de carência" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="prazo_utilizacao" label="Prazo de utilização" tipo="meses" />
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
        <GridItem>
          <ComissaoAdicionalField
            ativaKey="comissao_avaliacao_ativa"
            valueKey="comissao_avaliacao"
            label="Comissão de avaliação"
            ativa={values?.comissao_avaliacao_ativa}
          />
        </GridItem>
        <GridItem>
          <ComissaoAdicionalField
            ativaKey="comissao_vistoria_ativa"
            valueKey="comissao_vistoria"
            label="Comissão de vistoria"
            ativa={values?.comissao_vistoria_ativa}
          />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Objeto({ dados, dispatch, dadosStepper }) {
  const defaultValues = getDefaultsObjeto({ dadosStepper, dados });
  const methods = useForm({ resolver: yupResolver(schemaObjeto), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Bens ou serviços financiados" />
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <GridItem children={<BensFinanciadosField />} />
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Entidade({ dados, ids, onClose, dispatch, dadosStepper }) {
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = getDefaultsEntidade({ dadosStepper, dados });
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;

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
      <Title title="Entidade Vendedora / Fornecedora" />
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <GridItem sm={6}>
          <RHFTextField name="nome_empresa_fornecedora" label="Empresa fornecedora" />
        </GridItem>
        <GridItem sm={6}>
          <RHFNumberField name="nib_vendedor_ou_fornecedor" label="NIB vendedor/fornecedor" noFormat />
        </GridItem>
        <GridItem sm={6}>
          <RHFTextField label="Instituição de crédito" name="instituicao_credito_conta_vendedor_ou_fornecedor" />
        </GridItem>
        <GridItem sm={6}>
          <RHFNumberField tipo="CVE" label="Valor a transferir" name="valor_transferir_conta_vendedor_ou_fornecedor" />
        </GridItem>
      </Grid>
      <ButtonsStepper label="Guardar" isSaving={isSaving} onClose={() => dispatch(backStep())} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Title({ title }) {
  return (
    <Paper
      sx={{ bgcolor: 'background.neutral', color: 'success.main', p: 1.5, textAlign: 'center', typography: 'overline' }}
    >
      {title}
    </Paper>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function EntidadesPatronaisField() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades_patronais' });
  const processo = useSelector((state) => state.digitaldocs.processo);
  const mutuariosOptions = useMemo(
    () =>
      (processo?.entidade ?? '')
        .split(';')
        .map((v) => v.trim())
        .filter(Boolean),
    [processo?.entidade]
  );

  useEffect(() => {
    if (fields.length === 0) {
      const preenchido = mutuariosOptions.length === 1 ? mutuariosOptions[0] : '';
      append({ numero_entidade_mutuario: preenchido, numero_entidade_patronal: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Entidade(s) patronal(is)</Typography>
        <AddItem
          dados={{ label: 'Entidade patronal', small: true }}
          onClick={() => append({ numero_entidade_mutuario: '', numero_entidade_patronal: '' })}
        />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={2} justifyContent="center">
        {fields.length ? (
          fields.map((item, index) => (
            <GridItem md={6} key={item.id}>
              <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                    <RHFAutocompleteSmp
                      label="Nº mutuário"
                      options={mutuariosOptions}
                      name={`entidades_patronais[${index}].numero_entidade_mutuario`}
                    />
                    <RHFNumberField
                      noFormat
                      label="Nº entidade patronal"
                      name={`entidades_patronais[${index}].numero_entidade_patronal`}
                    />
                  </Stack>
                  <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
                </Stack>
              </Card>
            </GridItem>
          ))
        ) : (
          <GridItem children={<SemDados message="Nenhuma entidade patronal adicionada..." sx={{ p: 1.5 }} />} />
        )}
      </Grid>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function ComissaoAdicionalField({ ativaKey, valueKey, label, ativa }) {
  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="overline">{label}</Typography>
        <RHFSwitch name={ativaKey} label="Aplicar" />
      </Stack>
      <Divider sx={{ my: 1 }} />
      {ativa ? (
        <Grid container spacing={2}>
          <GridItem sm={4}>
            <RHFNumberField name={`${valueKey}.valor`} label="Valor" tipo="CVE" />
          </GridItem>
          <GridItem sm={4}>
            <RHFNumberField name={`${valueKey}.prazo`} label="Prazo" tipo="meses" />
          </GridItem>
          <GridItem sm={4}>
            <RHFAutocompleteSmp
              label="Periodicidade"
              name={`${valueKey}.periodicidade`}
              options={PERIODICIDADES_COMISSAO}
            />
          </GridItem>
        </Grid>
      ) : null}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const ILHAS = Array.from(new Set(listaFreguesias.map((f) => f.ilha))).sort();

const freguesiasDaIlha = (ilha) =>
  ilha
    ? applySort(
        listaFreguesias.filter((f) => f.ilha === ilha).map((f) => ({ ...f, label: f.freguesia })),
        getComparator('asc', 'label')
      )
    : [];

function BensFinanciadosField() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'bens_financiados' });
  const bens = watch('bens_financiados') ?? [];

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Bens financiados</Typography>
        <AddItem dados={{ label: 'Bem', small: true }} onClick={() => append(bemFinanciadoSchema)} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={2}>
        {fields.length ? (
          fields.map((item, index) => {
            const tipoId = bens?.[index]?.tipo?.id;
            const isImovel = ['apartamento', 'predio', 'terreno'].includes(tipoId);
            const isAp = tipoId === 'apartamento';
            const isTerreno = tipoId === 'terreno';
            const isVeiculo = tipoId === 'veiculo';
            const isOutroOuEquip = tipoId === 'equipamento' || tipoId === 'outro';
            return (
              <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <GridItem sm={6} md={4}>
                      <RHFAutocompleteObj
                        label="Tipo do bem"
                        name={`bens_financiados[${index}].tipo`}
                        options={TIPOS_BEM_FINANCIADO}
                      />
                    </GridItem>
                    {isImovel && (
                      <>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].nip`} label="NIP" />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField
                            name={`bens_financiados[${index}].numero_descricao_predial`}
                            label="Nº descrição predial"
                          />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].numero_matriz`} label="Nº de matriz" />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFAutocompleteSmp
                            label="Tipo de matriz"
                            options={['Urbana', 'Rural']}
                            name={`bens_financiados[${index}].tipo_matriz`}
                          />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField
                            name={`bens_financiados[${index}].numero_inscricao_hipoteca`}
                            label="Nº inscrição hipoteca"
                          />
                        </GridItem>
                        {isAp && (
                          <>
                            <GridItem sm={6} md={4}>
                              <RHFTextField
                                name={`bens_financiados[${index}].identificacao_fracao`}
                                label="Identificação fração"
                              />
                            </GridItem>
                            <GridItem sm={6} md={4}>
                              <RHFTextField name={`bens_financiados[${index}].numero_andar`} label="Nº andar" />
                            </GridItem>
                          </>
                        )}
                        {isTerreno && (
                          <GridItem sm={6} md={4}>
                            <RHFTextField name={`bens_financiados[${index}].area`} label="Área" />
                          </GridItem>
                        )}
                        <GridItem md={6}>
                          <RHFAutocompleteSmp
                            label="Conservatória"
                            name={`bens_financiados[${index}].localizacao_conservatoria`}
                            options={listaConservatorias}
                          />
                        </GridItem>
                        <GridItem sm={4} md={3}>
                          <RHFAutocompleteSmp
                            label="Ilha"
                            name={`bens_financiados[${index}].ilha`}
                            options={ILHAS}
                            onChange={(_, newValue) => {
                              setValue(`bens_financiados[${index}].ilha`, newValue ?? '');
                              setValue(`bens_financiados[${index}].freguesia`, null);
                              setValue(`bens_financiados[${index}].concelho`, '');
                            }}
                          />
                        </GridItem>
                        <GridItem sm={4} md={3}>
                          <RHFAutocompleteObj
                            label="Freguesia"
                            name={`bens_financiados[${index}].freguesia`}
                            options={freguesiasDaIlha(bens?.[index]?.ilha)}
                            disabled={!bens?.[index]?.ilha}
                            onChange={(_, newValue) => {
                              setValue(`bens_financiados[${index}].freguesia`, newValue);
                              setValue(`bens_financiados[${index}].concelho`, newValue?.concelho ?? '');
                            }}
                          />
                        </GridItem>
                        <GridItem sm={4} md={3}>
                          <RHFTextField
                            name={`bens_financiados[${index}].concelho`}
                            label="Concelho"
                            disabled
                            InputLabelProps={{ shrink: true }}
                          />
                        </GridItem>
                        <GridItem sm={4} md={3}>
                          <RHFTextField name={`bens_financiados[${index}].zona`} label="Zona" />
                        </GridItem>
                        <GridItem sm={4} md={3}>
                          <RHFTextField name={`bens_financiados[${index}].rua`} label="Rua" />
                        </GridItem>
                        <GridItem sm={4} md={3}>
                          <RHFTextField name={`bens_financiados[${index}].numero_porta`} label="Nº porta" />
                        </GridItem>
                      </>
                    )}
                    {isVeiculo && (
                      <>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].matricula`} label="Matrícula" />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].marca`} label="Marca" />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].modelo`} label="Modelo" />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].ano_fabrico`} label="Ano fabrico" />
                        </GridItem>
                        <GridItem sm={6} md={4}>
                          <RHFTextField name={`bens_financiados[${index}].nura`} label="NURA" />
                        </GridItem>
                        <GridItem md={6}>
                          <RHFAutocompleteSmp
                            label="Conservatória"
                            name={`bens_financiados[${index}].localizacao_conservatoria`}
                            options={listaConservatorias}
                          />
                        </GridItem>
                      </>
                    )}
                    {isOutroOuEquip && (
                      <GridItem>
                        <RHFTextField name={`bens_financiados[${index}].descritivo`} label="Descritivo" />
                      </GridItem>
                    )}
                    {tipoId && (
                      <>
                        <GridItem sm={6} md={3}>
                          <RHFNumberField name={`bens_financiados[${index}].valor`} label="Valor" tipo="CVE" />
                        </GridItem>
                        <GridItem sm={6} md={3}>
                          <RHFNumberField
                            name={`bens_financiados[${index}].valor_avaliacao`}
                            label="Valor avaliação"
                            tipo="CVE"
                          />
                        </GridItem>
                      </>
                    )}
                  </Grid>
                  <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
                </Stack>
              </Card>
            );
          })
        ) : (
          <SemDados message="Nenhum bem financiado adicionado..." sx={{ p: 1.5 }} />
        )}
      </Stack>
    </Stack>
  );
}
