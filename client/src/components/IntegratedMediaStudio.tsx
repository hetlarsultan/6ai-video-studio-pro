import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Film,
  Image,
  Volume2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Play,
  Download,
  Share2,
  Zap,
  Settings,
  Grid3x3,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import SceneGallery from '@/components/SceneGallery';
import AdvancedPreviewDownload from '@/components/AdvancedPreviewDownload';
import type { Scene } from '@/types/media';

interface IntegratedMediaStudioProps {
  projectId: number;
}

interface MediaConfig {
  type: 'video' | 'image' | 'audio';
  text?: string;
  style?: 'cinematic' | 'documentary' | 'animated' | 'minimal';
  voice?: 'female' | 'male' | 'neutral';
  duration: number;
  speed?: number;
  quality?: 'low' | 'medium' | 'high';
}

export default function IntegratedMediaStudio({
  projectId,
}: IntegratedMediaStudioProps) {
  // UI State
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');
  const [viewMode, setViewMode] = useState<'config' | 'preview' | 'gallery'>('config');

  // Configuration State
  const [config, setConfig] = useState<MediaConfig>({
    type: 'video',
    duration: 10,
    quality: 'high',
  });

  // Input State
  const [videoText, setVideoText] = useState('');
  const [videoStyle, setVideoStyle] = useState<'cinematic' | 'documentary' | 'animated' | 'minimal'>('cinematic');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState<'female' | 'male' | 'neutral'>('female');
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Generation State
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Scene Gallery State
  const [createdScenes, setCreatedScenes] = useState<Scene[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [sceneCount, setSceneCount] = useState(0);

  // tRPC Mutations
  const generateVideoMutation = trpc.contentGeneration.generateVideo.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      toast.info('🎬 جاري معالجة الفيديو...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('❌ فشل في إنشاء الفيديو');
    },
  });

  const generateImageMutation = trpc.contentGeneration.generateImage.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      toast.info('🖼️ جاري معالجة الصور...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('❌ فشل في إنشاء الصور');
    },
  });

  const generateAudioMutation = trpc.contentGeneration.generateAudio.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      toast.info('🔊 جاري معالجة الصوت...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('❌ فشل في إنشاء الصوت');
    },
  });

  // Get Status Query
  const getStatusQuery = trpc.contentGeneration.getStatus.useQuery(
    { generationId: generationId || '' },
    {
      enabled: !!generationId && generationStatus === 'generating',
      refetchInterval: 1000,
    }
  );

  // Monitor Generation
  useEffect(() => {
    if (getStatusQuery.data && generationStatus === 'generating') {
      setGenerationProgress(getStatusQuery.data.progress || 0);

      if (getStatusQuery.data.status === 'completed') {
        const resultUrl = getStatusQuery.data.result?.url || '';
        setPreviewUrl(resultUrl);
        setGenerationStatus('completed');

        // Create Scene
        const newScene: Scene = {
          id: generationId || `scene-${Date.now()}`,
          title: `${activeTab === 'video' ? '🎬 فيديو' : activeTab === 'image' ? '🖼️ صورة' : '🔊 صوت'} - ${new Date().toLocaleString('ar-SA')}`,
          description: activeTab === 'video' ? videoText : activeTab === 'audio' ? audioText : 'صور متحركة',
          duration: config.duration,
          videoUrl: resultUrl,
          thumbnail: resultUrl,
          createdAt: new Date(),
        };

        setCreatedScenes((prev: any) => [...prev, newScene]);
        const newCount = sceneCount + 1;
        const newDuration = totalDuration + config.duration;
        setSceneCount(newCount);
        setTotalDuration(newDuration);

        // Switch to preview
        setViewMode('preview');

        toast.success(
          `✅ تم إنشاء المشهد بنجاح!\n📊 إجمالي المشاهد: ${newCount} | المدة: ${newDuration}ث`
        );
      } else if (getStatusQuery.data.status === 'failed') {
        setGenerationStatus('error');
        toast.error(`❌ ${getStatusQuery.data.error || 'فشل في المعالجة'}`);
      }
    }
  }, [getStatusQuery.data, generationStatus]);

  // Handle Generate
  const handleGenerate = () => {
    if (activeTab === 'video') {
      if (!videoText.trim()) {
        toast.error('⚠️ يرجى إدخال نص الفيديو');
        return;
      }
      generateVideoMutation.mutate({
        text: videoText,
        style: videoStyle,
        duration: config.duration,
        projectId,
      });
    } else if (activeTab === 'image') {
      if (imageFiles.length === 0) {
        toast.error('⚠️ يرجى اختيار صور');
        return;
      }
      generateImageMutation.mutate({
        text: 'صور متحركة',
        count: imageFiles.length,
        quality: config.quality,
        projectId,
      });
    } else if (activeTab === 'audio') {
      if (!audioText.trim()) {
        toast.error('⚠️ يرجى إدخال نص الصوت');
        return;
      }
      generateAudioMutation.mutate({
        text: audioText,
        voice: audioVoice,
        speed: audioSpeed,
        projectId,
      });
    }
  };

  // Render Configuration Panel
  const renderConfigPanel = () => (
    <div className="space-y-4">
      {/* Type Selector */}
      <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-200">إعدادات المحتوى</h3>
        </div>

        {/* Video Configuration */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">نص الفيديو</label>
              <textarea
                value={videoText}
                onChange={(e) => setVideoText(e.target.value)}
                placeholder="أدخل النص الذي تريد تحويله إلى فيديو..."
                className="w-full h-20 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                    <SelectItem value="cinematic">🎬 سينمائي</SelectItem>
                    <SelectItem value="documentary">📹 وثائقي</SelectItem>
                    <SelectItem value="animated">✨ متحرك</SelectItem>
                    <SelectItem value="minimal">📐 بسيط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">المدة (ثانية)</label>
                <Input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                  min={5}
                  max={600}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Configuration */}
        {activeTab === 'image' && (
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
              {imageFiles.length > 0 && (
                <p className="text-xs text-cyan-400 mt-2">✓ تم اختيار {imageFiles.length} صورة</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300">الجودة</label>
                <Select value={config.quality} onValueChange={(value) => setConfig({ ...config, quality: value as any })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">مدة كل صورة (ثانية)</label>
                <Input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                  min={1}
                  max={60}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Audio Configuration */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">نص الصوت</label>
              <textarea
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
                className="w-full h-20 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                    <SelectItem value="female">👩 أنثى</SelectItem>
                    <SelectItem value="male">👨 ذكر</SelectItem>
                    <SelectItem value="neutral">🤖 محايد</SelectItem>
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
          </div>
        )}
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generationStatus === 'generating'}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2 h-12 text-base font-semibold"
      >
        {generationStatus === 'generating' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإنشاء... {generationProgress}%
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            إنشاء المحتوى الآن
          </>
        )}
      </Button>
    </div>
  );

  // Render Preview Panel
  const renderPreviewPanel = () => (
    <div className="space-y-4">
      {generationStatus === 'generating' && (
        <Card className="p-4 bg-slate-700/50 border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <p className="text-slate-200 font-medium">جاري معالجة المحتوى...</p>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">{generationProgress}%</p>
        </Card>
      )}

      {generationStatus === 'completed' && previewUrl && (
        <>
          <Card className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-400">✅ تم الإنشاء بنجاح!</p>
              <p className="text-sm text-green-300">المشهد جاهز للمعاينة والتنزيل</p>
            </div>
          </Card>

          <AdvancedPreviewDownload
            type={activeTab as 'video' | 'image' | 'audio'}
            url={previewUrl}
            title={`${activeTab === 'video' ? '🎬 فيديو' : activeTab === 'image' ? '🖼️ صورة' : '🔊 صوت'} - ${new Date().toLocaleString('ar-SA')}`}
            size={1024000}
            duration={config.duration}
            format={activeTab === 'video' ? 'mp4' : activeTab === 'image' ? 'jpg' : 'mp3'}
          />

          <Button
            onClick={() => {
              setGenerationStatus('idle');
              setPreviewUrl(null);
              setGenerationId(null);
              setViewMode('config');
            }}
            variant="outline"
            className="w-full"
          >
            إنشاء محتوى جديد
          </Button>
        </>
      )}

      {generationStatus === 'error' && (
        <Card className="p-4 bg-red-900/30 border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-400">❌ حدث خطأ</p>
            <p className="text-sm text-red-300">يرجى المحاولة مرة أخرى</p>
          </div>
        </Card>
      )}
    </div>
  );

  // Render Gallery Panel
  const renderGalleryPanel = () => (
    <div className="space-y-4">
      {createdScenes.length > 0 ? (
        <>
          <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  المشاهد المُنشأة
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  📊 {sceneCount} مشهد • ⏱️ المدة الكلية: {totalDuration} ثانية
                </p>
              </div>
            </div>
          </Card>

          <SceneGallery
            scenes={createdScenes}
            projectId={projectId}
          />
        </>
      ) : (
        <Card className="p-8 bg-slate-800/50 border-slate-600 text-center">
          <Grid3x3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">لم يتم إنشاء أي مشاهد بعد</p>
          <p className="text-sm text-slate-500 mt-1">ابدأ بإنشاء محتوى جديد</p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="video" className="gap-2 data-[state=active]:bg-cyan-600">
            <Film className="w-4 h-4" />
            فيديو
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2 data-[state=active]:bg-cyan-600">
            <Image className="w-4 h-4" />
            صور
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2 data-[state=active]:bg-cyan-600">
            <Volume2 className="w-4 h-4" />
            صوت
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="video" className="space-y-4" />
        <TabsContent value="image" className="space-y-4" />
        <TabsContent value="audio" className="space-y-4" />
      </Tabs>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <Button
          onClick={() => setViewMode('config')}
          variant={viewMode === 'config' ? 'default' : 'ghost'}
          className={`gap-2 ${viewMode === 'config' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
        >
          <Settings className="w-4 h-4" />
          التكوين
        </Button>
        <Button
          onClick={() => setViewMode('preview')}
          variant={viewMode === 'preview' ? 'default' : 'ghost'}
          className={`gap-2 ${viewMode === 'preview' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
          disabled={!previewUrl}
        >
          <Eye className="w-4 h-4" />
          المعاينة
        </Button>
        <Button
          onClick={() => setViewMode('gallery')}
          variant={viewMode === 'gallery' ? 'default' : 'ghost'}
          className={`gap-2 ${viewMode === 'gallery' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
        >
          <Grid3x3 className="w-4 h-4" />
          المعرض ({sceneCount})
        </Button>
      </div>

      {/* Content Area */}
      <div className="min-h-96">
        {viewMode === 'config' && renderConfigPanel()}
        {viewMode === 'preview' && renderPreviewPanel()}
        {viewMode === 'gallery' && renderGalleryPanel()}
      </div>
    </div>
  );
}
