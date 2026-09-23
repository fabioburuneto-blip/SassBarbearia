'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAviso } from '@/components/interno/Comuns';
import { ICopiar, IDownload, IExterno } from '@/components/interno/Icones';
import s from '@/components/interno/ui.module.css';
import l from '@/app/painel/link/link.module.css';

/** Link + QR code prontos para o superadmin repassar ao barbeiro assim que a montagem terminar. */
export function LinkQr({ url, slug }: { url: string; slug: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [aviso, mostrar] = useAviso();
  const exibicao = url.replace(/^https?:\/\//, '');

  useEffect(() => {
    QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }).then(setQr);
  }, [url]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      mostrar('Link copiado!');
    } catch {
      mostrar('Não foi possível copiar. Segure o link para copiar.');
    }
  }

  return (
    <section className={`${s.card} ${l.qrCard}`}>
      <div className={l.qr}>{qr ? <img src={qr} alt={`QR Code para ${exibicao}`} /> : <span className={s.girando} />}</div>
      <div className={l.qrTexto}>
        <span className={s.rotulo}>Link do site</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className={l.url}>
          {exibicao}
        </a>
        <p>Envie este link e o QR Code para o barbeiro assim que terminar a montagem.</p>
        <div className={l.acoes}>
          <button className={`${s.botao} ${s.primario}`} onClick={copiar}>
            <ICopiar tamanho={18} /> Copiar link
          </button>
          {qr && (
            <a className={s.botao} href={qr} download={`qrcode-${slug}.png`}>
              <IDownload tamanho={18} /> Baixar QR Code
            </a>
          )}
          <a className={s.botao} href={url} target="_blank" rel="noopener noreferrer">
            <IExterno tamanho={18} /> Abrir site
          </a>
        </div>
      </div>
      {aviso}
    </section>
  );
}
