import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CommunityWin {
  id: string;
  user_id: string;
  channel_id: string | null;
  caption: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  // Joined data
  user_first_name?: string;
  user_last_name?: string;
  user_avatar_url?: string;
  has_liked?: boolean;
}

export interface WinComment {
  id: string;
  win_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_first_name?: string;
  user_last_name?: string;
  user_avatar_url?: string;
}

export function useCommunityWins(channelId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wins, setWins] = useState<CommunityWin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWins = useCallback(async () => {
    try {
      let query = supabase
        .from("community_wins")
        .select(`
          *,
          profiles!community_wins_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (channelId) {
        query = query.eq("channel_id", channelId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check which wins user has liked
      let likedWinIds: string[] = [];
      if (user && data && data.length > 0) {
        const { data: likes } = await supabase
          .from("community_wins_likes")
          .select("win_id")
          .eq("user_id", user.id)
          .in("win_id", data.map((w: any) => w.id));
        
        likedWinIds = (likes || []).map((l: any) => l.win_id);
      }

      const mapped = (data || []).map((win: any) => ({
        ...win,
        user_first_name: win.profiles?.first_name,
        user_last_name: win.profiles?.last_name,
        user_avatar_url: win.profiles?.avatar_url,
        has_liked: likedWinIds.includes(win.id),
      }));

      setWins(mapped);
    } catch (e) {
      console.error("Error fetching wins:", e);
    } finally {
      setLoading(false);
    }
  }, [channelId, user]);

  useEffect(() => {
    fetchWins();
  }, [fetchWins]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("community_wins_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_wins" },
        () => {
          fetchWins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWins]);

  const createWin = useCallback(async (
    file: File,
    caption: string
  ) => {
    if (!user) return;

    try {
      const isVideo = file.type.startsWith("video/");
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("community-wins")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("community-wins")
        .getPublicUrl(fileName);

      // Create win record
      const { error: insertError } = await supabase
        .from("community_wins")
        .insert({
          user_id: user.id,
          caption,
          media_type: isVideo ? "video" : "image",
          media_url: urlData.publicUrl,
          channel_id: channelId || null,
        });

      if (insertError) throw insertError;

      toast({ title: "Win posted!", description: "Your victory is shared with the brotherhood." });
      await fetchWins();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to post win",
        variant: "destructive",
      });
    }
  }, [user, channelId, toast, fetchWins]);

  const likeWin = useCallback(async (winId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const win = wins.find(w => w.id === winId);
      
      if (win?.has_liked) {
        // Unlike
        await supabase
          .from("community_wins_likes")
          .delete()
          .eq("win_id", winId)
          .eq("user_id", user.id);

        await supabase
          .from("community_wins")
          .update({ likes_count: Math.max(0, (win.likes_count || 1) - 1) })
          .eq("id", winId);
      } else {
        // Like
        await supabase
          .from("community_wins_likes")
          .insert({ win_id: winId, user_id: user.id });

        await supabase
          .from("community_wins")
          .update({ likes_count: (win?.likes_count || 0) + 1 })
          .eq("id", winId);
      }

      await fetchWins();
    } catch (e: any) {
      console.error("Error toggling like:", e);
    }
  }, [user, wins, fetchWins]);

  const deleteWin = useCallback(async (winId: string) => {
    try {
      const { error } = await supabase
        .from("community_wins")
        .delete()
        .eq("id", winId);

      if (error) throw error;
      await fetchWins();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete win",
        variant: "destructive",
      });
    }
  }, [toast, fetchWins]);

  return {
    wins,
    loading,
    createWin,
    likeWin,
    deleteWin,
    refetch: fetchWins,
  };
}

export function useWinComments(winId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<WinComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!winId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_wins_comments")
        .select(`
          *,
          profiles!community_wins_comments_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("win_id", winId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((c: any) => ({
        ...c,
        user_first_name: c.profiles?.first_name,
        user_last_name: c.profiles?.last_name,
        user_avatar_url: c.profiles?.avatar_url,
      }));

      setComments(mapped);
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setLoading(false);
    }
  }, [winId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(async (content: string) => {
    if (!user || !winId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from("community_wins_comments")
        .insert({
          win_id: winId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      // Update comment count
      await supabase
        .from("community_wins")
        .update({ comments_count: comments.length + 1 })
        .eq("id", winId);

      await fetchComments();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add comment",
        variant: "destructive",
      });
    }
  }, [user, winId, comments.length, toast, fetchComments]);

  return { comments, loading, addComment, refetch: fetchComments };
}
