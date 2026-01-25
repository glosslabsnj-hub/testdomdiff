import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, ExternalLink } from "lucide-react";

export default function SupportInbox() {
  return (
    <Card className="bg-charcoal border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Support Inbox
        </CardTitle>
        <CardDescription>
          Customer support requests and inquiries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Placeholder content */}
        <div className="text-center py-8 bg-background/50 rounded-lg border border-border/50">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Support Integration Yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Support requests are currently handled via email. Consider integrating a help desk 
            system like Intercom, Crisp, or Help Scout for in-app support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <a href="mailto:support@domdifferent.com" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Open Email Client
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a 
                href="https://gmail.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Check Gmail <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">—</div>
            <div className="text-xs text-muted-foreground">Open Tickets</div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">—</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">—</div>
            <div className="text-xs text-muted-foreground">Resolved Today</div>
          </div>
        </div>

        {/* Future Integration Note */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-medium text-foreground text-sm mb-1">💡 Future Enhancement</h4>
          <p className="text-xs text-muted-foreground">
            When ready, integrate a support widget to handle tickets, live chat, and 
            knowledge base articles directly within the admin dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
