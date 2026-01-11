import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { getTenantFromRequest } from '@/lib/middleware/tenant';

export async function GET(request: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'));
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'DESC';
    const offset = (page - 1) * limit;

    // بناء شروط WHERE ديناميكيًا
    const whereConditions: string[] = ['s.tenant_id = ?', 's.is_active = TRUE'];
    const params: any[] = [tenant.id];

    if (categoryId && categoryId !== 'null') {
      whereConditions.push('s.category_id = ?');
      params.push(categoryId);
    }

    if (search && search.trim()) {
      whereConditions.push(`(
        s.name LIKE ? OR 
        s.name_ar LIKE ? OR 
        s.description LIKE ? OR 
        s.description_ar LIKE ? OR
        sp.business_name LIKE ? OR
        sp.business_name_ar LIKE ?
      )`);
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        whereConditions.push('s.base_price >= ?');
        params.push(min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        whereConditions.push('s.base_price <= ?');
        params.push(max);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // الحقول المسموح بها للترتيب
    const validSortFields: { [key: string]: string } = {
      created_at: 's.created_at',
      base_price: 's.base_price',
      name: 's.name',
      rating: 'sp.rating',
      reviews: 'sp.total_reviews',
    };

    const sortField = validSortFields[sortBy] || 's.created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // جلب الخدمات مع بيانات المزود والفئة
    const services = await query<any[]>(`
      SELECT 
        s.id,
        s.name,
        s.name_ar,
        s.description,
        s.description_ar,
        s.base_price as price,
        s.currency,
        s.duration_minutes as duration,
        s.pricing_type,
        s.images,
        s.is_active,
        s.created_at,
        sc.id as category_id,
        sc.name as category_name,
        sc.name_ar as category_name_ar,
        sp.id as provider_id,
        sp.business_name as provider_name,
        sp.business_name_ar as provider_name_ar,
        sp.rating as provider_rating,
        sp.total_reviews as provider_total_reviews,
        sp.logo as provider_logo,
        sp.verification_status as provider_verification_status,
        sp.featured as provider_featured
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // جلب العدد الكلي للخدمات
    const countResult = await query<any[]>(`
      SELECT COUNT(*) as total
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE ${whereClause}
    `, params);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // معالجة البيانات
    const formattedServices = services.map(service => {
      let images: string[] = [];
      if (service.images) {
        try {
          images = typeof service.images === 'string' 
            ? JSON.parse(service.images) 
            : service.images;
        } catch (e) {
          images = [];
        }
      }

      return {
        id: service.id,
        name: service.name,
        nameAr: service.name_ar,
        description: service.description,
        descriptionAr: service.description_ar,
        price: parseFloat(service.price),
        currency: service.currency,
        duration: service.duration,
        pricingType: service.pricing_type,
        images,
        isActive: service.is_active,
        createdAt: service.created_at,
        category: {
          id: service.category_id,
          name: service.category_name,
          nameAr: service.category_name_ar,
        },
        provider: {
          id: service.provider_id,
          name: service.provider_name,
          nameAr: service.provider_name_ar,
          rating: parseFloat(service.provider_rating) || 0,
          totalReviews: service.provider_total_reviews || 0,
          logo: service.provider_logo,
          verificationStatus: service.provider_verification_status,
          featured: service.provider_featured,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        services: formattedServices,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get services',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}