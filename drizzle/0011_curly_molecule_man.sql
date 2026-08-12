CREATE TABLE `articleAutosaves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`category` enum('a-whim','imagination','elsewhere') NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articleAutosaves_id` PRIMARY KEY(`id`),
	CONSTRAINT `articleAutosaves_articleId_unique` UNIQUE(`articleId`)
);
