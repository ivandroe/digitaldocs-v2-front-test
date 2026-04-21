import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
// utils
import { useDispatch } from '@/redux/store';
import { createInSuporte } from '@/redux/slices/suporte-cliente';
// components
import { DefaultAction } from '@/components/Actions';
import { ActionForm, MessageForm } from './form-ticket';
import { DialogConfirmar } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

const ACTION_BUTTONS = [
  { key: 'change-status', icon: 'editar', label: 'Estado', tooltip: 'Alterar estado do ticket' },
  { key: 'add-message', icon: 'adicionar', label: 'Mensagem', tooltip: 'Adicionar mensagem' },
  { key: 'change-department', icon: null, label: 'Encaminhar', tooltip: 'Encaminhar para outro departamento' },
];

const ADMIN_BUTTONS = [
  { key: 'change-subject', label: 'Assunto', icon: 'editar', tooltip: 'Alterar assunto do ticket' },
  { key: 'assign', label: 'Atribuir', color: 'info', tooltip: 'Atribuir ticket a um colaborador' },
];

// ---------------------------------------------------------------------------------------------------------------------

export default function Actions({ dados, onClose, isAdmin, refetch }) {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const canChange = dados?.status === 'OPEN' || dados?.status === 'IN_PROGRESS';

  const openModal = (key) => setModal(key);
  const closeModal = () => setModal('');

  return (
    <>
      <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1} justifyContent="center" sx={{ width: 1 }}>
        {canChange && (
          <>
            {ACTION_BUTTONS.map(({ key, icon, label, tooltip }) => (
              <Tooltip key={key} title={tooltip} arrow placement="top">
                <DefaultAction small button icon={icon} label={label} onClick={() => openModal(key)} />
              </Tooltip>
            ))}
            {isAdmin &&
              ADMIN_BUTTONS.map(({ key, icon, label, color, tooltip }) => (
                <Tooltip key={key} title={tooltip} arrow placement="top">
                  <DefaultAction small button icon={icon} label={label} color={color} onClick={() => openModal(key)} />
                </Tooltip>
              ))}
          </>
        )}

        {isAdmin && dados?.status === 'DRAFT' && (
          <DefaultAction small button label="Lembrete" color="inherit" onClick={() => openModal('lembrete')} />
        )}
      </Stack>

      {modal === 'add-message' && <MessageForm dados={dados} onClose={closeModal} />}
      {modal && modal !== 'add-message' && modal !== 'lembrete' && (
        <ActionForm item={modal} dados={dados} onClose={closeModal} closeTicket={onClose} refetch={refetch} />
      )}
      {modal === 'lembrete' && (
        <DialogConfirmar
          color="success"
          title="Lembrete"
          onClose={onClose}
          desc="enviar um lembrete de validação do email para registo do ticket"
          handleOk={() => {
            const params = { msg: 'Lembrete enviado', onClose: () => closeModal() };
            dispatch(createInSuporte('lembrete', null, { id: dados?.id, ...params }));
          }}
        />
      )}
    </>
  );
}
