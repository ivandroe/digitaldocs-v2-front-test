import { useMemo, useState, useEffect, useRef } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchIcon from '@mui/icons-material/Search';
// utils
import { useSelector } from '@/redux/store';
import useSettings from '@/hooks/useSettings';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import Page from '@/components/Page';
import TabsWrapper from '@/components/TabsWrapper';
// sections
import AcessoSuporte from '../acesso-suporte';
import Dashboard from '../components/dashboard';
import Tickets from '../components/lista-pedidos';
import Configuracoes from '../components/configuracoes';
import Avaliacoes from '../components/lista-pedidos/avaliacoes';
import ProcurarPedidos from '../components/lista-pedidos/procurar-pedidos';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageGestaoSuporteCliente() {
  const { themeStretch } = useSettings();
  const { departamentos, utilizador } = useSelector((state) => state.suporte);
  const hasInitialized = useRef(false);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(() => {
    const isAdmin = utilizador?.role === 'ADMINISTRATOR';
    const storedId = isAdmin ? localStorage.getItem('departmentTicket') : null;
    return storedId || utilizador?.department_id || null;
  });

  useEffect(() => {
    if (hasInitialized.current || !utilizador?.department_id) return;
    hasInitialized.current = true;

    const isAdmin = utilizador.role === 'ADMINISTRATOR';
    const storedId = isAdmin ? localStorage.getItem('departmentTicket') : null;
    setSelectedDepartmentId(storedId || utilizador.department_id);
  }, [utilizador]);

  const department = useMemo(
    () => departamentos?.find(({ id }) => Number(id) === Number(selectedDepartmentId)) ?? null,
    [departamentos, selectedDepartmentId]
  );

  const setDepartment = (dep) => {
    if (utilizador?.role === 'ADMINISTRATOR') localStorage.setItem('departmentTicket', dep?.id);
    setSelectedDepartmentId(dep?.id ?? null);
  };

  const tabsList = useMemo(
    () => [
      {
        value: 'Tickets',
        component: <Tickets department={department} setDepartment={setDepartment} utilizador={utilizador} />,
      },
      ...(utilizador?.role === 'ADMINISTRATOR' || utilizador?.role === 'COORDINATOR'
        ? [{ value: 'Dashboard', component: <Dashboard params={{ department, setDepartment, departamentos }} /> }]
        : []),
      { value: 'Avaliações', component: <Avaliacoes /> },
      ...(utilizador?.role === 'ADMINISTRATOR'
        ? [{ value: 'Configurações', component: <Configuracoes role={utilizador?.role} /> }]
        : []),
      { value: 'Procurar', icon: <SearchIcon sx={{ width: 20, height: 20 }} />, component: <ProcurarPedidos /> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [department, utilizador, departamentos]
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Tickets', 'tab-suporte-cliente');

  return (
    <Page title="Suporte ao cliente | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper tab={tab} setTab={setTab} tabsList={tabsList} title="Suporte ao cliente" />
        <AcessoSuporte>
          <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
        </AcessoSuporte>
      </Container>
    </Page>
  );
}
