import { and, eq, desc, sql, isNull, isNotNull, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, articleAutosaves, InsertArticle, pageContent, images, InsertImage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listArticles(
  category: string,
  options: { includeHidden?: boolean; includeDeleted?: boolean } = {},
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list articles: database not available");
    return [];
  }

  try {
    const conditions = [eq(articles.category, category as any)];
    if (!options.includeHidden) conditions.push(eq(articles.isHidden, 0 as any));
    if (!options.includeDeleted) conditions.push(isNull(articles.deletedAt));
    if (!options.includeHidden) conditions.push(eq(articles.isDraft, 0 as any));
    const result = await db
      .select()
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to list articles:", error);
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get article: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.isHidden, 0 as any), eq(articles.isDraft, 0 as any), isNull(articles.deletedAt)))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get article:", error);
    return undefined;
  }
}

export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(articles).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create article:", error);
    throw error;
  }
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update article:", error);
    throw error;
  }
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete article:", error);
    throw error;
  }
}

export async function getPageContent(pageKey: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get page content: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(pageContent)
      .where(eq(pageContent.pageKey, pageKey))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get page content:", error);
    return undefined;
  }
}

export async function updatePageContent(pageKey: string, content: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const existing = await getPageContent(pageKey);
    if (existing) {
      return db
        .update(pageContent)
        .set({ content, updatedAt: new Date() })
        .where(eq(pageContent.pageKey, pageKey));
    } else {
      return db.insert(pageContent).values({ pageKey, content });
    }
  } catch (error) {
    console.error("[Database] Failed to update page content:", error);
    throw error;
  }
}

export async function listImages(
  pageKey?: string,
  options: { includeHidden?: boolean; includeDeleted?: boolean } = {},
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list images: database not available");
    return [];
  }

  try {
    const conditions = [];
    if (pageKey) conditions.push(eq(images.pageKey, pageKey));
    if (!options.includeHidden) conditions.push(eq(images.isHidden, 0 as any));
    if (!options.includeDeleted) conditions.push(isNull(images.deletedAt));
    if (!options.includeHidden) conditions.push(eq(images.isDraft, 0 as any));
    const result = await db
      .select()
      .from(images)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(images.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to list images:", error);
    return [];
  }
}

export async function createImage(data: InsertImage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(images).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create image:", error);
    throw error;
  }
}

export async function updateImageDimensions(
  id: number,
  displayWidth: number | null,
  displayHeight: number | null,
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    return await db
      .update(images)
      .set({ displayWidth, displayHeight })
      .where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to update image dimensions:", error);
    throw error;
  }
}

export async function deleteImage(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    return await db.delete(images).where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete image:", error);
    throw error;
  }
}

// ---- Access Logs ----
import { accessLogs, articleViews, siteConfig, InsertAccessLog } from "../drizzle/schema";

export async function createAccessLog(data: InsertAccessLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(accessLogs).values(data);
  } catch (error) {
    console.error("[Database] Failed to create access log:", error);
  }
}

export async function listAccessLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(accessLogs).orderBy(desc(accessLogs.createdAt)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to list access logs:", error);
    return [];
  }
}

// ---- Article Views ----
export async function incrementArticleView(slug: string) {
  const db = await getDb();
  if (!db) return;
  try {
    // Try upsert: insert with views=1, on duplicate key increment by 1
    await db
      .insert(articleViews)
      .values({ articleSlug: slug, views: 1 })
      .onDuplicateKeyUpdate({ set: { views: sql`${articleViews.views} + 1` } });
  } catch (err) {
    console.error("[Database] Failed to increment article view:", err);
  }
}

export async function listArticleViews() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(articleViews).orderBy(desc(articleViews.views));
  } catch (error) {
    console.error("[Database] Failed to list article views:", error);
    return [];
  }
}

// ---- Site Config ----
export async function getSiteConfig(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
    return result.length > 0 ? result[0].value : null;
  } catch (error) {
    console.error("[Database] Failed to get site config:", error);
    return null;
  }
}

export async function setSiteConfig(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db
      .insert(siteConfig)
      .values({ key, value })
      .onDuplicateKeyUpdate({ set: { value } });
  } catch (error) {
    console.error("[Database] Failed to set site config:", error);
    throw error;
  }
}


// Hide/unhide articles
export async function hideArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(articles)
      .set({ isHidden: 1 as any })
      .where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to hide article:", error);
    throw error;
  }
}

export async function unhideArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(articles)
      .set({ isHidden: 0 as any })
      .where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to unhide article:", error);
    throw error;
  }
}

// Soft delete articles (set deletedAt timestamp)
export async function softDeleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(articles)
      .set({ deletedAt: new Date() })
      .where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to soft delete article:", error);
    throw error;
  }
}

