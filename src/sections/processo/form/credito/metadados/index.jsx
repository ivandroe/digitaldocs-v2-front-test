import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// redux
import { resetDados } from '@/redux/slices/stepper';
import { useSelector, useDispatch } from '@/redux/store';
import { getSuccess } from '@/redux/slices/parametrizacao';
// components
import Steps from '@/components/Steps';
import { FormLoading } from '@/components/skeleton';
import { DialogTitleAlt } from '@/components/CustomDialog';
//
import { Comissoes } from './comissoes';
import { Entidades } from './entidades';
import { BensFinanciados } from './bens-financiados';
import { RegimeEspecial, Condicoes, Taxas } from './regime-condicoes-taxas';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCreditoForm({ onClose, dados = null, outros, ids }) {
  const dispatch = useDispatch();
  const { activeStep, dadosStepper } = useSelector((state) => state.stepper);
  const { precario, isLoading } = useSelector((state) => state.parametrizacao);

  const handleClose = useCallback(() => {
    onClose();
    dispatch(resetDados());
    dispatch(getSuccess({ item: 'precario', dados: null }));
  }, [onClose, dispatch]);

  const commonProps = {
    dispatch,
    dadosStepper,
    dados: { ...dados, ...outros },
    precario: dados ? null : precario?.precario,
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={handleClose}
        title="Outras informações do crédito"
        content={
          <Steps
            sx={{ mt: 3, mb: 0 }}
            activeStep={activeStep}
            steps={['Regime', 'Condições', 'Taxas', 'Comissões', 'Bens financiados', 'Entidade']}
          />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {isLoading ? (
          <FormLoading rows={1} />
        ) : (
          <>
            {activeStep === 0 && <RegimeEspecial {...commonProps} onClose={handleClose} />}
            {activeStep === 1 && <Condicoes {...commonProps} />}
            {activeStep === 2 && <Taxas {...commonProps} />}
            {activeStep === 3 && <Comissoes {...commonProps} />}
            {activeStep === 4 && <BensFinanciados {...commonProps} />}
            {activeStep === 5 && <Entidades {...commonProps} ids={ids} onClose={handleClose} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Title({ title, action = null }) {
  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="flex-end"
      justifyContent="space-between"
      sx={{ py: 0.5, borderBottom: 1, textAlign: 'center', borderColor: 'divider' }}
    >
      <Box sx={{ typography: 'overline', color: 'text.secondary' }}>{title}</Box>
      {action}
    </Stack>
  );
}
