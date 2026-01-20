import { Header } from '@/components/shared';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gemma | Home',
  description: 'Pizzeria gemma',
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-white">
      <Header hasSearch />
      {children}
      {modal ?? null}
    </main>
  );
}
