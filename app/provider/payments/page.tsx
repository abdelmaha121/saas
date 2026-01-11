'use client';

import { useState, useEffect } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Search, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
}

interface Earnings {
  totalEarnings: number;
  pendingPayments: number;
  paidPayments: number;
  thisMonthEarnings: number;
}

export default function ProviderPaymentsPage() {
  const { language, t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [earnings, setEarnings] = useState<Earnings>({
    totalEarnings: 0,
    pendingPayments: 0,
    paidPayments: 0,
    thisMonthEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/payments');
      const data = await response.json();
      if (response.ok) {
        setPayments(data.payments || []);
        calculateEarnings(data.payments || []);
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = (paymentsData: Payment[]) => {
    const now = new Date();
    const thisMonth = paymentsData.filter(p => {
      const pDate = new Date(p.created_at);
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    });

    setEarnings({
      totalEarnings: paymentsData.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: paymentsData.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      paidPayments: paymentsData.filter(p => p.status === 'paid').length,
      thisMonthEarnings: thisMonth.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      failed: 'destructive',
      refunded: 'outline',
    };
    const labels: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'معلق', en: 'Pending' },
      paid: { ar: 'مدفوع', en: 'Paid' },
      failed: { ar: 'فشل', en: 'Failed' },
      refunded: { ar: 'مسترجع', en: 'Refunded' },
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {language === 'ar' ? labels[status]?.ar : labels[status]?.en}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'المدفوعات والأرباح' : 'Payments & Earnings'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'تتبع مدفوعاتك وأرباحك' : 'Track your payments and earnings'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
                </p>
                <h3 className="text-2xl font-bold">{earnings.totalEarnings.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المدفوعات المعلقة' : 'Pending Payments'}
                </p>
                <h3 className="text-2xl font-bold">{earnings.pendingPayments.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أرباح هذا الشهر' : 'This Month Earnings'}
                </p>
                <h3 className="text-2xl font-bold">{earnings.thisMonthEarnings.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المدفوعات المكتملة' : 'Completed Payments'}
                </p>
                <h3 className="text-2xl font-bold">{earnings.paidPayments}</h3>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث برقم المعاملة...' : 'Search by transaction ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</SelectItem>
                <SelectItem value="paid">{language === 'ar' ? 'مدفوع' : 'Paid'}</SelectItem>
                <SelectItem value="failed">{language === 'ar' ? 'فشل' : 'Failed'}</SelectItem>
                <SelectItem value="refunded">{language === 'ar' ? 'مسترجع' : 'Refunded'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'رقم المعاملة' : 'Transaction ID'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.transaction_id || payment.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{payment.amount} {payment.currency}</TableCell>
                    <TableCell>{payment.payment_method || '-'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </ProviderLayout>
  );
}
