import { createClient } from "@supabase/supabase-js";

// Log environment variables
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);

// Check if environment variables are loaded
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', process.env.REACT_APP_SUPABASE_URL);
  console.error('Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test database access directly
    const { data: testResult, error: dbError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.error('Database access test failed:', dbError);
      console.error('Full error:', JSON.stringify(dbError, null, 2));
    } else {
      console.log('Database access test successful:', testResult);
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
};

// Run the test connection
try {
  testConnection();
} catch (error) {
  console.error('Initial connection test failed:', error);
}

export default supabase;