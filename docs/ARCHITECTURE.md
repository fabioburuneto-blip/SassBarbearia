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
│   ├── personalizacao/             # logo, capa, galeria, tema, seções (ver abaixo)
│   └── settings/                    # dados administrativos, publicação
├── preview/                  # prévia autenticada da página pública (sem sidebar)
└── [slug]/
    ├── page.tsx               # página pública real (dados via RLS pública)
    └── booking-widget.tsx     # fluxo de agendamento (client component)

src/components/public/        # motor de renderização da página pública
├── public-page.tsx            # entrada: fontes + banner de prévia + ThemeRenderer
├── theme-renderer.tsx          # aplica preset/cores, itera as seções habilitadas
├── section-heading.tsx
├── types.ts                     # PublicBusiness (campos públicos), PublicPageData
└── sections/                     # um componente por bloco (hero, about, services, ...)

src/lib/themes/                # dados que o motor consome
├── presets.ts                  # 5 presets (tipografia, raio, cards, botões, hero)
├── fonts.ts                     # next/font/google, uma vez, para todos os presets
└── sections.ts                   # registro de blocos + normalize/toggle/move
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
   2. Instagram (opcional) · 5. Cidade/endereço (opcional) ·
   3. Slug público (sugerido a partir do nome, checado ao vivo via
      `is_slug_available()`) · 7. Tema inicial (presets de cor) ·
   4. Primeiros serviços (opcional) · 9. Horário de funcionamento
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
     `/dashboard/personalizacao`, `/dashboard/services` e
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

## Motor de páginas públicas

Cada empresa tem uma página própria, mas **não existe um componente de
página por cliente** — todas passam pelo mesmo motor, configurado por
dados guardados em `themes` (preset, cores, seções habilitadas/ordem,
galeria) e nos campos públicos de `businesses`.

- **`ThemeRenderer`** (`src/components/public/theme-renderer.tsx`) lê
  `theme.preset` (um dos 5 em `src/lib/themes/presets.ts`: Premium,
  Moderno, Minimalista, Barbearia, Elegante — cada um com sua tipografia,
  espaçamento, estilo de card/botão, raio de borda e composição de hero) e
  a lista ordenada `theme.sections`, e despacha cada seção habilitada, na
  ordem configurada, para o componente correspondente em
  `src/components/public/sections/`: `HeroSection`, `AboutSection`,
  `ServicesSection`, `TeamSection`, `GallerySection`, `BookingCTA`,
  `LocationSection`, `SocialSection`, `FooterSection`. `hero` e `footer`
  são sempre exibidas; as demais podem ser desligadas ou reordenadas em
  `/dashboard/personalizacao`.
- **`PublicPage`** é a entrada compartilhada: carrega as fontes de todos
  os presets uma única vez (`next/font/google`, ver `src/lib/themes/fonts.ts`
  — precisa de imports estáticos, então todo preset carrega junto; cada
  um só referencia sua própria variável CSS) e envolve o `ThemeRenderer`.
  É usada tanto por `/[slug]` (página real) quanto por `/preview`
  (prévia autenticada) — o mesmo componente, os mesmos dados, então a
  prévia nunca diverge do que vai para o ar.
- **`buildPublicPageData`** (`src/lib/public-page-data.ts`) monta o payload
  (`business`, `theme` normalizado, `services`, `professionals`) a partir
  de um `business_id` já resolvido, reaproveitado por `/[slug]` (que filtra
  `is_published = true` e só seleciona colunas públicas) e por `/preview`
  (que ignora `is_published`, já que é o próprio dono vendo o rascunho).
- **`PublicBusiness`** (`src/components/public/types.ts`) é o único
  formato de empresa que entra nesses componentes — nunca o `businesses`
  Row inteiro. Isso importa porque Server Components serializam qualquer
  objeto passado para um Client Component (como `BookingWidget`) no
  payload da página, campos não usados incluídos; sem esse recorte,
  `owner_id`, `email`, `phone` e `is_published` vazariam para o HTML/JS
  entregue ao navegador mesmo sem aparecer na tela.
- **Cores** (`primary_color`/`secondary_color`) são independentes do
  preset: viram variáveis CSS (`--brand-primary`/`--brand-secondary`) no
  wrapper do `ThemeRenderer`, e cada preset expõe `bodyAccentVar` para
  dizer qual das duas usar em elementos de destaque fora do hero (o preset
  Barbearia, com fundo escuro em toda a página, aponta para a cor
  secundária — usar sempre a primária faria botões escuros
  desaparecerem contra um fundo também escuro).
- **Agendamento**: o widget de agendamento chama diretamente, do
  navegador, as RPCs públicas `get_available_slots` e
  `create_public_appointment` — ambas `SECURITY DEFINER`, então todo o
  negócio (validar que o serviço pertence à empresa do slug, respeitar
  horários/bloqueios/antecedência mínima, impedir overbooking) é resolvido
  no Postgres, nunca confiando em nada que o cliente tenha enviado além do
  slug + ids escolhidos na UI. Em `/preview`, o mesmo `BookingWidget` roda
  com `previewMode`: a busca de horários continua real (é só leitura),
  mas o envio final é interceptado antes de chamar
  `create_public_appointment`, então uma prévia nunca cria um agendamento
  de verdade.
- **SEO**: `generateMetadata` em `/[slug]/page.tsx` gera `title`,
  `description` e Open Graph/Twitter Card a partir do nome, descrição e
  capa/logo da empresa.

## Multi-tenant, hoje e amanhã

- Hoje: 1 owner + N staff por empresa (`business_members.role`).
- Preparado para amanhã: um mesmo `user_id` pode pertencer a múltiplas
  empresas (a unique constraint é `(business_id, user_id)`, não
  `(user_id)`), e novos papéis (`gerente`, `administrador`) só exigem
  estender o `check` de `role` e as policies que hoje distinguem apenas
  `owner`/`staff`.
