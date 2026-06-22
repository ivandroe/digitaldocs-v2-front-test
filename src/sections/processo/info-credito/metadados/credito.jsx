// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
// utils
import { dispatch, useSelector } from '@/redux/store';
import { setModal } from '@/redux/slices/digitaldocs';
import { useMetadadosCreditoData } from './useMetadadosCreditoData';
import { getFromParametrizacao } from '@/redux/slices/parametrizacao';
// Components
import { noDados } from '@/components/Panel';
import GridItem from '@/components/GridItem';
import { DefaultAction } from '@/components/Actions';
import { SearchNotFoundSmall } from '@/components/table/SearchNotFound';
//
import MetadadosCreditoForm from '../../form/credito/metadados';
import CardsGrid from '@/modules/gaji9/components/detalhes-credito/cards-grid';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCredito({ dados, outros, modificar = false, ids = null }) {
  const theme = useTheme();
  const isOpenModal = useSelector((state) => state.digitaldocs.isOpenModal);
  const { financeiroPrincipal, cards } = useMetadadosCreditoData({ ...dados, ...outros });

  const openModal = () => {
    dispatch(setModal({ modal: 'form-metadados' }));
    if (!dados) dispatch(getFromParametrizacao('pesquizar-precario', { ...ids, item: 'precario' }));
  };

  return (
    <Box>
      {dados ? (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {financeiroPrincipal.map((item) => (
              <GridItem xs={6} md={3} key={item.label}>
                <Card
                  sx={{
                    p: 1,
                    height: 1,
                    display: 'flex',
                    textAlign: 'center',
                    color: 'text.secondary',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: theme.customShadows.cardAlt,
                    bgcolor: alpha(theme.palette[item.color].main, 0.025),
                  }}
                >
                  <Typography variant="overline">{item.label}</Typography>
                  <Typography variant="h6" sx={{ color: `${item.color}.main` }}>
                    {item.value || noDados()}
                  </Typography>
                  {item.sem_desconto ? (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Sem desconto: {item.sem_desconto}
                    </Typography>
                  ) : null}
                </Card>
              </GridItem>
            ))}
          </Grid>

          <CardsGrid cards={cards} />
        </>
      ) : (
        <SearchNotFoundSmall
          message="Nenhuma informação adicionada..."
          sx={{ bgcolor: 'background.neutral', borderRadius: 1.5 }}
        />
      )}

      {modificar && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <DefaultAction button variant="contained" label={dados ? 'Editar' : 'Adicionar'} onClick={openModal} />
        </Stack>
      )}

      {isOpenModal === 'form-metadados' && (
        <MetadadosCreditoForm onClose={() => dispatch(setModal())} dados={dados} ids={ids} outros={outros} />
      )}
    </Box>
  );
}
