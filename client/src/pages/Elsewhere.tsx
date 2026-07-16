import { useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CONTENT_TOP = "169px";
const IMG_HEIGHT = "189px"; // 5cm

export default function Elsewhere() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: articles = [], isLoading } = trpc.articles.list.useQuery({ category: "elsewhere" });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={{ paddingTop: CONTENT_TOP, paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px" }}>
        <p className="text-base text-muted-foreground tracking-wide">no travels yet.</p>
      </div>
    );
  }

  const article = articles[currentIndex];
  const hasNext = currentIndex < articles.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (hasPrev) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div style={{ paddingTop: CONTENT_TOP, paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px" }}>
      <div className="max-w-4xl">
        {/* Article Title */}
        <h2 className="text-lg font-semibold tracking-wide mb-4">{article.title}</h2>

        {/* Article Content */}
        <div
          className="prose prose-sm max-w-none mb-8 text-base leading-loose tracking-wide"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="p-2 rounded hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs text-muted-foreground tracking-wide">
            {currentIndex + 1} / {articles.length}
          </span>

          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="p-2 rounded hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
