import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const hasToken = await isAuthenticated();

  if (hasToken) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}