// Restore deleted article
export async function restoreArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(articles)
      .set({ deletedAt: null })
      .where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to restore article:", error);
    throw error;
  }
}

// Permanently remove an article only after it has entered the recycle bin.
export async function permanentlyDeleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(articleAutosaves).where(eq(articleAutosaves.articleId, id));
    return await db
      .delete(articles)
      .where(and(eq(articles.id, id), isNotNull(articles.deletedAt)));
  } catch (error) {
    console.error("[Database] Failed to permanently delete article:", error);
    throw error;
  }
}

// List deleted articles (recycle bin)
export async function listDeletedArticles(category?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list deleted articles: database not available");
    return [];
  }

  try {
    const condition = category
      ? and(isNotNull(articles.deletedAt), eq(articles.category, category as any))
      : isNotNull(articles.deletedAt);
    const result = await db
      .select()
      .from(articles)
      .where(condition)
      .orderBy(desc(articles.deletedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to list deleted articles:", error);
    return [];
  }
}

// Hide/unhide images
export async function hideImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(images)
      .set({ isHidden: 1 as any })
      .where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to hide image:", error);
    throw error;
  }
}

export async function unhideImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(images)
      .set({ isHidden: 0 as any })
      .where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to unhide image:", error);
    throw error;
  }
}

// Soft delete images
export async function softDeleteImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(images)
      .set({ deletedAt: new Date() })
      .where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to soft delete image:", error);
    throw error;
  }
}

// Restore deleted image
export async function restoreImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(images)
      .set({ deletedAt: null })
      .where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to restore image:", error);
    throw error;
  }
}

// List deleted images (recycle bin)
export async function listDeletedImages(pageKey?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list deleted images: database not available");
    return [];
  }

  try {
    const condition = pageKey
      ? and(isNotNull(images.deletedAt), eq(images.pageKey, pageKey))
      : isNotNull(images.deletedAt);
    const result = await db
      .select()
      .from(images)
      .where(condition)
      .orderBy(desc(images.deletedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to list deleted images:", error);
    return [];
  }
}


// Draft / Publish helpers for articles
export async function setArticleDraft(id: number, isDraft: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(articles)
      .set({ isDraft: isDraft ? 1 : 0 })
      .where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to set article draft status:", error);
    throw error;
  }
}

// Draft / Publish helpers for images
export async function setImageDraft(id: number, isDraft: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .update(images)
      .set({ isDraft: isDraft ? 1 : 0 })
      .where(eq(images.id, id));
  } catch (error) {
    console.error("[Database] Failed to set image draft status:", error);
    throw error;
  }
}

export type ArticleBatchAction = "publish" | "hide" | "delete";

export async function batchUpdateArticles(ids: number[], action: ArticleBatchAction) {
  const normalizedIds = Array.from(new Set(ids)).filter((id) => Number.isInteger(id) && id > 0);
  if (normalizedIds.length === 0) return { affected: 0 };

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const whereActive = and(inArray(articles.id, normalizedIds), isNull(articles.deletedAt));
  try {
    const result = action === "publish"
      ? await db.update(articles).set({ isDraft: 0, isHidden: 0, updatedAt: now }).where(whereActive)
      : action === "hide"
        ? await db.update(articles).set({ isHidden: 1, updatedAt: now }).where(whereActive)
        : await db.update(articles).set({ deletedAt: now, updatedAt: now }).where(whereActive);
    return { affected: (result as { rowsAffected?: number }).rowsAffected ?? normalizedIds.length };
  } catch (error) {
    console.error("[Database] Failed to batch update articles:", error);
    throw error;
  }
}

export type ArticleAutosaveInput = {
  articleId: number;
  slug: string;
  title: string;
  content: string;
  category: "a-whim" | "imagination" | "elsewhere";
  publishedAt: Date;
};

export async function saveArticleAutosave(data: ArticleAutosaveInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(articleAutosaves).values({
      ...data,
      category: data.category as any,
    }).onDuplicateKeyUpdate({
      set: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        category: data.category as any,
        publishedAt: data.publishedAt,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to save article autosave:", error);
    throw error;
  }
}

export async function getArticleAutosave(articleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(articleAutosaves).where(eq(articleAutosaves.articleId, articleId)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get article autosave:", error);
    return undefined;
  }
}

export async function clearArticleAutosave(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.delete(articleAutosaves).where(eq(articleAutosaves.articleId, articleId));
  } catch (error) {
    console.error("[Database] Failed to clear article autosave:", error);
    throw error;
  }
}

export async function getArticleForManage(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get article for Manage:", error);
    return undefined;
  }
}
