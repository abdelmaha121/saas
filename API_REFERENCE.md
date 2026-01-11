# API Reference - Quick Guide

## Authentication

All protected endpoints require:
- **Cookie:** `auth_token=<JWT_TOKEN>`
- **Header:** `x-tenant-subdomain: demo`

## Admin APIs

### Users Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users?page=1&limit=10&search=term&role=customer&status=active` | List users with pagination and filters | admin, super_admin |
| POST | `/api/admin/users` | Create new user | admin, super_admin |
| GET | `/api/admin/users/[id]` | Get user details | admin, super_admin |
| PUT | `/api/admin/users/[id]` | Update user | admin, super_admin |
| DELETE | `/api/admin/users/[id]` | Delete user | admin, super_admin |

### Providers Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/providers?page=1&status=verified&search=term` | List providers | admin, super_admin |
| POST | `/api/admin/providers` | Create provider | admin, super_admin |
| GET | `/api/admin/providers/[id]` | Get provider details | admin, super_admin |
| PUT | `/api/admin/providers/[id]` | Update provider | admin, super_admin |
| DELETE | `/api/admin/providers/[id]` | Delete provider | admin, super_admin |

### Categories Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/categories?parent_id=uuid&include_inactive=true` | List categories | admin, super_admin |
| POST | `/api/admin/categories` | Create category | admin, super_admin |
| GET | `/api/admin/categories/[id]` | Get category details | admin, super_admin |
| PUT | `/api/admin/categories/[id]` | Update category | admin, super_admin |
| DELETE | `/api/admin/categories/[id]` | Delete category | admin, super_admin |

### Bookings Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/bookings?page=1&status=pending&provider_id=uuid` | List bookings | admin, super_admin |
| GET | `/api/admin/bookings/[id]` | Get booking details | admin, super_admin |
| PUT | `/api/admin/bookings/[id]` | Update booking status | admin, super_admin |

### Statistics

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/statistics` | Get system statistics | admin, super_admin |

## Provider APIs

### Profile Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/provider/profile` | Get provider profile | provider, admin |
| PUT | `/api/provider/profile` | Update provider profile | provider, admin |

### Services Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/provider/services?include_inactive=true` | List provider services | provider, admin |
| POST | `/api/provider/services` | Create service | provider, admin |
| GET | `/api/provider/services/[id]` | Get service with addons | provider, admin |
| PUT | `/api/provider/services/[id]` | Update service | provider, admin |
| DELETE | `/api/provider/services/[id]` | Delete service | provider, admin |

### Bookings Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/provider/bookings?page=1&status=pending` | List provider bookings | provider, admin |
| PUT | `/api/provider/bookings/[id]/status` | Update booking status | provider, admin |

### Statistics

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/provider/statistics` | Get provider statistics | provider, admin |

## Public APIs

### Authentication

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user | None |
| POST | `/api/auth/login` | Login user | None |
| POST | `/api/auth/logout` | Logout user | Required |
| GET | `/api/auth/me` | Get current user | Required |

## Request Examples

### Create User (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H 'Content-Type: application/json' \
  -H 'Cookie: auth_token=YOUR_TOKEN' \
  -H 'x-tenant-subdomain: demo' \
  -d '{
    "email": "user@example.com",
    "password": "Pass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }'
```

### Update Provider Profile
```bash
curl -X PUT http://localhost:3000/api/provider/profile \
  -H 'Content-Type: application/json' \
  -H 'Cookie: auth_token=YOUR_TOKEN' \
  -H 'x-tenant-subdomain: demo' \
  -d '{
    "businessName": "My Business",
    "description": "Professional services"
  }'
```

### Create Service (Provider)
```bash
curl -X POST http://localhost:3000/api/provider/services \
  -H 'Content-Type: application/json' \
  -H 'Cookie: auth_token=YOUR_TOKEN' \
  -H 'x-tenant-subdomain: demo' \
  -d '{
    "categoryId": "CATEGORY_UUID",
    "name": "House Cleaning",
    "basePrice": 299.00,
    "currency": "SAR",
    "durationMinutes": 120
  }'
```

### Update Booking Status (Provider)
```bash
curl -X PUT http://localhost:3000/api/provider/bookings/BOOKING_ID/status \
  -H 'Content-Type: application/json' \
  -H 'Cookie: auth_token=YOUR_TOKEN' \
  -H 'x-tenant-subdomain: demo' \
  -d '{"status": "confirmed"}'
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "items": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Booking Status Flow

```
pending → confirmed → in_progress → completed
   ↓
cancelled
```

Valid status transitions for providers:
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `in_progress`
- `in_progress` → `completed`

## Notes

- All dates are in ISO 8601 format
- All amounts are decimal numbers
- Currency is 3-letter code (SAR, USD, etc.)
- UUIDs are in standard format
- Passwords must be strong (min 8 chars)
- Tenant subdomain is required for all requests
