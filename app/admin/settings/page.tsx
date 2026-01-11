'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState({
    siteName: 'خدماتي',
    siteNameEn: 'Khadamati',
    supportEmail: 'support@khadamati.sa',
    supportPhone: '+966500000000',
    commissionRate: 15,
    taxRate: 15,
    enableRegistration: true,
    enableNotifications: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'إدارة إعدادات المنصة العامة' : 'Manage general platform settings'}
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold">{language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'ar' ? 'اسم الموقع' : 'Site Name'}</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}</Label>
                  <Input
                    value={settings.siteNameEn}
                    onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Email'}</Label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'هاتف الدعم' : 'Support Phone'}</Label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</Label>
                  <Input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">{language === 'ar' ? 'إعدادات المنصة' : 'Platform Settings'}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'تفعيل التسجيل' : 'Enable Registration'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'السماح بتسجيل مستخدمين جدد' : 'Allow new user registration'}
                  </p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'إرسال إشعارات للمستخدمين' : 'Send notifications to users'}
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'إيقاف الوصول للمستخدمين مؤقتاً' : 'Temporarily disable user access'}
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 ml-2" />
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
