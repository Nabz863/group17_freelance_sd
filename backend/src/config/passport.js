const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Replace these with your actual environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback", // update if your routes use a different path
    },
    async (accessToken, refreshToken, profile, done) => {
      // You can customize this based on how you handle users
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      };
      return done(null, user);
    }
  )
);

// (Optional) If using sessions, you'll need these:
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
