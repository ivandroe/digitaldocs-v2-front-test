// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector } from '@/redux/store';
// components
import Markdown from '@/components/Markdown';
import { DefaultAction } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { SearchNotFoundSmall } from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesPrompt({ onClose, item, editarItem }) {
  const { selectedItem, isLoading } = useSelector((s) => s.suporte);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        sx={{ mb: 2 }}
        onClose={onClose}
        title={item === 'promts' ? 'Prompt' : selectedItem?.subject || selectedItem?.question}
      />

      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
}
