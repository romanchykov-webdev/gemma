'use client';

import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { OrderStatusData } from './order-status-data';

export const OrderReceipt = ({ data }: { data: OrderStatusData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white relative p-6 rounded-t-2xl shadow-sm border border-neutral-100 w-full max-w-sm mx-auto mt-8"
  >
    <div
      className="absolute bottom-0 left-0 w-full h-4 bg-white translate-y-1/2"
      style={{
        maskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
        maskSize: '20px 20px',
        maskRepeat: 'repeat-x',
      }}
    />

    <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-neutral-200">
      <div className="flex items-center gap-2 text-neutral-500">
        <Receipt className="w-4 h-4" />
        <span className="text-sm font-medium">Scontrino digitale</span>
      </div>
      <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600 font-mono">
        #{data.orderId.split('-')[0].toUpperCase()}
      </span>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Cliente</span>
        <span className="font-semibold text-neutral-900">{data.fullName}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Metodo</span>
        <span className="text-neutral-900">
          {data.deliveryType === 'pickup' ? 'Asporto (Ritiro)' : 'Consegna a domicilio'}
        </span>
      </div>
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-dashed border-neutral-200">
        <span className="font-bold text-neutral-900 text-lg">Totale</span>
        <span className="font-bold text-primary text-xl">€{data.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  </motion.div>
);
