import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface AdvancedVideoPlayerProps {
  src?: string;
  title?: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  effects?: Array<{
    effectId: number;
    effectName: string;
    intensity: number;
    parameters: Record<string, any>;
  }>;
}

export default function AdvancedVideoPlayer({
  src,
  title = 'معاينة الفيديو',
  width = 1920,
  height = 1080,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  effects = [],
}: AdvancedVideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw initial frame
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw placeholder text
    ctx.fillStyle = '#00D9FF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('معاينة الفيديو', width / 2, height / 2);
  }, [width, height]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      onPause?.();
    } else {
      setIsPlaying(true);
      onPlay?.();
    }
  };

  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    onTimeUpdate?.(time);

    // Render frame with effects
    renderFrame(time);
  };

  // Render frame with effects
  const renderFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw content
    ctx.fillStyle = '#00D9FF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`الوقت: ${formatTime(time)}`, width / 2, height / 2);

    // Apply effects
    for (const effect of effects) {
      applyEffect(ctx, effect, width, height);
    }
  };

  // Apply effect to canvas
  const applyEffect = (
    ctx: CanvasRenderingContext2D,
    effect: {
      effectId: number;
      effectName: string;
      intensity: number;
      parameters: Record<string, any>;
    },
    w: number,
    h: number
  ) => {
    switch (effect.effectName.toLowerCase()) {
      case 'fade':
        ctx.globalAlpha = effect.intensity;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);
        break;

      case 'blur':
        ctx.filter = `blur(${effect.intensity * 10}px)`;
        break;

      case 'brightness':
        ctx.filter = `brightness(${1 + effect.intensity * 0.5})`;
        break;

      case 'contrast':
        ctx.filter = `contrast(${1 + effect.intensity * 0.5})`;
        break;

      case 'saturate':
        ctx.filter = `saturate(${1 + effect.intensity * 0.5})`;
        break;

      case 'hue-rotate':
        ctx.filter = `hue-rotate(${effect.intensity * 360}deg)`;
        break;

      case 'sepia':
        ctx.filter = `sepia(${effect.intensity})`;
        break;

      case 'grayscale':
        ctx.filter = `grayscale(${effect.intensity})`;
        break;

      case 'invert':
        ctx.filter = `invert(${effect.intensity})`;
        break;

      case 'opacity':
        ctx.globalAlpha = effect.intensity;
        break;
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    const container = document.querySelector('[data-video-player]');
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setCurrentTime((prev) => {
        const newTime = prev + (1 / 30) * playbackRate;
        if (newTime >= duration && duration > 0) {
          if (loop) {
            handleTimeUpdate(0);
            return 0;
          } else {
            setIsPlaying(false);
            onEnded?.();
            return duration;
          }
        }
        handleTimeUpdate(newTime);
        return newTime;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration, loop, playbackRate]);

  return (
    <Card className="w-full bg-slate-900 border-cyan-500/20 overflow-hidden" data-video-player>
      <div className="space-y-4 p-4">
        {/* Title */}
        {title && <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>}

        {/* Canvas */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />

          {/* Play overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <button
                onClick={handlePlayPause}
                className="p-4 rounded-full bg-cyan-500 hover:bg-cyan-600 transition-colors"
              >
                <Play className="w-8 h-8 text-white fill-white" />
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={(value) => handleTimeUpdate(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        {controls && (
          <div className="flex items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayPause}
                className="hover:bg-cyan-500/20"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* Volume control */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                  className="hover:bg-cyan-500/20"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="w-20"
                />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Playback speed */}
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="px-2 py-1 bg-slate-800 border border-cyan-500/20 rounded text-sm text-gray-300 hover:border-cyan-500/50"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* Settings */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-cyan-500/20"
              >
                <Settings className="w-4 h-4" />
              </Button>

              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="hover:bg-cyan-500/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div className="bg-slate-800 border border-cyan-500/20 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                جودة الفيديو
              </label>
              <select className="w-full px-3 py-2 bg-slate-700 border border-cyan-500/20 rounded text-sm text-gray-300">
                <option>1080p</option>
                <option>720p</option>
                <option>480p</option>
                <option>360p</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الترجمات
              </label>
              <select className="w-full px-3 py-2 bg-slate-700 border border-cyan-500/20 rounded text-sm text-gray-300">
                <option>بدون ترجمات</option>
                <option>العربية</option>
                <option>الإنجليزية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                حجم الخط
              </label>
              <select className="w-full px-3 py-2 bg-slate-700 border border-cyan-500/20 rounded text-sm text-gray-300">
                <option>صغير</option>
                <option>متوسط</option>
                <option>كبير</option>
              </select>
            </div>
          </div>
        )}

        {/* Effects info */}
        {effects.length > 0 && (
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3">
            <p className="text-sm text-gray-300">
              <span className="text-cyan-400 font-semibold">{effects.length}</span> تأثير مطبق
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {effects.map((effect, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-xs text-cyan-300"
                >
                  {effect.effectName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
