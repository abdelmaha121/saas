'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', labelEn: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'المستخدمون', labelEn: 'Users' },
  { href: '/admin/providers', icon: Shield, label: 'مقدمو الخدمات', labelEn: 'Providers' },
  { href: '/admin/services', icon: Briefcase, label: 'الخدمات', labelEn: 'Services' },
  { href: '/admin/categories', icon: Tag, label: 'الفئات', labelEn: 'Categories' },
  { href: '/admin/bookings', icon: Calendar, label: 'الحجوزات', labelEn: 'Bookings' },
  { href: '/admin/payments', icon: DollarSign, label: 'المدفوعات', labelEn: 'Payments' },
  { href: '/admin/analytics', icon: TrendingUp, label: 'التحليلات', labelEn: 'Analytics' },
  { href: '/admin/audit', icon: FileText, label: 'سجل التدقيق', labelEn: 'Audit Log' },
  { href: '/admin/settings', icon: Settings, label: 'الإعدادات', labelEn: 'Settings' },
];

export function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();
  const { language, t } = useLanguage();

  useEffect(() => {
    fetchPendingCounts();
  }, []);

  const fetchPendingCounts = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const data = await response.json();
      if (response.ok && data.stats) {
        setPendingCount(data.stats.pendingBookings || 0);
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-lg font-bold text-white">خد</span>
          </div>
          <div>
            <h1 className="font-bold">لوحة الإدارة</h1>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-card border-l z-50 transition-transform lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-white">خد</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">لوحة الإدارة</h1>
                <p className="text-xs text-muted-foreground">إدارة المنصة</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">مدير النظام</h3>
                  <p className="text-xs text-muted-foreground">admin@services.sa</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">صلاحيات كاملة</Badge>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === '/admin/dashboard' && pathname === '/admin');
                const showBadge = item.href === '/admin/bookings' && pendingCount > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{language === 'ar' ? item.label : item.labelEn}</span>
                    </div>
                    {showBadge && (
                      <Badge
                        className={`${
                          isActive
                            ? 'bg-primary-foreground text-primary'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {pendingCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-5 w-5 ml-3" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
