import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Manage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"a-whim" | "imagination">("a-whim");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ slug: "", title: "", content: "" });

  const { data: articles, isLoading, refetch } = trpc.articles.list.useQuery({ category: activeTab });
  const createMutation = trpc.articles.create.useMutation();
  const deleteMutation = trpc.articles.delete.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-12">
          <p className="text-muted-foreground">you don't have permission to access this page</p>
        </div>
      </Layout>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.title || !formData.content) return;

    try {
      await createMutation.mutateAsync({
        ...formData,
        category: activeTab,
      });
      setFormData({ slug: "", title: "", content: "" });
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Failed to create article:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("are you sure?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">manage articles</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("a-whim")}
            className={`pb-2 px-4 font-semibold transition ${
              activeTab === "a-whim"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            a whim
          </button>
          <button
            onClick={() => setActiveTab("imagination")}
            className={`pb-2 px-4 font-semibold transition ${
              activeTab === "imagination"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            imagination
          </button>
        </div>

        {/* Create Form */}
        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)} className="mb-8">
            + new article
          </Button>
        ) : (
          <form onSubmit={handleCreate} className="mb-8 p-6 border border-border rounded space-y-4">
            <Input
              placeholder="slug (e.g., my-first-post)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <Input
              placeholder="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="content (markdown supported)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={8}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ slug: "", title: "", content: "" });
                }}
              >
                cancel
              </Button>
            </div>
          </form>
        )}

        {/* Articles List */}
        {isLoading ? (
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
                  <p className="text-sm text-muted-foreground">/{activeTab}/{article.slug}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(article.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
