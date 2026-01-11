'use client';

import { useEffect, useState } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProviderServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/provider/services', {
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/provider/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });

      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('provider.services.title')}</h1>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('provider.services.create')}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {service.category_name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {service.description || '-'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {service.base_price} {service.currency}
                      </p>
                      {service.duration_minutes && (
                        <p className="text-sm text-gray-600">
                          {service.duration_minutes} {t('provider.services.duration')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No services found</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('provider.services.create')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProviderLayout>
  );
}
