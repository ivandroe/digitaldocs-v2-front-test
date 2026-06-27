import { useMemo } from 'react';
// utils
import { useDispatch } from '@/redux/store';
import { setModal } from '@/redux/slices/suporte-cliente';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// Components
import { DefaultAction } from '@/components/Actions';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
//
import TableFilaEspera from './table-fila-espera';

// ---------------------------------------------------------------------------------------------------------------------

export default function FilaEspera() {
  const dispatch = useDispatch();

  const tabsList = useMemo(
    () => [
      { value: 'Horário', component: <TableFilaEspera item="horario" /> },
      { value: 'Exceções', component: <TableFilaEspera item="excecoes" /> },
    ],
    []
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Horário', '');

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={`Fila de Espera - ${tab}`}
        action={<DefaultAction button label="Adicionar" onClick={() => dispatch(setModal({ modal: 'add' }))} />}
      />
      <TabsWrapperSimple tab={tab} tabsList={tabsList} setTab={setTab} />
      {tabsList?.find(({ value }) => value === tab)?.component}
    </>
  );
}
