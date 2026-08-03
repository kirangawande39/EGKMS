const crypto = require("crypto");



// HASH TOKEN


const hashToken = (token) => {
  if (!token) {
    throw new Error("Token is required.");
  }

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};



// COMPARE TOKEN


const compareToken = (
  token,
  hashedToken
) => {
  if (!token || !hashedToken) {
    return false;
  }

  const tokenHash = hashToken(token);

  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, "hex"),
    Buffer.from(hashedToken, "hex")
  );
};


module.exports = {
  hashToken,
  compareToken,
};
