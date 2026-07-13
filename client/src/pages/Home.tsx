import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: images = [], isLoading } = trpc.images.list.useQuery();

  return (
    <div className="pt-10 pl-16 pr-12 pb-12 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          {/* Empty — intentionally blank */}
        </div>
      ) : (
        <div className="columns-2 gap-4 space-y-4">
          {images.map((image: { id: number; url: string }) => (
            <img
              key={image.id}
              src={image.url}
              alt=""
              className="w-full rounded break-inside-avoid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
