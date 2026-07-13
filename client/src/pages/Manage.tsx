import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";

const PAGE_KEYS = {
  about: "about",
  contact: "contact",
};

export default function Manage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"articles" | "pages">("articles");
  const [activePageTab, setActivePageTab] = useState<"about" | "contact">("about");
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({ slug: "", title: "", content: "" });
  const [articleCategory, setArticleCategory] = useState<"a-whim" | "imagination">("a-whim");

  // Articles
  const { data: articles, isLoading: articlesLoading, refetch: refetchArticles } = trpc.articles.list.useQuery({ category: articleCategory });
  const createArticleMutation = trpc.articles.create.useMutation();
  const deleteArticleMutation = trpc.articles.delete.useMutation();

  // Pages
  const { data: pageContent, isLoading: pageLoading, refetch: refetchPage } = trpc.pages.getContent.useQuery({ pageKey: PAGE_KEYS[activePageTab] });
  const updatePageMutation = trpc.pages.updateContent.useMutation();
  const [editingPageContent, setEditingPageContent] = useState("");

  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-12">
          <p className="text-muted-foreground">you don't have permission to access this page</p>
        </div>
      </Layout>
    );
  }

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.slug || !articleForm.title || !articleForm.content) return;

    try {
      await createArticleMutation.mutateAsync({
        ...articleForm,
        category: articleCategory,
      });
      setArticleForm({ slug: "", title: "", content: "" });
      setIsCreatingArticle(false);
      refetchArticles();
    } catch (error) {
      console.error("Failed to create article:", error);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm("are you sure?")) return;
    try {
      await deleteArticleMutation.mutateAsync({ id });
      refetchArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const handleSavePage = async () => {
    try {
      await updatePageMutation.mutateAsync({
        pageKey: PAGE_KEYS[activePageTab],
        content: editingPageContent,
      });
      refetchPage();
    } catch (error) {
      console.error("Failed to save page:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">manage</h1>

        {/* Main Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("articles")}
            className={`pb-2 px-4 font-semibold transition ${
              activeTab === "articles"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            articles
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            className={`pb-2 px-4 font-semibold transition ${
              activeTab === "pages"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            pages
          </button>
        </div>

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div>
            <div className="flex gap-4 mb-8 border-b border-border">
              <button
                onClick={() => setArticleCategory("a-whim")}
                className={`pb-2 px-4 font-semibold transition ${
                  articleCategory === "a-whim"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                a whim
              </button>
              <button
                onClick={() => setArticleCategory("imagination")}
                className={`pb-2 px-4 font-semibold transition ${
                  articleCategory === "imagination"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                imagination
              </button>
            </div>

            {!isCreatingArticle ? (
              <Button onClick={() => setIsCreatingArticle(true)} className="mb-8">
                + new article
              </Button>
            ) : (
              <form onSubmit={handleCreateArticle} className="mb-8 p-6 border border-border rounded space-y-4">
                <Input
                  placeholder="slug (e.g., my-first-post)"
                  value={articleForm.slug}
                  onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                  required
                />
                <Input
                  placeholder="title"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="content"
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  required
                  rows={8}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={createArticleMutation.isPending}>
                    {createArticleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingArticle(false);
                      setArticleForm({ slug: "", title: "", content: "" });
                    }}
                  >
                    cancel
                  </Button>
                </div>
              </form>
            )}

            {articlesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : !articles || articles.length === 0 ? (
              <p className="text-muted-foreground">no articles yet</p>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="p-4 border border-border rounded flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">/{articleCategory}/{article.slug}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                      disabled={deleteArticleMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === "pages" && (
          <div>
            <div className="flex gap-4 mb-8 border-b border-border">
              <button
                onClick={() => {
                  setActivePageTab("about");
                  setEditingPageContent(pageContent?.content || "");
                }}
                className={`pb-2 px-4 font-semibold transition ${
                  activePageTab === "about"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                about
              </button>
              <button
                onClick={() => {
                  setActivePageTab("contact");
                  setEditingPageContent(pageContent?.content || "");
                }}
                className={`pb-2 px-4 font-semibold transition ${
                  activePageTab === "contact"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                contact
              </button>
            </div>

            {pageLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={editingPageContent}
                  onChange={(e) => setEditingPageContent(e.target.value)}
                  rows={12}
                  placeholder="edit page content here..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSavePage} disabled={updatePageMutation.isPending}>
                    {updatePageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
