import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WardenMessage {
  id: string;
  user_id: string;
  week_number: number;
  message_type: string;
  message: string;
  scripture_reference: string | null;
  scripture_text: string | null;
  focus_area: string;
  generated_at: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useWarden() {
  const { user, session } = useAuth();
  const [weeklyBrief, setWeeklyBrief] = useState<WardenMessage | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch weekly brief
  const fetchWeeklyBrief = useCallback(async (forceRefresh = false) => {
    if (!user || !session) return;

    setBriefLoading(true);
    setBriefError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/warden-brief`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ forceRefresh }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weekly brief");
      }

      const data = await response.json();
      setWeeklyBrief(data);
    } catch (error: any) {
      console.error("Error fetching weekly brief:", error);
      setBriefError(error.message || "Failed to get your weekly brief");
    } finally {
      setBriefLoading(false);
    }
  }, [user, session]);

  // Load existing conversation
  const loadConversation = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("warden_conversations")
        .select("messages")
        .eq("user_id", user.id)
        .single() as { data: { messages: ChatMessage[] } | null };

      if (data?.messages) {
        setChatMessages(data.messages as ChatMessage[]);
      }
    } catch (error) {
      // No existing conversation, that's fine
    }
  }, [user]);

  // Send chat message
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !session || chatLoading) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const userMessage: ChatMessage = { role: "user", content };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatLoading(true);
    setChatError(null);

    // Add empty assistant message for streaming
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setChatMessages([...newMessages, assistantMessage]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/warden-chat`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: newMessages }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullContent,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Clean up empty assistant messages
      if (!fullContent) {
        setChatMessages(newMessages);
      }

    } catch (error: any) {
      if (error.name === "AbortError") return;
      
      console.error("Error sending message:", error);
      setChatError(error.message || "Failed to get response");
      // Remove the empty assistant message on error
      setChatMessages(newMessages);
    } finally {
      setChatLoading(false);
      abortControllerRef.current = null;
    }
  }, [user, session, chatMessages, chatLoading]);

  // Clear chat
  const clearChat = useCallback(async () => {
    setChatMessages([]);
    setChatError(null);

    if (user) {
      try {
        await supabase
          .from("warden_conversations")
          .delete()
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error clearing conversation:", error);
      }
    }
  }, [user]);

  // Load brief and conversation on mount
  useEffect(() => {
    if (user && session) {
      fetchWeeklyBrief();
      loadConversation();
    }
  }, [user, session, fetchWeeklyBrief, loadConversation]);

  return {
    // Weekly brief
    weeklyBrief,
    briefLoading,
    briefError,
    refreshBrief: () => fetchWeeklyBrief(true),

    // Chat
    chatMessages,
    chatLoading,
    chatError,
    sendMessage,
    clearChat,
  };
}
