import { NextResponse } from "next/server";
import { getRoastAnalytics } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const analytics = await getRoastAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Roast analytics query failed.", error);
    return NextResponse.json(
      { error: "Roast analytics is unavailable right now." },
      { status: 503 },
    );
  }
}
