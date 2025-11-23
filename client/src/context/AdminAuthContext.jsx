import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminAuth } from '../services/adminAPI';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminUser');

    if (token && savedAdmin) {
      try {
        const res = await adminAuth.getMe();
        setAdmin(res.data.admin);
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const res = await adminAuth.login(credentials);
    const { token, admin } = res.data;
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(admin));
    setAdmin(admin);
    return admin;
  };

  const logout = async () => {
    try {
      await adminAuth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};