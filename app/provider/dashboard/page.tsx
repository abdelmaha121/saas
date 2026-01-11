'use client';

import { useEffect, useState } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Calendar, DollarSign, Star } from 'lucide-react';

export default function ProviderDashboardPage() {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/provider/statistics', {
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-gray-600">{t('common.loading')}</p>
        </div>
      </ProviderLayout>
    );
  }

  const stats = [
    {
      title: t('provider.statistics.totalServices'),
      value: statistics?.services || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
    },
    {
      title: t('provider.statistics.totalBookings'),
      value: statistics?.bookings || 0,
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: t('provider.statistics.totalEarnings'),
      value: `${statistics?.earnings || 0} SAR`,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: t('provider.statistics.averageRating'),
      value: `${statistics?.rating?.average || 0} (${statistics?.rating?.total || 0})`,
      icon: Star,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
          <p className="text-gray-600 mt-2">{t('provider.title')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {statistics?.bookingsByStatus && (
          <Card>
            <CardHeader>
              <CardTitle>{t('provider.bookings.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(statistics.bookingsByStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {t(`provider.bookings.${status}` as any) || t(`status.${status}` as any)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProviderLayout>
  );
}
