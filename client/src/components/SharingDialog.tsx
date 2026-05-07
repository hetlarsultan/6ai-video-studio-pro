import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Share2, Copy, Trash2, Eye, Edit, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface SharedUser {
  id: number;
  email: string;
  name: string;
  permission: 'view' | 'edit' | 'admin';
  sharedAt: Date;
}

interface SharingDialogProps {
  projectId: number;
  projectName: string;
}

export default function SharingDialog({
  projectId,
  projectName,
}: SharingDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareLink, setShowShareLink] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);

  // Fetch shared users when dialog opens
  const { data: shares, isLoading: isLoadingShares } = trpc.sharing.getProjectShares.useQuery(
    { projectId },
    { enabled: open }
  );

  const shareProjectMutation = trpc.sharing.shareProject.useMutation({
    onSuccess: () => {
      toast.success('تم مشاركة المشروع بنجاح ✅');
      setEmail('');
      setPermission('view');
      // Refetch shares
      trpc.useUtils().sharing.getProjectShares.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error('فشل في مشاركة المشروع');
      console.error(error);
    },
  });

  const unshareProjectMutation = trpc.sharing.unshareProject.useMutation({
    onSuccess: () => {
      toast.success('تم إلغاء المشاركة بنجاح ✅');
      // Refetch shares
      trpc.useUtils().sharing.getProjectShares.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error('فشل في إلغاء المشاركة');
      console.error(error);
    },
  });

  const updatePermissionMutation = trpc.sharing.updatePermission.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الصلاحيات بنجاح ✅');
      // Refetch shares
      trpc.useUtils().sharing.getProjectShares.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error('فشل في تحديث الصلاحيات');
      console.error(error);
    },
  });

  // Update shared users when shares data changes
  useEffect(() => {
    if (shares) {
      setSharedUsers(shares);
    }
  }, [shares]);

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error('الرجاء إدخال بريد إلكتروني');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would fetch the user ID from the email
      // For now, we'll use a placeholder
      const userId = Math.floor(Math.random() * 10000);
      await shareProjectMutation.mutateAsync({
        projectId,
        sharedWithUserId: userId,
        permission,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshare = async (userId: number) => {
    try {
      await unshareProjectMutation.mutateAsync({
        projectId,
        sharedWithUserId: userId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePermission = async (userId: number, newPermission: 'view' | 'edit' | 'admin') => {
    try {
      await updatePermissionMutation.mutateAsync({
        projectId,
        sharedWithUserId: userId,
        permission: newPermission,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('تم نسخ الرابط');
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}/projects/${projectId}/shared`;
    setShareLink(link);
    setShowShareLink(true);
  };

  const getPermissionIcon = (perm: string) => {
    switch (perm) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'edit':
        return <Edit className="w-4 h-4" />;
      case 'admin':
        return <Lock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case 'view':
        return 'عرض فقط';
      case 'edit':
        return 'تحرير';
      case 'admin':
        return 'مسؤول';
      default:
        return perm;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          مشاركة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">مشاركة المشروع</DialogTitle>
          <DialogDescription className="text-slate-400">
            شارك المشروع "{projectName}" مع مستخدمين آخرين
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200">رابط المشاركة</h3>
            {!showShareLink ? (
              <Button
                onClick={generateShareLink}
                variant="outline"
                className="w-full"
              >
                إنشاء رابط مشاركة
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="bg-slate-700 border-slate-600"
                />
                <Button
                  onClick={handleCopyLink}
                  size="icon"
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Add User Section */}
          <div className="space-y-3 border-t border-slate-700 pt-6">
            <h3 className="font-semibold text-slate-200">إضافة مستخدم</h3>
            <div className="space-y-3">
              <Input
                placeholder="البريد الإلكتروني للمستخدم"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
              <div className="flex gap-2">
                <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="view">عرض فقط</SelectItem>
                    <SelectItem value="edit">تحرير</SelectItem>
                    <SelectItem value="admin">مسؤول</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleShare}
                  disabled={isLoading || shareProjectMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isLoading || shareProjectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      جاري...
                    </>
                  ) : (
                    'مشاركة'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Shared Users List */}
          {isLoadingShares ? (
            <div className="text-center py-6 border-t border-slate-700 pt-6">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mx-auto" />
            </div>
          ) : sharedUsers.length > 0 ? (
            <div className="space-y-3 border-t border-slate-700 pt-6">
              <h3 className="font-semibold text-slate-200">المستخدمون المشاركون</h3>
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="p-4 bg-slate-700/50 border-slate-600 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-600/20 flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={user.permission}
                        onValueChange={(value: any) => handleUpdatePermission(user.id, value)}
                      >
                        <SelectTrigger className="w-32 bg-slate-600 border-slate-500 text-sm">
                          <div className="flex items-center gap-1">
                            {getPermissionIcon(user.permission)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="view">عرض فقط</SelectItem>
                          <SelectItem value="edit">تحرير</SelectItem>
                          <SelectItem value="admin">مسؤول</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleUnshare(user.id)}
                        size="icon"
                        variant="ghost"
                        disabled={unshareProjectMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                      >
                        {unshareProjectMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border-t border-slate-700 pt-6">
              <p className="text-slate-400">لم يتم مشاركة المشروع مع أي مستخدم حتى الآن</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
