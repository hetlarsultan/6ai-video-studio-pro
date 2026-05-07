import { storagePut } from './storage';

export interface ExportOptions {
  format: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high';
  fps?: number;
  bitrate?: string;
}

export interface ExportResult {
  url: string;
  format: string;
  size: number;
  duration: number;
  createdAt: Date;
}

/**
 * Export video in different formats
 * For now, returns mock data - in production, use FFmpeg or similar
 */
export async function exportVideo(
  projectId: number,
  videoData: Buffer,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    // Validate input
    if (!videoData || videoData.length === 0) {
      throw new Error('Video data is empty');
    }

    if (!['mp4', 'webm', 'gif'].includes(options.format)) {
      throw new Error('Invalid export format');
    }

    // In production, you would:
    // 1. Use FFmpeg to convert the video
    // 2. Apply quality settings
    // 3. Generate the output file
    // 4. Upload to S3

    // For now, we'll simulate the export
    const fileName = `project-${projectId}-${Date.now()}.${options.format}`;
    const contentType = getContentType(options.format);

    // Upload to S3
    const { url } = await storagePut(
      `exports/${fileName}`,
      videoData,
      contentType
    );

    return {
      url,
      format: options.format,
      size: videoData.length,
      duration: 0, // Would be calculated from actual video
      createdAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Export failed: ${(error as Error).message}`);
  }
}

/**
 * Export video as MP4
 */
export async function exportAsMP4(
  projectId: number,
  videoData: Buffer,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<ExportResult> {
  return exportVideo(projectId, videoData, {
    format: 'mp4',
    quality,
    bitrate: quality === 'high' ? '5000k' : quality === 'medium' ? '2500k' : '1000k',
  });
}

/**
 * Export video as WebM
 */
export async function exportAsWebM(
  projectId: number,
  videoData: Buffer,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<ExportResult> {
  return exportVideo(projectId, videoData, {
    format: 'webm',
    quality,
    bitrate: quality === 'high' ? '4000k' : quality === 'medium' ? '2000k' : '800k',
  });
}

/**
 * Export video as GIF
 */
export async function exportAsGIF(
  projectId: number,
  videoData: Buffer,
  fps: number = 10
): Promise<ExportResult> {
  return exportVideo(projectId, videoData, {
    format: 'gif',
    fps,
  });
}

/**
 * Get content type for format
 */
function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    gif: 'image/gif',
  };
  return contentTypes[format] || 'application/octet-stream';
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    mp4: 'mp4',
    webm: 'webm',
    gif: 'gif',
  };
  return extensions[format] || 'bin';
}

/**
 * Validate export options
 */
export function validateExportOptions(options: ExportOptions): boolean {
  if (!options.format) return false;
  if (!['mp4', 'webm', 'gif'].includes(options.format)) return false;
  if (options.quality && !['low', 'medium', 'high'].includes(options.quality)) return false;
  if (options.fps !== undefined && (options.fps < 1 || options.fps > 60)) return false;
  return true;
}
