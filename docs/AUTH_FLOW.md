# Authentication Flow

## Register Flow

User sends registration request

POST /api/v1/auth/register

Flow:

Request
↓
Validator
↓
Controller
↓
Service
↓
Password Hash (bcrypt)
↓
User Model
↓
Database


## Login Flow

POST /api/v1/auth/login

Flow:

Request
↓
Passport Local Strategy
↓
Find User
↓
Compare Password
↓
done(null,user) 
↓
req.user created by Passport
↓
Generate JWT Token
↓
Store Token in HttpOnly Cookie


## Authentication Components

Passport.js:
Used for user authentication during login.

JWT:
Used for maintaining authenticated sessions.

bcrypt:
Used for password hashing.


## Current Completed Modules

- Express Setup
- MongoDB Connection
- User Model
- Validation Middleware
- Authentication Structure
- Passport Local Strategy
- JWT Utility