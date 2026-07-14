import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

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
// 6cm ≈ 227px
const IMG_SIZE = "227px";
// 3cm ≈ 113px gap between text right edge and image
const IMG_GAP = "113px";

export default function About() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "about" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "about" });

  const rawContent = pageContent?.content || DEFAULT_CONTENT;
  const isHtml = rawContent.trim().startsWith("<");

  return (
    <div style={{ paddingTop: CONTENT_TOP, paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px", display: "flex", alignItems: "flex-start", gap: IMG_GAP }}>
      {/* Text content */}
      <div className="flex-1 min-w-0">
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
            {rawContent.split("\n").map((line, idx) =>
              line.trim() ? (
                <p key={idx}>{line}</p>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Images: float to the right of text, 6cm×6cm each */}
      {(images as any[]).length > 0 && (
        <div className="flex flex-col gap-4 shrink-0">
          {(images as any[]).map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt=""
              style={{ height: IMG_SIZE, width: "auto", objectFit: "contain", borderRadius: "4px" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
