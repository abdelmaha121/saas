'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { api } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Provider {
  id: string;
  businessName: string;
  businessNameAr: string;
  email: string;
  phone: string;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  isActive: boolean;
  featured: boolean;
  created_at: string;
}

export default function AdminProvidersPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (user) {
      loadProviders();
    }
  }, [user, search, statusFilter, pagination.page]);

  const loadProviders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const data = await api.get<{ providers: Provider[]; pagination: any }>(
        `/admin/providers?${params.toString()}`
      );

      setProviders(data.providers || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.put(`/admin/providers/${id}`, {
        verificationStatus: 'verified',
      });
      alert(language === 'ar' ? 'تم التوثيق بنجاح' : 'Verified successfully');
      loadProviders();
    } catch (error: any) {
      alert(error.message || 'Failed to verify');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/admin/providers/${id}`, {
        verificationStatus: 'rejected',
      });
      alert(language === 'ar' ? 'تم الرفض' : 'Rejected');
      loadProviders();
    } catch (error: any) {
      alert(error.message || 'Failed to reject');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/admin/providers/${id}`, {
        isActive: !isActive,
      });
      loadProviders();
    } catch (error: any) {
      alert(error.message || 'Failed to update');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { label: language === 'ar' ? 'قيد المراجعة' : 'Pending', variant: 'secondary', icon: AlertCircle },
      verified: { label: language === 'ar' ? 'موثق' : 'Verified', variant: 'default', icon: CheckCircle },
      rejected: { label: language === 'ar' ? 'مرفوض' : 'Rejected', variant: 'destructive', icon: XCircle },
    };
    return badges[status] || badges.pending;
  };

  if (loading && providers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'إدارة مقدمي الخدمات' : 'Providers Management'}
          </h1>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
              </Button>
              <Button
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('verified')}
              >
                {language === 'ar' ? 'موثق' : 'Verified'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Providers List */}
        <div className="space-y-4">
          {providers.map((provider) => {
            const statusBadge = getStatusBadge(provider.verificationStatus);

            return (
              <Card key={provider.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {language === 'ar' ? provider.businessNameAr : provider.businessName}
                      </h3>
                      <Badge variant={statusBadge.variant as any}>
                        {statusBadge.label}
                      </Badge>
                      {provider.featured && (
                        <Badge variant="outline">
                          {language === 'ar' ? 'مميز' : 'Featured'}
                        </Badge>
                      )}
                      {!provider.isActive && (
                        <Badge variant="destructive">
                          {language === 'ar' ? 'غير نشط' : 'Inactive'}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">
                      {provider.email} • {provider.phone}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>⭐ {provider.rating.toFixed(1)} ({provider.totalReviews})</span>
                      <span>📦 {provider.totalBookings} {language === 'ar' ? 'حجز' : 'bookings'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {provider.verificationStatus === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(provider.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'توثيق' : 'Verify'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(provider.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'رفض' : 'Reject'}
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(provider.id, provider.isActive)}
                    >
                      {provider.isActive
                        ? language === 'ar' ? 'تعطيل' : 'Deactivate'
                        : language === 'ar' ? 'تفعيل' : 'Activate'}
                    </Button>

                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'عرض' : 'View'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>

            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? 'صفحة' : 'Page'} {pagination.page} {language === 'ar' ? 'من' : 'of'} {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
