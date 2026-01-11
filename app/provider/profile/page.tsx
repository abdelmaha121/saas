'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { api } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, FileText, Clock, MapPin, Save, Star } from 'lucide-react';

interface ProviderProfile {
  id: string;
  businessName: string;
  businessNameAr: string;
  description: string;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  commissionRate: number;
  isActive: boolean;
  featured: boolean;
}

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ provider: ProviderProfile }>('/provider/profile');
      setProfile(data.provider);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setMessage('');

      await api.put('/provider/profile', {
        businessName: profile?.businessName,
        businessNameAr: profile?.businessNameAr,
        description: profile?.description,
      });

      setMessage(
        language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully'
      );

      await loadProfile();
    } catch (error: any) {
      setMessage(error.message || (language === 'ar' ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setUpdating(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    const badges: any = {
      pending: {
        label: language === 'ar' ? 'قيد المراجعة' : 'Pending',
        variant: 'secondary',
      },
      verified: {
        label: language === 'ar' ? 'موثق' : 'Verified',
        variant: 'default',
      },
      rejected: {
        label: language === 'ar' ? 'مرفوض' : 'Rejected',
        variant: 'destructive',
      },
    };
    return badges[status] || badges.pending;
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-muted-foreground">
            {language === 'ar' ? 'ملف المزود غير موجود' : 'Provider profile not found'}
          </p>
        </Card>
      </div>
    );
  }

  const verificationBadge = getVerificationBadge(profile.verificationStatus);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {language === 'ar' ? 'ملف مقدم الخدمة' : 'Provider Profile'}
        </h1>

        {/* Status Overview */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {language === 'ar' ? profile.businessNameAr : profile.businessName}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={verificationBadge.variant as any}>
                  {verificationBadge.label}
                </Badge>
                {profile.featured && (
                  <Badge variant="outline">
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                <span>({profile.totalReviews} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}
              </p>
              <p className="text-3xl font-bold text-primary">{profile.totalBookings}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">
              <Building className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'معلومات' : 'Info'}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'مستندات' : 'Documents'}
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'ساعات العمل' : 'Hours'}
            </TabsTrigger>
            <TabsTrigger value="coverage">
              <MapPin className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'التغطية' : 'Coverage'}
            </TabsTrigger>
          </TabsList>

          {/* Company Information */}
          <TabsContent value="info">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
              </h2>

              {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                  {message}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'اسم الشركة (بالإنجليزية)' : 'Business Name (English)'}
                  </label>
                  <Input
                    value={profile.businessName}
                    onChange={(e) =>
                      setProfile({ ...profile, businessName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'اسم الشركة (بالعربية)' : 'Business Name (Arabic)'}
                  </label>
                  <Input
                    value={profile.businessNameAr}
                    onChange={(e) =>
                      setProfile({ ...profile, businessNameAr: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <Textarea
                    value={profile.description}
                    onChange={(e) =>
                      setProfile({ ...profile, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        {language === 'ar' ? 'معدل العمولة' : 'Commission Rate'}
                      </p>
                      <p className="font-semibold">{profile.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </p>
                      <p className="font-semibold">
                        {profile.isActive
                          ? language === 'ar' ? 'نشط' : 'Active'
                          : language === 'ar' ? 'غير نشط' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updating} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {updating
                    ? language === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                    : language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'المستندات' : 'Documents'}
              </h2>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'قريباً - إدارة المستندات' : 'Coming Soon - Document Management'}
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Working Hours */}
          <TabsContent value="hours">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
              </h2>
              <div className="text-center py-8">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'قريباً - تحديد ساعات العمل' : 'Coming Soon - Set Working Hours'}
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Coverage Area */}
          <TabsContent value="coverage">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'منطقة تغطية الخدمة' : 'Service Coverage Area'}
              </h2>
              <div className="text-center py-8">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'قريباً - تحديد منطقة التغطية' : 'Coming Soon - Define Coverage Area'}
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
