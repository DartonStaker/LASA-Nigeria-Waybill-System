import { createClient } from "@supabase/supabase-js";
import { kv } from "@vercel/kv";

import {
  WAYBILL_NUMBER_PAD,
  WAYBILL_NUMBER_PREFIX,
} from "@/lib/constants/company";

const WAYBILL_COUNTER_KEY =
  process.env.WAYBILL_COUNTER_KEY ?? "waybill:number:primary";

const seed = Number(process.env.WAYBILL_SEED ?? 0);
let inMemoryCounter = Number.isNaN(seed) ? 0 : seed;

export function formatWaybillNumber(
  sequence: number,
  prefix: string = WAYBILL_NUMBER_PREFIX,
  pad: number = WAYBILL_NUMBER_PAD,
) {
  const sanitizedSequence = Number.isFinite(sequence) ? sequence : 0;
  return `${prefix}-${sanitizedSequence.toString().padStart(pad, "0")}`;
}

export function fallbackWaybillNumber() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join("");

  return `${WAYBILL_NUMBER_PREFIX}-${stamp}`;
}

export async function getNextWaybillNumber() {
  const prefix = WAYBILL_NUMBER_PREFIX;
  const pad = WAYBILL_NUMBER_PAD;

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const nextValue = await kv.incr(WAYBILL_COUNTER_KEY);
      if (typeof nextValue === "number") {
        return formatWaybillNumber(nextValue, prefix, pad);
      }
    } catch (error) {
      console.error("[waybill-number] KV increment failed", error);
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
        },
      });

      const { data, error } = await supabase.rpc("increment_waybill_counter");

      if (error) {
        throw error;
      }

      if (typeof data === "number") {
        return formatWaybillNumber(data, prefix, pad);
      }
    } catch (error) {
      console.error("[waybill-number] Supabase increment failed", error);
    }
  }

  inMemoryCounter += 1;

  return formatWaybillNumber(inMemoryCounter, prefix, pad);
}

