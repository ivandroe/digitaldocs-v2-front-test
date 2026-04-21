// utils
import { dispatch, useSelector } from '@/redux/store';
import { deleteItem } from '@/redux/slices/digitaldocs';
// components
import EnquadramentoForm from './form-enquadramento';
import { DialogConfirmar } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export function Enquadramentos({ id, modal, openModal }) {
  const { fluxosEnquadramento } = useSelector((state) => state.parametrizacao);
  const { isSaving, processo, selectedItem } = useSelector((state) => state.digitaldocs);

  return (
    <>
      {modal === 'form-enquadramento' && (
        <EnquadramentoForm
          id={id}
          isSaving={isSaving}
          onClose={openModal}
          fluxos={filtrarFluxosNaoUtilizados(fluxosEnquadramento, processo?.enquadramentos)}
        />
      )}

      {modal === 'eliminar-enquadramento' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => openModal()}
          desc="eliminar este enquadramento deste processo"
          handleOk={() => {
            const params = { id: selectedItem?.id, processoId: id, msg: 'Enquadramento eliminado' };
            dispatch(deleteItem('enquadramento', { ...params, onClose: () => openModal('') }));
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function filtrarFluxosNaoUtilizados(origem, fluxos) {
  const idsExistentes = new Set(fluxos.map((item) => item.fluxo_id));
  return origem.filter((item) => !idsExistentes.has(item.id)).map((item) => ({ id: item.id, label: item.assunto }));
}
