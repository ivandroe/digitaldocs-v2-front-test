import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// utils
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
//
import { getFromGaji9 } from '@/redux/slices/gaji9';
import { useDispatch, useSelector } from '@/redux/store';
// components
import { TabsWrapperSimple } from '@/components/TabsWrapper';
//
import Kpis from './kpis';
import VisaoGeral from './visao-geral';
import PareceresCredito from './pareceres';
import FichaAnalise from './ficha-parecer';
import MetadadosCredito from './metadados/credito';
import TableGarantias from './garantias/table-garantias';

// ---------------------------------------------------------------------------------------------------------------------

export default function InfoCredito({ dados }) {
  const dispatch = useDispatch();
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);

  const modificar = dados?.estado?.preso && dados?.estado?.atribuidoAMim;
  const emAnalise = meusAmbientes?.find(({ id }) => id === dados?.estado?.estado_id)?.isanalise_credito || false;

  useEffect(() => {
    dispatch(getFromGaji9('tiposImoveis'));
    dispatch(getFromGaji9('tiposSeguros'));
    dispatch(getFromGaji9('garantias-selecionaveis', { item: 'tiposGarantias' }));
  }, [dispatch]);

  const tabsList = [
    { value: 'Visão geral', component: <VisaoGeral dados={dados} modificar={modificar} /> },
    {
      value: 'Condições financeiras',
      component: (
        <MetadadosCredito
          modificar={modificar}
          dados={dados?.gaji9_metadados}
          outros={{ prazo: dados?.prazo_amortizacao || '', taxa_juro: dados?.taxa_juro || '' }}
          ids={{
            creditoId: dados?.id,
            linhaId: dados?.linha_id,
            processoId: dados?.processoId,
            componenteId: dados?.componente_id,
          }}
        />
      ),
    },
    {
      value: 'Garantias',
      component: (
        <TableGarantias
          dados={dados?.garantias ?? []}
          outros={{ modificar, creditoId: dados?.id, processoId: dados?.processoId }}
        />
      ),
    },
    ...(modificar && emAnalise ? [{ value: 'Ficha de análise', component: <FichaAnalise /> }] : []),
    { value: 'Pareceres', component: <PareceresCredito infoCredito /> },
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Visão geral', '');

  return (
    <Stack sx={{ p: { xs: 1, sm: 3 } }}>
      <Kpis credito={dados} />
      <TabsWrapperSimple sx={{ mb: 3 }} tabsList={tabsList} tab={tab} setTab={setTab} />
      <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
    </Stack>
  );
}
