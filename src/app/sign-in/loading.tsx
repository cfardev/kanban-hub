import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Skeleton className="mb-8 h-10 w-40 rounded-none" />
      <div className="w-full max-w-md space-y-6 rounded-none border border-border bg-card p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24 rounded-none" />
          <Skeleton className="h-4 w-full rounded-none" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12 rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
          <Skeleton className="h-10 w-full rounded-none" />
          <Skeleton className="h-10 w-full rounded-none" />
          <Skeleton className="h-4 w-48 mx-auto rounded-none" />
        </div>
      </div>
    </div>
  );
}
