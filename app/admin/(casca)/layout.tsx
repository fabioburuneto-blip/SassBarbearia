import { exigirSuperadmin } from '@/lib/sessao';
import { supabaseServidor } from '@/lib/supabase';
import { sair } from '@/app/entrar/acoes';
import { Casca } from '@/components/interno/Casca';
import { IEnvelope, ILoja, IMais } from '@/components/interno/Icones';

export default async function LayoutAdminCasca({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSuperadmin();
  const sb = await supabaseServidor();
  const { count } = await sb.from('solicitacoes_cadastro').select('id', { count: 'exact', head: true }).eq('status', 'pendente');

  return (
    <>
      <style>{'html,body{background:#0b0d10}'}</style>
      <Casca
        marca={{ nome: 'Admin', href: '/admin' }}
        usuario={`${sessao.nome} · Superadmin`}
        itens={[
          { href: '/admin', rotulo: 'Barbearias', icone: <ILoja />, exato: true },
          { href: '/admin/nova', rotulo: 'Nova', icone: <IMais /> },
          { href: '/admin/solicitacoes', rotulo: count ? `Solicitações (${count})` : 'Solicitações', icone: <IEnvelope /> },
        ]}
        sair={sair}
      >
        {children}
      </Casca>
    </>
  );
}
