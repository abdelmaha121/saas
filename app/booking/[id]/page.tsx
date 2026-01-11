'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle,
  Home as HomeIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  base_price: number;
  currency: string;
  duration_minutes: number;
  provider_id: string;
  provider_name: string;
  provider_business_name?: string;
  avg_rating: number;
  review_count: number;
}

interface ServiceAddon {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  isRequired: boolean;
}

interface BookingData {
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
}

const STEPS = [
  { id: 1, name: 'service', nameAr: 'تفاصيل الخدمة' },
  { id: 2, name: 'details', nameAr: 'بياناتك' },
  { id: 3, name: 'review', nameAr: 'المراجعة' },
  { id: 4, name: 'payment', nameAr: 'الدفع' },
  { id: 5, name: 'confirmation', nameAr: 'التأكيد' },
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: params.serviceId as string,
    scheduledDate: '',
    scheduledTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchService();
  }, [params.serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/services/${params.serviceId}`);
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setService(data.data.service);
        setAddons(data.data.addons || []);
        const requiredAddons = (data.data.addons || [])
          .filter((addon: ServiceAddon) => addon.isRequired)
          .map((addon: ServiceAddon) => addon.id);
        setSelectedAddons(requiredAddons);
      } else {
        setError(data.error || 'فشل في تحميل بيانات الخدمة');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!bookingData.scheduledDate) {
        newErrors.scheduledDate = language === 'ar' ? 'التاريخ مطلوب' : 'Date is required';
      }
      if (!bookingData.scheduledTime) {
        newErrors.scheduledTime = language === 'ar' ? 'الوقت مطلوب' : 'Time is required';
      }
    } else if (step === 2) {
      if (!bookingData.customerName || bookingData.customerName.trim().length < 3) {
        newErrors.customerName = language === 'ar' ? 'الاسم مطلوب (3 أحرف على الأقل)' : 'Name is required (min 3 characters)';
      }
      if (!bookingData.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)) {
        newErrors.customerEmail = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
      }
      if (!bookingData.customerPhone || !/^[0-9]{10}$/.test(bookingData.customerPhone.replace(/[\s-]/g, ''))) {
        newErrors.customerPhone = language === 'ar' ? 'رقم الجوال غير صحيح (10 أرقام)' : 'Invalid phone (10 digits)';
      }
      if (!bookingData.customerAddress || bookingData.customerAddress.trim().length < 10) {
        newErrors.customerAddress = language === 'ar' ? 'العنوان مطلوب (10 أحرف على الأقل)' : 'Address is required (min 10 characters)';
      }
    } else if (step === 4) {
      if (!paymentData.cardNumber || !/^[0-9]{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = language === 'ar' ? 'رقم البطاقة غير صحيح (16 رقم)' : 'Invalid card number (16 digits)';
      }
      if (!paymentData.cardName || paymentData.cardName.trim().length < 3) {
        newErrors.cardName = language === 'ar' ? 'اسم حامل البطاقة مطلوب' : 'Card holder name is required';
      }
      if (!paymentData.expiryDate || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = language === 'ar' ? 'تاريخ الانتهاء غير صحيح (MM/YY)' : 'Invalid expiry date (MM/YY)';
      }
      if (!paymentData.cvv || !/^[0-9]{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = language === 'ar' ? 'CVV غير صحيح (3-4 أرقام)' : 'Invalid CVV (3-4 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        createBooking();
      } else if (currentStep === 4) {
        processPayment();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalAmount = () => {
    if (!service) return 0;
    const basePrice = service.base_price;
    const addonsTotal = addons
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addonsTotal;
  };

  const toggleAddon = (addonId: string) => {
    const addon = addons.find(a => a.id === addonId);
    if (addon?.isRequired) return;

    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const createBooking = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const totalAmount = calculateTotalAmount();

      const response = await fetch('/api/bookings/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: bookingData.serviceId,
          scheduled_at: `${bookingData.scheduledDate} ${bookingData.scheduledTime}`,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          customer_address: bookingData.customerAddress,
          notes: bookingData.notes,
          total_amount: totalAmount,
          addon_ids: selectedAddons,
        }),
      });

      const data = await response.json();

      if (response.ok && data.booking) {
        setBookingId(data.booking.id);
        setCurrentStep(4);
      } else {
        setError(data.error || 'فشل في إنشاء الحجز');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('حدث خطأ في إنشاء الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  const processPayment = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const totalAmount = calculateTotalAmount();

      const response = await fetch('/api/payments/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: totalAmount,
          payment_method: 'credit_card',
          card_last_4: paymentData.cardNumber.slice(-4),
          card_holder_name: paymentData.cardName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.payment) {
        setPaymentSuccess(true);
        await confirmBooking();
      } else {
        setError(data.error || 'فشل في معالجة الدفع');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('حدث خطأ في معالجة الدفع');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep(5);
      } else {
        setError(data.error || 'فشل في تأكيد الحجز');
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('حدث خطأ في تأكيد الحجز');
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">{t('common.error')}</h3>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 ml-2" />
              {t('common.back')}
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              {language === 'ar' ? 'رجوع' : 'Back'}
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'ar' ? 'إتمام الحجز' : 'Complete Booking'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'أكمل الخطوات التالية لتأكيد حجزك' : 'Complete the following steps to confirm your booking'}
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="text-xs mt-2 text-center hidden md:block">
                      {language === 'ar' ? step.nameAr : step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Card className="p-4 mb-6 border-destructive bg-destructive/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </Card>
          )}

          {currentStep === 1 && service && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {language === 'ar' ? 'تفاصيل الخدمة' : 'Service Details'}
                </h2>
                <div className="flex gap-4 mb-6">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Shield className="h-12 w-12 text-primary/60" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {language === 'ar' && service.name_ar ? service.name_ar : service.name}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {language === 'ar' && service.description_ar ? service.description_ar : service.description}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge className="bg-primary/10 text-primary">
                        <Star className="h-3 w-3 ml-1 fill-current" />
                        {service.avg_rating ? Number(service.avg_rating).toFixed(1) : '0.0'} ({service.review_count || 0})
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 ml-1" />
                        {service.duration_minutes} {language === 'ar' ? 'دقيقة' : 'min'}
                      </Badge>
                      <Badge variant="outline" className="text-lg font-bold">
                        {service.base_price} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4">
                    {language === 'ar' ? 'اختر التاريخ والوقت' : 'Select Date & Time'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">
                        <Calendar className="h-4 w-4 inline ml-2" />
                        {language === 'ar' ? 'التاريخ' : 'Date'}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        min={getTomorrowDate()}
                        value={bookingData.scheduledDate}
                        onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                        className={errors.scheduledDate ? 'border-destructive' : ''}
                      />
                      {errors.scheduledDate && <p className="text-sm text-destructive mt-1">{errors.scheduledDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="time">
                        <Clock className="h-4 w-4 inline ml-2" />
                        {language === 'ar' ? 'الوقت' : 'Time'}
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={bookingData.scheduledTime}
                        onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                        className={errors.scheduledTime ? 'border-destructive' : ''}
                      />
                      {errors.scheduledTime && <p className="text-sm text-destructive mt-1">{errors.scheduledTime}</p>}
                    </div>
                  </div>
                </div>

                {addons.length > 0 && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-bold mb-4">
                      {language === 'ar' ? 'الإضافات الاختيارية' : 'Optional Add-ons'}
                    </h3>
                    <div className="space-y-3">
                      {addons.map((addon) => (
                        <label
                          key={addon.id}
                          className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                            selectedAddons.includes(addon.id) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                          } ${addon.isRequired ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedAddons.includes(addon.id)}
                              onChange={() => toggleAddon(addon.id)}
                              disabled={addon.isRequired}
                              className="w-5 h-5 rounded border-input"
                            />
                            <div>
                              <span className="font-medium block">
                                {language === 'ar' ? addon.nameAr : addon.name}
                              </span>
                              {addon.isRequired && (
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ar' ? '(مطلوب)' : '(Required)'}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-primary font-bold">+{addon.price} {language === 'ar' ? 'ريال' : 'SAR'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'ar' ? 'معلوماتك الشخصية' : 'Your Information'}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline ml-2" />
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                    className={errors.customerName ? 'border-destructive' : ''}
                  />
                  {errors.customerName && <p className="text-sm text-destructive mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline ml-2" />
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    className={errors.customerEmail ? 'border-destructive' : ''}
                  />
                  {errors.customerEmail && <p className="text-sm text-destructive mt-1">{errors.customerEmail}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline ml-2" />
                    {language === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={language === 'ar' ? '05xxxxxxxx' : '05xxxxxxxx'}
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                    className={errors.customerPhone ? 'border-destructive' : ''}
                  />
                  {errors.customerPhone && <p className="text-sm text-destructive mt-1">{errors.customerPhone}</p>}
                </div>
                <div>
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline ml-2" />
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </Label>
                  <Textarea
                    id="address"
                    placeholder={language === 'ar' ? 'أدخل عنوانك بالتفصيل' : 'Enter your detailed address'}
                    value={bookingData.customerAddress}
                    onChange={(e) => setBookingData({ ...bookingData, customerAddress: e.target.value })}
                    className={errors.customerAddress ? 'border-destructive' : ''}
                    rows={3}
                  />
                  {errors.customerAddress && <p className="text-sm text-destructive mt-1">{errors.customerAddress}</p>}
                </div>
                <div>
                  <Label htmlFor="notes">
                    {language === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={language === 'ar' ? 'أي ملاحظات خاصة' : 'Any special notes'}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}

          {currentStep === 3 && service && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'ar' ? 'مراجعة الحجز' : 'Review Booking'}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">{language === 'ar' ? 'الخدمة' : 'Service'}</h3>
                  <p className="text-lg">{language === 'ar' && service.name_ar ? service.name_ar : service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.provider_business_name || service.provider_name}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-2">{language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(bookingData.scheduledDate), 'dd/MM/yyyy')}</span>
                    <Clock className="h-4 w-4 mr-4" />
                    <span>{bookingData.scheduledTime}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-2">{language === 'ar' ? 'معلوماتك' : 'Your Information'}</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {bookingData.customerName}</p>
                    <p><strong>{language === 'ar' ? 'البريد:' : 'Email:'}</strong> {bookingData.customerEmail}</p>
                    <p><strong>{language === 'ar' ? 'الجوال:' : 'Phone:'}</strong> {bookingData.customerPhone}</p>
                    <p><strong>{language === 'ar' ? 'العنوان:' : 'Address:'}</strong> {bookingData.customerAddress}</p>
                    {bookingData.notes && <p><strong>{language === 'ar' ? 'ملاحظات:' : 'Notes:'}</strong> {bookingData.notes}</p>}
                  </div>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-2">{language === 'ar' ? 'الإضافات المختارة' : 'Selected Add-ons'}</h3>
                    <div className="space-y-2">
                      {addons
                        .filter(addon => selectedAddons.includes(addon.id))
                        .map(addon => (
                          <div key={addon.id} className="flex items-center justify-between text-sm">
                            <span>{language === 'ar' ? addon.nameAr : addon.name}</span>
                            <span className="font-medium">+{addon.price} {language === 'ar' ? 'ريال' : 'SAR'}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{language === 'ar' ? 'سعر الخدمة' : 'Service Price'}</span>
                      <span>{service.base_price} {language === 'ar' ? 'ريال' : 'SAR'}</span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{language === 'ar' ? 'الإضافات' : 'Add-ons'}</span>
                        <span>+{addons.filter(a => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0)} {language === 'ar' ? 'ريال' : 'SAR'}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                      <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span className="text-2xl text-primary">{calculateTotalAmount()} {language === 'ar' ? 'ريال' : 'SAR'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 4 && service && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'ar' ? 'الدفع الإلكتروني' : 'Payment'}
              </h2>
              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}</span>
                  <span className="text-2xl font-bold text-primary">{calculateTotalAmount()} {language === 'ar' ? 'ريال' : 'SAR'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">
                    <CreditCard className="h-4 w-4 inline ml-2" />
                    {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setPaymentData({ ...paymentData, cardNumber: value });
                    }}
                    className={errors.cardNumber ? 'border-destructive' : ''}
                  />
                  {errors.cardNumber && <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="cardName">
                    {language === 'ar' ? 'اسم حامل البطاقة' : 'Card Holder Name'}
                  </Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder={language === 'ar' ? 'الاسم كما في البطاقة' : 'Name as on card'}
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                    className={errors.cardName ? 'border-destructive' : ''}
                  />
                  {errors.cardName && <p className="text-sm text-destructive mt-1">{errors.cardName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">
                      {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setPaymentData({ ...paymentData, expiryDate: value });
                      }}
                      className={errors.expiryDate ? 'border-destructive' : ''}
                    />
                    {errors.expiryDate && <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                      className={errors.cvv ? 'border-destructive' : ''}
                    />
                    {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">{language === 'ar' ? 'دفع آمن 100%' : '100% Secure Payment'}</p>
                    <p className="text-xs opacity-75">
                      {language === 'ar' ? 'جميع المعاملات مشفرة وآمنة' : 'All transactions are encrypted and secure'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 5 && service && (
            <Card className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-green-600">
                {language === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {language === 'ar'
                  ? 'تم تأكيد حجزك ومعالجة الدفع بنجاح'
                  : 'Your booking has been confirmed and payment processed successfully'}
              </p>
              <div className="bg-primary/10 rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">{language === 'ar' ? 'رقم الحجز' : 'Booking ID'}</p>
                <p className="text-2xl font-bold text-primary mb-4">{bookingId}</p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>{language === 'ar' ? 'الخدمة:' : 'Service:'}</strong> {language === 'ar' && service.name_ar ? service.name_ar : service.name}</p>
                  <p><strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {format(new Date(bookingData.scheduledDate), 'dd/MM/yyyy')} - {bookingData.scheduledTime}</p>
                  <p><strong>{language === 'ar' ? 'المبلغ المدفوع:' : 'Amount Paid:'}</strong> {calculateTotalAmount()} {language === 'ar' ? 'ريال' : 'SAR'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {language === 'ar'
                  ? 'تم إرسال رسالة تأكيد إلى بريدك الإلكتروني'
                  : 'A confirmation email has been sent to your email address'}
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push(`/booking/${params.serviceId}/review?booking_id=${bookingId}&provider_id=${service?.provider_id}`)}
                  className="btn-primary"
                >
                  <Star className="h-4 w-4 ml-2" />
                  {language === 'ar' ? 'قيّم الخدمة (اختياري)' : 'Rate Service (Optional)'}
                </Button>
                <Button onClick={() => router.push('/')} variant="outline">
                  <HomeIcon className="h-4 w-4 ml-2" />
                  {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                </Button>
              </div>
            </Card>
          )}

          {currentStep < 5 && (
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && currentStep < 4 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 btn-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {currentStep === 3
                      ? language === 'ar'
                        ? 'تأكيد الحجز'
                        : 'Confirm Booking'
                      : currentStep === 4
                      ? language === 'ar'
                        ? 'إتمام الدفع'
                        : 'Complete Payment'
                      : language === 'ar'
                      ? 'التالي'
                      : 'Next'}
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
