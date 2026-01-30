# 🚀 LinkUp – Social Media Backend API

LinkUp is a **feature-complete social media backend API** inspired by platforms like Instagram.  
It provides authentication, user management, posts, stories, chat, notifications, and real-time features using **Node.js, Express, MongoDB, and Socket.io**.

This repository contains the **backend only** and is designed to be consumed by any frontend (React, Next.js, Mobile apps, etc.).

---

## 📌 Features Overview

### 🔐 Authentication & Security
- User registration & login (JWT-based)
- Password hashing using bcrypt
- Protected routes with auth middleware
- Centralized error handling
- Rate limiting, CORS, Helmet security headers
- Environment-based configuration

---

### 👤 User Management
- Get logged-in user profile
- Public profile by username
- Update profile (bio, avatar, etc.)
- Search users by username
- Follow / Unfollow users
- Followers & Following lists

---

### 📝 Posts
- Create posts (multiple media files)
- Feed from followed users (paginated)
- Like / Unlike posts
- Add & delete comments
- Get posts by user
- Optimized with MongoDB indexes

---

### 📸 Stories & Highlights
- Add stories (with expiration)
- View story feed (self + following)
- Track story viewers
- Create story highlights
- Add stories to highlights
- Fetch user highlights

---

### 💬 Chat & Messaging
- One-to-one conversations
- Send & receive messages
- Realtime messaging with Socket.io
- Message read receipts
- Typing indicators
- Unread message counts
- Unsend (delete for everyone – soft delete)

---

### 🔔 Notifications
- Follow notifications
- Like & comment notifications
- Story view notifications
- Stored in DB + realtime delivery
- Mark notifications as read

---

### ⚡ Realtime (Socket.io)
- JWT-secured socket connections
- Online user tracking
- Realtime notifications
- Realtime messages
- Typing indicators
- Read receipt events

---

### 📘 Developer Experience
- Full Swagger (OpenAPI 3) documentation
- JWT authorization inside Swagger UI
- Multipart/form-data support in Swagger
- Clean modular project structure

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Realtime:** Socket.io
- **File Uploads:** Multer + Cloudinary
- **Documentation:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Security:** Helmet, CORS, express-rate-limit

---

## 📁 Project Structure

backend/
├── src/
│ ├── app.js
│ ├── server.js
│ ├── socket.js
│ ├── config/
│ │ ├── db.js
│ │ └── swagger.js
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middlewares/
│ ├── utils/
│ └── uploads/
├── .env
├── package.json
└── README.md


## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/linkup

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
⚠️ Do not commit .env or production secrets to GitHub.

🚀 Getting Started
1️⃣ Install Dependencies

npm install

2️⃣ Start Development Server

npm run dev

Server should log:

✅ Server running on port 5000
🟢 MongoDB Connected
📘 API Documentation (Swagger)
Once the server is running, open:

http://localhost:5000/api/docs
Swagger Features
Browse all APIs by category

Test endpoints directly

Upload files via Swagger

JWT Authorization supported

🔐 How to Authorize in Swagger
Login/Register to get JWT token

Click Authorize

Paste:

Bearer <YOUR_JWT_TOKEN>
Click Authorize

🔄 API Testing Order (Recommended)
Auth (register / login)

Authorize Swagger

User APIs

Follow / search users

Posts & feed

Stories & highlights

Messages & chat

Notifications

📡 Realtime Events (Socket.io)
Events Emitted
message

message_read

typing_start

typing_stop

notification

message_deleted

Socket Authentication
Socket connections are authenticated using JWT:

io("http://localhost:5000", {
  auth: {
    token: JWT_TOKEN,
  },
});

🧠 Design Decisions
Soft delete for messages (unsend)

No DB writes for typing indicators

REST + realtime fallback for notifications

Indexed queries for performance

Clean separation of concerns

🛡 Production Notes
Swagger should be disabled in production

Use strong JWT secrets

Enable HTTPS

Use managed MongoDB (Atlas)

Restrict Socket.io CORS origins

📌 Status
✅ Backend is feature-complete for MVP


🔜 Next Steps
Frontend (React / Next.js)

Deployment (Render / Railway / AWS)

Refresh token flow

Admin & moderation features

👨‍💻 Author
LinkUp Backend
Built as a full-stack social media backend project.

📄 License
This project is licensed under the MIT License.


---