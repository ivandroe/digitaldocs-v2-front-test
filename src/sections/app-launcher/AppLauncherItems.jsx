//@mui
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// utils
import { getIntranetFile } from '@/utils/formatFile';
//
import { SearchNotFoundSmall } from '@/components/table';

// ---------------------------------------------------------------------------------------------------------------------

function ItemLogo({ item, sx = null }) {
  return (
    <Avatar
      alt={item.nome}
      variant="rounded"
      sx={{ p: 0.75, bgcolor: 'action.selected', ...sx }}
      src={getIntranetFile('aplicacao', item.logo_disco)}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function AppCard({ app, onAbrir }) {
  return (
    <Box
      onClick={() => onAbrir({ ...app, tipo: 'app' })}
      sx={{
        p: 1.25,
        gap: 1.5,
        minWidth: 0,
        display: 'flex',
        borderRadius: 2,
        cursor: 'pointer',
        alignItems: 'center',
        transition: 'all .15s',
        flexDirection: 'column',
        bgcolor: 'background.neutral',
        '&:hover': { bgcolor: (theme) => alpha(theme.palette.success.main, 0.25) },
      }}
    >
      <ItemLogo item={app} />
      <Typography
        variant="caption"
        sx={{
          lineHeight: 1.3,
          maxWidth: '100%',
          overflow: 'hidden',
          WebkitLineClamp: 2,
          fontWeight: 'bold',
          textAlign: 'center',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
        }}
      >
        {app.nome}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function LinkItem({ item, onAbrir }) {
  return (
    <Box
      onClick={() => onAbrir({ ...item, tipo: 'link' })}
      sx={{
        gap: 1,
        py: 0.75,
        px: 1.25,
        display: 'flex',
        borderRadius: 1,
        cursor: 'pointer',
        alignItems: 'center',
        transition: 'all .15s',
        '&:hover': { bgcolor: 'action.hover', color: 'success.main', textDecoration: 'underline' },
      }}
    >
      <ItemLogo item={item} sx={{ p: 0.25, width: 35, height: 35, bgcolor: 'transparent' }} />
      <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {item.nome}
      </Typography>
      <OpenInNewIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RecenteItem({ item, onAbrir }) {
  return (
    <Tooltip title={item.link} placement="bottom" arrow>
      <Box
        onClick={() => onAbrir(item)}
        sx={{
          p: 1,
          gap: '5px',
          minWidth: 64,
          borderRadius: 2,
          display: 'flex',
          cursor: 'pointer',
          alignItems: 'center',
          flexDirection: 'column',
          transition: 'background .15s',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ItemLogo item={item} />
        <Typography
          variant="caption"
          sx={{ fontSize: 10.5, color: 'text.secondary', textAlign: 'center', lineHeight: 1.3 }}
        >
          {item.nome.length > 14 ? item.nome.slice(0, 13) + '…' : item.nome}
        </Typography>
      </Box>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EmptyState({ query, mensagem, small = false }) {
  return (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <SearchNotFoundSmall xs={small} />
      <Typography variant="body2" color="text.disabled">
        {query ? (
          <>
            Sem resultados para <strong>&quot;{query}&quot;</strong>...
          </>
        ) : (
          mensagem
        )}
      </Typography>
    </Box>
  );
}
