// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { fNumber } from '@/utils/formatNumber';
//
import GridItem from '@/components/GridItem';
import { StatusBadge, SchemaBadge } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

export default function HeroCreditoDetail({ credito = {} }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack
        gap={1.5}
        sx={{ mb: 2 }}
        justifyContent="space-between"
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
      >
        <Box>
          <Typography variant="h6">{credito?.cliente}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {credito.componente} &nbsp;·&nbsp; {credito.segmento} &nbsp;·&nbsp; {credito.tipo_titular}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: '6px !important', pt: { sm: 0.5 } }}>
          <SchemaBadge version={credito.versao_schema} />
          <StatusBadge label={credito.ativo ? 'Ativo' : 'Inativo'} variant={credito.ativo ? 'active' : 'inactive'} />
          <StatusBadge
            variant={credito.contratado ? 'active' : 'warn'}
            label={credito.contratado ? 'Contratado' : 'Não contratado'}
          />
        </Stack>
      </Stack>
      <Grid container spacing={1}>
        <KpiCell label="Montante" value={credito.montante} sub={credito.moeda} colorStyle="success.main" />
        <KpiCell label="Custo total" value={credito.custo_total} sub={credito.moeda} />
        <KpiCell label="Prestação / mês" value={credito.valor_prestacao} sub={credito.moeda} />
        <KpiCell label="Prazo" value={credito.prazo_contratual} sub="meses" />
        <KpiCell label="TAEG" value={credito.taxa_taeg} colorStyle="warning.main" sub="%" />
        <KpiCell label="Taxa negociada" value={credito.taxa_juro_negociado} sub="%" colorStyle="success.main" />
      </Grid>
    </Card>
  );
}

// ─── KpiCell ---------------------------------------------------------------------------------------------------------

function KpiCell({ label, value, sub, colorStyle }) {
  return (
    <GridItem sm={6} md={4} xl={2}>
      <Box sx={{ height: 1, flex: 1, px: 2, py: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: colorStyle ?? 'text.secondary' }}>
          {fNumber(value, label === 'Prazo' ? 0 : 2)}
          {sub === '%' ? '' : ' '}
          {sub}
        </Typography>
      </Box>
    </GridItem>
  );
}
