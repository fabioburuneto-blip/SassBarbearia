import type { Metadata, Viewport } from 'next';
import { ComecarForm } from './ComecarForm';

export const metadata: Metadata = { title: 'Comece agora' };
export const viewport: Viewport = { themeColor: '#0b0d10' };

export default function Comecar() {
  return <ComecarForm />;
}
