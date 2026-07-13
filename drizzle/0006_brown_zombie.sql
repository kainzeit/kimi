CREATE TABLE `accessLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ip` varchar(64),
	`userAgent` text,
	`input` varchar(255),
	`success` enum('yes','no') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accessLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articleViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleSlug` varchar(255) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articleViews_id` PRIMARY KEY(`id`),
	CONSTRAINT `articleViews_articleSlug_unique` UNIQUE(`articleSlug`)
);
--> statement-breakpoint
CREATE TABLE `siteConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteConfig_key_unique` UNIQUE(`key`)
);
