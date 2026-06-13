import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../db/mockDb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      const savedUser = localStorage.getItem('farmers_portal_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Refresh user data from db in case status or profile changed
          const dbUser = await mockDb.getById('users', parsed.id);
          if (dbUser && dbUser.status === 'active') {
            setUser(dbUser);
          } else {
            localStorage.removeItem('farmers_portal_session');
          }
        } catch (e) {
          localStorage.removeItem('farmers_portal_session');
        }
      }
      setLoading(false);
    };
    initSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('farmers_portal_session', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Terjadi kesalahan pada server.' };
    }
  };

  const logout = async () => {
    if (user) {
      // In a real app we might call a logout endpoint here
    }
    setUser(null);
    localStorage.removeItem('farmers_portal_session');
  };

  const updateProfile = async (name, newPassword) => {
    if (!user) return { success: false };

    const updates = { name };
    if (newPassword && newPassword.trim() !== '') {
      updates.password = newPassword;
    }

    const updated = await mockDb.update('users', user.id, updates, user.id);
    if (updated) {
      setUser(updated);
      localStorage.setItem('farmers_portal_session', JSON.stringify(updated));
      return { success: true, message: 'Profil berhasil diperbarui.' };
    }
    return { success: false, message: 'Gagal memperbarui profil.' };
  };

  // Helper flags
  const isPetani = user?.role === 'petani';
  const isPengurus = user?.role === 'pengurus';
  const isBPP = user?.role === 'bpp';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isPetani,
    isPengurus,
    isBPP,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
