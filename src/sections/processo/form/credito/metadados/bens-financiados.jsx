// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// utils
import { getDefaultsBens } from './default-values';
import { updateDados } from '@/redux/slices/stepper';
import { bemFinanciadoSchema, TIPOS_BEM_FINANCIADO, shapeBensFinanciados } from './schemas';
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
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { FreguesiaField, ConservatoriaField } from '../garantias/form-imovel';
import { AddItem, DefaultAction, ButtonsStepper } from '@/components/Actions';
//
import { Title } from '.';

const COL = { xs: 12, sm: 6, md: 4 };

// ---------------------------------------------------------------------------------------------------------------------

export function BensFinanciados({ dados, dispatch, dadosStepper }) {
  const defaultValues = getDefaultsBens({ dadosStepper, dados });
  const methods = useForm({ resolver: yupResolver(shapeBensFinanciados), defaultValues });
  const { handleSubmit, control, setValue } = methods;
  const values = useWatch({ control });
  const { fields, append, remove } = useFieldArray({ control, name: 'bens_financiados' });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title
        title="Bens financiados"
        action={<AddItem dados={{ label: 'Bem', small: true }} onClick={() => append(bemFinanciadoSchema)} />}
      />
      <BensFinanciadosFields fields={fields} remove={remove} bens={values?.bens_financiados} setValue={setValue} />
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function BensFinanciadosFields({ remove, fields, bens, setValue }) {
  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {fields.length ? (
        fields.map((item, index) => {
          const tipoId = bens?.[index]?.tipo?.id;
          const registado = !bens?.[index]?.bem_sem_registo;
          const n = (field) => `bens_financiados[${index}].${field}`;

          const isAp = tipoId === 'apartamento';
          const isTerreno = tipoId === 'terreno';
          const isVeiculo = tipoId === 'veiculo';
          const isOutroOuEquip = tipoId === 'equipamento' || tipoId === 'outro';
          const isImovel = ['apartamento', 'predio', 'terreno'].includes(tipoId);

          return (
            <Card key={item.id} sx={{ p: 1.5, boxShadow: (theme) => theme.customShadows.cardAlt }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
                  {(isImovel || isVeiculo) && (
                    <GridItem children={<RHFSwitch label="Bem ainda não registado" name={n('bem_sem_registo')} />} />
                  )}
                  <GridItem {...COL}>
                    <RHFAutocompleteObj label="Tipo do bem" options={TIPOS_BEM_FINANCIADO} name={n('tipo')} />
                  </GridItem>

                  {isImovel && (
                    <DadosImovel n={n} isAp={isAp} setValue={setValue} isTerreno={isTerreno} registado={registado} />
                  )}

                  {isVeiculo && <DadosVeiculo n={n} registado={registado} />}

                  {isOutroOuEquip && (
                    <GridItem md={8}>
                      <RHFTextField label="Descritivo" name={n('descritivo')} />
                    </GridItem>
                  )}

                  {tipoId && (
                    <>
                      <GridItem {...COL}>
                        <RHFNumberField label="Valor" name={n('valor')} tipo="CVE" />
                      </GridItem>
                      <GridItem {...COL}>
                        <RHFNumberField label="Valor avaliação" name={n('valor_avaliacao')} tipo="CVE" />
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
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DadosImovel({ n, isTerreno, isAp, setValue, registado }) {
  return (
    <>
      <GridItem {...COL}>
        <RHFAutocompleteSmp label="Tipo de matriz" name={n('tipo_matriz')} options={['Urbana', 'Rural']} />
      </GridItem>
      <GridItem {...COL} children={<ConservatoriaField name={n('localizacao_conservatoria')} />} />
      {registado ? (
        <GridItem {...COL}>
          <RHFTextField label="Nº inscrição da hipoteca" name={n('numero_inscricao_hipoteca')} />
        </GridItem>
      ) : null}
      <GridItem {...COL}>
        <RHFTextField
          label="NIP"
          name={n('nip')}
          onChange={(e) => {
            setValue(n('nip'), e.target.value);
            if (e.target.value) {
              setValue(n('numero_matriz'), '');
              setValue(n('numero_descricao_predial'), '');
            }
          }}
        />
      </GridItem>
      <GridItem {...COL}>
        <RHFTextField
          label="Nº de matriz"
          name={n('numero_matriz')}
          onChange={(e) => {
            setValue(n('numero_matriz'), e.target.value);
            if (e.target.value) setValue(n('nip'), '');
          }}
        />
      </GridItem>
      <GridItem {...COL}>
        <RHFTextField
          label="Nº descrição predial"
          name={n('numero_descricao_predial')}
          onChange={(e) => {
            setValue(n('numero_descricao_predial'), e.target.value);
            if (e.target.value) setValue(n('nip'), '');
          }}
        />
      </GridItem>
      {isAp && (
        <>
          <GridItem {...COL}>
            <RHFTextField label="Identificação fração" name={n('identificacao_fracao')} />
          </GridItem>
          <GridItem {...COL} children={<RHFTextField label="Nº de andar" name={n('numero_andar')} />} />
        </>
      )}
      {isTerreno && <GridItem {...COL} children={<RHFNumberField label="Área" name={n('area')} tipo="m²" />} />}
      <GridItem {...COL} children={<FreguesiaField name={n('freguesia')} />} />
      <GridItem {...COL} children={<RHFTextField label="Zona" name={n('zona')} />} />
      <GridItem {...COL} children={<RHFTextField label="Rua" name={n('rua')} />} />
      <GridItem {...COL} children={<RHFTextField label="Nº da porta" name={n('numero_porta')} />} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DadosVeiculo({ n, registado }) {
  return (
    <>
      <GridItem {...COL} children={<RHFTextField label="Marca" name={n('marca')} />} />
      <GridItem {...COL} children={<RHFTextField label="Modelo" name={n('modelo')} />} />
      {registado ? (
        <>
          <GridItem {...COL} children={<RHFTextField label="NURA" name={n('nura')} />} />
          <GridItem {...COL} children={<RHFTextField label="Matrícula" name={n('matricula')} />} />
          <GridItem {...COL} children={<ConservatoriaField name={n('localizacao_conservatoria')} />} />
        </>
      ) : (
        <FaturaProforma n={n} />
      )}
      <GridItem {...COL} children={<RHFNumberField noFormat label="Ano de fabricação" name={n('ano_fabrico')} />} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FaturaProforma({ n }) {
  return (
    <>
      <GridItem {...COL}>
        <RHFTextField label="Nº da fatura proforma" name={n('numero_fatura_proforma')} />
      </GridItem>
      <GridItem {...COL}>
        <RHFTextField label="Entidade emissora" name={n('emissora_fatura_proforma')} />
      </GridItem>
      <GridItem {...COL}>
        <RHFDatePicker label="Data da fatura proforma" name={n('data_emissao_fatura_proforma')} disableFuture />
      </GridItem>
    </>
  );
}
