import * as Yup from 'yup';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useDispatch } from '@/redux/store';
import { createItem } from '@/redux/slices/digitaldocs';
// components
import { DialogButons } from '@/components/Actions';
import { FormProvider, RHFAutocompleteObj } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function EnquadramentoForm({ id, fluxos, isSaving, onClose }) {
  const dispatch = useDispatch();

  const formSchema = Yup.object().shape({ fluxo: Yup.mixed().required('Fluxo não pode ficar vazio') });
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues: { fluxo: null } });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async () => {
    const params = { id, msg: 'Enquadramento realizado', onClose };
    dispatch(createItem('enquadramento', JSON.stringify({ fluxo_id: values?.fluxo?.id }), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enquadrar processo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="fluxo" label="Fluxo" options={fluxos} />
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
