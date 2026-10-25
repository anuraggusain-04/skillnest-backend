# SkillNest Backend

SkillNest Backend is the API layer for the SkillNest learning platform. It handles user authentication, course management, category management, and enrollment flows for the full-stack application.

This repository is designed to work with the frontend client at:
https://github.com/anuraggusain-04/skillnest-frontend

## Overview

SkillNest is a course marketplace and learning platform where:

- users can register and log in
- students can browse published courses
- authenticated users can enroll in courses
- admin users can manage courses and categories
- MongoDB stores users, course data, and category metadata

The backend is built with Express.js and Mongoose, and exposes REST API routes for the frontend to consume.

## Verified features

The following backend features are implemented in the current source code and are therefore documented as active:

- user registration with encrypted password storage
- login with JWT token issuance
- auth middleware for validating tokens
- admin-only checks for protected routes
- public course listing for published courses
- fetching a single course by id
- admin course creation, update, and delete endpoints
- user enrollment in a course
- fetching a user's enrolled course list
- category listing, creation, and deletion
- admin user listing with password exclusion

## Tech stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- dotenv for environment configuration
- CORS support

## Project architecture

The backend is organized into a simple modular structure:

- `routes/` contains API endpoints by feature
- `models/` defines MongoDB schemas
- `middleware/` contains shared auth logic
- `server.js` boots the Express application and connects to MongoDB

## Core endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Courses

- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses` (admin only)
- `PUT /api/courses/:id` (admin only)
- `DELETE /api/courses/:id` (admin only)
- `POST /api/courses/:id/enroll` (authenticated users)
- `GET /api/courses/user/enrolled` (authenticated users)

### Users

- `GET /api/users` (admin only)

### Categories

- `GET /api/categories`
- `POST /api/categories` (admin only)
- `DELETE /api/categories/:id` (admin only)

## Data models

### User

Fields include:

- `name`
- `email`
- `password`
- `role` (`user` or `admin`)
- `enrolledCourses`
- timestamps

### Course

Fields include:

- `title`
- `description`
- `category`
- `price`
- `instructor`
- `duration`
- `rating`
- `students`
- `image`
- `status` (`published` or `draft`)
- timestamps

### Category

Fields include:

- `name`
- timestamps

## Prerequisites

Before running the backend locally, make sure you have:

- Node.js installed
- npm installed
- MongoDB running locally or a MongoDB Atlas connection string

## Environment variables

Create a `.env` file in the project root with values similar to:

```bash
MONGO_URI=mongodb://localhost:27017/skillnest
JWT_SECRET=your_super_secret_key
PORT=5000
```

The application uses `process.env.MONGO_URI` and `process.env.JWT_SECRET`, so both values must be present for the server to operate correctly.

## Local setup

1. Clone the repository:

```bash
git clone https://github.com/anuraggusain-04/skillnest-backend.git
cd skillnest-backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

By default, the server listens on:

- http://localhost:5000

## Seed scripts

The project includes helper scripts for seeding categories and creating an admin account.

### Seed categories

```bash
node seedCategories.js
```

### Create admin user

```bash
node createAdmin.js
```

The default admin account created by the script is:

- Email: `admin@skillnest.com`
- Password: `admin123`

## Project structure

```text
skillnest-backend/
├── middleware/
│   └── auth.js
├── models/
│   ├── Category.js
│   ├── Course.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── categories.js
│   ├── courses.js
│   └── users.js
├── .gitignore
├── createAdmin.js
├── package.json
├── package-lock.json
├── seedCategories.js
├── server.js
├── README.md
└── .env
```

## Related frontend repository

- https://github.com/anuraggusain-04/skillnest-frontend

## Notes on implementation

- The backend uses `mongoose.connect(process.env.MONGO_URI)` on startup.
- JWTs are signed using the `JWT_SECRET` environment variable.
- The `auth` middleware reads the Authorization header and validates the token.
- The `adminOnly` middleware denies requests from non-admin users.
- Enrollment logic increments the `students` field on the corresponding course and adds the course reference to the user.

## Troubleshooting

### MongoDB connection errors

Make sure your MongoDB server is running and that the `MONGO_URI` in `.env` is correct.

### Invalid token errors

Check that the token from the frontend is being sent in the `Authorization: Bearer <token>` header format.

### Login/register issues

Verify that `JWT_SECRET` is defined and that the database is reachable. Also confirm the password is being hashed before storage.

### Admin-only routes rejecting requests

Ensure the logged-in user has `role: 'admin'` in the database and that the JWT contains that role.

## Contribution guidance

When contributing to the backend:

- keep route logic clean and focused by feature
- validate authorisation before mutations
- handle database errors consistently with clear messages
- keep the frontend contract in mind when adding or changing route payloads

## Important note about verification

This README was prepared from the actual backend source files and package manifests inspected in the repository. It reflects the current implementation in the codebase and is intended to document the project accurately based on the files present. Runtime validation should still be performed on a local machine with MongoDB and environment variables configured correctly before production use.
