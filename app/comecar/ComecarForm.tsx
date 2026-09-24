'use client';

import { useState, useTransition } from 'react';
import { mascaraTelefone } from '@/lib/agendamento';
import { enviarSolicitacao } from './acoes';
import { ICheck, ILoja } from '@/components/interno/Icones';
import s from '@/components/interno/ui.module.css';
import c from './comecar.module.css';

export function ComecarForm() {
  const [nomeBarbearia, setNomeBarbearia] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [pendente, iniciar] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await enviarSolicitacao({ nomeBarbearia, nomeResponsavel, email, whatsapp, observacao });
      if (r.ok) setEnviado(true);
      else setErro(r.erro);
    });
  }

  if (enviado) {
    return (
      <div className={`${s.raiz} ${c.pagina}`}>
        <style>{'html,body{background:#0b0d10}'}</style>
        <main className={c.caixa} style={{ textAlign: 'center' }}>
          <span className={c.logo} style={{ margin: '0 auto 20px', color: 'var(--ok)' }}>
            <ICheck tamanho={26} />
          </span>
          <h1 className={s.titulo}>Pedido enviado!</h1>
          <p className={s.sub}>Vamos entrar em contato pelo WhatsApp para combinar a montagem do seu site.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`${s.raiz} ${c.pagina}`}>
      <style>{'html,body{background:#0b0d10}'}</style>
      <main className={c.caixa}>
        <span className={c.logo}>
          <ILoja tamanho={26} />
        </span>
        <h1 className={s.titulo}>Coloque sua barbearia online</h1>
        <p className={s.sub}>Preencha seus dados e a gente monta seu site, com agenda online e tudo.</p>

        <form className={`${s.form} ${c.form}`} onSubmit={enviar}>
          <div className={s.campo}>
            <label htmlFor="cm-barbearia">Nome da barbearia</label>
            <input id="cm-barbearia" className={s.entrada} value={nomeBarbearia} onChange={(e) => setNomeBarbearia(e.target.value)} maxLength={80} required autoFocus />
          </div>
          <div className={s.campo}>
            <label htmlFor="cm-nome">Seu nome</label>
            <input id="cm-nome" className={s.entrada} value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} maxLength={80} required />
          </div>
          <div className={`${s.grade} ${s.grade2}`}>
            <div className={s.campo}>
              <label htmlFor="cm-email">E-mail</label>
              <input id="cm-email" type="email" inputMode="email" autoCapitalize="none" className={s.entrada} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={s.campo}>
              <label htmlFor="cm-wa">WhatsApp</label>
              <input id="cm-wa" type="tel" inputMode="numeric" placeholder="(11) 91234-5678" className={s.entrada} value={mascaraTelefone(whatsapp)} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} required />
            </div>
          </div>
          <div className={s.campo}>
            <label htmlFor="cm-obs">Conte um pouco (opcional)</label>
            <textarea id="cm-obs" className={s.entrada} maxLength={300} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Quantos profissionais, se já tem tabela de preços, etc." />
          </div>
          {erro && (
            <p className={s.alerta} role="alert">
              {erro}
            </p>
          )}
          <button className={`${s.botao} ${s.primario} ${s.largo}`} disabled={pendente}>
            {pendente ? 'Enviando…' : 'Quero minha barbearia online'}
          </button>
        </form>
      </main>
    </div>
  );
}
