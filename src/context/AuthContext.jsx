import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Admin account is no longer hardcoded here (managed by DB)
// Customer accounts are no longer stored in localStorage

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("3kp_auth");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("3kp_auth", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("3kp_auth");
    }
  }, [user]);

  async function login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true, role: data.role };
      }
      return { success: false, error: data.error || 'Invalid username or password.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Server connection failed.' };
    }
  }

  async function signup(username, password, name, email, phone) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, email, phone })
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true, role: data.role };
      }
      return { success: false, error: data.error || 'Signup failed.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Server connection failed.' };
    }
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("3kp_auth");
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
