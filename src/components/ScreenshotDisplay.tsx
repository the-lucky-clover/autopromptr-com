
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, Download, X } from 'lucide-react';

interface ScreenshotDisplayProps {
  screenshot: string;
  batchId: string;
  timestamp: string;
  prompt?: string;
}

const ScreenshotDisplay = ({ screenshot, batchId, timestamp, prompt }: ScreenshotDisplayProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${screenshot}`;
    link.download = `batch-${batchId}-${new Date(timestamp).getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullScreen = () => {
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Screenshot Result</h4>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={openFullScreen}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ZoomIn className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          
          {prompt && (
            <p className="text-white/70 text-sm mb-3 truncate">
              "{prompt}"
            </p>
          )}
          
          <div className="relative rounded-lg overflow-hidden border border-white/20">
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt="Automation Screenshot"
              className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={openFullScreen}
            />
          </div>
          
          <p className="text-white/50 text-xs mt-2">
            Captured at {new Date(timestamp).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <Button
              size="sm"
              variant="outline"
              onClick={closeFullScreen}
              className="absolute -top-12 right-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt="Automation Screenshot - Full Size"
              className="max-w-full max-h-full rounded-lg border border-white/20"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenshotDisplay;
