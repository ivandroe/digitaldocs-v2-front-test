// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// components
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';
import GridItem from '@/components/GridItem';
import { ConservatoriaField } from './form-imovel';
import { FaturaProforma } from '../metadados/bens-financiados';
import { RHFTextField, RHFNumberField } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormVeiculo({ registado }) {
  const n = (field) => field;

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={2} justifyContent="center">
          <GridItem sm={6} md={4} children={<RHFTextField name="marca" label="Marca" />} />
          <GridItem sm={6} md={4} children={<RHFTextField name="modelo" label="Modelo" />} />
          <GridItem sm={6} md={4}>
            <RHFNumberField name="ano_fabrico" label="Ano de fabricação" noFormat />
          </GridItem>
          {registado ? (
            <>
              <GridItem sm={6} md={4} children={<RHFTextField name="nura" label="NURA" />} />
              <GridItem sm={6} md={4} children={<RHFTextField name="matricula" label="Matrícula" />} />
              <GridItem sm={6} md={4} children={<ConservatoriaField name="localizacao_conservatoria" />} />
            </>
          ) : (
            <FaturaProforma n={n} />
          )}
          <GridItem sm={6} md={4} children={<RHFNumberField name="valor" label="Valor" tipo="CVE" />} />
          <GridItem sm={6} md={4}>
            <RHFNumberField name="valor_avaliacao" label="Valor avaliação" tipo="CVE" />
          </GridItem>
        </Grid>
      </Card>

      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <GridItem children={<FormEntidades label="Dono" name="donos" pt={0} />} />
      </Card>

      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <GridItem children={<FormSeguros prefixo="seguros" tipo pt={0} />} />
      </Card>
    </Stack>
  );
}
