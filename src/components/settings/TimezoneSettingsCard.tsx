
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

const TimezoneSettingsCard = () => {
  const { timezone, updateTimezone, timezoneOptions, autoDetected } = useTimezone();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timezone Settings
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure your preferred timezone for the dashboard clock
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {autoDetected && (
          <div className="flex items-center gap-2 text-sm text-green-300 bg-green-500/20 p-2 rounded-lg">
            <MapPin className="w-4 h-4" />
            Timezone was automatically detected
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Select Timezone
          </label>
          <Select value={timezone} onValueChange={updateTimezone}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              {timezoneOptions.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="text-white hover:bg-white/10">
                  <div className="flex flex-col">
                    <span>{tz.label}</span>
                    <span className="text-xs text-gray-400">{tz.offset}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneSettingsCard;
