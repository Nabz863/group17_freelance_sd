// src/utils/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,     // Your Supabase URL (from .env)
  process.env.SUPABASE_ANON_KEY // Your Supabase anon key (from .env)
);

module.exports = supabase;
