// @mui
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
// utils
import { useSelector } from '@/redux/store';
import { periodicidadesList } from '@/_mock';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { noDados } from '@/components/Panel';
import { TableSearchNotFound } from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableSeguros({ dados, size = 'meddium', garantia = false }) {
  return (
    <Table size={size}>
      <TableHead>
        <TableRow sx={{ '& .MuiTableCell-root': { py: 1 } }}>
          {!garantia && <TableCell>Seguro</TableCell>}
          <TableCell>Apólice</TableCell>
          <TableCell>Seguradora</TableCell>
          <TableCell align="right">Cobertura</TableCell>
          <TableCell align="right">Valor</TableCell>
          <TableCell align="right">Prêmio</TableCell>
          <TableCell align="center">Period.</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {dados?.map((row, index) => (
          <TableRow hover key={`${row?.id}_${index}`}>
            {!garantia && <TableCell>{row?.tipo_seguro || <TipoSeguro tipoId={row?.tipo_seguro_id} />}</TableCell>}
            <TableCell>{row?.apolice}</TableCell>
            <TableCell>{row?.seguradora}</TableCell>
            <TableCell align="right">{fPercent(row?.percentagem_cobertura) || noDados('(Não definido...)')}</TableCell>
            <TableCell align="right">{fCurrency(row?.valor) || noDados('(Não definido...)')}</TableCell>
            <TableCell align="right">{fCurrency(row?.premio) || noDados('(Não definido...)')}</TableCell>
            <TableCell align="center">
              {periodicidadesList.find(({ id }) => id === row?.periodicidade)?.label || row?.periodicidade}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {dados?.length === 0 && <TableSearchNotFound message="Nenhuma registo encontrado..." height={130} />}
    </Table>
  );
}

export function TipoSeguro({ tipoId }) {
  const { tiposSeguros } = useSelector((state) => state.gaji9);
  const tipoSeguroLabel = tiposSeguros?.find(({ id }) => id === tipoId)?.designacao;
  return tipoSeguroLabel || noDados('(Não definido...)');
}
