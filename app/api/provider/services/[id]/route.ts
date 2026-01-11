import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { query } from '@/lib/db/mysql';
import { createAuditLog, extractClientInfo } from '@/lib/services/audit';

async function getProviderId(userId: string, tenantId: string): Promise<string | null> {
  const providers = await query<any[]>(
    'SELECT id FROM service_providers WHERE user_id = ? AND tenant_id = ? LIMIT 1',
    [userId, tenantId]
  );
  return providers.length > 0 ? providers[0].id : null;
}

export const GET = requireRole(['provider', 'admin', 'super_admin'])(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const providerId = await getProviderId(request.user!.userId, request.user!.tenantId);

      if (!providerId) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      const services = await query<any[]>(
        `SELECT s.*, sc.name as category_name, sc.name_ar as category_name_ar
         FROM services s
         JOIN service_categories sc ON s.category_id = sc.id
         WHERE s.id = ? AND s.provider_id = ? AND s.tenant_id = ?
         LIMIT 1`,
        [params.id, providerId, request.user!.tenantId]
      );

      if (services.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      const addons = await query<any[]>(
        'SELECT * FROM service_addons WHERE service_id = ?',
        [params.id]
      );

      return NextResponse.json({
        service: services[0],
        addons,
      });
    } catch (error) {
      console.error('Get service error:', error);
      return NextResponse.json(
        { error: 'Failed to get service' },
        { status: 500 }
      );
    }
  }
);

export const PUT = requireRole(['provider', 'admin', 'super_admin'])(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const providerId = await getProviderId(request.user!.userId, request.user!.tenantId);

      if (!providerId) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      const body = await request.json();
      const {
        categoryId, name, nameAr, description, descriptionAr,
        basePrice, currency, durationMinutes, pricingType, images, isActive
      } = body;

      const updates: string[] = [];
      const values: any[] = [];

      if (categoryId !== undefined) {
        updates.push('category_id = ?');
        values.push(categoryId);
      }
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (nameAr !== undefined) {
        updates.push('name_ar = ?');
        values.push(nameAr);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (descriptionAr !== undefined) {
        updates.push('description_ar = ?');
        values.push(descriptionAr);
      }
      if (basePrice !== undefined) {
        updates.push('base_price = ?');
        values.push(basePrice);
      }
      if (currency !== undefined) {
        updates.push('currency = ?');
        values.push(currency);
      }
      if (durationMinutes !== undefined) {
        updates.push('duration_minutes = ?');
        values.push(durationMinutes);
      }
      if (pricingType !== undefined) {
        updates.push('pricing_type = ?');
        values.push(pricingType);
      }
      if (images !== undefined) {
        updates.push('images = ?');
        values.push(JSON.stringify(images));
      }
      if (isActive !== undefined) {
        updates.push('is_active = ?');
        values.push(isActive);
      }

      if (updates.length > 0) {
        await query(
          `UPDATE services
           SET ${updates.join(', ')}, updated_at = NOW()
           WHERE id = ? AND provider_id = ? AND tenant_id = ?`,
          [...values, params.id, providerId, request.user!.tenantId]
        );

        const clientInfo = extractClientInfo(request);
        await createAuditLog({
          tenantId: request.user!.tenantId,
          userId: request.user!.userId,
          action: 'provider.service.update',
          resourceType: 'service',
          resourceId: params.id,
          changes: body,
          ...clientInfo,
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Update service error:', error);
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = requireRole(['provider', 'admin', 'super_admin'])(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const providerId = await getProviderId(request.user!.userId, request.user!.tenantId);

      if (!providerId) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      await query(
        'DELETE FROM services WHERE id = ? AND provider_id = ? AND tenant_id = ?',
        [params.id, providerId, request.user!.tenantId]
      );

      const clientInfo = extractClientInfo(request);
      await createAuditLog({
        tenantId: request.user!.tenantId,
        userId: request.user!.userId,
        action: 'provider.service.delete',
        resourceType: 'service',
        resourceId: params.id,
        ...clientInfo,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Delete service error:', error);
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 }
      );
    }
  }
);
