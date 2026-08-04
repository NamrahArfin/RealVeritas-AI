import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.detail || 'Login failed.' };
      }
      
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.detail || 'Registration failed.' };
      }
      
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    window.location.replace('/');
  };

  const resetPassword = (email) => {
    // Simulated forgot password trigger
    return { success: true, message: `A reset link has been sent to ${email}.` };
  };

  const updateProfile = (name, email) => {
    if (!user) return { success: false };
    const updated = { ...user, name, email };
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
