// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
// utils
import { ptDateTime, fDistance, fToNow } from '@/utils/formatTime';
// components
import Label from '@/components/Label';
import { DefaultAction } from '@/components/Actions';
import { Criado, ColaboradorInfo, noDados, CellChecked } from '@/components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export function RowRetencoes({ row }) {
  return (
    <>
      <TableCell>
        <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} presence={row?.presence} />
      </TableCell>
      <TableCell align="center">{ptDateTime(row?.preso_em)}</TableCell>
      <TableCell align="center">
        {(row?.preso_em && row?.solto_em && fDistance(row?.preso_em, row?.solto_em)) ||
          (row?.preso_em && !row?.solto_em && fToNow(row?.preso_em)) ||
          noDados('--')}
      </TableCell>
      <TableCell align={row?.solto_em ? 'left' : 'center'}>
        {row?.solto_em ? (
          <Criado tipo="data" value={ptDateTime(row?.solto_em)} />
        ) : (
          <Criado sx={{ color: 'text.success' }} caption value="Ainda está a trabalhar no processo" />
        )}
        {row?.solto_em && row?.por && <Criado tipo="user" value={row?.por === 'system' ? 'Pelo sistema' : row?.por} />}
      </TableCell>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowConfid({ row, colaboradores, openModal }) {
  return (
    <>
      <TableCell>
        <Criterios dados={row?.criterios} colaboradores={colaboradores} />
      </TableCell>
      <TableCell align="center">
        <Label variant="ghost" color={row?.ativo ? 'success' : 'default'}>
          {row?.ativo ? 'Sim' : 'Não'}
        </Label>
      </TableCell>
      <TableCell>
        {row?.criador && <Criado caption tipo="user" value={row?.criador} />}
        {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />}
      </TableCell>
      <TableCell>
        {row?.ativo && row?.permite_alteracao && (
          <DefaultAction small label="EDITAR" onClick={() => openModal('confidencialidade', row)} />
        )}
      </TableCell>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowPendencias({ row }) {
  return (
    <>
      <TableCell>{row?.motivo}</TableCell>
      <TableCell>{row?.observacao || noDados('--')}</TableCell>
      <TableCell>
        {(row?.data_pendente && row?.data_libertado && (
          <Criado caption tipo="time" value={fDistance(row?.data_pendente, row?.data_libertado)} />
        )) ||
          (row?.data_pendente && !row?.data_libertado && (
            <Criado caption tipo="time" value={fToNow(row?.data_pendente)} />
          )) ||
          noDados('--')}
        <Criado caption tipo="data" value={ptDateTime(row?.data_libertado)} />
      </TableCell>
      <TableCell>
        <Criado caption tipo="user" value={row?.nome} />
        <Criado caption tipo="data" value={ptDateTime(row?.data_pendente)} />
      </TableCell>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowAtribuicoes({ row }) {
  return (
    <>
      <TableCell>
        <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} presence={row?.presence} />
      </TableCell>
      <TableCell>{row?.estado}</TableCell>
      <TableCell>
        <Criado caption tipo="data" value={ptDateTime(row?.atribuido_em)} />
        <Criado caption tipo="user" value={row?.atribuidor} />
      </TableCell>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowEnquadramento({ row, openModal }) {
  return (
    <>
      <TableCell>{row?.fluxo}</TableCell>
      <TableCell>{<Criado value={ptDateTime(row?.criado_em)} />}</TableCell>
      <TableCell>{<Criado value={row?.criador} />}</TableCell>
      <CellChecked check={row?.ativo} />
      {/* <TableCell>
        <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />
        <Criado caption tipo="user" value={row?.criador} />
      </TableCell> */}
      {/* <TableCell>
        <Criado caption tipo="data" value={ptDateTime(row?.modificado_em)} />
        <Criado caption tipo="user" value={row?.modificado_por} />
        {!row?.modificado_em && !row?.modificado_por && noDados('(Não modificado)')}
      </TableCell> */}
      <TableCell>
        <DefaultAction
          small
          label="ELIMINAR"
          disabled={!row?.ativo}
          onClick={() => openModal('eliminar-enquadramento', row)}
        />
      </TableCell>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Criterios({ dados, colaboradores }) {
  const estadosIncluidos = dados.filter(({ estado_incluido_id: estado }) => estado).map((item) => item.estado_incluido);
  const estadosExcluidos = dados.filter(({ estado_excluido_id: estado }) => estado).map((item) => item.estado_excluido);
  const perfisIncluidos = dados
    .filter(({ perfil_incluido_id: pid }) => pid)
    .map(
      (item) =>
        colaboradores?.find(({ perfil_id: pid }) => pid === item.perfil_incluido_id)?.nome ||
        `PerfilID: ${item.perfil_incluido_id}`
    );
  const perfisExcluidos = dados
    .filter(({ perfil_excluido_id: pid }) => pid)
    .map(
      (item) =>
        colaboradores?.find(({ perfil_id: pid }) => pid === item.perfil_excluido_id)?.nome ||
        `PerfilID: ${item.perfil_excluido_id}`
    );

  return (
    <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
      {(estadosIncluidos?.length > 0 || perfisIncluidos?.length > 0) && (
        <ItemsCriterios label="Com acesso" estados={estadosIncluidos} colaboradores={perfisIncluidos} />
      )}
      {(estadosExcluidos?.length > 0 || perfisExcluidos?.length > 0) && (
        <ItemsCriterios label="Sem acesso" estados={estadosExcluidos} colaboradores={perfisExcluidos} />
      )}
    </Stack>
  );
}

function ItemsCriterios({ label, estados = [], colaboradores = [] }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
        {label}:
      </Typography>
      <Stack spacing={1}>
        {estados?.length > 0 && (
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            {estados?.map((row, index) => (
              <Label color={label === 'Com acesso' ? 'success' : 'error'} key={`${row}_${index}`}>
                {row}
              </Label>
            ))}
          </Stack>
        )}
        {colaboradores?.length > 0 && (
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            {colaboradores?.map((row, index) => (
              <Label color={label === 'Com acesso' ? 'success' : 'error'} key={`${row}_${index}`}>
                {row}
              </Label>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
