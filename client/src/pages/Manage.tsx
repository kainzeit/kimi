import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Upload, X, ArrowLeft, Bold, Italic, Underline as UnderlineIcon, List, Heading2, Edit2, Palette, Check, AlertCircle, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";

// Custom Resizable Image extension that persists width and height attributes in HTML
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "auto",
        parseHTML: element => element.getAttribute("width") || element.style.width || "auto",
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}; height: ${attributes.height || "227px"}; object-fit: contain;`,
          };
        },
      },
      height: {
        default: "227px",
        parseHTML: element => element.getAttribute("height") || element.style.height || "227px",
        renderHTML: attributes => {
          return {
            height: attributes.height || "227px",
            style: `width: ${attributes.width || "auto"}; height: ${attributes.height || "227px"}; object-fit: contain;`,
          };
        },
      },
    };
  },
});
// FontSize handled via inline styles / select dropdown toolbar commands

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
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      CustomImage.configure({ inline: true, allowBase64: true, HTMLAttributes: { class: "resizable-article-img" } }),
    ],
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
        <div className="relative flex items-center gap-1" title="Text color">
          <label className="p-1.5 rounded hover:bg-muted cursor-pointer flex items-center gap-1" title="Text color">
            <Palette className="w-3.5 h-3.5" />
            <input
              type="color"
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              onChange={(e) => {
                const color = e.target.value;
                editor.chain().focus().setColor(color).run();
              }}
            />
            <span
              className="w-3 h-1 rounded-sm block"
              style={{ backgroundColor: editor.getAttributes("textStyle").color || "currentColor" }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetColor().run();
            }}
            className="p-1.5 rounded hover:bg-muted text-xs text-muted-foreground"
            title="Remove color"
          >
            ✕
          </button>
        </div>
        <div className="w-px bg-border mx-1" />
        {/* Font size buttons / selector */}
        <div className="flex items-center gap-1 text-xs">
          <select
            className="bg-background border rounded px-1.5 py-1 text-xs text-foreground cursor-pointer"
            onChange={(e) => {
              const size = e.target.value;
              if (size === "normal") {
                editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
              } else {
                editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
              }
            }}
            defaultValue="normal"
            title="Font size"
          >
            <option value="normal">normal</option>
            <option value="12px">small</option>
            <option value="16px">medium</option>
            <option value="20px">large</option>
            <option value="24px">huge</option>
          </select>
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
        <div className="w-px bg-border mx-1" />
        {/* Insert image: local upload or online URL */}
        <label className="p-1.5 rounded hover:bg-muted cursor-pointer flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition" title="Upload local image">
          <Upload className="w-3.5 h-3.5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("pageKey", "article-inline");
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (res.ok) {
                  const data = await res.json();
                  if (data?.url) {
                    editor.chain().focus().setImage({ src: data.url }).run();
                  }
                }
              } catch (err) {
                console.error("Failed to upload image:", err);
              }
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter online image URL (or HTML/Google Drive image link):");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-1.5 rounded hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          title="Insert online image URL"
        >
          <span>🌐 img</span>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

type Section = "articles" | "pages" | "images" | "dashboard" | "greeting" | "recycle";
type PageKey = "foyer" | "knock" | "imagination_intro";
type Category = "a-whim" | "imagination" | "elsewhere";

// ---- Dashboard Section ----
function DashboardSection() {
  const { data: accessLogs = [], isLoading: logsLoading } = trpc.admin.accessLogs.useQuery({ limit: 100 });
  const { data: articleViews = [], isLoading: viewsLoading } = trpc.admin.articleViews.useQuery();

  return (
    <div className="space-y-12">
      {/* Access Logs */}
      <div>
        <h2 className="text-sm font-semibold mb-4 tracking-wide">access log</h2>
        {logsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (accessLogs as any[]).length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">no access attempts yet.</p>
        ) : (
          <div className="max-w-3xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-normal tracking-wide">time</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-normal tracking-wide">ip</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-normal tracking-wide">input</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-normal tracking-wide">result</th>
                </tr>
              </thead>
              <tbody>
                {(accessLogs as any[]).map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-muted/30 transition">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4 font-mono">{log.ip ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono">{log.input ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {log.success === "yes" ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <Check className="w-3 h-3" /> yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertCircle className="w-3 h-3" /> no
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Article Views */}
      <div>
        <h2 className="text-sm font-semibold mb-4 tracking-wide">article views</h2>
        {viewsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (articleViews as any[]).length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">no views tracked yet.</p>
        ) : (
          <div className="max-w-xl space-y-2">
            {(articleViews as any[]).map((av: any) => (
              <div
                key={av.id}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-xs font-mono text-muted-foreground">{av.articleSlug}</span>
                <span className="text-xs font-semibold">{av.views} view{av.views !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Greeting Config Section ----
function GreetingSection() {
  const { data: promptVal, refetch: refetchPrompt } = trpc.admin.getConfig.useQuery({ key: "greeting_prompt" });
  const { data: keywordVal, refetch: refetchKeyword } = trpc.admin.getConfig.useQuery({ key: "greeting_keyword" });
  const setConfig = trpc.admin.setConfig.useMutation();

  const [prompt, setPrompt] = useState("");
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (promptVal !== undefined && promptVal !== null) setPrompt(promptVal as string);
  }, [promptVal]);

  useEffect(() => {
    if (keywordVal !== undefined && keywordVal !== null) setKeyword(keywordVal as string);
  }, [keywordVal]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setConfig.mutateAsync({ key: "greeting_prompt", value: prompt });
      await setConfig.mutateAsync({ key: "greeting_keyword", value: keyword });
      await refetchPrompt();
      await refetchKeyword();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <p className="text-xs text-muted-foreground tracking-wide leading-relaxed">
        configure the greeting gate. visitors must type the keyword to enter.
        separate multiple accepted keywords with commas (e.g. "hi, hello, hey").
      </p>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground tracking-wide">prompt text</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="please say hi to enter"
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">shown to visitors on the greeting page</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground tracking-wide">keyword(s)</label>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="hi"
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">comma-separated list of accepted inputs (case-insensitive)</p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        size="sm"
        className="text-xs"
      >
        {saving ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : saved ? (
          <><Check className="w-3 h-3 mr-1" /> saved</>
        ) : (
          "save"
        )}
      </Button>
    </div>
  );
}

export default function Manage() {
  const [section, setSection] = useState<Section>("pages");
  const [activePageKey, setActivePageKey] = useState<PageKey>("foyer");
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
    trpc.articles.list.useQuery({ category: articleCategory, includeHidden: true });
  const createArticleMutation = trpc.articles.create.useMutation();
  const updateArticleMutation = trpc.articles.update.useMutation();
  const deleteArticleMutation = trpc.articles.delete.useMutation();
  const hideArticleMutation = trpc.articles.hide.useMutation();
  const unhideArticleMutation = trpc.articles.unhide.useMutation();
  const softDeleteArticleMutation = trpc.articles.softDelete.useMutation();
  const restoreArticleMutation = trpc.articles.restore.useMutation();
  const setArticleDraftMutation = trpc.articles.setDraft.useMutation();
  const { data: deletedArticles = [], refetch: refetchDeletedArticles } =
    trpc.articles.listDeleted.useQuery({});

  // Pages
  const { data: pageContent, isLoading: pageLoading, refetch: refetchPage } =
    trpc.pages.getContent.useQuery({ pageKey: activePageKey });
  const updatePageMutation = trpc.pages.updateContent.useMutation();

  // Images
  const [imagesPageKey, setImagesPageKey] = useState<string>("home");
  const { data: images = [], isLoading: imagesLoading, refetch: refetchImages } =
    trpc.images.list.useQuery({ pageKey: imagesPageKey, includeHidden: true });
  const deleteImageMutation = trpc.images.delete.useMutation();
  const hideImageMutation = trpc.images.hide.useMutation();
  const unhideImageMutation = trpc.images.unhide.useMutation();
  const softDeleteImageMutation = trpc.images.softDelete.useMutation();
  const restoreImageMutation = trpc.images.restore.useMutation();
  const setImageDraftMutation = trpc.images.setDraft.useMutation();
  const { data: deletedImages = [], refetch: refetchDeletedImages } =
    trpc.images.listDeleted.useQuery({});

  useEffect(() => {
    if (pageContent?.content !== undefined) {
      setEditingContent(pageContent.content);
    }
  }, [pageContent?.content, activePageKey]);

  const handleSaveArticle = async (isDraft: boolean) => {
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
          isDraft,
        });
        setEditingArticleId(null);
      } else {
        await createArticleMutation.mutateAsync({
          ...articleForm,
          content,
          category: articleCategory,
          publishedAt: articleForm.publishedAt,
          isDraft,
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

  const handleToggleArticleHidden = async (article: any) => {
    try {
      if (article.isHidden) {
        await unhideArticleMutation.mutateAsync({ id: article.id });
      } else {
        await hideArticleMutation.mutateAsync({ id: article.id });
      }
      await refetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreArticle = async (id: number) => {
    try {
      await restoreArticleMutation.mutateAsync({ id });
      await refetchArticles();
      await refetchDeletedArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm("move this article to recycle?")) return;
    try {
      await softDeleteArticleMutation.mutateAsync({ id });
      await refetchArticles();
      await refetchDeletedArticles();
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

  const handleToggleImageHidden = async (image: any) => {
    try {
      if (image.isHidden) {
        await unhideImageMutation.mutateAsync({ id: image.id });
      } else {
        await hideImageMutation.mutateAsync({ id: image.id });
      }
      await refetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreImage = async (id: number) => {
    try {
      await restoreImageMutation.mutateAsync({ id });
      await refetchImages();
      await refetchDeletedImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!window.confirm("move this image to recycle?")) return;
    try {
      await softDeleteImageMutation.mutateAsync({ id });
      await refetchImages();
      await refetchDeletedImages();
    } catch (err) {
      console.error(err);
    }
  };

  const visibleArticles = (articles as any[]).filter((article: any) => !article.deletedAt);
  const visibleImages = (images as any[]).filter((image: any) => !image.deletedAt);

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
          {navBtn("dashboard", "dashboard")}
          {navBtn("greeting", "greeting")}
          {navBtn("recycle", "recycle")}
        </div>
      </div>

      <div className="px-12 pb-16">
        {/* PAGES */}
        {section === "pages" && (
          <div>
            <div className="flex gap-6 mb-8">
              {subBtn<PageKey>("foyer", activePageKey, "foyer", setActivePageKey)}
              {subBtn<PageKey>("knock", activePageKey, "knock", setActivePageKey)}
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
              {subBtn<Category>("elsewhere", articleCategory, "elsewhere", setArticleCategory)}
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
              <div className="max-w-2xl space-y-4 mb-10">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                    onClick={() => handleSaveArticle(true)}
                  >
                    save as draft
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs"
                    disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                    onClick={() => handleSaveArticle(false)}
                  >
                    {editingArticleId ? "update & publish" : "publish"}
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
              </div>
            )}

            {articlesLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : visibleArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground tracking-wide">no articles yet.</p>
            ) : (
              <div className="max-w-2xl space-y-4">
                {visibleArticles.map((article: any) => (
                    <div key={article.id} className={`flex items-start justify-between py-3 ${article.isHidden || article.isDraft ? "opacity-60" : ""}`} style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{article.title}</p>
                        {article.isDraft ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded tracking-wide">draft</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                        /{articleCategory}/{article.slug} ·{" "}
                        {new Date(article.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 mt-0.5 items-center">
                      <button
                        onClick={async () => {
                          try {
                            await setArticleDraftMutation.mutateAsync({ id: article.id, isDraft: !article.isDraft });
                            await refetchArticles();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-xs px-2 py-0.5 border rounded text-muted-foreground hover:text-foreground transition"
                        title={article.isDraft ? "Publish now" : "Convert to draft"}
                      >
                        {article.isDraft ? "publish" : "draft"}
                      </button>
                      <button
                        onClick={() => handleToggleArticleHidden(article)}
                        className="text-muted-foreground hover:text-foreground transition"
                        title={article.isHidden ? "Show on site" : "Hide from site"}
                      >
                        {article.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
              {subBtn<string>("foyer", imagesPageKey, "foyer", setImagesPageKey)}
              {subBtn<string>("a-whim", imagesPageKey, "a whim", setImagesPageKey)}
              {subBtn<string>("imagination", imagesPageKey, "imagination", setImagesPageKey)}
              {subBtn<string>("elsewhere", imagesPageKey, "elsewhere", setImagesPageKey)}
              {subBtn<string>("knock", imagesPageKey, "knock", setImagesPageKey)}
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
            ) : visibleImages.length === 0 ? (
              <p className="text-sm text-muted-foreground tracking-wide">no images for {imagesPageKey} yet.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4 max-w-3xl">
                {visibleImages.map((image: any) => (
                  <div key={image.id} className={`relative group ${image.isHidden ? "opacity-50" : ""}`}>
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-28 object-cover rounded"
                    />
                    {image.isDraft && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-background/90 text-muted-foreground rounded tracking-wide">draft</span>
                    )}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={async () => {
                          try {
                            await setImageDraftMutation.mutateAsync({ id: image.id, isDraft: !image.isDraft });
                            await refetchImages();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        title={image.isDraft ? "Publish image" : "Make draft"}
                        className="p-1 bg-background/80 rounded hover:bg-muted text-xs px-1.5 font-mono"
                      >
                        {image.isDraft ? "pub" : "draft"}
                      </button>
                      <button
                        onClick={() => handleToggleImageHidden(image)}
                        title={image.isHidden ? "Show on site" : "Hide from site"}
                        className="p-1 bg-background/80 rounded hover:bg-muted"
                      >
                        {image.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        title="Move to recycle"
                        className="p-1 bg-background/80 rounded hover:bg-destructive hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECYCLE BIN */}
        {section === "recycle" && (
          <div className="space-y-12 max-w-3xl">
            <div>
              <h2 className="text-sm font-semibold mb-4 tracking-wide">deleted articles</h2>
              {(deletedArticles as any[]).length === 0 ? (
                <p className="text-sm text-muted-foreground tracking-wide">recycle is empty.</p>
              ) : (
                <div className="space-y-2">
                  {(deletedArticles as any[]).map((article: any) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <div>
                        <p className="text-sm font-semibold">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                          {article.category} · deleted {article.deletedAt ? new Date(article.deletedAt).toLocaleDateString("en-US") : "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestoreArticle(article.id)}
                        className="text-muted-foreground hover:text-foreground transition"
                        title="Restore article"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-4 tracking-wide">deleted images</h2>
              {(deletedImages as any[]).length === 0 ? (
                <p className="text-sm text-muted-foreground tracking-wide">no deleted images.</p>
              ) : (
                <div className="grid grid-cols-4 gap-4 max-w-3xl">
                  {(deletedImages as any[]).map((image: any) => (
                    <div key={image.id} className="relative group opacity-60">
                      <img src={image.url} alt="" className="w-full h-28 object-cover rounded" />
                      <button
                        onClick={() => handleRestoreImage(image.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition hover:bg-muted"
                        title="Restore image"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">{image.pageKey}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {section === "dashboard" && <DashboardSection />}

        {/* GREETING CONFIG */}
        {section === "greeting" && <GreetingSection />}
      </div>
    </div>
  );
}
