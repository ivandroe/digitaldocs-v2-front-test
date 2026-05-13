// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// components
import FormSeguros from './form-seguros';
import GridItem from '@/components/GridItem';
import { RHFTextField, RHFNumberField } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormTitulos() {
  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Typography variant="overline">Título</Typography>
      <Divider sx={{ my: 1 }} />
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={2}>
          <GridItem sm={6}>
            <RHFTextField name="titulo.codigo" label="Código" />
          </GridItem>
          <GridItem sm={6}>
            <RHFNumberField name="titulo.numero_cliente" label="Nº de cliente" noFormat />
          </GridItem>
          <GridItem children={<FormSeguros prefixo="titulo.seguros" tipo />} />
        </Grid>
      </Card>
    </Stack>
  );
}
