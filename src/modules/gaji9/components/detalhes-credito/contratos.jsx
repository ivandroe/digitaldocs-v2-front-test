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
import { usePermissao } from '@/hooks/useAcesso';
import useTable, { applySort, getComparator } from '@/hooks/useTable';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { getDocumentoGaji9, getFromGaji9, deleteItem, setModal } from '@/redux/slices/gaji9';
// Components
import Scrollbar from '@/components/Scrollbar';
import { CellChecked } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import { DialogConfirmar } from '@/components/CustomDialog';
import { TableHeadCustom, TableSearchNotFound } from '@/components/table';
//
import DetalhesContrato from './detalhes-contrato';
import { DataContratoForm } from '../forms/form-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableContratos({ id }) {
  const dispatch = useDispatch();
  const { temPermissao, isGerente } = usePermissao();
  const permissao = isGerente || temPermissao(['READ_CONTRATO']);

  const { order, dense, orderBy, onSort } = useTable({});
  const { isSaving, isLoading, modalGaji9, selectedItem, contratos } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (permissao) dispatch(getFromGaji9('contratos', { id }));
  }, [dispatch, id, permissao]);

  const isNotFound = !contratos.length;

  const openModal = (item, dados) => dispatch(setModal({ item, dados }));

  const downloadContrato = (codigo) =>
    dispatch(getDocumentoGaji9('contrato', { codigo, titulo: `CONTRATO: ${codigo}` }));

  const eliminarContrato = () => {
    const params = { creditoId: id, id: selectedItem?.id, onClose: () => openModal() };
    dispatch(deleteItem('contratos', { ...params, msg: 'Contrato eliminado' }));
  };

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
                  { id: 'versao', label: 'Versão', align: 'center', width: 10 },
                  { id: 'ativo', label: 'Ativo', align: 'center' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={5} />
                ) : (
                  applySort(contratos, getComparator(order, orderBy)).map((row, index) => (
                    <TableRow hover key={`contratos_${index}`}>
                      <TableCell>{row?.codigo}</TableCell>
                      <TableCell>{row?.representante}</TableCell>
                      <TableCell align="center">{row?.versao}</TableCell>
                      <CellChecked check={row.ativo} />
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.75}>
                          <DefaultAction small label="CONTRATO" onClick={() => downloadContrato(row?.codigo)} />
                          {temPermissao(['DELETE_CONTRATO']) && (
                            <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-contrato', row)} />
                          )}
                          {(isGerente || temPermissao(['CREATE_CONTRATO'])) && (
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

      {modalGaji9 === 'eliminar-contrato' && (
        <DialogConfirmar
          isSaving={isSaving}
          handleOk={eliminarContrato}
          onClose={() => openModal()}
          desc="eliminar este contrato"
        />
      )}
      {modalGaji9 === 'view-contrato' && <DetalhesContrato onClose={openModal} />}
      {modalGaji9 === 'data-contrato' && <DataContratoForm creditoId={id} onClose={openModal} />}
    </>
  );
}
