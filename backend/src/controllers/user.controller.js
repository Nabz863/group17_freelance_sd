// This file will be completed when database is set up

// Import database connection (uncomment when ready)
const { supabase } = require("../config/db");

const createFreelancer = async (req, res) => {
  const { auth0_id } = req.auth.payload; // From Auth0 JWT
  const { profile_picture_url, credentials_urls } = req.body; // Non-PII only
  
  try {
    const { data, error } = await supabase
      .from("freelancers")
      .insert([{
        auth0_id, // Reference only
        profile_picture_url, // URL to storage (no image data)
        credentials_urls // Array of storage URLs
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error creating freelancer: ${err.message}`
    });
  }
};

const createClient = async (req, res) => {
  const { auth0_id } = req.auth.payload; // From Auth0 JWT
  const { profile_picture_url, credentials_urls } = req.body; // Non-PII only
  try {
    const { data, error } = await supabase
      .from("clients")
      .insert([{
        auth0_id, // Reference only
        profile_picture_url, // URL to storage (no image data)
        credentials_urls // Array of storage URLs
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating client: ${err.message}",
    });
  }
};

const getUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ success: false, message: "User not Found" });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user: ${err.message}" });
  }
};

const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { userType, ...updates } = req.body;

  const allowedTables = {
    freelancer: "freelancers",
    client: "clients",
    admin: "admins",
  };

  const table = allowedTables[userType];

  if (!table) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user type provided" });
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error updating user: ${err.message}" });
  }
};

module.exports = {
  createFreelancer,
  createClient,
  getUserById,
  updateUserStatus
};
