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

export default function About() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "about" });

  const rawContent = pageContent?.content || DEFAULT_CONTENT;

  // If content is HTML (from rich text editor), render as HTML; otherwise render as plain text lines
  const isHtml = rawContent.trim().startsWith("<");

  return (
    <div className="pt-10 pl-16 pr-12 pb-12">
      {/* Title aligned with sidebar's kimi. heading */}
      <h1 className="text-2xl font-bold mb-10">about</h1>

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
          {rawContent.split("\n").map((line, idx) =>
            line.trim() ? (
              <p key={idx}>{line}</p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
