// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
// utils
import { useResumoCredito } from './useResumoCredito';
// components
import GridItem from '@/components/GridItem';
import { noDados, SemDados } from '@/components/Panel';
//
import { DividaAtiva } from '../visao-geral';
import { GarantiasResumo, GarantiasList } from '../garantias/resumoGarantias';
import CardsGrid from '@/modules/gaji9/components/detalhes-credito/cards-grid';

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoCredito({ credito, mutuarios }) {
  const theme = useTheme();
  const { identificacao, kpis, cards } = useResumoCredito(credito, mutuarios);

  if (!credito) return null;

  return (
    <Card sx={{ boxShadow: theme.customShadows.cardAlt, borderRadius: 1, overflow: 'hidden' }}>
      <CardHeader
        title="Resumo do crédito"
        titleTypographyProps={{ variant: 'subtitle2', sx: { color: 'primary.main', textTransform: 'uppercase' } }}
        sx={{ py: 1.25, px: 2, bgcolor: 'background.neutral' }}
      />
      <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
        <Box gap={1.5} display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} sx={{ mb: 2 }}>
          {identificacao.map((item) => (
            <Stack key={item.title} spacing={0.25}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: item.bold ? 700 : 400 }}>
                {item.value || noDados('(N/D)')}
              </Typography>
            </Stack>
          ))}
        </Box>

        <DividaAtiva valor={credito?.valor_divida} periodo={credito?.periodo} />

        <Divider sx={{ mb: 2, mt: credito?.valor_divida ? 2 : 0 }} />

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {kpis.map((item) => (
            <GridItem xs={6} md={3} key={item.label}>
              <Card
                sx={{
                  p: 1.5,
                  height: 1,
                  display: 'flex',
                  textAlign: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: theme.customShadows.cardAlt,
                  bgcolor: alpha(theme.palette[item.color].main, 0.04),
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                  {item.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: `${item.color}.main` }}>
                  {item.value || noDados('(Não definido...)')}
                </Typography>
                {item.hint && (
                  <Typography variant="caption" sx={{ color: item.hint.color, display: 'block' }} noWrap>
                    {item.hint.text}
                  </Typography>
                )}
              </Card>
            </GridItem>
          ))}
        </Grid>

        <CardsGrid
          cards={[
            ...cards,
            {
              id: 'garantias',
              titulo: 'Garantias & Cobertura',
              dados: [{ custom: <GarantiasResumo1 dados={credito} /> }],
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function GarantiasResumo1({ dados }) {
  const garantiasAtivas = (dados?.garantias ?? []).filter(({ ativo }) => ativo);

  if (garantiasAtivas.length === 0) {
    return <SemDados message="Sem garantias registadas..." />;
  }

  return (
    <Stack spacing={1}>
      <GarantiasResumo parecer dados={dados} />
      <Divider sx={{ borderStyle: 'dashed' }} />
      <GarantiasList parecer dados={garantiasAtivas} />
    </Stack>
  );
}
