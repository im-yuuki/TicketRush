import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAccount, logoutUser } from "../api/auth";
import { AUTH_COOKIE_NAME } from "../api/config";
import type { AccountResponse } from "../types/requestDto";
import {
  clearStoredAccount,
  readStoredAccount,
  type StoredAccount,
  writeStoredAccount,
} from "../auth/accountStorage";

interface AuthContextValue {
  account: StoredAccount | null;
  isAuthenticated: boolean;
  setAccount: (account: StoredAccount | null) => void;
  clearAccount: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let hasHydratedAccount = false;

function hasCookie(name: string) {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split(";").some((cookie) => cookie.trim().startsWith(`${name}=`));
}

function readAccountSnapshot(accountResponse: AccountResponse): StoredAccount {
  const displayName = accountResponse.name;
  const accountEmail = accountResponse.email;
  const avatarUrl = "avatarUrl" in accountResponse ? accountResponse.avatarUrl : undefined;
  const role = accountResponse.role;

  return {
    displayName,
    email: accountEmail,
    avatarUrl,
    role,
  };
}

export function getAccountSnapshot(accountResponse: AccountResponse): StoredAccount {
  return readAccountSnapshot(accountResponse);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<StoredAccount | null>(() => readStoredAccount());

  const setAccount = useCallback((nextAccount: StoredAccount | null) => {
    setAccountState(nextAccount);
    if (nextAccount) {
      writeStoredAccount(nextAccount);
    } else {
      clearStoredAccount();
    }
  }, []);

  const clearAccount = useCallback(() => {
    setAccountState(null);
    clearStoredAccount();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout failures and still clear local state.
    } finally {
      clearAccount();
    }
  }, [clearAccount]);

  useEffect(() => {
    function handleAccountChange() {
      setAccountState(readStoredAccount());
    }

    window.addEventListener("ticketrush-account-change", handleAccountChange);
    window.addEventListener("storage", handleAccountChange);

    return () => {
      window.removeEventListener("ticketrush-account-change", handleAccountChange);
      window.removeEventListener("storage", handleAccountChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAccountFromCookie() {
      if (account || hasHydratedAccount || !hasCookie(AUTH_COOKIE_NAME)) {
        return;
      }

      hasHydratedAccount = true;

      try {
        const accountResponse = await getAccount();
        if (!cancelled) {
          setAccount(readAccountSnapshot(accountResponse));
        }
      } catch {
        // Cookie missing/invalid or request failed; keep silent per requirement.
      }
    }

    hydrateAccountFromCookie();

    return () => {
      cancelled = true;
    };
  }, [account, setAccount]);

  const value = useMemo(() => {
    return {
      account,
      isAuthenticated: Boolean(account?.displayName),
      setAccount,
      clearAccount,
      logout,
    };
  }, [account, clearAccount, logout, setAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
