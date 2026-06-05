/**
 * Saved Media Routers
 * tRPC procedures لإدارة الملفات المحفوظة
 */

import { router } from './_core/trpc';
import { protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import { getDb } from './db';
import { generatedMediaFiles, mediaFileDownloads } from '../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

export const savedMediaRouter = router({
  // الحصول على جميع الملفات المحفوظة للمستخدم
  getAll: protectedProcedure
    .input(
      z.object({
        type: z.enum(['all', 'video', 'image', 'audio']).optional(),
        sortBy: z.enum(['recent', 'popular', 'largest']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      let query = db
        .select()
        .from(generatedMediaFiles)
        .where(eq(generatedMediaFiles.userId, ctx.user.id));

      // فلتر حسب النوع
      if (input.type && input.type !== 'all') {
        query = query.where(eq(generatedMediaFiles.mediaType, input.type));
      }

      // الترتيب
      if (input.sortBy === 'popular') {
        query = query.orderBy(desc(generatedMediaFiles.downloadCount));
      } else if (input.sortBy === 'largest') {
        query = query.orderBy(desc(generatedMediaFiles.fileSize));
      } else {
        query = query.orderBy(desc(generatedMediaFiles.createdAt));
      }

      const files = await query;

      // فلتر البحث (في الذاكرة)
      if (input.search) {
        return files.filter((f) =>
          f.title.toLowerCase().includes(input.search!.toLowerCase())
        );
      }

      return files;
    }),

  // الحصول على ملف واحد
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const file = await db
        .select()
        .from(generatedMediaFiles)
        .where(
          and(
            eq(generatedMediaFiles.id, input.id),
            eq(generatedMediaFiles.userId, ctx.user.id)
          )
        )
        .limit(1);

      return file[0] || null;
    }),

  // حفظ ملف جديد
  save: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        mediaType: z.enum(['video', 'image', 'audio']),
        format: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        duration: z.number().optional(),
        thumbnail: z.string().optional(),
        quality: z.string().optional(),
        style: z.string().optional(),
        hasAudio: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const result = await db.insert(generatedMediaFiles).values({
        userId: ctx.user.id,
        title: input.title,
        mediaType: input.mediaType,
        format: input.format,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        duration: input.duration,
        thumbnail: input.thumbnail,
        quality: input.quality,
        style: input.style,
        hasAudio: input.hasAudio,
        downloadCount: 0,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
      });

      return result;
    }),

  // تحديث الملف
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        quality: z.string().optional(),
        style: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const result = await db
        .update(generatedMediaFiles)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.quality && { quality: input.quality }),
          ...(input.style && { style: input.style }),
        })
        .where(
          and(
            eq(generatedMediaFiles.id, input.id),
            eq(generatedMediaFiles.userId, ctx.user.id)
          )
        );

      return result;
    }),

  // حذف الملف
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const result = await db
        .delete(generatedMediaFiles)
        .where(
          and(
            eq(generatedMediaFiles.id, input.id),
            eq(generatedMediaFiles.userId, ctx.user.id)
          )
        );

      return result;
    }),

  // تسجيل تنزيل
  recordDownload: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // تحديث عدد التنزيلات
      await db
        .update(generatedMediaFiles)
        .set({
          downloadCount: (await db
            .select()
            .from(generatedMediaFiles)
            .where(eq(generatedMediaFiles.id, input.fileId))
            .limit(1))[0]?.downloadCount + 1 || 1,
        })
        .where(eq(generatedMediaFiles.id, input.fileId));

      // تسجيل التنزيل
      const result = await db.insert(mediaFileDownloads).values({
        fileId: input.fileId,
        userId: ctx.user.id,
        downloadedAt: new Date(),
      });

      return result;
    }),

  // الحصول على الإحصائيات
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    
    const files = await db
      .select()
      .from(generatedMediaFiles)
      .where(eq(generatedMediaFiles.userId, ctx.user.id));

    const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
    const totalDownloads = files.reduce((sum, f) => sum + (f.downloadCount || 0), 0);
    const videoCount = files.filter((f) => f.mediaType === 'video').length;
    const imageCount = files.filter((f) => f.mediaType === 'image').length;
    const audioCount = files.filter((f) => f.mediaType === 'audio').length;

    return {
      totalFiles: files.length,
      totalSize,
      totalDownloads,
      videoCount,
      imageCount,
      audioCount,
    };
  }),
});
