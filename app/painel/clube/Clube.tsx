'use client';

import { useState, useTransition } from 'react';
import { preco } from '@/lib/formatar';
import type { PlanoClube } from '@/lib/painel-tipos';
import { alternarPlano, salvarPlano } from './acoes';
import { Chave, Folha, useAviso } from '@/components/interno/Comuns';
import { ILapis, IMais } from '@/components/interno/Icones';
import s from '@/components/interno/ui.module.css';

/** "55,00" / "55" / "55.5" → 55.5 */
const lerPreco = (v: string) => Number(v.replace(/\s|R\$/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));

export function Clube({ planos }: { planos: PlanoClube[] }) {
  const [editando, setEditando] = useState<PlanoClube | 'novo' | null>(null);
  const [pendente, iniciar] = useTransition();
  const [aviso, mostrar] = useAviso();

  function alternar(pl: PlanoClube, ativo: boolean) {
    iniciar(async () => {
      const r = await alternarPlano(pl.id, ativo);
      mostrar(r.ok ? (ativo ? `${pl.nome} ativado` : `${pl.nome} desativado`) : r.erro);
    });
  }

  return (
    <>
      <div className={s.cabecalho}>
        <div>
          <h1 className={s.titulo}>Clube de assinatura</h1>
          <p className={s.sub}>Planos mensais aparecem no site, com botão para o cliente falar com você pelo WhatsApp.</p>
        </div>
        <button className={`${s.botao} ${s.primario}`} onClick={() => setEditando('novo')}>
          <IMais tamanho={18} /> Novo plano
        </button>
      </div>

      {planos.length === 0 ? (
        <div className={s.vazio}>
          Nenhum plano ainda. Crie um, por exemplo <strong>&ldquo;Corte ilimitado&rdquo;</strong> por R$ 99/mês.
        </div>
      ) : (
        <ul className={s.lista}>
          {planos.map((pl) => (
            <li key={pl.id} className={`${s.item} ${pl.ativo ? '' : s.itemInativo}`}>
              <div className={s.itemCorpo}>
                <div className={s.itemTitulo}>{pl.nome}</div>
                <div className={s.itemSub}>
                  <span className={s.num}>{preco(pl.preco)}</span>/mês · {pl.creditos_mes} {pl.creditos_mes === 1 ? 'crédito' : 'créditos'}
                  {!pl.ativo && ' · inativo'}
                </div>
              </div>
              <Chave ligada={pl.ativo} onMudar={(v) => alternar(pl, v)} rotulo={`${pl.ativo ? 'Desativar' : 'Ativar'} ${pl.nome}`} desabilitada={pendente} />
              <button className={`${s.botao} ${s.fantasma} ${s.icone}`} onClick={() => setEditando(pl)} aria-label={`Editar ${pl.nome}`}>
                <ILapis tamanho={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Folha aberta={editando !== null} titulo={editando === 'novo' ? 'Novo plano' : 'Editar plano'} onFechar={() => setEditando(null)}>
        {editando !== null && (
          <FormPlano
            plano={editando === 'novo' ? null : editando}
            onSalvo={(t) => {
              setEditando(null);
              mostrar(t);
            }}
          />
        )}
      </Folha>
      {aviso}
    </>
  );
}

function FormPlano({ plano, onSalvo }: { plano: PlanoClube | null; onSalvo: (t: string) => void }) {
  const [nome, setNome] = useState(plano?.nome ?? '');
  const [descricao, setDescricao] = useState(plano?.descricao ?? '');
  const [valor, setValor] = useState(plano ? String(plano.preco).replace('.', ',') : '');
  const [creditos, setCreditos] = useState(String(plano?.creditos_mes ?? 4));
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await salvarPlano({ id: plano?.id, nome, descricao, preco: lerPreco(valor), creditos_mes: Number(creditos) });
      if (r.ok) onSalvo(plano ? 'Plano atualizado' : 'Plano criado');
      else setErro(r.erro);
    });
  }

  return (
    <form className={s.form} onSubmit={salvar}>
      <div className={s.campo}>
        <label htmlFor="pl-nome">Nome</label>
        <input id="pl-nome" className={s.entrada} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} required autoFocus placeholder="Corte ilimitado" />
      </div>
      <div className={`${s.grade} ${s.grade2}`}>
        <div className={s.campo}>
          <label htmlFor="pl-preco">Preço mensal (R$)</label>
          <input id="pl-preco" className={s.entrada} inputMode="decimal" placeholder="99,00" value={valor} onChange={(e) => setValor(e.target.value)} required />
        </div>
        <div className={s.campo}>
          <label htmlFor="pl-creditos">Créditos por mês</label>
          <input id="pl-creditos" className={s.entrada} type="number" inputMode="numeric" min={1} max={999} value={creditos} onChange={(e) => setCreditos(e.target.value)} required />
        </div>
      </div>
      <div className={s.campo}>
        <label htmlFor="pl-desc">Descrição (opcional)</label>
        <textarea id="pl-desc" className={s.entrada} maxLength={300} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Aparece no site, abaixo do preço." />
      </div>
      {erro && <p className={s.alerta}>{erro}</p>}
      <button className={`${s.botao} ${s.primario}`} disabled={pendente}>
        {pendente ? 'Salvando…' : 'Salvar'}
      </button>
    </form>
  );
}
