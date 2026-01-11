# API Frontend Documentation

**Version:** 1.0.0
**Base URL:** `https://your-domain.com/api`
**Date:** January 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Services](#services)
3. [Bookings](#bookings)
4. [Categories](#categories)
5. [Reviews](#reviews)
6. [Notifications](#notifications)
7. [Wallet & Payments](#wallet--payments)
8. [Provider Management](#provider-management)
9. [Admin Management](#admin-management)
10. [Error Handling](#error-handling)
11. [Status Codes](#status-codes)

---

## Authentication

All authenticated endpoints require a valid JWT token stored in an HTTP-only cookie named `auth_token`.

### Login

**POST** `/api/auth/login`

Authenticate a user and receive authentication token.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

#### Example Request

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "user": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }
}
```

**Note:** Authentication token is automatically set in HTTP-only cookie.

#### Role Values
- `customer` - Regular customer
- `provider` - Service provider
- `provider_staff` - Provider staff member
- `admin` - Administrator
- `super_admin` - Super administrator

---

### Register

**POST** `/api/auth/register`

Create a new user account.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password (min 6 characters) |
| `firstName` | string | Yes | User's first name |
| `lastName` | string | No | User's last name |
| `phone` | string | No | User's phone number |
| `role` | string | Yes | User role (customer/provider) |

#### Example Request

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "firstName": "Ahmed",
  "lastName": "Mohammed",
  "phone": "+966501234567",
  "role": "customer"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "user": {
    "id": "uuid-v4",
    "email": "newuser@example.com",
    "firstName": "Ahmed",
    "lastName": "Mohammed",
    "role": "customer"
  }
}
```

---

### Get Current User

**GET** `/api/auth/me`

Get currently authenticated user information.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Success Response (200)

```json
{
  "user": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "phone": "+966501234567",
    "avatarUrl": "https://cdn.example.com/avatar.jpg",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Logout

**POST** `/api/auth/logout`

Logout current user and clear authentication cookie.

#### Success Response (200)

```json
{
  "success": true
}
```

---

## Services

### Get Services List

**GET** `/api/services`

Retrieve a paginated list of available services with filtering and sorting options.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 12 | Items per page |
| `category_id` | string | No | - | Filter by category ID |
| `search` | string | No | - | Search in service name/description |
| `min_price` | number | No | - | Minimum price filter |
| `max_price` | number | No | - | Maximum price filter |
| `sort_by` | string | No | created_at | Sort field (created_at, base_price, name) |
| `sort_order` | string | No | DESC | Sort direction (ASC, DESC) |

#### Example Request

```
GET /api/services?page=1&limit=12&category_id=123&min_price=50&max_price=500&sort_by=base_price&sort_order=ASC
```

#### Success Response (200)

```json
{
  "services": [
    {
      "id": "uuid-v4",
      "name": "Home Cleaning Service",
      "name_ar": "خدمة تنظيف المنزل",
      "description": "Professional home cleaning service",
      "description_ar": "خدمة تنظيف منزلي احترافية",
      "base_price": 299.00,
      "currency": "SAR",
      "duration_minutes": 120,
      "pricing_type": "fixed",
      "is_active": true,
      "images": ["url1.jpg", "url2.jpg"],
      "category_name": "Cleaning",
      "category_name_ar": "التنظيف",
      "provider_id": "uuid-v4",
      "provider_name": "Clean Co",
      "provider_name_ar": "شركة النظافة",
      "provider_rating": 4.8,
      "provider_reviews": 150,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  }
}
```

#### Pricing Type Values
- `fixed` - Fixed price
- `hourly` - Hourly rate
- `custom` - Custom pricing

---

### Get Service by ID

**GET** `/api/services/:id`

Get detailed information about a specific service.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Service UUID |

#### Success Response (200)

```json
{
  "service": {
    "id": "uuid-v4",
    "name": "Home Cleaning Service",
    "name_ar": "خدمة تنظيف المنزل",
    "description": "Professional home cleaning service with eco-friendly products",
    "description_ar": "خدمة تنظيف منزلي احترافية بمنتجات صديقة للبيئة",
    "base_price": 299.00,
    "currency": "SAR",
    "duration_minutes": 120,
    "pricing_type": "fixed",
    "is_active": true,
    "images": ["url1.jpg", "url2.jpg"],
    "metadata": {
      "includes": ["Deep cleaning", "Sanitization"],
      "requirements": ["Access to water", "Electricity"]
    },
    "category_id": "uuid-v4",
    "category_name": "Cleaning",
    "provider_id": "uuid-v4",
    "provider_name": "Clean Co",
    "provider_rating": 4.8,
    "provider_reviews": 150,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-10T00:00:00Z"
  },
  "addons": [
    {
      "id": "uuid-v4",
      "name": "Refrigerator Cleaning",
      "name_ar": "تنظيف الثلاجة",
      "price": 50.00,
      "currency": "SAR"
    }
  ]
}
```

---

## Bookings

### Create Booking

**POST** `/api/bookings`

Create a new service booking.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceId` | string | Yes | Service UUID |
| `providerId` | string | Yes | Provider UUID |
| `scheduledAt` | string | Yes | ISO 8601 datetime |
| `customerAddress` | object | No | Customer address details |
| `notes` | string | No | Additional notes |
| `addons` | array | No | Array of addon IDs |

#### Example Request

```json
{
  "serviceId": "uuid-v4-service",
  "providerId": "uuid-v4-provider",
  "scheduledAt": "2024-01-20T14:00:00Z",
  "customerAddress": {
    "street": "King Fahd Road",
    "city": "Riyadh",
    "district": "Al Malqa",
    "building": "Villa 123",
    "floor": "2",
    "unit": "2A",
    "phone": "+966501234567"
  },
  "notes": "Please bring eco-friendly products",
  "addons": ["uuid-addon-1", "uuid-addon-2"]
}
```

#### Success Response (201)

```json
{
  "success": true,
  "bookingId": "uuid-v4-booking",
  "totalAmount": 399.00
}
```

---

### Get My Bookings

**GET** `/api/bookings`

Get list of bookings for the authenticated customer.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `status` | string | No | - | Filter by status |

#### Status Values
- `pending` - Waiting for confirmation
- `confirmed` - Confirmed by provider
- `in_progress` - Service in progress
- `completed` - Service completed
- `cancelled` - Booking cancelled
- `refunded` - Payment refunded

#### Success Response (200)

```json
{
  "bookings": [
    {
      "id": "uuid-v4",
      "service_id": "uuid-service",
      "service_name": "Home Cleaning",
      "service_name_ar": "تنظيف المنزل",
      "service_images": ["url1.jpg"],
      "provider_id": "uuid-provider",
      "provider_name": "Clean Co",
      "provider_name_ar": "شركة النظافة",
      "status": "confirmed",
      "scheduled_at": "2024-01-20T14:00:00Z",
      "total_amount": 399.00,
      "currency": "SAR",
      "payment_status": "paid",
      "customer_address": {
        "street": "King Fahd Road",
        "city": "Riyadh"
      },
      "notes": "Please bring eco-friendly products",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### Get Booking by ID

**GET** `/api/bookings/:id`

Get detailed information about a specific booking.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking UUID |

#### Success Response (200)

```json
{
  "booking": {
    "id": "uuid-v4",
    "service_id": "uuid-service",
    "service_name": "Home Cleaning",
    "service_name_ar": "تنظيف المنزل",
    "provider_id": "uuid-provider",
    "provider_name": "Clean Co",
    "status": "confirmed",
    "booking_type": "one_time",
    "scheduled_at": "2024-01-20T14:00:00Z",
    "total_amount": 399.00,
    "commission_amount": 39.90,
    "currency": "SAR",
    "payment_status": "paid",
    "customer_address": {
      "street": "King Fahd Road",
      "city": "Riyadh",
      "district": "Al Malqa",
      "building": "Villa 123"
    },
    "notes": "Please bring eco-friendly products",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  "addons": [
    {
      "addon_id": "uuid-addon",
      "name": "Refrigerator Cleaning",
      "price": 50.00
    }
  ]
}
```

#### Booking Type Values
- `one_time` - One-time service
- `recurring` - Recurring service
- `emergency` - Emergency service

---

### Update Booking

**PUT** `/api/bookings/:id`

Update booking details (only allowed for pending bookings).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scheduledAt` | string | No | New scheduled datetime |
| `customerAddress` | object | No | Updated address |
| `notes` | string | No | Updated notes |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Booking updated successfully"
}
```

---

### Cancel Booking

**DELETE** `/api/bookings/:id`

Cancel a booking.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cancellationReason` | string | No | Reason for cancellation |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

## Categories

### Get Categories List

**GET** `/api/categories`

Get list of all service categories.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page |
| `search` | string | No | - | Search in category name |
| `parent_id` | string | No | - | Filter by parent category |

#### Success Response (200)

```json
{
  "categories": [
    {
      "id": "uuid-v4",
      "name": "Home Services",
      "name_ar": "خدمات منزلية",
      "description": "All home-related services",
      "description_ar": "جميع الخدمات المنزلية",
      "icon_url": "https://cdn.example.com/icons/home.svg",
      "parent_id": null,
      "display_order": 1,
      "is_active": true,
      "service_count": 45,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid-v4-2",
      "name": "Cleaning",
      "name_ar": "التنظيف",
      "description": "Professional cleaning services",
      "description_ar": "خدمات تنظيف احترافية",
      "icon_url": "https://cdn.example.com/icons/cleaning.svg",
      "parent_id": "uuid-v4",
      "display_order": 1,
      "is_active": true,
      "service_count": 15,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

### Get Category by ID

**GET** `/api/categories/:id`

Get detailed information about a specific category.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category UUID |

#### Success Response (200)

```json
{
  "category": {
    "id": "uuid-v4",
    "name": "Cleaning",
    "name_ar": "التنظيف",
    "description": "Professional cleaning services for homes and offices",
    "description_ar": "خدمات تنظيف احترافية للمنازل والمكاتب",
    "icon_url": "https://cdn.example.com/icons/cleaning.svg",
    "parent_id": "uuid-parent",
    "display_order": 1,
    "is_active": true,
    "metadata": {
      "popular_services": ["home_cleaning", "office_cleaning"]
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "subcategories": [
    {
      "id": "uuid-sub-1",
      "name": "Home Cleaning",
      "name_ar": "تنظيف المنزل",
      "service_count": 8
    }
  ],
  "services": [
    {
      "id": "uuid-service",
      "name": "Deep Cleaning",
      "base_price": 299.00,
      "provider_name": "Clean Co"
    }
  ]
}
```

---

## Reviews

### Create Review

**POST** `/api/reviews`

Create a new review for a completed booking.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookingId` | string | Yes | Booking UUID |
| `rating` | number | Yes | Rating from 1-5 |
| `comment` | string | No | Review comment |
| `serviceRating` | number | No | Service quality rating (1-5) |
| `professionalismRating` | number | No | Professionalism rating (1-5) |
| `valueRating` | number | No | Value for money rating (1-5) |

#### Example Request

```json
{
  "bookingId": "uuid-booking",
  "rating": 5,
  "comment": "Excellent service, very professional",
  "serviceRating": 5,
  "professionalismRating": 5,
  "valueRating": 4
}
```

#### Success Response (201)

```json
{
  "success": true,
  "reviewId": "uuid-review"
}
```

---

### Get Service Reviews

**GET** `/api/reviews?serviceId=:serviceId`

Get reviews for a specific service.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `serviceId` | string | Yes | - | Service UUID |
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `sort_by` | string | No | created_at | Sort field |
| `sort_order` | string | No | DESC | Sort direction |

#### Success Response (200)

```json
{
  "reviews": [
    {
      "id": "uuid-review",
      "booking_id": "uuid-booking",
      "customer_name": "Ahmed Mohammed",
      "rating": 5,
      "comment": "Excellent service, very professional",
      "service_rating": 5,
      "professionalism_rating": 5,
      "value_rating": 4,
      "provider_response": "Thank you for your feedback!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "average_rating": 4.8,
    "total_reviews": 150,
    "rating_distribution": {
      "5": 120,
      "4": 20,
      "3": 7,
      "2": 2,
      "1": 1
    }
  },
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

### Update Review

**PUT** `/api/reviews/:id`

Update an existing review (within 48 hours of creation).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Review UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | number | No | Updated rating |
| `comment` | string | No | Updated comment |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Review updated successfully"
}
```

---

### Delete Review

**DELETE** `/api/reviews/:id`

Delete a review (within 48 hours of creation).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Review UUID |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Notifications

### Get Notifications

**GET** `/api/notifications`

Get list of notifications for the authenticated user.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page |
| `is_read` | boolean | No | - | Filter by read status |

#### Success Response (200)

```json
{
  "notifications": [
    {
      "id": "uuid-notification",
      "type": "booking_confirmed",
      "title": "Booking Confirmed",
      "title_ar": "تم تأكيد الحجز",
      "message": "Your booking has been confirmed by the provider",
      "message_ar": "تم تأكيد حجزك من قبل مقدم الخدمة",
      "data": {
        "booking_id": "uuid-booking",
        "scheduled_at": "2024-01-20T14:00:00Z"
      },
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "unread_count": 5,
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Notification Types
- `booking_confirmed` - Booking confirmed
- `booking_cancelled` - Booking cancelled
- `booking_completed` - Booking completed
- `payment_received` - Payment received
- `review_received` - Review received
- `provider_assigned` - Provider assigned

---

### Mark Notification as Read

**POST** `/api/notifications/:id/read`

Mark a specific notification as read.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Notification UUID |

#### Success Response (200)

```json
{
  "success": true
}
```

---

### Mark All Notifications as Read

**POST** `/api/notifications/read-all`

Mark all notifications as read for the authenticated user.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Success Response (200)

```json
{
  "success": true,
  "marked_count": 5
}
```

---

## Wallet & Payments

### Get Wallet Balance

**GET** `/api/wallet`

Get wallet balance and transaction history for authenticated user.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page |

#### Success Response (200)

```json
{
  "wallet": {
    "balance": 500.00,
    "currency": "SAR",
    "total_earned": 5000.00,
    "total_withdrawn": 4500.00
  },
  "transactions": [
    {
      "id": "uuid-transaction",
      "type": "credit",
      "amount": 299.00,
      "currency": "SAR",
      "description": "Payment for booking #12345",
      "reference_type": "booking",
      "reference_id": "uuid-booking",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 85,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### Transaction Types
- `credit` - Money added to wallet
- `debit` - Money deducted from wallet
- `withdrawal` - Money withdrawn
- `refund` - Refund received

#### Transaction Status
- `pending` - Transaction pending
- `completed` - Transaction completed
- `failed` - Transaction failed
- `cancelled` - Transaction cancelled

---

### Process Payment

**POST** `/api/payments`

Process a payment for a booking.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookingId` | string | Yes | Booking UUID |
| `paymentMethod` | string | Yes | Payment method type |
| `paymentDetails` | object | No | Payment method details |

#### Payment Methods
- `card` - Credit/Debit card
- `wallet` - Wallet balance
- `cash` - Cash on delivery

#### Example Request

```json
{
  "bookingId": "uuid-booking",
  "paymentMethod": "card",
  "paymentDetails": {
    "cardToken": "tok_visa_4242"
  }
}
```

#### Success Response (200)

```json
{
  "success": true,
  "paymentId": "uuid-payment",
  "status": "paid",
  "amount": 399.00,
  "currency": "SAR"
}
```

---

## Provider Management

### Get Provider Profile

**GET** `/api/provider/profile`

Get authenticated provider's profile information.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Success Response (200)

```json
{
  "provider": {
    "id": "uuid-provider",
    "user_id": "uuid-user",
    "business_name": "Clean Co",
    "business_name_ar": "شركة النظافة",
    "description": "Professional cleaning services",
    "description_ar": "خدمات تنظيف احترافية",
    "verification_status": "verified",
    "rating": 4.8,
    "total_reviews": 150,
    "total_bookings": 350,
    "commission_rate": 10.0,
    "is_active": true,
    "featured": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Verification Status Values
- `pending` - Verification pending
- `verified` - Verified provider
- `rejected` - Verification rejected

---

### Update Provider Profile

**PUT** `/api/provider/profile`

Update provider profile information.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `businessName` | string | No | Business name (English) |
| `businessNameAr` | string | No | Business name (Arabic) |
| `description` | string | No | Description (English) |
| `descriptionAr` | string | No | Description (Arabic) |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### Get Provider Services

**GET** `/api/provider/services`

Get list of services offered by the authenticated provider.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `is_active` | boolean | No | - | Filter by active status |

#### Success Response (200)

```json
{
  "services": [
    {
      "id": "uuid-service",
      "name": "Home Cleaning",
      "name_ar": "تنظيف المنزل",
      "category_name": "Cleaning",
      "base_price": 299.00,
      "currency": "SAR",
      "is_active": true,
      "total_bookings": 45,
      "average_rating": 4.8,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### Create Provider Service

**POST** `/api/provider/services`

Create a new service offering.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `categoryId` | string | Yes | Category UUID |
| `name` | string | Yes | Service name (English) |
| `nameAr` | string | No | Service name (Arabic) |
| `description` | string | No | Description (English) |
| `descriptionAr` | string | No | Description (Arabic) |
| `basePrice` | number | Yes | Base price |
| `currency` | string | Yes | Currency code (SAR) |
| `durationMinutes` | number | No | Duration in minutes |
| `pricingType` | string | Yes | Pricing type |
| `images` | array | No | Array of image URLs |

#### Example Request

```json
{
  "categoryId": "uuid-category",
  "name": "Deep Home Cleaning",
  "nameAr": "تنظيف عميق للمنزل",
  "description": "Complete deep cleaning service",
  "descriptionAr": "خدمة تنظيف عميق كاملة",
  "basePrice": 399.00,
  "currency": "SAR",
  "durationMinutes": 180,
  "pricingType": "fixed",
  "images": ["url1.jpg", "url2.jpg"]
}
```

#### Success Response (201)

```json
{
  "success": true,
  "serviceId": "uuid-service"
}
```

---

### Update Provider Service

**PUT** `/api/provider/services/:id`

Update an existing service.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Service UUID |

#### Request Body

Same fields as Create Service (all optional).

#### Success Response (200)

```json
{
  "success": true,
  "message": "Service updated successfully"
}
```

---

### Delete Provider Service

**DELETE** `/api/provider/services/:id`

Delete a service (soft delete - marks as inactive).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Service UUID |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

### Get Provider Bookings

**GET** `/api/provider/bookings`

Get list of bookings for the authenticated provider.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `status` | string | No | - | Filter by status |
| `date_from` | string | No | - | Filter from date (ISO 8601) |
| `date_to` | string | No | - | Filter to date (ISO 8601) |

#### Success Response (200)

```json
{
  "bookings": [
    {
      "id": "uuid-booking",
      "service_name": "Home Cleaning",
      "customer_name": "Ahmed Mohammed",
      "customer_phone": "+966501234567",
      "status": "confirmed",
      "scheduled_at": "2024-01-20T14:00:00Z",
      "total_amount": 399.00,
      "commission_amount": 39.90,
      "customer_address": {
        "street": "King Fahd Road",
        "city": "Riyadh"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 85,
    "page": 1,
    "limit": 10,
    "totalPages": 9
  }
}
```

---

### Update Booking Status

**POST** `/api/provider/bookings/:id/status`

Update the status of a booking.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New booking status |
| `notes` | string | No | Status change notes |

#### Valid Status Transitions
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `in_progress` or `cancelled`
- `in_progress` → `completed`

#### Example Request

```json
{
  "status": "confirmed",
  "notes": "Confirmed for scheduled time"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Booking status updated successfully"
}
```

---

### Get Provider Statistics

**GET** `/api/provider/statistics`

Get statistics and analytics for the authenticated provider.

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | month | Time period (week, month, year) |

#### Success Response (200)

```json
{
  "summary": {
    "total_bookings": 350,
    "completed_bookings": 320,
    "cancelled_bookings": 15,
    "total_revenue": 105000.00,
    "average_rating": 4.8,
    "total_reviews": 150
  },
  "period_stats": {
    "bookings": 45,
    "revenue": 13500.00,
    "new_customers": 15
  },
  "revenue_chart": [
    {
      "date": "2024-01-01",
      "amount": 1200.00
    }
  ],
  "top_services": [
    {
      "service_id": "uuid-service",
      "name": "Home Cleaning",
      "bookings": 25,
      "revenue": 7475.00
    }
  ]
}
```

---

## Admin Management

### Get All Users

**GET** `/api/admin/users`

Get list of all users (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Required Roles
- `admin`
- `super_admin`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `role` | string | No | - | Filter by role |
| `status` | string | No | - | Filter by status |
| `search` | string | No | - | Search in email/name/phone |

#### Success Response (200)

```json
{
  "users": [
    {
      "id": "uuid-user",
      "email": "user@example.com",
      "phone": "+966501234567",
      "first_name": "Ahmed",
      "last_name": "Mohammed",
      "role": "customer",
      "status": "active",
      "avatar_url": "https://cdn.example.com/avatar.jpg",
      "last_login_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 10,
    "totalPages": 125
  }
}
```

---

### Create User (Admin)

**POST** `/api/admin/users`

Create a new user account (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email |
| `password` | string | Yes | User's password |
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `phone` | string | No | Phone number |
| `role` | string | Yes | User role |
| `status` | string | No | Account status (default: active) |

#### Success Response (201)

```json
{
  "success": true,
  "userId": "uuid-user"
}
```

---

### Update User (Admin)

**PUT** `/api/admin/users/:id`

Update user information (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User UUID |

#### Request Body

All fields are optional.

#### Success Response (200)

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### Delete User (Admin)

**DELETE** `/api/admin/users/:id`

Delete a user account (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User UUID |

#### Success Response (200)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Get All Providers (Admin)

**GET** `/api/admin/providers`

Get list of all service providers (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `verification_status` | string | No | - | Filter by verification status |
| `is_active` | boolean | No | - | Filter by active status |
| `search` | string | No | - | Search in business name |

#### Success Response (200)

```json
{
  "providers": [
    {
      "id": "uuid-provider",
      "user_id": "uuid-user",
      "business_name": "Clean Co",
      "business_name_ar": "شركة النظافة",
      "verification_status": "verified",
      "rating": 4.8,
      "total_reviews": 150,
      "total_bookings": 350,
      "commission_rate": 10.0,
      "is_active": true,
      "featured": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 85,
    "page": 1,
    "limit": 10,
    "totalPages": 9
  }
}
```

---

### Update Provider Status (Admin)

**PUT** `/api/admin/providers/:id`

Update provider information and status (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Provider UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verificationStatus` | string | No | Verification status |
| `isActive` | boolean | No | Active status |
| `commissionRate` | number | No | Commission rate (%) |
| `featured` | boolean | No | Featured status |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Provider updated successfully"
}
```

---

### Get All Bookings (Admin)

**GET** `/api/admin/bookings`

Get list of all bookings (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `status` | string | No | - | Filter by status |
| `date_from` | string | No | - | Filter from date |
| `date_to` | string | No | - | Filter to date |
| `provider_id` | string | No | - | Filter by provider |
| `customer_id` | string | No | - | Filter by customer |

#### Success Response (200)

```json
{
  "bookings": [
    {
      "id": "uuid-booking",
      "customer_name": "Ahmed Mohammed",
      "provider_name": "Clean Co",
      "service_name": "Home Cleaning",
      "status": "completed",
      "scheduled_at": "2024-01-20T14:00:00Z",
      "total_amount": 399.00,
      "commission_amount": 39.90,
      "payment_status": "paid",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 3500,
    "page": 1,
    "limit": 10,
    "totalPages": 350
  }
}
```

---

### Get Admin Statistics

**GET** `/api/admin/statistics`

Get platform-wide statistics (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | month | Time period (week, month, year, all) |

#### Success Response (200)

```json
{
  "overview": {
    "total_users": 5000,
    "total_providers": 150,
    "total_customers": 4800,
    "active_bookings": 45,
    "total_bookings": 3500,
    "total_revenue": 1050000.00,
    "platform_revenue": 105000.00
  },
  "period_stats": {
    "new_users": 120,
    "new_bookings": 350,
    "revenue": 105000.00,
    "cancelled_bookings": 15
  },
  "revenue_chart": [
    {
      "date": "2024-01-01",
      "revenue": 12000.00,
      "bookings": 40
    }
  ],
  "top_providers": [
    {
      "provider_id": "uuid-provider",
      "business_name": "Clean Co",
      "bookings": 85,
      "revenue": 25500.00,
      "rating": 4.8
    }
  ],
  "top_services": [
    {
      "service_id": "uuid-service",
      "name": "Home Cleaning",
      "bookings": 450,
      "revenue": 134550.00
    }
  ],
  "category_distribution": [
    {
      "category_name": "Cleaning",
      "bookings": 1200,
      "percentage": 34.3
    }
  ]
}
```

---

### Manage Categories (Admin)

**POST** `/api/admin/categories`

Create a new service category (admin only).

#### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Cookie` | `auth_token=<token>` | Yes |
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Category name (English) |
| `nameAr` | string | No | Category name (Arabic) |
| `description` | string | No | Description (English) |
| `descriptionAr` | string | No | Description (Arabic) |
| `iconUrl` | string | No | Icon URL |
| `parentId` | string | No | Parent category ID |
| `displayOrder` | number | No | Display order |

#### Success Response (201)

```json
{
  "success": true,
  "categoryId": "uuid-category"
}
```

---

## Error Handling

All API endpoints return consistent error responses with the following structure:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details if applicable"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required or invalid token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `DUPLICATE_ENTRY` | Resource already exists |
| `INTERNAL_ERROR` | Server error |

---

## Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Resource created successfully |
| `400` | Bad request - Invalid input |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable entity - Validation failed |
| `500` | Internal server error |

---

## Best Practices

### Pagination

All list endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: varies by endpoint)

Response includes:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Filtering

Most endpoints support filtering through query parameters. Refer to individual endpoint documentation for available filters.

### Sorting

List endpoints typically support:
- `sort_by` - Field to sort by
- `sort_order` - Sort direction (`ASC` or `DESC`)

### Search

Search is implemented using the `search` query parameter and typically searches across multiple fields (name, description, etc.).

### Date Formats

All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

Example: `2024-01-20T14:00:00Z`

### Currency

All monetary values include a `currency` field. Default currency is `SAR` (Saudi Riyal).

### Localization

Most content includes both English and Arabic versions:
- `name` / `name_ar`
- `description` / `description_ar`
- `title` / `title_ar`

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Authenticated requests:** 1000 requests per hour
- **Unauthenticated requests:** 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642435200
```

---

## Support

For API support and questions, contact:
- **Email:** api-support@example.com
- **Documentation:** https://docs.example.com

---

**Last Updated:** January 2026
**Version:** 1.0.0
