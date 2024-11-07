import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        "x-client-ip": ip,
      }),
    },
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
