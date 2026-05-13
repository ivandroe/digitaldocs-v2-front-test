import { useMemo } from 'react';
// form
import { useFormContext, useWatch } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { listaFreguesias } from '@/_mock';
import { applySort, getComparator } from '@/hooks/useTable';
// components
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';
import GridItem from '@/components/GridItem';
import { RHFTextField, RHFNumberField, RHFAutocompleteObj, RHFAutocompleteSmp } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormImoveis({ tipo, name }) {
  const { control } = useFormContext();
  const bemFinanciado = useWatch({ control, name: 'bem_financiado' });
  const isAp = tipo === 'Apartamento';
  const isTerreno = tipo === 'Terreno';

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">{tipo}</Typography>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Bem name={name} isAp={isAp} isTerreno={isTerreno} bemFinanciado={bemFinanciado} />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Bem({ name, isAp, isTerreno, bemFinanciado }) {
  const { setValue } = useFormContext();

  return (
    <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
      <Grid container spacing={2} justifyContent="center">
        {!bemFinanciado && (
          <>
            <GridItem md={6}>
              <RHFAutocompleteSmp
                label="Localização da conservatória"
                name={`${name}.localizacao_conservatoria`}
                options={listaFreguesias?.map(({ freguesia }) => freguesia)?.sort()}
              />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFAutocompleteSmp
                label="Tipo de matriz"
                options={['Urbana', 'Rural']}
                name={`${name}.tipo_matriz`}
              />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField
                label="NIP"
                name={`${name}.nip`}
                onChange={(e) => {
                  setValue(`${name}.nip`, e.target.value);
                  if (e.target.value) {
                    setValue(`${name}.numero_matriz`, '');
                    setValue(`${name}.numero_descricao_predial`, '');
                  }
                }}
              />
            </GridItem>
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFTextField
                name={`${name}.numero_matriz`}
                label="Nº de matriz"
                onChange={(e) => {
                  setValue(`${name}.numero_matriz`, e.target.value);
                  if (e.target.value) setValue(`${name}.nip`, '');
                }}
              />
            </GridItem>
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFTextField
                name={`${name}.numero_descricao_predial`}
                label="Nº descrição predial"
                onChange={(e) => {
                  setValue(`${name}.numero_descricao_predial`, e.target.value);
                  if (e.target.value) setValue(`${name}.nip`, '');
                }}
              />
            </GridItem>
            {isAp && (
              <>
                <GridItem sm={6} md={4} lg={2}>
                  <RHFTextField name={`${name}.identificacao_fracao`} label="Identificação fração" />
                </GridItem>
                <GridItem sm={6} md={4} lg={2}>
                  <RHFTextField name={`${name}.numero_andar`} label="Nº de andar" />
                </GridItem>
              </>
            )}
            {isTerreno && (
              <GridItem sm={6} md={4} lg={2.4}>
                <RHFTextField name={`${name}.area`} label="Área" />
              </GridItem>
            )}
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFTextField name={`${name}.numero_inscricao_hipoteca`} label="Nº inscrição hipoteca" />
            </GridItem>
            <GridItem sm={6} md={4} lg={(isTerreno && 2.4) || (isAp && 2) || 3}>
              <RHFNumberField name={`${name}.valor_pvt`} label="Valor PVT" tipo="CVE" />
            </GridItem>
            <GridItem>
              <LocalizacaoBlock name={name} />
            </GridItem>
            <GridItem children={<FormEntidades label="Dono" name={`${name}.donos`} />} />
          </>
        )}
        <GridItem children={<FormSeguros prefixo={`${name}.seguros`} tipo />} />
      </Grid>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const ILHAS = Array.from(new Set(listaFreguesias.map((f) => f.ilha))).sort();

function LocalizacaoBlock({ name }) {
  const { control, setValue } = useFormContext();
  const ilha = useWatch({ control, name: `${name}.ilha` });

  const freguesiasDaIlha = useMemo(() => {
    if (!ilha) return [];
    return applySort(
      listaFreguesias.filter((f) => f.ilha === ilha).map((f) => ({ ...f, label: f.freguesia })),
      getComparator('asc', 'label')
    );
  }, [ilha]);

  return (
    <>
      <Typography variant="overline">Localização</Typography>
      <Divider sx={{ mb: 1 }} />
      <Grid container spacing={2} justifyContent="center">
        <GridItem sm={6} md={4}>
          <RHFAutocompleteSmp
            label="Ilha"
            name={`${name}.ilha`}
            options={ILHAS}
            onChange={(_, newValue) => {
              setValue(`${name}.ilha`, newValue ?? '');
              setValue(`${name}.freguesia`, null);
              setValue(`${name}.concelho`, '');
            }}
          />
        </GridItem>
        <GridItem sm={6} md={4}>
          <RHFAutocompleteObj
            label="Freguesia"
            name={`${name}.freguesia`}
            options={freguesiasDaIlha}
            disabled={!ilha}
            onChange={(_, newValue) => {
              setValue(`${name}.freguesia`, newValue);
              setValue(`${name}.concelho`, newValue?.concelho ?? '');
            }}
          />
        </GridItem>
        <GridItem sm={6} md={4}>
          <RHFTextField
            label="Concelho"
            name={`${name}.concelho`}
            disabled
            InputLabelProps={{ shrink: true }}
          />
        </GridItem>
        <GridItem sm={6} children={<RHFTextField name={`${name}.zona`} label="Zona" />} />
        <GridItem sm={6} md={3} children={<RHFTextField name={`${name}.rua`} label="Rua" />} />
        <GridItem sm={6} md={3}>
          <RHFTextField name={`${name}.numero_porta`} label="Nº da porta" />
        </GridItem>
        <GridItem sm={6}>
          <RHFTextField name={`${name}.descritivo`} label="Descritivo" />
        </GridItem>
      </Grid>
    </>
  );
}
