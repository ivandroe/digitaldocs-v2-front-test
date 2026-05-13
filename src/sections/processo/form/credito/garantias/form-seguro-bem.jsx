import { useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { useSelector } from '@/redux/store';
// components
import GridItem from '@/components/GridItem';
import { RHFTextField, RHFNumberField, RHFAutocompleteSmp, RHFAutocompleteObj } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormSeguroBem() {
  const { tiposSeguros } = useSelector((state) => state.gaji9);
  const segurosList = useMemo(() => tiposSeguros.map((s) => ({ id: s?.id, label: s?.designacao })), [tiposSeguros]);

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Typography variant="overline">Seguro</Typography>
      <Divider sx={{ my: 1 }} />
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={2} justifyContent="center">
          <GridItem sm={12} md={4}>
            <RHFAutocompleteObj label="Tipo" name="seguro.tipo" options={segurosList} />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFAutocompleteSmp
              label="Seguradora"
              name="seguro.seguradora"
              options={['Aliança Seguros', 'Garantia Seguros', 'Impar Seguros']}
            />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFTextField name="seguro.apolice" label="Apólice" />
          </GridItem>
          <GridItem sm={6} md={3}>
            <RHFNumberField name="seguro.valor" label="Valor" tipo="CVE" />
          </GridItem>
          <GridItem sm={6} md={3}>
            <RHFNumberField name="seguro.premio" label="Prémio" tipo="CVE" />
          </GridItem>
          <GridItem sm={6} md={3}>
            <RHFAutocompleteSmp
              label="Periodicidade"
              name="seguro.periodicidade"
              options={['Único', 'Mensal', 'Trimestral', 'Semestral', 'Anual']}
            />
          </GridItem>
        </Grid>
      </Card>
    </Stack>
  );
}
