// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useSelector } from '@/redux/store';
import { ptDateTime } from '@/utils/formatTime';
// components
import { SearchNotFoundSmall } from '@/components/table';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { TableRowItem, LabelSN, Resgisto } from '@/sections/parametrizacao/details';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesContrato({ onClose }) {
  const selectedItem = useSelector((state) => state.gaji9.selectedItem);

  return (
    <Dialog open fullWidth onClose={onClose} maxWidth="sm">
      <DialogTitleAlt title="Detalhes do contrato" onClose={onClose} sx={{ mb: 1 }} />
      <DialogContent>
        <DetalhesContent dados={selectedItem} />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DetalhesContent({ dados = null }) {
  return dados ? (
    <>
      <Table size="small" sx={{ my: 1 }}>
        <TableBody>
          <TableRowItem title="Versão:" text={dados?.versao} />
          <TableRowItem title="Código:" text={dados?.codigo} />
          <TableRowItem title="Representante:" text={dados?.representante} />
          <TableRowItem title="Data entrega:" text={ptDateTime(dados?.data_entrega)} />
          <TableRowItem title="Data recebimento:" text={ptDateTime(dados?.data_recebido)} />
          {dados && 'ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.ativo} />} />}
        </TableBody>
      </Table>
      <Stack>
        <Divider sx={{ my: 1 }} />
        <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
          <Resgisto label="Criado" em={dados?.criado_em} por={dados?.criador || dados?.feito_por} />
          <Resgisto
            label="Modificado"
            por={dados?.modificador || dados?.modificado_por}
            em={dados?.modificado_em || dados?.ultima_modificacao}
          />
          <Resgisto label="Entrega" em={dados?.entrega_em} por={dados?.entrega_por} />
        </Stack>
      </Stack>
    </>
  ) : (
    <SearchNotFoundSmall message="Nenhuma informação disponível..." />
  );
}
