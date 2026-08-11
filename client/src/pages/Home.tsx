import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ManagedPageImage, type ManagedPageImageData } from "@/components/ManagedPageImage";

export default function Home() {
  const { data: images = [], isLoading } = trpc.images.list.useQuery({ pageKey: "home" });

  return (
    // pt matches sidebar 'home' nav item position (~169px)
    <div className="public-home-layout">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div />
      ) : (
        <div className="flex flex-wrap gap-4">
          {(images as ManagedPageImageData[]).map((image) => (
            <ManagedPageImage key={image.id} image={image} fallbackHeight={189} className="rounded" />
          ))}
        </div>
      )}
    </div>
  );
}
