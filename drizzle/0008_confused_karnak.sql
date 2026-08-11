ALTER TABLE `articles` ADD `isHidden` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` ADD `isDraft` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `images` ADD `isHidden` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `images` ADD `isDraft` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `images` ADD `deletedAt` timestamp;