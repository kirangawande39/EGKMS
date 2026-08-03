const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN || "15m";

const REFRESH_TOKEN_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const getJwtPayload = (user) => {
  return {
    id: user._id.toString(),
    employeeId: user.employeeId
      ? user.employeeId.toString()
      : null,
  };
};



// ACCESS TOKEN


const generateAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured."
    );
  }

  return jwt.sign(
    getJwtPayload(user),
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
};



// REFRESH TOKEN


const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured."
    );
  }

  return jwt.sign(
    getJwtPayload(user),
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
};



// VERIFY ACCESS TOKEN


const verifyAccessToken = (token) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured."
    );
  }

  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET,
    {
      algorithms: ["HS256"],
    }
  );
};



// VERIFY REFRESH TOKEN


const verifyRefreshToken = (token) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured."
    );
  }

  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET,
    {
      algorithms: ["HS256"],
    }
  );
};


module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
