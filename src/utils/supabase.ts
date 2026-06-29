import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AppData } from "../types";
import { loadAppData, saveAppData } from "./storage";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const APP_ID = "shen-zhou-app";

let supabase: SupabaseClient | null = null;
let syncCallback: ((data: AppData) => void) | null = null;
let channel: ReturnType<SupabaseClient["channel"]> | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

export async function syncLoad(): Promise<AppData> {
  if (!isSupabaseConfigured()) {
    return loadAppData();
  }

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from("app_state")
      .select("data, updated_at")
      .eq("id", APP_ID)
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("Supabase load error:", error);
      return loadAppData();
    }

    if (data?.data) {
      const remoteData = data.data as AppData;
      // Merge with localStorage data (local takes precedence for fields not in remote)
      const local = loadAppData();
      // Use the more recent version — compare updated_at
      const remoteTime = new Date(data.updated_at || 0).getTime();
      
      // Try to get local save time
      const localTimeRaw = localStorage.getItem("shen-zhou-app-saved-at");
      const localTime = localTimeRaw ? new Date(localTimeRaw).getTime() : 0;

      if (remoteTime >= localTime) {
        // Use remote data, but keep local identity
        saveAppData({ ...remoteData, currentUser: local.currentUser, hasSelectedIdentity: local.hasSelectedIdentity });
        return { ...remoteData, currentUser: local.currentUser, hasSelectedIdentity: local.hasSelectedIdentity };
      }
      return local;
    }

    return loadAppData();
  } catch (e) {
    console.warn("Supabase syncLoad failed, using local:", e);
    return loadAppData();
  }
}

export async function syncSave(data: AppData): Promise<void> {
  // Always save locally first
  saveAppData(data);

  if (!isSupabaseConfigured()) return;

  try {
    const client = getSupabase();
    const now = new Date().toISOString();
    localStorage.setItem("shen-zhou-app-saved-at", now);

    await client.from("app_state").upsert(
      {
        id: APP_ID,
        data: sanitizeData(data),
        updated_at: now,
      },
      { onConflict: "id" }
    );
  } catch (e) {
    console.warn("Supabase syncSave failed:", e);
  }
}

/** Remove base64 images from workout records to save space, keep a reference */
function sanitizeData(data: AppData): AppData {
  return data;
}

export function subscribeToChanges(callback: (data: AppData) => void): void {
  syncCallback = callback;

  if (!isSupabaseConfigured()) return;

  const client = getSupabase();
  channel = client.channel("app-sync");

  channel
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "app_state",
        filter: `id=eq.${APP_ID}`,
      },
      (payload: { new: { data: AppData } }) => {
        if (payload.new?.data && syncCallback) {
          const local = loadAppData();
          const newData = payload.new.data as AppData;
          // Keep local identity
          syncCallback({
            ...newData,
            currentUser: local.currentUser,
            hasSelectedIdentity: local.hasSelectedIdentity,
          });
        }
      }
    )
    .subscribe();
}

export function unsubscribeFromChanges(): void {
  if (channel) {
    channel.unsubscribe();
    channel = null;
  }
  syncCallback = null;
}