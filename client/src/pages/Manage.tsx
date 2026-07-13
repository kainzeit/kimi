import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Upload, X, ArrowLeft, Bold, Italic, Underline as UnderlineIcon, List, Heading2, Edit2, Palette } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";

function RichEditor({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), TextStyle, Color],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] p-4 focus:outline-none text-sm leading-relaxed tracking-wide",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="flex gap-1 p-2 bg-muted/40" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("bold") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("italic") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("underline") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <div className="w-px bg-border mx-1" />
        {/* Text color picker */}
        <div className="relative flex items-center" title="Text color">
          <label className="p-1.5 rounded hover:bg-muted cursor-pointer flex items-center gap-1" title="Text color">
            <Palette className="w-3.5 h-3.5" />
            <input
              type="color"
              className="absolute opacity-0 w-0 h-0"
              onMouseDown={() => {
                // Save the current selection before the color picker steals focus
                editor.commands.focus();
              }}
              onInput={(e) => {
                const color = (e.target as HTMLInputElement).value;
                editor.chain().focus().setColor(color).run();
              }}
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
              }}
            />
            <span
              className="w-3 h-1 rounded-sm block"
              style={{ backgroundColor: editor.getAttributes("textStyle").color || "currentColor" }}
            />
          </label>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().unsetColor().run();
            }}
            className="p-1.5 rounded hover:bg-muted text-xs text-muted-foreground"
            title="Remove color"
          >
            ✕
          </button>
        </div>
        <div className="w-px bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("heading", { level: 2 }) ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Heading"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("bulletList") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

type Section = "articles" | "pages" | "images";
type PageKey = "about" | "contact" | "imagination_intro";
type Category = "a-whim" | "imagination";

