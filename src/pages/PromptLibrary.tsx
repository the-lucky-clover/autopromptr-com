import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { useAutoSavePrompt } from '@/hooks/useAutoSavePrompt';
import { 
  Search, Plus, Star, Copy, Trash2, Edit2, Save, X,
  Music, Code, Palette, Gamepad2, BookOpen, Zap,
  Clock, TrendingUp, Filter, Download, Upload
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MobileDashboardNavbar from '@/components/dashboard/MobileDashboardNavbar';

const PLATFORMS = [
  { value: 'suno', label: 'Suno AI', icon: Music },
  { value: 'udio', label: 'Udio', icon: Music },
  { value: 'elevenlabs', label: 'ElevenLabs', icon: Music },
  { value: 'lovable', label: 'Lovable', icon: Code },
  { value: 'v0', label: 'v0.dev', icon: Code },
  { value: 'cursor', label: 'Cursor', icon: Code },
  { value: 'windsurf', label: 'Windsurf', icon: Code },
  { value: 'claude', label: 'Claude', icon: Zap },
  { value: 'chatgpt', label: 'ChatGPT', icon: Zap },
];

const CATEGORIES = [
  { value: 'music', label: 'Music Generation', icon: Music },
  { value: 'code', label: 'Code Generation', icon: Code },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'game', label: 'Game Development', icon: Gamepad2 },
  { value: 'research', label: 'Research', icon: BookOpen },
  { value: 'draft', label: 'Drafts', icon: Edit2 },
];

export default function PromptLibrary() {
  const {
    prompts,
    loading,
    searchQuery,
    setSearchQuery,
    filterPlatform,
    setFilterPlatform,
    filterCategory,
    setFilterCategory,
    showFavoritesOnly,
    setShowFavoritesOnly,
    savePrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
  } = usePromptLibrary();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptPlatform, setNewPromptPlatform] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState('');
  const [newPromptUrl, setNewPromptUrl] = useState('');

  const { forceSave } = useAutoSavePrompt({
    promptText: newPromptText,
    title: newPromptTitle,
    targetPlatform: newPromptPlatform,
    category: newPromptCategory,
    targetUrl: newPromptUrl,
    enabled: isCreateDialogOpen,
  });

  const handleCreatePrompt = async () => {
    if (!newPromptText.trim()) return;

    await savePrompt({
      prompt_text: newPromptText,
      title: newPromptTitle || 'Untitled Prompt',
      target_platform: newPromptPlatform || null,
      target_url: newPromptUrl || null,
      category: newPromptCategory || null,
    });

    setNewPromptText('');
    setNewPromptTitle('');
    setNewPromptPlatform('');
    setNewPromptCategory('');
    setNewPromptUrl('');
    setIsCreateDialogOpen(false);
  };

  const totalTimeSaved = prompts.reduce((sum, p) => sum + (p.time_saved_seconds || 0), 0);
  const totalUsage = prompts.reduce((sum, p) => sum + (p.times_used || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <MobileDashboardNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Prompt Library</h1>
          <p className="text-gray-400">Your intelligent prompt archive with auto-save and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Prompts</p>
                <p className="text-2xl font-bold text-white">{prompts.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Times Used</p>
                <p className="text-2xl font-bold text-white">{totalUsage}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Time Saved</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(totalTimeSaved / 60)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Favorites</p>
                <p className="text-2xl font-bold text-white">
                  {prompts.filter(p => p.is_favorite).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          <Select value={filterPlatform || ''} onValueChange={(v) => setFilterPlatform(v || null)}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Platforms</SelectItem>
              {PLATFORMS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory || ''} onValueChange={(v) => setFilterCategory(v || null)}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="w-full md:w-auto"
          >
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Prompt title..."
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  className="bg-gray-900/50 border-gray-700"
                />
                <Textarea
                  placeholder="Enter your prompt text... (auto-saves as you type)"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  rows={8}
                  className="bg-gray-900/50 border-gray-700"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newPromptPlatform} onValueChange={setNewPromptPlatform}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newPromptCategory} onValueChange={setNewPromptCategory}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Target URL (optional)"
                  value={newPromptUrl}
                  onChange={(e) => setNewPromptUrl(e.target.value)}
                  className="bg-gray-900/50 border-gray-700"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePrompt} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Prompt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prompt Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No prompts yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first prompt or run a batch to auto-populate your library
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create First Prompt
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <Card key={prompt.id} className="bg-gray-800/50 border-gray-700 p-4 hover:border-blue-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{prompt.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{prompt.prompt_text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(prompt.id)}
                    className="ml-2"
                  >
                    <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {prompt.target_platform && (
                    <Badge variant="outline" className="text-xs">
                      {PLATFORMS.find(p => p.value === prompt.target_platform)?.label || prompt.target_platform}
                    </Badge>
                  )}
                  {prompt.category && (
                    <Badge variant="outline" className="text-xs">
                      {CATEGORIES.find(c => c.value === prompt.category)?.label || prompt.category}
                    </Badge>
                  )}
                  {prompt.source === 'batch_automation' && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                      Auto-saved
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}</span>
                  </div>
                  {prompt.times_used > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      <span>Used {prompt.times_used} times</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicatePrompt(prompt.id)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePrompt(prompt.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
