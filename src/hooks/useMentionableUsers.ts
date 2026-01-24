import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MentionableUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

export function useMentionableUsers() {
  const [users, setUsers] = useState<MentionableUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, display_name, display_name_preference, avatar_url")
        .not("user_id", "is", null)
        .limit(200);

      if (error) throw error;

      const mapped = (data || []).map((p: any) => {
        const preference = p.display_name_preference || "full_name";
        let displayName = "";

        if (preference === "nickname" && p.display_name) {
          displayName = p.display_name;
        } else if (preference === "first_name" && p.first_name) {
          displayName = p.first_name;
        } else if (p.first_name && p.last_name) {
          displayName = `${p.first_name} ${p.last_name}`;
        } else if (p.first_name) {
          displayName = p.first_name;
        } else {
          displayName = `User-${p.user_id.slice(0, 6)}`;
        }

        return {
          user_id: p.user_id,
          display_name: displayName,
          avatar_url: p.avatar_url,
          first_name: p.first_name,
          last_name: p.last_name,
        };
      });

      setUsers(mapped);
    } catch (e) {
      console.error("Error fetching mentionable users:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const searchUsers = useCallback(
    (query: string): MentionableUser[] => {
      if (!query) return users.slice(0, 10);
      const lowerQuery = query.toLowerCase();
      return users
        .filter(
          (u) =>
            u.display_name.toLowerCase().includes(lowerQuery) ||
            u.first_name?.toLowerCase().includes(lowerQuery) ||
            u.last_name?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 10);
    },
    [users]
  );

  return { users, loading, searchUsers, refetch: fetchUsers };
}
