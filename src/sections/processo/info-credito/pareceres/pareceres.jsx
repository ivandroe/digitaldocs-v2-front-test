import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { ptDateTime } from '@/utils/formatTime';
import { useSelector, useDispatch } from '@/redux/store';
import { fCurrency, fPercent } from '@/utils/formatNumber';
import { pertencoEstadoId, gestorEstado } from '@/utils/validarAcesso';
import { setModal, getInfoProcesso } from '@/redux/slices/digitaldocs';
// components
import Label from '@/components/Label';
import { DefaultAction } from '@/components/Actions';
import { ColaboradorInfo, Criado } from '@/components/Panel';
import { SearchNotFoundSmall } from '@/components/table/SearchNotFound';
//
import ResumoCredito from './resumo-credito';
import FormParecer, { CondicoesForm } from '../../form/credito/form-parecer';

// ---------------------------------------------------------------------------------------------------------------------

export default function PareceresCredito({ infoCredito = false }) {
  const dispatch = useDispatch();
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { processo, isOpenModal } = useSelector((state) => state.digitaldocs);

  const estado = useMemo(() => processo?.estado, [processo?.estado]);
  const gestor = useMemo(() => gestorEstado(meusAmbientes, estado?.estado_id), [meusAmbientes, estado?.estado_id]);

  useEffect(() => {
    if (infoCredito) dispatch(getInfoProcesso('ht_parecer_cr', { id: processo?.id }));
  }, [dispatch, infoCredito, processo?.id]);

  useEffect(() => {
    if (estado?.decisor) dispatch(getInfoProcesso('condicao_aprovacao', { id: processo?.id }));
  }, [dispatch, processo?.id, estado?.decisor]);

  const acessoParecer = useMemo(
    () => estado?.decisor && pertencoEstadoId(meusAmbientes, estado?.estado_id),
    [meusAmbientes, estado?.decisor, estado?.estado_id]
  );
  const pareceresAtuais = useMemo(() => estado?.pareceres_cr || [], [estado?.pareceres_cr]);
  const historicoPareceres = useMemo(() => processo?.ht_parecer_cr || [], [processo?.ht_parecer_cr]);

  const openModal = (modal, dados) => dispatch(setModal({ modal: modal ?? '', dados: dados ?? null }));

  const boxNoDados = (atual) => (
    <Box sx={{ bgcolor: 'background.neutral', borderRadius: 2, p: atual ? 0 : 2 }}>
      <SearchNotFoundSmall message="Ainda não foi adicionado nenhum parecer..." xs={atual} />
    </Box>
  );

  return (
    <Stack spacing={3}>
      {!infoCredito && <ResumoCredito credito={processo?.credito} mutuarios={processo?.titular} />}

      {estado?.decisor && (
        <Stack direction="column" justifyContent="center" spacing={2}>
          {infoCredito && <ParecersLabel dados={{ estado, acessoParecer, pareceresAtuais, openModal }} />}

          {processo?.condicao_aprovacao && (
            <CondicoesAprovacao
              dados={processo?.condicao_aprovacao}
              onEdit={
                gestor && estado?.nivel_decisao === processo?.credito?.nivel_decisao
                  ? () => openModal('condicoes-aprovacao')
                  : null
              }
            />
          )}

          {!infoCredito && <SeccaoLabel titulo="Pareceres" />}

          {pareceresAtuais?.length > 0
            ? pareceresAtuais?.map((row) => (
                <Parecer dados={row} openModal={openModal} key={`atual_${row?.id}`} acessoParecer={acessoParecer} />
              ))
            : boxNoDados(true)}
        </Stack>
      )}

      {infoCredito && historicoPareceres?.length > 0 && (
        <Stack spacing={3}>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Histórico
          </Typography>
          <Divider sx={{ mt: '5px !important', mb: '-15px !important' }} />
          {agruparPorEstado(historicoPareceres)?.map((row) => (
            <Stack key={row?.estado_id}>
              <Typography variant="subtitle1" sx={{ pb: 1 }}>
                {row?.estado}
              </Typography>
              <Stack spacing={2}>
                {row?.pareceres?.map((parecer) => (
                  <Parecer historico dados={parecer} openModal={openModal} key={`historico_${parecer?.id}`} />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}

      {infoCredito && !estado?.decisor && historicoPareceres?.length === 0 && boxNoDados()}
      {!infoCredito && !estado?.decisor && boxNoDados()}

      {isOpenModal === 'parecer-cr' && (
        <FormParecer
          gestor={gestor}
          pId={processo?.id}
          onClose={() => openModal()}
          fluxoId={processo?.fluxo_id}
          estadoId={estado?.estado_id}
        />
      )}
      {isOpenModal === 'condicoes-aprovacao' && (
        <CondicoesForm
          onClose={() => openModal()}
          dados={processo?.condicao_aprovacao}
          ids={{ id: processo?.id, creditoId: processo?.credito?.id }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Parecer({ dados, acessoParecer = false, historico = false, openModal }) {
  const [expand, setExpand] = useState(false);
  const { colaboradores, perfilId } = useSelector((state) => state.intranet);

  const { perfil_id: perfil, favoravel, parecer, dado_em: em = '' } = dados;
  const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === perfil);

  return (
    <Stack>
      <Accordion expanded={expand} onChange={(event, isExpanded) => setExpand(isExpanded)}>
        <AccordionSummary sx={{ minHeight: '65px !important' }}>
          <Stack
            useFlexGap
            spacing={2}
            flexWrap="wrap"
            direction="row"
            alignItems="center"
            sx={{ flexGrow: 1 }}
            justifyContent="space-between"
          >
            <ColaboradorInfo
              foto={colaborador?.foto_anexo}
              labelAlt={colaborador?.uo_label}
              presence={colaborador?.presence}
              nome={colaborador?.nome || `Perfil ID: ${perfil}`}
              other={
                <Box sx={{ mt: 0.25 }}>
                  <Label color={favoravel ? 'success' : 'error'}>
                    {favoravel ? 'Parecer favorável' : 'Parecer não favorável'}
                  </Label>
                </Box>
              }
            />
            {acessoParecer && perfil === perfilId && (
              <Box sx={{ pr: 1 }} onClick={(e) => e.stopPropagation()}>
                <DefaultAction small label="EDITAR" color="warning" onClick={() => openModal('parecer-cr', dados)} />
              </Box>
            )}
            {historico && <Criado tipo="data" caption value={ptDateTime(em)} />}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ pt: 1, textAlign: 'justify', whiteSpace: 'pre-line' }}>{parecer}</Typography>
          {!historico && (
            <Typography sx={{ pt: 1, typography: 'body2', color: 'text.secondary' }}>{ptDateTime(em)}</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function ParecersLabel({ dados }) {
  const { perfilId } = useSelector((state) => state.intranet);
  const { estado, acessoParecer, pareceresAtuais, openModal } = dados;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="end">
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Pareceres: {estado?.estado}
        </Typography>
        {acessoParecer && !pareceresAtuais?.find(({ perfil_id: pid }) => perfilId === pid) && (
          <DefaultAction small button label="Adicionar" variant="contained" onClick={() => openModal('parecer-cr')} />
        )}
      </Stack>
      <Divider sx={{ mt: '5px !important', mb: '-10px !important' }} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CondicoesAprovacao({ dados, onEdit }) {
  const theme = useTheme();

  return (
    <Card sx={{ boxShadow: theme.customShadows.cardAlt, borderRadius: 1, overflow: 'hidden' }}>
      <CardHeader
        title="Condições de aprovação"
        action={onEdit && <DefaultAction small label="Editar" onClick={onEdit} />}
        titleTypographyProps={{ variant: 'subtitle2', sx: { color: 'success.main', textTransform: 'uppercase' } }}
        sx={{ py: 1.25, px: 2, bgcolor: 'background.neutral' }}
      />
      <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
        <Box gap={2} display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }}>
          <Condicao label="Montante" value={fCurrency(dados?.montante)} />
          <Condicao label="Taxa de juro" value={fPercent(dados?.taxa_juro)} />
          <Condicao label="Prazo" value={`${dados?.prazo} meses`} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SeccaoLabel({ titulo }) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Divider sx={{ mt: '5px !important', mb: '-10px !important' }} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Condicao({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function agruparPorEstado(pareceres) {
  const mapa = pareceres.reduce((acc, item) => {
    if (!acc[item.estado_id]) acc[item.estado_id] = { estado_id: item.estado_id, estado: item.estado, pareceres: [] };
    acc[item.estado_id].pareceres.push(item);
    return acc;
  }, {});

  const estados = Object.values(mapa).map((grupo) => ({
    ...grupo,
    pareceres: grupo.pareceres.sort((a, b) => b.id - a.id),
  }));

  estados.sort((a, b) => b.pareceres[0].id - a.pareceres[0].id);

  return estados;
}
