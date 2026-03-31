import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DemoLoginRequest } from "@call-pat/shared";
import { demoLogin } from "./api";

export type AuthUser = {
  id: string;
  displayName: string;
  role: string;
};

type AuthCtx = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: DemoLoginRequest["email"]) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "callpat_token";
const USER_KEY = "callpat_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const t = await AsyncStorage.getItem(TOKEN_KEY);
        const u = await AsyncStorage.getItem(USER_KEY);
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u) as AuthUser);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      user,
      loading,
      async login(email) {
        const res = await demoLogin(email);
        await AsyncStorage.setItem(TOKEN_KEY, res.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      },
      async logout() {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider required");
  return v;
}
