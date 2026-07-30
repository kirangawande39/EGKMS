# DMS Backend API Documentation

## Project

Document Management System (DMS)

Current Status:
Authentication module is under development.

---

# Base URL

Development

```
http://localhost:5000/api/v1
```

---

# Authentication

## Authentication Type

The application uses:

- Passport.js (Local Strategy)
- JWT (JSON Web Token)
- HttpOnly Cookies

---

## Login Flow

1. User sends email and password.
2. Passport Local Strategy verifies the credentials.
3. If credentials are valid:
   - Access Token is generated.
   - Refresh Token is generated.
4. Tokens are stored in HttpOnly Cookies.
5. User is authenticated successfully.

---

## Token Storage

Authentication tokens are stored in browser cookies.

Cookie Names:


```
accessToken
refreshToken
```

Tokens are **NOT** stored in:

- Local Storage
- Session Storage
- Authorization Header

---

## Cookie Configuration

```
HttpOnly : true
Secure    : true (Production)
SameSite  : Strict
```

### Why HttpOnly Cookies?

- More secure than Local Storage.
- JavaScript cannot access the token.
- Helps protect against XSS attacks.

---

## Frontend Configuration

When calling authenticated APIs, frontend must enable cookies.

Example (Axios)

```javascript
axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true
});
```

---

# Response Format

## Success Response

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {}
}
```

## Error Response

```json
{
    "success": false,
    "message": "Error message",
    "errors": []
}
```

---

# Authentication APIs

## Register User

### Endpoint

```
POST /auth/register
```

### Description

Creates a new user account.

### Request Body

```json
{
    "name": "Kiran",
    "email": "kiran@gmail.com",
    "password": "12345678",
    "role": "employee"
}
```

### Success Response

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {}
}
```

---

## Login User

### Endpoint

```
POST /auth/login
```

### Description

Authenticates the user using Passport Local Strategy.

### Request Body

```json
{
    "email": "kiran@gmail.com",
    "password": "12345678"
}
```

### Success Response

```json
{
    "success": true,
    "message": "Login successful",
    "user": {}
}
```

### Cookies Returned

```
accessToken
refreshToken
```

---

# Project Structure (Current)

```
src
│
├── config
│   ├── db.js
│   └── passport.js
│
├── middleware
│   └── validate.middleware.js
│
├── modules
│   ├── auth
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.validator.js
│   │
│   └── user
│       └── user.model.js
│
├── utils
│   └── jwt.js
│
├── app.js
└── server.js
```

---

# Completed Features

- Express Server Setup
- MongoDB Connection
- Environment Configuration
- User Model
- Joi Validation
- Validation Middleware
- Passport Local Strategy
- JWT Utility
- Register API
- Login API