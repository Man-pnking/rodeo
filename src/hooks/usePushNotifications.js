import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(userId) {
  const { toast } = useToast();
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = "serviceWorker" in navigator && "PushManager" in window && !!VAPID_PUBLIC_KEY;
    setSupported(s);
    if (!s || !userId) return;

    (async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    })();
  }, [userId]);

  const enable = useCallback(async () => {
    if (!userId || !supported) return { error: "Not supported" };
    setLoading(true);

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") {
      setLoading(false);
      return { error: "Permission denied" };
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const subJson = sub.toJSON();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
      { onConflict: "user_id,endpoint" }
    );

    setLoading(false);
    if (error) {
      toast({ title: error.message, type: "error" });
      sounds.error();
      return { error: error.message };
    }

    setSubscribed(true);
    sounds.success();
    toast({ title: "Notifications enabled", type: "success" });
    return {};
  }, [userId, supported, toast]);

  const disable = useCallback(async () => {
    if (!userId || !supported) return;
    setLoading(true);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", endpoint);
    }
    setSubscribed(false);
    setLoading(false);
    toast({ title: "Notifications disabled", type: "info" });
  }, [userId, supported, toast]);

  return { supported, permission, subscribed, loading, enable, disable };
}
