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
import GridItem from '@/components/GridItem';
import { noDados } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { SearchNotFoundSmall } from '@/components/table/SearchNotFound';
import { CardBox } from '@/modules/gaji9/components/detalhes-credito/shared';
import MetadadosCreditoForm from '../../form/credito/form-metadados-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCredito({ dados, outros, modificar = false, ids = null }) {
  const theme = useTheme();
  const isOpenModal = useSelector((state) => state.digitaldocs.isOpenModal);
  const { financeiroPrincipal, cards } = useMetadadosCreditoData(dados);

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
                    textAlign: 'center',
                    boxShadow: theme.customShadows.cardAlt,
                    bgcolor: alpha(theme.palette[item.color].main, 0.025),
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6" sx={{ color: `${item.color}.main` }}>
                    {item.value || '---'}
                  </Typography>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Box
            gap={2}
            display="grid"
            alignItems="center"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(3, 1fr)' }}
          >
            {cards.map((card, index) => (
              <CardBox key={card.id ?? index} title={card.titulo}>
                {card.dados.map(
                  (item, idx) =>
                    (item?.empty && noDados(item?.label)) ||
                    (item.isHeader && (
                      <Typography key={idx} variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                    )) || (
                      <Box
                        key={idx}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.title}:
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="body2"
                            noWrap={!item.noWrap}
                            sx={{ fontWeight: item.bold ? 700 : 400, color: item.color || 'text.primary', pr: 0.25 }}
                          >
                            {item.value || noDados('(N/D)')}
                          </Typography>
                        </Box>
                      </Box>
                    )
                )}
              </CardBox>
            ))}
          </Box>
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
