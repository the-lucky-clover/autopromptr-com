
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Eye, EyeOff, User, Key, Settings as SettingsIcon, Bell } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const { user } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <AppSidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl" />
              <div>
                <h1 className="text-2xl font-semibold text-white">Settings</h1>
                <p className="text-purple-200">Manage your account and application preferences</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-white" />
                  <CardTitle className="text-white">Profile Settings</CardTitle>
                </div>
                <CardDescription className="text-purple-200">
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white">Company (Optional)</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Enter your company name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                      <SelectItem value="est">EST (GMT-5)</SelectItem>
                      <SelectItem value="pst">PST (GMT-8)</SelectItem>
                      <SelectItem value="cet">CET (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-white" />
                  <CardTitle className="text-white">API Configuration</CardTitle>
                </div>
                <CardDescription className="text-purple-200">
                  Manage your API keys and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-white">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value="sk-proj-1234567890abcdef..."
                      disabled
                      className="bg-white/5 border-white/10 text-gray-400 flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl">
                  Generate New Key
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl" className="text-white">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://your-webhook.com/endpoint"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimitTier" className="text-white">Rate Limit Tier</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="basic">Basic - 100 req/min</SelectItem>
                      <SelectItem value="standard">Standard - 500 req/min</SelectItem>
                      <SelectItem value="premium">Premium - 1000 req/min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                  Save API Settings
                </Button>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5 text-white" />
                  <CardTitle className="text-white">Preferences</CardTitle>
                </div>
                <CardDescription className="text-purple-200">
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultPlatform" className="text-white">Default Platform</Label>
                  <Select defaultValue="openai">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="openai">ChatGPT</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Auto-enhance prompts</Label>
                    <p className="text-sm text-purple-200">Automatically improve prompt quality</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-white">Theme</Label>
                  <Select defaultValue="dark">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-white" />
                  <CardTitle className="text-white">Notifications</CardTitle>
                </div>
                <CardDescription className="text-purple-200">
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-purple-200">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Batch Completion</Label>
                    <p className="text-sm text-purple-200">Notify when batches complete</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">System Updates</Label>
                    <p className="text-sm text-purple-200">Important system announcements</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Marketing Emails</Label>
                    <p className="text-sm text-purple-200">Product updates and tips</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
