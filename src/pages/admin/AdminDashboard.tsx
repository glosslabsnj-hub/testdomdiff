import { useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useChatLeadAnalytics } from '@/hooks/useChatLeadAnalytics';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Target,
  Calendar,
  BarChart3,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { analytics, isLoading: analyticsLoading, error } = useChatLeadAnalytics();

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-container py-20 text-center">
          <h1 className="headline-section mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">You don't have permission to view this page.</p>
          <Button variant="gold" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = analyticsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-container py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="headline-section">Lead Analytics</h1>
            <p className="text-muted-foreground">Chatbot conversation insights</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-charcoal border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Leads
                  </CardTitle>
                  <Users className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analytics.totalLeads}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.leadsToday} today, {analytics.leadsThisWeek} this week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Messages
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {analytics.avgMessageCount.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    per conversation
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conversions
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analytics.conversions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.conversionRate.toFixed(1)}% rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Today's Leads
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analytics.leadsToday}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    new conversations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Program Interest */}
              <Card className="bg-charcoal border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-gold" />
                    Program Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.programInterest).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(analytics.programInterest)
                        .sort(([, a], [, b]) => b - a)
                        .map(([program, count]) => {
                          const percentage = (count / analytics.totalLeads) * 100;
                          return (
                            <div key={program}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize text-foreground">{program}</span>
                                <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="h-2 bg-charcoal-dark rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gold rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No program interest data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Goals */}
              <Card className="bg-charcoal border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Target className="h-5 w-5 text-gold" />
                    Top Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.topGoals).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.topGoals)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 6)
                        .map(([goal, count]) => (
                          <div key={goal} className="flex items-center justify-between">
                            <span className="text-sm text-foreground truncate max-w-[200px]">{goal}</span>
                            <span className="text-sm text-gold font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No goal data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Leads Table */}
            <Card className="bg-charcoal border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentLeads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">First Message</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Goal</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Interest</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Messages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentLeads.map((lead) => (
                          <tr key={lead.id} className="border-b border-border/50 hover:bg-charcoal-dark/50">
                            <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 text-foreground max-w-[200px] truncate">
                              {lead.first_message || '-'}
                            </td>
                            <td className="py-3 px-2 text-foreground max-w-[150px] truncate">
                              {lead.goal || '-'}
                            </td>
                            <td className="py-3 px-2">
                              {lead.interested_program ? (
                                <span className="px-2 py-1 bg-gold/10 text-gold rounded-full text-xs capitalize">
                                  {lead.interested_program}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-foreground text-center">
                              {lead.message_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">No conversations yet</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
