import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ExternalLink, BarChart3, Calendar } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function SiteSettingsManager() {
  const { settings, isLoading, updateSetting } = useSiteSettings();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      const values: Record<string, string> = {};
      settings.forEach((s) => {
        values[s.key] = s.value || "";
      });
      setFormValues(values);
    }
  }, [settings]);

  const handleSave = async (key: string) => {
    setSaving(key);
    await updateSetting.mutateAsync({ key, value: formValues[key] || "" });
    setSaving(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Pixels */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics & Tracking Pixels
          </CardTitle>
          <CardDescription>
            Configure your marketing pixels to track conversions from Instagram, Facebook, Google, and TikTok.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Pixel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_pixel_id">Meta (Facebook/Instagram) Pixel ID</Label>
              <a 
                href="https://business.facebook.com/events_manager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get Pixel ID <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                id="meta_pixel_id"
                placeholder="e.g., 123456789012345"
                value={formValues.meta_pixel_id || ""}
                onChange={(e) => setFormValues({ ...formValues, meta_pixel_id: e.target.value })}
                className="bg-background"
              />
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleSave("meta_pixel_id")}
                disabled={saving === "meta_pixel_id"}
              >
                {saving === "meta_pixel_id" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tracks: ViewContent, InitiateCheckout, Purchase, Lead
            </p>
          </div>

          {/* GA4 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ga4_measurement_id">Google Analytics 4 Measurement ID</Label>
              <a 
                href="https://analytics.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get GA4 ID <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                id="ga4_measurement_id"
                placeholder="e.g., G-XXXXXXXXXX"
                value={formValues.ga4_measurement_id || ""}
                onChange={(e) => setFormValues({ ...formValues, ga4_measurement_id: e.target.value })}
                className="bg-background"
              />
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleSave("ga4_measurement_id")}
                disabled={saving === "ga4_measurement_id"}
              >
                {saving === "ga4_measurement_id" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* TikTok Pixel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
              <a 
                href="https://ads.tiktok.com/help/article/events-manager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get TikTok Pixel <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                id="tiktok_pixel_id"
                placeholder="e.g., CXXXXXXXXXXXXXXXXX"
                value={formValues.tiktok_pixel_id || ""}
                onChange={(e) => setFormValues({ ...formValues, tiktok_pixel_id: e.target.value })}
                className="bg-background"
              />
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleSave("tiktok_pixel_id")}
                disabled={saving === "tiktok_pixel_id"}
              >
                {saving === "tiktok_pixel_id" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendly */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Calendly Integration
          </CardTitle>
          <CardDescription>
            Your booking page URL for free consultation calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="calendly_url">Calendly URL</Label>
              <a 
                href="https://calendly.com/event_types" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Manage Events <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                id="calendly_url"
                placeholder="https://calendly.com/your-username/consultation"
                value={formValues.calendly_url || ""}
                onChange={(e) => setFormValues({ ...formValues, calendly_url: e.target.value })}
                className="bg-background"
              />
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleSave("calendly_url")}
                disabled={saving === "calendly_url"}
              >
                {saving === "calendly_url" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Email */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle>Support Contact</CardTitle>
          <CardDescription>
            The email address displayed to customers for support inquiries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              id="support_email"
              type="email"
              placeholder="support@domdifferent.com"
              value={formValues.support_email || ""}
              onChange={(e) => setFormValues({ ...formValues, support_email: e.target.value })}
              className="bg-background"
            />
            <Button
              variant="gold"
              size="sm"
              onClick={() => handleSave("support_email")}
              disabled={saving === "support_email"}
            >
              {saving === "support_email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
