const { auth } = require("express-oauth2-jwt-bearer");
const jwksRsa = require("jwks-rsa");
require("dotenv").config();

// Auth0 configuration from environment variables - use fallbacks for development
const auth0Domain =
  process.env.AUTH0_DOMAIN || "dev-ttpqtow83wgggk7p.us.auth0.com";
const auth0Audience =
  process.env.AUTH0_AUDIENCE ||
  "https://dev-ttpqtow83wgggk7p.us.auth0.com/api/v2/";

// Create middleware for validating JWTs
const jwtCheck = auth({
  audience: auth0Audience,
  issuerBaseURL: `https://${auth0Domain}/`,
  tokenSigningAlg: "RS256",
  jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
});

// Role checking middleware
const checkRole = (roles) => (req, res, next) => {
  if (!req.auth || !req.auth.payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Safe access to roles with fallback to empty array if undefined
  const namespace =
    process.env.AUTH0_NAMESPACE || "https://dev-ttpqtow83wgggk7p.us.auth0.com";
  const userRoles =
    (req.auth.payload && req.auth.payload[`${namespace}/roles`]) || [];

  // Check if user has at least one of the required roles
  const hasRequiredRole =
    Array.isArray(roles) &&
    Array.isArray(userRoles) &&
    roles.some((role) => userRoles.includes(role));

  if (!hasRequiredRole) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  next();
};

module.exports = { jwtCheck, checkRole };
