'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const stats = [
  {
    title: 'إجمالي الإيرادات',
    value: '285,430 ر.س',
    change: '+18.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'إجمالي الحجوزات',
    value: '1,245',
    change: '+12.5%',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'المستخدمون النشطون',
    value: '3,842',
    change: '+8.3%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'معدل النمو',
    value: '23.5%',
    change: '+2.1%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const recentBookings = [
  {
    id: '#BK-2024-001',
    service: 'تنظيف شامل للمنزل',
    customer: 'أحمد محمد',
    provider: 'شركة النظافة المتقدمة',
    amount: 299,
    status: 'completed',
    date: '2024-01-15',
  },
  {
    id: '#BK-2024-002',
    service: 'صيانة تكييف',
    customer: 'فاطمة علي',
    provider: 'خبراء التكييف',
    amount: 199,
    status: 'in_progress',
    date: '2024-01-15',
  },
  {
    id: '#BK-2024-003',
    service: 'إصلاح كهرباء',
    customer: 'خالد عبدالله',
    provider: 'الكهربائي المحترف',
    amount: 149,
    status: 'pending',
    date: '2024-01-15',
  },
  {
    id: '#BK-2024-004',
    service: 'دهان غرفة',
    customer: 'سارة أحمد',
    provider: 'فنانو الدهان',
    amount: 599,
    status: 'confirmed',
    date: '2024-01-15',
  },
  {
    id: '#BK-2024-005',
    service: 'تنظيف مكيفات',
    customer: 'محمد سعيد',
    provider: 'خبراء التكييف',
    amount: 120,
    status: 'cancelled',
    date: '2024-01-14',
  },
];

const topProviders = [
  { name: 'شركة النظافة المتقدمة', bookings: 234, revenue: 68520, rating: 4.9 },
  { name: 'خبراء التكييف', bookings: 189, revenue: 52430, rating: 4.8 },
  { name: 'الكهربائي المحترف', bookings: 156, revenue: 38940, rating: 4.7 },
  { name: 'فنانو الدهان', bookings: 143, revenue: 85570, rating: 4.9 },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30', icon: Clock },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30', icon: CheckCircle },
  in_progress: { label: 'قيد التنفيذ', color: 'bg-green-100 text-green-700 dark:bg-green-900/30', icon: Clock },
  completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700 dark:bg-green-900/30', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900/30', icon: XCircle },
};

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">لوحة التحكم الرئيسية</h1>
              <p className="text-muted-foreground">نظرة عامة على أداء المنصة</p>
            </div>
            <div className="flex gap-3">
              <Select defaultValue="7days">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">آخر 7 أيام</SelectItem>
                  <SelectItem value="30days">آخر 30 يوم</SelectItem>
                  <SelectItem value="90days">آخر 90 يوم</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
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
                  <h2 className="text-xl font-bold mb-1">الحجوزات الأخيرة</h2>
                  <p className="text-sm text-muted-foreground">آخر {recentBookings.length} حجوزات</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 ml-2" />
                  فلترة
                </Button>
              </div>

              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const status = statusConfig[booking.status];
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-4 border rounded-xl hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">{booking.id}</span>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 ml-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <h3 className="font-bold mb-1">{booking.service}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>العميل: {booking.customer}</span>
                          <span>•</span>
                          <span>المزود: {booking.provider}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold text-primary">{booking.amount} ر.س</div>
                        <div className="text-xs text-muted-foreground">{booking.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">أفضل مقدمي الخدمات</h2>
              <div className="space-y-4">
                {topProviders.map((provider, index) => (
                  <div key={provider.name} className="pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{provider.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mr-11">
                      <div>
                        <p className="text-muted-foreground text-xs">الحجوزات</p>
                        <p className="font-semibold">{provider.bookings}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">الإيرادات</p>
                        <p className="font-semibold">{provider.revenue.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-muted-foreground text-sm mb-2">معدل الإكمال</h3>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold">96.2%</p>
                <span className="text-green-600 text-sm flex items-center mb-1">
                  <ArrowUp className="h-4 w-4" />
                  +2.3%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '96.2%' }}></div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-muted-foreground text-sm mb-2">معدل الإلغاء</h3>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold">3.8%</p>
                <span className="text-green-600 text-sm flex items-center mb-1">
                  <ArrowDown className="h-4 w-4" />
                  -0.5%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '3.8%' }}></div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-muted-foreground text-sm mb-2">متوسط التقييم</h3>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold">4.8</p>
                <span className="text-green-600 text-sm flex items-center mb-1">
                  <ArrowUp className="h-4 w-4" />
                  +0.2
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-muted-foreground text-sm mb-2">متوسط قيمة الحجز</h3>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold">229 ر.س</p>
                <span className="text-green-600 text-sm flex items-center mb-1">
                  <ArrowUp className="h-4 w-4" />
                  +12 ر.س
                </span>
              </div>
              <p className="text-xs text-muted-foreground">مقارنة بالشهر الماضي</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
