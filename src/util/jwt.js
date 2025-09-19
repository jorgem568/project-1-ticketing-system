const jwt = require("jsonwebtoken");
const { logger } = require("./logger");

const secretKey = "my-secret-key";

async function authenticateToken(req, res, next) {
  // Authorization: "Bearer tokenstring"

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const current_user_id = req.headers["current-user"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let user;
  try {
    user = await decodeJWT(token);
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  if (!user) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  if (user.id !== current_user_id) {
    return res.status(403).json({ message: "Forbidden access" });
  }

  req.user = user;
  next();
}

async function decodeJWT(token) {
  try {
    const user = await jwt.verify(token, secretKey);
    return user;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

module.exports = {
  authenticateToken,
};
