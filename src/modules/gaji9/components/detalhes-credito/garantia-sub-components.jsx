// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// utils
import { ptDate } from '@/utils/formatTime';
import { fCurrency, fPercent, fNumber } from '@/utils/formatNumber';
//
import { noDados, SemDados } from '@/components/Panel';
import { InnerCard, StatusBadge, InlineRow } from './shared';
import TableInfoGarantias from '@/sections/processo/info-credito/garantias/table-info-garantias';

// ─── Donos -----------------------------------------------------------------------------------------------------------

export function DonosBlock({ donos, item = '', sx = null }) {
  if (!donos?.length) return null;
  return (
    <Stack spacing={0.5} sx={{ ...sx }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {item === 'Avalista(s)' ? item : `Dono(s) ${item ? `do ${item}` : 'da garantia'}:`}
      </Typography>
      {donos.map((row, index) => (
        <InfoEntidade key={row?.numero || row?.numero_entidade || index} row={row} boxSize={6} />
      ))}
    </Stack>
  );
}

// ─── Morada inline ---------------------------------------------------------------------------------------------------

function MoradaInline({ morada }) {
  if (!morada) return null;
  const linha = [morada.rua, morada.numero_porta, morada.zona, morada.freguesia, morada.concelho, morada.ilha]
    .filter(Boolean)
    .join(', ');
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Morada:
      </Typography>
      <Typography variant="body2">{linha || noDados('(Não definido)')}</Typography>
      {morada.descritivo && (
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {morada.descritivo}
        </Typography>
      )}
    </Box>
  );
}

// ─── Seguros V2 (dentro de metadados) --------------------------------------------------------------------------------

export function SegurosV2Block({ seguros, raiz = false }) {
  return (
    <Paper variant="outlined" sx={{ p: 0.5, mt: raiz ? 0 : 3 }}>
      <TableInfoGarantias dados={seguros} item="seguros" garantia size="small" />
    </Paper>
  );
}

// ─── Seguros Legacy V1 -----------------------------------------------------------------------------------------------

export function SegurosLegacyBlock({ seguros }) {
  if (!seguros?.length) return <SemDados message="Sem seguros..." sx={{ p: 1.5 }} />;
  return (
    <Stack spacing={2}>
      {seguros.map((s) => (
        <InnerCard key={s.id}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
            <Box>
              <InlineRow label="Tipo seguro" value={s.tipo_seguro} />
              <InlineRow label="Valor prémio" value={fCurrency(s.valor_premio_seguro)} />
            </Box>
            <StatusBadge label={s.ativo ? 'Ativo' : 'Inativo'} variant={s.ativo ? 'active' : ''} />
          </Box>
        </InnerCard>
      ))}
    </Stack>
  );
}

// ─── Predios ---------------------------------------------------------------------------------------------------------

export function PrediosBlock({ predios }) {
  const lista = predios?.length > 1;
  return (
    <Stack spacing={2}>
      {predios.map((p, i) => (
        <Paper key={i} elevation={lista ? 2 : 0} sx={{ p: lista ? 2 : 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow
                  label="Cobertura"
                  value={fPercent(p.percentagem_cobertura) || 'N/D'}
                  sxValue={{ fontWeight: 'bold', color: 'success.main' }}
                />
                <InlineRow
                  label="Valor cobertura"
                  value={fCurrency(p.valor_cobertura)}
                  sxValue={{ fontWeight: 'bold' }}
                />
                <InlineRow label="Valor PVT" value={fCurrency(p.valor_pvt)} sxValue={{ fontWeight: 'bold' }} />
              </Stack>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow label="NIP" value={p.nip} />
                <InlineRow label="Tipo matriz" value={p.tipo_matriz} />
                <InlineRow label="N.º matriz" value={p.numero_matriz} />
                <InlineRow label="N.º descrição predial" value={p.numero_descricao_predial} />
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ width: 1 }}>
              <MoradaInline morada={p.morada} />
              <DonosBlock donos={p.donos} item="prédio" />
            </Stack>
          </Stack>
          {p.seguros?.length > 0 && <SegurosV2Block seguros={p.seguros} />}
        </Paper>
      ))}
    </Stack>
  );
}

// ─── Apartamentos ----------------------------------------------------------------------------------------------------

