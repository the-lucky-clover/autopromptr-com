
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

export const NotificationsCard = () => {
  return (
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
  );
};
