import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyFirebaseToken } from '../_shared/firebaseAuth.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Authenticate via Firebase token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return error('Missing or invalid Authorization header', 401);
  }

  let uid: string;
  try {
    const token = authHeader.slice(7);
    const payload = await verifyFirebaseToken(token);
    uid = payload.uid;
  } catch {
    return error('Invalid Firebase token', 401);
  }

  // Supabase client — uses service role key to bypass RLS
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const url = new URL(req.url);

  // ── GET /citadex-favorites — list user's favorites ──────────────────────────
  if (req.method === 'GET') {
    const { data, error: dbError } = await supabase
      .from('citadex_favorites')
      .select('character_id, character_data, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (dbError) return error(dbError.message, 500);
    return json(data);
  }

  // ── POST /citadex-favorites — upsert a favorite ─────────────────────────────
  if (req.method === 'POST') {
    let body: { character_id: string; character_data: unknown };
    try {
      body = await req.json();
    } catch {
      return error('Invalid JSON body');
    }

    const { character_id, character_data } = body;
    if (!character_id) return error('character_id is required');

    const { error: dbError } = await supabase
      .from('citadex_favorites')
      .upsert(
        { user_id: uid, character_id, character_data },
        { onConflict: 'user_id,character_id' },
      );

    if (dbError) return error(dbError.message, 500);
    return json({ success: true }, 201);
  }

  // ── DELETE /citadex-favorites?character_id=xxx — remove a favorite ──────────
  if (req.method === 'DELETE') {
    const characterId = url.searchParams.get('character_id');
    if (!characterId) return error('character_id query param is required');

    const { error: dbError } = await supabase
      .from('citadex_favorites')
      .delete()
      .eq('user_id', uid)
      .eq('character_id', characterId);

    if (dbError) return error(dbError.message, 500);
    return json({ success: true });
  }

  return error('Method not allowed', 405);
});
