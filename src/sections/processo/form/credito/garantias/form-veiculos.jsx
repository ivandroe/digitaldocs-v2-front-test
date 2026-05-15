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
// components
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';
import GridItem from '@/components/GridItem';
import { RHFTextField, RHFNumberField, RHFAutocompleteSmp } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormVeiculos() {
  const { control } = useFormContext();
  const bemFinanciado = useWatch({ control, name: 'bem_financiado' });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Veículo</Typography>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={2} justifyContent="center">
          {!bemFinanciado && (
            <>
              <GridItem sm={6} md={3}>
                <RHFTextField name="veiculo.marca" label="Marca" />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFTextField name="veiculo.modelo" label="Modelo" />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFTextField name="veiculo.matricula" label="Matrícula" />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFTextField name="veiculo.nura" label="NURA" />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFNumberField name="veiculo.ano_fabrico" label="Ano de fabricação" noFormat />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFNumberField name="veiculo.valor" label="Valor" tipo="CVE" />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFNumberField name="veiculo.valor_avaliacao" label="Valor avaliação" tipo="CVE" />
              </GridItem>
              <GridItem md={6}>
                <RHFAutocompleteSmp
                  label="Localização da conservatória"
                  name="veiculo.localizacao_conservatoria"
                  options={listaFreguesias?.map(({ freguesia }) => freguesia)?.sort()}
                />
              </GridItem>
              <GridItem children={<FormEntidades label="Dono" name="veiculo.donos" />} />
            </>
          )}
          <GridItem children={<FormSeguros prefixo="veiculo.seguros" tipo />} />
        </Grid>
      </Card>
    </Stack>
  );
}
