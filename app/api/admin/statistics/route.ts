import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query } from '@/lib/db/mysql';

export const GET = requireRole(['admin', 'super_admin'])(
  async (request: AuthenticatedRequest) => {
    try {
      const tenantId = request.user!.tenantId;

      const [
        usersCount,
        providersCount,
        servicesCount,
        bookingsCount,
        revenueResult,
        bookingsByStatus,
        recentBookings,
      ] = await Promise.all([
        query<any[]>(
          'SELECT COUNT(*) as total FROM users WHERE tenant_id = ?',
          [tenantId]
        ),
        query<any[]>(
          'SELECT COUNT(*) as total FROM service_providers WHERE tenant_id = ?',
          [tenantId]
        ),
        query<any[]>(
          'SELECT COUNT(*) as total FROM services WHERE tenant_id = ?',
          [tenantId]
        ),
        query<any[]>(
          'SELECT COUNT(*) as total FROM bookings WHERE tenant_id = ?',
          [tenantId]
        ),
        query<any[]>(
          `SELECT SUM(total_amount) as total_revenue,
                  SUM(commission_amount) as total_commission
           FROM bookings
           WHERE tenant_id = ? AND payment_status = 'paid'`,
          [tenantId]
        ),
        query<any[]>(
          `SELECT status, COUNT(*) as count
           FROM bookings
           WHERE tenant_id = ?
           GROUP BY status`,
          [tenantId]
        ),
        query<any[]>(
          `SELECT b.id, b.status, b.total_amount, b.scheduled_at, b.created_at,
                  c.first_name as customer_first_name, c.last_name as customer_last_name,
                  sp.business_name as provider_name,
                  s.name as service_name
           FROM bookings b
           JOIN users c ON b.customer_id = c.id
           JOIN service_providers sp ON b.provider_id = sp.id
           JOIN services s ON b.service_id = s.id
           WHERE b.tenant_id = ?
           ORDER BY b.created_at DESC
           LIMIT 10`,
          [tenantId]
        ),
      ]);

      return NextResponse.json({
        statistics: {
          users: usersCount[0].total,
          providers: providersCount[0].total,
          services: servicesCount[0].total,
          bookings: bookingsCount[0].total,
          revenue: {
            total: revenueResult[0].total_revenue || 0,
            commission: revenueResult[0].total_commission || 0,
          },
          bookingsByStatus: bookingsByStatus.reduce((acc: any, item: any) => {
            acc[item.status] = item.count;
            return acc;
          }, {}),
        },
        recentBookings,
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      return NextResponse.json(
        { error: 'Failed to get statistics' },
        { status: 500 }
      );
    }
  }
);
