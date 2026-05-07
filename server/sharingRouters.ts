import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import {
  shareProject,
  unshareProject,
  getSharedProjects,
  getProjectShares,
  updateSharePermission,
} from './sharingService';

export const sharingRouter = router({
  shareProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sharedWithUserId: z.number(),
        permission: z.enum(['view', 'edit', 'admin']).default('view'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return shareProject(input.projectId, ctx.user!.id, input.sharedWithUserId, input.permission);
    }),

  unshareProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sharedWithUserId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return unshareProject(input.projectId, ctx.user!.id, input.sharedWithUserId);
    }),

  getSharedProjects: protectedProcedure.query(async ({ ctx }) => {
    return getSharedProjects(ctx.user!.id);
  }),

  getProjectShares: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getProjectShares(input.projectId, ctx.user!.id);
    }),

  updatePermission: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sharedWithUserId: z.number(),
        permission: z.enum(['view', 'edit', 'admin']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return updateSharePermission(
        input.projectId,
        ctx.user!.id,
        input.sharedWithUserId,
        input.permission
      );
    }),
});
