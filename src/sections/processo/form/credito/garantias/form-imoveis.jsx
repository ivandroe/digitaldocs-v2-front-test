// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { listaFreguesias } from '@/_mock';
import { imovelSchema } from './schemaFileds';
import { applySort, getComparator } from '@/hooks/useTable';
// components
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { AddItem, DefaultAction } from '@/components/Actions';
import { RHFTextField, RHFNumberField, RHFAutocompleteObj, RHFAutocompleteSmp } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormImoveis({ tipo, name }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">{tipo}(s)</Typography>
        <AddItem onClick={() => append(imovelSchema)} dados={{ label: tipo, small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={3}>
        <Imoveis fields={fields} remove={remove} tipo={tipo} prefixo={name} />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Imoveis({ fields = [], remove, prefixo, tipo }) {
  const isAp = tipo === 'Apartamento';
  const isTerreno = tipo === 'Terreno';
  const { setValue } = useFormContext();

  return fields?.length ? (
    fields.map((item, index) => (
      <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Grid container spacing={2} justifyContent="center">
            <GridItem md={6}>
              <RHFAutocompleteSmp
                label="Localização da conservatória"
                name={`${prefixo}[${index}].localizacao_conservatoria`}
                options={listaFreguesias?.map(({ freguesia }) => freguesia)?.sort()}
              />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFAutocompleteSmp
                label="Tipo de matriz"
                options={['Urbana', 'Rural']}
                name={`${prefixo}[${index}].tipo_matriz`}
              />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField
                label="NIP"
                name={`${prefixo}[${index}].nip`}
                onChange={(e) => {
                  setValue(`${prefixo}[${index}].nip`, e.target.value);
                  if (e.target.value) {
                    setValue(`${prefixo}[${index}].numero_matriz`, '');
                    setValue(`${prefixo}[${index}].numero_descricao_predial`, '');
                  }
                }}
              />
            </GridItem>
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFTextField
                name={`${prefixo}[${index}].numero_matriz`}
                label="Nº de matriz"
                onChange={(e) => {
                  setValue(`${prefixo}[${index}].numero_matriz`, e.target.value);
                  if (e.target.value) setValue(`${prefixo}[${index}].nip`, '');
                }}
              />
            </GridItem>
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFTextField
                name={`${prefixo}[${index}].numero_descricao_predial`}
                label="Nº descrição predial"
                onChange={(e) => {
                  setValue(`${prefixo}[${index}].numero_descricao_predial`, e.target.value);
                  if (e.target.value) setValue(`${prefixo}[${index}].nip`, '');
                }}
              />
            </GridItem>
            {isAp && (
              <>
                <GridItem sm={6} md={4} lg={2}>
                  <RHFTextField name={`${prefixo}[${index}].identificacao_fracao`} label="Identificação fração" />
                </GridItem>
                <GridItem sm={6} md={4} lg={2}>
                  <RHFTextField name={`${prefixo}[${index}].numero_andar`} label="Nº de andar" />
                </GridItem>
              </>
            )}
            {isTerreno && (
              <GridItem sm={6} md={4} lg={2.4}>
                <RHFTextField name={`${prefixo}[${index}].area`} label="Área" />
              </GridItem>
            )}
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFNumberField name={`${prefixo}[${index}].valor_pvt`} label="Valor PVT" tipo="CVE" />
            </GridItem>
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFNumberField name={`${prefixo}[${index}].percentagem_cobertura`} label="Cobertura" tipo="%" />
            </GridItem>
            <GridItem>
              <Typography variant="overline">Localização</Typography>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2} justifyContent="center">
                <GridItem sm={6}>
                  <RHFAutocompleteObj
                    label="Freguesia"
                    name={`${prefixo}[${index}].freguesia`}
                    options={applySort(
                      listaFreguesias?.map((f) => ({ ...f, label: f?.freguesia })),
                      getComparator('asc', 'label')
                    )}
                  />
                </GridItem>
                <GridItem sm={6} children={<RHFTextField name={`${prefixo}[${index}].zona`} label="Zona" />} />
                <GridItem sm={6} md={3} children={<RHFTextField name={`${prefixo}[${index}].rua`} label="Rua" />} />
                <GridItem sm={6} md={3}>
                  <RHFTextField name={`${prefixo}[${index}].numero_porta`} label="Nº da porta" />
                </GridItem>
                <GridItem sm={6}>
                  <RHFTextField name={`${prefixo}[${index}].descritivo`} label="Descritivo" />
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem children={<FormEntidades label="Dono" name={`${prefixo}[${index}].donos`} />} />
            <GridItem children={<FormSeguros prefixo={`${prefixo}[${index}].seguros`} tipo />} />
          </Grid>
          <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
        </Stack>
      </Card>
    ))
  ) : (
    <SemDados message={`Nenhum ${tipo.toLowerCase()} adicionado...`} sx={{ p: 1.5 }} />
  );
}
