// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
//
import { Voltar } from './Actions';
import { TabsWrapperStyle } from './Panel';

// ---------------------------------------------------------------------------------------------------------------------

const TabsWrapperStyleSimple = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: { paddingRight: theme.spacing(2) },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function TabsWrapper({ title, tabsList, tab, setTab, voltar = false }) {
  return (
    <Card sx={{ mb: 3, position: 'relative' }}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, mb: '42px', py: 1, minHeight: 50, color: 'common.white', bgcolor: 'primary.main' }}
      >
        <Typography variant="h5">{title}</Typography>
        {voltar && <Voltar />}
      </Stack>
      <TabsWrapperStyle>
        {Array.isArray(tabsList) && tabsList.length > 0 && (
          <Tabs
            onChange={setTab}
            allowScrollButtonsMobile
            value={tabsList.some(({ value }) => value === tab) ? tab : tabsList[0].value}
          >
            {tabsList.map(({ value, label, icon }) => (
              <Tab
                icon={icon}
                key={value}
                value={value}
                label={label || value}
                sx={{ px: 0.64, pb: 1.5, pt: 1.75, mt: 0.25 }}
              />
            ))}
          </Tabs>
        )}
      </TabsWrapperStyle>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TabsWrapperSimple({ tabsList, tab, setTab, sx }) {
  return (
    <Card sx={{ height: 45, mb: 3, ...sx, borderRadius: 1, bgcolor: sx?.boxShadow === 'none' && 'background.neutral' }}>
      <TabsWrapperStyleSimple sx={{ bgcolor: 'transparent' }}>
        {Array.isArray(tabsList) && tabsList.length > 0 && (
          <Tabs
            onChange={setTab}
            allowScrollButtonsMobile
            value={tabsList.some(({ value }) => value === tab) ? tab : tabsList[0]?.value}
          >
            {tabsList.map(({ value, label, count = null, pill = '' }) => (
              <Tab
                key={value}
                value={value}
                sx={{ px: 0.64, py: 1.55 }}
                label={<TabLabel text={label || value} count={count} pill={pill} />}
              />
            ))}
          </Tabs>
        )}
      </TabsWrapperStyleSimple>
    </Card>
  );
}

function TabLabel({ text, count, pill }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <span>{text}</span>
      {(count != null || pill) && (
        <Chip
          size="small"
          label={count ?? pill}
          sx={{ height: 16, typography: 'caption', fontWeight: 600, color: 'text.secondary' }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TabCard({ tabs, tab, setTab }) {
  return (
    <Tabs value={tab} allowScrollButtonsMobile sx={{ px: 1.5, bgcolor: 'background.neutral' }} onChange={setTab}>
      {tabs.map(({ value, label }) => (
        <Tab disableRipple key={value} value={value} label={label || value} sx={{ py: 2, px: 1 }} />
      ))}
    </Tabs>
  );
}
