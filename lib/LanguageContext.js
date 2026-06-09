'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Simple translations for sidebar and common UI
const translations = {
  en: {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    clients: 'Clients',
    expenses: 'Expenses',
    estimates: 'Estimates',
    recurring: 'Recurring',
    settings: 'Settings',
    logout: 'Logout',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    welcome: 'Welcome back',
  },
  es: {
    dashboard: 'Panel',
    invoices: 'Facturas',
    clients: 'Clientes',
    expenses: 'Gastos',
    estimates: 'Presupuestos',
    recurring: 'Recurrentes',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    welcome: 'Bienvenido de nuevo',
  },
  fr: {
    dashboard: 'Tableau de bord',
    invoices: 'Factures',
    clients: 'Clients',
    expenses: 'Dépenses',
    estimates: 'Devis',
    recurring: 'Récurrents',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    welcome: 'Bon retour',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    invoices: 'الفواتير',
    clients: 'العملاء',
    expenses: 'المصروفات',
    estimates: 'عروض الأسعار',
    recurring: 'المتكررة',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    welcome: 'مرحباً بعودتك',
  }
};

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('locale');
    if (saved && translations[saved]) setLocale(saved);
  }, []);

  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key) => {
    if (!mounted) return key;
    return translations[locale][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
