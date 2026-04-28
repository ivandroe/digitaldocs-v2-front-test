import { useState, useEffect, useMemo, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import {
  storageGet,
  storageSet,
  statusList,
  getAccessibleUsers,
  injectCollaboratorName,
  getAccessibleDepartments,
} from '../../utils';
import useTable from '@/hooks/useTable';
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
// Components
import TablePedidos from './table-pedidos';
import SearchToolbar from './search-toolbar';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';

// ---------------------------------------------------------------------------------------------------------------------

export default function Tickets({ utilizador, department, setDepartment }) {
  const dispatch = useDispatch();
  const { order, page, rowsPerPage, setPage, ...rest } = useTable({
    defaultRowsPerPage: 10,
    defaultOrderBy: 'created_at',
  });

  const isAdmin = utilizador?.role === 'ADMINISTRATOR';
  const colaboradores = useSelector((state) => state.intranet.colaboradores);
  const { tickets, departamentos, utilizadores, assuntos } = useSelector((state) => state.suporte);

  const [subject, setSubject] = useState(() => storageGet('subjectTicket'));
  const [colaborador, setColaborador] = useState(() => storageGet('colaboradorTickets'));
  const [status, setStatus] = useState(
    () => statusList?.find(({ id }) => id === storageGet('statusTicket')?.id) || null
  );

  const departamentoList = getAccessibleDepartments(departamentos, utilizador);
  const usersList = getAccessibleUsers(utilizadores, colaboradores, utilizador, department);

  const fetchTickets = useCallback(() => {
    if (!isAdmin && !department?.id) return;
    dispatch(
      getInSuporte('tickets', {
        page,
        sort: order,
        size: rowsPerPage,
        status: status?.id,
        reset: { dados: {} },
        subjectId: subject?.id,
        departmentId: department?.id,
        currentUserEmployeeId: colaborador?.id,
      })
    );
  }, [dispatch, page, rowsPerPage, order, status?.id, department?.id, subject?.id, colaborador?.id, isAdmin]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilter = useCallback(
    (setter, key) => (value) => {
      setPage(0);
      setter(value);
      storageSet(key, value);
    },
    [setPage]
  );

  const { tickets: data = [], total_elements: total = 0 } = tickets;
  const dados = useMemo(
    () => injectCollaboratorName(data, utilizadores, colaboradores),
    [data, utilizadores, colaboradores]
  );

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading="Tickets" />
      <Card sx={{ p: 1 }}>
        <SearchToolbar
          values={{ colaborador, status, subject, department, isAdmin }}
          lists={{ usersList, subjectsList: assuntos, departamentoList }}
          setValues={{
            setDepartment,
            setStatus: handleFilter(setStatus, 'statusTicket'),
            setSubject: handleFilter(setSubject, 'subjectTicket'),
            setColaborador: handleFilter(setColaborador, 'colaboradorTickets'),
          }}
        />
        <TablePedidos
          dados={dados}
          refetch={() => fetchTickets()}
          useTable={{ total, page, order, rowsPerPage, ...rest }}
        />
      </Card>
    </>
  );
}
