import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { sceneService } from './sceneService';

export const sceneRouter = router({
  /**
   * الحصول على جميع مشاهد المشروع
   */
  getProjectScenes: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const scenes = await sceneService.getProjectScenes(input.projectId);
        return {
          success: true,
          scenes,
        };
      } catch (error) {
        return {
          success: false,
          error: 'فشل تحميل المشاهد',
          scenes: [],
        };
      }
    }),

  /**
   * إنشاء مشهد جديد
   */
  createScene: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1),
        description: z.string(),
        duration: z.number().positive(),
        videoUrl: z.string().url(),
        thumbnailUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const scene = await sceneService.createScene(
          input.projectId,
          input.title,
          input.description,
          input.duration,
          input.videoUrl,
          input.thumbnailUrl
        );

        return {
          success: true,
          scene,
        };
      } catch (error) {
        return {
          success: false,
          error: 'فشل إنشاء المشهد',
          scene: null,
        };
      }
    }),

  /**
   * حفظ مشهد
   */
  saveScene: protectedProcedure
    .input(z.object({ sceneId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await sceneService.saveScene(input.sceneId);
        return {
          success,
          message: success ? 'تم حفظ المشهد بنجاح' : 'فشل حفظ المشهد',
        };
      } catch (error) {
        return {
          success: false,
          message: 'حدث خطأ أثناء حفظ المشهد',
        };
      }
    }),

  /**
   * حذف مشهد
   */
  deleteScene: protectedProcedure
    .input(z.object({ sceneId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await sceneService.deleteScene(input.sceneId);
        return {
          success,
          message: success ? 'تم حذف المشهد بنجاح' : 'فشل حذف المشهد',
        };
      } catch (error) {
        return {
          success: false,
          message: 'حدث خطأ أثناء حذف المشهد',
        };
      }
    }),

  /**
   * أرشفة مشهد
   */
  archiveScene: protectedProcedure
    .input(z.object({ sceneId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await sceneService.archiveScene(input.sceneId);
        return {
          success,
          message: success ? 'تم أرشفة المشهد بنجاح' : 'فشل أرشفة المشهد',
        };
      } catch (error) {
        return {
          success: false,
          message: 'حدث خطأ أثناء أرشفة المشهد',
        };
      }
    }),

  /**
   * الحصول على إحصائيات المشاهد
   */
  getSceneStats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const stats = await sceneService.getSceneStats(input.projectId);
        return {
          success: true,
          stats,
        };
      } catch (error) {
        return {
          success: false,
          error: 'فشل الحصول على الإحصائيات',
          stats: null,
        };
      }
    }),

  /**
   * البحث عن المشاهد
   */
  searchScenes: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        query: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const scenes = await sceneService.searchScenes(
          input.projectId,
          input.query
        );
        return {
          success: true,
          scenes,
        };
      } catch (error) {
        return {
          success: false,
          error: 'فشل البحث',
          scenes: [],
        };
      }
    }),

  /**
   * ترتيب المشاهد
   */
  sortScenes: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sortBy: z.enum(['date', 'duration', 'title']),
      })
    )
    .query(async ({ input }) => {
      try {
        const scenes = await sceneService.sortScenes(
          input.projectId,
          input.sortBy
        );
        return {
          success: true,
          scenes,
        };
      } catch (error) {
        return {
          success: false,
          error: 'فشل الترتيب',
          scenes: [],
        };
      }
    }),

  /**
   * تصدير المشاهد كـ ZIP
   */
  exportScenesAsZip: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const zipBuffer = await sceneService.exportScenesAsZip(
          input.projectId
        );
        if (!zipBuffer) {
          return {
            success: false,
            error: 'لا توجد مشاهد للتصدير',
            url: null,
          };
        }

        // في التطبيق الحقيقي، سيتم حفظ الملف على S3
        // const { url } = await storagePut(`exports/scenes-${projectId}.zip`, zipBuffer, 'application/zip');

        return {
          success: true,
          url: 'https://example.com/scenes-export.zip',
        };
      } catch (error) {
        return {
          success: false,
          error: 'فشل التصدير',
          url: null,
        };
      }
    }),
});
