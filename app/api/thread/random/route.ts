import { NextRequest, NextResponse, userAgent } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const response = await fetch(`https://freeipapi.com/api/json/${ip}`);
  const data = await response.json();

  const ua = userAgent(request);

  console.log("User IP:", data);

  console.log("ip", ip);
  console.log("headers", request.headers);
  console.log("request", request);
  console.log("ua", ua);

  // Get user or create if doesn't exist
  const user = await prisma.user.upsert({
    where: { ip },
    create: { ip },
    update: {},
  });

  // Get threads this user hasn't voted on
  const votedThreadIds = await prisma.vote.findMany({
    where: { userId: user.id },
    select: { threadId: true },
  });

  // Get random thread
  const thread = await prisma.emailThread.findFirst({
    where: {
      id: { notIn: votedThreadIds.map((v) => v.threadId) },
    },
    include: {
      responses: true,
    },
    orderBy: {
      // Random order
      id: "asc",
    },
    take: 1,
  });

  if (!thread) {
    return NextResponse.json(
      { error: "No more threads available" },
      { status: 404 }
    );
  }

  // Randomly select 2 responses
  const shuffledResponses = thread.responses.sort(() => Math.random() - 0.5);
  const [responseA, responseB] = shuffledResponses.slice(0, 2);

  return NextResponse.json({
    headerIp: ip,
    apiIp: data,
    userId: user.id,
    thread: {
      id: thread.id,
      messages: thread.messages,
    },
    responses: {
      a: {
        id: responseA.id,
        content: responseA.content,
      },
      b: {
        id: responseB.id,
        content: responseB.content,
      },
    },
  });
}
