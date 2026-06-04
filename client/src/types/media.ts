/**
 * Unified Media Types
 * تعريفات موحدة لأنواع البيانات المستخدمة في التطبيق
 */

export interface Scene {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  thumbnail: string;
  createdAt: Date;
}

export interface GeneratedMedia {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  title: string;
  duration: number;
  size: number;
  format: string;
  createdAt: Date;
  thumbnail?: string;
}

export interface MediaConfig {
  type: 'video' | 'image' | 'audio';
  duration: number;
  quality: 'low' | 'medium' | 'high';
  style?: string;
  voice?: string;
  speed?: number;
}

export interface GenerationResult {
  generationId: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  result?: {
    url: string;
    size: number;
  };
  error?: string;
}
