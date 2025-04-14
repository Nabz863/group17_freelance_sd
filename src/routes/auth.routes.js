const express = require("express");
const jwt = require("jsonwebtoken");
const { passport, verifyToken } = require("../middleware/auth.middleware");
const supabase = require("../config/supabaseClient"); // Assuming you're using Supabase
const router = express.Router();

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  async (req, res) => {
    try {
      const auth0_id = req.user.id; // Use Auth0 user ID (sub)
      const { email, role } = req.user;

      // Check if user already exists in your database (Supabase)
      const { data: existingUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth0_id", auth0_id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
      }

      let user = existingUser;
      if (!user) {
        // If the user doesn't exist, create a new user in Supabase
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              auth0_id, // Linking with Auth0 ID
              email,
              role: role || "pending", // Default to 'pending' if no role is assigned
              status: "pending",
            },
          ])
          .single();

        if (insertError) throw new Error(insertError.message);

        user = newUser;
      }

      // Create JWT token with the auth0_id as the unique identifier
      const token = jwt.sign(
        { id: user.auth0_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Set token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect based on role
      switch (user.role) {
        case "admin":
          return res.redirect("/admin/dashboard");
        case "freelancer":
          return res.redirect("/freelancer/dashboard");
        case "client":
          return res.redirect("/client/dashboard");
        case "pending":
        default:
          return res.redirect("/pending-approval");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred during login",
      });
    }
  }
);

// Login failed route
router.get("/login-failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Login failed",
  });
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.logout(() => {
    res.redirect("/");
  });
});

// Get current user information
router.get("/me", verifyToken, async (req, res) => {
  const auth0_id = req.user.id; // Extract from token (auth0_id)

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", auth0_id)
      .single();

    if (error || !user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to check authentication status
router.get("/status", (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isAuthenticated: true });
  } catch (err) {
    return res.status(200).json({ isAuthenticated: false });
  }
});

module.exports = router;
