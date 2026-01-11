'use client';

import { useEffect, useState } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  Users,
  Activity,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import Link from 'next/link';

interface Statistics {
  services: number;
  bookings: number;
  earnings: number;
  rating: {
    average: number;
    total: number;
  };
  bookingsByStatus: Record<string, number>;
  recentBookings?: any[];
}

export default function ProviderDashboardPage() {
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
      const response = await fetch('/api/provider/statistics', {
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
      setError('فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'excel') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/provider/export?format=${format}`, {
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `provider-data-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
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
      <ProviderLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <LoadingSpinner size="lg" text="جاري تحميل لوحة التحكم..." />
        </div>
      </ProviderLayout>
    );
  }

  if (error || !statistics) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <ErrorMessage
            title="خطأ في التحميل"
            message={error || 'فشل في تحميل البيانات'}
            onRetry={fetchStatistics}
          />
        </div>
      </ProviderLayout>
    );
  }

  const stats = [
    {
      title: 'إجمالي الخدمات',
      value: statistics.services,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      link: '/provider/services',
      trend: '+15%',
    },
    {
      title: 'إجمالي الحجوزات',
      value: statistics.bookings,
      icon: Calendar,
      color: 'bg-orange-500',
      link: '/provider/bookings',
      trend: '+23%',
    },
    {
      title: 'إجمالي الأرباح',
      value: `${statistics.earnings.toFixed(2)} ر.س`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      link: '/provider/earnings',
      trend: '+18%',
    },
    {
      title: 'التقييم',
      value: `${statistics.rating.average.toFixed(1)} (${statistics.rating.total})`,
      icon: Star,
      color: 'bg-yellow-500',
      link: '/provider/profile',
      trend: statistics.rating.average >= 4 ? '+5%' : '-2%',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-600 mt-2">نظرة عامة على خدماتك وحجوزاتك</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
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
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <TrendingUp className="h-3 w-3 ml-1" />
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
                  <Users className="h-5 w-5" />
                  روابط سريعة
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/provider/services/new">
                  <Button className="w-full" variant="outline">
                    <ShoppingBag className="h-4 w-4 ml-2" />
                    إضافة خدمة
                  </Button>
                </Link>
                <Link href="/provider/bookings">
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 ml-2" />
                    عرض الحجوزات
                  </Button>
                </Link>
                <Link href="/provider/earnings">
                  <Button className="w-full" variant="outline">
                    <DollarSign className="h-4 w-4 ml-2" />
                    الأرباح
                  </Button>
                </Link>
                <Link href="/provider/staff">
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 ml-2" />
                    الموظفين
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">تحديثات لحظية</h3>
                <p className="text-sm text-gray-600">يتم تحديث البيانات تلقائياً كل 30 ثانية</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600">متصل</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
}
