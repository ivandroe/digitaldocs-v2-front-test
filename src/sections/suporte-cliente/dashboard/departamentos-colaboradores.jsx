import { useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import useTable from '@/hooks/useTable';
import { fNumber, fPercent } from '@/utils/formatNumber';
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
// Components
import { Avaliacao } from './table-dashboard';
import Scrollbar from '@/components/Scrollbar';
import { SkeletonTable } from '@/components/skeleton';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';

// ---------------------------------------------------------------------------------------------------------------------

const HEADER_DEPARTAMENTOS = [
  { id: '', label: 'Departamento' },
  { id: '', label: 'Entradas', align: 'right' },
  { id: '', label: 'Saídas', align: 'right' },
  { id: '', label: 'Taxa de Saída', align: 'right' },
  { id: '', label: 'Conformidade SLA', align: 'right' },
];

const HEADER_COLABORADORES = [
  { id: '', label: 'Colaborador' },
  { id: '', label: 'Fechados', align: 'center' },
  { id: '', label: 'Resolvidos', align: 'center' },
  { id: '', label: 'Média avaliação', align: 'center' },
];

// ---------------------------------------------------------------------------------------------------------------------

function RowDepartamento({ row }) {
  return (
    <>
      <TableCell>{row.department_name}</TableCell>
      <TableCell align="right">{fNumber(row.check_in_count)}</TableCell>
      <TableCell align="right">{fNumber(row.check_out_count)}</TableCell>
      <TableCell align="right">{fPercent(row?.check_out_rate * 100)}</TableCell>
      <TableCell align="right">{fPercent(row?.sla_compliance_rate * 100)}</TableCell>
    </>
  );
}

function RowColaborador({ row }) {
  return (
    <>
      <TableCell>{row.employee}</TableCell>
      <TableCell align="center">{row.closed}</TableCell>
      <TableCell align="center">{row.resolved}</TableCell>
      <Avaliacao rating={row.rating} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export default function DepartamentosColaboradores({ department, data, periodo, item = 'departamentos' }) {
  const dispatch = useDispatch();
  const isDepartamentos = item === 'departamentos';

  const {
    page,
    order,
    dense,
    onSort,
    orderBy,
    setPage,
    rowsPerPage,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 10, defaultOrderBy: 'rating' });

  const { dashdepartamentos, dashutilizadores, isLoading } = useSelector((state) => state.suporte);

  const fetchTickets = useCallback(() => {
    const year = data.getFullYear();
    const month = periodo === 'Mensal' ? data.getMonth() + 1 : '';
    dispatch(
      getInSuporte(`dash${item}`, {
        year,
        page,
        month,
        department,
        size: rowsPerPage,
        reset: { dados: {} },
        sortDirection: order,
      })
    );
  }, [data, department, dispatch, item, order, page, periodo, rowsPerPage]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, data, periodo, item]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const dados = isDepartamentos
    ? (dashdepartamentos?.indicators_by_department ?? [])
    : (dashutilizadores?.indicators_by_employee ?? []);

  const total = isDepartamentos ? (dashdepartamentos?.total_elements ?? 0) : (dashutilizadores?.total_elements ?? 0);

  const isNotFound = !dados.length;
  const headLabel = isDepartamentos ? HEADER_DEPARTAMENTOS : HEADER_COLABORADORES;

  return (
    <Card sx={{ p: 1 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headLabel} />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable row={10} column={isDepartamentos ? 5 : 4} />
              ) : (
                dados.map((row, index) => (
                  <TableRow hover key={`${item}_${index}`}>
                    {isDepartamentos ? <RowDepartamento row={row} /> : <RowColaborador row={row} />}
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

      {!isNotFound && total > rowsPerPage && (
        <TablePaginationAlt
          page={page}
          dense={dense}
          count={total}
          rowsPerPage={rowsPerPage}
          onChangePage={onChangePage}
          onChangeDense={onChangeDense}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      )}
    </Card>
  );
}
