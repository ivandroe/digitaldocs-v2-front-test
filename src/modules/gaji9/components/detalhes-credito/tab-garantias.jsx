import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// utils
import { fCurrency, fPercent } from '@/utils/formatNumber';
//
import {
  DonosBlock,
  ContasBlock,
  ImovelBlock,
  TitulosBlock,
  VeiculosBlock,
  FiadoresBlock,
  LivrancasBlock,
  SegurosV2Block,
  SegurosLegacyBlock,
} from './garantia-sub-components';
import { SearchNotFound } from '@/components/table';
import { DefaultAction } from '@/components/Actions';
import { InlineRow, SchemaBadge, StatusBadge, Atualizado } from './shared';

// ─── TabGarantias ----------------------------------------------------------------------------------------------------

export function TabGarantias({ garantias, participantes, canChange, openForm }) {
  if (!garantias?.length) {
    return <SearchNotFound card height={150} message="Sem garantias registadas..." />;
  }

  return (
    <Stack spacing={3}>
      {garantias.map((g) => (
        <GarantiaCard key={g.id} garantia={g} participantes={participantes} canChange={canChange} openForm={openForm} />
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function MetadadosV2({ info_extra_v2 }) {
  if (!info_extra_v2) return null;
  const meta = info_extra_v2.metadados || {};

  return (
    <Stack spacing={2}>
      {meta?.fiadores?.length > 0 ? <FiadoresBlock fiadores={meta.fiadores} /> : null}
      {meta?.imoveis?.predios?.length > 0 ? <ImovelBlock predios={meta.imoveis.predios} tipo="prédio" /> : null}
      {meta?.imoveis?.apartamentos?.length > 0 ? (
        <ImovelBlock apartamentos={meta.imoveis.apartamentos} tipo="apartamento" />
      ) : null}
      {meta?.imoveis?.terrenos?.length > 0 ? <ImovelBlock terrenos={meta.imoveis.terrenos} tipo="terreno" /> : null}
      {meta?.imoveis?.veiculos?.length > 0 ? <VeiculosBlock veiculos={meta.imoveis.veiculos} /> : null}
      {meta?.livrancas?.length > 0 ? <LivrancasBlock livrancas={meta.livrancas} /> : null}
      {meta?.seguros?.length > 0 ? <SegurosV2Block seguros={meta.seguros} raiz /> : null}
      {meta?.contas?.length > 0 ? <ContasBlock contas={meta.contas} /> : null}
      {meta?.titulos?.length > 0 ? <TitulosBlock titulos={meta.titulos} /> : null}
    </Stack>
  );
}

// ─── GarantiaCard ----------------------------------------------------------------------------------------------------

function GarantiaCard({ garantia, participantes, canChange, openForm }) {
  const isV2 = garantia.versao_schema === 2;
  const [expanded, setExpanded] = useState(false);
  const donos = participantes?.filter(({ garantia_id }) => garantia_id === garantia?.id);

  return (
    <Card>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded(!expanded)}
        sx={{
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          transition: 'background .15s',
          borderBottom: expanded ? `1px solid` : 'none',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Stack
          useFlexGap
          spacing={2}
          flexWrap="wrap"
          direction="row"
          justifyContent="space-between"
          sx={{ flexGrow: 1 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography variant="subtitle2">
                {garantia.tipo}
                {garantia.subtipo ? ` — ${garantia.subtipo}` : ''}
              </Typography>
            </Stack>
            <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1.5} sx={{ pl: 2.4, mt: 0.5, rowGap: 0 }}>
              <InlineRow
                label="Valor"
                value={fCurrency(garantia.valor)}
                sxValue={{ fontWeight: 'bold', color: 'text.secondary' }}
              />
              <InlineRow
                label="Cobertura"
                sxValue={{ color: 'success.main', fontWeight: 'bold' }}
                value={fPercent(garantia.percentagem_cobertura) || 'N/D'}
              />
              <InlineRow label="Conta DP" value={garantia.conta_dp} />
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
            <SchemaBadge version={garantia.versao_schema} />
            <StatusBadge label={garantia.reais ? 'Real' : 'Pessoal'} variant={garantia.reais ? 'active' : 'info'} />
            <StatusBadge label={garantia.ativo ? 'Ativo' : 'Inativo'} variant={garantia.ativo ? 'active' : ''} />
          </Stack>
        </Stack>

        <IconButton
          size="small"
          sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
        >
          <ExpandMoreIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {isV2 ? (
            <MetadadosV2 info_extra_v2={garantia.info_extra_v2} />
          ) : (
            <>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                {donos?.length > 0 && <DonosBlock donos={donos} />}
                {canChange && (
                  <DefaultAction
                    button
                    icon="adicionar"
                    label="Entidade/Dono"
                    onClick={() => openForm('form-interveniente', { garantiaId: garantia?.id })}
                  />
                )}
              </Stack>
              <SegurosLegacyBlock seguros={garantia.seguros} />
            </>
          )}
          {garantia.ultima_modificacao || garantia.feito_por ? (
            <Atualizado divider em={garantia.ultima_modificacao} por={garantia.feito_por} />
          ) : null}
        </Box>
      </Collapse>
    </Card>
  );
}
