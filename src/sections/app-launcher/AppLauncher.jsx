// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
// utils
import { useAppLauncher } from './useAppLauncher';
// components
import MenuPopover from '@/components/MenuPopover';
import { IconButtonHeader } from '@/layouts/header';
import { RecenteItem, AppCard, LinkItem, EmptyState } from './AppLauncherItems';

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
          ...{ p: 0, mt: 1.5, ml: 0.75, width: 480 },
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1.5, flexShrink: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Aplicações & Links úteis</Typography>
          </Box>

          <Box
            sx={{
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              display: 'flex',
              border: '1px solid',
              alignItems: 'center',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
            <InputBase
              autoFocus
              fullWidth
              value={query}
              placeholder="Pesquisar..."
              sx={{ typography: 'body2' }}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Box>
        </Box>

        <Tabs
          value={tab}
          variant="fullWidth"
          onChange={(_, newValue) => setTab(newValue)}
          sx={{ flexShrink: 0, pt: 0.5, bgcolor: 'background.neutral' }}
        >
          <Tab value="Recentes" label={`Recentes${` (${recentesApps.length + recentesLinks.length})`}`} />
          <Tab value="Aplicações" label={`Aplicações${` (${appsVisiveis.length})`}`} />
          <Tab value="Links Úteis" label={`Links Úteis${` (${linksVisiveis.length})`}`} />
        </Tabs>

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
