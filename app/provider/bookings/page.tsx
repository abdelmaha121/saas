'use client';

import { useEffect, useState } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ProviderBookingsPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(filter !== 'all' && { status: filter }),
      });

      const response = await fetch(`/api/provider/bookings?${params}`, {
        headers: {
          'x-tenant-subdomain': 'demo',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/provider/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': 'demo',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const statusFilters = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('provider.bookings.title')}</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : t(`provider.bookings.${status}` as any) || t(`status.${status}` as any)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.service_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.customer_first_name} {booking.customer_last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.customer_email} • {booking.customer_phone}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t(`status.${booking.status}` as any)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Scheduled</p>
                      <p className="font-medium">
                        {format(new Date(booking.scheduled_at), 'PPP p')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-lg">
                        {booking.total_amount} {booking.currency}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-sm">{booking.notes}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                    >
                      Start Service
                    </Button>
                  )}

                  {booking.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No bookings found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProviderLayout>
  );
}
