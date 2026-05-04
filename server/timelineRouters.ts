import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './_core/trpc';
import * as timelineService from './timelineService';
import * as segmentEffectsService from './segmentEffectsService';

export const timelineRouter = router({
  /**
   * Create a new timeline
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        fps: z.number().default(30),
        resolution: z.string().default('1920x1080'),
      })
    )
    .mutation(async ({ input }) => {
      return timelineService.createTimeline(input.projectId, input.fps, input.resolution);
    }),

  /**
   * Get timeline
   */
  get: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return timelineService.getTimeline(input.projectId);
    }),

  /**
   * Add segment to timeline
   */
  addSegment: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        startTime: z.number(),
        endTime: z.number(),
        duration: z.number(),
        type: z.enum(['text', 'image', 'video', 'audio']),
        content: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return timelineService.addSegmentToTimeline(input.projectId, {
        projectId: input.projectId,
        startTime: input.startTime,
        endTime: input.endTime,
        duration: input.duration,
        type: input.type,
        content: input.content,
        effects: [],
        transitions: [],
        metadata: {},
        order: input.order,
        visible: true,
        locked: false,
      });
    }),

  /**
   * Update segment
   */
  updateSegment: protectedProcedure
    .input(
      z.object({
        segmentId: z.number(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        duration: z.number().optional(),
        content: z.string().optional(),
        visible: z.boolean().optional(),
        locked: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { segmentId, ...updates } = input;
      return timelineService.updateSegment(segmentId, updates);
    }),

  /**
   * Remove segment
   */
  removeSegment: protectedProcedure
    .input(z.object({ projectId: z.number(), segmentId: z.number() }))
    .mutation(async ({ input }) => {
      return timelineService.removeSegmentFromTimeline(input.projectId, input.segmentId);
    }),

  /**
   * Reorder segments
   */
  reorderSegments: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        segmentOrders: z.array(z.object({ segmentId: z.number(), order: z.number() })),
      })
    )
    .mutation(async ({ input }) => {
      return timelineService.reorderSegments(input.projectId, input.segmentOrders);
    }),

  /**
   * Calculate total duration
   */
  calculateDuration: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return timelineService.calculateTimelineDuration(input.projectId);
    }),

  /**
   * Get timeline statistics
   */
  getStatistics: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return timelineService.getTimelineStatistics(input.projectId);
    }),

  /**
   * Export timeline
   */
  export: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return timelineService.exportTimeline(input.projectId);
    }),

  /**
   * Import timeline
   */
  import: protectedProcedure
    .input(z.object({ projectId: z.number(), timelineJson: z.string() }))
    .mutation(async ({ input }) => {
      return timelineService.importTimeline(input.projectId, input.timelineJson);
    }),
});

export const segmentEffectsRouter = router({
  /**
   * Apply effect to segment
   */
  applyEffect: protectedProcedure
    .input(
      z.object({
        segmentId: z.number(),
        effectId: z.number(),
        effectName: z.string(),
        startTime: z.number(),
        duration: z.number(),
        intensity: z.number().default(1),
        parameters: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return segmentEffectsService.applyEffectToSegment(
        input.segmentId,
        input.effectId,
        input.effectName,
        input.startTime,
        input.duration,
        input.intensity,
        input.parameters
      );
    }),

  /**
   * Get segment effects
   */
  getEffects: publicProcedure
    .input(z.object({ segmentId: z.number() }))
    .query(async ({ input }) => {
      return segmentEffectsService.getSegmentEffects(input.segmentId);
    }),

  /**
   * Update effect parameters
   */
  updateParameters: protectedProcedure
    .input(z.object({ effectId: z.number(), parameters: z.record(z.string(), z.any()) }))
    .mutation(async ({ input }) => {
      return segmentEffectsService.updateEffectParameters(input.effectId, input.parameters);
    }),

  /**
   * Remove effect
   */
  removeEffect: protectedProcedure
    .input(z.object({ segmentId: z.number(), effectId: z.number() }))
    .mutation(async ({ input }) => {
      return segmentEffectsService.removeEffectFromSegment(input.segmentId, input.effectId);
    }),

  /**
   * Reorder effects
   */
  reorderEffects: protectedProcedure
    .input(
      z.object({
        segmentId: z.number(),
        effectOrders: z.array(z.object({ effectId: z.number(), order: z.number() })),
      })
    )
    .mutation(async ({ input }) => {
      return segmentEffectsService.reorderSegmentEffects(input.segmentId, input.effectOrders);
    }),

  /**
   * Toggle effect
   */
  toggleEffect: protectedProcedure
    .input(z.object({ effectId: z.number(), enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      return segmentEffectsService.toggleEffect(input.effectId, input.enabled);
    }),

  /**
   * Get effect statistics
   */
  getStatistics: publicProcedure
    .input(z.object({ segmentId: z.number() }))
    .query(async ({ input }) => {
      return segmentEffectsService.getSegmentEffectStatistics(input.segmentId);
    }),

  /**
   * Apply preset effect group
   */
  applyPresetGroup: protectedProcedure
    .input(z.object({ segmentId: z.number(), presetGroupId: z.number(), startTime: z.number() }))
    .mutation(async ({ input }) => {
      return segmentEffectsService.applyPresetEffectGroup(
        input.segmentId,
        input.presetGroupId,
        input.startTime
      );
    }),

  /**
   * Clone effects from one segment to another
   */
  cloneEffects: protectedProcedure
    .input(z.object({ sourceSegmentId: z.number(), targetSegmentId: z.number() }))
    .mutation(async ({ input }) => {
      return segmentEffectsService.cloneSegmentEffects(
        input.sourceSegmentId,
        input.targetSegmentId
      );
    }),

  /**
   * Export effects
   */
  exportEffects: protectedProcedure
    .input(z.object({ segmentId: z.number() }))
    .query(async ({ input }) => {
      return segmentEffectsService.exportSegmentEffects(input.segmentId);
    }),

  /**
   * Import effects
   */
  import: protectedProcedure
    .input(z.object({ segmentId: z.number(), effectsJson: z.string() }))
    .mutation(async ({ input }) => {
      return segmentEffectsService.importSegmentEffects(input.segmentId, input.effectsJson);
    }),
});
