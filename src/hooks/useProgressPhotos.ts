import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ProgressPhoto {
  id: string;
  user_id: string;
  photo_type: "before" | "during" | "after";
  storage_path: string;
  caption: string | null;
  week_number: number | null;
  privacy_level: "private" | "coach_only" | "public";
  taken_at: string | null;
  created_at: string;
  updated_at: string;
  url?: string; // Generated signed URL
}

export function useProgressPhotos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    if (!user) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("photo_type")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate signed URLs for each photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from("progress-photos")
            .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

          return {
            ...photo,
            url: urlData?.signedUrl,
          } as ProgressPhoto;
        })
      );

      setPhotos(photosWithUrls);
    } catch (e: any) {
      console.error("Error fetching progress photos:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = async (
    file: File,
    photoType: "before" | "during" | "after",
    options?: {
      caption?: string;
      weekNumber?: number;
      privacyLevel?: "private" | "coach_only" | "public";
    }
  ) => {
    if (!user) throw new Error("Must be logged in");

    try {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${photoType}_${Date.now()}.${fileExt}`;
      const storagePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase.from("progress_photos").insert({
        user_id: user.id,
        photo_type: photoType,
        storage_path: storagePath,
        caption: options?.caption || null,
        week_number: options?.weekNumber || null,
        privacy_level: options?.privacyLevel || "private",
      });

      if (dbError) throw dbError;

      await fetchPhotos();
      toast({ title: "Photo Uploaded", description: `${photoType} photo saved successfully.` });
      return true;
    } catch (e: any) {
      console.error("Error uploading photo:", e);
      toast({ title: "Upload Failed", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updatePhoto = async (
    photoId: string,
    updates: {
      caption?: string;
      privacy_level?: "private" | "coach_only" | "public";
    }
  ) => {
    try {
      const { error } = await supabase
        .from("progress_photos")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", photoId);

      if (error) throw error;

      await fetchPhotos();
      toast({ title: "Updated", description: "Photo settings updated." });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deletePhoto = async (photoId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("progress-photos")
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("progress_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      await fetchPhotos();
      toast({ title: "Deleted", description: "Photo removed." });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const getPhotosByType = (type: "before" | "during" | "after") => {
    return photos.filter((p) => p.photo_type === type);
  };

  return {
    photos,
    loading,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
    getPhotosByType,
    refetch: fetchPhotos,
  };
}
