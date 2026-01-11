'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { api } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  service_name_ar: string;
  customer_name: string;
  customer_phone: string;
  customer_address: any;
  status: string;
  scheduled_at: string;
  total_amount: number;
  currency: string;
  notes: string;
}

export default function JobExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checklist, setChecklist] = useState({
    arrived: false,
    started: false,
    completed: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && params.id) {
      loadBooking();
    }
  }, [user, params.id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ booking: Booking }>(`/provider/bookings/${params.id}`);
      setBooking(data.booking);

      if (data.booking.status === 'in_progress') {
        setChecklist({
          arrived: true,
          started: true,
          completed: false,
        });
      }
    } catch (error: any) {
      console.error('Failed to load booking:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      setError('');

      await api.put(`/provider/bookings/${params.id}/status`, {
        status: newStatus,
      });

      alert(
        language === 'ar'
          ? 'تم تحديث حالة الحجز بنجاح'
          : 'Booking status updated successfully'
      );

      router.push('/provider/bookings');
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleStartJob = () => {
    setChecklist({ ...checklist, arrived: true, started: true });
    handleUpdateStatus('in_progress');
  };

  const handleCompleteJob = () => {
    if (!checklist.arrived || !checklist.started) {
      setError(
        language === 'ar'
          ? 'الرجاء إكمال جميع الخطوات'
          : 'Please complete all steps'
      );
      return;
    }

    handleUpdateStatus('completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'خطأ' : 'Error'}
          </h2>
          <p className="text-muted-foreground mb-4">{error || (language === 'ar' ? 'الحجز غير موجود' : 'Booking not found')}</p>
          <Button onClick={() => router.push('/provider/bookings')}>
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'تنفيذ الخدمة' : 'Job Execution'}
          </h1>
          <Badge variant={booking.status === 'in_progress' ? 'default' : 'secondary'}>
            {booking.status === 'confirmed'
              ? language === 'ar' ? 'مؤكد' : 'Confirmed'
              : language === 'ar' ? 'جاري التنفيذ' : 'In Progress'}
          </Badge>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 text-destructive">
            {error}
          </Card>
        )}

        {/* Customer Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </p>
              <p className="font-semibold">{booking.customer_name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الهاتف' : 'Phone'}
              </p>
              <p className="font-semibold">{booking.customer_phone}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'العنوان' : 'Address'}
              </p>
              <p className="font-medium">
                {typeof booking.customer_address === 'string'
                  ? booking.customer_address
                  : JSON.stringify(booking.customer_address)}
              </p>
            </div>

            {booking.notes && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'ملاحظات' : 'Notes'}
                </p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Job Checklist */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'ar' ? 'قائمة المهام' : 'Job Checklist'}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Checkbox
                checked={checklist.arrived}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, arrived: checked as boolean })
                }
                disabled={booking.status === 'in_progress'}
              />
              <label className="text-sm font-medium">
                {language === 'ar' ? 'وصلت إلى موقع العميل' : 'Arrived at customer location'}
              </label>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Checkbox
                checked={checklist.started}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, started: checked as boolean })
                }
                disabled={booking.status === 'in_progress'}
              />
              <label className="text-sm font-medium">
                {language === 'ar' ? 'بدأت العمل' : 'Started the job'}
              </label>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Checkbox
                checked={checklist.completed}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, completed: checked as boolean })
                }
              />
              <label className="text-sm font-medium">
                {language === 'ar' ? 'أكملت العمل' : 'Completed the job'}
              </label>
            </div>
          </div>
        </Card>

        {/* Photo Upload */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'ar' ? 'صور العمل' : 'Job Photos'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                {language === 'ar' ? 'صور قبل' : 'Before Photos'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'قريباً' : 'Coming Soon'}
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                {language === 'ar' ? 'صور بعد' : 'After Photos'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'قريباً' : 'Coming Soon'}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6">
          <div className="space-y-3">
            {booking.status === 'confirmed' && (
              <Button
                className="w-full"
                onClick={handleStartJob}
                disabled={updating || !checklist.arrived}
              >
                {updating
                  ? language === 'ar' ? 'جاري التحديث...' : 'Updating...'
                  : language === 'ar' ? 'بدء العمل' : 'Start Job'}
              </Button>
            )}

            {booking.status === 'in_progress' && (
              <Button
                className="w-full"
                onClick={handleCompleteJob}
                disabled={updating}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {updating
                  ? language === 'ar' ? 'جاري الإكمال...' : 'Completing...'
                  : language === 'ar' ? 'إتمام العمل' : 'Complete Job'}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/provider/bookings')}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