export default function Manage() {
  const [section, setSection] = useState<Section>("pages");
  const [activePageKey, setActivePageKey] = useState<PageKey>("about");
  const [articleCategory, setArticleCategory] = useState<Category>("a-whim");
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [articleForm, setArticleForm] = useState({ slug: "", title: "", content: "", publishedAt: today });
  const [articleRichContent, setArticleRichContent] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [savingPage, setSavingPage] = useState(false);
  // Articles
  const { data: articles = [], isLoading: articlesLoading, refetch: refetchArticles } =
    trpc.articles.list.useQuery({ category: articleCategory });
  const createArticleMutation = trpc.articles.create.useMutation();
  const updateArticleMutation = trpc.articles.update.useMutation();
  const deleteArticleMutation = trpc.articles.delete.useMutation();

  // Pages
  const { data: pageContent, isLoading: pageLoading, refetch: refetchPage } =
    trpc.pages.getContent.useQuery({ pageKey: activePageKey });
  const updatePageMutation = trpc.pages.updateContent.useMutation();

  // Images
  const [imagesPageKey, setImagesPageKey] = useState<string>("home");
  const { data: images = [], isLoading: imagesLoading, refetch: refetchImages } =
    trpc.images.list.useQuery({ pageKey: imagesPageKey });
  const deleteImageMutation = trpc.images.delete.useMutation();

  useEffect(() => {
    if (pageContent?.content !== undefined) {
      setEditingContent(pageContent.content);
    }
  }, [pageContent?.content, activePageKey]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.slug || !articleForm.title) return;
    const content = articleRichContent || articleForm.content;
    if (!content) return;
    try {
      if (editingArticleId) {
        await updateArticleMutation.mutateAsync({
          id: editingArticleId,
          ...articleForm,
          content,
          publishedAt: articleForm.publishedAt,
        });
        setEditingArticleId(null);
      } else {
        await createArticleMutation.mutateAsync({
          ...articleForm,
          content,
          category: articleCategory,
          publishedAt: articleForm.publishedAt,
        });
      }
      setArticleForm({ slug: "", title: "", content: "", publishedAt: today });
      setArticleRichContent("");
      setIsCreating(false);
      refetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditArticle = (article: any) => {
    setArticleForm({
      slug: article.slug,
      title: article.title,
      content: article.content,
      publishedAt: new Date(article.publishedAt).toISOString().split("T")[0],
    });
    setArticleRichContent(article.content);
    setEditingArticleId(article.id);
    setIsCreating(true);
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm("delete this article?")) return;
    try {
      await deleteArticleMutation.mutateAsync({ id });
      refetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePage = async () => {
    setSavingPage(true);
    try {
      await updatePageMutation.mutateAsync({ pageKey: activePageKey, content: editingContent });
      refetchPage();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pageKey", imagesPageKey);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) refetchImages();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!window.confirm("delete this image?")) return;
    try {
      await deleteImageMutation.mutateAsync({ id });
      refetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const navBtn = (s: Section, label: string) => (
    <button
      onClick={() => setSection(s)}
      className={`text-sm tracking-wide transition pb-0.5 ${
        section === s
          ? "text-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  const subBtn = <T extends string>(val: T, cur: T, label: string, set: (v: T) => void) => (
    <button
      onClick={() => set(val)}
      className={`text-xs tracking-wide transition ${
        cur === val ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-12 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm">
            <ArrowLeft className="w-4 h-4" />
            back
          </a>
          <h1 className="text-xl font-bold">manage</h1>
        </div>
        <div className="flex gap-6">
          {navBtn("pages", "pages")}
          {navBtn("articles", "articles")}
          {navBtn("images", "images")}
        </div>
      </div>

      <div className="px-12 pb-16">
        {/* PAGES */}
        {section === "pages" && (
          <div>
            <div className="flex gap-6 mb-8">
              {subBtn<PageKey>("about", activePageKey, "about", setActivePageKey)}
              {subBtn<PageKey>("contact", activePageKey, "contact", setActivePageKey)}
            </div>
            {pageLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="max-w-2xl space-y-4">
                <p className="text-xs text-muted-foreground tracking-wide">
                  editing: <span className="text-foreground">{activePageKey}</span>
                </p>
                <RichEditor
                  content={editingContent}
                  onChange={setEditingContent}
                />
                <Button
                  onClick={handleSavePage}
                  disabled={savingPage}
                  className="text-xs"
                  size="sm"
                >
                  {savingPage ? <Loader2 className="w-3 h-3 animate-spin" /> : "save"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ARTICLES */}
        {section === "articles" && (
          <div>
            <div className="flex gap-6 mb-8">
              {subBtn<Category>("a-whim", articleCategory, "a whim", setArticleCategory)}
              {subBtn<Category>("imagination", articleCategory, "imagination", setArticleCategory)}
            </div>

            {!isCreating ? (
              <button
                onClick={() => {
                  setIsCreating(true);
                  setEditingArticleId(null);
                  setArticleForm({ slug: "", title: "", content: "", publishedAt: today });
                  setArticleRichContent("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition tracking-wide mb-8 block"
              >
                + new article
              </button>
            ) : (
              <form onSubmit={handleCreateArticle} className="max-w-2xl space-y-4 mb-10">
                <p className="text-xs text-muted-foreground tracking-wide">
                  {editingArticleId ? "edit article" : `new article in ${articleCategory}`}
                </p>
                <Input
                  placeholder="slug (e.g., my-first-post)"
                  value={articleForm.slug}
                  onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                  required
                  className="text-sm"
                />
                <Input
                  placeholder="title"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  required
                  className="text-sm"
                />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground tracking-wide">date</label>
                  <Input
                    type="date"
                    value={articleForm.publishedAt}
                    onChange={(e) => setArticleForm({ ...articleForm, publishedAt: e.target.value })}
                    required
                    className="text-sm w-44"
                  />
                </div>
                <RichEditor
                  content={articleRichContent}
                  onChange={setArticleRichContent}
                  placeholder="write your article..."
                />
                <div className="flex gap-3">
                  <Button type="submit" disabled={createArticleMutation.isPending || updateArticleMutation.isPending} size="sm" className="text-xs">
                    {createArticleMutation.isPending || updateArticleMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : editingArticleId ? (
                      "update"
                    ) : (
                      "publish"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingArticleId(null);
                      setArticleForm({ slug: "", title: "", content: "", publishedAt: today });
                      setArticleRichContent("");
                    }}
                  >
                    cancel
                  </Button>
                </div>
              </form>
            )}

            {articlesLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : articles.length === 0 ? (
              <p className="text-sm text-muted-foreground tracking-wide">no articles yet.</p>
            ) : (
              <div className="max-w-2xl space-y-4">
                {articles.map((article: any) => (
                  <div key={article.id} className="flex items-start justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p className="text-sm font-semibold">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                        /{articleCategory}/{article.slug} ·{" "}
                        {new Date(article.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 mt-0.5">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="text-muted-foreground hover:text-foreground transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-muted-foreground hover:text-destructive transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IMAGES */}
        {section === "images" && (
          <div>
            <div className="flex gap-6 mb-8">
              {subBtn<string>("home", imagesPageKey, "home", setImagesPageKey)}
              {subBtn<string>("about", imagesPageKey, "about", setImagesPageKey)}
              {subBtn<string>("a-whim", imagesPageKey, "a whim", setImagesPageKey)}
              {subBtn<string>("imagination", imagesPageKey, "imagination", setImagesPageKey)}
              {subBtn<string>("contact", imagesPageKey, "contact", setImagesPageKey)}
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition tracking-wide cursor-pointer mb-8">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? "uploading..." : "upload image"}
            </label>

            {imagesLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : images.length === 0 ? (
              <p className="text-sm text-muted-foreground tracking-wide">no images for {imagesPageKey} yet.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4 max-w-3xl">
                {images.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-28 object-cover rounded"
                    />
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition hover:bg-destructive hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
