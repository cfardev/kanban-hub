"use client";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SiGoogle } from "react-icons/si";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (authError) {
      setError(authError.message ?? "Failed to sign in");
      setIsLoading(false);
      return;
    }

    window.location.href = callbackUrl;
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="bg-grid-dots absolute inset-0 pointer-events-none opacity-30" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/6 via-transparent to-accent/12" />
      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Logo size="lg" />
      </motion.div>
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card className="border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Iniciar sesion</CardTitle>
            <CardDescription>Accede para gestionar tus tableros y tareas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden rounded-none border border-destructive/50 bg-destructive/10 px-2.5 py-2 text-xs text-destructive"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">o continua con</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                disabled={isLoading}
                onClick={() => {
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: callbackUrl,
                  });
                }}
              >
                <SiGoogle className="shrink-0" aria-hidden />
                Google
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                No tienes una cuenta?{" "}
                <Link
                  href="/sign-up"
                  className="cursor-pointer text-primary underline-offset-4 hover:underline"
                >
                  Registrate
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
