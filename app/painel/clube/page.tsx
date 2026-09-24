import type { Metadata } from 'next';
import { exigirDono } from '@/lib/sessao';
import { supabaseServidor } from '@/lib/supabase';
import type { PlanoClube } from '@/lib/painel-tipos';
import { Clube } from './Clube';

export const metadata: Metadata = { title: 'Clube' };

export default async function PaginaClube() {
  const { barbearia } = await exigirDono();
  const sb = await supabaseServidor();
  const { data } = await sb
    .from('planos_clube')
    .select('id, nome, descricao, preco, creditos_mes, ativo, ordem')
    .eq('barbearia_id', barbearia.id)
    .order('ordem')
    .order('preco');
  return <Clube planos={(data ?? []) as PlanoClube[]} />;
}
