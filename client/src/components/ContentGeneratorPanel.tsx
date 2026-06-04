import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SceneGallery from '@/components/SceneGallery';
import AdvancedPreviewDownload from '@/components/AdvancedPreviewDownload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Film,
  Image,
  Volume2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ContentGeneratorPanelProps {
  projectId: number;
}

interface Scene {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'saved' | 'processing' | 'failed';
}

export default function ContentGeneratorPanel({
  projectId,
}: ContentGeneratorPanelProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');

  // Video states
  const [videoText, setVideoText] = useState('');
  const [videoStyle, setVideoStyle] = useState<'cinematic' | 'documentary' | 'animated' | 'minimal'>('cinematic');
  const [videoDuration, setVideoDuration] = useState(10);

  // Image states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageDuration, setImageDuration] = useState(5);

  // Audio states
  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState<'female' | 'male' | 'neutral'>('female');
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Generation states
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Scene gallery states
  const [createdScenes, setCreatedScenes] = useState<Scene[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [sceneCount, setSceneCount] = useState(0);
  const [showSceneGallery, setShowSceneGallery] = useState(false);

  // tRPC mutations
  const generateVideoMutation = trpc.contentGeneration.generateVideo.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      toast.success('جاري معالجة الفيديو...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('فشل في إنشاء الفيديو');
    },
  });

  const generateImageMutation = trpc.contentGeneration.generateImage.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      toast.success('جاري معالجة الصور...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('فشل في إنشاء الصور');
    },
  });

  const generateAudioMutation = trpc.contentGeneration.generateAudio.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      toast.success('جاري معالجة الصوت...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('فشل في إنشاء الصوت');
    },
  });

  // Get generation status
  const getStatusQuery = trpc.contentGeneration.getStatus.useQuery(
    { generationId: generationId || '' },
    {
      enabled: !!generationId && generationStatus === 'generating',
      refetchInterval: 1000,
    }
  );

  // Monitor generation completion
  useEffect(() => {
    if (getStatusQuery.data && generationStatus === 'generating') {
      setGenerationProgress(getStatusQuery.data.progress || 0);

      if (getStatusQuery.data.status === 'completed') {
        const resultUrl = getStatusQuery.data.result?.url || '';
        setPreviewUrl(resultUrl);
        setGenerationStatus('completed');

        // Create new scene
        const newScene: Scene = {
          id: generationId || `scene-${Date.now()}`,
          title: `${activeTab === 'video' ? 'فيديو' : activeTab === 'image' ? 'صورة' : 'صوت'} - ${new Date().toLocaleString('ar-SA')}`,
          description: activeTab === 'video' ? videoText : activeTab === 'audio' ? audioText : 'صور متحركة',
          duration: activeTab === 'video' ? videoDuration : activeTab === 'audio' ? Math.floor(audioText.length / 10) : imageDuration,
          videoUrl: resultUrl,
          thumbnailUrl: resultUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'saved',
        };

        // Add scene to gallery
        setCreatedScenes((prev) => [...prev, newScene]);
        const newCount = sceneCount + 1;
        const newDuration = totalDuration + newScene.duration;
        setSceneCount(newCount);
        setTotalDuration(newDuration);
        setShowSceneGallery(true);

        // Show success toast with scene info
        toast.success(
          `✅ تم إنشاء ${newCount} مشهد بنجاح!\nالمدة الكلية: ${newDuration} ثانية`
        );
        toast.info('🎬 جاري عرض المشاهد في المعاينة...');
      } else if (getStatusQuery.data.status === 'failed') {
        setGenerationStatus('error');
        toast.error(getStatusQuery.data.error || 'فشل في المعالجة');
      }
    }
  }, [getStatusQuery.data, generationStatus]);

  // Handle video generation
  const handleGenerateVideo = () => {
    if (!videoText.trim()) {
      toast.error('يرجى إدخال نص الفيديو');
      return;
    }
    generateVideoMutation.mutate({
      text: videoText,
      style: videoStyle,
      duration: videoDuration,
      projectId,
    });
  };

  // Handle image generation
  const handleGenerateImage = () => {
    if (imageFiles.length === 0) {
      toast.error('يرجى اختيار صور');
      return;
    }
    generateImageMutation.mutate({
      files: imageFiles,
      duration: imageDuration,
      projectId,
    });
  };

  // Handle audio generation
  const handleGenerateAudio = () => {
    if (!audioText.trim()) {
      toast.error('يرجى إدخال نص الصوت');
      return;
    }
    generateAudioMutation.mutate({
      text: audioText,
      voice: audioVoice,
      speed: audioSpeed,
      projectId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Scene Gallery - عرض المشاهد المُنشأة */}
      {showSceneGallery && createdScenes.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  المشاهد المُنشأة
                </h3>
                <p className="text-sm text-slate-400">
                  {sceneCount} مشهد • المدة الكلية: {totalDuration} ثانية
                </p>
              </div>
              <Button
                onClick={() => setShowSceneGallery(false)}
                variant="outline"
                size="sm"
              >
                إخفاء
              </Button>
            </div>

            <SceneGallery
              scenes={createdScenes}
              projectId={projectId}
            />
          </div>
        </Card>
      )}

      {/* Tabs for different content types */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="video" className="gap-2">
            <Film className="w-4 h-4" />
            فيديو
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <Image className="w-4 h-4" />
            صور
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2">
            <Volume2 className="w-4 h-4" />
            صوت
          </TabsTrigger>
        </TabsList>

        {/* Video Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">نص الفيديو</label>
                <textarea
                  value={videoText}
                  onChange={(e) => setVideoText(e.target.value)}
                  placeholder="أدخل النص الذي تريد تحويله إلى فيديو..."
                  className="w-full h-24 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">النمط</label>
                  <Select value={videoStyle} onValueChange={(value) => setVideoStyle(value as any)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">سينمائي</SelectItem>
                      <SelectItem value="documentary">وثائقي</SelectItem>
                      <SelectItem value="animated">متحرك</SelectItem>
                      <SelectItem value="minimal">بسيط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">المدة (ثانية)</label>
                  <Input
                    type="number"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                    min={5}
                    max={600}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateVideo}
                disabled={generationStatus === 'generating'}
                className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                {generationStatus === 'generating' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    إنشاء فيديو
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Image Tab */}
        <TabsContent value="image" className="space-y-4">
          <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">الصور</label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">مدة كل صورة (ثانية)</label>
                <Input
                  type="number"
                  value={imageDuration}
                  onChange={(e) => setImageDuration(parseInt(e.target.value))}
                  min={1}
                  max={60}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={generationStatus === 'generating'}
                className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                {generationStatus === 'generating' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4" />
                    إنشاء فيديو من الصور
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-4">
          <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">نص الصوت</label>
                <textarea
                  value={audioText}
                  onChange={(e) => setAudioText(e.target.value)}
                  placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
                  className="w-full h-24 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">الصوت</label>
                  <Select value={audioVoice} onValueChange={(value) => setAudioVoice(value as any)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">أنثى</SelectItem>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="neutral">محايد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">السرعة</label>
                  <Input
                    type="number"
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateAudio}
                disabled={generationStatus === 'generating'}
                className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                {generationStatus === 'generating' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    إنشاء صوت
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generation Progress */}
      {generationStatus === 'generating' && (
        <Card className="p-4 bg-slate-700/50 border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <p className="text-slate-200">جاري معالجة المحتوى...</p>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{generationProgress}%</p>
        </Card>
      )}

      {/* Completion Status */}
      {generationStatus === 'completed' && previewUrl && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">تم إنشاء المحتوى بنجاح!</p>
          </div>

          <AdvancedPreviewDownload
            type={activeTab as 'video' | 'image' | 'audio'}
            url={previewUrl}
            title={`${activeTab === 'video' ? 'فيديو' : activeTab === 'image' ? 'صورة' : 'صوت'} - ${new Date().toLocaleString('ar-SA')}`}
            size={1024000}
            duration={activeTab === 'video' ? videoDuration : activeTab === 'audio' ? Math.floor(audioText.length / 10) : imageDuration}
            format={activeTab === 'video' ? 'mp4' : activeTab === 'image' ? 'jpg' : 'mp3'}
          />

          <Button
            onClick={() => {
              setGenerationStatus('idle');
              setPreviewUrl(null);
              setGenerationId(null);
            }}
            variant="outline"
            className="w-full"
          >
            إنشاء محتوى جديد
          </Button>
        </div>
      )}

      {/* Error Status */}
      {generationStatus === 'error' && (
        <Card className="p-4 bg-red-900/30 border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-400">حدث خطأ في المعالجة</p>
            <p className="text-sm text-red-300">يرجى المحاولة مرة أخرى</p>
          </div>
        </Card>
      )}
    </div>
  );
}
