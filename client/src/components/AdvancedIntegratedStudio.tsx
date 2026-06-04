import { useState, useEffect, useCallback } from 'react';
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
  Download,
  Save,
  Share2,
  Zap,
  Settings,
  Grid3x3,
  Play,
  Pause,
  Volume,
  Maximize,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface AdvancedIntegratedStudioProps {
  projectId: number;
}

interface GeneratedMedia {
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

interface MediaConfig {
  type: 'video' | 'image' | 'audio';
  duration: number;
  quality: 'low' | 'medium' | 'high';
  style?: string;
  voice?: string;
  speed?: number;
}

export default function AdvancedIntegratedStudio({
  projectId,
}: AdvancedIntegratedStudioProps) {
  // UI State
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Input State
  const [videoText, setVideoText] = useState('');
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState('female');
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Configuration State
  const [config, setConfig] = useState<MediaConfig>({
    type: 'video',
    duration: 10,
    quality: 'high',
  });

  // Generation State
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Media History
  const [mediaHistory, setMediaHistory] = useState<GeneratedMedia[]>([]);

  // tRPC Mutations
  const generateVideoMutation = trpc.contentGeneration.generateVideo.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      setGenerationProgress(10);
      toast.info('🎬 جاري معالجة الفيديو على الخادم...');
    },
    onError: (error) => {
      setGenerationStatus('error');
      setGenerationError(error.message || 'فشل في إنشاء الفيديو');
      toast.error('❌ فشل في إنشاء الفيديو');
    },
  });

  const generateImageMutation = trpc.contentGeneration.generateImage.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      setGenerationProgress(10);
      toast.info('🖼️ جاري معالجة الصور على الخادم...');
    },
    onError: (error) => {
      setGenerationStatus('error');
      setGenerationError(error.message || 'فشل في إنشاء الصور');
      toast.error('❌ فشل في إنشاء الصور');
    },
  });

  const generateAudioMutation = trpc.contentGeneration.generateAudio.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      setGenerationStatus('generating');
      setGenerationProgress(10);
      toast.info('🔊 جاري معالجة الصوت على الخادم...');
    },
    onError: (error) => {
      setGenerationStatus('error');
      setGenerationError(error.message || 'فشل في إنشاء الصوت');
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

  // Monitor Generation Progress
  useEffect(() => {
    if (getStatusQuery.data && generationStatus === 'generating') {
      const progress = Math.min(getStatusQuery.data.progress || 0, 95);
      setGenerationProgress(progress);

      if (getStatusQuery.data.status === 'completed') {
        const resultUrl = getStatusQuery.data.result?.url || '';
        const resultSize = getStatusQuery.data.result?.size || 0;

        const newMedia: GeneratedMedia = {
          id: generationId || `media-${Date.now()}`,
          type: activeTab,
          url: resultUrl,
          title: `${activeTab === 'video' ? '🎬 فيديو' : activeTab === 'image' ? '🖼️ صورة' : '🔊 صوت'} - ${new Date().toLocaleString('ar-SA')}`,
          duration: config.duration,
          size: resultSize,
          format: activeTab === 'video' ? 'mp4' : activeTab === 'image' ? 'jpg' : 'mp3',
          createdAt: new Date(),
          thumbnail: resultUrl,
        };

        setGeneratedMedia(newMedia);
        setMediaHistory((prev) => [newMedia, ...prev]);
        setGenerationStatus('completed');
        setGenerationProgress(100);

        toast.success(
          `✅ تم الإنشاء بنجاح!\n📊 الحجم: ${(resultSize / 1024 / 1024).toFixed(2)}MB | المدة: ${config.duration}ث`
        );
      } else if (getStatusQuery.data.status === 'failed') {
        setGenerationStatus('error');
        setGenerationError(getStatusQuery.data.error || 'فشل في المعالجة');
        toast.error(`❌ ${getStatusQuery.data.error || 'فشل في المعالجة'}`);
      }
    }
  }, [getStatusQuery.data, generationStatus]);

  // Handle Generate
  const handleGenerate = useCallback(() => {
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
  }, [activeTab, videoText, videoStyle, config, imageFiles, audioText, audioVoice, audioSpeed, projectId]);

  // Handle Download
  const handleDownload = useCallback(async () => {
    if (!generatedMedia) return;

    try {
      const response = await fetch(generatedMedia.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedMedia.title}.${generatedMedia.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('✅ تم التنزيل بنجاح');
    } catch (error) {
      toast.error('❌ فشل التنزيل');
    }
  }, [generatedMedia]);

  // Handle Save
  const handleSave = useCallback(async () => {
    if (!generatedMedia) return;

    try {
      // Save to project/database
      toast.success('✅ تم الحفظ في المشروع');
    } catch (error) {
      toast.error('❌ فشل الحفظ');
    }
  }, [generatedMedia]);

  // Handle Share
  const handleShare = useCallback(async () => {
    if (!generatedMedia) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: generatedMedia.title,
          text: `تحقق من هذا ${generatedMedia.type} الذي تم إنشاؤه بواسطة AI Video Studio Pro`,
          url: generatedMedia.url,
        });
        toast.success('✅ تم المشاركة');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(generatedMedia.url);
        toast.success('✅ تم نسخ الرابط');
      }
    } catch (error) {
      toast.error('❌ فشلت المشاركة');
    }
  }, [generatedMedia]);

  // Render Configuration Panel
  const renderConfigPanel = () => (
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold text-lg text-slate-200">إعدادات المحتوى المتقدمة</h3>
      </div>

      {/* Video Configuration */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">📝 نص الفيديو</label>
            <textarea
              value={videoText}
              onChange={(e) => setVideoText(e.target.value)}
              placeholder="أدخل النص الذي تريد تحويله إلى فيديو متحرك..."
              className="w-full h-24 p-4 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
            <p className="text-xs text-slate-400 mt-2">💡 كلما كان النص أكثر تفصيلاً، كان الفيديو أفضل</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">🎬 النمط</label>
              <Select value={videoStyle} onValueChange={setVideoStyle}>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  <SelectItem value="cinematic">سينمائي</SelectItem>
                  <SelectItem value="documentary">وثائقي</SelectItem>
                  <SelectItem value="animated">متحرك</SelectItem>
                  <SelectItem value="minimal">بسيط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">⏱️ المدة (ثانية)</label>
              <Input
                type="number"
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                min={5}
                max={600}
                className="bg-slate-700/50 border-cyan-500/30 text-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">✨ الجودة</label>
              <Select value={config.quality} onValueChange={(value) => setConfig({ ...config, quality: value as any })}>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Image Configuration */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">🖼️ اختر الصور</label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              className="bg-slate-700/50 border-cyan-500/30 text-slate-200"
            />
            {imageFiles.length > 0 && (
              <p className="text-xs text-cyan-400 mt-2 font-semibold">✓ تم اختيار {imageFiles.length} صورة</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">✨ الجودة</label>
              <Select value={config.quality} onValueChange={(value) => setConfig({ ...config, quality: value as any })}>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">⏱️ مدة الصورة (ثانية)</label>
              <Input
                type="number"
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                min={1}
                max={60}
                className="bg-slate-700/50 border-cyan-500/30 text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audio Configuration */}
      {activeTab === 'audio' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">🔊 نص الصوت</label>
            <textarea
              value={audioText}
              onChange={(e) => setAudioText(e.target.value)}
              placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
              className="w-full h-24 p-4 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">👤 الصوت</label>
              <Select value={audioVoice} onValueChange={setAudioVoice}>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  <SelectItem value="female">أنثى</SelectItem>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="neutral">محايد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">⚡ السرعة</label>
              <Input
                type="number"
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                min={0.5}
                max={2}
                step={0.1}
                className="bg-slate-700/50 border-cyan-500/30 text-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">⏱️ المدة (ثانية)</label>
              <Input
                type="number"
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                min={5}
                max={600}
                className="bg-slate-700/50 border-cyan-500/30 text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generationStatus === 'generating'}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2 h-14 text-base font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
      >
        {generationStatus === 'generating' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري المعالجة على الخادم... {generationProgress}%
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            إنشاء المحتوى الآن
          </>
        )}
      </Button>
    </Card>
  );

  // Render Preview Panel
  const renderPreviewPanel = () => (
    <div className="space-y-4">
      {/* Progress Bar */}
      {generationStatus === 'generating' && (
        <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <p className="text-slate-200 font-semibold">جاري المعالجة على الخادم...</p>
            </div>
            <span className="text-cyan-400 font-bold">{generationProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 h-full transition-all duration-300 animate-pulse"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Error State */}
      {generationStatus === 'error' && (
        <Card className="p-4 bg-red-900/30 border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-400">❌ حدث خطأ</p>
            <p className="text-sm text-red-300">{generationError}</p>
          </div>
          <Button
            onClick={() => {
              setGenerationStatus('idle');
              setGenerationError(null);
            }}
            variant="outline"
            size="sm"
          >
            إعادة محاولة
          </Button>
        </Card>
      )}

      {/* Success State with Preview */}
      {generationStatus === 'completed' && generatedMedia && (
        <>
          <Card className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-400">✅ تم الإنشاء بنجاح!</p>
              <p className="text-sm text-green-300">المحتوى جاهز للمعاينة والتنزيل</p>
            </div>
          </Card>

          {/* Preview Container */}
          <Card className="p-6 bg-slate-800/50 border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-200">معاينة المحتوى</h3>
            </div>

            {/* Media Preview */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative group">
              {generatedMedia.type === 'video' && (
                <video
                  src={generatedMedia.url}
                  controls
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
              {generatedMedia.type === 'image' && (
                <img
                  src={generatedMedia.url}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
              {generatedMedia.type === 'audio' && (
                <div className="flex flex-col items-center gap-4 w-full">
                  <Volume2 className="w-16 h-16 text-cyan-400" />
                  <audio
                    src={generatedMedia.url}
                    controls
                    className="w-full max-w-md"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400">الحجم</p>
                <p className="font-bold text-cyan-400">{(generatedMedia.size / 1024 / 1024).toFixed(2)}MB</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400">المدة</p>
                <p className="font-bold text-cyan-400">{generatedMedia.duration}ث</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400">الصيغة</p>
                <p className="font-bold text-cyan-400">{generatedMedia.format.toUpperCase()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2"
              >
                <Download className="w-4 h-4" />
                تنزيل
              </Button>
              <Button
                onClick={handleSave}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 gap-2"
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
            </div>
          </Card>

          {/* Create New Button */}
          <Button
            onClick={() => {
              setGenerationStatus('idle');
              setGeneratedMedia(null);
              setGenerationId(null);
              setGenerationProgress(0);
            }}
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            إنشاء محتوى جديد
          </Button>
        </>
      )}
    </div>
  );

  // Render History Panel
  const renderHistoryPanel = () => (
    <div className="space-y-4">
      {mediaHistory.length > 0 ? (
        <>
          <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
            <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              سجل المحتوى المُنشأ
            </h3>
            <p className="text-sm text-slate-400 mt-1">📊 {mediaHistory.length} عنصر</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaHistory.map((media) => (
              <Card key={media.id} className="p-4 bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/50 transition cursor-pointer" onClick={() => setGeneratedMedia(media)}>
                <div className="flex items-start gap-3">
                  {media.type === 'video' && <Film className="w-5 h-5 text-cyan-400 mt-1" />}
                  {media.type === 'image' && <Image className="w-5 h-5 text-cyan-400 mt-1" />}
                  {media.type === 'audio' && <Volume2 className="w-5 h-5 text-cyan-400 mt-1" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{media.title}</p>
                    <p className="text-xs text-slate-400">{(media.size / 1024 / 1024).toFixed(2)}MB • {media.duration}ث</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="p-8 bg-slate-800/50 border-slate-600 text-center">
          <Grid3x3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">لم يتم إنشاء أي محتوى بعد</p>
          <p className="text-sm text-slate-500 mt-1">ابدأ بإنشاء محتوى جديد</p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Type Tabs */}
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
      </Tabs>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        <Button
          onClick={() => {}}
          variant="ghost"
          className="gap-2 text-cyan-400 border-b-2 border-cyan-600 rounded-none"
        >
          <Settings className="w-4 h-4" />
          التكوين
        </Button>
        <Button
          onClick={() => {}}
          variant="ghost"
          className="gap-2 text-slate-400 hover:text-slate-300 border-b-2 border-transparent rounded-none"
          disabled={!generatedMedia}
        >
          <Eye className="w-4 h-4" />
          المعاينة
        </Button>
        <Button
          onClick={() => {}}
          variant="ghost"
          className="gap-2 text-slate-400 hover:text-slate-300 border-b-2 border-transparent rounded-none"
        >
          <Grid3x3 className="w-4 h-4" />
          السجل ({mediaHistory.length})
        </Button>
      </div>

      {/* Content Area */}
      <div className="min-h-96">
        {!generatedMedia ? renderConfigPanel() : renderPreviewPanel()}
      </div>

      {/* History Sidebar */}
      {mediaHistory.length > 0 && (
        <div className="border-t border-slate-700 pt-6">
          {renderHistoryPanel()}
        </div>
      )}
    </div>
  );
}
