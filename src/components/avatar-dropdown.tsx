"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  }
  if (email) {
    return email[0]?.toUpperCase() || "U";
  }
  return "U";
}

export function AvatarDropdown() {
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (user === undefined) {
    return (
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">...</AvatarFallback>
      </Avatar>
    );
  }

  if (user === null) {
    return null;
  }

  const initials = getInitials(user.name, user.email);
  const displayName = user.name || user.email || "Usuario";
  const displayEmail = user.email || "";
  const userPicture =
    (typeof (user as { image?: string | null }).image === "string" &&
      (user as { image?: string | null }).image) ||
    undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="outline-none focus:outline-none">
          <Avatar className="cursor-pointer">
            {userPicture && <AvatarImage src={userPicture} alt={displayName} />}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {displayEmail && (
              <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
