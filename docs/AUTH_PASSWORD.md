Bilkul bhai. Neeche **EGKMS Authentication – Forgot Password & Change Password Update** ki ready-to-copy `.md` documentation hai. Isko tum direct apni MD file me copy kar sakte ho.

````markdown
# EGKMS Authentication – Password Management Update

## 1. Document Title

**EGKMS Authentication – Forgot Password & Change Password**

### Module

Authentication Module

### Technology

Node.js + Express.js + MongoDB + Mongoose + JWT + Bcrypt

---

# 2. Purpose

Authentication module me password management functionality add ki gayi hai.

Is update me do password-related flows implement kiye gaye hain:

1. **Forgot Password**
2. **Change Password**

Dono ka use case different hai.

### Forgot Password

Jab user ko apna old password yaad nahi hai, tab registered email par OTP bhejkar password reset kiya ja sakta hai.

### Change Password

Jab user already logged in hai aur usko old password pata hai, tab old password verify karke new password set kiya ja sakta hai.

---

# 3. Password Management APIs

Password management ke liye following APIs add ki gayi hain:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/forgot-password` | Registered email par password reset OTP bhejna |
| POST | `/api/v1/auth/verify-forgot-password-otp` | OTP verify karke new password set karna |
| POST | `/api/v1/auth/change-password` | Logged-in user ka password change karna |

---

# 4. Forgot Password Flow

Forgot Password ka use tab hota hai jab user ko old password pata nahi hota.

### Complete Flow

```text
User selects Forgot Password
        ↓
Registered Email
        ↓
POST /forgot-password
        ↓
Backend User Check
        ↓
Generate OTP
        ↓
Hash OTP
        ↓
Store OTP
        ↓
Send OTP to Email
        ↓
User enters OTP + New Password
        ↓
POST /verify-forgot-password-otp
        ↓
Verify OTP
        ↓
Hash New Password
        ↓
Update User Password
        ↓
Invalidate Existing Refresh Token
        ↓
Delete Used OTP
        ↓
Password Reset Successful
````

---

# 5. Forgot Password – Send OTP API

## Endpoint

```http
POST /api/v1/auth/forgot-password
```

## Request Body

```json
{
  "email": "registered-user@example.com"
}
```

## Backend Processing

Backend following checks/processes perform karta hai:

1. Email normalize hota hai.
2. User database me search hota hai.
3. User existence check hota hai.
4. Account status check hota hai.
5. New OTP generate hota hai.
6. OTP ko bcrypt se hash kiya jata hai.
7. Previous password-reset OTP delete kiya jata hai.
8. New OTP database me save hota hai.
9. OTP email user ke registered email address par send hota hai.

## Successful Response

```json
{
  "success": true,
  "message": "Password reset OTP sent successfully."
}
```

---

# 6. Password Reset OTP

Password reset ke liye existing OTP model ko reuse kiya gaya hai.

OTP ko plain text me database me store nahi kiya jata.

Generated OTP:

```text
123456
```

Database me:

```text
otpHash
```

ke form me store hota hai.

### OTP Configuration

```text
OTP Length: 6 digits
OTP Validity: 5 minutes
Maximum Attempts: 5
```

---

# 7. OTP Purpose

Same OTP model ko registration aur password reset dono ke liye use kiya gaya hai.

Isliye OTP model me `purpose` field add ki gayi hai.

Possible values:

```text
EMAIL_VERIFICATION
PASSWORD_RESET
```

### Registration OTP

```text
purpose: EMAIL_VERIFICATION
```

### Forgot Password OTP

```text
purpose: PASSWORD_RESET
```

Isse backend clearly identify kar sakta hai ki OTP kis operation ke liye generate hua hai.

---

# 8. OTP Model Update

OTP model me following field add ki gayi:

```javascript
purpose: {
  type: String,
  enum: [
    "EMAIL_VERIFICATION",
    "PASSWORD_RESET",
  ],
  required: true,
}
```

