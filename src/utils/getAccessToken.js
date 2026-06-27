import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance, loginRequest, redirectUri, msalReadyPromise } from '../auth-config';

// ---------------------------------------------------------------------------------------------------------------------

export async function getAccessToken() {
  await msalReadyPromise;

  const activeAccount = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? null;

  if (!activeAccount) {
    await msalInstance.loginRedirect({ ...loginRequest, redirectUri });
    return null;
  }

  const tokenRequest = { ...loginRequest, account: activeAccount, redirectUri, forceRefresh: false };

  try {
    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (error) {
    const deveRedirecionar =
      error instanceof InteractionRequiredAuthError ||
      error?.errorCode === 'timed_out' ||
      error?.errorCode === 'monitor_window_timeout' ||
      error?.errorCode === 'no_token_request_cache_error';

    if (deveRedirecionar) {
      await msalInstance.acquireTokenRedirect({ ...tokenRequest, redirectUri });
      return null;
    }

    throw error;
  }
}
