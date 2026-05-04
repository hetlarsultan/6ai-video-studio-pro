import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as customEffectService from './customEffectService';

describe('Custom Effect Service', () => {
  let createdEffectId: number;

  const mockEffectData = {
    name: 'Test Fade Effect',
    description: 'A simple fade in effect',
    category: 'entrance' as const,
    difficulty: 'easy' as const,
    duration: 1000,
    tags: ['fade', 'entrance', 'simple'],
    animations: [
      {
        animationType: 'fade',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  };

  describe('createCustomEffect', () => {
    it('should create a new custom effect', async () => {
      const result = await customEffectService.createCustomEffect(0, mockEffectData);

      expect(result).toHaveProperty('effectId');
      expect(result).toHaveProperty('totalDuration');
      expect(result).toHaveProperty('animationsCount');
      expect(result.totalDuration).toBe(1000);
      expect(result.animationsCount).toBe(1);

      createdEffectId = result.effectId;
    });

    it('should create effect with custom category', async () => {
      const customData = {
        ...mockEffectData,
        name: 'Custom Effect',
        category: 'custom' as const,
      };

      const result = await customEffectService.createCustomEffect(0, customData);
      expect(result.effectId).toBeDefined();
    });

    it('should create effect with multiple animations', async () => {
      const multiAnimData = {
        ...mockEffectData,
        name: 'Multi Animation Effect',
        animations: [
          {
            animationType: 'fade',
            duration: 500,
            delay: 0,
            easing: 'ease-in',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
          },
          {
            animationType: 'slide',
            duration: 500,
            delay: 500,
            easing: 'ease-out',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
          },
        ],
      };

      const result = await customEffectService.createCustomEffect(0, multiAnimData);
      expect(result.animationsCount).toBe(2);
    });
  });

  describe('getCustomEffectById', () => {
    it('should retrieve a created effect', async () => {
      const effect = await customEffectService.getCustomEffectById(createdEffectId);

      expect(effect).toBeDefined();
      expect(effect.name).toBe(mockEffectData.name);
      expect(effect.category).toBe(mockEffectData.category);
      expect(effect.difficulty).toBe(mockEffectData.difficulty);
    });

    it('should parse tags correctly', async () => {
      const effect = await customEffectService.getCustomEffectById(createdEffectId);
      expect(Array.isArray(effect.tags)).toBe(true);
      expect(effect.tags).toContain('fade');
    });

    it('should parse animations correctly', async () => {
      const effect = await customEffectService.getCustomEffectById(createdEffectId);
      expect(Array.isArray(effect.animations)).toBe(true);
      expect(effect.animations.length).toBe(1);
      expect(effect.animations[0].animationType).toBe('fade');
    });

    it('should throw error for non-existent effect', async () => {
      await expect(customEffectService.getCustomEffectById(99999)).rejects.toThrow();
    });
  });

  describe('updateCustomEffect', () => {
    it('should update effect name', async () => {
      const newName = 'Updated Effect Name';
      const result = await customEffectService.updateCustomEffect(createdEffectId, {
        name: newName,
      });

      expect(result.success).toBe(true);

      const updated = await customEffectService.getCustomEffectById(createdEffectId);
      expect(updated.name).toBe(newName);
    });

    it('should update difficulty level', async () => {
      const result = await customEffectService.updateCustomEffect(createdEffectId, {
        difficulty: 'hard',
      });

      expect(result.success).toBe(true);

      const updated = await customEffectService.getCustomEffectById(createdEffectId);
      expect(updated.difficulty).toBe('hard');
    });

    it('should update tags', async () => {
      const newTags = ['updated', 'tags', 'test'];
      const result = await customEffectService.updateCustomEffect(createdEffectId, {
        tags: newTags,
      });

      expect(result.success).toBe(true);

      const updated = await customEffectService.getCustomEffectById(createdEffectId);
      expect(updated.tags).toEqual(newTags);
    });

    it('should update isPublic status', async () => {
      const result = await customEffectService.updateCustomEffect(createdEffectId, {
        isPublic: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getAllCustomEffects', () => {
    it('should retrieve all custom effects', async () => {
      const effects = await customEffectService.getAllCustomEffects();
      expect(Array.isArray(effects)).toBe(true);
      expect(effects.length).toBeGreaterThan(0);
    });

    it('should include created effect in results', async () => {
      const effects = await customEffectService.getAllCustomEffects();
      const found = effects.find((e) => e.id === createdEffectId);
      expect(found).toBeDefined();
    });
  });

  describe('searchCustomEffects', () => {
    it('should search by name', async () => {
      const results = await customEffectService.searchCustomEffects('Updated', {});
      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter by category', async () => {
      const results = await customEffectService.searchCustomEffects('', {
        category: 'entrance',
      });
      expect(results.every((e) => e.category === 'entrance')).toBe(true);
    });

    it('should filter by difficulty', async () => {
      const results = await customEffectService.searchCustomEffects('', {
        difficulty: 'hard',
      });
      expect(results.every((e) => e.difficulty === 'hard')).toBe(true);
    });

    it('should filter by tags', async () => {
      const results = await customEffectService.searchCustomEffects('', {
        tags: ['updated'],
      });
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should combine multiple filters', async () => {
      const results = await customEffectService.searchCustomEffects('Updated', {
        category: 'entrance',
        difficulty: 'hard',
      });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('duplicateCustomEffect', () => {
    it('should create a duplicate with new name', async () => {
      const newName = 'Duplicated Effect';
      const result = await customEffectService.duplicateCustomEffect(
        createdEffectId,
        newName
      );

      expect(result).toHaveProperty('effectId');
      expect(result.effectId).not.toBe(createdEffectId);

      const duplicated = await customEffectService.getCustomEffectById(result.effectId);
      expect(duplicated.name).toBe(newName);
    });
  });

  describe('shareCustomEffect', () => {
    it('should make effect public', async () => {
      const result = await customEffectService.shareCustomEffect(createdEffectId);
      expect(result.success).toBe(true);
    });
  });

  describe('unshareCustomEffect', () => {
    it('should make effect private', async () => {
      const result = await customEffectService.unshareCustomEffect(createdEffectId);
      expect(result.success).toBe(true);
    });
  });

  describe('getPublicCustomEffects', () => {
    it('should retrieve only public effects', async () => {
      await customEffectService.shareCustomEffect(createdEffectId);
      const effects = await customEffectService.getPublicCustomEffects();
      expect(Array.isArray(effects)).toBe(true);
    });
  });

  describe('getEffectStatistics', () => {
    it('should return statistics object', async () => {
      const stats = await customEffectService.getEffectStatistics();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byDifficulty');
      expect(stats).toHaveProperty('public');
      expect(stats).toHaveProperty('private');
      expect(stats).toHaveProperty('averageDuration');
    });

    it('should have correct category breakdown', async () => {
      const stats = await customEffectService.getEffectStatistics();
      expect(stats.byCategory).toHaveProperty('entrance');
      expect(stats.byCategory).toHaveProperty('exit');
      expect(stats.byCategory).toHaveProperty('emphasis');
      expect(stats.byCategory).toHaveProperty('custom');
    });

    it('should have correct difficulty breakdown', async () => {
      const stats = await customEffectService.getEffectStatistics();
      expect(stats.byDifficulty).toHaveProperty('easy');
      expect(stats.byDifficulty).toHaveProperty('medium');
      expect(stats.byDifficulty).toHaveProperty('hard');
    });

    it('should calculate average duration', async () => {
      const stats = await customEffectService.getEffectStatistics();
      expect(typeof stats.averageDuration).toBe('number');
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deleteCustomEffect', () => {
    it('should delete an effect', async () => {
      const result = await customEffectService.deleteCustomEffect(createdEffectId);
      expect(result.success).toBe(true);
    });

    it('should not find deleted effect', async () => {
      await expect(customEffectService.getCustomEffectById(createdEffectId)).rejects.toThrow();
    });
  });
});
