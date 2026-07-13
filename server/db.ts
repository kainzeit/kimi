import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, InsertArticle, pageContent, images, InsertImage } from "../drizzle/schema";
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

export async function listArticles(category: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list articles: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.category, category as any))
      .orderBy(desc(articles.createdAt));
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
      .where(eq(articles.slug, slug))
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

export async function listImages() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list images: database not available");
    return [];
  }

  try {
    return await db.select().from(images).orderBy(desc(images.createdAt));
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
