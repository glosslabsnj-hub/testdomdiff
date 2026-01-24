import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export function useDirectMessages(recipientId?: string) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as DirectMessage[]);
    } catch (e: any) {
      console.error("Error fetching messages:", e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("direct_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      });
      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("direct_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (e: any) {
      return false;
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchMessages();

    const channel = supabase
      .channel("direct_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { messages, loading, sendMessage, markAsRead, fetchMessages };
}
