# Authentication Flow Documentation

# DMS Authentication Architecture

## Overview

The Document Management System (DMS) follows a secure company-controlled authentication flow.

Authentication is implemented using:

* Passport.js Local Strategy
* JWT Access Token
* JWT Refresh Token
* HttpOnly Cookies
* Email OTP Verification
* bcrypt Password Hashing
* Express Rate Limiting

---

# User Registration Flow

In DMS, users cannot directly register without company authorization.

Before creating an account:

1. Employee email must exist in the company employee list.
2. Email verification through OTP is required.
3. User account is created after successful verification.

---

## Complete Registration Flow

```
Admin Creates Employee
        |
        ↓
Employee Email Stored In Database
        |
        ↓
User Requests Registration
        |
        ↓
Check Company Email
        |
        ↓
Send Email OTP
        |
        ↓
Verify OTP
        |
        ↓
Create User Account
        |
        ↓
Assign Role From Employee Record
        |
        ↓
Employee Status Updated
```

---

# Step 1: Send Email OTP

## API

```
POST /api/v1/auth/send-email-otp
```

## Purpose

Send a 6 digit OTP to verify user email.

## Flow

```
Request
↓
Validator
↓
Controller
↓
Service
↓
Generate 6 Digit OTP
↓
Save OTP In Database
↓
Send OTP Using Email Service
```

---

# Step 2: Verify Email OTP

## API

```
POST /api/v1/auth/verify-email-otp
```

## Purpose

Verify user email before account creation.

## Flow

```
Request
↓
Validator
↓
Controller
↓
Service
↓
Find OTP Record
↓
Check OTP
↓
Check OTP Expiry
↓
Mark Email Verified
↓
Delete OTP Record
```

---

# Step 3: Register User

## API

```
POST /api/v1/auth/register
```

## Purpose

Create user account after successful email verification.

## Flow

```
Request
↓
Validator
↓
Controller
↓
Service
↓
Check Employee Email Exists
↓
Check OTP Verification
↓
Check Existing User
↓
Hash Password Using bcrypt
↓
Create User
↓
Assign Role From Employee Record
↓
Update Employee isRegistered=true
↓
Save User In Database
```

---

# Employee Verification During Registration

Before creating user:

System checks employee collection.

Example:

Employee Collection:

```json
{
    "email":"kiran@company.com",
    "role":"employee",
    "department":"IT",
    "isRegistered":false
}
```

If email exists:

```
Allow Registration
```

If email does not exist:

```
Reject Registration
```

---

# Role Management

Role is not accepted from frontend.

Frontend request:

```json
{
    "email":"kiran@company.com",
    "password":"Password@123"
}
```

Backend gets role from Employee Collection.

Example:

```
Employee Collection
        |
        ↓
role:"manager"
        |
        ↓
User Collection
        |
        ↓
role:"manager"
```

This prevents users from creating unauthorized admin accounts.

---

# Login Flow

## API

```
POST /api/v1/auth/login
```

## Authentication Process

```
Login Request
        |
        ↓
Passport Local Strategy
        |
        ↓
Find User By Email
        |
        ↓
Check User Exists
        |
        ↓
Compare Password Using bcrypt
        |
        ↓
Check Email Verification
        |
        ↓
done(null,user)
        |
        ↓
req.user Created
        |
        ↓
Generate Access Token
        |
        ↓
Generate Refresh Token
        |
        ↓
Hash Refresh Token
        |
        ↓
Store Refresh Token Hash
        |
        ↓
Set Tokens In HttpOnly Cookies
```

---

# Token Management

## Access Token

### Purpose

* Authenticate protected APIs.
* Perform role based authorization.

### Payload

```json
{
    "id":"userId",
    "role":"admin"
}
```

### Storage

```
HttpOnly Cookie
```

### Cookie Name

```
accessToken
```

### Expiry

```
15 Minutes
```

---

## Refresh Token

### Purpose

* Generate new access tokens.
* Maintain user session.

### Payload

```json
{
    "id":"userId"
}
```

### Storage

```
HttpOnly Cookie

+

Hashed Token In Database
```

### Cookie Name

```
refreshToken
```

### Expiry

```
7 Days
```

---

# Authentication Components

## Passport.js

Used for:

* Local authentication strategy.
* Validating email and password.
* Creating req.user after successful login.

---

## JWT

Used for:

* Generating access token.
* Generating refresh token.
* Maintaining authenticated sessions.
* Role based authorization.

---

## bcrypt

Used for:

* Password hashing before storing in database.
* Secure password comparison during login.

---

## Express Rate Limiter

Used for:

* Preventing brute force attacks.
* Limiting login attempts.
* Limiting OTP requests.

---

## Email Service

Used for:

* Sending OTP emails.
* Managing email templates.
* Handling email communication.

---

# Current Completed Modules

## Backend Setup

✅ Express Server Setup
✅ MongoDB Connection
✅ Environment Configuration
✅ Modular Architecture
✅ Global Error Middleware

---

## Authentication Module

✅ User Model
✅ OTP Model
✅ Joi Validation
✅ Validation Middleware
✅ Passport Local Strategy
✅ Email OTP Verification
✅ Company Email Verification
✅ Register API
✅ Login API
✅ Password Hashing
✅ JWT Access Token
✅ JWT Refresh Token
✅ HttpOnly Cookie Authentication
✅ Refresh Token Hash Storage
✅ Rate Limiting
✅ Email Service

---

## Employee Module Base

✅ Employee Model
✅ Employee Validator
✅ Employee Service
✅ Employee Controller
✅ Employee Routes
✅ Company Employee Management Flow
✅ Role Assignment System
✅ Employee Registration Tracking

---

# Authentication Status

```
Authentication Module: Completed
```

# Next Modules

* Refresh Token API
* Logout API
* Role Based Access Control
* User Management
* Document Upload
* Document Permission System
* Audit Logs

```
```
