import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';

    if (!searchQuery) {
      return NextResponse.json({
        categories: [],
        services: [],
        providers: []
      });
    }

    const searchPattern = `%${searchQuery}%`;

    const [categories, services, providers] = await Promise.all([
      query(
        `SELECT id, name, description, icon, display_order, is_active
         FROM categories
         WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1
         ORDER BY display_order ASC
         LIMIT 10`,
        [searchPattern, searchPattern]
      ),
      query(
        `SELECT s.id, s.name, s.description, s.price, s.duration,
                s.category_id, s.provider_id, s.is_available,
                c.name as category_name,
                p.business_name as provider_name,
                p.logo as provider_logo,
                (SELECT AVG(rating) FROM reviews WHERE service_id = s.id) as avg_rating,
                (SELECT COUNT(*) FROM reviews WHERE service_id = s.id) as review_count
         FROM services s
         LEFT JOIN categories c ON s.category_id = c.id
         LEFT JOIN providers p ON s.provider_id = p.id
         WHERE (s.name LIKE ? OR s.description LIKE ?)
               AND s.is_available = 1
               AND s.status = 'approved'
         ORDER BY s.created_at DESC
         LIMIT 10`,
        [searchPattern, searchPattern]
      ),
      query(
        `SELECT p.id, p.business_name, p.description, p.logo,
                p.city, p.address, p.phone,
                (SELECT AVG(rating) FROM reviews r
                 INNER JOIN services s ON r.service_id = s.id
                 WHERE s.provider_id = p.id) as avg_rating,
                (SELECT COUNT(DISTINCT s.id) FROM services s
                 WHERE s.provider_id = p.id AND s.is_available = 1) as service_count
         FROM providers p
         INNER JOIN users u ON p.user_id = u.id
         WHERE (p.business_name LIKE ? OR p.description LIKE ?)
               AND p.status = 'approved'
               AND u.status = 'active'
         ORDER BY p.created_at DESC
         LIMIT 10`,
        [searchPattern, searchPattern]
      )
    ]);

    return NextResponse.json({
      categories: categories || [],
      services: services || [],
      providers: providers || []
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
