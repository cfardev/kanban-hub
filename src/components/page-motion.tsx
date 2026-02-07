"use client";

import { motion } from "motion/react";

const transition = { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } as const;

export function PageMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
