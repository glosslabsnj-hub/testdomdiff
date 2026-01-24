import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Hash, Menu, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import SolitaryUpgradeModal from "@/components/SolitaryUpgradeModal";
import ChannelSidebar from "@/components/community/ChannelSidebar";
import MessageList from "@/components/community/MessageList";
import MessageInput from "@/components/community/MessageInput";
import WinsFeed from "@/components/community/WinsFeed";
import { useCommunityChannels, useCommunityMessages } from "@/hooks/useCommunity";
import { cn } from "@/lib/utils";

const Community = () => {
  const { subscription } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const isMembership = subscription?.plan_type === "membership";
  const isCoaching = subscription?.plan_type === "coaching";
  
  const { channels, loading: channelsLoading } = useCommunityChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { messages, loading: messagesLoading, sendMessage, deleteMessage } = 
    useCommunityMessages(selectedChannelId);

  // Auto-select first channel
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);
  
  // Solitary (membership) users see modal and redirect on close
  useEffect(() => {
    if (isMembership) {
      setShowModal(true);
    }
  }, [isMembership]);

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      navigate("/dashboard");
    }
  };

  if (isMembership) {
    return (
      <SolitaryUpgradeModal
        open={showModal}
        onOpenChange={handleModalClose}
        feature="The Yard (Community)"
      />
    );
  }

  const selectedChannel = channels.find(c => c.id === selectedChannelId);
  const isWinsChannel = selectedChannel?.name.toLowerCase().includes("wins");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      <main className="flex-1 flex flex-col pt-16">
        {/* Top Bar */}
        <div className="border-b border-border bg-charcoal px-4 py-3 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <ChannelSidebar
                channels={channels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={(id) => {
                  setSelectedChannelId(id);
                  setMobileMenuOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            {isWinsChannel ? (
              <Trophy className="w-5 h-5 text-primary" />
            ) : (
              <Hash className="w-5 h-5 text-primary" />
            )}
            <div>
              <h1 className="font-display text-lg">
                {selectedChannel?.name.replace(/-/g, " ") || "Community"}
              </h1>
              {selectedChannel?.description && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {selectedChannel.description}
                </p>
              )}
            </div>
          </div>

          <div className="ml-auto">
            <span className="text-xs text-muted-foreground">
              {isCoaching ? "The Network" : "The Yard"}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-56 flex-shrink-0">
            {channelsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ChannelSidebar
                channels={channels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
              />
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {!selectedChannelId ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a channel to start chatting</p>
                </div>
              </div>
            ) : isWinsChannel ? (
              <WinsFeed channelId={selectedChannelId} />
            ) : (
              <>
                <MessageList
                  messages={messages}
                  loading={messagesLoading}
                  onDeleteMessage={deleteMessage}
                />
                <MessageInput
                  onSend={sendMessage}
                  placeholder={`Message #${selectedChannel?.name || "channel"}...`}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
