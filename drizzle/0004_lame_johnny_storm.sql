CREATE TABLE `generatedMediaFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('video','image','audio') NOT NULL,
	`format` varchar(50) NOT NULL,
	`url` text NOT NULL,
	`s3Key` varchar(500),
	`size` int NOT NULL,
	`duration` int,
	`thumbnail` text,
	`width` int,
	`height` int,
	`bitrate` varchar(50),
	`quality` enum('low','medium','high') DEFAULT 'high',
	`style` varchar(100),
	`voice` varchar(50),
	`speed` decimal(3,2),
	`isPublic` int DEFAULT 0,
	`isStarred` int DEFAULT 0,
	`downloadCount` int DEFAULT 0,
	`shareCount` int DEFAULT 0,
	`tags` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp,
	CONSTRAINT `generatedMediaFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediaFileDownloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaFileId` int NOT NULL,
	`userId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	CONSTRAINT `mediaFileDownloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediaFileTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaFileId` int NOT NULL,
	`tag` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaFileTags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generatedMediaFiles` ADD CONSTRAINT `generatedMediaFiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFileDownloads` ADD CONSTRAINT `mediaFileDownloads_mediaFileId_generatedMediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `generatedMediaFiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFileDownloads` ADD CONSTRAINT `mediaFileDownloads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFileTags` ADD CONSTRAINT `mediaFileTags_mediaFileId_generatedMediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `generatedMediaFiles`(`id`) ON DELETE cascade ON UPDATE no action;