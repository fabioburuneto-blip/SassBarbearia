'use server';

import { supabasePublico } from '@/lib/supabase';
import { slugificar } from '@/lib/slug';
import type { Resultado } from '@/lib/painel-tipos';

export type DadosSolicitacao = {
  nomeBarbearia: string;
  nomeResponsavel: string;
  email: string;
  whatsapp: string;
  observacao: string;
};

export async function enviarSolicitacao(d: DadosSolicitacao): Promise<Resultado> {
  const nomeBarbearia = d.nomeBarbearia.trim().slice(0, 80);
  const nomeResponsavel = d.nomeResponsavel.trim().slice(0, 80);
  const email = d.email.trim().toLowerCase().slice(0, 160);
  const whatsapp = d.whatsapp.replace(/\D/g, '').slice(0, 13);
  const observacao = d.observacao.trim().slice(0, 300) || null;

  if (nomeBarbearia.length < 2) return { ok: false, erro: 'Informe o nome da barbearia.' };
  if (nomeResponsavel.length < 2) return { ok: false, erro: 'Informe seu nome.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, erro: 'Informe um e-mail válido.' };
  if (whatsapp.length < 10 || whatsapp.length > 13) return { ok: false, erro: 'Informe um WhatsApp válido, com DDD.' };

  const { error } = await supabasePublico()
    .from('solicitacoes_cadastro')
    .insert({
      nome_barbearia: nomeBarbearia,
      slug_desejado: slugificar(nomeBarbearia) || null,
      nome_responsavel: nomeResponsavel,
      email,
      whatsapp,
      observacao,
    });

  if (error) {
    if (error.code === '23505') return { ok: false, erro: 'Você já tem um pedido em análise com esse e-mail. Em breve entramos em contato.' };
    return { ok: false, erro: 'Não foi possível enviar agora. Tente de novo em instantes.' };
  }
  return { ok: true, mensagem: 'Pedido enviado!' };
}
