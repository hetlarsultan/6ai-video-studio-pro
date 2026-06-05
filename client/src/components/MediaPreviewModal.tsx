/**
 * Media Preview Modal Component
 * عرض معاينة حية للفيديو والصور والصوت
 */

import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  id: number;
  title: string;
  type: 'video' | 'image' | 'audio';
  format: string;
  url: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  createdAt: Date;
  downloadCount?: number;
  isStarred?: boolean;
}

interface MediaPreviewModalProps {
  isOpen: boolean;
  file: MediaFile | null;
  onClose: () => void;
  onDownload?: (file: MediaFile) => void;
  onShare?: (file: MediaFile) => void;
}

export default function MediaPreviewModal({
  isOpen,
  file,
  onClose,
  onDownload,
  onShare,
}: MediaPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!file) return null;

  // تشغيل/إيقاف الفيديو أو الصوت
  const handlePlayPause = () => {
    if (file.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (file.type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // تحديث الوقت الحالي
  const handleTimeUpdate = () => {
    if (file.type === 'video' && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    } else if (file.type === 'audio' && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // تحديث المدة الكلية
  const handleLoadedMetadata = () => {
    if (file.type === 'video' && videoRef.current) {
      setDuration(videoRef.current.duration);
    } else if (file.type === 'audio' && audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // تغيير الوقت
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (file.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else if (file.type === 'audio' && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  // تغيير مستوى الصوت
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (file.type === 'video' && videoRef.current) {
      videoRef.current.volume = newVolume;
    } else if (file.type === 'audio' && audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // كتم الصوت
  const handleMute = () => {
    if (file.type === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted;
    } else if (file.type === 'audio' && audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // ملء الشاشة
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // تنسيق الوقت
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 p-0 overflow-hidden">
        <div ref={containerRef} className="w-full space-y-4 p-6">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-700">
            <div className="flex-1">
              <DialogTitle className="text-xl text-white">{file.title}</DialogTitle>
              <p className="text-sm text-slate-400 mt-1">
                {file.format.toUpperCase()} • {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>

          {/* Preview Content */}
          <div className="bg-black rounded-lg overflow-hidden">
            {file.type === 'video' && (
              <video
                ref={videoRef}
                src={file.url}
                className="w-full h-auto max-h-96 bg-black"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {file.type === 'image' && (
              <img
                src={file.url}
                alt={file.title}
                className="w-full h-auto max-h-96 object-contain bg-black"
              />
            )}

            {file.type === 'audio' && (
              <div className="w-full h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18.144 8.404c-.596.34-1.374.464-2.205.464-.308 0-.618-.019-.93-.057V4.905a1 1 0 00-1.732-.577L9.165 7.752a2 2 0 01-1.566.748H5a2 2 0 00-2 2v2a2 2 0 002 2h2.599a2 2 0 011.566.748l4.147 3.384A1 1 0 0015 17.095v-2.548c.912-.087 1.743-.286 2.205-.464a1 1 0 00.739-.957V9.361a1 1 0 00-.8-.957z" />
                    </svg>
                  </div>
                  <p className="text-cyan-400 font-semibold">{file.title}</p>
                  <p className="text-slate-400 text-sm mt-2">
                    {formatTime(duration)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls for Video and Audio */}
          {(file.type === 'video' || file.type === 'audio') && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayPause}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Skip Back */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newTime = Math.max(0, currentTime - 10);
                      handleSeek([newTime]);
                    }}
                    className="border-slate-600 hover:bg-slate-800"
                    title="رجوع 10 ثواني"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  {/* Skip Forward */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newTime = Math.min(duration, currentTime + 10);
                      handleSeek([newTime]);
                    }}
                    className="border-slate-600 hover:bg-slate-800"
                    title="تقديم 10 ثواني"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleMute}
                      className="border-slate-600 hover:bg-slate-800"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {file.type === 'video' && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleFullscreen}
                      className="border-slate-600 hover:bg-slate-800"
                      title="ملء الشاشة"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      onDownload?.(file);
                      toast.success('جاري التنزيل...');
                    }}
                    className="border-slate-600 hover:bg-slate-800"
                    title="تنزيل"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      onShare?.(file);
                      toast.success('تم نسخ الرابط');
                    }}
                    className="border-slate-600 hover:bg-slate-800"
                    title="مشاركة"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Info for Image */}
          {file.type === 'image' && (
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-400">
                <p>الحجم: {formatFileSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    onDownload?.(file);
                    toast.success('جاري التنزيل...');
                  }}
                  className="border-slate-600 hover:bg-slate-800"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    onShare?.(file);
                    toast.success('تم نسخ الرابط');
                  }}
                  className="border-slate-600 hover:bg-slate-800"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
