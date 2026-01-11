import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query, transaction } from '@/lib/db/mysql';
import { createAuditLog, extractClientInfo } from '@/lib/services/audit';
import { v4 as uuidv4 } from 'uuid';

export const POST = requireAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { bookingId, rating, comment, media } = body;

      if (!bookingId || !rating) {
        return NextResponse.json(
          { error: 'Booking ID and rating are required' },
          { status: 400 }
        );
      }

      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }

      const bookings = await query<any[]>(
        `SELECT b.*, sp.id as provider_id
         FROM bookings b
         JOIN service_providers sp ON b.provider_id = sp.id
         WHERE b.id = ? AND b.customer_id = ? AND b.tenant_id = ? AND b.status = 'completed'
         LIMIT 1`,
        [bookingId, request.user!.userId, request.user!.tenantId]
      );

      if (bookings.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found or not completed' },
          { status: 404 }
        );
      }

      const existingReviews = await query<any[]>(
        'SELECT id FROM reviews WHERE booking_id = ? LIMIT 1',
        [bookingId]
      );

      if (existingReviews.length > 0) {
        return NextResponse.json(
          { error: 'Review already exists for this booking' },
          { status: 409 }
        );
      }

      const reviewId = uuidv4();
      const providerId = bookings[0].provider_id;

      await transaction(async (conn) => {
        await conn.execute(
          `INSERT INTO reviews (
            id, tenant_id, booking_id, customer_id, provider_id,
            rating, comment, media, is_verified
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reviewId,
            request.user!.tenantId,
            bookingId,
            request.user!.userId,
            providerId,
            rating,
            comment || null,
            media ? JSON.stringify(media) : null,
            true,
          ]
        );

        const [providerStats] = await conn.execute(
          `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
           FROM reviews
           WHERE provider_id = ? AND tenant_id = ?`,
          [providerId, request.user!.tenantId]
        ) as any;

        await conn.execute(
          `UPDATE service_providers
           SET rating = ?, total_reviews = ?, updated_at = NOW()
           WHERE id = ? AND tenant_id = ?`,
          [
            providerStats[0].avg_rating || 0,
            providerStats[0].total_reviews || 0,
            providerId,
            request.user!.tenantId,
          ]
        );
      });

      const clientInfo = extractClientInfo(request);
      await createAuditLog({
        tenantId: request.user!.tenantId,
        userId: request.user!.userId,
        action: 'customer.review.create',
        resourceType: 'review',
        resourceId: reviewId,
        changes: { bookingId, rating },
        ...clientInfo,
      });

      return NextResponse.json(
        { success: true, reviewId },
        { status: 201 }
      );
    } catch (error) {
      console.error('Create review error:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }
  }
);
