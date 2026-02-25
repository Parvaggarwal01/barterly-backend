# Skills API Documentation

## Base URL
`http://localhost:3000/api`

---

## Skills Endpoints

### Public Endpoints

#### Get All Skills
```http
GET /api/skills
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `sortBy` (string, default: 'createdAt') - Sort field
- `sortOrder` (string, default: 'desc') - Sort order (asc/desc)
- `category` (ObjectId) - Filter by category ID
- `level` (string) - Filter by level (beginner/intermediate/advanced)
- `deliveryMode` (string) - Filter by delivery mode (online/in-person/both)
- `search` (string) - Search in title, description, and tags

**Response:**
```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": {
    "skills": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Get Skill by ID
```http
GET /api/skills/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Skill retrieved successfully",
  "data": {
    "_id": "...",
    "title": "Web Development",
    "description": "...",
    "category": {...},
    "offeredBy": {...},
    "level": "intermediate",
    "deliveryMode": "online",
    "verificationStatus": "approved",
    "viewCount": 42,
    "savedCount": 5
  }
}
```

---

#### Get User Skills
```http
GET /api/skills/user/:userId
```

**Response:**
```json
{
  "success": true,
  "message": "User skills retrieved successfully",
  "data": {
    "skills": [...]
  }
}
```

---

### Protected Endpoints (Require Authentication)

#### Create Skill
```http
POST /api/skills
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "title": "Web Development",
  "description": "Full-stack web development using MERN stack",
  "category": "507f1f77bcf86cd799439011",
  "tags": ["javascript", "react", "nodejs", "mongodb"],
  "level": "intermediate",
  "deliveryMode": "online",
  "availability": "Weekends, 2 hours/session"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill created successfully",
  "data": {...}
}
```

---

#### Get My Skills
```http
GET /api/skills/my/list
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Your skills retrieved successfully",
  "data": [...]
}
```

---

#### Update Skill
```http
PUT /api/skills/:id
Authorization: Bearer {access_token}
```

**Body:** (any fields to update)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "level": "advanced"
}
```

**Note:** Updating certain fields will reset verification status to pending.

**Response:**
```json
{
  "success": true,
  "message": "Skill updated successfully",
  "data": {...}
}
```

---

#### Delete Skill
```http
DELETE /api/skills/:id
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill deleted successfully"
}
```

---

### Admin Endpoints (Require Admin Role)

#### Get All Skills (Admin)
```http
GET /api/skills/admin/all
Authorization: Bearer {admin_access_token}
```

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` (same as public endpoint)
- `verificationStatus` (string) - Filter by status (pending/approved/rejected)
- `isActive` (boolean) - Filter by active status
- `category` (ObjectId) - Filter by category
- `search` (string) - Search skills

**Response:**
```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": {
    "skills": [...],
    "pagination": {...}
  }
}
```

---

#### Update Skill Verification
```http
PATCH /api/skills/:id/verify
Authorization: Bearer {admin_access_token}
```

**Body:**
```json
{
  "status": "approved",
  "note": "Skill verified successfully"
}
```

**Allowed status values:** `approved`, `rejected`

**Response:**
```json
{
  "success": true,
  "message": "Skill verification status updated successfully",
  "data": {...}
}
```

---

#### Get Skill Statistics
```http
GET /api/skills/admin/stats
Authorization: Bearer {admin_access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill statistics retrieved successfully",
  "data": {
    "total": 145,
    "pending": 12,
    "approved": 128,
    "rejected": 5,
    "byCategory": [
      { "_id": "...", "name": "Technology", "count": 45 },
      { "_id": "...", "name": "Design", "count": 32 }
    ]
  }
}
```

---

## Categories Endpoints

### Public Endpoints

#### Get All Categories
```http
GET /api/categories
```

**Query Parameters:**
- `isActive` (boolean) - Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Technology",
      "slug": "technology",
      "description": "...",
      "icon": "computer",
      "skillCount": 45,
      "isActive": true
    }
  ]
}
```

---

#### Get Category by ID
```http
GET /api/categories/:id
```

---

#### Get Category by Slug
```http
GET /api/categories/slug/:slug
```

---

### Admin Endpoints (Require Admin Role)

#### Create Category
```http
POST /api/categories
Authorization: Bearer {admin_access_token}
```

**Body:**
```json
{
  "name": "Technology",
  "slug": "technology",
  "description": "Programming and tech skills",
  "icon": "computer"
}
```

---

#### Update Category
```http
PUT /api/categories/:id
Authorization: Bearer {admin_access_token}
```

---

#### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer {admin_access_token}
```

**Note:** Cannot delete categories with existing skills.

---

#### Toggle Category Status
```http
PATCH /api/categories/:id/toggle-status
Authorization: Bearer {admin_access_token}
```

---

#### Get Category Statistics
```http
GET /api/categories/admin/stats
Authorization: Bearer {admin_access_token}
```

---

## Skill Levels
- `beginner` - Entry level
- `intermediate` - Mid-level expertise
- `advanced` - Expert level

## Delivery Modes
- `online` - Remote/virtual
- `in-person` - Physical location
- `both` - Flexible

## Verification Statuses
- `pending` - Awaiting admin review
- `approved` - Verified by admin
- `rejected` - Rejected by admin

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (in development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
