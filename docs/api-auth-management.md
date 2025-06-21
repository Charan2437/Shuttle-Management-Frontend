# Authentication API Design (Spring Boot)

Supports both students and admins (role-based access).

---

## 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "plaintextPassword",
  "name": "John Doe",
  "role": "student" // or "admin"
}
```
**Response (Success):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student"
}
```
**Pseudocode:**
```
if (user with email exists) return 409 Conflict
hash password
insert into users (email, password_hash, name, role, is_active)
return user info (excluding password)
```

---

## 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "plaintextPassword"
}
```
**Response (Success):**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```
**Pseudocode:**
```
find user by email
if not found or !is_active return 401
verify password hash
if invalid return 401
generate JWT token with user id, role, etc.
return token and user info
```

---

## 3. Get Current User
**GET** `/api/auth/me`

**Headers:**
`Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student"
}
```
**Pseudocode:**
```
parse JWT from header
if invalid/expired return 401
find user by id from token
return user info
```

---

## 4. Logout
**POST** `/api/auth/logout`

**Request:**
No body needed.

**Response:**
```json
{ "message": "Logged out" }
```
**Pseudocode:**
```
(client deletes token; optionally, server blacklists token)
return message
```

---

## 5. (Optional) Password Reset Request
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{ "email": "user@example.com" }
```
**Response:**
```json
{ "message": "If the email exists, a reset link will be sent." }
```
**Pseudocode:**
```
if user with email exists, send reset link (with token) via email
return generic message
```

---

## 6. (Optional) Password Reset
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token",
  "newPassword": "newPassword"
}
```
**Response:**
```json
{ "message": "Password updated" }
```
**Pseudocode:**
```
validate reset token
if valid, update user's password_hash
return message
```

---

## Sample Data for Testing

### 1. Register Student
**POST** `/api/auth/register`
```json
{
  "email": "student1@example.com",
  "password": "studentPass123",
  "name": "Student One",
  "role": "student"
}
```

### 2. Register Admin
**POST** `/api/auth/register`
```json
{
  "email": "admin1@example.com",
  "password": "adminPass123",
  "name": "Admin One",
  "role": "admin"
}
```

### 3. Login as Student
**POST** `/api/auth/login`
```json
{
  "email": "student1@example.com",
  "password": "studentPass123"
}
```

### 4. Login as Admin
**POST** `/api/auth/login`
```json
{
  "email": "admin1@example.com",
  "password": "adminPass123"
}
```

### 5. Get Current User (Student)
**GET** `/api/auth/me`
- Header: `Authorization: Bearer <token from login response>`

### 6. Get Current User (Admin)
**GET** `/api/auth/me`
- Header: `Authorization: Bearer <token from login response>`

### 7. Forgot Password (Student)
**POST** `/api/auth/forgot-password`
```json
{
  "email": "student1@example.com"
}
```

### 8. Forgot Password (Admin)
**POST** `/api/auth/forgot-password`
```json
{
  "email": "admin1@example.com"
}
```

### 9. Reset Password (Student/Admin)
**POST** `/api/auth/reset-password`
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}
```

---

**Note:** Use the `role` field in the `users` table to distinguish between students and admins. All APIs work for both roles; restrict access to admin/student pages in the frontend/backend based on the user's role in the JWT.
