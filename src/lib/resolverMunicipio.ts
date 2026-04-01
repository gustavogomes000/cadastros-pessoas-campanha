import { supabase } from '@/integrations/supabase/client';

/**
 * Dado um suplente_id externo, retorna o municipio_id local
 */
export async function resolverMunicipioId(
  suplenteId: string
): Promise<string | null> {
  if (!suplenteId) return null;

  const { data } = await supabase
    .from('suplente_municipio')
    .select('municipio_id')
    .eq('suplente_id', suplenteId)
    .maybeSingle();

  return data?.municipio_id ?? null;
}

/**
 * Dado um municipio_id, retorna o nome do município
 */
export async function buscarNomeMunicipio(
  municipioId: string
): Promise<string | null> {
  if (!municipioId) return null;

  const { data } = await supabase
    .from('municipios')
    .select('nome')
    .eq('id', municipioId)
    .maybeSingle();

  return data?.nome ?? null;
}
