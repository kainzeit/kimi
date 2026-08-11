import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: longtext("content").notNull(),
  category: mysqlEnum("category", ["a-whim", "imagination", "elsewhere"]).notNull(),
  authorId: int("authorId").notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  isHidden: tinyint("isHidden").default(0).notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const pageContent = mysqlTable("pageContent", {
  id: int("id").autoincrement().primaryKey(),
  pageKey: varchar("pageKey", { length: 255 }).notNull().unique(),
  content: longtext("content").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageContent = typeof pageContent.$inferSelect;
export type InsertPageContent = typeof pageContent.$inferInsert;

export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 512 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(),
  pageKey: varchar("pageKey", { length: 64 }).default("home").notNull(), // which page this image belongs to
  uploadedBy: int("uploadedBy"),
  isHidden: tinyint("isHidden").default(0).notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

export const imagesRelations = relations(images, ({ one }) => ({
  uploader: one(users, {
    fields: [images.uploadedBy],
    references: [users.id],
  }),
}));

// Access log: records every greeting attempt (success or fail)
export const accessLogs = mysqlTable("accessLogs", {
  id: int("id").autoincrement().primaryKey(),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("userAgent"),
  input: varchar("input", { length: 255 }),
  success: mysqlEnum("success", ["yes", "no"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = typeof accessLogs.$inferInsert;

// Article view count: one row per article, incremented on each visit
export const articleViews = mysqlTable("articleViews", {
  id: int("id").autoincrement().primaryKey(),
  articleSlug: varchar("articleSlug", { length: 255 }).notNull().unique(),
  views: int("views").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArticleView = typeof articleViews.$inferSelect;
export type InsertArticleView = typeof articleViews.$inferInsert;

// Site config: key-value store for greeting prompt and keyword
export const siteConfig = mysqlTable("siteConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = typeof siteConfig.$inferInsert;
