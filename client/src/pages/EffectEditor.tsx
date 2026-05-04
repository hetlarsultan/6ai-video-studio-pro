import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useLocation } from 'wouter';
import VisualEffectEditor from '@/components/VisualEffectEditor';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function EffectEditor() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: allEffects, isLoading } = trpc.customEffect.getAll.useQuery();
  const { data: statistics } = trpc.customEffect.getStatistics.useQuery();

  const categories = [
    { value: 'all', label: 'الكل', icon: '📊' },
    { value: 'entrance', label: 'دخول', icon: '👋' },
    { value: 'exit', label: 'خروج', icon: '🚪' },
    { value: 'emphasis', label: 'تركيز', icon: '⭐' },
    { value: 'custom', label: 'مخصص', icon: '✨' },
  ];

  const filteredEffects = allEffects?.filter((effect) => {
    const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || effect.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

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
              <h1 className="text-2xl font-bold text-cyan-400">محرر التأثيرات 🎬</h1>
              <p className="text-sm text-slate-400">إنشاء وتخصيص التأثيرات والحركات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="editor">محرر التأثيرات</TabsTrigger>
            <TabsTrigger value="library">مكتبة التأثيرات</TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
              <h2 className="text-xl font-semibold mb-4">إنشاء تأثير جديد</h2>
              <VisualEffectEditor />
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <div className="text-2xl font-bold text-cyan-400">{statistics?.total || 0}</div>
                <div className="text-sm text-slate-400">إجمالي التأثيرات</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{statistics?.public || 0}</div>
                <div className="text-sm text-slate-400">تأثيرات عامة</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{statistics?.private || 0}</div>
                <div className="text-sm text-slate-400">تأثيرات خاصة</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400">
                  {statistics?.averageDuration.toFixed(0) || 0}ms
                </div>
                <div className="text-sm text-slate-400">متوسط المدة</div>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="p-4 bg-slate-800/50 border-cyan-500/20 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="ابحث عن التأثيرات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={selectedCategory === cat.value ? 'bg-cyan-500' : ''}
                  >
                    {cat.icon} {cat.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Effects Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">جاري تحميل التأثيرات...</p>
              </div>
            ) : filteredEffects.length === 0 ? (
              <Card className="p-12 bg-slate-800/50 border-cyan-500/20 text-center">
                <p className="text-slate-400 mb-4">لم يتم العثور على تأثيرات</p>
                <Button onClick={() => setLocation('/effect-editor')} className="bg-cyan-500">
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء تأثير جديد
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEffects.map((effect) => (
                  <Card
                    key={effect.id}
                    className="p-4 bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-cyan-400 group-hover:text-cyan-300">
                            {effect.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">{effect.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {effect.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {effect.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {effect.duration}ms
                        </Badge>
                      </div>

                      {effect.tags && effect.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {effect.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-slate-700/50"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          عرض
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          تطبيق
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
