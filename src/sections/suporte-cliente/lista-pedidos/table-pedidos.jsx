// @mui
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '@/utils/formatTime';
import { LabelStatus } from '../utils';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte, setModal } from '@/redux/slices/suporte-cliente';
// Components
import Scrollbar from '@/components/Scrollbar';
import { noDados, Criado } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import DetalhesTicket from '../detalhes-ticket/index';
import { Avaliacao } from '../dashboard/table-dashboard';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';

// ---------------------------------------------------------------------------------------------------------------------

export default function TablePedidos({ dados, useTable, item = '', refetch = null }) {
  const dispatch = useDispatch();
  const { isLoading, modalSuporte } = useSelector((state) => state.suporte);

  const { page, order, dense, orderBy, rowsPerPage, onSort, onChangePage, onChangeDense, onChangeRowsPerPage, total } =
    useTable;
  const isNotFound = !dados.length;

  const viewItem = (modal, dados) => {
    dispatch(setModal({ modal: 'detalhe-ticket' }));
    dispatch(getInSuporte('ticket', { id: dados?.ticket_id || dados?.id, item: 'selectedItem' }));
  };

  return (
    <>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable row={10} column={item === 'avaliacoes' ? 5 : 7} />
              ) : (
                dados.map((row, index) => (
                  <TableRow hover key={`ticket_${index}`}>
                    {(item === 'avaliacoes' && <RowAvaliacoes row={row} />) || <RowPedidos row={row} />}
                    <TableCell align="center" width={10}>
                      <DefaultAction small label="DETALHES" onClick={() => viewItem('view', row)} />
                    </TableCell>
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

      {!isNotFound && total > 10 && (
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

      {modalSuporte === 'detalhe-ticket' && <DetalhesTicket refetch={refetch} onClose={() => dispatch(setModal({}))} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function RowPedidos({ row }) {
  return (
    <>
      <TableCell>{row?.code_ticket}</TableCell>
      <TableCell>{row?.subject_name}</TableCell>
      <TableCell>{row?.customer_name}</TableCell>
      <TableCell align="center">{ptDateTime(row?.created_at)}</TableCell>
      <TableCell>{row?.colaborador ?? noDados('(Não atribuido...)')}</TableCell>
      <TableCell align="center">
        <LabelStatus label={row?.status} />
      </TableCell>
    </>
  );
}

function RowAvaliacoes({ row }) {
  return (
    <>
      <Avaliacao rating={row.rating} hideLabel />
      <TableCell>
        <Typography sx={{ typography: 'body2', whiteSpace: 'pre-line' }}>
          {row?.comment || noDados('(Sem comentário)')}
        </Typography>
      </TableCell>
      <TableCell>{row?.subject}</TableCell>
      <TableCell>{<Criado value={ptDateTime(row?.created_at)} />}</TableCell>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...((item === 'avaliacoes' && [
      { id: 'rating', label: 'Avaliação' },
      { id: '', label: 'Comentário' },
      { id: '', label: 'Assunto' },
      { id: '', label: 'Data' },
    ]) || [
      { id: '', label: 'Código' },
      { id: '', label: 'Assunto' },
      { id: '', label: 'Requerente' },
      { id: 'created_at', label: 'Data', align: 'center' },
      { id: '', label: 'Atribuído a' },
      { id: '', label: 'Estado', align: 'center' },
    ]),
    { id: '', width: 10 },
  ];
}
