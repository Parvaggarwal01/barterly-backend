# 🔧 Barterly — Backend Requirements
> Use this file as context when prompting GitHub Copilot or Claude agent to build the backend.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh tokens) |
| Password Hashing | bcrypt |
| Validation | Zod |
| File Upload | Multer + Cloudinary |
| Real-time Chat | Socket.io |
| Email | Nodemailer (or Resend) |
| Rate Limiting | express-rate-limit |
| Security | helmet, cors, mongo-sanitize, hpp |
| Testing | Jest + Supertest |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## 🗂️ Strict Folder Structure (MVC)

```
barterly-backend/
│
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB Atlas connection
│   │   ├── cloudinary.js       # Cloudinary config
│   │   └── socket.js           # Socket.io setup
│   │
│   ├── controllers/            # Only calls services, no logic
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── skill.controller.js
│   │   ├── barter.controller.js
│   │   ├── review.controller.js
│   │   ├── chat.controller.js
│   │   ├── report.controller.js
│   │   ├── bookmark.controller.js
│   │   ├── category.controller.js
│   │   └── admin.controller.js
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Skill.model.js
│   │   ├── BarterRequest.model.js
│   │   ├── Review.model.js
│   │   ├── Message.model.js
│   │   ├── Conversation.model.js
│   │   ├── Report.model.js
│   │   ├── Bookmark.model.js
│   │   ├── Category.model.js
│   │   └── Notification.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── skill.routes.js
│   │   ├── barter.routes.js
│   │   ├── review.routes.js
│   │   ├── chat.routes.js
│   │   ├── report.routes.js
│   │   ├── bookmark.routes.js
│   │   ├── category.routes.js
│   │   └── admin.routes.js
│   │
│   ├── services/               # All business logic lives here
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── skill.service.js
│   │   ├── barter.service.js
│   │   ├── review.service.js
│   │   ├── chat.service.js
│   │   ├── report.service.js
│   │   ├── bookmark.service.js
│   │   ├── category.service.js
│   │   ├── notification.service.js
│   │   └── admin.service.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # Verify JWT
│   │   ├── role.middleware.js       # Admin/User role check
│   │   ├── validate.middleware.js   # Zod schema validation
│   │   ├── upload.middleware.js     # Multer setup
│   │   └── errorHandler.middleware.js
│   │
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   ├── email.utils.js
│   │   ├── cloudinary.utils.js
│   │   ├── paginate.utils.js
│   │   └── apiResponse.utils.js
│   │
│   ├── validations/            # Zod schemas
│   │   ├── auth.validation.js
│   │   ├── skill.validation.js
│   │   ├── barter.validation.js
│   │   └── report.validation.js
│   │
│   └── app.js                  # Express app setup, middleware mounting
│
├── server.js                   # HTTP + Socket.io server start
├── .env.example
├── package.json
└── README.md
```

---

## 🗃️ Database Models (Mongoose Schemas)

### User
```js
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (hashed, select: false),
  avatar: { url: String, public_id: String },
  bio: String,
  location: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  skillsOffered: [{ type: ObjectId, ref: 'Skill' }],
  skillsWanted: [String],
  portfolioLinks: [String],
  isVerified: Boolean (email verified),
  isActive: Boolean (not banned),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBarters: { type: Number, default: 0 },
  createdAt: Date
}
```

### Skill
```js
{
  title: String (required),
  description: String (required),
  category: { type: ObjectId, ref: 'Category' },
  tags: [String],
  offeredBy: { type: ObjectId, ref: 'User' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  deliveryMode: { type: String, enum: ['online', 'in-person', 'both'] },
  availability: String,
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },    // Admin verified
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verificationDocuments: [{
    type: { type: String, enum: ['cv', 'certificate', 'portfolio_link', 'other'] },
    url: String,
    public_id: String
  }],
  verificationNote: String,    // Admin rejection reason
  savedCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  createdAt: Date
}
```

