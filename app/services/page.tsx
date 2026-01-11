'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Star,
  Clock,
  Shield,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Service {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  duration: number;
  images: string[];
  category: {
    id: string;
    name: string;
    nameAr: string;
  };
  provider: {
    id: string;
    name: string;
    nameAr: string;
    rating: number;
    totalReviews: number;
    logo: string;
    verificationStatus: string;
  };
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useLanguage();

  // جلب الفئات عند التحميل الأولي
  useEffect(() => {
    fetchCategories();
  }, []);

  // جلب الخدمات عند تغيير الفلاتر
  useEffect(() => {
    fetchServices();
  }, [selectedCategory, priceRange, sortBy, sortOrder, currentPage, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data?.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      params.append('min_price', priceRange[0].toString());
      params.append('max_price', priceRange[1].toString());
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);

      const response = await fetch(`/api/services?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const result = await response.json();

      if (result.success) {
        setServices(result.data?.services || []);
        setPagination(result.data?.pagination || null);
      } else {
        setError(result.error || 'Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    setSortBy('created_at');
    setSortOrder('DESC');
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getDisplayText = (textEn: string, textAr: string) => {
    return language === 'ar' ? textAr : textEn;
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل الخدمات...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 border-b">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-3">الخدمات المتاحة</h1>
            <p className="text-muted-foreground text-lg">اكتشف أفضل الخدمات المحترفة</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                عدد النتائج:{' '}
                <span className="font-semibold text-foreground">
                  {pagination?.total || 0}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="ابحث عن خدمة..."
                value={searchTerm}
                onChange={handleSearch}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 ml-2" />
                الفلاتر
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">الأحدث</SelectItem>
                  <SelectItem value="rating">التقييم</SelectItem>
                  <SelectItem value="base_price">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="base_price_desc">السعر: من الأعلى للأقل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Card className="p-4 mb-6 border-destructive">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <Card className="p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">تصفية النتائج</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    إعادة تعيين
                  </Button>
                </div>

                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b">
                    <span className="font-semibold">الفئات</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 pb-6 space-y-3">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.id}
                          onChange={() => {
                            setSelectedCategory(category.id);
                            setCurrentPage(1);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          {getDisplayText(category.name, category.nameAr)}
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => {
                          setSelectedCategory(null);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">جميع الفئات</span>
                    </label>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b">
                    <span className="font-semibold">نطاق السعر</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 pb-6">
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>{priceRange[0]} ر.س</span>
                        <span>{priceRange[1]} ر.س</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </aside>

            <div className="lg:col-span-3">
              {services.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {services.map((service) => (
                      <Link key={service.id} href={`/services/${service.id}`}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary h-full flex flex-col">
                          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                            {service.images?.[0] ? (
                              <img
                                src={service.images[0]}
                                alt={service.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Wrench className="h-16 w-16 text-primary/40" />
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                              {getDisplayText(service.name, service.nameAr)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                              {getDisplayText(service.description, service.descriptionAr)}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span className="line-clamp-1">
                                {getDisplayText(
                                  service.provider.name,
                                  service.provider.nameAr
                                )}
                              </span>
                            </p>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">
                                  {service.provider.rating?.toFixed(1) || '0.0'}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({service.provider.totalReviews || 0})
                              </span>
                              <Badge variant="outline" className="text-xs ml-auto">
                                {getDisplayText(
                                  service.category.name,
                                  service.category.nameAr
                                )}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t mt-auto">
                              <div>
                                <div className="text-2xl font-bold text-primary">
                                  {service.price}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {service.duration} دقيقة
                                </div>
                              </div>
                              <Link href={`/booking/${service.id}`}>
                                <Button className="btn-primary">احجز الآن</Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Button
                        variant="outline"
                        disabled={!pagination.hasPrevPage}
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                      >
                        السابق
                      </Button>
                      <span className="px-4 py-2">
                        الصفحة {pagination.page} من {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!pagination.hasNextPage}
                        onClick={() =>
                          setCurrentPage(
                            Math.min(
                              pagination.totalPages,
                              currentPage + 1
                            )
                          )
                        }
                      >
                        التالي
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم العثور على خدمات تطابق معايير البحث
                  </p>
                  <Button onClick={resetFilters}>إعادة تعيين الفلاتر</Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}