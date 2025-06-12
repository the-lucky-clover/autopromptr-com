
import { useState, useCallback } from 'react';
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

  const runFullTestSuite = useCallback(async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Starting full backend test suite...');
      const results = await testingService.runTestSuite();
      setLastTestResults(results);
      console.log('✅ Test suite completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runQuickHealthCheck = useCallback(async () => {
    try {
      const result = await testingService.runQuickHealthCheck();
      const checkResult = {
        ...result,
        timestamp: new Date()
      };
      setLastQuickCheck(checkResult);
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
      return errorResult;
    }
  }, []);

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