### BarterRequest
```js
{
  sender: { type: ObjectId, ref: 'User' },
  receiver: { type: ObjectId, ref: 'User' },
  offeredSkill: { type: ObjectId, ref: 'Skill' },    // Sender's skill
  requestedSkill: { type: ObjectId, ref: 'Skill' },  // Receiver's skill
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  counterOffer: {
    message: String,
    offeredSkill: { type: ObjectId, ref: 'Skill' }
  },
  conversation: { type: ObjectId, ref: 'Conversation' },
  completedAt: Date,
  createdAt: Date
}
```

### Review
```js
{
  reviewer: { type: ObjectId, ref: 'User' },
  reviewee: { type: ObjectId, ref: 'User' },
  barter: { type: ObjectId, ref: 'BarterRequest' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: Date
}
```

### Message
```js
{
  conversation: { type: ObjectId, ref: 'Conversation' },
  sender: { type: ObjectId, ref: 'User' },
  content: String,
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  fileUrl: String,
  readBy: [{ type: ObjectId, ref: 'User' }],
  createdAt: Date
}
```

### Conversation
```js
{
  participants: [{ type: ObjectId, ref: 'User' }],
  barter: { type: ObjectId, ref: 'BarterRequest' },
  lastMessage: { type: ObjectId, ref: 'Message' },
  updatedAt: Date
}
```

### Category
```js
{
  name: String (required, unique),
  slug: String,
  icon: String,       // emoji or icon name
  description: String,
  skillCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}
```

### Report
```js
{
  reporter: { type: ObjectId, ref: 'User' },
  reportedUser: { type: ObjectId, ref: 'User' },
  reportedSkill: { type: ObjectId, ref: 'Skill' },   // optional
  reason: { type: String, enum: ['spam', 'fake_skill', 'harassment', 'scam', 'inappropriate', 'other'] },
  description: String,
  status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
  adminNote: String,
  createdAt: Date
}
```

### Bookmark
```js
{
  user: { type: ObjectId, ref: 'User' },
  skill: { type: ObjectId, ref: 'Skill' },
  createdAt: Date
}
// Compound unique index: { user: 1, skill: 1 }
```

### Notification
```js
{
  recipient: { type: ObjectId, ref: 'User' },
  sender: { type: ObjectId, ref: 'User' },
  type: { type: String, enum: ['barter_request', 'barter_accepted', 'barter_rejected', 'barter_completed', 'new_message', 'review_received', 'skill_verified', 'skill_rejected', 'report_resolved'] },
  message: String,
  link: String,       // frontend route
  isRead: { type: Boolean, default: false },
  createdAt: Date
}
```

---

## 🔐 Authentication & Authorization

### Endpoints
```
POST   /api/auth/register          # Register + send email verification
POST   /api/auth/login             # Login → return accessToken + refreshToken
POST   /api/auth/logout            # Invalidate refresh token
POST   /api/auth/refresh-token     # Get new access token
POST   /api/auth/verify-email/:token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
```

### JWT Strategy
- **Access token**: 15 minutes expiry, stored in memory (frontend)
- **Refresh token**: 7 days expiry, stored in httpOnly cookie
- Generate both on login
- Rotate refresh token on every use
- Blacklist invalidated tokens or use short-lived strategy

### Middleware Usage
```js
// Protect routes
router.use(authMiddleware)            // verify JWT
router.use(roleMiddleware('admin'))   // admin only
```

---

## 📡 API Endpoints

### Users
```
GET    /api/users/:id              # Public profile
PUT    /api/users/profile          # Update own profile (auth)
PUT    /api/users/avatar           # Upload avatar (auth, multer)
GET    /api/users/:id/reviews      # Get user's reviews
GET    /api/users/:id/skills       # Get user's skills
```

### Skills
```
POST   /api/skills                 # Create skill (auth)
GET    /api/skills                 # Browse all with filters + pagination
GET    /api/skills/:id             # Single skill detail
PUT    /api/skills/:id             # Edit own skill (auth)
DELETE /api/skills/:id             # Delete own skill (auth)
POST   /api/skills/:id/verify-request  # Submit docs for verification (auth)
GET    /api/skills/my              # Get my skills (auth)
```

