import { LayoutGrid } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className = "", href }: LogoProps) {
  const content = (
    <span className={`font-black text-primary tracking-tight flex items-center gap-2 ${className}`}>
      <LayoutGrid className="h-5 w-5" />
      KanbanHub
    </span>
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
