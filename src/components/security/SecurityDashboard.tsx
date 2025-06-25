
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Key } from "lucide-react";
import { SecurityMonitor } from '@/services/security/securityMonitor';
import { SecurityHeaders } from '@/services/security/securityHeaders';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

export const SecurityDashboard = () => {
  const [securityStats, setSecurityStats] = useState(SecurityMonitor.getSecurityStats());
  const [securityStatus, setSecurityStatus] = useState(SecurityHeaders.getSecurityStatus());
  const { getSecurityAudit } = useSecureApiKeys();
  const [auditData, setAuditData] = useState(getSecurityAudit());

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityStats(SecurityMonitor.getSecurityStats());
      setSecurityStatus(SecurityHeaders.getSecurityStatus());
      setAuditData(getSecurityAudit());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getSecurityAudit]);

  const getOverallSecurityScore = (): { score: number; level: string; color: string } => {
    let score = 0;
    
    // Security headers (30 points)
    if (securityStatus.headersInitialized) score += 10;
    if (securityStatus.validation.valid) score += 10;
    if (securityStatus.isHttps) score += 10;
    
    // API key security (25 points)
    if (auditData.keyCount > 0) score += 15; // Keys are stored
    if (auditData.keys.every(k => k.version === '2.0')) score += 10; // Using latest security
    
    // Threat monitoring (25 points)
    const recentThreats = securityStats.recentThreats.length;
    if (recentThreats === 0) score += 25;
    else if (recentThreats < 3) score += 15;
    else if (recentThreats < 5) score += 10;
    
    // Activity monitoring (20 points)
    const criticalEvents = securityStats.eventsBySeverity.critical || 0;
    if (criticalEvents === 0) score += 20;
    else if (criticalEvents < 2) score += 10;
    
    let level: string;
    let color: string;
    
    if (score >= 85) {
      level = 'Excellent';
      color = 'text-green-400';
    } else if (score >= 70) {
      level = 'Good';
      color = 'text-blue-400';
    } else if (score >= 50) {
      level = 'Fair';
      color = 'text-yellow-400';
    } else {
      level = 'Poor';
      color = 'text-red-400';
    }
    
    return { score, level, color };
  };

  const refreshStats = () => {
    setSecurityStats(SecurityMonitor.getSecurityStats());
    setSecurityStatus(SecurityHeaders.getSecurityStatus());
    setAuditData(getSecurityAudit());
  };

  const securityScore = getOverallSecurityScore();

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Security Dashboard</CardTitle>
            </div>
            <Button
              onClick={refreshStats}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <CardDescription className="text-purple-200">
            Monitor your application's security status and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Security Score */}
          <div className="text-center p-6 bg-white/5 rounded-lg">
            <div className={`text-4xl font-bold ${securityScore.color} mb-2`}>
              {securityScore.score}/100
            </div>
            <div className="text-white text-lg font-medium mb-1">
              Security Score: {securityScore.level}
            </div>
            <p className="text-gray-400 text-sm">
              Overall security posture based on multiple factors
            </p>
          </div>

          {/* Security Headers Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">Security Headers</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Headers Initialized:</span>
                  {securityStatus.headersInitialized ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">HTTPS Enabled:</span>
                  {securityStatus.isHttps ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Headers Valid:</span>
                  {securityStatus.validation.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Key className="h-4 w-4 text-green-400" />
                <span className="text-white font-medium">API Key Security</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Stored Keys:</span>
                  <span className="text-white">{auditData.keyCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Enhanced Encryption:</span>
                  {auditData.keys.every(k => k.version === '2.0') ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Events */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">Security Events</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {securityStats.eventsBySeverity.critical || 0}
                </div>
                <div className="text-gray-400">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {securityStats.eventsBySeverity.high || 0}
                </div>
                <div className="text-gray-400">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {securityStats.eventsBySeverity.medium || 0}
                </div>
                <div className="text-gray-400">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {securityStats.eventsBySeverity.low || 0}
                </div>
                <div className="text-gray-400">Low</div>
              </div>
            </div>
          </div>

          {/* Recent Threats */}
          {securityStats.recentThreats.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-medium">Recent Threats Detected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {securityStats.recentThreats.map((threat, index) => (
                  <Badge key={index} variant="destructive" className="bg-red-500/20 text-red-300">
                    {threat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Security Issues */}
          {(!securityStatus.validation.valid || securityStatus.validation.missing.length > 0) && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Security Issues</span>
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                {securityStatus.validation.missing.map((header, index) => (
                  <li key={index}>• Missing header: {header}</li>
                ))}
                {securityStatus.validation.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
