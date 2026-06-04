import { useState } from 'react';
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
import type { Scene } from '@/types/media';

interface ContentGeneratorPanelProps {
  projectId: number;
}

export default function ContentGeneratorPanel({
  projectId,
}: ContentGeneratorPanelProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');
  const [showSceneGallery, setShowSceneGallery] = useState(true);

  // Video State
  const [videoText, setVideoText] = useState('');
  const [videoDuration, setVideoDuration] = useState(10);
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high'>('high');

  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageDuration, setImageDuration] = useState(3);
  const [imageQuality, setImageQuality] = useState<'low' | 'medium' | 'high'>('high');

  // Audio State
  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState<'female' | 'male' | 'neutral'>('female');
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Scene Gallery State
  const [createdScenes, setCreatedScenes] = useState<Scene[]>([]);
  const [sceneCount, setSceneCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // tRPC Mutations
  const generateVideoMutation = trpc.contentGeneration.generateVideo.useMutation({
    onSuccess: (data) => {
      const newScene: Scene = {
        id: data.generationId || `scene-${Date.now()}`,
        title: `🎬 فيديو - ${new Date().toLocaleString('ar-SA')}`,
        description: videoText,
        duration: videoDuration,
        videoUrl: data.result?.url || '',
        thumbnail: data.result?.url || '',
        createdAt: new Date(),
      };

      setCreatedScenes((prev) => [...prev, newScene]);
      setSceneCount((prev) => prev + 1);
      setTotalDuration((prev) => prev + videoDuration);
      setIsGenerating(false);
      toast.success(`✅ تم إنشاء الفيديو بنجاح! (${videoDuration}ث)`);
    },
    onError: (error) => {
      setGenerationError(error.message || 'فشل في إنشاء الفيديو');
      setIsGenerating(false);
      toast.error('❌ فشل في إنشاء الفيديو');
    },
  });

  const generateImageMutation = trpc.contentGeneration.generateImage.useMutation({
    onSuccess: (data) => {
      const newScene: Scene = {
        id: data.generationId || `scene-${Date.now()}`,
        title: `🖼️ صور - ${new Date().toLocaleString('ar-SA')}`,
        description: `${imageFiles.length} صورة متحركة`,
        duration: imageDuration * imageFiles.length,
        videoUrl: data.result?.url || '',
        thumbnail: data.result?.url || '',
        createdAt: new Date(),
      };

      setCreatedScenes((prev) => [...prev, newScene]);
      setSceneCount((prev) => prev + 1);
      setTotalDuration((prev) => prev + imageDuration * imageFiles.length);
      setIsGenerating(false);
      toast.success(`✅ تم إنشاء الصور بنجاح! (${imageFiles.length} صورة)`);
    },
    onError: (error) => {
      setGenerationError(error.message || 'فشل في إنشاء الصور');
      setIsGenerating(false);
      toast.error('❌ فشل في إنشاء الصور');
    },
  });

  const generateAudioMutation = trpc.contentGeneration.generateAudio.useMutation({
    onSuccess: (data) => {
      const newScene: Scene = {
        id: data.generationId || `scene-${Date.now()}`,
        title: `🔊 صوت - ${new Date().toLocaleString('ar-SA')}`,
        description: audioText,
        duration: 30, // Default audio duration
        videoUrl: data.result?.url || '',
        thumbnail: data.result?.url || '',
        createdAt: new Date(),
      };

      setCreatedScenes((prev) => [...prev, newScene]);
      setSceneCount((prev) => prev + 1);
      setTotalDuration((prev) => prev + 30);
      setIsGenerating(false);
      toast.success(`✅ تم إنشاء الصوت بنجاح!`);
    },
    onError: (error) => {
      setGenerationError(error.message || 'فشل في إنشاء الصوت');
      setIsGenerating(false);
      toast.error('❌ فشل في إنشاء الصوت');
    },
  });

  // Handle video generation
  const handleGenerateVideo = () => {
    if (!videoText.trim()) {
      toast.error('يرجى إدخال نص الفيديو');
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    generateVideoMutation.mutate({
      text: videoText,
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
    setIsGenerating(true);
    setGenerationError(null);
    generateImageMutation.mutate({
      text: 'صور متحركة',
      count: imageFiles.length,
      quality: imageQuality,
      projectId,
    });
  };

  // Handle audio generation
  const handleGenerateAudio = () => {
    if (!audioText.trim()) {
      toast.error('يرجى إدخال نص الصوت');
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
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
        <TabsContent value="video" className="space-y-4 mt-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  نص الفيديو
                </label>
                <textarea
                  value={videoText}
                  onChange={(e) => setVideoText(e.target.value)}
                  placeholder="أدخل النص الذي تريد تحويله إلى فيديو..."
                  className="w-full h-20 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">
                    المدة (ثانية)
                  </label>
                  <Input
                    type="number"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                    min={5}
                    max={600}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">
                    الجودة
                  </label>
                  <Select value={videoQuality} onValueChange={(value) => setVideoQuality(value as any)}>
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
              </div>

              <Button
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء فيديو'
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Image Tab */}
        <TabsContent value="image" className="space-y-4 mt-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  اختر الصور
                </label>
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
                  <label className="text-sm font-medium text-slate-300 block mb-2">
                    مدة الصورة (ثانية)
                  </label>
                  <Input
                    type="number"
                    value={imageDuration}
                    onChange={(e) => setImageDuration(parseInt(e.target.value))}
                    min={1}
                    max={60}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">
                    الجودة
                  </label>
                  <Select value={imageQuality} onValueChange={(value) => setImageQuality(value as any)}>
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
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء فيديو من الصور'
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-4 mt-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  نص الصوت
                </label>
                <textarea
                  value={audioText}
                  onChange={(e) => setAudioText(e.target.value)}
                  placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
                  className="w-full h-20 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">
                    الصوت
                  </label>
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
                  <label className="text-sm font-medium text-slate-300 block mb-2">
                    السرعة
                  </label>
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
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء صوت'
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {generationError && (
        <Card className="p-4 bg-red-900/30 border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{generationError}</p>
        </Card>
      )}
    </div>
  );
}
