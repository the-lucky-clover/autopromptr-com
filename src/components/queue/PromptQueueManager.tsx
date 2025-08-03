import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Target,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Upload,
  Sparkles
} from 'lucide-react';
import { TextPrompt } from '@/types/batch';
import { PromptQueueManager } from '@/hooks/usePromptQueueManager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PromptEnhancementButton from '../batch/PromptEnhancementButton';

interface PromptQueueManagerProps {
  queueManager: PromptQueueManager;
  disabled?: boolean;
  targetPlatform?: string;
  onEnhanceAll?: () => void;
  enhancingAll?: boolean;
}

interface SortablePromptCardProps {
  prompt: TextPrompt;
  index: number;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  onUpdate: (text: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
}

const SortablePromptCard = ({
  prompt,
  index,
  isProcessing,
  isCompleted,
  isFailed,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled
}: SortablePromptCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(prompt.text);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusIcon = () => {
    if (isProcessing) return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (isFailed) return <XCircle className="w-4 h-4 text-red-400" />;
    return <Target className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (isProcessing) return 'border-blue-500/50 bg-blue-500/10';
    if (isCompleted) return 'border-green-500/50 bg-green-500/10';
    if (isFailed) return 'border-red-500/50 bg-red-500/10';
    return 'border-gray-700 bg-gray-800/50';
  };

  const handleSave = () => {
    onUpdate(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(prompt.text);
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${getStatusColor()} transition-all duration-200`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
                style={{ pointerEvents: disabled ? 'none' : 'auto' }}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {index + 1}
                </Badge>
                {getStatusIcon()}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {!disabled && prompt.text.trim() && (
                <PromptEnhancementButton
                  promptText={prompt.text}
                  onEnhanced={(enhancedText) => onUpdate(enhancedText)}
                  size="sm"
                />
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onDuplicate}
                disabled={disabled}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1.5"
                title="Duplicate prompt"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              <div className="flex flex-col">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMoveUp}
                  disabled={disabled || !canMoveUp}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 p-1 h-auto"
                  title="Move up"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMoveDown}
                  disabled={disabled || !canMoveDown}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 p-1 h-auto"
                  title="Move down"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                disabled={disabled}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5"
                title="Delete prompt"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full bg-gray-900/50 border-gray-600 text-white resize-none"
                placeholder="Enter your automation prompt..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="cursor-pointer group"
              onClick={() => !disabled && setIsEditing(true)}
            >
              <p className="text-sm text-gray-300 min-h-[60px] p-3 rounded-lg bg-gray-900/30 border border-gray-700 group-hover:border-gray-600 transition-colors">
                {prompt.text || 'Click to add prompt text...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PromptQueueManagerComponent = ({
  queueManager,
  disabled = false,
  targetPlatform,
  onEnhanceAll,
  enhancingAll = false
}: PromptQueueManagerProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const stats = queueManager.getQueueStats();
  const progressPercentage = stats.total > 0 ? Math.round(((stats.completed + stats.failed) / stats.total) * 100) : 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = queueManager.prompts.findIndex(p => p.id === active.id);
      const newIndex = queueManager.prompts.findIndex(p => p.id === over.id);
      queueManager.reorderPrompts(oldIndex, newIndex);
    }
  };

  const handleImportPrompts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
          queueManager.importPrompts(lines);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Prompt Queue
          </h3>
          <Badge variant="secondary" className="text-xs">
            {stats.total} total
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleImportPrompts}
            disabled={disabled}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={queueManager.clearAllPrompts}
            disabled={disabled || stats.total <= 1}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          
          {onEnhanceAll && (
            <Button
              size="sm"
              onClick={onEnhanceAll}
              disabled={disabled || enhancingAll || stats.total === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {enhancingAll ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance All
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Stats */}
      {(stats.completed > 0 || stats.failed > 0 || stats.processing > 0) && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Processing Progress</span>
                <span className="text-sm text-gray-300">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>✓ {stats.completed} completed</span>
                <span>⏳ {stats.processing} processing</span>
                <span>✗ {stats.failed} failed</span>
                <span>⏸ {stats.pending} pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Queue */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={queueManager.prompts.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {queueManager.prompts.map((prompt, index) => (
              <SortablePromptCard
                key={prompt.id}
                prompt={prompt}
                index={index}
                isProcessing={queueManager.processingPromptId === prompt.id}
                isCompleted={queueManager.completedPromptIds.has(prompt.id)}
                isFailed={queueManager.failedPromptIds.has(prompt.id)}
                onUpdate={(text) => queueManager.updatePrompt(prompt.id, text)}
                onDelete={() => queueManager.deletePrompt(prompt.id)}
                onDuplicate={() => queueManager.duplicatePrompt(prompt.id)}
                onMoveUp={() => queueManager.movePromptUp(prompt.id)}
                onMoveDown={() => queueManager.movePromptDown(prompt.id)}
                canMoveUp={index > 0}
                canMoveDown={index < queueManager.prompts.length - 1}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add New Prompt Button */}
      <Button
        variant="outline"
        onClick={queueManager.addPrompt}
        disabled={disabled}
        className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 py-6"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Prompt to Queue
      </Button>
    </div>
  );
};

export default PromptQueueManagerComponent;