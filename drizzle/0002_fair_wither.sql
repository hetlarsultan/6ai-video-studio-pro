CREATE TABLE `elementCustomization` (
	`id` int AUTO_INCREMENT NOT NULL,
	`elementId` int NOT NULL,
	`backgroundColor` varchar(20),
	`textColor` varchar(20),
	`borderColor` varchar(20),
	`borderWidth` int,
	`borderRadius` int,
	`fontFamily` varchar(100),
	`fontSize` int,
	`fontWeight` varchar(20),
	`fontStyle` varchar(20),
	`textAlign` varchar(20),
	`lineHeight` int,
	`letterSpacing` int,
	`shadowColor` varchar(20),
	`shadowBlur` int,
	`shadowOffsetX` int,
	`shadowOffsetY` int,
	`filters` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `elementCustomization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectElements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`elementType` enum('text','image','shape','video','audio') NOT NULL,
	`layerIndex` int NOT NULL,
	`x` int DEFAULT 0,
	`y` int DEFAULT 0,
	`width` int DEFAULT 100,
	`height` int DEFAULT 100,
	`rotation` int DEFAULT 0,
	`opacity` int DEFAULT 100,
	`zIndex` int DEFAULT 0,
	`content` text,
	`style` text,
	`animation` text,
	`locked` int DEFAULT 0,
	`visible` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectElements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`previousState` text,
	`newState` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectHistory_id` PRIMARY KEY(`id`)
);
