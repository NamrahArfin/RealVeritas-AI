import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    // Simulated authentication check - accepts any standard layout
    const mockUser = {
      name: email.split('@')[0].toUpperCase(),
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationCount: 24,
    };
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const signup = (name, email, password) => {
    const mockUser = {
      name: name,
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationCount: 0,
    };
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    return { success: true };
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