### Search & Filters (on GET /api/skills)
```
Query params:
  ?q=react                    # text search on title, description, tags
  &category=categoryId
  &level=intermediate
  &deliveryMode=online
  &verified=true
  &minRating=4
  &page=1
  &limit=10
  &sortBy=createdAt           # createdAt | averageRating | savedCount
  &order=desc
```
- Use MongoDB text index on Skill (title, description, tags)
- Use aggregation pipeline for rating filter (join with reviews)

### Barter Requests
```
POST   /api/barters                   # Send barter request (auth)
GET    /api/barters/my                # My sent + received requests (auth)
GET    /api/barters/:id               # Single barter detail (auth)
PUT    /api/barters/:id/accept        # Accept request (auth, receiver only)
PUT    /api/barters/:id/reject        # Reject request (auth, receiver only)
PUT    /api/barters/:id/counter       # Counter offer (auth, receiver only)
PUT    /api/barters/:id/cancel        # Cancel request (auth, sender only)
PUT    /api/barters/:id/complete      # Mark as completed (auth, both parties)
```

### Reviews
```
POST   /api/reviews                   # Leave review after completed barter (auth)
GET    /api/reviews/user/:userId      # All reviews for a user
```

### Chat
```
GET    /api/chat/conversations         # My conversations (auth)
GET    /api/chat/conversations/:id     # Single conversation + messages (auth)
POST   /api/chat/conversations/:id/messages   # Send message (auth)
```

### Bookmarks
```
POST   /api/bookmarks/:skillId         # Toggle bookmark (auth)
GET    /api/bookmarks                  # Get my bookmarks (auth)
```

### Reports
```
POST   /api/reports                    # Submit report (auth)
```

### Notifications
```
GET    /api/notifications              # My notifications (auth)
PUT    /api/notifications/read-all    # Mark all read (auth)
PUT    /api/notifications/:id/read    # Mark one read (auth)
```

### Categories
```
GET    /api/categories                 # All categories (public)
POST   /api/categories                 # Create category (admin)
PUT    /api/categories/:id             # Edit category (admin)
DELETE /api/categories/:id             # Delete category (admin)
```

### Admin Routes (all require auth + role: admin)
```
GET    /api/admin/stats                # Dashboard stats
GET    /api/admin/users                # All users with filters + pagination
GET    /api/admin/users/:id            # User detail
PUT    /api/admin/users/:id/ban        # Ban/unban user
DELETE /api/admin/users/:id            # Delete user

GET    /api/admin/skills               # All skills
GET    /api/admin/skills/pending-verification   # Awaiting review
PUT    /api/admin/skills/:id/verify    # Approve verification
PUT    /api/admin/skills/:id/reject    # Reject verification with note
DELETE /api/admin/skills/:id           # Delete skill

GET    /api/admin/reports              # All reports with filters
PUT    /api/admin/reports/:id          # Update report status + add note

GET    /api/admin/barters              # All barter requests
GET    /api/admin/categories           # Manage categories
```

---

## 🔌 Socket.io Events

```js
// Server emits
'new_message'          // { conversationId, message }
'new_notification'     // { notification }
'barter_updated'       // { barterId, status }
'user_online'          // { userId }
'user_offline'         // { userId }

// Client emits
'join_conversation'    // { conversationId }
'leave_conversation'   // { conversationId }
'send_message'         // { conversationId, content }
'typing'               // { conversationId }
'stop_typing'          // { conversationId }
'mark_read'            // { conversationId }
```

Socket.io auth middleware: verify JWT token passed in `auth.token` handshake option.

---

## 🔒 Security Requirements

