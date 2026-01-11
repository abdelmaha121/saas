'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import {
  Star,
  MapPin,
  Clock,
  Shield,
  Check,
  Heart,
  Share2,
  Calendar,
  Award,
  TrendingUp,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ServiceData {
  service: any;
  addons: any[];
  reviews: any[];
  ratingBreakdown: any;
  totalReviews: number;
}

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [data, setData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { language } = useLanguage();

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/services/${serviceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load service');
      }

      setData(result.data);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">خطأ في التحميل</h3>
            <p className="text-center text-muted-foreground mb-4">{error || 'لم يتم العثور على الخدمة'}</p>
            <Button onClick={fetchServiceDetails} className="w-full">
              إعادة محاولة
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { service, addons, reviews, ratingBreakdown, totalReviews } = data;
  const mainImage = service.images?.[selectedImage] || '/placeholder-service.jpg';
  const addonsCost = addons
    .filter((addon: any) => selectedAddons.includes(addon.id))
    .reduce((sum: number, addon: any) => sum + addon.price, 0);
  const totalPrice = service.price + addonsCost;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {service.provider?.verificationStatus === 'verified' && (
                      <Badge className="mb-2 bg-green-500 text-white">
                        <Shield className="h-3 w-3 ml-1" />
                        مقدم خدمة معتمد
                      </Badge>
                    )}
                    <h1 className="text-4xl font-bold mb-3">
                      {language === 'ar' ? service.nameAr : service.name}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">
                            {service.provider?.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          ({service.provider?.totalReviews || 0} تقييم)
                        </span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration} دقيقة</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={isFavorite ? 'text-red-500 border-red-500' : ''}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-xl mb-4">
                  <img
                    src={mainImage}
                    alt={language === 'ar' ? service.nameAr : service.name}
                    className="w-full h-96 object-cover"
                  />
                </div>

                {service.images && service.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {service.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-24 object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">وصف الخدمة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'ar' ? service.descriptionAr : service.description}
                </p>
              </Card>

              {addons.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">إضافات اختيارية</h2>
                  <div className="space-y-3">
                    {addons.map((addon: any) => (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon.id)}
                            onChange={() => toggleAddon(addon.id)}
                            className="w-5 h-5 rounded border-input"
                          />
                          <span className="font-medium">
                            {language === 'ar' ? addon.nameAr : addon.name}
                          </span>
                        </div>
                        <span className="text-primary font-bold">+{addon.price} ر.س</span>
                      </label>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">مقدم الخدمة</h2>
                <div className="flex items-start gap-4 mb-6">
                  {service.provider?.logo && (
                    <img
                      src={service.provider.logo}
                      alt={service.provider.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-background"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">
                        {language === 'ar' ? service.provider?.nameAr : service.provider?.name}
                      </h3>
                      {service.provider?.verificationStatus === 'verified' && (
                        <Badge className="bg-green-500 text-white">
                          <Shield className="h-3 w-3 ml-1" />
                          معتمد
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {service.provider?.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{service.provider?.totalReviews || 0} تقييم</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/providers/${service.provider?.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      عرض الملف الشخصي
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 ml-2" />
                    تواصل معنا
                  </Button>
                </div>
              </Card>

              {reviews.length > 0 && (
                <Card className="p-6">
                  <Tabs defaultValue="reviews">
                    <TabsList className="w-full grid grid-cols-2 mb-6">
                      <TabsTrigger value="reviews">التقييمات ({totalReviews})</TabsTrigger>
                      <TabsTrigger value="stats">إحصائيات التقييم</TabsTrigger>
                    </TabsList>

                    <TabsContent value="reviews" className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={review.user?.avatar} />
                              <AvatarFallback>
                                {review.user?.name?.[0] || 'ع'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.user?.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-3">{review.comment}</p>
                              {review.media && review.media.length > 0 && (
                                <div className="flex gap-2">
                                  {review.media.map((image: string, index: number) => (
                                    <img
                                      key={index}
                                      src={image}
                                      alt=""
                                      className="w-24 h-24 rounded-lg object-cover"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-6">
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">
                            {service.provider?.rating?.toFixed(1) || '0.0'}
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {totalReviews} تقييم
                          </p>
                        </div>
                        <div className="flex-1 space-y-3">
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <div key={stars} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-20">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{stars}</span>
                              </div>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${ratingBreakdown[stars] || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground w-12">
                                {ratingBreakdown[stars] || 0}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 border-2 border-primary/20">
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary">
                      {totalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">ر.س</span>
                  </div>
                  {addonsCost > 0 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>السعر الأساسي: {service.price} ر.س</div>
                      <div>الإضافات: {addonsCost} ر.س</div>
                    </div>
                  )}
                </div>

                <Link href={`/booking/${serviceId}`}>
                  <Button className="w-full btn-primary text-lg h-14 mb-3">
                    <Calendar className="h-5 w-5 ml-2" />
                    احجز الآن
                  </Button>
                </Link>

                <Button variant="outline" className="w-full mb-6">
                  احجز لاحقاً
                </Button>

                <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span>ضمان استرجاع المبلغ</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <span>مقدم خدمة معتمد</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span>خدمة في نفس اليوم</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}