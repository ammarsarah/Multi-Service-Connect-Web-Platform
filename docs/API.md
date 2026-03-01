# API Documentation — Multi-Service Connect

**Base URL:** `http://localhost/api` (production: `https://yourdomain.com/api`)

All protected routes require the `Authorization: Bearer <access_token>` header.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Services](#3-services)
4. [Requests](#4-requests)
5. [Payments](#5-payments)
6. [Reviews](#6-reviews)
7. [Categories](#7-categories)
8. [Notifications](#8-notifications)
9. [Admin](#9-admin)
10. [AI](#10-ai)

---

## Common Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

**Common HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Bad Request / Validation Error |
| 401  | Unauthorized (missing or invalid token) |
| 403  | Forbidden (insufficient role) |
| 404  | Not Found |
| 409  | Conflict (duplicate resource) |
| 422  | Unprocessable Entity |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

---

## 1. Authentication

### POST /auth/register

Create a new user account.

**Auth required:** No

**Request Body:**
```json
{
  "name":     "string (required, 2–100 chars)",
  "email":    "string (required, valid email)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, digit, special char)",
  "role":     "string (optional, 'client' | 'prestataire', default: 'client')",
  "phone":    "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "role": "client",
      "is_email_verified": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Account created. Please verify your email."
}
```

**Error Codes:**
- `400` — Validation failed
- `409` — Email already registered

---

### POST /auth/login

Authenticate and obtain tokens.

**Auth required:** No

**Request Body:**
```json
{
  "email":    "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "role": "client",
      "avatar_url": null,
      "is_email_verified": true
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Codes:**
- `400` — Validation failed
- `401` — Invalid credentials
- `403` — Account banned

---

### POST /auth/refresh-token

Obtain a new access token using a refresh token.

**Auth required:** No

**Request Body:**
```json
{
  "refresh_token": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Codes:**
- `401` — Invalid or expired refresh token

---

### POST /auth/logout

Invalidate the current refresh token.

**Auth required:** Yes

**Request Body:**
```json
{
  "refresh_token": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/verify-email/:token

Verify a user's email address with the token sent by email.

**Auth required:** No

**URL Parameters:**
- `token` — Email verification token (UUID)

**Response 200:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Codes:**
- `400` — Token invalid or expired

---

### POST /auth/forgot-password

Send a password reset email.

**Auth required:** No

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a reset link has been sent."
}
```

---

### POST /auth/reset-password

Reset the password using a valid token.

**Auth required:** No

**Request Body:**
```json
{
  "token":    "string (required)",
  "password": "string (required, min 8 chars)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Codes:**
- `400` — Token invalid, expired, or already used

---

### GET /auth/profile

Get the currently authenticated user's profile.

**Auth required:** Yes

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "prestataire",
    "phone": "+33611111111",
    "avatar_url": "https://...",
    "is_email_verified": true,
    "is_active": true,
    "created_at": "2024-01-10T08:00:00Z",
    "provider_profile": {
      "bio": "Plombier certifié...",
      "location": "Paris",
      "skills": ["plomberie", "chauffage"],
      "avg_rating": 4.8,
      "total_requests": 25,
      "completed_requests": 23,
      "success_rate": 92.00,
      "is_validated": true
    }
  }
}
```

---

## 2. Users

### GET /users

List all users.

**Auth required:** Yes  
**Role required:** `admin`

**Query Parameters:**
| Param    | Type   | Description |
|----------|--------|-------------|
| page     | number | Page number (default: 1) |
| limit    | number | Items per page (default: 20, max: 100) |
| role     | string | Filter by role: `client`, `prestataire`, `admin` |
| is_active | boolean | Filter by active status |
| search   | string | Search by name or email |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "users": [ { ... } ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

---

### GET /users/:id

Get a specific user's public profile.

**Auth required:** Yes

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jean Dupont",
    "role": "prestataire",
    "avatar_url": null,
    "created_at": "2024-01-10T08:00:00Z",
    "provider_profile": { ... }
  }
}
```

**Error Codes:**
- `404` — User not found

---

### PUT /users/profile

Update the authenticated user's basic profile.

**Auth required:** Yes

**Request Body:**
```json
{
  "name":       "string (optional)",
  "phone":      "string (optional)",
  "avatar_url": "string (optional, valid URL)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "user": { ... } },
  "message": "Profile updated"
}
```

---

### PUT /users/provider-profile

Update the authenticated prestataire's extended profile.

**Auth required:** Yes  
**Role required:** `prestataire`

**Request Body:**
```json
{
  "bio":                 "string (optional)",
  "location":            "string (optional)",
  "latitude":            "number (optional)",
  "longitude":           "number (optional)",
  "skills":              ["array of strings (optional)"],
  "years_experience":    "number (optional)",
  "availability_status": "string (optional): 'available' | 'busy' | 'unavailable'",
  "response_time_hours": "number (optional)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "provider_profile": { ... } },
  "message": "Provider profile updated"
}
```

---

### DELETE /users/:id

Delete a user account.

**Auth required:** Yes  
**Role required:** `admin` or own account

**Response 200:**
```json
{
  "success": true,
  "message": "User deleted"
}
```

**Error Codes:**
- `403` — Cannot delete another user's account (non-admin)
- `404` — User not found

---

## 3. Services

### GET /services

List all active services.

**Auth required:** No

**Query Parameters:**
| Param       | Type   | Description |
|-------------|--------|-------------|
| page        | number | Page (default: 1) |
| limit       | number | Items per page (default: 12) |
| category_id | uuid   | Filter by category |
| min_price   | number | Minimum price |
| max_price   | number | Maximum price |
| sort        | string | `price_asc`, `price_desc`, `rating_desc`, `newest` |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "title": "Réparation fuite d'eau urgente",
        "description": "...",
        "price": 80.00,
        "price_type": "fixed",
        "location": "Paris",
        "avg_rating": 4.8,
        "requests_count": 12,
        "provider": {
          "id": "uuid",
          "name": "Jean Dupont",
          "avatar_url": null,
          "is_validated": true
        },
        "category": { "id": "uuid", "name": "Plomberie", "icon": "wrench" }
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 45, "total_pages": 4 }
  }
}
```

---

### GET /services/search

Full-text search across services.

**Auth required:** No

**Query Parameters:**
| Param    | Type   | Description |
|----------|--------|-------------|
| q        | string | Search query (required) |
| location | string | Location filter |
| radius   | number | Radius in km (default: 50) |
| page     | number | Page |
| limit    | number | Items per page |

**Response 200:** Same format as `GET /services`.

---

### GET /services/my-services

List services published by the authenticated prestataire.

**Auth required:** Yes  
**Role required:** `prestataire`

**Response 200:** Same format as `GET /services`.

---

### GET /services/:id

Get a single service with full details.

**Auth required:** No

**Response 200:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "price": 80.00,
      "price_type": "fixed",
      "tags": ["fuite", "urgence"],
      "views_count": 120,
      "avg_rating": 4.8,
      "provider": { ... },
      "category": { ... },
      "recent_reviews": [ ... ]
    }
  }
}
```

---

### POST /services

Create a new service.

**Auth required:** Yes  
**Role required:** `prestataire`

**Request Body:**
```json
{
  "title":       "string (required, max 255)",
  "description": "string (required)",
  "price":       "number (required, >= 0)",
  "price_type":  "string (optional): 'fixed' | 'hourly' | 'quote'",
  "category_id": "uuid (optional)",
  "location":    "string (optional)",
  "latitude":    "number (optional)",
  "longitude":   "number (optional)",
  "tags":        ["array of strings (optional)"]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "service": { ... } },
  "message": "Service created"
}
```

---

### PUT /services/:id

Update an existing service.

**Auth required:** Yes  
**Role required:** `prestataire` (own service)

**Request Body:** Same fields as POST (all optional).

**Response 200:**
```json
{
  "success": true,
  "data": { "service": { ... } },
  "message": "Service updated"
}
```

---

### DELETE /services/:id

Delete a service.

**Auth required:** Yes  
**Role required:** `prestataire` (own service) or `admin`

**Response 200:**
```json
{
  "success": true,
  "message": "Service deleted"
}
```

---

## 4. Requests

### POST /requests

Create a service request.

**Auth required:** Yes  
**Role required:** `client`

**Request Body:**
```json
{
  "service_id":     "uuid (required)",
  "title":          "string (required)",
  "description":    "string (optional)",
  "budget":         "number (optional)",
  "scheduled_date": "ISO 8601 datetime (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "uuid",
      "status": "pending",
      "title": "Fuite sous l'évier",
      "client_id": "uuid",
      "provider_id": "uuid",
      "created_at": "2024-06-01T09:00:00Z"
    }
  },
  "message": "Request created"
}
```

---

### GET /requests

List requests for the authenticated user.

**Auth required:** Yes

**Query Parameters:**
| Param  | Type   | Description |
|--------|--------|-------------|
| status | string | Filter by status |
| page   | number | Page |
| limit  | number | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "requests": [ { ... } ],
    "pagination": { ... }
  }
}
```

---

### GET /requests/:id

Get a single request's details.

**Auth required:** Yes (must be client, provider, or admin)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "uuid",
      "status": "accepted",
      "title": "...",
      "agreed_price": 80.00,
      "scheduled_date": "2024-06-10T14:00:00Z",
      "client": { "id": "uuid", "name": "Sophie Leroy" },
      "provider": { "id": "uuid", "name": "Jean Dupont" },
      "service": { "id": "uuid", "title": "..." },
      "transaction": { ... }
    }
  }
}
```

---

### PUT /requests/:id/status

Update the status of a request.

**Auth required:** Yes

**Request Body:**
```json
{
  "status":        "string (required): 'accepted' | 'rejected' | 'in_progress' | 'cancelled' | 'disputed'",
  "agreed_price":  "number (optional, required when accepting)",
  "cancel_reason": "string (optional, required when cancelling)",
  "notes":         "string (optional)"
}
```

**Role / Status Transitions:**
| Actor       | Allowed Transitions |
|-------------|---------------------|
| Provider    | `pending → accepted`, `pending → rejected`, `accepted → in_progress` |
| Client      | `pending → cancelled`, `accepted → cancelled`, `in_progress → disputed` |
| Admin       | Any transition |

**Response 200:**
```json
{
  "success": true,
  "data": { "request": { ... } },
  "message": "Request status updated"
}
```

---

### PUT /requests/:id/complete

Mark a request as completed.

**Auth required:** Yes  
**Role required:** `client` (confirms completion) or `admin`

**Response 200:**
```json
{
  "success": true,
  "data": { "request": { "status": "completed", "completed_at": "..." } },
  "message": "Request marked as completed"
}
```

---

## 5. Payments

### POST /payments/create-intent

Create a Stripe PaymentIntent for a request.

**Auth required:** Yes  
**Role required:** `client`

**Request Body:**
```json
{
  "request_id": "uuid (required)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "client_secret": "pi_xxx_secret_yyy",
    "payment_intent_id": "pi_xxx",
    "amount": 8000,
    "currency": "eur"
  }
}
```

---

### POST /payments/confirm

Confirm and capture a payment after client-side Stripe confirmation.

**Auth required:** Yes  
**Role required:** `client`

**Request Body:**
```json
{
  "payment_intent_id": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "status": "succeeded",
      "amount": 80.00,
      "provider_amount": 72.00,
      "commission_amount": 8.00
    }
  }
}
```

---

### POST /payments/webhook

Stripe webhook endpoint. **Do not call manually.**

**Auth required:** No (Stripe signature verification)

**Headers:**
- `Stripe-Signature: t=...;v1=...`

**Response 200:** `{ "received": true }`

---

### GET /payments/transactions

List transactions for the authenticated user.

**Auth required:** Yes

**Query Parameters:**
| Param  | Type   | Description |
|--------|--------|-------------|
| status | string | Filter by status |
| page   | number | Page |
| limit  | number | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [ { ... } ],
    "pagination": { ... }
  }
}
```

