'use server';

import { revalidatePath } from 'next/cache';
import { exigirDono } from '@/lib/sessao';
import { supabaseServidor } from '@/lib/supabase';
import type { Resultado } from '@/lib/painel-tipos';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function atualizar(slug: string) {
  revalidatePath('/painel/clube');
  revalidatePath(`/${slug}`); // site público mostra os planos
}

type DadosPlano = { id?: string; nome: string; descricao: string; preco: number; creditos_mes: number };

function validar(d: DadosPlano): string | null {
  if (!d.nome?.trim() || d.nome.trim().length > 80) return 'Informe o nome (até 80 caracteres).';
  if (!Number.isFinite(d.preco) || d.preco <= 0 || d.preco > 100000) return 'Preço inválido.';
  if (!Number.isInteger(d.creditos_mes) || d.creditos_mes <= 0 || d.creditos_mes > 999) return 'Créditos por mês deve ser um número inteiro maior que zero.';
  if ((d.descricao ?? '').length > 300) return 'Descrição muito longa (até 300 caracteres).';
  return null;
}

export async function salvarPlano(d: DadosPlano): Promise<Resultado> {
  const { barbearia } = await exigirDono();
  const erro = validar(d);
  if (erro) return { ok: false, erro };
  const sb = await supabaseServidor();
  const campos = {
    nome: d.nome.trim(),
    descricao: d.descricao?.trim() || null,
    preco: Math.round(d.preco * 100) / 100,
    creditos_mes: d.creditos_mes,
  };

  if (d.id) {
    if (!UUID.test(d.id)) return { ok: false, erro: 'Plano inválido.' };
    const { error } = await sb.from('planos_clube').update(campos).eq('id', d.id).eq('barbearia_id', barbearia.id);
    if (error) return { ok: false, erro: 'Não foi possível salvar.' };
  } else {
    const { data: ultimo } = await sb.from('planos_clube').select('ordem').eq('barbearia_id', barbearia.id).order('ordem', { ascending: false }).limit(1).maybeSingle();
    const { error } = await sb.from('planos_clube').insert({ ...campos, barbearia_id: barbearia.id, ordem: (ultimo?.ordem ?? 0) + 1 });
    if (error) return { ok: false, erro: 'Não foi possível criar o plano.' };
  }
  atualizar(barbearia.slug);
  return { ok: true };
}

export async function alternarPlano(id: string, ativo: boolean): Promise<Resultado> {
  const { barbearia } = await exigirDono();
  if (!UUID.test(id)) return { ok: false, erro: 'Plano inválido.' };
  const sb = await supabaseServidor();
  const { error } = await sb.from('planos_clube').update({ ativo }).eq('id', id).eq('barbearia_id', barbearia.id);
  if (error) return { ok: false, erro: 'Não foi possível alterar.' };
  atualizar(barbearia.slug);
  return { ok: true };
}
