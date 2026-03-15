"use client";

import { ProfileSheet } from "@/components/profile-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [profileOpen, setProfileOpen] = useState(false);
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
      <DropdownMenuContent align="end" className="w-64 rounded-xl p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
            {userPicture && <AvatarImage src={userPicture} alt={displayName} />}
            <AvatarFallback className="bg-primary text-sm text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            {displayEmail && (
              <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer rounded-md"
            onSelect={() => setProfileOpen(true)}
          >
            <User className="mr-3 h-4 w-4 shrink-0" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer rounded-md"
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0" />
            Cerrar sesión
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </DropdownMenu>
  );
}
