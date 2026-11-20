import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/app/lib/supabase";

export interface PincodeItem {
  id: string;
  pincode: string;
  area_name: string;
  delivery_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const PINCODES_FILE_PATH = path.join(process.cwd(), "app", "data", "pincodes.json");

function readLocalPincodes(): PincodeItem[] {
  try {
    if (fs.existsSync(PINCODES_FILE_PATH)) {
      const content = fs.readFileSync(PINCODES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading pincodes.json:", e);
  }
  return [];
}

function writeLocalPincodes(items: PincodeItem[]) {
  try {
    const dir = path.dirname(PINCODES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PINCODES_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing pincodes.json:", e);
  }
}

export async function getAllPincodes(): Promise<{ pincodes: PincodeItem[]; stats: any }> {
  // 1. Try Supabase first
  try {
    const { data, error } = await supabaseAdmin
      .from("pincodes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const activeCount = data.filter((p: any) => p.is_active).length;
      return {
        pincodes: data,
        stats: {
          total: data.length,
          active: activeCount,
          paused: data.length - activeCount,
        },
      };
    }
  } catch (err) {
    // Supabase table not present, fall through to local file
  }

  // 2. Read local persistent store
  const localItems = readLocalPincodes();
  const activeCount = localItems.filter((p) => p.is_active).length;

  return {
    pincodes: localItems,
    stats: {
      total: localItems.length,
      active: activeCount,
      paused: localItems.length - activeCount,
    },
  };
}

export async function addPincode(data: {
  pincode: string;
  area_name: string;
  delivery_time?: string;
  is_active?: boolean;
}): Promise<PincodeItem> {
  const trimmed = data.pincode.trim();
  const areaName = (data.area_name || "").trim() || "Kolkata Delivery Hub";
  const deliveryTime = data.delivery_time || "45–60 Mins Express";
  const isActive = data.is_active !== false;

  const newItem: PincodeItem = {
    id: `pin_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    pincode: trimmed,
    area_name: areaName,
    delivery_time: deliveryTime,
    is_active: isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Try insert into Supabase
  try {
    const { data: dbRecord, error } = await supabaseAdmin
      .from("pincodes")
      .insert({
        pincode: trimmed,
        area_name: areaName,
        delivery_time: deliveryTime,
        is_active: isActive,
      })
      .select()
      .single();

    if (!error && dbRecord) {
      newItem.id = dbRecord.id;
    }
  } catch {
    // Ignore error if table is missing in Supabase
  }

  // 2. Always persist locally
  const current = readLocalPincodes();
  const existsIdx = current.findIndex((p) => p.pincode === trimmed);
  if (existsIdx >= 0) {
    current[existsIdx] = { ...current[existsIdx], ...newItem };
  } else {
    current.unshift(newItem);
  }
  writeLocalPincodes(current);

  return newItem;
}

export async function updatePincodeStatus(id: string, isActive: boolean): Promise<boolean> {
  // 1. Try Supabase
  try {
    await supabaseAdmin
      .from("pincodes")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch {}

  // 2. Local update
  const current = readLocalPincodes();
  const idx = current.findIndex((p) => p.id === id || p.pincode === id);
  if (idx >= 0) {
    current[idx].is_active = isActive;
    current[idx].updated_at = new Date().toISOString();
    writeLocalPincodes(current);
    return true;
  }
  return false;
}

export async function removePincode(id: string): Promise<boolean> {
  // 1. Try Supabase
  try {
    await supabaseAdmin.from("pincodes").delete().eq("id", id);
  } catch {}

  // 2. Local delete
  const current = readLocalPincodes();
  const filtered = current.filter((p) => p.id !== id && p.pincode !== id);
  writeLocalPincodes(filtered);
  return true;
}
