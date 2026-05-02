import { eq } from 'drizzle-orm';
import { getDb } from './db';
import {
  elementAnimations,
  animationTimeline,
  InsertElementAnimation,
  InsertAnimationTimeline,
} from '../drizzle/schema';
import * as effectsLibrary from './effectsLibrary';

/**
 * Effect Group Service
 * Manages applying effect groups to elements
 */

/**
 * Apply an effect group to an element
 */
export async function applyEffectGroupToElement(
  elementId: number,
  projectId: number,
  effectId: string,
  startTime: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const effect = effectsLibrary.getEffectById(effectId);
  if (!effect) {
    throw new Error(`Effect ${effectId} not found`);
  }

  const results = [];
  let currentTime = startTime;

  // Apply each animation in the effect group
  for (const animConfig of effect.animations) {
    // Create animation
    const animationData: InsertElementAnimation = {
      elementId,
      projectId,
      animationType: animConfig.animationType as any,
      duration: animConfig.duration,
      delay: animConfig.delay,
      easing: animConfig.easing as any,
      iterations: animConfig.iterations,
      direction: animConfig.direction as any,
      fillMode: animConfig.fillMode as any,
      enabled: 1,
    };

    const animResult = await db.insert(elementAnimations).values(animationData);
    const animationId = (animResult as any).insertId;

    // Create timeline entry
    const endTime = currentTime + animConfig.duration + animConfig.delay;
    const timelineData: InsertAnimationTimeline = {
      projectId,
      elementId,
      startTime: currentTime,
      endTime,
      animationId,
      sequenceOrder: results.length,
      triggerType: 'auto',
    };

    await db.insert(animationTimeline).values(timelineData);

    results.push({
      animationId,
      duration: animConfig.duration,
      delay: animConfig.delay,
    });

    currentTime = endTime;
  }

  return {
    effectId,
    elementId,
    animationsApplied: results.length,
    totalDuration: currentTime - startTime,
  };
}

/**
 * Apply an effect group to multiple elements
 */
export async function applyEffectGroupToElements(
  elementIds: number[],
  projectId: number,
  effectId: string,
  startTime: number = 0
) {
  const results = [];

  for (const elementId of elementIds) {
    const result = await applyEffectGroupToElement(
      elementId,
      projectId,
      effectId,
      startTime
    );
    results.push(result);
  }

  return {
    effectId,
    elementsAffected: elementIds.length,
    results,
  };
}

/**
 * Get all available effect groups
 */
export function getAllEffectGroups() {
  return effectsLibrary.getAllEffectGroups();
}

/**
 * Get effect groups by category
 */
export function getEffectsByCategory(
  category: 'entrance' | 'exit' | 'emphasis' | 'custom'
) {
  return effectsLibrary.getEffectsByCategory(category);
}

/**
 * Get effect group details
 */
export function getEffectDetails(effectId: string) {
  const effect = effectsLibrary.getEffectById(effectId);
  if (!effect) {
    throw new Error(`Effect ${effectId} not found`);
  }
  return effect;
}

/**
 * Search effects by tags
 */
export function searchEffects(tags: string[]) {
  return effectsLibrary.searchEffectsByTags(tags);
}

/**
 * Get effects by difficulty level
 */
export function getEffectsByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
) {
  return effectsLibrary.getEffectsByDifficulty(difficulty);
}

/**
 * Get recommended effects
 */
export function getRecommendedEffects(category: string) {
  return effectsLibrary.getRecommendedEffects(category);
}

/**
 * Get effect statistics
 */
export function getEffectStatistics() {
  const allEffects = effectsLibrary.getAllEffectGroups();

  const stats = {
    total: allEffects.length,
    byCategory: {
      entrance: effectsLibrary.getEffectsByCategory('entrance').length,
      exit: effectsLibrary.getEffectsByCategory('exit').length,
      emphasis: effectsLibrary.getEffectsByCategory('emphasis').length,
      custom: effectsLibrary.getEffectsByCategory('custom').length,
    },
    byDifficulty: {
      easy: effectsLibrary.getEffectsByDifficulty('easy').length,
      medium: effectsLibrary.getEffectsByDifficulty('medium').length,
      hard: effectsLibrary.getEffectsByDifficulty('hard').length,
    },
    averageDuration:
      allEffects.reduce((sum, e) => sum + e.duration, 0) / allEffects.length,
    tags: Array.from(
      new Set(allEffects.flatMap((e) => e.tags))
    ),
  };

  return stats;
}

/**
 * Validate effect group
 */
export function validateEffectGroup(effect: any): boolean {
  if (!effect.id || !effect.name || !effect.category) {
    return false;
  }

  if (!Array.isArray(effect.animations) || effect.animations.length === 0) {
    return false;
  }

  const validCategories = ['entrance', 'exit', 'emphasis', 'custom'];
  if (!validCategories.includes(effect.category)) {
    return false;
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(effect.difficulty)) {
    return false;
  }

  return true;
}

/**
 * Create custom effect group
 */
export function createCustomEffectGroup(
  id: string,
  name: string,
  nameAr: string,
  animations: any[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  tags: string[] = []
): effectsLibrary.EffectGroup {
  const totalDuration = animations.reduce(
    (sum, a) => sum + a.duration + a.delay,
    0
  );

  return {
    id,
    name,
    nameAr,
    description: `Custom effect: ${name}`,
    descriptionAr: `تأثير مخصص: ${nameAr}`,
    category: 'custom',
    icon: '✨',
    animations,
    difficulty,
    duration: totalDuration,
    tags,
  };
}

/**
 * Combine multiple effects
 */
export function combineEffects(
  effectIds: string[],
  newId: string,
  newName: string,
  newNameAr: string
): effectsLibrary.EffectGroup | null {
  const effects = effectIds
    .map((id) => effectsLibrary.getEffectById(id))
    .filter((e) => e !== undefined) as effectsLibrary.EffectGroup[];

  if (effects.length === 0) {
    return null;
  }

  const combinedAnimations = effects.flatMap((e) => e.animations);
  const totalDuration = effects.reduce((sum, e) => sum + e.duration, 0);
  const allTags = Array.from(new Set(effects.flatMap((e) => e.tags)));

  return {
    id: newId,
    name: newName,
    nameAr: newNameAr,
    description: `Combined effect from: ${effects.map((e) => e.name).join(', ')}`,
    descriptionAr: `تأثير مركب من: ${effects.map((e) => e.nameAr).join(', ')}`,
    category: 'custom',
    icon: '🎬',
    animations: combinedAnimations,
    difficulty: 'hard',
    duration: totalDuration,
    tags: allTags,
  };
}

/**
 * Get effect preview data
 */
export function getEffectPreview(effectId: string) {
  const effect = effectsLibrary.getEffectById(effectId);
  if (!effect) {
    throw new Error(`Effect ${effectId} not found`);
  }

  return {
    id: effect.id,
    name: effect.name,
    nameAr: effect.nameAr,
    icon: effect.icon,
    duration: effect.duration,
    animationCount: effect.animations.length,
    difficulty: effect.difficulty,
    category: effect.category,
    tags: effect.tags,
  };
}
