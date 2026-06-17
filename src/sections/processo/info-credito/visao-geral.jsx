import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
// @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
// icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { noEstado } from '@/utils/validarAcesso';
import { ptDate, fToNow } from '@/utils/formatTime';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import Label from '@/components/Label';
import { noDados } from '@/components/Panel';
import GridItem from '@/components/GridItem';
import { DefaultAction } from '@/components/Actions';
// sections
import Fincc from './fin/fincc';
import EnviarContratacao from './enviar-contratacao';
import ModeloCartaProposta from './carta-proposta/modelos-cartas-proposta';
import { FormSituacao, EliminarDadosSituacao, FormNivelDecisao } from '../form/credito/situacao-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function VisaoGeral({ dados, modificar = false }) {
  const theme = useTheme();
  const [open, setOpen] = useState('');

  const arquivado = dados?.estado?.estado === 'Arquivo';
  const gerencia = noEstado(dados?.estado?.estado, ['Gerência']);
  const situacao = (dados?.situacao_final_mes || 'em análise').toLowerCase();

  const { coberturaRatio, coberturaColor, garantiasTotal, garantiasReais, garantiasPessoais } = useCoberturaGarantias(
    dados?.garantias,
    dados?.montante_solicitado
  );

  const garantiasAtivas = (dados?.garantias ?? []).filter(({ ativo }) => ativo);

  const datesVisiveis = useMemo(
    () =>
      [
        { title: 'Entrada', value: dados?.data_entrada, color: 'info' },
        { title: 'Aprovado', value: dados?.data_aprovacao, color: 'success' },
        { title: 'Contratado', value: dados?.data_contratacao, color: 'success' },
        { title: 'Indeferido', value: dados?.data_indeferido, color: 'error' },
        { title: 'Desistido', value: dados?.data_desistido, color: 'warning' },
      ].filter(({ value }) => !!value),
    [dados]
  );

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={1.5}>
        {!!dados?.valor_divida && (
          <Alert severity="warning" sx={{ justifyContent: 'flex-start' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ width: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Entidade com crédito em dívida</Typography>
                {dados?.periodo && (
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Referência {ptDate(dados.periodo)}
                  </Typography>
                )}
              </Box>
              <Typography variant="subtitle2" sx={{ flexShrink: 0 }}>
                {fCurrency(dados.valor_divida)}
              </Typography>
            </Stack>
          </Alert>
        )}

        {/* ── Grid principal: Identificação + Timeline ── */}
        <Grid container spacing={1.5}>
          {/* Identificação */}
          <GridItem md={6}>
            <SectionCard title="Identificação" sx={{ height: '100%' }}>
              <Stack spacing={0.75} divider={<Divider sx={{ borderStyle: 'dotted' }} />}>
                {[
                  { key: 'Nº proposta', val: dados?.numero_proposta },
                  { key: 'Linha de crédito', val: dados?.linha },
                  { key: 'Componente', val: dados?.componente },
                  { key: 'Segmento', val: dados?.segmento },
                  { key: 'Tipo de titular', val: dados?.tipo_titular },
                  { key: 'Finalidade', val: dados?.finalidade },
                  { key: 'Setor / Ent. patronal', val: dados?.setor_atividade },
                ].map(({ key, val }) => (
                  <Stack key={key} direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                      {key}
                    </Typography>
                    <Typography variant="body2">{val || noDados('(Não definido)')}</Typography>
                  </Stack>
                ))}
              </Stack>
            </SectionCard>
          </GridItem>

          {/* Timeline progressão */}
          <GridItem md={6}>
            <SectionCard title="Progressão" sx={{ height: '100%' }}>
              {datesVisiveis.length > 0 ? (
                <Timeline sx={{ py: 0, px: 1, m: 0 }}>
                  {datesVisiveis.map(({ title, value, color }, index) => (
                    <TimelineItem
                      key={title}
                      sx={{ minHeight: index === datesVisiveis.length - 1 ? 20 : 30, '&:before': { display: 'none' } }}
                    >
                      <TimelineOppositeContent sx={{ pl: 0, py: 0, flex: 0, minWidth: 80 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {title}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator sx={{ mt: 0.25 }}>
                        <TimelineDot variant="outlined" color={color} sx={{ m: 0.25 }} />
                        {index < datesVisiveis.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pr: 0, py: 0, width: 1 }}>
                        <Typography variant="body2">
                          {ptDate(value)}{' '}
                          {!arquivado && (
                            <Typography variant="caption" component="span" sx={{ color: 'text.disabled' }}>
                              ({fToNow(value)})
                            </Typography>
                          )}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  Sem datas registadas
                </Typography>
              )}
              {dados?.enviado_para_contratacao && (
                <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                  <Label color="success" startIcon={<InfoOutlinedIcon />}>
                    Enviado para GAJ-i9
                  </Label>
                </Stack>
              )}
              {modificar && (
                <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                  <DefaultAction small button icon="editar" label="Situação" onClick={() => setOpen('atualizar')} />
                  {gerencia && situacao === 'em análise' && (
                    <DefaultAction small button icon="editar" label="Escalão" onClick={() => setOpen('escalao')} />
                  )}
                  {gerencia && situacao === 'aprovado' && <EnviarContratacao dados={dados} />}
                </Stack>
              )}
              {situacao === 'em análise' && <Fincc />}
              {situacao === 'aprovado' && <ModeloCartaProposta />}
            </SectionCard>
          </GridItem>

          {/* Cobertura de garantias: full width */}
          {garantiasAtivas.length > 0 && (
            <GridItem>
              <SectionCard title="Cobertura de garantias">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                  {/* Ratio */}
                  <Box sx={{ flexShrink: 0 }}>
                    <Typography variant="h4" sx={{ color: `${coberturaColor}.main`, lineHeight: 1 }}>
                      {coberturaRatio}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      cobertura total
                    </Typography>
                  </Box>

                  {/* Barra + valores + split */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Valor garantido: {fCurrency(garantiasTotal)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Valor solicitado: {fCurrency(dados?.montante_solicitado)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      color={coberturaColor}
                      value={Math.min(coberturaRatio, 100)}
                      sx={{ mb: 1.5, height: 6, bgcolor: alpha(theme.palette[coberturaColor].main, 0.1) }}
                    />

                    {/* Split reais / pessoais */}
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
                            <Box
                              sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: `${color}.main`, flexShrink: 0 }}
                            />
                            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                              {label}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="flex-end" flexWrap="wrap" useFlexGap>
                            <Typography variant="subtitle2">{fCurrency(total)}&nbsp;</Typography>
                            <Typography variant="caption" component="span" sx={{ color: 'text.disabled' }}>
                              ({pct}% do total)
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>

                {/* Lista garantias */}
                <Divider sx={{ mt: 2 }} />
                <Box sx={{ pt: 1.5 }}>
                  <Stack spacing={0.75} divider={<Divider sx={{ borderStyle: 'dotted' }} />}>
                    {garantiasAtivas.map((g, i) => (
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
                        <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                          {g.tipo_garantia}
                          {g.subtipo_garantia ? ` · ${g.subtipo_garantia}` : ''}
                        </Typography>
                        <Typography variant="body2">{fCurrency(g.valor_garantia)}</Typography>
                        {g.percentagem_cobertura && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.disabled', minWidth: 36, textAlign: 'right' }}
                          >
                            {fPercent(g.percentagem_cobertura)}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </SectionCard>
            </GridItem>
          )}
        </Grid>
      </Stack>

      {/* ── Dialogs ── */}
      {open === 'escalao' && <FormNivelDecisao id={dados?.processoId} onClose={() => setOpen('')} />}
      {open === 'atualizar' && <FormSituacao dados={dados} onClose={() => setOpen('')} setOpen={setOpen} />}
      {open === 'eliminar' && <EliminarDadosSituacao dados={dados} onClose={() => setOpen('')} />}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SectionCard({ title, children, sx = {} }) {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2, borderRadius: 1.5, border: `0.5px solid ${theme.palette.divider}`, ...sx }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', pb: 0.75 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function useCoberturaGarantias(garantias, montanteSolicitado) {
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

    const coberturaRatio = Math.round((garantiasTotal / parseFloat(montanteSolicitado)) * 100);
    const coberturaColor = coberturaRatio >= 100 ? 'success' : coberturaRatio >= 70 ? 'warning' : 'error';

    const pctReais = garantiasTotal > 0 ? Math.round((totalReais / garantiasTotal) * 100) : 0;

    return {
      coberturaRatio,
      coberturaColor,
      garantiasTotal,
      garantiasReais: { total: totalReais, pct: pctReais },
      garantiasPessoais: { total: totalPessoais, pct: 100 - pctReais },
    };
  }, [garantias, montanteSolicitado]);
}
