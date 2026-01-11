'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  created_at: string;
}

export default function AdminAuditPage() {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/audit-logs');
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'تتبع جميع الأنشطة والتغييرات في النظام' : 'Track all activities and changes in the system'}
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث في السجلات...' : 'Search logs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الإجراء' : 'Action'}</TableHead>
                  <TableHead>{language === 'ar' ? 'نوع المورد' : 'Resource Type'}</TableHead>
                  <TableHead>{language === 'ar' ? 'معرف المورد' : 'Resource ID'}</TableHead>
                  <TableHead>{language === 'ar' ? 'عنوان IP' : 'IP Address'}</TableHead>
                  <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.resource_type || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{log.resource_id?.slice(0, 8) || '-'}</TableCell>
                    <TableCell>{log.ip_address || '-'}</TableCell>
                    <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
