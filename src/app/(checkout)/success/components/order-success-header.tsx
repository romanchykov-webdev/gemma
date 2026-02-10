import { motion } from 'framer-motion';
import { OrderStatusData } from './order-status-data';

export const OrderSuccessHeader = ({ data }: { data: OrderStatusData }) => {
  const getTitle = () => {
    if (data.status === 'READY') return 'Tutto pronto! 🍕';
    if (data.status === 'CANCELLED') return 'Ordine Annullato ❌';
    return "Grazie per l'ordine!";
  };

  const getSubtitle = () => {
    if (data.status === 'READY') {
      return data.deliveryType === 'pickup'
        ? 'Corri a ritirare la tua pizza.'
        : 'Mettiti comodo, stiamo arrivando!';
    }
    if (data.status === 'CANCELLED') return 'Se è un errore, contattaci subito.';
    return 'Rilassati, ci pensiamo noi.';
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">{getTitle()}</h1>
      <p className="text-neutral-500 text-lg">{getSubtitle()}</p>
    </motion.div>
  );
};
