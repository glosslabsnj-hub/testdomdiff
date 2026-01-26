import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ClientCustomProgram {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useClientCustomPrograms(clientId: string | null) {
  const [programs, setPrograms] = useState<ClientCustomProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    if (!clientId) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("client_custom_programs")
      .select("*")
      .eq("client_id", clientId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching client programs:", error);
      toast({
        title: "Error",
        description: "Failed to load custom programs",
        variant: "destructive",
      });
    } else {
      setPrograms((data as ClientCustomProgram[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, [clientId]);

  const uploadProgram = async (
    file: File,
    title: string,
    description?: string
  ) => {
    if (!clientId) return null;

    try {
      // Upload file to storage
      const filePath = `${clientId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("client-programs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data, error: dbError } = await supabase
        .from("client_custom_programs")
        .insert({
          client_id: clientId,
          title,
          description: description || null,
          file_url: filePath,
          file_type: file.type,
          display_order: programs.length,
          is_active: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Program uploaded",
        description: `${title} has been added to the client's program`,
      });

      await fetchPrograms();
      return data as ClientCustomProgram;
    } catch (error) {
      console.error("Error uploading program:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload the program file",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProgram = async (
    id: string,
    updates: Partial<Pick<ClientCustomProgram, "title" | "description" | "display_order" | "is_active">>
  ) => {
    try {
      const { error } = await supabase
        .from("client_custom_programs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Program updated",
        description: "Changes have been saved",
      });

      await fetchPrograms();
      return true;
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        title: "Update failed",
        description: "Could not update the program",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProgram = async (id: string) => {
    const program = programs.find((p) => p.id === id);
    if (!program) return false;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("client-programs")
        .remove([program.file_url]);

      if (storageError) console.warn("Storage delete error:", storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("client_custom_programs")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "Program deleted",
        description: `${program.title} has been removed`,
      });

      await fetchPrograms();
      return true;
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the program",
        variant: "destructive",
      });
      return false;
    }
  };

  const getSignedUrl = async (fileUrl: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from("client-programs")
        .createSignedUrl(fileUrl, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }
  };

  return {
    programs,
    loading,
    uploadProgram,
    updateProgram,
    deleteProgram,
    getSignedUrl,
    refetch: fetchPrograms,
  };
}
