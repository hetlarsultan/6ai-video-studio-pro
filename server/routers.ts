import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { advancedRouter } from "./advancedRouters";
import { templatesSystemRouter } from "./templateRouters";
import { editorSystemRouter } from "./editorRouters";
import { animationRouter, transitionRouter, presetRouter } from "./animationRouters";
import { effectGroupRouter, effectLibraryRouter } from "./effectGroupRouters";
import { customEffectRouter } from "./customEffectRouters";
import { timelineRouter, segmentEffectsRouter } from "./timelineRouters";
import { sharingRouter } from "./sharingRouters";
import { exportRouter } from "./exportRouters";
import { contentGenerationRouter } from "./contentGenerationRouters";
import { sceneRouter } from "./sceneRouters";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  advanced: advancedRouter,
  templates: templatesSystemRouter,
  editor: editorSystemRouter,
  animation: animationRouter,
  transition: transitionRouter,
  preset: presetRouter,
  effectGroup: effectGroupRouter,
  effectLibrary: effectLibraryRouter,
  customEffect: customEffectRouter,
  videoTimeline: timelineRouter,
  segmentEffects: segmentEffectsRouter,
  sharing: sharingRouter,
  export: exportRouter,
  contentGeneration: contentGenerationRouter,
  scene: sceneRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
