import React from 'react';
import { AlertCircle, Loader, FileQuestion } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'جاري التحميل...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <Loader className={`${sizeClasses[size]} animate-spin text-cyan-400`} />
      <p className="text-foreground text-center">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = 'حدث خطأ' }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <Card className="p-6 border-red-500/50 bg-red-950/20">
      <div className="flex gap-4">
        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-400 mb-2">{title}</h3>
          <p className="text-sm text-foreground mb-4">{errorMessage}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400 hover:bg-red-950/50"
            >
              إعادة المحاولة
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
      {icon || <FileQuestion className="w-16 h-16 text-muted-foreground" />}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface SkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export function Skeleton({ count = 1, height = 'h-4', className = '' }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-muted rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 space-y-4">
          <Skeleton height="h-8" className="w-3/4" />
          <Skeleton count={2} className="w-full" />
          <Skeleton height="h-10" className="w-1/3" />
        </Card>
      ))}
    </>
  );
}

export function NoDataPlaceholder() {
  return (
    <EmptyState
      title="لا توجد بيانات"
      description="لم يتم العثور على أي بيانات. حاول إضافة عنصر جديد."
      icon={<FileQuestion className="w-12 h-12 text-muted-foreground" />}
    />
  );
}

export function NoSegmentsPlaceholder() {
  return (
    <EmptyState
      title="لا توجد مقاطع"
      description="ابدأ بإضافة مقطع جديد لبدء العمل على مشروعك."
      icon={<FileQuestion className="w-12 h-12 text-muted-foreground" />}
    />
  );
}

export function NoEffectsPlaceholder() {
  return (
    <EmptyState
      title="لا توجد تأثيرات"
      description="اختر مقطعاً أولاً ثم أضف تأثيرات له."
      icon={<FileQuestion className="w-12 h-12 text-muted-foreground" />}
    />
  );
}
