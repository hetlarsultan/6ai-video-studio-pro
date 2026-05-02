import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import * as animationService from './animationService';

/**
 * Animation Routers
 * API endpoints for managing animations and transitions
 */

export const animationRouter = router({
  /**
   * Get all animations for an element
   */
  getElementAnimations: protectedProcedure
    .input(z.object({ elementId: z.number() }))
    .query(async ({ input }) => {
      try {
        const animations = await animationService.getElementAnimations(input.elementId);
        return {
          success: true,
          animations,
          count: animations.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          animations: [],
          count: 0,
        };
      }
    }),

  /**
   * Get all animations for a project
   */
  getProjectAnimations: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const animations = await animationService.getProjectAnimations(input.projectId);
        return {
          success: true,
          animations,
          count: animations.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          animations: [],
          count: 0,
        };
      }
    }),

  /**
   * Create a new animation
   */
  create: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        projectId: z.number(),
        animationType: z.enum([
          'fade',
          'slide',
          'zoom',
          'rotate',
          'bounce',
          'flip',
          'swing',
          'pulse',
          'shake',
          'heartbeat',
          'custom',
        ]),
        duration: z.number().min(100).default(1000),
        delay: z.number().min(0).default(0),
        easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier']).default('ease-in-out'),
        iterations: z.number().min(-1).default(1),
        direction: z.enum(['normal', 'reverse', 'alternate', 'alternate-reverse']).default('normal'),
        fillMode: z.enum(['none', 'forwards', 'backwards', 'both']).default('forwards'),
        transformOrigin: z.string().default('center center'),
        keyframes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!animationService.validateAnimationConfig(input)) {
          return {
            success: false,
            error: 'Invalid animation configuration',
          };
        }

        await animationService.createAnimation(input);
        return {
          success: true,
          message: 'Animation created successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Update an animation
   */
  update: protectedProcedure
    .input(
      z.object({
        animationId: z.number(),
        duration: z.number().optional(),
        delay: z.number().optional(),
        easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier']).optional(),
        iterations: z.number().optional(),
        enabled: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { animationId, ...updateData } = input;
        await animationService.updateAnimation(animationId, updateData);
        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Delete an animation
   */
  delete: protectedProcedure
    .input(z.object({ animationId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await animationService.deleteAnimation(input.animationId);
        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

export const transitionRouter = router({
  /**
   * Get all transitions for an element
   */
  getElementTransitions: protectedProcedure
    .input(z.object({ elementId: z.number() }))
    .query(async ({ input }) => {
      try {
        const transitions = await animationService.getElementTransitions(input.elementId);
        return {
          success: true,
          transitions,
          count: transitions.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          transitions: [],
          count: 0,
        };
      }
    }),

  /**
   * Create a new transition
   */
  create: protectedProcedure
    .input(
      z.object({
        elementId: z.number(),
        projectId: z.number(),
        transitionType: z.enum([
          'fade',
          'slide',
          'wipe',
          'dissolve',
          'push',
          'cover',
          'uncover',
          'reveal',
          'blinds',
          'checkerboard',
          'custom',
        ]),
        duration: z.number().min(100).default(500),
        delay: z.number().min(0).default(0),
        direction: z.string().default('left'),
        easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier']).default('ease-in-out'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await animationService.createTransition(input);
        return {
          success: true,
          message: 'Transition created successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Update a transition
   */
  update: protectedProcedure
    .input(
      z.object({
        transitionId: z.number(),
        duration: z.number().optional(),
        delay: z.number().optional(),
        direction: z.string().optional(),
        easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { transitionId, ...updateData } = input;
        await animationService.updateTransition(transitionId, updateData);
        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Delete a transition
   */
  delete: protectedProcedure
    .input(z.object({ transitionId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await animationService.deleteTransition(input.transitionId);
        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

export const timelineRouter = router({
  /**
   * Get project timeline
   */
  getProjectTimeline: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const timeline = await animationService.getProjectTimeline(input.projectId);
        return {
          success: true,
          timeline,
          count: timeline.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          timeline: [],
          count: 0,
        };
      }
    }),

  /**
   * Get element timeline
   */
  getElementTimeline: protectedProcedure
    .input(z.object({ elementId: z.number() }))
    .query(async ({ input }) => {
      try {
        const timeline = await animationService.getElementTimeline(input.elementId);
        return {
          success: true,
          timeline,
          count: timeline.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          timeline: [],
          count: 0,
        };
      }
    }),

  /**
   * Create timeline entry
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        elementId: z.number(),
        startTime: z.number().min(0),
        endTime: z.number().min(0),
        animationId: z.number().optional(),
        transitionId: z.number().optional(),
        sequenceOrder: z.number().min(0),
        triggerType: z.enum(['auto', 'click', 'hover', 'scroll', 'custom']).default('auto'),
        triggerDelay: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await animationService.createTimelineEntry(input);
        return {
          success: true,
          message: 'Timeline entry created successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Update timeline entry
   */
  update: protectedProcedure
    .input(
      z.object({
        timelineId: z.number(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        sequenceOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { timelineId, ...updateData } = input;
        await animationService.updateTimelineEntry(timelineId, updateData);
        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Delete timeline entry
   */
  delete: protectedProcedure
    .input(z.object({ timelineId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await animationService.deleteTimelineEntry(input.timelineId);
        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});

export const presetRouter = router({
  /**
   * Get all animation presets
   */
  getAll: protectedProcedure.query(async () => {
    try {
      const presets = await animationService.getAllPresets();
      return {
        success: true,
        presets,
        count: presets.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        presets: [],
        count: 0,
      };
    }
  }),

  /**
   * Get presets by category
   */
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      try {
        const presets = await animationService.getPresetsByCategory(input.category);
        return {
          success: true,
          presets,
          count: presets.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          presets: [],
          count: 0,
        };
      }
    }),

  /**
   * Apply preset animations to elements
   */
  applyPreset: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        elementIds: z.array(z.number()),
        presetId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = await animationService.applyPresetAnimations(
          input.projectId,
          input.elementIds,
          input.presetId
        );
        return {
          success: true,
          count: results.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});
