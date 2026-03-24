import { PublicClientApplication } from '@azure/msal-browser';

export const redirectUri = import.meta.env.VITE_BASE_URL || window.location.origin;

export const msalConfig = {
  auth: {
    redirectUri,
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: true },
  system: { allowRedirectInIframe: false, tokenRenewalOffsetSeconds: 300 },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const msalReadyPromise = msalInstance.initialize();

export const loginRequest = { scopes: ['User.Read', 'Presence.Read.All', 'openid', 'profile'] };
