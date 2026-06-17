// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// components
import GridItem from '@/components/GridItem';
import { RHFTextField, RHFNumberField } from '@/components/hook-form';
//
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';

// ---------------------------------------------------------------------------------------------------------------------

export function FormTitulo() {
  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Grid container spacing={2} justifyContent="center" sx={{ flexGrow: 1 }}>
          <GridItem sm={4}>
            <RHFTextField name="codigo" label="Código" />
          </GridItem>
          <GridItem sm={4}>
            <RHFNumberField name="numero_cliente" label="Nº de cliente" noFormat />
          </GridItem>
          <GridItem children={<FormSeguros prefixo="seguros" tipo />} />
        </Grid>
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FormConta() {
  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Grid container spacing={2} justifyContent="center" sx={{ flexGrow: 1 }}>
          <GridItem sm={4}>
            <RHFTextField name="numero_conta" label="Nº de conta" />
          </GridItem>
        </Grid>
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FormLivranca() {
  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Grid container spacing={2} justifyContent="center" sx={{ flexGrow: 1 }}>
          <GridItem sm={4}>
            <RHFTextField name="numero_livranca" label="Nº da livrança" />
          </GridItem>
          <GridItem children={<FormEntidades label="Avalista" name="garantidores" />} />
        </Grid>
      </Stack>
    </Stack>
  );
}
