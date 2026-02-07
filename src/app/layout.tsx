import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { PageMotion } from "@/components/page-motion";
import { getToken } from "@/lib/auth-server";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanban Hub",
  description: "Gestión de tareas con Kanban",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${figtree.variable} font-sans antialiased`} suppressHydrationWarning>
        <ConvexClientProvider initialToken={token}>
        <PageMotion>{children}</PageMotion>
      </ConvexClientProvider>
      </body>
    </html>
  );
}
