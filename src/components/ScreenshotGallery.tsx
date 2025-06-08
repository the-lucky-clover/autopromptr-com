
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useScreenshots } from '@/hooks/useScreenshots';
import { Trash2, Eye, Calendar, Globe, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ScreenshotGallery = () => {
  const {
    screenshots,
    loading,
    getScreenshotUrl,
    deleteScreenshot,
    getSessionScreenshots,
    getAllSessions
  } = useScreenshots();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [selectedSession, setSelectedSession] = useState<string>('all');

  const sessions = getAllSessions();
  const displayScreenshots = selectedSession === 'all' 
    ? screenshots 
    : getSessionScreenshots(selectedSession);

  // Load image URLs
  useEffect(() => {
    const loadImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const screenshot of screenshots) {
        const url = await getScreenshotUrl(screenshot.file_path);
        if (url) {
          urls[screenshot.id] = url;
        }
      }
      setImageUrls(urls);
    };

    if (screenshots.length > 0) {
      loadImageUrls();
    }
  }, [screenshots, getScreenshotUrl]);

  const handleDelete = async (id: string, filePath: string) => {
    await deleteScreenshot(id, filePath);
    // Remove from local URLs
    const newUrls = { ...imageUrls };
    delete newUrls[id];
    setImageUrls(newUrls);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading screenshots...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Screenshot Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSession} onValueChange={setSelectedSession}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              {sessions.map(session => (
                <TabsTrigger key={session} value={session}>
                  Session {session.slice(-8)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedSession}>
              {displayScreenshots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No screenshots found for this session
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayScreenshots.map(screenshot => (
                    <Card key={screenshot.id} className="overflow-hidden">
                      <div className="aspect-video relative bg-gray-100">
                        {imageUrls[screenshot.id] ? (
                          <img
                            src={imageUrls[screenshot.id]}
                            alt="Screenshot"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(imageUrls[screenshot.id])}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Loading...
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(screenshot.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span className="truncate">{screenshot.url}</span>
                          </div>
                          
                          {screenshot.prompt && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{screenshot.prompt}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="secondary" className="text-xs">
                              Session {screenshot.session_id.slice(-8)}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(screenshot.id, screenshot.file_path)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screenshot Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="max-h-[70vh] overflow-auto">
              <img
                src={selectedImage}
                alt="Screenshot Preview"
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScreenshotGallery;