Existing OTP fields:

```text
email
purpose
otpHash
expiresAt
attempts
verified
createdAt
updatedAt
```

---

# 9. Verify Forgot Password OTP API

## Endpoint

```http
POST /api/v1/auth/verify-forgot-password-otp
```

## Request Body

```json
{
  "email": "registered-user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

## Backend Processing

Backend following steps perform karta hai:

1. Email normalize hota hai.
2. `PASSWORD_RESET` purpose wala OTP find hota hai.
3. OTP expiry check hoti hai.
4. Maximum attempt check hota hai.
5. OTP ko bcrypt ke through compare kiya jata hai.
6. Invalid OTP hone par attempts increase hote hain.
7. Valid OTP hone par new password hash hota hai.
8. User password update hota hai.
9. Existing refresh token invalidate hota hai.
10. OTP verified hota hai.
11. Used OTP database se delete kar diya jata hai.

## Successful Response

```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

---

# 10. Invalid OTP Handling

Invalid OTP hone par password reset nahi hota.

Example response:

```json
{
  "success": false,
  "message": "Invalid OTP."
}
```

Har invalid attempt par:

```text
attempts += 1
```

Maximum 5 attempts allowed hain.

5 invalid attempts ke baad OTP delete kar diya jata hai aur user ko new OTP request karna hota hai.

---

# 11. OTP Expiry

Password reset OTP ki validity:

```text
5 minutes
```

Expiry ke baad OTP invalid ho jata hai.

Expired OTP database se remove kiya jata hai.

Expected behavior:

```text
OTP expired
      ↓
Password reset denied
      ↓
User requests new OTP
```

---

# 12. Password Hashing

User passwords ko plain text me database me store nahi kiya jata.

Password ko bcrypt ke through hash kiya jata hai.

Example:

```javascript
const hashedPassword = await bcrypt.hash(
  newPassword,
  10
);
```

Database me hashed password store hota hai.

---

# 13. Refresh Token Invalidation After Password Reset

Password reset successful hone ke baad existing refresh token invalidate kiya jata hai.

```javascript
user.refreshTokenHash = null;
```

Iska purpose hai ki password reset ke baad previous authenticated refresh session automatically invalidate ho jaye.

Ye additional security layer provide karta hai.

---

# 14. Change Password

Change Password ka use logged-in user ke liye hai.

Is flow me user ko apna old password pata hona required hai.

### Flow

```text
Logged-in User
      ↓
JWT Authentication
      ↓
Old Password
      ↓
Verify Old Password
      ↓
New Password
      ↓
Hash New Password
      ↓
Update Password
      ↓
Invalidate Refresh Token
      ↓
Password Changed
```

---

# 15. Change Password API

## Endpoint

```http
POST /api/v1/auth/change-password
```

## Authentication

JWT authentication required hai.

Existing HttpOnly authentication cookie use hoti hai.

Frontend ko access token manually request body me bhejne ki requirement nahi hai.

## Request Body

