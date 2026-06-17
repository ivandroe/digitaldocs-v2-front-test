import { useMemo } from 'react';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { vdt } from '@/utils/formatObject';
import { useSelector, useDispatch } from '@/redux/store';
import { updateDados, resetDados } from '@/redux/slices/stepper';
//
import { extrairBens } from './schemaFileds';
import { shapeGarantia } from './validationFields';
import { listaGarantias } from '@/modules/gaji9/utils/applySortFilter';
// components
import Steps from '@/components/Steps';
import GridItem from '@/components/GridItem';
import { ButtonsStepper } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { FormProvider, RHFNumberField, RHFAutocompleteObj, RHFSwitch } from '@/components/hook-form';
//
import FormBemFinanciado from './form-bem-financiado';
import FormMetadadosGarantias from './form-metadados-garantia';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormGarantias({ dados, processoId, onClose }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);
  const { tiposGarantias } = useSelector((state) => state.gaji9);
  const bensFinanciados =
    useSelector((state) => state.digitaldocs.processo?.credito?.gaji9_metadados?.bens_financiados) || [];

  const isEdit = dados?.modal === 'update';
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const tipoGarantia = useMemo(
    () => garantiasList?.find(({ id }) => id === dados?.tipo_garantia_id) || null,
    [dados?.tipo_garantia_id, garantiasList]
  );

  const formSchema = shapeGarantia();
  const defaultValues = useMemo(
    () => ({
      tipo_garantia: tipoGarantia,
      bem_financiado: !!dados?.metadados?.bem?.bem_financiado,
      bem_sem_registo: !!dados?.metadados?.bem?.bem_sem_registo,
      percentagem_cobertura: dados?.percentagem_cobertura || '',
      subtipo_garantia: tipoGarantia?.subtipos?.find(({ id }) => id === dados?.subtipo_garantia_id) || null,
    }),
    [dados, tipoGarantia]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit, control, setValue } = methods;

  const tipo = useWatch({ control, name: 'tipo_garantia' });
  const subtipo = useWatch({ control, name: 'subtipo_garantia' });
  const bem_financiado = useWatch({ control, name: 'bem_financiado' });
  const subtipos = useMemo(() => tipo?.subtipos ?? [], [tipo?.subtipos]);

  const chaveMeta = extrairChaveMeta(tipo, subtipo);
  const bensFinanciadosMeta = extrairBens(bensFinanciados, chaveMeta?.chave);
  const bensAplicado = bens?.includes(chaveMeta?.chave) && bensFinanciadosMeta?.length > 0;

  const onSubmit = async (values) => {
    dispatch(updateDados({ forward: true, dados: values }));
  };

  const closeModal = () => {
    dispatch(resetDados());
    onClose();
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        sx={{ pb: 2 }}
        onClose={closeModal}
        title={isEdit ? 'Editar garantia' : 'Adicionar garantia'}
        content={<Steps sx={{ mt: 2, mb: 0 }} activeStep={activeStep} steps={['Garantia', 'Métadados']} />}
      />
      <DialogContent>
        {activeStep === 0 && (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ pt: 0.5 }}>
              <GridItem md={subtipos.length > 0 ? 12 : 9}>
                <RHFAutocompleteObj
                  dc
                  label="Garantia"
                  disabled={isEdit}
                  options={garantiasList}
                  name="tipo_garantia"
                  onChange={(_, newValue) => {
                    setValue('tipo_garantia', newValue, vdt);
                    setValue('subtipo_garantia', null, vdt);
                  }}
                />
              </GridItem>

              {subtipos.length > 0 ? (
                <GridItem sm={9}>
                  <RHFAutocompleteObj
                    dc
                    label="Subtipo"
                    disabled={isEdit}
                    options={subtipos}
                    name="subtipo_garantia"
                    onChange={(_, newValue) => setValue('subtipo_garantia', newValue, vdt)}
                  />
                </GridItem>
              ) : null}
              <GridItem sm={3}>
                <RHFNumberField label="Cobertura" name="percentagem_cobertura" tipo="%" />
              </GridItem>
              {bensAplicado && (
                <GridItem children={<RHFSwitch name="bem_financiado" label="Bem financiado pelo crédito" />} />
              )}
              {/* {bens?.includes(chaveMeta?.chave) && (
                <GridItem children={<RHFSwitch name="bem_sem_registo" label="Bem ainda não registado" />} />
              )} */}
            </Grid>
            <ButtonsStepper onClose={closeModal} labelCancel="Cancelar" />
          </FormProvider>
        )}
        {activeStep === 1 && !bem_financiado && (
          <FormMetadadosGarantias onClose={closeModal} dados={dados} chaveMeta={chaveMeta} processoId={processoId} />
        )}
        {activeStep === 1 && bem_financiado && (
          <FormBemFinanciado onClose={closeModal} dados={dados} processoId={processoId} bens={bensFinanciadosMeta} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const chaveMetaGarantia = [
  { value: 'contas', label: 'DP', chave: 'dp', meta: 'bem' },
  { value: 'acoes', label: 'Ações', chave: 'acoes', meta: 'bem' },
  { value: 'predios', label: 'Prédio', chave: 'predio', meta: 'bem' },
  { value: 'titulos', label: 'Título', chave: 'titulo', meta: 'bem' },
  { value: 'seguros', label: 'Seguro', chave: 'seguro', meta: 'bem' },
  { value: 'terrenos', label: 'Terreno', chave: 'terreno', meta: 'bem' },
  { value: 'veiculos', label: 'Veículo', chave: 'veiculo', meta: 'bem' },
  { value: 'aval', label: 'Avalista', chave: 'aval', meta: 'garantidores' },
  { value: 'fiadores', label: 'Fiador', chave: 'fianca', meta: 'garantidores' },
  { value: 'apartamentos', label: 'Apartamento', chave: 'apartamento', meta: 'bem' },
  { value: 'livrancas', label: 'Livrança', chave: 'livranca', meta: 'numero_livranca' },
];

const bens = ['predio', 'terreno', 'apartamento', 'veiculo'];

function resolverChaveMeta(tipoSelecionado, subtipoSelecionado) {
  if (!tipoSelecionado) return null;

  const temSubtipos = tipoSelecionado.subtipos?.length > 0;
  if (!temSubtipos) return tipoSelecionado.chave_meta ?? null;
  if (!subtipoSelecionado) return null;

  return subtipoSelecionado.chave_meta ?? tipoSelecionado.chave_meta ?? null;
}

function buscarConfigGarantia(chave_meta) {
  if (!chave_meta) return null;
  return chaveMetaGarantia.find((item) => item.value === chave_meta) ?? null;
}

function extrairChaveMeta(tipoSelecionado, subtipoSelecionado) {
  const chave_meta = resolverChaveMeta(tipoSelecionado, subtipoSelecionado);
  return buscarConfigGarantia(chave_meta);
}
