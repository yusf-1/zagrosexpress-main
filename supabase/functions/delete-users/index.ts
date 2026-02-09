import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const keepUserId = '41ce90fb-a5d5-46c5-8308-4e4ead9970ec'

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, phone, full_name')
      .neq('user_id', keepUserId)

    console.log(`Found ${profiles?.length} users to delete`)

    const deleted: string[] = []
    for (const p of profiles || []) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(p.user_id)
      if (!error) deleted.push(p.full_name || p.user_id)
      else console.error(`Failed: ${p.user_id}`, error)
    }

    return new Response(JSON.stringify({ deleted, count: deleted.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
