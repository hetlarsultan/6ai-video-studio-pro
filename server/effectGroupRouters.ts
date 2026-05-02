import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import * as effectGroupService from './effectGroupService';

/**
 * Effect Group Routers
 * API endpoints for managing effect groups
 */

export const effectGroupRouter = router({
  /**
   * Get all effect groups
   */
  getAll: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getAllEffectGroups();
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get effects by category
   */
  getByCategory: protectedProcedure
    .input(
      z.object({
        category: z.enum(['entrance', 'exit', 'emphasis', 'custom']),
      })
    )
    .query(async ({ input }) => {
      try {
        const effects = effectGroupService.getEffectsByCategory(input.category);
        return {
          success: true,
          effects,
          count: effects.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          effects: [],
          count: 0,
        };
      }
    }),

  /**
   * Get effect details
   */
  getDetails: protectedProcedure
    .input(z.object({ effectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const effect = effectGroupService.getEffectDetails(input.effectId);
        return {
          success: true,
          effect,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get effect preview
   */
  getPreview: protectedProcedure
    .input(z.object({ effectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const preview = effectGroupService.getEffectPreview(input.effectId);
        return {
          success: true,
          preview,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Search effects by tags
   */
  searchByTags: protectedProcedure
    .input(z.object({ tags: z.array(z.string()) }))
    .query(async ({ input }) => {
      try {
        const effects = effectGroupService.searchEffects(input.tags);
        return {
          success: true,
          effects,
          count: effects.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          effects: [],
          count: 0,
        };
      }
    }),

  /**
   * Get effects by difficulty
   */
  getByDifficulty: protectedProcedure
    .input(
      z.object({
        difficulty: z.enum(['easy', 'medium', 'hard']),
      })
    )
    .query(async ({ input }) => {
      try {
        const effects = effectGroupService.getEffectsByDifficulty(
          input.difficulty
        );
        return {
          success: true,
          effects,
          count: effects.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          effects: [],
          count: 0,
        };
      }
    }),

  /**
   * Get recommended effects
   */
  getRecommended: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      try {
        const effects = effectGroupService.getRecommendedEffects(
          input.category
        );
        return {
          success: true,
          effects,
          count: effects.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          effects: [],
          count: 0,
        };
      }
    }),

  /**
   * Get effect statistics
   */
  getStatistics: protectedProcedure.query(async () => {
    try {
      const stats = effectGroupService.getEffectStatistics();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }),

  /**
   * Apply effect group to element
   */
  applyToElement: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        projectId: z.number(),
        effectId: z.string(),
        startTime: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await effectGroupService.applyEffectGroupToElement(
          input.elementId,
          input.projectId,
          input.effectId,
          input.startTime
        );
        return {
          success: true,
          result,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Apply effect group to multiple elements
   */
  applyToElements: protectedProcedure
    .input(
      z.object({
        elementIds: z.array(z.number()),
        projectId: z.number(),
        effectId: z.string(),
        startTime: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await effectGroupService.applyEffectGroupToElements(
          input.elementIds,
          input.projectId,
          input.effectId,
          input.startTime
        );
        return {
          success: true,
          result,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

export const effectLibraryRouter = router({
  /**
   * Get entrance effects
   */
  getEntranceEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByCategory('entrance');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get exit effects
   */
  getExitEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByCategory('exit');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get emphasis effects
   */
  getEmphasisEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByCategory('emphasis');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get custom effects
   */
  getCustomEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByCategory('custom');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get easy effects
   */
  getEasyEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByDifficulty('easy');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get medium effects
   */
  getMediumEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByDifficulty('medium');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),

  /**
   * Get hard effects
   */
  getHardEffects: protectedProcedure.query(async () => {
    try {
      const effects = effectGroupService.getEffectsByDifficulty('hard');
      return {
        success: true,
        effects,
        count: effects.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        effects: [],
        count: 0,
      };
    }
  }),
});
