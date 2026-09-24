import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

/** true quando o host é o app em si (não um domínio próprio de barbearia). */
function ehDominioDoApp(host: string): boolean {
  let siteUrl: string | undefined;
  try {
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.toLowerCase() : undefined;
  } catch {
    siteUrl = undefined;
  }
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app') || (!!siteUrl && host === siteUrl);
}

/**
 * Domínio próprio (plano premium): "neguinbarbershop.com.br" na barra de endereço
 * mostra o mesmo conteúdo que "app.../neguin-barbershop", sem o cliente notar a troca.
 */
async function reescreverDominioProprio(request: NextRequest): Promise<NextResponse | null> {
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;
  if (!host || ehDominioDoApp(host) || pathname.startsWith('/painel') || pathname.startsWith('/admin') || pathname.startsWith('/entrar')) {
    return null;
  }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: slug } = await sb.rpc('barbearia_por_dominio', { p_dominio: host });
  if (!slug) return null;
  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

/**
 * Renova a sessão do Supabase (cookies) nas áreas logadas e faz o redirecionamento
 * otimista para /entrar. A autorização de verdade (papel, barbearia) é feita nas
 * páginas e Server Actions, e o RLS do banco garante o isolamento.
 */
export async function proxy(request: NextRequest) {
  const reescrita = await reescreverDominioProprio(request);
  if (reescrita) return reescrita;

  const { pathname } = request.nextUrl;
  const areaLogada = pathname.startsWith('/painel') || pathname.startsWith('/admin');
  // Site público (maioria das visitas): nada de sessão a renovar, evita uma chamada à toa.
  if (!areaLogada && pathname !== '/entrar') return NextResponse.next();

  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (areaLogada && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.search = `?proximo=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return resposta;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
