// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
// utils
import { useResumoCredito } from './useResumoCredito';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import Label from '@/components/Label';
import GridItem from '@/components/GridItem';
import { noDados } from '@/components/Panel';
import CardsGrid from '@/modules/gaji9/components/detalhes-credito/cards-grid';

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoCredito({ credito, mutuarios }) {
  const theme = useTheme();
  const resumo = useResumoCredito(credito, mutuarios);

  if (!credito) return null;
  const { identificacao, divida, kpis, cards, garantias } = resumo;

  return (
    <Card sx={{ boxShadow: theme.customShadows.cardAlt, borderRadius: 1, overflow: 'hidden' }}>
      <CardHeader
        title="Resumo do crédito"
        titleTypographyProps={{ variant: 'subtitle2', sx: { color: 'primary.main', textTransform: 'uppercase' } }}
        sx={{ py: 1.25, px: 2, bgcolor: 'background.neutral' }}
      />
      <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
        <Box gap={1.5} display="grid" sx={{ mb: 2 }} gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }}>
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

        {divida && (
          <Box
            sx={{
              mb: 2,
              p: 1,
              gap: 1,
              display: 'flex',
              flexWrap: 'wrap',
              borderRadius: 0.5,
              alignItems: 'center',
              bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
            }}
          >
            <Label color="warning">Mutuário com crédito em dívida</Label>
            <Typography variant="subtitle2" sx={{ color: 'warning.dark' }}>
              {divida.valor}
            </Typography>
            {divida.data && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ({divida.data})
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {kpis.map((item) => (
            <GridItem xs={6} md={3} key={item.label}>
              <Card
                sx={{
                  p: 1,
                  height: '100%',
                  textAlign: 'center',
                  boxShadow: theme.customShadows.cardAlt,
                  bgcolor: alpha(theme.palette[item.color].main, 0.04),
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                  {item.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: `${item.color}.main` }}>
                  {item.value || '---'}
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

        {/* taxas + regime + garantias: todos via CardsGrid. Garantias entra como card
            com item 'custom' (widget próprio), mantendo o visual alinhado aos demais. */}
        <CardsGrid
          cards={[
            ...cards,
            {
              id: 'garantias',
              titulo: 'Garantias & Cobertura',
              dados: [{ custom: <GarantiasResumo garantias={garantias} /> }],
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function LinhaResumo({ title, value, color, bold }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
        {title}:
      </Typography>
      <Typography variant="body2" noWrap sx={{ fontWeight: bold ? 700 : 400, color: color || 'text.primary' }}>
        {value || noDados('(N/D)')}
      </Typography>
    </Box>
  );
}

function GarantiasResumo({ garantias }) {
  const { lista, total, racio, racioColor, racioLabel } = garantias;

  if (lista.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Sem garantias registadas
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Cobertura do montante
          </Typography>
          <Typography variant="h6" sx={{ color: `${racioColor}.main`, lineHeight: 1.1 }}>
            {racio !== null ? fPercent(racio) : '---'}
          </Typography>
        </Stack>
        <Tooltip arrow title="Valor das garantias ativas face ao montante do crédito">
          <Box>
            <Label color={racioColor}>{racioLabel}</Label>
          </Box>
        </Tooltip>
      </Stack>

      <LinhaResumo title="Total garantido" value={fCurrency(total)} bold />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack spacing={0.5}>
        {lista.map((g) => (
          <Box key={g.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Label color={g.reais ? 'default' : 'info'} sx={{ height: 18, fontSize: 10 }}>
                {g.reais ? 'Real' : 'Pessoal'}
              </Label>
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                {g.nome}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 'medium' }} noWrap>
              {fCurrency(g.valor)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
