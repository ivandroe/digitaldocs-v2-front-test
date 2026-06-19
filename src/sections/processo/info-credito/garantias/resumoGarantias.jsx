import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { fCurrency, fPercent } from '@/utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

function racioLabelColor(pct) {
  if (pct === null) return { labelRacio: 'Sem referência', coberturaColor: 'default' };
  if (pct >= 100) return { labelRacio: 'Totalmente coberto', coberturaColor: 'success' };
  if (pct >= 75) return { labelRacio: 'Cobertura elevada', coberturaColor: 'info' };
  if (pct >= 50) return { labelRacio: 'Cobertura parcial', coberturaColor: 'warning' };
  return { labelRacio: 'Cobertura baixa', coberturaColor: 'error' };
}

// ---------------------------------------------------------------------------------------------------------------------

export function useCoberturaGarantias(garantias, montanteSolicitado) {
  return useMemo(() => {
    const fallback = {
      coberturaRatio: 0,
      garantiasTotal: 0,
      coberturaColor: 'info',
      garantiasReais: { total: 0, pct: 0 },
      garantiasPessoais: { total: 0, pct: 0 },
    };

    if (!garantias?.length || !montanteSolicitado) return fallback;

    const ativas = garantias.filter(({ ativo }) => ativo !== false);
    if (!ativas.length) return fallback;

    const garantiasTotal = ativas.reduce((acc, g) => acc + Math.abs(parseFloat(g.valor_garantia) || 0), 0);
    const totalReais = ativas
      .filter((g) => g.reais)
      .reduce((acc, g) => acc + Math.abs(parseFloat(g.valor_garantia) || 0), 0);
    const totalPessoais = garantiasTotal - totalReais;

    const pctReais = garantiasTotal > 0 ? Math.round((totalReais / garantiasTotal) * 100) : 0;
    const coberturaRatio = Math.round((garantiasTotal / parseFloat(montanteSolicitado)) * 100);

    return {
      coberturaRatio,
      garantiasTotal,
      ...racioLabelColor(coberturaRatio),
      garantiasReais: { total: totalReais, pct: pctReais },
      garantiasPessoais: { total: totalPessoais, pct: 100 - pctReais },
    };
  }, [garantias, montanteSolicitado]);
}

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiasResumo({ dados, parecer = false }) {
  const theme = useTheme();
  const { coberturaRatio, coberturaColor, labelRacio, garantiasTotal, garantiasReais, garantiasPessoais } =
    useCoberturaGarantias(
      dados?.garantias,
      dados?.montante_contratado || dados?.montante_aprovado || dados?.montante_solicitado || 0
    );
  const fase = (dados?.montante_contratado && 'Contratado') || (dados?.montante_aprovado && 'Aprovado') || 'Solicitado';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ color: `${coberturaColor}.main`, lineHeight: 1 }}>
          {fPercent(coberturaRatio)}
        </Typography>
        <Chip size="small" color={coberturaColor} label={labelRacio} sx={{ typography: 'overline' }} />
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {parecer ? 'Garantido' : 'Valor Garantido'}: {fCurrency(garantiasTotal)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {parecer ? fase : `Valor ${fase}`}: {fCurrency(dados?.montante_solicitado)}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          color={coberturaColor}
          value={Math.min(coberturaRatio, 100)}
          sx={{ mb: 1.5, height: 6, bgcolor: alpha(theme.palette[coberturaColor].main, 0.1) }}
        />

        <Stack direction="row" spacing={1}>
          {[
            { label: 'Reais', color: 'success', ...garantiasReais },
            { label: 'Pessoais', color: 'info', ...garantiasPessoais },
          ].map(({ label, color, total, pct }) => (
            <Box
              key={label}
              sx={{
                flex: 1,
                px: 1.25,
                py: 0.875,
                borderRadius: 1,
                bgcolor: alpha(theme.palette[color].main, 0.07),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: `${color}.main`, flexShrink: 0 }} />
                <Typography variant="overline" sx={{ color: 'text.secondary' }} noWrap>
                  {label}&nbsp;
                  <Typography variant="caption" component="span" sx={{ textTransform: 'lowercase' }}>
                    ({pct}% do total)
                  </Typography>
                </Typography>
              </Stack>
              <Typography variant="subtitle2" sx={{ pl: 1.32 }} noWrap>
                {fCurrency(total)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export function GarantiasList({ dados, parecer = false }) {
  return (
    <Stack spacing={0.75} divider={<Divider sx={{ borderStyle: 'dotted' }} />}>
      {dados.map((g, i) => (
        <Stack key={g.id ?? i} direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 6,
              height: 6,
              flexShrink: 0,
              borderRadius: '50%',
              bgcolor: g.reais ? 'success.main' : 'info.main',
            }}
          />
          <Typography variant={parecer ? 'caption' : 'body2'} sx={{ flex: 1, color: 'text.secondary' }}>
            {g.tipo_garantia} {g.subtipo_garantia ? ` - ${g.subtipo_garantia}` : ''}
          </Typography>
          <Typography variant={parecer ? 'caption' : 'body2'}>
            {fCurrency(Math.abs(Number(g?.valor_garantia || 0)))}
          </Typography>
          {g.percentagem_cobertura && (
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
              {fPercent(g.percentagem_cobertura)}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
