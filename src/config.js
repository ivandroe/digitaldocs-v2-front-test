import { ptPT } from '@mui/material/locale';

// ---------------------------------------------------------------------------------------------------------------------

export const ambiente =
  (window.location.hostname === 'localhost' && 'local') ||
  (window.location.hostname?.includes('intraneteste') && 'teste') ||
  'producao';

// ---------------------------------------------------------------------------------------------------------------------

export const HEADER = {
  MOBILE_HEIGHT: 58,
  MAIN_DESKTOP_HEIGHT: 84,
  DASHBOARD_DESKTOP_HEIGHT: 84,
  DASHBOARD_DESKTOP_OFFSET_HEIGHT: 84 - 22,
};

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 84,
  //
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
  DASHBOARD_ITEM_HORIZONTAL_HEIGHT: 32,
};

export const ICON = { NAVBAR_ITEM: 22, NAVBAR_ITEM_HORIZONTAL: 20 };

// ---------------------------------------------------------------------------------------------------------------------

export const defaultSettings = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'default',
  themeLayout: 'horizontal',
  themeColorPresets: 'default',
  themeStretch: false,
};

// ---------------------------------------------------------------------------------------------------------------------

export const allLangs = [{ label: 'Português', value: 'pt', systemValue: ptPT }];
export const defaultLang = allLangs[0];
export const localVersion = '2.0.3';
