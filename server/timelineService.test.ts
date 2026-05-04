import { describe, expect, it } from 'vitest';
import * as timelineService from './timelineService';
import * as segmentEffectsService from './segmentEffectsService';

describe('Timeline Service', () => {
  it('should create a new timeline', async () => {
    const timeline = await timelineService.createTimeline(1, 30, '1920x1080');
    expect(timeline).toBeDefined();
    expect(timeline.projectId).toBe(1);
    expect(timeline.fps).toBe(30);
    expect(timeline.resolution).toBe('1920x1080');
  });

  it('should add a segment to timeline', async () => {
    const segment = await timelineService.addSegmentToTimeline(1, {
      projectId: 1,
      startTime: 0,
      endTime: 5000,
      duration: 5000,
      type: 'text',
      content: 'Test Segment',
      effects: [],
      transitions: [],
      metadata: {},
      order: 0,
      visible: true,
      locked: false,
    });

    expect(segment).toBeDefined();
    expect(segment.content).toBe('Test Segment');
    expect(segment.duration).toBe(5000);
  });

  it('should update a segment', async () => {
    const result = await timelineService.updateSegment(1, {
      content: 'Updated Segment',
      visible: false,
    });

    expect(result.success).toBe(true);
    expect(result.segment.content).toBe('Updated Segment');
    expect(result.segment.visible).toBe(false);
  });

  it('should remove a segment', async () => {
    const result = await timelineService.removeSegmentFromTimeline(1, 1);
    expect(result.success).toBe(true);
  });

  it('should reorder segments', async () => {
    const result = await timelineService.reorderSegments(1, [
      { segmentId: 1, order: 0 },
      { segmentId: 2, order: 1 },
    ]);

    expect(result.success).toBe(true);
  });

  it('should apply effect to segment', async () => {
    const result = await timelineService.applyEffectToSegment(1, 1, 0, 5000, 0.8);
    expect(result.success).toBe(true);
    expect(result.effect.intensity).toBe(0.8);
  });

  it('should remove effect from segment', async () => {
    const result = await timelineService.removeEffectFromSegment(1, 1);
    expect(result.success).toBe(true);
  });

  it('should add transition', async () => {
    const result = await timelineService.addTransition(1, 'fade', 1000);
    expect(result.success).toBe(true);
    expect(result.transition.type).toBe('fade');
    expect(result.transition.duration).toBe(1000);
  });

  it('should calculate timeline duration', async () => {
    const duration = await timelineService.calculateTimelineDuration(1);
    expect(typeof duration).toBe('number');
  });

  it('should export timeline as JSON', async () => {
    const json = await timelineService.exportTimeline(1);
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed).toBeDefined();
  });

  it('should import timeline from JSON', async () => {
    const timelineJson = JSON.stringify({
      id: 1,
      projectId: 1,
      totalDuration: 10000,
      fps: 30,
      resolution: '1920x1080',
      segments: [],
    });

    const timeline = await timelineService.importTimeline(1, timelineJson);
    expect(timeline.projectId).toBe(1);
  });

  it('should get timeline statistics', async () => {
    const stats = await timelineService.getTimelineStatistics(1);
    expect(stats).toBeDefined();
    expect(stats.totalDuration).toBe(0);
    expect(stats.segmentCount).toBe(0);
  });
});

describe('Segment Effects Service', () => {
  it('should apply effect to segment', async () => {
    const effect = await segmentEffectsService.applyEffectToSegment(
      1,
      1,
      'Fade',
      0,
      5000,
      1,
      { color: 'black' }
    );

    expect(effect).toBeDefined();
    expect(effect.effectName).toBe('Fade');
    expect(effect.intensity).toBe(1);
  });

  it('should get segment effects', async () => {
    const effects = await segmentEffectsService.getSegmentEffects(1);
    expect(Array.isArray(effects)).toBe(true);
  });

  it('should update effect parameters', async () => {
    const result = await segmentEffectsService.updateEffectParameters(1, {
      intensity: 0.5,
    });

    expect(result.success).toBe(true);
    expect(result.effect.parameters.intensity).toBe(0.5);
  });

  it('should remove effect from segment', async () => {
    const result = await segmentEffectsService.removeEffectFromSegment(1, 1);
    expect(result.success).toBe(true);
  });

  it('should reorder segment effects', async () => {
    const result = await segmentEffectsService.reorderSegmentEffects(1, [
      { effectId: 1, order: 0 },
      { effectId: 2, order: 1 },
    ]);

    expect(result.success).toBe(true);
  });

  it('should toggle effect', async () => {
    const result = await segmentEffectsService.toggleEffect(1, false);
    expect(result.success).toBe(true);
  });

  it('should create effect group', async () => {
    const group = await segmentEffectsService.createEffectGroup(1, 'Entrance Effects');
    expect(group).toBeDefined();
    expect(group.groupName).toBe('Entrance Effects');
  });

  it('should get segment effect statistics', async () => {
    const stats = await segmentEffectsService.getSegmentEffectStatistics(1);
    expect(stats).toBeDefined();
    expect(stats.totalEffects).toBe(0);
  });

  it('should apply preset effect group', async () => {
    const result = await segmentEffectsService.applyPresetEffectGroup(1, 1, 0);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.appliedEffects)).toBe(true);
  });

  it('should clone segment effects', async () => {
    const result = await segmentEffectsService.cloneSegmentEffects(1, 2);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.clonedEffects)).toBe(true);
  });

  it('should export segment effects as JSON', async () => {
    const json = await segmentEffectsService.exportSegmentEffects(1);
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('should import segment effects from JSON', async () => {
    const effectsJson = JSON.stringify([
      {
        id: 1,
        segmentId: 1,
        effectId: 1,
        effectName: 'Fade',
        startTime: 0,
        duration: 5000,
        intensity: 1,
        parameters: {},
        enabled: true,
        order: 0,
      },
    ]);

    const effects = await segmentEffectsService.importSegmentEffects(1, effectsJson);
    expect(Array.isArray(effects)).toBe(true);
    expect(effects[0].segmentId).toBe(1);
  });
});
