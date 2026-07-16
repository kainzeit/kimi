"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2, Trash2, Upload, X, ArrowLeft, Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Heading2, Heading3, Edit2, Palette, Check, AlertCircle,
  Code2, Quote, Link as LinkIcon, Image as ImageIcon, Subscript, Superscript,
  Strikethrough, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import SubscriptExt from "@tiptap/extension-subscript";
import SuperscriptExt from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import Strike from "@tiptap/extension-strike";
import { trpc } from "@/lib/trpc";

function RichEditor({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      SubscriptExt,
      SuperscriptExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Blockquote,
      CodeBlock,
      Image,
      Strike,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none text-sm leading-relaxed tracking-wide prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await response.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap gap-1 p-2 bg-muted/40" style={{ borderBottom: "1px solid var(--border)" }}>
        {/* Text formatting */}
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
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("strike") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Text color & highlight */}
        <div className="relative flex items-center">
          <label className="p-1.5 rounded hover:bg-muted cursor-pointer flex items-center gap-1" title="Text color">
            <Palette className="w-3.5 h-3.5" />
            <input
              type="color"
              className="absolute opacity-0 w-0 h-0"
              onInput={(e) => {
                const color = (e.target as HTMLInputElement).value;
                editor.chain().focus().setColor(color).run();
              }}
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

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("heading", { level: 2 }) ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("heading", { level: 3 }) ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("bulletList") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("orderedList") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Ordered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive({ textAlign: "left" }) ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Align left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive({ textAlign: "center" }) ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Align center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive({ textAlign: "right" }) ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Align right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Subscript & Superscript */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("subscript") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Subscript"
        >
          <Subscript className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("superscript") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Superscript"
        >
          <Superscript className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Block elements */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("blockquote") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("codeBlock") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Code block"
        >
          <Code2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Link & Image */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`p-1.5 rounded text-sm transition ${editor.isActive("link") ? "bg-foreground text-background" : "hover:bg-muted"}`}
          title="Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        <label className="p-1.5 rounded hover:bg-muted cursor-pointer flex items-center gap-1 text-sm transition" title="Insert image">
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

