import React from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { ptDateTime } from '@/utils/formatTime';
// components
import Label from '@/components/Label';

// ---------------------------------------------------------------------------------------------------------------------

const SectionTitle = ({ children }) => (
  <Typography
    variant="overline"
    sx={{ color: 'text.disabled', lineHeight: 1, fontSize: 11, letterSpacing: '0.08em', display: 'block' }}
  >
    {children}
  </Typography>
);

// ---------------------------------------------------------------------------------------------------------------------

const DeadlineRow = React.memo(({ label = 'resolução', deadline, breached }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Prazo de {label}
    </Typography>
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Typography variant="body2">{ptDateTime(deadline)}</Typography>
      <Label color={breached ? 'error' : 'success'} variant="ghost">
        {breached ? 'Fora do prazo' : 'Dentro do prazo'}
      </Label>
    </Stack>
  </Stack>
));

// ---------------------------------------------------------------------------------------------------------------------

const SLAItem = React.memo(({ departmentName, slaReport }) => (
  <Stack spacing={1}>
    <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
      {departmentName}
    </Typography>
    <DeadlineRow
      label="resolução"
      deadline={slaReport?.sla_resolution_deadline}
      breached={slaReport?.sla_resolution_breached}
    />
  </Stack>
));

// ---------------------------------------------------------------------------------------------------------------------

export const SLA = React.memo(({ sla, encaminhamentos = [] }) => {
  const hasEncaminhamentos = encaminhamentos.length > 0;

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1 }}>
        <Stack spacing={2}>
          <SectionTitle>SLA global</SectionTitle>

          <Stack direction="row" spacing={0.75} alignItems="baseline">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              SLA:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {sla?.sla_name || 'N/A'}
            </Typography>
          </Stack>

          <DeadlineRow label="resposta" deadline={sla?.sla_response_deadline} breached={sla?.sla_response_breached} />
          <DeadlineRow
            label="resolução"
            deadline={sla?.sla_resolution_deadline}
            breached={sla?.sla_resolution_breached}
          />
        </Stack>
      </Paper>

      {hasEncaminhamentos && (
        <Paper elevation={0} sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1 }}>
          <Stack spacing={2}>
            <SectionTitle>SLA departamental</SectionTitle>
            <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dotted' }} />}>
              {encaminhamentos.map((row, index) => (
                <SLAItem key={row?.id || index} slaReport={row?.sla_report} departmentName={row?.to_department_name} />
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
});
