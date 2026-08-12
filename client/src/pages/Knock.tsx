import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ManagedPageImage, type ManagedPageImageData } from "@/components/ManagedPageImage";

const DEFAULT_CONTENT = `say hi
mail's the fastest way to reach me — or find me scattered around the internet.
woxiantao@icloud.com

find me
instagram: https://www.instagram.com/idbetterrun
linkedin: https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278
github: https://github.com/idbetterrun`;

const CONTENT_TOP = "169px";
const IMG_SIZE = "189px"; // 5cm
const IMG_GAP = "113px";

export default function Knock() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "knock" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "knock" });
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
            {rawContent.split("\n").map((line: string, idx: number) => {
              if (!line.trim()) return null;
              if (line.includes("http")) {
                const colonIdx = line.indexOf(": ");
                if (colonIdx !== -1) {
                  const label = line.slice(0, colonIdx);
                  const url = line.slice(colonIdx + 2);
                  return (
                    <p key={idx}>
                      {label}:{" "}
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textDecorationColor: "#719199", textUnderlineOffset: "3px" }} className="hover:opacity-80 transition">
                        {url}
                      </a>
                    </p>
                  );
                }
              }
              if (line.includes("@") && !line.includes(" ")) {
                return (
                  <p key={idx}>
                    <a href={`mailto:${line}`} style={{ color: "inherit", textDecoration: "underline", textDecorationColor: "#719199", textUnderlineOffset: "3px" }} className="hover:opacity-80 transition">
                      {line}
                    </a>
                  </p>
                );
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        )}
      </div>

      {/* Images: right of content, 5cm height with proportional width */}
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
