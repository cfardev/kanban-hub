"use client";

import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className = "", href }: LogoProps) {
  const content = (
    <motion.span
      className={`font-black text-primary tracking-tight flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <LayoutGrid className="h-5 w-5" />
      KanbanHub
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
