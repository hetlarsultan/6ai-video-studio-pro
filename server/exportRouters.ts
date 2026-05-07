import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import {
  exportAsMP4,
  exportAsWebM,
  exportAsGIF,
  validateExportOptions,
} from './exportService';

export const exportRouter = router({
  exportAsMP4: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        videoData: z.instanceof(Buffer).optional(),
        quality: z.enum(['low', 'medium', 'high']).default('medium'),
      })
    )
    .mutation(async ({ input }) => {
      // In production, fetch actual video data from project
      const mockVideoData = Buffer.from('mock video data');
      return exportAsMP4(input.projectId, mockVideoData, input.quality);
    }),

  exportAsWebM: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        videoData: z.instanceof(Buffer).optional(),
        quality: z.enum(['low', 'medium', 'high']).default('medium'),
      })
    )
    .mutation(async ({ input }) => {
      // In production, fetch actual video data from project
      const mockVideoData = Buffer.from('mock video data');
      return exportAsWebM(input.projectId, mockVideoData, input.quality);
    }),

  exportAsGIF: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        videoData: z.instanceof(Buffer).optional(),
        fps: z.number().min(1).max(60).default(10),
      })
    )
    .mutation(async ({ input }) => {
      // In production, fetch actual video data from project
      const mockVideoData = Buffer.from('mock video data');
      return exportAsGIF(input.projectId, mockVideoData, input.fps);
    }),

  validateExportOptions: protectedProcedure
    .input(
      z.object({
        format: z.enum(['mp4', 'webm', 'gif']),
        quality: z.enum(['low', 'medium', 'high']).optional(),
        fps: z.number().optional(),
      })
    )
    .query(({ input }) => {
      return validateExportOptions(input);
    }),
});