export function ApartamentosBlock({ apartamentos }) {
  const lista = apartamentos?.length > 1;
  return (
    <Stack spacing={2}>
      {apartamentos.map((a, i) => (
        <Paper key={i} elevation={lista ? 2 : 0} sx={{ p: lista ? 2 : 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow
                  label="Cobertura"
                  value={fPercent(a.percentagem_cobertura) || 'N/D'}
                  sxValue={{ fontWeight: 'bold', color: 'success.main' }}
                />
                <InlineRow
                  label="Valor cobertura"
                  value={fCurrency(a.valor_cobertura)}
                  sxValue={{ fontWeight: 'bold' }}
                />
                <InlineRow label="Valor PVT" value={fCurrency(a.valor_pvt)} sxValue={{ fontWeight: 'bold' }} />
              </Stack>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow label="NIP" value={a.nip} />
                <InlineRow label="N.º descrição predial" value={a.numero_descricao_predial} />
                <InlineRow label="Matriz predial" value={a.matriz_predial} />
                <InlineRow label="Identificação fração" value={a.identificacao_fracao} />
                <InlineRow label="Tipo matriz" value={a.tipo_matriz} />
                <InlineRow label="N.º andar" value={a.numero_andar} />
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ width: 1 }}>
              <MoradaInline morada={a.morada} />
              <DonosBlock donos={a.donos} item="apartamento" />
            </Stack>
          </Stack>
          {a.seguros?.length > 0 && <SegurosV2Block seguros={a.seguros} />}
        </Paper>
      ))}
    </Stack>
  );
}

// ─── Terrenos --------------------------------------------------------------------------------------------------------

export function TerrenosBlock({ terrenos }) {
  const lista = terrenos?.length > 1;
  return (
    <Stack spacing={2}>
      {terrenos.map((t, i) => (
        <Paper key={i} elevation={lista ? 2 : 0} sx={{ p: lista ? 2 : 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow
                  label="Cobertura"
                  value={fPercent(t.percentagem_cobertura) || 'N/D'}
                  sxValue={{ fontWeight: 'bold', color: 'success.main' }}
                />
                <InlineRow
                  label="Valor cobertura"
                  value={fCurrency(t.valor_cobertura)}
                  sxValue={{ fontWeight: 'bold' }}
                />
                <InlineRow label="Valor PVT" value={fCurrency(t.valor_pvt)} sxValue={{ fontWeight: 'bold' }} />
                <InlineRow label="Área" value={t.area} />
              </Stack>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow label="NIP" value={t.nip} />
                <InlineRow label="Tipo matriz" value={t.tipo_matriz} />
                <InlineRow label="N.º matriz" value={t.numero_matriz} />
                <InlineRow label="N.º descrição predial" value={t.numero_descricao_predial} />
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ width: 1 }}>
              <MoradaInline morada={t.morada} />
              <DonosBlock donos={t.donos} item="terreno" />
            </Stack>
          </Stack>
          {t.seguros?.length > 0 && <SegurosV2Block seguros={t.seguros} />}
        </Paper>
      ))}
    </Stack>
  );
}

// ─── Veículos --------------------------------------------------------------------------------------------------------

export function VeiculosBlock({ veiculos }) {
  const lista = veiculos?.length > 1;
  return (
    <Stack spacing={2}>
      {veiculos.map((v, i) => (
        <Paper key={i} elevation={lista ? 2 : 0} sx={{ p: lista ? 2 : 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow
                  label="Cobertura"
                  value={fPercent(v.percentagem_cobertura) || 'N/D'}
                  sxValue={{ fontWeight: 'bold', color: 'success.main' }}
                />
                <InlineRow
                  label="Valor cobertura"
                  value={fCurrency(v.valor_cobertura)}
                  sxValue={{ fontWeight: 'bold' }}
                />
                <InlineRow label="Valor PVT" value={fCurrency(v.valor_pvt)} sxValue={{ fontWeight: 'bold' }} />
                <InlineRow label="Valor" value={fCurrency(v.valor)} />
              </Stack>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow label="Matrícula" value={v.matricula} />
                <InlineRow label="Marca" value={v.marca} />
                <InlineRow label="Modelo" value={v.modelo} />
                <InlineRow label="Ano fabrico" value={v.ano_fabrico} />
                <InlineRow label="NURA" value={v.nura} />
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ width: 1 }}>
              <DonosBlock donos={v.donos} item="veículo" />
            </Stack>
          </Stack>
          {v.seguros?.length > 0 && <SegurosV2Block seguros={v.seguros} />}
        </Paper>
      ))}
    </Stack>
  );
}

