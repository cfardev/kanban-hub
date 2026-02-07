"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  }
  if (email) return email[0]?.toUpperCase() || "U";
  return "U";
}

type ProfileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const user = useQuery(api.auth.getCurrentUser);
  const generateUploadUrl = useMutation(api.profile.generateProfileImageUploadUrl);
  const updateProfile = useMutation(api.profile.updateProfile);

  const [name, setName] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.name ?? user?.email ?? "";
  const userImage =
    typeof (user as { image?: string | null })?.image === "string"
      ? (user as { image?: string | null }).image
      : undefined;

  useEffect(() => {
    if (open && user) setName(user.name ?? user.email ?? "");
  }, [open, user]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setIsSaving(true);
    try {
      let imageStorageId: Id<"_storage"> | undefined;
      if (pendingFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": pendingFile.type },
          body: pendingFile,
        });
        if (!res.ok) throw new Error("Error al subir la imagen");
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
        imageStorageId = storageId;
      }
      await updateProfile({
        ...(name.trim() !== "" && { name: name.trim() }),
        ...(imageStorageId !== undefined && { imageStorageId }),
      });
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setError(null);
      setPendingFile(null);
      setName("");
    }
    onOpenChange(next);
  };

  if (user === undefined) return null;
  if (user === null) return null;

  const initials = getInitials(user.name, user.email);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(undefined);
  }, [pendingFile]);
  const imageUrl = previewUrl ?? userImage;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Perfil</SheetTitle>
          <SheetDescription>
            Cambia tu nombre y tu foto de perfil. La foto se sube a Convex.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 cursor-default">
              {imageUrl && (
                <AvatarImage src={imageUrl} alt={displayName} className="object-cover" />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPendingFile(f ?? null);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {pendingFile ? "Cambiar imagen" : "Subir foto"}
            </Button>
            {pendingFile && (
              <span className="text-muted-foreground text-xs">
                {pendingFile.name} (se guardará al guardar)
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => user && !name && setName(user.name ?? user.email ?? "")}
              placeholder={displayName || "Tu nombre"}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button className="cursor-pointer" disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
