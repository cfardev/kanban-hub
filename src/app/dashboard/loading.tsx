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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-36 rounded-none" />
            <Skeleton className="h-4 w-48 rounded-none" />
          </div>
          <Skeleton className="h-10 w-36 rounded-none" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["a", "b", "c", "d", "e", "f"].map((id) => (
            <div key={id} className="rounded-none border border-border bg-card py-4">
              <div className="px-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 shrink-0 rounded-none" />
                  <Skeleton className="h-5 w-[60%] rounded-none" />
                </div>
                <Skeleton className="h-4 w-full rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
