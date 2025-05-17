// src/utils/supabase.js
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, // Your Supabase URL (from .env)
  process.env.REACT_APP_SUPABASE_ANON_KEY // Your Supabase anon key (from .env)
);

module.exports = supabase;
