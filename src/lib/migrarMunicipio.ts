import { supabase } from '@/integrations/supabase/client';

/**
 * Migra todos os suplentes existentes para Aparecida de Goiânia.
 */
export async function migrarSuplentesMunicipio(
  onProgress?: (msg: string) => void
): Promise<{ suplentesVinculados: number; cadastrosAtualizados: number }> {
  onProgress?.('Buscando município padrão...');

  const { data: municipio } = await (supabase as any)
    .from('municipios')
    .select('id')
    .eq('nome', 'Aparecida de Goiânia')
    .maybeSingle();

  if (!municipio) throw new Error('Município "Aparecida de Goiânia" não encontrado.');

  const municipioId = municipio.id;

  onProgress?.('Buscando suplentes do banco externo...');
  const { data: suplentes, error: supError } = await supabase.functions.invoke('buscar-suplentes');
  if (supError) throw new Error(`Erro ao buscar suplentes: ${supError.message}`);
  if (!Array.isArray(suplentes) || suplentes.length === 0) {
    return { suplentesVinculados: 0, cadastrosAtualizados: 0 };
  }

  onProgress?.(`Vinculando ${suplentes.length} suplentes...`);
  let suplentesVinculados = 0;

  for (const sup of suplentes) {
    const { error } = await (supabase as any)
      .from('suplente_municipio')
      .upsert(
        { suplente_id: String(sup.id), municipio_id: municipioId },
        { onConflict: 'suplente_id' }
      );
    if (!error) suplentesVinculados++;
  }

  onProgress?.('Atualizando usuários e cadastros...');
  let cadastrosAtualizados = 0;

  // Update hierarquia_usuarios
  const { data: usuariosComSuplente } = await supabase
    .from('hierarquia_usuarios')
    .select('id, suplente_id')
    .not('suplente_id', 'is', null);

  if (usuariosComSuplente) {
    for (const u of usuariosComSuplente) {
      const { error } = await (supabase as any)
        .from('hierarquia_usuarios')
        .update({ municipio_id: municipioId })
        .eq('id', u.id);
      if (!error) cadastrosAtualizados++;
    }
  }

  // Update liderancas, possiveis_eleitores
  for (const table of ['liderancas', 'possiveis_eleitores'] as const) {
    const { data: registros } = await supabase
      .from(table)
      .select('id, suplente_id')
      .not('suplente_id', 'is', null);

    if (registros) {
      for (const r of registros) {
        const { error } = await (supabase as any)
          .from(table)
          .update({ municipio_id: municipioId })
          .eq('id', r.id);
        if (!error) cadastrosAtualizados++;
      }
    }
  }

  onProgress?.(`✅ Concluído: ${suplentesVinculados} suplentes, ${cadastrosAtualizados} cadastros`);
  return { suplentesVinculados, cadastrosAtualizados };
}
