import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// VAPID public key - this should be generated and stored securely
// For now, we'll generate one and the private key should be stored as a secret
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Check if push notifications are supported
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, [user]);

  const checkExistingSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Check if subscription exists in our database
        const { data } = await supabase
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint)
          .single();
        
        setIsSubscribed(!!data);
      } else {
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  }, [user]);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;
    
    setIsLoading(true);
    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== "granted") {
        toast({
          title: "Permission Denied",
          description: "You need to allow notifications to receive updates.",
          variant: "destructive",
        });
        return false;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      const json = subscription.toJSON();
      
      // Save subscription to database
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      }, {
        onConflict: "user_id,endpoint",
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for important updates.",
      });
      
      return true;
    } catch (e: any) {
      console.error("Error subscribing to push:", e);
      toast({
        title: "Error",
        description: e.message || "Failed to enable notifications.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications.",
      });
      
      return true;
    } catch (e: any) {
      console.error("Error unsubscribing from push:", e);
      toast({
        title: "Error",
        description: e.message || "Failed to disable notifications.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
}
