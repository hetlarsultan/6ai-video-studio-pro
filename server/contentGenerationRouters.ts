import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import {
  generateVideoFromText,
  generateImageFromText,
  generateAudioFromText,
  getGenerationStatus,
  cancelGeneration,
} from './contentGenerationService';

export const contentGenerationRouter = router({
  // تحويل النص إلى فيديو
  generateVideo: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        duration: z.number().min(10).max(1200), // 10 ثانية إلى 20 دقيقة
        quality: z.enum(['low', 'medium', 'high']).default('medium'),
        speed: z.number().min(0.5).max(2).default(1),
        style: z.enum(['cinematic', 'documentary', 'animated', 'minimal']).default('cinematic'),
        projectId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return generateVideoFromText(
        input.projectId,
        ctx.user!.id,
        input.text,
        input.duration,
        input.quality,
        input.speed,
        input.style
      );
    }),

  // تحويل النص إلى صور
  generateImage: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(1000),
        count: z.number().min(1).max(10).default(1),
        quality: z.enum(['low', 'medium', 'high']).default('high'),
        style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract']).default('realistic'),
        projectId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return generateImageFromText(
        input.projectId,
        ctx.user!.id,
        input.text,
        input.count,
        input.quality,
        input.style
      );
    }),

  // تحويل النص إلى صوت
  generateAudio: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        voice: z.enum(['male', 'female', 'neutral']).default('neutral'),
        language: z.enum(['ar', 'en', 'fr']).default('ar'),
        speed: z.number().min(0.5).max(2).default(1),
        projectId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return generateAudioFromText(
        input.projectId,
        ctx.user!.id,
        input.text,
        input.voice,
        input.language,
        input.speed
      );
    }),

  // الحصول على حالة المعالجة
  getStatus: protectedProcedure
    .input(
      z.object({
        generationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getGenerationStatus(input.generationId, ctx.user!.id);
    }),

  // إلغاء المعالجة
  cancel: protectedProcedure
    .input(
      z.object({
        generationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return cancelGeneration(input.generationId, ctx.user!.id);
    }),
});