```js
// All of these MUST be implemented

import helmet from 'helmet'             // HTTP headers security
import cors from 'cors'                 // CORS config with whitelist
import mongoSanitize from 'express-mongo-sanitize'  // NoSQL injection
import hpp from 'hpp'                   // HTTP param pollution
import rateLimit from 'express-rate-limit'

// Rate limits
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })   // Auth routes
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })   // General API

// Apply on routes
app.use('/api/auth', authLimiter)
app.use('/api', apiLimiter)
```

### CORS Whitelist
```js
const allowedOrigins = [
  process.env.FRONTEND_URL,     // e.g. https://barterly.vercel.app
  'http://localhost:5173'
]
```

---

## 📤 File Upload (Cloudinary)

### Multer config
```js
// Use memory storage, not disk
storage = multer.memoryStorage()

// File filter: images only for avatar/docs
// Accept: jpg, jpeg, png, pdf, doc, docx for verification docs

// Size limits:
// avatar: 2MB
// verification documents: 10MB each, max 5 files
```

### Cloudinary folders
```
barterly/avatars/
barterly/skill-verification/
```

---

## ✅ Validation (Zod)

Every request body must be validated. Example schemas:

```js
// Register
z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/)
})

// Create Skill
z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(1000),
  category: z.string().refine(val => isValidObjectId(val)),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  deliveryMode: z.enum(['online', 'in-person', 'both']),
  tags: z.array(z.string()).max(10).optional()
})

// Barter Request
z.object({
  receiverId: z.string().refine(val => isValidObjectId(val)),
  offeredSkillId: z.string().refine(val => isValidObjectId(val)),
  requestedSkillId: z.string().refine(val => isValidObjectId(val)),
  message: z.string().min(10).max(500).optional()
})
```

---

## 📬 Email Templates (Nodemailer / Resend)

Send emails for:
- Email verification on register
- Password reset
- Barter request received
- Barter accepted/rejected
- Skill verification approved/rejected

---

## 📄 Pagination Utility

```js
// utils/paginate.utils.js
export const paginate = async (model, query, options) => {
  const { page = 1, limit = 10 } = options
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query)
  ])
  return {
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  }
}
```

---

## 🌱 Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/barterly

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Nodemailer or Resend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@barterly.com

# Frontend
FRONTEND_URL=http://localhost:5173

# Admin seed (optional)
ADMIN_EMAIL=admin@barterly.com
ADMIN_PASSWORD=Admin@1234
```

---

## 🚀 Deployment (Railway)

1. Push `barterly-backend` to GitHub
2. Create new Railway project → connect repo
3. Add all `.env` variables in Railway dashboard
4. Railway auto-detects Node.js and runs `npm start`
5. Set `server.js` start command: `node server.js`

**MongoDB**: Use MongoDB Atlas (free tier). Do NOT use `0.0.0.0/0` IP whitelist in production — whitelist Railway's IP or use Atlas private networking.

---

## 📝 Git Flow (MANDATORY)

```bash
# Branches
main          # Production only, merge from dev
dev           # Integration branch
feature/auth
feature/skills
feature/barter
feature/chat
feature/admin
feature/search

# Commit message format
feat: add JWT refresh token rotation
fix: resolve skill search pagination bug
refactor: move barter logic to service layer
chore: add Zod validation for skill creation
docs: update API endpoint documentation
```

**Rules:**
- NO commits directly to `main`
- Every feature branch → PR to `dev`
- `dev` → PR to `main` at end
- NO commit messages like: "update", "fix", "done", "final", "asdf"

---

## 🧪 Bonus (Extra Marks)

- [ ] Jest unit tests for all services
- [ ] Supertest integration tests for auth + skill routes
- [ ] Postman collection export with all endpoints
- [ ] Docker + docker-compose for local dev
- [ ] Swagger UI at `/api/docs`
- [ ] Redis caching for categories + skill listings

---

## 📋 README Must Include

- Architecture explanation (MVC diagram)
- Folder structure explanation
- ER diagram (User ↔ Skill ↔ BarterRequest ↔ Review)
- All environment variables list
- Deployment steps
- API documentation link
- Git workflow explanation
