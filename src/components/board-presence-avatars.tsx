"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction } from "convex/react";
import usePresence from "@convex-dev/presence/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  }
  return "U";
}

type UserInfo = { _id: string; name: string | null; image: string | null };

type BoardPresenceAvatarsProps = {
  boardId: string;
  currentUserId: string;
};

export function BoardPresenceAvatars({ boardId, currentUserId }: BoardPresenceAvatarsProps) {
  // roomId = boardId: presence is scoped to this board only; green circle = online in THIS board
  const presenceState = usePresence(api.presence, boardId, currentUserId);
  const getUsersPublicInfo = useAction(api.auth.getUsersPublicInfo);
  const [usersInfo, setUsersInfo] = useState<UserInfo[]>([]);

  // Solo usuarios que están online en esta sala (este tablero); la sala = boardId
  const onlineUserIds = useMemo(
    () =>
      presenceState
        ? [...new Set(presenceState.filter((p) => p.online).map((p) => p.userId))]
        : [],
    [presenceState]
  );

  useEffect(() => {
    if (onlineUserIds.length === 0) {
      setUsersInfo([]);
      return;
    }
    getUsersPublicInfo({ userIds: onlineUserIds }).then(setUsersInfo);
  }, [onlineUserIds, getUsersPublicInfo]);

  const infoById = new Map(usersInfo.map((u) => [u._id, u]));

  if (onlineUserIds.length === 0) return null;

  return (
    <div className="flex items-center gap-1 -space-x-2">
      {onlineUserIds.map((userId) => {
        const info = infoById.get(userId);
        const name = info?.name ?? null;
        const image = info?.image ?? null;
        return (
          <div
            key={userId}
            className="ring-2 ring-green-500 rounded-full cursor-pointer"
            title={name ?? userId}
            aria-label={name ? `En línea: ${name}` : "Usuario en línea"}
          >
            <Avatar className="h-8 w-8 border-2 border-background">
              {image && <AvatarImage src={image} alt={name ?? ""} />}
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      })}
    </div>
  );
}
