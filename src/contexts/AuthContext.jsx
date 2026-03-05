import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT payload to get user details
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.sub });
      } catch (e) {
        console.error('Invalid token', e);
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const loginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
