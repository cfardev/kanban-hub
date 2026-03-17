"use client";

import { ActivityItem } from "@/components/activity/activity-item";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Clock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type ActivityListProps = {
  boardId: Id<"boards">;
  participantsInfo: Record<string, { name: string | null; image: string | null }>;
  onTaskClick?: (taskId: string) => void;
  limit?: number;
};

const INITIAL_LIMIT = 20;

export function ActivityList({
  boardId,
  participantsInfo,
  onTaskClick,
  limit = INITIAL_LIMIT,
}: ActivityListProps) {
  const [showMore, setShowMore] = useState(false);
  const activityLogs = useQuery(api.activity.listByBoard, {
    boardId,
    limit: showMore ? limit * 2 : limit,
  });

  if (!activityLogs) {
    return <div className="animate-pulse">Cargando actividad...</div>;
  }

  if (activityLogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <Clock className="size-12 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Sin actividad reciente</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          La actividad aparecerá aquí a medida que ocurran acciones
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {activityLogs.map((log, index) => {
          const userInfo = participantsInfo[log.user_id];
          return (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActivityItem
                activity={log}
                userName={userInfo?.name ?? null}
                userImage={userInfo?.image ?? null}
                onTaskClick={onTaskClick}
              />
            </motion.div>
          );
        })}
      </div>

      {activityLogs.length >= limit && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMore(!showMore)}
          className="w-full rounded-md border bg-muted/50 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          {showMore ? "Mostrar menos" : "Cargar más actividad"}
        </motion.button>
      )}
    </div>
  );
}
