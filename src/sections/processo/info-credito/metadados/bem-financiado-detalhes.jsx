// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fCurrency } from '@/utils/formatNumber';
// components
import { noDados } from '@/components/Panel';
import { DialogTitleAlt } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

const TIPOS_IMOVEL = ['apartamento', 'predio', 'terreno'];

const TIPO_LABEL = {
  apartamento: 'Apartamento',
  predio: 'Prédio',
  terreno: 'Terreno',
  veiculo: 'Veículo',
  equipamento: 'Equipamento',
  outro: 'Outro',
};

export default function BemFinanciadoDetalhes({ bem, onClose }) {
  if (!bem) return null;

  const tipo = bem?.tipo;
  const isImovel = TIPOS_IMOVEL.includes(tipo);
  const isVeiculo = tipo === 'veiculo';
  const isOutro = tipo === 'equipamento' || tipo === 'outro';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt title={`Bem financiado — ${TIPO_LABEL[tipo] || '—'}`} onClose={onClose} />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="row" spacing={4}>
              <Kpi label="Valor" value={bem?.valor ? fCurrency(bem.valor) : null} color="primary.main" />
              <Kpi label="Valor avaliação" value={bem?.valor_avaliacao ? fCurrency(bem.valor_avaliacao) : null} />
            </Stack>
          </Grid>

          {isImovel && (
            <>
              <Grid item xs={12} md={6}>
                <Section title="Informações Técnicas" items={infoImovel(bem)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Section title="Localização" items={localizacaoImovel(bem)} />
              </Grid>
            </>
          )}

          {isVeiculo && (
            <Grid item xs={12}>
              <Section title="Informações Técnicas" items={infoVeiculo(bem)} />
            </Grid>
          )}

          {isOutro && (
            <Grid item xs={12}>
              <Section title="Descrição" items={[['Descritivo', bem?.descritivo]]} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function infoImovel(bem) {
  return [
    ['NIP', bem?.nip],
    ['Tipo de matriz', bem?.tipo_matriz],
    ['Nº de matriz', bem?.numero_matriz],
    ['Nº descrição predial', bem?.numero_descricao_predial],
    ['Nº inscrição hipoteca', bem?.numero_inscricao_hipoteca],
    ['Identificação fração', bem?.identificacao_fracao],
    ['Nº de andar', bem?.numero_andar],
    ['Área', bem?.area],
    ['Conservatória', bem?.localizacao_conservatoria],
  ];
}

function localizacaoImovel(bem) {
  return [
    ['Ilha', bem?.ilha],
    ['Concelho', bem?.concelho],
    ['Freguesia', bem?.freguesia],
    ['Zona', bem?.zona],
    ['Rua', bem?.rua],
    ['Nº de porta', bem?.numero_porta],
  ];
}

function infoVeiculo(bem) {
  return [
    ['Marca', bem?.marca],
    ['Modelo', bem?.modelo],
    ['Matrícula', bem?.matricula],
    ['NURA', bem?.nura],
    ['Ano de fabrico', bem?.ano_fabrico],
  ];
}

// ---------------------------------------------------------------------------------------------------------------------

function Section({ title, items }) {
  const filtered = items.filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!filtered.length) return null;
  return (
    <>
      <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1.5 }} />
      <Box display="grid" gap={1}>
        {filtered.map(([label, value]) => (
          <Item key={label} title={label} value={value} />
        ))}
      </Box>
    </>
  );
}

function Item({ title, value }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {title}:
      </Typography>
      {hasValue ? <Typography variant="body2">{value}</Typography> : noDados('(N/D)')}
    </Stack>
  );
}

function Kpi({ label, value, color = 'text.primary' }) {
  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ color }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}
