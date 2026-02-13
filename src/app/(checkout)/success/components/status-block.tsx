'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { OrderStatusData } from './order-status-data';
import { CancelledStatus } from './status-cards/cancelled-status';
import { PendingStatus } from './status-cards/pending-status';
import { ProcessingStatus } from './status-cards/processing-status';
import { ReadyStatus } from './status-cards/ready-status';

interface Props {
  data: OrderStatusData;
}

export const StatusBlock = ({ data }: Props) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 min-h-[400px] flex items-center justify-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={data.status}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {data.status === 'PENDING' && <PendingStatus />}
          {data.status === 'PROCESSING' && <ProcessingStatus data={data} />}

          {(data.status === 'READY' || data.status === 'SUCCEEDED') && <ReadyStatus data={data} />}
          {data.status === 'CANCELLED' && <CancelledStatus />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