```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

---

# 16. Change Password Backend Processing

Backend following checks perform karta hai:

1. JWT authentication check hota hai.
2. Authenticated user identify hota hai.
3. User database se retrieve hota hai.
4. Account status check hota hai.
5. Old password ko bcrypt ke through verify kiya jata hai.
6. Old password incorrect hone par request reject hoti hai.
7. New password old password ke same hai ya nahi check hota hai.
8. New password bcrypt se hash hota hai.
9. User password update hota hai.
10. Existing refresh token invalidate hota hai.

---

# 17. Wrong Old Password

Agar user wrong old password provide karta hai, password change nahi hota.

Example:

```json
{
  "oldPassword": "WrongPassword@123",
  "newPassword": "NewPassword@123"
}
```

Expected response:

```text
Old password is incorrect.
```

---

# 18. Same Password Protection

Agar user old password aur new password same rakhta hai, request reject ki jati hai.

Example:

```json
{
  "oldPassword": "Password@123",
  "newPassword": "Password@123"
}
```

Expected behavior:

```text
New password must be different from old password.
```

---

# 19. Email Template

Forgot Password OTP ke liye new email template add kiya gaya hai:

```text
passwordResetTemplate()
```

Existing `emailVerificationTemplate()` ka same EGKMS email design maintain kiya gaya hai.

### Email Design

The template contains:

* EGKMS branding
* Enterprise Knowledge Management System title
* Password reset message
* 6-digit OTP
* OTP validity information
* Security warning
* EGKMS footer
* Syandrix branding

---

# 20. Email Template Difference

Registration:

```text
emailVerificationTemplate(otp)
```

Purpose:

```text
Verify email address
```

Forgot Password:

```text
passwordResetTemplate(otp)
```

Purpose:

```text
Reset account password
```

Design same rakha gaya hai, sirf email content/password reset related messaging different hai.

---

# 21. Security Considerations

Password management implementation me following security measures use kiye gaye hain:

### Password Hashing

Passwords bcrypt ke through hash hote hain.

### OTP Hashing

OTP bhi database me hashed form me store hota hai.

### OTP Expiry

OTP sirf 5 minutes ke liye valid hai.

### OTP Attempt Limit

Maximum 5 invalid OTP attempts allowed hain.

### OTP Purpose

Registration aur password reset OTP ko `purpose` field se separate identify kiya jata hai.

### Refresh Token Invalidation

Password change/reset ke baad existing refresh token invalidate kiya jata hai.

### Authentication

Change Password API JWT authentication protected hai.

---

# 22. Difference Between Forgot Password and Change Password

| Feature        | Forgot Password    | Change Password                            |
| -------------- | ------------------ | ------------------------------------------ |
| User Logged In | Not required       | Required                                   |
| Old Password   | Not required       | Required                                   |
| OTP            | Required           | Not required                               |
| Email          | Registered email   | Not required                               |
| JWT            | Not required       | Required                                   |
| New Password   | Required           | Required                                   |
| Use Case       | Password forgotten | Password known and user wants to change it |

### Simple Rule

```text
Old password forgotten
        ↓
Forgot Password
        ↓
OTP
        ↓
New Password
```

```text
Old password known
        ↓
Change Password
        ↓
Old Password + New Password
```

---

# 23. Testing Completed

Password management APIs were tested using Postman.

## Forgot Password

```text
POST /forgot-password
```

Status:

```text
PASSED
```

OTP email successfully received.

---

## Verify Forgot Password OTP

```text
POST /verify-forgot-password-otp
```

Status:

```text
PASSED
```

Correct OTP successfully reset the password.

---

## Invalid OTP

Invalid OTP was tested.

Expected behavior:

```text
Invalid OTP
```

Status:

```text
PASSED
```

---

## Change Password

```text
POST /change-password
```

Status:

```text
PASSED
```

Password was successfully changed using the old password.

---

# 24. Final Authentication Password Architecture

```text
                    AUTHENTICATION
                          |
            +-------------+-------------+
            |                           |
      Forgot Password             Change Password
            |                           |
       Registered Email            JWT Authentication
            |                           |
        Generate OTP                Old Password
            |                           |
        Send Email                  Verify Password
            |                           |
        Verify OTP                  New Password
            |                           |
        New Password                Hash Password
            |                           |
      Update Password              Update Password
            |                           |
   Invalidate Refresh Token   Invalidate Refresh Token
            |                           |
          SUCCESS                     SUCCESS
```

---

# 25. Final Summary

The EGKMS Authentication Module now supports secure password management through two separate flows:

### Forgot Password

Users who do not remember their password can receive an OTP on their registered email and set a new password after successful OTP verification.

### Change Password

Authenticated users can change their password by providing their existing password and a new password.

Both flows use secure password hashing, and password reset/change operations invalidate the existing refresh token to improve account security.

The implementation was tested successfully using Postman.

**Password Management Status: COMPLETED**

```
```
