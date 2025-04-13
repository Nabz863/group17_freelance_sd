const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
require("dotenv").config();

// Initialize passport
passport.initialize();

// needs to connect to db, using in memory storage for now
const users = [];

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      // This function will be replaced with database logic later
      // For now, we'll use in-memory storage
      const existingUser = users.find((user) => user.googleId === profile.id);

      if (existingUser) {
        return done(null, existingUser);
      }

      // Create a new user if they do not exist
      const newUser = {
        id: Date.now().toString(),
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        role: "pending", // Default role is pending until approved
        createdAt: new Date(),
      };

      users.push(newUser);
      return done(null, newUser);
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id);
  done(null, user || null);
});

// Auth0 JWT validation middleware
const checkJwt = expressJwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden - insufficient permissions" });
    }

    next();
  };
};

module.exports = {
  passport,
  checkJwt,
  verifyToken,
  checkRole,
  users, // Temporary export for development purposes
};
