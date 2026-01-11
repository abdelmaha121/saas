import { NextRequest } from 'next/server';
import { query } from '../db/mysql';
import { Tenant } from '../types/database';

export async function getTenantFromRequest(request: NextRequest): Promise<Tenant | null> {
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  const subdomainHeader = request.headers.get('x-tenant-subdomain');
  const tenantSubdomain = subdomainHeader || subdomain;

  const tenant = await query<Tenant[]>(
    'SELECT * FROM tenants WHERE subdomain = ? AND status = ? LIMIT 1',
    [tenantSubdomain, 'active']
  );

  return tenant.length > 0 ? tenant[0] : null;
}

export function buildTenantFilter(tenantId: string): string {
  return `tenant_id = '${tenantId}'`;
}
