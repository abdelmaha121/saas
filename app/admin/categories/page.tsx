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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  icon_url?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function CategoriesPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    iconUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories?include_inactive=true');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchCategories();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(t('common.error'));
    }
  };

  const handleEdit = async () => {
    if (!currentCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${currentCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully');
        setIsEditDialogOpen(false);
        setCurrentCategory(null);
        resetForm();
        fetchCategories();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully');
        setIsDeleteDialogOpen(false);
        setCurrentCategory(null);
        fetchCategories();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t('common.error'));
    }
  };

  const handleMultiDelete = async () => {
    try {
      const deletePromises = selectedCategories.map(id =>
        fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      toast.success(language === 'ar' ? 'تم حذف الفئات بنجاح' : 'Categories deleted successfully');
      setIsMultiDeleteDialogOpen(false);
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast.error(t('common.error'));
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          nameAr: category.name_ar,
          description: category.description,
          iconUrl: category.icon_url,
          displayOrder: category.display_order,
          isActive: !category.is_active,
        }),
      });

      if (response.ok) {
        toast.success(
          language === 'ar'
            ? category.is_active
              ? 'تم إيقاف الفئة'
              : 'تم تفعيل الفئة'
            : category.is_active
            ? 'Category deactivated'
            : 'Category activated'
        );
        fetchCategories();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error(t('common.error'));
    }
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      nameAr: category.name_ar || '',
      description: category.description || '',
      iconUrl: category.icon_url || '',
      displayOrder: category.display_order,
      isActive: category.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      iconUrl: '',
      displayOrder: 0,
      isActive: true,
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(c => c.id));
    }
  };

  const toggleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إدارة الفئات' : 'Categories Management'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar'
                ? 'إدارة فئات الخدمات المتاحة في المنصة'
                : 'Manage service categories available on the platform'}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث عن فئة...' : 'Search categories...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            {selectedCategories.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsMultiDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                {language === 'ar' ? `حذف (${selectedCategories.length})` : `Delete (${selectedCategories.length})`}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCategories.length === filteredCategories.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الترتيب' : 'Order'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleSelectCategory(category.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.name_ar || '-'}</TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => handleToggleActive(category)}
                        />
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active
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
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(category)}
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'أدخل تفاصيل الفئة الجديدة'
                : 'Enter the details of the new category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'ar' ? 'اسم الفئة' : 'Category name'}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder={language === 'ar' ? 'اسم الفئة بالعربية' : 'Category name in Arabic'}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'ar' ? 'وصف الفئة' : 'Category description'}
                rows={3}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</Label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>{language === 'ar' ? 'نشط' : 'Active'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تعديل الفئة' : 'Edit Category'}</DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'قم بتحديث تفاصيل الفئة'
                : 'Update the category details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</Label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>{language === 'ar' ? 'نشط' : 'Active'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEdit}>{t('common.save')}</Button>
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
                ? 'سيتم حذف هذه الفئة نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : 'This category will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentCategory && handleDelete(currentCategory.id)}
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
              {language === 'ar' ? 'حذف فئات متعددة' : 'Delete Multiple Categories'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `سيتم حذف ${selectedCategories.length} فئة نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `${selectedCategories.length} categories will be permanently deleted. This action cannot be undone.`}
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
