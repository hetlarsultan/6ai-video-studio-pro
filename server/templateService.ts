import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  videoTemplates,
  userProjects,
  templateScenes,
  templateAssets,
  InsertVideoTemplate,
  InsertUserProject,
  InsertTemplateScene,
  InsertTemplateAsset,
} from "../drizzle/schema";

/**
 * Get all public templates
 */
export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.isPublic, 1));
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(videoTemplates)
      .where(
        and(
          eq(videoTemplates.category, category),
          eq(videoTemplates.isPublic, 1)
        )
      );
  } catch (error) {
    console.error("Error fetching templates by category:", error);
    return [];
  }
}

/**
 * Get template by ID with its scenes
 */
export async function getTemplateWithScenes(templateId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const template = await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.id, templateId))
      .limit(1);

    if (!template.length) return null;

    const scenes = await db
      .select()
      .from(templateScenes)
      .where(eq(templateScenes.templateId, templateId));

    return {
      ...template[0],
      scenes,
    };
  } catch (error) {
    console.error("Error fetching template with scenes:", error);
    return null;
  }
}

/**
 * Create a new user project from template
 */
export async function createProjectFromTemplate(
  userId: number,
  templateId: number,
  projectName: string,
  projectContent: Record<string, any>
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const template = await getTemplateWithScenes(templateId);
    if (!template) return null;

    const newProject: InsertUserProject = {
      userId,
      templateId,
      name: projectName,
      description: template.description,
      status: "draft",
      content: JSON.stringify(projectContent),
      settings: template.defaultSettings,
      duration: template.duration,
    };

    const result = await db.insert(userProjects).values(newProject);
    return result;
  } catch (error) {
    console.error("Error creating project from template:", error);
    return null;
  }
}

/**
 * Get user's projects
 */
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(userProjects)
      .where(eq(userProjects.userId, userId));
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return [];
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: number,
  updates: Partial<InsertUserProject>
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(userProjects)
      .set(updates)
      .where(eq(userProjects.id, projectId));

    return await db
      .select()
      .from(userProjects)
      .where(eq(userProjects.id, projectId))
      .limit(1);
  } catch (error) {
    console.error("Error updating project:", error);
    return null;
  }
}

/**
 * Get template assets by type
 */
export async function getAssetsByType(assetType: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(templateAssets)
      .where(
        and(
          eq(templateAssets.assetType, assetType),
          eq(templateAssets.isPublic, 1)
        )
      );
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

/**
 * Get assets by category
 */
export async function getAssetsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(templateAssets)
      .where(
        and(
          eq(templateAssets.category, category),
          eq(templateAssets.isPublic, 1)
        )
      );
  } catch (error) {
    console.error("Error fetching assets by category:", error);
    return [];
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const template = await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.id, templateId))
      .limit(1);

    if (template.length) {
      await db
        .update(videoTemplates)
        .set({ usageCount: (template[0].usageCount || 0) + 1 })
        .where(eq(videoTemplates.id, templateId));
    }
  } catch (error) {
    console.error("Error incrementing template usage:", error);
  }
}

/**
 * Get trending templates
 */
export async function getTrendingTemplates(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.isPublic, 1))
      .orderBy((t) => t.usageCount)
      .limit(limit);
  } catch (error) {
    console.error("Error fetching trending templates:", error);
    return [];
  }
}

/**
 * Search templates
 */
export async function searchTemplates(query: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Simple search - in production, use full-text search
    return await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.isPublic, 1));
  } catch (error) {
    console.error("Error searching templates:", error);
    return [];
  }
}
