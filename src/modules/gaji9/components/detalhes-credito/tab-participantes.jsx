// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// utils
import { getInitials } from '@/utils/formatText';
//
import { SearchNotFound } from '@/components/table';
import { DefaultAction } from '@/components/Actions';
import { CardBox, InlineRow, StatusBadge, Atualizado } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

function avatarStyle(p) {
  if (p.mutuario) return 'success';
  if (p.fiador) return 'warning';
  if (p.avalista) return 'warning';
  return 'info';
}

function getRoles(p) {
  const roles = [];
  if (p.mutuario) roles.push({ label: 'Mutuário', variant: 'active' });
  if (p.fiador) roles.push({ label: 'Fiador', variant: 'warn' });
  if (p.avalista) roles.push({ label: 'Avalista', variant: 'warn' });
  if (p.representante) roles.push({ label: 'Representante', variant: 'info' });
  if (p.dono_garantia) roles.push({ label: 'Dono garantia', variant: 'info' });
  return roles;
}

// ---------------------------------------------------------------------------------------------------------------------

export function TabParticipantes({ participantes, openForm, versao, canChange }) {
  const sorted = [...participantes].sort((a, b) => a.numero_ordem - b.numero_ordem);

  return (
    <Stack spacing={2}>
      {!participantes?.length ? (
        <SearchNotFound card height={150} message="Sem participantes registados..." />
      ) : (
        sorted.map((p) => (
          <ParticipanteCard key={p.participante_id} p={p} versao={versao} canChange={canChange} openForm={openForm} />
        ))
      )}
      {canChange && (
        <Stack direction="row" justifyContent="center">
          <DefaultAction button label="Adicionar" onClick={() => openForm('form-interveniente')} />
        </Stack>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function ParticipanteCard({ p, canChange, versao, openForm }) {
  const roles = getRoles(p);
  const color = `${avatarStyle(p)}.main`;
  const bg = (theme) => alpha(theme.palette[avatarStyle(p)].main, 0.1);

  return (
    <CardBox solid>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 40, height: 40, background: bg, color, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            {getInitials(p.nome)}
          </Avatar>
          <Box>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              <Typography variant="subtitle2">{p.nome}</Typography>
              {roles.map((r) => (
                <StatusBadge key={r.label} label={r.label} variant={r.variant} />
              ))}
              <StatusBadge label={p.ativo ? 'Ativo' : 'Inativo'} variant={p.ativo ? 'active' : 'inactive'} />
            </Stack>
            <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1.5} sx={{ mt: 0.5, rowGap: 0 }}>
              <InlineRow label="Nº entidade" value={p.numero_entidade} />
              <InlineRow label="Entidade representada" value={p.entidade_representada_nome} />
              <InlineRow
                label="Beneficiário"
                value={
                  p.beneficiario !== null ? `${p.beneficiario.nome} (Ent. ${p.beneficiario.numero_entidade})` : null
                }
              />
              <InlineRow label="Relação beneficiário" value={p.relacao_beneficiario} />
            </Stack>
          </Box>
        </Stack>
        {((canChange && !p.mutuario && versao !== 2) || (versao === 2 && p.representante)) && (
          <DefaultAction small label="ELIMINAR" onClick={() => openForm('eliminar-interv', p)} />
        )}
      </Stack>

      {p.modficiado_por || p.modificado_em ? <Atualizado em={p.modificado_em} por={p.modficiado_por} /> : null}
    </CardBox>
  );
}