---

### GET /payments/earnings

Get earnings summary for the authenticated prestataire.

**Auth required:** Yes  
**Role required:** `prestataire`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_earnings": 1250.00,
    "pending_earnings": 135.00,
    "monthly_earnings": [
      { "month": "2024-06", "amount": 360.00 }
    ],
    "recent_transactions": [ { ... } ]
  }
}
```

---

### POST /payments/refund/:id

Initiate a refund on a transaction.

**Auth required:** Yes  
**Role required:** `admin`

**URL Parameters:**
- `id` — Transaction ID

**Request Body:**
```json
{
  "amount":        "number (optional, partial refund)",
  "refund_reason": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "status": "refunded",
      "refund_amount": 80.00,
      "refund_reason": "Service not rendered"
    }
  }
}
```

---

## 6. Reviews

### GET /reviews/provider/:id

Get all reviews for a specific provider.

**Auth required:** No

**URL Parameters:**
- `id` — Provider user ID

**Query Parameters:**
| Param | Type   | Description |
|-------|--------|-------------|
| page  | number | Page |
| limit | number | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Excellent travail !",
        "reviewer": { "id": "uuid", "name": "Sophie L.", "avatar_url": null },
        "created_at": "2024-06-01T12:00:00Z"
      }
    ],
    "stats": {
      "avg_rating": 4.8,
      "total_reviews": 25,
      "distribution": { "5": 18, "4": 5, "3": 1, "2": 1, "1": 0 }
    },
    "pagination": { ... }
  }
}
```

