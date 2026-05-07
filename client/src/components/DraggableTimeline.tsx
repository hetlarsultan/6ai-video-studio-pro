import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useVideoEditor } from '@/contexts/VideoEditorContext';
import { LoadingState, ErrorState, NoSegmentsPlaceholder } from '@/components/StateHandlers';

interface DraggableTimelineProps {
  projectId: number;
}

interface TimelineSegment {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  type: string;
  visible?: boolean;
}

export default function DraggableTimeline({ projectId }: DraggableTimelineProps) {
  const { segments, setSegments, selectedSegment, setSelectedSegment, totalDuration, setTotalDuration } = useVideoEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { data: timeline, isLoading, error: queryError } = trpc.videoTimeline.get.useQuery({ projectId }, { enabled: !!projectId });
  const reorderMutation = trpc.videoTimeline.reorderSegments.useMutation();
  const updateSegmentMutation = trpc.videoTimeline.updateSegment.useMutation();

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'حدث خطأ في تحميل الجدول الزمني');
    }
  }, [queryError]);

  useEffect(() => {
    if (timeline) {
      const mappedSegments = (timeline.segments || []).map((seg: any) => ({
        ...seg,
        name: seg.name || `Segment ${seg.id}`,
      }));
      setSegments(mappedSegments);
      setTotalDuration(timeline.totalDuration || 0);
      setError(null);
    }
  }, [timeline, setSegments, setTotalDuration]);

  // Animation loop for playback
  useEffect(() => {
    if (isPlaying && totalDuration > 0) {
      const animate = () => {
        setCurrentTime((prev) => {
          const next = prev + 0.016; // ~60fps
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.index === destination.index) return;

    try {
      const newSegments = Array.from(segments);
      const [movedSegment] = newSegments.splice(source.index, 1);
      newSegments.splice(destination.index, 0, movedSegment);

      setSegments(newSegments);

      // Update order in backend
      const segmentOrders = newSegments.map((seg, idx) => ({
        segmentId: seg.id,
        order: idx,
      }));
      await reorderMutation.mutateAsync({
        projectId,
        segmentOrders,
      });

      toast.success('تم إعادة ترتيب المقاطع بنجاح ✅');
    } catch (err) {
      toast.error('فشل إعادة ترتيب المقاطع ❌');
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
    }
  };

  const handleResizeSegment = async (segmentId: number, newDuration: number) => {
    try {
      const segment = segments.find((s) => s.id === segmentId);
      if (!segment) return;

      const updatedSegment = { ...segment, duration: newDuration, endTime: segment.startTime + newDuration };
      await updateSegmentMutation.mutateAsync({
        segmentId,
        startTime: segment.startTime,
        endTime: segment.startTime + newDuration,
        duration: newDuration,
      });

      const newSegments = segments.map((s) => (s.id === segmentId ? updatedSegment : s));
      setSegments(newSegments);
      setTotalDuration(newSegments.reduce((sum, s) => sum + s.duration, 0));

      toast.success('تم تحديث مدة المقطع ✅');
    } catch (err) {
      toast.error('فشل تحديث المقطع ❌');
    }
  };

  const pixelsPerSecond = 50 * zoom;
  const timelineWidth = totalDuration * pixelsPerSecond;

  if (isLoading) {
    return <LoadingState message="جاري تحميل الجدول الزمني..." />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="خطأ في تحميل الجدول الزمني"
        onRetry={() => {
          setError(null);
          window.location.reload();
        }}
      />
    );
  }

  if (!segments || segments.length === 0) {
    return <NoSegmentsPlaceholder />;
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <Card className="p-4 bg-slate-800/50 border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isPlaying ? 'default' : 'outline'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentTime(0)} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="gap-2"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-cyan-400">{(zoom * 100).toFixed(0)}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="gap-2"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          الوقت الحالي: {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-4 bg-slate-900/50 border-cyan-500/20 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline" direction="horizontal" type="SEGMENT">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-2 pb-4"
                style={{ minWidth: `${timelineWidth + 100}px` }}
              >
                {segments.map((segment: any, index: number) => (
                  <Draggable key={`segment-${segment.id}`} draggableId={`segment-${segment.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex-shrink-0 relative group cursor-move transition-all ${
                          (selectedSegment as any)?.id === segment.id ? 'ring-2 ring-cyan-400' : ''
                        } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                        style={{
                          width: `${segment.duration * pixelsPerSecond}px`,
                          minWidth: '50px',
                          height: '80px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #0891b2',
                          borderRadius: '4px',
                          ...provided.draggableProps.style,
                        }}
                        onClick={() => setSelectedSegment(segment as any)}
                      >
                        <div className="p-2 h-full flex flex-col justify-between text-xs text-gray-300">
                          <span className="truncate font-semibold">{segment.name}</span>
                          <span className="text-gray-500">{segment.duration.toFixed(2)}s</span>
                        </div>

                        {/* Resize handle */}
                        <div
                          className="absolute right-0 top-0 w-1 h-full bg-cyan-400 opacity-0 group-hover:opacity-100 cursor-col-resize hover:w-2 transition-all"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startDuration = segment.duration;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const delta = moveEvent.clientX - startX;
                              const pixelDelta = delta / pixelsPerSecond;
                              const newDuration = Math.max(0.1, startDuration + pixelDelta);
                              handleResizeSegment(segment.id, newDuration);
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card>
    </div>
  );
}
