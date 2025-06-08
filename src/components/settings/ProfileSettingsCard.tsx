
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export const ProfileSettingsCard = () => {
  const { user } = useAuth();

  return (
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
  );
};
