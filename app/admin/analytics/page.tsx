'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  totalProviders: number;
  totalServices: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
}

export default function AdminAnalyticsPage() {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProviders: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/statistics');
      const data = await response.json();
      if (response.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
    },
    {
      title: language === 'ar' ? 'مقدمو الخدمات' : 'Service Providers',
      value: stats.totalProviders,
      icon: Briefcase,
      color: 'green',
    },
    {
      title: language === 'ar' ? 'إجمالي الخدمات' : 'Total Services',
      value: stats.totalServices,
      icon: Star,
      color: 'purple',
    },
    {
      title: language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'orange',
    },
    {
      title: language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `${stats.totalRevenue.toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: language === 'ar' ? 'متوسط التقييم' : 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'yellow',
    },
    {
      title: language === 'ar' ? 'الحجوزات المعلقة' : 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Calendar,
      color: 'yellow',
    },
    {
      title: language === 'ar' ? 'الحجوزات النشطة' : 'Active Bookings',
      value: stats.activeBookings,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: language === 'ar' ? 'الحجوزات المكتملة' : 'Completed Bookings',
      value: stats.completedBookings,
      icon: Calendar,
      color: 'green',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'نظرة شاملة على أداء المنصة' : 'Comprehensive overview of platform performance'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-500/10 text-blue-500',
                green: 'bg-green-500/10 text-green-500',
                purple: 'bg-purple-500/10 text-purple-500',
                orange: 'bg-orange-500/10 text-orange-500',
                yellow: 'bg-yellow-500/10 text-yellow-500',
              };

              return (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[stat.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
