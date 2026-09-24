# Banco de dados

Migrations versionadas em [`supabase/migrations`](../supabase/migrations),
aplicadas nesta ordem (o prefixo numérico garante isso):

1. `20250924120001_extensions_and_helpers.sql` — extensão `btree_gist`
   (necessária para o EXCLUDE constraint de agendamentos) e a trigger
   genérica de `updated_at`.
2. `20250924120002_schema.sql` — todas as tabelas, índices, constraints.
3. `20250924120003_membership_functions.sql` — `is_business_member()` /
   `is_business_owner()`, usadas pelas policies de RLS.
4. `20250924120004_rls.sql` — RLS habilitado + policies + grants de tabela.
5. `20250924120005_functions.sql` — trigger de criação de perfil,
   `create_business()`, `get_available_slots()`,
   `create_public_appointment()`.
6. `20250924120006_storage.sql` — bucket público `business-assets` (logo/
   capa) e suas policies.
7. `20250924130001_onboarding_fields.sql` — colunas `whatsapp`,
   `instagram`, `city`, `address` em `businesses`; função
   `is_slug_available()`; `create_business()` estendida para aceitar esses
   campos opcionais (o overload anterior de 4 argumentos é removido antes
   de recriar a função, para não deixar duas versões ambíguas instaladas).
8. `20250924140001_public_page_engine.sql` — troca `themes.font`/`layout`
   (texto livre + 2 valores) por `preset` (5 valores fixos), `sections`
   (jsonb, lista ordenada de blocos habilitados) e `gallery_urls`
   (`text[]`), para sustentar o motor de páginas públicas.
9. `20250924140002_reserve_preview_slug.sql` — adiciona `preview` à lista
   de slugs reservados em `create_business()` (a prévia autenticada vive
   em `/preview`, fora de `/dashboard`, para renderizar sem a barra
   lateral do painel).

Todas foram validadas rodando de fato contra um Postgres 16 local (schema
`auth`/`storage` mínimos simulando o que o Supabase já fornece), incluindo
os cenários de isolamento entre tenants, bloqueio de acesso anônimo direto
e prevenção de overbooking — não é só leitura de código.

## Entidades

| Tabela                  | Descrição                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`              | Espelho 1:1 de `auth.users`, criado automaticamente por trigger no signup.                                                             |
| `businesses`            | Um tenant. `slug` único, `segment` (barbearia, salão, ...), `whatsapp`/`instagram`/`city`/`address` (todos opcionais), `is_published`. |
| `business_settings`     | Config operacional 1:1 (janela de agendamento, antecedência mínima, intervalo de slots).                                               |
| `business_members`      | Quem pertence a qual empresa e com qual papel (`owner`/`staff`).                                                                       |
| `services`              | Serviços oferecidos, com duração e preço.                                                                                              |
| `professionals`         | Quem atende.                                                                                                                           |
| `professional_services` | N:N — quais serviços cada profissional realiza.                                                                                        |
| `business_hours`        | Horário de funcionamento semanal (1 linha por dia da semana).                                                                          |
| `professional_hours`    | Override opcional de horário por profissional (mesmo formato).                                                                         |
| `blocked_times`         | Bloqueios pontuais (férias, folga, feriado), por empresa ou por profissional.                                                          |
| `customers`             | Clientes, escopados por empresa (nunca compartilhados entre tenants).                                                                  |
| `appointments`          | Agendamentos. `status`: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`.                                                   |
| `themes`                | Configuração da página pública: `preset` (um dos 5 temas), cores, `sections` (blocos habilitados + ordem), `gallery_urls`.             |
| `notifications`         | Notificações internas do painel (ex: novo agendamento).                                                                                |
| `subscriptions`         | Placeholder de billing (`plan`, `status`) para integrar um gateway depois.                                                             |

Todas usam UUID (`gen_random_uuid()`), têm `created_at`/`updated_at` (com
trigger automática), e toda entidade pertencente a uma empresa tem
`business_id` com índice.

