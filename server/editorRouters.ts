import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getProjectElements,
  getElementWithCustomization,
  createElement,
  updateElementPosition,
  updateElementLayerOrder,
  updateElementVisibility,
  updateElementCustomization,
  deleteElement,
  duplicateElement,
  saveProjectHistory,
  getProjectHistory,
  batchUpdateElements,
  reorderLayers,
} from "./elementService";

/**
 * Elements Router
 */
export const elementsRouter = router({
  /**
   * Get all elements for a project
   */
  getAll: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const elements = await getProjectElements(input.projectId);
        return {
          success: true,
          elements,
          count: elements.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get element with customization
   */
  getDetail: protectedProcedure
    .input(z.object({ elementId: z.number() }))
    .query(async ({ input }) => {
      try {
        const element = await getElementWithCustomization(input.elementId);
        if (!element) {
          return {
            success: false,
            error: "Element not found",
          };
        }
        return {
          success: true,
          element,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Create new element
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        elementType: z.enum(["text", "image", "shape", "video", "audio"]),
        layerIndex: z.number(),
        x: z.number().optional(),
        y: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createElement({
          projectId: input.projectId,
          elementType: input.elementType,
          layerIndex: input.layerIndex,
          x: input.x || 0,
          y: input.y || 0,
          width: input.width || 100,
          height: input.height || 100,
          content: input.content,
        });

        if (!result) {
          return {
            success: false,
            error: "Failed to create element",
          };
        }

        return {
          success: true,
          message: "Element created successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Update element position and size
   */
  updatePosition: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotation: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateElementPosition(
          input.elementId,
          input.x,
          input.y,
          input.width,
          input.height,
          input.rotation || 0
        );

        return {
          success: true,
          message: "Element position updated",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Update element layer order
   */
  updateLayer: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        layerIndex: z.number(),
        zIndex: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateElementLayerOrder(
          input.elementId,
          input.layerIndex,
          input.zIndex
        );

        return {
          success: true,
          message: "Layer order updated",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Update element visibility and lock
   */
  updateVisibility: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        visible: z.boolean(),
        locked: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateElementVisibility(
          input.elementId,
          input.visible,
          input.locked || false
        );

        return {
          success: true,
          message: "Visibility updated",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Delete element
   */
  delete: protectedProcedure
    .input(z.object({ elementId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const success = await deleteElement(input.elementId);

        if (!success) {
          return {
            success: false,
            error: "Failed to delete element",
          };
        }

        return {
          success: true,
          message: "Element deleted successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Duplicate element
   */
  duplicate: protectedProcedure
    .input(z.object({ elementId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await duplicateElement(input.elementId);

        if (!result) {
          return {
            success: false,
            error: "Failed to duplicate element",
          };
        }

        return {
          success: true,
          message: "Element duplicated successfully",
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
 * Customization Router
 */
export const customizationRouter = router({
  /**
   * Update element customization
   */
  update: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        borderColor: z.string().optional(),
        borderWidth: z.number().optional(),
        borderRadius: z.number().optional(),
        fontFamily: z.string().optional(),
        fontSize: z.number().optional(),
        fontWeight: z.string().optional(),
        fontStyle: z.string().optional(),
        textAlign: z.string().optional(),
        lineHeight: z.number().optional(),
        letterSpacing: z.number().optional(),
        shadowColor: z.string().optional(),
        shadowBlur: z.number().optional(),
        shadowOffsetX: z.number().optional(),
        shadowOffsetY: z.number().optional(),
        filters: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { elementId, ...customization } = input;

        const result = await updateElementCustomization(elementId, customization);

        if (!result) {
          return {
            success: false,
            error: "Failed to update customization",
          };
        }

        return {
          success: true,
          message: "Customization updated successfully",
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
 * History Router
 */
export const historyRouter = router({
  /**
   * Save project history
   */
  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        action: z.string(),
        previousState: z.record(z.string(), z.any()),
        newState: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await saveProjectHistory(
          input.projectId,
          input.action,
          input.previousState,
          input.newState
        );

        return {
          success: true,
          message: "History saved",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get project history
   */
  getAll: protectedProcedure
    .input(z.object({ projectId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const history = await getProjectHistory(
          input.projectId,
          input.limit || 50
        );

        return {
          success: true,
          history,
          count: history.length,
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
 * Combined Editor Router
 */
export const editorSystemRouter = router({
  elements: elementsRouter,
  customization: customizationRouter,
  history: historyRouter,
});
