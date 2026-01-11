'use client';

import { ProviderSidebar } from '@/components/provider/ProviderSidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  MapPin,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  {
    title: 'إجمالي الأرباح',
    value: '12,450 ر.س',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'الحجوزات اليوم',
    value: '8',
    change: '+3',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'التقييم',
    value: '4.9',
    change: '+0.2',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
  },
  {
    title: 'معدل الإكمال',
    value: '96%',
    change: '+2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const todayBookings = [
  {
    id: 1,
    service: 'تنظيف شامل للمنزل',
    customer: 'أحمد محمد',
    time: '09:00 صباحاً',
    location: 'حي الملقا، الرياض',
    status: 'confirmed',
    price: 299,
    phone: '+966 50 123 4567',
  },
  {
    id: 2,
    service: 'صيانة تكييف',
    customer: 'فاطمة علي',
    time: '11:30 صباحاً',
    location: 'حي النخيل، الرياض',
    status: 'pending',
    price: 199,
    phone: '+966 50 765 4321',
  },
  {
    id: 3,
    service: 'تنظيف مكيفات',
    customer: 'خالد عبدالله',
    time: '02:00 مساءً',
    location: 'حي العليا، الرياض',
    status: 'in_progress',
    price: 120,
    phone: '+966 50 987 6543',
  },
  {
    id: 4,
    service: 'تنظيف شقة',
    customer: 'سارة أحمد',
    time: '04:30 مساءً',
    location: 'حي المرسلات، الرياض',
    status: 'confirmed',
    price: 250,
    phone: '+966 50 456 7890',
  },
];

const recentReviews = [
  {
    id: 1,
    customer: 'أحمد محمد',
    rating: 5,
    comment: 'خدمة ممتازة، الفريق محترف جداً',
    date: 'منذ ساعتين',
  },
  {
    id: 2,
    customer: 'فاطمة علي',
    rating: 5,
    comment: 'سعيدة بالخدمة، شكراً لكم',
    date: 'منذ 5 ساعات',
  },
  {
    id: 3,
    customer: 'خالد عبدالله',
    rating: 4,
    comment: 'جيدة بشكل عام',
    date: 'منذ يوم',
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: {
    label: 'قيد الانتظار',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: AlertCircle,
  },
  confirmed: {
    label: 'مؤكد',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: CheckCircle,
  },
  in_progress: {
    label: 'قيد التنفيذ',
    color: 'text-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: Clock,
  },
  completed: {
    label: 'مكتمل',
    color: 'text-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'ملغي',
    color: 'text-red-700',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: XCircle,
  },
};

export default function ProviderDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-6 lg:p-8 lg:mr-0 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك، إليك ملخص أعمالك اليوم</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
              return (
                <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge
                      className={`${
                        stat.trend === 'up'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                      }`}
                    >
                      <TrendIcon className="h-3 w-3 ml-1" />
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-muted-foreground text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">حجوزات اليوم</h2>
                  <p className="text-sm text-muted-foreground">لديك {todayBookings.length} حجوزات اليوم</p>
                </div>
                <Link href="/provider/bookings">
                  <Button variant="ghost" size="sm">
                    عرض الكل
                    <ChevronLeft className="h-4 w-4 mr-2" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {todayBookings.map((booking) => {
                  const status = statusConfig[booking.status];
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-start gap-4 p-4 border rounded-xl hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold mb-1">{booking.service}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{booking.customer}</p>
                          </div>
                          <Badge className={`${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-3 w-3 ml-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {booking.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-left flex flex-col items-end gap-2">
                        <div className="text-xl font-bold text-primary">{booking.price} ر.س</div>
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8">
                              رفض
                            </Button>
                            <Button size="sm" className="h-8">
                              قبول
                            </Button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button size="sm" className="h-8">
                            بدء الخدمة
                          </Button>
                        )}
                        {booking.status === 'in_progress' && (
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                            إكمال
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">التقييمات الأخيرة</h2>
                  <Link href="/provider/reviews">
                    <Button variant="ghost" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{review.customer}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                <h3 className="font-bold text-lg mb-2">نصيحة اليوم</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  الرد السريع على الحجوزات يزيد من فرص القبول بنسبة 40%
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  اعرف المزيد
                </Button>
              </Card>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">إحصائيات الأداء</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">234</div>
                <p className="text-sm text-muted-foreground">إجمالي الحجوزات</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">225</div>
                <p className="text-sm text-muted-foreground">مكتملة</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">5</div>
                <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">4</div>
                <p className="text-sm text-muted-foreground">ملغاة</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
