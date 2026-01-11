import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    const bookings = await query<any[]>(
      `SELECT * FROM bookings WHERE id = ? LIMIT 1`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    if (booking.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?`,
      ['confirmed', bookingId]
    );

    await query(
      `UPDATE service_providers
       SET total_bookings = total_bookings + 1
       WHERE id = ?`,
      [booking.provider_id]
    );

    const notifications = [
      {
        user_id: booking.provider_id,
        type: 'new_booking',
        title: 'حجز جديد',
        title_ar: 'حجز جديد',
        message: 'You have received a new booking',
        message_ar: 'لديك حجز جديد',
        data: JSON.stringify({ booking_id: bookingId }),
      },
    ];

    for (const notif of notifications) {
      await query(
        `INSERT INTO notifications (
          id, tenant_id, user_id, type, title, title_ar, message, message_ar, data, is_read
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          require('uuid').v4(),
          booking.tenant_id,
          notif.user_id,
          notif.type,
          notif.title,
          notif.title_ar,
          notif.message,
          notif.message_ar,
          notif.data,
          false,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
