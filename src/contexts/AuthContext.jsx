import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

// Demo mode: auto-login with a fake demo user – no API call required
const DEMO_USER = { id: 1, email: 'demo@taskmanager.com', name: 'Demo User' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEMO_USER);
  const [loading] = useState(false);

  // No-op in demo mode (kept for interface compatibility)
  const loginSuccess = () => setUser(DEMO_USER);
  const logout       = () => setUser(DEMO_USER); // stays "logged-in" in demo

  return (
    <AuthContext.Provider value={{ user, token: 'demo-token', loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
