
import { Card, CardContent } from '@/components/ui/card';

interface AutomationErrorDisplayProps {
  error: string | null;
}

const AutomationErrorDisplay = ({ error }: AutomationErrorDisplayProps) => {
  if (!error) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-4">
        <p className="text-red-800">Automation Error: {error}</p>
      </CardContent>
    </Card>
  );
};

export default AutomationErrorDisplay;
