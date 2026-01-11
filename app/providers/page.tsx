'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Star, Shield, TrendingUp, MapPin, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Provider {
  id: number;
  business_name: string;
  description: string;
  logo: string;
  city: string;
  address: string;
  phone: string;
  avg_rating: number;
  service_count: number;
  created_at: string;
}

export default function ProvidersPage() {
  const { language, t } = useLanguage();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProviders();
  }, [filter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter === 'topRated') params.append('sort', 'rating');
      if (filter === 'mostBooked') params.append('sort', 'bookings');
      if (filter === 'verified') params.append('verified', 'true');

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProviders(data.providers || data || []);
      } else {
        setError('فشل تحميل البيانات');
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
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

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">{t('common.error')}</h3>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProviders} className="w-full">
              {t('common.retry')}
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
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">{t('providers.hero.title')}</h1>
            <p className="text-xl text-muted-foreground mb-8">{t('providers.hero.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{providers.length}+</div>
                <p className="text-muted-foreground">{t('providers.stats.providers')}</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-secondary mb-2">
                  {providers.reduce((sum, p) => sum + (p.service_count || 0), 0)}+
                </div>
                <p className="text-muted-foreground">{t('providers.stats.services')}</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {providers.length > 0
                    ? (providers.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / providers.length).toFixed(1)
                    : '0.0'}
                </div>
                <p className="text-muted-foreground">{t('providers.stats.rating')}</p>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                {t('providers.filter.all')}
              </Button>
              <Button
                variant={filter === 'topRated' ? 'default' : 'outline'}
                onClick={() => setFilter('topRated')}
              >
                {t('providers.filter.topRated')}
              </Button>
              <Button
                variant={filter === 'mostBooked' ? 'default' : 'outline'}
                onClick={() => setFilter('mostBooked')}
              >
                {t('providers.filter.mostBooked')}
              </Button>
              <Button
                variant={filter === 'verified' ? 'default' : 'outline'}
                onClick={() => setFilter('verified')}
              >
                {t('providers.filter.verified')}
              </Button>
            </div>
          </div>

          {providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Link key={provider.id} href={`/providers/${provider.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary h-full">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                      {provider.logo ? (
                        <img
                          src={provider.logo}
                          alt={provider.business_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shield className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white shadow-lg">
                          <Shield className="h-3 w-3 ml-1" />
                          {t('common.verified')}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {provider.business_name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {provider.description || t('common.noDescription')}
                      </p>

                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">
                            {provider.avg_rating ? Number(provider.avg_rating).toFixed(1) : '0.0'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{provider.city || t('common.unknown')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>
                              {provider.service_count || 0} {t('providers.services')}
                            </span>
                          </div>
                          <div className="text-xs">
                            {t('providers.memberSince')} {new Date(provider.created_at).getFullYear()}
                          </div>
                        </div>
                        <Button className="btn-primary">
                          {t('providers.viewProfile')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('common.noResults')}</h3>
              <p className="text-muted-foreground">{t('providers.noProvidersFound')}</p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
