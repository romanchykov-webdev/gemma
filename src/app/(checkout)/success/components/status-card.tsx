'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  color: string;
  textColor: string;
  shadow?: string;
}

export const StatusCard = ({
  icon,
  title,
  description,
  children,
  color,
  textColor,
  shadow = 'shadow-xl',
}: StatusCardProps) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className={`${color} ${shadow} border-2 rounded-[2rem] p-8 relative overflow-hidden`}
  >
    <div className="flex flex-col items-center relative z-10">
      <div className="mb-4">{icon}</div>
      <h2 className={`text-2xl font-bold ${textColor} mb-2`}>{title}</h2>
      <p className="text-neutral-500 max-w-xs mx-auto">{description}</p>
      {children}
    </div>
  </motion.div>
);
