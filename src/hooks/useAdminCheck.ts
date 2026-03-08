import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_CACHE_KEY = 'admin_check_cache';

function getCachedAdminStatus(userId: string): boolean | null {
  try {
    const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!cached) return null;
    const { uid, isAdmin, ts } = JSON.parse(cached);
    // Cache valid for 30 minutes and same user
    if (uid === userId && Date.now() - ts < 30 * 60 * 1000) return isAdmin;
  } catch {}
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  try {
    sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({ uid: userId, isAdmin, ts: Date.now() }));
  } catch {}
}

export function useAdminCheck() {
  const { user } = useAuth();

  const cachedValue = user ? getCachedAdminStatus(user.id) : null;

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      const result = !!data;
      setCachedAdminStatus(user.id, result);
      return result;
    },
    enabled: !!user,
    // Use sessionStorage cache as initial data so we don't block on the network call
    initialData: cachedValue ?? undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // If we have cached data, don't report as loading (react-query still fetches in background)
  const effectiveLoading = cachedValue !== null ? false : (!!user && isLoading);

  return { isAdmin, isLoading: effectiveLoading };
}