type Section = "articles" | "pages" | "images" | "dashboard" | "greeting";
type PageKey = "foyer" | "knock" | "imagination_intro" | "elsewhere_intro";
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
                  <th className="text-left py-2 px-3">time</th>
                  <th className="text-left py-2 px-3">ip</th>
                  <th className="text-left py-2 px-3">input</th>
                  <th className="text-left py-2 px-3">status</th>
                </tr>
              </thead>
              <tbody>
                {(accessLogs as any[]).map((log, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 px-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-xs">{log.ipAddress}</td>
                    <td className="py-2 px-3">{log.input}</td>
                    <td className="py-2 px-3">{log.success ? "✓" : "✗"}</td>
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
          <p className="text-sm text-muted-foreground tracking-wide">no views yet.</p>
        ) : (
          <div className="max-w-3xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left py-2 px-3">article</th>
                  <th className="text-left py-2 px-3">views</th>
                </tr>
              </thead>
              <tbody>
                {(articleViews as any[]).map((view, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 px-3">{view.slug}</td>
                    <td className="py-2 px-3 font-semibold">{view.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Greeting Section ----
function GreetingSection() {
  const { data: greeting, isLoading } = trpc.admin.getGreeting.useQuery();
  const updateGreeting = trpc.admin.updateGreeting.useMutation();
  const [prompt, setPrompt] = useState("");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    if (greeting) {
      setPrompt(greeting.prompt);
      setKeywords(greeting.keywords.join(", "));
    }
  }, [greeting]);

  const handleSave = async () => {
    await updateGreeting.mutateAsync({
      prompt,
      keywords: keywords.split(",").map((k) => k.trim()),
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="text-sm font-semibold tracking-wide mb-2 block">greeting prompt</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Say hi to enter"
          className="text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold tracking-wide mb-2 block">accepted keywords (comma-separated)</label>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., hi, hey, hello"
          className="text-sm"
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={updateGreeting.isPending}
        className="w-full sm:w-auto"
      >
        {updateGreeting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
        save
      </Button>
    </div>
  );
}

// ---- Pages Section (About, Contact, etc.) ----
function PagesSection() {
  const [editingPage, setEditingPage] = useState<PageKey | null>(null);
  const [content, setContent] = useState("");

  const { data: pages, isLoading } = trpc.admin.getPages.useQuery();
  const updatePage = trpc.admin.updatePage.useMutation();

  const pageLabels: Record<PageKey, string> = {
    foyer: "foyer",
    knock: "knock",
    imagination_intro: "imagination intro",
    elsewhere_intro: "elsewhere intro",
  };

  const handleEditPage = (pageKey: PageKey) => {
    const page = (pages as any[])?.find((p) => p.pageKey === pageKey);
    setEditingPage(pageKey);
    setContent(page?.content || "");
  };

  const handleSavePage = async () => {
    if (!editingPage) return;
    await updatePage.mutateAsync({ pageKey: editingPage, content });
    setEditingPage(null);
  };

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />;

  return (
    <div className="max-w-4xl space-y-6">
      {editingPage ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingPage(null)}
              className="p-1 hover:bg-muted rounded transition"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold tracking-wide">editing {pageLabels[editingPage]}</h3>
          </div>
          <RichEditor content={content} onChange={setContent} />
          <div className="flex gap-2">
            <Button onClick={handleSavePage} disabled={updatePage.isPending} className="flex-1 sm:flex-none">
              {updatePage.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              save
            </Button>
            <Button variant="outline" onClick={() => setEditingPage(null)} className="flex-1 sm:flex-none">
              cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(pageLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleEditPage(key as PageKey)}
              className="w-full text-left p-3 rounded border transition hover:bg-muted"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium tracking-wide">{label}</span>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Articles Section ----
function ArticlesSection() {
  const [editingArticle, setEditingArticle] = useState<{ category: Category; slug: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: articles = [], isLoading } = trpc.admin.getArticles.useQuery();
  const updateArticle = trpc.admin.updateArticle.useMutation();

  const handleEditArticle = (category: Category, slug: string) => {
    const article = (articles as any[])?.find((a) => a.category === category && a.slug === slug);
    setEditingArticle({ category, slug });
    setTitle(article?.title || "");
    setContent(article?.content || "");
  };

  const handleSaveArticle = async () => {
    if (!editingArticle) return;
    await updateArticle.mutateAsync({
      category: editingArticle.category,
      slug: editingArticle.slug,
      title,
      content,
    });
    setEditingArticle(null);
  };

  const categories: Category[] = ["a-whim", "imagination", "elsewhere"];

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />;

  return (
    <div className="max-w-4xl space-y-6">
      {editingArticle ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingArticle(null)}
              className="p-1 hover:bg-muted rounded transition"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold tracking-wide">editing article</h3>
          </div>
          <div>
            <label className="text-sm font-semibold tracking-wide mb-2 block">title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold tracking-wide mb-2 block">content</label>
            <RichEditor content={content} onChange={setContent} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveArticle} disabled={updateArticle.isPending} className="flex-1 sm:flex-none">
              {updateArticle.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              save
            </Button>
            <Button variant="outline" onClick={() => setEditingArticle(null)} className="flex-1 sm:flex-none">
              cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold tracking-wide mb-3 capitalize">{category}</h3>
              <div className="space-y-2">
                {(articles as any[])
                  ?.filter((a) => a.category === category)
                  .map((article) => (
                    <button
                      key={article.slug}
                      onClick={() => handleEditArticle(category, article.slug)}
                      className="w-full text-left p-3 rounded border transition hover:bg-muted"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium tracking-wide">{article.title}</span>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Main Manage Component ----
export default function Manage() {
  const [section, setSection] = useState<Section>("articles");

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 tracking-wide">manage</h1>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
          {(["articles", "pages", "dashboard", "greeting"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2 text-sm font-medium tracking-wide transition ${
                section === s
                  ? "border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={section === s ? { borderColor: "var(--foreground)" } : {}}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div>
          {section === "articles" && <ArticlesSection />}
          {section === "pages" && <PagesSection />}
          {section === "dashboard" && <DashboardSection />}
          {section === "greeting" && <GreetingSection />}
        </div>
      </div>
    </div>
  );
}
