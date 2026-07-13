CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(512) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`),
	CONSTRAINT `images_fileKey_unique` UNIQUE(`fileKey`)
);