---

### POST /reviews

Submit a review for a completed request.

**Auth required:** Yes  
**Role required:** `client`

**Request Body:**
```json
{
  "request_id": "uuid (required)",
  "rating":     "integer (required, 1–5)",
  "comment":    "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "review": { ... } },
  "message": "Review submitted"
}
```

**Error Codes:**
- `400` — Request not completed or review already exists
- `403` — Not the client of this request

---

### GET /reviews/my-reviews

Get reviews written by or about the authenticated user.

**Auth required:** Yes

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [ { ... } ],
    "pagination": { ... }
  }
}
```

---

### DELETE /reviews/:id

Delete a review.

**Auth required:** Yes  
**Role required:** `admin`

**Response 200:**
```json
{
  "success": true,
  "message": "Review deleted"
}
```

---

## 7. Categories

### GET /categories

List all active categories.

**Auth required:** No

**Response 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Plomberie",
        "description": "Installation, réparation...",
        "icon": "wrench",
        "is_active": true
      }
    ]
  }
}
```

---

### GET /categories/:id

Get a category by ID.

**Auth required:** No

**Response 200:**
```json
{
  "success": true,
  "data": { "category": { ... } }
}
```

---

### POST /categories

Create a new category.

**Auth required:** Yes  
**Role required:** `admin`

