import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { EventType } from '@azure/msal-browser';
import { msalInstance, loginRequest, redirectUri, msalReadyPromise } from '../auth-config';

// ---------------------------------------------------------------------------------------------------------------------

const AuthContext = createContext();

const resolveAccount = () => {
  const active = msalInstance.getActiveAccount();
  if (active) return active;
  const all = msalInstance.getAllAccounts();
  if (all.length > 0) {
    msalInstance.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
};

// ---------------------------------------------------------------------------------------------------------------------

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const renewalTimerRef = useRef(null);

  const scheduleRenewal = useCallback((currentAccount) => {
    if (renewalTimerRef.current) clearTimeout(renewalTimerRef.current);
    if (!currentAccount) return;

    msalInstance
      .acquireTokenSilent({ ...loginRequest, account: currentAccount, redirectUri })
      .then((response) => {
        if (!response?.expiresOn) return;

        const delay = new Date(response.expiresOn).getTime() - Date.now() - 4 * 60 * 1000;
        if (delay <= 0) return;

        renewalTimerRef.current = setTimeout(async () => {
          try {
            const renewed = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: currentAccount,
              redirectUri,
              forceRefresh: true,
            });
            if (renewed?.account) {
              msalInstance.setActiveAccount(renewed.account);
              scheduleRenewal(renewed.account);
            }
          } catch (err) {
            console.warn('[AuthProvider] Renovação proativa falhou:', err?.errorCode);

            const isExpired =
              err?.errorCode === 'login_required' ||
              err?.errorCode === 'consent_required' ||
              err?.errorCode === 'interaction_required';

            if (isExpired) {
              console.warn('[AuthProvider] Sessão expirada, próxima chamada API vai redirecionar');
            } else {
              renewalTimerRef.current = setTimeout(() => scheduleRenewal(currentAccount), 2 * 60 * 1000);
            }
          }
        }, delay);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        const eventAccount = event.payload?.account;
        if (eventAccount) {
          msalInstance.setActiveAccount(eventAccount);
          setAccount(eventAccount);
        }
      }

      if (event.eventType === EventType.LOGOUT_SUCCESS) {
        setAccount(null);
      }

      if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
        const code = event.error?.errorCode;
        const isIframeTimeout = code === 'timed_out' || code === 'monitor_window_timeout';
        if (!isIframeTimeout && !resolveAccount()) {
          setAccount(null);
        }
      }
    });

    const init = async () => {
      try {
        await msalReadyPromise;

        let redirectResponse = null;
        try {
          redirectResponse = await msalInstance.handleRedirectPromise();
        } catch (redirectErr) {
          if (redirectErr?.errorCode !== 'no_token_request_cache_error') {
            throw redirectErr;
          }
        }

        let resolvedAccount = null;
        if (redirectResponse?.account) {
          msalInstance.setActiveAccount(redirectResponse.account);
          resolvedAccount = redirectResponse.account;
        } else {
          resolvedAccount = resolveAccount();
        }

        setAccount(resolvedAccount);
        if (resolvedAccount) scheduleRenewal(resolvedAccount);
      } catch (err) {
        console.error('[AuthProvider] Erro na inicialização:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (callbackId) msalInstance.removeEventCallback(callbackId);
      if (renewalTimerRef.current) clearTimeout(renewalTimerRef.current);
    };
  }, [scheduleRenewal]);

  const login = useCallback(async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setError(null);
    try {
      await msalInstance.loginRedirect({ ...loginRequest, redirectUri });
    } catch (err) {
      console.error('[AuthProvider] Erro no login:', err);
      setError(err);
      setLoginLoading(false);
    }
  }, [loginLoading]);

  const logout = useCallback(() => {
    if (renewalTimerRef.current) clearTimeout(renewalTimerRef.current);
    const activeAccount = msalInstance.getActiveAccount();
    msalInstance.logoutRedirect({
      account: activeAccount ?? undefined,
      logoutHint: activeAccount?.username,
      postLogoutRedirectUri: redirectUri,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ account, error, isLoading, loginLoading, login, logout, isAuthenticated: !!account }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------------------------------------------------

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
