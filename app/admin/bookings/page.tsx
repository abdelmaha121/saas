'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Search, Eye, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  booking_type: 'one_time' | 'recurring' | 'emergency';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  scheduled_at: string;
  completed_at?: string;
  total_amount: number;
  commission_amount?: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer?: { first_name: string; last_name: string };
  provider?: { business_name: string };
  service?: { name: string; name_ar?: string };
  created_at: string;
}

export default function AdminBookingsPage() {
  const { language, t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentBooking || !newStatus) return;

    try {
      const response = await fetch(`/api/admin/bookings/${currentBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث حالة الحجز' : 'Booking status updated');
        setIsStatusDialogOpen(false);
        setCurrentBooking(null);
        setNewStatus('');
        fetchBookings();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف الحجز بنجاح' : 'Booking deleted successfully');
        setIsDeleteDialogOpen(false);
        setCurrentBooking(null);
        fetchBookings();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error(t('common.error'));
    }
  };

  const handleMultiDelete = async () => {
    try {
      const deletePromises = selectedBookings.map(id =>
        fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      toast.success(language === 'ar' ? 'تم حذف الحجوزات بنجاح' : 'Bookings deleted successfully');
      setIsMultiDeleteDialogOpen(false);
      setSelectedBookings([]);
      fetchBookings();
    } catch (error) {
      console.error('Error deleting bookings:', error);
      toast.error(t('common.error'));
    }
  };

  const openViewDialog = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsViewDialogOpen(true);
  };

  const openStatusDialog = (booking: Booking) => {
    setCurrentBooking(booking);
    setNewStatus(booking.status);
    setIsStatusDialogOpen(true);
  };

  const openDeleteDialog = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
      refunded: 'outline',
    };

    const labels: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed' },
      in_progress: { ar: 'قيد التنفيذ', en: 'In Progress' },
      completed: { ar: 'مكتمل', en: 'Completed' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' },
      refunded: { ar: 'مسترجع', en: 'Refunded' },
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {language === 'ar' ? labels[status]?.ar : labels[status]?.en}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.provider?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesPaymentStatus =
      filterPaymentStatus === 'all' || booking.payment_status === filterPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const toggleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
    }
  };

  const toggleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إدارة الحجوزات' : 'Bookings Management'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar'
                ? 'إدارة ومراقبة جميع الحجوزات في المنصة'
                : 'Manage and monitor all bookings on the platform'}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'ar' ? 'حالة الحجز' : 'Booking Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                <SelectItem value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</SelectItem>
                <SelectItem value="in_progress">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                <SelectItem value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'ar' ? 'حالة الدفع' : 'Payment Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</SelectItem>
                <SelectItem value="paid">{language === 'ar' ? 'مدفوع' : 'Paid'}</SelectItem>
                <SelectItem value="failed">{language === 'ar' ? 'فشل' : 'Failed'}</SelectItem>
                <SelectItem value="refunded">{language === 'ar' ? 'مسترجع' : 'Refunded'}</SelectItem>
              </SelectContent>
            </Select>
            {selectedBookings.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsMultiDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                {language === 'ar' ? `حذف (${selectedBookings.length})` : `Delete (${selectedBookings.length})`}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedBookings.length === filteredBookings.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{language === 'ar' ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المزود' : 'Provider'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الخدمة' : 'Service'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الموعد' : 'Date'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{language === 'ar' ? 'حالة الحجز' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'حالة الدفع' : 'Payment'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBookings.includes(booking.id)}
                        onCheckedChange={() => toggleSelectBooking(booking.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {booking.customer
                        ? `${booking.customer.first_name} ${booking.customer.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>{booking.provider?.business_name || '-'}</TableCell>
                    <TableCell>
                      {language === 'ar' && booking.service?.name_ar
                        ? booking.service.name_ar
                        : booking.service?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.scheduled_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {booking.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(booking.payment_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openStatusDialog(booking)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(booking)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'العميل' : 'Customer'}</Label>
                  <p className="font-medium">
                    {currentBooking.customer
                      ? `${currentBooking.customer.first_name} ${currentBooking.customer.last_name}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'المزود' : 'Provider'}</Label>
                  <p className="font-medium">{currentBooking.provider?.business_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الخدمة' : 'Service'}</Label>
                  <p className="font-medium">{currentBooking.service?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'نوع الحجز' : 'Booking Type'}</Label>
                  <p className="font-medium">{currentBooking.booking_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الموعد' : 'Scheduled'}</Label>
                  <p className="font-medium">
                    {format(new Date(currentBooking.scheduled_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</Label>
                  <p className="font-medium">
                    {currentBooking.total_amount} {currentBooking.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'العمولة' : 'Commission'}</Label>
                  <p className="font-medium">
                    {currentBooking.commission_amount || 0} {currentBooking.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'حالة الحجز' : 'Booking Status'}</Label>
                  <div className="mt-1">{getStatusBadge(currentBooking.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'حالة الدفع' : 'Payment Status'}</Label>
                  <div className="mt-1">{getPaymentStatusBadge(currentBooking.payment_status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</Label>
                  <p className="font-medium">
                    {format(new Date(currentBooking.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t('common.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تحديث حالة الحجز' : 'Update Booking Status'}</DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'اختر الحالة الجديدة للحجز'
                : 'Select the new status for this booking'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                  <SelectItem value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</SelectItem>
                  <SelectItem value="in_progress">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                  <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</SelectItem>
                  <SelectItem value="refunded">{language === 'ar' ? 'مسترجع' : 'Refunded'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdateStatus}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? 'سيتم حذف هذا الحجز نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : 'This booking will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentBooking && handleDelete(currentBooking.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'حذف حجوزات متعددة' : 'Delete Multiple Bookings'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `سيتم حذف ${selectedBookings.length} حجز نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `${selectedBookings.length} bookings will be permanently deleted. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMultiDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