**Request Body:**
```json
{
  "name":        "string (required, unique)",
  "description": "string (optional)",
  "icon":        "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "category": { ... } },
  "message": "Category created"
}
```

---

### PUT /categories/:id

Update a category.

**Auth required:** Yes  
**Role required:** `admin`

**Request Body:** Same fields as POST (all optional).

**Response 200:**
```json
{
  "success": true,
  "data": { "category": { ... } },
  "message": "Category updated"
}
```

---

### DELETE /categories/:id

Delete (deactivate) a category.

**Auth required:** Yes  
**Role required:** `admin`

**Response 200:**
```json
{
  "success": true,
  "message": "Category deleted"
}
```

---

## 8. Notifications

### GET /notifications

Get notifications for the authenticated user.

**Auth required:** Yes

**Query Parameters:**
| Param   | Type    | Description |
|---------|---------|-------------|
| page    | number  | Page |
| limit   | number  | Items per page |
| is_read | boolean | Filter by read status |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "request_accepted",
        "title": "Demande acceptée",
        "message": "Jean Dupont a accepté votre demande.",
        "data": { "request_id": "uuid" },
        "is_read": false,
        "created_at": "2024-06-05T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### PUT /notifications/:id/read

Mark a specific notification as read.

**Auth required:** Yes

**Response 200:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT /notifications/read-all

Mark all notifications as read.

**Auth required:** Yes

**Response 200:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### GET /notifications/unread-count

Get the count of unread notifications.

**Auth required:** Yes

**Response 200:**
```json
{
  "success": true,
  "data": { "count": 7 }
}
```

---

## 9. Admin

### GET /admin/dashboard

Get global platform statistics.

