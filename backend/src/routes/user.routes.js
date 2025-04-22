const express = require("express");
const { jwtCheck, checkRole } = require("../middleware/auth.middleware");
const router = express.Router();
const supabase = require("../config/db");

// Get all users (Admin only)
router.get("/", jwtCheck, checkRole(["admin"]), async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      users: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Freelancer signup route
router.post("/signup/freelancer", jwtCheck, async (req, res) => {
  try {
    const { role } = req.body;
    const auth0_id = req.auth.sub; // Getting Auth0 user ID from token

    // Check if user already exists in Supabase
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", auth0_id)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          auth0_id,
          role,
          status: "pending",
        },
      ])
      .single();

    if (insertError) throw new Error(insertError.message);

    res.status(201).json({
      success: true,
      message: "Freelancer registration successful. Awaiting approval.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Client signup route
router.post("/signup/client", jwtCheck, async (req, res) => {
  try {
    const { role } = req.body;
    const auth0_id = req.auth.sub; // Getting Auth0 user ID from token

    // Check if user already exists in Supabase
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", auth0_id)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          auth0_id, // Linking user with Auth0 ID
          role, // Client role
          status: "pending", // Pending status by default
        },
      ])
      .single();

    if (insertError) throw new Error(insertError.message);

    res.status(201).json({
      success: true,
      message: "Client registration successful. Awaiting approval.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user status (Admin only)
router.patch(
  "/:userId/status",
  jwtCheck,
  checkRole(["admin"]),
  async (req, res) => {
    const { userId } = req.params;
    const { status, role } = req.body;

    try {
      // Look for the user in the database by Auth0 ID
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth0_id", userId)
        .single();

      if (error || !user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user status and role
      const { data: updatedUser, updateError } = await supabase
        .from("users")
        .update({
          status: status || user.status,
          role: role || user.role,
        })
        .eq("auth0_id", userId)
        .single();

      if (updateError) throw new Error(updateError.message);

      res.status(200).json({
        success: true,
        message: "User status updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get user profile
router.get("/profile", jwtCheck, async (req, res) => {
  const auth0_id = req.auth.sub; // Getting Auth0 user ID from token

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", auth0_id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
