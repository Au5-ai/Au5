import { NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/shared/config";

export async function GET() {
  return NextResponse.json({
    apiBaseUrl: getServerApiBaseUrl(),
  });
}
