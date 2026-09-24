import type { Metadata } from 'next';
import { supabaseServidor } from '@/lib/supabase';
import { urlBase } from '@/lib/url';
import { Solicitacoes, type Solicitacao } from './Solicitacoes';
import s from '@/components/interno/ui.module.css';

export const metadata: Metadata = { title: 'Solicitações' };

export default async function PaginaSolicitacoes() {
  const sb = await supabaseServidor();
  const { data, count } = await sb
    .from('solicitacoes_cadastro')
    .select('id, nome_barbearia, slug_desejado, nome_responsavel, email, whatsapp, observacao, created_at', { count: 'exact' })
    .eq('status', 'pendente')
    .order('created_at');
  const origem = (await urlBase()).origin;

  return (
    <>
      <div className={s.cabecalho}>
        <div>
          <h1 className={s.titulo}>Solicitações</h1>
          <p className={s.sub}>{count ?? 0} {count === 1 ? 'pedido pendente' : 'pedidos pendentes'} vindos de /comecar</p>
        </div>
      </div>
      <Solicitacoes pendentes={(data ?? []) as Solicitacao[]} origem={origem} />
    </>
  );
}
