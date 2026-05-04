import { eq } from 'drizzle-orm';
import { getDb } from './db';
import {
  animationPresets,
  InsertAnimationPreset,
} from '../drizzle/schema';

/**
 * Custom Effect Service
 * Manage user-created custom effects and animation groups
 */

/**
 * Create a new custom effect
 */
export async function createCustomEffect(
  data: {
    name: string;
    description: string;
    category: 'entrance' | 'exit' | 'emphasis' | 'custom';
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    tags: string[];
    animations: any[];
  }
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Create custom effect using animation presets
    const effectData: InsertAnimationPreset = {
      name: data.name,
      description: data.description || '',
      category: data.category,
      difficulty: data.difficulty,
      duration: data.duration,
      tags: JSON.stringify(data.tags),
      animations: JSON.stringify(data.animations),
      isPublic: 0,
    };

    const result = await db.insert(animationPresets).values(effectData);
    const effectId = (result as any).insertId;

    return {
      effectId,
      totalDuration: data.duration,
      animationsCount: data.animations.length,
    };
  } catch (error) {
    throw new Error(`Failed to create custom effect: ${(error as Error).message}`);
  }
}

/**
 * Update a custom effect
 */
export async function updateCustomEffect(
  effectId: number,
  data: Partial<{
    name: string;
    description: string;
    category: 'entrance' | 'exit' | 'emphasis' | 'custom';
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    tags: string[];
    isPublic: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    if (data.isPublic !== undefined) {
      updateData.isPublic = data.isPublic ? 1 : 0;
    }

    await db
      .update(animationPresets)
      .set(updateData)
      .where(eq(animationPresets.id, effectId));

    return { success: true, effectId };
  } catch (error) {
    throw new Error(`Failed to update custom effect: ${(error as Error).message}`);
  }
}

/**
 * Delete a custom effect
 */
export async function deleteCustomEffect(effectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db
      .delete(animationPresets)
      .where(eq(animationPresets.id, effectId));

    return { success: true, effectId };
  } catch (error) {
    throw new Error(`Failed to delete custom effect: ${(error as Error).message}`);
  }
}

/**
 * Get custom effect by ID
 */
export async function getCustomEffectById(effectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const effects = await db
      .select()
      .from(animationPresets)
      .where(eq(animationPresets.id, effectId));

    if (effects.length === 0) {
      throw new Error('Effect not found');
    }

    const effect = effects[0];

    return {
      ...effect,
      category: effect.category as 'entrance' | 'exit' | 'emphasis' | 'custom',
      difficulty: effect.difficulty as 'easy' | 'medium' | 'hard',
      tags: JSON.parse(effect.tags || '[]'),
      animations: JSON.parse(effect.animations || '[]'),
    };
  } catch (error) {
    throw new Error(`Failed to get custom effect: ${(error as Error).message}`);
  }
}

/**
 * Get all custom effects
 */
export async function getAllCustomEffects() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const effects = await db
      .select()
      .from(animationPresets);

    return effects.map((effect) => ({
      ...effect,
      category: effect.category as 'entrance' | 'exit' | 'emphasis' | 'custom',
      difficulty: effect.difficulty as 'easy' | 'medium' | 'hard',
      tags: JSON.parse(effect.tags || '[]'),
      animations: JSON.parse(effect.animations || '[]'),
    }));
  } catch (error) {
    throw new Error(`Failed to get custom effects: ${(error as Error).message}`);
  }
}

/**
 * Search custom effects
 */
export async function searchCustomEffects(
  query: string,
  filters?: {
    category?: 'entrance' | 'exit' | 'emphasis' | 'custom';
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
  }
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    let effects = await db
      .select()
      .from(animationPresets);

    // Filter by search query
    if (query) {
      effects = effects.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by category
    if (filters?.category) {
      effects = effects.filter((e) => (e.category as string) === filters.category);
    }

    // Filter by difficulty
    if (filters?.difficulty) {
      effects = effects.filter((e) => (e.difficulty as string) === filters.difficulty);
    }

    // Filter by tags
    if (filters?.tags && filters.tags.length > 0) {
      effects = effects.filter((e) => {
        const effectTags = JSON.parse(e.tags || '[]');
        return filters.tags!.some((tag) => effectTags.includes(tag));
      });
    }

    return effects.map((effect) => ({
      ...effect,
      category: effect.category as 'entrance' | 'exit' | 'emphasis' | 'custom',
      difficulty: effect.difficulty as 'easy' | 'medium' | 'hard',
      tags: JSON.parse(effect.tags || '[]'),
      animations: JSON.parse(effect.animations || '[]'),
    }));
  } catch (error) {
    throw new Error(`Failed to search custom effects: ${(error as Error).message}`);
  }
}

/**
 * Duplicate a custom effect
 */
export async function duplicateCustomEffect(
  effectId: number,
  newName: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Get original effect
    const original = await getCustomEffectById(effectId);

    // Create new effect with same data but new name
    const newEffect = await createCustomEffect({
      name: newName,
      description: original.description || '',
      category: original.category,
      difficulty: original.difficulty,
      duration: original.duration,
      tags: original.tags,
      animations: original.animations,
    });

    return newEffect;
  } catch (error) {
    throw new Error(`Failed to duplicate custom effect: ${(error as Error).message}`);
  }
}

/**
 * Share a custom effect (make it public)
 */
export async function shareCustomEffect(effectId: number) {
  return updateCustomEffect(effectId, { isPublic: true });
}

/**
 * Unshare a custom effect (make it private)
 */
export async function unshareCustomEffect(effectId: number) {
  return updateCustomEffect(effectId, { isPublic: false });
}

/**
 * Get public custom effects
 */
export async function getPublicCustomEffects() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const effects = await db
      .select()
      .from(animationPresets)
      .where(eq(animationPresets.isPublic, 1));

    return effects.map((effect) => ({
      ...effect,
      category: effect.category as 'entrance' | 'exit' | 'emphasis' | 'custom',
      difficulty: effect.difficulty as 'easy' | 'medium' | 'hard',
      tags: JSON.parse(effect.tags || '[]'),
      animations: JSON.parse(effect.animations || '[]'),
    }));
  } catch (error) {
    throw new Error(`Failed to get public custom effects: ${(error as Error).message}`);
  }
}

/**
 * Get effect statistics
 */
export async function getEffectStatistics() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const effects = await db
      .select()
      .from(animationPresets);

    const stats = {
      total: effects.length,
      byCategory: {
        entrance: effects.filter((e) => e.category === 'entrance').length,
        exit: effects.filter((e) => e.category === 'exit').length,
        emphasis: effects.filter((e) => e.category === 'emphasis').length,
        custom: effects.filter((e) => e.category === 'custom').length,
      },
      byDifficulty: {
        easy: effects.filter((e) => e.difficulty === 'easy').length,
        medium: effects.filter((e) => e.difficulty === 'medium').length,
        hard: effects.filter((e) => e.difficulty === 'hard').length,
      },
      public: effects.filter((e) => e.isPublic === 1).length,
      private: effects.filter((e) => e.isPublic === 0).length,
      averageDuration:
        effects.length > 0
          ? effects.reduce((sum, e) => sum + e.duration, 0) / effects.length
          : 0,
    };

    return stats;
  } catch (error) {
    throw new Error(`Failed to get effect statistics: ${(error as Error).message}`);
  }
}
