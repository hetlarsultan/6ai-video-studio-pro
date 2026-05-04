import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Segment {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  order: number;
  visible: boolean;
  locked: boolean;
  effects: Array<{
    effectId: number;
    startTime: number;
    duration: number;
    intensity: number;
  }>;
}

interface AdvancedTimelineProps {
  projectId: number;
}

export default function AdvancedTimeline({ projectId }: AdvancedTimelineProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  const { data: timeline } = trpc.videoTimeline.get.useQuery({ projectId });
  const addSegmentMutation = trpc.videoTimeline.addSegment.useMutation();
  const removeSegmentMutation = trpc.videoTimeline.removeSegment.useMutation();
  const updateSegmentMutation = trpc.videoTimeline.updateSegment.useMutation();
  const reorderMutation = trpc.videoTimeline.reorderSegments.useMutation();

  useEffect(() => {
    if (timeline) {
      setSegments(timeline.segments || []);
      setTotalDuration(timeline.totalDuration || 0);
    }
  }, [timeline]);

  const handleAddSegment = async () => {
    try {
      const startTime = currentTime;
      const duration = 5000; // 5 seconds default
      const endTime = startTime + duration;

      await addSegmentMutation.mutateAsync({
        projectId,
        startTime,
        endTime,
        duration,
        type: 'text',
        content: 'New Segment',
        order: segments.length,
      });

      toast.success('تم إضافة مقطع جديد ✅');
    } catch (error) {
      toast.error('فشل إضافة المقطع');
    }
  };

  const handleRemoveSegment = async (segmentId: number) => {
    try {
      await removeSegmentMutation.mutateAsync({
        projectId,
        segmentId,
      });

      setSegments(segments.filter((s) => s.id !== segmentId));
      toast.success('تم حذف المقطع ✅');
    } catch (error) {
      toast.error('فشل حذف المقطع');
    }
  };

  const handleToggleVisibility = async (segmentId: number) => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return;

    try {
      await updateSegmentMutation.mutateAsync({
        segmentId,
        visible: !segment.visible,
      });

      setSegments(
        segments.map((s) =>
          s.id === segmentId ? { ...s, visible: !s.visible } : s
        )
      );
    } catch (error) {
      toast.error('فشل تحديث المقطع');
    }
  };

  const handleToggleLock = async (segmentId: number) => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return;

    try {
      await updateSegmentMutation.mutateAsync({
        segmentId,
        locked: !segment.locked,
      });

      setSegments(
        segments.map((s) =>
          s.id === segmentId ? { ...s, locked: !s.locked } : s
        )
      );
    } catch (error) {
      toast.error('فشل تحديث المقطع');
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const pixelsPerSecond = 50 * zoom;

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <Card className="p-4 bg-slate-800/50 border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">الجدول الزمني</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  إيقاف
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  تشغيل
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
              className="gap-2"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
              className="gap-2"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleAddSegment}
              className="gap-2 bg-cyan-500"
            >
              <Plus className="w-4 h-4" />
              إضافة مقطع
            </Button>
          </div>
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <div>
              <span className="text-slate-400">الوقت الحالي:</span>
              <span className="ml-2 font-mono text-cyan-400">
                {(currentTime / 1000).toFixed(2)}s
              </span>
            </div>
            <div>
              <span className="text-slate-400">المدة الكلية:</span>
              <span className="ml-2 font-mono text-cyan-400">
                {(totalDuration / 1000).toFixed(2)}s
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">التكبير:</span>
            <span className="font-mono text-cyan-400">{(zoom * 100).toFixed(0)}%</span>
          </div>
        </div>
      </Card>

      {/* Timeline Container */}
      <Card className="p-4 bg-slate-800/50 border-cyan-500/20 overflow-hidden">
        <div
          ref={timelineRef}
          className="relative w-full h-96 bg-slate-900/50 rounded border border-slate-700 overflow-x-auto overflow-y-auto"
        >
          {/* Timeline Background */}
          <div
            className="relative w-full min-h-full"
            style={{ width: `${totalDuration * pixelsPerSecond / 1000}px` }}
          >
            {/* Grid Lines */}
            {Array.from({ length: Math.ceil(totalDuration / 1000) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-slate-700/50"
                style={{ left: `${i * pixelsPerSecond}px` }}
              >
                <span className="text-xs text-slate-500 ml-2">{i}s</span>
              </div>
            ))}

            {/* Segments */}
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={`absolute top-12 h-16 rounded border-2 cursor-pointer transition-all ${
                  selectedSegment === segment.id
                    ? 'border-cyan-400 bg-cyan-500/20'
                    : 'border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20'
                } ${segment.locked ? 'opacity-60' : ''}`}
                style={{
                  left: `${segment.startTime * pixelsPerSecond / 1000}px`,
                  width: `${segment.duration * pixelsPerSecond / 1000}px`,
                }}
                onClick={() => setSelectedSegment(segment.id)}
              >
                <div className="p-2 h-full flex flex-col justify-between">
                  <div className="text-xs font-medium truncate">
                    {segment.content}
                  </div>
                  <div className="text-xs text-slate-400">
                    {(segment.duration / 1000).toFixed(1)}s
                  </div>
                </div>

                {/* Effect Indicators */}
                {segment.effects.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b" />
                )}
              </div>
            ))}

            {/* Playhead */}
            <div
              ref={playheadRef}
              className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none"
              style={{ left: `${currentTime * pixelsPerSecond / 1000}px` }}
            />
          </div>
        </div>
      </Card>

      {/* Segment Details */}
      {selectedSegment && (
        <Card className="p-4 bg-slate-800/50 border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">تفاصيل المقطع</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  handleToggleVisibility(selectedSegment)
                }
              >
                {segments.find((s) => s.id === selectedSegment)?.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleLock(selectedSegment)}
              >
                {segments.find((s) => s.id === selectedSegment)?.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveSegment(selectedSegment)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          {(() => {
            const segment = segments.find((s) => s.id === selectedSegment);
            return segment ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">النوع</label>
                  <Badge variant="secondary">{segment.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">المدة</label>
                  <span className="text-sm">
                    {(segment.duration / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>
            ) : null;
          })()}
        </Card>
      )}
    </div>
  );
}
