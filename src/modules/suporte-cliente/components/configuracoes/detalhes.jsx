import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// redux
import { dispatch } from '@/redux/store';
import { useSelector } from '@/redux/store';
import { deleteInSuporte } from '@/redux/slices/suporte-cliente';
// components
import { LabelRole } from '../../utils';
import Markdown from '@/components/Markdown';
import { TextItem } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { UserDepartamentForm } from './form-configuracoes';
import { DialogTitleAlt, DialogConfirmar } from '@/components/CustomDialog';
import { SearchNotFoundSmall, TableSearchNotFound } from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesConfig({ onClose, item, editarItem }) {
  const { selectedItem, isLoading, isSaving } = useSelector((s) => s.suporte);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={item === 'utilizadores' ? 'sm' : 'md'}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        onClose={onClose}
        title={
          item === 'promts' ? 'Prompt' : selectedItem?.subject || selectedItem?.question || 'Detalhes do utilizador'
        }
      />

      <DialogContent>
        {item === 'utilizadores' ? (
          <DadosUtilizador dados={selectedItem} isSaving={isSaving} />
        ) : (
          <>
            {isLoading ? (
              <Skeleton sx={{ height: 300, transform: 'none', mt: 1 }} />
            ) : (
              <>
                {!selectedItem ? (
                  <SearchNotFoundSmall message="Item não disponível..." />
                ) : (
                  <Stack sx={item === 'prompts' ? null : { p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    {item === 'respostas' ? (
                      <Markdown>{selectedItem?.content}</Markdown>
                    ) : (
                      <Typography variant="body2" sx={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>
                        {selectedItem?.prompt || selectedItem?.response}
                      </Typography>
                    )}
                  </Stack>
                )}
              </>
            )}
            {item !== 'prompts' && (
              <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                <DefaultAction small button label="Editar" onClick={() => editarItem('update', selectedItem)} />
              </Stack>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} // -------------------------------------------------------------------------------------------------------------------

function DadosUtilizador({ dados, isSaving }) {
  const [item, setItem] = useState(null);

  const confirmarEliminar = () => {
    const params = { msg: 'Departamento eliminado', getItem: 'selectedItem', onClose: () => setItem(null) };
    dispatch(deleteInSuporte('departamento-ut', { userId: dados?.id, id: item?.id, ...params }));
  };

  return (
    <Stack spacing={1}>
      <TextItem title="Nome" text={dados?.nome} />
      <TextItem title="Departamento" text={dados?.department_name} />
      <TextItem title="Função" label={<LabelRole label={dados?.role} />} />
      <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ pt: 1 }}>
        <Typography variant="overline">Outros departamentos</Typography>
        <DefaultAction small button label="Adicionar" onClick={() => setItem({ modal: 'form' })} />
      </Stack>
      <Divider />
      <Table size="small" sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Departamento</TableCell>
            <TableCell width={10}></TableCell>
          </TableRow>
        </TableHead>
        {dados?.departments?.length === 0 ? (
          <TableSearchNotFound height={99} message="Nenhum outro departamento adicionado..." />
        ) : (
          <TableBody>
            {dados?.departments?.map((row, index) => (
              <TableRow hover key={`department_${index}`}>
                <TableCell>{row?.name}</TableCell>
                <TableCell>
                  <DefaultAction small label="Eliminar" onClick={() => setItem({ modal: 'eliminar', ...row })} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {item?.modal === 'eliminar' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setItem(null)}
          handleOk={() => confirmarEliminar()}
          desc="eliminar este departamento do colaborador selecionado"
        />
      )}
      {item?.modal === 'form' && <UserDepartamentForm onClose={() => setItem(null)} dados={dados} />}
    </Stack>
  );
}
