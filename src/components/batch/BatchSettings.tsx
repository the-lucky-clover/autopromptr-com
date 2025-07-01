
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface BatchSettingsProps {
  formData: {
    waitForIdle: boolean;
    maxRetries: number;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWaitForIdleChange: (checked: boolean) => void;
}

const BatchSettings = ({ formData, onInputChange, onWaitForIdleChange }: BatchSettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-white">Automation Settings</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="waitForIdle"
          name="waitForIdle"
          checked={formData.waitForIdle}
          onCheckedChange={onWaitForIdleChange}
          className="bg-white/10 border-white/20 text-blue-500 rounded-md"
        />
        <label htmlFor="waitForIdle" className="text-sm text-white">
          Wait for page to be idle before proceeding
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            id="maxRetries"
            name="maxRetries"
            value={formData.maxRetries}
            onChange={onInputChange}
            placeholder="Max retry attempts (default: 3)"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default BatchSettings;
