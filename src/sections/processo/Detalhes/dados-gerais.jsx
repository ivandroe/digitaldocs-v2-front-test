import { useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// utils
import { useSelector } from '@/redux/store';
import { fluxosGmkt } from '@/utils/validarAcesso';
import { getComparator, applySort } from '@/hooks/useTable';
// components
import GridItem from '@/components/GridItem';
import { SearchNotFound404 } from '@/components/table';
import { SkeletonProcesso } from '@/components/skeleton';
//
import NotaProcesso from './nota';
import DetalhesProcesso from './detalhes';
import Anexos from './anexos/anexos-dados-gerais';

// ---------------------------------------------------------------------------------------------------------------------

export default function DadosGerais({ processo }) {
  const { isLoadingP } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = useMemo(() => processo?.anexos?.filter(({ ativo }) => ativo) || [], [processo?.anexos]);
  const isPS = useMemo(
    () => fluxosGmkt(processo?.fluxo) || processo?.fluxo === 'Diário' || processo?.fluxo === 'Receção de Cartões - DOP',
    [processo?.fluxo]
  );

  if (isLoadingP) return <Card sx={{ p: 3 }} children={<SkeletonProcesso />} />;

  return (
    <Card sx={{ p: { xs: 1, sm: 3 }, pt: { xs: 1, sm: 1.5 } }}>
      {processo ? (
        <Grid container spacing={3}>
          <GridItem lg={anexosAtivos?.length ? 5 : 12}>
            <Stack id="detalhes">
              {!isPS && processo?.nota && <NotaProcesso nota={processo?.nota} segmento={processo?.segmento} />}
              <DetalhesProcesso isPS={isPS} processo={processo} />
            </Stack>
          </GridItem>
          {!!anexosAtivos?.length && (
            <GridItem lg={7}>
              <Anexos anexos={applySort(anexosAtivos, getComparator('asc', 'id'))} />
            </GridItem>
          )}
        </Grid>
      ) : (
        <SearchNotFound404 message="Processo não encontrado ou não tens acesso..." noShadow />
      )}
    </Card>
  );
}