**Auth required:** Yes  
**Role required:** `admin`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_users": 320,
      "total_providers": 85,
      "total_clients": 232,
      "total_services": 210,
      "total_requests": 1540,
      "completed_requests": 1102,
      "total_revenue": 88200.00,
      "total_commission": 8820.00,
      "pending_fraud_reviews": 3,
      "pending_provider_validations": 5
    },
    "monthly_revenue": [
      { "month": "2024-06", "revenue": 12400.00, "commission": 1240.00 }
    ]
  }
}
```

---

### GET /admin/users

List all users with admin details.

**Auth required:** Yes  
**Role required:** `admin`

**Query Parameters:** Same as `GET /users`.

**Response 200:** Same format as `GET /users` with additional admin fields (is_banned, stripe_customer_id, etc.).

---

### PUT /admin/users/:id/validate

Validate a prestataire's profile.

**Auth required:** Yes  
**Role required:** `admin`

**Response 200:**
```json
{
  "success": true,
  "message": "Provider validated"
}
```

---

### PUT /admin/users/:id/ban

Ban or unban a user.

**Auth required:** Yes  
**Role required:** `admin`

**Request Body:**
```json
{
  "is_banned": "boolean (required)",
  "reason":    "string (optional)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "User banned" 
}
```

---

### GET /admin/transactions

List all platform transactions.

**Auth required:** Yes  
**Role required:** `admin`

**Query Parameters:**
| Param  | Type   | Description |
|--------|--------|-------------|
| status | string | Filter by status |
| from   | date   | Start date (ISO 8601) |
| to     | date   | End date (ISO 8601) |
| page   | number | Page |
| limit  | number | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [ { ... } ],
    "summary": {
      "total_amount": 88200.00,
      "total_commission": 8820.00
    },
    "pagination": { ... }
  }
}
```

---

### GET /admin/fraud-logs

List fraud detection logs.

**Auth required:** Yes  
**Role required:** `admin`

**Query Parameters:**
| Param       | Type    | Description |
|-------------|---------|-------------|
| is_reviewed | boolean | Filter by review status |
| min_risk    | number  | Minimum risk score |
| page        | number  | Page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "fraud_logs": [
      {
        "id": "uuid",
        "user": { "id": "uuid", "name": "...", "email": "..." },
        "type": "multiple_failed_payments",
        "risk_score": 8.5,
        "details": { "attempts": 5, "ip": "...", "window": "1h" },
        "is_reviewed": false,
        "created_at": "2024-06-01T08:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 10. AI

### GET /ai/recommendations

Get personalized service recommendations for the authenticated client.

**Auth required:** Yes  
**Role required:** `client`

**Query Parameters:**
| Param | Type   | Description |
|-------|--------|-------------|
| limit | number | Number of recommendations (default: 5) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "service": { "id": "uuid", "title": "...", "price": 80 },
        "score": 0.92,
        "reason": "Based on your previous requests for plomberie services"
      }
    ]
  }
}
```

---

### GET /ai/matching/:serviceId

Find the best client matches for a given service (provider perspective).

**Auth required:** Yes  
**Role required:** `prestataire`

**URL Parameters:**
- `serviceId` — Service ID to match against

**Response 200:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "client": { "id": "uuid", "name": "Sophie Leroy" },
        "compatibility_score": 0.87,
        "common_interests": ["plomberie", "Paris"],
        "recommended_price": 85.00
      }
    ]
  }
}
```

---

### POST /ai/chat

Send a message to the AI assistant.

**Auth required:** Yes

**Request Body:**
```json
{
  "message":  "string (required, max 2000 chars)",
  "history":  [
    { "role": "user",      "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reply": "Bonjour ! Je peux vous aider à trouver un plombier disponible à Paris...",
    "suggestions": ["Voir les plombiers", "Créer une demande"]
  }
}
```

---

### GET /ai/fraud-report

Generate an AI-powered fraud analysis report.

**Auth required:** Yes  
**Role required:** `admin`

**Query Parameters:**
| Param | Type   | Description |
|-------|--------|-------------|
| days  | number | Analysis window in days (default: 30) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "report": {
      "period": "2024-05-01 to 2024-06-01",
      "high_risk_users": 3,
      "total_flagged_transactions": 12,
      "estimated_fraud_amount": 960.00,
      "patterns_detected": [
        "Multiple payment failures from same IP",
        "Abnormal refund request rate"
      ],
      "recommendations": [
        "Enforce stricter verification for accounts created less than 7 days ago",
        "Add CAPTCHA on payment pages"
      ],
      "ai_summary": "Analysis shows a 12% increase in suspicious payment activity..."
    }
  }
}
```
