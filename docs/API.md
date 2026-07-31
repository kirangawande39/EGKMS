# DMS Backend API Documentation

# Project

Document Management System (DMS)

## Current Status

Authentication Module Completed.

Employee Management Module Base Completed.

---

# Base URL

Development

```
http://localhost:5000/api/v1
```

---

# Backend Architecture

Application follows modular architecture:

```
Request
   |
   ↓
Route
   |
   ↓
Validator
   |
   ↓
Controller
   |
   ↓
Service
   |
   ↓
Model
   |
   ↓
Database
```

---

# Authentication Stack

Application uses:

* Passport.js (Local Strategy)
* JWT Authentication
* HttpOnly Cookies
* Email OTP Verification
* bcrypt Password Hashing
* express-rate-limit

---

# Authentication Flow

## Company DMS Registration Flow

System supports company controlled registration.

```
Admin creates Employee
        |
        ↓
Employee email stored in Employee Collection
        |
        ↓
Employee enters email
        |
        ↓
System checks company email
        |
        ↓
Email OTP Verification
        |
        ↓
Create User Account
        |
        ↓
Login
```

---

# Employee Collection vs User Collection

## Employee Collection

Purpose:

Stores company approved employees.

Example:

```json
{
    "name":"Kiran",
    "email":"kiran@company.com",
    "role":"employee",
    "department":"IT",
    "isRegistered":false
}
```

Contains:

* Name
* Email
* Role
* Department
* Registration Status

Does NOT contain:

* Password
* Authentication tokens

---

## User Collection

Purpose:

Stores login accounts.

Example:

```json
{
    "name":"Kiran",
    "email":"kiran@company.com",
    "password":"hashed_password",
    "role":"employee",
    "isEmailVerified":true
}
```

Contains:

* Login credentials
* Password hash
* User role
* Authentication status

---

# Email OTP Verification

## Send Email OTP

### Endpoint

```
POST /auth/send-email-otp
```

### Description

Sends a 6 digit OTP to verify email.

### Request

```json
{
    "email":"kiran@company.com"
}
```

### Flow

```
Request
 ↓
Validate Email
 ↓
Generate OTP
 ↓
Save OTP in Database
 ↓
Send Email
```

---

# Verify Email OTP

### Endpoint

```
POST /auth/verify-email-otp
```

### Request

```json
{
    "email":"kiran@company.com",
    "otp":"123456"
}
```

### Process

```
Find OTP
 ↓
Check OTP
 ↓
Check Expiry
 ↓
Mark Verified
 ↓
Delete OTP
```

---

# Register User

### Endpoint

```
POST /auth/register
```

### Description

Creates user account after email verification.

---

## Register Flow

```
Register Request
        |
        ↓
Check Employee Email
        |
        ↓
Check OTP Verification
        |
        ↓
Check Existing User
        |
        ↓
Hash Password
        |
        ↓
Create User
        |
        ↓
Update Employee isRegistered=true
```

---

## Request Body

```json
{
    "name":"Kiran",
    "email":"kiran@company.com",
    "password":"Password@123"
}
```

Note:

Role is NOT accepted from frontend.

Role comes from Employee Collection.

---

# Login User

## Endpoint

```
POST /auth/login
```

---

## Login Flow

```
Login Request
        |
        ↓
Passport Local Strategy
        |
        ↓
Find User
        |
        ↓
Compare Password
        |
        ↓
Check Email Verification
        |
        ↓
Generate Access Token
        |
        ↓
Generate Refresh Token
        |
        ↓
Store Cookies
```

---

# Token Management

## Access Token

Purpose:

* Authenticate protected APIs
* Role authorization

Payload:

```json
{
    "id":"userId",
    "role":"admin"
}
```

Storage:

```
HttpOnly Cookie
```

Cookie:

```
accessToken
```

Expiry:

```
15 Minutes
```

---

## Refresh Token

Purpose:

* Create new access tokens
* Maintain session

Payload:

```json
{
    "id":"userId"
}
```

Storage:

```
HttpOnly Cookie

+

Hashed Token in Database
```

Cookie:

```
refreshToken
```

Expiry:

```
7 Days
```

---

# Cookie Configuration

```
HttpOnly:true

Secure:true (Production)

SameSite:Strict
```

---

# Employee Management Module

## Purpose

Manage company employees before account creation.

---

# Create Employee

Only Admin can create employees.

Endpoint:

```
POST /employee
```

Flow:

```
Admin Request
        |
        ↓
Authentication Middleware
        |
        ↓
Role Check
        |
        ↓
Validator
        |
        ↓
Create Employee
```

---

Request:

```json
{
    "name":"Rahul",
    "email":"rahul@company.com",
    "role":"manager",
    "department":"IT"
}
```

---

Employee Roles:

```
admin
manager
employee
```

---

# Role Hierarchy

```
Admin

 |
 |-- Create Employee
 |-- Create Manager
 |-- Manage System


Manager

 |
 |-- Manage Team
 |-- Approve Documents


Employee

 |
 |-- Upload Documents
 |-- Access Allowed Documents
```

---

# Rate Limiting

Authentication APIs protected using express-rate-limit.

## Register

```
5 requests / 15 minutes
```

## Login

```
5 requests / 5 minutes
```

## Send OTP

```
3 requests / 5 minutes
```

## Verify OTP

```
10 requests / 10 minutes
```

---

# Error Handling

Global error middleware handles:

* Validation Errors
* Authentication Errors
* Authorization Errors
* Duplicate Data Errors
* Server Errors

Response:

```json
{
    "success":false,
    "errorName":"ErrorName",
    "message":"Error message"
}
```

---

# Project Structure

```
src
│
├── config
│   ├── db.js
│   └── passport.js
│
├── middleware
│   ├── validate.middleware.js
│   ├── error.middleware.js
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── rateLimiter.middleware.js
│
├── modules
│   │
│   ├── auth
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.validator.js
│   │   ├── user.model.js
│   │   └── otp.model.js
│   │
│   └── employee
│       ├── employee.routes.js
│       ├── employee.controller.js
│       ├── employee.service.js
│       ├── employee.validator.js
│       └── employee.model.js
│
├── services
│   └── email
│       ├── email.service.js
│       ├── email.template.js
│       └── index.js
│
├── utils
│   ├── token.js
│   ├── hash.js
│   └── ApiError.js
│
├── app.js
└── server.js
```

---

# Completed Features

## Backend Setup

✅ Express Server Setup
✅ MongoDB Connection
✅ Environment Configuration
✅ Modular Architecture
✅ Global Error Middleware

---

## Authentication

✅ User Model
✅ OTP Model
✅ Joi Validation
✅ Validation Middleware
✅ Passport Local Strategy
✅ Password Hashing
✅ Email OTP Verification
✅ Register API
✅ Login API
✅ JWT Access Token
✅ JWT Refresh Token
✅ HttpOnly Cookie Authentication
✅ Refresh Token Hash Storage
✅ Rate Limiting

---

## Employee Management

✅ Employee Model
✅ Employee Validator
✅ Employee Service
✅ Employee Controller
✅ Employee Routes
✅ Company Email Verification Flow
✅ Role Based Employee Creation Structure

---

# Next Modules

* Refresh Token API
* Logout API
* Role Based Access Control
* User Management
* Document Upload
* Document Permission System
* Audit Logs

---

# Authentication Module Status

```
Authentication Module: Completed

Employee Module: Base Completed
```
