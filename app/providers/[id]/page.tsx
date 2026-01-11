'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Star,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Wrench,
  CheckCircle,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { format } from 'date-fns';

interface Provider {
  id: string;
  business_name: string;
  business_name_ar?: string;
  description?: string;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  verification_status: string;
  featured: boolean;
  created_at: string;
  email?: string;
  phone?: string;
  stats?: {
    total_bookings: number;
    completed_bookings: number;
    total_services: number;
    avg_rating: number;
    total_reviews: number;
  };
}

interface Service {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  base_price: number;
  currency: string;
  duration_minutes: number;
  pricing_type: string;
  is_active: boolean;
  category_name?: string;
  category_name_ar?: string;
  avg_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  service_name?: string;
  service_name_ar?: string;
}

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProviderData();
    }
  }, [params.id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/providers/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setProvider(data.provider);
        setServices(data.services || []);
        setReviews(data.reviews || []);
      } else {
        setError(data.error || 'فشل تحميل البيانات');
      }
    } catch (err) {
      console.error('Error fetching provider:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
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

  if (error || !provider) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">{t('common.error')}</h3>
            <p className="text-center text-muted-foreground mb-4">
              {error || (language === 'ar' ? 'مزود الخدمة غير موجود' : 'Provider not found')}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => router.back()} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 ml-2" />
                {t('common.back')}
              </Button>
              <Button onClick={fetchProviderData} className="flex-1">
                {t('common.retry')}
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = provider.stats || {
    total_bookings: 0,
    completed_bookings: 0,
    total_services: 0,
    avg_rating: 0,
    total_reviews: 0,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 border-b">
          <div className="container mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              {t('common.back')}
            </Button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-4 ring-background shadow-xl">
                  <Shield className="h-16 w-16 text-primary/60" />
                </div>
                {provider.verification_status === 'verified' && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {language === 'ar' && provider.business_name_ar
                        ? provider.business_name_ar
                        : provider.business_name}
                    </h1>
                    {provider.verification_status === 'verified' && (
                      <Badge className="bg-green-500 text-white mb-3">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        {language === 'ar' ? 'موثق' : 'Verified Provider'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-xl">{stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : '0.0'}</span>
                    <span className="text-muted-foreground">({stats.total_reviews} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-5 w-5" />
                    <span>{stats.total_services} {language === 'ar' ? 'خدمة' : 'services'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-5 w-5" />
                    <span>{stats.completed_bookings} {language === 'ar' ? 'حجز مكتمل' : 'completed bookings'}</span>
                  </div>
                </div>

                {provider.description && (
                  <p className="text-muted-foreground mb-4 text-lg">
                    {provider.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  {provider.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone}</span>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {language === 'ar' ? 'عضو منذ' : 'Member since'} {format(new Date(provider.created_at), 'yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{stats.total_services}</div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'خدمة متاحة' : 'Available Services'}
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Award className="h-8 w-8 text-secondary mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{stats.total_bookings}</div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}
              </p>
            </Card>
            <Card className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{stats.completed_bookings}</div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'حجز مكتمل' : 'Completed'}
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : '0.0'}</div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
              </p>
            </Card>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="w-full justify-start mb-8">
              <TabsTrigger value="services" className="flex-1 md:flex-none">
                <Wrench className="h-4 w-4 ml-2" />
                {language === 'ar' ? 'الخدمات' : 'Services'} ({services.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 md:flex-none">
                <Star className="h-4 w-4 ml-2" />
                {language === 'ar' ? 'التقييمات' : 'Reviews'} ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Link key={service.id} href={`/services/${service.id}`}>
                      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary h-full">
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                          <div className="w-full h-full flex items-center justify-center">
                            <Wrench className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform" />
                          </div>
                          {!service.is_active && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="secondary" className="text-lg px-4 py-2">
                                {language === 'ar' ? 'غير متاح' : 'Unavailable'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {language === 'ar' && service.name_ar ? service.name_ar : service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {language === 'ar' && service.description_ar ? service.description_ar : service.description}
                          </p>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{service.avg_rating ? Number(service.avg_rating).toFixed(1) : '0.0'}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">({service.review_count || 0})</span>
                            {service.category_name && (
                              <Badge variant="outline" className="text-xs mr-auto">
                                {language === 'ar' && service.category_name_ar ? service.category_name_ar : service.category_name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                {service.base_price} {language === 'ar' ? 'ريال' : 'SAR'}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.duration_minutes} {language === 'ar' ? 'دقيقة' : 'min'}
                              </div>
                            </div>
                            <Button className="btn-primary" disabled={!service.is_active}>
                              {service.is_active ? (language === 'ar' ? 'احجز الآن' : 'Book Now') : (language === 'ar' ? 'غير متاح' : 'Unavailable')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{language === 'ar' ? 'لا توجد خدمات' : 'No Services Yet'}</h3>
                  <p className="text-muted-foreground">{language === 'ar' ? 'لم يضف مزود الخدمة أي خدمات بعد' : 'This provider has not added any services yet'}</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">
                                {review.first_name && review.last_name
                                  ? `${review.first_name} ${review.last_name}`
                                  : (language === 'ar' ? 'عميل' : 'Customer')}
                              </h4>
                              {review.service_name && (
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' && review.service_name_ar ? review.service_name_ar : review.service_name}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(review.created_at), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{language === 'ar' ? 'لا توجد تقييمات' : 'No Reviews Yet'}</h3>
                  <p className="text-muted-foreground">{language === 'ar' ? 'لم يتلق مزود الخدمة أي تقييمات بعد' : 'This provider has not received any reviews yet'}</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
