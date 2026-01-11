'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { api } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  completedJobs: number;
  averageJobValue: number;
  platformCommission: number;
}

interface Transaction {
  id: string;
  booking_id: string;
  service_name: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: string;
  completed_at: string;
  payment_status: string;
}

export default function EarningsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    completedJobs: 0,
    averageJobValue: 0,
    platformCommission: 15,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEarnings();
    }
  }, [user]);

  const loadEarnings = async () => {
    try {
      setLoading(true);

      // Load statistics
      const statsData = await api.get<any>('/provider/statistics');

      // Calculate earnings
      const totalEarnings = statsData.statistics?.totalRevenue || 0;
      const completedJobs = statsData.statistics?.completedBookings || 0;
      const platformCommission = statsData.statistics?.commissionRate || 15;

      setEarnings({
        totalEarnings,
        pendingEarnings: totalEarnings * 0.3, // Example calculation
        paidEarnings: totalEarnings * 0.7,
        completedJobs,
        averageJobValue: completedJobs > 0 ? totalEarnings / completedJobs : 0,
        platformCommission,
      });

      // Load transactions (from completed bookings)
      const bookingsData = await api.get<{ bookings: any[] }>(
        '/provider/bookings?status=completed&sort_by=completed_at&sort_order=DESC'
      );

      const txs = (bookingsData.bookings || []).map((booking: any) => ({
        id: booking.id,
        booking_id: booking.id,
        service_name: booking.service_name,
        amount: booking.total_amount,
        commission: booking.commission_amount || (booking.total_amount * platformCommission / 100),
        netAmount: booking.total_amount - (booking.commission_amount || (booking.total_amount * platformCommission / 100)),
        status: booking.status,
        completed_at: booking.completed_at || booking.updated_at,
        payment_status: booking.payment_status,
      }));

      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <ProviderLayout>
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">
          {language === 'ar' ? 'الأرباح والمدفوعات' : 'Earnings & Payments'}
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
              </p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {earnings.totalEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">SAR</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              </p>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {earnings.pendingEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">SAR</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'مدفوع' : 'Paid'}
              </p>
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {earnings.paidEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">SAR</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'متوسط قيمة الخدمة' : 'Avg. Job Value'}
              </p>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">
              {earnings.averageJobValue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">SAR</p>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                {language === 'ar' ? 'الكل' : 'All'}
              </TabsTrigger>
              <TabsTrigger value="paid">
                {language === 'ar' ? 'مدفوع' : 'Paid'}
              </TabsTrigger>
              <TabsTrigger value="pending">
                {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'ar' ? 'لا توجد معاملات' : 'No transactions'}
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{tx.service_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.completed_at).toLocaleDateString(
                            language === 'ar' ? 'ar-SA' : 'en-US'
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {tx.amount.toFixed(2)} SAR
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'العمولة: ' : 'Commission: '}
                          -{tx.commission.toFixed(2)} SAR ({earnings.platformCommission}%)
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {language === 'ar' ? 'الصافي: ' : 'Net: '}
                          {tx.netAmount.toFixed(2)} SAR
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="paid">
              <p className="text-center text-muted-foreground py-8">
                {language === 'ar' ? 'قريباً - تصفية المدفوعات' : 'Coming Soon - Filter paid'}
              </p>
            </TabsContent>

            <TabsContent value="pending">
              <p className="text-center text-muted-foreground py-8">
                {language === 'ar' ? 'قريباً - تصفية المعلق' : 'Coming Soon - Filter pending'}
              </p>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Commission Info */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'ar' ? 'معلومات العمولة' : 'Commission Information'}
          </h2>
          <div className="space-y-2">
            <p className="text-sm">
              {language === 'ar' ? 'عمولة المنصة: ' : 'Platform Commission: '}
              <span className="font-bold">{earnings.platformCommission}%</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'يتم خصم عمولة المنصة من كل حجز مكتمل'
                : 'Platform commission is deducted from each completed booking'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  </ProviderLayout>
  );
}
