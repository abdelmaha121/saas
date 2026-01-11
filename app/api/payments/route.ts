import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query, transaction } from '@/lib/db/mysql';
import { createAuditLog, extractClientInfo } from '@/lib/services/audit';
import { v4 as uuidv4 } from 'uuid';

export const POST = requireAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { bookingId, paymentMethod, paymentGatewayReference } = body;

      if (!bookingId || !paymentMethod) {
        return NextResponse.json(
          { error: 'Booking ID and payment method are required' },
          { status: 400 }
        );
      }

      const bookings = await query<any[]>(
        `SELECT * FROM bookings
         WHERE id = ? AND customer_id = ? AND tenant_id = ? AND payment_status = 'pending'
         LIMIT 1`,
        [bookingId, request.user!.userId, request.user!.tenantId]
      );

      if (bookings.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found or already paid' },
          { status: 404 }
        );
      }

      const booking = bookings[0];
      const paymentId = uuidv4();

      await transaction(async (conn) => {
        await conn.execute(
          `INSERT INTO payments (
            id, tenant_id, booking_id, user_id, amount, currency,
            payment_method, payment_gateway_reference, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            paymentId,
            request.user!.tenantId,
            bookingId,
            request.user!.userId,
            booking.total_amount,
            booking.currency,
            paymentMethod,
            paymentGatewayReference || null,
            'completed',
          ]
        );

        await conn.execute(
          `UPDATE bookings
           SET payment_status = ?, updated_at = NOW()
           WHERE id = ? AND tenant_id = ?`,
          ['paid', bookingId, request.user!.tenantId]
        );

        if (paymentMethod === 'wallet') {
          const [wallets] = await conn.execute(
            `SELECT id, balance FROM wallets
             WHERE user_id = ? AND tenant_id = ?
             LIMIT 1`,
            [request.user!.userId, request.user!.tenantId]
          ) as any;

          if (wallets.length > 0) {
            const wallet = wallets[0];
            const newBalance = parseFloat(wallet.balance) - parseFloat(booking.total_amount);

            if (newBalance < 0) {
              throw new Error('Insufficient wallet balance');
            }

            await conn.execute(
              `UPDATE wallets
               SET balance = ?, updated_at = NOW()
               WHERE id = ?`,
              [newBalance, wallet.id]
            );

            const transactionId = uuidv4();
            await conn.execute(
              `INSERT INTO wallet_transactions (
                id, wallet_id, type, amount, balance_after, reference_type, reference_id, description
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                transactionId,
                wallet.id,
                'debit',
                booking.total_amount,
                newBalance,
                'booking',
                bookingId,
                'Payment for booking',
              ]
            );
          }
        }
      });

      const clientInfo = extractClientInfo(request);
      await createAuditLog({
        tenantId: request.user!.tenantId,
        userId: request.user!.userId,
        action: 'customer.payment.create',
        resourceType: 'payment',
        resourceId: paymentId,
        changes: { bookingId, amount: booking.total_amount, method: paymentMethod },
        ...clientInfo,
      });

      return NextResponse.json(
        {
          success: true,
          paymentId,
          amount: booking.total_amount,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Create payment error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to process payment' },
        { status: 500 }
      );
    }
  }
);

export const GET = requireAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = (page - 1) * limit;

      const [payments, countResult] = await Promise.all([
        query<any[]>(
          `SELECT p.*, b.service_id,
                  s.name as service_name, s.name_ar as service_name_ar
           FROM payments p
           JOIN bookings b ON p.booking_id = b.id
           JOIN services s ON b.service_id = s.id
           WHERE p.user_id = ? AND p.tenant_id = ?
           ORDER BY p.created_at DESC
           LIMIT ? OFFSET ?`,
          [request.user!.userId, request.user!.tenantId, limit, offset]
        ),
        query<any[]>(
          'SELECT COUNT(*) as total FROM payments WHERE user_id = ? AND tenant_id = ?',
          [request.user!.userId, request.user!.tenantId]
        ),
      ]);

      return NextResponse.json({
        payments,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit),
        },
      });
    } catch (error) {
      console.error('Get payments error:', error);
      return NextResponse.json(
        { error: 'Failed to get payments' },
        { status: 500 }
      );
    }
  }
);