// ─── Títulos ---------------------------------------------------------------------------------------------------------

export function TitulosBlock({ titulos }) {
  const lista = titulos?.length > 1;
  return (
    <Stack spacing={2}>
      {titulos.map((t, i) => (
        <Paper key={i} elevation={lista ? 2 : 0} sx={{ p: lista ? 2 : 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow
                  label="Cobertura"
                  value={fPercent(t.percentagem_cobertura) || 'N/D'}
                  sxValue={{ fontWeight: 'bold', color: 'success.main' }}
                />
                <InlineRow
                  label="Valor cobertura"
                  value={fCurrency(t.valor_cobertura)}
                  sxValue={{ fontWeight: 'bold' }}
                />
                <InlineRow label="Valor título" value={fCurrency(t.valor_titulo)} sxValue={{ fontWeight: 'bold' }} />
                <InlineRow label="N.º títulos" value={t.numero_titulos} />
              </Stack>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow label="Código" value={t.codigo} />
                <InlineRow label="Tipo título" value={t.tipo_titulo} />
                <InlineRow label="Entidade emissora" value={t.nome_entidade_emissora} />
                <InlineRow label="Instituição registo" value={t.nome_instituicao_registo} />
                <InlineRow label="N.º cliente" value={t.numero_cliente} />
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ width: 1 }}>
              <DonosBlock donos={t.donos} item="título" />
            </Stack>
          </Stack>
          {t.seguros?.length > 0 && <SegurosV2Block seguros={t.seguros} />}
        </Paper>
      ))}
    </Stack>
  );
}

// ─── Contas DP -------------------------------------------------------------------------------------------------------

export function ContasBlock({ contas }) {
  const lista = contas?.length > 1;
  return (
    <Stack spacing={2}>
      {contas.map((c, i) => (
        <Paper key={i} elevation={lista ? 2 : 0} sx={{ p: lista ? 2 : 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow
                  label="Cobertura"
                  value={fPercent(c.percentagem_cobertura) || 'N/D'}
                  sxValue={{ fontWeight: 'bold', color: 'success.main' }}
                />
                <InlineRow
                  label="Valor cobertura"
                  sxValue={{ fontWeight: 'bold' }}
                  value={`${fNumber(c.valor_cobertura, 2)} ${c.moeda}`}
                />
                <InlineRow label="Saldo" sxValue={{ fontWeight: 'bold' }} value={`${fNumber(c.saldo, 2)} ${c.moeda}`} />
                <InlineRow label="Prazo" value={c.prazo} />
              </Stack>
              <Stack spacing={1} sx={{ width: 1 }}>
                <InlineRow label="N.º conta" value={c.numero_conta} />
                <InlineRow label="Balcão" value={c.balcao} />
                <InlineRow label="Data constituição" value={ptDate(c.data_constituicao)} />
                <InlineRow label="Data início" value={ptDate(c.data_inicio)} />
                <InlineRow label="Data vencimento" value={ptDate(c.data_vencimento)} />
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ width: 1 }}>
              <DonosBlock donos={c.donos} item="conta" />
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

// ─── Fiadores --------------------------------------------------------------------------------------------------------

export function FiadoresBlock({ fiadores }) {
  return (
    <Stack spacing={0.5}>
      {fiadores.map((f, i) => (
        <InfoEntidade key={i} row={f} boxSize={6} />
      ))}
    </Stack>
  );
}

// ─── Livranças -------------------------------------------------------------------------------------------------------

export function LivrancasBlock({ livrancas }) {
  return (
    <Stack direction="row" spacing={2}>
      {livrancas.map((l, i) => (
        <InnerCard key={i} sx={{ py: 1 }}>
          <Typography variant="body2">{l.numero_livranca}</Typography>
        </InnerCard>
      ))}
    </Stack>
  );
}

// ─── Livranças -------------------------------------------------------------------------------------------------------

export function InfoEntidade({ row, boxSize = '', variant = 'body2' }) {
  const nome = row?.nome || row?.nome_entidade;
  const numero = row?.numero || row?.numero_entidade;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {boxSize && <Box sx={{ width: boxSize, height: boxSize, borderRadius: '50%', bgcolor: 'success.light' }} />}
      <Typography variant={variant}>
        {numero && (
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {numero}
          </Box>
        )}
        {numero ? ` - ${nome}` : nome}
      </Typography>
    </Stack>
  );
}
