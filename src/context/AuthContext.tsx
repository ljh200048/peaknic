import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserSession {
  role: "member" | "admin";
  name: string;
  email?: string;
}

interface AuthContextType {
  isAdmin: boolean;
  currentUser: UserSession | null;
  loginAdmin: (passcode: string) => boolean;
  loginMember: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("peaknic_admin_session") === "true";
  });

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("peaknic_member_session");
    if (saved) {
      try {
        return JSON.parse(saved) as UserSession;
      } catch {
        return null;
      }
    }
    // If admin session is true, initialize current user as admin as well
    if (localStorage.getItem("peaknic_admin_session") === "true") {
      return { role: "admin", name: "관리자" };
    }
    return null;
  });

  const loginAdmin = (passcode: string): boolean => {
    if (passcode.trim() === "peaknic123") {
      setIsAdmin(true);
      const adminUser: UserSession = { role: "admin", name: "관리자" };
      setCurrentUser(adminUser);
      localStorage.setItem("peaknic_admin_session", "true");
      localStorage.setItem("peaknic_member_session", JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const loginMember = (name: string, email: string) => {
    setIsAdmin(false);
    const memberUser: UserSession = { role: "member", name, email };
    setCurrentUser(memberUser);
    localStorage.removeItem("peaknic_admin_session");
    localStorage.setItem("peaknic_member_session", JSON.stringify(memberUser));
  };

  const logout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem("peaknic_admin_session");
    localStorage.removeItem("peaknic_member_session");
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        currentUser,
        loginAdmin,
        loginMember,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
