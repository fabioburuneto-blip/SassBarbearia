import type { Metadata } from 'next';
import { exigirDono } from '@/lib/sessao';
import { supabaseServidor } from '@/lib/supabase';
import { diaSP, inicioDoDia, somarDias } from '@/lib/datas';
import { preco, precoCurto } from '@/lib/formatar';
import s from '@/components/interno/ui.module.css';

export const metadata: Metadata = { title: 'Financeiro' };

type PorProfissional = {
  profissional_id: string;
  nome: string;
  atendimentos: number;
  faturamento: number;
  comissao_percentual: number;
  comissao_valor: number;
};

type Resumo = { faturamento_total: number; atendimentos_total: number; por_profissional: PorProfissional[] };

function limiteMes(hoje: string): { inicio: string; fim: string } {
  const [ano, mes] = hoje.slice(0, 7).split('-').map(Number);
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  return { inicio, fim };
}

export default async function PaginaFinanceiro() {
  await exigirDono();
  const hoje = diaSP();
  const { inicio: inicioMes, fim: fimMes } = limiteMes(hoje);
  const sb = await supabaseServidor();

  const [{ data: doDia }, { data: doMes }] = await Promise.all([
    sb.rpc('financeiro_resumo', { p_inicio: inicioDoDia(hoje), p_fim: inicioDoDia(somarDias(hoje, 1)) }),
    sb.rpc('financeiro_resumo', { p_inicio: inicioDoDia(inicioMes), p_fim: inicioDoDia(fimMes) }),
  ]);

  const dia = (doDia ?? { faturamento_total: 0, atendimentos_total: 0, por_profissional: [] }) as Resumo;
  const mes = (doMes ?? { faturamento_total: 0, atendimentos_total: 0, por_profissional: [] }) as Resumo;
  const comissaoTotalMes = mes.por_profissional.reduce((t, p) => t + Number(p.comissao_valor), 0);

  return (
    <>
      <div className={s.cabecalho}>
        <div>
          <h1 className={s.titulo}>Financeiro</h1>
          <p className={s.sub}>Faturamento e comissão dos atendimentos concluídos.</p>
        </div>
      </div>

      <div className={s.stats} style={{ marginBottom: 22 }}>
        <div className={s.stat}>
          <div className={s.statRotulo}>Hoje</div>
          <div className={s.statValor}>{precoCurto(dia.faturamento_total)}</div>
          <div className={`${s.pequeno} ${s.fraco}`}>{dia.atendimentos_total} {dia.atendimentos_total === 1 ? 'atendimento' : 'atendimentos'}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statRotulo}>Este mês</div>
          <div className={s.statValor}>{precoCurto(mes.faturamento_total)}</div>
          <div className={`${s.pequeno} ${s.fraco}`}>{mes.atendimentos_total} {mes.atendimentos_total === 1 ? 'atendimento' : 'atendimentos'}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statRotulo}>Comissões do mês</div>
          <div className={s.statValor}>{precoCurto(comissaoTotalMes)}</div>
          <div className={`${s.pequeno} ${s.fraco}`}>a pagar à equipe</div>
        </div>
      </div>

      <h2 className={s.secaoTitulo}>Por profissional (este mês)</h2>
      {mes.por_profissional.length === 0 ? (
        <div className={s.vazio}>Nenhum atendimento concluído neste mês ainda.</div>
      ) : (
        <ul className={s.lista}>
          {mes.por_profissional.map((p) => (
            <li key={p.profissional_id} className={s.item}>
              <div className={s.itemCorpo}>
                <div className={s.itemTitulo}>{p.nome}</div>
                <div className={`${s.pequeno} ${s.fraco}`}>
                  {p.atendimentos} {p.atendimentos === 1 ? 'atendimento' : 'atendimentos'} · {preco(p.faturamento)} faturado
                  {p.comissao_percentual > 0 && ` · comissão ${p.comissao_percentual}%`}
                </div>
              </div>
              {p.comissao_percentual > 0 && (
                <strong className={s.num} style={{ color: 'var(--ok)' }}>
                  {preco(p.comissao_valor)}
                </strong>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
