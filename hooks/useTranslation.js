'use client'

import { useState, useEffect } from 'react'

const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.invoices': 'Invoices',
    'nav.clients': 'Clients',
    'nav.expenses': 'Expenses',
    'nav.estimates': 'Estimates',
    'nav.recurring': 'Recurring',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.subscription': 'Subscription',
    'nav.logout': 'Logout',
    'nav.darkMode': 'Dark Mode',
    'nav.lightMode': 'Light Mode',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
  },
  es: {
    'nav.dashboard': 'Tablero',
    'nav.invoices': 'Facturas',
    'nav.clients': 'Clientes',
    'nav.expenses': 'Gastos',
    'nav.estimates': 'Presupuestos',
    'nav.recurring': 'Recurrentes',
    'nav.reports': 'Informes',
    'nav.settings': 'Configuración',
    'nav.subscription': 'Suscripción',
    'nav.logout': 'Cerrar sesión',
    'nav.darkMode': 'Modo oscuro',
    'nav.lightMode': 'Modo claro',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.invoices': 'Factures',
    'nav.clients': 'Clients',
    'nav.expenses': 'Dépenses',
    'nav.estimates': 'Devis',
    'nav.recurring': 'Récurrentes',
    'nav.reports': 'Rapports',
    'nav.settings': 'Paramètres',
    'nav.subscription': 'Abonnement',
    'nav.logout': 'Déconnexion',
    'nav.darkMode': 'Mode sombre',
    'nav.lightMode': 'Mode clair',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.loading': 'Chargement...',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.invoices': 'الفواتير',
    'nav.clients': 'العملاء',
    'nav.expenses': 'المصروفات',
    'nav.estimates': 'تقديرات',
    'nav.recurring': 'متكرر',
    'nav.reports': 'تقارير',
    'nav.settings': 'الإعدادات',
    'nav.subscription': 'الاشتراك',
    'nav.logout': 'تسجيل الخروج',
    'nav.darkMode': 'الوضع الداكن',
    'nav.lightMode': 'الوضع المضيء',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.loading': 'جاري التحميل...',
  },
}

export function useTranslation() {
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('app-language')
    if (saved && translations[saved]) {
      setLocale(saved)
    }
  }, [])

  const t = (key) => {
    return translations[locale]?.[key] || key
  }

  return { t, locale }
}
