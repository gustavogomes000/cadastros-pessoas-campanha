import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: string[] = [];

  // 1. Drop old SELECT policy on hierarquia_usuarios and create new one that includes coordenador
  const statements = [
    `DROP POLICY IF EXISTS "Admin ve todos usuarios" ON public.hierarquia_usuarios;`,
    `CREATE POLICY "Admin ve todos usuarios" ON public.hierarquia_usuarios FOR SELECT TO authenticated USING (
      eh_admin_hierarquia() OR (id = get_meu_usuario_id()) OR (id IN (SELECT get_subordinados(get_meu_usuario_id())))
    );`,
    // Also allow coordenador to INSERT users
    `DROP POLICY IF EXISTS "Admin insere usuarios" ON public.hierarquia_usuarios;`,
    `CREATE POLICY "Admin insere usuarios" ON public.hierarquia_usuarios FOR INSERT TO authenticated WITH CHECK (
      eh_admin_hierarquia()
    );`,
    // Also allow coordenador to UPDATE users  
    `DROP POLICY IF EXISTS "Admin atualiza usuarios" ON public.hierarquia_usuarios;`,
    `CREATE POLICY "Admin atualiza usuarios" ON public.hierarquia_usuarios FOR UPDATE TO authenticated USING (
      eh_admin_hierarquia() OR (id = get_meu_usuario_id())
    );`,
    // Also allow coordenador to DELETE users
    `DROP POLICY IF EXISTS "Admin deleta usuarios" ON public.hierarquia_usuarios;`,
    `CREATE POLICY "Admin deleta usuarios" ON public.hierarquia_usuarios FOR DELETE TO authenticated USING (
      eh_admin_hierarquia()
    );`,
  ];

  for (const sql of statements) {
    const { error } = await supabase.rpc("exec_sql" as any, { sql });
    if (error) {
      // Try via raw query through REST - fallback: use the service role to run DDL
      results.push(`WARN: ${sql.substring(0, 60)}... → ${error.message}`);
    } else {
      results.push(`OK: ${sql.substring(0, 60)}...`);
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
