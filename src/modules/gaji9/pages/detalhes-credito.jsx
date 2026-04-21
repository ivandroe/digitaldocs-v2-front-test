import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import useSettings from '@/hooks/useSettings';
import { usePermissao } from '@/hooks/useAcesso';
import { PATH_DIGITALDOCS } from '@/routes/paths';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getFromGaji9, setModal, getSuccess } from '@/redux/slices/gaji9';
// components
import Page from '@/components/Page';
import { DefaultAction } from '@/components/Actions';
import { SearchNotFound404 } from '@/components/table';
import { SkeletonEntidade } from '@/components/skeleton';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
//
import {
  TabGarantias,
  TabDadosExtra,
  TabFinanceiro,
  TabOperacional,
  TabParticipantes,
} from '../components/detalhes-credito';
import AcessoGaji9 from './acesso-gaji9';
import ModaisCredito from '../components/detalhes-credito/modais';
import TableContratos from '../components/detalhes-credito/contratos';
import HeroCreditoDetail from '../components/detalhes-credito/hero-info';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { temPermissao, isGerente } = usePermissao();
  const permissao = isGerente || temPermissao(['READ_CREDITO']);

  const { credito, isLoading } = useSelector((state) => state.gaji9);
  const { ativo = false, contratado = false, numero_proposta = '' } = credito || {};
  const { participantes = [], garantias = [], versao_schema = 1, info_extra_v2 = null } = credito || {};
  const canChange = ativo && !contratado && (isGerente || temPermissao(['CREATE_CREDITO']));

  useEffect(() => {
    dispatch(getSuccess({ item: 'contratos', dados: [] }));
    if (id && permissao) dispatch(getFromGaji9('credito', { id, reset: { dados: null } }));

    return () => {
      dispatch(getSuccess({ item: 'credito', dados: null }));
    };
  }, [dispatch, id, permissao]);

  const openForm = (item, dados) => dispatch(setModal({ item: item || '', dados: dados || null }));

  const tabsList = [
    { value: 'Financeiro', component: <TabFinanceiro credito={credito || {}} /> },
    {
      value: 'Participantes',
      count: participantes?.length,
      component: (
        <TabParticipantes
          openForm={openForm}
          canChange={canChange}
          versao={versao_schema}
          participantes={participantes || []}
        />
      ),
    },
    {
      value: 'Garantias',
      count: garantias?.length,
      component: (
        <TabGarantias
          openForm={openForm}
          garantias={garantias}
          participantes={participantes}
          canChange={canChange && versao_schema === 1}
        />
      ),
    },
    ...(versao_schema === 2 && info_extra_v2
      ? [{ value: 'Dados extra', component: <TabDadosExtra info={info_extra_v2} /> }]
      : []),
    { value: 'Operacional', component: <TabOperacional credito={credito || {}} /> },
    { value: 'Contratos', component: <TableContratos id={id} /> },
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Financeiro', '');

  return (
    <Page title="Crédito | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={numero_proposta ? `Nº proposta: ${numero_proposta}` : 'Detalhes do crédito'}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'GAJ-i9- Créditos', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: numero_proposta ?? 'Detalhes do crédito' },
          ]}
          action={
            ativo &&
            !contratado && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {(isGerente || temPermissao(['UPDATE_CREDITO'])) && (
                  <>
                    <DefaultAction small label="Editar" onClick={() => openForm('form-credito')} />
                    <DefaultAction small label="Eliminar" onClick={() => openForm('eliminar-credito')} />
                  </>
                )}
                {(isGerente || temPermissao(['READ_CONTRATO'])) && (
                  <DefaultAction small button label="Pré-visualizar" onClick={() => openForm('preview-contrato')} />
                )}
                {(isGerente || temPermissao(['CREATE_CONTRATO'])) && (
                  <DefaultAction small button label="Gerar contrato" onClick={() => openForm('gerar-contrato')} />
                )}
              </Stack>
            )
          }
        />

        <AcessoGaji9 item="credito">
          {isLoading && !credito ? (
            <SkeletonEntidade />
          ) : (
            <>
              {!isLoading && !credito ? (
                <SearchNotFound404 message="Crédito não encontrado..." />
              ) : (
                <>
                  <Stack spacing={3}>
                    <HeroCreditoDetail credito={credito || {}} />
                    <TabsWrapperSimple tabsList={tabsList} tab={tab} setTab={setTab} />
                    {tabsList?.find(({ value }) => value === tab)?.component}
                  </Stack>

                  <ModaisCredito id={id} dispatch={dispatch} onClose={openForm} versao={versao_schema} />
                </>
              )}
            </>
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
