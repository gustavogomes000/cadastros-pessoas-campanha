import { supabase } from '@/integrations/supabase/client';

interface DuplicateResult {
  isDuplicate: boolean;
  tipos: string[]; // e.g. ['liderança', 'eleitor']
}

/**
 * Checks if the current user (cadastrado_por) already registered 
 * someone with this CPF in any registration type.
 * Different users CAN register the same CPF — only same-user duplicates are blocked.
 */
export async function checkCpfDuplicateByUser(
  cpf: string,
  usuarioId: string
): Promise<DuplicateResult> {
  if (!cpf || cpf.length !== 11 || !usuarioId) {
    return { isDuplicate: false, tipos: [] };
  }

  // First find the pessoa_id(s) for this CPF
  const { data: pessoas } = await supabase
    .from('pessoas')
    .select('id')
    .eq('cpf', cpf);

  if (!pessoas || pessoas.length === 0) {
    return { isDuplicate: false, tipos: [] };
  }

  const pessoaIds = pessoas.map(p => p.id);
  const tipos: string[] = [];

  // Check in parallel across tables
  const [lRes, eRes] = await Promise.all([
    supabase.from('liderancas')
      .select('id')
      .in('pessoa_id', pessoaIds)
      .eq('cadastrado_por', usuarioId)
      .limit(1),
    supabase.from('possiveis_eleitores')
      .select('id')
      .in('pessoa_id', pessoaIds)
      .eq('cadastrado_por', usuarioId)
      .limit(1),
  ]);

  if (lRes.data && lRes.data.length > 0) tipos.push('Liderança');
  if (eRes.data && eRes.data.length > 0) tipos.push('Eleitor');

  return { isDuplicate: tipos.length > 0, tipos };
}
