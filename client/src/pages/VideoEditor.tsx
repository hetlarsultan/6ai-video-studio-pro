import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import AdvancedTimeline from '@/components/AdvancedTimeline';
import VisualEffectEditor from '@/components/VisualEffectEditor';
import AdvancedVideoPlayer from '@/components/AdvancedVideoPlayer';
import SharingDialog from '@/components/SharingDialog';
import ExportModal from '@/components/ExportModal';
import { VideoEditorProvider, useVideoEditor } from '@/contexts/VideoEditorContext';
import { toast } from 'sonner';

function VideoEditorContent() {
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const { segments, selectedEffects, totalDuration } = useVideoEditor();

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('تم حفظ المشروع بنجاح ✅');
    } catch (error) {
      toast.error('فشل حفظ المشروع');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportVideo = async (options: any) => {
    return {
      url: URL.createObjectURL(new Blob(['video data'], { type: 'video/mp4' })),
      size: 1024 * 1024 * 50,
    };
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">محرر الفيديو 🎥</h1>
              <p className="text-sm text-slate-400">دمج الجدول الزمني والتأثيرات والمقاطع</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            <ExportModal
              projectId={1}
              projectName="مشروع الفيديو"
              totalDuration={totalDuration}
            />
            <SharingDialog
              projectId={1}
              projectName="مشروع الفيديو"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
            <TabsTrigger value="effects">التأثيرات</TabsTrigger>
            <TabsTrigger value="preview">المعاينة</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
              <h2 className="text-xl font-semibold mb-4">الجدول الزمني للفيديو</h2>
              <AdvancedTimeline projectId={1} />
            </Card>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
              <h2 className="text-xl font-semibold mb-4">محرر التأثيرات</h2>
              <VisualEffectEditor />
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
              <h2 className="text-xl font-semibold mb-4">معاينة الفيديو المباشرة</h2>
              <AdvancedVideoPlayer
                title="معاينة الفيديو مع التأثيرات"
                width={1920}
                height={1080}
                controls={true}
                effects={selectedEffects}
              />
            </Card>

            {/* Video Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <div className="text-sm text-slate-400">الدقة</div>
                <div className="text-lg font-semibold text-cyan-400">1920x1080</div>
              </Card>
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <div className="text-sm text-slate-400">معدل الإطارات</div>
                <div className="text-lg font-semibold text-cyan-400">30 FPS</div>
              </Card>
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <div className="text-sm text-slate-400">عدد المقاطع</div>
                <div className="text-lg font-semibold text-cyan-400">{segments.length}</div>
              </Card>
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <div className="text-sm text-slate-400">المدة الكلية</div>
                <div className="text-lg font-semibold text-cyan-400">{formatTime(totalDuration)}</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function VideoEditor() {
  return (
    <VideoEditorProvider>
      <VideoEditorContent />
    </VideoEditorProvider>
  );
}
