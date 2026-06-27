import { useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '@/utils/formatTime';
import { usePermissao } from '../../utils/useAcesso';
import useTable, { applySort, getComparator } from '@/hooks/useTable';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { getDocumentoGaji9, getFromGaji9, setModal } from '@/redux/slices/gaji9';
// Components
import Scrollbar from '@/components/Scrollbar';
import { DefaultAction } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import { CellChecked, Criado } from '@/components/Panel';
import { TableHeadCustom, TableSearchNotFound } from '@/components/table';
//
import DetalhesContrato from './detalhes-contrato';
import { DataContratoForm, AnularContratoForm } from '../forms/form-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableContratos({ id }) {
  const dispatch = useDispatch();
  const { temPermissao, podeAnularContrato, isGerente } = usePermissao();
  const permissao = isGerente || temPermissao(['READ_CONTRATO']);

  const { order, dense, orderBy, onSort } = useTable({});
  const { isLoading, modalGaji9, contratos } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (permissao) dispatch(getFromGaji9('contratos', { id }));
  }, [dispatch, id, permissao]);

  const isNotFound = !contratos.length;

  const openModal = (item, dados) => dispatch(setModal({ item, dados }));

  const downloadContrato = (codigo) =>
    dispatch(getDocumentoGaji9('contrato', { codigo, titulo: `CONTRATO: ${codigo}` }));

  return (
    <>
      <Card sx={{ p: 1 }}>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={[
                  { id: 'codigo', label: 'Código' },
                  { id: 'representante', label: 'Representante' },
                  { id: 'versao', label: 'Versão', align: 'center' },
                  { id: 'ativo', label: 'Ativo', align: 'center' },
                  { id: 'versao', label: 'Gerado' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={6} />
                ) : (
                  applySort(contratos, getComparator(order, orderBy)).map((row, index) => (
                    <TableRow hover key={`contratos_${index}`}>
                      <TableCell>{row?.codigo}</TableCell>
                      <TableCell>{row?.representante}</TableCell>
                      <TableCell align="center">{row?.versao}</TableCell>
                      <CellChecked check={row.ativo} />
                      <TableCell align="center" width={10}>
                        <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />
                        <Criado caption tipo="user" value={row?.criador} />
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.75}>
                          <DefaultAction small label="CONTRATO" onClick={() => downloadContrato(row?.codigo)} />
                          {podeAnularContrato(row) && (
                            <DefaultAction small label="ANULAR" onClick={() => openModal('anular-contrato', row)} />
                          )}
                          {(isGerente || temPermissao(['UPDATE_CONTRATO'])) && (
                            <DefaultAction small label="EDITAR" onClick={() => openModal('data-contrato', row)} />
                          )}
                          <DefaultAction small label="DETALHES" onClick={() => openModal('view-contrato', row)} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível..." />}
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {modalGaji9 === 'view-contrato' && <DetalhesContrato onClose={openModal} />}
      {modalGaji9 === 'data-contrato' && <DataContratoForm creditoId={id} onClose={openModal} />}
      {modalGaji9 === 'anular-contrato' && <AnularContratoForm creditoId={id} onClose={openModal} />}
    </>
  );
}
