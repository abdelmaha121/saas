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

      const [
        servicesCount,
        bookingsCount,
        revenueResult,
        ratingResult,
        bookingsByStatus,
      ] = await Promise.all([
        query<any[]>(
          'SELECT COUNT(*) as total FROM services WHERE provider_id = ? AND tenant_id = ?',
          [providerId, request.user!.tenantId]
        ),
        query<any[]>(
          'SELECT COUNT(*) as total FROM bookings WHERE provider_id = ? AND tenant_id = ?',
          [providerId, request.user!.tenantId]
        ),
        query<any[]>(
          `SELECT SUM(total_amount - commission_amount) as total_earnings
           FROM bookings
           WHERE provider_id = ? AND tenant_id = ? AND payment_status = 'paid'`,
          [providerId, request.user!.tenantId]
        ),
        query<any[]>(
          `SELECT rating, total_reviews
           FROM service_providers
           WHERE id = ? AND tenant_id = ?
           LIMIT 1`,
          [providerId, request.user!.tenantId]
        ),
        query<any[]>(
          `SELECT status, COUNT(*) as count
           FROM bookings
           WHERE provider_id = ? AND tenant_id = ?
           GROUP BY status`,
          [providerId, request.user!.tenantId]
        ),
      ]);

      return NextResponse.json({
        statistics: {
          services: servicesCount[0].total,
          bookings: bookingsCount[0].total,
          earnings: revenueResult[0].total_earnings || 0,
          rating: ratingResult.length > 0 ? {
            average: ratingResult[0].rating,
            total: ratingResult[0].total_reviews,
          } : { average: 0, total: 0 },
          bookingsByStatus: bookingsByStatus.reduce((acc: any, item: any) => {
            acc[item.status] = item.count;
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      console.error('Get provider statistics error:', error);
      return NextResponse.json(
        { error: 'Failed to get statistics' },
        { status: 500 }
      );
    }
  }
);
