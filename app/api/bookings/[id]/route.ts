import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query } from '@/lib/db/mysql';
import { createAuditLog, extractClientInfo } from '@/lib/services/audit';

export const GET = requireAuth(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const bookings = await query<any[]>(
        `SELECT b.*,
                sp.business_name as provider_name, sp.business_name_ar as provider_name_ar,
                s.name as service_name, s.name_ar as service_name_ar,
                s.description as service_description, s.images as service_images
         FROM bookings b
         JOIN service_providers sp ON b.provider_id = sp.id
         JOIN services s ON b.service_id = s.id
         WHERE b.id = ? AND b.customer_id = ? AND b.tenant_id = ?
         LIMIT 1`,
        [params.id, request.user!.userId, request.user!.tenantId]
      );

      if (bookings.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      const addons = await query<any[]>(
        `SELECT ba.*, sa.name, sa.name_ar
         FROM booking_addons ba
         JOIN service_addons sa ON ba.addon_id = sa.id
         WHERE ba.booking_id = ?`,
        [params.id]
      );

      return NextResponse.json({
        booking: bookings[0],
        addons,
      });
    } catch (error) {
      console.error('Get booking error:', error);
      return NextResponse.json(
        { error: 'Failed to get booking' },
        { status: 500 }
      );
    }
  }
);

export const PUT = requireAuth(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();
      const { status, cancellationReason } = body;

      const bookings = await query<any[]>(
        'SELECT id, status FROM bookings WHERE id = ? AND customer_id = ? AND tenant_id = ? LIMIT 1',
        [params.id, request.user!.userId, request.user!.tenantId]
      );

      if (bookings.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      const currentStatus = bookings[0].status;

      if (status === 'cancelled' && currentStatus === 'pending') {
        await query(
          `UPDATE bookings
           SET status = ?, cancellation_reason = ?, cancelled_by = ?, updated_at = NOW()
           WHERE id = ? AND tenant_id = ?`,
          ['cancelled', cancellationReason || null, request.user!.userId, params.id, request.user!.tenantId]
        );

        const clientInfo = extractClientInfo(request);
        await createAuditLog({
          tenantId: request.user!.tenantId,
          userId: request.user!.userId,
          action: 'customer.booking.cancel',
          resourceType: 'booking',
          resourceId: params.id,
          changes: { status: 'cancelled', reason: cancellationReason },
          ...clientInfo,
        });

        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: 'Cannot update booking status' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Update booking error:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }
  }
);
