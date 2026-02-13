'use client';
import { cn } from '@/lib/utils';
import { ExternalLink, MapPin } from 'lucide-react';

interface Props {
  className?: string;

  storeInfo?: {
    address: string;
    storeName?: string;
  };
}

export const PickupLocationCard = ({ className, storeInfo }: Props) => {
  // 🛡️ Fallback (на случай если база не отдала адрес)
  const address = storeInfo?.address || 'Viale Roma, 15, 30020 Torre di Mosto VE';
  const storeName = storeInfo?.storeName || 'Pizza Gemma';

  // 🔥 ХИТРОСТЬ: Ищем "Имя + Адрес"
  // Это заставит Google Maps открыть именно карточку бизнеса, а не просто точку на улице
  const searchQuery = `${storeName} ${address}`;

  // 🌍 Генерируем ссылку динамически
  // const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=Viale+Roma+15+30020+Torre+di+Mosto+VE?q=${encodeURIComponent(searchQuery)}`;
  // Формируем запрос

  // ✅ ПРАВИЛЬНЫЙ URL: без дублей '?' и 'q='
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  return (
    <div className={cn('p-4 bg-orange-50 border border-orange-200 rounded-lg', className)}>
      <div className="flex  items-center justify-center gap-3">
        {/* icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center ">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        {/* text */}
        <div className="flex-1 ">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            // className="group block"
            className="text-sm text-brand-primary hover:text-brand-hover font-medium  flex flex-col items-start gap-1"
          >
            <p className="text-sm font-medium text-gray-900 mb-1 ">Ritira il tuo ordine presso:</p>
            <p className="flex items-center gap-3">
              {address}
              <ExternalLink className="w-3 h-3" />
            </p>
            <p className="text-xs text-gray-500 mt-1">Clicca per aprire in Google Maps</p>
          </a>
        </div>
      </div>
    </div>
  );
};
