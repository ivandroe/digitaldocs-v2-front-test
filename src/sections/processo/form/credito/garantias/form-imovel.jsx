// form
import { useFormContext } from 'react-hook-form';
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

export default function FormImovel({ tipo, registado }) {
  const isAp = tipo === 'Apartamento';
  const isTerreno = tipo === 'Terreno';
  const { setValue } = useFormContext();

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={2} justifyContent="center">
          <GridItem md={6} children={<ConservatoriaField name="localizacao_conservatoria" />} />
          {registado && (
            <GridItem sm={6} md={3}>
              <RHFTextField label="Nº inscrição da hipoteca" name="numero_inscricao_hipoteca" />
            </GridItem>
          )}
          <GridItem sm={6} md={registado ? 3 : 6}>
            <RHFAutocompleteSmp label="Tipo de matriz" options={['Urbana', 'Rural']} name="tipo_matriz" />
          </GridItem>
          <GridItem sm={6} md={((isAp || isTerreno) && 4) || 3}>
            <RHFTextField
              label="NIP"
              name="nip"
              onChange={(e) => {
                setValue('nip', e.target.value);
                if (e.target.value) {
                  setValue('numero_matriz', '');
                  setValue('numero_descricao_predial', '');
                }
              }}
            />
          </GridItem>
          <GridItem sm={6} md={4} lg={(isTerreno && 4) || (isAp && 4) || 3}>
            <RHFTextField
              name="numero_matriz"
              label="Nº de matriz"
              onChange={(e) => {
                setValue('numero_matriz', e.target.value);
                if (e.target.value) setValue('nip', '');
              }}
            />
          </GridItem>
          <GridItem sm={6} md={4} lg={(isTerreno && 4) || (isAp && 4) || 3}>
            <RHFTextField
              name="numero_descricao_predial"
              label="Nº descrição predial"
              onChange={(e) => {
                setValue('numero_descricao_predial', e.target.value);
                if (e.target.value) setValue('nip', '');
              }}
            />
          </GridItem>
          {isAp && (
            <>
              <GridItem sm={6} md={4}>
                <RHFTextField name="identificacao_fracao" label="Identificação fração" />
              </GridItem>
              <GridItem sm={6} md={4} children={<RHFTextField name="numero_andar" label="Nº de andar" />} />
            </>
          )}
          {isTerreno && <GridItem sm={6} md={4} children={<RHFNumberField name="area" label="Área" tipo="m²" />} />}
          <GridItem sm={6} md={4} lg={(isTerreno && 4) || (isAp && 4) || 3}>
            <RHFNumberField name="valor_avaliacao" label="Valor avaliação" tipo="CVE" />
          </GridItem>
        </Grid>
      </Card>
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Typography variant="overline">Localização</Typography>
        <Divider sx={{ mb: 1 }} />
        <Grid container spacing={2} justifyContent="center">
          <GridItem sm={6} children={<FreguesiaField name="freguesia" />} />
          <GridItem sm={6} children={<RHFTextField name="zona" label="Zona" />} />
          <GridItem sm={6} md={3} children={<RHFTextField name="rua" label="Rua" />} />
          <GridItem sm={6} md={3}>
            <RHFTextField name="numero_porta" label="Nº da porta" />
          </GridItem>
          <GridItem sm={6}>
            <RHFTextField name="descritivo" label="Descritivo" />
          </GridItem>
        </Grid>
      </Card>
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <FormEntidades label="Dono" name="donos" pt={0} />
      </Card>
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <FormSeguros prefixo="seguros" tipo pt={0} />
      </Card>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FreguesiaField({ name }) {
  return (
    <RHFAutocompleteObj
      name={name}
      label="Freguesia"
      options={applySort(
        listaFreguesias?.map((f) => ({ ...f, label: f?.freguesia })),
        getComparator('asc', 'label')
      )}
    />
  );
}

export function ConservatoriaField({ name }) {
  return (
    <RHFAutocompleteSmp
      name={name}
      label="Conservatória"
      options={listaFreguesias?.map(({ freguesia }) => freguesia)?.sort()}
    />
  );
}
