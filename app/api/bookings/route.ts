import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query } from '@/lib/db/mysql';
import { createAuditLog, extractClientInfo } from '@/lib/services/audit';
import { v4 as uuidv4 } from 'uuid';

export const GET = requireAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const offset = (page - 1) * limit;

      let whereConditions = ['b.customer_id = ?', 'b.tenant_id = ?'];
      const params: any[] = [request.user!.userId, request.user!.tenantId];

      if (status) {
        whereConditions.push('b.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      const [bookings, countResult] = await Promise.all([
        query<any[]>(
          `SELECT b.*,
                  sp.business_name as provider_name, sp.business_name_ar as provider_name_ar,
                  s.name as service_name, s.name_ar as service_name_ar,
                  s.images as service_images
           FROM bookings b
           JOIN service_providers sp ON b.provider_id = sp.id
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
      console.error('Get bookings error:', error);
      return NextResponse.json(
        { error: 'Failed to get bookings' },
        { status: 500 }
      );
    }
  }
);

export const POST = requireAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const {
        serviceId,
        providerId,
        scheduledAt,
        customerAddress,
        notes,
        addons,
      } = body;

      if (!serviceId || !providerId || !scheduledAt) {
        return NextResponse.json(
          { error: 'Service ID, Provider ID, and scheduled time are required' },
          { status: 400 }
        );
      }

      const services = await query<any[]>(
        `SELECT s.*, sp.commission_rate
         FROM services s
         JOIN service_providers sp ON s.provider_id = sp.id
         WHERE s.id = ? AND s.provider_id = ? AND s.tenant_id = ? AND s.is_active = TRUE
         LIMIT 1`,
        [serviceId, providerId, request.user!.tenantId]
      );

      if (services.length === 0) {
        return NextResponse.json(
          { error: 'Service not found or not available' },
          { status: 404 }
        );
      }

      const service = services[0];
      let totalAmount = parseFloat(service.base_price);

      let addonIds: string[] = [];
      if (addons && addons.length > 0) {
        addonIds = addons;
        const addonsList = await query<any[]>(
          `SELECT * FROM service_addons WHERE service_id = ? AND id IN (?)`,
          [serviceId, addonIds]
        );

        for (const addon of addonsList) {
          totalAmount += parseFloat(addon.price);
        }
      }

      const commissionAmount = (totalAmount * service.commission_rate) / 100;

      const bookingId = uuidv4();

      await query(
        `INSERT INTO bookings (
          id, tenant_id, customer_id, provider_id, service_id,
          booking_type, status, scheduled_at, total_amount, commission_amount,
          currency, payment_status, customer_address, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          request.user!.tenantId,
          request.user!.userId,
          providerId,
          serviceId,
          'one_time',
          'pending',
          scheduledAt,
          totalAmount,
          commissionAmount,
          service.currency,
          'pending',
          customerAddress ? JSON.stringify(customerAddress) : null,
          notes || null,
        ]
      );

      if (addonIds.length > 0) {
        const addonsList = await query<any[]>(
          `SELECT * FROM service_addons WHERE service_id = ? AND id IN (?)`,
          [serviceId, addonIds]
        );

        for (const addon of addonsList) {
          await query(
            'INSERT INTO booking_addons (booking_id, addon_id, price) VALUES (?, ?, ?)',
            [bookingId, addon.id, addon.price]
          );
        }
      }

      const clientInfo = extractClientInfo(request);
      await createAuditLog({
        tenantId: request.user!.tenantId,
        userId: request.user!.userId,
        action: 'customer.booking.create',
        resourceType: 'booking',
        resourceId: bookingId,
        changes: { serviceId, providerId, totalAmount },
        ...clientInfo,
      });

      return NextResponse.json(
        {
          success: true,
          bookingId,
          totalAmount,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Create booking error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }
  }
);
