'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { slugificar } from '@/lib/slug';
import { mascaraTelefone } from '@/lib/agendamento';
import { linkWhatsapp, whatsappFormatado } from '@/lib/formatar';
import { aprovarSolicitacao, recusarSolicitacao, verificarSlug } from '../../acoes';
import { Folha, useAviso } from '@/components/interno/Comuns';
import { ICheck, IFechar } from '@/components/interno/Icones';
import s from '@/components/interno/ui.module.css';

export type Solicitacao = {
  id: string;
  nome_barbearia: string;
  slug_desejado: string | null;
  nome_responsavel: string;
  email: string;
  whatsapp: string;
  observacao: string | null;
  created_at: string;
};

export function Solicitacoes({ pendentes, origem }: { pendentes: Solicitacao[]; origem: string }) {
  const [aprovando, setAprovando] = useState<Solicitacao | null>(null);
  const [pendente, iniciar] = useTransition();
  const [aviso, mostrar] = useAviso();
  const [pronta, setPronta] = useState<{ barbeariaId: string; email: string; senha: string; whatsapp: string; nome: string } | null>(null);

  function recusar(sol: Solicitacao) {
    if (!confirm(`Recusar o pedido de "${sol.nome_barbearia}"?`)) return;
    iniciar(async () => {
      const r = await recusarSolicitacao(sol.id);
      mostrar(r.ok ? 'Pedido recusado' : r.erro);
    });
  }

  if (pronta) {
    const wa = linkWhatsapp(pronta.whatsapp, `Olá, ${pronta.nome}! Sua barbearia já está no ar 🎉\n\nAcesse o painel em ${origem}/painel\nE-mail: ${pronta.email}\nSenha provisória: ${pronta.senha}\n\nTroque a senha assim que entrar, em Conta.`);
    return (
      <div className={s.card} style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
        <h2 className={s.secaoTitulo} style={{ margin: 0 }}>
          Barbearia criada!
        </h2>
        <p className={s.sub}>Envie o acesso provisório para {pronta.nome} e depois continue a montagem (tema, fotos, serviços).</p>
        <div className={`${s.card} ${s.form}`} style={{ background: 'var(--fundo-2, transparent)' }}>
          <div className={s.campo}>
            <span className={s.rotulo}>E-mail</span>
            <code className={s.num}>{pronta.email}</code>
          </div>
          <div className={s.campo}>
            <span className={s.rotulo}>Senha provisória</span>
            <code className={s.num}>{pronta.senha}</code>
          </div>
        </div>
        <div className={s.linha}>
          {wa && (
            <a className={`${s.botao} ${s.primario}`} href={wa} target="_blank" rel="noopener noreferrer">
              Enviar acesso pelo WhatsApp
            </a>
          )}
          <Link href={`/admin/barbearias/${pronta.barbeariaId}`} className={s.botao}>
            Continuar a montagem
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {pendentes.length === 0 ? (
        <div className={s.vazio}>Nenhum pedido pendente. Novos pedidos de /comecar aparecem aqui.</div>
      ) : (
        <ul className={s.lista}>
          {pendentes.map((sol) => (
            <li key={sol.id} className={s.item}>
              <div className={s.itemCorpo}>
                <div className={s.itemTitulo}>{sol.nome_barbearia}</div>
                <div className={s.itemSub}>
                  {sol.nome_responsavel} · {sol.email} · {whatsappFormatado(sol.whatsapp)}
                </div>
                {sol.observacao && <div className={`${s.pequeno} ${s.fraco}`}>{sol.observacao}</div>}
              </div>
              <div className={s.linha} style={{ flexWrap: 'nowrap' }}>
                <button className={`${s.botao} ${s.fantasma} ${s.icone}`} disabled={pendente} onClick={() => recusar(sol)} aria-label={`Recusar pedido de ${sol.nome_barbearia}`}>
                  <IFechar tamanho={18} />
                </button>
                <button className={`${s.botao} ${s.primario} ${s.icone}`} disabled={pendente} onClick={() => setAprovando(sol)} aria-label={`Aprovar pedido de ${sol.nome_barbearia}`}>
                  <ICheck tamanho={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Folha aberta={aprovando !== null} titulo="Aprovar pedido" onFechar={() => setAprovando(null)}>
        {aprovando && (
          <FormAprovar
            sol={aprovando}
            onCriada={(barbeariaId, email, senha) => {
              setAprovando(null);
              setPronta({ barbeariaId, email, senha, whatsapp: aprovando.whatsapp, nome: aprovando.nome_barbearia });
            }}
          />
        )}
      </Folha>
      {aviso}
    </>
  );
}

function FormAprovar({ sol, onCriada }: { sol: Solicitacao; onCriada: (barbeariaId: string, email: string, senha: string) => void }) {
  const [nome, setNome] = useState(sol.nome_barbearia);
  const [slug, setSlug] = useState(sol.slug_desejado || slugificar(sol.nome_barbearia));
  const [whatsapp, setWhatsapp] = useState(sol.whatsapp);
  const [slugStatus, setSlugStatus] = useState<{ ok: boolean; mensagem: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  useEffect(() => {
    if (!slug) return setSlugStatus(null);
    const t = setTimeout(async () => setSlugStatus(await verificarSlug(slug)), 350);
    return () => clearTimeout(t);
  }, [slug]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await aprovarSolicitacao(sol.id, { nome, slug, whatsapp });
      if (r.ok && r.barbeariaId && r.email && r.senha) onCriada(r.barbeariaId, r.email, r.senha);
      else if (!r.ok) setErro(r.erro);
    });
  }

  return (
    <form className={s.form} onSubmit={enviar}>
      <div className={s.campo}>
        <label htmlFor="ap-nome">Nome da barbearia</label>
        <input id="ap-nome" className={s.entrada} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} required autoFocus />
      </div>
      <div className={s.campo}>
        <label htmlFor="ap-slug">Endereço do site</label>
        <input
          id="ap-slug"
          className={s.entrada}
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
        />
        <span className={s.dica} style={slugStatus ? { color: slugStatus.ok ? 'var(--ok)' : 'var(--erro)' } : undefined}>
          {slugStatus ? slugStatus.mensagem : 'Minúsculas, números e hífens.'}
        </span>
      </div>
      <div className={s.campo}>
        <label htmlFor="ap-wa">WhatsApp</label>
        <input id="ap-wa" type="tel" inputMode="numeric" className={s.entrada} value={mascaraTelefone(whatsapp)} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} />
      </div>
      <p className={`${s.pequeno} ${s.suave}`}>
        Cria a barbearia e um usuário <strong>dono</strong> com o e-mail {sol.email} e uma senha provisória, que você envia pelo WhatsApp em seguida.
      </p>
      {erro && <p className={s.alerta}>{erro}</p>}
      <button className={`${s.botao} ${s.primario}`} disabled={pendente || (slugStatus !== null && !slugStatus.ok)}>
        {pendente ? 'Criando…' : 'Aprovar e criar barbearia'}
      </button>
    </form>
  );
}
