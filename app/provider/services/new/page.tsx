'use client';

import { useState, useEffect } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
}

export default function NewServicePage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    categoryId: '',
    basePrice: 0,
    currency: 'SAR',
    durationMinutes: 60,
    pricingType: 'fixed' as 'fixed' | 'hourly' | 'custom',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || !formData.basePrice) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/provider/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إضافة الخدمة بنجاح' : 'Service added successfully');
        router.push('/provider/services');
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' ? 'أضف خدمة جديدة إلى قائمة خدماتك' : 'Add a new service to your service list'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">{language === 'ar' ? 'اسم الخدمة' : 'Service Name'} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ar' ? 'أدخل اسم الخدمة' : 'Enter service name'}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameAr">{language === 'ar' ? 'اسم الخدمة بالعربية' : 'Arabic Service Name'}</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={language === 'ar' ? 'أدخل اسم الخدمة بالعربية' : 'Enter Arabic service name'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">{language === 'ar' ? 'الفئة' : 'Category'} *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر الفئة' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {language === 'ar' && cat.name_ar ? cat.name_ar : cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pricingType">{language === 'ar' ? 'نوع التسعير' : 'Pricing Type'}</Label>
                  <Select value={formData.pricingType} onValueChange={(value: any) => setFormData({ ...formData, pricingType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">{language === 'ar' ? 'ثابت' : 'Fixed'}</SelectItem>
                      <SelectItem value="hourly">{language === 'ar' ? 'بالساعة' : 'Hourly'}</SelectItem>
                      <SelectItem value="custom">{language === 'ar' ? 'مخصص' : 'Custom'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="basePrice">{language === 'ar' ? 'السعر' : 'Price'} *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">{language === 'ar' ? 'المدة (بالدقائق)' : 'Duration (minutes)'}</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل وصف الخدمة' : 'Enter service description'}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="descriptionAr">{language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل وصف الخدمة بالعربية' : 'Enter Arabic service description'}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>{language === 'ar' ? 'نشط' : 'Active'}</Label>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 ml-2" />
                  {loading ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </ProviderLayout>
  );
}
