import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query } from '@/lib/db/mysql';

export const GET = requireAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const unreadOnly = searchParams.get('unread_only') === 'true';
      const offset = (page - 1) * limit;

      let whereConditions = ['user_id = ?', 'tenant_id = ?'];
      const params: any[] = [request.user!.userId, request.user!.tenantId];

      if (unreadOnly) {
        whereConditions.push('is_read = FALSE');
      }

      const whereClause = whereConditions.join(' AND ');

      const [notifications, countResult, unreadCount] = await Promise.all([
        query<any[]>(
          `SELECT * FROM notifications
           WHERE ${whereClause}
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        ),
        query<any[]>(
          `SELECT COUNT(*) as total FROM notifications WHERE ${whereClause}`,
          params
        ),
        query<any[]>(
          'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND tenant_id = ? AND is_read = FALSE',
          [request.user!.userId, request.user!.tenantId]
        ),
      ]);

      return NextResponse.json({
        notifications,
        unreadCount: unreadCount[0].total,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit),
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      return NextResponse.json(
        { error: 'Failed to get notifications' },
        { status: 500 }
      );
    }
  }
);
