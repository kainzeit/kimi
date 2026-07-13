import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: images = [], isLoading } = trpc.images.list.useQuery({ pageKey: "home" });

  return (
    <div className="pt-10 pl-16 pr-12 pb-12 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div />
      ) : (
        <div className="flex flex-wrap gap-4">
          {images.map((image: { id: number; url: string }) => (
            <div
              key={image.id}
              style={{ width: "190px", height: "190px", flexShrink: 0 }}
            >
              <img
                src={image.url}
                alt=""
                style={{ width: "190px", height: "190px", objectFit: "cover" }}
                className="rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
