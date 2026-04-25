CREATE TABLE `templateAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`assetType` varchar(100) NOT NULL,
	`url` text NOT NULL,
	`category` varchar(100),
	`duration` int,
	`metadata` text,
	`isPublic` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templateAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templateScenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sceneIndex` int NOT NULL,
	`sceneType` varchar(100) NOT NULL,
	`duration` int NOT NULL,
	`content` text,
	`animation` varchar(100),
	`effects` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templateScenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','processing','completed','failed') DEFAULT 'draft',
	`content` text,
	`settings` text,
	`outputUrl` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`thumbnail` text,
	`duration` int NOT NULL,
	`difficulty` enum('easy','medium','hard') DEFAULT 'easy',
	`tags` text,
	`structure` text,
	`defaultSettings` text,
	`usageCount` int DEFAULT 0,
	`isPublic` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoTemplates_id` PRIMARY KEY(`id`)
);
