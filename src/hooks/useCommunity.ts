import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CommunityChannel {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  display_order: number;
  min_tier: string;
  is_active: boolean;
}

export interface CommunityMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  reply_to_id: string | null;
  is_pinned: boolean;
  created_at: string;
  // Joined data
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_avatar_url?: string;
  user_display_name?: string;
  user_display_name_preference?: string;
}

export function useCommunityChannels() {
  const { subscription } = useAuth();
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("community_channels")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;

      // Filter by user's tier
      const userTier = subscription?.plan_type || "membership";
      const tierLevel: Record<string, number> = {
        membership: 1,
        transformation: 2,
        coaching: 3,
      };

      const userLevel = tierLevel[userTier] || 1;
      const filtered = (data || []).filter((ch: CommunityChannel) => {
        const channelLevel = tierLevel[ch.min_tier] || 1;
        return userLevel >= channelLevel;
      });

      setChannels(filtered as CommunityChannel[]);
    } catch (e) {
      console.error("Error fetching channels:", e);
    } finally {
      setLoading(false);
    }
  }, [subscription?.plan_type]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return { channels, loading, refetch: fetchChannels };
}

export function useCommunityMessages(channelId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch messages with user profile info
      const { data, error } = await supabase
        .from("community_messages")
        .select(`
          *,
          profiles!community_messages_user_id_fkey (
            email,
            first_name,
            last_name,
            avatar_url,
            display_name,
            display_name_preference
          )
        `)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        // Fallback without join if profiles FK doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("community_messages")
          .select("*")
          .eq("channel_id", channelId)
          .order("created_at", { ascending: true })
          .limit(100);

        if (fallbackError) throw fallbackError;
        setMessages((fallbackData || []) as CommunityMessage[]);
      } else {
        // Map the joined data
        const mapped = (data || []).map((msg: any) => ({
          ...msg,
          user_email: msg.profiles?.email,
          user_first_name: msg.profiles?.first_name,
          user_last_name: msg.profiles?.last_name,
          user_avatar_url: msg.profiles?.avatar_url,
          user_display_name: msg.profiles?.display_name,
          user_display_name_preference: msg.profiles?.display_name_preference,
        }));
        setMessages(mapped);
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`community_${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newMsg = payload.new as CommunityMessage;
          
          // Fetch profile data for the new message sender
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, first_name, last_name, avatar_url, display_name, display_name_preference")
            .eq("user_id", newMsg.user_id)
            .single();
          
          const enrichedMsg: CommunityMessage = {
            ...newMsg,
            user_email: profile?.email,
            user_first_name: profile?.first_name,
            user_last_name: profile?.last_name,
            user_avatar_url: profile?.avatar_url,
            user_display_name: profile?.display_name,
            user_display_name_preference: profile?.display_name_preference,
          };
          
          setMessages((prev) => [...prev, enrichedMsg]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "community_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = useCallback(async (content: string, replyToId?: string, mentionedUserIds?: string[]) => {
    if (!user || !channelId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from("community_messages")
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: content.trim(),
          reply_to_id: replyToId || null,
          mentioned_user_ids: mentionedUserIds || [],
        });

      if (error) throw error;
      
      // Message will appear via realtime subscription
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to send message",
        variant: "destructive",
      });
    }
  }, [user, channelId, toast]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("community_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete message",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}
