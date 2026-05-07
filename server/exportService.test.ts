import { describe, it, expect } from 'vitest';
import {
  validateExportOptions,
  getFileExtension,
} from './exportService';

describe('exportService', () => {
  describe('validateExportOptions', () => {
    it('should validate correct MP4 options', () => {
      const options = { format: 'mp4' as const, quality: 'high' as const };
      expect(validateExportOptions(options)).toBe(true);
    });

    it('should validate correct WebM options', () => {
      const options = { format: 'webm' as const, quality: 'medium' as const };
      expect(validateExportOptions(options)).toBe(true);
    });

    it('should validate correct GIF options', () => {
      const options = { format: 'gif' as const, fps: 15 };
      expect(validateExportOptions(options)).toBe(true);
    });

    it('should reject invalid format', () => {
      const options = { format: 'avi' as any };
      expect(validateExportOptions(options)).toBe(false);
    });

    it('should reject invalid quality', () => {
      const options = { format: 'mp4' as const, quality: 'ultra' as any };
      expect(validateExportOptions(options)).toBe(false);
    });

    it('should reject invalid fps', () => {
      const options = { format: 'gif' as const, fps: 100 };
      expect(validateExportOptions(options)).toBe(false);
    });

    it('should reject fps less than 1', () => {
      const options = { format: 'gif' as const, fps: 0 };
      expect(validateExportOptions(options)).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should return mp4 extension', () => {
      expect(getFileExtension('mp4')).toBe('mp4');
    });

    it('should return webm extension', () => {
      expect(getFileExtension('webm')).toBe('webm');
    });

    it('should return gif extension', () => {
      expect(getFileExtension('gif')).toBe('gif');
    });

    it('should return bin for unknown format', () => {
      expect(getFileExtension('unknown')).toBe('bin');
    });
  });
});
