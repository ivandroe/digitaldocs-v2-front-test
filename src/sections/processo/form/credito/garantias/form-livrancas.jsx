// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// components
import FormEntidades from './form-entidades';
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { RHFTextField } from '@/components/hook-form';
import { AddItem, DefaultAction } from '@/components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormLivrancas() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'livrancas' });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Livrança(s)</Typography>
        <AddItem onClick={() => append({ numero_livranca: '' })} dados={{ label: 'Livrança', small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={2}>
        <Livrancas fields={fields} remove={remove} prefixo="livrancas" />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Livrancas({ fields = [], remove, prefixo }) {
  return fields.length ? (
    fields.map((item, index) => (
      <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <GridItem sm={6} md={3}>
              <RHFTextField label="Nº da livrança" name={`${prefixo}[${index}].numero_livranca`} />
            </GridItem>
            <FormEntidades livranca label="Avalista" name={`livrancas[${index}].avalistas`} />
          </Grid>
          <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
        </Stack>
      </Card>
    ))
  ) : (
    <GridItem children={<SemDados message="Nenhuma livrança adicionada..." sx={{ p: 1.5 }} />} />
  );
}
