'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'convidada';
  mustChangePassword?: boolean;
}

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  listColaboradoras?: () => Promise<any[]>;
  addColaboradora?: (data: { email: string; name?: string; password?: string; role?: string }) => Promise<any>;
  inviteUser?: (email: string) => Promise<{ success?: boolean; tempPassword?: string }>;
  deleteColaboradora?: (id: string) => Promise<boolean>;
  updateColaboradora?: (id: string, data: { name?: string; role?: string; active?: boolean; imageUrl?: string }) => Promise<any>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { method: 'GET' });
        if (!response.ok) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }

        const payload = await response.json();
        if (payload?.user?.role === 'admin') {
          setCurrentUser(payload.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Credenciais inválidas');
      }

      if (payload?.user?.role !== 'admin') {
        throw new Error('Acesso permitido somente para administradoras.');
      }

      setCurrentUser(payload.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const listColaboradoras = async () => {
    try {
      const res = await fetch('/api/colaboradores');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  };

  const addColaboradora = async (data: { email: string; name?: string; password?: string; role?: string }) => {
    const res = await fetch('/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Erro ao criar colaboradora');
    }
    return await res.json();
  };

  const inviteUser = async (email: string) => {
    const res = await fetch('/api/colaboradores/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload?.error || 'Erro ao convidar');
    return payload;
  };

  const deleteColaboradora = async (id: string) => {
    const res = await fetch(`/api/colaboradores?id=${id}`, { method: 'DELETE' });
    return res.ok;
  };

  const updateColaboradora = async (id: string, data: { name?: string; role?: string; active?: boolean; imageUrl?: string }) => {
    const res = await fetch('/api/colaboradores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Erro ao atualizar colaboradora');
    }
    return await res.json();
  };

  const logout = () => {
    
    localStorage.removeItem('clube-admin-user');
    localStorage.removeItem('clube-sessao');
    localStorage.removeItem('clube-role');
    
    
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    
    
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const response = await fetch('/api/colaboradores/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, newPassword }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || 'Não foi possível atualizar a senha');
      }

      setCurrentUser({ ...currentUser, mustChangePassword: false });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      isLoading,
      currentUser,
      login,
      logout,
      changePassword,
      listColaboradoras,
      addColaboradora,
      inviteUser,
      deleteColaboradora,
      updateColaboradora,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin deve ser usado dentro de AdminProvider');
  }
  return context;
}
