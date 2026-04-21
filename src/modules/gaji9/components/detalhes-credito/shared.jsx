// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { ptDateTime } from '@/utils/formatTime';
//
import { noDados, Criado } from '@/components/Panel';

// ─── FieldRow --------------------------------------------------------------------------------------------------------

export function FieldRow({ label, value, tooltip, sxValue = null }) {
  const isEmpty = value == null || value === '' || value === '—';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} placement="top" arrow>
            <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
          </Tooltip>
        )}
      </Box>

      {isEmpty ? (
        noDados('(Não definido)')
      ) : (
        <Typography variant="body2" sx={{ textAlign: 'right', wordBreak: 'break-all', ...sxValue }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

// ─── InlineRow --------------------------------------------------------------------------------------------------------

export function InlineRow({ label, value, sxValue = null }) {
  return value ? (
    <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'baseline', gap: 0.5 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', wordBreak: 'break-all', ...sxValue }}>
        {value}
      </Typography>
    </Box>
  ) : null;
}

// ─── CardBox ---------------------------------------------------------------------------------------------------------

export function CardBox({ title = '', solid = false, children, sx }) {
  return (
    <Card sx={{ p: 2, height: 1, ...sx }}>
      {title && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="overline">{title}</Typography>
          <Divider sx={{ pt: 0.5 }} />
        </Box>
      )}
      <Stack spacing={1} divider={<Divider sx={{ borderStyle: solid ? 'solid' : 'dotted', pt: solid ? 1 : 0 }} />}>
        {children}
      </Stack>
    </Card>
  );
}

// ─── InnerCard -------------------------------------------------------------------------------------------------------

export function InnerCard({ children, sx }) {
  return <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 1.5, ...sx }}>{children}</Box>;
}

// ─── SchemaBadge -----------------------------------------------------------------------------------------------------

export function SchemaBadge({ version }) {
  return (
    <Chip
      size="small"
      label={version === 2 ? 'Versão: 2' : 'Versão: 1'}
      sx={{ height: 20, typography: 'caption', fontWeight: 600, color: 'text.secondary' }}
    />
  );
}

// ─── StatusBadge -----------------------------------------------------------------------------------------------------

const BADGE_STYLES = { active: 'success', inactive: 'error', warn: 'warning', info: 'info', default: 'focus' };

export function StatusBadge({ label, variant = '' }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.default;
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 20,
        typography: 'caption',
        fontWeight: 600,
        color: variant ? `${s}.main` : 'text.secondary',
        background: variant ? (theme) => alpha(theme.palette[s].main, 0.1) : '',
      }}
    />
  );
}

// ─── Atualizado ------------------------------------------------------------------------------------------------------

export function Atualizado({ em = '', por = '', divider = false }) {
  return (
    <>
      {divider ? <Divider sx={{ my: 1.5 }} /> : null}
      <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1.5} justifyContent="center">
        <Criado caption tipo="user" value={por} sx={{ color: 'text.secondary' }} />
        <Criado caption tipo="data" value={ptDateTime(em)} sx={{ color: 'text.secondary' }} />
      </Stack>
    </>
  );
}
