import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateWithScenes,
  createProjectFromTemplate,
  getUserProjects,
  updateProject,
  getAssetsByType,
  getAssetsByCategory,
  incrementTemplateUsage,
  getTrendingTemplates,
  searchTemplates,
} from "./templateService";

/**
 * Templates Router
 */
export const templatesRouter = router({
  /**
   * Get all public templates
   */
  getAll: publicProcedure.query(async () => {
    try {
      const templates = await getAllTemplates();
      return {
        success: true,
        templates,
        count: templates.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }),

  /**
   * Get templates by category
   */
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      try {
        const templates = await getTemplatesByCategory(input.category);
        return {
          success: true,
          templates,
          count: templates.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get template details with scenes
   */
  getDetail: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      try {
        const template = await getTemplateWithScenes(input.templateId);
        if (!template) {
          return {
            success: false,
            error: "Template not found",
          };
        }

        // Increment usage
        await incrementTemplateUsage(input.templateId);

        return {
          success: true,
          template,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get trending templates
   */
  getTrending: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const templates = await getTrendingTemplates(input.limit || 10);
        return {
          success: true,
          templates,
          count: templates.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Search templates
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        const templates = await searchTemplates(input.query);
        return {
          success: true,
          templates,
          count: templates.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

/**
 * Projects Router
 */
export const projectsRouter = router({
  /**
   * Create project from template
   */
  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        projectName: z.string(),
        projectContent: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
      const result = await createProjectFromTemplate(
        ctx.user.id,
        input.templateId,
        input.projectName,
        input.projectContent || {}
      );

      if (!result) {
        return {
          success: false,
          error: "Failed to create project",
        };
      }

      return {
        success: true,
        message: "Project created successfully",
      };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get user's projects
   */
  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projects = await getUserProjects(ctx.user.id);
      return {
        success: true,
        projects,
        count: projects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }),

  /**
   * Update project
   */
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        content: z.record(z.string(), z.any()).optional(),
        settings: z.record(z.string(), z.any()).optional(),
        status: z.enum(["draft", "processing", "completed", "failed"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updates: Record<string, any> = {};

        if (input.name !== undefined) updates.name = input.name;
        if (input.description !== undefined) updates.description = input.description;
        if (input.content !== undefined) updates.content = JSON.stringify(input.content);
        if (input.settings !== undefined) updates.settings = JSON.stringify(input.settings);
        if (input.status !== undefined) updates.status = input.status;

        const result = await updateProject(input.projectId, updates);

        if (!result) {
          return {
            success: false,
            error: "Failed to update project",
          };
        }

        return {
          success: true,
          message: "Project updated successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

/**
 * Assets Router
 */
export const assetsRouter = router({
  /**
   * Get assets by type
   */
  getByType: publicProcedure
    .input(z.object({ assetType: z.string() }))
    .query(async ({ input }) => {
      try {
        const assets = await getAssetsByType(input.assetType);
        return {
          success: true,
          assets,
          count: assets.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get assets by category
   */
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      try {
        const assets = await getAssetsByCategory(input.category);
        return {
          success: true,
          assets,
          count: assets.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

/**
 * Combined Templates Router
 */
export const templatesSystemRouter = router({
  templates: templatesRouter,
  projects: projectsRouter,
  assets: assetsRouter,
});
