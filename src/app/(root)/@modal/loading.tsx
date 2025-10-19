import { Loader2 } from 'lucide-react';

export default function LoadingAnyModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Loader2 className="text-yellow-500 animate-spin" size={50} />
    </div>
  );
}
