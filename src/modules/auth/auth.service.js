const bcrypt = require("bcrypt");

const User = require("./auth.model");
const OTP = require("./otp.model");
const Employee = require("../employee/employee.model");

const ApiError = require("../../utils/ApiError");
const generateOTP = require("../../utils/otp");

const {
  sendEmail,
  emailVerificationTemplate,
} = require("../../services/email");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

const {
  hashToken,
  compareToken,
} = require("../../utils/hash");



// REGISTER USER


const registerUser = async (userData) => {
  const { email, password } = userData;

  const normalizedEmail = email.toLowerCase().trim();

  // Check company-approved employee
  const employee = await Employee.findOne({
    email: normalizedEmail,
  });

  if (!employee) {
    throw new ApiError(
      403,
      "Email is not authorized by company."
    );
  }

  // Check employee status
  if (employee.status !== "ACTIVE") {
    throw new ApiError(
      403,
      "Employee account is not active."
    );
  }

  // Check already registered
  if (employee.isRegistered) {
    throw new ApiError(
      409,
      "Employee account already exists."
    );
  }

  // OTP must be verified before registration
  const verifiedOTP = await OTP.findOne({
    email: normalizedEmail,
    verified: true,
  });

  if (!verifiedOTP) {
    throw new ApiError(
      400,
      "Please verify your email first."
    );
  }

  // Check existing user
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User already exists."
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  // Create User
  const user = await User.create({
    employeeId: employee._id,
    email: normalizedEmail,
    password: hashedPassword,
    isEmailVerified: true,
    accountStatus: "ACTIVE",
  });

  // Mark employee as registered
  employee.isRegistered = true;

  await employee.save();

  // Remove verified OTP
  await OTP.deleteMany({
    email: normalizedEmail,
  });

  return user;
};



// SEND EMAIL OTP


const sendEmailOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check company-approved employee
  const employee = await Employee.findOne({
    email: normalizedEmail,
  });

  if (!employee) {
    throw new ApiError(
      403,
      "Email is not authorized by company."
    );
  }

  // Check employee status
  if (employee.status !== "ACTIVE") {
    throw new ApiError(
      403,
      "Employee account is not active."
    );
  }

  // Check already registered
  if (employee.isRegistered) {
    throw new ApiError(
      409,
      "Employee already registered."
    );
  }

  // Check existing user
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User already exists."
    );
  }

  // Generate OTP
  const otp = generateOTP();

  // Hash OTP before storing
  const otpHash = await bcrypt.hash(
    otp,
    10
  );

  // Remove previous OTP
  await OTP.deleteMany({
    email: normalizedEmail,
  });

  // Save hashed OTP
  await OTP.create({
    email: normalizedEmail,
    otpHash,
    expiresAt: new Date(
      Date.now() + 5 * 60 * 1000
    ),
    attempts: 0,
    verified: false,
  });

  // Send OTP email
  await sendEmail({
    to: normalizedEmail,
    subject: "Verify Your Email",
    html: emailVerificationTemplate(otp),
  });

  return {
    message: "OTP sent successfully.",
  };
};



// VERIFY EMAIL OTP
const verifyEmailOTP = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    verified: false,
  }).select("+otpHash");

  if (!otpRecord) {
    throw new ApiError(
      404,
      "OTP not found."
    );
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    throw new ApiError(
      400,
      "OTP has expired."
    );
  }

  // Check maximum attempts
  if (otpRecord.attempts >= 5) {
    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    throw new ApiError(
      429,
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  // Compare OTP
  const isValidOTP = await bcrypt.compare(
    otp,
    otpRecord.otpHash
  );

  if (!isValidOTP) {
    otpRecord.attempts += 1;

    await otpRecord.save();

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      throw new ApiError(
        429,
        "Too many invalid OTP attempts. Please request a new OTP."
      );
    }

    throw new ApiError(
      400,
      "Invalid OTP."
    );
  }

  // Mark OTP verified
  otpRecord.verified = true;

  await otpRecord.save();

  return {
    message: "Email verified successfully.",
  };
};



// LOGIN USER


const loginUser = async (user) => {
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = hashToken(
    refreshToken
  );

  user.refreshTokenHash = refreshTokenHash;

  user.lastLogin = new Date();

  await user.save();

  return {
    accessToken,
    refreshToken,
    user,
  };
};



// REFRESH ACCESS TOKEN


const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(
      401,
      "Refresh token is required."
    );
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(
      refreshToken
    );
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid or expired refresh token."
    );
  }

  const user = await User.findById(
    decoded.id
  ).select("+refreshTokenHash");

  if (!user) {
    throw new ApiError(
      401,
      "User not found."
    );
  }

  // New account status check
  if (user.accountStatus !== "ACTIVE") {
    throw new ApiError(
      403,
      "Account is not active."
    );
  }

  // Refresh token must exist
  if (!user.refreshTokenHash) {
    throw new ApiError(
      401,
      "Invalid refresh token."
    );
  }

  // Compare refresh token
  const isMatch = compareToken(
    refreshToken,
    user.refreshTokenHash
  );

  if (!isMatch) {
    throw new ApiError(
      401,
      "Invalid refresh token."
    );
  }

  // Generate new token pair
  const newAccessToken =
    generateAccessToken(user);

  const newRefreshToken =
    generateRefreshToken(user);

  // Token rotation
  user.refreshTokenHash =
    hashToken(newRefreshToken);

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};



// LOGOUT USER


const logoutUser = async (userId) => {
  const user = await User.findById(
    userId
  );

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  // Invalidate refresh token
  user.refreshTokenHash = null;

  await user.save();

  return {
    message: "Logout successful.",
  };
};



// EXPORTS


module.exports = {
  registerUser,
  sendEmailOTP,
  verifyEmailOTP,
  loginUser,
  refreshAccessToken,
  logoutUser,
};

