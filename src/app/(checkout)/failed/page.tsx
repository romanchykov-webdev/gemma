import Link from 'next/link';

export default function CheckoutFailPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-3">Pagamento non completato</h1>
      <p className="text-neutral-600 mb-6">
        Sembra che il pagamento sia stato annullato o si sia verificato un errore. Riprova.
      </p>

      <div className="flex gap-3">
        <Link href="/checkout" className="px-5 py-3 rounded-xl bg-black text-white">
          Torna al checkout
        </Link>
        <Link href="/" className="px-5 py-3 rounded-xl border">
          Alla home
        </Link>
      </div>
    </div>
  );
}
