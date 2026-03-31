import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const KEY = "callpat_token";
const ROLE_KEY = "callpat_role";

function getToken(): string | null {
  return sessionStorage.getItem(KEY);
}

function getRole(): string | null {
  return sessionStorage.getItem(ROLE_KEY);
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("callpat-auth", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("callpat-auth", cb);
  };
}

function getSnapshot() {
  return `${getToken() ?? ""}|${getRole() ?? ""}`;
}

function getServerSnapshot() {
  return "|";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo(() => {
    void snap;
    return {
      token: getToken(),
      role: getRole(),
      setSession(token: string, role: string) {
        sessionStorage.setItem(KEY, token);
        sessionStorage.setItem(ROLE_KEY, role);
        window.dispatchEvent(new Event("callpat-auth"));
      },
      clear() {
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem(ROLE_KEY);
        window.dispatchEvent(new Event("callpat-auth"));
      },
    };
  }, [snap]);
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

type Session = {
  token: string | null;
  role: string | null;
  setSession: (token: string, role: string) => void;
  clear: () => void;
};

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const v = useContext(SessionContext);
  if (!v) throw new Error("SessionProvider required");
  return v;
}
