// Domínio próprio (plano premium): "neguinbarbershop.com.br", sem protocolo nem barra.

const FORMATO = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export function normalizarDominio(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

/** Mensagem de erro ou null se o formato for válido (string vazia é válida: sem domínio próprio). */
export function validarDominio(v: string): string | null {
  if (!v) return null;
  if (v.length > 253 || !FORMATO.test(v)) return 'Informe um domínio válido, sem "http://" nem barras (ex.: barbearia.com.br).';
  return null;
}
