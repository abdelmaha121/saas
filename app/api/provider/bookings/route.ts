import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query } from '@/lib/db/mysql';

async function getProviderId(userId: string, tenantId: string): Promise<string | null> {
  const providers = await query<any[]>(
    'SELECT id FROM service_providers WHERE user_id = ? AND tenant_id = ? LIMIT 1',
    [userId, tenantId]
  );
  return providers.length > 0 ? providers[0].id : null;
}

export const GET = requireRole(['provider', 'admin', 'super_admin'])(
  async (request: AuthenticatedRequest) => {
    try {
      const providerId = await getProviderId(request.user!.userId, request.user!.tenantId);

      if (!providerId) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const offset = (page - 1) * limit;

      let whereConditions = ['b.provider_id = ? AND b.tenant_id = ?'];
      const params: any[] = [providerId, request.user!.tenantId];

      if (status) {
        whereConditions.push('b.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      const [bookings, countResult] = await Promise.all([
        query<any[]>(
          `SELECT b.*,
                  c.email as customer_email, c.first_name as customer_first_name,
                  c.last_name as customer_last_name, c.phone as customer_phone,
                  s.name as service_name, s.name_ar as service_name_ar
           FROM bookings b
           JOIN users c ON b.customer_id = c.id
           JOIN services s ON b.service_id = s.id
           WHERE ${whereClause}
           ORDER BY b.scheduled_at DESC
           LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        ),
        query<any[]>(
          `SELECT COUNT(*) as total FROM bookings b WHERE ${whereClause}`,
          params
        ),
      ]);

      return NextResponse.json({
        bookings,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit),
        },
      });
    } catch (error) {
      console.error('Get provider bookings error:', error);
      return NextResponse.json(
        { error: 'Failed to get bookings' },
        { status: 500 }
      );
    }
  }
);
