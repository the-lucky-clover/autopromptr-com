
import { Badge } from '@/components/ui/badge';

interface TestResult {
  tests: Array<{ status: 'passed' | 'failed' }>;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  passRate: number;
}

interface TestResultsDisplayProps {
  lastTestResults: TestResult | null;
  isCompact?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-400 border-green-400 bg-green-400/20';
    case 'degraded': return 'text-yellow-400 border-yellow-400 bg-yellow-400/20';
    case 'unhealthy': return 'text-red-400 border-red-400 bg-red-400/20';
    default: return 'text-gray-400 border-gray-400 bg-gray-400/20';
  }
};

const TestResultsDisplay = ({ lastTestResults, isCompact = false }: TestResultsDisplayProps) => {
  if (!lastTestResults) return null;

  if (isCompact) {
    return (
      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-purple-300">Tests: {lastTestResults.tests.length}</span>
          <span className="text-green-400">Pass: {lastTestResults.tests.filter(t => t.status === 'passed').length}</span>
          <span className="text-red-400">Fail: {lastTestResults.tests.filter(t => t.status === 'failed').length}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">Latest Test Results</span>
        <Badge className={`${getStatusColor(lastTestResults.overallStatus)} text-xs px-2 py-1`}>
          {lastTestResults.overallStatus.toUpperCase()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-purple-300 mb-1">Total Tests</div>
          <div className="text-white font-semibold">{lastTestResults.tests.length}</div>
        </div>
        <div>
          <div className="text-purple-300 mb-1">Passed</div>
          <div className="text-green-400 font-semibold">
            {lastTestResults.tests.filter(t => t.status === 'passed').length}
          </div>
        </div>
        <div>
          <div className="text-purple-300 mb-1">Failed</div>
          <div className="text-red-400 font-semibold">
            {lastTestResults.tests.filter(t => t.status === 'failed').length}
          </div>
        </div>
        <div>
          <div className="text-purple-300 mb-1">Pass Rate</div>
          <div className="text-blue-400 font-semibold">{lastTestResults.passRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsDisplay;
