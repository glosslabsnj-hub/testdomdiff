import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatLead {
  id: string;
  session_id: string;
  first_message: string | null;
  goal: string | null;
  experience_level: string | null;
  pain_points: string[] | null;
  interested_program: string | null;
  recommended_program: string | null;
  conversion_action: string | null;
  message_count: number;
  created_at: string;
  converted_at: string | null;
}

interface LeadAnalytics {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  programInterest: Record<string, number>;
  conversions: number;
  conversionRate: number;
  avgMessageCount: number;
  topGoals: Record<string, number>;
  recentLeads: ChatLead[];
}

export function useChatLeadAnalytics() {
  const [analytics, setAnalytics] = useState<LeadAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: leads, error: fetchError } = await supabase
          .from('chat_leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (!leads || leads.length === 0) {
          setAnalytics({
            totalLeads: 0,
            leadsToday: 0,
            leadsThisWeek: 0,
            programInterest: {},
            conversions: 0,
            conversionRate: 0,
            avgMessageCount: 0,
            topGoals: {},
            recentLeads: [],
          });
          return;
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);

        const leadsToday = leads.filter(l => new Date(l.created_at) >= todayStart).length;
        const leadsThisWeek = leads.filter(l => new Date(l.created_at) >= weekStart).length;

        // Program interest counts
        const programInterest: Record<string, number> = {};
        leads.forEach(l => {
          if (l.interested_program) {
            programInterest[l.interested_program] = (programInterest[l.interested_program] || 0) + 1;
          }
        });

        // Goal counts
        const topGoals: Record<string, number> = {};
        leads.forEach(l => {
          if (l.goal) {
            topGoals[l.goal] = (topGoals[l.goal] || 0) + 1;
          }
        });

        // Conversions
        const conversions = leads.filter(l => l.converted_at).length;
        const conversionRate = leads.length > 0 ? (conversions / leads.length) * 100 : 0;

        // Average message count
        const totalMessages = leads.reduce((sum, l) => sum + (l.message_count || 0), 0);
        const avgMessageCount = leads.length > 0 ? totalMessages / leads.length : 0;

        setAnalytics({
          totalLeads: leads.length,
          leadsToday,
          leadsThisWeek,
          programInterest,
          conversions,
          conversionRate,
          avgMessageCount,
          topGoals,
          recentLeads: leads.slice(0, 20) as ChatLead[],
        });
      } catch (e) {
        console.error('Error fetching analytics:', e);
        setError('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return { analytics, isLoading, error };
}
