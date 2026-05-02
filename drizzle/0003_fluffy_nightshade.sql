CREATE TABLE `animationPresets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`animations` text,
	`thumbnail` text,
	`duration` int NOT NULL,
	`difficulty` enum('easy','medium','hard') DEFAULT 'easy',
	`tags` text,
	`usageCount` int DEFAULT 0,
	`isPublic` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `animationPresets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animationTimeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`elementId` int NOT NULL,
	`startTime` int NOT NULL,
	`endTime` int NOT NULL,
	`animationId` int,
	`transitionId` int,
	`sequenceOrder` int NOT NULL,
	`triggerType` enum('auto','click','hover','scroll','custom') DEFAULT 'auto',
	`triggerDelay` int DEFAULT 0,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `animationTimeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `elementAnimations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`elementId` int NOT NULL,
	`projectId` int NOT NULL,
	`animationType` enum('fade','slide','zoom','rotate','bounce','flip','swing','pulse','shake','heartbeat','custom') NOT NULL,
	`duration` int NOT NULL DEFAULT 1000,
	`delay` int DEFAULT 0,
	`easing` enum('linear','ease-in','ease-out','ease-in-out','cubic-bezier') DEFAULT 'ease-in-out',
	`iterations` int DEFAULT 1,
	`direction` enum('normal','reverse','alternate','alternate-reverse') DEFAULT 'normal',
	`fillMode` enum('none','forwards','backwards','both') DEFAULT 'forwards',
	`transformOrigin` varchar(100) DEFAULT 'center center',
	`keyframes` text,
	`enabled` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `elementAnimations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transitionEffects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`elementId` int NOT NULL,
	`projectId` int NOT NULL,
	`transitionType` enum('fade','slide','wipe','dissolve','push','cover','uncover','reveal','blinds','checkerboard','custom') NOT NULL,
	`duration` int NOT NULL DEFAULT 500,
	`delay` int DEFAULT 0,
	`direction` varchar(50) DEFAULT 'left',
	`easing` varchar(50) DEFAULT 'ease-in-out',
	`enabled` int DEFAULT 1,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transitionEffects_id` PRIMARY KEY(`id`)
);
