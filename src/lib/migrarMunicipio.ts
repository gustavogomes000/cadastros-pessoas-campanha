import { supabase } from '@/integrations/supabase/client';

/**
 * Migra todos os suplentes existentes para Aparecida de Goiânia.
 * Deve ser chamada uma única vez pelo super_admin.
 */
export async function migrarSuplentesMunicipio(
  onProgress?: (msg: string) => void
): Promise<{ suplentesVinculados: number; cadastrosAtualizados: number }> {
  onProgress?.('Buscando município padrão...');

  // 1. Buscar Aparecida de Goiânia
  const { data: municipio } = await supabase
    .from('municipios')
    .select('id')
    .eq('nome', 'Aparecida de Goiânia')
    .maybeSingle();

  if (!municipio) throw new Error('Município "Aparecida de Goiânia" não encontrado. Execute a migration primeiro.');

  const municipioId = municipio.id;

  // 2. Buscar todos os suplentes do banco externo
  onProgress?.('Buscando suplentes do banco externo...');
  const { data: suplentes, error: supError } = await supabase.functions.invoke('buscar-suplentes');
  if (supError) throw new Error(`Erro ao buscar suplentes: ${supError.message}`);
  if (!Array.isArray(suplentes) || suplentes.length === 0) {
    return { suplentesVinculados: 0, cadastrosAtualizados: 0 };
  }

  // 3. Inserir cada suplente em suplente_municipio
  onProgress?.(`Vinculando ${suplentes.length} suplentes...`);
  let suplentesVinculados = 0;

  for (const sup of suplentes) {
    const { error } = await supabase
      .from('suplente_municipio')
      .upsert(
        { suplente_id: String(sup.id), municipio_id: municipioId },
        { onConflict: 'suplente_id' }
      );
    if (!error) suplentesVinculados++;
  }

  // 4. Atualizar hierarquia_usuarios que têm suplente_id
  onProgress?.('Atualizando usuários...');
  const { data: usuariosComSuplente } = await supabase
    .from('hierarquia_usuarios')
    .select('id, suplente_id')
    .not('suplente_id', 'is', null);

  let cadastrosAtualizados = 0;

  if (usuariosComSuplente) {
    for (const u of usuariosComSuplente) {
      const { error } = await supabase
        .from('hierarquia_usuarios')
        .update({ municipio_id: municipioId })
        .eq('id', u.id);
      if (!error) cadastrosAtualizados++;
    }
  }

  // 5. Atualizar liderancas, fiscais, possiveis_eleitores que têm suplente_id
  onProgress?.('Atualizando cadastros...');

  const tables = ['liderancas', 'fiscais', 'possiveis_eleitores'] as const;
  for (const table of tables) {
    const { data: registros } = await supabase
      .from(table)
      .select('id, suplente_id')
      .not('suplente_id', 'is', null);

    if (registros) {
      for (const r of registros) {
        const { error } = await supabase
          .from(table)
          .update({ municipio_id: municipioId } as any)
          .eq('id', r.id);
        if (!error) cadastrosAtualizados++;
      }
    }
  }

  onProgress?.(`✅ Concluído: ${suplentesVinculados} suplentes, ${cadastrosAtualizados} cadastros`);
  return { suplentesVinculados, cadastrosAtualizados };
}
