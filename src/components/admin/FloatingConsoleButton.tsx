
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { ConsoleErrorDisplay } from './ConsoleErrorDisplay';
import { useUserRole } from '@/hooks/useUserRole';

export const FloatingConsoleButton = () => {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const { isSysOp } = useUserRole();

  if (!isSysOp) return null;

  return (
    <>
      <Button
        onClick={() => setIsConsoleOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
        size="sm"
      >
        <Terminal className="w-5 h-5" />
      </Button>
      
      <ConsoleErrorDisplay 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
      />
    </>
  );
};
