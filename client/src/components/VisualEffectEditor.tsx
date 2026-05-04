import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copy, Share2, Eye, Play, Pause, Save } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface EffectAnimation {
  animationType: string;
  duration: number;
  delay: number;
  easing: string;
  iterations: number;
  direction: string;
  fillMode: string;
}

export default function VisualEffectEditor() {
  const [effectName, setEffectName] = useState('');
  const [effectDescription, setEffectDescription] = useState('');
  const [category, setCategory] = useState<'entrance' | 'exit' | 'emphasis' | 'custom'>('custom');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState(1000);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [animations, setAnimations] = useState<EffectAnimation[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const createMutation = trpc.customEffect.create.useMutation();
  const duplicateMutation = trpc.customEffect.duplicate.useMutation();
  const shareMutation = trpc.customEffect.share.useMutation();

  const animationTypes = [
    'fade',
    'slide',
    'zoom',
    'rotate',
    'bounce',
    'flip',
    'swing',
    'pulse',
    'shake',
    'heartbeat',
  ];

  const easingOptions = [
    'linear',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'cubic-bezier',
  ];

  const handleAddAnimation = () => {
    const newAnimation: EffectAnimation = {
      animationType: 'fade',
      duration: 500,
      delay: 0,
      easing: 'ease-in-out',
      iterations: 1,
      direction: 'normal',
      fillMode: 'forwards',
    };
    setAnimations([...animations, newAnimation]);
  };

  const handleUpdateAnimation = (index: number, field: string, value: any) => {
    const updated = [...animations];
    (updated[index] as any)[field] = value;
    setAnimations(updated);
  };

  const handleRemoveAnimation = (index: number) => {
    setAnimations(animations.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePlayPreview = () => {
    if (previewRef.current) {
      setIsPlaying(true);
      // Simulate animation preview
      setTimeout(() => setIsPlaying(false), duration);
    }
  };

  const handleSaveEffect = async () => {
    if (!effectName.trim()) {
      toast.error('يرجى إدخال اسم التأثير');
      return;
    }

    if (animations.length === 0) {
      toast.error('يرجى إضافة حركة واحدة على الأقل');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: effectName,
        description: effectDescription,
        category,
        difficulty,
        duration,
        tags,
        animations,
      });

      toast.success('تم حفظ التأثير بنجاح! ✅');
      // Reset form
      setEffectName('');
      setEffectDescription('');
      setAnimations([]);
      setTags([]);
    } catch (error) {
      toast.error('فشل حفظ التأثير');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Effect Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">إعدادات التأثير</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">اسم التأثير</label>
              <Input
                value={effectName}
                onChange={(e) => setEffectName(e.target.value)}
                placeholder="أدخل اسم التأثير"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <Textarea
                value={effectDescription}
                onChange={(e) => setEffectDescription(e.target.value)}
                placeholder="أدخل وصف التأثير"
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الفئة</label>
              <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrance">دخول</SelectItem>
                  <SelectItem value="exit">خروج</SelectItem>
                  <SelectItem value="emphasis">تركيز</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مستوى الصعوبة</label>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">سهل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="hard">صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المدة الإجمالية (ميلي ثانية)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[duration]}
                  onValueChange={(v) => setDuration(v[0])}
                  min={100}
                  max={5000}
                  step={100}
                  className="flex-1"
                />
                <span className="text-sm font-mono">{duration}ms</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوسوم</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="أضف وسم"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Panel - Animation Editor */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">الحركات</h3>
              <Button size="sm" onClick={handleAddAnimation}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {animations.map((anim, index) => (
                <Card key={index} className="p-3 space-y-3 bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">الحركة {index + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAnimation(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">نوع الحركة</label>
                    <Select
                      value={anim.animationType}
                      onValueChange={(v) => handleUpdateAnimation(index, 'animationType', v)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">المدة (ms)</label>
                      <Input
                        type="number"
                        value={anim.duration}
                        onChange={(e) =>
                          handleUpdateAnimation(index, 'duration', parseInt(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">التأخير (ms)</label>
                      <Input
                        type="number"
                        value={anim.delay}
                        onChange={(e) =>
                          handleUpdateAnimation(index, 'delay', parseInt(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">التسريع</label>
                    <Select
                      value={anim.easing}
                      onValueChange={(v) => handleUpdateAnimation(index, 'easing', v)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((easing) => (
                          <SelectItem key={easing} value={easing}>
                            {easing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">التكرارات</label>
                      <Input
                        type="number"
                        value={anim.iterations}
                        onChange={(e) =>
                          handleUpdateAnimation(index, 'iterations', parseInt(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">الاتجاه</label>
                      <Select
                        value={anim.direction}
                        onValueChange={(v) => handleUpdateAnimation(index, 'direction', v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">عادي</SelectItem>
                          <SelectItem value="reverse">معكوس</SelectItem>
                          <SelectItem value="alternate">متناوب</SelectItem>
                          <SelectItem value="alternate-reverse">متناوب معكوس</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">المعاينة</h3>

            <div
              ref={previewRef}
              className="w-full h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-cyan-500/50"
            >
              <div
                className={`text-center transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
              >
                <p className="text-sm font-medium">معاينة التأثير</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePlayPreview}
                disabled={isPlaying || animations.length === 0}
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    جاري التشغيل
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    تشغيل
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-semibold">الإجراءات</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleSaveEffect}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ التأثير
                </Button>
              </div>
            </div>

            {createMutation.isPending && (
              <div className="text-xs text-muted-foreground text-center">
                جاري حفظ التأثير...
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
