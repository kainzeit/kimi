CREATE TABLE `pageContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pageContent_id` PRIMARY KEY(`id`),
	CONSTRAINT `pageContent_pageKey_unique` UNIQUE(`pageKey`)
);
