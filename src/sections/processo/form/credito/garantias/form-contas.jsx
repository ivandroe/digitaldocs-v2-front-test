// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// components
import { RHFTextField } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormContas() {
  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Typography variant="overline">Conta DP</Typography>
      <Divider sx={{ my: 1 }} />
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <RHFTextField label="Nº de conta" name="conta.numero_conta" />
      </Card>
    </Stack>
  );
}
