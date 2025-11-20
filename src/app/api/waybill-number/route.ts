import { NextResponse } from "next/server";

import {
  fallbackWaybillNumber,
  getNextWaybillNumber,
} from "@/lib/numbering";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const waybillNumber = await getNextWaybillNumber();
    return NextResponse.json({ waybillNumber });
  } catch (error) {
    console.error("[waybill-number] Falling back to timestamp number", error);
    return NextResponse.json({
      waybillNumber: fallbackWaybillNumber(),
      warning:
        "Using fallback waybill number. Configure Vercel KV or Supabase for persistence.",
    });
  }
}