## Por que `appointments.professional_id` é obrigatório

O MVP assume que toda empresa cadastra ao menos um profissional (passo 5 do
fluxo de onboarding) antes de publicar a agenda. Isso simplifica bastante a
lógica de disponibilidade e a proteção contra overbooking: cada
agendamento é sempre de um profissional específico.

## Prevenção de overbooking

```sql
exclude using gist (
  professional_id with =,
  tstzrange(starts_at, ends_at) with &&
) where (status <> 'cancelled')
```

Isso é reforçado no banco, não só na aplicação: mesmo duas requisições
simultâneas tentando reservar o mesmo horário do mesmo profissional vão
resultar em uma única linha vencedora — a segunda recebe um erro de
exclusão, que `create_public_appointment()` converte numa mensagem
amigável ("slot is no longer available").

## Funções (RPC)

Todas em `public`, chamáveis via `supabase.rpc(...)`:

- **`create_business(p_name, p_slug, p_segment, p_timezone, p_whatsapp, p_instagram, p_city, p_address)`**
  — `SECURITY DEFINER`. Único caminho para criar uma empresa: cria o
  registro em `businesses` (com os campos opcionais de contato/localização
  coletados no onboarding), o vínculo de `owner` em `business_members`, e
  as linhas padrão de `business_settings`, `themes` e `subscriptions`,
  tudo em uma transação. Valida formato de slug, slugs reservados
  (`login`, `dashboard`, `criar-conta`, etc. — para não colidir com rotas
  do app) e segmento no próprio banco, além da validação client-side. Os 4
  últimos parâmetros são opcionais (default `null`), então o mesmo
  `p_name, p_slug, p_segment, p_timezone` de antes continua funcionando.
- **`is_slug_available(p_slug)`** — `SECURITY DEFINER`, chamável por
  `anon`. Checa se um slug já está em uso, direto no banco, ignorando o
  RLS de `businesses` (que esconderia empresas não publicadas de um select
  comum e faria a checagem mentir sobre disponibilidade). Usada pelo
  wizard de onboarding para validar o passo do slug antes de confirmar a
  criação.
- **`get_available_slots(p_business_slug, p_service_id, p_professional_id, p_date)`**
  — `SECURITY DEFINER`, chamável por `anon`. Calcula os horários
  disponíveis considerando `professional_hours` (com fallback para
  `business_hours`), `blocked_times`, agendamentos existentes, antecedência
  mínima e janela máxima de agendamento — sem nunca expor essas tabelas
  diretamente ao cliente anônimo.
- **`create_public_appointment(...)`** — `SECURITY DEFINER`, chamável por
  `anon`. Único caminho para um visitante criar um agendamento: revalida
  tudo (empresa publicada, serviço/profissional pertencem a ela e estão
  ativos, profissional realiza o serviço, horário respeita antecedência
  mínima/janela máxima/bloqueios), cria ou atualiza o cliente por telefone,
  insere o agendamento e uma notificação interna.

## `themes.sections`

Lista jsonb ordenada — a ordem do array é a ordem de exibição na página
pública. Cada item é `{"key": "...", "enabled": true|false}`, com `key`
em `hero`, `about`, `services`, `team`, `gallery`, `booking`, `location`,
`social`, `footer` (ver `src/lib/themes/sections.ts`, a mesma lista usada
no app). Não há constraint de banco validando o conteúdo — quem grava
(sempre `/dashboard/personalizacao`, nunca o cliente diretamente) já
passa por `normalizeSections()` no servidor antes do `update`, que
garante presença de cada chave conhecida exatamente uma vez e descarta
chaves desconhecidas.

## Gerando tipos TypeScript

`src/types/database.ts` é escrito à mão para refletir este schema. Se você
tiver o Supabase CLI configurado, prefira gerar a partir do banco real:

```bash
supabase gen types typescript --local > src/types/database.ts
```
