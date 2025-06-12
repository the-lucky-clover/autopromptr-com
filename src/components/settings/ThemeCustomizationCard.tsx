
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Paintbrush, RefreshCw } from "lucide-react";

interface ThemeColor {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

const predefinedThemes: ThemeColor[] = [
  { name: "Purple Dream", primary: "#8B5CF6", secondary: "#A855F7", accent: "#C084FC" },
  { name: "Ocean Blue", primary: "#3B82F6", secondary: "#1D4ED8", accent: "#60A5FA" },
  { name: "Emerald Green", primary: "#10B981", secondary: "#059669", accent: "#34D399" },
  { name: "Sunset Orange", primary: "#F97316", secondary: "#EA580C", accent: "#FB923C" },
  { name: "Rose Pink", primary: "#EC4899", secondary: "#DB2777", accent: "#F472B6" },
  { name: "Indigo Night", primary: "#6366F1", secondary: "#4F46E5", accent: "#818CF8" },
  { name: "Crimson Red", primary: "#EF4444", secondary: "#DC2626", accent: "#F87171" },
  { name: "Amber Gold", primary: "#F59E0B", secondary: "#D97706", accent: "#FCD34D" },
];

const generateGradient = (color: string): string => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create darker variations
  const darkR = Math.max(0, Math.floor(r * 0.6));
  const darkG = Math.max(0, Math.floor(g * 0.6));
  const darkB = Math.max(0, Math.floor(b * 0.6));
  
  const darkerR = Math.max(0, Math.floor(r * 0.3));
  const darkerG = Math.max(0, Math.floor(g * 0.3));
  const darkerB = Math.max(0, Math.floor(b * 0.3));
  
  return `linear-gradient(135deg, ${color} 0%, rgb(${darkR}, ${darkG}, ${darkB}) 50%, rgb(${darkerR}, ${darkerG}, ${darkerB}) 100%)`;
};

const getTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export const ThemeCustomizationCard = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(predefinedThemes[0]);
  const [customColor, setCustomColor] = useState('#8B5CF6');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        setSelectedTheme(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, []);

  const applyTheme = (theme: ThemeColor) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-gradient', generateGradient(theme.primary));
    root.style.setProperty('--theme-text', getTextColor(theme.primary));
    
    // Save to localStorage
    localStorage.setItem('dashboard-theme', JSON.stringify(theme));
    setSelectedTheme(theme);
  };

  const createCustomTheme = () => {
    const customTheme: ThemeColor = {
      name: "Custom",
      primary: customColor,
      secondary: customColor,
      accent: customColor
    };
    applyTheme(customTheme);
  };

  const resetToDefault = () => {
    applyTheme(predefinedThemes[0]);
    localStorage.removeItem('dashboard-theme');
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-white" />
          <CardTitle className="text-white">Theme Customization</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          Customize your dashboard colors and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Theme */}
        <div className="space-y-2">
          <Label className="text-white">Current Theme</Label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full border-2 border-white/20"
              style={{ background: generateGradient(selectedTheme.primary) }}
            />
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {selectedTheme.name}
            </Badge>
          </div>
        </div>

        {/* Predefined Themes */}
        <div className="space-y-3">
          <Label className="text-white">Predefined Themes</Label>
          <div className="grid grid-cols-4 gap-2">
            {predefinedThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="ghost"
                className="h-auto p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg"
                onClick={() => applyTheme(theme)}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ background: generateGradient(theme.primary) }}
                  />
                  <span className="text-xs text-white truncate">{theme.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div className="space-y-3">
          <Label className="text-white">Custom Color</Label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-12 h-10 rounded-lg border-2 border-white/20 bg-transparent cursor-pointer"
            />
            <Button
              onClick={createCustomTheme}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg"
            >
              <Paintbrush className="w-4 h-4 mr-2" />
              Apply Custom
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-3 border-t border-white/10">
          <Button
            onClick={resetToDefault}
            variant="ghost"
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
