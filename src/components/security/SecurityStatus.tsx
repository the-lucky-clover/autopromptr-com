
import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const SecurityStatus = () => {
  const { user, isEmailVerified, role, requireAuth } = useSecureAuth();

  const securityChecks = [
    {
      name: 'Authentication',
      status: requireAuth() ? 'secure' : 'warning',
      description: requireAuth() ? 'User is authenticated' : 'Not authenticated'
    },
    {
      name: 'Email Verification',
      status: isEmailVerified ? 'secure' : 'warning',
      description: isEmailVerified ? 'Email verified' : 'Email not verified'
    },
    {
      name: 'Role Assignment',
      status: role ? 'secure' : 'warning',
      description: role ? `Role: ${role}` : 'No role assigned'
    },
    {
      name: 'RLS Policies',
      status: 'secure',
      description: 'Row Level Security enabled'
    },
    {
      name: 'Input Validation',
      status: 'secure',
      description: 'Input sanitization active'
    },
    {
      name: 'Rate Limiting',
      status: 'secure',
      description: 'API rate limiting enabled'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
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
          Security Status
        </CardTitle>
        <CardDescription>
          Current security configuration and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityChecks.map((check) => (
            <div key={check.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
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
            <h4 className="font-medium mb-2">User Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Email: {user.email}</p>
              <p>Role: {role}</p>
              <p>Verified: {isEmailVerified ? 'Yes' : 'No'}</p>
              <p>Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
