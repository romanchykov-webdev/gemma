import { Button } from '@/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Clock, ExternalLink, Flame, MapPin, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OrderStatusData } from './order-status-data';
import { StatusCard } from './status-card';

export const StatusBlock = ({ data }: { data: OrderStatusData }) => {
  const router = useRouter();
  return (
    <AnimatePresence mode="wait">
      {/* 1. PENDING */}
      {data.status === 'PENDING' && (
        <StatusCard
          key="pending"
          icon={<Clock className="w-16 h-16 text-yellow-500" />}
          title="In attesa di conferma"
          description="Il ristorante sta ricevendo il tuo ordine."
          color="bg-white border-yellow-400"
          textColor="text-yellow-700"
        >
          <div className="flex items-center gap-2 justify-center mt-4 text-yellow-600 bg-yellow-50 py-2 px-4 rounded-full text-sm font-medium animate-pulse">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            Connessione con la pizzeria...
          </div>
        </StatusCard>
      )}

      {/* 2. PROCESSING */}
      {data.status === 'PROCESSING' && (
        <StatusCard
          key="processing"
          icon={
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flame className="w-20 h-20 text-orange-500" />
            </motion.div>
          }
          title="Stiamo cucinando!"
          description="I nostri chef sono all'opera."
          color="bg-white border-orange-200"
          textColor="text-neutral-900"
          shadow="shadow-orange-100"
        >
          {data.expectedReadyAt ? (
            <div className="mt-6 flex flex-col items-center">
              <div className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-1">
                Pronto stimato alle
              </div>
              <div className="text-5xl font-black text-neutral-900 tabular-nums tracking-tighter">
                {new Date(data.expectedReadyAt).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Rome',
                })}
              </div>
              <div className="mt-2 text-orange-500 text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Circa{' '}
                {Math.max(
                  0,
                  Math.ceil((new Date(data.expectedReadyAt).getTime() - Date.now()) / 60000),
                )}{' '}
                min rimanenti
              </div>
            </div>
          ) : (
            <div className="mt-4 text-orange-600 font-medium">Calcolo del tempo in corso...</div>
          )}
        </StatusCard>
      )}

      {/* 3. READY (Pickup vs Delivery) */}
      {data.status === 'READY' &&
        (data.deliveryType === 'pickup' ? (
          <StatusCard
            key="ready-pickup"
            icon={
              <div className="bg-green-100 p-4 rounded-full">
                <Check className="w-12 h-12 text-green-600" />
              </div>
            }
            title="Vieni a ritirare!"
            description="Il tuo ordine ti aspetta caldo e fumante al bancone."
            color="bg-white border-green-200"
            textColor="text-neutral-900"
            shadow="shadow-green-100"
          >
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center ">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Viale+Roma,+15,+30020+Torre+di+Mosto+VE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-orange-700 font-medium flex flex-col items-start gap-1"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Ritira il tuo ordine presso:
                    </p>
                    <p className="flex items-center gap-3 text-left">
                      Viale Roma, 15, 30020 Torre di Mosto VE
                      <ExternalLink className="w-3 h-3" />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Clicca per aprire in Google Maps</p>
                  </a>
                </div>
              </div>
            </div>
          </StatusCard>
        ) : (
          <StatusCard
            key="ready-delivery"
            icon={
              <div className="bg-green-100 p-4 rounded-full">
                <Truck className="w-12 h-12 text-green-600" />
              </div>
            }
            title="In consegna!"
            description="Il corriere ha preso il tuo ordine e sta arrivando da te."
            color="bg-white border-green-200"
            textColor="text-neutral-900"
            shadow="shadow-green-100"
          >
            {data.address && (
              <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-neutral-500 font-medium mb-1">Destinazione:</p>
                    <p className="text-base font-semibold text-neutral-900 leading-tight">
                      {data.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </StatusCard>
        ))}

      {/* 4. CANCELLED */}
      {data.status === 'CANCELLED' && (
        <StatusCard
          key="cancelled"
          icon={
            <div className="bg-red-100 p-4 rounded-full">
              <ArrowRight className="w-12 h-12 text-red-600 rotate-45" />
            </div>
          }
          title="Ordine Annullato"
          description="Ci dispiace, qualcosa è andato storto."
          color="bg-white border-red-200"
          textColor="text-red-900"
        >
          <Button onClick={() => router.push('/')} variant="default" className="mt-6">
            Torna al menu
          </Button>
        </StatusCard>
      )}
    </AnimatePresence>
  );
};
