import { useNavigate } from 'react-router-dom';
// redux
import { useSelector } from '@/redux/store';
import { PATH_DIGITALDOCS } from '@/routes/paths';
import { getSuccess, deleteItem } from '@/redux/slices/gaji9';
// components
import DialogPreviewDoc, { DialogConfirmar } from '@/components/CustomDialog';
import CreditoForm, { PreviewForm, IntervenienteForm } from '../forms/form-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function ModaisCredito({ id, versao, dispatch, onClose }) {
  const navigate = useNavigate();
  const { previewFile, modalGaji9, isLoadingDoc, selectedItem, isSaving } = useSelector((state) => state.gaji9);

  const afterDel = () => {
    onClose('', null);
    navigate(`${PATH_DIGITALDOCS.gaji9.root}`);
  };

  const eliminarInterveniente = () => {
    const params = { numero: selectedItem?.participante_id, getItem: 'credito', onClose };
    dispatch(deleteItem('intervenientes', { id, msg: 'Interveniente eliminado', ...params }));
  };

  return (
    <>
      {(isLoadingDoc || previewFile) && (
        <DialogPreviewDoc
          onClose={() => {
            onClose('', null);
            dispatch(getSuccess({ item: 'previewFile', dados: '' }));
          }}
          params={{ url: previewFile, titulo: selectedItem?.titulo, isLoading: isLoadingDoc }}
        />
      )}

      {modalGaji9 === 'form-credito' && <CreditoForm onClose={onClose} />}
      {modalGaji9 === 'form-interveniente' && <IntervenienteForm id={id} onClose={onClose} versao={versao} />}

      {(modalGaji9 === 'preview-contrato' || modalGaji9 === 'gerar-contrato') && (
        <PreviewForm item={modalGaji9} onClose={onClose} />
      )}

      {modalGaji9 === 'eliminar-credito' && (
        <DialogConfirmar
          onClose={onClose}
          isSaving={isSaving}
          desc="eliminar este crédito"
          handleOk={() => dispatch(deleteItem('credito', { id, msg: 'Crédito eliminado', onClose: afterDel }))}
        />
      )}

      {modalGaji9 === 'eliminar-interv' && (
        <DialogConfirmar
          onClose={onClose}
          isSaving={isSaving}
          handleOk={eliminarInterveniente}
          desc="eliminar este interveniente"
        />
      )}
    </>
  );
}
