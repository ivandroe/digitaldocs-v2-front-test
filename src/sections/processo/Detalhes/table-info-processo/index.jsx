import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// utils
import useTable, { getComparator } from '@/hooks/useTable';
import { dadosComColaboradores, applySortFilter, headerTable } from './utils';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { getFromParametrizacao } from '@/redux/slices/parametrizacao';
import { getInfoProcesso, setModal } from '@/redux/slices/digitaldocs';
// components
import Scrollbar from '@/components/Scrollbar';
import { AddItem } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import { SearchToolbarSimple } from '@/components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';
//
import { Enquadramentos } from './enquadramentos';
import { RowAtribuicoes, RowRetencoes, RowConfid, RowPendencias, RowEnquadramento } from './components';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableInfoProcesso({ id, item }) {
  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');
  const { colaboradores } = useSelector((state) => state.intranet);
  const { processo, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (id && item && item !== 'enquadramentos') dispatch(getInfoProcesso(item, { id }));
  }, [dispatch, item, id]);

  useEffect(() => {
    if (item === 'enquadramentos' && processo?.estado_pode_enquadrar)
      dispatch(getFromParametrizacao('fluxosEnquadramento', { rest: { val: [] } }));
  }, [dispatch, item, processo?.estado_pode_enquadrar]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    dados:
      (item === 'enquadramentos' && processo?.enquadramentos) ||
      (item === 'confidencialidades' && processo?.confidencialidades) ||
      (item === 'hretencoes' && dadosComColaboradores(processo?.hretencoes || [], colaboradores)) ||
      (item === 'hpendencias' && dadosComColaboradores(processo?.hpendencias || [], colaboradores)) ||
      (item === 'hatribuicoes' && dadosComColaboradores(processo?.hatribuicoes || [], colaboradores)) ||
      [],
    comparator: getComparator(order, orderBy),
    filter,
  });
  const isNotFound = !dataFiltered.length;

  const openModal = (item, dados) => dispatch(setModal({ modal: item || '', dados: dados || null }));

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1 }}>
        <Stack sx={{ flexGrow: 1 }}>
          <SearchToolbarSimple filter={filter} setFilter={setFilter} pb={0} />
        </Stack>
        {processo?.estado_pode_enquadrar && <AddItem onClick={() => openModal('form-enquadramento')} />}
      </Stack>
      <Scrollbar>
        <TableContainer sx={{ overflow: 'hidden', position: 'relative', minWidth: 800 }}>
          <Table size={dense || item?.includes('anexo') ? 'small' : 'medium'}>
            <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable column={(item === 'hatribuicoes' && 3) || 4} row={10} />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`table_detalhes_${index}`}>
                    {item === 'hretencoes' && <RowRetencoes row={row} />}
                    {item === 'hatribuicoes' && <RowAtribuicoes row={row} />}
                    {item === 'hpendencias' && <RowPendencias row={row} />}
                    {item === 'confidencialidades' && (
                      <RowConfid row={row} openModal={openModal} colaboradores={colaboradores} />
                    )}
                    {item === 'enquadramentos' && <RowEnquadramento row={row} openModal={openModal} />}
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && isNotFound && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
            )}
          </Table>
        </TableContainer>
      </Scrollbar>

      {!isNotFound && dataFiltered.length > 10 && (
        <TablePaginationAlt
          page={page}
          dense={dense}
          rowsPerPage={rowsPerPage}
          count={dataFiltered.length}
          onChangePage={onChangePage}
          onChangeDense={onChangeDense}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      )}
      {isOpenModal && <Enquadramentos id={processo?.id} modal={isOpenModal} openModal={openModal} />}
      {/* {isOpenModal === 'confidencialidade' && <ConfidencialidadesForm processoId={processo.id} />} */}
    </Box>
  );
}
