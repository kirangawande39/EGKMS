const authService = require("./auth.service");
const { createAuditLog } = require("../audit/audit.service");

// COOKIE CONFIGURATION


const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge,
});

// Access Token: 15 minutes
const ACCESS_TOKEN_COOKIE_MAX_AGE =
  15 * 60 * 1000;

// Refresh Token: 7 days
const REFRESH_TOKEN_COOKIE_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;



// SEND EMAIL OTP


const sendEmailOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.sendEmailOTP(
      email
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};



// VERIFY EMAIL OTP


const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result =
      await authService.verifyEmailOTP(
        email,
        otp
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};



// REGISTER


const register = async (req, res, next) => {
  try {
    const user =
      await authService.registerUser(
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};



// LOGIN


const login = async (req, res, next) => {
  try {
    const result =
      await authService.loginUser(
        req.user
      );


    await createAuditLog({
      module: "AUTH",
      action: "LOGIN",
      actor: req.user._id,
      actorEmail: req.user.email,
      targetId: req.user._id,
      targetType: "User",
      description: "User logged in successfully.",
      req,
    });


    // STORE ACCESS TOKEN IN HTTPONLY COOKIE


    res.cookie(
      "accessToken",
      result.accessToken,
      getCookieOptions(
        ACCESS_TOKEN_COOKIE_MAX_AGE
      )
    );

    // STORE REFRESH TOKEN IN HTTPONLY COOKIE

    res.cookie(
      "refreshToken",
      result.refreshToken,
      getCookieOptions(
        REFRESH_TOKEN_COOKIE_MAX_AGE
      )
    );


    // RESPONSE
    // Tokens are NOT exposed in JSON.
    // They are stored in HttpOnly cookies.

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH ACCESS TOKEN
const refreshToken = async (req, res, next) => {
  try {
    // Read refresh token from HttpOnly cookie
    const token =
      req.cookies?.refreshToken;

    const result =
      await authService.refreshAccessToken(
        token
      );

    // ROTATE ACCESS TOKEN

    res.cookie(
      "accessToken",
      result.accessToken,
      getCookieOptions(
        ACCESS_TOKEN_COOKIE_MAX_AGE
      )
    );


    // ROTATE REFRESH TOKEN


    res.cookie(
      "refreshToken",
      result.refreshToken,
      getCookieOptions(
        REFRESH_TOKEN_COOKIE_MAX_AGE
      )
    );

    return res.status(200).json({
      success: true,
      message:
        "Access token refreshed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(
      req.user._id
    );

    await createAuditLog({
      module: "AUTH",
      action: "LOGOUT",
      actor: req.user._id,
      actorEmail: req.user.email,
      targetId: req.user._id,
      targetType: "User",
      description: "User logged out successfully.",
      req,
    });

    // CLEAR ACCESS TOKEN COOKIE
    res.clearCookie(
      "accessToken",
      getCookieOptions(
        ACCESS_TOKEN_COOKIE_MAX_AGE
      )
    );
    // CLEAR REFRESH TOKEN COOKIE
    res.clearCookie(
      "refreshToken",
      getCookieOptions(
        REFRESH_TOKEN_COOKIE_MAX_AGE
      )
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    next(error);
  }
};// FORGOT PASSWORD - SEND OTP

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// FORGOT PASSWORD - VERIFY OTP + RESET PASSWORD

const verifyForgotPasswordOTP = async (req, res, next) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    const result =
      await authService.verifyForgotPasswordOTP(
        email,
        otp,
        newPassword
      );

    await createAuditLog({
      module: "AUTH",
      action: "PASSWORD_RESET",
      actor: result.userId,
      actorEmail: result.email,
      targetId: result.userId,
      targetType: "User",
      description: "User password was reset successfully.",
      req,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// CHANGE PASSWORD

const changePassword = async (req, res, next) => {
  try {
    const {
      oldPassword,
      newPassword,
    } = req.body;

    const result =
      await authService.changePassword(
        req.user._id,
        oldPassword,
        newPassword
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};



// EXPORTS
module.exports = {
  changePassword,
  forgotPassword,
  verifyForgotPasswordOTP,
  sendEmailOTP,
  verifyEmailOTP,
  register,
  login,
  refreshToken,
  logout,
};

