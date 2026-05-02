import { describe, it, expect } from 'vitest';
import * as effectGroupService from './effectGroupService';
import * as effectsLibrary from './effectsLibrary';

describe('Effect Group Service', () => {
  describe('Get All Effect Groups', () => {
    it('should return all effect groups', () => {
      const effects = effectGroupService.getAllEffectGroups();
      expect(effects).toBeDefined();
      expect(Array.isArray(effects)).toBe(true);
      expect(effects.length).toBeGreaterThan(0);
    });

    it('should have all required properties', () => {
      const effects = effectGroupService.getAllEffectGroups();
      effects.forEach((effect) => {
        expect(effect.id).toBeDefined();
        expect(effect.name).toBeDefined();
        expect(effect.nameAr).toBeDefined();
        expect(effect.category).toBeDefined();
        expect(effect.animations).toBeDefined();
        expect(Array.isArray(effect.animations)).toBe(true);
      });
    });
  });

  describe('Get Effects by Category', () => {
    it('should get entrance effects', () => {
      const effects = effectGroupService.getEffectsByCategory('entrance');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.category).toBe('entrance');
      });
    });

    it('should get exit effects', () => {
      const effects = effectGroupService.getEffectsByCategory('exit');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.category).toBe('exit');
      });
    });

    it('should get emphasis effects', () => {
      const effects = effectGroupService.getEffectsByCategory('emphasis');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.category).toBe('emphasis');
      });
    });

    it('should get custom effects', () => {
      const effects = effectGroupService.getEffectsByCategory('custom');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.category).toBe('custom');
      });
    });
  });

  describe('Get Effect Details', () => {
    it('should get effect details by ID', () => {
      const effect = effectGroupService.getEffectDetails('fade-in');
      expect(effect).toBeDefined();
      expect(effect.id).toBe('fade-in');
      expect(effect.name).toBe('Fade In');
    });

    it('should throw error for invalid effect ID', () => {
      expect(() => {
        effectGroupService.getEffectDetails('invalid-effect');
      }).toThrow();
    });
  });

  describe('Get Effect Preview', () => {
    it('should get effect preview', () => {
      const preview = effectGroupService.getEffectPreview('fade-in');
      expect(preview).toBeDefined();
      expect(preview.id).toBe('fade-in');
      expect(preview.name).toBe('Fade In');
      expect(preview.duration).toBeGreaterThan(0);
      expect(preview.animationCount).toBeGreaterThan(0);
    });

    it('should include all preview properties', () => {
      const preview = effectGroupService.getEffectPreview('bounce-in');
      expect(preview.id).toBeDefined();
      expect(preview.name).toBeDefined();
      expect(preview.nameAr).toBeDefined();
      expect(preview.icon).toBeDefined();
      expect(preview.duration).toBeDefined();
      expect(preview.animationCount).toBeDefined();
      expect(preview.difficulty).toBeDefined();
      expect(preview.category).toBeDefined();
      expect(preview.tags).toBeDefined();
    });
  });

  describe('Search Effects by Tags', () => {
    it('should search effects by single tag', () => {
      const effects = effectGroupService.searchEffects(['smooth']);
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.tags).toContain('smooth');
      });
    });

    it('should search effects by multiple tags', () => {
      const effects = effectGroupService.searchEffects(['dramatic', 'modern']);
      expect(effects.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent tags', () => {
      const effects = effectGroupService.searchEffects(['nonexistent']);
      expect(effects.length).toBe(0);
    });
  });

  describe('Get Effects by Difficulty', () => {
    it('should get easy effects', () => {
      const effects = effectGroupService.getEffectsByDifficulty('easy');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.difficulty).toBe('easy');
      });
    });

    it('should get medium effects', () => {
      const effects = effectGroupService.getEffectsByDifficulty('medium');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.difficulty).toBe('medium');
      });
    });

    it('should get hard effects', () => {
      const effects = effectGroupService.getEffectsByDifficulty('hard');
      expect(effects.length).toBeGreaterThan(0);
      effects.forEach((effect) => {
        expect(effect.difficulty).toBe('hard');
      });
    });
  });

  describe('Get Recommended Effects', () => {
    it('should get recommended entrance effects', () => {
      const effects = effectGroupService.getRecommendedEffects('entrance');
      expect(effects.length).toBeGreaterThan(0);
      expect(effects.length).toBeLessThanOrEqual(3);
    });

    it('should get recommended exit effects', () => {
      const effects = effectGroupService.getRecommendedEffects('exit');
      expect(effects.length).toBeGreaterThan(0);
      expect(effects.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Get Effect Statistics', () => {
    it('should return statistics object', () => {
      const stats = effectGroupService.getEffectStatistics();
      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
    });

    it('should include category breakdown', () => {
      const stats = effectGroupService.getEffectStatistics();
      expect(stats.byCategory).toBeDefined();
      expect(stats.byCategory.entrance).toBeGreaterThan(0);
      expect(stats.byCategory.exit).toBeGreaterThan(0);
      expect(stats.byCategory.emphasis).toBeGreaterThan(0);
    });

    it('should include difficulty breakdown', () => {
      const stats = effectGroupService.getEffectStatistics();
      expect(stats.byDifficulty).toBeDefined();
      expect(stats.byDifficulty.easy).toBeGreaterThan(0);
      expect(stats.byDifficulty.medium).toBeGreaterThan(0);
      expect(stats.byDifficulty.hard).toBeGreaterThan(0);
    });

    it('should include average duration', () => {
      const stats = effectGroupService.getEffectStatistics();
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    it('should include tags list', () => {
      const stats = effectGroupService.getEffectStatistics();
      expect(Array.isArray(stats.tags)).toBe(true);
      expect(stats.tags.length).toBeGreaterThan(0);
    });
  });

  describe('Validate Effect Group', () => {
    it('should validate correct effect group', () => {
      const effect = effectGroupService.getEffectDetails('fade-in');
      expect(effectGroupService.validateEffectGroup(effect)).toBe(true);
    });

    it('should reject effect without id', () => {
      const invalidEffect = {
        name: 'Test',
        category: 'entrance',
        animations: [{ animationType: 'fade' }],
        difficulty: 'easy',
      };
      expect(effectGroupService.validateEffectGroup(invalidEffect)).toBe(false);
    });

    it('should reject effect without animations', () => {
      const invalidEffect = {
        id: 'test',
        name: 'Test',
        category: 'entrance',
        animations: [],
        difficulty: 'easy',
      };
      expect(effectGroupService.validateEffectGroup(invalidEffect)).toBe(false);
    });

    it('should reject effect with invalid category', () => {
      const invalidEffect = {
        id: 'test',
        name: 'Test',
        category: 'invalid',
        animations: [{ animationType: 'fade' }],
        difficulty: 'easy',
      };
      expect(effectGroupService.validateEffectGroup(invalidEffect)).toBe(false);
    });
  });

  describe('Create Custom Effect Group', () => {
    it('should create custom effect group', () => {
      const animations = [
        {
          animationType: 'fade',
          duration: 1000,
          delay: 0,
          easing: 'ease-in-out',
          iterations: 1,
          direction: 'normal',
          fillMode: 'forwards',
        },
      ];

      const customEffect = effectGroupService.createCustomEffectGroup(
        'custom-test',
        'Custom Test',
        'اختبار مخصص',
        animations,
        'medium',
        ['test', 'custom']
      );

      expect(customEffect.id).toBe('custom-test');
      expect(customEffect.name).toBe('Custom Test');
      expect(customEffect.nameAr).toBe('اختبار مخصص');
      expect(customEffect.category).toBe('custom');
      expect(customEffect.difficulty).toBe('medium');
      expect(customEffect.animations).toEqual(animations);
    });

    it('should calculate total duration correctly', () => {
      const animations = [
        {
          animationType: 'fade',
          duration: 1000,
          delay: 500,
          easing: 'ease-in-out',
          iterations: 1,
          direction: 'normal',
          fillMode: 'forwards',
        },
        {
          animationType: 'slide',
          duration: 800,
          delay: 200,
          easing: 'ease-out',
          iterations: 1,
          direction: 'normal',
          fillMode: 'forwards',
        },
      ];

      const customEffect = effectGroupService.createCustomEffectGroup(
        'custom-test',
        'Custom Test',
        'اختبار مخصص',
        animations
      );

      expect(customEffect.duration).toBe(2500); // (1000 + 500) + (800 + 200)
    });
  });

  describe('Combine Effects', () => {
    it('should combine multiple effects', () => {
      const combined = effectGroupService.combineEffects(
        ['fade-in', 'slide-in-left'],
        'combined-test',
        'Combined Test',
        'اختبار مركب'
      );

      expect(combined).toBeDefined();
      expect(combined?.id).toBe('combined-test');
      expect(combined?.name).toBe('Combined Test');
      expect(combined?.category).toBe('custom');
      expect(combined?.animations.length).toBeGreaterThan(1);
    });

    it('should return null for invalid effect IDs', () => {
      const combined = effectGroupService.combineEffects(
        ['invalid-1', 'invalid-2'],
        'combined-test',
        'Combined Test',
        'اختبار مركب'
      );

      expect(combined).toBeNull();
    });

    it('should combine tags from all effects', () => {
      const combined = effectGroupService.combineEffects(
        ['fade-in', 'bounce-in'],
        'combined-test',
        'Combined Test',
        'اختبار مركب'
      );

      expect(combined?.tags).toBeDefined();
      expect(combined?.tags.length).toBeGreaterThan(0);
    });
  });

  describe('Effect Categories', () => {
    it('should have entrance effects', () => {
      const entranceEffects = effectsLibrary.getEffectsByCategory('entrance');
      expect(entranceEffects.length).toBeGreaterThan(0);
    });

    it('should have exit effects', () => {
      const exitEffects = effectsLibrary.getEffectsByCategory('exit');
      expect(exitEffects.length).toBeGreaterThan(0);
    });

    it('should have emphasis effects', () => {
      const emphasisEffects = effectsLibrary.getEffectsByCategory('emphasis');
      expect(emphasisEffects.length).toBeGreaterThan(0);
    });

    it('should have custom effects', () => {
      const customEffects = effectsLibrary.getEffectsByCategory('custom');
      expect(customEffects.length).toBeGreaterThan(0);
    });
  });
});
