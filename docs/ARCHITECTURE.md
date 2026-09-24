# Arquitetura

## Visão geral

O produto tem três áreas, todas servidas pelo mesmo app Next.js (App Router):

1. **Site institucional** — `/` — apresentação do produto, login e cadastro.
2. **Dashboard do empresário** — `/dashboard/*` — painel autenticado, sempre
   escopado à empresa do usuário logado.
3. **Página pública de cada negócio** — `/[slug]` — vitrine + agendamento,
   sem autenticação.

```
src/app/
├── page.tsx                 # site institucional
├── login/ criar-conta/      # autenticação (Supabase Auth)
├── auth/confirm/route.ts    # callback de confirmação de email
├── onboarding/               # wizard de criação da empresa (9 passos)
│   ├── onboarding-wizard.tsx  # orquestra o estado do wizard
│   └── steps/                  # um componente por passo
├── dashboard/
│   ├── layout.tsx            # resolve a empresa do usuário logado, sidebar
│   ├── page.tsx               # visão geral
│   ├── appointments/          # agenda (lista por dia + ações de status)
│   ├── services/               # CRUD de serviços
│   ├── professionals/          # CRUD de profissionais + vínculo com serviços
│   ├── customers/               # CRUD de clientes
│   ├── hours/                    # horário de funcionamento (semanal)
│   ├── blocked-times/             # bloqueios/folgas
│   ├── customization/              # logo, capa, cores, layout
│   └── settings/                    # dados da empresa, publicação
└── [slug]/
    ├── page.tsx               # página pública (dados via RLS pública)
    └── booking-widget.tsx     # fluxo de agendamento (client component)
```

## Por que não há `/[slug]` nas rotas do dashboard

Cada usuário autenticado gerencia **uma** empresa (a modelagem já suporta
múltiplas empresas por usuário via `business_members`, mas o MVP resolve a
"empresa atual" do usuário logado no servidor, em
[`src/lib/auth.ts`](../src/lib/auth.ts) → `getCurrentBusiness()`). Isso
evita expor o id/slug da empresa na URL do dashboard e simplifica todo o
roteamento. Uma futura tela de "trocar de empresa" pode ser adicionada sem
quebrar nada, já que o schema já suporta N:N entre `profiles` e
`businesses` através de `business_members`.

## Camadas de dados

- **Server Components** fazem a maior parte das leituras, usando o cliente
  Supabase server-side (`src/lib/supabase/server.ts`), que propaga a sessão
  via cookies.
- **Server Actions** (`actions.ts` ao lado de cada página) fazem todas as
  escritas autenticadas (dashboard). Elas nunca recebem `business_id` do
  cliente: sempre re-derivam a empresa a partir da sessão
  (`getCurrentBusiness()`), e todo `.eq("business_id", business.id)` é
  redundante de propósito — é defesa em profundidade além do RLS.
- **RPCs Postgres `SECURITY DEFINER`** (`create_business`,
  `get_available_slots`, `create_public_appointment`) cobrem os únicos casos
  em que um visitante anônimo precisa escrever ou ler dados agregados sem
  ter uma linha própria em `business_members`. Veja
  [`DATABASE.md`](./DATABASE.md).
- **Row Level Security** é a fonte de verdade final para isolamento entre
  tenants — veja [`SECURITY.md`](./SECURITY.md).

## Autenticação e onboarding

Supabase Auth (email + senha, com confirmação por email). O fluxo:

1. `/criar-conta` → `supabase.auth.signUp()` → email de confirmação.
2. Link do email → `/auth/confirm` (Route Handler) → `verifyOtp()` → sessão
   criada → redireciona para `/onboarding`.
3. `/onboarding` é um wizard de 9 passos (`onboarding-wizard.tsx` orquestra
   o estado; cada passo é um componente em `steps/`):
   1. Nome da empresa · 2. Segmento · 3. WhatsApp (opcional) ·
   4. Instagram (opcional) · 5. Cidade/endereço (opcional) ·
   6. Slug público (sugerido a partir do nome, checado ao vivo via
   `is_slug_available()`) · 7. Tema inicial (presets de cor) ·
   8. Primeiros serviços (opcional) · 9. Horário de funcionamento
   (pré-preenchido com um padrão razoável).
   - Os passos 1–5 só existem em estado local do React — nada é gravado
     até o passo 6 ser confirmado.
   - Confirmar o passo 6 chama `createBusinessAction()`, que é o único
     lugar que invoca a RPC `create_business()` — cria a empresa, o
     vínculo de owner, as configurações, o tema e a assinatura padrão numa
     única transação.
   - Os passos 7–9 já operam sobre a empresa recém-criada e **reutilizam
     as mesmas server actions do dashboard** (`updateTheme`,
     `createService`, `saveBusinessHours`) em vez de duplicar lógica —
     tudo que é configurado ali já aparece depois em
     `/dashboard/customization`, `/dashboard/services` e
     `/dashboard/hours`.
   - Não há como voltar do passo 7 para os passos 1–6: a empresa já foi
     criada, então "voltar" ali reabriria o formulário de criação e
     poderia disparar uma segunda chamada a `create_business()`.
   - Ao final, uma tela de sucesso mostra o link público, com atalhos
     para ver a página, ir ao painel ou copiar o link.
4. `src/proxy.ts` (Next.js 16 renomeou `middleware.ts` → `proxy.ts`) mantém
   a sessão viva em toda navegação.

### Guarda de rotas

- Não autenticado → `/dashboard` e `/onboarding` redirecionam para
  `/login` (`requireUser()` em `src/lib/auth.ts`).
- Autenticado sem empresa → `/dashboard` redireciona para `/onboarding`
  (`getCurrentBusiness()`); e `/onboarding` fica acessível normalmente.
- Autenticado com empresa → `/onboarding` redireciona direto para
  `/dashboard` (não é possível reabrir o wizard de criação).

## Página pública e agendamento

A página `/[slug]` só lê dados via as policies públicas do RLS (empresa
publicada, serviços/profissionais ativos, tema, horários). O widget de
agendamento chama diretamente, do navegador, as RPCs públicas
`get_available_slots` e `create_public_appointment` — ambas
`SECURITY DEFINER`, então todo o negócio (validar que o serviço pertence à
empresa do slug, respeitar horários/bloqueios/antecedência mínima, impedir
overbooking) é resolvido no Postgres, nunca confiando em nada que o cliente
tenha enviado além do slug + ids escolhidos na UI.

## Multi-tenant, hoje e amanhã

- Hoje: 1 owner + N staff por empresa (`business_members.role`).
- Preparado para amanhã: um mesmo `user_id` pode pertencer a múltiplas
  empresas (a unique constraint é `(business_id, user_id)`, não
  `(user_id)`), e novos papéis (`gerente`, `administrador`) só exigem
  estender o `check` de `role` e as policies que hoje distinguem apenas
  `owner`/`staff`.
