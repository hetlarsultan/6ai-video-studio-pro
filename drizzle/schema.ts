import { mysqlTable, mysqlEnum, int, varchar, text, timestamp, decimal, bigint } from "drizzle-orm/mysql-core";

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

/**
 * Video Templates Table
 * Stores pre-built video project templates
 */
export const videoTemplates = mysqlTable("videoTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  thumbnail: text("thumbnail"),
  duration: int("duration").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy"),
  tags: text("tags"),
  structure: text("structure"),
  defaultSettings: text("defaultSettings"),
  usageCount: int("usageCount").default(0),
  isPublic: int("isPublic").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTemplate = typeof videoTemplates.$inferSelect;
export type InsertVideoTemplate = typeof videoTemplates.$inferInsert;

/**
 * User Projects Table
 */
export const userProjects = mysqlTable("userProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "processing", "completed", "failed"]).default("draft"),
  content: text("content"),
  settings: text("settings"),
  outputUrl: text("outputUrl"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProject = typeof userProjects.$inferSelect;
export type InsertUserProject = typeof userProjects.$inferInsert;

/**
 * Template Scenes Table
 */
export const templateScenes = mysqlTable("templateScenes", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  sceneIndex: int("sceneIndex").notNull(),
  sceneType: varchar("sceneType", { length: 100 }).notNull(),
  duration: int("duration").notNull(),
  content: text("content"),
  animation: varchar("animation", { length: 100 }),
  effects: text("effects"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemplateScene = typeof templateScenes.$inferSelect;
export type InsertTemplateScene = typeof templateScenes.$inferInsert;

/**
 * Template Assets Table
 */
export const templateAssets = mysqlTable("templateAssets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  assetType: varchar("assetType", { length: 100 }).notNull(),
  url: text("url").notNull(),
  category: varchar("category", { length: 100 }),
  duration: int("duration"),
  metadata: text("metadata"),
  isPublic: int("isPublic").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemplateAsset = typeof templateAssets.$inferSelect;
export type InsertTemplateAsset = typeof templateAssets.$inferInsert;

/**
 * Project Elements/Layers Table
 * Stores individual elements (text, images, shapes) in a project
 */
export const projectElements = mysqlTable("projectElements", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  elementType: mysqlEnum("elementType", ["text", "image", "shape", "video", "audio"]).notNull(),
  layerIndex: int("layerIndex").notNull(),
  x: int("x").default(0),
  y: int("y").default(0),
  width: int("width").default(100),
  height: int("height").default(100),
  rotation: int("rotation").default(0),
  opacity: int("opacity").default(100),
  zIndex: int("zIndex").default(0),
  content: text("content"),
  style: text("style"),
  animation: text("animation"),
  locked: int("locked").default(0),
  visible: int("visible").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectElement = typeof projectElements.$inferSelect;
export type InsertProjectElement = typeof projectElements.$inferInsert;

/**
 * Element Customization Table
 * Stores customization properties for elements (colors, fonts, effects)
 */
export const elementCustomization = mysqlTable("elementCustomization", {
  id: int("id").autoincrement().primaryKey(),
  elementId: int("elementId").notNull(),
  backgroundColor: varchar("backgroundColor", { length: 20 }),
  textColor: varchar("textColor", { length: 20 }),
  borderColor: varchar("borderColor", { length: 20 }),
  borderWidth: int("borderWidth"),
  borderRadius: int("borderRadius"),
  fontFamily: varchar("fontFamily", { length: 100 }),
  fontSize: int("fontSize"),
  fontWeight: varchar("fontWeight", { length: 20 }),
  fontStyle: varchar("fontStyle", { length: 20 }),
  textAlign: varchar("textAlign", { length: 20 }),
  lineHeight: int("lineHeight"),
  letterSpacing: int("letterSpacing"),
  shadowColor: varchar("shadowColor", { length: 20 }),
  shadowBlur: int("shadowBlur"),
  shadowOffsetX: int("shadowOffsetX"),
  shadowOffsetY: int("shadowOffsetY"),
  filters: text("filters"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ElementCustomization = typeof elementCustomization.$inferSelect;
export type InsertElementCustomization = typeof elementCustomization.$inferInsert;

/**
 * Project History/Undo Table
 * Stores project state snapshots for undo/redo functionality
 */
export const projectHistory = mysqlTable("projectHistory", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  previousState: text("previousState"),
  newState: text("newState"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ProjectHistory = typeof projectHistory.$inferSelect;
export type InsertProjectHistory = typeof projectHistory.$inferInsert;

/**
 * Element Animations/Effects Table
 * Stores animation and transition effects for elements
 */
export const elementAnimations = mysqlTable("elementAnimations", {
  id: int("id").autoincrement().primaryKey(),
  elementId: int("elementId").notNull(),
  projectId: int("projectId").notNull(),
  animationType: mysqlEnum("animationType", [
    "fade",
    "slide",
    "zoom",
    "rotate",
    "bounce",
    "flip",
    "swing",
    "pulse",
    "shake",
    "heartbeat",
    "custom"
  ]).notNull(),
  duration: int("duration").notNull().default(1000), // milliseconds
  delay: int("delay").default(0), // milliseconds
  easing: mysqlEnum("easing", [
    "linear",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "cubic-bezier"
  ]).default("ease-in-out"),
  iterations: int("iterations").default(1),
  direction: mysqlEnum("direction", ["normal", "reverse", "alternate", "alternate-reverse"]).default("normal"),
  fillMode: mysqlEnum("fillMode", ["none", "forwards", "backwards", "both"]).default("forwards"),
  transformOrigin: varchar("transformOrigin", { length: 100 }).default("center center"),
  keyframes: text("keyframes"), // JSON string for custom animations
  enabled: int("enabled").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ElementAnimation = typeof elementAnimations.$inferSelect;
export type InsertElementAnimation = typeof elementAnimations.$inferInsert;

/**
 * Transition Effects Table
 * Stores transition effects between elements
 */
export const transitionEffects = mysqlTable("transitionEffects", {
  id: int("id").autoincrement().primaryKey(),
  elementId: int("elementId").notNull(),
  projectId: int("projectId").notNull(),
  transitionType: mysqlEnum("transitionType", [
    "fade",
    "slide",
    "wipe",
    "dissolve",
    "push",
    "cover",
    "uncover",
    "reveal",
    "blinds",
    "checkerboard",
    "custom"
  ]).notNull(),
  duration: int("duration").notNull().default(500), // milliseconds
  delay: int("delay").default(0),
  direction: varchar("direction", { length: 50 }).default("left"),
  easing: varchar("easing", { length: 50 }).default("ease-in-out"),
  enabled: int("enabled").default(1),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TransitionEffect = typeof transitionEffects.$inferSelect;
export type InsertTransitionEffect = typeof transitionEffects.$inferInsert;

/**
 * Animation Timeline Table
 * Manages timing and sequencing of animations
 */
export const animationTimeline = mysqlTable("animationTimeline", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  elementId: int("elementId").notNull(),
  startTime: int("startTime").notNull(), // milliseconds
  endTime: int("endTime").notNull(),
  animationId: int("animationId"),
  transitionId: int("transitionId"),
  sequenceOrder: int("sequenceOrder").notNull(),
  triggerType: mysqlEnum("triggerType", ["auto", "click", "hover", "scroll", "custom"]).default("auto"),
  triggerDelay: int("triggerDelay").default(0),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnimationTimeline = typeof animationTimeline.$inferSelect;
export type InsertAnimationTimeline = typeof animationTimeline.$inferInsert;

/**
 * Animation Presets Table
 * Stores pre-built animation combinations
 */
export const animationPresets = mysqlTable("animationPresets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  animations: text("animations"), // JSON array of animation configs
  thumbnail: text("thumbnail"),
  duration: int("duration").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy"),
  tags: text("tags"),
  usageCount: int("usageCount").default(0),
  isPublic: int("isPublic").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnimationPreset = typeof animationPresets.$inferSelect;
export type InsertAnimationPreset = typeof animationPresets.$inferInsert;

/**
 * Generated Media Files Table
 * Stores all generated videos, images, and audio files
 */
export const generatedMediaFiles = mysqlTable("generatedMediaFiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: int("projectId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["video", "image", "audio"]).notNull(),
  format: varchar("format", { length: 50 }).notNull(),
  url: text("url").notNull(),
  s3Key: varchar("s3Key", { length: 500 }),
  size: int("size").notNull(),
  duration: int("duration"),
  thumbnail: text("thumbnail"),
  width: int("width"),
  height: int("height"),
  bitrate: varchar("bitrate", { length: 50 }),
  quality: mysqlEnum("quality", ["low", "medium", "high"]).default("high"),
  style: varchar("style", { length: 100 }),
  voice: varchar("voice", { length: 50 }),
  speed: decimal("speed", { precision: 3, scale: 2 }),
  isPublic: int("isPublic").default(0),
  isStarred: int("isStarred").default(0),
  downloadCount: int("downloadCount").default(0),
  shareCount: int("shareCount").default(0),
  tags: text("tags"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type GeneratedMediaFile = typeof generatedMediaFiles.$inferSelect;
export type InsertGeneratedMediaFile = typeof generatedMediaFiles.$inferInsert;

/**
 * Media File Tags Table
 * For organizing and searching generated files
 */
export const mediaFileTags = mysqlTable("mediaFileTags", {
  id: int("id").autoincrement().primaryKey(),
  mediaFileId: int("mediaFileId").notNull().references(() => generatedMediaFiles.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaFileTag = typeof mediaFileTags.$inferSelect;
export type InsertMediaFileTag = typeof mediaFileTags.$inferInsert;

/**
 * Media File Downloads Table
 * Track download history
 */
export const mediaFileDownloads = mysqlTable("mediaFileDownloads", {
  id: int("id").autoincrement().primaryKey(),
  mediaFileId: int("mediaFileId").notNull().references(() => generatedMediaFiles.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
});

export type MediaFileDownload = typeof mediaFileDownloads.$inferSelect;
export type InsertMediaFileDownload = typeof mediaFileDownloads.$inferInsert;
