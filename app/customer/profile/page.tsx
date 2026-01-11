'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { api } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Wallet, Bell, LogOut, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { language } = useLanguage();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage('');

      // Note: Need to create update profile API
      // await api.put('/customer/profile', profile);

      setMessage(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
      await refreshUser();
    } catch (error: any) {
      setMessage(error.message || (language === 'ar' ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {language === 'ar' ? 'الرجاء تسجيل الدخول' : 'Please login'}
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {language === 'ar' ? 'الملف الشخصي' : 'My Profile'}
        </h1>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'شخصي' : 'Personal'}
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'العناوين' : 'Addresses'}
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'المحفظة' : 'Wallet'}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إشعارات' : 'Notifications'}
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
              </h2>

              {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                  {message}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                    </label>
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                    </label>
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading
                    ? language === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                    : language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'عناويني' : 'My Addresses'}
              </h2>
              <div className="text-center py-8">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {language === 'ar' ? 'قريباً - إدارة العناوين' : 'Coming Soon - Address Management'}
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Wallet */}
          <TabsContent value="wallet">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'محفظتي' : 'My Wallet'}
              </h2>
              <div className="text-center py-8">
                <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {language === 'ar' ? 'الرصيد: 0 SAR' : 'Balance: 0 SAR'}
                </p>
                <Button onClick={() => router.push('/customer/wallet')}>
                  {language === 'ar' ? 'عرض المحفظة' : 'View Wallet'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">
                      {language === 'ar' ? 'إشعارات الحجز' : 'Booking Notifications'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'احصل على تحديثات حول حجوزاتك' : 'Get updates about your bookings'}
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">
                      {language === 'ar' ? 'العروض الترويجية' : 'Promotional Offers'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'احصل على العروض الخاصة' : 'Receive special offers'}
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <Card className="p-6 mt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
