import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const nextUrl = req.nextUrl;

  nextUrl.searchParams.set("clientIp", ip);

  return NextResponse.rewrite(nextUrl);
}