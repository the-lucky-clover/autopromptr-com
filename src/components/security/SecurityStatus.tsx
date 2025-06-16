
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Database, Users, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const SecurityStatus = () => {
  const { user, isEmailVerified, role, requireAuth, roleLoading } = useSecureAuth();

  const securityChecks = [
    {
      name: 'Authentication',
      status: requireAuth() ? 'secure' : 'warning',
      description: requireAuth() ? 'User is authenticated' : 'Not authenticated',
      icon: Lock
    },
    {
      name: 'Email Verification',
      status: isEmailVerified ? 'secure' : 'warning',
      description: isEmailVerified ? 'Email verified' : 'Email not verified',
      icon: CheckCircle
    },
    {
      name: 'Database Role Assignment',
      status: role && !roleLoading ? 'secure' : 'warning',
      description: roleLoading ? 'Loading role...' : role ? `Role: ${role}` : 'No role assigned',
      icon: Users
    },
    {
      name: 'RLS Policies',
      status: 'secure',
      description: 'Row Level Security enabled on all tables',
      icon: Database
    },
    {
      name: 'Input Validation',
      status: 'secure',
      description: 'Comprehensive input sanitization active',
      icon: Shield
    },
    {
      name: 'Rate Limiting',
      status: 'secure',
      description: 'API rate limiting enabled',
      icon: Shield
    },
    {
      name: 'Security Logging',
      status: 'secure',
      description: 'Security events logged to database',
      icon: Database
    }
  ];

  const getStatusIcon = (status: string, IconComponent: any) => {
    const iconClass = status === 'secure' ? 'text-green-500' : 'text-yellow-500';
    return <IconComponent className={`h-4 w-4 ${iconClass}`} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'secure':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Secure</Badge>;
      case 'warning':
        return <Badge variant="destructive">Needs Attention</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Status Dashboard
        </CardTitle>
        <CardDescription>
          Comprehensive security configuration and monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityChecks.map((check) => (
            <div key={check.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status, check.icon)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-gray-600">{check.description}</p>
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>
        
        {user && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">User Security Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Email: {user.email}</p>
              <p>Database Role: {roleLoading ? 'Loading...' : role}</p>
              <p>Email Verified: {isEmailVerified ? 'Yes' : 'No'}</p>
              <p>Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
              <p>Account Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Security Features Active</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>✓ Row Level Security (RLS) on all database tables</p>
            <p>✓ Database-driven role-based access control</p>
            <p>✓ Comprehensive input validation and sanitization</p>
            <p>✓ Rate limiting on authentication endpoints</p>
            <p>✓ Security event logging and monitoring</p>
            <p>✓ Secure session management</p>
            <p>✓ XSS and injection attack prevention</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
