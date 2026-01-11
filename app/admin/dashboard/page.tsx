'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Store,
  ShoppingBag,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import Link from 'next/link';

interface Statistics {
  users: number;
  providers: number;
  services: number;
  bookings: number;
  revenue: {
    total: number;
    commission: number;
  };
  bookingsByStatus: Record<string, number>;
  recentBookings: any[];
}

export default function AdminDashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/statistics', {
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data.statistics);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setError(error instanceof Error ? error.message : 'فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/export?format=${format}`, {
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <LoadingSpinner size="lg" text="جاري تحميل لوحة التحكم..." />
        </div>
      </AdminLayout>
    );
  }

  if (error || !statistics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <ErrorMessage
            title="خطأ في التحميل"
            message={error || 'فشل في تحميل البيانات'}
            onRetry={fetchStatistics}
          />
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'إجمالي المستخدمين',
      value: statistics.users,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      link: '/admin/users',
    },
    {
      title: 'مقدمو الخدمات',
      value: statistics.providers,
      icon: Store,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
      link: '/admin/providers',
    },
    {
      title: 'إجمالي الخدمات',
      value: statistics.services,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      trend: '+15%',
      trendUp: true,
      link: '/admin/services',
    },
    {
      title: 'إجمالي الحجوزات',
      value: statistics.bookings,
      icon: Calendar,
      color: 'bg-orange-500',
      trend: '+23%',
      trendUp: true,
      link: '/admin/bookings',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${statistics.revenue.total.toFixed(2)} ر.س`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: '+18%',
      trendUp: true,
      link: '/admin/payments',
    },
    {
      title: 'إجمالي العمولات',
      value: `${statistics.revenue.commission.toFixed(2)} ر.س`,
      icon: DollarSign,
      color: 'bg-pink-500',
      trend: '+18%',
      trendUp: true,
      link: '/admin/payments',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    refunded: 'مسترجع',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-600 mt-2">نظرة عامة على النظام والإحصائيات</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStatistics()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('excel')}
              disabled={exporting}
            >
              <Download className="h-4 w-4 ml-2" />
              {exporting ? 'جاري التصدير...' : 'تصدير البيانات'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;

            return (
              <Link key={index} href={stat.link}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${stat.trendUp ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}
                      >
                        <TrendIcon className="h-3 w-3 ml-1" />
                        {stat.trend}
                      </Badge>
                      <span className="text-xs text-gray-500">من الشهر الماضي</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                الحجوزات حسب الحالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statistics.bookingsByStatus).map(([status, count]) => {
                  const total = Object.values(statistics.bookingsByStatus).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                            {statusLabels[status] || status}
                          </Badge>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  أحدث الحجوزات
                </CardTitle>
                <Link href="/admin/bookings">
                  <Button variant="ghost" size="sm">
                    عرض الكل
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.recentBookings?.length > 0 ? (
                  statistics.recentBookings.slice(0, 5).map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{booking.service_name}</p>
                        <p className="text-xs text-gray-500">
                          {booking.customer_first_name} {booking.customer_last_name}
                        </p>
                      </div>
                      <div className="text-left">
                        <Badge className={statusColors[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.total_amount} ر.س
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد حجوزات حديثة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">مراقبة النظام في الوقت الفعلي</h3>
                <p className="text-sm text-gray-600">يتم تحديث البيانات تلقائياً كل 30 ثانية</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600">النظام يعمل</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
