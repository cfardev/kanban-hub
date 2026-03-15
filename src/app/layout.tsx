import { ConvexClientProvider } from "@/components/convex-client-provider";
import { PageMotion } from "@/components/page-motion";
import { getToken } from "@/lib/auth-server";
import { ThemeProvider } from "@/lib/theme-provider";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Inter({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html lang="es" suppressHydrationWarning translate="no">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ConvexClientProvider initialToken={token}>
            <PageMotion>{children}</PageMotion>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
