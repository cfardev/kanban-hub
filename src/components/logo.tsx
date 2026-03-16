"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: {
    icon: 18,
    iconClass: "h-[18px] w-[18px]",
    textClass: "text-lg",
  },
  md: {
    icon: 20,
    iconClass: "h-5 w-5",
    textClass: "text-xl",
  },
  lg: {
    icon: 24,
    iconClass: "h-6 w-6",
    textClass: "text-2xl",
  },
} as const;

export function Logo({ className = "", href, size = "md" }: LogoProps) {
  const style = SIZE_MAP[size];

  const content = (
    <motion.span
      className={`font-black text-primary tracking-tight flex items-center gap-2 ${style.textClass} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Image
        src="/logo.svg"
        alt="Kanban Hub logo"
        width={style.icon}
        height={style.icon}
        className={style.iconClass}
      />
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
