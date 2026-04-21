import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import useTable from '@/hooks/useTable';
import { injectCollaboratorName } from '../utils';
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte, getSuccess } from '@/redux/slices/suporte-cliente';
// components
import TablePedidos from './table-pedidos';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '@/components/SearchToolbar';

const DEBOUNCE_MS = 1000;

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcurarPedidos() {
  const dispatch = useDispatch();
  const { order, page, rowsPerPage, setPage, ...rest } = useTable({
    defaultRowsPerPage: 10,
    defaultOrderBy: 'created_at',
  });

  const { pesquisa, utilizadores } = useSelector((state) => state.suporte);
  const colaboradores = useSelector((state) => state.intranet.colaboradores);

  const [inputValue, setInputValue] = useState(() => localStorage.getItem('queryTickets') || '');
  const [query, setQuery] = useState(inputValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(inputValue);
      setPage(0);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputValue, setPage]);

  useEffect(() => {
    if (!query.trim()) {
      dispatch(getSuccess({ item: 'pesquisa', dados: {} }));
      return;
    }
    dispatch(getInSuporte('pesquisa', { page, query, sort: order, size: rowsPerPage, reset: { dados: {} } }));
  }, [dispatch, query, page, order, rowsPerPage]);

  const { tickets: data = [], total_elements: total = 0 } = pesquisa || {};
  const dados = useMemo(
    () => injectCollaboratorName(data, utilizadores, colaboradores),
    [data, utilizadores, colaboradores]
  );

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading="Procurar tickets" />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple filter={inputValue} setFilter={setInputValue} item="queryTickets" />
        <TablePedidos dados={dados} useTable={{ total, page, order, rowsPerPage, ...rest }} />
      </Card>
    </>
  );
}
