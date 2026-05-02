import { eq, and } from 'drizzle-orm';
import { getDb } from './db';
import {
  elementAnimations,
  transitionEffects,
  animationTimeline,
  animationPresets,
  InsertElementAnimation,
  InsertTransitionEffect,
  InsertAnimationTimeline,
  InsertAnimationPreset,
} from '../drizzle/schema';

/**
 * Animation Service
 * Manages animations, transitions, and timeline sequencing
 */

/**
 * Create a new animation for an element
 */
export async function createAnimation(data: InsertElementAnimation) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(elementAnimations).values(data);
  return result;
}

/**
 * Get all animations for an element
 */
export async function getElementAnimations(elementId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const animations = await db
    .select()
    .from(elementAnimations)
    .where(eq(elementAnimations.elementId, elementId));

  return animations;
}

/**
 * Get all animations for a project
 */
export async function getProjectAnimations(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const animations = await db
    .select()
    .from(elementAnimations)
    .where(eq(elementAnimations.projectId, projectId));

  return animations;
}

/**
 * Update an animation
 */
export async function updateAnimation(
  animationId: number,
  data: Partial<InsertElementAnimation>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(elementAnimations)
    .set(data)
    .where(eq(elementAnimations.id, animationId));
}

/**
 * Delete an animation
 */
export async function deleteAnimation(animationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .delete(elementAnimations)
    .where(eq(elementAnimations.id, animationId));
}

/**
 * Create a transition effect
 */
export async function createTransition(data: InsertTransitionEffect) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(transitionEffects).values(data);
  return result;
}

/**
 * Get all transitions for an element
 */
export async function getElementTransitions(elementId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const transitions = await db
    .select()
    .from(transitionEffects)
    .where(eq(transitionEffects.elementId, elementId));

  return transitions;
}

/**
 * Update a transition
 */
export async function updateTransition(
  transitionId: number,
  data: Partial<InsertTransitionEffect>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(transitionEffects)
    .set(data)
    .where(eq(transitionEffects.id, transitionId));
}

/**
 * Delete a transition
 */
export async function deleteTransition(transitionId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .delete(transitionEffects)
    .where(eq(transitionEffects.id, transitionId));
}

/**
 * Create a timeline entry
 */
export async function createTimelineEntry(data: InsertAnimationTimeline) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(animationTimeline).values(data);
  return result;
}

/**
 * Get timeline for a project
 */
export async function getProjectTimeline(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const timeline = await db
    .select()
    .from(animationTimeline)
    .where(eq(animationTimeline.projectId, projectId));

  return timeline.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
}

/**
 * Get timeline for an element
 */
export async function getElementTimeline(elementId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const timeline = await db
    .select()
    .from(animationTimeline)
    .where(eq(animationTimeline.elementId, elementId));

  return timeline.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
}

/**
 * Update timeline entry
 */
export async function updateTimelineEntry(
  timelineId: number,
  data: Partial<InsertAnimationTimeline>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(animationTimeline)
    .set(data)
    .where(eq(animationTimeline.id, timelineId));
}

/**
 * Delete timeline entry
 */
export async function deleteTimelineEntry(timelineId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .delete(animationTimeline)
    .where(eq(animationTimeline.id, timelineId));
}

/**
 * Get all animation presets
 */
export async function getAllPresets() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const presets = await db
    .select()
    .from(animationPresets)
    .where(eq(animationPresets.isPublic, 1));

  return presets;
}

/**
 * Get presets by category
 */
export async function getPresetsByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const presets = await db
    .select()
    .from(animationPresets)
    .where(
      and(
        eq(animationPresets.category, category),
        eq(animationPresets.isPublic, 1)
      )
    );

  return presets;
}

/**
 * Create an animation preset
 */
export async function createPreset(data: InsertAnimationPreset) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(animationPresets).values(data);
  return result;
}

/**
 * Generate CSS keyframes from animation config
 */
export function generateKeyframes(
  animationType: string,
  customKeyframes?: string
): string {
  if (customKeyframes) {
    return customKeyframes;
  }

  const keyframesMap: Record<string, string> = {
    fade: `
      @keyframes fadeAnimation {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    slide: `
      @keyframes slideAnimation {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
    `,
    zoom: `
      @keyframes zoomAnimation {
        from { transform: scale(0.5); }
        to { transform: scale(1); }
      }
    `,
    rotate: `
      @keyframes rotateAnimation {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    bounce: `
      @keyframes bounceAnimation {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `,
    flip: `
      @keyframes flipAnimation {
        from { transform: rotateY(0deg); }
        to { transform: rotateY(360deg); }
      }
    `,
    swing: `
      @keyframes swingAnimation {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(5deg); }
      }
    `,
    pulse: `
      @keyframes pulseAnimation {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    shake: `
      @keyframes shakeAnimation {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
    `,
    heartbeat: `
      @keyframes heartbeatAnimation {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.3); }
        50% { transform: scale(1); }
      }
    `,
  };

  return keyframesMap[animationType] || keyframesMap.fade;
}

/**
 * Generate CSS animation string
 */
export function generateAnimationCSS(
  animationType: string,
  duration: number,
  delay: number,
  easing: string,
  iterations: number,
  direction: string,
  fillMode: string
): string {
  return `
    animation: ${animationType}Animation ${duration}ms ${easing} ${delay}ms ${iterations === -1 ? 'infinite' : iterations} ${direction} ${fillMode};
  `;
}

/**
 * Generate CSS transition string
 */
export function generateTransitionCSS(
  duration: number,
  delay: number,
  easing: string
): string {
  return `
    transition: all ${duration}ms ${easing} ${delay}ms;
  `;
}

/**
 * Validate animation configuration
 */
export function validateAnimationConfig(config: any): boolean {
  const validAnimationTypes = [
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
  ];

  const validEasings = [
    'linear',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'cubic-bezier',
  ];

  if (!validAnimationTypes.includes(config.animationType)) {
    return false;
  }

  if (!validEasings.includes(config.easing)) {
    return false;
  }

  if (config.duration < 0 || config.delay < 0) {
    return false;
  }

  if (config.iterations < -1 || config.iterations === 0) {
    return false;
  }

  return true;
}

/**
 * Batch create animations from preset
 */
export async function applyPresetAnimations(
  projectId: number,
  elementIds: number[],
  presetId: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const preset = await db
    .select()
    .from(animationPresets)
    .where(eq(animationPresets.id, presetId));

  if (!preset.length) {
    throw new Error('Preset not found');
  }

  const animations = JSON.parse(preset[0].animations || '[]');
  const results = [];

  for (const elementId of elementIds) {
    for (const animation of animations) {
      const result = await createAnimation({
        ...animation,
        elementId,
        projectId,
      });
      results.push(result);
    }
  }

  return results;
}
