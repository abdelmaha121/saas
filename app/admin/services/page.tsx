'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  base_price: number;
  currency: string;
  duration_minutes?: number;
  pricing_type: 'fixed' | 'hourly' | 'custom';
  is_active: boolean;
  provider?: {
    business_name: string;
  };
  category?: {
    name: string;
  };
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  name_ar?: string;
}

interface Provider {
  id: string;
  business_name: string;
  business_name_ar?: string;
}

export default function AdminServicesPage() {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes, providersRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/providers'),
      ]);

      const servicesData = await servicesRes.json();
      const categoriesData = await categoriesRes.json();
      const providersData = await providersRes.json();

      if (servicesRes.ok) setServices(servicesData.services || []);
      if (categoriesRes.ok) setCategories(categoriesData.categories || []);
      if (providersRes.ok) setProviders(providersData.providers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف الخدمة بنجاح' : 'Service deleted successfully');
        setIsDeleteDialogOpen(false);
        setCurrentService(null);
        fetchData();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(t('common.error'));
    }
  };

  const handleMultiDelete = async () => {
    try {
      const deletePromises = selectedServices.map(id =>
        fetch(`/api/services/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      toast.success(language === 'ar' ? 'تم حذف الخدمات بنجاح' : 'Services deleted successfully');
      setIsMultiDeleteDialogOpen(false);
      setSelectedServices([]);
      fetchData();
    } catch (error) {
      console.error('Error deleting services:', error);
      toast.error(t('common.error'));
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          isActive: !service.is_active,
        }),
      });

      if (response.ok) {
        toast.success(
          language === 'ar'
            ? service.is_active
              ? 'تم إيقاف الخدمة'
              : 'تم تفعيل الخدمة'
            : service.is_active
            ? 'Service deactivated'
            : 'Service activated'
        );
        fetchData();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      toast.error(t('common.error'));
    }
  };

  const openViewDialog = (service: Service) => {
    setCurrentService(service);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category_id === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && service.is_active) ||
      (filterStatus === 'inactive' && !service.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  const toggleSelectService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إدارة الخدمات' : 'Services Management'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar'
                ? 'إدارة جميع الخدمات المتاحة في المنصة'
                : 'Manage all services available on the platform'}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث عن خدمة...' : 'Search services...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === 'ar' && cat.name_ar ? cat.name_ar : cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="active">{language === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</SelectItem>
              </SelectContent>
            </Select>
            {selectedServices.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsMultiDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                {language === 'ar' ? `حذف (${selectedServices.length})` : `Delete (${selectedServices.length})`}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedServices.length === filteredServices.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{language === 'ar' ? 'اسم الخدمة' : 'Service Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المزود' : 'Provider'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead>{language === 'ar' ? 'السعر' : 'Price'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المدة' : 'Duration'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleSelectService(service.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {language === 'ar' && service.name_ar ? service.name_ar : service.name}
                    </TableCell>
                    <TableCell>{service.provider?.business_name || '-'}</TableCell>
                    <TableCell>{service.category?.name || '-'}</TableCell>
                    <TableCell>
                      {service.base_price} {language === 'ar' ? 'ريال' : 'SAR'}
                    </TableCell>
                    <TableCell>
                      {service.duration_minutes ? `${service.duration_minutes} ${language === 'ar' ? 'دقيقة' : 'min'}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggleActive(service)}
                        />
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active
                            ? (language === 'ar' ? 'نشط' : 'Active')
                            : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(service)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(service)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تفاصيل الخدمة' : 'Service Details'}</DialogTitle>
          </DialogHeader>
          {currentService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                  <p className="font-medium">{currentService.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                  <p className="font-medium">{currentService.name_ar || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'المزود' : 'Provider'}</Label>
                  <p className="font-medium">{currentService.provider?.business_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الفئة' : 'Category'}</Label>
                  <p className="font-medium">{currentService.category?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'السعر' : 'Price'}</Label>
                  <p className="font-medium">{currentService.base_price} {currentService.currency}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'نوع التسعير' : 'Pricing Type'}</Label>
                  <p className="font-medium">{currentService.pricing_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'المدة' : 'Duration'}</Label>
                  <p className="font-medium">
                    {currentService.duration_minutes ? `${currentService.duration_minutes} ${language === 'ar' ? 'دقيقة' : 'minutes'}` : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                  <Badge variant={currentService.is_active ? 'default' : 'secondary'}>
                    {currentService.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <p className="mt-1">{currentService.description || '-'}</p>
              </div>
              {currentService.description_ar && (
                <div>
                  <Label className="text-muted-foreground">{language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}</Label>
                  <p className="mt-1">{currentService.description_ar}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t('common.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? 'سيتم حذف هذه الخدمة نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : 'This service will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentService && handleDelete(currentService.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'حذف خدمات متعددة' : 'Delete Multiple Services'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `سيتم حذف ${selectedServices.length} خدمة نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `${selectedServices.length} services will be permanently deleted. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMultiDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
