import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zmpoydirinhziqedzjmi.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcG95ZGlyaW5oemlxZWR6am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzUwODYsImV4cCI6MjA2MDE1MTA4Nn0.qmI2YB1KBHvrEPzyYB1ISy2b9GWvcd1O9JxAPCZn2_I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
