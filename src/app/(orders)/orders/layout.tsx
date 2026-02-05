import { Header } from '@/components/shared';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gemma Pizza | Gestione Ordini',
  description: 'Gestione ordini della pizzeria Gemma',
};
export default function DashBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <Header hasSearch={false} hasCart={false} />
      {children}
    </main>
  );
}
