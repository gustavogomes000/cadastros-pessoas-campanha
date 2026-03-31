import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Create usuario_modulos table
    const { error: e1 } = await supabase.rpc('exec_sql' as any, {
      sql: `
        CREATE TABLE IF NOT EXISTS public.usuario_modulos (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id uuid NOT NULL REFERENCES public.hierarquia_usuarios(id) ON DELETE CASCADE,
          modulo varchar NOT NULL,
          criado_em timestamptz NOT NULL DEFAULT now(),
          UNIQUE(usuario_id, modulo)
        );
      `
    });

    // Create localizacoes_usuarios table
    const { error: e2 } = await supabase.rpc('exec_sql' as any, {
      sql: `
        CREATE TABLE IF NOT EXISTS public.localizacoes_usuarios (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id uuid NOT NULL REFERENCES public.hierarquia_usuarios(id) ON DELETE CASCADE,
          latitude double precision NOT NULL,
          longitude double precision NOT NULL,
          precisao double precision,
          fonte varchar DEFAULT 'gps',
          endereco_ip text,
          user_agent text,
          bateria_nivel integer,
          em_movimento boolean DEFAULT false,
          criado_em timestamptz NOT NULL DEFAULT now()
        );
      `
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Tables need to be created via Supabase dashboard SQL editor',
      errors: { e1: e1?.message, e2: e2?.message }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
