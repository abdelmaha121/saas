'use client';

import { useState, useEffect } from 'react';
import ProviderLayout from '@/components/provider/ProviderLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function ProviderStaffPage() {
  const { language, t } = useLanguage();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'staff',
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/staff');
      const data = await response.json();
      if (response.ok) {
        setStaff(data.staff || []);
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/provider/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إضافة عضو الفريق بنجاح' : 'Staff member added successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchStaff();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleEdit = async () => {
    if (!currentStaff) return;

    try {
      const response = await fetch(`/api/provider/staff/${currentStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث عضو الفريق' : 'Staff member updated');
        setIsEditDialogOpen(false);
        setCurrentStaff(null);
        resetForm();
        fetchStaff();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (staffId: string) => {
    try {
      const response = await fetch(`/api/provider/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف عضو الفريق' : 'Staff member deleted');
        setIsDeleteDialogOpen(false);
        setCurrentStaff(null);
        fetchStaff();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleMultiDelete = async () => {
    try {
      const deletePromises = selectedStaff.map(id =>
        fetch(`/api/provider/staff/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      toast.success(language === 'ar' ? 'تم حذف أعضاء الفريق' : 'Staff members deleted');
      setIsMultiDeleteDialogOpen(false);
      setSelectedStaff([]);
      fetchStaff();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    try {
      const response = await fetch(`/api/provider/staff/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: member.email,
          firstName: member.first_name,
          lastName: member.last_name,
          phone: member.phone,
          role: member.role,
          isActive: !member.is_active,
        }),
      });

      if (response.ok) {
        toast.success(
          language === 'ar'
            ? member.is_active ? 'تم إيقاف العضو' : 'تم تفعيل العضو'
            : member.is_active ? 'Member deactivated' : 'Member activated'
        );
        fetchStaff();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setCurrentStaff(member);
    setFormData({
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      phone: member.phone || '',
      role: member.role,
      isActive: member.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: StaffMember) => {
    setCurrentStaff(member);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'staff',
      isActive: true,
    });
  };

  const filteredStaff = staff.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedStaff.length === filteredStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredStaff.map(s => s.id));
    }
  };

  const toggleSelectStaff = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إدارة الفريق' : 'Staff Management'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' ? 'إدارة أعضاء فريق العمل' : 'Manage your team members'}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            {language === 'ar' ? 'إضافة عضو' : 'Add Member'}
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            {selectedStaff.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsMultiDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                {language === 'ar' ? `حذف (${selectedStaff.length})` : `Delete (${selectedStaff.length})`}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStaff.length === filteredStaff.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الدور' : 'Role'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStaff.includes(member.id)}
                        onCheckedChange={() => toggleSelectStaff(member.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {member.first_name} {member.last_name}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={member.is_active}
                          onCheckedChange={() => handleToggleActive(member)}
                        />
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active
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
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(member)}
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
            <DialogTitle>{language === 'ar' ? 'إضافة عضو جديد' : 'Add New Member'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'أدخل تفاصيل عضو الفريق' : 'Enter team member details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'ar' ? 'الاسم الأول' : 'First Name'}</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'ar' ? 'الاسم الأخير' : 'Last Name'}</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            <DialogTitle>{language === 'ar' ? 'تعديل العضو' : 'Edit Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'ar' ? 'الاسم الأول' : 'First Name'}</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'ar' ? 'الاسم الأخير' : 'Last Name'}</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                ? 'سيتم حذف هذا العضو نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : 'This member will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentStaff && handleDelete(currentStaff.id)}
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
              {language === 'ar' ? 'حذف أعضاء متعددين' : 'Delete Multiple Members'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `سيتم حذف ${selectedStaff.length} عضو نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `${selectedStaff.length} members will be permanently deleted. This action cannot be undone.`}
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
    </ProviderLayout>
  );
}
