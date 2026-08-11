import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ManagedPageImage, type ManagedPageImageData } from "@/components/ManagedPageImage";

const DEFAULT_CONTENT = `just a regular person
likes building stuff, makes little apps here and there
loves music and movies — can only tell you if it's good or not, writing's too rough for actual reviews
loves to travel, just haven't been many places yet
studying english, still don't think i'm any good at it
some days i feel unstoppable, some days everything's falling apart
some nights i dream the most beautiful things, some days it all feels over
saw other people writing little things on their own sites, so i figured i'd try too
thanks for making it this far :)`;

// Sidebar: paddingTop 95px + kimi. (28px line-height ~34px) + mb-10 (40px) = ~169px
// We use 169px so content top aligns with "home" nav item
const CONTENT_TOP = "169px";
// 5cm ≈ 189px
const IMG_SIZE = "189px";
// 3cm ≈ 113px gap between text right edge and image
const IMG_GAP = "113px";

export default function Foyer() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "foyer" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "foyer" });

  const rawContent = pageContent?.content || DEFAULT_CONTENT;
  const isHtml = rawContent.trim().startsWith("<");

  return (
    <div className="public-content-layout">
      {/* Text content */}
      <div className="public-text-column flex-1 min-w-0">
        {isLoading ? (
          <div className="flex py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : isHtml ? (
          <div
            className="max-w-xl prose-content text-base leading-loose tracking-wide"
            dangerouslySetInnerHTML={{ __html: rawContent }}
          />
        ) : (
          <div className="max-w-xl text-base leading-loose tracking-wide space-y-5">
            {rawContent.split("\n").map((line: string, idx: number) =>
              line.trim() ? (
                <p key={idx}>{line}</p>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Images: float to the right of text, 5cm height with proportional width */}
      {(images as any[]).length > 0 && (
        <div className="public-image-column flex flex-col gap-4 shrink-0">
          {(images as ManagedPageImageData[]).map((image) => (
            <ManagedPageImage key={image.id} image={image} fallbackHeight={189} />
          ))}
        </div>
      )}
    </div>
  );
}
