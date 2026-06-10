'use client'

import { useTranslation } from '@/lib/i18n'

export default function Trans({ text, children }) {
  const locale = typeof window !== 'undefined' ? localStorage.getItem('app-language') || 'en' : 'en'
  
  // Simple translation mapping
  const translations = {
    'Dashboard': { es: 'Tablero', fr: 'Tableau de bord', ar: 'لوحة التحكم' },
    'Invoices': { es: 'Facturas', fr: 'Factures', ar: 'الفواتير' },
    'Clients': { es: 'Clientes', fr: 'Clients', ar: 'العملاء' },
    'Expenses': { es: 'Gastos', fr: 'Dépenses', ar: 'المصروفات' },
    'Save': { es: 'Guardar', fr: 'Enregistrer', ar: 'حفظ' },
    'Cancel': { es: 'Cancelar', fr: 'Annuler', ar: 'إلغاء' },
    'Delete': { es: 'Eliminar', fr: 'Supprimer', ar: 'حذف' },
    'Edit': { es: 'Editar', fr: 'Modifier', ar: 'تعديل' },
    'View': { es: 'Ver', fr: 'Voir', ar: 'عرض' },
    'Add': { es: 'Agregar', fr: 'Ajouter', ar: 'إضافة' },
    'Search': { es: 'Buscar', fr: 'Rechercher', ar: 'بحث' },
    'Export': { es: 'Exportar', fr: 'Exporter', ar: 'تصدير' },
    'Total Invoices': { es: 'Facturas totales', fr: 'Factures totales', ar: 'إجمالي الفواتير' },
    'Total Clients': { es: 'Clientes totales', fr: 'Clients totaux', ar: 'إجمالي العملاء' },
    'Total Revenue': { es: 'Ingresos totales', fr: 'Revenu total', ar: 'إجمالي الإيرادات' },
    'Pending Amount': { es: 'Monto pendiente', fr: 'Montant en attente', ar: 'المبلغ المعلق' },
    'Recent Invoices': { es: 'Facturas recientes', fr: 'Factures récentes', ar: 'الفواتير الأخيرة' },
    'View All': { es: 'Ver todo', fr: 'Voir tout', ar: 'عرض الكل' },
    'Quick Actions': { es: 'Acciones rápidas', fr: 'Actions rapides', ar: 'إجراءات سريعة' },
    'New Invoice': { es: 'Nueva factura', fr: 'Nouvelle facture', ar: 'فاتورة جديدة' },
    'Add Client': { es: 'Agregar cliente', fr: 'Ajouter un client', ar: 'إضافة عميل' },
    'Mark as Sent': { es: 'Marcar como enviada', fr: 'Marquer comme envoyée', ar: 'تحديد كمرسلة' },
    'Mark as Paid': { es: 'Marcar como pagada', fr: 'Marquer comme payée', ar: 'تحديد كمدفوعة' },
    'Download PDF': { es: 'Descargar PDF', fr: 'Télécharger PDF', ar: 'تحميل PDF' },
    'Send Email': { es: 'Enviar correo', fr: 'Envoyer un email', ar: 'إرسال بريد' },
    'Pay Now': { es: 'Pagar ahora', fr: 'Payer maintenant', ar: 'ادفع الآن' },
    'Invoice Number': { es: 'Número de factura', fr: 'Numéro de facture', ar: 'رقم الفاتورة' },
    'Due Date': { es: 'Fecha de vencimiento', fr: "Date d'échéance", ar: 'تاريخ الاستحقاق' },
    'Status': { es: 'Estado', fr: 'Statut', ar: 'الحالة' },
    'Amount': { es: 'Monto', fr: 'Montant', ar: 'المبلغ' },
    'Date': { es: 'Fecha', fr: 'Date', ar: 'التاريخ' },
    'Subtotal': { es: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
    'Tax': { es: 'Impuesto', fr: 'Taxe', ar: 'الضريبة' },
    'Discount': { es: 'Descuento', fr: 'Réduction', ar: 'الخصم' },
    'Total': { es: 'Total', fr: 'Total', ar: 'المجموع' },
    'Currency': { es: 'Moneda', fr: 'Devise', ar: 'العملة' },
    'Notes': { es: 'Notas', fr: 'Notes', ar: 'ملاحظات' },
    'Description': { es: 'Descripción', fr: 'Description', ar: 'الوصف' },
    'Category': { es: 'Categoría', fr: 'Catégorie', ar: 'الفئة' },
    'Login': { es: 'Iniciar sesión', fr: 'Connexion', ar: 'تسجيل الدخول' },
    'Sign Up': { es: 'Registrarse', fr: "S'inscrire", ar: 'التسجيل' },
    'Logout': { es: 'Cerrar sesión', fr: 'Déconnexion', ar: 'تسجيل الخروج' },
    'Dark Mode': { es: 'Modo oscuro', fr: 'Mode sombre', ar: 'الوضع الداكن' },
    'Light Mode': { es: 'Modo claro', fr: 'Mode clair', ar: 'الوضع المضيء' },
    'Language': { es: 'Idioma', fr: 'Langue', ar: 'اللغة' },
    'Subscription': { es: 'Suscripción', fr: 'Abonnement', ar: 'الاشتراك' },
    'Settings': { es: 'Configuración', fr: 'Paramètres', ar: 'الإعدادات' },
    'Reports': { es: 'Informes', fr: 'Rapports', ar: 'التقارير' },
    'Estimates': { es: 'Presupuestos', fr: 'Devis', ar: 'تقديرات' },
    'Recurring': { es: 'Recurrentes', fr: 'Récurrentes', ar: 'متكرر' },
    'Free': { es: 'Gratis', fr: 'Gratuit', ar: 'مجاني' },
    'Pro': { es: 'Pro', fr: 'Pro', ar: 'احترافي' },
    'Business': { es: 'Empresarial', fr: 'Entreprise', ar: 'تجاري' },
    'Upgrade': { es: 'Actualizar', fr: 'Mettre à niveau', ar: 'ترقية' },
    'Subscribe Now': { es: 'Suscribirse ahora', fr: "S'abonner maintenant", ar: 'اشترك الآن' },
    'Welcome Back': { es: 'Bienvenido de nuevo', fr: 'Bon retour', ar: 'مرحباً بعودتك' },
    'Create Account': { es: 'Crear cuenta', fr: 'Créer un compte', ar: 'إنشاء حساب' },
    'Forgot Password': { es: 'Olvidé mi contraseña', fr: 'Mot de passe oublié', ar: 'نسيت كلمة المرور' },
    'Reset Password': { es: 'Restablecer contraseña', fr: 'Réinitialiser le mot de passe', ar: 'إعادة تعيين كلمة المرور' },
    'Update Password': { es: 'Actualizar contraseña', fr: 'Mettre à jour le mot de passe', ar: 'تحديث كلمة المرور' },
    'Remember Me': { es: 'Recordarme', fr: 'Se souvenir de moi', ar: 'تذكرني' },
    'Sign in with Google': { es: 'Iniciar sesión con Google', fr: 'Se connecter avec Google', ar: 'تسجيل الدخول عبر Google' },
  }
  
  const displayText = text || children
  const translated = translations[displayText]?.[locale] || displayText
  
  return <>{translated}</>
}
