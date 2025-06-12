
import { useState, useCallback, useRef } from 'react';
import { TestingService, TestSuite } from '@/services/testingService';

export const useBackendTesting = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastTestResults, setLastTestResults] = useState<TestSuite | null>(null);
  const [lastQuickCheck, setLastQuickCheck] = useState<{
    isHealthy: boolean;
    responseTime: number;
    error?: string;
    timestamp: Date;
  } | null>(null);

  const testingService = new TestingService();
  const lastTestRun = useRef(0);
  const testInProgress = useRef(false);

  const runFullTestSuite = useCallback(async () => {
    if (testInProgress.current) {
      console.log('Test suite already running, skipping');
      return lastTestResults;
    }
    
    setIsRunning(true);
    testInProgress.current = true;
    
    try {
      console.log('🚀 Starting full backend test suite...');
      const results = await testingService.runTestSuite();
      setLastTestResults(results);
      lastTestRun.current = Date.now();
      console.log('✅ Test suite completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      setIsRunning(false);
      testInProgress.current = false;
    }
  }, [testingService, lastTestResults]);

  const runQuickHealthCheck = useCallback(async () => {
    const now = Date.now();
    
    // Debounce quick health checks - don't run more than once per 30 seconds
    if (testInProgress.current || (now - lastTestRun.current) < 30000) {
      console.log('Quick health check debounced');
      return lastQuickCheck;
    }
    
    try {
      const result = await testingService.runQuickHealthCheck();
      const checkResult = {
        ...result,
        timestamp: new Date()
      };
      setLastQuickCheck(checkResult);
      lastTestRun.current = now;
      return checkResult;
    } catch (error) {
      console.error('Quick health check failed:', error);
      const errorResult = {
        isHealthy: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      setLastQuickCheck(errorResult);
      lastTestRun.current = now;
      return errorResult;
    }
  }, [testingService, lastQuickCheck]);

  const getTestSummary = useCallback(() => {
    if (!lastTestResults) return null;

    const { tests, passRate, overallStatus } = lastTestResults;
    const criticalTests = ['Basic Connectivity', 'Health Endpoint'];
    const criticalPassed = tests
      .filter(t => criticalTests.includes(t.name))
      .every(t => t.status === 'passed');

    return {
      overallHealthy: criticalPassed && passRate >= 75,
      passRate,
      overallStatus,
      criticalSystemsOperational: criticalPassed,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length
    };
  }, [lastTestResults]);

  return {
    isRunning,
    lastTestResults,
    lastQuickCheck,
    runFullTestSuite,
    runQuickHealthCheck,
    getTestSummary
  };
};
