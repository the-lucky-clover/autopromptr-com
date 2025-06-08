
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Screenshot {
  id: string;
  session_id: string;
  filename: string;
  url: string;
  prompt: string | null;
  file_path: string;
  file_size: number | null;
  created_at: string;
  metadata: any;
}

export const useScreenshots = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScreenshots = async (sessionId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('screenshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setScreenshots(data || []);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
      toast({
        title: "Error fetching screenshots",
        description: "Failed to load screenshots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveScreenshot = async (
    sessionId: string,
    screenshotBase64: string,
    url: string,
    prompt?: string,
    metadata?: any
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save screenshots",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Convert base64 to blob
      const base64Data = screenshotBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const filePath = `${user.id}/${sessionId}/${filename}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data: dbData, error: dbError } = await supabase
        .from('screenshots')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          filename: filename,
          url: url,
          prompt: prompt || null,
          file_path: filePath,
          file_size: blob.size,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Screenshot saved",
        description: "Screenshot has been saved successfully",
      });

      // Refresh screenshots list
      fetchScreenshots();
      
      return dbData;
    } catch (error) {
      console.error('Error saving screenshot:', error);
      toast({
        title: "Error saving screenshot",
        description: "Failed to save screenshot",
        variant: "destructive",
      });
      return null;
    }
  };

  const getScreenshotUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting screenshot URL:', error);
      return null;
    }
  };

  const deleteScreenshot = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('screenshots')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('screenshots')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Screenshot deleted",
        description: "Screenshot has been deleted successfully",
      });

      // Refresh screenshots list
      fetchScreenshots();
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast({
        title: "Error deleting screenshot",
        description: "Failed to delete screenshot",
        variant: "destructive",
      });
    }
  };

  const getSessionScreenshots = (sessionId: string) => {
    return screenshots.filter(s => s.session_id === sessionId);
  };

  const getAllSessions = () => {
    const sessions = new Set(screenshots.map(s => s.session_id));
    return Array.from(sessions);
  };

  useEffect(() => {
    if (user) {
      fetchScreenshots();
    }
  }, [user]);

  return {
    screenshots,
    loading,
    saveScreenshot,
    getScreenshotUrl,
    deleteScreenshot,
    fetchScreenshots,
    getSessionScreenshots,
    getAllSessions
  };
};
