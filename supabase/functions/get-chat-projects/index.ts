import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

serve(async (req) => {
  const { user_id, is_client } = await req.json();
  if (!user_id) return new Response('Missing user ID', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const roleField = is_client ? 'client_id' : 'freelancer_id';
  const { data, error } = await supabase
    .from('projects')
    .select('id, description')
    .eq(roleField, user_id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), { status: 200 });
});

