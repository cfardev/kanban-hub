import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <Skeleton className="h-8 w-32 rounded-none" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-none" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-48 rounded-none" />
              <Skeleton className="h-4 w-64 rounded-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3">
          {["por_empezar", "en_curso", "terminado"].map((col) => (
            <div
              key={col}
              className="flex min-w-[280px] flex-1 flex-col rounded-none border border-border bg-card p-4"
            >
              <Skeleton className="mb-3 h-5 w-24 rounded-none" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={`task-${j}`} className="h-16 w-full rounded-none" />
                ))}
              </div>
              <Skeleton className="mt-3 h-10 w-full rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
