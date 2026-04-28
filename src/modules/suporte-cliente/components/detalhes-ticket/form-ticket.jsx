import * as Yup from 'yup';
import { useMemo } from 'react';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import useAnexos from '@/hooks/useAnexos';
import { applySort, getComparator } from '@/hooks/useTable';
import { useSelector, useDispatch } from '@/redux/store';
import { createInSuporte, updateInSuporte } from '@/redux/slices/suporte-cliente';
// components
import { DialogButons } from '@/components/Actions';
import { RHFSwitch, FormProvider, RHFTextField, RHFAutocompleteObj, RHFUploadMultiFile } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export function ActionForm({ dados, item = '', onClose, closeTicket, refetch }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, departamentos, utilizadores, assuntos } = useSelector((state) => state.suporte);

  const title =
    (item === 'assign' && 'Atribuir ticket a um colaborador') ||
    (item === 'change-subject' && 'Alterar assunto do ticket') ||
    (item === 'change-department' && 'Encaminhar para outro departamento') ||
    'Alterar estado do ticket';
  const label =
    (item === 'assign' && 'Colaborador') ||
    (item === 'change-subject' && 'Assunto') ||
    (item === 'change-department' && 'Departamento') ||
    'Estado';

  const itemList = useMemo(
    () => buildItemList({ item, colaboradores, utilizadores, departamentos, assuntos, dados }),
    [item, colaboradores, utilizadores, departamentos, assuntos, dados]
  );

  const formSchema = Yup.object().shape({ item: Yup.mixed().required().label(label) });
  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { item: null, resolved: false, message: '', to_client: false, attachments: [] },
  });
  const { control, setValue, handleSubmit } = methods;
  const values = useWatch({ control });
  const { dropMultiple, removeOne } = useAnexos('', 'attachments', setValue, values?.attachments);

  const onSubmit = async (values) => {
    const formData = new FormData();
    const resolved = values?.item?.id === 'RESOLVED';
    const hasMsg = values?.message && values.message.trim() !== '';
    const value = resolved ? { id: 'CLOSED', label: 'Fechado' } : values?.item;

    if (hasMsg) {
      const messagePayload = { content: values.message, visibility: values?.to_client ? 'BOTH' : 'INTERNAL' };
      formData.append('message', new Blob([JSON.stringify(messagePayload)], { type: 'application/json' }));
      values?.attachments?.forEach((file) => formData.append('attachments', file));
    }

    const isAssunto = item === 'change-subject';
    const msg =
      (isAssunto && 'Assunto alterado') ||
      (item === 'assign' && 'Ticket atribuido') ||
      (item === 'change-department' && 'Ticket encaminhado') ||
      'Estado alterado';
    const params = { id: dados?.id, status: dados?.status, getItem: isAssunto ? 'selectedItem' : '' };
    const params1 = { patch: true, msg, value, resolved, message: hasMsg ? formData : null, refetch, ...params };

    dispatch(updateInSuporte(item, null, { ...params1, onClose: isAssunto ? onClose : closeTicket }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={item === 'assign' ? 'xs' : 'sm'}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="item" label={label} options={itemList} />
            {item !== 'assign' && (
              <>
                <RHFTextField name="message" label="Mensagem" multiline rows={4} />
                {values?.message && values.message.trim() !== '' && (
                  <>
                    <RHFUploadMultiFile small name="attachments" onDrop={dropMultiple} onRemove={removeOne} />
                    <RHFSwitch name="to_client" label="Mostrar mensagem ao cliente" />
                  </>
                )}
              </>
            )}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function MessageForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.suporte);

  const formSchema = Yup.object().shape({ message: Yup.string().required().label('Mensagem') });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { message: '', to_client: false, attachments: [] },
  });
  const { control, setValue, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async (values) => {
    const formData = new FormData();
    const message = { content: values?.message, visibility: values?.to_client ? 'BOTH' : 'INTERNAL' };
    formData.append('message', new Blob([JSON.stringify(message)], { type: 'application/json' }));
    values?.attachments?.forEach((file) => formData.append('attachments', file));

    const params = { id: dados?.id, item: 'messages', item1: 'selectedItem', msg: 'Mensagem adicionada' };
    dispatch(createInSuporte('add-message', formData, { ...params, status: dados?.status, onClose }));
  };

  const { dropMultiple, removeOne } = useAnexos('', 'attachments', setValue, values?.attachments);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar mensagem</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="message" label="Mensagem" multiline rows={4} />
            <RHFUploadMultiFile small name="attachments" onDrop={dropMultiple} onRemove={removeOne} />
            <RHFSwitch name="to_client" label="Mostrar mensagem ao cliente" />
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function buildItemList({ item, colaboradores, utilizadores, departamentos, assuntos, dados }) {
  const colaboradoresMap = new Map(colaboradores?.map((c) => [c.id, c.nome]));
  const { status = '', current_department_id: currentDept = '' } = dados || {};

  const usersList = utilizadores
    ?.filter((ut) => ut?.department_id === currentDept)
    ?.map((ut) => ({ id: ut.id, label: colaboradoresMap.get(ut.employee_id) || ut.username }));

  const departsList = departamentos
    ?.filter((dep) => dep.id !== currentDept)
    ?.map((dep) => ({ id: dep.id, label: dep.name }));

  let itemList;

  switch (item) {
    case 'assign':
      itemList = usersList || [];
      break;

    case 'change-department':
      itemList = departsList || [];
      break;

    case 'change-subject':
      itemList = assuntos
        ?.filter(({ name }) => name !== dados?.subject_name)
        ?.map((row) => ({ ...row, label: row?.name }));
      break;

    case 'change-status':
      itemList =
        status === 'IN_PROGRESS'
          ? [
              { id: 'RESOLVED', label: 'Resolvido' },
              { id: 'CLOSED', label: 'Encerrado (Não Resolvido)' },
            ]
          : [
              { id: 'IN_PROGRESS', label: 'Em análise' },
              { id: 'RESOLVED', label: 'Resolvido' },
              { id: 'CLOSED', label: 'Encerrado (Não Resolvido)' },
            ];
      break;

    default:
      itemList = [];
  }

  return item === 'change-status' ? itemList : applySort(itemList, getComparator('asc', 'label'));
}
