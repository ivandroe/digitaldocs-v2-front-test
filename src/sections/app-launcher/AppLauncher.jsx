// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
// utils
import { useAppLauncher } from './useAppLauncher';
// components
import { LinksIcon, AppsIcon } from '@/assets';
import MenuPopover from '@/components/MenuPopover';
import { IconButtonHeader } from '@/layouts/header';
import { RecenteItem, AppCard, LinkItem, EmptyState } from './AppLauncherItems';

const getIcon = (icon) => (
  <Box sx={{ height: 18, width: 18 }}>
    {(icon === 'app' && <AppsIcon />) || (icon === 'link' && <LinksIcon />) || <ScheduleIcon sx={{ height: 18 }} />}
  </Box>
);

// ---------------------------------------------------------------------------------------------------------------------

export default function AppLauncher() {
  const launcher = useAppLauncher();
  const {
    tab,
    open,
    query,
    setTab,
    anchorEl,
    setQuery,
    handleOpen,
    handleClose,
    appsVisiveis,
    recentesApps,
    recentesLinks,
    linksVisiveis,
    handleAbrirItem,
  } = launcher || {};

  return (
    <>
      <IconButtonHeader title="Aplicações & Links úteis" open={open} setOpen={handleOpen} />
      <MenuPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{
          display: 'flex',
          overflow: 'inherit',
          flexDirection: 'column',
          maxHeight: 'calc(90vh - 100px)',
          ...{ p: 0, mt: 1.5, ml: 0.75, width: 510 },
        }}
      >
        <Box sx={{ px: 2, pt: 2, b: 1, flexShrink: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Aplicações & Links úteis</Typography>
          </Box>

          <Tabs
            value={tab}
            variant="fullWidth"
            onChange={(_, newValue) => setTab(newValue)}
            sx={{ mb: 1.5, pb: 0.15, pt: 0.75, flexShrink: 0, borderRadius: 1, bgcolor: 'background.neutral' }}
          >
            <Tab
              value="Recentes"
              icon={getIcon('')}
              label={`Recentes${` (${recentesApps.length + recentesLinks.length})`}`}
            />
            <Tab value="Aplicações" icon={getIcon('app')} label={`Aplicações${` (${appsVisiveis.length})`}`} />
            <Tab value="Links Úteis" icon={getIcon('link')} label={`Links úteis${` (${linksVisiveis.length})`}`} />
          </Tabs>

          <TextField
            autoFocus
            fullWidth
            size="small"
            value={query}
            placeholder=" Pesquisar..."
            onChange={(e) => setQuery(e.target.value)}
            sx={{ bgcolor: 'action.hover', '& .MuiInputBase-input': { typography: 'body2' } }}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /> }}
          />
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1, px: 2, py: 1.5 }}>
          {tab === 'Recentes' && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  Aplicações
                </Typography>
                {recentesApps.length > 0 ? (
                  <Stack direction="row" gap={0.5} flexWrap="wrap">
                    {recentesApps.map((r) => (
                      <RecenteItem key={`app-${r.id}`} item={r} onAbrir={handleAbrirItem} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    Nenhuma aplicação aberta recentemente...
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  Links úteis
                </Typography>
                {recentesLinks.length > 0 ? (
                  <Stack direction="row" gap={0.5} flexWrap="wrap">
                    {recentesLinks.map((r) => (
                      <RecenteItem key={`link-${r.id}`} item={r} onAbrir={handleAbrirItem} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    Nenhum link aberto recentemente...
                  </Typography>
                )}
              </Box>
            </Stack>
          )}

          {tab === 'Aplicações' && (
            <>
              {appsVisiveis.length > 0 ? (
                <Box sx={{ gap: 1.5, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                  {appsVisiveis.map((app) => (
                    <AppCard key={app.id} app={app} onAbrir={handleAbrirItem} />
                  ))}
                </Box>
              ) : (
                <EmptyState small query={query} mensagem="Não tens aplicações disponíveis." />
              )}
            </>
          )}

          {tab === 'Links Úteis' && (
            <>
              {linksVisiveis.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 0.75, mt: 0.5 }}>
                  {linksVisiveis.map((l) => (
                    <LinkItem key={l.id} item={l} onAbrir={handleAbrirItem} />
                  ))}
                </Box>
              ) : (
                <EmptyState small query={query} mensagem="Não há links úteis disponíveis." />
              )}
            </>
          )}
        </Box>
      </MenuPopover>
    </>
  );
}
