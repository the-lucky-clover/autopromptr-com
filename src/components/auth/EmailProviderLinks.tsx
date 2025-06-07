
import { Button } from '@/components/ui/button';

interface EmailProviderLinksProps {
  onProviderClick: (provider: string) => void;
}

const EmailProviderLinks = ({ onProviderClick }: EmailProviderLinksProps) => {
  return (
    <div className="space-y-3 mb-6">
      <Button
        onClick={() => onProviderClick('gmail')}
        variant="outline"
        className="w-full flex items-center justify-center space-x-3 bg-white/5 border-gray-600 text-white hover:bg-white/10 rounded-xl py-3"
      >
        <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">M</div>
        <span>Open Gmail</span>
      </Button>
      
      <Button
        onClick={() => onProviderClick('outlook')}
        variant="outline"
        className="w-full flex items-center justify-center space-x-3 bg-white/5 border-gray-600 text-white hover:bg-white/10 rounded-xl py-3"
      >
        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">□</div>
        <span>Open Outlook</span>
      </Button>
      
      <Button
        onClick={() => onProviderClick('yahoo')}
        variant="outline"
        className="w-full flex items-center justify-center space-x-3 bg-white/5 border-gray-600 text-white hover:bg-white/10 rounded-xl py-3"
      >
        <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">Y!</div>
        <span>Open Yahoo!</span>
      </Button>
    </div>
  );
};

export default EmailProviderLinks;
