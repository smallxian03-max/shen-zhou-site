import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AppData } from "../types";
import { loadAppData, saveAppData } from "./storage";
import { compressImage } from "./image";

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

/** Upload image to Supabase Storage and return public URL */
export async function uploadImage(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const compressed = await compressImage(file, 800);
    const ext = compressed.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const client = getSupabase();
    const { data, error } = await client.storage
      .from("images")
      .upload(fileName, compressed, {
        contentType: "image/jpeg",
        upsert: false,
      });
    if (error) {
      console.warn("Image upload failed:", error.message);
      return null;
    }
    const { data: urlData } = client.storage.from("images").getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (e) {
    console.warn("Image upload error:", e);
    return null;
  }
}

export async function syncLoad(): Promise<AppData> {
  if (!isSupabaseConfigured()) return loadAppData();
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
      const local = loadAppData();
      const remoteTime = new Date(data.updated_at || 0).getTime();
      const localTimeRaw = localStorage.getItem("shen-zhou-app-saved-at");
      const localTime = localTimeRaw ? new Date(localTimeRaw).getTime() : 0;
      if (remoteTime >= localTime) {
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
  saveAppData(data);
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabase();
    const now = new Date().toISOString();
    localStorage.setItem("shen-zhou-app-saved-at", now);
    await client.from("app_state").upsert(
      { id: APP_ID, data, updated_at: now },
      { onConflict: "id" }
    );
  } catch (e) {
    console.warn("Supabase syncSave failed:", e);
  }
}

export function subscribeToChanges(callback: (data: AppData) => void): void {
  syncCallback = callback;
  if (!isSupabaseConfigured()) return;
  const client = getSupabase();
  channel = client.channel("app-sync");
  channel
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "app_state", filter: `id=eq.${APP_ID}` },
      (payload: { new: { data: AppData } }) => {
        if (payload.new?.data && syncCallback) {
          const local = loadAppData();
          const newData = payload.new.data as AppData;
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
  if (channel) { channel.unsubscribe(); channel = null; }
  syncCallback = null;
}