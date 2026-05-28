import { useMemo } from 'react';
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
import { ptDate } from '@/utils/formatTime';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import Label, { LabelSN } from '@/components/Label';
import GridItem from '@/components/GridItem';
import { noDados } from '@/components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoCredito({ credito, mutuarios }) {
  const theme = useTheme();
  const resumo = useResumoCredito(credito, mutuarios);

  if (!credito) return null;
  const { identificacao, divida, kpis, taxas, regime, capitalMaxIsento, garantias } = resumo;

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

        <Box gap={2} display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}>
          <BlocoResumo titulo="Composição da taxa & encargos">
            <Stack spacing={0.5} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {taxas.map((item) => (
                <LinhaResumo key={item.title} {...item} />
              ))}
            </Stack>
          </BlocoResumo>

          <BlocoResumo titulo="Regime & Isenções">
            <Stack spacing={0.5} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {regime.map((item) => (
                <Box
                  key={item.title}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <LabelSN val={item.val} />
                </Box>
              ))}
              {capitalMaxIsento && <LinhaResumo title="Capital máx. isento" value={capitalMaxIsento} bold />}
            </Stack>
          </BlocoResumo>

          <BlocoResumo titulo="Garantias & Cobertura">
            <GarantiasResumo garantias={garantias} />
          </BlocoResumo>
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function BlocoResumo({ titulo, children }) {
  return (
    <Card sx={{ height: '100%', boxShadow: (theme) => theme.customShadows.cardAlt, borderRadius: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          py: 1,
          px: 1.5,
          display: 'block',
          fontWeight: 'bold',
          color: 'text.secondary',
          bgcolor: 'background.neutral',
        }}
      >
        {titulo.toUpperCase()}
      </Typography>
      <Box sx={{ p: 1.5 }}>{children}</Box>
    </Card>
  );
}

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

// ---------------------------------------------------------------------------------------------------------------------

function racioToColor(pct) {
  if (pct === null) return 'default';
  if (pct >= 100) return 'success';
  if (pct >= 75) return 'info';
  if (pct >= 50) return 'warning';
  return 'error';
}

function racioToLabel(pct) {
  if (pct === null) return 'Sem referência';
  if (pct >= 100) return 'Totalmente coberto';
  if (pct >= 75) return 'Cobertura elevada';
  if (pct >= 50) return 'Cobertura parcial';
  return 'Cobertura baixa';
}

function useResumoCredito(credito, mutuarios) {
  return useMemo(() => {
    const meta = credito?.gaji9_metadados || {};

    const identificacao = [
      { title: 'Mutuário(s)', value: mutuarios, bold: true },
      { title: 'Linha de crédito', value: credito?.linha, bold: true },
      { title: 'Finalidade', value: credito?.finalidade },
      { title: 'Componente', value: credito?.componente, bold: true },
    ];
    // dívida do mutuário/entidade (quando exista) — sinal relevante para a decisão
    const divida = credito?.valor_divida
      ? { valor: fCurrency(credito?.valor_divida), data: credito?.periodo ? ptDate(credito?.periodo) : '' }
      : null;

    // montante usado apenas para o rácio de cobertura (não é exibido — pertence às condições de aprovação)
    const montante = Number(
      credito?.montante_aprovado || credito?.montante_contratado || credito?.montante_solicitado || 0
    );

    // valor da garantia vem expresso em negativo — normalizar para positivo
    const valorGarantia = (g) => Math.abs(Number(g?.valor_garantia || g?.valor || 0));
    const ativas = (Array.isArray(credito?.garantias) ? credito.garantias : []).filter((g) => g?.ativo);
    const total = ativas.reduce((acc, g) => acc + valorGarantia(g), 0);
    const racio = montante > 0 ? (total / montante) * 100 : null;

    // diferença entre prestação efetiva e prestação sem desconto — sinaliza se há (ou não) desconto aplicado
    const prestacao = Number(meta?.valor_prestacao);
    const prestacaoSemDesconto = Number(meta?.valor_prestacao_sem_desconto);
    const hintSemDesconto =
      prestacaoSemDesconto > 0 && prestacao > 0
        ? prestacaoSemDesconto !== prestacao
          ? { text: `−${fCurrency(Math.abs(prestacaoSemDesconto - prestacao))} c/ desconto`, color: 'success.dark' }
          : { text: '= prestação', color: 'text.secondary' }
        : null;

    const kpis = [
      { label: 'TAEG', color: 'info', value: fPercent(meta?.taxa_taeg, 3) },
      { label: 'Custo total', color: 'warning', value: fCurrency(meta?.custo_total) },
      { label: 'Prestação', color: 'primary', value: fCurrency(meta?.valor_prestacao) },
      {
        label: 'Prestação s/ desconto',
        color: 'secondary',
        value: fCurrency(meta?.valor_prestacao_sem_desconto),
        hint: hintSemDesconto,
      },
    ];

    const taxas = [
      { title: 'Modo da taxa', value: meta?.modo_taxa_equivalente ? 'Equivalente' : 'Proporcional' },
      { title: 'Juro precário', value: fPercent(meta?.taxa_juro_precario) },
      // spread mostrado sempre (pode ser zero ou negativo)
      { title: 'Spread', value: fPercent(meta?.taxa_juro_desconto), bold: true },
      { title: 'Comissão de abertura', value: fPercent(meta?.taxa_comissao_abertura) },
      { title: 'Comissão de imobilização', value: fPercent(meta?.taxa_comissao_imobilizacao) },
      { title: 'Comissão de avaliação', value: fCurrency(meta?.comissao_avaliacao?.valor) },
      { title: 'Comissão de vistoria', value: fCurrency(meta?.comissao_vistoria?.valor) },
      { title: 'Imposto selo', value: fPercent(meta?.taxa_imposto_selo) },
      { title: 'Imp. selo utilização', value: fPercent(meta?.taxa_imposto_selo_utilizacao) },
    ];

    // todos os regimes/isenções são listados (mesmo quando não se aplicam) para tornar explícito o que não aplica
    const regime = [
      { title: 'Bonificado', val: !!meta?.bonificado },
      { title: 'Jovem bonificado', val: !!meta?.jovem_bonificado },
      { title: 'Revolving', val: !!meta?.revolving },
      { title: 'Empresa parceira', val: !!meta?.colaborador_empresa_parceira },
      { title: '1ª habitação própria', val: !!meta?.habitacao_propria_1 },
      { title: 'Isento comissão', val: !!meta?.isento_comissao },
      { title: 'Isento imposto selo', val: !!meta?.tem_isencao_imposto_selo },
    ];
    const capitalMaxIsento =
      meta?.tem_isencao_imposto_selo && Number(meta?.capital_max_isento_imposto_selo) > 0
        ? fCurrency(meta?.capital_max_isento_imposto_selo)
        : '';

    const lista = ativas.map((g) => ({
      id: g?.id,
      reais: g?.reais,
      valor: valorGarantia(g),
      nome: [g?.tipo_garantia, g?.subtipo_garantia].filter(Boolean).join(' - ') || 'Garantia',
    }));

    return {
      kpis,
      taxas,
      regime,
      divida,
      identificacao,
      capitalMaxIsento,
      garantias: { lista, total, racio, racioColor: racioToColor(racio), racioLabel: racioToLabel(racio) },
    };
  }, [credito, mutuarios]);
}
