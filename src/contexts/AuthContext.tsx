import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  login: async () => {},
  adminLogin: async () => {},
  register: async () => {},
  logout: () => {},
  setRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRoleState] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const userData = await api.auth.me();
      setUser(userData);
      setRoleState(userData.role || "employer");
    } catch {
      localStorage.removeItem("auth_token");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await api.auth.login(email, password);
    localStorage.setItem("auth_token", token);
    setUser(userData);
    setRoleState(userData.role || "employer");
  };

  const adminLogin = async (email: string, password: string) => {
    const { token, user: userData } = await api.auth.adminLogin(email, password);
    localStorage.setItem("auth_token", token);
    setUser(userData);
    setRoleState("admin");
  };

  const register = async (email: string, password: string, name: string) => {
    const { token, user: userData } = await api.auth.register(email, password, name);
    localStorage.setItem("auth_token", token);
    setUser(userData);
    setRoleState("employer");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setRoleState(null);
  };

  const setRole = async (newRole: string) => {
    await api.auth.setRole(newRole);
    setRoleState(newRole);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      role,
      login,
      adminLogin,
      register,
      logout,
      setRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useConvexAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}
