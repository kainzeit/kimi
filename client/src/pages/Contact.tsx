import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const DEFAULT_CONTENT = `say hi
mail's the fastest way to reach me — or find me scattered around the internet.
woxiantao@icloud.com

find me
instagram: https://www.instagram.com/idbetterrun
linkedin: https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278
github: https://github.com/idbetterrun`;

const CONTENT_TOP = "169px";
const IMG_SIZE = "227px";
const IMG_GAP = "113px";

export default function Contact() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "contact" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "contact" });
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
            {rawContent.split("\n").map((line, idx) => {
              if (!line.trim()) return null;
              if (line.includes("http")) {
                const colonIdx = line.indexOf(": ");
                if (colonIdx !== -1) {
                  const label = line.slice(0, colonIdx);
                  const url = line.slice(colonIdx + 2);
                  return (
                    <p key={idx}>
                      {label}:{" "}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-70 transition">
                        {url}
                      </a>
                    </p>
                  );
                }
              }
              if (line.includes("@") && !line.includes(" ")) {
                return (
                  <p key={idx}>
                    <a href={`mailto:${line}`} className="underline underline-offset-4 hover:opacity-70 transition">
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

      {/* Images: right of content, 6cm×6cm */}
      {(images as any[]).length > 0 && (
        <div className="public-image-column flex flex-col gap-4 shrink-0">
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
