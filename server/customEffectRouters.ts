import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './_core/trpc';
import * as customEffectService from './customEffectService';

export const customEffectRouter = router({
  /**
   * Create a new custom effect
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum(['entrance', 'exit', 'emphasis', 'custom']),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        duration: z.number().positive(),
        tags: z.array(z.string()).optional(),
        animations: z.array(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      return customEffectService.createCustomEffect({
        name: input.name,
        description: input.description || '',
        category: input.category,
        difficulty: input.difficulty,
        duration: input.duration,
        tags: input.tags || [],
        animations: input.animations,
      });
    }),

  /**
   * Update a custom effect
   */
  update: protectedProcedure
    .input(
      z.object({
        effectId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['entrance', 'exit', 'emphasis', 'custom']).optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        duration: z.number().optional(),
        tags: z.array(z.string()).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { effectId, ...data } = input;
      return customEffectService.updateCustomEffect(effectId, data);
    }),

  /**
   * Delete a custom effect
   */
  delete: protectedProcedure
    .input(z.object({ effectId: z.number() }))
    .mutation(async ({ input }) => {
      return customEffectService.deleteCustomEffect(input.effectId);
    }),

  /**
   * Get custom effect by ID
   */
  getById: publicProcedure
    .input(z.object({ effectId: z.number() }))
    .query(async ({ input }) => {
      return customEffectService.getCustomEffectById(input.effectId);
    }),

  /**
   * Get all custom effects
   */
  getAll: publicProcedure.query(async () => {
    return customEffectService.getAllCustomEffects();
  }),

  /**
   * Search custom effects
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.enum(['entrance', 'exit', 'emphasis', 'custom']).optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      return customEffectService.searchCustomEffects(input.query || '', {
        category: input.category,
        difficulty: input.difficulty,
        tags: input.tags,
      });
    }),

  /**
   * Duplicate a custom effect
   */
  duplicate: protectedProcedure
    .input(
      z.object({
        effectId: z.number(),
        newName: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ input }) => {
      return customEffectService.duplicateCustomEffect(
        input.effectId,
        input.newName
      );
    }),

  /**
   * Share a custom effect
   */
  share: protectedProcedure
    .input(z.object({ effectId: z.number() }))
    .mutation(async ({ input }) => {
      return customEffectService.shareCustomEffect(input.effectId);
    }),

  /**
   * Unshare a custom effect
   */
  unshare: protectedProcedure
    .input(z.object({ effectId: z.number() }))
    .mutation(async ({ input }) => {
      return customEffectService.unshareCustomEffect(input.effectId);
    }),

  /**
   * Get public custom effects
   */
  getPublic: publicProcedure.query(async () => {
    return customEffectService.getPublicCustomEffects();
  }),

  /**
   * Get effect statistics
   */
  getStatistics: publicProcedure.query(async () => {
    return customEffectService.getEffectStatistics();
  }),
});
