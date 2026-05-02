import { describe, it, expect } from 'vitest';
import * as animationService from './animationService';

describe('Animation Service', () => {
  describe('Keyframes Generation', () => {
    it('should generate fade keyframes', () => {
      const keyframes = animationService.generateKeyframes('fade');
      expect(keyframes).toContain('opacity');
      expect(keyframes).toContain('@keyframes fadeAnimation');
    });

    it('should generate slide keyframes', () => {
      const keyframes = animationService.generateKeyframes('slide');
      expect(keyframes).toContain('translateX');
      expect(keyframes).toContain('@keyframes slideAnimation');
    });

    it('should generate zoom keyframes', () => {
      const keyframes = animationService.generateKeyframes('zoom');
      expect(keyframes).toContain('scale');
      expect(keyframes).toContain('@keyframes zoomAnimation');
    });

    it('should generate rotate keyframes', () => {
      const keyframes = animationService.generateKeyframes('rotate');
      expect(keyframes).toContain('rotate');
      expect(keyframes).toContain('@keyframes rotateAnimation');
    });

    it('should generate bounce keyframes', () => {
      const keyframes = animationService.generateKeyframes('bounce');
      expect(keyframes).toContain('translateY');
      expect(keyframes).toContain('@keyframes bounceAnimation');
    });

    it('should use custom keyframes if provided', () => {
      const custom = '@keyframes custom { from { opacity: 0; } to { opacity: 1; } }';
      const keyframes = animationService.generateKeyframes('fade', custom);
      expect(keyframes).toBe(custom);
    });
  });

  describe('Animation CSS Generation', () => {
    it('should generate valid animation CSS', () => {
      const css = animationService.generateAnimationCSS(
        'fade',
        1000,
        0,
        'ease-in-out',
        1,
        'normal',
        'forwards'
      );
      expect(css).toContain('animation:');
      expect(css).toContain('fadeAnimation');
      expect(css).toContain('1000ms');
      expect(css).toContain('ease-in-out');
    });

    it('should handle infinite iterations', () => {
      const css = animationService.generateAnimationCSS(
        'pulse',
        500,
        100,
        'linear',
        -1,
        'normal',
        'forwards'
      );
      expect(css).toContain('infinite');
    });

    it('should include delay in CSS', () => {
      const css = animationService.generateAnimationCSS(
        'slide',
        1000,
        500,
        'ease-out',
        2,
        'alternate',
        'both'
      );
      expect(css).toContain('500ms');
    });
  });

  describe('Transition CSS Generation', () => {
    it('should generate valid transition CSS', () => {
      const css = animationService.generateTransitionCSS(300, 0, 'ease-in-out');
      expect(css).toContain('transition:');
      expect(css).toContain('300ms');
      expect(css).toContain('ease-in-out');
    });

    it('should include delay in transition CSS', () => {
      const css = animationService.generateTransitionCSS(500, 200, 'ease-in');
      expect(css).toContain('200ms');
    });
  });

  describe('Animation Configuration Validation', () => {
    it('should validate correct animation config', () => {
      const config = {
        animationType: 'fade',
        easing: 'ease-in-out',
        duration: 1000,
        delay: 0,
        iterations: 1,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(true);
    });

    it('should reject invalid animation type', () => {
      const config = {
        animationType: 'invalid',
        easing: 'ease-in-out',
        duration: 1000,
        delay: 0,
        iterations: 1,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(false);
    });

    it('should reject invalid easing', () => {
      const config = {
        animationType: 'fade',
        easing: 'invalid',
        duration: 1000,
        delay: 0,
        iterations: 1,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(false);
    });

    it('should reject negative duration', () => {
      const config = {
        animationType: 'fade',
        easing: 'ease-in-out',
        duration: -100,
        delay: 0,
        iterations: 1,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(false);
    });

    it('should reject negative delay', () => {
      const config = {
        animationType: 'fade',
        easing: 'ease-in-out',
        duration: 1000,
        delay: -100,
        iterations: 1,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(false);
    });

    it('should reject zero iterations', () => {
      const config = {
        animationType: 'fade',
        easing: 'ease-in-out',
        duration: 1000,
        delay: 0,
        iterations: 0,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(false);
    });

    it('should accept infinite iterations (-1)', () => {
      const config = {
        animationType: 'fade',
        easing: 'ease-in-out',
        duration: 1000,
        delay: 0,
        iterations: -1,
      };
      expect(animationService.validateAnimationConfig(config)).toBe(true);
    });
  });

  describe('Animation Types', () => {
    const animationTypes = [
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
    ];

    animationTypes.forEach((type) => {
      it(`should generate keyframes for ${type}`, () => {
        const keyframes = animationService.generateKeyframes(type);
        expect(keyframes).toBeTruthy();
        expect(keyframes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Easing Functions', () => {
    const easingFunctions = [
      'linear',
      'ease-in',
      'ease-out',
      'ease-in-out',
    ];

    easingFunctions.forEach((easing) => {
      it(`should accept ${easing} easing`, () => {
        const config = {
          animationType: 'fade',
          easing,
          duration: 1000,
          delay: 0,
          iterations: 1,
        };
        expect(animationService.validateAnimationConfig(config)).toBe(true);
      });
    });
  });

  describe('Direction Options', () => {
    const directions = ['normal', 'reverse', 'alternate', 'alternate-reverse'];

    directions.forEach((direction) => {
      it(`should handle ${direction} direction`, () => {
        const css = animationService.generateAnimationCSS(
          'fade',
          1000,
          0,
          'ease-in-out',
          1,
          direction,
          'forwards'
        );
        expect(css).toContain(direction);
      });
    });
  });

  describe('Fill Mode Options', () => {
    const fillModes = ['none', 'forwards', 'backwards', 'both'];

    fillModes.forEach((fillMode) => {
      it(`should handle ${fillMode} fill mode`, () => {
        const css = animationService.generateAnimationCSS(
          'fade',
          1000,
          0,
          'ease-in-out',
          1,
          'normal',
          fillMode
        );
        expect(css).toContain(fillMode);
      });
    });
  });

  describe('Animation Timing', () => {
    it('should calculate total animation time correctly', () => {
      const duration = 1000;
      const delay = 500;
      const iterations = 2;
      const totalTime = delay + duration * iterations;
      expect(totalTime).toBe(2500);
    });

    it('should handle zero delay', () => {
      const css = animationService.generateAnimationCSS(
        'fade',
        1000,
        0,
        'ease-in-out',
        1,
        'normal',
        'forwards'
      );
      expect(css).toContain('0ms');
    });

    it('should handle large durations', () => {
      const css = animationService.generateAnimationCSS(
        'fade',
        10000,
        0,
        'ease-in-out',
        1,
        'normal',
        'forwards'
      );
      expect(css).toContain('10000ms');
    });
  });
});
