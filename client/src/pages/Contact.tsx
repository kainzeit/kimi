import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const DEFAULT_CONTENT = `say hi
mail's the fastest way to reach me — or find me scattered around the internet.
woxiantao@icloud.com

find me
instagram: https://www.instagram.com/idbetterrun
linkedin: https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278
github: https://github.com/idbetterrun`;

export default function Contact() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "contact" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "contact" });
  const rawContent = pageContent?.content || DEFAULT_CONTENT;
  const isHtml = rawContent.trim().startsWith("<");

  return (
    <div style={{ paddingTop: "95px", paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px" }}>
      {/* Images for this page */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-10">
          {(images as any[]).map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt=""
              style={{ width: "190px", height: "190px", objectFit: "cover", borderRadius: "4px" }}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : isHtml ? (
        <div
          className="max-w-xl prose-content text-sm leading-loose tracking-wide"
          dangerouslySetInnerHTML={{ __html: rawContent }}
        />
      ) : (
        <div className="max-w-xl text-sm leading-loose tracking-wide space-y-5">
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
  );
}
