import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

<<<<<<< HEAD
=======
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

>>>>>>> parent of f28f029c (searching names of clients and freelancers to report them)
export default supabase;