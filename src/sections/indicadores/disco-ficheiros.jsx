import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// utils
import { useFileSystemStats } from './useFileSystemStats';
import { fNumber, fPercent, fData } from '@/utils/formatNumber';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getIndicadores } from '@/redux/slices/indicadores';
// components
import GridItem from '@/components/GridItem';
import { IndicadorItem } from './Indicadores';
import Chart, { useChart } from '@/components/chart';

const DISCO_TOTAL = 1_000_000_000_000;

// ---------------------------------------------------------------------------------------------------------------------

export function DiscoFicheiros() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { fileSystem, isLoading } = useSelector((state) => state.indicadores);

  useEffect(() => {
    dispatch(getIndicadores('fileSystem', { item: 'fileSystem' }));
  }, [dispatch]);

  const stats = useFileSystemStats(fileSystem);
  const total = stats[0];
  const usedPercent = total.tamanho > 0 ? ((total.tamanho * 100) / DISCO_TOTAL).toFixed(2) : 0;

  const chartOptions = useChart({
    chart: { offsetY: -16, sparkline: { enabled: true } },
    grid: { padding: { top: 24, bottom: 24 } },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '56%' },
        dataLabels: {
          name: { offsetY: 8 },
          value: { offsetY: -50 },
          total: { label: `Usado de ${fData(DISCO_TOTAL)}`, fontSize: theme.typography.body2.fontSize },
        },
      },
    },
  });

  return (
    <Card>
      <IndicadorItem isLoading={isLoading} isNotFound={!fileSystem.length}>
        <Grid container spacing={3} alignItems="center">
          <GridItem sm={6}>
            <Chart height={500} type="radialBar" options={chartOptions} series={[Number(usedPercent)]} />
          </GridItem>

          <GridItem sm={6}>
            <Stack spacing={2}>
              {stats
                .filter(({ qnt }) => qnt > 0)
                .map((item) => (
                  <FileTypeCard key={item.tipo} {...item} totalTamanho={total.tamanho} />
                ))}
            </Stack>
          </GridItem>
        </Grid>
      </IndicadorItem>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FileTypeCard({ tipo, file, qnt, tamanho, totalTamanho }) {
  const theme = useTheme();
  const isTotal = tipo === 'Total';

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 1,
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        '&:hover': { bgcolor: 'background.neutral', boxShadow: theme.customShadows.z2 },
      }}
    >
      <Stack spacing={2} direction="row" alignItems="center">
        <Box component="img" sx={{ width: 40, height: 40 }} src={`/assets/icons/file_format/${file}.svg`} />

        <Stack spacing={0.5} flexGrow={1}>
          <Typography variant="subtitle1">{tipo}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2">{fNumber(qnt)}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {qnt === 1 ? 'ficheiro' : 'ficheiros'}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={0.5}>
          <Typography variant="h6">{fData(tamanho)}</Typography>
          {!isTotal && totalTamanho > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ({fPercent((tamanho * 100) / totalTamanho)})
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
