import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Segment {
  id: number;
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  type?: 'text' | 'image' | 'video' | 'audio';
  content?: string;
  order?: number;
  visible?: boolean;
  locked?: boolean;
  effects: any[];
}

interface VideoEditorContextType {
  segments: Segment[];
  setSegments: (segments: Segment[]) => void;
  addSegment: (segment: Segment) => void;
  updateSegment: (id: number, segment: Partial<Segment>) => void;
  deleteSegment: (id: number) => void;
  selectedSegment: number | null;
  setSelectedSegment: (id: number | null) => void;
  selectedSegmentId: number | null;
  setSelectedSegmentId: (id: number | null) => void;
  selectedEffects: any[];
  setSelectedEffects: (effects: any[]) => void;
  totalDuration: number;
  setTotalDuration: (duration: number) => void;
}

const VideoEditorContext = createContext<VideoEditorContextType | undefined>(undefined);

export function VideoEditorProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [selectedEffects, setSelectedEffects] = useState<any[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  const addSegment = (segment: Segment) => {
    setSegments([...segments, segment]);
    setTotalDuration(totalDuration + segment.duration);
  };

  const updateSegment = (id: number, updates: Partial<Segment>) => {
    setSegments(segments.map((seg) => (seg.id === id ? { ...seg, ...updates } : seg)));
  };

  const deleteSegment = (id: number) => {
    const segment = segments.find((seg) => seg.id === id);
    if (segment) {
      setTotalDuration(Math.max(0, totalDuration - segment.duration));
    }
    setSegments(segments.filter((seg) => seg.id !== id));
  };

  return (
    <VideoEditorContext.Provider
      value={{
        segments,
        setSegments,
        addSegment,
        updateSegment,
        deleteSegment,
        selectedSegment,
        setSelectedSegment,
        selectedSegmentId,
        setSelectedSegmentId,
        selectedEffects,
        setSelectedEffects,
        totalDuration,
        setTotalDuration,
      }}
    >
      {children}
    </VideoEditorContext.Provider>
  );
}

export function useVideoEditor() {
  const context = useContext(VideoEditorContext);
  if (!context) {
    throw new Error('useVideoEditor must be used within VideoEditorProvider');
  }
  // Provide backward compatibility
  return {
    ...context,
    selectedSegment: context.selectedSegment || context.selectedSegmentId,
    setSelectedSegment: context.setSelectedSegment || context.setSelectedSegmentId,
  };
}
