import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import useTable from '@/hooks/useTable';
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
import { storageGet, storageSet, ratingList } from '../../utils';
// Components
import TablePedidos from './table-pedidos';
import { SearchAvaliacoes } from './search-toolbar';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';

// ---------------------------------------------------------------------------------------------------------------------

export default function Avaliacoes() {
  const dispatch = useDispatch();
  const { order, page, rowsPerPage, setPage, ...rest } = useTable({
    defaultRowsPerPage: 10,
    defaultOrderBy: 'rating',
  });

  const { avaliacoes, assuntos } = useSelector((state) => state.suporte);

  const [rating, setRating] = useState(() => storageGet('ratingAvaliacao'));
  const [subject, setSubject] = useState(() => storageGet('subjectAvaliacao'));

  const fetchTickets = useCallback(() => {
    dispatch(
      getInSuporte('avaliacoes', {
        page,
        size: rowsPerPage,
        rating: rating?.id,
        sortDirection: order,
        reset: { dados: {} },
        subjectId: subject?.id,
      })
    );
  }, [dispatch, order, page, rating?.id, rowsPerPage, subject?.id]);

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

  const { evaluations: data = [], total_elements: total = 0 } = avaliacoes;

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading="Tickets" />
      <Card sx={{ p: 1 }}>
        <SearchAvaliacoes
          values={{ rating, subject }}
          lists={{ subjectsList: assuntos, ratingList }}
          setValues={{
            setRating: handleFilter(setRating, 'ratingAvaliacao'),
            setSubject: handleFilter(setSubject, 'subjectAvaliacao'),
          }}
        />
        <TablePedidos dados={data} item="avaliacoes" useTable={{ total, page, order, rowsPerPage, ...rest }} />
      </Card>
    </>
  );
}
