import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  segmentId: number;
}

interface CommentsPanelProps {
  segmentId: number;
  comments?: Comment[];
  onAddComment?: (content: string) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
}

export default function CommentsPanel({
  segmentId,
  comments = [],
  onAddComment,
  onDeleteComment,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('الرجاء كتابة تعليق');
      return;
    }

    setIsLoading(true);
    try {
      if (onAddComment) {
        await onAddComment(newComment);
      }
      toast.success('تم إضافة التعليق بنجاح ✅');
      setNewComment('');
    } catch (error) {
      toast.error('فشل في إضافة التعليق');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setDeletingId(commentId);
    try {
      if (onDeleteComment) {
        await onDeleteComment(commentId);
      }
      toast.success('تم حذف التعليق بنجاح ✅');
    } catch (error) {
      toast.error('فشل في حذف التعليق');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
        <MessageCircle className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-200">التعليقات والملاحظات</h3>
        <span className="ml-auto text-sm text-slate-400">{comments.length} تعليق</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>لا توجد تعليقات حتى الآن</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className="p-3 bg-slate-700/50 border-slate-600 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center text-sm font-semibold text-cyan-400">
                    {comment.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{comment.author}</p>
                    <p className="text-xs text-slate-400">{formatTime(comment.timestamp)}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deletingId === comment.id}
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20 h-8 w-8"
                >
                  {deletingId === comment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
            </Card>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="space-y-2 border-t border-slate-700 pt-4">
        <div className="flex gap-2">
          <Input
            placeholder="أضف تعليقاً..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="bg-slate-700 border-slate-600 text-sm"
          />
          <Button
            onClick={handleAddComment}
            disabled={isLoading || !newComment.trim()}
            size="icon"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-400">اضغط Enter لإرسال التعليق</p>
      </div>
    </div>
  );
}
