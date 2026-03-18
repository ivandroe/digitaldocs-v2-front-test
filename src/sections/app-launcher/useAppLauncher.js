import { useState, useMemo, useCallback } from 'react';
import { useSelector } from '@/redux/store';

const RECENTES_APPS_KEY = 'appLauncher_recentes_apps';
const RECENTES_LINKS_KEY = 'appLauncher_recentes_links';
const MAX_RECENTES = 5;

// ---------------------------------------------------------------------------------------------------------------------

function getRecentes(tipo) {
  const key = tipo === 'app' ? RECENTES_APPS_KEY : RECENTES_LINKS_KEY;
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveRecente(item) {
  const isApp = item.tipo === 'app';
  const key = isApp ? RECENTES_APPS_KEY : RECENTES_LINKS_KEY;

  const atuais = getRecentes(isApp ? 'app' : 'link');
  const prev = atuais.filter((r) => r.id !== item.id);
  const next = [item, ...prev].slice(0, MAX_RECENTES);

  localStorage.setItem(key, JSON.stringify(next));
}

function enrichLink(app) {
  if (app.link?.includes('/extrato') || app.link?.includes('/digitalforms') || app?.add_token) {
    return `${app.link}?token=${localStorage.getItem('accessToken')}`;
  }
  return app.link;
}

// ---------------------------------------------------------------------------------------------------------------------

export function useAppLauncher() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Aplicações');
  const [anchorEl, setAnchorEl] = useState(null);

  const [recentesApps, setRecentesApps] = useState(() => getRecentes('app'));
  const [recentesLinks, setRecentesLinks] = useState(() => getRecentes('link'));

  const { minhasAplicacoes, links } = useSelector((state) => state.intranet);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
    setQuery('');
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleAbrirItem = useCallback(
    (item) => {
      saveRecente(item);
      if (item.tipo === 'app') setRecentesApps(getRecentes('app'));
      else setRecentesLinks(getRecentes('link'));

      window.open(item.link, '_blank', 'noopener,noreferrer');
      handleClose();
    },
    [handleClose]
  );

  const handleSetTab = useCallback((newTab) => {
    setTab(newTab);
    setQuery('');
  }, []);

  const appsVisiveis = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = q ? minhasAplicacoes.filter((a) => a.nome.toLowerCase().includes(q)) : minhasAplicacoes;
    return filtered.map((app) => ({ ...app, link: enrichLink(app) }));
  }, [minhasAplicacoes, query]);

  const linksVisiveis = useMemo(() => {
    const q = query.toLowerCase();
    return q ? links.filter((l) => l.nome.toLowerCase().includes(q)) : links;
  }, [links, query]);

  const recentesAppsFiltrados = useMemo(() => {
    const q = query.toLowerCase();
    return q ? recentesApps.filter((r) => r.nome.toLowerCase().includes(q)) : recentesApps;
  }, [recentesApps, query]);

  const recentesLinksFiltrados = useMemo(() => {
    const q = query.toLowerCase();
    return q ? recentesLinks.filter((r) => r.nome.toLowerCase().includes(q)) : recentesLinks;
  }, [recentesLinks, query]);

  return {
    tab,
    open,
    query,
    anchorEl,
    setQuery,
    handleOpen,
    handleClose,
    appsVisiveis,
    linksVisiveis,
    handleAbrirItem,
    setTab: handleSetTab,
    recentesApps: recentesAppsFiltrados,
    recentesLinks: recentesLinksFiltrados,
  };
}
